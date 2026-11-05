# Thần trang tiên ma v1

14 cảnh giới, 3 bộ vinh danh. Nam/nữ, đứng/ngồi: 68 sprites. Thiết kế lấy cảm hứng phong cách từ ảnh người dùng cung cấp, không sao chép nhân vật tóc đỏ hoặc bộ đỏ trắng. Nguồn ImageGen; các bản gốc được giữ nguyên trong generated_images.

- realms-0.png: Phàm Nhân / Luyện Khí / Trúc Cơ / Kim Đan.
- realms-1.png: Nguyên Anh / Hóa Thần / Luyện Hư / Đại Thừa.
- realms-2.png: Chân Tiên / Huyền Tiên / Kim Tiên / Thái Ất.
- realms-3.png: Đại La / Tiên Đế.
- honors.png: Đại Hộ Pháp / Lão Tổ gắn bó / Đại Trưởng Lão.
- halo-atlas.png: 4 pháp luân trong suốt. Xoay và linh châu được thực hiện khi render, không ghép cứng vào nhân vật.

Thứ tự dòng: nam đứng / nữ đứng / nam ngồi / nữ ngồi. Các dòng gốc có chiều cao khác nhau. DIVINE_LAYOUTS trong public/divine-wardrobe.js ghi ranh giới đúng theo ảnh đã kiểm tra; cắt theo metadata, giữ tỷ lệ, chừa viền trong bộ nhớ, không chia 4 dòng bằng nhau.

Ảnh tải lười theo người đang hiển thị; giải mã về cache 192px chất lượng nhẹ, 256px chất lượng khác. Không giữ atlas lớn sau khi cắt. 3 danh hiệu chỉ xét người đang hoạt động; giữ skin sự kiện chọn tay. Quyền sở hữu quà cũ và chỉ số không bị đổi. Lệnh skin macdinh về áo cảnh giới, skin vinhdanh để dùng bộ danh hiệu đủ điều kiện.
