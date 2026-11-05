---
name: van-hai-dot-pha
description: Làm / nâng cấp hiệu ứng đột phá cảnh giới (hình + âm thanh điện ảnh) của game Vân Hải Tông LIVE theo chuẩn v5 (Luyện Khí "Bát Quái Dẫn Khí" đã được chủ game khen đẹp). Dùng khi được nhờ làm lại / nâng cấp / chỉnh hiệu ứng hoặc âm thanh đột phá một cảnh giới, sửa lỗi hình lúc đột phá, hoặc thêm biến thể. Có công cụ dựng video từng khung, xuất âm WAV, đo hiệu năng từng lớp. Dùng khi được nhờ "làm lại / nâng cấp / chỉnh hiệu ứng đột phá" một cảnh giới (Luyện Hư, Đại Thừa, Chân Tiên, Huyền Tiên…), sửa lỗi hình lúc đột phá, hoặc thêm biến thể chống lặp cho cảnh đột phá.
---

# Nâng cấp hiệu ứng đột phá — Vân Hải Tông LIVE

Dự án: `tien-gioi-live` (Node, cổng 4317, overlay TikTok LIVE Studio). Mỗi cảnh giới có file
`public/<ten>-awakening.js` (hình, Canvas 2D, toạ độ cảnh rộng 900) và `public/<ten>-audio.js` (Web Audio tự tổng hợp).
Bộ lớp dùng chung đã có sẵn — **dùng lại, đừng viết lại**:

- `public/qi-impact.js` — lớp hình chung + biến thể + camera.
- `public/impact-audio.js` — lớp âm cú nổ chung (chồng lên cue gốc của cảnh giới).
- `public/audio.js` — bảng `IMPACT_LAYERS` nối lớp âm chung theo cảnh giới.
- `public/style.css` — hiệu ứng chữ cảnh giới (`.ritual-hud[data-realm="N"]`).
- `public/live-cinema.js` — `drawRitual` chọn hàm vẽ theo cảnh giới; `mountRitualHud` hiện tên + cảnh giới + danh hiệu (`subtitle`).

Đã xong: 1 Luyện Khí (v5 05/11/2026 = chuẩn mới), 2 Trúc Cơ, 3 Kim Đan, 4 Nguyên Anh, 5 Hóa Thần (realm 1–4 dùng thiên đài; Hóa Thần v2 có nền Thần Niệm Chấn Thiên riêng).
Còn lại: 6 Luyện Hư (20,8 s), 7 Đại Thừa (22,8 s), 8 Chân Tiên (31,6 s, có `chan-tien-prelude.js`), 9+ dùng nhánh chung trong `live-cinema.js` (nổ ở k≈.71).

## CHUẨN v5 — 05/11/2026 (ưu tiên cao nhất, thay mọi hướng dẫn cũ bên dưới khi mâu thuẫn)

Chủ game duyệt **Luyện Khí v5 "Bát Quái Dẫn Khí"** là "rất đẹp" (hình) và yêu cầu âm "điện ảnh". Đây là **mức sàn**. Mẫu tham chiếu:
`public/luyen-khi-formation.js` (hình), `public/qi-audio.js` (âm), `LUYEN-KHI-V5-2026-11-05.md` (ghi chú).

### Luật leo thang: cảnh giới sau PHẢI đỉnh hơn cảnh giới trước
So cạnh nhau bản realm N với realm N−1 (contact sheet + video). Realm N chỉ đạt khi hơn ở **ít nhất 3/5** trục, và không kém ở trục nào:
1. **Quy mô không gian**: N−1 chiếm thân người + trận dưới chân + trời → N phải mở rộng thêm (cả bầu trời, núi xa vỡ, chân trời, nhiều tầng sâu…).
2. **Số nhịp có nghĩa** (nguyên nhân → biến cố → tích lực → phá → hiện thân): v5 có 6 nhịp; mỗi cảnh giới sau ≥ số nhịp trước, mỗi nhịp phải đổi tình thế thật, không lặp.
3. **Motif mới làm chủ đạo**: không lấy motif chủ đạo của cảnh trước (Bát Quái đã dùng cho Luyện Khí). Được dùng lại *primitive* (sprite, brushRibbon, glow), không dùng lại *cảnh*.
4. **Cao trào**: cú phá mạnh hơn (nhiều lớp hơn: sóng, vật văng, camera, âm), nhưng mặt nhân vật vẫn đọc được.
5. **Âm**: nhiều lớp nhạc cụ/nhịp hơn, cao trào âm lớn hơn tương đối (vẫn peak < 1), có chủ đề giai điệu riêng.
Gợi ý motif theo cảnh giới (không bắt buộc, phải hợp thần thái): 2 Trúc Cơ – dựng đạo cơ: đài/trụ ngọc mọc từ đất, linh mạch dưới lòng đất; 3 Kim Đan – đan lô, kim đan ngưng tụ, lôi nhỏ; 4 Nguyên Anh – nguyên anh xuất khiếu, sen; 5 Hóa Thần – pháp tướng, thiên địa dị tượng; 6 Luyện Hư – hư không nứt, gương vỡ; 7 Đại Thừa – vạn kiếm/đại đạo; 8 Chân Tiên – tiên môn, thiên kiếp; 9+ xem kế hoạch post-Chân Tiên. Cảnh giới đã có bản cũ: giữ ý tưởng hay, nâng theo thang này.

