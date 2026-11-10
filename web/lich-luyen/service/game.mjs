// Lịch luyện — nghiệp vụ phân thân + trận đánh. Server là nguồn sự thật: client chỉ gửi đầu vào, server tính mọi kết quả.
import crypto from 'node:crypto';
import { tx } from './db.mjs';
import { post, balances } from './ledger.mjs';
import { computeStats } from '../core/stats.mjs';
import { buildLadder, addQi, stepLabel, breakthrough } from '../core/progression.mjs';
import { TICK_RATE } from '../core/sim/inputs.mjs';
import { t } from '../content/index.js';

const fail = (code, message, extra = {}) => ({ ok: false, code, message, ...extra });
// Trận không thể xong nhanh hơn thời gian thật: chơi 60 giây trong game thì phải mất ≥ 60×80% giây ngoài đời.
// Chặn công cụ gửi đầu vào tự sinh hàng loạt. Tự động chiến đấu (sau này) do server chạy, không qua đây.
const REALTIME_SHARE = 80;
const STALE_MS = 30 * 60000;
const BT_MESSAGE = { NEED_QI: 'Chưa đủ tu vi.', NEED_MATERIALS: 'Thiếu vật phẩm đột phá.', NEED_TRIAL: 'Cần vượt thử thách đột phá.', SEASON_CAP: 'Đã chạm trần cảnh giới mùa này.', END: 'Đã đến tận cùng đại đạo.', NOT_GATE: 'Chưa tới Viên Mãn.' };

export function createGame({ db, content, verifier, season = 1 }) {
  const ladder = buildLadder(content, season);

  const row = accountId => db.prepare('SELECT * FROM ll_avatars WHERE account_id=?').get(accountId);
  const avatarModel = r => ({ pathId: r.path_id, cultivation: { step: r.step, qi: r.qi }, ...JSON.parse(r.payload) });

  function view(r) {
    if (!r) return null;
    const a = avatarModel(r), s = computeStats(content, a), step = ladder[r.step];
    return {
      id: r.id, name: r.name, pathId: r.path_id, pathName: t(content, content.byId.get(r.path_id).nameKey),
      step: r.step, label: stepLabel(content, step), qi: r.qi, qiNeed: step.qi, gate: step.gate,
      stats: s.stats, power: s.power, balances: balances(db, r.id),
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
      .run(id, user.id, user.playerId || null, clean, pathId, power, season, JSON.stringify({ breakthroughs: [] }), now, now);
    return { ok: true, avatar: view(row(user.id)) };
  }

  function startBattle(user, stageId, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const stage = content.byId.get(stageId);
    if (!stage?.waves) return fail('BAD_STAGE', 'Ải không tồn tại.');
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
    const stage = content.byId.get(b.stage_id);
    const win = result.complete && result.victory;
    const stars = !win ? 0 : result.hpLeft >= 600 ? 3 : result.hpLeft >= 300 ? 2 : 1;
    const share = [0, 60, 80, 100][stars];
    const reward = { stars, qi: Math.trunc(stage.rewards.qi * share / 100), linhThach: Math.trunc(stage.rewards.linhThach * share / 100) };

    const out = tx(db, () => {
      // Đánh dấu xong trước (WHERE status='running'): hai yêu cầu nộp cùng lúc chỉ một cái được thưởng.
      const done = db.prepare("UPDATE ll_battles SET status='done', finished=?, inputs=?, result=?, mismatch=? WHERE id=? AND status='running'")
        .run(now, JSON.stringify(inputs), JSON.stringify({ ...result, reward }), mismatch, b.id);
      if (done.changes !== 1) return fail('DONE', 'Trận đã kết thúc.');
      if (!win) return { ok: true, result, reward };
      const cur = db.prepare('SELECT * FROM ll_avatars WHERE id=?').get(r.id);
      const grown = addQi({ step: cur.step, qi: cur.qi }, reward.qi, ladder);
      const power = computeStats(content, avatarModel({ ...cur, step: grown.state.step })).power;
      const upd = db.prepare('UPDATE ll_avatars SET step=?, qi=?, power=?, version=version+1, updated=? WHERE id=? AND version=?').run(grown.state.step, grown.state.qi, power, now, cur.id, cur.version);
      if (upd.changes !== 1) throw Error('Phân thân vừa thay đổi, thử lại.');
      if (reward.linhThach) post(db, { avatarId: cur.id, currency: 'linh-thach', delta: reward.linhThach, reason: 'stage-clear', ref: b.id, at: now });
      return { ok: true, result, reward: { ...reward, advanced: grown.advanced, ready: grown.ready } };
    });
    return out.ok ? { ...out, avatar: view(row(user.id)) } : out;
  }

  // Đột phá đại cảnh. Giai đoạn 0 chưa có túi đồ → số loại vật phẩm đột phá = 0: chỉ qua được cửa không cần vật phẩm
  // (Phàm Nhân → Luyện Khí, "khai linh căn"). Túi đồ + Lôi Kiếp nối vào đây ở Giai đoạn 1.
  function breakthroughNow(user, now = Date.now()) {
    const r = row(user.id); if (!r) return fail('NO_AVATAR', 'Chưa có phân thân.');
    const payload = JSON.parse(r.payload);
    const out = breakthrough({ step: r.step, qi: r.qi }, ladder, content, { materialTypes: 0, trialPassed: false });
    if (!out.ok) return fail(out.code, BT_MESSAGE[out.code] || 'Chưa đột phá được.', { need: out.need });
    payload.breakthroughs = [...(payload.breakthroughs || []), { realmId: out.realmId, quality: out.quality, points: out.points, at: now }];
    const power = computeStats(content, { pathId: r.path_id, cultivation: out.state, ...payload }).power;
    const upd = db.prepare('UPDATE ll_avatars SET step=?, qi=?, power=?, payload=?, version=version+1, updated=? WHERE id=? AND version=?')
      .run(out.state.step, out.state.qi, power, JSON.stringify(payload), now, r.id, r.version);
    if (upd.changes !== 1) return fail('RETRY', 'Phân thân vừa thay đổi, thử lại.');
    return { ok: true, realmId: out.realmId, quality: out.quality, fatePicks: out.fatePicks, avatar: view(row(user.id)) };
  }

  return {
    ladder, view: accountId => view(row(accountId)),
    createAvatar, startBattle, finishBattle, breakthrough: breakthroughNow,
    paths: () => content.paths.map(p => ({ id: p.id, name: t(content, p.nameKey), desc: t(content, p.descKey), kit: Object.fromEntries(Object.entries(p.kit).map(([slot, id]) => [slot, { id, name: t(content, id) }])), branches: p.branches.map(b => t(content, b.nameKey)) })),
    stages: () => content.stages.map(s => ({ id: s.id, name: t(content, s.nameKey), map: t(content, s.map), level: s.level })),
  };
}
