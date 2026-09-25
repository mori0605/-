"""Validate every c('Pxx', 'word', n) cue in scene files against the narration timeline."""
import json
import re
import sys

ep = sys.argv[1]
tl = json.load(open(f"{ep}/audio/timeline.json"))
paras = {p["id"]: p for p in tl["paragraphs"]}
norm = lambda s: re.sub(r"[^a-z0-9%-]", "", re.sub(r"[’']", "", s.lower()))
src = open(f"{ep}/remotion/scenes.tsx").read() + open(f"{ep}/remotion/Episode.tsx").read()
bad = 0
for pid, phrase, nth in re.findall(r"(?:c|cues\.word)\('(\w+)', '([^']+)'(?:, (\d+))?\)", src.replace("\\'", "'")):
    nth = int(nth or 1)
    target = [norm(w) for w in phrase.split()]
    words = [norm(w["w"]) for w in paras[pid]["words"]]
    hits = [i for i in range(len(words) - len(target) + 1) if words[i:i + len(target)] == target]
    if len(hits) < nth:
        bad += 1
        print("MISSING", pid, phrase, nth)
print("cues ok" if not bad else f"{bad} missing")
