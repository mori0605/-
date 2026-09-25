import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Paper, LineChart, WorldMap, ISO} from '../../../engine/components';
import {color, font, num} from '../../../engine/theme';
import {scores} from './data.gen';

// Thumbnails are 1280×720 stills: one strong figure + at most five words (CLAUDE.md §9).
const FIN = scores.FIN.math, EST = scores.EST.math;

/** Paper: Finland falls, Estonia passes it. "The Finnish Miracle" with Miracle struck. */
export const Thumb1: React.FC = () => {
  const fy = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  return (
    <Paper grid={36}>
      <LineChart x={110} y={300} w={1000} h={330} xDomain={[2005.5, 2025.5]} yDomain={[462, 552]} xTicks={[]} yTicks={[]} appear={-10}
        series={[
          {id: 'e', col: color.indigo, width: 12, points: fy.map((y) => ({x: y, y: EST[y], at: -5}))},
          {id: 'f', col: color.vermilion, width: 14, points: fy.map((y) => ({x: y, y: FIN[y], at: -5}))},
        ]} />
      <div style={{position: 'absolute', left: 64, top: 70, fontFamily: font.serif, fontWeight: 600, fontSize: 96, lineHeight: 1.02, color: color.ink}}>
        The Finnish<br />
        <span style={{position: 'relative'}}>Miracle
          <span style={{position: 'absolute', left: -8, right: -8, top: '52%', height: 12, background: color.vermilion, transform: 'rotate(-4deg)'}} />
        </span>
      </div>
    </Paper>
  );
};

/** Dark Nordic map: Finland sinks in vermilion, Estonia lit in indigo. */
export const Thumb2: React.FC = () => (
  <AbsoluteFill>
    <div style={{position: 'absolute', width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: 'top left'}}>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 23, lat: 61.2, k: 1.05}]}
        highlights={[{id: ISO.FIN, col: color.vermilion, at: -5, opacity: 0.85}, {id: ISO.EST, col: color.indigoOnNight, at: -5, opacity: 0.9}]} />
    </div>
    <div style={{position: 'absolute', left: 56, bottom: 60, fontFamily: font.serif, fontWeight: 600, fontSize: 104, color: color.nightText, lineHeight: 1}}>
      What went<br />wrong?
    </div>
  </AbsoluteFill>
);

/** Big number with a thin down arrow and a small flag. */
export const Thumb3: React.FC = () => (
  <Paper grid={36}>
    <div style={{position: 'absolute', left: 40, width: 1080, top: 210, textAlign: 'center', fontFamily: font.serif, fontWeight: 600, fontSize: 190, color: color.ink, ...num}}>
      548 <span style={{color: color.inkSoft}}>→</span> <span style={{color: color.vermilion}}>469</span>
    </div>
    <svg style={{position: 'absolute', left: 1150, top: 90}} width={80} height={560}>
      <line x1={40} y1={10} x2={40} y2={530} stroke={color.vermilion} strokeWidth={6} />
      <polyline points="16,500 40,540 64,500" fill="none" stroke={color.vermilion} strokeWidth={6} />
    </svg>
    {/* Finnish flag, small */}
    <svg style={{position: 'absolute', left: 90, top: 560}} width={110} height={67} viewBox="0 0 18 11">
      <rect width={18} height={11} fill="#fff" stroke="rgba(0,0,0,0.15)" strokeWidth={0.2} />
      <rect x={5} width={3} height={11} fill="#002F6C" />
      <rect y={4} width={18} height={3} fill="#002F6C" />
    </svg>
    <div style={{position: 'absolute', left: 230, top: 572, fontFamily: font.sans, fontSize: 36, fontWeight: 600, color: color.inkSoft}}>PISA maths</div>
  </Paper>
);
