# KẾ HOẠCH TỌA KỴ — 16/11/2026 (bản nháp, chờ user duyệt)

## 1. Ý tưởng (theo lời user)
- **Tọa Kỵ** là một hệ riêng, không phải phi kiếm, và không dính tới vật cưỡi đua phi kiếm đang có (`race-mounts.js`, giữ nguyên).
- Tọa kỵ đi theo người chơi giống pháp bảo và linh thú. Người chơi ngồi trên tọa kỵ khi tu luyện trên sân và khi lên Lôi Đài.
- Có nhiều kiểu tọa kỵ, không chỉ thú: mây, thuyền, chiếc lá, rồng, rắn, bọ…
- Mỗi tọa kỵ tăng nhẹ vài chỉ số. Tọa kỵ VIP và Thần tăng thêm % tu luyện.
- Cách nhận: vào sự kiện **Tọa Kỵ Bí Cảnh** để nhặt **Linh Châu** (viên ngọc; truyền công đủ giờ thì châu vỡ, tọa kỵ hiện thân — user chốt 16/11), rồi gõ **truyencong** để truyền công vào châu, tốn linh thạch. Người chơi không biết trước mình sẽ ra con gì.
- Có 2 loại châu: châu xanh và châu tím. Linh Châu tím (VIP) dễ ra đồ ngon hơn. Tặng quà lớn thì nhận châu tím.
- **Trên LIVE không nói hay ghi chữ "ngẫu nhiên" hay "tỷ lệ".** Chỉ đọc kiểu: "X nhận Linh Châu · truyền công 30 phút" và "Linh Châu vỡ · Cân Đẩu Vân hiện thân".

## 2. Danh sách 10 tọa kỵ đầu tiên (tên đặt tạm, user sửa được)

| # | Bậc | Tên | Hình dạng | Tăng chính (sao 1) |
|---|---|---|---|---|
| 1 | Thường | Cân Đẩu Vân | đám mây vàng | Đua phi kiếm +4% tốc |
| 2 | Thường | Phiêu Diệp | chiếc lá ngọc lớn | Linh thạch +8% |
| 3 | Thường | Mộc Lan Chu | thuyền gỗ nhỏ | Chính Ma +4% trượng |
| 4 | Thường | Thanh Lân Xà | rắn xanh | Tỷ thí +3% sức mạnh |
| 5 | Thường | Kim Giáp Trùng | bọ cánh cứng vàng | Linh thạch +5%, tỷ thí +2% |
| 6 | VIP | Thất Thải Tường Vân | mây 7 màu | Đua +6%, linh thạch +10%, tu luyện +2% |
| 7 | VIP | Lưu Ly Họa Thuyền | thuyền hoa có đèn lồng | Chính Ma +7%, linh thạch +10%, tu luyện +2% |
| 8 | VIP | Huyền Minh Cự Mãng | mãng xà đen có sừng | Tỷ thí +6%, Chính Ma +5%, tu luyện +2% |
| 9 | Thần | Cửu Thiên Thanh Long | rồng xanh | Mọi mục +8%, tu luyện +4% |
| 10 | Thần | Côn Bằng | cá lớn hóa chim bằng | Mọi mục +8%, tu luyện +4%, linh thạch +15% |

- **Chỉ tọa kỵ đang cưỡi mới có tác dụng.** Gõ `toaky 1–10` để cưỡi con mình có, `toaky tat` để xuống. Mỗi người chỉ cưỡi 1 con một lúc.
- **Ra trùng con đã có:** con đó lên sao. Có 5 sao, mỗi sao cộng thêm khoảng 20% chỉ số của sao 1. Như vậy châu luôn có giá trị, không bao giờ "ra trùng là phí".
- **Giới hạn:** tu luyện tối đa +6% (Thần 5 sao), các mục khác tối đa +15%. Phần tăng tu luyện **không áp vào thưởng sự kiện** (nguồn `'reward'`), để không lặp lại vụ lệch thưởng hôm 09/11.
- **Chỗ cắm chỉ số vào code:**
  - tỷ thí: sức mạnh trong `arena.mjs`
  - Chính Ma: số trượng mỗi lần đẩy trong `sect-war.mjs`
  - đua: `raceBoost` / tốc độ trong `sword-race.mjs`
  - linh thạch: tham số `stones` trong `gain()` của `engine.mjs`
  - tu luyện: `gain()` với nguồn `cultivate` / `free`

