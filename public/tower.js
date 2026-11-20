// 11/11/2026: VÂN HẢI THÁP — khung đài thử thách giữa cảnh (server: tower.mjs).
// 16/11 (chủ game): 4 ĐÀI cùng lúc (lưới 2×2), máu thủ vệ bằng số, máu người leo, chip cuồng hóa;
// QUÀ TRỢ LỰC hoành tráng theo mốc 1 · 10 · 30 · 100 · 500: bùng sáng thẻ đài, chữ chiêu + ảnh quà, số sát thương lớn,
// rung màn (≥10), chói lóa toàn màn (≥100), mưa kiếm (500). Không lag: HTML + CSS + WAAPI, ảnh tĩnh có sẵn.
import {portraitCanvas} from './linh-bai.js';
import {playLimitedStrikeIn} from './bao-limited-strike.js?v=20261120'; // 20/11: đòn riêng thần khí GIỚI HẠN trên thẻ làn
import {giftTokenHTML} from './gift-icons.js';
import {queueAvatarsHTML} from './queue-avatars.js';
import {baoArt,BAO_TIER} from './phap-bao-data.js'; // 18/11: thần thông bản mệnh trong Tháp
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const mounted=new WeakMap();
const secs=ms=>Math.max(0,Math.ceil(ms/1000));
const pct=v=>Math.max(0,Math.min(100,Number(v)||0)).toFixed(1)+'%';
export const TOWER_GIFT_GUIDE=Object.freeze([[1,'Linh Khí Hộ Thể','hồi máu · đánh nhanh'],[10,'Kiếm Vũ Trợ Trận','sát thương ×1,4'],[30,'Cửu Thiên Lôi Phạt','×1,7 · +6 giây'],[100,'Thiên Hỏa Liệu Nguyên','chém 85% máu thủ vệ'],[500,'Vạn Kiếm Quy Tông','chém bay thủ vệ']]);
const TIER_COLOR={g1:'#9ff0d0',g10:'#9fd8ff',g30:'#c79bff',g100:'#ffb070',g500:'#ffd36b'};
function ensureCss(){if(typeof document==='undefined'||document.getElementById('tw2-css'))return;const l=document.createElement('link');l.id='tw2-css';l.rel='stylesheet';l.href='/tower-v2.css?v=20261116b';document.head?.appendChild(l);}

