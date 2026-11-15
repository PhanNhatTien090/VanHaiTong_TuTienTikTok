# Kế hoạch Lôi Đài v2 — bỏ Tỷ Thí, bảng chiêu theo bậc, bí pháp chiêu thức, quà trợ chiêu (15/11/2026)

Yêu cầu user: bỏ Tỷ Thí, chỉ còn Lôi Đài; lấy "bảng chéo" lúc tung chiêu của Tỷ Thí đưa sang Lôi Đài và làm đẹp hơn hẳn (tràn viền, hình chiêu + tên chiêu rõ, **chiêu càng mạnh bảng càng đẹp**); thêm cơ chế chiêu; **học bí pháp ra chiêu**; **tặng quà có trợ chiêu** (hồi máu, linh khí, triệu hồi…); chiêu mới hoành tráng: rìu lớn bổ xuống, vạn kiếm đâm xuống, lốc xoáy, sóng biển, độc khí, gậy như ý…; cần ảnh thì nhờ Codex.

---

## 0. Hiện trạng (đọc code)

- **Bảng chéo cũ** = `drawDuelCutIn()` trong `public/duel-combat.js`: một dải hình bình hành nghiêng giữa màn (y≈41%), nền gradient màu chiêu, vài vệt tốc độ, ảnh chân dung (`portraitCanvas`), chữ "TUYỆT KỸ · LIÊN CHIÊU", tên chiêu 28px, tên người. Chỉ 1 kiểu, cỡ chữ nhỏ, không có hình chiêu, mọi chiêu giống nhau → "xấu", lặp.
- Lôi Đài hiện tại (`arena.mjs`, `public/arena-stage.js`, `public/arena-fx.js`): 4 ô chiêu (pháp bảo, chiêu phụ/hệ, linh thú, tuyệt kỹ), luật B, cut-in tuyệt kỹ chỉ là dải tối + chữ.
- Bí pháp (`CATALOG` type `manual`): chỉ 3 món (Thanh Tâm Quyết, Vạn Kiếm Quy Tông, Cửu Chuyển Liên Hoa), lệnh `học`, không cho chiêu Lôi Đài.
- Quà khi đang đấu: <99 coin → +nộ khí; ≥99 → "Pháp Bảo Bạo Phát". Có sẵn **tặng hộ** (`tặng tên/mã`) để người xem tặng cho đấu thủ.
- Ảnh có thể dùng lại: thần thú quà (`gift-spirit-beasts.js`), Thương Long (`celestial`), 13 tuyệt kỹ V6/V7 (SVG/WebP), ảnh 13 linh thú, chân dung nhân vật.

---

## 1. Bỏ Tỷ Thí → chỉ còn Lôi Đài

- Lịch thi đấu: `race, arena, race, arena` (bỏ `tournament`). Nút "Mở tỷ thí" trên trang quản lý đổi thành Lôi Đài.
- Lệnh `tythi`/`kiem`: trả lời "Tỷ Thí đã thành Vân Hải Lôi Đài • gõ lên đài" (không lỗi, không im lặng).
- **Giữ dữ liệu cũ**: huy chương (`tournamentMedals`), danh hiệu Kiếm Khôi, top tuần mục huy chương vẫn tính (Lôi Đài đã cộng vào đúng trường này). Code Tỷ Thí để nguyên nhưng không còn đường vào (dễ quay lại nếu cần).
- **Giải định kỳ thay thế (tùy chọn)**: "Lôi Đài Tranh Bá" — cuối mỗi lượt Lôi Đài, Đài Chủ cuối + người chuỗi thắng dài nhất được vinh danh (đã có Bá Chủ). Không cần giải loại trực tiếp riêng.

## 2. Bảng chiêu theo bậc (thay bảng chéo cũ)

Một module mới `public/skill-banner.js`, dùng cho mọi đòn Lôi Đài. **Bậc bảng = bậc chiêu**:

| Bậc | Dùng cho | Bảng |
|---|---|---|
| **1 · Phàm** | chiêu thường (SK1) | dải nghiêng nhỏ sát người ra đòn, tên chiêu 26px, vệt tốc độ màu hệ; không che sân |
| **2 · Linh** | chiêu phụ, bí pháp Phàm/Linh | dải nghiêng ngang 70% màn, **ảnh chiêu** (icon/sprite) bên cạnh tên 34px, viền kim loại theo hệ, hạt sáng |
| **3 · Huyền/Địa** | bí pháp Huyền/Địa, chiêu linh thú, quà trợ chiêu vừa | dải **tràn viền** 2 lớp chéo ngược nhau, **chân dung** + **ảnh chiêu lớn**, tên chiêu 44px chữ đậm có viền sáng, quét ánh sáng chạy qua, khung hoa văn |
| **4 · Thiên** | tuyệt kỹ (nộ đầy), bí pháp Thiên, quà lớn | **toàn màn**: tối nền 35%, 3 dải chéo, viền vàng khắc rồng/mây, chữ tên chiêu 60px kiểu thư pháp (font đậm + nét viền 2 màu), chân dung to, hình chiêu khổng lồ bay vào, nứt viền/kim tuyến, chữ hệ (雷/火/劍…) mờ phía sau |

- **Chống "reproduced content"** (TikTok đã khóa quà 3 lần): mỗi bậc 3–4 bố cục (chéo trái/phải, dọc, xoáy), màu/hạt theo hệ, vị trí ảnh đổi; không dùng lại bố cục vừa dùng. **Bảng bậc 4 toàn màn tối đa 1 lần / 20 s** trên kênh; quá nhịp tự hạ xuống bậc 3.
- Chữ to, đậm, viền tối 2 lớp → đọc rõ sau khi TikTok nén video.
- Hiệu năng: khung/viền rasterize sẵn 1 lần (bài học V7), không `shadowBlur` mỗi khung; >30 người chỉ bậc 1–2 nhẹ, >50 người chỉ chữ tên chiêu.

## 3. Cơ chế chiêu mới

**5 ô chiêu** (thay 4):

| Ô | Nguồn |
|---|---|
| SK1 | pháp bảo chính (như cũ) |
| SK2 | **bí pháp chiêu thức 1** (nếu chưa học: chiêu phụ/hệ như hiện tại) |
| SK3 | **bí pháp chiêu thức 2** |
| SK4 | linh thú đang theo |
| SK5 | tuyệt kỹ (nộ khí đầy) |

**Hiệu ứng trạng thái** (có trần, hết sau vài giây): Độc (trừ máu theo nhịp), Choáng, Khiên, Hồi máu, Hút máu, **Phá khiên**, **Giảm công**, **Phản đòn** (trả % sát thương), **Đẩy lùi** (mất lượt kế tiếp).
**Ngũ hành khắc chế** (nhẹ, ±10%): Kim→Mộc→Thổ→Thủy→Hỏa→Kim; hiện chữ "KHẮC HỆ" khi trúng.
**Liên chiêu**: 2 đòn cùng hệ liên tiếp → đòn thứ 2 +15% và bảng có nhãn "LIÊN CHIÊU".
Luật B giữ nguyên: chênh ≥30% tổng tu vi vẫn thắng chắc; bí pháp chủ yếu thêm **đa dạng + hiệu ứng phụ**, sức mạnh thô chỉ chênh tối đa ~15% để đường tỉ lệ thắng không lệch.

## 4. Bí pháp chiêu thức (học được)

Thêm loại `type:'skillbook'` vào `CATALOG` (không đụng 3 bí pháp tu luyện cũ). Học bằng `học <tên>` (lệnh có sẵn), trả **linh thạch + linh thảo**; bậc Địa/Thiên cần thêm **huy chương Lôi Đài** (lấy được từ thắng đài) và cảnh giới tối thiểu. Xếp vào ô: tự xếp 2 bí pháp mạnh nhất vào SK2/SK3; `chiêu đổi <tên>` để chọn tay. Bảng `chiêu` hiện cả 5 ô.

Danh sách đề xuất (12 bí pháp, mỗi hệ có dáng riêng):