## 3. Châu và truyền công (cách chọn kết quả)
Dùng cách các game gacha vẫn làm: **bảng trọng số theo bậc + bảo hiểm (pity)**. Chọn bậc trước, rồi chọn đều một con trong bậc đó.

| Châu | Thường | VIP | Thần |
|---|---|---|---|
| Linh Châu xanh (thường) | 88,95% | 11% | **0,05%** |
| Linh Châu tím (VIP) | 50% | 42% | 8% |
| Linh Châu vàng (Thần) | — | — | **100%** (chỉ có khi tặng ≥1.000 coin) |

- **Tỉ lệ chỉ nằm trong code và sổ tay.** Overlay, giọng đọc và bảng hướng dẫn không bao giờ hiện tỉ lệ (user chốt 16/11). Bậc chỉ hiện bằng nhãn: Thường / VIP / Thần.
- **Bảo hiểm** (đếm riêng cho từng người, lưu trong `p.mountPity`, cũng không hiện trên LIVE):
  - Khai liền 20 châu mà chưa ra con VIP nào thì châu tiếp theo chắc chắn ra ít nhất VIP.
  - Khai liền 200 châu mà chưa ra con Thần nào thì châu tiếp theo chắc chắn ra Thần. Mốc này tạm đặt, để hợp với tỉ lệ 0,05%.
  - Linh Châu tím (VIP) được tính 3 lượt vào bộ đếm Thần.
  - Linh Châu vàng (Thần) không tính vào bộ đếm.
- **Server tự quay**, dùng `crypto.randomInt`, không để máy khách quay. Mỗi lần truyền công ghi log vào `data/audit/mounts-live-*.jsonl` để soi gian lận (theo `SOI-BAT-THUONG.md`).
- **Giá truyền công (user chốt 16/11: châu càng xịn càng tốn):** châu xanh 300, châu tím 800, châu vàng 2.000 linh thạch (tạm đặt, chỉnh theo buổi LIVE). Tham khảo: người chơi hoạt động 7 ngày có trung vị 2.030, nhóm 90% là 3.245.
- **Truyền công (user chốt 16/11):** truyền công không ra ngay. Châu phải được truyền công đủ thời gian mới vỡ.

  | Châu | Thời gian truyền công |
  |---|---|
  | thường | 30 phút |
  | VIP | 1 giờ |
  | Thần | 2 giờ (tạm đặt) |

  - Gõ lệnh mở là trừ linh thạch ngay và bắt đầu đếm giờ. Mỗi người chỉ truyền công **1 châu một lúc**; châu khác nằm chờ.
  - Giờ chạy theo giờ thật, kể cả khi người chơi đã rời LIVE.
  - Xong giờ: người đó đang có mặt trên LIVE thì mở luôn trên sân. Nếu đã rời thì giữ lại, lần sau người đó vào LIVE hoặc gõ lệnh mới mở (để người ta được xem màn truyền công của mình).
  - Trên sân: người đang truyền công có vòng sáng nhỏ quanh châu cạnh chân, kèm số phút còn lại (chỉ hiện khi sân ≤30 người).
- **Lệnh:**
  - `truyencong`: truyền công 1 châu xanh.
  - `truyencong vip`: truyền công 1 châu tím.
  - `truyencong than`: truyền công 1 châu vàng.
  - `linhchau`: xem mình đang có bao nhiêu châu và châu đang truyền công còn bao lâu.
- **Màn truyền công trên sân:** châu sáng dần, nứt rồi vỡ, tọa kỵ hiện thân, ánh sáng theo bậc (Thường xanh, VIP tím, Thần vàng kèm tiếng nổ và giọng đọc). Khi nhiều người mở cùng lúc thì gộp vào một dải nhỏ góc màn hình. Chỉ con Thần mới được màn lớn, tối đa 1 lần / 60 giây và có biến thể, đúng luật không lặp y hệt.

## 4. Sự kiện Tọa Kỵ Bí Cảnh (cách nhận châu)
Màn hình nhẹ giống Ngũ Đường Giao Lưu v2: mỗi người chơi là một **ô avatar tròn** trên một bản đồ.

