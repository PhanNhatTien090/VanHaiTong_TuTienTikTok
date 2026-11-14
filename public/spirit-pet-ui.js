import {ALL_PETS,petById,petRequirement} from './spirit-pets.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountPetUI(post){
 const parent=document.querySelector('#eventsView');if(!parent)return;
 const root=document.createElement('div');root.id='spiritPetControl';parent.insertBefore(root,document.querySelector('#socialControl'));
 root.addEventListener('click',async e=>{const b=e.target.closest('[data-pet-event]');if(!b)return;b.disabled=true;try{const r=await post('/api/pet-event',{action:b.dataset.petEvent,minutes:5});if(!r.ok)alert(r.message||'Chưa mở được sự kiện.');}finally{b.disabled=false;}});
 const shell=document.querySelector('.scene-shell'),hud=document.createElement('div');hud.id='spiritPetHud';hud.className='spirit-pet-hud';hud.hidden=true;shell?.appendChild(hud);
}
export function renderPetUI(state,admin=true){
 const e=state.petEvent,active=e?.active&&state.serverNow<e.endsAt,root=document.querySelector('#spiritPetControl');
 if(admin&&root){const html=`<div class="settings-card"><div><h3>Linh Thú Cốc · 5 phút</h3><p>${active?'Đang mở · còn '+Math.ceil((e.endsAt-state.serverNow)/60000)+' phút':'Đã khép / chưa mở'} · Tim và quà thật cộng dồn riêng trong lượt. Ba con đầu chỉ nhận bằng tim. Kim Vũ Phượng: 3.000 tim hoặc 100 coin. Mỗi lượt xuất hiện ngẫu nhiên một linh thú 200 coin và một thiên linh thú 300 coin.${active&&e.featured?' <b>Lượt này: '+esc(petById(e.featured)?.name||'')+'</b>.':''} Chỉ tính tương tác mới, không tính quà mô phỏng.</p><div class="pet-catalog">${ALL_PETS.map((p,i)=>`<article${p.rare?' class="pet-rare"':''}><div class="pet-thumb"><img src="/assets/spirit-pets-v1/${p.id}.png" alt="${esc(p.name)}"></div><b>${i+1}. ${p.name}</b><small>${p.rank} · ${petRequirement(p)}</small></article>`).join('')}</div><p>Tự nhận và gọi con cao nhất mới mở khóa. Gõ <code>thú</code> xem tiến độ · <code>thú 1</code> đến <code>thú ${ALL_PETS.length}</code> đổi con đã có · <code>thú ẩn</code> cho nghỉ. Linh thú giữ vĩnh viễn, mỗi người chỉ hiện 1 con. Chỉ mang tính trang trí.</p></div><div class="editor-actions"><button class="gold-button" data-pet-event="start" ${active?'disabled':''}>Mở 5 phút</button><button class="soft-button" data-pet-event="stop" ${active?'':'disabled'}>Khép sự kiện</button><a href="/pet-cove-preview.html" target="_blank" rel="noopener">Xem sân Linh Thú Cốc ↗</a></div></div>`;if(root._petHTML!==html){root.innerHTML=html;root._petHTML=html;}}
 const hud=document.querySelector('#spiritPetHud');if(!hud)return;
 hud.hidden=admin||!active||state.environment?.id!=='pet-cove';
 if(hud.hidden||hud.childElementCount)return;
 hud.innerHTML=`<div><b>BẮT LINH THÚ</b><span>Thả tim hoặc tặng quà theo mốc từng con. Đủ mốc tự nhận.</span></div>
 <div><b>LỆNH LINH THÚ</b><span><code>thú</code> xem tiến độ · <code>thú + số</code> đổi con · <code>thú ẩn</code> cho nghỉ</span></div>`;
}
