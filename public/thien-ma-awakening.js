import {drawScreenPulse} from './cinematic-feedback.js';
// Thiên Ma Thánh Đế v1 — Thiên Ma Đăng Thánh (09/11/2026). 48 s; nổ 42,0; đổi skin 42,3.
// Cơ chế riêng (không lặp Ma Thần: không trăng, xích, dung nham, mặt quỷ, kích, mảnh giáp, sừng):
// trời bị xé dọc 3 nhát thành khe Thiên Ma → 7 thánh ấn hình học phi Euclid rơi vào khoá quanh thân →
// vạn nhãn mở trên trời 3 đợt, cùng nhìn xuống, chiếu tia → 12 đốt luân hoàn cơ khí có mắt bay ra từ khe, ráp thành vòng sau lưng →
// vòng nuốt 9 ngôi sao → Thiên Ma Nhãn khổng lồ trong khe chớp 2 lần, mở, bắn tia vào vòng, thu nhỏ thành ấn trên trán (trên đầu) →
// 9 lưỡi kiếm rơi cắm ngược, lật lên thành vương miện lơ lửng → càn khôn đảo 3 nhịp (trời xoay 180°) →
// mọi thứ sụp vào đan điền → tối, 3 nhịp mắt tím → NỔ tím vàng, khe trời khép bằng đường chỉ vàng → hiện thân: luân hoàn có mắt + miện kiếm.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
export const TM=Object.freeze({duration:48,rift:.2,riftOpen:1.4,glyphs:2.6,locked:7.4,eyes:8.0,gaze:11.4,gazeEnd:12.6,halo:13.0,haloSpin:17.2,stars:17.8,devoured:22.3,blink:23.0,open:24.6,beam:25.2,mark:26.6,blades:27.2,crowned:31.0,invert:32.0,collapse:36.0,absorbed:39.2,dark:39.6,impact:42.0,reveal:42.3,fade:46.4});
export const TM_TEARS=Object.freeze([.2,.55,.9]);
export const TM_GLYPHS=Object.freeze(Array.from({length:7},(_,i)=>2.6+i*.7));
export const TM_EYE_WAVES=Object.freeze([8.0,9.2,10.4]);
export const TM_HALO=Object.freeze(Array.from({length:12},(_,i)=>13.0+i*.35));
export const TM_STARS=Object.freeze(Array.from({length:9},(_,i)=>17.8+i*.5));
export const TM_BLINKS=Object.freeze([23.0,23.8]);
export const TM_BLADES=Object.freeze(Array.from({length:9},(_,i)=>27.2+i*.4));
export const TM_TURNS=Object.freeze([32.0,33.2,34.4]);
export const TM_PULLS=Object.freeze([36.0,37.0,38.0]);
export const TM_BEATS=Object.freeze([40.0,40.6,41.2]);
export const THIEN_MA_DURATION=48000,THIEN_MA_REVEAL=TM.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len=.5)=>age<0||age>len?0:Math.sin(age/len*Math.PI);
const PALETTE={main:'#a24bff',main2:'#3a0a6a',soft:'#efe0ff',gold:'#ffd36a'};
const VIOLET='#a24bff',VIOLET2='#d9a6ff',GOLD='#ffd36a',GOLD2='#fff1c0';
export function thienMaState(k,H=1600,motion=true){
 const t=clamp(k)*TM.duration,feet=H*.74;
 const turn=TM_TURNS.reduce((a,at)=>a+ease((t-at)/.45),0)*(1-ease((t-TM.impact)/.35));
 return {k:clamp(k),t,H,motion,clock:motion?t:0,feet,belly:feet-145,head:feet-338,revealed:t>=TM.reveal,
  night:ease((t-TM.rift)/1.6),rift:ease((t-TM.rift)/1.2)*(1-ease((t-TM.impact)/.25)),
  glyphPull:ease((t-TM_PULLS[0])/.9),eyePull:ease((t-TM_PULLS[1])/.9),haloPull:ease((t-TM_PULLS[2])/1.1),
  gaze:ease((t-TM.gaze)/.3)*(1-ease((t-TM.gazeEnd)/.4)),
  bigEye:ease((t-TM.blink+.6)/1)*(1-ease((t-TM.mark)/.8)),turn:turn*Math.PI/3,
  dark:ease((t-TM.dark)/.5)*(1-ease((t-TM.impact)/.12)),blast:t>=TM.impact?1-ease((t-TM.impact)/3.2):0,bang:pulse(t-TM.impact,.9),
  after:ease((t-TM.reveal)/1.2),fade:1-ease((t-TM.fade)/1.4)};
}
export function thienMaHits(){return [...TM_TEARS.map((a,i)=>[a,.9+i*.2]),...TM_GLYPHS.map((a,i)=>[a,.7+i*.05]),[TM.locked,1.3],...TM_EYE_WAVES.map((a,i)=>[a,.8+i*.2]),[TM.gaze,1.5],...TM_HALO.map(a=>[a,.45]),[TM.haloSpin,1.3],...TM_STARS.map((a,i)=>[a+.45,.8+i*.04]),...TM_BLINKS.map(a=>[a,.9]),[TM.open,1.6],[TM.beam,1.8],[TM.mark,1.2],...TM_BLADES.map((a,i)=>[a+.35,.6+i*.04]),[TM.crowned,1.5],...TM_TURNS.map((a,i)=>[a,1.4+i*.2]),...TM_PULLS.map(a=>[a,.8]),...TM_PULLS.map(a=>[a+.9,1.3]),[TM.absorbed,1.8],...TM_BEATS.map((a,i)=>[a,.5+i*.15]),[TM.impact,2.6]];}
function hitPower(t){let p=0;for(const [a,f] of thienMaHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function assets(scene,H){
 const cache=scene.thienMaAssets;if(cache?.H===H)return cache;
 // trời tím đen, lưới phối cảnh phi Euclid mờ, sao vàng — vẽ nửa độ phân giải, rộng hơn màn để xoay không hở góc
 const S=1500,sky=surface(S/2,S/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(S/2,S*.42,60,S/2,S/2,S*.72);g.addColorStop(0,'#3a1460');g.addColorStop(.45,'#1a0834');g.addColorStop(1,'#06020e');c.fillStyle=g;c.fillRect(0,0,S,S);
  c.strokeStyle='#8a5ad8';c.lineWidth=1.2;c.globalAlpha=.16;for(let i=-12;i<=12;i++){c.beginPath();c.moveTo(S/2,S*.42);c.lineTo(S/2+i*140,S);c.stroke();c.beginPath();c.moveTo(S/2,S*.42);c.lineTo(S/2+i*140,0);c.stroke();}
  for(let j=1;j<9;j++){c.beginPath();c.ellipse(S/2,S*.42,j*j*14,j*j*7,0,0,TAU);c.stroke();}
  c.globalAlpha=1;for(let i=0;i<220;i++){const x=rnd(i)*S,y=rnd(i+400)*S,r=rnd(i+800)*1.8+.4;c.fillStyle=i%5?'#e8d8ff':GOLD;c.globalAlpha=.35+rnd(i+90)*.6;c.fillRect(x,y,r,r);}});
 const ground=surface(900,H*.4,c=>{const g=c.createLinearGradient(0,0,0,H*.4);g.addColorStop(0,'#1c0a3000');g.addColorStop(.12,'#1c0a30');g.addColorStop(1,'#05020a');c.fillStyle=g;c.fillRect(0,0,900,H*.4);
  // nền đá tím bóng, đường vàng hình học
  c.globalAlpha=.3;c.strokeStyle='#c8a04a';c.lineWidth=1.2;for(let i=0;i<14;i++){c.beginPath();c.moveTo(450,30);c.lineTo(450+(i-6.5)*170,H*.4);c.stroke();}
  for(let j=1;j<6;j++){c.beginPath();c.ellipse(450,30,j*160,j*40,0,0,Math.PI);c.stroke();}});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#f0d8ffc0');g.addColorStop(.5,'#a24bff40');g.addColorStop(1,'#a24bff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const gold=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.2,'#fff1c0c0');g.addColorStop(.55,'#ffd36a40');g.addColorStop(1,'#ffd36a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#03000800');g.addColorStop(.55,'#03000800');g.addColorStop(1,'#030008e8');c.fillStyle=g;c.fillRect(0,0,900,H);});
 // khe trời: đường zigzag dọc, mỗi nhát xé thêm một đoạn
 const riftPts=[];for(let i=0;i<=26;i++){const u=i/26;riftPts.push({x:450+(rnd(i+71)-.5)*70*Math.sin(u*Math.PI)+(i%2?14:-14)*(1-u),y:u*H*.43,w:Math.sin(u*Math.PI)*.85+.08});}
 // vạn nhãn: 24 vị trí trên trời, tránh vùng khe và đầu nhân vật
 const eyes=[];for(let i=0;eyes.length<24&&i<200;i++){const x=60+rnd(i*3+1)*780,y=H*(.04+rnd(i*3+2)*.36);if(Math.abs(x-450)<110||Math.hypot(x-450,y-(feetOf(H)-338))<220)continue;if(eyes.some(e=>Math.hypot(e.x-x,e.y-y)<110))continue;eyes.push({x,y,r:26+rnd(i*5)*26,tilt:(rnd(i*7)-.5)*.5,wave:eyes.length%3});}
 const out={H,sky,ground,glow,gold,vignette,riftPts,eyes};scene.thienMaAssets=out;return out;
}
const feetOf=H=>H*.74;
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,0,0,TAU);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:22}),to:structuredClone(e.visualTo||{...live,realm:23})};snapshots.set(e,pair);return pair;}
// Khe Thiên Ma: 3 nhát xé, mỗi nhát mở rộng thêm; trong khe tím sáng, viền vàng.
function drawRift(c,a,s,T){if(s.rift<=0)return;const torn=TM_TEARS.reduce((n,at)=>n+ease((T-at)/.18),0)/3,open=s.rift*(.35+torn*.65)*(1+pulse(T-TM.beam,1)*.4),pts=a.riftPts,reach=Math.max(2,Math.ceil(pts.length*Math.min(1,torn*1.05)));
 c.save();const W=46*open;c.beginPath();for(let i=0;i<reach;i++){const p=pts[i];c.lineTo(p.x-W*p.w,p.y);}for(let i=reach-1;i>=0;i--){const p=pts[i];c.lineTo(p.x+W*p.w,p.y);}c.closePath();
 const g=c.createLinearGradient(400,0,500,0);g.addColorStop(0,'#2a0650');g.addColorStop(.5,'#c890ff');g.addColorStop(1,'#2a0650');c.fillStyle=g;c.globalAlpha=.85;c.fill();
 c.globalCompositeOperation='lighter';c.strokeStyle=GOLD;c.lineWidth=3;c.stroke();c.lineWidth=10;c.globalAlpha=.25;c.strokeStyle=VIOLET;c.stroke();c.restore();
 halo(c,a.glow,450,s.H*.2,260+open*220,s.H*.44,.42*open);
 TM_TEARS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.5){const y=pts[Math.min(pts.length-1,Math.floor((i+1)/3*(pts.length-1)))].y;halo(c,a.glow,450,y,500,500,1-age/.5);ring(c,450,y,30+age*700,VIOLET2,8*(1-age/.5)+1,1-age/.5,(30+age*700)*.4);}});}
