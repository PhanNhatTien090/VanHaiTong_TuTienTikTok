> Cập nhật repo ngày 05/11/2026: dự án gồm **TikTok LIVE** (mã ở gốc + `public/`) và **web người chơi** (`web/`). Một số ghi chú lịch sử bên dưới mô tả phiên bản cũ.
>
> - Cài Node.js 20+, chạy `npm ci`, sau đó `npm start` hoặc `start.cmd`.
> - Quản lý LIVE: `http://127.0.0.1:4317/?world=live` — chỉ công cụ điều hành, không chạy lại sân chơi.
> - Nguồn LIVE Studio: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&quality=auto` (1080×1920).
> - Web: xem [hướng dẫn hosting](web/HOSTING.md). Bản tích hợp chạy cổng4320, bật bằng `BAT-WEB.cmd` rồi khởi động server; chỉ xem hồ sơ, các thao tác phát triển tu vi đang khóa ở server. Chạy độc lập để phát triển bằng `npm run web`, dữ liệu thử lưu riêng trong `web/data/`.
> - Kiểm thử: `npm test` và `npm run test:web`.
> - `data/`, `web/data/`, tài khoản, phiên đăng nhập và sao lưu không nằm trong Git. Clone repo tạo môi trường mới, không mang theo người chơi/tài khoản thật. Không chép dữ liệu thật vào repo để commit.
> - Giọng VieNeu dùng model/công cụ cài riêng; xem `speech.mjs` và `scripts/vieneu_worker.py`. Không đóng gói model vào repo.
> - Muốn dùng nút mở tunnel, cài Cloudflare `cloudflared` và đặt file thực thi vào `tools/cloudflared.exe`. Binary tải ngoài không được commit.

Bản cập nhật Thiên đài đột phá 03/11/2026: xem [hướng dẫn và kiểm chứng](ASCENSION-STAGE-NOTES.md). Nhịp tu luyện và giao diện LIVE trong ghi chú này thay thế các thông số cũ bên dưới.

# Vân Hải Tông — Tiên giới LIVE

Bản chơi thử chạy cục bộ trên Windows, giao diện tiếng Việt, tiên cảnh vẽ bằng Canvas. Người xem nhập môn bằng bình luận, tăng tu vi, học bí pháp, rèn pháp bảo, luyện đan và hợp sức đánh yêu thú. Không cần tài khoản web cho người xem.

## Chạy

Cần Node.js 20 trở lên. Bấm đúp **start.cmd**, hoặc chạy trong thư mục này:

```powershell
npm.cmd install
npm.cmd start
```

- Điều hành / mô phỏng: http://127.0.0.1:4317/
- Thế giới LIVE: http://127.0.0.1:4317/?world=live
- Cảnh OBS thật: http://127.0.0.1:4317/?overlay=1&world=live
- Cảnh OBS thử: http://127.0.0.1:4317/?overlay=1&world=demo

Trong OBS thêm **Browser Source**, kích thước **1080 × 1920**. Cảnh thử được ghi nhãn THỬ NGHIỆM. Giữ cửa sổ máy chủ chạy trong lúc sử dụng. Đóng máy chủ bằng Ctrl+C; mở lại bằng start.cmd. Nếu dùng phiên chạy nền được mở sẵn khi bàn giao, đóng bằng **stop-background.cmd** (chỉ dừng khi PID và đường dẫn khớp dự án này). Máy chủ chỉ lắng nghe 127.0.0.1, không mở ra Internet.

## Thử vòng chơi

1. Ở Thế giới thử nghiệm, nhập tên và bấm Nhập môn. Có sẵn 12 hồ sơ minh họa, toàn bộ nằm riêng trong dữ liệu demo.
2. Bấm Tu luyện, Hái linh thảo, Điểm danh; thử nhập lệnh bình luận. Có hồi chiêu từng người, không thể spam để nhận thưởng vô hạn.
3. Đến Tàng kinh: học Thanh Tâm Quyết để tăng lượng tu vi nhận được; rèn Thanh Ngọc Kiếm để tăng sát thương. Các bí pháp có hiệu lực cộng dồn; chỉ một pháp bảo được trang bị.
4. Đến Đan phòng: luyện Tụ Khí Đan bằng 12 linh thạch + 2 linh thảo, rồi dùng để nhận 65 tu vi trước hệ số bí pháp/pháp bảo.
5. Đủ 150 tu vi + 30 linh thạch thì Đột phá Luyện Khí (v33: tu vi cần ×2,4 mỗi cảnh giới, linh thạch +40). Các cảnh giới sau có chi phí tăng dần, tối đa Chân Tiên. Đột phá cố định, không xổ số, không mất nhân vật.
6. Bấm Mở bí cảnh, sau đó Xuất chiêu. Sát thương phụ thuộc cảnh giới, bí pháp, pháp bảo. Chỉ những người đã tấn công mới nhận thưởng khi thắng.
7. Bấm các quà THỬ để kiểm tra hoa, kiếm, pháp trận, thanh long. Đây không phải giao dịch hay quà TikTok thật. Có nút bật âm thanh; trình duyệt cần người dùng bấm để cho phép phát âm.

## Lệnh bình luận

| Lệnh | Tác dụng |
|---|---|
| `nhapmon` | Tạo / trở lại nhân vật theo ID người xem |
| `tuluyen` | +10 tu vi, +2 linh thạch mỗi 10 giây |
| Bình luận khác | +3 tu vi, +1 linh thạch mỗi 15 giây; không đưa lời nhắn tùy ý lên cảnh |
| Lượt thích | Tối đa 3 tu vi mỗi 15 giây mỗi người (v33) |
| Follow | Một lần: +20 tu vi, +10 linh thạch |
| `diemdanh` | Mỗi ngày giờ Việt Nam: +25 tu vi, +20 linh thạch, +3 linh thảo |
| `hai` | +5 tu vi, +3 linh thạch, +3 linh thảo mỗi 30 giây |
| `hoc Thanh Tam Quyet` | Mua / học bí pháp bằng linh thạch |
| `ren Thanh Ngoc Kiem` | Rèn và trang bị pháp bảo |
| `trangbi Thanh Ngoc Kiem` | Đổi sang pháp bảo đã sở hữu |
| `luyendan Tu Khi Dan` | Chế tạo một viên đan |
| `dung Tu Khi Dan` | Tiêu thụ một viên; hồi 3 giây |
| `dotpha` | Tiêu thụ tu vi hiện tại và linh thạch để lên cảnh giới |
| `danh` | Đánh yêu thú; hồi 4 giây |

Tên vật phẩm chấp nhận có dấu, không dấu, hoặc ID trong engine.mjs. Tổng tu vi tích lũy dùng cho bảng xếp hạng; tu vi hiện tại là phần có thể dùng để đột phá. Không cấp tu vi thụ động chỉ vì không thấy người xem rời phòng: sự hiện diện được suy ra từ tương tác trong 15 phút gần nhất, không phải số người xem chính thức.

## Kết nối TikTok thật

1. Mở TikFinity Desktop trên cùng máy, kết nối TikTok đang LIVE và kiểm tra Event API cổng 21213.
2. Chọn Thiết lập → Kết nối TikFinity; xem trạng thái / lỗi. Chỉ bật kết nối khi muốn bắt đầu nhận sự kiện thật. Kết nối không tự bật lại sau khi khởi động lại máy chủ.
3. Chọn Thế giới LIVE để xem dữ liệu thật; bộ mô phỏng không có quyền ghi vào LIVE.
4. Trong Thiết lập, chỉnh các mốc quà. Các mốc tăng dần, bắt đầu từ 1 coin. Chọn hiệu ứng theo giá trị MỘT quà; combo lặp cùng hiệu ứng, không tự đổi thành quà cấp cao.
5. Dùng link OBS LIVE. Nếu TikFinity ngắt, máy chủ thử lại mỗi 5 giây. Quan sát ký sự và kiểm tra một tương tác thực tế trước khi phát rộng.

**Giới hạn kiểm chứng:** đã kiểm tra bằng sự kiện WebSocket giả lập đúng cấu trúc và kiểm thử engine; chưa kiểm chứng với kênh TikTok đang LIVE thật. TikFinity có thể thay đổi payload theo phiên bản. Các trường đang hỗ trợ: `userId/uniqueId`, `nickname`, `comment`, `likeCount`, `giftId`, `diamondCount`, `giftType`, `repeatCount`, `repeatEnd`, `groupId`, `msgId`, và các trường user/gift lồng nhau. Quà thiếu giá trị hoặc thiếu định danh ổn định sẽ báo lỗi thay vì đoán và cộng tiền thưởng sai.

Combo có groupId được ghi theo phần tăng thêm; nếu không có groupId thì chờ repeatEnd rồi chống trùng bằng msgId. Ledger chống trùng lưu qua restart, dọn sau 24h. Kiểm tra lại cấu trúc sự kiện thực tế trước buổi LIVE đầu tiên.

## Lưu và sao lưu

- `data/demo.json`: hồ sơ thử, danh mục phần thưởng, ký sự, ledger combo.
- `data/live.json`: dữ liệu LIVE riêng biệt.
- Tự ghi qua file tạm và rename mỗi 3 giây; Ctrl+C lưu lần cuối. Dừng đột ngột có thể mất tối đa vài giây cuối.
- Trong Thiết lập, Tải dữ liệu để sao lưu. Phục hồi thủ công: dừng máy chủ, sao lưu file hiện tại, thay đúng file JSON tương ứng, rồi mở lại. Không có nút xóa tiến trình.
- Khi file dữ liệu lỗi, máy chủ dừng và thông báo vị trí file, không tự ghi đè bằng thế giới trống.

## Kiểm tra

```powershell
npm.cmd run check
npm.cmd test
```

Test gồm luật kinh tế, hồi chiêu, ngày Việt Nam, sở hữu/trang bị, đột phá, phần thưởng boss, combo trùng và nối lại, cách ly demo/LIVE, HTTP, lưu và restart, bridge WebSocket.

## Phạm vi bản đầu

Phiên bản cảnh sắc 02: nền tiên môn chi tiết do ImageGen tạo; Canvas 2D vẽ nhân vật áo choàng, pháp bảo, kiếm quay, hoa, trận pháp, thanh long và lôi kiếp trên nền. Cảnh phát bỏ tiêu đề lớn, giữ một dòng nhập môn; có nút ẩn/hiện tên, thẻ tu vi chỉ hiện tạm khi chọn hoặc có hiệu ứng. Nút ẩn tên lưu theo trình duyệt. Nguồn và prompt ảnh: public/assets/ART-DIRECTION.md. Tối đa 32 nhân vật hiển thị cùng lúc, ưu tiên người đang có hiệu ứng và hồ sơ đang chọn; tối đa 10.000 hồ sơ lưu. Chưa có mô hình anime 3D, tài khoản đa máy, cloud save, PvP, bang hội nhiều tông, nhập file sao lưu trên UI hoặc đo retention tự động. Không tái sử dụng tài nguyên của bản game Quỷ Cốc Bát Hoang trên máy.

Mục tiêu là kiểm tra vòng chơi trước khi mở rộng đồ họa. Thông số kinh tế là giả thuyết cân bằng ban đầu, chưa có dữ liệu chứng minh hiệu quả giữ chân hay doanh thu. Mọi vật phẩm có đường chế tạo miễn phí. Quà thật là phản hồi trong trò chơi, không quy đổi tài sản, không hứa lợi nhuận hoặc phần thưởng ngoài trò chơi. Cần đối chiếu chính sách kiếm tiền và điều kiện tài khoản TikTok hiện hành trước khi chạy mapping quà thật.

Đọc **RESEARCH.md** để xem nguồn và quyết định thiết kế.


## Phiên bản 0.3 — Nhân vật, skin và âm thanh

- Sprite mới có 5 bộ áo và nhân vật riêng, tạo bằng ImageGen, alpha trong suốt. Các vòng khí, tinh hoàn, phi kiếm và long khí được vẽ/chuyển động bằng Canvas.
- Nhãn tên vẽ ở lượt cuối sau nhân vật và VFX; hàng giãn cách; tối đa 32 người trên cảnh. Nhãn quá dài rút gọn với dấu …; hồ sơ giữ nguyên tên. Có kiểm thử bố cục từ 1 tới 32 người.
- Skin dựa trên **tổng coin quà nhận được từ người xem trong thế giới này**, không đọc số tiền họ nạp TikTok. Giữ lại qua các buổi vì dùng giftCoins đã lưu. Tách hoàn toàn demo/LIVE.

| Tổng coin quà | Skin | VFX thường trực |
|---:|---|---|
| 0 | Thanh Y | Linh khí nhẹ |
| 100 | Nguyệt Bạch | Nguyệt luân, ngân tinh |
| 500 | Tử Vân | Tinh hoàn, phi kiếm |
| 2.000 | Kim Long | Long khí, kim kiếm |
| 10.000 | Thiên Đế | Thiên luân, thất tinh |

Mốc là cấu hình ban đầu trong public/cosmetics.js. Skin không tăng sát thương hoặc tu vi; phần thưởng quà vẫn theo bảng Thiết lập riêng. Trong bộ mô phỏng có **Thử skin** để tạo nhân vật mẫu ở bậc đã chọn mà không dùng quà thật. Khi vượt mốc sẽ có màn báo ngoại hình mới và VFX.

### Âm thanh

- **♫**: bật/tắt nền thiền và SFX ở chính tab này. Mặc định tắt, cần bấm để trình duyệt cho phép phát.
- **≋**: chỉnh âm lượng tổng, nền thiền và hiệu ứng. Lưu mức âm theo trình duyệt; trạng thái bật không tự lưu để tránh phát bất ngờ.
- Nền: drone quãng năm, gió lọc nhẹ, câu nhạc ngũ cung thưa, điểm chuông. Đây là âm thanh tổng hợp nguyên gốc bằng Web Audio, không phải bản thu tụng kinh hay nhạc thiền thương mại.
- SFX: tu luyện, hoa/tim, xuất chiêu/kiếm, boss, pháp trận, thanh long, đột phá, thắng bí cảnh và lên skin. Chặn lặp dày; hiệu ứng lớn hạ nền tạm thời.
- Khi dùng OBS, mở **Interact / Tương tác** của Browser Source rồi bấm ♫ trong nguồn cảnh đó, bật âm thanh nguồn trong mixer. Trình duyệt bảng điều hành không tự truyền âm sang nguồn OBS. Chỉ bật một nguồn âm để tránh tiếng lặp.
- Logic lập lịch và tắt/bật có kiểm thử; chưa đánh giá chất lượng bằng tai hoặc kiểm tra audio đầu ra TikTok thật trong phiên bàn giao này.

### Kiểm tra hình ảnh không qua trình duyệt

Local browser automation bị tắt trong Work. Đã render trực tiếp cùng code Canvas bằng Skia để kiểm tra ảnh 12 và 32 nhân vật, nhãn tên và alpha. Chạy `npm.cmd run preview:render`, ảnh ở output/preview-v3.png và output/preview-v3-crowd.png. Đây là bản render của Canvas, không phải ảnh chụp trình duyệt có toàn bộ HTML HUD.


## Sinh hoạt tiên môn — v5

Bốn NPC môi trường: kiếm sư luyện kiếm, đan sư canh lò, hộ viện tuần tra và linh đồng chăm cây. Nhãn luôn có tiền tố NPC. Không tạo hồ sơ, không tự bình luận/quà, không cộng số đạo hữu, không thay đổi kinh tế hay thứ hạng.

Map có khói lò, lửa đan, ánh đèn chuyển nhẹ, hạt nước ở vùng thác, sương và cánh hoa. Hoạt động NPC được tính từ thời gian render; khi bật giảm chuyển động của hệ điều hành, hoạt động giữ ở tư thế nghỉ. Thiết lập có nút tắt NPC/môi trường, lưu ở trình duyệt. Không cần nối TikFinity để NPC hoạt động.

Đây là cải thiện thế giới game, không phải biện pháp bảo đảm tránh/gỡ kiểm duyệt TikTok. Các tài liệu thương mại mô tả tính năng game không cung cấp bằng chứng về trạng thái xử lý tài khoản. Mẫu đi chùa tìm được chỉ là bản mô tả dự án, không xác nhận đã triển khai hoặc không bị hạn chế. Người dẫn và tương tác thật vẫn cần được tổ chức riêng.

Nguồn tham khảo bổ sung: https://gurkhatech.com/tiktok-live-streaming-with-animated-offerings-app/ ; https://livecade.itch.io/dance-party ; chính sách Creator Network https://lf16-live-backstage.tiktokcdn.com/obj/ies-hotsoon-draft-sg/webcast-union-platform-i18n/3f1a6596-7db7-4b75-82a9-7f36dd9e7563.html?d=1774151873757 .


## v6: nhạc, giọng Việt và máy quay

Nguồn dọc mới: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&v=6#tiktok.studio` (1080 × 1920). Mở lại thuộc tính Link để đổi URL và bật **Turn on sound**. Nếu trình duyệt chặn tự phát, tương tác với nguồn, bấm ♫ hoặc ≋ > **Thử nhạc + hiệu ứng + giọng**. Nhạc đã có file WAV thực; hiệu ứng phản hồi hành động; giọng đọc nói tên và hành động rồi máy quay zoom đúng nhân vật. Máy quay có thể tắt trong ≋. Tắt tiếng các tab thử khác để tránh vọng.

