import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,THIEN_TAI} from '../engine.mjs';
const N=Date.UTC(2026,10,11,5);
function world(){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e9;return w;}
test('Thiên Tài Xuất Thế names today\'s top tu vi gainer after the first delay, then waits',()=>{
 const w=world();
 for(const [id,name] of [['a','An'],['b','Bảo']])action(w,{type:'chat',userId:id,name,text:'nhapmon'},N);
 tick(w,N+1000);w.players.a.totalQi+=5000;w.players.b.totalQi+=2000;
 const t=w.nextThienTaiAt;assert.ok(t>N);tick(w,t+1);
 const e=w.events.findLast(x=>x.achieve?.kind==='genius');assert.ok(e,'announced');
 assert.equal(e.user,'a');assert.ok(e.achieve.value>=5000);assert.match(e.achieve.runners[0],/^2\. Bảo/);
 assert.ok(w.nextThienTaiAt>=t+THIEN_TAI.everyMs);
});
test('nobody is praised below the minimum',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);tick(w,N+1000);
 const t=w.nextThienTaiAt;tick(w,t+1);assert.equal(w.events.some(x=>x.achieve?.kind==='genius'),false);
});
