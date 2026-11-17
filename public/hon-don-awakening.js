// Hỗn Độn Vĩnh Hằng v2 — "Khai Thiên Định Luật" (15/11/2026). 58 s; nổ 51,5; đổi skin 51,85 (giữ mốc late-ascension-data).
// Cảnh giới cuối — cơ chế riêng, không lặp 25–27 và không lặp Luyện Hư v2 (gương phản chiếu nhân vật):
// chân trời nứt ngang 3 cú, hỗn độn khí tràn ra 3 đợt → 14 thiên kính bay ra, mỗi khung chiếu một thế giới
// (ảnh nền các cảnh giới trước) → đường hầm thiên kính vô tận lao về phía người xem (10 nhịp) →
// TRỌNG LỰC XOAY CHIỀU: cả thế giới quay ngược 180°, đá và khung rơi ngược lên trời (4 nhịp), quay về →
// thiên kính nứt vỡ từng khung (8 cú) rồi vỡ toàn bộ → vạn mảnh xoáy vào điểm vô cực ∞ trước ngực (3 nhịp) →
// tạc 3 thiên luật Sinh · Diệt · Hằng lên trời → luật nhập ∞ → nhập đan điền → tối, 2 nhịp tim →
// NỔ KHAI THIÊN: nhát rìu ánh vàng chẻ dọc, hai nửa thế giới tách ra lộ ánh sáng nguyên sơ →
// hiện thân: vòng ∞ sau lưng, 3 chữ luật nhỏ xoay quanh.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {lateRealmBackdrop} from './late-ascension-art.js';

export const HD=Object.freeze({duration:58,tunnel:13,flip:22,flipBack:29,shatterAll:37.2,infinity:43.5,lawsIn:50.3,dark:50.85,impact:51.5,reveal:51.85,fade:56.4});
export const HD_CRACK=Object.freeze([.2,.9,1.6]);
export const HD_CHAOS=Object.freeze([3.2,4.2,5.2]);
export const HD_PANES=Object.freeze(Array.from({length:14},(_,i)=>6+i*.45));
export const HD_PASSES=Object.freeze(Array.from({length:10},(_,i)=>13+i*.8));
export const HD_GRAVITY=Object.freeze([24.5,25.7,26.9,28.1]);
export const HD_SHATTER=Object.freeze(Array.from({length:8},(_,i)=>30+i*.9));
export const HD_SPIRAL=Object.freeze([39,40.6,42.2]);
export const HD_LAWS=Object.freeze([46.6,47.8,49.0]);
export const HD_BEATS=Object.freeze([51.0,51.25]);
export const HON_DON_DURATION=58000;
const LAW_CHARS=['生','滅','恆'],LAW_NAMES=['Sinh','Diệt','Hằng'];
const BEATS=[[0,'Chân trời tách đôi'],[6,'Vạn cảnh xuất hiện trong thiên kính'],[13,'Bóng giới phản chiếu vô tận'],[22,'Trọng lực xoay chiều'],[30,'Các thiên kính nứt vỡ'],[39,'Thu vạn cảnh vào điểm vô cực'],[46.6,'Tạc ba thiên luật'],[51.5,'Khai Thiên'],[51.85,'Vĩnh Hằng hiện thân']];
const WORLD_SRC=['/assets/vinh-hang-giap-v1/realm-25-sky.webp','/assets/vinh-hang-giap-v1/realm-26-sky.webp','/assets/vinh-hang-giap-v1/realm-27-sky.webp','/assets/tien-de-v1/heaven-court.png','/assets/dai-la-v1/star-heaven.png','/assets/chan-tien-v4/tribulation-peak.png','/assets/dai-thua-v2/sword-valley.png'];

const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const back=x=>{x=clamp(x);const s=1.6;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*233.1+17.9)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len)=>age>=0&&age<len?Math.exp(-age/len*5):0;
const GOLD='#ffdb84',WHITE='#fffaf0',AMBER='#ffb050',PALE='#e8e0ff',CHAOS='#c89a40';
const PALETTE={main:GOLD,main2:AMBER,soft:WHITE,gold:'#ffe9b0'};

