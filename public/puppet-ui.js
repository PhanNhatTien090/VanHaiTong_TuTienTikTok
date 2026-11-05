// v73: tab "Tu sĩ giả" — người điều hành tạo nhân vật tùy chỉnh và bấm tay mọi hành động (bình luận lệnh, tim, quà, đánh, đột phá…).
// Mọi nút gọi /api/puppet → engine.action() y như bình luận/quà thật, nên hiệu ứng, giọng đọc, vinh danh, sự kiện đều chạy.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const COMMANDS=[['tuluyen','Tu luyện'],['hai','Hái thảo'],['diemdanh','Điểm danh'],['dotpha','Đột phá'],['danh','Đánh quái'],['hoc','Học bí pháp'],['ren','Rèn pháp bảo'],['luyendan','Luyện đan'],['dung','Dùng đan'],['trangbi','Trang bị'],['tuvi','Xem tu vi'],['coduyen','Cơ duyên'],['bay','Ghi danh đua'],['tangtoc','Bứt tốc'],['tythi','Tỷ thí'],['skin macdinh','Skin mặc định']];
const GIFTS=[['Rose','Hoa hồng',1],['TikTok','TikTok',1],['Finger Heart','Tim ngón tay',5],['Doughnut','Bánh vòng',30],['Hand Hearts','Tim bàn tay',100],['Chopin in the Rain','Chopin trong mưa',349],['Which Bro','Huynh đệ nào?',799],['LIVE Pro Badge','Huy hiệu LIVE Pro',1000],['Match Maniac','Tín đồ thi đấu',2999],['Phoenix','Phoenix',25999]];
export function initPuppetUI({root,post,toast,getState,openPlayer}){
  if(!root)return {refresh(){}};
  let list=[],busy=false;const lastResult=new Map();
  const realms=()=>getState()?.realms||[];
  async function load(){const r=await post('/api/puppet',{op:'list'});if(r.ok){list=r.puppets||[];draw();}}
  const giftText=g=>[g.name+' · '+fmt(g.coins)+' coin','+'+fmt(g.qi)+' tu vi','+'+fmt(g.stones)+' linh thạch',g.herbs?'+'+fmt(g.herbs)+' linh thảo':'',...g.items.map(n=>'🎁 '+n),g.alreadyOwned?'('+g.tierItem+' đã có sẵn)':'',g.buff?'phúc duyên ×'+String(g.buff).replace('.',','):'',g.raceBoost?'bứt tốc +'+g.raceBoost+' trượng':''].filter(Boolean).join(' · ');
  async function act(id,body,label){if(busy)return;busy=true;try{const r=await post('/api/puppet',{op:'act',id,...body});
    if(r.ok&&!r.duplicate){if(r.gift&&body.displayName)r.gift.name=body.displayName;const msg=r.gift?'Đã tặng '+giftText(r.gift):label+' ✓';toast(msg);lastResult.set(id,msg);}await load();}finally{busy=false;}}
  function card(p){return `<article class="puppet-card" data-id="${esc(p.id)}">
    <header><div><b>${esc(p.name)}</b> <small>${p.gender==='nu'?'Nữ':p.gender==='nam'?'Nam':'—'} · ${esc(p.realmName||'')} · ${fmt(p.qi)} tu vi · ${fmt(p.giftCoins)} coin quà</small></div>
    <label class="puppet-keep"><input type="checkbox" data-keep ${p.keep?'checked':''}> Ở lại trên LIVE</label>
    <label class="puppet-keep"><input type="checkbox" data-auto-rose ${p.autoRose?'checked':''}> Tự tặng hoa mô phỏng · 3–5 phút</label>
    <span class="puppet-state ${p.active?'on':''}">${p.active?'Đang có mặt':'Vắng mặt'}</span>
    <button class="ghost-button small" data-edit>Sửa skin / pháp bảo / chỉ số</button></header>
    ${lastResult.get(p.id)?`<p class="puppet-last">↳ ${esc(lastResult.get(p.id))}</p>`:''}
    <div class="puppet-row"><span>Lệnh</span>${COMMANDS.map(([c,l])=>`<button class="small" data-cmd="${esc(c)}" title="Gõ: ${esc(c)}">${esc(l)}</button>`).join('')}</div>
    <div class="puppet-row"><span>Bình luận</span><input data-text placeholder="Gõ bình luận hoặc lệnh bất kỳ…" maxlength="200"><button class="small gold-button" data-say>Gửi</button></div>
    <div class="puppet-row"><span>Thả tim</span>${[10,50,200,1000].map(n=>`<button class="small" data-like="${n}">${n} tim</button>`).join('')}</div>
    <div class="puppet-row"><span>Tặng quà</span>${GIFTS.map(([g,l,c])=>`<button class="small" data-gift="${esc(g)}" data-coins="${c}">${esc(l)} · ${fmt(c)}</button>`).join('')}</div>
    <div class="puppet-row"><span>Quà tùy chỉnh</span><input data-gname placeholder="Tên quà" value="Rose" maxlength="40"><input data-gcoins type="number" min="1" max="100000" value="99" title="coin mỗi món"><small>coin ×</small><input data-gcount type="number" min="1" max="1000" value="1" title="số lượng"><button class="small gold-button" data-giftc>Tặng</button></div>
  </article>`;}
  function draw(){
    if(getState()?.mode==='live'){
      root.innerHTML='<div class="settings-card"><h3>Mô phỏng chỉ dùng ở DEMO</h3><p>Chuyển thế giới sang Thử nghiệm để tạo nhân vật, thử tim và quà. NPC đang lưu trong LIVE có nhãn riêng, không được tính vào bảng người chơi hoặc quà thật.</p></div>';
      return;
    }
    const rs=realms();
    root.innerHTML=`<div class="puppet-create settings-card"><div><h3>Tạo tu sĩ giả</h3><p>Nhân vật do bạn điều khiển. Mọi nút bên dưới chạy y như người xem thật bình luận hoặc tặng quà: có hiệu ứng, giọng đọc, vinh danh, tính vào sự kiện và đua phi kiếm. Quà ở đây là quà giả, không có coin thật.</p></div>
      <div class="puppet-form"><input id="pzName" placeholder="Tên tu sĩ" maxlength="40"><select id="pzGender"><option value="nam">Nam</option><option value="nu">Nữ</option><option value="">Chưa khai</option></select>
      <select id="pzRealm">${rs.map((r,i)=>`<option value="${i}">${esc(r)}</option>`).join('')}</select><button class="gold-button" id="pzCreate">Tạo</button></div></div>
      ${list.length?list.map(card).join(''):'<p class="muted">Chưa có tu sĩ giả nào.</p>'}`;
    root.querySelector('#pzCreate').onclick=async()=>{const name=root.querySelector('#pzName').value.trim();if(!name){toast('Nhập tên tu sĩ.');return;}
      const r=await post('/api/puppet',{op:'create',name,gender:root.querySelector('#pzGender').value,realm:Number(root.querySelector('#pzRealm').value)});if(r.ok){toast('Đã tạo '+r.name);await load();}};
    for(const el of root.querySelectorAll('.puppet-card')){const id=el.dataset.id,q=s=>el.querySelector(s);
      q('[data-keep]').onchange=async e=>{await post('/api/puppet',{op:'keep',id,keep:e.target.checked});load();};
      q('[data-auto-rose]').onchange=async e=>{await post('/api/puppet',{op:'auto-rose',id,enabled:e.target.checked});load();};
      q('[data-edit]').onclick=()=>openPlayer(id);
      el.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>act(id,{type:'chat',text:b.dataset.cmd},b.textContent));
      const say=()=>{const t=q('[data-text]').value.trim();if(t)act(id,{type:'chat',text:t},'Bình luận');q('[data-text]').value='';};
      q('[data-say]').onclick=say;q('[data-text]').onkeydown=e=>{if(e.key==='Enter')say();};
      el.querySelectorAll('[data-like]').forEach(b=>b.onclick=()=>act(id,{type:'like',count:Number(b.dataset.like)},b.textContent));
      el.querySelectorAll('[data-gift]').forEach(b=>b.onclick=()=>act(id,{type:'gift',giftName:b.dataset.gift,displayName:b.textContent.split(' · ')[0],coins:Number(b.dataset.coins),count:1},'Tặng '+b.textContent));
      q('[data-giftc]').onclick=()=>act(id,{type:'gift',giftName:q('[data-gname]').value||'Rose',coins:Number(q('[data-gcoins]').value)||1,count:Number(q('[data-gcount]').value)||1},'Tặng quà');}
  }
  return {refresh:load};
}
