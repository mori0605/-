import React from 'react';
import {useT, ramp, fmt} from '../anim';
import {color, font, num} from '../theme';

export type Bar = {label: string; value: number; col?: string; at: number; note?: string; noteAt?: number; valueText?: string};

/** Horizontal bars that grow from the axis (BarRank / comparisons). */
export const HBars: React.FC<{x: number; y: number; width: number; bars: Bar[]; max: number; min?: number; rowH?: number; barH?: number;
  labelW?: number; suffix?: string; title?: string; titleAt?: number; refLine?: {value: number; label: string; at: number}}> =
  ({x, y, width, bars, max, min = 0, rowH = 110, barH = 56, labelW = 330, suffix = '', title, titleAt = 0, refLine}) => {
  const t = useT();
  const sx = (v: number) => ((v - min) / (max - min)) * width;
  return (
    <div style={{position: 'absolute', left: x, top: y}}>
      {title && <div style={{fontFamily: font.sans, fontSize: 60, fontWeight: 900, color: color.ink, marginBottom: 34, opacity: ramp(t, titleAt, 0.5)}}>{title}</div>}
      <div style={{position: 'relative'}}>
        {bars.map((b, i) => {
          const p = ramp(t, b.at, 0.9);
          return (
            <div key={i} style={{position: 'relative', height: rowH, opacity: ramp(t, b.at - 0.1, 0.4)}}>
              <div style={{position: 'absolute', left: 0, width: labelW - 24, top: (rowH - barH) / 2, height: barH, display: 'flex', alignItems: 'center',
                justifyContent: 'flex-end', fontFamily: font.sans, fontSize: 42, fontWeight: 800, color: color.ink, textAlign: 'right'}}>{b.label}</div>
              <div style={{position: 'absolute', left: labelW, top: (rowH - barH) / 2, height: barH, width: sx(b.value) * p, background: b.col ?? color.indigo, borderRadius: 3}} />
              <div style={{position: 'absolute', left: labelW + sx(b.value) * p + 18, top: (rowH - barH) / 2, height: barH, display: 'flex', alignItems: 'center',
                fontFamily: font.sans, fontSize: 48, fontWeight: 900, color: b.col ?? color.indigo, whiteSpace: 'nowrap', ...num}}>
                {b.valueText ?? fmt(b.value * p) + suffix}
                {b.note && <span style={{color: color.inkSoft, marginLeft: 18, fontSize: 36, fontWeight: 800, opacity: b.noteAt === undefined ? 1 : ramp(t, b.noteAt, 0.5)}}>{b.note}</span>}
              </div>
            </div>
          );
        })}
        {refLine && (
          <div style={{position: 'absolute', left: labelW + sx(refLine.value), top: -10, height: bars.length * rowH + 20, borderLeft: `3px dashed ${color.inkSoft}`, opacity: ramp(t, refLine.at, 0.5)}}>
            <div style={{position: 'absolute', top: -40, left: -200, width: 400, textAlign: 'center', fontFamily: font.sans, fontSize: 24, color: color.inkSoft}}>{refLine.label}</div>
          </div>
        )}
      </div>
    </div>
  );
};