export function honDonHits(){return [
 ...HD_CRACK.map((a,i)=>[a,1.3+i*.25]),...HD_CHAOS.map((a,i)=>[a,1.0+i*.15]),...HD_PANES.map((a,i)=>[a+.35,.55+i*.03]),
 ...HD_PASSES.map((a,i)=>[a,.7+i*.05]),[HD.flip,1.8],[HD.flip+1.4,1.6],...HD_GRAVITY.map((a,i)=>[a,1.1+i*.15]),[HD.flipBack+.8,1.8],
 ...HD_SHATTER.map((a,i)=>[a,1.2+i*.08]),[HD.shatterAll,2.2],...HD_SPIRAL.map((a,i)=>[a,1.0+i*.2]),[HD.infinity,1.6],
 [45.1,.9],...HD_LAWS.map((a,i)=>[a+.6,1.5+i*.2]),[HD.lawsIn,1.6],...HD_BEATS.map(a=>[a,.6]),[HD.impact,3.0]];}
function hitPower(T){let p=0;for(const [a,f] of honDonHits()){const age=T-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}

export function honDonState(k,H=1600,motion=true){
 const T=clamp(k)*HD.duration,feet=H*.73;
 const rot=ease((T-HD.flip)/1.4)*(1-ease((T-HD.flipBack)/.8));
 return {k:clamp(k),T,H,motion,clock:motion?T:0,feet,belly:feet-145,head:feet-338,horizon:H*.40,
  crack:HD_CRACK.reduce((n,a)=>n+ease((T-a)/.4),0)/3*(1-ease((T-HD.shatterAll-.6)/2.2)),chaos:HD_CHAOS.reduce((n,a)=>n+ease((T-a)/.6),0)/3*(1-ease((T-HD.shatterAll)/2)),
  rot,tunnel:ease((T-HD.tunnel)/.8)*(1-ease((T-HD.flip+.6)/.6)),infinity:ease((T-HD.infinity)/.8)*(1-ease((T-HD.lawsIn-.4)/.5)),
  dark:ease((T-HD.dark)/.3)*(1-ease((T-HD.impact)/.1)),bang:pulse(T-HD.impact,1),
  split:T>=HD.impact?ease((T-HD.impact)/.3)*(1-ease((T-HD.impact-.8)/.7)):0,
  revealed:T>=HD.reveal,after:ease((T-HD.reveal)/1.3),fade:1-ease((T-HD.fade)/1.4)};
}

function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function glowSprite(inner,mid,outer){return surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.22,mid);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,128,128);});}
const worldImages=new Map();
function worldImage(i){if(typeof Image==='undefined')return null;const src=WORLD_SRC[i%WORLD_SRC.length];if(!worldImages.has(src)){const im=new Image();im.decoding='async';im.src=src;worldImages.set(src,im);}const im=worldImages.get(src);return im.complete&&im.naturalWidth?im:null;}
const PANE_W=170,PANE_H=230;
function panePoly(i){const j=k=>(rnd(i*13+k)-.5)*26;return [[-PANE_W/2+j(1),-PANE_H/2+j(2)],[PANE_W/2+j(3),-PANE_H/2+j(4)],[PANE_W/2+j(5),PANE_H/2+j(6)],[-PANE_W/2+j(7),PANE_H/2+j(8)]];}
function buildPane(i,im){return surface(PANE_W+40,PANE_H+40,c=>{c.translate(PANE_W/2+20,PANE_H/2+20);const P=panePoly(i);const path=()=>{c.beginPath();P.forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
 path();c.save();c.clip();if(im){const sx=rnd(i+5)*im.naturalWidth*.4,sy=rnd(i+9)*im.naturalHeight*.3,sw=im.naturalWidth*.55,sh=sw*PANE_H/PANE_W;c.drawImage(im,sx,sy,sw,Math.min(sh,im.naturalHeight-sy),-PANE_W/2-15,-PANE_H/2-15,PANE_W+30,PANE_H+30);}
 else{const g=c.createLinearGradient(0,-PANE_H/2,0,PANE_H/2);g.addColorStop(0,'#2a2450');g.addColorStop(1,'#806040');c.fillStyle=g;c.fillRect(-PANE_W,-PANE_H,PANE_W*2,PANE_H*2);}
 const sheen=c.createLinearGradient(-PANE_W/2,-PANE_H/2,PANE_W/2,PANE_H/2);sheen.addColorStop(0,'#ffffff40');sheen.addColorStop(.4,'#ffffff00');sheen.addColorStop(.7,'#ffffff18');sheen.addColorStop(1,'#ffffff00');c.fillStyle=sheen;c.fillRect(-PANE_W,-PANE_H,PANE_W*2,PANE_H*2);c.restore();
 path();c.strokeStyle='#5a3a10';c.lineWidth=9;c.stroke();path();c.strokeStyle=GOLD;c.lineWidth=4;c.stroke();path();c.strokeStyle='#fff6d8';c.lineWidth=1.2;c.stroke();});}
function lawSprite(ch){return surface(300,300,c=>{c.translate(150,150);c.font='900 220px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';
 c.lineJoin='round';c.strokeStyle='#5a3a10';c.lineWidth=18;c.strokeText(ch,0,10);c.fillStyle=GOLD;c.fillText(ch,0,10);c.globalCompositeOperation='source-atop';const g=c.createLinearGradient(0,-110,0,120);g.addColorStop(0,'#fffaf0');g.addColorStop(.5,'#ffdb84');g.addColorStop(1,'#c88a30');c.fillStyle=g;c.fillRect(-150,-150,300,300);});}
function infinitySprite(){return surface(360,200,c=>{c.translate(180,100);const path=()=>{c.beginPath();for(let j=0;j<=120;j++){const t=j/120*TAU,d=1+Math.sin(t)**2;const x=150*Math.cos(t)/d,y=150*Math.sin(t)*Math.cos(t)/d;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();};
 path();c.strokeStyle='#5a3a10';c.lineWidth=22;c.stroke();path();c.strokeStyle=GOLD;c.lineWidth=14;c.stroke();path();c.strokeStyle='#fffaf0';c.lineWidth=4;c.stroke();});}

function assets(scene,H){
 const cache=scene.honDonAssets;if(cache?.H===H)return cache;
 const deep=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#04030a');g.addColorStop(.4,'#141020');g.addColorStop(1,'#050408');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<300;i++){c.globalAlpha=.25+rnd(i+40)*.6;c.fillStyle=i%4?'#fff4e0':GOLD;const r=rnd(i+90)*1.8+.4;c.fillRect(rnd(i)*900,rnd(i+400)*H,r,r);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.52,180,450,H*.52,H*.74);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000000');g.addColorStop(1,'#000000e0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const ground=surface(900,320,c=>{c.translate(450,70);c.beginPath();c.moveTo(-300,0);c.bezierCurveTo(-230,-30,230,-30,300,0);
  const under=[[255,32],[210,66],[150,92],[95,146],[25,188],[-35,160],[-95,126],[-160,88],[-225,54],[-280,22]];for(const [x,y] of under)c.lineTo(x,y+(rnd(x)-.5)*12);c.closePath();
  const g=c.createLinearGradient(0,-30,0,190);g.addColorStop(0,'#5a4a30');g.addColorStop(.25,'#1c160c');g.addColorStop(1,'#060402');c.fillStyle=g;c.fill();c.strokeStyle='#ffe0a0';c.globalAlpha=.75;c.lineWidth=2;c.stroke();
  c.save();c.scale(1,.24);c.globalAlpha=.5;c.strokeStyle=GOLD;c.lineWidth=2.5;for(let r=100;r<=240;r+=70){c.beginPath();c.arc(0,-40,r,0,TAU);c.stroke();}c.restore();});
 const out={H,deep,vignette,ground,panes:new Array(14).fill(null),laws:LAW_CHARS.map(lawSprite),inf:infinitySprite(),
  glow:glowSprite('#ffffff','#fff0c8c0','#ffdb8400'),pale:glowSprite('#ffffff','#e8e0ffc0','#b0a0ff00'),buffer:null};
 scene.honDonAssets=out;return out;
}
function pane(a,i){if(a.panes[i]?.ready)return a.panes[i].im;const im=worldImage(i);const built=buildPane(i,im);a.panes[i]={im:built,ready:!!im};return built;}
function halo(c,im,x,y,w,h,al){if(!im||al<=.01)return;c.save();c.globalAlpha*=clamp(al);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,al,ry=r,rot=0){if(al<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(al);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,rot,0,TAU);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:27}),to:structuredClone(e.visualTo||{...live,realm:28})};snapshots.set(e,pair);return pair;}

