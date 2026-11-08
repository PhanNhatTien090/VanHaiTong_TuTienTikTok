// Cơ chế phát triển riêng của bản web: nguyên liệu, cường hóa pháp bảo, nuôi linh thú, nhiệm vụ ngày.
// Dữ liệu nằm trong player.web, không đổi các trường LIVE (trừ việc chọn linh thú đồng hành đã sở hữu,
// vốn là lệnh có sẵn trên LIVE).
import { CATALOG, power, REALMS } from '../engine.mjs';
import { SPIRIT_PETS, ALL_PETS, petById } from '../public/spirit-pets.js';
import { vnDay } from './game-view.mjs';

export const MATS = {
  'huyen-thiet': { name: 'Huyền Thiết', icon: '/art/ui/mat-huyen-thiet.png', desc: 'Quặng thiên thạch, dùng cường hóa +1 đến +3.' },
  'tinh-kim': { name: 'Tinh Kim', icon: '/art/ui/mat-tinh-kim.png', desc: 'Kim loại sao, dùng cường hóa +4 đến +6.' },
  'long-tuy': { name: 'Long Tủy', icon: '/art/ui/mat-long-tuy.png', desc: 'Tinh tủy long mạch, dùng cường hóa +7 đến +10.' },
  'linh-qua': { name: 'Linh Quả', icon: '/art/ui/mat-linh-qua.png', desc: 'Quả linh khí, cho linh thú ăn để lên cấp.' },
};
export const ENHANCE_MAX = 10;
export const PET_MAX = 20;
const PET_RANK = { 'jade-rabbit': 0.25, 'ember-fox': 0.35, 'frost-tiger': 0.45, 'sun-phoenix': 0.6, 'astral-dragon': 0.8, 'loi-oa': 0.8, 'van-thu': 0.75, 'ky-lan': 0.85 };
// 08/11 tối: KỸ NĂNG TRỢ CHIẾN của linh thú trong bí cảnh web (ngoài cú cắn). Mạnh dần theo cấp nuôi (+3%/cấp).
// kind: heal (hồi % máu) · shield (giáp hút sát thương, % máu tối đa, 6 s) · burn (thiêu đốt boss) · strike (đại chiêu) · stun (choáng boss) · leech (hút máu theo sát thương cắn) · hot (hồi máu theo thời gian).
export const PET_SKILLS = Object.freeze({
  'jade-rabbit':   { name: 'Hồi Xuân Thảo',     every: 9,  desc: 'Hồi 6% máu.', heal: 0.06 },
  'ember-fox':     { name: 'Hồ Hỏa Phần Thiên', every: 7,  desc: 'Thiêu đốt boss 4 lần.', burn: { ticks: 4, mult: 0.18 } },
  'frost-tiger':   { name: 'Băng Phách Giáp',   every: 10, desc: 'Tạo giáp băng hút 15% máu.', shield: 0.15 },
  'sun-phoenix':   { name: 'Niết Bàn Hỏa',      every: 11, desc: 'Hồi 10% máu + giáp 10%.', heal: 0.10, shield: 0.10 },
  'astral-dragon': { name: 'Tinh Hà Long Uy',   every: 10, desc: 'Long uy giáng 150% sức mạnh + giáp 15%.', strike: 1.5, shield: 0.15 },
  'loi-oa':        { name: 'Lôi Đình Chấn',     every: 8,  desc: 'Sét đánh 130% sức mạnh, choáng boss 1,5 giây.', strike: 1.3, stun: 1.5 },
  'van-thu':       { name: 'Huyết Phệ',         every: 9,  desc: 'Mỗi cú cắn hút máu; đại chiêu hút 100% sức mạnh, hồi 8% máu.', strike: 1.0, heal: 0.08, leech: 0.6 },
  'ky-lan':        { name: 'Kỳ Lân Hộ Thể',     every: 11, desc: 'Giáp lửa 25% + hồi 15% máu trong 3 giây + thiêu đốt boss.', shield: 0.25, hot: { total: 0.15, secs: 3 }, burn: { ticks: 3, mult: 0.2 } },
});
const petSkill = (id, lv) => { const k = PET_SKILLS[id]; if (!k) return null; const f = 1 + 0.03 * (lv - 1), sc = v => Math.round(v * f * 1000) / 1000;
  return { ...k, heal: k.heal && sc(k.heal), shield: k.shield && sc(k.shield), strike: k.strike && sc(k.strike), leech: k.leech && sc(k.leech), burn: k.burn && { ticks: k.burn.ticks, mult: sc(k.burn.mult) }, hot: k.hot && { total: sc(k.hot.total), secs: k.hot.secs } }; };
