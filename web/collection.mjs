// 18/11/2026 (chủ game): đồ LIVE trên web — THẦN KHÍ (Thiên Công Bảo Khố) + TỌA KỸ.
// Web chỉ XEM và TRANG BỊ (đổi bản mệnh / cưỡi tọa kỹ), không nâng sao, không mở châu, không cầu bảo.
// Chỉ số tính bằng đúng hàm LIVE (public/phap-bao-data.js, public/mounts.js).
import { BAO_ITEMS, BAO_TIER, BAO_LINES, BAO_STAT_NAME, BAO_MAX_STARS, baoItem, baoArt, baoStat, baoBanMenh } from '../public/phap-bao-data.js';
import { MOUNTS, MOUNT_TIERS, MAX_STARS, mountById, mountImage, mountStat } from '../public/mounts.js';

const MOUNT_STAT_NAME = { arena: 'Tỷ thí', war: 'Chính Ma', race: 'Đua kiếm', stones: 'Linh thạch', qi: 'Tu luyện' };
const pct = v => Math.round(v * 10) / 10;

export function baoView(p) {
  const items = p.bao?.items || {}, ban = baoBanMenh(p);
  const owned = Object.keys(items).filter(id => baoItem(id) && items[id] > 0);
  const list = owned.map(id => {
    const it = baoItem(id), stars = items[id];
    return {
      id, name: it.name, tier: it.tier, tierName: BAO_TIER[it.tier].name, tierLabel: BAO_TIER[it.tier].label, color: BAO_TIER[it.tier].color,
      line: BAO_LINES[it.line].name, skill: BAO_LINES[it.line].skill, stars, maxStars: BAO_MAX_STARS, art: baoArt(id),
      stats: Object.keys(it.stats).map(k => ({ key: k, name: BAO_STAT_NAME[k], value: pct(baoStat(id, stars, k)) })),
      ban: ban?.id === id,
    };
  }).sort((a, b) => b.ban - a.ban || b.tier - a.tier || b.stars - a.stars);
  return { items: list, total: BAO_ITEMS.length, ban: ban?.id || null };
}

export function chooseBao(p, id) {
  if (!baoItem(id) || !(p.bao?.items?.[id] > 0)) return { ok: false, message: 'Chưa sở hữu thần khí này.' };
  p.bao.ban = id; // giống lệnh "trang bị <tên thần khí>" trên LIVE (không hồi chờ)
  return { ok: true, message: 'Bản mệnh: ' + baoItem(id).name };
}

export function mountView(p) {
  const own = p.mounts || {};
  const list = MOUNTS.filter(m => own[m.id]).map(m => {
    const stars = Math.max(1, Math.min(MAX_STARS, Number(own[m.id].stars) || 1));
    return {
      id: m.id, name: m.name, tier: m.tier, tierName: MOUNT_TIERS[m.tier].name, color: MOUNT_TIERS[m.tier].color,
      stars, maxStars: MAX_STARS, art: mountImage(m.id), riding: p.mount === m.id,
      stats: Object.keys(m.stats).map(k => ({ key: k, name: MOUNT_STAT_NAME[k] || k, value: pct(mountStat(m.id, stars, k)) })),
    };
  }).sort((a, b) => b.riding - a.riding || ['divine', 'vip', 'common'].indexOf(a.tier) - ['divine', 'vip', 'common'].indexOf(b.tier) || b.stars - a.stars);
  return { items: list, total: MOUNTS.length, riding: p.mount && own[p.mount] ? p.mount : null };
}

export function chooseMount(p, id) {
  if (!id || id === 'none') { p.mount = null; return { ok: true, message: 'Đã xuống tọa kỹ.' }; }
  if (!mountById(id) || !p.mounts?.[id]) return { ok: false, message: 'Chưa sở hữu tọa kỹ này.' };
  p.mount = id; // giống lệnh "toaky <số>" trên LIVE
  return { ok: true, message: 'Cưỡi ' + mountById(id).name };
}

export const treasuryView = p => ({ bao: baoView(p), mounts: mountView(p) });
