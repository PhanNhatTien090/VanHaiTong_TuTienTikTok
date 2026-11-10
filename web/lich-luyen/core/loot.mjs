// Lịch luyện — rơi đồ và thưởng ải. Thuần: seed từ trận → cùng trận cùng đồ (server và người chơi tra lại được).
import { createRng } from './rng.mjs';

export const STAR_SHARE = Object.freeze([0, 60, 80, 100]); // % thưởng theo sao
export const SWEEP_SHARE = 70;                               // % khi quét/tự động

export function starsFor(result) {
  if (!result.complete || !result.victory) return 0;
  return result.hpLeft >= 600 ? 3 : result.hpLeft >= 300 ? 2 : 1;
}

// Thưởng cơ bản theo sao (hoặc quét). Trả về {qi, linhThach}.
export function stageReward(stage, stars, { sweep = false } = {}) {
  const share = sweep ? SWEEP_SHARE : STAR_SHARE[stars] || 0;
  return { qi: Math.trunc(stage.rewards.qi * share / 100), linhThach: Math.trunc(stage.rewards.linhThach * share / 100) };
}

// Rơi đồ: mỗi dòng lăn một lần theo ‰, số lượng đều trong [min,max]. Quét vẫn rơi (đó là mục đích quét), nhưng theo cùng bảng.
// seed: chuỗi riêng của trận (battleId) → tất định. Trả về {itemId: count}.
export function rollDrops(stage, seed, { firstClear = false } = {}) {
  const rng = createRng('loot:' + seed), out = {};
  for (const d of stage.drops || []) if (rng.chance(d.chance)) out[d.item] = (out[d.item] || 0) + rng.range(d.min, d.max);
  if (firstClear) for (const f of stage.firstClear || []) out[f.item] = (out[f.item] || 0) + f.count;
  return out;
}
