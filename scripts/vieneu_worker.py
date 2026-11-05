"""Worker giọng tông sư: VieNeu-TTS v3 Turbo chạy local, nạp model MỘT lần rồi nhận việc qua stdin.

Giao thức (mỗi dòng một JSON, UTF-8):
  vào : {"id": "...", "text": "...", "output": "C:/.../x.mp3.tmp"}
  ra  : {"ready": true}  (một lần, khi model đã nạp)
        {"id": "...", "ok": true} | {"id": "...", "ok": false, "error": "..."}
Chỉ nhận câu thông báo do trò chơi tạo (speech.mjs), không chạy shell, không đọc bình luận thô.

Giọng: "Thiền Tâm Đức" (Nam · Bắc · kể chuyện) + hậu kỳ "tongsu": trầm hơn, chậm rãi, ấm,
có chút vang đại điện. Đổi giọng bằng biến môi trường VAN_HAI_VOICE.
"""
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

VIENEU_DIR = Path(os.environ.get("VAN_HAI_VIENEU_DIR", r"C:\WorkSpace\TIKTOK\tools\vieneu"))
VOICE = os.environ.get("VAN_HAI_VOICE", "Thiền Tâm Đức")
SR = 48_000

# Chất giọng tông sư. Sửa Ở ĐÂY nếu muốn già hơn/trẻ hơn.
#   pitch 0.93 ≈ -1.25 nửa cung (giữ formant, không méo)  · tempo 0.96: nói khoan thai
#   EQ: ấm 140Hz, bớt đục 420Hz, rõ chữ 2.8kHz · nén nhẹ · vang đại điện ngắn · -16 LUFS
TONGSU = ",".join([
    "rubberband=pitch=0.93:tempo=0.96:formant=preserved",
    "highpass=f=70",
    "equalizer=f=140:t=q:w=1.0:g=3",
    "equalizer=f=420:t=q:w=1.2:g=-1.5",
    "equalizer=f=2800:t=q:w=1.0:g=1.5",
    "deesser=i=0.4",
    "acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=2",
    "aecho=0.85:0.75:70|140:0.16|0.08",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
])

# v75: dàn giọng. (giọng VieNeu, chuỗi hậu kỳ ffmpeg, temperature)
TIENNU = ",".join([
    "highpass=f=110",
    "equalizer=f=250:t=q:w=1.0:g=-1.5",
    "equalizer=f=3600:t=q:w=1.0:g=2",
    "acompressor=threshold=-20dB:ratio=2.2:attack=8:release=140:makeup=2",
    "aecho=0.8:0.7:55|110:0.14|0.07",
    "loudnorm=I=-16:TP=-1.5:LRA=11",
])
TRONGTAI = ",".join([
    "atempo=1.06",
    "highpass=f=80",
    "equalizer=f=180:t=q:w=1.0:g=1.5",
    "equalizer=f=2500:t=q:w=1.0:g=2",
    "acompressor=threshold=-22dB:ratio=3:attack=5:release=110:makeup=3",
    "loudnorm=I=-15:TP=-1.5:LRA=9",
])
CAST = {
    "tongsu": (VOICE, TONGSU, 0.7),
    "tiennu": (os.environ.get("VAN_HAI_VOICE_TIENNU", "Ngọc Huyền"), TIENNU, 0.7),
    "trongtai": (os.environ.get("VAN_HAI_VOICE_TRONGTAI", "Hải Đăng"), TRONGTAI, 0.72),
}


def send(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def main():
    sys.path.insert(0, str(VIENEU_DIR))
    import numpy as np
    import soundfile as sf
    from tts_vieneu import load, split_sentences, synth_sentence

    # Reserve CPU time for LIVE Studio; retain the same model and voice.
    try:
        import ctypes
        if sys.platform == "win32":
            ctypes.windll.kernel32.SetPriorityClass(ctypes.windll.kernel32.GetCurrentProcess(), 0x00004000)
    except Exception:
        pass
    import tts_vieneu as helper
    helper._patch_local_fetch()
    from vieneu import Vieneu
    tts = Vieneu(threads=max(1, min(4, int(os.environ.get("VAN_HAI_TTS_THREADS", "2")))))
    send({"ready": True, "voice": VOICE})
    for raw in sys.stdin.buffer:
        if not raw.strip():
            continue
        job = {}
        try:
            job = json.loads(raw.decode("utf-8"))
            # v75: nhiều đoạn, mỗi đoạn một giọng + hậu kỳ riêng (tông sư / tiên nữ / trọng tài)
            segments = job.get("segments") or [{"voice": "tongsu", "text": job.get("text", "")}]
            gap = np.zeros(int(0.28 * SR), dtype=np.float32)
            with tempfile.TemporaryDirectory() as td:
                pieces = []
                for i, seg in enumerate(segments[:3]):
                    voice, chain, temp = CAST.get(seg.get("voice"), CAST["tongsu"])
                    parts = []
                    for sentence in split_sentences(str(seg.get("text", ""))[:220]):
                        parts += [synth_sentence(tts, sentence, voice, temperature=temp), gap]
                    if not parts:
                        continue
                    raw_wav = os.path.join(td, f"raw{i}.wav")
                    out_wav = os.path.join(td, f"fx{i}.wav")
                    sf.write(raw_wav, np.concatenate(parts), SR)
                    subprocess.run(["ffmpeg", "-y", "-v", "error", "-threads", "1", "-filter_threads", "1", "-i", raw_wav,
                                    "-af", chain, "-ar", "44100", "-ac", "1", out_wav],
                                   check=True, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                    audio, _ = sf.read(out_wav, dtype="float32")
                    pieces += [audio, np.zeros(int(0.12 * 44100), dtype=np.float32)]
                if not pieces:
                    raise ValueError("Không có nội dung để đọc.")
                mix = os.path.join(td, "mix.wav")
                sf.write(mix, np.concatenate(pieces), 44100)
                subprocess.run(["ffmpeg", "-y", "-v", "error", "-threads", "1", "-i", mix, "-c:a", "libmp3lame", "-b:a", "128k",
                                "-f", "mp3", job["output"]],
                               check=True, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            send({"id": job.get("id"), "ok": True})
        except Exception as exc:  # báo lỗi về Node, worker vẫn sống cho câu sau
            send({"id": job.get("id"), "ok": False, "error": str(exc)[:300]})


if __name__ == "__main__":
    main()
