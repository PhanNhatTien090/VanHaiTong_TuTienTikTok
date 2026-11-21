# Kế hoạch skin mới — "thoát mẫu cũ, ít hiệu ứng nhưng cinematic, có động tác" (21/11/2026)

Chủ game yêu cầu: tạo hình KHÁC HOÀN TOÀN các skin hiện tại; hiệu ứng ÍT nhưng cực kỳ cinematic, ngầu, có lực;
thêm động tác ngoài đứng và ngồi. **ĐÃ CHỐT (21/11 tối): concept A — Hắc Kiếm Khách · CẢ NAM VÀ NỮ (2 bộ tư thế) · 500 cả bộ, đứng riêng 1 lượt Song Tiên.** Bước kế: vẽ concept (mục 5.1) cho chủ game duyệt.

## 1. Vì sao các skin hiện tại "giống nhau"
- Cùng một công thức: tiên nhân áo bào dài + hào quang/vòng sau lưng + cánh/pháp bảo bay quanh + hạt sáng liên tục (≥8 lớp, kiểu `karma-fx.js`).
- Chỉ 2 tư thế: đứng / ngồi thiền, chuyển qua lại bằng `pose.stand` (scene.js `drawPlayer`). Không có động tác.
- Hiệu ứng chạy liên tục hoặc bùng đều đặn → nhìn "nhiều" nhưng không có khoảnh khắc.

## 2. Concept (chọn 1)
| | Tạo hình | Hiệu ứng chủ đạo (ít) | Khác mẫu cũ ở đâu |
|---|---|---|---|
| **A. Hắc Kiếm Khách** (khuyên) | Kiếm khách phong trần: nón lá rộng vành che nửa mặt, áo choàng rách bay gió, đại kiếm đen quấn vải sau lưng, tông đen–xám–đỏ thẫm | Gió cuốn lá + MỘT nhát chém mực xé ngang khung hình, ấn đỏ nhỏ | Không hào quang, không cánh, không bay; võ hiệp gai góc thay vì tiên nhân lộng lẫy |
| **B. Huyết Nguyệt Thương Thần** | Giáp nửa người, thương dài, khăn quàng đỏ rất dài bay | Trăng máu khổng lồ CHỈ hiện lúc tung chiêu, bóng đen in lên trăng | Hình khối giáp/thương, khoảnh khắc "silhouette trên trăng" |
| **C. Lôi Ẩn Thích Khách** | Mặt nạ nửa mặt, áo bó đen, song đoản đao ngược | Biến mất thành 1 tia sét rồi hiện ở chỗ khác (dịch chuyển) | Nhỏ gọn, tốc độ; động tác là chính, gần như không VFX thường trực |

## 3. Động tác mới (ngoài đứng/ngồi)
Đề xuất 4 tư thế (A lấy làm ví dụ):
1. **Thủ thế** — đứng nghiêng, tay đặt chuôi kiếm, áo choàng bay. Xen kẽ với đứng thường ~mỗi 20–30 s (idle sống động).
2. **Rút kiếm / vung chém** — khi gõ lệnh đánh, tu luyện mạnh, ra chiêu Lôi Đài/boss (0,8 s rồi về thủ thế).
3. **Quỳ một gối cắm kiếm** — lúc đột phá thành công / thắng trận / vừa mua skin (giữ 2–3 s).
4. **Quay lưng ngoái đầu** — idle hiếm (~2 phút/lần), áo choàng chữ lớn sau lưng.
Ngồi giữ như cũ (map tông môn, ghế). Không làm đi bộ (cần nhiều khung, tốn GPU).

**Engine (làm 1 lần, skin sau dùng lại):** bộ tư thế theo skin `POSE_SHEETS[skinId]={stand,sit,guard,strike,kneel,back}` + máy trạng thái
chọn tư thế theo sự kiện (lệnh đánh, đột phá, thắng, mua skin) + idle ngẫu nhiên; chuyển tư thế bằng crossfade 150–200 ms
+ "đánh lực" (squash 1 khung, rung nhẹ) để có cảm giác lực. Nằm trong `scene.js`/`motion.js`, chỉ bật cho skin có `POSE_SHEETS`.

## 4. Hiệu ứng: ít nhưng cinematic
- **Thường trực: gần như KHÔNG** — chỉ vạt áo/khăn lay nhẹ (vẽ sẵn trong ảnh + lắc nhẹ), bóng đổ đậm dưới chân. Không vòng, không hạt liên tục.
- **Khoảnh khắc (bùng theo nhịp ~40 s, ~1,2 s):** quanh người tối đi 0,3 s → MỘT nhát chém mực trắng–đen ngang người (ảnh vẽ sẵn, quét theo thời gian) → khựng hình 80 ms (hit-stop) + rung nhẹ → ấn đỏ nhỏ + bụi lá. Trùng lúc đổi tư thế "vung chém".
- **Màn ra mắt lúc mở bán (6–8 s):** khung đen 2 dải (letterbox), cận mặt dưới vành nón, rút kiếm → chém đôi khung hình → hiện tên. Không lặp y hệt (2–3 biến thể góc/màu theo luật chống "reproduced content").
- **Chiếu riêng (Lôi Đài/quà lớn):** 1 thần kỹ: vạn nhát chém mực hội về một điểm — dùng `skill-cutscene.js`/`cut-fx.js` sẵn có.
- Âm: 1 tiếng rút kiếm + 1 tiếng chém trầm (tổng hợp như `*-audio.js`), không nhạc dài.

## 5. Hình ảnh (Codex image_gen, chủ game duyệt từng bước)
1. 1–2 ảnh **concept** toàn thân → chủ game chọn.
2. **Bộ tư thế đồng bộ** từ concept đã chọn (cùng mặt, áo, kiếm): đứng, ngồi, thủ thế, vung chém, quỳ, quay lưng — nền trong suốt.
3. Ảnh phụ: nhát chém mực (sprite), ấn đỏ, kiếm (pháp bảo), băng rôn mở bán.
Rủi ro chính: giữ nhân vật GIỐNG NHAU giữa các tư thế → vẽ theo ảnh concept làm mẫu, tự soát từng ảnh, vẽ lại cái lệch.
Tổng ~8–10 ảnh, WebP ≤250 KB/ảnh.

## 6. Bán
Theo luật mới: một giá cả bộ (skin + kiếm). Đề xuất 500, đứng RIÊNG một lượt Song Tiên như Nữ Oa/U Minh. Chủ game chốt.

## 7. Hiệu năng (ưu tiên không lag)
- Đổi tư thế = đổi ảnh (rẻ). VFX chỉ lúc bùng; máy tụt FPS (`RenderBudget` light) → chỉ còn tư thế, bỏ nhát chém.
- Sân >30 người: không bùng; >50: chỉ hình (luật đông người).
- Đo `GET /api/client-status?world=live` trước/sau khi lên LIVE.

## 8. Các bước
1. Chủ game chọn concept + trả lời mục 9.
2. Vẽ concept → duyệt. 3. Vẽ bộ tư thế → tự soát → duyệt.
4. Engine bộ tư thế + test (máy trạng thái, crossfade) + QA chụp từng tư thế trên server thử.
5. VFX khoảnh khắc + màn ra mắt + chiếu riêng; quay video xem thử cho chủ game.
6. Khai báo giá/lượt, test, đẩy lên LIVE; chủ game làm mới Link.

## 9. Cần chủ game chốt
- Concept A / B / C (hoặc ý khác)?
- Nam, nữ, hay cả hai (mỗi giới 1 bộ tư thế = gấp đôi ảnh)?
- Giá 500 cả bộ, đứng riêng một lượt?
