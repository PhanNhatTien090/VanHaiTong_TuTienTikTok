import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,startRace,startVisitor,startFlowerEvent,giftEventRule} from '../engine.mjs';
const N=1800000000000;
function setup(){const w=createWorld('live');action(w,{type:'join',userId:'a',name:'An'},N);const p=w.players.a;return {w,p};}
const give=(w,coins,id,at)=>action(w,{type:'gift',userId:'a',name:'An',coins,count:1,giftName:'Baglama',eventId:id},at);
test('không có sự kiện: quà mặc định (tu vi, linh thạch, phúc duyên)',()=>{
 const {w,p}=setup();const qi=p.qi,st=p.stones;give(w,200,'g1',N+1000);
 assert.equal(giftEventRule(w,N+1000),null);assert.ok(p.qi>qi&&p.stones>st&&p.buffUntil>N+1000);
});
test('có sự kiện có luật quà (đua, tiên nhân, mưa hoa): chỉ luật sự kiện, không cộng quà mặc định',async()=>{
 for(const start of [w=>startRace(w,N),w=>startVisitor(w,'hanlap',N),w=>startFlowerEvent(w,N,2)]){
  const {w,p}=setup();start(w);const rule=giftEventRule(w,N+1000);assert.ok(rule,'có luật sự kiện');
  const qi=p.qi,st=p.stones,herbs=p.herbs,arts=p.artifacts.length,buff=p.buffUntil||0;give(w,199,'g-'+rule,N+1000);
  const ev=w.events.findLast(e=>e.eventRule);assert.equal(ev?.eventRule,rule);
  assert.equal(p.qi,qi);assert.equal(p.stones,st);assert.equal(p.herbs,herbs);
  assert.ok(!p.artifacts.includes('soul-bell'),'không nhận pháp bảo mốc quà mặc định');
  if(rule!=='mưa hoa')assert.equal(p.buffUntil||0,buff);
  assert.equal(ev.reward.qi,0);assert.doesNotMatch(ev.text,/tu vi/);assert.doesNotMatch(ev.text,/cảm ơn|tâm ý/);
  const {speechPlan}=await import('../speech-lines.mjs');const said=speechPlan(ev).map(x=>x.text).join(' ');assert.doesNotMatch(said,/Đa tạ|tâm ý|cảm ơn/);
 }
});
