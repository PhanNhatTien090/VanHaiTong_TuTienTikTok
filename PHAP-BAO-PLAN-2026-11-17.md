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
- **Lệnh 1 chữ: `cầu`** (nhận cả "cau"). Miễn phí, hồi 20 s/người; báo hồi lượt "X · 12 giây nữa cầu tiếp được".
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
- `public/phap-bao-data.js` — 6 dòng, 24 món (6×4★, 6×5★, 12 GIỚI HẠN L01–L12) + chỉ số, `BAO_FLAMES` (mốc quà → ngọn lửa), hằng số `BAO_PITY4=10`, `BAO_PITY5=80`, `BAO_LIMITED_STOCK=12`, `BAO_EVENT_MS=5 phút`, `BAO_FREE_CD=20 s`.
- `phap-bao.mjs` — `BAO_ODDS` (chỉ server: free .05, g1 .10, g10 .30, g99 .50, g199 .70, g999 .80, q5 .06, mềm từ lượt 65 +.06/lượt, limitedIn5 .08), `rollBao` (trượt/4★/5★/GIỚI HẠN, bảo hiểm 10/80, GIỚI HẠN không bảo hiểm, 1 món/người/mùa, 12 suất), `startBaoKho/stopBaoKho/tickBaoKho`, `baoKhoCommand` ("cau", hồi 20 s), `baoKhoGift` (mỗi quà 1 lượt, ≥999 mỗi 999 = 1 lượt, tối đa 30, +tu vi coin×100), `baoKhoView` (log 8 dòng, top 5, reveals, lưới GIỚI HẠN — không gửi số cơ duyên), `baoCollectionText` (lệnh "thần khí").
- Dữ liệu người chơi: `p.bao={p4,p5,items:{id:sao},lim:{season,id}}`; mùa: `w.baoSeason={n,owners}`; sự kiện: `w.baoKho`.

**✅ Xong 17/11 tối:** bước 1 (nối engine/stage-lock/server — bật tay `POST /api/social-control {action:'start-bao-kho'}`, CHƯA vào `BIG_EVENTS`) + bước 2 (`test/phap-bao.test.mjs`, 3 nhóm). Lệnh `thankhi` xem bộ sưu tập. Còn: giọng "thi triển cầu bảo", bước 3 overlay, bước 4 ảnh; khi overlay xong thì thêm `['bao-kho',…]` vào `BIG_EVENTS` (dùng `bigSpaced`) và sửa test "chưa vào vòng xoay".

**Việc tiếp theo (theo thứ tự):**
1. Nối vào engine (lưu ý: file CRLF, script vá phải trả về chuỗi đã sửa — lần trước lỗi closure nên KHÔNG ghi gì):
   - `engine.mjs`: import từ `./phap-bao.mjs`; trong chat (cạnh `mountRealmCommand`, dòng ~411): lệnh `thankhi` → emit `baoCollectionText`, rồi `baoKhoCommand(w,p,cmd,now,baoContext)`; trong quà (cạnh `mountRealmGift`, ~665): `baoKhoGift(w,p,input.coins,count,now,baoContext)` + `giftEvent.text+=' • N lượt cầu bảo'`; `giftEventRule`: `if(baoKhoActive(w))return 'thiên công bảo khố'`; tick: `tickBaoKho` cạnh `tickMountRealm`; snapshot (~1052): `baoKho:baoKhoView(w,now)`; `BIG_EVENTS` thêm `['bao-kho','Thiên Công Bảo Khố',…]`; `const baoContext={emit,gain,audit:auditRecord}` + `startBaoKhoEvent/stopBaoKhoEvent` (dùng `bigSpaced`).
   - `stage-lock.mjs`: `if(w.baoKho?.phase==='open'||w.baoKho?.podiumUntil>now)return 'Thiên Công Bảo Khố';`
   - `server.mjs`: social-control `start-bao-kho` / `stop-bao-kho`.
   - Giọng quà trong sự kiện: "X thi triển cầu bảo" (`giftLines` trong `speech-lines.mjs`).
