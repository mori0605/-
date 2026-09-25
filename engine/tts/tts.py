"""Narration pipeline: script -> per-paragraph TTS -> word-level alignment -> timeline.

Usage:
    python3 engine/tts/tts.py episodes/01-finland

Backends are swappable (CLAUDE.md §3). Implemented: Kokoro (local, open source).
Alignment uses an offline ASR model (sherpa-onnx zipformer) and maps recognised
words back onto the known script text; whisper models were not reachable from the
build environment, so this plays the same forced-alignment role.
"""
import difflib
import json
import os
import re
import sys

import numpy as np
import soundfile as sf

sys.path.insert(0, os.path.dirname(__file__))
from spoken import to_spoken  # noqa: E402

MODELS = os.environ.get("TTS_MODELS", "/home/user/models")
VOICE = os.environ.get("TTS_VOICE", "bf_emma")     # channel voice: fixed
LANG = "en-gb"
SPEED = 0.96
SR_OUT = 24000

SENTENCE_GAP = 0.28
PARAGRAPH_GAP = 0.65
SECTION_GAP = 2.6
NUMBER_GAP = 0.12     # extra pause before a sentence that opens with a number


class KokoroBackend:
    def __init__(self):
        from kokoro_onnx import Kokoro
        self.k = Kokoro(f"{MODELS}/kokoro-v1.0.onnx", f"{MODELS}/voices-v1.0.bin")

    def synth(self, text):
        audio, sr = self.k.create(text, voice=VOICE, speed=SPEED, lang=LANG)
        assert sr == SR_OUT
        return audio.astype(np.float32)


class Aligner:
    def __init__(self):
        import sherpa_onnx
        d = f"{MODELS}/sherpa-onnx-zipformer-en-2023-06-26/"
        self.r = sherpa_onnx.OfflineRecognizer.from_transducer(
            encoder=d + "encoder-epoch-99-avg-1.int8.onnx",
            decoder=d + "decoder-epoch-99-avg-1.int8.onnx",
            joiner=d + "joiner-epoch-99-avg-1.int8.onnx",
            tokens=d + "tokens.txt", num_threads=4)

    def words(self, audio):
        """Return [(WORD, start_sec)] recognised in 24 kHz audio."""
        from scipy.signal import resample_poly
        a = resample_poly(audio, 2, 3).astype(np.float32)
        s = self.r.create_stream()
        s.accept_waveform(16000, a)
        self.r.decode_stream(s)
        out = []
        for tok, t in zip(s.result.tokens, s.result.timestamps):
            if tok.startswith(" ") or not out:
                out.append([tok.strip(), t])
            else:
                out[-1][0] += tok
        return [(w, t) for w, t in out]


def norm_words(spoken):
    return [w for w in re.sub(r"[^A-Za-z0-9' ]", " ", spoken.replace("-", " ")).upper().split()]


def align_sentence(pairs, asr_words, duration):
    """Assign a start time to each written token of one sentence."""
    spoken_idx = []           # for each spoken normalised word: written token index
    spoken = []
    for i, (_, sp) in enumerate(pairs):
        for w in norm_words(sp):
            spoken.append(w)
            spoken_idx.append(i)
    times = [None] * len(spoken)
    sm = difflib.SequenceMatcher(a=spoken, b=[w for w, _ in asr_words], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = asr_words[b + k][1]
    # first word starts at the first recognised word (or 0)
    if times and times[0] is None:
        times[0] = asr_words[0][1] if asr_words else 0.0
    # interpolate gaps linearly
    known = [(i, t) for i, t in enumerate(times) if t is not None]
    known.append((len(times), duration))
    for (i0, t0), (i1, t1) in zip(known, known[1:]):
        for j in range(i0 + 1, i1):
            times[j] = t0 + (t1 - t0) * (j - i0) / (i1 - i0)
    # enforce monotonic
    for j in range(1, len(times)):
        times[j] = max(times[j], times[j - 1])
    starts = {}
    for j, i in enumerate(spoken_idx):
        starts.setdefault(i, times[j])
    matched = sum(1 for _ in sm.get_matching_blocks() for _ in range(_.size))
    return [starts.get(i, 0.0) for i in range(len(pairs))], matched / max(1, len(spoken))


def parse_script(path):
    """Return list of dicts {id, section, text}."""
    section = None
    out = []
    for line in open(path, encoding="utf-8"):
        if line.startswith("## "):
            section = line[3:].strip()
        m = re.match(r"\*\*(P\w+)\*\* (.+)", line)
        if m:
            out.append({"id": m.group(1), "section": section, "text": m.group(2).strip()})
    return out


def split_sentences(text):
    parts = re.split(r"(?<=[.?!…])\s+(?=[A-Z0-9\"“])", text)
    return [p for p in parts if p.strip()]


def main(ep_dir):
    paras = parse_script(f"{ep_dir}/script/script_en.md")
    audio_dir = f"{ep_dir}/audio"
    os.makedirs(f"{audio_dir}/paragraphs", exist_ok=True)
    tts, aligner = KokoroBackend(), Aligner()
    timeline, chunks, t = [], [], 0.0
    prev_section = None
    scores = []
    for p in paras:
        gap = 0.4 if prev_section is None else (SECTION_GAP if p["section"] != prev_section else PARAGRAPH_GAP)
        prev_section = p["section"]
        chunks.append(np.zeros(int(gap * SR_OUT), np.float32))
        t += gap
        p_start = t
        words = []
        sentences = split_sentences(p["text"])
        for si, sent in enumerate(sentences):
            if si:
                g = SENTENCE_GAP + (NUMBER_GAP if re.match(r"^\d", sent) else 0)
                chunks.append(np.zeros(int(g * SR_OUT), np.float32))
                t += g
            spoken, pairs = to_spoken(sent)
            audio = tts.synth(spoken)
            dur = len(audio) / SR_OUT
            starts, score = align_sentence(pairs, aligner.words(audio), dur)
            scores.append(score)
            for (w, _), st, en in zip(pairs, starts, starts[1:] + [dur]):
                words.append({"w": w, "s": round(t + st, 3), "e": round(t + min(en, dur), 3)})
            chunks.append(audio)
            t += dur
        timeline.append({"id": p["id"], "section": p["section"], "start": round(p_start, 3),
                         "end": round(t, 3), "words": words})
        print(f"{p['id']:5s} {p_start:7.2f}-{t:7.2f}s", flush=True)
    chunks.append(np.zeros(int(1.5 * SR_OUT), np.float32))
    full = np.concatenate(chunks)
    full = full / max(1e-6, np.abs(full).max()) * 0.89
    sf.write(f"{audio_dir}/narration.wav", full, SR_OUT)
    json.dump({"voice": VOICE, "duration": round(len(full) / SR_OUT, 3), "paragraphs": timeline},
              open(f"{audio_dir}/timeline.json", "w"), indent=1)
    print(f"total {len(full)/SR_OUT/60:.2f} min, mean alignment match {np.mean(scores):.3f}")


if __name__ == "__main__":
    main(sys.argv[1])
