import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, action, requiredQi } from '../../engine.mjs';
import { jadeBalance, buy, shopView, startRetreat, claimRetreat, retreatView, welcomeMail, mailView, claimMail, giftView, claimGift, takeExtraPills } from '../extras.mjs';
import { staminaView } from '../dungeon.mjs';

function player(extra = {}) {
  const w = createWorld('live');
  action(w, { type: 'join', userId: 'p1', name: 'Thử' }, 1);
  return { w, p: Object.assign(w.players.p1, extra) };
}

test('Tiên Ngọc = coin quà LIVE − đã tiêu; cửa hàng có giới hạn lượt, không đụng tài nguyên LIVE', () => {
  const { p } = player({ giftCoins: 100, stones: 50 });
  assert.equal(jadeBalance(p), 100);
  const r = buy(p, 'battle-pill', 1e9);
  assert.equal(r.ok, true);
  assert.equal(jadeBalance(p), 75);
  assert.equal(p.web.extraPills, 1);
  assert.equal(p.stones, 50); // không đổi linh thạch LIVE
  assert.equal(buy(p, 'dragon-box', 1e9).ok, false); // 150 > 75
  takeExtraPills(p, 5);
  assert.equal(p.web.extraPills, 0);
  p.giftCoins = 1000;
  for (let i = 0; i < 3; i++) assert.equal(buy(p, 'stamina-50', 1e9).ok, true);
  assert.equal(buy(p, 'stamina-50', 1e9).ok, false); // hết lượt ngày
  assert.ok(staminaView(p, 1e9).stamina > 100);
  assert.equal(shopView(p, 1e9).items.find(x => x.id === 'stamina-50').left, 0);
});

test('bế quan: ít nhất 10 phút, tối đa 8 giờ, tính chung trần tu vi ngày', () => {
  const { w, p } = player({ realm: 2 });
  const t0 = Date.parse('2026-11-03T08:00:00+07:00');
  assert.equal(startRetreat(p, t0).ok, true);
  assert.equal(claimRetreat(w, p, t0 + 5 * 60000).ok, false);
  assert.equal(retreatView(p, t0 + 20 * 3600000).full, true);
  const qi = p.qi;
  const r = claimRetreat(w, p, t0 + 20 * 3600000);
  assert.equal(r.ok, true);
  assert.ok(r.qi > 0 && r.qi <= Math.round(requiredQi(p) * 0.5) + 1);
  assert.equal(p.qi, qi + r.qi);
  assert.equal(retreatView(p, t0).active, false);
});

test('thư chào mừng gửi một lần, nhận quà một lần; quà ngày theo chuỗi', () => {
  const { p } = player({ giftCoins: 30 });
  welcomeMail(p, 1); welcomeMail(p, 2);
  assert.equal(mailView(p).mail.length, 2); // chào mừng + thông báo Tiên Ngọc
  assert.equal(claimMail(p, 'all', 3).claimed, 1);
  assert.equal(claimMail(p, 'all', 4).claimed, 0);
  assert.equal(p.web.mats['huyen-thiet'], 6);
  const d1 = Date.parse('2026-11-03T09:00:00+07:00');
  assert.equal(claimGift(p, d1).day, 1);
  assert.equal(claimGift(p, d1 + 3600000).ok, false);
  assert.equal(claimGift(p, d1 + 86400000).day, 2);
  assert.equal(giftView(p, d1 + 3 * 86400000).streak, 0); // bỏ một ngày → về 0
});
