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
function entries(box,category,esc){
 if(!box?.items?.length)return `<span class="inv-empty">Chưa sở hữu</span>`;
 return `<div class="inv-list">${box.items.map(item=>{
  const i=typeof item==='string'?{name:item}:item;
  const stats=i.on?'CHỦ PHÁP BẢO':i.secondary?'TRỢ PHÁP BẢO (50%)':i.damage>0?'+'+fmt(i.damage)+' công lực':i.bonus>0?'Tu vi +'+Math.round(i.bonus*100)+'%':i.n?'×'+fmt(i.n):'';
  const stats2=i.damage>0&&i.bonus>0?('· +'+Math.round(i.bonus*100)+'% tu vi'):'';
  return `<div class="inv-item${i.on?' is-equipped':''}">${img(i,category,esc)}<span class="inv-item-info"><b>${esc(i.name||'Vật phẩm')}</b>${stats?`<small>${esc(stats)}${stats2?esc(stats2):''}</small>`:''}</span></div>`;
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
export class InventoryDeck{
 constructor(container,scene,esc){this.container=container;this.scene=scene;this.esc=esc;this.cards=[];this.timer=null;}
 show(event,player,now=performance.now()){
  if(!event?.card?.kind||!event?.user||!this.container)return false;
  this.cards=this.cards.filter(x=>x.until>now&&x.user!==event.user);
  this.cards.push({user:event.user,event,player,until:now+TTL_MS});
  if(this.cards.length>MAX_CARDS)this.cards.splice(0,this.cards.length-MAX_CARDS);
  this.render();
  this.schedule();
  return true;
 }
 render(){
  const node=this.container;if(!node)return;
  node.hidden=this.cards.length===0;
  if(!this.cards.length){node.replaceChildren();return;}
  node.dataset.count=String(this.cards.length);
  node.innerHTML=this.cards.map(x=>inventoryDeckHTML(x.event,this.esc)).join('');
  for(let i=0;i<this.cards.length;i++){
   const p=this.cards[i].player,slot=node.children[i]?.querySelector('.inv-portrait');
   if(!p||!slot)continue;
   const art=portraitCanvas(this.scene,p);if(!art)continue;
   const v=document.createElement('canvas');v.width=88;v.height=104;
   const c=v.getContext('2d');c.drawImage(art,0,0,88,104);
   slot.replaceWith(v);
  }
 }
 schedule(){
  clearTimeout(this.timer);
  if(!this.cards.length)return;
  const next=Math.min(...this.cards.map(x=>x.until));
  this.timer=setTimeout(()=>{
   const now=performance.now(),size=this.cards.length;
   this.cards=this.cards.filter(x=>x.until>now);
   if(size!==this.cards.length)this.render();
   this.schedule();
  },Math.max(40,next-performance.now()+25));
 }
 clear(){clearTimeout(this.timer);this.cards=[];this.render();}
}
