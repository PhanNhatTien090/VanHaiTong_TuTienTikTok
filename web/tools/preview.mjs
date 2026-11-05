// Ghép ảnh trong suốt lên nền hồng (để xem viền), kèm lưới toạ độ mỗi 100px. Dùng: node preview.mjs in.png out.jpg [grid]
import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';
const [src, out, grid] = process.argv.slice(2);
const img = await loadImage(fs.readFileSync(src));
const c = createCanvas(img.width, img.height), g = c.getContext('2d');
g.fillStyle = '#ff00ff'; g.fillRect(0, 0, img.width, img.height); g.drawImage(img, 0, 0);
if (grid) { g.strokeStyle = '#00ffff88'; g.fillStyle = '#00ffff'; g.font = '20px sans-serif';
  for (let x = 0; x < img.width; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, img.height); g.stroke(); g.fillText(x, x + 2, 20); }
  for (let y = 0; y < img.height; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(img.width, y); g.stroke(); g.fillText(y, 2, y - 2); } }
fs.writeFileSync(out, c.toBuffer('image/jpeg', 85));
