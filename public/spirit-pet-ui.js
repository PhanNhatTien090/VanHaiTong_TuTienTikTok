import {ALL_PETS,petById,petRequirement} from './spirit-pets.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const giftGuide='<code>tặng tên/mã</code> rồi gửi quà hộ · <code>tặng thôi</code> để dừng';
let petGiftTimer;
export function mountPetUI(post){
 const parent=document.querySelector('#eventsView');if(!parent)return;
 const root=document.createElement('div');root.id='spiritPetControl';parent.insertBefore(root,document.querySelector('#socialControl'));
 root.addEventListener('click',async e=>{
  const flag=e.target.closest('[data-pet-v2-toggle]');
  if(flag){flag.disabled=true;try{const r=await post('/api/pet-v2-settings',{enabled:flag.dataset.petV2Toggle==='on',progression:flag.dataset.petV2Toggle==='on',combat:flag.dataset.petV2Toggle==='on',expedition:flag.dataset.petV2Toggle==='on',coveV2:flag.dataset.petV2Toggle==='on',synergy:flag.dataset.petV2Toggle==='on',evolutionArt:flag.dataset.petV2Toggle==='on'});if(!r.ok)alert(r.message||'Chưa cập nhật được.');}finally{flag.disabled=false;}return;}
  const b=e.target.closest('[data-pet-event]');if(!b)return;b.disabled=true;try{const r=await post('/api/pet-event',{action:b.dataset.petEvent,minutes:5});if(!r.ok)alert(r.message||'Chưa mở được sự kiện.');}finally{b.disabled=false;}
 });
 const shell=document.querySelector('.scene-shell'),hud=document.createElement('div');hud.id='spiritPetHud';hud.className='spirit-pet-hud';hud.hidden=true;shell?.appendChild(hud);
 hud.innerHTML=`<div><b>BẮT LINH THÚ</b><span>Thả tim hoặc tặng quà. Đủ mốc tự nhận.</span></div>
 <div><b>LỆNH LINH THÚ</b><span><code>thú</code> xem tiến độ · <code>thú + số</code> đổi · <code>thú ẩn</code> cho nghỉ</span></div>
 <div class="pet-v2-help" hidden><b>LINH THÚ 2.0</b><span><code>thú nuôi</code> · <code>thú luyện</code> · <code>thú kỹ</code> · <code>thú hóa</code> · <code>thú xuất</code> · <code>thú hành</code> · <code>thú duyên</code></span></div>
  <div class="pet-gift-guide"><span>${giftGuide}</span></div>
 <div class="pet-gift-award" role="status" hidden></div>`;
}
export function showPetGiftAward(e){
 const notice=document.querySelector('.pet-gift-award');
 if(!notice||!e.petNames?.length)return;
 notice.textContent=`${e.giftFrom} tặng ${e.name} · ${e.petNames.join(' · ')}`;
 notice.hidden=false;
 clearTimeout(petGiftTimer);
 petGiftTimer=setTimeout(()=>{notice.hidden=true;},6500);
}
export function renderPetUI(state,admin=true){
 const e=state.petEvent,active=e?.active&&state.serverNow<e.endsAt,root=document.querySelector('#spiritPetControl');
 if(admin&&root){const html=`<div class="settings-card"><div><h3>Linh Thú Cốc · 5 phút</h3><p>${active?'Đang mở · còn '+Math.ceil((e.endsAt-state.serverNow)/60000)+' phút':'Đã khép / chưa mở'} · Tim và quà thật cộng dồn riêng trong lượt. Ba con đầu chỉ nhận bằng tim. Kim Vũ Phượng: 3.000 tim hoặc 100 coin. Mỗi lượt xuất hiện ngẫu nhiên một linh thú 200 coin và một thiên linh thú 300 coin.${active&&e.featured?' <b>Lượt này: '+esc(petById(e.featured)?.name||'')+'</b>.':''} Chỉ tính tương tác mới, không tính quà mô phỏng.</p><div class="pet-catalog">${ALL_PETS.map((p,i)=>`<article${p.rare?' class="pet-rare"':''}><div class="pet-thumb"><img src="/assets/spirit-pets-v1/${p.id}.png" alt="${esc(p.name)}"></div><b>${i+1}. ${p.name}</b><small>${p.rank} · ${petRequirement(p)}</small></article>`).join('')}</div><p>Tự nhận và gọi con cao nhất mới mở khóa. Gõ <code>thú</code> xem tiến độ · <code>thú 1</code> đến <code>thú ${ALL_PETS.length}</code> đổi con đã có · <code>thú ẩn</code> cho nghỉ. Linh thú giữ vĩnh viễn, mỗi người chỉ hiện 1 con. Chỉ mang tính trang trí.</p></div><div class="editor-actions"><button class="soft-button" data-pet-v2-toggle="${state.petV2Settings?.enabled?'off':'on'}">Linh thú V2: ${state.petV2Settings?.enabled?'ĐANG BẬT':'ĐANG TẮT'} (thử nghiệm)</button><button class="gold-button" data-pet-event="start" ${active?'disabled':''}>Mở 5 phút</button><button class="soft-button" data-pet-event="stop" ${active?'':'disabled'}>Khép sự kiện</button><a href="/pet-cove-preview.html" target="_blank" rel="noopener">Xem sân Linh Thú Cốc ↗</a></div></div>`;if(root._petHTML!==html){root.innerHTML=html;root._petHTML=html;}}
 const hud=document.querySelector('#spiritPetHud');if(!hud)return;
 hud.hidden=admin||!active||state.environment?.id!=='pet-cove';
  const newHelp=hud.querySelector('.pet-v2-help');if(newHelp)newHelp.hidden=!state.petV2Settings?.enabled;
 if(admin&&root){const guide=root.querySelector('.pet-catalog + p');if(guide&&!guide.querySelector('.pet-gift-help'))guide.insertAdjacentHTML('beforeend',` <span class="pet-gift-help">${giftGuide}. Người nhận phải có mặt trên LIVE.</span>`);}
}
