/**
 * Episode 01 scenes — v2 style.
 * Rules (CLAUDE.md §5): two typefaces, heavy and large; text in two places only (caption slot + focal element);
 * nothing overlaps; captions change rarely; data appears fast; constant camera motion; one focal point at a time.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  Paper, Night, SourceTag, WorldMap, ISO, Camera, CamKey, Caption, CircleMarker, QuickLine, CardGrid, Stamp, Focal,
  Waffle, HBars, EraTimeline, beats,
} from '../../../engine/components';
import {useT, ramp, lerp, fmt} from '../../../engine/anim';
import {useCues} from '../../../engine/timeline';
import {color, font, num} from '../../../engine/theme';
import {scores} from './data.gen';

const FIN = scores.FIN, EST = scores.EST, OECD = scores.OECD;
const C_FIN = color.vermilion, C_EST = color.indigo, C_JPN = color.ochre;
const HEL: [number, number] = [24.94, 60.17];
type Cap = {at: number; text: React.ReactNode};

// ───────────── shot wrappers ─────────────

const PaperShot: React.FC<{cam: CamKey[]; captions: Cap[]; source?: string; children: React.ReactNode}> = ({cam, captions, source, children}) => (
  <Paper>
    <Camera keys={cam} breathe={0.008}>{children}</Camera>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${color.paper} 0%, ${color.paper} 17%, rgba(244,239,227,0) 24%)`}} />
    <Caption items={captions} />
    {source && <SourceTag text={source} />}
  </Paper>
);

const NightShot: React.FC<{cam: CamKey[]; captions: Cap[]; children: React.ReactNode}> = ({cam, captions, children}) => (
  <Night>
    <Camera keys={cam} breathe={0.01}>{children}</Camera>
    <Caption dark items={captions} />
  </Night>
);

const TopShade: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,15,17,0.9) 0%, rgba(14,15,17,0) 26%)'}} />;
const BottomShade: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(14,15,17,0.92) 0%, rgba(14,15,17,0) 45%)'}} />;

/** Big serif number with an Archivo word under it (a single focal group). */
const Hero: React.FC<{value: number; from?: number; at: number; out?: number; x: number; y: number; size?: number; col?: string;
  prefix?: string; suffix?: string; word?: string; dark?: boolean; align?: 'left' | 'center'; dur?: number}> =
  ({value, from = 0, at, out, x, y, size = 260, col = C_FIN, prefix = '', suffix = '', word, dark, align = 'center', dur = 1.1}) => {
  const t = useT();
  const o = ramp(t, at - 0.1, 0.3) * (out === undefined ? 1 : 1 - ramp(t, out, 0.35));
  if (o <= 0.001) return null;
  const v = lerp(from, value, ramp(t, at, dur));
  const pop = 1 + 0.05 * Math.sin(Math.min(Math.PI, Math.max(0, t - at - dur + 0.2) * 6));
  return (
    <div style={{position: 'absolute', left: align === 'center' ? x - 600 : x, width: 1200, top: y, textAlign: align, opacity: o,
      transform: `translateY(${(1 - ramp(t, at, 0.5)) * 24}px) scale(${pop})`, transformOrigin: align === 'center' ? 'center' : 'left center'}}>
      <div style={{fontFamily: font.serif, fontSize: size, lineHeight: 0.95, color: col, ...num}}>{prefix}{fmt(Math.round(v))}{suffix}</div>
      {word && <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: size * 0.2, color: dark ? color.nightText : color.ink, marginTop: 10}}>{word}</div>}
    </div>
  );
};

// ───────────── COLD OPEN ─────────────

/** P01 + start of P02: the pilgrimage (World mode, >15 s, held with motion). */
export const S01: React.FC = () => {
  const {c} = useCues();
  const origins: [number, number][] = [[-9, 52], [2.3, 48.9], [-3.7, 40.4], [12.5, 41.9], [13.4, 52.5], [21, 52.2], [-25, 60], [4.9, 52.4], [-40, 45], [40, 45]];
  const kMir = c('P02', 'miracle.');
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic"
        keys={[{t: 0, lon: 8, lat: 53, k: 0.36}, {t: c('P01', 'flying'), lon: 12, lat: 55, k: 0.46}, {t: c('P01', 'Helsinki.'), lon: 17, lat: 58, k: 0.58}, {t: c('P01', 'sixteen'), lon: 15, lat: 57.5, k: 0.64}, {t: c('P01', 'single'), lon: 18, lat: 59, k: 0.74}, {t: kMir + 3, lon: 22, lat: 60.5, k: 1.0}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: c('P01', 'Helsinki.') - 0.3, opacity: 0.8}]}
        arcs={origins.map((o, i) => ({from: o, to: HEL, at: 0.6 + i * 0.45, dur: 1.8, col: color.nightText}))}
        pulses={[{lon: HEL[0], lat: HEL[1], at: c('P01', 'Helsinki.'), col: color.nightText}]} />
      <TopShade /><BottomShade />
      <Hero dark value={16000} at={c('P01', 'sixteen')} out={c('P01', 'Today') - 0.2} x={120} y={640} size={200} col={color.nightText} suffix="+" word="visitors to Finland's education agency" align="left" />
      <Hero dark value={1485} from={0} at={c('P01', 'one')} out={kMir - 0.3} x={120} y={640} size={200} col={C_FIN} prefix="€" word="for one school visit" align="left" />
      <Caption dark items={[{at: c('P01', 'early'), text: 'The pilgrimage to Helsinki'}, {at: kMir - 0.2, text: 'The Finnish miracle'}]} />
      <SourceTag dark text="Finnish National Agency for Education (OPH)" />
    </AbsoluteFill>
  );
};

// geometry for the cold-open chart
const CH = {x: 190, y: 300, w: 1080, h: 540, x0: 2004.5, x1: 2026.5, y0: 452, y1: 560};
const cpx = (v: number) => CH.x + ((v - CH.x0) / (CH.x1 - CH.x0)) * CH.w;
const cpy = (v: number) => CH.y + ((CH.y1 - v) / (CH.y1 - CH.y0)) * CH.h;
const YRS = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;

