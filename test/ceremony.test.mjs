import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,honorCeremony,tick} from '../engine.mjs';import {announcement} from '../speech.mjs';import {priority} from '../public/voice.js';import {presentationPriority} from '../public/presentation.js';
test('đại điển vinh danh crowns the top 3 present gifters, is announced, and auto-runs on schedule',()=>{
 const w=createWorld('live');let now=1e12;for(const [id,c] of [['a',50],['b',500],['c',120],['d',5]]){action(w,{type:'chat',userId:id,name:'P'+id,text:'nhapmon'},now);action(w,{type:'gift',userId:id,name:'P'+id,coins:c,eventId:'g'+id},now+=10);}
 const r=honorCeremony(w,now+=1000,true);assert.ok(r.ok);assert.deepEqual(r.top.map(x=>x.id),['b','c','a']);assert.deepEqual(r.top.map(x=>x.title),['THÁI THƯỢNG HỘ PHÁP','TẢ HỘ PHÁP','HỮU HỘ PHÁP']);
 const e=w.events.findLast(x=>x.ceremony);assert.equal(presentationPriority(e),6);assert.equal(priority(e),5,'ceremony is a protected event announcement');assert.match(announcement(e),/Thái Thượng Hộ Pháp Pb, Tả Hộ Pháp Pc, Hữu Hộ Pháp Pa/);
 w.nextBossAt=now+1e12;const n=w.events.filter(x=>x.ceremony).length;w.lastCeremonyAt=now-21*60000;for(const id of 'abcd')action(w,{type:'chat',userId:id,name:'P'+id,text:'tuvi'},now);tick(w,now+=1000);
 assert.equal(w.events.filter(x=>x.ceremony).length,n+1,'auto every 20 minutes');
 assert.equal(honorCeremony(createWorld('live'),now).ok,false,'no gifters → nothing');
});
