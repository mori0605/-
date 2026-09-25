import React from 'react';
import {useT, ramp} from '../anim';
import {color, font} from '../theme';

/**
 * Grid of large statement cards that accumulate in ONE region (the focal area),
 * each popping in on its cue. Optional `dimAt` fades cards back when the story moves on.
 */
export const CardGrid: React.FC<{
  items: {text: React.ReactNode; at: number; col?: string; icon?: React.ReactNode}[];
  x: number; y: number; w: number; cols?: number; rowH?: number; gap?: number; size?: number; dimAt?: number; dimTo?: number;
  frameAt?: number; frameCol?: string;
}> = ({items, x, y, w, cols = 2, rowH = 200, gap = 36, size = 58, dimAt, dimTo = 0.3, frameAt, frameCol = color.vermilion}) => {
  const t = useT();
  const cw = (w - gap * (cols - 1)) / cols;
  const rows = Math.ceil(items.length / cols);
  const dim = dimAt === undefined ? 1 : 1 - (1 - dimTo) * ramp(t, dimAt, 0.5);
  return (
    <>
      {items.map((it, i) => {
        const p = ramp(t, it.at, 0.45);
        const cx = x + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (rowH + gap);
        return (
          <div key={i} style={{position: 'absolute', left: cx, top: cy, width: cw, height: rowH, boxSizing: 'border-box', padding: '0 40px',
            display: 'flex', alignItems: 'center', gap: 28, borderRadius: 18, background: '#FBF8F1', border: `5px solid ${it.col ?? color.ink}`,
            boxShadow: '0 10px 30px rgba(27,27,27,0.08)', opacity: p * dim, transform: `translateY(${(1 - p) * 30}px) scale(${0.94 + 0.06 * p})`}}>
            {it.icon}
            <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: size, lineHeight: 1.08, color: it.col ?? color.ink}}>{it.text}</div>
          </div>
        );
      })}
      {frameAt !== undefined && (
        <div style={{position: 'absolute', left: x - 26, top: y - 26, width: w + 52, height: rows * rowH + (rows - 1) * gap + 52, borderRadius: 26,
          border: `7px solid ${frameCol}`, opacity: ramp(t, frameAt, 0.4), transform: `scale(${1.04 - 0.04 * ramp(t, frameAt, 0.5)})`}} />
      )}
    </>
  );
};

/** Verdict stamp: the one strong conclusion of a suspect scene. */
export const Stamp: React.FC<{mark: '✗' | '△' | '○' | '—'; text: string; at: number; x: number; y: number; col?: string; size?: number}> =
  ({mark, text, at, x, y, col, size = 84}) => {
  const t = useT();
  const p = ramp(t, at, 0.35);
  const c = col ?? (mark === '✗' ? color.vermilion : mark === '○' ? color.indigo : mark === '△' ? color.ochre : color.inkSoft);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${1.35 - 0.35 * p}) rotate(${-4 * p}deg)`, opacity: p,
      display: 'flex', alignItems: 'center', gap: 26, padding: '22px 46px', border: `9px solid ${c}`, borderRadius: 22, background: 'rgba(251,248,241,0.92)',
      whiteSpace: 'nowrap'}}>
      <span style={{fontFamily: font.sans, fontWeight: 900, fontSize: size * 1.1, color: c, lineHeight: 1}}>{mark}</span>
      <span style={{fontFamily: font.sans, fontWeight: 900, fontSize: size, color: c, lineHeight: 1}}>{text}</span>
    </div>
  );
};

/** Big single focal statement (not a caption): used sparingly for the key line of a scene. */
export const Focal: React.FC<{text: React.ReactNode; at: number; out?: number; y?: number; size?: number; col?: string; dark?: boolean; serif?: boolean}> =
  ({text, at, out, y = 560, size = 110, col, dark, serif}) => {
  const t = useT();
  const o = ramp(t, at, 0.5) * (out === undefined ? 1 : 1 - ramp(t, out, 0.4));
  return (
    <div style={{position: 'absolute', left: 140, right: 140, top: y, transform: `translateY(-50%) translateY(${(1 - ramp(t, at, 0.6)) * 24}px)`,
      textAlign: 'center', opacity: o, fontFamily: serif ? font.serif : font.sans, fontWeight: serif ? 400 : 900, fontSize: size, lineHeight: 1.08,
      color: col ?? (dark ? color.nightText : color.ink)}}>{text}</div>
  );
};
