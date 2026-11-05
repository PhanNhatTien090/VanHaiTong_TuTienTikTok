import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {luyenHuState,drawLuyenHuAwakening,voidSealPoint} from '../public/luyen-hu-awakening.js';
import {sliceSpiritAtlas} from '../public/gift-spirit-beasts.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
const at=t=>luyenHuState(t/20.8);
test('void gates precede serpent, seal formation and fusion; the new outfit follows the release',()=>{
 assert.equal(breakthroughDuration({toRealm:6}),20800);assert.ok(breakthroughDuration({toRealm:7})>20800);
 assert.equal(at(2.2).portal,0);assert.deepEqual(at(5).shards,Array(8).fill(1));
 assert.equal(at(5.2).serpent,0);assert.ok(at(6.6).serpent>.99);assert.equal(at(9.2).ward,0);assert.ok(at(11).ward>.99);
 assert.equal(at(12.6).bind,0);assert.equal(at(16).bind,1);assert.equal(at(17.54).revealed,false);assert.equal(at(17.56).revealed,true);
 assert.equal(at(20.8).fade,0);assert.deepEqual(at(10),at(10));assert.equal(luyenHuState(.5,1600,false).motion,false);
});
test('dragon segments animate while the discarded guardian is never drawn; finite work and immutable profiles',async()=>{
 const dragon=sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),im=await loadImage('public/assets/boss-atlas.png'),guardian=createCanvas(640,640);guardian.getContext('2d').drawImage(im,im.width/3,0,im.width/3,im.height,0,0,640,640);
 const p={id:'a',realm:5},e={id:'x',user:'a',name:'A',start:0,duration:20800,visualFrom:p,visualTo:{...p,realm:6}},before=JSON.stringify(e),seen=[],scene={players:[p],motion:true,cameraEnabled:true,budget:{level:'light'},spiritBeasts:{dragon},hollowGuardian:guardian,drawPlayer:(c,p)=>seen.push(p.realm)},c=createCanvas(900,1600).getContext('2d');
 let draws=0,guardianDraws=0;const original=c.drawImage.bind(c);c.drawImage=(...a)=>{draws++;if(a[0]===guardian)guardianDraws++;return original(...a);};
 for(const sec of [6.6,11.5,14,17.8,20]){draws=0;const s=drawLuyenHuAwakening(scene,c,e,sec*1000,1600);assert.equal(s.realm,6);assert.ok(draws<60);if(sec===11.5)assert.ok(draws>30,'articulated serpent draws in both depth layers');}
 assert.equal(guardianDraws,0);assert.deepEqual(seen,[5,5,5,6,6]);assert.equal(JSON.stringify(e),before);
});

test('gate shards become the eight floor anchors and then converge on the dantian continuously',()=>{
 for(const t of [9.2,11.3,12.6,15.7])for(let i=0;i<8;i++){const a=voidSealPoint(at(t-1e-5),i),b=voidSealPoint(at(t+1e-5),i);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.05);}
 for(let i=0;i<8;i++){const p=voidSealPoint(at(16),i);assert.ok(Math.abs(p.x-450)<20);assert.ok(Math.abs(p.y-(1600*.68-150))<1e-8);}
});
