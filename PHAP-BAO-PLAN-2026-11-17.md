# KẾ HOẠCH PHÁP BẢO BẢN MỆNH + SỰ KIỆN THIÊN CÔNG BẢO KHỐ (17/11/2026)

Chủ game duyệt hướng: pháp bảo phải là trọng tâm tu tiên; sự kiện "cầu bảo" kiểu Genshin — **rút miễn phí bằng 1 chữ, tặng quà chỉ để nhanh hơn**; có bảo hiểm 4★/5★; đồ GIỚI HẠN hiệu ứng ngang màn đột phá. Tham khảo kênh "Vấn Đạo Tông – Vạn Bảo Các" (8 ảnh 17/11), làm khác tên/hình, không sao chép.

## 0. Luật đã chốt
- KHÔNG ghi "tỷ lệ / % / may rủi / ngẫu nhiên" ở LIVE ("TRƯỢT" được dùng — chủ game chốt 17/11) (bảng, chữ, giọng). Bảng **CƠ DUYÊN** = ảnh quà thật → 1–5 ngọn lửa.
- Không mồi tim. Không đoạt bảo (người tu vi cao sẽ gom hết) → thay bằng **mỗi người tối đa 1 đồ GIỚI HẠN mỗi mùa** + mỗi mùa 12 món mới.
- Bảng không đặt góc dưới trái (bình luận che), cách đáy ≥11%. Màn toàn cảnh có biến thể (chống "reproduced content").
- Ưu tiên không lag (xem mục 6).

## 1. Bậc sao & bảo hiểm (giống Genshin)
| Bậc | Ra khi | Hiệu ứng |
|---|---|---|
| TRƯỢT | lượt thường | chỉ +tu vi an ủi, **không lưu món đồ nào** (chủ game: lưu data tốn) |
| 4★ | **chắc chắn trong mỗi 10 lượt** | chiêu nhẹ, hiệu ứng nhẹ |
| 5★ | **chắc chắn trong 80 lượt** (từ lượt 65 cơ duyên tăng dần — "mềm") | chiêu mạnh, màn tung chiêu đơn giản |
| GIỚI HẠN | hiếm trong 5★, không bảo hiểm | hiệu ứng cực mạnh, độc lạ; tung chiêu = màn chiếu riêng ngang đột phá |

- **GIỚI HẠN KHÔNG có bảo hiểm** (chủ game 17/11: chỉ 12 món, có bảo hiểm thì spam 80 lượt là hết). Chỉ có thể ra khi đã ra 5★, cơ duyên rất thấp (số thật chỉ ở server, chỉnh được), không cộng dồn.
- Đã có GIỚI HẠN mùa này / hết 12 suất → ra 5★ thường.
- Bộ đếm lưu theo người (`p.bao.pity4`, `pity5`), **cộng dồn qua mọi lượt sự kiện**; lượt free cũng tính.
- Server-only: bảng cơ duyên số thật nằm trong `phap-bao.mjs`, không gửi xuống overlay (như ODDS tọa kỹ).

## 2. Cách lấy lượt
- **Lệnh 1 chữ: `cầu`** (nhận cả "cau"). Miễn phí, hồi 30 s/người; báo hồi lượt "X · 12 giây nữa cầu tiếp được".
- **Chốt 17/11 (tạm, theo ảnh mẫu):** mỗi lượt `cầu` free và **mỗi quà = 1 lượt**; cơ duyên không-trượt (chỉ server): `cầu` 5% · quà 1–9 coin 10% · 10–98 30% · 99–198 50% · 199–998 70% · mỗi 999 coin = 1 lượt 80%. Bảng LIVE chỉ hiện ảnh quà → 1–5 ngọn lửa. Bảo hiểm 4★/10 lượt, 5★/80 lượt tính trên mọi lượt. ⚠ Quà 1 coin cũng là 1 lượt → 80 quà nhỏ chắc 5★: theo dõi, chỉnh sau nếu ra 5★ quá nhanh. Quà nào cũng +tu vi an ủi (đọc "thi triển", không "đa tạ").
- Mỗi lượt có băng rôn nhỏ giữa màn "Tên · TRƯỢT" / "Tên · 4★ Thanh Phong Kiếm" (xếp tối đa 3 dòng).
- Trùng đồ → lên sao (★1→★5, mỗi sao +20% chỉ số); đủ ★5 trùng nữa → tinh hoa.
- **Gọn dữ liệu:** chỉ lưu 4★/5★/GIỚI HẠN dạng `{id: sao}` + 2 số bảo hiểm + 1 số tinh hoa mỗi người; lượt TRƯỢT không lưu gì (log "vừa cầu" chỉ giữ 20 dòng trong bộ nhớ, không ghi đĩa).

