// ============================================================
//  Util: DOM ヘルパー・待機・効果音
// ============================================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
const fmt = n => Math.max(0, Math.round(n)).toLocaleString();
const rint = n => Math.floor(Math.random() * n);
const pick = arr => arr[rint(arr.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const gameSpeed = () => (window.Save && Save.data && Save.data.settings.speed) || 1;
// バトル速度設定を反映した待機
const wait = ms => new Promise(r => setTimeout(r, ms / gameSpeed()));
const sleepRaw = ms => new Promise(r => setTimeout(r, ms));
const stars = n => '★'.repeat(n);

function toast(text, ms = 1600) {
  const t = el('div', 'toast', text);
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

// ---------- 効果音 (WebAudio で合成) ----------
const Sfx = (() => {
  let ctx = null;
  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const on = () => !window.Save || !Save.data || Save.data.settings.sound !== false;
  function tone(freq, dur, type = 'sine', vol = 0.12, slide = 0, delay = 0) {
    if (!on()) return;
    const a = ac(); if (!a) return;
    const t0 = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(dur, vol = 0.15, lp = 1800, delay = 0) {
    if (!on()) return;
    const a = ac(); if (!a) return;
    const t0 = a.currentTime + delay;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp;
    const g = a.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(a.destination);
    s.start(t0);
  }
  return {
    unlock: ac,
    tap: () => tone(660, 0.06, 'triangle', 0.08),
    pop: n => { tone(520 + Math.min(n, 14) * 45, 0.12, 'sine', 0.13, 1.6); if (n >= 7) tone(1046, 0.25, 'triangle', 0.1, 1, 0.08); },
    heal: () => { tone(784, 0.14, 'sine', 0.1); tone(988, 0.14, 'sine', 0.1, 1, 0.09); tone(1318, 0.2, 'sine', 0.1, 1, 0.18); },
    hit: (big) => { noise(big ? 0.35 : 0.14, big ? 0.28 : 0.16, big ? 900 : 2200); tone(big ? 110 : 180, big ? 0.3 : 0.1, 'square', 0.06, 0.5); },
    boom: () => { noise(0.6, 0.3, 700); tone(80, 0.5, 'sawtooth', 0.08, 0.4); },
    special: () => { tone(392, 0.18, 'square', 0.07); tone(523, 0.18, 'square', 0.07, 1, 0.12); tone(784, 0.4, 'square', 0.08, 1, 0.24); },
    enemy: () => { noise(0.3, 0.22, 600); tone(140, 0.3, 'sawtooth', 0.08, 0.6); },
    deny: () => tone(180, 0.15, 'square', 0.06),
    ok: () => { tone(880, 0.08, 'triangle', 0.08); tone(1320, 0.12, 'triangle', 0.08, 1, 0.07); },
    win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, 1, i * 0.12)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.4, 'sine', 0.1, 1, i * 0.2)),
    gacha: (r) => {
      if (r >= 5) [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, 0.35, 'triangle', 0.09, 1, i * 0.07));
      else if (r === 4) [523, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.09, 1, i * 0.08));
      else tone(660, 0.15, 'triangle', 0.08);
    },
    charge: () => tone(300, 0.6, 'sawtooth', 0.05, 3),
  };
})();
