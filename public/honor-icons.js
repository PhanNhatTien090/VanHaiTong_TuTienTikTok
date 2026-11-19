// 15/11/2026: huy hiệu chức danh cạnh tên trên sân (scene.js) + bảng chú giải trong cột trái (gear-guide.js).
// Một nguồn duy nhất để icon trên sân và chú giải luôn khớp nhau.
export const HONOR_LEGEND=[
 ['👑','Tông Chủ'],
 ['🏯','Trưởng Lão'],
 ['🛡️','Hộ Pháp · Cung Phụng'],
 ['⚔️','Chiến Thần'],
 ['✨','Tiên · Tiên Đế'],
 ['📿','Nguyên Lão'],
 ['🌿','Danh hiệu khác'],
 ['📜','Chân Truyền (bên phải tên)']
];
export function honorIcon(h){
 const t=String(h?.title||''),r=h?.role;
 return r==='sect-master'||/TÔNG CHỦ/.test(t)?'👑':/TRƯỞNG LÃO/.test(t)?'🏯':r==='champion'||/CHIẾN THẦN/.test(t)?'⚔️':/HỘ PHÁP|CUNG PHỤNG/.test(t)||r==='patron'?'🛡️':/NGUYÊN LÃO/.test(t)?'📿':/ĐẾ|TÔN|QUÂN|TIÊN/.test(t)||r==='immortal'?'✨':'🌿';
}
// 19/11/2026 — Thủy Mặc: huy hiệu thành ẤN TRIỆN chữ khắc (không emoji). Cùng thứ tự với HONOR_LEGEND.
export const HONOR_SEALS={'👑':'宗','🏯':'老','🛡️':'護','⚔️':'戰','✨':'仙','📿':'元','🌿':'名','📜':'傳'};
export const honorSeal=icon=>HONOR_SEALS[icon]||'名';
