// Ma Thần v1 — Ma Thần Giáng Thế (08/11/2026). 46 s; nổ 40,0; đổi skin 40,3.
// Cơ chế riêng (không lặp Tiên Đế/Đại La): huyết nguyệt mọc rồi nhật thực → đất nứt thành phù văn dung nham, đập 6 nhịp tim →
// 9 xích ma từ vực trói người → mặt quỷ thần hiện trên trời, mở mắt, gầm, giáng 4 lôi đỏ → giật đứt 9 xích →
// hắc kích rơi từ trăng cắm xuống đất → 12 mảnh giáp obsidian bay lên quay quanh rồi ốp vào thân → sừng ma mọc →
// mặt quỷ lao vào thân, dung nham bị hút ngược về → tối sập, tim ngừng → nổ đỏ đen, trời vỡ như kính, hiện thân, tro lửa bay lên.
// Toàn bộ vẽ bằng Canvas (không cần ảnh nền riêng). Không phủ trắng mặt nhân vật; sừng ở trên đầu, không che mặt.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
export const MT=Object.freeze({duration:46,moon:.3,eclipse:2.6,cracks:4.0,chains:10.5,bound:14.4,face:14.8,eyes:17.0,roar:18.0,snap:21.0,freed:25.6,halberd:26.2,plant:27.4,shards:28.0,armor:31.2,horns:31.5,horned:33.2,dive:34.5,absorbed:35.8,converge:36.5,dark:39.4,impact:40.0,reveal:40.3,fade:44.5});
export const MT_BEATS=Object.freeze(Array.from({length:6},(_,i)=>4.5+i*1.0));
export const MT_CHAINS=Object.freeze(Array.from({length:9},(_,i)=>10.5+i*.45));
export const MT_BOLTS=Object.freeze(Array.from({length:4},(_,i)=>18.4+i*.5));
export const MT_SNAPS=Object.freeze(Array.from({length:9},(_,i)=>21.0+i*.55));
export const MT_SHARDS=Object.freeze(Array.from({length:12},(_,i)=>28.0+i*.25));
export const MA_THAN_DURATION=46000,MA_THAN_REVEAL=MT.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len=.5)=>age<0||age>len?0:Math.sin(age/len*Math.PI);
const PALETTE={main:'#ff3a2a',main2:'#8a0a18',soft:'#ffd2c0',gold:'#ff8a3a'};
const LAVA='#ff4a1a',LAVA2='#ffb04a',BLOOD='#c8102a';
export function maThanState(k,H=1600,motion=true){
 const t=clamp(k)*MT.duration,feet=H*.74;
 return {k:clamp(k),t,H,motion,clock:motion?t:0,feet,belly:feet-145,head:feet-338,revealed:t>=MT.reveal,
  night:ease((t-MT.moon)/2.4),moonRise:ease((t-MT.moon)/2.2),eclipse:ease((t-MT.eclipse)/1.4)*(1-ease((t-MT.reveal)/2)),
  cracks:ease((t-MT.cracks)/1.2)*(1-ease((t-MT.converge)/2.8)),bound:t>=MT.chains&&t<MT.freed+.6,
  face:ease((t-MT.face)/2)*(1-ease((t-MT.dive)/1.3)),eyes:ease((t-MT.eyes)/.5),roar:pulse(t-MT.roar,2.2),
  dive:clamp((t-MT.dive)/(MT.absorbed-MT.dive)),converge:clamp((t-MT.converge)/(MT.dark-MT.converge)),
  dark:ease((t-MT.dark)/.5)*(1-ease((t-MT.impact)/.12)),blast:t>=MT.impact?1-ease((t-MT.impact)/3.2):0,bang:pulse(t-MT.impact,.9),
  after:ease((t-MT.reveal)/1.2),fade:1-ease((t-MT.fade)/1.4)};
}
export function maThanHits(){return [...MT_BEATS.map((a,i)=>[a,.5+i*.08]),...MT_CHAINS.map(a=>[a,.7]),[MT.eyes,1.1],[MT.roar,2],...MT_BOLTS.map(a=>[a,1.2]),...MT_SNAPS.map((a,i)=>[a,.9+i*.06]),[MT.plant,2.2],...MT_SHARDS.map(a=>[a,.35]),[MT.armor,1.3],[MT.horned,1.4],[MT.absorbed,1.6],[MT.impact,2.6]];}
function hitPower(t){let p=0;for(const [a,f] of maThanHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
// Tài nguyên tĩnh vẽ một lần (nửa độ phân giải cho vùng tô lớn).
function assets(scene,H){
 const cache=scene.maThanAssets;if(cache?.H===H)return cache;
 const sky=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0206');g.addColorStop(.35,'#2a060c');g.addColorStop(.62,'#4a0a10');g.addColorStop(.74,'#1a0408');g.addColorStop(1,'#060104');c.fillStyle=g;c.fillRect(0,0,900,H);
  // núi đá đen xa, viền đỏ
  for(let layer=0;layer<3;layer++){const base=H*(.6+layer*.05);c.beginPath();c.moveTo(0,H);c.lineTo(0,base);for(let x=0;x<=900;x+=30){const y=base-60-layer*-15-Math.abs(Math.sin(x*.011+layer*2.1))*120*(1-layer*.25)-rnd(x+layer*999)*40;c.lineTo(x,y);}c.lineTo(900,H);c.closePath();c.fillStyle=['#14040a','#0e0306','#080204'][layer];c.fill();c.strokeStyle=['#7a1018','#5a0a12','#3a060c'][layer];c.lineWidth=2;c.stroke();}});
 const ground=surface(900,H*.4,c=>{const g=c.createLinearGradient(0,0,0,H*.4);g.addColorStop(0,'#1a0508');g.addColorStop(1,'#050102');c.fillStyle=g;c.fillRect(0,0,900,H*.4);
  // mặt đá obsidian: vân phản chiếu
  c.globalAlpha=.25;for(let i=0;i<40;i++){c.strokeStyle=i%3?'#3a0c12':'#5a1820';c.lineWidth=1+rnd(i)*2;c.beginPath();const y=rnd(i+7)*H*.4,x=rnd(i+3)*900;c.moveTo(x-80,y);c.lineTo(x+80,y+rnd(i+11)*10-5);c.stroke();}});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#ffd0b0c0');g.addColorStop(.5,'#ff3a2a40');g.addColorStop(1,'#ff3a2a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#05000000');g.addColorStop(.55,'#05000000');g.addColorStop(1,'#050000e8');c.fillStyle=g;c.fillRect(0,0,900,H);});
 // vết nứt dung nham: cây nhánh xác định từ chân nhân vật, lưu dạng đoạn thẳng có "độ xa" để vẽ lan dần
 const feet=H*.74,cracks=[];
 const grow=(x,y,ang,len,depth,dist,seed)=>{let px=x,py=y;const steps=6+Math.floor(rnd(seed)*4);for(let i=0;i<steps;i++){const a=ang+(rnd(seed+i*13)-.5)*.7,l=len/steps,nx=px+Math.cos(a)*l,ny=py+Math.sin(a)*l*(Math.sin(a)<0?.05:.42);cracks.push({x0:px,y0:py,x1:nx,y1:ny,d0:dist,d1:dist+l,w:Math.max(1.2,5-depth*1.4)});dist+=l;px=nx;py=ny;
   if(depth<2&&rnd(seed+i*7)<.28)grow(px,py,a+(rnd(seed+i)>.5?.6:-.6),len*.45,depth+1,dist,seed*3+i);}};
 for(let i=0;i<12;i++){const ang=i/12*TAU+rnd(i)*.3;grow(450,feet+6,ang,420+rnd(i+5)*260,0,0,i*31+7);}
 const maxD=Math.max(...cracks.map(s=>s.d1));
 const out={H,sky,ground,glow,vignette,cracks,maxD};scene.maThanAssets=out;return out;
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,0,0,TAU);c.stroke();c.restore();}
function flash(c,H,col,a){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.fillStyle=col;c.fillRect(0,0,900,H);c.restore();}
function bolt(c,x0,y0,x1,y1,seed,col,w,a){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);for(let i=1;i<=12;i++){const u=i/12,j=(rnd(seed+i)-.5)*80*Math.sin(u*Math.PI);c.lineTo(mix(x0,x1,u)+j,mix(y0,y1,u));}c.stroke();c.lineWidth=w*.35;c.strokeStyle='#ffffff';c.stroke();c.restore();}
// Nhân vật: ảnh vẽ một lần cho mỗi ngoại hình (trước/sau), giữ ngoại hình cũ tới lúc nổ.
export function maThanActorImage(scene,p,e){
 if(scene.maThanActor?.event!==e)scene.maThanActor={event:e,frames:new Map()};const cache=scene.maThanActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'ma-than-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}cache.set(p,im);return im;}
const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:21}),to:structuredClone(e.visualTo||{...live,realm:22})};snapshots.set(e,pair);return pair;}
// Huyết nguyệt + nhật thực (vòng hào quang đen đỏ).
function drawMoon(c,a,s,mx,my){if(s.moonRise<=0)return;const y=mix(my+260,my,s.moonRise),r=118;
 halo(c,a.glow,mx,y,r*6,r*6,.55*s.moonRise*(1-s.eclipse*.4));c.save();c.globalAlpha=s.moonRise;const g=c.createRadialGradient(mx-30,y-30,10,mx,y,r);g.addColorStop(0,'#ff8a6a');g.addColorStop(.6,BLOOD);g.addColorStop(1,'#5a0610');c.fillStyle=g;c.beginPath();c.arc(mx,y,r,0,TAU);c.fill();
 // vết loang trên mặt trăng
 c.globalAlpha=s.moonRise*.35;c.fillStyle='#3a0208';for(let i=0;i<6;i++){c.beginPath();c.arc(mx+(rnd(i)-.5)*150,y+(rnd(i+4)-.5)*150,10+rnd(i+8)*22,0,TAU);c.fill();}c.restore();
 if(s.eclipse>0){c.save();c.fillStyle='#050103';c.beginPath();c.arc(mix(mx+2*r,mx,s.eclipse),y,r*.98,0,TAU);c.fill();if(s.eclipse>.9){c.globalCompositeOperation='lighter';c.globalAlpha=(s.eclipse-.9)*10*.9;c.strokeStyle='#ff5a3a';c.lineWidth=6;c.beginPath();c.arc(mx,y,r+4,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle='#ffd0a0';c.stroke();
  for(let i=0;i<24;i++){const ang=i/24*TAU+s.clock*.05,l=20+rnd(i)*50;c.globalAlpha=(s.eclipse-.9)*10*.5;c.beginPath();c.moveTo(mx+Math.cos(ang)*(r+6),y+Math.sin(ang)*(r+6));c.lineTo(mx+Math.cos(ang)*(r+6+l),y+Math.sin(ang)*(r+6+l));c.stroke();}}c.restore();}
}
// Sương máu trôi ngang (ít, alpha thấp).
function drawMist(c,s,H){const a=s.night*.35*(1-s.dark);if(a<=0)return;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=H*(.42+i*.06),x=((s.clock*(14+i*5)+rnd(i)*900)%1300)-200;const g=c.createRadialGradient(x,y,0,x,y,260);g.addColorStop(0,'#8a0a1855');g.addColorStop(1,'#8a0a1800');c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-260,y-110,520,220);}c.restore();}
// Vết nứt dung nham + phù văn, nhịp tim làm sáng bừng.
function drawCracks(c,a,s,heart,retract){if(s.cracks<=0)return;const reach=s.cracks*a.maxD*(1-retract),glowK=.55+heart*.45;
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(const pass of [0,1]){c.strokeStyle=pass?LAVA2:LAVA;c.globalAlpha=(pass?.75:.35)*glowK;for(const sg of a.cracks){if(sg.d0>=reach)continue;const u=clamp((reach-sg.d0)/(sg.d1-sg.d0));c.lineWidth=pass?sg.w:sg.w*4;c.beginPath();c.moveTo(sg.x0,sg.y0);c.lineTo(mix(sg.x0,sg.x1,u),mix(sg.y0,sg.y1,u));c.stroke();}}
 // phù văn nhỏ dọc vết nứt
 c.globalAlpha=.8*glowK;c.strokeStyle=LAVA2;c.lineWidth=1.6;for(let i=0;i<a.cracks.length;i+=7){const sg=a.cracks[i];if(sg.d1>reach)continue;const x=sg.x1,y=sg.y1,sz=7;c.beginPath();c.moveTo(x-sz,y);c.lineTo(x,y-sz);c.lineTo(x+sz,y);c.moveTo(x,y-sz);c.lineTo(x,y+sz*.6);c.stroke();}
 c.restore();}
