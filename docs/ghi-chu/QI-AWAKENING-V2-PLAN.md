# Luyện Khí v2 — hút khí, nhập thể, bùng sáng

Bản đang áp dụng mới nhất: v3, xem `QI-AWAKENING-V3-NOTES.md` (pháp trận và tăng âm theo phản hồi).

Trạng thái: đã triển khai Canvas và Web Audio, kiểm thử ngày 2026-11-03. Cần tải lại trang để trình duyệt nhận module mới.

## Yêu cầu đã chốt

- Làm cảnh đột phá đầu tiên, toRealm=1 (Phàm nhân → Luyện Khí).
- Giữ linh châu bay, phân ba và vận chuyển quanh người hiện có.
- Thêm nguồn năng lượng bên ngoài cuộn trào, bị hút vào cơ thể; nén rồi bùng sáng từ bên trong.
- Thêm âm thanh hút khí, nén lực và đột phá, khớp chuyển động.
- Bỏ toàn bộ chữ mô tả từng pha và chữ chạy. Chỉ có tên người chơi và tên cảnh giới; không thêm khẩu hiệu, phần thưởng hoặc câu giải thích.

## Kịch bản đề xuất — giữ tổng thời lượng 8,8 giây

| Thời điểm | Hình ảnh | Âm thanh |
|---|---|---|
| 0–1,94s | Giữ tạo linh châu. Bụi sáng ở xa khẽ nghiêng về người. | Âm ngân trầm nhẹ, tiếng tụ khí nhỏ. |
| 1,94–4,14s | Giữ nâng châu, phân ba. Xuất hiện 3–4 dải khí xanh ngọc/trắng từ hai bên và dưới chân. | Gió mở dần; ba tiếng tách mềm đi theo ba phần châu. |
| 4,14–6,34s | Châu tiếp tục chu thiên. Dải khí dày hơn, xoắn theo đường cong quanh thân rồi hút vào đan điền; có lớp trước/sau người. | Tiếng xoáy tăng nhịp và độ đầy; hướng chuyển động nghe vừa đủ. |
| 6,34–7,50s | Giữ hợp châu và đường nhập thể. Luồng khí tăng tốc theo sau, điểm vào sáng dần; ánh sáng chạy từ bụng lên ngực/vai. | Tiếng hút thu vào tâm, âm lực tăng cao dần. |
| 7,50–7,74s | Dải khí cuối co rút. Một nhịp nén ngắn: tâm sáng nhỏ, nền tối hơn, nhân vật giữ lực. | Hạ tiếng gió khoảng 120–180ms; giữ một tiếng ù nén nhỏ. |
| 7,74–8,15s | Bùng trắng xanh từ đan điền phủ thân, viền người phát sáng; một sóng khí lan ra, camera giật nhẹ nếu bật chuyển động. Đổi áo đúng đỉnh bùng. | Một cú bùng có thân trầm, lớp gió vỡ ngắn, âm sáng xác nhận. |
| 8,15–8,80s | Ánh sáng rút xuống, nhân vật mới hiện rõ, khí dư tan. Hiện chữ “LUYỆN KHÍ” dưới tên rồi trả về sân. | Đuôi vang ngắn, một tiếng chuông tròn; nhạc nền hồi về nhẹ. |

Tên giữ cố định ở vị trí hiện có; cảnh giới xuất hiện một lần tại nhịp thành công. Không đổi nhãn theo pha. Có thể kéo đuôi âm thanh qua lúc về sân nếu không gây chồng tiếng.

## Thiết kế hình ảnh