Giọng Việt động cần internet và Python `edge-tts` (`python -m pip install edge-tts`). Tên hiển thị công khai + lời thông báo trò chơi được gửi tới dịch vụ Microsoft Edge qua thư viện này. Nhạc nền, SFX và mẫu chào vẫn có sẵn trên máy; lỗi dịch vụ giọng động hiện trong bảng âm thanh. Có thể chỉnh riêng nhạc, hiệu ứng và giọng. Hàng đợi giới hạn chống đọc chồng/đọc trễ; quà/đột phá được ưu tiên khi đông. Xem `public/assets/AUDIO.md` để biết nguồn và kiểm chứng.

## v7: giọng tông sư VieNeu + xưng hô theo giới tính

- Giọng đọc mặc định là **VieNeu-TTS v3 Turbo** chạy trên máy (CPU/ONNX, không cần internet), giọng **Thiền Tâm Đức** (nam, giọng Bắc, phong cách kể chuyện) cộng hậu kỳ "tongsu": trầm hơn khoảng 1,25 nửa cung, nói chậm 4%, ấm, có chút vang đại điện. Dùng venv và model sẵn có ở `C:\WorkSpace\TIKTOK\tools\vieneu`. Worker `scripts/vieneu_worker.py` nạp model một lần lúc mở máy chủ (khoảng 15 giây, tốn ~1,3 GB RAM); mỗi câu mới mất khoảng 3–4 giây, câu đã đọc rồi lấy từ cache.
- Nếu VieNeu lỗi thì tự chuyển sang edge-tts NamMinh (cần internet) để LIVE không mất tiếng. Biến môi trường: `VAN_HAI_TTS=vieneu|edge|off`, `VAN_HAI_VOICE` (đổi giọng VieNeu), `VAN_HAI_VIENEU_DIR`. Chỉnh chất giọng ở hằng `TONGSU` trong worker.
- **Xưng hô:** TikTok/TikFinity không gửi giới tính tài khoản, nên người xem tự khai: `nhapmon nam` → *sư huynh*, `nhapmon nu` → *sư tỷ*, chỉ gõ `nhapmon` → *đạo hữu*. Đổi bất cứ lúc nào bằng `gioitinh nam|nu|an`; tông sư sẽ đọc "Lão phu đã ghi nhận…". Không đoán theo tên. Giới tính lưu trong hồ sơ người chơi, qua các buổi LIVE vẫn giữ.
- Lời mẫu: "Chào mừng sư huynh X gia nhập Vân Hải Tông. Từ nay cùng đồng môn tu luyện." · "Đa tạ sư tỷ X đã tặng quà…" · "Chúc mừng sư huynh X vừa đột phá…". Bộ mô phỏng có ô chọn Xưng hô khi Nhập môn.

