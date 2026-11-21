# Âm đột phá trễ + rè từ Hóa Thần trở lên · 20/11/2026

## Đo (Chrome, đúng engine `CultivationAudio.scheduleRitual`, OfflineAudioContext 48 kHz)
| Cảnh giới | Số nút Web Audio dựng cùng lúc | Chi phí xử lý nặng nhất / 0,5 s âm |
|---|---|---|
| Luyện Khí–Nguyên Anh (1–4) | 320–650 | 60–115 ms |
| Hóa Thần (5) | ~900 | ~95 ms |
| Luyện Hư → Hỗn Độn (6–28) | 1.200–3.100 (Tiên Đế 3.117) | 250–350 ms |
- Không bị cắt đỉnh số (peak ≤ 0,84 trước master) → rè KHÔNG do to quá.
- Mốc nổ âm (IMPACT_LAYERS/BOOST_IMPACT) khớp mốc nổ hình (HT/LH/DT/Kim Tiên timing) → trễ KHÔNG do lệch thiết kế.
- Kết luận: từ Luyện Hư lên, đồ thị âm nặng gấp ~3 lần; máy LIVE (LIVE Studio + mã hóa + giọng VieNeu) bận thì luồng âm không kịp → vấp (rè) và đồng hồ âm chậm dần so với hình (trễ). Trên máy đám mây (âm giả, không tải) không tái hiện được rè — chưa đo trên máy LIVE.

## Sửa (`public/audio.js`, `public/app.js`)
1. **Dựng trước** (`prerenderRitual`): người chơi gần đủ đột phá (≥85% tu vi + linh thạch) lên cảnh giới ≥ Hóa Thần → overlay dựng phần nặng (nền + tăng cường + nhịp nổ) thành bản thu bằng OfflineAudioContext (luồng riêng, không cần đúng giờ; Tiên Đế ~11,6 s trên máy đám mây 2 nhân). Giữ tối đa 3 cảnh giới (~20–66 MB). Chỉ dựng khi không có màn đột phá đang chiếu, mỗi lần 1 cảnh giới, ưu tiên người tặng quà nhiều.
2. Lúc chiếu (`playPrerendered`): 1 nguồn âm phát đúng vị trí + lớp biến thể nhẹ (~117 nút) dựng trực tiếp; Luyện Hư giữ lớp điện ảnh trực tiếp. Âm giống hệt bản dựng trực tiếp (so đường bao: lệch 0). Chưa kịp dựng → chạy như cũ.
3. **Bù độ trễ ra loa**: lịch âm đi trước đúng `outputLatency` (thường 10–40 ms). Nếu trên LIVE vẫn thấy âm chậm hơn hình (LIVE Studio thu âm có độ trễ riêng): thêm `&audioLead=150` (ms, tối đa 400) vào link nguồn overlay.
4. `ritualBuild` (gửi trong client-status) có thêm `prerendered`, `leadMs` để kiểm trên LIVE.
