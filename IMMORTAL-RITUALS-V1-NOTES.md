# Đại Thừa và Chân Tiên — 04/11/2026

## Đại Thừa · Vạn Kiếm Quy Tông · 22,8 giây

0–2 s: tĩnh khí và ba tầng đài sáng. 2–5,5 s: ba cụm phi kiếm thức tỉnh theo nhịp lệch. 5,5–8,8 s: 72 kiếm chạy ba quỹ đạo (Light 24), có lớp trước/sau. 8,8–11,8 s: kiếm môn được khắc dần. 11,8–15 s: đại kiếm giáng xuống giữa trận. 15–17,8 s: kiếm trận và đại kiếm cùng thu về đan điền; dùng đường bay liên tục. 17,8–19 s: nén kiếm ý. 19 s: một đỉnh lực và chín sóng truyền nối; đổi skin tại 19,3 s. Giữ hình mới đến 22,8 s.

Tái sử dụng `public/assets/events-v1/prestige-swords-v1.png`, cắt ba ô native 512×1024, dùng screen để nền tối hòa với cảnh. Không tạo PNG mới.

## Chân Tiên · Long Môn Đăng Tiên · 25,6 giây

0–3 s: biển mây tụ. 3–7 s: hai trụ ngọc và mái Thiên Môn hiện dần, có ngọc ấn và vân mây. 7–11 s: long ảnh bay theo đường cong, chia lớp trước/sau. 11–15,2 s: chín bậc tiên lộ sáng lần lượt, nhân vật nâng 125 đơn vị. 15,2–18,2 s: long ảnh thu lại, long châu xuất hiện cùng điểm hội tụ. 18,2–21,2 s: long châu nhập vào đan điền của nhân vật đã nâng. 21,3 s: đỉnh lực, mười sóng truyền và hai dải tiên quang; đổi skin tại 21,6 s. Giữ hình mới đến 25,6 s.

Tái sử dụng atlas rồng tách đầu/thân/đuôi ở `gift-beasts-v1/dragon.png`. Cửa, bậc, mây, long châu và luồng khí dựng bằng Canvas. Không sao chép màn Luyện Hư.

## Tích hợp

- Realm 7 và 8 dùng renderer và soundtrack riêng; tránh cue chung phát chồng. Các realm 1–6 giữ nhánh hiện có.
- Thời lượng các cảnh giới sau được dịch cùng khoảng để tiếp tục tăng dần.
- Shared `ascension-primitives.js` tái dùng cache thân nhân vật, HUD, ánh sáng; `ascension-score.js` tổng hợp SFX nguyên gốc bằng Web Audio: khí chuyển động, ngọc/kiếm, bước tiên lộ, nén lực và cú bùng. Các âm bội tổng hợp không phải thu giọng người.
- Mute/ngắt dọn graph và sources; nhạc nền duck theo mốc của từng màn. Chưa đánh giá âm bằng tai trên thiết bị LIVE, chưa đo FPS thực trong LIVE Studio.
- Light giảm kiếm/hạt/đoạn rồng, vẫn giữ mọi bước chính. Giảm chuyển động bỏ rung và giảm cú bùng. Cache hai hình cũ/mới cho một sự kiện, không tích lũy lịch sử frame.
- Không thay tài nguyên, điều kiện đột phá hoặc hồ sơ LIVE; không restart backend.

## Xem và kiểm tra

- http://127.0.0.1:4317/cinema-preview.html?realm=7&autoplay=1
- http://127.0.0.1:4317/cinema-preview.html?realm=8&autoplay=1
- `node render-dai-thua.mjs`, `node render-chan-tien.mjs`, thêm `--female` để xuất bản nữ. Storyboard ở `output/dai-thua-v1/` và `output/chan-tien-v1/`.
- `node scripts/qa-dai-thua.mjs`, `node scripts/qa-chan-tien.mjs`: Chrome preview dữ liệu giả, xác nhận ảnh tải, audio bắt đầu, duration, chạy trọn, tự trả sân, mute và không JS exception. Không gửi lệnh chơi vào LIVE.
- `test/immortal-rituals.test.mjs`: đường kiếm hội tụ liên tục, chín bậc, long châu đến đúng thân đã nâng, reveal cũ/mới, bất biến event và reduced motion.

Tải lại nguồn Link để nhận frontend mới, giữ URL sân chung.