/** P02 (from 548) – P04: 548 → the line → −79, one continuous shot (the approved sample). */
export const S02: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const k548 = c('P02', '548');
  const kNow = c('P03', 'Then');
  const lineStart = kNow + 0.55;
  const kFall = c('P04', 'That\'s');
  const k79 = c('P04', '79');
  const kYard = c('P04', 'yardstick,');
  const kThree = c('P04', 'three');
  const fly = ramp(t, kNow, 0.75);
  const bigX = lerp(960, cpx(2006) - 10, fly);
  const bigY = lerp(650, cpy(548) - 56, fly);
  const bigSize = lerp(380, 76, fly);
  const count = lerp(380, 548, ramp(t, k548, 1.3));
  const bounce = 1 + 0.06 * Math.sin(Math.min(Math.PI, Math.max(0, t - k548 - 1.1) * 6));
  const bx = 1440;
  const br = ramp(t, kFall, 0.5);
  const drop = Math.round(lerp(0, 79, ramp(t, k79, 0.8)));
  return (
    <PaperShot source={t < kNow ? 'OECD, PISA 2006' : 'OECD PISA 2006–2025; OECD (2026): 22 points ≈ 1 year'}
      cam={[
        {t: 0, x: 960, y: 560, k: 1.08},
        {t: k548, x: 960, y: 560, k: 1.0, dur: 1.4},
        {t: c('P02', 'largest'), x: 960, y: 580, k: 1.07, dur: 1.4},
        {t: kNow, x: 860, y: 580, k: 1.0, dur: 0.8},
        {t: lineStart + 1.3, x: 900, y: 600, k: 1.04, dur: 2},
        {t: c('P03', 'latest'), x: 1050, y: 660, k: 1.12, dur: 1.4},
        {t: kFall - 0.3, x: 990, y: 580, k: 1.0, dur: 0.9},
        {t: kYard, x: 1070, y: 580, k: 1.05, dur: 2},
      ]}
      captions={[
        {at: 0.1, text: "Finland's maths score, 2006"},
        {at: lineStart, text: 'Lower in every round since'},
        {at: k79, text: <>22 points ≈ <span style={{color: C_FIN}}>one year</span> of school</>},
      ]}>
      <div style={{position: 'absolute', left: bigX - 700, top: bigY - bigSize * 0.62, width: 1400, textAlign: 'center',
        fontFamily: fly > 0.5 ? font.sans : font.serif, fontWeight: fly > 0.5 ? 800 : 400, fontSize: bigSize, lineHeight: 1, color: C_FIN,
        opacity: ramp(t, k548 - 0.2, 0.3), transform: `scale(${bounce})`, ...num}}>
        {fmt(Math.round(count))}
      </div>
      <CircleMarker x={960} y={590} r={350} at={c('P02', 'largest')} out={kNow - 0.3} width={8} />
      <div style={{position: 'absolute', left: 960 - 330 * ramp(t, k548 + 1.3, 0.6), top: 790, height: 14, borderRadius: 7,
        width: 660 * ramp(t, k548 + 1.3, 0.6), background: C_FIN, opacity: 1 - ramp(t, c('P02', 'largest') - 0.3, 0.4)}} />
      <QuickLine x={CH.x} y={CH.y} w={CH.w} h={CH.h} xDomain={[CH.x0, CH.x1]} yDomain={[CH.y0, CH.y1]}
        points={YRS.map((y) => ({x: y, y: FIN.math[y]}))} start={lineStart} dur={1.3} xTicks={[2006, 2025]} axisAt={kNow + 0.3}
        startLabel={false} endLabelAt={lineStart + 1.2} stepArrowsAt={c('P03', 'lower')} dim={{at: kFall, to: 0.35}} />
      <CircleMarker x={cpx(2025)} y={cpy(469)} r={48} at={c('P03', '469.')} out={kFall} width={7} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
        <g opacity={ramp(t, kFall, 0.3)}>
          <line x1={cpx(2006) + 40} x2={bx} y1={cpy(548)} y2={cpy(548)} stroke={color.inkFaint} strokeWidth={3} strokeDasharray="10 10" />
          <line x1={bx} x2={bx} y1={cpy(548)} y2={cpy(548) + (cpy(469) - cpy(548)) * br} stroke={C_FIN} strokeWidth={10} strokeLinecap="round" />
          {[1, 2, 3].map((n, i) => (
            <line key={i} x1={bx - 26} x2={bx + 26} y1={cpy(548 - 22 * n)} y2={cpy(548 - 22 * n)} stroke={C_FIN} strokeWidth={8} strokeLinecap="round"
              opacity={ramp(t, kYard + i * 0.22, 0.25)} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: bx + 60, top: cpy(548) - 10, opacity: ramp(t, k79 - 0.1, 0.3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 70, height: 20, background: C_FIN, borderRadius: 3, marginTop: 20}} />
          <div style={{fontFamily: font.serif, fontSize: 210, lineHeight: 1, color: C_FIN, ...num}}>{drop}</div>
        </div>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 52, color: color.ink, marginTop: 6}}>points</div>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 64, lineHeight: 1.05, color: color.ink, marginTop: 40,
          opacity: ramp(t, kThree, 0.4), transform: `translateY(${(1 - ramp(t, kThree, 0.5)) * 20}px)`}}>
          ≈ 3 years<br /><span style={{color: C_FIN}}>of learning</span>
        </div>
      </div>
    </PaperShot>
  );
};

/** P05: the usual suspects are struck out, the real question lands. */
export const S05: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const kNone = c('P05', 'None');
  const kCopy = c('P05', 'copied');
  const words = [
    {w: 'Phones', at: c('P05', 'phones,')},
    {w: 'Pandemic', at: c('P05', 'pandemic')},
    {w: 'Immigration', at: c('P05', 'immigration.')},
  ];
  const out = kCopy - 0.4;
  return (
    <NightShot cam={[{t: 0, x: 960, y: 540, k: 1.0}, {t: kNone, x: 960, y: 540, k: 1.06, dur: 2}, {t: kCopy, x: 960, y: 540, k: 1.0, dur: 1}, {t: c('P05', 'mistake'), x: 960, y: 560, k: 1.05, dur: 2}]}
      captions={[{at: 0.2, text: 'The usual suspects'}, {at: c('P05', 'stranger.'), text: 'The real answer is stranger'}]}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', gap: 56,
        opacity: 1 - ramp(t, out, 0.4)}}>
        {words.map((w, i) => {
          const p = ramp(t, w.at, 0.4);
          const s = ramp(t, kNone + i * 0.18, 0.35);
          return (
            <div key={w.w} style={{position: 'relative', fontFamily: font.sans, fontWeight: 900, fontSize: 96, color: color.nightText,
              opacity: p * (1 - 0.55 * s), transform: `translateY(${(1 - p) * 30}px)`}}>
              {w.w}
              <div style={{position: 'absolute', left: -10, top: '52%', height: 16, width: `calc(${s * 100}% + 20px)`, background: C_FIN, borderRadius: 8}} />
            </div>
          );
        })}
      </div>
      <Focal dark at={kCopy} y={560} size={104} text={<>The world copied Finland<br />for the <span style={{color: C_FIN}}>wrong reasons</span></>} />
    </NightShot>
  );
};

