// Vô Cực Thiên Tổ v2 — "Thiên Cơ Dệt Mệnh" (15/11/2026). 56 s; nổ 50,0; đổi skin 50,35 (giữ mốc late-ascension-data).
// Cơ chế riêng (không lặp Thái Sơ/Vĩnh Kiếp: không la bàn, lục địa, rồng, thời hà, sa lậu):
// 6 hạt mệnh rơi, mỗi hạt mọc một sợi dọc lên trời (6 cú) → khung dệt Thiên Cơ ráp 4 thanh (4 cú), căng 24 sợi dọc (3 cú gảy) →
// con thoi sáng phóng ngang 6 lượt, mỗi lượt dệt một hàng sợi ngang màu khác (6 cú) →
// Thiên Kiếp Tiễn (kéo đen) cắt tấm vải 4 nhát, mảnh vải rơi, rồi toàn bộ sợi đứt bung (5 cú) →
// 8 mệnh tuyến vàng phóng từ đan điền bắt đầu sợi đứt, thắt 8 nút (8 cú) →
// 2 con thoi đan chéo 12 lượt dệt lại thiên võng hình mạng nhện sau lưng →
// thiên võng thu thành một nút Bàn Trường, giật 3 lần, kéo vào đan điền → tối, 2 nhịp tim →
// NỔ: vạn sợi sáng toả ra → hiện thân: thiên võng nhỏ sau đầu, 4 dải mệnh tuyến bay quanh.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {lateRealmBackdrop} from './late-ascension-art.js';

export const VC=Object.freeze({duration:56,snap:25.6,knot:44.0,pull:48.0,dark:48.8,impact:50,reveal:50.35,fade:54.4});
export const VC_SEEDS=Object.freeze([.2,1.0,1.8,2.6,3.4,4.2]);
export const VC_BEAMS=Object.freeze([6.0,6.8,7.6,8.4]);
export const VC_STRINGS=Object.freeze([9.2,10.0,10.8]);
export const VC_HEDDLE=11.6;
export const VC_SHUTTLE=Object.freeze(Array.from({length:6},(_,i)=>13+i*1.2));
export const VC_CUTS=Object.freeze([20.0,21.4,22.8,24.2]);
export const VC_WHIPS=Object.freeze([26.6,27.5]);
export const VC_KNOTS=Object.freeze(Array.from({length:8},(_,i)=>28+i*.9));
export const VC_WEAVE=Object.freeze(Array.from({length:12},(_,i)=>36+i*.6));
export const VC_PULLS=Object.freeze([45.6,46.4,47.2]);
export const VC_BEATS=Object.freeze([49.2,49.55]);
export const VO_CUC_DURATION=56000;
const BEATS=[[0,'Hạt mệnh rơi xuống'],[6,'Thiên cơ dựng khung'],[13,'Thoi sáng dệt sợi ngang'],[20,'Lưới vận mệnh bị cắt'],[28,'Nối từng mệnh tuyến'],[36,'Dệt lại thiên võng'],[44,'Rút nút thắt cuối vào đan điền'],[50,'Thiên võng khai mở'],[50.35,'Thiên Tổ hiện thân']];

const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const back=x=>{x=clamp(x);const s=1.6;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*197.9+43.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len)=>age>=0&&age<len?Math.exp(-age/len*5):0;
const VIOLET='#d5a1ff',GOLD='#ffe1a0',PINK='#ffb8e0',CUT='#ff4a6a',SILK='#f4ecff';
const WEFT=['#ffe1a0','#ffb8e0','#b8d8ff','#d5a1ff','#a8ffe0','#ffd0a0'];
const PALETTE={main:VIOLET,main2:'#8a5ad8',soft:'#fbf4ff',gold:GOLD};
const LX=110,RX=790,WARPS=24;

export function voCucHits(){return [
 ...VC_SEEDS.map((a,i)=>[a+.45,.9+i*.08]),...VC_BEAMS.map((a,i)=>[a+.3,1.2+i*.12]),...VC_STRINGS.map((a,i)=>[a,1+i*.2]),[VC_HEDDLE,1.1],
 ...VC_SHUTTLE.map((a,i)=>[a+.55,1+i*.08]),...VC_CUTS.map((a,i)=>[a+.3,1.6+i*.15]),[VC.snap,2.1],...VC_WHIPS.map((a,i)=>[a,1.1+i*.15]),...VC_KNOTS.map((a,i)=>[a+.5,.9+i*.07]),
 ...VC_WEAVE.map((a,i)=>[a+.3,.55+i*.03]),[VC.knot+1.2,1.4],...VC_PULLS.map((a,i)=>[a,1.3+i*.25]),[VC.pull+.6,2.0],...VC_BEATS.map(a=>[a,.6]),[VC.impact,2.9]];}
