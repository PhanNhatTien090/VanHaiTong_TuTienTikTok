import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,startTower,snapshot} from '../engine.mjs';
import {TOWER,guardianOf,passiveDps} from '../tower.mjs';
const N=Date.UTC(2026,10,11,6);
function world(){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e12;return w;}
const chat=(w,id,text,at)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},at);
function setup(){const w=world();for(const id of ['a','b','c'])chat(w,id,'nhapmon',N);assert.equal(startTower(w,N+10).ok,true);return w;}

test('gõ 6 queues into the tower, the turn starts on tick and floor = best + 1',()=>{
 const w=setup();w.players.a.towerFloor=2;
 assert.equal(chat(w,'a','6',N+100).tower,true);assert.equal(chat(w,'b','leo tháp',N+120).position,2);
 tick(w,N+200);const s=snapshot(w,N+200);
 assert.equal(s.tower.cur.id,'a');assert.equal(s.tower.cur.floor,3);assert.equal(s.tower.cur.guardian.name,guardianOf(3).name);
 assert.deepEqual(s.tower.queue,['B']);
 assert.equal(s.quick.event.name,'VÂN HẢI THÁP');
});

test('climber hits and helpers chip in; a win saves the floor and pays tu vi + linh thạch',()=>{
 const w=setup();const a=w.players.a;a.realm=4;const qi0=a.totalQi,st0=a.stones;
 chat(w,'a','6',N+100);tick(w,N+200);
 let t=N+300;const hp0=w.tower.cur.hp;chat(w,'a','3',t);assert.ok(w.tower.cur.hp<hp0,'own hit');
 const hp1=w.tower.cur.hp;chat(w,'b','3',t+10);assert.ok(w.tower.cur.hp<hp1,'help hit');assert.equal(Object.keys(w.tower.cur.helpers).length,1);
 for(let i=0;i<60&&w.tower.cur;i++){t+=1000;chat(w,'a','3',t);tick(w,t);}
 assert.equal(w.tower.cur,null);assert.equal(a.towerFloor,1);assert.ok(a.totalQi>qi0&&a.stones>st0);
 assert.equal(w.tower.last.won,true);
});

test('time runs out → no penalty, floor unchanged, next viewer steps in after the gap',()=>{
 const w=setup();const a=w.players.a;a.realm=0;a.towerFloor=20;const qi0=a.totalQi;
 chat(w,'a','6',N+100);chat(w,'b','6',N+110);tick(w,N+200);
 assert.ok(passiveDps(0,21)*TOWER.turnMs/1000<100,'high floor not passively cleared');
 tick(w,N+200+TOWER.turnMs+1);assert.equal(w.tower.last.won,false);assert.equal(a.towerFloor,20);assert.equal(a.totalQi,qi0);
 tick(w,N+200+TOWER.turnMs+TOWER.gapMs+10);assert.equal(w.tower.cur.id,'b');
});

test('every 5th floor pays double and raises a Báo Hỷ; the event closes with a podium',()=>{
 const w=setup();const a=w.players.a;a.realm=12;a.towerFloor=4;
 chat(w,'a','6',N+100);tick(w,N+200);let t=N+200;for(let i=0;i<40&&w.tower.cur;i++){t+=1000;tick(w,t);}
 assert.equal(a.towerFloor,5);const e=w.events.findLast(x=>x.achieve?.kind==='tower');assert.ok(e);assert.equal(e.achieve.floor,5);
 tick(w,N+10+TOWER.durationMs+1);assert.ok(w.tower.closedAt);assert.equal(w.tower.result.top[0].id,'a');
});

test('đánh is left to other events when nobody is climbing',()=>{
 const w=setup();const r=chat(w,'a','3',N+100);assert.notEqual(r?.tower,true);
});
