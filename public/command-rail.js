// v42: bảng dọc nhỏ bên phải cảnh LIVE — xoay vòng: lệnh ít dùng → bí pháp → pháp bảo rèn được → pháp bảo quà/sự kiện → chiêu thức.
// Mỗi trang tối đa 5 dòng; dữ liệu giá/chỉ số lấy từ catalog đang chạy.
import {TECHNIQUES} from './combat-techniques.js';
const plain=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
const stat=i=>[i.damage&&`+${i.damage} ST`,i.bonus&&`+${Math.round(i.bonus*100)}% TV`,i.qi&&`+${i.qi} TV`].filter(Boolean).join(' · ');
const chunk=(rows,n=5)=>{const out=[];for(let i=0;i<rows.length;i+=n)out.push(rows.slice(i,i+n));return out;};
const TECH_SOURCE={slash:'Mặc định khi gõ đánh',sword:'Trúc Cơ / học Vạn Kiếm Quy Tông',lotus:'Thiên Liên Bảo Kính · Kim Đan + Cửu Chuyển Liên Hoa',thunder:'Cửu Tiêu Lôi Ấn · Hóa Thần',
  vortex:'Thanh Vân Hồ Lô',stars:'Tinh Hà Pháp Luân · Đại Thừa',celestial:'Thiên Đế Chí Tôn Ấn · Chân Tiên',bamboo:'Thanh Trúc kiếm (sự kiện khách)',soul:'Hồn Phiên (sự kiện khách)',
  frost:'Băng Phách Kiếm · Nguyệt Hoa Kiếm',flame:'Xích Diễm Kiếm · Xích Vũ Phiến · Niết Bàn Vũ',bell:'Trấn Hồn Chung · Huyền Thiên Linh · Kim Văn Chung',dragon:'Long Phượng Thần Châu · Thương Long Đạo Châu',petal:'Tam Sinh Ngọc Bội',meteor:'Thiên thạch',flowersword:'Bách Hoa Tiên Kiếm (sự kiện hoa · top 1)',peachfan:'Đào Hoa Linh Phiến (sự kiện hoa · top 2)',flowercage:'Hoa Vũ Linh Lung (sự kiện hoa · top 3)',starmirror:'Tinh Hà Bảo Kính (sự kiện sao · top 1)',stararrow:'Lưu Tinh Thần Cung (sự kiện sao · top 2)',sevenstars:'Thất Tinh Linh Phù (sự kiện sao · top 3)',stardust:'Tinh Sa Linh Đại (sự kiện sao · tham gia)'};
