# Vân Hải Tông LIVE 2.0 — Ma trận nghiệm thu kỹ thuật

**Ngày:** 15-11-2026  
**Nhánh:** `feat/live-2-gameplay-visuals` · PR nháp #4  
**Quy tắc:** chưa merge `main`, chưa tự bật LIVE thật, chưa viết lại dữ liệu người chơi.

| Hệ thống | Logic game LIVE | Hình ảnh/âm thanh | Kiểm soát/tính tương thích |
| --- | --- | --- | --- |
| Con đường tu | 5 Đạo Thống, 5 Đạo Ngộ, Đạo Kỹ, sở trường kiếm/ma/thể/thú/đan theo PvE | Ấn thuật theo đạo, hiệu ứng lựa chọn và tuyệt kỹ cấp cao, huy hiệu cạnh tên | `live2-systems.mjs`, `live2-path-talents.mjs`, `public/live2-art.js`, `public/live2-badges.js` |
| Pháp bảo & đan dược | Tinh luyện pháp bảo đang đeo +1..+3, Pháp Ấn theo họ bảo vật, 3 đan chiến thuật từ linh thảo/linh thạch thật | Pháp Ấn, luyện đan, túi đồ hiển thị số lượng và cấp tinh luyện | `live2-relics.mjs`, `live2-extensions.mjs`, `inventory.mjs`, `public/inventory-multi.js` |
| Bang Hội | Bang độc lập Ngũ Đường, hội chủ/phó hội/trưởng lão, xây điện, điểm đóng góp, Hội Chiến | Đội hình giới hạn người, sân đấu cũ, nhạc chiến trận, bảng điểm | `live2-systems.mjs`, `live2-extensions.mjs`, `public/live2-guild-stage.js`, `public/live2-hud.js` |
| Sư Đồ & Đạo Lữ | Xin/nhận sư tự nguyện, truyền đạo/nhiệm vụ ngày/xuất sư; Đồng Tâm dùng quan hệ đạo lữ cũ | Thẻ Sư Đồ/Đạo Lữ, ấn hợp kích | `live2-systems.mjs`, `public/inventory-multi.js`, không thay `social.bonds` |
| Tháp | 5 luật theo tầng, chiêu theo đúng trận, điều kiện linh thú/giáp, giữ lượt và thưởng cũ | 5 ấn thủ vệ, HUD và kỹ năng tương ứng | `tower-rules.mjs`, `tower.mjs`, `public/tower.js` |
| Boss | Ba pha tùy chọn: tụ lực, phong ấn, cuồng nộ; đồng đội phá kết giới, giữ Boss và phần thưởng có sẵn | Aura thực quanh sprite Boss, vệt nứt/chiêu lớn, biểu tượng pha | `live2-boss.mjs`, `public/live2-boss-stage.js`; cờ Boss độc lập mặc định tắt |
| Độ Kiếp | Hộ kiếp 3 đạo hữu trong 90 giây sau đột phá Hóa Thần, thưởng giới hạn, không làm thay đổi cảnh giới cũ | Pháp trận quanh nhân vật thật, ấn trợ lực, màn thiên kiếp viên mãn | `live2-tribulation.mjs`, `public/live2-heaven-stage.js` |
| Giao diện & tối ưu LIVE | Hàng chờ bảng xem tối đa 4, lệnh chỉ xem có chống spam, 3 cờ bật chủ động và sao lưu trước thay đổi | Command rail, ấn 1080×1920, cinematic theo cấp, tắt hiệu ứng khi RenderBudget thấp | `live2-read-gate.mjs`, `public/live2-cinematic.js`, `live2-operator.mjs`, `public/live2-operator-panel.js` |

## Điều kiện bắt buộc trước khi đưa LIVE chính thức

- [x] Các tài sản và logic mới nằm trên nhánh riêng, không merge tự động.
- [x] LIVE mặc định tắt, Demo tự bật; Boss ba pha và Hội Chiến có cờ riêng.
- [x] Thêm test logic, dữ liệu cũ, bật/tắt cờ, nhận lệnh, Guild War thắng/thua, hình ảnh Canvas.
- [x] Pipeline tạo ảnh QA 1080×1920 cho Đạo Thống, Boss có sprite, Hội Chiến có nhân vật, Hộ Kiếp có nhân vật.
- [x] Benchmark giả lập server ở 20/50/80 người (không phải FPS).
- [x] Bảng điều hành localhost có xác nhận và tự backup trước khi thay cờ.
- [ ] **Đo FPS, p95/p99 frame time và RAM trong LIVE Studio thực** với 20/50/80 nhân vật, quà lớn đồng thời.
- [ ] **Kiểm tra TikFinity thật**, âm thanh/giọng nói, hoạt cảnh độ kiếp xung đột tỷ thí, và khôi phục dữ liệu trên bản sao.
- [ ] Sau khi kiểm thử thực tế đạt mới cân nhắc đổi PR sang sẵn sàng merge.

## Cách xem thử an toàn

Dùng chế độ DEMO và hướng dẫn trong game để thử Đạo Thống/Pháp Bảo/Bang Hội; xem ảnh tự động ở artifact `live2-visual-preview` trong GitHub Actions (17 ảnh tĩnh 1080×1920). Ảnh QA **không phải bằng chứng FPS**. Giữ cờ LIVE tắt cho tới khi đã nghiệm thu trên máy streamer.