// Thánh ấn hình học: 7 hình (tam giác, vuông, ngũ, lục, tam giác Penrose, thất tinh, vòng-điểm).
function polygon(c,n,r,rot=0){c.beginPath();for(let i=0;i<n;i++){const a=rot+i/n*TAU-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();}
function drawGlyphShape(c,i,r){c.lineJoin='round';
 if(i===0)polygon(c,3,r);else if(i===1)polygon(c,4,r,Math.PI/4);else if(i===2)polygon(c,5,r);else if(i===3)polygon(c,6,r);
 else if(i===4){c.beginPath();for(let k=0;k<3;k++){const a0=k/3*TAU-Math.PI/2,a1=(k+1)/3*TAU-Math.PI/2;c.moveTo(Math.cos(a0)*r,Math.sin(a0)*r);c.lineTo(Math.cos(a1)*r,Math.sin(a1)*r);c.moveTo(Math.cos(a0)*r*.55,Math.sin(a0)*r*.55);c.lineTo(Math.cos(a1)*r,Math.sin(a1)*r);c.moveTo(Math.cos(a0)*r*.55,Math.sin(a0)*r*.55);c.lineTo(Math.cos(a1)*r*.55,Math.sin(a1)*r*.55);}c.stroke();return;}
 else if(i===5){c.beginPath();for(let k=0;k<=7;k++){const a=k*3/7*TAU-Math.PI/2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}}
 else{c.beginPath();c.arc(0,0,r,0,TAU);c.moveTo(r*.18,0);c.arc(0,0,r*.18,0,TAU);}
 c.stroke();}
function glyphPos(i,s,T){const at=TM_GLYPHS[i],u=clamp((T-at)/.55),spin=(T-TM.glyphs)*.35,ang=i/7*TAU+spin,R=310,cx=450,cy=s.feet-210,tx=cx+Math.cos(ang)*R,ty=cy+Math.sin(ang)*R*.42,sx=450+(i%2?1:-1)*(520+rnd(i)*120),sy=-160-rnd(i+3)*200;
 let x=mix(sx,tx,back(u)),y=mix(sy,ty,ease(u));const p=s.glyphPull;if(p>0){x=mix(x,450,p*p);y=mix(y,s.belly,p*p);}return {x,y,ang,u,scale:1-p*.85};}
function drawGlyphs(c,a,s,T,front){if(T<TM.glyphs||s.glyphPull>=1)return;const lock=pulse(T-TM.locked,.8);for(let i=0;i<7;i++){if(T<TM_GLYPHS[i])continue;const p=glyphPos(i,s,T),depth=Math.sin(p.ang);if(front!==(depth>0))continue;const r=(64+depth*10)*p.scale,al=(.75+depth*.2)*(1-s.glyphPull*.6);
  c.save();c.translate(p.x,p.y);c.rotate((T-TM_GLYPHS[i])*(i%2?.8:-.8));c.scale(1,.55+.45*Math.abs(Math.cos(T*.7+i)));c.globalCompositeOperation='lighter';c.globalAlpha=al*.35;c.strokeStyle=VIOLET;c.lineWidth=12;drawGlyphShape(c,i,r);c.globalAlpha=al;c.strokeStyle=GOLD;c.lineWidth=3.5+lock*3;drawGlyphShape(c,i,r);c.restore();
  const age=T-TM_GLYPHS[i]-.55;if(age>=0&&age<.4){halo(c,a.gold,p.x,p.y,220,220,1-age/.4);ring(c,p.x,p.y,20+age*360,GOLD2,6*(1-age/.4)+1,1-age/.4);}}
 // dây hình học nối các ấn đã khoá
 if(T>=TM.locked-.2&&front){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.4*(1-s.glyphPull)+lock*.5;c.strokeStyle=GOLD;c.lineWidth=1.6;c.beginPath();for(let i=0;i<7;i++){const p=glyphPos((i*3)%7,s,T);i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.closePath();c.stroke();c.restore();}
 if(front){const age=T-TM.locked;if(age>=0&&age<.7){ring(c,450,s.feet-210,80+age*900,GOLD,10*(1-age/.7)+1,1-age/.7,(80+age*900)*.42);}}}
// Vạn nhãn trên trời: hình hạnh nhân, tròng vàng, đồng tử dọc; 3 đợt mở; khi nhìn chằm chằm bắn tia mảnh về phía trên đầu.
function eyeShape(c,x,y,r,open){c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x,y-r*open*.9,x+r,y);c.quadraticCurveTo(x,y+r*open*.9,x-r,y);c.closePath();}
function drawEyes(c,a,s,T){if(T<TM.eyes)return;const pull=s.eyePull;if(pull>=1)return;const tx=450,ty=s.head-90;
 for(const [i,e] of a.eyes.entries()){const at=TM_EYE_WAVES[e.wave]+(i%8)*.06;if(T<at)continue;const blink=T>TM.gazeEnd?Math.max(0,1-pulse((T*1.3+i*.37)%3,.18)*.9):1,open=ease((T-at)/.25)*blink*(1-pull),x=mix(e.x,450,pull*pull),y=mix(e.y,s.belly,pull*pull),r=e.r*(1-pull*.7);if(open<=.02)continue;
  const look=Math.atan2(ty-y,tx-x),px=Math.cos(look)*r*.28,py=Math.sin(look)*r*.18;
  c.save();c.translate(x,y);c.rotate(e.tilt);c.translate(-x,-y);eyeShape(c,x,y,r,open);c.fillStyle='#120420';c.globalAlpha=.92;c.fill();c.lineWidth=2.5;c.strokeStyle=GOLD;c.stroke();c.clip();
  c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x+px,y+py,0,x+px,y+py,r*.5);g.addColorStop(0,'#fff1c0');g.addColorStop(.45,GOLD);g.addColorStop(1,'#a24bff00');c.fillStyle=g;c.globalAlpha=1;c.fillRect(x-r,y-r,r*2,r*2);c.globalCompositeOperation='source-over';c.fillStyle='#000';c.beginPath();c.ellipse(x+px,y+py,r*.07,r*.3*open,0,0,TAU);c.fill();c.restore();
  const age=T-at;if(age<.3)halo(c,a.gold,x,y,r*5,r*5,1-age/.3);
  if(s.gaze>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=s.gaze*.55;c.strokeStyle=i%2?GOLD:VIOLET2;c.lineWidth=1.4+s.gaze*1.6;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();c.restore();}}
 if(s.gaze>0){halo(c,a.gold,tx,ty,260,260,s.gaze);ring(c,tx,ty,40+pulse(T-TM.gaze,1.2)*120,GOLD2,4,s.gaze*.8);}
 TM_EYE_WAVES.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.25)drawScreenPulse(c,s.H,s.reduceFlash,'#d9a6ff',(1-age/.25)*.12);});}
