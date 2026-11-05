# Nguyên Anh v1 — Liên Thai Hóa Anh

Triển khai ngày 2026-11-03. Yêu cầu mới: tăng quy mô rõ rệt so với Kim Đan, kết hợp **ảnh có sẵn** với hiệu ứng tự dựng. Không tạo ảnh mới hoặc thay PNG gốc.

## Kịch bản 14,4 giây

| Mốc | Hình và âm |
|---|---|
| 0–1,2 s | Linh trì mở, bốn lớp gợn nước, sương xanh tím và bụi sáng; nền trầm và gió mỏng. |
| 1,2 / 2,2 / 3,2 s | Ba tầng sen mở, tổng 36 cánh hình học kết hợp ảnh liên hoa. Mỗi vòng có gió nở và tiếng ngọc riêng. |
| 3,35–5,8 s | 24 dòng linh khí từ các phía dẫn lên liên thai; cánh và hạt sáng vận chuyển trước/sau người. |
| 5,8–8,8 s | Ảnh nguyên thần xuất hiện rõ trên liên thai phía trên người, có hai dư ảnh mỏng, vòng linh quang và ba nhịp cộng hưởng. Lớp âm bội dùng các cặp dao động lệch nhẹ làm chất liệu riêng. |
| 8,8–10,4 s | Nguyên anh thu nhỏ, đi theo đường cong vào bản thể. Điểm tới của mọi luồng khí bám theo nguyên anh. Pháp tướng ảnh lớn và ba cột sáng bắt đầu hiện sau lưng. |
| 10,4–10,75 s | Cánh sen và linh khí nén vào tâm, âm rút rồi nhường khoảng trống trước đỉnh. |
| 10,75–12,9 s | Ảnh bùng lực tím mở rộng, năm sóng lực nối nhịp, vòng sóng từ ảnh cũ quét mặt nền, cung linh quang và kinh mạch sáng. Đổi áo/realm hiển thị tại 10,95 s. |
| 12,9–14,4 s | Giữ rõ nhân vật mới trên liên đài, pháp tướng và hạt sáng tan dần. Nhạc nền hồi mượt; trả về sân. |

Màn hình chỉ hiện tên người chơi và “Nguyên Anh”. Tên concept ở tài liệu, không hiện chữ theo pha.

## Ảnh sẵn có thực sự được dùng

Ba atlas gốc, bốn sprite, ghép trực tiếp trong renderer:

| Nguồn có sẵn | Ô (đếm từ 0) | Vai trò |
|---|---:|---|
| `public/assets/breakthrough-v2/mid.png` | 2 | Liên hoa dưới chân, liên thai nhỏ, nguyên anh và pháp tướng lớn. |
| `public/assets/breakthrough-v3/celestial-spectacle.png` | 5 | Vòng linh quang tím sau lưng. |
| Cùng atlas trên | 4 | Sóng lực quét mặt nền. |
| `public/assets/breakthrough-v2/bursts.png` | 2 | Bùng lực tím và mảnh sáng ở đỉnh. |

`public/nguyen-anh-art.js` tải/cắt các ô ở độ chi tiết nguồn, khoảng 512 px và 418 px. Tái dùng ảnh đã tải ở các bộ cũ làm fallback trong khi tải bản native. Vùng liên hoa được làm mềm mép trên bằng mask trong cache Canvas để tránh vết cắt thẳng; ảnh PNG gốc giữ nguyên.

## Quy mô và các phần mã

