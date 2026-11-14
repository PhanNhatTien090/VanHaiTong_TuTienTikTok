import {drawScreenPulse} from './cinematic-feedback.js';
// Tiên Đế v1 — Tiên Đế Đăng Cơ · Vạn Tiên Triều Bái (07/11/2026). 34 s; nổ 30,0; đổi skin 30,3.
// Cơ chế riêng (không lặp Thái Ất/Đại La): cổng Nam Thiên Môn che kín màn hình, gõ 3 lần rồi mở → 9 bậc thềm ngọc bay vào từng bậc →
// thiên binh giáng thành cột sáng hai bên rồi quỳ bái 6 làn sóng → Cửu Đỉnh rơi từng cái, bốc lửa → thánh chỉ trải ra, đóng 4 chữ
// "PHỤNG THIÊN THỪA VẬN" → ngọc tỷ giáng xuống đóng ấn → ngai vàng trồi lên, 12 tia hào quang xòe → mũ miện hạ xuống đầu →
// "VẠN TUẾ" ba lần, vạn vật cúi đầu, lửa và hào quang bị hút vào người → tối → nổ hình ấn vuông, mưa cánh hoa.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
export const TD=Object.freeze({duration:34,gate:.2,open:2.2,opened:3.2,steps:3.4,army:7.2,bow:9.3,tripods:12.6,edict:16.4,words:17.6,seal:19.8,stamp:21,dissolve:22,throne:22.2,rays:23.5,crown:25.8,crowned:27,kowtow:27.2,converge:28.6,dark:29.25,absorbed:29.85,impact:30,reveal:30.3,fade:32.8});
export const TD_KNOCKS=Object.freeze([.5,1.1,1.7]);
export const TD_STEPS=Object.freeze(Array.from({length:9},(_,i)=>3.4+i*.42));
export const TD_LANDS=Object.freeze(Array.from({length:8},(_,i)=>7.2+i*.24));
export const TD_BOWS=Object.freeze(Array.from({length:6},(_,i)=>9.3+i*.5));
export const TD_TRIPODS=Object.freeze(Array.from({length:9},(_,i)=>12.6+i*.4));
export const TD_WORDS=Object.freeze(Array.from({length:4},(_,i)=>17.6+i*.5));
export const TD_RAYS=Object.freeze(Array.from({length:12},(_,i)=>23.5+i*.18));
export const TD_CHEERS=Object.freeze([27.3,27.8,28.3]);
export const TD_SUCK=Object.freeze(Array.from({length:9},(_,i)=>28.6+i*.07));
export const TIEN_DE_DURATION=34000,TIEN_DE_REVEAL=TD.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len=.5)=>age<0||age>len?0:Math.sin(age/len*Math.PI);
const PALETTE={main:'#ffd36a',main2:'#ff5a3a',soft:'#fff6dc',gold:'#ffd36a'};
const DROP_ORDER=[0,8,1,7,2,6,3,5,4];
const WORDS=[['PHỤNG',-150,-42],['THIÊN',150,-42],['THỪA',-130,52],['VẬN',130,52]];
export function tienDeState(k,H=1600,motion=true){
 const t=clamp(k)*TD.duration,feet=H*.74;
 return {k:clamp(k),seconds:t,t,H,motion,clock:motion?t:0,feet,belly:feet-145,revealed:t>=TD.reveal,
  gate:1-ease((t-TD.open)/1),steps:1-ease((t-TD.reveal)/1.5),army:ease((t-TD.army)/.3)*(1-ease((t-TD.dark)/.5)),scroll:ease((t-TD.edict)/1)*(1-ease((t-TD.dissolve)/.7)),
  throne:ease((t-TD.throne)/1.2)*(1-ease((t-TD.dark)/.5)),rays:1-ease((t-TD.converge)/.7),deep:ease((t-TD.kowtow)/.35),converge:ease((t-TD.converge)/(TD.dark-TD.converge)),
  dark:ease((t-TD.dark)/.5)*(1-ease((t-TD.impact)/.05)),blast:t<TD.impact?0:clamp((t-TD.impact)/1.8),bang:t<TD.impact?0:Math.exp(-(t-TD.impact)*1.6),after:ease((t-TD.reveal)/.5),fade:1-ease((t-TD.fade)/1.2)};
}
export function tienDeHits(){return [...TD_KNOCKS.map(a=>[a,1.1]),[TD.open,1.6],...TD_STEPS.map(a=>[a,.75]),...TD_LANDS.map(a=>[a,.6]),...TD_BOWS.map((a,i)=>[a,i>3?.9:.45]),...TD_TRIPODS.map(a=>[a,.95]),...TD_WORDS.map(a=>[a,.8]),[TD.stamp,2],[TD.throne+1,1.2],...TD_RAYS.map(a=>[a,.35]),[TD.crowned,1.5],...TD_CHEERS.map(a=>[a,.8]),[TD.impact,2.4]];}
function hitPower(t){let p=0;for(const [a,f] of tienDeHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
export function prepareTienDeArt(scene){if(scene.tienDeWorldArt||typeof Image==='undefined')return;const im=new Image();scene.tienDeWorldArt=im;im.onload=()=>{scene.tienDeAssets=null;};im.src='/assets/tien-de-v1/heaven-court.png';}
// Cánh cổng Nam Thiên Môn: son đỏ, 9×5 đinh vàng, vòng gõ đầu sư tử.
function paintLeaf(c,H,left){const w=450,h=H;const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,left?'#5a0c0c':'#8e1a14');g.addColorStop(1,left?'#8e1a14':'#5a0c0c');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.strokeStyle='#e8b84a';c.lineWidth=14;c.strokeRect(10,10,w-20,h-20);c.lineWidth=4;c.strokeRect(34,34,w-68,h-68);
 for(let r=0;r<9;r++)for(let q=0;q<5;q++){const x=70+q*(w-140)/4,y=h*.1+r*h*.8/8,sg=c.createRadialGradient(x-5,y-5,2,x,y,17);sg.addColorStop(0,'#fff3c0');sg.addColorStop(.5,'#e0a83a');sg.addColorStop(1,'#7a4a10');c.fillStyle=sg;c.beginPath();c.arc(x,y,16,0,TAU);c.fill();}
 const kx=left?w-70:70,ky=h*.52;c.fillStyle='#c8902e';c.beginPath();c.arc(kx,ky,44,0,TAU);c.fill();c.fillStyle='#5a3008';c.beginPath();c.arc(kx,ky,30,0,TAU);c.fill();c.strokeStyle='#ffd77a';c.lineWidth=8;c.beginPath();c.arc(kx,ky+46,40,0,TAU);c.stroke();}
// Đỉnh đồng ba chân.
function paintTripod(c){c.translate(80,80);const g=c.createLinearGradient(-60,0,60,0);g.addColorStop(0,'#3a2410');g.addColorStop(.45,'#b8862e');g.addColorStop(.6,'#e8c06a');g.addColorStop(1,'#3a2410');
 c.strokeStyle='#3a2410';c.lineWidth=10;for(const x of [-38,0,38]){c.beginPath();c.moveTo(x*.8,20);c.lineTo(x,62);c.stroke();}
 c.fillStyle=g;c.beginPath();c.moveTo(-60,-22);c.lineTo(60,-22);c.quadraticCurveTo(62,40,0,42);c.quadraticCurveTo(-62,40,-60,-22);c.fill();
 c.fillStyle='#e8c06a';c.fillRect(-66,-30,132,12);c.strokeStyle='#c8902e';c.lineWidth=8;c.strokeRect(-50,-58,22,28);c.strokeRect(28,-58,22,28);
 c.fillStyle='#4a2c0c';for(let i=0;i<5;i++){c.beginPath();c.arc(-36+i*18,8,5,0,TAU);c.fill();}}
// Ngai vàng: lưng vòm, tấm son có mặt trời, hai cột đầu ngọc, tay vịn.
function paintThrone(c){const w=480,h=640,cx=w/2;const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fff0b0');g.addColorStop(.5,'#e0a83a');g.addColorStop(1,'#8a5a14');
 c.fillStyle=g;c.beginPath();c.moveTo(60,h-120);c.lineTo(60,200);c.quadraticCurveTo(60,40,cx,30);c.quadraticCurveTo(w-60,40,w-60,200);c.lineTo(w-60,h-120);c.closePath();c.fill();
 c.fillStyle='#8e1a14';c.beginPath();c.moveTo(100,h-140);c.lineTo(100,210);c.quadraticCurveTo(100,80,cx,72);c.quadraticCurveTo(w-100,80,w-100,210);c.lineTo(w-100,h-140);c.closePath();c.fill();
 const sg=c.createRadialGradient(cx,230,10,cx,230,110);sg.addColorStop(0,'#fff6d0');sg.addColorStop(.5,'#ffc94a');sg.addColorStop(1,'#ffc94a00');c.fillStyle=sg;c.beginPath();c.arc(cx,230,110,0,TAU);c.fill();
 c.strokeStyle='#ffd77a';c.lineWidth=3;for(let i=0;i<16;i++){const a=i*TAU/16;c.beginPath();c.moveTo(cx+Math.cos(a)*60,230+Math.sin(a)*60);c.lineTo(cx+Math.cos(a)*100,230+Math.sin(a)*100);c.stroke();}
 for(const x of [40,w-40]){c.fillStyle=g;c.fillRect(x-22,120,44,h-200);c.fillStyle='#fff6d0';c.beginPath();c.arc(x,108,30,0,TAU);c.fill();c.fillStyle='#ffc94a';c.beginPath();c.arc(x,108,18,0,TAU);c.fill();}
 c.fillStyle='#c8902e';c.fillRect(20,h-150,w-40,40);c.fillStyle='#6a3c0c';c.fillRect(40,h-110,w-80,110);c.strokeStyle='#ffd77a';c.lineWidth=5;c.strokeRect(40,h-110,w-80,110);}
function assets(scene,H){
 const cache=scene.tienDeAssets;if(cache?.H===H)return cache;const art=ready(scene.tienDeWorldArt)?scene.tienDeWorldArt:null;
 const world=surface(450,H/2,c=>{c.scale(.5,.5);if(art)c.drawImage(art,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#ff9a6a');g.addColorStop(.5,'#f6d8b0');g.addColorStop(1,'#e8dcc8');c.fillStyle=g;c.fillRect(0,0,900,H);}c.fillStyle='rgba(30,12,6,.3)';c.fillRect(0,0,900,H);});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#fff0c0b0');g.addColorStop(.5,'#ffb84a30');g.addColorStop(1,'#ffb84a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#0a040000');g.addColorStop(.55,'#0a040000');g.addColorStop(1,'#0a0400c0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const leafL=surface(225,H/2,c=>{c.scale(.5,.5);paintLeaf(c,H,true);}),leafR=surface(225,H/2,c=>{c.scale(.5,.5);paintLeaf(c,H,false);});
 const tripod=surface(160,160,paintTripod),throne=surface(480,640,paintThrone);
 return scene.tienDeAssets={H,world,glow,vignette,leafL,leafR,tripod,throne};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,0,0,TAU);c.stroke();c.restore();}

// Bậc thềm i (0 = dưới cùng) — hình thang phối cảnh dưới chân.
function stepBox(s,i){const h=(s.H-s.feet)/9,y1=s.H-i*h,y0=y1-h,hw=y=>mix(110,300,(y-s.feet)/(s.H-s.feet));return {y0,y1,w0:hw(y0),w1:hw(y1)};}
// Thiên binh: 4 hàng mỗi bên (hàng 0 ở xa).
function armyRows(s,light){const rows=[];for(let d=0;d<4;d++)for(const side of [-1,1]){const y=s.feet+d*72,sc=mix(.62,1.05,d/3),hw=mix(110,300,(y-s.feet)/(s.H-s.feet))+40,from=side<0?30:450+hw,to=side<0?450-hw:870,n=Math.max(1,Math.min(light?3:5,Math.floor((to-from)/(62*sc))));rows.push({d,side,y,sc,n,from,to,land:TD_LANDS[d*2+(side>0?1:0)]});}return rows;}
function soldier(c,x,y,sc,bow,side,a){if(a<=.01)return;const face=-side;c.save();c.globalAlpha=a;c.translate(x,y);c.scale(sc*face,sc);const kneel=Math.min(1,bow)*26;
 c.fillStyle='#2a160c';c.strokeStyle='#ffcf5a';c.lineWidth=3;c.fillRect(-14,-60+kneel,28,60-kneel);c.translate(0,-60+kneel);c.rotate(Math.min(1.25,bow*.85));
 c.beginPath();c.moveTo(-18,0);c.lineTo(18,0);c.lineTo(14,-62);c.lineTo(-14,-62);c.closePath();c.fill();c.stroke();c.beginPath();c.arc(0,-76,13,0,TAU);c.fill();c.stroke();
 c.strokeStyle='#d8302a';c.lineWidth=5;c.beginPath();c.moveTo(0,-88);c.lineTo(-6,-104);c.stroke();c.strokeStyle='#c8c0a8';c.lineWidth=3;c.beginPath();c.moveTo(22,10);c.lineTo(22,-130);c.stroke();c.fillStyle='#fff0c0';c.beginPath();c.moveTo(22,-146);c.lineTo(17,-128);c.lineTo(27,-128);c.closePath();c.fill();c.restore();}
function tripodPos(s,i){const a=Math.PI+(i+.5)/9*Math.PI;return {x:450+Math.cos(a)*370,y:s.feet-40+Math.sin(a)*70};}
function flame(c,x,y,h,a,t,i){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;const w=h*.32,sway=Math.sin(t*9+i)*w*.25;const g=c.createLinearGradient(0,y,0,y-h);g.addColorStop(0,'#ff6a1a');g.addColorStop(.5,'#ffb84a');g.addColorStop(1,'#fff6c000');c.fillStyle=g;c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*.8,y-h*.5,x+sway,y-h);c.quadraticCurveTo(x+w*.8,y-h*.5,x+w,y);c.closePath();c.fill();c.restore();}
function crown(c,x,y,a,t){if(a<=.01)return;c.save();c.globalAlpha=a;c.translate(x,y);c.scale(1.3,1.3);const g=c.createLinearGradient(0,-60,0,0);g.addColorStop(0,'#fff3c0');g.addColorStop(1,'#c8902e');c.fillStyle=g;c.beginPath();c.moveTo(-34,0);c.quadraticCurveTo(-36,-40,0,-46);c.quadraticCurveTo(36,-40,34,0);c.closePath();c.fill();
 c.fillStyle='#1a1008';c.save();c.transform(1,0,-.25,1,0,0);c.fillRect(-92,-62,184,14);c.restore();c.strokeStyle='#ffd77a';c.lineWidth=2;c.strokeRect(-92,-62,184,14);
 for(let i=0;i<9;i++){const bx=-84+i*21,len=44+Math.sin(t*4+i)*3;c.strokeStyle='#ffe8a0';c.lineWidth=1.5;c.beginPath();c.moveTo(bx,-48);c.lineTo(bx,-48+len);c.stroke();c.fillStyle=i%2?'#ff5a3a':'#9fe8ff';for(let j=1;j<=4;j++){c.beginPath();c.arc(bx,-48+j*len/4,3.2,0,TAU);c.fill();}}
 c.fillStyle='#ffd77a';c.beginPath();c.arc(0,-24,7,0,TAU);c.fill();c.restore();}
function seal(c,x,y,a){if(a<=.01)return;c.save();c.globalAlpha=a;c.translate(x,y);const g=c.createLinearGradient(-100,0,100,0);g.addColorStop(0,'#5aa880');g.addColorStop(.5,'#eafff2');g.addColorStop(1,'#4a9070');c.fillStyle=g;c.fillRect(-100,-150,200,150);c.fillStyle='#e0a83a';c.fillRect(-104,-40,208,18);
 c.fillStyle='#bfeed4';c.beginPath();c.moveTo(-70,-150);c.quadraticCurveTo(-60,-250,0,-240);c.quadraticCurveTo(60,-250,70,-150);c.closePath();c.fill();c.fillStyle='#ffd77a';c.beginPath();c.arc(0,-232,16,0,TAU);c.fill();c.strokeStyle='#2a6048';c.lineWidth=4;c.strokeRect(-100,-150,200,150);c.restore();}
function imprint(c,x,y,a){if(a<=.01)return;c.save();c.globalAlpha=a;c.translate(x,y);c.rotate(-.05);c.fillStyle='#c41818';c.fillRect(-90,-90,180,180);c.strokeStyle='#fff0e0';c.lineWidth=6;c.strokeRect(-76,-76,152,152);c.fillStyle='#fff0e0';c.textAlign='center';c.textBaseline='middle';c.font='900 58px "Times New Roman", serif';c.fillText('TIÊN',0,-32);c.fillText('ĐẾ',0,38);c.restore();}
export function tienDeActorImage(scene,p,e){
 if(scene.tienDeActor?.event!==e)scene.tienDeActor={event:e,frames:new Map()};const cache=scene.tienDeActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'tien-de-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}cache.set(p,im);return im;}
const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:12}),to:structuredClone(e.visualTo||{...live,realm:13})};snapshots.set(e,pair);return pair;}
export function drawTienDeAwakening(scene,c,e,t,H){
 prepareTienDeArt(scene);const s=tienDeState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,TD.impact/TD.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',dir=v.flip?-1:1,T=s.t;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=tienDeActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3),headY=s.feet-338;
 c.save();setFxPalette(PALETTE);
 if(a.world)c.drawImage(a.world,0,0,900,H);else{c.fillStyle='#3a1a10';c.fillRect(0,0,900,H);}
 drawScreenPulse(c,H,scene.reduceFlash,'#fff0c8',hit*.12);
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false?hit*14+s.bang*12:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 // 12 tia hào quang đế vương sau ngai
 if(T>=TD_RAYS[0]&&s.rays>0){const ox=450,oy=s.feet-560;c.save();c.globalCompositeOperation='lighter';TD_RAYS.forEach((at,i)=>{const g0=clamp((T-at)/.25);if(g0<=0)return;const ang=-Math.PI+(i+.5)/12*Math.PI,len=900*g0*s.rays*(1+.05*Math.sin(T*3+i)),wid=.05;c.globalAlpha=.45*s.fade+(T-at<.3?(1-(T-at)/.3)*.5:0);const gr=c.createLinearGradient(ox,oy,ox+Math.cos(ang)*len,oy+Math.sin(ang)*len);gr.addColorStop(0,'#fff6d0');gr.addColorStop(1,'#ffb84a00');c.fillStyle=gr;c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+Math.cos(ang-wid)*len,oy+Math.sin(ang-wid)*len);c.lineTo(ox+Math.cos(ang+wid)*len,oy+Math.sin(ang+wid)*len);c.closePath();c.fill();});c.restore();
  TD_RAYS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.35){const ang=-Math.PI+(i+.5)/12*Math.PI;halo(c,a.glow,450+Math.cos(ang)*320,s.feet-560+Math.sin(ang)*320,220,220,1-age/.35);}});}
 // ngai vàng trồi lên
 if(s.throne>0&&a.throne){const rise=ease((T-TD.throne)/1.2),y=s.feet+20-640+(1-rise)*640*(1-back(clamp((T-TD.throne)/1.2))*.0);c.save();c.beginPath();c.rect(0,0,900,s.feet+20);c.clip();c.globalAlpha=s.throne;c.drawImage(a.throne,210,y);c.restore();
  const age=T-TD.throne-1;if(age>=0&&age<.6){ring(c,450,s.feet,60+age*900,'#ffd36a',10*(1-age/.6)+1,1-age/.6,(60+age*900)*.25);halo(c,a.glow,450,s.feet-300,700,700,1-age/.6);}}
 // Cửu Đỉnh rơi xuống, bốc lửa
 for(let k=0;k<9;k++){const i=DROP_ORDER[k],at=TD_TRIPODS[k];if(T<at-.35||T>=TD.dark+.4)continue;const pos=tripodPos(s,i),u=clamp((T-at+.35)/.35),y=mix(-200,pos.y,u*u),sz=140,alpha=1-ease((T-TD.dark)/.4);
  if(a.tripod){c.save();c.globalAlpha=alpha;c.drawImage(a.tripod,pos.x-sz/2,y-sz*.62,sz,sz);c.restore();}
  const age=T-at;if(age>=0&&age<.55){ring(c,pos.x,pos.y,30+age*420,'#ffb84a',8*(1-age/.55)+1,1-age/.55,(30+age*420)*.3);halo(c,a.glow,pos.x,pos.y-30,300,220,1-age/.55);}
  if(age>0){const suck=clamp((T-TD_SUCK[k])/.45),flare=pulse(T-TD.kowtow,.8)*.8,h=(70+Math.min(1,age/.3)*60+flare*90)*(1-suck);flame(c,pos.x,y-sz*.62+20,h,alpha*(1-suck*.5),s.clock,i);
   if(suck>0&&suck<1){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-suck)*.9;c.strokeStyle='#ffb84a';c.lineWidth=6;c.beginPath();c.moveTo(pos.x,pos.y-60);c.quadraticCurveTo(mix(pos.x,450,.5),pos.y-260,mix(pos.x,450,ease(suck)),mix(pos.y-60,s.belly,ease(suck)));c.stroke();c.restore();}}}
 // 9 bậc thềm ngọc bay vào từ hai bên
 if(T>=TD_STEPS[0]-.3&&s.steps>0)for(let i=0;i<9;i++){const at=TD_STEPS[i],u=clamp((T-at+.3)/.3);if(u<=0)continue;const b=stepBox(s,i),off=(1-back(u))*(i%2?1:-1)*900;c.save();c.globalAlpha=s.steps*.94;c.translate(off,0);
  const top=c.createLinearGradient(0,b.y0,0,b.y1);top.addColorStop(0,'#fffaf0');top.addColorStop(1,'#e8dcc0');c.fillStyle=top;c.beginPath();c.moveTo(450-b.w0,b.y0);c.lineTo(450+b.w0,b.y0);c.lineTo(450+b.w1,b.y1-14);c.lineTo(450-b.w1,b.y1-14);c.closePath();c.fill();
  c.fillStyle='#c8a25a';c.fillRect(450-b.w1,b.y1-14,b.w1*2,14);c.strokeStyle='#ffd36a';c.lineWidth=3;c.beginPath();c.moveTo(450-b.w1,b.y1-14);c.lineTo(450+b.w1,b.y1-14);c.stroke();c.restore();
  const age=T-at;if(age>=0&&age<.45){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=1-age/.45;c.strokeStyle='#fff0b0';c.lineWidth=10*(1-age/.45)+2;c.beginPath();c.moveTo(450-b.w1-age*400,b.y1-14);c.lineTo(450+b.w1+age*400,b.y1-14);c.stroke();c.restore();halo(c,a.glow,450,b.y1-14,b.w1*3,120,1-age/.45);}}
 // thiên binh giáng bằng cột sáng rồi quỳ bái
 if(T>=TD.army-.3&&s.army>0){const rows=armyRows(s,light);for(const r of rows){const landK=clamp((T-r.land)/.15);if(T>=r.land-.3&&T<r.land+.35){const k=clamp((T-r.land+.3)/.3),fade=1-clamp((T-r.land)/.35),cx=(r.from+r.to)/2,w=(r.to-r.from)*.6;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=fade;const g=c.createLinearGradient(0,0,0,r.y);g.addColorStop(0,'#fff6d000');g.addColorStop(1,'#fff6d0');c.fillStyle=g;c.fillRect(cx-w/2,mix(-100,0,k),w,r.y*k);c.restore();if(T>=r.land)halo(c,a.glow,cx,r.y-40,w*1.6,160,fade);}
   if(landK<=0)continue;const wave=TD_BOWS[3-r.d],bow=ease((T-wave)/.25)*.55+(pulse(T-TD_BOWS[4],.45)+pulse(T-TD_BOWS[5],.45))*.6+s.deep*.6;
   for(let j=0;j<r.n;j++){const x=mix(r.from,r.to,(j+.5)/r.n);soldier(c,x,r.y,r.sc,bow,r.side,landK*s.army);}
   const bx=r.side<0?r.from-6:r.to+6;if(bx>8&&bx<892){const un=ease((T-r.land)/.5);c.save();c.globalAlpha=s.army;c.strokeStyle='#c8a25a';c.lineWidth=4*r.sc;c.beginPath();c.moveTo(bx,r.y);c.lineTo(bx,r.y-220*r.sc);c.stroke();c.fillStyle='#c41818';c.beginPath();c.moveTo(bx,r.y-215*r.sc);for(let q=0;q<=6;q++){const yy=r.y-215*r.sc+q*130*r.sc*un/6;c.lineTo(bx-r.side*(36+Math.sin(T*5+q+r.d)*6)*r.sc,yy);}c.lineTo(bx,r.y-215*r.sc+130*r.sc*un);c.closePath();c.fill();c.restore();}}}
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 // vụ nổ: ấn vuông xoay nở ra + mưa cánh hoa
 if(s.blast>0){for(let i=0;i<10;i++){const u=clamp((T-TD.impact-i*.07)/1.5);if(u<=0||u>=1)continue;const r=60+ease(u)*1000;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-u)*.9;c.strokeStyle=i%2?'#ff5a3a':'#ffd36a';c.lineWidth=14*(1-u)+2;c.translate(450,s.belly);c.rotate(u*Math.PI/4*(i%2?-1:1));c.strokeRect(-r,-r,r*2,r*2);c.restore();}halo(c,a.glow,450,s.belly,1300,1300,s.bang*.85);}
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 // mũ miện hạ xuống
 if(T>=TD.crown&&T<TD.impact){const u=ease((T-TD.crown)/(TD.crowned-TD.crown)),y=mix(-150,headY,u*u*(1.4-.4*u));crown(c,450,y,1-ease((T-TD.converge)/.6),s.clock);if(T<TD.crowned)halo(c,a.glow,450,y-30,260,260,.6);const age=T-TD.crowned;if(age>=0&&age<.6){ring(c,450,headY-30,40+age*700,'#fff0b0',10*(1-age/.6)+1,1-age/.6);halo(c,a.glow,450,headY-30,600,600,1-age/.6);}}
 // tia hào quang bị hút ngược vào người
 if(s.converge>0&&s.converge<1){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<24;i++){const ang=rnd(i)*TAU,d=(1-((s.converge*3+rnd(i+9))%1))*600;c.globalAlpha=.7;c.fillStyle=i%3?'#ffd36a':'#ff7a4a';c.fillRect(450+Math.cos(ang)*d,s.belly+Math.sin(ang)*d,5,5);}c.restore();halo(c,a.glow,450,s.belly,160+s.converge*200,160+s.converge*200,s.converge);}
 if(s.after>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=s.after*s.fade*.55;c.strokeStyle='#ffd36a';c.lineWidth=3;for(let i=0;i<12;i++){const ang=-Math.PI+(i+.5)/12*Math.PI+Math.sin(T*.8)*.04*dir;c.beginPath();c.moveTo(450+Math.cos(ang)*110,headY+40+Math.sin(ang)*110);c.lineTo(450+Math.cos(ang)*170,headY+40+Math.sin(ang)*170);c.stroke();}c.restore();}
 drawQiCompression(c,kq,origin);
 c.restore();
 // cánh hoa đỏ vàng rơi sau nổ
 if(T>=TD.impact){c.save();const n=light?50:120;for(let i=0;i<n;i++){const u=T-TD.impact-rnd(i)*.8;if(u<0)continue;const x=rnd(i+3)*900+Math.sin(u*2+i)*40,y=-30+u*(180+rnd(i+5)*160);if(y>H)continue;c.globalAlpha=s.fade*.9;c.fillStyle=i%3?'#e8302a':'#ffd36a';c.save();c.translate(x,y);c.rotate(u*3+i);c.beginPath();c.ellipse(0,0,7,3.5,0,0,TAU);c.fill();c.restore();}c.restore();}
 // thánh chỉ trải ra + 4 chữ đóng dấu
 const sy=H*.17;if(s.scroll>0){const w=ease((T-TD.edict)/1)*780,al=s.scroll;c.save();c.globalAlpha=al;const g=c.createLinearGradient(0,sy-110,0,sy+110);g.addColorStop(0,'#f8e6a8');g.addColorStop(1,'#e2bc5a');c.fillStyle=g;c.fillRect(450-w/2,sy-105,w,210);c.strokeStyle='#a01818';c.lineWidth=5;c.strokeRect(450-w/2+14,sy-91,Math.max(0,w-28),182);c.lineWidth=2;c.strokeRect(450-w/2+24,sy-81,Math.max(0,w-48),162);
   for(const x of [450-w/2,450+w/2]){c.fillStyle='#6a1010';c.fillRect(x-14,sy-125,28,250);c.fillStyle='#e0a83a';c.fillRect(x-18,sy-135,36,16);c.fillRect(x-18,sy+119,36,16);}
   c.textAlign='center';c.textBaseline='middle';TD_WORDS.forEach((at,i)=>{if(T<at)return;const u=clamp((T-at)/.16),[txt,dx,dy]=WORDS[i];c.save();c.translate(450+dx,sy+dy);c.scale(mix(2.6,1,u),mix(2.6,1,u));c.globalAlpha=al*u;c.fillStyle='#8a0f0f';c.font='900 62px "Times New Roman", serif';c.fillText(txt,0,0);c.restore();});c.restore();
  TD_WORDS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.45){const [,dx,dy]=WORDS[i];ring(c,450+dx,sy+dy,40+age*500,'#ffd36a',8*(1-age/.45)+1,1-age/.45);}});
  if(T>=TD.stamp)imprint(c,450,sy,al);}
 // ngọc tỷ giáng xuống đóng ấn
 if(T>=TD.seal&&T<TD.stamp+.8){const hover=ease((T-TD.seal)/.8),y=T<TD.stamp-.12?mix(-100,sy-150,hover)+Math.sin(T*6)*6:T<TD.stamp?mix(sy-150,sy+90,(T-TD.stamp+.12)/.12):mix(sy+90,sy-260,ease((T-TD.stamp)/.6));seal(c,450,y,T<TD.stamp?1:1-ease((T-TD.stamp)/.7));if(T<TD.stamp)halo(c,a.glow,450,y-120,420,420,.5*hover);}
 {const age=T-TD.stamp;if(age>=0&&age<.9){drawScreenPulse(c,H,scene.reduceFlash,'#ffffff',(1-age/.9)*.5);ring(c,450,sy,90+age*1200,'#ff5a3a',14*(1-age/.9)+2,1-age/.9);ring(c,450,sy,60+age*800,'#ffd36a',8*(1-age/.9)+1,1-age/.9);}}
 // thánh chỉ tan thành chữ vàng rơi
 if(T>=TD.dissolve&&T<TD.dissolve+2){const u=(T-TD.dissolve)/2;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?40:90);i++){const x=450+(rnd(i)-.5)*780,y=sy+(rnd(i+1)-.5)*200+u*u*900*(.5+rnd(i+2));c.globalAlpha=(1-u)*.9;c.fillStyle=i%4?'#ffd36a':'#ff5a3a';c.fillRect(x,y,4,4);}c.restore();}
 // chữ lớn: VẠN TIÊN TRIỀU BÁI / VẠN TUẾ
 const banner=(txt,at,len,y,size,col)=>{const age=T-at;if(age<0||age>len)return;const u=clamp(age/.15),f=1-clamp((age-len+.3)/.3);c.save();c.textAlign='center';c.textBaseline='middle';c.globalAlpha=f;c.translate(450,y);c.scale(mix(1.8,1,u),mix(1.8,1,u));c.font='900 '+size+'px "Times New Roman", serif';c.lineWidth=8;c.strokeStyle='#3a0806';c.strokeText(txt,0,0);c.fillStyle=col;c.fillText(txt,0,0);c.restore();};
 banner('VẠN TIÊN TRIỀU BÁI',TD_BOWS[4],1.5,H*.2,64,'#ffd36a');TD_CHEERS.forEach((at,i)=>banner('VẠN TUẾ',at,i<2?.45:.8,H*.17+i*0,72+i*14,i===2?'#fff0b0':'#ffd36a'));
 // cổng Nam Thiên Môn
 if(s.gate>0){const op=1-s.gate,wl=450*(1-op*.96);const knocks=TD_KNOCKS.filter(x=>T>=x).length;
  if(op>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,op*3)*(1-clamp((T-TD.opened)/.4));const g=c.createLinearGradient(wl,0,900-wl,0);g.addColorStop(0,'#fff6d000');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#fff6d000');c.fillStyle=g;c.fillRect(wl-60,0,900-2*wl+120,H);c.restore();}
  if(a.leafL)c.drawImage(a.leafL,0,0,wl,H);if(a.leafR)c.drawImage(a.leafR,900-wl,0,wl,H);c.save();c.globalAlpha=op*.6;c.fillStyle='#000';c.fillRect(0,0,wl,H);c.fillRect(900-wl,0,wl,H);c.restore();
  if(op<.05){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.2+knocks*.25;c.fillStyle='#fff0b0';c.fillRect(444,0,12,H);c.restore();}
  TD_KNOCKS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.5){const k=1-age/.5;for(const x of [380,520]){ring(c,x,H*.52+20,40+age*500,'#ffd36a',10*k+1,k);}halo(c,a.glow,450,H*.52,700,700,k*.8);drawScreenPulse(c,H,scene.reduceFlash,'#ffb84a',k*.15);}});
  c.save();c.globalAlpha=s.gate;const py=H*.1-(1-s.gate)*200;c.fillStyle='#10204a';c.fillRect(250,py-55,400,110);c.strokeStyle='#e8b84a';c.lineWidth=8;c.strokeRect(250,py-55,400,110);c.fillStyle='#ffd77a';c.textAlign='center';c.textBaseline='middle';c.font='900 58px "Times New Roman", serif';c.fillText('NAM THIÊN MÔN',450,py+2,370);c.restore();}
 {const age=T-TD.open;if(age>=0&&age<1.2)drawScreenPulse(c,H,scene.reduceFlash,'#ffffff',(1-age/1.2)*.55);}
 // ánh sáng bị hút sạch trước nổ
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.93;c.fillStyle='#000000';c.fillRect(0,0,900,H);c.restore();halo(c,a.glow,450,s.belly,90,90,s.dark);}
 drawQiMotes(scene,c,kq,H);if(a.vignette)c.drawImage(a.vignette,0,0,900,H);c.restore();
 const phase=s.revealed?'reveal':T<TD.opened?'gate':T<TD.army?'stairs':T<TD.tripods?'army':T<TD.edict?'tripods':T<TD.seal?'edict':T<TD.throne?'seal':T<TD.crown?'throne':T<TD.kowtow?'crown':T<TD.dark?'kowtow':'void';
 const ui={k:s.k,realm:13,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#ffe7a8',title:'Tiên Đế',subtitle:'Vạn Tiên Triều Bái',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff4dc';c.fillText(ui.name,450,H*.06);if(s.revealed){c.font='700 44px Arial';c.fillText('TIÊN ĐẾ',450,H*.1);}}
 return ui;
}
