import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  Paper, Night, SourceTag, StatCallout, TitleCard, Line, QuoteCard, VerdictCard, Waffle, HBars,
  LineChart, EraTimeline, WorldMap, ISO,
} from '../../../engine/components';
import {useT, ramp, fade, drift} from '../../../engine/anim';
import {useCues} from '../../../engine/timeline';
import {color, font, num} from '../../../engine/theme';
import {scores} from './data.gen';

const FIN = scores.FIN, EST = scores.EST, JPN = scores.JPN, OECD = scores.OECD;
const C_FIN = color.vermilion; // Finland: fixed for the episode
const C_EST = color.indigo; // Estonia
const C_JPN = color.ochre; // Japan
const C_OECD = color.ink; // OECD average: neutral

/** Paper scene wrapper with a slow push-in so nothing is ever static. */
const PaperScene: React.FC<{children: React.ReactNode; source?: string}> = ({children, source}) => {
  const t = useT();
  return (
    <Paper>
      <AbsoluteFill style={{transform: `scale(${drift(t, 0.03, 30)})`, transformOrigin: '50% 55%'}}>{children}</AbsoluteFill>
      {source && <SourceTag text={source} />}
    </Paper>
  );
};
const NightScene: React.FC<{children: React.ReactNode; source?: string}> = ({children, source}) => {
  const t = useT();
  return (
    <Night>
      <AbsoluteFill style={{transform: `scale(${drift(t, 0.03, 30)})`}}>{children}</AbsoluteFill>
      {source && <SourceTag text={source} dark />}
    </Night>
  );
};

// ───────────────────────── COLD OPEN ─────────────────────────

export const S01: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic"
        keys={[{t: 0, lon: 12, lat: 56, k: 0.32}, {t: c('P01', 'Helsinki'), lon: 22, lat: 60, k: 0.7}, {t: pe('P01') + 1, lon: 25, lat: 60.6, k: 1.25}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: c('P01', 'Helsinki')}]}
        labels={[{lon: 24.94, lat: 59.4, text: 'HELSINKI', at: c('P01', 'Helsinki') + 0.4, size: 28}]} />
      <Line dark text="Early 2000s" at={c('P01', 'early')} out={c('P01', 'sixteen')} x={120} y={260} size={30} serif={false} weight={600} col={color.nightSoft} />
      <Line dark text="Ministers · principals · consultants" at={c('P01', 'Education')} out={c('P01', 'sixteen')} x={120} y={310} size={46} />
      <Line dark text="What did Finland know?" at={c('P01', 'knew')} out={c('P01', 'sixteen')} x={120} y={420} size={46} italic col={C_FIN} />
      <StatCallout dark value={16000} from={0} at={c('P01', 'sixteen')} suffix="+" label="International visitors hosted by Finland's education agency"
        x={120} y={330} align="left" size={140} out={c('P01', 'charging')} />
      <StatCallout dark value={1485} from={0} at={c('P01', 'one thousand')} prefix="€" label="Price of one school visit today" x={120} y={330} align="left" size={140} col={color.nightText} />
      <Line dark text="+ VAT" at={c('P01', 'VAT.')} x={128} y={450} size={54} serif={false} weight={600} col={C_FIN} />
      <SourceTag dark text="Finnish National Agency for Education (OPH)" opacity={1} />
    </AbsoluteFill>
  );
};

export const S02: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD, PISA 2006 (via OECD Education GPS)">
      <Line text="PISA 2006 · Mathematics · Finland" at={0.3} y={260} align="center" x={160} serif={false} size={34} weight={600} col={color.inkSoft} />
      <StatCallout value={548} from={400} at={c('P02', '548')} y={560} size={260} col={C_FIN} />
      <Line text="On the world's largest school test" at={c('P02', 'largest')} y={690} align="center" x={160} serif={false} size={32} col={color.inkSoft} />
      <Line text="The number reformers flew in to study" at={c('P02', 'destination.') - 0.6} y={780} align="center" x={160} size={40} italic col={color.inkSoft} />
    </PaperScene>
  );
};

/** P03–P04: the fall, point by point, then the −79 bracket and the “years of learning” ruler. */
export const S03: React.FC = () => {
  const {c} = useCues();
  const m = FIN.math;
  const yrs = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const cuesAt = [0.2, c('P03', '541.'), c('P03', '519.'), c('P03', '511.'), c('P03', '507.'), c('P03', '484.'), c('P03', '469.')];
  const t = useT();
  const k79 = c('P04', '79');
  const kYard = c('P04', '22');
  const kYears = c('P04', 'three');
  const blockH = (22 / 130) * 640;
  return (
    <PaperScene source="OECD PISA 2006–2025; OECD PISA 2025 press release (22 pts ≈ 1 year)">
      <LineChart x={220} y={220} w={1040} h={640} xDomain={[2004.5, 2026.5]} yDomain={[440, 570]} xTicks={[...yrs]} yTicks={[450, 475, 500, 525, 550]}
        yLabel="Maths score" appear={0}
        series={[{id: 'fin', col: C_FIN, valueLabels: 'all',
          points: yrs.map((y, i) => ({x: y, y: m[y], at: cuesAt[i], big: y === 2025 || y === 2006, labelPos: y === 2025 ? 'below' : 'above'}))}]} />
      {/* −79 bracket */}
      <div style={{position: 'absolute', left: 1400, top: 220 + (570 - 548) / 130 * 640, width: 4, background: C_FIN,
        height: ((548 - 469) / 130) * 640 * ramp(t, k79, 0.8), opacity: ramp(t, k79, 0.3)}} />
      <Line text="−79" at={k79} x={1430} y={220 + ((570 - 520) / 130) * 640} size={96} weight={600} col={C_FIN} serif />
      <Line text="points" at={k79 + 0.2} x={1436} y={220 + ((570 - 520) / 130) * 640 + 110} size={32} serif={false} col={color.inkSoft} />
      {/* yardstick blocks: 22 pts ≈ 1 year */}
      {[0, 1, 2, 3].map((i) => {
        const hBlock = i < 3 ? blockH : ((79 - 66) / 130) * 640;
        const top = 220 + ((570 - 548) / 130) * 640 + i * blockH;
        const at = kYard + i * 0.45;
        return (
          <div key={i} style={{position: 'absolute', left: 1640, top, width: 120, height: hBlock - 6, background: i < 3 ? color.ink : color.inkFaint,
            opacity: ramp(t, at, 0.4), borderRadius: 3, color: color.paper, fontFamily: font.sans, fontSize: 24, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i < 3 ? `year ${i + 1}` : ''}</div>
        );
      })}
      <Line text="≈ 22 pts = 1 year" at={kYard} x={1600} y={170} size={28} serif={false} weight={600} width={300} align="center" />
      <Line text="≈ 3+ years behind 2006" at={kYears} x={1380} y={900} size={36} serif={false} weight={600} col={C_FIN} width={520} align="center" />
    </PaperScene>
  );
};

export const S05: React.FC = () => {
  const {c} = useCues();
  const kW = c('P05', 'wrong');
  return (
    <NightScene>
      <Line dark text="Phones" at={c('P05', 'phones,')} x={0} width={1920} align="center" y={250} size={76} strikeAt={kW} strikeCol={color.ochre} />
      <Line dark text="The pandemic" at={c('P05', 'pandemic,')} x={0} width={1920} align="center" y={370} size={76} strikeAt={kW + 0.25} strikeCol={color.ochre} />
      <Line dark text="Immigration" at={c('P05', 'immigration.')} x={0} width={1920} align="center" y={490} size={76} strikeAt={kW + 0.5} strikeCol={color.ochre} />
      <Line dark text="Wrong, or incomplete" at={kW + 0.6} out={c('P05', 'copied')} x={0} width={1920} align="center" y={660} size={36} serif={false} col={color.ochre} />
      <Line dark text="…and did Finland misread itself?" at={c('P05', 'itself.')} out={c('P05', 'test')} x={0} width={1920} align="center" y={790} size={40} serif={false} col={C_FIN} />
      <Line dark text="Six suspects. One dataset." at={c('P05', 'test')} x={0} width={1920} align="center" y={790} size={40} serif={false} weight={600} col={color.nightText} />
      <Line dark text="What did the world actually copy?" at={c('P05', 'copied')} x={0} width={1920} align="center" y={700} size={52} italic col={color.nightText} />
    </NightScene>
  );
};

// ───────────────────────── SETUP ─────────────────────────

export const S06: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="world" keys={[{t: 0, lon: 10, lat: 25, k: 1.0}, {t: pe('P06') + 1, lon: 20, lat: 35, k: 1.18}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.3}]} />
      <Line dark text="PISA" at={0.2} x={120} y={150} size={64} weight={600} />
      <Line dark text="Programme for International Student Assessment" at={c('P06', 'Programme')} out={c('P06', 'fifteen-year-olds')} x={120} y={240} size={34} serif={false} col={color.nightSoft} />
      <Line dark text="Every ~3 years since 2000" at={c('P06', 'three')} x={120} y={300} size={34} serif={false} col={color.nightSoft} />
      <Line dark text="An imperfect instrument: limits later" at={c('P06', 'perfect')} x={120} y={820} size={30} serif={false} col={color.ochre} />
      <Line dark text="15-year-olds · reading · maths · science" at={c('P06', 'fifteen-year-olds')} x={120} y={240} size={34} serif={false} col={color.nightSoft} />
      <StatCallout dark value={91} from={0} at={c('P06', 'ninety-one')} label="Countries and economies, 2025" x={120} y={620} align="left" size={150} />
      <StatCallout dark value={760000} from={0} at={c('P06', 'seven')} prefix="≈" label="Students tested" x={1000} y={620} align="left" size={120} />
      <SourceTag dark text="OECD, PISA 2025 Results (Volume I)" />
    </AbsoluteFill>
  );
};