// ───────────── SETUP ─────────────

export const S06: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="world" keys={[{t: 0, lon: 15, lat: 30, k: 1.25}, {t: c('P06', 'OECD.'), lon: 18, lat: 36, k: 1.35}, {t: c('P06', 'reading,'), lon: 22, lat: 42, k: 1.5}, {t: pe('P06') + 1, lon: 20, lat: 40, k: 1.1}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.3}]} pulses={[{lon: HEL[0], lat: HEL[1], at: 0.5, col: color.nightText}]} />
      <TopShade /><BottomShade />
      <Caption dark items={[{at: 0.2, text: "PISA: the OECD's school test"}]} />
      <Hero dark value={15} from={15} at={c('P06', 'fifteen-year-olds')} out={c('P06', 'ninety-one') - 0.3} x={120} y={660} size={200} col={color.nightText} word="year-olds · reading · maths · science" align="left" dur={0.1} />
      <Hero dark value={91} at={c('P06', 'ninety-one')} x={120} y={660} size={200} col={C_FIN} word="countries and economies, 2025" align="left" />
      <SourceTag dark text="OECD, PISA 2025 Results (Volume I)" />
    </AbsoluteFill>
  );
};

export const S07: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot cam={[{t: 0, x: 960, y: 560, k: 1.04}, {t: c('P07', 'bad'), x: 960, y: 600, k: 1.0, dur: 1.5}]}
      captions={[{at: 0.2, text: 'What PISA actually measures'}]}>
      <CardGrid x={160} y={280} w={1600} cols={2} rowH={220} size={60} items={[
        {text: <>✗ What you memorised</>, at: c('P07', 'memorised.') - 0.3, col: color.inkSoft},
        {text: <>✓ Using it on new problems</>, at: c('P07', 'use'), col: C_EST},
        {text: <>Bad score → minister out</>, at: c('P07', 'bad')},
        {text: <>Good score → consultants in</>, at: c('P07', 'good')},
      ]} />
    </PaperShot>
  );
};

// ───────────── ACT 1 ─────────────

export const S09: React.FC = () => {
  const {c} = useCues();
  const k06 = c('P09', '2006');
  return (
    <PaperShot source="OECD PISA 2000, 2006; Finnish Ministry of Education and Culture"
      cam={[{t: 0, x: 960, y: 560, k: 1.08}, ...beats([c('P09', 'December'), c('P09', 'reading.')]), {t: k06, x: 960, y: 580, k: 1.0, dur: 1.2}]}
      captions={[{at: 0.2, text: 'PISA 2000: Finland is #1 in reading'}, {at: k06, text: 'Finland, 2006'}]}>
      <Hero value={1} from={1} prefix="#" at={c('P09', 'top')} out={c('P09', '563') - 0.3} x={960} y={330} size={360} col={C_FIN} word="in reading, worldwide" dur={0.1} />
      <Hero value={563} from={400} at={c('P09', '563')} x={420} y={400} size={230} word="science" />
      <Hero value={548} from={400} at={c('P09', '548')} x={960} y={400} size={230} word="maths" />
      <Hero value={547} from={400} at={c('P09', '547')} x={1500} y={400} size={230} word="reading" />
    </PaperShot>
  );
};

/** P10–P11: the visible features, then the one-word mistake. */
export const S10: React.FC = () => {
  const {c} = useCues();
  const kB = c('P11', 'because.');
  const kC = c('P11', 'concluded');
  return (
    <PaperShot cam={[{t: 0, x: 960, y: 580, k: 1.05}, {t: c('P10', "master's"), x: 960, y: 580, k: 1.0, dur: 2}, {t: kB, x: 960, y: 560, k: 1.06, dur: 1.5}, ...beats([c('P10', 'teacher'), c('P11', 'true.')])]}
      source="InfoFinland; OPH; OECD (2010) Finland: Slow and Steady Reform"
      captions={[{at: 0.2, text: 'What the visitors saw'}, {at: c('P11', 'mistake') , text: 'The mistake was one word'}]}>
      <CardGrid x={160} y={300} w={1600} cols={2} rowH={210} size={64} dimAt={kB - 1.4} dimTo={0} items={[
        {text: 'School starts at 7', at: c('P10', 'seven.') - 0.3},
        {text: 'No national tests', at: c('P10', 'national')},
        {text: 'No school inspectors', at: c('P10', 'inspectors.') - 0.3},
        {text: "Teachers: master's degree", at: c('P10', "master's")},
      ]} />
      <Focal at={kB} out={kC - 0.3} y={600} size={260} col={C_FIN} text="because" />
      <Focal at={kC} y={600} size={112} text={<>Fewer tests <span style={{color: C_FIN}}>→</span> higher scores<span style={{color: C_FIN}}>?</span></>} />
    </PaperShot>
  );
};

