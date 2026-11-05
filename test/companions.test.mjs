import {test} from 'node:test';import assert from 'node:assert/strict';import {createWorld,ensurePlayer,action,tick,snapshot,requiredQi} from '../engine.mjs';
const N=1800000000000;
function world(){const w=createWorld('demo');Object.assign(w.settings,{autoEvents:false,ceremony:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(const [id,name]of [['a','An'],['b','Bình'],['c','Cường'],['d','Dũng'],['e','Em']])ensurePlayer(w,id,name,N);return w;}
const chat=(w,id,text,t=N+1)=>action(w,{type:'chat',userId:id,text},t);
test('mutual cultivation requires reverse invitation, bounded successful actions and rewards once across reload',()=>{
 let w=world();assert.equal(chat(w,'a','cùng tu Bình').ok,true);assert.equal(snapshot(w,N+2).companionStatus.pairs.length,0);assert.equal(chat(w,'b','cungtu An',N+3).ok,true);assert.equal(w.companions.pairs.length,1);
 for(let i=0;i<3;i++)for(const id of ['a','b'])assert.equal(action(w,{type:'cultivate',userId:id},N+1000+i*11000).ok,true);
 assert.equal(w.players.a.companionPoints,1);assert.equal(w.players.b.companionPoints,1);assert.equal(w.events.filter(e=>e.togetherDone).length,1);w=JSON.parse(JSON.stringify(w));tick(w,N+40000);assert.equal(w.players.a.companionPoints,1);assert.equal(chat(w,'a','cungtu Bình',N+41000).ok,false);
});
test('self, ambiguous name, NPC, expired and cancelled sessions never pay; likes are optional',()=>{
 const w=world();assert.equal(chat(w,'a','cungtu An').ok,false);w.players.c.name='Bình';assert.equal(chat(w,'a','cungtu Bình',N+10000).ok,false);w.players.c.name='Cường';chat(w,'a','cungtu Bình',N+20000);tick(w,N+81000);chat(w,'b','cungtu An',N+82000);assert.equal(w.companions.pairs.length,0);chat(w,'a','cungtu Bình',N+83000);assert.equal(w.companions.pairs.length,1);chat(w,'a','cungtu huy',N+84000);assert.equal(w.players.a.companionPoints,undefined);
 w.players.c.puppet=true;assert.equal(chat(w,'c','giup An',N+90000).ok,false);
});
test('three distinct guardians assist an eligible target, no duplicate payouts, and final gate stays enforced',()=>{
 let w=world(),p=w.players.a;Object.assign(p,{qi:requiredQi(p),stones:10000});
 for(const id of ['b','c','d'])assert.equal(chat(w,id,'giúp An').ok,true);assert.equal(chat(w,'e','giup An').ok,false);assert.equal(chat(w,'b','giup An',N+10000).ok,false);
 assert.equal(action(w,{type:'breakthrough',userId:'a'},N+11000).ok,true);assert.equal(p.realm,1);assert.equal(p.companionPoints,1);for(const id of ['b','c','d'])assert.equal(w.players[id].companionPoints,1);assert.equal(w.events.findLast(e=>e.effect==='breakthrough').guardHelpers.length,3);
 w=JSON.parse(JSON.stringify(w));tick(w,N+12000);assert.equal(w.players.b.companionPoints,1);Object.assign(w.players.a,{realm:12,giftCoins:0,qi:1e9});assert.equal(chat(w,'e','giup An',N+20000).ok,false);assert.equal(action(w,{type:'breakthrough',userId:'a'},N+21000).ok,false);
});
test('normal solo breakthrough works; expired guardians do not receive rewards',()=>{
 const w=world(),p=w.players.a;Object.assign(p,{qi:requiredQi(p)*5,stones:5000});chat(w,'b','giup An');tick(w,N+120002);action(w,{type:'breakthrough',userId:'a'},N+120003);assert.equal(p.realm,1);assert.equal(w.players.b.companionPoints,undefined);
});
