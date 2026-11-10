// Lịch luyện — ải. arena px; timeLimit giây; waves: đợt quái.
// wave.when: 'start' | 'clear' (khi đợt trước chết hết). spawn: { monster, count, at: [x,y] px (tâm cụm) }.
// rewards: thưởng khi thắng (3 sao đủ, 2 sao 80%, 1 sao 60%); quét (tự động, cần 3 sao) nhận 70%.
// requires: ải phải thắng trước (null = mở sẵn).
// drops: rơi mỗi lần thắng { item, min, max, chance (‰) }. firstClear: thưởng lần thắng đầu tiên.
const W = (when, ...spawn) => ({ when, spawn: spawn.map(([monster, count, x, y]) => ({ monster, count, at: [x, y] })) });
const LANG = 'monster.yeu-lang', XA = 'monster.doc-xa', HUNG = 'monster.thiet-giap-hung';

// Thanh Vân Châu (Luyện Khí): 10 ải, boss ở ải 5 và 10. Cấp ải ≈ bậc tu luyện người chơi nên có. Tên ải ở text/vi.js.
const thanhVan = [
  [[W('start', [LANG, 3, 700, 300]), W('clear', [LANG, 2, 760, 160], [XA, 2, 800, 460]), W('clear', [HUNG, 1, 760, 300])]],
  [[W('start', [LANG, 4, 720, 300]), W('clear', [LANG, 3, 780, 150], [LANG, 2, 780, 470])]],
  [[W('start', [XA, 3, 760, 300]), W('clear', [XA, 2, 800, 140], [LANG, 3, 700, 460])]],
  [[W('start', [LANG, 3, 700, 200], [XA, 1, 820, 480]), W('clear', [LANG, 3, 760, 420], [XA, 2, 820, 140])]],
  [[W('start', [LANG, 3, 700, 300]), W('clear', [XA, 3, 800, 300]), W('clear', [HUNG, 1, 760, 300], [LANG, 2, 820, 140])]],
  [[W('start', [LANG, 5, 720, 300]), W('clear', [XA, 4, 800, 300])]],
  [[W('start', [XA, 5, 780, 300]), W('clear', [LANG, 4, 720, 300], [XA, 2, 840, 120])]],
  [[W('start', [LANG, 4, 720, 180], [LANG, 3, 720, 440]), W('clear', [HUNG, 1, 780, 300], [XA, 2, 840, 460])]],
  [[W('start', [LANG, 4, 700, 300], [XA, 3, 840, 300]), W('clear', [LANG, 4, 760, 150], [XA, 3, 760, 470])]],
  [[W('start', [LANG, 4, 720, 300]), W('clear', [XA, 4, 800, 300]), W('clear', [HUNG, 2, 760, 300])]],
];

const DROPS = {
  common: [{ item: 'item.linh-thao', min: 1, max: 3, chance: 800 }, { item: 'item.yeu-lang-bi', min: 1, max: 2, chance: 600 }],
  xa: [{ item: 'item.doc-xa-dam', min: 1, max: 1, chance: 450 }],
  boss: [{ item: 'item.thiet-tinh', min: 1, max: 2, chance: 700 }],
};

export default thanhVan.map(([waves], i) => {
  const n = i + 1, id = 'stage.thanh-van.' + n, hasXa = waves.some(w => w.spawn.some(s => s.monster === XA)), hasBoss = waves.some(w => w.spawn.some(s => s.monster === HUNG));
  const drops = [...DROPS.common, ...(hasXa ? DROPS.xa : []), ...(hasBoss ? DROPS.boss : [])];
  // Vật phẩm đột phá Trúc Cơ: Trúc Cơ Đan ở ải cuối; ba vật phẩm tăng phẩm rơi hiếm ở các ải giữa/cuối (lý do quay lại cày)
  if (n === 3 || n === 6) drops.push({ item: 'item.thanh-van-chi', min: 1, max: 1, chance: 120 });
  if (n === 5 || n === 8) drops.push({ item: 'item.lang-vuong-nha', min: 1, max: 1, chance: 100 });
  if (n === 9 || n === 10) drops.push({ item: 'item.huyen-giap-tam', min: 1, max: 1, chance: 80 });
  if (n === 10) drops.push({ item: 'item.truc-co-dan', min: 1, max: 1, chance: 150 });
  return {
    id, nameKey: id, map: 'map.thanh-van-chau', level: n,
    arena: [960, 600], playerStart: [160, 300], timeLimit: 180,
    requires: n === 1 ? null : 'stage.thanh-van.' + (n - 1),
    rewards: { qi: 60 + 40 * n, linhThach: 20 + 10 * n },
    drops,
    firstClear: n === 10 ? [{ item: 'item.truc-co-dan', count: 1 }] : n === 5 ? [{ item: 'item.thanh-van-chi', count: 1 }] : [],
    waves,
  };
});
