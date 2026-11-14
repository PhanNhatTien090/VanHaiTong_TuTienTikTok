// 11/11/2026: VÂN HẢI THÁP — khung đài thử thách giữa cảnh khi sự kiện mở (server: tower.mjs).
// Không lag: toàn bộ là HTML + ảnh tĩnh có sẵn (đài trăng arena-v1, thủ vệ cắt từ events-v1/celestial-bosses-v1.png bằng CSS),
// chân dung người leo lấy từ cache viền sáng của Linh Bài; rung/số sát thương chỉ là lớp CSS ngắn, tối đa 4 số/giây.
import {portraitCanvas} from './linh-bai.js';
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const mounted=new WeakMap();
function secs(ms){return Math.max(0,Math.ceil(ms/1000));}
export function towerHTML(t,now,esc,{staticVitals=false}={}){
 if(!t)return '';
 if(!t.active&&t.result){const top=t.result.top||[];
  return `<div class="tw-ribbon"><span>✦ VÂN HẢI THÁP KHÉP CỬA ✦</span></div><div class="tw-podium">${top.length?top.map((r,i)=>`<div class="tw-pod tw-pod${i+1}"><i>${i+1}</i><strong>${esc(r.name)}</strong><span>tầng ${fmt(r.floor)}</span></div>`).join(''):'<div class="tw-empty">Chưa ai vượt tầng · lượt sau gõ 6 vào tháp</div>'}</div>`;}
 const c=t.cur,g=c?.guardian;
 const head=c?`TẦNG ${fmt(c.floor)} · ${esc(g.name)}`:'VÂN HẢI THÁP';
 const sub=c?`<b>${esc(c.name)}</b> gõ <u>3</u> đánh · người khác gõ <u>3</u> trợ lực${c.helpers?` <em>· ${c.helpers} trợ lực</em>`:''}`:`Đài trống · gõ <u>6</u> vào tháp`;
 const left=c&&!staticVitals?secs(c.endsAt-now):0,hp=staticVitals?0:c?.hp;
 const q=t.queue?.length?`Chờ lượt: ${t.queue.map(esc).join(' · ')}${t.queued>t.queue.length?` +${t.queued-t.queue.length}`:''}`:'Chưa ai chờ · gõ 6 xếp lượt';
 const last=t.last?(t.last.won?`<div class="tw-result tw-win">✦ ${esc(t.last.name)} vượt tầng ${fmt(t.last.floor)} · +${fmt(t.last.qi)} tu vi${t.last.mile?' · MỐC ×2':''}</div>`:`<div class="tw-result tw-lose">${esc(t.last.name)} dừng ở tầng ${fmt(t.last.floor)} · gõ 6 thử lại</div>`):'';
 return `<div class="tw-ribbon"><span>✦ ${head} ✦</span></div>
<div class="tw-arena">
 <div class="tw-side tw-climber">${c?'<i class="tw-slot"></i>':''}${c?`<small>${esc(c.name)}</small>`:''}</div>
 <div class="tw-vs">${c?'VS':''}</div>
 <div class="tw-side tw-guard">${c?`<div class="tw-beast" style="--art:${g.art};--hue:${g.hue}deg"></div><small>${esc(g.name)}</small>`:''}</div>
 ${last}
</div>
${c?`<div class="tw-bars"><div class="tw-hp"><i style="width:${Math.max(0,Math.min(100,hp)).toFixed(1)}%"></i><span>Thủ vệ ${Math.ceil(hp)}%</span></div><div class="tw-time"><i style="width:${Math.max(0,Math.min(100,left/25*100)).toFixed(1)}%"></i><span>${left}s</span></div></div>`:''}
<div class="tw-line">${sub}</div>
<div class="tw-meta"><span>${q}</span>${c?`<span>Mốc kế: tầng ${fmt(c.next)} · thưởng ×2</span>`:''}<span class="tw-clock">Tháp đóng sau ${staticVitals?0:secs(t.endsAt-now)}s</span></div>`;
}
function setText(node,text){if(node&&node.textContent!==text)node.textContent=text;}
function setWidth(node,value){if(node&&node.style.width!==value)node.style.width=value;}

