// Kim Đan v2 (05/11/2026) — "Cửu Chuyển Kim Đan · Thiên Hỏa Đan Lô". Chồng lên v1 (đan hải, kim dịch, chín giọt,
// lõi vàng, ba đan văn, nhập thể, nhật miện giữ nguyên). Leo thang so với Trúc Cơ v3: cả bầu trời đổi sắc (hoàng hôn →
// nhật thực → bình minh), motif lửa + đan lô + lôi kiếp, 8 nhịp, cao trào đan lô vỡ + tia mặt trời quét trời.
// Đồng hồ: giây trên khung 11,8 s (kim-dan-timeline.js), nổ 9,4 s.
//  0,0–1,6  THIÊN HỎA GIÁNG : trời ngả hổ phách, đan lô ba chân khổng lồ (nét mực vàng, thân đồng trong) hiện sau lưng.
//  1,2–6,0  LUYỆN DƯỢC      : ba hỏa long xoắn quanh đan lô, tàn lửa bay; lửa trong miệng lò bập bùng.
//  3,8–6,2  CỬU CHUYỂN      : vành chín nấc quanh kim đan, mỗi giọt kim dịch nhập vào sáng một nấc.
//  5,6–8,0  LÔI KIẾP NHỎ    : mây kiếp tụ trên trời; ba đạo sét vàng–tím giáng vào kim đan đúng ba lần khóa đan văn.
//  8,2–9,05 NHẬP THỂ        : đan lô thu nhỏ trút sáng xuống đan điền; trời tối dần như nhật thực.
//  9,05–9,4 NÉN             : (v1) lực rút.
//  9,4      PHÁ             : đan lô vỡ thành mảnh đồng vàng văng ra, tia mặt trời quét cả bầu trời, trời bừng sáng.
//  9,55–11,8 HIỆN THÂN      : (v1) nhật miện + biển mây vàng bình minh.
import {makeSurface} from './performance.js';
import {KIM_DAN_DROPS,KIM_DAN_SEALS,KIM_DAN_ENTER,KIM_DAN_BURST} from './kim-dan-timeline.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3,mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const GOLD='#ffd36e',GOLD2='#fff1c4',FIRE='#ff8a3c',FIRE2='#ffb45a',BRONZE='#7a4d22',VIOLET='#c9a0ff';
const light=scene=>scene?.budget?.level==='light';
export function kimDanV2State(t){
 const after=t>=KIM_DAN_BURST,ka=after?clamp((t-KIM_DAN_BURST)/2.4):0;
 const bolts=KIM_DAN_SEALS.map(at=>t>=at-.05&&t<at+.35?1-(t-at+.05)/.4:0);
 return {t,after,ka,bolts,
  dusk:ease(t/1.6)*(1-ease((t-8.2)/.9)),                          // trời hổ phách
  eclipse:ease((t-8.2)/1.0)*(after?1-out((t-KIM_DAN_BURST)/.5):1),  // tối dần
  dawn:after?ease((t-KIM_DAN_BURST)/.5)*(1-ease((t-11.2)/.6)*.6):0, // bình minh
  cauldron:ease((t-.2)/1.3)*(after?0:1),                          // đan lô hiện
  fire:ease((t-1.2)/.8)*(1-ease((t-8.2)/.7)),                     // hỏa long
  enter:ease((t-KIM_DAN_ENTER)/.85),                              // đan lô thu nhỏ
  turns:KIM_DAN_DROPS.reduce((n,at)=>n+(t>=at?1:0),0),           // cửu chuyển: số nấc sáng
  ring:ease((t-3.9)/.5)*(1-ease((t-8.4)/.5)),
  storm:ease((t-5.6)/.6)*(1-ease((t-8.1)/.5)),                    // mây kiếp
  shatter:after?clamp((t-KIM_DAN_BURST)/1.5):0,
  rays:after?Math.exp(-(t-KIM_DAN_BURST)*1.6):0,
  clouds:after?ease((t-9.5)/.8)*(1-ease((t-11.3)/.5)):0
 };
}
// ---------- tài nguyên ----------
const glowCache=new Map();
function glowSprite(color){if(glowCache.has(color))return glowCache.get(color);const f=makeSurface(64,64);if(!f)return null;const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.35,color+'cc');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);glowCache.set(color,f);return f;}
function blit(c,im,x,y,r,a){if(!im||a<=.003)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-r,y-r,r*2,r*2);}
// Đan lô ba chân (đỉnh): thân tròn dẹt, miệng loe, hai quai, ba chân; nét mực vàng + thân đồng trong suốt + hoa văn mây.
function cauldronSurface(scene){
 if(scene.kdCauldron)return scene.kdCauldron;const W=640,H=560,f=makeSurface(W,H);if(!f)return null;const c=f.getContext('2d');c.translate(W/2,0);
 const body=()=>{c.beginPath();c.moveTo(-250,120);c.bezierCurveTo(-300,240,-270,400,-150,440);c.lineTo(150,440);c.bezierCurveTo(270,400,300,240,250,120);c.closePath();};
 // Chân.
 c.fillStyle='#3d2812cc';c.strokeStyle=GOLD;c.lineWidth=4;for(const x of [-170,0,170]){c.beginPath();c.moveTo(x-34,420);c.lineTo(x-22,540);c.quadraticCurveTo(x,556,x+22,540);c.lineTo(x+34,420);c.closePath();c.fill();c.stroke();}
 // Thân.
 body();const g=c.createLinearGradient(-280,0,280,0);g.addColorStop(0,'#4a2d12e0');g.addColorStop(.35,'#a06a2cd0');g.addColorStop(.55,'#d6a14ec0');g.addColorStop(1,'#3a220ee0');c.fillStyle=g;c.fill();c.lineWidth=6;c.strokeStyle=GOLD;c.stroke();
 // Hoa văn: dải mây vàng quanh bụng + vân mắt thần đơn giản.
 c.save();body();c.clip();c.strokeStyle=GOLD2;c.globalAlpha=.75;c.lineWidth=3;
 for(let i=-4;i<=4;i++){const x=i*60;c.beginPath();c.arc(x,250,22,Math.PI*.2,Math.PI*1.6);c.stroke();c.beginPath();c.arc(x+30,250,12,Math.PI*1.2,Math.PI*2.6);c.stroke();}
 c.lineWidth=2;c.beginPath();c.moveTo(-290,205);c.lineTo(290,205);c.moveTo(-290,300);c.lineTo(290,300);c.stroke();
 c.globalAlpha=.6;c.lineWidth=3;c.beginPath();c.ellipse(0,350,70,34,0,0,TAU);c.stroke();c.beginPath();c.arc(-30,350,10,0,TAU);c.arc(30,350,10,0,TAU);c.stroke();c.restore();
 // Miệng loe + vành.
 c.beginPath();c.ellipse(0,120,270,48,0,0,TAU);c.fillStyle='#2a1708f0';c.fill();c.lineWidth=7;c.strokeStyle=GOLD;c.stroke();c.lineWidth=2;c.strokeStyle=GOLD2;c.beginPath();c.ellipse(0,120,240,38,0,0,TAU);c.stroke();
 // Hai quai.
 c.lineWidth=12;c.strokeStyle=GOLD;for(const s of [-1,1]){c.beginPath();c.moveTo(s*190,96);c.quadraticCurveTo(s*215,10,s*150,20);c.stroke();}
 return scene.kdCauldron=f;
}
function cloudSprite(scene,tone){
 scene.kdCloud??={};if(scene.kdCloud[tone])return scene.kdCloud[tone];const W=300,H=120,f=makeSurface(W,H);if(!f)return null;const c=f.getContext('2d');
 const fill=tone==='storm'?['#5b4c78','#241b36']:['#fff1cf','#e8a95a'],line=tone==='storm'?VIOLET:GOLD2;const puffs=[[70,66,30],[112,52,38],[160,48,42],[206,58,34],[242,70,24]];
 c.beginPath();for(const [x,y,r] of puffs){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.rect(48,66,214,26);const g=c.createLinearGradient(0,10,0,95);g.addColorStop(0,fill[0]+'e0');g.addColorStop(.7,fill[1]+'90');g.addColorStop(1,fill[1]+'00');c.fillStyle=g;c.fill();
 c.strokeStyle=line;c.lineWidth=2;c.globalAlpha=.8;c.beginPath();c.arc(112,52,38,Math.PI*1.05,Math.PI*1.75);c.stroke();c.beginPath();c.arc(160,48,42,Math.PI*1.15,Math.PI*1.85);c.stroke();
 const curl=(x,y,r,d)=>{c.beginPath();for(let i=0;i<=40;i++){const u=i/40,a=d*u*TAU*1.15,rr=r*(1-u*.8);i?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.stroke();};curl(52,80,16,-1);curl(256,82,14,1);
 return scene.kdCloud[tone]=f;
}
function ribbon(c,pts,width,color,alpha){
 if(pts.length<2||alpha<=.01)return;const n=pts.length,L=[],R=[];for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,u=i/(n-1),w=width*Math.sin(Math.PI*Math.min(1,u*1.1))**.7;L.push([pts[i].x-dy/l*w,pts[i].y+dx/l*w]);R.push([pts[i].x+dy/l*w,pts[i].y-dx/l*w]);}
 c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(...L[0]);for(const p of L)c.lineTo(...p);for(let i=n-1;i>=0;i--)c.lineTo(...R[i]);c.closePath();c.fill();c.globalAlpha=alpha*.8;c.strokeStyle='#fff3d0';c.lineWidth=Math.max(1,width*.15);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.restore();
}
// Hỏa long: dải lửa mảnh có lưỡi lửa bập bùng (bề rộng dao động), hai lớp đỏ cam → vàng trắng.
function flame(c,pts,st,j){const flick=pts.map((p,i)=>({...p,x:p.x+Math.sin(st.t*14+i*1.3+j)*3,y:p.y+Math.cos(st.t*12+i*1.7)*3}));
 ribbon(c,flick,8+3*Math.sin(st.t*8+j),'#ff5a1e',st.fire*.55);ribbon(c,flick,4,FIRE2,st.fire*.8);
 for(let i=2;i<flick.length;i+=3){const p=flick[i],h=10+8*Math.sin(st.t*16+i+j);c.save();c.globalAlpha=st.fire*.6;c.fillStyle=FIRE2;c.beginPath();c.moveTo(p.x-4,p.y);c.quadraticCurveTo(p.x,p.y-h*1.4,p.x+4,p.y);c.fill();c.restore();}}
// ---------- lớp vẽ ----------
// Bầu trời đổi sắc phủ lên nền (ngoài camera): hoàng hôn hổ phách → nhật thực → bình minh vàng; mây kiếp; mây vàng.
export function drawKdSky(scene,c,st,H){
 c.save();
 if(st.dusk>.01){const g=c.createLinearGradient(0,0,0,H*.75);g.addColorStop(0,'#3a1d0a');g.addColorStop(.45,'#8a4a1a');g.addColorStop(.7,'#d48a3a');g.addColorStop(1,'#d48a3a00');c.globalAlpha=st.dusk*.55;c.fillStyle=g;c.fillRect(0,0,900,H*.75);}
 if(st.eclipse>.01){c.globalAlpha=st.eclipse*.55;c.fillStyle='#05060a';c.fillRect(0,0,900,H);}
 if(st.dawn>.01){const g=c.createRadialGradient(450,H*.42,40,450,H*.42,H*.7);g.addColorStop(0,'#fff3c8');g.addColorStop(.3,'#ffcf7a');g.addColorStop(.7,'#c66d2a66');g.addColorStop(1,'#c66d2a00');c.globalCompositeOperation='lighter';c.globalAlpha=st.dawn*.5;c.fillStyle=g;c.fillRect(0,0,900,H);c.globalCompositeOperation='source-over';}
 // Mây kiếp tím sẫm tụ ở đỉnh trời.
 if(st.storm>.01){const cs=cloudSprite(scene,'storm'),n=light(scene)?5:9;for(let i=0;i<n;i++){const x=40+((i*137+st.t*12*(i%2?1:-1))%820+820)%820,y=H*(.05+rnd(i)*.08),sz=1.1+rnd(i+3)*.8;c.globalAlpha=st.storm*(.55+rnd(i+7)*.3);cs&&c.drawImage(cs,x-150*sz,y-60*sz,300*sz,120*sz);}
  if(st.bolts.some(b=>b>0)){c.globalCompositeOperation='lighter';const fl=c.createLinearGradient(0,0,0,H*.45);fl.addColorStop(0,'#d9c4ff');fl.addColorStop(1,'#d9c4ff00');c.globalAlpha=Math.max(...st.bolts)*.4;c.fillStyle=fl;c.fillRect(0,0,900,H*.45);c.globalCompositeOperation='source-over';}}
 // Biển mây vàng bình minh sau khi phá.
 if(st.clouds>.01){const cg=cloudSprite(scene,'gold'),n=light(scene)?6:10;for(let i=0;i<n;i++){const x=(i/n)*1000-50+Math.sin(st.t*.4+i)*20,y=H*(.22+(i%3)*.05),sz=.9+rnd(i+11)*.7;c.globalAlpha=st.clouds*(.4+rnd(i)*.3);cg&&c.drawImage(cg,x-150*sz,y-60*sz,300*sz,120*sz);}}
 c.restore();
}
// Đan lô sau lưng: hiện dần, rung khi sét giáng, thu nhỏ khi nhập thể, vỡ khi phá.
export function drawKdCauldron(scene,c,st,s){
 const im=cauldronSurface(scene);if(!im)return;const cx=450,K=.6,rimY=s.hover+46,W=640*K,Hh=560*K;
 if(!st.after&&st.cauldron>.01){const shake=st.bolts.reduce((a,b)=>a+b,0)*6,sc=1-st.enter*.75,y0=mix(rimY-120*K,s.belly-60,st.enter);
  c.save();c.globalAlpha=st.cauldron*(.8-st.enter*.35);c.translate(cx+Math.sin(st.t*70)*shake,y0);c.scale(sc,sc);c.drawImage(im,-W/2,0,W,Hh);c.restore();
  // Lửa trong miệng lò bập bùng.
  const fire=glowSprite(FIRE),fy=y0+120*K*sc;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light(scene)?4:7);i++){const x=cx+(i-3)*26*sc+Math.sin(st.t*9+i)*6,h=(30+18*Math.sin(st.t*11+i*1.7))*sc;blit(c,fire,x,fy-h*.4,h,st.cauldron*.75*(1-st.enter*.5));}c.restore();
 }
 if(st.after&&st.shatter<1){// Vỡ: mười mảnh hình quạt bay ra, xoay, mờ dần.
  const u=st.shatter,n=light(scene)?6:10,y0=s.belly-60,sc=.25;c.save();for(let i=0;i<n;i++){const a0=i*TAU/n,a1=a0+TAU/n,dir=a0+TAU/n/2;c.save();c.globalAlpha=(1-u)*.85;
   c.translate(cx+Math.cos(dir)*u*(420+rnd(i)*160),y0+Math.sin(dir)*u*(300+rnd(i+3)*120)+u*u*180);c.rotate(u*(rnd(i+5)-.5)*5);c.scale(sc+u*.5,sc+u*.5);
   c.beginPath();c.moveTo(0,250);c.arc(0,250,520,a0,a1);c.closePath();c.clip();c.drawImage(im,-W/2,0,W,Hh);c.restore();}c.restore();}
}
// Ba hỏa long xoắn quanh đan lô + tàn lửa bay lên.
export function drawKdFire(scene,c,st,s,front){
 if(st.fire<=.01)return;const cx=450,cy=s.hover+60,dir=1,n=light(scene)?2:3;c.save();c.globalCompositeOperation='lighter';
 for(let j=0;j<n;j++){const pts=[];let anyFront=false;for(let q=0;q<=28;q++){const u=q/28,a=st.t*1.9*dir+j*TAU/n+u*4.0,r=250-u*120,y=cy+150-u*300;const z=Math.sin(a);if(z>0)anyFront=true;pts.push({x:cx+Math.cos(a)*r,y:y+z*40,z});}
  const seg=pts.filter(p=>front?p.z>=0:p.z<0);if(seg.length<3)continue;
  // tách thành các đoạn liên tục cùng phía
  let run=[];for(const p of pts){if((p.z>=0)===front)run.push(p);else{if(run.length>3)flame(c,run,st,j);run=[];}}if(run.length>3)flame(c,run,st,j);
  const head=pts[pts.length-1];if(front)blit(c,glowSprite(FIRE2),head.x,head.y,30,st.fire*.9);}
 if(front){const e=glowSprite(FIRE2);for(let i=0;i<(light(scene)?10:22);i++){const u=(st.t*.35+rnd(i))%1,x=cx+(rnd(i+2)-.5)*560+Math.sin(st.t*2+i)*14,y=s.feet-u*700;blit(c,e,x,y,4+rnd(i+4)*4,st.fire*(1-u)*.9);}}
 c.restore();
}
// Vành cửu chuyển quanh kim đan: chín nấc, mỗi giọt nhập sáng một nấc.
export function drawKdTurns(scene,c,st,s){
 if(st.ring<=.01||!s.core||s.core.alpha<=0)return;const {x,y,r}=s.core,R=r+30,rot=st.t*.8;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<9;i++){const a0=rot+i*TAU/9+.06,a1=a0+TAU/9-.12,lit=i<st.turns;c.strokeStyle=lit?GOLD2:'#8a6a3a';c.globalAlpha=st.ring*(lit?.95:.35);c.lineWidth=lit?7:3;c.beginPath();c.ellipse(x,y,R,R*.92,0,a0,a1);c.stroke();
  if(lit){const m=(a0+a1)/2;blit(c,glowSprite(GOLD),x+Math.cos(m)*R,y+Math.sin(m)*R*.92,12,st.ring*.9);}}
 c.restore();
}
// Ba đạo sét kiếp từ mây xuống kim đan (đường gấp khúc có nhánh, lõi trắng, viền vàng–tím).
export function drawKdBolts(scene,c,st,s,H){
 if(!s.core)return;st.bolts.forEach((b,i)=>{if(b<=0)return;const x0=200+i*250,y0=H*.1,x1=s.core.x,y1=s.core.y-s.core.r;const pts=[[x0,y0]];const n=12;for(let q=1;q<n;q++){const u=q/n;pts.push([mix(x0,x1,u)+(rnd(i*31+q)-.5)*70*(1-u),mix(y0,y1,u)]);}pts.push([x1,y1]);
  c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';for(const [w,col,a] of [[16,VIOLET,.25],[6,GOLD,.8],[2,'#ffffff',1]]){c.globalAlpha=b*a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();pts.forEach((p,k)=>k?c.lineTo(...p):c.moveTo(...p));c.stroke();}
  // nhánh phụ
  c.lineWidth=2;c.strokeStyle=VIOLET;c.globalAlpha=b*.7;for(let k=2;k<n-2;k+=3){const p=pts[k];c.beginPath();c.moveTo(...p);c.lineTo(p[0]+(rnd(k+i)-.5)*120,p[1]+40+rnd(k)*50);c.stroke();}
  blit(c,glowSprite(GOLD),x1,y1,90,b*.9);c.restore();});
}
// Tia mặt trời quét cả bầu trời khi phá.
export function drawKdRays(scene,c,st,s,H){
 if(st.rays<=.02)return;const cx=450,cy=s.belly-60,n=light(scene)?12:24;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const a=i*TAU/n+st.t*.15,len=H*(.6+rnd(i)*.5),w=(10+rnd(i+3)*18);const g=c.createLinearGradient(cx,cy,cx+Math.cos(a)*len,cy+Math.sin(a)*len);g.addColorStop(0,'#fff6dc');g.addColorStop(.4,GOLD+'88');g.addColorStop(1,GOLD+'00');c.fillStyle=g;c.globalAlpha=st.rays*.55;
  c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a-w/len)*len,cy+Math.sin(a-w/len)*len);c.lineTo(cx+Math.cos(a+w/len)*len,cy+Math.sin(a+w/len)*len);c.closePath();c.fill();}
 c.restore();
}
