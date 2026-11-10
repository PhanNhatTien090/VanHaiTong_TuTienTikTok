import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRng, restoreRng, hashSeed } from '../lich-luyen/core/rng.mjs';
import { DIRS, DIR_SCALE, isqrt, dirTo, step, mulDiv, quantizeStick } from '../lich-luyen/core/fixed.mjs';
import { loadContent, validateContent, t, fnv64, stableJson } from '../lich-luyen/content/index.js';
import realms, { REALM_CURVE } from '../lich-luyen/content/realms.js';
import paths from '../lich-luyen/content/paths.js';
import roots from '../lich-luyen/content/roots.js';
import vi from '../lich-luyen/content/text/vi.js';
import skills from '../lich-luyen/content/skills.js';
import monsters from '../lich-luyen/content/monsters.js';
import stages from '../lich-luyen/content/stages.js';
import { buildLadder, stepLabel, addQi, breakthrough, newCultivation } from '../lich-luyen/core/progression.mjs';
import { rollDrops, starsFor, stageReward } from '../lich-luyen/core/loot.mjs';
import items from '../lich-luyen/content/items.js';

const raw = () => structuredClone({ realms, paths, roots, curve: REALM_CURVE, skills, monsters, stages, items });

test('rng: cùng seed cùng dãy; giá trị vàng không đổi giữa các lần chạy/máy', () => {
  const a = createRng('battle:abc'), b = createRng('battle:abc');
  const seqA = Array.from({ length: 8 }, () => a.next()), seqB = Array.from({ length: 8 }, () => b.next());
  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, Array.from({ length: 8 }, () => createRng('battle:abd').next()));
  // Giá trị vàng: nếu đổi thuật toán, mọi trận đã lưu sẽ không chạy lại được → test phải đỏ.
  assert.deepEqual(hashSeed('lich-luyen'), hashSeed('lich-luyen'));
  const golden = createRng('golden'); const g = [golden.int(1000), golden.int(1000), golden.int(1000), golden.int(6)];
  assert.deepEqual(g, GOLDEN);
});
const GOLDEN = [734, 288, 53, 5]; // ghi cứng 10/11/2026 — đổi là vỡ mọi trận đã lưu

test('rng: int trong khoảng, weighted theo trọng số, fork độc lập, save/restore', () => {
  const r = createRng(7);
  for (let i = 0; i < 2000; i++) { const x = r.int(7); assert.ok(x >= 0 && x < 7 && Number.isInteger(x)); }
  const counts = { a: 0, b: 0 }; const w = createRng('w');
  for (let i = 0; i < 10000; i++) counts[w.weighted([{ id: 'a', weight: 1 }, { id: 'b', weight: 3 }]).id]++;
  assert.ok(counts.b > counts.a * 2.5 && counts.b < counts.a * 3.5, JSON.stringify(counts));
  assert.throws(() => w.weighted([{ weight: 0.5 }]), RangeError);
  const base = createRng('f'), saved = base.save(), f1 = base.fork('loot').next();
  assert.equal(restoreRng(saved).fork('loot').next(), f1);
  assert.notEqual(restoreRng(saved).fork('combat').next(), f1);
  const s = createRng('s'); s.next(); const snap = s.save(); const x = s.next();
  assert.equal(restoreRng(snap).next(), x);
  assert.throws(() => restoreRng([1, 2, 3]), TypeError);
});

test('fixed: bảng 64 hướng dài ~10000, dirTo ngược với bảng, isqrt đúng', () => {
  assert.equal(DIRS.length, 64);
  DIRS.forEach(([x, y], i) => { const len = isqrt(x * x + y * y); assert.ok(Math.abs(len - DIR_SCALE) <= 1, `hướng ${i} dài ${len}`); assert.equal(dirTo(x, y), i); });
  for (const n of [0, 1, 2, 3, 4, 15, 16, 17, 99, 100, 101, 2 ** 40 + 12345]) { const r = isqrt(n); assert.ok(r * r <= n && (r + 1) * (r + 1) > n, `isqrt(${n})=${r}`); }
  assert.deepEqual(step(0, 0, 0, 500), [500, 0]);
  assert.deepEqual(step(0, 0, 16, 500), [0, 500]);
  assert.equal(mulDiv(-7, 3, 2), -10);
  assert.equal(quantizeStick(0.1, 0.1), -1);
  assert.equal(quantizeStick(1, 0), 0);
  assert.equal(quantizeStick(0, -1), 48);
});

