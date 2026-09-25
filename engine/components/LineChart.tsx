import React from 'react';
import {useT, ramp, fade} from '../anim';
import {color, font, num} from '../theme';

export type Pt = {x: number; y: number; at?: number; label?: string; labelPos?: 'above' | 'below' | 'right' | 'left'; big?: boolean};
export type Series = {
  id: string; label?: string; col: string; points: Pt[]; start?: number; dur?: number; width?: number; dashed?: boolean;
  valueLabels?: 'all' | 'last' | 'none'; labelPos?: 'above' | 'below'; endLabelDy?: number; dim?: {at: number; to: number};
};

/**
 * Line chart whose lines draw themselves. Each point may carry its own reveal time (`at`),
 * so a line can extend exactly when the narrator says the number.
 */
export const LineChart: React.FC<{
  x: number; y: number; w: number; h: number; xDomain: [number, number]; yDomain: [number, number];
  xTicks: number[]; yTicks: number[]; xFormat?: (v: number) => string; appear?: number; series: Series[];
  vlines?: {x: number; label: string; at: number; col?: string; out?: number}[];
  bands?: {x0: number; x1: number; label: string; at: number; col: string; out?: number}[];
  notes?: {x: number; y: number; text: string; at: number; col?: string; dx?: number; dy?: number; out?: number}[];
  yLabel?: string; xLabel?: string;
}> = ({x, y, w, h, xDomain, yDomain, xTicks, yTicks, xFormat = (v) => String(v), appear = 0, series, vlines = [], bands = [], notes = [], yLabel, xLabel}) => {
  const t = useT();
  const sx = (v: number) => ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * w;
  const sy = (v: number) => h - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * h;
  const axisO = ramp(t, appear, 0.6);

  return (
    <svg style={{position: 'absolute', left: x - 120, top: y - 60, overflow: 'visible'}} width={w + 360} height={h + 160}>
      <g transform="translate(120,60)">
        {/* bands */}
        {bands.map((b, i) => (
          <g key={i} opacity={fade(t, b.at, b.out) * 1}>
            <rect x={sx(b.x0)} y={0} width={sx(b.x1) - sx(b.x0)} height={h} fill={b.col} opacity={0.12} />
            <text x={(sx(b.x0) + sx(b.x1)) / 2} y={-18} textAnchor="middle" fontFamily={font.sans} fontSize={22} fontWeight={600} fill={b.col}>{b.label}</text>
          </g>
        ))}
        {/* grid + axes */}
        <g opacity={axisO}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={0} x2={w} y1={sy(v)} y2={sy(v)} stroke={color.inkFaint} strokeWidth={1} strokeDasharray="2 6" />
              <text x={-18} y={sy(v) + 8} textAnchor="end" fontFamily={font.sans} fontSize={22} fill={color.inkSoft} style={num}>{v}</text>
            </g>
          ))}
          <line x1={0} x2={w} y1={h} y2={h} stroke={color.ink} strokeWidth={2} />
          {xTicks.map((v) => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={h} y2={h + 10} stroke={color.ink} strokeWidth={2} />
              <text x={sx(v)} y={h + 42} textAnchor="middle" fontFamily={font.sans} fontSize={24} fill={color.ink} style={num}>{xFormat(v)}</text>
            </g>
          ))}
          {yLabel && <text x={-18} y={-26} textAnchor="end" fontFamily={font.sans} fontSize={21} fill={color.inkSoft}>{yLabel}</text>}
          {xLabel && <text x={w} y={h + 84} textAnchor="end" fontFamily={font.sans} fontSize={22} fill={color.inkSoft}>{xLabel}</text>}
        </g>
        {vlines.map((v, i) => (
          <g key={i} opacity={fade(t, v.at, v.out)}>
            <line x1={sx(v.x)} x2={sx(v.x)} y1={-6} y2={h} stroke={v.col ?? color.ochre} strokeWidth={3} strokeDasharray="8 6" />
            <text x={sx(v.x) + 12} y={18} fontFamily={font.sans} fontSize={24} fontWeight={600} fill={v.col ?? color.ochre}>{v.label}</text>
          </g>
        ))}
        {series.map((s) => {
          const pts = s.points.map((p) => [sx(p.x), sy(p.y)] as [number, number]);
          // reveal times per point
          let times: number[];
          if (s.points.every((p) => p.at !== undefined)) times = s.points.map((p) => p.at as number);
          else {
            const seg = pts.map((p, i) => (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0));
            const total = seg.reduce((a, b) => a + b, 0) || 1;
            let acc = 0;
            times = seg.map((d) => { acc += d; return (s.start ?? appear + 0.4) + (s.dur ?? 2) * (acc / total); });
          }
          let d = '';
          let head: [number, number] | null = null;
          pts.forEach((p, i) => {
            if (i === 0) { if (t >= times[0] - 0.05) { d = `M${p[0]},${p[1]}`; head = p; } return; }
            const segDur = s.points.every((q) => q.at !== undefined) ? 0.55 : Math.max(0.05, times[i] - times[i - 1]);
            const q = ramp(t, times[i] - segDur, segDur);
            if (q <= 0 || !d) return;
            const a = pts[i - 1];
            const hx = a[0] + (p[0] - a[0]) * q, hy = a[1] + (p[1] - a[1]) * q;
            d += ` L${hx},${hy}`;
            head = [hx, hy];
          });
          const dimO = s.dim ? 1 - (1 - s.dim.to) * ramp(t, s.dim.at, 0.6) : 1;
          const lastIdx = times.reduce((m, tt, i) => (t >= tt ? i : m), -1);
          return (
            <g key={s.id} opacity={dimO}>
              <path d={d} fill="none" stroke={s.col} strokeWidth={s.width ?? 6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={s.dashed ? '14 10' : undefined} />
              {pts.map((p, i) => {
                const o = ramp(t, times[i] - 0.1, 0.3);
                const pt = s.points[i];
                const showVal = s.valueLabels === 'all' || (s.valueLabels === 'last' && i === lastIdx) || pt.label !== undefined;
                const pos = pt.labelPos ?? s.labelPos ?? 'above';
                const dy = pos === 'above' ? -24 : pos === 'below' ? 46 : 10;
                const dx = pos === 'right' ? 18 : pos === 'left' ? -18 : 0;
                const anchor = pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle';
                return (
                  <g key={i} opacity={o}>
                    <circle cx={p[0]} cy={p[1]} r={pt.big ? 12 : 8} fill={color.paper} stroke={s.col} strokeWidth={4} />
                    {showVal && (
                      <text x={p[0] + dx} y={p[1] + dy} textAnchor={anchor} fontFamily={font.sans} fontWeight={600} fontSize={pt.big ? 40 : 28} fill={s.col} style={num}>
                        {pt.label ?? pt.y}
                      </text>
                    )}
                  </g>
                );
              })}
              {s.label && head && (
                <text x={(head as [number, number])[0] + 22} y={(head as [number, number])[1] + 9 + (s.endLabelDy ?? 0)} fontFamily={font.sans} fontWeight={600} fontSize={30} fill={s.col}>{s.label}</text>
              )}
            </g>
          );
        })}
        {notes.map((n, i) => (
          <text key={i} x={sx(n.x) + (n.dx ?? 0)} y={sy(n.y) + (n.dy ?? 0)} opacity={fade(t, n.at, n.out)} fontFamily={font.sans} fontSize={26} fontWeight={500} fill={n.col ?? color.inkSoft}>{n.text}</text>
        ))}
      </g>
    </svg>
  );
};
