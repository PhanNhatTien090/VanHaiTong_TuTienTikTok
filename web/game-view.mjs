// Dựng dữ liệu cho giao diện web từ thế giới game (engine.mjs). Chỉ đọc, không thay đổi thế giới.
import { CATALOG, REALMS, requiredQi, requiredStones, readyToBreak, finalRealmEligible, power, title } from '../engine.mjs';
import { SKINS, skinFor, nextSkin } from '../public/cosmetics.js';
import { SPECIAL_SKINS } from '../public/patrons.js';
import { VIP_TIERS, vipTier } from '../public/vip.js';

// Hồi chiêu dùng trong engine (ms). Giữ đồng bộ với action() trong engine.mjs.
export const COOLDOWNS = { cultivate: 10000, gather: 30000, attack: 4000, pill: 3000, skin: 10000 };

export const vnDay = now => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);

function cooldownsFor(p, now) {
  const out = {};
  for (const [key, ms] of Object.entries(COOLDOWNS)) out[key] = Math.max(0, (p.cooldowns?.[key] || 0) + ms - now);
  return out;
}

function itemView(p, x) {
  const owned = x.type === 'manual' ? p.manuals.includes(x.id)
    : x.type === 'artifact' ? p.artifacts.includes(x.id)
    : (p.pills?.[x.id] || 0) > 0;
  return {
    id: x.id, type: x.type, name: x.name, icon: x.icon, description: x.description || '',
    tier: x.tier, realmName: REALMS[x.tier] || REALMS[0],
    price: x.price || 0, herbs: x.herbs || 0, damage: x.damage || 0, bonus: x.bonus || 0, qi: x.qi || 0,
    exclusive: !!x.exclusive,
    source: x.exclusive ? (x.eventReward ? 'Sự kiện: ' + x.eventReward : x.loyaltyMinutes ? 'Tri ân người chơi lâu năm' : 'Phần thưởng đặc biệt') : null,
    owned, count: x.type === 'pill' ? p.pills?.[x.id] || 0 : undefined,
    equipped: p.equipped === x.id || (p.equippedExtra || []).includes(x.id),
    locked: !x.exclusive && p.realm < x.tier,
    affordable: !x.exclusive && p.stones >= (x.price || 0) && p.herbs >= (x.herbs || 0),
  };
}

function skinsView(p) {
  const giftSkin = skinFor(p.giftCoins);
  const owned = new Set(p.rewardSkins || []);
  return {
    current: p.skinChoice && owned.has(p.skinChoice) ? p.skinChoice : null,
    giftTier: giftSkin.id,
    nextGiftTier: nextSkin(p.giftCoins),
    giftTiers: SKINS.map(s => ({ id: s.id, name: s.name, min: s.min, vfx: s.vfx, color: s.color, robe: s.robe, unlocked: (p.giftCoins || 0) >= s.min })),
    special: SPECIAL_SKINS.map(s => ({ id: s.id, name: s.id === 'vuonglam-avatar' ? (p.gender === 'nu' ? 'Lý Mộ Uyển' : 'Vương Lâm') : s.name, vfx: s.vfx, color: s.color, robe: s.robe, owned: owned.has(s.id) })),
  };
}

export function playerView(w, p, now = Date.now()) {
  const vip = vipTier(p.giftCoins);
  return {
    id: p.id, name: p.name, gender: p.gender, address: title(p.gender),
    realm: p.realm, realmName: REALMS[p.realm], nextRealmName: REALMS[p.realm + 1] || null, maxRealm: p.realm >= REALMS.length - 1,
    qi: p.qi, totalQi: p.totalQi, stones: p.stones, herbs: p.herbs,
    neededQi: requiredQi(p), neededStones: requiredStones(p),
    ready: readyToBreak(p), finalRealmEligible: finalRealmEligible(p),
    power: power(p), giftCoins: p.giftCoins || 0, interactions: p.interactions || 0,
    vip: vip ? { tier: vip, name: VIP_TIERS[vip]?.name, bonus: VIP_TIERS[vip]?.bonus } : null,
    buff: p.buffUntil > now ? { mult: p.buffMult, until: p.buffUntil } : null,
    checkedInToday: p.day === vnDay(now),
    cooldowns: cooldownsFor(p, now),
    equipped: p.equipped,
    fromTikTok: !String(p.id).startsWith('web-'),
    joinedAt: p.joinedAt,
  };
}

export function inventoryView(w, p) {
  const items = CATALOG.map(x => itemView(p, x));
  return {
    manuals: items.filter(x => x.type === 'manual'),
    artifacts: items.filter(x => x.type === 'artifact'),
    pills: items.filter(x => x.type === 'pill'),
    skins: skinsView(p),
  };
}

export function bossView(w, now = Date.now()) {
  const b = w.boss;
  if (!b || b.endsAt <= now || b.hp <= 0) return { active: false, nextAt: w.nextBossAt || null };
  return { active: true, name: b.name, hp: b.hp, maxHp: b.maxHp, endsAt: b.endsAt, participants: Object.keys(b.participants || {}).length };
}

// Bảng xếp hạng web: chỉ người đã có tài khoản web. Bảng LIVE vẫn do server LIVE giữ nguyên như cũ.
export function webRanking(w, accounts, limit = 50) {
  const rows = [];
  for (const u of accounts) {
    const p = u.playerId && Object.hasOwn(w.players, u.playerId) ? w.players[u.playerId] : null;
    if (p) rows.push({ id: p.id, name: p.name, realm: p.realm, realmName: REALMS[p.realm], totalQi: p.totalQi, power: power(p) });
  }
  return rows.sort((a, b) => b.realm - a.realm || b.totalQi - a.totalQi).slice(0, limit);
}
