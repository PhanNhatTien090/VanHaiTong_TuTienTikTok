import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {SPIRIT_PETS} from '../public/spirit-pets.js';import {drawPet,slicePetFrames} from '../public/spirit-pet-art.js';
const art=new Map();for(const p of SPIRIT_PETS){const im=await loadImage('public/assets/spirit-pets-v1/'+p.id+'.png');art.set(p.id,slicePetFrames(im,p.id,createCanvas));}
const canvas=createCanvas(1100,760),c=canvas.getContext('2d'),scene={petArt:art,motion:true,budget:{level:'light'}};
const bg=c.createLinearGradient(0,0,1100,760);bg.addColorStop(0,'#0c172b');bg.addColorStop(1,'#173b3b');c.fillStyle=bg;c.fillRect(0,0,1100,760);
c.fillStyle='#ffe5ac';c.textAlign='center';c.font='bold 34px Segoe UI';c.fillText('LINH THÚ CỐC · 5 BẠN ĐỒNG HÀNH',550,60);c.font='19px Segoe UI';c.fillText('Mốc trong sự kiện · đủ tym HOẶC coin · giữ thú sau sự kiện',550,102);
for(const [i,p]of SPIRIT_PETS.entries()){const x=110+i*220;c.fillStyle=p.color;c.font='bold 21px Segoe UI';c.fillText(p.name,x,165);c.font='17px Segoe UI';c.fillText(p.rank,x,195);drawPet(scene,c,{x:x-85,y:345,scale:2.7,player:{id:p.id,spiritPet:p.id}},1500+i*50);c.fillStyle='#d4e5dd';c.font='20px Segoe UI';c.fillText(p.hearts.toLocaleString('vi-VN')+' tym',x,465);if(p.coins)c.fillText('hoặc '+p.coins+' coin',x,495);c.fillText('thu '+(i+1),x,535);
 const im=await loadImage('public/assets/spirit-pets-v1/'+p.id+'.png'),raw=createCanvas(im.width,im.height),cx=raw.getContext('2d');cx.drawImage(im,0,0);const data=cx.getImageData(0,0,im.width,im.height).data;let clear=0,solid=0;for(let a=3;a<data.length;a+=4){clear+=data[a]===0;solid+=data[a]>200;}console.log(p.id,im.width+'x'+im.height,'transparent',Math.round(clear/(data.length/4)*100)+'%','solid',solid);if(clear<1000||solid<1000)throw Error('Invalid alpha asset');
}
c.font='20px Segoe UI';c.fillStyle='#c5dfd6';c.fillText('Gõ thu để xem tiến độ · thu 1–5 đổi con đã sở hữu · thu an cho nghỉ',550,625);c.fillText('3 tư thế chuyển động + nhún, lượn và linh quang VIP · 1 thú nhỏ/người',550,670);
fs.writeFileSync('output/spirit-pets-preview.png',canvas.toBuffer('image/png'));
