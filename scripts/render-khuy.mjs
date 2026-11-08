// Ảnh kiểm tra Khuy Niết Lôi Tôn (offline): node scripts/render-khuy.mjs → output/khuy-niet-v1/review.png + public/assets/khuy-niet-v1/card.png
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawKhuyBody,drawKhuyAdornment,khuyStrike,khuyDragonPose,KHUY_SKIN,KHUY_DRAGON} from '../public/khuy-niet.js';
import {sliceTudoSkin,trimBlade} from '../public/tudo-ma-ton.js';
const skin=sliceTudoSkin(await loadImage('public/assets/khuy-niet-v1/skin.png'),createCanvas),dragon=trimBlade(await loadImage('public/assets/khuy-niet-v1/dragon.png'),createCanvas),bg=await loadImage('public/assets/worlds-v2/jade-palace.png');
const scene={motion:true,budget:{level:'balanced'},khuySkinArt:skin,khuyDragonArt:dragon,surfaceFactory:(w,h)=>createCanvas(w,h)};
const seedOf=id=>{let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const draw=(c,p,x,y,scale,stand,t)=>{const target={id:p.id,player:p,x,y,scale,pose:{stand}};drawKhuyAdornment(scene,c,target,t,'back');c.save();c.translate(x,y);c.scale(scale,scale);drawKhuyBody(scene,c,p,{stand},t);c.restore();drawKhuyAdornment(scene,c,target,t,'front');};
// Ô trái: 4 tư thế (2 người có rồng); ô phải: thường / thiên lôi giáng / rồng gầm
const cv=createCanvas(1800,1600),c=cv.getContext('2d');c.drawImage(bg,0,0,900,1600);c.drawImage(bg,900,0,900,1600);
const people=[['a1','nam',1,240,700,false],['b2','nu',1,660,700,false],['c3','nam',0,240,1450,false],['d4','nu',0,660,1450,true]];
for(const [id,gender,stand,x,y,dr] of people)draw(c,{id,gender,skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:dr?KHUY_DRAGON:null},x,y,3.4,stand,2000);
const id='e5',seed=seedOf(id);let ts=0,tr=0;for(let t=0;t<20000;t+=10){if(!ts&&khuyStrike(t,seed).bolt)ts=t;if(!tr&&khuyDragonPose(t,seed).roar>.95)tr=t;}
const pe={id,gender:'nam',skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:KHUY_DRAGON};
[[ts-2000,1130,'Thường'],[ts+20,1530,'Thiên lôi']].forEach(([t,x,l])=>{draw(c,pe,x,720,3.4,1,t);c.fillStyle='#fff';c.font='bold 30px Arial';c.fillText(l,x-60,780);});
draw(c,pe,1330,1450,3.4,1,tr);c.fillStyle='#fff';c.font='bold 30px Arial';c.fillText('Rồng gầm',1260,1510);
fs.writeFileSync('output/khuy-niet-v1/review.png',cv.toBuffer('image/png'));
// Thẻ dashboard 240×320
const card=createCanvas(240,320),k=card.getContext('2d');const g=k.createLinearGradient(0,0,0,320);g.addColorStop(0,'#2a0f4a');g.addColorStop(1,'#0a0414');k.fillStyle=g;k.fillRect(0,0,240,320);
draw(k,{id:'card',gender:'nam',skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:KHUY_DRAGON},120,300,1.85,1,2000);
fs.writeFileSync('public/assets/khuy-niet-v1/card.png',card.toBuffer('image/png'));console.log('ok strike',ts,'roar',tr);