// Luân hoàn cơ khí: 12 đốt cung có răng và mắt nhỏ, bay ra từ khe, ráp thành vòng sau lưng; quay sau khi đủ.
const HALO_R=190;
function haloCenter(s){return {x:450,y:s.head+70};}
function drawHaloSeg(c,a,i,cx,cy,R,rot,al,eyeOpen,T){const a0=rot+i/12*TAU+.03,a1=rot+(i+1)/12*TAU-.03;c.save();c.globalAlpha=al;
 c.beginPath();c.arc(cx,cy,R+18,a0,a1);c.arc(cx,cy,R-18,a1,a0,true);c.closePath();const g=c.createLinearGradient(cx,cy-R,cx,cy+R);g.addColorStop(0,'#2a1048');g.addColorStop(1,'#0c0418');c.fillStyle=g;c.fill();c.strokeStyle=GOLD;c.lineWidth=2.5;c.stroke();
 // răng cưa ngoài
 c.fillStyle='#c8a04a';for(let k=0;k<3;k++){const am=mix(a0,a1,(k+.5)/3);c.save();c.translate(cx+Math.cos(am)*(R+22),cy+Math.sin(am)*(R+22));c.rotate(am);c.fillRect(-3,-5,8,10);c.restore();}
 // mắt nhỏ giữa đốt
 const am=(a0+a1)/2,ex=cx+Math.cos(am)*R,ey=cy+Math.sin(am)*R;if(eyeOpen>0){c.globalCompositeOperation='lighter';eyeShape(c,ex,ey,11,eyeOpen);c.fillStyle=i%3?GOLD:VIOLET2;c.fill();c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(ex-1.2,ey-4*eyeOpen,2.4,8*eyeOpen);}
 c.restore();}
