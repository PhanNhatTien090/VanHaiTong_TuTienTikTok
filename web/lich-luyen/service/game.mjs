// Lịch luyện — nghiệp vụ phân thân + trận đánh. Server là nguồn sự thật: client chỉ gửi đầu vào, server tính mọi kết quả.
import crypto from 'node:crypto';
import { tx } from './db.mjs';
import { post, balances } from './ledger.mjs';
import { stacks, countOf, addItems, removeItems } from './inventory.mjs';
import { computeStats } from '../core/stats.mjs';
import { buildLadder, addQi, stepLabel, breakthrough, qualityFor } from '../core/progression.mjs';
import { starsFor, stageReward, rollDrops } from '../core/loot.mjs';
import { rollFateOffers, fateQiGain } from '../core/fates.mjs';
import { idleQi, IDLE } from '../core/idle.mjs';
import { TICK_RATE } from '../core/sim/inputs.mjs';
import { t } from '../content/index.js';

const fail = (code, message, extra = {}) => ({ ok: false, code, message, ...extra });
// Trận không thể xong nhanh hơn thời gian thật: chơi 60 giây trong game thì phải mất ≥ 60×80% giây ngoài đời.
// Chặn công cụ gửi đầu vào tự sinh hàng loạt. Quét ải do server tính, không qua đây.
const REALTIME_SHARE = 80;
const STALE_MS = 30 * 60000;
const SWEEPS_PER_DAY = 20;
const TRIAL_FAIL_QI = 10; // % tu vi Viên Mãn mất khi độ kiếp thất bại (vật phẩm giữ nguyên, đánh lại được)
const BT_MESSAGE = { NEED_QI: 'Chưa đủ tu vi.', NEED_MATERIALS: 'Thiếu vật phẩm đột phá.', NEED_TRIAL: 'Cần vượt thử thách đột phá.', SEASON_CAP: 'Đã chạm trần cảnh giới mùa này.', END: 'Đã đến tận cùng đại đạo.', NOT_GATE: 'Chưa tới Viên Mãn.', LOCKED: 'Cảnh giới này chưa mở.' };
// Ngày theo giờ Việt Nam, đổi lúc 05:00 (giống LIVE).
const vnDay = now => Math.floor((now + 7 * 3600000 - 5 * 3600000) / 86400000);

