// 08/11/2026: TikTok chê bảng sự kiện ghi "300 coin" là không tự nhiên → hiện ẢNH món quà thật × số lượng thay cho số coin.
// Ảnh lấy từ chính các quà người xem đã tặng trên kênh (server ghi w.giftArt từ giftPictureUrl của TikFinity).
// Chưa ai tặng món đó trên kênh thì dùng ảnh quà thật lưu sẵn trong public/assets/gifts (tải từ danh mục quà TikTok, 08/11 tối) — không hiện chữ.
const FALLBACK=Object.freeze([[500,'Money Gun','money-gun'],[200,'Baglama','baglama'],[100,'Hand Heart','hand-heart'],[1,'Rose','rose']].map(([coins,name,file])=>({coins,name,url:'/assets/gifts/'+file+'.png'})));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safeGiftUrl(u){if(typeof u!=='string'||u.length>600)return null;try{const x=new URL(u);return x.protocol==='https:'&&/(^|\.)tiktokcdn(-us|-eu)?\.com$/.test(x.hostname)?x.href:null;}catch{return null;}}
// Ưu tiên ảnh quà kênh đã ghi; đúng giá trước, rồi mới tới món rẻ hơn nhân lên (tối đa ×5, chọn món giá cao nhất).
export function giftFor(art,coins){
 const list=Object.entries(art||{}).map(([name,a])=>({name,coins:Number(a?.coins),url:safeGiftUrl(a?.url)})).filter(g=>Number.isSafeInteger(g.coins)&&g.coins>0&&g.url);
 const exact=pool=>{const g=pool.find(g=>g.coins===coins);return g?{...g,count:1}:null;};
 const fit=pool=>{const g=pool.filter(g=>g.coins<coins&&coins%g.coins===0&&coins/g.coins<=5).sort((a,b)=>b.coins-a.coins)[0];return g?{...g,count:coins/g.coins}:null;};
 return exact(list)||exact(FALLBACK)||fit(list)||fit(FALLBACK)||{name:'quà lớn',coins,url:null,count:1};
}
export function giftTokenHTML(art,coins){const g=giftFor(art,coins),n=g.count>1?' ×'+g.count:'';
 return g.url?`<img class="gift-ico" src="${esc(g.url)}" alt="${esc(g.name)}" referrerpolicy="no-referrer">${n}`:`<b class="gift-ico-name">${esc(g.name)}</b>${n}`;}
