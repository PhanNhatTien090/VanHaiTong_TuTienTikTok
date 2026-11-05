# Trúc Cơ v2 — Bát Trúc Định Cơ

Đã triển khai ngày 2026-11-03 theo `TRUC-CO-V2-PLAN.md`.

## Hành vi đang ghép trong game

- Renderer riêng cho cảnh giới 2: tám kiếm trúc ngọc dựng lần lượt, luồng khí chạy từ bên ngoài vào kiếm rồi xuống tâm đài; lá và sương có lớp trước/sau.
- Ngọc đài bát giác ba tầng có mặt, cạnh và khe sáng; ba tầng đóng lần lượt, nhân vật nâng theo mặt đài 66 đơn vị ở cảnh rộng 900.
- Timeline chung 10,8 s. Kiếm dựng từ 1,2 s; ba tầng từ 6,3 / 7,0 / 7,7 s; khai cơ 8,8 s; đổi áo ở 8,95 s; kiếm tan sau 9,35 s; cuối cảnh giữ rõ người và ngọc đài trước khi trả sân.
- Một cột linh quang mềm sau người, ánh sáng theo alpha thân và hai sóng áp lực tách nhịp. Giảm chuyển động bỏ rung, giảm sáng; Light giữ đủ tám kiếm và giảm các chi tiết phụ.
- Canvas/DOM chỉ xuất tên người chơi và “Trúc Cơ”; không chạy lớp tiêu đề/pháp tướng chung của các cảnh giới khác.
- Soundtrack riêng: gõ trúc theo tám kiếm, khí xuyên trúc, ba nhịp khóa tầng, nén, cú trầm khai cơ và dư âm ngọc/lá. Một AudioContext clock theo cùng mốc hình. Các cue chung và tiếng mở đầu chung không phát chồng vào Trúc Cơ.
- Nhạc nền duck mượt theo tiến trình và hồi dần ở cuối. Khi giọng đọc vẫn phát, kết thúc cảnh không trả sai âm lượng nhạc. Mute/đổi tab/ngắt cảnh dọn nguồn và bus; bỏ các transient đã lỡ khi tiếp tục tab.
- Luyện Khí giữ renderer và soundtrack đã chốt. Duration Trúc Cơ tăng từ 9,047 s lên 10,8 s; các cảnh giới sau dịch thêm 1,753 s để giữ thứ tự tăng dần. Đây là lịch tạm trước khi nâng cấp từng cảnh giới sau theo roadmap.

## Các phần mã

- `public/truc-co-timeline.js`: mốc thời gian dùng chung.
- `public/truc-co-awakening.js`: sampler, kiếm, đài, khí, lá, bùng và HUD tối giản.
- `public/truc-co-audio.js`: các stem và vòng đời soundtrack, duck nhạc.
- `public/live-cinema.js`, `public/scene.js`, `public/audio.js`, `public/app.js`: rẽ nhánh renderer/audio và bỏ cue chung bị chồng.
- `public/ascension-art.js`: nguồn duration cho effect, focus, presentation và preview.
- `public/cinema-preview.*`: nút “Trúc Cơ mới ↻”, dữ liệu giả trên trang.
- `render-truc-co.mjs`: storyboard nam; thêm `--female` để xuất bản nữ. Script render sân khấu cũ cũng đọc duration hiện tại.
- `scripts/qa-truc-co.mjs`: kiểm Chrome và xuất bản nghe thử; `test/truc-co.test.mjs` kiểm các bất biến timeline/vòng đời.

## Nguồn và âm thanh

ID `truc-co-v2`, vai trò `realm-2-breakthrough`, tổng hợp nguyên gốc bằng Web Audio, noise seed **29411**, không sample hoặc dịch vụ ngoài. Mã nguồn âm là `public/truc-co-audio.js`; game phát trực tiếp từ module, không đọc WAV xem thử.

Các stem có thể xuất qua tham số cuối của `scheduleTrucCoAudio`: `air`, `swords`, `tiers`, `pressure`, `burst`, `tail`; mặc định `mix`.

Bản mix solo xuất thật bằng OfflineAudioContext, 48 kHz stereo: `output/truc-co-v2/truc-co-ritual-sfx.wav`. Peak khoảng **0,892**, RMS khoảng **0,0921**, trước gain master/SFX game; không clipping ở bản solo. Mốc so sánh Luyện Khí v3: peak 0,920 / RMS 0,0989. Số đo không thay đánh giá chất âm/độ lớn cảm nhận; chưa nghe đánh giá bằng tai hoặc xác nhận bản phối với giọng/BGM trên thiết bị LIVE.

## Kiểm chứng

- Toàn bộ **342/342** kiểm thử qua, kiểm cú pháp dự án qua. Các kiểm thử thời lượng cũ được cập nhật theo thời lượng mới đã được yêu cầu, vẫn bảo đảm thứ tự và ngân sách hiệu ứng tăng theo cảnh giới.
- Chrome preview: dựng từng pha, chữ tối giản, phát lại, mute, duck chồng giọng, visibility gián đoạn/tiếp tục, Light/giảm chuyển động và một lần phát thực trọn 10,8 s rồi tự trả sân; không có exception.
- Đã chạy lại QA Luyện Khí sau khi ghép audio dùng chung: chữ, âm, replay, mute và visibility đều qua.
- Storyboard nam: `output/truc-co-v2/storyboard.png`; nữ: `output/truc-co-v2-female/storyboard.png`. Đã xem ảnh và kiểm vị trí kiếm/đài so với nhân vật.
- Ảnh trình duyệt và báo cáo tại `output/truc-co-v2/qa.json`. Số đo thời gian draw trong báo cáo là chi phí lệnh Canvas trên Chrome headless của máy này, không phải bảo đảm FPS của nguồn LIVE hoặc thời gian GPU hoàn tất.
- Không gửi lệnh thay dữ liệu LIVE, không restart server hay tự reload nguồn LIVE. Tải lại trang/nguồn khi muốn nhận module mới.

Xem thử: `http://127.0.0.1:4317/cinema-preview.html?realm=2`; bật âm rồi bấm **Trúc Cơ mới ↻**.