test('nội dung: nạp được, có phiên bản ổn định, đổi nội dung thì đổi phiên bản', () => {
  const a = loadContent(), b = loadContent();
  assert.equal(a.version, b.version);
  assert.match(a.version, /^[0-9a-f]{16}$/);
  const changed = raw(); changed.curve = { ...changed.curve, firstQi: 101 };
  assert.notEqual(loadContent(changed).version, a.version);
  assert.equal(fnv64(stableJson({ b: 1, a: [2] })), fnv64(stableJson({ a: [2], b: 1 })));
  assert.equal(t(a, 'stage.tang', { n: 3 }), 'Tầng 3');
  assert.equal(a.paths.length, 3);
  assert.equal(a.roots.length, 6);
});

test('nội dung: bộ kiểm tra bắt lỗi ID trùng, thiếu chữ, phẩm đi lùi, tham chiếu hỏng, đường cong đi xuống', () => {
  const bad = (mutate, re) => { const c = raw(); mutate(c); assert.throws(() => validateContent(c, vi), re); };
  bad(c => { c.paths[1].id = c.paths[0].id; }, /ID trùng/);
  bad(c => { c.paths[0].nameKey = 'path.khong-co'; }, /thiếu chữ/);
  bad(c => { c.realms[2].qualities = [...c.realms[2].qualities].reverse(); }, /phẩm cao hơn/);
  bad(c => { c.roots[0].counter = 'root.kim'; }, /tham chiếu hỏng/);
  bad(c => { c.curve.stageGrowth = 95; }, /đi lên/);
  bad(c => { c.realms[5].curve = { stageGrowth: 100, realmJump: 150 }; }, /curve.stageGrowth/);
  bad(c => { c.realms[3].openSeason = null; }, /openSeason/);
  bad(c => { c.paths[0].statMult.atk = 5000; }, /statMult.atk/);
});

test('thang tu luyện: tên bậc theo LIVE, Luyện Khí tầng 1→9→Viên Mãn, có kỳ từ Trúc Cơ, không tràn số, tăng dần', () => {
  const c = loadContent(), L = buildLadder(c);
  const lk = L.filter(s => s.realmId === 'realm.luyen-khi').map(s => stepLabel(c, s));
  assert.deepEqual(lk, [...Array.from({ length: 9 }, (_, i) => 'Luyện Khí Tầng ' + (i + 1)), 'Luyện Khí Viên Mãn']);
  assert.deepEqual(L.filter(s => s.realmId === 'realm.truc-co').map(s => stepLabel(c, s)), ['Trúc Cơ Sơ Kỳ', 'Trúc Cơ Trung Kỳ', 'Trúc Cơ Hậu Kỳ', 'Trúc Cơ Viên Mãn']);
  assert.equal(stepLabel(c, L.at(-1)), 'Diệt Thế Chí Tôn Viên Mãn');
  for (let i = 1; i < L.length; i++) assert.ok(L[i].qi > L[i - 1].qi, `bậc ${i} không tăng`);
  assert.ok(L.every(s => Number.isSafeInteger(s.qi)));
  assert.equal(L.at(-1).gate, 'end');
});

test('trần mùa: mùa 1 dừng ở Kim Đan Viên Mãn, mùa 2 mở tới Hóa Thần', () => {
  const c = loadContent();
  const s1 = buildLadder(c, 1), s2 = buildLadder(c, 2);
  assert.equal(stepLabel(c, s1.find(s => s.gate === 'season')), 'Kim Đan Viên Mãn');
  assert.equal(stepLabel(c, s2.find(s => s.gate === 'season')), 'Hóa Thần Viên Mãn');
});

