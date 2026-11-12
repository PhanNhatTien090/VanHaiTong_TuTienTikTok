# Kế hoạch: Ngũ Đường Vân Hải (chức vị tông môn) — 12/11/2026

Chủ kênh duyệt ý tưởng. Mỗi lần làm một bước, demo ảnh xong mới lên LIVE.

## Chức vị
Tông Chủ (tặng quà lớn, ngai Chí Tôn đã có) → 5 Đường Chủ (Trưởng Lão) → Chân Truyền (tối đa 3/Đường) → Đệ tử.

## 5 Đường (đặt cùng một chữ — CHƯA CHỐT: "Đường" (đề xuất) / "Phong" / "Các")
| Số | Tên | Quản | Đệ tử được (CHƯA CHỐT mức, đề xuất ~+10%) |
|---|---|---|---|
| 1 | Truyền Công Đường | tu luyện | gõ 1 +10% tu vi |
| 2 | Tàng Bảo Đường | pháp bảo | gõ 7 rèn rẻ hơn, sát thương +10% |
| 3 | Đan Đỉnh Đường | luyện đan | gõ 4 tốn ít thảo, đan mạnh hơn |
| 4 | Tuần Sơn Đường | tuần tra, yêu thú | gõ 3 thêm linh thạch, đi tuần nhặt đồ |
| 5 | Linh Dược Đường | linh thảo, linh thú | gõ 2 thêm thảo, dễ gặp linh thú |

## Thiên Bảng
Top 10 mạnh nhất cả tông theo tổng tu vi (có mặt hay không), chấm xanh = đang ở LIVE, 2 trang 1–5 / 6–10 xoay 8 s ở bảng TOP TU VI bên trái.

## Đường Chủ — KHÔNG chốt theo thời gian, tự động hoàn toàn (chủ kênh chốt)
- Khởi động: top 5 Thiên Bảng (trừ Tông Chủ) ngồi 5 ghế.
- Điều kiện thách đấu: trong Thiên Bảng top 10, không phải Tông Chủ / Đường Chủ khác. Lệnh "thách đấu 1–5" hoặc + tên.
- Không cần Đường Chủ đồng ý hay có mặt: trận tự chạy ~30 s trên đài giữa màn (kiểu Vân Hải Tháp). Có mặt thì tự đánh + đệ tử Đường gõ 3 hộ sư; vắng thì hệ thống đánh bằng chỉ số, không có người hộ.
- Lực = theo tu vi hai bên; người xem khác gõ 3 trợ lực người thách đấu; chênh quá xa thì cổ vũ không lật được.
- Tự lên ghế không cần đấu: tu vi vượt Đường Chủ ~20%.
- Đường Chủ vắng LIVE 3 ngày → ghế tự trống, người mạnh nhất top 10 chưa có ghế được đôn.
- Chống spam (chỉ cho trận thật): giữ ghế thành công miễn chiến 10 phút; thua chờ 30 phút; mỗi lúc 1 trận, còn lại xếp hàng Vân Đài.
- Thắng: thông báo lớn + thẻ Báo Hỷ, lên ghế ngay; Đường Chủ cũ về làm đệ tử Đường đó; chân truyền giữ nguyên.
- Chỉ lệnh chơi miễn phí, quà không quyết định thắng thua (luật LIVE).

## Đệ tử
- "vào đường 1–5" / tên Đường; 1 Đường/người, đổi 7 ngày/lần.
- Mọi hoạt động cộng điểm cống hiến cho Đường; Đường nhất tuần được buff cả Đường tuần sau.
- Chân truyền: Đường Chủ gõ "chân truyền + tên", đệ tử gõ "bái sư" đồng ý; Đường Chủ vắng 3 ngày thì tự chọn người cống hiến nhiều nhất.

## Hiển thị LIVE (không lag: chữ HTML + ảnh cache)
- 5 ghế Đường Chủ dưới Tông Chủ (thay 2 ghế Trưởng Lão cũ — sectElders/seatSectElders trong public/sect-hall.js), cờ Đường, avatar khi có mặt.
- Bảng xoay điểm thi đua 5 Đường; thẻ Báo Hỷ khi lên Đường Chủ / nhận chân truyền.
- Lệnh "đường": thẻ (khung Linh Bài) — thầy, chân truyền, điểm, hạng Đường. Thêm trang hướng dẫn.
- Cờ 5 Đường cần hình → đưa prompt ChatGPT khi tới bước 2.

## Thứ tự làm
1. Thiên Bảng top 10 — ĐANG LÀM DỞ, nhánh `demo/thien-bang` (worktree scratchpad): thien-bang.mjs (O(n) top 10), engine snapshot `thienBang`, app.js trang 1–5/6–10, CSS trong live-clarity.css (v=20261112a). Còn: chụp demo kiểm tra, test, đẩy LIVE.
2. 5 ghế Đường Chủ + ngồi theo top 5 lúc khởi động.
3. Thách đấu Đường Chủ (luật trên).
4. Gia nhập Đường + thưởng.
5. Điểm cống hiến, thi đua tuần.
6. Chân truyền / bái sư, thẻ "đường", hướng dẫn.

## Chủ kênh cần chốt
- Chữ chung: Đường / Phong / Các.
- Mức thưởng mỗi Đường (~+10%?).
