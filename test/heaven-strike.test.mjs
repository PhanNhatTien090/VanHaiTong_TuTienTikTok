import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,heavenStrike,snapshot,HEAVEN_STRIKE} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';
import {strikeProfile} from '../public/heaven-strike.js';
const N=Date.parse('2026-11-07T01:00:00+07:00');
function setup(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false});const p=ensurePlayer(w,'a','An',N);p.realm=8;p.qi=1000000;p.totalQi=5000000;p.gender='nam';return {w,p};}

test('heaven strike removes 20% of current qi, stuns 5 minutes and announces a random-sounding tribulation',()=>{
 const {w,p}=setup();p.qi=100000;const r=heavenStrike(w,'a',N); // 20% = 20.000, dưới trần 5% tu vi cần của Chân Tiên (24.766)
 assert.equal(r.ok,true);assert.equal(r.loss,20000);assert.equal(p.qi,80000);assert.equal(p.totalQi,4980000);assert.equal(p.stunUntil,N+HEAVEN_STRIKE.stunMs);
 const e=w.events.at(-1);assert.equal(e.effect,'heavenStrike');assert.equal(e.heavenStrike.loss,20000);
 const lines=speechPlan(e).map(s=>s.text).join(' ');assert.match(lines,/kiếp giáng xuống tông môn/);assert.match(lines,/An/);
});
test('stunned players cannot cultivate, gather, attack or break through; hearts give no qi but gifts still credit',()=>{
 const {w,p}=setup();heavenStrike(w,'a',N);const qi=p.qi;
 for(const type of ['cultivate','gather','attack','breakthrough'])assert.equal(action(w,{userId:'a',type},N+1000).ok,false,type);
 assert.equal(p.qi,qi);const like=action(w,{userId:'a',type:'like',count:10},N+2000);assert.equal(like.ok,true);assert.equal(p.qi,qi);
 assert.equal(action(w,{userId:'a',type:'cultivate'},N+HEAVEN_STRIKE.stunMs+1).ok,true);assert.ok(p.qi>qi);
});
test('strikes are spaced 60 seconds apart and random picks only active, unstunned players',()=>{
 const {w}=setup();assert.equal(heavenStrike(w,'a',N).ok,true);assert.equal(heavenStrike(w,'a',N+30000).ok,false);
 const r=heavenStrike(w,'*',N+61000);assert.equal(r.ok,false); // người duy nhất đang bị choáng
 assert.equal(heavenStrike(w,'nobody',N+62000).ok,false);
});
test('snapshot exposes stun timer and cooldown; every strike gets its own visual variation',()=>{
 const {w}=setup();heavenStrike(w,'a',N);const s=snapshot(w,N+1);assert.equal(s.players.find(p=>p.id==='a').stunUntil,N+HEAVEN_STRIKE.stunMs);assert.equal(s.lastHeavenStrikeAt,N);
 const sigs=new Set([1,2,3,4,5,6,7,8].map(seed=>{const p=strikeProfile(seed*7919);return p.palette.id+p.title+p.bolts.length+p.spin;}));assert.ok(sigs.size>=5);
});
test('07/11: big cultivators lose at most 5% of their current realm requirement, never 20% of a huge pool',async()=>{
 const {requiredQi,heavenStrikeLoss}=await import('../engine.mjs');
 const {w,p}=setup();p.realm=15;p.qi=350000000;p.totalQi=900000000;const need=requiredQi(p);
 const r=heavenStrike(w,'a',N);assert.equal(r.ok,true);assert.equal(r.loss,Math.floor(need*.05));assert.ok(r.loss<70000000/5,'far below the old 70M');
 assert.equal(p.qi,350000000-r.loss);assert.equal(p.totalQi,900000000-r.loss);
 w.settings.heavenStrikeMaxRealmPct=0;assert.equal(heavenStrikeLoss(w,p),Math.floor(p.qi*.2),'0 disables the cap');
 w.settings.heavenStrikeLossPct=.05;assert.equal(heavenStrikeLoss(w,p),Math.floor(p.qi*.05));
});