export const S07: React.FC = () => {
  const {c} = useCues();
  const kR = c('P07', 'recite');
  return (
    <PaperScene>
      <Line text="Not the test" at={kR} x={200} y={210} size={30} serif={false} weight={600} col={color.inkSoft} />
      <Line text="Reciting a syllabus" at={kR} x={200} y={260} size={60} strikeAt={kR + 0.8} />
      <Line text="The test" at={c('P07', 'use')} x={1000} y={210} size={30} serif={false} weight={600} col={color.inkSoft} />
      <Line text="Using knowledge on unseen problems" at={c('P07', 'use')} x={1000} y={260} size={60} width={760} col={color.indigo} />
      <Line text="Hard to cram. Easy to headline." at={c('P07', 'cram')} x={200} y={470} size={44} italic col={color.inkSoft} />
      <Line text="Bad score → a minister out" at={c('P07', 'sink')} x={200} y={640} size={48} serif={false} />
      <Line text="Good score → a consulting industry" at={c('P07', 'launch')} x={200} y={730} size={48} serif={false} />
    </PaperScene>
  );
};

export const S08: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD, PISA 2025 press release">
      <Line text="How big is a PISA point?" at={0.2} x={160} y={170} size={60} weight={600} />
      <EraTimeline x={200} y={560} w={1520} range={[0, 85]} ticks={[0, 20, 40, 60, 80]} appear={0.3}
        bands={[{from: 10, to: 15, label: 'meaningful', at: c('P08', 'ten'), col: color.indigo}]}
        markers={[
          {year: 22, label: '≈ 1 year of school', at: c('P08', 'twenty-two'), col: color.ink},
          {year: 79, label: 'Finland since 2006: 79', at: c('P08', 'eighty'), col: C_FIN, level: 1},
        ]} />
    </PaperScene>
  );
};

// ───────────────────────── ACT 1 ─────────────────────────

export const S09: React.FC = () => {
  const {c} = useCues();
  const tile = (x: number, lab: string, v: number, at: number) => (
    <StatCallout value={v} from={400} at={at} label={lab} x={x} y={790} size={130} col={C_FIN} />
  );
  return (
    <PaperScene source="OECD PISA 2000, 2006; Finnish Ministry of Education and Culture">
      <Line text="PISA 2000 · Reading" at={c('P09', 'December')} x={160} y={150} size={32} serif={false} weight={600} col={color.inkSoft} />
      <Line text={<><span style={{color: C_FIN}}>Finland</span> — top of the world</>} at={c('P09', 'top')} x={160} y={200} size={72} weight={600} />
      <Line text="546" at={c('P09', '546')} x={1500} y={170} size={120} weight={600} col={C_FIN} width={300} align="right" />
      <Line text="PISA 2006" at={c('P09', '2006,')} x={160} y={470} size={32} serif={false} weight={600} col={color.inkSoft} />
      {tile(480, 'Reading', 547, c('P09', '547'))}
      {tile(960, 'Maths', 548, c('P09', '548'))}
      {tile(1440, 'Science', 563, c('P09', '563'))}
    </PaperScene>
  );
};

