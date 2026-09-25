# facts.md — Episode 01 (Finland)

Every on-screen or narrated number must come from this file. Fact IDs match `data/*.csv`.
Retrieved: 2026-09-25.

**Status legend**
- `search_confirmed` — the value appears in the primary source's own text (OECD, Finnish Government/OKM, University of Jyväskylä, Estonian ministry), seen through a search snippet. **The page itself could not be opened** (oecd.org and others are blocked by this environment's network policy). Before release, open each one directly and add the table number.
- `needs_primary` — a value I know from earlier OECD releases but could not confirm this session. **Do not use in the script** until it is verified.
- `secondary_only` — only seen in news or aggregator coverage. Treat as a lead only.

---

## A. Finland — mean scores

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| F-FIN-M-2006 | Finland math, 2006 (peak) | 548 | search_confirmed | Fordham Institute (cites OECD); OECD Education GPS |
| F-FIN-M-2003..2018 | Finland math: 2003 544 / 2009 541 / 2012 519 / 2015 511 / 2018 507 | see CSV | search_confirmed | same as above |
| F-FIN-M-2022 | Finland math, 2022 | 484 | search_confirmed | Finnish Government / JYU, PISA 2022 |
| F-FIN-M-2025 | Finland math, 2025 | 469 | search_confirmed | Finnish Government, PISA 2025 press release |
| F-FIN-R-2022 | Finland reading, 2022 | 490 | search_confirmed | OECD Education GPS |
| F-FIN-R-2025 | Finland reading, 2025 (down 16 from 2022) | 474 | search_confirmed | Finnish Government; Helsinki Times |
| F-FIN-R-RANK-2025 | Reading rank 2025: joint 17th with Italy | 17 | search_confirmed (via Helsinki Times) | Needs checking against the OECD ranking table |
| F-FIN-S-2006 | Finland science, 2006 | 563 | search_confirmed | OECD Education GPS |
| F-FIN-S-2022 | Finland science, 2022 | 511 | search_confirmed | OECD Education GPS |
| F-FIN-S-2025 | Finland science, 2025 | 504 | search_confirmed | Finnish Government |
| F-FIN-S-RANK-2025 | Science rank 2025 | 12th | search_confirmed | Finnish Government / Helsinki Times |
| F-FIN-DROP-M | Math drop, 2006 peak → 2025 | **−79 points** (548→469) | derived | computed from the rows above |

## B. Finland — proficiency levels

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| F-FIN-LOW-2006 | Math below Level 2, early 2000s | ~7% | search_confirmed | University of Jyväskylä (national PISA centre) |
| F-FIN-LOW-2022 | Math below Level 2, 2022 | ~25% (1 in 4) | search_confirmed | JYU |
| F-FIN-LOW-Δ2015 | Change in below-Level-2 share, 2015→2025 | math +17pp, reading +15pp, science +8pp | search_confirmed | Finnish Government, PISA 2025 |
| F-FIN-LOW-R-2025 | Reading below Level 2, 2025 | "more than 1 in 4"; about 1 in 3 among boys | search_confirmed | Finnish Government / Helsinki Times |
| F-FIN-TOP-2003 | Math top performers (Level 5+), 2003 | >23% | search_confirmed (Helsinki Times, citing the national report) | Needs the primary table |
| F-FIN-TOP-2025 | Math top performers, 2025 | 7% (below the OECD average) | same as above | same as above |

## C. Immigrant background

| ID | Claim | Status | Source |
|---|---|---|---|
| F-FIN-IMM-1 | Scores fell both for students with and without a migrant background | search_confirmed | Yle 74-20063678; Finnish Government "Performance of immigrant students in PISA 2022" |
| F-FIN-IMM-2 | Math: immigrant-background students stayed at their 2012 level; other students declined. The gap to first-generation students narrowed by 11 points | search_confirmed | Finnish Government (PISA 2022) |

## D. Comparison countries (2025)

| ID | Claim | Value | Status | Source |
|---|---|---|---|---|
| F-JPN-2025 | Japan science / reading / math | 538 / 503 / 525 | search_confirmed | OECD Country Note: Japan; Nippon.com |
| F-JPN-RANK | Japan: 1st in all three subjects among 38 OECD countries, the first time since 2000. All participants: science 5th, reading 4th, math 5th | — | search_confirmed | NIER / Nippon.com |
| F-EST-2025 | Estonia science / math / reading | 527 / 508 / 499 | search_confirmed | ERR; Education Estonia |
| F-EST-RANK | Estonia: science 6th overall and 1st in Europe; math 1st in Europe; reading 2nd in Europe | — | search_confirmed | ERR / Education Estonia |
| F-OECD-2025 | OECD average math / reading / science | 463 / 461 / 482 | search_confirmed | OECD press release |
| F-OECD-TREND | OECD average 2015→2025: reading −28 (about 1.5 years of learning); math −22 (just over 1 year) | — | search_confirmed | OECD press release |
| F-PISA-SCALE | PISA 2025: 91 countries and economies, about 760,000 students | — | search_confirmed | OECD press release |
| F-OECD-LOW-2025 | 1 in 5 OECD students is a low performer in all three subjects (16% in 2022) | — | search_confirmed | OECD press release |

## E. 2022 context

