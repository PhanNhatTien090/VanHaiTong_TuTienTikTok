// Lịch luyện — ải. arena px; timeLimit giây; waves: đợt quái.
// wave.when: 'start' | 'clear' (khi đợt trước chết hết). spawn: { monster, count, at: [x,y] px (tâm cụm) }.
// rewards: thưởng khi thắng (3 sao đủ, 2 sao 80%, 1 sao 60%); tự động chiến đấu nhận 70%.
export default [
  {
    id: 'stage.thanh-van.1', nameKey: 'stage.thanh-van.1', map: 'map.thanh-van-chau', level: 1,
    arena: [960, 600], playerStart: [160, 300], timeLimit: 180, rewards: { qi: 120, linhThach: 30 },
    waves: [
      { when: 'start', spawn: [{ monster: 'monster.yeu-lang', count: 3, at: [700, 300] }] },
      { when: 'clear', spawn: [{ monster: 'monster.yeu-lang', count: 2, at: [760, 160] }, { monster: 'monster.doc-xa', count: 2, at: [800, 460] }] },
      { when: 'clear', spawn: [{ monster: 'monster.thiet-giap-hung', count: 1, at: [760, 300] }] },
    ],
  },
];