// Xích ma: chuỗi mắt xích từ mép màn/vực tới thân; đứt → hai nửa văng ra.
function chainAnchor(i,s){const side=i%2?1:-1,row=Math.floor(i/2);return i===8?{x:450,y:s.H+40}:{x:450+side*(520+row*30),y:s.feet-420+row*190};}
function chainTarget(i,s){const pts=[[-38,-210],[38,-210],[-50,-130],[50,-130],[-44,-60],[44,-60],[-30,10],[30,10],[0,-100]];const [dx,dy]=pts[i];return {x:450+dx,y:s.feet+dy};}
function drawChain(c,x0,y0,x1,y1,u,sag,seed,alpha,col='#6a6a78'){const n=Math.max(2,Math.floor(Math.hypot(x1-x0,y1-y0)*u/26));c.save();c.globalAlpha=alpha;for(let i=0;i<n;i++){const k=i/n*u,x=mix(x0,x1,k),y=mix(y0,y1,k)+Math.sin(k*Math.PI)*sag,ang=Math.atan2(y1-y0,x1-x0);c.save();c.translate(x,y);c.rotate(ang);c.lineWidth=9;c.strokeStyle='#050506';c.beginPath();c.ellipse(0,0,16,i%2?5:9,0,0,TAU);c.stroke();c.lineWidth=5;c.strokeStyle=col;c.stroke();c.globalCompositeOperation='lighter';c.lineWidth=2;c.strokeStyle='#ff4a2a';c.globalAlpha=alpha*.85;c.stroke();c.globalCompositeOperation='source-over';c.globalAlpha=alpha;c.restore();}c.restore();}
function drawChains(c,a,s,T){if(T<MT.chains)return;for(let i=0;i<9;i++){const at=MT_CHAINS[i],snapAt=MT_SNAPS[i];if(T<at)continue;const A=chainAnchor(i,s),B=chainTarget(i,s),u=back(clamp((T-at)/.28));
  if(T<snapAt){const tight=clamp((T-at-.28)/.3),strain=T>MT.bound?Math.sin(T*30+i)*3*clamp((T-MT.bound)/2):0;drawChain(c,A.x,A.y,B.x+strain,B.y,Math.min(1,u),(1-tight)*60,i,1);
   if(T-at<.35)halo(c,a.glow,B.x,B.y,160,160,1-(T-at)/.35);}
  else{const age=T-snapAt;if(age>1.4)continue;const fly=age*age*900,f=1-age/1.4,mx=mix(A.x,B.x,.5),my=mix(A.y,B.y,.5);
   drawChain(c,A.x,A.y,mix(mx,A.x,.0)-(B.x-A.x)*.0,my+fly*.3,.5,30+fly*.2,i,f);drawChain(c,B.x+(A.x-B.x)*age*.6,B.y-age*120+fly*.4,mx+(A.x-B.x)*age*.8,my+fly*.5,1,20,i+50,f*.8);
   if(age<.4){ring(c,B.x,B.y,20+age*500,'#ff6a3a',8*(1-age/.4)+1,1-age/.4);halo(c,a.glow,B.x,B.y,300,300,1-age/.4);}
   for(let j=0;j<10;j++){const ang=rnd(i*17+j)*TAU,d=age*(200+rnd(j+i)*300);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=f;c.fillStyle=j%2?'#ff8a3a':'#ffd0a0';c.fillRect(B.x+Math.cos(ang)*d,B.y+Math.sin(ang)*d+age*age*400,4,4);c.restore();}}}}
