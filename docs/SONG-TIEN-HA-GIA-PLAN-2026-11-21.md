# Kế hoạch: SONG TIÊN (2 skin/lượt, theo cặp) + HẠ GIÁ 20–30%

Ngày 21/11/2026. Chủ game giao: bỏ skin không ai mua (Vương Lâm, Hàn Lập, Doraemon); mỗi lượt chỉ 2 skin có liên quan
với nhau, hiện TO để người xem thấy rõ hiệu ứng; thêm sự kiện giảm giá 20–30%.

## 1. Số liệu hiện có (`data/live.json`, `visitorArchive` 100 lượt gần nhất, 17–20/11)

| Skin | Lượt xuất hiện | Coin thu trong lượt |
|---|---|---|
| Xích Vũ Nữ Đế (300) | 5 | 502 |
| Bích Lân Độc Hậu (500) | 2 | 502 |
| Tinh Hà Kiếm Đế (500) | 4 | 501 |
| Nguyệt Liên Tiên Cơ (300) | 8 | 306 |
| Thần Đế (100) | 10 | 306 (3 người mua) |
| Hàn Lập · Vương Lâm · Doraemon · Nhân Quả · Hắc Kim · Hải Lam · Tần Mục · Khuy Niết · Tư Đồ | 4–11 | 1–3 (gần như không ai mua) |

- Tiền đến từ vài skin đẹp nhất; skin "khách mời" 100–200 (Hàn Lập/Vương Lâm/Doraemon) chiếm nhiều lượt nhưng không bán được.
- Tam Tiên (3 vị/lượt) mới chạy từ tối 20/11 nên CHƯA đủ số liệu chứng minh "gộp thì ít mua" — nhưng hợp lý: 3 vị đứng nhỏ (cao 185),
  hiệu ứng khó thấy, người xem phải chọn giữa 3 → hay bỏ qua.

## 2. Song Tiên — 2 vị/lượt theo cặp

**Bỏ khỏi vòng xoay:** `vuonglam`, `hanlap`, `doraemon`. Người đã có skin vẫn giữ và mặc bình thường (chỉ không mở bán nữa).

**Danh sách cặp (một skin có thể nằm trong nhiều cặp; ưu tiên 2 giá KHÁC nhau → "đủ ví là nhận", không cần tặng đúng món):**

| Cặp | Liên quan | Giá |
|---|---|---|
| Thần Đế + Nhân Quả Vương Lâm | chủ game chọn | 100 + 500 |
| Tư Đồ Ma Tôn + U Minh Ma Đế | ma đạo, đỏ máu / đen tím | 200 + 500 |
| Long Duệ Hải Lam + Nữ Oa | thủy: rồng biển / vá trời, mặt nước | 100 + 500 |
| Nguyệt Liên Tiên Cơ + Tinh Hà Kiếm Đế | trăng & sao | 300 + 500 |
| Đấu Đế Tiêu Viêm (Hắc Kim) + Bích Lân Độc Hậu | Tiêu Viêm & nữ vương rắn (Đấu Phá) | 300 + 500 |
| Khuy Niết Lôi Tôn + U Minh Ma Đế | lôi tím + ma tím | 300 + 500 |
| Tần Mục Hỏa Thần + Xích Vũ Nữ Đế | hỏa: nam / phượng hoàng nữ | 300 + 300 ⚠ |

⚠ Cặp hỏa trùng giá 300, mà ở 300 kênh chỉ có 1 món ("Galaxy's Bestest") → không tách được ai mua ai. Cần chọn (mục 5).

**Hiện TO:** 2 vị đứng 2 bên Tiên Nhân Đài (x≈290 và 610 trên khung 900), cao ~300 (gấp ~1,6 lần bây giờ),
hiệu ứng ĐỦ lớp liên tục (lúc mở bán không theo nhịp bùng), có màn chào lúc giáng lâm.
Dưới chân mỗi vị: tên + giá (ảnh quà thật, không ghi coin — đúng luật thẻ quà). Kiểm tra không che ghế Tông chủ/trưởng lão đầu bậc thang
và cách đáy ≥11%.

**Giữ nguyên:** ví tiên duyên (`p.skinWallet`), MUA 1 LÀ 1, pháp bảo mua sau skin, 4 phút/lượt, 10 phút/lượt xoay, báo lượt kế.

