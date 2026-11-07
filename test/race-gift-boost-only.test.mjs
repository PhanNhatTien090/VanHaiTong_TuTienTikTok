import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startRace} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
function running(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<4;i++)ensurePlayer(w,'p'+i,'Player '+i,N);assert.ok(startRace(w,N).ok);for(let i=0;i<4;i++)action(w,{type:'chat',text:'dua',userId:'p'+i,name:'p'+i},N+1+i);tick(w,N+45000);return w;}
// 07/11/2026: đang đua, quà của tay đua chỉ để bứt tốc — không cộng tu vi; thông báo và giọng chỉ nói bứt tốc.
test('racer gifts during a running race boost only: no qi, boost-only text and voice',()=>{
 const w=running(),r=w.race.racers[0],p=w.players[r.id],qi=p.qi,total=p.totalQi;
 const res=action(w,{type:'gift',userId:p.id,name:p.name,coins:30,count:1,giftName:'Rose',eventId:'race-g1'},N+46000);assert.equal(res.ok,true);
 assert.equal(p.qi,qi);assert.equal(p.totalQi,total);assert.ok(r.giftDist>0);
 const e=w.events.findLast(x=>x.gift);assert.equal(e.raceGift,true);assert.equal(e.reward.qi,0);assert.match(e.text,/BỨT TỐC \+\d+ trượng/);assert.doesNotMatch(e.text,/tu vi/);
 const said=speechPlan(e).map(s=>s.text).join(' ');assert.match(said,/(bứt tốc|tăng tốc|Bứt tốc)/);assert.doesNotMatch(said,/tu vi|phúc duyên/i);
});
test('outside a running race gifts still grant qi as before',()=>{
 const w=createWorld('live');const p=ensurePlayer(w,'a','A',N);const qi=p.qi;action(w,{type:'gift',userId:'a',name:'A',coins:30,count:1,giftName:'Rose',eventId:'g-normal'},N);assert.ok(p.qi>qi);
});
