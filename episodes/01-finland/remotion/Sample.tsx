/**
 * 30-second style sample (P02–P03) for the v2 look:
 * male voice, a visual change roughly every 2–3 s, larger type, virtual camera.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import tlJson from '../audio_sample/timeline.json';
import {makeCues, CueProvider, useCues, Timeline} from '../../../engine/timeline';
import {
  Paper, WorldMap, ISO, SourceTag, Line, StatCallout, LineChart, Camera, CircleMarker, Ticker, Pill,
} from '../../../engine/components';
import {useT, ramp} from '../../../engine/anim';
import {color, FPS} from '../../../engine/theme';
import {scores} from './data.gen';

const tl = tlJson as Timeline;
const cues = makeCues(tl);
const M = scores.FIN.math;
const C_FIN = color.vermilion;

// chart geometry in scene space (used by camera focus points)
const CH = {x: 180, y: 250, w: 1320, h: 640, x0: 2004.5, x1: 2026.5, y0: 440, y1: 570};
const px = (yr: number) => CH.x + ((yr - CH.x0) / (CH.x1 - CH.x0)) * CH.w;
const py = (v: number) => CH.y + ((CH.y1 - v) / (CH.y1 - CH.y0)) * CH.h;

/** World mode opener: “They came to see a miracle.” */
const MapOpen: React.FC = () => {
  const {c} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 14, lat: 57, k: 0.45}, {t: 3.2, lon: 25, lat: 62, k: 1.3}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.2}]} />
      <Line dark text="The Finnish miracle" at={c('P02', 'miracle.') - 0.2} x={120} y={430} size={120} weight={600} />
    </AbsoluteFill>
  );
};

/** Paper: 2006 → 548. */
const Miracle: React.FC = () => {
  const {c} = useCues();
  const k548 = c('P02', '548');
  return (
    <Paper>
      <Camera keys={[
        {t: 0, x: 960, y: 540, k: 1.04},
        {t: c('P02', '2006,'), x: 900, y: 520, k: 1.0, dur: 1.5},
        {t: k548, x: 990, y: 560, k: 1.05, dur: 1.0},
        {t: c('P02', 'reformers'), x: 1010, y: 560, k: 1.09, dur: 1.4},
        {t: c('P02', 'destination.'), x: 960, y: 560, k: 1.03, dur: 1.2},
      ]}>
        <Line text="2006" at={c('P02', '2006,')} x={140} y={140} size={150} weight={600} />
        <Line text="Finnish 15-year-olds" at={c('P02', 'Finnish')} x={146} y={320} size={56} serif={false} weight={500} col={color.inkSoft} />
        <Pill text="PISA · Maths" at={c('P02', 'mathematics')} x={146} y={420} size={40} col={color.ink} />
        <StatCallout value={548} from={380} at={k548} dur={1.2} x={1260} y={640} size={330} col={C_FIN} />
        <Line text="World's largest school test" at={c('P02', 'largest')} x={146} y={540} size={50} width={720} />
        <CircleMarker x={1260} y={560} r={330} at={c('P02', 'reformers')} width={7} />
        <Line text="Every reformer's destination" at={c('P02', 'destination.') - 0.3} x={760} y={920} size={58} italic col={C_FIN} width={1000} align="center" />
      </Camera>
      <SourceTag text="OECD, PISA 2006" />
    </Paper>
  );
};

