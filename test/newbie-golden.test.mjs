import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, action, GOLDEN_MS } from '../engine.mjs';

const T = Date.parse('2026-11-03T10:00:00+07:00');
function fresh(id, joinedAt) { const w = createWorld('live'); w.settings.goldenHour = true; action(w, { type: 'join', userId: id, name: id }, joinedAt); return w; }

test('giờ vàng: 30 phút đầu tu luyện được tu vi ×2, linh thạch ×3; hết giờ thì bình thường', () => {
  const a = fresh('moi', T), b = fresh('cu', T - GOLDEN_MS - 1000);
  const pa = a.players.moi, pb = b.players.cu;
  const qa = pa.qi, sa = pa.stones, qb = pb.qi, sb = pb.stones;
  assert.ok(action(a, { type: 'cultivate', userId: 'moi' }, T + 60000).ok);
  assert.ok(action(b, { type: 'cultivate', userId: 'cu' }, T + 60000).ok);
  assert.equal(pa.qi - qa, 2 * (pb.qi - qb));
  assert.equal(pa.stones - sa, 3 * (pb.stones - sb));
});

test('5 phút đầu: bình luận bất kỳ tính như tuluyen (có hồi chiêu 10 giây)', () => {
  const w = fresh('moi', T), p = w.players.moi; w.settings.engagementRewards=true;
  const r = action(w, { type: 'chat', userId: 'moi', text: 'chào mọi người' }, T + 30000);
  assert.ok(r.ok);
  assert.ok(w.events.some(e => e.user === 'moi' && e.newbieChat));
  assert.ok(p.cultivatedAt);
  const after = fresh('cu', T); action(after, { type: 'chat', userId: 'cu', text: 'hello' }, T + 6 * 60000);
  assert.equal(after.events.some(e => e.newbieChat), false);
});