- Năng lượng là dải khí mềm có lõi sáng, sương ngoài và hạt kéo đuôi. Đường đi luôn hướng tới cơ thể; tránh cảm giác các chấm sáng chỉ quay trang trí.
- Bắt đầu từ xa, vòng rộng rồi thu hẹp khi tới thân; tăng tốc về cuối, tan tại điểm nhập thể.
- Vẽ khí sau lưng → nhân vật → khí trước người → ánh sáng nhập thể/bùng. Giữ nhận diện khuôn mặt và dáng người.
- Có mặt nạ thân hoặc lớp sprite để ánh sáng chạy trong cơ thể, không chỉ là một quầng sáng tròn che nhân vật.
- Dùng một cú bùng ngắn với độ sáng tăng rồi giảm mượt; giảm chuyển động sẽ bỏ rung và giảm cường độ bùng.
- Dùng sampler theo tiến trình chung và dữ liệu quỹ đạo cố định. Cache dải khí/glow; bản Light giảm số dải và hạt, vẫn giữ đủ nhịp hút–nén–bùng.

## Thiết kế và ghép âm thanh

Phương án đầu: tổng hợp bằng Web Audio sẵn có, chia thành các lớp có vai trò. Nếu bản nghe còn mỏng, bổ sung chất liệu thu âm sau khi đối chiếu; không coi synth phát được là đã đạt chất âm.

1. Hút khí: noise lọc mềm, tự động hóa tần số lọc và gain theo pha; thêm âm ngân thấp làm thân. Không để hiss cao liên tục.
2. Nén lực: lớp âm tăng dần, thu hẹp không gian rồi hụt hơi ngay trước đỉnh để tạo tương phản.
3. Bùng: phối tiếng lực trầm + gió vỡ ngắn + chi tiết sáng. Có lớp trung trầm để loa điện thoại vẫn cảm được lực, không chỉ dựa vào sub-bass.
4. Kết: vang ngắn, tiếng chuông tròn và khí dư nhỏ; giữ khoảng trống cho tên/cảnh giới được nhận ra.

Kỹ thuật dự kiến:

- Lập lịch các cue theo AudioContext.currentTime và cùng mốc bắt đầu với cảnh. Hủy nguồn đã lên lịch khi dừng/đổi sự kiện; không phát dồn cue bị lỡ sau khi tab bị ẩn.
- Envelope gain có attack/release để tránh click. Tự động hóa filter và cao độ cho hướng hút/nén; stereo nhẹ, kiểm cả mono.
- Dùng ConvolverNode với impulse response ngắn được tạo/cache cho đuôi vang; tách wet/dry để cú bùng giữ rõ phần đầu.
- Compressor hiện có hỗ trợ quản lý đỉnh, nhưng vẫn chỉnh gain từng lớp và đo bản phối; không xem compressor là bảo đảm không clipping.
- Nhạc nền hiện phát bằng HTML Audio riêng, khác ambBus. Duck trực tiếp đường nhạc thực hoặc qua hàm quản lý chung; xử lý chồng với duck của giọng đọc để không trả âm lượng sai. Khôi phục cả khi cảnh bị ngắt.
- Đặt ưu tiên cho cue đột phá, kiểm giới hạn voices hiện có để tiếng bùng không bị loại khi nhiều tương tác. Mỗi cue chỉ kích hoạt một lần.
- Cho nghe A/B hai mức lực ở âm lượng tương đương, kèm bản phối với BGM và giọng đọc. Chỉ chốt chất âm sau khi nghe.

## Các phần mã cần sửa khi triển khai

- public/qi-awakening.js: sampler dải khí/nhập thể/nén/bùng; lớp vẽ; chỉ xuất UI tên và cảnh giới.
- public/live-cinema.js: kiểm HUD chung và phần nhận onRitualFrame, bỏ label/detail cho Luyện Khí; xác minh không còn chữ chạy từ HUD dùng chung. Các cảnh giới khác để đợt sau.
- public/scene.js: mốc âm thanh, đồng bộ vòng đời cảnh, rung nhẹ và giảm chuyển động.
- public/audio.js: các cue mới, quản lý nguồn/duck và hồi âm. public/app.js và public/cinema-preview.js chỉ chỉnh khi cần ghép vòng đời.
- Trang cinema-preview.html?realm=1&autoplay=1: dùng xem thử, không thao tác dữ liệu LIVE.

