# Kiểm kê animation linh thú LIVE trước khi nâng cấp (15/11/2026)

## Hiện trạng đã xác nhận từ code thực tế

- **13 linh thú, tất cả đều đã có animation.** Không được gọi bất kỳ con nào là ảnh tĩnh.
- **8 linh thú loại atlas cơ bản** (`jade-rabbit`, `ember-fox`, `frost-tiger`, `sun-phoenix`, `astral-dragon`, `loi-oa`, `van-thu`, `ky-lan`): PNG chia **3 tư thế vẽ riêng theo hàng ngang**. Hàm `slicePetFrames` đưa từng tư thế thành frame 160×160; `petArtFrame` chọn theo chu kỳ [0,1,0,2], nhịp 230ms. `astral-dragon` có ba vạch chia **không đều** [0, .292, .668, 1] nên không được cắt đều theo chiều ngang.
- **5 linh thú thiên linh thú** (`bach-nguyet-ho`, `ngoc-chau-long`, `xich-ha-phuong`, `tu-nguyet-lan`, `hac-tinh-ho`): chạy **8 tư thế vẽ riêng**, atlas WebP 4×2, 192×192 mỗi ô (`-drawn-v2.webp`), chu kỳ 800–1440ms riêng theo loài. `premiumPetPose` còn điều khiển lắc, nghiêng, bay. Không được tái tạo bằng kéo méo 1 ảnh.
- Các loài còn có **nhún/lắc/độ nghiêng**, FX theo loài (`drawRareFx`) và hiệu ứng triệu hồi (`pet-arrival-fx.js`).
- Linh thú và pháp bảo thay phiên hiển thị theo `follower-turn.js`, **7,5 phút/lượt**, ngoại trừ khi Linh Thú Cốc mở.
- Nơi hiển thị ảnh liên quan: **sân LIVE**, **Linh Thú Cốc**, **hoạt cảnh nhận linh thú**, **bảng xem/thumbnail**. Không thể chỉ sửa `drawPet` rồi coi là hoàn thành.

## Quy tắc bắt buộc cho Linh Thú 2.0

1. **Giữ nguyên ID, 13 sprite gốc và toàn bộ animation gốc.** Stage 0 luôn dùng nguyên asset và hàm chọn frame hiện tại; không thay bằng ảnh tạo mới.
2. Mỗi hình thái Chiến Linh, Thánh Linh, Bản Mệnh **phải có bộ frame được vẽ riêng**. Đối với 8 loài thường/thần thú: ít nhất 3 pose/hình thái theo cùng cấu trúc, đủ **72 pose mới**. Đối với 5 thiên linh thú: 8 pose/hình thái theo atlas hiện tại, đủ **120 pose mới**. Tổng cộng cần **192 pose mới** (39 atlas), chưa tính VFX và các asset chuyển cảnh.
3. Trước khi tải một hình thái mới: phải có manifest hợp lệ, đủ số frame, kích thước, alpha, các pose khác nhau thực sự, tên/ID chính xác và thử nghiệm ngay trên Canvas LIVE.
4. Nếu asset thiếu/hỏng: **fallback nguyên animation stage 0**. Không hiện ô trống, không đổi sang ảnh tĩnh, không dùng ảnh của loài khác. Không hiển thị hình thái mới nếu bộ ảnh chưa đạt QA.
5. Preserve frame phases, tốc độ và ngân sách: GPU/CPU/VRAM phù hợp RenderBudget; cấm giải mã đồng thời tất cả 39 atlas; lazy-load theo thú/scene, giới hạn cache; huỷ cache khi bị áp lực bộ nhớ.
6. Regression đầy đủ: bốn chỗ hiển thị, giảm chuyển động, 10–100 nhân vật, stage-transition, mất mạng/load failed, chuyển cảnh, reload, event lock, follower turns; so sánh ảnh và số đo với code trước.
7. **Ảnh Ngọc Thố 2×2 vừa sinh trong chat là concept bị loại**, không dùng trong repository và không coi là bộ hoạt ảnh; chưa có bất kỳ hình thái tiến hóa mới nào được duyệt/đưa vào game.
8. **Không bật cờ evolutionArt** cho đến khi đã đủ atlas và kiểm thử liên thông. Không sửa `main`, không phát hành sản phẩm khi chưa đạt.

## Tiêu chí kiểm định tối thiểu

- 8 bộ cơ bản: 3 frame hợp lệ và không trùng hệt nhau; 5 bộ premium: 8 frame hợp lệ/atlas, và chuyển động tiến triển theo chu kỳ; không mất FX và vị trí đứng.
- Số lượng atlas mới chính xác 39, pose mới chính xác 192, không trộn nhầm tên loài/tư thế.
- Performance benchmark so sánh phiên cũ & mới trên kịch bản tương tự (10/20/50/100 người), có ngưỡng dừng và rollback.
- Luật hiện có về luân phiên pháp bảo/thú được giữ nguyên.