**Chỗ sửa:** `pickVisitorLineup` (engine.mjs) → bốc 1 CẶP từ `SONG_TIEN_PAIRS` thay vì 3 vị ngẫu nhiên; `LINEUP_SIZE` 3→2;
`LINEUP_SPOTS`/`visitorAnchor` (scene.js) → 2 chỗ to; bảng sự kiện + giọng "Song Tiên giáng lâm"; test lineup cập nhật.

## 3. Hạ Giá (Tiên Duyên Hạ Giá)

- **Chủ game bấm** ở `#events` (game không tự mở — luật "không tự mở sự kiện LIVE"): chọn −20% hoặc −30%, áp cho lượt Song Tiên đang chạy
  hoặc lượt kế.
- Giá sau giảm làm tròn số đẹp: 500→400/350 · 300→240/210 · 200→160/140 · 100→80/70. Pháp bảo giảm cùng %.
  Ví cộng dồn nên giá nào cũng mua được (tặng nhiều món nhỏ cũng đủ).
- Giá lưu ngay trong lượt (`lineup[i].price`, `sale:{pct,until}`) → cộng ví/trừ ví dùng giá của lượt, không dùng bảng giá chung.
- Màn hình: dải "HẠ GIÁ −30%" + đồng hồ đếm ngược; giá cũ gạch đỏ → giá mới (đây là ngoại lệ được ghi số coin; nếu chủ game
  không muốn số thì chỉ ghi "−30%"). Giọng: "Tiên duyên hạ giá — U Minh Ma Đế chỉ còn ba trăm năm mươi".
- Không hứa thưởng cho tim/follow/share (luật Fake Engagement) — chỉ nói giá.
- Gợi ý: tối đa 1–2 lần/buổi LIVE, giờ bất ngờ, để người xem không quen chờ giảm mới mua.
- Người đã mua giá gốc trước đó: không hoàn (như cửa hàng thường).

## 4. Thứ tự làm

1. Song Tiên: cặp + bỏ 3 skin + hiện to (frontend + `engine.mjs`) → QA server thử 4399, chụp từng cặp → test.
2. Hạ Giá: nút ở `#events`, API, giá trong lượt, dải hạ giá + giọng → QA → test.
3. Đẩy lên: commit → push → restart an toàn (`restart-cloud-sync.ps1 -DuringLive`) → chủ game làm mới nguồn Link.
4. Sau 2–3 buổi: so coin/lượt Song Tiên với Tam Tiên (từ `visitorArchive.giftProgress`).

## 5. Chủ game đã chốt (21/11)

1. Cặp hỏa Tần Mục + Xích Vũ: **dùng 2 món 300 khác nhau**, mỗi vị gắn 1 món, tặng đúng món là nhận. Còn chờ: TÊN món 300 thứ hai
   (đúng tên TikFinity gửi) — chưa có thì tạm không xếp cặp này.
2. Hiện giá lúc hạ giá: **không ghi chữ "coin"** — số cũ (500) gạch ngang, mờ đi, rồi số mới (350) sáng lên, kèm ẢNH MÓN QUÀ.
3. **2 skin mới (Nữ Oa, U Minh Ma Đế) hiện RIÊNG** — mỗi vị một lượt đứng một mình (to, giữa đài), không ghép cặp.
   → bỏ cặp "Hải Lam + Nữ Oa", "Tư Đồ + U Minh", "Khuy Niết + U Minh"; Hải Lam, Tư Đồ, Khuy Niết cần cặp khác (xem 6).
4. Hạ giá áp cho **lượt đang chạy**: bấm là giảm ngay, đếm ngược tới hết lượt.

## 6. Cặp sau khi chốt

| Lượt | Giá |
|---|---|
| Thần Đế + Nhân Quả Vương Lâm | 100 + 500 |
| Nguyệt Liên Tiên Cơ + Tinh Hà Kiếm Đế | 300 + 500 |
| Đấu Đế Tiêu Viêm + Bích Lân Độc Hậu | 300 + 500 |
| Tần Mục Hỏa Thần + Xích Vũ Nữ Đế | 300 + 300 (2 món khác nhau) — chờ tên món |
| Tư Đồ Ma Tôn + Khuy Niết Lôi Tôn | 200 + 300 (ma + lôi, cùng tông tà) |
| Long Duệ Hải Lam + Thần Đế | 100 + 100 → trùng giá, ở 100 có đủ món khác nhau (Hand Heart/Bouquet…) |
| Nữ Oa (một mình) | 500 |
| U Minh Ma Đế (một mình) | 500 |