## v8: không khí, ánh sáng, thu phóng điện thoại, lời tông sư khi vắng

- **Không khí:** chu kỳ ngày–đêm khoảng 6 phút (hoàng hôn vàng → đêm trăng xanh), cực quang linh khí trên trời, tia nắng/trăng chiếu xiên, hào quang đại điện thở theo nhịp, đom đóm linh quang bay lên từ sân, đàn linh hạc bay qua mỗi ~45 giây, bụi sáng và sương trước ống kính, viền tối điện ảnh. Tắt cùng nút môi trường trong Thiết lập. Code ở `drawAtmosphere` trong `public/world-life.js`.
- **Thu phóng:** mặc định 125%, link nguồn LIVE Studio đặt `zoom=1.3`. Chỉnh trong ≋ → *Thu phóng cảnh* (100–170%). Khi phóng to, hàng nhân vật được nén vào vùng nhìn thấy, không ai bị cắt ở mép. Lúc có tương tác máy quay vẫn zoom sâu hơn vào người đó.
- **Lời tông sư khi vắng:** sau khoảng 35–55 giây không có giọng đọc nào, tông sư nói một câu tu tiên ("Mệnh ta do ta, không do trời cao", "Tu đạo như nghịch thủy hành chu…", "Đại đạo ba nghìn, ta chỉ lấy một"…). Cứ 3 câu thì có 1 câu kêu gọi nhập môn. Không lặp lại 8 câu gần nhất. Tương tác thật luôn được đọc trước. Có thể tắt trong ≋ → *Tông sư nói khi vắng*. Các câu nằm trong `public/idle-lines.js`; sửa xong chạy `node scripts/make-idle-voice.mjs --force` để đọc lại.
- Tông sư tự xưng **"lão phu"**, vì VieNeu đọc chữ "bổn tọa" không chuẩn.
- Xem trước khung hình không cần trình duyệt: `node render-v8.mjs <ms> <zoom>` → `output/preview-v8-<ms>.png`.

