# Giảm tốc tu luyện từ Hóa Thần · 05/11/2026

Yêu cầu: tăng mạnh thời gian tu luyện từ Hóa Thần trở lên; đường lên đến Hóa Thần giữ nguyên. Chưa làm tiểu cảnh giới ở lượt này.

Đổi phần thưởng tối thiểu của chế độ ascensionShowcase: số lượt vận công tương đương ở current realm5..17 tăng10 lần. Realm0..4 vẫn [2,3,4,5,6]; phần sau thành [70,80,90,1650,1900,2100,2400,2700,3100,3450,3900,4400,4950]. Cùng một hàm được dùng cho tu luyện, tim vận công (chung hồi10s), hái (trọng số1,4) và đánh yêu thú (0,35). Không tăng cooldown nên người chơi vẫn thường xuyên có phản hồi.

Mức10 lần áp cho reward floor, không phải cam kết mọi người đều mất chính xác10 lần thời gian: phần thưởng cơ bản, trang bị, phúc duyên, số tài nguyên đã có và cách tham gia vẫn ảnh hưởng kết quả. Ví dụ bắt đầu Hóa Thần từ0 tiến độ: khoảng70 lượt vận công thay vì7; chỉ vận công mỗi10s tương đương khoảng11phút40s. Hái/đánh có thể rút ngắn.

Không thay yêu cầu tu vi/linh thạch, không trừ qi/totalQi, không hạ realm, không đổi kho đồ/skin/đạo lữ/VIP. Người đã đủ điều kiện vẫn đột phá được. Không thay quà, buff quà, Cơ duyên hay các khoản thưởng sự kiện; Cơ duyên vẫn có thể nhảy nhiều cảnh giới. Chế độ showcase tắt giữ cơ chế cũ.

Thêm progressionPacingVersion2 vào snapshot để xác minh backend đã nạp bảng mới. Restart bằng scripts/restart-realm-pacing.ps1: đối chiếu đúng data folder, xuất cả hai world, giữ quà trong bộ đệm TikFinity, dừng đúng server và worker TTS, giữ WEB_PROFILE_ONLY1, rồi khôi phục watchdog. Không thử hành động giả trên LIVE.

Kiểm tra: mô phỏng vận công đến Thần Đế, giữ mốc đầu; kiểm cả4 đường nhận tiến độ ở Hóa Thần, cooldown, tài nguyên/skin được giữ; kiểm tim chơi chung hồi; kiểm Cơ duyên không đổi. Kiểm toàn bộ LIVE, web và cú pháp trước đưa vào server.