function hitPower(T){let p=0;for(const [a,f] of voCucHits()){const age=T-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}

export function voCucState(k,H=1600,motion=true){
 const T=clamp(k)*VC.duration,feet=H*.73,top=H*.13;
 return {k:clamp(k),T,H,motion,clock:motion?T:0,feet,belly:feet-145,head:feet-338,top,bottom:feet-20,
  frame:VC_BEAMS.reduce((n,a)=>n+ease((T-a)/.35),0)/4*(1-ease((T-VC.knot)/1.5)),
  loose:ease((T-VC.snap)/.5)*(1-ease((T-VC_KNOTS[7]-.6)/1)),cloth:ease((T-VC_SHUTTLE[0])/.5)*(1-ease((T-VC.snap)/.6)),
  web:ease((T-VC_WEAVE[0])/.6)*(1-ease((T-VC.knot)/1.4)),knot:ease((T-VC.knot)/1.2)*(1-ease((T-VC.pull)/.7)),
  red:VC_CUTS.reduce((n,a)=>Math.max(n,pulse(T-a-.3,1.2)),0)+pulse(T-VC.snap,1.6),
  dark:ease((T-VC.dark)/.4)*(1-ease((T-VC.impact)/.12)),bang:pulse(T-VC.impact,1),
  revealed:T>=VC.reveal,after:ease((T-VC.reveal)/1.3),fade:1-ease((T-VC.fade)/1.4)};
}

function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function glowSprite(inner,mid,outer){return surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.22,mid);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,128,128);});}
function shuttleSprite(){return surface(200,60,c=>{c.translate(100,30);c.beginPath();c.moveTo(-90,0);c.quadraticCurveTo(-40,-22,0,-22);c.quadraticCurveTo(40,-22,90,0);c.quadraticCurveTo(40,22,0,22);c.quadraticCurveTo(-40,22,-90,0);c.closePath();
 const g=c.createLinearGradient(0,-22,0,22);g.addColorStop(0,'#fff6e0');g.addColorStop(.5,'#d0a050');g.addColorStop(1,'#6a4a1a');c.fillStyle=g;c.fill();c.strokeStyle='#fff0c0';c.lineWidth=2;c.stroke();
 c.fillStyle='#3a2410';c.fillRect(-26,-8,52,16);c.fillStyle='#f4ecff';for(let i=0;i<6;i++)c.fillRect(-22+i*8,-6,4,12);});}
function bladeSprite(){return surface(520,90,c=>{c.translate(30,45);c.beginPath();c.moveTo(0,-14);c.lineTo(470,-4);c.lineTo(490,0);c.lineTo(470,6);c.lineTo(0,14);c.closePath();
 const g=c.createLinearGradient(0,-14,0,14);g.addColorStop(0,'#5a4a6a');g.addColorStop(.45,'#120a1a');g.addColorStop(1,'#2a1a3a');c.fillStyle=g;c.fill();c.strokeStyle='#ff9ab0';c.lineWidth=2;c.stroke();
 c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.globalAlpha=.8;c.lineWidth=1.5;c.beginPath();c.moveTo(20,-10);c.lineTo(480,-2);c.stroke();
 c.globalCompositeOperation='source-over';c.globalAlpha=1;c.beginPath();c.arc(0,0,26,0,TAU);c.lineWidth=9;c.strokeStyle='#1a0e24';c.stroke();c.lineWidth=2;c.strokeStyle='#ff9ab0';c.stroke();});}
function knotSprite(){return surface(300,300,c=>{c.translate(150,150);c.rotate(Math.PI/4);c.lineCap='round';c.lineJoin='round';
 const path=()=>{c.beginPath();for(let i=-2;i<=2;i++){c.moveTo(-80,i*32);c.lineTo(80,i*32);c.moveTo(i*32,-80);c.lineTo(i*32,80);}
  for(const [x,y,a] of [[-80,0,Math.PI],[80,0,0],[0,-80,-Math.PI/2],[0,80,Math.PI/2]]){c.moveTo(x+Math.cos(a+Math.PI/2)*32,y+Math.sin(a+Math.PI/2)*32);c.arc(x,y,32,a+Math.PI/2,a-Math.PI/2,true);}};
 path();c.strokeStyle='#4a1a2a';c.lineWidth=18;c.stroke();path();c.strokeStyle=CUT;c.lineWidth=12;c.stroke();path();c.strokeStyle='#ffd0dc';c.lineWidth=3;c.stroke();
 c.rotate(-Math.PI/4);c.fillStyle=GOLD;c.beginPath();c.arc(0,0,16,0,TAU);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(-4,-4,5,0,TAU);c.fill();});}
