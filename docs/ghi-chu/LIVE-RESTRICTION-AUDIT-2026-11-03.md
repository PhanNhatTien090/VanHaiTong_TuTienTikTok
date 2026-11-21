# Rà soát cảnh báo LIVE ngày 2026-11-03

Phạm vi: đọc hai ảnh cảnh báo 21:53–21:54, mã nguồn và GET `/api/state?world=live`. Không gửi khiếu nại, không sửa mã ứng dụng, không thay dữ liệu/cấu hình LIVE, không restart hoặc reload nguồn.

## Điều đã xác nhận

- Ảnh thứ nhất: LIVE bị hạn chế với một số đối tượng; lý do “Deceptive Behaviors and Fake Engagement”.
- Ảnh thứ hai: LIVE không đủ điều kiện được đề xuất, bị hạn chế trong tìm kiếm; lý do “Fake Engagement”. Đây không phải thông báo khóa tài khoản hoặc kết luận về từng hiệu ứng đột phá.
- Snapshot LIVE đọc trong phiên rà soát có 6 player đánh dấu `puppet`, không có resident, không có sự kiện `simulated`/`autoRose` trong tập sự kiện gần nhất. Không suy ra không từng có các sự kiện này trước thời điểm cảnh báo.
- `puppet-auto-rose.mjs` có lịch 3–5 phút tạo sự kiện quà nội bộ với `simulated:true, autoRose:true`. Đây là sự kiện trong game, không phải bằng chứng phần mềm tự gửi quà thật hoặc tự tăng chỉ số trên TikTok.
- `engine.mjs` hiện chỉ gọi auto-rose khi `settings.puppetAutoRose===true`; thưởng tu vi/linh thạch follow/share chỉ khi `settings.engagementRewards===true`. Các trường tương ứng không có giá trị trong snapshot settings đã đọc; cần cấu hình thực và log tiến trình để xác nhận lúc cảnh báo. Không khẳng định sửa nguồn đã có tác dụng với tiến trình server đang chạy.
- `engagement.mjs` vẫn có nhiệm vụ 5 bình luận, 50 tim, 3 lần đánh. `heart-hud.js` có chỉ dẫn đạt mốc tim nhận thưởng/buff. Đây là các điểm cần xem cách trình bày và vận hành; không tự động kết luận mọi phần thưởng game là vi phạm.

## Giả thuyết cần kiểm chứng

- Quà/nhân vật mô phỏng nếu trình bày như người xem hay người tặng thật có thể gây hiểu nhầm. Cần đối chiếu bản ghi LIVE tại thời điểm cảnh báo, nhãn NPC, bảng quà và giọng đọc, không chỉ đọc mã hiện tại.
- Lặp lời kêu gọi spam tim/bình luận/follow, hứa hẹn sai hoặc gây áp lực tặng quà là những phần cần loại bỏ. Phân biệt lệnh chơi tự nguyện với việc thúc đẩy tương tác để thao túng chỉ số.
- Hai thông báo không nêu hình ảnh sen, hiệu ứng bùng hoặc cảnh giới cụ thể; chưa có căn cứ gán nguyên nhân cho các hiệu ứng vừa thêm.

## Lỗi kỹ thuật riêng phát hiện khi đọc mã

`public/app.js`, đầu `receive(s)`: chú thích `// 3/11: quà mô phỏng ...` đang nằm cùng dòng với `const previous=state;state=s;...`. Phần khai báo/cập nhật này bị trở thành comment, trong khi dòng sau vẫn dùng `previous` và `state`. Có thể gây lỗi cập nhật giao diện. Đây là lỗi riêng, không phải bằng chứng giải thích quyết định TikTok. Có backup `data/app.js.bak-fake-2159`; chưa sửa trong lần rà soát này.

## Bước xử lý đề xuất

1. Giữ ảnh thông báo, thời điểm, bản ghi phiên LIVE và sự kiện TikFinity quanh đó để đối chiếu; dùng mục kháng nghị có sẵn trong thông báo nếu cho rằng quyết định sai. Chỉ khai nội dung đúng với vận hành thực tế.
2. Tách rõ NPC khỏi người xem thật; không cho quà mô phỏng vào các thông báo, giọng đọc hoặc bảng xếp hạng quà thật. Các công cụ thử quà giữ ở preview/demo.
3. Rà soát và điều chỉnh nhiệm vụ/mốc tim, lời mời tương tác và phần thưởng cho minh bạch; không hứa quà/điều kiện sai, không khuyến khích spam hoặc gây áp lực tặng quà.
4. Sửa lỗi comment trong `receive` và kiểm bản overlay LIVE ở chế độ chỉ đọc trước khi tải lại nguồn. Thay đổi code không tự gỡ hạn chế của TikTok và không bảo đảm tránh mọi cảnh báo.

## Nguồn nền tảng đã đối chiếu

- TikTok Newsroom, phần Countering fake engagement: https://newsroom.tiktok.com/how-tiktok-counters-deceptive-behaviour?lang=en-150
- TikTok Newsroom, LIVE Safety/Monetization Guidelines: https://newsroom.tiktok.com/tiktoklive?lang=en-ZA
- Trang Community Guidelines trực tiếp bị công cụ chặn truy cập trong phiên này; trang Help Center về violations mở được nhưng không trả nội dung đọc được. Không trình bày như đã đọc toàn bộ bản hướng dẫn hiện hành hoặc xác nhận kết quả khiếu nại.
