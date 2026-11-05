// Xếp nhiều ảnh bộ phận cạnh nhau kèm lưới 20px (nhãn mỗi 100px) để đo toạ độ khớp.
// Dùng: node grid-sheet.mjs out.jpg a.png b.png ...
import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';
const [out, ...files] = process.argv.slice(2);
const imgs = await Promise.all(files.map(async f => [f.split(/[\/]/).pop().replace('.png', ''), await loadImage(fs.readFileSync(f))]));
const W = imgs.reduce((s, [, i]) => s + i.width + 60, 40), H = Math.max(...imgs.map(([, i]) => i.height)) + 80;
const c = createCanvas(W, H), g = c.getContext('2d');
g.fillStyle = '#ff00ff'; g.fillRect(0, 0, W, H);
let ox = 40;
for (const [n, im] of imgs) {
  const oy = 40; g.drawImage(im, ox, oy);
  for (let x = 0; x <= im.width; x += 20) { g.strokeStyle = x % 100 ? '#00ffff55' : '#00ffff'; g.beginPath(); g.moveTo(ox + x, oy); g.lineTo(ox + x, oy + im.height); g.stroke(); if (x % 100 === 0) { g.fillStyle = '#ff0'; g.font = 'bold 15px sans-serif'; g.fillText(x, ox + x - 6, oy - 6); } }
  for (let y = 0; y <= im.height; y += 20) { g.strokeStyle = y % 100 ? '#00ffff55' : '#00ffff'; g.beginPath(); g.moveTo(ox, oy + y); g.lineTo(ox + im.width, oy + y); g.stroke(); if (y % 100 === 0) { g.fillStyle = '#ff0'; g.font = 'bold 15px sans-serif'; g.fillText(y, ox - 34, oy + y + 5); } }
  g.fillStyle = '#fff'; g.font = 'bold 18px sans-serif'; g.fillText(n, ox, oy + im.height + 26);
  ox += im.width + 60;
}
fs.writeFileSync(out, c.toBuffer('image/jpeg', 88));