/** Paper: the fall, with the camera riding the head of the line and a running points-lost counter. */
const Fall: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const yrs = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const at = [0.1, c('P03', '541.'), c('P03', '519.'), c('P03', '511.'), c('P03', '507.'), c('P03', '484.'), c('P03', '469.')];
  const kAnd = c('P03', 'And');
  // camera: follow each new point, then pull back for the reveal
  const follow = yrs.slice(0, 6).map((y, i) => ({t: at[i] - 0.3, x: px(y) + 120, y: py(M[y]) + 40, k: 1.45, dur: 1.1}));
  return (
    <Paper>
      <Camera keys={[
        {t: 0, x: px(2006) + 200, y: py(548) + 80, k: 1.6},
        ...follow,
        {t: kAnd, x: 960, y: 560, k: 1.0, dur: 2.2},
        {t: at[6] - 0.2, x: 930, y: 590, k: 1.03, dur: 0.9},
      ]}>
        <LineChart x={CH.x} y={CH.y} w={CH.w} h={CH.h} xDomain={[CH.x0, CH.x1]} yDomain={[CH.y0, CH.y1]} fs={1.7}
          xTicks={[...yrs]} yTicks={[450, 500, 550]} appear={0}
          series={[{id: 'fin', col: C_FIN, width: 9, valueLabels: 'all',
            points: yrs.map((y, i) => ({x: y, y: M[y], at: at[i], big: y === 2006 || y === 2025, labelPos: y === 2025 ? 'right' : 'above'}))}]} />
        <CircleMarker x={px(2025)} y={py(469)} r={46} at={at[6] + 0.4} />
      </Camera>
      {/* HUD (screen-fixed) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, background: `linear-gradient(180deg, ${color.paper} 55%, rgba(244,239,227,0))`}} />
      <div style={{position: 'absolute', left: 64, top: 40, opacity: ramp(t, 0.2, 0.5)}}>
        <Line text="Finland · PISA maths" at={0.2} x={0} y={0} size={64} weight={600} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: `linear-gradient(0deg, ${color.paper} 45%, rgba(244,239,227,0))`}} />
      <Ticker appear={c('P03', 'next.')} x={1860} y={40} size={170} label="Points lost since 2006" signed
        states={[{at: 0, value: 0}, ...yrs.slice(1).map((y, i) => ({at: at[i + 1], value: M[y] - 548}))]} />
      <Line text="Results published September 2026" at={c('P03', 'published')} x={1040} y={960} size={40} serif={false} weight={600}
        col={color.inkSoft} width={820} align="right" />
      <SourceTag text="OECD PISA 2006–2025" />
    </Paper>
  );
};

export const Sample: React.FC = () => {
  const s1 = 0, e1 = cues.word('P02', '2006,') - 0.1; // map → dip → paper
  const s3 = cues.para('P03').start - 0.25;
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      <Sequence from={f(s1)} durationInFrames={f(e1 - s1)}>
        <FadeOut at={e1 - s1 - 0.4}><CueProvider cues={cues} offset={s1}><MapOpen /></CueProvider></FadeOut>
      </Sequence>
      <Sequence from={f(e1)} durationInFrames={f(s3 + 0.5 - e1)}>
        <FadeIn at={0} dur={0.4}><CueProvider cues={cues} offset={e1}><Miracle /></CueProvider></FadeIn>
      </Sequence>
      <Sequence from={f(s3)} durationInFrames={f(tl.duration - s3)}>
        <FadeIn at={0} dur={0.5}><CueProvider cues={cues} offset={s3}><Fall /></CueProvider></FadeIn>
      </Sequence>
      <Audio src={staticFile('narration_sample.wav')} />
      <Audio src={staticFile('bgm_sample.wav')} />
    </AbsoluteFill>
  );
};

const FadeIn: React.FC<{at: number; dur?: number; children: React.ReactNode}> = ({at, dur = 0.5, children}) => {
  const t = useT();
  return <AbsoluteFill style={{opacity: ramp(t, at, dur)}}>{children}</AbsoluteFill>;
};
const FadeOut: React.FC<{at: number; dur?: number; children: React.ReactNode}> = ({at, dur = 0.4, children}) => {
  const t = useT();
  return <AbsoluteFill style={{opacity: 1 - ramp(t, at, dur)}}>{children}</AbsoluteFill>;
};

export const sampleFrames = () => Math.ceil(tl.duration * FPS);