// 1. chân trời nứt + hỗn độn khí
function drawHorizon(c,a,s,T){if(s.crack<=0)return;const y=s.horizon,gap=s.crack*(26+s.chaos*60)+Math.sin(s.clock*3)*3;c.save();c.globalCompositeOperation='lighter';
 const g=c.createLinearGradient(0,y-gap,0,y+gap);g.addColorStop(0,'#ffdb8400');g.addColorStop(.5,'#fffaf0');g.addColorStop(1,'#ffdb8400');c.fillStyle=g;c.globalAlpha=.95;
 c.beginPath();c.moveTo(-20,y);for(let x=-20;x<=920;x+=30)c.lineTo(x,y-gap*(.6+.4*Math.sin(x*.02+s.clock)));for(let x=920;x>=-20;x-=30)c.lineTo(x,y+gap*(.6+.4*Math.cos(x*.023-s.clock)));c.closePath();c.fill();
 c.globalAlpha=1;c.strokeStyle=WHITE;c.lineWidth=3;c.beginPath();c.moveTo(-20,y);for(let x=-20;x<=920;x+=24)c.lineTo(x,y+(rnd(x)-.5)*8);c.stroke();c.restore();
 halo(c,a.glow,450,y,1400,gap*8+120,.55*s.crack);
 HD_CRACK.forEach((at,i)=>{const age=T-at;if(age<0||age>1)return;const x0=[450,200,700][i];c.save();c.globalCompositeOperation='lighter';c.strokeStyle=WHITE;c.lineWidth=4*(1-age);c.globalAlpha=1-age;
  for(const d of [-1,1]){let x=x0,yy=y;c.beginPath();c.moveTo(x,yy);for(let j=0;j<8;j++){x+=d*(30+rnd(j+i*9)*40);yy+=(rnd(j+i*5)-.5)*60;c.lineTo(x,yy);}c.stroke();}c.restore();halo(c,a.glow,x0,y,500,300,1-age);});
 if(s.chaos>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const u=((i/26+s.clock*.08)%1),side=i%2?1:-1,x=450+side*(u*520)+Math.sin(i+s.clock)*40,yy=y+(rnd(i)-.5)*60-u*120*(i%3-1);
   c.globalAlpha=s.chaos*(1-u)*.6;const r=60+u*120;const g2=c.createRadialGradient(x,yy,0,x,yy,r);g2.addColorStop(0,'#ffe6b0a0');g2.addColorStop(1,'#c89a4000');c.fillStyle=g2;c.fillRect(x-r,yy-r,r*2,r*2);}c.restore();
  HD_CHAOS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<1)ring(c,450,y,60+age*700,i%2?AMBER:GOLD,10*(1-age),1-age,(60+age*700)*.2);});}}
