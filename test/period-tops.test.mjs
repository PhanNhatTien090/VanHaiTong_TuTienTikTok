import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot} from '../engine.mjs';
import {periodTopsView,periodWeek,ensurePeriods} from '../period-tops.mjs';
const N=Date.parse('2026-11-07T12:00:00+07:00'); // thứ Bảy
const top=(v,kind,metric)=>v.periods.find(p=>p.kind===kind).tops[metric];

test('week starts on Monday in Vietnam time',()=>{
 assert.equal(periodWeek('2026-11-07'),'2026-11-02');assert.equal(periodWeek('2026-11-09'),'2026-11-09');assert.equal(periodWeek('2026-11-08'),'2026-11-02');
});

test('day and week tops count only what was earned inside the period',()=>{
 const w=createWorld('live');
 const old=ensurePlayer(w,'old','Lão Làng',N-8*86400000);old.totalQi=50000;old.giftCoins=900;old.lastActive=N-8*86400000;
 tick(w,N);
 ensurePlayer(w,'old','Lão Làng',N+1000);old.totalQi+=300;old.giftCoins+=10;
 const a=ensurePlayer(w,'a','An',N+2000);a.totalQi+=1000;a.giftCoins+=1;a.quizSolved=2;a.tournamentMedals=5;(a.rewardSkins??=[]).push('x');
 const v=periodTopsView(w,N+3000);
 assert.deepEqual(top(v,'day','qi').map(r=>[r.id,r.value]),[['a',1000],['old',300]]);
 assert.deepEqual(top(v,'week','coins').map(r=>[r.id,r.value]),[['old',10],['a',1]]);
 assert.equal(top(v,'day','quiz')[0].value,2);assert.equal(top(v,'day','duel')[0].value,5);assert.equal(top(v,'day','skins')[0].value,1);
 assert.equal(snapshot(w,N+3000).periodStats,undefined,'not broadcast to LIVE clients');
});

test('midnight closes yesterday, keeps the week running, and Monday closes the week',()=>{
 const w=createWorld('live');tick(w,N);
 const a=ensurePlayer(w,'a','An',N+1000);a.totalQi+=500;
 const next=N+12*3600000+60000;tick(w,next);
 a.totalQi+=40;
 let v=periodTopsView(w,next+1000);
 assert.equal(top(v,'prevDay','qi')[0].value,500);assert.equal(top(v,'day','qi')[0].value,40);assert.equal(top(v,'week','qi')[0].value,540);
 const monday=Date.parse('2026-11-09T00:00:30+07:00');tick(w,monday);
 v=periodTopsView(w,monday);
 assert.equal(top(v,'prevWeek','qi')[0].value,540);assert.equal(top(v,'week','qi').length,0);
 assert.equal(JSON.parse(JSON.stringify(w)).periodStats.week.key,'2026-11-09');
});

test('likes and quiz answers feed the hearts and quiz counters; NPCs are excluded',()=>{
 const w=createWorld('live');ensurePeriods(w,N);
 const r=action(w,{type:'like',userId:'h',name:'Hoa',count:25},N+1000);assert.ok(r.ok,r.message);
 assert.equal(w.players.h.heartsTotal,25);
 const npc=ensurePlayer(w,'npc','NPC',N);npc.resident=true;npc.totalQi+=99999;
 const v=periodTopsView(w,N+2000);
 assert.equal(top(v,'day','hearts')[0].value,25);assert.ok(!top(v,'day','qi').some(r=>r.id==='npc'));
});
