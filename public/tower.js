// 11/11/2026: VÂN HẢI THÁP — khung đài thử thách giữa cảnh khi sự kiện mở (server: tower.mjs).
// Không lag: toàn bộ là HTML + ảnh tĩnh có sẵn (đài trăng arena-v1, thủ vệ cắt từ events-v1/celestial-bosses-v1.png bằng CSS),
// chân dung người leo lấy từ cache viền sáng của Linh Bài; rung/số sát thương chỉ là lớp CSS ngắn, tối đa 4 số/giây.
import {portraitCanvas} from './linh-bai.js';
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
let lastCur=null,lastHp=100,lastFloatAt=0,lastLast=null;
function secs(ms){return Math.max(0,Math.ceil(ms/1000));}
export function towerHTML(t,now,esc){
 if(!t)return '';
 if(!t.active&&t.result){const top=t.result.top||[];
  return `<div class="tw-ribbon"><span>✦ VÂN HẢI THÁP KHÉP CỬA ✦</span></div><div class="tw-podium">${top.length?top.map((r,i)=>`<div class="tw-pod tw-pod${i+1}"><i>${i+1}</i><strong>${esc(r.name)}</strong><span>tầng ${fmt(r.floor)}</span></div>`).join(''):'<div class="tw-empty">Chưa ai vượt tầng · lượt sau gõ 6 vào tháp</div>'}</div>`;}
 const c=t.cur,g=c?.guardian;
 const head=c?`TẦNG ${fmt(c.floor)} · ${esc(g.name)}`:'VÂN HẢI THÁP';
 const sub=c?`<b>${esc(c.name)}</b> gõ <u>3</u> đánh · người khác gõ <u>3</u> trợ lực${c.helpers?` <em>· ${c.helpers} trợ lực</em>`:''}`:`Đài trống · gõ <u>6</u> vào tháp`;
 const left=c?secs(c.endsAt-now):0;
 const q=t.queue?.length?`Chờ lượt: ${t.queue.map(esc).join(' · ')}${t.queued>t.queue.length?` +${t.queued-t.queue.length}`:''}`:'Chưa ai chờ · gõ 6 xếp lượt';
 const last=t.last?(t.last.won?`<div class="tw-result tw-win">✦ ${esc(t.last.name)} vượt tầng ${fmt(t.last.floor)} · +${fmt(t.last.qi)} tu vi${t.last.mile?' · MỐC ×2':''}</div>`:`<div class="tw-result tw-lose">${esc(t.last.name)} dừng ở tầng ${fmt(t.last.floor)} · gõ 6 thử lại</div>`):'';
 return `<div class="tw-ribbon"><span>✦ ${head} ✦</span></div>
<div class="tw-arena">
 <div class="tw-side tw-climber">${c?'<i class="tw-slot"></i>':''}${c?`<small>${esc(c.name)}</small>`:''}</div>
 <div class="tw-vs">${c?'VS':''}</div>
 <div class="tw-side tw-guard">${c?`<div class="tw-beast" style="--art:${g.art};--hue:${g.hue}deg"></div><small>${esc(g.name)}</small>`:''}</div>
 ${last}
</div>
${c?`<div class="tw-bars"><div class="tw-hp"><i style="width:${Math.max(0,Math.min(100,c.hp)).toFixed(1)}%"></i><span>Thủ vệ ${Math.ceil(c.hp)}%</span></div><div class="tw-time"><i style="width:${Math.max(0,Math.min(100,left/25*100)).toFixed(1)}%"></i><span>${left}s</span></div></div>`:''}
<div class="tw-line">${sub}</div>
<div class="tw-meta"><span>${q}</span>${c?`<span>Mốc kế: tầng ${fmt(c.next)} · thưởng ×2</span>`:''}<span>Tháp đóng sau ${secs(t.endsAt-now)}s</span></div>`;
}
export function renderTower(el,state,scene,esc,now=Date.now()){
 if(!el)return;const t=state?.tower;
 if(!t){if(!el.hidden){el.hidden=true;el.innerHTML='';document.body.classList.remove('tower-on');}lastCur=null;return;}
 const skew=state.serverNow?Date.now()-state.serverNow:0,sNow=now-skew;
 const html=towerHTML(t,sNow,esc);
 if(el._html!==html){
  el.innerHTML=html;el._html=html;
  const slot=el.querySelector('.tw-slot'),p=t.cur&&state.players?.find(x=>x.id===t.cur.id),art=p?portraitCanvas(scene,p):null;
  if(slot&&art){const v=document.createElement('canvas');v.width=art.width;v.height=art.height;v.getContext('2d').drawImage(art,0,0);slot.replaceWith(v);}
 }
 el.hidden=false;document.body.classList.add('tower-on');
 // Phản hồi trúng đòn: rung thủ vệ + số sát thương bay (≤4 lần/giây).
 const cur=t.cur;
 if(cur&&cur.id+':'+cur.floor===lastCur&&cur.hp<lastHp-0.4&&now-lastFloatAt>250){
  lastFloatAt=now;const beast=el.querySelector('.tw-guard');
  if(beast){beast.classList.remove('tw-hit');void beast.offsetWidth;beast.classList.add('tw-hit');
   const f=document.createElement('b');f.className='tw-dmg';f.textContent='-'+Math.max(1,Math.round(lastHp-cur.hp));beast.appendChild(f);setTimeout(()=>f.remove(),700);}
 }
 lastCur=cur?cur.id+':'+cur.floor:null;lastHp=cur?cur.hp:100;
 if(t.last&&t.last.seq!==lastLast){lastLast=t.last.seq;if(t.last.won)el.classList.add('tw-flash'),setTimeout(()=>el.classList.remove('tw-flash'),700);}
}
