// Ảnh kiểm tra Tần Mục Hỏa Thần (offline, không dùng Chrome): node scripts/render-viem.mjs [out.png]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawViemBody,drawViemAdornment,viemBurst,viemBladePose,recolorToFire,fitFrame,VIEM_SKIN,VIEM_BLADES} from '../public/viem-ton.js';
import {sliceTudoSkin} from '../public/tudo-ma-ton.js';
const out=process.argv[2]||'output/viem-ton-v1/review.png';fs.mkdirSync(out.replace(/[\\/][^\\/]*$/,''),{recursive:true});
const seat=await loadImage('public/assets/viem-ton-v1/seat.png'),st=fitFrame(await loadImage('public/assets/viem-ton-v1/stand.png'),createCanvas),skin=[st,st,seat,seat],bg=await loadImage('public/assets/worlds-v2/jade-palace.png');
const scene={motion:true,budget:{level:'balanced'},viemSkinArt:skin,surfaceFactory:(w,h)=>createCanvas(w,h)};
const seedOf=id=>{let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const draw=(c,p,x,y,scale,stand,t)=>{const target={id:p.id,player:p,x,y,scale,pose:{stand}};drawViemAdornment(scene,c,target,t,'back');c.save();c.translate(x,y);c.scale(scale,scale);drawViemBody(scene,c,p,{stand},t);c.restore();drawViemAdornment(scene,c,target,t,'front');};
const cv=createCanvas(1800,1600),c=cv.getContext('2d');c.drawImage(bg,0,0,900,1600);c.drawImage(bg,900,0,900,1600);
const people=[['a1','nam',1,240,700,true],['b2','nu',1,660,700,false],['c3','nam',0,240,1450,false],['d4','nu',0,660,1450,true]];
for(const [id,gender,stand,x,y,orb] of people)draw(c,{id,gender,skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:orb?VIEM_BLADES:null},x,y,3.4,stand,2000);
const id='e5',seed=seedOf(id);let tb=0,to=0;for(let t=4000;t<30000;t+=10){if(!tb&&viemBurst(t,seed).burst>.95)tb=t;if(!to&&Math.abs(viemBladePose(t,seed).fly-.4)<.01)to=t;}
const pe={id,gender:'nam',skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES};
const label=(l,x,y)=>{c.fillStyle='#fff';c.font='bold 30px Arial';c.fillText(l,x,y);};
draw(c,pe,1130,720,3.4,1,tb-3000);label('Thường',1070,780);draw(c,pe,1530,720,3.4,1,tb);label('Phần Thiên',1450,780);
draw(c,pe,1130,1450,3.4,1,to);label('Song Đao bay',1030,1510);
draw(c,{id:'f6',gender:'nam',equipped:VIEM_BLADES},1530,1450,3.4,1,2000);label('Chỉ pháp bảo',1440,1510);
fs.writeFileSync(out,cv.toBuffer('image/png'));console.log('ok burst',tb,'blast',to,out);
// Thẻ dashboard 240×320 (public/assets/viem-ton-v1/card.png)
{const card=createCanvas(240,320),k=card.getContext('2d');const g=k.createLinearGradient(0,0,0,320);g.addColorStop(0,'#4a1206');g.addColorStop(1,'#140402');k.fillStyle=g;k.fillRect(0,0,240,320);
 const p={id:'card',gender:'nam',skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES},target={id:'card',player:p,x:120,y:300,scale:1.85,pose:{stand:1}};
 drawViemAdornment(scene,k,target,2000,'back');k.save();k.translate(120,300);k.scale(1.85,1.85);drawViemBody(scene,k,p,{stand:1},2000);k.restore();drawViemAdornment(scene,k,target,2000,'front');
 fs.writeFileSync('public/assets/viem-ton-v1/card.png',card.toBuffer('image/png'));}
