import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {geoConicConformal, geoNaturalEarth1, geoPath, geoGraticule10, GeoProjection} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-50m.json';
import {useT, ramp, fade, lerp} from '../anim';
import {color, font, W, H} from '../theme';

type Key = {t: number; lon: number; lat: number; k: number};
export type Highlight = {id: string; col: string; at: number; out?: number; opacity?: number};
export type MapLabel = {lon: number; lat: number; text: string; at: number; out?: number; col?: string; size?: number; serif?: boolean};

// ISO 3166 numeric ids used in world-atlas
export const ISO = {FIN: '246', EST: '233', JPN: '392', KOR: '410', SWE: '752', NOR: '578', RUS: '643', ITA: '380'};

const makeProjection = (kind: 'world' | 'nordic'): GeoProjection =>
  kind === 'world'
    ? geoNaturalEarth1().scale(330).translate([W / 2, H / 2])
    : geoConicConformal().parallels([55, 68]).rotate([-20, 0]).center([0, 62]).scale(2600).translate([W / 2, H / 2]);

/**
 * World mode basemap: dark, desaturated land on a near-black sea, faint graticule.
 * The camera always moves (Ken Burns) between keyframes given in lon/lat + zoom.
 */
export type Arc = {from: [number, number]; to: [number, number]; at: number; dur?: number; col?: string};
export type Pulse = {lon: number; lat: number; at: number; col?: string};

export const WorldMap: React.FC<{kind?: 'world' | 'nordic'; keys: Key[]; highlights?: Highlight[]; labels?: MapLabel[]; arcs?: Arc[]; pulses?: Pulse[]; children?: React.ReactNode}> =
  ({kind = 'world', keys, highlights = [], labels = [], arcs = [], pulses = []}) => {
  const t = useT();
  const {paths, proj, grat, outline} = useMemo(() => {
    const proj = makeProjection(kind);
    const gp = geoPath(proj);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fc = feature(world as any, (world as any).objects.countries) as any;
    const paths = fc.features.map((f: any) => ({id: String(f.id), d: gp(f) ?? ''}));
    return {paths, proj, grat: gp(geoGraticule10()) ?? '', outline: gp({type: 'Sphere'}) ?? ''};
  }, [kind]);

  // camera
  let cam = keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (t >= a.t) {
      const p = ramp(t, a.t, b.t - a.t);
      cam = {t, lon: lerp(a.lon, b.lon, p), lat: lerp(a.lat, b.lat, p), k: a.k * Math.pow(b.k / a.k, p)};
    }
  }
  const [cx, cy] = proj([cam.lon, cam.lat]) as [number, number];
  const tf = `translate(${W / 2},${H / 2}) scale(${cam.k}) translate(${-cx},${-cy})`;
  const toScreen = (lon: number, lat: number) => {
    const [px, py] = proj([lon, lat]) as [number, number];
    return [(px - cx) * cam.k + W / 2, (py - cy) * cam.k + H / 2];
  };
  const hl = new Map(highlights.map((h) => [h.id, h]));

  return (
    <AbsoluteFill style={{backgroundColor: color.sea}}>
      <svg width={W} height={H}>
        <defs>
          <radialGradient id="landShade" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#252a31" />
            <stop offset="100%" stopColor="#15181c" />
          </radialGradient>
        </defs>
        <g transform={tf}>
          {kind === 'world' && <path d={outline} fill="#0f1216" />}
          <path d={grat} fill="none" stroke="rgba(233,228,216,0.06)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          {paths.map((p: {id: string; d: string}) => (
            <path key={p.id + p.d.length} d={p.d} fill="url(#landShade)" stroke={color.landEdge} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
          ))}
          {paths.filter((p: {id: string}) => hl.has(p.id)).map((p: {id: string; d: string}) => {
            const h = hl.get(p.id)!;
            return <path key={'h' + p.id + p.d.length} d={p.d} fill={h.col} fillOpacity={(h.opacity ?? 0.72) * fade(t, h.at, h.out, 0.8)}
              stroke={h.col} strokeOpacity={fade(t, h.at, h.out, 0.8)} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />;
          })}
          {arcs.map((a, i) => {
            const [x0, y0] = proj(a.from) as [number, number];
            const [x1, y1] = proj(a.to) as [number, number];
            const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - Math.hypot(x1 - x0, y1 - y0) * 0.28;
            const p = ramp(t, a.at, a.dur ?? 1.6);
            const len = Math.hypot(x1 - x0, y1 - y0) * 1.25;
            return <path key={'a' + i} d={`M${x0},${y0} Q${mx},${my} ${x1},${y1}`} fill="none" stroke={a.col ?? color.nightText}
              strokeOpacity={0.75 * (1 - ramp(t, a.at + (a.dur ?? 1.6) + 1.2, 1))} strokeWidth={2.5 / cam.k * 1} strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap="round" />;
          })}
        </g>
      </svg>
      {pulses.map((pl, i) => {
        const [sx, sy] = toScreen(pl.lon, pl.lat);
        const ph = ((t - pl.at) % 1.8) / 1.8;
        if (t < pl.at) return null;
        return (
          <div key={'p' + i} style={{position: 'absolute', left: sx, top: sy}}>
            <div style={{position: 'absolute', left: -10, top: -10, width: 20, height: 20, borderRadius: 10, background: pl.col ?? color.nightText}} />
            <div style={{position: 'absolute', left: -60 * ph, top: -60 * ph, width: 120 * ph, height: 120 * ph, borderRadius: '50%',
              border: `4px solid ${pl.col ?? color.nightText}`, opacity: 1 - ph}} />
          </div>
        );
      })}
      {labels.map((l, i) => {
        const [sx, sy] = toScreen(l.lon, l.lat);
        return (
          <div key={i} style={{position: 'absolute', left: sx - 300, top: sy - 30, width: 600, textAlign: 'center', opacity: fade(t, l.at, l.out),
            fontFamily: l.serif ? font.serif : font.sans, fontWeight: 600, fontSize: l.size ?? 34, color: l.col ?? color.nightText,
            letterSpacing: l.serif ? 0 : 2, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>{l.text}</div>
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
