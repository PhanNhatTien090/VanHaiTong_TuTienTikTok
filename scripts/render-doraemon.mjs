import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {sliceDoraSkin,drawDoraBody,drawDoraRelic,drawDoraTechnique} from '../public/doraemon-art.js';import {attackTechnique} from '../public/combat-techniques.js';
const scene={doraArt:{},budget:{level:'light'},motion:true};scene.doraArt.skin=sliceDoraSkin(await loadImage('public/assets/doraemon-v1/skin.png'),(w,h)=>createCanvas(w,h));for(const id of ['door','copter','cannon'])scene.doraArt[id]=await loadImage('public/assets/doraemon-v1/'+id+'.png');
const c=createCanvas(1200,700),x=c.getContext('2d');x.fillStyle='#0b2230';x.fillRect(0,0,1200,700);x.fillStyle='#f9e5b2';x.font='bold 28px Segoe UI';x.fillText('DORAEMON · BẢO BỐI THẦN KỲ',45,45);
for(let i=0;i<2;i++){const p={skinChoice:'doraemon-avatar',rewardSkins:['doraemon-avatar'],equipped:['dora-bamboo-copter','dora-air-cannon'][i]};x.save();x.translate(175+i*280,430);x.scale(3,3);drawDoraBody(scene,x,p,{stand:i?0:1},2000);drawDoraRelic(scene,x,p,2000);x.restore();x.font='18px Segoe UI';x.fillStyle='#deedf2';x.fillText(i?'Tọa thiền · pháo khí':'Chào đón · chong chóng',65+i*280,500);}
for(const [i,key]of ['door','copter','cannon'].entries()){x.drawImage(scene.doraArt[key],650+i*175,120,160,170);}
const p={x:920,y:550};drawDoraTechnique(scene,x,{technique:attackTechnique({equipped:'dora-anywhere-door'})},2000,.5,p);x.fillStyle='#acf5ed';x.font='18px Segoe UI';x.fillText('Cánh cửa xuyên không · chiêu riêng',660,645);
fs.writeFileSync('output/doraemon-preview.png',c.toBuffer('image/png'));
