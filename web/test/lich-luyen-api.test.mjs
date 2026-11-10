import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createWebApp } from '../app.mjs';
import { createWorld } from '../../engine.mjs';
import { createLichLuyen, lichLuyenOptions } from '../lich-luyen/service/api.mjs';
import { openDb, schemaVersion, MIGRATIONS } from '../lich-luyen/service/db.mjs';
import { post, balance } from '../lich-luyen/service/ledger.mjs';
import { loadContent } from '../lich-luyen/content/index.js';
import { createBattle, tick, battleResult } from '../lich-luyen/core/sim/battle.mjs';
import { botInput } from '../lich-luyen/core/sim/bot.mjs';
import { encodeInputs } from '../lich-luyen/core/sim/inputs.mjs';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'll-api-'));
let clock = Date.parse('2026-11-10T08:00:00Z');
const ll = createLichLuyen({ dataDir: dir, enabled: true, clock: () => clock });
const app = createWebApp({ world: createWorld('live'), dataDir: dir, profileOnly: true, tikfinity: false, lichLuyen: ll });
await new Promise(r => app.server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${app.server.address().port}`;
test.after(() => { app.server.close(); ll.close(); });
const content = loadContent();

function client() {
  let cookie = '';
  return async (p, body) => {
    const res = await fetch(base + p, { method: body === undefined ? 'GET' : 'POST', headers: { ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0];
    const type = res.headers.get('content-type') || '';
    return { status: res.status, ...(type.includes('json') ? await res.json() : { text: await res.text() }) };
  };
}
// Đánh như người chơi: chạy CÙNG mô phỏng ở "trình duyệt" bằng bot, trả đầu vào + kết quả.
function playLocally(setup) {
  const b = createBattle(content, setup), frames = [];
  while (!b.over) { const f = botInput(content, b); frames.push(f); tick(content, b, f); }
  return { inputs: encodeInputs(frames), local: battleResult(b) };
}

test('tắt mặc định: không có LICH_LUYEN=1 thì không tạo gì', () => {
  assert.equal(createLichLuyen({ dataDir: dir, ...lichLuyenOptions({}) }), null);
  assert.deepEqual(lichLuyenOptions({ LICH_LUYEN: '1', LICH_LUYEN_BETA: 'An, Binh' }).beta, ['an', 'binh']);
});

test('chưa đăng nhập bị từ chối; lõi /ll/ phục vụ được cho trình duyệt', async () => {
  const c = client();
  assert.equal((await c('/api/ll/state')).status, 401);
  const js = await c('/ll/core/sim/battle.mjs');
  assert.equal(js.status, 200); assert.match(js.text, /createBattle/);
  assert.equal((await c('/ll/core/../service/db.mjs')).status, 404);
  assert.equal((await c('/ll/service/db.mjs')).status, 404); // chỉ core/content, không lộ mã server
});

test('vòng chơi đầy đủ: tạo phân thân → vào ải → đánh → server chạy lại → thưởng qua sổ cái', async () => {
  const c = client();
  assert.equal((await c('/api/register', { username: 'kiemkhach', password: 'matkhau123' })).ok, true);
  let s = await c('/api/ll/state');
  assert.equal(s.ok, true); assert.equal(s.avatar, null); assert.equal(s.paths.length, 3); assert.equal(s.contentVersion, content.version);
  assert.equal((await c('/api/ll/avatar', { pathId: 'path.khong-co' })).ok, false);
  const made = await c('/api/ll/avatar', { pathId: 'path.kiem-tu', name: 'Lưu Vân' });
  assert.equal(made.ok, true); assert.equal(made.avatar.label, 'Phàm Nhân'); assert.equal(made.avatar.name, 'Lưu Vân');
  assert.equal((await c('/api/ll/avatar', { pathId: 'path.the-tu' })).code, 'EXISTS');

  const start = await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  assert.equal(start.ok, true); assert.equal(start.contentVersion, content.version);
  const { inputs, local } = playLocally(start.setup);
  assert.equal(local.victory, true);

  // Nộp ngay (nhanh hơn thời gian thật) → từ chối
  const tooFast = await c('/api/ll/battle/finish', { battleId: start.battleId, inputs, hash: local.hash });
  assert.equal(tooFast.code, 'TOO_FAST');

  const start2 = await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  const run2 = playLocally(start2.setup);
  clock += run2.local.ticks * 1000 / 30 + 1000;
  const done = await c('/api/ll/battle/finish', { battleId: start2.battleId, inputs: run2.inputs, hash: run2.local.hash });
  assert.equal(done.ok, true, done.message);
  assert.equal(done.result.hash, run2.local.hash); // server tính ra đúng kết quả trình duyệt
  assert.ok(done.reward.stars >= 1); assert.ok(done.reward.qi > 0);
  assert.equal(done.avatar.balances['linh-thach'], done.reward.linhThach);
  // Phàm Nhân đầy tu vi thì dừng ở cổng, phải bấm đột phá (khai linh căn) mới lên Luyện Khí
  assert.equal(done.avatar.label, 'Phàm Nhân'); assert.equal(done.reward.ready, true);
  const bt = await c('/api/ll/breakthrough', {});
  assert.equal(bt.ok, true, bt.message); assert.equal(bt.avatar.label, 'Luyện Khí Tầng 1'); assert.ok(bt.avatar.power > done.avatar.power);
  assert.equal((await c('/api/ll/breakthrough', {})).code, 'NOT_GATE');

  // Nộp lại cùng trận → không nhận lần hai
  const again = await c('/api/ll/battle/finish', { battleId: start2.battleId, inputs: run2.inputs });
  assert.equal(again.ok, false); assert.equal(again.code, 'DONE');
  s = await c('/api/ll/state');
  assert.equal(s.avatar.balances['linh-thach'], done.reward.linhThach);
});

test('đầu vào sửa đổi/rác bị từ chối hoặc thưởng theo server; người khác không nộp hộ được trận', async () => {
  const a = client(), b = client();
  await a('/api/register', { username: 'phapsu', password: 'matkhau123' }); await a('/api/ll/avatar', { pathId: 'path.phap-tu' });
  await b('/api/register', { username: 'thetu', password: 'matkhau123' }); await b('/api/ll/avatar', { pathId: 'path.the-tu' });
  const st = await a('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  const run = playLocally(st.setup);
  clock += 10 * 60000;
  assert.equal((await b('/api/ll/battle/finish', { battleId: st.battleId, inputs: run.inputs })).code, 'NO_BATTLE');
  assert.equal((await a('/api/ll/battle/finish', { battleId: st.battleId, inputs: [[1, 99, 0]] })).code, 'REJECTED');
  const st2 = await a('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  const run2 = playLocally(st2.setup);
  clock += 10 * 60000;
  // Báo hash giả kèm đầu vào thật: vẫn nhận, nhưng theo kết quả server và bị đánh dấu lệch
  const r = await a('/api/ll/battle/finish', { battleId: st2.battleId, inputs: run2.inputs, hash: '0000000000000000' });
  assert.equal(r.ok, true); assert.equal(r.result.hash, run2.local.hash);
  assert.equal(ll.db.prepare('SELECT mismatch FROM ll_battles WHERE id=?').get(st2.battleId).mismatch, 1);
});

test('trận cũ bị bỏ khi vào trận mới; trận quá 30 phút hết hạn', async () => {
  const c = client();
  await c('/api/register', { username: 'bohoang', password: 'matkhau123' }); await c('/api/ll/avatar', { pathId: 'path.kiem-tu' });
  const s1 = await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  assert.equal(ll.db.prepare('SELECT status FROM ll_battles WHERE id=?').get(s1.battleId).status, 'abandoned');
  const s3 = await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.1' });
  clock += 31 * 60000;
  assert.equal((await c('/api/ll/battle/finish', { battleId: s3.battleId, inputs: playLocally(s3.setup).inputs })).code, 'EXPIRED');
});

test('beta: chỉ tài khoản trong danh sách được vào', async () => {
  const d2 = fs.mkdtempSync(path.join(os.tmpdir(), 'll-beta-'));
  const l2 = createLichLuyen({ dataDir: d2, enabled: true, beta: ['nguoithu'] });
  const app2 = createWebApp({ world: createWorld('live'), dataDir: d2, profileOnly: true, tikfinity: false, lichLuyen: l2 });
  await new Promise(r => app2.server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${app2.server.address().port}`;
  let cookie = '';
  const reg = await fetch(url + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'nguoila', password: 'matkhau123' }) });
  cookie = reg.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(url + '/api/ll/state', { headers: { cookie } })).status, 403);
  app2.server.close(); l2.close();
});

test('sổ cái: không cho âm, ghi đủ dấu vết; migration ghi phiên bản schema', () => {
  const db = openDb(path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'll-db-')), 'x.sqlite'));
  assert.equal(schemaVersion(db), MIGRATIONS.at(-1).id);
  post(db, { avatarId: 'a1', currency: 'linh-thach', delta: 50, reason: 'test', at: 1 });
  assert.throws(() => post(db, { avatarId: 'a1', currency: 'linh-thach', delta: -60, reason: 'test', at: 2 }), /Không đủ/);
  assert.throws(() => post(db, { avatarId: 'a1', currency: 'vang', delta: 1, reason: 'test', at: 2 }), /Tiền tệ lạ/);
  assert.equal(balance(db, 'a1', 'linh-thach'), 50);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM ll_ledger').get().n, 1);
  db.close();
});