function laneHTML(l,i,esc){
 if(!l)return `<div class="tw2-lane tw2-empty" data-lane="${i}"><b>ĐÀI ${i+1}</b><span>Đài trống · gõ <u>6</u> lên đài</span></div>`;
 const g=l.guardian,b=l.buff;
 return `<div class="tw2-lane" data-lane="${i}" data-key="${esc(l.id)}:${l.floor}">
 <div class="tw2-head"><b>ĐÀI ${i+1} · TẦNG ${fmt(l.floor)}</b><em>${esc(g.name)}</em></div>
 <div class="tw2-fight"><div class="tw2-me"><i class="tw2-slot"></i><small>${esc(l.name)}</small></div><div class="tw2-vs">VS</div><div class="tw2-guard"><div class="tw2-beast" style="--art:${g.art};--hue:${g.hue}deg"></div></div></div>
 <div class="tw2-bar tw2-ghp"><i></i><span></span></div>
 <div class="tw2-bar tw2-mhp"><i></i><span></span></div>
 <div class="tw2-foot"><span class="tw2-time"></span>${b?`<span class="tw2-buff" style="--c:${TIER_COLOR[b.tier]||'#ffd36b'}">⚡ ${esc(b.name)} ×${String(b.mult).replace('.',',')}</span>`:`<span class="tw2-hint">gõ <u>3</u> đánh${l.helpers?` · ${l.helpers} trợ lực`:''}</span>`}</div>
</div>`;
}
export function towerHTML(t,now,esc,state={}){
 if(!t)return '';
 if(!t.active&&t.result){const top=t.result.top||[];
  return `<div class="tw-ribbon"><span>✦ VÂN HẢI THÁP KHÉP CỬA ✦</span></div><div class="tw2-podium">${top.length?top.map((r,i)=>`<div class="tw2-pod tw2-pod${i+1}"><i>${i+1}</i><strong>${esc(r.name)}</strong><span>tầng ${fmt(r.floor)}</span></div>`).join(''):'<div class="tw2-none">Chưa ai vượt tầng · lượt sau gõ 6 lên đài</div>'}</div>`;}
 const lanes=t.lanes||[];
 const qa=t.queueAvatars||(t.queue||[]).map(()=>({})),q=qa.length?`<span class="tw2-q"><em>CHỜ</em>${queueAvatarsHTML(qa,(t.queued||0)-qa.length,esc)}</span>`:'Gõ 6 lên đài'; // 16/11: hàng chờ = avatar, không tên
 const guide=TOWER_GIFT_GUIDE.map(([c,name])=>`<span>${giftTokenHTML(state.giftArt,c)}<b>${esc(name)}</b></span>`).join('');
 return `<div class="tw-ribbon"><span>✦ VÂN HẢI THÁP · 4 ĐÀI ✦</span></div>
<div class="tw2-grid">${[0,1,2,3].map(i=>laneHTML(lanes[i],i,esc)).join('')}</div>
<div class="tw2-gifts"><em>QUÀ TRỢ LỰC</em>${guide}</div>
<div class="tw2-meta"><span>${q}</span><span>người ngoài gõ <u>3</u> trợ lực</span><span class="tw2-clock"></span></div>`;
}
function setText(node,text){if(node&&node.textContent!==text)node.textContent=text;}
function setWidth(node,value){if(node&&node.style.width!==value)node.style.width=value;}
function structureKey(t){return t.active?JSON.stringify([(t.lanes||[]).map(l=>l&&[l.id,l.floor,l.buff?.tier,l.helpers>0]),(t.queueAvatars||[]).map(q=>q.id).join(','),t.queued]):'end:'+t.id;}

// ---------- hiệu ứng quà ----------
function shake(nodes,amp,ms){for(const n of nodes){if(!n?.animate)continue;const k=[];for(let i=0;i<=8;i++){const a=amp*(1-i/8);k.push({translate:`${(i%2?-1:1)*a}px ${((i>>1)%2?-1:1)*a*.6}px`});}n.animate(k,{duration:ms,easing:'linear',composite:'add'});}} // 'translate' riêng → không đè transform căn giữa
function flashScreen(color,strong){const d=document.createElement('div');d.className='tw2-screenflash'+(strong?' tw2-strong':'');d.style.setProperty('--c',color);document.body.appendChild(d);setTimeout(()=>d.remove(),strong?1500:1000);}
function swordRain(host){const box=document.createElement('div');box.className='tw2-rain';for(let i=0;i<22;i++){const s=document.createElement('i');s.style.left=(4+Math.random()*92)+'%';s.style.animationDelay=(Math.random()*.7).toFixed(2)+'s';box.appendChild(s);}host.appendChild(box);setTimeout(()=>box.remove(),2200);}
function giftBurst(el,view,f,state,scene,esc){
 const card=el.querySelector(`.tw2-lane[data-lane="${f.lane}"]`);if(!card)return;const color=TIER_COLOR[f.tier]||'#ffd36b',big=f.tier==='g100'||f.tier==='g500';
 card.style.setProperty('--fx',color);card.classList.remove('tw2-hit');void card.offsetWidth;card.classList.add('tw2-hit','tw2-'+f.tier);setTimeout(()=>card.classList.remove('tw2-hit','tw2-'+f.tier),1400);
 const pop=document.createElement('div');pop.className='tw2-pop tw2-pop-'+f.tier;pop.style.setProperty('--c',color);
 const extra=[f.burst?'-'+fmt(Math.round(f.burst/100*(state?.tower?.lanes?.[f.lane]?.maxHp||0)))+' máu':'',f.heal?'+'+f.heal+'% hồi':'',f.time?'+'+Math.round(f.time/1000)+' giây':''].filter(Boolean).join(' · ');
 pop.innerHTML=`<div class="tw2-pop-gift">${giftTokenHTML(state?.giftArt,f.value)}</div><strong>${esc(f.name)}</strong><small>${esc(f.fromName||'')}${extra?' · '+extra:''}</small>`;
 card.appendChild(pop);setTimeout(()=>pop.remove(),big?2400:1700);
 if(scene.motion!==false&&f.shake)shake([el,document.querySelector('.scene-shell')||document.querySelector('canvas')],Math.min(22,f.shake),big?900:520);
 if(!scene.reduceFlash){if(big)flashScreen(color,f.tier==='g500');}
 if(f.tier==='g500'&&scene.motion!==false)swordRain(card);
 scene.onTowerSound?.(big?'milestone':'clear');
}