/** P10–P11: the visible features. */
export const S10: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const cards = [
    {k: 'School starts at 7', at: c('P10', 'seven.')},
    {k: 'No national test until age 18–19', at: c('P10', 'standardised')},
    {k: 'School inspectors abolished', at: c('P10', 'inspectors')},
    {k: "Teachers need a master's degree", at: c('P10', "master's")},
  ];
  const kModel = c('P11', 'shorthand');
  const kFrame = c('P11', 'Here');
  return (
    <PaperScene source="InfoFinland; OPH; OECD (2010) Finland: Slow and Steady Reform">
      <Line text="What the visitors saw" at={0.2} x={160} y={140} size={58} weight={600} />
      <Line text="A system that seemed to break every rule" at={c('P10', 'embarrass')} x={160} y={215} size={32} serif={false} col={color.inkSoft} />
      <Line text="The perfect story for tired reformers" at={c('P11', 'perfect')} out={c('P11', 'shorthand') - 0.3} x={0} width={1920} align="center" y={910} size={40} italic col={color.inkSoft} />
      <Line text="…and it still won." at={c('P11', 'won.')} out={c('P11', 'perfect') - 0.3} x={0} width={1920} align="center" y={910} size={40} italic col={color.inkSoft} />
      <Line text="Test less · start later · trust teachers" at={c('P11', 'tested')} out={c('P11', 'shorthand') - 0.3} x={0} width={1920} align="center" y={830} size={48} serif={false} weight={600} col={C_FIN} />
      {cards.map((cd, i) => (
        <div key={i} style={{position: 'absolute', left: 160 + (i % 2) * 820, top: 300 + Math.floor(i / 2) * 250, width: 760, height: 200,
          border: `3px solid ${color.ink}`, borderRadius: 10, background: 'rgba(255,255,255,0.35)', opacity: fade(t, cd.at),
          transform: `translateY(${(1 - ramp(t, cd.at, 0.6)) * 20}px)`, display: 'flex', alignItems: 'center', padding: '0 44px', boxSizing: 'border-box'}}>
          <div style={{fontFamily: font.serif, fontSize: 50, color: color.ink}}>{cd.k}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 130, top: 270, width: 1660, height: 520, border: `4px solid ${C_FIN}`, borderRadius: 16,
        opacity: ramp(t, kFrame, 0.6)}} />
      <Line text="“The Finnish model”" at={kModel} x={0} width={1920} align="center" y={830} size={62} italic col={C_FIN} />
    </PaperScene>
  );
};

export const S12: React.FC = () => {
  const {c} = useCues();
  const kB = c('P12', 'because:');
  const kC = c('P12', 'concluded');
  return (
    <PaperScene>
      <Line text="Few tests" at={c('P12', 'few')} out={kC - 0.2} x={0} width={960} align="center" y={380} size={80} />
      <Line text="High scores" at={c('P12', 'highly.')} out={kC - 0.2} x={960} width={960} align="center" y={380} size={80} />
      <Line text="because" at={kB} out={c('P12', 'Finland', 1) - 0.2} x={0} width={1920} align="center" y={560} size={90} italic weight={600} col={C_FIN} />
      <Line text={<>High scores <span style={{color: C_FIN, fontStyle: 'italic'}}>because</span> few tests<span style={{color: C_FIN}}>?</span></>}
        at={kC} x={0} width={1920} align="center" y={430} size={96} />
    </PaperScene>
  );
};

export const S13: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD (2010) Finland: Slow and Steady Reform; school entry at age 7 (InfoFinland)">
      <Line text="Who sat the 2006 test?" at={0.2} x={160} y={140} size={58} weight={600} />
      <Line text="1990s: the rules change" at={c('P13', '1990s,')} out={c('P13', 'disappeared') - 0.3} x={0} width={1920} align="center" y={880} size={40} serif={false} weight={600} col={color.ochre} />
      <Line text="Inspections ✗ · Pre-approved materials ✗" at={c('P13', 'disappeared')} out={c('P13', 'Rules', 2) - 0.3} x={0} width={1920} align="center" y={880} size={40} serif={false} weight={600} col={color.ochre} />
      <Line text="New rules, old habits" at={c('P13', 'older,')} x={0} width={1920} align="center" y={880} size={44} italic col={color.indigo} />
      <Line text="Rules change fast. Classrooms don't." at={c('P13', 'Rules', 2)} out={c('P13', 'older,') - 0.3} x={0} width={1920} align="center" y={880} size={44} italic col={color.inkSoft} />
      <Line text="Remember: 1998" at={c('P13', 'date')} x={1300} y={150} size={44} weight={600} col={color.ochre} width={500} align="right" />
      <EraTimeline x={180} y={600} w={1560} range={[1970, 2010]} ticks={[1970, 1980, 1990, 2000, 2010]} appear={0.3}
        bands={[
          {from: 1970, to: 1990, label: 'Centralised system: where their teachers trained', at: c('P13', 'teachers'), col: color.indigo},
          {from: 1990, to: 2000, label: 'Decentralisation: inspections go, local curricula (1994)', at: c('P13', 'freedom'), col: color.ochre},
        ]}
        markers={[
          {year: 2006, label: 'Tested 2006', at: c('P13', 'test'), col: C_FIN, level: 1},
          {year: 1991, label: 'Born ≈1991', at: c('P13', 'born'), col: color.ink},
          {year: 1998, label: 'Start school ≈1998', at: c('P13', 'started'), col: color.ink, level: 2},
        ]} />
    </PaperScene>
  );
};

// ───────────────────────── ACT 2 ─────────────────────────

