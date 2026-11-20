# 20/11/2026 — mục 7 (docs/CAI-TIEN-2026-11-20.md): đổi PNG nặng sang WebP CÙNG KÍCH THƯỚC (atlas/sprite cắt theo pixel nên không đổi cỡ),
# giữ kênh trong suốt, chất lượng 90. PNG gốc GIỮ LẠI (đường dẫn ghép động còn .png vẫn chạy). Bỏ qua nếu WebP không nhỏ hơn ≥20%.
# Dùng: python scripts/png-to-webp.py <danh-sách.json | file.png ...>   → in JSON {png: webp} các file đã đổi
import sys, os, json
from PIL import Image
args = sys.argv[1:]
files = json.load(open(args[0], encoding='utf-8')) if len(args) == 1 and args[0].endswith('.json') else args
done = {}; before = after = 0
for p in files:
    out = p[:-4] + '.webp'
    im = Image.open(p); im.load()
    if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGBA' if 'A' in im.getbands() or 'transparency' in im.info else 'RGB')
    im.save(out, 'WEBP', quality=90, method=6)
    a, b = os.path.getsize(p), os.path.getsize(out)
    if b > a * 0.8: os.remove(out); continue
    done[p] = out; before += a; after += b
sys.stderr.write(f'{len(done)}/{len(files)} file: {before/1048576:.0f} MB -> {after/1048576:.0f} MB\n')
print(json.dumps(done))
