/**
 * Style sample v4 (P02–P04).
 * Rules: two typefaces, heavy and large; one caption slot + one focal element; captions change rarely;
 * data appears fast (no roll-call of values); constant motion; the eye is led along one path:
 * Helsinki → 548 → start of the line → end of the line → −79.
 */
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import tlJson from '../audio_sample/timeline.json';
import {makeCues, CueProvider, useCues, Timeline} from '../../../engine/timeline';
import {Paper, WorldMap, ISO, SourceTag, Camera, CircleMarker, Caption, QuickLine} from '../../../engine/components';
import {useT, ramp, lerp, fmt} from '../../../engine/anim';
import {color, font, num, FPS} from '../../../engine/theme';
import {scores} from './data.gen';

const tl = tlJson as Timeline;
const cues = makeCues(tl);
const M = scores.FIN.math;
const C_FIN = color.vermilion;
const HEL: [number, number] = [24.94, 60.17];

// chart geometry (scene space)
const CH = {x: 190, y: 300, w: 1080, h: 540, x0: 2004.5, x1: 2026.5, y0: 452, y1: 560};
const px = (v: number) => CH.x + ((v - CH.x0) / (CH.x1 - CH.x0)) * CH.w;
const py = (v: number) => CH.y + ((CH.y1 - v) / (CH.y1 - CH.y0)) * CH.h;
const YRS = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;

/** World mode: visitors' flight paths converge on Helsinki. */
const MapOpen: React.FC = () => {
  const {c} = useCues();
  const origins: [number, number][] = [[-9, 52], [2.3, 48.9], [-3.7, 40.4], [12.5, 41.9], [13.4, 52.5], [21, 52.2], [-25, 60], [4.9, 52.4]];
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic"
        keys={[{t: 0, lon: 12, lat: 55, k: 0.42}, {t: 6.5, lon: 23.5, lat: 61.2, k: 1.05}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: c('P02', 'miracle.') - 0.3, opacity: 0.8}]}
        arcs={origins.map((o, i) => ({from: o, to: HEL, at: 0.1 + i * 0.28, dur: 1.5, col: color.nightText}))}
        pulses={[{lon: HEL[0], lat: HEL[1], at: 1.4, col: color.nightText}]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,15,17,0.85) 0%, rgba(14,15,17,0) 26%)'}} />
      <Caption dark items={[{at: c('P02', 'miracle.') - 0.4, text: 'The Finnish miracle'}]} />
    </AbsoluteFill>
  );
};