export const S13: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot source="OECD (2010) Finland: Slow and Steady Reform; school entry at age 7 (InfoFinland)"
      cam={[{t: 0, x: 1100, y: 600, k: 1.1}, {t: c('P13', 'freedoms'), x: 960, y: 600, k: 1.0, dur: 2}, {t: c('P13', 'Classrooms'), x: 900, y: 620, k: 1.06, dur: 2}]}
      captions={[{at: 0.2, text: 'Who sat the 2006 test?'}, {at: c('P13', 'Rules', 2), text: "Rules change fast. Classrooms don't."}]}>
      <EraTimeline x={170} y={640} w={1580} range={[1970, 2010]} ticks={[1970, 1980, 1990, 2000, 2010]} appear={0.2}
        bands={[
          {from: 1970, to: 1990, label: 'Centralised: where their teachers trained', at: c('P13', 'teachers'), col: C_EST},
          {from: 1990, to: 2000, label: 'The freedoms arrive', at: c('P13', 'freedoms'), col: color.ochre},
        ]}
        markers={[
          {year: 2006, label: 'Tested', at: c('P13', 'test.'), col: C_FIN, level: 1},
          {year: 1991, label: 'Born', at: c('P13', 'Born'), col: color.ink},
          {year: 1998, label: 'School', at: c('P13', 'started'), col: color.ink, level: 2},
        ]} />
    </PaperShot>
  );
};

// ───────────── ACT 2 ─────────────

const LX = {x: 230, y: 320, w: 1300, h: 520};

export const S14: React.FC = () => {
  const {c} = useCues();
  const yrs = [2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const kS = c('P14', 'Here') + 0.4;
  return (
    <PaperShot source="OECD PISA 2003–2025"
      cam={[{t: 0, x: 960, y: 600, k: 1.0}, {t: c('P14', 'lower'), x: 1000, y: 620, k: 1.06, dur: 2.5}, {t: c('P14', 'trend'), x: 900, y: 600, k: 1.0, dur: 2}]}
      captions={[{at: 0.2, text: "Finland's maths score, 2003–2025"}, {at: c('P14', 'trend'), text: 'Almost twenty years of decline'}]}>
      <QuickLine x={LX.x} y={LX.y} w={LX.w} h={LX.h} xDomain={[2002, 2026.5]} yDomain={[455, 560]} points={yrs.map((y) => ({x: y, y: FIN.math[y]}))}
        start={kS} dur={1.4} xTicks={[2003, 2025]} stepArrowsAt={c('P14', 'lower') + 0.3} />
      <CircleMarker x={LX.x + ((2006 - 2002) / 24.5) * LX.w} y={LX.y + ((560 - 548) / 105) * LX.h} r={44} at={c('P14', 'peak,')} out={c('P14', 'lower') + 0.5} />
    </PaperShot>
  );
};

/** P15: reading and science, then the gap to the OECD average. */
export const S15: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const kAvg = c('P15', 'above');
  const row = (name: string, a: number, b: number, at: number, y: number, note?: string) => (
    <div style={{position: 'absolute', left: 200, top: y, display: 'flex', alignItems: 'baseline', gap: 40, opacity: ramp(t, at, 0.4) * (1 - ramp(t, kAvg - 0.4, 0.4)),
      transform: `translateX(${(1 - ramp(t, at, 0.5)) * -30}px)`}}>
      <div style={{width: 420, fontFamily: font.sans, fontWeight: 900, fontSize: 80, color: color.ink}}>{name}</div>
      <div style={{fontFamily: font.serif, fontSize: 170, color: color.inkSoft, ...num}}>{a}</div>
      <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 100, color: C_FIN}}>→</div>
      <div style={{fontFamily: font.serif, fontSize: 170, color: C_FIN, ...num}}>{b}</div>
      {note && <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 48, color: C_FIN, opacity: ramp(t, at + 1.4, 0.4)}}>{note}</div>}
    </div>
  );
  const x0 = 620, w = 1100, lo = 440, hi = 520;
  const sx = (v: number) => x0 + ((v - lo) / (hi - lo)) * w;
  const gaps = [
    {name: 'Maths', fin: FIN.math[2025], o: OECD.math[2025], at: c('P15', 'six') - 0.8},
    {name: 'Reading', fin: FIN.reading[2025], o: OECD.reading[2025], at: kAvg + 0.3},
    {name: 'Science', fin: FIN.science[2025], o: OECD.science[2025], at: kAvg + 0.6},
  ];
  return (
    <PaperShot source="OECD PISA 2006, 2025; Finnish Government (rank)"
      cam={[{t: 0, x: 960, y: 580, k: 1.05}, ...beats([c('P15', '474,'), c('P15', 'Italy.'), c('P15', 'slid'), c('P15', '504.')]), {t: kAvg, x: 960, y: 600, k: 1.0, dur: 1}, {t: c('P15', 'six'), x: 900, y: 440, k: 1.12, dur: 1.5}]}
      captions={[{at: 0.2, text: 'Reading and science fell too'}, {at: kAvg, text: <>Still above the <span style={{color: color.inkSoft}}>OECD average</span></>}]}>
      {row('Reading', 547, 474, c('P15', 'Reading'), 300, 'joint 17th')}
      {row('Science', 563, 504, c('P15', 'Science'), 560)}
      {gaps.map((g, i) => {
        const y = 340 + i * 190;
        const o = ramp(t, g.at, 0.4);
        return (
          <div key={g.name} style={{opacity: o}}>
            <div style={{position: 'absolute', left: 160, top: y - 36, width: 400, textAlign: 'right', fontFamily: font.sans, fontWeight: 900, fontSize: 64, color: color.ink}}>{g.name}</div>
            <div style={{position: 'absolute', left: x0, top: y, width: w, height: 4, background: color.inkFaint}} />
            <div style={{position: 'absolute', left: sx(g.o), top: y - 6, width: (sx(g.fin) - sx(g.o)) * ramp(t, g.at + 0.3, 0.5), height: 16, background: C_FIN, opacity: 0.35}} />
            <div style={{position: 'absolute', left: sx(g.o) - 20, top: y - 18, width: 40, height: 40, borderRadius: 20, background: color.ink}} />
            <div style={{position: 'absolute', left: sx(g.fin) - 20, top: y - 18, width: 40, height: 40, borderRadius: 20, background: C_FIN, opacity: ramp(t, g.at + 0.3, 0.3)}} />
            <div style={{position: 'absolute', left: sx(g.fin) + 44, top: y - 40, fontFamily: font.sans, fontWeight: 900, fontSize: 64, color: C_FIN, opacity: ramp(t, g.at + 0.5, 0.3), ...num}}>
              +{g.fin - g.o}
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: x0, top: 340 + 3 * 190 - 40, width: w, display: 'flex', justifyContent: 'space-between',
        fontFamily: font.sans, fontWeight: 800, fontSize: 36, color: color.inkSoft, opacity: ramp(t, kAvg + 0.3, 0.4)}}>
        <span>● OECD average</span><span style={{color: C_FIN}}>● Finland</span>
      </div>
    </PaperShot>
  );
};

export const S16: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot source="OECD PISA 2025 press release; OECD PISA 2015–2025"
      cam={[{t: 0, x: 960, y: 560, k: 1.04}, {t: c('P16', 'further,'), x: 1000, y: 620, k: 1.08, dur: 1.5}]}
      captions={[{at: 0.2, text: 'Points lost, 2015 → 2025'}]}>
      <HBars x={160} y={300} width={900} max={45} labelW={560} rowH={190} barH={100}
        bars={[
          {label: 'OECD, reading', value: 28, col: color.ink, at: c('P16', '28'), valueText: '−28'},
          {label: 'OECD, maths', value: 22, col: color.ink, at: c('P16', '22'), valueText: '−22'},
          {label: 'Finland, maths', value: 42, col: C_FIN, at: c('P16', 'further,'), valueText: '−42'},
        ]} />
    </PaperShot>
  );
};

