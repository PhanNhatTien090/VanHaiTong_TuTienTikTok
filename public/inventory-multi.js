// V3.5 inventory deck: multiple independent, read-only bag/pet/skin cards.
// All HTML updates are event-driven (no DOM reads or layout on the render loop).
import {portraitCanvas} from './linh-bai.js';
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const MAX_CARDS=4,TTL_MS=8100;
const fallback={artifact:'relic',pill:'elixir',manual:'book',pets:'spirit',skins:'robe',stones:'crystal'};
export function safeInventoryArt(item,category='artifact'){
 const input=String(item?.art||'');
 if(/^\/?assets\/[a-z0-9/_-]+\.(?:png|jpe?g|webp|svg)$/i.test(input))return input.startsWith('/')?input:'/'+input;
 const type=String(item?.icon||'').toLowerCase();
 const specialized={sword:'sword',swords:'sword',bell:'bell',orb:'orb',vase:'vase',cauldron:'cauldron',scroll:'scroll'};
 const kind=category==='artifact'?(specialized[type]||'relic'):category==='manual'?(specialized[type]||'book'):category==='pill'?'elixir':fallback[category]||'relic';
 return '/assets/ui-inventory/'+kind+'.svg';
}
const img=(item,category,esc)=>`<img class="inv-art" src="${esc(safeInventoryArt(item,category))}" width="42" height="42" alt="" loading="eager" decoding="async">`;
// V4: chỉ số = mức ĐÓNG GÓP THẬT vào nhân vật (engine: pháp bảo phụ tính 50% — extraStat). Đồ cất: chỉ số gốc + "cất".
export function itemStats(i,category='artifact'){
 if(category!=='artifact')return i.n?'×'+fmt(i.n):'';
 const share=i.on?1:i.secondary?.5:1,parts=[i.on?'CHỦ':i.secondary?'TRỢ ½':'cất'];
 if(i.damage>0)parts.push('+'+fmt(Math.round(i.damage*share))+' công lực');
 if(i.bonus>0)parts.push('+'+(Math.round(i.bonus*share*1000)/10).toLocaleString('vi-VN')+'% tu vi');
 return parts.length>1||i.on||i.secondary?parts.join(' · '):'';
}
// V4: mỗi mục tối đa N ô để 4 thẻ cùng lúc không bị cắt; phần dư cộng vào "+N vật phẩm khác".
const SHOW_LIMIT={artifact:6,pill:4,manual:4,pets:6,skins:6};
function entries(box,category,esc){
 const limit=SHOW_LIMIT[category]||6;if(box?.items?.length>limit)box={items:box.items.slice(0,limit),more:(box.more||0)+box.items.length-limit};
 if(!box?.items?.length)return `<span class="inv-empty">Chưa sở hữu</span>`;
 return `<div class="inv-list">${box.items.map(item=>{
  const i=typeof item==='string'?{name:item}:item;
  const stats=itemStats(i,category);
  return `<div class="inv-item${i.on?' is-equipped':i.secondary?' is-secondary':''}">${img(i,category,esc)}<span class="inv-item-info"><b>${esc(i.name||'Vật phẩm')}</b>${stats?`<small>${esc(stats)}</small>`:''}</span></div>`;
 }).join('')}${box.more?`<span class="inv-more">+ ${fmt(box.more)} vật phẩm khác</span>`:''}</div>`;
}
export function inventoryDeckHTML(e,esc){
 const card=e.card;
 if(!card?.kind)return '';
 let body='',title='',resource='';
 if(card.kind==='bag'){
  title='TÚI ĐỒ TU TIÊN';
  resource=`<div class="inv-resource">${img({},'stones',esc)}<span>${fmt(card.stones)} linh thạch</span><i>✦</i><span>${fmt(card.herbs)} linh thảo</span></div>`;
  body=`<section><h4>Pháp bảo & trang bị</h4>${entries(card.artifacts,'artifact',esc)}</section>
  <section><h4>Đan dược</h4>${entries(card.pills,'pill',esc)}</section>
  <section><h4>Bí pháp đã học</h4>${entries(card.manuals,'manual',esc)}</section>`;
 }else if(card.kind==='pets'){
  title='LINH THÚ CỦA ĐẠO HỮU';
  resource=`<div class="inv-resource">Đồng hành: ${esc(card.current||'Chưa có')}</div>`;
  body=`<section><h4>Linh thú đã thu phục</h4>${entries(card.owned,'pets',esc)}</section>`;
 }else if(card.kind==='skins'){
  title='TIÊN Y ĐÃ SỞ HỮU';
  resource=`<div class="inv-resource">Đang mặc: ${esc(card.current||'Áo cảnh giới')}</div>`;
  body=`<section><h4>Tủ skin</h4>${entries(card.owned,'skins',esc)}</section>`;
 }else return '';
 return `<article class="inv-card"><header><small>✦ ${title} ✦</small><strong>${esc(e.name||'Đạo hữu')}</strong></header><div class="inv-owner"><span class="inv-portrait" aria-hidden="true">✦</span>${resource}</div><div class="inv-sections">${body}</div><footer>${esc(card.tip||'')}</footer></article>`;
}
// V4 (14/11): hàng đợi công bằng + tạm dừng thật + DOM theo từng thẻ.
// - Tối đa 4 thẻ cùng lúc; người thứ 5+ vào hàng chờ (mỗi người 1 chỗ), hiện "N đạo hữu chờ xem túi" — không mất âm thầm.
// - Gõ lại khi đang hiện: chỉ cập nhật nội dung; gia hạn tối đa 2×TTL kể từ lúc hiện và KHÔNG gia hạn khi có người chờ.
// - Đột phá / đấu Ngũ Đường / chữ cảnh giới (CSS ẩn khung): đóng băng thời gian còn lại, xong cảnh mới chạy tiếp.
// - Chỉ thêm/bớt thẻ thay đổi; chân dung vẽ 1 lần cho mỗi thẻ. Không có gì chạy theo khung hình.
export const DECK_LIMITS=Object.freeze({active:MAX_CARDS,queue:16,ttl:TTL_MS,maxHold:TTL_MS*2,resume:2500,queuedTtl:6500});
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
  if(!event?.card?.kind||!event?.user||!this.container)return false;
  this.expire(now);
  const active=this.cards.find(x=>x.user===event.user);
  if(active){
   active.event=event;active.player=player;active.version++;this.stats.refreshed++;
   if(!this.queue.length&&!this.paused)active.until=Math.max(active.until,Math.min(now+DECK_LIMITS.ttl,active.shownAt+DECK_LIMITS.maxHold));
   this.render();this.schedule(now);return true;
  }
  const waiting=this.queue.find(x=>x.user===event.user);
  if(waiting){waiting.event=event;waiting.player=player;this.render();return true;}
  if(this.cards.length<DECK_LIMITS.active&&!this.queue.length){this.promote({user:event.user,event,player},now,DECK_LIMITS.ttl);}
  else if(this.queue.length<DECK_LIMITS.queue){this.queue.push({user:event.user,event,player,at:now});this.stats.queued++;}
  else{this.stats.dropped++;return false;}
  this.render();this.schedule(now);return true;
 }
 promote(x,now,ttl){this.cards.push({user:x.user,event:x.event,player:x.player,shownAt:now,until:now+ttl,version:0,...(this.paused?{left:ttl}:{})});this.stats.shown++;}
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
  for(const x of this.cards){x.until=now+Math.max(x.left??0,DECK_LIMITS.resume);x.shownAt=now-(DECK_LIMITS.ttl-Math.max(x.left??0,DECK_LIMITS.resume));delete x.left;}
  if(this.expire(now))this.render();this.schedule(now);
 }
 cardNode(x){
  const html=inventoryDeckHTML(x.event,this.esc);
  const holder=this.doc.createElement('div');holder.innerHTML=html;const node=holder.firstElementChild;if(!node)return null;
  const slot=node.querySelector?.('.inv-portrait'),art=x.player&&slot?portraitCanvas(this.scene,x.player):null;
  if(art){const v=this.doc.createElement('canvas');v.width=88;v.height=104;v.getContext('2d')?.drawImage(art,0,0,88,104);slot.replaceWith(v);}
  return node;
 }
 render(){
  const node=this.container;if(!node)return;
  node.hidden=this.cards.length===0;node.dataset.count=String(this.cards.length);node.dataset.waiting=String(this.queue.length);
  if(!this.doc?.createElement){node.innerHTML=this.cards.map(x=>inventoryDeckHTML(x.event,this.esc)).join('');return;}
  const keep=new Set(this.cards.map(x=>x.user));
  for(const [user,entry] of this.nodes)if(!keep.has(user)){entry.node.remove();this.nodes.delete(user);}
  for(const x of this.cards){
   let entry=this.nodes.get(x.user);
   if(!entry||entry.version!==x.version||entry.event!==x.event){const fresh=this.cardNode(x);if(!fresh)continue;if(entry)entry.node.replaceWith(fresh);entry={node:fresh,version:x.version,event:x.event};this.nodes.set(x.user,entry);}
   if(entry.node.parentNode!==node||entry.node!==node.children[this.cards.indexOf(x)])node.insertBefore(entry.node,node.children[this.cards.indexOf(x)]||null);
  }
  if(this.queue.length){
   if(!this.badge){this.badge=this.doc.createElement('div');this.badge.className='inv-queue';}
   this.badge.textContent='⏳ '+this.queue.length+' đạo hữu chờ xem túi';
   if(this.badge.parentNode!==node||node.lastElementChild!==this.badge)node.appendChild(this.badge);
  }else this.badge?.remove();
 }
 schedule(now=performance.now()){
  clearTimeout(this.timer);this.timer=null;
  if(this.paused||!this.cards.length)return;
  const next=Math.min(...this.cards.map(x=>x.until));
  this.timer=setTimeout(()=>{const t=performance.now();if(this.expire(t))this.render();this.schedule(t);},Math.max(40,next-now+25));
  this.timer.unref?.();
 }
 clear(){clearTimeout(this.timer);this.timer=null;this.cards=[];this.queue=[];this.render();}
}