/** Paper: 548 → the line → −79, as one continuous shot. */
const Story: React.FC = () => {
  const {c, pe} = useCues();
  const t = useT();
  const k548 = c('P02', '548');
  const kNow = c('P03', 'Then');
  const lineStart = kNow + 0.55;
  const kFall = c('P04', 'That\'s');
  const k79 = c('P04', '79');
  const kYard = c('P04', 'yardstick,');
  const kThree = c('P04', 'three');

  // 548: count-up at centre, then flies to the start of the line
  const fly = ramp(t, kNow, 0.75);
  const bigX = lerp(960, px(2006) - 10, fly);
  const bigY = lerp(650, py(548) - 56, fly);
  const bigSize = lerp(380, 76, fly);
  const count = lerp(380, 548, ramp(t, k548, 1.3));
  const bounce = 1 + 0.06 * Math.sin(Math.min(Math.PI, Math.max(0, t - k548 - 1.1) * 6));

  // −79 bracket in the right-hand zone (never over the line)
  const bx = 1440;
  const br = ramp(t, kFall, 0.5);
  const drop = Math.round(lerp(0, 79, ramp(t, k79, 0.8)));
  const yearTicks = [1, 2, 3].map((n) => py(548 - 22 * n));

  return (
    <Paper>
      <Camera breathe={0.008} keys={[
        {t: 0, x: 960, y: 560, k: 1.08},
        {t: k548, x: 960, y: 560, k: 1.0, dur: 1.4},
        {t: c('P02', 'maths,'), x: 960, y: 570, k: 1.04, dur: 1.2},
        {t: c('P02', 'largest'), x: 960, y: 580, k: 1.07, dur: 1.4},
        {t: kNow, x: 860, y: 580, k: 1.0, dur: 0.8},
        {t: lineStart + 1.3, x: 900, y: 600, k: 1.04, dur: 2},
        {t: c('P03', 'latest'), x: 1050, y: 660, k: 1.12, dur: 1.4},
        {t: kFall - 0.3, x: 990, y: 580, k: 1.0, dur: 0.9},
        {t: kYard, x: 1070, y: 580, k: 1.05, dur: 2},
      ]}>
        {/* 548 hero number (serif), becomes the start label */}
        <div style={{position: 'absolute', left: bigX - 700, top: bigY - bigSize * 0.62, width: 1400, textAlign: 'center',
          fontFamily: fly > 0.5 ? font.sans : font.serif, fontWeight: fly > 0.5 ? 800 : 400, fontSize: bigSize, lineHeight: 1, color: C_FIN,
          opacity: ramp(t, k548 - 0.2, 0.3), transform: `scale(${bounce})`, ...num}}>
          {fmt(Math.round(count))}
        </div>
        <CircleMarker x={960} y={590} r={350} at={c('P02', 'largest')} out={kNow - 0.3} width={8} />
        <div style={{position: 'absolute', left: 960 - 330 * ramp(t, k548 + 1.3, 0.6), top: 790, height: 14, borderRadius: 7,
          width: 660 * ramp(t, k548 + 1.3, 0.6), background: C_FIN, opacity: 1 - ramp(t, c('P02', 'largest') - 0.3, 0.4)}} />

        <QuickLine x={CH.x} y={CH.y} w={CH.w} h={CH.h} xDomain={[CH.x0, CH.x1]} yDomain={[CH.y0, CH.y1]}
          points={YRS.map((y) => ({x: y, y: M[y]}))} start={lineStart} dur={1.3} xTicks={[2006, 2025]} axisAt={kNow + 0.3}
          startLabel={false} endLabelAt={lineStart + 1.2} stepArrowsAt={c('P03', 'lower')}
          dim={{at: kFall, to: 0.35}} />
        <CircleMarker x={px(2025)} y={py(469)} r={48} at={c('P03', '469.')} out={kFall} width={7} />

        {/* the drop, in its own zone */}
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1920} height={1080}>
          <g opacity={ramp(t, kFall, 0.3)}>
            <line x1={px(2006) + 40} x2={bx} y1={py(548)} y2={py(548)} stroke={color.inkFaint} strokeWidth={3} strokeDasharray="10 10" />
            <line x1={bx} x2={bx} y1={py(548)} y2={py(548) + (py(469) - py(548)) * br} stroke={C_FIN} strokeWidth={10} strokeLinecap="round" />
            {yearTicks.map((yy, i) => (
              <line key={i} x1={bx - 26} x2={bx + 26} y1={yy} y2={yy} stroke={C_FIN} strokeWidth={8} strokeLinecap="round"
                opacity={ramp(t, kYard + i * 0.22, 0.25)} />
            ))}
          </g>
        </svg>
        <div style={{position: 'absolute', left: bx + 60, top: py(548) - 10, opacity: ramp(t, k79 - 0.1, 0.3)}}>
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
      </Camera>
      {/* caption slot: few, longer-lasting lines */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${color.paper} 0%, ${color.paper} 17%, rgba(244,239,227,0) 24%)`}} />
      <Caption items={[
        {at: k548, text: "Finland's maths score, 2006"},
        {at: lineStart, text: 'Lower in every round since'},
        {at: k79, text: <>22 points ≈ <span style={{color: C_FIN}}>one year</span> of school</>},
      ]} />
      <SourceTag text={t < kNow ? 'OECD, PISA 2006' : 'OECD PISA 2006–2025; OECD (2026): 22 points ≈ 1 year'} />
    </Paper>
  );
};

export const Sample: React.FC = () => {
  const mapEnd = cues.word('P02', '548') - 0.3;
  const f = (s: number) => Math.round(s * FPS);
  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      <Sequence from={0} durationInFrames={f(mapEnd)}>
        <Fade out={mapEnd - 0.45}><CueProvider cues={cues} offset={0}><MapOpen /></CueProvider></Fade>
      </Sequence>
      <Sequence from={f(mapEnd - 0.05)} durationInFrames={f(tl.duration - mapEnd + 0.05)}>
        <Fade in={0}><CueProvider cues={cues} offset={mapEnd - 0.05}><Story /></CueProvider></Fade>
      </Sequence>
      <Audio src={staticFile('narration_sample.wav')} />
      <Audio src={staticFile('bgm_sample.wav')} />
    </AbsoluteFill>
  );
};

const Fade: React.FC<{in?: number; out?: number; children: React.ReactNode}> = (p) => {
  const t = useT();
  const o = (p.in === undefined ? 1 : ramp(t, p.in, 0.4)) * (p.out === undefined ? 1 : 1 - ramp(t, p.out, 0.4));
  return <AbsoluteFill style={{opacity: o}}>{p.children}</AbsoluteFill>;
};

export const sampleFrames = () => Math.ceil(tl.duration * FPS);