export const S17: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot source="University of Jyväskylä (PISA 2022); national PISA reports via Helsinki Times (2003, 2025)"
      cam={[{t: 0, x: 700, y: 600, k: 1.1}, {t: c('P17', 'top'), x: 1250, y: 600, k: 1.1, dur: 1.2}, {t: c('P17', 'seven', 2), x: 960, y: 600, k: 1.0, dur: 1.2}]}
      captions={[{at: 0.2, text: 'Losing the bottom and the top'}]}>
      <Waffle x={250} y={300} cell={36} appear={0.1} col={C_FIN} label="Below baseline, maths"
        states={[{at: c('P17', 'seven'), pct: 7}, {at: c('P17', '2022,'), pct: 25}]} caption={(p) => `${Math.round(p)}%`} />
      <Waffle x={1100} y={300} cell={36} appear={c('P17', 'top') - 0.2} col={C_EST} label="Top levels, maths"
        states={[{at: c('P17', 'twenty-three'), pct: 23}, {at: c('P17', 'seven', 2), pct: 7}]} caption={(p) => `${Math.round(p)}%`} />
    </PaperShot>
  );
};

export const S19a: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 22, lat: 62, k: 0.85}, {t: c('P19', 'Gulf'), lon: 24.5, lat: 60.2, k: 1.25}, {t: c('P19', 'relative'), lon: 25, lat: 59.6, k: 1.45}, {t: pe('P19'), lon: 25, lat: 59.8, k: 1.5}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.1}, {id: ISO.EST, col: color.indigoOnNight, at: c('P19', 'Estonia')}]}
        pulses={[{lon: 25.5, lat: 58.8, at: c('P19', 'Estonia'), col: color.nightText}]} />
      <TopShade />
      <Caption dark items={[{at: 0.2, text: 'The neighbour: Estonia'}]} />
    </AbsoluteFill>
  );
};

/** Original analysis A: Finland vs Estonia. */
export const S19b: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const k06 = c('P19', '2006,');
  const g = {x: 260, y: 380, w: 1050, h: 480, x0: 2004.5, x1: 2026.5, y0: 455, y1: 560};
  const sx = (v: number) => g.x + ((v - g.x0) / (g.x1 - g.x0)) * g.w;
  const k25 = c('P19', '2025,');
  const lead = Math.round(lerp(0, 39, ramp(t, c('P19', 'thirty-nine,'), 0.8)));
  return (
    <PaperShot source="OECD PISA 2006–2025; Estonian Ministry of Education; own analysis"
      cam={[{t: 0, x: 900, y: 600, k: 1.0}, {t: c('P19', 'thirty-three'), x: 760, y: 560, k: 1.1, dur: 1.2}, {t: c('P19', 'level.'), x: 820, y: 600, k: 1.08, dur: 1.2}, {t: k25, x: 1000, y: 600, k: 1.0, dur: 1.2}]}
      captions={[{at: 0.1, text: 'Maths: Finland vs Estonia'}, {at: k25, text: <><span style={{color: C_EST}}>Estonia</span> now leads in all three</>}]}>
      <QuickLine x={g.x} y={g.y} w={g.w} h={g.h} xDomain={[g.x0, g.x1]} yDomain={[g.y0, g.y1]} col={C_EST}
        points={YRS.map((y) => ({x: y, y: EST.math[y]}))} start={k06 + 0.2} dur={1.6} xTicks={[2006, 2012, 2025]} axisAt={0.1}
        vlines={[{x: 2012, label: 'Level', at: c('P19', 'level.'), col: color.inkSoft}]} startLabel={false} />
      <QuickLine x={g.x} y={g.y} w={g.w} h={g.h} xDomain={[g.x0, g.x1]} yDomain={[g.y0, g.y1]} col={C_FIN}
        points={YRS.map((y) => ({x: y, y: FIN.math[y]}))} start={k06 + 0.2} dur={1.6} xTicks={[]} axisAt={0.1} />
      <div style={{position: 'absolute', left: sx(2006) - 250, top: g.y + ((g.y1 - EST.math[2006]) / (g.y1 - g.y0)) * g.h - 30, width: 220, textAlign: 'right',
        fontFamily: font.sans, fontWeight: 800, fontSize: 64, color: C_EST, opacity: ramp(t, k06, 0.3), ...num}}>{EST.math[2006]}</div>
      <div style={{position: 'absolute', left: 1560, top: 470, opacity: ramp(t, k25, 0.4)}}>
        <div style={{fontFamily: font.serif, fontSize: 180, lineHeight: 1, color: C_EST, ...num}}>+{lead}</div>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 48, color: C_EST}}>Estonia, 2025</div>
      </div>
    </PaperShot>
  );
};

