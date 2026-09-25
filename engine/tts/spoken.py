"""Convert written script words into the spoken form sent to the TTS engine.

Each written token maps to one or more spoken words, so word-level timestamps
from alignment can be mapped back to the written text for subtitles.
"""
import re

ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
        "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
        "eighteen", "nineteen"]
TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]

# Pronunciation overrides (written token, case-sensitive, punctuation stripped -> spoken)
LEXICON = {
    "PISA": "Peeza",
    "VAT": "V A T",
    "COVID-19": "covid nineteen",
    "OECD's": "O E C D's",
    "OECD": "O E C D",
    "Sahlgren": "Saalgren",
}


def _under_100(n):
    if n < 20:
        return ONES[n]
    t, o = divmod(n, 10)
    return TENS[t] + ("-" + ONES[o] if o else "")


def _under_1000(n):
    h, r = divmod(n, 100)
    parts = []
    if h:
        parts.append(ONES[h] + " hundred")
    if r:
        parts.append(("and " if h else "") + _under_100(r))
    return " ".join(parts) or "zero"


def cardinal(n):
    """British-style cardinal: 548 -> five hundred and forty-eight."""
    if n < 1000:
        return _under_1000(n)
    th, r = divmod(n, 1000)
    s = _under_1000(th) + " thousand"
    if r:
        s += (" and " if r < 100 else " ") + _under_1000(r)
    return s


def year(n):
    """2006 -> two thousand and six, 2025 -> twenty twenty-five, 1998 -> nineteen ninety-eight."""
    if 2000 <= n <= 2009:
        return "two thousand" + (" and " + ONES[n - 2000] if n > 2000 else "")
    hi, lo = divmod(n, 100)
    return _under_100(hi) + " " + ("hundred" if lo == 0 else ("oh " + ONES[lo] if lo < 10 else _under_100(lo)))


def speak_token(tok):
    """Return spoken form for one written token (punctuation preserved at edges)."""
    m = re.match(r"^([\"'(“]*)(.*?)([\"').,;:?!…”]*)$", tok)
    pre, core, post = m.groups()
    if core in LEXICON:
        return pre + LEXICON[core] + post
    if re.fullmatch(r"(1[89]|20)\d\ds", core):          # 1990s
        y = year(int(core[:4]))
        return pre + (y[:-1] + "ies" if y.endswith("y") else y + "s") + post
    if re.fullmatch(r"(19|20)\d\d", core):              # years
        return pre + year(int(core)) + post
    if re.fullmatch(r"\d{1,3}(,\d{3})*", core):
        return pre + cardinal(int(core.replace(",", ""))) + post
    return tok


def to_spoken(text):
    """Return (spoken_text, pairs) where pairs = [(written_token, spoken_str)]."""
    text = text.replace("…", "...")
    pairs = [(t, speak_token(t)) for t in text.split()]
    return " ".join(s for _, s in pairs), pairs


if __name__ == "__main__":
    for t in ["548", "1,485", "2006", "2025", "1998", "1990s", "2000", "COVID-19,", "PISA's", "OECD's"]:
        print(t, "->", speak_token(t))
