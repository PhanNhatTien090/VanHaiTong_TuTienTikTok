// 09/11/2026: cân lại thưởng sự kiện — pháp bảo chỉ tính một nửa cho thưởng sự kiện, lò đan giảm nhẹ, ai tặng quà trong lò được nhân thêm.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ALC,alchemyGiftMult} from '../alchemy.mjs';
import {EVENT_GEAR_SHARE} from '../engine.mjs';

test('thưởng lò đan giảm nhẹ: 0,7% tu vi cần mỗi phẩm', () => {
  assert.equal(ALC.reward.pct, .007);
});

test('tặng quà trong lò đan được nhân thưởng theo tổng coin', () => {
  assert.equal(alchemyGiftMult(0), 1);
  assert.equal(alchemyGiftMult(undefined), 1);
  assert.equal(alchemyGiftMult(1), 1.5);
  assert.equal(alchemyGiftMult(4), 1.5);
  assert.equal(alchemyGiftMult(5), 2);
  assert.equal(alchemyGiftMult(98), 2);
  assert.equal(alchemyGiftMult(99), 3);
  assert.equal(alchemyGiftMult(5000), 3);
});

test('thưởng sự kiện chỉ ăn một nửa hệ số pháp bảo', () => {
  assert.equal(EVENT_GEAR_SHARE, .5);
});
