# Vân Hải Tông — tối ưu VFX, SFX và camera

Mốc trước chỉnh sửa là `a5503e0` trên `main`. Máy dùng Ryzen 7 5800H và Radeon tích hợp. Số đo thụ động, tối ưu bộ dựng, kịch bản benchmark và kết quả trước/sau của StageDirector nằm trong [báo cáo hiệu năng](VAN-HAI-TONG-PERFORMANCE-REPORT.md).

## Đường phát hiện tại

TikFinity → Node.js → SSE → hàng trình diễn → Scene/Canvas 2D. Một vòng render chính dùng thời gian thực và ngân sách dựng. Âm procedural đi qua Web Audio. Nhạc nền phát bằng HTML Audio, VieNeu có nguồn phát riêng và lệnh ducking. Các luồng này còn được trộn bởi môi trường phát.

## P0 và các thay đổi đã kiểm chứng trong mã

- Một số cue cao cộng ba lớp tại mốc impact. Mức `1.8 × boostLevel × 1.35` nằm trên đường boost trước master, thêm vào hệ số `1.9` của cue gốc ở các cảnh có boost. Compressor cục bộ ratio 1:1 truyền tín hiệu gần như nguyên và không bảo vệ đỉnh. Đây là các vấn đề gain staging được xác nhận trong mã. Chưa có số đo cho tín hiệu đầu ra của TikTok.
- `audio.js` đặt headroom và xử lý đỉnh trên bus, tách vòng đời mỗi lần đột phá và fade khi cắt cảnh. `impact-audio.js` rút đuôi sub và tiếng xoảng. `ritual-boost-audio.js` giữ trống tụ lực và dư âm, bỏ bass boost trùng nhịp ở các cảnh đã có impact riêng. Các module cue bỏ tầng 1:1 dư và giữ bản phối gốc. Kim Đan và Nguyên Anh giờ truyền đúng tham số để chọn stem mix. Đạo Tổ đến Hồng Mông Chí Tôn có cue thưa theo mốc chung, với quãng đặc trưng từng cảnh.
- `cinematic-feedback.js`, `event-gift-fx.js`, `event-donations.js` và `scene.js` dùng mốc thời gian thật, tiêu thụ cue một lần, chặn tiếng impact bị trễ. Đua phi kiếm kích hoạt hai lượt vẽ của hàng quà đã có. Luận Kiếm có thêm phản hồi camera theo mốc chạm đòn. Ngân sách hiệu ứng giảm hạt phụ dưới tải. Quà vẫn hiện avatar người tặng. Rung ngắn được giới hạn và clamp vào khung; HUD giữ vị trí.
- `app.js`, `index.html` thêm mức rung, giảm chuyển động và giảm chớp sáng. Giảm chớp sáng hiện áp dụng các lớp đã nối gồm grade đột phá, chớp Thiên Đạo và bloom quà lớn. Các hiệu ứng riêng khác cần rà soát thêm.
- `presentation.js` và `app.js` chặn phát lại cùng ID đột phá khi sự kiện lớn gián đoạn màn đang chiếu. Lần đột phá thật kế tiếp dùng ID mới và vẫn được trình diễn.

## Kiểm kê sự kiện và phạm vi