function loomBeam(w,h,vertical){return surface(w,h,c=>{const g=vertical?c.createLinearGradient(0,0,w,0):c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#5a3a1a');g.addColorStop(.35,'#ffdca0');g.addColorStop(.6,'#b07a30');g.addColorStop(1,'#3a2410');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.strokeStyle='#fff0c8';c.globalAlpha=.6;c.lineWidth=1.5;c.strokeRect(1,1,w-2,h-2);c.globalAlpha=1;c.fillStyle='#ffe9b8';
 const n=vertical?Math.floor(h/90):Math.floor(w/90);for(let i=1;i<n;i++){const x=vertical?w/2:i*w/n,y=vertical?i*h/n:h/2;c.beginPath();c.arc(x,y,Math.min(w,h)*.22,0,TAU);c.fill();}});}

function assets(scene,H){
 const cache=scene.voCucAssets;if(cache?.H===H)return cache;
 const deep=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#080414');g.addColorStop(.45,'#1e1236');g.addColorStop(1,'#06040c');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<240;i++){c.globalAlpha=.25+rnd(i+40)*.6;c.fillStyle=i%5?'#f0e8ff':PINK;const r=rnd(i+90)*1.7+.4;c.fillRect(rnd(i)*900,rnd(i+400)*H*.6,r,r);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.52,180,450,H*.52,H*.74);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000000');g.addColorStop(1,'#000000e0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const ground=surface(900,320,c=>{c.translate(450,70);c.beginPath();c.moveTo(-300,0);c.bezierCurveTo(-230,-30,230,-30,300,0);
  const under=[[255,30],[205,68],[150,94],[95,145],[25,186],[-35,158],[-95,128],[-160,90],[-225,54],[-280,22]];for(const [x,y] of under)c.lineTo(x,y+(rnd(x)-.5)*12);c.closePath();
  const g=c.createLinearGradient(0,-30,0,190);g.addColorStop(0,'#4a3a5e');g.addColorStop(.25,'#1a1228');g.addColorStop(1,'#06040a');c.fillStyle=g;c.fill();c.strokeStyle='#e4c8ff';c.globalAlpha=.7;c.lineWidth=2;c.stroke();
  c.save();c.scale(1,.24);c.globalAlpha=.5;c.strokeStyle=VIOLET;c.lineWidth=2.5;for(let r=90;r<=240;r+=50){c.beginPath();c.arc(0,-40,r,0,TAU);c.stroke();}for(let j=0;j<16;j++){const a=j/16*TAU;c.beginPath();c.moveTo(0,-40);c.lineTo(Math.cos(a)*240,-40+Math.sin(a)*240);c.stroke();}c.restore();});
 const out={H,deep,vignette,ground,shuttle:shuttleSprite(),blade:bladeSprite(),knot:knotSprite(),post:loomBeam(34,Math.round(H*.66),true),beam:loomBeam(760,34,false),
  glow:glowSprite('#ffffff','#ecd8ffc0','#d5a1ff00'),warm:glowSprite('#ffffff','#ffe9c0c0','#ffd08000'),red:glowSprite('#ffffff','#ffb0c0c0','#ff4a6a00')};
 scene.voCucAssets=out;return out;
}
function halo(c,im,x,y,w,h,a){if(!im||a<=.01)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r,rot=0){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,rot,0,TAU);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:26}),to:structuredClone(e.visualTo||{...live,realm:27})};snapshots.set(e,pair);return pair;}

