
# Vân Hải Tông · Cinematic VFX/SFX V2

HEAD khi bắt đầu là `c3d9dd8ae9f4991bb4191359e8794db035271b9c`. Worktree có sẵn sửa đổi ở gameplay, quản lý, giao diện và skin Hắc Kim. Benchmark A/B bên dưới dùng cùng checkout và cùng dữ liệu mô phỏng, đổi lựa chọn **Phiên bản** trong preview. Bộ kiểm thử tham chiếu dùng bản xuất sạch của HEAD.

## Ba cảnh mẫu

| Cảnh | Hình và nhịp | Âm |
| --- | --- | --- |
| Luyện Hư | Giữ rạn gương và nghịch chuyển. Tụ linh tại đan điền, co lõi 110 ms, sóng mở từ tâm lúc 17,25 s, pháp trận và hạt tàn sau hiện thân. Skin đổi tại 17,55 s. | Bản phối Hư Không dùng một tiếng trầm ngắn, crack kính, cộng hưởng và dư âm. Cắt các lớp nổ trùng mốc và lớp boost ở cảnh này. |
| Quà 5.000 coin | Giữ tier Song Long Song Phượng 13 s. Trận ấn vàng, cầu tụ và sóng tại 4,16 s. Nhịp thứ hai tại 8,58 s dùng ấn nâng và hai vệt ngang. | Cue Long Phượng và tiếng cộng hưởng riêng cho nhịp hai. |
| Chính Ma Đại Chiến | Ấn tròn vàng lam và ấn lục giác tím. Trợ lực bay từ phe tặng đến chiến tuyến theo mốc cũ. Lật kèo có hai luồng hội tụ trong 260 ms rồi xung ngang. Ấn phe thắng nằm dưới tiêu đề. | Hai âm sắc phe, cue mở trận, cue trợ lực theo điểm chạm và cue chiến thắng. |

## Các đường sự kiện đã nối

- Nhập môn, tu luyện, học/rèn, vinh danh và hiệu ứng nhận skin thường dùng các tổ hợp ngọc, pháp ấn hoặc tiên quang. Cảnh skin riêng tiếp tục dùng hoạt cảnh tương ứng.
- Boss có vòng xung tại pha strike và Lôi Hổ có tia sét ngắn. Luyện đan dùng ấn lửa khi trợ lực. Mê Cung có cặp cổng khác màu, vệt dịch chuyển và chime.
- Đua phi kiếm dùng vệt ảnh đã tạo sẵn thay cho các đường xoắn trên mỗi người. Linh thú dùng ấn triệu hồi đã cache và giảm hạt phụ. Nhánh đột phá dùng sân khấu chung thay các hạt hội tụ và vết nứt ở cú nổ bằng lõi nén và sóng cục bộ. Giảm chớp tắt lớp chớp phủ màn hình của Thiên Đạo.
- Luận Kiếm dùng vòng xung nhỏ ở Linh Châu, kết duyên có ấn vàng và tiên quang tím, mốc tháp có cue chuông, Hội Gõ Đầu có sóng nhỏ tại điểm gõ. Tinh Hà có vệt sao và Hoa Vũ có quầng nền tím.
- Các mô-đun gameplay, phần thưởng, tier quà và quyền sở hữu dùng dữ liệu hiện hành.

## Tài nguyên, rung và âm thanh

VFX mới tạo bằng Canvas trong `public/cinematic-vfx.js`. Năm bảng màu × ba ảnh 192×192 cho glow, dấu ấn và vệt năng lượng. Dung lượng RGBA danh nghĩa khoảng 2,11 MiB. Cache được chuẩn bị khi tạo Scene. Sóng dùng path ellipse, hạt lấy từ seed và thời gian. Mỗi cảnh chính giữ mức hạt tại lúc bắt đầu, cảnh Chính Ma ưu tiên lật kèo hơn trợ lực khi hai hiệu ứng trùng nhau. Bảng dưới là trần của **sóng xung kích V2**, các hoạt cảnh cũ có ngân sách riêng.

| Chất lượng | Hạt kể cả vệt | Vòng | Glow tác động |
| --- | ---: | ---: | ---: |
| Nhẹ | 6 | 1 | 1 |
| Cân bằng | 12 | 2 | 1 |
| Điện ảnh | 20 | 2 | 1 |