export function renderTower(el,state,scene,esc,now=Date.now()){
 if(!el)return;
 const t=state?.tower;
 if(!t){
  if(!el.hidden){el.hidden=true;el.replaceChildren();document.body.classList.remove('tower-on');}
  const view=mounted.get(el);clearTimeout(view?.flare);view?.shake?.cancel();el.classList.remove('tw-flash');
  mounted.delete(el);
  return;
 }
 const cur=t.active?t.cur:null,live=t.active;
 const html=towerHTML(t,now,esc,{staticVitals:true});
 const portraitId=cur?.id??null;
 let view=mounted.get(el);
 if(!view||view.id!==t.id){
  clearTimeout(view?.flare);view?.shake?.cancel();el.classList.remove('tw-flash');
  view={id:t.id,html:null,hp:100,floatAt:-Infinity,resultSeq:null};
  mounted.set(el,view);
 }
 if(view.html!==html||view.slotOwner!==portraitId){
  el.innerHTML=html;view.html=html;view.slotOwner=portraitId;
  const $=selector=>el.querySelector(selector);
  const previous=view.nodes;
  view.nodes={
   slot:$('.tw-slot'),hp:$('.tw-hp span'),hpBar:$('.tw-hp i'),time:$('.tw-time span'),
   timeBar:$('.tw-time i'),clock:$('.tw-clock'),guard:$('.tw-guard')
  };
  if(previous?.portrait&&portraitId===view.portraitId&&view.nodes.slot){
   view.nodes.slot.replaceWith(previous.portrait);
   view.nodes.portrait=previous.portrait;view.nodes.slot=null;
  }
 }
 const n=view.nodes;
 if(n.slot&&cur){
  const player=state.players?.find(x=>x.id===cur.id),art=player&&portraitCanvas(scene,player);
  if(art){
   const canvas=document.createElement('canvas');
   canvas.width=art.width;canvas.height=art.height;
   canvas.getContext('2d').drawImage(art,0,0);
   n.slot.replaceWith(canvas);n.slot=null;n.portrait=canvas;view.portraitId=cur.id;
  }
 }
 if(el.hidden){el.hidden=false;document.body.classList.add('tower-on');}
 if(live&&n.clock)setText(n.clock,'Tháp đóng sau '+secs(t.endsAt-now)+'s');
 if(cur){
  const left=secs(cur.endsAt-now);
  setText(n.hp,'Thủ vệ '+Math.ceil(cur.hp)+'%');
  setWidth(n.hpBar,Math.max(0,Math.min(100,cur.hp)).toFixed(1)+'%');
  setText(n.time,left+'s');
  setWidth(n.timeBar,Math.max(0,Math.min(100,left/25*100)).toFixed(1)+'%');
 }
 const currentKey=cur?cur.id+':'+cur.floor:null;
 if(cur&&currentKey===view.currentKey&&cur.hp<view.hp-.4&&now-view.floatAt>250&&n.guard){
  view.floatAt=now;
  if(scene.motion!==false){
   view.shake?.cancel();
   view.shake=n.guard.querySelector('.tw-beast')?.animate?.([
    {translate:'0 0'},{translate:'-5px 0'},{translate:'4px 0'},{translate:'0 0'}
   ],{duration:230,easing:'ease-out'});
  }
  const damage=document.createElement('b');
  damage.className=scene.motion===false?'tw-dmg tw-dmg-static':'tw-dmg';damage.textContent='-'+Math.max(1,Math.round(view.hp-cur.hp));
  n.guard.appendChild(damage);setTimeout(()=>damage.remove(),700);
 }
 view.currentKey=currentKey;view.hp=cur?.hp??100;
 if(t.last&&t.last.seq!==view.resultSeq){
  view.resultSeq=t.last.seq;
  if(t.last.won&&now-t.last.at>=0&&now-t.last.at<1600){
   if(t.last.mile&&scene.cinematicV2!==false&&scene.onCinematicSound){
    scene.onCinematicSound(t.id+':floor:'+t.last.seq,'resonance',0,{priority:3,gain:.66});
   }else scene.onTowerSound?.(t.last.mile?'milestone':'clear');
   if(!scene.reduceFlash){
    clearTimeout(view.flare);
    el.classList.add('tw-flash');
    view.flare=setTimeout(()=>el.classList.remove('tw-flash'),700);
   }
  }
 }
}