// 2. thiên kính
function paneHome(i,s,dir){const ang=i/14*TAU+.3,rx=330,ry=330;return {x:450+Math.cos(ang)*rx*dir,y:s.head+10+Math.sin(ang)*ry*.95,rot:Math.cos(ang)*.25*dir};}
function paneState(i,s,T,dir){const at=HD_PANES[i];if(T<at)return null;const H0=paneHome(i,s,dir),fly=back((T-at)/.6);let x=mix(450,H0.x,clamp(fly)),y=mix(s.horizon,H0.y,clamp(fly)),sc=mix(.2,1,clamp(fly))*(.7+.3*rnd(i)),rot=H0.rot+Math.sin(s.clock*.6+i)*.06,al=1;
 if(s.rot>0){const up=ease((T-HD.flip-.3-rnd(i)*.4)/2.2)*(1-ease((T-HD.flipBack)/.8));y-=up*(200+rnd(i+3)*240);rot+=up*(rnd(i)-.5)*2;}
 const sh=i<8?HD_SHATTER[i]:HD.shatterAll;if(T>=sh)return {x,y,sc,rot,al:0,shattered:T-sh};
 return {x,y,sc,rot,al};}
function drawPanes(c,a,s,T,dir){if(T<HD_PANES[0]||T>HD_SPIRAL[2]+1.5)return;const tunnelHide=1-s.tunnel;
 for(let i=0;i<14;i++){const P=paneState(i,s,T,dir);if(!P)continue;
  if(P.al>0&&tunnelHide>.02){const im=pane(a,i);c.save();c.translate(P.x,P.y);c.rotate(P.rot);c.scale(P.sc,P.sc);c.globalAlpha=tunnelHide;c.drawImage(im,-(PANE_W/2+20),-(PANE_H/2+20));
   const crackAt=(i<8?HD_SHATTER[i]:HD.shatterAll)-.8;if(T>crackAt){const cr=ease((T-crackAt)/.7);c.globalCompositeOperation='lighter';c.strokeStyle=WHITE;c.lineWidth=2;c.globalAlpha=cr;for(let j=0;j<6;j++){c.beginPath();c.moveTo(0,0);let x=0,y=0;for(let k=0;k<4;k++){x+=Math.cos(j+k*.3)*24*cr;y+=Math.sin(j*1.7+k*.4)*30*cr;c.lineTo(x,y);}c.stroke();}}
   c.restore();const age=T-HD_PANES[i]-.35;if(age>=0&&age<.6){halo(c,a.glow,P.x,P.y,260*P.sc,320*P.sc,1-age/.6);ring(c,P.x,P.y,30+age*240,GOLD,5*(1-age/.6),1-age/.6);}}
  if(P.shattered!==undefined&&P.shattered<2.2)drawGlassShards(c,a,s,P,i,P.shattered,T);}}