// 18/11 tối: thần khí bản mệnh phát thần thông trên đài — ảnh pháp bảo phóng to, tên + chiêu + máu mất, nháy viền màu bậc.
function baoBurst(el,f,state,esc){const card=el.querySelector(`.tw2-lane[data-lane="${f.lane}"]`);if(!card)return;if(f.tier===6)playLimitedStrikeIn(card,f.id,{from:{x:.3,y:.95},to:{x:.66,y:.62},seed:f.at%997});const col=BAO_TIER[f.tier]?.color||'#ffd36b';
 card.style.setProperty('--fx',col);card.classList.remove('tw2-hit');void card.offsetWidth;card.classList.add('tw2-hit');setTimeout(()=>card.classList.remove('tw2-hit'),1200);
 const pop=document.createElement('div');pop.className='tw2-pop';pop.style.setProperty('--c',col);const dmg=Math.round(f.burst/100*(state?.tower?.lanes?.[f.lane]?.maxHp||0));
 /* 18/11 khuya (chủ game: "thần khí trong Tháp có chạy hiệu ứng gì không"): món lao vào thủ vệ + vệt chém màu bậc; Đỉnh ghi hồi máu, Chung ghi khiên */
 const fly=document.createElement('img');fly.className='tw2-bao-fly';fly.src=baoArt(f.id);fly.alt='';fly.style.setProperty('--c',col);card.appendChild(fly);setTimeout(()=>fly.remove(),1300);
 const slash=document.createElement('i');slash.className='tw2-bao-slash';slash.style.setProperty('--c',col);card.appendChild(slash);setTimeout(()=>slash.remove(),900);
 const extra=f.heal?' · hồi '+fmt(f.heal)+'% máu':f.shield?' · khiên '+fmt(f.shield)+'%':'';
 pop.classList.add('tw2-pop-bao');pop.innerHTML=`<div class="tw2-pop-gift"><img src="${baoArt(f.id)}" alt="" style="width:3.6em;height:3.6em;object-fit:contain"></div><strong>${esc(f.name)}</strong><small>THẦN THÔNG · ${esc(f.skill||'')}${dmg?' · -'+fmt(dmg)+' máu':''}${extra}</small>`;card.appendChild(pop);setTimeout(()=>pop.remove(),2600);}