| Nhóm | Đường đã rà soát | Trạng thái |
|---|---|---|
| Nhập môn, tu luyện, hái, điểm danh, bí pháp, rèn, trang bị, thành tựu | Scene, audio, Báo Hỷ, giọng đọc | Giữ cue ngắn, giảm âm phụ trong đột phá. Chưa thiết kế lại VFX từng lệnh. |
| 28 cảnh đột phá | Scene, live-cinema, module cue, timeline, late-ascension | Sửa mix và cleanup, thêm cue ở cảnh 14–21. Cần nghe A/B và đối chiếu ảnh trên Studio. |
| Thiên Đạo giáng lôi | Heaven Strike, Scene | Nối giới hạn camera và giảm chớp. Giữ đồ họa lôi hiện có. |
| Đấu boss, Ma Long, phong ấn, thắng boss | boss-arena, combat, battle-audio | Giữ bộ kỹ năng và cue theo pha. Quà trợ lực có âm và impact. Chưa sửa riêng từng boss. |
| Quà, combo và biến hình | gift-spectacle, gift-stage, high-gift, court-art, transform | Bảo vệ impact chính khi dồn quà, giảm lớp phụ và nối flash setting. |
| Đua phi kiếm và Luận Kiếm | sword-race, social-stage, duel-combat, event-gift-fx | Nối hàng quà đua, âm quà, impact và rung theo cường độ. |
| Ngũ Đường, tỷ thí Đường và Chính Ma | hall-war, hall-duel, sect-war, war-impact | Âm quà và impact theo nhịp. Giữ hiệu ứng chiến tuyến và hiệu ứng riêng hiện có. |
| Luyện đan, Mê Cung, Vân Hải Tháp | alchemy, maze, tower, event-donations | Có cue quà theo chủ đề. Chưa làm lại hiệu ứng lõi hoặc ambient riêng của từng sự kiện. |
| Linh Thú Cốc, nhận linh thú | pet-cove, pet-arrival-fx, spirit-pet-ui | Bảng chỉ dẫn nằm trên linh thú, hiệu ứng quà phía dưới, cue quà riêng. |
| Khách quý, skin, pháp bảo và cơ duyên | visitor-event, court-art, opportunity, event-artifacts | Cue trợ lực đã nối. Giữ hoạt ảnh và điều kiện nhận đồ đang có. |
| Kết duyên, đạo lữ, Đèn Hoa, hoa/mưa sao, đại điển, vinh danh | social-stage, bond links, lantern, flower, ceremony, honor | Nối âm quà theo sắc thái. Giữ hình hiện có. |
| Hội Gõ Đầu, trêu ghẹo, hồng bao, câu đố, Oẳn Tù Tì, Ba Túi Linh Lộc, Bắt Sao | bonk, tease, heart-hud, mini-event-ui | Giữ các nhịp và HUD hiện thời. Hội Gõ Đầu có tuyến âm quà của sự kiện. |
| Gia nhập Đường, chân truyền và thưởng tuần | sect-hall, hall-war, Báo Hỷ | Giữ thông báo, cơ chế tích lũy và trao thưởng hiện thời. |

## Preview và kiểm thử

Mở trang quản lý **Cài đặt → Xem thử hiệu ứng và âm thanh**, hoặc `/event-vfx-preview.html`. Chọn nhóm, sự kiện/cảnh giới, đoạn tụ lực/cao trào/dư âm, chất lượng, số người mẫu và mã phát lại. Có lựa chọn các lớp âm đột phá. Chỉ bấm Phát thử mới tạo scene. Mọi dữ liệu preview tạo tại trang, không gọi API quà hoặc kết nối TikFinity. Đỉnh hiển thị là đỉnh mẫu mà analyser ghi được, không phải true peak.

Smoke trình duyệt ở 540×960 mở preview, thấy 28 cảnh giới và phát thử Luyện Hư cùng Đua Phi Kiếm, không phát sinh lỗi JS ở hai lượt đó. 56 test mục tiêu của đợt tích hợp đã qua và test chống phát lại đột phá đã qua riêng. Các bài test đã kiểm cue lịch phát hữu hạn tại đầu cảnh và gần impact của cả 28 cảnh giới. Test này xác nhận lịch nguồn âm và đường gọi, chưa xác nhận chất âm khi nghe.

| Chỉ số | Trước | Sau |
|---|---|---|
| FPS, P95/P99, long frames, cache/chất lượng ảnh | Xem mẫu thụ động trong báo cáo hiệu năng | Chờ ma trận tải cùng điều kiện |
| Peak/RMS/near-clipping | Chờ render PCM | Chờ render PCM |
| Audio node hoạt động và tải trong Studio | Chưa đo | Chưa đo. Endpoint debug báo số cue, không phải số node Web Audio |
| True peak, BGM cùng VieNeu và codec TikTok | Chưa đo | Chưa đo |