test('cộng tu vi: lên nhiều tiểu cảnh một lần, dừng ở cổng đột phá, phần thừa bỏ', () => {
  const c = loadContent(), L = buildLadder(c, 1);
  let r = addQi(newCultivation(), 99, L); assert.deepEqual(r.state, { step: 0, qi: 99 }); assert.equal(r.ready, false);
  r = addQi(r.state, 1, L); assert.equal(r.ready, true); assert.equal(r.gate, 'breakthrough'); // Phàm Nhân đầy → chờ khai linh căn
  const lk1 = { step: 1, qi: 0 }, need = L[1].qi + L[2].qi + 5;
  r = addQi(lk1, need, L); assert.deepEqual(r.state, { step: 3, qi: 5 }); assert.equal(r.advanced, 2);
  r = addQi({ step: 1, qi: 0 }, 10 ** 9, L); assert.equal(stepLabel(c, L[r.state.step]), 'Luyện Khí Viên Mãn'); assert.equal(r.ready, true); assert.ok(r.wasted > 0);
  assert.throws(() => addQi(lk1, 1.5, L), RangeError);
});

test('đột phá: phẩm theo số loại vật phẩm, Kim Đan cần Lôi Kiếp, trần mùa chặn', () => {
  const c = loadContent(), L = buildLadder(c, 1);
  const lkFull = { step: L.findIndex(s => s.realmId === 'realm.luyen-khi' && s.gate), qi: 0 };
  lkFull.qi = L[lkFull.step].qi;
  assert.equal(breakthrough({ ...lkFull, qi: 0 }, L, c, { materialTypes: 3 }).code, 'NEED_QI');
  // Trúc Cơ: 0 loại nâng phẩm → Phàm (Trúc Cơ Đan bắt buộc do server kiểm trong túi đồ)
  assert.equal(breakthrough(lkFull, L, c, { materialTypes: 0 }).quality, 'pham');
  const dia = breakthrough(lkFull, L, c, { materialTypes: 2 });
  assert.equal(dia.ok, true); assert.equal(dia.quality, 'dia'); assert.equal(dia.points, 16); assert.equal(dia.fatePicks, 2);
  assert.equal(stepLabel(c, L[dia.state.step]), 'Trúc Cơ Sơ Kỳ');
  assert.equal(breakthrough(lkFull, L, c, { materialTypes: 9 }).quality, 'thien');
  const tcFull = { step: L.findIndex(s => s.realmId === 'realm.truc-co' && s.gate) }; tcFull.qi = L[tcFull.step].qi;
  assert.equal(breakthrough(tcFull, L, c, { materialTypes: 5 }).code, 'NEED_TRIAL');
  const kd = breakthrough(tcFull, L, c, { materialTypes: 5, trialPassed: true });
  assert.equal(kd.quality, 'nhat-pham'); assert.equal(kd.fatePicks, 3);
  const kdFull = { step: L.findIndex(s => s.realmId === 'realm.kim-dan' && s.gate) }; kdFull.qi = L[kdFull.step].qi;
  assert.equal(breakthrough(kdFull, L, c, { materialTypes: 9, trialPassed: true }).code, 'SEASON_CAP');
});

test('core/ và content/ chạy được trên trình duyệt: không import node:, không Math.random/Date', () => {
  const root = path.resolve(import.meta.dirname, '../lich-luyen');
  const files = [];
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(m?js)$/.test(e.name)) files.push(p); } };
  for (const sub of ['core', 'content']) walk(path.join(root, sub));
  assert.ok(files.length >= 7);
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(src, /from ['"]node:/, f);
    assert.doesNotMatch(src, /Math\.random|Date\.now|new Date/, f);
  }
});

