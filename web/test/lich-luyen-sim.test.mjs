import test from 'node:test';
import assert from 'node:assert/strict';
import { loadContent, validateContent } from '../lich-luyen/content/index.js';
import realms, { REALM_CURVE } from '../lich-luyen/content/realms.js';
import paths from '../lich-luyen/content/paths.js';
import roots from '../lich-luyen/content/roots.js';
import skills from '../lich-luyen/content/skills.js';
import monsters from '../lich-luyen/content/monsters.js';
import stages from '../lich-luyen/content/stages.js';
import vi from '../lich-luyen/content/text/vi.js';
import { createBattle, tick } from '../lich-luyen/core/sim/battle.mjs';
import { encodeInputs, decodeInputs, BTN } from '../lich-luyen/core/sim/inputs.mjs';
import { runBot, runReplay, verifyReplay } from '../lich-luyen/core/sim/replay.mjs';

const content = loadContent();
const STAGE = 'stage.thanh-van.1';
const BASE = { hp: 600, mp: 100, atk: 30, def: 8, spd: 220, crit: 100, critDmg: 1500 };
const statsFor = pathId => { const m = content.byId.get(pathId).statMult; return Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, m[k] ? Math.trunc(v * m[k] / 1000) : v])); };
const setup = (pathId, seed = 's') => ({ seed, stageId: STAGE, player: { pathId, stats: statsFor(pathId) } });
const PATHS = ['path.kiem-tu', 'path.the-tu', 'path.phap-tu'];

test('chạy lại từ đầu vào ra ĐÚNG kết quả của trận gốc, cả 3 đạo lộ', () => {
  for (const pid of PATHS) {
    const run = runBot(content, setup(pid, 'r-' + pid));
    const rep = runReplay(content, setup(pid, 'r-' + pid), encodeInputs(run.frames));
    assert.equal(rep.hash, run.result.hash, pid);
    assert.equal(rep.victory, run.result.victory);
    assert.equal(rep.complete, true);
  }
});

test('trận vàng: seed cố định cho mã băm cố định (đổi luật trận/nội dung → test đỏ, phải xác nhận rồi cập nhật)', () => {
  const r = runBot(content, { seed: 'golden', stageId: STAGE, player: { pathId: 'path.kiem-tu', stats: { hp: 570, mp: 100, atk: 33, def: 7, spd: 231, crit: 130, critDmg: 1650 } } });
  assert.deepEqual([r.result.hash, r.result.ticks, r.result.victory], ['d15c6342ed67d276', 976, true],
    'Kết quả trận vàng đổi. Nếu cố ý đổi luật trận hoặc nội dung: cập nhật giá trị này; trận cũ đã lưu sẽ phải chạy bằng contentVersion cũ.');
});

test('sửa đầu vào hay báo kết quả giả thì server phát hiện; thiếu đầu vào thì không thưởng', () => {
  const s = setup('path.kiem-tu', 'cheat');
  const run = runBot(content, s), rle = encodeInputs(run.frames);
  const honest = verifyReplay(content, s, rle, { hash: run.result.hash });
  assert.equal(honest.mismatch, false); assert.equal(honest.accepted, true);
  // Báo thắng giả với đầu vào thật: thưởng theo server, hash lệch bị ghi nhận
  assert.equal(verifyReplay(content, s, rle, { hash: 'ffffffffffffffff' }).mismatch, true);
  // Chỉnh đầu vào: bỏ hết nút đánh → server ra kết quả khác
  const noAttack = encodeInputs(run.frames.map(f => ({ dir: f.dir, buttons: f.buttons & ~BTN.ATTACK })));
  const tampered = runReplay(content, s, noAttack);
  assert.notEqual(tampered.hash, run.result.hash);
  // Cắt đầu vào giữa chừng → trận chưa xong → không nhận
  const half = encodeInputs(run.frames.slice(0, Math.trunc(run.frames.length / 2)));
  assert.equal(runReplay(content, s, half).complete, false);
});

test('seed khác → diễn biến khác; cùng seed cùng đầu vào → giống hệt', () => {
  const a = runBot(content, setup('path.phap-tu', 'x1')).result.hash;
  assert.equal(runBot(content, setup('path.phap-tu', 'x1')).result.hash, a);
  assert.notEqual(runBot(content, setup('path.phap-tu', 'x2')).result.hash, a);
});

