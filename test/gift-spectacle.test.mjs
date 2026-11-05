import {sliceSpiritAtlas} from '../public/gift-spirit-beasts.js';
import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {GIFT_SPECTACLES,giftSpectacleTier,sliceSpectacleAtlas,drawGiftSpectacle,spectacleShake} from '../public/gift-spectacle.js';import {luxuryTier} from '../public/luxury-fx.js';import {highGiftName} from '../public/high-gift-fx.js';
test('gift value selects exact distinct 500/700/1000/1500/2000 milestones and higher values keep growing',()=>{
 assert.equal(giftSpectacleTier({coins:499}),null);for(const coins of [0,-1,NaN,Infinity])assert.equal(giftSpectacleTier({coins}),null);
 for(let i=0;i<GIFT_SPECTACLES.length;i++){const q=GIFT_SPECTACLES[i];assert.equal(giftSpectacleTier({coins:q.min}).min,q.min);assert.equal(highGiftName({coins:q.min}),q.name);assert.equal(luxuryTier({coins:q.min}).duration,q.duration);if(i){const prev=GIFT_SPECTACLES[i-1];for(const key of ['duration','size','swords','particles','shake'])assert.ok(q[key]>prev[key],key);assert.equal(giftSpectacleTier({coins:q.min-1}).min,prev.min);}}
 assert.equal(giftSpectacleTier({coins:1,count:700}).min,700);
});
test('all PNG tiers have alpha and continuously animate gather, impact and dispersal in both layers with bounded work',async()=>{
 const art={};for(const name of ['formations','impacts']){art[name]=sliceSpectacleAtlas(await loadImage('public/assets/gift-spectacle-v1/'+name+'.png'),createCanvas);for(const f of art[name]){const d=f.getContext('2d').getImageData(0,0,320,320).data;let clear=0,solid=0;for(let i=3;i<d.length;i+=4){if(d[i]===0)clear++;if(d[i]>200)solid++;}assert.ok(clear>10000&&solid>300);}}
 const beasts={dragon:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),phoenix:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/phoenix.png'),2,createCanvas)};
 const canvas=createCanvas(450,800),c=canvas.getContext('2d'),draw=c.drawImage.bind(c);let calls=0;c.drawImage=(...args)=>{calls++;return draw(...args);};
 for(const q of GIFT_SPECTACLES){const e={coins:q.min,count:1,start:0,duration:q.duration,gift:'real'},original=JSON.stringify(e);let previous=null;for(const k of [.12,.25,.36,.50,.69,.90]){c.setTransform(.5,0,0,.5,0,0);c.clearRect(0,0,900,1600);calls=0;for(const layer of ['back','front'])assert.equal(drawGiftSpectacle(c,e,k*q.duration,k,{x:450,y:1050},1600,{art,beasts,layer}),true);assert.ok(calls<70,'bounded PNG draws');const frame=canvas.toBuffer('image/png');if(previous)assert.notDeepEqual(frame,previous,'animation phase must move pixels');previous=frame;}assert.equal(JSON.stringify(e),original);}
});
test('camera impulses occur at impacts, settle, stay bounded and respect reduced motion',()=>{
 for(const q of GIFT_SPECTACLES){const e={coins:q.min,start:0,duration:q.duration};for(const k of [0,.1,.25,.5,.9,1.1])assert.deepEqual(spectacleShake(e,k*q.duration),{x:0,y:0});let moved=false;for(let i=0;i<100;i++){const t=q.duration*.31+i*5,a=spectacleShake(e,t);assert.ok(Math.abs(a.x)<=q.shake&&Math.abs(a.y)<=q.shake);if(a.x)moved=true;assert.deepEqual(spectacleShake(e,t,false),{x:0,y:0});}assert.ok(moved);}
});
