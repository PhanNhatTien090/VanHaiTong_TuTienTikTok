# Bản đang chạy sau khi người dùng sửa lại yêu cầu đăng nhập

Root Internet dùng nguyên index.html/web.js của bản game Claude, với đăng nhập/đăng ký/liên kết TikTok gốc. KHÔNG gán khách vào hồ sơ hay chế độ quản trị. GET /api/session của khách trả user:null; /api/me yêu cầu phiên hợp lệ (401), /admin/* bị chặn từ Internet (403). Cookie vh_public_view cũ không còn tác dụng. Chỉ chủ tài khoản đã đăng nhập thấy nhân vật họ đã xác minh qua liên kết TikTok.

Khóa tạm thời các POST phát triển nhân vật và nhận thưởng (403). Vẫn cho phép đăng ký/đăng nhập/đăng xuất, kiểm tra tên, bắt đầu liên kết và tạo nhân vật ban đầu theo luồng có sẵn. GET helper chạy trên bản sao khi khóa để không làm tăng tài nguyên. completeLink và bộ đọc bình luận xác minh TikTok gốc đã được trả lại. WEB_PROFILE_ONLY=1 hiện chỉ có nghĩa khóa gameplay, KHÔNG dùng để thay trang chủ hay bỏ đăng nhập.

24 kiểm thử web qua; test riêng chứng minh đăng ký → mã liên kết → đăng nhập đúng nhân vật, mật khẩu sai bị từ chối, không thể lấy nhân vật khác bằng query profile, GET không tăng tài nguyên và các POST gameplay bị chặn. Kiểm tra Internet thật: trang đăng nhập có sẵn, hash web.js khớp bản gốc, kiểm tra tên 200, khách /api/me 401, /admin/players 403, bế quan 403. Link giữ nguyên https://decor-reasonably-html-aug.trycloudflare.com .

Các mục phía dưới là lịch sử cấu hình cũ, KHÔNG dùng để tự đưa khách vào chế độ admin/viewer hoặc thay giao diện.

---

# Đính chính theo người dùng · giao diện gốc phải được giữ

Người dùng yêu cầu host nguyên giao diện web tiên môn do Claude đã làm (hub PixiJS, công trình, quảng trường, các bảng hồ sơ). KHÔNG thay bằng portal tra cứu mới và KHÔNG thiết kế thêm giao diện.

Đã khôi phục web/public/web.js, index.html, panels.js nguyên bản từ data/backups/original-web-readonly-20261104/, xác nhận hash web.js và index.html khớp. Root Internet hiện phục vụ index.html/web.js gốc. Trang tra cứu riêng profiles.html không còn là trang chủ.

Chế độ xem có sẵn dùng /admin.html và nút “Đổi người”; backend cho khách sử dụng bộ chọn hồ sơ này trong chế độ chỉ đọc, cookie vh_public_view chỉ chọn đối tượng xem và không cấp quyền thao tác. API POST phát triển nhân vật vẫn trả 403. Các helper GET của game chạy trên bản sao nhân vật, không tạo tu vi/tài nguyên trên nhân vật thật. Backend trả session/me/scene/ranking/live phù hợp với giao diện cũ, không sửa thiết kế.

Đã triển khai và kiểm tra qua link Internet https://decor-reasonably-html-aug.trycloudflare.com : hub gốc 200, scene 9 nhân vật, bảng top 20, bộ chọn 48 hồ sơ/lượt, API bế quan 403. 24 kiểm thử web đạt. Các phần bên dưới mô tả bản portal trước khi người dùng đính chính, không dùng để thay root lần nữa.

---

# Chuẩn bị host Tiên Tịch · 04/11/2026

Đã chạy trên http://127.0.0.1:4320/ trong server LIVE, dùng dữ liệu thật. 3.723 hồ sơ đạo hữu công khai tại lúc kiểm tra. Không mở tunnel Internet trong lượt chuẩn bị này; link trycloudflare cũ đã dừng.

## Người xem

- Không cần tài khoản: xem top tu vi, sức mạnh, cống hiến; tìm tên/mã đạo hữu; phân trang.
- Xem cảnh giới, tổng tu vi, tu vi hiện có, linh thạch, pháp bảo, công pháp, trang phục, phi kiếm, linh thú và đạo lữ.
- Bấm đạo lữ để mở hồ sơ người kia. Có nút sao chép liên kết trực tiếp.
- Ghim hồ sơ của tôi trên thiết bị để mở nhanh bản thân và đạo lữ. Ghim không nhận quyền sở hữu nhân vật hay thay đổi tài khoản.

## Khóa phía server

Mặc định `WEB_PROFILE_ONLY=1`; createWebApp mặc định chỉ xem khi không cấu hình. API chơi, bế quan, quà/thư/nhiệm vụ, cường hóa, mua đồ, pet, bí cảnh, tạo nhân vật, liên kết đều trả 403. Các GET của game cũ có thể tạo dữ liệu cũng bị chặn. perform(), completeLink() và kết nối bình luận riêng của web bị khóa. Dữ liệu nhân vật, tài khoản, phần bế quan cũ không bị xóa.

API công khai: GET /api/site-status, /api/profiles, /api/profile?id=..., /api/session (chỉ gợi ý hồ sơ liên kết cũ). Hồ sơ dùng danh sách trường cho phép, không xuất tài khoản/mật khẩu/lịch sử quà. NPC và nhân vật web-only không vào danh bạ.

## Mở link khi triển khai

1. Kiểm tra: `powershell.exe -NoProfile -File scripts/check-profile-host.ps1`.
2. Khi muốn mở Internet, chạy `MO-LINK-WEB.cmd`. Script tự kiểm tra web chỉ xem trước khi mở tunnel đến 4320. Không chạy trong lượt chuẩn bị này.
3. Link mới lưu ở data/web-link.txt. Tunnel thử có link thay đổi khi khởi động lại; chưa cấu hình tên miền/VPS.
4. Chỉ cổng web 4320 đi qua tunnel. Cổng quản trị LIVE 4317 giữ loopback.

## Xác minh

- 411 kiểm thử LIVE và 23 kiểm thử web qua. Các bài web cũ chỉ bật game riêng trong môi trường thử để kiểm tra hành vi cũ.
- Test HTTP đã chặn 19 đường POST, gồm tài khoản đã đăng nhập và /dev/link; GET không làm đổi thế giới mẫu.
- Kiểm tra server thật: root là portal hồ sơ, readOnly=true, top và hồ sơ/đạo lữ đúng dữ liệu, các API tu luyện/bế quan/quà/bí cảnh trả 403.
- Chưa xem giao diện bằng trình duyệt do local browser bị tắt trong Work settings. Chưa kiểm thử tải Internet hoặc công bố URL công khai.

## Giọng thông báo đua

- Nguồn nối giữa lượt hoặc bật âm thanh sau lúc mở sự kiện nhận entryAnnouncement ổn định theo lượt/giai đoạn, không bị bỏ ở snapshot đầu.
- Mở tuyển/xuất phát dùng MP3 tạo sẵn từ pipeline giọng hiện có, đầy đủ luật top 3 skin/top 5 tu vi; không đọc coin. File có sẵn, không chờ synth dưới tải.
- Giọng mở đua ưu tiên trước các quà đang chờ; các thông báo khác thử lại tối đa hai lần nếu synth lỗi.
- Hai clip MP3 được ffprobe xác nhận hợp lệ, 7,22 và 6,83 giây ở tốc độ gốc. Đã kiểm thử phát file khi dịch vụ TTS không hoạt động. Không nghe trực tiếp trong LIVE Studio.
- Telemetry nguồn LIVE Studio vẫn phiên bản 87 tại lần cuối kiểm tra; bản sửa là 88, cần tải lại nguồn Link.
- Sửa thêm gói overlay để giữ raceSwordSkins/raceSwordChoice, tránh mất skin phi kiếm trên nguồn phát.

Sao lưu trước triển khai: data/live-pre-profile-voice-v4-*.json, demo-pre-profile-voice-v4-*.json và data/backups/profile-voice-20261104/. Bộ đệm quà đã replay; server khởi động thành công, TikFinity nối lại, watchdog tiếp tục hoạt động.
