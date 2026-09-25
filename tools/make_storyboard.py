"""Build storyboard.md from the scene plan + narration timeline, and check pacing.

Pacing check: within each scene, collect the times of every narration cue that
triggers a visual change; report any gap > 6 s (CLAUDE.md §4). All scenes also
carry a continuous slow push-in / Ken Burns move.

Usage: python3 tools/make_storyboard.py episodes/01-finland
"""
import json
import re
import sys

ep = sys.argv[1]
tl = json.load(open(f"{ep}/audio/timeline.json"))
paras = {p["id"]: p for p in tl["paragraphs"]}
norm = lambda s: re.sub(r"[^a-z0-9%-]", "", re.sub(r"[’']", "", s.lower()))

PLAN = [
    # id, paragraphs, mode, components, data/facts, motion
    ("S01", ["P01"], "World", "WorldMap(nordic)+arcs+pulse, Hero x2, Caption", "F-VIS-1, F-VIS-2", "Flight paths converge on Helsinki; slow zoom; 16,000+ and €1,485 count up"),
    ("S02", ["P02", "P03", "P04"], "Paper", "Hero 548 → QuickLine → drop bracket", "F-FIN-M-2006..2025, F-FIN-DROP-M, F-OECD-YARD", "548 counts up, circled, flies to the line start; line draws in 1.3 s; −79 bracket, year ticks"),
    ("S05", ["P05"], "Night", "Struck words, Focal", "—", "Three suspects struck out; the thesis lands"),
    ("S06", ["P06"], "World", "WorldMap(world), Hero", "F-PISA-SCALE", "World pan; 91 counts up"),
    ("S07", ["P07"], "Paper", "CardGrid 2×2", "—", "Cards pop in on cue"),
    ("S09", ["P09"], "Paper", "Hero #1, Hero ×3", "F-PISA2000, F-FIN-*-2006", "#1, then three 2006 scores count up"),
    ("S10", ["P10", "P11"], "Paper", "CardGrid 2×2, Focal", "F-FEAT-*, F-DECENT", "Four features; cards clear; 'because'; the false inference"),
    ("S13", ["P13"], "Paper", "EraTimeline", "F-COHORT-2006, F-DECENT", "Born / school / tested markers; eras shade in"),
    ("S14", ["P14"], "Paper", "QuickLine", "F-FIN-M-2003..2025", "Line draws fast; peak circled; step arrows"),
    ("S15", ["P15"], "Paper", "Score rows → dot-gap", "F-FIN-R/S, F-GAP-2025", "547→474, 563→504; then gaps to OECD average"),
    ("S16", ["P16"], "Paper", "HBars", "F-OECD-TREND, F-FIN-M-2015/2025", "OECD −28, −22; Finland −42"),
    ("S17", ["P17"], "Paper", "Waffle ×2", "F-FIN-LOW-*, F-FIN-TOP-*", "7→25 below baseline; 23→7 top"),
    ("S19a", ["P19"], "World", "WorldMap(nordic)", "—", "Zoom to the Gulf; Estonia lights up"),
    ("S19b", ["P19"], "Paper", "QuickLine ×2 (original analysis A)", "F-EST-M-*, F-FIN-M-*, F-EST-LEAD-2025", "Both lines draw; 2012 'Level'; +39"),
    ("S21", ["P21"], "World", "WorldMap(world), Hero", "F-JPN-RANK", "Pan from Finland to Japan; Japan lights up"),
    ("S22", ["P22"], "Paper", "CardGrid 3×2", "—", "Six suspects pop in"),
    ("S23", ["P23"], "Paper", "Arrows + Stamp", "F-FIN-IMM-1, F-FIN-IMM-2", "Down vs flat arrows; ✗ stamp"),
    ("S24", ["P24"], "Paper", "Focal → QuickLine + vline + Stamp", "F-DIG-1, F-FIN-M-*", "Correlation line; slide vs COVID marker; △ stamp"),
    ("S25", ["P25"], "Paper", "Book icon, Focal, Stamp", "F-OPH-READ, F-READ-ENJ", "Book fades; two statements; ○ stamp"),
    ("S26", ["P26"], "Paper", "QuickLine + band + vline + Stamp", "F-CUR-2014, F-FIN-M-*", "Already falling band; 2016 marker; △ stamp"),
    ("S27", ["P27"], "Paper", "CardGrid 1×3 + Stamp", "F-FIN-DIFF", "Three findings; — stamp"),
    ("S28", ["P28"], "Paper", "Quote (summary), Focal", "F-HS-2015", "Quote builds; the older cause"),
    ("S29", ["P29"], "Paper", "QuickLine by entry year (original analysis C) + Stamp", "F-COHORT, F-FIN-M-*", "Peak band; step arrows; ○ stamp"),
    ("S30", ["P30"], "Paper", "HBars", "F-JPN-CUR, F-JPN-PER", "Japan vs OECD self-reports"),
    ("S31", ["P31"], "Paper", "Focal ×2", "F-ZHAO", "Critique → one test ≠ verdict"),
    ("S32", ["P32"], "Paper", "#1 → =17", "F-PISA2000, F-FIN-R-RANK-2025", "Rank slide"),
    ("S33", ["P33"], "Paper", "CardGrid ×2", "—", "Copied vs missed; missed fades"),
    ("S34", ["P34"], "Night", "Three questions", "—", "Questions slide in"),
    ("S35", ["P35", "P36"], "World", "WorldMap(nordic), Focal", "—", "Zoom out; closing line; comment question"),
]

