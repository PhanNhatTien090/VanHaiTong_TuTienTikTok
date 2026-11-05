// Tô lại "nắp khớp" phẳng (vòng tròn cắt ở vai/khuỷu) bằng màu vải lấy ngay bên ngoài vòng tròn theo một hướng.
// Dùng: node fill-cap.mjs file.png cx cy r dirX dirY [feather=6]
// Mỗi điểm trong vòng tròn lấy màu ở điểm ra khỏi vòng tròn theo hướng (dirX,dirY) cộng thêm vài px.
import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';
const [file, ...nums] = process.argv.slice(2);
const [cx, cy, r, dx, dy, feather = 6] = nums.map(Number);
const img = await loadImage(fs.readFileSync(file));
const W = img.width, H = img.height;
const c = createCanvas(W, H), g = c.getContext('2d');
g.drawImage(img, 0, 0);
const im = g.getImageData(0, 0, W, H), d = im.data, src = new Uint8ClampedArray(d);
const len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
let changed = 0;
for (let y = Math.max(0, cy - r - feather); y <= Math.min(H - 1, cy + r + feather); y++) {
  for (let x = Math.max(0, cx - r - feather); x <= Math.min(W - 1, cx + r + feather); x++) {
    const dist = Math.hypot(x - cx, y - cy);
    if (dist > r + feather) continue;
    const i = (y * W + x) * 4;
    if (src[i + 3] < 20) continue;
    // Đi theo hướng (ux,uy) tới khi ra khỏi vòng tròn + 8px rồi lấy màu ở đó.
    let sx = x, sy = y, steps = 0;
    while (Math.hypot(sx - cx, sy - cy) <= r + 8 && steps < 4 * r) { sx += ux; sy += uy; steps++; }
    const px = Math.round(Math.min(W - 1, Math.max(0, sx))), py = Math.round(Math.min(H - 1, Math.max(0, sy)));
    const j = (py * W + px) * 4;
    if (src[j + 3] < 40) continue;
    const t = dist <= r ? 1 : 1 - (dist - r) / feather; // mép hoà dần
    for (let k = 0; k < 3; k++) d[i + k] = Math.round(src[i + k] * (1 - t) + src[j + k] * t);
    changed++;
  }
}
g.putImageData(im, 0, 0);
fs.writeFileSync(file, c.toBuffer('image/png'));
console.log(file.split(/[\\/]/).pop(), 'tô', changed, 'điểm');
