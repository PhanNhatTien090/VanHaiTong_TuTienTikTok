// Tự tìm từng món trên ảnh nền trong suốt (vùng liền nhau), cắt ra theo thứ tự trái→phải, trên→dưới.
// Dùng: node web/tools/slice-auto.mjs <atlas.png> <outDir> name1,name2,... [gap=24] [minArea=4000]
// "gap": hai mảnh cách nhau ít hơn gap px (vd. tua rua treo dưới bảng) được gộp thành một món.
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const [src, outDir, namesArg, gapArg, minAreaArg] = process.argv.slice(2);
const names = (namesArg || '').split(',').filter(Boolean);
const gap = Number(gapArg ?? 24), minArea = Number(minAreaArg ?? 4000), ALPHA = Number(process.env.SLICE_ALPHA ?? 24);
const img = await loadImage(fs.readFileSync(src));
const W = img.width, H = img.height;
const cv = createCanvas(W, H), ctx = cv.getContext('2d');
ctx.drawImage(img, 0, 0);
const data = ctx.getImageData(0, 0, W, H).data;

// Lưới thô: mỗi ô B×B px đánh dấu "có hình" nếu có điểm alpha > 24. Nối các ô gần nhau (trong gap).
const B = 4, gw = Math.ceil(W / B), gh = Math.ceil(H / B);
const solid = new Uint8Array(gw * gh);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > ALPHA) solid[(y >> 2) * gw + (x >> 2)] = 1;
const reach = Math.ceil(gap / B);
const label = new Int32Array(gw * gh).fill(-1);
const boxes = [];
for (let i = 0; i < solid.length; i++) {
  if (!solid[i] || label[i] >= 0) continue;
  const id = boxes.length, box = { x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0 };
  const stack = [i]; label[i] = id;
  while (stack.length) {
    const j = stack.pop(), cx = j % gw, cy = (j / gw) | 0;
    box.n++; box.x0 = Math.min(box.x0, cx); box.x1 = Math.max(box.x1, cx); box.y0 = Math.min(box.y0, cy); box.y1 = Math.max(box.y1, cy);
    for (let dy = -reach; dy <= reach; dy++) for (let dx = -reach; dx <= reach; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
      const k = ny * gw + nx;
      if (solid[k] && label[k] < 0) { label[k] = id; stack.push(k); }
    }
  }
  boxes.push(box);
}
const items = boxes.filter(b => b.n * B * B >= minArea)
  .map(b => ({ x: b.x0 * B, y: b.y0 * B, w: (b.x1 - b.x0 + 1) * B, h: (b.y1 - b.y0 + 1) * B }));
// Sắp theo hàng: cùng hàng nếu tâm dọc chênh nhau ít hơn nửa chiều cao.
items.sort((a, b) => a.y - b.y);
const rows = [];
for (const it of items) {
  const row = rows.find(r => Math.abs((r[0].y + r[0].h / 2) - (it.y + it.h / 2)) < Math.min(r[0].h, it.h) / 2);
  row ? row.push(it) : rows.push([it]);
}
const ordered = rows.flatMap(r => r.sort((a, b) => a.x - b.x));
fs.mkdirSync(outDir, { recursive: true });
ordered.forEach((it, i) => {
  const name = names[i] || `part-${i + 1}`;
  if (name === '-') return;
  const pad = 4, x = Math.max(0, it.x - pad), y = Math.max(0, it.y - pad);
  const w = Math.min(W - x, it.w + pad * 2), h = Math.min(H - y, it.h + pad * 2);
  const out = createCanvas(w, h);
  out.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
  fs.writeFileSync(path.join(outDir, name + '.png'), out.toBuffer('image/png'));
  console.log(name, `${w}x${h}`, `@${x},${y}`);
});
if (ordered.length !== names.length && names.length) console.warn(`Tìm thấy ${ordered.length} món, đặt ${names.length} tên.`);
