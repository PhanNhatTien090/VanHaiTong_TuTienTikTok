# Skin hắc kim — hồ sơ thiết kế, chưa đặt tên

Ngày 14/11/2026. Trạng thái: **đã lập kế hoạch và lưu đủ bốn ảnh gốc; chưa đưa skin vào danh mục nhận quà**. Tên nhân vật và tên pháp bảo để chủ game đặt sau. Mã kỹ thuật đề xuất `hac-kim-unnamed`, tên tạm trong bản xem riêng “Hắc kim — chưa đặt tên”; đổi tên sau không đổi ID/quyền sở hữu.

## Nguồn chuẩn và phần cần giữ

- [Model ngồi](references/model-seated.png): ảnh đầu người dùng gửi. Dùng tu luyện/ghế; mắt nhắm, áo giáp hắc kim, dải lụa đỏ và bạch sa.
- [Model đứng](references/model-standing.png): ảnh thứ hai. Dùng di chuyển, tỷ thí, nhận skin và khách sự kiện.
- [Thiết kế đại đao](references/concept-blade.jpg): nguồn chuẩn cho hình đao và vòng hỏa luân.
- [Thiết kế chuyển động](references/concept-aura.jpg): nguồn chuẩn cho độ sáng vàng, độ rủ tà áo và dải lụa.

Giữ nguyên mặt, tóc, giáp, tỉ lệ và hai tư thế do người dùng cung cấp. Không vẽ lại nhân vật, không bóp méo ảnh để giả hoạt ảnh. Sừng/khung kim loại phía sau đầu đã có trong model: không vẽ chồng thêm một bộ sừng nữa. Không gộp pháp bảo vào ảnh thân, vì skin 300 phải đứng độc lập không có đao.

## Ngôn ngữ hình ảnh

Nền giáp đen than `#151318`; kim loại vàng cũ `#b99b62`, lõi vàng sáng `#ffe5a0`; lửa đỏ cam `#ef421e` → `#ffae32`; bạch sa xám lạnh `#b9b5bd`. Độ sáng mạnh nằm ở hỏa luân và rãnh đao, không phủ trắng mặt/giáp. Khi thu nhỏ trên LIVE vẫn nhìn rõ mặt và đường viền hắc kim. Vòng lửa là vòng pháp khí có tiết tấu, không phải một vòng tròn neon đơn giản.

Lấy chuẩn độ hoàn thiện từ Khuy Niết Lôi Tôn, Tần Mục Hỏa Thần và hai nữ tiên 300/500 hiện tại: nhiều lớp có chủ đích, có chiêu nhận diện, có điểm bùng rồi hạ nhiệt. Bản này phải có dấu ấn **hỏa luân + đại đao nứt dung nham**, không tái dùng nguyên vòng trăng/đôi cánh của skin khác.

## Hai mốc nhận quà

| Mốc tích lũy trong cùng lượt sự kiện | Nhận và được hiển thị |
|---|---|
| 0–299 | Tiến độ; chưa cấp skin/pháp bảo |
| 300–499 | Skin đứng + ngồi, hỏa luân hai hỏa long đối xứng, trận văn dưới chân, tàn hỏa và nhịp vận công riêng. **Không có đại đao**, không có bóng đao quay nền, không có chiêu vũ khí |
| Từ 500 | Giữ skin và cấp đại đao một lần; mở hiệu ứng rãnh dung nham, đao khí, chiêu pháp bảo. Quà đúng 500 một lần nhận đủ bộ; 300 + 200 cũng nhận đủ trong cùng lượt |

Kiểm tra quyền sở hữu và đang trang bị trước khi vẽ đao. Skin vẫn có hiệu ứng xứng giá tại 300. Sở hữu pháp bảo nhưng cất đi thì không vẽ đao. Giữ quà vĩnh viễn; không lấy tiến độ của lượt cũ bù cho lượt mới. Cơ chế giá dùng chung luật 300/500 đã sửa, không thêm nhánh trao miễn phí khi nhận skin.

