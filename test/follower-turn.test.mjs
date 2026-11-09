// 09/11/2026: pháp bảo và linh thú thay phiên, pháp bảo đứng yên chỉ nhích nhẹ.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FOLLOWER_TURN_MS,followerTurn,relicTurn,petTurn,relicBob} from '../public/follower-turn.js';

test('pháp bảo và linh thú không bao giờ hiện cùng lúc, đổi lượt mỗi 7,5 phút', () => {
  assert.equal(FOLLOWER_TURN_MS, 450000);
  for (let now = 0; now < 4 * FOLLOWER_TURN_MS; now += 60000) assert.notEqual(relicTurn(now), petTurn(now));
  assert.equal(followerTurn(1000), 'relic');
  assert.equal(followerTurn(FOLLOWER_TURN_MS + 1000), 'pet');
  assert.equal(followerTurn(2 * FOLLOWER_TURN_MS + 1000), 'relic');
});

test('Linh Thú Cốc đang mở thì linh thú luôn hiện', () => {
  assert.equal(petTurn(1000, true), true);
});

test('pháp bảo chỉ nhích lên xuống tối đa 3 px, tắt chuyển động thì đứng im', () => {
  for (let t = 0; t < 20000; t += 37) assert.ok(Math.abs(relicBob(t, 'abc')) <= 3);
  assert.equal(relicBob(1234, 'abc', false), 0);
});
