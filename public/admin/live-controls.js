// 21/11/2026: tách từ app.js — khung điều hành LIVE ở tab #scene: map nền + ghế Tông chủ + nhạc, Ban thưởng nhanh, Bật/tắt sự kiện + ban thưởng tùy chỉnh, Thiên Đạo giáng lôi.
// Biến của app.js (state, post, toast…) đọc qua app.X (appCtx trong app.js, getter sống).
import {SCENES as MAP_SCENES} from '../world-rotation.js';
import {BGM_LIST,musicIndex,musicForState,musicChangesAt} from '../music-rotation.js?v=event-music-20261115';
let app;export function bindLiveControls(ctx){app=ctx;}
// v78: chọn map nền ngay đầu tab "Người trên LIVE" — ảnh xem trước, bấm là đổi trên LIVE.
let scenePickerSig='';
export function renderScenePicker(){const el=document.getElementById('scenePicker');if(!el||!app.state)return;const mode=app.state.settings?.sceneMode||'auto',cur=app.state.environment?.id;
  const sig=mode+'|'+cur+'|'+(app.state.environment?.changesAt||'')+'|'+(app.state.sectMaster?.username||'')+'|'+JSON.stringify(app.state.settings?.music||null)+'|'+musicForState(app.state).index;if(sig===scenePickerSig)return;scenePickerSig=sig;
  const left=app.state.environment?.changesAt?Math.max(0,Math.round((app.state.environment.changesAt-app.state.serverNow)/60000)):null;
  el.innerHTML='<div class="sp-head"><b>🗺 Map nền LIVE</b><span>Đang hiện: <strong>'+app.esc(app.state.environment?.name||'—')+'</strong>'+(mode==='auto'||mode==='thuy-mac'?' · tự đổi'+(left!==null?' sau ~'+left+' phút':''):' · giữ cố định')+'</span><button class="'+(mode==='auto'?'gold-button':'soft-button')+' small" data-map="auto">🔄 Tự đổi mỗi 5 phút</button><button class="'+(mode==='thuy-mac'?'gold-button':'soft-button')+' small" data-map="thuy-mac">⛰ Thủy Mặc ngoài trời (3 map xoay)</button></div>'+
   '<div class="sp-grid">'+MAP_SCENES.map(m=>'<button class="sp-card'+(mode===m.id?' chosen':'')+(cur===m.id?' showing':'')+'" data-map="'+m.id+'" title="Chọn '+app.esc(m.name)+'"><img src="'+m.image+'" alt="" loading="lazy"><span>'+app.esc(m.name)+'</span>'+(mode===m.id?'<i>✓ Đang chọn</i>':cur===m.id?'<i>Đang hiện</i>':'')+'</button>').join('')+'</div><p class="muted sp-note">Sự kiện có sân riêng (đua phi kiếm, luận kiếm, kết duyên) vẫn tạm dùng sân của sự kiện, xong sẽ quay về map đã chọn.</p>';
  el.insertAdjacentHTML('beforeend','<form id="sectMasterForm" class="sect-master-settings"><b>Ghế Tông chủ</b><label>TikTok của bạn <input name="username" maxlength="60" placeholder="@username" value="'+app.esc(app.state.sectMaster?.username||'')+'"></label><button class="soft-button small" type="submit">Lưu tài khoản</button><small>Đúng tài khoản này bình luận → Tông chủ hiện trên ghế. Không nhận diện bằng tên hiển thị.</small></form>');
  el.querySelector('#sectMasterForm').onsubmit=async e=>{e.preventDefault();const username=new FormData(e.target).get('username'),r=await app.post('/api/sect-master',{username,enabled:true});if(r.ok){scenePickerSig='';app.toast('Đã lưu tài khoản Tông chủ');}else app.toast(r.message||'Chưa lưu được Tông chủ');};
  {const mu=app.state.settings?.music,now=app.state.serverNow||Date.now(),playing=musicForState(app.state,now).index,fixed=mu?.followContext===false,ch=musicChangesAt(mu,now),mins=ch?Math.max(1,Math.round((ch-now)/60000)):null;
   el.insertAdjacentHTML('beforeend','<div class="music-picker sect-master-settings"><b>🎵 Nhạc nền LIVE</b><span>Đang phát: <strong>'+app.esc(BGM_LIST[playing].name)+'</strong>'+(fixed?' · giữ cố định':' · theo map / sự kiện')+'</span><label>Chọn bài <select id="musicPick"><option value="auto"'+(fixed?'':' selected')+'>🔄 Tự đổi theo map / sự kiện</option>'+BGM_LIST.map((t,i)=>'<option value="'+i+'"'+(fixed&&i===playing?' selected':'')+'>'+(i+1)+'. '+app.esc(t.name)+'</option>').join('')+'</select></label><button type="button" class="soft-button small" id="musicNext">⏭ Bài kế</button><small>Đổi nhạc có chuyển âm nhẹ. Music: Kevin MacLeod (incompetech.com), Shane Ivers (silvermansound.com) · CC BY 4.0. <a href="/assets/AUDIO.md" target="_blank" rel="noopener">Nguồn &amp; ghi công LIVE</a>.</small></div>');
   const send=async cmd=>{const r=await app.post('/api/music',{cmd});if(r.ok){app.state.settings=Object.assign(app.state.settings||{},{music:r.music});scenePickerSig='';renderScenePicker();app.toast('Nhạc nền: '+BGM_LIST[musicIndex(r.music,Date.now())].name+(r.music.mode==='fixed'?' (giữ cố định)':' (theo map / sự kiện)'));}else app.toast(r.message||'Chưa đổi được nhạc');};
   el.querySelector('#musicPick').onchange=e=>send(e.target.value);el.querySelector('#musicNext').onclick=()=>send('next');}
  el.querySelectorAll('[data-map]').forEach(b=>b.onclick=async()=>{const r=await app.post('/api/world-scene',{scene:b.dataset.map});if(r.ok){app.toast(b.dataset.map==='auto'?'Map tự đổi mỗi 5 phút.':'Đã đổi map: '+(MAP_SCENES.find(m=>m.id===b.dataset.map)?.name||''));scenePickerSig='';}});}

