# Kế hoạch: Ngũ Đường Chiến Trường v2 — 15/11/2026 (USER DUYỆT HẾT 15/11 — ĐÃ LÀM)

Mục tiêu: trận 5 Đường giống ảnh kênh mẫu "Tiên Ma Đại Chiến": avatar người chơi **di chuyển thật trên bản đồ**, tự tìm **kẻ địch gần nhất**, vào tầm thì **tung chiêu thật lên đúng người đó**, có số sát thương bay lên, BẠO KÍCH, bị hạ thì về trại hồi sinh.

## Hiện trạng
- `hall-war.mjs` + `public/hall-war.js` (bản đang chạy): 5 trại đứng yên, mỗi Đường chỉ hiện 3 người luân phiên, chiêu bay ngẫu nhiên theo cảnh giới gần nhau. Không ai di chuyển.
- Có sẵn: ảnh map `public/assets/ngu-duong-chien-truong/map.webp` (5 trại ngũ giác + Trung Ương Chiến Đài, 1024×1536) và bản nháp backend `HALL-WAR-V2-WIP.mjs.txt` của phiên trước (vị trí thật, lưới ô 160 px tìm địch gần nhất, giữ đài, hồi sinh). Chưa có frontend, chưa test.

## Học từ ảnh mẫu
1. Avatar tròn (ảnh TikTok) + viền màu phe + tên nhỏ + thanh máu dưới chân, rải khắp map, đứng thành cụm giao tranh.
2. Chiêu to rõ: bàn tay vàng khổng lồ, vòng trận, cầu lửa. Số `BẠO KÍCH -546` màu cam bay lên.
3. Dòng tin hạ gục trên đầu ("A ✕ B"), băng buff phe ("SONG KIẾM HỢP BÍCH +25% DMG").
4. Bảng "Chiến Thần" bên trái (top hạ gục), thanh điểm + đồng hồ trên cùng, bảng quà → hiệu ứng bên phải, dòng lệnh dưới đáy.

## Thiết kế

### A. Luật trận (server, `hall-war.mjs` — lấy từ bản nháp + bổ sung)
- Tọa độ logic 900×1600 khớp ảnh map. Mỗi giây (nhịp server): ai đang sống tìm kẻ địch gần nhất (lưới ô, không O(n²)) → chạy tới 78 px/s → vào tầm thì ra chiêu theo hồi chiêu của Đường.
- Chiêu theo Đường (đã có trong bản nháp): Kiếm trận (tầm 190), Vạn Bảo (210), Đan Hỏa (200), Sơn Ấn (150, đánh mạnh), Thần Mộc (230, hồi máu đồng đội).
- Máu 100, sát thương theo tu vi nhưng nén log (7–20) → người cảnh giới thấp vẫn đánh được.
- **Mới:** BẠO KÍCH 15% ×1,8; **Hợp kích**: ≥2 người cùng Đường đánh cùng mục tiêu trong 1,5 s → +25% (hiện băng chữ như mẫu); chuỗi hạ gục 3/5 → tên + giọng tông sư (giãn ≥8 s).
- Bị hạ: mờ đi, bay về trại, 5 s hồi sinh + khiên 1,5 s. Không mất gì ngoài trận.
- Trung Ương Chiến Đài: Đường đông người đứng trong đài hơn hẳn → +6 điểm/giây. Hết đối thủ gần thì mọi người tiến về đài → luôn có giao tranh ở giữa.
- Lệnh: `6` / `đánh` = lao lên + chiêu mạnh ×1,5 (hồi 3,5 s). Đề xuất thêm `đánh @tên` = khóa mục tiêu 10 s (như "pk @tên" của mẫu).
- Thời lượng: tập hợp 30 s + đánh 3 phút + vinh danh 14 s. Điểm/thưởng/bảng tuần giữ như hiện tại.

### B. Quà trong trận (đang có sự kiện → chỉ luật này, không quà mặc định)
| Quà | Hiệu ứng |
|---|---|
| 1–29 coin | Cuồng hóa: +50% sát thương, chạy nhanh 4–16 s |
| 30–98 | Tuyệt chiêu của Đường, đánh lan 3 người quanh mục tiêu |
| 99–299 | Tuyệt chiêu lớn, lan 6 người |
| ≥300 | Đại tuyệt chiêu toàn cảnh (bàn tay/kiếm trận khổng lồ), lan 10 người, vòng 260 px |
Không đổi giá quà. Thẻ luật quà góc phải dùng ảnh quà thật như các sự kiện khác.