## Các lớp hiệu ứng sẽ làm

1. **Hỏa luân phía sau:** vành đôi chạm hoa văn hắc kim, hai hỏa long đỏ vàng đuổi nhau quanh vành như ảnh thiết kế; sáng theo một vòng tuần hoàn 6–8 giây. Đặt sau vai và khung sừng có sẵn; lõi/vầng lửa không che đầu. Cache riêng vành kim loại, đầu long, đoạn lửa để không dựng lại chi tiết mỗi frame.
2. **Trận dưới chân:** ba vòng mỏng khác tốc độ, hỏa văn có khoảng thở, vòng ngoài hiện/ẩn theo nhịp vận công 4 giây. Bản ngồi hạ thấp và nén phối cảnh đúng mặt sàn; không làm nhân vật bay lên trời.
3. **Tàn hỏa:** hạt màu hổ phách, có đầu sáng và đuôi tắt, bay từ thấp lên rồi tan. Bình thường 10–16 hạt ở bản đầy đủ; không rải mù khắp màn hình. Hào quang bạch sa chỉ dùng dải sáng phía sau có sẵn, không kéo méo tà áo PNG.
4. **Dấu nhấn vận công:** mỗi 8–10 giây hỏa văn chạy từ chân tới vành luân rồi lóe tại đỉnh, trong khoảng 0,8–1,2 giây. Vẫn thấy rõ model, không nháy toàn màn hình liên tục.
5. **Đại đao ở 500:** bản vẽ riêng RGBA, hình khối nặng và dài như ảnh: lưỡi rộng hắc kim, cạnh thép tối, sống đao có gờ/răng, hộ thủ hình thú/phù văn, rãnh đỏ cam sâu bên trong. Không thay bằng một thanh kiếm mảnh, không dùng khối chữ nhật sáng. Bản đứng: cán đặt đúng tay phải (bên trái màn hình), lưỡi chúc chéo xuống ngoài thân. Đo anchor trên PNG gốc và có lớp ngón tay phía trước để không thấy đao dán lên nắm tay. Bản ngồi: đao lơ lửng chéo một bên, giữ ngoài khuôn mặt và đùi.
6. **Chuyển động đao:** nhịp hỏa mạch chạy dọc rãnh theo đoạn; 2–3 tia lửa ở mũi/khía; bản ngồi dao động cả pháp khí rất nhẹ quanh một trục. Không scale/shear hình đao theo thời gian. Khi đánh chuyển vị trí theo tay, có vệt chém rõ hướng và điểm va chạm.
7. **Chiêu nhận diện:** hỏa luân tụ sau lưng → rãnh đao sáng từ cán đến mũi → một nhát chém chéo hắc kim với lõi đỏ vàng → vết nứt hỏa văn tại mục tiêu → tàn hỏa tắt dần. Trong sự kiện dùng avatar người tặng tại điểm tụ chiêu; không zoom người tặng và không giành sân khỏi trận đang diễn.

## Kịch bản xuất hiện và nhận quà

- Nhận skin 300, khoảng 4,5 giây: 0–0,7s trận văn tụ; 0,7–1,8s hai hỏa long mở hỏa luân; 1,8–3,4s model hiện rõ từ tối sang sáng, phất tàn hỏa; 3,4–4,5s thu về trạng thái thường. **Không gọi asset đao ở màn này.**
- Nhận pháp bảo 500, khoảng 5,5 giây: 0–1s ấn hỏa luân; 1–2,2s đại đao kết tụ; 2,2–3,8s thử một nhát chém chéo; 3,8–5,5s rãnh đao hạ sáng, biên nhận ghi đủ tên pháp bảo và quyền sở hữu. Hiệu ứng không che phần xác nhận nhận đồ.
- Nếu đang có sự kiện lớn: trao quyền ngay, dùng chiêu avatar gọn trong sân; màn biến hình lớn đợi sân trống theo hàng trình diễn hiện có.
- Âm thanh: tụ khí trầm ngắn, kim loại nặng khi đao xuất hiện, tiếng chém có lực và một impact thấp; âm đuôi lửa dịu. Dùng mixer hiện có, không chồng nhiều lớp tiếng chói hay làm nhạc nhỏ mãi.

