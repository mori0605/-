#!/usr/bin/env python3
"""ニューカムのパラドックス解説動画を scenes.json から1コマンドで作る。

    python make_video.py            # 全工程（音声→スライド→字幕→結合→サムネイル）
    python make_video.py --tts openjtalk   # 音声エンジンを固定（edge / openjtalk / auto）

必要なもの: Python3, Pillow, ffmpeg(libass入り), Noto Sans CJK JP
音声: edge-tts (ja-JP-NanamiNeural) を優先し、接続できなければ Open JTalk（Mei音声）に切り替える。
"""
import argparse
import asyncio
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import urllib.request
import wave
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
WORK = ROOT / "work"
OUT = ROOT / "output"
ASSETS = ROOT / "assets"

W, H = 1920, 1080
BG = (12, 24, 52)          # 濃い紺
WHITE = (255, 255, 255)
YELLOW = (255, 214, 64)    # 強調色（1色だけ）
DIM = (150, 160, 185)      # 補助テキスト用の薄い白
CONTENT_BOTTOM = 850       # これより下は字幕エリア

SR = 48000                 # 音声のサンプリング周波数
LEAD, GAP, TAIL = 0.25, 0.22, 0.45   # シーン頭／文間／シーン末の無音（秒）

EDGE_VOICE = "ja-JP-NanamiNeural"
JTALK_DIC = "/var/lib/mecab/dic/open-jtalk/naist-jdic"
MEI_URL = ("https://sourceforge.net/projects/mmdagent/files/MMDAgent_Example/"
           "MMDAgent_Example-1.8/MMDAgent_Example-1.8.zip/download")
MEI_VOICE = ASSETS / "voices" / "mei_normal.htsvoice"
JTALK_RATE = "1.12"       # Open JTalk の話速
JTALK_FALLBACK_VOICE = "/usr/share/hts-voice/nitech-jp-atr503-m001/nitech_jp_atr503_m001.htsvoice"


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


# ---------------------------------------------------------------- フォント
def find_font(bold):
    name = "Noto Sans CJK JP:bold" if bold else "Noto Sans CJK JP"
    try:
        path = subprocess.run(["fc-match", "-f", "%{file}", name],
                              capture_output=True, text=True).stdout.strip()
    except FileNotFoundError:
        path = ""
    if "NotoSansCJK" not in path and "NotoSansJP" not in path:
        sys.exit("Noto Sans CJK JP が見つかりません（例: apt install fonts-noto-cjk）")
    return path


FONT_BOLD = find_font(True)
FONT_REG = find_font(False)


def font(size, bold=True):
    # .ttc の index 0 が JP
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size, index=0)


# ---------------------------------------------------------------- テキスト分割
def split_chunks(text, max_len=34):
    """ナレーションを字幕1枚分ずつに分ける（文末で切り、長ければ読点で切る）。"""
    sentences = [s for s in re.findall(r".+?(?:[。？！]|$)", text) if s.strip()]
    chunks = []
    for s in sentences:
        s = s.strip()
        while len(s) > max_len:
            cands = [m.end() for m in re.finditer("、", s) if 8 <= m.end() <= len(s) - 6]
            if not cands:
                break
            cut = min(cands, key=lambda i: abs(i - len(s) / 2)) if len(s) <= max_len * 2 \
                else max((i for i in cands if i <= max_len), default=cands[0])
            chunks.append(s[:cut])
            s = s[cut:]
        chunks.append(s)
    return chunks


def wrap_sub(text, line_max=24):
    """字幕を最大2行に折り返す（読点・助詞のあとを優先）。"""
    if len(text) <= line_max:
        return text
    mid = len(text) / 2
    best, score = int(mid), 1e9
    for i in range(6, len(text) - 4):
        s = abs(i - mid)
        if text[i - 1] in "、":
            s -= 6
        elif text[i - 1] in "はがをにでともの" and text[i] not in "、。？！」":
            s -= 2
        if text[i] in "、。？！」ぁぃぅぇぉっゃゅょー":
            s += 20
        if s < score:
            best, score = i, s
    return text[:best] + "\n" + text[best:]


# ---------------------------------------------------------------- 音声
class EdgeTTS:
    name = "edge-tts (%s)" % EDGE_VOICE

    def __init__(self):
        import edge_tts
        import edge_tts.communicate as comm
        cafile = os.environ.get("SSL_CERT_FILE")
        if cafile:  # プロキシ環境向け: 独自CAを信頼させる
            comm._SSL_CTX = ssl.create_default_context(cafile=cafile)
        self.edge_tts = edge_tts

    def synth(self, text, wav_path):
        mp3 = wav_path.with_suffix(".mp3")
        asyncio.run(self.edge_tts.Communicate(text, EDGE_VOICE).save(str(mp3)))
        to_wav(mp3, wav_path)
        mp3.unlink()


