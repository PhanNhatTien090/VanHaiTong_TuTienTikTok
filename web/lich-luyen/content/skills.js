// Lịch luyện — chiêu thức, ghép từ khối. Lõi chỉ biết các LOẠI ĐÒN và LOẠI HIỆU ỨNG; mọi chiêu cụ thể là dữ liệu.
//
// Đơn vị: khoảng cách px, tốc độ px/giây, thời gian theo NHỊP (30 nhịp = 1 giây), hệ số % (100 = 1× công).
// action.type:
//   projectile { speed, range, radius, count=1, spread=0 (đơn vị hướng /64), pierce=1, explode?{radius} }
//   melee      { offset, radius }          vùng tròn trước mặt
//   nova       { radius }                  vùng tròn quanh mình
//   zone       { offset, radius, duration, period }   vùng trận tồn tại, gây hiệu ứng mỗi period nhịp
//   dash       { ticks, speed, invuln }    lướt (thân pháp); invuln = số nhịp bất tử
// effects (áp lên mục tiêu trúng đòn):
//   damage { mult }   knockback { distance }   stun { ticks }   burn { ticks, period, mult }   heal { mult } (hồi cho người ra chiêu)
// slot: attack (võ kỹ) | special (tuyệt kỹ) | dash (thân pháp) | ultimate (thần thông). cd, mp theo nhịp/điểm.

const S = (id, slot, cd, mp, action, effects = []) => ({ id, nameKey: id, slot, cd, mp, action, effects });

export default [
  // ── Kiếm tu ──
  S('skill.kiem.luu-van-kiem', 'attack', 12, 0, { type: 'projectile', speed: 900, range: 320, radius: 18, pierce: 2 }, [{ type: 'damage', mult: 100 }]),
  S('skill.kiem.van-kiem-quy-tong', 'special', 150, 30, { type: 'projectile', speed: 800, range: 380, radius: 16, count: 5, spread: 3, pierce: 1 }, [{ type: 'damage', mult: 85 }]),
  S('skill.kiem.ngu-phong-bo', 'dash', 45, 0, { type: 'dash', ticks: 7, speed: 900, invuln: 7 }),

  // ── Thể tu ──
  S('skill.the.bang-son-quyen', 'attack', 14, 0, { type: 'melee', offset: 40, radius: 55 }, [{ type: 'damage', mult: 135 }, { type: 'knockback', distance: 30 }, { type: 'heal', mult: 35 }]),
  S('skill.the.chan-dia-chuong', 'special', 165, 30, { type: 'nova', radius: 130 }, [{ type: 'damage', mult: 160 }, { type: 'stun', ticks: 30 }, { type: 'heal', mult: 200 }]),
  S('skill.the.thiet-nguu-xung', 'dash', 50, 0, { type: 'dash', ticks: 8, speed: 800, invuln: 6 }),

  // ── Pháp tu ──
  S('skill.phap.hoa-cau-thuat', 'attack', 16, 0, { type: 'projectile', speed: 600, range: 380, radius: 20, pierce: 1, explode: { radius: 60 } }, [{ type: 'damage', mult: 90 }, { type: 'burn', ticks: 60, period: 15, mult: 12 }]),
  S('skill.phap.liet-diem-tran', 'special', 180, 35, { type: 'zone', offset: 140, radius: 110, duration: 90, period: 15 }, [{ type: 'damage', mult: 45 }]),
  S('skill.phap.thuan-buoc', 'dash', 55, 0, { type: 'dash', ticks: 6, speed: 1000, invuln: 6 }),

  // ── Quái ──
  S('skill.quai.cao-xe', 'attack', 36, 0, { type: 'melee', offset: 30, radius: 42 }, [{ type: 'damage', mult: 100 }]),
  S('skill.quai.doc-dich', 'attack', 54, 0, { type: 'projectile', speed: 420, range: 420, radius: 14, pierce: 1 }, [{ type: 'damage', mult: 90 }]),
  S('skill.quai.huc-dia', 'special', 150, 0, { type: 'nova', radius: 110 }, [{ type: 'damage', mult: 150 }, { type: 'knockback', distance: 60 }]),
];
