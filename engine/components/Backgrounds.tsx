import React from 'react';
import {AbsoluteFill} from 'remotion';
import {color} from '../theme';

/** Paper mode: cream paper, faint square grid, soft vignette. */
export const Paper: React.FC<{children?: React.ReactNode; grid?: number}> = ({children, grid = 48}) => (
  <AbsoluteFill style={{backgroundColor: color.paper}}>
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${color.grid} 1px, transparent 1px), linear-gradient(90deg, ${color.grid} 1px, transparent 1px)`,
        backgroundSize: `${grid}px ${grid}px`,
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,100,60,0.10) 100%)'}} />
    {children}
  </AbsoluteFill>
);

/** Night mode backdrop for text-only dark scenes. */
export const Night: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: color.night}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(60,70,85,0.25) 0%, rgba(0,0,0,0) 60%)'}} />
    {children}
  </AbsoluteFill>
);
