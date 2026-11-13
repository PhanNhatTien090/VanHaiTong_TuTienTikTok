# Linh thú 300 coin — bộ tư thế vẽ riêng

Tạo bằng công cụ ImageGen trong Codex ngày 14/11/2026 cho Vân Hải Tông. Mỗi ảnh gốc là lưới 4×2, tám tư thế thực sự được vẽ riêng: hồ ly chạy/nhảy, rồng uốn thân, phượng vỗ cánh, kỳ lân phi nước đại, hổ vồ/chạy. Không tạo frame bằng biến dạng mesh hay kéo ảnh tĩnh.

`node scripts/build-premium-pet-motion.mjs` đóng gói các ô có alpha thành atlas 192px/ô, WebP chất lượng 94. Runtime `public/premium-pet-motion.js` chọn frame đúng chu kỳ từng con. Nguồn vẽ giữ lại tại đây để sửa đúng từng tư thế. Bộ living-v1 cũ không được chọn bởi runtime mới.
