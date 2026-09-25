import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT, ramp, lerp, fmt} from '../anim';
import {color, font, num} from '../theme';

export type CamKey = {t: number; x?: number; y?: number; k?: number; dur?: number};

/**
 * Virtual camera for Paper scenes: pans/zooms between keyframes (screen-space focus point + zoom).
 * Each keyframe eases in over `dur` seconds, so every narration beat can move the frame a little.
 */
export const Camera: React.FC<{keys: CamKey[]; children: React.ReactNode; breathe?: number}> = ({keys, children, breathe = 0.012}) => {
  const t = useT();
  let x = keys[0].x ?? 960, y = keys[0].y ?? 540, k = keys[0].k ?? 1;
  for (let i = 1; i < keys.length; i++) {
    const kf = keys[i];
    const p = ramp(t, kf.t, kf.dur ?? 1.2);
    x = lerp(x, kf.x ?? x, p);
    y = lerp(y, kf.y ?? y, p);
    k = lerp(k, kf.k ?? k, p);
  }
  const b = 1 + breathe * Math.sin(t * 0.6); // subtle constant life
  return (
    <AbsoluteFill style={{transform: `translate(960px,540px) scale(${k * b}) translate(${-x}px,${-y}px)`, transformOrigin: '0 0'}}>
      {children}
    </AbsoluteFill>
  );
};

/** Hand-drawn-style circle marker that strokes itself around a point. */
export const CircleMarker: React.FC<{x: number; y: number; r: number; at: number; col?: string; width?: number; out?: number}> =
  ({x, y, r, at, col = color.vermilion, width = 6, out}) => {
  const t = useT();
  const p = ramp(t, at, 0.7);
  const o = out === undefined ? 1 : 1 - ramp(t, out, 0.4);
  const c = 2 * Math.PI * r;
  return (
    <svg style={{position: 'absolute', left: x - r - 20, top: y - r - 20, overflow: 'visible', opacity: o}} width={2 * r + 40} height={2 * r + 40}>
      <circle cx={r + 20} cy={r + 20} r={r} fill="none" stroke={col} strokeWidth={width} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-100 ${r + 20} ${r + 20})`} />
    </svg>
  );
};

/** A number that ticks from state to state at each cue (e.g. a running “−N points” counter). */
export const Ticker: React.FC<{states: {at: number; value: number}[]; x: number; y: number; size?: number; col?: string;
  prefix?: string; suffix?: string; label?: string; appear: number; align?: 'left' | 'right'; signed?: boolean}> =
  ({states, x, y, size = 150, col = color.vermilion, prefix = '', suffix = '', label, appear, align = 'right', signed}) => {
  const t = useT();
  let v = states[0].value;
  let pop = 0;
  for (let i = 1; i < states.length; i++) {
    const p = ramp(t, states[i].at, 0.6);
    v = lerp(v, states[i].value, p);
    if (t >= states[i].at && t < states[i].at + 0.6) pop = Math.sin((Math.PI * (t - states[i].at)) / 0.6);
  }
  const txt = (signed && v < 0 ? '−' : '') + fmt(Math.abs(Math.round(v)));
  return (
    <div style={{position: 'absolute', [align === 'right' ? 'right' : 'left']: align === 'right' ? 1920 - x : x, top: y, textAlign: align,
      opacity: ramp(t, appear, 0.5)} as React.CSSProperties}>
      {label && <div style={{fontFamily: font.sans, fontWeight: 600, fontSize: 30, letterSpacing: 2, color: color.inkSoft, textTransform: 'uppercase'}}>{label}</div>}
      <div style={{fontFamily: font.serif, fontWeight: 600, fontSize: size, lineHeight: 1, color: col, transform: `scale(${1 + 0.08 * pop})`,
        transformOrigin: align === 'right' ? 'right center' : 'left center', ...num}}>{prefix}{txt}{suffix}</div>
    </div>
  );
};

/** Pill-shaped tag (e.g. “MATHS”) that pops in. */
export const Pill: React.FC<{text: string; at: number; x: number; y: number; col?: string; size?: number; out?: number}> =
  ({text, at, x, y, col = color.ink, size = 34, out}) => {
  const t = useT();
  const p = ramp(t, at, 0.5);
  const o = out === undefined ? p : p * (1 - ramp(t, out, 0.4));
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: 'left center',
      border: `3px solid ${col}`, color: col, borderRadius: 999, padding: `${size * 0.25}px ${size * 0.7}px`, fontFamily: font.sans,
      fontWeight: 600, fontSize: size, letterSpacing: 3, textTransform: 'uppercase'}}>{text}</div>
  );
};

export const FullFade: React.FC<{at: number; dur?: number; col?: string}> = ({at, dur = 0.5, col = color.night}) => {
  const t = useT();
  return <AbsoluteFill style={{backgroundColor: col, opacity: ramp(t, at, dur)}} />;
};

/**
 * The single caption slot: one short line at a time, replaced on each cue (cross-fade + small rise).
 * Keeping all words in one place stops the eye from hunting around the frame.
 */
export const Caption: React.FC<{items: {at: number; text: React.ReactNode}[]; x?: number; y?: number; size?: number; dark?: boolean; out?: number}> =
  ({items, x = 120, y = 96, size = 60, dark, out}) => {
  const t = useT();
  const endFade = out === undefined ? 1 : 1 - ramp(t, out, 0.4);
  return (
    <>
      {items.map((it, i) => {
        const next = items[i + 1]?.at;
        const o = ramp(t, it.at, 0.35) * (next === undefined ? 1 : 1 - ramp(t, next - 0.1, 0.25)) * endFade;
        if (o <= 0.001) return null;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: 1920 - 2 * x, opacity: o,
            transform: `translateY(${(1 - ramp(t, it.at, 0.45)) * 18}px)`, fontFamily: font.sans, fontWeight: 600, fontSize: size,
            lineHeight: 1.15, color: dark ? color.nightText : color.ink}}>{it.text}</div>
        );
      })}
    </>
  );
};
