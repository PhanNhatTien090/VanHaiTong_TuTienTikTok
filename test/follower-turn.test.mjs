// 09/11/2026: pháp bảo và linh thú thay phiên, pháp bảo đứng yên chỉ nhích nhẹ.
// 15/11/2026: linh thú hiện 9/10 thời gian, pháp bảo chỉ ló 1 phút mỗi 10 phút.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FOLLOWER_TURN_MS,RELIC_CAMEO_MS,followerTurn,relicTurn,petTurn,relicBob} from '../public/follower-turn.js';

test('pháp bảo và linh thú không bao giờ hiện cùng lúc; thú hiện 9 phút, pháp bảo 1 phút mỗi 10 phút', () => {
  assert.equal(FOLLOWER_TURN_MS, 600000);assert.equal(RELIC_CAMEO_MS, 60000);
  let pet=0,relic=0;
  for (let now = 0; now < 4 * FOLLOWER_TURN_MS; now += 10000){assert.notEqual(relicTurn(now), petTurn(now));petTurn(now)?pet++:relic++;}
  assert.equal(pet/(pet+relic), .9);
  assert.equal(followerTurn(1000), 'relic');
  assert.equal(followerTurn(RELIC_CAMEO_MS + 1000), 'pet');
  assert.equal(followerTurn(FOLLOWER_TURN_MS + 1000), 'relic');
});

test('Linh Thú Cốc đang mở thì linh thú luôn hiện', () => {
  assert.equal(petTurn(1000, true), true);
});

test('pháp bảo chỉ nhích lên xuống tối đa 3 px, tắt chuyển động thì đứng im', () => {
  for (let t = 0; t < 20000; t += 37) assert.ok(Math.abs(relicBob(t, 'abc')) <= 3);
  assert.equal(relicBob(1234, 'abc', false), 0);
});

import {petVisit,relicVisit,PET_VISIT_MS} from '../public/follower-turn.js';
test('16/11: linh thú ghé theo lượt riêng từng người (vào → đi lại → nghỉ → chạy đi), pháp bảo lâu lâu mới hiện, không trùng nhau', () => {
  const ids=Array.from({length:200},(_,i)=>'u'+i);let pets=0,relics=0,n=0;
  for(let now=0;now<PET_VISIT_MS*2;now+=7000)for(const id of ids){n++;const v=petVisit(id,now);if(v.on)pets++;const r=relicVisit(id,now);if(r)relics++;assert.ok(!(v.on&&r));}
  assert.ok(pets/n>.2&&pets/n<.35,'thú hiện '+(pets/n));
  assert.ok(relics/n<.08,'pháp bảo hiện '+(relics/n));
  const phases=new Set();for(let now=0;now<PET_VISIT_MS;now+=1000){const v=petVisit('abc',now);if(v.on)phases.add(v.phase);}
  assert.deepEqual([...phases].sort(),['enter','leave','rest','stay']);
});
