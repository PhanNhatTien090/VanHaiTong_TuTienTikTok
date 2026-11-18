// 17/11/2026 (chủ game): NGUYỆT HẠ TÌNH LÂU — overlay cho love-tower.mjs.
// 1) Tình Lâu góc phải map lễ: 6 cửa sổ, phòng có đôi thì sáng hồng + 2 người ngồi đối diện + tim bay ra.
// 2) Đình Nguyệt: quầng tim quanh đôi đang song tu trên sân.
// 3) Chiếu riêng (server hẹn giờ, love.cuts): Uyên Ương Mật Thất (≥30) — bình phong lụa hạ xuống, chỉ thấy BÓNG hai người NGỒI
//    đối diện chạm tay, khí song tu xoáy, 3 nhịp bùng → "SONG TU ĐẠI THÀNH". Tiên Lữ Đại Điển (một món ≥100) — lễ trên cầu rồi vào Mật Thất.
//    Song tu kiểu tu tiên, KHÔNG cảnh quan hệ (luật TikTok). Biến thể: 3 phòng × 3 kiểu khí × màu, server né biến thể vừa dùng.
import {makeSurface} from './performance.js';
import {skinFor} from './cosmetics.js';
import {drawCaster,cutVeil,txt,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawBurst,drawEmbers,drawVignette,drawLetterbox} from './cut-fx.js?v=20261118';
const TAU=Math.PI*2;
// Ngồi thiền (stand:0 — tư thế song tu/cùng tu có sẵn), không vẽ tư thế mới.
export function drawSeated(scene,c,player,x,y,scale,t,flip){if(!player)return;const oc=scene.compact,op=scene.cinematicPose;scene.compact=true;scene.cinematicPose={...(op||{}),stand:0,lift:0,lean:0};c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(scale,scale);try{scene.drawCharacterBody(c,player,skinFor(player.giftCoins),t);}catch{}finally{c.restore();scene.compact=oc;scene.cinematicPose=op;}}
export const LOVE_ART=Object.freeze({tower:'/assets/love-v1/love-tower-cut.webp' /* 18/11: đã tách nền trời (cắt theo viền lầu), cửa sổ giữ nguyên vị trí */,rooms:['/assets/love-v1/room-candle.webp','/assets/love-v1/room-bamboo.webp','/assets/love-v1/room-ice.webp'],bridge:'/assets/event-maps-v1/bond-festival.webp'});
// Ô cửa sổ trong ảnh Tình Lâu (tỉ lệ 0–1 theo ảnh vuông) — đo từ ảnh thật.
export const TOWER_WINDOWS=Object.freeze([[.171,.317],[.535,.317]].map(([x,y])=>({x,y,w:.295,h:.337}))); // 2 phòng to — đo từ love-tower-2.webp
export const TOWER_BOX=Object.freeze({x:312,y:.14,size:290}); // 17/11: bậc thang dưới cây Nguyệt Lão, gần sân — dưới bảng sự kiện nhỏ giữa mép trên (Ba Túi Linh Lộc…) — cột phải LIVE có thêm thẻ Tiên Đế + bảng giờ lễ che mất góc phải // vị trí trên màn 900 px, y theo H
const ROOM_PAL=[{main:'#ff5a7a',soft:'#ffd2dc',gold:'#ffe7a8',deep:'#1a0508'},{main:'#5affb4',soft:'#d8ffe9',gold:'#fff3c0',deep:'#03140c'},{main:'#8fd8ff',soft:'#e6f6ff',gold:'#f2e9ff',deep:'#040b18'}];
const hasDoc=()=>typeof document!=='undefined';
const imgs=new Map();
function img(src){if(imgs.has(src))return imgs.get(src);if(typeof Image==='undefined'){imgs.set(src,null);return null;}const im=new Image();im.decoding='async';im.src=src;imgs.set(src,im);return im;}
const ready=im=>im&&im.complete&&im.naturalWidth>0;
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
export function syncLoveTower(scene,state){
  scene.loveStatus=state?.loveTower||null; // server chỉ gửi khi lễ đang mở (hoặc vừa đóng ≤20 s để chiếu nốt)
  // chỉ mục riêng: người trong phòng bị ẩn khỏi sân (không có trong scene.playerIndex) nhưng vẫn phải vẽ trong cửa sổ / màn chiếu
  const L=scene.loveStatus,ids=new Set();for(const r of L?.rooms||[])if(r){ids.add(r.a);ids.add(r.b);}for(const x of L?.cuts||[]){ids.add(x.a);ids.add(x.b);}
  scene.lovePlayers=new Map((state?.players||[]).filter(p=>ids.has(p.id)).map(p=>[p.id,p]));
  if(hasDoc())document.body?.classList?.toggle('love-festival',!!scene.loveStatus?.active); // ẩn bảng hướng dẫn chung (Rèn pháp bảo…) trong lễ
  if(scene.loveStatus){img(LOVE_ART.tower);img(LOVE_ART.bridge);for(const r of LOVE_ART.rooms)img(r);}
}
let heart;
function heartSprite(){if(heart!==undefined)return heart;const s=makeSurface(40,40);heart=s||null;if(!s)return null;const c=s.getContext('2d');c.translate(20,21);const g=c.createLinearGradient(-12,-15,10,15);g.addColorStop(0,'#fff0f6');g.addColorStop(.35,'#ff8fc4');g.addColorStop(1,'#e2408a');c.beginPath();c.moveTo(0,14);c.bezierCurveTo(-7,9,-16,0,-14,-7);c.bezierCurveTo(-12,-15,-4,-16,0,-9);c.bezierCurveTo(5,-17,13,-15,14,-7);c.bezierCurveTo(16,0,6,9,0,14);c.closePath();c.fillStyle=g;c.fill();return s;}
function drawHeart(c,x,y,s,a){const im=heartSprite();if(!im||a<=.01)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-s/2,y-s/2,s,s);}
// Người đang ở trong phòng Tình Lâu (còn giờ) → ẩn khỏi sân, chỉ thấy trong cửa sổ (chủ game 17/11).
// 18/11 (chủ game: "hình ghép nhìn giả, ít nhất xóa background"): nội thất phòng ánh nến thay khối hồng — tường gỗ đỏ trầm,
// ô cửa tròn trăng sau lưng, rèm lụa hai bên, sàn tối, quầng nến ấm sau lưng hai người. Dựng 1 lần theo cỡ ô (makeSurface), mỗi khung chỉ dán.
const roomCache=new Map();
function roomInterior(w,h,lit){const key=Math.round(w)+'x'+Math.round(h)+(lit?'L':'D');if(roomCache.has(key))return roomCache.get(key);
  const s=makeSurface(Math.ceil(w),Math.ceil(h));roomCache.set(key,s||null);if(!s)return null;const c=s.getContext('2d');
  const wall=c.createLinearGradient(0,0,0,h);wall.addColorStop(0,lit?'#3b130f':'#1a0907');wall.addColorStop(.7,lit?'#5a1d14':'#220b08');wall.addColorStop(1,lit?'#2a0d09':'#120504');c.fillStyle=wall;c.fillRect(0,0,w,h);
  if(lit){const g=c.createRadialGradient(w/2,h*.62,4,w/2,h*.62,w*.62);g.addColorStop(0,'rgba(255,196,120,.85)');g.addColorStop(.45,'rgba(255,120,80,.35)');g.addColorStop(1,'rgba(255,90,60,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
  c.strokeStyle=lit?'rgba(255,214,140,.55)':'rgba(255,214,140,.18)';c.lineWidth=Math.max(1.5,w*.018);c.beginPath();c.arc(w/2,h*.4,Math.min(w,h)*.27,0,TAU);c.stroke(); // ô cửa tròn
  if(lit){const m=c.createRadialGradient(w/2,h*.4,0,w/2,h*.4,Math.min(w,h)*.26);m.addColorStop(0,'rgba(255,240,210,.35)');m.addColorStop(1,'rgba(255,240,210,0)');c.fillStyle=m;c.beginPath();c.arc(w/2,h*.4,Math.min(w,h)*.26,0,TAU);c.fill();}
  c.fillStyle=lit?'rgba(20,6,4,.55)':'rgba(0,0,0,.5)';c.fillRect(0,h*.84,w,h*.16); // sàn
  for(const side of [0,1]){const x0=side?w:0,d=side?-1:1,silk=c.createLinearGradient(x0,0,x0+d*w*.2,0);silk.addColorStop(0,lit?'rgba(220,40,70,.95)':'rgba(120,20,36,.8)');silk.addColorStop(1,'rgba(220,40,70,0)');c.fillStyle=silk;
    c.beginPath();c.moveTo(x0,0);c.lineTo(x0+d*w*.3,0);c.quadraticCurveTo(x0+d*w*.12,h*.3,x0+d*w*.16,h*.62);c.quadraticCurveTo(x0+d*w*.06,h*.8,x0,h*.9);c.closePath();c.fill();}
  const top=c.createLinearGradient(0,0,0,h*.18);top.addColorStop(0,'rgba(0,0,0,.45)');top.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=top;c.fillRect(0,0,w,h*.18);
  return s;}
export function loveRoomIds(scene){const L=scene.loveStatus,out=new Set();if(!L?.active)return out;const now=scene.stateServerNow||Date.now();for(const r of L.rooms||[])if(r&&r.until>now){out.add(r.a);out.add(r.b);}return out;}
// ---------- 1) Tình Lâu trên map ----------
export function towerRect(H){return {x:TOWER_BOX.x,y:H*TOWER_BOX.y,s:TOWER_BOX.size};}
export function windowRect(i,H){const b=towerRect(H),w=TOWER_WINDOWS[i];return {x:b.x+w.x*b.s,y:b.y+w.y*b.s,w:w.w*b.s,h:w.h*b.s};}
export function drawLoveTower(scene,c,t,H){
  const L=scene.loveStatus;if(!L||scene.cutFullActive)return;
  const now=nowAt(scene,t),b=towerRect(H),art=img(LOVE_ART.tower),light=scene.budget?.level==='light'||(scene.visibleActors||0)>30,bare=(scene.visibleActors||0)>50;
  c.save();
  if(ready(art)){c.globalAlpha=1;c.drawImage(art,b.x,b.y,b.s,b.s);}
  else{c.globalAlpha=.85;c.fillStyle='#2a0f1e';c.fillRect(b.x,b.y,b.s,b.s);}
  c.globalAlpha=1;txt(c,'TÌNH LÂU',b.x+b.s/2,b.y+b.s*.9,20,'#ffd6e6',{width:5,weight:'900'});
  const idx=scene.lovePlayers||scene.playerIndex||new Map();
  L.rooms.forEach((r,i)=>{const w=windowRect(i,H);
    if(!r){const d=roomInterior(w.w,w.h,false);c.globalAlpha=.9;if(d)c.drawImage(d,w.x,w.y,w.w,w.h);c.globalAlpha=1;return;}
    const pulse=.75+.25*Math.sin(t*.004+i),room=roomInterior(w.w,w.h,true);c.globalAlpha=1;if(room)c.drawImage(room,w.x,w.y,w.w,w.h);
    c.globalAlpha=.18+.12*pulse;dot(c,'#ffb070',w.x+w.w/2,w.y+w.h*.66,w.w*.42,1);c.globalAlpha=1; /* nến lay động */
    if(!bare){c.save();c.beginPath();c.rect(w.x,w.y,w.w,w.h);c.clip();const fy=w.y+w.h*1.07,sc=w.h/88;
      drawSeated(scene,c,idx.get(r.a),w.x+w.w*.3,fy,sc,t,false);drawSeated(scene,c,idx.get(r.b),w.x+w.w*.7,fy,sc,t,true);c.restore();}
    {const fl=c.createLinearGradient(0,w.y+w.h*.8,0,w.y+w.h);fl.addColorStop(0,'rgba(20,4,4,0)');fl.addColorStop(1,'rgba(20,4,4,.55)');c.fillStyle=fl;c.fillRect(w.x,w.y+w.h*.8,w.w,w.h*.2);} /* bóng sàn che chân, người như ngồi trong phòng */
    c.globalAlpha=1;c.strokeStyle='#ffd27a';c.lineWidth=2;c.strokeRect(w.x,w.y,w.w,w.h);
    {const nm=s=>Array.from(String(s||'')).slice(0,10).join('');txt(c,nm(r.aName),w.x+w.w/2,w.y+11,12,'#fff',{width:4,weight:'800',max:w.w-6});txt(c,'♥ '+nm(r.bName),w.x+w.w/2,w.y+26,12,'#ffe1ee',{width:4,weight:'800',max:w.w-6});}
    if(!light)for(let j=0;j<4;j++){const u=((t*.0006+j/4+i*.13)%1);drawHeart(c,w.x+w.w*(.3+.4*((j*37+i*11)%10)/10)+Math.sin(u*9+j)*6,w.y-u*40,10+u*6,(1-u)*.9);}
  });
  // 2 phòng + hàng chờ (chủ game 17/11: 2 phòng to, ai muốn vào thì xếp hàng)
  const nm=s=>Array.from(String(s||'')).slice(0,9).join('');let ly=b.y+b.s*.9+22;
  if(L.queueCount){txt(c,'Hàng chờ: '+L.queueCount+' đôi',b.x+b.s/2,ly,16,'#ffffff',{width:6,weight:'900'});ly+=19;for(const q of (L.queue||[]).slice(0,2)){txt(c,nm(q.aName)+' ♥ '+nm(q.bName),b.x+b.s/2,ly,14,'#fff',{width:5,weight:'800',max:b.s+30});ly+=17;}}
  c.restore();
  // 2) Đình Nguyệt — quầng tim quanh đôi đang song tu trên sân
  if(bare)return;
  const cam=scene.lastCam||{s:1,x:0,y:0},scr=p=>p&&{x:p.x*cam.s+cam.x,y:p.y*cam.s+cam.y};
  for(const g of L.gardens||[]){if(g.until<now)continue;const A=scr(scene.targets?.find(p=>p.id===g.a)),B=scr(scene.targets?.find(p=>p.id===g.b));if(!A||!B)continue;
    c.save();for(const P of [A,B]){const n=light?3:6;for(let j=0;j<n;j++){const u=((t*.0007+j/n)%1),a=j*TAU/n+t*.0012;drawHeart(c,P.x+Math.cos(a)*28,P.y-40-u*60,12,(1-u)*.85);}}
    c.globalAlpha=.5;c.strokeStyle='#ff8fc4';c.lineWidth=2;c.beginPath();c.moveTo(A.x,A.y-50);c.quadraticCurveTo((A.x+B.x)/2,Math.min(A.y,B.y)-110,B.x,B.y-50);c.stroke();c.restore();}
}
// ---------- 3) Chiếu riêng ----------
export function findLoveCut(L,now){let best=null;for(const x of L?.cuts||[]){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,k:best.age/best.x.ms}:null;}
export function loveCutFrame(scene,c,t,H){
  const L=scene.loveStatus,cut=L?findLoveCut(L,nowAt(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
  if(!!scene.loveCutOn!==!!cut){scene.loveCutOn=!!cut;if(hasDoc())document.body?.classList?.toggle('cutscene-on',!!cut);}
  if(cut||scene.loveVeilUsed){scene.loveVeilUsed=!!cut;cutVeil(cut,full);}
  if(!full)return false;
  if(scene.canvas)c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over'; // như tower-cutscene: phủ đúng cả khung
  try{drawLoveCut(scene,c,t,H,cut.x,cut.k);}catch(err){console.warn('[love-cut]',err);return false;}
  const seen=scene.loveCutSeen??=new Set(),sec=cut.age/1000;for(const at of beatsOf(cut.x)){const id=cut.x.id+':'+at;if(sec>=at&&sec<at+.6&&!seen.has(id)){seen.add(id);scene.onFeedbackSound?.('hit',2);}}
  if(seen.size>60)scene.loveCutSeen=new Set([...seen].slice(-20));
  return true;
}
// Mốc thời gian (giây) của 3 nhịp bùng trong Mật Thất.
const SECRET={enter:.1,screen:.3,down:.42,beats:[.55,.66,.77],done:.84};
function secretSpan(x){return x.tier==='grand'?{from:.55,to:1}:{from:0,to:1};} // 18/11: lễ Nguyệt Lão dài hơn (có cao trào riêng)
export function beatsOf(x){const sp=secretSpan(x),ms=x.ms/1000;return SECRET.beats.map(b=>+(ms*(sp.from+(sp.to-sp.from)*b)).toFixed(2));}
let shadowCv=null;
function shadowLayer(w,h){if(!shadowCv||shadowCv.width!==w||shadowCv.height!==h)shadowCv=makeSurface(w,h);return shadowCv;}
export function drawLoveCut(scene,c,t,H,x,k){
  if(x.tier==='grand'&&k<secretSpan(x).from)return drawGrandRite(scene,c,t,H,x,k/secretSpan(x).from);
  const sp=secretSpan(x);return drawSecretRoom(scene,c,t,H,x,(k-sp.from)/(sp.to-sp.from),x.tier==='grand');
}
function bgCover(c,im,H,zoom=1,fy=.5){if(!ready(im))return false;const s=Math.max(900/im.naturalWidth,H/im.naturalHeight)*zoom,w=im.naturalWidth*s,h=im.naturalHeight*s;c.drawImage(im,450-w/2,H*fy-h*fy,w,h);return true;}
const short=(s,n=12)=>Array.from(String(s||'')).slice(0,n).join('');
function drawSecretRoom(scene,c,t,H,x,k,grand){
  const P=ROOM_PAL[x.room%3]||ROOM_PAL[0],motion=scene.motion!==false,light=scene.budget?.level==='light',rf=scene.reduceFlash;
  const idx=scene.lovePlayers||scene.playerIndex||new Map(),A=idx.get(x.a),B=idx.get(x.b);
  const enter=smooth(seg(k,SECRET.enter,SECRET.screen-.06)),drop=out3(seg(k,SECRET.screen,SECRET.down)),beatSec=SECRET.beats.map(b=>(k-b)*x.ms*(grand?.45:1)/1000);
  const charge=seg(k,SECRET.down,SECRET.beats[2]),done=seg(k,SECRET.done,1);
  const zoom=motion?1.04+.05*smooth(seg(k,0,SECRET.down))+.04*charge+beatSec.reduce((n,s)=>n+punch(s,.035),0):1;
  fxCamera(c,450,H*.55,zoom,motion&&beatSec.some(s=>s>0&&s<.35)?6:0,t);
  c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
  bgCover(c,img(LOVE_ART.rooms[x.room%3]),H,1.02);
  dot(c,P.main,450,H*.55,H*.45,.14+.14*charge);
  // Hai người bước vào, ngồi đối diện (chưa có bình phong): ảnh thật.
  const fy=H*.6,ax=450-185+(1-enter)*-260,bx=450+185+(1-enter)*260,sc=3.1; // chân đặt lên 2 nệm trong ảnh phòng
  const sit=enter>=.98,draw=sit?drawSeated:drawCaster;
  if(drop<1){c.save();c.globalAlpha=1-drop*.9;draw(scene,c,A,ax,fy,sc,t,false);draw(scene,c,B,bx,fy,sc,t,true);c.restore();}
  // Bình phong lụa hạ xuống: giấy sáng ấm, bóng hai người NGỒI đối diện in lên lụa.
  const scrTop=H*.34,scrBot=H*.72,scrX0=170,scrX1=730,curY=scrTop-(1-drop)*(scrBot-scrTop+60);
  if(drop>0){
    c.save();c.beginPath();c.rect(scrX0,curY,scrX1-scrX0,scrBot-curY);c.clip();
    const flick=motion?.9+.1*Math.sin(t*.011)*Math.sin(t*.0037):1;const g=c.createLinearGradient(0,scrTop,0,scrBot);g.addColorStop(0,'#fde6cf');g.addColorStop(.55,'#f7d2b0');g.addColorStop(1,'#e9b48e');c.globalAlpha=.88;c.fillStyle=g;c.fillRect(scrX0,curY,scrX1-scrX0,scrBot-curY);
    c.globalAlpha=.5*flick;dot(c,'#ffd9a0',450,H*.62,300,1);dot(c,P.soft,450,H*.6,200,.35+.25*charge); // nến sau lưng rọi lên lụa, lay động
    c.globalAlpha=.16;c.fillStyle='#b8485a';for(let i=0;i<22;i++){const bx0=scrX0+30+((i*137)%(scrX1-scrX0-60)),by0=curY+40+((i*89)%Math.max(60,scrBot-curY-80));if(by0<curY)continue;for(let pt=0;pt<5;pt++){const a=pt*TAU/5+i;c.beginPath();c.arc(bx0+Math.cos(a)*7,by0+Math.sin(a)*7,5,0,TAU);c.fill();}} // hoa mai thêu mờ
    c.globalAlpha=.12;c.strokeStyle='#6a2a1c';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(scrX0+20,scrBot-30-i*90);c.bezierCurveTo(scrX0+160,scrBot-120-i*90,scrX0+260,scrBot-40-i*80,scrX0+380,scrBot-150-i*70);c.stroke();} // cành
    c.globalAlpha=1;
    const lay=shadowLayer(900,Math.ceil(H));if(lay){const s=lay.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,900,H);s.globalCompositeOperation='source-over';
      const lean=motion?Math.sin(t*.0015)*3:0;drawSeated(scene,s,A,450-150+lean,fy,sc,t,false);drawSeated(scene,s,B,450+150-lean,fy,sc,t,true);
      s.globalCompositeOperation='source-in';s.fillStyle='#3a1020';s.fillRect(0,0,900,H);s.globalCompositeOperation='source-over';
      c.save();c.globalAlpha=.72*smooth(seg(drop,.4,1));if('filter' in c)c.filter='blur(3px)';c.drawImage(lay,0,0);if('filter' in c)c.filter='none';c.restore();}
    // khung gỗ + nan lụa 4 tấm
    c.globalAlpha=1;c.strokeStyle='#7a2a1c';c.lineWidth=7;for(let i=0;i<=4;i++){const xx=scrX0+(scrX1-scrX0)*i/4;c.beginPath();c.moveTo(xx,curY);c.lineTo(xx,scrBot);c.stroke();}
    c.lineWidth=2;c.globalAlpha=.25;for(let yy=curY+40;yy<scrBot;yy+=46){c.beginPath();c.moveTo(scrX0,yy);c.lineTo(scrX1,yy);c.stroke();}
    c.globalAlpha=1;c.lineWidth=9;c.strokeStyle='#c9902e';c.strokeRect(scrX0,curY,scrX1-scrX0,scrBot-curY);
    c.restore();
    // khung gỗ chạm: xà trên, chân dưới, 4 góc hoa văn vàng (ngoài vùng cắt để nổi lên)
    c.save();c.fillStyle='#5a1e14';c.fillRect(scrX0-18,curY-22,scrX1-scrX0+36,24);c.fillRect(scrX0-10,scrBot-4,scrX1-scrX0+20,16);
    c.fillStyle='#d9a441';c.fillRect(scrX0-18,curY-22,scrX1-scrX0+36,4);c.fillRect(scrX0-18,curY-2,scrX1-scrX0+36,3);
    for(const [qx,qy] of [[scrX0,curY],[scrX1,curY],[scrX0,scrBot],[scrX1,scrBot]]){c.beginPath();c.arc(qx,qy,14,0,TAU);c.fill();c.fillStyle='#7a2a1c';c.beginPath();c.arc(qx,qy,6,0,TAU);c.fill();c.fillStyle='#d9a441';}
    for(const fx0 of [scrX0+40,scrX1-40]){c.fillStyle='#5a1e14';c.fillRect(fx0-18,scrBot+10,36,18);}
    c.restore();
  }
  // Khí song tu giữa hai bóng (phía trước lụa): âm dương / phượng hoàng / song liên.
  const cx=450,cy=H*.56,qa=smooth(seg(k,SECRET.down-.02,SECRET.beats[0]))*(1-done*.6);
  if(qa>0){c.save();c.globalCompositeOperation='lighter';const spin=t*.002*(x.qi===1?-1:1);
    if(x.qi===0){for(let i=0;i<2;i++){const a=spin+i*Math.PI,r=70+charge*40;dot(c,i?P.main:P.soft,cx+Math.cos(a)*r*.6,cy+Math.sin(a)*r*.6,40+charge*22,qa*.45);}drawCircle(c,cx,cy,150+charge*60,qa*.8,t,{...PALETTES.gold,...P},1);}
    else if(x.qi===1){const n=light?40:110;for(let i=0;i<n;i++){const u=(i/n+t*.00025)%1,side=i%2?1:-1,a=u*TAU*1.5;const px=cx+side*Math.sin(a)*(120*(1-u)+20),py=cy+90-u*300;dot(c,i%3?P.main:'#ffd27a',px,py,10+(1-u)*14,qa*(1-u)*.9);}}
    else{for(let p=0;p<2;p++){const ox=cx+(p?110:-110);for(let i=0;i<8;i++){const a=i*TAU/8+spin*.5,open=.5+.5*charge;c.globalAlpha=qa*.55;c.fillStyle=p?P.main:P.soft;c.beginPath();c.ellipse(ox+Math.cos(a)*24*open,cy+30+Math.sin(a)*12*open,30*open+8,10,a,0,TAU);c.fill();}}}
    // tim bay lên dày dần
    const hn=light?16:48;for(let i=0;i<hn;i++){const u=((i*.618+t*.0003)%1);drawHeart(c,cx+Math.sin(i*7.3+t*.001)*(80+u*240),cy+120-u*(H*.5),12+u*16,qa*(1-u)*.95);}
    c.restore();}
  // 3 nhịp bùng
  for(const s of beatSec)if(s>=0&&s<1.4)drawBurst(c,cx,cy-40,s,{...P,gold:P.gold},H,{light,pillar:false,flash:false,scale:.42,seed:x.hue%7+1,reduceFlash:true}); // 18/11: bỏ chớp trắng, nhỏ lại — không che dáng hai người
  drawEmbers(c,H,charge*.8,t,{...P},light);
  c.restore();c.globalAlpha=1;
  drawVignette(c,H,.35+.2*charge,450,H*.56);
  drawLetterbox(c,H,seg(k,0,.08)*(1-seg(k,SECRET.done,1)));
  // CHỮ
  const names=short(x.aName)+' ♥ '+short(x.bName);
  if(k<SECRET.done){const a=smooth(seg(k,.04,.14));c.globalAlpha=a;txt(c,'UYÊN ƯƠNG MẬT THẤT',450,H*.14,52,'#ffe3ee',{width:11,max:860});txt(c,names,450,H*.14+52,30,P.gold,{width:7,weight:'800',max:840});
    if(drop>.9)txt(c,'Bế quan song tu',450,H*.85,28,'#ffffff',{width:7,weight:'800'});c.globalAlpha=1;}
  else{const u=seg(k,SECRET.done,1),pop=1+.4*(1-out3(seg(u,0,.3)));c.save();c.translate(450,H*.3);c.scale(pop,pop);txt(c,'SONG TU ĐẠI THÀNH!',0,0,62,'#ffe9a8',{width:12,max:860});c.restore();txt(c,names,450,H*.3+62,30,'#ffd2dc',{width:7,weight:'800',max:840});
    if(grand)txt(c,'Thần Tiên Quyến Lữ',450,H*.3+104,34,'#ffd54a',{width:8,weight:'900'});}
  const o=seg(k,.94,1);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
// 18/11 v2 (chủ game: "100 coin phải khác 30 coin"): LỄ DƯỚI CÂY NGUYỆT LÃO (ảnh map lễ, cây + trăng + đèn) → hai người bước lại,
// TƠ HỒNG từ cây buông xuống buộc hai người, đèn trời bay lên → cúi lạy → CAO TRÀO RIÊNG: hai dải khí đỏ–vàng xoắn bay lên, kết thành
// TRÁI TIM lớn, bùng ra chữ THẦN TIÊN QUYẾN LỮ (30 coin không có). Rồi mới vào Mật Thất.
function drawGrandRite(scene,c,t,H,x,k){
  const motion=scene.motion!==false,light=scene.budget?.level==='light',rf=scene.reduceFlash,P={main:'#ff4d6d',soft:'#ffe0e8',gold:'#ffd54a',deep:'#12040c'};
  const idx=scene.lovePlayers||scene.playerIndex||new Map(),A=idx.get(x.a),B=idx.get(x.b);
  const walk=smooth(seg(k,.06,.34)),thread=smooth(seg(k,.3,.46)),bow=seg(k,.44,.58),rise=seg(k,.56,.8),heart=seg(k,.74,1),fw=[.6,.72,.84].map(b=>(k-b)*x.ms*.55/1000);
  fxCamera(c,450,H*.6,motion?1+.05*smooth(k)+punch((k-.78)*x.ms*.55/1000,.05):1,motion&&heart>0&&heart<.15?8:0,t);
  c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
  if(!bgCover(c,img(LOVE_ART.bridge),H,2.55-.12*smooth(k),0)){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c0a33');g.addColorStop(1,'#3a0f2a');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);}
  {const g=c.createLinearGradient(0,H*.45,0,H);g.addColorStop(0,'rgba(18,4,12,0)');g.addColorStop(1,'rgba(18,4,12,.75)');c.fillStyle=g;c.fillRect(-200,H*.45,1300,H*.6);}
  // đèn trời bay lên
  c.save();c.globalCompositeOperation='lighter';const nl=light?8:22;for(let i=0;i<nl;i++){const u=((i*.53+t*.00006+k*.4)%1),lx=40+((i*173)%820)+Math.sin(t*.0008+i)*20,ly=H*(1.05-u*1.1),s0=10+(i%4)*4;c.globalAlpha=Math.min(1,u*4)*(1-u)*.95;dot(c,'#ffb15a',lx,ly,s0*3,.5);c.fillStyle='#ffd08a';c.beginPath();c.ellipse(lx,ly,s0*.7,s0,0,0,TAU);c.fill();}c.restore();c.globalAlpha=1;
  for(const s of fw)if(s>=0&&s<1.6)drawBurst(c,450+(fw.indexOf(s)%3-1)*240,H*(.16+.05*fw.indexOf(s)),s,{...P},H,{light,pillar:false,flash:false,scale:.6,seed:fw.indexOf(s)+2,reduceFlash:rf});
  const fy=H*.8,gap=150-60*walk,ax=450-gap-(1-walk)*300,bx=450+gap+(1-walk)*300,sc=3.4;
  // tơ hồng từ cây Nguyệt Lão buông xuống buộc hai người
  if(thread>0){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const tx=450,ty=H*.2;for(const [px,side] of [[ax+20,-1],[bx-20,1]]){c.strokeStyle='#ff3a5c';c.lineWidth=5;c.globalAlpha=.9*thread;c.beginPath();c.moveTo(tx,ty);const ex=tx+(px-tx)*thread,ey=ty+(fy-170-ty)*thread;c.quadraticCurveTo(tx+side*160,ty+(ey-ty)*.5+40*Math.sin(t*.002),ex,ey);c.stroke();c.strokeStyle='#ffd2dc';c.lineWidth=1.5;c.stroke();}
    if(thread>=1){c.globalAlpha=.85;c.strokeStyle='#ff3a5c';c.lineWidth=4;c.beginPath();c.moveTo(ax+20,fy-170);c.quadraticCurveTo(450,fy-250-20*Math.sin(t*.003),bx-20,fy-170);c.stroke();drawHeart(c,450,fy-235,34,.95);}c.restore();c.globalAlpha=1;}
  c.save();if(bow>0)c.translate(0,Math.sin(bow*Math.PI)*10);drawCaster(scene,c,A,ax,fy,sc,t,false);drawCaster(scene,c,B,bx,fy,sc,t,true);c.restore();
  // CAO TRÀO: hai dải khí xoắn bay lên → trái tim lớn
  if(rise>0){c.save();c.globalCompositeOperation='lighter';const n=light?30:80,top=H*.42,cx=450;
    for(let side=0;side<2;side++)for(let i=0;i<n;i++){const u=i/n;if(u>rise)break;const y=fy-160-(fy-160-top)*u,amp=(1-u)*170+30,a=u*TAU*2.2+(side?Math.PI:0)+t*.004,px=cx+Math.sin(a)*amp*(heart>0?1-heart:1);
      dot(c,side?'#ffd54a':'#ff4d6d',px,y,10+12*(1-u),.85*(1-heart*.8));}
    c.restore();}
  if(heart>0){c.save();c.globalCompositeOperation='lighter';const cx=450,cy=H*.4,R=150*out3(seg(heart,0,.35)),n=light?40:110;
    for(let i=0;i<n;i++){const q=i/n*TAU,hx=16*Math.sin(q)**3,hy=-(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q));const wob=1+.04*Math.sin(t*.01+i);dot(c,i%2?'#ff4d6d':'#ffd54a',cx+hx*R/16*wob,cy+hy*R/16*wob,9,.95*(1-seg(heart,.85,1)*.5));}
    dot(c,'#ff7a9a',cx,cy,R*1.4,.35);
    for(let i=0;i<16;i++){const a=i/16*TAU+t*.0006,L=R*(1.6+.4*Math.sin(t*.004+i));c.strokeStyle='#ffd2dc';c.globalAlpha=.35*(1-seg(heart,.6,1));c.lineWidth=3;c.beginPath();c.moveTo(cx+Math.cos(a)*R*1.1,cy+Math.sin(a)*R*1.1);c.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);c.stroke();}
    c.restore();c.globalAlpha=1;}
  c.restore();c.globalAlpha=1;
  drawVignette(c,H,.3,450,H*.6);drawLetterbox(c,H,seg(k,0,.1));
  const a=smooth(seg(k,.05,.18))*(1-seg(k,.72,.78)),pop=1+.3*(1-out3(seg(k,.05,.2)));c.globalAlpha=a;c.save();c.translate(450,H*.13);c.scale(pop,pop);txt(c,'TIÊN LỮ ĐẠI ĐIỂN',0,0,64,'#ffe08a',{width:12,max:860});c.restore();
  txt(c,short(x.aName)+' ♥ '+short(x.bName),450,H*.13+62,32,'#ffd2dc',{width:7,weight:'800',max:840});
  if(thread>.5)txt(c,'Nguyệt Lão se tơ hồng',450,H*.13+104,28,'#ffffff',{width:7,weight:'800'});c.globalAlpha=1;
  if(heart>.2){const u=seg(heart,.2,.5),p2=1+.5*(1-out3(u));c.globalAlpha=smooth(u);c.save();c.translate(450,H*.4+230);c.scale(p2,p2);txt(c,'THẦN TIÊN QUYẾN LỮ',0,0,70,'#ffe08a',{width:13,max:880});c.restore();txt(c,short(x.aName)+' ♥ '+short(x.bName),450,H*.4+290,32,'#ffd2dc',{width:7,weight:'800',max:840});c.globalAlpha=1;}
  const o=seg(k,.95,1);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
