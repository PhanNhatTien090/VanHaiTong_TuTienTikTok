// Headless Canvas runtime comparison with actual 13-species sprite frames.
// Offline diagnostic, never connects to an active LIVE or alters a world save.
import {performance} from 'node:perf_hooks';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
import {slicePetFrames,slicePremiumPetFrames,slicePetEvolutionFrames,drawPet} from '../public/spirit-pet-art.js';
import {petV2AssetSpec} from '../public/pet-v2-art-manifest.js';
const original=new Map(),evolved=new Map();
for(const pet of ALL_PETS){
 const special=Object.hasOwn(PREMIUM_PET_PERIODS,pet.id);
 const source=special?'public/assets/spirit-pets-v1/animated/'+pet.id+'-drawn-v2.webp':'public/assets/spirit-pets-v1/'+pet.id+'.png';
 const img=await loadImage(source),frames=special?slicePremiumPetFrames(img,pet.id,createCanvas):slicePetFrames(img,pet.id,createCanvas);
 original.set(pet.id,frames);
 const spec=petV2AssetSpec(pet.id,3);
 const image=await loadImage('public'+spec.path);
 evolved.set(pet.id+':stage3',slicePetEvolutionFrames(image,spec,createCanvas));
}
function scenario(count,stage){
 const canvas=createCanvas(900,1400),c=canvas.getContext('2d');
 const scene={petArt:new Map([...original,...evolved]),petV2Settings:{evolutionArt:stage===3},
  petArrivals:new Map(),motion:true,heavyCrowd:count>=50,budget:{level:count>20?'light':'medium'}};
 const targets=Array.from({length:count},(_,i)=>{
  const pet=ALL_PETS[i%ALL_PETS.length];
  return {player:{id:'bench-'+i,spiritPet:pet.id,petView:{stage:stage||0}},scale:1.15,x:30+(i%15)*56,y:110+Math.floor(i/15)*170};
 });
 const values=[];
 for(let pass=0;pass<13;pass++){
  const t=pass*76,start=performance.now();c.clearRect(0,0,900,1400);
  for(const target of targets)drawPet(scene,c,target,t);
  if(pass>=3)values.push(performance.now()-start);
 }
 values.sort((a,b)=>a-b);
 return {p50:values[Math.floor(values.length*.5)],p95:values[Math.ceil(values.length*.95)-1],n:count};
}
const rows=[],limit=process.env.PET_V2_PERF_STRICT==='1';
for(const n of [10,20,50,100]){
 const base=scenario(n,0),v2=scenario(n,3);
 const ratio=v2.p95/Math.max(.1,base.p95);
 rows.push({n,baselineP95Ms:+base.p95.toFixed(2),evolvedP95Ms:+v2.p95.toFixed(2),ratio:+ratio.toFixed(2)});
 // Hard regression guard: stage layers must not cause an order-of-magnitude slowdown.
 if(limit&&v2.p95>base.p95*2.5+7)throw Error(n+' players had unacceptable evolved sprite regression: '+ratio.toFixed(2)+'x');
}
console.log(JSON.stringify({kind:'headless-canvas-only',resolution:[900,1400],
 framesPerCase:10,allOriginalAnimated:true,allEvolvedAnimated:true,results:rows},null,2));