export function createGame({ db, content, verifier, season = 1 }) {
  const ladder = buildLadder(content, season);

  const row = accountId => db.prepare('SELECT * FROM ll_avatars WHERE account_id=?').get(accountId);
  const byId = id => db.prepare('SELECT * FROM ll_avatars WHERE id=?').get(id);
  const payloadOf = r => JSON.parse(r.payload);
  const avatarModel = (r, payload = payloadOf(r)) => ({ pathId: r.path_id, cultivation: { step: r.step, qi: r.qi }, ...payload });
  // Bậc đầu tiên của đại cảnh minRealm trên thang → đã tới chưa
  const realmFirstStep = new Map(); for (const s of ladder) if (!realmFirstStep.has(s.realmId)) realmFirstStep.set(s.realmId, s.index);
  const realmReached = (step, realmId) => !realmId || step >= realmFirstStep.get(realmId);
  const trialStageFor = key => content.stages.find(s => s.kind === 'trial' && s.trialKey === key);
  // Được vào độ kiếp không: đúng cổng, cảnh giới đích cần đúng thử thách này, đủ tu vi, đủ vật phẩm bắt buộc.
  function trialBlock(r, stage) {
    const step = ladder[r.step];
    if (step.gate !== 'breakthrough') return fail('NOT_GATE', BT_MESSAGE.NOT_GATE);
    const target = content.realms[step.realmIndex + 1];
    if (!target.requires) return fail('LOCKED', BT_MESSAGE.LOCKED);
    if (target.trial !== stage.trialKey) return fail('WRONG_TRIAL', 'Không phải thử thách của cảnh giới này.');
    if (r.qi < step.qi) return fail('NEED_QI', BT_MESSAGE.NEED_QI);
    const inv = stacks(db, r.id);
    if (target.requires.some(q => (inv[q.item] || 0) < q.count)) return fail('NEED_MATERIALS', BT_MESSAGE.NEED_MATERIALS);
    return null;
  }
  const fateView = id => { const f = content.byId.get(id); return { id, name: t(content, f.nameKey), rarity: f.rarity, effects: f.effects.map(e => `${t(content, 'stat.' + e.stat)} ${(e.flat ?? e.permille) > 0 ? '+' : ''}${e.flat !== undefined ? (e.stat === 'crit' ? e.flat / 10 + '%' : e.stat === 'critDmg' ? e.flat / 10 + '%' : e.flat) : e.permille / 10 + '%'}`) }; };
  const idleFrom = (r, payload) => payload.idleFrom ?? r.created;
  function idleView(r, payload, now) {
    const v = idleQi(ladder[r.step].qi, now - idleFrom(r, payload), { qiGain: fateQiGain(content, payload.fates) });
    return { ...v, capHours: IDLE.capHours, ratePerHour: IDLE.ratePerHour, gate: ladder[r.step].gate, full: !!ladder[r.step].gate && r.qi >= ladder[r.step].qi };
  }
  const itemView = (id, count) => { const it = content.byId.get(id); return { id, count, name: t(content, it.nameKey), desc: t(content, it.descKey), kind: it.kind, rarity: it.rarity }; };

  // Xem trước đột phá: cần gì, có gì, đạt phẩm nào.
  function breakthroughPreview(r, inv) {
    const step = ladder[r.step];
    if (step.gate !== 'breakthrough') return { gate: step.gate };
    const target = content.realms[step.realmIndex + 1];
    if (!target.requires) return { gate: 'breakthrough', locked: true, realmName: t(content, target.nameKey) };
    const requires = target.requires.map(q => ({ ...itemView(q.item, inv[q.item] || 0), need: q.count }));
    const boosts = target.boosts.map(id => itemView(id, inv[id] || 0));
    const types = boosts.filter(b => b.count > 0).length, quality = qualityFor(target, types);
    return {
      gate: 'breakthrough', realmName: t(content, target.nameKey), trial: target.trial ? t(content, target.trial) : null,
      qiReady: r.qi >= step.qi, requires, boosts, materialTypes: types,
      quality: quality ? { id: quality.id, name: t(content, quality.nameKey), points: quality.points, fatePicks: quality.fatePicks } : null,
      qualities: target.qualities.map(q => ({ id: q.id, name: t(content, q.nameKey), materials: q.materials, points: q.points, fatePicks: q.fatePicks })),
      canBreak: r.qi >= step.qi && requires.every(x => x.count >= x.need) && !!quality && !target.trial,
      trialStage: target.trial ? trialStageFor(target.trial)?.id || null : null,
      trialReady: !!target.trial && r.qi >= step.qi && requires.every(x => x.count >= x.need) && !!quality,
      trialFails: payloadOf(r).trialFails || 0,
    };
  }

  function stageView(payload, now, stepNow) {
    const prog = payload.stages || {};
    const day = vnDay(now), sweeps = payload.sweepDay?.day === day ? payload.sweepDay.used : 0;
    return {
      sweepsLeft: Math.max(0, SWEEPS_PER_DAY - sweeps),
      list: content.stages.filter(s => s.kind !== 'trial').map(s => {
        const p = prog[s.id] || { stars: 0, clears: 0 };
        const realmOk = realmReached(stepNow, s.minRealm);
        const unlocked = realmOk && (!s.requires || (prog[s.requires]?.stars || 0) > 0);
        return { id: s.id, name: t(content, s.nameKey), mapId: s.map, map: t(content, s.map), level: s.level, stars: p.stars, clears: p.clears, unlocked, needRealm: realmOk ? null : t(content, content.byId.get(s.minRealm).nameKey), sweepable: p.stars === 3, rewards: s.rewards,
          drops: s.drops.map(d => ({ id: d.item, name: t(content, content.byId.get(d.item).nameKey), rarity: content.byId.get(d.item).rarity })) };
      }),
    };
  }

  function view(r, now = Date.now()) {
    if (!r) return null;
    const payload = payloadOf(r), a = avatarModel(r, payload), s = computeStats(content, a), step = ladder[r.step], inv = stacks(db, r.id);
    return {
      id: r.id, name: r.name, pathId: r.path_id, pathName: t(content, content.byId.get(r.path_id).nameKey),
      step: r.step, label: stepLabel(content, step), qi: r.qi, qiNeed: step.qi, gate: step.gate,
      stats: s.stats, power: s.power, balances: balances(db, r.id),
      breakthroughs: (payload.breakthroughs || []).map(b => ({ realmName: t(content, content.byId.get(b.realmId).nameKey), quality: b.quality, points: b.points })),
      inventory: Object.entries(inv).map(([id, n]) => itemView(id, n)).sort((x, y) => y.rarity - x.rarity || x.name.localeCompare(y.name, 'vi')),
      breakthrough: breakthroughPreview(r, inv),
      fates: (payload.fates || []).map(fateView),
      pendingFates: payload.pendingFates ? { realmName: t(content, content.byId.get(payload.pendingFates.realmId).nameKey), left: payload.pendingFates.offers.length, offer: payload.pendingFates.offers[0].map(fateView) } : null,
      qiGain: fateQiGain(content, payload.fates),
      idle: idleView(r, payload, now),
      stages: stageView(payload, now, r.step),
    };
  }

  function createAvatar(user, { pathId, name } = {}, now = Date.now()) {
    const path = content.byId.get(pathId);
    if (!path?.kit) return fail('BAD_PATH', 'Chọn một đạo lộ.');
    if (row(user.id)) return fail('EXISTS', 'Tài khoản đã có phân thân.');
    const clean = String(name || user.displayName || user.username || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
    if (!clean) return fail('BAD_NAME', 'Đặt tên phân thân.');
    const id = 'av_' + crypto.randomBytes(9).toString('hex');
    const a = { pathId, cultivation: { step: 0, qi: 0 } }, power = computeStats(content, a).power;
    db.prepare('INSERT INTO ll_avatars(id,account_id,live_player_id,name,path_id,step,qi,power,season,payload,version,created,updated) VALUES(?,?,?,?,?,0,0,?,?,?,1,?,?)')
      .run(id, user.id, user.playerId || null, clean, pathId, power, season, JSON.stringify({ breakthroughs: [], stages: {} }), now, now);
    return { ok: true, avatar: view(row(user.id), now) };
  }

  const stageUnlocked = (payload, stage, step) => realmReached(step, stage.minRealm) && (!stage.requires || ((payload.stages || {})[stage.requires]?.stars || 0) > 0);

  function startBattle(user, stageId, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const stage = content.byId.get(stageId);
    if (!stage?.waves) return fail('BAD_STAGE', 'Ải không tồn tại.');
      if (stage.kind === 'trial') { const why = trialBlock(r, stage); if (why) return why; }
    else if (!stageUnlocked(payloadOf(r), stage, r.step)) return fail('LOCKED', stage.minRealm && !realmReached(r.step, stage.minRealm) ? 'Cần cảnh giới ' + t(content, content.byId.get(stage.minRealm).nameKey) + '.' : 'Hãy vượt ải trước đó.');
    const seed = crypto.randomBytes(12).toString('hex'), id = 'bt_' + crypto.randomBytes(12).toString('hex');
    const setup = { seed, stageId, player: { pathId: r.path_id, stats: computeStats(content, avatarModel(r)).stats } };
    tx(db, () => {
      // Một trận một lúc: trận cũ chưa nộp coi như bỏ.
      db.prepare("UPDATE ll_battles SET status='abandoned', finished=? WHERE avatar_id=? AND status='running'").run(now, r.id);
      db.prepare("INSERT INTO ll_battles(id,avatar_id,stage_id,seed,content_version,setup,status,started) VALUES(?,?,?,?,?,?,'running',?)")
        .run(id, r.id, stageId, seed, content.version, JSON.stringify(setup), now);
    });
    return { ok: true, battleId: id, setup, contentVersion: content.version };
  }

  // Ghi thắng ải (gọi TRONG transaction): tu vi, linh thạch, rơi đồ, sao/số lần. Trả về phần thưởng đã phát.
  function applyWin(cur, stage, stars, { sweep = false, ref, now }) {
    const payload = payloadOf(cur), prog = payload.stages ??= {}, p = prog[stage.id] ??= { stars: 0, clears: 0 };
    const firstClear = p.clears === 0;
    const base = stageReward(stage, stars, { sweep }), drops = rollDrops(stage, ref, { firstClear });
    const gain = fateQiGain(content, payload.fates); if (gain) base.qi = Math.trunc(base.qi * (1000 + gain) / 1000);
    p.clears++; if (stars > p.stars) p.stars = stars;
    const grown = addQi({ step: cur.step, qi: cur.qi }, base.qi, ladder);
    const power = computeStats(content, avatarModel({ ...cur, step: grown.state.step }, payload)).power;
    const upd = db.prepare('UPDATE ll_avatars SET step=?, qi=?, power=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?')
      .run(grown.state.step, grown.state.qi, power, JSON.stringify(payload), now, cur.id, cur.version);
    if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
    if (base.linhThach) post(db, { avatarId: cur.id, currency: 'linh-thach', delta: base.linhThach, reason: sweep ? 'stage-sweep' : 'stage-clear', ref, at: now });
    if (Object.keys(drops).length) addItems(db, cur.id, drops, content);
    return { stars, qi: base.qi, linhThach: base.linhThach, drops: Object.entries(drops).map(([id, n]) => itemView(id, n)), firstClear, advanced: grown.advanced, ready: grown.ready };
  }

  async function finishBattle(user, battleId, inputs, claimedHash, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const b = db.prepare('SELECT * FROM ll_battles WHERE id=?').get(String(battleId || ''));
    if (!b || b.avatar_id !== r.id) return fail('NO_BATTLE', 'Trận không tồn tại.');
    if (b.status !== 'running') return fail('DONE', 'Trận đã kết thúc.');
    if (now - b.started > STALE_MS) { db.prepare("UPDATE ll_battles SET status='expired', finished=? WHERE id=?").run(now, b.id); return fail('EXPIRED', 'Trận đã quá hạn.'); }
    if (b.content_version !== content.version) { db.prepare("UPDATE ll_battles SET status='stale', finished=? WHERE id=?").run(now, b.id); return fail('CONTENT_CHANGED', 'Game vừa cập nhật, hãy đánh lại ải này.'); }
    const setup = JSON.parse(b.setup);
    let result;
    try { result = (await verifier.verify(setup, inputs)).result; }
    catch (e) {
      db.prepare("UPDATE ll_battles SET status='rejected', finished=?, result=? WHERE id=? AND status='running'").run(now, JSON.stringify({ error: e.message }), b.id);
      return fail('REJECTED', 'Dữ liệu trận không hợp lệ.');
    }
    const mismatch = claimedHash !== undefined && claimedHash !== result.hash ? 1 : 0;
    const minMs = Math.trunc(result.ticks * 1000 / TICK_RATE * REALTIME_SHARE / 100);
    if (now - b.started < minMs) {
      db.prepare("UPDATE ll_battles SET status='rejected', finished=?, result=?, mismatch=? WHERE id=? AND status='running'").run(now, JSON.stringify({ ...result, error: 'too-fast' }), mismatch, b.id);
      return fail('TOO_FAST', 'Trận kết thúc nhanh bất thường.');
    }
    const stage = content.byId.get(b.stage_id), stars = starsFor(result);

    const out = tx(db, () => {
      // Đánh dấu xong trước (WHERE status='running'): hai yêu cầu nộp cùng lúc chỉ một cái được thưởng.
      const done = db.prepare("UPDATE ll_battles SET status='done', finished=?, inputs=?, result=?, mismatch=? WHERE id=? AND status='running'")
        .run(now, JSON.stringify(inputs), JSON.stringify({ ...result, stars }), mismatch, b.id);
      if (done.changes !== 1) return fail('DONE', 'Trận đã kết thúc.');
      if (stage.kind === 'trial') return finishTrial(byId(r.id), stage, result, now);
      if (!stars) return { ok: true, result, reward: { stars: 0, qi: 0, linhThach: 0, drops: [] } };
      const reward = applyWin(byId(r.id), stage, stars, { ref: b.id, now });
      db.prepare('UPDATE ll_battles SET result=? WHERE id=?').run(JSON.stringify({ ...result, stars, reward }), b.id);
      return { ok: true, result, reward };
    });
    return out.ok ? { ...out, avatar: view(row(user.id), now) } : out;
  }

  // Độ kiếp xong (TRONG transaction): sống sót → đột phá luôn (tiêu vật phẩm); thất bại → mất TRIAL_FAIL_QI% tu vi, giữ vật phẩm.
  function finishTrial(cur, stage, result, now) {
    if (result.complete && result.victory) {
      const why = trialBlock(cur, stage);
      if (why) return why; // giữa chừng đã tiêu mất vật phẩm/tu vi (trận khác) → không cho đột phá
      const bt = doBreakthrough(cur, now, true);
      return bt.ok ? { ok: true, result, trial: { passed: true, ...bt } } : bt;
    }
    const payload = payloadOf(cur), lost = Math.trunc(ladder[cur.step].qi * TRIAL_FAIL_QI / 100);
    payload.trialFails = (payload.trialFails || 0) + 1;
    const qi = Math.max(0, cur.qi - lost);
    const upd = db.prepare('UPDATE ll_avatars SET qi=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?').run(qi, JSON.stringify(payload), now, cur.id, cur.version);
    if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
    return { ok: true, result, trial: { passed: false, lostQi: cur.qi - qi } };
  }

  // Quét: ải đã 3 sao, 70% thưởng, vẫn rơi đồ; tối đa 20 lượt/ngày. Server tính ngay, không cần mô phỏng.
  function sweep(user, stageId, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const stage = content.byId.get(stageId);
    if (!stage?.waves) return fail('BAD_STAGE', 'Ải không tồn tại.');
    const out = tx(db, () => {
      const cur = byId(r.id), payload = payloadOf(cur);
      if ((payload.stages?.[stage.id]?.stars || 0) < 3) return fail('NEED_3_STARS', 'Cần đạt 3 sao mới quét được.');
      const day = vnDay(now), used = payload.sweepDay?.day === day ? payload.sweepDay.used : 0;
      if (used >= SWEEPS_PER_DAY) return fail('SWEEP_LIMIT', 'Hôm nay đã hết lượt quét.');
      payload.sweepDay = { day, used: used + 1 };
      // Ghi lượt dùng trước (cùng transaction với thưởng), applyWin sẽ đọc lại payload từ cur → gộp vào đây
      const ref = 'sw_' + crypto.randomBytes(8).toString('hex');
      const reward = applyWin({ ...cur, payload: JSON.stringify(payload) }, stage, 3, { sweep: true, ref, now });
      return { ok: true, reward: { ...reward, sweep: true } };
    });
    return out.ok ? { ...out, avatar: view(row(user.id), now) } : out;
  }

  // Đột phá đại cảnh: đủ tu vi + vật phẩm bắt buộc + (tùy) vật phẩm nâng phẩm. Tiêu vật phẩm trong cùng transaction.
  function breakthroughNow(user, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const step = ladder[r.step];
    if (step.gate === 'breakthrough') {
      const target = content.realms[step.realmIndex + 1];
      if (!target.requires) return fail('LOCKED', BT_MESSAGE.LOCKED);
      if (target.trial) return fail('NEED_TRIAL', BT_MESSAGE.NEED_TRIAL, { trial: target.trial }); // phải vào ải thử thách; thắng thì finishTrial tự đột phá
    }
    const out = tx(db, () => doBreakthrough(byId(r.id), now, false));
    return out.ok ? { ...out, avatar: view(row(user.id), now) } : out;
  }

  // Lõi đột phá (TRONG transaction). trialPassed chỉ true khi gọi từ finishTrial (server đã chạy lại trận độ kiếp).
  function doBreakthrough(cur, now, trialPassed) {
    {
      const step = ladder[cur.step], payload = payloadOf(cur), inv = stacks(db, cur.id);
      const target = content.realms[step.realmIndex + 1] || null;
      const present = (target?.boosts || []).filter(id => inv[id] > 0);
      const bt = breakthrough({ step: cur.step, qi: cur.qi }, ladder, content, { materialTypes: present.length, trialPassed });
      if (!bt.ok) return fail(bt.code, BT_MESSAGE[bt.code] || 'Chưa đột phá được.', { need: bt.need });
      const quality = target.qualities.find(q => q.id === bt.quality);
      const consume = {};
      for (const q of target.requires) consume[q.item] = (consume[q.item] || 0) + q.count;
      for (const id of present.slice(0, quality.materials)) consume[id] = (consume[id] || 0) + 1;
      try { if (Object.keys(consume).length) removeItems(db, cur.id, consume); }
      catch (e) { if (e.code === 'INSUFFICIENT') return fail('NEED_MATERIALS', BT_MESSAGE.NEED_MATERIALS); throw e; }
      payload.breakthroughs = [...(payload.breakthroughs || []), { realmId: bt.realmId, quality: bt.quality, points: bt.points, at: now }];
      if (bt.fatePicks > 0) {
        // Thẻ chưa chọn của lần trước (nếu có) bị thay — mỗi lần đột phá chỉ giữ một bộ chờ chọn.
        const qIndex = target.qualities.findIndex(q => q.id === bt.quality), luck = qIndex * 40;
        const offers = rollFateOffers(content, { seed: cur.id + ':' + payload.breakthroughs.length, owned: payload.fates || [], pathId: cur.path_id, picks: bt.fatePicks, luck });
        payload.pendingFates = offers.length ? { realmId: bt.realmId, offers } : null;
      }
      const power = computeStats(content, avatarModel({ ...cur, step: bt.state.step }, payload)).power;
      const upd = db.prepare('UPDATE ll_avatars SET step=?, qi=?, power=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?')
        .run(bt.state.step, bt.state.qi, power, JSON.stringify(payload), now, cur.id, cur.version);
      if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
      return { ok: true, realmId: bt.realmId, realmName: t(content, target.nameKey), quality: bt.quality, qualityName: t(content, quality.nameKey), points: bt.points, fatePicks: bt.fatePicks, consumed: Object.entries(consume).map(([id, n]) => itemView(id, n)) };
    }
  }

  // Nhận tu vi bế quan: tính theo thời gian từ lần nhận trước (tối đa 8 giờ), cộng vào thang như thưởng ải.
  // Đang đứng ở cổng mà đã đầy tu vi thì không cho nhận (tránh mất trắng) — đồng hồ vẫn chạy tới trần.
  function claimIdle(user, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const out = tx(db, () => {
      const cur = byId(r.id), payload = payloadOf(cur), step = ladder[cur.step];
      const v = idleQi(step.qi, now - idleFrom(cur, payload), { qiGain: fateQiGain(content, payload.fates) });
      if (!v.claimable) return fail('TOO_SOON', `Bế quan ít nhất ${IDLE.minMinutes} phút mới nhận được.`);
      if (step.gate && cur.qi >= step.qi) return fail('FULL', 'Tu vi đã Viên Mãn — hãy đột phá trước rồi nhận bế quan.');
      const grown = addQi({ step: cur.step, qi: cur.qi }, v.qi, ladder);
      payload.idleFrom = now;
      const power = computeStats(content, avatarModel({ ...cur, step: grown.state.step }, payload)).power;
      const upd = db.prepare('UPDATE ll_avatars SET step=?, qi=?, power=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?')
        .run(grown.state.step, grown.state.qi, power, JSON.stringify(payload), now, cur.id, cur.version);
      if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
      return { ok: true, idle: { qi: v.qi, minutes: v.minutes, capped: v.capped, advanced: grown.advanced, ready: grown.ready, wasted: grown.wasted } };
    });
    return out.ok ? { ...out, avatar: view(row(user.id), now) } : out;
  }

  function chooseFate(user, fateId, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const out = tx(db, () => {
      const cur = byId(r.id), payload = payloadOf(cur), pend = payload.pendingFates;
      if (!pend?.offers?.length) return fail('NO_OFFER', 'Không có mệnh cách nào đang chờ chọn.');
      if (!pend.offers[0].includes(fateId)) return fail('BAD_FATE', 'Thẻ này không có trong lượt chọn.');
      payload.fates = [...(payload.fates || []), fateId];
      pend.offers.shift();
      if (!pend.offers.length) payload.pendingFates = null;
      const power = computeStats(content, avatarModel(cur, payload)).power;
      const upd = db.prepare('UPDATE ll_avatars SET power=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?').run(power, JSON.stringify(payload), now, cur.id, cur.version);
      if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
      return { ok: true, fate: fateView(fateId) };
    });
    return out.ok ? { ...out, avatar: view(row(user.id), now) } : out;
  }

  return {
    ladder, view: (accountId, now = Date.now()) => view(row(accountId), now), chooseFate, claimIdle,
    createAvatar, startBattle, finishBattle, sweep, breakthrough: breakthroughNow,
    paths: () => content.paths.map(p => ({ id: p.id, name: t(content, p.nameKey), desc: t(content, p.descKey), kit: Object.fromEntries(Object.entries(p.kit).map(([slot, id]) => [slot, { id, name: t(content, id) }])), branches: p.branches.map(b => t(content, b.nameKey)) })),
  };
}
