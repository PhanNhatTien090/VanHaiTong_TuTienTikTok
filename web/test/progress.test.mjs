import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, action } from '../../engine.mjs';
import { enhance, enhanceCost, enhanceBonus, addMats, feedPet, choosePet, petCombat, claimQuest, questView, bumpQuest } from '../progress.mjs';
import { createDungeon, combatStats, dungeonView, stageInfo } from '../dungeon.mjs';

function player(extra = {}) {
  const w = createWorld('live');
  action(w, { type: 'join', userId: 'p1', name: 'Thử' }, 1);
  const p = Object.assign(w.players.p1, { artifacts: ['jade'], equipped: 'jade', stones: 10000 }, extra);
  return { w, p };
}

test('cường hóa: tốn linh thạch + nguyên liệu, luôn thành công, tăng sức mạnh trong bí cảnh', () => {
  const { p } = player();
  assert.equal(enhance(p, 'jade').ok, false); // chưa có Huyền Thiết
  addMats(p, { 'huyen-thiet': 10 });
  const before = combatStats(p).attack;
  const r = enhance(p, 'jade');
  assert.equal(r.ok, true); assert.equal(r.level, 1);
  assert.equal(p.stones, 10000 - enhanceCost(0).stones);
  assert.equal(p.web.mats['huyen-thiet'], 10 - enhanceCost(0).count);
  assert.ok(combatStats(p).attack > before);
  assert.ok(enhanceBonus(p).hp > 0);
  assert.equal(enhance(p, 'bell').ok, false); // không sở hữu
});

test('linh thú: chỉ dùng con đã mở trên LIVE; cho ăn tốn Linh Quả', () => {
  const { p } = player({ spiritPets: ['jade-rabbit'] });
  assert.equal(choosePet(p, 'astral-dragon').ok, false);
  assert.equal(choosePet(p, 'jade-rabbit').ok, true);
  assert.equal(petCombat(p).id, 'jade-rabbit');
  assert.equal(feedPet(p, 'jade-rabbit').ok, false);
  addMats(p, { 'linh-qua': 5 });
  assert.equal(feedPet(p, 'jade-rabbit').level, 2);
  assert.ok(combatStats(p).pet.mult > 0.25);
});

test('nhiệm vụ ngày: nhận khi xong, không nhận hai lần, rương cuối cần nhận hết', () => {
  const { p } = player();
  assert.equal(claimQuest(p, 'enhance').ok, false);
  bumpQuest(p, 'enhance');
  const stones = p.stones;
  assert.equal(claimQuest(p, 'enhance').ok, true);
  assert.ok(p.stones > stones);
  assert.equal(claimQuest(p, 'enhance').ok, false);
  assert.equal(claimQuest(p, 'bonus').ok, false);
  assert.equal(questView(p).quests.find(q => q.id === 'enhance').claimed, true);
});

test('bí cảnh: thắng thì rơi nguyên liệu, tính nhiệm vụ; vùng 2 khóa tới khi đủ cảnh giới và qua vùng 1', () => {
  const { w, p } = player({ realm: 3 });
  const d = createDungeon();
  assert.equal(dungeonView(p).zones[1].locked, true);
  for (let stage = 1; stage <= 3; stage++) {
    const s = d.start(w, p, 'z1', stage, 1000);
    assert.equal(s.ok, true, s.message);
    const r = d.finish(w, p, { battleId: s.battleId, victory: true, hpLeft: 1 }, 1000 + 10 * 60000);
    assert.equal(r.ok, true, r.message);
    assert.ok(Object.values(r.reward.mats).some(v => v > 0));
  }
  assert.equal(questView(p, 1000 + 10 * 60000).quests.find(q => q.id === 'clear').done, true);
  assert.equal(dungeonView(p).zones[1].locked, false);
  assert.equal(stageInfo('z2', 1).waves[0].enemies[0].atlas.includes('celestial'), true);
  // Gửi kết quả quá nhanh bị từ chối
  const s = d.start(w, p, 'z2', 1, 2e6);
  assert.equal(d.finish(w, p, { battleId: s.battleId, victory: true, hpLeft: 1 }, 2e6 + 100).ok, false);
});

