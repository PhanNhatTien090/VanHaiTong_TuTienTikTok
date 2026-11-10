// Lịch luyện — chỉ số gốc theo bậc tu luyện. Chỉ là dữ liệu; core/stats.mjs tính.
// base: chỉ số ở bậc 0 (Phàm Nhân). growth: % tăng mỗi bậc thang (số nguyên, 106 = +6%/bậc).
// spd (px/giây), crit/critDmg (‰) không tăng theo bậc — đến từ đạo lộ, trang bị, mệnh cách.
// qualityPermille: mỗi điểm thuộc tính của phẩm đột phá cộng bao nhiêu ‰ vào hp/atk/def (12 điểm × 5 = +6%).
export default {
  base: { hp: 520, mp: 100, atk: 26, def: 7, spd: 220, crit: 100, critDmg: 1500 },
  growth: { hp: 106, mp: 102, atk: 106, def: 105 },
  qualityPermille: 5,
  mpCap: 400,
};
