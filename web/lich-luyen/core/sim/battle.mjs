// Lịch luyện — MÔ PHỎNG TRẬN TẤT ĐỊNH. Chạy y hệt ở trình duyệt (để chơi) và server (để kiểm tra).
// Luật bắt buộc: chỉ số nguyên; ngẫu nhiên chỉ qua state.rng; duyệt thực thể theo thứ tự tạo; không đọc giờ thật.
// Mọi chiêu/quái/ải là dữ liệu trong content/; ở đây chỉ có các LOẠI đòn, hiệu ứng, AI.
import { createRng } from '../rng.mjs';
import { POS, DIR_COUNT, dirVec, step, mulDiv, dist2, dirTo, clamp, isqrt } from '../fixed.mjs';
import { stableJson, fnv64 } from '../../content/index.js';
import { TICK_RATE, BTN, validFrame } from './inputs.mjs';

const perTick = pxPerSec => Math.trunc(pxPerSec * POS / TICK_RATE); // px/giây → đơn vị/nhịp
const px = n => n * POS;
const MP_REGEN_EVERY = 6;      // +1 linh lực mỗi 6 nhịp (5/giây)
const AUTO_AIM_RANGE = px(650);

// Chỉ số ra trận: { hp, mp, atk, def, spd (px/giây), crit (‰), critDmg (‰, 1500 = ×1,5) }
export function scaleMonster(m, level) {
  const k = 100 + 15 * (level - 1); // +15% mỗi cấp ải
  return { hp: mulDiv(m.stats.hp, k, 100), mp: 0, atk: mulDiv(m.stats.atk, k, 100), def: mulDiv(m.stats.def, k, 100), spd: m.speed, crit: m.stats.crit, critDmg: m.stats.critDmg };
}

function makeEntity(state, team, x, y, radius, stats, skills, extra = {}) {
  const e = {
    id: state.nextId++, team, x, y, r: px(radius),
    hp: stats.hp, maxHp: stats.hp, mp: stats.mp || 0, maxMp: stats.mp || 0,
    atk: stats.atk, def: stats.def, spd: perTick(stats.spd), crit: stats.crit, critDmg: stats.critDmg,
    face: 0, cds: {}, skills, stun: 0, invuln: 0, dash: null, burns: [], alive: true, ...extra,
  };
  state.entities.push(e);
  return e;
}

// setup: { seed, stageId, player: { pathId, stats }, maxTicks? }
export function createBattle(content, setup) {
  const stage = content.byId.get(setup.stageId);
  if (!stage || !Array.isArray(stage.waves)) throw Error('Ải không tồn tại: ' + setup.stageId);
  const path = content.byId.get(setup.player.pathId);
  if (!path || !path.kit) throw Error('Đạo lộ không tồn tại: ' + setup.player.pathId);
  const state = {
    contentVersion: content.version, stageId: stage.id, tick: 0, nextId: 1,
    maxTicks: Math.min(setup.maxTicks ?? stage.timeLimit * TICK_RATE, stage.timeLimit * TICK_RATE),
    w: px(stage.arena[0]), h: px(stage.arena[1]), level: stage.level,
    rng: createRng('battle:' + setup.seed), entities: [], shots: [], zones: [], wave: 0,
    // Hiểm họa (sét kiếp, độc vụ…): lịch trong dữ liệu ải; vòng báo trước rồi mới giáng. trial = sống sót tới survive giây là thắng.
    hazards: [], hazardNext: 0, kind: stage.kind || 'normal', surviveTicks: (stage.survive || 0) * TICK_RATE,
    stats: { dealt: 0, taken: 0, kills: 0, hits: 0 }, events: [], over: false, victory: false,
  };
  const kit = path.kit;
  state.player = makeEntity(state, 'player', px(stage.playerStart[0]), px(stage.playerStart[1]), 20, setup.player.stats,
    { attack: kit.attack, special: kit.special, dash: kit.dash });
  if (stage.waves.length) spawnWave(content, state, stage, 0);
  return state;
}

