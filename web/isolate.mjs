// Chạy hành động của người chơi web trên một "thế giới tạm" chỉ chứa đúng nhân vật đó.
// Luật chơi giống hệt LIVE (cùng hàm action của engine), nhưng:
//  - không sự kiện/ký sự nào lọt vào thế giới LIVE (người xem LIVE không thấy người chơi web);
//  - không kích hoạt sự kiện LIVE đang chạy (boss, tiên nhân, linh thú, kết duyên, đua…);
//  - không đổi thời điểm "có mặt" trên LIVE (lastActive), nên nhân vật không hiện lên sân khấu LIVE.
import { action, createWorld } from '../engine.mjs';

function shadowOf(world, p) {
  const s = createWorld('live');
  s.players = {};
  if (p) Object.defineProperty(s.players, p.id, { value: p, enumerable: true, writable: true, configurable: true });
  s.gifts = world.gifts;
  s.settings = { ...(world.settings || {}), residents: false };
  s.social = world.social; // chỉ đọc mã xã hội có sẵn của nhân vật
  s.nextBossAt = Number.MAX_SAFE_INTEGER;
  s.webShadow = true; // 09/11: engine bỏ qua Đạo tâm (chống auto tim LIVE) cho người chơi web
  return s;
}

export function webAction(world, p, input, now = Date.now()) {
  const shadow = shadowOf(world, p);
  const keepActive = p.lastActive;
  const result = action(shadow, { ...input, userId: p.id, name: input.name ?? p.name }, now);
  p.lastActive = keepActive;
  p.lastWebAt = now;
  return { result, events: shadow.events.filter(e => e.user === p.id) };
}

// Tạo nhân vật chỉ có trên web (hoặc hồ sơ cho người TikTok chưa từng chơi) mà không báo lên LIVE.
export function addPlayerQuietly(world, { userId, name, gender, webOnly = false }, now = Date.now()) {
  if (Object.hasOwn(world.players, userId)) return world.players[userId];
  if (Object.keys(world.players).length >= 10000) throw Error('Đã đạt giới hạn 10.000 hồ sơ.');
  const shadow = shadowOf(world, null);
  action(shadow, { type: 'join', userId, name, gender }, now);
  const p = shadow.players[userId];
  if (!p) throw Error('Không tạo được nhân vật.');
  p.lastActive = 0; // chưa từng có mặt trên LIVE
  if (webOnly) p.webOnly = true;
  p.lastWebAt = now;
  Object.defineProperty(world.players, userId, { value: p, enumerable: true, writable: true, configurable: true });
  return p;
}
