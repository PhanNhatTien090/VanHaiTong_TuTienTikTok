// Lịch luyện — thang tu luyện. Hàm thuần: nhận trạng thái + nội dung, trả trạng thái mới. Không đọc giờ, không ngẫu nhiên.
//
// Thang (ladder) = dãy bậc phẳng: Phàm Nhân · Luyện Khí Tầng 1..9 · Viên Mãn · Trúc Cơ Sơ/Trung/Hậu/Viên Mãn · …
// Mỗi bậc có `qi` = tu vi cần để rời bậc. Bậc cuối của một đại cảnh có `gate`:
//   'breakthrough' → cần đột phá (vật phẩm, có thể có thử thách) để vào đại cảnh sau
//   'season'       → trần của mùa hiện tại
//   'end'          → hết thang
// Trạng thái phân thân: { step, qi } (qi = tu vi đã tích ở bậc hiện tại, số nguyên).
import { t } from '../content/index.js';

const STAGE_KEYS = {
  'pham-nhan': () => ['stage.pham-nhan'],
  tang: () => [...Array.from({ length: 9 }, () => 'stage.tang'), 'stage.vien-man'],
  ky: () => ['stage.so-ky', 'stage.trung-ky', 'stage.hau-ky', 'stage.vien-man'],
};
const MAX_QI = Math.floor(Number.MAX_SAFE_INTEGER / 1000); // chừa chỗ nhân hệ số mà không tràn

// season: số mùa đang chạy; null = không giới hạn (dùng cho test/giả lập).
export function buildLadder(content, season = null) {
  const steps = [];
  let q = content.curve.firstQi;
  content.realms.forEach((realm, realmIndex) => {
    const curve = { ...content.curve, ...(realm.curve || {}) };
    if (realmIndex > 0) q = Math.trunc(q * curve.realmJump / 100);
    const keys = STAGE_KEYS[realm.stages]();
    keys.forEach((stageKey, stageIndex) => {
      if (stageIndex > 0) q = Math.trunc(q * curve.stageGrowth / 100);
      if (!Number.isSafeInteger(q) || q > MAX_QI) throw RangeError(`Tu vi cần ở ${realm.id} bậc ${stageIndex} vượt giới hạn số (${q}); giảm hệ số đường cong`);
      steps.push({ index: steps.length, realmId: realm.id, realmIndex, stageIndex, stageKey, tangNo: stageKey === 'stage.tang' ? stageIndex + 1 : null, qi: q, gate: null });
    });
  });
  // Cổng ở bậc cuối mỗi đại cảnh
  const openUntil = season === null ? Infinity : content.realms.reduce((m, r, i) => (r.openSeason !== null && r.openSeason <= season ? i : m), 0);
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i], next = steps[i + 1];
    if (next && next.realmIndex === s.realmIndex) continue;
    s.gate = !next ? 'end' : next.realmIndex > openUntil ? 'season' : 'breakthrough';
  }
  return Object.freeze(steps.map(Object.freeze));
}

export function stepLabel(content, step) {
  const realm = content.byId.get(step.realmId);
  const stage = t(content, step.stageKey, { n: step.tangNo });
  return step.stageKey === 'stage.pham-nhan' ? stage : t(content, realm.nameKey) + ' ' + stage;
}

export const newCultivation = () => ({ step: 0, qi: 0 });

// Cộng tu vi. Tự lên tiểu cảnh; dừng ở bậc có cổng (tu vi ở đó không vượt quá mức cần, phần thừa bỏ).
export function addQi(state, amount, ladder) {
  if (!Number.isSafeInteger(amount) || amount < 0) throw RangeError('addQi: lượng tu vi phải là số nguyên ≥ 0');
  let { step, qi } = state, advanced = 0, wasted = 0;
  qi += amount;
  for (;;) {
    const s = ladder[step];
    if (qi < s.qi) break;
    if (s.gate) { wasted = qi - s.qi; qi = s.qi; break; }
    qi -= s.qi; step++; advanced++;
  }
  return { state: { step, qi }, advanced, wasted, ready: !!ladder[step].gate && qi >= ladder[step].qi, gate: ladder[step].gate };
}

// Phẩm đạt được với số loại vật phẩm đột phá đang có (lấy phẩm cao nhất đủ điều kiện).
export function qualityFor(realm, materialTypes) {
  let best = null;
  for (const q of realm.qualities) if (materialTypes >= q.materials) best = q;
  return best;
}

// Đột phá vào đại cảnh sau. opts: { materialTypes, trialPassed }.
export function breakthrough(state, ladder, content, opts = {}) {
  const s = ladder[state.step];
  if (s.gate !== 'breakthrough') return { ok: false, code: s.gate === 'season' ? 'SEASON_CAP' : s.gate === 'end' ? 'END' : 'NOT_GATE' };
  if (state.qi < s.qi) return { ok: false, code: 'NEED_QI', need: s.qi - state.qi };
  const target = content.realms[s.realmIndex + 1];
  const quality = qualityFor(target, Math.max(0, Math.trunc(opts.materialTypes || 0)));
  if (!quality) return { ok: false, code: 'NEED_MATERIALS', need: target.qualities[0].materials };
  if (target.trial && !opts.trialPassed) return { ok: false, code: 'NEED_TRIAL', trial: target.trial };
  return { ok: true, state: { step: state.step + 1, qi: 0 }, realmId: target.id, quality: quality.id, points: quality.points, fatePicks: quality.fatePicks };
}