// Mặt quỷ thần trên trời: khối khói đen viền đỏ, sừng cong, hai mắt đỏ, miệng mở khi gầm. Lao vào thân khi dive.
function drawDemonFace(c,a,s,T,dir){const vis=s.face>0?s.face:0;if(vis<=0&&s.dive<=0)return;const d=ease(s.dive);let cx=450,cy=s.H*.3,sc=1;
 if(s.dive>0){cx=450;cy=mix(s.H*.3,s.belly,d*d);sc=mix(1,.12,d);}
 const roar=s.roar,shake=roar*8;c.save();c.translate(cx+Math.sin(T*47)*shake,cy+Math.cos(T*39)*shake*.6);c.scale(sc*(1+roar*.06),sc*(1+roar*.06));
 const alpha=s.dive>0?1-d*.4:vis;c.globalAlpha=alpha*.92;
 // đầu: khối khói
 const g=c.createRadialGradient(0,20,40,0,20,330);g.addColorStop(0,'#1a0408');g.addColorStop(.7,'#0a0204e0');g.addColorStop(1,'#0a020400');c.fillStyle=g;c.beginPath();c.ellipse(0,20,300,330,0,0,TAU);c.fill();
 // sừng
 for(const side of [-1,1]){c.save();c.scale(side,1);c.beginPath();c.moveTo(120,-150);c.bezierCurveTo(220,-260,330,-250,360,-380);c.bezierCurveTo(300,-300,220,-260,160,-110);c.closePath();c.fillStyle='#120306';c.fill();c.strokeStyle='#ff3a2a';c.lineWidth=3;c.globalAlpha=alpha*.8;c.stroke();c.globalAlpha=alpha*.92;c.restore();}
 // gò má, chân mày (đường viền đỏ)
 c.strokeStyle='#c8102a';c.lineWidth=5;c.globalAlpha=alpha*.85;for(const side of [-1,1]){c.beginPath();c.moveTo(side*40,-70);c.quadraticCurveTo(side*120,-110,side*190,-60);c.stroke();c.beginPath();c.moveTo(side*170,10);c.quadraticCurveTo(side*120,90,side*60,120);c.stroke();}
 // mắt
 if(s.eyes>0){c.save();c.globalCompositeOperation='lighter';for(const side of [-1,1]){const ex=side*105,ey=-30;c.globalAlpha=alpha*s.eyes;const eg=c.createRadialGradient(ex,ey,0,ex,ey,60);eg.addColorStop(0,'#ffffff');eg.addColorStop(.25,'#ff6a3a');eg.addColorStop(1,'#ff1a1a00');c.fillStyle=eg;c.beginPath();c.ellipse(ex,ey,60,26*s.eyes+2,side*.15,0,TAU);c.fill();}c.restore();}
 // miệng: mở theo tiếng gầm
 const open=roar*70+6;c.fillStyle='#000';c.globalAlpha=alpha;c.beginPath();c.moveTo(-90,130);c.quadraticCurveTo(0,130+open*2,90,130);c.quadraticCurveTo(0,130+open*.4,-90,130);c.fill();
 if(roar>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=roar*.8;c.fillStyle='#ff3a1a';c.beginPath();c.ellipse(0,140+open*.7,70,open*.6,0,0,TAU);c.fill();c.restore();
  for(let i=0;i<3;i++){const R=((T-MT.roar)*700+i*120)%700;ring(c,0,140,R,'#ff5a3a',6,roar*(1-R/700),R*.5);}}
 // nanh
 c.fillStyle='#e8d8c8';c.globalAlpha=alpha*.9;for(const side of [-1,1]){c.beginPath();c.moveTo(side*60,130);c.lineTo(side*48,130+30+roar*30);c.lineTo(side*36,130);c.closePath();c.fill();}
 c.restore();}
