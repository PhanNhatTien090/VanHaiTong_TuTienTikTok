import {test} from 'node:test';import assert from 'node:assert/strict';import {createWorld,ensurePlayer,action,startRace,tick,snapshot} from '../engine.mjs';import {raceStageIds} from '../sword-race.mjs';
const N=1800000000000;
test('200 entrants exceed former 128 registration and 8 simulation caps; everyone races and earns once',()=>{
 let w=createWorld('demo');Object.assign(w.settings,{autoEvents:false,blessingMinutes:0,ceremony:false});w.nextBossAt=N+1e9;startRace(w,N);
 for(let i=0;i<200;i++){ensurePlayer(w,'p'+i,'Player '+i,N);assert.equal(action(w,{type:'chat',text:'bay',userId:'p'+i},N+1+i).ok,true);}assert.equal(w.race.entries.length,200);tick(w,N+45000);assert.equal(w.race.racers.length,200);assert.equal(w.race.waiting.length,0);assert.equal(snapshot(w,N+45000).raceStage.length,8);
 action(w,{type:'gift',coins:150,userId:'p199',eventId:'late-lane-gift'},N+46000);assert.equal(w.race.racers.find(r=>r.id==='p199').giftDist,4500);assert.ok(raceStageIds(w,N+46000).includes('p199'));
 const seen=new Set();for(let i=0;i<45;i++)for(const id of raceStageIds(w,N+45000+i*6000))seen.add(id);assert.equal(seen.size,200,'camera eventually visits everyone');
 w=JSON.parse(JSON.stringify(w));tick(w,N+135001);assert.equal(w.race.results.length,200);assert.equal(w.race.results[0].id,'p199');assert.equal(Object.values(w.players).filter(p=>p.raceMedals>0).length,200);const before=w.players.p199.raceMedals;tick(w,N+135002);assert.equal(w.players.p199.raceMedals,before);
});
