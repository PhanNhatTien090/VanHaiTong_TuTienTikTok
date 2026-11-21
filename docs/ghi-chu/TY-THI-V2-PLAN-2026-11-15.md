# Kế hoạch Tỷ Thí v2 — "Vân Hải Lôi Đài" (15/11/2026)

Mục tiêu (user): map riêng kiểu đài cao + khán đài; **ai muốn lên đài thì lên, ai muốn thách đấu thì thách**; hiệu ứng mạnh hơn; **mỗi người nhiều chiêu**, không tung 1 chiêu mãi.
Ảnh tham khảo chỉ để lấy ý bố cục (đài phía trên, thanh máu 2 bên, ô chiêu, khán giả ngồi bậc thềm). Làm theo phong cách và tài sản của Vân Hải Tông, không chép giao diện/chữ của kênh khác. **Không** dùng kiểu chữ "1 bình luận = 5 tim" (luật Fake Engagement 09/11).

---

## 1. Hiện trạng (đọc code 15/11)

- `social-events.mjs`: **Phong Vân Luận Kiếm** = giải loại trực tiếp. Mở tuyển 90 s (`tythi`), ghép cặp theo tổng tu vi, >4 người thì vòng loại "so tài nhanh" (chỉ thẻ avatar), ván trên đài 25 s (`DUEL_MS`). Đấu thủ gõ `kiem` tiếp linh lực (tối đa 3 lần ×2 điểm).
- **Luật thắng (user đã chốt):** tổng tu vi hơn ≥3% → thắng chắc; sát nhau mới so điểm (strength + trợ lực + thú V2 ×0,5). Có test khóa luật này.
- "Khiên" (`DUEL_SHIELD_PHASES`) chỉ là hoạt cảnh theo kịch bản 4 pha, không phải máu thật; quà ≥500 coin của đấu thủ → phá/hồi khiên (`duelGiftShieldImpact`).
- Chiêu: **mỗi người 1 chiêu** lấy từ pháp bảo đang đeo (`combat-techniques.js` → `attackTechnique`). Đã có sẵn nhiều lớp hình: `duel-combat.js`, `duel-cinematic.js`, `duel-showcase-v6.js` (13 tuyệt kỹ dựng sẵn), `ultimate-variants-v7.js`, `cinematic-overdrive-v7.js` (cut-in, vỡ màn hình), `skill-impact-v3.js`, `pet-v2-skill-fx.js` (13 chiêu thú).
- Map: `maps-v3/tournament-arena.png` dùng chung, sàn `TOURNAMENT_FLOOR=.78`.
- ⚠ Có phiên khác đang làm hiệu ứng tỷ thí (`2d8af91` rung màn ×5). Làm v2 trong worktree riêng, báo trước khi đụng `social-stage.js`/`duel-*.js`.

**Vấn đề:** giải đấu chạy một mạch rồi tắt, người xem không tự chọn đối thủ được; 1 chiêu lặp lại nên chán; ai cũng biết trước tu vi cao thắng.

---

## 2. Thiết kế chơi

### 2.1 Hai chế độ
| Chế độ | Khi nào | Mô tả |
|---|---|---|
| **Lôi Đài** (mới, chính) | sự kiện 8 phút, lịch như các sự kiện khác + nút mở tay | Có 1 **Đài Chủ** giữ đài. Ai cũng thách được. Thắng thì giữ đài, chuỗi thắng tăng thưởng. |
| **Phong Vân Luận Kiếm** (giữ) | giải định kỳ, ít hơn | Giữ nguyên luồng giải đấu, chỉ đổi sang map + hệ chiêu mới. |

### 2.2 Lệnh Lôi Đài (gõ bình luận)
| Lệnh | Tác dụng |
|---|---|
| `lên đài` (`lendai`) | Đài trống → lên làm Đài Chủ. Có Đài Chủ → vào hàng thách đấu. |
| `thách <tên/mã>` | Thách riêng một người đang có mặt; người đó gõ `nhận` trong 20 s (không nhận thì thôi, không phạt). |
| `chiêu 1–4` (`c1`…`c4`) | Đấu thủ chọn chiêu kế tiếp (xem 2.4). |
| `cổ vũ <tên>` hoặc `cv1`/`cv2` | Khán giả cổ vũ bên trái/phải → đầy **nộ khí** nhanh hơn chút (giới hạn, xem 2.5). ⚠ Không dùng số trơn `1`/`2` vì đang là lệnh nhanh 1–6 (`resolveQuick`). |
| `xuống đài` | Đài Chủ tự rời đài. |

