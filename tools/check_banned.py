"""Check a script against CLAUDE.md section 7 banned expressions."""
import re, sys

BANNED = ["delve", "tapestry", "testament to", "in today's world", "it's important to note",
          "navigate the complexities", "a rich history", "let's dive in", "buckle up",
          "in conclusion", "at the end of the day", "game-changer", "game changer", "unlock",
          "embark", "realm", "landscape", "not only"]

def check(path):
    text = open(path, encoding="utf-8").read()
    narration = " ".join(re.findall(r"\*\*P\w+\*\* (.+)", text))
    hits = [(w, len(re.findall(re.escape(w), narration, re.I))) for w in BANNED]
    hits = [(w, n) for w, n in hits if n]
    words = narration.split()
    sents = [x for x in re.split(r"(?<=[.?!…])\s+", narration) if x.strip()]
    print(f"words={len(words)} sentences={len(sents)} avg_len={len(words)/len(sents):.1f}")
    print("banned hits:", hits or "none")
    return not hits

if __name__ == "__main__":
    sys.exit(0 if check(sys.argv[1]) else 1)