export const S14: React.FC = () => {
  const {c} = useCues();
  const m = FIN.math;
  const yrs = [2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const d0 = c('P14', 'down');
  const d1 = c('P14', '469');
  const at = [c('P14', '544'), c('P14', '548'), ...[1, 2, 3, 4, 5].map((i) => d0 + ((d1 - d0) * i) / 6), d1];
  return (
    <PaperScene source="OECD PISA 2003–2025">
      <Line text="Finland · PISA maths, every round" at={0.2} x={160} y={120} size={50} weight={600} />
      <LineChart x={260} y={260} w={1380} h={600} xDomain={[2002, 2026.5]} yDomain={[440, 570]} xTicks={[...yrs]} yTicks={[450, 475, 500, 525, 550]}
        appear={0.3} yLabel="Score"
        series={[{id: 'fin', col: C_FIN, valueLabels: 'all', points: yrs.map((y, i) => ({x: y, y: m[y], at: at[i], big: y === 2006 || y === 2025, labelPos: 'above'}))}]} />
    </PaperScene>
  );
};

/** P15: three subjects as small multiples, 2006 → 2025. */
export const S15: React.FC = () => {
  const {c} = useCues();
  const kO = c('P15', 'OECD');
  const panel = (i: number, name: string, a: number, b: number, oecd: number, at: number, note: string, noteAt: number) => (
    <React.Fragment key={name}>
      <Line text={name} at={at - 0.3} x={150 + i * 580} y={200} size={46} weight={600} />
      <LineChart x={200 + i * 580} y={330} w={380} h={460} xDomain={[2004, 2027]} yDomain={[440, 580]} xTicks={[2006, 2025]} yTicks={i === 0 ? [450, 500, 550] : []}
        appear={at - 0.3}
        series={[
          {id: 'o', col: C_OECD, dashed: true, width: 3, points: [{x: 2025, y: oecd, at: kO, label: `OECD ${oecd}`, labelPos: 'left'}]},
          {id: 'f', col: C_FIN, valueLabels: 'all', points: [{x: 2006, y: a, at}, {x: 2025, y: b, at: at + 1.2, labelPos: 'right'}]},
        ]} />
      <Line text={note} at={noteAt} x={150 + i * 580} y={880} size={30} serif={false} weight={600} col={C_FIN} width={500} />
    </React.Fragment>
  );
  return (
    <PaperScene source="OECD PISA 2006, 2025; Finnish Government (ranks)">
      {panel(0, 'Reading', 547, FIN.reading[2025], OECD.reading[2025], c('P15', '547'), 'Joint 17th, with Italy', c('P15', 'Italy,'))}
      {panel(1, 'Maths', 548, FIN.math[2025], OECD.math[2025], c('P15', 'Science') - 0.8, '', 0)}
      {panel(2, 'Science', 563, FIN.science[2025], OECD.science[2025], c('P15', '563'), '12th in the world', c('P15', 'twelfth'))}
      <Line text="The fall is real. So is the altitude." at={c('P15', 'altitude.') - 0.8} x={0} width={1920} align="center" y={950} size={34} italic col={color.inkSoft} />
    </PaperScene>
  );
};

/** Dot-gap chart: Finland vs OECD average, 2025 (honest axis, both dots shown). */
const DotGap: React.FC<{rows: {name: string; fin: number; oecd: number; at: number; finAt?: number}[]; y: number}> = ({rows, y}) => {
  const t = useT();
  const x0 = 520, w = 1100, lo = 440, hi = 520;
  const sx = (v: number) => x0 + ((v - lo) / (hi - lo)) * w;
  return (
    <>
      {[440, 460, 480, 500, 520].map((v) => (
        <div key={v} style={{position: 'absolute', left: sx(v) - 40, width: 80, top: y + rows.length * 150 + 10, textAlign: 'center', fontFamily: font.sans, fontSize: 22, color: color.inkSoft, ...num}}>{v}</div>
      ))}
      {rows.map((r, i) => {
        const o = ramp(t, r.at, 0.6);
        const of = ramp(t, r.finAt ?? r.at + 0.6, 0.6);
        const top = y + i * 150;
        return (
          <div key={r.name} style={{opacity: o}}>
            <div style={{position: 'absolute', left: 160, top: top + 18, width: 320, textAlign: 'right', fontFamily: font.serif, fontSize: 46, color: color.ink}}>{r.name}</div>
            <div style={{position: 'absolute', left: x0, top: top + 48, width: w, height: 2, background: color.inkFaint}} />
            <div style={{position: 'absolute', left: sx(r.oecd), top: top + 48 - 3, width: (sx(r.fin) - sx(r.oecd)) * of, height: 8, background: color.inkFaint}} />
            <div style={{position: 'absolute', left: sx(r.oecd) - 14, top: top + 35, width: 28, height: 28, borderRadius: 14, background: C_OECD}} />
            <div style={{position: 'absolute', left: sx(r.oecd) - 90, top: top - 18, width: 180, textAlign: 'center', fontFamily: font.sans, fontSize: 22, color: color.inkSoft, ...num}}>OECD {r.oecd}</div>
            <div style={{position: 'absolute', left: sx(r.fin) - 14, top: top + 35, width: 28, height: 28, borderRadius: 14, background: C_FIN, opacity: of}} />
            <div style={{position: 'absolute', opacity: of, left: sx(r.fin) + 26, top: top + 28, fontFamily: font.sans, fontSize: 32, fontWeight: 600, color: C_FIN, ...num}}>
              {r.fin} <span style={{fontSize: 26, color: color.inkSoft, fontWeight: 500}}>(+{r.fin - r.oecd})</span>
            </div>
          </div>
        );
      })}
    </>
  );
};

export const S15b: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD, PISA 2025 Results (Volume I)">
      <Line text={<><span style={{color: C_FIN}}>Finland</span> vs OECD average, 2025</>} at={0.2} x={160} y={140} size={54} weight={600} />
      <DotGap y={330} rows={[
        {name: 'Maths', fin: FIN.math[2025], oecd: OECD.math[2025], at: c('P15b', 'maths,'), finAt: c('P15b', '469.')},
        {name: 'Reading', fin: FIN.reading[2025], oecd: OECD.reading[2025], at: c('P15b', 'reading,')},
        {name: 'Science', fin: FIN.science[2025], oecd: OECD.science[2025], at: c('P15b', 'science')},
      ]} />
      <Line text="Once the benchmark. Now near the middle." at={c('P15b', 'world')} x={160} y={840} size={38} italic col={color.inkSoft} />
      <Line text="Maths: six points from the middle of the table" at={c('P15b', 'six')} x={160} y={910} size={38} serif={false} weight={600} col={C_FIN} />
    </PaperScene>
  );
};

export const S16: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD PISA 2025 press release; OECD PISA 2022 Results (Volume I)">
      <HBars x={160} y={170} width={1000} max={30} labelW={520} title="OECD average: points lost" titleAt={0.2}
        bars={[
          {label: 'Reading, 2015→2025', value: 28, col: C_OECD, at: c('P16', '28'), valueText: '−28', note: '≈ 1.5 years', noteAt: c('P16', 'year')},
          {label: 'Maths, 2015→2025', value: 22, col: C_OECD, at: c('P16', '22.'), valueText: '−22', note: '≈ 1 year'},
          {label: 'Maths, 2018→2022', value: 15, col: C_OECD, at: c('P16', 'fifteen'), valueText: '−15', note: 'largest drop on record'},
        ]} rowH={150} barH={70} />
      <Line text="Part of Finland's story is everyone's story" at={c('P16', 'everyone’s')} x={160} y={800} size={44} italic col={color.inkSoft} />
    </PaperScene>
  );
};

export const S17: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="University of Jyväskylä (PISA 2022); Finnish Government (PISA 2025)">
      <Line text="Below the baseline (Level 2) in maths" at={0.2} x={160} y={120} size={50} weight={600} />
      <Line text="Splitting the average open" at={c('P17', 'split')} x={1000} y={210} size={34} italic serif col={color.inkSoft} />
      <Waffle x={200} y={230} cell={46} appear={0.4} col={C_FIN}
        states={[{at: c('P17', 'seven'), pct: 7}, {at: c('P17', '2022'), pct: 25}]}
        label={<span>Early 2000s → 2022</span>}
        caption={(p) => `${Math.round(p)}%`} />
      <Line text="Since 2015" at={c('P17', 'Since')} x={1000} y={300} size={30} serif={false} weight={600} col={color.inkSoft} />
      <Line text="+17 pts maths · +15 pts reading" at={c('P17', 'seventeen')} x={1000} y={350} size={48} serif={false} weight={600} col={C_FIN} width={820} />
      <Line text="Reading, 2025" at={c('P17', 'reading', 2)} x={1000} y={520} size={30} serif={false} weight={600} col={color.inkSoft} />
      <Line text="More than 1 in 4 below baseline" at={c('P17', 'reading', 2) + 0.3} x={1000} y={570} size={48} serif={false} weight={600} width={820} />
      <Line text="Boys: about 1 in 3" at={c('P17', 'boys,')} x={1000} y={650} size={48} serif={false} weight={600} col={C_FIN} width={820} />
    </PaperScene>
  );
};

