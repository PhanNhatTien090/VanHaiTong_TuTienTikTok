import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {CharacterAnimator,drawArticulated} from './public/character-animation.js';
import {SKINS} from './public/cosmetics.js';
const scene=Object.create(Scene.prototype);scene.standingArt=await loadImage('public/assets/cultivators-standing-v14.png');scene.characterArt=await loadImage('public/assets/cultivators-v3.png');scene.motion=true;scene.animator=new CharacterAnimator();
const events=[{effect:'attack',text:'Kiếm pháp liên hoàn'},{effect:'sword',text:'Lĩnh ngộ bí pháp'},{effect:'petal',text:'Luyện thành Tụ Khí Đan'},{effect:'breakthrough',text:'Đột phá cảnh giới'},{effect:'lotus',kind:'lotus',text:'Liên hoa pháp trận'}];
const actors=SKINS.map((skin,i)=>({id:'p'+i,giftCoins:skin.min}));
for(let i=0;i<5;i++)scene.animator.trigger({...events[i],user:actors[i].id,id:'demo'+i},0);
await fs.mkdir('output/anim-v15-frames',{recursive:true});
const canvas=createCanvas(1000,440),c=canvas.getContext('2d');
for(let frame=0;frame<84;frame++){
 const t=frame*1000/14,g=c.createLinearGradient(0,0,0,440);g.addColorStop(0,'#101d30');g.addColorStop(1,'#25484d');c.fillStyle=g;c.fillRect(0,0,1000,440);
 c.textAlign='center';c.fillStyle='#e8dcb5';c.font='24px Georgia';c.fillText('VÂN HẢI TÔNG · HOẠT ẢNH NHÂN VẬT',500,42);
 for(let i=0;i<5;i++){
  c.save();c.translate(100+i*200,330);c.scale(2.2,2.2);c.strokeStyle=SKINS[i].color+'55';c.beginPath();c.ellipse(0,27,36,9,0,0,Math.PI*2);c.stroke();
  drawArticulated(c,scene,actors[i],SKINS[i],t,i,scene.animator.pose(actors[i],t));c.restore();c.fillStyle='#eee8d5';c.font='17px Segoe UI';c.fillText(events[i].text,100+i*200,391);
 }
 c.fillStyle='#c1d0d2';c.font='13px Segoe UI';c.fillText('Bản trình diễn hoạt ảnh · không tạo tương tác hay phần thưởng',500,424);
 await fs.writeFile('output/anim-v15-frames/'+String(frame).padStart(3,'0')+'.png',canvas.toBuffer('image/png'));
}
console.log('Rendered 84 frames');