Luồng: hàng thách đấu tối đa 6 người (hiện avatar bên cạnh đài). Mỗi trận **25–30 s**, nghỉ 4 s. Đài Chủ giữ tối đa **5 trận liên tiếp** rồi tự xuống nghỉ (chia lượt cho người khác). Mỗi người tối đa 3 lượt thách / sự kiện để tránh một người chiếm đài.

### 2.3 Ghép trận và luật thắng — **cần user chọn**
Luật 3% hiện tại làm thách đấu tự do mất hứng (thách người hơn 3% tu vi là biết trước thua). Các phương án:
- **A. Giữ 3% nguyên văn** + chỉ cho thách người chênh ≤1 cảnh giới, hiện "tỉ lệ thắng" trước trận. Đơn giản, công bằng theo tu vi, nhưng trận chênh vẫn biết trước.
- **B. (đề xuất) Máu thật + lợi thế tu vi:** tu vi cao hơn → máu/công cao hơn rõ (vd. hơn 10% tu vi ≈ +15% chỉ số), nhưng chiêu/nộ khí/thú/quà có thể lật kèo khi sát nhau. Hơn ≥30% tu vi vẫn thắng chắc (giữ tinh thần "tu vi là gốc"). Phải sửa test luật cũ → cần user đồng ý.
- **C. Lôi Đài theo luật B, giải Luận Kiếm vẫn luật 3%.**

### 2.4 Hệ chiêu: mỗi người 4 ô chiêu
| Ô | Nguồn | Ghi chú |
|---|---|---|
| **SK1 · Chiêu thường** | pháp bảo đang đeo (technique hiện có) | hồi 0 s, đánh xen kẽ |
| **SK2 · Chiêu phụ** | pháp bảo phụ (`equippedExtra`) — không có thì chiêu theo hệ cảnh giới (Kim/Mộc/Thủy/Hỏa/Thổ/Lôi/Phong… gán theo realm) | hồi ~6 s |
| **SK3 · Linh thú** | tuyệt kỹ Linh Thú V2 (13 chiêu có sẵn, `pet-v2-catalog.js`) | hồi ~10 s; không mang thú thì thay bằng "Hộ Thân Cương Khí" (khiên) |
| **SK4 · Tuyệt kỹ** | theo cảnh giới/skin (dùng 13 tuyệt kỹ V6/V7 + biến thể) | cần **nộ khí đầy**; mỗi trận tối đa 1–2 lần |

- **Server dựng kịch bản trận** lúc bắt đầu (seed cố định): chuỗi hành động mỗi 1,2–2 s, AI chọn chiêu theo hồi chiêu + máu. Mọi máy xem giống nhau, không lag mạng, kết quả chỉ server quyết.
- `chiêu 1–4` của đấu thủ: ưu tiên ô đó ở lượt kế tiếp (nếu đã hồi). Không gõ thì AI tự đánh.
- **Cấp chiêu Lv1–10** (hiện "Lv10" như ảnh mẫu): tăng theo số trận đã đánh/huy chương, cộng sát thương nhỏ (giới hạn), lưu `p.duelSkills`.
- Hiệu ứng trạng thái gọn: choáng 1 s, bỏng (trừ máu theo nhịp), khiên, hút máu, hồi máu — khớp với vai trò thú V2 (attack/support/defense/control/drain).

