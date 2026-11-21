// 15/11/2026: BẢNG XEM — tu vi · túi đồ · linh thú · skin (kế hoạch docs/ghi-chu/BANG-XEM-PLAN-2026-11-15.md).
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
// 18/11 (chủ game: "lệnh nào gõ xem mà không hiện bảng thì làm bảng, gộp được thì gộp"):
//   tuvi + nhiệm vụ · skin + cánh · thần khí + bản mệnh (bao) · chiêu + bí pháp (kit) · linhchau + toaky (mounts).
const KIND_LABEL={titles:'Danh hiệu',tuvi:'Tu vi',bag:'Túi đồ',pets:'Linh thú',skins:'Skin · Cánh',wings:'Cánh',mounts:'Tọa kỹ',bao:'Thần khí',kit:'Chiêu thức'};
const NUMBERED={mounts:'cưỡi',bao:'bản mệnh',wings:'đeo'}; // ô có SỐ (gõ lệnh + số) + sao + viền theo bậc
const hintHTML=(cmd,rest)=>`<div class="vd-state">gõ <b>${cmd}</b> ${rest}</div>`;
export const cardKind=card=>card?.kind&&KIND_LABEL[card.kind]?card.kind:card&&card.realmName!=null?'tuvi':null;
const thumbKind={artifact:'artifact',pets:'pet',skins:'skin'};
function cell(i,category,esc){
 const raw=typeof i==='string'?{name:i}:i;
 const item=category==='pets'&&raw.level?{...raw,name:raw.name+' · Lv'+raw.level}:raw;
 const thumb=item.id&&thumbKind[category]?` data-thumb="${thumbKind[category]}:${esc(item.id)}"${category==='pets'?` data-pet-stage="${esc(String(item.stage||0))}"`:''}`:'';
 const n=category==='pill'&&item.n>1?`<em class="vd-n">×${fmt(item.n)}</em>`:'';
 const tag=item.on?`<em class="vd-tag">${category==='artifact'?'đeo':category==='pets'?'theo':NUMBERED[category]||'mặc'}</em>`:item.secondary?'<em class="vd-tag is-sub">phụ</em>':'';
 const no=NUMBERED[category]&&item.no?`<em class="vd-no">${fmt(item.no)}</em>${category==='wings'?'':`<em class="vd-stars">${category==='bao'?'cấp '+Math.max(1,Math.min(5,item.stars||1)):'★'.repeat(Math.max(1,Math.min(5,item.stars||1)))}</em>`}`:''; // 18/11: tọa kỹ có SỐ để gõ toaky số
 return `<div class="vd-cell${item.on?' is-on':item.secondary?' is-sub':''}${NUMBERED[category]&&item.tier?' is-'+esc(item.tier):''}"><span class="vd-pic">${thumb?`<canvas width="${THUMB}" height="${THUMB}"${thumb}></canvas>`:''}<img src="${esc(safeInventoryArt(item,category))}" alt="" decoding="async">${n}${no}${tag}</span><span class="vd-cap">${esc(item.name||'Vật phẩm')}</span></div>`;
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
  const tk=card.tasks; // 18/11: gộp "nhiệm vụ" vào bảng tu vi
  if(tk?.items?.length)body+=`<div class="vd-sub">Nhiệm vụ ngày${tk.done?' · <b class="vd-ready">ĐÃ XONG</b>':''}</div><div class="vd-chips vd-list">${tk.items.map(x=>`<span class="${tk.done||x.have>=x.need?'is-on':''}">${esc(x.name)} ${fmt(x.have)}/${fmt(x.need)}${tk.done||x.have>=x.need?' ✓':''}</span>`).join('')}</div>`;
 }else if(kind==='bag'){
  body=`<div class="vd-chips"><span><img src="/assets/ui-inventory/crystal.svg" alt="">${fmt(card.stones)} linh thạch</span><span>🌿 ${fmt(card.herbs)} linh thảo</span></div>`
   +grid([[card.artifacts,'artifact'],[card.pills,'pill'],[card.manuals,'manual']],esc,'Túi trống');
 }else if(kind==='pets'){
  const has=(card.owned?.items?.length||0)+(card.owned?.more||0);
  const growth=card.currentGrowth;
   const summary=growth?`<div class="vd-pet-progress"><strong>${esc(growth.stageName||'Ấu Linh')} · Lv${fmt(growth.level)}</strong><span>Thân thiết ${fmt(growth.bond)}/100</span><span>${esc(growth.skill||'')}</span>${growth.xpNext?`<div class="vd-pet-exp"><i style="width:${pct(growth.xp,growth.xpNext).toFixed(1)}%"></i></div><small>XP ${fmt(growth.xp)}/${fmt(growth.xpNext)}</small>`:'<small>Đã đạt cấp tối đa</small>'}${growth.resonance?'<small>✦ Pháp bảo cộng hưởng</small>':''}</div>`:'';
   body=`<div class="vd-chips"><span>Đã có ${fmt(has)}/${fmt(card.total)}</span>${card.current?`<span>Theo: ${esc(card.current)}</span>`:''}</div>`+summary+grid([[card.owned,'pets']],esc,'Chưa có linh thú');
 }else if(kind==='mounts'){ // 18/11: lệnh linhchau / toaky
  const o=card.orbs||{},ON={divine:'vàng',vip:'tím',common:'xanh'},CMD={divine:'truyền công thần',vip:'truyền công vip',common:'truyền công'};
  const orbs=['divine','vip','common'].filter(k=>o[k]>0).map(k=>`<span class="vd-orb is-${k}"><img src="/assets/toa-ky-v1/orb-${k}-2.webp" alt="">${fmt(o[k])} châu ${ON[k]}</span>`).join('')||'<span>Chưa có Linh Châu</span>';
  const ch=card.channel?`<div class="vd-state">Đang truyền công châu ${ON[card.channel.kind]||''}${card.channel.left?' · còn '+fmt(card.channel.left)+' phút':' · sắp nở'}</div>`:'';
  const first=['divine','vip','common'].find(k=>o[k]>0);
  const hint=!card.channel&&first?`<div class="vd-state">gõ <b>${CMD[first]}</b> để nở tọa kỹ</div>`:(card.owned?.items?.length?'<div class="vd-state">gõ <b>toaky số</b> để cưỡi</div>':'');
  body=`<div class="vd-chips">${orbs}</div>`+ch+hint+grid([[card.owned,'mounts']],esc,'Chưa có tọa kỹ · Linh Châu có ở Tọa Kỹ Bí Cảnh');
 }else if(kind==='bao'){ // 18/11: thần khí + bản mệnh
  const it=card.owned?.items||[];
  body=`<div class="vd-chips">${card.banMenh?`<span class="vd-orb is-divine">Bản mệnh: ${esc(card.banMenh)}</span>`:''}${card.pity4!=null?`<span>còn ${fmt(card.pity4)} lượt tới 4★</span><span>còn ${fmt(card.pity5)} lượt tới 5★</span>`:''}</div>`
   +(it.length>1?hintHTML('bản mệnh + số','để đổi bản mệnh'):'')+grid([[card.owned,'bao']],esc,'Chưa có thần khí · gõ <b>cầu</b> khi Bảo Khố mở');
 }else if(kind==='wings'){ // 21/11 (chủ game): BẢNG CÁNH riêng — ảnh từng cánh đã mở (số = gõ cánh + số), cánh đang đeo sáng viền, cánh KẾ TIẾP ảnh mờ
  const it=card.owned?.items||[],nx=card.next;
  body=`<div class="vd-chips"><span>Đã mở ${fmt(it.length)}</span><span>Đeo: ${esc(card.current||'chưa có')}</span>${card.auto&&it.length?'<span>tự chọn cánh mạnh nhất</span>':''}</div>`+grid([[card.owned,'wings']],esc,'Chưa mở cánh · cánh mở theo tổng quà đã tặng')
   +(nx?`<div class="vd-sub">Cánh kế tiếp</div><div class="vd-next"><img src="${esc(safeInventoryArt(nx,'wings'))}" alt="" decoding="async"><span><b>${fmt(nx.no)}</b> ${esc(nx.name)}</span></div>`:'')
   +(it.length?hintHTML('cánh + số','để đổi · <b>hủy cánh</b> để ẩn · <b>cánh tự động</b>'):'');
 }else if(kind==='titles'){ // 21/11 tối (chủ game): gõ danh hiệu → danh sách CÓ SỐ (ảnh chữ từng danh hiệu), gõ danh hiệu + số để mặc
  const it=card.items||[],art=k=>/^[a-z0-9-]+$/.test(String(k||''))?'/assets/title-text/'+k+'.webp?v=2':'';
  body=`<div class="vd-chips"><span>Đang giữ ${fmt(it.length)}</span><span>Mặc: ${esc(card.off?'đang ẩn':card.current||'chưa có')}</span>${card.auto&&it.length?'<span>tự đeo cái xịn nhất</span>':''}</div>`
   +(it.length?`<ol class="vd-titles">${it.map(t=>`<li class="${t.on?'is-on':''}"><em class="vd-no">${fmt(t.no)}</em><img src="${esc(art(t.key))}" alt="${esc(t.name)}" decoding="async"><small>${esc(t.how||'')}</small></li>`).join('')}</ol>`:'<p class="vd-empty">Chưa có danh hiệu · giành ghế ở sự kiện, Thiên Bảng, đạo lữ…</p>')
   +(it.length?hintHTML('danh hiệu + số','để mặc · <b>danh hiệu ẩn</b> · <b>danh hiệu tự động</b>'):'');
 }else if(kind==='kit'){ // 18/11: chiêu + bí pháp
  const books=card.books||[],learned=books.filter(b=>b.on).length;
  body=`<div class="vd-chips"><span>Lv${fmt(card.lv||1)}</span><span>Bí pháp ${fmt(learned)}/${fmt(books.length)}</span></div>`
   +`<ol class="vd-rows">${(card.kit||[]).map(k=>`<li><em class="vd-no">SK${fmt(k.slot)}</em><b>${esc(k.name)}</b>${k.note?`<small>${esc(k.note)}</small>`:''}</li>`).join('')}</ol>`
   +`<div class="vd-sub">Bí pháp</div><div class="vd-chips vd-list">${books.map(b=>`<span class="${b.on?'is-on':'is-off'}">${b.on?'✓ ':''}${esc(b.name)}<small> ${esc(b.grade)}</small></span>`).join('')}</div>`
   +hintHTML('học + tên','· <b>chiêu đổi + tên</b> để xếp vào SK2');
 }else{
  const has=(card.owned?.items?.length||0)+(card.owned?.more||0),wg=card.wings; // 18/11: gộp "cánh" vào bảng skin
  body=`<div class="vd-chips"><span>Đã có ${fmt(has)}</span><span>Mặc: ${esc(card.current||'Áo cảnh giới')}</span></div>`+grid([[card.owned,'skins']],esc,'Chưa có skin riêng');
  if(wg)body+=`<div class="vd-sub">Cánh${wg.off?' · đang ẩn':''}</div>`+(wg.items?.length?`<div class="vd-chips vd-list">${wg.items.map(x=>`<span class="${x.on?'is-on':''}"><b>${fmt(x.no)}</b> ${esc(x.name)}${x.on?' ✓':''}</span>`).join('')}</div>`+hintHTML('cánh + số','để đổi · <b>hủy cánh</b> để ẩn'):'<p class="vd-empty">Chưa mở cánh</p>');
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
   if(!paintThumb(canvas,{kind,id:id.join(':'),stage:kind==='pet'?Number(canvas.dataset.petStage)||0:0},this.scene,x.player||{}))canvas.remove();
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