### Quy trình v5 (làm đúng thứ tự)
1. **Quay bản hiện tại trước** (bằng chứng "trước"): `node skills/van-hai-dot-pha/scripts/render-realm-frames.mjs output/frames-rN N` (dựng từng khung 30 fps theo thời gian chính xác, máy chậm cũng mượt) → `ffmpeg -framerate 30 -i output/frames-rN/f%04d.png -vf scale=540:960 -c:v libx264 -pix_fmt yuv420p before.mp4`. Contact sheet: `montage $(ls -d output/frames-rN/f*.png | awk 'NR%22==1') -tile 6x -geometry 180x320+1+1 sheet.png`. Không dùng quay video trình duyệt headless để đánh giá chuyển động (máy không GPU chỉ ~5 fps → giật giả).
2. **Viết kịch bản nhịp** (bảng k 0..1 → giây; mốc nổ giữ theo timeline cảnh giới) trước khi code: mỗi nhịp ghi *cái gì xảy ra, vì sao, lấp vùng nào của màn hình*. Màn 900×H: nửa trên (trời) và nửa dưới (mặt đất/nước) đều phải có nội dung có nghĩa.
3. **Module riêng** `public/<ten>-formation.js` (mẫu: `luyen-khi-formation.js`): một hàm `xxxState(k)` trả về các đường bao (envelope) cho từng nhịp, mỗi lớp một hàm `drawXx(scene,c,st,s,…)`. Ghép vào `*-awakening.js` theo thứ tự: trời (ngoài camera) → mặt đất/nước → trận/đồ hình → nguồn khí phía sau → nhân vật → kinh mạch/lớp trên thân → nén khí → impact chung → vật văng → (ngoài camera) motes, vignette.
4. **Luật kỹ thuật**: không `Math.random` (dùng `rnd(i)` theo chỉ số); biến thể từ `qiVariant(e)` (flip, phase); tài nguyên tĩnh (trận đồ, mây, núi, sprite sáng, cánh sen) **vẽ sẵn một lần và cache trên scene**, gradient chỉ tạo trong cache; `scene.budget.level==='light'` giảm số hạt/lớp; không phủ trắng mặt (không vẽ kinh mạch/điểm sáng qua mặt; tô sáng thân ≤ .4).
5. **Soi và sửa ít nhất 3 vòng**: sau mỗi vòng dựng lại frame, xem contact sheet + phóng to 3–6 khung then chốt (khai cảnh, giữa tích lực, ngay trước nổ, nổ, hiện thân). Lỗi đã gặp ở v5 và cách sửa: mây thành mảng xám mờ → tường vân có viền + móc xoắn, alpha thấp; dải khí rót thành hình chữ X → nhiều sợi mảnh xoắn phễu có đoạn sáng chạy; núi chìm vào nền tối → sáng màu + viền ngọc; dải mây thành bức tường → ít mây, alpha .2–.4; vệt phản chiếu thành khối chữ nhật → sprite tròn kéo dọc; sáng phủ mặt → dời điểm sáng lên trên đầu, kinh mạch dừng ở cổ.
6. **Hiệu năng**: `node skills/van-hai-dot-pha/scripts/bench-layers.cjs` (sửa danh sách lớp) đo ms/khung từng lớp; lớp tốn nhất thường là vùng tô lớn (sương, trời) → vẽ sẵn ở nửa độ phân giải, mỗi khung một drawImage. Báo số so với bản cũ, nói rõ là đo trên máy không GPU.
7. **Âm điện ảnh** (mẫu `qi-audio.js` v5): lập *cue list* khớp từng nhịp hình (giây). Bộ nhạc cụ tổng hợp có sẵn trong mẫu: `drum` (taiko: sine hạ cao độ + nhiễu ngắn), `strings` (2 sawtooth lệch .997/1.004 mỗi nốt, attack chậm), `bowl` (cồng/khánh bồi âm lệch), `pluck` (chuông/đàn), `swell` (âm dâng cắt đúng mốc nổ), nhiễu bandpass quét (gió, nét bút), nhịp tim trống dồn dần trước nổ, nền chìm một nhịp ngay trước nổ, sau nổ: dàn dây hợp âm trưởng + đàn rải. Kiểm bằng `scripts/render-audio.cjs`: peak < 1.0; đường đỉnh 0,5 s phải là vòng cung (mở vừa → tích tụ thấp → dâng → nổ cao nhất → dư âm); xem phổ để thấy nhịp. **Tránh nhiễu highpass** (tạo gai đột biến ~0,8 ở biên vòng lặp buffer) — dùng bandpass Q thấp.
8. **Ghép video có tiếng cho chủ game duyệt**: `ffmpeg -framerate 30 -i frames/f%04d.png -i cue.wav -vf "scale=540:960,tpad=stop_mode=clone:stop_duration=1.6" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest out.mp4`, gửi kèm bản "trước".
9. `npm test`, `npm run check` (thêm file mới vào script check), sao lưu bản cũ vào `data/backups/`, viết `<TEN>-V?-yyyy-mm-dd.md` (kịch bản, giữ luật gì, số đo, phần chưa nghe/xem), commit + push.

