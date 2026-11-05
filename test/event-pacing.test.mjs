import {test} from 'node:test';import assert from 'node:assert/strict';
import {automaticEventsPaused,configureEventSpacing} from '../event-pacing.mjs';
import {createWorld,tick,startNextCompetition} from '../engine.mjs';
const N=1800000000000,MIN=60000;
test('shared quiet interval survives reload and starts after the occupied stage is released',()=>{
 let w=createWorld();configureEventSpacing(w,true,N);
 assert.equal(automaticEventsPaused(w,N+.5*MIN),true);assert.equal(automaticEventsPaused(w,N+MIN),false);
 w.visitor={endsAt:N+12*MIN};assert.equal(automaticEventsPaused(w,N+11*MIN),true);
 w=JSON.parse(JSON.stringify(w));w.visitor.closedAt=N+12*MIN;
 assert.equal(automaticEventsPaused(w,N+12*MIN),true);assert.equal(automaticEventsPaused(w,N+12.5*MIN),true);assert.equal(automaticEventsPaused(w,N+13*MIN),false);
});
test('automatic competitions wait through quiet time; explicit operator request can start on a free stage',()=>{
 const w=createWorld();configureEventSpacing(w,true,N);w.settings.scheduledCompetitions=true;
 Object.assign(w.settings,{autoEvents:false,residents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e9;
 w.competitionSchedule={nextAt:N,nextKind:'race',intervalMs:20*MIN,cycleVersion:2,cycleIndex:0};
 tick(w,N+MIN);assert.equal(w.race,undefined);
 const r=startNextCompetition(w,N+MIN+1);assert.equal(r.ok,true);assert.equal(w.race.phase,'registration');
 assert.equal(startNextCompetition(w,N+MIN+2).ok,false,'manual request still respects an occupied stage');
});
test('preset staggers initial timers and small quiz/envelope no longer pause big events (4/11: sự kiện nhỏ rải 1–2 phút)',()=>{
 const w=createWorld();w.competitionSchedule={nextAt:N+MIN};configureEventSpacing(w,true,N);
 assert.equal(w.nextBossAt,N+12*MIN);assert.equal(w.nextAutoEventAt,N+35*MIN);
 assert.equal(w.nextQuizAt,N+25*MIN);assert.equal(w.nextEnvelopeAt,N+30*MIN);assert.equal(w.competitionSchedule.nextAt,N+20*MIN);
 w.quiz={endsAt:N+10*MIN};assert.equal(automaticEventsPaused(w,N+9*MIN),false);
 w.quiz.closedAt=N+10*MIN;assert.equal(automaticEventsPaused(w,N+16*MIN),false);
 configureEventSpacing(w,false,N+16*MIN);assert.equal(automaticEventsPaused(w,N+16*MIN),false);
});