// Sát thương thêm/giây (theo bội số sức mạnh) của kỹ năng — server tính vào giới hạn thời gian hạ boss tối thiểu.
export function petExtraDps(pet) { const k = pet?.skill; if (!k) return 0; return ((k.strike || 0) + (k.burn ? k.burn.ticks * k.burn.mult : 0)) / k.every; }

export function web(p) { return (p.web ??= {}); }
function mats(p) { return (web(p).mats ??= {}); }
export function addMats(p, drops) { const m = mats(p); for (const [k, v] of Object.entries(drops)) if (v > 0) m[k] = (m[k] || 0) + v; }

// ---------- Cường hóa ----------
export function enhanceLevel(p, itemId) { return web(p).enhance?.[itemId] || 0; }
export function enhanceCost(level) {
  const next = level + 1;
  const mat = next <= 3 ? 'huyen-thiet' : next <= 6 ? 'tinh-kim' : 'long-tuy';
  const count = next <= 3 ? next * 2 : next <= 6 ? (next - 3) * 2 : next - 6;
  return { stones: 40 * next * next, mat, count };
}
function itemDamage(id) { return CATALOG.find(x => x.id === id)?.damage || 0; }
// Sức mạnh cộng thêm trong trận nhờ cường hóa pháp bảo đang trang bị (không đổi sức mạnh trên LIVE).
export function enhanceBonus(p) {
  const L = enhanceLevel(p, p.equipped);
  if (!p.equipped || !L) return { attack: 0, hp: 0, level: 0 };
  return { attack: Math.round(itemDamage(p.equipped) * 0.12 * L + 2 * L), hp: 30 * L, level: L };
}
export function forgeView(p) {
  const owned = (p.artifacts || []).map(id => {
    const it = CATALOG.find(x => x.id === id);
    const level = enhanceLevel(p, id);
    return { id, name: it?.name || id, damage: it?.damage || 0, level, equipped: p.equipped === id, cost: level < ENHANCE_MAX ? enhanceCost(level) : null };
  }).sort((a, b) => b.equipped - a.equipped || b.damage - a.damage);
  return { mats: matsView(p), stones: p.stones, items: owned, max: ENHANCE_MAX };
}
export function matsView(p) { const m = mats(p); return Object.entries(MATS).map(([id, d]) => ({ id, ...d, count: m[id] || 0 })); }
export function enhance(p, itemId) {
  if (!(p.artifacts || []).includes(itemId)) return { ok: false, message: 'Chưa sở hữu pháp bảo này.' };
  const level = enhanceLevel(p, itemId);
  if (level >= ENHANCE_MAX) return { ok: false, message: 'Đã cường hóa tối đa.' };
  const c = enhanceCost(level), m = mats(p);
  if (p.stones < c.stones) return { ok: false, message: `Cần ${c.stones} linh thạch.` };
  if ((m[c.mat] || 0) < c.count) return { ok: false, message: `Cần ${c.count} ${MATS[c.mat].name}.` };
  p.stones -= c.stones; m[c.mat] -= c.count;
  (web(p).enhance ??= {})[itemId] = level + 1;
  bumpQuest(p, 'enhance');
  return { ok: true, level: level + 1 }; // không xổ số: luôn thành công
}