test('đầu vào: mã hóa/giải mã khớp; từ chối giá trị sai và dữ liệu dài hơn thời gian trận', () => {
  const frames = [{ dir: -1, buttons: 0 }, { dir: -1, buttons: 0 }, { dir: 5, buttons: 1 }, { dir: 5, buttons: 1 }, { dir: 63, buttons: 15 }];
  const rle = encodeInputs(frames);
  assert.deepEqual(rle, [[2, -1, 0], [2, 5, 1], [1, 63, 15]]);
  assert.deepEqual([...decodeInputs(rle, 10).frames()], frames);
  assert.throws(() => decodeInputs([[11, 0, 0]], 10), /dài hơn/);
  assert.throws(() => decodeInputs([[1, 64, 0]], 10), RangeError);
  assert.throws(() => decodeInputs([[1, 0, 16]], 10), RangeError);
  assert.throws(() => decodeInputs([[0, 0, 0]], 10), RangeError);
  assert.throws(() => decodeInputs({}, 10), TypeError);
  assert.throws(() => encodeInputs([{ dir: 1.5, buttons: 0 }]), RangeError);
  const state = createBattle(content, setup('path.kiem-tu'));
  assert.throws(() => tick(content, state, { dir: 99, buttons: 0 }), RangeError);
});

test('hết giờ là thua; đứng yên không đánh thì không thắng được', () => {
  const s = { ...setup('path.the-tu', 'idle'), maxTicks: 300 };
  const state = createBattle(content, s);
  while (!state.over) tick(content, state, { dir: -1, buttons: 0 });
  assert.equal(state.victory, false);
  assert.ok(state.timeout || !state.player.alive);
});

test('cân bằng sơ bộ: bot cả 3 đạo lộ thắng ải mẫu ≥ 90% với chỉ số chuẩn', () => {
  for (const pid of PATHS) {
    let wins = 0;
    for (let i = 0; i < 20; i++) wins += runBot(content, setup(pid, 'bal' + i)).result.victory ? 1 : 0;
    assert.ok(wins >= 18, `${pid} chỉ thắng ${wins}/20`);
  }
});

test('hiệu năng: một trận đầy đủ chạy lại dưới 100 ms (server kiểm tra được nhiều trận)', () => {
  const run = runBot(content, setup('path.phap-tu', 'perf')), rle = encodeInputs(run.frames);
  const t0 = performance.now(); for (let i = 0; i < 5; i++) runReplay(content, setup('path.phap-tu', 'perf'), rle);
  assert.ok((performance.now() - t0) / 5 < 100);
});

test('bộ kiểm tra nội dung bắt lỗi chiêu/quái/ải', () => {
  const raw = () => structuredClone({ realms, paths, roots, curve: REALM_CURVE, skills, monsters, stages });
  const bad = (mutate, re) => { const c = raw(); mutate(c); assert.throws(() => validateContent(c, vi), re); };
  bad(c => { c.skills[0].action.type = 'laser'; }, /loại đòn lạ/);
  bad(c => { c.skills[0].effects = [{ type: 'poison', mult: 1 }]; }, /hiệu ứng lạ/);
  bad(c => { c.skills[0].effects = []; }, /ít nhất một hiệu ứng/);
  bad(c => { c.paths[0].kit.attack = 'skill.kiem.ngu-phong-bo'; }, /không thuộc ô attack/);
  bad(c => { c.monsters[0].skills = ['skill.khong-co']; }, /chiêu không tồn tại/);
  bad(c => { c.stages[0].waves[0].spawn[0].monster = 'monster.rong'; }, /quái không tồn tại/);
  bad(c => { c.stages[0].waves[0].spawn[0].at = [5000, 10]; }, /ngoài sân/);
  bad(c => { c.stages[0].waves[0].when = 'clear'; }, /đợt đầu/);
});

test('thử thách: không có quái thì không tự thắng; sống tới survive mới thắng; đứng yên bị sét đánh chết; chạy lại khớp', () => {
  const s = { seed: 'trial', stageId: 'stage.trial.loi-kiep', player: { pathId: 'path.kiem-tu', stats: statsFor('path.kiem-tu') } };
  const b = createBattle(content, s);
  tick(content, b, { dir: -1, buttons: 0 });
  assert.equal(b.over, false, 'không được thắng ngay vì không có quái');
  while (!b.over) tick(content, b, { dir: -1, buttons: 0 });
  assert.equal(b.victory, false); assert.ok(b.stats.struck > 0);
  const big = { ...s, player: { ...s.player, stats: { ...s.player.stats, hp: 10 ** 7 } } };
  const run = runBot(content, big);
  assert.equal(run.result.victory, true); assert.equal(run.result.ticks, 48 * 30);
  assert.equal(runReplay(content, big, encodeInputs(run.frames)).hash, run.result.hash);
});