class OpenJTalk:
    def __init__(self):
        if not shutil.which("open_jtalk"):
            raise RuntimeError("open_jtalk が見つかりません"
                               "（apt install open-jtalk open-jtalk-mecab-naist-jdic）")
        self.voice = self._voice()
        self.name = "Open JTalk (%s, x%s)" % (Path(self.voice).stem, JTALK_RATE)

    @staticmethod
    def _voice():
        if MEI_VOICE.exists():
            return str(MEI_VOICE)
        try:
            print("  Mei 音声をダウンロード中 ...")
            MEI_VOICE.parent.mkdir(parents=True, exist_ok=True)
            zpath = MEI_VOICE.parent / "mmdagent.zip"
            urllib.request.urlretrieve(MEI_URL, zpath)
            with zipfile.ZipFile(zpath) as z:
                base = "MMDAgent_Example-1.8/Voice/mei/"
                MEI_VOICE.write_bytes(z.read(base + "mei_normal.htsvoice"))
                (MEI_VOICE.parent / "COPYRIGHT_mei.txt").write_bytes(z.read(base + "COPYRIGHT.txt"))
            zpath.unlink()
            return str(MEI_VOICE)
        except Exception as e:  # noqa: BLE001
            print("  Mei 音声を取得できませんでした（%s）。標準の男性音声を使います。" % e)
            return JTALK_FALLBACK_VOICE

    def synth(self, text, wav_path):
        raw = wav_path.with_suffix(".raw.wav")
        run(["open_jtalk", "-x", JTALK_DIC, "-m", self.voice, "-r", JTALK_RATE,
             "-fm", "0", "-jf", "1.2", "-ow", str(raw)], input=text.encode("utf-8"))
        to_wav(raw, wav_path)
        raw.unlink()


def to_wav(src, dst):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
         "-ac", "1", "-ar", str(SR), "-sample_fmt", "s16", str(dst)])


def pick_tts(mode):
    if mode in ("auto", "edge"):
        try:
            tts = EdgeTTS()
            probe = WORK / "probe.wav"
            tts.synth("テスト", probe)
            probe.unlink()
            return tts
        except Exception as e:  # noqa: BLE001
            if mode == "edge":
                raise
            print("  edge-tts を使えません（%s）→ Open JTalk に切り替えます" % type(e).__name__)
    return OpenJTalk()


def read_pcm(path):
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2
        return w.readframes(w.getnframes())


def silence(sec):
    return b"\x00\x00" * int(round(sec * SR))


def build_audio(data, tts):
    """シーンごとに文単位で音声を作り、字幕タイミングもここで確定させる。"""
    replace = data.get("tts_replace", {})
    cache_dir = WORK / "tts" / re.sub(r"[^A-Za-z0-9]+", "_", tts.name)
    cache_dir.mkdir(parents=True, exist_ok=True)
    pcm = bytearray()
    cues, scene_times = [], []
    for sc in data["scenes"]:
        start = len(pcm) / 2 / SR
        pcm += silence(LEAD)
        for j, chunk in enumerate(split_chunks(sc["narration"])):
            spoken = chunk
            for k, v in replace.items():
                spoken = spoken.replace(k, v)
            key = "%02d_%02d_%08x" % (sc["id"], j, zlib_crc(spoken))
            wav = cache_dir / (key + ".wav")
            if not wav.exists():
                tts.synth(spoken, wav)
            if j:
                pcm += silence(GAP)
            t0 = len(pcm) / 2 / SR
            pcm += read_pcm(wav)
            cues.append((t0, len(pcm) / 2 / SR, chunk))
        pcm += silence(TAIL + sc.get("pause_after", 0.0))
        scene_times.append((start, len(pcm) / 2 / SR))
        print("  scene %2d  %5.1fs" % (sc["id"], scene_times[-1][1] - start))
    path = WORK / "narration.wav"
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(pcm))
    return path, cues, scene_times


def zlib_crc(s):
    import zlib
    return zlib.crc32(s.encode("utf-8"))


# ---------------------------------------------------------------- 描画
def parse_rich(line):
    """'あいう{強調}えお' → [(text, is_highlight), ...]"""
    parts = []
    for m in re.finditer(r"\{([^}]*)\}|([^{]+)", line):
        if m.group(1) is not None:
            parts.append((m.group(1), True))
        else:
            parts.append((m.group(2), False))
    return parts


def rich_width(parts, f):
    return sum(f.getlength(t) for t, _ in parts)