function drawGlassShards(c,a,s,P,i,age,T){const n=14,spiral=ease((T-HD_SPIRAL[0]-(i%3)*.3)/1.4),C={x:450,y:s.belly-90};
 if(age<.7){halo(c,a.glow,P.x,P.y,420,420,(1-age/.7));ring(c,P.x,P.y,20+age*400,WHITE,7*(1-age/.7),1-age/.7);}
 c.save();for(let j=0;j<n;j++){const ang=rnd(j+i*20)*TAU,sp=160+rnd(j+i)*300;let x=P.x+Math.cos(ang)*sp*age,y=P.y+Math.sin(ang)*sp*age+age*age*60;
  if(spiral>0){const sa=ang+spiral*6,rr=(1-spiral)*200;x=mix(x,C.x+Math.cos(sa)*rr,spiral);y=mix(y,C.y+Math.sin(sa)*rr*.5,spiral);}
  const r=7+rnd(j+3)*12;c.save();c.translate(x,y);c.rotate(age*5+j);c.globalAlpha=clamp(1.2-age/2.2)*(1-spiral*.5);c.fillStyle=j%3?'#e8e0ff60':'#ffdb8480';c.strokeStyle=WHITE;c.lineWidth=1.3;c.beginPath();c.moveTo(-r,-r*.4);c.lineTo(r*.4,-r);c.lineTo(r,r*.5);c.closePath();c.fill();c.stroke();c.restore();}c.restore();}