### Lưu ý công cụ (05/11)
- Bộ dựng Node (`render-realm-frames.mjs`) vẽ skin cảnh giới ≥2 với **khối chữ nhật quanh nhân vật** — lỗi của @napi-rs/canvas với atlas, không có trên trình duyệt. Trước khi sửa "lỗi khối", chụp kiểm bằng trình duyệt: mở `ascension-preview.html?realm=N&capture=1`, bấm `#ritual`, chụp sau vài giây.
- Hàm cue âm có tham số khác nhau: Luyện Khí `(c,dest,elapsed,dur,strength,pitch)`, Trúc Cơ `(…,strength,stem,pitch)`, Kim Đan `(…,strength,stem)` → truyền `'[1,"mix"]'` cho render-audio. Lớp mới đặt trong nhóm `'cine'` và luôn `transient:true` (test bắt buộc: vào giữa chừng không phát lớp đã lỡ).
- Tiến độ chuẩn v5: 1 Luyện Khí v5 (8,8 s) → 2 Trúc Cơ v3 "Linh Mạch Định Cơ" (10,8 s) → 3 Kim Đan v2 "Cửu Chuyển · Thiên Hỏa Đan Lô" (11,8 s). Tiếp theo: 4 Nguyên Anh (phải hơn Kim Đan v2: cả trời đổi sắc, 8 nhịp, vật vỡ + tia quét trời đã dùng → cần quy mô/nhịp lớn hơn nữa).

### Thang chấm khi tự đánh giá (ghi vào báo cáo, 1–5 mỗi mục, phải ≥ bản cảnh giới trước)
Lấp màn hình (trên/dưới) · Cấu trúc nhịp · Chất tu tiên (motif, thủy mặc, phù văn) · Cao trào · Hiện thân/dư âm · Nhân vật đọc rõ · Hiệu năng · Âm khớp hình. Không tự gọi "đẹp/đã duyệt" khi chủ game chưa xem; báo rõ phần chưa nghe bằng tai.

## Yêu cầu mới của chủ game — 04/11/2026 (ưu tiên hơn hướng dẫn cũ)

Phạm vi tiếp theo: **toàn bộ 10 cảnh giới sau Chân Tiên, realm 9–18**. Đọc kế hoạch chi tiết tại [references/post-chan-tien-plan-20261104.md](references/post-chan-tien-plan-20261104.md) trước khi triển khai.

