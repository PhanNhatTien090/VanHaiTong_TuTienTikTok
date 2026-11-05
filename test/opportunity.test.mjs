import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,startOpportunity,action,ingest,tick} from '../engine.mjs';
const now=1000000;
const gift=(w,coins,at,id)=>action(w,{type:'gift',userId:'a',name:'A',coins,eventId:id},at);
test('10 minute opportunity uses new gifts, consumes tier costs and carries surplus without spending cultivation',()=>{
 const w=createWorld();const p=ensurePlayer(w,'a','A',now-1000);p.giftCoins=999;p.qi=200;p.stones=100;
 startOpportunity(w,now);gift(w,9,now+1,'one');assert.equal(p.realm,0);
 gift(w,2,now+2,'two');assert.equal(p.realm,1);assert.equal(w.opportunity.players.a.spent,10);
 gift(w,100,now+3,'three');assert.equal(p.realm,3);assert.equal(w.opportunity.players.a.received,111);assert.equal(w.opportunity.players.a.spent,100);
 assert.ok(p.qi>=200);assert.ok(p.stones>=100);
 const realm=p.realm;gift(w,100,now+3,'three');assert.equal(p.realm,realm);assert.equal(w.opportunity.players.a.received,111);
 assert.equal(startOpportunity(w,now+4).ok,false);
});
test('expiry is exclusive, ends once, maximum realm is bounded and separate events start fresh',()=>{
 const w=createWorld();startOpportunity(w,now);const end=w.opportunity.endsAt;
 assert.equal(end-now,300000);gift(w,10000,end-1,'one');assert.equal(w.players.a.realm,11,'10.000 coin → Thái Ất (Đại La cần thêm 4.999)');
 gift(w,10000,end,'two');assert.equal(w.opportunity.players.a.received,10000);
 tick(w,end);tick(w,end+1000);assert.equal(w.events.filter(e=>e.opportunityEnd).length,1);
 const restored=JSON.parse(JSON.stringify(w));assert.equal(startOpportunity(restored,end+2000).ok,true);assert.deepEqual(restored.opportunity.players,{});
});
test('TikFinity cumulative gift streak counts delta only and restores across restart',()=>{
 const w=createWorld();startOpportunity(w,now);
 const event=n=>({event:'gift',data:{userId:'a',nickname:'A',diamondCount:5,repeatCount:n,giftType:1,repeatEnd:false,groupId:'g',giftId:1,msgId:'m'+n}});
 ingest(w,event(1),now+1);ingest(w,event(2),now+2);assert.equal(w.players.a.realm,1);
 const restored=JSON.parse(JSON.stringify(w));ingest(restored,event(2),now+3);
 assert.equal(restored.opportunity.players.a.received,10);assert.equal(restored.opportunity.players.a.spent,10);
});
