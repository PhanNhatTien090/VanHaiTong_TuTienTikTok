const $=s=>document.querySelector(s),world=new URLSearchParams(location.search).get('world')==='demo'?'demo':'live';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={vuonglam:'Vương Lâm',hanlap:'Hàn Lập',shende:'Thần Đế'},time=at=>new Date(at).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'});
let data;
function render(){const e=data?.event,q=$('#search').value.toLocaleLowerCase('vi');
 $('#status').textContent=e?`${names[e.kind]} · ${time(e.startedAt)} → ${time(e.endsAt)} · skin ${e.skinCoins} coin / pháp bảo ${e.artifactCoins} coin${e.provenance==='backup'?' · Phục hồi từ sao lưu':''}`:'Chưa có lượt tiên nhân được ghi nhận.';
 $('#rows').innerHTML=(e?.rows||[]).filter(p=>(p.name+' '+p.id).toLocaleLowerCase('vi').includes(q)).map(p=>`<tr><td>${esc(p.name)}<small>${esc(p.id)}${p.simulated?' · NPC / mô phỏng':''}</small></td><td>${p.coins.toLocaleString('vi-VN')}<small>${p.simulated?'Không tính đạt mốc':p.coins?'Đã ghi nhận quà':'Chưa ghi nhận quà trong lượt'}</small></td><td>${p.simulated?'—':p.skinEarned?'Đủ mốc':'Còn '+Math.max(0,e.skinCoins-p.coins)+' coin'}</td><td class="${p.skinOwned?'ok':p.skinEarned&&!p.simulated?'missing':'muted'}">${p.skinOwned?'Đã có'+(p.wearing?' · đang mặc':''):p.skinEarned&&!p.simulated?'Thiếu skin · cần đối soát':'Chưa có'}</td><td>${p.artifactOwned?'Đã có':p.artifactEarned&&!p.simulated?'Đủ mốc · cần đối soát':'Chưa đạt mốc trong lượt'}</td></tr>`).join('')||'<tr><td colspan="5">Chưa ghi nhận người tham gia phù hợp.</td></tr>';
}
async function load(){try{const id=$('#events').value,r=await fetch('/api/visitor-audit?world='+world+(id?'&event='+encodeURIComponent(id):''));if(!r.ok)throw Error('Không đọc được nhật ký');data=await r.json();
 $('#events').innerHTML=data.events.map(e=>`<option value="${esc(e.id)}" ${e.id===data.event?.id?'selected':''}>${esc(names[e.kind]||e.kind)} · ${esc(time(e.startedAt))}</option>`).join('');
 $('#download').href='/api/gift-audit-log?world='+world+'&date='+data.today;render();
 }catch(e){$('#status').textContent=e.message;}}
$('#refresh').onclick=load;$('#events').onchange=load;$('#search').oninput=render;load();
