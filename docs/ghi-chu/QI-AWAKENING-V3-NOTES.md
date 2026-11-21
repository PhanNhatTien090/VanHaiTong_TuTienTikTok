# Luyện Khí v3 — pháp trận, dòng linh khí và âm lực

Ngày: 2026-11-03. Tiếp nhận phản hồi: âm nhỏ, cảnh còn nhẹ, nền trống và tia khí chưa có chất tu tiên.

- Canvas: pháp trận dưới chân, vòng ngoài vàng nhạt/xanh ngọc, dấu hình học và hoa sen trung tâm; cache 760×760 theo Scene. Có sương thấp và khí bốc khỏi trận. Không dùng chữ hoặc nhãn bổ sung.
- Dòng khí: sáu nguồn (Light: ba), mỗi nguồn hai đoạn khí di chuyển hướng vào đan điền, lõi sáng, dải khí có bề rộng thuôn, sương ngoài và sợi nhỏ lệch pha. Không đổi đường bay ba linh châu.
- Đột phá: tăng vùng sáng tâm, tia áp lực và hai lớp sóng khí. Giữ tổng thời lượng 8,8 giây; giảm chuyển động vẫn giảm flash và bỏ rung.
- SFX: thêm âm trầm mở trận, lớp khí kéo dài có sustain, lớp lực trung trầm ở cú bùng. Gain cue tăng từ 0,72 lên 1,55; giữ các nút master/SFX và âm lượng nhạc nền hiện tại. Compressor riêng của cue kiểm soát cộng dồn lớp âm trước bus chung.
- Nguồn: Web Audio tổng hợp nguyên gốc trong `public/qi-audio.js`, noise seed 8237; không sample/dịch vụ ngoài. WAV là bản nghe thử, game phát từ module.
- Chrome headless: các ảnh pha trong `output/qi-awakening-v3/`; kiểm chữ tối giản, phát lại, mute, duck chồng giọng đọc, visibility và Light/giảm chuyển động. Không có exception.
- Kiểm chứng: toàn bộ 337 kiểm thử qua; kiểm cú pháp dự án và module Luyện Khí qua. Sau chỉnh độ trong của dải khí, chạy lại bảy kiểm thử Luyện Khí và kiểm Chrome đều qua.
- `qi-ritual-sfx.wav` xuất bằng OfflineAudioContext: peak 0,920; RMS 0,0989 (bản v2: 0,296 / 0,0135). Đây là số đo solo trước gain master/SFX của game, không phải đánh giá độ lớn cảm nhận hoặc chất âm bằng tai. Chưa nghe đánh giá bản phối BGM/giọng.
- Không gửi lệnh lên thế giới LIVE. Cần tải lại nguồn/trang để nhận module mới.
