import {drawScreenPulse} from './cinematic-feedback.js';
// Diệt Thế Chí Tôn v1 — Diệt Thế Quy Hư (09/11/2026). 50 s; nổ 44,0; đổi skin 44,3.
// Cơ chế riêng (không lặp Ma Thần/Thiên Ma: không trăng, xích, mặt quỷ, khe trời, vạn nhãn, luân hoàn, miện kiếm):
// điểm đen hiện giữa vũ trụ → hố đen thành hình 4 nhịp, đĩa bồi tụ quay, vòng thấu kính →
// 5 hành tinh trên quỹ đạo bị xé vụn lần lượt, mảnh xoáy vào hố → hư hỏa trắng đen bén quanh chân, 8 cột hư hỏa phun →
// vết nứt không gian thành thanh kiếm cạnh người, chém 3 nhát xé đôi màn hình →
// 16 mảnh giáp bạch kim ráp thành đôi cánh vỡ sau lưng, dang cánh → 10 mảnh hành tinh thành vành miện trên đầu, bén hư hỏa →
// hố đen giáng xuống, thu nhỏ, nhập đan điền → 3 lượt quét xoá thế giới thành hư vô → tối, 2 nhịp tim →
// NỔ vụ nổ lớn: sao toả ra từ thân, tinh vân mới nở → hiện thân: cánh vỡ, vành hành tinh, kiếm nứt không gian, vũ trụ tái sinh.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
export const DT=Object.freeze({duration:50,dot:.2,hole:2.2,lens:7.0,planets:8.0,swallowed:15.0,fire:15.6,crack:19.8,sword:21.0,wings:26.0,spread:30.4,crown:31.4,ignite:33.8,descend:35.0,absorbed:38.6,erase:39.4,dark:43.0,impact:44.0,reveal:44.3,fade:48.4});
export const DT_PULSES=Object.freeze([2.2,3.4,4.6,5.8]);
export const DT_TEARS=Object.freeze(Array.from({length:5},(_,i)=>9.4+i*1.2));
export const DT_PILLARS=Object.freeze(Array.from({length:8},(_,i)=>16.2+i*.4));
export const DT_SLASHES=Object.freeze([22.0,23.4,24.8]);
export const DT_PLATES=Object.freeze(Array.from({length:16},(_,i)=>26.0+i*.25));
export const DT_FRAGS=Object.freeze(Array.from({length:10},(_,i)=>31.4+i*.2));
export const DT_SWEEPS=Object.freeze([39.4,40.6,41.8]);
export const DT_BEATS=Object.freeze([43.3,43.7]);
export const DIET_THE_DURATION=50000,DIET_THE_REVEAL=DT.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len=.5)=>age<0||age>len?0:Math.sin(age/len*Math.PI);
const PALETTE={main:'#dfe6ff',main2:'#5a6a9a',soft:'#ffffff',gold:'#ffc46a'};
const PLAT='#dfe6ff',PLAT2='#9aa8d0',VOID='#b9a8ff',EMBER='#ffc46a';
const PLANET_COLS=[['#d0864a','#6a3418'],['#4ab0d0','#143a5a'],['#9a6ad0','#2a144a'],['#7ad08a','#1a4a2a'],['#d04a5a','#4a1420']];
export function dietTheState(k,H=1600,motion=true){
 const t=clamp(k)*DT.duration,feet=H*.74,desc=ease((t-DT.descend)/(DT.absorbed-DT.descend));
 const erase=DT_SWEEPS.reduce((n,at)=>n+ease((t-at)/.7),0)/3;
 return {k:clamp(k),t,H,motion,clock:motion?t:0,feet,belly:feet-145,head:feet-338,revealed:t>=DT.reveal,
  stars:1-ease((t-DT.dot)/2)*.55,hole:DT_PULSES.reduce((n,at)=>n+ease((t-at)/.6),0)/4,desc,
  holeX:450,holeY:mix(H*.22,feet-145,desc*desc),holeScale:mix(1,.12,desc),lens:ease((t-DT.lens)/.8)*(1-desc),
  fire:ease((t-DT.fire)/.6)*(1-ease((t-DT.descend)/2)),erase:erase*(1-ease((t-DT.impact)/.2)),
  dark:ease((t-DT.dark)/.5)*(1-ease((t-DT.impact)/.12)),blast:t>=DT.impact?1-ease((t-DT.impact)/3.4):0,bang:pulse(t-DT.impact,1),
  after:ease((t-DT.reveal)/1.3),fade:1-ease((t-DT.fade)/1.4)};
}
export function dietTheHits(){return [[DT.dot,1],...DT_PULSES.map((a,i)=>[a,.9+i*.15]),[DT.lens,1.2],[DT.planets,.9],...DT_TEARS.map((a,i)=>[a,1.1+i*.1]),[DT.swallowed,1.3],[DT.fire,1.1],...DT_PILLARS.map((a,i)=>[a,.7+i*.04]),[DT.sword,1.4],...DT_SLASHES.map((a,i)=>[a,1.8+i*.15]),...DT_PLATES.map(a=>[a+.3,.4]),[DT.spread,1.8],...DT_FRAGS.map(a=>[a+.3,.35]),[DT.ignite,1.4],...Array.from({length:6},(_,i)=>[DT.descend+i*.55,.5+i*.1]),[DT.absorbed,2],...DT_SWEEPS.map((a,i)=>[a,1.2+i*.2]),...DT_BEATS.map(a=>[a,.6]),[DT.impact,2.8]];}
function hitPower(t){let p=0;for(const [a,f] of dietTheHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function assets(scene,H){
 const cache=scene.dietTheAssets;if(cache?.H===H)return cache;
 const space=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02030a');g.addColorStop(.5,'#080a1c');g.addColorStop(1,'#020208');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<5;i++){const x=rnd(i+3)*900,y=rnd(i+9)*H*.7,r=220+rnd(i)*200,n=c.createRadialGradient(x,y,0,x,y,r);n.addColorStop(0,['#3a2a6a30','#1a3a6a30','#4a1a3a28'][i%3]);n.addColorStop(1,'#00000000');c.fillStyle=n;c.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<360;i++){const x=rnd(i)*900,y=rnd(i+500)*H,r=rnd(i+900)*1.6+.3;c.globalAlpha=.3+rnd(i+70)*.7;c.fillStyle=i%7?'#e8ecff':'#ffd8a0';c.fillRect(x,y,r,r);}});
 // tinh vân tái sinh (sau nổ)
 const reborn=surface(450,H/2,c=>{c.scale(.5,.5);for(let i=0;i<7;i++){const x=450+(rnd(i+31)-.5)*800,y=H*(.1+rnd(i+37)*.6),r=260+rnd(i+41)*240,n=c.createRadialGradient(x,y,0,x,y,r);n.addColorStop(0,['#6a4ad080','#3a8ad070','#d06a9a60','#ffc46a50'][i%4]);n.addColorStop(1,'#00000000');c.fillStyle=n;c.fillRect(x-r,y-r,r*2,r*2);}});
 // nền đá trôi bạch kim đen dưới chân
 const rock=surface(900,260,c=>{c.translate(450,70);c.beginPath();c.moveTo(-380,0);c.bezierCurveTo(-300,-30,300,-30,380,0);c.lineTo(250,90);c.lineTo(120,170);c.lineTo(0,230);c.lineTo(-140,160);c.lineTo(-260,90);c.closePath();const g=c.createLinearGradient(0,-30,0,230);g.addColorStop(0,'#3a4058');g.addColorStop(.25,'#14161f');g.addColorStop(1,'#05060a');c.fillStyle=g;c.fill();c.strokeStyle='#9aa8d0';c.lineWidth=2;c.stroke();
  c.strokeStyle='#6a78a0';c.lineWidth=1.2;c.globalAlpha=.6;for(let i=0;i<10;i++){c.beginPath();let x=(rnd(i)-.5)*600,y=0;c.moveTo(x,y);for(let j=0;j<5;j++){x+=(rnd(i*7+j)-.5)*80;y+=20+rnd(i+j)*25;c.lineTo(x,y);}c.stroke();}});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.18,'#e8ecffc0');g.addColorStop(.5,'#9aa8ff40');g.addColorStop(1,'#9aa8ff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const warm=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.2,'#ffe0b0c0');g.addColorStop(.55,'#ffa04a40');g.addColorStop(1,'#ffa04a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#00000000');g.addColorStop(.55,'#00000000');g.addColorStop(1,'#000000ea');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const out={H,space,reborn,rock,glow,warm,vignette};scene.dietTheAssets=out;return out;
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,0,0,TAU);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:23}),to:structuredClone(e.visualTo||{...live,realm:24})};snapshots.set(e,pair);return pair;}
// Hố đen: đĩa bồi tụ nghiêng (nửa sau vẽ trước lõi, nửa trước vẽ sau), lõi đen, vòng photon; nhịp đập to dần.
function holeRadius(s,T){return (14+s.hole*96)*s.holeScale*(1+DT_PULSES.reduce((m,at)=>Math.max(m,pulse(T-at,.4)),0)*.12);}
function drawDisk(c,s,T,half,r){const x=s.holeX,y=s.holeY,spin=s.clock*1.8;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<34;i++){const rr=r*(1.5+i*.06),w=1.5+rnd(i)*3,a0=spin*(1.4-i*.02)+rnd(i+5)*TAU,len=1.2+rnd(i+9)*2;c.globalAlpha=(.25+rnd(i+13)*.5)*clamp(s.hole*1.4);c.strokeStyle=i%4===0?'#ffffff':i%3?EMBER:'#ff8a4a';c.lineWidth=w;c.beginPath();
  c.ellipse(x,y,rr,rr*.26,-.18,half?0:Math.PI,half?Math.PI:TAU);c.stroke();
  c.globalAlpha*=1.3;c.lineWidth=w*1.6;c.beginPath();c.ellipse(x,y,rr,rr*.26,-.18,a0,a0+len*.3);c.stroke();}
 c.restore();}
