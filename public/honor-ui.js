import {breakthroughRealm,breakthroughDuration,REALM_NAMES} from './breakthrough-fx.js';
import {ascensionProfile} from './ascension-art.js';
import {honorTitle,safeAvatar} from './honors.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class HonorUI{
 constructor(root){this.root=root;this.lastAt=0;this.until=0;this.index=0;this.roll=[];this.players=new Map();}
 update(state){this.roll=state.honors||[];this.players=new Map(state.players.map(p=>[p.id,p]));}
 show(event,now=Date.now()){
  const p=this.players.get(event.user);if(!p||p.resident)return;
  if(event.effect==='breakthrough'){const r=breakthroughRealm(event);this.display({...p,avatar:safeAvatar(p.avatar),title:ascensionProfile(r).title.toLocaleUpperCase('vi'),frame:r>=10?1:r>=6?2:0,detail:'Đột phá '+REALM_NAMES[r]+(r>=8?' · thiên đạo vinh danh':'')},now,breakthroughDuration(event));return;}
  if(event.tournamentChampion){this.display({...p,avatar:safeAvatar(p.avatar),title:'KIẾM KHÔI TÔNG MÔN',frame:1,detail:'Vô địch Phong Vân Luận Kiếm'},now,8000);return;}
  const h=honorTitle(p,this.roll),value=(event.coins||0)*(event.count||1);
  // v50: vinh danh từ 99 coin (khớp mốc hiệu ứng quà lớn), trước là 199.
  if(!h&&value<99)return;
  this.display({...p,...h,avatar:safeAvatar(p.avatar),title:h?.title||(value>=5000?'VẠN KIM THIÊN ÂN':value>=1000?'THIÊN ÂN CHIẾU':value>=299?'QUÝ NHÂN TƯƠNG TRỢ':'TIÊN MÔN TRI ÂN'),// v55: khung theo mức quà (vàng; từ 1.000 coin tím) — khung ngọc xanh chỉ còn cho Trưởng Lão khi không tặng quà.
  frame:value>=1000?2:value>=99?1:(h?.frame??1),detail:value>=99?`${value.toLocaleString('vi-VN')} coin · ${event.gift||'cảm ơn đạo hữu'}`:p.realmName},now,Math.min(7000,value>=99?6500:4200));
 }
 display(p,now,ms){
  if(!this.root)return;this.lastAt=now;this.until=now+ms;
  this.root.innerHTML=`<div class="honor-portrait"><span class="honor-fallback">${esc(Array.from(p.name||'Đạo hữu')[0])}</span>${p.avatar?`<img class="honor-avatar" src="${esc(p.avatar)}" alt="Avatar ${esc(p.name)}" referrerpolicy="no-referrer">`:''}<svg class="honor-frame" viewBox="${p.frame*512} 0 512 512" aria-hidden="true"><image href="/assets/honor-frames-v2.png" width="1536" height="512" preserveAspectRatio="none"/></svg></div><b>${esc(p.title)}</b><strong>${esc(p.name)}</strong><small>${esc(p.detail||'')}</small>`;
  const img=this.root.querySelector('.honor-avatar');if(img)img.onerror=()=>img.remove();
  this.root.hidden=false;this.root.classList.remove('honor-enter');void this.root.offsetWidth;this.root.classList.add('honor-enter');
 }
 tick(busy,now=Date.now()){
  if(now>=this.until&&this.root)this.root.hidden=true;
  if(busy||now-this.lastAt<45000)return;
  const active=this.roll.filter(h=>h.active);if(!active.length)return;
  this.display(active[this.index++%active.length],now,6500);
 }
}
