# Nghiên cứu và quyết định thiết kế — 31/10/2026

Các nguồn dưới đây là trang sản phẩm / tài liệu của nhà phát triển, trừ nghiên cứu học thuật. Mô tả sản phẩm chứng minh cơ chế được công bố, không chứng minh doanh thu hoặc retention. Bản này không được phát triển từ mã của các game tham khảo.

## Nguồn

1. **Amazing Cultivation Simulator — GSQ Games / Steam**: xây tông môn, nghiên cứu tri thức/công pháp, tìm pháp bảo, yêu thú, trận pháp và đột phá. Áp dụng thành chuỗi nhập môn → tài nguyên → bí pháp/pháp bảo → đột phá → boss. https://store.steampowered.com/app/955900/Amazing_Cultivation_Simulator/
2. **Xiuzhen Idle — nhà phát triển trên Steam**: tiến triển từ luyện khí, trúc cơ tới các cảnh giới cao. Tham khảo cấu trúc tiến trình dài; không sao chép các hệ thống cuối game. https://store.steampowered.com/app/1649730/xiuzhen_idle/?l=english
3. **Stream Avatars — Minigames docs**: boss có thời gian tham gia/lượt và thưởng tiền trò chơi; các sự kiện tập thể có đầu-cuối. Áp dụng boss 120 giây, phần thưởng cho người thực sự tham chiến. https://docs.streamavatars.com/stream-avatars/application-settings/minigames
4. **Tangia Dungeon — nhà phát triển**: avatar riêng, lập đội dungeon, XP/trang bị và bảng thành tích. Áp dụng hồ sơ tồn tại qua buổi và vật phẩm có công dụng; không mặc định Tangia tích hợp TikTok. https://www.tangia.co/post/tangia-dungeon
5. **Dance Party — Livecade**: người xem bình luận để có nhân vật; camera/hiệu ứng lần lượt nhận diện từng người. Áp dụng tên trên nhân vật, hiệu ứng có chủ nhân, trình diễn quan trọng xếp hàng. https://livecade.itch.io/dance-party
6. **TikXander catalog**: đua theo vòng, vào chơi qua bình luận, turbo và tác động nhìn thấy rõ. Áp dụng phản hồi rõ ai vừa làm gì; không dùng cơ chế mua thắng ngay. https://www.tikxander.com/en/games
7. **TikTok race games — peggy2402**: tên người tặng, điểm nổi, âm thanh, podium, cấu hình hiệu ứng. Áp dụng bảng điều hành, mô phỏng và ký sự; không nhập mã hay tải executable của dự án. https://github.com/peggy2402/tiktok-race-games
8. **TikFinity**: Actions & Events, điểm và Event API; overlay dùng OBS/LIVE Studio. Kết nối local WebSocket cổng 21213 là tích hợp cần xác minh với phiên bản cài thực tế. https://tikfinity.zerody.one/ — https://tikfinity.zerody.one/tiktok/obsoverlays
9. **OBS Browser Source docs**: đưa trang web vào cảnh phát, cấu hình kích thước và audio. Áp dụng trang overlay 9:16 tách điều hành. https://obsproject.com/kb/browser-source
10. **Ma, Liu & Shen (2022), Antecedents and Consequences of Gift-Receiving in Livestreaming**: dữ liệu livestream Trung Quốc cho thấy tương tác xã hội liên quan tới lượng quà nhận. Không coi là bằng chứng nhân quả hoặc dự báo cho kênh Việt Nam. https://journals.sagepub.com/doi/10.1177/10949968221095550
11. **Tang, Hu & Warkentin (2024), Give to give**: niềm vui, cảm nhận giá hợp lý, nhu cầu địa vị liên quan động lực tặng quà trong mô hình nghiên cứu. Áp dụng sự ghi nhận dễ hiểu, không suy ra con số tăng trưởng. https://www.sciencedirect.com/science/article/abs/pii/S0148296324004223
12. **TikTok Virtual Items Policy (ROW)**: Gifts là cách thể hiện sự đánh giá nội dung / tương tác trong nền tảng. Không đồng nhất Gifts với một giao dịch chuyển tiền trực tiếp giữa hai người. https://t.tiktok.com/legal/page/row/virtual-items/en
13. **TikTok Creator Network Content Monetization Policy, October 2026**: chính sách dành cho Creator Network đề cập gift baiting, tương tác giả, chất lượng trải nghiệm LIVE và giới hạn kêu gọi quà trong phạm vi chính sách. Không mặc định mọi mapping quà với tiến trình được TikTok chấp thuận. https://lf16-live-backstage.tiktokcdn.com/obj/ies-hotsoon-draft-sg/webcast-union-platform-i18n/3f1a6596-7db7-4b75-82a9-7f36dd9e7563.html?d=1774151873757

## Lựa chọn cho bản chơi thử

- **Vào dễ:** một lệnh nhập môn, không chọn nhiều chỉ số ban đầu.
- **Mục tiêu gần:** 120 tu vi cho đột phá đầu; thanh tu vi và chi phí luôn nhìn thấy.
- **Lựa chọn có hệ quả:** học tăng tu vi, rèn tăng sát thương, luyện đan nhận tu vi nhanh. Dùng chung nguồn linh thạch để tạo quyết định ưu tiên.
- **Nhận diện cá nhân:** hồ sơ theo user ID; tên chỉ dùng để hiển thị, không dùng để gộp người xem thật.
- **Cộng đồng:** boss tự xuất hiện khi có người hoạt động, mở 120 giây; chỉ người tham chiến nhận thưởng; chưa có bỏ phiếu / chia phe.
- **Quay lại:** lưu vĩnh viễn cảnh giới, công pháp, pháp bảo; điểm danh theo lịch Việt Nam.
- **Tặng quà:** mốc cố định có hiệu ứng, tu vi, nguyên liệu; không xổ số pháp bảo, không cược hoặc quy đổi tiền. Tất cả vật phẩm cũng nhận được bằng đường miễn phí. Có cấu hình thay đổi mốc và phần thưởng để cân bằng sau thử nghiệm.
- **Chống spam:** hồi chiêu từng loại tương tác, giới hạn tu vi từ tim, follow thưởng một lần. Đây là giới hạn cấp thưởng, không phải chặn người xem bình luận.
- **Bảo toàn dữ liệu:** demo/LIVE riêng; ghi file tạm; lưu ledger chống trùng combo qua restart; không tự đoán quà thiếu định danh / giá trị.

## Giả thuyết cần đo khi live thật

1. Tỉ lệ nhập môn trên người bình luận mới; tỉ lệ còn hoạt động sau 3 và 10 phút.
2. Người tham gia vòng boss thứ hai và người quay lại buổi kế tiếp.
3. Thời gian tới bí pháp đầu tiên / đột phá đầu tiên; số người thiếu tài nguyên mà không hiểu cách kiếm.
4. Quà có phát đúng người, đúng lần và có bị xếp hàng quá lâu không.
5. Người không tặng quà có tiếp tục đóng góp và tiến cảnh giới không.

Chưa có công cụ telemetry tự động trong bản này. Không sử dụng doanh thu hoặc độ hot của trang quảng cáo làm bằng chứng chắc chắn. Chưa tìm được nguồn xác nhận tên tool đi chùa trong ảnh gốc.
