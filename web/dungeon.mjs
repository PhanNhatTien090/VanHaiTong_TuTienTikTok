// Bí cảnh (đánh quái) phía máy chủ: cấu hình ải, thể lực, kiểm tra kết quả và trao thưởng.
// Trận đánh chạy ở trình duyệt; máy chủ không tin số liệu gửi lên mà chỉ chấp nhận kết quả hợp lý
// (thời gian tối thiểu theo sức mạnh) và tự tính phần thưởng.
import crypto from 'node:crypto';
import { power, requiredQi, REALMS } from '../engine.mjs';
import { vnDay } from './game-view.mjs';
import { addMats, bumpQuest, enhanceBonus, petCombat, petExtraDps } from './progress.mjs';

export const STAMINA_MAX = 100;
export const STAMINA_REGEN_MS = 5 * 60 * 1000; // hồi 1 thể lực mỗi 5 phút
export const DAILY_QI_SHARE = 0.5; // tu vi từ bí cảnh mỗi ngày tối đa 50% lượng cần để đột phá

// Quái dùng đúng model LIVE: boss-atlas.png (Lôi Hổ, Huyền Vũ, Phượng Hoàng) và celestial-bosses-v1.png (boss thiên giới).
const LIVE_ATLAS = '/assets/boss-atlas.png', CELESTIAL_ATLAS = '/assets/events-v1/celestial-bosses-v1.png';
export const BOSSES = {
  'thunder-tiger': { name: 'Lôi Hổ', faceRight: true, hp: 40, atk: 1.3, atlas: LIVE_ATLAS, cell: 0, element: 'thunder', drops: { 'huyen-thiet': 2, 'linh-qua': 1 } },
  'jade-tortoise': { faceRight: true, name: 'Huyền Vũ Ngọc Giáp', hp: 60, atk: 1.1, atlas: LIVE_ATLAS, cell: 1, element: 'water', drops: { 'huyen-thiet': 3, 'tinh-kim': 1, 'linh-qua': 1 } },
  'crimson-phoenix': { faceRight: true, name: 'Xích Diễm Phượng Hoàng', hp: 50, atk: 1.5, atlas: LIVE_ATLAS, cell: 2, element: 'fire', drops: { 'tinh-kim': 2, 'linh-qua': 2 } },
  'azure-dragon': { faceRight: true, name: 'Thương Long Vân Hải', hp: 55, atk: 1.4, atlas: CELESTIAL_ATLAS, cell: 0, element: 'water', drops: { 'tinh-kim': 3, 'linh-qua': 2 } },
  'sky-kun': { faceRight: false, name: 'Tinh Hải Cự Côn', hp: 70, atk: 1.2, atlas: CELESTIAL_ATLAS, cell: 1, element: 'thunder', drops: { 'tinh-kim': 2, 'long-tuy': 1, 'linh-qua': 2 } },
  'moon-fox': { faceRight: true, name: 'Cửu Vĩ Nguyệt Hồ', hp: 55, atk: 1.6, atlas: CELESTIAL_ATLAS, cell: 2, element: 'fire', drops: { 'long-tuy': 2, 'linh-qua': 3 } },
};
export const ZONES = [
  { id: 'z1', name: 'Thanh Ngọc Hồ', minRealm: 0, bg: '/art/zone1/bg.png', fg: '/art/zone1/fg.png', ground: [585, 768], bosses: ['thunder-tiger', 'jade-tortoise', 'crimson-phoenix'] },
  { id: 'z2', name: 'Vô Tận Tinh Vực', minRealm: 3, bg: '/art/zone2/bg.png', fg: null, ground: [508, 572], bosses: ['azure-dragon', 'sky-kun', 'moon-fox'], needs: 'z1' },
];
for (const z of ZONES) z.stages = z.bosses.length;

// Sức mạnh khuyến nghị theo cấp ải (cấp tăng dần qua các vùng).
export const recPower = level => Math.round(8 + 6 * (level - 1) + 0.08 * (level - 1) ** 2);

