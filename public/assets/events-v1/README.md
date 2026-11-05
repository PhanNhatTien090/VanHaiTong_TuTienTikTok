# Bộ hình sự kiện tông môn

Tạo bằng imagegen ngày 01/11/2026. Giữ nguyên PNG gốc và kênh alpha; không chỉnh sửa ảnh bằng script. Prompt đầy đủ và đường dẫn bản gốc nằm trong prompts.json.

## Các file

- tournament-background.png: nền dọc Luận Kiếm Đài.
- bond-background.png: nền dọc Tam Sinh Tiên Cảnh.
- tournament-effects.png: 6 mảnh tỷ thí trong lưới 3 cột × 2 hàng.
- bond-effects.png: 6 mảnh kết duyên trong lưới 3 cột × 2 hàng.
- manifest.json: kích thước ảnh, vùng cắt từng mảnh, vị trí đề xuất của hai nhân vật.

## Ghép hiệu ứng

Tỷ thí: cổng xanh/vàng đặt sau từng đấu thủ khi vào sân; vệt kiếm đi theo hướng tấn công; vòng va chạm ở điểm trúng đòn. Khung quán quân có lỗ trong suốt để ghép avatar, cúp dùng trong cảnh vinh danh.

Kết duyên: cổng trăng sau hai người; hai đài sen dưới chân; dải lụa và vòng hoa bao quanh, tránh che mặt. Ngọc bội trao sau lễ; phi kiếm đôi dùng khi hai người bay vào/ra cùng nhau. Đây là các lớp để game tạo chuyển động, chưa phải đoạn phim có sẵn.

Chỉ nạp nền của sự kiện đang chạy và thu nhỏ mảnh hiệu ứng vào cache 256px ở chế độ nhẹ hoặc 384px ở chế độ đẹp. Không cần giữ cả hai bộ đã giải mã trong cảnh LIVE. Tên, hướng dẫn và avatar được vẽ riêng.

Bộ hình đang được chuẩn bị cho hai cơ chế đã lên kế hoạch; không tự kích hoạt tỷ thí/kết duyên, không thay đổi vòng luân phiên bản đồ hoặc dữ liệu người chơi.

Xem hình qua /event-art.html trên server hiện tại.
