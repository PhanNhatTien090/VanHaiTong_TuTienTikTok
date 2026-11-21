# Trang điều hành không có khung LIVE · 05/11/2026

Trang quản lý tại cổng4317 (không có overlay=1) đã ẩn khung scene-shell và dùng ManagementState thay Scene: không khởi tạo Canvas2D, không ảnh sân chơi, không RAF; không enqueue hiệu ứng/giọng đọc tự động hay NPC trình diễn. Danh sách người chơi, chỉnh hồ sơ/đồ, map, ban thưởng, sự kiện, tu sĩ giả, skin, cấu hình và sao lưu giữ nguyên.

Các nút chất lượng, zoom, âm lượng/giọng/NPC chuyển sang Thiết lập, audioPanel dạng tĩnh. Thử âm là thao tác chủ động; không tự phát lại lời LIVE trên trang điều hành.

Nguồn ?overlay=1 vẫn dùng Scene và toàn bộ hệ trình diễn hiện tại, không chỉnh hoặc restart server/Studio. File app.js build management-only-20261105, client telemetry90 có managementOnly. Trang cũ cần F5 để nạp.

420 test; log output/management-only-tests-20261105.log. Test mới chặn việc ManagementState tạo Image/context/RAF, kiểm giữ state cho quản lý và không sinh hàng hiệu ứng. HTML IDs không trùng, settings mount tồn tại. Kiểm tra trực tiếp Edge bị công cụ từ chối: Local browser use is disabled in Work settings. Không chuyển sang cách điều khiển browser khác để vượt cài đặt.

Backup data/backups/management-only-20261105/.