| ID | Claim | Status | Source |
|---|---|---|---|
| F-2022-JPKR | 2022 math: Japan and Korea were the only OECD members whose scores rose | search_confirmed | JYU / OECD PISA 2022 Vol. I |
| F-2022-OECDΔ | OECD average math fell 15 points, 2018→2022, a record | search_confirmed | OECD PISA 2022 Vol. I |
| F-2022-OECD-M | OECD average math 2022: 472 | search_confirmed | Yle |

## F. Counterpoint

| ID | Claim | Status | Source |
|---|---|---|---|
| F-JPN-CUR | "Curious about many different things": Japan 63%, OECD 73% | search_confirmed | OECD Country Note: Japan (text); np-schools |
| F-JPN-PER | "Apply additional effort when work becomes challenging": Japan 48%, OECD 60% | search_confirmed | same as above |
| F-DIG-1 | Leisure use of devices at school, or excessive use, is associated with sharply lower performance; moderate use for learning is often associated with better results (correlational) | search_confirmed | OECD PISA 2025 press release / Vol. I |
| F-DIG-2 | More than 1 in 4 students say classmates are distracted by devices in most or every science lesson | search_confirmed | OECD PISA 2025 |

## G. Cold open and background

| ID | Claim | Status | Source |
|---|---|---|---|
| F-VIS-1 | The Finnish National Agency for Education alone has hosted 16,000+ international visitors since the early 2000s | search_confirmed | OPH news 2020 |
| F-VIS-2 | School visits are paid: currently €1,485 per school visit plus VAT, max 20 people. An earlier figure was €1,240 per visit | search_confirmed (earlier figure from secondary coverage) | OPH "Services for international visitors" |
| F-HS-2015 | Heller Sahlgren, *Real Finnish Lessons* (CPS, 15 Apr 2015): Finland's rise came before the famous reforms took effect, and its decline began soon after they did. He credits deep-rooted historical and cultural factors and traditional, teacher-led methods | search_confirmed | CPS PDF / IFN |

## H. Added for Step 2 (all search_confirmed)

| ID | Claim | Source |
|---|---|---|
| F-PISA2000 | PISA 2000: Finland highest in reading literacy (546 points); results published December 2001 | OKM "PISA survey and Finland's results" https://okm.fi/en/pisa-2000-en ; NCES 2002-116 |
| F-FIN-R-PEAK | Finnish reading peaked at 547 in 2006 (2000: 546) | EERA contribution 33833; OECD Education GPS |
| F-FEAT-AGE | Compulsory schooling starts at age 7 | InfoFinland https://infofinland.fi/en/education/the-finnish-education-system |
| F-FEAT-MA | Class teachers (grades 1–6) must hold a master's degree in education | Suomi.fi / OPH "Qualification of class teacher" |
| F-FEAT-TEST | No national standardised test until the matriculation exam at the end of upper secondary school | Finland Toolbox / Eurydice |
| F-DECENT | In the 1980s–90s school inspections and pre-approval of learning materials were abolished. Since 1994 local providers have been responsible for quality assurance and local curricula | OECD "Finland: Slow and Steady Reform" (PISA 2009 profile) |
| F-CUR-2014 | New core curriculum for basic education published in 2014; local curricula introduced gradually from August 2016. Includes phenomenon-based and cross-disciplinary learning | OPH https://www.oph.fi/en/education-and-qualifications/national-core-curriculum-primary-and-lower-secondary-basic-education |
| F-READ-ENJ | The share of Finnish students reading for enjoyment fell between 2000 and 2009, by more than the OECD average | OECD PISA in Focus 2011/8 |
| F-OPH-READ | OPH: reading used to be a popular pastime and supported results; social media and gaming now take up young people's time. The decline in literacy is key to the across-the-board decline | OPH blog https://www.oph.fi/en/blog/pisa-results-reflect-broader-changes-finnish-society |
| F-ZHAO | Yong Zhao (*Who's Afraid of the Big Bad Dragon?*, 2014) argues that test-driven systems can produce high scores while suppressing creativity; PISA measures a narrow range of cognitive skills | Education Next review; TES interview |
| F-FIN-DIFF | Finland 2025: more low performers, fewer top performers, widening gaps between students | Finnish Government, PISA 2025 |
| F-EST-DECL | Estonia's 2025 math and reading are significantly lower than in 2015 and 2018 | ERR / Education Estonia |
| F-OECD-YARD | OECD: 22 points ≈ "just over one year of learning"; 28 points ≈ about 1.5 years | OECD press release 2026 |
| F-DERIV-YEARS | Derived: 79 ÷ 22 ≈ 3.6 → **"roughly three years or more of learning"**. The yardstick is approximate, so say "roughly" | calculation |
| F-COHORT | School-entry year = PISA year − 8 (test at 15, school entry at 7; approximate) | derived from F-FEAT-AGE |
| F-FIN-IMM-3 | On average, immigrant-background students in Finland score below their peers | Yle https://yle.fi/a/74-20115176 ; Finnish Government (PISA 2022) |
| F-COHORT-2006 | 2006 test-takers: born ≈1991 (2006 − 15), school entry ≈1998 (2006 − 8) | derived from F-COHORT |
| F-DECENT-1990s | "1990s: the rules change" = inspections and pre-approval of materials abolished (1980s–90s); local curricula from 1994 | F-DECENT |
| F-EST-GAP-2006 | Estonia–Finland maths gap in 2006 = 548 − 515 = 33 | derived |
| F-GAP-2025 | Finland − OECD, 2025: maths +6, reading +13, science +22 | derived from F-OECD-2025 and F-FIN-*-2025 |
