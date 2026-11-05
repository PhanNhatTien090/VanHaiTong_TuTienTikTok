# Quà tri ân và bảng lệnh — 04/11/2026

Bảng lệnh: simple-guide, command-rail, live-guide, rules-summary, manual và nội dung tĩnh dùng lệnh có dấu; tên vật phẩm giữ nguyên dấu. Bảng góc LIVE dùng một cột để tránh bẻ chữ. Parser commandWords hiện có đã hiểu lệnh có dấu và dấu cách; không sửa engine.

Hiệu ứng: public/gift-tribute.js, nhịp đến → tụ → khai hoa/kiếm → tan. Các mốc 1/5/30/99/199 coin tổng, thời lượng 2.2/2.8/4.4/5.8/6.5 giây. Từ 500 coin giữ PNG rồng/phượng và các tầng tăng dần hiện có, thêm năng lượng chung và biến thể theo sự kiện. Dùng lại qi-impact; mặc định của các cảnh đột phá không đổi, quà tắt chớp toàn màn và cột sáng. Hoa dùng asset gift-rose.webp hiện có. Không tạo nhân vật hoặc thay tài nguyên/quà.

Sửa lỗi: quà nhỏ hơn ngưỡng luxury đến trong đột phá được giữ trong luxuryQueue có giới hạn thay vì bỏ ngay. Gift solo tắt compact và đặt lại tỷ lệ nhân vật 4.2, giảm focus zoom còn 1.45. Hoa ≤10 coin vẫn ở cảnh chung. Quà 30–499 có cue release tại k=.46, bỏ cue nếu đã qua thời điểm; chưa nghe trực tiếp bằng tai.

Kiểm tra: 389/389 test; đã xem ảnh trước/sau, chuỗi 6 mốc 100 coin và preview trình duyệt 100 coin. Preview không gửi action vào LIVE. Chưa xác nhận đánh giá thẩm mỹ của người dùng hoặc FPS trong LIVE Studio. Không restart backend, không thay lịch hoặc dữ liệu người chơi.

Preview: http://127.0.0.1:4317/cinema-preview.html?gift=100
Ảnh: output/gift-tribute-v1/after; test log: output/gift-tribute-v1/tests.txt.
Backup: data/backups/gift-tribute-20261104 và commands-co-dau-20261104. Reload nguồn overlay để dùng JS/CSS mới.
