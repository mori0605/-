import React from 'react';
import {useT, ramp, lerp} from '../anim';
import {color, font, num} from '../theme';

/** 10×10 grid of students; highlighted share animates between states. */
export const Waffle: React.FC<{
  x: number; y: number; cell?: number; states: {at: number; pct: number}[]; col?: string; label?: React.ReactNode; appear: number;
  caption?: (pct: number) => string;
}> = ({x, y, cell = 42, states, col = color.vermilion, label, appear, caption}) => {
  const t = useT();
  let pct = 0;
  let prev = 0;
  for (const s of states) {
    pct = lerp(prev, s.pct, ramp(t, s.at, 0.9));
    prev = pct;
  }
  const on = Math.round(pct);
  const gap = cell * 0.28;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: ramp(t, appear, 0.5)}}>
      {label && <div style={{fontFamily: font.sans, fontSize: 28, fontWeight: 500, color: color.inkSoft, marginBottom: 18}}>{label}</div>}
      <svg width={10 * cell + 9 * gap} height={10 * cell + 9 * gap}>
        {Array.from({length: 100}).map((_, i) => {
          const r = Math.floor(i / 10), c = i % 10;
          const idx = (9 - r) * 10 + c; // fill from bottom row upward
          const lit = idx < on;
          return <circle key={i} cx={c * (cell + gap) + cell / 2} cy={r * (cell + gap) + cell / 2} r={cell / 2}
            fill={lit ? col : 'none'} stroke={lit ? col : color.inkFaint} strokeWidth={2} />;
        })}
      </svg>
      {caption && <div style={{fontFamily: font.serif, fontSize: 64, fontWeight: 600, color: col, marginTop: 16, ...num}}>{caption(pct)}</div>}
    </div>
  );
};
