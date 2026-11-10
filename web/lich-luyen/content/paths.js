// Lịch luyện — đạo lộ (class). Khác biệt giữa class nằm hết ở đây; lõi không có if theo class.
// statMult: hệ số chỉ số theo phần nghìn (1000 = gốc). range: tầm đánh chính (px). kit: chiêu khởi đầu theo ô.
export default [
  {
    id: 'path.kiem-tu', nameKey: 'path.kiem-tu', descKey: 'path.kiem-tu.desc', weapon: 'kiem', range: 140,
    kit: { attack: 'skill.kiem.luu-van-kiem', special: 'skill.kiem.van-kiem-quy-tong', dash: 'skill.kiem.ngu-phong-bo' },
    statMult: { hp: 950, atk: 1100, def: 900, spd: 1050, crit: 1300, critDmg: 1100 },
    branches: [{ id: 'branch.phi-kiem', nameKey: 'path.kiem-tu.phi-kiem' }, { id: 'branch.kiem-y', nameKey: 'path.kiem-tu.kiem-y' }],
  },
  {
    id: 'path.the-tu', nameKey: 'path.the-tu', descKey: 'path.the-tu.desc', weapon: 'quyen', range: 70,
    kit: { attack: 'skill.the.bang-son-quyen', special: 'skill.the.chan-dia-chuong', dash: 'skill.the.thiet-nguu-xung' },
    statMult: { hp: 1300, atk: 1000, def: 1250, spd: 950, crit: 900, critDmg: 1000 },
    branches: [{ id: 'branch.kim-cuong', nameKey: 'path.the-tu.kim-cuong' }, { id: 'branch.cuong-huyet', nameKey: 'path.the-tu.cuong-huyet' }],
  },
  {
    id: 'path.phap-tu', nameKey: 'path.phap-tu', descKey: 'path.phap-tu.desc', weapon: 'phap-khi', range: 320,
    kit: { attack: 'skill.phap.hoa-cau-thuat', special: 'skill.phap.liet-diem-tran', dash: 'skill.phap.thuan-buoc' },
    statMult: { hp: 850, atk: 1150, def: 850, spd: 1000, crit: 1000, critDmg: 1000 },
    branches: [{ id: 'branch.ngu-hanh', nameKey: 'path.phap-tu.ngu-hanh' }, { id: 'branch.phu-tran', nameKey: 'path.phap-tu.phu-tran' }],
  },
];