export const S21: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="world" keys={[{t: 0, lon: 25, lat: 55, k: 1.6}, {t: c('P21', 'Japan,'), lon: 125, lat: 38, k: 1.9}, {t: c('P21', 'subjects'), lon: 132, lat: 37, k: 2.1}, {t: pe('P21') + 1, lon: 135, lat: 37, k: 2.3}]}
        highlights={[{id: ISO.JPN, col: C_JPN, at: c('P21', 'Japan,') - 0.3, opacity: 0.9}, {id: ISO.FIN, col: C_FIN, at: 0}]}
        pulses={[{lon: 139.7, lat: 35.7, at: c('P21', 'Japan,'), col: color.nightText}]} />
      <TopShade /><BottomShade />
      <Caption dark items={[{at: 0.2, text: 'Top of the OECD, 2025'}, {at: c('P21', 'copy'), text: 'Copy East Asia instead?'}]} />
      <Hero dark value={1} from={1} prefix="#" at={c('P21', 'Japan,')} x={120} y={660} size={200} col={C_JPN} word="Japan: first in all three subjects" align="left" dur={0.1} />
      <SourceTag dark text="OECD, PISA 2025 Country Note: Japan" />
    </AbsoluteFill>
  );
};

// ───────────── ACT 3 ─────────────

export const S22: React.FC = () => {
  const {c} = useCues();
  const k = c('P22', 'Six');
  const names = ['Immigration', 'Phones & pandemic', 'Reading', 'Student-led learning', 'Inequality', 'The legacy'];
  return (
    <PaperShot cam={[{t: 0, x: 960, y: 560, k: 1.06}, {t: c('P22', 'three'), x: 960, y: 580, k: 1.0, dur: 2}, ...beats([c('P22', 'further'), c('P22', 'after')])]}
      captions={[{at: 0.2, text: 'Six suspects'}, {at: c('P22', 'three'), text: 'Why it fell, why more, why after 2006'}]}>
      <CardGrid x={140} y={290} w={1640} cols={3} rowH={200} size={50}
        items={names.map((n, i) => ({text: <><span style={{color: color.inkSoft}}>{i + 1}</span>&nbsp; {n}</>, at: k + 0.2 + i * 0.18}))} />
    </PaperShot>
  );
};

/** Template: suspect scene = caption (name) + focal visual on the left + verdict stamp in its own zone on the right. */
const Suspect: React.FC<{n: number; name: string; source: string; stamp: {mark: '✗' | '△' | '○' | '—'; text: string; at: number}; cam?: CamKey[]; beat?: number[]; children: React.ReactNode}> =
  ({n, name, source, stamp, cam, beat = [], children}) => (
  <PaperShot source={source} cam={cam ?? [{t: 0, x: 960, y: 580, k: 1.04}, ...beats(beat.filter((b) => b < stamp.at - 1)), {t: stamp.at - 0.5, x: 1100, y: 600, k: 1.02, dur: 1}]}
    captions={[{at: 0.1, text: <><span style={{color: color.inkSoft}}>Suspect {n}:</span> {name}</>}]}>
    {children}
    <Stamp mark={stamp.mark} text={stamp.text} at={stamp.at} x={1450} y={900} size={64} />
  </PaperShot>
);

const Arrow: React.FC<{dir: 'down' | 'flat'; col: string; at: number}> = ({dir, col, at}) => {
  const t = useT();
  const p = ramp(t, at, 0.6);
  return (
    <svg width={200} height={200} style={{overflow: 'visible', opacity: p}}>
      {dir === 'down'
        ? <path d={`M100,${20} L100,${20 + 150 * p} M50,${120 + 50 * p - 50} L100,${20 + 150 * p} L150,${120 + 50 * p - 50}`} stroke={col} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d={`M${20},100 L${20 + 160 * p},100 M${130 + 50 * p - 50},50 L${20 + 160 * p},100 L${130 + 50 * p - 50},150`} stroke={col} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

export const S23: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const col = (label: string, dir: 'down' | 'flat', cc: string, at: number, x: number) => (
    <div style={{position: 'absolute', left: x, top: 300, width: 460, textAlign: 'center', opacity: ramp(t, at, 0.4)}}>
      <div style={{display: 'flex', justifyContent: 'center'}}><Arrow dir={dir} col={cc} at={at} /></div>
      <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 56, lineHeight: 1.1, color: cc, marginTop: 30}}>{label}</div>
    </div>
  );
  return (
    <Suspect n={1} name="Immigration" source="Finnish Government, Performance of immigrant students in PISA 2022; Yle"
      stamp={{mark: '✗', text: 'Not the main cause', at: c('P23', 'Not')}} beat={[c('P23', 'without'), c('P23', 'immigrant-background'), c('P23', 'narrowed.')]}>
      {col('No migrant background', 'down', C_FIN, c('P23', 'Scores'), 180)}
      {col('Migrant background (maths)', 'flat', C_EST, c('P23', 'steady'), 720)}
    </Suspect>
  );
};

const MiniLine: React.FC<{vline?: {x: number; label: string; at: number}; start: number; band?: {x0: number; x1: number; label: string; at: number}}> = ({vline, start, band}) => (
  <QuickLine x={200} y={390} w={1000} h={380} xDomain={[2004.5, 2026.5]} yDomain={[455, 560]} labelSize={64}
    points={YRS.map((y) => ({x: y, y: FIN.math[y]}))} start={start} dur={1.2} xTicks={[2006, 2025]} axisAt={start - 0.3}
    vlines={vline ? [vline] : []} band={band} />
);

export const S24: React.FC = () => {
  const {c} = useCues();
  return (
    <Suspect n={2} name="Phones and the pandemic" source="OECD, PISA 2025 Results (Volume I); OECD PISA 2006–2025"
      stamp={{mark: '△', text: 'An accelerant', at: c('P24', 'accelerant,')}} beat={[c('P24', 'correlation,'), c('P24', 'global,')]}>
      <MiniLine start={c('P24', 'slide')} vline={{x: 2020, label: 'COVID-19', at: c('P24', 'COVID-19.')}} />
      <Focal at={c('P24', 'links')} out={c('P24', 'slide') - 0.4} y={560} size={90} text={<>Leisure screen time <span style={{color: C_FIN}}>↔</span> lower scores</>} />
    </Suspect>
  );
};

