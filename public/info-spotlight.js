// 15/11/2026: BẢNG THÔNG TIN TO góc dưới phải — cột trái giờ chủ yếu là "Chơi nhanh · gõ số", nên các thông tin
// chức vị / rèn / bí pháp / đan dược (15/11: bỏ trang cảnh giới theo user) lâu lâu hiện bản to ở góc dưới phải: mỗi 4 phút hiện 1 phút, mỗi lần 1 chủ đề.
// Lúc hiện thì tạm ẩn bảng Lệnh Ngũ Đường (cùng chỗ). Màn chiếm cả sân (đột phá, đua, Chính Ma, mê cung, tỷ thí, Linh Thú Cốc…) thì không hiện — giống bảng Ngũ Đường.
import {HONOR_LEGEND} from './honor-icons.js';
export const INFO_PERIOD_MS=240000,INFO_SHOW_MS=60000;
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
// Lấy đều các món theo giá để 1 trang thấy được từ rẻ tới đắt.
function spread(list,n){if(list.length<=n)return list;const out=[];for(let i=0;i<n;i++)out.push(list[Math.round(i*(list.length-1)/(n-1))]);return [...new Set(out)];}
export function infoPages(state={}){
 const realms=state.realms||[],realm=t=>realms[t]||'';
 const cat=(state.catalog||[]).filter(i=>!i.exclusive),of=type=>cat.filter(i=>i.type===type).sort((a,b)=>(a.price||0)-(b.price||0));
 const cost=i=>fmt(i.price)+' thạch'+(i.herbs?' · '+fmt(i.herbs)+' thảo':'');
 const pages=[{id:'honor',title:'🏅 HUY HIỆU CHỨC VỊ',note:'Icon nhỏ cạnh tên mỗi người trên sân',rows:HONOR_LEGEND.map(([i,t])=>[i,t])}];
 // 15/11: thay trang cảnh giới — lệnh xem thông tin của chính mình (đều là lệnh thật: engine.mjs tuvi/canh, inventory.mjs túi/thú/thú kỹ/skin, engagement nhiệm vụ).
 pages.push({id:'me',title:'👤 XEM THÔNG TIN CỦA MÌNH',note:'Gõ trong bình luận · thẻ hiện giữa màn vài giây',rows:[['9 · tu vi','thẻ tu vi, cảnh giới, còn thiếu gì để đột phá'],['túi đồ','pháp bảo, đan dược, bí pháp đang có'],['thú','linh thú đã có'],['thú kỹ','cấp, kinh nghiệm, thân thiết, tuyệt kỹ của thú'],['skin','tủ skin đang có · skin + tên để mặc'],['cánh','cánh đã mở · cánh + số để đổi'],['nhiệm vụ','nhiệm vụ hôm nay']]});
 const arts=spread(of('artifact'),8);
 if(arts.length)pages.push({id:'forge',title:'🔨 RÈN PHÁP BẢO',note:'Gõ 7 · rèn (món tốt nhất đủ tiền) hoặc rèn + tên',rows:arts.map(a=>[a.name,cost(a)+(realm(a.tier)?' · '+realm(a.tier):'')])});
 const manuals=of('manual');
 if(manuals.length)pages.push({id:'manual',title:'📜 BÍ PHÁP',note:'Gõ học (bí pháp tốt nhất đủ tiền) hoặc học + tên',rows:manuals.map(m=>[m.name,cost(m)+(m.description?' · '+m.description:'')])});
 const pills=of('pill');
 pages.push({id:'pill',title:'⚗ ĐAN DƯỢC · LINH THẢO',note:'',rows:[['2 · hái','hái linh thảo làm nguyên liệu'],['4 · luyện đan','luyện viên tốt nhất đủ nguyên liệu'],['5 · dùng','uống đan, cộng tu vi'],...pills.map(p=>[p.name,cost(p)+(p.qi?' · +'+fmt(p.qi)+' tu vi':'')])]});
 pages.push({id:'gear',title:'⚔ PHÁP BẢO & TRANG BỊ',note:'',rows:[['trang bị','đeo món mạnh nhất đang có'],['trang bị + tên','đeo đúng món mình chọn'],['3 · đánh','pháp bảo tung chiêu, tăng tu vi'],['túi đồ','xem pháp bảo, đan, bí pháp đang có'],['hồi khí','tỷ thí: hồi linh lực, tối đa 3 lần']]});
 // 15/11: Vân Hải Lôi Đài (arena.mjs) — lệnh thật.
 // 15/11: luật ghế Tông chủ (master-seat.mjs).
 pages.push({id:'master',title:'👑 GHẾ TÔNG CHỦ',note:'Đấu tại Lôi Đài · thua vẫn giữ danh hiệu và đồ',rows:[['Vương miện','một món · mở danh hiệu Tông chủ'],['Gặp nhau','2 Tông chủ cùng có mặt → đấu ngay'],['Thắng','ngồi ghế Tông chủ'],['Đại lễ 5k','lên ghế ngay, không cần đấu']]});
 pages.push({id:'bao',title:'✦ THẦN KHÍ · BẢO KHỐ',note:'Bảo Khố mở trong vòng sự kiện lớn · bản web: mục Bảo Khố xem + đặt bản mệnh',rows:[['cầu','cầu thần khí khi Bảo Khố mở · 20 giây một lượt'],['thần khí','xem bộ sưu tập + còn bao lượt tới 4★/5★'],['trang bị + tên','đeo thần khí làm bản mệnh (như pháp bảo)'],['bản mệnh','xem món đang mang · bản mệnh + số để đổi'],['tự phát · không cần gõ','bản mệnh tự tung thần thông ở Lôi Đài · Tháp · tỷ thí · Chính Ma · 5★/GIỚI HẠN có màn chiếu riêng'],['GIỚI HẠN','12 món mỗi mùa · mỗi người tối đa 1 món']]}); // 18/11: hướng dẫn tính năng mới
 { // 18/11: LUÂN HỒI — chỉ hiện khi đã có người ở 3 cảnh giới cuối hoặc đã chuyển sinh
  const pl=state.players||[],lh=pl.filter(p=>p.reincarnations>0).sort((a,b)=>b.reincarnations-a.reincarnations||(b.totalQi||0)-(a.totalQi||0)).slice(0,3);
  if(lh.length||pl.some(p=>p.realm>=26))pages.push({id:'luanhoi',title:'☸ LUÂN HỒI · CHUYỂN SINH',note:'Đầy tu vi Hỗn Độn Vĩnh Hằng mới chuyển sinh được',rows:[['chuyển sinh','về Phàm nhân · nhận ân điển vĩnh viễn'],['luân hồi','xem ân điển của mình'],['đạo quả kiếm / thể / đan / phúc','mỗi lần chuyển sinh lĩnh ngộ 1 tầng'],...lh.map(p=>['☸ '+p.name,p.reincarnations+' thế luân hồi'])]});
 }
 pages.push({id:'arena',title:'⚔ VÂN HẢI LÔI ĐÀI',note:'Mở theo lịch thi đấu · thắng và giữ đài nhận huy chương',rows:[['chiêu','xem bộ 5 chiêu của mình'],['bí pháp','xem 12 bí pháp chiêu thức'],['học + tên','học bí pháp · có chiêu mới'],['chiêu đổi + tên','đưa bí pháp vào SK2'],['lên đài','làm Đài Chủ hoặc xếp hàng'],['thách + tên','hẹn đấu · người kia gõ nhận'],['cv1 · cv2','cổ vũ trái / phải']]});
 return pages;
}
// → trang đang hiện hoặc null. Hiện ở 60 s đầu mỗi chu kỳ 4 phút; chu kỳ sau chuyển chủ đề.
export function spotlightPage(state,now=Date.now()){
 const pages=infoPages(state);if(!pages.length)return null;
 const cycle=Math.floor(now/INFO_PERIOD_MS);if(now-cycle*INFO_PERIOD_MS>=INFO_SHOW_MS)return null;
 return pages[cycle%pages.length];
}
export function spotlightHTML(p,esc){
 if(!p)return '';
 return '<b>'+esc(p.title)+'</b><ol'+(p.cols===2?' class="info-cols"':'')+'>'+p.rows.map(([k,v])=>'<li><code>'+esc(k)+'</code><span>'+esc(v)+'</span></li>').join('')+'</ol>'+(p.note?'<small>'+esc(p.note)+'</small>':'');
}
const BLOCK=['sword-race','sect-war','maze-on','ritual-active','pet-cove-stage','social-stage','performance-solo','ascension-stage','hall-war'];
export function renderInfoSpotlight(state,esc,now=Date.now()){
 const root=document.querySelector('.scene-shell');if(!root||!state)return;
 let el=document.getElementById('infoSpotlight');if(!el){el=document.createElement('aside');el.id='infoSpotlight';el.className='info-spotlight';el.hidden=true;root.appendChild(el);}
 const blocked=BLOCK.some(c=>document.body.classList.contains(c)),p=blocked?null:spotlightPage(state,now),html=spotlightHTML(p,esc);
 if(el.dataset.html!==html){el.innerHTML=html;el.dataset.html=html;}
 el.hidden=!p;document.body.classList.toggle('info-spotlight-on',!!p);
}
