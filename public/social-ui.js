import {eventDashboardHTML} from './event-dashboard.js';
import {SCENES} from './world-rotation.js';
import {safeAvatar} from './honors.js';
const esc=s=>String(s??'').normalize('NFC').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
export function mountEventTab(post){
 const hub=document.querySelector('#eventHub');if(!hub)return;
 const cards=new Set();for(const el of document.querySelectorAll('#settingsView [data-flower],#settingsView [data-visitor],#autoEvents,#blessButtonSettings')){const card=el.closest('.settings-card');if(card)cards.add(card);}const advanced=document.createElement('details');advanced.className='event-group event-advanced';advanced.innerHTML='<summary>Thiết lập tự động & công cụ khác</summary><div class="event-advanced-body"></div>';hub.appendChild(advanced);for(const card of cards)advanced.lastElementChild.appendChild(card);
 document.querySelector('#socialControl').addEventListener('click',e=>{const b=e.target.closest('[data-social]');if(!b)return;const action=b.dataset.social;if(action==='start-lantern'||action==='stop-lantern')post('/api/lantern-event',{action:action==='start-lantern'?'start':'stop'});else if(action==='world-scene')post('/api/world-scene',{scene:b.dataset.kind});else if(action==='pet-start'||action==='pet-stop')post('/api/pet-event',{action:action==='pet-start'?'start':'stop',minutes:5});else if(action==='blessing')post('/api/blessing',{count:3});else if(action==='visitor')post('/api/visitor-event',{kind:b.dataset.kind});else if(action==='flower')post('/api/flower-event',{minutes:2,kind:b.dataset.kind});else if(action==='boss')post('/api/boss',b.dataset.species?{species:b.dataset.species}:{});else if(action==='sea-event')post('/api/visitor-event',{kind:'hailam'});else if(action==='opportunity')post('/api/opportunity');else post('/api/social-control',{action,kind:b.dataset.kind});});
 document.querySelector('#socialControl').addEventListener('change',e=>{if(e.target.id==='bondEnabled')post('/api/social-control',{action:'bond-enabled',enabled:e.target.checked});});
}
export function renderSocialUI(state,admin=true){
 const practice=state.liveIntegrityVersion===1&&state.mode==='live'&&state.settings?.engagementRewards!==true;
 const s=state.socialStatus;if(!s)return;const t=s.tournament,now=state.serverNow,players=new Map(state.players.map(p=>[p.id,p])),name=id=>players.get(id)?.name||t?.fighters?.[id]?.name||'Đạo hữu';
 const active=t&&['registration','running'].includes(t.phase),phase={registration:'Đang tuyển',running:'Đang đấu',finished:'Đã hoàn tất',cancelled:'Đã dừng'}[t?.phase]||'Chưa mở';
 const current=t?.current,waiting=t?.waiting?.length||0;
 const html=eventDashboardHTML(state),root=document.querySelector('#socialControl');
 if(admin&&root&&root._lastSocial!==html&&document.activeElement?.id!=='bondEnabled'){
  const opened=new Set([...root.querySelectorAll('details[open][data-panel]')].map(el=>el.dataset.panel)),seen=new Set([...root.querySelectorAll('details[data-panel]')].map(el=>el.dataset.panel));
  root.innerHTML=html;root._lastSocial=html;
  for(const el of root.querySelectorAll('details[data-panel]'))if(seen.has(el.dataset.panel))el.open=opened.has(el.dataset.panel);
 }
 const race=state.raceStatus,f=s.festival;
 const short=id=>Array.from(name(id)).slice(0,13).join('');
 const hud=document.querySelector('#socialHud');if(!hud)return;let h='';
 if(race?.phase==='queued')h='<b>ĐUA PHI KIẾM SẮP MỞ</b><span>Chờ hoạt động hiện tại kết thúc</span>';
 else if(race?.phase==='registration')h='<b>PHI KIẾM · '+clock(race.registrationEndsAt-now)+'</b><span>Gõ bay · '+race.entries.length+' người đăng ký</span>';
 else if(race?.phase==='running')h='<b>PHI KIẾM · '+clock(race.endsAt-now)+'</b><span>Gõ danh để bứt tốc · hồi 10 giây · không giới hạn số lần</span>';
 else if(race?.active)h='<b>VỀ ĐÍCH · '+esc(race.results?.[0]?.name||'Chờ thêm đấu thủ')+'</b><span>Lượt tuyển tiếp theo sau '+clock(race.podiumUntil-now)+'</span>';
 else if(t?.phase==='registration')h='<b>LUẬN KIẾM · '+clock(t.registrationEndsAt-now)+'</b><span>Gõ tythi · '+t.entries.length+' người đăng ký</span>';
 else if(current){const au=current.aura||{};h='<b>'+esc(short(current.a))+' ✦ '+(au[current.a]||0)+' · '+esc(short(current.b))+' ✦ '+(au[current.b]||0)+'</b><span>Linh áp · đấu thủ gõ kiem tiếp linh lực '+(current.boosts[current.a]||0)+'/3 — '+(current.boosts[current.b]||0)+'/3 · '+clock(current.endsAt-now)+'</span>';}
 else if(t?.quick)h='<b>LUẬN KIẾM · VÒNG '+t.quick.round+'</b><span>So tài nhanh · '+(t.roundSize||'')+' đấu thủ · '+(t.results?.length||0)+' ván đã xong</span>';
 else if(t?.phase==='running')h='<b>LUẬN KIẾM · VÒNG '+t.round+'</b><span>Đang chuẩn bị cặp tiếp theo</span>';
 else if(s.ceremony)h='<b>'+(s.ceremony.festivalId?'NGUYỆT HẠ THÀNH DUYÊN':'TAM SINH ƯỚC')+'</b><span>'+esc(name(s.ceremony.a))+' ♥ '+esc(name(s.ceremony.b))+'</span>';
 else if(s.invites.length){const i=s.invites[0];h='<b>'+esc(i.fromName)+' mời '+esc(i.toName)+'</b><span>'+esc(i.toName)+' gõ dongy · '+clock(i.expiresAt-now)+'</span>';}
 if(!h&&f?.active&&!state.boss)h='<b>NGUYỆT HẠ KẾT DUYÊN · '+clock(f.endsAt-now)+'</b><span>ketduyen tên → dongy · '+(practice?'điểm tu luyện ':'tim chúc phúc ')+f.blessings+'/'+f.goal+'</span>';
 hud.hidden=!h;if(hud._last!==h){hud.innerHTML=h;hud._last=h;}
 renderQuickBoard(t,now,players);
}
// 05/11/2026: vòng loại luận kiếm hiện thẻ avatar từng cặp, vài giây sau lộ người thắng. Không có cảnh đánh.
function renderQuickBoard(t,now,players){
 const q=t?.phase==='running'?t.quick:null;let board=document.querySelector('#duelBoard');
 if(!q){if(board&&!board.hidden){board.hidden=true;board._last='';}return;}
 if(!board){board=document.createElement('div');board.id='duelBoard';board.className='duel-board';(document.querySelector('.scene-shell')||document.body).appendChild(board);}
 const shown=now>=q.revealAt,key=q.id+':'+shown;board.hidden=false;if(board._last===key)return;board._last=key;
 const card=(id,fallback,winner,tech)=>{const tl=tech?.name?`<small class="duel-tech" style="color:${esc(tech.color||'#bfeaff')}">${esc(tech.name)}${tech.intensity>1?' '+'✦'.repeat(tech.intensity-1):''}</small>`:'';const p=players.get(id),name=p?.name||fallback||'Đạo hữu',av=safeAvatar(p?.avatar),state=shown?(id===winner?' win':' bow'):'';
  return `<span class="duel-card${state}"><i class="duel-portrait"><em>${esc(Array.from(name)[0])}</em>${av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer" onerror="this.remove()">`:''}</i><b>${esc(Array.from(name).slice(0,12).join(''))}</b>${tl}<small>${shown?(id===winner?'Tiến vòng sau':'Đa tạ chỉ giáo'):'&nbsp;'}</small></span>`;};
 board.innerHTML='<header>LUẬN KIẾM · VÒNG '+q.round+' · SO TÀI NHANH</header>'+q.pairs.map(m=>`<div class="duel-pair">${card(m.a,m.aName,m.winner,m.aTech)}<span class="duel-mid">${shown?'✦':'⟡'}</span>${card(m.b,m.bName,m.winner,m.bTech)}</div>`).join('');
}