| Bậc | Bí pháp | Hình | Hiệu ứng phụ |
|---|---|---|---|
| Phàm | Liệt Phong Chưởng | chưởng gió | đẩy lùi nhẹ |
| Phàm | Hàn Băng Chỉ | tia băng | giảm công 2 s |
| Linh | Độc Long Vụ | **mây độc** xanh tím cuộn tới | độc 3 nhịp |
| Linh | Thanh Mộc Triền | dây leo trói | choáng ngắn |
| Linh | Như Ý Thần Côn | **gậy dài vươn ra quét ngang**, rồi phóng to đập xuống | phá khiên |
| Huyền | Cửu Thiên Phong Bạo | **lốc xoáy cuộn trào** cuốn đối thủ | đẩy lùi + sát thương nhiều nhịp |
| Huyền | Thương Hải Nộ Đào | **sóng biển dâng trào** đổ ập | hồi máu bản thân nhẹ |
| Huyền | Kim Cương Hộ Thể | pháp tướng kim thân | khiên lớn + phản đòn |
| Địa | Vạn Kiếm Quy Nhất | **vạn kiếm đâm xuống** như mưa | sát thương nhiều nhịp |
| Địa | Phần Thiên Hỏa Long | rồng lửa quấn | bỏng (độc hệ hỏa) |
| Thiên | Khai Thiên Cự Phủ | **rìu khổng lồ từ trên trời bổ xuống**, mặt đất nứt | phá khiên + choáng |
| Thiên | Tinh Hà Đảo Lưu | dải ngân hà đổ xuống | hút máu |

(Tên tự đặt, không lấy tên/nhân vật của game hay phim cụ thể.)

## 5. Quà trợ chiêu (đang đấu)

Áp cho quà của **đấu thủ** hoặc quà **tặng hộ** đấu thủ (`tặng tên/mã`). Mọi trợ chiêu đều hiện bảng chiêu đúng bậc:

| Quà (coin/lần) | Trợ chiêu | Bậc bảng |
|---|---|---|
| 1–9 | **Linh Khí Quán Đỉnh**: +nộ khí | — (hạt sáng + chữ nhỏ) |
| 10–98 | **Hồi Xuân Thuật**: hồi 6–12% máu + nộ khí | 2 |
| 99–498 | **Triệu Hồi Linh Thú**: thần thú (ảnh có sẵn) lao ra đánh 1 đòn | 3 |
| 499–1.999 | **Pháp Bảo Bạo Phát** + khiên | 3 |
| ≥2.000 | **Thiên Giáng**: Khai Thiên Cự Phủ / Vạn Kiếm Quy Nhất ngẫu nhiên, không lặp lần trước | 4 |

Không đổi giá quà, không đổi luật quà ngoài Lôi Đài. Chữ trên màn chỉ báo hiệu ứng (không "thả tim để…", không "cảm ơn").

## 6. Ảnh cần Codex vẽ (user duyệt trước khi cài)

Tất cả PNG nền trong suốt, 2.5D donghua, không chữ:
1. Rìu khổng lồ (lưỡi phát sáng vàng, cán rồng) — 1 ảnh lớn + 1 ảnh vệt chém.
2. Mưa kiếm (8–12 thanh kiếm phát sáng, 1 tấm) + 1 thanh kiếm lớn.
3. Lốc xoáy (3 khung cuộn).
4. Sóng biển dâng (2 khung).
5. Mây độc xanh tím (2 khung).
6. Gậy như ý vàng đỏ (dài, có thể kéo giãn).
7. Rồng lửa quấn (1 tấm).
8. Pháp tướng kim thân (bán thân, mờ).
9. **3 khung bảng chiêu** (bậc 2/3/4): viền kim loại hoa văn mây/rồng, giữa trống để chữ, dạng dải ngang dài 3:1.
10. 12 icon bí pháp (tròn, 128 px) cho ô chiêu.
Prompt lưu `public/assets/skills-v1/prompts.json`. Codex vẽ → mình tự xem → gửi user duyệt → cài (WebP, kiểm cỡ <900 KB/ảnh).

## 7. Lộ trình (mỗi bước test → commit → lên LIVE)