## v9: tu tiên giả thường trú tự hoạt động

- **Tý Tèo** (Thanh Y), **Người Không Buồn Cười** (Tử Vân) và **Hai Thùy** (Nguyệt Bạch) luôn ngồi trên quảng trường. Cứ 4–8 giây một người tự làm gì đó: ngự kiếm, Liên Hoa Kiếm Trận, triệu hồi Thanh Long, lĩnh ngộ bí pháp, luyện đan, vận công, luận kiếm, đột phá cảnh giới. Khi bí cảnh mở thì đa phần là đánh Huyền Giao. Mỗi hành động có hiệu ứng, âm thanh, máy quay zoom vào người đó, và có giọng tông sư đọc khi không có gì khác đang đọc (đọc sẵn 27 câu, ở `public/assets/resident/`).
- Bí cảnh giờ mở theo lịch kể cả khi không có khách. Ba người này gây sát thương thật ở máy chủ (10–16 sát thương mỗi ~5 giây), nên bí cảnh có thể thắng khi vắng. Thưởng chỉ dành cho khách đã tham chiến.
- Đây là nhân vật cảnh: không có hồ sơ, không vào Phong Vân Bảng, không tính vào số đạo hữu, không ghi vào ký sự (trừ sự kiện bí cảnh mở/thắng). Khách thật luôn được ưu tiên: khi khách vừa tương tác hoặc hàng trình diễn dài thì họ nhường lượt, và giọng của họ luôn xếp sau khách.
- Tắt trong ≋ → *Tý Tèo, Người Không Buồn Cười, Hai Thùy tự hoạt động* (theo từng trình duyệt). Đổi tên hoặc bộ áo trong `public/residents.js`, đổi hành động hoặc câu đọc trong `public/resident-acts.js`, rồi chạy `node scripts/make-idle-voice.mjs` để đọc file mới.
- Âm lượng giọng đã tách khỏi nhạc: với âm lượng tổng 30% (mặc định), giọng phát ở 90%.
- Chẩn đoán âm thanh: mỗi trang đang mở (kể cả nguồn LIVE Studio) báo tình trạng về http://127.0.0.1:4317/api/client-status (âm thanh bật chưa, có bị chặn tự phát không, lỗi gần nhất).

