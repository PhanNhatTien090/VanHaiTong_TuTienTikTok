import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor} from '../engine.mjs';
import {announcement} from '../speech.mjs';
test('reaching 200 coin in a Vương Lâm visit emits a transformation event with announcement',()=>{
  const w=createWorld('live');let now=6e7;action(w,{type:'chat',userId:'v',name:'Vy',text:'nhapmon nu'},now);
  assert.equal(startVisitor(w,'vuonglam',now).ok,true);
  action(w,{type:'gift',userId:'v',name:'Vy',coins:200,count:1,eventId:'g100',giftName:'Heart Me'},now+=1000);
  const tr=w.events.find(e=>e.effect==='transform');assert.ok(tr,'transform event');assert.equal(tr.transform,'vuonglam');assert.equal(tr.skinName,'Lý Mộ Uyển');
  assert.equal(w.players.v.skinChoice,'vuonglam-avatar');
  assert.match(announcement({...tr,gender:'nu'}),/Sư tỷ Vy nhận truyền thừa Lý Mộ Uyển! Thanh quang tỏa sáng, biến hình thành Lý Mộ Uyển!/);
  const n=w.events.filter(e=>e.effect==='transform').length;action(w,{type:'gift',userId:'v',name:'Vy',coins:100,count:1,eventId:'g101'},now+=1000);
  assert.equal(w.events.filter(e=>e.effect==='transform').length,n,'only once');
});
