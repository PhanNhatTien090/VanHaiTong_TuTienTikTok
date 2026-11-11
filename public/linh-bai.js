// 11/11/2026: LINH BÀI ĐẠO HỮU — thẻ hồ sơ giữa màn khi gõ 9 / tu vi.
// Không lag: chân dung vẽ MỘT lần vào canvas riêng (kèm viền sáng bằng drop-shadow), lưu cache theo bộ áo; thẻ là HTML,
// chỉ hiện ~5 s theo lượt Vân Đài nên không chồng hiệu ứng. Nền thẻ tối để chữ và nhân vật nổi, tự tắt sau lượt.
import {skinFor} from './cosmetics.js';
const PORTRAIT_W=220,PORTRAIT_H=260,cache=new Map();
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const pct=(a,b)=>Math.max(0,Math.min(100,(Number(a)||0)/Math.max(1,Number(b)||1)*100)).toFixed(1);
export const LINH_BAI_MS=5200;
function portraitKey(p){return [p.id,p.realm,p.gender,p.giftCoins,p.skinChoice,p.skinChoiceSource,p.divineRoleChoice,p.divineRoleHidden,(p.divineRoles||[]).join(),(p.rewardSkins||[]).join(),p.equipped].join('|');}
export function portraitCanvas(scene,p){
 const key=portraitKey(p);if(cache.has(key))return cache.get(key);
 const body=document.createElement('canvas');body.width=PORTRAIT_W;body.height=PORTRAIT_H;const x=body.getContext('2d');
 x.translate(PORTRAIT_W/2,PORTRAIT_H-22);x.scale(3.1,3.1);
 try{scene.drawCharacterBody(x,p,skinFor(p.giftCoins),0);}catch{return null;}
 // Viền sáng sát hình + quầng vàng: tách nhân vật khỏi nền tối (học từ phòng mẫu), làm một lần rồi giữ lại.
 const out=document.createElement('canvas');out.width=PORTRAIT_W;out.height=PORTRAIT_H;const o=out.getContext('2d');
 o.filter='drop-shadow(0 0 1.2px #fffbe8) drop-shadow(0 0 1.2px #ffe6a0) drop-shadow(0 0 9px rgba(255,205,110,.75))';o.drawImage(body,0,0);o.filter='none';
 cache.set(key,out);if(cache.size>24)cache.delete(cache.keys().next().value);return out;
}
// 11/11: Túi đồ · Linh thú · Tủ skin — cùng khung ngọc bài, phần thân là danh sách gọn.
const listHTML=(title,box,row,esc,empty)=>`<div class="lb-list"><label>${title}</label>${box.items.length?`<ul>${box.items.map(x=>row(x,esc)).join('')}${box.more?`<li class="lb-more">+${box.more} món khác</li>`:''}</ul>`:`<p class="lb-none">${empty}</p>`}</div>`;
function inventoryHTML(e,esc){
 const c=e.card,tip=`<div class="lb-tip">${esc(c.tip).replace(/\b(\d)\b/g,'<u>$1</u>')}</div>`;
 let head,body;
 if(c.kind==='bag'){
  head=`<span class="lb-path">TÚI ĐỒ</span><span class="lb-need"><b>${fmt(c.stones)}</b> linh thạch · <b>${fmt(c.herbs)}</b> linh thảo</span>`;
  body=listHTML('Pháp bảo',c.artifacts,(x,esc)=>`<li${x.on?' class="on"':''}>${esc(x.name)}${x.on?' <em>đang đeo</em>':''}</li>`,esc,'chưa có · gõ 7 rèn')
   +listHTML('Đan dược',c.pills,(x,esc)=>`<li>${esc(x.name)} <em>×${fmt(x.n)}</em></li>`,esc,'chưa có · gõ 4 luyện đan')
   +listHTML('Bí pháp',c.manuals,(x,esc)=>`<li>${esc(x)}</li>`,esc,'chưa học · gõ học');
 }else if(c.kind==='pets'){
  head=`<span class="lb-path">LINH THÚ</span><span class="lb-need">Đồng hành: <b>${esc(c.current||'chưa có')}</b></span>`;
  body=listHTML(`Đã thu phục (${c.owned.items.length+c.owned.more}/${c.total})`,c.owned,(x,esc)=>`<li${x.on?' class="on"':''}><em>${x.no}</em> ${esc(x.name)}</li>`,esc,'chưa có linh thú nào');
 }else{
  head=`<span class="lb-path">TỦ SKIN</span><span class="lb-need">Đang mặc: <b>${esc(c.current)}</b></span>`;
  body=listHTML(`Đã sở hữu (${c.owned.items.length+c.owned.more})`,c.owned,(x,esc)=>`<li${x.on?' class="on"':''}>${esc(x.name)}</li>`,esc,'chưa có skin riêng');
 }
 return `<div class="lb-head">${head}</div><div class="lb-body"><div class="lb-portrait"><span class="lb-halo"></span><i class="lb-slot"></i></div><div class="lb-info"><small class="lb-seal">✦ ${esc(e.name)} ✦</small>${body}</div></div>${tip}`;
}
export function linhBaiHTML(e,esc){
 if(e.card?.kind)return inventoryHTML(e,esc);
 const c=e.card,short=Math.max(0,c.needQi-c.qi),stonesShort=Math.max(0,c.needStones-c.stones);
 const head=c.next?(c.ready?`<em class="lb-ready">ĐỦ ĐỘT PHÁ</em>`:short?`Cần thêm <b>${fmt(short)}</b> tu vi`:`Cần thêm <b>${fmt(stonesShort)}</b> linh thạch`):'<em class="lb-ready">ĐỈNH TU TIÊN</em>';
 return `<div class="lb-head"><span class="lb-path">${esc(c.realmName)}${c.next?` <i>→</i> ${esc(c.next)}`:''}</span><span class="lb-need">${head}</span></div>
<div class="lb-body"><div class="lb-portrait"><span class="lb-halo"></span><i class="lb-slot"></i></div>
<div class="lb-info"><small class="lb-seal">✦ LINH BÀI ĐẠO HỮU ✦</small><strong class="lb-name">${esc(e.name)}</strong>
<span class="lb-realm">${esc(c.realmName)}</span>
<div class="lb-stat"><label>Tu vi</label><div class="lb-bar"><i style="width:${pct(c.qi,c.needQi)}%"></i></div><span>${fmt(c.qi)} / ${fmt(c.needQi)}</span></div>
<div class="lb-stat lb-stone"><label>Linh thạch</label><div class="lb-bar"><i style="width:${pct(c.stones,c.needStones)}%"></i></div><span>${fmt(c.stones)} / ${fmt(c.needStones)}</span></div>
<div class="lb-rank">Hạng tu vi <b>#${fmt(c.rank)}</b> / ${fmt(c.players)} đạo hữu</div></div></div>
<div class="lb-tip">${esc(c.tip).replace(/\b(\d)\b/g,'<u>$1</u>')}</div>`;
}
let hideTimer=null,goneTimer=null;
export function showLinhBai(el,e,scene,player,esc,duration=LINH_BAI_MS){
 if(!el||!e?.card)return false;
 el.innerHTML=linhBaiHTML(e,esc);
 const slot=el.querySelector('.lb-slot'),art=player?portraitCanvas(scene,player):null;
 if(slot&&art){const view=document.createElement('canvas');view.width=art.width;view.height=art.height;view.getContext('2d').drawImage(art,0,0);slot.replaceWith(view);}
 else if(slot&&e.avatar)slot.outerHTML=`<img class="lb-avatar" src="${esc(e.avatar)}" referrerpolicy="no-referrer" alt="">`;
 el.hidden=false;el.classList.remove('lb-out');void el.offsetWidth;el.classList.add('lb-in');
 // Hủy CẢ hai hẹn giờ của thẻ trước: thẻ cũ mờ dần 380 ms rồi ẩn — nếu còn sót sẽ ẩn mất thẻ mới vừa hiện.
 clearTimeout(hideTimer);clearTimeout(goneTimer);hideTimer=setTimeout(()=>{el.classList.add('lb-out');goneTimer=setTimeout(()=>{el.hidden=true;el.classList.remove('lb-in','lb-out');},380);},duration);
 return true;
}