function drawHole(c,a,s,T){if(T<DT.dot||s.desc>=1&&T<DT.reveal)return;const r=holeRadius(s,T),x=s.holeX,y=s.holeY;
 if(s.hole>0){halo(c,a.warm,x,y,r*7,r*3,.35*s.hole*s.holeScale+.05);drawDisk(c,s,T,false,r);}
 // vòng thấu kính (vòng sáng bao quanh lõi)
 if(s.lens>0){ring(c,x,y,r*1.35,'#ffe8c0',3+s.lens*3,s.lens*.9);ring(c,x,y,r*1.6,PLAT,1.5,s.lens*.5);}
 c.save();c.fillStyle='#000';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();ring(c,x,y,r+1.5,'#ffd8a0',2,clamp(s.hole*2));
 if(s.hole>0)drawDisk(c,s,T,true,r);
 DT_PULSES.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.6){ring(c,x,y,r+age*(500+i*120),i%2?EMBER:PLAT,8*(1-age/.6)+1,1-age/.6,(r+age*(500+i*120))*.4);}});
 {const age=T-DT.dot;if(age>=0&&age<.7){ring(c,x,y,10+age*900,PLAT,6*(1-age/.7)+1,1-age/.7);drawScreenPulse(c,s.H,s.reduceFlash,'#ffffff',(1-age/.7)*.12);}}
 {const age=T-DT.lens;if(age>=0&&age<.6)ring(c,x,y,r*1.35+age*500,'#ffe8c0',8*(1-age/.6)+1,1-age/.6);}}
