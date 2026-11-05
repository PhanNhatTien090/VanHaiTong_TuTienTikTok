# Kế hoạch nâng cấp đột phá sau Chân Tiên · 04/11/2026

Trạng thái: **kế hoạch đã viết, chưa thay runtime hoặc đưa hiệu ứng mới lên LIVE**. Yêu cầu hiện tại là lập kế hoạch. Tài liệu này là hướng triển khai, không phải xác nhận chất lượng thành phẩm.

## 1. Hiện trạng đã đối chiếu code

- Các realm 1–8 có renderer riêng; Chân Tiên dài 31,6 giây, hiện thân ở 27,6 giây.
- Realm 9–18 đi vào cùng nhánh `drawRitual` trong `public/live-cinema.js`: cùng gather/formation/surge/burst/reveal, cú nổ ở khoảng 71%, đổi người vẽ ở 72%. Khác chủ yếu ảnh, màu và vài hoa văn.
- `public/ascension-art.js` tăng thời lượng realm 9–18 từ 31,847 lên 34,071 giây, chênh chỉ khoảng 0,247 giây mỗi bậc. Realm 14–18 đều dùng cell 5 của atlas high, có đổi hue. Thời lượng dài không tạo thêm nội dung.
- `public/scene.js` chỉ gọi nghi thức audio chuyên biệt khi realm ≤8. Realm >8 dùng các one-shot ở mốc tỷ lệ chung. Chỉ thêm tiếng nổ sẽ không đủ giải quyết thiếu diễn biến và âm nhạc.
- `visualFrom/visualTo` đã tồn tại; cần củng cố đường chụp ngoại hình, cache và hàng chờ, không xây lại hệ nhân vật.
- Đây là kết luận từ code; chưa phải đánh giá chuyển động/âm thanh trực tiếp của 10 cảnh hiện tại.

## 2. Hướng nghệ thuật và tiêu chí tăng cấp

Bản sắc Vân Hải: mây sâu, ánh ngọc, kim loại cổ, khoảng trời có chiều sâu, sức mạnh làm môi trường biến đổi. PNG chi tiết kết hợp Canvas/DOM để có bay, xoay, vỡ, nhập thể và camera. Không dùng hình học phẳng làm cung điện thành phẩm, không để ảnh lớn đứng yên làm toàn bộ cảnh.

Tham khảo ảnh: học cách một đạo cụ biến đổi qua nhiều trạng thái (gương nguyên → mảnh vỡ → phân thân → thu hồi), đối lập rộng/hẹp, nhịp yên trước bùng nổ. Không sao chép nhân vật chibi, vòng trận, cầu thang/cổng hoặc chữ của game kia.

Mỗi bậc phải hơn bậc trước ở ít nhất một diễn biến chính và một tương tác không gian; không bắt buộc lúc nào cũng nhiều vật thể hơn. Đoạn mới phải thay đổi trạng thái câu chuyện. Không đạt nếu giữ nguyên cảnh chỉ thêm vòng, kéo chậm, tăng hạt hoặc camera rung mạnh.

## 3. Mười nghi thức riêng

Thời lượng dưới đây là mục tiêu storyboard ban đầu, có thể chỉnh theo dựng thử; không tự động stretch. Cấp cao có nhiều phần liên tiếp hơn, không lặp lại toàn bộ cảnh cấp dưới.

