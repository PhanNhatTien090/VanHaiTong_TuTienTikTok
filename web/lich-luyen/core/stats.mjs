// Lịch luyện — tính chỉ số ra trận của phân thân. MỘT hàm, thứ tự cố định, mọi nguồn có `source` để giao diện giải thích.
// avatar: { pathId, cultivation: { step }, breakthroughs: [{ realmId, quality, points }], modifiers?: [{ source, stat, flat?, permille? }] }
// Sau này thêm: linh căn, trang bị, tâm pháp, mệnh cách, đạo tâm, động phủ, tông môn, ưu đãi bản thể/Đạo Nghiệp — đều là modifiers.
import { mulDiv } from './fixed.mjs';

export const STAT_KEYS = Object.freeze(['hp', 'mp', 'atk', 'def', 'spd', 'crit', 'critDmg']);

export function computeStats(content, avatar) {
  const table = content.stats, path = content.byId.get(avatar.pathId);
  if (!path?.statMult) throw Error('Đạo lộ không tồn tại: ' + avatar.pathId);
  const step = Math.max(0, Math.trunc(avatar.cultivation?.step || 0));
  const breakdown = [];

  // 1. Gốc theo bậc: nhân dồn số nguyên từng bậc ở độ chính xác ×1000 (số nhỏ như def=7 nếu làm tròn mỗi bậc sẽ đứng yên mãi)
  const s = { ...table.base };
  for (const k of Object.keys(table.growth)) {
    let v = s[k] * 1000;
    for (let i = 0; i < step; i++) v = mulDiv(v, table.growth[k], 100);
    s[k] = Math.trunc(v / 1000);
  }
  s.mp = Math.min(s.mp, table.mpCap);
  breakdown.push({ source: 'realm', ...s });

  // 2. Phẩm đột phá: điểm × ‰ vào hp/atk/def
  const points = (avatar.breakthroughs || []).reduce((n, b) => n + (b.points || 0), 0);
  if (points) {
    const pm = 1000 + points * table.qualityPermille;
    for (const k of ['hp', 'atk', 'def']) s[k] = mulDiv(s[k], pm, 1000);
    breakdown.push({ source: 'breakthrough', permille: pm - 1000 });
  }

  // 3. Đạo lộ
  for (const k of STAT_KEYS) if (path.statMult[k]) s[k] = mulDiv(s[k], path.statMult[k], 1000);
  breakdown.push({ source: path.id });

  // 4+. Nguồn khác: cộng thẳng trước, rồi cộng ‰ (theo thứ tự trong danh sách)
  const mods = avatar.modifiers || [];
  for (const m of mods) if (m.flat) { s[m.stat] += m.flat; breakdown.push({ source: m.source, stat: m.stat, flat: m.flat }); }
  for (const m of mods) if (m.permille) { s[m.stat] = mulDiv(s[m.stat], 1000 + m.permille, 1000); breakdown.push({ source: m.source, stat: m.stat, permille: m.permille }); }

  for (const k of STAT_KEYS) if (!Number.isSafeInteger(s[k]) || s[k] < 0) throw RangeError(`Chỉ số ${k} không hợp lệ: ${s[k]}`);
  return { stats: s, power: power(s), breakdown };
}

// Lực chiến — một con số để xếp hạng/so sánh. Công thức cố định; đổi thì phải chạy lại bảng xếp hạng.
export function power(s) { return Math.trunc(s.hp / 4 + s.atk * 6 + s.def * 5 + s.mp / 2 + mulDiv(s.atk, s.crit * (s.critDmg - 1000), 1000000) * 3); }
