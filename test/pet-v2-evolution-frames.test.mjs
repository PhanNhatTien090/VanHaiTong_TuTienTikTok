import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS,petArtFrame} from '../public/premium-pet-motion.js';
import {PET_V2_ART_APPROVED,PET_V2_ASSET_MANIFEST} from '../public/pet-v2-art-manifest.js';
import {slicePetEvolutionFrames,petV2FramesFor,slicePetFrames} from '../public/spirit-pet-art.js';
test('all 39 evolved pose atlases load, have the original species frame count and animate',async()=>{
 assert.equal(PET_V2_ART_APPROVED,true);
 assert.equal(PET_V2_ASSET_MANIFEST.length,39);
 let count=0;
 for(const spec of PET_V2_ASSET_MANIFEST){
  const im=await loadImage('public'+spec.path),frames=slicePetEvolutionFrames(im,spec,createCanvas);
  assert.equal(frames.length,spec.frames,spec.id);
  assert.equal(im.width,spec.cols*spec.size,spec.id);
  assert.equal(im.height,spec.rows*spec.size,spec.id);
  assert.equal(frames.period,PREMIUM_PET_PERIODS[spec.id]);
  assert.ok(frames.every(f=>f.width===spec.size&&f.height===spec.size));
  assert.notEqual(petArtFrame(frames,0,0,true),petArtFrame(frames,spec.frames===8?(frames.period||1000)/2:250,0,true));
  count+=frames.length;
 }
 assert.equal(count,192);
});
test('astral dragon original three unequal source columns and evolved three uniform columns both remain intact',async()=>{
 const old=await loadImage('public/assets/spirit-pets-v1/astral-dragon.png');
 const original=slicePetFrames(old,'astral-dragon',createCanvas);
 assert.equal(original.length,3);
 const spec=PET_V2_ASSET_MANIFEST.find(x=>x.id==='astral-dragon'&&x.stage===3);
 const evolved=await loadImage('public'+spec.path),frames=slicePetEvolutionFrames(evolved,spec,createCanvas);
 assert.equal(frames.length,3);
 assert.equal(frames[0].width,160);
 assert.equal(frames[1].width,160);
 const alpha=frames.map(frame=>{
  const pixels=frame.getContext('2d').getImageData(0,0,160,160).data;
  let count=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>48)count++;return count;
 });
 assert.ok(alpha.every(n=>n>300));
});
test('V2 evolved sprites only show when explicitly enabled; unloaded stages fallback to real original animation',()=>{
 const source=[{id:'base-0'},{id:'base-1'},{id:'base-2'}],v2=[{id:'new-0'},{id:'new-1'},{id:'new-2'}];
 const p={spiritPet:'astral-dragon',petView:{stage:2}};
 const scene={petArt:new Map([['astral-dragon',source],['astral-dragon:stage2',v2]]),petV2Settings:{evolutionArt:false}};
 assert.equal(petV2FramesFor(scene,p),source);
 scene.petV2Settings.evolutionArt=true;
 assert.equal(petV2FramesFor(scene,p),v2);
 scene.petArt.delete('astral-dragon:stage2');
 assert.equal(petV2FramesFor(scene,p),source);
});