const warpX=i=>mix(LX+40,RX-40,i/(WARPS-1));
const SEED_IDX=[3,20,8,15,11,12];
// 1. hạt mệnh + sợi dọc
function drawSeeds(c,a,s,T){VC_SEEDS.forEach((at,i)=>{const age=T-at;if(age<0)return;const x=warpX(SEED_IDX[i]),fall=ease(age/.45),y=mix(-20,s.bottom,fall);
 if(age<.45){halo(c,a.glow,x,y,150,150,1);halo(c,a.warm,x,y,60,60,1);c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(x,y,x,y-260);g.addColorStop(0,'#ffffffe0');g.addColorStop(1,'#d5a1ff00');c.strokeStyle=g;c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-260);c.stroke();c.restore();return;}
 const g=age-.45;if(g<1.1){ring(c,x,s.bottom,10+g*300,i%2?PINK:GOLD,9*(1-g/1.1),1-g/1.1,(10+g*300)*.25);halo(c,a.glow,x,s.bottom,320,200,1-g/1.1);
  const up=ease(g/.5);c.save();c.globalCompositeOperation='lighter';c.strokeStyle=GOLD;c.lineWidth=4;c.globalAlpha=1-g/1.1*.6;c.beginPath();c.moveTo(x,s.bottom);c.lineTo(x,mix(s.bottom,s.top,up));c.stroke();halo(c,a.warm,x,mix(s.bottom,s.top,up),90,90,1);c.restore();}});}
function warpVisible(i,s,T){const k=SEED_IDX.indexOf(i);if(k>=0&&T>=VC_SEEDS[k]+.45)return ease((T-VC_SEEDS[k]-.45)/.5);const stage=VC_STRINGS.findIndex((at,j)=>i%3===j);return stage>=0?ease((T-VC_STRINGS[stage])/.35):0;}
function drawWarps(c,s,T){if(T<VC_SEEDS[0]+.45||s.revealed)return;const tension=VC_STRINGS.reduce((n,a)=>Math.max(n,pulse(T-a,.8)),0),heddle=ease((T-VC_HEDDLE)/.4)*(1-ease((T-VC.snap)/.3));
 const fade=1-ease((T-VC_WEAVE[0])/1.2);if(fade<=0&&s.loose<=0)return;
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<WARPS;i++){const vis=warpVisible(i,s,T);if(vis<=0)continue;const x=warpX(i),grow=vis;
  const seed=SEED_IDX.includes(i);c.strokeStyle=seed||i%4===0?GOLD:SILK;c.lineWidth=seed?3.2:i%4===0?2.4:1.6;c.globalAlpha=.85*Math.max(fade,s.loose*.8);
  c.beginPath();
  if(s.loose>0){for(let j=0;j<=16;j++){const u=j/16,y=mix(s.top,s.bottom,u),w=Math.sin(u*7+s.clock*3+i)*30*s.loose*(1-Math.abs(u-.5)*1.2);j?c.lineTo(x+w,y+s.loose*u*40):c.moveTo(x+w,y);}}
  else{const y0=mix(s.bottom,s.top,grow),mid=(s.top+s.bottom)/2,wob=Math.sin(s.clock*40+i)*tension*6,lift=(i%2?-1:1)*heddle*10;c.moveTo(x,s.bottom);c.quadraticCurveTo(x+wob+lift,Math.max(y0,mid),x,y0);}
  c.stroke();}
 c.restore();}
// 2. khung dệt
function drawLoom(c,a,s,T){if(s.frame<=0&&!(T<VC.knot+1.5&&T>=VC_BEAMS[0]))return;const al=s.frame>0?1-ease((T-VC.knot)/1.5):0;if(al<=0)return;
 const pieces=[[VC_BEAMS[0],'post',LX-17,s.top-20,-500,0],[VC_BEAMS[1],'post',RX-17,s.top-20,500,0],[VC_BEAMS[2],'beam',LX-20,s.top-30,0,-500],[VC_BEAMS[3],'beam',LX-20,s.bottom,0,500]];
 for(const [at,kind,x,y,dx,dy] of pieces){const u=back((T-at)/.35);if(u<=0)continue;const im=a[kind];c.save();c.globalAlpha=al*clamp((T-at)/.15);
  if(kind==='post')c.drawImage(im,x+dx*(1-clamp(u)),y+dy*(1-clamp(u)),34,s.bottom-s.top+40);else c.drawImage(im,x+dx*(1-clamp(u)),y+dy*(1-clamp(u)),RX-LX+40,34);c.restore();
  const age=T-at-.3;if(age>=0&&age<.7){const cx=kind==='post'?x+17:450,cy=kind==='post'?(s.top+s.bottom)/2:y+17;halo(c,a.warm,cx,cy,kind==='post'?220:700,kind==='post'?700:200,1-age/.7);}}}
