import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,tick,openBoss,residentStrike,snapshot} from '../engine.mjs';

test('boss opens on schedule with nobody watching; residents can win it without taking rewards or profiles',()=>{
  const w=createWorld('live');let now=1_000_000;tick(w,now);
  now=w.nextBossAt;tick(w,now);assert.ok(w.boss,'boss opens even with zero viewers');
  for(let t=now;t<now+120000&&w.boss;t+=1000)tick(w,t);
  assert.equal(w.boss,null);assert.equal(w.events.at(-1).effect,'victory');
  assert.equal(Object.keys(w.players).length,0,'residents never become player profiles');
  assert.equal(snapshot(w).players.length,0);
});
test('resident strikes are throttled and respect the off switch',()=>{
  const w=createWorld('live');openBoss(w,0);const hp=w.boss.hp;
  assert.ok(residentStrike(w,5000,()=>0)>0);assert.equal(residentStrike(w,6000),0);
  assert.ok(w.boss.hp<hp);
  w.settings.residents=false;assert.equal(residentStrike(w,20000),0);
});
test('chu kỳ NPC: Phàm nhân/Trúc Cơ/Kim Đan, cứ 75 giây một người đột phá, phút 13 về lại cảnh giới gốc, giữ tên gốc',async()=>{
  const {residentCycle,residentPlayers,RESIDENT_CYCLE_MS,RESIDENT_STEP_MS,NAME_GROUPS}=await import('../public/residents.js');
  const t0=RESIDENT_CYCLE_MS*NAME_GROUPS.length*1000;
  const a=residentCycle(t0+1000);assert.deepEqual(a.slots.map(s=>[s.name,s.realm]),[['Hai Thùy',0],['Tý Tèo',2],['Người Không Buồn Cười',3]]);assert.equal(a.events.length,0);
  assert.deepEqual(residentCycle(t0+RESIDENT_STEP_MS+1000).slots.map(s=>s.realm),[1,2,3]);
  assert.deepEqual(residentCycle(t0+3*RESIDENT_STEP_MS+1000).slots.map(s=>s.realm),[1,3,4]);
  const late=residentCycle(t0+RESIDENT_CYCLE_MS-1000);assert.ok(late.events.length>=9,'ít nhất 9 lần đột phá mỗi chu kỳ');
  assert.equal(late.events.at(-1).toRealm,late.slots[late.events.at(-1).slot].realm);
  const b=residentCycle(t0+RESIDENT_CYCLE_MS*3+1000);assert.deepEqual(b.slots.map(s=>s.realm),[0,2,3]);assert.equal(b.slots[0].name,'Hai Thùy','3/11: không đổi tên NPC nữa');
  assert.ok(residentPlayers(t0).every(p=>p.name.endsWith('· NPC')&&p.giftCoins===0),'NPC gắn nhãn rõ, không có coin quà');
  assert.equal(residentPlayers(t0+RESIDENT_CYCLE_MS+1000)[0].name.length>0,true);
});
