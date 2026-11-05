# Chân Tiên v2 — Phàm giới tan, Tiên giới sinh

04/11/2026. Phạm vi sáng tạo đợt này: chỉ hoàn thiện Chân Tiên. Các thử nghiệm khí tượng/score mới cho Đại Thừa đã rút lại; màn Đại Thừa giữ nhịp v1. Bộ score dùng chung có thêm các chất âm mới phục vụ Chân Tiên.

## Kịch bản thực tế · 31,6 giây

- 0–1,7: máy quay hướng vào bầu trời, không hiển thị bản thể hoặc sân chung.
- 1,7–3,2: vệt sáng quét qua và xé trời; các tia lực tỏa từ đúng vết xé.
- 3,2–5,8: năm linh quang khác màu lần lượt bay lên.
- 5,8–8: hình cầu chuyển liên tục thành tinh thể ba thùy, dựng các đường nối.
- 8–9,6: năm nguồn hội tụ về cùng điểm; tiên thể dùng chính ảnh nhân vật được phủ sắc linh quang, kích thước lớn, hiện sau lực hội tụ.
- 9,6–11: dư lực tiêu tán, chuẩn bị cắt sang Thiên Môn.
- 11–16,4: máy quay tăng tốc 1→9 lần quanh cửa, nghiêng nhẹ, vật gần di chuyển nhanh hơn vật xa; luồng tốc độ và gió tăng theo tiến trình.
- 16,4–17: chuyển vào tiên giới toàn màn, ánh chuyển cảnh dịu; giảm chuyển động giữ cảnh mà bỏ tăng tốc/roll.
- 17–21,2: chín bậc tiên lộ sáng, bản thể trở lại và nâng lên; thế giới từ đêm sang bình minh.
- 21,2–24,2: long ảnh thu lực về long châu, âm gọi rồng tổng hợp.
- 24,2–27,2: long châu theo đường liên tục về đan điền của thân đã nâng.
- 27,3: một cao trào chính, luồng tiên quang và các sóng áp lực nối nhịp.
- 27,6: đổi áo Chân Tiên, giữ hình mới đến 31,6 rồi trả sân.

Không tuyên bố đây là dựng lại cảnh phim hoặc bằng chứng chi tiết lore. Nhịp quay trời, năng lượng biến hình và pháp thể lấy cảm hứng từ ví dụ người dùng; artwork và cảnh giới sử dụng ngôn ngữ riêng của game.

## Hình và phối cảnh

PNG mới: `public/assets/chan-tien-cinema-v2/immortal-world.png`, 1051×1496, khoảng 2,25 MB. Tạo bằng công cụ image_gen tích hợp, giữ bản gốc trong generated_images. Prompt lưu ở README cùng thư mục.

Nền xa dùng PNG; mây, lớp đảo/điện gần, thác và điểm sáng có phối cảnh bằng phép chiếu z. Đây là 2.5D Canvas kết hợp ảnh, không phải mô hình WebGL 3D hoàn chỉnh. Số lớp động được giới hạn theo Light/Balanced. Ảnh được preload từ đầu màn; nếu ảnh chưa tải, cảnh vẽ dự phòng vẫn hoạt động.

Máy quay chỉ chuyển động trong màn Chân Tiên. Sân chung không được thêm zoom tự động. Chặn reduced motion cho zoom, camera roll, tốc độ và giảm flash/rung.

## Âm thanh

Web Audio nguyên gốc: tiếng vệt chém dùng noise bandpass, xé trời/impact dùng noise lowpass và thân trầm; năm nhịp ngọc; tiên thể có đỉnh lực riêng; flight có gió sustain, stereo whoosh và cú vượt cửa; tiếng gọi rồng dùng sawtooth qua bộ lọc cộng hưởng và dao động cường độ 7,5 Hz. Đây là âm tổng hợp, chưa phải bản thu tiếng gầm thực.

Cùng clock với hình. Cue muộn ngắn bỏ qua khi trở lại tab; stop/mute dọn graph. Có compressor. Kiểm OfflineAudioContext có peak <1, waveform không rỗng; số đo trong qa.json, không thay đánh giá bằng tai hoặc bản phối thực ở LIVE Studio.

## Kiểm chứng

- 376/376 kiểm thử qua tại thời điểm kiểm hồi quy; ba bài mới xác nhận năm linh quang, thời gian xuyên cổng, điểm nhập thể, phối cảnh gần/xa và reduced motion.
- `scripts/qa-chan-tien.mjs`: Chrome preview riêng, ảnh các pha, preload PNG, âm bắt đầu, chạy hết 31,6 giây, tự trả sân, mute và JS errors; xuất báo cáo `output/chan-tien-v1/qa.json`.
- `render-chan-tien.mjs`: storyboard, thêm `--female` để xem bản nữ.
- Không POST hành động vào LIVE, không sửa dữ liệu người chơi, không restart backend. Cần reload frontend để nhận bản mới.

Preview: http://127.0.0.1:4317/cinema-preview.html?realm=8&autoplay=1
