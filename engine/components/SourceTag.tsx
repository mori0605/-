import React from 'react';
import {color, font} from '../theme';

/** Bottom-left source line, required on every data scene (CLAUDE.md §5). */
export const SourceTag: React.FC<{text: string; dark?: boolean; opacity?: number}> = ({text, dark, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      bottom: 40,
      fontFamily: font.sans,
      fontSize: 23,
      letterSpacing: 0.2,
      color: dark ? color.nightSoft : color.inkSoft,
      opacity,
    }}
  >
    Source: {text}
  </div>
);

/** Top-left chapter marker. */
export const ChapterLabel: React.FC<{text: string; dark?: boolean; opacity?: number}> = ({text, dark, opacity = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: 64,
      top: 44,
      fontFamily: font.sans,
      fontWeight: 600,
      fontSize: 21,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: dark ? color.nightSoft : color.inkSoft,
      opacity,
    }}
  >
    {text}
  </div>
);
