// Cắt mẫu nhân vật LIVE (thần trang theo cảnh giới, nam/nữ đứng) ra từng ảnh làm ảnh gốc cho Codex.
// Bố cục lấy từ DIVINE_LAYOUTS trong public/divine-wardrobe.js (đúng ranh giới đã kiểm tra trên LIVE).
import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';
const L = { 0: { rows: [0, 406, 796] }, 1: { rows: [0, 431, 782] }, 2: { rows: [0, 420, 796] }, 3: { rows: [0, 516, 1041] } };
const NAMES = ['Phàm Nhân','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh','Hóa Thần','Luyện Hư','Đại Thừa','Chân Tiên','Huyền Tiên','Kim Tiên','Thái Ất','Đại La','Tiên Đế'];
fs.mkdirSync('web/art-src/ref', { recursive: true });
for (let realm = 0; realm < 14; realm++) {
  const group = Math.floor(realm / 4), col = realm % 4, cols = group === 3 ? 2 : 4;
  const img = await loadImage(fs.readFileSync(`public/assets/divine-war-v1/realms-${group}.png`));
  const cw = img.width / cols;
  for (const [gi, g] of [[0, 'nam'], [1, 'nu']]) {
    const y0 = L[group].rows[gi], y1 = L[group].rows[gi + 1];
    const c = createCanvas(Math.round(cw), y1 - y0);
    c.getContext('2d').drawImage(img, Math.round(col * cw), y0, Math.round(cw), y1 - y0, 0, 0, Math.round(cw), y1 - y0);
    fs.writeFileSync(`web/art-src/ref/realm-${realm}-${g}.png`, c.toBuffer('image/png'));
  }
  console.log(realm, NAMES[realm]);
}