function drawHalo(c,a,s,T){const final=s.revealed;if(!final&&(T<TM.halo||s.haloPull>=1))return;const {x:cx,y:cy}=haloCenter(s),spin=T<TM.haloSpin?0:(T-TM.haloSpin)*(.4+pulse(T-TM.haloSpin,1.5)*2),pull=final?0:s.haloPull,R=HALO_R*(final?ease(s.after*1.3)*1:1)*(1-pull*.85),cyy=mix(cy,s.belly,pull*pull);
 const eyeOpen=final?1:ease((T-TM.haloSpin)/.4),al=final?s.after*s.fade:1-pull*.4;
 if(T>=TM.haloSpin||final)halo(c,a.glow,cx,cyy,R*3,R*3,(.45+pulse(T-TM.haloSpin,1)*.5)*al);
 for(let i=0;i<12;i++){if(!final&&T<TM_HALO[i])continue;const u=final?1:ease((T-TM_HALO[i])/.32),seg=mix(-1.2,1,u);const ox=(1-u)*(rnd(i)-.5)*300,oy=(1-u)*(s.H*.2-cyy);
  c.save();c.translate(ox,oy);drawHaloSeg(c,a,i,cx,cyy,R,spin,al*clamp(seg+1),eyeOpen,T);c.restore();
  if(!final){const age=T-TM_HALO[i]-.32;if(age>=0&&age<.3){const am=spin+(i+.5)/12*TAU;halo(c,a.gold,cx+Math.cos(am)*R,cyy+Math.sin(am)*R,160,160,1-age/.3);}}}
 if(!final){const age=T-TM.haloSpin;if(age>=0&&age<.7)ring(c,cx,cy,R+age*700,GOLD,10*(1-age/.7)+1,1-age/.7);}}
