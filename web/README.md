# Trạng thái hiện tại · 04/11/2026

Web mặc định là **Tiên Tịch, chỉ xem hồ sơ** (`WEB_PROFILE_ONLY` mặc định bật). Khách mở web không cần đăng ký: tìm đạo hữu, xem top tu vi/sức mạnh/cống hiến, xem pháp bảo, skin, phi kiếm, linh thú và bấm sang hồ sơ đạo lữ. Ghim hồ sơ trên thiết bị để mở nhanh “Hồ sơ của tôi” và “Đạo lữ của tôi”; việc ghim không xác nhận quyền sở hữu hoặc thay đổi tài khoản.

Mọi API chơi game, bế quan, nhận thưởng, tạo nhân vật và liên kết đều bị chặn 403, kể cả gọi trực tiếp và tài khoản đăng nhập cũ. Các GET có thể tạo thư/tài nguyên của bản game cũ cũng bị chặn. Không xóa tiến trình, bế quan cũ, kho đồ hoặc tài khoản.

Đang dùng chung dữ liệu LIVE ở cổng 4320. Xem `/api/site-status` để kiểm tra `readOnly: true`. Public API chỉ trả trường hồ sơ được chọn, không xuất tài khoản/mật khẩu/lịch sử quà.

Chuẩn bị host: chạy `scripts/check-profile-host.ps1`; mở link Internet bằng `MO-LINK-WEB.cmd` khi cần. Script mở link chỉ chạy nếu web đang khóa chơi. Không mở cổng quản trị LIVE 4317 ra Internet. Link thử cũ đã dừng; cần khởi động tunnel để có link mới.

Phần dưới mô tả **bản game web cũ**, hiện bị khóa. Bộ kiểm thử cũ chỉ chạy khi bật riêng `WEB_PROFILE_ONLY=0` trong môi trường thử nghiệm.

---

# Vân Hải Tông — bản web

Game web dùng chung nhân vật với LIVE. **Một chiều**: người chơi web thấy LIVE, người xem LIVE không thấy gì từ web.

## Chạy

| Mục đích | Cách chạy | Dữ liệu |
|---|---|---|
| Chạy thử trên máy | bấm đúp `start-web.cmd` → http://127.0.0.1:4320/ | Bản sao `web/data/world.json` (không ảnh hưởng LIVE). Đọc tình hình LIVE thật mỗi 10 giây, chỉ đọc. Có công cụ "Thử trên máy" để liên kết giả lập. |
| Chạy thật (host) | `BAT-WEB.cmd` rồi khởi động lại server LIVE | Chung `data/live.json`. Xem **HOSTING.md**. |

Kiểm thử: `npm.cmd run test:web` (web) và `npm.cmd test` (LIVE, phải luôn qua hết).

## Nội dung game

- **Trang chủ tông môn** (PixiJS): công trình bấm được, mây, hoa, cổng bí cảnh xoáy, lò rèn tóe lửa. **Quảng trường**: nhân vật của mình + người đang chơi LIVE (đúng model LIVE, làm theo động tác LIVE). Dòng tin LIVE, nhạc nền LIVE.
- **Hồ sơ** (bấm avatar): tu luyện, hái thảo, điểm danh, đột phá, pháp bảo, tàng kinh, đan, trang phục, xếp hạng (web / đang LIVE / toàn tông).
- **Bí Cảnh**: đánh boss LIVE (Lôi Hổ, Huyền Vũ, Phượng Hoàng; vùng 2: Thương Long, Cự Côn, Cửu Vĩ Nguyệt Hồ). Joystick, combo 3 nhát, né, 3 chiêu, đan, linh thú trợ chiến. Thể lực, 3 sao, quét ải, trần tu vi ngày, chống gian lận thời gian.
- **Sự Kiện**: xem LIVE. Khi LIVE mở boss → đánh bản web riêng, nguyên liệu ×2, không tốn thể lực, mỗi sự kiện thắng một lần.
- **Luyện Khí Các**: cường hóa pháp bảo +1→+10 bằng nguyên liệu rơi (chỉ tăng sức mạnh trong bí cảnh web).
- **Linh Thú Cốc**: linh thú mở trên LIVE; trên web chọn đồng hành và cho ăn để lên cấp.
- **Nhiệm vụ ngày**: 4 nhiệm vụ + rương.
- **Tiên Ngọc + Cửa hàng**: Tiên Ngọc = tổng coin quà LIVE − đã tiêu (quà cũ được cộng bù). Chỉ bán đồ dùng trên web: thể lực, rương nguyên liệu, Linh Quả, Hồi Xuân Đan mang vào trận. Giới hạn lượt mỗi ngày.
- **Đại Điện · Bế quan**: tu khi offline, 3% lượng tu vi đột phá mỗi giờ, tối đa 8 giờ, tính chung trần tu vi ngày.
- **Thư**: thư chào mừng kèm quà tân thủ, thư báo Tiên Ngọc. **Quà 7 ngày**: chuỗi đăng nhập.

## Nguyên tắc nội dung

Nhân vật và quái **luôn dùng model có sẵn của LIVE**; animation phát triển từ ảnh gốc (`live-actor.js` dùng chính code vẽ của LIVE). Codex chỉ vẽ giao diện, biểu tượng, nền bản đồ.

## Tệp chính

- `app.mjs` lõi web (đường dẫn API, file tĩnh, bảo mật) · `server.mjs` chạy thử · `embed.mjs` chạy chung LIVE
- `isolate.mjs` thế giới tạm cách ly cho hành động web · `live-view.mjs` tình hình LIVE cho web
- `dungeon.mjs` bí cảnh/sự kiện · `extras.mjs` Tiên Ngọc, cửa hàng, bế quan, thư, quà ngày · `progress.mjs` nguyên liệu, cường hóa, linh thú, nhiệm vụ · `accounts.mjs` tài khoản, liên kết
- `public/hub.js` trang chủ · `public/battle.js` màn đánh · `public/live-actor.js` vẽ nhân vật LIVE · `public/panels.js` các bảng · `public/sound.js` âm thanh
- `tools/` công cụ cắt ảnh Codex (slice-auto, keep-main, fill-cap, preview, alpha-check)
