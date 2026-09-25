import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';
import tlJson from '../audio/timeline.json';
import {makeCues, CueProvider, Timeline} from '../../../engine/timeline';
import {ChapterLabel, Paper, Night, TitleCard} from '../../../engine/components';
import {color, FPS, DISSOLVE, ease} from '../../../engine/theme';
import * as S from './scenes';

const tl = tlJson as Timeline;
export const cues = makeCues(tl);

type Mode = 'paper' | 'world' | 'night';
type SceneDef = {id: string; C: React.FC; p: string; mode: Mode; start?: number};

const CHAPTERS: Record<string, {kicker: string; title: string} | undefined> = {
  SETUP: {kicker: 'Setup', title: 'The scoreboard'},
  'ACT 1 — THE MIRACLE': {kicker: 'Act 1', title: 'The miracle'},
  'ACT 2 — THE FALL': {kicker: 'Act 2', title: 'The fall'},
  'ACT 3 — WHY?': {kicker: 'Act 3', title: 'Six suspects'},
  COUNTERPOINT: {kicker: 'Counterpoint', title: 'So is East Asia right?'},
  RESOLUTION: {kicker: 'Resolution', title: 'What the world missed'},
};
const LABEL: Record<string, string> = {
  SETUP: 'Setup', 'ACT 1 — THE MIRACLE': 'Act 1 · The miracle', 'ACT 2 — THE FALL': 'Act 2 · The fall',
  'ACT 3 — WHY?': 'Act 3 · Why?', COUNTERPOINT: 'Counterpoint', RESOLUTION: 'Resolution', CLOSING: '',
};

const base: SceneDef[] = [
  {id: 'S01', C: S.S01, p: 'P01', mode: 'world'},
  {id: 'S02', C: S.S02, p: 'P02', mode: 'paper'},
  {id: 'S03', C: S.S03, p: 'P03', mode: 'paper'},
  {id: 'S05', C: S.S05, p: 'P05', mode: 'night'},
  {id: 'S06', C: S.S06, p: 'P06', mode: 'world'},
  {id: 'S07', C: S.S07, p: 'P07', mode: 'paper'},
  {id: 'S08', C: S.S08, p: 'P08', mode: 'paper'},
  {id: 'S09', C: S.S09, p: 'P09', mode: 'paper'},
  {id: 'S10', C: S.S10, p: 'P10', mode: 'paper'},
  {id: 'S12', C: S.S12, p: 'P12', mode: 'paper'},
  {id: 'S13', C: S.S13, p: 'P13', mode: 'paper'},
  {id: 'S14', C: S.S14, p: 'P14', mode: 'paper'},
  {id: 'S15', C: S.S15, p: 'P15', mode: 'paper'},
  {id: 'S15b', C: S.S15b, p: 'P15b', mode: 'paper'},
  {id: 'S16', C: S.S16, p: 'P16', mode: 'paper'},
  {id: 'S17', C: S.S17, p: 'P17', mode: 'paper'},
  {id: 'S18', C: S.S18, p: 'P18', mode: 'paper'},
  {id: 'S19a', C: S.S19a, p: 'P19', mode: 'world'},
  {id: 'S19b', C: S.S19b, p: 'P19', mode: 'paper', start: cues.word('P19', '2006,') - 0.7},
  {id: 'S21', C: S.S21, p: 'P21', mode: 'paper'},
  {id: 'S22', C: S.S22, p: 'P22', mode: 'paper'},
  {id: 'S23', C: S.S23, p: 'P23', mode: 'paper'},
  {id: 'S24', C: S.S24, p: 'P24', mode: 'paper'},
  {id: 'S25', C: S.S25, p: 'P25', mode: 'paper'},
  {id: 'S26', C: S.S26, p: 'P26', mode: 'paper'},
  {id: 'S27', C: S.S27, p: 'P27', mode: 'paper'},
  {id: 'S28', C: S.S28, p: 'P28', mode: 'paper'},
  {id: 'S29', C: S.S29, p: 'P29', mode: 'paper'},
  {id: 'S30', C: S.S30, p: 'P30', mode: 'paper'},
  {id: 'S31', C: S.S31, p: 'P31', mode: 'paper'},
  {id: 'S32', C: S.S32, p: 'P32', mode: 'paper'},
  {id: 'S33', C: S.S33, p: 'P33', mode: 'paper'},
  {id: 'S34', C: S.S34, p: 'P34', mode: 'night'},
  {id: 'S35', C: S.S35, p: 'P35', mode: 'world'},
];

