# factcheck.md — Episode 01

Checks each provisional value in brief section 2 against primary sources. Retrieved 2026-09-25.

**Important limitation:** this environment's network policy blocks oecd.org, okm.fi, yle.fi, err.ee and most other source sites. Every check below was done by reading the primary page's text through Web search. Before release, someone must open each page directly and record the table number.

## 1. Differences from the brief's provisional values

| # | Claim (brief) | Check result | Verdict | Notes |
|---|---|---|---|---|
| 1 | Math 548 (2006) → 484 (2022) → 469 (2025) | Matches | ✅ | Peak-to-2025 drop = 79 points ("about 80" is fine) |
| 2 | Reading 490 → 474, joint 17th with Italy | Matches | ✅ | Rank from Helsinki Times; confirm the OECD ranking table |
| 3 | Science 511 → 504 (from an aggregator) | Matches the Finnish Government release. Science 12th | ✅ | Now confirmed at a primary source |
| 4 | Math below Level 2: ~7% → ~1 in 4 | JYU: "7% in the early 2000s → 25% in 2022" | ✅ | Base year is "early 2000s", so the script must not say "2006" |
| 5 | Math rank 20th in 2022 (Fordham) | Not confirmed | ⚠️ | Keep out of the script, or verify against the OECD table |
| 6 | Mean math fell in 41 countries/economies in 2022 | Not confirmed. What can be confirmed: the OECD average fell 15 points, a record, and 31 countries/economies held their level | ⚠️ | Replace with the "record −15 points" figure |
| 7 | Scores fell with or without a migrant background | Confirmed, plus stronger evidence: in math, immigrant-background students held their 2012 level while others fell | ✅ | Strong evidence for Act 3 |
| 8 | Japan 538 / 503 / 525, 1st in the OECD in all three for the first time | Matches | ✅ | |
| 9 | Estonia 527 / 508 / 499 | Matches | ✅ | |
| 10 | OECD math 463; reading −28, math −22 (2015–25) | Matches. Also: 91 countries, 760,000 students | ✅ | |
| 11 | Only Japan and Korea raised math scores in 2022 | Matches (among OECD members) | ✅ | |
| 12 | Japan curiosity 63% (OECD 73%), perseverance 48% (OECD 60%) | Matches | ✅ | Self-reports: add an on-screen note about cultural response bias |
| 13 | Excessive or leisure device use is linked to lower scores | Matches. Correlation only | ✅ | Say "is associated with" |
| 14 | Some schools charged for visits (to be confirmed) | Confirmed that OPH charges (€1,485 per visit today) | ✅ (reword) | Say "the national agency now charges", not "schools charged" |
| 15 | 2025 math top performers | New finding: >23% in 2003 → 7% in 2025 | 🆕 | Useful for the decomposition analysis |

## 2. Comparability caveats (to put on screen or in narration)

1. **Base year differs by subject.** Reading has comparable data from 2000, math from 2003, science from 2006.
2. **2015 switch to computer-based testing.** Scores before and after 2015 are linked, but the OECD has flagged mode effects.
3. **The 2022 wave was taken during or after COVID, and the 2025 frame changed.** 2022 was delayed by a year. Don't link points with a straight line as if the gaps were equal.
4. **Rankings include ties and non-significant differences.** Use ranks with care ("joint 17th", "among the top").
5. **Low scores in 2025 may partly reflect lower test effort.** The OECD mentions this, but it is unconfirmed here. Check it in the OECD text.
6. **Self-report indicators (curiosity and so on)** are affected by cultural response styles. Don't present them as a direct international ranking.

## 3. Which original analyses hold up

| Candidate | Verdict | Reason |
|---|---|---|
| **A. Finland–Estonia crossover** | ✅ **Holds up** (current data is enough) | Means for both countries in all three subjects, 2006–2025, are confirmed. Crossover: **math 2012** (EST 521 vs FIN 519, not significant) and a clear gap from 2015; **science 2015** (534 vs 531); **reading 2018** (523 vs 520). Only EST reading 2022 still needs checking |
| **B. Top/bottom decomposition** | △ **Partly** | Only a few years' level shares are confirmed (low 7%→25%, top 23%→7%). A full series needs the OECD tables. With those, it holds up: the decline comes from both ends shrinking and growing, the top falling and the bottom widening |
| **C. Cohort-shifted chart** | ✅ Holds up, **with a correction to the brief** | The brief says "test year minus 15 = school entry year", but test year minus 15 is the **birth year**. Finland starts school at 7, so **school entry ≈ test year − 8**. The 2006 peak cohort (born ~1990) entered school in ~1997 and did lower secondary under the 1994 curriculum framework. The 2025 cohort (entered ~2017) studied under the 2016 curriculum from grade 1. This is only a relabelling of the axis, so it shows **timing consistency**, not causation. The script must say so |

**Recommendation:** use A as the main original chart, C as the visual check of the legacy hypothesis in Act 3, and B once the OECD tables are available.

## 4. Remaining tasks (require network access)

- oecd.org (PISA 2025 Vol. I tables, PISA Data Explorer, Education GPS) is needed for:
  - Finland means marked `needs_primary` (reading 2003–2015, science 2009–2018)
  - Series 2000–2025 for JPN, KOR, SWE, USA, GBR and the OECD average (currently only fragments)
  - Series of proficiency-level shares for the decomposition analysis
  - Table numbers for every value
- Heller Sahlgren's original text (cps.org.uk PDF)
- OPH's reading-culture data, for a reading-habits chart

---

## 5. Decisions after STOP 1 (from 2026-09-25, delegated to Claude by the user)

- **Approval to proceed:** the user said "随時君が修正して" (fix things as you go). Steps 2–5 went ahead without stopping, using the search-confirmed values. `needs_primary` values are excluded from the rendered data automatically (`tools/build_data.py`).
- **Cohort chart:** fixed to "school-entry year ≈ PISA year − 8" (brief said −15).
- **Values not used in the script:** "20th in maths in 2022" (unconfirmed), "maths fell in 41 countries/economies" (unconfirmed), all `needs_primary` values.
- **Framing adjusted:**
  - "Schools charged for visits" became "the national agency charges".
  - "About 80 points" became "79 points" plus "very roughly three years" (79 ÷ 22 ≈ 3.6, rounded down conservatively).
  - Heller Sahlgren's argument is shown as a **summary**, not a quote.
  - Zhao's argument is shown as a **paraphrase**.
- **Added facts** (facts.md §H): PISA 2000 reading rank 1; 2006 reading 547; school entry at 7; teachers need a master's degree; no national test; 1990s decentralisation; 2014 curriculum (introduced from 2016); reading for enjoyment; OPH analysis; Zhao; immigrant-background students' mean.

## 6. Remaining risks before release

1. Once oecd.org is reachable, check every `search_confirmed` value against the primary tables and add table numbers.
2. Rank "joint 17th with Italy" and "12th in science" come from the Finnish Government and Helsinki Times. Check them against the OECD ranking table (ranks can include ties).
3. The top-performer figures (2003 >23%, 2025 7%) come from Helsinki Times citing the national report. Confirm them in the primary table.
