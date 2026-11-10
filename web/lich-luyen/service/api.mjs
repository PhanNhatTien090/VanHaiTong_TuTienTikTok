// Lịch luyện — API /api/ll/*. Bật bằng LICH_LUYEN=1; LICH_LUYEN_BETA="ten1,ten2" giới hạn tài khoản thử (rỗng = mọi tài khoản đăng nhập).
// Tài khoản quản trị (user.admin) luôn vào được để thử trước, kể cả khi chưa bật (LICH_LUYEN_ADMIN=0 để tắt hẳn).
import path from 'node:path';
import { openDb } from './db.mjs';
import { createGame } from './game.mjs';
import { createVerifier } from './verify-worker.mjs';
import { loadContent } from '../content/index.js';

const MAX_BODY = 96 * 1024; // đầu vào trận 3 phút dạng RLE thường < 10 KB

export function lichLuyenOptions(env = process.env) {
  return { enabled: env.LICH_LUYEN === '1', adminPreview: env.LICH_LUYEN_ADMIN !== '0', beta: String(env.LICH_LUYEN_BETA || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean), season: Number(env.LICH_LUYEN_SEASON || 1) };
}

export function createLichLuyen({ dataDir, enabled = false, adminPreview = false, beta = [], season = 1, verifier = null, dbFile = null, clock = Date.now }) {
  if (!enabled && !adminPreview) return null;
  const content = loadContent();
  const db = openDb(dbFile || path.join(dataDir, 'lich-luyen.sqlite'));
  const v = verifier || createVerifier();
  const admins = new Set();
  const game = createGame({ db, content, verifier: v, season, admins });
  const hits = new Map();
  const limited = (key, max, now) => { const h = (hits.get(key) || []).filter(t => now - t < 60000); h.push(now); hits.set(key, h); if (hits.size > 5000) hits.clear(); return h.length > max; };
  const allowed = user => !!user.admin || (enabled && (!beta.length || beta.includes(String(user.username).toLowerCase())));

  async function body(req) {
    let size = 0; const chunks = [];
    for await (const c of req) { size += c.length; if (size > MAX_BODY) throw Object.assign(Error('Yêu cầu quá lớn.'), { status: 413 }); chunks.push(c); }
    return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
  }
  const send = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };

  async function handle(req, res, url, user) {
    const now = clock();
    try {
      const route = req.method + ' ' + url.pathname;
      if (!user) return send(res, 401, { ok: false, code: 'LOGIN', message: 'Đăng nhập để đi lịch luyện.' });
      if (!allowed(user)) return send(res, 403, { ok: false, code: 'BETA', message: enabled ? 'Lịch luyện đang thử nghiệm.' : 'Lịch luyện chưa mở.' });
      if (user.admin) admins.add(user.id); else admins.delete(user.id);
      if (limited('u:' + user.id, 60, now)) return send(res, 429, { ok: false, message: 'Thao tác quá nhanh.' });
      if (route === 'GET /api/ll/state') return send(res, 200, { ok: true, contentVersion: content.version, avatar: game.view(user.id, now), paths: game.paths() });
      if (route === 'POST /api/ll/avatar') { const b = await body(req); const r = game.createAvatar(user, b, now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/look') { const b = await body(req); const r = game.setLook(user, b.playerId, now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/idle/claim') { const r = game.claimIdle(user, now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/fate') { const b = await body(req); const r = game.chooseFate(user, String(b.fateId || ''), now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/breakthrough') { const r = game.breakthrough(user, now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/battle/sweep') { const b = await body(req); const r = game.sweep(user, String(b.stageId || ''), now); return send(res, r.ok ? 200 : 400, r); }
      if (route === 'POST /api/ll/battle/start') {
        if (limited('start:' + user.id, 12, now)) return send(res, 429, { ok: false, message: 'Vào ải quá nhanh.' });
        const b = await body(req); const r = game.startBattle(user, String(b.stageId || ''), now); return send(res, r.ok ? 200 : 400, r);
      }
      if (route === 'POST /api/ll/battle/finish') {
        const b = await body(req); const r = await game.finishBattle(user, b.battleId, b.inputs, typeof b.hash === 'string' ? b.hash : undefined, clock());
        return send(res, r.ok ? 200 : 400, r);
      }
      return send(res, 404, { ok: false, message: 'Không có.' });
    } catch (e) {
      return send(res, e.status || 400, { ok: false, message: e.status ? e.message : 'Yêu cầu không hợp lệ.' });
    }
  }
  return { handle, game, db, close() { v.close(); db.close(); } };
}
