# Storyboard — Episode 01

Times come from the narration timeline (`audio/timeline.json`). Chapter title cards sit in the 2.6 s pauses between sections.
Every scene has a continuous slow move (paper push-in or map Ken Burns), so no frame is fully static. The last column is the longest gap between cued visual changes in that scene.
The source tag is shown bottom-left on every data scene (see `SourceTag` in `remotion/scenes.tsx`).

| Scene | Start | Paragraphs | Narration (opening) | Mode | Components | Data (facts.md) | Motion | Longest gap between cues |
|---|---|---|---|---|---|---|---|---|
| S01 | 0:00.4 | P01 | In the early 2000s, a small Nordic country became… | World | WorldMap(nordic), StatCallout×2 | F-VIS-1, F-VIS-2 | Zoom from Europe to Helsinki; Finland lights up in vermilion; 16,000+ and €1,485 count up | 4.7s |
| S02 | 0:26.5 | P02 | They came to see a miracle. In 2006, Finnish… | Paper | StatCallout | F-FIN-M-2006 | 548 counts up in vermilion | 5.3s |
| S03 | 0:40.8 | P03, P04 | Now watch what happened next. 541. 519. 511. 507.… / That is a fall of 79 points. By the… | Paper | LineChart, bracket, yardstick blocks | F-FIN-M-2006..2025, F-OECD-YARD | Line extends to each score as it is spoken; −79 bracket; 22-point blocks stack | 5.8s |
| S05 | 1:15.3 | P05 | The usual explanations are phones, the pandemic, and immigration.… | Night | Line + strike | — | Three suspects appear and are struck through; the question | 5.4s |
| S06 | 1:38.0 | P06 | First, the scoreboard. PISA is the OECD's Programme for… | World | WorldMap(world), StatCallout×2 | F-PISA-SCALE | Slow world pan; 91 / 760,000 count up | 5.4s |
| S07 | 2:02.1 | P07 | PISA doesn't ask students to recite a syllabus. It… | Paper | Line ×4 | — | What PISA does and doesn't test; the minister joke | 4.1s |
| S08 | 2:19.1 | P08 | On the PISA scale, a gap of ten or… | Paper | EraTimeline as points scale | F-OECD-YARD, F-FIN-DROP-M | Points ruler: 10–15 band, 22 = 1 year, 79 | 4.4s |
| S09 | 2:32.0 | P09 | When the first PISA results came out in December… | Paper | Line, StatCallout×3 | F-PISA2000, F-FIN-R-PEAK, F-FIN-M-2006, F-FIN-S-2006 | #1 in reading 2000; three 2006 scores count up | 3.2s |
| S10 | 2:51.7 | P10, P11 | The visitors found a system that looked almost designed… / Here was a country that tested less, started later… | Paper | Feature cards ×4, frame | F-FEAT-AGE, F-FEAT-TEST, F-DECENT, F-FEAT-MA | Cards appear on cue; framed as "The Finnish model" | 5.9s |
| S12 | 3:28.5 | P12 | None of those features was invented. They were real.… | Paper | Line | — | "because" → correlation mistaken for cause | 5.5s |
| S13 | 3:42.6 | P13 | But think about who actually sat the test in… | Paper | EraTimeline | F-COHORT, F-DECENT | Born 1991 / school 1998 / tested 2006; eras shaded | 5.0s |
| S14 | 4:22.2 | P14 | Here is Finland's maths score, round by round. 544… | Paper | LineChart | F-FIN-M-2003..2025 | Full maths series draws | 3.7s |
| S15 | 4:38.6 | P15 | Reading tells the same story. From a peak of… | Paper | LineChart ×3 (small multiples) | F-FIN-R/S-2006/2025, ranks, F-OECD-2025 | 2006→2025 slope per subject; OECD reference | 5.8s |
| S15b | 5:04.6 | P15b | Just not by much. In maths, the OECD average… | Paper | Dot-gap chart | F-OECD-2025, F-FIN-*-2025 | Finland vs OECD dots, gap shown | 6.2s |
| S16 | 5:25.5 | P16 | And Finland is not falling alone. Across the OECD,… | Paper | HBars | F-OECD-TREND, F-2022-OECDΔ | OECD-wide losses grow | 5.8s |
| S17 | 5:50.5 | P17 | But only part. An average can hide a lot,… | Paper | Waffle | F-FIN-LOW-* | 7 → 25 of 100 students light up | 4.6s |
| S18 | 6:19.0 | P18 | The top has thinned out too. In 2003, more… | Paper | Waffle | F-FIN-TOP-2003/2025 | 23 → 7 of 100 | 5.4s |
| S19a | 6:37.3 | P19 | Now bring in the neighbour. Estonia sits just across… | World | WorldMap(nordic) | — | Zoom to the Gulf of Finland; Estonia lights up in indigo | 3.4s |
| S19b | 6:44.0 | P19, P20 | Now bring in the neighbour. Estonia sits just across… / In 2025, Estonia scored 508 in maths against Finland's… | Paper | LineChart (original analysis A), table | F-EST-M-*, F-FIN-M-*, F-EST-2025, F-EST-RANK | Both lines draw; 2012 tie marked; 2025 table fills | 5.8s |
| S21 | 7:25.4 | P21 | And at the top of the OECD table, there's… | Paper | HBars | F-JPN-2025, F-JPN-RANK, F-2022-JPKR | Japan vs OECD bars | 6.3s |
| S22 | 7:54.9 | P22 | There are six popular explanations for Finland's decline. A… | Paper | Criteria list + suspect cards | — | Three tests; six suspects | 4.2s |
| S23 | 8:13.6 | P23 | Suspect one: immigration. Finland has become more diverse, and… | Paper | VerdictCard ✗ | F-FIN-IMM-1..3 | Evidence lines; verdict stamp | 5.2s |
| S24 | 8:42.6 | P24 | Suspect two: phones and the pandemic. The OECD's 2025… | Paper | VerdictCard △ + EraTimeline | F-DIG-1, F-DIG-2 | Evidence; 2006 vs 2020 timeline; stamp | 5.5s |
| S25 | 9:18.0 | P25 | Suspect three: reading. Finland's own education agency says that… | Paper | VerdictCard ○ | F-OPH-READ, F-READ-ENJ, F-FIN-LOW-R-2025 | Evidence; stamp | 5.6s |
| S26 | 10:00.9 | P26 | Suspect four: student-led learning. In 2014, Finland published a… | Paper | VerdictCard △ + LineChart | F-CUR-2014, F-FIN-M-* | Line draws, 2016 marker; stamp | 5.5s |
| S27 | 10:33.1 | P27 | Suspect five: inequality. The Finnish government's own summary of… | Paper | VerdictCard — | F-FIN-DIFF | Three findings; stamp | 4.3s |
| S28 | 10:55.2 | P28 | Which brings us to suspect six: the legacy. In… | Paper | QuoteCard | F-HS-2015 | Summary of Heller Sahlgren's argument | 5.7s |
| S29 | 11:22.7 | P29 | Remember 1998, the year our peak test-takers started school?… | Paper | LineChart (original analysis C) | F-COHORT, F-FIN-M-*, F-CUR-2014 | Series re-plotted by school-entry year; peak band; 2016 line; verdict | 5.4s |
| S30 | 12:01.3 | P30 | So should everyone just copy Japan instead? Not so… | Paper | HBars | F-JPN-CUR, F-JPN-PER | Japan vs OECD self-reports | 6.2s |
| S31 | 12:32.2 | P31 | Critics like the education scholar Yong Zhao have spent… | Paper | QuoteCard | F-ZHAO | Paraphrase of Zhao's argument | 5.3s |
| S32 | 12:52.3 | P32 | And perspective matters. Finland is still above the OECD… | Paper | StatCallout ×2 | F-PISA2000, F-FIN-R-RANK-2025, F-FIN-S-RANK-2025 | #1 → =17 | 4.2s |
| S33 | 13:11.5 | P33 | So what happened? Finland's success in the 2000s was… | Paper | Two columns | — | Copied vs missed; the missed column fades | 5.4s |
| S34 | 13:38.9 | P34 | That's the real lesson, and it isn't about Finland.… | Night | Line ×3 | — | Three questions | 6.0s |
| S35 | 14:10.1 | P35, P36 | Finland didn't fall because it stopped being Finland. It… / So here's my question for you. What did your… | World | WorldMap(nordic), TitleCard | — | Slow zoom out from Finland; closing line; comment question | 4.9s |

## Pacing check (> 6 s between cued changes)

- S15b: 6.2s without a cued change (from 5:06.4); covered by continuous camera move
- S21: 6.3s without a cued change (from 7:32.4); covered by continuous camera move
- S30: 6.2s without a cued change (from 12:15.8); covered by continuous camera move
- S34: 6.0s without a cued change (from 13:39.6); covered by continuous camera move