export const S18: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="Finnish national PISA reports via Helsinki Times (2003, 2025)">
      <Line text="Top performers in maths" at={0.2} x={160} y={120} size={50} weight={600} />
      <Waffle x={200} y={230} cell={46} appear={0.4} col={C_EST}
        states={[{at: c('P18', 'twenty-three'), pct: 23}, {at: c('P18', 'seven'), pct: 7}]}
        label={<span>2003 → 2025</span>} caption={(p) => `${Math.round(p)}%`} />
      <Line text="Now below the OECD average" at={c('P18', 'below')} x={1000} y={400} size={48} serif={false} weight={600} width={820} />
      <Line text="Lost the floor. Lost the ceiling." at={c('P18', 'floor.')} x={1000} y={560} size={56} italic col={C_FIN} width={820} />
    </PaperScene>
  );
};

export const S19a: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 24, lat: 61, k: 0.9}, {t: pe('P19') + 2, lon: 25, lat: 59.8, k: 1.6}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.1}, {id: ISO.EST, col: color.indigoOnNight, at: c('P19', 'Estonia')}]}
        labels={[
          {lon: 26.5, lat: 62.6, text: 'FINLAND', at: 0.3},
          {lon: 25.8, lat: 58.7, text: 'ESTONIA', at: c('P19', 'Estonia') + 0.3},
          {lon: 22.6, lat: 59.45, text: 'Gulf of Finland', at: c('P19', 'Gulf'), size: 22, serif: true, col: color.nightSoft},
        ]} />
    </AbsoluteFill>
  );
};

/** Original analysis A: the Finland–Estonia crossover (maths), P19–P20. */
export const S19b: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const k06 = c('P19', '2006,');
  const k12 = c('P19', '2012,');
  const kS = c('P19', 'Since');
  const k25 = c('P20', '508');
  const estY = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const finY = [2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const timeFor = (y: number) => (y <= 2006 ? k06 : y <= 2012 ? k06 + ((k12 - k06) * (y - 2006)) / 6 : y <= 2022 ? kS + ((y - 2012) / 10) * 2.5 : k25);
  const row = (lab: string, e: number, f: number, at: number) => (
    <div style={{display: 'flex', gap: 24, fontFamily: font.sans, fontSize: 34, marginBottom: 18, opacity: ramp(t, at, 0.5), ...num}}>
      <div style={{width: 160, color: color.inkSoft}}>{lab}</div>
      <div style={{width: 90, color: C_EST, fontWeight: 600}}>{e}</div>
      <div style={{width: 90, color: C_FIN, fontWeight: 600}}>{f}</div>
    </div>
  );
  return (
    <PaperScene source="OECD PISA 2003–2025; Estonian Ministry of Education; NCEE">
      <Line text="Original analysis · Maths: Finland vs Estonia" at={0.1} x={160} y={110} size={46} weight={600} />
      <LineChart x={230} y={250} w={1050} h={620} xDomain={[2002, 2026.5]} yDomain={[455, 560]} xTicks={[2003, 2006, 2012, 2018, 2025]} yTicks={[460, 480, 500, 520, 540]}
        appear={0.2}
        vlines={[{x: 2012, label: 'Statistical tie', at: c('P19', 'tie.'), col: color.inkSoft}]}
        series={[
          {id: 'fin', col: C_FIN, label: 'Finland', points: finY.map((y) => ({x: y, y: FIN.math[y], at: y === 2003 ? 0.3 : timeFor(y),
            label: [2006, 2025].includes(y) ? String(FIN.math[y]) : undefined, labelPos: y === 2025 ? 'below' : 'above'}))},
          {id: 'est', col: C_EST, label: 'Estonia', endLabelDy: -6, points: estY.map((y) => ({x: y, y: EST.math[y], at: timeFor(y),
            label: [2006, 2025].includes(y) ? String(EST.math[y]) : undefined, labelPos: y === 2006 ? 'below' : 'above'}))},
        ]} />
      <Line text="Gap in 2006: 33 points" at={k06 + 0.6} out={k12 - 0.3} x={560} y={900} size={34} serif={false} weight={600} col={color.inkSoft} width={800} />
      <div style={{position: 'absolute', left: 1450, top: 360}}>
        <div style={{fontFamily: font.sans, fontSize: 26, fontWeight: 600, letterSpacing: 2, color: color.inkSoft, marginBottom: 20, opacity: ramp(t, k25, 0.5)}}>2025</div>
        <div style={{display: 'flex', gap: 24, fontFamily: font.sans, fontSize: 24, marginBottom: 14, opacity: ramp(t, k25, 0.5)}}>
          <div style={{width: 160}} /><div style={{width: 90, color: C_EST}}>EST</div><div style={{width: 90, color: C_FIN}}>FIN</div>
        </div>
        {row('Maths', EST.math[2025], FIN.math[2025], k25)}
        {row('Science', EST.science[2025], FIN.science[2025], c('P20', 'science,'))}
        {row('Reading', EST.reading[2025], FIN.reading[2025], c('P20', 'reading,'))}
      </div>
      <Line text="Estonia: #1 in Europe in maths & science" at={c('P20', 'Europe’s')} x={1450} y={640} size={30} serif={false} weight={600} col={C_EST} width={420} />
      <Line text="Estonia is slipping too, just more slowly" at={c('P20', 'slipped')} x={1450} y={760} size={28} serif={false} col={color.inkSoft} width={420} />
    </PaperScene>
  );
};

export const S21: React.FC = () => {
  const {c} = useCues();
  const k = c('P21', 'Japan');
  return (
    <PaperScene source="OECD, PISA 2025 Country Note: Japan; OECD PISA 2022 Results">
      <Line text={<><span style={{color: C_JPN}}>Japan</span>: 1st in the OECD in all three subjects</>} at={k} x={160} y={130} size={52} weight={600} />
      <HBars x={160} y={280} width={1000} max={560} labelW={420} rowH={86} barH={44}
        refLine={{value: 0, label: '', at: 99999}}
        bars={[
          {label: 'Science · Japan', value: JPN.science[2025], col: C_JPN, at: k + 0.6},
          {label: 'OECD average', value: OECD.science[2025], col: C_OECD, at: k + 0.8},
          {label: 'Reading · Japan', value: JPN.reading[2025], col: C_JPN, at: k + 1.2},
          {label: 'OECD average', value: OECD.reading[2025], col: C_OECD, at: k + 1.4},
          {label: 'Maths · Japan', value: JPN.math[2025], col: C_JPN, at: k + 1.8},
          {label: 'OECD average', value: OECD.math[2025], col: C_OECD, at: k + 2.0},
        ]} />
      <Line text="Top of the OECD table…" at={c('P21', 'top')} out={k} x={160} y={130} size={52} weight={600} />
      <Line text="?" at={c('P21', 'name')} out={k} x={1500} y={100} size={120} weight={600} col={C_JPN} width={200} />
      <Line text="First time since PISA began (2000)" at={c('P21', 'since')} x={160} y={205} size={32} serif={false} weight={600} col={C_JPN} width={900} />
      <Line text="2022: only Japan and Korea improved in maths (OECD)" at={c('P21', 'Korea')} x={160} y={840} size={36} serif={false} weight={600} width={1600} />
      <Line text="Be more like East Asia?" at={c('P21', 'East')} x={1150} y={920} size={50} italic col={C_FIN} width={700} />
    </PaperScene>
  );
};

