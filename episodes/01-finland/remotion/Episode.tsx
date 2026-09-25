import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate} from 'remotion';
import tlJson from '../audio/timeline.json';
import {makeCues, CueProvider, Timeline} from '../../../engine/timeline';
import {Paper, Night, TitleCard} from '../../../engine/components';
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
  COUNTERPOINT: {kicker: 'Counterpoint', title: 'Is East Asia the answer?'},
  RESOLUTION: {kicker: 'Resolution', title: 'What the world missed'},
};

const base: SceneDef[] = [
  {id: 'S01', C: S.S01, p: 'P01', mode: 'world'},
  {id: 'S02', C: S.S02, p: 'P02', mode: 'paper', start: cues.word('P02', '548') - 0.3},
  {id: 'S05', C: S.S05, p: 'P05', mode: 'night'},
  {id: 'S06', C: S.S06, p: 'P06', mode: 'world'},
  {id: 'S07', C: S.S07, p: 'P07', mode: 'paper'},
  {id: 'S09', C: S.S09, p: 'P09', mode: 'paper'},
  {id: 'S10', C: S.S10, p: 'P10', mode: 'paper'},
  {id: 'S13', C: S.S13, p: 'P13', mode: 'paper'},
  {id: 'S14', C: S.S14, p: 'P14', mode: 'paper'},
  {id: 'S15', C: S.S15, p: 'P15', mode: 'paper'},
  {id: 'S16', C: S.S16, p: 'P16', mode: 'paper'},
  {id: 'S17', C: S.S17, p: 'P17', mode: 'paper'},
  {id: 'S19a', C: S.S19a, p: 'P19', mode: 'world'},
  {id: 'S19b', C: S.S19b, p: 'P19', mode: 'paper', start: cues.word('P19', '2006,') - 0.6},
  {id: 'S21', C: S.S21, p: 'P21', mode: 'world'},
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
      <TitleCard kicker={kicker} title={title} at={0.1} dark={dark} size={120} />
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

/**
 * Transitions never overlap two scenes (so text never doubles up):
 * same mode → cut (the incoming scene animates its own elements in);
 * mode change → dip through night (out, then in).
 */
const Layer: React.FC<{p: Placed; prev?: Placed; next?: Placed}> = ({p, prev, next}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const dur = p.to - p.from;
  const D = DISSOLVE * 0.8;
  const dipIn = prev && prev.mode !== p.mode;
  const dipOut = next && next.mode !== p.mode;
  const opIn = dipIn ? interpolate(t, [0, D], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) : 1;
  const opOut = dipOut ? interpolate(t, [dur - D, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease}) : 1;
  const ch = CHAPTERS[p.section];
  return (
    <AbsoluteFill style={{opacity: opIn * opOut}}>
      <CueProvider cues={cues} offset={p.from}>
        {p.kind === 'chapter' && ch ? <ChapterCard kicker={ch.kicker} title={ch.title} mode={p.mode} /> : <p.C />}
      </CueProvider>
    </AbsoluteFill>
  );
};

export const Episode: React.FC = () => {
  const placed = layout();
  return (
    <AbsoluteFill style={{backgroundColor: color.night}}>
      {placed.map((p, i) => (
        <Sequence key={p.id} from={Math.round(p.from * FPS)} durationInFrames={Math.max(1, Math.round((p.to - p.from) * FPS))}>
          <Layer p={p} prev={placed[i - 1]} next={placed[i + 1]} />
        </Sequence>
      ))}
      <Audio src={staticFile('narration.wav')} />
      <Audio src={staticFile('bgm.wav')} volume={1} />
    </AbsoluteFill>
  );
};

export const episodeFrames = () => Math.ceil(tl.duration * FPS);
