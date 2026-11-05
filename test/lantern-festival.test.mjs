import {test} from 'node:test';import assert from 'node:assert/strict';import {createWorld,ensurePlayer,action,tick,controlLanternEvent,snapshot} from '../engine.mjs';
const N=1800000000000;
function world(){const w=createWorld('demo');Object.assign(w.settings,{autoEvents:false,ceremony:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(const id of ['a','b','c','d'])ensurePlayer(w,id,id,N);controlLanternEvent(w,'start',N);return w;}
const chat=(w,id,text,t=N+1)=>action(w,{type:'chat',userId:id,text},t);
function complete(w,a,b,base=N){for(let i=0;i<3;i++)for(const id of [a,b])action(w,{type:'cultivate',userId:id},base+1000+i*11000);chat(w,a,'cungtu a',base+25000);chat(w,b,'cungtu b',base+26000);}
test('opt-in queue pairs two real active viewers; independent answers plus cultivation light one lantern',()=>{
 let w=world();chat(w,'a','cungtu');tick(w,N+2);assert.equal(w.companions?.pairs.length||0,0);chat(w,'b','cungtu');tick(w,N+3);const p=w.companions.pairs[0];assert.ok(p.festivalId);assert.equal(p.a,'a');assert.equal(p.b,'b');complete(w,'a','b');assert.equal(w.lanternFestival.lanterns.length,1);assert.equal(w.players.a.companionPoints,3);assert.equal(w.players.b.lanternTitle,'Bạn Đèn Đồng Môn');assert.equal(w.events.filter(e=>e.lanternLit).length,1);
 w=JSON.parse(JSON.stringify(w));tick(w,N+30000);chat(w,'a','cungtu',N+40000);assert.equal(w.lanternFestival.queue.length,0);assert.equal(w.players.a.companionPoints,3);
});
test('cultivation alone cannot finish festival pair, and closing/expired events never award late',()=>{
 const w=world();chat(w,'a','cungtu b');chat(w,'b','cungtu a',N+2);for(let i=0;i<3;i++)for(const id of ['a','b'])action(w,{type:'cultivate',userId:id},N+1000+i*11000);assert.equal(w.lanternFestival.lanterns.length,0);assert.equal(w.players.a.companionPoints,undefined);controlLanternEvent(w,'stop',N+24000);chat(w,'a','cungtu a',N+25000);assert.equal(w.lanternFestival.lanterns.length,0);assert.equal(snapshot(w,N+25000).lanternFestival.active,false);
});
test('queue cancellation, inactivity and NPC exclusion are respected',()=>{
 const w=world();chat(w,'a','cungtu');chat(w,'a','cungtu huy',N+2);assert.equal(w.lanternFestival.queue.length,0);w.players.c.puppet=true;assert.equal(chat(w,'c','cungtu').ok,false);chat(w,'a','cungtu',N+10000);tick(w,N+320000);assert.equal(w.lanternFestival.queue.length,0);
});
test('two different pairs trigger one community celebration and preserve score after restart',()=>{
 let w=world();for(const id of ['a','b','c','d'])chat(w,id,'cungtu');tick(w,N+2);tick(w,N+3);complete(w,'a','b');complete(w,'c','d');assert.equal(w.lanternFestival.lanterns.length,2);assert.equal(w.events.filter(e=>e.lanternBloom).length,1);w=JSON.parse(JSON.stringify(w));tick(w,N+30000);assert.equal(w.events.filter(e=>e.lanternBloom).length,1);
});
