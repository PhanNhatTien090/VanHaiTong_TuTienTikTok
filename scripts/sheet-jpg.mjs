// Ghép các ảnh .jpg trong thư mục thành bảng: node scripts/sheet-jpg.mjs <dir> <out.jpg> [cols=6] [cellW=270]
import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs';import path from 'node:path';
const [dir,out,colsA,cellA]=process.argv.slice(2),cols=Number(colsA||6),cw=Number(cellA||270),ch=Math.round(cw*16/9);
const files=fs.readdirSync(dir).filter(f=>/\.jpe?g$/.test(f)).sort();const rows=Math.ceil(files.length/cols);
const cv=createCanvas(cols*cw,rows*(ch+22)),c=cv.getContext('2d');c.fillStyle='#111';c.fillRect(0,0,cv.width,cv.height);
for(const [i,f] of files.entries()){const im=await loadImage(path.join(dir,f)),x=(i%cols)*cw,y=Math.floor(i/cols)*(ch+22);c.drawImage(im,x,y+22,cw,ch);c.fillStyle='#fff';c.font='16px Arial';c.fillText(f.replace(/^s0*/,'').replace('.jpg','s'),x+6,y+16);}
fs.writeFileSync(out,cv.toBuffer('image/jpeg',85));console.log(out,files.length);