| Realm | Chủ đề riêng / mục tiêu | Chuỗi diễn biến có quan hệ nhân quả | Vật hấp thụ, nổ và hiện thân |
|---|---|---|---|
| 9 · Huyền Tiên | **Huyền Tinh Chuyển Mệnh**, khoảng 36s | Mây bị hút lên → dòng tinh hà xuất hiện dưới chân → các mảnh thiên thạch phát sáng được triệu hồi → chạm nhau rèn thành tinh kiếm → kiếm khai mở đường sao → các đường sao dẫn kiếm về chủ | Tinh kiếm lần lượt nhập đan điền → cả bầu trời khựng ngắn → lõi sao nổ lam/bạc → skin mới hiện giữa bụi sao và tinh đồ vừa đổi vị trí |
| 10 · Kim Tiên | **Kim Liên Bất Diệt**, khoảng 40s | Biển mây rút thành hồ đen ánh kim → hạt sen thức tỉnh theo bước chân → sen nổi lên, nở theo nhiều tầng → kiếp hỏa cháy cánh ngoài → sen tự tái sinh → giọt kim dịch theo gân sen bay về người | Giọt cuối kết thành liên tâm nhập thể → hoa hóa tro sáng → bùng kim quang có vùng tối giữ hình → hiện thân trên sen mới đang mở |
| 11 · Thái Ất | **Lưỡng Nghi Định Thiên**, khoảng 44s | Trời và đất tách thành hai dòng triều trái chiều → nhân vật giữ tâm → hai mặt nước tạo bóng phản chiếu → bóng thử thoát khỏi quỹ đạo → nhân vật hợp hai dòng qua động tác dẫn khí → thanh/trọc trao đổi → hợp thành đạo ấn | Hai nửa ấn xuyên từ trước/sau vào tâm → sóng nén dừng ngắn → nổ xé ranh giới sáng/tối → skin mới lộ khi trời đất khép lại |
| 12 · Đại La | **Vạn Ảnh Chứng Đạo**, khoảng 48s | Sương thành các cửa gương có chiều sâu → phản chiếu là chính skin cũ → phân thân bước ra theo các thời điểm khác nhau → một nhát cắt làm gương rạn → các bóng thành đường thời gian → nhân vật lần lượt thu hồi bóng → mảnh gương quay ngược về tâm | Phân thân cuối nhập người, mảnh vỡ hóa ấn → nổ làm rạn lớp không gian phía sau → skin mới hiện; mảnh còn lại tan từ gần tới xa |
| 13 · Tiên Đế | **Cửu Thiên Sắc Mệnh**, khoảng 53s | Bão mây mở đại thiên điện → chín đạo kiếm ấn đánh thức các trụ xa → long ảnh đi xuyên mây → thiên lôi thử kiếm ấn → nhân vật phá kiếp lôi → các ấn hợp thành đế kiếm → kiếm cắt bỏ ngai hư ảnh → long châu và sắc mệnh hạ xuống | Đế kiếm hóa dòng kim lực nhập thể → sắc mệnh đóng ấn → cú nổ đẩy mây khỏi thiên điện → skin mới rồi ngai/đế vực mới thành hình. Không bắt đầu bằng người đã mặc đế bào |
| 14 · Đạo Tổ | **Nhất Bút Sinh Đạo**, khoảng 58s | Tinh hà tắt từng vùng → còn người và một nét sáng → động tác dẫn khí khắc nét đạo → mỗi nét sinh địa hình/dòng nước → văn tự bị hỗn độn ăn mòn → người tháo các nét thành hạt → nối lại thành quy luật mới → quy luật làm thế giới vận hành → đạo chủng sinh ra | Đạo chủng quay qua các cảnh vừa tạo rồi nhập người → sóng nổ lan theo đường đạo → skin mới; thiên địa sau lưng tiếp tục vận hành, không reset thành nền cũ |
| 15 · Thiên Tôn | **Cửu Tiêu Quy Nhất**, khoảng 63s | Tầng trời hiện theo chiều sâu → thiên phong mở tầng một → lôi hải giữ tầng hai → các thiên quan lần lượt thức tỉnh → nhân vật dẫn một đường lực xuyên các cửa → cửa quay về thành các phiến sắc lệnh → chín phiến va nhau sinh thiên ấn → đập tan xiềng trời → ấn hạ xuống | Từng phiến nhập thể theo nhịp, ấn cuối phá khóa → nổ làm toàn bộ tầng trời mở ra → skin mới hiện trên dòng mây đang hồi lưu |
| 16 · Thần Quân | **Hồng Mông Thần Hiện**, khoảng 68s | Không gian mở vào hồng mông → các nguyên chất tách khỏi sương → đúc khung thần giáp quanh người cũ → thần hỏa tôi từng mảnh → lôi đánh thử, một lớp ngoài rạn → nhân vật hấp thụ lôi thay vì né → mảnh giáp bay rời thành binh khí → binh khí hợp thần hạch → thần ảnh phía sau cúi về tâm | Thần hạch và thần ảnh hợp nhất → giáp tan thành bụi nhập người → nổ mở thần vực → skin mới hiện sau cùng; không mặc giáp mới ngay lúc đang rèn |
| 17 · Thần Vương | **Vạn Giới Triều Vương**, khoảng 74s | Gió hồng mông cuốn ra biển giới → các cửa giới mở, mỗi cửa có môi trường riêng → dòng lực xung đột → một cửa sụp tạo sóng vỡ → người giữ lại các mảnh giới → sắp lại đường liên kết → các cửa quy phục lần lượt → lực hóa vương kiếm → vương kiếm đánh thức vương ấn → vương ấn hút toàn bộ dòng triều | Kiếm/vương ấn cùng nhập thể → nổ không gian từ tâm tới từng cửa giới → skin mới hiện; cửa còn lại phản ứng trễ theo chiều sâu |
| 18 · Thần Đế | **Tịch Diệt Khai Thiên**, khoảng 82s | Thiên địa ngừng vận hành → ánh sáng bị kéo khỏi biển giới → nhân vật cũ đối diện khoảng không → các quy luật cũ vỡ thành bụi → cự kiếm dựng từ bụi giới → một nhát khai thiên tạo khe sáng → long ảnh mang nguyên hỏa đi qua khe → nguyên hỏa đốt cự kiếm thành chủng sáng → chủng sinh trời/đất/tinh hà mới → thế giới mới trả sinh lực về người → tất cả tinh lực hợp về tâm → một nhịp im tuyệt đối | Chủng sáng nhập thể hoàn toàn → nổ khai thiên có nhiều mặt sóng, không phủ trắng màn → skin Thần Đế hiện khi bụi tan → trời đất mới vận động → danh hiệu xuất hiện muộn, kết bằng một động tác chứ không đứng chờ |

