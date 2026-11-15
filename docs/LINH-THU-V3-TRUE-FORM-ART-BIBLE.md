# Vân Hải Tông · Linh Thú 3.0 / Chân Thân Tiến Hóa
## Quyết định sản xuất (15/11/2026)

**Đầu ra phải là 39 hình thể mới thực sự**, không phải 39 ảnh vẽ thêm phụ kiện vào sprite V1/V2. Mỗi con vẫn cùng một loài, biến đổi giải phẫu có ý nghĩa và chuyển động khớp với hình thể mới.

### Trạng thái repo trước dự án
- Hệ V2 đã có 39 atlas, 192 frame *composited*, nhưng từng frame dựng bằng \`g.drawImage(base,...)\` rồi vẽ thêm sừng/cánh/vòng/giáp từ \`scripts/build-pet-v2-evolutions.mjs\`. Đó là kiểu overlay, **không đạt yêu cầu chân thân**.
- 13 loài: 8 con atlas 3 tư thế (nhịp \`[0,1,0,2]\`, 230ms) và 5 con 8 tư thế với chu kỳ 800–1440ms.
- V1/V2 và mọi bản ghi người chơi, quyền sở hữu, logic LIVE hiện hành phải giữ nguyên cho đến khi nghiệm thu toàn bộ.

### Bộ asset mới
- \`public/assets/spirit-pets-v3/true-forms/<pet-id>/stage-{1,2,3}-true-form-v1.webp\`
- 8 loài × 3 atlas × 3 frame = 72 frame; 5 thiên linh thú × 3 atlas × 8 frame = 120 frame; tổng 39 atlas và **192 frame được vẽ riêng**.
- Kích thước đề xuất: **256 × 256 px / frame**; atlas 3×1 hoặc 4×2; alpha trong suốt; không chữ, không nền, không bóng nền cố định.
- Mỗi thiết kế cần một full-body hero concept riêng ≥1024px, được duyệt trước khi triển khai frame.
- Các frame mới phải có tư thế khác nhau thực tế: cơ thể, chân, cánh và đuôi hoạt động nhất quán. Cấm thay đổi màu/vòng sáng rồi nhân bản frame.

### Quy trình từng loài
1. **Original analysis**: trích xuất V1 frame, bảng nhận diện thú, phần chân/đầu/tai/đuôi/vòi/cánh.
2. **Silhouette concepts**: thiết kế Chiến Linh → Thánh Linh → Bản Mệnh theo bảng \`PET_V3_SPECIES\` trong \`public/pet-v3-art-spec.js\`. Mỗi hình phải khác rõ khi chuyển thành một màu đen (không nhờ FX).
3. **True anatomy art**: vẽ lại toàn thân từ đầu, không trace trực tiếp V1 rồi thêm overlay. Mỗi hình thái có anatomy/model sheet được duyệt.
4. **Pose animation**: 3 frame ở 8 loài thường; 8 frame ở 5 thiên linh thú. Tạo động tác nhỏ nhưng thật (thở, chuyển trọng tâm, vẫy đuôi, chân, cánh), đúng sequence và đúng nhịp cũ.
5. **QA**: chạy \`node scripts/verify-pet-v3-art.mjs\` và kiểm duyệt bằng mắt; nếu pass kỹ thuật chưa đủ, bắt buộc reviewer xác nhận tính nhất quán 3/8 frame.
6. **Integration**: chỉ thay atlas khi hoàn thiện đủ loài, tích hợp lazy-load, kiểm tra cả LIVE, Linh Thú Cốc, bảng xem, triệu hồi, kỹ năng và event lock.
7. **Load test**: so sánh 10/20/50/100 người, FPS CPU/GPU thực và rollback khi cần.

### Duyệt 3 mẫu trước khi nhân 13
- Ngọc Thố: 3 dáng thỏ thật với đuôi tròn ngắn, tai dài, chân sau đúng thỏ, **tuyệt đối không biến thành cáo**.
- Lôi Oa: ba biến thể CÓC sét, thân bè, mắt lồi, túi họng, chân cóc; không biến thành rồng.
- Bạch Nguyệt Cửu Vĩ: hồ ly trắng chín đuôi có gốc đuôi rõ, 8 frame có chuyển động đuôi độc lập, không nhầm với Ngọc Thố.

### Quy tắc phát hành
**Không bật V3, không chuyển asset gốc, không merge thay runtime.** Mỗi atlas chưa được nghiệm thu giữ trạng thái pending. V2 vẫn dùng bình thường.
Bộ kiểm thử tự động phát hiện ảnh trong suốt hỏng, frame trùng, hình thể thay đổi quá ít; nhưng chỉ người duyệt mới xác nhận đúng giải phẫu, đúng loài, chất lượng và độ nhất quán nghệ thuật.