- Mỗi cảnh giới là một nghi thức có kịch bản riêng, có nguyên nhân → biến cố → tích lực/hấp thụ → phá giới → hiện thân. Cấp cao tăng số diễn biến có ý nghĩa, quy mô không gian, tương tác và phối âm; không chỉ tăng màu, hạt, vòng hoặc kéo chậm animation.
- **Được thay thời lượng tổng theo kịch bản mới.** Quy định cũ “không đổi thời lượng tổng” bên dưới chỉ mô tả ràng buộc của lớp ghép cũ, không còn là giới hạn cho lần nâng cấp này. Đồng bộ mọi consumer, hàng chờ, mốc audio, reveal và test khi thay. Không tăng bằng cách nhân duration rồi stretch toàn bộ cue.
- **Giữ nguyên ngoại hình hiện tại cho tới sau điểm hấp thụ và cú nổ quyết định.** Chụp visualFrom lúc sự kiện được nhận, giữ qua hàng chờ; visualTo là trạng thái đích của chính sự kiện, không đọc skin mới từ snapshot hiện hành giữa chừng. Nếu có chuỗi đột phá, giữ đúng đầu/cuối của chuỗi thực sự được trình diễn.
- Vật thể chủ đề phải thực sự tác động: kiếm lao vào đan điền, long châu nhập thể, mảnh pháp ấn hợp nhất… → co nén → bùng nổ có lực → THEN đổi skin → hiện thân và dư âm. Không đổi áo trước rồi mới chạy hiệu ứng che lên.
- Không tạo hoặc thay model nhân vật. Dùng renderer/model/skin LIVE hiện có, cả nam, nữ và skin sự kiện đang mặc. Skin ưu tiên thủ công vẫn theo chính sách game; không tự ghi đè kho đồ hoặc skinChoice để làm cảnh.
- 15 ảnh chủ game gửi là tham khảo về diễn biến (phân thân, gương vỡ, thu hồi, cổng, thiên địa), không phải mẫu để sao chép nguyên giao diện, chibi, bố cục, chữ hay asset. Không lấy thông báo điện thoại/giao diện TikTok trong ảnh làm nội dung game.
- Nhiều âm thanh theo vật liệu và động tác: kiếm rít/vút, gió, sấm gần/xa, tiếng rạn/vỡ, long ngâm, tiếng mở cổng, nhạc nghi lễ phát triển nhiều đoạn. Không chồng mọi âm cùng lúc; cue dùng chung đồng hồ với hình. Tiếng gầm tổng hợp là thiết kế âm thanh giả tưởng, không tuyên bố là tiếng rồng thật.
- Sau Chân Tiên không dùng nhánh vẽ chung kéo dài + đổi màu làm thành phẩm. Dùng lại primitive/hệ render, không dùng lại nguyên cảnh. Có biến thể có giới hạn nhưng giữ nguyên logic nhân quả, điểm nhập thể và reveal.
- Triển khai theo lát dọc: hoàn chỉnh Huyền Tiên trước (hình + âm + skin + preview), rồi lần lượt lên cao. Không đồng loạt thay 10 cảnh bằng scaffold rồi gọi là xong.
- Không tự chạy thử đột phá trên LIVE thật. Dùng preview riêng và dữ liệu giả; kiểm chuyển động đầy đủ có âm thanh. Storyboard và test chỉ là một phần bằng chứng. Báo thật phần chưa xem/nghe.

## Luật bắt buộc (đã từng gây sự cố)

1. **Không tạo nhân vật / quái mới.** Nhân vật trong cảnh đột phá là model gốc của LIVE (`scene.drawPlayer`). Chỉ thêm hiệu ứng quanh nó.
2. **Không có cảnh nào lặp y hệt từng khung.** TikTok đã khoá quà 3 lần vì "reproduced content" khi cùng một cảnh đột phá chạy lặp liên tục. Mọi cảnh đột phá phải dùng `qiVariant(e)` (lật trái/phải, góc máy, nhịp hạt, cao độ âm) và không được tự kích hoạt dày đặc.
3. **Không phủ trắng đặc nhân vật lúc nổ.** Mức tô sáng nhân vật ≤ 0,4 (`Math.min(.4, …burst*.2…)`), và lọc điểm ảnh mờ trước khi tô (xem mục "Lỗi khối chữ nhật").
4. **Đồng bộ thời lượng tổng** của cảnh giới với hàng chờ, âm thanh và test. Với thay đổi mới realm 9–18, được tăng thời lượng bằng các đoạn truyện mới theo yêu cầu 04/11/2026; không stretch cảnh cũ. Lớp ghép cũ dùng `qiRemap`.
5. File awakening của cảnh giới ≥ 3 dùng **CRLF**: công cụ thay thế phải khớp cả `\r\n`, nếu không sẽ báo "không tìm thấy" hoặc cắt hỏng file. Sao lưu trước khi sửa vào `data/backups/<file>.<mô-tả>-<yyyymmdd>`.