Không nhồi long/sen/kiếm vào tất cả cảnh. Tái dùng vật liệu theo vai trò khác nhau, nhưng mỗi bậc có một hình ảnh chủ đạo dễ nhớ.

## 4. Lát dọc đầu tiên: Huyền Tiên 36 giây

| Giây | Hình, hành động và chuyển cảnh | Âm thanh |
|---|---|---|
| 0–3 | Skin hiện tại đứng giữa mây; áo/gió phản ứng, camera hạ thấp rồi nhìn lên | Gió có thân, tiếng mây rền; nhạc chỉ một âm nền |
| 3–7 | Trời mở dòng tinh hà có các lớp xa/gần; mặt đất phản sáng | Không gian mở, chuông đá thưa, dây trầm bắt đầu câu |
| 7–12 | Thiên thạch đi theo đường riêng; va nhau rèn thành tinh kiếm, có mảnh vụn mất đi | Vút theo hướng bay, va kim loại/đá có khoảng ngắt; không phát âm cho từng hạt |
| 12–17 | Tinh kiếm phóng đi khai tinh lộ; camera bám một kiếm rồi trở về người | Kiếm rít sắc ngắn, gió theo đường đi; nhạc thêm nhịp trống |
| 17–23 | Tinh lộ dẫn các kiếm trở lại; mỗi đợt gần người hơn, vẫn skin cũ | Ba câu kiếm đáp nhau trái/phải; nhịp tích lực tăng, bass kiềm lại |
| 23–27 | Kiếm thu hẹp, mũi xoay về đan điền rồi nhập từng đợt; đợt cuối còn thấy rõ | Từng đợt hút/kim ngân; tiếng cuối trầm và có lực hơn, không thành tiếng bắn liên thanh |
| 27–28,2 | Toàn bộ đường sao co vào; ngực/đan điền giữ lõi sáng nhỏ, môi trường tối lại | Gió hút rút nhanh, nhạc cắt ngắn trước nổ |
| 28,2–28,65 | Nổ lam bạc, mây bị đẩy ra, khối sáng tách phía trước/sau thân | Va trầm + tiếng rạn sao + kim loại tỏa; cùng đúng một mốc |
| 28,65–33 | Mới chuyển visualTo; ánh sáng rút khỏi viền áo, nhân vật giơ tay định tinh đồ | Hợp âm mở, cồng xa, lớp ngân thanh; lời đọc cảnh giới sau đỉnh tiếng nổ |
| 33–36 | Dư chấn tới các sao xa, bụi lắng, camera trở về cảnh LIVE | Gió nhẹ, đuôi vang và câu nhạc kết, trả nhạc nền mềm |

Khoảng 4 giây hiện thân vẫn có hành động và thế giới phản ứng, không kéo dài ảnh đứng yên. Mốc sẽ được chỉnh nếu preview cho thấy kiếm nhập quá lâu hoặc nhạc dồn.