| Bước | Việc | Ảnh |
|---|---|---|
| **A** | Bỏ Tỷ Thí (lịch, lệnh chuyển hướng, nút); 5 ô chiêu; trạng thái + ngũ hành + liên chiêu; test cân bằng (đường tỉ lệ thắng không lệch) | không |
| **B** | `skill-banner.js` 4 bậc, vẽ bằng canvas (chưa có ảnh): tràn viền, chân dung, biến thể, nhịp 20 s cho bậc 4; tự xem render | không |
| **C** | Quà trợ chiêu 5 bậc (dùng ảnh thần thú có sẵn cho triệu hồi) | không |
| **D** | Bí pháp chiêu thức: catalog 12 món, `học`, xếp ô, `chiêu đổi`, bảng `chiêu`; hiệu ứng vẽ bằng nét trước | không |
| **E** | Codex vẽ ảnh mục 6 → duyệt → thay hình chiêu lớn + khung bảng | **có** |
| **F** | Âm riêng từng bí pháp lớn; đo FPS LIVE thật lúc đông; chỉnh | — |

Bước A–D làm được ngay không cần ảnh (đã có hình bằng nét + ảnh sẵn); E làm song song khi Codex vẽ xong.

## 8. Cần user chốt

1. Bỏ hẳn Tỷ Thí, lịch thành **đua kiếm / Lôi Đài / đua kiếm / Lôi Đài** — đúng ý?
2. **5 ô chiêu** (pháp bảo, 2 bí pháp, linh thú, tuyệt kỹ) — ok?
3. Học bí pháp trả **linh thạch + linh thảo**, bậc Địa/Thiên thêm **huy chương Lôi Đài** — ok? (giá cụ thể mình đề xuất theo bảng giá rèn/đan hiện có)
4. Mốc quà trợ chiêu ở mục 5 — ok hay muốn đổi mốc?
5. Cho Codex vẽ bộ ảnh mục 6 ngay?

---

## 9. Đã chốt và đã làm (15/11 tối)

User chốt: không cần câu báo khi gõ `tythi`; **trong lúc đấu dẹp bảng khác, thay bằng bảng hướng dẫn**; luật mới: làm gì mới phải kiểm đã có hướng dẫn chưa. Các điểm còn lại theo đề xuất.

Đã làm (merge `feat/loi-dai-v2`, commit `e678d48`): bước A–E.
- Lịch chỉ còn đua kiếm ↔ Lôi Đài; nút Tỷ Thí bỏ khỏi trang quản lý (dữ liệu cũ giữ).
- 5 ô chiêu; trạng thái độc/giảm công/đẩy lùi/phá khiên/phản đòn/choáng; ngũ hành **±5%** (±10% đo ra lệch 72/28 nên giảm); liên chiêu +10%. Đo 300 trận/mức: ngang tu vi 53/47, cặp khắc hệ 65/35, ≥30% vẫn thắng chắc.
- 12 bí pháp (`public/arena-books.js`): `học <tên>`, `bí pháp`, `chiêu đổi <tên>`; tên trùng bí pháp tu luyện cũ thì lệnh học cũ được ưu tiên.
- Quà trợ chiêu 5 bậc (cả tặng hộ đấu thủ — `gift-for.mjs` mở tặng hộ khi Lôi Đài mở).
- `public/skill-banner.js` bảng 4 bậc; mỗi lúc 1 bảng lớn; bậc 4 tối đa 1 lần/20 s.
- Ảnh Codex: `public/assets/skills-v1/` (8 chiêu + 3 khung bảng, ~940 KB WebP), chuyển động riêng ở `public/arena-art-skills.js`.
- Bảng hướng dẫn trên sân (lệnh · quà trợ chiêu bằng ảnh quà thật · cơ chế · bí pháp · 5 ô) + ẩn các bảng DOM khác (`body.arena-stage`); bảng thông tin góc dưới cập nhật.

Còn lại (bước F): âm riêng từng bí pháp lớn; đo FPS LIVE thật lúc đông; xem trên LIVE thật các bảng bậc 3–4 và ảnh chiêu.
