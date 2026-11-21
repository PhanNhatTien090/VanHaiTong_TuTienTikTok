# Luyện Khí — một hành trình của linh khí

Mục tiêu: người xem đọc được nguyên nhân và kết quả. Mỗi vật thể có nhiệm vụ, không lấy số lượng vòng sáng/tiếng nổ làm chất lượng. Bản này chỉ thay màn đạt Luyện Khí (toRealm=1), chưa triển khai lại các cảnh giới cao.

## Kịch bản 8,8 giây

| Thời điểm | Cảnh | Ý nghĩa |
|---|---|---|
| 0–1,94 giây | Ngưng tụ một linh khí châu tại đan điền | Người chơi cảm nhận được khí |
| 1,94–3,17 giây | Cùng viên châu nâng ra trước người | Khí có hình thái rõ ràng |
| 3,17–4,14 giây | Viên châu phân thành ba phần | Tách khí để điều khiển |
| 4,14–6,34 giây | Ba luồng cùng bay một chu thiên, có trước/sau thân | Người chơi vận chuyển được khí |
| 6,34–7,74 giây | Ba phần hợp lại rồi đi xuống đúng đan điền | Khí được hấp thụ, không biến mất vô cớ |
| 7,74–8,8 giây | Một nhịp sáng cục bộ, đổi áo, giữ lõi nhỏ ổn định | Thành công và trả về sân |

Đây là hình tượng linh khí châu của game, không phải Kim Đan của cảnh giới Kim Đan.

## Chuyển động

- Một đồng hồ chung: lấy tiến trình từ (timestamp - event.start)/duration. Tất cả vật thể cùng dùng một sampler thuần, tua tới pha nào cũng cho cùng kết quả.
- Easing quintic smoothstep, vận tốc bằng 0 ở các điểm dừng. Kiểm thử sai lệch vị trí ở các ranh giới để tránh teleport.
- Chuyển động theo quỹ đạo ellipse, phân lớp trước/sau nhân vật; vệt ngắn đi theo chính quỹ đạo đã chạy, không random mỗi frame.
- Chỉ một pearl sprite Canvas dựng một lần và cache, nhân ra ba sprite lúc phân tách. Không cần tạo PNG nền toàn màn. Dùng HTML cho tên, nhãn pha và một câu giải thích.
- Bỏ các lớp rồng, chưởng, kính nứt và trận pháp lớn khỏi Luyện Khí. Không đổi các cảnh giới khác trong đợt này.
- Mục tiêu 60fps riêng Luyện Khí ở Balanced/High, 30fps ở Light; đây là lịch dựng, không phải số đo FPS đạt được trên mọi máy. Có hỗ trợ reduced motion.
- SFX riêng: tạo châu, ba nốt phân tách, gió nhẹ vận khí, âm hạ xuống khi nhập thể, chuông hoàn tất. Không có tiếng va đập màn hình.

## Nguồn tham khảo chính thức

- https://gsap.com/docs/v3/GSAP/gsap.timeline/ — tổ chức các phần animation theo timeline và mốc, thay vì nhiều delay độc lập.
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame — dùng timestamp để tính tiến độ, đồng bộ với lịch vẽ trình duyệt.
- https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance — cân nhắc Canvas/JS/CSS theo tình huống, transform phù hợp giúp tránh layout khi animate DOM.

Áp dụng nguyên tắc sequencing của timeline vào renderer Canvas đang có; không cài GSAP hoặc đưa HyperFrames runtime vào game đang chạy chỉ để thay một cảnh. Skill hyperframes-animation được đọc tham khảo tính xác định và bố cục timeline; đây là hiệu ứng game thời gian thực, không phải video dựng sẵn.

## Xem thử

http://127.0.0.1:4317/cinema-preview.html?realm=1&autoplay=1

Bấm Luyện Khí mới ↻ để chạy lại. Bật âm thanh bằng nút trên trang (trình duyệt cần tương tác để cho phép tiếng). Trang dùng nhân vật giả trong trình duyệt, không cấp thưởng lên LIVE. Live Link cần reload để nhận module mới.

Ảnh storyboard: output/qi-awakening-v1/storyboard.png. Chưa chứng nhận FPS trong LIVE Studio hoặc duyệt trực quan bằng trình duyệt của người dùng; đã render native Canvas và kiểm thử thuật toán/âm thanh.