// 3. con thoi + sợi ngang
const rowY=(s,r)=>mix(s.top+60,s.bottom-60,(r+.5)/6);
function drawCloth(c,a,s,T,dir){if(s.cloth<=0)return;const cutA=VC_CUTS.filter(at=>T>=at+.3).length;
 c.save();c.globalCompositeOperation='lighter';
 VC_SHUTTLE.forEach((at,r)=>{const u=ease((T-at)/.55);if(u<=0)return;const L2R=(r%2===0)===(dir>0),y=rowY(s,r);const x0=L2R?LX:RX,x1=mix(x0,L2R?RX:LX,u);
  for(let i=0;i<WARPS-1;i++){const xa=warpX(i),xb=warpX(i+1);const lo=Math.min(x0,x1),hi=Math.max(x0,x1);if(xb<lo||xa>hi)continue;
   const cutHere=cutA>0&&VC_CUTS.slice(0,cutA).some((_,k)=>cutLine(s,k,dir,xa,y));
   const xs=Math.max(xa,lo),xe=Math.min(xb,hi),al=s.cloth*(cutHere?.12:1);c.save();c.globalCompositeOperation='source-over';c.globalAlpha=al*.55;c.fillStyle='#1a0e2a';c.fillRect(xs,y-26,xe-xs,52);
   for(let t=0;t<5;t++){const over=(i+r+t)%2===0,yy=y-20+t*10;c.globalAlpha=al*(over?.95:.55);c.strokeStyle=over?WEFT[r]:'#3a2a50';c.lineWidth=over?7:5;c.beginPath();c.moveTo(xs,yy);c.lineTo(xe,yy);c.stroke();
    if(over){c.globalAlpha=al*.7;c.strokeStyle='#ffffff';c.lineWidth=1.2;c.beginPath();c.moveTo(xs+2,yy-2);c.lineTo(xe-2,yy-2);c.stroke();}}c.restore();}
  if(u<1){const sx=x1;halo(c,a.glow,sx,y,160,90,1);c.save();c.globalCompositeOperation='source-over';c.translate(sx,y);if(!L2R)c.scale(-1,1);c.drawImage(a.shuttle,-100,-30);c.restore();
   c.strokeStyle=WEFT[r];c.globalAlpha=.6;c.lineWidth=14;c.beginPath();c.moveTo(sx,y);c.lineTo(sx-(L2R?1:-1)*160,y);c.stroke();}
  const age=T-at-.55;if(age>=0&&age<.6){const ex=L2R?RX:LX;halo(c,a.warm,ex,y,220,220,1-age/.6);ring(c,ex,y,10+age*200,WEFT[r],5*(1-age/.6),1-age/.6);}});
 c.restore();}
