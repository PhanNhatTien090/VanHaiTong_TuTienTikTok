// 16/11/2026: TỌA KỸ BÍ CẢNH trên overlay — map thung lũng mây, avatar tròn (ảnh TikTok), yêu thú chui ra từ 6 cửa hang,
// Thú vương = một tọa kỹ lớn có đủ hiệu ứng. Chiêu dùng lại bộ chiêu Ngũ Đường (hall-war.js drawSpellFx), mỗi người một hệ.
// Quà: vòng sáng + tên chiêu trên avatar; quà lớn có băng rôn ảnh quà. Kết thúc: Linh Châu rơi thẳng vào avatar, châu càng xịn càng sáng.
// Nhẹ máy: nền vẽ sẵn 1 lần, avatar/tên/yêu thú cache bitmap, nội suy vị trí 1 s, số chiêu/châu rơi giới hạn theo đông người.
// Chữ trên màn: chỉ lệnh + hiệu ứng, không số coin, không "ngẫu nhiên/tỷ lệ", không hứa thưởng cho tim.
import {donorPortrait} from './gift-donor.js';
import {tmOn,INK_FILL} from './ink-panel.js';
import {giftFor} from './gift-icons.js';
import {MAP_Y0,MAP_DRAW_H,GIFT_TIERS,realmLayout} from './mount-realm-layout.js';
import {drawMount} from './mount-fx.js';
import {mountById,orbImage,ORBS} from './mounts.js';
import {drawSpellFx,SPELL_MS} from './hall-war.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=k=>1-(1-clamp(k))**3;
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const perf=()=>globalThis.performance?.now?.()??Date.now();
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const short=name=>{const a=Array.from(String(name||'Đạo hữu').trim());return a.length>11?a.slice(0,10).join('')+'…':a.join('');};
const ELEMENT_COLORS=['#79e9c4','#ffc671','#ff8a5a','#91caff','#c7ee80'];
const ORB_STYLE={common:{color:'#7fe3ff',glow:1.1,size:36,rank:0},vip:{color:'#c79bff',glow:2,size:48,rank:1},divine:{color:'#ffd36b',glow:3.4,size:66,rank:2}};
function canvas2(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
function rz(scene){return scene.realmFx??={pos:new Map(),sprites:new Map(),labels:new Map(),mobArt:new Map(),images:new Map(),seen:new Set(),bolts:[],gifts:[],drops:[],banner:null,map:null,atlas:null,bg:null,glow:new Map()};}
function img(h,src){if(!src||typeof Image==='undefined')return null;let g=h.images.get(src);if(!g){const im=new Image();im.decoding='async';im.referrerPolicy='no-referrer';g={im,ready:false};im.onload=()=>g.ready=true;im.src=src;h.images.set(src,g);}return g.ready?g.im:null;}
function load(h,e){
 if(typeof Image==='undefined')return;
 const src=realmLayout(e).image; // 17/11: ảnh map theo map của lượt
 if(h.map?.src!==src){const im=new Image();im.decoding='async';const m={im,ready:false,src};h.map=m;h.bg=null;im.onload=()=>{m.ready=true;if(h.map===m)h.bg=null;};im.src=src;}
 if(!h.atlas){const im=new Image();im.decoding='async';h.atlas={im,ready:false};im.onload=()=>{h.atlas.ready=true;};im.src='/assets/boss-atlas.png';}
}
function posOf(h,id,t){const p=h.pos.get(id);if(!p)return null;const k=clamp((t-p.t0)/1000);return {x:p.fx+(p.tx-p.fx)*k,y:p.fy+(p.ty-p.fy)*k};}
export function syncMountRealm(scene,state){
 const next=state.mountRealm||null,h=rz(scene),t=perf(),prev=scene.mountRealmStatus;
 if(prev?.id!==next?.id){h.pos.clear();h.seen.clear();h.bolts=[];h.gifts=[];h.drops=[];h.banner=null;}
 scene.mountRealmStatus=next;h.giftArt=state.giftArt||h.giftArt;
 if(typeof document!=='undefined')document.body.classList.toggle('mount-realm',!!next);
 if(!next)return;load(h,next); /* 18/11: thiếu map → mỗi lần nhận state đổi về Linh Sơn rồi lại Hỏa Diệm → nền xóa, nháy đen */
 const ids=new Set();
 for(const m of next.members||[]){
  ids.add(m.id);const p=h.pos.get(m.id);
  if(!p)h.pos.set(m.id,{fx:m.x,fy:m.y,tx:m.x,ty:m.y,t0:t});
  else{const c=posOf(h,m.id,t);Object.assign(p,{fx:c.x,fy:c.y,tx:m.x,ty:m.y,t0:t});}
  if(m.avatar)donorPortrait(m.avatar);
 }
 for(const id of h.pos.keys())if(!ids.has(id))h.pos.delete(id);
 const n=(next.members||[]).length,budget=n>120?10:n>50?18:28;let added=0;
 for(const f of next.fx||[]){if(h.seen.has(f.id))continue;h.seen.add(f.id);if(f.manual||f.assist||added++<budget)h.bolts.push({...f,start:t+(f.manual||f.assist?0:hash(f.id)%700)});}
 if(h.bolts.length>50)h.bolts.splice(0,h.bolts.length-50);
 for(const g of next.gifts||[]){if(h.seen.has(g.id))continue;h.seen.add(g.id);h.gifts.push({...g,start:t});if(['grand','ultimate'].includes(g.tier))h.banner={...g,start:t};}
 if(h.gifts.length>12)h.gifts.splice(0,h.gifts.length-12);
 if(h.seen.size>900)h.seen=new Set([...h.seen].slice(-450));
 // Banner đổi làn / Thú vương
 const stage=next.phase==='boss'?'boss':next.phase==='running'?'wave'+next.wave:null;
 if(stage&&h.stage!==stage){h.stage=stage;h.waveBanner={text:stage==='boss'?'THÚ VƯƠNG XUẤT HIỆN':'LÀN '+(next.wave+1)+' · '+(realmLayout(next).waves[next.wave]?.name||'').toUpperCase(),boss:stage==='boss',start:t};}
 // Kết quả: châu rơi thẳng vào avatar (giới hạn số châu rơi cùng lúc)
 if(next.results?.rows&&!h.dropsMade){h.dropsMade=true;const rows=next.results.rows,cap=n>80?40:80;let i=0;
  for(const r of [...rows].sort((a,b)=>(b.divine*9+b.vip*3)-(a.divine*9+a.vip*3))){for(const kind of ['divine','vip','common'])for(let k=0;k<(r[kind]||0)&&i<cap;k++)h.drops.push({id:r.id,kind,start:t+400+i++*90+(kind==='divine'?0:300)});}}
 if(!next.results)h.dropsMade=false;
}
function avatarSprite(h,m,r){
 const im=m.avatar?donorPortrait(m.avatar):null,key=m.id+'|'+r+'|'+(im?1:0);let s=h.sprites.get(key);if(s)return s;
 const size=Math.ceil((r+4)*2),cv=canvas2(size*2,size*2);if(!cv)return null;const c=cv.getContext('2d');c.scale(2,2);const cx=size/2;
 c.save();c.beginPath();c.arc(cx,cx,r,0,TAU);c.clip();c.fillStyle='#2a2150';c.fillRect(0,0,size,size);
 if(im){const sz=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-sz)/2,(im.naturalHeight-sz)/2,sz,sz,cx-r,cx-r,r*2,r*2);}
 else{c.fillStyle='#fff6db';c.font='900 '+Math.round(r)+'px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(String(m.name||'Đ'))[0]||'Đ',cx,cx+1);}
 c.restore();c.lineWidth=3;c.strokeStyle='#05040c';c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle=ELEMENT_COLORS[hash(m.id)%5];c.beginPath();c.arc(cx,cx,r+1.5,0,TAU);c.stroke();
 s={cv,size};h.sprites.set(key,s);if(h.sprites.size>500)h.sprites.delete(h.sprites.keys().next().value);return s;
}
function label(h,name){
 let s=h.labels.get(name);if(s)return s;const font='800 13px "Segoe UI",Arial,sans-serif',probe=canvas2(4,4);if(!probe)return null;const pc=probe.getContext('2d');pc.font=font;
 const w=Math.ceil(pc.measureText(name).width)+8,hh=18,cv=canvas2(w*2,hh*2),c=cv.getContext('2d');c.scale(2,2);c.font=font;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#05040c';c.strokeText(name,w/2,hh/2);c.fillStyle='#fff';c.fillText(name,w/2,hh/2);
 s={cv,w,h:hh};h.labels.set(name,s);if(h.labels.size>500)h.labels.delete(h.labels.keys().next().value);return s;
}
function mobSprite(h,wave){
 const cell=wave?.cell??0;
 if(wave?.art){const key='art:'+wave.art;let s=h.mobArt.get(key);if(s)return s;const im=img(h,'/assets/toa-ky-v1/'+wave.art+'.webp');if(!im)return null;const W=wave.size||78,HH=Math.round(W*im.naturalHeight/im.naturalWidth),cv=canvas2(W*2,HH*2);if(!cv)return null;cv.getContext('2d').drawImage(im,0,0,W*2,HH*2);s={cv,w:W,h:HH};h.mobArt.set(key,s);return s;}
 let s=h.mobArt.get(cell);if(s)return s;if(!h.atlas?.ready)return null;const im=h.atlas.im,cw=im.naturalWidth/3,W=70,H=Math.round(W*im.naturalHeight/cw);
 const cv=canvas2(W*2,H*2);if(!cv)return null;cv.getContext('2d').drawImage(im,cell*cw,0,cw,im.naturalHeight,0,0,W*2,H*2);s={cv,w:W,h:H};h.mobArt.set(cell,s);return s;
}
// Quầng sáng tròn dựng sẵn theo màu (cộng sáng).
function glow(h,color){let s=h.glow.get(color);if(s)return s;const cv=canvas2(128,128);if(!cv)return null;const c=cv.getContext('2d'),g=c.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.25,color+'d0');g.addColorStop(.6,color+'40');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,128,128);h.glow.set(color,cv);return cv;}
// 18/11: ảnh map chỉ phủ y 125–1475 → phóng cả lớp thế giới (map + người + quái + chiêu) quanh tâm map cho kín màn; bảng chữ vẽ ngoài lớp này.
export const realmZoom=H=>Math.max(1,H/MAP_DRAW_H);
function worldZoom(c,H){const z=realmZoom(H),cy=MAP_Y0+MAP_DRAW_H/2;if(z===1)return;c.translate(450,H/2);c.scale(z,z);c.translate(-450,-cy);}
function background(h,H){
 const key=H+'|'+(h.map?.ready?1:0)+'|'+h.map?.src;if(h.bg?.key===key)return h.bg.cv;
 const cv=canvas2(900,H);if(!cv)return null;const c=cv.getContext('2d');c.fillStyle='#0b0a18';c.fillRect(0,0,900,H);
 if(h.map?.ready)c.drawImage(h.map.im,0,MAP_Y0,900,MAP_DRAW_H);
 const top=c.createLinearGradient(0,MAP_Y0,0,330);top.addColorStop(0,'#05040ca8');top.addColorStop(1,'#05040c00');c.fillStyle=top;c.fillRect(0,0,900,330);
 const bot=c.createLinearGradient(0,MAP_Y0+MAP_DRAW_H-300,0,MAP_Y0+MAP_DRAW_H);bot.addColorStop(0,'#05040c00');bot.addColorStop(1,'#05040ca8');c.fillStyle=bot;c.fillRect(0,MAP_Y0+MAP_DRAW_H-300,900,300+H);
 h.bg={key,cv};return cv;
}
function text(c,s,x,y,size,color,weight=800,align='center',max){c.font=weight+' '+size+'px "Segoe UI",Arial,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(3,size/5);c.strokeStyle='#05040c';c.strokeText(s,x,y,max);c.fillStyle=color;c.fillText(s,x,y,max);}
function box(c,x,y,w,hh,stroke){c.fillStyle=tmOn()?INK_FILL:'#0b0820d8';c.strokeStyle=stroke;c.lineWidth=1.6;c.beginPath();c.roundRect(x,y,w,hh,10);c.fill();c.stroke();}
function bar(c,x,y,w,hh,k,color){c.fillStyle='#000000b0';c.fillRect(x-1,y-1,w+2,hh+2);c.fillStyle=color;c.fillRect(x,y,w*clamp(k),hh);}
const secs=ms=>Math.max(0,Math.ceil(ms/1000));
// ---------- bảng hướng dẫn ----------
function drawGuide(c,e){
 box(c,16,136,420,186,'#b58cff99');text(c,'CÁCH CHƠI BÍ CẢNH',226,156,17,'#e8d4ff',900);
 const rows=[['bicanh','vào Bí Cảnh, tự đánh yêu thú gần nhất'],['danh / 6','lao lên đánh mạnh'],['quà','tung chiêu đánh lan (bảng bên phải)'],['hạ Thú vương','cả sân cùng thu phục'],['truyencong','mở châu ra tọa kỹ (bảng dưới phải)']];
 rows.forEach(([k,v],i)=>{const y=186+i*28;text(c,k,30,y,16,'#ffe08a',900,'left');text(c,'· '+v,30+Math.max(64,c.measureText(k).width+8),y,15,'#f3eaff',700,'left',300);});
}
function drawGiftBoard(c,h){
 const rows=[...GIFT_TIERS].reverse(),x=452,y=136,w=432,rh=36;box(c,x,y,w,40+rows.length*rh,'#ffd36b99');text(c,'QUÀ → CHIÊU',x+w/2,y+18,17,'#ffe3a0',900);
 rows.forEach((tier,i)=>{const ry=y+52+i*rh,g=giftFor(h.giftArt,tier.min),im=img(h,g?.url);if(im)c.drawImage(im,x+12,ry-15,30,30);else{c.fillStyle='#ffd86b';c.beginPath();c.arc(x+27,ry,10,0,TAU);c.fill();}
  if(g?.count>1)text(c,'×'+g.count,x+48,ry+8,11,'#fff',800,'left');text(c,tier.name,x+72,ry,16,tier.id==='grand'?'#ffd56a':'#ffffff',900,'left',w-84);});
}
// 18/11 (chủ game): bảng dưới DỜI SANG CỘT PHẢI (góc dưới trái là chỗ bình luận TikTok đè) + dễ hiểu hơn:
// 1) cách nhận châu, 2) quà cộng dồn → châu tím/vàng (ảnh quà thật, không ghi coin), 3) MỞ CHÂU gõ gì cho từng màu
// (người chơi hay gõ "truyencong" khi chỉ còn châu tím → không mở được), 4) người đang góp quà: châu đã đủ + thanh tới châu sau.
const ORB_COL={x:452,w:432};
function orbBoardLayout(e,H){const givers=(e.givers||[]).length,hh=292+(givers?40+givers*30:0),bottom=Math.round(H*.89);return {x:ORB_COL.x,w:ORB_COL.w,y:bottom-hh,hh};}
function drawOrbBoard(c,h,H,e){
 const {x,y,w,hh}=orbBoardLayout(e,H);box(c,x,y,w,hh,'#7fe3ff99');text(c,'NHẬN LINH CHÂU',x+w/2,y+18,18,'#bff3ff',900);
 const orb=(kind,ox,oy,s=28)=>{const im=img(h,orbImage(kind,0));if(im)c.drawImage(im,ox,oy-s/2,s,s);return ox+s;};
 const gift=(coins,ox,oy)=>{const g=giftFor(h.giftArt,coins),gi=img(h,g?.url);if(gi)c.drawImage(gi,ox,oy-14,28,28);if(g?.count>1)text(c,'×'+g.count,ox+30,oy+6,12,'#fff',900,'left');return ox+(g?.count>1?58:34);};
 let ry=y+48;orb('common',x+12,ry);text(c,'Đánh yêu thú đủ → 1 châu xanh',x+46,ry-1,15,'#f3eaff',800,'left',w-56);
 ry+=22;text(c,'Top 3 đánh Thú vương → thêm 1 châu xanh',x+46,ry,13,'#cfe9ff',700,'left',w-56);
 ry+=22;c.fillStyle='#ffd36b33';c.fillRect(x+10,ry,w-20,1);text(c,'TẶNG QUÀ (cộng dồn cả lượt)',x+w/2,ry+14,13,'#ffe3a0',900);
 [[300,'vip',1,'1 châu tím'],[500,'vip',2,'2 châu tím'],[1000,'divine',1,'châu vàng · chắc chắn Thần']].forEach(([coins,kind,count,why],i)=>{const yy=ry+42+i*32;let tx=gift(coins,x+12,yy);text(c,'→',tx+4,yy,18,'#ffe3a0',900,'left');tx+=26;
  for(let k=0;k<count;k++)tx=orb(kind,tx,yy,kind==='divine'?32:28)+2;text(c,why,tx+6,yy,15,kind==='divine'?'#ffe08a':'#e2c8ff',900,'left',x+w-tx-14);});
 ry+=42+3*32-6;c.fillStyle='#7fe3ff33';c.fillRect(x+10,ry,w-20,1);text(c,'MỞ CHÂU · GÕ',x+w/2,ry+14,13,'#bff3ff',900);
 const yy=ry+42,cols=[['common','truyencong','#9ff0d0'],['vip','truyencong vip','#e2c8ff'],['divine','truyencong than','#ffe08a']];
 cols.forEach(([kind,cmd,col],i)=>{const cx=x+10+i*(w-20)/3;orb(kind,cx,yy,24);text(c,cmd,cx+28,yy,i?13:14,col,900,'left',(w-20)/3-32);});
 const gv=e.givers||[];if(!gv.length)return;
 let gy=yy+26;c.fillStyle='#ffd36b33';c.fillRect(x+10,gy,w-20,1);text(c,'ĐANG GÓP QUÀ',x+w/2,gy+14,13,'#ffe3a0',900);gy+=40;
 for(const g of gv){const got=g.step>=3?['divine']:g.step===2?['vip','vip']:g.step===1?['vip']:[],nextKind=g.step>=2?'divine':'vip';
  text(c,short(g.name),x+14,gy,15,'#ffffff',800,'left',130);let tx=x+150;for(const k of got)tx=orb(k,tx,gy,22)+1;
  if(g.step<3){const bx=Math.max(tx+6,x+214),bw=x+w-46-bx;bar(c,bx,gy-5,bw,10,g.prog,g.step>=2?'#ffd36b':'#c79bff');orb(nextKind,x+w-38,gy,24);}
  else text(c,'ĐÃ ĐỦ CHÂU VÀNG',x+w-16,gy,13,'#ffe08a',900,'right');
  gy+=30;}
}
function drawTop(c,e,H){
 const top=(e.top||[]).slice(0,3);if(!top.length)return;const L=orbBoardLayout(e,H),x=L.x,w=L.w,hh=40+top.length*28,y=L.y-hh-10;box(c,x,y,w,hh,'#b58cff99');text(c,'TOP SÁT THƯƠNG',x+w/2,y+18,16,'#e8d4ff',900);
 top.forEach((r,i)=>{text(c,(i+1)+'. '+short(r.name),x+16,y+46+i*28,16,i===0?'#ffe08a':'#ffffff',800,'left');text(c,String(r.dmg),x+w-16,y+46+i*28,16,'#ffe08a',800,'right');});
}
// ---------- hiệu ứng ----------
// 17/11: HỎA THIÊU BÍ CẢNH — lửa phủ cả sân. Ngọn lửa là 1 ảnh dựng sẵn (cache), ~36 ngọn (nhẹ: 18) + vòng lửa viền + quầng cam.
function flameSprite(h){if(h.flame)return h.flame;const cv=canvas2(64,112);if(!cv)return null;const x=cv.getContext('2d');
 const g=x.createLinearGradient(0,112,0,0);g.addColorStop(0,'#ff3b0f');g.addColorStop(.45,'#ff9a2a');g.addColorStop(.8,'#ffe27a');g.addColorStop(1,'#fff8d0');x.fillStyle=g;
 x.beginPath();x.moveTo(32,0);x.bezierCurveTo(60,40,58,80,46,104);x.quadraticCurveTo(32,116,18,104);x.bezierCurveTo(6,80,4,40,32,0);x.fill();
 x.globalCompositeOperation='lighter';const c2=x.createRadialGradient(32,80,2,32,80,26);c2.addColorStop(0,'#fff6c8');c2.addColorStop(1,'#fff6c800');x.fillStyle=c2;x.fillRect(0,40,64,72);
 return h.flame=cv;}
function drawBurn(c,h,e,t,now,light){
 const A=realmLayout(e).arena,k=Math.min(1,(now-e.burn.at)/500,(e.burn.until-now)/700),fl=flameSprite(h);if(k<=0)return;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.32*k;c.fillStyle='#ff6a1a';c.beginPath();c.ellipse(A.x,A.y,A.rx,A.ry,0,0,TAU);c.fill();
 c.globalAlpha=.75*k;c.strokeStyle='#ffb347';c.lineWidth=10;c.beginPath();c.ellipse(A.x,A.y,A.rx,A.ry,0,0,TAU);c.stroke();c.restore();
 if(fl){const n=light?18:36;c.save();for(let i=0;i<n;i++){const a=(i*2.399)%TAU,r=Math.sqrt(((i*.618)%1)),x=A.x+Math.cos(a)*A.rx*r*.95,y=A.y+Math.sin(a)*A.ry*r*.95,f=.75+.35*Math.sin(t*.012+i*1.7),W=34*f*(1+.4*(i%3===0)),HH=W*1.75;c.globalAlpha=k*(.75+.25*Math.sin(t*.02+i));c.drawImage(fl,x-W/2,y-HH,W,HH);}
  // viền: lửa dựng quanh mép sân
  const m=light?14:28;for(let i=0;i<m;i++){const a=i/m*TAU+t*.0004,x=A.x+Math.cos(a)*A.rx,y=A.y+Math.sin(a)*A.ry,W=46*(.85+.3*Math.sin(t*.015+i)),HH=W*1.9;c.globalAlpha=k;c.drawImage(fl,x-W/2,y-HH,W,HH);}c.restore();}
 if(now-e.burn.at<2200){const q=(now-e.burn.at)/2200,a=q<.12?q/.12:q>.75?(1-q)/.25:1;c.save();c.globalAlpha=a*k;text(c,'🔥 HỎA THIÊU BÍ CẢNH',450,A.y-A.ry-70,40,'#ffd36b',900);if(e.burn.name)text(c,short(e.burn.name),450,A.y-A.ry-30,24,'#ffffff',900);c.restore();}
}
function drawGiftFx(c,h,t,r){
 h.gifts=h.gifts.filter(g=>t-g.start<2600);
 // 17/11 chống lag mưa quà: chỉ vẽ 8 quà mới nhất; tia sáng chỉ cho quà lớn hoặc khi ít quà.
 const many=h.gifts.length>3;
 for(const g of h.gifts.slice(-8)){const p=posOf(h,g.user,t);if(!p)continue;const k=(t-g.start)/2600,big=g.tier==='grand'||g.tier==='ultimate',color=big?'#ffd36b':'#c79bff',gl=glow(h,color);
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-k)*.9;const R=(r+10)*(1+ease(k*1.6)*(big?2.6:1.4));if(gl)c.drawImage(gl,p.x-R,p.y-R,R*2,R*2);
  c.globalCompositeOperation='source-over';c.globalAlpha=1-k;c.strokeStyle=color;c.lineWidth=big?5:3;c.beginPath();c.arc(p.x,p.y,r+6+ease(k)*(big?70:36),0,TAU);c.stroke();
  if(k<.5&&(big||!many)){c.globalCompositeOperation='lighter';c.globalAlpha=(1-k*2)*.9;c.strokeStyle='#ffe9a8';c.lineWidth=3;c.lineCap='round';const n=big?16:10,R0=r+8,R1=r+8+ease(k*2)*(big?120:70);for(let i=0;i<n;i++){const a=i/n*TAU+(g.start%100)/100;c.beginPath();c.moveTo(p.x+Math.cos(a)*R0,p.y+Math.sin(a)*R0);c.lineTo(p.x+Math.cos(a)*R1,p.y+Math.sin(a)*R1);c.stroke();}}
  c.restore();
  const gi=img(h,giftFor(h.giftArt,g.value)?.url);c.save();c.globalAlpha=k<.8?1:(1-k)/.2;const ty=p.y-r-26-ease(k*2)*18;
  if(gi)c.drawImage(gi,p.x-46,ty-14,26,26);text(c,g.name,p.x+(gi?12:0),ty,big?17:15,big?'#ffe08a':'#f0e2ff',900);c.restore();}
}
function drawBanner(c,h,t){
 const b=h.banner;if(b&&t-b.start<3200){const k=(t-b.start)/3200,a=k<.12?k/.12:k>.8?(1-k)/.2:1,y=470;c.save();c.globalAlpha=a;
  const gr=c.createLinearGradient(0,y-46,0,y+46);gr.addColorStop(0,'#3a1d0000');gr.addColorStop(.5,'#3a1d00e8');gr.addColorStop(1,'#3a1d0000');c.fillStyle=gr;c.fillRect(0,y-46,900,92);
  const gi=img(h,giftFor(h.giftArt,b.value)?.url);if(gi)c.drawImage(gi,140,y-30,60,60);text(c,short(b.userName),470,y-16,24,'#ffffff',900);text(c,b.name,470,y+18,30,'#ffd36b',900);c.restore();}
 const w=h.waveBanner;if(w&&t-w.start<2600){const k=(t-w.start)/2600,a=k<.15?k/.15:k>.75?(1-k)/.25:1;c.save();c.globalAlpha=a;text(c,w.text,450,560,w.boss?46:40,w.boss?'#ffe08a':'#e8d4ff',900);c.restore();}
}
function drawDrops(c,h,t,r){
 const landed=new Map();
 for(const d of h.drops){const k=(t-d.start)/1100;if(k<0)continue;const p=posOf(h,d.id,t);if(!p)continue;const st=ORB_STYLE[d.kind],gl=glow(h,st.color);
  if(k>=1.4){const cur=landed.get(d.id);if(!cur||ORB_STYLE[cur.kind].rank<st.rank)landed.set(d.id,{kind:d.kind,p,at:d.start});continue;}
  const im=img(h,orbImage(d.kind,0)),fall=ease(Math.min(1,k)),y=p.y-r-14-(1-fall)*560,x=p.x+(1-fall)*((hash(d.id+d.kind)%140)-70),size=st.size;
  c.save();c.globalCompositeOperation='lighter';const R=size*st.glow;if(gl)c.drawImage(gl,x-R,y-R,R*2,R*2);
  if(k<1){c.globalAlpha=.6;c.strokeStyle=st.color;c.lineWidth=st.size/4;c.beginPath();c.moveTo(x,y-90*st.glow);c.lineTo(x,y);c.stroke();}
  else{const q=(k-1)/.4;c.globalAlpha=1-q;c.strokeStyle=st.color;c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,r+q*70*st.glow,0,TAU);c.stroke();
   if(d.kind!=='common'){const fl=img(h,'/assets/toa-ky-v1/fx-div-flare.webp');if(fl){c.globalAlpha=(1-q)*(d.kind==='divine'?1:.6);const F=st.size*2.4*(1+q);c.drawImage(fl,p.x-F/2,p.y-F/2,F,F);}}}
  c.restore();if(im)c.drawImage(im,x-size/2,y-size/2,size,size);}
 // Châu đã đậu: nằm trên đầu avatar, châu xịn sáng + nhấp nháy mạnh hơn
 for(const [id,{kind,p}] of landed){const st=ORB_STYLE[kind],im=img(h,orbImage(kind,0)),gl=glow(h,st.color),s=st.size*.62,x=p.x,y=p.y-r-s*.55,pulse=.75+.25*Math.sin(t/(kind==='divine'?110:200)+hash(id));
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=pulse;const R=s*st.glow;if(gl)c.drawImage(gl,x-R,y-R,R*2,R*2);
  if(kind==='divine'){const fl=img(h,'/assets/toa-ky-v1/fx-div-flare.webp');if(fl){c.globalAlpha=.55+.45*Math.sin(t/160);const F=s*2.2;c.drawImage(fl,x-F/2,y-F/2,F,F);}}
  c.restore();if(im)c.drawImage(im,x-s/2,y-s/2,s,s);}
}
const BLAST={spread:{R:150,ring:2,color:'#c79bff',shake:4,seal:null},ultimate:{R:240,ring:3,color:'#9fd8ff',shake:9,seal:'fx-vip-seal'},grand:{R:340,ring:4,color:'#ffd36b',shake:16,seal:'fx-div-seal',pillar:true}};
function drawBlast(c,h,b,k,t,light){
 const cfg=BLAST[b.assist];if(!cfg||k<.4)return;const q=clamp((k-.4)/.6),x=b.x2,y=b.y2,R=cfg.R*ease(q*1.3),fade=1-q;
 c.save();c.globalCompositeOperation='lighter';
 const gl=glow(h,cfg.color);if(gl){c.globalAlpha=fade*.85;const G=R*1.25;c.drawImage(gl,x-G,y-G*.62,G*2,G*1.24);}
 if(cfg.seal){const im=img(h,'/assets/toa-ky-v1/'+cfg.seal+'.webp');if(im){c.save();c.globalAlpha=fade;c.translate(x,y);c.scale(1,.55);c.rotate(t/900);const S=R*1.5;c.drawImage(im,-S/2,-S/2,S,S);c.restore();}}
 if(cfg.pillar&&!light){const im=img(h,'/assets/toa-ky-v1/fx-div-pillar.webp');if(im){c.globalAlpha=fade*(q<.15?q/.15:1);const W=160,HH=560;c.drawImage(im,x-W/2,y-HH,W,HH);}}
 c.globalAlpha=fade;c.strokeStyle=cfg.color;for(let i=0;i<cfg.ring;i++){const rr=R*(1-i*.18);if(rr<=4)continue;c.lineWidth=(cfg.ring-i)*2.2;c.beginPath();c.ellipse(x,y,rr,rr*.55,0,0,TAU);c.stroke();}
 if(!light){const n=b.assist==='grand'?18:b.assist==='ultimate'?12:7,seed=hash(b.id||b.from);c.lineWidth=3;c.lineCap='round';
  for(let i=0;i<n;i++){const a=(i/n)*TAU+(seed%100)/100,r0=R*.25,r1=R*(.65+((seed>>i)&7)/18);c.globalAlpha=fade*.9;c.beginPath();c.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0*.55);c.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1*.55);c.stroke();}}
 c.restore();
}
function drawSpells(c,h,t,light){
 h.bolts=h.bolts.filter(b=>t-b.start<SPELL_MS);
 for(const b of h.bolts){const k=(t-b.start)/SPELL_MS;if(k<0)continue;const from=posOf(h,b.from,t)||{x:b.x1,y:b.y1},idx=hash(b.from)%5;
  drawBlast(c,h,b,k,t,light);
  drawSpellFx(c,{index:idx,manual:b.manual,ultimate:b.assist==='grand'||b.assist==='ultimate',assist:b.assist==='spread'?undefined:b.assist},from,{x:b.x2,y:b.y2},b.boss?'#ffe08a':ELEMENT_COLORS[idx],k,light);
  if(b.hits&&k>.45&&!light){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-k)*.9;const gl=glow(h,BLAST[b.assist]?.color||ELEMENT_COLORS[idx]);for(const [hx,hy] of b.hits.slice(0,12))if(gl)c.drawImage(gl,hx-26,hy-26,52,52);c.restore();}}
}
// Rung màn: chiêu quà chạm đích → rung theo nấc (CUỒNG HÓA không rung). Chỉ rung sân, bảng chữ đứng yên cho dễ đọc.
const GIFT_SHAKE={boost:5,spread:9,ultimate:14,grand:22};
function shakeAt(h,t){let amp=0;for(const g of h.gifts){const k=(t-g.start)/650;if(k<0||k>1)continue;amp=Math.max(amp,(GIFT_SHAKE[g.tier]||4)*(1-k));}for(const b of h.bolts){const cfg=BLAST[b.assist];if(!cfg)continue;const k=(t-b.start)/SPELL_MS;if(k<.42||k>.9)continue;amp=Math.max(amp,cfg.shake*(1-(k-.42)/.48));}
 if(amp<.5)return null;return {x:Math.sin(t*.09)*amp,y:Math.cos(t*.113)*amp*.7,amp};}