def draw_rich_block(d, text, cx, cy, max_w, size, min_size=40, spacing=0.45):
    """{…}強調つきの複数行テキストを中央揃えで描く。はみ出す場合は自動で縮小。"""
    lines = [parse_rich(l) for l in text.split("\n")]
    while True:
        f = font(size)
        if max(rich_width(p, f) for p in lines) <= max_w or size <= min_size:
            break
        size -= 4
    lh = size * (1 + spacing)
    total = lh * len(lines) - size * spacing
    y = cy - total / 2
    for parts in lines:
        x = cx - rich_width(parts, f) / 2
        for t, hl in parts:
            d.text((x, y), t, font=f, fill=YELLOW if hl else WHITE)
            x += f.getlength(t)
        y += lh
    return size


def new_canvas(size=(W, H)):
    img = Image.new("RGB", size, BG)
    return img, ImageDraw.Draw(img)


def section_label(d, label):
    f = font(34, bold=False)
    d.text((80, 60), label, font=f, fill=DIM)
    d.line((80, 112, 80 + f.getlength(label), 112), fill=DIM, width=2)


def draw_box(d, x, y, s, label, content, opaque, note=None, scale=1.0):
    fill = (38, 58, 100) if opaque else None
    d.rectangle((x, y, x + s, y + s), outline=WHITE, width=max(4, int(8 * scale)), fill=fill)
    lf = font(int(48 * scale))
    d.text((x + s / 2, y - 24 * scale), label, font=lf, fill=WHITE, anchor="md")
    money = "円" in content
    cf = font(int((110 if len(content) <= 3 else 92) * scale))
    while cf.getlength(content) > s * 0.86:
        cf = font(cf.size - 4)
    d.text((x + s / 2, y + s / 2), content, font=cf,
           fill=YELLOW if money else WHITE, anchor="mm")
    if note:
        nf = font(int(40 * scale), bold=False)
        d.text((x + s / 2, y + s + 26 * scale), note, font=nf, fill=WHITE, anchor="ma")


def slide_boxes(sl, d):
    s, gap, top = 400, 220, 230
    boxes = []
    if not sl.get("hide_a"):
        boxes.append(("箱A（透明）", sl["a"], False, None))
    boxes.append(("箱B（不透明）", sl["b"], True, sl.get("b_note")))
    total = len(boxes) * s + (len(boxes) - 1) * gap
    x = (W - total) / 2
    for label, content, opaque, note in boxes:
        draw_box(d, x, top, s, label, content, opaque, note)
        x += s + gap
    draw_rich_block(d, sl["caption"], W / 2, 770, 1700, 62)


def slide_table(sl, d):
    hl = sl.get("highlight") == "both"
    draw_rich_block(d, "箱Bの中身 × あなたの選択", W / 2, 150, 1600, 56)
    x0, y0 = 260, 240
    cw = [480, 460, 460]
    rh = [110, 165, 165]
    cols = ["", "Bだけ取る", "両方取る"]
    rows = [("Bに1000万円", "1000万円", "1010万円"),
            ("Bは空っぽ", "0円", "10万円")]
    xs = [x0]
    for w_ in cw:
        xs.append(xs[-1] + w_)
    ys = [y0]
    for h_ in rh:
        ys.append(ys[-1] + h_)
    for i in range(len(xs)):
        d.line((xs[i], ys[0], xs[i], ys[-1]), fill=WHITE, width=4)
    for j in range(len(ys)):
        d.line((xs[0], ys[j], xs[-1], ys[j]), fill=WHITE, width=4)
    hf, cf = font(52), font(72)
    for i, c in enumerate(cols):
        if c:
            d.text(((xs[i] + xs[i + 1]) / 2, (ys[0] + ys[1]) / 2), c, font=hf,
                   fill=YELLOW if (hl and i == 2) else WHITE, anchor="mm")
    for r, row in enumerate(rows):
        yc = (ys[r + 1] + ys[r + 2]) / 2
        d.text(((xs[0] + xs[1]) / 2, yc), row[0], font=hf, fill=WHITE, anchor="mm")
        for c in (1, 2):
            d.text(((xs[c] + xs[c + 1]) / 2, yc), row[c], font=cf,
                   fill=YELLOW if (hl and c == 2) else WHITE, anchor="mm")
    if hl:
        d.rectangle((xs[2] + 2, ys[0] + 2, xs[3] - 2, ys[3] - 2), outline=YELLOW, width=8)
        draw_rich_block(d, "どちらの場合も {両方取るほうが +10万円}", W / 2, 770, 1700, 60)
    else:
        draw_rich_block(d, "中身が{どちらでも}比べてみる", W / 2, 770, 1700, 60)