### C. Hình (overlay, viết lại `public/hall-war.js`)
- Nền: `map.webp` (thay ảnh tournament-arena đang dùng).
- Avatar: tròn bán kính ~22 px, viền màu Đường, tên 13 px Segoe UI đậm viền đen (theo luật chữ 15/11), thanh máu 40 px. Ảnh avatar vẽ sẵn vào bitmap 2× (cache), mỗi khung chỉ `drawImage`.
- **Di chuyển mượt:** server gửi vị trí 1 lần/giây → client nội suy tuyến tính giữa 2 lần nhận (trễ 1 nhịp), nhún nhẹ khi chạy, quay mặt theo hướng đi.
- Chiêu: 5 kiểu đạn theo Đường (kiếm bay, bảo vật xoay, cầu lửa tím, ấn núi rơi, dây leo quất), trúng thì nổ vòng + số `-23` trắng; BẠO KÍCH chữ cam to; hạ gục chữ đỏ + avatar xám bay về trại.
- Tuyệt chiêu quà ≥300: hình to giữa vùng giao tranh 1,5–2 s, **mỗi Đường 3 biến thể ngẫu nhiên + lật/xoay/màu**, cách nhau ≥20 s, không lặp y hệt (luật chống "reproduced content").
- HUD: thanh 5 Đường + điểm + đồng hồ trên cùng; dòng tin hạ gục 3 dòng; bảng "Chiến Thần" (top 6 hạ gục) bên trái; bảng hướng dẫn dưới đáy (lệnh + quà). Lúc trận chạy ẩn Thiên Bảng/Top quà/bảng thường như Chính Ma.

### D. Đông người (vài trăm người)
- Server: lưới ô → mỗi nhịp ~O(n). Mục tiêu: 300 người < 5 ms/nhịp (sẽ đo bằng test). Gói gửi xuống chỉ ~10 trường/người, fx 4 s gần nhất, tối đa 64.
- Overlay: ≤40 người vẽ đủ; 40–80: tên chỉ hiện cho top 3 mỗi Đường + người vừa hạ gục, số sát thương chỉ hiện BẠO KÍCH/hạ gục, tối đa 12 chiêu cùng lúc; >80: avatar nhỏ lại, chỉ vẽ đạn đơn giản; >50 vẫn theo luật "bỏ hiệu ứng, ưu tiên nét" (tuyệt chiêu quà vẫn hiện vì là phản hồi quà).

### E. Các bước làm (trong worktree riêng, không đụng file dở của phiên khác)
1. Backend từ bản nháp + BẠO KÍCH/hợp kích/khóa mục tiêu/chuỗi hạ gục; test: tìm địch gần nhất đúng, di chuyển, tầm đánh, hồi sinh, giữ đài, quà lan, 300 người < 5 ms.
2. Frontend: map + avatar + nội suy di chuyển + 5 kiểu chiêu + số sát thương.
3. HUD + bảng Chiến Thần + tin hạ gục + bảng hướng dẫn + thẻ luật quà; giọng tông sư.
4. Tuyệt chiêu quà 3 biến thể/Đường.
5. QA: server thử 4399 với 10 / 40 / 150 người giả, tự xem ảnh + GIF chuyển động, đo FPS; gửi ảnh cho user duyệt.
6. Test toàn bộ → commit → push → restart an toàn → user làm mới nguồn Link.

## Cần user chốt
1. Thời lượng trận 3 phút (hiện 2 phút)?
2. Thêm lệnh `đánh @tên` khóa mục tiêu?
3. Mốc quà ở bảng B được chưa?
4. Có làm từng bước rồi duyệt ảnh mỗi bước, hay làm hết 1–4 rồi duyệt một lần?

## Đã triển khai (15/11)
- User chốt: 3 phút, có `đánh @tên`, mốc quà như bảng B, làm hết rồi duyệt một lần.
- Chỉnh sau QA: tu sĩ kéo về Chiến Đài, chỉ giao chiến khi địch trong ~215 px (trước đó cả trận đánh quanh trại); giữ đài +10/giây; giãn cách 30 px để đám đông thành vòng vây; cân tầm chiêu 195–210 (Tuần Sơn tầm ngắn cũ gần như không phá trận được); lúc trận chạy ẩn thẻ xem tu vi, Vân Đài chờ lượt, không tự mở hồng bao/câu đố.
- Bố cục chung: `public/hall-war-layout.js`. QA: `node scripts/qa-hall-war-v2.mjs <port> <số người> [full]` → `output/qa-hall-war-v2-<n>/`.
