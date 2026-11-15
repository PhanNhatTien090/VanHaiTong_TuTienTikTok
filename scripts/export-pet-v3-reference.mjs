// Temporary art QA reference export: the exact first poses of 3 existing game sprites.
// Kept separate from the LIVE runtime; does NOT invent any creature appearance.
import fs from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {slicePetFrames,slicePremiumPetFrames} from '../public/spirit-pet-art.js';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
const picks=ALL_PETS.map(p=>{
 const premium=Object.hasOwn(PREMIUM_PET_PERIODS,p.id);
 return {id:p.id, premium, path:'public/assets/spirit-pets-v1/'+(premium?'animated/'+p.id+'-drawn-v2.webp':p.id+'.png')};
});
await fs.mkdir('art-source/spirit-pets-v3/references', {recursive:true});
for(const p of picks){
 const image=await loadImage(p.path);
 const frames=p.premium?slicePremiumPetFrames(image,p.id,createCanvas):slicePetFrames(image,p.id,createCanvas);
 const source=frames[0],canvas=createCanvas(640,640),ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,640,640);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(source,24,24,592,592);
 // Transparent original sprite, not AI artwork; only enlarge for visual inspection.
 const bin=await canvas.encode('png');
 await fs.writeFile('art-source/spirit-pets-v3/references/'+p.id+'-original-reference.b64.txt',Buffer.from(bin).toString('base64'));
 console.log(p.id+': '+source.width+'x'+source.height+' -> 640x640 transparent reference '+bin.length+' bytes');
}
