import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,tick,openBoss,startFlowerEvent,startOpportunity,eventBusyUntil} from '../engine.mjs';
test('events and boss fights never overlap',()=>{
  const w=createWorld('live');let now=5e7;w.settings.blessingMinutes=0;w.settings.autoEvents=false;
  for(const id of ['a','b'])action(w,{type:'chat',userId:id,name:id,text:'nhapmon'},now);
  // đang có sự kiện → quái không mở, kể cả tới giờ; bấm tay cũng bị từ chối
  assert.equal(startFlowerEvent(w,now,3).ok,true);w.nextBossAt=now+1000;
  tick(w,now+=5000);assert.equal(w.boss,null,'no boss during event');
  assert.equal(openBoss(w,now).ok,false);
  assert.ok(w.nextBossAt>=w.flowerEvent.endsAt+60000,'boss postponed to 1 min after the event');
  // hết sự kiện + 1 phút → quái mở
  now=w.flowerEvent.endsAt+1;tick(w,now);assert.equal(w.boss,null,'60 s breather');
  for(const p of Object.values(w.players))p.lastActive=now+60000;
  tick(w,now+=91000);assert.ok(w.boss,'boss opens after the breather');
  // đang đánh quái → không mở được sự kiện nào
  assert.equal(startFlowerEvent(w,now,3,'meteor').ok,false);assert.equal(startOpportunity(w,now).ok,false);
  assert.equal(eventBusyUntil(w,now),0);
});
