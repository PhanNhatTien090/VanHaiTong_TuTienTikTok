# VÂN HẢI TÔNG — LIVE 2.0 • Kế hoạch triển khai an toàn

Mã gốc tham chiếu: \`43a6e12fa334861ac019c73b2681da8164eefdda\`. Toàn bộ thay đổi LIVE 2.0 nằm trên nhánh \`feat/live-2-gameplay-visuals\`, PR nháp #4. **Chưa triển khai lên LIVE chính thức khi chưa kiểm thử.**

## Phạm vi đúng yêu cầu

- 5 đạo thống, 5 bậc Đạo Ngộ, kỹ năng có nhận diện hình ảnh và âm thanh
- Pháp bảo tinh luyện và Pháp Ấn sử dụng món đang đeo thật; chế 3 đan chiến thuật bằng linh thảo/linh thạch hiện có
- Bang hội độc lập Ngũ Đường: lập, vào, rời, đóng góp, vai trò, xây Đại Điện, Hội Chiến
- Sư đồ riêng ngoài Chân Truyền Ngũ Đường: xin/nhận, truyền đạo, nhiệm vụ ngày, xuất sư; đạo lữ dùng \`social.bonds\` có sẵn
- Vân Hải Tháp có 5 luật thử thách luân phiên; Boss giữ phases/loại sẵn có, cộng hưởng có trần; đột phá giữ nguyên tài nguyên và hoạt cảnh, thêm pháp ấn khi phù hợp
- 5 pháp ấn đạo thống, 6 ấn hoạt động xã hội/đan/pháp bảo/thiên kiếp và 5 biểu tượng thủ vệ. Ảnh tải theo nhu cầu, hoạt cảnh dùng RenderBudget/Canvas hiện có
- Bảng xem 4 thẻ giữ nguyên; túi đồ bổ sung đan mới, tinh luyện và Đạo Ngộ; command rail và hướng dẫn LIVE có lệnh mới

## Quy tắc dữ liệu bất biến

1. **Không xóa hoặc tái khởi tạo** \`live.json\`, \`demo.json\`, danh mục \`CATALOG\`, \`social.bonds\`, \`nguDuong\`, \`towerFloor\`, \`realm\`, \`qi\`, \`totalQi\`, \`pills\`, \`artifacts\`, \`spiritPets\`, \`rewardSkins\`.
2. Trạng thái mới tùy chọn ở \`players[id].live2\`, \`world.live2World\`; bản lưu giữ nguyên \`version: 1\`. Người chưa chọn đạo vẫn chơi cũ.
3. Không thêm quyền lợi từ quà để mở tính năng LIVE 2.0. Hội Chiến/pháp ấn/đan mới là gameplay miễn phí.
4. Toàn bộ hiệu ứng mới có mức trần, không có filter per-frame, không tải bộ asset mới cho mọi người chơi.
5. Khi client tắt VFX hoặc máy bị quá tải, server vẫn quyết định logic và phần thưởng.

## Cơ chế bật an toàn

- Ở **DEMO**: tự bật để kiểm tra, không nhận sự kiện quà/tim thật.
- Ở **LIVE**: mặc định **tắt**. Chỉ bật sau khi kiểm thử bằng \`settings.live2Enabled: true\` trong \`data/live.json\` khi server đã tắt và đã sao lưu cả thư mục \`data\`.
- Khi tắt lại bằng \`settings.live2Enabled: false\`, các module mới không nhận lệnh/tính buff; dữ liệu LIVE 2.0 được **giữ lại nhưng không hoạt động**. Hội Chiến đang mở được đánh dấu hủy mà không trả phần thưởng sai.
- Không merge PR nháp vào main cho tới khi hoàn tất QA.

## Lệnh mới, không giành quyền lệnh 1–9

- \`đạo tu\`, \`chọn đạo kiếm/ma/thể/thú/đan\`, \`đạo ngộ\`, \`đạo kỹ\`, \`đổi đạo ...\`
- \`tinh luyện\`, \`pháp ấn\`, \`đan phương\`, \`chế đan hộ mạch/chiến ý/thanh tâm\`, \`đan dùng ...\`
- \`lập hội ...\`, \`vào hội ...\`, \`rời hội\`, \`hội\`, \`hội quản\`, \`hội phó ...\`, \`hội trưởng lão ...\`, \`hội xây\`, \`hội top\`, \`hội chiến\`, \`chiến hội\`
- \`xin sư ...\`, \`nhận đồ\`, \`truyền đạo\`, \`sư môn\`, \`xuất sư\`, \`đồng tâm\`
- Trong lượt Tháp có luật tương ứng: \`phá trận\`, \`hộ pháp\`, \`tâm linh\`, \`tâm tĩnh\`; lệnh \`đánh\` bình thường vẫn dùng được

## Kiểm thử bắt buộc

- \`npm ci\`
- \`npm run check\`
- \`npm test\` (gồm test mới cho: đường tu, Đạo Ngộ, Guild War, quản lý hội, sư đồ, đan, túi đồ, tháp, flag, tích lũy điểm)
- \`node scripts/render-live2-preview.mjs\` → bộ ảnh QA 1080×1920, không phụ thuộc TikTok LIVE
- Trên máy chạy **LIVE Studio thực tế**: chụp FPS, P95/P99 frame time, RAM, độ trễ lệnh và âm thanh ở 20/50/80 nhân vật. So với baseline của cùng máy và cùng số lượng hoạt ảnh, giảm chất lượng để giữ độ ổn định trước khi cân nhắc thêm hiệu ứng.
- Kiểm tra khôi phục dữ liệu: sao lưu và mở lại \`live.json\`; thử tắt/bật flag; không double reward khi lệnh bị lặp, không đổi đồ cũ.
- Kiểm tra ưu tiên sân: quà lớn > đột phá > hội chiến > tháp/boss > lệnh xem. Hội Chiến sử dụng \`stageConflict\` hiện có, không tạo lịch phát xung đột.
- Kiểm tra luật âm thanh: vẫn dùng \`CultivationAudio.cinematicCue()\` để giới hạn 3 giọng đồng thời, không sinh AudioContext thứ hai.

## Vấn đề cần nghiệm thu thủ công trước khi gộp

Preview trong CI và \`node --test\` không thay thế phép đo trên LIVE Studio + TikFinity với dữ liệu thật. Phải tự kiểm tra độ rõ của pháp ấn, vị trí Hội Chiến trên màn dọc và độ trễ giọng khi có hoạt cảnh đột phá/boss. Nếu chưa đo và chưa xem trực quan thì **không gọi là bản LIVE hoàn chỉnh**.