## Danh sách tài nguyên và điểm tích hợp

- Giữ PNG gốc ở `design/skin-hac-kim/references/`.
- Xuất WebP thân: `public/assets/hac-kim-v1/standing.webp`, `seated.webp`; alpha sạch trên nền sáng/tối, chừa đủ mép lụa, chân cùng chuẩn baseline với skin khác.
- Tách sprite riêng: `flame-wheel.webp`, `fire-dragon-head.webp`, `blade.webp`, `blade-hand-front.webp` và các sprite lửa/va chạm có biên alpha thật. Không nhúng đao vào thân.
- Module đề xuất: `public/hac-kim.js` (model + trang bị), `public/hac-kim-fx.js` (vành/lửa/chiêu), `public/hac-kim-preview.html` (xem riêng ba mức 0/300/500, đứng/ngồi, nền sáng/tối, đông người).
- Đăng ký skin/visitor/artifact tại danh mục hiện có; tái dùng kiểm tra `ownsGear` và kiểm tra sở hữu thực. Thêm mốc cho `visitor-rewards.js`, hiển thị thẻ nhận quà 300/500 nhất quán. Tên và ID tách nhau để mai đổi tên không làm mất đồ.

## Trình tự thực hiện

1. Đóng khung model và baseline, kiểm alpha, xuất thân; dựng preview đứng/ngồi ở đúng cỡ LIVE trước.
2. Vẽ riêng đại đao theo thiết kế, chốt tỷ lệ và điểm cầm tay trên model đứng; chuẩn bị lớp ngón tay phía trước, kiểm tra bản ngồi.
3. Làm hỏa luân, hai hỏa long và trận văn; bổ sung nhịp vận công/tàn hỏa; kiểm 300 chưa hề có đao.
4. Làm hỏa mạch đao và chiêu chém 500, rồi màn nhận 300/500 và tiếng theo mixer.
5. Nối quyền sở hữu, tiến độ và danh mục. Kiểm các biên 299, 300, 499, 500; quà lặp; tải lại; cất/trang bị; đổi tên; đổi skin khác.
6. Xem thật ở khung 9:16/540×960 và 1080×1920, cả map sáng, map tối, tỷ thí và đông người; sửa phần bị che rồi mới bật phát thưởng trong game.

## Tiêu chí đạt để phát hành

- Nhìn rõ nhân vật ở cỡ nhỏ; mặt/tóc và giáp khớp model gốc; vành nằm sau vai, không đè mặt; chân bám sàn.
- 300 có ít nhất hỏa luân + trận chân + tàn hỏa + nhịp vận công, đã hoàn thiện độc lập. 500 thêm đúng đại đao có hiệu ứng riêng, cầm chắc tay và chém đúng hướng.
- Có pha tụ, bùng và tắt; tàn hỏa không phải các chấm ngẫu nhiên; không vẽ lại lớp chi tiết tĩnh mỗi frame. Không blur/filter toàn màn hình.
- Giảm chuyển động: giữ model, vành tĩnh và ánh rãnh nhẹ; không nháy. Chế độ nhẹ giữ hỏa luân nhận diện + đao nếu sở hữu, giảm hạt/nhịp phụ. Trên 30 người giữ giới hạn renderer hiện có.
- Không có đao hoặc chiêu pháp bảo ở 300/499 dù dữ liệu client cũ; không trao lặp ở 500 sau tải lại; không làm sai ownership chuyển LIVE–web.

Tên chính thức được bổ sung sau khi chủ game đặt; không tự lấy tên từ ảnh tham khảo.
