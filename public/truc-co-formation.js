// Trúc Cơ v3 (05/11/2026) — "Linh Mạch Định Cơ". Chồng lên v2 (kiếm trúc + ngọc đài ba tầng giữ nguyên).
// Leo thang so với Luyện Khí v5: không gian tới chân trời (núi xa có linh mạch), 7 nhịp, motif mới (địa mạch + thiên ấn
// đạo cơ giáng xuống ba lần định cơ), cao trào có sóng đất + đá văng + mạch lóe toàn màn, hiện thân có vành đạo cơ và
// vương miện tám kiếm trúc. Đồng hồ: giây trên khung 10,8 s (truc-co-timeline.js), nổ 8,8 s.
//  0,0–1,4  ĐỊA MẠCH THỨC TỈNH : mạng nứt linh mạch lan từ tâm ra mặt đất; núi xa hiện, mạch sáng chạy dọc sống núi.
//  1,2–3,4  BÁT TRÚC PHÁ ĐẤT   : (v2) tám kiếm dựng; mỗi kiếm trồi lên kèm đá vụn bắn lên tại đầu mạch.
//  2,4–6,2  THIÊN ẤN GIÁNG     : ấn đạo cơ bát giác (đá khắc vàng) hiện trên trời, hạ dần tới trên đỉnh đầu;
//                                cột sáng nối đỉnh tám kiếm lên tám góc ấn (thiên–địa tương liên).
//  3,6–8,6  NẠP MẠCH           : xung sáng chạy dọc linh mạch dồn về tâm như nhịp tim; đá lơ lửng bay quanh.
//  6,3/7,0/7,7 BA LẦN ĐỊNH CƠ  : mỗi lần một vòng ấn sáng rơi từ thiên ấn xuống tầng đài vừa khóa + bụi vàng tung.
//  8,2–8,8  NGƯNG              : ấn thu nhỏ rót vào đỉnh đầu, mạch bừng sáng.
//  8,8      PHÁ                : sóng đất vàng lan, đá văng, toàn bộ linh mạch (cả trên núi) lóe.
//  8,95–10,8 HIỆN THÂN         : vành đạo cơ bát giác sau lưng, tám kiếm trúc nhỏ xoay như vương miện.
import {makeSurface} from './performance.js';
import {TRUC_CO_TIERS,TRUC_CO_BURST} from './truc-co-timeline.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3,mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const JADE='#9dffc4',JADE2='#c2f8d0',GOLD='#f2d48a',GOLD2='#ffe9b0',STONE='#2c4d4a';
const light=scene=>scene?.budget?.level==='light';
export function trucCoV3State(seconds){
 const t=seconds,after=t>=TRUC_CO_BURST,ka=after?clamp((t-TRUC_CO_BURST)/2):0;
 const stamps=TRUC_CO_TIERS.map(at=>t<at?0:t<at+.9?(t-at)/.9:0);
 return {t,after,ka,
  wake:out(t/1.4),                                         // mạch lan
  sky:ease(t/1.0)*(1-ease((t-10.3)/.5)),                   // núi xa
  sigil:ease((t-2.4)/1.2)*(1-ease((t-8.2)/.6)),            // thiên ấn hiện
  descend:ease((t-3.6)/2.6),                               // ấn hạ xuống tới trên đầu
  columns:ease((t-3.6)/.8)*(1-ease((t-8.5)/.3)),           // cột sáng kiếm→ấn
  pulse:ease((t-3.6)/.6)*(1-ease((t-8.7)/.2)),             // xung nạp mạch
  shards:ease((t-3.0)/1.2)*(after?0:1),                    // đá lơ lửng
  stamps,
  compress:ease((t-8.2)/.6)*(after?0:1),
  flare:after?Math.exp(-(t-TRUC_CO_BURST)*2.2):ease((t-8.3)/.5)*.6,
  shock:after?out((t-TRUC_CO_BURST)/1.4):0,
  debris:after?clamp((t-TRUC_CO_BURST)/1.6):0,
  halo:after?ease((t-8.95)/.6)*(1-ease((t-10.35)/.45)):0
 };
}
// ---------- tài nguyên vẽ sẵn ----------
const glowCache=new Map();
function glowSprite(color){if(glowCache.has(color))return glowCache.get(color);const f=makeSurface(64,64);if(!f)return null;const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.35,color+'cc');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);glowCache.set(color,f);return f;}
function blit(c,im,x,y,r,a){if(!im||a<=.003)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-r,y-r,r*2,r*2);}
// Mạng linh mạch trên mặt đất (toạ độ nhìn từ trên, bán kính 1 = mép trận): 8 mạch chính + nhánh, lệch theo hạt giống.
let veinNet=null;
function veins(){
 if(veinNet)return veinNet;const list=[];
 for(let i=0;i<8;i++){const a0=i*TAU/8+.2+rnd(i)*.25,pts=[[0,0]];let a=a0,r=0;for(let q=1;q<=9;q++){r+=.13+rnd(i*9+q)*.05;a+=(rnd(i*31+q)-.5)*.14;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}
  list.push({pts,main:true,i});
  for(let b=0;b<2;b++){const from=3+b*3,base=pts[from];let ba=a0+(b?.7:-.7)*(rnd(i+b*5)>.5?1:-1),br=Math.hypot(base[0],base[1]);const bp=[base];for(let q=1;q<=4;q++){br+=.08+rnd(i*7+q+b)*.04;ba+=(rnd(i*13+q*b)-.5)*.2;bp.push([Math.cos(ba)*br,Math.sin(ba)*br]);}list.push({pts:bp,main:false,i,start:from/9});}
 }
 return veinNet=list;
}
function sigilSurface(scene){
 if(scene.tcSigil)return scene.tcSigil;const S=620,f=makeSurface(S,S);if(!f)return null;const c=f.getContext('2d'),R=S/2;c.translate(R,R);
 const oct=(r,rot=Math.PI/8)=>{c.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8+rot;i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();};
 // Đá ấn: mặt đá xanh thẫm, viền vàng hai lớp, khắc tám cánh trúc + vòng triện.
 oct(R-6);const g=c.createRadialGradient(0,0,20,0,0,R);g.addColorStop(0,'#3d6f69');g.addColorStop(.7,'#1d3f3c');g.addColorStop(1,'#122a29');c.fillStyle=g;c.globalAlpha=.85;c.fill();c.globalAlpha=1;
 c.strokeStyle=GOLD;c.lineWidth=6;oct(R-8);c.stroke();c.lineWidth=2;c.strokeStyle=GOLD2;oct(R-26);c.stroke();oct(R-112,0);c.strokeStyle=JADE2;c.lineWidth=2.5;c.stroke();
 c.strokeStyle=GOLD;c.lineWidth=1.4;c.setLineDash([3,7]);c.beginPath();c.arc(0,0,R-62,0,TAU);c.stroke();c.setLineDash([]);
 // Tám lá trúc khắc vàng hướng ra ngoài.
 for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.translate(0,-(R-62));c.fillStyle=GOLD2;c.globalAlpha=.9;c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(12,0,0,26);c.quadraticCurveTo(-12,0,0,-26);c.fill();c.strokeStyle='#7a5a20';c.lineWidth=1;c.beginPath();c.moveTo(0,-22);c.lineTo(0,22);c.stroke();c.restore();}
 // Lõi: vòng ngọc + chữ triện "基" (cơ) bằng nét, không phụ thuộc font.
 c.globalAlpha=1;c.strokeStyle=JADE;c.lineWidth=4;c.beginPath();c.arc(0,0,96,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle=GOLD;c.beginPath();c.arc(0,0,84,0,TAU);c.stroke();
 c.strokeStyle=GOLD2;c.lineWidth=7;c.lineCap='round';const L=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
 L(-34,-44,-34,-6);L(34,-44,34,-6);L(-46,-34,46,-34);L(-34,-20,34,-20);L(-50,-6,50,-6);L(-22,4,-40,22);L(22,4,40,22);L(0,10,0,46);L(-30,30,30,30);L(-44,46,44,46);
 return scene.tcSigil=f;
}
function mountainSurface(scene){
 if(scene.tcMountains)return scene.tcMountains;const W=450,H=300,f=makeSurface(W,H);if(!f)return null;const c=f.getContext('2d');c.scale(.5,.5);
 // Ánh chân trời ngọc–vàng phía sau núi (lấp phần trời trên cùng).
 const sky=c.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#0d2433'+'00');sky.addColorStop(.45,'#2f6b6a55');sky.addColorStop(.7,'#d9c27a40');sky.addColorStop(1,'#0d243300');c.fillStyle=sky;c.fillRect(0,0,900,600);
 // Ba lớp núi đá dựng đứng kiểu tiên sơn (đỉnh nhọn, vách dốc), xa nhạt → gần đậm; viền sống núi sáng.
 const ridges=[];
 for(const [layer,base,col,a,count,hmin,hmax] of [[0,400,'#6f93a0',.28,9,150,300],[1,470,'#3d6170',.55,7,150,320],[2,560,'#172f3a',.95,6,140,280]]){
  const peaks=[];for(let i=0;i<count;i++){const px=(i+.2+rnd(layer*17+i)*.6)/count*900,h=hmin+rnd(layer*29+i)*(hmax-hmin),w=40+rnd(layer*41+i)*45;peaks.push([px,h,w]);}
  const pts=[];c.beginPath();c.moveTo(0,600);for(let x=0;x<=900;x+=4){let y=base;for(const [px,h,w] of peaks){const d=Math.abs(x-px)/w;if(d<1.6)y=Math.min(y,base-h*Math.max(0,1-d/1.6)**1.25*(1+.04*Math.sin(x*.3+layer)));}c.lineTo(x,y);pts.push([x,y]);}
  c.lineTo(900,600);c.closePath();const g=c.createLinearGradient(0,base-hmax,0,600);g.addColorStop(0,col);g.addColorStop(.75,col+'aa');g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.fill();
  if(layer===2){c.save();c.clip();c.globalAlpha=.38;c.strokeStyle=GOLD;c.lineWidth=3;c.stroke();c.restore();}
  // Dải sương giữa các lớp.
  const mist=c.createLinearGradient(0,base-60,0,base+20);mist.addColorStop(0,'#cfe9e200');mist.addColorStop(.6,'#cfe9e22e');mist.addColorStop(1,'#cfe9e200');c.globalAlpha=1;c.fillStyle=mist;c.fillRect(0,base-60,900,80);
  ridges.push(pts);
 }
 // Mờ dần chân núi (không có mép ngang cứng).
 c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(0,0,0,H);fade.addColorStop(0,'#000');fade.addColorStop(.72,'#000');fade.addColorStop(1,'#0000');c.globalAlpha=1;c.fillStyle=fade;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';
 scene.tcRidges=ridges;return scene.tcMountains=f;
}
// ---------- lớp vẽ ----------
// Núi xa + linh mạch chạy dọc sống núi về phía tâm (ngoài camera, sau cùng).
export function drawTcSky(scene,c,st,H,v){
 if(st.sky<=.01)return;const m=mountainSurface(scene);if(!m)return;const top=H*.02,drift=Math.sin(st.t*.25+(v?.phase||0)*TAU)*14;
 c.save();c.globalAlpha=st.sky;c.drawImage(m,-30+drift,top,960,H*.40);
 // Mạch sáng trên sống núi gần nhất: đoạn sáng chạy từ hai mép vào giữa; bừng lên khi phá.
 const ridge=scene.tcRidges?.[2];if(ridge){const sx=960/900,sy=H*.40/600,run=(st.t*.18)%1,glow=.35+st.pulse*.4+st.flare*.9;c.globalCompositeOperation='lighter';c.lineCap='round';
  for(const side of [0,1]){c.beginPath();const n=ridge.length,len=Math.floor(n*.5);for(let q=0;q<len;q++){const idx=side?n-1-q:q,p=ridge[idx];const x=-30+drift+p[0]*sx,y=top+p[1]*sy;q?c.lineTo(x,y):c.moveTo(x,y);}
   c.strokeStyle=GOLD;c.globalAlpha=st.sky*glow*.5;c.lineWidth=3;c.stroke();
   const head=Math.floor(run*len),gs=glowSprite(GOLD);for(let j=0;j<3;j++){const q=(head+j*Math.floor(len/3))%len,p=ridge[side?n-1-q:q];blit(c,gs,-30+drift+p[0]*sx,top+p[1]*sy,14,st.sky*(.6+st.pulse*.4));}}}
 c.restore();
}
// Linh mạch trên mặt đất quanh đài (phối cảnh), xung sáng chạy về tâm, bừng khi phá.
export function drawTcGroundVeins(scene,c,st,s){
 if(st.wake<=.01)return;const cx=450,cy=s.ground+10,R=520,flat=.3,list=veins(),lite=light(scene);
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';
 const P=(p)=>[cx+p[0]*R,cy+p[1]*R*flat];
 for(const vn of list){if(lite&&!vn.main)continue;const reveal=clamp((st.wake-(vn.start||0)*.6)/.6);if(reveal<=0)continue;const n=Math.max(2,Math.ceil(vn.pts.length*reveal));
  const base=(vn.main?.7:.45)*(1-st.ka*.4)+st.flare*.6+st.pulse*.15;
  for(const [w,col,a] of (lite?[[4,GOLD,1]]:[[18,JADE,.14],[6,vn.main?GOLD:JADE,.6],[1.6,GOLD2,.7]])){c.globalAlpha=Math.min(1,base*a);c.strokeStyle=col;c.lineWidth=w*(vn.main?1:.6);c.beginPath();const pts=vn.pts.slice(0,n).map(P);c.moveTo(...pts[0]);for(let q=1;q<pts.length-1;q++){const mx=(pts[q][0]+pts[q+1][0])/2,my=(pts[q][1]+pts[q+1][1])/2;c.quadraticCurveTo(pts[q][0],pts[q][1],mx,my);}c.lineTo(...pts[pts.length-1]);c.stroke();}
 }
 // Xung nạp mạch: điểm sáng đi từ đầu mạch ngoài về tâm.
 if(st.pulse>.01){const gs=glowSprite(GOLD);for(const vn of list){if(!vn.main)continue;const n=vn.pts.length;for(let j=0;j<2;j++){const u=1-((st.t*.55+vn.i*.11+j*.5)%1),f=u*(n-1),q=Math.min(n-2,Math.floor(f)),w=f-q,a=vn.pts[q],b=vn.pts[q+1];const [x,y]=P([mix(a[0],b[0],w),mix(a[1],b[1],w)]);blit(c,gs,x,y,16,st.pulse*.9);}}}
 // Sóng đất khi phá: vòng vàng bụi lan rộng.
 if(st.shock>0&&st.shock<1){const r=180+st.shock*560;c.globalAlpha=(1-st.shock)*.8;c.strokeStyle=GOLD;for(let q=0;q<18;q++){const a0=q*TAU/18,len=TAU/18*(.6+.3*rnd(q));c.lineWidth=(18+10*rnd(q+3))*(1-st.shock*.6);c.beginPath();c.ellipse(cx,cy,r,r*flat,0,a0,a0+len);c.stroke();}
  c.globalAlpha=(1-st.shock)*.5;c.strokeStyle=JADE2;c.lineWidth=3;c.beginPath();c.ellipse(cx,cy,r*.82,r*.82*flat,0,0,TAU);c.stroke();}
 c.restore();
}
// Đá vụn: trồi lên theo kiếm, lơ lửng quay quanh khi nạp mạch, văng ra khi phá.
function rock(c,x,y,sz,rot,a){if(a<=.01)return;c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=a;c.fillStyle=STONE;c.beginPath();c.moveTo(-sz,-sz*.3);c.lineTo(-sz*.3,-sz);c.lineTo(sz*.8,-sz*.5);c.lineTo(sz,sz*.4);c.lineTo(0,sz*.9);c.lineTo(-sz*.8,sz*.6);c.closePath();c.fill();c.strokeStyle=GOLD;c.lineWidth=1.4;c.globalAlpha=a*.8;c.stroke();c.restore();}
export function drawTcShards(scene,c,st,s,layerFront){
 const n=light(scene)?8:16,cx=450,cy=s.ground-20;
 for(let i=0;i<n;i++){const front=i%2===0;if(front!==layerFront)continue;const a0=i*TAU/n+rnd(i)*.4,orbit=a0+st.t*(.25+rnd(i+5)*.2),r=230+rnd(i+2)*190,sz=11+rnd(i+7)*14;
  if(!st.after){if(st.shards<=.01)continue;const y=cy-(60+rnd(i+11)*260)*st.shards-Math.sin(st.t*1.3+i)*8;const x=cx+Math.cos(orbit)*r,yy=y+Math.sin(orbit)*r*.22;if((Math.sin(orbit)>0)!==layerFront&&st.shards>.5)continue;rock(c,x,yy,sz,st.t*(.6+rnd(i)),st.shards*.9);}
  else if(st.debris<1){const d=st.debris,x=cx+Math.cos(a0)*(r+d*520),y=cy-(80+rnd(i+11)*200)+d*d*260-Math.sin(d*Math.PI)*120;rock(c,x,y,sz*(1+d*.4),st.t*3+i,(1-d)*.9);}
 }
}
// Thiên ấn đạo cơ: hiện cao trên trời, hạ dần tới trên đỉnh đầu; ba vòng định cơ rơi xuống đài; ngưng thì thu vào đỉnh đầu.
export function drawTcSigil(scene,c,st,s,v){
 if(st.sigil<=.01&&!st.stamps.some(x=>x>0))return;const im=sigilSurface(scene);if(!im)return;const cx=450,head=s.body-250;
 const y=mix(s.feet-720,head-60,st.descend)+st.compress*80,R=(300-st.descend*90)*(1-st.compress*.85),flat=.34+.1*(1-st.descend),rot=(v?.flip?-1:1)*(st.t*.35+(v?.phase||0)*TAU);
 c.save();c.globalAlpha=st.sigil;c.translate(cx,y);c.scale(1,flat);c.rotate(rot);c.drawImage(im,-R,-R,R*2,R*2);c.restore();
 // Hào quang dưới ấn.
 c.save();c.globalCompositeOperation='lighter';blit(c,glowSprite(GOLD),cx,y,R*.7,st.sigil*(.35+st.compress*.5));
 // Cột sáng từ đỉnh tám kiếm lên tám góc ấn.
 if(st.columns>.01){for(let i=0;i<8;i++){const sw=s.swords?.[i];if(!sw||!sw.rise)continue;const tipX=sw.x,tipY=sw.y-sw.height*sw.rise,a=i*TAU/8+rot,vx=cx+Math.cos(a)*R*.95,vy=y+Math.sin(a)*R*.95*flat;
  const g=c.createLinearGradient(tipX,tipY,vx,vy);g.addColorStop(0,JADE+'00');g.addColorStop(.5,JADE2+'aa');g.addColorStop(1,GOLD2+'dd');c.strokeStyle=g;c.globalAlpha=st.columns*st.sigil*(.55+.25*Math.sin(st.t*6+i));c.lineWidth=3;c.beginPath();c.moveTo(tipX,tipY);c.lineTo(vx,vy);c.stroke();}}
 // Ba lần định cơ: vòng ấn sáng rơi từ ấn xuống tầng đài.
 st.stamps.forEach((u,i)=>{if(u<=0)return;const ty=s.ground-(i+1)*22,yy=mix(y,ty,out(u*1.6)),rr=mix(R*.8,[342,279,216][i],out(u*1.6)),a=u<.6?1:1-(u-.6)/.4;
  c.globalAlpha=a*.9;c.strokeStyle=GOLD2;c.lineWidth=5;c.beginPath();c.ellipse(cx,yy,rr,rr*.25,0,0,TAU);c.stroke();c.strokeStyle=JADE2;c.lineWidth=2;c.beginPath();c.ellipse(cx,yy,rr*.9,rr*.22,0,0,TAU);c.stroke();
  if(u>.55){const k=(u-.55)/.45,gs=glowSprite(GOLD);for(let q=0;q<(light(scene)?6:14);q++){const a2=q*TAU/14+i,d=rr*(1+k*.4);blit(c,gs,cx+Math.cos(a2)*d,ty+Math.sin(a2)*d*.25-k*40*rnd(q+i),8,(1-k)*.8);}}});
 c.restore();
}
// Vành đạo cơ sau lưng + vương miện tám kiếm trúc nhỏ khi hiện thân.
export function drawTcHalo(scene,c,st,s,v){
 if(st.halo<=.01)return;const im=sigilSurface(scene);if(!im)return;const cx=450,cy=s.body-150,R=200*(.8+.2*out(st.halo)),rot=(v?.flip?-1:1)*st.t*.25;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=st.halo*.32;c.translate(cx,cy);c.rotate(rot);c.drawImage(im,-R,-R,R*2,R*2);c.restore();
 c.save();for(let i=0;i<8;i++){const a=i*TAU/8-rot*1.6,x=cx+Math.cos(a)*(R+34),y=cy+Math.sin(a)*(R+34)*.42-R*.55;c.save();c.translate(x,y);c.rotate(Math.cos(a)*.15);c.globalAlpha=st.halo*.9;
  const g=c.createLinearGradient(0,-30,0,30);g.addColorStop(0,'#eaffe9');g.addColorStop(1,'#4fae86');c.fillStyle=g;c.fillRect(-3.5,-30,7,52);c.fillStyle=GOLD;c.fillRect(-7,20,14,3);c.restore();}c.restore();
}
