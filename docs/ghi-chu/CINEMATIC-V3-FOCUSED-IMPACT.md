# Cinematic V3 — Focused impact (đợt 1)

Cơ sở: `d9be0aa`. Nhánh này là **bản thử nghiệm để review bằng Pull Request**, không được triển khai LIVE tự động.

## Thay đổi

- **Chất lượng VFX cảnh solo:** `cinematicQuality(scene, {focused:true})` không còn dùng số hồ sơ active hoặc `visibleActors` của frame quảng trường trước làm lý do ép Light. Cảnh focus chỉ được chọn ở `Scene.addEffect()` khi thực sự đã tạo presentation solo phù hợp người chơi. Đặt Performance thủ công và áp lực FPS đã phát hiện vẫn ép Light. Focus tự động ưu tiên Balanced; High chỉ khi quản trị viên chọn High.
- **Luyện Hư:** thêm vết nứt/cổng hư không riêng, gồm viền năng lượng đối xứng, vệt rạn nứt và điểm sáng nội tại. Texture 384×384 được raster một lần khi tạo Scene; mỗi frame chỉ dán hai nửa texture (2 `drawImage`), tách dần theo cú nổ `LH_TIMING.impact`, tan sau khoảng 1,2 s. Cổng đứng **sau nhân vật**, không che hình thái mới. Reduced Motion giữ ảnh tĩnh. Không đổi mốc hiện thân, nhân vật hay gameplay.
- **Quà 500–2.999 coin:** kích hoạt đường VFX V2 nhẹ thay vì chỉ legacy. Dùng shockwave 180 logical units, Light particles, một impact ngắn, không tạo echo/flash lớn. Chỉ tier từ 3.000 coin trở lên được hai nhịp lớn và cue Long-Phượng như trước.
- **Âm thanh theo tier:** tier thấp dùng `jade` hoặc `resonance` với gain và priority thấp; tier lớn giữ `gold` và echo. Không tăng master gain, không thay âm thanh đột phá hay VieNeu.
- **Camera theo tier:** quà nhỏ Minor, quà vừa Medium, quà từ 3.000 Major; áp dụng giới hạn và Reduced Motion hiện có.
- **Test bổ sung:** chất lượng cảnh focus/áp lực, timeline cổng hư không, các ngưỡng tier quà.

## Kiểm tra đã thực hiện

- Kiểm tra **cú pháp JavaScript bằng V8** cho 5 file thay đổi (đã qua).
- Kiểm tra VFX pure logic với mock Canvas: prerender 16 surface (15 stamp hiện có + 1 gate), vẽ gate có **2 `drawImage`**, không cấp phát surface mới trong đường vẽ thử.
- Kiểm tra focus/pressure: 80 hồ sơ có focused → Balanced, pressured → Light, chọn High thủ công → High.
- Chưa thể chạy `npm test`, `npm run check` đầy đủ hoặc benchmark Chromium/LIVE Studio trong phiên làm việc này; cần chạy trong môi trường có toàn bộ repository và trình duyệt.

## Hướng dẫn nghiệm thu

1. Trên bản chạy thử, mở `/event-vfx-preview.html`, chọn **Luyện Hư**, bật V2, đặt Balanced và thử đoạn Impact, so sánh V2 cũ tại cùng seed.
2. Chọn quà 500, 1.500, 3.000, 5.000; kiểm tra quà nhỏ không có rung/bùng nổ quá mạnh.
3. Dùng 50–80 hồ sơ hoạt động nhưng chỉ một người diễn solo; kiểm tra chất lượng hiệu ứng còn Balanced khi không có áp lực FPS. Dùng Performance hoặc khi tải thực cao phải chuyển Light.
4. Kiểm tra Reduced Motion, Reduced Flash, 1080×1920, ảnh không mờ/không hở viền.
5. Chạy `npm test`, `npm run check`, so sánh frame P95/P99 trong Browser Source trước khi merge.

## Còn lại (chưa triển khai trong đợt 1)

- Chưa redesign Chính Ma Đại Chiến, các cảnh giới khác và toàn bộ mini-event.
- Chưa đo waveform thực tế của audio và chưa xác nhận hết rè ở LIVE Studio.
- Chưa chứng minh FPS tốt hơn hoặc chi phí GPU thấp hơn trong TikTok LIVE Studio.
- Chưa tạo asset nghệ thuật ngoài bộ VFX procedural đã có.

**Không merge vào main chỉ dựa trên smoke test; cần kiểm tra preview và LIVE Studio trên máy thật.**