// Lịch hiểm họa: tới nhịp `at` thì đặt `count` vòng báo trước; sau `delay` nhịp giáng xuống, trúng người chơi mất dmg ‰ khí huyết tối đa
// (sát thương thật, không trừ thủ — thiên kiếp không nể ai). aim: 'player' (vòng đầu đúng chỗ đứng, vòng sau lệch trong spread px) | 'random'.
function scheduleHazards(content, state) {
  const list = content.byId.get(state.stageId).hazards || [];
  while (state.hazardNext < list.length && list[state.hazardNext].at <= state.tick) {
    const h = list[state.hazardNext++], p = state.player;
    for (let k = 0; k < h.count; k++) {
      let x, y;
      if (h.aim === 'player') {
        const off = k === 0 ? 0 : px(h.spread || 0);
        x = p.x + (off ? state.rng.range(-off, off) : 0); y = p.y + (off ? state.rng.range(-off, off) : 0);
      } else { x = state.rng.range(0, state.w); y = state.rng.range(0, state.h); }
      state.hazards.push({ id: state.nextId++, x: clamp(x, 0, state.w), y: clamp(y, 0, state.h), r: px(h.radius), left: h.delay, total: h.delay, dmg: h.dmg, fx: h.fx || 'lightning' });
    }
  }
}
function resolveHazards(state) {
  const p = state.player;
  for (const z of state.hazards) {
    if (--z.left > 0) continue;
    state.events.push({ t: state.tick, type: 'strike', x: z.x, y: z.y, r: z.r, fx: z.fx });
    const rr = z.r + p.r;
    if (p.alive && p.invuln === 0 && dist2(z.x, z.y, p.x, p.y) <= rr * rr) {
      const dmg = Math.max(1, mulDiv(p.maxHp, z.dmg, 1000));
      p.hp -= dmg; state.stats.taken += dmg; state.stats.struck = (state.stats.struck || 0) + 1;
      if (p.hp <= 0) { p.hp = 0; p.alive = false; state.events.push({ t: state.tick, type: 'death', id: p.id }); }
    }
  }
  state.hazards = state.hazards.filter(z => z.left > 0);
}

function spawnWave(content, state, stage, index) {
  const wave = stage.waves[index]; if (!wave) return;
  state.wave = index;
  for (const sp of wave.spawn) {
    const m = content.byId.get(sp.monster), stats = scaleMonster(m, stage.level);
    for (let i = 0; i < sp.count; i++) {
      // Rải quanh tâm cụm theo vòng tròn: góc đều, bán kính 40px·(i>0)
      const [cx, sy] = dirVec(Math.trunc(i * DIR_COUNT / Math.max(1, sp.count)));
      const rad = i === 0 && sp.count === 1 ? 0 : px(45);
      const x = clamp(px(sp.at[0]) + mulDiv(cx, rad, 10000), 0, state.w), y = clamp(px(sp.at[1]) + mulDiv(sy, rad, 10000), 0, state.h);
      const e = makeEntity(state, 'enemy', x, y, m.radius, stats, { attack: m.skills[0], special: m.skills[1] || null },
        { monster: m.id, ai: m.ai, range: px(m.attackRange), prefer: px(m.preferRange || 0), boss: !!m.boss });
      e.cds.attack = 10 + state.rng.int(30); // quái không ra đòn cùng lúc
      if (e.skills.special) e.cds.special = 90 + state.rng.int(60);
    }
  }
  state.events.push({ t: state.tick, type: 'wave', index });
}

const living = (state, team) => state.entities.filter(e => e.alive && e.team === team);
// Thực thể không bao giờ bị xóa khỏi danh sách (chết chỉ đánh dấu), nên đạn của kẻ đã chết vẫn tra được chủ.
const entityById = (state, id) => state.entities.find(e => e.id === id);

function nearest(state, from, team, maxD2 = Infinity) {
  let best = null, bd = maxD2;
  for (const e of state.entities) { if (!e.alive || e.team !== team) continue; const d = dist2(from.x, from.y, e.x, e.y); if (d < bd) { bd = d; best = e; } }
  return best;
}

function move(state, e, dir, speed) {
  const [nx, ny] = step(e.x, e.y, dir, speed);
  e.x = clamp(nx, e.r, state.w - e.r); e.y = clamp(ny, e.r, state.h - e.r);
}

// ── Hiệu ứng ──
function hit(state, src, target, effects, cx, cy) {
  if (!target.alive || target.invuln > 0) return false;
  state.stats.hits += src.team === 'player' ? 1 : 0;
  for (const fx of effects) {
    if (fx.type === 'damage') damage(state, src, target, mulDiv(src.atk, fx.mult, 100), true);
    else if (fx.type === 'knockback') { if (!target.boss) { const d = dirTo(target.x - cx, target.y - cy); move(state, target, d, px(fx.distance)); } }
    else if (fx.type === 'stun') target.stun = Math.max(target.stun, target.boss ? fx.ticks >> 1 : fx.ticks);
    else if (fx.type === 'burn') target.burns.push({ left: fx.ticks, period: fx.period, next: fx.period, dmg: Math.max(1, mulDiv(src.atk, fx.mult, 100)), src: src.id });
    else if (fx.type === 'heal') src.hp = Math.min(src.maxHp, src.hp + mulDiv(src.atk, fx.mult, 100));
    if (!target.alive) break;
  }
  return true;
}