## Quy trình cho một cảnh giới

### 1. Đánh giá bằng mắt trước
Chạy `node render-<ten>.mjs` (ví dụ `render-luyen-hu.mjs`) → mở `output/<ten>-v*/storyboard.png` (9 khung).
Công cụ render không nạp ảnh `jade-palace.png` (không có `Image` trong Node) nên nền thiên đài chỉ là màu trơn — bình thường.
Ghi lại cái thiếu. Danh sách lỗi hay gặp:
- Nền phẳng / nửa trên màn hình trống.
- Vệt cong rời rạc như "lưỡi liềm" (ribbon dày, alpha cao).
- Cao trào quá ngắn so với phần tích tụ; không có dư âm.
- Nhân vật bị phủ trắng thành khối; ảnh nhân vật/pháp tướng hiện **khối chữ nhật** xám hoặc mép cắt thẳng.
- Cú nổ không có cột sáng / tia / vòng xung kích; không có camera.
- Chữ cảnh giới phẳng, không danh hiệu.
- Âm toàn sóng sin mỏng, không có lớp bass/cồng ở cú nổ.

### 2. Tìm mốc nổ
Trong hàm state của cảnh giới tìm dòng kiểu `burst=ease((seconds-X)/…)` hoặc hằng `*_BURST` trong `*-timeline.js`. Mốc nổ chuẩn hoá `kb = X / (DURATION/1000)`.
Gốc năng lượng (`origin`) là đan điền: `{x:450, y:s.belly}` nếu state có `belly`, không thì `{x:450, y:s.feet-35}`.

### 3. Ghép lớp hình chung
Thêm import và bảng màu (4 màu, chọn theo màu chủ đạo của cảnh giới):

```js
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
const XX_PALETTE={main:'#…',main2:'#…',soft:'#…',gold:'#…'}; // main = màu khí chính, soft = gần trắng, gold = điểm nhấn
```

Trong hàm `draw…Awakening`, theo đúng thứ tự lớp:

```js
// sau khi vẽ nền + drawAscensionStageBackdrop(...)
const v=qiVariant(e),kq=qiRemap(s.k,kb),origin={x:450,y:s.belly};
setFxPalette(XX_PALETTE);                      // BẮT BUỘC: bảng màu là trạng thái chung của module
drawQiEnvironment(scene,c,kq,H,origin,true);   // true = chỉ tia nắng (giữ nền thiên đài/nền riêng)
pushFxCamera(scene,c,kq,v,s.feet);             // mở c.save(): camera đẩy vào + lật theo biến thể
// … lớp nền đất / trận đồ gốc …
drawQiInflow(scene,c,kq,origin,v.phase);       // hạt khí xoáy vào đan điền
// … các lớp phía sau nhân vật …
drawQiAura(scene,c,kq,origin,s.feet);          // hào quang sau nhân vật (chỉ hiện sau nổ)
// … vẽ nhân vật + lớp phía trước + cú nổ gốc …
drawQiCompression(c,kq,origin);                // điểm sáng + vệt lóe ngang trước nổ
drawQiImpact(scene,c,kq,H,origin,s.feet);      // chớp, cột sáng, tia tỏa, tia lửa, vòng xung kích
c.restore();                                   // đóng pushFxCamera
drawQiMotes(scene,c,kq,H);                     // mưa sáng (ngoài camera)
drawQiVignette(c,kq,H);                        // viền tối dồn mắt vào giữa
```

Thêm `subtitle` vào object `ui` trả về (danh hiệu lấy từ mảng `TITLES` trong `public/ascension-art.js`, ví dụ realm 6 = "Hư Không Khai Giới", 7 = "Vạn Kiếm Triều Tông", 8 = "Long Môn Đăng Tiên").

Nếu có vệt cong "lưỡi liềm": giảm bề rộng ribbon (~½) và alpha (~½) trong hàm vẽ dòng khí của cảnh giới đó, đừng xoá hẳn.