// 5 hành tinh trên quỹ đạo quanh hố; mỗi cái bị kéo giãn rồi vỡ thành 14 mảnh xoáy vào hố.
function planetOrbit(i,s,T){const ang=i/5*TAU+(T-DT.planets)*(.22+i*.03),R=210+i*34;return {x:s.holeX+Math.cos(ang)*R,y:s.holeY+Math.sin(ang)*R*.42,ang};}
function drawPlanets(c,a,s,T){if(T<DT.planets||T>DT.swallowed+.8)return;const appear=ease((T-DT.planets)/.8);for(let i=0;i<5;i++){const tear=DT_TEARS[i],p=planetOrbit(i,s,Math.min(T,tear)),R=26+i*5,[c1,c2]=PLANET_COLS[i];
  if(T<tear){const stretch=1+ease((T-tear+.6)/.6)*.6,toHole=Math.atan2(s.holeY-p.y,s.holeX-p.x);c.save();c.globalAlpha=appear;c.translate(p.x,p.y);c.rotate(toHole);c.scale(stretch,1/Math.sqrt(stretch));const g=c.createRadialGradient(-R*.3,-R*.3,2,0,0,R);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.strokeStyle='#ffffff60';c.lineWidth=1.5;c.stroke();c.restore();
   if(i===1||i===3)ring(c,p.x,p.y,R*1.7,c1,2,appear*.6,R*.45);}
  else{const age=T-tear;if(age<.5){halo(c,a.warm,p.x,p.y,320,320,1-age/.5);ring(c,p.x,p.y,R+age*500,c1,8*(1-age/.5)+1,1-age/.5);}
   for(let j=0;j<14;j++){const u=clamp((age-rnd(i*31+j)*.3)/1.4);if(u>=1)continue;const a0=Math.atan2(p.y-s.holeY,p.x-s.holeX)+u*2.6+(rnd(j+i)-.5)*.6,d=mix(Math.hypot(p.x-s.holeX,p.y-s.holeY)+(rnd(j)-.3)*60,8,u*u),x=s.holeX+Math.cos(a0)*d,y=s.holeY+Math.sin(a0)*d*.42,sz=(4+rnd(j+5)*8)*(1-u*.6);
    c.save();c.globalAlpha=1-u*.5;c.fillStyle=j%3?c1:c2;c.translate(x,y);c.rotate(u*9+j);c.fillRect(-sz/2,-sz/2,sz,sz*.7);c.restore();if(j%3===0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-u)*.6;c.strokeStyle=EMBER;c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a0+1.57)*16,y-Math.sin(a0+1.57)*7);c.stroke();c.restore();}}}}
 {const age=T-DT.swallowed;if(age>=0&&age<.6){halo(c,a.warm,s.holeX,s.holeY,500,300,1-age/.6);drawScreenPulse(c,s.H,s.reduceFlash,'#ffd8a0',(1-age/.6)*.1);}}}
