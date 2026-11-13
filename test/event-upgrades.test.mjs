import test from 'node:test';
import assert from 'node:assert/strict';
import {tournamentPairs} from '../social-events.mjs';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {eventDonationContext,addEventDonation} from '../public/event-donations.js';
import {duelCastState,DUEL_CAST_MS} from '../public/duel-combat.js';
import {tournamentLobbyTargets} from '../public/social-stage.js';
import {CultivationAudio} from '../public/audio.js';
test('court skin 300; no artifact at 300 or 499; artifact at 500 exactly once',()=>{
 for(const kind of ['nguyet-lien','xich-vu']){
  const r=VISITOR_GIFT_REWARDS[kind],p={id:'p',artifacts:[],rewardSkins:[]};
  const w={visitor:{id:'v',kind,startedAt:100,endsAt:10000}};
  const a=creditVisitorGift(w,p,300,200);assert.ok(p.rewardSkins.includes(r.skin));assert.deepEqual(a.items,[]);assert.ok(!p.artifacts.includes(r.artifact));
  assert.deepEqual(creditVisitorGift(w,p,199,300).items,[]);assert.ok(!p.artifacts.includes(r.artifact));
  assert.deepEqual(creditVisitorGift(w,p,1,400).items,[r.artifact]);assert.equal(p.visitorArtifactUnlocks[r.artifact].coins,500);
  assert.deepEqual(creditVisitorGift(w,p,1,500).items,[]);
 }
});
test('pairing follows cultivation rather than equipment; odd outlier takes bye',()=>{
 const fighters={a:{realm:3,totalQi:1000,power:900},b:{realm:3,totalQi:1010,power:1},c:{realm:9,totalQi:9000000,power:2},d:{realm:9,totalQi:9100000,power:10},z:{realm:20,totalQi:900000000}};
 const pairs=tournamentPairs(['d','a','c','b'],fighters);assert.deepEqual(pairs,[['a','b'],['c','d']]);
 assert.deepEqual(tournamentPairs(['z','d','a','c','b'],fighters),[['a','b'],['c','d'],['z',null]]);
});
test('event gift queues an avatar effect without character presentation; queue bounded',()=>{
 const scene={warStatus:{id:'war',active:true},lastState:{serverNow:1000,players:[]},playerIndex:new Map()};
 for(let i=0;i<30;i++)assert.equal(addEventDonation(scene,{id:'g'+i,gift:'rose',user:'p'+i,name:'P',coins:100,count:1},i*50),true);
 assert.equal(eventDonationContext(scene).kind,'war');assert.ok(scene.eventDonations.pending.length<=6);assert.equal(scene.presentation,undefined);assert.equal(scene.focusUntil,undefined);
});
test('tournament lobby feet stay on floor, fast casts alternate with an ultimate',()=>{
 const targets=tournamentLobbyTargets(Array.from({length:15},(_,i)=>({id:String(i)})),1600);
 assert.ok(targets.every(p=>p.y>=1600*.72&&p.y<=1600*.86));
 assert.equal(duelCastState(650).side,0);assert.equal(duelCastState(650+DUEL_CAST_MS).side,1);assert.equal(duelCastState(650+DUEL_CAST_MS*5).ultimate,true);
});
test('louder music and SFX mix; speech ducking restores both music and stale lease',()=>{
 const a=new CultivationAudio();a.music={volume:0};a.sync();const normal=a.music.volume;
 assert.ok(normal>.4);assert.equal(a.sfx,.85);a.duck(true);assert.ok(a.music.volume>=normal*.5);a.duck(false);assert.equal(a.music.volume,normal);
 a.enabled=true;a.ducked=true;a.duckUntil=1;a.keepAlive();assert.equal(a.ducked,false);
});
