import {SKINS} from './cosmetics.js';
import {SPECIAL_SKINS} from './patrons.js';
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
let state,toastTimer;
function card(name,tag,description,commands=[]){return `<article class="card" data-search="${esc([name,tag,description,...commands].join(' ').toLowerCase())}"><span class="tag">${esc(tag)}</span><h3>${esc(name)}</h3><p>${esc(description)}</p>${commands.map(cmd=>`<code>${esc(cmd)}</code><button class="secondary" data-copy="${esc(cmd)}">Chép lệnh</button>`).join('')}</article>`;}
const basics=[
 ['Hủy đạo lữ','Gõ hủy duyên, sau đó hủy duyên xác nhận trong 30 giây. Chỉ cần một người xác nhận; cả hai trở lại độc thân, giữ nguyên tu vi, đồ và thành tích. Không cần sự kiện kết duyên đang mở.',['hủy duyên','hủy duyên xác nhận']],
 ['Nhập môn','Chọn nam/nữ để đổi hình và xưng hô. Nhận 30 linh thạch, 3 linh thảo khi tạo hồ sơ.',['nhập môn nam','nhập môn nữ']],
 ['Tu luyện','+10 tu vi cơ bản, +2 linh thạch. Hồi 10 giây.',['tu luyện']],
 ['Hái linh thảo','+5 tu vi cơ bản, +3 linh thạch, +3 linh thảo. Hồi 30 giây.',['hái']],
 ['Điểm danh','+25 tu vi cơ bản, +20 linh thạch, +3 linh thảo. Một lần/ngày Việt Nam.',['điểm danh']],
 ['Xem tiến độ và gợi ý','Xem tài nguyên còn thiếu hoặc hỏi bước tiếp theo có thể làm. Hồi 15 giây.',['tu vi','gợi ý']],
 ['Đột phá','Cần đủ tu vi và linh thạch. Tiêu tài nguyên, tăng cảnh giới và đổi chi tiết trang phục.',['đột phá']],
 ['Đánh yêu thú','Khi bí cảnh đang mở. Hồi 4 giây; người đã tham chiến nhận thưởng nếu thắng.',['đánh']],
 ['Đổi xưng hô','Người xem tự chọn; an là xưng hô đạo hữu trung tính.',['giới tính nam','giới tính nữ','giới tính ẩn']]
];
function render(){
 $('#basicRows').innerHTML=basics.map(([name,desc,cmd])=>card(name,'LỆNH CHAT',desc,cmd)).join('');
 $('#itemRows').innerHTML=state.catalog.map(i=>{
   const commands=i.exclusive?['trang bị '+i.name]:[(i.type==='manual'?'học':i.type==='pill'?'luyện đan':'rèn')+' '+i.name];
   if(i.type==='pill')commands.push('dùng '+i.name);else if(i.type==='artifact'&&!i.exclusive)commands.push('trang bị '+i.name);
   const cost=i.exclusive?(i.giftMin?`Quà từ ${i.giftMin} coin mỗi món.`:i.id==='tiger-bell'?'Dẫn đầu sát thương trong trận hạ Lôi Hổ.':i.loyaltyMinutes?`Tri ân miễn phí sau ${i.loyaltyMinutes} phút kể từ nhập môn, khi có tương tác trong 5 phút gần đây. Mỗi món nhận một lần; không phải thời gian xem đo trực tiếp.`:'Nhận khi dẫn đầu quà trong nhóm đang hoạt động.'):`${state.realms[i.tier]} · ${i.price} linh thạch${i.herbs?' + '+i.herbs+' linh thảo':''}.`;
   return card(i.name,{manual:'BÍ PHÁP',artifact:'PHÁP BẢO',pill:'TINH THỂ GAME'}[i.type],cost+' '+i.description,commands);
 }).join('');
 const gifts=[...state.gifts].sort((a,b)=>a.min-b.min);
 $('#giftRows').innerHTML=gifts.map((g,i)=>card(`${g.min}${gifts[i+1]?'–'+(gifts[i+1].min-1):'+'} coin / món`,g.name,`Tại mốc ${g.min} coin: +${g.qi} tu vi cơ bản, +${g.stones} linh thạch${g.herbs?', +'+g.herbs+' linh thảo':''}. Từ 30 coin, tài nguyên tăng theo giá thực mỗi món.${g.artifact?' Pháp bảo lần đầu: '+(state.catalog.find(i=>i.id===g.artifact)?.name||g.artifact)+'.':''}`)).concat(SKINS.slice(1).map(s=>card(s.name,'SKIN QUÀ TÍCH LŨY',`Tổng ${s.min.toLocaleString('vi-VN')} coin quà đã gửi · ${s.vfx}. Tự nâng khi đủ mốc.`))).join('');
 $('#specialRows').innerHTML=SPECIAL_SKINS.map((s,i)=>card(s.name,'BỘ TRANG PHỤC MỚI',s.id==='shende-avatar'?'Trong Thần Đế Giáng Lâm: quà mới cộng dồn 100 coin nhận skin; tổng 300 coin nhận cả skin và Thần Đế Đạo Ấn. Sở hữu vĩnh viễn.':s.id==='hanlap-avatar'?'Hàn Lập xuất hiện: 100 coin nhận skin, tổng 200 coin nhận cả skin và Thanh Trúc Phong Vân Kiếm. Sở hữu lâu dài.':s.id==='vuonglam-avatar'?'Vương Lâm xuất hiện: 200 coin nhận skin, tổng 300 coin cả skin và Hồn Phiên. Nam: Vương Lâm; nữ: Lý Mộ Uyển. Sở hữu lâu dài.':i===0?'Thưởng Đại Hộ Pháp: kèm Hộ Pháp Thiên Kiếm và Trấn Tông Long Ấn.':s.id==='crimson-phoenix'?'Mở khi rèn Xích Diễm Kiếm hoặc nhận tri ân nhập môn 30 phút.':'Mở khi rèn Cửu Tiêu Linh Châu hoặc nhận tri ân nhập môn 60 phút.',['skin '+s.name])).join('');
 receipts();filter();
}
function filter(){const q=plain($('#search').value.toLowerCase().trim());document.querySelectorAll('[data-search]').forEach(el=>el.hidden=!!q&&!plain(el.dataset.search).includes(q));}
function receipts(){
 const q=plain($('#receiptSearch').value.toLowerCase().trim());if(!q){$('#receiptRows').innerHTML='<p>Nhập tên để kiểm tra biên nhận.</p>';return;}
 const people=state.players.filter(p=>plain(p.name.toLowerCase()).includes(q)||p.id===q).slice(0,10);
 $('#receiptRows').innerHTML=people.map(p=>`<article class="card receipts"><h3>${esc(p.name)}</h3><p>${p.giftCoins} coin quà tích lũy · Trang bị: ${esc(state.catalog.find(i=>i.id===p.equipped)?.name||'chưa có')}</p><p>Đã sở hữu: ${esc((p.artifacts||[]).map(id=>state.catalog.find(i=>i.id===id)?.name||id).join(', ')||'chưa có')}<br>Trang phục đặc biệt: ${esc((p.rewardSkins||[]).map(id=>SPECIAL_SKINS.find(s=>s.id===id)?.name||id).join(', ')||'chưa có')}</p>${p.giftHistory?.length?`<table><thead><tr><th>Giờ</th><th>Quà</th><th>Đã cộng</th></tr></thead><tbody>${[...p.giftHistory].reverse().map(g=>`<tr><td>${new Date(g.at).toLocaleTimeString('vi-VN')}</td><td>${esc(g.gift||'Quà')} ×${g.count}<br>${g.coins} coin/món</td><td>+${g.reward.qi} tu vi · +${g.reward.stones} linh thạch · +${g.reward.herbs} linh thảo</td></tr>`).join('')}</tbody></table>`:'<p>Chưa có biên nhận chi tiết từ v18. Số coin tổng vẫn được giữ; không thể suy ngược từng món quà cũ.</p>'}</article>`).join('')||'<p>Không thấy trong nhóm hồ sơ đang gửi về trang điều khiển. Có thể người này đã lâu không hoạt động.</p>';
}
async function refresh(){try{$('#status').textContent='Đang đọc cấu hình…';const r=await fetch('/api/state?world=live',{cache:'no-store'});if(!r.ok)throw Error();state=await r.json();render();$('#status').textContent='Đã đọc server · '+new Date().toLocaleTimeString('vi-VN');}catch{$('#status').textContent='Chưa kết nối được server. Bật server rồi bấm Cập nhật cấu hình.';}}
document.addEventListener('click',async e=>{const cmd=e.target.closest('[data-copy]')?.dataset.copy;if(!cmd)return;try{await navigator.clipboard.writeText(cmd);$('#toast').textContent='Đã chép: '+cmd;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}catch{$('#status').textContent='Chép thủ công: '+cmd;}});
$('#copyBasics').onclick=async()=>{try{await navigator.clipboard.writeText('nhập môn nam / nhập môn nữ\ntu luyện · hái · điểm danh · tu vi · đột phá · đánh\nhọc Thanh Tâm Quyết\nrèn Thanh Ngọc Kiếm\nluyện đan Tụ Khí Đan\ndùng Tụ Khí Đan\nKhông biết làm gì thì gõ gợi ý');$('#status').textContent='Đã chép bộ lệnh cơ bản.';}catch{$('#status').textContent='Không chép tự động được. Dùng các lệnh trong bảng.';}};
$('#refresh').onclick=refresh;$('#search').oninput=filter;$('#receiptSearch').oninput=()=>state&&receipts();refresh();

$('#startOpportunity').onclick=async()=>{const b=$('#startOpportunity');b.disabled=true;try{const r=await fetch('/api/opportunity?world=live',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const data=await r.json();$('#opportunityStatus').textContent=data.ok?'Đã mở · kết thúc '+new Date(data.endsAt).toLocaleTimeString('vi-VN'):data.message;await refresh();}catch{$('#opportunityStatus').textContent='Không kết nối được server.';}finally{b.disabled=false;}};
