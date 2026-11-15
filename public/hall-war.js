// 15/11 v2: Ngũ Đường Giao Lưu trên bản đồ 5 doanh trại. Server gửi vị trí thật mỗi ~1 s; overlay nội suy cho mượt,
// vẽ avatar tròn (ảnh TikTok) + viền màu Đường + thanh máu, chiêu bay đúng từ người ra chiêu tới mục tiêu.
// Hiệu năng: nền map + nhãn trại vẽ sẵn 1 lần; avatar/tên cache bitmap 2×; số chiêu/số bay giới hạn theo đông người.
import {donorPortrait} from './gift-donor.js';
import {giftFor} from './gift-icons.js';
import {MAP_IMAGE,MAP_Y0,MAP_DRAW_H,ALTAR,HALL_SKILLS,GIFT_TIERS,GIFT_SHORT,HALL_SPECIALS} from './hall-war-layout.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=k=>1-(1-k)**3;
const MARKS=['功','寶','丹','山','藥'],SOUNDS=['sword','bell','flame','thunder','lotus'];
const GRAND_GAP=20000,FLIGHT=480,HIT=520;
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const perf=()=>globalThis.performance?.now?.()??Date.now();
const short=name=>{const s=String(name||'Đạo hữu').trim();return Array.from(s).length>12?Array.from(s).slice(0,11).join('')+'…':s;};
const teamShort=name=>String(name||'').replace(/\s*Đường$/,'');
// ---------- trạng thái cục bộ ----------
function hw(scene){return scene.hallWarFx??={giftImages:new Map(),named:new Map(),pos:new Map(),queue:[],seen:new Map(),floaters:[],sprites:new Map(),labels:new Map(),lastGrandAt:-1e9,lastVariant:-1,lastSound:0,bg:null,map:null};}
function loadMap(h){
 if(h.map||typeof Image==='undefined')return;const im=new Image();h.map={image:im,ready:false};im.decoding='async';im.onload=()=>{h.map.ready=true;h.bg=null;};im.src=MAP_IMAGE;
}
export function syncHallWar(scene,state){
 const next=state.hallWar||null,h=hw(scene),t=perf();
 if(scene.hallWarStatus?.id!==next?.id){h.pos.clear();h.queue=[];h.seen.clear();h.floaters=[];scene.hallWarHeard=new Set();}
 scene.hallWarStatus=next;
 if(typeof document!=='undefined'){document.body.classList.toggle('hall-war',!!next?.active);document.body.classList.toggle('hall-war-podium',!!next?.active&&next.phase==='finished');}
 if(!next?.active)return;
 loadMap(h);h.giftArt=state.giftArt||h.giftArt;
 const members=next.members||[],ids=new Set();
 for(const m of members){
  ids.add(m.id);const p=h.pos.get(m.id),x=m.x??450,y=m.y??800;
  if(!p){h.pos.set(m.id,{fx:x,fy:y,tx:x,ty:y,t0:t,face:1,hp:m.hp,deadAt:m.hp<=0?t:0,hitAt:0});continue;}
  const cur=posAt(p,t),wasDead=p.hp<=0;
  if(m.hp<=0&&!wasDead){p.deadAt=t;p.deadX=cur.x;p.deadY=cur.y;}
  if(m.hp>0&&wasDead||Math.hypot(x-cur.x,y-cur.y)>320){p.fx=p.tx=x;p.fy=p.ty=y;p.t0=t;}
  else{if(Math.abs(x-cur.x)>2)p.face=x>cur.x?1:-1;p.fx=cur.x;p.fy=cur.y;p.tx=x;p.ty=y;p.t0=t;}
  p.hp=m.hp;
  if(m.aura&&p.auraSince!==m.aura.since){const fresh=p.auraSince!==undefined||t-(h.syncedAt||0)<4000;p.auraSince=m.aura.since;p.auraStart=t;if(fresh&&(next.serverNow??state.serverNow??0)-m.aura.since<3000)sound(scene,h,'boss-charge',undefined,t);}
 }
 h.syncedAt=t;
 for(const id of h.pos.keys())if(!ids.has(id))h.pos.delete(id);
 // Chiêu mới: xếp lịch phát rải trong ~0,7 s (server tính cả nhịp một lúc); quà/gõ tay phát ngay.
 const n=members.length,light=scene.budget?.level==='light',budget=light?8:n>80?14:n>40?22:30;
 const fresh=(next.fx||[]).filter(f=>!h.seen.has(f.id)&&f.kind!=='altar'&&(state.serverNow??scene.stateServerNow??Date.now())-f.at<2500);
 for(const f of next.fx||[])if(!h.seen.has(f.id))h.seen.set(f.id,t);
 if(h.seen.size>600)for(const [id,at] of h.seen)if(t-at>8000)h.seen.delete(id);
 const rank=f=>(f.grand?100:0)+(f.assist?60:0)+(f.ultimate?50:0)+(f.manual?30:0)+(f.knockout?20:0)+(f.crit?10:0);
 fresh.sort((a,b)=>rank(b)-rank(a)||hash(a.id)-hash(b.id));
 for(const f of fresh.slice(0,budget)){
  const instant=f.grand||f.ultimate||f.manual||f.assist;
  h.queue.push({fx:f,start:t+(instant?0:hash(f.id)%700),floated:false,variant:-1});
 }
 if(h.queue.length>48)h.queue.splice(0,h.queue.length-48);
 for(const m of members)if(m.avatar)donorPortrait(m.avatar);
}
function posAt(p,t){const k=clamp((t-p.t0)/1000);return {x:p.fx+(p.tx-p.fx)*k,y:p.fy+(p.ty-p.fy)*k,moving:k<1&&Math.hypot(p.tx-p.fx,p.ty-p.fy)>3};}
// Vị trí hiển thị của một người (đã nội suy). Người đang hồi sinh: hồn bay về trại.
export function hallWarPlaces(event,scene,t=perf()){
 const h=hw(scene),places=new Map(),camps=event.camps||[],teams=event.teams||[];
 for(const m of event.members||[]){
  const p=h.pos.get(m.id);let at=p?posAt(p,t):{x:m.x??450,y:m.y??800,moving:false};
  if(m.hp<=0&&p?.deadAt){const slot=teams.findIndex(x=>x.index===m.index),camp=camps[Math.max(0,slot)]||at,k=ease(clamp((t-p.deadAt-500)/1300));at={x:(p.deadX??at.x)+(camp.x-(p.deadX??at.x))*k,y:(p.deadY??at.y)+(camp.y-(p.deadY??at.y))*k-Math.sin(k*Math.PI)*60,moving:false};}
  places.set(m.id,{...m,...at,face:p?.face||1,hitAt:p?.hitAt||0});
 }
 return places;
}
// ---------- vẽ cơ bản ----------
function text(c,s,x,y,size,color='#fff',width=850,weight=800){c.font=weight+' '+size+'px "Segoe UI",Arial,sans-serif';c.fillStyle=color;c.lineWidth=Math.max(2.5,size/6);c.strokeStyle='#050a12';c.lineJoin='round';c.textAlign='center';c.textBaseline='middle';c.strokeText(s,x,y,width);c.fillText(s,x,y,width);}
function box(c,x,y,w,h,color,fill='#061625e8',r=10,lw=1.5){c.fillStyle=fill;c.strokeStyle=color;c.lineWidth=lw;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.stroke();}
function sigil(c,x,y,r,color,mark,angle=0,sy=1){
 c.save();c.translate(x,y);c.scale(1,sy);c.rotate(angle);c.strokeStyle=color;c.lineWidth=2;
 c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.beginPath();c.arc(0,0,r*.78,.1,5.2);c.stroke();
 for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(Math.cos(a)*r*.86,Math.sin(a)*r*.86);c.lineTo(Math.cos(a)*r*1.1,Math.sin(a)*r*1.1);c.stroke();}
 c.restore();if(mark)text(c,mark,x,y,r*.8*Math.max(.6,sy),color);
}
function canvas2(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
// Avatar tròn 2× (ảnh TikTok hoặc chữ cái đầu), viền màu Đường. Dựng lại khi ảnh tải xong.
function avatarSprite(h,m,color,r){
 const im=m.avatar?donorPortrait(m.avatar):null,key=m.id+'|'+r+'|'+color+'|'+(im?1:0);let s=h.sprites.get(key);if(s)return s;
 const size=Math.ceil((r+4)*2),cv=canvas2(size*2,size*2);if(!cv)return null;const c=cv.getContext('2d');c.scale(2,2);
 const cx=size/2;c.save();c.beginPath();c.arc(cx,cx,r,0,TAU);c.clip();c.fillStyle='#173b50';c.fillRect(0,0,size,size);
 if(im){const sz=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-sz)/2,(im.naturalHeight-sz)/2,sz,sz,cx-r,cx-r,r*2,r*2);}
 else{c.fillStyle=color;c.globalAlpha=.35;c.fillRect(0,0,size,size);c.globalAlpha=1;c.fillStyle='#fff6db';c.font='900 '+Math.round(r)+'px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(String(m.name||'Đ'))[0]||'Đ',cx,cx+1);}
 c.restore();c.lineWidth=3;c.strokeStyle='#050a12';c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();c.lineWidth=2.2;c.strokeStyle=color;c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();
 s={cv,size};h.sprites.set(key,s);
 if(h.sprites.size>500)h.sprites.delete(h.sprites.keys().next().value);
 return s;
}
function labelSprite(h,name,color){
 const key=name+'|'+color;let s=h.labels.get(key);if(s)return s;
 const font='800 13px "Segoe UI",Arial,sans-serif',probe=canvas2(4,4);if(!probe)return null;const pc=probe.getContext('2d');pc.font=font;
 const w=Math.ceil(pc.measureText(name).width)+8,hgt=18,cv=canvas2(w*2,hgt*2),c=cv.getContext('2d');c.scale(2,2);
 c.font=font;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#050a12';c.strokeText(name,w/2,hgt/2);c.fillStyle='#fff';c.fillText(name,w/2,hgt/2);
 s={cv,w,h:hgt};h.labels.set(key,s);if(h.labels.size>500)h.labels.delete(h.labels.keys().next().value);return s;
}
// Nền tĩnh: map + dải tối trên/dưới + vòng trại + nhãn trại → vẽ 1 lần, mỗi khung chỉ drawImage.
function background(h,e,H){
 const key=(e.teams||[]).map(t=>t.index+t.name+t.color).join('|')+'|'+H+'|'+(h.map?.ready?1:0);
 if(h.bg?.key===key)return h.bg.cv;
 const cv=canvas2(900,H);if(!cv)return null;const c=cv.getContext('2d');
 c.fillStyle='#0a0d14';c.fillRect(0,0,900,H);
 if(h.map?.ready)c.drawImage(h.map.image,0,MAP_Y0,900,MAP_DRAW_H);
 let g=c.createLinearGradient(0,0,0,MAP_Y0+140);g.addColorStop(0,'#070a10');g.addColorStop(.55,'#070a10cc');g.addColorStop(1,'#070a1000');c.fillStyle=g;c.fillRect(0,0,900,MAP_Y0+140);
 g=c.createLinearGradient(0,MAP_Y0+MAP_DRAW_H-120,0,H);g.addColorStop(0,'#070a1000');g.addColorStop(.5,'#070a10cc');g.addColorStop(1,'#070a10');c.fillStyle=g;c.fillRect(0,MAP_Y0+MAP_DRAW_H-120,900,H);
 for(const [i,team] of (e.teams||[]).entries()){
  const camp=(e.camps||[])[i];if(!camp)continue;
  c.save();c.strokeStyle=team.color;c.globalAlpha=.55;c.lineWidth=3;c.beginPath();c.ellipse(camp.x,camp.y+6,92,52,0,0,TAU);c.stroke();c.restore();
  const name=team.name,tw=Math.min(220,24+name.length*11),ly=camp.y-112;
  box(c,camp.x-tw/2,ly-15,tw,30,team.color,'#06121fe0',9,2);
  c.font='800 16px "Segoe UI",Arial,sans-serif';c.fillStyle=team.color;c.textAlign='center';c.textBaseline='middle';c.fillText((team.mark||MARKS[team.index%5]||'')+' '+name,camp.x,ly+1,tw-10);
 }
 h.bg={key,cv};return cv;
}
// ---------- hình chiêu theo Đường ----------
function shard(c,kind,x,y,r,angle,color){
 c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.strokeStyle='#fff6d5';c.lineWidth=Math.max(1,r/10);c.beginPath();
 if(kind===0){c.moveTo(0,-r*1.7);c.lineTo(r*.24,r*.55);c.lineTo(0,r*.75);c.lineTo(-r*.24,r*.55);c.closePath();c.fill();c.stroke();c.fillStyle='#fff6d5';c.fillRect(-r*.45,r*.55,r*.9,r*.14);c.fillRect(-r*.08,r*.7,r*.16,r*.5);}
 else if(kind===1){c.arc(0,0,r,0,TAU);c.fill();c.stroke();c.fillStyle='#4a2a05';c.fillRect(-r*.3,-r*.3,r*.6,r*.6);}
 else if(kind===2){const g=c.createRadialGradient(0,0,0,0,0,r*1.4);g.addColorStop(0,'#fff');g.addColorStop(.35,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.arc(0,0,r*1.4,0,TAU);c.fill();}
 else if(kind===3){c.roundRect(-r*.8,-r*.8,r*1.6,r*1.6,r*.2);c.fill();c.stroke();c.fillStyle='#2b1d08';c.font='900 '+Math.round(r*1.1)+'px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('山',0,r*.05);}
 else{c.moveTo(0,-r);c.quadraticCurveTo(r,0,0,r);c.quadraticCurveTo(-r*.6,0,0,-r);c.fill();c.beginPath();c.moveTo(0,-r*.7);c.lineTo(0,r*.7);c.stroke();}
 c.restore();
}
// Bàn tay pháp ấn (Tuần Sơn đại tuyệt chiêu) — vẽ bằng hình khối, không dùng ảnh.
function palm(c,x,y,s,color,alpha){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=alpha;
 const g=c.createRadialGradient(0,0,10,0,0,160);g.addColorStop(0,'#fffbe0');g.addColorStop(.5,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.beginPath();c.arc(0,0,170,0,TAU);c.fill();
 c.fillStyle='#ffe9a0ee';c.strokeStyle='#fff8d8';c.lineWidth=4;
 c.beginPath();c.roundRect(-55,-20,110,100,30);c.fill();c.stroke();
 for(const [fx,len,w] of [[-42,70,22],[-15,92,24],[13,96,24],[40,80,22]]){c.beginPath();c.roundRect(fx-w/2,-20-len,w,len+20,11);c.fill();c.stroke();}
 c.save();c.translate(-58,30);c.rotate(-.7);c.beginPath();c.roundRect(-12,-55,24,62,11);c.fill();c.stroke();c.restore();
 c.fillStyle='#b8860b';c.font='900 52px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('山',0,32);
 c.restore();
}
// Một chiêu thường/tuyệt chiêu: k 0→1 trên FLIGHT+HIT ms.
function drawSpell(c,q,from,to,color,k,light){
 const f=q.fx,kind=f.assist==='swords'?0:((f.index%5)+5)%5,big=!!f.ultimate,split=FLIGHT/(FLIGHT+HIT);
 const fly=clamp(k/split),hitK=clamp((k-split)/(1-split)),ang=Math.atan2(to.y-from.y,to.x-from.x);
 c.save();c.lineCap='round';
 if(k<split){
  c.globalAlpha=Math.min(1,k/.08);
  if(kind===3){ // ấn núi rơi từ trên xuống mục tiêu
   const y=to.y-230*(1-ease(fly));c.globalAlpha*=.35;c.fillStyle='#000';c.beginPath();c.ellipse(to.x,to.y+16,22*fly+6,8*fly+3,0,0,TAU);c.fill();c.globalAlpha=Math.min(1,k/.08);
   shard(c,3,to.x,y,big?32:22,0,color);
  }else if(kind===4){ // dây leo quất
   const ex=from.x+(to.x-from.x)*ease(fly),ey=from.y+(to.y-from.y)*ease(fly);c.strokeStyle=color;c.lineWidth=big?7:4;c.beginPath();c.moveTo(from.x,from.y);
   for(let i=1;i<=12;i++){const s=i/12,px=from.x+(ex-from.x)*s,py=from.y+(ey-from.y)*s,w=Math.sin(s*TAU*1.5+k*20)*10*(1-s*.5);c.lineTo(px+Math.cos(ang+Math.PI/2)*w,py+Math.sin(ang+Math.PI/2)*w);}c.stroke();
   shard(c,4,ex,ey,big?14:9,ang+Math.PI/2,color);
  }else{
   const lift=kind===1?70:35,x=from.x+(to.x-from.x)*fly,y=from.y+(to.y-from.y)*fly-Math.sin(fly*Math.PI)*lift;
   if(!light){c.strokeStyle=color;c.globalAlpha*=.55;c.lineWidth=big?10:5;c.beginPath();const bx=from.x+(to.x-from.x)*Math.max(0,fly-.3),by=from.y+(to.y-from.y)*Math.max(0,fly-.3)-Math.sin(Math.max(0,fly-.3)*Math.PI)*lift;c.moveTo(bx,by);c.lineTo(x,y);c.stroke();c.globalAlpha=Math.min(1,k/.08);}
   const count=f.manual||big?3:1;
   for(let i=0;i<count;i++){const off=(i-(count-1)/2)*16;shard(c,kind,x+Math.cos(ang+Math.PI/2)*off,y+Math.sin(ang+Math.PI/2)*off,(big?22:16)*(kind===2?1.25:1),kind===1?k*14:ang+Math.PI/2,color);}
  }
 }else{
  c.globalAlpha=1-hitK;
  const r=(big?70:30)*ease(hitK)+8;c.strokeStyle=color;c.lineWidth=big?5:3;c.beginPath();c.ellipse(to.x,to.y+4,r,r*.55,0,0,TAU);c.stroke();
  c.strokeStyle='#fff6d5';c.lineWidth=1.5;c.beginPath();c.ellipse(to.x,to.y+4,r*.7,r*.38,0,0,TAU);c.stroke();
  if(!light)for(let i=0;i<(big?10:5);i++){const a=i*2.399+(f.index||0),d=ease(hitK)*(big?80:36);shard(c,kind===3?1:kind,to.x+Math.cos(a)*d,to.y+Math.sin(a)*d*.6,Math.max(1,(big?8:5)*(1-hitK)),a,color);}
 }
 c.restore();
}
// Đại tuyệt chiêu (quà ≥300): 3 biến thể + lật/xoay/cỡ ngẫu nhiên; cách nhau ≥20 s mới vẽ cỡ toàn cảnh.
function drawGrand(c,q,to,color,k,full,name){
 const f=q.fx,kind=((f.index%5)+5)%5,v=q.variant,h0=hash(f.id),flip=h0&1?-1:1,scale=(full?1:.55)*(.9+(h0>>3)%20/100),rot=((h0>>8)%30-15)*Math.PI/180;
 c.save();
 if(full){c.globalAlpha=.16*Math.sin(clamp(k)*Math.PI);c.fillStyle=color;c.fillRect(0,0,900,1600);c.globalAlpha=1;}
 if(v===0){ // Thiên giáng: pháp tướng khổng lồ rơi xuống mục tiêu
  const drop=ease(clamp(k/.35)),y=to.y-420*scale*(1-drop),alpha=k<.75?1:1-(k-.75)/.25;
  if(kind===3)palm(c,to.x,y-40*scale,1.25*scale,color,alpha);
  else{c.save();c.globalAlpha=alpha;c.translate(to.x,y);c.rotate(kind===1?k*6:rot);c.scale(flip,1);shard(c,kind,0,0,95*scale*(kind===0?.9:1),0,color);c.restore();}
  if(k>.35){const s=ease(clamp((k-.35)/.5));c.globalAlpha=1-s;c.strokeStyle=color;c.lineWidth=8;c.beginPath();c.ellipse(to.x,to.y,40+260*s*scale,(40+260*s*scale)*.5,0,0,TAU);c.stroke();c.strokeStyle='#fff6d5';c.lineWidth=3;c.beginPath();c.ellipse(to.x,to.y,30+190*s*scale,(30+190*s*scale)*.5,0,0,TAU);c.stroke();}
 }else if(v===1){ // Vạn tiễn: mưa pháp khí rơi quanh mục tiêu
  const n=full?26:14;
  for(let i=0;i<n;i++){const hi=hash(f.id+':'+i),start=(hi%60)/100*.6,local=clamp((k-start)/.3);if(local<=0||local>=1)continue;
   const a=(hi>>7)%360*Math.PI/180,d=((hi>>3)%100)/100*230*scale,x=to.x+Math.cos(a)*d*flip,y=to.y+Math.sin(a)*d*.5;
   if(local<.6){const yy=y-300*(1-local/.6);c.globalAlpha=1;shard(c,kind,x,yy,(kind===2?16:13)*(full?1.2:1),kind===0?Math.PI:0,color);}
   else{const s=(local-.6)/.4;c.globalAlpha=1-s;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(x,y,10+30*s,(10+30*s)*.5,0,0,TAU);c.stroke();}}
 }else{ // Trận pháp: đại trận xoay dưới đất, cột sáng bùng ở các mục tiêu
  const grow=ease(clamp(k/.3)),alpha=k<.8?1:1-(k-.8)/.2;c.globalAlpha=alpha;
  sigil(c,to.x,to.y,250*scale*grow,color,'',k*3*flip+rot,.5);sigil(c,to.x,to.y,170*scale*grow,'#fff6d5','',-k*4*flip,.5);
  if(k>.3){const s=clamp((k-.3)/.5);c.globalAlpha=alpha*(1-s*.6);const g=c.createLinearGradient(0,to.y-420*scale,0,to.y);g.addColorStop(0,color+'00');g.addColorStop(1,color);c.fillStyle=g;c.fillRect(to.x-34*scale,to.y-420*scale*s,68*scale,420*scale*s);}
  text(c,MARKS[kind],to.x,to.y-8,90*scale*grow,color);
 }
 c.globalAlpha=Math.min(1,k/.1,(1-k)/.2);
 if(name)text(c,HALL_SKILLS[kind].name,to.x,Math.max(330,to.y-(full?250:150)),full?30:20,'#fff4c8',600,900);
 c.restore();
}
function floater(h,x,y,f,t,kind='hit',damage=0){
 const crit=kind==='hit'&&f.crit,ko=kind==='ko';
 h.floaters.push({x,y,t0:t,dur:ko?1300:crit?1100:900,text:ko?'PHÁ TRẬN':crit?'BẠO KÍCH -'+damage:'-'+damage,size:(ko||crit?22:16)*(h.crowd?.8:1),color:ko?'#ff6b5a':crit?'#ffad3a':'#ffffff',drift:(hash(f.id+kind)%40)-20});
 const cap=h.crowd?14:36;if(h.floaters.length>cap)h.floaters.splice(0,h.floaters.length-cap);
}
// ---------- HUD ----------
function drawTop(c,e,now,H){
 const done=e.phase==='finished',registration=e.phase==='registration',end=registration?e.registrationEndsAt:done?e.podiumUntil:e.endsAt,remaining=Math.max(0,Math.ceil((end-now)/1000));
 const g=c.createLinearGradient(220,0,680,0);g.addColorStop(0,'#3b2a0a00');g.addColorStop(.5,'#3b2a0ae0');g.addColorStop(1,'#3b2a0a00');c.fillStyle=g;c.fillRect(150,34,600,64);
 text(c,'NGŨ ĐƯỜNG GIAO LƯU',450,54,30,'#ffe3a0',600,900);
 text(c,(registration?'TẬP HỢP':done?'VINH DANH':'ĐANG SO TÀI')+' · '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'),450,85,18,'#d7f5ff');
 const teams=e.teams||[],ranked=[...teams].sort((a,b)=>b.score-a.score||b.kills-a.kills||a.index-b.index),leader=ranked[0]?.score>0?ranked[0].index:-1;
 const width=Math.min(172,880/Math.max(1,teams.length)),top=104;
 for(const [slot,team] of teams.entries()){
  const mid=450+(slot-(teams.length-1)/2)*width,count=(e.members||[]).filter(p=>p.index===team.index).length,lead=team.index===leader,hold=e.altar?.index===team.index;
  box(c,mid-width/2+4,top,width-8,70,lead?'#ffe2a0':team.color,lead?'#4a3812ee':'#061625e8',10,lead?2.5:1.5);
  text(c,(lead?'♛ ':'')+teamShort(team.name),mid,top+15,15,team.color,width-18);
  text(c,Math.round(team.score).toLocaleString('vi-VN'),mid,top+38,24,'#fff',width-18,900);
  text(c,count+' người · '+team.kills+' phá trận'+(hold?' · giữ đài':''),mid,top+59,11.5,hold?'#ffe6a0':'#cfe3ea',width-14,700);
 }
 if(!registration&&!done){const k=clamp((now-e.battleStartedAt)/((e.endsAt-e.battleStartedAt)||180000));c.fillStyle='#ffffff22';c.fillRect(60,top+76,780,4);c.fillStyle='#8edbd1';c.fillRect(60,top+76,780*(1-k),4);}
}
function drawFeed(c,e,now,colorOf){
 let y=252;
 for(const f of (e.feed||[]).slice(-3).reverse()){
  const age=now-f.at;if(age>9000)continue;const a=Math.min(1,(9000-age)/800);
  c.save();c.globalAlpha=a;c.font='800 14px "Segoe UI",Arial,sans-serif';
  const left=short(f.fromName),right=short(f.toName),lw=c.measureText(left).width,rw=c.measureText(right).width,w=lw+rw+56;
  box(c,450-w/2,y-13,w,26,'#ffffff30','#08101ccc',13,1);
  c.textBaseline='middle';c.textAlign='left';c.fillStyle=colorOf(f.index);c.fillText(left,450-w/2+12,y);c.fillStyle='#ff8f7a';c.textAlign='center';c.fillText('✕',450-w/2+12+lw+16,y);c.textAlign='left';c.fillStyle=colorOf(f.toIndex);c.fillText(right,450-w/2+12+lw+32,y);
  c.restore();y+=30;
 }
 if(e.combo&&now-e.combo.at<3000){const team=(e.teams||[]).find(t=>t.index===e.combo.index);if(team){const a=Math.min(1,(3000-(now-e.combo.at))/500);c.save();c.globalAlpha=a;box(c,270,y-2,360,28,team.color,'#1a1405e8',14,2);text(c,'✦ HỢP KÍCH · '+teamShort(team.name)+' (+25% sát thương)',450,y+12,14,'#ffe6a0',340);c.restore();}}
}
function drawBoard(c,e,colorOf){
 const rows=[...(e.members||[])].filter(m=>m.score>0).sort((a,b)=>b.kills-a.kills||b.score-a.score||a.id.localeCompare(b.id)).slice(0,6);if(!rows.length)return;
 const x=8,y=234,w=236,h=44+rows.length*25;
 box(c,x,y,w,h,'#d8b45f','#0b0f18e6',10,2);text(c,'⚔ BẢNG CHIẾN THẦN',x+w/2,y+18,15,'#ffe3a0',w-12,900);
 c.font='700 13px "Segoe UI",Arial,sans-serif';c.textBaseline='middle';
 for(const [i,m] of rows.entries()){
  const ry=y+44+i*25;c.fillStyle=i===0?'#ffd56a':i===1?'#dfe7f0':i===2?'#e3a36b':'#9fb0bf';c.textAlign='left';c.fillText(String(i+1),x+10,ry);
  c.fillStyle=colorOf(m.index);c.beginPath();c.arc(x+30,ry,5,0,TAU);c.fill();
  c.fillStyle='#fff';c.fillText(short(m.name),x+42,ry,120);c.textAlign='right';c.fillStyle='#ffe6a0';c.fillText('×'+m.kills+' ('+Math.round(m.score)+')',x+w-10,ry);
 }
}
// Dải lệnh ngay dưới bảng điểm (vùng trên màn, không bị khung chat TikTok che).
function drawCommands(c,e){
 const reg=e.phase==='registration',y=200;
 box(c,40,y-16,820,34,'#e8cf91','#0b0f18ee',17,1.5);
 c.save();c.font='800 15px "Segoe UI",Arial,sans-serif';c.textBaseline='middle';
 const parts=reg?[['GÕ 6','#ffe08a'],[' hoặc ','#cfe3ea'],['đường chiến','#ffe08a'],[' → vào trận theo Đường của mình','#ffffff']]
  :[['GÕ 6','#ffe08a'],[' lao lên ra chiêu  ·  ','#ffffff'],['đánh @tên','#ffe08a'],[' khóa mục tiêu  ·  ','#ffffff'],['giữ Chiến Đài','#ffe08a'],[' +10/giây','#ffffff']];
 const total=parts.reduce((n,[s])=>n+c.measureText(s).width,0);let x=450-total/2;c.textAlign='left';c.lineJoin='round';
 for(const [s,col] of parts){c.lineWidth=3;c.strokeStyle='#050a12';c.strokeText(s,x,y+1);c.fillStyle=col;c.fillText(s,x,y+1);x+=c.measureText(s).width;}
 c.restore();
}
// Bảng QUÀ TRỢ CHIÊU bên phải: ảnh quà thật → tên chiêu (không ghi số coin).
function giftImage(h,url){if(!url||typeof Image==='undefined')return null;let g=h.giftImages.get(url);if(!g){g={image:new Image(),ready:false};g.image.referrerPolicy='no-referrer';g.image.decoding='async';g.image.onload=()=>g.ready=true;g.image.src=url;h.giftImages.set(url,g);}return g.ready?g.image:null;}
function drawGiftPanel(c,h){
 const rows=[...GIFT_TIERS].reverse(),x=650,y=234,w=242,rh=42,hgt=38+rows.length*rh;
 box(c,x,y,w,hgt,'#d8b45f','#0b0f18e6',10,2);text(c,'🎁 QUÀ TRỢ CHIÊU',x+w/2,y+19,15,'#ffe3a0',w-12,900);
 for(const [i,tier] of rows.entries()){
  const ry=y+38+i*rh+rh/2,g=giftFor(h.giftArt,tier.min),im=giftImage(h,g.url);
  if(im)c.drawImage(im,x+8,ry-17,34,34);else{c.fillStyle='#ffd86b';c.beginPath();c.arc(x+25,ry,11,0,TAU);c.fill();}
  if(g.count>1)text(c,'×'+g.count,x+50,ry+8,11,'#fff',30,800);
  c.save();c.font='800 14px "Segoe UI",Arial,sans-serif';c.textAlign='left';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#050a12';
  const [label,note]=GIFT_SHORT[tier.id]||[tier.name,''];c.strokeText(label,x+64,ry-8,w-70);c.fillStyle=tier.grand?'#ffd56a':'#ffffff';c.fillText(label,x+64,ry-8,w-70);
  c.font='700 11.5px "Segoe UI",Arial,sans-serif';c.lineWidth=2.5;c.strokeText(note,x+64,ry+9,w-70);c.fillStyle='#bfe3d6';c.fillText(note,x+64,ry+9,w-70);c.restore();
 }
}
// Trợ chiêu lên chính mình: Hồi Xuân (vòng xanh bốc lên) / Cuồng Hóa (vòng lửa bung ra).
function drawSelfAssist(c,kind,p,k,r,t){
 c.save();c.globalAlpha=1-k;
 if(kind==='heal'){
  for(let i=0;i<3;i++){const s=clamp(k*1.4-i*.2);c.strokeStyle='#8dff9e';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y+r-s*60,r+8+s*18,(r+8+s*18)*.35,0,0,TAU);c.stroke();}
  for(let i=0;i<8;i++){const a=i*TAU/8+k*2;shard(c,4,p.x+Math.cos(a)*(r+10),p.y-k*70+Math.sin(a)*8,6,a,'#8dff9e');}
  text(c,'+100',p.x,p.y-r-12-k*20,18,'#8dff9e',120);
 }else{
  const s=ease(k);c.strokeStyle='#ff9a3c';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,r+6+s*40,0,TAU);c.stroke();
  for(let i=0;i<10;i++){const a=i*TAU/10;shard(c,2,p.x+Math.cos(a)*(r+s*46),p.y+Math.sin(a)*(r+s*46),7*(1-k)+2,a,'#ff9a3c');}
 }
 c.restore();
}
// Lôi Kích Cửu Thiên: sét giáng từ trời xuống mục tiêu, nhánh sét sang những người bị lan.
function bolt(c,x1,y1,x2,y2,seed,width){
 c.beginPath();c.moveTo(x1,y1);const n=9;
 for(let i=1;i<n;i++){const s=i/n,j=((hash(seed+':'+i)%100)/100-.5)*46;c.lineTo(x1+(x2-x1)*s+j,y1+(y2-y1)*s);}
 c.lineTo(x2,y2);c.strokeStyle='#d9c4ff';c.lineWidth=width;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=width/3;c.stroke();
}
function drawThunder(c,q,from,to,places,k,light){
 const f=q.fx,flick=k<.55&&(Math.floor(k*30)%3!==0);c.save();c.lineCap='round';c.lineJoin='round';
 if(k<.12){c.globalAlpha=k/.12;sigil(c,to.x,to.y,40,'#c9a8ff','',0,.5);}
 else{
  c.globalAlpha=k<.6?1:1-(k-.6)/.4;
  if(flick||light)bolt(c,to.x+20,to.y-420,to.x,to.y,f.id,8);
  for(const hit of f.hits||[]){const p=places.get(hit.id);if(p&&(flick||light))bolt(c,to.x,to.y,p.x,p.y,f.id+hit.id,4);}
  const s=ease(clamp((k-.12)/.5));c.strokeStyle='#c9a8ff';c.lineWidth=4;c.beginPath();c.ellipse(to.x,to.y+4,20+90*s,(20+90*s)*.45,0,0,TAU);c.stroke();
 }
 c.restore();
}
// ---------- trạng thái avatar: hào quang quà, cánh, nổ khi phá trận ----------
function sound(scene,h,kind,variant,t){const key=kind+':'+(variant||'');h.sounds??={};if(t-(h.sounds[key]??-1e9)<180)return;h.sounds[key]=t;scene.onCombatSound?.(kind,variant);}
function kick(h,amp,dur,t,flashColor,flashAlpha){
 if(amp&&(!h.shake||t-h.shake.start>h.shake.dur*.5||amp>=h.shake.amp))h.shake={amp,dur,start:t};
 if(flashColor&&(!h.flash||t-h.flash.start>200||flashAlpha>=h.flash.alpha))h.flash={color:flashColor,alpha:flashAlpha,dur:Math.min(520,dur),start:t};
}
// Âm thanh + rung + chớp lúc một chiêu bắt đầu; tên chiêu đặc biệt bay trên đầu người ra chiêu.
function startCue(scene,h,q,from,color,t,n,r,places){
 const f=q.fx,crowd=n>40;
 if(f.grand){q.full=t-h.lastGrandAt>=GRAND_GAP;if(q.full)h.lastGrandAt=t;kick(h,q.full?15:7,750,t,'#fff6d5',q.full?.38:.18);sound(scene,h,'boss-strike','abyss-dragon',t);}
 else if(f.ultimate){kick(h,8,480,t,color,.2);sound(scene,h,'boss-strike',undefined,t);}
 else if(f.assist==='thunder'){kick(h,6,420,t,'#c9a8ff',.24);sound(scene,h,'cast','thunder',t);}
 else if(f.assist==='heal'){sound(scene,h,'boss-shield',undefined,t);}
 else if(f.assist==='boost'){sound(scene,h,'boss-charge',undefined,t);}
 else if(f.assist==='swords'){sound(scene,h,'cast','sword',t);}
 else if(f.special){
  const sp=HALL_SPECIALS.find(s=>s.id===f.special);
  if(sp)h.floaters.push({x:from.x,y:from.y-r-26,t0:t,dur:1300,text:sp.name,size:crowd?13:15,color,drift:0});
  if(f.special==='quake'){kick(h,crowd?0:5,360,t);sound(scene,h,'boss-strike',undefined,t);}
  else if(f.special==='goldbell'||f.special==='bloom')sound(scene,h,'boss-shield',undefined,t);
  else sound(scene,h,'cast',f.special==='blaze'?'flame':'sword',t);
  for(const id of f.healed||[]){const a=h.pos.get(id);if(a)a.healAt=t;}
 }
 else if(!crowd||f.manual)sound(scene,h,'cast',SOUNDS[((f.index%5)+5)%5],t);
}
function burst(c,x,y,k,color){
 c.save();c.globalAlpha=1-k;
 for(let i=0;i<12;i++){const a=i*TAU/12+i,d=ease(k)*(36+i%3*14);shard(c,i%2?1:2,x+Math.cos(a)*d,y+Math.sin(a)*d*.7,6*(1-k)+1,a,color);}
 c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(x,y,10+ease(k)*42,0,TAU);c.stroke();c.restore();
}
// Đôi cánh xòe (lông vũ hình elip, vỗ nhẹ). span = sải một bên.
function drawWings(c,x,y,span,color,t,moving){
 if(span<2)return;const flap=moving?Math.sin(t/170)*.13:0;
 for(const side of [-1,1]){
  c.save();c.translate(x,y);c.scale(side,1);c.rotate(-flap);
  for(let f=0;f<6;f++){const a=-.12-f*.24,L=span*(1-f*.1);c.save();c.rotate(a);
   const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,color+'f0');g.addColorStop(1,'#ffffffcc');c.fillStyle=g;
   c.beginPath();c.ellipse(L*.52,0,L*.52,span*.085,0,0,TAU);c.fill();c.strokeStyle='#fff8';c.lineWidth=1;c.stroke();c.restore();}
  c.restore();
 }
}
// Hào quang theo mốc quà: Cuồng Hóa lửa cam · Hồi Xuân xanh · Phi Kiếm/Lôi Kích cánh màu Đường · Tuyệt Chiêu cánh vàng + vầng sáng ·
// Đại Tuyệt Chiêu cánh vàng lớn + trận đồ dưới chân + cột sáng. Lúc mới nhận: cánh bung ra + vòng sáng nổ.
function drawAura(c,p,x,y,r,t,color,pp,moving){
 const tier=p.aura.tier,gold=tier==='ultimate'||tier==='grand',wing=['swords','thunder','ultimate','grand'].includes(tier);
 const since=t-(pp?.auraStart??t-2000),open=ease(clamp(since/450)),pulse=moving?.5+.5*Math.sin(t/160):.7;
 const glow=tier==='heal'?'#8dff9e':tier==='boost'?'#ff9a3c':gold?'#ffd56a':color;
 c.save();
 if(tier==='grand'){const g=c.createLinearGradient(0,y-280,0,y);g.addColorStop(0,glow+'00');g.addColorStop(1,glow+'70');c.fillStyle=g;c.fillRect(x-r,y-280,r*2,280);sigil(c,x,y+r*.7,r*2.2,glow,'',moving?t*.002:0,.38);}
 const R=r*(gold?3.1:2.4)*(.9+.12*pulse),g=c.createRadialGradient(x,y,r*.5,x,y,R);g.addColorStop(0,glow+'b0');g.addColorStop(1,glow+'00');c.fillStyle=g;c.beginPath();c.arc(x,y,R,0,TAU);c.fill();
 if(wing)drawWings(c,x,y-r*.15,r*(tier==='grand'?3.2:gold?2.7:2.1)*open,gold?'#ffd56a':color,t,moving);
 if(gold){c.strokeStyle='#fff3b0';c.lineWidth=3;c.globalAlpha=.7+.3*pulse;c.beginPath();c.ellipse(x,y-r-9,r*.85,r*.26,0,0,TAU);c.stroke();c.globalAlpha=1;}
 if(tier==='boost'||tier==='grand'||tier==='heal'){
  for(let i=0;i<7;i++){const ph=moving?(t/650+i/7)%1:i/7,px=x+Math.sin(i*2.1+t/300)*r*.95,py=y+r-ph*r*2.8;c.globalAlpha=1-ph;shard(c,tier==='heal'?4:2,px,py,(tier==='heal'?5:6)*(1-ph)+1.5,i,glow);}
  c.globalAlpha=1;
 }
 if(since<520){const k=since/520;c.globalAlpha=1-k;c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.arc(x,y,r+ease(k)*r*3,0,TAU);c.stroke();c.strokeStyle=glow;c.lineWidth=2;c.beginPath();c.arc(x,y,r+ease(k)*r*2.2,0,TAU);c.stroke();}
 c.restore();
}
// Chiêu đặc biệt của 5 Đường.
function drawSpecial(c,q,from,to,places,color,k,light,r){
 const f=q.fx,targets=[to,...(f.hits||[]).map(hh=>places.get(hh.id)).filter(Boolean)];
 c.save();c.lineCap='round';
 if(f.special==='swordrain'){
  targets.forEach((p,i)=>{const lk=clamp((k-i*.12)/.5);if(lk<=0)return;
   if(lk<1){c.globalAlpha=1;shard(c,0,p.x,p.y-220*(1-ease(lk)),20,Math.PI,color);c.strokeStyle=color;c.globalAlpha=.45;c.lineWidth=4;c.beginPath();c.moveTo(p.x,p.y-260);c.lineTo(p.x,p.y-220*(1-ease(lk)));c.stroke();}
   else{const hk=clamp((k-i*.12-.5)/.4);c.globalAlpha=1-hk;c.strokeStyle='#fff6d5';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y+6,14+hk*40,(14+hk*40)*.45,0,0,TAU);c.stroke();}});
 }else if(f.special==='goldbell'){
  const a=k<.8?1:1-(k-.8)/.2,s=ease(clamp(k/.25)),x=from.x,y=from.y,w=r*1.9*s,hgt=r*2.6*s;
  c.globalAlpha=a*.32;c.fillStyle='#ffd56a';c.beginPath();c.moveTo(x-w,y+r);c.quadraticCurveTo(x-w,y-hgt,x,y-hgt);c.quadraticCurveTo(x+w,y-hgt,x+w,y+r);c.closePath();c.fill();
  c.globalAlpha=a;c.strokeStyle='#ffe9a0';c.lineWidth=3;c.stroke();for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x+i*w*.5,y-hgt*.82);c.lineTo(x+i*w*.62,y+r);c.stroke();}
  c.restore();drawSpell(c,q,from,to,'#ffd56a',k,light);return;
 }else if(f.special==='blaze'){
  const s=ease(clamp(k/.7)),R=24+110*s;c.globalAlpha=k<.7?1:1-(k-.7)/.3;
  c.strokeStyle='#ff7a3c';c.lineWidth=6;c.beginPath();c.ellipse(to.x,to.y+6,R,R*.45,0,0,TAU);c.stroke();
  if(!light)for(let i=0;i<14;i++){const a=i*TAU/14+k;shard(c,2,to.x+Math.cos(a)*R,to.y+6+Math.sin(a)*R*.45-8,10*(1-k*.6),a,i%2?'#ffb35c':color);}
  if(k<.35){c.globalAlpha=1;shard(c,2,from.x+(to.x-from.x)*k/.35,from.y+(to.y-from.y)*k/.35,16,0,'#ff9a3c');}
 }else if(f.special==='quake'){
  const s=ease(clamp(k/.6));c.globalAlpha=k<.6?1:1-(k-.6)/.4;c.strokeStyle='#e8c38a';c.lineWidth=3;
  for(let i=0;i<9;i++){const a=i*TAU/9+(hash(f.id)%10)/10;c.beginPath();c.moveTo(from.x,from.y+r*.6);let px=from.x,py=from.y+r*.6;for(let j=1;j<=4;j++){const d=j/4*165*s,jit=((hash(f.id+':'+i+':'+j)%20)-10);px=from.x+Math.cos(a)*d+jit;py=from.y+r*.6+Math.sin(a)*d*.5;c.lineTo(px,py);}c.stroke();}
  c.strokeStyle=color;c.lineWidth=5;c.beginPath();c.ellipse(from.x,from.y+r*.6,20+150*s,(20+150*s)*.5,0,0,TAU);c.stroke();
  if(!light)for(let i=0;i<8;i++){const a=i*TAU/8,d=s*120;shard(c,1,from.x+Math.cos(a)*d,from.y+r*.6+Math.sin(a)*d*.5-Math.sin(s*Math.PI)*30,5,a,'#c9a47a');}
 }else if(f.special==='bloom'){
  c.globalAlpha=k<.7?1:1-(k-.7)/.3;
  for(let i=0;i<14;i++){const a=i*TAU/14+k*4,d=26+150*ease(k);shard(c,4,from.x+Math.cos(a)*d,from.y+Math.sin(a)*d*.55,8*(1-k*.5),a+1.5,i%2?'#8dff9e':'#ffb7e0');}
  c.restore();drawSpell(c,q,from,to,color,k,light);return;
 }
 c.restore();
}
function drawGuide(c,e,H){
 const y=1528,done=e.phase==='finished',reg=e.phase==='registration';
 box(c,40,y-34,820,74,'#b9d7c9','#071725ee',12,1.5);
 text(c,done?'TRẬN ĐÃ KHÉP · KẾT QUẢ ĐÃ LƯU VÀO BẢNG TUẦN':reg?'Gõ 6 hoặc đường chiến để vào trận theo Đường của mình':'Tự kéo về Chiến Đài, gặp đối thủ gần nhất là ra chiêu · gõ 6 = lao lên · đánh @tên = khóa mục tiêu',450,y-12,17,'#ffffff',790);
 text(c,done?'Top 3 Đường nhận điểm tuần · quà theo đóng góp':'Giữ Chiến Đài giữa sân +10 điểm/giây · bị phá trận về trại 5 giây · '+GIFT_TIERS.slice(0,3).map(t=>t.min+'+').reverse().join(' / ')+' xu: tuyệt chiêu',450,y+16,14,'#ffe6a0',790,700);
}
function podium(c,e,H){
 box(c,55,H*.3,790,H*.38,'#dec987','#061222f5',18);
 text(c,e.results?.length?'VINH DANH NGŨ ĐƯỜNG':'CHƯA CÓ ĐIỂM SO TÀI',450,H*.34,31,'#ffe5a8');
 const order=[1,0,2],positions=[{x:180,y:.455},{x:450,y:.42},{x:720,y:.455}];
 for(let slot=0;slot<3;slot++){
  const rank=order[slot],team=e.results?.[rank];if(!team)continue;const pos=positions[slot],x=pos.x,y=H*pos.y;
  box(c,x-108,y-42,216,rank===0?210:190,team.color,rank===0?'#604518a0':'#142840c9');
  sigil(c,x,y-12,rank===0?42:30,team.color,team.mark||MARKS[team.index%5]);
  text(c,'HẠNG '+(rank+1),x,y+42,19,'#fff0bb');text(c,teamShort(team.name),x,y+70,21,team.color,200);
  text(c,Math.round(team.score).toLocaleString('vi-VN')+' điểm · '+team.kills+' phá trận',x,y+99,15,'#fff',200);
  text(c,'+'+[80,50,30][rank]+' điểm tuần',x,y+124,16,'#e2f6ed',200);
 }
 if(e.results?.length&&e.mvp?.[0]?.score>0){const m=e.mvp[0];text(c,'CHIẾN THẦN · '+m.name+' · '+m.score+' công · '+(m.kills||0)+' phá trận',450,H*.615,21,'#ffe7a8',730);}
 text(c,e.rewardCount?e.rewardCount+' đồng môn đã nhận quà · kết quả lưu vào bảng tuần':'Không phát thưởng khi chưa có đóng góp',450,H*.66,18,'#c9e6e6',740);
}
// ---------- khung hình ----------
export function drawHallWar(scene,c,t,H){
 const e=scene.hallWarStatus;if(!e?.active)return 0;
 const h=hw(scene);loadMap(h);
 const base=[scene.canvas.width/900,0,0,scene.canvas.height/H,0,0];c.setTransform(...base);
 const sh=h.shake,shK=sh&&scene.motion!==false?clamp((t-sh.start)/sh.dur):1,amp=shK<1?sh.amp*(1-shK)**2:0;
 if(amp){c.fillStyle='#0a0d14';c.fillRect(0,0,900,H);c.translate(Math.sin(t*.09)*amp,Math.cos(t*.113)*amp*.7);}
 const bg=background(h,e,H);if(bg)c.drawImage(bg,0,0,900,H);
 const now=nowAt(scene,t),light=scene.budget?.level==='light',moving=scene.motion!==false,done=e.phase==='finished',registration=e.phase==='registration';
 const teams=e.teams||[],colorMap=new Map(teams.map(x=>[x.index,x.color])),colorOf=i=>colorMap.get(i)||'#fff';
 const members=e.members||[],n=members.length,r=n<=60?20:n<=120?16:13;h.crowd=n>40;
 // Chiến Đài: vòng màu Đường đang giữ.
 if(!done){
  const holder=e.altar?teams.find(x=>x.index===e.altar.index):null,pulse=moving?.5+.5*Math.sin(t/300):.7;
  c.save();c.strokeStyle=holder?holder.color:'#ffffff55';c.lineWidth=holder?4:2;c.globalAlpha=holder?.5+.4*pulse:.5;c.setLineDash(holder?[]:[10,10]);c.beginPath();c.ellipse(ALTAR.x,ALTAR.y,ALTAR.rx,ALTAR.ry,0,0,TAU);c.stroke();c.restore();
  text(c,holder?'CHIẾN ĐÀI · '+teamShort(holder.name).toUpperCase()+' ĐANG GIỮ':'TRUNG ƯƠNG CHIẾN ĐÀI',ALTAR.x,ALTAR.y-ALTAR.ry-14,14,holder?holder.color:'#e8ecf0',400);
 }
 const places=hallWarPlaces(e,scene,t);
 // Ai được hiện tên khi đông: top 3 mỗi Đường + người đang khóa mục tiêu / chuỗi phá trận / cuồng hóa.
 let named=null;
 if(n>40){named=new Set();for(const team of teams)members.filter(m=>m.index===team.index).sort((a,b)=>b.score-a.score).slice(0,3).forEach(m=>named.add(m.id));for(const m of members)if(m.locked||m.streak>=3||m.boostUntil>now)named.add(m.id);}
 if(!done){
  const order=[...places.values()].sort((a,b)=>a.y-b.y);let auras=0;
  for(const p of order){
   const color=colorOf(p.index),dead=p.hp<=0,bob=moving&&p.moving&&!dead?Math.abs(Math.sin(t/110+hash(p.id)%7))*3:0,pp=h.pos.get(p.id);
   let ox=0,oy=0,sc=1;
   if(pp&&!dead&&moving){const ck=(t-(pp.castAt??-1e9))/260;if(ck>=0&&ck<1){const s=Math.sin(ck*Math.PI);ox+=Math.cos(pp.castAng)*10*s;oy+=Math.sin(pp.castAng)*10*s;sc=1+.16*s;}
    const hk=(t-(p.hitAt||-1e9))/220;if(hk>=0&&hk<1){const s=1-hk;ox+=((hash(p.id+':'+Math.floor(t/45))%7)-3)*s*1.3+Math.cos(pp.hitAng||0)*7*s;oy+=Math.sin(pp.hitAng||0)*5*s;}}
   const x=p.x+ox,y=p.y-bob+oy;
   if(dead&&pp?.deadAt&&t-pp.deadAt<650&&!light)burst(c,pp.deadX??p.x,pp.deadY??p.y,(t-pp.deadAt)/650,color);
   c.save();
   if(dead)c.globalAlpha=.42;
   if(!dead){c.globalAlpha=.35;c.fillStyle='#000';c.beginPath();c.ellipse(p.x,p.y+r+2,r*.8,r*.28,0,0,TAU);c.fill();c.globalAlpha=1;}
   if(p.aura&&!dead&&auras<(h.crowd?10:30)&&(!light||p.aura.tier!=='boost')){auras++;drawAura(c,p,x,y,r,t,color,pp,moving);}
   const s=avatarSprite(h,p,color,r);if(s){const z=s.size*sc;c.drawImage(s.cv,x-z/2,y-z/2,z,z);}
   const flash=t-p.hitAt;if(flash<180&&!dead){c.globalAlpha=.55*(1-flash/180);c.fillStyle='#fff';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1;}
   if(p.shieldUntil>now)sigil(c,x,y,r+8,'#efffce','',moving?t*.002:0);
   if(pp?.healAt&&t-pp.healAt<700&&!dead){const hk=(t-pp.healAt)/700;c.globalAlpha=1-hk;c.strokeStyle='#8dff9e';c.lineWidth=3;c.beginPath();c.arc(x,y,r+4+hk*14,0,TAU);c.stroke();c.globalAlpha=dead?.42:1;}
   if(!dead){const bw=r*2+6;c.fillStyle='#050a12';c.fillRect(x-bw/2-1,y+r+4,bw+2,6);c.fillStyle=p.hp>50?color:p.hp>25?'#ffc65a':'#ff5b4a';c.fillRect(x-bw/2,y+r+5,bw*clamp(p.hp/100),4);}
   else{const wait=Math.max(1,Math.ceil(((p.respawnAt||now)-now)/1000));text(c,wait+'s',x,y,14,'#e6eef5');}
   if(!named||named.has(p.id)){const l=labelSprite(h,short(p.name),color);if(l)c.drawImage(l.cv,x-l.w/2,y+r+10,l.w,l.h);}
   if(p.locked&&!dead){c.fillStyle='#ff6b5a';c.font='900 13px "Segoe UI"';c.textAlign='center';c.fillText('◎',x+r,y-r);}
   c.restore();
  }
  // Chiêu.
  const grandFull=[];
  h.queue=h.queue.filter(q=>t-q.start<(q.fx.grand?2600:q.fx.kind==='assist'?1300:FLIGHT+HIT+200));
  for(const q of h.queue){
   const dur=q.fx.grand?2400:q.fx.kind==='assist'?1200:FLIGHT+HIT,k=(t-q.start)/dur;if(k<0)continue;
   const from=places.get(q.fx.from)||{x:q.fx.x1,y:q.fx.y1},to=places.get(q.fx.to)||{x:q.fx.x2,y:q.fx.y2},color=colorOf(q.fx.index);
   if(!q.started){q.started=true;const ap=h.pos.get(q.fx.from);if(ap&&q.fx.kind!=='assist'){ap.castAt=t;ap.castAng=Math.atan2(to.y-from.y,to.x-from.x);}startCue(scene,h,q,from,color,t,n,r,places);}
   if(q.fx.assist&&!h.named.has(q.fx.from+':'+q.fx.at)&&k>=0){h.named.set(q.fx.from+':'+q.fx.at,t);if(h.named.size>60)h.named.delete(h.named.keys().next().value);const tier=GIFT_TIERS.find(x=>x.id===q.fx.assist);if(tier){const by=places.get(q.fx.from);if(by)h.floaters.push({x:by.x,y:by.y-r-30,t0:t,dur:1600,text:tier.name,size:18,color:'#ffe08a',drift:0});}}
   if(q.fx.kind==='assist'){const by=places.get(q.fx.from);if(by&&k<=1)drawSelfAssist(c,q.fx.assist,by,k,r,t);continue;}
   if(q.fx.assist==='thunder')drawThunder(c,q,from,to,places,clamp(k),light);
   else if(q.fx.grand){
    if(q.variant<0){let v=hash(q.fx.id)%3;if(v===h.lastVariant)v=(v+1)%3;q.variant=v;h.lastVariant=v;q.tx=to.x;q.ty=to.y;}
    grandFull.push(q);
   }else{
    if(q.fx.special)drawSpecial(c,q,from,to,places,color,moving?clamp(k):.6,light,r);
    else drawSpell(c,q,from,to,q.fx.assist==='swords'?'#ffd86b':color,moving?k:.75,light);
   }
   const impactK=q.fx.grand?.4:FLIGHT/(FLIGHT+HIT);
   if(!q.floated&&k>=impactK){
    q.floated=true;const target=h.pos.get(q.fx.to);if(target){target.hitAt=t;target.hitAng=Math.atan2(to.y-from.y,to.x-from.x);}
    if(q.fx.knockout||q.fx.crit)sound(scene,h,'hit',undefined,t);
    const showNumber=n<=40||q.fx.crit||q.fx.ultimate||q.fx.knockout||q.fx.manual;
    if(showNumber)floater(h,to.x,to.y-r-8,q.fx,t,'hit',q.fx.damage);
    if(q.fx.knockout)floater(h,to.x,to.y-r-34,q.fx,t+60,'ko');
    for(const hit of q.fx.hits||[]){const p=places.get(hit.id);if(!p)continue;const tp=h.pos.get(hit.id);if(tp)tp.hitAt=t;if(n<=60||hit.knockout)floater(h,p.x,p.y-r-8,{id:q.fx.id+hit.id},t,hit.knockout?'ko':'hit',hit.damage);}
   }
  }
  for(const q of grandFull){const k=(t-q.start)/2400;drawGrand(c,q,{x:q.tx,y:q.ty},colorOf(q.fx.index),moving?clamp(k):.5,q.full,true);}
  // Số bay.
  h.floaters=h.floaters.filter(f=>t-f.t0<f.dur);
  for(const f of h.floaters){const k=(t-f.t0)/f.dur;if(k<0)continue;c.save();c.globalAlpha=k<.7?1:1-(k-.7)/.3;const pop=k<.12?.7+k/.12*.45:1.15-Math.min(.15,(k-.12));text(c,f.text,f.x+f.drift*k,f.y-46*ease(k),f.size*pop,f.color,260,900);c.restore();}
 }
 c.setTransform(...base);
 if(h.flash&&moving){const k=(t-h.flash.start)/h.flash.dur;if(k>=0&&k<1){c.save();c.globalAlpha=h.flash.alpha*(1-k)**1.5;c.fillStyle=h.flash.color;c.fillRect(0,0,900,H);c.restore();}}
 drawTop(c,e,now,H);
 if(!done){drawCommands(c,e);drawFeed(c,e,now,colorOf);drawBoard(c,e,colorOf);drawGiftPanel(c,h);}
 if(registration){box(c,250,760,400,112,'#e8cf91','#071725ed',14,2);text(c,'ĐỒNG MÔN ĐANG TẬP HỢP',450,786,21,'#ffe6a0',370);text(c,'Gõ 6 / đường chiến',450,818,26,'#fff');text(c,'Tự vào đúng Đường đã gia nhập',450,850,15,'#d3eced',370);}
 if(done)podium(c,e,H);
 return done?0:Math.min(n,60);
}
