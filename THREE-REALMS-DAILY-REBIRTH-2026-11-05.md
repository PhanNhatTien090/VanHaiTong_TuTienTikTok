> Cập nhật: phần trần ngày/Cơ duyên của bản này đã được thay bằng UNIFIED-PROGRESSION-V4-2026-11-05.md; tên cảnh giới và quy tắc chuyển sinh vẫn giữ.

# Ba cảnh giới sau Thần Đế, trần tu luyện ngày và chuyển sinh · 05/11/2026

Mở rộng từ19 lên22 mốc (0..21): Thần Đế18 → Thần Tôn19 → Thần Tổ20 → Hồng Mông Chí Tôn21. REBIRTH_UNLOCK_REALM=21, các consumer dùng MAX_REALM theo REALM_NAMES, không chặn cứng18.

## Nhịp tu luyện

Không đổi đường lên đến Hóa Thần. Giữ nguyên mức chậm10lần vừa áp dụng cho current realm5..17. Thêm yêu cầu cho current realm18/19/20 lần lượt7000/10000/15000 lượt vận công tương đương. Chi phí tu vi gốc vẫn tăng theo hàm hiện có; trọng số vận công1, hái1,4, đánh0,35. Quà có đường tiến độ riêng.

## Ngân sách ngày

Mức khởi đầu900 điểm vận công/ngày, CHỈ áp dụng tu vi từ cultivate/heartCultivate/gather/attack, ở LIVE thật và current realm>=5. Đây là ngân sách hoạt động có trọng số, không phải900 tu vi tuyệt đối. Dùng số nguyên phần trăm điểm trong ledger để không sai số. Làm mới theo 0 giờ Asia/Ho_Chi_Minh, không theo kết nối hay mốc cảnh giới. Nếu hành động cuối vượt ngân sách, nhận phần tu vi tương ứng phần ngân sách còn lại. Ledger lưu trong hồ sơ và qua JSON/restart.

Chạm trần: các hành động vẫn thành công, đánh vẫn gây công lực, hái vẫn nhận linh thảo/linh thạch, vẫn tính tham gia sự kiện; riêng tu vi tu luyện thường về0. Thông báo một lần khi vừa hết ngân sách; lệnh tu vi và hồ sơ quản lý cho biết điểm còn lại. Quà, buff quà, Cơ duyên, điểm danh, vật phẩm và thưởng sự kiện không bị thu hồi/cắt bởi trần này. Có thể chỉnh settings.dailyPracticeLimit trong cấu hình: số nguyên1..100000,0 để tắt; không thay dữ liệu này khi server đang chạy bằng sửa JSON trực tiếp. Chưa thêm điều khiển UI riêng cho giới hạn.

Chọn trần900 là quyết định thiết kế khởi đầu để điều chỉnh tiếp; người dùng cho phép áp dụng trần ngày nhưng chưa chốt con số cụ thể. Quà/Cơ duyên vẫn có thể đẩy cảnh giới nhanh — không mô tả đây là trần mọi nguồn tu vi. Chi phí Cơ duyên mới ở current realm18..20:99999/149999/249999, giữ nguyên18 mốc cũ. Sự kiện Cơ duyên đang chạy giữ bảng giá đã mở, bảng mới áp cho sự kiện mới.

## Chuyển sinh tự nguyện

Đủ Hồng Mông Chí Tôn mới mở. Gõ chuyển sinh → xem hậu quả → chuyển sinh xác nhận trong30s. Không tự kích hoạt khi đạt21. Không chạy trong lượt đua/luận kiếm đang tham gia.

Xác nhận: realm=0,qi=0; tổng tu vi lifetime giữ nguyên. Ghi highestRealm,reincarnations,rebirthQiSpent,lastRebirthAt. Giữ linh thạch, linh thảo, pháp bảo, trang bị, bí pháp, skin sở hữu/skin chọn, VIP/quà lịch sử, đạo lữ, thành tích. Giữ dailyPractice và cooldowns; không có lỗ hổng reset ngân sách ngày. Xóa novicePractice của vòng cũ. Không đặt lại ngày nhập môn/giới tính/liên kết web. Event dùng effect skin/transform có visualFrom/To đúng trạng thái, không giả một lần đột phá đại cảnh. Hồ sơ hiển thị số lần và cảnh giới cao nhất từng đạt. Chưa thêm bảng xếp hạng hay bonus sức mạnh chuyển sinh riêng.

## Phạm vi hình ảnh

3 mốc mới có tên, chi phí, thời lượng, metadata thần thể và hào quang hợp lệ cho cả nam/nữ, giữ skin sự kiện chọn tay. Dùng lại atlas thần thể hiện có (ô được chỉ định đúng giới tính) với vật liệu màu và lớp presence khác; KHÔNG tuyên bố là3 bộ sprite mới. Renderer đột phá chung hiện có hoạt động tới21, thời lượng mới40,224/42,224/44,224s. Hóa Thần/Nguyên Anh/Huyền Tiên/Kim Tiên và các cảnh cũ giữ nguyên. Chưa dựng3 phim nghi thức mới theo chuẩn v5; cần nâng riêng từng cảnh sau. Không gọi việc đổi metadata/renderer chung là đã đạt chất lượng điện ảnh mới.

## Kiểm tra / triển khai

446 test LIVE,27 test web và npm run check qua. Test mới bao phủ ngày Việt Nam (đúng biên17:00UTC), quota chung4 đường/partial credit/save-reload, không reset quota khi lên cảnh giới, phần thưởng ngoài trần, vẫn đánh/hái khi hết quota,3 realm save/reload/max clamp, chuyển sinh đủ điều kiện/xác nhận/hết hạn/replay/bận thi đấu, giữ kho đồ/liên kết/ledger. Kiểm render offline3 realm cả nam/nữ/skin sự kiện, không kích hoạt dữ liệu LIVE. Chưa đánh giá3 cảnh điện ảnh trong browser.

Restart có guard scripts/restart-three-realms.ps1: export live+demo, buffer quà thật, dừng đúng process/worker, giữ WEB_PROFILE_ONLY1 và watchdog; kiểm runtime progressionPacingVersion3/22realm/unlock21. Đối chiếu hồ sơ/tổngtuvi/quà/đạolữ sau nạp, đối soát buffer trước báo hoàn tất. Tải lại nguồn Link trong LIVE Studio để frontend nhận MAX_REALM mới.
