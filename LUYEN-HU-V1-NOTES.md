# Luyện Hư — Bát Ấn Khai Hư

## Bản sửa theo phản hồi mới

Đã bỏ giáp thú khỏi runtime và bỏ tải atlas boss cho màn này. Các mô tả giáp thú bên dưới là concept cũ, được thay bằng: tám mảnh ấn từ cửa bay xuống thành tám neo quanh người; pháp trận ba tầng vẽ từng cạnh; cột linh lực dựng lần lượt; hạt lực chạy theo đường cong nối đúng neo với đan điền. Thêm đường hầm tám dải xoắn bên trong cửa (Light: bốn), lưới tinh đồ và luồng nhập thể; không thêm ảnh mới. Giữ 20,8 giây và mốc đổi hình 17,55 giây. SFX giai đoạn 9,6 giây thay tiếng giáp thú đến bằng tám tiếng khóa ấn.

## Concept ban đầu (để đối chiếu)

03/11/2026. Riêng cảnh giới 6, dài 20,8 giây. Giữ các renderer cảnh giới 1–5; thời lượng cảnh giới sau dịch thêm cùng khoảng để tiếp tục tăng dần.

1. 0–2,2 s: khe hư không xuất hiện từ tâm, các vết rạn nối thành cửa.
2. 2,2–5,2 s: tám mảnh ấn lần lượt về vị trí, mở cửa có trường sao bên trong.
3. 5,2–9,2 s: linh xà/rồng vàng uốn quanh cửa, thân tách đoạn nối liên tục, có lớp sau/trước người.
4. 9,2–12,6 s: giáp thú ngọc bay vào, từ xa đến gần rồi dựng kết giới dưới chân. Ảnh có sẵn được chia dải để chuyển động hơi thở và bờm; không gọi đây là ảnh rùa mới.
5. 12,6–15,7 s: cửa co, cả hai linh thú thu nhỏ cùng hướng về đan điền; dòng khí tiếp nối từ hai màu vào tâm.
6. 16–17,2 s: tám mảnh ấn nén lại, lực dồn vào người.
7. 17,2 s: đỉnh lực và tám sóng áp lực nối nhịp; đổi áo tại 17,55 s.
8. 17,55–20,8 s: giữ rõ hình mới, cửa tan rồi trả sân chung.

Tài sản tái sử dụng thực tế:
- `public/assets/gift-beasts-v1/dragon.png`: atlas đầu/thân/đuôi; dùng bộ khớp uốn có sẵn.
- `public/assets/boss-atlas.png`: ô giữa, cắt riêng ở 640 px, dùng làm giáp thú bảo hộ.
- Trang phục của chính người chơi được raster cache, không thay bằng người mẫu khác ở đầu màn.
- Cửa, khe rạn, ấn, kết giới, trường sao và luồng hợp nhất dựng bằng Canvas. Không thêm thư viện hay PNG mới.

Web Audio tổng hợp nguyên gốc: mở khe, tám tiếng ngọc, tiếng lực bay, giáp thú hạ xuống, nhập thể, cú bùng và hợp âm kết. Dùng clock chung và dọn nguồn khi ngắt/mute; vẫn giữ mức master và SFX. Chưa đánh giá chất âm bằng tai trên hệ thống LIVE.

Chế độ Light giảm số sao, đoạn thân và dải ảnh. Giảm chuyển động bỏ rung và giảm cường độ bùng. Cache ảnh hữu hạn, không đọc pixel mỗi frame. Màn hình chỉ hiện tên và cảnh giới.

Preview: http://127.0.0.1:4317/cinema-preview.html?realm=6&autoplay=1

Kiểm chứng: `node --test test/luyen-hu.test.mjs`, `node render-luyen-hu.mjs` và `--female`, `node scripts/qa-luyen-hu.mjs`. Các thử nghiệm dùng preview không gửi hành động lên thế giới LIVE.

Lịch NPC được sửa cùng đợt: đăng ký tối đa một lượt chờ, không cần ghế đang hiện trên sân, không cần hàng người thật trống hẳn mới đăng ký. Theo dõi đúng ID lượt NPC đang chạy/chờ, rồi đăng ký lượt kế sau 1 giây; không ngắt màn đang chạy. Đua/tỷ thí đang hoạt động thì tạm chờ.
