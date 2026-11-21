# Huyền Tiên v3 · 04/11/2026

Đã sửa riêng realm 9 theo phản hồi: nhịp dừng nhiều, chuyển động thiếu chức năng, cần linh khí và âm thanh có lực hơn.

- Tổng 26s thay 36s. Đồng hồ shot ánh xạ từng đoạn riêng, không tua đều cả cảnh; đoạn rèn cự kiếm và chờ kiếp lôi bị cắt mạnh. Các realm khác giữ thời lượng hiện có.
- 36 kiếm rút và bay thành ba tốp, sau đó khóa thành 12 trụ, mỗi trụ ba lớp kiếm. Đường nối tạo lưới hộ pháp quanh người. Ba kiếp lôi đánh vào nút trận; nút sáng rồi dẫn dòng lên kiếm chủ trước khi hội kiếm. Kiếm có chức năng bảo vệ → dẫn lực → hợp nhất, thay cho bay vòng tùy ý.
- Luồng linh khí có đầu hạt và đuôi khí thoát từ thân, vẽ trước/sau người; không phủ trắng nhân vật. Skin hiện tại giữ tới sau nhập thể và cú nổ: absorbComplete 17.5s, impact 18.1s, reveal 18.55s.
- Âm: giữ lớp gió/kim loại/sấm, thêm tiếng chạm lưới, 17 nhịp trống trầm theo hành động, nhịp dồn trước nổ, nền bè quãng năm và ostinato phát triển. Hall reverb riêng với nhánh khô giữ đầu tiếng sắc. Đây là âm tổng hợp Web Audio, chưa phải thu âm sấm/kiếm thật; không tuyên bố đã nghe đạt chất điện ảnh.
- Cleanup hủy nguồn và nhánh reverb; vào giữa cảnh bỏ transient đã qua. Không thay gameplay, dữ liệu, web hoặc khởi động lại LIVE.

## Kiểm chứng

416/416 test qua. Test mới xác nhận kiếm khóa đúng nút hộ pháp, ánh xạ mốc thời gian, snapshot nam/nữ, skin cũ qua nổ và dọn âm khi mute. Các test duration cũ cho phép riêng realm 9 rút ngắn theo yêu cầu; không ép Chân Tiên hoặc cảnh khác ngắn lại.

Đã xem storyboard nam; đã xuất storyboard nữ. Clip đầy đủ 624 frame, H264 540×960/24fps + AAC, ffprobe xác nhận 26s. Chưa xem chuyển động hoặc nghe đánh giá trực tiếp bằng trình phát/browser. Kiểm audio offline: không NaN, peak .339, RMS .0335 ở harness master .8; các số này chỉ chứng minh kỹ thuật.

- Clip: output/huyen-tien-v3/huyen-tien-review.mp4
- Storyboard: output/huyen-tien-v3/storyboard.png
- Nữ: output/huyen-tien-v3-female/storyboard.png
- Âm riêng: output/huyen-tien-v3/score.wav
- Test log: output/huyen-tien-v3/tests.log
- Backup: data/backups/huyen-tien-v3-20261104/

Public assets được đọc lại; tải lại nguồn overlay để nhận module mới. Không tự chạy giả đột phá trên buổi LIVE thật. Vẫn chờ phản hồi chủ game, chưa tự coi là duyệt.
