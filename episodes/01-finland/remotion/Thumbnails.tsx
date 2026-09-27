import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Paper, WorldMap, ISO} from '../../../engine/components';
import {color, font, num} from '../../../engine/theme';
import {scores} from './data.gen';

// Thumbnails: 1280×720, one strong figure + at most five words, readable at phone size (~170 px wide).
// Typefaces follow the channel rules: DM Serif Display for numbers, Archivo 900 for words.
const FIN = scores.FIN.math, EST = scores.EST.math;
const YRS = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;

const Flag: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 96}) => (
  <svg style={{position: 'absolute', left: x, top: y}} width={w} height={w * 11 / 18} viewBox="0 0 18 11">
    <rect width={18} height={11} fill="#fff" stroke="rgba(0,0,0,0.25)" strokeWidth={0.3} />
    <rect x={5} width={3} height={11} fill="#002F6C" />
    <rect y={4} width={18} height={3} fill="#002F6C" />
  </svg>
);

const path = (ys: readonly number[], vals: Record<number, number>, x0: number, x1: number, y0: number, y1: number, lo: number, hi: number) =>
  ys.map((y, i) => {
    const px = x0 + ((y - ys[0]) / (ys[ys.length - 1] - ys[0])) * (x1 - x0);
    const py = y0 + ((hi - vals[y]) / (hi - lo)) * (y1 - y0);
    return `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');

/** 1 — "The crash": a thick line slides, then dives off the chart. Only two numbers. */
export const Thumb1: React.FC = () => {
  const d = path(YRS, FIN, 150, 800, 200, 470, 469, 548);
  return (
    <Paper grid={40}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 72% 72%, rgba(200,54,45,0.18) 0%, rgba(200,54,45,0) 50%)'}} />
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={d} fill="none" stroke={color.vermilion} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M800,470 L915,630" stroke={color.vermilion} strokeWidth={30} strokeLinecap="round" />
        <path d="M840,622 L922,640 L930,556" fill="none" stroke={color.vermilion} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={150} cy={200} r={26} fill={color.paper} stroke={color.ink} strokeWidth={12} />
      </svg>
      <div style={{position: 'absolute', left: 60, top: 24, fontFamily: font.serif, fontSize: 150, lineHeight: 1, color: color.ink, ...num}}>548</div>
      <Flag x={340} y={68} w={110} />
      <div style={{position: 'absolute', left: 965, top: 470, fontFamily: font.serif, fontSize: 190, lineHeight: 1, color: color.vermilion, ...num}}>469</div>
    </Paper>
  );
};

/** 2 — "Miracle?": Finland glows on a dark map, the word MIRACLE is struck out. */
export const Thumb2: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: color.night}}>
    <div style={{position: 'absolute', width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: 'top left', filter: 'saturate(1.1)'}}>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 36, lat: 62, k: 0.95}]}
        highlights={[{id: ISO.FIN, col: color.vermilion, at: -5, opacity: 0.95}]} />
    </div>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 42%, rgba(200,54,45,0.35) 0%, rgba(200,54,45,0) 24%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(14,15,17,0) 42%, rgba(14,15,17,0.92) 60%)'}} />
    <div style={{position: 'absolute', left: 690, top: 160, fontFamily: font.sans, fontWeight: 900, lineHeight: 0.95, color: color.nightText}}>
      <div style={{fontSize: 86}}>THE</div>
      <div style={{fontSize: 86}}>FINNISH</div>
      <div style={{position: 'relative', fontSize: 104, color: color.vermilion, marginTop: 6, display: 'inline-block'}}>
        MIRACLE
        <div style={{position: 'absolute', left: -14, right: -14, top: '48%', height: 22, background: color.nightText, transform: 'rotate(-7deg)', borderRadius: 4}} />
      </div>
    </div>
  </AbsoluteFill>
);

/** 3 — "Overtaken.": Estonia holds, Finland dives through it. One word. */
export const Thumb3: React.FC = () => {
  const lo = 460, hi = 552;
  const fin = path(YRS, FIN, 110, 1060, 250, 640, lo, hi);
  const est = path(YRS, EST, 110, 1060, 250, 640, lo, hi);
  const cy = 250 + ((hi - 520) / (hi - lo)) * 390;
  const cx = 110 + ((2012 - 2006) / 19) * 950;
  return (
    <Paper grid={40}>
      <svg width={1280} height={720} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={est} fill="none" stroke={color.indigo} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
        <path d={fin} fill="none" stroke={color.vermilion} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={cx} cy={cy} r={62} fill="none" stroke={color.ink} strokeWidth={9} />
      </svg>
      <div style={{position: 'absolute', left: 60, top: 26, fontFamily: font.sans, fontWeight: 900, fontSize: 150, lineHeight: 1, color: color.ink, letterSpacing: '-0.02em'}}>
        Overtaken.
      </div>
      <div style={{position: 'absolute', left: 1080, top: 300, fontFamily: font.sans, fontWeight: 900, fontSize: 52, color: color.indigo}}>EST</div>
      <div style={{position: 'absolute', left: 1080, top: 600, fontFamily: font.sans, fontWeight: 900, fontSize: 52, color: color.vermilion}}>FIN</div>
    </Paper>
  );
};
