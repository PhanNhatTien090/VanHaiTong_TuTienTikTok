// Ghép ảnh tổng hợp từ thư mục khung: node scripts/contact-sheet.mjs <dir> <out.png> [mỗi N khung] [cột]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
const [dir,out,step=22,cols=6]=process.argv.slice(2);const files=fs.readdirSync(dir).filter(f=>/^f\d+\.png$/.test(f)).sort().filter((_,i)=>i%Number(step)===0);
const w=180,h=320,rows=Math.ceil(files.length/cols),cv=createCanvas(cols*(w+2),rows*(h+18)),c=cv.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
for(const [i,f] of files.entries()){const im=await loadImage(dir+'/'+f),x=(i%cols)*(w+2),y=Math.floor(i/cols)*(h+18);c.drawImage(im,x,y,w,h);c.fillStyle='#fff';c.font='12px Arial';c.fillText((Number(f.slice(1,5))/30).toFixed(1)+'s',x+4,y+h+13);}
fs.writeFileSync(out,cv.toBuffer('image/png'));console.log(files.length,'frames →',out);