export function renderTower(el,state,scene,esc,now=Date.now()){
 if(!el)return;
 const t=state?.tower;
 if(!t){
  if(!el.hidden){el.hidden=true;el.replaceChildren();document.body.classList.remove('tower-on');}
  mounted.delete(el);return;
 }
 ensureCss();
 let view=mounted.get(el);
 if(!view||view.id!==t.id){view={id:t.id,key:null,hp:{},seenFx:new Set((t.fx||[]).map(f=>f.id)),seenRes:new Set((t.results||[]).map(r=>r.seq)),portraits:{}};mounted.set(el,view);}
 const key=structureKey(t);
 if(view.key!==key){
  el.innerHTML=towerHTML(t,now,esc,state);view.key=key;el.classList.add('tw2');
 }
 // chân dung: thử lại mỗi nhịp tới khi ảnh nhân vật tải xong
 for(const card of el.querySelectorAll('.tw2-lane[data-key]')){const slot=card.querySelector('.tw2-slot'),lane=t.lanes?.[Number(card.dataset.lane)];if(!slot||!lane)continue;
   let cv=view.portraits[lane.id];
   if(!cv){const player=state.players?.find(x=>x.id===lane.id),art=player&&portraitCanvas(scene,player);if(art){cv=document.createElement('canvas');cv.width=art.width;cv.height=art.height;cv.getContext('2d').drawImage(art,0,0);view.portraits[lane.id]=cv;}}
   if(cv)slot.replaceWith(cv);}
 if(el.hidden){el.hidden=false;document.body.classList.add('tower-on');}
 setText(el.querySelector('.tw2-clock'),t.active?'Tháp đóng sau '+secs(t.endsAt-now)+'s':'');
 for(const l of t.lanes||[]){if(!l)continue;const card=el.querySelector(`.tw2-lane[data-lane="${l.lane}"]`);if(!card)continue;
  const left=Math.max(0,l.hp)*l.maxHp/100;
  setWidth(card.querySelector('.tw2-ghp i'),pct(l.hp));setText(card.querySelector('.tw2-ghp span'),'Thủ vệ '+fmt(Math.ceil(left))+' / '+fmt(l.maxHp));
  setWidth(card.querySelector('.tw2-mhp i'),pct(l.me));setText(card.querySelector('.tw2-mhp span'),'Máu '+String(l.name).slice(0,14)+' '+Math.ceil(l.me)+'%');
  setText(card.querySelector('.tw2-time'),secs(l.endsAt-now)+'s');
  const k=l.id+':'+l.floor,prev=view.hp[l.lane];
  if(prev&&prev.k===k&&l.hp<prev.hp-.3&&now-(prev.at||0)>220){const dmg=document.createElement('b');dmg.className='tw2-dmg'+(l.buff?' tw2-dmg-crit':'');dmg.textContent='-'+fmt(Math.max(1,Math.round((prev.hp-l.hp)/100*l.maxHp)));
   card.querySelector('.tw2-guard')?.appendChild(dmg);setTimeout(()=>dmg.remove(),800);prev.at=now;
   if(scene.motion!==false)card.querySelector('.tw2-beast')?.animate?.([{translate:'0 0'},{translate:'-4px 0'},{translate:'3px 0'},{translate:'0 0'}],{duration:220});}
  view.hp[l.lane]={k,hp:l.hp,at:prev?.k===k?prev.at:0};}
 for(const f of t.fx||[]){if(view.seenFx.has(f.id))continue;view.seenFx.add(f.id);if(f.kind==='gift'&&now-f.at<2500)giftBurst(el,view,f,state,scene,esc);else if(f.kind==='bao'&&now-f.at<3000)baoBurst(el,f,state,esc);}
 for(const r of t.results||[]){if(view.seenRes.has(r.seq))continue;view.seenRes.add(r.seq);const card=el.querySelector(`.tw2-lane[data-lane="${r.lane}"]`)||el.querySelector('.tw2-grid');if(!card)continue;
  const d=document.createElement('div');d.className='tw2-result '+(r.won?'tw2-win':'tw2-lose');d.textContent=r.won?`✦ ${r.name} vượt tầng ${fmt(r.floor)} · +${fmt(r.qi)} tu vi${r.mile?' · MỐC ×2':''}`:`${r.name} dừng tầng ${fmt(r.floor)}${r.why==='down'?' · kiệt sức':''} · gõ 6 thử lại`;
  el.appendChild(d);setTimeout(()=>d.remove(),2600);
  if(r.won&&now-r.at<1600){if(r.mile&&scene.cinematicV2!==false&&scene.onCinematicSound)scene.onCinematicSound(t.id+':floor:'+r.seq,'resonance',0,{priority:3,gain:.66});else scene.onTowerSound?.(r.mile?'milestone':'clear');}}
}