// Hư hỏa: lưỡi lửa lõi đen, viền trắng tím; vòng quanh chân và 8 cột phun.
function flame(c,x,y,h,w,seed,T,al){const sway=Math.sin(T*6+seed)*w*.3;c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x-w*.8,y-h*.4,x+sway-w*.3,y-h*.7,x+sway,y-h);c.bezierCurveTo(x+sway+w*.3,y-h*.6,x+w*.8,y-h*.35,x+w,y);c.closePath();c.save();c.globalAlpha=al*.8;c.fillStyle='#0a0614';c.fill();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(x,y,x+sway,y-h);g.addColorStop(0,seed%2?'#b9a8ffb0':'#dfe6ffa0');g.addColorStop(.55,'#6a4ad040');g.addColorStop(1,'#6a4ad000');c.fillStyle=g;c.globalAlpha=al;c.fill();c.strokeStyle=seed%2?'#b9a8ff90':'#dfe6ff80';c.lineWidth=1.4;c.stroke();c.restore();}
function drawVoidFire(c,a,s,T,front){if(s.fire<=0)return;const n=front?11:15;for(let i=0;i<n;i++){const ang=(i+(front?.5:0))/n*Math.PI+(front?0:Math.PI),x=450+Math.cos(ang)*230,y=s.feet+10+Math.sin(ang)*44,h=(70+rnd(i+(front?50:0))*70)*(.75+.25*Math.sin(T*5+i*1.7))*s.fire;flame(c,x,y,h,24,i+(front?20:0),T,s.fire*(front?.8:1));}
 if(!front){halo(c,a.glow,450,s.feet+10,620,140,s.fire*.35);DT_PILLARS.forEach((at,i)=>{const age=T-at;if(age<0||age>1.6)return;const side=i%2?1:-1,x=450+side*(260+Math.floor(i/2)*45),u=ease(age/.25),f=1-ease((age-.6)/1),h=(s.H*.5)*u;c.save();c.globalAlpha=f;flame(c,x,s.feet+10,h,46+u*16,i,T,f);c.restore();halo(c,a.glow,x,s.feet-h*.4,180,h*1.1,f*.6);if(age<.35)ring(c,x,s.feet+10,20+age*500,PLAT,6*(1-age/.35)+1,1-age/.35,(20+age*500)*.3);});}
 {const age=T-DT.fire;if(front&&age>=0&&age<.6)ring(c,450,s.feet+10,230+age*300,VOID,8*(1-age/.6)+1,1-age/.6,(230+age*300)*.19);}}