// v80: BAN THƯỞNG NHANH — chọn người trong bảng (hoặc ngẫu nhiên 1 người đang chơi) rồi bấm gói quà.
const QUICK_COMBOS=[['small','💊 Tụ Khí Đan','+10% tu vi cảnh giới · 30 linh thạch · 5 linh thảo'],['medium','💊 Ngưng Nguyên Đan','+30% tu vi · 100 linh thạch · 15 linh thảo · phúc duyên ×3'],['large','🔱 Cửu Chuyển Kim Đan','+50% tu vi · 250 linh thạch · 40 linh thảo · phúc duyên ×5'],['buff','🔥 Phúc Duyên ×8','10 phút tu luyện ×8'],['breakthrough','⚡ Đột Phá Đan','đủ tu vi + linh thạch để đột phá ngay']];
let quickSig='';
export function renderQuickGift(){const el=document.getElementById('quickGift');if(!el||!app.state)return;const p=app.player(),sig=(p?.id||'')+'|'+(p?.name||'')+'|'+(p?.realm??'');if(sig===quickSig)return;quickSig=sig;
  const btns=target=>QUICK_COMBOS.map(([id,label,tip])=>'<button class="small '+(id==='large'||id==='breakthrough'?'gold-button':'soft-button')+'" data-qg="'+id+'" data-target="'+target+'" title="'+tip+'">'+label+'</button>').join('');
  el.innerHTML='<div class="qg-head"><b>🎁 Ban thưởng nhanh</b><span class="muted">Có hiệu ứng + giọng đọc như quà thật. Tu vi tính theo cảnh giới người nhận.</span></div>'+
   '<div class="qg-row"><span>'+(p?'Cho <strong>'+app.esc(p.name)+'</strong> <small>('+app.esc(app.state.realms?.[p.realm]||'')+')</small>':'<i class="muted">Bấm một người trong bảng bên dưới để chọn</i>')+'</span>'+(p?btns(p.id):'')+'</div>'+
   '<div class="qg-row"><span>🎲 Ngẫu nhiên 1 người đang chơi</span>'+btns('*')+'</div>'+'<div class="qg-row"><span>👑 Đại điển vinh danh top 3 quà <small class="muted">(tự diễn mỗi 20 phút)</small></span><button class="small gold-button" id="ceremonyNow">👑 Vinh danh ngay</button></div>'+'<div class="qg-row"><span>🎉 Hoạt động <small class="muted">(trò nhỏ miễn phí, luân phiên 1–2 phút)</small></span><button class="small gold-button" data-engage="envelope">🧧 Thả hồng bao</button><button class="small soft-button" data-engage="quiz">❓ Ra câu đố</button><button class="small soft-button" data-engage="rps">✊ Oẳn tù tì</button><button class="small soft-button" data-engage="lucky">🎒 Túi linh lộc</button><button class="small soft-button" data-engage="star">🌟 Bắt sao</button></div>';
  const cb=el.querySelector('#ceremonyNow');if(cb)cb.onclick=async()=>{const r=await app.post('/api/ceremony',{});if(r.ok)app.toast('Đại điển vinh danh: '+r.top.map(x=>x.name).join(', '));};
  el.querySelectorAll('[data-engage]').forEach(b=>b.onclick=async()=>{const r=await app.post('/api/engage',{kind:b.dataset.engage});if(r.ok)app.toast('Đã mở trò nhỏ.');});
  el.querySelectorAll('[data-qg]').forEach(b=>b.onclick=async()=>{b.disabled=true;try{const r=await app.post('/api/admin-gift',{id:b.dataset.target,combo:b.dataset.qg});if(r.ok)app.toast('Đã ban '+r.combo+' cho '+r.name+(r.qi?' (+'+app.fmt(r.qi)+' tu vi)':''));}finally{b.disabled=false;}});}

