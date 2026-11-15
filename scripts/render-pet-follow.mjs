// Xem thử linh thú đi quanh chủ (offline). node scripts/render-pet-follow.mjs [out]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {slicePetFrames,slicePremiumPetFrames,drawPet} from '../public/spirit-pet-art.js?v=drawn-pets-20261114';
import {PREMIUM_PET_PERIODS,PREMIUM_PET_ATLAS} from '../public/premium-pet-motion.js?v=drawn-v2';
const out=process.argv[2]||'output/pet-follow';fs.mkdirSync(out,{recursive:true});
const make=(w,h)=>createCanvas(w,h),art=new Map();
for(const p of ALL_PETS){try{if(PREMIUM_PET_PERIODS[p.id]){const im=await loadImage(`public/assets/spirit-pets-v1/animated/${p.id}-${PREMIUM_PET_ATLAS.version}.webp`);art.set(p.id,slicePremiumPetFrames(im,p.id,make));}else{const im=await loadImage(`public/assets/spirit-pets-v1/${p.id}.png`);art.set(p.id,slicePetFrames(im,p.id,make));}}catch{}}
const body=await loadImage('public/assets/realm-skins-v2/kim-dan/male-standing-v1.png'),bg=await loadImage('public/assets/maps-v3/pet-cove.png');
const pets=['jade-rabbit','ember-fox','sun-phoenix','hac-tinh-ho','ky-lan','ngoc-chau-long'],times=[0,1500,3000,4500];
const W=900,rowH=230,canvas=createCanvas(W,rowH*times.length),c=canvas.getContext('2d');
c.drawImage(bg,0,700,bg.width,bg.width*canvas.height/W,0,0,W,canvas.height);
const scene={petArt:art,motion:true,budget:{level:'high'},petV2Settings:{}};
for(const [r,t] of times.entries()){c.fillStyle='#fff';c.font='bold 18px Arial';c.fillText('t='+t/1000+'s',8,r*rowH+22);
 for(const [i,id] of pets.entries()){const x=80+i*148,y=r*rowH+190,scale=1.18,h=150;c.drawImage(body,x-h*.33,y-h*.95,h*.66,h);
  drawPet(scene,c,{x,y,scale,player:{id:'p'+i*7919,spiritPet:id}},t);}}
fs.writeFileSync(out+'/follow.png',canvas.toBuffer('image/png'));console.log('ok');