function cutLine(s,k,dir,x,y){const L=cutGeom(s,k,dir);const d=((L.x1-L.x0)*(y-L.y0)-(L.y1-L.y0)*(x-L.x0))/Math.hypot(L.x1-L.x0,L.y1-L.y0);return Math.abs(d)<14;}
function cutGeom(s,k,dir){const g=[[-1,.1,1,.85],[1,.15,-1,.7],[-1,.55,1,.25],[1,.6,-1,.95]][k];return {x0:450+g[0]*dir*420,y0:mix(s.top,s.bottom,g[1]),x1:450+g[2]*dir*420,y1:mix(s.top,s.bottom,g[3])};}
// 4. kéo cắt
function drawScissors(c,a,s,T,dir){VC_CUTS.forEach((at,k)=>{const age=T-at;if(age<-.25||age>1.2)return;const L=cutGeom(s,k,dir),ang=Math.atan2(L.y1-L.y0,L.x1-L.x0),open=age<0?.75:mix(.75,.04,ease(age/.3));
 const px=mix(L.x0,L.x1,clamp((age+.25)/.55)),py=mix(L.y0,L.y1,clamp((age+.25)/.55));const al=age<0?ease((age+.25)/.15):1-ease((age-.6)/.6);
 c.save();c.translate(px,py);c.rotate(ang+Math.PI);c.scale(1.5,1.9);c.globalAlpha=al;c.save();c.rotate(open);c.drawImage(a.blade,-30,-45);c.restore();c.save();c.rotate(-open);c.scale(1,-1);c.drawImage(a.blade,-30,-45);c.restore();c.restore();
 if(age>=0){const u=ease(age/.3),f=1-ease((age-.3)/.9);c.save();c.globalCompositeOperation='lighter';c.strokeStyle=CUT;c.lineWidth=10*f;c.globalAlpha=f;c.beginPath();c.moveTo(L.x0,L.y0);c.lineTo(mix(L.x0,L.x1,u),mix(L.y0,L.y1,u));c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2.5*f;c.stroke();c.restore();}
 const g=age-.3;if(g>=0&&g<1){halo(c,a.red,mix(L.x0,L.x1,.5),mix(L.y0,L.y1,.5),900,300,(1-g)*.7);
  for(let j=0;j<10;j++){const u=(j+.5)/10,x=mix(L.x0,L.x1,u),y=mix(L.y0,L.y1,u)+g*g*500+j%2*20;c.save();c.translate(x,y);c.rotate(g*(2+rnd(j+k*9)*4)*(j%2?1:-1));c.globalAlpha=1-g;c.fillStyle=WEFT[j%6];c.fillRect(-16,-9,32,18);c.restore();}}});
 VC_WHIPS.forEach((at,i)=>{const g=T-at;if(g<0||g>1.2)return;const x=450+(i?1:-1)*dir*230,y=mix(s.top,s.bottom,.35+i*.2);halo(c,a.red,x,y,500,500,(1-g/1.2)*.9);
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let j=0;j<3;j++){c.strokeStyle=j?SILK:CUT;c.lineWidth=(j?2:6)*(1-g/1.2)+1;c.globalAlpha=1-g/1.2;c.beginPath();c.moveTo(x-(i?-1:1)*340,y-120+j*30);c.quadraticCurveTo(x,y+Math.sin(g*20)*80,x+(i?-1:1)*340,y+140-j*30);c.stroke();}c.restore();});
 const sg=T-VC.snap;if(sg>=0&&sg<1.4){halo(c,a.red,450,(s.top+s.bottom)/2,1200,1200,(1-sg/1.4)*.6);for(let i=0;i<6;i++)ring(c,450,(s.top+s.bottom)/2,40+sg*700+i*30,i%2?CUT:SILK,5*(1-sg/1.4),1-sg/1.4,(40+sg*700+i*30)*.7);}}
// 5. mệnh tuyến + nút thắt
const knotPt=(s,i,dir)=>{const a=-Math.PI*.95+i/7*Math.PI*.9;return {x:450+Math.cos(a)*dir*330,y:s.belly-40+Math.sin(a)*330*.9};};
function drawFateLines(c,a,s,T,dir){if(T<VC_KNOTS[0]||T>VC.knot+1)return;const fade=1-ease((T-VC_WEAVE[0])/1.5);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 VC_KNOTS.forEach((at,i)=>{const u=ease((T-at)/.5);if(u<=0)return;const P=knotPt(s,i,dir),x=mix(450,P.x,u),y=mix(s.belly,P.y,u);
  c.strokeStyle=GOLD;c.globalAlpha=.85*fade;c.lineWidth=3;c.beginPath();c.moveTo(450,s.belly);c.quadraticCurveTo(mix(450,x,.5)+Math.sin(i)*40,mix(s.belly,y,.5)-40,x,y);c.stroke();
  if(u>=1){c.strokeStyle=SILK;c.globalAlpha=.6*fade;c.lineWidth=1.6;c.beginPath();c.moveTo(P.x,P.y);c.lineTo(P.x+(P.x-450)*.6,P.y+(P.y-s.belly)*.6);c.stroke();}
  const g=T-at-.5;if(g>=0){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade;c.translate(P.x,P.y);c.rotate(g*.4);const sc=mix(.7,.3,ease(g/.3));c.drawImage(a.knot,-150*sc,-150*sc,300*sc,300*sc);c.restore();
   if(g<.6){halo(c,a.warm,P.x,P.y,200,200,1-g/.6);ring(c,P.x,P.y,10+g*180,GOLD,5*(1-g/.6),1-g/.6);}}});c.restore();}
