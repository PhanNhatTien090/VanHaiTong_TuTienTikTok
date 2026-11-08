import test from 'node:test';
import assert from 'node:assert/strict';
import {VoiceQueue} from '../public/voice.js';
import {RenderBudget} from '../public/performance.js';
import {drawDivineHalo} from '../public/divine-wardrobe.js';
const tick=()=>new Promise(r=>setImmediate(r));
const audio={enabled:true,duck(){}};
test('blocked synthesis starts same-voice prerecorded response by deadline, never replays late result',async()=>{
 const original=globalThis.fetch;let complete;globalThis.fetch=()=>new Promise(r=>complete=r);
 const q=new VoiceQueue({world:'live',audio}),played=[];q.prepareWaitMs=15;q.play=async(url,e)=>played.push({url,e});
 try{q.add({id:'late',user:'viewer',effect:'qi'});await new Promise(r=>setTimeout(r,35));assert.equal(played.length,1);assert.equal(played[0].url,'/assets/voice-fast-v1/qi.mp3');assert.equal(played[0].e.voiceFallback,true);complete({ok:true,blob:async()=>new Blob(['late'])});await tick();assert.equal(played.length,1);assert.equal(q.running,false);}finally{q.stop();globalThis.fetch=original;}
});
test('important event interrupts pending routine synthesis before audio exists',async()=>{
 const original=globalThis.fetch;globalThis.fetch=()=>new Promise(()=>{});const played=[],q=new VoiceQueue({world:'live',audio});q.prepareWaitMs=15;q.play=async(url,e)=>played.push(e.id);
 try{q.add({id:'ordinary',effect:'qi',user:'a'});q.add({id:'gift',effect:'petal',gift:'Hoa',coins:1,user:'b'});await new Promise(r=>setTimeout(r,90)); /* 08/11: quà thử mảnh ghép trước (thêm ≤15 ms) */assert.deepEqual(played,['gift']);}finally{q.stop();globalThis.fetch=original;}
});
test('crowd quality remains light under sustained fast frames and restores requested quality on exit',()=>{
 const b=new RenderBudget('high');assert.equal(b.setCrowded(true),true);assert.equal(b.level,'light');for(let i=0;i<100;i++)b.sample(2,100000+i*100,30);assert.equal(b.level,'light');assert.equal(b.setCrowded(false),true);assert.equal(b.level,'high');
 const untouched=new Proxy({},{get(){assert.fail('crowded halo must not load art or draw');}});drawDivineHalo({crowded:true},untouched,untouched,1000);
});
test('heavy crowd reduces pixels and animation further, then restores each intermediate tier',()=>{
 const b=new RenderBudget('high');b.setCrowded(true,false);assert.equal(b.config.width,1080);b.setCrowded(true,true);assert.equal(b.config.width,1080);assert.equal(b.config.fps,24);assert.equal(b.config.poseFps,5);b.set('balanced');assert.equal(b.config.width,1080);b.setCrowded(true,false);assert.equal(b.config.width,1080);b.setCrowded(false);assert.equal(b.level,'balanced');assert.equal(b.config.width,1080);
});
