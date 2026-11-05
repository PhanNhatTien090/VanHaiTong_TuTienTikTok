# Đánh yêu thú — Phong Ấn và giảm rủi ro hiển thị · 05/11/2026

Không đổi cách chơi (lệnh `danh`, hồi chiêu, công thức sức mạnh, phần thưởng, lịch boss, kiếm trận tim giữ nguyên).

1. Hắc Uyên Ma Long: "MÁU ×10" → "YÊU LỰC ×10"; thanh đỏ → tím–vàng, khung vàng. Giữ hình rồng.
2. Chữ hiển thị/giọng đọc: "sát thương" → "công lực" (kể cả mô tả pháp bảo), "Đệ nhất sát thương" → "Đệ nhất hàng yêu", "Top sát thương" → "Top công lực", "−5% máu boss" → "−5% yêu lực". Chú thích trong mã giữ nguyên. Bản web hồ sơ (`web/`) chưa đổi.
3. Giọng đọc mở boss: "gõ đánh để hàng yêu". Câu thắng vẫn là "Yêu thú đã bị phong ấn".
5. Cảnh Phong Ấn 3,6 s (`public/boss-seal.js`): trận ấn vàng mở quanh yêu thú → xích phù quấn → yêu thú thu nhỏ xoáy vào tâm → lóe sáng hóa Phong Yêu Ấn → ấn bay về người đứng đầu công lực; chữ "YÊU THÚ ĐÃ BỊ PHONG ẤN · Đệ nhất hàng yêu: …". Server ghi `w.bossSeal` lúc hạ yêu thú; overlay giữ màn đấu trường trong lúc phong ấn. Nếu ngay lúc đó có người đủ điều kiện đột phá, cảnh đột phá vẫn ưu tiên che phong ấn (luật trình diễn có sẵn).
6. Trận Ma Long ẩn bảng xếp hạng góc trái (`body.abyss-fight #liveRanks`) để không chồng lên bảng yêu lực vẽ trên canvas.
7. Sàn yêu lực: khi có người chơi thật đang hoạt động, máu boss ≥ 6 × sức mạnh người mạnh nhất (≈ 20 s đánh một mình), không còn bị hạ trong 1 chiêu lúc vắng người. Không ai hoạt động → giữ 120 để NPC tự kết thúc trận như cũ.

Kiểm chứng: 423/423 test (thêm test sàn yêu lực; sửa test chữ "Yêu lực ×10"), `npm run check`. Quay overlay demo: boss bị hạ hiện phong ấn; máy thử không GPU chụp chậm nên chưa xem trọn 3,6 s liên tục, chưa nghe âm. Cần khởi động lại server (đổi `engine.mjs`, `speech-lines.mjs`, `heart-events.mjs`) và F5 overlay.
