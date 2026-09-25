# The Hidden Forces — video production kit

This repository builds English long-form explainer videos (Remotion + local TTS) from data.
The production rules are in `CLAUDE.md`, and each episode's instructions are in `episodes/<no>-<name>/brief.md`.

## Setup on your own PC (first time only)

What you need:
- **Node.js 18+**: https://nodejs.org/
- **Python 3.10+**: https://www.python.org/
- **git**
- (Recommended) **Claude Code**: https://claude.com/claude-code

```bash
git clone -b claude/stoic-hopper-0oha8u https://github.com/mori0605/-.git hidden-forces
cd hidden-forces
npm ci                                   # Remotion and fonts
pip install -r requirements.txt          # TTS, alignment and audio tools
python3 tools/setup_models.py            # download speech models (~650 MB) into ./models
```

> On Windows, run these in PowerShell or Git Bash. If `python3` doesn't work, use `python` instead.
> The first render may download a Chrome for Remotion automatically (~100 MB).

## Common commands

| What you want | Command |
|---|---|
| Build the 25-second style sample (P02–P04) | `python3 tools/pipeline.py sample` |
| Build the full episode | `python3 tools/pipeline.py episode` |
| Use your own BGM | `python3 tools/pipeline.py episode --bgm path/to/music.mp3` |
| No BGM | `python3 tools/pipeline.py episode --bgm none` |
| Re-render only (keep existing audio) | add `--skip-tts` |
| Thumbnails | `npm run thumbs` |
| Preview in the browser and edit visually | `npm run studio` |

The output lands in `episodes/01-finland/out/`:
- `episode01_finland.mp4`: the finished video (-14 LUFS)
- `episode01_finland_nobgm.mp4`: narration only, for adding your own BGM in an editor
- `episode01_finland.srt`: subtitles

**BGM**: this episode uses "Cinematic Documentary" by Lexin_Music (Pixabay). Download it from https://pixabay.com/music/beautiful-plays-cinematic-documentary-115669/ and save it as `episodes/01-finland/audio/music/cinematic-documentary-lexin.mp3`; it is then used automatically.
When you pass your own BGM, it is looped or trimmed to the video length, set 19 dB below the narration, and faded in and out.
With `--bgm auto`, `tools/make_music.py` composes a piece in code instead.

## Layout

```
CLAUDE.md                  production rules (the Channel Bible)
HANDOFF.md                 where things stand and what's next
engine/                    shared across episodes: theme (colours, fonts), components, TTS
episodes/01-finland/       brief, research, script, storyboard, Remotion scenes, audio, out
tools/                     pipeline, data generation, checks, render, BGM, subtitles
```

## Working with Claude Code

Run `claude` in the repository folder and say something like "Read HANDOFF.md and continue".
It will pick up the work following the rules in `CLAUDE.md`.
Locally you have normal internet access, so primary-source (OECD) checks and ready-made BGM (YouTube Audio Library and others) are both available.
