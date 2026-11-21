# Kiểm tra trước khi thuê VPS — 03/11/2026

## Kết luận hiện tại

Chưa xác nhận bản đang chạy có thể chuyển nguyên trạng lên Linux. Chưa mua VPS. Không đổi hoặc restart LIVE trong đợt kiểm tra này.

Lõi Node và web có khả năng triển khai trên Linux sau khi chuẩn bị kết nối và vận hành. 2 vCPU/4GB là cấu hình khởi đầu dự kiến, chưa phải kết quả đo tải 50 người. Không tính chạy VieNeu local vào cấu hình này khi chưa benchmark.

## Các chỗ đã đối chiếu mã nguồn

| Hạng mục | Hiện trạng | Việc cần làm khi chuyển |
|---|---|---|
| HTTP LIVE | server.mjs chỉ listen 127.0.0.1 và chặn Host không phải localhost, kiểm tra Origin cho POST | Giữ backend private; thiết kế reverse proxy và truy cập quản trị có xác thực. Không đưa thẳng toàn bộ API quản trị lên mạng; không xóa bảo vệ Host/Origin chỉ để chạy được |
| Web người chơi | web/embed.mjs nghe 4320, dùng chung world/persist với LIVE | Chạy chế độ embed trong một tiến trình, HTTPS, proxy headers đúng, bật secure cookie. Không dùng web/server.mjs bản thử làm production |
| TikFinity LIVE và liên kết web | Hai nơi dùng VAN_HAI_TIKFINITY_URL, mặc định ws://127.0.0.1:21213 | Khi VPS chạy game, localhost là VPS, không còn là laptop. Cần đường hầm riêng từ laptop đến VPS, tự nối lại, bảo vệ xác thực. Kiểm tra cả ingest quà và lienket |
| Giọng đọc | speech.mjs tìm .venv/Scripts/python.exe ở đường dẫn Windows; worker cần model và công cụ hậu kỳ | Chưa tương thích nguyên trạng Linux. Chọn chuyển worker sang Linux và đo RAM/CPU hoặc giữ worker trên laptop với kênh riêng; edge-tts là lựa chọn khác nhưng đổi giọng và phụ thuộc dịch vụ ngoài |
| LIVE Studio | Phần mềm phát hình trên laptop | Giữ ở laptop. Linux VPS đề xuất chỉ host backend/web, không thay máy phát video |
| Dữ liệu | data/live.json, demo.json và data/web/accounts.json; log/ledger/backup nằm trong data | Chốt một nơi ghi dữ liệu; chụp bản sao nhất quán khi chuyển; sao lưu ngoài VPS và thử restore. Không để laptop và VPS cùng chạy hai bản LIVE độc lập |
| Khởi động/giám sát | Các lối tắt .cmd/.ps1 phục vụ Windows | Cần dịch vụ Linux tự khởi động sau reboot, restart khi crash, log rotation và kiểm tra health |
| Tài nguyên ảnh | Đồ họa render trên client; file ảnh và nhạc do server phục vụ | Cache ảnh/nhạc, nén dữ liệu chữ, theo dõi lưu lượng tải đầu; không cache API người chơi vào cache công cộng |

## Xác minh đã chạy

- 20 kiểm thử HTTP, lưu/khôi phục dữ liệu, bridge WebSocket giả lập và logic web đều đạt trên Windows, dùng thư mục dữ liệu thử cách ly.
- Không phải thử TikFinity thật qua Internet, không phải benchmark 50 người.
- Docker CLI có nhưng Linux engine chưa chạy; chưa có kiểm chứng thực thi Linux trong đợt này. Không khẳng định đã chạy Linux thành công.

## Nhà cung cấp: điều kiện còn phải làm rõ