- **Diễn biến 1 lượt, khoảng 6 phút:**
  1. **Tuyển người (30 s):** gõ `bicanh` để vào. Ai gõ lệnh đánh lúc sự kiện đang chạy cũng được vào luôn.
  2. **3 làn yêu thú (mỗi làn khoảng 80 s):** yêu thú bò từ mép bản đồ vào giữa. Avatar tự đánh con gần nhất, giống tu sĩ trong Ngũ Đường. Lệnh `danh` hoặc `6` cho lao lên đánh mạnh, có hồi chiêu.
  3. **Thú vương (khoảng 90 s):** một con boss lớn, cả sân cùng đánh. Hạ được thì cả sân có thưởng.
  4. **Bảng vinh danh (15 s).**
- **Rơi châu (user chốt 16/11):**
  - **Mặc định mỗi người nhận 1 châu xanh mỗi lượt** nếu góp đủ sát thương.
  - **Linh Châu xanh (thường) thêm:** chỉ dành cho người sát thương cao (top sát thương Thú vương, hoặc vượt mốc sát thương lớn). Tặng quà làm sát thương mạnh hơn nên dễ lọt top hơn. Đây là "có khả năng", không phải chắc chắn.
  - **Quà, tính tổng coin của người đó trong 1 lượt bí cảnh, lấy mốc cao nhất đạt được:**

    | Tổng quà | Nhận được |
    |---|---|
    | ≥300 coin | 1 Linh Châu tím (VIP) |
    | ≥500 coin | 2 Linh Châu tím (VIP) |
    | ≥1.000 coin | 1 Linh Châu vàng (Thần), chắc chắn ra Tọa Kỵ Thần |

    Phần này là châu thêm, ngoài 1 châu xanh mặc định.
  - Giọng đọc chỉ báo kết quả, ví dụ "X nhận Linh Châu vàng (Thần) · gõ truyencong để mở". Không đọc mốc quà để mồi.
- **Tim:** vẫn tính vào sát thương tự động như "vận công", có giới hạn theo heart gate (khoảng 2 tim/giây/người). **Bảng hướng dẫn và giọng không ghi kiểu "thả tim để nhận châu".** Chỉ báo kết quả, ví dụ "X nhặt được Châu tọa kỵ".
- **Quà:** đổi thành chiêu, giống Ngũ Đường:

  | Quà (tổng coin một lần) | Hiệu ứng |
  |---|---|
  | 1–29 coin | cuồng hóa |
  | 30+ coin | chiêu lan |
  | 99+ coin | đại chiêu |
  | 300+ coin | đại chiêu (châu xem mục "Rơi châu") |

  Theo luật quà đã chốt: đang có sự kiện thì chỉ áp luật quà của sự kiện, không cộng quà mặc định.
- **Nhịp sự kiện:** mở tay từ tab Sự kiện, thêm tùy chọn để tự mở trong vòng xoay sự kiện. Dùng chung `stage-lock.mjs` để không đè lên Chính Ma, đua phi kiếm… Mê cung cũ vẫn giữ.
- **Vài trăm người:** dùng lại cách của `hall-war.mjs`: lưới ô 160 px để tìm mục tiêu, giới hạn số hiệu ứng (fx), avatar vẽ sẵn vào cache. Trên 50 người thì chỉ vẽ avatar và thanh máu quái.
- **Bảng hướng dẫn:** khi bí cảnh chạy thì ẩn các bảng khác và hiện hướng dẫn: `bicanh` để vào · `danh` để đánh · quà thành chiêu · `truyencong` để truyền công.

## 5. Hiển thị tọa kỵ ngoài sự kiện
- **Trên sân thường:** người chơi ngồi trên tọa kỵ, nhân vật nhích lên đúng chỗ ngồi của từng con (mỗi con có số `deck` riêng). Tọa kỵ chiếm thêm chỗ, nên giữ trống ghế 2 bên giống luật skin lớn trong `live-cinema.js`.
- **Thay phiên với pháp bảo và linh thú** (`follower-turn.js`). Đề xuất: linh thú phần lớn thời gian, tọa kỵ 3 phút, pháp bảo 1 phút trong mỗi vòng 10 phút. Tọa kỵ Thần thì luôn hiện.
- **Lôi Đài:** khi tỷ thí, đấu thủ ngồi trên tọa kỵ của mình.
- **Sân đông:** trên 30 người chỉ hiện tọa kỵ Thần; trên 50 người tắt hết, chỉ để hình nhân vật (luật đã chốt).
- **Bản web:** giai đoạn sau.

