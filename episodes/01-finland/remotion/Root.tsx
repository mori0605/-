import React from 'react';
import {Composition, Still} from 'remotion';
import {Episode, episodeFrames} from './Episode';
import {Thumb1, Thumb2, Thumb3} from './Thumbnails';
import {Sample, sampleFrames} from './Sample';
import {FPS, W, H} from '../../../engine/theme';

export const Root: React.FC = () => (
  <>
    <Composition id="Episode" component={Episode} durationInFrames={episodeFrames()} fps={FPS} width={W} height={H} />
    <Composition id="Sample" component={Sample} durationInFrames={sampleFrames()} fps={FPS} width={W} height={H} />
    <Still id="Thumb1" component={Thumb1} width={1280} height={720} />
    <Still id="Thumb2" component={Thumb2} width={1280} height={720} />
    <Still id="Thumb3" component={Thumb3} width={1280} height={720} />
  </>
);