- Balanced: **36 cánh sen, 24 luồng khí, 144 hạt sáng, 16 cung lực, 5 sóng lực**, thêm các lớp ảnh. Mốc Kim Đan: 6 nguồn khí, 46 hạt, 3 sóng. Đây là số lượng phần tử theo thiết kế, không phải thước đo độ đẹp hoặc cảm giác lực.
- Light giữ 36 cánh, 12 luồng, 48 hạt, 8 cung và đủ 5 sóng. Giảm chuyển động bỏ rung, giữ tiến trình và giảm cường độ bùng. Không nhấp nháy toàn màn liên tục.
- `public/nguyen-anh-timeline.js`: mốc hình/âm chung; `nguyen-anh-awakening.js`: sampler và ghép ảnh/hiệu ứng; `nguyen-anh-art.js`: atlas; `nguyen-anh-audio.js`: soundtrack và duck.
- Cảnh giới 4 có nhánh renderer/audio riêng trong `live-cinema.js`, `scene.js`, `audio.js`, `app.js`, không chạy chồng các cue chung. Các cảnh 1–3 giữ renderer và soundtrack đã chốt.
- Duration 14,4 s, dài hơn Kim Đan 2,6 s. Các realm ≥5 dịch thêm 2,153 s so với lịch sau Kim Đan để bảo toàn thứ tự; Hóa Thần tạm 14,847 s. Các mục tiêu tương lai trong roadmap được điều chỉnh theo yêu cầu tăng quy mô mới.
- Cache hữu hạn cho bốn sprite, liên hoa ghép mềm, beam và thân nhân vật; không đọc pixel hoặc blur toàn màn mỗi frame. Đường khí và biến đổi lấy từ tiến trình chung, xem lại/seek ra cùng một trạng thái.

## Âm thanh và nguồn

ID `nguyen-anh-v1`, vai trò `realm-4-breakthrough`. SFX tổng hợp nguyên gốc bằng Web Audio, seed **184963**, impulse khoảng 1,6 s. Không thêm sample/dịch vụ bên ngoài.

Stem: `air`, `bloom`, `flow`, `spirit`, `resonance`, `entry`, `pressure`, `burst`, `waves`, `tail`. Lớp spirit là âm bội tổng hợp, không phải bản thu giọng người hoặc câu niệm chú. Một đỉnh lực chính; năm nhịp sóng là lớp phụ, không năm tiếng nổ lớn như nhau.

Một AudioContext clock đồng bộ mốc hình; cue lỡ được bỏ khi quay lại tab. Mute/ngắt dọn source/bus và phục hồi nhạc có xét giọng đọc đang phát. Nhạc duck mạnh ở cao trào rồi hồi từ 12,1 s; giữ nguyên master/SFX do người dùng đặt.

WAV xuất thực bằng OfflineAudioContext: `output/nguyen-anh-v1/nguyen-anh-ritual-sfx.wav`, stereo 48 kHz. Peak solo khoảng **0,921**, RMS khoảng **0,0960**, trước gain master/SFX; không clipping trong bản xuất. Game phát trực tiếp từ module, WAV là bản kiểm tra. Chưa đánh giá bằng tai hoặc xác nhận chất âm cùng BGM/giọng trên thiết bị LIVE; số đo không thay thế đánh giá nghe.

## Kiểm chứng và xem thử

- Toàn bộ **353/353** kiểm thử qua, kiểm cú pháp dự án qua. QA Kim Đan chạy lại sau khi ghép nhánh Nguyên Anh cũng qua, không có exception.
- `test/nguyen-anh.test.mjs`: tiến trình ba tầng sen, nguyên anh nhập thể liên tục, điểm tới 24 dòng khí ở các chiều cao, ngân sách Balanced/Light, bốn sprite nguồn thực sự được vẽ, tên/cảnh giới tối giản, thời điểm reveal, bất biến phần thưởng, audio clock/stem, bỏ cue trễ và cleanup/duck.
- `scripts/qa-nguyen-anh.mjs`: xác nhận cả bốn sprite native đã tải, ảnh từng pha, bật/mute, replay, đổi tab, Light/giảm chuyển động, phát trọn 14,4 s rồi tự trả sân; không có exception.
- Storyboard đã xem: `output/nguyen-anh-v1/storyboard.png` và `output/nguyen-anh-v1-female/storyboard.png`. Các ảnh ghép không còn mép cắt thẳng của vùng sen dưới.
- Báo cáo `output/nguyen-anh-v1/qa.json`. Chi phí draw đo ở Chrome headless không phải bảo đảm FPS/GPU trên mọi máy.
- Không gửi lệnh thay dữ liệu LIVE; không restart server hoặc tự reload nguồn LIVE.

Chạy lại: `node render-nguyen-anh.mjs`, thêm `--female` cho bản nữ; `node scripts/qa-nguyen-anh.mjs`; `npm test`; `npm run check`.

Xem: `http://127.0.0.1:4317/cinema-preview.html?realm=4` → bật âm → **Nguyên Anh mới ↻**. Tải lại trang/nguồn để nhận module mới.
