// Xem thử hiệu ứng 5 thú 300 coin (+3 thú 200 để so). node scripts/render-premium-pets.mjs [out] [t1,t2,...]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {slicePetFrames,slicePremiumPetFrames,drawPet} from '../public/spirit-pet-art.js?v=drawn-pets-20261114';
import {PREMIUM_PET_PERIODS,PREMIUM_PET_ATLAS} from '../public/premium-pet-motion.js?v=drawn-v2';
const out=process.argv[2]||'output/premium-pets';fs.mkdirSync(out,{recursive:true});
const times=(process.argv[3]||'0,700,1400,2600').split(',').map(Number),bursts=(process.argv[4]||'-1,.12,.3,.55').split(',').map(Number);
const make=(w,h)=>createCanvas(w,h),art=new Map();
for(const p of ALL_PETS){try{if(PREMIUM_PET_PERIODS[p.id]){const im=await loadImage(`public/assets/spirit-pets-v1/animated/${p.id}-${PREMIUM_PET_ATLAS.version}.webp`);art.set(p.id,slicePremiumPetFrames(im,p.id,make));}else{const im=await loadImage(`public/assets/spirit-pets-v1/${p.id}.png`);art.set(p.id,slicePetFrames(im,p.id,make));}}catch{}}
const body=await loadImage('public/assets/realm-skins-v2/kim-dan/male-standing-v1.png'),bg=await loadImage('public/assets/maps-v3/pet-cove.png');
const pets=['loi-oa','ky-lan','bach-nguyet-ho','ngoc-chau-long','xich-ha-phuong','tu-nguyet-lan','hac-tinh-ho'];
const W=pets.length*170+40,rowH=260,canvas=createCanvas(W,rowH*times.length),c=canvas.getContext('2d');
c.drawImage(bg,0,700,bg.width,bg.width*canvas.height/W,0,0,W,canvas.height);
const scene={petArt:art,motion:true,budget:{level:'high'},petV2Settings:{}};
for(const [r,t] of times.entries()){globalThis.__premiumBurstPreview=bursts[r];c.fillStyle='#fff';c.font='bold 18px Arial';c.fillText('t='+t/1000+'s burst='+bursts[r],8,r*rowH+22);
 for(const [i,id] of pets.entries()){const x=100+i*170,y=r*rowH+220,scale=1.4,h=170;c.drawImage(body,x-h*.33,y-h*.95,h*.66,h);
  drawPet(scene,c,{x,y,scale,player:{id:'p'+i*7919,spiritPet:id}},t);}}
fs.writeFileSync(out+'/pets.png',canvas.toBuffer('image/png'));console.log('ok',out);
