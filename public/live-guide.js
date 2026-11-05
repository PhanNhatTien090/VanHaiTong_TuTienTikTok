import {SKINS} from './cosmetics.js';
const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
export function commandCards(s){
  const cards=[
    {label:'VÀO TÔNG MÔN',main:'nhập môn nam / nhập môn nữ',detail:'Tạo nhân vật · tu luyện miễn phí'},
    {label:'ĐỔI XƯNG HÔ',main:'giới tính nam / giới tính nữ',detail:'Tông sư gọi sư huynh / sư tỷ · giới tính ẩn = đạo hữu'},
    {label:'TĂNG TU VI',main:'tu luyện  ·  hái  ·  điểm danh',detail:'Vận công · hái linh thảo · nhận quà mỗi ngày'},
    {label:'XEM TIẾN ĐỘ',main:'tu vi  ·  đột phá',detail:'Đủ tu vi + linh thạch → đột phá, đổi trang phục'},
    {label:'CHƯA BIẾT LÀM GÌ?',main:'gợi ý',detail:'Tông sư chỉ đúng lệnh tiếp theo cho bạn'},
    {label:'GÕ NGẮN · TỰ CHỌN MÓN',main:'học  ·  rèn  ·  trang bị',detail:'Học bí pháp · rèn pháp bảo · đeo món mạnh nhất'},
    {label:'GÕ NGẮN · ĐAN DƯỢC',main:'luyện đan  ·  dùng',detail:'Luyện viên đan tốt nhất đủ nguyên liệu · dùng đan'},
    {label:'QUÀ TẶNG TỰ NGUYỆN',main:'Phúc duyên ×3 / ×5 / ×8 / ×12',detail:'Theo tổng một lượt quà · thường 10 phút; lượt đầu 20 phút và buff riêng · chỉ trong game'}
  ];
  for(const item of s.catalog||[]){if(item.exclusive)continue;
    const cmd={manual:'học',artifact:'rèn',pill:'luyện đan'}[item.type];if(!cmd)continue;
    cards.push({label:{manual:'HỌC BÍ PHÁP',artifact:'RÈN PHÁP BẢO',pill:'LUYỆN ĐAN'}[item.type],main:cmd+' '+item.name,detail:`${item.price} linh thạch${item.herbs?' + '+item.herbs+' linh thảo':''} · ${s.realms?.[item.tier]||'đủ cảnh giới'}`});
    if(item.type==='pill')cards.push({label:'DÙNG ĐAN DƯỢC',main:'dùng '+item.name,detail:`Cần luyện đan trước · +${item.qi} tu vi cơ bản`});
  }
  cards.push({label:'ĐỔI PHÁP BẢO ĐANG CẦM',main:'trang bị',detail:'Tự đeo pháp bảo mạnh nhất · hoặc trang bị + tên món'});
  return cards;
}
export function giftCards(s){
  const gifts=[...(s.gifts||[])].sort((a,b)=>a.min-b.min),cards=[];
  // Only show a named gift when its tier was actually observed in this world.
  const seen=new Set();for(const e of s.feed||[]){if(!e.gift||seen.has(e.gift))continue;const g=gifts.find(g=>g.name===e.tier);if(!g)continue;seen.add(e.gift);
    cards.push({label:'QUÀ ĐÃ NHẬN TRÊN LIVE',main:`${e.gift} → +${g.qi} tu vi / món`,detail:`+${g.stones} linh thạch${g.herbs?' · +'+g.herbs+' linh thảo':''} · thưởng cơ bản`});if(seen.size>=3)break;
  }
  gifts.forEach((g,i)=>{const next=gifts[i+1],range=next?`${g.min}–${next.min-1}`:`${g.min}+`;cards.push({label:'THƯỞNG QUÀ · THEO GIÁ TRỊ MỖI MÓN',main:`Quà ${range} coin → +${g.qi} tu vi`,detail:`+${g.stones} linh thạch${g.herbs?' · +'+g.herbs+' linh thảo':''} · ${g.name}`});});
  if(s.patronEnabled)cards.unshift({label:'ĐẠI HỘ PHÁP · TỔNG QUÀ TÍCH LŨY',main:'Dẫn đầu quà → skin + kiếm + Long Ấn',detail:'Trao một lần mỗi người · giữ đồ khi đổi ngôi · đồng điểm giữ người đang dẫn'});
  for(const skin of SKINS.slice(1))cards.push({label:'SKIN QUÀ · TÍCH LŨY QUA CÁC LƯỢT',main:`${skin.min.toLocaleString('vi-VN')} coin quà → ${skin.name}`,detail:'Tổng quà đã gửi trong game · tự mở khóa khi đủ mốc'});
  return cards;
}
