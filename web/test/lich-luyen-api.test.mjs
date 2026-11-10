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
import { rollDrops } from '../lich-luyen/core/loot.mjs';
import { addItems } from '../lich-luyen/service/inventory.mjs';

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
  assert.equal(s.ok, true); assert.equal(s.avatar, null); assert.equal(s.paths.length, 3); assert.equal(s.contentVersion, content.version); assert.equal(s.stages, undefined);
  assert.equal((await c('/api/ll/avatar', { pathId: 'path.khong-co' })).ok, false);
  const made = await c('/api/ll/avatar', { pathId: 'path.kiem-tu', name: 'Lưu Vân' });
  assert.equal(made.ok, true); assert.equal(made.avatar.label, 'Phàm Nhân'); assert.equal(made.avatar.name, 'Lưu Vân');
  assert.equal(made.avatar.stages.list.length, 20); assert.ok(made.avatar.stages.list.every(x => !x.id.startsWith('stage.trial'))); assert.equal(made.avatar.stages.list[0].unlocked, true); assert.equal(made.avatar.stages.list[1].unlocked, false);
  assert.equal((await c('/api/ll/battle/start', { stageId: 'stage.thanh-van.2' })).code, 'LOCKED');
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
  assert.ok(done.reward.stars >= 1); assert.ok(done.reward.qi > 0); assert.equal(done.reward.firstClear, true);
  assert.equal(done.avatar.stages.list[0].stars, done.reward.stars); assert.equal(done.avatar.stages.list[0].clears, 1); assert.equal(done.avatar.stages.list[1].unlocked, true);
  // Rơi đồ vào túi và tất định theo mã trận
  const bag = Object.fromEntries(done.avatar.inventory.map(i => [i.id, i.count]));
  for (const d of done.reward.drops) assert.equal(bag[d.id], d.count);
  assert.deepEqual(rollDrops(content.byId.get('stage.thanh-van.1'), start2.battleId, { firstClear: true }), Object.fromEntries(done.reward.drops.map(d => [d.id, d.count])));
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

async function freshAvatar(username, pathId = 'path.kiem-tu') {
  const c = client();
  await c('/api/register', { username, password: 'matkhau123' });
  const made = await c('/api/ll/avatar', { pathId, name: username });
  return { c, id: made.avatar.id };
}

