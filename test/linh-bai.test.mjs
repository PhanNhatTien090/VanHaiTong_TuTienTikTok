import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,profileCard,requiredQi} from '../engine.mjs';
const N=Date.UTC(2026,10,11,3);
function world(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e9;return w;}
test('gõ 9 emits a status event carrying the Linh Bài card',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);
 const r=action(w,{type:'chat',userId:'a',name:'An',text:'9'},N+20000);assert.equal(r.ok,true);
 const e=w.events.findLast(x=>x.user==='a'&&x.effect==='status');assert.ok(e?.card,'status event has card');
 assert.equal(e.card.needQi,requiredQi(w.players.a));assert.equal(e.card.rank,1);assert.ok(e.card.next);
 assert.match(e.card.tip,/Gõ \d/);
});
test('card tip points at the one next step',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);const p=w.players.a;
 p.qi=0;assert.match(profileCard(p,w,N).tip,/Gõ 1 tu luyện/);
 p.qi=requiredQi(p);p.stones=0;assert.match(profileCard(p,w,N).tip,/Gõ 2 hái/);
});