## 6. Ảnh cần vẽ
- 10 tọa kỵ, nền trong suốt, góc 3/4 nhìn ngang, phong cách donghua 3D giống ảnh `race-mounts-v1`. Mỗi tấm 3 ô, tổng 4 tấm.
- 3 Linh Châu (xanh, tím, vàng), mỗi châu 3 khung: nguyên, nứt, vỡ.
- Bản đồ Bí Cảnh 1024×1536 và 4–5 con yêu thú. Ưu tiên dùng lại ảnh quái có sẵn (`boss-atlas.png`), đúng luật "giữ nguyên model quái có sẵn".
- Ảnh do Codex vẽ (`codex exec`, image_gen). Tự xem trước, rồi gửi user duyệt mới cài.

## 7. Dữ liệu và file
- Người chơi:
  - `p.mounts = {id: {stars, at}}`
  - `p.mount` (con đang cưỡi)
  - `p.mountOrbs = {normal, vip}`
  - `p.mountPity = {vip, divine}`
- Sự kiện: `w.mountRealm` (giai đoạn, quái, người tham gia, sát thương), lưu chung `live.json`.
- File mới:
  - `mounts.mjs`: bảng tọa kỵ, quay châu, lệnh, chỉ số
  - `mount-realm.mjs`: sự kiện
  - `public/mounts.js`: dữ liệu dùng chung với overlay
  - `public/mount-art.js`: vẽ tọa kỵ và màn truyền công
  - `public/mount-realm.js` + `.css`: màn hình sự kiện
  - test `mounts.test.mjs`, `mount-realm.test.mjs`
- Sửa: `engine.mjs` (lệnh, gain, quà theo sự kiện), `arena.mjs`, `sect-war.mjs`, `sword-race.mjs`, `stage-lock.mjs`, `server.mjs` (API mở sự kiện), `public/scene.js`, `public/live-cinema.js`, `public/follower-turn.js`, `public/social-ui.js` (nút mở sự kiện), trang quản lý (xem và tặng tọa kỵ cho người chơi).
- Đồng bộ web: thêm các trường mới vào danh sách đồng bộ của `web/cloud`, để khi người chơi qua web rồi về lại LIVE không bị mất tọa kỵ.

## 8. Test bắt buộc
- Quay 1 triệu lần, kiểm tỉ lệ từng bậc lệch dưới 0,3%. Bảo hiểm VIP và Thần chắc chắn kích hoạt đúng lượt.
- Không đủ linh thạch thì không mở được và không mất châu. Ra trùng thì lên sao, tối đa 5 sao, quá 5 sao thì đổi ra linh thạch.
- Chỉ số: chỉ con đang cưỡi có tác dụng, không vượt giới hạn, không áp vào thưởng sự kiện.
- Bí cảnh: 300 người giả lập chạy đủ 6 phút. Mỗi nhịp xử lý dưới 5 ms. Rơi châu đúng luật. Quà ≥300 coin ra châu tím. Không đè sự kiện khác.
- Lời đọc và chữ trên LIVE không chứa "ngẫu nhiên", "tỷ lệ", "%", "thả tim" (có test quét chuỗi).

## 9. Các bước làm
1. **Lõi (không cần ảnh):** `mounts.mjs` (bảng, quay, sao, lệnh, chỉ số), test. Trang quản lý tặng tọa kỵ để thử.
2. **Ảnh:** Codex vẽ 10 tọa kỵ + châu → user duyệt.
3. **Hiển thị:** ngồi tọa kỵ trên sân, thay phiên, Lôi Đài, màn truyền công.
4. **Sự kiện Bí Cảnh:** server, màn hình avatar, quà, rơi châu, bảng hướng dẫn.
5. **Cài và theo dõi:** test toàn bộ, đẩy lên LIVE, user làm mới nguồn Link, theo dõi 1 buổi LIVE xem linh thạch và tọa kỵ Thần ra có hợp lý không, rồi chỉnh số.

## 10. Còn cần user chốt
1. Tên và hình 10 tọa kỵ ở mục 2 được chưa? Có muốn đổi con nào không?
2. Mốc quà: đã chốt tính TỔNG quà trong 1 lượt sự kiện. Còn: tặng ≥1.000 có nhận luôn 2 châu tím không?
3. Ảnh: Codex đang vẽ (16/11) — user duyệt.
