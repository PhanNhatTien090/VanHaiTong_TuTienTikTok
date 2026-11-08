import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,requiredQi,requiredStones} from '../engine.mjs';

test('announces once when a viewer becomes able to break through, again after the next realm',()=>{
  const w=createWorld('live');let now=1e6;
  action(w,{type:'chat',userId:'a',name:'Lan',text:'nhapmon nu'},now);
  const p=w.players.a;p.qi=requiredQi(p)-5;p.stones=requiredStones(p);
  action(w,{type:'chat',userId:'a',name:'Lan',text:'tuluyen'},now+=11000);
  const ready=w.events.filter(e=>e.effect==='ready');assert.equal(ready.length,1);assert.match(ready[0].text,/Đủ tu vi đột phá Luyện Khí/);
  action(w,{type:'chat',userId:'a',name:'Lan',text:'tuluyen'},now+=11000);
  assert.equal(w.events.filter(e=>e.effect==='ready').length,1,'not repeated while still in the same realm');
  action(w,{type:'chat',userId:'a',name:'Lan',text:'dotpha'},now+=1000);assert.equal(p.realm,1);
  p.qi=requiredQi(p);p.stones=requiredStones(p);action(w,{type:'chat',userId:'a',name:'Lan',text:'hai'},now+=1000);
  assert.equal(w.events.filter(e=>e.effect==='ready').length,2);
});

test('tuvi shows progress on stream; failed dotpha explains what is missing, both rate-limited',()=>{
  const w=createWorld('live');let now=1e6;
  action(w,{type:'chat',userId:'b',name:'Minh',text:'nhapmon nam'},now);
  action(w,{type:'chat',userId:'b',name:'Minh',text:'tuvi'},now+=1000);
  const s=w.events.at(-1);assert.equal(s.effect,'status');assert.match(s.text,/^Tu vi 0\/150 • Linh thạch 30\/30 • Phàm nhân • thiếu 150 tu vi · gõ tu luyện$/);
  assert.equal(action(w,{type:'chat',userId:'b',name:'Minh',text:'tuvi'},now+=1000).ok,false);
  const n=w.events.length;action(w,{type:'chat',userId:'b',name:'Minh',text:'dotpha'},now+=20000);
  assert.equal(w.events.length,n+1);assert.equal(w.events.at(-1).effect,'status');
});
