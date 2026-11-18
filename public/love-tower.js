// 17/11/2026 (chủ game): NGUYỆT HẠ TÌNH LÂU — overlay cho love-tower.mjs.
// 1) Tình Lâu góc phải map lễ: 6 cửa sổ, phòng có đôi thì sáng hồng + 2 người ngồi đối diện + tim bay ra.
// 2) Đình Nguyệt: quầng tim quanh đôi đang song tu trên sân.
// 3) Chiếu riêng (server hẹn giờ, love.cuts): Uyên Ương Mật Thất (≥30) — bình phong lụa hạ xuống, chỉ thấy BÓNG hai người NGỒI
//    đối diện chạm tay, khí song tu xoáy, 3 nhịp bùng → "SONG TU ĐẠI THÀNH". Tiên Lữ Đại Điển (một món ≥100) — lễ trên cầu rồi vào Mật Thất.
//    Song tu kiểu tu tiên, KHÔNG cảnh quan hệ (luật TikTok). Biến thể: 3 phòng × 3 kiểu khí × màu, server né biến thể vừa dùng.
import {makeSurface} from './performance.js';
import {skinFor} from './cosmetics.js';
import {drawCaster,cutVeil,txt,CUT_PHASE,drawCutInBand} from './skill-cutscene.js?v=20261118';
import {PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawInflow,drawSkyBeams,drawAura,drawCompress,drawImpactFrame,hitStop} from './cut-fx.js?v=20261118';
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
// 18/11 tối (chủ game: "song tu 100 coin xấu quá, cải tiến mạnh"): Đại Điển là MỘT màn riêng 12 s (không dùng lại Mật Thất của 30 coin).
export const GRAND={open:.1,cutA:[.08,.2],cutB:[.18,.3],thread:[.3,.5],sit:.52,gather:[.54,.68],boom:.68,boomGap:.33,reveal:.74};
function secretSpan(){return {from:0,to:1};}
export function beatsOf(x){const ms=x.ms/1000;if(x.tier==='grand'){const b=GRAND.boom*ms;return [0,1,2].map(i=>+(b+i*GRAND.boomGap).toFixed(2));}return SECRET.beats.map(b=>+(ms*b).toFixed(2));}
let shadowCv=null;
function shadowLayer(w,h){if(!shadowCv||shadowCv.width!==w||shadowCv.height!==h)shadowCv=makeSurface(w,h);return shadowCv;}
export function drawLoveCut(scene,c,t,H,x,k){
  if(x.tier==='grand')return drawGrandRite(scene,c,t,H,x,k);
  return drawSecretRoom(scene,c,t,H,x,k,false);
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
// 18/11 tối (chủ game: "hiệu ứng song tu 100 coin xấu quá, cải tiến mạnh"): TIÊN LỮ ĐẠI ĐIỂN — màn riêng 12 s, 6 pha kiểu điện ảnh:
// mở màn (sao băng + tựa đập) → 2 băng cận mặt → Nguyệt Lão se tơ hồng (trận pháp, tơ dày có hạt chạy) → song tu ngồi thiền bay lên, khí tụ
// → BÙNG–BÙNG–BÙNG (đứng hình + khung đảo màu) → hiện thân (3 biến thể theo x.qi: âm dương / cánh phượng / song liên) + THẦN TIÊN QUYẾN LỮ.
// Chỉ hai người, KHÔNG cảnh thân mật (luật TikTok): đứng cạnh nhau rồi ngồi thiền đối diện.
const LOVE_PAL=[{main:'#ff4d6d',soft:'#ffe0e8',gold:'#ffd54a',deep:'#12040c'},{main:'#ff6a3d',soft:'#ffe2c8',gold:'#ffe08a',deep:'#160604'},{main:'#ff5fa8',soft:'#ffe0f0',gold:'#fff0a8',deep:'#14041a'}];
function bezPt(x0,y0,cx,cy,x1,y1,u){const v=1-u;return [v*v*x0+2*v*u*cx+u*u*x1,v*v*y0+2*v*u*cy+u*u*y1];}
function heartPts(cx,cy,R,n,wob,t){const out=[];for(let i=0;i<n;i++){const q=i/n*TAU,hx=16*Math.sin(q)**3,hy=-(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q)),w=1+wob*Math.sin(t*.01+i);out.push([cx+hx*R/16*w,cy+hy*R/16*w]);}return out;}
function drawGrandRite(scene,c,t,H,x,k){
  const motion=scene.motion!==false,light=scene.budget?.level==='light',rf=scene.reduceFlash,style=((x.qi|0)%3+3)%3,P=LOVE_PAL[style];
  const idx=scene.lovePlayers||scene.playerIndex||new Map(),A=idx.get(x.a),B=idx.get(x.b),ms=x.ms||12000,sec=k*ms/1000;
  const boomSec=GRAND.boom*ms/1000,bs=[0,1,2].map(i=>sec-boomSec-i*GRAND.boomGap),hs=hitStop(bs[0],t,.12),tt=hs.frozen?hs.t:t;
  const fy=H*.74,cx=450,gx=H*.47; /* gx: tâm khí / tim */
  const walk=smooth(seg(k,.3,.42)),thread=seg(k,.33,.5),sit=smooth(seg(k,GRAND.sit-.02,GRAND.sit+.06)),gather=seg(k,GRAND.gather[0],GRAND.gather[1]),reveal=seg(k,GRAND.reveal,.98);
  const shake=motion?Math.max(...bs.map((s,i)=>s>=0&&s<.35?(16-4*i)*(1-s/.35):0),k<.05?10*(1-k/.05):0):0;
  fxCamera(c,cx,gx,motion?1+.08*smooth(seg(k,.3,.68))-.06*smooth(seg(k,.68,.76))+punch(bs[0],.06)+punch(bs[2],.05):1,shake,tt);
  // NỀN: cây Nguyệt Lão (zoom chậm, mỗi phòng một góc máy), tối dần khi tụ khí
  c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
  const bgIn=smooth(seg(k,.03,.12)),dim=.55*gather*(1-reveal*.6);
  if(bgIn>0){c.globalAlpha=bgIn;if(!bgCover(c,img(LOVE_ART.bridge),H,2.4-.18*smooth(k)+(x.room|0)*.06,[0,.08,.16][(x.room|0)%3])){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c0a33');g.addColorStop(1,'#3a0f2a');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);}c.globalAlpha=1;}
  {const g=c.createLinearGradient(0,H*.4,0,H);g.addColorStop(0,'rgba(18,4,12,0)');g.addColorStop(1,'rgba(18,4,12,.85)');c.fillStyle=g;c.fillRect(-200,H*.4,1300,H*.7);}
  if(dim>0){c.globalAlpha=dim;c.fillStyle='#0a0208';c.fillRect(-200,-200,1300,H+400);c.globalAlpha=1;}
  // đèn trời bay lên suốt màn
  c.save();c.globalCompositeOperation='lighter';const nl=light?10:30;for(let i=0;i<nl;i++){const u=((i*.53+tt*.00007+k*.5)%1),lx=30+((i*173)%840)+Math.sin(tt*.0008+i)*24,ly=H*(1.05-u*1.12),s0=9+(i%4)*4;c.globalAlpha=Math.min(1,u*4)*(1-u)*.9*bgIn;dot(c,'#ffb15a',lx,ly,s0*3.2,.5);c.fillStyle='#ffd08a';c.beginPath();c.ellipse(lx,ly,s0*.7,s0,0,0,TAU);c.fill();}c.restore();c.globalAlpha=1;
  // MỞ MÀN: sao băng đỏ rạch chéo
  {const u=seg(k,.0,.07);if(u>0&&u<1){c.save();c.globalCompositeOperation='lighter';const x0=-100+u*1300,y0=H*.05+u*H*.35;const g=c.createLinearGradient(x0-420,y0-120,x0,y0);g.addColorStop(0,P.main+'00');g.addColorStop(1,'#ffffff');c.strokeStyle=g;c.lineWidth=10;c.lineCap='round';c.beginPath();c.moveTo(x0-420,y0-120);c.lineTo(x0,y0);c.stroke();dot(c,P.soft,x0,y0,70,.9);c.restore();c.globalAlpha=1;}}
  // TRẬN PHÁP dưới chân (lớn dần khi tơ hồng kết)
  const circ=smooth(seg(k,.32,.46))*(1-seg(k,.94,1));if(circ>0){c.save();c.translate(cx,fy+10);c.scale(1,.34);drawCircle(c,0,0,260+60*gather,circ,tt,P,style===1?-1:1);c.restore();}
  if(gather>0){drawSkyBeams(c,cx,fy,gather*(1-reveal),tt,P);drawInflow(c,cx,gx,gather*(1-seg(k,.68,.7)),tt,P,light,520);}
  // TƠ HỒNG: 3 sợi mỗi bên từ tán cây buông xuống, hạt sáng chạy dọc, rồi kết nút giữa hai người
  const lift=sit*70+Math.sin(tt*.002)*6*sit,gap=sit?130:150-50*walk,ax=cx-gap-(1-walk)*560,bx=cx+gap+(1-walk)*560,ay=fy-lift,by=fy-lift; /* chưa bước vào thì ở ngoài khung */
  if(thread>0&&reveal<1){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const tx=cx,ty=H*.16,te=smooth(thread),fade=1-seg(k,.66,.72);
    for(const [px,side] of [[ax,-1],[bx,1]])for(let s=0;s<3;s++){const ex=tx+(px+side*-30-tx)*te,ey=ty+(ay-200-ty)*te,ccx=tx+side*(120+s*60),ccy=ty+(ey-ty)*.5+30*Math.sin(tt*.002+s);
      c.globalAlpha=.28*fade;c.strokeStyle=P.main;c.lineWidth=16;c.beginPath();c.moveTo(tx,ty);c.quadraticCurveTo(ccx,ccy,ex,ey);c.stroke();
      c.globalAlpha=.9*fade;c.strokeStyle=s?'#ff2f55':'#ffd2dc';c.lineWidth=s?4:2.5;c.stroke();
      if(!light)for(let j=0;j<6;j++){const u=((tt*.0006+j/6+s*.13)%1)*te;const [qx,qy]=bezPt(tx,ty,ccx,ccy,ex,ey,u/(te||1));dot(c,j%2?P.gold:P.soft,qx,qy,9,fade*.95);}}
    if(thread>=.92){const kn=smooth(seg(thread,.92,1))*fade;c.globalAlpha=.9*kn;c.strokeStyle='#ff2f55';c.lineWidth=7;c.beginPath();c.moveTo(ax+30,ay-200);c.quadraticCurveTo(cx,ay-300-20*Math.sin(tt*.003),bx-30,by-200);c.stroke();dot(c,P.main,cx,ay-262,90*kn,.7);drawHeart(c,cx,ay-262,58*kn,kn);}
    c.restore();c.globalAlpha=1;}
  // HAI NGƯỜI: đứng tiến lại → ngồi thiền đối diện, bay lên, hào quang hai màu
  if(sit>0){drawAura(c,ax,ay,260,170,sit*(.6+.4*gather),tt,{...P,main:P.main},light);drawAura(c,bx,by,260,170,sit*(.6+.4*gather),tt,{...P,main:P.gold},light);}
  {const flash=seg(k,GRAND.sit-.03,GRAND.sit)*(1-seg(k,GRAND.sit,GRAND.sit+.03));
   if(k<GRAND.sit){drawCaster(scene,c,A,ax,ay,3.5,tt,false);drawCaster(scene,c,B,bx,by,3.5,tt,true);}
   else{drawSeated(scene,c,A,ax,ay,3.3,tt,false);drawSeated(scene,c,B,bx,by,3.3,tt,true);}
   if(flash>0){c.save();c.globalCompositeOperation='lighter';dot(c,P.soft,ax,ay-150,220,flash);dot(c,P.soft,bx,by-150,220,flash);c.restore();c.globalAlpha=1;}}
  // TỤ KHÍ: hai dải khí xoắn từ hai người về tâm + lõi nén
  if(gather>0&&k<GRAND.boom+.02){c.save();c.globalCompositeOperation='lighter';const n=light?24:70;
    for(let side=0;side<2;side++)for(let i=0;i<n;i++){const u=((i/n)+tt*.0005)%1;const sx=side?bx:ax,sy=(side?by:ay)-150,px=sx+(cx-sx)*u+Math.sin(u*TAU*2+side*Math.PI+tt*.006)*90*(1-u),py=sy+(gx-sy)*u+Math.cos(u*TAU*2+tt*.006)*60*(1-u);dot(c,side?P.gold:P.main,px,py,7+10*(1-u),.8*gather);}
    c.restore();c.globalAlpha=1;drawCompress(c,cx,gx,seg(k,.6,GRAND.boom),tt,P);}
  // BÙNG–BÙNG–BÙNG
  bs.forEach((s,i)=>{if(s>=0&&s<1.8)drawBurst(c,cx+(i===1?-150:i===2?150:0),gx+(i?-40:0),s,P,H,{light,pillar:i===0,flash:!rf,scale:i?0.7:1.1,seed:i+3+(x.hue|0),reduceFlash:rf});});
  // HIỆN THÂN: biến thể sau lưng + trái tim lớn
  if(reveal>0){const R=210*out3(seg(reveal,0,.3)),hy=gx-10;c.save();c.globalCompositeOperation='lighter';
    if(style===0){ /* ÂM DƯƠNG: đĩa thái cực thật (chữ S + 2 mắt) xoay chậm sau lưng */
      const r2=R*1.6,a=.42*smooth(seg(reveal,0,.35));c.save();c.translate(cx,hy);c.rotate(tt*.0007);c.globalCompositeOperation='source-over';c.globalAlpha=a;
      c.fillStyle=P.main;c.beginPath();c.arc(0,0,r2,-Math.PI/2,Math.PI/2);c.arc(0,r2/2,r2/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-r2/2,r2/2,Math.PI/2,Math.PI*1.5,false);c.fill();
      c.fillStyle=P.gold;c.beginPath();c.arc(0,0,r2,Math.PI/2,Math.PI*1.5);c.arc(0,-r2/2,r2/2,-Math.PI/2,Math.PI/2,true);c.arc(0,r2/2,r2/2,-Math.PI/2,Math.PI/2,false);c.fill();
      c.globalAlpha=a*1.6;c.fillStyle=P.gold;c.beginPath();c.arc(0,r2/2,r2*.1,0,TAU);c.fill();c.fillStyle=P.main;c.beginPath();c.arc(0,-r2/2,r2*.1,0,TAU);c.fill();
      c.globalCompositeOperation='lighter';c.globalAlpha=.8*smooth(reveal);c.strokeStyle=P.soft;c.lineWidth=5;c.beginPath();c.arc(0,0,r2,0,TAU);c.stroke();
      for(let i=0;i<24;i++){const an=i/24*TAU;dot(c,i%2?P.gold:P.main,Math.cos(an)*r2*1.08,Math.sin(an)*r2*1.08,10,.8*smooth(reveal));}
      c.restore();}
    else if(style===1){ /* CÁNH PHƯỢNG: 3 tầng lông vũ xòe từ vai ra, vỗ nhẹ; ngọn lông có đốm sáng */
      const open=smooth(seg(reveal,0,.4)),flap=Math.sin(tt*.004)*.08,sy=hy+40;c.lineCap='round';
      for(const side of [-1,1])for(let row=0;row<3;row++){const nf=light?7:13;for(let i=0;i<nf;i++){const u=i/(nf-1),an=(-1.35+u*1.5+flap*(1-u))*open+(1-open)*.6,len=(row===0?430:row===1?330:230)*(.55+.45*Math.sin(u*Math.PI*.9+.25))*open;
        const rx=cx+side*(40+row*10),tx=rx+side*Math.cos(an)*len,ty=sy+Math.sin(an)*len*.85;
        const g=c.createLinearGradient(rx,sy,tx,ty);g.addColorStop(0,P.main+'00');g.addColorStop(.35,row?P.main:P.gold);g.addColorStop(1,P.soft);
        c.globalAlpha=(.55-row*.1)*open;c.strokeStyle=g;c.lineWidth=(row===0?16:row===1?12:9)*(1-u*.4);c.beginPath();c.moveTo(rx,sy);c.quadraticCurveTo(rx+side*Math.cos(an-.25)*len*.55,sy+Math.sin(an-.25)*len*.5,tx,ty);c.stroke();
        if(!row)dot(c,P.gold,tx,ty,16,.9*open);}}
      dot(c,P.gold,cx,sy,120*open,.35);}
    else{ /* SONG LIÊN: hai đóa sen nở hai bên (cánh tô thường + viền sáng, không cộng sáng thành mảng trắng) */
      const n=light?7:11;for(const side of [-1,1])for(let ring=1;ring>=0;ring--)for(let i=0;i<n;i++){const open=smooth(seg(reveal,.05+(1-ring)*.12,.45+(1-ring)*.12)),an=-Math.PI/2+(i/(n-1)-.5)*(ring?2.6:1.9)*open,L=(ring?190:130)*open;
        c.save();c.translate(cx+side*190,hy+120);c.rotate(an+Math.sin(tt*.0015+i)*.03);c.globalCompositeOperation='source-over';c.globalAlpha=.5*open;const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,ring?P.main:P.gold);g.addColorStop(1,P.soft);c.fillStyle=g;
        c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(L*.45,-L*.3,L,0);c.quadraticCurveTo(L*.45,L*.3,0,0);c.fill();c.globalCompositeOperation='lighter';c.globalAlpha=.6*open;c.strokeStyle=P.soft;c.lineWidth=2;c.stroke();c.restore();}
      for(const side of [-1,1])dot(c,P.gold,cx+side*190,hy+110,60*smooth(reveal),.6);}
    const hf=1-seg(reveal,.85,1)*.4;for(const [sc,col,r] of [[1,null,12],[.72,P.main,9],[.45,P.soft,7]]){const pts=heartPts(cx,hy,R*sc,light?40:(sc===1?150:90),.04,tt);pts.forEach(([px,py],i)=>dot(c,col||(i%2?P.main:P.gold),px,py,r,.95*hf));} /* tim 3 lớp lồng nhau */
    dot(c,P.main,cx,hy,R*1.5,.3);
    for(let i=0;i<18;i++){const a=i/18*TAU+tt*.0006,L=R*(1.7+.4*Math.sin(tt*.004+i));c.strokeStyle=P.soft;c.globalAlpha=.3*(1-seg(reveal,.6,1));c.lineWidth=3;c.beginPath();c.moveTo(cx+Math.cos(a)*R*1.15,hy+Math.sin(a)*R*1.15);c.lineTo(cx+Math.cos(a)*L,hy+Math.sin(a)*L);c.stroke();}
    c.restore();c.globalAlpha=1;
    // mưa cánh hoa
    c.save();const np=light?20:70;for(let i=0;i<np;i++){const u=((i*.37+tt*.00012)%1),px=((i*131)%960)-30+Math.sin(tt*.001+i)*40,py=-40+u*(H+80);c.globalAlpha=.85*smooth(seg(reveal,0,.2));c.fillStyle=i%3?'#ffb3c8':'#ffe0ea';c.save();c.translate(px,py);c.rotate(tt*.002+i);c.beginPath();c.ellipse(0,0,9,5,0,0,TAU);c.fill();c.restore();}c.restore();c.globalAlpha=1;}
  c.restore();c.globalAlpha=1;
  // khung đảo màu ở cú nổ đầu & cuối (tắt khi giảm chớp)
  if(!rf){for(const i of [0,2]){const u=seg(bs[i],0,.1);if(u>0&&u<1)drawImpactFrame(c,H,cx,gx,u,P,i+1);}}
  // BĂNG CẬN MẶT hai người
  drawCutInBand(scene,c,A,H,seg(k,GRAND.cutA[0],GRAND.cutA[1]),P,1,t,{yc:H*.42,bh:280,label:short(x.aName)});
  drawCutInBand(scene,c,B,H,seg(k,GRAND.cutB[0],GRAND.cutB[1]),{...P,main:P.gold},-1,t,{yc:H*.6,bh:280,label:short(x.bName)});
  drawVignette(c,H,.35+.25*gather,cx,gx);drawLetterbox(c,H,seg(k,0,.08)*(1-seg(k,.93,1)));
  // CHỮ: tựa mở màn → dòng pha → THẦN TIÊN QUYẾN LỮ (luôn ở trên, không đè người)
  {const a=smooth(seg(k,.04,.1))*(1-seg(k,.66,.7)),pop=1+.45*(1-out3(seg(k,.04,.11)));if(a>0){c.globalAlpha=a;c.save();c.translate(cx,H*.135);c.scale(pop,pop);txt(c,'TIÊN LỮ ĐẠI ĐIỂN',0,0,70,'#ffe08a',{width:13,max:860});c.restore();txt(c,short(x.aName)+' ♥ '+short(x.bName),cx,H*.135+60,32,'#ffd2dc',{width:7,weight:'800',max:840});
    const sub=k<GRAND.sit?(thread>.1?'Nguyệt Lão se tơ hồng':''):'Song tu · âm dương hợp nhất';if(sub)txt(c,sub,cx,H*.135+102,30,'#ffffff',{width:7,weight:'800'});c.globalAlpha=1;}}
  if(reveal>0){const u=seg(reveal,0,.25),p2=1+.6*(1-out3(u));c.globalAlpha=smooth(u);c.save();c.translate(cx,H*.13);c.scale(p2,p2);txt(c,'THẦN TIÊN QUYẾN LỮ',0,0,78,'#ffe08a',{width:14,max:880});c.restore();
    txt(c,short(x.aName)+' ♥ '+short(x.bName),cx,H*.13+64,34,'#ffd2dc',{width:7,weight:'800',max:840});txt(c,['Âm Dương Hợp Bích','Phượng Hoàng Song Phi','Tịnh Đế Song Liên'][style],cx,H*.13+108,30,'#ffffff',{width:7,weight:'800'});c.globalAlpha=1;}
  const o=seg(k,.96,1);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
