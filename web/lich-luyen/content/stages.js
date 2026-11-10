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

const thanhVanStages = thanhVan.map(([waves], i) => {
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

// Lạc Hà Châu (Trúc Cơ): 10 ải, cần cảnh giới Trúc Cơ + đã qua Thanh Vân Đỉnh. Rơi vật phẩm nâng phẩm Kim Đan; Kết Đan Đan ở ải cuối.
const HO = 'monster.hoa-ho', VIEN = 'monster.thach-vien', XLX = 'monster.xich-luyen-xa';
const lacHa = [
  [W('start', [HO, 3, 760, 300]), W('clear', [VIEN, 2, 720, 160], [HO, 2, 820, 460])],
  [W('start', [VIEN, 3, 720, 300]), W('clear', [VIEN, 2, 760, 150], [HO, 3, 820, 440])],
  [W('start', [HO, 4, 780, 300]), W('clear', [LANG, 4, 700, 300], [HO, 2, 840, 120])],
  [W('start', [VIEN, 2, 700, 200], [HO, 2, 820, 460]), W('clear', [VIEN, 3, 760, 400], [XA, 2, 840, 140])],
  [W('start', [HO, 3, 760, 300]), W('clear', [VIEN, 3, 740, 300]), W('clear', [XLX, 1, 760, 300])],
  [W('start', [VIEN, 4, 720, 300]), W('clear', [HO, 5, 800, 300])],
  [W('start', [HO, 5, 780, 300], [XA, 2, 840, 120]), W('clear', [VIEN, 4, 720, 300])],
  [W('start', [VIEN, 3, 720, 180], [VIEN, 2, 720, 440]), W('clear', [XLX, 1, 780, 300], [HO, 2, 840, 460])],
  [W('start', [VIEN, 4, 700, 300], [HO, 3, 840, 300]), W('clear', [VIEN, 3, 760, 150], [HO, 3, 760, 470])],
  [W('start', [HO, 4, 760, 300]), W('clear', [VIEN, 4, 740, 300]), W('clear', [XLX, 1, 700, 200], [HUNG, 1, 780, 420])],
];
const LH_DROPS = [{ item: 'item.linh-thao', min: 2, max: 4, chance: 800 }, { item: 'item.thiet-tinh', min: 1, max: 2, chance: 500 }];
const lacHaStages = lacHa.map((waves, i) => {
  const n = i + 1, id = 'stage.lac-ha.' + n, drops = [...LH_DROPS];
  if (n === 3 || n === 4) drops.push({ item: 'item.xich-viem-tinh', min: 1, max: 1, chance: 120 });
  if (n === 5 || n === 6) drops.push({ item: 'item.loi-kich-moc', min: 1, max: 1, chance: 110 });
  if (n === 7 || n === 8) drops.push({ item: 'item.han-ngoc-tuy', min: 1, max: 1, chance: 100 });
  if (n === 9) drops.push({ item: 'item.dia-mach-thach', min: 1, max: 1, chance: 90 });
  if (n === 10) drops.push({ item: 'item.cuu-chuyen-sa', min: 1, max: 1, chance: 60 }, { item: 'item.ket-dan-dan', min: 1, max: 1, chance: 150 });
  return {
    id, nameKey: id, map: 'map.lac-ha-chau', level: 10 + Math.ceil(n / 2),
    arena: [960, 600], playerStart: [160, 300], timeLimit: 180,
    requires: n === 1 ? 'stage.thanh-van.10' : 'stage.lac-ha.' + (n - 1), minRealm: 'realm.truc-co',
    rewards: { qi: 900 + 220 * n, linhThach: 120 + 25 * n },
    drops, firstClear: n === 10 ? [{ item: 'item.ket-dan-dan', count: 1 }] : n === 5 ? [{ item: 'item.xich-viem-tinh', count: 1 }] : [],
    waves,
  };
});

// Thử thách đột phá — không hiện trong danh sách ải; vào qua bảng đột phá. trialKey khớp realm.trial.
// Lôi Kiếp: 9 đạo sét trong ~48 giây, đạo sau dày và đau hơn; đạo cuối rất lớn. Sống sót là qua.
// Mỗi đạo: một chùm nhắm vào chỗ đứng (đứng yên là trúng) + tia rơi ngẫu nhiên khắp sân (chặn đường chạy, phải nhìn mà né).
const loiKiep = Array.from({ length: 9 }, (_, i) => [
  { at: 60 + i * 150, count: i === 8 ? 4 : 2 + (i >> 1), aim: 'player', spread: i === 8 ? 220 : 110,
    radius: i === 8 ? 150 : 65 + i * 5, delay: i === 8 ? 42 : 30, dmg: i === 8 ? 300 : 100 + i * 10, fx: 'lightning' },
  { at: 60 + i * 150, count: 4 + i * 2, aim: 'random', radius: 60 + i * 4, delay: 30, dmg: 90 + i * 10, fx: 'lightning' },
]).flat();
const trials = [{
  id: 'stage.trial.loi-kiep', nameKey: 'trial.loi-kiep', map: 'map.thien-kiep', level: 1, kind: 'trial', trialKey: 'trial.loi-kiep',
  arena: [900, 600], playerStart: [450, 300], timeLimit: 60, survive: 48,
  requires: null, rewards: { qi: 0, linhThach: 0 }, drops: [], firstClear: [], waves: [], hazards: loiKiep,
}];

export default [...thanhVanStages, ...lacHaStages, ...trials];
