# Cách làm VFX skin cao cấp (tu tiên) — chốt 15/11/2026

Mẫu đã được user duyệt "tạm được": `public/karma-fx.js` (Nhân Quả Vương Lâm, v3). Bản v1 (dây mảnh + chữ bay)
và v2 (chỉ 3 lớp) bị chê "xấu", "ít". Skin nạp tiền mới làm theo công thức dưới.

## 1. Nguyên tắc
- **Dùng ảnh user gửi làm tâm điểm** (hào quang, pháp bảo, nhân vật). Không tự đổi màu/biến tấu ảnh của user
  (v1 đổi hào quang sang bạc đen → user hỏi "hình này sao không dùng").
- **Nhiều lớp, mỗi lớp một việc** (cách LoL/Godforge): nền tối → tia sáng → hào quang → vòng ấn → pháp trận →
  lửa/khí bốc → lõi sáng ở ngực → vật thể bay vòng có đuôi → sao lấp lánh → điểm nhấn trên pháp bảo. Tối thiểu ~8 lớp.
- **Phân cấp thị giác**: lõi (ngực/đầu) sáng nhất; lớp phụ (hạt, tro) nhỏ, mờ, ít bão hoà. Không để chi tiết phụ tranh chỗ.
- **Nền tối làm nổi sáng**: luôn có quầng khói mực sau lưng; vệt đuôi ghép đôi một sáng (cộng) một tối (phủ) để có chiều sâu.
- **Không dùng nét mảnh rời rạc** (dây, chữ vẽ bằng stroke) làm lớp chính — trông như dây điện. Dùng sprite mềm (gradient) + cộng sáng.
- **Có chuyển động thật**, không đứng như ảnh dán: xoay ngược chiều nhau, thở (scale ±1,5%), vệt sáng quét vành, hạt bay lên/rơi xuống.
  Hoa văn có chiều trên/dưới (hào quang có đế) thì KHÔNG xoay, chỉ quét sáng.
- **Màn biến hình** có nhịp: báo trước (trời tối, năng lượng xoáy vào lõi) → chớp sáng → bùng (tia to, sao nổ, sóng mực + sóng sáng
  sát đất) → hiện hình + pháp bảo giáng xuống → lắng về trạng thái thường KHÔNG giật (lớp thường vẽ full alpha, chỉ lớp phụ mờ dần).
  Biến thể theo id sự kiện (chiều xoáy, hướng rơi) — luật "không lặp y hệt".
- Tránh cháy sáng: chớp trắng ≤ 0,6 s; tổng lớp `lighter` vừa phải.

## 2. Kỹ thuật canvas (hiệu năng)
- Mọi texture dựng sẵn 1 lần bằng `makeSurface` (radial glow, tia, sao 4 cánh, vòng ấn, âm dương, cột sáng). Mỗi khung chỉ `drawImage`.
- Cộng sáng: `globalCompositeOperation='lighter'`. Không `filter`, không `shadowBlur`.
- Mặt nạ trong suốt (`destination-in`) phải dùng màu có alpha 0 ở mép — dùng `#000` đặc sẽ ra khung chữ nhật.
- `light` (sân đông / budget nhẹ): bỏ tia, vòng ấn, cột sáng, sao; giảm số hạt. >50 người scene đã tự bỏ hiệu ứng.
- Toạ độ: gốc ở chân, đứng cao ~125, ngồi ~91 (`HALO_Y`, `CHEST_Y` theo `stand`). Đo tâm vòng của ảnh hào quang (`RING_X/Y`) để đầu nằm giữa lỗ.
- Xem thử: trang `*-preview.html?mode=idle|reveal&k=..&t=..&light=1`, chụp bằng Edge headless (python http.server cổng riêng,
  không dùng server LIVE). Tự xem ảnh trước khi báo user; overlay `sound=1` user phải làm mới nguồn Link.

## 3. Chất liệu tu tiên nên dùng
- **Pháp trận / luân ấn** dưới chân và sau đầu (vòng vạch chia + ấn thoi, bát quái, âm dương). Có thể lấy cảm hứng cổ khí (đỉnh, ấn).
- **Kiếm khí**: quỹ đạo sắc có hướng + lõi sáng + sương/khí bao quanh (3 lớp: quỹ đạo, highlight, sương). Có nhịp chuẩn bị trước khi chém.
- **Linh khí / tiên khí**: sương mờ trôi, hạt sáng bốc lên, cột sáng mảnh từ pháp trận.
- **Thủy mặc**: khói mực đen + ánh trắng (rất hợp tông trắng đen/âm dương).
- **Thần quang**: chùm tia xoay chậm sau đầu; hào quang (ảnh) + quầng ấm.
- **Pháp bảo bản mệnh**: lơ lửng cạnh người, lắc nhẹ, dòng sáng chạy dọc, chớp sao ở mũi/đầu.
- Tránh lỗi "PPT" của game tu tiên: đứng im + dán ảnh sáng. Luôn có chuyển động và nhịp.

## Nguồn
- Godforge – Guan Yu Radiance VFX: https://hellhades.com/godforge/news/godforge-how-guan-yus-radiance-vfx-was-brought-to-life/
- LoL VFX knowledge share (đuôi cộng + đuôi tối): https://realtimevfx.com/t/shannon-berke-lol-fx-knowledge-share/1133/286
- 80.lv – glow cần shadow: https://80.lv/articles/constructing-vfx-worthy-of-league-of-legends/
- 17173 – phê bình VFX tiên hiệp "như PPT": https://news.17173.com/content/08092025/000116530.shtml
- Atlantis Press – quỹ đạo kiếm + sương khói: https://www.atlantis-press.com/article/23854.pdf
- LoL VFX styleguide (phân cấp thị giác): https://nexus.leagueoflegends.com/wp-content/uploads/2017/10/VFX_Styleguide_final_public_hidpjqwx7lqyx0pjj3ss.pdf
