import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,blessing,tick,requiredQi} from '../engine.mjs';
import {announcement} from '../speech.mjs';

test('Thiên Đạo Ban Phúc breaks through the active players closest to ready',()=>{
  const w=createWorld('live');const now=1e7;
  for(const [id,qi] of [['a',10],['b',310],['c',60],['d',290]]){action(w,{type:'chat',userId:id,name:id.toUpperCase(),text:'nhapmon'},now);w.players[id].qi=qi;}
  w.players.a.lastActive=now-20*60000;
  const r=blessing(w,now,2);assert.equal(r.ok,true);assert.deepEqual(r.players,['B','D']);
  assert.equal(w.players.b.realm,1);assert.equal(w.players.d.realm,1);assert.equal(w.players.c.realm,0);assert.equal(w.players.a.realm,0,'inactive viewers are skipped');
  assert.equal(w.players.b.qi,160,'breakthrough consumes qi instead of duplicating progress');
  const ev=w.events.filter(e=>e.at===now&&['blessing','breakthrough'].includes(e.effect));assert.equal(ev[0].effect,'blessing');assert.equal(ev.filter(e=>e.effect==='breakthrough').length,2);
  assert.match(announcement(ev[0]),/Thiên đạo ban phúc! Hai vị đồng môn được đột phá/);
});
test('blessing needs someone active, and runs on its own schedule',()=>{
  const w=createWorld('live');assert.equal(blessing(w,1e7).ok,false);
  let now=1e7;tick(w,now);action(w,{type:'chat',userId:'x',name:'X',text:'nhapmon'},now);
  w.players.x.qi=requiredQi(w.players.x);now+=30*60000;w.players.x.lastActive=now;w.nextBossAt=now+1e9;tick(w,now);
  assert.equal(w.players.x.realm,1);assert.ok(w.events.some(e=>e.effect==='blessing'));
});