// Hắc kích: cán đen dài, lưỡi trăng khuyết + mũi giáo, phù văn đỏ.
function drawHalberd(c,x,y,len,ang,alpha,glowK){c.save();c.translate(x,y);c.rotate(ang);c.globalAlpha=alpha;
 c.fillStyle='#0c0c10';c.fillRect(-7,-len*.5,14,len);c.strokeStyle='#ff3a2a';c.lineWidth=2.5;c.strokeRect(-7,-len*.5,14,len);
 // mũi giáo
 c.beginPath();c.moveTo(0,-len*.5-90);c.lineTo(14,-len*.5);c.lineTo(-14,-len*.5);c.closePath();c.fillStyle='#16161c';c.fill();c.strokeStyle='#ff3a2a';c.lineWidth=2.5;c.stroke();
 // lưỡi trăng khuyết
 c.beginPath();c.moveTo(6,-len*.5+10);c.bezierCurveTo(110,-len*.5-10,120,-len*.5+120,8,-len*.5+130);c.bezierCurveTo(70,-len*.5+90,70,-len*.5+30,6,-len*.5+10);c.fillStyle='#16161c';c.fill();c.stroke();
 // phù văn đỏ trên cán
 c.globalCompositeOperation='lighter';c.globalAlpha=alpha*glowK;c.strokeStyle='#ff5a2a';c.lineWidth=2;for(let i=0;i<7;i++){const yy=-len*.35+i*len*.1;c.beginPath();c.moveTo(-4,yy);c.lineTo(4,yy+8);c.moveTo(4,yy);c.lineTo(-4,yy+8);c.stroke();}
 c.restore();}