Khi LIVE đã đóng, dùng `node scripts/benchmark-live-performance.mjs --cinematic` cho phép đo hình và `node scripts/benchmark-live-performance.mjs --audio` cho PCM trước/sau. Bản baseline của cảnh 14–21 dùng âm từ từng mốc vẽ, nên chưa có baseline PCM trực tiếp cho nhóm này. Các lệnh benchmark đã xác nhận tự dừng trong phiên LIVE. `npm test` đầy đủ và xác nhận bằng tai trong Studio còn chờ. Chưa có cơ sở chốt 30 FPS hoặc xác nhận hết rè trên luồng TikTok.

Phạm vi còn lại gồm benchmark trước/sau, đo mix phát thật, xem lại các nhóm chưa làm riêng và kiểm tra toàn bộ hệ thống giảm chớp. Không có kết quả đo để tuyên bố lớp nào đã được hoàn nguyên vì tăng frame time. Các mức hiện có giữ lựa chọn mặc định; chưa đưa thêm lớp VFX toàn màn hình cần benchmark. Source chưa push, chưa deploy và máy chủ LIVE chưa restart.

Kiểm tra bổ sung khi xử lý lỗi phát lại của Nam Nguyễn chạy 5 bài, 4 qua. Bài mô phỏng tu luyện xuyên toàn bộ cảnh giới thất bại ở giới hạn số lượt `ASCENSION_PRACTICE_STEPS`. Mã xử lý tiến trình và bài test này giống mốc `a5503e0`. Bài kiểm tra chống phát lại qua riêng và trong nhóm này. Server Windows đã trả mã JS chứa bản sửa qua HTTP. Nguồn Link đang chạy cần nạp lại trang để nhận module mới.


## Đợt tiếp theo — Chính Ma, luyện đan, mê cung và Vân Hải Tháp

- Chính Ma thay lớp phủ toàn màn hình khi quà chạm chiến tuyến bằng hai vòng khí va chạm cùng màu phe. Rung chỉ tác động vào lớp luồng khí và dùng mức rung đã chọn. Bản đồ, tên người và thanh trận giữ vị trí. Mức nhẹ giảm số tia phụ.
- Luyện đan giảm chớp khi giáng lôi, khóa lửa và nổ lò, giữ quầng nổ ngay ở lò. Chế độ giảm chớp cũng tắt nhấp nháy ở cảnh báo nguy hiểm.
- Mê cung dùng cùng giới hạn 40 sprite trong chính sách và lượt vẽ. Giữ đường truyền tốc biến, thêm vòng đáp ở cửa ra và tiếng mở cổng phát một lần. Tùy chọn giảm chuyển động chuyển người chơi đến ô mới ngay. Tái sử dụng dữ liệu skin tĩnh giữa các khung hình trên cùng snapshot.
- Vân Hải Tháp cập nhật đồng hồ và máu tại chỗ, tái sử dụng canvas chân dung khi bố cục đổi, và bỏ lượt đọc layout đồng bộ khi rung thủ vệ. Vượt tầng và vượt mốc có hai cue riêng, chống lặp theo phiên Tháp và số thứ tự kết quả.
- Giảm chớp đã nối thêm vào Luyện Khí, Thái Ất, Đại La, Tiên Đế, Ma Thần, Thiên Ma, Diệt Thế và bốn cảnh giới cuối. Giữ ánh sáng cục bộ và các lớp nhân vật ở những đoạn đã sửa.
- Preview có thêm bốn cảnh trên cùng công tắc giảm chuyển động và giảm chớp. Edge ở 540×960 chạy thử bốn cảnh với dữ liệu giả, không ghi lỗi JavaScript. Test mục tiêu qua 34/34, gồm kiểm thử cũ về quà tốc biến 100 coin và kiểm mới cho DOM Tháp, trần sprite mê cung, lớp chớp. Chưa có số đo FPS hay PCM trước/sau đợt này vì trạng thái LIVE vẫn mở.
