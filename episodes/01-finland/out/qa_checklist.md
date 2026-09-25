# Pre-release checklist (CLAUDE.md §12) — Episode 01

| Item | Result | Notes |
|---|---|---|
| Every number is in `facts.md` and checked against a primary source | △ | Every number is in facts.md (on-screen numbers checked mechanically). **But** oecd.org and other primary sites are blocked in this environment, so values were confirmed via the primary pages' text seen in search results. Re-check the tables directly before release (factcheck.md §6) |
| There is a Counterpoint chapter | ✅ | 11:59–13:09 (Japan's self-reports, Zhao's critique, Finland still above average) |
| No banned phrases left in the script | ✅ | `tools/check_banned.py`: 0 hits |
| Every data scene has a source tag | ✅ | Bottom-left `SourceTag` on every data scene. Text-only scenes (S05, S07, S12, S22, S33, S34) carry no data |
| No AI-generated images | ✅ | Everything is code-drawn charts and maps (Natural Earth). Narration is TTS |
| No static shot longer than 6 s | ✅ | `tools/make_storyboard.py` pacing check: max 6.3 s between cues, and those scenes have in-cue animation plus continuous camera moves |
| Audio and subtitles in sync | ✅ | Word-level alignment (95.0% match). Measured offset between the video's audio and the narration: 40 ms. Visual check at the "469" cue |
| BGM doesn't compete with narration | ✅ | BGM RMS −43.4 dBFS vs speech −21.4 dBFS (22 dB lower). Final mix −14.2 LUFS |
| `credits.csv` complete | ✅ | TTS, alignment model, BGM (in-house), map, fonts, Remotion |
| 3 thumbnails, 3 titles, description (chapters and sources) | ✅ | `thumb1-3.png`, `youtube.md` |
| YouTube synthetic-content disclosure | ⚠️ Needs a human | Narration is a synthetic voice, and the description says so. YouTube's "altered or synthetic content" setting is not strictly required for a synthetic voice that doesn't imitate a real person, but check the latest rules at upload |

## Output specs
- `episode01_finland.mp4`: 1920×1080, 30 fps, H.264, AAC 48 kHz stereo, 14:24, −14.2 LUFS
- `episode01_finland.srt`: 279 cues
- The mp4 and wav files are excluded from git because of GitHub's 100 MB limit (`.gitignore`). Regenerate with `node tools/render.mjs episodes/01-finland video …` followed by loudness normalisation

## Deviations from the Channel Bible (environment constraints)
1. **Basemap:** NASA Blue Marble / Black Marble could not be fetched (network block). Replaced with a dark vector basemap from Natural Earth.
2. **BGM:** YouTube Audio Library was unreachable. Replaced with an ambient pad generated in code (`tools/make_bgm.py`).
3. **Forced alignment:** whisper models are on blocked hosts. Word timestamps come from sherpa-onnx (zipformer) ASR instead, matched against the known script.
4. **STOP checkpoints:** after STOP 1, the user said "随時君が修正して" (fix as you go), so STOP 2–4 were not held.
