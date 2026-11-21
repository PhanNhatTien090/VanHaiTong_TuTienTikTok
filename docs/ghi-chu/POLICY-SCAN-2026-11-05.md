# Quét rủi ro chính sách TikTok LIVE · 05/11/2026

Chỉ rà soát, chưa sửa mã. Căn cứ: Community Guidelines › Integrity & Authenticity (nội dung "lừa/thao túng để tăng quà, follow, tim, lượt xem" không được lên trang Dành cho bạn), LIVE Monetization Guidelines (xin quà không chân thực, hứa quà đổi thưởng), định nghĩa cờ bạc (trả giá trị để có cơ hội thắng), quyền sở hữu trí tuệ. TikTok không công bố danh sách từ cấm; rủi ro chính nằm ở **cơ chế** và **lời mời gọi**, không ở từng chữ.

Mức: 🔴 cao · 🟠 trung bình · 🟢 thấp

## A. Sự kiện tỷ thí (Phong Vân Luận Kiếm) — `social-events.mjs`

| # | Mức | Vấn đề | Vị trí | Hướng sửa |
|---|---|---|---|---|
| T1 | 🔴 | Thắng thua quyết định bằng **tổng tu vi**: hơn 3% là thắng chắc. Quà cộng rất nhiều tu vi (9.999 coin → 140.000), nên thực tế ai tặng nhiều quà hơn sẽ vô địch, nhận danh hiệu Kiếm Khôi, Ngọc Ấn, huy chương và vinh danh trên sóng. Dễ bị xem là cuộc thi "trả tiền để thắng" / gợi quà | `beginRound` `duelPower`, `finishMatch` (quy tắc 3%) | Tính sức đấu theo cảnh giới + lượt chơi trong trận (gõ đánh), nén chênh lệch; không dùng tổng tu vi thô. Tách tu vi từ quà khỏi sức đấu |
| T2 | 🔴 | Màn hình và giọng đọc kêu "hai đấu thủ gõ danh để trợ lực", nhưng khi chênh từ 3% tu vi thì trợ lực **không đổi được kết quả** (gần như mọi trận). Mời bình luận cho một tác dụng không có thật = tương tác giả, gây hiểu nhầm | `finishMatch`, `public/social-ui.js` HUD, `speech-lines.mjs` "Gõ đánh để trợ lực" | Cho trợ lực ảnh hưởng thật và có giới hạn, hoặc bỏ lời mời |
| T3 | 🟠 | Quà gửi trong lúc đấu hiện chữ "· TRỢ UY" quanh đấu thủ, nhưng quà không cộng điểm trận (`event-gift-fx.mjs` ghi rõ chỉ là hiệu ứng). Người xem dễ hiểu là quà giúp thắng | `public/event-gift-fx.js` dòng nhãn `TRỢ UY` | Đổi nhãn thành "· CỔ VŨ" và ghi rõ không ảnh hưởng kết quả |
| T4 | 🟢 | Lịch cố định đua → đua → tỷ thí lặp đều; thanh máu giảm theo kịch bản thời gian | `engine.mjs` cycle | Giữ biến thể (`qiVariant`), không tự kích hoạt dày |
| ✅ | — | Không có ngẫu nhiên, phần thưởng chỉ dùng trong game, NPC bị loại khỏi tỷ thí | | Giữ nguyên |

## B. Toàn game

| # | Mức | Vấn đề | Vị trí chính | Hướng sửa |
|---|---|---|---|---|
| 1 | 🔴 | **`heartPlay` mặc định BẬT trên LIVE (từ 04/11)**: tim = vận công cộng tu vi, có mốc 50/150/300 tim nhận thưởng, top tim / hộ pháp tim, 50 tim +18 trượng đua, 100 tim nhận Ngọc Thố, tim giảm 5% máu boss. Lời đọc: "Thả tim để vận công", "Thả tim nhận thưởng mốc…". Đây đúng nhóm "thao túng để tăng tim", đi ngược đợt sửa 03/11 | `engine.mjs` ~344, `heart-events.mjs`, `speech-lines.mjs` 60–131, `public/heart-hud.js`, `public/simple-guide.js`, `sword-race.mjs`, `spirit-pets.mjs` | Đặt mặc định `heartPlay=false`; tim chỉ tạo hiệu ứng cổ vũ, không đổi thưởng; bỏ mọi câu "thả tim để/nhận…" |
| 1b | 🔴 | Mâu thuẫn trên sóng: `rules-summary.js` ghi "Tim, theo dõi, chia sẻ… không cộng tài nguyên", trong khi heartPlay đang cộng → thông tin sai (Deceptive) | `public/rules-summary.js:6` | Sửa cơ chế cho khớp lời |
| 2 | 🔴 | Quà đổi thưởng hoặc tiến độ, có đếm ngược: Tiên Đế cần tổng quà 100 coin; tiên nhân 3 phút "100 coin skin, 300 coin pháp bảo"; đua "top 3 tặng quà nhận skin vĩnh viễn"; Phúc duyên ×3/×5/×8 theo coin; pháp bảo +140 sát thương ở 9.999 coin; bảng "Đệ nhất cung phụng". Giọng đọc: "Tặng quà để nhận truyền thừa!", "tặng quà để lao vọt lên!" | `engine.mjs` 146/408, `sword-race.mjs` 8/40/51, `speech-lines.mjs` 147/148/167, `public/visitor-event.js`, `public/manual.js` 28, `public/live-guide.js`, `public/gift-rewards.js` | Bỏ khóa tiến độ bằng quà (Tiên Đế); quà chỉ cho hiệu ứng / vinh danh cảm ơn; không đọc lời mời tặng quà; bỏ đếm ngược gắn với coin |
| 3 | 🟠 | Hồng bao dùng `Math.random`, 6% "trúng" pháp bảo; lời "trúng", "chậm là hết!", "nhận lộc". Miễn phí nên chưa phải cờ bạc, nhưng là ngôn ngữ may rủi và tạo cảm giác gấp | `engagement.mjs` 13–23, `speech-lines.mjs` 81–83 | Thưởng cố định cho mọi người; "trúng" → "nhận"; bỏ "chậm là hết"; không bao giờ gắn quà vào hồng bao |
| 4 | 🟠 | Bản quyền: Doraemon, Hàn Lập, Vương Lâm, Lý Mộ Uyển, có bán skin bằng coin | `public/doraemon-*.js`, `public/visitor-event.js`, `public/patrons.js`, `public/manual.js` | Thay bằng nhân vật tự sáng tác nếu không có giấy phép |
| 5 | 🟢 | "máu boss", "MÁU ×10", câu đố "…không đập thì chết" | `public/heart-hud.js` 13, `public/abyss-boss.js` 60, `engagement.mjs` 32 | "máu" → "sinh lực"; đổi câu đố |
| ✅ | — | Không thấy từ miệt thị, hình thể, tiền/đầu tư/rút tiền, hay kéo sang nền tảng khác trên sóng. Lời cảm ơn theo dõi/chia sẻ không kèm thưởng là ổn | | |

## Ghi chú
- Đổi chữ sai chính tả (nói lái) không giảm rủi ro ở các mục 🔴, vì vấn đề nằm ở cơ chế đổi thưởng.
- Script quét: chuỗi tiếng Việt trong `*.js|*.mjs|*.html` (bỏ test, render, web), nhóm theo từ khóa. Có thể còn chuỗi ghép động chưa bắt được.