2. Test `test/phap-bao.test.mjs` (đã soạn ý): 9 lượt đầu trượt → lượt 10 chắc 4★; lượt 80 chắc 5★; dữ liệu chỉ `items,lim,p4,p5`; 400 lượt "không may" không bao giờ ra GIỚI HẠN; người đã có GIỚI HẠN không ra món thứ 2; đúng 12 suất; "cầu" hồi 20 s; quà count=3 → 3 lượt + tu vi; `baoKhoView` không chứa `free/g999/q5/limitedIn5`; hết giờ thì phase finished, không cầu được.
3. Overlay `public/bao-kho.js` (+ hook `scene.js` như mount-realm, + `warCutFrame`-kiểu cho màn mở bảo 5★/GIỚI HẠN dùng `cut-fx.js`): bố cục mục 4, bảng CƠ DUYÊN = ảnh quà (gift-icons) → ngọn lửa; KHÔNG góc dưới trái; cách đáy ≥11%.
4. Ảnh: Codex đang vẽ 24 món (prompt: scratchpad `phapbao/PROMPT.md`). File ra ở thư mục chạy Codex (scratchpad, có thể bị dọn) VÀ bản gốc ở `C:\Users\Admins\.codex\generated_images\<phiên codex>\`. Session sau: kiểm 24 file, tự xem ở cỡ 64 px, chuyển webp (PIL, chạy python thường không -I) vào `public/assets/phap-bao-v1/<id>.webp`, gửi chủ game duyệt.
5. Đợt 1 (bản mệnh + luyện hóa đồ cũ) làm LÚC KHÔNG LIVE, sao lưu trước.
6. Chưa chốt: thanh mục tiêu chung (đề xuất đếm lệnh gõ + quà, KHÔNG đếm tim). ⚠ Theo dõi: quà 1 coin = 1 lượt → 80 quà nhỏ chắc 5★.

## 10. HIỆU ỨNG NHẬN PHÁP BẢO + CHIÊU (chủ game 17/11: "thật chói lóa, hoành tráng, ghi rõ ai nhận; GIỚI HẠN bùng nổ nhất — rung giật, chiếu chiếu, hiện BÓNG ĐEN rồi bùng bùng bùng; chiêu GIỚI HẠN ngang màn đột phá")
Dùng lại bộ máy sẵn có: `public/cut-fx.js` (letterbox, trận pháp, tụ khí, nổ, sóng, đứng hình, khung impact đảo màu, nhòe tách hình, nghiêng máy), `public/qi-impact.js` (cột sáng/tia tỏa/tia lửa của đột phá), `skill-cutscene.js` (`drawCutInBand` cận mặt tự đo độ cao mặt, tấm che `cutVeil`). Âm: bộ `duelSoundPreset`/`chan-tien-audio` + 3 tiếng "bùm" theo từng cú nổ.

### 10.1 Ba cấp màn NHẬN (mỗi cấp một tông màu, luôn GHI RÕ TÊN NGƯỜI NHẬN)
| | 4★ (tím) | 5★ (vàng) | GIỚI HẠN (hồng–vàng–đen) |
|---|---|---|---|
| Dài | 2,5 s | 4,5 s | 8 s |
| Kiểu | thẻ to giữa màn, sân vẫn thấy | CHIẾU RIÊNG toàn màn | CHIẾU RIÊNG toàn màn, kịch bản 6 pha |
| Hàng chờ | không chặn, xếp 2 thẻ | ≥6 s giữa 2 màn | ưu tiên chen đầu hàng |

**4★ (2,5 s):** chớp tím → trận pháp tím xoay dưới món đồ → món đồ xoay 1 vòng hiện ra + 12 tia sáng tím → chữ "THẦN KHÍ TRUNG CẤP" + tên món + **"<TÊN> nhận"** + ★ + 2 chỉ số → thu nhỏ bay về góc bảng.

**5★ (4,5 s) — 4 pha:**
1. 0–0,6 s TÍN HIỆU: màn tối, letterbox kéo vào, 1 sao băng vàng rạch chéo màn (tiếng vút).
2. 0,6–1,8 s TỤ: trận pháp vàng + cột sáng trời rọi + hạt vàng xoáy vào tâm; camera đẩy vào; cut-in băng chéo CẬN MẶT người nhận + tên.
3. 1,8 s NỔ: đứng hình 0,1 s + khung impact đảo màu → nổ (cột sáng, 18 tia tỏa, tia lửa rơi, 2 vòng xung kích) → món đồ hiện thân giữa vầng hào quang, xoay chậm.
4. 2,2–4,5 s VINH DANH: chữ "THẦN KHÍ CAO CẤP" đập xuống (pop) + tên món chữ vàng to + **"<TÊN> nhận thần khí"** + 3 chỉ số; mưa bụi vàng; letterbox rút.

**GIỚI HẠN (8 s) — 6 pha, kịch bản "bóng đen → bùng bùng bùng":**
1. 0–0,8 s **ĐIỀM BÁO:** cả sân RUNG GIẬT mạnh (lắc 3 nhịp), viền màn đỏ chớp, nhạc tắt lặng 0,3 s; chữ nhỏ "… thiên địa dị tượng …".
2. 0,8–2,2 s **CHIẾU CHIẾU:** chém đen vào màn riêng; 5–7 sao băng màu đặc trưng món rạch dọc ngang, tia sét ngang trời; trận pháp 3 tầng mở ra lần lượt (mỗi tầng 1 tiếng "đoàng").
3. 2,2–3,6 s **BÓNG ĐEN:** giữa trận pháp hiện **hình bóng đen đặc (silhouette) của món đồ**, to dần, viền phát sáng màu món; khói đen cuộn quanh; tim đập "thình… thình…" (2 nhịp âm trầm); cut-in cận mặt người nhận lóe qua.
4. 3,6–4,6 s **BÙNG – BÙNG – BÙNG:** 3 cú nổ liên tiếp cách 0,33 s, mỗi cú: đứng hình 80 ms + khung impact đảo màu + vòng xung kích + rung; cú thứ 3 lớn nhất → bóng đen VỠ thành mảnh sáng, lộ món đồ thật đủ màu.
5. 4,6–6,8 s **HIỆN THÂN:** món đồ xoay giữa vầng hào quang + hiệu ứng ĐẶC TRƯNG của món (ví dụ Tru Tiên: 4 kiếm xoay quanh; Hỗn Độn Chung: thời gian ngưng, hạt đứng yên; Luân Hồi Kính: 5 bóng phân thân…); chữ "✦ THẦN KHÍ GIỚI HẠN ✦" + **tên món chữ to nhất** + **"<TÊN> — CHỦ NHÂN DUY NHẤT"** + "còn X/12".
6. 6,8–8 s **TRUYỀN THẾ:** món đồ bay vụt vào người nhận (về sân), ô tương ứng trong lưới GIỚI HẠN sáng lên, đổi "chưa có chủ" → tên người nhận; giọng tông sư đọc tên.
- Biến thể chống lặp: màu sao băng, hướng camera, thứ tự sét, vị trí bóng đen, nhạc nền — tính theo mã lượt.
- Overlay toàn kênh: sau màn GIỚI HẠN, 30 s tiếp theo tên người nhận có viền hồng nhấp nháy trên sân.

### 10.2 Chiêu khi DÙNG pháp bảo (Lôi Đài SK1 / Luận Kiếm / Chính Ma)
- **4★ — chiêu nhẹ (không chiếu riêng):** vệt/hạt màu dòng (Kiếm chém, Ấn đập, Đỉnh hồi, Chung khiên, Phiến gió, Kính phản) ngay trên sân, ≤1 s.
- **5★ — chiêu mạnh, màn tung chiêu đơn giản (chiếu riêng 3 s):** letterbox + cận mặt + món đồ phóng to + 1 cú nổ + chữ tên chiêu; server hoãn trận 3 s (như `holdMatch`).
- **GIỚI HẠN — chiêu NGANG MÀN ĐỘT PHÁ (chiếu riêng 9–10 s, 1 lần/trận, server hoãn trận đủ thời gian):** cấu trúc như đột phá "nguyên nhân → chuyển hóa → cao trào → biến hình", mỗi món MỘT CƠ CHẾ RIÊNG (không chỉ đổi màu):
  1. Tru Tiên Kiếm Trận — 4 kiếm cắm 4 góc → trận đồ đỏ đen trải kín màn → vạn kiếm từ trời rơi theo đường xoắn → chém thành chữ "TRU".
  2. Hỗn Độn Chung — chuông úp xuống trùm đối thủ → THỜI GIAN NGƯNG (màn xám, mọi hạt đứng yên, chỉ người dùng chuyển động) → gõ 3 tiếng chuông, mỗi tiếng sóng âm vỡ màn.
  3. Luân Hồi Kính — gương soi → 5 phân thân bước ra từ gương → cùng tung chiêu từ 5 hướng → hợp nhất.
  4. Thái Cực Đồ — cuộn tranh trải thành cầu âm dương khổng lồ → đối thủ bị hút vào vòng xoáy âm dương → lật ngược đen trắng.
  5. Cửu Thiên Huyền Hỏa Đỉnh — đỉnh rơi từ trời úp xuống → lửa xanh huyền luyện → nắp bật, đan quang bắn lên trời.
  6. Càn Khôn Đại — túi mở → cả bầu trời (mây, sao) bị hút vào túi → nhả ra một dải ngân hà đập xuống.
  7. Phong Thần Bảng — bảng vàng mở → tên đối thủ hiện lên bảng → sấm phong ấn đóng dấu.
  8. Định Hải Thần Châm — trụ cắm xuống → biển dâng sóng thần cuốn ngang màn → trụ phóng to chống trời.
  9. Thất Bảo Diệu Thụ — cây mọc lên → 7 đóa bảo quang nở 7 màu → quét một nhát cầu vồng.
  10. Hồng Mông Tử Khí Bình — bình nghiêng → tử khí tràn kín màn → ngưng tụ thành rồng tím quấn đối thủ.
  11. Lôi Thần Chùy — chùy giơ lên trời → mây sét tụ → 9 tia sét đánh theo nhịp trống (mỗi tia một "bùm").
  12. Huyết Hải Ma Đao — đao cắm đất → biển máu dâng → đao chém đôi biển máu, sóng đỏ dội lại.
- Mỗi chiêu GIỚI HẠN có ảnh chiêu riêng do Codex vẽ (như `assets/signature-ults-v1`) + âm từ score riêng (như `scripts/<tên>-score.txt`).

### 10.3 Chống lag cho các màn này
- Mọi màn chiếu riêng = pha toàn màn, `scene.drawFrame` bỏ vẽ sân (như Lôi Đài/Đua/Chính Ma) → GPU chỉ lo 1–2 nhân vật + hiệu ứng, bùng hết cỡ được.
- Ảnh món đồ/bóng đen thu nhỏ sẵn đúng cỡ; bóng đen = chính ảnh món tô đen 1 lần (cache), không filter mỗi khung.
- **Chủ game 17/11: màn chiếu riêng KHÔNG vẽ đám đông → LÀM MẠNH TAY.** Cho phép: hạt tới ~400/màn, nhiều lớp chồng (2–3 trận pháp, sao băng, sét, khói, mảnh vỡ), rung mạnh, nhiều cú nổ, lớp `lighter` dày. Vẫn giữ: không `shadowBlur`/`filter` mỗi khung (iGPU máy LIVE yếu ở mục này), ảnh thu nhỏ sẵn, `reduceFlash` chỉ tắt chớp trắng/đảo màu. Ngưỡng duy nhất: đo màn nặng nhất trên máy LIVE (Chrome, cỡ 1080×1920) ≥ 40 khung/s; dưới thì giảm hạt, không giảm kịch bản.
- Hàng chờ server: 5★ cách nhau ≥6 s, GIỚI HẠN chen đầu; quá 3 màn chờ thì 4★/5★ chỉ hiện thẻ nhỏ.
- Đo `/api/client-status` sau khi lên LIVE; QA bằng `scripts` kiểu `cutsheet` (vẽ trực tiếp theo mốc k) trước khi đẩy.