function damage(state, src, target, base, canCrit) {
  let dmg = Math.max(1, base - (target.def >> 1));
  if (canCrit && state.rng.int(1000) < src.crit) dmg = mulDiv(dmg, src.critDmg, 1000);
  target.hp -= dmg;
  if (src.team === 'player') state.stats.dealt += dmg; else if (target.team === 'player') state.stats.taken += dmg;
  if (target.hp <= 0) {
    target.hp = 0; target.alive = false;
    if (target.team === 'enemy') state.stats.kills++;
    state.events.push({ t: state.tick, type: 'death', id: target.id });
  }
}

function areaHit(state, src, cx, cy, radius, effects) {
  const foe = src.team === 'player' ? 'enemy' : 'player';
  for (const e of state.entities) {
    if (!e.alive || e.team !== foe) continue;
    const rr = radius + e.r;
    if (dist2(cx, cy, e.x, e.y) <= rr * rr) hit(state, src, e, effects, cx, cy);
  }
}

// ── Ra chiêu ──
function cast(content, state, caster, slot, aim) {
  const id = caster.skills[slot]; if (!id) return false;
  const skill = content.byId.get(id);
  if ((caster.cds[slot] || 0) > 0 || caster.mp < skill.mp || caster.stun > 0) return false;
  caster.cds[slot] = skill.cd; caster.mp -= skill.mp;
  const a = skill.action;
  if (a.type === 'dash') { caster.dash = { left: a.ticks, dir: aim, speed: perTick(a.speed) }; caster.invuln = Math.max(caster.invuln, a.invuln); }
  else if (a.type === 'projectile') {
    const count = a.count || 1, spread = a.spread || 0;
    for (let k = 0; k < count; k++) {
      const dir = (aim + Math.trunc(((2 * k - (count - 1)) * spread) / 2) + DIR_COUNT) % DIR_COUNT;
      state.shots.push({ id: state.nextId++, src: caster.id, team: caster.team, x: caster.x, y: caster.y, dir, speed: perTick(a.speed), left: px(a.range), r: px(a.radius), pierce: a.pierce || 1, hitIds: [], effects: skill.effects, explode: a.explode ? px(a.explode.radius) : 0, skill: id });
    }
  } else if (a.type === 'melee') {
    const [cx, sy] = dirVec(aim);
    areaHit(state, caster, caster.x + mulDiv(cx, px(a.offset), 10000), caster.y + mulDiv(sy, px(a.offset), 10000), px(a.radius), skill.effects);
  } else if (a.type === 'nova') areaHit(state, caster, caster.x, caster.y, px(a.radius), skill.effects);
  else if (a.type === 'zone') {
    const [cx, sy] = dirVec(aim);
    state.zones.push({ id: state.nextId++, src: caster.id, x: clamp(caster.x + mulDiv(cx, px(a.offset), 10000), 0, state.w), y: clamp(caster.y + mulDiv(sy, px(a.offset), 10000), 0, state.h), r: px(a.radius), left: a.duration, period: a.period, next: 0, effects: skill.effects, skill: id });
  }
  state.events.push({ t: state.tick, type: 'cast', id: caster.id, skill: id, aim });
  return true;
}

// ── AI quái ──
function think(content, state, e) {
  const target = state.player; if (!target.alive || e.stun > 0) return;
  const d2 = dist2(e.x, e.y, target.x, target.y), toward = dirTo(target.x - e.x, target.y - e.y);
  e.face = toward;
  if (e.skills.special && (e.cds.special || 0) === 0 && d2 <= (e.range * 2) ** 2) { cast(content, state, e, 'special', toward); return; }
  if (e.ai === 'kite') {
    const d = isqrt(d2);
    if (d < e.prefer - px(40)) move(state, e, (toward + DIR_COUNT / 2) % DIR_COUNT, e.spd);
    else if (d > e.range) move(state, e, toward, e.spd);
  } else if (d2 > e.range * e.range) move(state, e, toward, e.spd);
  if (d2 <= (e.range + target.r) ** 2 && (e.cds.attack || 0) === 0) { cast(content, state, e, 'attack', toward); e.cds.attack += state.rng.int(10); }
}