test('quét ải: cần 3 sao, nhận 70%, vẫn rơi đồ, tối đa 20 lượt/ngày', async () => {
  const { c, id } = await freshAvatar('quetai');
  assert.equal((await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' })).code, 'NEED_3_STARS');
  const r = ll.db.prepare('SELECT payload FROM ll_avatars WHERE id=?').get(id);
  const p = JSON.parse(r.payload); p.stages = { 'stage.thanh-van.1': { stars: 3, clears: 1 } };
  ll.db.prepare('UPDATE ll_avatars SET payload=? WHERE id=?').run(JSON.stringify(p), id);
  const s1 = await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' });
  assert.equal(s1.ok, true, s1.message);
  const stage = content.byId.get('stage.thanh-van.1');
  assert.equal(s1.reward.qi, Math.trunc(stage.rewards.qi * 70 / 100));
  assert.equal(s1.reward.firstClear, false);
  assert.equal(s1.avatar.stages.sweepsLeft, 19);
  assert.equal(s1.avatar.stages.list[0].clears, 2);
  for (let i = 0; i < 19; i++) assert.equal((await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' })).ok, true);
  assert.equal((await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' })).code, 'SWEEP_LIMIT');
  clock += 24 * 3600000; // sang ngày mới
  assert.equal((await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' })).ok, true);
});

test('đột phá Trúc Cơ: cần Trúc Cơ Đan; số loại vật phẩm nâng phẩm quyết định Phàm/Địa/Thiên; vật phẩm bị tiêu', async () => {
  const L = ll.game.ladder, gate = L.findIndex(s => s.realmId === 'realm.luyen-khi' && s.gate);
  const setFull = id => ll.db.prepare('UPDATE ll_avatars SET step=?, qi=? WHERE id=?').run(gate, L[gate].qi, id);

  const a = await freshAvatar('dotpha1'); setFull(a.id);
  let s = await a.c('/api/ll/state');
  assert.equal(s.avatar.breakthrough.realmName, 'Trúc Cơ'); assert.equal(s.avatar.breakthrough.canBreak, false);
  assert.equal((await a.c('/api/ll/breakthrough', {})).code, 'NEED_MATERIALS');
  addItems(ll.db, a.id, { 'item.truc-co-dan': 1 }, content);
  s = await a.c('/api/ll/state');
  assert.equal(s.avatar.breakthrough.quality.id, 'pham'); assert.equal(s.avatar.breakthrough.canBreak, true);
  const r1 = await a.c('/api/ll/breakthrough', {});
  assert.equal(r1.ok, true, r1.message); assert.equal(r1.quality, 'pham'); assert.equal(r1.points, 12);
  assert.equal(r1.avatar.label, 'Trúc Cơ Sơ Kỳ');
  assert.equal(r1.avatar.inventory.find(i => i.id === 'item.truc-co-dan'), undefined); // đã tiêu

  const b = await freshAvatar('dotpha3'); setFull(b.id);
  addItems(ll.db, b.id, { 'item.truc-co-dan': 1, 'item.thanh-van-chi': 2, 'item.lang-vuong-nha': 1, 'item.huyen-giap-tam': 1, 'item.linh-thao': 5 }, content);
  const r3 = await b.c('/api/ll/breakthrough', {});
  assert.equal(r3.quality, 'thien'); assert.equal(r3.points, 20); assert.equal(r3.fatePicks, 3);
  const bag = Object.fromEntries(r3.avatar.inventory.map(i => [i.id, i.count]));
  assert.deepEqual(bag, { 'item.thanh-van-chi': 1, 'item.linh-thao': 5 }); // mỗi loại nâng phẩm tiêu 1, đồ khác giữ nguyên
  assert.ok(r3.avatar.power > r1.avatar.power, 'phẩm Thiên phải mạnh hơn phẩm Phàm');

  // Kim Đan cần Lôi Kiếp → chưa đột phá được (phần sau)
  const kd = L.findIndex(s => s.realmId === 'realm.truc-co' && s.gate);
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=? WHERE id=?').run(kd, L[kd].qi, b.id);
  addItems(ll.db, b.id, { 'item.ket-dan-dan': 1 }, content);
  assert.equal((await b.c('/api/ll/breakthrough', {})).code, 'NEED_TRIAL');
});

test('Lạc Hà Châu khóa theo cảnh giới Trúc Cơ (dù đã qua Thanh Vân Đỉnh)', async () => {
  const { c, id } = await freshAvatar('lacha');
  const p = { breakthroughs: [], stages: { 'stage.thanh-van.10': { stars: 3, clears: 1 } } };
  ll.db.prepare('UPDATE ll_avatars SET payload=? WHERE id=?').run(JSON.stringify(p), id);
  let s = await c('/api/ll/state');
  const lh1 = s.avatar.stages.list.find(x => x.id === 'stage.lac-ha.1');
  assert.equal(lh1.unlocked, false); assert.equal(lh1.needRealm, 'Trúc Cơ');
  assert.match((await c('/api/ll/battle/start', { stageId: 'stage.lac-ha.1' })).message, /Trúc Cơ/);
  const tc = ll.game.ladder.findIndex(x => x.realmId === 'realm.truc-co');
  ll.db.prepare('UPDATE ll_avatars SET step=? WHERE id=?').run(tc, id);
  s = await c('/api/ll/state');
  assert.equal(s.avatar.stages.list.find(x => x.id === 'stage.lac-ha.1').unlocked, true);
  assert.equal((await c('/api/ll/battle/start', { stageId: 'stage.lac-ha.1' })).ok, true);
});

test('Lôi Kiếp: không đủ điều kiện thì không vào; thất bại mất 10% tu vi, giữ vật phẩm; vượt qua thì lên Kim Đan theo phẩm', async () => {
  const L = ll.game.ladder, gate = L.findIndex(x => x.realmId === 'realm.truc-co' && x.gate);
  const { c, id } = await freshAvatar('dokiep', 'path.kiem-tu');
  assert.equal((await c('/api/ll/battle/start', { stageId: 'stage.trial.loi-kiep' })).code, 'WRONG_TRIAL'); // Phàm Nhân cũng là cổng, nhưng lên Luyện Khí không cần Lôi Kiếp
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=?, payload=? WHERE id=?').run(gate, L[gate].qi, JSON.stringify({ breakthroughs: [{ realmId: 'realm.truc-co', quality: 'dia', points: 16 }], stages: {} }), id);
  assert.equal((await c('/api/ll/battle/start', { stageId: 'stage.trial.loi-kiep' })).code, 'NEED_MATERIALS');
  addItems(ll.db, id, { 'item.ket-dan-dan': 1, 'item.xich-viem-tinh': 1, 'item.loi-kich-moc': 1 }, content);
  let s = await c('/api/ll/state');
  assert.equal(s.avatar.breakthrough.trialStage, 'stage.trial.loi-kiep'); assert.equal(s.avatar.breakthrough.trialReady, true);
  assert.equal(s.avatar.breakthrough.quality.id, 'tam-pham');
  assert.equal((await c('/api/ll/breakthrough', {})).code, 'NEED_TRIAL'); // không lách qua API đột phá thường

  // Đứng yên → bị sét đánh chết → thất bại
  const st1 = await c('/api/ll/battle/start', { stageId: 'stage.trial.loi-kiep' });
  const b1 = createBattle(content, st1.setup), f1 = [];
  while (!b1.over) { const f = { dir: -1, buttons: 0 }; f1.push(f); tick(content, b1, f); }
  clock += 10 * 60000;
  const lose = await c('/api/ll/battle/finish', { battleId: st1.battleId, inputs: encodeInputs(f1) });
  assert.equal(lose.ok, true, lose.message); assert.equal(lose.trial.passed, false);
  assert.equal(lose.trial.lostQi, Math.trunc(L[gate].qi / 10));
  assert.equal(lose.avatar.inventory.find(i => i.id === 'item.ket-dan-dan').count, 1);
  assert.equal(lose.avatar.breakthrough.trialFails, 1);

  // Bù lại tu vi rồi độ kiếp bằng bot né sét (thử tối đa 10 lần — mỗi lần sét rơi khác nhau)
  let passed = null;
  for (let i = 0; i < 10 && !passed; i++) {
    ll.db.prepare('UPDATE ll_avatars SET qi=? WHERE id=?').run(L[gate].qi, id);
    const st = await c('/api/ll/battle/start', { stageId: 'stage.trial.loi-kiep' });
    const run = playLocally(st.setup);
    clock += 10 * 60000;
    const r = await c('/api/ll/battle/finish', { battleId: st.battleId, inputs: run.inputs, hash: run.local.hash });
    assert.equal(r.ok, true, r.message);
    if (r.trial.passed) passed = r;
  }
  assert.ok(passed, 'bot phải vượt Lôi Kiếp trong 10 lần');
  assert.equal(passed.trial.realmName, 'Kim Đan'); assert.equal(passed.trial.quality, 'tam-pham');
  assert.equal(passed.avatar.label, 'Kim Đan Sơ Kỳ');
  assert.deepEqual(passed.avatar.inventory.filter(i => i.id.startsWith('item.ket') || i.id.startsWith('item.xich') || i.id.startsWith('item.loi')), []);
  // Kim Đan Viên Mãn là trần mùa 1
  const kd = L.findIndex(x => x.realmId === 'realm.kim-dan' && x.gate);
  assert.equal(L[kd].gate, 'season');
});

test('mệnh cách: đột phá phẩm Thiên → 3 lượt chọn; chọn đúng thẻ trong lượt; chỉ số và tu vi nhận đổi theo', async () => {
  const L = ll.game.ladder, gate = L.findIndex(x => x.realmId === 'realm.luyen-khi' && x.gate);
  const { c, id } = await freshAvatar('menhcach', 'path.the-tu');
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=? WHERE id=?').run(gate, L[gate].qi, id);
  addItems(ll.db, id, { 'item.truc-co-dan': 1, 'item.thanh-van-chi': 1, 'item.lang-vuong-nha': 1, 'item.huyen-giap-tam': 1 }, content);
  const bt = await c('/api/ll/breakthrough', {});
  assert.equal(bt.quality, 'thien'); assert.equal(bt.fatePicks, 3);
  let p = bt.avatar.pendingFates;
  assert.equal(p.left, 3); assert.equal(p.offer.length, 3);
  assert.equal((await c('/api/ll/fate', { fateId: 'fate.khong-co' })).code, 'BAD_FATE');
  const seen = new Set();
  const before = bt.avatar.power;
  let last;
  for (let i = 0; i < 3; i++) {
    const offer = last ? last.avatar.pendingFates.offer : p.offer;
    for (const f of offer) { assert.equal(seen.has(f.id), false, 'không lặp thẻ giữa các lượt'); seen.add(f.id); }
    assert.ok(offer.every(f => !['fate.kiem-cot', 'fate.linh-dong'].includes(f.id)), 'không ra thẻ của đạo lộ khác');
    last = await c('/api/ll/fate', { fateId: offer[0].id });
    assert.equal(last.ok, true, last.message);
  }
  assert.equal(last.avatar.pendingFates, null); assert.equal(last.avatar.fates.length, 3);
  assert.notEqual(last.avatar.power, before);
  assert.equal((await c('/api/ll/fate', { fateId: 'fate.luc-si' })).code, 'NO_OFFER');

  // Ngộ Tính + Thiên Đạo Thù Cần: tu vi nhận từ ải +26% (dùng lại phân thân này — web giới hạn số tài khoản đăng ký mỗi IP)
  const cur = JSON.parse(ll.db.prepare('SELECT payload FROM ll_avatars WHERE id=?').get(id).payload);
  cur.fates = ['fate.ngo-tinh', 'fate.thien-dao-thu-can']; cur.stages = { 'stage.thanh-van.1': { stars: 3, clears: 1 } };
  ll.db.prepare('UPDATE ll_avatars SET payload=? WHERE id=?').run(JSON.stringify(cur), id);
  const sw = await c('/api/ll/battle/sweep', { stageId: 'stage.thanh-van.1' });
  const base = Math.trunc(content.byId.get('stage.thanh-van.1').rewards.qi * 70 / 100);
  assert.equal(sw.reward.qi, Math.trunc(base * 1260 / 1000)); assert.equal(sw.avatar.qiGain, 260);
});

test('bế quan (lớp nghiệp vụ): nhận theo thời gian, đồng hồ đặt lại sau khi nhận, Viên Mãn thì chặn', () => {
  const L = ll.game.ladder, g = ll.game;
  const av = ll.db.prepare("SELECT id, account_id FROM ll_avatars WHERE name='quetai'").get(), user = { id: av.account_id };
  const lk3 = L.findIndex(x => x.realmId === 'realm.luyen-khi' && x.tangNo === 3);
  const t0 = clock;
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=0, payload=? WHERE id=?').run(lk3, JSON.stringify({ breakthroughs: [], stages: {}, idleFrom: t0 }), av.id);
  assert.equal(g.claimIdle(user, t0 + 60000).code, 'TOO_SOON');
  const t1 = t0 + 2 * 3600000, v = g.view(user.id, t1);
  assert.equal(v.idle.minutes, 120); assert.equal(v.idle.qi, Math.floor(L[lk3].qi * 80 / 1000));
  const r = g.claimIdle(user, t1);
  assert.equal(r.ok, true, r.message); assert.equal(r.idle.qi, v.idle.qi);
  assert.equal(r.avatar.idle.minutes, 0); assert.equal(r.avatar.qi, v.idle.qi);
  const gate = L.findIndex(x => x.realmId === 'realm.luyen-khi' && x.gate);
  ll.db.prepare('UPDATE ll_avatars SET step=?, qi=? WHERE id=?').run(gate, L[gate].qi, av.id);
  assert.equal(g.claimIdle(user, t1 + 3600000).code, 'FULL');
});
