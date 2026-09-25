# Storyboard — Episode 01

Times come from the narration timeline (`audio/timeline.json`). Chapter title cards sit in the 1.6 s pauses between sections.
Every scene has a continuous slow move (paper push-in or map Ken Burns), so no frame is fully static. The last column is the longest gap between cued visual changes in that scene.
The source tag is shown bottom-left on every data scene (see `SourceTag` in `remotion/scenes.tsx`).

| Scene | Start | Paragraphs | Narration (opening) | Mode | Components | Data (facts.md) | Motion | Longest gap between cues |
|---|---|---|---|---|---|---|---|---|
| S01 | 0:00.4 | P01 | In the early 2000s, education delegations from around the… | World | WorldMap(nordic)+arcs+pulse, Hero x2, Caption | F-VIS-1, F-VIS-2 | Flight paths converge on Helsinki; slow zoom; 16,000+ and €1,485 count up | 5.0s |
| S02 | 0:22.6 | P02, P03, P04 | They came to see a miracle. In 2006, Finnish… / Then it fell. Every round since has come in… / That's 79 points. By the OECD's own yardstick, roughly… | Paper | Hero 548 → QuickLine → drop bracket | F-FIN-M-2006..2025, F-FIN-DROP-M, F-OECD-YARD | 548 counts up, circled, flies to the line start; line draws in 1.3 s; −79 bracket, year ticks | 3.5s |
| S05 | 0:41.5 | P05 | The usual suspects are phones, the pandemic and immigration.… | Night | Struck words, Focal | — | Three suspects struck out; the thesis lands | 3.8s |
| S06 | 0:56.2 | P06 | The test is PISA, run by the OECD. Roughly… | World | WorldMap(world), Hero | F-PISA-SCALE | World pan; 91 counts up | 3.9s |
| S07 | 1:09.2 | P07 | It doesn't test what students memorised. It tests whether… | Paper | CardGrid 2×2 | — | Cards pop in on cue | 2.7s |
| S09 | 1:22.2 | P09 | The first results came out in December 2001, and… | Paper | Hero #1, Hero ×3 | F-PISA2000, F-FIN-*-2006 | #1, then three 2006 scores count up | 3.2s |
| S10 | 1:38.4 | P10, P11 | Visitors found a system that seemed to break every… / All of that was true. The mistake was one… | Paper | CardGrid 2×2, Focal | F-FEAT-*, F-DECENT | Four features; cards clear; 'because'; the false inference | 4.3s |
| S13 | 2:01.4 | P13 | But look at who sat the 2006 test. Born… | Paper | EraTimeline | F-COHORT-2006, F-DECENT | Born / school / tested markers; eras shade in | 4.3s |
| S14 | 2:23.4 | P14 | Here is the whole maths record. A small climb… | Paper | QuickLine | F-FIN-M-2003..2025 | Line draws fast; peak circled; step arrows | 4.3s |
| S15 | 2:35.2 | P15 | Reading followed the same path, from 547 down to… | Paper | Score rows → dot-gap | F-FIN-R/S, F-GAP-2025 | 547→474, 563→504; then gaps to OECD average | 4.1s |
| S16 | 2:55.2 | P16 | Part of this is global. Across the OECD, reading… | Paper | HBars | F-OECD-TREND, F-FIN-M-2015/2025 | OECD −28, −22; Finland −42 | 4.4s |
| S17 | 3:08.2 | P17 | In the early 2000s, about seven per cent of… | Paper | Waffle ×2 | F-FIN-LOW-*, F-FIN-TOP-* | 7→25 below baseline; 23→7 top | 4.2s |
| S19a | 3:25.2 | P19 | Now the neighbour. Estonia sits just across the Gulf… | World | WorldMap(nordic) | — | Zoom to the Gulf; Estonia lights up | 2.8s |
| S19b | 3:31.5 | P19 | Now the neighbour. Estonia sits just across the Gulf… | Paper | QuickLine ×2 (original analysis A) | F-EST-M-*, F-FIN-M-*, F-EST-LEAD-2025 | Both lines draw; 2012 'Level'; +39 | 3.4s |
| S21 | 3:45.3 | P21 | And the top of the OECD table in 2025?… | World | WorldMap(world), Hero | F-JPN-RANK | Pan from Finland to Japan; Japan lights up | 3.9s |
| S22 | 3:57.6 | P22 | Six explanations get the blame. A good one has… | Paper | CardGrid 3×2 | — | Six suspects pop in | 3.7s |
| S23 | 4:08.3 | P23 | Suspect one: immigration. Scores fell among students with and… | Paper | Arrows + Stamp | F-FIN-IMM-1, F-FIN-IMM-2 | Down vs flat arrows; ✗ stamp | 2.9s |
| S24 | 4:22.0 | P24 | Suspect two: phones and the pandemic. The OECD links… | Paper | Focal → QuickLine + vline + Stamp | F-DIG-1, F-FIN-M-* | Correlation line; slide vs COVID marker; △ stamp | 4.3s |
| S25 | 4:38.6 | P25 | Suspect three: reading. Finland's own education agency says reading… | Paper | Book icon, Focal, Stamp | F-OPH-READ, F-READ-ENJ | Book fades; two statements; ○ stamp | 4.6s |
| S26 | 5:00.1 | P26 | Suspect four: student-led learning. A new curriculum built around… | Paper | QuickLine + band + vline + Stamp | F-CUR-2014, F-FIN-M-* | Already falling band; 2016 marker; △ stamp | 2.9s |
| S27 | 5:12.5 | P27 | Suspect five: inequality. More low performers, fewer top performers,… | Paper | CardGrid 1×3 + Stamp | F-FIN-DIFF | Three findings; — stamp | 2.8s |
| S28 | 5:22.5 | P28 | Suspect six: the legacy. In 2015, the economist Gabriel… | Paper | Quote (summary), Focal | F-HS-2015 | Quote builds; the older cause | 4.5s |
| S29 | 5:41.5 | P29 | Now shift every maths score back eight years, to… | Paper | QuickLine by entry year (original analysis C) + Stamp | F-COHORT, F-FIN-M-* | Peak band; step arrows; ○ stamp | 4.4s |
| S30 | 6:00.9 | P30 | So is East Asia the answer? Japan tops the… | Paper | HBars | F-JPN-CUR, F-JPN-PER | Japan vs OECD self-reports | 4.4s |
| S31 | 6:19.2 | P31 | Critics like the education scholar Yong Zhao argue that… | Paper | Focal ×2 | F-ZHAO | Critique → one test ≠ verdict | 3.4s |
| S32 | 6:30.6 | P32 | And Finland is still above average in every subject.… | Paper | #1 → =17 | F-PISA2000, F-FIN-R-RANK-2025 | Rank slide | 3.9s |
| S33 | 6:43.9 | P33 | Finland's success was real. But the world copied what… | Paper | CardGrid ×2 | — | Copied vs missed; missed fades | 4.0s |
| S34 | 7:00.6 | P34 | So the next time a headline announces an education… | Night | Three questions | — | Questions slide in | 3.9s |
| S35 | 7:13.2 | P35, P36 | Finland didn't fall because it stopped being Finland. It… / What did your school get right that no ranking… | World | WorldMap(nordic), Focal | — | Zoom out; closing line; comment question | 3.3s |

## Pacing check (> 6 s between cued changes)

- None