// Mảnh giáp obsidian: tam giác đen viền đỏ, bay lên từ đất, quay quanh thân rồi ốp vào.
function shardPos(i,s,T){const at=MT_SHARDS[i],rise=back(clamp((T-at)/.5)),orbitAng=i/12*TAU+(T-MT.shards)*1.6,R=230-12*Math.sin(i),cx=450,cy=s.feet-200;
 const ox=cx+Math.cos(orbitAng)*R,oy=cy+Math.sin(orbitAng)*R*.35,gx=450+(rnd(i)-.5)*600,gy=s.feet+30;let x=mix(gx,ox,rise),y=mix(gy,oy,rise);
 const lock=clamp((T-MT.armor+.6)/.6);if(lock>0){const tx=450+(rnd(i+3)-.5)*90,ty=s.feet-80-rnd(i+9)*200;x=mix(x,tx,ease(lock));y=mix(y,ty,ease(lock));}return {x,y,rot:orbitAng*2+i,lock};}
function drawShards(c,a,s,T){if(T<MT.shards||T>MT.armor+.6)return;for(let i=0;i<12;i++){if(T<MT_SHARDS[i])continue;const p=shardPos(i,s,T),sz=40+rnd(i)*22,alpha=1-ease(p.lock*1.4-.4);c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.globalAlpha=alpha;c.beginPath();c.moveTo(0,-sz);c.lineTo(sz*.7,sz*.6);c.lineTo(-sz*.7,sz*.6);c.closePath();c.fillStyle='#0a0a0e';c.fill();c.strokeStyle='#ff3a2a';c.lineWidth=4;c.stroke();c.globalCompositeOperation='lighter';c.globalAlpha=alpha*.85;c.strokeStyle='#ffb04a';c.lineWidth=2;c.stroke();c.lineWidth=2;c.beginPath();c.moveTo(0,-sz*.5);c.lineTo(0,sz*.3);c.stroke();c.restore();
  const age=T-MT_SHARDS[i];if(age<.3)halo(c,a.glow,p.x,p.y,120,120,1-age/.3);}
 const age=T-MT.armor;if(age>=0&&age<.6){ring(c,450,s.feet-160,60+age*800,'#ff5a3a',10*(1-age/.6)+1,1-age/.6,(60+age*800)*.5);halo(c,a.glow,450,s.feet-160,600,600,(1-age/.6)*.8);}}
