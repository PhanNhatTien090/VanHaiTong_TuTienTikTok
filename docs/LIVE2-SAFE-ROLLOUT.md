# VÂN HẢI TÔNG — LIVE 2.0 • Kế hoạch triển khai an toàn

Mã gốc tham chiếu: `43a6e12fa334861ac019c73b2681da8164eefdda`. Toàn bộ thay đổi LIVE 2.0 nằm trên nhánh `feat/live-2-gameplay-visuals`, PR nháp #4. **Chưa triển khai lên LIVE chính thức khi chưa kiểm thử.**

## Phạm vi đúng yêu cầu

- 5 đạo thống, 5 bậc Đạo Ngộ, kỹ năng có nhận diện hình ảnh và âm thanh
- Pháp bảo tinh luyện và Pháp Ấn sử dụng món đang đeo thật; chế 3 đan chiến thuật bằng linh thảo/linh thạch hiện có
- Bang hội độc lập Ngũ Đường: lập, vào, rời, đóng góp, vai trò, xây Đại Điện, Hội Chiến
- Sư đồ riêng ngoài Chân Truyền Ngũ Đường: xin/nhận, truyền đạo, nhiệm vụ ngày, xuất sư; đạo lữ dùng `social.bonds` có sẵn
- Vân Hải Tháp có 5 luật thử thách luân phiên; Boss giữ phases/loại sẵn có, cộng hưởng có trần; đột phá giữ nguyên tài nguyên và hoạt cảnh, thêm pháp ấn khi phù hợp
- 5 pháp ấn đạo thống, 6 ấn hoạt động xã hội/đan/pháp bảo/thiên kiếp và 5 biểu tượng thủ vệ. Ảnh tải theo nhu cầu, hoạt cảnh dùng RenderBudget/Canvas hiện có
- Bảng xem 4 thẻ giữ nguyên; túi đồ bổ sung đan mới, tinh luyện và Đạo Ngộ; command rail và hướng dẫn LIVE có lệnh mới

## Quy tắc dữ liệu bất biến

1. **Không xóa hoặc tái khởi tạo** `live.json`, `demo.json`, danh mục `CATALOG`, `social.bonds`, `nguDuong`, `towerFloor`, `realm`, `qi`, `totalQi`, `pills`, `artifacts`, `spiritPets`, `rewardSkins`.
2. Trạng thái mới tùy chọn ở `players[id].live2`, `world.live2World`; bản lưu giữ nguyên `version: 1`. Người chưa chọn đạo vẫn chơi cũ.
3. Không thêm quyền lợi từ quà để mở tính năng LIVE 2.0. Hội Chiến/pháp ấn/đan mới là gameplay miễn phí.
4. Toàn bộ hiệu ứng mới có mức trần, không có filter per-frame, không tải bộ asset mới cho mọi người chơi.
5. Khi client tắt VFX hoặc máy bị quá tải, server vẫn quyết định logic và phần thưởng.

## Cơ chế bật an toàn

- Ở **DEMO**: tự bật để kiểm tra, không nhận sự kiện quà/tim thật.
- Ở **LIVE**: mặc định **tắt**. Sau khi kiểm thử, vào **Thiết lập → Vân Hải Tông LIVE 2.0** trên giao diện quản lý localhost, chọn cờ và xác nhận. Máy chủ tự sao lưu đầy đủ world LIVE trước khi áp dụng. Không cần chỉnh trực tiếp `live.json`.
- Khi tắt lại bằng `settings.live2Enabled: false`, các module mới không nhận lệnh/tính buff; dữ liệu LIVE 2.0 được **giữ lại nhưng không hoạt động**. Hội Chiến đang mở được đánh dấu hủy mà không trả phần thưởng sai.
- Không merge PR nháp vào main cho tới khi hoàn tất QA.

## Ba cờ triển khai độc lập, không bật nhầm sân khấu

- `settings.live2Enabled: true`: bật hệ Đạo Thống, tinh luyện, đan chiến thuật và thẻ quan hệ trên LIVE. Mặc định bản LIVE **không bật**.
- `settings.live2GuildWarEnabled: true`: chỉ cho phép Hội Chiến nếu cờ LIVE 2.0 đang bật. Tắt giữa trận tự hủy, không trả thưởng và thả khóa sân khấu; không tự động tạo Hội Chiến.
- `settings.live2BossTrialsEnabled: true`: bật **riêng** cơ chế Boss ba pha. Nếu để false, Boss dùng luật cũ; có thể mở Đạo Thống mà chưa thay Boss.

Từng cờ cần được bật **chủ động bởi người điều hành sau sao lưu dữ liệu**, không gắn vào việc người chơi tặng quà. Dừng hẳn server trước khi sửa cấu hình lưu. Không reset `data/live.json` hoặc tạo world mới để triển khai tính năng.

## Kiến trúc hình ảnh và hiệu năng

