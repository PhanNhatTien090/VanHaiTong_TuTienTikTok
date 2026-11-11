import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action} from '../engine.mjs';
const N=Date.UTC(2026,10,11,8);
function world(){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e12;return w;}
const card=(w,id)=>w.events.findLast(e=>e.user===id&&e.card)?.card;
test('túi đồ / skin / thú show read-only cards',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);const p=w.players.a;
 p.artifacts=['phoenix-blade'];p.equipped='phoenix-blade';p.pills={};const before=JSON.stringify(p);
 action(w,{type:'chat',userId:'a',name:'An',text:'túi đồ'},N+20000);
 let c=card(w,'a');assert.equal(c.kind,'bag');assert.equal(c.artifacts.items[0].on,true);
 action(w,{type:'chat',userId:'a',name:'An',text:'skin'},N+40000);c=card(w,'a');assert.equal(c.kind,'skins');assert.equal(c.current,'Áo cảnh giới');
 action(w,{type:'chat',userId:'a',name:'An',text:'thú'},N+60000);c=card(w,'a');assert.equal(c.kind,'pets');
 const after=JSON.parse(JSON.stringify(p));for(const k of ['artifacts','equipped','skinChoice','spiritPet','stones'])assert.deepEqual(after[k],JSON.parse(before)[k],k);
});
test('skin with a name still changes outfit (not intercepted)',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);
 const r=action(w,{type:'chat',userId:'a',name:'An',text:'skin xich phuong'},N+20000);assert.equal(r.ok,false);assert.match(r.message,/Chưa sở hữu/);
});
