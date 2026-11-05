import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {spiritGiftProfile,sliceSpiritAtlas,dragonFlightPoint,phoenixFlightPose,drawSpiritGift} from '../public/gift-spirit-beasts.js';
test('large milestones have distinct dragon / phoenix ensembles and articulated paths',()=>{
 assert.equal(spiritGiftProfile(499),null);assert.equal(spiritGiftProfile(500).phoenixes,1);assert.equal(spiritGiftProfile(700).dragons,1);assert.equal(spiritGiftProfile(1000).phoenixes,1);assert.equal(spiritGiftProfile(1500).dragons,2);assert.equal(spiritGiftProfile(2000).phoenixes,1);assert.equal(spiritGiftProfile(3000).phoenixes,2);assert.ok(spiritGiftProfile(10000).scale>spiritGiftProfile(2000).scale);
 const a=dragonFlightPoint(1,450,600,230,1000),b=dragonFlightPoint(1.3,450,600,230,1000);assert.notDeepEqual(a,b);const one=phoenixFlightPose(.4,200,450,600,200),two=phoenixFlightPose(.4,450,450,600,200);assert.notEqual(one.span,two.span);assert.notEqual(one.wingAngle,two.wingAngle);
});
test('segmented dragons, hinged phoenix wings and tails animate in all contexts without mutating rewards',async()=>{
 const art={dragon:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),phoenix:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/phoenix.png'),2,createCanvas)};assert.equal(art.dragon.length,9);assert.equal(art.phoenix.length,6);
 for(const im of [...art.dragon,...art.phoenix]){const d=im.getContext('2d').getImageData(0,0,256,256).data;let clear=0,solid=0;for(let i=3;i<d.length;i+=4){if(d[i]<32)clear++;if(d[i]>200)solid++;}assert.ok(clear>1500&&solid>200);}
 const canvas=createCanvas(450,800),c=canvas.getContext('2d');const player={x:450,y:1050,qi:999,coins:2000},original=JSON.stringify(player);
 for(const mode of ['solo','race','duel'])for(const value of [500,700,1000,1500,2000,3000,10000]){let previous;for(const k of [.2,.4,.65,.88]){c.setTransform(.5,0,0,.5,0,0);c.clearRect(0,0,900,1600);const calls=drawSpiritGift(c,value,k,player,1600,{art,time:k*10000,mode});assert.ok(calls>0&&calls<=46,'max two 16-part dragons and two 7-draw phoenixes');const frame=canvas.toBuffer('image/png');if(previous)assert.notDeepEqual(frame,previous);previous=frame;}
 const frozen=t=>{c.clearRect(0,0,900,1600);drawSpiritGift(c,value,.4,player,1600,{art,time:t,mode,motion:false});return canvas.toBuffer('image/png');};assert.deepEqual(frozen(1000),frozen(8000));}
 assert.equal(JSON.stringify(player),original);
});
