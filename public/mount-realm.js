// 16/11/2026: TỌA KỴ BÍ CẢNH trên overlay — map thung lũng mây, avatar tròn (ảnh TikTok), yêu thú chui ra từ 6 cửa hang,
// Thú vương = một tọa kỵ lớn có đủ hiệu ứng. Nhẹ máy: nền vẽ sẵn 1 lần, avatar/tên/yêu thú cache bitmap, nội suy vị trí 1 s,
// tia chiêu giới hạn theo đông người, >60 người bỏ tên + bỏ hạt.
import {donorPortrait} from './gift-donor.js';
import {MAP_IMAGE,MAP_Y0,MAP_DRAW_H,ARENA,WAVES} from './mount-realm-layout.js';
import {drawMount,mountLod} from './mount-fx.js';
import {mountById} from './mounts.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const perf=()=>globalThis.performance?.now?.()??Date.now();
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const short=name=>{const a=Array.from(String(name||'Đạo hữu').trim());return a.length>11?a.slice(0,10).join('')+'…':a.join('');};
function canvas2(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
function rz(scene){return scene.realmFx??={pos:new Map(),sprites:new Map(),labels:new Map(),mobArt:new Map(),seen:new Set(),bolts:[],map:null,atlas:null,bg:null};}
function load(h){
 if(typeof Image==='undefined')return;
 if(!h.map){const im=new Image();im.decoding='async';h.map={im,ready:false};im.onload=()=>{h.map.ready=true;h.bg=null;};im.src=MAP_IMAGE;}
 if(!h.atlas){const im=new Image();im.decoding='async';h.atlas={im,ready:false};im.onload=()=>{h.atlas.ready=true;};im.src='/assets/boss-atlas.png';}
}
export function syncMountRealm(scene,state){
 const next=state.mountRealm||null,h=rz(scene),t=perf();
 if(scene.mountRealmStatus?.id!==next?.id){h.pos.clear();h.seen.clear();h.bolts=[];}
 scene.mountRealmStatus=next;
 if(typeof document!=='undefined')document.body.classList.toggle('mount-realm',!!next);
 if(!next)return;load(h);
 const ids=new Set();
 for(const m of next.members||[]){
  ids.add(m.id);const p=h.pos.get(m.id);
  if(!p){h.pos.set(m.id,{fx:m.x,fy:m.y,tx:m.x,ty:m.y,t0:t});}
  else{const k=clamp((t-p.t0)/1000),cx=p.fx+(p.tx-p.fx)*k,cy=p.fy+(p.ty-p.fy)*k;Object.assign(p,{fx:cx,fy:cy,tx:m.x,ty:m.y,t0:t});}
  if(m.avatar)donorPortrait(m.avatar);
 }
 for(const id of h.pos.keys())if(!ids.has(id))h.pos.delete(id);
 const n=(next.members||[]).length,budget=n>120?12:n>50?20:32;let added=0;
 for(const f of next.fx||[]){if(h.seen.has(f.id))continue;h.seen.add(f.id);if(added++<budget)h.bolts.push({...f,start:t+(f.manual||f.assist?0:hash(f.id)%600)});}
 if(h.seen.size>800)h.seen=new Set([...h.seen].slice(-400));
 if(h.bolts.length>60)h.bolts.splice(0,h.bolts.length-60);
}
function avatarSprite(h,m,r){
 const im=m.avatar?donorPortrait(m.avatar):null,key=m.id+'|'+r+'|'+(im?1:0);let s=h.sprites.get(key);if(s)return s;
 const size=Math.ceil((r+4)*2),cv=canvas2(size*2,size*2);if(!cv)return null;const c=cv.getContext('2d');c.scale(2,2);const cx=size/2;
 c.save();c.beginPath();c.arc(cx,cx,r,0,TAU);c.clip();c.fillStyle='#2a2150';c.fillRect(0,0,size,size);
 if(im){const sz=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-sz)/2,(im.naturalHeight-sz)/2,sz,sz,cx-r,cx-r,r*2,r*2);}
 else{c.fillStyle='#fff6db';c.font='900 '+Math.round(r)+'px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(String(m.name||'Đ'))[0]||'Đ',cx,cx+1);}
 c.restore();c.lineWidth=3;c.strokeStyle='#05040c';c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle='#cfa8ff';c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();
 s={cv,size};h.sprites.set(key,s);if(h.sprites.size>500)h.sprites.delete(h.sprites.keys().next().value);return s;
}
function label(h,name){
 let s=h.labels.get(name);if(s)return s;const font='800 13px "Segoe UI",Arial,sans-serif',probe=canvas2(4,4);if(!probe)return null;const pc=probe.getContext('2d');pc.font=font;
 const w=Math.ceil(pc.measureText(name).width)+8,hh=18,cv=canvas2(w*2,hh*2),c=cv.getContext('2d');c.scale(2,2);c.font=font;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#05040c';c.strokeText(name,w/2,hh/2);c.fillStyle='#fff';c.fillText(name,w/2,hh/2);
 s={cv,w,h:hh};h.labels.set(name,s);if(h.labels.size>500)h.labels.delete(h.labels.keys().next().value);return s;
}
// Yêu thú: cắt ô từ boss-atlas, thu nhỏ còn 84 px một lần.
function mobSprite(h,cell){
 let s=h.mobArt.get(cell);if(s)return s;if(!h.atlas?.ready)return null;const im=h.atlas.im,cw=im.naturalWidth/3,W=70,H=Math.round(W*im.naturalHeight/cw);
 const cv=canvas2(W*2,H*2);if(!cv)return null;cv.getContext('2d').drawImage(im,cell*cw,0,cw,im.naturalHeight,0,0,W*2,H*2);s={cv,w:W,h:H};h.mobArt.set(cell,s);return s;
}
function background(h,H){
 const key=H+'|'+(h.map?.ready?1:0);if(h.bg?.key===key)return h.bg.cv;
 const cv=canvas2(900,H);if(!cv)return null;const c=cv.getContext('2d');c.fillStyle='#0b0a18';c.fillRect(0,0,900,H);
 if(h.map?.ready)c.drawImage(h.map.im,0,MAP_Y0,900,MAP_DRAW_H);
 const top=c.createLinearGradient(0,0,0,330);top.addColorStop(0,'#05040cf0');top.addColorStop(1,'#05040c00');c.fillStyle=top;c.fillRect(0,0,900,330);
 const bot=c.createLinearGradient(0,H-420,0,H);bot.addColorStop(0,'#05040c00');bot.addColorStop(1,'#05040cf0');c.fillStyle=bot;c.fillRect(0,H-420,900,420);
 h.bg={key,cv};return cv;
}
function text(c,s,x,y,size,color,weight=800,align='center'){c.font=weight+' '+size+'px "Segoe UI",Arial,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(3,size/5);c.strokeStyle='#05040c';c.strokeText(s,x,y);c.fillStyle=color;c.fillText(s,x,y);}
function bar(c,x,y,w,h,k,color){c.fillStyle='#000000a0';c.fillRect(x-1,y-1,w+2,h+2);c.fillStyle=color;c.fillRect(x,y,w*clamp(k),h);}
const secs=ms=>Math.max(0,Math.ceil(ms/1000));

export function drawMountRealm(scene,c,t,H){
 const e=scene.mountRealmStatus;if(!e)return 0;const h=rz(scene);load(h);
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 const bg=background(h,H);if(bg)c.drawImage(bg,0,0,900,H);
 const now=nowAt(scene,t),members=e.members||[],n=members.length,crowd=n>60,moving=scene.motion!==false;
 // Vòng sân đá
 c.save();c.globalAlpha=.35+.15*Math.sin(t/500);c.strokeStyle='#c9a2ff';c.lineWidth=2;c.setLineDash([10,10]);c.beginPath();c.ellipse(ARENA.x,ARENA.y,ARENA.rx,ARENA.ry,0,0,TAU);c.stroke();c.restore();
 // Yêu thú
 for(const [x,y,wave,hp] of (e.mobs||[]).slice(0,70)){const s=mobSprite(h,WAVES[wave]?.cell??0);if(!s)continue;const bob=moving?Math.sin(t*.004+x)*2:0;c.drawImage(s.cv,x-s.w/2,y-s.h+bob,s.w,s.h);if(hp<100)bar(c,x-20,y+4,40,4,hp/100,'#ff6a6a');}
 // Thú vương: tọa kỵ lớn đủ lớp
 if(e.boss&&e.boss.hp>0){const m=mountById(e.boss.mount),sc=1.45;drawMount(c,e.boss.mount,e.boss.x,e.boss.y+70,{scale:sc,t:moving?t:0,lod:crowd?'light':'full',seed:'boss'});drawMount(c,e.boss.mount,e.boss.x,e.boss.y+70,{scale:sc,t:moving?t:0,lod:crowd?'light':'full',seed:'boss',layer:'front'});
  text(c,'THÚ VƯƠNG · '+(m?.name||'').toUpperCase(),450,250,24,'#ffe08a',900);bar(c,170,272,560,14,e.boss.hp/e.boss.maxHp,'#ffcf5a');}
 // Avatar
 const r=n<=40?19:n<=120?15:12,pts=[];
 for(const m of members){const p=h.pos.get(m.id);if(!p)continue;const k=clamp((t-p.t0)/1000),x=p.fx+(p.tx-p.fx)*k,y=p.fy+(p.ty-p.fy)*k;pts.push([m,x,y]);}
 pts.sort((a,b)=>a[2]-b[2]);
 for(const [m,x,y] of pts){
  if(m.boost&&!crowd){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.5+.3*Math.sin(t/120);c.fillStyle='#b98cff';c.beginPath();c.arc(x,y,r+7,0,TAU);c.fill();c.restore();}
  const s=avatarSprite(h,m,r);if(s)c.drawImage(s.cv,x-s.size/2,y-s.size/2,s.size,s.size);
  if(!crowd){const l=label(h,short(m.name));if(l)c.drawImage(l.cv,x-l.w/2,y+r+2,l.w,l.h);}
 }
 // Tia chiêu: người → mục tiêu (lighter, ngắn)
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 h.bolts=h.bolts.filter(b=>t-b.start<700);
 for(const b of h.bolts){const k=(t-b.start)/700;if(k<0)continue;const a=1-k,big=b.assist||b.manual;
  c.globalAlpha=a*(big?.95:.6);c.strokeStyle=b.boss?'#ffe28a':'#d7b4ff';c.lineWidth=big?5:2.5;c.beginPath();c.moveTo(b.x1,b.y1);const q=Math.min(1,k*2.2);c.lineTo(b.x1+(b.x2-b.x1)*q,b.y1+(b.y2-b.y1)*q);c.stroke();
  if(k>.35){c.globalAlpha=a*.8;c.fillStyle=b.boss?'#fff2b8':'#f0e2ff';c.beginPath();c.arc(b.x2,b.y2,(big?16:8)*(1+k),0,TAU);c.fill();
   if(b.hits)for(const [hx,hy] of b.hits.slice(0,12)){c.beginPath();c.arc(hx,hy,7*(1+k),0,TAU);c.fill();}}
 }
 c.restore();
 // HUD trên: tên sự kiện + giai đoạn + giờ
 const phase=e.phase==='registration'?'TẬP HỢP · '+secs(e.registrationEndsAt-now)+' s':e.phase==='running'?'LÀN '+(e.wave+1)+'/3 · '+(WAVES[e.wave]?.name||'')+' · '+secs(e.waveEndsAt-now)+' s':e.phase==='boss'?'THÚ VƯƠNG · '+secs(e.waveEndsAt-now)+' s':'KHÉP LẠI';
 text(c,'TỌA KỴ BÍ CẢNH',450,62,40,'#e8d4ff',900);text(c,phase+' · '+n+' đạo hữu',450,108,22,'#ffffff',800);
 // Hướng dẫn (luật tính năng mới phải có hướng dẫn) — chỉ lệnh + hiệu ứng, không hứa thưởng cho tim.
 const guide=['bicanh · vào Bí Cảnh','danh hoặc 6 · lao lên đánh','quà · tung chiêu đánh lan','Linh Châu · gõ truyencong'];
 c.fillStyle='#0b0820c8';c.fillRect(24,1180,330,150);c.strokeStyle='#b58cff80';c.lineWidth=1.5;c.strokeRect(24,1180,330,150);
 guide.forEach((g,i)=>text(c,g,40,1204+i*34,19,i===3?'#ffe08a':'#f3eaff',800,'left'));
 // Top sát thương
 const top=e.top||[];if(top.length){c.fillStyle='#0b0820c8';c.fillRect(546,1180,330,40+top.length*30);c.strokeStyle='#b58cff80';c.strokeRect(546,1180,330,40+top.length*30);text(c,'TOP SÁT THƯƠNG',711,1200,17,'#e8d4ff',900);
  top.forEach((x,i)=>{text(c,(i+1)+'. '+short(x.name),562,1232+i*30,18,'#ffffff',800,'left');text(c,String(x.dmg),860,1232+i*30,18,'#ffe08a',800,'right');});}
 // Vinh danh
 if(e.phase==='finished'&&e.results){const R=e.results;c.fillStyle='#05040cd8';c.fillRect(90,560,720,330);c.strokeStyle='#ffd36b';c.lineWidth=2;c.strokeRect(90,560,720,330);
  text(c,R.tamed?'THÚ VƯƠNG ĐÃ BỊ THU PHỤC':'BÍ CẢNH KHÉP LẠI',450,604,32,'#ffe08a',900);
  (R.top||[]).forEach((x,i)=>text(c,(i+1)+'. '+short(x.name)+' · '+x.bossDmg,450,660+i*44,26,'#ffffff',800));
  text(c,R.rewarded+' đạo hữu nhận Linh Châu · gõ truyencong',450,850,22,'#d9c2ff',800);}
 return n;
}