export const S25: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const kB = c('P25', 'Between');
  const fade = 1 - 0.65 * ramp(t, kB + 1, 2);
  return (
    <Suspect n={3} name="Reading" source="OPH blog (2023); OECD PISA in Focus 2011/8"
      stamp={{mark: '○', text: 'A likely contributor', at: c('P25', 'likely')}} beat={[c('P25', 'pastime'), c('P25', 'enjoyment'), c('P25', 'faster')]}>
      <svg style={{position: 'absolute', left: 390, top: 250, overflow: 'visible', opacity: ramp(t, c('P25', 'agency'), 0.5) * fade, transform: 'scale(0.8)', transformOrigin: 'top left'}} width={600} height={400}>
        <path d="M300,60 C230,20 120,20 40,50 L40,360 C120,330 230,330 300,370 Z" fill="#FBF8F1" stroke={color.ink} strokeWidth={12} strokeLinejoin="round" />
        <path d="M300,60 C370,20 480,20 560,50 L560,360 C480,330 370,330 300,370 Z" fill="#FBF8F1" stroke={color.ink} strokeWidth={12} strokeLinejoin="round" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line x1={80} x2={260} y1={110 + i * 55} y2={105 + i * 55} stroke={color.inkFaint} strokeWidth={10} strokeLinecap="round" />
            <line x1={340} x2={520} y1={105 + i * 55} y2={110 + i * 55} stroke={color.inkFaint} strokeWidth={10} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <Focal at={kB} out={c('P25', 'every') - 0.3} y={680} size={66} col={C_FIN} text="Reading for fun fell faster than the OECD" />
      <Focal at={c('P25', 'every')} y={680} size={66} text={<>Every maths question is a <span style={{color: C_FIN}}>reading test</span></>} />
    </Suspect>
  );
};

export const S26: React.FC = () => {
  const {c} = useCues();
  return (
    <Suspect n={4} name="Student-led learning" source="OPH, National core curriculum for basic education (2014); OECD PISA"
      stamp={{mark: '△', text: 'Possible, not proven', at: c('P26', 'Possible,')}} beat={[c('P26', 'phenomenon-based')]}>
      <MiniLine start={c('P26', 'curriculum')} vline={{x: 2016, label: 'New curriculum', at: c('P26', '2016.')}}
        band={{x0: 2006, x1: 2016, label: 'Already falling', at: c('P26', 'already')}} />
    </Suspect>
  );
};

export const S27: React.FC = () => {
  const {c} = useCues();
  return (
    <Suspect n={5} name="Inequality" source="Finnish Government, PISA 2025"
      stamp={{mark: '—', text: 'A symptom, not a cause', at: c('P27', 'describes')}}>
      <CardGrid x={160} y={270} w={1000} cols={1} rowH={150} gap={28} size={60} items={[
        {text: <>↑ More low performers</>, at: c('P27', 'More'), col: C_FIN},
        {text: <>↓ Fewer top performers</>, at: c('P27', 'fewer'), col: C_EST},
        {text: <>↔ Wider gaps</>, at: c('P27', 'wider')},
      ]} />
    </Suspect>
  );
};

export const S28: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const kA = c('P28', 'argued');
  const kO = c('P28', 'older:');
  return (
    <PaperShot source="Heller Sahlgren, G. (2015) Real Finnish Lessons, Centre for Policy Studies"
      cam={[{t: 0, x: 960, y: 560, k: 1.05}, ...beats([c('P28', '2015,'), c('P28', 'Gabriel'), c('P28', 'celebrated')]), {t: kO, x: 960, y: 560, k: 1.0, dur: 1.5}]}
      captions={[{at: 0.1, text: <><span style={{color: color.inkSoft}}>Suspect 6:</span> The legacy</>}]}>
      <div style={{position: 'absolute', left: 200, top: 290, width: 1520, opacity: ramp(t, kA - 0.2, 0.4) * (1 - ramp(t, kO - 0.5, 0.4))}}>
        <div style={{position: 'absolute', left: -50, top: 10, width: 14, height: 420, background: C_FIN, transform: `scaleY(${ramp(t, kA, 0.8)})`, transformOrigin: 'top'}} />
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 70, lineHeight: 1.15, color: color.ink}}>
          Finland&apos;s rise began <span style={{color: C_EST}}>before</span> its famous reforms took effect.
          <span style={{opacity: ramp(t, c('P28', 'decline'), 0.4)}}> Its decline began <span style={{color: C_FIN}}>soon after</span>.</span>
        </div>
        <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 40, color: color.inkSoft, marginTop: 40}}>Gabriel Heller Sahlgren, Real Finnish Lessons (2015) · summary</div>
      </div>
      <Focal at={kO} y={600} size={96} text={<>Teacher-led classrooms<br /><span style={{color: C_FIN}}>+</span> deep cultural roots</>} />
    </PaperShot>
  );
};

/** Original analysis C: maths by approximate school-entry year. */
export const S29: React.FC = () => {
  const {c} = useCues();
  const yrs = [2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  return (
    <PaperShot source="OECD PISA 2003–2025; school entry at age 7 (InfoFinland). Own analysis"
      cam={[{t: 0, x: 900, y: 600, k: 1.0}, {t: c('P29', 'eight'), x: 850, y: 580, k: 1.05, dur: 1.5}, {t: c('P29', 'best'), x: 800, y: 600, k: 1.08, dur: 1.2}, {t: c('P29', 'late'), x: 700, y: 600, k: 1.1, dur: 1.2}, {t: c('P29', 'early'), x: 900, y: 600, k: 1.05, dur: 1.2}, {t: c('P29', 'fits'), x: 1000, y: 600, k: 1.0, dur: 1}]}
      captions={[{at: 0.1, text: 'Maths score by year of starting school'}]}>
      <QuickLine x={200} y={390} w={1050} h={390} xDomain={[1993, 2019]} yDomain={[455, 560]} labelSize={64}
        points={yrs.map((y) => ({x: y - 8, y: FIN.math[y]}))} start={c('P29', 'shift') + 0.6} dur={1.3} xTicks={[1995, 2017]}
        band={{x0: 1994.5, x1: 1998.5, label: 'Late 1990s: the peak', at: c('P29', 'late')}}
        stepArrowsAt={c('P29', 'early')} />
      <Stamp mark="○" text="Best fit for timing" at={c('P29', 'fits')} x={1480} y={900} size={64} />
    </PaperShot>
  );
};

// ───────────── COUNTERPOINT ─────────────

export const S30: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot source="OECD, PISA 2025 Country Note: Japan (self-reported)"
      cam={[{t: 0, x: 960, y: 580, k: 1.04}, ...beats([c('P30', 'tops'), c('P30', 'push'), c('P30', 'difficult.')]), {t: c('P30', 'Forty-eight'), x: 960, y: 640, k: 1.06, dur: 1.5}]}
      captions={[{at: 0.1, text: 'Japan: top scores, less curiosity'}]}>
      <HBars x={140} y={270} width={900} max={100} labelW={640} rowH={150} barH={84} suffix="%"
        bars={[
          {label: 'Curious · Japan', value: 63, col: C_JPN, at: c('P30', 'sixty-three')},
          {label: 'Curious · OECD', value: 73, col: color.ink, at: c('P30', 'seventy-three')},
          {label: 'Push harder · Japan', value: 48, col: C_JPN, at: c('P30', 'Forty-eight')},
          {label: 'Push harder · OECD', value: 60, col: color.ink, at: c('P30', 'average')},
        ]} />
    </PaperShot>
  );
};

