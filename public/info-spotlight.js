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
 const arts=spread(of('artifact'),8);
 if(arts.length)pages.push({id:'forge',title:'🔨 RÈN PHÁP BẢO',note:'Gõ 7 · rèn (món tốt nhất đủ tiền) hoặc rèn + tên',rows:arts.map(a=>[a.name,cost(a)+(realm(a.tier)?' · '+realm(a.tier):'')])});
 const manuals=of('manual');
 if(manuals.length)pages.push({id:'manual',title:'📜 BÍ PHÁP',note:'Gõ học (bí pháp tốt nhất đủ tiền) hoặc học + tên',rows:manuals.map(m=>[m.name,cost(m)+(m.description?' · '+m.description:'')])});
 const pills=of('pill');
 pages.push({id:'pill',title:'⚗ ĐAN DƯỢC · LINH THẢO',note:'',rows:[['2 · hái','hái linh thảo làm nguyên liệu'],['4 · luyện đan','luyện viên tốt nhất đủ nguyên liệu'],['5 · dùng','uống đan, cộng tu vi'],...pills.map(p=>[p.name,cost(p)+(p.qi?' · +'+fmt(p.qi)+' tu vi':'')])]});
 pages.push({id:'gear',title:'⚔ PHÁP BẢO & TRANG BỊ',note:'',rows:[['trang bị','đeo món mạnh nhất đang có'],['trang bị + tên','đeo đúng món mình chọn'],['3 · đánh','pháp bảo tung chiêu, tăng tu vi'],['túi đồ','xem pháp bảo, đan, bí pháp đang có'],['hồi khí','tỷ thí: hồi linh lực, tối đa 3 lần']]});
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
