// 07/11: Bảng xếp hạng theo ngày / tuần — chỉ trên trang quản lý (#scene), không hiện trên cảnh LIVE.
const params=new URLSearchParams(location.search);
const box=document.getElementById('periodTops');
if(box&&params.get('overlay')!=='1'){
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n||0).toLocaleString('vi-VN');
  const icons={qi:'✦',coins:'🎁',hearts:'❤',quiz:'❓',duel:'⚔',skins:'👘'};
  const clock=t=>new Date(t).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
  const dayLabel=k=>{const [y,m,d]=k.split('-');return d+'/'+m;};
  const weekRange=k=>{const a=new Date(k+'T00:00:00Z'),b=new Date(a);b.setUTCDate(b.getUTCDate()+6);const f=x=>String(x.getUTCDate()).padStart(2,'0')+'/'+String(x.getUTCMonth()+1).padStart(2,'0');return f(a)+' – '+f(b);};
  let pick='day',data=null,lastHTML='',timer=null,loading=false;
  try{pick=localStorage.getItem('vanhai-period-tab')||'day';}catch{}
  const world=()=>params.get('world')==='live'?'live':'demo';
  const visible=()=>document.getElementById('sceneView')?.classList.contains('active')&&!document.hidden;
  function render(){
    if(!data)return;
    const periods=data.periods,cur=periods.find(p=>p.kind===pick)||periods[0];if(!cur)return;
    const range=cur.kind==='day'||cur.kind==='prevDay'?'Ngày '+dayLabel(cur.key):'Tuần '+weekRange(cur.key);
    const partial=cur.startedAt-Date.parse(cur.key+'T00:00:00+07:00')>5*60000;
    const note=range+(cur.endedAt?' · đã chốt':' · đang tính')+(partial?' · bắt đầu ghi từ '+clock(cur.startedAt):'')+(cur.players!=null?' · '+fmt(cur.players)+' người tham gia':'');
    const cards=data.metrics.map(m=>{const rows=cur.tops?.[m.id]||[];return `<article class="pt-card pt-${m.id}"><h3><span>${icons[m.id]||'✧'}</span>${esc(m.label)}</h3>${rows.length?`<ol>${rows.map((r,i)=>`<li class="${i<3?'pt-podium pt-r'+(i+1):''}"><b>${i+1}</b><span class="pt-name" title="${esc(r.name)}">${esc(r.name)}${r.gender==='nu'?' <small>♀</small>':r.gender==='nam'?' <small>♂</small>':''}</span><strong>${fmt(r.value)}<small> ${esc(m.unit)}</small></strong></li>`).join('')}</ol>`:'<p class="pt-empty">Chưa có ai</p>'}</article>`;}).join('');
    const html=`<div class="pt-head"><h2>Bảng xếp hạng <small>${esc(note)}</small></h2><div class="pt-tabs" role="tablist">${periods.map(p=>`<button type="button" role="tab" data-period="${p.kind}" aria-selected="${p.kind===cur.kind}" class="${p.kind===cur.kind?'on':''}">${esc(p.label)}</button>`).join('')}</div></div><div class="pt-grid">${cards}</div>`;
    if(html===lastHTML)return;lastHTML=html;box.innerHTML=html;
    box.querySelectorAll('[data-period]').forEach(b=>b.onclick=()=>{pick=b.dataset.period;try{localStorage.setItem('vanhai-period-tab',pick);}catch{}render();});
  }
  async function load(){
    if(loading||!visible())return;loading=true;
    try{const r=await fetch('/api/period-tops?world='+encodeURIComponent(world())+'&limit=10',{cache:'no-store'});if(r.ok){data=await r.json();render();}else if(!data)box.innerHTML='<p class="pt-empty">Máy chủ chưa có bảng xếp hạng ngày / tuần (cần khởi động lại backend).</p>';}
    catch{}finally{loading=false;}
  }
  const start=()=>{clearInterval(timer);timer=setInterval(load,10000);load();};
  document.addEventListener('visibilitychange',load);
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTimeout(load,100)));
  start();
}
