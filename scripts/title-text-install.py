# 21/11/2026 tối: cài ẢNH CHỮ danh hiệu Codex vẽ (PNG nền trong suốt) → public/assets/title-text/<khóa>.webp cao 96 px
# (cắt viền trong suốt, giữ alpha). Trên sân hiện cao ~20–27 px → 96 px đủ nét kể cả khi camera phóng.
# Dùng: python scripts/title-text-install.py <thư mục PNG>
import sys, os
from PIL import Image
src = sys.argv[1]
dst = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'title-text')
os.makedirs(dst, exist_ok=True)
H = 96
for name in sorted(os.listdir(src)):
    if not name.lower().endswith('.png'):
        continue
    im = Image.open(os.path.join(src, name)).convert('RGBA')
    a = im.getchannel('A')
    lo, hi = a.getextrema()
    clear = sum(1 for v in a.get_flattened_data() if v < 16) / (im.width * im.height)
    box = a.point(lambda v: 255 if v > 60 else 0).getbbox() or (0, 0, im.width, im.height)
    im = im.crop(box)
    pad = max(2, im.height // 30)
    sq = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    sq.paste(im, (pad, pad))
    w = max(1, round(sq.width * H / sq.height))
    sq = sq.resize((w, H), Image.LANCZOS)
    out = os.path.join(dst, os.path.splitext(name)[0] + '.webp')
    sq.save(out, 'WEBP', quality=92, method=6)
    print(f'{name}: alpha {lo}-{hi}, trong suốt {clear:.0%} → {w}x{H} ({os.path.getsize(out)} B)')
