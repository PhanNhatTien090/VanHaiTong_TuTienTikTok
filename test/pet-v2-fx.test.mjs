import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {petV2EffectDuration,petV2EffectPositions,petV2EffectType,drawPetV2Event} from '../public/pet-v2-fx.js';
import {slicePetFrames,slicePremiumPetFrames} from '../public/spirit-pet-art.js';

const H=1400;
const events=[
 {petV2Evolve:true,petId:'jade-rabbit',petStage:2},
 {petV2Cast:true,petId:'loi-oa',petSkill:'Cửu Thiên Lôi Chấn'},
 {petV2Synergy:true,petId:'ember-fox',petSkill:'Lôi Hỏa Thiên Kiếp'},
 {petV2Feed:true,petId:'jade-rabbit'},
 {petV2Train:true,petId:'jade-rabbit'},
 {petV2Expedition:true,petId:'jade-rabbit'},
 {petV2ExpeditionDone:true,petId:'jade-rabbit'},
 {petV2Reward:true,petId:'jade-rabbit'}
];
const blank=()=>createCanvas(900,H);
test('pet cinema uses bounded event durations and positioning',()=>{
 for(const e of events){
  assert.ok(petV2EffectType(e));
  assert.ok(petV2EffectDuration(e)>=1100&&petV2EffectDuration(e)<=4700);
  assert.ok(petV2EffectPositions(e,H).size<=220);
 }
 assert.equal(petV2EffectDuration({petAward:true}),0);
 assert.equal(petV2EffectType({}),null);
});
test('animated legacy pet skills render original frames, respect reduced motion and avoid mutation',async()=>{
 const art=await loadImage('public/assets/spirit-pets-v1/jade-rabbit.png');
 const frames=slicePetFrames(art,'jade-rabbit',createCanvas);
 const scene={petArt:new Map([['jade-rabbit',frames]]),motion:true,reduceFlash:false,budget:{level:'light'}};
 const e={petV2Evolve:true,petId:'jade-rabbit',petStage:2,start:0,duration:4600};
 const target={x:450,y:900,scale:1.4};
 const initial=JSON.stringify({target,e});
 const render=t=>{
  const can=blank(),c=can.getContext('2d');
  drawPetV2Event(scene,c,e,t,t/e.duration,target,H,'back');
  drawPetV2Event(scene,c,e,t,t/e.duration,target,H,'front');
  return can.toBuffer('image/png');
 };
 assert.notDeepEqual(render(1000),render(2000),'animation should progress');
 scene.motion=false;assert.deepEqual(render(1000),render(1000),'reduced motion deterministic at fixed t');
 assert.equal(JSON.stringify({target,e}),initial);
});
test('premium animation remains eight poses, no substitution with a static replacement',async()=>{
 const art=await loadImage('public/assets/spirit-pets-v1/animated/bach-nguyet-ho-drawn-v2.webp');
 const frames=slicePremiumPetFrames(art,'bach-nguyet-ho',createCanvas);
 assert.equal(frames.length,8);
 const scene={petArt:new Map([['bach-nguyet-ho',frames]]),motion:true,budget:{level:'light'}};
 const e={petV2Cast:true,petId:'bach-nguyet-ho',petSkill:'Cửu Vĩ Mê Thiên',start:0,duration:2600};
 const canv=blank(),c=canv.getContext('2d');
 assert.equal(drawPetV2Event(scene,c,e,1000,1000/2600,{x:400,y:900,scale:1.2},H,'front'),true);
 assert.ok(canv.toBuffer('image/png').length>10000);
});
test('asset-loading failure does not draw another species and does not throw',()=>{
 const scene={petArt:new Map(),motion:true,budget:{level:'light'}};
 const e={petV2Cast:true,petId:'loi-oa',petSkill:'Cửu Thiên Lôi Chấn',start:0,duration:2600};
 const canv=blank();
 assert.equal(drawPetV2Event(scene,canv.getContext('2d'),e,1000,.4,{x:400,y:800},H,'front'),true);
 assert.equal(drawPetV2Event(scene,canv.getContext('2d'),{...e,petId:'nonexistent'},1000,.4,{x:400,y:800},H,'front'),false);
});
