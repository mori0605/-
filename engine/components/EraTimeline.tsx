import React from 'react';
import {useT, ramp, fade} from '../anim';
import {color, font, num} from '../theme';

/** Horizontal year axis with eras (bands) and events (markers). */
export const EraTimeline: React.FC<{
  x: number; y: number; w: number; range: [number, number]; ticks: number[]; appear: number;
  bands?: {from: number; to: number; label: string; at: number; col: string}[];
  markers?: {year: number; label: string; at: number; col?: string; above?: boolean; level?: number}[];
}> = ({x, y, w, range, ticks, appear, bands = [], markers = []}) => {
  const t = useT();
  const sx = (v: number) => ((v - range[0]) / (range[1] - range[0])) * w;
  return (
    <svg style={{position: 'absolute', left: x, top: y - 300, overflow: 'visible'}} width={w} height={600}>
      <g transform="translate(0,300)">
        {bands.map((b, i) => (
          <g key={i} opacity={ramp(t, b.at, 0.6)}>
            <rect x={sx(b.from)} y={-30} width={(sx(b.to) - sx(b.from)) * ramp(t, b.at, 0.9)} height={60} fill={b.col} opacity={0.25} rx={6} />
            <text x={sx(b.from) + 12} y={84} fontFamily={font.sans} fontSize={36} fontWeight={800} fill={b.col}>{b.label}</text>
          </g>
        ))}
        <line x1={0} x2={w * ramp(t, appear, 1)} y1={0} y2={0} stroke={color.ink} strokeWidth={5} />
        {ticks.map((v) => (
          <g key={v} opacity={ramp(t, appear + 0.3, 0.5)}>
            <line x1={sx(v)} x2={sx(v)} y1={-8} y2={8} stroke={color.ink} strokeWidth={2} />
            <text x={sx(v)} y={150} textAnchor="middle" fontFamily={font.sans} fontSize={40} fontWeight={800} fill={color.ink} style={num}>{v}</text>
          </g>
        ))}
        {markers.map((m, i) => {
          const lv = m.level ?? 0;
          const up = m.above !== false;
          const len = 110 + lv * 90;
          return (
            <g key={i} opacity={fade(t, m.at)}>
              <line x1={sx(m.year)} x2={sx(m.year)} y1={0} y2={up ? -len : len} stroke={m.col ?? color.vermilion} strokeWidth={5} />
              <circle cx={sx(m.year)} cy={0} r={16} fill={m.col ?? color.vermilion} />
              <text x={sx(m.year)} y={up ? -len - 20 : len + 50} textAnchor="middle" fontFamily={font.sans} fontSize={46} fontWeight={900} fill={m.col ?? color.vermilion}>{m.label}</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
