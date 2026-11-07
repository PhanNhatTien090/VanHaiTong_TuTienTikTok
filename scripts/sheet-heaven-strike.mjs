import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs';
const dir='output/heaven-strike',files=fs.readdirSync(dir).filter(f=>f.startsWith('live-')&&f.endsWith('.jpg')).sort();const tw=270,th=480,cols=6;
const cv=createCanvas(tw*cols,th*Math.ceil(files.length/cols)),c=cv.getContext('2d');
for(const [i,f] of files.entries()){const im=await loadImage(`${dir}/${f}`);c.drawImage(im,(i%cols)*tw,Math.floor(i/cols)*th,tw,th);c.fillStyle='#ff0';c.font='16px sans-serif';c.fillText(f.replace('.jpg',''),(i%cols)*tw+6,Math.floor(i/cols)*th+18);}
fs.writeFileSync(`${dir}/live-sheet.png`,cv.toBuffer('image/png'));
