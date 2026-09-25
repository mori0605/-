"""Download the local speech models into ./models (run once).

- Kokoro TTS v1.0 (ONNX) + voices           ~350 MB
- sherpa-onnx zipformer English ASR (for word timestamps / subtitles)  ~300 MB
"""
import os
import tarfile
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DEST = os.path.join(ROOT, "models")
FILES = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
    "zf.tar.bz2": "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-zipformer-en-2023-06-26.tar.bz2",
}

os.makedirs(DEST, exist_ok=True)
for name, url in FILES.items():
    path = os.path.join(DEST, name)
    if name == "zf.tar.bz2" and os.path.isdir(os.path.join(DEST, "sherpa-onnx-zipformer-en-2023-06-26")):
        print("ok   ", "sherpa-onnx-zipformer-en-2023-06-26/")
        continue
    if not os.path.exists(path):
        print("fetch", name)
        urllib.request.urlretrieve(url, path)
    if name.endswith(".tar.bz2"):
        with tarfile.open(path) as tf:
            tf.extractall(DEST)
        os.remove(path)
    print("ok   ", name)
print("models ready in", DEST)
