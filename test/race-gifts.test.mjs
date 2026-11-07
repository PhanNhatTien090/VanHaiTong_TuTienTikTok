import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,startRace,snapshot,stopRace} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';import {isEventAnnouncement} from '../public/event-announcements.js';
import {raceSwordFor} from '../public/race-sword-skins.js';
const N=1e12;
function setup(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false,ceremony:false});w.nextBossAt=N+1e10;for(const id of ['a','b','c','d','e','f'])action(w,{type:'chat',userId:id,name:'P'+id,text:'nhập môn'},N);startRace(w,N);for(const id of ['a','b'])action(w,{type:'chat',userId:id,text:'bay'},N+1);w.race.repeat=false;return w;}
const gift=(w,id,coins)=>action(w,{type:'gift',userId:id,coins,eventId:'gift-'+id},N+1000);
test('gift top 3 earn permanent cosmetic swords; top 5 earn cultivation once across a restart',()=>{
 let w=setup();for(const [i,id] of ['a','b','c','d','e','f'].entries())gift(w,id,6-i);
 assert.deepEqual(snapshot(w,N+2000).raceStatus.giftTop.map(x=>x.id),['a','b','c','d','e']);
 w=JSON.parse(JSON.stringify(w));tick(w,N+45000);tick(w,N+136000);
 for(const [id,skin] of [['a','race-emperor'],['b','race-moon'],['c','race-frost']]){assert.ok(w.players[id].raceSwordSkins.includes(skin));assert.equal(raceSwordFor(w.players[id]).id,skin);}
 for(const id of ['d','e','f'])assert.equal(w.players[id].raceSwordSkins,undefined);
 const ev=w.events.filter(e=>e.raceGiftRank);assert.equal(ev.length,5);assert.ok(ev.every((e,i)=>e.reward.qi>=[5000,3000,1500,800,500][i]));
 assert.ok(ev.every(isEventAnnouncement));for(const e of ev){const line=speechPlan(e).map(x=>x.text).join(' ');assert.match(line,/thuộc về/);assert.doesNotMatch(line,/coin|undefined/);if(e.raceGiftRank<4)assert.match(line,/skin phi kiếm/);}
 const count=ev.length;tick(w,N+137000);assert.equal(w.events.filter(e=>e.raceGiftRank).length,count);
 assert.ok(action(w,{type:'chat',userId:'a',text:'phi kiếm 1'},N+138000).ok);assert.equal(action(w,{type:'chat',userId:'a',text:'phi kiếm 2'},N+138001).ok,false);
});
test('registration and starting narration explicitly read skin top 3 and cultivation top 5 without prices',()=>{
 const w=setup();tick(w,N+45000);for(const e of w.events.filter(e=>/^VÂN HẢI PHI KIẾM|^Phi kiếm xuất phát/.test(e.text))){const line=speechPlan(e).map(x=>x.text).join(' ');assert.match(line,/Top ba hộ pháp nhận skin phi kiếm/);assert.match(line,/top năm nhận tu vi/);assert.doesNotMatch(line,/coin/);}
});
test('cancelled race never issues final ranking rewards',()=>{const w=setup();gift(w,'a',1);stopRace(w,N+2000);tick(w,N+3000);assert.equal(w.players.a.raceSwordSkins,undefined);assert.equal(w.events.filter(e=>e.raceGiftRank).length,0);});