// ───────────────────────── ACT 3 ─────────────────────────

export const S22: React.FC = () => {
  const {c} = useCues();
  const names = ['Immigration', 'Phones & pandemic', 'Reading', 'Student-led learning', 'Inequality', 'The legacy'];
  const kL = c('P22', 'suspects');
  const t = useT();
  return (
    <PaperScene>
      <Line text="A good explanation must answer:" at={c('P22', 'good')} x={160} y={140} size={46} weight={600} />
      <Line text="1  Why Finland fell" at={c('P22', 'Why', 1)} x={200} y={250} size={42} serif={false} />
      <Line text="2  Why further than most" at={c('P22', 'Why', 2)} x={200} y={320} size={42} serif={false} />
      <Line text="3  Why it began after 2006" at={c('P22', 'why', 3)} x={200} y={390} size={42} serif={false} />
      {names.map((n, i) => (
        <div key={n} style={{position: 'absolute', left: 160 + (i % 3) * 540, top: 560 + Math.floor(i / 3) * 170, width: 500, height: 130,
          border: `3px solid ${color.ink}`, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 20, padding: '0 28px', boxSizing: 'border-box',
          opacity: ramp(t, kL + i * 0.25, 0.4), transform: `translateY(${(1 - ramp(t, kL + i * 0.25, 0.5)) * 16}px)`}}>
          <span style={{fontFamily: font.sans, fontWeight: 600, fontSize: 30, color: color.inkSoft}}>{i + 1}</span>
          <span style={{fontFamily: font.serif, fontSize: 40, color: color.ink}}>{n}</span>
        </div>
      ))}
    </PaperScene>
  );
};

export const S23: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="Finnish Government, Performance of immigrant students in PISA 2022; Yle">
      <VerdictCard n={1} name="Immigration" at={0.1} verdict="no" verdictText="Not the main cause" verdictAt={c('P23', 'Verdict:')}
        evidence={[
          {text: 'Immigrant-background students do score lower on average', at: c('P23', 'diverse,')},
          {text: 'If they were the cause, other scores would hold steady', at: c('P23', 'explained')},
          {text: 'Scores fell with and without a migrant background', at: c('P23', 'Results')},
          {text: 'Maths: immigrant-background students ≈ 2012 level', at: c('P23', 'maths,')},
          {text: 'It was everyone else who fell', at: c('P23', 'everyone', 2)},
          {text: 'The gap narrowed (by 11 points vs first generation)', at: c('P23', 'gap')},
        ]} />
    </PaperScene>
  );
};

export const S24: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD, PISA 2025 Results (Volume I)">
      <VerdictCard n={2} name="Phones & the pandemic" at={0.1} verdict="partial" verdictText="Accelerant, not origin" verdictAt={c('P24', 'Verdict:')}
        evidence={[
          {text: 'Heavy or leisure device use at school…', at: c('P24', 'OECD’s')},
          {text: '…goes with noticeably lower scores (a correlation)', at: c('P24', 'noticeably')},
          {text: '1 in 4+: classmates distracted in most science lessons', at: c('P24', 'More')},
          {text: 'Finland’s slide began after 2006, long before COVID-19', at: c('P24', 'timing.')},
          {text: 'But phones are everywhere, Estonia and Japan too', at: c('P24', 'everywhere,')},
        ]}>
        <Line text="Learning use: often fine. Leisure use: not." at={c('P24', 'leisure')} out={c('P24', 'timing.') - 0.3} x={1100} y={260} size={40} italic col={C_FIN} width={700} />
        <StatCallout value={4} from={1} at={c('P24', 'distracted')} out={c('P24', 'timing.') - 0.3} prefix="1 in " suffix="+" label="Classmates distracted, most lessons" x={1100} y={680} align="left" size={90} col={C_FIN} />
        <Line text="Correlation ≠ cause" at={c('P24', 'correlation,')} out={c('P24', 'timing.') - 0.3} x={1100} y={420} size={40} weight={600} col={color.inkSoft} width={700} />
        <EraTimeline x={1120} y={600} w={660} range={[2004, 2026]} ticks={[2006, 2020, 2025]} appear={c('P24', 'timing.')}
          markers={[
            {year: 2006, label: 'Slide begins', at: c('P24', 'slide'), col: C_FIN},
            {year: 2020, label: 'COVID-19', at: c('P24', 'COVID-19.'), col: color.ink, level: 1},
          ]} />
      </VerdictCard>
    </PaperScene>
  );
};

export const S25: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OPH blog (2023); OECD PISA in Focus 2011/8">
      <VerdictCard n={3} name="Reading" at={0.1} verdict="yes" verdictText="Likely contributor" verdictAt={c('P25', 'Verdict:')}
        evidence={[
          {text: 'OPH: reading was a popular pastime that held results up', at: c('P25', 'education')},
          {text: 'Now: social media and gaming take that time', at: c('P25', 'Social')},
          {text: 'Reading for enjoyment fell 2000–2009, faster than OECD', at: c('P25', 'OECD')},
          {text: 'Every maths question is also a reading test', at: c('P25', 'Reading', 3)},
          {text: 'Decline concentrated among weaker students and boys', at: c('P25', 'shape')},
        ]}>
        <Line text="Reading: once a national pastime" at={c('P25', 'pastime,')} out={c('P25', '2009,') - 0.3} x={1100} y={250} size={40} italic col={color.inkSoft} width={700} />
        <Line text="2000 → 2009: fewer read for fun" at={c('P25', '2009,')} out={c('P25', 'Every') - 0.4} x={1100} y={250} size={40} italic col={color.inkSoft} width={700} />
        <Line text="Boys: about 1 in 3 below baseline in reading" at={c('P25', 'boys.')} x={1100} y={450} size={36} serif={false} weight={600} col={C_FIN} width={700} />
        <Line text="Every question arrives as text" at={c('P25', 'Every')} out={c('P25', 'struggles') - 0.3} x={1100} y={250} size={40} italic col={color.inkSoft} width={700} />
        <Line text="Can't read the problem? Can't do the maths." at={c('P25', 'struggles')} x={1100} y={250} size={40} italic col={C_FIN} width={700} />
      </VerdictCard>
    </PaperScene>
  );
};

