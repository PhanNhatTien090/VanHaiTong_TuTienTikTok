# Kế hoạch: Bảng xem tu vi / túi đồ / linh thú / skin (15/11/2026)

Trạng thái: **chờ user duyệt**. Chưa sửa code.

## 1. Hiện trạng (đọc code 14/11)

| Bảng | Lệnh | Cách hiện | File |
|---|---|---|---|
| Tu vi (Linh Bài) | `9`, `tu vi` | Đi qua **hàng hiệu ứng Vân Đài** (`presentation.js`), mỗi lần chỉ 1 thẻ, giữa màn 5,2 s, **chặn các màn khác** | `public/linh-bai.js`, `app.js:524` |
| Túi đồ / Linh thú / Skin | `tui`, `thu`, `skin` | `InventoryDeck`: tối đa 4 thẻ **xếp lưới 2×2 giữa màn**, 8,1 s, người thứ 5 xếp hàng chờ | `public/inventory-multi.js/.css`, dữ liệu `inventory.mjs` |

Vấn đề:
- 4 thẻ đứng giữa màn, che nhân vật và sân khấu.
- Chữ nhiều mà nhỏ: tên vật phẩm 9–10 px, chỉ số `+x công lực · +y% tu vi`, tiêu đề mục, dòng nhắc lệnh. Lên TikTok bị nén nên không đọc được.
- Ảnh vật phẩm 26–32 px. Linh thú và skin **không có ảnh thật**, chỉ dùng chung một icon SVG (`spirit.svg`, `robe.svg`).
- Bảng tu vi tách riêng và vẫn chiếm lượt của Vân Đài.

## 2. Mục tiêu (theo lời user)

1. Bảng hiện **giữa màn**, sau đó **bay ra một góc**.
2. Đạo hữu khác xem thì bảng của họ cũng hiện giữa rồi bay ra **góc khác**. **Tối đa 4 bảng cùng lúc**.
3. Bảng **gọn hơn**: **ít chữ**, **ảnh vật phẩm to**, **chữ to**.
4. Áp dụng cho cả 4 loại: tu vi, túi đồ, linh thú, skin.

## 3. Thiết kế

### 3.1 Một hệ bảng chung
- Gộp bảng tu vi vào cùng hệ với túi đồ/linh thú/skin (`InventoryDeck` → đổi tên `ViewDeck`, file `public/view-deck.js/.css`).
- Bảng tu vi **không còn đi qua hàng Vân Đài**, nên không chặn quà/đột phá nữa.
- Giữ những thứ đang chạy tốt:
  - hàng chờ công bằng (mỗi người 1 chỗ, tối đa 16 người chờ, có nhãn "⏳ N đạo hữu chờ");
  - gõ lại thì cập nhật tại chỗ;
  - tự dừng khi có đột phá, đấu Ngũ Đường hoặc chữ cảnh giới.

### 3.2 Chuyển động
| Pha | Thời gian | Hình |
|---|---|---|
| Hiện | 0,25 s | giữa màn, phóng từ ×1,15 lên ×1,35 + mờ dần vào |
| Giữ giữa | 1,6 s | ×1,35, người xem kịp nhìn |
| Bay ra góc | 0,45 s | trượt về ô góc, thu về ×1,0 (cỡ thật), đi theo đường cong nhẹ |
| Ở góc | 6 s | đứng yên |
| Tắt | 0,3 s | mờ dần + thu nhỏ một chút |

- Tổng khoảng 8,6 s, ngang mức hiện tại.
- Chỉ dùng CSS `transform` và `opacity`, chạy trên GPU, không đo bố cục. Không có JS chạy theo từng khung hình (không thêm lag).
- Hai người gõ cùng giây: bảng sau chờ 0,6 s mới hiện giữa, để hai bảng không chồng nhau ở giữa.
- Cùng một người gõ lại khi bảng đang ở góc: bảng nháy viền và đổi nội dung tại chỗ, không bay lại vào giữa.

### 3.3 Bốn ô góc
Né những vùng TikTok che (bình luận góc dưới trái, nút quà bên phải, thông tin chủ LIVE ở trên) và các khung đang có (thẻ luật quà góc phải, bảng lệnh dưới trái):

```
┌──────────────────────────┐
│  (thông tin chủ LIVE)     │
│ ┌──1──┐        ┌──2──┐    │  ~16–36 % chiều cao
│ └─────┘        └─────┘    │
│        SÂN KHẤU           │
│ ┌──3──┐        ┌──4──┐    │  ~44–64 %
│ └─────┘        └─────┘    │
│ (bình luận TikTok)        │
└──────────────────────────┘
```
- Thứ tự lấp ô: 1 → 2 → 3 → 4. Ô nào trống trước thì người mới vào ô đó.
- Con số % chỉ là ước lượng. Phải chỉnh lại bằng ảnh chụp overlay thật lúc **không LIVE** trước khi chốt.

### 3.4 Bảng gọn: cỡ thật tại góc
Bảng rộng khoảng **420 px** trên khung 1080 px. Ở giữa màn phóng ×1,35 (khoảng 570 px).