export function railPages(s){
  const realms=s?.realms||[],cat=s?.catalog||[],pages=[];
  if(s.lanternFestival?.active)pages.push({title:'ĐÊM ĐÈN ĐỒNG MÔN',rows:[{cmd:'cùng tu',text:'Vào hàng ghép bạn ngẫu nhiên'},{cmd:'cùng tu a / cùng tu b',text:'Trả lời câu hỏi của đôi; không cần giống nhau'},{cmd:'tu luyện',text:'Mỗi người 3 lần → cùng thắp đèn'},{cmd:'cùng tu hủy',text:'Rời hàng / dừng cùng tu'}]});
  pages.push({title:'CÙNG ĐỒNG MÔN',rows:[{cmd:'cùng tu + tên / mã',text:'Người kia gõ lại để đồng ý; mỗi người tu luyện 3 lần'},{cmd:'giúp + tên / mã',text:'Hộ pháp người đủ đột phá; họ gõ đột phá trong 2 phút'},{cmd:'cùng tu hủy',text:'Dừng cùng tu · miễn phí, không cần quà'}]});
  pages.push({title:'LỆNH TRANG BỊ',rows:[
    {cmd:'học',text:'Học bí pháp kế tiếp'},{cmd:'rèn',text:'Rèn pháp bảo kế tiếp'},{cmd:'trang bị',text:'Đeo món mạnh nhất'},
    {cmd:'luyện đan',text:'Luyện viên đan tốt nhất'},{cmd:'dùng',text:'Dùng đan đang có'}]});
  pages.push({title:'LỆNH KHÁC',rows:[
    {cmd:'tu vi',text:s.settings?.ascensionShowcase===true?'Xem điều kiện đột phá · không cần quà':'Xem tu vi còn thiếu · Tiên Đế cần tổng quà 100 coin'},{cmd:'gợi ý',text:'Tông sư chỉ việc tiếp theo'},{cmd:'giới tính nam/nữ',text:'Đổi xưng hô'},
    {cmd:'cơ duyên',text:'Xem tiến độ cơ duyên'},{cmd:'skin + tên · skin mặc định',text:'Mặc skin đã có · về áo cảnh giới'}]});
  if(s.petEvent?.active)pages.unshift({title:'LINH THÚ CỐC',rows:[{cmd:'thú',text:'Xem tiến độ và thú đã có'},{cmd:'thú 1–5',text:'Đổi linh thú đã mở khóa'},{cmd:'thú ẩn',text:'Cho linh thú nghỉ ngơi'}]});
  // v53: các mốc cảnh giới — tu vi + linh thạch cần để lên, và áo/hào quang đi kèm.
  const short=n=>n>=1e6?(n/1e6).toFixed(n>=1e7?0:1).replace('.',',')+' triệu':n>=1e4?Math.round(n/1e3)+'K':new Intl.NumberFormat('vi-VN').format(n);
  const LOOK=['','','','Áo vàng','Áo vàng','Áo đỏ Xích Phượng','Áo đỏ Xích Phượng','Áo Thương Long','Thương Long','+ vầng sáng sau đầu','+ đài sen vàng','+ cánh ánh sáng','+ 6 phi kiếm hộ thân','+ thiên quang chín màu'];
  const costs=s?.realmCosts||[];const realmRows=realms.map((name,r)=>r&&costs[r]?{cmd:`${r}. ${name}`,text:`${short(costs[r].qi)} tu vi · ${short(costs[r].stones)} thạch${LOOK[r]?' · '+LOOK[r]:''}`}:null).filter(Boolean);
  for(const rows of chunk(realmRows))pages.push({title:'CẢNH GIỚI · gõ đột phá',rows});
  const manuals=cat.filter(i=>i.type==='manual').map(i=>({cmd:i.name,text:`${stat(i)||i.description?.split(':')[0]||''} · ${i.price} thạch · ${realms[i.tier]||''}`}));
  for(const rows of chunk(manuals))pages.push({title:'BÍ PHÁP · gõ học',rows});
  const craft=cat.filter(i=>i.type==='artifact'&&!i.exclusive).sort((a,b)=>a.tier-b.tier||a.price-b.price)
    .map(i=>({cmd:i.name,text:`${stat(i)} · ${i.price} thạch${i.herbs?' '+i.herbs+' thảo':''} · ${realms[i.tier]||''}`}));
  for(const rows of chunk(craft))pages.push({title:'PHÁP BẢO · gõ rèn',rows});
  const special=cat.filter(i=>i.type==='artifact'&&i.exclusive).map(i=>({cmd:i.name,text:`${stat(i)} · ${i.eventReward||(i.giftMin?`quà ${i.giftMin}+ coin`:i.loyaltyMinutes?`hoạt động ${i.loyaltyMinutes} phút`:i.id==='tiger-bell'?'Top công lực Lôi Hổ':'Đại Hộ Pháp')}`}));
  for(const rows of chunk(special))pages.push({title:'PHÁP BẢO QUÀ · SỰ KIỆN',rows});
  const pills=cat.filter(i=>i.type==='pill').map(i=>({cmd:i.name,text:`+${i.qi} tu vi · ${i.price} thạch ${i.herbs} thảo`}));
  if(pills.length)pages.push({title:'ĐAN DƯỢC · gõ luyện đan',rows:pills.slice(0,5)});
  const techs=Object.entries(TECHNIQUES).map(([id,t])=>({cmd:t.name,text:TECH_SOURCE[id]||'',color:t.color}));
  for(const rows of chunk(techs))pages.push({title:'CHIÊU THỨC · gõ đánh',rows});
  return pages;
}
export function railHTML(s,page,esc){
  const pages=railPages(s);if(!pages.length)return '';const p=pages[((page%pages.length)+pages.length)%pages.length];
  return `<b class="rail-title">${esc(p.title)}</b>`+p.rows.map(r=>`<div class="rail-row"><code${r.color?` style="color:${r.color}"`:''}>${esc(r.cmd)}</code><small>${esc(r.text)}</small></div>`).join('')
    +`<div class="rail-dots">${pages.map((_,i)=>`<i${i===page%pages.length?' class="on"':''}></i>`).join('')}</div>`;
}
export {plain};
