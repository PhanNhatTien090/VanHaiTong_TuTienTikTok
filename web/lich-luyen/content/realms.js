// Lịch luyện — cảnh giới. Tên theo LIVE. Thứ tự = order. Chỉ là DỮ LIỆU; luật nằm ở core/progression.mjs.
//
// stages: 'pham-nhan' (1 bậc) | 'tang' (Tầng 1..9 + Viên Mãn, chỉ Luyện Khí) | 'ky' (Sơ/Trung/Hậu kỳ + Viên Mãn)
// openSeason: mùa mở cảnh giới này (trần cảnh giới của mùa). null = chưa lên lịch.
// qualities: phẩm khi đột phá VÀO cảnh giới này, thấp → cao. materials = số loại vật phẩm đột phá cần gom,
//   points = điểm thuộc tính nhận, fatePicks = số lần chọn mệnh cách (học bảng RoleGrade của Quỷ Cốc Bát Hoang).
// trial: thử thách đánh tay khi đột phá vào (null = không có).
// Tu vi: firstQi cho bậc đầu; mỗi tiểu cảnh nhân stageGrowth/100; sang đại cảnh nhân realmJump/100 (số nguyên).

const Q3 = [
  { id: 'pham', nameKey: 'quality.pham', materials: 1, points: 12, fatePicks: 1 },
  { id: 'dia', nameKey: 'quality.dia', materials: 2, points: 16, fatePicks: 2 },
  { id: 'thien', nameKey: 'quality.thien', materials: 3, points: 20, fatePicks: 3 },
];
const KIM_DAN = [
  { id: 'ngu-pham', nameKey: 'quality.ngu-pham', materials: 1, points: 20, fatePicks: 1 },
  { id: 'tu-pham', nameKey: 'quality.tu-pham', materials: 2, points: 25, fatePicks: 1 },
  { id: 'tam-pham', nameKey: 'quality.tam-pham', materials: 3, points: 30, fatePicks: 2 },
  { id: 'nhi-pham', nameKey: 'quality.nhi-pham', materials: 4, points: 35, fatePicks: 2 },
  { id: 'nhat-pham', nameKey: 'quality.nhat-pham', materials: 5, points: 40, fatePicks: 3 },
];
const scaled = (base, mult) => base.map(q => ({ ...q, points: Math.trunc(q.points * mult) }));
const GENERIC = [
  { id: 'ha', nameKey: 'quality.ha', materials: 2, points: 40, fatePicks: 1 },
  { id: 'trung', nameKey: 'quality.trung', materials: 4, points: 55, fatePicks: 2 },
  { id: 'thuong', nameKey: 'quality.thuong', materials: 6, points: 70, fatePicks: 3 },
];

const r = (id, stages, openSeason, qualities = null, trial = null, curve = undefined) => ({ id: 'realm.' + id, nameKey: 'realm.' + id, stages, openSeason, qualities, trial, ...(curve ? { curve } : {}) });
// Cảnh giới cao tăng chậm lại (Quỷ Cốc cũng vậy), để 24 cảnh giới không vượt giới hạn số nguyên an toàn.
const MID = { stageGrowth: 128, realmJump: 160 }, HIGH = { stageGrowth: 112, realmJump: 125 };

export const REALM_CURVE = Object.freeze({ firstQi: 100, stageGrowth: 135, realmJump: 180 });

export default [
  r('pham-nhan', 'pham-nhan', 1),
  r('luyen-khi', 'tang', 1, [{ id: 'pham', nameKey: 'quality.pham', materials: 0, points: 5, fatePicks: 0 }]),
  r('truc-co', 'ky', 1, Q3),
  r('kim-dan', 'ky', 1, KIM_DAN, 'trial.loi-kiep'),
  r('nguyen-anh', 'ky', 2, scaled(Q3, 2.5), 'trial.tam-ma'),
  r('hoa-than', 'ky', 2, GENERIC, null, MID),
  r('luyen-hu', 'ky', 3, scaled(GENERIC, 1.3), null, MID),
  r('dai-thua', 'ky', 3, scaled(GENERIC, 1.6), null, MID),
  ...['chan-tien', 'huyen-tien', 'kim-tien', 'thai-at', 'dai-la', 'tien-de', 'dao-to', 'thien-ton', 'than-quan', 'than-vuong', 'than-de', 'than-ton', 'than-to', 'hong-mong', 'ma-than', 'thien-ma', 'diet-the']
    .map((id, i) => r(id, 'ky', null, scaled(GENERIC, 2 + i * 0.5), null, HIGH)),
];