// 9 ngôi sao bị vòng nuốt: sao lóe trên trời, kéo vệt về tâm vòng, chớp.
function starPos(i,H){return {x:80+rnd(i*11+3)*740,y:H*(.05+rnd(i*11+5)*.3)};}
function drawStars(c,a,s,T){if(T<TM.stars-.3||T>TM.devoured+.5)return;const hc=haloCenter(s);for(let i=0;i<9;i++){const at=TM_STARS[i],p=starPos(i,s.H),pre=ease((T-at+.3)/.3);if(pre<=0)continue;const u=clamp((T-at)/.45),am=-Math.PI/2+(i-4)*.32,cx=hc.x+Math.cos(am)*HALO_R,cy=hc.y+Math.sin(am)*HALO_R;
  if(u<1){const x=mix(p.x,cx,u*u),y=mix(p.y,cy,u*u);halo(c,a.gold,x,y,90+u*60,90+u*60,pre);if(u>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.8;c.strokeStyle=GOLD2;c.lineWidth=4;c.beginPath();c.moveTo(mix(p.x,cx,Math.max(0,u*u-.25)),mix(p.y,cy,Math.max(0,u*u-.25)));c.lineTo(x,y);c.stroke();c.restore();}}
  else{const age=T-at-.45;if(age<.45){halo(c,a.gold,cx,cy,300,300,1-age/.45);ring(c,hc.x,hc.y,HALO_R+age*400,GOLD2,6*(1-age/.45)+1,1-age/.45);}}}}
