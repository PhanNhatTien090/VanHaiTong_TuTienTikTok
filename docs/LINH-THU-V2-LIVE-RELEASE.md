# Vân Hải Tông — Linh Thú 2.0 LIVE
## Phạm vi

Triển khai trực tiếp trong server/overlay TikTok LIVE. Không phát triển gameplay web.

### Tính năng

- Giữ nguyên 13 ID linh thú, toàn bộ sở hữu cũ, lệnh `thú`, thú theo người, thời gian luân phiên pháp bảo, Linh Thú Cốc và animation gốc.
- Nuôi dưỡng & tiến hóa 4 giai đoạn; XP giới hạn theo ngày từ hoạt động miễn phí; thân thiết, cho ăn, huấn luyện.
- 13 tuyệt kỹ và 13 motif VFX riêng, khác vai trò support/attack/defense/control/drain; PvP áp dụng chiến thuật với giới hạn điểm, không phá luật tu vi chênh 3%.
- Bonus boss có giới hạn mỗi hit, mỗi người, toàn boss; combo hệ nguyên tố và cộng hưởng pháp bảo đúng trang bị người chơi đã sở hữu.
- Viễn chinh miễn phí 3 tuyến: `thú hành nguyet`, `thú hành hoa`, `thú hành tinh`.
- Linh Thú Cốc có 4 pha và cảnh ritual LIVE, hợp lực nhận thưởng miễn phí một lần mỗi sự kiện, không thay điều kiện nhận thú cũ.
- Giao diện bảng linh thú LIVE có ảnh tiến hóa, cấp, XP, độ thân thiết, kỹ năng, resonance và animation theo mức tải.
- 39 atlas hình thái tiến hóa (13 loài × 3 hình thái mới), **192 frame**: 8 loài kế thừa cấu trúc 3 tư thế, 5 thiên linh thú kế thừa 8 tư thế.
- Hình thái mới được tổng hợp bằng các lớp vẽ trang sức/cánh/pháp trận theo loài **trên từng tư thế animation gốc**, không phải 52 tạo hình nhân vật 3D hoàn toàn mới. Tạo ra đủ 192 khung khác nhau, **không làm mất** các tư thế gốc.
- Ảnh tiến hóa được tải theo nhu cầu, tối đa 2 atlas giải mã đồng thời, giới hạn cache sân khấu 8 MiB. Bảng ảnh thumbnail có cache LRU riêng 16 bản ghi; lỗi asset luôn fallback animation nguyên bản.

### Bật và tắt

Trong bản LIVE: quản lý mở giao diện Linh Thú Cốc → **Linh thú V2**. Mặc định V2 **TẮT** để bảo đảm phiên LIVE hiện hành không bị ảnh hưởng. Cờ `evolutionArt` chỉ được phép bật sau khi manifest QA phê duyệt toàn bộ 39 atlas.

Không chỉnh giá trị sở hữu linh thú, không reset dữ liệu hoặc tạo bản web chơi game. Chuyển giữa LIVE ↔ web không đưa schema `petGrowthV2` sang trạng thái web; cơ chế nuôi thú tạm ngưng khi nhân vật không còn trong LIVE.

### Lệnh bổ sung

| Lệnh | Hành động |
| --- | --- |
| `thú nuôi` | Dùng Linh Lương đã có để tăng XP và thân thiết |
| `thú luyện` | Huấn luyện 1 lượt/ngày |
| `thú kỹ` | Xem kỹ năng hiện tại |
| `thú hóa` | Tiến hóa khi đủ nhiệm vụ/cấp |
| `thú xuất` | Chuẩn bị/thi triển kỹ năng trong trận hợp lệ |
| `thú hành nguyet` | Viễn chinh Nguyệt Ảnh |
| `thú hành hoa` | Viễn chinh Xích Hỏa |
| `thú hành tinh` | Viễn chinh Tinh Vực |
| `thú duyên` | Tham gia sự kiện miễn phí trong Linh Thú Cốc |

### QA và benchmark

Chạy:
```sh
npm ci
npm run check
npm test
node scripts/verify-pet-v2-art.mjs
node scripts/benchmark-pet-v2-runtime.mjs
```

`test/pet-v2-*.test.mjs` kiểm tra giữ dữ liệu, chống phát thưởng lặp, tỷ thí, boss, viễn chinh, cộng hưởng, 192 tư thế, hình ảnh Canvas, thumbnail và hiệu ứng giảm tải. `Pet V2 Animation Performance Gate` kiểm tra Canvas headless tại 900×1400 với 10/20/50/100 thú, không phải FPS thực của OBS/TikTok LIVE Studio. Khi trình diễn LIVE cần kiểm tra bổ sung FPS thực, âm thanh, các thiết bị yếu và độ trễ mạng trước khi mở đồng loạt.

### Rollback

Tắt công tắc Linh Thú V2 trong phần quản lý để hoàn nguyên gameplay/ảnh hiển thị ngay mà **không xóa** `petGrowthV2`. Dữ liệu sở hữu cũ `spiritPets`/ `spiritPet` không bị migrate hay ghi đè. Có thể bật lại khi đã xác minh.

### Asset và bảo trì

Nguồn có sẵn: `public/assets/spirit-pets-v1/` và `art-source/spirit-pets-v2/`.
Atlas tiến hóa: `public/assets/spirit-pets-v2/evolutions/<id>/stage-<n>-drawn-v1.png|webp`.
Generator: `scripts/build-pet-v2-evolutions.mjs`, validator: `scripts/verify-pet-v2-art.mjs`.
Nếu thay asset, phải dựng lại và qua đủ QA trước khi tăng `PET_V2_ART_VERSION` ở manifest; không được thay nguyên một tấm tĩnh vào pipeline.
