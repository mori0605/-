# Shorts proposal (vertical 1080×1920, 30–55 s). To be rendered after approval.

| # | Working title | Source paragraphs | Length (narration) | The single surprising number | Visual |
|---|---|---|---|---|---|
| 1 | "548 → 469: the fastest fall in the class" | P02–P04 | ≈ 45 s | −79 points ≈ three years of learning | S02 + S03 re-laid vertically: the line extends as each number is spoken; 22-point year blocks stack |
| 2 | "Estonia overtook Finland. Here's the moment." | P19–P20 | ≈ 45 s | 2006 gap of 33 points → a tie in 2012 → 508 vs 469 in 2025 | Nordic map (World mode), then the crossover chart (original analysis A) |
| 3 | "Japan is #1 — so why are its students less curious?" | P21 + P30 | ≈ 50 s | 1st in the OECD in all three; curiosity 63% vs 73% | Japan vs OECD bars → self-report bars; ends on "High scores ≠ a solved system" |

Implementation: add a `Short` composition (1080×1920) that reuses the same scene components with a vertical layout variant, re-synthesise only the paragraphs used (same voice), and add a 2-word hook card for the first 1.5 s.