## 5. Hợp đồng ngoại hình và timeline

- Giữ `visualFrom` là snapshot ngoại hình thật (realm, gender, skinChoice, rewardSkins, thần trang và các trường renderer cần) tại sự kiện. `visualTo` là trạng thái đích đã xác định, không lấy lại từ playerIndex sau nhiều lượt nâng cấp.
- `skinBefore` giữ xuyên suốt các shot kể cả pháp tướng/ảnh phản chiếu. Không dùng ảnh skin đích làm bóng báo trước nếu chưa được chủ game yêu cầu.
- Ranh giới rõ: `absorbComplete <= impactAt < revealAt < endAt`. Không lách bằng đổi skin mới ở đầu cú lóe rồi che đi.
- Các lớp phụ ngoài nghi thức (pet/pháp bảo thường trực/mini dragon) cần ẩn nhất quán khi cạnh tranh chủ đề, giữ nguyên kho sở hữu và phục hồi sau cảnh.
- Nếu skin thủ công có ưu tiên và cả trước/sau trông giống nhau, tôn trọng hệ lựa chọn. Dùng thần quang/ấn chứng đạo để thể hiện thành tựu, không giả vờ đã đổi một skin không được phép.
- Cache actor cần khóa theo fingerprint ngoại hình + event + trạng thái trước/sau, không chỉ realm. Chú ý `actorImage` hiện có cache theo realm.
- Hàng chờ đang gộp nhiều đột phá một người: phải giữ visualFrom đầu chuỗi và visualTo cuối chuỗi; test khi lên liên tiếp và bị hoãn vì quà/sự kiện.

## 6. Cấu trúc triển khai đề xuất

- Thêm `public/high-ascension-timelines.js`: cấu hình shot, phase, absorb, impact, reveal, return, audio cue IDs theo giây tuyệt đối cho realm 9–18. Một nguồn dữ liệu, không nhân tỷ lệ mọi âm theo tổng duration.
- Renderer riêng `public/<realm>-awakening.js`; layer dùng lại `qi-impact.js`, `cinema-atmosphere.js`, `cinematic-world.js` khi phù hợp. `live-cinema.js` làm dispatcher và HUD, không chứa 10 nghi thức trong một nhánh khổng lồ.
- `ascensionProfile.duration`, `breakthroughDuration`, `presentationDuration`, title và preview lấy từ timeline này, tránh import vòng. Module dữ liệu timeline không import renderer.
- `audio.js` nhận nghi thức realm 9–18; bỏ one-shot tỷ lệ cũ ở `scene.js` khi renderer mới có lịch âm riêng, tránh hai cú nổ đè nhau. Renderer và cue lấy cùng đồng hồ `t - start`.
- Reuse `ascension-score.js` để điều phối, bổ sung sample player cho chất liệu cần thu âm. Không thay toàn bộ audio engine chỉ vì một cảnh mới.
- Phân loại reduced motion: camera ổn định, giảm quay/rung và vật thể nền; vẫn thấy đủ các bước nhập thể → nổ → hiện thân.
- Các lớp high/light giảm số vật thể xa, độ phân giải mây, chi tiết trail; không bỏ bước hấp thụ hoặc rút ngắn sai thời điểm đổi skin.

## 7. Âm thanh: tuyển chất liệu rồi mới ghép rộng

Mỗi cue có tên, chất liệu, vai trò, mốc vào/ra, pan theo vật thể và độ ưu tiên. Ví dụ `hx.sword.return.01`, `hx.absorb.final`, `hx.impact`, `hx.reveal.chord`.

