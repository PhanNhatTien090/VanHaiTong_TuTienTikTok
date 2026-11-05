// Tiên Ngọc + Cửa hàng, Bế quan, Thư, Quà mỗi ngày (chỉ có trên web).
// Tiên Ngọc = tổng coin quà đã tặng trên LIVE (giftCoins) − phần đã tiêu trên web → quà cũ được cộng bù tự động.
// Cửa hàng chỉ bán đồ dùng trên web (thể lực, nguyên liệu, đan trong trận): không đổi tiến trình/ngoại hình LIVE.
import crypto from 'node:crypto';
import { requiredQi } from '../engine.mjs';
import { vnDay } from './game-view.mjs';
import { web, addMats } from './progress.mjs';
import { STAMINA_MAX, DAILY_QI_SHARE, staminaView } from './dungeon.mjs';

// ---------- Tiên Ngọc ----------
export function jadeBalance(p) { return Math.max(0, (p.giftCoins || 0) - (web(p).jadeSpent || 0)); }

export const SHOP = [
  { id: 'stamina-50', name: 'Bình Thể Lực', desc: '+50 thể lực (vượt mức tối đa được).', icon: '/art/ui/icon-stamina.png', price: 20, daily: 3, give: { stamina: 50 } },
  { id: 'starter-box', name: 'Rương Tu Sĩ', desc: '5 Huyền Thiết, 3 Linh Quả.', icon: '/art/ui/icon-gift.png', price: 30, daily: 5, give: { mats: { 'huyen-thiet': 5, 'linh-qua': 3 } } },
  { id: 'star-box', name: 'Rương Tinh Kim', desc: '4 Tinh Kim.', icon: '/art/ui/mat-tinh-kim.png', price: 80, daily: 3, give: { mats: { 'tinh-kim': 4 } } },
  { id: 'dragon-box', name: 'Rương Long Tủy', desc: '2 Long Tủy.', icon: '/art/ui/mat-long-tuy.png', price: 150, daily: 2, give: { mats: { 'long-tuy': 2 } } },
  { id: 'pet-food', name: 'Giỏ Linh Quả', desc: '10 Linh Quả cho linh thú.', icon: '/art/ui/mat-linh-qua.png', price: 40, daily: 3, give: { mats: { 'linh-qua': 10 } } },
  { id: 'battle-pill', name: 'Hồi Xuân Đan', desc: '+1 viên đan hồi máu mang vào bí cảnh (giữ tới khi dùng).', icon: '/art/battle/btn-pill.png', price: 25, daily: 5, give: { pills: 1 } },
];
function shopState(p, now) { const s = web(p), day = vnDay(now); if (s.shop?.day !== day) s.shop = { day, bought: {} }; return s.shop; }
export function shopView(p, now = Date.now()) {
  const st = shopState(p, now);
  return { jade: jadeBalance(p), giftCoins: p.giftCoins || 0, items: SHOP.map(x => ({ ...x, left: x.daily - (st.bought[x.id] || 0) })), extraPills: web(p).extraPills || 0 };
}
export function buy(p, id, now = Date.now()) {
  const item = SHOP.find(x => x.id === id);
  if (!item) return { ok: false, message: 'Không có món này.' };
  const st = shopState(p, now);
  if ((st.bought[id] || 0) >= item.daily) return { ok: false, message: 'Hôm nay đã mua hết lượt món này.' };
  if (jadeBalance(p) < item.price) return { ok: false, message: `Cần ${item.price} Tiên Ngọc.` };
  const s = web(p);
  s.jadeSpent = (s.jadeSpent || 0) + item.price;
  st.bought[id] = (st.bought[id] || 0) + 1;
  if (item.give.stamina) { staminaView(p, now); s.stamina = (s.stamina || 0) + item.give.stamina; }
  if (item.give.mats) addMats(p, item.give.mats);
  if (item.give.pills) s.extraPills = (s.extraPills || 0) + item.give.pills;
  return { ok: true, item: item.name };
}
// Đan mua thêm: mang vào trận (trận dùng hết thì trừ khi báo kết quả).
export function takeExtraPills(p, used) { const s = web(p); s.extraPills = Math.max(0, (s.extraPills || 0) - Math.max(0, Math.min(used, s.extraPills || 0))); }