src = open(f"{ep}/remotion/scenes.tsx").read()
bodies = {m.group(1): m.group(2) for m in re.finditer(r"export const (S\w+): React\.FC = \(\) => \{(.*?)\n\};", src, re.S)}


def cue_time(pid, phrase, nth=1):
    target = [norm(w) for w in phrase.split()]
    ws = paras[pid]["words"]
    seen = 0
    for i in range(len(ws) - len(target) + 1):
        if [norm(w["w"]) for w in ws[i:i + len(target)]] == target:
            seen += 1
            if seen == nth:
                return ws[i]["s"]
    raise KeyError((pid, phrase))


def fmt(s):
    return f"{int(s // 60)}:{s % 60:04.1f}"


rows, warnings = [], []
for sid, ps, mode, comp, data, motion in PLAN:
    if sid == "CH":
        continue
    start = paras[ps[0]]["start"]
    end = paras[ps[-1]]["end"]
    if sid == "S19b":
        start = cue_time("P19", "2006,") - 0.6
    if sid == "S02":
        start = cue_time("P02", "548") - 0.3
    if sid == "S19a":
        end = cue_time("P19", "2006,") - 0.6
    if sid == "S01":
        end = cue_time("P02", "548") - 0.3
    body = bodies.get(sid, "")
    times = sorted(cue_time(p, w, int(n or 1)) for p, w, n in re.findall(r"c\('(\w+)', ['\"]([^'\"]+)['\"](?:, (\d+))?\)", body))
    times = [start] + [x for x in times if start - 1 <= x <= end + 1] + [end]
    gaps = [(b - a, a) for a, b in zip(times, times[1:])]
    worst = max(gaps)[0] if gaps else 0
    if worst > 6:
        warnings.append(f"{sid}: {worst:.1f}s without a cued change (from {fmt(max(gaps)[1])}); covered by continuous camera move")
    text = " ".join(paras[p]["words"][0]["w"] for p in ps)
    narr = " / ".join(" ".join(w["w"] for w in paras[p]["words"][:9]) + "…" for p in ps)
    rows.append(f"| {sid} | {fmt(start)} | {', '.join(ps)} | {narr} | {mode} | {comp} | {data} | {motion} | {worst:.1f}s |")

with open(f"{ep}/storyboard.md", "w") as f:
    f.write("# Storyboard — Episode 01\n\n")
    f.write("Times come from the narration timeline (`audio/timeline.json`). Chapter title cards sit in the 1.6 s pauses between sections.\n")
    f.write("Every scene has a continuous slow move (paper push-in or map Ken Burns), so no frame is fully static. "
            "The last column is the longest gap between cued visual changes in that scene.\n")
    f.write("The source tag is shown bottom-left on every data scene (see `SourceTag` in `remotion/scenes.tsx`).\n\n")
    f.write("| Scene | Start | Paragraphs | Narration (opening) | Mode | Components | Data (facts.md) | Motion | Longest gap between cues |\n|---|---|---|---|---|---|---|---|---|\n")
    f.write("\n".join(rows) + "\n\n## Pacing check (> 6 s between cued changes)\n\n")
    f.write("\n".join(f"- {w}" for w in warnings) if warnings else "- None")
    f.write("\n")
print("\n".join(warnings) or "pacing ok")
