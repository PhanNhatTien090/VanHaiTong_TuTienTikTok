import fs from 'node:fs';
import { loadImage, createCanvas } from '@napi-rs/canvas';
for (const f of process.argv.slice(2)) {
  const img = await loadImage(fs.readFileSync(f)); const c = createCanvas(img.width, img.height); const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, img.width, img.height).data; let clear = 0; const n = img.width * img.height;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 10) clear++;
  console.log(f, img.width + 'x' + img.height, 'trong suốt ' + Math.round(clear / n * 100) + '%', clear / n > 0.15 ? 'OK' : 'KHÔNG CÓ NỀN TRONG SUỐT');
}