`cameraImpulse()` dùng hai dao động trơn và suy giảm, với ramp vào khoảng 24 ms. Off, Low, Medium và High dùng hệ số 0, 0,38, 0,68 và 1. Giảm chuyển động tắt rung. Chất lượng Nhẹ dùng hệ số 0,56 cho các cue V2 đang dùng. Trần hỗn hợp 10 đơn vị mỗi trục. Chính Ma rung vùng tác động, Luyện Hư rung lớp nghi thức và quà dùng camera cảnh.

| Rung | Biên độ gốc | Thời lượng |
| --- | ---: | ---: |
| Minor | 2 | 105 ms |
| Medium | 4 | 165 ms |
| Major | 7 | 240 ms |
| Legendary | 9 | 285 ms |

Âm nguyên bản tổng hợp tại chỗ trong `public/cinematic-sfx.js`, có ghi ở `public/assets/AUDIO.md`. Sáu preset dùng bộ đệm mono 24 kHz, tối đa ba cue cùng lúc và tối đa 15 nguồn V2. Bộ trộn V2 dùng lại AudioContext và bus SFX hiện có. Cue sắp giờ theo đồng hồ AudioContext, chống phát lặp theo ID, bỏ cue quá hạn và ngắt kết nối khi hết. VieNeu và BGM là phần tử media riêng. Duck nhạc hiện hành vẫn điều phối với thoại, cue V2 khởi phát khi đang đọc dùng hệ số 0,63. Nhạc và thoại cần được đo ở đầu ra cuối của LIVE Studio.

| Preset | Màu âm | Hạ trầm | Dư âm thiết kế |
| --- | --- | --- | ---: |
| Hư Không | Kính, cộng hưởng Mi/sol của nghi thức | Có | 1,32 s |
| Long Phượng | Chuông kim và hơi nóng | Có | 1,18 s |
| Cộng hưởng | Chuông hòa âm ở nhịp hai | Không | 0,85 s |
| Chính Đạo | Chuông sáng, quãng 5 | Có | 0,76 s |
| Ma Đạo | Họa âm thấp, âm sắc căng | Có | 0,8 s |
| Ngọc | Âm sáng và ngắn cho dịch chuyển | Không | 0,42 s |

## Thiết lập nguồn Link và preview

Trang quản lý lưu chất lượng, rung, giảm chuyển động và giảm chớp qua POST cục bộ. Nguồn Link nhận qua SSE hiện có, theo từng world. `quality=auto` trên URL dùng lựa chọn quản lý. Giá trị URL cụ thể `light`, `balanced`, `high` và `shake` vẫn là override. Trang quản lý đọc lại cấu hình hiệu lực, ngân sách, lý do giảm chất lượng và FPS từ báo cáo của nguồn.

Mở [event-vfx-preview.html](public/event-vfx-preview.html) trên máy chủ thử, chọn nhóm, cảnh, đoạn, chất lượng và mã dựng lại. Dùng **Trước nâng cấp** và **V2** với cùng seed để A/B. Bật **Âm thanh** rồi phát thử nếu muốn nghe, hoặc tắt từng lớp âm/hình. 500 hồ sơ mô phỏng dùng 28 nhân vật hoạt động trong thiết lập cuối. Preview dùng dữ liệu trong trang.

[Ảnh so sánh ba cảnh](output/cinematic-vfx-v2/so-sanh.jpg) theo cặp trước/sau từ trái sang phải. [Chuỗi ảnh Luyện Hư](output/cinematic-vfx-v2/luyen-hu-cac-moc.jpg) tại −120, +30, +200, +500 và +1.050 ms quanh cú nổ. Ảnh riêng và dữ liệu đo nằm trong `output/cinematic-vfx-v2/`. Chuỗi này là ảnh tĩnh.

## Benchmark và kiểm thử

Chrome headless, canvas 1080×1920, 20 hồ sơ, Balanced, tắt âm. Các lượt chụp ảnh tách khỏi lượt đo. Đây là các cửa sổ ngắn trong preview, có thể dao động theo tải máy. JS là chi phí toàn bộ `drawFrame()`, gồm logic sân, nhân vật và VFX. Số cache/allocations là của CharacterFrames, không phải toàn bộ heap.

