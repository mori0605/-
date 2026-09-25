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
    ("S01", ["P01"], "World", "WorldMap(nordic), StatCallout×2", "F-VIS-1, F-VIS-2", "Zoom from Europe to Helsinki; Finland lights up in vermilion; 16,000+ and €1,485 count up"),
    ("S02", ["P02"], "Paper", "StatCallout", "F-FIN-M-2006", "548 counts up in vermilion"),
    ("S03", ["P03", "P04"], "Paper", "LineChart, bracket, yardstick blocks", "F-FIN-M-2006..2025, F-OECD-YARD", "Line extends to each score as it is spoken; −79 bracket; 22-point blocks stack"),
    ("S05", ["P05"], "Night", "Line + strike", "—", "Three suspects appear and are struck through; the question"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Setup"),
    ("S06", ["P06"], "World", "WorldMap(world), StatCallout×2", "F-PISA-SCALE", "Slow world pan; 91 / 760,000 count up"),
    ("S07", ["P07"], "Paper", "Line ×4", "—", "What PISA does and doesn't test; the minister joke"),
    ("S08", ["P08"], "Paper", "EraTimeline as points scale", "F-OECD-YARD, F-FIN-DROP-M", "Points ruler: 10–15 band, 22 = 1 year, 79"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Act 1"),
    ("S09", ["P09"], "Paper", "Line, StatCallout×3", "F-PISA2000, F-FIN-R-PEAK, F-FIN-M-2006, F-FIN-S-2006", "#1 in reading 2000; three 2006 scores count up"),
    ("S10", ["P10", "P11"], "Paper", "Feature cards ×4, frame", "F-FEAT-AGE, F-FEAT-TEST, F-DECENT, F-FEAT-MA", "Cards appear on cue; framed as \"The Finnish model\""),
    ("S12", ["P12"], "Paper", "Line", "—", "\"because\" → correlation mistaken for cause"),
    ("S13", ["P13"], "Paper", "EraTimeline", "F-COHORT, F-DECENT", "Born 1991 / school 1998 / tested 2006; eras shaded"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Act 2"),
    ("S14", ["P14"], "Paper", "LineChart", "F-FIN-M-2003..2025", "Full maths series draws"),
    ("S15", ["P15"], "Paper", "LineChart ×3 (small multiples)", "F-FIN-R/S-2006/2025, ranks, F-OECD-2025", "2006→2025 slope per subject; OECD reference"),
    ("S15b", ["P15b"], "Paper", "Dot-gap chart", "F-OECD-2025, F-FIN-*-2025", "Finland vs OECD dots, gap shown"),
    ("S16", ["P16"], "Paper", "HBars", "F-OECD-TREND, F-2022-OECDΔ", "OECD-wide losses grow"),
    ("S17", ["P17"], "Paper", "Waffle", "F-FIN-LOW-*", "7 → 25 of 100 students light up"),
    ("S18", ["P18"], "Paper", "Waffle", "F-FIN-TOP-2003/2025", "23 → 7 of 100"),
    ("S19a", ["P19"], "World", "WorldMap(nordic)", "—", "Zoom to the Gulf of Finland; Estonia lights up in indigo"),
    ("S19b", ["P19", "P20"], "Paper", "LineChart (original analysis A), table", "F-EST-M-*, F-FIN-M-*, F-EST-2025, F-EST-RANK", "Both lines draw; 2012 tie marked; 2025 table fills"),
    ("S21", ["P21"], "Paper", "HBars", "F-JPN-2025, F-JPN-RANK, F-2022-JPKR", "Japan vs OECD bars"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Act 3"),
    ("S22", ["P22"], "Paper", "Criteria list + suspect cards", "—", "Three tests; six suspects"),
    ("S23", ["P23"], "Paper", "VerdictCard ✗", "F-FIN-IMM-1..3", "Evidence lines; verdict stamp"),
    ("S24", ["P24"], "Paper", "VerdictCard △ + EraTimeline", "F-DIG-1, F-DIG-2", "Evidence; 2006 vs 2020 timeline; stamp"),
    ("S25", ["P25"], "Paper", "VerdictCard ○", "F-OPH-READ, F-READ-ENJ, F-FIN-LOW-R-2025", "Evidence; stamp"),
    ("S26", ["P26"], "Paper", "VerdictCard △ + LineChart", "F-CUR-2014, F-FIN-M-*", "Line draws, 2016 marker; stamp"),
    ("S27", ["P27"], "Paper", "VerdictCard —", "F-FIN-DIFF", "Three findings; stamp"),
    ("S28", ["P28"], "Paper", "QuoteCard", "F-HS-2015", "Summary of Heller Sahlgren's argument"),
    ("S29", ["P29"], "Paper", "LineChart (original analysis C)", "F-COHORT, F-FIN-M-*, F-CUR-2014", "Series re-plotted by school-entry year; peak band; 2016 line; verdict"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Counterpoint"),
    ("S30", ["P30"], "Paper", "HBars", "F-JPN-CUR, F-JPN-PER", "Japan vs OECD self-reports"),
    ("S31", ["P31"], "Paper", "QuoteCard", "F-ZHAO", "Paraphrase of Zhao's argument"),
    ("S32", ["P32"], "Paper", "StatCallout ×2", "F-PISA2000, F-FIN-R-RANK-2025, F-FIN-S-RANK-2025", "#1 → =17"),
    ("CH", [], "Paper", "TitleCard", "—", "Chapter card: Resolution"),
    ("S33", ["P33"], "Paper", "Two columns", "—", "Copied vs missed; the missed column fades"),
    ("S34", ["P34"], "Night", "Line ×3", "—", "Three questions"),
    ("S35", ["P35", "P36"], "World", "WorldMap(nordic), TitleCard", "—", "Slow zoom out from Finland; closing line; comment question"),
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
        start = cue_time("P19", "2006,") - 0.7
    if sid == "S19a":
        end = cue_time("P19", "2006,") - 0.7
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
    f.write("Times come from the narration timeline (`audio/timeline.json`). Chapter title cards sit in the 2.6 s pauses between sections.\n")
    f.write("Every scene has a continuous slow move (paper push-in or map Ken Burns), so no frame is fully static. "
            "The last column is the longest gap between cued visual changes in that scene.\n")
    f.write("The source tag is shown bottom-left on every data scene (see `SourceTag` in `remotion/scenes.tsx`).\n\n")
    f.write("| Scene | Start | Paragraphs | Narration (opening) | Mode | Components | Data (facts.md) | Motion | Longest gap between cues |\n|---|---|---|---|---|---|---|---|---|\n")
    f.write("\n".join(rows) + "\n\n## Pacing check (> 6 s between cued changes)\n\n")
    f.write("\n".join(f"- {w}" for w in warnings) if warnings else "- None")
    f.write("\n")
print("\n".join(warnings) or "pacing ok")