// 3. đường hầm thiên kính vô tận
function drawTunnel(c,a,s,T){if(s.tunnel<=0)return;const C={x:450,y:s.head+20},speed=1/0.8,base=(T-HD.tunnel)*speed;c.save();
 const order=Array.from({length:8},(_,k)=>({k,z:((k-base%1)+8)%8})).sort((p,q)=>p.z-q.z);
 for(const {k,z} of order){const sc=Math.pow(1.45,z)*.12;if(sc>4.2)continue;const im=pane(a,(k+Math.floor(base))%14),w=(PANE_W+40)*sc*2.2,h=(PANE_H+40)*sc*2.2;
  c.save();c.translate(C.x,C.y);c.rotate(Math.sin(base*.4+k)*.25);c.globalAlpha=s.tunnel*clamp(sc*4)*clamp(1.15-sc*.45);c.drawImage(im,-w/2,-h/2,w,h);
  c.globalAlpha=s.tunnel*clamp(sc*4)*clamp(1.8-sc*.4);c.strokeStyle=GOLD;c.lineWidth=Math.max(2,6*sc);c.strokeRect(-w/2+8*sc,-h/2+8*sc,w-16*sc,h-16*sc);c.restore();}
 c.restore();HD_PASSES.forEach(at=>{const age=T-at;if(age>=0&&age<.5)halo(c,a.glow,C.x,C.y,1100,1100,(1-age/.5)*.45*s.tunnel);});
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const ang=rnd(i)*TAU,u=((rnd(i+7)+base*.7)%1),d=u*u*700;c.globalAlpha=s.tunnel*u*.8;c.strokeStyle=i%3?WHITE:GOLD;c.lineWidth=1.5+u*2;c.beginPath();c.moveTo(C.x+Math.cos(ang)*d,C.y+Math.sin(ang)*d);c.lineTo(C.x+Math.cos(ang)*(d+40+u*80),C.y+Math.sin(ang)*(d+40+u*80));c.stroke();}c.restore();}
// 4. trọng lực đảo: đá bay ngược lên
function drawGravity(c,s,T,light){if(T<HD.flip||T>HD.flipBack+1.5)return;const n=light?18:44;c.save();for(let i=0;i<n;i++){const at=HD_GRAVITY[i%4]-1.2+rnd(i)*.5,t=T-at;if(t<0||t>3)continue;
 const x=rnd(i+500)*900,y=s.feet+80-t*t*260-rnd(i+77)*120,r=6+rnd(i+9)*14;c.globalAlpha=clamp(1-t/3)*.95;c.fillStyle=i%4?'#3a3020':'#c8a060';c.strokeStyle='#ffe0a0';c.lineWidth=1;c.save();c.translate(x,y);c.rotate(t*2+i);c.beginPath();c.moveTo(-r,0);c.lineTo(0,-r);c.lineTo(r,0);c.lineTo(0,r*.8);c.closePath();c.fill();c.stroke();c.restore();}c.restore();
 HD_GRAVITY.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.8)ring(c,450,s.feet,60+age*800,i%2?PALE:GOLD,9*(1-age/.8),1-age/.8,(60+age*800)*.25);});}
// 5. điểm vô cực + 3 thiên luật
function drawInfinity(c,a,s,T){const C={x:450,y:s.belly-90};if(s.infinity>0){const sc=.62+Math.sin(s.clock*2)*.02,dive=ease((T-HD.lawsIn)/.5),y=mix(C.y,s.belly,dive),k=mix(sc,.08,dive);
  halo(c,a.glow,450,y,480*k+60,280*k+40,.8*s.infinity);c.save();c.globalAlpha=s.infinity;c.translate(450,y);c.rotate(Math.sin(s.clock*.7)*.05);c.drawImage(a.inf,-180*k,-100*k,360*k,200*k);c.restore();}
 HD_SPIRAL.forEach((at,i)=>{const age=T-at;if(age>=0&&age<1)ring(c,C.x,C.y,400*(1-age)+20,i%2?PALE:GOLD,6,(1-age)*.9,(400*(1-age)+20)*.5);});
 const age=T-HD.infinity;if(age>=0&&age<.8){halo(c,a.glow,C.x,C.y,700,500,1-age/.8);}}
function drawLaws(c,a,s,T,dir){HD_LAWS.forEach((at,i)=>{const age=T-at;if(age<0)return;const x=450+(i-1)*250*dir,y=s.H*.17,carve=clamp(age/.6),dive=ease((T-HD.lawsIn+.25-i*.05)/.45),C={x:450,y:s.belly-90};
 if(dive>=1)return;const px=mix(x,C.x,dive),py=mix(y,C.y,dive),sc=mix(.85,.1,dive);
 c.save();c.translate(px,py);c.scale(sc,sc);c.beginPath();c.rect(-150,-150,300,300*carve);c.clip();c.drawImage(a.laws[i],-150,-150);c.restore();
 if(carve<1&&dive<=0){const ey=y-150*sc+300*sc*carve,ex=x+Math.sin(age*40)*60*sc;halo(c,a.glow,ex,ey,160,160,1);c.save();c.globalCompositeOperation='lighter';for(let j=0;j<6;j++){c.globalAlpha=.9;c.fillStyle=WHITE;c.fillRect(ex+(rnd(j+age*30)-.5)*90,ey+(rnd(j+9)-.2)*40,3,3);}c.restore();}
 const g=age-.6;if(g>=0&&g<.8&&dive<=0){halo(c,a.glow,x,y,520,520,1-g/.8);ring(c,x,y,100+g*300,GOLD,8*(1-g/.8),1-g/.8);}});}
