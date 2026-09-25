# Handoff notes (as of 2026-09-25, from a cloud session to local work)

## Status

- **Research**: `episodes/01-finland/research/`. oecd.org and other primary sites were blocked in the cloud, so values were only confirmed through search snippets. **Confirm them directly in the primary sources before release** (task list in `factcheck.md` §4 and §6).
- **Script v2**: `script/script_en.md` (EN) and `script_ja.md` (JA). Fully rewritten under the new rules (1,080 words, 7:25).
- **v2 full video**: rendered in the cloud (bm_lewis, new style, BGM Lexin). `python3 tools/pipeline.py episode` reproduces it.
- **Style sample**: `remotion/Sample.tsx` (P02–P04, 25 s). **This is the approved look.**
  - Build it with `python3 tools/pipeline.py sample`.
- **Style rules**: all feedback so far is in `CLAUDE.md` §3, §4, §5, §7 and §8. Main points:
  - Voice: Kokoro `bm_lewis`, speed 1.12, short pauses.
  - **Tempo first**: say each fact once, no restatements, keep one data point to 20–25 s at most. Aim for a short, tight video of 8–12 minutes.
  - Two typefaces: DM Serif Display for hero numbers, Archivo 800–900 for all other text. Text bold and large.
  - Text in two places only: the top-left caption slot and the main focal element. Text never overlaps anything. No rapid-fire short captions (each caption stays up at least 6 s).
  - Show data fast (`QuickLine` draws a whole chart in about 1.5 s; label only the start and end values). Don't read out every year's value.
  - Lots of motion: the camera never stops, and something happens every 2–3 s. But don't create motion by cutting scenes short.
  - Lead the eye: one focal point at a time, moved along to the next one.
- **BGM (decided)**: **"Cinematic Documentary" by Lexin_Music (Pixabay)**. Download it from https://pixabay.com/music/beautiful-plays-cinematic-documentary-115669/ and save it as `episodes/01-finland/audio/music/cinematic-documentary-lexin.mp3`; `pipeline.py` then picks it up automatically.
- **Old BGM note**: the producer found the code-composed music (`tools/make_music.py`) "too lonely", which is why ready-made music was chosen.
- Always export a no-BGM version as well (`pipeline.py` does this automatically).

## Next steps (in order)

1. **Verify primary sources** (network available locally): check the values in `research/data/*.csv` against the OECD PISA 2025/2022 tables, add table numbers to `facts.md`, and update `factcheck.md`.
2. ~~Rewrite the script~~ (done in v2).
3. ~~Rebuild every scene~~ (done in v2). Next: act on the producer's feedback on v2.
   - Use the `Caption`, `QuickLine`, `Camera` and `CircleMarker` components (in `engine/components/`).
   - Update the storyboard: `python3 tools/make_storyboard.py episodes/01-finland` (this also checks pacing).
   - Check `Episode.tsx`: chapter cards, transitions.
4. **BGM is decided** (see above). Download the file to the path above, then run `python3 tools/pipeline.py episode`.
5. Final check: `out/qa_checklist.md` (CLAUDE.md §12), thumbnails (`npm run thumbs`, restyled for the new fonts), `out/youtube.md` (update the chapter times).
6. Shorts ×3 (proposal in `out/shorts.md`).

## Notes

- Changing the script means regenerating the narration (`tools/pipeline.py`, or `engine/tts/tts.py`). The cue words in the scenes (`c('P03', 'lower')` and so on) must match the script words. Check with `python3 tools/check_cues.py episodes/01-finland`.
- Values marked `needs_primary` are excluded from the rendered data automatically (`tools/build_data.py`). Once confirmed, set the CSV `status` to `primary_confirmed`.
