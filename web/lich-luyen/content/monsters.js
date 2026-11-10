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
  // Lạc Hà Châu (Trúc Cơ)
  { id: 'monster.hoa-ho', nameKey: 'monster.hoa-ho', ai: 'kite', radius: 18, speed: 150, attackRange: 340, preferRange: 240,
    stats: { hp: 110, atk: 13, def: 2, crit: 60, critDmg: 1500 }, skills: ['skill.quai.hoa-cau'] },
  { id: 'monster.thach-vien', nameKey: 'monster.thach-vien', ai: 'chase', radius: 28, speed: 115, attackRange: 60,
    stats: { hp: 300, atk: 13, def: 9, crit: 40, critDmg: 1500 }, skills: ['skill.quai.cao-xe', 'skill.quai.dam-dat'] },
  { id: 'monster.xich-luyen-xa', nameKey: 'monster.xich-luyen-xa', ai: 'chase', radius: 44, speed: 125, attackRange: 90, boss: true,
    stats: { hp: 2400, atk: 19, def: 10, crit: 80, critDmg: 1600 }, skills: ['skill.quai.cao-xe', 'skill.quai.doc-vu'] },
];
