import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ease} from './theme';

/** Local time of the current Sequence, in seconds. */
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

/** Eased 0→1 progress between t0 and t0+dur. */
export const ramp = (t: number, t0: number, dur = 0.6) =>
  interpolate(t, [t0, t0 + Math.max(0.001, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Fade in at t0, optionally fade out at t1. */
export const fade = (t: number, t0: number, t1?: number, dur = 0.5) =>
  ramp(t, t0, dur) * (t1 === undefined ? 1 : 1 - ramp(t, t1, dur));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Slow continuous drift so no frame is ever fully static (Ken Burns for paper scenes). */
export const drift = (t: number, amount = 0.025, period = 40) => 1 + amount * (t / period);

export const fmt = (v: number, decimals = 0) =>
  v.toLocaleString('en-GB', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