## 3. Pháp bảo bản mệnh (sửa gốc "pháp bảo lỏ")
Hiện trạng: 864 người có pháp bảo, nhiều nhất 65 món, đeo cùng lúc tới 5 món, không món nào có cá tính.
- Mỗi người **1 bản mệnh** = món đang ghim/chọn (lệnh `bản mệnh <số>` xem/đổi, hồi 10 phút). Hiện 1 món bay cạnh người (thay cả mớ → nhẹ máy hơn).
- 6 DÒNG, mỗi dòng 1 thần thông (SK1 Lôi Đài "pháp bảo đang đeo" → thành thần thông bản mệnh):
  Kiếm = bạo kích · Ấn = choáng · Đỉnh = hồi máu · Chung = khiên · Phiến = đẩy lùi (Chính Ma +trượng) · Kính = phản đòn.
- Chỉ số chiến đấu: Công, Bạo kích, ST bạo kích, Kháng bạo, Tu vi (cap như tọa kỹ). Lệnh `chỉ số` xem, `thần khí` xem bộ sưu tập.
- **Luyện hóa**: pháp bảo cũ (CATALOG hiện có) không mất — đổi thành tinh hoa theo giá trị, dùng nâng cấp bản mệnh (Lv1–30). Người chơi lâu năm có lợi thế khởi đầu nhưng không vượt được đồ 5★/GIỚI HẠN.

## 4. Sự kiện THIÊN CÔNG BẢO KHỐ (5 phút, trong vòng sự kiện lớn)
Bố cục 1080×1920 (tham khảo ảnh, khác hình):
- Trên: tên + đồng hồ; nhân vật dẫn **Khí Linh** (giọng tông sư hiện có, lời riêng).
- Trái giữa: bảng **CƠ DUYÊN** (ảnh quà → lửa). Phải giữa: **GIỚI HẠN · còn X/12** lưới 12 ảnh, "chưa có chủ"/tên chủ.
- Giữa: trận pháp, 3 thần khí bay lơ lửng luân phiên; băng rôn từng lượt; +tu vi bay lên.
- Dưới (cách đáy ≥11%, KHÔNG góc trái): **VỪA CẦU · N lượt** (chỉ số lượt, không ghi số trúng) + **SĂN BẢO NHIỀU NHẤT** (món · lượt) ở cột phải.
- Thanh **THIÊN DUYÊN** của người vừa cầu: còn bao nhiêu lượt tới 4★ / 5★.
- Màn mở bảo theo bậc: 4★ = thẻ giữa màn 2 s (màu tím); 5★ = chiếu riêng 3,5 s (vàng: letterbox, cut-in mặt, đứng hình); GIỚI HẠN = chiếu riêng 6 s (hồng–vàng, ấn trận + thần khí hiện thân, biến thể mỗi lần). Hàng chờ: tối đa 1 màn chiếu / 6 s, 4★ trở xuống không chiếu toàn màn.
- Sau sự kiện: bảng tổng kết top săn bảo + chủ nhân GIỚI HẠN mới.

## 5. Nội dung hình (Codex vẽ, tự xem trước rồi gửi duyệt)
- 6 dòng × 2 bậc (4★/5★) = 12 pháp bảo thường (ảnh đơn, nền trong suốt).
- 12 GIỚI HẠN mùa 1 (mỗi món 1 ý tưởng hiệu ứng riêng: ví dụ kiếm hóa rồng, chuông đóng băng thời gian, gương phân thân, đỉnh luyện cả sân…).
- Nền sự kiện + trận pháp + khung thẻ bậc.

## 6. Chống lag
- Trên sân: bản mệnh = 1 ảnh tĩnh ghép sẵn/người; bùng thần thông theo hàng chờ như cánh (≤2 người cùng lúc, ≥21 người tắt).
- Sự kiện: băng rôn ≤3, hạt ≤20/màn, ảnh thu nhỏ sẵn đúng cỡ, không shadowBlur/filter.
- Server: mỗi lượt cầu O(1); log vừa cầu giữ 20 dòng; gói overlay chỉ gửi phần đang hiện.
- Đo `/api/client-status` sau khi lên LIVE.

## 7. Đợt làm
1. **Dữ liệu + bản mệnh** (`phap-bao.mjs`, `public/phap-bao-data.js`): bậc, dòng, chỉ số, bảo hiểm, luyện hóa đồ cũ → tinh hoa (chuyển dữ liệu **lúc không LIVE**, sao lưu trước). Test bảo hiểm 10/80/kép, giới hạn 1 món/mùa, 12 suất.
2. **Sự kiện Bảo Khố** (server + overlay + màn mở bảo 3 bậc) + hình Codex.
3. **Thần thông trong trận**: SK1 Lôi Đài/Luận Kiếm, Chính Ma (Phiến), chiếu riêng cho 5★/GIỚI HẠN.
4. Bảng hướng dẫn + 2–3 ảnh TikTok hướng dẫn cách chơi.

## 8. Cần chủ game chốt
- ✅ Lệnh: `cầu`.
- ✅ Mốc quà theo ảnh mẫu (tạm).
- Thanh mục tiêu chung kiểu "Linh Mạch / Bí Cảnh / Thiên Môn" (ảnh tham khảo đếm tim) — mình đề xuất đếm lệnh gõ + quà, KHÔNG đếm tim.

