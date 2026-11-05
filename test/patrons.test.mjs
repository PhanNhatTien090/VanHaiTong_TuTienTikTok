import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,reconcilePatron,ensurePlayer,currentParticipant,markLiveSession} from '../engine.mjs';
import {PATRON_SKIN,PATRON_SWORD,PATRON_SEAL} from '../public/patrons.js';
const gift=(w,id,coins,at)=>action(w,{type:'gift',userId:id,name:id,coins,eventId:id+':'+at},at);
test('active gift leader receives one permanent set; ties retain leader and replay cannot duplicate awards',()=>{
 const w=createWorld();gift(w,'a',10,1000000);const a=w.players.a;
 assert.equal(w.patronCurrent,'a');assert.deepEqual(a.rewardSkins,[PATRON_SKIN.id]);assert.ok(a.artifacts.includes(PATRON_SWORD));assert.ok(a.artifacts.includes(PATRON_SEAL));
 gift(w,'b',10,1000100);assert.equal(w.patronCurrent,'a');assert.equal(w.players.b.rewardSkins,undefined);
 gift(w,'b',1,1000200);assert.equal(w.patronCurrent,'b');assert.ok(w.players.b.rewardSkins.includes(PATRON_SKIN.id));
 const eventCount=w.events.length;gift(w,'b',1,1000200);assert.equal(w.events.length,eventCount);assert.equal(w.players.b.artifacts.filter(x=>x===PATRON_SWORD).length,1);
 assert.ok(a.rewardSkins.includes(PATRON_SKIN.id));
 const restored=JSON.parse(JSON.stringify(w));reconcilePatron(restored,1000300);assert.equal(restored.players.b.rewardSkins.length,1);
});
test('old profiles and previous live sessions cannot lead or receive new rewards',()=>{
 const w=createWorld();const old=ensurePlayer(w,'old','Old',100);old.giftCoins=100000;w.totalGifts=100000;
 gift(w,'current',1,1000000);assert.equal(w.patronCurrent,'current');assert.equal(old.rewardSkins,undefined);
 assert.equal(currentParticipant(w,old,1000000),false);
 markLiveSession(w,true,1000010);markLiveSession(w,false,1000020);markLiveSession(w,true,1000030);
 assert.equal(currentParticipant(w,w.players.current,1000040),false);
 action(w,{type:'cultivate',userId:'current'},1000050);assert.equal(currentParticipant(w,w.players.current,1000060),true);
});
test('gift receipts record the exact credited reward and exclusive gear cannot be crafted for free',()=>{
 const w=createWorld();gift(w,'a',10,1000000);const p=w.players.a,receipt=p.giftHistory[0];
 assert.equal(receipt.coins,10);assert.equal(receipt.count,1);assert.equal(receipt.reward.qi,70);assert.equal(receipt.reward.stones,20);
 const before=p.stones;assert.equal(action(w,{type:'craft',userId:'a',itemId:PATRON_SWORD},1000100).ok,false);assert.equal(p.stones,before);
 assert.equal(action(w,{type:'chat',userId:'a',text:'skin Thuong Long Ho Phap'},1000200).ok,true);
});
