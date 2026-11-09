import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,setEventSettings,RANDOM_EVENTS} from '../engine.mjs';
test('random mode picks varied events, never repeats the last one, and never overlaps',()=>{
 const w=createWorld('live');let now=1e7;for(const id of ['a','b','c','d'])action(w,{type:'chat',userId:id,name:id,text:'nhapmon'},now);
 assert.ok(setEventSettings(w,{autoRandom:true,autoEventMinutes:5}).ok);assert.equal(w.settings.autoRandom,true);
 const seen=[];w.nextAutoEventAt=now;w.nextBossAt=now+1e12;
 for(let i=0;i<40;i++){for(const id of ['a','b','c','d'])action(w,{type:'chat',userId:id,name:id,text:'tuvi'},now);const before=w.lastRandomEvent;tick(w,now);if(w.lastRandomEvent!==before||i===0&&w.lastRandomEvent){if(seen.length)assert.notEqual(w.lastRandomEvent,seen.at(-1));seen.push(w.lastRandomEvent);}
  now+=20*60000;w.nextAutoEventAt=Math.min(w.nextAutoEventAt,now);if(w.boss)w.boss=null;}
 assert.ok(new Set(seen).size>=5,'varied: '+seen.join(','));assert.equal(RANDOM_EVENTS.length,12,'10 sự kiện cũ + Chính Ma Đại Chiến + Khai Lò');
});
test('shuffle-bag: every 10 successful picks cover all 10 events (bond, race, tournament included)',()=>{
 const w=createWorld('live');let now=1e7;for(const id of ['a','b','c','d'])action(w,{type:'chat',userId:id,name:id,text:'nhapmon'},now);
 setEventSettings(w,{autoRandom:true,autoEventMinutes:5});w.settings.visitorRotation=false; /* 09/11: khi bật luân phiên, khách mời có lịch 10 phút riêng */w.nextBossAt=now+1e12;const picks=[];
 for(let i=0;i<60&&picks.length<10;i++){for(const id of ['a','b','c','d'])action(w,{type:'chat',userId:id,name:id,text:'tuvi'},now);w.nextAutoEventAt=now;const before=w.randomBag?.length;const last=w.lastRandomEvent;tick(w,now);
  if(w.lastRandomEvent&&(w.lastRandomEvent!==last||w.randomBag?.length!==before))picks.push(w.lastRandomEvent);now+=20*60000;if(w.boss)w.boss=null;}
 assert.equal(new Set(picks).size,10,'picks: '+picks.join(','));for(const id of ['bond','race','tournament'])assert.ok(picks.includes(id),id);
});
