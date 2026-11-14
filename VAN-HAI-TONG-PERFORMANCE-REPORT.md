# Hiệu năng Vân Hải Tông khi LIVE

Mốc đối chiếu là `a5503e0` trên nhánh `main`. Máy đo dùng Ryzen 7 5800H, khoảng 15,4 GiB RAM khả dụng từ phần cứng và AMD Radeon tích hợp. Luồng vận hành đi từ TikFinity qua Node.js, SSE, Canvas 2D và nguồn Link.

## Kết quả và thay đổi

- `public/crowd-policy.js` và `public/scene.js` chọn mức dựng theo số nhân vật dự kiến của cảnh. Số khán giả, nhân vật active, ứng viên, nhân vật trên sân, thân nhân vật đang thấy và lần raster lại được báo riêng. Quảng trường có 50 ghế. Đua, mê cung, tỷ thí, Chính Ma và luyện đan vẫn dùng đường bố trí riêng.
- `public/performance.js` giữ vùng đệm tại các ngưỡng và tái sử dụng raster đã cấp phát. Key gồm nhịp pose và chế độ dựng. Khi đông và FPS thấp kéo dài, giảm nhịp pose phụ và ambience, giữ chất lượng ảnh và số pixel. `FrameClock` lấy lại pha sau khoảng nghỉ. Đột phá dùng cùng giới hạn FPS của cảnh.
- `public/stage.js` tính điểm ưu tiên mỗi ứng viên một lần trong lượt và bỏ sắp xếp khi sân đã đầy, không có ứng viên chờ hoặc bắt buộc vào sân. `public/scene.js` truyền scale đã biết và tái sử dụng layout tên ổn định.
- `public/app.js` bỏ lượt dựng hướng dẫn trùng và ghi DOM tên map khi nội dung đổi. Thêm `perf=1` ở URL overlay để xem các percentile của nhịp rAF, frame dựng, JavaScript vẽ, cập nhật Scene, StageDirector và HUD trong `/api/client-status?world=live`.
- Server hiện đã chọn hồ sơ trước khi dựng snapshot, dùng dữ liệu rút gọn cho overlay và chia sẻ gói SSE đã serialize theo world/view. Đường ghi quà, ưu tiên broadcast, lưu dữ liệu và TikFinity không được sửa. Tower vẫn kiểm tra theo chu kỳ hiện có vì đồng hồ và phản hồi trúng đòn dùng chung đường cập nhật.

## Đo nhẹ StageDirector trước và sau

Mỗi hàng có 18 lần cập nhật. Hai bản nhận cùng danh sách, lượt yêu cầu bắt buộc và đợt 20 tương tác. Thứ tự chỗ ngồi giống nhau ở mọi lượt. Số thời gian là trung vị của một phép đo ngắn trong Node.

| Ứng viên | Chờ, ms trước → sau | Tương tác dồn, ms trước → sau | Lượt gọi score trước → sau |
|---:|---:|---:|---:|
| 50 | 0,103 → 0,101 | 0,052 → 0,043 | 0 → 0 |
| 100 | 0,136 → 0,044 | 0,296 → 0,173 | 7.697 → 826 |
| 300 | 0,879 → 0,093 | 0,838 → 0,616 | 53.631 → 2.629 |
| 500 | 1,166 → 0,075 | 1,389 → 0,571 | 107.149 → 4.429 |

## Số đo thụ động và phần còn thiếu

Một mẫu chẩn đoán của phiên LIVE đang chạy có nguồn 1080×1920 DPR 1, 20 nhân vật active, 20 trên sân, 11 FPS, p95 JavaScript 16 ms và cache thân nhân vật 8,58 MiB. Trong cửa sổ gần 5 giây, rAF đạt 15,8 lần/giây, khoảng ngắt dài nhất 139 ms, hai long task tổng 131 ms. Endpoint server cho một cửa sổ riêng p50 30,83 ms, p99 137,49 ms, cực đại 3.739,22 ms và heap khoảng 141 MiB. Các mẫu khác cửa sổ và không cùng tải. Chuỗi ANGLE AMD Radeon cho biết loại renderer. Thời gian lệnh Canvas JavaScript không đo GPU hay compositor.

| So sánh tải giống nhau | Trước | Sau |
|---|---|---|
| FPS, frame P50/P95/P99 | Chờ benchmark | Chờ benchmark |
| Cache hit/miss, cấp phát, byte dùng và đỉnh | Chờ benchmark | Chờ benchmark |
| Event loop và snapshot/serialization | Chờ benchmark | Chờ benchmark |
| 24 với 30 FPS, quà lớn, boss và chuyển cảnh | Chờ benchmark | Chờ benchmark |
| Ảnh đối chiếu 1080×1920, 720×1280, 540×960 | Chờ benchmark | Chờ benchmark |

`node scripts/benchmark-live-performance.mjs --dry-run` liệt kê 25 tổ hợp. Khi LIVE đóng, chạy `node scripts/benchmark-live-performance.mjs`. Script tự dừng khi trạng thái LIVE đang mở hoặc không xác định được, và chỉ tạo trình duyệt thử sau lần xác nhận. Kết quả nằm ở `output/live-performance/matrix.json`. Benchmark trình duyệt thử dùng màn Canvas của game. Thống kê server trong script là phép đo snapshot và tuần tự hóa trên dữ liệu giả trong tiến trình benchmark. Studio, VieNeu và bộ mã hóa phát cần được đo riêng trong một phiên thử được kiểm soát.

## Regression

`npm run check` qua. 27 bài mục tiêu qua, gồm ngân sách dựng, phân ghế, viewport bằng hàm tính backing, cache, quà lớn trong sân 500 hồ sơ, quay về sân và Linh Thú Cốc. `npm test` toàn bộ và benchmark Chromium chờ phiên LIVE kết thúc. Bộ đệm 1080×1920 ở DPR 1 được xác nhận trong unit test. Giới hạn cache thân nhân vật vẫn là 32 MiB. Chưa đo được mức sử dụng bộ nhớ tổng của trình duyệt sau thay đổi.

Hai bài regression cũ được cập nhật để bổ sung mô phỏng kích thước Canvas theo giao diện DOM và truyền linh thú 200 coin đã được chọn cho lượt. Hai thay đổi chỉ nằm trong test. Không restart, push hay triển khai.

Kiểm tra bổ sung có một lỗi ở bài mô phỏng số lượt tu luyện tới cảnh giới tối đa trong `test/ascension-pacing.test.mjs`. Các file xử lý tiến trình và test này giống mốc `a5503e0`.
