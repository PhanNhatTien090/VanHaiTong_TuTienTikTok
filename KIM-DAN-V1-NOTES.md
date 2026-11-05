# Kim Đan v1 — Đan Dương Sơ Hiện

Triển khai ngày 2026-11-03, theo yêu cầu tiếp tục cảnh giới sau Trúc Cơ với diễn biến, quy mô và thời lượng tăng dần. Tên concept chỉ dùng trong tài liệu; UI giữ tên người chơi và “Kim Đan”.

## Kịch bản đã ghép

Tổng **11,8 giây**, dài hơn Trúc Cơ 1 giây.

| Mốc | Diễn biến |
|---|---|
| 0–1,4 s | Đan hải trầm hiện dưới chân: mặt giếng phản sáng, sáu rãnh dẫn, sóng nhỏ và linh khí xanh ngọc. |
| 1,4–3,8 s | Sáu dòng khí từ nền dâng lên, chuyển dần từ xanh sang kim dịch vàng; dải có bề rộng thuôn và các giọt kéo đuôi. |
| 3,8–6,15 s | Chín giọt kim dịch xoắn về một tâm phía trên người. Lõi vàng kết thành, bề mặt chuyển từ dao động sang khối tròn có bóng và phản quang. Các giọt nhập tâm tại 5,05 + i×0,1 s. |
| 6,15 / 6,85 / 7,55 s | Ba lớp đan văn lần lượt khóa quanh lõi; mỗi lớp có một tiếng kim/ngọc cộng hưởng, khóa âm ở mốc bắt đầu +0,4 s. |
| 8,2–9,05 s | Kim đan thu nhỏ và đi vào đan điền. Chuyển lớp vẽ khi qua mặt để giữ nhận diện khuôn mặt; thân bắt đầu ánh vàng. |
| 9,05–9,4 s | Nén lực, khí rút và âm lắng một nhịp ngắn. |
| 9,4–10,4 s | Đan dương khai mở: nhật miện rực sau lưng, đường lửa không đều, ba sóng áp lực và tia vàng. Đổi áo ở **9,55 s**. |
| 10,4–11,8 s | Trang phục mới hiện rõ trước nhật miện; đan hải gợn sóng, hạt vàng và dư âm tan dần, trả về sân. |

Hình tượng riêng của Kim Đan là khí hóa kim dịch → kết khối → khóa đan văn → nhập thể → mở mặt trời nhỏ. Không dùng lại tám kiếm hoặc ba tầng ngọc đài của Trúc Cơ.

## Vẽ và âm thanh

- `public/kim-dan-timeline.js` chứa thời lượng và các mốc chung cho hình/âm.
- `public/kim-dan-awakening.js`: sampler xác định theo tiến trình; đan hải, dòng kim dịch, chín giọt, vật liệu lõi vàng, đan văn, alpha thân, nhật miện và sóng áp lực.
- Cache hữu hạn cho mặt giếng, vật liệu cầu vàng, nhật miện và thân nhân vật. Không đọc pixel hoặc blur toàn màn mỗi frame. Light vẫn giữ sáu nguồn khí, chín giọt và ba lớp đan văn; giảm sợi phụ, hạt và vòng lửa. Giảm chuyển động bỏ rung, giảm bùng, giữ quá trình biến đổi.
- `public/kim-dan-audio.js`: soundtrack nguyên gốc bằng Web Audio, noise seed **73519**, impulse khoảng 1,25 s; không dùng sample hoặc dịch vụ bên ngoài.
- Stem `air`, `liquid`, `condense`, `seals`, `pressure`, `burst`, `corona`, `tail`. Vai trò âm: giọt cộng hưởng và chất lỏng, kim loại ấm, nén lực, thân trầm, nhật miện thở và dư âm. Có thể xuất từng stem bằng tham số cuối của `scheduleKimDanAudio`.
- Cue dùng một AudioContext clock; bỏ transient đã lỡ khi quay lại tab, dọn nguồn/bus khi mute hoặc ngắt. Cue riêng bỏ qua giới hạn voice nhỏ của âm tương tác, có compressor riêng trước bus chung.
- `public/audio.js`, `scene.js`, `live-cinema.js`, `app.js` chọn nhánh realm 3 và tránh phát chồng các tiếng gather/surge/impact/reveal cùng tiếng mở đầu chung. Nhạc duck theo phong bì riêng, hồi dần từ 10,15 s; vẫn giữ duck giọng đọc nếu còn đang nói.
- Giữ nguyên renderer và soundtrack Luyện Khí/Trúc Cơ. Kim Đan từ 11,247 s lên 11,8 s; các realm ≥4 thêm 0,553 s so với lịch sau Trúc Cơ, bảo toàn khoảng cách và thứ tự. Nguyên Anh tạm 12,247 s, sẽ được thiết kế riêng theo roadmap.

## Bằng chứng kiểm chứng

- Toàn bộ **347/347** kiểm thử qua; kiểm cú pháp dự án qua. Chạy lại QA trình duyệt Luyện Khí và Trúc Cơ sau khi ghép nhánh Kim Đan: đều qua, không có exception.
- Test mới `test/kim-dan.test.mjs`: chín giọt và ba khóa, đường nhập thể liên tục, thời điểm đổi áo, duy nhất tên/cảnh giới, bất biến dữ liệu, duration/presentation, audio clock, stem, bỏ cue trễ, dọn nguồn và duck chồng giọng.
- `scripts/qa-kim-dan.mjs`: Chrome preview bằng dữ liệu giả; ảnh các pha, bật/mute, replay, đổi tab, Light/giảm chuyển động, phát trọn 11,8 s và tự trả sân, xuất waveform thật bằng OfflineAudioContext.
- `render-kim-dan.mjs` xuất storyboard; thêm `--female` để kiểm bản nữ. Đã xem các pha nam/nữ, vị trí kim đan và nhật miện so với mặt/trang phục.
- Ảnh và báo cáo: `output/kim-dan-v1/`; bản nữ: `output/kim-dan-v1-female/storyboard.png`.
- Cue nghe thử: `output/kim-dan-v1/kim-dan-ritual-sfx.wav`, 48 kHz stereo. Peak solo khoảng **0,863**, RMS khoảng **0,0952**, trước gain master/SFX; không clipping trong bản xuất. Game phát trực tiếp từ module, WAV là bản kiểm tra.
- Chưa đánh giá chất âm bằng tai hoặc xác nhận cảm giác nghe cùng BGM/giọng trên thiết bị LIVE. Peak/RMS không thay đánh giá nghe. Số đo draw trong `qa.json` là chi phí phát lệnh Canvas trên Chrome headless, không phải bảo đảm FPS trên mọi máy.
- Không đổi dữ liệu LIVE, không restart server hoặc tự tải lại nguồn LIVE.

## Lệnh và xem thử

`node render-kim-dan.mjs`, `node render-kim-dan.mjs --female`, `node scripts/qa-kim-dan.mjs`, `npm test`, `npm run check`.

`http://127.0.0.1:4317/cinema-preview.html?realm=3` → bật âm → **Kim Đan mới ↻**. Tải lại nguồn/trang để nhận module mới.
