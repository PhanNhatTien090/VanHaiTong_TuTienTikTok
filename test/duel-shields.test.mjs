import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startTournament,snapshot} from '../engine.mjs';

const N=1800000000000;
function duel(){
 const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});
 w.nextBossAt=N+1e9;
 for(const id of ['a','b','viewer'])ensurePlayer(w,id,id,N);
 assert.equal(startTournament(w,N).ok,true);
 for(const id of ['a','b'])assert.equal(action(w,{type:'chat',text:'tythi',userId:id},N+10).ok,true);
 tick(w,N+90001);tick(w,N+94000);
 const m=w.tournament.current;assert.ok(m);
 return {w,m};
}
test('gift super-move breaks a REAL server-side duel magic shield, not fake HP',()=>{
 const {w,m}=duel(),beforeScore=JSON.stringify({boosts:m.boosts,strengths:m.strengths});
 const own=m.guardShields.a.current,enemy=m.guardShields.b.current;
 const gift=action(w,{type:'gift',userId:'a',coins:2000,count:1,eventId:'super-gift-1'},N+94100);
 assert.equal(gift.ok,true);
 const fx=m.giftFx.at(-1).wardEffect;
 assert.equal(fx.kind,'shield-break');assert.ok(fx.amount>0);assert.equal(fx.source,'a');assert.equal(fx.target,'b');
 assert.equal(m.guardShields.b.current,enemy-fx.amount);assert.equal(m.guardShields.a.current,own);
 assert.equal(JSON.stringify({boosts:m.boosts,strengths:m.strengths}),beforeScore);
 assert.equal(m.hp,undefined);assert.equal(m.guardShields.a.max>=own,true);
 assert.equal(snapshot(w,N+94101).socialStatus.tournament.current.guardShields.b.current,m.guardShields.b.current);
});
test('gift heals an actually depleted shield, not nonexistent character HP',()=>{
 const {w,m}=duel();m.guardShields.a.current=Math.round(m.guardShields.a.max*.30);
 const before=m.guardShields.a.current;
 assert.equal(action(w,{type:'gift',userId:'a',coins:2000,count:1,eventId:'super-gift-2'},N+94100).ok,true);
 const fx=m.giftFx.at(-1).wardEffect;
 assert.equal(fx.kind,'shield-heal');assert.ok(fx.amount>0);
 assert.equal(m.guardShields.a.current,before+fx.amount);
 assert.ok(m.guardShields.a.current<=m.guardShields.a.max);
 assert.equal(m.hp,undefined);
});
test('spectators get visible gift events but cannot secretly change duel shield or winner',()=>{
 const {w,m}=duel(),before=JSON.stringify(m.guardShields);
 assert.equal(action(w,{type:'gift',userId:'viewer',coins:2000,count:1,eventId:'spectator-gift'},N+94100).ok,true);
 assert.equal(m.giftFx.at(-1).fighter,false);
 assert.equal(m.giftFx.at(-1).wardEffect,undefined);
 assert.equal(JSON.stringify(m.guardShields),before);
});
test('server hits consume shields once even when ticks arrive late or repeat',()=>{
 const {w,m}=duel(),before=m.guardShields.b.current;
 tick(w,N+101000);const hit=m.guardShields.b.current;assert.ok(hit<before);
 tick(w,N+101000);assert.equal(m.guardShields.b.current,hit);
 tick(w,N+112000);
 assert.ok(m.guardShields.a.current<m.guardShields.a.max);
 assert.ok(m.guardShields.b.current<=hit);
 assert.equal(m.hp,undefined);
});
