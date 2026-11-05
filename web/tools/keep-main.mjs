// Giữ lại khối hình liền lớn nhất trong ảnh trong suốt (xóa mảnh vụn của món bên cạnh), rồi cắt sát.
// Dùng: node web/tools/keep-main.mjs a.png b.png ...
import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';

for (const file of process.argv.slice(2)) {
  const img = await loadImage(fs.readFileSync(file));
  const W = img.width, H = img.height;
  const c = createCanvas(W, H), g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  const label = new Int32Array(W * H).fill(-1);
  const sizes = [];
  for (let i = 0; i < W * H; i++) {
    if (d[i * 4 + 3] <= 6 || label[i] >= 0) continue;
    const id = sizes.length; let n = 0; const stack = [i]; label[i] = id;
    while (stack.length) {
      const j = stack.pop(); n++;
      const x = j % W, y = (j / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const k = ny * W + nx;
        if (label[k] < 0 && d[k * 4 + 3] > 6) { label[k] = id; stack.push(k); }
      }
    }
    sizes.push(n);
  }
  const main = sizes.indexOf(Math.max(...sizes));
  let x0 = W, y0 = H, x1 = 0, y1 = 0, removed = 0;
  for (let i = 0; i < W * H; i++) {
    if (label[i] === main) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    else if (label[i] >= 0) { d[i * 4 + 3] = 0; removed++; }
  }
  g.putImageData(im, 0, 0);
  const pad = 2; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
  const out = createCanvas(x1 - x0 + 1, y1 - y0 + 1);
  out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  fs.writeFileSync(file, out.toBuffer('image/png'));
  console.log(file.split(/[\\/]/).pop(), `${out.width}x${out.height}`, `bỏ ${removed} điểm vụn`, `dời (${x0},${y0})`);
}