// 6. hiện thân
function drawRevealHalo(c,a,s,front){if(!s.revealed)return;const k=s.after*s.fade;if(!front){c.save();c.globalAlpha=k*.85;c.translate(450,s.head-30);const sc=.62;c.rotate(Math.sin(s.clock*.4)*.05);c.drawImage(a.inf,-180*sc,-100*sc,360*sc,200*sc);c.restore();halo(c,a.glow,450,s.head-30,320,220,k*.45);}
 for(let i=0;i<3;i++){const ang=s.clock*.5+i*TAU/3,z=Math.sin(ang);if((z>0)!==front)continue;const x=450+Math.cos(ang)*240,y=s.belly-110+z*50,sc=.22+.06*(z+1)/2;c.save();c.globalAlpha=k*(.7+.3*(z+1)/2);c.translate(x,y);c.scale(sc,sc);c.drawImage(a.laws[i],-150,-150);c.restore();halo(c,a.glow,x,y,90,90,k*.4);}}
// chụp cảnh trời đất (chưa có nhân vật) để nhát khai thiên chỉ chẻ thế giới, không chẻ người
function snapshotWorld(c,a){const cv=c.canvas,w=cv.width,h=cv.height;if(!(w>0&&h>0))return false;let b=a.buffer;if(!b||b.width!==w||b.height!==h)b=a.buffer=makeSurface(w,h);const bc=b?.getContext('2d');if(!bc)return false;
 bc.setTransform(1,0,0,1,0,0);bc.clearRect(0,0,w,h);bc.drawImage(cv,0,0);return true;}
function drawWorldSplit(c,a,s,T,hero){if(s.split<=0||!a.snapped)return;const cv=c.canvas,w=cv.width,h=cv.height,b=a.buffer;if(!b)return;const d=s.split*w*.16;c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#fffaf0';c.fillRect(0,0,w,h);
 c.drawImage(b,0,0,w/2,h,-d,0,w/2,h);c.drawImage(b,w/2,0,w/2,h,w/2+d,0,w/2,h);
 const g=c.createLinearGradient(w/2-d,0,w/2+d,0);g.addColorStop(0,'#ffdb84');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#ffdb84');c.fillStyle=g;c.fillRect(w/2-d,0,d*2,h);
 if(hero){c.setTransform(w/900,0,0,h/s.H,0,0);c.globalAlpha=1;c.drawImage(hero,130,s.feet-590);if(a.vignette)c.drawImage(a.vignette,0,0,900,s.H);}c.restore();}
function drawAxeSlash(c,a,s,T){const age=T-HD.impact+.25;if(age<0||age>1.2)return;const u=ease(age/.22),f=1-ease((age-.25)/.9);c.save();c.globalCompositeOperation='lighter';
 const top=-40,bot=mix(-40,s.H+40,u);const g=c.createLinearGradient(410,0,490,0);g.addColorStop(0,'#ffdb8400');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#ffdb8400');c.fillStyle=g;c.globalAlpha=f;c.fillRect(380,top,140,bot-top);
 c.strokeStyle=WHITE;c.lineWidth=5*f;c.beginPath();c.moveTo(450,top);c.lineTo(450,bot);c.stroke();c.restore();if(age<.4)halo(c,a.glow,450,bot,600,300,1-age/.4);}
function drawBigBang(c,a,s,T,light){const age=T-HD.impact;if(age<0||age>3.4)return;const n=light?50:130;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const ang=rnd(i+70)*TAU,sp=300+rnd(i)*900,d=age*sp,x=450+Math.cos(ang)*d,y=s.belly+Math.sin(ang)*d,tail=Math.min(d,40+sp*.08);c.globalAlpha=clamp(1-age/3.4);c.strokeStyle=i%5===0?AMBER:i%3?GOLD:WHITE;c.lineWidth=1.5+rnd(i+3)*2;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(ang)*tail,y-Math.sin(ang)*tail);c.stroke();}c.restore();
 for(let i=0;i<12;i++){const u=clamp((age-i*.06)/1.9);if(u<=0||u>=1)continue;const r=60+ease(u)*1300;ring(c,450,s.belly,r,i%3===0?WHITE:i%2?AMBER:GOLD,18*(1-u)+2,(1-u)*.9,r*.5);}
 halo(c,a.glow,450,s.belly,1600,1600,s.bang*.9);}