export function stageInfo(zoneId, stage) {
  const zi = ZONES.findIndex(z => z.id === zoneId);
  const zone = ZONES[zi];
  if (!zone || !Number.isInteger(stage) || stage < 1 || stage > zone.stages) return null;
  const level = zi * 10 + stage * 3 - 2, rec = recPower(level);
  const type = zone.bosses[stage - 1], base = BOSSES[type];
  const boss = stage === zone.stages;
  const waves = [{ enemies: [{ type, boss: true, name: base.name, atlas: base.atlas, cell: base.cell, element: base.element, faceRight: base.faceRight, hp: Math.round(base.hp * rec), atk: Math.max(1, Math.round(base.atk * rec * 0.55)) }] }];
  const totalHp = waves.reduce((s, w) => s + w.enemies.reduce((a, e) => a + e.hp, 0), 0);
  return { zone: zone.id, zoneName: zone.name, stage, level, boss, recPower: rec, waves, totalHp, cost: boss ? 10 : 6, bg: zone.bg, fg: zone.fg, ground: zone.ground, drops: base.drops };
}

// Chỉ số chiến đấu của người chơi, suy ra từ sức mạnh LIVE (cảnh giới, bí pháp, pháp bảo).
// Cộng thêm cường hóa pháp bảo và linh thú trợ chiến (chỉ trong bí cảnh web).
export function combatStats(p) {
  const pw = power(p), en = enhanceBonus(p);
  return { power: pw + en.attack, basePower: pw, attack: pw + en.attack, enhance: en.level, maxHp: 220 + 40 * p.realm + pw * 3 + en.hp, realm: p.realm, realmName: REALMS[p.realm], pet: petCombat(p) };
}

function webState(p, now) {
  const s = (p.web ??= {});
  s.stamina ??= STAMINA_MAX;
  s.staminaAt ??= now;
  if (s.stamina < STAMINA_MAX) {
    const gained = Math.floor((now - s.staminaAt) / STAMINA_REGEN_MS);
    if (gained > 0) { s.stamina = Math.min(STAMINA_MAX, s.stamina + gained); s.staminaAt += gained * STAMINA_REGEN_MS; }
  } else s.staminaAt = now;
  s.dungeon ??= {};
  const day = vnDay(now);
  if (s.day !== day) { s.day = day; s.dailyQi = 0; }
  return s;
}

export function staminaView(p, now = Date.now()) {
  const s = webState(p, now);
  return { stamina: s.stamina, max: STAMINA_MAX, nextAt: s.stamina < STAMINA_MAX ? s.staminaAt + STAMINA_REGEN_MS : null };
}

export function dungeonView(p, now = Date.now()) {
  const s = webState(p, now);
  return {
    stamina: staminaView(p, now),
    stats: combatStats(p),
    dailyQi: s.dailyQi || 0, dailyQiCap: Math.round(requiredQi(p) * DAILY_QI_SHARE),
    zones: ZONES.map(z => {
      const prog = s.dungeon[z.id] || { cleared: 0, stars: {} };
      return {
        id: z.id, name: z.name, minRealm: z.minRealm, minRealmName: REALMS[z.minRealm], locked: zoneLocked(p, s, z), needs: z.needs || null,
        stages: Array.from({ length: z.stages }, (_, i) => {
          const st = stageInfo(z.id, i + 1);
          const base = BOSSES[z.bosses[i]];
          return { stage: i + 1, boss: st.boss, name: base.name, atlas: base.atlas, cell: base.cell, drops: base.drops, recPower: st.recPower, cost: st.cost, stars: prog.stars[i + 1] || 0, unlocked: !zoneLocked(p, s, z) && i + 1 <= prog.cleared + 1 };
        }),
      };
    }),
  };
}

// Vùng mở khi đủ cảnh giới và đã vượt hết vùng trước.
function zoneLocked(p, s, z) {
  if (p.realm < z.minRealm) return true;
  if (!z.needs) return false;
  const prev = ZONES.find(x => x.id === z.needs);
  return (s.dungeon[z.needs]?.cleared || 0) < prev.stages;
}

function rewardFor(p, info, s, first) {
  const cap = Math.round(requiredQi(p) * DAILY_QI_SHARE);
  // Mạnh hơn ải quá nhiều thì nhận ít tu vi hơn (tránh cày ải dễ để lên cảnh giới).
  const gap = Math.min(1, (info.recPower * 2) / Math.max(1, power(p)));
  let qi = Math.round(requiredQi(p) * (info.boss ? 0.08 : 0.04) * (first ? 2 : 1) * gap);
  qi = Math.max(0, Math.min(qi, cap - (s.dailyQi || 0)));
  return {
    qi,
    stones: Math.round((5 + info.level * 2) * (info.boss ? 3 : 1) * (first ? 2 : 1)),
    herbs: 1 + Math.floor(info.level / 3) + (info.boss ? 3 : 0),
    mats: Object.fromEntries(Object.entries(info.drops || {}).map(([k, v]) => [k, v * (first ? 2 : 1)])),
    capped: qi === 0,
  };
}
function grant(w, p, r, s) {
  p.qi += r.qi; p.totalQi += r.qi; w.sectQi = (w.sectQi || 0) + r.qi;
  p.stones += r.stones; p.herbs += r.herbs;
  addMats(p, r.mats || {});
  s.dailyQi = (s.dailyQi || 0) + r.qi;
}

