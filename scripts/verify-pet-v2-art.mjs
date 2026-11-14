// Release gate: node scripts/verify-pet-v2-art.mjs
// --allow-incomplete permits read-only reporting on the unfinished draft branch.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {PET_V2_ASSET_MANIFEST,PET_V2_TOTAL_NEW_POSES} from '../public/pet-v2-art-manifest.js';
const incomplete=process.argv.includes('--allow-incomplete');
const failures=[],status=[];
assert.equal(PET_V2_ASSET_MANIFEST.length,39,'13 species × 3 evolved stages');
assert.equal(PET_V2_TOTAL_NEW_POSES,192,'8 species × 3 × 3 poses plus 5 × 3 × 8');
function diversity(canvas){
 const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
 let x=2166136261,alpha=0,opaque=0;
 for(let i=0;i<d.length;i+=4){if(d[i+3]>48)alpha++;if(d[i+3]>220)opaque++;if(i%80===0)x=Math.imul(x^d[i]^d[i+1]^d[i+2]^d[i+3],16777619);}
 return {signature:x>>>0,alpha,opaque};
}
for(const spec of PET_V2_ASSET_MANIFEST){
 const file='public'+spec.path;
 if(!fs.existsSync(file)){status.push({id:spec.id,stage:spec.stage,ok:false,reason:'missing'});continue;}
 try{
  const im=await loadImage(file),w=spec.cols*spec.size,h=spec.rows*spec.size;
  assert.equal(im.width,w,'unexpected atlas width');
  assert.equal(im.height,h,'unexpected atlas height');
  const fps=[];
  for(let i=0;i<spec.frames;i++){
   const c=createCanvas(spec.size,spec.size),ctx=c.getContext('2d');
   ctx.drawImage(im,(i%spec.cols)*spec.size,Math.floor(i/spec.cols)*spec.size,spec.size,spec.size,0,0,spec.size,spec.size);
   fps.push(diversity(c));
  }
  assert.ok(fps.every(f=>f.alpha>300&&f.opaque>150),'empty/transparent pose');
  assert.ok(new Set(fps.map(f=>f.signature)).size>=spec.frames-1,'poses are identical');
  status.push({id:spec.id,stage:spec.stage,ok:true,frames:spec.frames});
 }catch(err){failures.push(spec.id+'/'+spec.stage+': '+err.message);status.push({id:spec.id,stage:spec.stage,ok:false,reason:err.message});}
}
const ready=status.filter(x=>x.ok),missing=status.filter(x=>!x.ok);
console.log('Pet V2 evolution assets: '+ready.length+'/39 atlases · '+ready.reduce((n,a)=>n+a.frames,0)+'/192 poses');
for(const a of missing.slice(0,50))console.log('  NEED '+a.id+' stage '+a.stage+' · '+a.reason);
for(const message of failures)console.error('  INVALID '+message);
if(!incomplete&&missing.length)process.exitCode=1;
