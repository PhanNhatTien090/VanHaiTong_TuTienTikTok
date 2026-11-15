// Linh Thú 3.0: verify REAL new-body sprite atlases, not V2 composited sprites.
// Usage: node scripts/verify-pet-v3-art.mjs [--allow-incomplete]
// Release approval is additionally MANUAL; these checks alone cannot prove anatomy.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
import {PET_V3_ASSETS,PET_V3_TOTAL_POSES} from '../public/pet-v3-art-spec.js';
const allowIncomplete=process.argv.includes('--allow-incomplete');
const approvals=JSON.parse(fs.readFileSync('art-source/spirit-pets-v3/qa-approvals.json','utf8'));
const report={expectedAtlases:39,expectedFrames:192,presentAtlases:0,validatedFrames:0,approvedAtlases:0,failures:[],missing:[],warnings:[]};
if(PET_V3_ASSETS.length!==39||PET_V3_TOTAL_POSES!==192)throw Error('Wrong V3 sprite contract');
const ground=(id)=>'public/assets/spirit-pets-v1/'+(id in PREMIUM_PET_PERIODS?'animated/'+id+'-drawn-v2.webp':id+'.png');
const names=new Set();
function extract(image,cols,rows,size){
 const frames=[];for(let i=0;i<cols*rows;i++){
  const c=createCanvas(size,size);
  c.getContext('2d').drawImage(image,(i%cols)*size,Math.floor(i/cols)*size,size,size,0,0,size,size);
  frames.push(c);
 }return frames;
}
function alphaMask(frame){
 const w=frame.width,h=frame.height,d=frame.getContext('2d').getImageData(0,0,w,h).data;
 let left=w,right=0,top=h,bottom=0,coverage=0,cornerOpaque=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   if(d[(y*w+x)*4+3]>96){
    coverage++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    if((x<8||x>w-9)&&(y<8||y>h-9))cornerOpaque++;
   }
 }
 if(coverage===0)return {mask:null,coverage,cornerOpaque};
 const boxW=Math.max(1,right-left+1),boxH=Math.max(1,bottom-top+1);
 const scaled=createCanvas(64,64),ctx=scaled.getContext('2d');
 const scale=Math.min(58/boxW,58/boxH),ww=boxW*scale,hh=boxH*scale;
 ctx.drawImage(frame,left,top,boxW,boxH,(64-ww)/2,(64-hh)/2,ww,hh);
 const pix=ctx.getImageData(0,0,64,64).data;
 const mask=Uint8Array.from({length:64*64},(_,i)=>pix[i*4+3]>100?1:0);
 return {mask,coverage,cornerOpaque};
}
function iou(a,b){
 if(!a||!b)return 0;
 let intersection=0,union=0;
 for(let i=0;i<a.length;i++){if(a[i]&&b[i])intersection++;if(a[i]||b[i])union++;}
 return union?intersection/union:0;
}
const originals=new Map();
for(const pet of ALL_PETS){
 const file=ground(pet.id);
 if(!fs.existsSync(file)){report.failures.push('missing ORIGINAL: '+pet.id);continue;}
 const image=await loadImage(file);
 const col=pet.id==='astral-dragon'?[0,.292,.668,1]:[0,1/3,2/3,1];
 let first;
 if(pet.id in PREMIUM_PET_PERIODS){
  first=extract(image,4,2,192)[0];
 }else{
  first=createCanvas(160,160);
  first.getContext('2d').drawImage(image,Math.round(image.width*col[0]),0,Math.round(image.width*(col[1]-col[0])),image.height,0,0,160,160);
 }
 originals.set(pet.id,alphaMask(first).mask);
}
for(const spec of PET_V3_ASSETS){
 const key=spec.id+':'+spec.stage,file='public'+spec.path;
 if(names.has(key)){report.failures.push('Duplicate '+key);continue;}names.add(key);
 if(!fs.existsSync(file)){report.missing.push(key);continue;}
 try{
  const image=await loadImage(file);
  if(image.width!==spec.cols*spec.cellSize||image.height!==spec.rows*spec.cellSize)
   throw Error('atlas size '+image.width+'x'+image.height+' does not match '+spec.cols*spec.cellSize+'x'+spec.rows*spec.cellSize);
  const frames=extract(image,spec.cols,spec.rows,spec.cellSize);
  if(frames.length!==spec.frames)throw Error('wrong frame count');
  const masks=frames.map(alphaMask);
  if(masks.some(x=>x.coverage<spec.cellSize*spec.cellSize*.025))throw Error('empty or almost blank pose');
  if(masks.some(x=>x.cornerOpaque>120))throw Error('opaque corners/background');
  const signatures=frames.map(frame=>{
   const d=frame.getContext('2d').getImageData(0,0,frame.width,frame.height).data;
   return crypto.createHash('sha256').update(Buffer.from(d)).digest('hex');
  });
  if(new Set(signatures).size!==spec.frames)throw Error('duplicate frames / fake animation');
  // Visual delta threshold is a filter only, not proof of a new body.
  for(let i=1;i<masks.length;i++)if(iou(masks[i-1].mask,masks[i].mask)>.999)
    report.warnings.push(key+' frame '+i+': almost identical silhouette; check animation by eye');
  const compared=iou(originals.get(spec.id),masks[0].mask);
  if(compared>.91)throw Error('body outline too similar to original (IoU '+compared.toFixed(3)+')');
  const previous=spec.stage>1?'public'+spec.path.replace('stage-'+spec.stage,'stage-'+(spec.stage-1)):null;
  if(previous&&fs.existsSync(previous)){
   const prior=await loadImage(previous);
   const priorMask=alphaMask(extract(prior,spec.cols,spec.rows,spec.cellSize)[0]).mask;
   const sim=iou(priorMask,masks[0].mask);
   if(sim>.93)throw Error('body outline too similar to previous evolution ('+sim.toFixed(3)+')');
  }
  const bytes=fs.readFileSync(file),sha=crypto.createHash('sha256').update(bytes).digest('hex');
  const approval=approvals.approvedStages?.[key];
  if(approval?.sha256===sha&&approval?.reviewer&&approval?.anatomyConfirmed===true&&approval?.animationConfirmed===true){
   report.approvedAtlases++;
  }else{
   report.warnings.push(key+': requires distinct anatomy and animation human signoff with matching sha256');
  }
  report.presentAtlases++;report.validatedFrames+=frames.length;
 }catch(err){report.failures.push(key+': '+err.message);}
}
console.log('TRUE-FORM V3: '+report.presentAtlases+'/39 atlases present, '+report.validatedFrames+'/192 frames checked, '+report.approvedAtlases+'/39 artist-approved');
if(report.missing.length)console.log('Missing: '+report.missing.join(', '));
if(report.warnings.length)console.log('Warnings:\n- '+report.warnings.join('\n- '));
if(report.failures.length)console.error('Invalid:\n- '+report.failures.join('\n- '));
const ready=report.presentAtlases===39&&report.validatedFrames===192&&report.approvedAtlases===39&&!report.failures.length;
if(!ready&&!allowIncomplete)process.exitCode=1;
if(report.failures.length)process.exitCode=1;