// 4/11/2026: ĐIỀU KHIỂN LIVE — bật/tắt từng sự kiện + ban thưởng tùy chỉnh cho người đang chọn. Có hiệu lực ngay, không cần khởi động lại.
const LIVE_EVENT_TOGGLES=[['flower','🌸 Thiên Hoa Vũ'],['meteor','🌠 Tinh Hà Lưu Tinh'],['visitor-hanlap','🧙 Hàn Lập'],['visitor-vuonglam','🧙 Vương Lâm'],['visitor-shende','👑 Thần Đế'],['opportunity','🍀 Cơ duyên'],['tournament','⚔ Luận Kiếm'],['race','🗡 Đua phi kiếm'],['bond','💞 Kết duyên'],['boss','🐉 Yêu thú']];
let liveCtlSig='',liveCtlTarget='';
export function renderLiveControls(){
  const host=document.getElementById('quickGift');if(!host||!app.state)return;
  let el=document.getElementById('liveControls');if(!el){el=document.createElement('section');el.id='liveControls';el.className='quick-gift live-controls';host.insertAdjacentElement('afterend',el);}
  if(el.contains(document.activeElement)&&document.activeElement.tagName==='INPUT'&&document.activeElement.type!=='checkbox')return; // đang gõ số thì không vẽ lại
  const st=app.state.settings||{},off=new Set(st.randomExclude||[]),p=app.player(),sig=JSON.stringify([st.randomExclude,st.quiz,st.envelope,st.heartPlay,st.scheduledCompetitions,st.huntBeforeCompetition,st.autoEvents,p?.id,p?.name]);
  if(sig===liveCtlSig)return;liveCtlSig=sig;
  const box=(key,label,on,extra='')=>'<label class="lc-toggle"><input type="checkbox" data-lc="'+key+'"'+(on?' checked':'')+extra+'> '+label+'</label>';
  el.innerHTML='<div class="qg-head"><b>🎛 Bật/tắt sự kiện</b><span class="muted">Có hiệu lực ngay trên LIVE · bỏ chọn = không tự bật sự kiện đó</span></div>'+
   '<div class="lc-grid">'+box('autoEvents','⏱ Sự kiện tự động',st.autoEvents!==false)+LIVE_EVENT_TOGGLES.map(([id,label])=>box('ev:'+id,label,!off.has(id))).join('')+'</div>'+
   '<div class="lc-grid">'+box('quiz','🤔 Câu đố',st.quiz!==false)+box('envelope','🧧 Hồng bao',st.envelope!==false)+box('scheduledCompetitions','📅 Tỷ thí/đua theo lịch',!!st.scheduledCompetitions)+box('huntBeforeCompetition','🐉 Săn yêu thú trước tỷ thí',!!st.huntBeforeCompetition)+box('heartPlay','❤ Chơi bằng tim',st.heartPlay!==false)+'</div>'+
   '<div class="qg-head"><b>✏️ Ban thưởng tùy chỉnh</b><span class="muted">'+(p?'Cho <strong>'+app.esc(p.name)+'</strong> ('+app.esc(app.state.realms?.[p.realm]||'')+')':'Bấm một người trong bảng để chọn, hoặc dùng 🎲 ngẫu nhiên')+'</span></div>'+
   '<div class="lc-gift"><label>Tu vi <input type="number" min="0" step="1" data-cg="qi" value="0"></label><label>Linh thạch <input type="number" min="0" step="1" data-cg="stones" value="0"></label><label>Linh thảo <input type="number" min="0" step="1" data-cg="herbs" value="0"></label>'+
   '<label>Phúc duyên <select data-cg="buff"><option value="0">không</option>'+[2,3,5,8,10].map(n=>'<option value="'+n+'">×'+n+'</option>').join('')+'</select></label><label>trong <input type="number" min="1" max="120" step="1" data-cg="minutes" value="10"> phút</label>'+
   (p?'<button class="small gold-button" data-cgo="'+app.esc(p.id)+'">🎁 Ban cho '+app.esc(p.name)+'</button>':'')+'<button class="small soft-button" data-cgo="*">🎲 Ngẫu nhiên 1 người</button></div>';
  el.querySelectorAll('[data-lc]').forEach(cb=>cb.onchange=async()=>{const k=cb.dataset.lc;let body;
    if(k.startsWith('ev:')){const id=k.slice(3),set=new Set(app.state.settings?.randomExclude||[]);cb.checked?set.delete(id):set.add(id);body={randomExclude:[...set]};}else body={[k]:cb.checked};
    cb.disabled=true;try{const r=await app.post('/api/event-settings',body);if(r.ok){Object.assign(app.state.settings??={},body,r.settings||{});app.toast((cb.checked?'Đã bật: ':'Đã tắt: ')+cb.parentElement.textContent.trim());}else cb.checked=!cb.checked;}finally{cb.disabled=false;liveCtlSig='';}});
  el.querySelectorAll('[data-cgo]').forEach(b=>b.onclick=async()=>{const custom={};el.querySelectorAll('[data-cg]').forEach(i=>custom[i.dataset.cg]=Number(i.value)||0);
    b.disabled=true;try{const r=await app.post('/api/admin-gift',{id:b.dataset.cgo,combo:'custom',custom});if(r.ok)app.toast('Đã ban thưởng riêng cho '+r.name+(r.qi?' (+'+app.fmt(r.qi)+' tu vi)':''));else app.toast(r.message||'Không ban được.');}finally{b.disabled=false;}});
}