// Sừng ma trên đầu (không che mặt): hai sừng cong đen viền dung nham, mọc dần.
function drawHorns(c,a,s,T){const grow=ease((T-MT.horns)/(MT.horned-MT.horns));if(grow<=0||T>=MT.impact)return;const hx=450,hy=s.head-38,fade=1-ease((T-MT.converge)/1.5)*.6;
 for(const side of [-1,1]){c.save();c.translate(hx+side*34,hy);c.scale(side,1);c.globalAlpha=fade;const L=170*grow;c.beginPath();c.moveTo(-16,10);c.bezierCurveTo(4,-L*.4,L*.6,-L*.72,L*.55,-L);c.bezierCurveTo(L*.28,-L*.58,14,-L*.28,16,6);c.closePath();c.fillStyle='#0c0306';c.fill();c.strokeStyle='#ff4a1a';c.lineWidth=5;c.stroke();c.globalCompositeOperation='lighter';c.globalAlpha=fade*.9;c.strokeStyle='#ffb04a';c.lineWidth=2;c.stroke();c.restore();}
 const age=T-MT.horned;if(age>=0&&age<.6){ring(c,hx,hy-110,30+age*420,'#ff6a3a',8*(1-age/.6)+1,1-age/.6,(30+age*420)*.6);halo(c,a.glow,hx,hy-130,240,200,(1-age/.6)*.8);}}
