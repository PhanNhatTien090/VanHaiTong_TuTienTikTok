const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=x=>Math.max(0,Math.min(1,x));
const svg=body=>'<svg viewBox="0 0 80 80" aria-hidden="true">'+body+'</svg>';
const star='<path d="m40 7 9 22 24 2-18 16 5 25-20-13-20 13 5-25L7 31l24-2Z" fill="#ffe599" stroke="#bd7b2e" stroke-width="2"/><path d="m40 20 5 15 17 1-13 10 4 15-13-9-13 9 4-15-13-10 17-1Z" fill="#fff6cb"/>';
const glyphs={
 bua:svg('<path d="M29 69 19 50V31q0-10 8-8V18q2-9 10-5 4-8 12-2 9-3 12 6l4 30-8 22Z" fill="#ffd8ac" stroke="#7e4029" stroke-width="3"/><path d="m28 30 2 16 8 0-1-26m10 0 2 26 8-1-1-24M20 45l18-4 7 13" fill="none" stroke="#a95e39" stroke-width="2"/>'),
 keo:svg('<path d="m25 70-8-23q-2-8 6-9l8 3-5-25q0-10 8-9l9 30 8-29q4-8 10-3l-4 37q11 5 5 18l-6 10Z" fill="#ffd8ac" stroke="#7e4029" stroke-width="3"/><path d="m30 43 11 4 7 12m-5-22 5 9" fill="none" stroke="#a95e39" stroke-width="2"/>'),
 bao:svg('<path d="m26 70-9-19-9-16q-3-8 4-10l13 14-5-25q0-8 7-7l9 26-1-27q3-9 9-3l4 29 5-23q5-7 10-1l-5 28 8-15q6-5 10 2L63 54l-6 16Z" fill="#ffd8ac" stroke="#7e4029" stroke-width="3"/><path d="m26 45 14-3 10 13" fill="none" stroke="#a95e39" stroke-width="2"/>')};
function bag(n){return svg('<path d="m22 10 13 6 12-5 12 3-8 16q22 16 18 33Q65 76 40 75 12 75 11 60 13 42 28 30Z" fill="'+['#b83738','#6543ac','#267d79'][n-1]+'" stroke="#f5cb76" stroke-width="2"/><path d="M24 29q17-4 31 0m-29 5 26-1" fill="none" stroke="#ffe6a2" stroke-width="3"/><circle cx="40" cy="53" r="13" fill="#e5ae53"/><text x="40" y="59" text-anchor="middle" font-size="19" font-weight="bold" fill="#572f1a">'+n+'</text><path d="M19 55q3-13 9-15" fill="none" stroke="#fff3b9" stroke-width="2"/>');}
function choices(type){
 if(type==='rps')return [['bua','BÚA'],['keo','KÉO'],['bao','BAO']].map(([key,label])=>'<div class="mini-choice">'+glyphs[key]+'<code>vui '+label.toLowerCase()+'</code></div>').join('');
 if(type==='lucky')return [1,2,3].map(n=>'<div class="mini-choice mini-bag">'+bag(n)+'<code>lộc '+n+'</code></div>').join('');
 return '<div class="mini-star-orbit">'+svg(star)+'<i></i><i></i><i></i></div><div class="mini-star-command"><code>bắt sao</code><span>12 vị trí · ai nhanh nhận trước</span></div>';
}
function receiptMarkup(e){const done=e.phase==='finished',rows=(done?(e.winners||[]):(e.latest||[])).slice(0,done?3:2);return (rows.length?rows.map((r,i)=>'<div class="mini-receipt" data-receipt="'+esc(r.id+':'+r.at)+'"><span class="mini-result-mark">'+(done?'#'+(i+1):r.outcome==='win'?'THẮNG':r.outcome==='grand'?'ĐẠI CÁT':r.outcome==='star'?'★ '+r.choice:'LỘC')+'</span><span><strong>'+esc(r.name)+'</strong><small>'+esc(done?'+'+r.qi+' tu vi · '+r.stones+' thạch':r.result)+'</small></span></div>').join(''):'<p>Gõ lệnh trong bình luận để chơi<br><small>Mỗi người nhận một lần trong lượt</small></p>');}
function body(e){
 const done=e.phase==='finished';
 const hero=done?'<div class="mini-finale"><span class="mini-finale-seal">'+svg(star)+'</span><strong>'+(e.count?'ĐÃ TRAO LỘC CHO '+e.count+' ĐẠO HỮU':'HẸN GẶP ĐẠO HỮU LƯỢT SAU')+'</strong></div>':'<div class="mini-choices mini-'+e.type+'">'+choices(e.type)+'</div>';
 return '<header><span class="mini-kicker">ĐỒNG MÔN VUI HỘI · MIỄN PHÍ</span><b>'+esc(e.name)+'</b><small data-mini-clock></small></header>'+hero+
 '<div class="mini-progress"><i></i></div><div class="mini-receipts">'+receiptMarkup(e)+'</div><p class="mini-compact-how">'+esc(e.how||({rps:'Gõ vui búa / kéo / bao',lucky:'Gõ lộc 1 / lộc 2 / lộc 3',star:'Gõ bắt sao'}[e.type]))+'</p><footer data-mini-count></footer>';
}
export function renderMiniEvent(event,serverNow,root,motion=true){
 let el=document.getElementById('miniEventBox');if(!el){el=document.createElement('aside');el.id='miniEventBox';el.setAttribute('aria-live','polite');root.appendChild(el);}
 el.hidden=!event;if(!event)return;
 if(el._stamp!==serverNow){el._stamp=serverNow;el._received=performance.now();}
 const now=serverNow+performance.now()-(el._received||performance.now()),done=event.phase==='finished',until=done?event.resultUntil:event.endsAt,left=Math.max(0,Math.ceil((until-now)/1000));
 if(!left){el.hidden=true;return;}
 const sig=JSON.stringify([event.id,event.phase,event.count,(done?event.winners:event.latest)||[]]);
 const core=event.id+':'+event.phase;if(el._core!==core){el._core=core;el._sig=sig;el.dataset.type=event.type;el.className='mini-event-card '+(done?'mini-finished':'mini-playing');el.innerHTML=body(event);}else if(el._sig!==sig){el._sig=sig;el.querySelector('.mini-receipts').innerHTML=receiptMarkup(event);}el.classList.toggle('mini-motion-off',motion===false);
 el.querySelector('[data-mini-clock]').textContent=done?'LƯỢT CHƠI ĐÃ KHÉP':left+' GIÂY CÒN LẠI';
 el.querySelector('.mini-progress i').style.transform='scaleX('+clamp((until-now)/Math.max(1,until-(done?until-8000:event.startedAt||until-45000)))+')';
 el.querySelector('[data-mini-count]').textContent=done?'Quà đã cộng · giữ lại khi khởi động lại':event.type==='star'?'Còn '+event.remaining+' / 12 sao · '+event.count+' người nhận':event.count+' đạo hữu đã chơi · quà vật phẩm game';
}