// Trận sự kiện bản web: cùng loại boss LIVE đang mở, nhưng là bản riêng cho người chơi web.
export function eventInfo(ev, p) {
  const base = BOSSES[ev?.species];
  if (!base) return null;
  const zone = ZONES.find(z => z.bosses.includes(ev.species)) || ZONES[0];
  const rec = Math.max(8, Math.round(combatStats(p).power * 0.85));
  const enemy = { type: ev.species, boss: true, name: base.name, atlas: base.atlas, cell: base.cell, element: base.element, faceRight: base.faceRight, hp: Math.round(base.hp * rec * 1.1), atk: Math.max(1, Math.round(base.atk * rec * 0.55)) };
  return { zone: zone.id, zoneName: 'Sự kiện LIVE', stage: 0, level: 0, boss: true, event: true, eventId: ev.id, recPower: rec, waves: [{ enemies: [enemy] }], totalHp: enemy.hp, cost: 0, bg: zone.bg, fg: zone.fg, ground: zone.ground, drops: Object.fromEntries(Object.entries(base.drops).map(([k, v]) => [k, v * 2])) };
}

// ---------- Tháp Trấn Yêu: leo tầng không giới hạn, boss LIVE thay phiên, mạnh dần ----------
export const TOWER_ORDER = ['thunder-tiger', 'jade-tortoise', 'crimson-phoenix', 'azure-dragon', 'sky-kun', 'moon-fox'];
export const TOWER_DAILY = 10;
export function towerInfo(floor) {
  const type = TOWER_ORDER[(floor - 1) % TOWER_ORDER.length], base = BOSSES[type];
  const zone = ZONES.find(z => z.bosses.includes(type)) || ZONES[0];
  const rec = recPower(floor);
  const enemy = { type, boss: true, name: base.name, atlas: base.atlas, cell: base.cell, element: base.element, faceRight: base.faceRight, hp: Math.round(base.hp * rec * 1.15), atk: Math.max(1, Math.round(base.atk * rec * 0.6)) };
  const milestone = floor % 5 === 0;
  const drops = { ...base.drops };
  if (milestone) { drops['tinh-kim'] = (drops['tinh-kim'] || 0) + 2; drops['long-tuy'] = (drops['long-tuy'] || 0) + (floor % 10 === 0 ? 1 : 0); }
  return { zone: zone.id, zoneName: 'Tháp Trấn Yêu', stage: floor, floor, level: floor, boss: true, tower: true, recPower: rec, waves: [{ enemies: [enemy] }], totalHp: enemy.hp, cost: 0, bg: zone.bg, fg: zone.fg, ground: zone.ground, drops };
}
function towerState(s, now) {
  const day = vnDay(now);
  s.tower ??= { best: 0 };
  if (s.tower.day !== day) { s.tower.day = day; s.tower.used = 0; }
  return s.tower;
}
export function towerView(p, now = Date.now()) {
  const s = webState(p, now), t = towerState(s, now), next = towerInfo(t.best + 1);
  const e = next.waves[0].enemies[0];
  return { best: t.best, next: t.best + 1, left: Math.max(0, TOWER_DAILY - t.used), daily: TOWER_DAILY, boss: { name: e.name, atlas: e.atlas, cell: e.cell }, recPower: next.recPower, drops: next.drops, power: combatStats(p).power };
}
export function towerRanking(players, limit = 20) {
  return players.filter(p => (p.web?.tower?.best || 0) > 0).sort((a, b) => b.web.tower.best - a.web.tower.best).slice(0, limit)
    .map(p => ({ id: p.id, name: p.name, realmName: REALMS[p.realm], floor: p.web.tower.best }));
}

