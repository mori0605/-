"""Loudness-normalise a rendered video to -14 LUFS (YouTube) and write a no-BGM version.

Usage: python3 tools/finalize.py <raw.mp4> <narration.wav> <out_base>
  -> <out_base>.mp4        (narration + BGM, -14 LUFS)
  -> <out_base>_nobgm.mp4  (narration only, for adding your own music)
"""
import subprocess
import sys

import imageio_ffmpeg

ff = imageio_ffmpeg.get_ffmpeg_exe()
raw, narration, base = sys.argv[1:4]
norm = ["-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart"]
subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-c:v", "copy", *norm, base + ".mp4"], check=True)
subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-i", raw, "-i", narration, "-map", "0:v", "-map", "1:a",
                "-c:v", "copy", *norm, "-shortest", base + "_nobgm.mp4"], check=True)
print("wrote", base + ".mp4", "and", base + "_nobgm.mp4")