export function drawMountRealm(scene,c,t,H){
 const e=scene.mountRealmStatus;if(!e)return 0;const h=rz(scene);load(h,e);const WAVES=realmLayout(e).waves;
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 const sh=scene.motion===false?null:shakeAt(h,t);c.save();if(sh)c.translate(sh.x,sh.y);worldZoom(c,H); /* 18/11: map phủ kín màn 9:16 (chủ game: không full màn điện thoại) */
 const bg=background(h,H);if(bg)c.drawImage(bg,-12,-12,924,H+24);
 const now=nowAt(scene,t),members=e.members||[],n=members.length,crowd=n>60,light=crowd||scene.budget?.level==='light',moving=scene.motion!==false;
 if(e.burn&&now<e.burn.until)drawBurn(c,h,e,t,now,light);
 for(const [x,y,wave,hp] of (e.mobs||[]).slice(0,70)){const s=mobSprite(h,WAVES[wave]);if(!s)continue;const bob=moving?Math.sin(t*.004+x)*2:0;c.drawImage(s.cv,x-s.w/2,y-s.h+bob,s.w,s.h);if(hp<100)bar(c,x-18,y+4,36,4,hp/100,'#ff6a6a');}
 if(e.boss&&e.boss.hp>0){const m=mountById(e.boss.mount),sc=1.45;drawMount(c,e.boss.mount,e.boss.x,e.boss.y+70,{scale:sc,t:moving?t:0,lod:crowd?'light':'full',seed:'boss'});drawMount(c,e.boss.mount,e.boss.x,e.boss.y+70,{scale:sc,t:moving?t:0,lod:crowd?'light':'full',seed:'boss',layer:'front'});
  text(c,'THÚ VƯƠNG · '+(m?.name||'').toUpperCase(),450,350,22,'#ffe08a',900);bar(c,170,370,560,14,e.boss.hp/e.boss.maxHp,'#ffcf5a');}
 const r=n<=40?19:n<=120?15:12,pts=[];
 for(const m of members){const p=posOf(h,m.id,t);if(p)pts.push([m,p.x,p.y]);}
 pts.sort((a,b)=>a[2]-b[2]);
 let boosted=0;
 for(const [m,x,y] of pts){
  // 16/11 (chủ game: "cường hóa thì avt sáng lên, mọc cánh"): đang CUỒNG HÓA → mọc cánh lửa vỗ, quầng lửa nhịp, avatar to ×1,35 (tối đa 14 người cùng lúc cho nhẹ).
  const hot=m.boost&&boosted++<8; /* 17/11: 14 → 8 người mọc cánh cùng lúc (chống lag) */
  if(hot){const wi=img(h,'/assets/arena-v1/wings-4000-xich-diem.webp'),flap=moving?1+.12*Math.sin(t/110+x):1,W=r*7.2*flap,Hh=W*.66;
   const gl=glow(h,'#ff9a3c');c.save();c.globalCompositeOperation='lighter';if(gl){c.globalAlpha=.6+.3*Math.sin(t/90+y);c.drawImage(gl,x-r*2.6,y-r*2.6,r*5.2,r*5.2);}c.restore();
   if(wi){c.save();c.globalAlpha=.95;c.drawImage(wi,x-W/2,y-Hh*.62,W,Hh);c.restore();}}
  else if(m.boost&&!crowd){const gl=glow(h,'#b98cff');if(gl){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.55+.25*Math.sin(t/120);c.drawImage(gl,x-r-14,y-r-14,(r+14)*2,(r+14)*2);c.restore();}}
  const s=avatarSprite(h,m,r);if(s){const k=hot?1.35+.05*Math.sin(t/140):1;c.drawImage(s.cv,x-s.size*k/2,y-s.size*k/2,s.size*k,s.size*k);}
  if(hot){c.save();c.strokeStyle='#ffcf6a';c.lineWidth=3;c.globalAlpha=.7+.3*Math.sin(t/100);c.beginPath();c.arc(x,y,r*1.42,0,TAU);c.stroke();c.restore();}
  if(!crowd){const l=label(h,short(m.name));if(l)c.drawImage(l.cv,x-l.w/2,y+r+2,l.w,l.h);}
 }
 drawSpells(c,h,t,light);drawGiftFx(c,h,t,r);c.restore();
 if(sh&&sh.amp>10){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(.35,(sh.amp-10)/18);c.fillStyle='#ffe9b0';c.fillRect(0,0,900,H);c.restore();}
 const phase=e.phase==='registration'?'TẬP HỢP · '+secs(e.registrationEndsAt-now)+' s':e.phase==='running'?'LÀN '+(e.wave+1)+'/3 · '+(realmLayout(e).waves[e.wave]?.name||'')+' · '+secs(e.waveEndsAt-now)+' s':e.phase==='boss'?'THÚ VƯƠNG · '+secs(e.waveEndsAt-now)+' s':'KHÉP LẠI';
 text(c,'TỌA KỸ BÍ CẢNH · '+realmLayout(e).name.toUpperCase(),450,50,34,'#e8d4ff',900,'center',860);text(c,phase+' · '+n+' đạo hữu',450,96,21,'#ffffff',800);
 const done=e.phase==='finished'&&e.results;
 if(!done){drawGuide(c,e);drawGiftBoard(c,h);}
 drawOrbBoard(c,h,H,e);drawTop(c,e,H);drawBanner(c,h,t);
 if(done){const R=e.results;box(c,16,136,868,186,'#ffd36b');
  text(c,R.tamed?'THÚ VƯƠNG ĐÃ BỊ THU PHỤC':'BÍ CẢNH KHÉP LẠI',450,166,30,'#ffe08a',900);
  (R.top||[]).slice(0,3).forEach((x,i)=>text(c,(i+1)+'. '+short(x.name)+' · '+x.bossDmg+' sát thương Thú vương',450,206+i*32,21,'#ffffff',800));
  text(c,R.rewarded+' đạo hữu nhận Linh Châu · gõ truyencong để mở',450,302,19,'#d9c2ff',800);}
 c.save();worldZoom(c,H);drawDrops(c,h,t,r);c.restore();
 return n;
}