| Phần | Trước | Sau |
|---|---|---|
| Đầu bảng | 2 dòng: "✦ TÚI ĐỒ TU TIÊN ✦" + tên | 1 dòng: **tên đạo hữu** 24–26 px + nhãn loại nhỏ (Túi / Thú / Skin / Tu vi) |
| Chân dung | 54 px | bỏ ở bảng túi/thú/skin (nhường chỗ cho ảnh vật phẩm); bảng tu vi giữ chân dung to |
| Vật phẩm | lưới 2 cột, ảnh 32 px, tên 10 px + chỉ số 9 px | lưới **3 cột**, ảnh **84–96 px**, tên 1 dòng **17–18 px** bên dưới |
| Số lượng | chữ "×3" | huy hiệu "×3" ở góc ảnh |
| Đang đeo/mặc/đồng hành | chữ "CHỦ", "đang đeo" | viền vàng phát sáng + dấu ✦, không ghi chữ |
| Chỉ số công lực/% | mỗi món một dòng | bỏ |
| Tiêu đề mục ("Pháp bảo & trang bị"…) | có | bỏ; túi đồ chỉ có 1 hàng chip nhỏ: 💎 linh thạch · 🌿 linh thảo · 📜 N bí pháp |
| Dòng nhắc lệnh cuối bảng | có | bỏ (đỡ chữ, cũng tránh bị coi là mồi tương tác) |
| Số món tối đa | 6 + 4 + 4 | **6 ô** (túi: pháp bảo trước rồi tới đan dược), dư thì ô cuối ghi "+N" |

Bảng **tu vi** (gọn lại):
- chân dung to bên trái;
- bên phải: tên, cảnh giới + tiểu cảnh giới (chữ to);
- 1 thanh tu vi kèm **%**;
- "Hạng #N".
- Thanh linh thạch chỉ hiện khi linh thạch là thứ đang thiếu để đột phá.

### 3.5 Ảnh thật cho vật phẩm
Thêm file mới `public/item-thumbs.js`: vẽ mỗi ảnh **một lần** vào canvas rồi lưu lại theo khóa (cách giống `portraitCanvas`):
- **Linh thú:** vẽ đúng hình linh thú trên sân (ảnh trong `assets/spirit-pets-v1`). Thần thú hiếm thêm quầng màu.
- **Skin:** vẽ nhân vật mặc skin đó, theo giới tính của người xem, cắt nửa người trên cho to mặt. Dùng lại `drawCharacterBody` với `skinChoice` tạm thời.
- **Pháp bảo:** dùng ảnh pháp bảo đang vẽ trên sân nếu có (sprite pháp bảo / `relic-*.webp`). Không có thì dùng icon SVG hiện tại, phóng to.
- **Đan dược / bí pháp:** dùng icon SVG có sẵn (`elixir`, `book`, `scroll`), phóng to.
- Không vẽ ảnh mới, không đổi model nhân vật (đúng quy tắc mục 4 sổ tay).

Máy chủ (`inventory.mjs`) chỉ cần gửi thêm `id` của linh thú và skin trong danh sách để máy khách biết vẽ hình nào. Không đổi dữ liệu người chơi.

### 3.6 Hiệu năng, đông người
- Mỗi bảng chỉ dựng HTML một lần. Ảnh nhỏ lưu cache theo khóa (`skin|giới tính`, `pet id`, `artifact id`), tối đa ~64 ảnh.
- Sân đông (>50 người, `bareCrowd`): vẫn hiện bảng (không tốn GPU); mỗi bảng tạo tối đa 6 ảnh mới, còn lại dùng icon.
- Không dùng `filter`, `backdrop-filter`, `box-shadow` có animation (nguyên nhân lag trước đây).

## 4. Các bước làm

1. **Dữ liệu** (`inventory.mjs`): thêm `id` cho linh thú/skin, gom túi đồ còn 6 ô + chip. Test `test/inventory*.test.mjs`.
2. **`item-thumbs.js`**: vẽ và lưu cache ảnh linh thú/skin/pháp bảo. Render thử offline bằng `@napi-rs/canvas` để tự xem từng ảnh.
3. **`view-deck.js/.css`**:
   - viết lại HTML gọn cho 4 loại bảng;
   - quản lý ô (1–4), chờ 0,6 s khi hai bảng cùng muốn hiện giữa;
   - chuyển động hiện → giữa → bay góc → tắt;
   - giữ hàng chờ và cơ chế tạm dừng.
4. **Nối vào `app.js`**: chuyển bảng tu vi (`e.card` không có `kind`) từ hàng Vân Đài sang deck. Bỏ đường đi qua `showLinhBai`, nhưng giữ `linh-bai.js` cho `portraitCanvas`.
5. **Test tự động**:
   - gán ô, 5 người cùng gõ, người cũ gõ lại;
   - tạm dừng khi có đột phá;
   - giới hạn 6 ô;
   - không còn chữ nhắc lệnh;
   - bảng tu vi không còn vào hàng Vân Đài.
6. **Tự xem bằng mắt** (chỉ lúc không LIVE): server thử cổng 4399 + Chrome. Chụp:
   - 1 bảng ở giữa;
   - 4 bảng ở 4 góc;
   - sân đông người;
   - khung 1080×1920.
   Tự kiểm chữ có đọc được khi thu về cỡ TikTok (~540 px rộng) không. Quay GIF đoạn bay ra góc.
7. **Đưa lên:** test đạt → commit → push → restart an toàn (vì `inventory.mjs` là backend) → user **làm mới nguồn Link**.

Ước lượng: 1 phiên làm (bước 1–5), thêm một lượt chụp/chỉnh vị trí lúc không LIVE (bước 6).

## 5. Cần user chốt (có mặc định nếu không trả lời)

1. **Vị trí 4 góc:** mặc định như sơ đồ 3.3 (2 trên + 2 giữa-dưới, né bình luận).
2. **Thời gian:** mặc định giữa 1,6 s + góc 6 s. Muốn ở góc lâu hơn thì nói số.
3. **Bảng tu vi** gộp chung hệ 4 góc: mặc định **có**.
4. **Bỏ chỉ số công lực/% tu vi** ở túi đồ: mặc định **bỏ** (chỉ giữ viền sáng cho món đang đeo).
