"""One-command pipeline.

  python3 tools/pipeline.py sample  [--bgm auto|none|path/to/music.wav]
  python3 tools/pipeline.py episode [--bgm auto|none|path/to/music.wav] [--skip-tts]

Steps: narration (Kokoro TTS + word alignment) -> data module -> BGM -> Remotion render -> loudness + no-BGM copy.
Outputs go to episodes/01-finland/out/.
"""
import argparse
import os
import shutil
import subprocess
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
EP = os.path.join(ROOT, "episodes", "01-finland")
SAMPLE_PARAS = "P02,P03,P04"


def run(*cmd, env=None):
    print("$", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True, cwd=ROOT, env={**os.environ, **(env or {})})


def fit_music(src, narration, out):
    """Use a user-supplied music file: loop/trim to length, sit 19 dB under the voice, fade in/out."""
    m, msr = sf.read(src, dtype="float32", always_2d=True)
    n, nsr = sf.read(narration, dtype="float32")
    need = int(len(n) / nsr * msr)
    reps = int(np.ceil(need / len(m)))
    m = np.tile(m, (reps, 1))[:need]
    f = n[: len(n) // (nsr // 10) * (nsr // 10)].reshape(-1, nsr // 10)
    r = np.sqrt((f ** 2).mean(1))
    speech = np.sqrt((r[r > 0.02] ** 2).mean())
    m *= speech * 10 ** (-19 / 20) / (np.sqrt((m ** 2).mean()) + 1e-9)
    t = np.arange(len(m)) / msr
    m *= (np.clip(t / 1.5, 0, 1) * np.clip((t[-1] - t) / 2.5, 0, 1))[:, None]
    sf.write(out, m, msr)


def bgm_step(mode, narration, out):
    if mode == "auto":
        run(sys.executable, "tools/make_music.py", narration, out)
    elif mode == "none":
        n, nsr = sf.read(narration, dtype="float32")
        sf.write(out, np.zeros_like(n), nsr)
    else:
        fit_music(mode, narration, out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("what", choices=["sample", "episode"])
    ap.add_argument("--bgm", default="auto")
    ap.add_argument("--skip-tts", action="store_true")
    a = ap.parse_args()
    audio = os.path.join(EP, "audio")
    os.makedirs(os.path.join(EP, "out"), exist_ok=True)
    run(sys.executable, "tools/build_data.py", EP)
    if a.what == "sample":
        if not a.skip_tts:
            run(sys.executable, "engine/tts/tts.py", EP, "--only", SAMPLE_PARAS, "--out", os.path.join(EP, "audio_sample"))
        shutil.copy(os.path.join(EP, "audio_sample", "narration.wav"), os.path.join(audio, "narration_sample.wav"))
        narr = os.path.join(audio, "narration_sample.wav")
        bgm_step(a.bgm, narr, os.path.join(audio, "bgm_sample.wav"))
        comp, raw, base = "Sample", os.path.join(EP, "out", "sample_raw.mp4"), os.path.join(EP, "out", "sample")
    else:
        if not a.skip_tts:
            run(sys.executable, "engine/tts/tts.py", EP)
        narr = os.path.join(audio, "narration.wav")
        bgm_step(a.bgm, narr, os.path.join(audio, "bgm.wav"))
        run(sys.executable, "tools/make_srt.py", EP, os.path.join(EP, "out", "episode01_finland.srt"))
        comp, raw, base = "Episode", os.path.join(EP, "out", "episode_raw.mp4"), os.path.join(EP, "out", "episode01_finland")
    run("node", "tools/render.mjs", EP, "video", raw, env={"COMP": comp})
    run(sys.executable, "tools/finalize.py", raw, narr, base)
    os.remove(raw)


if __name__ == "__main__":
    main()