export function drawHonDonAwakening(scene,c,e,t,H){
 const s=honDonState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),T=s.T,dir=v.flip?-1:1,light=scene.budget?.level==='light';
 const kq=qiRemap(s.k,HD.impact/HD.duration),origin={x:450,y:s.belly};
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 c.fillStyle='#050408';c.fillRect(0,0,900,H);
 // nền thế giới: xoay ngược khi trọng lực đảo
 const painted=lateRealmBackdrop(28),ang=s.rot*Math.PI*dir;
 c.save();if(ang){c.translate(450,H*.5);c.rotate(ang);c.scale(1+Math.abs(Math.sin(ang))*1.15,1+Math.abs(Math.sin(ang))*1.15);c.translate(-450,-H*.5);}
 if(a.deep)c.drawImage(a.deep,0,0,900,H);
 if(painted){const slide=s.motion?Math.sin(s.clock*.1)*14:0;c.globalAlpha=mix(.45,.95,ease((T-HD_CHAOS[0])/4));c.drawImage(painted,-30+slide,-30,960,H+60);c.globalAlpha=1;}
 drawHorizon(c,a,s,T);
 c.restore();
 drawScreenPulse(c,H,scene.reduceFlash,GOLD,hit*.06);
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false?hit*16+s.bang*20:0;c.translate(Math.sin(T*79)*shake,Math.cos(T*67)*shake*.6);
 drawTunnel(c,a,s,T);
 drawPanes(c,a,s,T,dir);
 drawGravity(c,s,T,light);
 if(a.ground&&!(T>=HD.impact&&T<HD.reveal+1)){c.save();c.globalAlpha=T>=HD.impact?ease((T-HD.reveal-.2)/1):1;c.drawImage(a.ground,0,s.feet-70,900,320);c.restore();}
 drawRevealHalo(c,a,s,false);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 drawBigBang(c,a,s,T,light);
 a.snapped=s.split>0&&s.motion&&!light&&snapshotWorld(c,a);
 if(image){c.save();c.globalAlpha=clamp(T/.15);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawRevealHalo(c,a,s,true);
 drawInfinity(c,a,s,T);
 {const age=T-HD.lawsIn-.45;if(age>=0&&age<.7){ring(c,450,s.belly,18+age*560,GOLD,10*(1-age/.7)+1,1-age/.7,(18+age*560)*.6);halo(c,a.glow,450,s.belly,440,440,1-age/.7);}}
 if(T>=HD.lawsIn+.45&&T<HD.impact){ring(c,450,s.belly,14,GOLD,3,.9);halo(c,a.glow,450,s.belly,90,90,.8);}
 if(s.revealed){const k=s.after*s.fade;ring(c,450,s.belly,16,GOLD,2,k*.9,6);}
 drawQiCompression(c,kq,origin);
 c.restore();
 drawLaws(c,a,s,T,dir);
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.9;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...HD_BEATS.map(at=>pulse(T-at,.25)));ring(c,450,s.belly,14+beat*34,GOLD,2+beat*3,s.dark*(.5+beat*.5));halo(c,a.glow,450,s.belly,60,60,s.dark);}
 drawAxeSlash(c,a,s,T);
 drawScreenPulse(c,H,scene.reduceFlash,'#fffaf0',s.bang*.36);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 if(s.motion&&!light)drawWorldSplit(c,a,s,T,image);
 const b=Math.max(0,BEATS.findLastIndex(([at])=>at<=T));
 const ui={k:s.k,realm:28,phase:s.revealed?'reveal':'gather',revealed:s.revealed,color:GOLD,title:'Hỗn Độn Vĩnh Hằng',subtitle:'PHI THĂNG · Cõi Hỗn Độn Bỉ Ngạn' /* 17/11 chủ game: 4 cảnh giới cuối hiện chữ PHI THĂNG */,name:String(e.name||'Đạo hữu').normalize('NFC'),label:BEATS[b][1],detail:T>=HD_LAWS[0]&&T<HD.lawsIn?'Thiên luật: '+LAW_NAMES.slice(0,HD_LAWS.filter(x=>T>=x).length).join(' · '):'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.save();c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff8e8';c.fillText(ui.name,450,H*.05);c.font='700 34px Arial';c.fillText(s.revealed?'HỖN ĐỘN VĨNH HẰNG':ui.label,450,H*.09);c.restore();}
 return ui;
}
