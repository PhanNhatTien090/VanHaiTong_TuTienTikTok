# Kế hoạch: Nguyệt Hạ Kết Duyên v2 — Tình Lâu Song Tu (17/11/2026)

Trạng thái: **ĐÃ DUYỆT 17/11** — mốc quà user chốt: 1 / **≥30** / **≥100** coin. Song tu sau bình phong (không cảnh quan hệ) — user không phản đối. Làm tiếp theo mục 9.

## 0. Hiện trạng (đã đo)

- `bond-festival.mjs`: lễ 5 phút, `ketduyen` → `dongy`, cặp cũ gõ `duyen` đăng ký, 900 tim mở quà chung (+100 tu vi, 50 linh thạch). Ở `BIG_EVENTS` (`engine.mjs`, `['bond','Lễ kết duyên']`). Map `assets/event-maps-v1/bond-festival.webp` (sân tròn, cây nguyệt lão, cầu, trăng).
- Đạo lữ: `w.social.bonds` — 31 đôi, 20 còn, **chỉ 7 đôi có cả hai vào LIVE trong 2 ngày**. VIP có nhiều đạo lữ (BOND-VIP-2026-11-05.md). Cùng tu 3 phút: `companions.mjs`. Tự chọc ghẹo: `tease.mjs`. Đạo lữ Tông chủ: `masterConsort()`.
- ⇒ Vấn đề: lễ chỉ có "kết duyên rồi chờ", ít đôi thật nên sân vắng hoạt động, quà không có chỗ tiêu.

## 1. Ranh giới nội dung (quan trọng — đọc trước)

Ý user: tặng quà lớn thì "quan hệ", vào phòng có màn che chỉ thấy bóng.
**Không làm cảnh quan hệ, kể cả dạng bóng sau rèm**, vì:
- Chính sách TikTok LIVE cấm nội dung tình dục ngầm ý (bóng người, rèm rung, tiếng gợi dục đều tính), và đặc biệt cấm **dùng quà để đổi lấy nội dung gợi dục** → rủi ro khóa quà / cấm LIVE, nặng hơn các lần đã bị ("reproduced content", "Fake Engagement").
- Người xem TikTok có trẻ vị thành niên.

**Làm thay bằng "song tu" kiểu tu tiên** (trope quen thuộc, vẫn lãng mạn, vẫn có màn che + bóng):
bóng hai người **ngồi xếp bằng đối diện, chạm tay**, âm dương khí xoáy giữa hai người, tim/hoa đào bay, trận pháp sáng dần → bùng nổ "SONG TU ĐẠI THÀNH". Có thể có câu đùa nhẹ kiểu "Bế quan song tu — người ngoài miễn quấy rầy", không hơn.
Không: giường, cởi đồ, bóng chồng lên nhau, rèm rung theo nhịp, tiếng thở/rên, chữ "quan hệ / động phòng / ấy".

## 2. Ý tưởng chính

Lễ đổi tên **Nguyệt Hạ Tình Lâu**, dài 8 phút, 2 pha trên cùng map (vẽ thêm **Tình Lâu** bên phải cây nguyệt lão: tòa lầu 3 tầng có **6 cửa sổ phòng**):

| Pha | Thời gian | Làm gì |
|---|---|---|
| Kết duyên | 0–3 phút | như cũ (`ketduyen`/`dongy`/`duyen`) + chọc ghẹo tự động + lệnh mới `tỏ tình tên` |
| Song tu | 3–8 phút | đôi đạo lữ (cũ + vừa kết) vào phòng song tu theo bậc quà |

Ngoài lễ: **không** mở phòng (giữ sân thường gọn, tránh lặp cảnh).

## 3. Bậc phòng (quà của 1 trong 2 người trong đôi)

| Bậc | Quà | Hình | Hiệu ứng |
|---|---|---|---|
| Đình Nguyệt (free) | gõ `song tu` (cả hai phải gõ trong 60 s) | đôi đi ra đình dưới cây nguyệt lão, ngồi đối diện, tim nhỏ bay | +tu vi nhỏ theo lượt vận công (vẫn tính hạn mức ngày), tối đa 1 lần/đôi/lễ |
| **Tình Các** | **1 coin** | một **cửa sổ Tình Lâu sáng hồng**, trong cửa sổ thấy 2 nhân vật ngồi đối diện (ảnh thật, nhỏ), tim + hoa đào bay ra ngoài cửa sổ | 60 s: mỗi người +0,6% tu vi cần/lượt quà cộng dồn (nguồn `gift`, miễn hạn mức), tên đôi trên khung cửa |
| **Uyên Ương Mật Thất** | **≥30 coin** | **chiếu riêng** (`skill-cutscene.js`): phòng nến đỏ, **bình phong lụa hạ xuống → chỉ thấy bóng 2 người ngồi song tu**, âm dương khí xoáy, phượng hoàng lửa quấn quanh, 3 nhịp bùng, chữ "SONG TU ĐẠI THÀNH" | mỗi người +~8% tu vi cần (theo cỡ quà), 10 phút phúc duyên ×2 cho cả đôi |
| **Tiên Lữ Đại Điển** | **≥100 coin** (một món) | chiếu riêng dài hơn: lễ thành hôn trên cầu (phượng quan, pháo hoa, hạc), rồi vào Mật Thất | +~20% tu vi, danh hiệu đôi vĩnh viễn "Thần Tiên Quyến Lữ" + hào quang đôi (icon cạnh tên, theo luật chữ 15/11), dây duyên vàng trên sân |

- Mức % là đề xuất, cân lại theo `rewardQiBasis` giống quà khác; theo luật 08/11: trong lễ chỉ áp luật quà của lễ.
- Quà từ **người ngoài** cho một đôi ("tác hợp"): để bản sau.
- Tim: chỉ chạy đèn chúc phúc như cũ (không hứa thưởng theo tim — luật "không mồi tương tác").

