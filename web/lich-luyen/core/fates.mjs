// Lịch luyện — rút thẻ mệnh cách. Thuần, tất định theo seed (cùng phân thân + cùng lần đột phá → cùng bộ thẻ, tải lại trang không đổi được).
import { createRng } from './rng.mjs';

// picks: số lượt; mỗi lượt 3 thẻ khác nhau, không trùng thẻ đã sở hữu hay thẻ đã đưa ở lượt trước.
// luck: phẩm đột phá càng cao càng dễ ra thẻ hiếm — nhân trọng số thẻ rarity ≥ 3 thêm (100 + luck)%.
export function rollFateOffers(content, { seed, owned = [], pathId, picks, luck = 0 }) {
  const rng = createRng('fate:' + seed), taken = new Set(owned), groups = [];
  const pool = content.fates.filter(f => !f.path || f.path === pathId);
  const weightOf = f => f.rarity >= 3 ? Math.trunc(f.weight * (100 + luck) / 100) : f.weight;
  for (let p = 0; p < picks; p++) {
    const group = [];
    for (let k = 0; k < 3; k++) {
      const left = pool.filter(f => !taken.has(f.id) && weightOf(f) > 0);
      if (!left.length) break;
      const f = rng.weighted(left, weightOf);
      group.push(f.id); taken.add(f.id);
    }
    if (group.length) groups.push(group);
  }
  return groups;
}

// Mệnh cách → modifiers cho computeStats (bỏ qiGain — không phải chỉ số trận) và tổng ‰ tu vi nhận thêm.
export function fateModifiers(content, fateIds = []) {
  const mods = [];
  for (const id of fateIds) for (const e of content.byId.get(id)?.effects || []) if (e.stat !== 'qiGain') mods.push({ source: id, stat: e.stat, ...(e.flat ? { flat: e.flat } : { permille: e.permille }) });
  return mods;
}
export function fateQiGain(content, fateIds = []) {
  let sum = 0;
  for (const id of fateIds) for (const e of content.byId.get(id)?.effects || []) if (e.stat === 'qiGain') sum += e.permille;
  return sum;
}
