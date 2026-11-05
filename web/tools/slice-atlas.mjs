// Cắt một tấm ảnh nhiều món (lưới cột × hàng, nền trong suốt) thành từng file PNG, cắt sát phần có hình.
// Dùng: node web/tools/slice-atlas.mjs <atlas.png> <cols> <rows> <outDir> name1,name2,...  (tên "-" = bỏ qua ô đó)
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';

const [src, colsArg, rowsArg, outDir, namesArg, padArg] = process.argv.slice(2);
if (!src || !namesArg) {
  console.error('Dùng: node slice-atlas.mjs <atlas.png> <cols> <rows> <outDir> name1,name2,... [pad]');
  process.exit(1);
}
const cols = Number(colsArg), rows = Number(rowsArg), pad = Number(padArg ?? 6);
const names = namesArg.split(',');
const img = await loadImage(fs.readFileSync(src));
const W = img.width, H = img.height;
const full = createCanvas(W, H);
const fctx = full.getContext('2d');
fctx.drawImage(img, 0, 0);
const data = fctx.getImageData(0, 0, W, H).data;
const alphaAt = (x, y) => data[(y * W + x) * 4 + 3];

fs.mkdirSync(outDir, { recursive: true });
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const name = names[r * cols + c];
    if (!name || name === '-') continue;
    const x0 = Math.floor((c * W) / cols), x1 = Math.floor(((c + 1) * W) / cols);
    const y0 = Math.floor((r * H) / rows), y1 = Math.floor(((r + 1) * H) / rows);
    let minX = x1, minY = y1, maxX = x0, maxY = y0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (alphaAt(x, y) > 12) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
    }
    if (maxX < minX) { console.warn('Ô trống:', name); continue; }
    minX = Math.max(x0, minX - pad); minY = Math.max(y0, minY - pad); maxX = Math.min(x1 - 1, maxX + pad); maxY = Math.min(y1 - 1, maxY + pad);
    const w = maxX - minX + 1, h = maxY - minY + 1;
    const out = createCanvas(w, h);
    out.getContext('2d').drawImage(img, minX, minY, w, h, 0, 0, w, h);
    const file = path.join(outDir, name + '.png');
    fs.writeFileSync(file, out.toBuffer('image/png'));
    console.log(file, w + 'x' + h);
  }
}