/** Chapter title cards live in the long pauses between sections. */
const ChapterCard: React.FC<{kicker: string; title: string; mode: Mode}> = ({kicker, title, mode}) => {
  const dark = mode !== 'paper';
  const Bg = dark ? Night : Paper;
  return (
    <Bg>
      <TitleCard kicker={kicker} title={title} at={0.35} dark={dark} size={110} />
    </Bg>
  );
};

export type Placed = SceneDef & {from: number; to: number; section: string; kind: 'scene' | 'chapter'};

/** Resolve absolute start/end times for every scene and chapter card. */
export const layout = (): Placed[] => {
  const out: Placed[] = [];
  base.forEach((s, i) => {
    const para = cues.para(s.p);
    const prevPara = i > 0 ? cues.para(base[i - 1].p) : null;
    const sectionChange = prevPara && prevPara.section !== para.section && CHAPTERS[para.section];
    let from = s.start ?? (i === 0 ? 0 : para.start - 0.3);
    if (sectionChange && prevPara) {
      // chapter card fills the pause between the previous paragraph and this one
      const cFrom = prevPara.end + 0.35;
      out.push({id: 'CH-' + s.id, C: () => null, p: s.p, mode: s.mode, from: cFrom, to: para.start - 0.15, section: para.section, kind: 'chapter'});
      from = para.start - 0.15;
    }
    out.push({...s, from, to: 0, section: para.section, kind: 'scene'});
  });
  for (let i = 0; i < out.length; i++) out[i].to = i + 1 < out.length ? out[i + 1].from : tl.duration;
  return out;
};

const Layer: React.FC<{p: Placed; prev?: Placed; next?: Placed}> = ({p, prev, next}) => {
  const f = useCurrentFrame();
  const t = f / FPS; // local, relative to seqFrom
  const seqFrom = Math.max(0, p.from - DISSOLVE);
  const dur = p.to - seqFrom;
  const dipIn = prev && prev.mode !== p.mode; // mode switch = dip through night
  const dipOut = next && next.mode !== p.mode;
  const inStart = p.from - seqFrom - (dipIn ? 0 : DISSOLVE) ;
  const opIn = !prev ? 1 : interpolate(t, [inStart, inStart + DISSOLVE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const opOut = dipOut ? interpolate(t, [dur - DISSOLVE, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) : 1;
  const label = LABEL[p.section];
  const ch = CHAPTERS[p.section];
  return (
    <AbsoluteFill style={{opacity: opIn * opOut}}>
      <CueProvider cues={cues} offset={seqFrom}>
        {p.kind === 'chapter' && ch ? <ChapterCard kicker={ch.kicker} title={ch.title} mode={p.mode} /> : <p.C />}
      </CueProvider>
      {p.kind === 'scene' && label ? <ChapterLabel text={label} dark={p.mode !== 'paper'} /> : null}
    </AbsoluteFill>
  );
};

export const Episode: React.FC = () => {
  const placed = layout();
  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      {placed.map((p, i) => {
        const seqFrom = Math.max(0, p.from - DISSOLVE);
        return (
          <Sequence key={p.id} from={Math.round(seqFrom * FPS)} durationInFrames={Math.max(1, Math.round((p.to - seqFrom + (placed[i + 1] && placed[i + 1].mode === p.mode ? DISSOLVE : 0)) * FPS))}>
            <Layer p={p} prev={placed[i - 1]} next={placed[i + 1]} />
          </Sequence>
        );
      })}
      <Audio src={staticFile('narration.wav')} />
      <Audio src={staticFile('bgm.wav')} volume={1} />
    </AbsoluteFill>
  );
};

export const episodeFrames = () => Math.ceil(tl.duration * FPS);
