import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, action } from '../../engine.mjs';
import { enhance, enhanceBonus, addMats, feedPet, choosePet, petCombat, claimQuest, questView, bumpQuest } from '../progress.mjs';
import { createDungeon, combatStats, dungeonView, stageInfo } from '../dungeon.mjs';

function player(extra = {}) {
  const w = createWorld('live');
  action(w, { type: 'join', userId: 'p1', name: 'Thử' }, 1);
  const p = Object.assign(w.players.p1, { artifacts: ['jade'], equipped: 'jade', stones: 10000 }, extra);
  return { w, p };
}

test('18/11: web không nâng cấp — cường hóa và cho ăn bị khóa, không cộng chỉ số riêng', () => {
  const { p } = player({ spiritPets: ['jade-rabbit'], spiritPet: 'jade-rabbit', web: { enhance: { jade: 7 }, petLv: { 'jade-rabbit': 15 } } });
  addMats(p, { 'huyen-thiet': 10, 'linh-qua': 50 });
  const before = JSON.stringify(p);
  assert.equal(enhance(p, 'jade').ok, false);
  assert.equal(feedPet(p, 'jade-rabbit').ok, false);
  assert.equal(JSON.stringify(p), before);
  assert.deepEqual(enhanceBonus(p), { attack: 0, hp: 0, level: 0 }); // cường hóa cũ trên web không còn tác dụng
  assert.equal(combatStats(p).attack, combatStats(p).basePower);
  assert.equal(petCombat(p).level, 1); // bỏ cấp nuôi riêng trên web (15) → theo LIVE
});

test('18/11: cấp + giai đoạn linh thú lấy đúng theo LIVE (livePets)', async () => {
  const { petView } = await import('../progress.mjs');
  const { p } = player({ spiritPets: ['jade-rabbit', 'ember-fox'], livePets: { 'ember-fox': { level: 6, stage: 1 } } });
  assert.equal(choosePet(p, 'astral-dragon').ok, false);
  assert.equal(choosePet(p, 'ember-fox').ok, true);
  assert.equal(petCombat(p).level, 6);
  const v = petView(p), fox = v.pets.find(x => x.id === 'ember-fox');
  assert.equal(fox.level, 6); assert.equal(fox.stage, 1); assert.equal(fox.stageName, 'Chiến Linh');
  assert.equal(v.pets.find(x => x.id === 'jade-rabbit').level, 1);
  assert.equal('feedCost' in fox, false);
});

test('nhiệm vụ ngày: nhận khi xong, không nhận hai lần, rương cuối cần nhận hết; không còn nhiệm vụ cường hóa', () => {
  const { p } = player();
  assert.equal(questView(p).quests.some(q => q.id === 'enhance'), false);
  assert.equal(claimQuest(p, 'gather').ok, false);
  bumpQuest(p, 'gather', 2);
  const stones = p.stones;
  assert.equal(claimQuest(p, 'gather').ok, true);
  assert.ok(p.stones > stones);
  assert.equal(claimQuest(p, 'gather').ok, false);
  assert.equal(claimQuest(p, 'bonus').ok, false);
  assert.equal(questView(p).quests.find(q => q.id === 'gather').claimed, true);
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
  p.livePets = { 'ky-lan': { level: 11, stage: 1 } }; const c11 = petCombat(p); assert.ok(c11.skill.shield > c1.skill.shield);
  p.spiritPet = 'loi-oa'; assert.ok(petCombat(p).skill.stun > 0 && petExtraDps(petCombat(p)) > 0);
  p.spiritPet = 'van-thu'; const vt = petCombat(p); assert.ok(vt.flying && vt.skill.leech > 0);
  const stranger = { id: 's', spiritPets: [], web: {} }; assert.ok(!petView(stranger).pets.some(x => x.id === 'ky-lan'));
});

test('18/11: Bảo Khố web — thần khí + tọa kỹ đúng sao/chỉ số LIVE, chỉ đổi bản mệnh / cưỡi', async () => {
  const { treasuryView, chooseBao, chooseMount } = await import('../collection.mjs');
  const { baoStat } = await import('../../public/phap-bao-data.js');
  const { mountStat } = await import('../../public/mounts.js');
  const { p } = player({ bao: { p4: 3, p5: 20, items: { 's4-kiem': 3, 'L12-huyet-hai-dao': 1 }, lim: null }, mounts: { 'kim-tru': { stars: 2, at: 1 } }, mount: null });
  let v = treasuryView(p);
  assert.equal(v.bao.items[0].id, 'L12-huyet-hai-dao'); // tự lấy món mạnh nhất làm bản mệnh như LIVE
  assert.equal(v.bao.ban, 'L12-huyet-hai-dao');
  const kiem = v.bao.items.find(x => x.id === 's4-kiem');
  assert.equal(kiem.stars, 3);
  assert.equal(kiem.stats.find(x => x.key === 'atk').value, baoStat('s4-kiem', 3, 'atk'));
  assert.equal(v.mounts.items[0].stats[0].value, mountStat('kim-tru', 2, 'stones'));
  assert.equal(chooseBao(p, 's5-kiem').ok, false); // không sở hữu
  assert.equal(chooseBao(p, 's4-kiem').ok, true);
  assert.equal(p.bao.ban, 's4-kiem');
  assert.deepEqual(p.bao.items, { 's4-kiem': 3, 'L12-huyet-hai-dao': 1 }); // không đổi sao
  assert.equal(chooseMount(p, 'con-bang').ok, false);
  assert.equal(chooseMount(p, 'kim-tru').ok, true); assert.equal(p.mount, 'kim-tru');
  assert.equal(treasuryView(p).mounts.riding, 'kim-tru');
  assert.equal(chooseMount(p, 'none').ok, true); assert.equal(p.mount, null);
  assert.deepEqual(p.mounts, { 'kim-tru': { stars: 2, at: 1 } });
});
