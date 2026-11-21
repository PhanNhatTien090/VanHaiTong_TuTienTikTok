# 21/11/2026: ảnh nhỏ cho BẢNG CÁNH (gõ "cánh") → public/assets/wing-thumbs/w<N>.webp (N = số thứ tự trong WING_TIERS, 1-based).
# Cắt sát vùng có hình, đặt giữa khung 256×192 trong suốt. Vạn Kiếm Dực (chỉ có ảnh 1 thanh kiếm) → xếp 7 kiếm hình quạt như đôi cánh.
# Chạy lại khi thêm cánh: python scripts/wing-thumbs.py
import os
from PIL import Image
R = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
SRC = ['arena-v1/wing-cell-0.webp','arena-v1/wing-cell-3.webp','arena-v1/wing-cell-2.webp','arena-v1/wing-cell-1.webp',
       'arena-v1/wings-3000-ngoc-long.webp','arena-v1/wings-4000-xich-diem.webp','arena-v1/wings-5000-nguyet-diep.webp',
       'arena-v1/wings-6000-cuc-quang.webp','arena-v1/wings-7000-cuu-nhat.webp','SWORDS',
       'wings-v2/wing-demon.webp','wings-v2/lotus-wing.webp','wings-v2/light-wing.webp','wings-v2/ice-wing.webp',
       'wings-v2/thunder-wing.webp','wings-v2/chaos-wing.webp','wings-v2/emperor-wing.webp']
W, H = 256, 192
def trim(im):
    b = im.getchannel('A').point(lambda v: 255 if v > 14 else 0).getbbox()
    return im.crop(b) if b else im
def swords():
    s = trim(Image.open(os.path.join(R, 'wings-v2/sword.webp')).convert('RGBA'))
    s = s.resize((int(s.width * 300 / s.height), 300), Image.LANCZOS)
    c = Image.new('RGBA', (700, 420), (0, 0, 0, 0))
    for a in (-75, -50, -25, 25, 50, 75):   # 2 bên, chừa giữa cho thân người
        r = s.rotate(a, resample=Image.BICUBIC, expand=True)
        c.alpha_composite(r, (350 - r.width // 2 - int(a * 2.4), 400 - r.height))  # nghiêng trái (a>0) đặt bên trái → mũi kiếm xòe ra ngoài
    return c
os.makedirs(os.path.join(R, 'wing-thumbs'), exist_ok=True)
for i, src in enumerate(SRC, 1):
    im = swords() if src == 'SWORDS' else Image.open(os.path.join(R, src)).convert('RGBA')
    im = trim(im); im.thumbnail((W - 8, H - 8), Image.LANCZOS)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    out.save(os.path.join(R, 'wing-thumbs', f'w{i}.webp'), 'WEBP', quality=90, method=6)
print('xong', len(SRC))
