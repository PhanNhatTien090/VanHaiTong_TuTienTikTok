// v84: ĐẠI ĐIỂN VINH DANH — màn toàn cảnh tôn phong top 3 người tặng quà (DOM + CSS, không tốn canvas).
// Thứ tự xuất hiện: Hữu Hộ Pháp (3) → Tả Hộ Pháp (2) → Thái Thượng Hộ Pháp (1, giữa, to nhất, khung rồng vàng).
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const FRAME=[1,2,0]; // hạng 1 rồng vàng · 2 tím pha lê · 3 ngọc bích (honor-frames.png)
const SLOT=['first','second','third'];
let timer=null;
export const CEREMONY_MS=12000;
function seat(p,i){return `<div class="cer-seat cer-${SLOT[i]}">
  <div class="cer-portrait"><span class="cer-initial">${esc(Array.from(p.name||'Đ')[0])}</span>${p.avatar?`<img src="${esc(p.avatar)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}
  <svg viewBox="${FRAME[i]*512} 0 512 512" aria-hidden="true"><image href="/assets/honor-frames-v2.png" width="1536" height="512" preserveAspectRatio="none"/></svg></div>
  <b class="cer-title">${esc(p.title)}</b><strong class="cer-name">${esc(p.name)}</strong><small>${fmt(p.coins)} coin · ${esc(p.realmName||'')}</small></div>`;}
export function showCeremony(root,e){
  if(!root||!e?.ceremony?.length)return;clearTimeout(timer);
  const L=e.ceremony,order=[2,1,0].filter(i=>L[i]);
  root.innerHTML=`<div class="cer-veil"></div><div class="cer-rays"></div><div class="cer-sparks">${Array.from({length:28},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%7)*.35}s;--s:${.6+(i%5)*.25}"></i>`).join('')}</div>
    <div class="cer-head"><span>✦ VÂN HẢI TÔNG ✦</span><h2>ĐẠI ĐIỂN VINH DANH</h2><p>Tôn phong hộ pháp trước toàn tông môn</p></div>
    <div class="cer-stage cer-n${order.length}">${order.map(i=>seat(L[i],i)).join('')}</div>`;
  root.hidden=false;root.classList.remove('cer-on');void root.offsetWidth;root.classList.add('cer-on');
  timer=setTimeout(()=>{root.classList.add('cer-out');setTimeout(()=>{root.hidden=true;root.classList.remove('cer-on','cer-out');},700);},CEREMONY_MS-700);
}
