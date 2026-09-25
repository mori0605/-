"""Synthesize a quiet ambient pad as background music (original, generated in code).

No third-party music was reachable from the build environment, so the BGM is
generated here: slow sine-pad chords with long attacks, mixed well below the
narration (target: at least 18 dB below narration loudness, CLAUDE.md §8).

Usage: python3 tools/make_bgm.py episodes/01-finland
"""
import json
import sys

import numpy as np
import soundfile as sf

SR = 24000
ep = sys.argv[1]
dur = json.load(open(f"{ep}/audio/timeline.json"))["duration"]
n = int(dur * SR)
t = np.arange(n) / SR

# D minor-ish progression, 16 s per chord, voiced low and soft
chords = [[146.83, 220.00, 293.66, 349.23],   # Dm
          [116.54, 174.61, 233.08, 293.66],   # Bb
          [130.81, 196.00, 261.63, 329.63],   # C
          [110.00, 164.81, 220.00, 261.63]]   # Am
seg = 16.0
out = np.zeros(n, np.float32)
rng = np.random.default_rng(1)
for k in range(int(dur // seg) + 2):
    ch = chords[k % len(chords)]
    s0 = k * seg - 4.0  # overlap for crossfade
    idx0, idx1 = max(0, int(s0 * SR)), min(n, int((s0 + seg + 8) * SR))
    if idx0 >= n:
        break
    tt = t[idx0:idx1] - s0
    env = np.clip(tt / 6.0, 0, 1) * np.clip((seg + 8 - tt) / 6.0, 0, 1)
    env = env * env * (3 - 2 * env)
    for f in ch:
        det = 1 + rng.uniform(-0.002, 0.002)
        v = np.sin(2 * np.pi * f * det * tt) + 0.3 * np.sin(2 * np.pi * f * 2.001 * tt)
        trem = 0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * tt + rng.uniform(0, 6))
        out[idx0:idx1] += (v * env * trem).astype(np.float32)

# gentle one-pole low-pass for warmth
a = np.exp(-2 * np.pi * 1200 / SR)
y = np.empty_like(out)
acc = 0.0
for i in range(0, n, 1):
    acc = (1 - a) * out[i] + a * acc
    y[i] = acc
out = y

# level: measure narration RMS (speech portions) and sit 22 dB under it
nar, _ = sf.read(f"{ep}/audio/narration.wav", dtype="float32")
frames = nar[: len(nar) // 2400 * 2400].reshape(-1, 2400)
rms = np.sqrt((frames ** 2).mean(1))
speech_rms = np.sqrt((rms[rms > 0.02] ** 2).mean())
target = speech_rms * 10 ** (-22 / 20)
out = out / np.sqrt((out ** 2).mean()) * target
fade = np.clip(t / 4.0, 0, 1) * np.clip((dur - t) / 5.0, 0, 1)
out *= fade
sf.write(f"{ep}/audio/bgm.wav", out.astype(np.float32), SR)
print(f"bgm {dur:.1f}s, narration speech RMS {20*np.log10(speech_rms):.1f} dBFS, bgm RMS {20*np.log10(target):.1f} dBFS")
