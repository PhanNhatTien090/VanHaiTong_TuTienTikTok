# Huyền Tiên v2 · làm lại nhịp và sức nặng · 04/11/2026

V1 bị chủ game từ chối: ít diễn biến, mở đầu trống, kiếm nhỏ và chậm, kéo dài mà kém Đại Thừa. V2 giữ tổng 36s nhưng thay toàn bộ đường diễn biến hình/âm, chỉ sửa realm 9; không coi số test hoặc độ dài là chứng cứ đẹp.

## Kịch bản đã ghép

- 0,18s: sét đánh từ ngoài đỉnh màn xuống địa trận, có phân nhánh, lõi sáng, quầng và lần tái sáng ngắn. Xung lực lan dưới chân, các đường rạn tỏa ra; phong cảnh xoay nghiêng dưới lực đánh.
- 1,02 và 2,65s: kiếp lôi tiếp, tầng mây cuốn mở, trận đồ mở đủ bốn lớp với dấu khắc. Đã có chuyển động/âm từ đầu, không đợi 7 giây.
- 3,05–4,8s: 36 kiếm rút qua các khe sáng ở địa trận. Mỗi thanh có động tác rút khoảng 0,17s, các đợt sát nhau 0,035s; có tiếng vút/kim ngân theo nhóm, không phát 36 âm cùng lúc.
- 4,8–7,5s: ba tốp kiếm bay nhanh với kiếm dẫn đầu lớn, có khoảng trống giữa các tốp và vận tốc khác nhau. Đã bỏ hình vòng kiếm phân bố đều vì khi xem các frame sát nhau, dù quay nhanh nó vẫn trông như vòng đứng yên.
- 7,5–11,1s: đường bay chuyển thành giao cắt chữ tám và lên trời, vệt kéo/ảnh lưu đi theo kiếm thật. Kiếm khoảng 5,8–7,1 rad/s, không tween một quãng bay trong 5–6s như v1.
- 11,1–12,45s: kiếm lao vào điểm hợp kiếm; từng đường nhập khoảng 0,3s; hợp thành cự kiếm vàng dùng art gốc ở 512x1024 (Dai Thua sword atlas).
- 12,45–17s: cự kiếm dài 760 đơn vị, có lôi chạy dọc hai cạnh. Các cú đánh ở 13,2 / 14,72 / 16,05s làm thân kiếm giật lệch rồi hồi lại, mây và các góc màn phản ứng.
- 17–20,8s: ba nhát chém lớn. Mỗi nhát quất khoảng 0,19s rồi hồi, có lưu ảnh, vệt cắt cong và ba vết xé trời còn lại.
- 20,8–23,4s: lôi thử kiếm liên tiếp; viền cháy sém xanh bạc và tàn sáng chạy ở mép. Ánh sáng góc không tô trắng đặc toàn hình.
- 23,4–24s: cự kiếm lao về đan điền, nhỏ lại theo chiều sâu trong 0,6s rồi mất vào người. Skin vẫn là skin cũ.
- 24,05–26,4s: lực phản phệ bật thành sáu mảnh/thế chắn quanh thân; lôi đánh vào các điểm này.
- 26,4–27,6s: từng mảnh và đường lực bị hút về người theo các nhịp ngắn 0,25s.
- 27,6–28,2s: nén lực ngắn, nhạc rút để chừa lực cho nổ.
- 28,2s: nổ, cột sáng, tia/vụn lực và sóng lan. Lớp nổ chính được đưa ra sau model để không phủ trắng mặt/áo.
- 28,65s: mới đổi visualTo. Có một vòng phi kiếm định lại và địa trận tỏa ra sau hiện thân, tiếp tục vận động trước khi trở lại sân khấu.

## Chất liệu và hệ thống

Tái dùng model/skin LIVE, sword atlas của Đại Thừa, nền thế giới tiên và smokeTexture. Không thêm model nhân vật/đạo cụ của game tham khảo. Renderer mới tách `huyen-tien-vfx.js` (tia sét phân nhánh 65 điểm chính + 7 nhánh, địa trận, sóng lực, góc sáng, viền cháy). Đường kiếm/timeline trong `huyen-tien-timeline.js`; snapshot ngoại hình giữ qua WeakMap như v1.

Đã chuyển tên người chơi lên cao lúc tích lực để tránh cự kiếm xuyên chữ; title/danh hiệu chỉ hiện sau reveal. Style thay riêng realm 9. Nhánh ảnh/âm của các realm khác không được làm lại trong lượt này.

## Âm thanh

Huyen Tien score được viết lại với tiếng sấm nhiều lớp (rạn sắc + thân trầm + đuôi cuộn), tiếng rút kiếm có đầu ngắn, cạnh kim ngân, vút và đuôi gió; nhóm âm bám từng đợt rút/giao cắt/hợp/chém/nhập thể. Có motif phát triển qua bão, hợp kiếm, thử lôi và hợp âm hiện thân.

308 source được lên lịch cho cả 36s, không tạo lại mỗi frame; nhiều nhất 22 cue đồng thời theo cue sheet. Đây là thiết kế âm tổng hợp giả tưởng, không tuyên bố là tiếng kiếm thu âm thật hoặc đã nghe hay. Chưa có tiếng rồng vì chủ đề cảnh này là lôi/kiếm; không nhồi mọi loại tiếng vào một nghi thức.

Sửa lỗi cờ transient của lớp scheduler: trường cờ nằm ở index 7 (v1 đọc nhầm 8). Các cú đánh đã qua không phát lại khi người xem vào giữa cảnh. Scheduler cũ không có trường này tiếp tục hoạt động như cũ.

## Kiểm tra và giới hạn

- 415/415 kiểm thử qua; cú pháp full check và các file mới qua.
- Tests: đường bay liên tục, không đổi skin trước reveal, giữ snapshot ngoại hình dù LIVE update, giant nhập xong trước nổ, tốc độ blade >1500 đơn vị/giây trong lượt bay, phân nhánh sét đủ thân/cành và đúng hai đầu, scheduler realm 9 riêng, mute/late entry.
- Đã xem storyboard 18 mốc, khung đầu sét/cự kiếm/nhập thể/nổ, bản nam và nữ. Đã dùng strip frame sát nhau để phát hiện vòng đều nhìn như đứng yên và sửa thành các tốp.
- Benchmark Canvas ngoại tuyến 540x960, 36 frame đại diện: median khoảng 2,55ms, p95 khoảng 5,67ms; không gồm encode PNG, KHÔNG phải FPS của LIVE Studio.
- Audio render bằng chính scheduler qua Web Audio ngoại tuyến: không NaN/Infinity, peak khoảng 0,232 ở master 0,8. Không dùng các số này để kết luận âm hay hoặc đủ lớn trên điện thoại.
- Local browser vẫn bị tắt trong Work settings, chưa xem/nghe trực tiếp trong LIVE Studio. Không tạo sự kiện giả trên LIVE thật. Module mới đã được server phục vụ HTTP 200, bridge LIVE vẫn connected; không restart server.

## Bản xem

Preview: http://127.0.0.1:4317/ascension-preview.html?realm=9&autoplay=1 (tải lại tab, bật âm).
Clip: output/huyen-tien-v2/huyen-tien-review.mp4, bản v2 chỉ dùng dữ liệu giả.
Backup v1: data/backups/huyen-tien-v2-20261104/.

Trạng thái: chờ nhận xét của chủ game, không tự đánh dấu đã được duyệt thẩm mỹ. Chưa chuyển sang Kim Tiên.
