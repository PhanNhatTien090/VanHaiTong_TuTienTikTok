// 11/11/2026: NGỌC GIẢN BÁO HỶ — thẻ "THÀNH CÔNG" giữa màn cho việc đáng chúc mừng mà trước chỉ là một dòng chữ:
// rèn thành pháp bảo, lĩnh ngộ bí pháp, Tông Chủ ban thưởng, thăng VIP. (Quà tặng đã có thẻ biên nhận riêng;
// đột phá có màn nghi lễ riêng; luyện đan quá thường xuyên → không làm thẻ.)
// Không lag: cùng khuôn Linh Bài — HTML + CSS, chân dung lấy từ cache viền sáng (vẽ 1 lần), mỗi lúc 1 thẻ theo hàng Vân Đài.
import {portraitCanvas} from './linh-bai.js';
export const BAO_HY_MS=4200;
const KIND={
 craft:{ribbon:'THÀNH CÔNG',verb:'Rèn thành',line:a=>a.skin?`Pháp bảo mới · mở khóa trang phục ${a.skin}`:'Pháp bảo mới · đã tự trang bị',tip:'gõ 7 rèn tiếp'},
 learn:{ribbon:'THÀNH CÔNG',verb:'Lĩnh ngộ',line:()=>'Bí pháp mới · tu luyện nhanh hơn',tip:'gõ 1 vận công thử ngay'},
 admin:{ribbon:'TÔNG CHỦ BAN THƯỞNG',verb:'Nhận',line:a=>(a.parts||[]).slice(0,3).join(' · '),tip:null},
 vip:{ribbon:'THĂNG HỘ PHÁP',verb:'Đạt',line:()=>'Danh vị mới trong tông môn',tip:null},
 genius:{ribbon:'THIÊN TÀI XUẤT THẾ',title:a=>a.item,line:a=>'tu luyện '+Math.round(a.value||0).toLocaleString('vi-VN')+' tu vi hôm nay · đứng đầu tông môn',tip:'gõ 1 tu luyện để đuổi kịp'}
};
export function baoHyHTML(e,esc){
 const a=e.achieve,k=KIND[a?.kind];if(!k)return '';
 const thanks=a.kind==='genius'?((a.runners||[]).join(' · ')||'Toàn tông kính phục'):a.kind==='admin'?`${e.name} đa tạ Tông Chủ`:a.kind==='vip'?`Đa tạ hộ pháp ${e.name}`:`Chúc mừng ${e.name}`;
 return `<div class="bh-ribbon"><span>✦ ${esc(k.ribbon)} ✦</span></div>
<div class="bh-body"><div class="bh-portrait"><i class="bh-slot"></i></div><div class="bh-text">
<strong class="bh-title">${k.title?esc(k.title(a)):`<em>${esc(k.verb)}</em> · ${esc(a.item)}`}</strong>
${k.line(a)?`<span class="bh-line">${esc(k.line(a))}</span>`:''}
<span class="bh-thanks">${esc(thanks)}</span>${k.tip?`<small class="bh-tip">${esc(k.tip).replace(/\b(\d)\b/g,'<u>$1</u>')}</small>`:''}</div></div>`;
}
let hideTimer=null,goneTimer=null;
export function showBaoHy(el,e,scene,player,esc,duration=BAO_HY_MS){
 const html=el&&e?.achieve?baoHyHTML(e,esc):'';if(!html)return false;
 el.innerHTML=html;
 const slot=el.querySelector('.bh-slot'),art=player?portraitCanvas(scene,player):null;
 if(slot&&art){const view=document.createElement('canvas');view.width=art.width;view.height=art.height;view.getContext('2d').drawImage(art,0,0);slot.replaceWith(view);}
 else slot?.parentElement?.remove();
 el.hidden=false;el.classList.remove('bh-out');void el.offsetWidth;el.classList.add('bh-in');
 clearTimeout(hideTimer);clearTimeout(goneTimer);
 hideTimer=setTimeout(()=>{el.classList.add('bh-out');goneTimer=setTimeout(()=>{el.hidden=true;el.classList.remove('bh-in','bh-out');},380);},duration);
 return true;
}