// Trời vỡ như kính lúc nổ: tia nứt toả từ tâm, mảnh rơi.
function drawShatter(c,s,T,H){const age=T-MT.impact;if(age<0||age>2.4)return;const f=1-age/2.4,cx=450,cy=s.belly;c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';
 for(let i=0;i<18;i++){const ang=i/18*TAU+rnd(i)*.2,len=Math.min(1,age*3)*(700+rnd(i+3)*500);c.globalAlpha=f*.9;c.strokeStyle=i%3?'#ff5a3a':'#ffe0c8';c.lineWidth=3;c.beginPath();let x=cx,y=cy;c.moveTo(x,y);for(let j=1;j<=6;j++){const u=j/6;x=cx+Math.cos(ang+(rnd(i*7+j)-.5)*.2)*len*u;y=cy+Math.sin(ang+(rnd(i*7+j)-.5)*.2)*len*u;c.lineTo(x,y);}c.stroke();}
 for(let i=0;i<26;i++){const ang=rnd(i+40)*TAU,d=age*(300+rnd(i)*600),x=cx+Math.cos(ang)*d,y=cy+Math.sin(ang)*d+age*age*500,sz=10+rnd(i+2)*22;c.globalAlpha=f;c.fillStyle=i%2?'#2a0408':'#ff5a3a';c.save();c.translate(x,y);c.rotate(age*4+i);c.beginPath();c.moveTo(0,-sz);c.lineTo(sz*.8,sz*.5);c.lineTo(-sz*.6,sz*.7);c.closePath();c.fill();c.restore();}
 c.restore();}