- Kiếm: foley vút có thân + cạnh kim loại ngắn + đuôi ngân thay đổi theo kích thước; không dùng một tiếng sine cao cho mọi đường kiếm.
- Gió: lớp xa rộng + một lớp hút tập trung khi nhập thể, không hiss liên tục suốt cảnh.
- Sấm: rạn gần có đầu rõ, tiếng cuộn xa đến sau theo không gian; không chồng cả hai vào mọi nhát kiếm.
- Vỡ: tiếng rạn dẫn tới từng mảnh rồi đuôi rơi, phân biệt kính sao, đá ấn và kim loại.
- Long ngâm: thiết kế giả tưởng từ chất liệu có quyền sử dụng và xử lý; có hơi, thân trầm và đuôi không gian. Tuyển 2–3 ứng viên có khác biệt, nghe thử trước khi nhân rộng.
- Nhạc: motif riêng ngắn của Vân Hải, phát triển qua mở cảnh → dẫn truyện → đối kháng → tích lực → khoảng lặng → vinh danh; nhạc càng cao càng thêm đoạn biến hóa, không chỉ tăng volume. Giữ tiếng gió/kiếm rõ trước nhạc.
- Ưu tiên tiếng quyết định và voice đọc tên sau nổ, duck nhạc vừa đủ. Mute/ngắt/tua vào giữa cảnh phải dừng sạch, bỏ các transient đã qua và không phát lại vụ nổ từ đầu.
- Lưu nguồn/license/credit, file gốc và các bước xử lý cho sample mới; chỉ kiểm điều khoản khi tuyển nguồn thực tế, không mặc định “free” là dùng thương mại được.

## 8. Trình tự làm và bằng chứng hoàn thành

1. Dựng bảng khung hiện trạng realm 9, 13, 18 và so với Luyện Khí/Chân Tiên; ghi lỗi cụ thể ở hình, đổi skin và âm. Không suy chất lượng chỉ từ độ dài.
2. Hoàn chỉnh Huyền Tiên 36s ở preview riêng: from/to thật, 10 đoạn hình-âm ở trên, reduced motion và ba biến thể. Không chỉnh phần thưởng/tài khoản/gameplay.
3. Xem toàn cảnh có chuyển động, kiểm các đoạn 23–29s khung sát nhau; nghe cả solo SFX và mix. Nếu chưa có khả năng nghe phải báo chưa kiểm, không dùng peak/RMS thay đánh giá tai.
4. Khi đạt tiêu chí, áp dụng cấu trúc và hoàn thiện lần lượt Kim Tiên → Thái Ất → Đại La → Tiên Đế; mỗi cảnh phải có storyboard và audio cue sheet riêng.
5. Tiếp Đạo Tổ → Thiên Tôn → Thần Quân → Thần Vương → Thần Đế; kiểm lại tính tăng cấp sau từng bậc, không clone cảnh Tiên Đế đổi màu.
6. Cuối cùng kiểm toàn bộ chuỗi 9–18, thỉnh thoảng phát lại cảnh thấp để nhận ra mức chênh; xuất bản trước/sau và video xem thử có âm thanh khi triển khai thực tế.

Tiêu chí bắt buộc trước khi gọi một cảnh xong:

- Theo dõi được vật thể từ lúc sinh tới lúc nhập thể, có phản ứng khi chạm; không teleport không nguyên nhân.
- Skin cũ thấy được ngay trước impact, skin đích chỉ hiện sau reveal; test cả nam/nữ, áo thường/skin sự kiện và cảnh liên tiếp.
- Không khối chữ nhật alpha, không cắt chân/đầu, không vệt sáng che mặt kéo dài, chữ tiếng Việt rõ.
- Ba biến thể khác góc/đường lực/cấu hình nhưng vẫn giữ nhân quả và reveal; seeded, tua lại xác định, không random mỗi khung.
- Kiểm 30/60 FPS, quality light/balanced/high, tỷ lệ dọc LIVE, frame time và bộ nhớ không tăng không giới hạn. Đo trên môi trường thực, không tự cam kết mượt từ test logic.
- Âm/hình dùng cùng mốc, không double impact, không phát tiếng cũ khi vào giữa cảnh; mute/unmute/skip sạch.
- Test queue không gộp sai ngoại hình, duration khớp scheduler, kết thúc tự trở lại sân khấu, không rơi quà đến trong lúc nghi thức dài.
- Chạy cú pháp và full suite thích hợp sau thay runtime; xem/nghe preview trước khi nạp nguồn LIVE. Không tạo đột phá giả trên LIVE thật.

## 9. Việc hoàn thành trong lượt lập kế hoạch

Đã đối chiếu renderer/duration/audio/skin queue và cập nhật skill theo yêu cầu mới. Chưa tạo asset hay tuyển sample, chưa đổi runtime, chưa thay các hiệu ứng đang phát. Thời lượng 36–82s là mục tiêu thiết kế và phải được đánh giá bằng chuyển động thật khi triển khai.