def render_slide(sc, path):
    img, d = new_canvas()
    sl = sc["slide"]
    if sl["type"] != "title":
        section_label(d, sc["section"])
    if sl["type"] == "title":
        draw_rich_block(d, "{%s}" % sl["title"], W / 2, 350, 1700, 120)
        d.line((W / 2 - 500, 480, W / 2 + 500, 480), fill=WHITE, width=3)
        draw_rich_block(d, sl["subtitle"], W / 2, 580, 1700, 64)
    elif sl["type"] == "boxes":
        slide_boxes(sl, d)
    elif sl["type"] == "table":
        slide_table(sl, d)
    else:
        draw_rich_block(d, sl["text"], W / 2, (130 + CONTENT_BOTTOM) / 2, 1700, 96)
    img.save(path)


def render_thumbnail(path):
    tw, th = 1280, 720
    img, d = new_canvas((tw, th))
    s = 250
    draw_box(d, 150, 245, s, "箱A", "10万円", False, scale=0.8)
    draw_box(d, 150 + s + 110, 245, s, "箱B", "？", True, scale=0.8)
    d.text((tw / 2, 110), "あなたはどっちを取る？", font=font(92), fill=YELLOW, anchor="mm")
    f = font(64)
    x, y = 830, 300
    d.text((x, y), "Bだけ", font=f, fill=WHITE, anchor="lm")
    d.text((x + 30, y + 95), "or", font=font(48, bold=False), fill=WHITE, anchor="lm")
    d.text((x, y + 190), "両方", font=f, fill=WHITE, anchor="lm")
    d.text((tw / 2, 650), "ニューカムのパラドックス", font=font(56), fill=WHITE, anchor="mm")
    img.save(path)


# ---------------------------------------------------------------- 字幕・結合
def fmt_ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return "%02d:%02d:%02d,%03d" % (h, m, s, ms)


def write_srt(cues, path):
    out = []
    for i, (a, b, text) in enumerate(cues, 1):
        # 次の字幕まで表示を残す（ちらつき防止）。ただし最大0.25秒延長
        nxt = cues[i][0] if i < len(cues) else b + 0.25
        end = min(nxt, b + 0.25)
        out.append("%d\n%s --> %s\n%s\n" % (i, fmt_ts(a), fmt_ts(end), wrap_sub(text)))
    path.write_text("\n".join(out), encoding="utf-8")


def assemble(slides, scene_times, audio, srt, out_path):
    lst = WORK / "slides.txt"
    lines = []
    for p, (a, b) in zip(slides, scene_times):
        lines += ["file '%s'" % p, "duration %.3f" % (b - a)]
    lines.append("file '%s'" % slides[-1])
    lst.write_text("\n".join(lines) + "\n", encoding="utf-8")
    style = ("FontName=Noto Sans CJK JP,FontSize=21,PrimaryColour=&H00FFFFFF,"
             "OutlineColour=&H00000000,BackColour=&H8C000000,BorderStyle=4,"
             "Outline=1,Shadow=0,MarginV=22,Alignment=2,Bold=1")
    fontsdir = str(Path(FONT_REG).parent)
    vf = ("fps=30,format=yuv420p,subtitles=%s:fontsdir=%s:force_style='%s'"
          % (srt.name, fontsdir, style))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-loglevel", "error",
         "-f", "concat", "-safe", "0", "-i", lst.name,
         "-i", audio.name,
         "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-tune", "stillimage",
         "-crf", "20", "-r", "30",
         "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",   # YouTube 向けの音量にそろえる
         "-c:a", "aac", "-b:a", "192k", "-ar", str(SR), "-ac", "2",
         "-shortest", "-movflags", "+faststart", str(out_path)], cwd=WORK)


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tts", choices=["auto", "edge", "openjtalk"], default="auto")
    args = ap.parse_args()

    data = json.loads((ROOT / "scenes.json").read_text(encoding="utf-8"))
    WORK.mkdir(exist_ok=True)
    (WORK / "slides").mkdir(exist_ok=True)

    print("[1/5] 音声エンジンを選択")
    tts = pick_tts(args.tts)
    print("  →", tts.name)

    print("[2/5] ナレーション音声を生成")
    audio, cues, scene_times = build_audio(data, tts)

    print("[3/5] スライド画像を生成")
    slides = []
    for sc in data["scenes"]:
        p = WORK / "slides" / ("scene_%02d.png" % sc["id"])
        render_slide(sc, p)
        slides.append(p.relative_to(WORK))
    render_thumbnail(ROOT / "thumbnail.png")

    print("[4/5] 字幕を作成")
    srt = WORK / "subtitles.srt"
    write_srt(cues, srt)

    print("[5/5] 動画を書き出し")
    out = OUT / "newcomb.mp4"
    assemble(slides, scene_times, audio, srt, out)
    shutil.copy(srt, OUT / "newcomb.srt")
    total = scene_times[-1][1]
    print("完成: %s（%d分%02d秒, 音声: %s）" % (out.relative_to(ROOT), total // 60, total % 60, tts.name))


if __name__ == "__main__":
    main()
