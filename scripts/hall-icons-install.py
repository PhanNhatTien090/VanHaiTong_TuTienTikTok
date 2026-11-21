# 21/11/2026 tối: cài icon Đường Codex vẽ (PNG nền trong suốt) → public/assets/hall-icons/<key>.webp 96×96. Dùng: python scripts/hall-icons-install.py <thư mục PNG>
import sys, os
from PIL import Image
src = sys.argv[1]
dst = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'hall-icons')
os.makedirs(dst, exist_ok=True)
SIZE = 96
for name in sorted(os.listdir(src)):
    if not name.lower().endswith('.png'):
        continue
    im = Image.open(os.path.join(src, name)).convert('RGBA')
    a = im.getchannel('A')
    lo, hi = a.getextrema()
    clear = sum(1 for v in a.getdata() if v < 16) / (im.width * im.height)
    box = a.point(lambda v: 255 if v > 12 else 0).getbbox() or (0, 0, im.width, im.height)
    im = im.crop(box)
    s = max(im.width, im.height)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    sq.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    sq = sq.resize((SIZE, SIZE), Image.LANCZOS)
    out = os.path.join(dst, os.path.splitext(name)[0] + '.webp')
    sq.save(out, 'WEBP', quality=92, method=6)
    print(f'{name}: alpha {lo}-{hi}, trong suốt {clear:.0%} → {out} ({os.path.getsize(out)} B)')
