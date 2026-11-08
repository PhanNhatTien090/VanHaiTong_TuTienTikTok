// 08/11/2026: TikTok chê bảng sự kiện ghi "300 coin" là không tự nhiên → hiện ẢNH món quà thật × số lượng thay cho số coin.
// Ảnh lấy từ chính các quà người xem đã tặng trên kênh (server ghi w.giftArt từ giftPictureUrl của TikFinity).
// Chưa có ảnh thì hiện tên quà thật của kênh (không kèm số coin).
const FALLBACK=Object.freeze([[500,'Vương miện'],[200,'Baglama'],[100,'Trái tim'],[1,'Hoa hồng']]);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeGiftUrl(u){if(typeof u!=='string'||u.length>600)return null;try{const x=new URL(u);return x.protocol==='https:'&&/(^|\.)tiktokcdn(-us|-eu)?\.com$/.test(x.hostname)?x.href:null;}catch{return null;}}
// Chọn món quà để biểu diễn `coins`: ưu tiên món đúng giá; không thì món rẻ hơn nhân lên (tối đa ×5), chọn món giá cao nhất.
export function giftFor(art,coins){
 const list=Object.entries(art||{}).map(([name,a])=>({name,coins:Number(a?.coins),url:safeGiftUrl(a?.url)})).filter(g=>Number.isSafeInteger(g.coins)&&g.coins>0&&g.url);
 const pick=pool=>{const exact=pool.find(g=>g.coins===coins);if(exact)return {...exact,count:1};const fit=pool.filter(g=>g.coins<coins&&coins%g.coins===0&&coins/g.coins<=5).sort((a,b)=>b.coins-a.coins)[0];return fit?{...fit,count:coins/fit.coins}:null;};
 return pick(list)||pick(FALLBACK.map(([c,name])=>({name,coins:c,url:null})))||{name:'quà lớn',coins,url:null,count:1};
}
export function giftTokenHTML(art,coins){const g=giftFor(art,coins),n=g.count>1?' ×'+g.count:'';
 return g.url?`<img class="gift-ico" src="${esc(g.url)}" alt="${esc(g.name)}" referrerpolicy="no-referrer">${n}`:`<b class="gift-ico-name">${esc(g.name)}</b>${n}`;}