## 4. Tình Lâu — quy tắc chạy

- 6 phòng (6 cửa sổ). Đầy → hàng chờ (avatar đôi nhỏ dưới lầu, dùng `queue-avatars.js`); quà mới cộng giờ cho đôi đang trong phòng.
- Mật Thất / Đại Điển: tối đa 1 chiếu riêng / 60 s; trùng thì xếp hàng ≤2, quá thì chỉ hiện thẻ + giọng (không mất thưởng).
- Server tính giờ phòng → hoãn giờ lễ đúng thời gian chiếu (như `holdMatch`).
- **Không lặp y hệt** (luật TikTok "reproduced content"): Mật Thất có 3 biến thể phòng (nến đỏ / trúc lâm dưới trăng / băng cung) × 3 kiểu khí (âm dương / phượng hoàng / hoa sen) × màu ngẫu nhiên, né biến thể vừa dùng.

## 5. Nhân vật & hình

- **Không vẽ nhân vật mới**: trong cửa sổ dùng ảnh nhân vật thật của người chơi; bóng sau bình phong = **chính sprite người chơi tô đen + làm mờ** (tư thế ngồi lấy từ animation sẵn có / cắt nửa dưới).
- Nhờ Codex vẽ (đã có quyền theo luật 17/11): Tình Lâu (ghép vào map), 3 nền Mật Thất, bình phong lụa (lớp trong suốt), cảnh cầu Đại Điển. Codex prompt ghi rõ: không người, không giường.

## 6. Giọng & chữ

- "X và Y vào Tình Các song tu!" · "Bình phong hạ xuống… X và Y bế quan song tu!" · "Song tu đại thành! Tu vi hai người tăng vọt!" · "Tiên Lữ Đại Điển! X và Y kết thành Thần Tiên Quyến Lữ!"
- Không "cảm ơn/đa tạ", không mồi tim, quà đọc "thi triển song tu" (luật 16/11).
- **Bảng hướng dẫn** (luật "tính năng mới phải có hướng dẫn"): trong lễ ẩn bảng chung, hiện bảng lễ: ảnh quà thật → "Tình Các / Mật Thất / Đại Điển" + lệnh `ketduyen`, `dongy`, `song tu`. Cách đáy ≥11%.

## 7. Hiệu năng

- Cửa sổ phòng: vẽ 2 ảnh nhân vật cache + ≤8 hạt tim/cửa sổ; >30 người chỉ ảnh + khung sáng; >50 người chỉ khung sáng tên đôi.
- Chiếu riêng mạnh tay (≈400 hạt) nhưng giữ ≥40 khung/s; bỏ vẽ cả sân khi chiếu.
- Đo `/api/client-status` trước/sau.

## 8. File dự kiến

- Server: `bond-festival.mjs` (pha, phòng, hàng chờ, thưởng), `engine.mjs` (`giftEventRule` cho lễ, lệnh `songtu`/`totinh`), `speech-lines.mjs`, test `test/bond-room.test.mjs`.
- Overlay: `public/love-tower.js` (Tình Lâu + cửa sổ), `public/love-cutscene.js` (Mật Thất, Đại Điển — dùng `cut-fx.js`), bảng hướng dẫn trong `public/social-stage.js`/`gift-rule-card.js`.
- Ảnh: `public/assets/love-v1/`.

## 9. Tiến độ (làm theo thứ tự)

1. [x] User duyệt kế hoạch + chốt các câu ở mục 10
2. [x] Server: pha + phòng + thưởng + test (chạy được không cần hình)
3. [x] Codex vẽ Tình Lâu + 3 nền Mật Thất + bình phong; tự xem
4. [x] Overlay Tình Lâu (cửa sổ) + bảng hướng dẫn
5. [x] Chiếu riêng Mật Thất (3 biến thể) + Đại Điển
6. [x] Giọng, QA trên server thử 4399 (dữ liệu LIVE chép), xem từng khung; đo FPS
7. [ ] Lên LIVE (restart an toàn), báo user làm mới nguồn Link

## 9b. Đã làm (17/11 tối)

- Server `love-tower.mjs` (phòng 6, hàng chờ 12, Đình Nguyệt, chiếu riêng cách ≥20 s, hàng chờ chiếu ≤2, lễ hoãn đóng khi đang chiếu), lễ 8 phút, lệnh `song tu`; quà của người chưa có đạo lữ vẫn theo luật mặc định.
- Overlay `public/love-tower.js`: Tình Lâu góc phải dưới bảng luật quà, Mật Thất 3 phòng (nến đỏ/trúc lâm/băng cung) × 3 kiểu khí, Đại Điển trên cầu. Nhân vật NGỒI THIỀN (tư thế có sẵn), bóng = sprite người chơi tô đen.
- Thẻ luật quà "NGUYỆT HẠ TÌNH LÂU" (1 / 30 / 100). Giọng: "thi triển song tu", "bế quan Uyên Ương Mật Thất", "Thần Tiên Quyến Lữ".
- QA: `node scripts/qa-love-tower.mjs` (server thử 4399). Bỏ ý `tỏ tình` (để sau).
- Chưa: đo FPS trên máy LIVE lúc đông; nghe giọng thật.

## 10. Cần user chốt

1. Đồng ý thay "quan hệ" bằng **song tu sau bình phong (bóng ngồi đối diện)** như mục 1?
2. ~~Mốc quà~~ → chốt 1 / 30 / 100 coin.
3. Lễ 8 phút (3 kết duyên + 5 song tu) có quá dài trong vòng xoay 25 phút?
4. Danh hiệu "Thần Tiên Quyến Lữ" vĩnh viễn hay theo tuần?
