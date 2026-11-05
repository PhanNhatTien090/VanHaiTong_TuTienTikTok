import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {tributeProfile,drawGiftTribute} from '../public/gift-tribute.js';
import {presentationDuration} from '../public/presentation.js';
import {Scene} from '../public/scene.js';

test('rose, 100 coin and combos select visible duration from actual total, invalid prices never render',()=>{
 for(const coins of [0,-1,NaN,Infinity])assert.equal(tributeProfile({gift:'Quà',coins}),null);
 for(const coins of [1,10,30,100,199]){
  const e={gift:'Quà',coins};assert.ok(tributeProfile(e).duration>=2200);assert.equal(presentationDuration(e),tributeProfile(e).duration);
 }
 assert.equal(tributeProfile({gift:'Hoa hồng',coins:1,count:100}).min,99);
 assert.ok(tributeProfile({gift:'Quà',coins:100}).swords>=7);
});

test('100 coin received during breakthrough survives in the pending queue and draws when admitted',()=>{
 const old=globalThis.document;globalThis.document={body:{classList:{contains:()=>true,toggle(){}}}};
 try{
  const s=Object.create(Scene.prototype);Object.assign(s,{motion:false,effects:[],budget:{level:'light',config:{effects:2}}});
  s.addEffect({id:'ritual',user:'a',effect:'breakthrough',toRealm:2});
  const gift={id:'one-hundred',user:'b',gift:'Quà',effect:'lotus',coins:100,count:1};s.addEffect(gift);
  assert.equal(s.effects[0].id,'ritual');assert.equal(s.luxuryQueue[0].id,gift.id);
  s.effects=[];s.presentation=null;s.addEffect(s.luxuryQueue.shift());
  assert.equal(s.effects[0].id,gift.id);assert.equal(s.effects[0].duration,5800);assert.equal(s.presentation.kind,'gift');
 }finally{globalThis.document=old;}
});

test('all phases move deterministically with bounded light-mode work and restore canvas state',async()=>{
 const old=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  const scene={motion:true,budget:{level:'light'},tributeRose:await loadImage('public/assets/gift-rose.webp')},canvas=createCanvas(450,800),c=canvas.getContext('2d');
  for(const coins of [1,30,100,199,1000]){
   const e={id:'gift-'+coins,gift:'Quà',coins,start:0},before=JSON.stringify(e);let previous;
   for(const k of [.12,.3,.48,.65,.9]){
    c.setTransform(.5,0,0,.5,0,0);c.clearRect(0,0,900,1600);
    for(const layer of ['back','front'])drawGiftTribute(scene,c,e,k*5800,k,{x:450,y:1040},1600,layer);
    assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');
    const frame=canvas.toBuffer('image/png');if(previous)assert.notDeepEqual(previous,frame);previous=frame;
   }
   assert.equal(JSON.stringify(e),before);
  }
 }finally{globalThis.document=old;}
});