### 4. Lỗi khối chữ nhật (ảnh nhân vật / pháp tướng)
Ảnh nhân vật có vùng nền gần trong suốt; khi tô sáng (`source-in`) hoặc vẽ chế độ `screen` phóng to, vùng đó hiện thành khối chữ nhật.
- Vùng vẽ nhân vật: dùng `makeSurface(600,760)` (không phải 680 — 680 cắt chân).
- Trước khi tô, lọc alpha: `a.globalCompositeOperation='destination-in';a.drawImage(a.canvas,0,0);a.drawImage(a.canvas,0,0);` (alpha³).
- Bóng hồn / pháp tướng phóng to: tạo bản "ghost" một lần (alpha³ + phủ màu + mặt nạ tròn và mờ dần ở đáy), cache trên ảnh — xem `ghost()` trong `public/hoa-than-awakening.js`.

### 5. Âm thanh
Thêm một dòng vào `IMPACT_LAYERS` trong `public/audio.js`: `N:[giâyNổ, thờiLượngCue, nốtGốcHz]`. Lớp chung sẽ chồng âm dâng cắt đúng mốc nổ, bass hạ sâu, cồng, lấp lánh, hợp âm đọng, có đổi cao độ theo biến thể.
Nốt gốc mỗi cảnh giới một màu: đã dùng 174.6 (Kim Đan), 146.8 (Nguyên Anh), 110 (Hóa Thần) — chọn nốt khác cho cảnh giới mới.
Luật âm: lớp nào đã lỡ mốc (người xem vào giữa chừng) phải bỏ qua, không phát lại cú nổ cũ (`transient`).

### 6. Chữ cảnh giới
Trong `public/style.css` thêm realm mới vào nhóm `:is([data-realm="3"],…)` dùng `qiTitleIn` / `qiSubIn`, và một dòng `text-shadow` phát sáng theo màu cảnh giới. Font chữ HUD bị ép Arial (`!important`) vì dấu tiếng Việt — đừng đổi font hay `letter-spacing`.

### 7. Kiểm tra (nhanh, không cần chạy LIVE)
- `node --check` các file đã sửa.
- Render lại storyboard, nhìn khung nổ và khung cuối: không khối chữ nhật, nhân vật nhìn rõ, cột sáng mờ dần ở đáy.
- `node --test test/*.test.mjs` (toàn bộ, ~1 phút). Test nào ghi cứng số cũ thì sửa test theo số mới, giữ ý nghĩa test.
- Xem thử trong trình duyệt: `http://127.0.0.1:4317/ascension-preview.html?realm=N` (mỗi lần bấm là một biến thể khác).

### 8. Đưa lên
File trong `public/` được server tự đọc lại (kiểm tra mtime, `no-cache`) → **không cần khởi động lại server**, chỉ cần tải lại nguồn overlay trong TikTok LIVE Studio. Chỉ khi sửa file phía server (`*.mjs` ở gốc) mới phải khởi động lại (`start.cmd`), và nên làm lúc không LIVE.

## Báo cáo cho người dùng
Tiếng Việt, ngắn: cảnh giới nào, trước thiếu gì, giờ có gì, đã kiểm tra gì, phần nào chưa nghe/xem được (âm thanh không nghe thử được từ máy dòng lệnh).

## Tiến độ triển khai sau kế hoạch · Huyền Tiên v1

Realm 9 đã có renderer/timeline/audio riêng, 36s; absorbComplete=27, impact=28,2, reveal=28,65. Xem HUYEN-TIEN-V1-2026-11-04.md ở gốc dự án để biết bằng chứng/giới hạn. Không chạy lại scaffold hoặc dùng nhánh cũ cho realm 9. Realm 10–18 CHƯA được nâng cấp kịch bản; duration hiện đã cộng khoảng cách tương thích sau realm 9. Mỗi lượt chỉ làm một cảnh giới rồi báo cáo theo chỉ thị chủ game. Bản Huyền Tiên chưa có phản hồi thẩm mỹ từ chủ game, không tự coi là đã được duyệt đẹp/âm hay.

## Phản hồi bắt buộc áp dụng sau Huyền Tiên v1

