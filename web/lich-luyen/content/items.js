// Lịch luyện — vật phẩm chồng được (vật liệu, đan, vật phẩm đột phá). Trang bị/bí tịch có thuộc tính riêng sẽ ở bảng khác.
// kind: material | breakthrough (vật phẩm đột phá: cần để lên đại cảnh hoặc nâng phẩm) | pill
// rarity: 1 phàm · 2 linh · 3 huyền · 4 địa · 5 thiên
const I = (id, kind, rarity, extra = {}) => ({ id, nameKey: id, descKey: id + '.desc', kind, rarity, ...extra });

export default [
  // Vật liệu thường (rơi ở ải; dùng cho luyện đan/luyện khí sau này)
  I('item.linh-thao', 'material', 1),
  I('item.yeu-lang-bi', 'material', 1),
  I('item.doc-xa-dam', 'material', 2),
  I('item.thiet-tinh', 'material', 2),

  // Đột phá Trúc Cơ: bắt buộc Trúc Cơ Đan; mỗi loại "tăng phẩm" gom được +1 bậc phẩm (Phàm → Địa → Thiên)
  I('item.truc-co-dan', 'breakthrough', 3),
  I('item.thanh-van-chi', 'breakthrough', 2),
  I('item.lang-vuong-nha', 'breakthrough', 3),
  I('item.huyen-giap-tam', 'breakthrough', 3),

  // Đột phá Kim Đan (nguồn rơi mở ở châu sau)
  I('item.ket-dan-dan', 'breakthrough', 4),
  I('item.xich-viem-tinh', 'breakthrough', 3),
  I('item.loi-kich-moc', 'breakthrough', 3),
  I('item.han-ngoc-tuy', 'breakthrough', 4),
  I('item.dia-mach-thach', 'breakthrough', 4),
  I('item.cuu-chuyen-sa', 'breakthrough', 5),
];