## v10: biết khi nào đủ tu vi

- Dưới tên mỗi người có **thanh tu vi**: màu xanh khi đang tích lũy. Khi đủ cả tu vi lẫn linh thạch, thanh chuyển **vàng nhấp nháy** và trên đầu hiện **✦ gõ dotpha**.
- Ngay lúc vừa đủ, tông sư đọc một lần: "Sư tỷ X đã đủ tu vi đột phá Trúc Cơ! Gõ đột phá để lên cảnh giới." Lên cảnh giới mới thì lần đủ tiếp theo lại được báo.
- Lệnh **`tuvi`** (hoặc `xem`, `thongtin`): hiện khung tiến độ trên cảnh, tông sư đọc phần còn thiếu, ví dụ "Tu vi 80 trên 246. Còn thiếu 166 tu vi và 10 linh thạch." Mỗi người 15 giây được xem một lần.
- Gõ `dotpha` khi chưa đủ: thay vì im lặng, game hiện và đọc phần còn thiếu (chung giới hạn 15 giây với `tuvi`).
- Follow có câu cảm ơn riêng và khung tên. Kết nối TikFinity tự bật lại sau khi khởi động lại máy chủ (lưu ở data/bridge.json).

## v11: cho người xem biết lệnh

- Dòng gợi ý dưới cảnh giờ là **bảng lệnh xoay vòng**, 6 giây đổi một lần: nhapmon nam/nu → tuluyen/hai → tuvi/dotpha → diemdanh/thả tim → hoc/ren → luyendan/dung → gioitinh. Khi bí cảnh mở thì chỉ hiện "Gõ **danh** để đánh". Sửa danh sách ở `HINTS` trong `public/app.js`.
- Tông sư nhắc lệnh bằng giọng: cứ 3 câu nói lúc vắng có 1 câu hướng dẫn (nhập môn, tu luyện/hái, tu vi/đột phá, điểm danh, học bí pháp, luyện đan).
- Người mới nhập môn với giới tính đã khai được nhắc ngay: "…Gõ tu luyện để bắt đầu tu hành."
- Gõ `dotpha` khi chưa đủ thì game hiện phần còn thiếu; gõ `tuvi` để xem tiến độ.

