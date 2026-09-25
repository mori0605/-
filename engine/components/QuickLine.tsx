import React from 'react';
import {useT, ramp, lerp} from '../anim';
import {color, font, num} from '../theme';

/**
 * A line chart that is NOT a presentation: the whole series draws in ~1.5 s with a glowing head,
 * then stays alive (breathing head, optional step arrows). Only the first and last values are labelled,
 * and labels sit outside the line (start: above-left, end: right) so text never overlaps the data.
 */
export const QuickLine: React.FC<{
  x: number; y: number; w: number; h: number; xDomain: [number, number]; yDomain: [number, number];
  points: {x: number; y: number}[]; col?: string; start: number; dur?: number; width?: number;
  xTicks?: number[]; axisAt?: number; startLabel?: boolean; endLabel?: boolean; endLabelAt?: number;
  stepArrowsAt?: number; dim?: {at: number; to: number}; labelSize?: number; hideStartLabelUntil?: number;
}> = ({x, y, w, h, xDomain, yDomain, points, col = color.vermilion, start, dur = 1.5, width = 10, xTicks = [], axisAt = start - 0.4,
       startLabel = true, endLabel = true, endLabelAt, stepArrowsAt, dim, labelSize = 76, hideStartLabelUntil}) => {
  const t = useT();
  const sx = (v: number) => x + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * w;
  const sy = (v: number) => y + ((yDomain[1] - v) / (yDomain[1] - yDomain[0])) * h;
  const P = points.map((p) => [sx(p.x), sy(p.y)] as [number, number]);
  const seg = P.map((p, i) => (i ? Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]) : 0));
  const total = seg.reduce((a, b) => a + b, 0);
  const prog = ramp(t, start, dur) * total;
  let acc = 0, d = `M${P[0][0]},${P[0][1]}`, head = P[0];
  for (let i = 1; i < P.length; i++) {
    if (prog <= acc) break;
    const q = Math.min(1, (prog - acc) / seg[i]);
    head = [lerp(P[i - 1][0], P[i][0], q), lerp(P[i - 1][1], P[i][1], q)];
    d += ` L${head[0]},${head[1]}`;
    acc += seg[i];
  }
  const done = ramp(t, start + dur - 0.05, 0.3);
  const o = dim ? 1 - (1 - dim.to) * ramp(t, dim.at, 0.6) : 1;
  const axisO = ramp(t, axisAt, 0.5);
  const last = P[P.length - 1];
  const endAt = endLabelAt ?? start + dur;
  const pulse = 1 + 0.25 * Math.max(0, Math.sin((t - start - dur) * 3));
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
        <g opacity={axisO}>
          <line x1={x - 30} x2={x + w + 30} y1={y + h} y2={y + h} stroke={color.ink} strokeWidth={4} />
          {xTicks.map((v) => (
            <g key={v}>
              <line x1={sx(v)} x2={sx(v)} y1={y + h} y2={y + h + 14} stroke={color.ink} strokeWidth={4} />
              <text x={sx(v)} y={y + h + 66} textAnchor="middle" fontFamily={font.sans} fontWeight={800} fontSize={46} fill={color.ink} style={num}>{v}</text>
            </g>
          ))}
        </g>
        <g opacity={o}>
          <path d={d} fill="none" stroke={col} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
          {P.map((p, i) => {
            const reached = t >= start && (i === 0 || prog >= seg.slice(1, i + 1).reduce((a, b) => a + b, 0) - 1);
            return reached ? <circle key={i} cx={p[0]} cy={p[1]} r={width * 0.95} fill={color.paper} stroke={col} strokeWidth={width * 0.55} /> : null;
          })}
          {/* glowing head while drawing, gentle pulse after */}
          <circle cx={head[0]} cy={head[1]} r={width * 2.6 * (done > 0.5 ? pulse : 1)} fill={col} opacity={0.18 * ramp(t, start, 0.2)} />
          {stepArrowsAt !== undefined && P.slice(1).map((p, i) => {
            const a = P[i];
            const mx = (a[0] + p[0]) / 2, my = (a[1] + p[1]) / 2 + 58;
            const q = ramp(t, stepArrowsAt + i * 0.14, 0.3);
            return (
              <g key={i} opacity={q} transform={`translate(${mx},${my + (1 - q) * -14})`}>
                <path d="M0,-16 L0,14 M-11,4 L0,16 L11,4" stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
        </g>
      </svg>
      {startLabel && (
        <div style={{position: 'absolute', left: P[0][0] - 240, top: P[0][1] - labelSize - 30, width: 260, textAlign: 'right',
          fontFamily: font.sans, fontWeight: 800, fontSize: labelSize, color: col, lineHeight: 1, opacity: o * ramp(t, hideStartLabelUntil ?? start - 0.2, 0.3), ...num}}>
          {points[0].y}
        </div>
      )}
      {endLabel && (
        <div style={{position: 'absolute', left: last[0] + 72, top: last[1] - labelSize * 0.55, fontFamily: font.sans, fontWeight: 800,
          fontSize: labelSize, color: col, lineHeight: 1, opacity: o * ramp(t, endAt, 0.3),
          transform: `scale(${1 + 0.12 * Math.max(0, Math.sin(Math.min(Math.PI, (t - endAt) * 5)))})`, transformOrigin: 'left center', ...num}}>
          {points[points.length - 1].y}
        </div>
      )}
    </>
  );
};
