# Kim Tiên · Thiên Lô Luyện Thân

Ba asset mới tạo bằng built-in ImageGen ngày05/11/2026: forge-world.png (nền độc lập), bronze-petal.png (cánh sen kim loại có alpha), forge-fire.png (hỏa kiếp có alpha). Không dùng ảnh tham chiếu hay ảnh phim. Prompt gốc và SHA256 trong prompts.json. Ảnh được copy từ generated_images vào thư mục dự án, không sửa bằng công cụ cắt nền.

Runtime public/kim-tien-awakening.js tải khi nhận sự kiện realm10, thu gọn nền về900×1600, cánh256×512, lửa320×640 một lần. Chuyển động dùng timeline riêng 28s, không dùng texture kiếm/sét/nền của nghi thức cũ. Renderer nhân vật và engine Canvas vẫn dùng chung.

Nhạc/SFX mới do public/kim-tien-audio.js tổng hợp, không trích OST hoặc âm thanh từ phim. Không có sample dịch vụ ngoài hay API key. Chất liệu mô phỏng đồng/lửa/đá, motif F thứ chuyển F trưởng. Chưa có đánh giá nghe trực tiếp; số đo offline không phải chứng nhận chất âm.
