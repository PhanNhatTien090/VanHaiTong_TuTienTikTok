// 08/11: bảng xoay vòng — trang chính (thả tim…) xen kẽ các trang lệnh khác, mỗi trang 12 s: chính → hằng ngày → chính → đồng môn → chính → sự kiện.
// 10/11: thêm trang SỰ KIỆN + mỗi trang 6 lệnh; trên LIVE là dải ngang sát đáy, dưới hàng ghế cuối (ghế tới 85% chiều cao).
export const GUIDE_PAGES=[
 {title:'LỆNH HẰNG NGÀY',rows:[
  {cmd:'điểm danh',text:'thưởng mỗi ngày'},
  {cmd:'tu vi',text:'xem còn thiếu gì'},
  {cmd:'gợi ý',text:'tông sư chỉ việc'},
  {cmd:'luyện đan',text:'đan tăng tu vi'},
  {cmd:'hái',text:'hái linh thảo'},
  {cmd:'đánh',text:'đánh yêu thú'}]},
 {title:'ĐỒNG MÔN',rows:[
  {cmd:'kết duyên + tên',text:'mời kết đạo lữ'},
  {cmd:'đồng ý',text:'nhận lời kết duyên'},
  {cmd:'cùng tu + tên',text:'tu luyện cùng nhau'},
  {cmd:'giúp + tên',text:'hộ pháp đột phá'},
  {cmd:'skin + tên',text:'mặc skin đã có'},
  {cmd:'từ chối',text:'không nhận lời'}]},
 {title:'SỰ KIỆN',rows:[
  {cmd:'bay',text:'đua phi kiếm khi mở'},
  {cmd:'tỷ thí',text:'ghi danh tỷ thí'},
  {cmd:'cơ duyên',text:'nhận quà khách quý'},
  {cmd:'❤ thả tim',text:'đánh yêu thú, nuôi thú'},
  {cmd:'luyện đan',text:'góp lửa lò đan'},
  {cmd:'gợi ý',text:'hỏi việc nên làm'}]}
];
const ORDER=[0,1,0,2,0,3];
export function simpleSteps(s={},page=0){
 const pick=ORDER[((page%ORDER.length)+ORDER.length)%ORDER.length];
 const rows=[
  // 4/11/2026 heartPlay: tim là cách vận công, trò chuyện để luận đạo — không cần spam tu luyện.
  // 4/11: chữ ngắn để bảng nhỏ, không che nhân vật.
  {cmd:'❤ thả tim',text:'vận công'},
  {cmd:'💬 trò chuyện',text:'+20% tu vi'},
  {cmd:'đột phá',text:'đột phá cảnh giới'},
  {cmd:'học · rèn',text:'bí pháp · pháp bảo'},
  {cmd:'giới tính nam/nữ',text:'đổi nam/nữ'},
  {cmd:'trang bị',text:'đeo đồ mạnh nhất'}
 ];
 const race=s.raceStatus,t=s.socialStatus?.tournament;
 const hint=race?.phase==='registration'?'Đua: gõ bay':race?.phase==='running'?'Đua: phi kiếm tranh tốc':t?.phase==='registration'?'Tỷ thí: gõ tỷ thí':s.boss?.hp>0&&s.boss.endsAt>s.serverNow?'Yêu thú: thả tim':'';
 if(pick)return {...GUIDE_PAGES[pick-1],hint};
 return {title:'CÁCH CHƠI',rows,hint};
}
export function renderSimpleGuide(s,esc,page=0){
 const el=document.querySelector('#basicCommands');if(!el)return;
 document.body.classList.add('simple-play');const p=simpleSteps(s,page),html='<b>'+esc(p.title)+(p.hint?'<em> · '+esc(p.hint)+'</em>':'')+'</b><ol>'+p.rows.map(r=>'<li><code>'+esc(r.cmd)+'</code><span>'+esc(r.text)+'</span></li>').join('')+'</ol>'+(p.hint?'<small class="corner-command-hint">'+esc(p.hint)+'</small>':'');
 if(el._simpleHTML!==html){el.innerHTML=html;el._simpleHTML=html;}
}