// Vòng phù văn dung nham dưới chân sau hiện thân.
function drawSigil(c,a,s){const k=s.after*s.fade;if(k<=0)return;const cx=450,cy=s.feet+8,R=250;c.save();c.globalCompositeOperation='lighter';c.translate(cx,cy);c.scale(1,.3);
 for(const [r,w,al] of [[R,5,.8],[R*.82,2.5,.6],[R*1.12,2,.4]]){c.globalAlpha=k*al;c.strokeStyle=r===R?LAVA:LAVA2;c.lineWidth=w;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
 c.rotate(s.clock*.25);c.strokeStyle=LAVA2;c.lineWidth=3;c.globalAlpha=k*.85;for(let i=0;i<16;i++){c.save();c.rotate(i/16*TAU);c.translate(R*.91,0);c.beginPath();c.moveTo(-9,-12);c.lineTo(0,0);c.lineTo(9,-12);c.moveTo(0,0);c.lineTo(0,14);c.stroke();c.restore();}
 c.restore();halo(c,a.glow,cx,cy,640,180,k*.5);}
// Tro lửa bay lên sau hiện thân.
function drawEmbers(c,s,H,light){if(s.after<=0)return;const n=light?24:60;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const u=((s.clock*.12+rnd(i))%1),x=450+(rnd(i+5)-.5)*760+Math.sin(s.clock*1.3+i)*20,y=s.feet+40-u*H*.75;c.globalAlpha=s.after*s.fade*(1-u)*.9;c.fillStyle=i%3?'#ff6a2a':'#ffd0a0';c.fillRect(x,y,3+rnd(i)*3,3+rnd(i)*3);}c.restore();}
export function drawMaThanAwakening(scene,c,e,t,H){
 const s=maThanState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,MT.impact/MT.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',dir=v.flip?-1:1,T=s.t;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 const heart=MT_BEATS.reduce((m,at)=>Math.max(m,pulse(T-at,.45)),0),retract=clamp((T-MT.converge)/(MT.dark-MT.converge));
 const moonX=450+dir*150,moonY=H*.15;
 c.save();setFxPalette(PALETTE);
 // trời: chuyển từ nền thường sang đêm máu
 if(a.sky)c.drawImage(a.sky,0,0,900,H);else{c.fillStyle='#1a0408';c.fillRect(0,0,900,H);}
 c.save();c.globalAlpha=1-s.night;c.fillStyle='#2a1a2a';c.fillRect(0,0,900,H);c.restore();
 drawMoon(c,a,s,moonX,moonY);
 flash(c,H,'#ff3a2a',hit*.1);
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false?hit*14+s.bang*14+s.roar*10:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 drawMist(c,s,H);
 // mặt quỷ thần phía sau nhân vật
 drawDemonFace(c,a,s,T,dir);
 // lôi đỏ từ mặt quỷ giáng xuống quanh nhân vật
 MT_BOLTS.forEach((at,i)=>{const age=T-at;if(age<0||age>.35)return;const tx=450+(i%2?1:-1)*(120+i*40),ty=s.feet+10;bolt(c,450+(rnd(i)-.5)*160,H*.3+120,tx,ty,i*13+Math.floor(T*20),'#ff3a2a',9,1-age/.35);halo(c,a.glow,tx,ty,420,260,1-age/.35);ring(c,tx,ty,20+age*600,'#ff6a3a',8,1-age/.35,(20+age*600)*.3);});
 // mặt đất obsidian + vết nứt dung nham
 if(a.ground){c.save();c.globalAlpha=s.night;c.drawImage(a.ground,0,s.feet-40,900,H*.4);c.restore();}
 drawCracks(c,a,s,heart,retract);drawSigil(c,a,s);
 MT_BEATS.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.6){ring(c,450,s.feet+6,40+age*700,LAVA,6*(1-age/.6)+1,(1-age/.6)*.8,(40+age*700)*.32);halo(c,a.glow,450,s.feet,500,200,(1-age/.6)*.6);}});
 // hắc kích rơi từ trăng, cắm xuống đất bên cạnh
 if(T>=MT.halberd&&T<MT.impact){const u=clamp((T-MT.halberd)/(MT.plant-MT.halberd)),hx=mix(moonX,450-dir*215,u),hy=mix(moonY,s.feet-150,u*u),spin=(1-u)*TAU*3,planted=T>=MT.plant,fade=1-ease((T-MT.converge)/1.6);
  halo(c,a.glow,hx,hy-60,260,520,fade*(.55+heart*.3));drawHalberd(c,hx,hy,430,planted?-dir*.12:spin,fade,.7+heart*.4+pulse(T-MT.plant,.8));
  if(!planted){halo(c,a.glow,hx,hy,200,200,.7);}else{const age=T-MT.plant;if(age<.8){ring(c,450-dir*215,s.feet+10,30+age*900,'#ff5a3a',12*(1-age/.8)+1,1-age/.8,(30+age*900)*.3);halo(c,a.glow,450-dir*215,s.feet,700,300,1-age/.8);}}}
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 // vụ nổ đỏ đen: vòng xung kích kép
 if(s.blast>0){for(let i=0;i<8;i++){const u=clamp((T-MT.impact-i*.08)/1.6);if(u<=0||u>=1)continue;ring(c,450,s.belly,60+ease(u)*1100,i%2?'#ff2a1a':'#ffb04a',16*(1-u)+2,(1-u)*.9,(60+ease(u)*1100)*.55);}halo(c,a.glow,450,s.belly,1300,1300,s.bang*.85);}
 // xích phía sau thân (nửa trên) — vẽ trước nhân vật để mắt xích "quấn" quanh
 drawChains(c,a,s,T);
 // nhân vật (giật khi bị trói)
 const struggle=s.bound&&s.motion?Math.sin(T*40)*3*clamp((T-MT.bound)/1.5):0;
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130+struggle,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 // mắt xích phía trước thân sáng lên khi siết
 if(s.bound&&T>=MT.bound&&T<MT.snap){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.25+.15*Math.sin(T*8);c.strokeStyle='#ff3a2a';c.lineWidth=3;for(let i=0;i<4;i++){const y=s.feet-60-i*55;c.beginPath();c.ellipse(450,y,70,14,0,0,TAU);c.stroke();}c.restore();}
 drawShards(c,a,s,T);
 drawHorns(c,a,s,T);
 // mặt quỷ hoà vào thân
 const absAge=T-MT.absorbed;if(absAge>=0&&absAge<.7){halo(c,a.glow,450,s.belly,700,700,1-absAge/.7);ring(c,450,s.belly,30+absAge*900,'#ff3a2a',12*(1-absAge/.7)+1,1-absAge/.7);}
 // dung nham bị hút ngược về thân
 if(s.converge>0&&s.converge<1){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<32;i++){const ang=rnd(i)*TAU,d=(1-((s.converge*3+rnd(i+9))%1))*620;c.globalAlpha=.75;c.fillStyle=i%3?LAVA:LAVA2;c.fillRect(450+Math.cos(ang)*d,s.belly+Math.sin(ang)*d*.6,5,5);}c.restore();halo(c,a.glow,450,s.belly,160+s.converge*240,160+s.converge*240,s.converge);}
 drawQiCompression(c,kq,origin);
 drawShatter(c,s,T,H);
 c.restore();
 // ngoài camera: tối sập trước nổ, chớp lúc nổ, tro lửa, viền tối
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.78;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();}
 flash(c,H,'#ff6a4a',s.bang*.35);
 drawEmbers(c,s,H,light);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
}