// Một nhịp. input: { dir, buttons }.
export function tick(content, state, input) {
  if (state.over) return state;
  if (!validFrame(input)) throw RangeError('Đầu vào không hợp lệ');
  state.tick++;
  const p = state.player;

  // Hồi chiêu, linh lực, choáng, bất tử
  for (const e of state.entities) {
    if (!e.alive) continue;
    for (const k of Object.keys(e.cds)) if (e.cds[k] > 0) e.cds[k]--;
    if (e.stun > 0) e.stun--;
    if (e.invuln > 0) e.invuln--;
  }
  if (p.alive && state.tick % MP_REGEN_EVERY === 0 && p.mp < p.maxMp) p.mp++;

  // Người chơi
  if (p.alive && p.stun === 0) {
    if (p.dash) { move(state, p, p.dash.dir, p.dash.speed); if (--p.dash.left <= 0) p.dash = null; }
    else {
      if (input.dir >= 0) { move(state, p, input.dir, p.spd); p.face = input.dir; }
      const foe = nearest(state, p, 'enemy', AUTO_AIM_RANGE * AUTO_AIM_RANGE);
      const aim = foe ? dirTo(foe.x - p.x, foe.y - p.y) : p.face;
      if (input.buttons & BTN.DASH) cast(content, state, p, 'dash', input.dir >= 0 ? input.dir : p.face);
      else {
        if (input.buttons & BTN.SPECIAL) cast(content, state, p, 'special', aim);
        if (input.buttons & BTN.ATTACK) cast(content, state, p, 'attack', aim);
      }
    }
  }

  // Quái
  for (const e of state.entities) if (e.alive && e.team === 'enemy') think(content, state, e);

  // Đạn bay
  for (const s of state.shots) {
    if (s.left <= 0) continue;
    const [nx, ny] = step(s.x, s.y, s.dir, s.speed); s.x = nx; s.y = ny; s.left -= s.speed;
    if (s.x < 0 || s.y < 0 || s.x > state.w || s.y > state.h) { s.left = 0; continue; }
    const src = entityById(state, s.src);
    const foe = s.team === 'player' ? 'enemy' : 'player';
    for (const e of state.entities) {
      if (!e.alive || e.team !== foe || s.hitIds.includes(e.id)) continue;
      const rr = s.r + e.r;
      if (dist2(s.x, s.y, e.x, e.y) > rr * rr) continue;
      s.hitIds.push(e.id);
      if (s.explode) areaHit(state, src, s.x, s.y, s.explode, s.effects); else hit(state, src, e, s.effects, s.x, s.y);
      if (--s.pierce <= 0) { s.left = 0; break; }
    }
  }
  state.shots = state.shots.filter(s => s.left > 0);

  // Vùng trận
  for (const z of state.zones) {
    if (z.next <= 0) { areaHit(state, entityById(state, z.src), z.x, z.y, z.r, z.effects); z.next = z.period; }
    z.next--; z.left--;
  }
  state.zones = state.zones.filter(z => z.left > 0);

  // Đốt
  for (const e of state.entities) {
    if (!e.alive || !e.burns.length) continue;
    for (const b of e.burns) { if (--b.next <= 0 && b.left > 0) { b.next = b.period; damage(state, entityById(state, b.src), e, b.dmg, false); if (!e.alive) break; } b.left--; }
    e.burns = e.burns.filter(b => b.left > 0);
  }

  // Hiểm họa
  if (state.hazardNext < (content.byId.get(state.stageId).hazards || []).length) scheduleHazards(content, state);
  if (state.hazards.length) resolveHazards(state);

  // Đợt quái, kết thúc
  if (state.kind === 'trial') { if (p.alive && state.tick >= state.surviveTicks) { state.over = true; state.victory = true; } }
  else if (!living(state, 'enemy').length) {
    const stage = content.byId.get(state.stageId), next = stage.waves[state.wave + 1];
    if (next && next.when === 'clear') spawnWave(content, state, stage, state.wave + 1);
    else if (!next) { state.over = true; state.victory = p.alive; }
  }
  if (!p.alive) { state.over = true; state.victory = false; }
  if (!state.over && state.tick >= state.maxTicks) { state.over = true; state.victory = false; state.timeout = true; }
  if (state.events.length > 200) state.events.splice(0, state.events.length - 200);
  return state;
}

// Tóm tắt kết quả + mã băm trạng thái (so khớp trình duyệt ↔ server).
export function battleResult(state) {
  const p = state.player;
  const core = { t: state.tick, v: state.victory, w: state.wave, s: state.stats, e: state.entities.map(e => [e.id, e.x, e.y, e.hp, e.mp, e.alive ? 1 : 0]), r: state.rng.save() };
  return {
    over: state.over, victory: state.victory, timeout: !!state.timeout, ticks: state.tick,
    hpLeft: p.maxHp ? Math.trunc(p.hp * 1000 / p.maxHp) : 0, // ‰
    kills: state.stats.kills, dealt: state.stats.dealt, taken: state.stats.taken,
    hash: fnv64(stableJson(core)),
  };
}
