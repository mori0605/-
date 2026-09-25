"""Compose an original background score in code (no third-party audio).

Mood: investigative, restrained, slightly tense documentary underscore.
D minor, 92 BPM. Layers: pad, low pulse, soft kick, clock-like ticks, sparse piano motif.
The mix is ducked under the narration (sidechain from the narration envelope) and sits
well below the voice (CLAUDE.md §8: at least 18 dB below).

Usage: python3 tools/make_music.py <narration.wav> <out.wav> [--intro-bars 2]
"""
import argparse

import numpy as np
import soundfile as sf
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 48000
BPM = 92
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# chord per bar (root midi, chord tones as midi); D minor colour with a lift and a tense turn
PROG = [
    (38, [62, 65, 69]),  # Dm
    (34, [62, 65, 70]),  # Bb
    (41, [60, 65, 69]),  # F
    (36, [60, 64, 67]),  # C
    (38, [62, 65, 69]),  # Dm
    (43, [62, 67, 70]),  # Gm
    (34, [62, 65, 70]),  # Bb
    (33, [61, 64, 69]),  # A (dominant: tension)
]


def lp(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), 'low', output='sos')
    return sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), 'high', output='sos')
    return sosfilt(sos, x)


def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a * sr), int(d * sr), int(r * sr)
    e = np.ones(n) * s
    e[:a] = np.linspace(0, 1, a, endpoint=False) if a else 1
    e[a:a + d] = np.linspace(1, s, max(1, min(d, n - a)))[:max(0, min(d, n - a))]
    if r:
        e[-r:] *= np.linspace(1, 0, r)
    return e


def piano(f, dur, vel):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    B = 0.00035
    for k in range(1, 9):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        y += (1 / k ** 1.3) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6)) * np.exp(-t * (1.2 + 0.9 * k))
    y *= np.minimum(1, t / 0.004)
    hammer = hp(rng.standard_normal(n) * np.exp(-t * 90), 2000) * 0.05
    return (y + hammer) * vel


def pad(freqs, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.0, 0.005):
            ph = rng.uniform(0, 6)
            for k in range(1, 10):
                y += (1 / k) * np.sin(2 * np.pi * f * (1 + det) * k * t + ph * k) * 0.12
    y = lp(y, 1100)
    return y * env_adsr(n, 1.2, 0.5, 0.85, 1.2)


def bass(f, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.15 * np.sign(np.sin(2 * np.pi * f * t))
    y = lp(y, 420) * np.exp(-t * 7) * np.minimum(1, t / 0.006)
    return y


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 42 + 68 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 11) * np.minimum(1, t / 0.002)


def tick():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 6500) * np.exp(-t * 120)


def place(buf, x, start):
    i = int(start * SR)
    if i >= len(buf):
        return
    m = min(len(x), len(buf) - i)
    buf[i:i + m] += x[:m]


def compose(dur, intro_bars=2):
    n = int((dur + 4) * SR)
    L = {k: np.zeros(n) for k in ('pad', 'bass', 'kick', 'tick', 'piano')}
    nbars = int(np.ceil(dur / BAR)) + 1
    motif = [0, 2, 1, 2, 0, 1, 2, 1]  # chord-tone indices, one per beat-pair
    for b in range(nbars):
        t0 = b * BAR
        root, tones = PROG[b % len(PROG)]
        place(L['pad'], pad([midi(x - 12) for x in tones], BAR + 1.2), t0)
        if b >= intro_bars // 2:
            for e in range(8):  # eighth-note pulse
                place(L['bass'], bass(midi(root), BEAT / 2) * (1.0 if e % 2 == 0 else 0.6), t0 + e * BEAT / 2)
        if b >= intro_bars:
            for q in (0, 2):
                place(L['kick'], kick(), t0 + q * BEAT)
            for s in range(16):
                if s % 2 == 1:
                    place(L['tick'], tick() * (0.9 if s % 4 == 3 else 0.5), t0 + s * BEAT / 4)
            # sparse piano: two notes per bar, occasional third; octave up on even bars
            for j, beat in enumerate((0, 1.5, 3)):
                if j == 2 and b % 2:
                    continue
                note = tones[motif[(b * 3 + j) % len(motif)]] + (12 if b % 4 == 2 else 0)
                place(L['piano'], piano(midi(note), 2.8, 0.55 + 0.25 * rng.random()), t0 + beat * BEAT)
    mix = (0.55 * L['pad'] / (np.abs(L['pad']).max() + 1e-9) + 0.5 * L['bass'] / (np.abs(L['bass']).max() + 1e-9)
           + 0.32 * L['kick'] + 0.05 * L['tick'] + 0.6 * L['piano'] / (np.abs(L['piano']).max() + 1e-9))
    # stereo reverb (two decorrelated noise IRs)
    ir_n = int(2.2 * SR)
    t = np.arange(ir_n) / SR
    out = []
    for ch in range(2):
        ir = rng.standard_normal(ir_n) * np.exp(-t * 3.2)
        ir = lp(ir, 5000)
        wet = fftconvolve(mix, ir)[:n]
        wet /= np.abs(wet).max() + 1e-9
        out.append(0.72 * mix / (np.abs(mix).max() + 1e-9) + 0.38 * wet)
    y = np.stack(out, 1)[: int(dur * SR)]
    fade_in = np.clip(np.arange(len(y)) / SR / 1.0, 0, 1)
    fade_out = np.clip((dur - np.arange(len(y)) / SR) / 2.0, 0, 1)
    return y * (fade_in * fade_out)[:, None]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('narration')
    ap.add_argument('out')
    ap.add_argument('--intro-bars', type=int, default=2)
    ap.add_argument('--below-db', type=float, default=19.0, help='music RMS below speech RMS')
    a = ap.parse_args()
    nar, nsr = sf.read(a.narration, dtype='float32')
    if nar.ndim > 1:
        nar = nar.mean(1)
    dur = len(nar) / nsr
    y = compose(dur, a.intro_bars)
    # narration envelope at SR for ducking
    tn = np.arange(len(y)) / SR
    nar_rs = np.interp(tn, np.arange(len(nar)) / nsr, np.abs(nar))
    envn = lfilter([1 - np.exp(-1 / (0.12 * SR))], [1, -np.exp(-1 / (0.12 * SR))], nar_rs)
    speaking = np.clip(envn / (np.percentile(envn, 90) + 1e-9), 0, 1)
    duck = 1 - 0.35 * speaking  # about −4 dB while the voice is on
    y *= duck[:, None]
    f = nar[: len(nar) // (nsr // 10) * (nsr // 10)].reshape(-1, nsr // 10)
    r = np.sqrt((f ** 2).mean(1))
    speech = np.sqrt((r[r > 0.02] ** 2).mean())
    music = np.sqrt((y ** 2).mean())
    y *= speech * 10 ** (-a.below_db / 20) / music
    sf.write(a.out, y.astype(np.float32), SR)
    print(f'{dur:.1f}s  speech {20*np.log10(speech):.1f} dBFS  music {20*np.log10(np.sqrt((y**2).mean())):.1f} dBFS')


if __name__ == '__main__':
    main()
