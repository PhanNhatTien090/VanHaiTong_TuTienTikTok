# Ghi chú chuyển VPS — 03/11/2026

Kiểm tra bổ sung: xem VPS-PREFLIGHT.md. Chưa chốt nhà cung cấp hoặc xác nhận bản hiện tại chạy nguyên trạng trên Linux. LightNode chỉ là ứng viên cần xác nhận điều khoản/tài nguyên; Vietnix có điều kiện riêng về game server. Không thanh toán dài hạn dựa riêng vào bảng giá trên đây.

- Người dùng ưu tiên độ mượt, uy tín và giá hợp lý; dự kiến tối đa 50 người chơi web đồng thời.
- Ưu tiên thử VPS Việt Nam trước. Singapore vẫn là phương án nếu giá tốt và đường truyền thực tế ổn vào giờ tối; chưa kết luận độ trễ khi chưa đo từ Việt Nam.
- Cấu hình khởi đầu dự kiến: Linux, 2 vCPU, 4GB RAM, SSD/NVMe; cần kiểm thử 50 người với bản game thật. Chưa cần GPU hoặc Redis chỉ vì có 50 người.
- Ứng viên thử ngắn hạn: LightNode Việt Nam (công bố 2 vCPU/4GB, 14,7 USD/tháng tương đương, tính theo giờ); đối chiếu Vietnix và VinaHost theo ngân sách. Kiểm tra giá cuối, thuế, giới hạn CPU và băng thông tại lúc mua.
- Không chọn mặc định GreenCloud: điều khoản hiện giới hạn CPU trung bình 30%, liệt kê gaming server và streaming trong nhóm bị cấm; phải có xác nhận phù hợp workload trước khi cân nhắc.
- Kiểm tra độ trễ, mất gói và p95 API trên Viettel/VNPT/FPT giờ cao điểm, CPU steal, RAM, lưu dữ liệu và sự kiện dồn tải. Không cam kết hết lag chỉ dựa trên quảng cáo cấu hình.
- VPS xử lý dữ liệu; đồ họa vẫn chạy trên máy khách/LIVE Studio. Di chuyển server không tự chữa được giật do GPU hoặc upload video.
- Chưa mua hoặc triển khai VPS. Giữ bản local làm đường quay lại khi chuyển.

Nguồn đã kiểm tra:
- https://go.lightnode.com/vietnam-vps
- https://vietnix.vn/vps-amd/
- https://vinahost.vn/thue-vps-gia-re/
- https://green.cloud/terms-of-service.php

## Tăng nhẹ đồ họa cùng ngày

- Light: chiều rộng render 540 → 600, raster nhân vật 1 → 1,25, nhịp cập nhật dáng 6 → 8/giây.
- Balanced/Auto: chiều rộng render 720 → 810, raster nhân vật 1,5 → 1,75, nhịp cập nhật dáng 8 → 10/giây.
- Giữ nguyên FPS tối đa, số người, ngân sách hiệu ứng, nhịp môi trường và cơ chế Auto hạ chất lượng. Không restart server cho thay đổi frontend này; nguồn đang mở cần tải lại để nhận module mới.
