import React from 'react';
import {useT, ramp, fade, lerp, fmt} from '../anim';
import {color, font, num} from '../theme';

/** Big number that counts up when it appears (StatCallout). */
export const StatCallout: React.FC<{
  value: number; from?: number; at: number; dur?: number; prefix?: string; suffix?: string;
  label?: string; sub?: string; col?: string; size?: number; dark?: boolean; decimals?: number;
  x?: number; y?: number; align?: 'left' | 'center'; out?: number;
}> = ({value, from, at, dur = 1.1, prefix = '', suffix = '', label, sub, col, size = 190, dark, decimals = 0,
       x = 960, y = 470, align = 'center', out}) => {
  const t = useT();
  const p = ramp(t, at, dur);
  const o = fade(t, at - 0.1, out, 0.45);
  const v = lerp(from ?? value * 0.8, value, p);
  const ink = dark ? color.nightText : color.ink;
  return (
    <div style={{position: 'absolute', left: align === 'center' ? x - 800 : x, top: y - size * 0.75, width: align === 'center' ? 1600 : 1400,
      textAlign: align, opacity: o, transform: `translateY(${(1 - ramp(t, at - 0.1, 0.6)) * 18}px)`}}>
      {label && <div style={{fontFamily: font.sans, fontSize: 30, fontWeight: 500, color: dark ? color.nightSoft : color.inkSoft, marginBottom: 6, letterSpacing: 0.3}}>{label}</div>}
      <div style={{fontFamily: font.serif, fontWeight: 600, fontSize: size, lineHeight: 1, color: col ?? ink, ...num}}>
        {prefix}{fmt(v, decimals)}{suffix}
      </div>
      {sub && <div style={{fontFamily: font.sans, fontSize: 30, color: dark ? color.nightSoft : color.inkSoft, marginTop: 14}}>{sub}</div>}
    </div>
  );
};

/** Serif headline card used for chapter openers and the cold-open title. */
export const TitleCard: React.FC<{kicker?: string; title: string; at: number; out?: number; dark?: boolean; size?: number; y?: number}> =
  ({kicker, title, at, out, dark, size = 92, y = 540}) => {
  const t = useT();
  const o = fade(t, at, out, 0.6);
  return (
    <div style={{position: 'absolute', left: 160, right: 160, top: y, transform: `translateY(-50%) translateY(${(1 - ramp(t, at, 0.8)) * 20}px)`, textAlign: 'center', opacity: o}}>
      {kicker && <div style={{fontFamily: font.sans, fontSize: 24, letterSpacing: 5, textTransform: 'uppercase', fontWeight: 600,
        color: dark ? color.vermilion : color.vermilion, marginBottom: 22}}>{kicker}</div>}
      <div style={{fontFamily: font.serif, fontSize: size, lineHeight: 1.12, fontWeight: 600, color: dark ? color.nightText : color.ink}}>{title}</div>
    </div>
  );
};

/** A line of text that fades/slides in at a cue. */
export const Line: React.FC<{text: React.ReactNode; at: number; out?: number; x?: number; y: number; size?: number; serif?: boolean;
  col?: string; weight?: number; align?: 'left' | 'center' | 'right'; width?: number; italic?: boolean; dark?: boolean;
  strikeAt?: number; strikeCol?: string}> =
  ({text, at, out, x = 160, y, size = 44, serif = true, col, weight = 400, align = 'left', width = 1600, italic, dark, strikeAt, strikeCol}) => {
  const t = useT();
  const inner = strikeAt === undefined ? text : (
    <span style={{position: 'relative', display: 'inline-block'}}>
      {text}
      <span style={{position: 'absolute', left: -6, top: '54%', height: Math.max(4, size * 0.07), width: `calc(${ramp(t, strikeAt, 0.45) * 100}% + 12px)`,
        background: strikeCol ?? color.vermilion, borderRadius: 3}} />
    </span>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width, textAlign: align, opacity: fade(t, at, out),
      transform: `translateY(${(1 - ramp(t, at, 0.6)) * 14}px)`, fontFamily: serif ? font.serif : font.sans, fontSize: size,
      fontWeight: weight, fontStyle: italic ? 'italic' : 'normal', lineHeight: 1.25, color: col ?? (dark ? color.nightText : color.ink), ...num}}>
      {inner}
    </div>
  );
};

/** Quote / paraphrase card with attribution. */
export const QuoteCard: React.FC<{text: string; text2?: string; at2?: number; who: string; at: number; out?: number; note?: string}> = ({text, text2, at2 = 0, who, at, out, note}) => {
  const t = useT();
  const o = fade(t, at, out, 0.6);
  return (
    <div style={{position: 'absolute', left: 260, right: 260, top: 250, opacity: o}}>
      <div style={{width: 6, height: 360, background: color.vermilion, position: 'absolute', left: -48, top: 10, transformOrigin: 'top', transform: `scaleY(${ramp(t, at, 0.9)})`}} />
      <div style={{fontFamily: font.serif, fontStyle: 'italic', fontSize: 58, lineHeight: 1.3, color: color.ink}}>{text}{text2 && <span style={{opacity: ramp(t, at2, 0.6)}}> {text2}</span>}</div>
      <div style={{fontFamily: font.sans, fontSize: 28, marginTop: 36, color: color.inkSoft, fontWeight: 500}}>— {who}</div>
      {note && <div style={{fontFamily: font.sans, fontSize: 21, marginTop: 10, color: color.inkFaint}}>{note}</div>}
    </div>
  );
};

/** Strike-through line animated across a text block. */
export const Strike: React.FC<{at: number; x: number; y: number; w: number; col?: string}> = ({at, x, y, w, col = color.vermilion}) => {
  const t = useT();
  return <div style={{position: 'absolute', left: x, top: y, height: 6, width: w * ramp(t, at, 0.45), background: col, borderRadius: 3}} />;
};