// Kiếm nứt không gian: đường nứt gãy khúc, lõi đen viền sáng, đứng cạnh người; mỗi nhát chém xé màn theo đường chéo.
const SWORD_PTS=Array.from({length:14},(_,i)=>({u:i/13,j:(i%2?1:-1)*(4+rnd(i+300)*7)}));
function swordAt(s,dir){return {x:450+dir*175,y0:s.feet-30,y1:s.head-250};}
function drawSword(c,a,s,T,dir){const final=s.revealed;const form=final?s.after*s.fade:clamp((T-DT.crack)/(DT.sword-DT.crack))*(1-ease((T-DT.descend)/1.2));if(form<=0)return;const sw=swordAt(s,dir),bob=Math.sin(s.clock*1.6)*6;
 const swing=DT_SLASHES.reduce((m,at)=>Math.max(m,pulse(T-at+.12,.36)),0)*(final?0:1);
 c.save();c.translate(sw.x,(sw.y0+sw.y1)/2+bob);c.rotate(dir*swing*.9);c.translate(-sw.x,-(sw.y0+sw.y1)/2);
 const reach=final?1:form,pts=SWORD_PTS.filter(p=>p.u<=reach);if(pts.length<2){c.restore();return;}
 const P=p=>[sw.x+p.j,mix(sw.y0,sw.y1,p.u)];
 c.globalCompositeOperation='lighter';for(const [w,col,al] of [[22,'#6a78ff',.25],[9,PLAT,.7],[3,'#ffffff',1]]){c.globalAlpha=al*(final?s.after*s.fade:1);c.strokeStyle=col;c.lineWidth=w;c.lineJoin='miter';c.beginPath();pts.forEach((p,i)=>{const [x,y]=P(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}
 c.globalCompositeOperation='source-over';c.globalAlpha=final?s.after*s.fade:1;c.strokeStyle='#000';c.lineWidth=2;c.beginPath();pts.forEach((p,i)=>{const [x,y]=P(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();
 // chuôi: vết nứt ngang
 if(reach>=.98){const [hx,hy]=P(SWORD_PTS[2]);c.globalCompositeOperation='lighter';c.strokeStyle=PLAT;c.lineWidth=3;c.beginPath();c.moveTo(hx-30,hy+4);c.lineTo(hx-10,hy-3);c.lineTo(hx+12,hy+5);c.lineTo(hx+30,hy-2);c.stroke();}
 c.restore();halo(c,a.glow,sw.x,(sw.y0+sw.y1)/2,120,560,.35*form);
 {const age=T-DT.sword;if(!final&&age>=0&&age<.6){halo(c,a.glow,sw.x,sw.y1,300,300,1-age/.6);ring(c,sw.x,sw.y1,20+age*400,PLAT,6*(1-age/.6)+1,1-age/.6);}}}
function slashLine(i,H,dir){const k=[[-1,.08,1,.62],[1,.12,-1,.7],[-1,.5,1,.18]][i];return {x0:450+k[0]*dir*650,y0:H*k[1],x1:450+k[2]*dir*650,y1:H*k[3]};}
// Nhát chém xé đôi màn hình: vẽ ngoài camera — tách hai nửa ảnh (bản chụp vùng) là tốn; thay bằng khe đen + viền sáng + tia.
function drawSlashes(c,a,s,T,dir){DT_SLASHES.forEach((at,i)=>{const age=T-at;if(age<0||age>1.1)return;const L=slashLine(i,s.H,dir),u=ease(age/.12),gap=pulse(age,1.1)*26,f=1-ease((age-.5)/.6),nx=-(L.y1-L.y0),ny=L.x1-L.x0,nl=Math.hypot(nx,ny),ox=nx/nl,oy=ny/nl,x1=mix(L.x0,L.x1,u),y1=mix(L.y0,L.y1,u);
  c.save();c.globalAlpha=f;c.fillStyle='#000';c.beginPath();c.moveTo(L.x0+ox*gap,L.y0+oy*gap);c.lineTo(x1+ox*gap,y1+oy*gap);c.lineTo(x1-ox*gap,y1-oy*gap);c.lineTo(L.x0-ox*gap,L.y0-oy*gap);c.closePath();c.fill();
  c.globalCompositeOperation='lighter';for(const side of [1,-1]){c.strokeStyle=side>0?PLAT:VOID;c.lineWidth=3;c.beginPath();c.moveTo(L.x0+ox*gap*side,L.y0+oy*gap*side);c.lineTo(x1+ox*gap*side,y1+oy*gap*side);c.stroke();}
  c.globalAlpha=f*(1-ease(age/.3));c.strokeStyle='#ffffff';c.lineWidth=10;c.beginPath();c.moveTo(L.x0,L.y0);c.lineTo(x1,y1);c.stroke();
  for(let j=0;j<16;j++){const v=rnd(i*40+j),x=mix(L.x0,L.x1,v),y=mix(L.y0,L.y1,v),d=age*(80+rnd(j+i)*200)*(j%2?1:-1);c.globalAlpha=f*.9;c.fillStyle=j%3?PLAT:'#ffffff';c.fillRect(x+ox*d,y+oy*d,3,3);}c.restore();
  if(age<.25)drawScreenPulse(c,s.H,s.reduceFlash,'#e8ecff',(1-age/.25)*.22);});}
// Cánh vỡ: 16 mảnh giáp bạch kim, 8 mỗi bên, xoè từ bả vai.
function wingSlot(i,s,spread,T){const side=i%2?1:-1,k=Math.floor(i/2),ang=mix(-.25,.95,k/7)*spread+(1-spread)*.1,len=70+k*30,flap=Math.sin(s.clock*1.4)*.05*spread,sx=450+side*40,sy=s.head+110;return {x:sx+side*Math.cos(-ang-flap)*len*1.6,y:sy+Math.sin(-ang-flap)*len*1.3-(spread*30),rot:side*(Math.PI/2-ang)*.9,side,k};}
function plate(c,k,al){const w=20+k*3,h=60+k*8;c.save();c.globalAlpha=al;c.beginPath();c.moveTo(0,-h*.55);c.lineTo(w*.55,-h*.2);c.lineTo(w*.3,h*.5);c.lineTo(-w*.4,h*.4);c.lineTo(-w*.5,-h*.25);c.closePath();const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#5a6480');g.addColorStop(.5,'#e8ecff');g.addColorStop(1,'#3a4058');c.fillStyle=g;c.fill();c.strokeStyle='#1a1c28';c.lineWidth=1.5;c.stroke();c.strokeStyle='#05060a';c.beginPath();c.moveTo(-w*.1,-h*.4);c.lineTo(w*.1,0);c.lineTo(-w*.05,h*.3);c.stroke();c.globalCompositeOperation='lighter';c.strokeStyle=VOID;c.lineWidth=2;c.globalAlpha=al*.8;c.beginPath();c.moveTo(0,-h*.55);c.lineTo(w*.55,-h*.2);c.stroke();c.restore();}
function drawWings(c,a,s,T){const final=s.revealed;if(!final&&(T<DT.wings||T>DT.absorbed))return;const spread=final?ease(s.after*1.2):ease((T-DT.spread)/.5),fold=final?0:ease((T-DT.descend)/2.4),al=final?s.after*s.fade:1-fold*.8;
 for(let i=0;i<16;i++){const at=DT_PLATES[i];if(!final&&T<at)continue;const slot=wingSlot(i,s,Math.max(0,spread-fold),T),u=final?1:back(clamp((T-at)/.3));const sx=450+slot.side*(500+rnd(i)*200),sy=s.H*(.2+rnd(i+7)*.6);let x=mix(sx,slot.x,u),y=mix(sy,slot.y,u);if(fold>0){x=mix(x,450,fold*fold);y=mix(y,s.belly,fold*fold);}
  c.save();c.translate(x,y);c.rotate(slot.rot+(1-u)*3);c.scale(1-fold*.7,1-fold*.7);plate(c,slot.k,al);c.restore();if(!final){const age=T-at-.3;if(age>=0&&age<.25)halo(c,a.glow,x,y,110,110,1-age/.25);}}
 {const age=T-DT.spread;if(!final&&age>=0&&age<.7){for(const side of [-1,1])halo(c,a.glow,450+side*230,s.head+40,460,460,(1-age/.7)*.8);ring(c,450,s.head+80,100+age*900,PLAT,10*(1-age/.7)+1,1-age/.7,(100+age*900)*.5);}}}
// Vành mảnh hành tinh trên đầu, bén hư hỏa.
function drawCrown(c,a,s,T){const final=s.revealed;if(!final&&(T<DT.crown||T>DT.absorbed))return;const cx=450,cy=s.head-100,R=135,spin=s.clock*.7,fold=final?0:ease((T-DT.descend-.6)/2),ig=final?1:ease((T-DT.ignite)/.4),al=final?s.after*s.fade:1-fold*.7;
 const pts=[];for(let i=0;i<10;i++){const at=DT_FRAGS[i];if(!final&&T<at)continue;const ang=i/10*TAU+spin,u=final?1:back(clamp((T-at)/.3)),tx=cx+Math.cos(ang)*R,ty=cy+Math.sin(ang)*R*.28,sx=s.holeX+(rnd(i)-.5)*400,sy=s.H*.1;let x=mix(sx,tx,u),y=mix(sy,ty,u);if(fold>0){x=mix(x,450,fold*fold);y=mix(y,s.belly,fold*fold);}pts.push({x,y,i,ang,front:Math.sin(ang)>0});}
 for(const pass of [false,true])for(const p of pts){if(p.front!==pass)continue;const [c1,c2]=PLANET_COLS[p.i%5],sz=(17+rnd(p.i)*11)*(1-fold*.6);c.save();c.globalAlpha=al;c.translate(p.x,p.y);c.rotate(p.ang*2+p.i);c.beginPath();c.moveTo(-sz,-sz*.3);c.lineTo(-sz*.2,-sz);c.lineTo(sz,-sz*.2);c.lineTo(sz*.4,sz*.8);c.lineTo(-sz*.7,sz*.6);c.closePath();c.fillStyle=c2;c.fill();c.strokeStyle=c1;c.lineWidth=2;c.stroke();c.restore();
  if(ig>0)flame(c,p.x,p.y-sz*.2,(22+rnd(p.i+3)*16)*ig,7,p.i,T,al*ig);}
 if(pts.length&&ig>0)ring(c,cx,cy,R,VOID,2,al*ig*.6,R*.28);
 {const age=T-DT.ignite;if(!final&&age>=0&&age<.6){halo(c,a.glow,cx,cy,400,200,1-age/.6);ring(c,cx,cy,R+age*500,PLAT,8*(1-age/.6)+1,1-age/.6,(R+age*500)*.3);}}}
// 3 lượt quét xoá thế giới: hai vạch sáng từ mép tiến vào, phía sau là hư vô.
function drawErase(c,s,T,H){if(s.erase<=0)return;c.save();DT_SWEEPS.forEach((at,i)=>{const u=ease((T-at)/.7);if(u<=0)return;const edge=mix(0,150*(i+1),u);c.globalAlpha=s.erase>0?1:0;c.fillStyle='#000';c.fillRect(0,0,edge,H);c.fillRect(900-edge,0,edge,H);
  if(u<1){c.globalCompositeOperation='lighter';c.fillStyle='#e8ecff';c.globalAlpha=1-u*.5;c.fillRect(edge-3,0,6,H);c.fillRect(900-edge-3,0,6,H);c.globalAlpha=(1-u)*.25;c.fillRect(edge-30,0,60,H);c.fillRect(900-edge-30,0,60,H);c.globalCompositeOperation='source-over';}});
 // tầng trên/dưới cũng tan vào hư vô
 c.globalAlpha=s.erase*.7;c.fillStyle='#000';c.fillRect(0,0,900,H*.3*s.erase);c.fillRect(0,H-(H*.18*s.erase),900,H*.18*s.erase);c.restore();}
// Vụ nổ lớn: sao vạch toả ra từ thân.
function drawBigBang(c,a,s,T,light){const age=T-DT.impact;if(age<0||age>3.2)return;const f=1-age/3.2,n=light?60:140;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const ang=rnd(i+70)*TAU,sp=300+rnd(i)*900,d=age*sp,x=450+Math.cos(ang)*d,y=s.belly+Math.sin(ang)*d,tail=Math.min(d,40+sp*.08);c.globalAlpha=f;c.strokeStyle=i%5===0?EMBER:i%3?PLAT:'#ffffff';c.lineWidth=1.5+rnd(i+3)*2;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(ang)*tail,y-Math.sin(ang)*tail);c.stroke();}c.restore();}
export function drawDietTheAwakening(scene,c,e,t,H){
 const s=dietTheState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,DT.impact/DT.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',T=s.t,dir=v.flip?-1:1;
 s.reduceFlash=scene.reduceFlash;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 c.fillStyle='#020208';c.fillRect(0,0,900,H);
 if(a.space){c.save();c.globalAlpha=s.revealed?1:s.stars;c.drawImage(a.space,0,0,900,H);c.restore();}
 if(a.reborn&&s.after>0){c.save();c.globalAlpha=s.after*s.fade;c.drawImage(a.reborn,0,0,900,H);c.restore();}
 drawScreenPulse(c,H,scene.reduceFlash,'#9aa8ff',hit*.07);
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false?hit*14+s.bang*16:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 // hố đen + hành tinh (sau lưng)
 drawHole(c,a,s,T);drawPlanets(c,a,s,T);
 // đá trôi dưới chân
 if(a.rock){c.save();c.globalAlpha=1-s.erase*.4;c.drawImage(a.rock,0,s.feet-70,900,260);c.restore();}
 drawVoidFire(c,a,s,T,false);
 drawWings(c,a,s,T);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 if(s.blast>0){for(let i=0;i<9;i++){const u=clamp((T-DT.impact-i*.08)/1.7);if(u<=0||u>=1)continue;ring(c,450,s.belly,60+ease(u)*1200,i%3===0?EMBER:i%2?PLAT:VOID,16*(1-u)+2,(1-u)*.9,(60+ease(u)*1200)*.55);}halo(c,a.glow,450,s.belly,1400,1400,s.bang*.85);}
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawVoidFire(c,a,s,T,true);
 drawSword(c,a,s,T,dir);
 drawCrown(c,a,s,T);
 // hố đen nhập thân
 {const age=T-DT.absorbed;if(age>=0&&age<.7){halo(c,a.glow,450,s.belly,700,700,1-age/.7);ring(c,450,s.belly,20+age*900,PLAT,12*(1-age/.7)+1,1-age/.7);}}
 if(T>=DT.absorbed&&T<DT.impact){c.save();c.fillStyle='#000';c.beginPath();c.arc(450,s.belly,12+Math.sin(T*9)*2,0,TAU);c.fill();c.restore();ring(c,450,s.belly,16,EMBER,2.5,.9);}
 // lõi hố đen nhỏ ở bụng sau hiện thân (không chạm mặt)
 if(s.revealed){const k=s.after*s.fade;c.save();c.globalAlpha=k;c.fillStyle='#000';c.beginPath();c.arc(450,s.belly,10,0,TAU);c.fill();c.restore();ring(c,450,s.belly,15,EMBER,2,k*.9,5);ring(c,450,s.belly,22,PLAT,1.2,k*.6,7);}
 drawQiCompression(c,kq,origin);
 drawBigBang(c,a,s,T,light);
 c.restore();
 drawSlashes(c,a,s,T,dir);
 drawErase(c,s,T,H);
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.9;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...DT_BEATS.map(at=>pulse(T-at,.3)));ring(c,450,s.belly,14+beat*30,EMBER,2+beat*3,s.dark*(.5+beat*.5));}
 drawScreenPulse(c,H,scene.reduceFlash,'#f0f2ff',s.bang*.36);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const phase=s.revealed?'reveal':T<DT.planets?'singularity':T<DT.fire?'planets':T<DT.crack?'void-fire':T<DT.wings?'sword':T<DT.crown?'wings':T<DT.descend?'crown':T<DT.erase?'descend':T<DT.dark?'erase':'void';
 const ui={k:s.k,realm:24,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#eef2ff',title:'Diệt Thế Chí Tôn',subtitle:'Diệt Thế Quy Hư',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#eef2ff';c.fillText(ui.name,450,H*.06);if(s.revealed){c.font='700 44px Arial';c.fillText('DIỆT THẾ CHÍ TÔN',450,H*.1);}}
 return ui;
}
