// 21/11/2026 tối (chủ game): tab DANH HIỆU trên trang quản lý — điều kiện từng danh hiệu, ai đang giữ (tự đạt / gán tay + còn bao lâu),
// GÁN cho người bất kỳ có thời hạn, GỠ danh hiệu gán tay. Server: /api/title-admin (title-admin.mjs). Module riêng, không đụng app.js.
const root=document.getElementById('titleAdmin');
if(root&&!new URLSearchParams(location.search).has('overlay')){
const world=new URLSearchParams(location.search).get('world')==='live'?'live':'demo';
const api='/api/title-admin?world='+world;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GROUP={paid:['Nạp','#ffd36b'],luanhoi:['Luân Hồi','#c9a6ff'],evil:['Tà đạo','#ff6b6b'],love:['Tình cảm','#ff9ad8'],event:['Sự kiện','#7fe3c4'],sect:['Tông môn','#9cc8ff']};
const DUR=[['30','30 phút'],['60','1 giờ'],['180','3 giờ'],['360','6 giờ'],['720','12 giờ'],['1440','1 ngày'],['4320','3 ngày'],['10080','7 ngày'],['43200','30 ngày'],['0','Vĩnh viễn'],['custom','Tùy chọn (giờ)…']];
const left=(until,now)=>{if(!until)return 'vĩnh viễn';const m=Math.max(0,Math.round((until-now)/60000));if(m<60)return 'còn '+m+' phút';const h=Math.floor(m/60);if(h<48)return 'còn '+h+' giờ '+(m%60?m%60+' phút':'');return 'còn '+Math.floor(h/24)+' ngày '+(h%24?h%24+' giờ':'');};
const style=document.createElement('style');style.textContent=`
#titleAdmin{display:grid;gap:16px}
#titleAdmin .ta-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;align-items:end;padding:16px;border:1px solid #ffd98a44;border-radius:12px;background:#0b1424cc}
#titleAdmin label{display:grid;gap:4px;font-size:13px;color:#cfd8e6}
#titleAdmin label[hidden]{display:none}
#titleAdmin input,#titleAdmin select{padding:8px 10px;border-radius:8px;border:1px solid #ffffff2e;background:#09101c;color:#fff;font:inherit}
#titleAdmin .ta-check{display:flex;align-items:center;gap:6px;flex-direction:row}
#titleAdmin .ta-msg{grid-column:1/-1;min-height:20px;font-size:14px}
#titleAdmin .ta-msg.err{color:#ff8a8a}#titleAdmin .ta-msg.ok{color:#8fffbf}
#titleAdmin .ta-cands{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px}
#titleAdmin .ta-cands button{padding:4px 10px;border-radius:999px;border:1px solid #ffd98a66;background:#1a2438;color:#ffe9b0;cursor:pointer}
#titleAdmin .ta-tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#titleAdmin .ta-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
#titleAdmin .ta-card{border:1px solid #ffffff1f;border-radius:12px;background:#0b1424e6;padding:12px;display:grid;gap:8px}
#titleAdmin .ta-head{display:flex;align-items:center;gap:10px}
#titleAdmin .ta-img{height:34px;max-width:170px;object-fit:contain;background:#101a2c;border-radius:6px;padding:2px 6px}
#titleAdmin .ta-name{font-weight:800;color:#fff}
#titleAdmin .ta-badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid currentColor;margin-left:auto;white-space:nowrap}
#titleAdmin .ta-rule{font-size:13px;color:#dfe6f2}#titleAdmin .ta-rule b{color:#ffd98a}
#titleAdmin .ta-keep{font-size:12px;color:#9fb0c8}
#titleAdmin .ta-holders{display:flex;flex-wrap:wrap;gap:6px}
#titleAdmin .ta-chip{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;background:#16223a;font-size:12px;color:#e8eef8}
#titleAdmin .ta-chip.grant{background:#2a1f05;border:1px solid #ffd36b88}
#titleAdmin .ta-chip small{color:#9fb0c8}
#titleAdmin .ta-chip button{border:0;background:#5a1414;color:#fff;border-radius:999px;padding:1px 7px;cursor:pointer}
#titleAdmin .ta-empty{font-size:12px;color:#7f8ea6}
#titleAdmin .ta-pick{justify-self:start;padding:4px 12px;border-radius:8px;border:1px solid #ffd98a66;background:#1a2438;color:#ffe9b0;cursor:pointer}`;
document.head.appendChild(style);
root.innerHTML=`<div class="section-intro"><span class="eyebrow">DANH HIỆU</span><h2>Quản lý danh hiệu</h2><p>Điều kiện từng danh hiệu, ai đang giữ, và gán tay cho người bất kỳ có thời hạn. Danh hiệu gán tay cộng thêm, không lấy ghế của người tự đạt; hết hạn tự mất.</p></div>
<form class="ta-form" autocomplete="off" novalidate><label>Danh hiệu<select name="key"></select></label><label>Người chơi (tên / mã / id)<input name="who" placeholder="vd. Đế giang"></label>
<label>Thời hạn<select name="dur">${DUR.map(([v,t])=>`<option value="${v}"${v==='1440'?' selected':''}>${t}</option>`).join('')}</select></label>
<label class="ta-custom" hidden>Số giờ<input name="hours" type="number" min="0.1" step="any" value="2"></label>
<label class="ta-check"><input type="checkbox" name="wear" checked> Đeo ngay trên đầu</label><button class="gold-button" type="submit">Gán danh hiệu</button>
<div class="ta-cands"></div><div class="ta-msg"></div></form>
<div class="ta-tools"><input class="ta-filter" placeholder="Lọc danh hiệu / tên người…"><label class="ta-check"><input type="checkbox" class="ta-onlyheld"> Chỉ danh hiệu đang có người giữ</label><button type="button" class="ta-refresh secondary">Làm mới</button></div>
<div class="ta-grid"></div>`;
const $=s=>root.querySelector(s),form=$('form'),msg=$('.ta-msg'),cands=$('.ta-cands'),grid=$('.ta-grid');
let data=null,timer=null;
const say=(t,ok)=>{msg.textContent=t||'';msg.className='ta-msg '+(ok?'ok':'err');};
async function load(){try{const r=await fetch(api,{cache:'no-store'});data=await r.json();render();}catch(e){say('Không tải được danh hiệu: '+e.message,false);}}
function render(){if(!data)return;const sel=form.key.value;
 form.key.innerHTML=data.titles.map(t=>`<option value="${esc(t.key)}">${esc(t.name)}</option>`).join('');if(sel)form.key.value=sel;
 const f=$('.ta-filter').value.trim().toLowerCase(),only=$('.ta-onlyheld').checked,now=Date.now();
 grid.innerHTML=data.titles.filter(t=>(!only||t.holders.length)&&(!f||(t.name+' '+t.rule+' '+t.holders.map(h=>h.name).join(' ')).toLowerCase().includes(f))).map(t=>{const g=GROUP[t.group]||[t.group,'#ccc'];
  const chips=t.holders.length?t.holders.map(h=>`<span class="ta-chip${h.source==='grant'?' grant':''}">${esc(h.name)}${h.wearing?' ✓':''}<small>${h.source==='grant'?'gán tay · '+esc(left(h.until,now)):'tự đạt'}</small>${h.source==='grant'?`<button type="button" data-revoke="${esc(t.key)}" data-id="${esc(h.id)}" title="Gỡ danh hiệu gán tay">Gỡ</button>`:''}</span>`).join(''):'<span class="ta-empty">Chưa ai giữ</span>';
  return `<article class="ta-card"><div class="ta-head"><img class="ta-img" src="/assets/title-text/${esc(t.key)}.webp" alt="${esc(t.name)}" loading="lazy"><span class="ta-name">${esc(t.name)}</span><span class="ta-badge" style="color:${g[1]}">${esc(g[0])}</span></div>
  <div class="ta-rule"><b>Điều kiện:</b> ${esc(t.rule||t.how)}</div><div class="ta-keep">Giữ tới: ${esc(t.keep||'—')} · người xem thấy: “${esc(t.how)}”</div>
  <div class="ta-holders">${chips}</div><button type="button" class="ta-pick" data-pick="${esc(t.key)}">Gán danh hiệu này…</button></article>`;}).join('');}
async function post(b){const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return r.json();}
function minutes(){const v=form.dur.value;if(v==='custom')return Math.max(0,Number(form.hours.value)||0)*60;return Number(v);}
form.dur.addEventListener('change',()=>{$('.ta-custom').hidden=form.dur.value!=='custom';});
form.addEventListener('submit',async e=>{e.preventDefault();cands.innerHTML='';const who=form.who.value.trim();if(!who)return say('Nhập tên người chơi.',false);
 if(form.dur.value==='custom'&&!(Number(form.hours.value)>0))return say('Nhập số giờ > 0.',false);
 const r=await post({action:'grant',key:form.key.value,who,minutes:minutes(),wear:form.wear.checked});say(r.message,r.ok);
 if(r.candidates?.length)cands.innerHTML=r.candidates.map(c=>`<button type="button" data-cand="${esc(c.id)}">${esc(c.name)} · cảnh giới ${c.realm}${c.gift?' · '+c.gift.toLocaleString('vi-VN')+' coin':''}</button>`).join('');
 if(r.ok){form.who.value='';load();}});
cands.addEventListener('click',e=>{const b=e.target.closest('[data-cand]');if(!b)return;form.who.value=b.dataset.cand;cands.innerHTML='';form.requestSubmit();});
grid.addEventListener('click',async e=>{const pick=e.target.closest('[data-pick]');if(pick){form.key.value=pick.dataset.pick;form.who.focus();form.scrollIntoView({behavior:'smooth',block:'start'});return;}
 const rv=e.target.closest('[data-revoke]');if(rv){rv.disabled=true;const r=await post({action:'revoke',key:rv.dataset.revoke,id:rv.dataset.id});say(r.message,r.ok);load();}});
$('.ta-filter').addEventListener('input',render);$('.ta-onlyheld').addEventListener('change',render);$('.ta-refresh').addEventListener('click',load);
// chỉ tải khi mở tab; tự làm mới 15 s lúc tab đang mở
const view=document.getElementById('titlesView');
const tick=()=>{const on=view?.classList.contains('active');if(on&&!timer){load();timer=setInterval(load,15000);}else if(!on&&timer){clearInterval(timer);timer=null;}};
new MutationObserver(tick).observe(view,{attributes:true,attributeFilter:['class']});tick();
}