test('sự kiện LIVE: web đánh bản riêng của boss LIVE, thưởng ×2, mỗi sự kiện thắng một lần', async () => {
  const { liveView } = await import('../live-view.mjs');
  const { w, p } = player({ realm: 2 });
  const now = 5e6;
  const state = { players: [{ id: 'x', name: 'Người LIVE', active: true, realm: 1, totalQi: 1, lastActive: now }], feed: [], boss: { id: 'raid-1', species: 'storm-tiger', name: 'Lôi Hổ Thiên Kiếp', hp: 500, maxHp: 900, endsAt: now + 60000 } };
  const ev = liveView(state, now).event;
  assert.equal(ev.kind, 'boss'); assert.equal(ev.species, 'thunder-tiger');
  const d = createDungeon();
  const s = d.startEvent(w, p, ev, now);
  assert.equal(s.ok, true, s.message);
  assert.equal(s.info.event, true); assert.equal(s.info.cost, 0);
  const r = d.finish(w, p, { battleId: s.battleId, victory: true, hpLeft: 0.9 }, now + 10 * 60000);
  assert.equal(r.ok, true, r.message);
  assert.ok(r.reward.mats['huyen-thiet'] >= 4); // ×2 nguyên liệu
  assert.equal(d.startEvent(w, p, ev, now + 11 * 60000).ok, false); // đã thắng sự kiện này
  assert.equal(liveView({ ...state, boss: null }, now).event, null);
});

test('Tháp Trấn Yêu: leo từng tầng, thua tốn lượt, hết 10 lượt/ngày, có xếp hạng', async () => {
  const { towerView, towerRanking, TOWER_DAILY } = await import('../dungeon.mjs');
  const { w, p } = player({ realm: 3 });
  const d = createDungeon(), t0 = Date.parse('2026-11-03T10:00:00+07:00');
  let s = d.startTower(w, p, t0);
  assert.equal(s.ok, true); assert.equal(s.info.floor, 1);
  assert.equal(d.finish(w, p, { battleId: s.battleId, victory: true, hpLeft: 1 }, t0 + 600000).floor, 1);
  s = d.startTower(w, p, t0 + 700000);
  assert.equal(s.info.floor, 2);
  d.finish(w, p, { battleId: s.battleId, victory: false }, t0 + 710000);
  assert.equal(towerView(p, t0 + 720000).best, 1);
  assert.equal(towerView(p, t0 + 720000).left, TOWER_DAILY - 2);
  for (let i = 0; i < TOWER_DAILY - 2; i++) { const x = d.startTower(w, p, t0 + 800000); d.finish(w, p, { battleId: x.battleId, victory: false }, t0 + 801000); }
  assert.equal(d.startTower(w, p, t0 + 900000).ok, false);
  assert.equal(towerRanking(Object.values(w.players))[0].floor, 1);
});

test('08/11: thần thú (Kỳ Lân, Lôi Oa, Văn Thú) hiện trên web khi sở hữu, có kỹ năng trợ chiến mạnh theo cấp', async () => {
  const { petView, petCombat, petExtraDps, PET_SKILLS } = await import('../progress.mjs');
  const { ALL_PETS } = await import('../../public/spirit-pets.js');
  for (const x of ALL_PETS) assert.ok(PET_SKILLS[x.id], 'thiếu kỹ năng cho ' + x.id);
  const p = { id: 'u', spiritPets: ['ky-lan', 'loi-oa', 'van-thu'], spiritPet: 'ky-lan', web: {} };
  const v = petView(p), ids = v.pets.map(x => x.id);
  assert.ok(['ky-lan', 'loi-oa', 'van-thu'].every(id => ids.includes(id)));
  assert.ok(v.pets.find(x => x.id === 'ky-lan').skill.name.length > 0);
  const c1 = petCombat(p); assert.ok(c1.skill.shield > 0 && c1.skill.hot && c1.skill.burn && c1.mult >= 0.85);
  p.web.petLv = { 'ky-lan': 11 }; const c11 = petCombat(p); assert.ok(c11.skill.shield > c1.skill.shield);
  p.spiritPet = 'loi-oa'; assert.ok(petCombat(p).skill.stun > 0 && petExtraDps(petCombat(p)) > 0);
  p.spiritPet = 'van-thu'; const vt = petCombat(p); assert.ok(vt.flying && vt.skill.leech > 0);
  const stranger = { id: 's', spiritPets: [], web: {} }; assert.ok(!petView(stranger).pets.some(x => x.id === 'ky-lan'));
});
