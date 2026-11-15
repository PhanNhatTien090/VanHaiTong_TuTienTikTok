// 15/11/2026: BẢNG XEM — tu vi · túi đồ · linh thú · skin (kế hoạch BANG-XEM-PLAN-2026-11-15.md).
// Bảng hiện GIỮA màn (to) → bay ra 1 trong 4 GÓC → mờ dần. Tối đa 4 bảng cùng lúc, người thứ 5+ xếp hàng.
// Gọn: ít chữ, ảnh vật phẩm to (ảnh thật từ item-thumbs.js), chữ to. Chuyển động chỉ bằng CSS transform/opacity,
// HTML dựng theo sự kiện (không chạy gì theo khung hình).
import {portraitCanvas} from './linh-bai.js';
import {realmWithStage} from './realm-stage.js';
import {paintThumb,THUMB} from './item-thumbs.js';
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const MAX_CARDS=4,TTL_MS=8100,CENTER_MS=1600,STAGGER_MS=250,LEAVE_MS=320,CELLS=6;
const fallback={artifact:'relic',pill:'elixir',manual:'book',pets:'spirit',skins:'robe',stones:'crystal'};
export function safeInventoryArt(item,category='artifact'){
 const input=String(item?.art||'');
 if(/^\/?assets\/[a-z0-9/_-]+\.(?:png|jpe?g|webp|svg)$/i.test(input))return input.startsWith('/')?input:'/'+input;
 const type=String(item?.icon||'').toLowerCase();
 const specialized={sword:'sword',swords:'sword',bell:'bell',orb:'orb',vase:'vase',cauldron:'cauldron',scroll:'scroll'};
 const kind=category==='artifact'?(specialized[type]||'relic'):category==='manual'?(specialized[type]||'book'):category==='pill'?'elixir':fallback[category]||'relic';
 return '/assets/ui-inventory/'+kind+'.svg';
}
// Chỉ số đóng góp thật (pháp bảo phụ 50%). Bảng gọn không in nữa, giữ cho trang quản lý/test.
export function itemStats(i,category='artifact'){
 if(category!=='artifact')return i.n?'×'+fmt(i.n):'';
 const share=i.on?1:i.secondary?.5:1,parts=[i.on?'CHỦ':i.secondary?'TRỢ ½':'cất'];
 if(i.damage>0)parts.push('+'+fmt(Math.round(i.damage*share))+' công lực');
 if(i.bonus>0)parts.push('+'+(Math.round(i.bonus*share*1000)/10).toLocaleString('vi-VN')+'% tu vi');
 return parts.length>1||i.on||i.secondary?parts.join(' · '):'';
}
const KIND_LABEL={tuvi:'Tu vi',bag:'Túi đồ',pets:'Linh thú',skins:'Skin',dao:'Đạo Thống',guild:'Bang hội'};
export const cardKind=card=>card?.kind&&KIND_LABEL[card.kind]?card.kind:card&&card.realmName!=null?'tuvi':null;
const thumbKind={artifact:'artifact',pets:'pet',skins:'skin'};
function cell(i,category,esc){
 const item=typeof i==='string'?{name:i}:i;
 const thumb=item.id&&thumbKind[category]?` data-thumb="${thumbKind[category]}:${esc(item.id)}"`:'';
 const n=category==='pill'&&item.n>1?`<em class="vd-n">×${fmt(item.n)}</em>`:'';
 const refine=category==='artifact'&&item.refinement>0?`<em class="vd-n">+${Math.min(3,item.refinement)}</em>`:'';
 const tag=item.on?`<em class="vd-tag">${category==='artifact'?'đeo':category==='pets'?'theo':'mặc'}</em>`:item.secondary?'<em class="vd-tag is-sub">phụ</em>':'';
 return `<div class="vd-cell${item.on?' is-on':item.secondary?' is-sub':''}"><span class="vd-pic">${thumb?`<canvas width="${THUMB}" height="${THUMB}"${thumb}></canvas>`:''}<img src="${esc(safeInventoryArt(item,category))}" alt="" decoding="async">${n}${refine}${tag}</span><span class="vd-cap">${esc(item.name||'Vật phẩm')}</span></div>`;
}
// 15/11 (user): HIỆN HẾT món — nhiều món thì thêm cột cho ô nhỏ lại (3→4→5→6 cột), bảng không cao quá ô góc.
// Chỉ khi máy chủ cắt bớt (quá nhiều) mới có ô "+N".
export const gridCols=n=>n<=6?3:n<=12?4:n<=20?5:6;
function grid(groups,esc,empty){
 const all=[];let more=0;
 for(const [box,category] of groups){for(const i of box?.items||[])all.push([i,category]);more+=box?.more||0;}
 if(!all.length&&!more)return `<p class="vd-empty">${empty}</p>`;
 const cols=gridCols(all.length+(more?1:0));
 return `<div class="vd-grid" data-cols="${cols}">${all.map(([i,c])=>cell(i,c,esc)).join('')}${more>0?`<div class="vd-cell vd-more"><span class="vd-pic"><b>+${fmt(more)}</b></span><span class="vd-cap">món khác</span></div>`:''}</div>`;
}
const pct=(a,b)=>Math.max(0,Math.min(100,(Number(a)||0)/Math.max(1,Number(b)||1)*100));
// Số gọn: 6.420.000 → 6,42tr (giữ đủ thông tin, bớt chữ).
export const short=n=>{n=Math.floor(Number(n)||0);const a=Math.abs(n),f=(v,u)=>(Math.round(v*100)/100).toLocaleString('vi-VN')+u;return a>=1e9?f(n/1e9,'tỷ'):a>=1e6?f(n/1e6,'tr'):a>=1e4?f(n/1e3,'k'):n.toLocaleString('vi-VN');};
function tuviBody(c){
 const p=pct(c.qi,c.needQi),ps=pct(c.stones,c.needStones),qiShort=Math.max(0,(c.needQi||0)-(c.qi||0)),stonesShort=Math.max(0,(c.needStones||0)-(c.stones||0));
 const state=!c.next?'<b class="vd-ready">ĐỈNH TU TIÊN</b>':c.ready?`<b class="vd-ready">ĐỦ ĐỘT PHÁ → ${c.next}</b>`:qiShort?`<span class="vd-next">→ ${c.next}</span>`:`<span class="vd-short">thiếu ${fmt(stonesShort)} linh thạch · gõ hái</span>`;
 return {p,ps,qiShort,stonesShort,state};
}
export function inventoryDeckHTML(e,esc){
 const card=e.card,kind=cardKind(card);
 if(!kind)return '';
 let body='';
 if(kind==='tuvi'){
  const {p,ps,qiShort,stonesShort,state}=tuviBody({...card,next:card.next&&esc(card.next)});
  const bar=(cls,label,k,a,b,lack)=>`<div class="vd-stat ${cls}${lack?'':' is-full'}"><label>${label}</label><div class="vd-bar"><i style="width:${k.toFixed(1)}%"></i><span>${short(a)} / ${short(b)}${lack?'':' ✓'}</span></div></div>`;
  body=`<div class="vd-tuvi-body"><span class="vd-portrait" aria-hidden="true"></span><div class="vd-tuvi-info"><strong class="vd-realm">${esc(realmWithStage(card.realmName,card.stage))}</strong>${card.next?bar('vd-qi','Tu vi',p,card.qi,card.needQi,qiShort)+bar('vd-stone','Linh thạch',ps,card.stones,card.needStones,stonesShort):''}<div class="vd-state">${state}</div><div class="vd-rank">Hạng <b>#${fmt(card.rank)}</b> / ${fmt(card.players)}</div></div></div>`;
 }else if(kind==='dao'){
  const id=['sword','demon','body','beast','alchemy'].includes(card.path)?card.path:null;
  const pathLabel=esc(card.pathName||'Chưa chọn Đạo Thống'),level=Math.max(0,Math.min(5,Number(card.level)||0)),score=fmt(Math.max(0,Number(card.insight)||0));
  const next=[0,15,40,80,140][level]??140;
  const lines=(card.paths||[]).slice(0,5).map(v=>`<span style="font-weight:700;font-size:13px;color:#eeddb8">${esc(v.name||'')}</span>`).join(' · ');
  body=`<div class="vd-chips"><span>✦ ${pathLabel}</span><span>Cấp ${level||'—'} · ${score} Đạo Ngộ</span></div>`
    +(id?`<div style="display:flex;align-items:center;justify-content:center;gap:14px;min-height:110px"><img src="/assets/live2-paths/${id}.svg" width="104" height="104" alt="" decoding="async"><div style="font-size:18px;font-weight:700;color:#f9dda5">${esc(card.pathName)}<small style="display:block;font-size:13px;color:#cbd3e5;font-weight:500">${level<5?`Mốc tiếp: ${next} Đạo Ngộ`:'Đạo Ngộ Đại Thành'}<br>Hôm nay ${fmt(card.progress)} / ${fmt(card.maxDaily)}</small></div></div>`:`<div style="text-align:center;padding:10px"><b>CHỌN CON ĐƯỜNG TU</b><p style="font-size:14px">Gõ chọn đạo kiếm, ma, thể, thú hoặc đan từ Trúc Cơ.</p></div>`)
    +`<div style="text-align:center;padding:4px 12px 8px;font-size:13px;color:#d8cbad">${lines}</div>`;
 }else if(kind==='guild'){
  const top=Array.isArray(card.top)?card.top.slice(0,5):null;
  const badge='<img src="/assets/live2-paths/guild.svg" width="90" height="90" alt="" decoding="async">';
  if(top){
   body='<div class="vd-chips"><span>⚔ THIÊN BẢNG BANG HỘI</span></div>'+badge
    +'<ol style="margin:0 12px 8px;padding-left:20px;font-size:14px;line-height:1.65">'
    +top.map(g=>`<li><b>${esc(g.name||'Bang hội')}</b> · ${fmt(g.points)} điểm · ${fmt(g.members)} thành viên</li>`).join('')+'</ol>';
  }else{
   const claimed=Math.max(0,Number(card.points||0)-Number(card.spentPoints||0));
   const leaders=[card.leader?'Hội Chủ: '+card.leader:'',card.deputy?'Phó Hội: '+card.deputy:''].filter(Boolean);
   const elders=(card.elders||[]).slice(0,2);
   const roster=(card.roster||[]).slice(0,6);
   body=`<div class="vd-chips"><span>#${esc(card.id||'---')} · ${fmt(card.members)}/${fmt(card.capacity)} thành viên</span><span>Đại Điện +${fmt(card.hallLevel||0)}</span></div>`
    +`<div style="display:flex;align-items:center;gap:8px;min-height:90px"><div>${badge}</div><div style="min-width:0;color:#f6dfab;font-weight:800;font-size:17px;overflow-wrap:anywhere">${esc(card.name||'Bang hội')}<small style="display:block;color:#d1d9eb;font-weight:500;font-size:12px">${leaders.map(esc).join(' · ')}</small></div></div>`
    +`<div class="vd-chips"><span>✦ ${fmt(card.points)} cống hiến</span><span>${fmt(claimed)} khả dụng</span></div>`
    +(elders.length?`<div style="font-size:13px;text-align:center;color:#e8d6aa">Trưởng Lão: ${elders.map(esc).join(' · ')}</div>`:'')
    +(roster.length?`<div style="font-size:12px;text-align:center;line-height:1.45;color:#d2dfed">Đồng môn: ${roster.map(esc).join(' · ')}</div>`:'');
  }
 }else if(kind==='bag'){
  body=`<div class="vd-chips"><span><img src="/assets/ui-inventory/crystal.svg" alt="">${fmt(card.stones)} linh thạch</span><span>🌿 ${fmt(card.herbs)} linh thảo</span>${card.daoPath?`<span>✦ ${esc(card.daoPath.name)} · Đạo Ngộ ${fmt(card.daoPath.insight)}</span>`:''}</div>`
   +grid([[card.artifacts,'artifact'],[card.pills,'pill'],[card.live2Pills,'pill'],[card.manuals,'manual']],esc,'Túi trống');
 }else if(kind==='pets'){
  const has=(card.owned?.items?.length||0)+(card.owned?.more||0);
  body=`<div class="vd-chips"><span>Đã có ${fmt(has)}/${fmt(card.total)}</span>${card.current?`<span>Theo: ${esc(card.current)}</span>`:''}</div>`+grid([[card.owned,'pets']],esc,'Chưa có linh thú');
 }else{
  const has=(card.owned?.items?.length||0)+(card.owned?.more||0);
  body=`<div class="vd-chips"><span>Đã có ${fmt(has)}</span><span>Mặc: ${esc(card.current||'Áo cảnh giới')}</span></div>`+grid([[card.owned,'skins']],esc,'Chưa có skin riêng');
 }
 return `<article class="vd-card vd-${kind}"><header><strong>${esc(e.name||'Đạo hữu')}</strong><small>${KIND_LABEL[kind]}</small></header>${body}</article>`;
}
// Hàng đợi công bằng + tạm dừng thật + DOM theo từng thẻ (giữ từ V4, 14/11).
// - Tối đa 4 thẻ; người thứ 5+ vào hàng chờ (mỗi người 1 chỗ), hiện "N đạo hữu chờ xem".
// - Gõ lại khi đang hiện: đổi nội dung tại chỗ, không bay lại vào giữa; gia hạn tối đa 2×TTL, không gia hạn khi có người chờ.
// - Đột phá / đấu Ngũ Đường / chữ cảnh giới (CSS ẩn khung): đóng băng thời gian còn lại.
// - 15/11: mỗi thẻ giữ 1 ô góc (0 trên trái · 1 trên phải · 2 dưới trái · 3 dưới phải). Hai thẻ cùng lúc thì thẻ sau
//   chờ thẻ trước rời giữa màn mới hiện (introAt), để không chồng nhau ở giữa.
export const DECK_LIMITS=Object.freeze({active:MAX_CARDS,queue:16,ttl:TTL_MS,maxHold:TTL_MS*2,resume:2500,queuedTtl:6500,center:CENTER_MS,stagger:STAGGER_MS});
export const DECK_PAUSE_CLASSES=Object.freeze(['ritual-active','hall-dueling','breakthrough-title-active','ascension-stage']);
export class InventoryDeck{
 constructor(container,scene,esc,{doc=globalThis.document,observe=true}={}){
  this.container=container;this.scene=scene;this.esc=esc;this.doc=doc;this.cards=[];this.queue=[];this.timer=null;this.paused=false;
  this.nodes=new Map();this.badge=null;this.stats={shown:0,queued:0,dropped:0,refreshed:0};
  const body=doc?.body;
  if(observe&&body&&typeof MutationObserver!=='undefined'){
   const check=()=>this.setPaused(DECK_PAUSE_CLASSES.some(c=>body.classList.contains(c)));
   this.observer=new MutationObserver(check);this.observer.observe(body,{attributes:true,attributeFilter:['class']});check();
  }
 }
 show(event,player,now=performance.now()){
  if(!cardKind(event?.card)||!event?.user||!this.container)return false;
  this.expire(now);
  const active=this.cards.find(x=>x.user===event.user);
  if(active){
   active.event=event;active.player=player;active.version++;this.stats.refreshed++;
   if(!this.queue.length&&!this.paused)active.until=Math.max(active.until,Math.min(now+DECK_LIMITS.ttl,active.shownAt+DECK_LIMITS.maxHold));
   this.render(now);this.schedule(now);return true;
  }
  const waiting=this.queue.find(x=>x.user===event.user);
  if(waiting){waiting.event=event;waiting.player=player;this.render(now);return true;}
  if(this.cards.length<DECK_LIMITS.active&&!this.queue.length){this.promote({user:event.user,event,player},now,DECK_LIMITS.ttl);}
  else if(this.queue.length<DECK_LIMITS.queue){this.queue.push({user:event.user,event,player,at:now});this.stats.queued++;}
  else{this.stats.dropped++;return false;}
  this.render(now);this.schedule(now);return true;
 }
 freeSlot(){const used=new Set(this.cards.map(x=>x.slot));for(let i=0;i<MAX_CARDS;i++)if(!used.has(i))return i;return 0;}
 promote(x,now,ttl){
  // Thẻ trước còn đang ở giữa màn → thẻ này đợi nó bắt đầu bay đi (chồng nhẹ 0,25 s cho liền mạch).
  const lastCenter=Math.max(0,...this.cards.map(c=>c.introAt+DECK_LIMITS.center));
  const introAt=Math.max(now,lastCenter-DECK_LIMITS.stagger);
  this.cards.push({user:x.user,event:x.event,player:x.player,slot:this.freeSlot(),introAt,shownAt:introAt,until:introAt+ttl,version:0,...(this.paused?{left:introAt-now+ttl}:{})});this.stats.shown++;
 }
 expire(now){
  if(this.paused)return false;
  const size=this.cards.length;this.cards=this.cards.filter(x=>x.until>now);
  let changed=size!==this.cards.length;
  while(this.cards.length<DECK_LIMITS.active&&this.queue.length){this.promote(this.queue.shift(),now,this.queue.length?DECK_LIMITS.queuedTtl:DECK_LIMITS.ttl);changed=true;}
  return changed;
 }
 setPaused(on,now=performance.now()){
  on=!!on;if(on===this.paused)return;
  if(on){for(const x of this.cards)x.left=Math.max(0,x.until-now);clearTimeout(this.timer);this.timer=null;this.paused=true;return;}
  this.paused=false;
  for(const x of this.cards){const left=Math.max(x.left??0,DECK_LIMITS.resume);x.until=now+left;x.shownAt=now-(DECK_LIMITS.ttl-left);x.introAt=Math.min(x.introAt,now-DECK_LIMITS.center);delete x.left;}
  if(this.expire(now))this.render(now);this.schedule(now);
 }
 cardNode(x){
  const html=inventoryDeckHTML(x.event,this.esc);
  const holder=this.doc.createElement('div');holder.innerHTML=html;const node=holder.firstElementChild;if(!node)return null;
  const slot=node.querySelector?.('.vd-portrait'),art=x.player&&slot?portraitCanvas(this.scene,x.player):null;
  if(art){const v=this.doc.createElement('canvas');v.width=art.width;v.height=art.height;v.getContext('2d')?.drawImage(art,0,0);v.className='vd-portrait';slot.replaceWith(v);}
  for(const canvas of node.querySelectorAll?.('canvas[data-thumb]')||[]){
   const [kind,...id]=canvas.dataset.thumb.split(':');
   if(!paintThumb(canvas,{kind,id:id.join(':')},this.scene,x.player||{}))canvas.remove();
  }
  return node;
 }
 // 15/11: 2 cột trái/phải (ô 0,2 trái · 1,3 phải) — thẻ dưới tự xếp ngay dưới thẻ trên, thẻ cao không đè nhau.
 column(slot){
  const node=this.container;if(typeof node?.querySelector!=='function'||!this.doc?.createElement)return node;
  this.cols??=['left','right'].map(side=>{const c=this.doc.createElement('div');c.className='vd-col vd-col-'+side;node.appendChild(c);return c;});
  return this.cols[slot%2];
 }
 // Vị trí giữa màn so với ô góc: đọc kích thước 1 lần lúc thẻ xuất hiện (theo sự kiện, không theo khung hình).
 centerOffset(node){
  const box=this.container,W=box.clientWidth||0,H=box.clientHeight||0;
  if(!W||!H||!node.offsetWidth)return null;
  const r=node.getBoundingClientRect?.(),b=box.getBoundingClientRect?.();
  const cx=r&&b?r.left-b.left+r.width/2:node.offsetLeft+node.offsetWidth/2,cy=r&&b?r.top-b.top+r.height/2:node.offsetTop+node.offsetHeight/2;
  return {dx:W/2-cx,dy:H*.4-cy};
 }
 phase(entry,x,now){
  const n=entry.node;if(!n.classList)return;
  n.dataset.slot=String(x.slot);
  if(now<x.introAt){n.classList.add('vd-wait');return;}
  if(n.classList.contains('vd-wait')||!entry.placed){
   entry.placed=true;n.classList.remove('vd-wait');
   const o=this.centerOffset(n);
   if(o&&now<x.introAt+DECK_LIMITS.center){
    n.style.setProperty('--vd-dx',o.dx.toFixed(0)+'px');n.style.setProperty('--vd-dy',o.dy.toFixed(0)+'px');
    n.classList.add('vd-enter','vd-center');void n.offsetWidth;n.classList.remove('vd-enter');
   }
  }
  if(now>=x.introAt+DECK_LIMITS.center)n.classList.remove('vd-center');
 }
 render(now=performance.now()){
  const node=this.container;if(!node)return;
  node.hidden=this.cards.length===0&&!this.leaving;node.dataset.count=String(this.cards.length);node.dataset.waiting=String(this.queue.length);
  if(!this.doc?.createElement){node.innerHTML=this.cards.map(x=>inventoryDeckHTML(x.event,this.esc)).join('');return;}
  const keep=new Set(this.cards.map(x=>x.user));
  for(const [user,entry] of this.nodes)if(!keep.has(user)){
   this.nodes.delete(user);const n=entry.node;
   if(n.classList){n.classList.add('vd-leave');this.leaving=(this.leaving||0)+1;setTimeout(()=>{n.remove();this.leaving--;if(!this.cards.length&&!this.leaving)node.hidden=true;},LEAVE_MS);}else n.remove();
  }
  for(const x of this.cards){
   let entry=this.nodes.get(x.user);
   if(!entry||entry.version!==x.version||entry.event!==x.event){
    const fresh=this.cardNode(x);if(!fresh)continue;
    if(entry){
     // Gõ lại: thay tại chỗ, giữ nguyên vị trí/pha, nháy viền.
     const old=entry.node;if(fresh.classList&&old.classList){for(const c of ['vd-center','vd-wait'])if(old.classList.contains(c))fresh.classList.add(c);fresh.style.cssText=old.style.cssText;fresh.dataset.slot=old.dataset.slot;}
     old.replaceWith(fresh);if(fresh.classList&&entry.placed)fresh.classList.add('vd-pulse');
     entry={node:fresh,version:x.version,event:x.event,placed:entry.placed};
    }else{entry={node:fresh,version:x.version,event:x.event,placed:false};this.column(x.slot).appendChild(fresh);}
    this.nodes.set(x.user,entry);
   }
   const col=this.column(x.slot);if(entry.node.parentNode!==col)col.appendChild(entry.node);
   // Trong cột: ô trên (0/1) luôn đứng trước ô dưới (2/3).
   if(col!==node&&x.slot<2&&col.firstElementChild!==entry.node)col.insertBefore(entry.node,col.firstElementChild);
   this.phase(entry,x,now);
  }
  if(this.queue.length){
   if(!this.badge){this.badge=this.doc.createElement('div');this.badge.className='inv-queue';}
   this.badge.textContent='⏳ '+this.queue.length+' đạo hữu chờ xem';
   if(this.badge.parentNode!==node||node.lastElementChild!==this.badge)node.appendChild(this.badge);
  }else this.badge?.remove();
 }
 schedule(now=performance.now()){
  clearTimeout(this.timer);this.timer=null;
  if(this.paused||!this.cards.length)return;
  const marks=[];for(const x of this.cards){marks.push(x.until);if(x.introAt>now)marks.push(x.introAt);if(x.introAt+DECK_LIMITS.center>now)marks.push(x.introAt+DECK_LIMITS.center);}
  const next=Math.min(...marks);
  this.timer=setTimeout(()=>{const t=performance.now();this.expire(t);this.render(t);this.schedule(t);},Math.max(40,next-now+25));
  this.timer.unref?.();
 }
 clear(){clearTimeout(this.timer);this.timer=null;this.cards=[];this.queue=[];this.render();}
}