// Thiên Ma Nhãn khổng lồ dọc trong khe: chớp 2 lần, mở, bắn tia vào vòng, thu thành ấn thoi trên đầu.
function drawBigEye(c,a,s,T){if(s.bigEye<=0&&T<TM.mark)return;const x=450,y=s.H*.2,R=150;
 if(T<TM.mark+.8&&s.bigEye>0){const blink=Math.max(...TM_BLINKS.map(at=>pulse(T-at,.5))),op=T<TM.open?(.15+.35*blink):ease((T-TM.open)/.3),shrink=ease((T-TM.mark+.5)/.5),cx=x,cy=mix(y,s.head-70,shrink),r=mix(R,22,shrink);
  c.save();c.globalAlpha=s.bigEye;c.translate(cx,cy);c.rotate(Math.PI/2);eyeShape(c,0,0,r,op);c.fillStyle='#14041e';c.fill();c.lineWidth=4;c.strokeStyle=GOLD;c.stroke();c.clip();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(0,0,0,0,0,r*.55);g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#ff9aff');g.addColorStop(.7,VIOLET);g.addColorStop(1,'#a24bff00');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.globalCompositeOperation='source-over';c.fillStyle='#000';c.beginPath();c.ellipse(0,0,r*.4*op,r*.06,0,0,TAU);c.fill();c.restore();
  halo(c,a.glow,cx,cy,r*4,r*4,s.bigEye*op*.7);
  const beam=ease((T-TM.beam)/.15)*(1-ease((T-TM.mark+.6)/.4));if(beam>0){const hx=450,hy=haloCenter(s).y-HALO_R;c.save();c.globalCompositeOperation='lighter';for(const [w,col,al] of [[60,VIOLET,.35],[22,'#ff9aff',.7],[7,'#ffffff',.9]]){c.globalAlpha=beam*al;c.strokeStyle=col;c.lineWidth=w*(1+pulse(T-TM.beam,.6)*.6);c.beginPath();c.moveTo(cx,cy+r*.6);c.lineTo(hx,hy);c.stroke();}c.restore();halo(c,a.glow,hx,hy,500,500,beam*.8);}}
 // ấn thoi trên đầu (không chạm mặt): hiện từ khi thu, mờ trước nổ, hiện lại sau reveal
 const mk=s.revealed?s.after*s.fade:ease((T-TM.mark)/.3)*(1-ease((T-TM_PULLS[2])/1)),my=s.head-74;if(mk>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=mk;c.translate(450,my);c.fillStyle=VIOLET2;c.beginPath();c.moveTo(0,-20);c.lineTo(9,0);c.lineTo(0,20);c.lineTo(-9,0);c.closePath();c.fill();c.strokeStyle=GOLD;c.lineWidth=2;c.stroke();c.restore();halo(c,a.glow,450,my,90,90,mk*.8);}
 {const age=T-TM.open;if(age>=0&&age<.6){drawScreenPulse(c,s.H,s.reduceFlash,'#d9a6ff',(1-age/.6)*.25);ring(c,x,y,R+age*800,VIOLET2,10*(1-age/.6)+1,1-age/.6);}}
 {const age=T-TM.mark;if(age>=0&&age<.5){ring(c,450,my,20+age*400,GOLD2,6*(1-age/.5)+1,1-age/.5);}}}
