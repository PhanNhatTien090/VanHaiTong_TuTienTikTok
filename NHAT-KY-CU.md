# Nhật ký phiên cũ (chuyển từ SO-TAY.md mục 6)

### 06/11/2026 — Dựng sổ tay
- Tìm ra thư mục game, lập SO-TAY.md và lệnh `/batdau`, `/ketthuc`.
- Chưa chuyển thư mục (user đang LIVE).
- Tiếp theo: chuyển sang `C:\GAME\VanHaiTong` khi user báo.

### 07/11/2026 — Hạn mức ngày, Thiên Đạo giáng lôi, chống tự thả tim
- Sửa hạn mức tu luyện ngày: thưởng sự kiện (điểm danh chuỗi, lì xì, câu đố, nhiệm vụ, kiến tạo tông) không trừ hạn mức — trước đó điểm danh 7 ngày của Nam nguyễn (Thần Tổ, 83 triệu tu vi) ăn 1.635/2.025 điểm. Restart an toàn (`scripts/restart-checkin-exempt.ps1`), trả 1.635 điểm cho Nam nguyễn (user đồng ý).
- Thiên Đạo (tab Sự kiện): chọn người/ngẫu nhiên, bấm 2 lần → trừ 20% tu vi hiện có, choáng 5 phút (chặn vận công/hái/đánh/đan/đột phá, tim không ra tu vi, quà vẫn nhận), hồi 60 s. Hiệu ứng ~7,6 s, biến thể theo seed (4 màu lôi, 1–3 đạo, 5 tiêu đề); giọng "Thiên kiếp giáng xuống tông môn…" 4×4 câu; dấu choáng trên đầu.
- Chống tự thả tim (chung cho mọi người, ngầm, không thông báo): điểm sự kiện từ tim ≤ ~2 tim/s (dồn 120); thả liên tục >1,5 tim/s (~5 phút) → tim tụ linh hồi 30 s thay vì 10 s. Dựa trên số liệu tối 06/11 (Anh Đức 12.649 tim/90 phút).
- Đã kiểm tra: 493/493 test, `npm run check`; tự xem khung hình Thiên Đạo (render + Chrome headless trên server thử cổng 4399), đo âm thanh offline (không vỡ tiếng). Chưa kiểm tra: nghe âm thanh thật; dấu tiếng Việt khi chụp headless bị tách (chữ tên sẵn có cũng vậy — nghi do font máy headless).
- Tiếp theo: restart để bật chống tự thả tim; user nghe/duyệt Thiên Đạo; theo dõi người dùng tool sau khi bật.

### 07/11/2026 (chiều) — Quà hiện ngay, sửa giọng "ghi nhận", ẩn giới hạn, Chính–Ma
- Quà: thẻ quà hiện ngay lúc nhận; quà ưu tiên cao nhất và cắt ngang hiệu ứng thường (quà ≥99 coin/VIP cắt cả đột phá ≤ Hóa Thần); quà chờ >10 s thì bỏ màn diễn; giọng cảm ơn quá 30 s thì bỏ. Đo nhật ký: server nhận quà 1–3 s sau khi tặng, trễ nằm ở hàng hiệu ứng trên trang.
- Đua phi kiếm: tay đua tặng quà khi đang đua chỉ bứt tốc, không cộng tu vi; chữ + giọng chỉ báo "bứt tốc".
- Giọng "Tông môn đã ghi nhận…" khi không ai tặng = câu dự phòng khi VieNeu bận (chỉ 1 câu/lúc). Đã bỏ câu dự phòng đó; quà/sự kiện được xếp hàng TTS (tối đa 3) thay vì bị trả "bận".
- Ẩn mọi câu chữ giới hạn tu luyện (thông báo hết hạn mức, "10%", điểm còn lại, sổ tay lệnh); chặn đột phá/đan dùng lời tu tiên ("Đạo cơ đang lắng đọng…", "Kinh mạch đã no linh khí…"). Giới hạn vẫn chạy ngầm; bảng quản lý vẫn hiện số.
- Chính–Ma (file của Codex): bảng vinh danh kết trận vẽ cố định màn hình 20 s (thắng/thua, thưởng mỗi phe, top 3 + danh hiệu), giọng vinh danh người dẫn đầu; sửa ranh giới trên sân bị ngược chiều so với thanh điểm.
- Kiểm tra: mỗi commit chạy test trên bản sạch (485–507 đạt); QA Chrome headless trên server thử 4399: quà 199 coin cắt màn đột phá sau 0,6 s; vẽ thử bảng Chính–Ma. Chưa xem tận mắt ranh giới Chính–Ma trong trận thật.
- Bài học: 2 lần chèn `//` vào giữa dòng dài làm hỏng cú pháp file (`voice.js` trên LIVE ~1 phút). Từ đó sửa trên bản sao, `node --check` xong mới chép vào.
- Tiếp theo: lỗi top 3 tặng quà (chờ ảnh); thưởng Chính–Ma; tạo tag `prod-*` nếu cần deploy web.
