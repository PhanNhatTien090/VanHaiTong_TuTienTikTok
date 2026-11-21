# LUÂN HỒI — chuyển sinh có giá trị thật (18/11/2026)

Chủ game: "chuyển sinh xong mà chán là toang" → làm thưởng vĩnh viễn + màn chiếu riêng nghiêm túc.
Luật cân bằng giữ nguyên: hệ số tu vi CHỈ nhân khi chơi tay; quà/sự kiện = số gốc.

## Điều kiện
- Đầy cây tu vi Hỗn Độn Vĩnh Hằng (cảnh giới 28: 1.344.847.056.312) mới chuyển sinh được. Đầy cây → trên đầu "✦ Gõ chuyển sinh" + giọng nhắc.

## Ân điển (hằng số ở `public/luan-hoi-data.js`)
| Ân điển | Số | Áp vào |
|---|---|---|
| Luân Hồi tâm pháp | +15%/lần, trần +75% | tu vi chơi tay (`gain`, hand) |
| Ký ức tiền kiếp | cảnh giới đã từng vượt chỉ cần 60% tu vi + linh thạch | `requiredQi`/`requiredStones` |
| Luân Hồi Ấn | sức chiến đấu = max(cảnh giới, 60% cảnh giới cao nhất) | `power()`, Lôi Đài (cổng hạng + máu), Tháp |
| Lôi Đài hộ thể | +4%/lần, trần +20% (chia sát thương nhận) | `arena.mjs` `def` |
| Đạo Quả | +1 điểm/lần; Kiếm (+4% sát thương Lôi Đài), Thể (+5% hộ thể), Đan (+8% tu luyện tay), Phúc (+12% linh thạch tay); tối đa 3 tầng/Đạo | lệnh `daoqua kiem/the/dan/phuc` |

Ví dụ kiếp 2 của Đế giang: tổng tu vi cảnh giới 0→27 kiếp 1 ≈ 1.248 tỷ → kiếp 2 ≈ 749 tỷ; cây 28 vẫn đủ giá. Tổng kiếp 2 ≈ 2.094 tỷ (−19%), chưa tính tâm pháp tay.

## Hiển thị
- Màn chiếu riêng 26 s `public/luan-hoi-cinema.js` (+ âm `luan-hoi-audio.js`): Viên mãn → Lục Đạo Luân Hồi Bàn (6 chuông) → Tiền kiếp hồi tưởng (28 cảnh giới bay ngược) → Thân diệt (tro lửa) → im lặng → giáng cột sáng → Trùng sinh + đóng dấu "NHẤT THẾ LUÂN HỒI" → 4 ân điển. Server hẹn giờ `w.luanHoiCut`.
- Sân: huy hiệu ☸ + số lần cạnh tên; bánh xe Lục Đạo dưới chân (mờ, bùng 3,6 s/45 s; >30 người ẩn). Bậc màu: 1 hổ phách · 2 lam nhạt · 3 lam · 5 tím · 10 vàng.
- Hướng dẫn: trang "☸ LUÂN HỒI · CHUYỂN SINH" trong bảng góc phải (khi có người ≥ cảnh giới 26 hoặc đã chuyển sinh, kèm top 3 Luân Hồi), `manual.js`. Lệnh `luanhoi` xem ân điển.

## Đợt 2 (chưa làm)
- Skin/pháp bảo độc quyền lần 3 (cần vẽ — hỏi user), ghế "Luân Hồi Trưởng Lão" lần 5.
- Màn đột phá rút gọn cho cảnh giới tiền kiếp (hiện vẫn chiếu đủ, có giới hạn 1 lần/60 s chung).

QA: `node scripts/qa-luan-hoi.mjs` (server thử 4399) → `output/luan-hoi/`. Test: `test/luan-hoi.test.mjs`.
