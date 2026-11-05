# Sân chung và màn đột phá — 03/11/2026

- Sân không tự trôi hoặc giữ mức zoom cũ từ URL. Zoom chủ động chỉ dành cho tương tác được chọn; quà combo tổng không quá 10 coin giữ nguyên sân. Lời chào người mới vẫn có nhưng không giật camera.
- Khi hơn 12 người và không có sự kiện riêng: dùng đội hình cố định, giới hạn Light 32 / Balanced 48 / High 60. Tư thế PNG cache tĩnh, không vẽ pháp bảo/linh thú/vòng lớn riêng từng người. Không xoá sở hữu vật phẩm hoặc skin.
- Hệ thống còn chọn/luân phiên người theo hoạt động khi vượt ghế. Tăng ghế không phải cam kết đã đo FPS trong LIVE Studio.
- Đột phá có cảnh riêng: nền tối, tụ khí, hình tượng/PNG theo cảnh giới, năng lượng hội tụ, xung kích/rung ngắn, đổi từ hình cũ sang hình mới ở 72% thời lượng, âm tụ khí/impact/thành công. Chữ tên và cảnh giới là DOM, không phụ thuộc độ phân giải canvas.
- Hình cũ lấy từ snapshot trước sự kiện; từ/cảnh giới đích lấy từ event. Không lùi hoặc chỉnh dữ liệu server. Skin đặc biệt đang sở hữu vẫn tuân thủ lựa chọn hiện có.
- Trúc Cơ không có skin đặc biệt hoặc mốc coin cao dùng lại ảnh legacy riêng, khác áo Luyện Khí; không tạo sprite PNG mới trong đợt này. Kiếm trúc dựng lần lượt dùng hình học Canvas, kết hợp atlas PNG đột phá đã có.
- Trình diễn khoảng 5,2–10,8 giây theo cảnh giới. Gộp các đột phá đang chờ của cùng người, giữ hình đầu và cấp cuối; lượt chờ từ 12 giây được ưu tiên trước VIP mới. Hàng chờ vẫn có trần 12, không thay đổi phần thưởng đã cấp.
- Quà nhỏ/nhập môn không thay thế đột phá đang chạy. Khi chiếu đột phá chỉ dựng một người, bỏ qua dựng sân chung.
- Giữ các sự kiện server, giá quà, lịch và dữ liệu người chơi. Chưa chuyển VPS.

Xem thử trên máy: http://127.0.0.1:4317/cinema-preview.html . Trang tự dựng người giả tại trình duyệt, không gọi API hành động hoặc thay đổi LIVE. Có chọn cảnh giới, thử đột phá và quà nhỏ.

Kiểm chứng: native Canvas snapshots trong output/live-cinema-v1, kiểm thử đầy đủ trong output/live-cinema-v1/tests.log. Cần tải lại nguồn Link để trình duyệt đang mở nhận module mới. Chưa kiểm tra thực tế bằng LIVE Studio hoặc nghe loa; không cam kết VPS sẽ chữa lag GPU/encoder.

## Sửa độ nét tiếp theo

- Chẩn đoán qua client-status: nguồn Studio đang chạy báo renderWidth 635; trang quản trị 360. Nguyên nhân resize lấy min(devicePixelRatio, ngân sách/CSS width), nên nguồn bị giới hạn theo pane trình duyệt.
- Backing canvas mới độc lập kích thước pane: Balanced/Auto 1080 ngang, Light 900, High 1440; trang quản trị 720 ngang nhưng giữ 12fps. Khung 9:16 Balanced dựng 1080×1920.
- Tăng raster nhân vật và độ phân giải atlas áo; riêng người đột phá dùng cache 4,5×. Giữ số người, FPS, số hiệu ứng và Auto hạ chất lượng.
- Đây là độ phân giải dựng nội bộ. Nguồn Link và đầu ra LIVE Studio vẫn phải đặt đúng khung 1080×1920; bitrate/nén TikTok có thể ảnh hưởng hình cuối.
- Các nguồn đang mở phải reload. Chưa có đo FPS sau reload tại thời điểm ghi chú này.

## Đột phá kéo dài và tăng cao trào

- Thêm 2.200–3.000 ms theo cảnh giới, từ 7,4 giây ở Luyện Khí tới 13,8 giây ở Thần Đế.
- PNG atlas mới assets/breakthrough-v3/celestial-spectacle.png: ngọc trận, rồng, phượng, nhật luân, sóng nổ và tinh giới. Tạo bằng imagegen tích hợp, giữ alpha; thông tin/prompt ở README cùng thư mục.
- Cấp 1–2: ngọc trận nhỏ; cấp 3–5 thêm nhật luân; từ Luyện Hư (6) thêm rồng quay; Kim Tiên (10) thêm phượng chuyển động cánh; cảnh giới Thần (14+) thêm vòng tinh tú. Bán kính, luồng hội tụ, tia nổ và độ rung tăng theo từng cấp, sóng nổ tăng theo nhóm.
- Giữ hình tượng cũ theo cảnh giới và màn biến hình ở 72%; hiệu ứng mới ở phía sau thân người, phía trước chỉ có sóng/tia ngắn. Thay flash xám toàn màn bằng một bloom cục bộ.
- Có nhịp âm dồn lực và tiếng dư chấn mới cho cấp cao; vẫn tôn trọng mute và giới hạn âm.
- Tải atlas một lần, cắt sáu sprite trong bộ nhớ. Chế độ Nhẹ giới hạn số luồng/tia, tất cả cấp vẫn dựng một người trong đột phá. Nhân vật thần có thể nâng atlas lên 512 khi solo, không nâng mọi sprite trên sân chung.

