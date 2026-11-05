import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,tickCompetitionSchedule,tick,startNextCompetition} from '../engine.mjs';
const N=1800000000000,M=15*60000;
const world=()=>{const w=createWorld('live');w.settings.scheduledCompetitions=true;return w;};
test('two races then one tournament repeat every fifteen minutes and persist over reload',()=>{
 let w=world();tickCompetitionSchedule(w,N);
 assert.equal(w.competitionSchedule.nextAt,N+M);
 tickCompetitionSchedule(w,N+M-1);assert.equal(w.race,undefined);
 for(const [i,kind] of ['race','race','tournament','race','race','tournament'].entries()){
  tickCompetitionSchedule(w,N+(i+1)*M);
  assert.equal(w.competitionSchedule.lastKind,kind);
  assert.equal(w[kind].phase,'registration');
  if(kind==='race')assert.equal(w.race.repeat,false);
  w[kind].phase='finished';w[kind].podiumUntil=0;
  w=JSON.parse(JSON.stringify(w));
 }
 tickCompetitionSchedule(w,N+20*M);
 assert.equal(w.competitionSchedule.nextAt,N+21*M);
 const id=w.race.id;tickCompetitionSchedule(w,N+20*M+1);assert.equal(w.race.id,id);
});
test('old schedule migrates to race-first without altering its deadline or current tournament',()=>{
 const w=world();w.competitionSchedule={nextAt:N+M,nextKind:'tournament'};
 w.tournament={id:'existing',phase:'registration',registrationEndsAt:N+M+60000};
 tickCompetitionSchedule(w,N);
 assert.equal(w.competitionSchedule.nextAt,N+M);assert.equal(w.competitionSchedule.nextKind,'race');
 assert.equal(w.tournament.id,'existing');tickCompetitionSchedule(w,N+M);
 assert.equal(w.race,undefined);assert.equal(w.competitionSchedule.cycleIndex,0);
});
test('busy event postpones the slot without changing its kind, and repeating races finish only once',()=>{
 const w=world();tickCompetitionSchedule(w,N);
 w.visitor={endsAt:N+M+60000};tickCompetitionSchedule(w,N+M);
 assert.equal(w.race,undefined);assert.equal(w.competitionSchedule.nextKind,'race');
 tickCompetitionSchedule(w,N+M+60001);assert.equal(w.race.phase,'registration');
 w.race={phase:'running',repeat:true};tickCompetitionSchedule(w,N+M+60002);
 assert.equal(w.race.repeat,false);
});
test('scheduler is opt-in and its due slot wins before automatic bosses',()=>{
 const off=createWorld();tickCompetitionSchedule(off,N);assert.equal(off.competitionSchedule,undefined);
 const w=world();w.settings.autoEvents=false;w.settings.residents=false;w.nextBossAt=N-1;
 w.competitionSchedule={nextAt:N,nextKind:'tournament',intervalMs:M};tick(w,N);
 assert.equal(w.race.phase,'registration');assert.equal(w.boss,null);
});

test('opening the next slot early advances the cycle and resets the fifteen-minute deadline only once',()=>{
 const w=world();tickCompetitionSchedule(w,N);
 const r=startNextCompetition(w,N+1000);assert.equal(r.ok,true);assert.equal(r.kind,'race');
 assert.equal(w.competitionSchedule.cycleIndex,1);assert.equal(w.competitionSchedule.nextAt,N+1000+M);
 const deadline=w.competitionSchedule.nextAt;assert.equal(startNextCompetition(w,N+1001).ok,false);
 assert.equal(w.competitionSchedule.nextAt,deadline);
});