| Kịch bản | FPS trước → sau | Frame P50/P95/P99 ms trước → sau | JS P95 ms | LoAF trước → sau |
| --- | --- | --- | --- | --- |
| Luyện Hư, đoạn nổ | 21,0 → 21,2 | 44,3/111,1/133,4 → 44,2/94,2/105,6 | 56,5 → 48,9 | 6 → 9 |
| Quà 5.000 | 23,8 → 24,0 | 39,3/44,6/50,1 → 39,4/44,7/44,8 | 5,3 → 6,1 | 0 → 0 |
| Chính Ma, 12 nhân vật vẽ | 23,1 → 23,3 | 44,0/44,9/127,9 → 39,7/45,0/122,9 | 8,1 → 10,0 | 6 → 6 |

Bộ JSON lưu các lượt riêng với 1/10/20/30/50/80/500 hồ sơ và cache hit/miss, bytes, allocations, frame percentiles và số hiệu ứng Scene. Ở lượt đua 30 hồ sơ, V2 trước khi thay toàn bộ vệt nền có một mẫu 11,7 FPS. Sau tối ưu, bản cũ có một mẫu hợp lệ ở 17,7 FPS, ba mẫu V2 ở 21,0–24,0 FPS. Hai mẫu cũ trống bị loại và chưa đủ dữ liệu để suy rộng. Vẫn có khung chậm. Kiểm thử Link phủ khung 1080×1920, 720×1280 và 540×960, DPR 1 và 2, với giới hạn backing store hiện hành. Các lượt preview hai kích thước nhỏ và kiểm tra viewport không có exception JavaScript. Đã kiểm tra HTTP lưu cấu hình, dữ liệu tách theo world và nguồn trình duyệt dùng thiết lập đồng bộ dù URL có quality=auto.

Đo OfflineAudioContext 48 kHz qua bus SFX, 25 s, cùng preset volume, không BGM/VieNeu. Đỉnh cú nổ Luyện Hư giảm **−3,77 → −9,71 dBFS**. RMS toàn đoạn **−25,14 → −32,01 dBFS**. Không có mẫu phi hữu hạn. Chưa đo true peak hoặc nghe kiểm trong bản trộn LIVE Studio.

`npm run check` qua. 22 kiểm thử tập trung qua, bao gồm timeline, cue, rung, hạt, giảm chớp, giảm chuyển động, crowd 500 hồ sơ và khung hình. Lượt full suite gần nhất có 653/663 qua. Chín lỗi trùng bản sạch HEAD. Lỗi thứ mười ở `simple-play` kiểm số dòng của hướng dẫn đã được sửa sẵn trong worktree trước công việc này. Kết quả chi tiết từ cửa sổ đo lưu trong thư mục đầu ra.

## Phạm vi còn lại

Chưa có redesign riêng cho toàn bộ các nghi thức đột phá chuyên biệt và khách mời. Vân Hải Tháp, Luận Kiếm, kết duyên, Hoa Vũ, Tinh Hà Lưu Tinh và Hội Gõ Đầu mới nâng các cue nêu trên. VFX/SFX V2 mới được nối như danh sách trên. Bộ đo chưa tách JS VFX ra khỏi JS toàn khung, chưa có số cấp phát heap, số audio node của cả bản trộn, bài thử nhiều quà liên tiếp hoặc VieNeu đồng thời. Chưa có chứng nhận định lượng chớp sáng cho mọi cảnh theo [WCAG 2.3.1](https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html). Chưa xác nhận FPS, true peak, hoặc tiếng rè khi qua bộ trộn/encoder TikTok LIVE Studio.

Điểm nối chính ở `Scene.addEffect()`, `Scene.cueGiftSpectacles()`, `Scene.impactCamera()`, `drawLuyenHuAwakening()`, `drawGiftSpectacle()`, `drawWar()`, `CultivationAudio.scheduleRitual()` và `CinematicSfx.schedule()`. Thiết lập nguồn ở `visual-preferences.js`, `app.js` và `server.mjs`. Không có push, deploy, restart LIVE hay thao tác lên dữ liệu người chơi trong đợt này.