export const S31: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperShot source="Zhao, Y. (2014) Who's Afraid of the Big Bad Dragon? (paraphrase)"
      cam={[{t: 0, x: 960, y: 560, k: 1.05}, ...beats([c('P31', 'Zhao'), c('P31', 'scores')]), {t: c('P31', 'One'), x: 960, y: 560, k: 1.0, dur: 1.2}]}
      captions={[{at: 0.1, text: "The critic's case"}]}>
      <Focal at={c('P31', 'Critics') + 0.4} out={c('P31', 'One') - 0.4} y={580} size={88}
        text={<>Test-driven systems can buy high scores<br />at the cost of <span style={{color: C_FIN}}>creativity</span></>} />
      <Focal at={c('P31', 'One')} y={580} size={104} text={<>One test <span style={{color: C_FIN}}>≠</span> a verdict on a nation</>} />
    </PaperShot>
  );
};

export const S32: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const k = c('P32', 'Sliding');
  return (
    <PaperShot source="OECD PISA 2000, 2025; Finnish Government (rank)"
      cam={[{t: 0, x: 960, y: 560, k: 1.0}, {t: k, x: 960, y: 580, k: 1.06, dur: 2}, ...beats([c('P32', 'crisis'), c('P32', 'capitals,')])]}
      captions={[{at: 0.1, text: 'Still above average everywhere'}, {at: k, text: "Finland's reading rank"}]}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 90,
        opacity: ramp(t, k, 0.4)}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: font.serif, fontSize: 300, lineHeight: 1, color: color.ink}}>#1</div>
          <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 56, color: color.ink}}>2000</div>
        </div>
        <div style={{fontFamily: font.sans, fontWeight: 900, fontSize: 160, color: C_FIN, opacity: ramp(t, k + 0.5, 0.3)}}>→</div>
        <div style={{textAlign: 'center', opacity: ramp(t, k + 0.8, 0.4)}}>
          <div style={{fontFamily: font.serif, fontSize: 300, lineHeight: 1, color: C_FIN}}>=17</div>
          <div style={{fontFamily: font.sans, fontWeight: 800, fontSize: 56, color: C_FIN}}>2025</div>
        </div>
      </div>
    </PaperShot>
  );
};

// ───────────── RESOLUTION / CLOSING ─────────────

export const S33: React.FC = () => {
  const {c} = useCues();
  const kF = c('P33', 'faded.');
  return (
    <PaperShot cam={[{t: 0, x: 700, y: 600, k: 1.08}, {t: c('P33', 'generation'), x: 1250, y: 600, k: 1.08, dur: 1.5}, {t: kF, x: 960, y: 600, k: 1.0, dur: 1.5}, {t: c('P33', 'exported,'), x: 1000, y: 620, k: 1.04, dur: 1.5}]}
      captions={[{at: 0.1, text: 'Copied vs missed'}]}>
      <CardGrid x={140} y={280} w={780} cols={1} rowH={170} gap={30} size={58} items={[
        {text: 'Late school start', at: c('P33', 'late')},
        {text: 'No national tests', at: c('P33', 'missing')},
        {text: 'Freedom for schools', at: c('P33', 'freedom.')},
      ]} />
      <CardGrid x={1000} y={280} w={780} cols={1} rowH={260} gap={30} size={58} dimAt={kF} dimTo={0.25} items={[
        {text: 'A generation that read for pleasure', at: c('P33', 'generation'), col: C_FIN},
        {text: 'Teachers who taught the basics directly', at: c('P33', 'teachers'), col: C_FIN},
      ]} />
    </PaperShot>
  );
};

export const S34: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const qs = [
    {q: 'When were they actually taught?', at: c('P34', 'When')},
    {q: 'What changed before the scores did?', at: c('P34', 'What')},
    {q: "What's happening at the bottom?", at: c('P34', 'what’s')},
  ];
  return (
    <NightShot cam={[{t: 0, x: 960, y: 560, k: 1.05}, {t: qs[2].at, x: 960, y: 600, k: 1.0, dur: 2}]}
      captions={[{at: c('P34', 'headline') - 0.3, text: 'Next time you hear "miracle", ask:'}]}>
      {qs.map((q, i) => (
        <div key={i} style={{position: 'absolute', left: 150, top: 320 + i * 200, whiteSpace: 'nowrap', fontFamily: font.sans, fontWeight: 900, fontSize: 80,
          color: color.nightText, opacity: ramp(t, q.at, 0.4), transform: `translateX(${(1 - ramp(t, q.at, 0.5)) * -40}px)`}}>
          <span style={{color: C_FIN}}>{i + 1}.</span> {q.q}
        </div>
      ))}
    </NightShot>
  );
};

export const S35: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 25, lat: 62, k: 1.3}, {t: c('P35', 'stopped'), lon: 22, lat: 61, k: 0.9}, {t: pe('P36') + 3, lon: 15, lat: 57, k: 0.33}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.1}]} />
      <BottomShade />
      <Focal dark at={c('P35', 'started')} out={c('P36', 'What') - 0.4} y={830} size={96} text={<>It started believing <span style={{color: C_FIN}}>the brochure</span>.</>} />
      <Focal dark at={c('P36', 'What')} y={820} size={78} text={<>What did your school get right<br />that no ranking would ever measure?</>} />
    </AbsoluteFill>
  );
};
