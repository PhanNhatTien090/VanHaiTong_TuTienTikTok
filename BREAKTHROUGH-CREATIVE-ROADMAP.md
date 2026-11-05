# Định hướng đột phá theo cảnh giới

Trạng thái ngày 2026-11-03: đã triển khai Luyện Khí v3, Trúc Cơ v2, Kim Đan v1 và Nguyên Anh v1. Bốn cảnh dài 8,8 / 10,8 / 11,8 / 14,4 s. Xem ghi chú riêng của mỗi cảnh, mới nhất `NGUYEN-ANH-V1-NOTES.md`. Theo yêu cầu tăng quy mô rõ rệt từ Nguyên Anh, các mục tiêu phía sau cũng tăng. Hóa Thần hiện tạm 14,847 s để bảo toàn thứ tự trước khi được thiết kế riêng.

## Quy tắc xuyên suốt

- Mỗi cảnh giới có một hình tượng chính, một biến đổi quyết định và một âm sắc nhận diện. Tên concept dưới đây chỉ ở tài liệu, màn hình chỉ giữ tên người chơi và cảnh giới.
- Ưu tiên ảnh có sẵn trong dự án, kết hợp cắt lớp, chuyển động, ánh sáng và hiệu ứng Canvas tự dựng; lưu mapping nguồn ảnh của từng cảnh. Đây là yêu cầu người dùng đã bổ sung khi làm Nguyên Anh.
- Càng cao tăng quy mô không gian, số bước biến đổi có ý nghĩa, tương phản, độ tinh xảo và độ dài kết cảnh. Không chỉ thay màu, nhân hạt, tăng flash hoặc thêm cùng bộ rồng/phượng vào mọi cảnh.
- Độ dài tăng vừa phải; từng giây phải có diễn biến. Bậc cao mở rộng tới thiên tượng và không gian, không cần nhét mọi biểu tượng cấp thấp vào cùng một màn.
- Cảm giác âm mạnh hơn nhờ chiều sâu, cấu trúc và tiếng đỉnh khác biệt. Giữ headroom và các nút âm lượng; không tăng độ lớn vô hạn. Cấp cao được thêm không gian vang và lớp âm phù hợp.
- Mỗi cảnh có một đỉnh chính, vài bước chuẩn bị và một khoảng nhận diện nhân vật mới. Không chớp/rung liên tục. Light và giảm chuyển động vẫn kể đủ tiến trình.
- Phát triển và kiểm từng cảnh giới theo thứ tự; các thời lượng dưới đây là mục tiêu cuối của từng bản nâng cấp, không phải yêu cầu đổi toàn bộ thời lượng ngay.

## Bảng concept và thời lượng mục tiêu

