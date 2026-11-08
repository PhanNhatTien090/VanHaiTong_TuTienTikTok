// Original short guidance. Optional: disabled by default; event narration remains separate.
export const IDLE_LINES=Object.freeze([
 {text:'Chào đạo hữu mới đến. Gõ nhập môn để chọn nhân vật và cùng tu luyện.',cta:true},
 {text:'Muốn xem mình còn thiếu gì để đột phá, đạo hữu có thể gõ tu vi.',cta:true},
 {text:'Linh thảo dùng để luyện đan. Linh thạch dùng để học bí pháp và rèn pháp bảo.'},
 {text:'Mỗi cảnh giới có chi tiết đạo phục riêng. Đạo hữu có thể tiến bộ bằng tương tác miễn phí.'},
 {text:'Chưa biết làm gì tiếp theo thì gõ gợi ý. Hệ thống sẽ chỉ một bước phù hợp với tài nguyên đang có.',cta:true},
 {text:'Khi Huyền Giao xuất hiện, gõ đánh để cùng đồng môn tham chiến.',cta:true},
].map((line,i)=>({...line,file:`/assets/idle/idle-v20-${String(i+1).padStart(2,'0')}.mp3`})).filter((line,i)=>i!==2));

export const SCENE_ARRIVAL=Object.freeze({text:'Các đạo hữu, chúng ta đến Tụ Linh Đài, nơi linh khí hội tụ dồi dào nhất của tông môn.',file:'/assets/idle/arrival-tu-linh-dai-v20.mp3'});

// 08/11 tối: nhắc điểm danh — phát riêng mỗi 4–6 phút trên overlay, kể cả khi tắt câu idle.
export const CHECKIN_REMINDER=Object.freeze({text:'Các đạo hữu nhớ gõ điểm danh để nhận quà hằng ngày nhé.',file:'/assets/idle/idle-v20-07.mp3'});