// ---------- Linh thú ----------
export function petLevel(p, id) { return web(p).petLv?.[id] || 1; }
export function petFeedCost(level) { return level * 2; }
export function petView(p) {
  const owned = new Set(p.spiritPets || []);
  return {
    chosen: p.spiritPet || null,
    food: mats(p)['linh-qua'] || 0,
    pets: ALL_PETS.filter(x => !x.rare || owned.has(x.id)).map(x => ({ id: x.id, name: x.name, rank: x.rank, color: x.color, rare: !!x.rare, flavor: x.flavor || '', skill: PET_SKILLS[x.id] ? { name: PET_SKILLS[x.id].name, desc: PET_SKILLS[x.id].desc, every: PET_SKILLS[x.id].every } : null, owned: owned.has(x.id), level: petLevel(p, x.id), max: PET_MAX, feedCost: petFeedCost(petLevel(p, x.id)), power: Math.round(((PET_RANK[x.id] || 0.25) + 0.02 * petLevel(p, x.id)) * 100), hearts: x.hearts, coins: x.coins })),
  };
}
export function feedPet(p, id) {
  if (!(p.spiritPets || []).includes(id)) return { ok: false, message: 'Chưa sở hữu linh thú này (mở trên LIVE).' };
  const lv = petLevel(p, id);
  if (lv >= PET_MAX) return { ok: false, message: 'Linh thú đã đạt cấp tối đa.' };
  const cost = petFeedCost(lv), m = mats(p);
  if ((m['linh-qua'] || 0) < cost) return { ok: false, message: `Cần ${cost} Linh Quả.` };
  m['linh-qua'] -= cost;
  (web(p).petLv ??= {})[id] = lv + 1;
  return { ok: true, level: lv + 1 };
}
export function choosePet(p, id) {
  if (!(p.spiritPets || []).includes(id)) return { ok: false, message: 'Chưa sở hữu linh thú này.' };
  p.spiritPet = id; // giống lệnh chọn linh thú trên LIVE
  return { ok: true };
}
// Linh thú trợ chiến: % sức mạnh mỗi đòn, theo phẩm cấp + cấp nuôi.
export function petCombat(p) {
  const pet = petById(p.spiritPet);
  if (!pet || !(p.spiritPets || []).includes(pet.id)) return null;
  const lv = petLevel(p, pet.id);
  return { id: pet.id, name: pet.name, color: pet.color, level: lv, mult: (PET_RANK[pet.id] || 0.25) + 0.02 * lv, flying: !!pet.flying || pet.id === 'sun-phoenix' || pet.id === 'astral-dragon', skill: petSkill(pet.id, lv) };
}

// ---------- Nhiệm vụ ngày ----------
export const QUESTS = [
  { id: 'clear', name: 'Vượt ải bí cảnh 3 lần', goal: 3, reward: { stones: 60, mats: { 'huyen-thiet': 2 } } },
  { id: 'star3', name: 'Đạt 3 sao một trận', goal: 1, reward: { stones: 40, mats: { 'linh-qua': 3 } } },
  { id: 'cultivate', name: 'Tu luyện 5 lần trên web', goal: 5, reward: { stones: 30, mats: { 'linh-qua': 2 } } },
  { id: 'enhance', name: 'Cường hóa pháp bảo 1 lần', goal: 1, reward: { stones: 50, mats: { 'tinh-kim': 1 } } },
];
export const QUEST_BONUS = { stones: 150, mats: { 'tinh-kim': 2, 'linh-qua': 4 } };
function questState(p, now = Date.now()) {
  const s = web(p), day = vnDay(now);
  if (s.quests?.day !== day) s.quests = { day, progress: {}, claimed: {} };
  return s.quests;
}
export function bumpQuest(p, id, n = 1, now = Date.now()) { const q = questState(p, now); q.progress[id] = (q.progress[id] || 0) + n; }
export function questView(p, now = Date.now()) {
  const q = questState(p, now);
  const list = QUESTS.map(x => ({ id: x.id, name: x.name, goal: x.goal, progress: Math.min(x.goal, q.progress[x.id] || 0), done: (q.progress[x.id] || 0) >= x.goal, claimed: !!q.claimed[x.id], reward: x.reward }));
  return { quests: list, bonus: { reward: QUEST_BONUS, ready: list.every(x => x.claimed), claimed: !!q.claimed.bonus } };
}
export function claimQuest(p, id, now = Date.now()) {
  const q = questState(p, now);
  if (id === 'bonus') {
    if (q.claimed.bonus) return { ok: false, message: 'Đã nhận.' };
    if (!QUESTS.every(x => q.claimed[x.id])) return { ok: false, message: 'Hoàn thành hết nhiệm vụ trước.' };
    q.claimed.bonus = true; p.stones += QUEST_BONUS.stones; addMats(p, QUEST_BONUS.mats);
    return { ok: true, reward: QUEST_BONUS };
  }
  const x = QUESTS.find(x => x.id === id);
  if (!x) return { ok: false, message: 'Không có nhiệm vụ này.' };
  if (q.claimed[id]) return { ok: false, message: 'Đã nhận.' };
  if ((q.progress[id] || 0) < x.goal) return { ok: false, message: 'Chưa hoàn thành.' };
  q.claimed[id] = true; p.stones += x.reward.stones; addMats(p, x.reward.mats);
  return { ok: true, reward: x.reward };
}
export const realmName = r => REALMS[r];
export { power };
