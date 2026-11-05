import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,startFlowerEvent,startVisitor,startOpportunity,openBoss,startRace,startTournament,startBondFestival,tick} from '../engine.mjs';
import {stageConflict} from '../stage-lock.mjs';
import {PresentationQueue} from '../public/presentation.js';
const N=1800000000000;
const openers={meteor:w=>startFlowerEvent(w,N,1,'meteor'),visitor:w=>startVisitor(w,'hanlap',N),opportunity:w=>startOpportunity(w,N),boss:w=>openBoss(w,N),race:w=>startRace(w,N),tournament:w=>startTournament(w,N),bond:w=>startBondFestival(w,N)};
test('all seven main activities block each other in both directions; races may only queue',()=>{
 for(const [first,open]of Object.entries(openers))for(const [second,attempt]of Object.entries(openers)){
  const w=createWorld();assert.equal(open(w).ok,true,first);
  const before=stageConflict(w,N),result=attempt(w);
  assert.equal(stageConflict(w,N),before,first+' retains stage against '+second);
  if(result.ok){assert.equal(second,'race');assert.equal(w.race.phase,'queued');}
 }
});
test('meteor awards settle before a new stage, including delayed completion after restart',()=>{
 const w=createWorld();Object.assign(w.settings,{autoEvents:false,residents:false,blessingMinutes:0});w.nextBossAt=N+1e9;
 ensurePlayer(w,'a','A',N);assert.equal(startFlowerEvent(w,N,1,'meteor').ok,true);w.flowerEvent.scores.a=100;
 const closed=N+180000;tick(w,closed);
 assert.equal(w.flowerEvent.closedAt,closed);
 assert.equal(startTournament(w,closed+29999).ok,false);
 const receipt=w.events.find(e=>e.flowerRank);assert.ok(receipt);assert.equal(receipt.skyPresentationUntil,closed+30000);
 assert.equal(startTournament(w,closed+30000).ok,true);
 const queue=new PresentationQueue();queue.push(receipt,closed+29000);
 assert.equal(queue.take(closed+29000),undefined,'late seven-second award animation cannot spill into the next event');
});