// 6. thiên võng
const webC=s=>({x:450,y:s.head+30});
function drawWeb(c,a,s,T,dir){if(s.web<=0)return;const C=webC(s),passes=VC_WEAVE.filter(at=>T>=at+.3).length,shrink=s.knot,R=mix(400,40,shrink);
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 const spokes=16;for(let j=0;j<spokes;j++){const ang=j/spokes*TAU+s.clock*.05,grow=ease((T-VC_WEAVE[0]-j*.04)/.6);c.strokeStyle=j%4?SILK:GOLD;c.lineWidth=j%4?2.2:3.4;c.globalAlpha=.9*s.web;c.beginPath();c.moveTo(C.x,C.y);c.lineTo(C.x+Math.cos(ang)*R*grow,C.y+Math.sin(ang)*R*.85*grow);c.stroke();}
 for(let r=0;r<passes;r++){const rr=R*(r+1)/12;c.strokeStyle=WEFT[r%6];c.lineWidth=3.6;c.globalAlpha=.95*s.web;c.beginPath();for(let j=0;j<=spokes;j++){const ang=j/spokes*TAU+s.clock*.05,sag=j%2?.92:1;const x=C.x+Math.cos(ang)*rr*sag,y=C.y+Math.sin(ang)*rr*.85*sag;j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 // 2 con thoi đan chéo
 VC_WEAVE.forEach((at,i)=>{const u=ease((T-at)/.3);if(u<=0||u>=1)return;const ang=(i%2?1:-1)*dir*(u*TAU*.5)+i,rr=R*(i+1)/12;const x=C.x+Math.cos(ang)*rr,y=C.y+Math.sin(ang)*rr*.85;halo(c,a.glow,x,y,110,110,1);c.save();c.globalCompositeOperation='source-over';c.translate(x,y);c.rotate(ang+Math.PI/2);c.scale(.55,.55);c.drawImage(a.shuttle,-100,-30);c.restore();});
 c.restore();}
function drawBigKnot(c,a,s,T){if(s.knot<=0)return;const C=webC(s),pull=VC_PULLS.reduce((n,at)=>n+ease((T-at)/.25),0),toBelly=ease((T-VC.pull)/.6);
 const x=450,y=mix(mix(C.y,s.belly-60,ease((T-VC.knot)/1.2)),s.belly,toBelly),sc=mix(mix(.2,1.05-pull*.12,ease((T-VC.knot)/1.2)),.08,toBelly),jit=VC_PULLS.reduce((n,at)=>Math.max(n,pulse(T-at,.4)),0);
 halo(c,a.red,x,y,420*sc+80,420*sc+80,.6+jit*.4);c.save();c.globalAlpha=s.knot;c.translate(x+Math.sin(T*60)*jit*8,y);c.rotate(Math.sin(s.clock*.8)*.06);c.drawImage(a.knot,-150*sc,-150*sc,300*sc,300*sc);c.restore();
 VC_PULLS.forEach(at=>{const g=T-at;if(g>=0&&g<.6)ring(c,x,y,150*sc+g*300,CUT,7*(1-g/.6),1-g/.6);});}
function drawThreadBurst(c,a,s,T,light){const age=T-VC.impact;if(age<0||age>3.4)return;const n=light?40:110;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const ang=rnd(i+5)*TAU,sp=400+rnd(i)*900,d=sp*age,len=Math.min(d,120+rnd(i+3)*200),wav=Math.sin(age*8+i)*20;c.globalAlpha=clamp(1-age/3.4);c.strokeStyle=WEFT[i%6];c.lineWidth=1.5+rnd(i+9)*2;
  c.beginPath();c.moveTo(450+Math.cos(ang)*(d-len),s.belly+Math.sin(ang)*(d-len));c.quadraticCurveTo(450+Math.cos(ang)*(d-len/2)+wav,s.belly+Math.sin(ang)*(d-len/2)-wav,450+Math.cos(ang)*d,s.belly+Math.sin(ang)*d);c.stroke();}c.restore();
 for(let i=0;i<10;i++){const u=clamp((age-i*.07)/1.8);if(u<=0||u>=1)continue;const r=60+ease(u)*1250;ring(c,450,s.belly,r,i%3===0?GOLD:i%2?PINK:VIOLET,16*(1-u)+2,(1-u)*.9,r*.5);}
 halo(c,a.glow,450,s.belly,1500,1500,s.bang*.85);}
function drawRevealWeb(c,a,s,front){if(!s.revealed)return;const k=s.after*s.fade;if(!front){const C={x:450,y:s.head-40};c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*.7;c.lineWidth=1.6;
  for(let j=0;j<12;j++){const ang=j/12*TAU+s.clock*.15;c.strokeStyle=j%3?SILK:GOLD;c.beginPath();c.moveTo(C.x,C.y);c.lineTo(C.x+Math.cos(ang)*120,C.y+Math.sin(ang)*110);c.stroke();}
  for(let r=1;r<=4;r++){c.strokeStyle=WEFT[r];c.beginPath();for(let j=0;j<=12;j++){const ang=j/12*TAU+s.clock*.15,rr=30*r*(j%2?.9:1);const x=C.x+Math.cos(ang)*rr,y=C.y+Math.sin(ang)*rr*.92;j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();halo(c,a.glow,C.x,C.y,240,240,k*.4);}
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<4;i++){c.strokeStyle=WEFT[i];c.lineWidth=2.5;let started=false;c.beginPath();
  for(let j=0;j<=50;j++){const u=j/50,ang=u*TAU+s.clock*(.5+i*.12)+i*1.6,z=Math.sin(ang);if((z>0)!==front){started=false;continue;}const x=450+Math.cos(ang)*(170+i*26),y=s.belly-80-i*60+z*36+Math.sin(u*12+s.clock*2)*8;c.globalAlpha=k*.75;if(!started){c.moveTo(x,y);started=true;}else c.lineTo(x,y);}c.stroke();}c.restore();}

export function drawVoCucAwakening(scene,c,e,t,H){
 const s=voCucState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),T=s.T,dir=v.flip?-1:1,light=scene.budget?.level==='light';
 const kq=qiRemap(s.k,VC.impact/VC.duration),origin={x:450,y:s.belly};
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 c.fillStyle='#07040c';c.fillRect(0,0,900,H);if(a.deep)c.drawImage(a.deep,0,0,900,H);
 const painted=lateRealmBackdrop(27);
 if(painted){c.save();const slide=s.motion?Math.sin(s.clock*.1)*14:0;c.globalAlpha=mix(.5,.95,ease((T-VC_BEAMS[0])/4));c.drawImage(painted,-30+slide,-30,960,H+60);c.restore();}
 if(s.red>0){c.save();c.globalAlpha=Math.min(.5,s.red*.4);c.fillStyle='#3a0010';c.fillRect(0,0,900,H);c.restore();}
 drawScreenPulse(c,H,scene.reduceFlash,VIOLET,hit*.06);
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false?hit*15+s.bang*18:0;c.translate(Math.sin(T*79)*shake,Math.cos(T*67)*shake*.6);
 drawLoom(c,a,s,T);
 drawWarps(c,s,T);
 drawCloth(c,a,s,T,dir);
 drawWeb(c,a,s,T,dir);
 if(a.ground&&!(T>=VC.impact&&T<VC.reveal+1)){c.save();c.globalAlpha=T>=VC.impact?ease((T-VC.reveal-.2)/1):1;c.drawImage(a.ground,0,s.feet-70,900,320);c.restore();}
 drawSeeds(c,a,s,T);
 drawRevealWeb(c,a,s,false);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 drawThreadBurst(c,a,s,T,light);
 if(image){c.save();c.globalAlpha=clamp(T/.15);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawRevealWeb(c,a,s,true);
 drawFateLines(c,a,s,T,dir);
 drawBigKnot(c,a,s,T);
 {const age=T-VC.pull-.6;if(age>=0&&age<.7){ring(c,450,s.belly,18+age*520,GOLD,10*(1-age/.7)+1,1-age/.7,(18+age*520)*.6);halo(c,a.glow,450,s.belly,420,420,1-age/.7);}}
 if(T>=VC.pull+.6&&T<VC.impact){ring(c,450,s.belly,14,CUT,3,.9);halo(c,a.red,450,s.belly,90,90,.8);}
 if(s.revealed){const k=s.after*s.fade;ring(c,450,s.belly,16,GOLD,2,k*.9,6);}
 drawQiCompression(c,kq,origin);
 c.restore();
 drawScissors(c,a,s,T,dir);
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.88;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...VC_BEATS.map(at=>pulse(T-at,.3)));ring(c,450,s.belly,14+beat*34,CUT,2+beat*3,s.dark*(.5+beat*.5));halo(c,a.red,450,s.belly,60,60,s.dark);}
 drawScreenPulse(c,H,scene.reduceFlash,'#fbf4ff',s.bang*.34);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const b=Math.max(0,BEATS.findLastIndex(([at])=>at<=T));
 const ui={k:s.k,realm:27,phase:s.revealed?'reveal':'gather',revealed:s.revealed,color:VIOLET,title:'Vô Cực Thiên Tổ',subtitle:'Thiên Cơ Dệt Mệnh',name:String(e.name||'Đạo hữu').normalize('NFC'),label:BEATS[b][1],detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.save();c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#f8f0ff';c.fillText(ui.name,450,H*.05);c.font='700 34px Arial';c.fillText(s.revealed?'VÔ CỰC THIÊN TỔ':ui.label,450,H*.09);c.restore();}
 return ui;
}
