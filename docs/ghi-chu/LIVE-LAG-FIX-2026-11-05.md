# Tối ưu LIVE · 05/11/2026

Đã áp dụng vào nguồn Link của TikTok LIVE Studio bằng nút refresh nguồn; không restart server, không thay dữ liệu game/web. Client LIVE xác nhận version89 và renderWidth1080.

## Quan sát

Máy 16GB, RAM trống khoảng 0.7–0.9GB trong thời gian kiểm. Worker VieNeu đang sinh giọng dùng khoảng 1.8GB và 2 lõi CPU, đã có priority thấp sẵn; không tự tắt giọng/ứng dụng. Nguồn trước sửa high1440px; có mẫu30FPS, không đủ kết luận nguyên nhân duy nhất của lag. Studio hiển thị 0 khung rớt khi kiểm tra.

## Thay đổi

- Giới hạn backing canvas LIVE ở1080×1920 với khung dọc16:9 (44% ít điểm ảnh hơn1440×2560), vẫn giữ high detail, FPS và nội dung các hiệu ứng. Preview giữ720px, light giữ900px.
- CharacterFrames tái dùng raster lớn khi camera zoom lùi, chỉ cấp phát lại khi cần lớn hơn; transform repaint dùng đúng scale thật của buffer.
- Cache actor có LRU và trần32MiB, ngoài trần64 actor; tránh64 buffer zoom8 chiếm gần300MiB. Khi đổi quality vẫn clear để hạ bộ nhớ.
- resize bỏ tái dựng canvas/nền khi kích thước, chiều cao logic và asset nền không đổi. Khi asset map đổi vẫn vẽ lại.
- Kiếm nhỏ Huyền Tiên dùng mip128×256 cache theo asset bằng WeakMap; cự kiếm giữ ảnh lớn. Không thay timeline, skin, âm hoặc số kiếm.

## Kiểm

419/419 test pass; thêm test tái dùng cache khi zoom lùi, native transform, byte budget/LRU và ceiling1080. Log output/live-lag-tests-20261105.log. Backup data/backups/live-lag-20261105/.

Sau refresh: client89/high/1080px. Bốn lần lấy telemetry cách5s, đều30FPS, 8 người trên sân, không solo. frameMs2.6/2.0/2.7/2.0; P952.8/2.8/3.6/4.0ms; cache7.02MiB. Không so với mẫu solo trước đó như benchmark cùng tải. Chưa đo hết các cảnh đột phá/quà/boss trên LIVE và chưa xác nhận từ phía người xem. Không tuyên bố hết mọi lag mạng/encoder.