## v13: sân khấu sống động, chịu được vài trăm người

**Đạo diễn sân khấu** (`public/stage.js`): tối đa **24 ghế** (4×6). Ai vừa bình luận/tặng quà được lên ghế trong ~1 giây. Ngồi ít nhất 20 giây mới bị thay; tối đa 2 lượt thay mỗi giây; người thay chỗ là người im lâu nhất. Ba nhân vật thường trú chỉ ngồi khi có dưới 10 người thật, đông thì nhường ghế và ngừng tự hoạt động.

**Chuyển động** (`public/motion.js`): người mới ngự kiếm từ trời bay xuống ghế, người rời sân bay lên mây. Luyện đan bay tới lò đan, học bí pháp/rèn pháp bảo bay tới Tàng Kinh Các, đột phá vút lên trời, đánh thì bay tới yêu thú, quà và chiêu thức thì lượn. Bong bóng chữ trên đầu người vừa tương tác. Khi vắng thì khoảng 12 giây một cặp đổi chỗ. Ngân sách: tối đa 5 người bay làm việc, 8 bong bóng, 2 hoạt cảnh quà lớn cùng lúc (dư thì xếp hàng).

**Khi đông:**
- Chỉ quà, đột phá, ban phúc, follow, gợi ý có khung tên riêng (hàng tối đa 8, trình diễn nhanh hơn khi dồn).
- Việc thường có hiệu ứng nhẹ, bong bóng và **bộ đếm "10 giây qua"** trên đầu cảnh.
- Nhập môn dồn dập thì đọc gộp: "Chào mừng bảy vị đạo hữu mới…". Số đọc bằng chữ.
- Khi đông (trên 12 người), nhãn "gõ dotpha" đổi thành dấu ✦ vàng cạnh tên.