- Scene Canvas/RenderBudget hiện tại là nguồn duy nhất vẽ nhân vật, không mở web game thứ hai.
- 11 pháp ấn SVG minh họa tải theo sự kiện và được cache; 5 phù hiệu thử thách tháp và 3 huy hiệu Boss ở các DOM HUD chỉ là ảnh tĩnh.
- Đạo Kỹ Đại Thành, Hội Chiến, phá ấn Boss và hộ kiếp viên mãn dùng hiệu ứng chéo màn / vết nứt Canvas theo cấp độ. Mức `light`, tắt chuyển động và `reduceFlash` giảm các tia/chớp và chi tiết rời.
- Lệnh hỏi `đạo tu`, `đạo lữ`, `hội`, `hội quản`, `sư môn`, `đan phương` không chen animation vào các màn quà, Boss hoặc độ kiếp.
- Giữ hệ xem tối đa bốn thẻ cạnh nhau; Bang Hội, Sư Đồ, Đạo Lữ và Đạo Thống dùng cùng hàng đợi, không chạy bộ render riêng.
- Mọi âm thanh LIVE 2.0 dùng mixer có sẵn, không tạo audio context mới; sự kiện thông tin và đa số nhịp thường không phát SFX.
- Bài đo `scripts/bench-live2.mjs` chỉ là CPU giả lập, **không được dùng làm kết luận FPS**. Phải xem máy thật và thử 20/50/80 người trong LIVE Studio trước khi bật.

## Lệnh mới, không giành quyền lệnh 1–9

- `đạo tu`, `chọn đạo kiếm/ma/thể/thú/đan`, `đạo ngộ`, `đạo kỹ`, `đổi đạo ...`
- `tinh luyện`, `pháp ấn`, `đan phương`, `chế đan hộ mạch/chiến ý/thanh tâm`, `đan dùng ...`
- `lập hội ...`, `vào hội ...`, `rời hội`, `hội`, `hội quản`, `hội phó ...`, `hội trưởng lão ...`, `hội xây`, `hội top`, `hội chiến`, `chiến hội`
- `xin sư ...`, `nhận đồ`, `truyền đạo`, `sư môn`, `xuất sư`, `đồng tâm`
- Trong lượt Tháp có luật tương ứng: `phá trận`, `hộ pháp`, `tâm linh`, `tâm tĩnh`; lệnh `đánh` bình thường vẫn dùng được

## Kiểm thử bắt buộc

- `npm ci`
- `npm run check`
- `npm test` (gồm test mới cho: đường tu, Đạo Ngộ, Guild War, quản lý hội, sư đồ, đan, túi đồ, tháp, flag, tích lũy điểm)
- `node scripts/render-live2-preview.mjs` → bộ ảnh QA 1080×1920, không phụ thuộc TikTok LIVE
- Trên máy chạy **LIVE Studio thực tế**: chụp FPS, P95/P99 frame time, RAM, độ trễ lệnh và âm thanh ở 20/50/80 nhân vật. So với baseline của cùng máy và cùng số lượng hoạt ảnh, giảm chất lượng để giữ độ ổn định trước khi cân nhắc thêm hiệu ứng.
- Kiểm tra khôi phục dữ liệu: sao lưu và mở lại `live.json`; thử tắt/bật flag; không double reward khi lệnh bị lặp, không đổi đồ cũ.
- Kiểm tra ưu tiên sân: quà lớn > đột phá > hội chiến > tháp/boss > lệnh xem. Hội Chiến sử dụng `stageConflict` hiện có, không tạo lịch phát xung đột.
- Kiểm tra luật âm thanh: vẫn dùng `CultivationAudio.cinematicCue()` để giới hạn 3 giọng đồng thời, không sinh AudioContext thứ hai.

## Vấn đề cần nghiệm thu thủ công trước khi gộp

Preview trong CI và `node --test` không thay thế phép đo trên LIVE Studio + TikFinity với dữ liệu thật. Phải tự kiểm tra độ rõ của pháp ấn, vị trí Hội Chiến trên màn dọc và độ trễ giọng khi có hoạt cảnh đột phá/boss. Nếu chưa đo và chưa xem trực quan thì **không gọi là bản LIVE hoàn chỉnh**.

## Điều hành bật/tắt có sao lưu (mới)

1. Chọn thế giới **LIVE** trong giao diện quản lý hiện có, mở tab **Thiết lập** (không phải bản web game).
2. Mặc định tắt toàn bộ. Chọn **LIVE 2.0** nếu muốn sử dụng Đạo Thống, pháp bảo/đan và quan hệ mới.
3. Chỉ chọn **Hội Chiến** sau khi sân khấu, luật trận và giới hạn nhân vật đã nghiệm thu; chỉ chọn **Boss ba pha** sau khi so sánh sát thương.
4. Bấm **Sao lưu và áp dụng LIVE 2.0**, đọc thông báo, xác nhận. Máy chủ tạo `data/backups/live2-prechange-*.json` chứa trạng thái world ngay trước thay đổi. Nếu không thể sao lưu thì **không thay đổi cờ**.
5. Không được bật luật chiến đấu mới giữa Boss hoặc lượt vượt Tháp đang chạy. Tắt khẩn cấp vẫn có thể thực hiện; server ngừng tính buff mới và tự hủy Hội Chiến chưa kết thúc.
6. Nếu gặp lỗi: tắt cả ba cờ qua bảng quản lý, kiểm tra lại dữ liệu. Muốn khôi phục từ bản sao thì **dừng hẳn server trước**, lưu riêng phiên bản lỗi và thay bản lưu bằng đúng snapshot đã chọn, không gộp hay ghi đè khi server đang chạy.

**Cảnh báo nghiệm thu:** CI và ảnh Canvas chỉ xác minh logic/render trong môi trường giả lập; FPS/frametime trên TikTok LIVE Studio thực phải đo riêng, không tuyên bố đã đo khi chưa có.