// 07/11/2026: THIÊN ĐẠO — giáng thiên lôi xuống 1 người (chọn hoặc ngẫu nhiên). Trừ 20% tu vi, choáng 5 phút. Bấm 2 lần để xác nhận.
let heavenTarget='',heavenArm='',heavenArmTimer=null;
export function renderHeavenPanel(){const el=document.getElementById('heavenPanel');if(!el||!app.state)return;
  if(!el.dataset.ready){el.dataset.ready='1';
    el.innerHTML='<div class="qg-head"><b>⚡ Thiên Đạo · Giáng thiên lôi</b><span class="muted">Trừ 20% tu vi hiện có · choáng 5 phút không tu luyện được (quà vẫn nhận đủ) · giọng đọc báo thiên kiếp ngẫu nhiên giáng xuống · mỗi lần cách nhau 60 giây</span></div>'+
     '<div class="qg-row hv-search"><input id="hvSearch" type="search" placeholder="Gõ tên người chơi…" autocomplete="off"><span id="hvPicked" class="hv-picked"></span></div>'+
     '<div id="hvList" class="hv-list"></div>'+
     '<div class="qg-row"><button id="hvStrike" class="small gold-button hv-strike" disabled>⚡ Giáng lôi</button><button id="hvRandom" class="small soft-button">🎲 Ngẫu nhiên 1 người đang chơi</button><span id="hvCooldown" class="muted"></span></div>'+
     '<div id="hvStunned" class="hv-stunned"></div>';
    el.querySelector('#hvSearch').oninput=()=>renderHeavenPanel();
    el.querySelector('#hvList').onclick=e=>{const b=e.target.closest('[data-hv]');if(!b)return;heavenTarget=b.dataset.hv;heavenArm='';renderHeavenPanel();};
    const fire=async(id,btn)=>{if(heavenArm!==id){heavenArm=id;clearTimeout(heavenArmTimer);heavenArmTimer=setTimeout(()=>{heavenArm='';renderHeavenPanel();},3500);renderHeavenPanel();return;}
      heavenArm='';clearTimeout(heavenArmTimer);btn.disabled=true;try{const r=await app.post('/api/heaven-strike',{id});if(r.ok)app.toast('⚡ Thiên lôi đánh trúng '+r.name+' · -'+app.fmt(r.loss)+' tu vi · choáng 5 phút');else app.toast(r.message||'Chưa giáng lôi được.');}finally{btn.disabled=false;renderHeavenPanel();}};
    el.querySelector('#hvStrike').onclick=e=>{if(heavenTarget)fire(heavenTarget,e.currentTarget);};
    el.querySelector('#hvRandom').onclick=e=>fire('*',e.currentTarget);}
  const now=app.state.serverNow||Date.now(),q=fold(el.querySelector('#hvSearch').value.trim()),sel=app.player();
  if(!heavenTarget&&sel)heavenTarget=sel.id;
  const pool=app.state.players.filter(p=>!p.resident&&!p.puppet&&(q?fold(p.name).includes(q):p.active)).sort((a,b)=>(b.active-a.active)||(b.realm-a.realm)).slice(0,14);
  el.querySelector('#hvList').innerHTML=pool.map(p=>'<button class="hv-chip'+(p.id===heavenTarget?' on':'')+(p.stunUntil>now?' stunned':'')+'" data-hv="'+app.esc(p.id)+'">'+app.esc(p.name)+' <small>'+app.esc(app.state.realms?.[p.realm]||'')+(p.stunUntil>now?' · ⚡':'')+'</small></button>').join('')||'<span class="muted">Không thấy ai'+(q?' tên này':' đang chơi')+'.</span>';
  const t=app.state.players.find(p=>p.id===heavenTarget);el.querySelector('#hvPicked').innerHTML=t?'Mục tiêu: <strong>'+app.esc(t.name)+'</strong> <small>('+app.esc(app.state.realms?.[t.realm]||'')+' · tu vi '+app.fmt(t.qi)+' → mất '+app.fmt(Math.floor(t.qi*.2))+')</small>':'<i class="muted">Chọn một người bên dưới</i>';
  const sb=el.querySelector('#hvStrike'),rb=el.querySelector('#hvRandom'),wait=Math.max(0,Math.ceil(((app.state.lastHeavenStrikeAt||0)+60000-now)/1000));
  sb.disabled=!t||wait>0;sb.textContent=heavenArm&&heavenArm===heavenTarget?'⚠ Bấm lần nữa để giáng lôi':'⚡ Giáng lôi'+(t?' xuống '+t.name:'');sb.classList.toggle('armed',!!heavenArm&&heavenArm===heavenTarget);
  rb.disabled=wait>0;rb.textContent=heavenArm==='*'?'⚠ Bấm lần nữa · ngẫu nhiên':'🎲 Ngẫu nhiên 1 người đang chơi';rb.classList.toggle('armed',heavenArm==='*');
  el.querySelector('#hvCooldown').textContent=wait>0?'Thiên lôi đang tụ lại · '+wait+' giây':'';
  const stunned=app.state.players.filter(p=>p.stunUntil>now).sort((a,b)=>b.stunUntil-a.stunUntil);
  el.querySelector('#hvStunned').innerHTML=stunned.length?'<b>Đang bị trấn áp:</b> '+stunned.map(p=>{const s=Math.ceil((p.stunUntil-now)/1000);return '<span class="hv-stun">'+app.esc(p.name)+' · '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'</span>';}).join(' '):'';}
const fold=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase();
