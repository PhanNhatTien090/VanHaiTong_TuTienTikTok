// 19/11/2026 — trang điều hành một màn (/dieu-hanh.html). Chỉ đọc trạng thái + gọi đúng các API mà trang quản lý cũ đang dùng.
// Không tự mở sự kiện: mọi nút đều cần bấm "Mở ngay" ở bước xác nhận (luật: mở/dừng sự kiện chỉ chủ game bấm).
const $=s=>document.querySelector(s);
const W='?world=live';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtTime=t=>t?new Date(t).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}):'';
const left=t=>{const s=Math.max(0,Math.round((t-Date.now())/1000));return s>=60?Math.floor(s/60)+' phút '+(s%60)+' giây':s+' giây';};
function tile(id,value,state){const el=$(id);el.querySelector('b').textContent=value;el.dataset.state=state||'';}
const ACTS={
 boss:{label:'Gọi yêu thú lên sân?',url:'/api/boss',body:{}},
 opportunity:{label:'Mở Cơ duyên?',url:'/api/opportunity',body:{}},
 arena:{label:'Mở Lôi Đài 8 phút?',url:'/api/arena',body:{minutes:8}},
 pet:{label:'Mở Linh Thú Cốc 5 phút?',url:'/api/pet-event',body:{action:'start',minutes:5}},
 arenaStop:{label:'Đóng Lôi Đài đang mở?',url:'/api/arena',body:{action:'stop'}},
 petStop:{label:'Đóng Linh Thú Cốc?',url:'/api/pet-event',body:{action:'stop'}}
};
let pending=null,state=null;
async function post(url,body){const r=await fetch(url+W,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let j={};try{j=await r.json();}catch{}return {ok:r.ok&&j.ok!==false,msg:j.message||''};}
function toast(text,err){const t=$('#toast');t.textContent=text;t.classList.toggle('err',!!err);}
document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{pending=b.dataset.act;$('#confirmText').textContent=ACTS[pending].label;$('#confirm').hidden=false;$('#confirmYes').focus();});
$('#confirmNo').onclick=()=>{pending=null;$('#confirm').hidden=true;};
$('#confirmYes').onclick=async()=>{const a=ACTS[pending];if(!a)return;$('#confirmYes').disabled=true;
 try{const r=await post(a.url,a.body);toast(r.ok?'Đã gửi: '+a.label.replace('?',''):'Không mở được: '+(r.msg||'máy chủ từ chối'),!r.ok);}catch{toast('Mất kết nối máy chủ, thử lại.',true);}
 $('#confirmYes').disabled=false;$('#confirm').hidden=true;pending=null;refresh();};
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=async()=>{try{const r=await post('/api/world-scene',{scene:b.dataset.scene});toast(r.ok?'Đã đổi map: '+b.firstChild.textContent:'Không đổi được map: '+r.msg,!r.ok);}catch{toast('Mất kết nối máy chủ.',true);}refresh();});
function nowText(s){const out=[],n=Date.now();
 if(s.boss)out.push('Yêu thú: '+esc(s.boss.name||s.boss.species||'đang đánh'));
 if(s.visitor&&s.visitor.endsAt>n&&!s.visitor.closedAt)out.push('Sự kiện skin còn '+left(s.visitor.endsAt));
 if(s.arena&&s.arena.phase&&s.arena.phase!=='closed')out.push('Lôi Đài ('+esc(s.arena.phase)+')');
 if(s.opportunity&&s.opportunity.endsAt>n&&!s.opportunity.closedAt)out.push('Cơ duyên còn '+left(s.opportunity.endsAt));
 if(s.petEvent?.active)out.push('Linh Thú Cốc còn '+left(s.petEvent.endsAt));
 if(s.sectWar?.active)out.push('Chính Ma chiến');
 return (out.length?out.join(' · '):'Không có sự kiện. Sân thường.')+' <span class="note">· Map: '+esc(s.environment?.name||'')+'</span>';}
async function refresh(){
 try{const [sr,cr]=await Promise.all([fetch('/api/state'+W,{cache:'no-store'}),fetch('/api/client-status',{cache:'no-store'})]);
  state=await sr.json();const clients=(await cr.json()).filter(c=>c.overlay);
  const con=state.connection||{};tile('#tTik',con.status==='connected'?'Đã nối':con.status||'Tắt',con.status==='connected'?'ok':'bad');
  const active=(state.players||[]).filter(p=>p.active&&!p.resident&&!p.puppet);tile('#tPeople',active.length,active.length?'ok':'');
  const fps=clients.map(c=>Number(c.fps)||0).filter(Boolean),worst=fps.length?Math.min(...fps):null;
  tile('#tFps',worst==null?'—':Math.round(worst),worst==null?'':worst>=40?'ok':worst>=24?'warn':'bad');
  tile('#tClients',clients.length,clients.length===1?'ok':clients.length>1?'warn':'');
  $('#clients').innerHTML=clients.length?clients.map(c=>`<tr><td>${esc((c.id||'').slice(0,8))}${c.audioEnabled?' · có tiếng':''}</td><td class="n">${Math.round(c.fps||0)}</td><td class="n">${c.frameP95?Math.round(c.frameP95)+' ms':'—'}</td><td>${esc(c.quality||'')}</td><td>${esc(c.view?.px||'')}</td></tr>`).join(''):'<tr><td colspan="5">Chưa có nguồn nào báo về.</td></tr>';
  $('#now').innerHTML=nowText(state);
  const scene=state.settings?.sceneMode||'auto';document.querySelectorAll('[data-scene]').forEach(b=>b.classList.toggle('on',b.dataset.scene===scene));
  const fresh=(state.players||[]).filter(p=>!p.resident&&!p.puppet&&Date.now()-Number(p.joinedAt)<864e5).sort((a,b)=>b.joinedAt-a.joinedAt).slice(0,8);
  $('#fresh').innerHTML=fresh.length?fresh.map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.realmName||('Cảnh giới '+p.realm))}</td><td>${fmtTime(p.joinedAt)}</td></tr>`).join(''):'<tr><td colspan="3">Hôm nay chưa có người mới.</td></tr>';
  $('#updated').textContent='Cập nhật '+new Date().toLocaleTimeString('vi-VN');
 }catch{$('#updated').textContent='Mất kết nối máy chủ · thử lại sau 6 giây';}
}
refresh();setInterval(refresh,6000);
