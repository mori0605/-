import React from 'react';
import {useT, ramp, fade} from '../anim';
import {color, font} from '../theme';

export type Verdict = 'no' | 'partial' | 'yes' | 'symptom';
const V: Record<Verdict, {mark: string; col: string}> = {
  no: {mark: '✗', col: color.vermilion},
  partial: {mark: '△', col: color.ochre},
  yes: {mark: '○', col: color.indigo},
  symptom: {mark: '—', col: color.inkSoft},
};

/** Suspect card: number + name, evidence lines on cue, verdict stamp. */
export const VerdictCard: React.FC<{
  n: number; name: string; at: number; evidence: {text: string; at: number}[];
  verdict: Verdict; verdictText: string; verdictAt: number; children?: React.ReactNode;
}> = ({n, name, at, evidence, verdict, verdictText, verdictAt, children}) => {
  const t = useT();
  const v = V[verdict];
  const stamp = ramp(t, verdictAt, 0.5);
  return (
    <>
      <div style={{position: 'absolute', left: 120, top: 130, opacity: fade(t, at)}}>
        <div style={{fontFamily: font.sans, fontSize: 24, letterSpacing: 5, fontWeight: 600, color: color.inkSoft}}>SUSPECT {n} OF 6</div>
        <div style={{fontFamily: font.serif, fontSize: 84, fontWeight: 600, color: color.ink, marginTop: 6}}>{name}</div>
      </div>
      <div style={{position: 'absolute', left: 120, top: 310, width: 940}}>
        {evidence.map((e, i) => (
          <div key={i} style={{display: 'flex', gap: 22, marginBottom: 24, opacity: fade(t, e.at), transform: `translateX(${(1 - ramp(t, e.at, 0.6)) * -16}px)`}}>
            <div style={{width: 10, height: 10, borderRadius: 5, background: color.ink, marginTop: 17, flex: 'none'}} />
            <div style={{fontFamily: font.sans, fontSize: 33, lineHeight: 1.3, color: color.ink}}>{e.text}</div>
          </div>
        ))}
      </div>
      {children}
      <div style={{position: 'absolute', right: 120, bottom: 120, display: 'flex', alignItems: 'center', gap: 28,
        opacity: stamp, transform: `scale(${1.25 - 0.25 * stamp})`, transformOrigin: 'right center'}}>
        <div style={{fontFamily: font.sans, fontSize: 30, fontWeight: 600, letterSpacing: 3, color: color.inkSoft}}>VERDICT</div>
        <div style={{border: `5px solid ${v.col}`, borderRadius: 14, padding: '14px 30px', display: 'flex', alignItems: 'center', gap: 20}}>
          <span style={{fontSize: 64, color: v.col, fontFamily: font.sans, lineHeight: 1}}>{v.mark}</span>
          <span style={{fontFamily: font.serif, fontSize: 46, fontWeight: 600, color: v.col}}>{verdictText}</span>
        </div>
      </div>
    </>
  );
};
