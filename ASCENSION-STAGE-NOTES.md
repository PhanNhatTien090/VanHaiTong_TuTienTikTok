# Thiên đài đột phá — bàn giao 03/11/2026

## Cách mở
- Xem thử riêng: http://127.0.0.1:4317/ascension-preview.html
- Cảnh LIVE mới: http://127.0.0.1:4317/?overlay=1&world=live&stage=ascension&quality=auto&sound=1
- Cảnh sân chung cũ: http://127.0.0.1:4317/?overlay=1&world=live&stage=world&quality=auto&sound=1
- Thêm nguồn Link/Browser ở 1080 × 1920; tải lại nguồn đang mở để nhận module mới.

## Hành vi đã hoàn thành
Thiên đài giữa biển mây dùng nền cung ngọc sẵn có, đài ngọc, linh khí và một nhân vật ở trung tâm. Luân phiên người thật đang hoạt động; ưu tiên người đã đủ điều kiện đột phá. Hàng đợi hiển thị tên và cảnh giới. Màn đột phá giữ tên người và cảnh giới, ẩn bảng hướng dẫn khi hiệu ứng diễn ra rồi trở về thiên đài.

LIVE bật settings.ascensionShowcase theo mặc định khi khởi động nếu chưa có lựa chọn. Hành động tu luyện thành công cấp tối thiểu 1/2 chi phí cảnh giới đầu, tăng dần tới 1/20 ở mốc cuối, đồng thời cấp tu vi và linh thạch. Hái linh thảo vẫn là đường miễn phí. Có thể nhanh hơn nhờ tài nguyên sẵn có và buff. Giữ hồi chiêu; hành động thất bại, bình luận thường và tim không được tính vào tăng tốc này. Người chơi vẫn phải gõ dotpha để lên cảnh giới thật. Không cần quà để đi tới cảnh giới cuối trong chế độ mới.

Dữ liệu tiến trình, trang phục đã chọn và tài nguyên được giữ. Sân khấu chỉ đưa các đột phá thật vào hàng trình diễn, bỏ sự kiện NPC/mô phỏng. Bản preview dựng dữ liệu trong trình duyệt, không ghi tiến trình vào LIVE.

## Kiểm chứng
- npm run check: đạt.
- npm test: 364/364 đạt.
- scripts/qa-live-integrity.mjs: đạt trên server và data tạm riêng.
- scripts/qa-ascension-stage.mjs: kiểm tra mặc định LIVE, gợi ý dotpha, preview tụ khí/hiện cảnh giới/trở lại, tài nguyên người thật không bị preview thay đổi và sự kiện đột phá qua SSE.
- Ảnh dọc và kết quả QA: output/ascension-stage-v1/.

Chưa đo hiệu năng thực tế trong LIVE Studio hoặc kiểm tra âm thanh bằng loa. Kết quả QA trình duyệt không phải cam kết về hạn chế hoặc phân phối của TikTok.

Máy chủ cổng 4317 đã nạp lại bằng SIGTERM qua trình gỡ lỗi của đúng tiến trình dự án; watchdog khởi động phiên mới. API xác nhận ascensionShowcase=true, version=1. Đã sao lưu bản export trước nạp lại ở output/ascension-stage-v1/live-api-before-reload.json.