export const S26: React.FC = () => {
  const {c} = useCues();
  const yrs = [2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  return (
    <PaperScene source="OPH, National core curriculum for basic education (2014); OECD PISA">
      <VerdictCard n={4} name="Student-led learning" at={0.1} verdict="partial" verdictText="Possible, not proven" verdictAt={c('P26', 'Verdict:')}
        evidence={[
          {text: '2014: a new core curriculum', at: c('P26', '2014,')},
          {text: 'Cross-disciplinary, phenomenon-based learning', at: c('P26', 'cross-disciplinary,')},
          {text: 'In schools from August 2016', at: c('P26', 'August')},
          {text: 'Scores had already fallen for a decade', at: c('P26', 'Scores')},
          {text: '2025 cohort: first with it for all of school', at: c('P26', '2025')},
          {text: 'Whether it deepened the fall is still debated', at: c('P26', 'Whether')},
        ]}>
        <LineChart x={1150} y={330} w={620} h={360} xDomain={[2005, 2026]} yDomain={[460, 560]} xTicks={[2006, 2016, 2025]} yTicks={[]}
          appear={c('P26', 'calendar.')}
          vlines={[{x: 2016, label: 'New curriculum', at: c('P26', 'calendar.') + 0.5}]}
          series={[{id: 'f', col: C_FIN, start: c('P26', 'calendar.') + 0.3, dur: 2, points: yrs.map((y) => ({x: y, y: FIN.math[y]}))}]} />
      </VerdictCard>
    </PaperScene>
  );
};

export const S27: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="Finnish Government, PISA 2025">
      <VerdictCard n={5} name="Inequality" at={0.1} verdict="symptom" verdictText="A symptom, not a cause" verdictAt={c('P27', 'less')}
        evidence={[
          {text: 'The Finnish government’s 2025 summary:', at: c('P27', 'summary')},
          {text: 'More low performers', at: c('P27', 'More')},
          {text: 'Fewer top performers', at: c('P27', 'Fewer')},
          {text: 'Wider gaps between students', at: c('P27', 'Wider')},
        ]}>
        <Line text="Where the damage landed ≠ what caused it" at={c('P27', 'landed.')} x={1100} y={330} size={40} italic col={C_FIN} width={700} />
      </VerdictCard>
    </PaperScene>
  );
};

export const S28: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="Heller Sahlgren, G. (2015) Real Finnish Lessons, Centre for Policy Studies">
      <Line text="SUSPECT 6 OF 6 · THE LEGACY" at={0.1} x={160} y={110} size={24} serif={false} weight={600} col={color.inkSoft} />
      <Line text="Real Finnish Lessons" at={c('P28', 'Real')} out={c('P28', 'rise,') - 0.4} x={0} width={1920} align="center" y={400} size={96} italic weight={600} />
      <Line text="Gabriel Heller Sahlgren · Centre for Policy Studies · 2015" at={c('P28', 'economist')} out={c('P28', 'rise,') - 0.4} x={0} width={1920} align="center" y={540} size={34} serif={false} col={color.inkSoft} />
      <Line text="What mattered: teacher-led classrooms and deep cultural roots" at={c('P28', 'older:')} x={260} y={800} size={36} serif={false} weight={600} col={C_FIN} width={1400} />
      <QuoteCard at={c('P28', 'rise,')}
        text="Finland’s rise began before most of its celebrated reforms could take effect,"
        text2="and its decline began soon after they took hold." at2={c('P28', 'decline')}
        who="Gabriel Heller Sahlgren, Real Finnish Lessons (2015)" note="Summary of the report’s argument" />
    </PaperScene>
  );
};

/** Original analysis C: maths score by approximate school-entry year (PISA year − 8). */
export const S29: React.FC = () => {
  const {c} = useCues();
  const yrs = [2003, 2006, 2009, 2012, 2015, 2018, 2022, 2025] as const;
  const kSlide = c('P29', 'slide');
  const t = useT();
  return (
    <PaperScene source="OECD PISA 2003–2025; school entry at age 7; OPH curricula. Own analysis">
      <Line text="Original analysis · Maths score by year of starting school" at={0.1} x={160} y={110} size={44} weight={600} />
      <LineChart x={200} y={250} w={1150} h={540} xDomain={[1993, 2019]} yDomain={[455, 560]}
        xTicks={[1995, 1998, 2001, 2004, 2007, 2010, 2014, 2017]} yTicks={[460, 480, 500, 520, 540]} appear={c('P29', 'Take')}
        xLabel="Year students started school (≈ PISA year − 8)"
        bands={[{x0: 1994.5, x1: 1998.5, label: 'Peak cohorts', at: c('P29', 'best'), col: color.indigo}]}
        vlines={[{x: 2016, label: '2016 curriculum', at: c('P29', '2016'), col: color.ochre}]}
        series={[{id: 'f', col: C_FIN, start: kSlide + 0.8, dur: 2.5, valueLabels: 'all', points: yrs.map((y) => ({x: y - 8, y: FIN.math[y]}))}]} />
      <Line text="Peak cohort: started school ≈1998" at={c('P29', '1998,')} out={kSlide} x={260} y={440} size={48} weight={600} col={color.ochre} />
      <Line text="Let's check." at={c('P29', 'ourselves.')} out={kSlide} x={260} y={520} size={40} italic col={color.inkSoft} />
      <Line text="Same data, new x-axis" at={c('P29', 'different')} x={1440} y={250} size={30} serif={false} weight={600} col={color.inkSoft} width={420} />
      <Line text="2016 curriculum: too late to start the fall" at={c('P29', 'end')} x={1440} y={540} size={30} serif={false} weight={600} col={color.ochre} width={420} />
      <Line text="Relabelling an axis ≠ proof" at={c('P29', 'Relabelling')} x={1440} y={660} size={30} serif={false} italic col={color.inkSoft} width={420} />
      <div style={{position: 'absolute', left: 1440, top: 330, width: 420, opacity: ramp(t, c('P29', 'decline'), 0.5),
        fontFamily: font.sans, fontSize: 28, lineHeight: 1.4, color: color.ink}}>
        Decline starts with cohorts entering school in the early 2000s
      </div>
      <div style={{position: 'absolute', right: 80, bottom: 70, display: 'flex', alignItems: 'center', gap: 20, opacity: ramp(t, c('P29', 'fits'), 0.5)}}>
        <div style={{border: `5px solid ${color.indigo}`, borderRadius: 14, padding: '12px 26px', display: 'flex', gap: 16, alignItems: 'center'}}>
          <span style={{fontSize: 56, color: color.indigo, fontFamily: font.sans, lineHeight: 1}}>○</span>
          <span style={{fontFamily: font.serif, fontSize: 40, fontWeight: 600, color: color.indigo}}>Best fit for timing, not proof</span>
        </div>
      </div>
    </PaperScene>
  );
};

// ───────────────────────── COUNTERPOINT ─────────────────────────

export const S30: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD, PISA 2025 Country Note: Japan (self-reported)">
      <HBars x={160} y={150} width={1000} max={100} labelW={560} rowH={120} barH={60} suffix="%" title="Students who agree…" titleAt={0.2}
        bars={[
          {label: 'Curious about many things · Japan', value: 63, col: C_JPN, at: c('P30', 'sixty-three')},
          {label: 'OECD average', value: 73, col: C_OECD, at: c('P30', 'average')},
          {label: 'Extra effort when it’s hard · Japan', value: 48, col: C_JPN, at: c('P30', 'Forty-eight')},
          {label: 'OECD average', value: 60, col: C_OECD, at: c('P30', 'sixty.')},
        ]} />
      <Line text="Copy Japan instead?" at={c('P30', 'copy')} out={c('P30', 'sixty-three') - 0.2} x={1250} y={170} size={40} italic col={C_FIN} width={600} />
      <Line text="High scores ≠ a solved system" at={c('P30', 'solved')} x={160} y={870} size={40} weight={600} col={C_JPN} />
      <Line text="…and modesty is cultural" at={c('P30', 'modesty')} x={700} y={800} size={34} serif={false} italic col={color.inkSoft} />
      <Line text="Self-reports vary with culture" at={c('P30', 'Self-reported')} x={160} y={800} size={34} serif={false} italic col={color.inkSoft} />
    </PaperScene>
  );
};

