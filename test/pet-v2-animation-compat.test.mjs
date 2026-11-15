import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {slicePetFrames,slicePremiumPetFrames} from '../public/spirit-pet-art.js';
import {petArtFrame,PREMIUM_PET_ATLAS,PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
import {followerTurn,petTurn,FOLLOWER_TURN_MS} from '../public/follower-turn.js';
const source='public/assets/spirit-pets-v1/';
const legacy=ALL_PETS.filter(p=>!(p.id in PREMIUM_PET_PERIODS));
const premium=ALL_PETS.filter(p=>p.id in PREMIUM_PET_PERIODS);
function hashFrame(canvas){const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let h=2166136261;for(let i=0;i<d.length;i+=16){h=Math.imul(h^d[i],16777619);h=Math.imul(h^d[i+3],16777619);}return h>>>0;}
test('pet V2 respects all 13 existing animated species and the asymmetric dragon cut',async()=>{
 assert.equal(ALL_PETS.length,13);
 assert.equal(legacy.length,8);
 assert.equal(premium.length,5);
 for(const p of legacy){
  const path=source+p.id+'.png';assert.ok(fs.existsSync(path),p.id);
  const image=await loadImage(path),frames=slicePetFrames(image,p.id,createCanvas);
  assert.equal(frames.length,3,p.id+' expected three original drawn poses');
  assert.ok(frames.every(f=>f&&f.width===160&&f.height===160),p.id);
  assert.ok(new Set(frames.map(hashFrame)).size>=2,p.id+' is unexpectedly static');
  assert.equal(petArtFrame(frames,0,0,false),frames[0]);
 }
});
test('five premium pets retain 4x2 eight-pose animated webp atlases and original cycles',async()=>{
 assert.deepEqual(PREMIUM_PET_ATLAS,{size:192,columns:4,frames:8,version:'drawn-v2'});
 for(const p of premium){
  const path=source+'animated/'+p.id+'-'+PREMIUM_PET_ATLAS.version+'.webp';
  assert.ok(fs.existsSync(path),p.id);
  const image=await loadImage(path),frames=slicePremiumPetFrames(image,p.id,createCanvas);
  assert.equal(frames.length,8,p.id);
  assert.ok(frames.every(f=>f?.width===192&&f?.height===192),p.id);
  assert.ok(new Set(frames.map(hashFrame)).size>=4,p.id+' appears to reuse static poses');
  assert.equal(frames.period,PREMIUM_PET_PERIODS[p.id]);
  assert.equal(petArtFrame(frames,50,0,false),frames[0]);
  assert.notEqual(petArtFrame(frames,0),petArtFrame(frames,frames.period/2),p.id);
 }
});
// 15/11 (chủ game): linh thú chủ chốt — chu kỳ 10 phút, pháp bảo chỉ ló 1 phút đầu.
test('pet/relic schedule: 10-minute cycle, relic 1-minute cameo, cove override unchanged',()=>{
 assert.equal(FOLLOWER_TURN_MS,600000);
 for(const t of [0,10_000,700_000,1_000_000]){
  assert.equal(followerTurn(t),followerTurn(t+FOLLOWER_TURN_MS));
  assert.equal(petTurn(t,true),true);
  assert.equal(petTurn(t,false),followerTurn(t)==='pet');
 }
});
