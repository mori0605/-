// Channel design tokens (CLAUDE.md §5). Every component reads from here.
import {Easing} from 'remotion';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/600.css';
import '@fontsource/source-serif-4/400-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

export const color = {
  ink: '#1B1B1B',
  paper: '#F4EFE3',
  night: '#0E0F11',
  vermilion: '#C8362D', // protagonist / deterioration / crisis
  indigo: '#2B4C8C', // comparison / stability
  ochre: '#C9A24A', // third element
  grid: 'rgba(27,27,27,0.07)',
  inkSoft: 'rgba(27,27,27,0.55)',
  inkFaint: 'rgba(27,27,27,0.25)',
  land: '#1d2126',
  landEdge: 'rgba(244,239,227,0.14)',
  sea: '#0B0D10',
  nightText: '#E9E4D8',
  nightSoft: 'rgba(233,228,216,0.6)',
  indigoOnNight: '#5A7FCC',
};

export const font = {
  serif: '"Source Serif 4", "Noto Serif", Georgia, serif',
  sans: 'Inter, "Helvetica Neue", Arial, sans-serif',
};

export const num: React.CSSProperties = {fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"'};

// One easing family everywhere: ease-in-out.
export const ease = Easing.bezier(0.45, 0, 0.55, 1);
export const easeOut = Easing.bezier(0.33, 0, 0.2, 1); // gentle in-out variant with a soft landing

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DISSOLVE = 0.5; // seconds
