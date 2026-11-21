# LIVE — giao diện Nguyệt Cung và tu luyện duy trì

- Nền chính Vân Hải Nguyệt Cung mới; giữ bố trí tông môn để Tông chủ luôn có ghế. Các sự kiện giữ bản đồ riêng.
- HUD xanh biển/ngọc, nền bảng trong suốt, font serif hỗ trợ tiếng Việt. Khôi phục bảng Quà → Thưởng, tăng chữ. Bỏ chữ NPC trên tên/trình diễn; cờ nội bộ và loại khỏi bảng người/quà thật vẫn giữ.
- Ít người: tăng kích thước và gom hàng ghế; không chia hai hàng cách nhau 29% chiều cao nữa. Câu đủ điều kiện: **✦ Gõ đột phá**.
- Hình cảnh giới mới là PNG riêng cho từng giới tính/tư thế; loader giữ tỉ lệ, không cắt atlas. Giữ skin phần thưởng đang được chọn. `scripts/install-realm-skins-v2.py` kiểm RGBA/tỉ lệ, sao chép nguyên ảnh và chỉ kích hoạt bộ đã đủ bốn tư thế/giới tính.
- Người chơi thật không còn bị chuyển đột phá thành hiệu ứng qi bởi hồi toàn sân 60–90s. Đột phá trong cuộc đua được giữ trong hàng chờ, phát sau cuộc đua thay vì bị bỏ. Đã ghép **89779d2 của Claude — Kim Đan v2 Cửu Chuyển · Thiên Hỏa Đan Lô**, giữ các thay đổi riêng của LIVE.
- Giọng phần thưởng đọc người nhận và đồ/tu vi thực nhận, không đọc lời kêu gọi tặng quà, tên quà hoặc giá coin. Clip mở đua v4 đã thay các câu cũ.

## Chính sách tu vi hiện hành (thay phần hard cap trong tài liệu v4 cũ)

Từ cảnh giới hiện tại Hóa Thần (5): pool nhận đủ 100% tu vi mỗi ngày = **900 + 75 × (realm − 5)** điểm chuẩn hóa, tối đa realm 21 = 2.100 điểm. Ví dụ Chân Tiên 1.125, Tiên Đế 1.500, Thần Đế 1.875. Các cảnh giới dưới Hóa Thần giữ nguyên.

Qua mốc vẫn nhận **10% tu vi miễn phí**, không khóa chơi. Vật phẩm/tài nguyên tiếp tục nhận. Thuốc tu vi được giữ lại nếu pool 100% không đủ để không hao phí đan. Quà cá nhân và chỉnh sửa admin giữ nguyên. Lượt vượt mốc được chia theo phần còn lại 100% và phần vượt 10%, không nhân toàn lượt thành 100%.

Hạn mức tăng theo cảnh giới nhưng điểm đã dùng không được reset. Qua 0 giờ Việt Nam mới làm mới ledger. Giới hạn **một đột phá đại cảnh/ngày** từ Hóa Thần vẫn dùng chung cho các đường thường, ban phúc và Cơ duyên. Tiến độ dư Cơ duyên và đồ/tổng tu vi được giữ.

`dailyPracticeLimit` cấu hình là pool gốc; `dailyPracticeRealmBonus` là số điểm thêm mỗi cảnh giới (mặc định 75, có thể đặt 0 để dùng pool cố định). `dailyPracticeLimit=0` vẫn tắt giới hạn như trước.

## Triển khai và kiểm chứng

Ngày 06/11: các bộ Thần v2 chưa được duyệt đã tắt. Chỉ bộ Thần Quân Long Giáp v3 được người dùng duyệt và áp dụng đủ bốn ảnh riêng nam/nữ đứng/ngồi. Registry vẫn dùng tên realm-skins-v2-data.js nhưng trỏ realm 16 tới assets/realm-skins-v3/than-quan; các realm Thần khác giữ renderer cũ. Mẫu Thần Vương Tinh Tú mới nằm trong output/realm-skins-v3 để duyệt, chưa áp dụng. Installer có danh sách cảnh giới được duyệt để không vô tình bật các bản nháp cũ.

Các file public không cần restart server; tải lại overlay. Overlay mới theo dõi build index và tự tải bản triển khai sau phần trình diễn. Chỉ thay backend mới dùng script restart có buffer quà và backup.

Đã xác nhận server trả softRate 0.1 và hạn mức tăng theo realm; TikFinity connected. Đối soát restart: không mất hồ sơ, không giảm realm/tổng tu vi hoặc đồ sở hữu. Có xử lý retry khi Windows tạm khóa file snapshot, tránh crash do EPERM khi rename.

Sau ghép Kim Đan v2: 461 bài kiểm tra qua, npm run check qua. Đã nhìn thấy đan lô/hỏa long trong trình duyệt dùng chính renderer LIVE; chưa đánh giá chất lượng âm bằng tai. Ảnh kiểm tra ở output/kim-dan-v2-claude-live-verified.png.