export const S31: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="Zhao, Y. (2014) Who's Afraid of the Big Bad Dragon?">
      <QuoteCard at={c('P31', 'Critics')} text="Test-driven systems can produce high scores" text2="while crushing creativity." at2={c('P31', 'crushing')}
        who="Yong Zhao, education scholar" note="Paraphrase of his argument" />
      <Line text="Who's Afraid of the Big Bad Dragon? (2014)" at={c('P31', 'years')} x={260} y={180} size={30} serif={false} italic col={color.inkSoft} />
      <Line text="A narrow slice of what schools do" at={c('P31', 'narrow')} x={260} y={640} size={32} serif={false} col={color.inkSoft} />
      <Line text="The basic point:" at={c('P31', 'agree')} x={260} y={760} size={32} serif={false} weight={600} col={color.inkSoft} />
      <Line text="One test on one day ≠ a verdict on a nation" at={c('P31', 'day')} x={260} y={810} size={48} weight={600} col={C_FIN} width={1400} />
    </PaperScene>
  );
};

export const S32: React.FC = () => {
  const {c} = useCues();
  return (
    <PaperScene source="OECD PISA 2000, 2025">
      <Line text="Finland, reading rank" at={0.2} x={160} y={160} size={40} serif={false} weight={600} col={color.inkSoft} />
      <StatCallout value={1} from={1} at={c('P32', 'Sliding')} prefix="#" label="2000" x={560} y={520} size={220} col={color.ink} />
      <Line text="→" at={c('P32', 'Sliding') + 0.4} x={0} width={1920} align="center" y={380} size={120} col={color.inkSoft} />
      <StatCallout value={17} from={1} at={c('P32', 'Sliding') + 0.6} prefix="=" label="2025" x={1360} y={520} size={220} col={C_FIN} />
      <Line text="In Helsinki: a national crisis" at={c('P32', 'crisis')} x={0} width={1920} align="center" y={920} size={34} italic col={C_FIN} />
      <Line text="Still above the OECD average in all three" at={c('P32', 'above')} x={0} width={1920} align="center" y={780} size={40} serif={false} col={color.inkSoft} />
      <Line text="Science: 12th in the world" at={c('P32', 'twelfth')} x={0} width={1920} align="center" y={850} size={40} serif={false} weight={600} col={color.ink} />
    </PaperScene>
  );
};

// ───────────────────────── RESOLUTION / CLOSING ─────────────────────────

export const S33: React.FC = () => {
  const {c} = useCues();
  const t = useT();
  const kFade = c('P33', 'faded.');
  const inv = 1 - 0.7 * ramp(t, kFade - 0.6, 1.5);
  return (
    <PaperScene>
      <Line text="What the world copied" at={c('P33', 'visible')} x={160} y={160} size={46} weight={600} />
      <Line text="Late school start" at={c('P33', 'late')} x={160} y={290} size={46} serif={false} />
      <Line text="No national tests" at={c('P33', 'missing')} x={160} y={370} size={46} serif={false} />
      <Line text="Freedom for schools" at={c('P33', 'freedom.')} x={160} y={450} size={46} serif={false} />
      <div style={{opacity: inv}}>
        <Line text="What it missed" at={c('P33', 'invisible')} x={1000} y={160} size={46} weight={600} col={C_FIN} />
        <Line text="A generation that read for pleasure" at={c('P33', 'generation')} x={1000} y={290} size={46} serif={false} width={800} />
        <Line text="Teachers teaching the basics, directly" at={c('P33', 'classrooms')} x={1000} y={370} size={46} serif={false} width={800} />
      </div>
      <Line text="The success was real. The diagnosis wasn't." at={c('P33', 'real.')} out={c('P33', 'exported.') - 0.3} x={0} width={1920} align="center" y={820} size={44} italic col={color.inkSoft} />
      <Line text="Exported ✓" at={c('P33', 'exported.')} x={160} y={640} size={40} serif={false} weight={600} col={color.indigo} />
      <Line text="Not exported ✗ … and faded at home" at={c('P33', 'couldn’t,')} x={1000} y={640} size={40} serif={false} weight={600} col={C_FIN} width={800} />
    </PaperScene>
  );
};

export const S34: React.FC = () => {
  const {c} = useCues();
  return (
    <NightScene>
      <Line dark text="Not about Finland. About how we read success." at={c('P34', 'lesson,')} out={c('P34', 'headline') - 0.3} x={0} width={1920} align="center" y={440} size={56} />
      <Line dark text="We credit whatever is easiest to see" at={c('P34', 'easiest')} out={c('P34', 'headline') - 0.3} x={0} width={1920} align="center" y={560} size={40} serif={false} col={color.nightSoft} />
      <Line dark text="Twenty years as the answer to an unasked question" at={c('P34', 'twenty')} x={0} width={1920} align="center" y={860} size={34} serif={false} italic col={color.nightSoft} />
      <Line dark text="Otherwise it's a brochure, not an explanation" at={c('P34', 'brochure,')} x={0} width={1920} align="center" y={780} size={40} serif={false} col={color.ochre} />
      <Line dark text="Next time you hear “education miracle”, ask:" at={c('P34', 'headline')} x={0} width={1920} align="center" y={200} size={40} serif={false} col={color.nightSoft} />
      <Line dark text="When were these students taught?" at={c('P34', 'When')} x={0} width={1920} align="center" y={340} size={66} />
      <Line dark text="What changed before the scores did?" at={c('P34', 'What')} x={0} width={1920} align="center" y={470} size={66} />
      <Line dark text="What’s happening at the bottom?" at={c('P34', 'what’s')} x={0} width={1920} align="center" y={600} size={66} />
    </NightScene>
  );
};

export const S35: React.FC = () => {
  const {c, pe} = useCues();
  return (
    <AbsoluteFill>
      <WorldMap kind="nordic" keys={[{t: 0, lon: 25, lat: 61.5, k: 1.4}, {t: pe('P36') + 3, lon: 15, lat: 57, k: 0.33}]}
        highlights={[{id: ISO.FIN, col: C_FIN, at: 0.2}]} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,15,17,0) 45%, rgba(14,15,17,0.85) 80%)'}} />
      <TitleCard dark title="It started believing the brochure." at={c('P35', 'started')} out={c('P36', 'So') - 0.3} size={76} y={820} />
      <TitleCard dark kicker="Your turn" title="What did your school get right that no ranking would ever measure?"
        at={c('P36', 'What')} size={62} y={820} />
    </AbsoluteFill>
  );
};
