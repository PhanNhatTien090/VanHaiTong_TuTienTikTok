import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PET_V2_MOTIFS,drawPetV2SkillSignature} from '../public/pet-v2-skill-fx.js';
const draw=(id,k=.55,opts={})=>{
 const surface=createCanvas(320,320),c=surface.getContext('2d');
 assert.equal(drawPetV2SkillSignature(c,id,160,160,140,k,opts),true);
 return surface.getContext('2d').getImageData(0,0,320,320).data;
};
function hash(bytes){let hash=2166136261,coverage=0;for(let i=0;i<bytes.length;i+=4){if(bytes[i+3])coverage++;if(i%44===0)hash=Math.imul(hash^bytes[i]^bytes[i+1]^bytes[i+2]^bytes[i+3],16777619);}return {hash:hash>>>0,coverage};}
test('each of the 13 original animated species has a distinct visible spell motif',()=>{
 const keys=ALL_PETS.map(p=>p.id);
 assert.equal(Object.keys(PET_V2_MOTIFS).length,13);
 assert.equal(new Set(Object.values(PET_V2_MOTIFS)).size,13);
 const signatures=new Set();
 for(const id of keys){
  const sig=hash(draw(id));assert.ok(sig.coverage>50,id);
  signatures.add(sig.hash);
 }
 assert.equal(signatures.size,13);
});
test('skill FX honor low-resource and reduced-motion mode without external art or canvas state leaks',()=>{
 for(const id of ALL_PETS.map(p=>p.id)){
  const a=hash(draw(id,.6,{motion:false,light:true}));
  const b=hash(draw(id,.6,{motion:false,light:true}));
  assert.deepEqual(a,b,id);
 }
 const surface=createCanvas(320,320),c=surface.getContext('2d'),before=c.getTransform().toString();
 assert.equal(drawPetV2SkillSignature(c,'nonexistent',100,100,100,.5),false);
 drawPetV2SkillSignature(c,'jade-rabbit',100,100,100,.5);
 assert.equal(c.getTransform().toString(),before);
});
