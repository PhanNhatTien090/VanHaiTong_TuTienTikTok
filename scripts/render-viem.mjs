// Ảnh kiểm tra Phần Thiên Viêm Tôn (offline, không dùng Chrome): node scripts/render-viem.mjs [out.png]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawViemBody,drawViemAdornment,viemBurst,viemBladePose,recolorToFire,fitFrame,VIEM_SKIN,VIEM_BLADES} from '../public/viem-ton.js';
import {sliceTudoSkin} from '../public/tudo-ma-ton.js';
const out=process.argv[2]||'output/viem-ton-v1/review.png';fs.mkdirSync(out.replace(/[\\/][^\\/]*$/,''),{recursive:true});
const seat=sliceTudoSkin(recolorToFire(await loadImage('public/assets/khuy-niet-v1/skin.png'),createCanvas),createCanvas)[2],st=fitFrame(await loadImage('public/assets/viem-ton-v1/stand.png'),createCanvas),skin=[st,st,seat,seat],bg=await loadImage('public/assets/worlds-v2/jade-palace.png');
const scene={motion:true,budget:{level:'balanced'},viemSkinArt:skin,surfaceFactory:(w,h)=>createCanvas(w,h)};
const seedOf=id=>{let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const draw=(c,p,x,y,scale,stand,t)=>{const target={id:p.id,player:p,x,y,scale,pose:{stand}};drawViemAdornment(scene,c,target,t,'back');c.save();c.translate(x,y);c.scale(scale,scale);drawViemBody(scene,c,p,{stand},t);c.restore();drawViemAdornment(scene,c,target,t,'front');};
const cv=createCanvas(1800,1600),c=cv.getContext('2d');c.drawImage(bg,0,0,900,1600);c.drawImage(bg,900,0,900,1600);
const people=[['a1','nam',1,240,700,true],['b2','nu',1,660,700,false],['c3','nam',0,240,1450,false],['d4','nu',0,660,1450,true]];
for(const [id,gender,stand,x,y,orb] of people)draw(c,{id,gender,skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:orb?VIEM_BLADES:null},x,y,3.4,stand,2000);
const id='e5',seed=seedOf(id);let tb=0,to=0;for(let t=4000;t<30000;t+=10){if(!tb&&viemBurst(t,seed).burst>.95)tb=t;if(!to&&viemBladePose(t,seed).slash>.95)to=t;}
const pe={id,gender:'nam',skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES};
const label=(l,x,y)=>{c.fillStyle='#fff';c.font='bold 30px Arial';c.fillText(l,x,y);};
draw(c,pe,1130,720,3.4,1,tb-3000);label('Thường',1070,780);draw(c,pe,1530,720,3.4,1,tb);label('Phần Thiên',1450,780);
draw(c,pe,1130,1450,3.4,1,to);label('Song Đao chém',1030,1510);
draw(c,{id:'f6',gender:'nam',equipped:VIEM_BLADES},1530,1450,3.4,1,2000);label('Chỉ pháp bảo',1440,1510);
fs.writeFileSync(out,cv.toBuffer('image/png'));console.log('ok burst',tb,'blast',to,out);