// 9 lưỡi kiếm: rơi cắm ngược quanh đầu, lật lên thành vương miện lơ lửng; sau reveal hiện lại.
function blade(c,len,w,al){c.save();c.globalAlpha=al;c.beginPath();c.moveTo(0,-len);c.lineTo(w,-len*.15);c.lineTo(w*.5,0);c.lineTo(-w*.5,0);c.lineTo(-w,-len*.15);c.closePath();const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#3a2a5a');g.addColorStop(.5,'#f0e8ff');g.addColorStop(1,'#3a2a5a');c.fillStyle=g;c.fill();c.strokeStyle=GOLD;c.lineWidth=1.6;c.stroke();c.fillStyle='#c8a04a';c.fillRect(-w*1.3,0,w*2.6,4);c.fillRect(-2,4,4,len*.18);c.restore();}
function crownSlot(i,s,T,spin){const ang=-Math.PI/2+(i-4)*.26,R=118;return {x:450+Math.cos(ang)*R*1.25,y:s.head-30+Math.sin(ang)*R*.9-28,rot:ang+Math.PI/2+Math.sin(spin+i)*.04};}
function drawBlades(c,a,s,T){const final=s.revealed;if(!final&&(T<TM.blades||s.haloPull>=1))return;const spin=s.clock*1.2,pull=final?0:s.haloPull;
 for(let i=0;i<9;i++){const at=TM_BLADES[i];if(!final&&T<at)continue;const slot=crownSlot(i,s,T,spin);let x,y,rot,al=1;
  if(final){x=slot.x;y=slot.y-(1-ease(s.after*1.4))*60;rot=slot.rot;al=s.after*s.fade;}
  else{const fall=clamp((T-at)/.35),flip=ease((T-TM.crowned+.5)/.5);const sx=450+(i-4)*60,sy=-200;x=mix(sx,slot.x,fall);y=mix(sy,slot.y+40,fall*fall);rot=mix(Math.PI,slot.rot,flip)+(1-fall)*.3*(i%2?1:-1);if(flip>0)y=mix(y,slot.y,flip);x=mix(x,450,pull*pull);y=mix(y,s.belly,pull*pull);al=1-pull*.5;}
  c.save();c.translate(x,y);c.rotate(rot);c.scale(1-pull*.7,1-pull*.7);halo(c,a.glow,0,-40,80,180,.35*al);blade(c,i===4?120:96,i===4?14:11,al);c.restore();
  if(!final){const age=T-at-.35;if(age>=0&&age<.3){halo(c,a.gold,x,y,180,180,1-age/.3);}}}
 if(!final){const age=T-TM.crowned;if(age>=0&&age<.6){ring(c,450,s.head-90,40+age*600,GOLD2,8*(1-age/.6)+1,1-age/.6,(40+age*600)*.5);halo(c,a.gold,450,s.head-100,420,300,1-age/.6);}}}
// Mảnh hình học vàng văng khi nổ (tam giác/vuông).
function drawShards(c,s,T){const age=T-TM.impact;if(age<0||age>2.6)return;const f=1-age/2.6;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<36;i++){const ang=rnd(i+40)*TAU,d=age*(320+rnd(i)*700),x=450+Math.cos(ang)*d,y=s.belly+Math.sin(ang)*d*.8,sz=8+rnd(i+2)*20;c.globalAlpha=f;c.strokeStyle=i%3?GOLD:VIOLET2;c.lineWidth=2.5;c.save();c.translate(x,y);c.rotate(age*3+i);polygon(c,i%2?3:4,sz);c.stroke();c.restore();}c.restore();}
// Thất tinh ấn vàng dưới chân sau hiện thân.
function drawSigil(c,a,s){const k=s.after*s.fade;if(k<=0)return;const cx=450,cy=s.feet+8,R=250;c.save();c.globalCompositeOperation='lighter';c.translate(cx,cy);c.scale(1,.3);
 for(const [r,w,al] of [[R,4,.8],[R*.78,2,.6],[R*1.14,1.6,.4]]){c.globalAlpha=k*al;c.strokeStyle=GOLD;c.lineWidth=w;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
 c.rotate(s.clock*.2);c.globalAlpha=k*.85;c.strokeStyle=VIOLET2;c.lineWidth=3;c.beginPath();for(let i=0;i<=7;i++){const ang=i*3/7*TAU;c.lineTo(Math.cos(ang)*R*.78,Math.sin(ang)*R*.78);}c.stroke();c.restore();halo(c,a.glow,cx,cy,640,180,k*.5);}
function drawMotesUp(c,s,H,light){if(s.after<=0)return;const n=light?22:56;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const u=((s.clock*.1+rnd(i))%1),x=450+(rnd(i+5)-.5)*760+Math.sin(s.clock*1.1+i)*24,y=s.feet+40-u*H*.75;c.globalAlpha=s.after*s.fade*(1-u)*.9;c.fillStyle=i%3?VIOLET2:GOLD;c.save();c.translate(x,y);c.rotate(i+s.clock);c.fillRect(-2,-2,4+rnd(i)*3,4+rnd(i)*3);c.restore();}c.restore();}
export function drawThienMaAwakening(scene,c,e,t,H){
 const s=thienMaState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,TM.impact/TM.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',T=s.t;
 s.reduceFlash=scene.reduceFlash;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 // trời: xoay theo càn khôn đảo
 c.fillStyle='#06020e';c.fillRect(0,0,900,H);
 if(a.sky){c.save();c.translate(450,H*.42);c.rotate(s.turn*(v.flip?-1:1));c.globalAlpha=.25+s.night*.75;c.drawImage(a.sky,-750,-750,1500,1500);c.restore();}
 TM_TURNS.forEach(at=>{const age=T-at;if(age>=0&&age<.35)drawScreenPulse(c,H,scene.reduceFlash,'#a24bff',(1-age/.35)*.18);});
 drawScreenPulse(c,H,scene.reduceFlash,'#a24bff',hit*.08);
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false?hit*13+s.bang*14:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 {const rot=s.turn*(v.flip?-1:1);c.save();if(rot){c.translate(450,H*.22);c.rotate(rot);c.translate(-450,-H*.22);}drawRift(c,a,s,T);drawEyes(c,a,s,T);c.restore();}
 drawBigEye(c,a,s,T);
 drawStars(c,a,s,T);
 if(a.ground){c.save();c.globalAlpha=.4+s.night*.6;c.drawImage(a.ground,0,s.feet-40,900,H*.4);c.restore();}
 drawSigil(c,a,s);
 drawGlyphs(c,a,s,T,false);
 drawHalo(c,a,s,T);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 if(s.blast>0){for(let i=0;i<8;i++){const u=clamp((T-TM.impact-i*.08)/1.6);if(u<=0||u>=1)continue;ring(c,450,s.belly,60+ease(u)*1100,i%2?VIOLET:GOLD,16*(1-u)+2,(1-u)*.9,(60+ease(u)*1100)*.55);}halo(c,a.glow,450,s.belly,1300,1300,s.bang*.85);}
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawGlyphs(c,a,s,T,true);
 drawBlades(c,a,s,T);
 // sụp đổ vào đan điền
 TM_PULLS.forEach((at,i)=>{const age=T-at-.9;if(age>=0&&age<.5){halo(c,a.glow,450,s.belly,420,420,1-age/.5);ring(c,450,s.belly,20+age*600,i===2?GOLD:VIOLET2,9*(1-age/.5)+1,1-age/.5);}});
 if(T>=TM.collapse&&T<TM.impact){const k2=clamp((T-TM.collapse)/(TM.impact-TM.collapse));halo(c,a.glow,450,s.belly,120+k2*260,120+k2*260,.4+k2*.6);}
 drawQiCompression(c,kq,origin);
 drawShards(c,s,T);
 c.restore();
 // ngoài camera: tối, 3 nhịp mắt tím, chớp nổ, khe khép bằng chỉ vàng
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.86;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...TM_BEATS.map(at=>pulse(T-at,.4)));c.save();c.globalAlpha=s.dark;c.translate(450,s.belly);eyeShape(c,0,0,26,.25+beat*.75);c.fillStyle=VIOLET2;c.globalCompositeOperation='lighter';c.fill();c.restore();halo(c,a.glow,450,s.belly,120+beat*200,120+beat*200,s.dark*(.4+beat*.6));}
 {const age=T-TM.impact;if(age>=0&&age<1.6){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-age/1.6);c.strokeStyle=GOLD2;c.lineWidth=4+(1-age/1.6)*6;c.beginPath();for(const p of a.riftPts)c.lineTo(p.x,p.y);c.stroke();c.restore();}}
 drawScreenPulse(c,H,scene.reduceFlash,'#e0b8ff',s.bang*.33);
 drawMotesUp(c,s,H,light);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const phase=s.revealed?'reveal':T<TM.glyphs?'rift':T<TM.eyes?'glyphs':T<TM.halo?'eyes':T<TM.stars?'halo':T<TM.blink?'stars':T<TM.blades?'eye':T<TM.invert?'crown':T<TM.collapse?'invert':T<TM.dark?'collapse':'void';
 const ui={k:s.k,realm:23,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#e8c8ff',title:'Thiên Ma Thánh Đế',subtitle:'Thiên Ma Đăng Thánh',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#f4e8ff';c.fillText(ui.name,450,H*.06);if(s.revealed){c.font='700 44px Arial';c.fillText('THIÊN MA THÁNH ĐẾ',450,H*.1);}}
 return ui;
}