Chủ game đã từ chối v1: vài hiệu ứng nhỏ, đầu cảnh trống, kiếm chậm và nhẹ, kéo dài cho đủ thời gian, kém Đại Thừa. Không được lấy “đã đủ 36s” hay test qua để gọi là đạt. Kiếm phải có động tác ngắn và sắc; khai cảnh có biến cố ngay; nhiều phần liên tiếp phải thay đổi tình thế thật. Xem HUYEN-TIEN-V2-2026-11-04.md ở gốc dự án. V2 đang dùng 36 kiếm thành ba tốp nhanh, sét phân nhánh đầu cảnh, hợp cự kiếm, ba nhát xé trời, kiếp lôi, nhập thể/phản phệ/thu hồi rồi mới nổ và đổi skin. Không khôi phục vòng kiếm đều của v1: hình vòng đều có thể quay nhanh về số học nhưng vẫn trông đứng yên. Phải xem frame sát nhau hoặc chuyển động thực để đánh giá tốc độ cảm nhận. V2 vẫn chờ nhận xét người dùng, chưa tự coi là đẹp/âm hay; chưa sang cảnh giới tiếp.

## Phản hồi và tiến độ Huyền Tiên v3 · 04/11/2026

Chủ game đánh giá v2 hình tạm ổn nhưng chuyển động thiếu ý nghĩa, nhiều nhịp dừng và quá dài. V3 rút riêng realm 9 xuống 26s; 36 kiếm khóa thành 12 trụ lưới hộ pháp, đỡ sét rồi dẫn lực lên kiếm chủ; thêm khí thoát cơ thể, nhạc trống/dây và hall reverb. Mốc thực: absorbComplete17.5, impact18.1, reveal18.55. Timeline giữ action clock nội bộ cho primitive và xuất real clock cho consumer; không dùng nhầm mốc 28.65 cũ. Xem HUYEN-TIEN-V3-2026-11-04.md. 416 test qua; chưa nghe/xem trực tiếp trọn clip, chưa tự coi được duyệt. Chủ game yêu cầu sau đó lập kế hoạch Kim Tiên khác concept, tìm phim tham khảo; đã có KIM-TIEN-PLAN-2026-11-04.md (29s dự kiến, chưa runtime). Phân biệt nguồn tìm được với cảnh thực sự đã xem; không bịa timecode/phân tích phim từ tiêu đề.

## Kim Tiên v1 · 05/11/2026

Chủ game yêu cầu cảnh tiếp khác toàn bộ concept/hình/nền và chỉ dài hơn1–2s. Realm10 đã có nghi thức riêng Thiên Lô Luyện Thân28s (Huyền Tiên26s); ba asset mới ở public/assets/kim-tien-v1, không dùng art/cue/hoạt cảnh realm cũ. Timeline19.6 nhập thể xong→20.2 nổ→20.65 reveal. Nhạc/SFX riêng, model/skin LIVE gốc và chính sách ngoại hình giữ nguyên. Xem KIM-TIEN-V1-2026-11-05.md; 424 test qua nhưng chưa coi đã duyệt nghệ thuật hay đã nghe trực tiếp. Không tự sang realm11 hoặc tự kích hoạt nghi thức thật.


## Hóa Thần v2 · 05/11/2026

Theo yêu cầu mới, nâng từ Hóa Thần trở lên từng cảnh một, hiện chỉ làm realm 5. Bản Thần Niệm Chấn Thiên 17,6s giữ mốc nổ14,4/reveal14,65; thêm module hoa-than-formation.js và nền storm-world.png riêng. Sét0,16s → biển khí đảo chiều → xuất hồn2s → sáu thiên ấn4,4s → sáu lôi khảo7,6..9,8s → CHÍNH thần hồn lớn thành pháp tướng10,5s → thu ấn12,8s → nhập thể xong14,25s → nổ → đổi skin. Không dựng hai pháp tướng độc lập. Cache ảnh LIVE gốc riêng cho realm5 (nam/nữ/skin sự kiện), stand1, restore toàn bộ flags, không sửa helper actorImage dùng bởi realm6/8. Nhân vật vẽ sau lớp nổ chung để mặt không bị cột sáng phủ trắng. Nhạc B thứ→Rê trưởng, trống/sét gần-xa/ấn đồng/đàn/dây riêng theo cue, cộng impact chung. Có video trước/sau30fps kèm tiếng, kiểm khung sát nhau, ba vòng sửa + vòng chốt. Xem HOA-THAN-V2-2026-11-05.md về số đo và giới hạn; chưa được chủ game duyệt, chưa tự gọi đẹp/âm hay. Dừng để báo cáo, chưa triển khai Luyện Hư.
