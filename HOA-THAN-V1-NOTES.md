# Hóa Thần — Lục Môn Thần Thức

Bản bổ sung: dây liên kết nguyên thần/bản thể và ba hạt truyền lực; hai đường kinh mạch nhận sáng sau các lần lôi nhập thể; sáu gợn lực tại đan điền; ba cung thần thức được khắc lần lượt quanh pháp tướng. Không đổi thời lượng, nhịp reveal hoặc dữ liệu nhân vật.

03/11/2026. Renderer riêng cảnh giới 5, 17,6 giây; giữ nguyên bốn màn trước. Các cảnh giới sau tăng thời lượng tương ứng để duy trì thứ tự.

- 0–2 s: lắng khí, mở bốn lớp linh trì.
- 2–4,4 s: nguyên thần từ bản thể bay lên; dùng ảnh nhân vật đang mặc được raster cache, không tải mẫu nhân vật thay thế.
- 4,4–7,6 s: sáu thần môn mở lần lượt, mỗi môn có ngọc ấn và vòng khắc.
- 7,6–10,5 s: sáu nhịp thần lôi nối từ thần môn về bản thể; luồng sáng hướng về nguyên thần.
- 10,5–12,8 s: pháp tướng lớn hiện sau lưng, ba dải khí xoắn dọc thân và thần thức mở rộng.
- 12,8–14,4 s: các môn thu hẹp, nguyên thần trở về bản thể.
- 14,4 s: một cao trào chính và sáu sóng áp lực truyền nối tiếp; không sáu flash toàn màn.
- 14,65 s: đổi áo Hóa Thần. Giữ rõ hình mới đến 17,6 s rồi trả sân.

Web Audio tổng hợp riêng: tiếng ngọc mở môn, sấm trung/trầm, hòa âm pháp tướng, nhập thể, đỉnh lực và dư âm. Cùng timeline hình; dọn nguồn khi mute/ngắt; không dùng mẫu âm ngoài. Chưa đánh giá chất âm bằng tai trên thiết bị phát LIVE.

Light giảm hạt và cung phụ. Giảm chuyển động bỏ rung và giảm cường độ cú bùng. Cache thân nhân vật hữu hạn theo Scene, không tích lũy frame. Chỉ hiện tên và cảnh giới.

Sửa NPC: `setResidentRealm` giữ cảnh giới đã trình diễn qua các lần snapshot và ranh giới chu kỳ. Không ghi vào hồ sơ người thật; không thay dữ liệu LIVE. NPC vẫn có nhãn NPC. Trạng thái này ở bộ nhớ trang, tải lại trang sẽ khởi tạo lại theo lịch NPC.

Preview: http://127.0.0.1:4317/cinema-preview.html?realm=5&autoplay=1

Kiểm tra: `node render-hoa-than.mjs` (thêm `--female`), `node scripts/qa-hoa-than.mjs`, `node --test test/hoa-than.test.mjs`.
Chrome preview cô lập đã kiểm âm bật, thời lượng, tự trả sân, tắt âm, không có JS exception; báo cáo `output/hoa-than-v1/qa.json`. Không POST hành động vào thế giới LIVE, không restart backend. Reload nguồn để nhận frontend mới.

Tham khảo kỹ thuật: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas và https://gsap.com/docs/v3/GSAP/gsap.timeline%28%29/ . Áp dụng cache và tổ chức nhịp thời gian bằng Canvas hiện có, không cài GSAP hoặc thay runtime game.
