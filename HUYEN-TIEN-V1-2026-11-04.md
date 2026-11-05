# Huyền Tiên · Huyền Tinh Chuyển Mệnh · 04/11/2026

Phạm vi: chỉ xây nghi thức riêng cho realm 9. Các realm khác chưa được làm lại hình/âm trong lượt này. Các file public được server phục vụ lại theo mtime; không restart, không kích hoạt đột phá giả trên LIVE.

## Chuỗi mới 36 giây

0–3s: người trong skin cũ giữa biển mây; thế giới tiên xa còn thấy rồi chìm dần vào đêm.
3–7s: mây thiên hà mở một lớp không gian cao phía sau.
7–12s: bảy mảnh thiên thạch hội tụ/rèn tinh kiếm, các nhịp va làm bụi sao tung ra.
12–17s: tinh kiếm lớn hiện như pháp ảnh; các kiếm nhỏ khai ba tinh lộ khác nhau.
17–23s: đường sao dẫn bảy kiếm quay về quỹ đạo quanh người.
23–27s: kiếm nhập thể lần lượt, nhỏ lại theo chiều sâu, điểm tiếp xúc phát sáng; không đổi skin.
27–28,2s: năng lượng co thành lõi, có đoạn hút xuống trước tiếng nổ.
28,2s: cú nổ lam bạc, tia/vụn lực và sóng xung kích đẩy mây.
28,65s: lần đầu dùng visualTo; hiện skin mới và danh hiệu.
33–36s: bụi sao lắng, thế giới tiên hiện nhẹ trở lại, trả cảnh LIVE.

Model/skin nhân vật dùng renderer gốc. Bản dựng thử tư thế đứng có lỗi dải áo nên đã bỏ, dùng dáng thiền với nhún/độ nghiêng nhẹ. Không thay nhân vật bằng ảnh mới. Các trường ngoại hình trước/sau được clone giữ trong WeakMap của sự kiện để snapshot LIVE đến sau không đổi nhân vật giữa nghi thức. Không đổi skinChoice hoặc vật phẩm trong engine.

## File

- public/huyen-tien-timeline.js: mốc tuyệt đối, trạng thái, đường đi bảy kiếm.
- public/huyen-tien-awakening.js: renderer riêng, dùng qi-impact, cinema-atmosphere, prestige swords và nền thế giới tiên có sẵn.
- public/huyen-tien-audio.js: score 36s riêng, cue cùng mốc kiếm và cú nổ; biến thể pitch theo qiVariant. Âm tổng hợp giả tưởng, không thu âm tiếng kiếm/rồng thật.
- live-cinema.js chọn realm 9, scene.js cấp clock audio chuyên biệt thay one-shot chung, audio.js nối scheduler và duck nhạc.
- ascension-score.js thêm cờ transient tùy chọn ở vị trí 8; cue đánh dấu nếu đã lỡ mốc sẽ không phát lại. Hành vi score cũ không đổi.
- ascension-art.js: realm 9 = 36s; các realm 10–18 tạm giữ nhánh hình/âm cũ và được dịch duration cùng 4,153s để không có bậc cao hơn ngắn hơn Huyền Tiên. Đây chỉ là tương thích thứ tự duration, KHÔNG phải hoàn thành nâng cấp các bậc đó; khi đến từng bậc sẽ thay bằng kịch bản riêng.
- style.css: chữ Huyền Tiên/danh hiệu hiện sau reveal, tuân thủ reduced motion.

## Kiểm tra và giới hạn

- 414/414 bài kiểm thử qua, npm run check và kiểm tra cú pháp file mới qua.
- Tests mới: đường đi liên tục tại các mốc, mọi kiếm nhập xong trước impact/reveal, giữ skin cũ kể cả skin sự kiện, nam/nữ, không lộ skin từ snapshot tới sau, restore trạng thái scene/canvas, score realm 9 riêng, không tạo lại audio mỗi frame, dừng khi mute và bỏ transient muộn.
- Đã xem storyboard/ảnh mốc 14s, 25,4s, 28,32s, 32s, cả nam/nữ; đã sửa dải áo và lõi sáng quá gần mặt ở bản dựng đầu.
- Clip motion-silent.mp4: 864 frame, 540x960, 24fps, 36s, dựng từ renderer thật. motion-contact.png lấy các khung theo thời gian từ clip. huyen-tien-review.mp4 ghép track audio thực thi cùng scheduler qua Web Audio ngoại tuyến; ffprobe xác nhận đủ video+audio và 36s.
- QA âm: output/huyen-tien-v1/audio-qa.json, không NaN/Infinity, peak≈0,186 và RMS≈0,009 tại master 0,8 trong offline emulator. Các số này không xác nhận nghe hay; compressor/mix trong browser có thể khác. Chưa nghe trực tiếp và chưa xác nhận FPS trên LIVE Studio vì local browser đang bị tắt trong Work settings.
- Tool âm ngoại tuyến cài riêng trong output/huyen-tien-v1/audio-tools/, không thêm dependency sản phẩm. Tài liệu: https://github.com/mohayonao/web-audio-engine . Renderer chỉ dùng để kiểm tra; không vận hành thay audio game.
- Nguồn art có sẵn: prestige-swords-v1.png, chan-tien-cinema-v2/immortal-world.png; không sao chép asset của ảnh game tham khảo.
- LIVE bridge vẫn connected sau kiểm tra HTTP; các module mới trả 200. Chưa tự reload nguồn của người dùng.

## Xem thử

http://127.0.0.1:4317/ascension-preview.html?realm=9&autoplay=1 — bật âm thanh bằng nút trên preview.
output/huyen-tien-v1/huyen-tien-review.mp4 — clip có âm thanh, chỉ dữ liệu giả.

Sao lưu: data/backups/huyen-tien-v1-20261104/.
