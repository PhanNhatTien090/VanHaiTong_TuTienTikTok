// Câu nhắc lúc rảnh (link LIVE bật idle=1). 20/11 (soát hướng dẫn): đồng bộ với màn hình — mọi lệnh lõi đọc "gõ số …"
// (màn hình viết "Gõ 1"; giọng đọc "gõ số một" vì "gõ hai" nghe như "gõ hái"). Thứ tự = thứ tự người mới cần học: 1 → 8 → 9 → 6.
// Không hứa thưởng cho tim/follow/share (luật 09/11). Đổi câu thì đổi số phiên bản file (v21) rồi chạy scripts/make-idle-voice.mjs --idle-only.
// cta:true = câu chỉ lệnh (cứ 3 câu thì 1 câu cta).
export const IDLE_LINES=Object.freeze([
 {text:'Đạo hữu mới đến, gõ số một vào bình luận để bắt đầu tu luyện.',cta:true},
 {text:'Đủ tu vi thì gõ số tám để đột phá cảnh giới.',cta:true},
 {text:'Muốn biết mình còn thiếu gì để đột phá, gõ số chín.',cta:true},
 {text:'Lúc có sự kiện, gõ số sáu để nhận cơ duyên.',cta:true},
 {text:'Linh thảo để luyện đan, linh thạch để rèn pháp bảo. Các lệnh khác có trong sổ lệnh trên cuộn Thiên Bảng.'},
 {text:'Mỗi cảnh giới có đạo phục riêng, càng lên cao càng uy nghi.'},
].map((line,i)=>({...line,file:`/assets/idle/idle-v21-${String(i+1).padStart(2,'0')}.mp3`})));

export const SCENE_ARRIVAL=Object.freeze({text:'Các đạo hữu, chúng ta đến Tụ Linh Đài, nơi linh khí hội tụ dồi dào nhất của tông môn.',file:'/assets/idle/arrival-tu-linh-dai-v20.mp3'});

// 08/11 tối: nhắc điểm danh — phát riêng mỗi 4–6 phút trên overlay, kể cả khi tắt câu idle.
export const CHECKIN_REMINDER=Object.freeze({text:'Các đạo hữu nhớ gõ điểm danh để nhận quà hằng ngày nhé.',file:'/assets/idle/idle-v20-07.mp3'});