| Cảnh giới | Thời lượng | Hình tượng và diễn biến quyết định | Âm sắc nhận diện |
|---|---:|---|---|
| Luyện Khí | 8,8 s | Linh châu phân ba, vận khí, nhập thể và bùng sáng; giữ v3 đã chốt. | Khí hút, lực trầm, chuông ngọc. |
| Trúc Cơ | 10,8 s | Bát Trúc Định Cơ: tám kiếm trúc dẫn khí dựng ngọc đài ba tầng. | Gõ trúc, ngọc, ba nhịp khóa tầng rồi đại ấn. |
| Kim Đan | 11,8 s | Đan Dương Sơ Hiện: dòng khí hóa lỏng, hội thành giọt vàng, kết đan rồi mở quầng như mặt trời nhỏ. | Kim loại ấm, tiếng tích tụ chất lỏng, ngân sâu mở rộng. |
| Nguyên Anh | 14,4 s | Liên Thai Hóa Anh: liên thai nở, bóng nguyên anh sáng hiện và hòa vào bản thể; thân và nguyên thần cộng hưởng. | Âm bội trong, hơi thở kép, tiếng nở nhẹ rồi hợp âm đầy. |
| Hóa Thần | 15,2 s | Thần Quang Tẩy Tủy: đường sáng chạy qua kinh mạch, thần ảnh vươn sau lưng, ánh trời đánh thức linh đài. | Tiếng điện khí mềm, sấm xa, cộng hưởng như hợp xướng không lời. |
| Luyện Hư | 16,0 s | Hư Không Khai Môn: mặt không gian uốn cong và hé khe sâu, các lớp khoảng không gập về tâm người. | Gió rút sâu, âm bị hút hẹp rồi bung ra, đuôi vang xa. |
| Đại Thừa | 16,8 s | Vạn Pháp Quy Nhất: các dấu đạo pháp khác nhau vận hành thành quỹ đạo, hợp nhất vào một pháp tướng hoàn chỉnh. | Các mô-típ âm ngắn lần lượt hòa thành một chủ âm vững. |
| Chân Tiên | 17,6 s | Vân Giai Đăng Tiên: thềm mây nối lên trời, tiên môn mở, tiên quang tiếp dẫn và y phục chuyển hóa. | Gió tầng cao, chuông dài, hợp âm tiên môn mở. |
| Huyền Tiên | 18,2 s | Huyền Tinh Chuyển Mệnh: tinh đồ nổi trong bóng đêm, chòm sao nối thành mệnh tinh rồi rót vào linh đài. | Tinh linh sắc mảnh trên nền ngân trầm sâu, điểm sao theo nhịp. |
| Kim Tiên | 18,8 s | Bất Diệt Kim Thân: từng đường kim văn khắc lên pháp thân, những mảnh hào quang ráp thành bảo luân vàng. | Kim khánh trầm, kim loại ấm, tiếng pháp thân khóa hoàn chỉnh. |
| Thái Ất | 19,4 s | Âm Dương Sinh Hóa: hai dòng đen–trắng đối lưu, luân chuyển mùa và hợp thành nhất khí. | Hai âm sắc đối đáp rồi hợp pha, chuông tròn và gió mềm. |
| Đại La | 20,0 s | La Thiên Vượt Kiếp: các tầng thời gian tách nhau, pháp thân bước qua vòng nhân quả rồi hội tụ tại hiện tại. | Vọng âm có thứ tự, nhịp thời gian dừng ngắn, tiếng mở không gian rộng. |
| Tiên Đế | 20,8 s | Đế Khuyết Đăng Cơ: thiên cung hiện từng lớp, long ấn đóng trước ngự tọa, đế miện và quang bào hoàn chỉnh. | Trống nghi lễ, đại chung, tiếng ấn nặng và đuôi vang uy nghi. |
| Đạo Tổ | 21,4 s | Nhất Bút Khai Đạo: một nét đạo quang vạch qua hư vô, sinh các quy luật vận hành và kết thành đạo vực riêng. | Âm sắc cọ/vải trầm, ngân mộc, không gian từ tĩnh đến mở rộng. |
| Thiên Tôn | 22,0 s | Cửu Thiên Cộng Hưởng: chín tầng trời lần lượt đáp lại, thiên luân nối thành trục xuyên các tầng không gian. | Chín tiếng đáp có phân tầng, gió cao, đại chung nhiều tầng âm bội. |
| Thần Quân | 22,6 s | Thần Vực Chấp Chưởng: các trụ thần lực mở biên giới, ấn lệnh làm toàn bộ thần vực cùng đổi trạng thái. | Tiết tấu nghi lễ rõ, đá/ngọc trầm và tiếng lệnh không lời. |
| Thần Vương | 23,2 s | Vạn Giới Triều Vương: các cửa thế giới mở quanh vương tọa, từng quầng giới lực nghiêng về thần quan. | Các tiếng vọng từ xa tụ về một trung tâm, vương ấn lớn. |
| Thần Đế | 24,0 s | Hồng Mông Sáng Thế: bắt đầu từ tĩnh lặng, một điểm sáng khai mở tinh vân, dựng thiên địa rồi quy về thần đế giữa đạo vực. | Khoảng tĩnh có chủ đích, lực sâu khai mở, âm sáng trải rộng và kết ngân dài. |

Những concept này là sáng tạo cho game, không khẳng định quy luật tu luyện của một tác phẩm cụ thể. Khi làm từng bậc, đối chiếu lại trang phục, pháp bảo và bố cục thực tế rồi chốt storyboard riêng; tránh một bảng định hướng biến thành 18 cảnh dùng cùng khuôn.
