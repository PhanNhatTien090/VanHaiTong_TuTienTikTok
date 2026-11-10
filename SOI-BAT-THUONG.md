# SOI BẤT THƯỜNG — kế hoạch ghi log + phát hiện gian lận (08/11/2026)

Khi user hỏi "X có gian lận / dùng tool / sao lên nhanh vậy" → làm theo file này.
Trạng thái: **KẾ HOẠCH, CHƯA LÀM** (cập nhật dòng này khi đã cài).

## A. Cách tra ngay (dữ liệu đang có, trước khi cài bộ log)

Chỉ đọc, không sửa `data/`.
1. Tìm người trong `data/live.json` (`w.players[id]`, so tên). Trường quan trọng:
   `realm`, `totalQi`, `giftCoins`, `likeReceipt.total` (tổng tim từ đầu), `heartsTotal` (tim từ 07/11 19:45),
   `heartFlow.rate` (tim/giây trung bình ~5 phút, gate cắt ở ~2/s), `activeMs`, `interactions`,
   `tournamentMedals`, `raceMedals`, `quizSolved`, `bossWins`, `checkinStreak`, `giftHistory`.
2. Dòng thời gian: quét mọi `data/live*.json` (bản sao trước mỗi lần restart), sắp theo mtime, in các trường trên → thấy tăng lúc nào, ứng với bao nhiêu tim/giờ có mặt/huy chương.
3. So với top người chơi (sắp theo `totalQi`): tim/giờ có mặt = `likeReceipt.total / (activeMs/3.6e6/3600)`; người thường ~0,6–1,3 tim/s.
4. `w.adminLog` lọc theo id → chỉnh tay, Thiên Đạo. Quà: `data/audit/gifts-live-*.jsonl`.
5. Giới hạn: chưa có log từng gói tim → không khẳng định được tool; chỉ nói "nghi / không thấy dấu hiệu".

Ví dụ đã tra (08/11): 🐠༺Huy༻🐠 (id 7024457666483635227) — realm 20, 36 coin, 102.588 tim / 22,1 h (~1,3 tim/s, ngang Chang).
Không thấy dấu hiệu rõ; điểm ngờ: tối 07/11 thả đều ~1,5 tim/s hơn 2 giờ. Tăng mạnh nhất 04→05/11 (r15→18) trước khi có heart gate.

## B. Kế hoạch bộ log (khi user duyệt thì làm)

### 1. Ghi log — `activity-log.mjs` (theo mẫu `audit-storage.mjs`, gom outbox, flush cùng `persist()`)
- `data/activity/live-YYYY-MM-DD.jsonl`, dòng gọn ~50 byte:
  - gói tim: thời điểm ms, userId, count gốc, count sau `heartGate` (bị cắt bao nhiêu);
  - bình luận có lệnh (tuluyen, danh…); quà; vào/rời LIVE; bàn giao LIVE↔web.
- Sổ tu vi: trong `action()` ghi `totalQi` trước/sau của actor + nguồn (`input.type`, heartCultivated…);
  mỗi 60 s chụp `totalQi` mọi người → phần chênh không thuộc action gán nguồn "sự kiện/khác", đối chiếu `adminLog`.
- Ngày cũ nén gzip, giữ 30 ngày. Lỗi ghi file chỉ bỏ qua, không làm hỏng game. Không đồng bộ lên VPS.

### 2. Phát hiện — bộ đếm cuốn chiếu theo người (không quét file), điểm 0–100
| Dấu hiệu | Ý nghĩa |
|---|---|
| Nhịp tim quá đều | hệ số biến thiên khoảng cách gói tim rất thấp / số tim mỗi gói cố định |
| Thả liên tục không nghỉ | >1,5 tim/s quá 30 phút, không có khoảng nghỉ >1 phút |
| Có mặt bất thường | nhiều giờ / qua đêm, tim đều mà không bình luận |
| Lệnh như máy | gõ lệnh đúng bằng hồi chiêu ± vài trăm ms, lặp nhiều lần |
| Tu vi tăng vọt | tu vi/giờ gấp nhiều lần trung vị cùng cảnh giới (tính cả không nạp) |
| Bị gate cắt nhiều | tỷ lệ tim bị `heartGate` cắt cao |
So với nhóm người chơi bình thường, không chỉ ngưỡng cứng. Chỉ đánh dấu khi ≥2 dấu hiệu.

### 3. Giao diện — chỉ trang quản lý `#scene`
- Khung "Soi bất thường": danh sách bị đánh dấu, điểm, lý do tiếng Việt (vd. "thả 1,6 tim/s suốt 2h10, lệch nhịp 3%").
- Tra một người: dòng thời gian tu vi, biểu đồ tim/giây, tỷ lệ nguồn tu vi, so với trung bình cùng cảnh giới, tải log thô.
- API `GET /api/anomalies?world=live`, `GET /api/player-audit?id=…&days=7`.
- **Chỉ báo, không tự phạt.** Xử lý bằng Thiên Đạo / chỉnh tay.

### 4. Dữ liệu cũ
Script dựng lại dòng thời gian từ `data/live-pre-*.json` (như mục A.2).

### 5. Kiểm tra
Test ghi/đọc/xoay vòng log; chấm điểm trên dữ liệu giả (người thật, tool đều nhịp, bot gõ lệnh); 500 người cùng lúc đo thời gian xử lý;
toàn bộ test; server thử cổng 4399 + xem giao diện Chrome; restart an toàn bằng script.

### Mặc định chờ user chốt
Giữ log 30 ngày; chỉ ghi bình luận có lệnh; chấm đỏ trên trang quản lý khi có người mới bị đánh dấu (chưa chốt).

## Tặng hộ (10/11/2026)

Lệnh `tang <tên|mã|@id>`: quà trong sự kiện skin/Linh Thú Cốc cộng tiến độ cho người nhận đang ở LIVE (`gift-for.mjs`). Bản ghi audit `gift` có thêm `recipient`/`recipientName`. Một người nhận skin/linh thú mà không tự tặng đồng nào → xem audit có `recipient` trỏ tới họ trước khi nghi lỗi. Nhiều nick cùng dồn cho một người là hợp lệ (người tặng trả tiền thật).
