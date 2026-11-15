// Xem thử màn Linh Thú Cốc offline (không cần server/Chrome). node scripts/render-pet-cove.mjs [out-dir] [giây...]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {slicePetFrames,slicePremiumPetFrames} from '../public/spirit-pet-art.js?v=drawn-pets-20261114';
import {PREMIUM_PET_PERIODS,PREMIUM_PET_ATLAS} from '../public/premium-pet-motion.js?v=drawn-v2';
import {drawPetCove} from '../public/pet-cove.js?v=drawn-pets-20261114';
const out=process.argv[2]||'output/pet-cove-v3',times=(process.argv.slice(3).map(Number).filter(Number.isFinite));fs.mkdirSync(out,{recursive:true});
const make=(w,h)=>createCanvas(w,h),art=new Map();
for(const p of ALL_PETS){try{if(PREMIUM_PET_PERIODS[p.id]){const im=await loadImage(`public/assets/spirit-pets-v1/animated/${p.id}-${PREMIUM_PET_ATLAS.version}.webp`);art.set(p.id,slicePremiumPetFrames(im,p.id,make));}else{const im=await loadImage(`public/assets/spirit-pets-v1/${p.id}.png`);art.set(p.id,slicePetFrames(im,p.id,make));}}catch(e){console.log('skip',p.id,e.message);}}
const bg=await loadImage('public/assets/maps-v3/pet-cove.png'),W=900,H=1600,now=Date.now();
const featured=process.env.FEATURED||'loi-oa',premium=process.env.PREMIUM||'hac-tinh-ho',phase=process.env.PHASE||'exploration';
for(const s of (times.length?times:[0,2.5,5,8])){
 const canvas=createCanvas(W,H),c=canvas.getContext('2d');const sc=Math.max(W/bg.width,H/bg.height);c.drawImage(bg,(W-bg.width*sc)/2,(H-bg.height*sc)/2,bg.width*sc,bg.height*sc);
 const scene={petArt:art,motion:true,budget:{level:'high'},petEvent:{active:true,startedAt:now-60000,endsAt:now+181000,featured,premium},petCovePhase:{phase,progress:.3,joined:Number(process.env.JOINED??3),goal:8},petV2Settings:{enabled:true}};
 // HUD DOM (ước lượng): 2 thẻ trên cùng + dòng tặng hộ.
 c.fillStyle='#061726c0';c.fillRect(14,14,430,64);c.fillRect(456,14,430,64);c.fillRect(14,86,872,36);
 const realNow=Date.now;Date.now=()=>now;drawPetCove(scene,c,s*1000,H);Date.now=realNow;
 // Hàng người chơi ước lượng
 c.fillStyle='#ffffff22';for(let r=0;r<3;r++)for(let i=0;i<8;i++)c.fillRect(90+i*90+20,H*(.62+r*.1),50,H*.07);
 fs.writeFileSync(`${out}/cove-${s}.png`,canvas.toBuffer('image/png'));
}
console.log('ok',out);