## 9. TIẾN ĐỘ (cuối phiên 17/11) — SESSION SAU LÀM TIẾP TỪ ĐÂY
**Đã có (commit cùng file này, CHƯA nối vào game, chưa test → không ảnh hưởng LIVE):**
- `public/phap-bao-data.js` — 6 dòng, 24 món (6×4★, 6×5★, 12 GIỚI HẠN L01–L12) + chỉ số, `BAO_FLAMES` (mốc quà → ngọn lửa), hằng số `BAO_PITY4=10`, `BAO_PITY5=80`, `BAO_LIMITED_STOCK=12`, `BAO_EVENT_MS=5 phút`, `BAO_FREE_CD=30 s`.
- `phap-bao.mjs` — `BAO_ODDS` (chỉ server: free .05, g1 .10, g10 .30, g99 .50, g199 .70, g999 .80, q5 .06, mềm từ lượt 65 +.06/lượt, limitedIn5 .08), `rollBao` (trượt/4★/5★/GIỚI HẠN, bảo hiểm 10/80, GIỚI HẠN không bảo hiểm, 1 món/người/mùa, 12 suất), `startBaoKho/stopBaoKho/tickBaoKho`, `baoKhoCommand` ("cau", hồi 30 s), `baoKhoGift` (mỗi quà 1 lượt, ≥999 mỗi 999 = 1 lượt, tối đa 30, +tu vi coin×100), `baoKhoView` (log 8 dòng, top 5, reveals, lưới GIỚI HẠN — không gửi số cơ duyên), `baoCollectionText` (lệnh "thần khí").
- Dữ liệu người chơi: `p.bao={p4,p5,items:{id:sao},lim:{season,id}}`; mùa: `w.baoSeason={n,owners}`; sự kiện: `w.baoKho`.

**Việc tiếp theo (theo thứ tự):**
1. Nối vào engine (lưu ý: file CRLF, script vá phải trả về chuỗi đã sửa — lần trước lỗi closure nên KHÔNG ghi gì):
   - `engine.mjs`: import từ `./phap-bao.mjs`; trong chat (cạnh `mountRealmCommand`, dòng ~411): lệnh `thankhi` → emit `baoCollectionText`, rồi `baoKhoCommand(w,p,cmd,now,baoContext)`; trong quà (cạnh `mountRealmGift`, ~665): `baoKhoGift(w,p,input.coins,count,now,baoContext)` + `giftEvent.text+=' • N lượt cầu bảo'`; `giftEventRule`: `if(baoKhoActive(w))return 'thiên công bảo khố'`; tick: `tickBaoKho` cạnh `tickMountRealm`; snapshot (~1052): `baoKho:baoKhoView(w,now)`; `BIG_EVENTS` thêm `['bao-kho','Thiên Công Bảo Khố',…]`; `const baoContext={emit,gain,audit:auditRecord}` + `startBaoKhoEvent/stopBaoKhoEvent` (dùng `bigSpaced`).
   - `stage-lock.mjs`: `if(w.baoKho?.phase==='open'||w.baoKho?.podiumUntil>now)return 'Thiên Công Bảo Khố';`
   - `server.mjs`: social-control `start-bao-kho` / `stop-bao-kho`.
   - Giọng quà trong sự kiện: "X thi triển cầu bảo" (`giftLines` trong `speech-lines.mjs`).
2. Test `test/phap-bao.test.mjs` (đã soạn ý): 9 lượt đầu trượt → lượt 10 chắc 4★; lượt 80 chắc 5★; dữ liệu chỉ `items,lim,p4,p5`; 400 lượt "không may" không bao giờ ra GIỚI HẠN; người đã có GIỚI HẠN không ra món thứ 2; đúng 12 suất; "cầu" hồi 30 s; quà count=3 → 3 lượt + tu vi; `baoKhoView` không chứa `free/g999/q5/limitedIn5`; hết giờ thì phase finished, không cầu được.
3. Overlay `public/bao-kho.js` (+ hook `scene.js` như mount-realm, + `warCutFrame`-kiểu cho màn mở bảo 5★/GIỚI HẠN dùng `cut-fx.js`): bố cục mục 4, bảng CƠ DUYÊN = ảnh quà (gift-icons) → ngọn lửa; KHÔNG góc dưới trái; cách đáy ≥11%.
4. Ảnh: Codex đang vẽ 24 món (prompt: scratchpad `phapbao/PROMPT.md`). File ra ở thư mục chạy Codex (scratchpad, có thể bị dọn) VÀ bản gốc ở `C:\Users\Admins\.codex\generated_images\<phiên codex>\`. Session sau: kiểm 24 file, tự xem ở cỡ 64 px, chuyển webp (PIL, chạy python thường không -I) vào `public/assets/phap-bao-v1/<id>.webp`, gửi chủ game duyệt.
5. Đợt 1 (bản mệnh + luyện hóa đồ cũ) làm LÚC KHÔNG LIVE, sao lưu trước.
6. Chưa chốt: thanh mục tiêu chung (đề xuất đếm lệnh gõ + quà, KHÔNG đếm tim). ⚠ Theo dõi: quà 1 coin = 1 lượt → 80 quà nhỏ chắc 5★.
