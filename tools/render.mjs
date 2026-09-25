// Render helper (Remotion). Usage:
//   node tools/render.mjs <episodeDir> video <out.mp4> [startSec endSec]
//   node tools/render.mjs <episodeDir> stills <outDir> <sec,sec,...>
//   node tools/render.mjs <episodeDir> thumbs <outDir>
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const [, , epDir, mode, out, a, b] = process.argv;
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({
  entryPoint: path.resolve(epDir, 'remotion/index.ts'),
  publicDir: path.resolve(epDir, 'audio'),
});
const opts = {serveUrl, browserExecutable, chromiumOptions: {gl: 'swiftshader'}};

if (mode === 'video') {
  const composition = await selectComposition({...opts, id: process.env.COMP || 'Episode'});
  const fps = composition.fps;
  const frameRange = a ? [Math.round(Number(a) * fps), Math.min(composition.durationInFrames - 1, Math.round(Number(b) * fps) - 1)] : null;
  let last = 0;
  await renderMedia({
    ...opts, composition, codec: 'h264', outputLocation: out, frameRange, crf: 18, concurrency: Number(process.env.CONC || 4),
    audioBitrate: '192k',
    onProgress: ({progress}) => { if (progress - last >= 0.02) { last = progress; console.log(`progress ${(progress * 100).toFixed(0)}%`); } },
  });
} else if (mode === 'stills') {
  fs.mkdirSync(out, {recursive: true});
  const composition = await selectComposition({...opts, id: process.env.COMP || 'Episode'});
  for (const s of a.split(',')) {
    const frame = Math.round(Number(s) * composition.fps);
    await renderStill({...opts, composition, frame, output: path.join(out, `t${String(s).padStart(6, '0')}.png`)});
  }
} else if (mode === 'thumbs') {
  fs.mkdirSync(out, {recursive: true});
  for (const id of ['Thumb1', 'Thumb2', 'Thumb3']) {
    const composition = await selectComposition({...opts, id});
    await renderStill({...opts, composition, output: path.join(out, `${id.toLowerCase()}.png`)});
  }
}
console.log('done');