- GreenCloud: không chọn mặc định vì giới hạn CPU và quy định game/streaming đã nêu trong HOSTING-NOTES.md.
- LightNode: không thấy lệnh cấm chung game server trong AUP đã đọc, nhưng có quyền bóp CPU/băng thông khi tải ảnh hưởng node. FAQ xác nhận tắt máy ảo vẫn tính phí tới khi release. Cần hỏi hạn mức gói Việt Nam, tiền nạp tối thiểu/hoàn số dư và xác nhận workload trước khi nạp. Chưa coi trả theo giờ là dùng thử miễn phí hoặc có quyền hoàn tiền.
- Vietnix: chính sách mục 5 nêu điều kiện riêng cho game server, có thể yêu cầu hồ sơ giấy phép/giấy chứng nhận và từ chối hoặc dừng dịch vụ nếu không đáp ứng. Chưa kết luận game này thuộc loại pháp lý nào; phải mô tả đúng cả overlay LIVE và web RPG cho nhà cung cấp xác nhận.
- VinaHost: có sản phẩm game server; điều đó không tự xác nhận gói Cheap-SSD hỗ trợ cùng workload. Chính sách hoàn tiền VPS Việt Nam 5 ngày có ngoại lệ, bao gồm sản phẩm khuyến mãi, phí IP/firewall riêng. Cần xác nhận bằng ticket đúng tên gói trước thanh toán.

## Nội dung chuẩn bị để hỏi hỗ trợ (chưa gửi)

Tôi cần host ứng dụng Node.js chạy liên tục: game tương tác TikTok LIVE và web RPG tối đa khoảng 50 người đồng thời, có tài khoản và lưu dữ liệu. Quà TikTok có thể cấp tiến trình/vật phẩm trong game. Hình ảnh được render tại máy khách; TikFinity và LIVE Studio ở laptop, VPS không encode hoặc phát video. Xin xác nhận đúng gói nào cho phép workload này, yêu cầu hồ sơ gì trước kích hoạt, đời CPU và mức dùng CPU liên tục/burst, có root/SSH và cho phép SSH tunnel/WebSocket/SSE/HTTPS không, hạn mức băng thông trong/quốc tế, xử lý vượt hạn mức/DDoS, nâng cấp có mất dữ liệu hoặc đổi IP không, sao lưu và chính sách thử/hoàn tiền cụ thể. Xin cho IP/file test tại đúng datacenter và tổng giá thanh toán/gia hạn.

## Điều kiện trước khi chuyển LIVE

1. Có trả lời phù hợp từ nhà cung cấp; thuê thử hoặc kỳ ngắn nhất sau khi rõ tiền nạp và hoàn phí.
2. Bản Linux thử chạy đầy đủ Node/web/ảnh/nhạc, đăng nhập, cookie HTTPS, liên kết TikTok và lưu dữ liệu.
3. Bridge thật thử tim, follow, share, bình luận, quà đơn và combo; ngắt mạng rồi nối lại không mất/nhân đôi thưởng.
4. Giọng nói thử câu mới và cache, không mất tiếng khi dồn sự kiện; đo riêng tài nguyên TTS.
5. Đo tải 50 người với API thật, đăng nhập, lưu dữ liệu và sự kiện, vào giờ tối trên mạng Việt Nam. Ghi p95 latency, lỗi, CPU steal/RAM và độ trễ nhận sự kiện.
6. Thử restart/reboot và khôi phục backup; xác nhận dữ liệu không bị hai tiến trình ghi.
7. Chỉ mở public web/overlay đã bảo vệ; admin private. Giữ phương án quay về laptop, không chạy hai world ghi độc lập.

Nguồn chính hãng đã đọc:
- https://doc.lightnode.com/Acceptableusepolicy/Acceptableusepolicy.html
- https://www.lightnode.com/en-US/termsService
- https://doc.lightnode.com/FAQ/FAQ.html
- https://vietnix.vn/chinh-sach-su-dung-dich-vu/
- https://vinahost.vn/quy-dinh-su-dung-dich-vu/
- https://kb.vinahost.vn/accounting/chinh-sach-hoan-tien-tai-vinahost/
