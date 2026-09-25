"""Write an .srt subtitle file from the word-level narration timeline.

Cues break at sentence ends, stay under ~84 characters (two lines of 42) and 6 s.
Usage: python3 tools/make_srt.py episodes/01-finland out/episode01_finland.srt
"""
import json
import sys
import textwrap

ep, out = sys.argv[1], sys.argv[2]
tl = json.load(open(f"{ep}/audio/timeline.json"))


def ts(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


cues = []
for p in tl["paragraphs"]:
    cur = []
    for w in p["words"]:
        cur.append(w)
        text = " ".join(x["w"] for x in cur)
        end_sentence = w["w"].endswith((".", "?", "!", "…"))
        too_long = len(text) > 70 or (cur[-1]["e"] - cur[0]["s"]) > 5.5
        soft = w["w"].endswith((",", ";", ":")) and len(text) > 35
        if end_sentence or too_long or soft:
            cues.append(cur)
            cur = []
    if cur:
        cues.append(cur)

with open(out, "w", encoding="utf-8") as f:
    for i, c in enumerate(cues, 1):
        text = " ".join(x["w"] for x in c)
        lines = textwrap.wrap(text, 42)
        if len(lines) > 2:
            lines = [" ".join(lines[:-1]), lines[-1]]
        end = c[-1]["e"] + 0.15
        if i < len(cues):
            end = min(end, cues[i][0]["s"] - 0.02)
        f.write(f"{i}\n{ts(c[0]['s'])} --> {ts(end)}\n" + "\n".join(lines) + "\n\n")
print(f"wrote {len(cues)} cues to {out}")
