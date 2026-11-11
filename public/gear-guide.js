// 08/11/2026: bảng hướng dẫn PHÁP BẢO & TRANG BỊ ở cột trái (dưới TOP TU VI) để góc này không trống.
// Chỉ hiện khi cột trái KHÔNG có bảng sự kiện (yêu thú, cơ duyên, khách quý, sự kiện xã hội); có sự kiện thì nhường chỗ.
// Xoay 3 trang, mỗi trang 10 giây: lệnh pháp bảo → món rèn được (lấy từ danh mục thật) → bí pháp & đan dược.
const EVENT_PANELS=['#bossHud','#opportunityHud','#visitorHud','#socialHud'];
const PAGE_MS=10000;
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
function shown(el){if(!el||el.hidden)return false;const st=getComputedStyle(el);return st.display!=='none'&&st.visibility!=='hidden'&&el.offsetHeight>0;}
function rows(list,esc){return list.map(([cmd,txt])=>`<li><code>${esc(cmd)}</code><span>${esc(txt)}</span></li>`).join('');}
// 11/11/2026: trang CHƠI NHANH · GÕ SỐ xen giữa mọi trang khác — người xem mới chỉ cần gõ 1 chữ số.
function quickPage(state,esc){const q=state.quick;if(!q?.rows)return null;
  return '<b>⚡ CHƠI NHANH · GÕ SỐ</b><ol class="quick-digits">'+q.rows.map(r=>'<li'+(r.event?' class="quick-event"':'')+'><code>'+esc(r.n)+'</code><span><em>'+esc(r.say)+'</em> · '+esc(r.text)+'</span></li>').join('')+'</ol>'+(q.paused?'<small>đang có câu đố · số là đáp án</small>':'');}
function pages(state,esc){
  const arts=(state.catalog||[]).filter(i=>i.type==='artifact'&&!i.exclusive).sort((a,b)=>(a.price||0)-(b.price||0));
  const realm=t=>state.realms?.[t]||'';
  const forge=[];for(let i=0;i<arts.length;i+=3)forge.push(arts.slice(i,i+3));
  return [
    `<b>⚔ PHÁP BẢO &amp; TRANG BỊ</b><ol>${rows([['rèn','rèn pháp bảo tốt nhất đủ linh thạch'],['trang bị','đeo món mạnh nhất đang có'],['trang bị + tên','đeo đúng món mình chọn'],['đánh','pháp bảo tung chiêu, tăng tu vi']],esc)}</ol>`,
    ...forge.map((group,i)=>`<b>🔨 RÈN PHÁP BẢO${forge.length>1?' · '+(i+1)+'/'+forge.length:''}</b><ol>${group.map(a=>`<li><code>${esc(a.name)}</code><span>${fmt(a.price)} linh thạch${a.herbs?' · '+fmt(a.herbs)+' thảo':''}${realm(a.tier)?' · '+esc(realm(a.tier)):''}</span></li>`).join('')}</ol><small>gõ <i>rèn ${esc(group[0].name)}</i> để rèn đúng món</small>`),
    `<b>📜 BÍ PHÁP · ĐAN DƯỢC</b><ol>${rows([['học','học bí pháp mới, tu luyện nhanh hơn'],['luyện đan','luyện viên đan tốt nhất đủ nguyên liệu'],['dùng','uống đan dược, cộng tu vi'],['hái','hái linh thảo làm nguyên liệu']],esc)}</ol>`
  ];
}
export function renderGearGuide(state,esc,now=Date.now()){
  const el=document.getElementById('gearGuide');if(!el||!state)return;
  const busy=EVENT_PANELS.some(q=>shown(document.querySelector(q)));
  if(busy){el.hidden=true;return;}
  const base=pages(state,esc),quick=quickPage(state,esc),list=quick?base.flatMap(p=>[quick,p]):base,html=list[Math.floor(now/PAGE_MS)%list.length];
  if(el.dataset.html!==html){el.innerHTML=html;el.dataset.html=html;}
  el.hidden=false;
}
export function mountGearGuide(rail){
  if(!rail||document.getElementById('gearGuide'))return;
  const el=document.createElement('div');el.id='gearGuide';el.className='gear-guide';el.hidden=true;rail.appendChild(el);
}
