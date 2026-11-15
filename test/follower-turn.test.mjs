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