**Máy chủ:** mỗi giây chỉ gửi người đang hoạt động cộng top 100; chỉ ghi file khi có thay đổi. Dừng máy chủ đúng cách không còn làm mất trạng thái kết nối TikFinity.

**Thử tải** (chỉ vào thế giới thử nghiệm): `node scripts/load-test.mjs 300 20 60`. Kết quả 31/10: 300 người ảo, 20 sự kiện/giây; mỗi khung vẽ 7 ms; luôn 24 ghế, ≤5 người bay, ≤8 bong bóng, hàng khung tên ≤8; máy chủ 1.110 yêu cầu, 0 lỗi, chậm nhất 84 ms. Trang báo các chỉ số này ở /api/client-status.


## v14: nhân vật có động tác

Nguồn dọc: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&zoom=1.3&v=14#tiktok.studio`.

Nhập môn/chào: đứng dậy chào. Xuất chiêu/ngự kiếm: tay áo và thân xoay khi vung kiếm. Lĩnh ngộ: mở sách. Luyện đan/hái: vận tay tụ khí. Quà/trận pháp: dang tay thi pháp. Đột phá: bay lên, giơ tay, áo bay. Tư thế yên có hơi thở, tà áo và động tác giãn người luân phiên. Mọi chuyển động là lớp trình diễn, giữ nguyên sự kiện/kết nối TikFinity và dữ liệu đã lưu. `prefers-reduced-motion` tắt chuyển động nhân vật. Xem public/assets/CHARACTERS.md về asset và giới hạn rig 2D.


## v15: chuyển động mềm hơn và thêm động tác tương tác

Nguồn: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&zoom=1.3&v=15#tiktok.studio`. Tải lại nguồn để nhận module mới. Lưới liền thay khớp cắt; kiếm chiêu có lấy đà/chém/thu thế, tay áo/tóc/tà áo trễ nhịp, vẫy chào follow, tạo tim từ lượt thích, dùng đan, rèn pháp bảo, trang sách/lò đan và vòng linh khí. Tự giảm độ chia lưới khi đông người. Không thay thưởng/quà/kết nối TikFinity.


## v16: tự giảm tải nguồn phát và đổi áo theo cảnh giới

Nguồn: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&zoom=1.3&quality=auto&v=16#tiktok.studio`. Người xem TikTok chỉ nhận video, không cần bấm nút. Bạn tải lại nguồn Link một lần để áp dụng. Chế độ mặc định auto dựng tối đa 720px ngang/30fps; khi quá tải tự giảm 540px/24fps. Bản xem trong trang quản trị chỉ dựng 360px/12fps, để nhường tài nguyên cho LIVE Studio. Xuất TikTok vẫn theo độ phân giải nguồn/encoder của LIVE Studio.

Cache giữ đúng một ảnh hoạt hình cho mỗi nhân vật (tối đa32), cập nhật động tác 10–18fps, còn máy quay vẫn chuyển động theo nhịp cảnh. Sương/ánh sáng cập nhật riêng 5–12fps; bỏ blur nền DOM, giảm VFX khi chọn Nhẹ. Bản overlay không dựng lại bảng xếp hạng, danh mục và feed đang ẩn. Cập nhật giao diện gom tối đa10 lượt/giây. Server gom broadcast50ms và dùng lại một payload/mỗi thế giới cho các nguồn; thay đổi server cần khởi động lại, không tự ngắt server khi đang LIVE.

Đột phá đổi áo miễn phí: mỗi cảnh giới có đai, viền cổ, vai giáp hoặc miện riêng. Trúc Cơ/Kim Đan/Hóa Thần/Đại Thừa lần lượt mở nhóm áo khác; skin quà cao hơn được giữ, không tụt. VFX quà vẫn tính theo quà tích lũy. Chi tiết trang phục nằm trong cache nhân vật, không tăng số lượt vẽ hàng khung.