## Hấp thụ năng lượng và va chạm màn hình

- Tất cả cấp: các luồng linh khí cùng co về ngực, lõi năng lượng nhỏ sáng lên rồi bùng, không chỉ quay quanh người.
- Cấp 6–9 và Thần Đế 18: đầu rồng chính diện phóng lớn lao sát camera trước nhịp biến hình.
- Kim Tiên–Tiên Đế 10–13: phượng bay theo đường cong vào người, thu nhỏ dần tới lúc nhập thể; chim đứng sau không còn tiếp tục hiện khi đã bay vào.
- Cấp thần 14+: chưởng ấn vàng tiến ra màn hình rồi dội thành vết rạn ánh sáng/mảnh kính. Cấp 18 có cả long uy và chưởng ấn theo nhịp.
- Vết nứt chỉ là lớp vẽ trong canvas, tự tan trước khi trở về sân; không tác động desktop hoặc màn hình thật. Tắt lunge, shards và cracks khi reduced motion; âm mới đi qua mute và limiter hiện có.
- Atlas mới dragon-palm-impact.png tạo bằng imagegen tích hợp; prompt lưu README cạnh asset. Mỗi frame thêm tối đa 6 lượt draw PNG trong kiểm thử, tia/mảnh kính giới hạn riêng ở chế độ Nhẹ.

## Tông môn và Tông chủ

- Map mới sect-hall: đại điện, ghế Tông chủ trống, sân đá chữ nhật thoáng phía dưới, hàng ghế 1–60 người không đè lên ngai. Các map cũ vẫn còn; chỉ map mới có ghế chủ tông.
- PNG mới tạo bằng imagegen, file public/assets/sect-hall-v1/courtyard.png; prompt ở README cạnh ảnh. Nhân vật Tông chủ dùng ảnh áo hiện có, không phải NPC nhận quà hoặc hồ sơ đứng top.
- sect-master.mjs nhận bình luận raw TikFinity đúng uniqueId/displayId đã cấu hình, không nhận theo nickname. Không suy ra vai trò từ tên, không cộng quà/tu vi riêng. Trạng thái biểu diễn tồn tại 22 giây, bong bóng lời nói 12 giây, có nhịp thở/cúi chào nhẹ.
- Cấu hình username qua POST /api/sect-master (chỉ localhost), lưu data/sect-master.json; có ô Ghế Tông chủ trong tab Map. Đổi tài khoản không cần restart.
- Tông chủ tạm ẩn khi đột phá, đua hoặc có sân sự kiện riêng. Người host đã nhận diện không bị vẽ thêm một bản ở hàng ghế thường trên map tông môn.
- Trang cinema-preview.html có nút Thử Tông chủ dùng dữ liệu giả trong trình duyệt, không phát sự kiện vào LIVE.

## Dọn khung cảnh theo yêu cầu

- Bảng 5 lệnh chuyển từ góc trái dưới sang góc phải dưới.
- Ẩn toàn bộ scene-top (nút mắt, âm nhạc, thiết lập) và scene-bottom (số đạo hữu, đồng hồ bí cảnh) khỏi khung cảnh, cả preview quản trị và overlay.
- Đổi nhãn trợ năng Canvas thành Sân tông môn, bỏ câu mô tả dài được người dùng phản ánh. Giữ DOM của nút và counter để code hiện tại không lỗi; không thay trạng thái âm thanh.

## Hai ghế trưởng lão cạnh Tông chủ

- Hai người thật có active=true, xếp theo cảnh giới giảm dần rồi tổng tu vi, ngồi bên trái/phải: Đại trưởng lão và Nhị trưởng lão. Loại resident, puppet, webOnly và tài khoản Tông chủ đã nhận diện.
- Xếp hạng dùng cờ hoạt động LIVE hiện có từ server (tương tác gần đây); đây không phải danh sách chính xác ai đang xem/đã thoát của TikTok.
- Tự cập nhật theo snapshot; không cấp thưởng, đổi cảnh giới hay trang phục đã sở hữu. Không vẽ trùng ở hàng ghế dưới. Khi có màn solo/đua/tỷ thí dùng sân sự kiện cũ.
- Ghế vẽ Canvas nhẹ; không cần thêm PNG hoặc restart backend. Reload nguồn để nhận module mới.

- Sửa ghế Tông chủ: mặc định luôn có nhân vật ngồi; trạng thái active/22 giây chỉ điều khiển cúi chào và lời nói, không còn làm ghế trống. Tài khoản cấu hình vẫn là dekukun2703 tới khi người dùng cung cấp tài khoản khác.

- Tông chủ có PNG riêng sect-master-throne-v2.png: long bào đen vàng, dáng ngồi ghế tay trên tay vịn và chân buông. Tọa độ theo crop nền thay vì dùng hàng ghế thường. Không áp dụng bộ hiệu ứng skin/quà/cảnh giới của người chơi.
