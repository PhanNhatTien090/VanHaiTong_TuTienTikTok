// Lịch luyện — quái. stats ở cấp 1; ải nhân theo cấp (core/sim/battle.mjs: scaleMonster).
// ai: 'chase' (áp sát, đánh khi trong tầm) | 'kite' (giữ khoảng cách, bắn) — thêm AI mới = thêm hàm trong sim/ai.
// radius px, speed px/giây, attackRange px.
export default [
  { id: 'monster.yeu-lang', nameKey: 'monster.yeu-lang', ai: 'chase', radius: 22, speed: 150, attackRange: 55,
    stats: { hp: 180, atk: 14, def: 4, crit: 50, critDmg: 1500 }, skills: ['skill.quai.cao-xe'] },
  { id: 'monster.doc-xa', nameKey: 'monster.doc-xa', ai: 'kite', radius: 18, speed: 120, attackRange: 360, preferRange: 260,
    stats: { hp: 120, atk: 16, def: 2, crit: 50, critDmg: 1500 }, skills: ['skill.quai.doc-dich'] },
  { id: 'monster.thiet-giap-hung', nameKey: 'monster.thiet-giap-hung', ai: 'chase', radius: 40, speed: 110, attackRange: 70, boss: true,
    stats: { hp: 2200, atk: 22, def: 10, crit: 80, critDmg: 1600 }, skills: ['skill.quai.cao-xe', 'skill.quai.huc-dia'] },
];
