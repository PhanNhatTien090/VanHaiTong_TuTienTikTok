import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ingest,controlPetEvent,action,tick} from '../engine.mjs';
const N=1800000000000;
function world(){const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});Object.assign(w.settings,{autoEvents:false,ceremony:false,blessingMinutes:0});w.nextBossAt=N+1e9;controlPetEvent(w,'start',N);return w;}
test('flat TikFinity and nested count payloads credit the same numeric user, including during XP cooldown',()=>{
 const w=world();ingest(w,{event:'like',data:{userId:'7165871860264240134',nickname:'user8055463954291',likeCount:15}},N+1);
 ingest(w,{event:'like',data:{user:{uniqueId:'user8055463954291',nickname:'user8055463954291'},userId:'7165871860264240134',count:'85'}},N+2);
 assert.equal(Object.keys(w.players).length,1);const p=w.players['7165871860264240134'];assert.equal(p.petProgress.hearts,100);assert.equal(p.spiritPet,'jade-rabbit');assert.equal(p.likeReceipt.total,100);assert.equal(p.likeReceipt.at,N+2);
});
test('missing, zero and invalid packet counts cannot manufacture hearts',()=>{
 const w=world();for(const value of [undefined,0,-1,'bad',1.5]){const r=ingest(w,{event:'like',data:{userId:'a',likeCount:value}},N+1);assert.equal(r.ok,false);}assert.equal(Object.keys(w.players).length,0);
});
test('thu distinguishes no received data from measured progress and preserves final event count',()=>{
 const w=world();action(w,{type:'chat',userId:'a',text:'thu'},N+1);let e=w.events.findLast(e=>e.petStatus);assert.equal(e.missingLikeData,true);assert.equal(e.receivedHearts,0);
 ingest(w,{event:'like',data:{userId:'a',likeCount:45}},N+2);action(w,{type:'chat',userId:'a',text:'thu'},N+10000);e=w.events.findLast(e=>e.petStatus);assert.equal(e.receivedHearts,45);assert.equal(e.missingLikeData,false);
 tick(w,N+900001);action(w,{type:'chat',userId:'a',text:'thu'},N+910000);e=w.events.findLast(e=>e.petStatus);assert.equal(e.receivedHearts,45);assert.match(e.text,/đợt vừa rồi/);
 controlPetEvent(w,'start',N+920000);action(w,{type:'chat',userId:'a',text:'thu'},N+930000);e=w.events.findLast(e=>e.petStatus);assert.equal(e.receivedHearts,0);assert.equal(e.missingLikeData,true);
});