// ---------- Bế quan (tu khi offline) ----------
export const RETREAT_MAX_MS = 8 * 3600 * 1000;
const RETREAT_RATE = 0.03; // mỗi giờ = 3% lượng tu vi cần để đột phá
export function retreatView(p, now = Date.now()) {
  const r = web(p).retreat;
  if (!r) return { active: false, maxHours: RETREAT_MAX_MS / 3600000, ratePerHour: Math.round(requiredQi(p) * RETREAT_RATE) };
  const ms = Math.min(RETREAT_MAX_MS, now - r.startedAt);
  return { active: true, startedAt: r.startedAt, elapsedMs: ms, full: ms >= RETREAT_MAX_MS, pending: Math.round(requiredQi(p) * RETREAT_RATE * ms / 3600000), maxHours: RETREAT_MAX_MS / 3600000, ratePerHour: Math.round(requiredQi(p) * RETREAT_RATE) };
}
export function startRetreat(p, now = Date.now()) {
  if (web(p).retreat) return { ok: false, message: 'Đang bế quan.' };
  web(p).retreat = { startedAt: now };
  return { ok: true };
}
export function claimRetreat(w, p, now = Date.now()) {
  const s = web(p), r = s.retreat;
  if (!r) return { ok: false, message: 'Chưa bế quan.' };
  if (now - r.startedAt < 10 * 60000) return { ok: false, message: 'Bế quan ít nhất 10 phút mới xuất quan.' };
  const v = retreatView(p, now);
  // Chung trần tu vi mỗi ngày với bí cảnh: web không đẩy người chơi lên cảnh giới quá nhanh so với LIVE.
  const day = vnDay(now); if (s.day !== day) { s.day = day; s.dailyQi = 0; }
  const cap = Math.round(requiredQi(p) * DAILY_QI_SHARE);
  const qi = Math.max(0, Math.min(v.pending, cap - (s.dailyQi || 0)));
  p.qi += qi; p.totalQi += qi; w.sectQi = (w.sectQi || 0) + qi; s.dailyQi = (s.dailyQi || 0) + qi;
  s.retreat = null;
  return { ok: true, qi, capped: qi < v.pending, hours: Math.round(v.elapsedMs / 360000) / 10 };
}

// ---------- Thư ----------
function mailbox(p) { return (web(p).mail ??= []); }
export function sendMail(p, { title, body, reward = null, key = null }, now = Date.now()) {
  const box = mailbox(p);
  if (key && box.some(m => m.key === key)) return false; // thư theo mốc chỉ gửi một lần
  box.unshift({ id: crypto.randomBytes(6).toString('hex'), key, title, body, reward, at: now, read: false, claimed: !reward });
  if (box.length > 40) box.length = 40;
  return true;
}
export function welcomeMail(p, now = Date.now()) {
  sendMail(p, { key: 'welcome', title: 'Chào mừng đến Vân Hải Tông', body: 'Lão phu tặng đạo hữu chút lễ vật nhập môn. Vào Bí Cảnh đánh boss để nhặt nguyên liệu, rồi tới Luyện Khí Các cường hóa pháp bảo. Người xem LIVE không thấy hoạt động của đạo hữu trên web.', reward: { stamina: 30, mats: { 'huyen-thiet': 6, 'linh-qua': 5 } } }, now);
  if ((p.giftCoins || 0) > 0) sendMail(p, { key: 'jade-backfill', title: 'Tiên Ngọc từ quà LIVE', body: `Toàn bộ ${p.giftCoins} coin quà đạo hữu đã tặng trên LIVE được quy thành ${p.giftCoins} Tiên Ngọc. Dùng trong Cửa hàng.` }, now);
}
export function mailView(p) { const box = mailbox(p); return { mail: box, unread: box.filter(m => !m.read || !m.claimed).length }; }
export function claimMail(p, id, now = Date.now()) {
  const box = mailbox(p), list = id === 'all' ? box : box.filter(m => m.id === id);
  if (!list.length) return { ok: false, message: 'Không có thư này.' };
  let got = 0;
  for (const m of list) {
    m.read = true;
    if (m.reward && !m.claimed) { grantReward(p, m.reward, now); m.claimed = true; got++; }
  }
  return { ok: true, claimed: got };
}
function grantReward(p, r, now) {
  const s = web(p);
  if (r.stamina) { staminaView(p, now); s.stamina = (s.stamina || 0) + r.stamina; }
  if (r.mats) addMats(p, r.mats);
}

// ---------- Quà mỗi ngày (7 ngày liên tục) ----------
export const DAILY_GIFTS = [
  { stamina: 20, mats: { 'linh-qua': 2 } },
  { mats: { 'huyen-thiet': 4 } },
  { stamina: 30, mats: { 'linh-qua': 3 } },
  { mats: { 'tinh-kim': 2 } },
  { stamina: 40 },
  { mats: { 'tinh-kim': 3, 'linh-qua': 5 } },
  { stamina: 60, mats: { 'long-tuy': 2 } },
];
function prevDay(day) { const d = new Date(day + 'T12:00:00+07:00'); d.setUTCDate(d.getUTCDate() - 1); return vnDay(d.getTime()); }
export function giftView(p, now = Date.now()) {
  const g = web(p).daily || { streak: 0, last: null }, today = vnDay(now);
  const claimedToday = g.last === today;
  const streak = claimedToday ? g.streak : g.last === prevDay(today) ? g.streak : 0;
  const nextIndex = claimedToday ? (g.streak - 1) % 7 : streak % 7;
  return { claimedToday, streak, today: nextIndex, gifts: DAILY_GIFTS };
}
export function claimGift(p, now = Date.now()) {
  const v = giftView(p, now);
  if (v.claimedToday) return { ok: false, message: 'Hôm nay đã nhận quà. Mai quay lại nhé!' };
  const reward = DAILY_GIFTS[v.today];
  grantReward(p, reward, now);
  web(p).daily = { streak: v.streak + 1, last: vnDay(now) };
  return { ok: true, reward, day: v.today + 1 };
}
export { STAMINA_MAX };