`npm test` chỉ chạy test/*.test.mjs; bài tải scripts/load-test.mjs phải chạy riêng có chủ ý, không tự bắn sự kiện demo trong mỗi lần kiểm thử.


## v17: hướng dẫn ngay trên cảnh LIVE

Bảng phía trên cảnh có hai phần: lệnh chat và phần thưởng quà, đổi mục mỗi8giây. Lệnh học/rèn/luyện đan lấy tên, giá, yêu cầu cảnh giới từ catalog; bảng quà lấy mốc/tu vi/linh thạch/linh thảo từ gifts của thế giới đang phát. Tên quà cụ thể chỉ được hiện kèm thưởng khi đã thấy sự kiện có tier tương ứng. Không tự gán giá TikTok cho tên quà. Mốc skin được ghi riêng là tổng quà tích lũy.

Bí cảnh mở chỉ xen hướng dẫn đánh boss mỗi5mục, không che hết lệnh học/rèn trong suốt bí cảnh như trước. Chữ cập nhật rời rạc, không marquee, không blur để giữ nhẹ. Nguồn: `http://127.0.0.1:4317/?overlay=1&world=live&sound=1&zoom=1.3&quality=auto&v=17#tiktok.studio`.


## v18: Đại Hộ Pháp, biên nhận quà, Top tu vi, cache nhiều lớp

- Top3 tổng tu vi và Top quà trên cảnh chỉ xét người có tương tác trong5phút gần đây, thuộc phiên đang chạy nếu TikFinity đã cung cấp tín hiệu phiên. Đây là cách xác định hoạt động; TikFinity không cung cấp danh sách đầy đủ người còn xem thụ động.
- Người dẫn quà tích lũy trong nhóm đó nhận một lần Thương Long Hộ Pháp, Hộ Pháp Thiên Kiếm (+28 sát thương) và Trấn Tông Long Ấn (+18 sát thương,+12%tu vi khi trang bị). Đồng điểm giữ người đang dẫn. Chuyển ngôi không thu hồi đồ cũ. Quà tích lũy không phải tiền nạp và không quy đổi tiền. Dữ liệu chỉ lưu trên máy này.
- Băng Phách Kiếm: ren Bang Phach Kiem (Kim Đan,420 linh thạch,12 linh thảo). Xích Diễm Kiếm: ren Xich Diem Kiem (Nguyên Anh,650,20), mở Xích Phượng Chiến Y. Cửu Tiêu Linh Châu: ren Cuu Tieu Linh Chau (Hóa Thần,900,30), mở Bạch Kim Tiên Đế. Trang bị thưởng không chế tạo miễn phí qua lệnh ren; server kiểm quyền sở hữu. skin Thuong Long Ho Phap / skin Xich Phuong Chien Y / skin Bach Kim Tien De chỉ đổi bộ đã sở hữu.
- Quà mới lưu biên nhận12lượt gần nhất/người gồm ID, giá mỗi món, số lượng và đúng tu vi/thạch/thảo đã cộng. Thông báo biên nhận tách khỏi hàng đợi TTS. Quà cũ trướcv18 không được tự dựng lịch sử hoặc cộng bù.
- Cache RAM file tĩnh tối đa32MiB + ETag/304; snapshot100ms + một payload/mỗi thế giới/loại nguồn mỗi lần broadcast50ms. Overlay nhận trường người chơi tối giản; giao diện quản trị vẫn nhận đầy đủ. Cache giọng trên đĩa tối đa400clip, dọn tối đa mỗi phút. Không cài Redis vì phần nặng nằm ở vẽ cảnh và TTS trên cùng máy.
- Sửa bộ hẹn khung hình giữ phần lẻ thời gian, tránh tụt30→20fps do làm tròn; bỏ vẽ người ngoài khung hình, giữ sự kiện và tọa độ để họ quay lại bình thường. VieNeu chạy ưu tiên BelowNormal, mặc định2luồng; hậu kỳffmpeg1luồng. Biến VAN_HAI_TTS_THREADS cho phép1–4luồng. Không thay model hay giọng đã chọn.
- Khi áp dụngv18 đã lưu trạng thái, mở bộ đệm quà TikFinity riêng trong lúc đổi process, rồi replay/dedupe bằng ID quà; không giả lập tặng quà thật. File đối soát được giữ trong data với đuôi.replayed.


## Sổ tay điều hành

Mở `http://127.0.0.1:4317/manual.html` để tìm/chép lệnh, xem giá và yêu cầu chế tạo theo cấu hình server, đối chiếu mốc quà/skin và tra12biên nhận quà mới nhất của người tham gia đang có trong dữ liệu trả về. Trang chỉ đọc dữ liệu, không gửi lệnh hoặc cấp vật phẩm. Trong Đạo dẫn có nút mở sổ tay.