### 2.5 Khán giả và quà
- Cổ vũ: mỗi người tối đa 1 lần cổ vũ/5 s, tổng góp nộ khí mỗi bên có trần → không biến trận thành "ai đông người cổ vũ hơn thì thắng". Chữ trên màn chỉ ghi `cv1 · cv2 cổ vũ`, **không hứa thưởng tim**.
- Quà của đấu thủ: giữ luật hiện tại (≥500 coin → đòn phá khiên/hồi máu). Quà người xem tặng hộ đấu thủ: theo luật tặng hộ có sẵn. Không thay giá quà.
- Thưởng: thắng +2 huy chương (như cũ), **chuỗi thắng** 3/5/8 → danh hiệu "Lôi Đài Bá Chủ" (tạm), Đài Chủ cuối sự kiện +5. Top tuần đã có mục huy chương tỷ thí.

---

## 3. Map mới: "Vân Hải Lôi Đài"

Bố cục dọc 1080 (canvas 900×1600):
- **0–8%**: thanh trên — 2 thẻ đấu thủ (avatar, tên, cảnh giới) + đồng hồ giữa.
- **8–45%**: **đài đá tròn trên đỉnh thềm**, nền núi mây/đêm sao, cột đá + đèn lồng hai bên, kết giới quanh đài. 2 đấu thủ **to** (≈1,6× bình thường) đứng hai bên đài.
- **45–52%**: **thanh máu 2 bên** + nộ khí + 4 ô chiêu mỗi bên (icon, cấp, vòng hồi chiêu).
- **52–90%**: **bậc thềm khán đài**, người xem ngồi ghế cố định (dùng lại hệ ghế `plazaSlots`, xếp theo bậc). Hàng thách đấu: cột avatar nhỏ cạnh đài.
- **90–100%**: chừa cho thẻ quà/mini-game.

Ảnh: **1 nền mới** (đài + thềm, không có người) — nhờ Codex vẽ (image_gen) theo quy tắc mục 4 sổ tay, **user duyệt trước khi cài**. Biến thể ngày/đêm/mưa sấm bằng chỉnh màu + thời tiết (chống "reproduced content"). Icon ô chiêu: vẽ bằng canvas từ màu/hệ chiêu, không cần ảnh mới.

---

## 4. Hiệu ứng và âm thanh

- **Mỗi hệ chiêu một dáng riêng** (không chỉ đổi màu): kiếm khí chém, lôi giáng, băng trận, hỏa long, liên hoa, tinh quang, huyết ảnh… Dựng trên `combat-fx.js` + `skill-impact-v3.js`; tuyệt kỹ dùng `duel-showcase-v6` + `ultimate-variants-v7` (đã có 13 tuyệt kỹ + cut-in).
- Cảm giác đánh: số sát thương bay, **khựng hình 60–90 ms** khi trúng mạnh, lùi người, rung nhẹ (phối hợp phần rung ×5 của phiên khác — tránh chồng 2 lần rung), chữ tên chiêu ngắn.
- **Chống lặp** (TikTok khóa quà 3 lần vì reproduced content): mỗi lần tung chiêu chọn ngẫu nhiên biến thể (góc, màu phụ, quỹ đạo, cut-in); tuyệt kỹ toàn màn tối đa 1 lần / 60 s toàn kênh, không lặp biến thể vừa dùng.
- **Ngân sách lag:** tối đa 2 hiệu ứng lớn cùng lúc; ảnh hiệu ứng rasterize trước (bài học V7); khán đài >30 người tắt hiệu ứng phụ của khán giả, >50 chỉ ảnh (luật đông người). Đo `GET /api/client-status?world=live` (fps, diag) trước/sau.
- Âm: tiếng chém/nổ theo hệ (`impact-audio.js`), tuyệt kỹ có kèn/trống ngắn; tông sư đọc ngắn: "X lên đài", "Y thách đấu", "Z giữ đài 3 trận" (không đọc mọi đòn).

---

## 5. Lộ trình (mỗi bước test → commit → lên LIVE được riêng)