## Thứ tự thực hiện và nghiệm thu

1. Bỏ chữ mô tả; dựng quỹ đạo hút khí và mặt nạ nhập thể trước.
2. Thêm nén và bùng, kiểm điểm hút bám đúng cơ thể ở các chiều cao khung hình.
3. Làm cue âm thanh, ghép theo cùng timeline, thêm xử lý duck và ngắt cảnh.
4. Kiểm thử sampler tại ranh giới, trigger một lần, dọn nguồn, không đổi phần thưởng/gameplay; chạy kiểm tra liên quan và kiểm cú pháp.
5. Render storyboard đoạn cuối, xem preview chuyển động và nghe bản phối; kiểm Balanced/Light, chế độ giảm chuyển động, âm thanh tắt, chuyển tab và hai đột phá nối tiếp.
6. Tiêu chí đạt: khí có nguồn và đi vào thân rõ; nhịp nén/bùng phân biệt; đỉnh âm trùng đỉnh sáng; chỉ còn tên+cảnh giới; nhân vật mới hiện rõ sau bùng; không nhân đôi âm hoặc thay dữ liệu LIVE.

## Nguồn nghiên cứu âm thanh

Đã đọc tài liệu ngày 2026-11-03. Kịch bản âm thanh phía trên là đề xuất thiết kế cho game, không phải kết luận chất lượng nghe từ tài liệu.

- MDN, Advanced techniques: Creating and sequencing audio — envelope, noise và lịch phát: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
- MDN, DynamicsCompressorNode — giảm dải động và xử lý đỉnh khi nhiều lớp âm cộng lại: https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode
- MDN, ConvolverNode — tạo reverb qua impulse response trong AudioBuffer: https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode

## Kết quả triển khai và kiểm chứng

- Đã ghép `qi-energy.js`, `qi-audio.js` vào cảnh Luyện Khí và đường âm thanh hiện có; giữ tổng thời lượng 8,8 giây và đường bay linh châu.
- Canvas và DOM HUD chỉ hiện tên; “Luyện Khí” hiện ở nhịp thành công. Không hiện chữ mô tả pha.
- Các nguồn âm dùng chung AudioContext clock; dọn bus/reverb khi hết hoặc ngắt cảnh, không phát lại cú bùng đã lỡ khi quay lại tab.
- Duck nhạc nền dùng mức nhỏ nhất giữa giọng đọc và nghi thức; kết thúc nghi thức vẫn giữ duck của giọng đọc.
- `npm test`: 337/337 qua. Kiểm cú pháp dự án và ba module Luyện Khí qua.
- Kiểm Chrome headless trên cinema-preview bằng dữ liệu giả: ảnh các pha, phát lại liên tiếp, bật/tắt âm, duck chồng giọng, gián đoạn/tiếp tục khi visibility thay đổi, Light và giảm chuyển động. Không có exception trình duyệt.
- Storyboard và ảnh trình duyệt: `output/qi-awakening-v2/`. Cue thực xuất bằng OfflineAudioContext: `qi-ritual-sfx.wav`; peak 0,296 trước bus game, không clipping trong bản xuất solo. Số đo không đánh giá chất âm; chưa nghe đánh giá bằng tai hoặc chốt A/B trong bản phối BGM/giọng.
- Nguồn âm: tổng hợp nguyên gốc bằng Web Audio trong `public/qi-audio.js`, noise seed 8237, không dùng sample/dịch vụ bên ngoài. WAV là bản nghe thử; game phát trực tiếp từ module.
- Không restart server, không reload nguồn LIVE và không gửi lệnh thay đổi dữ liệu LIVE. Server đang phục vụ module mới; người dùng tải lại nguồn vào thời điểm phù hợp.