test('rơi đồ: tất định theo mã trận, đúng tỉ lệ, thưởng lần đầu chỉ khi firstClear', () => {
  const c = loadContent(), st = c.byId.get('stage.thanh-van.10');
  assert.deepEqual(rollDrops(st, 'bt_x'), rollDrops(st, 'bt_x'));
  assert.equal(rollDrops(st, 'bt_y', { firstClear: true })['item.truc-co-dan'] >= 1, true);
  let dan = 0, thao = 0; const N = 4000;
  for (let i = 0; i < N; i++) { const d = rollDrops(st, 'n' + i); if (d['item.truc-co-dan']) dan++; if (d['item.linh-thao']) thao++; }
  assert.ok(Math.abs(dan / N - 0.15) < 0.03, 'Trúc Cơ Đan ~15%: ' + dan / N);
  assert.ok(Math.abs(thao / N - 0.8) < 0.03, 'Linh Thảo ~80%: ' + thao / N);
  assert.equal(starsFor({ complete: true, victory: true, hpLeft: 600 }), 3);
  assert.equal(starsFor({ complete: true, victory: true, hpLeft: 299 }), 1);
  assert.equal(starsFor({ complete: false, victory: true, hpLeft: 999 }), 0);
  assert.deepEqual(stageReward(st, 3, { sweep: true }), { qi: Math.trunc(st.rewards.qi * 0.7), linhThach: Math.trunc(st.rewards.linhThach * 0.7) });
});

test('bộ kiểm tra bắt lỗi vật phẩm, rơi đồ, yêu cầu đột phá', () => {
  const bad = (mutate, re) => { const c = raw(); mutate(c); assert.throws(() => validateContent(c, vi), re); };
  bad(c => { c.stages[2].drops.push({ item: 'item.khong-co', min: 1, max: 1, chance: 10 }); }, /vật phẩm không tồn tại/);
  bad(c => { c.stages[0].drops[0].chance = 1500; }, /chance/);
  bad(c => { c.stages[0].drops[0].max = 0; }, /min.max sai/);
  bad(c => { c.stages[3].requires = 'stage.khong-co'; }, /requires ải/);
  bad(c => { c.realms[2].boosts = c.realms[2].boosts.slice(0, 2); }, /phẩm cao nhất cần 3/);
  bad(c => { c.realms[2].requires = [{ item: 'item.truc-co-dan', count: 0 }]; }, /requires.count/);
  bad(c => { c.items[0].kind = 'vu-khi'; }, /kind lạ/);
});

test('mệnh cách: rút tất định, không trùng, đúng đạo lộ; phẩm cao dễ ra thẻ hiếm; bộ kiểm tra bắt lỗi', async () => {
  const { rollFateOffers } = await import('../lich-luyen/core/fates.mjs');
  const fates = (await import('../lich-luyen/content/fates.js')).default;
  const c = loadContent();
  const a = rollFateOffers(c, { seed: 'x', pathId: 'path.kiem-tu', picks: 3 });
  assert.deepEqual(a, rollFateOffers(c, { seed: 'x', pathId: 'path.kiem-tu', picks: 3 }));
  assert.equal(new Set(a.flat()).size, 9);
  const rare = luck => { let n = 0; for (let i = 0; i < 600; i++) n += rollFateOffers(c, { seed: 's' + i, pathId: 'path.kiem-tu', picks: 1, luck })[0].filter(id => c.byId.get(id).rarity >= 3).length; return n; };
  assert.ok(rare(160) > rare(0) * 1.4, 'phẩm cao phải ra thẻ hiếm nhiều hơn rõ rệt');
  const bad = (mutate, re) => { const r = raw(); r.fates = structuredClone(fates); mutate(r); assert.throws(() => validateContent(r, vi), re); };
  bad(r => { r.fates[0].effects = [{ stat: 'may-man', permille: 10 }]; }, /chỉ số lạ/);
  bad(r => { r.fates[0].effects = [{ stat: 'hp', permille: 10, flat: 5 }]; }, /đúng một/);
  bad(r => { r.fates[0].path = 'path.dao-tu'; }, /đạo lộ không tồn tại/);
  bad(r => { r.fates = r.fates.slice(0, 5); }, /ít hơn 9 thẻ/);
});