| Bước | Việc | Ước lượng |
|---|---|---|
| **1. Lõi Lôi Đài (server)** | trạng thái `w.arena`, lệnh `lên đài/thách/nhận/xuống đài/cv`, hàng đợi, chia lượt, thưởng chuỗi thắng; kịch bản trận 4 ô chiêu (seed); luật thắng theo phương án user chọn; test (vài trăm người gõ cùng lúc, mất kết nối, rời LIVE giữa trận, restart giữa trận) | 1 phiên |
| **2. Giao diện trên map cũ** | thanh máu, nộ khí, 4 ô chiêu + hồi chiêu, số sát thương, hàng thách đấu, dùng hiệu ứng có sẵn | 1 phiên |
| **3. Map mới** | Codex vẽ nền → user duyệt → cài, xếp ghế bậc thềm, đấu thủ to | 0,5–1 phiên (+ chờ duyệt) |
| **4. Hiệu ứng chiêu** | dáng riêng từng hệ, biến thể, khựng hình, âm thanh, cut-in tuyệt kỹ | 1–2 phiên |
| **5. Cấp chiêu + giải Luận Kiếm dùng hệ mới** | `p.duelSkills`, Lv1–10, bảng chiêu trong `thú kỹ`/`túi`; giải đấu chạy trên map + chiêu mới | 1 phiên |
| **6. Kiểm lag + chỉnh** | đo trên LIVE thật lúc đông, chỉnh ngân sách | theo buổi LIVE |

Mỗi bước tự xem hình bằng render offline (như `scripts/render-pet-cove.mjs`), không chạy Chrome nặng lúc đang LIVE.

**File dự kiến:** mới `arena.mjs` (server), `public/arena-stage.js`, `public/arena-hud.js`, `public/duel-skills.js`, `public/assets/arena-v1/`; sửa `engine.mjs` (gắn lệnh/tick/snapshot), `stage-lock.mjs` (khóa sân), `event-pacing.mjs` (lịch), `public/scene.js` (gọi vẽ), `speech-lines.mjs`; test `test/arena*.test.mjs`.

---

## 6. Cần user quyết trước khi làm

1. **Luật thắng Lôi Đài:** A (giữ 3%), **B (máu thật + lợi thế tu vi, đề xuất)**, hay C (Lôi Đài B, giải đấu giữ 3%)?
2. Lôi Đài **thay** Phong Vân Luận Kiếm hay **chạy song song** (đề xuất: song song, giải đấu thưa hơn)?
3. Cho thách đấu **mọi cảnh giới** hay giới hạn chênh ≤1–2 cảnh giới?
4. Đồng ý để Codex **vẽ 1 nền map mới** (đài + thềm)? Có ảnh mẫu nào muốn giống không (dán ảnh)?
5. Khán giả **cổ vũ** có ảnh hưởng nộ khí (có trần) hay chỉ để vui (hiện tên lên màn)?

---

## 7. Đã chốt và đã làm (15/11, chiều)

User "duyệt hết": **luật B**, Lôi Đài **chạy song song** (lịch đua kiếm → Lôi Đài → đua kiếm → Luận Kiếm, 15 phút/lượt), **thách mọi cảnh giới** (hiện tỉ lệ thắng), Codex vẽ nền, cổ vũ tăng nộ khí **có trần** (3/lần, tối đa 30/trận/bên).

Đã làm (bước 1 + 2 + 3, commit `0841ec9`, merge vào main):
- `arena.mjs` (server), `public/arena-skills.js` (bộ 4 chiêu), `public/arena-stage.js` (vẽ), nền `public/assets/arena-v1/loi-dai-night|dawn.webp` (đêm 18h–6h).
- Cân bằng đo 300 trận/mức: chênh 0/5/10/15/20/29% → người mạnh thắng 52/63/70/76/82/89%, ≥30% thắng chắc; trận TB ~21 s.
- Lệnh: `lên đài`, `thách <tên>`, `nhận`, `xuống đài`, `c1–c4` / `chiêu N`, `cv1` / `cv2`. "nhận" chỉ bắt khi có lời thách (không chặn hồng bao).
- Xem thử offline: `node scripts/render-arena.mjs <dir> [giây…]`; QA HTTP: `node scripts/qa-arena-http.mjs`.

Còn lại (bước 4–6): hiệu ứng riêng sâu hơn cho từng hệ chiêu + âm tuyệt kỹ; đấu thủ quay mặt vào nhau; giải Luận Kiếm dùng hệ 4 chiêu; bảng chiêu/cấp chiêu trong bảng thông tin; đo FPS trên LIVE thật lúc đông.