export function createDungeon() {
  const battles = new Map(); // id → trận đang diễn ra (trong bộ nhớ, hết hạn sau 30 phút)
  setInterval(() => { const now = Date.now(); for (const [id, b] of battles) if (now - b.startedAt > 30 * 60000) battles.delete(id); }, 60000).unref();

  function start(w, p, zoneId, stage, now = Date.now()) {
    const info = stageInfo(zoneId, Number(stage));
    if (!info) return { ok: false, message: 'Ải không tồn tại.' };
    const zone = ZONES.find(z => z.id === zoneId);
    const s = webState(p, now);
    if (p.realm < zone.minRealm) return { ok: false, message: `Cần cảnh giới ${REALMS[zone.minRealm]}.` };
    if (zoneLocked(p, s, zone)) return { ok: false, message: 'Hãy vượt hết vùng trước.' };
    const prog = s.dungeon[zoneId] || { cleared: 0, stars: {} };
    if (info.stage > prog.cleared + 1) return { ok: false, message: 'Hãy vượt ải trước đó.' };
    if (s.stamina < info.cost) return { ok: false, message: `Không đủ thể lực (cần ${info.cost}).` };
    for (const [id, b] of battles) if (b.playerId === p.id) battles.delete(id); // một trận một lúc
    const id = crypto.randomBytes(12).toString('hex');
    const stats = combatStats(p);
    // Sát thương tối đa/giây khi đánh liên tục + chiêu thức; thời gian tối thiểu để hạ hết quái.
    const maxDps = stats.attack * (6 + (stats.pet ? stats.pet.mult + petExtraDps(stats.pet) : 0));
    battles.set(id, { id, playerId: p.id, zoneId, stage: info.stage, startedAt: now, minMs: Math.max(4000, (info.totalHp / maxDps) * 1000 * 0.6) });
    return { ok: true, battleId: id, info, stats };
  }

  function startTower(w, p, now = Date.now()) {
    const s = webState(p, now), t = towerState(s, now);
    if (t.used >= TOWER_DAILY) return { ok: false, message: 'Hôm nay đã hết lượt leo tháp. Mai quay lại nhé!' };
    const info = towerInfo(t.best + 1);
    for (const [id, b] of battles) if (b.playerId === p.id) battles.delete(id);
    const id = crypto.randomBytes(12).toString('hex'), stats = combatStats(p);
    const maxDps = stats.attack * (6 + (stats.pet ? stats.pet.mult + petExtraDps(stats.pet) : 0));
    battles.set(id, { id, playerId: p.id, tower: info, startedAt: now, minMs: Math.max(4000, (info.totalHp / maxDps) * 1000 * 0.6) });
    return { ok: true, battleId: id, info, stats };
  }
  function finishTower(w, p, b, body, now) {
    const s = webState(p, now), t = towerState(s, now), info = b.tower;
    t.used++;
    if (body.victory !== true) return { ok: true, victory: false, staminaSpent: 0, tower: true };
    if (now - b.startedAt < b.minMs) return { ok: false, message: 'Kết quả trận đánh không hợp lệ.' };
    if (info.floor !== t.best + 1) return { ok: false, message: 'Tầng tháp không hợp lệ.' };
    t.best = info.floor;
    const hpLeft = Math.max(0, Math.min(1, Number(body.hpLeft) || 0));
    const stars = hpLeft >= 0.6 ? 3 : hpLeft >= 0.3 ? 2 : 1;
    const reward = { qi: 0, stones: 10 + info.floor * 4, herbs: 1 + Math.floor(info.floor / 4), mats: info.drops, capped: false };
    grant(w, p, reward, s);
    bumpQuest(p, 'clear', 1, now);
    return { ok: true, victory: true, stars, first: true, tower: true, floor: info.floor, reward, elapsedMs: now - b.startedAt, staminaSpent: 0 };
  }

  function startEvent(w, p, ev, now = Date.now()) {
    if (!ev || ev.kind !== 'boss') return { ok: false, message: 'LIVE hiện không có boss.' };
    const s = webState(p, now);
    s.eventsWon ??= {};
    if (s.eventsWon[ev.id]) return { ok: false, message: 'Bạn đã hạ boss sự kiện này rồi. Chờ sự kiện sau nhé!' };
    const info = eventInfo(ev, p);
    if (!info) return { ok: false, message: 'Boss này chưa có bản web.' };
    for (const [id, b] of battles) if (b.playerId === p.id) battles.delete(id);
    const id = crypto.randomBytes(12).toString('hex');
    const stats = combatStats(p);
    const maxDps = stats.attack * (6 + (stats.pet ? stats.pet.mult + petExtraDps(stats.pet) : 0));
    battles.set(id, { id, playerId: p.id, event: info, startedAt: now, minMs: Math.max(4000, (info.totalHp / maxDps) * 1000 * 0.6) });
    return { ok: true, battleId: id, info, stats };
  }

  function finish(w, p, body, now = Date.now(), { noReward = false } = {}) {
    const b = battles.get(String(body.battleId || ''));
    if (!b || b.playerId !== p.id) return { ok: false, message: 'Trận đánh không hợp lệ hoặc đã kết thúc.' };
    battles.delete(b.id);
    if (b.event) return finishEvent(w, p, b, body, now);
    if (b.tower) return finishTower(w, p, b, body, now);
    const info = stageInfo(b.zoneId, b.stage);
    const s = webState(p, now);
    const elapsed = now - b.startedAt;
    const victory = body.victory === true;
    if (!victory) { s.stamina = Math.max(0, s.stamina - Math.ceil(info.cost / 2)); return { ok: true, victory: false, staminaSpent: Math.ceil(info.cost / 2) }; }
    if (elapsed < b.minMs) return { ok: false, message: 'Kết quả trận đánh không hợp lệ.' };
    const hpLeft = Math.max(0, Math.min(1, Number(body.hpLeft) || 0));
    const par = Math.max(b.minMs * 3, 45000);
    const stars = hpLeft >= 0.6 && elapsed <= par ? 3 : hpLeft >= 0.3 ? 2 : 1;
    s.stamina -= info.cost;
    const prog = (s.dungeon[b.zoneId] ??= { cleared: 0, stars: {} });
    const first = info.stage > prog.cleared;
    prog.cleared = Math.max(prog.cleared, info.stage);
    prog.stars[info.stage] = Math.max(prog.stars[info.stage] || 0, stars);
    const reward = noReward ? { qi: 0, stones: 0, herbs: 0, mats: {}, capped: false, trial: true } : rewardFor(p, info, s, first);
    if (!noReward) grant(w, p, reward, s);
    bumpQuest(p, 'clear', 1, now);
    if (stars === 3) bumpQuest(p, 'star3', 1, now);
    p.lastWebAt = now; // KHÔNG đổi lastActive: người chơi web không hiện lên LIVE
    return { ok: true, victory: true, stars, first, reward, elapsedMs: elapsed, staminaSpent: info.cost };
  }

  function finishEvent(w, p, b, body, now) {
    const s = webState(p, now), info = b.event;
    if (body.victory !== true) return { ok: true, victory: false, staminaSpent: 0 };
    if (now - b.startedAt < b.minMs) return { ok: false, message: 'Kết quả trận đánh không hợp lệ.' };
    s.eventsWon ??= {};
    if (s.eventsWon[info.eventId]) return { ok: false, message: 'Đã nhận thưởng sự kiện này.' };
    s.eventsWon[info.eventId] = now;
    const keys = Object.keys(s.eventsWon); if (keys.length > 60) for (const k of keys.slice(0, keys.length - 60)) delete s.eventsWon[k];
    const hpLeft = Math.max(0, Math.min(1, Number(body.hpLeft) || 0));
    const stars = hpLeft >= 0.6 ? 3 : hpLeft >= 0.3 ? 2 : 1;
    const reward = rewardFor(p, info, s, true);
    grant(w, p, reward, s);
    bumpQuest(p, 'clear', 1, now);
    if (stars === 3) bumpQuest(p, 'star3', 1, now);
    return { ok: true, victory: true, stars, first: true, event: true, reward, elapsedMs: now - b.startedAt, staminaSpent: 0 };
  }

  // Quét ải đã đạt 3 sao: nhận thưởng ngay, vẫn tốn thể lực và tính trần tu vi ngày.
  function sweep(w, p, zoneId, stage, now = Date.now()) {
    const info = stageInfo(zoneId, Number(stage));
    if (!info) return { ok: false, message: 'Ải không tồn tại.' };
    const s = webState(p, now);
    if ((s.dungeon[zoneId]?.stars?.[info.stage] || 0) < 3) return { ok: false, message: 'Cần đạt 3 sao để quét ải.' };
    if (s.stamina < info.cost) return { ok: false, message: `Không đủ thể lực (cần ${info.cost}).` };
    s.stamina -= info.cost;
    const reward = rewardFor(p, info, s, false);
    grant(w, p, reward, s);
    bumpQuest(p, 'clear', 1, now);
    return { ok: true, reward, staminaSpent: info.cost };
  }

  return { start, startEvent, startTower, finish, sweep, battles };
}
