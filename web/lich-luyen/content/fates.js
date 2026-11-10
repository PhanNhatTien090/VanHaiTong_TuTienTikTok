// Lịch luyện — mệnh cách: chọn sau mỗi lần đột phá đại cảnh (số lượt = fatePicks của phẩm đột phá), mỗi lượt 3 thẻ.
// rarity 1..5 (phàm → thiên), weight: trọng số xuất hiện. path: chỉ đạo lộ này mới gặp (bỏ trống = ai cũng gặp).
// effects: { stat, permille? | flat? } — stat là chỉ số trận (hp, mp, atk, def, spd, crit, critDmg) hoặc 'qiGain' (‰ tu vi nhận thêm).
// Hiệu ứng đặc biệt (lướt để lại kiếm khí…) sẽ thêm khi mô phỏng có móc sự kiện — giờ chỉ chỉ số.
const F = (id, rarity, weight, effects, path = null) => ({ id, nameKey: id, rarity, weight, effects, ...(path ? { path } : {}) });
const pm = (stat, permille) => ({ stat, permille });
const fl = (stat, flat) => ({ stat, flat });

export default [
  // Phàm
  F('fate.cuong-than', 1, 100, [pm('hp', 60)]),
  F('fate.luc-si', 1, 100, [pm('atk', 50)]),
  F('fate.da-day', 1, 100, [pm('def', 80)]),
  F('fate.nhanh-nhen', 1, 80, [pm('spd', 40)]),
  F('fate.tinh-mat', 1, 80, [fl('crit', 30)]),
  F('fate.linh-hai', 1, 80, [pm('mp', 150)]),
  // Linh
  F('fate.kim-cuong-the', 2, 60, [pm('hp', 100), pm('def', 60)]),
  F('fate.thien-sinh-than-luc', 2, 60, [pm('atk', 80)]),
  F('fate.sat-tinh', 2, 50, [fl('critDmg', 200)]),
  F('fate.ngo-tinh', 2, 50, [pm('qiGain', 80)]),
  F('fate.phong-hanh', 2, 50, [pm('spd', 70), fl('crit', 20)]),
  // Huyền
  F('fate.cuong-bao', 3, 35, [pm('atk', 140), pm('def', -80)]),
  F('fate.cau-tran', 3, 35, [pm('hp', 220), pm('spd', -50)]),
  F('fate.tue-nhan', 3, 30, [fl('crit', 70), fl('critDmg', 150)]),
  F('fate.kiem-cot', 3, 40, [pm('atk', 90), fl('crit', 40)], 'path.kiem-tu'),
  F('fate.dong-bi', 3, 40, [pm('hp', 120), pm('def', 120)], 'path.the-tu'),
  F('fate.linh-dong', 3, 40, [pm('atk', 90), pm('mp', 200)], 'path.phap-tu'),
  // Địa
  F('fate.bat-diet-chi-khu', 4, 15, [pm('hp', 250), pm('def', 100)]),
  F('fate.thien-dao-thu-can', 4, 12, [pm('qiGain', 180)]),
  F('fate.kiem-tam-thong-minh', 4, 15, [pm('atk', 160), fl('critDmg', 250)], 'path.kiem-tu'),
  F('fate.ba-the', 4, 15, [pm('hp', 260), pm('atk', 80)], 'path.the-tu'),
  F('fate.ngu-hanh-chi-tu', 4, 15, [pm('atk', 170), pm('mp', 250)], 'path.phap-tu'),
  // Thiên
  F('fate.tien-nhan-chuyen-the', 5, 4, [pm('hp', 200), pm('atk', 150), pm('def', 150), pm('qiGain', 100)]),
];
