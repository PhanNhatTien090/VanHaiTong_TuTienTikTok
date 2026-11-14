// Đại La v2 — Nhất Niệm Vạn Giới (07/11/2026). Làm lại vì v1 lặp khung Thái Ất (vòng ghim mảnh + thú lượn + hút vào).
// 32 s; nổ 28,0; đổi skin 28,3. Cơ chế mới: giọt sáng → biển sao → 9 tiểu thế giới bắn lên → mô hình vũ trụ quay quanh người →
// tâm ngân hà mở thành Thiên Đạo Chi Nhãn bắn 5 tia phán xét, khiên đỡ → bàn cờ vây trên mặt đài, 12 quân giáng xuống vây mắt →
// thời gian đình chỉ (mất màu, đứng hình, tích tắc) → búng tay → 9 thế giới đâm vào nhau thành lõi → lõi nhập đan điền, ánh sáng bị hút
// sạch → vụ nổ khai thiên đủ màu → đổi skin. Bản v1 sao lưu ở data/backups/dai-la-awakening.js.v1-20261107.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
export const DL=Object.freeze({duration:32,drop:.3,worlds:2.5,align:7,eye:11,board:15.5,freeze:19,snap:21.6,crunch:22,core:26,dark:27.2,absorbed:27.85,impact:28,reveal:28.3,fade:30.8});
export const DL_RIPPLES=Object.freeze([.45,1.05,1.65]);
export const DL_WORLDS=Object.freeze(Array.from({length:9},(_,i)=>2.5+i*.5));
export const DL_RAYS=Object.freeze([12.3,12.95,13.6,14.25,14.9]);
export const DL_STONES=Object.freeze(Array.from({length:12},(_,i)=>15.7+i*.27));
export const DL_TICKS=Object.freeze(Array.from({length:5},(_,i)=>19.2+i*.5));
export const DL_CRUNCH=Object.freeze(Array.from({length:9},(_,i)=>22.4+i*(.46-i*.02)));
export const DAI_LA_DURATION=32000,DAI_LA_REVEAL=DL.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const PALETTE={main:'#9fdcff',main2:'#ffd98a',soft:'#f2f8ff',gold:'#ffd98a'};
// 9 tiểu thế giới: màu lõi, màu viền, kiểu chi tiết.
export const WORLDS=Object.freeze([{id:'fire',a:'#ffb347',b:'#ff3b1f'},{id:'ice',a:'#e8fbff',b:'#59c8ff'},{id:'forest',a:'#9cf27a',b:'#1f7a3a'},{id:'ocean',a:'#7fd8ff',b:'#1546b8'},{id:'thunder',a:'#e0b8ff',b:'#5a2cc8'},{id:'sun',a:'#fff3b0',b:'#ffb000'},{id:'moon',a:'#f0f0f6',b:'#8a8aa8'},{id:'ring',a:'#ffd9a0',b:'#c06a2a'},{id:'void',a:'#3a1a5a',b:'#0a0414'}]);
export function daiLaState(k,H=1600,motion=true){
 const t=clamp(k)*DL.duration,feet=H*.75,frozen=t>=DL.freeze&&t<DL.snap;
 return {k:clamp(k),seconds:t,t,H,motion,clock:motion?(frozen?DL.freeze:t):0,feet,belly:feet-145,ox:450,oy:feet-260,eyeX:495,eyeY:H*.11,revealed:t>=DL.reveal,
  sea:ease((t-DL.drop)/1.2)*(1-ease((t-DL.core)/1.5)),align:ease((t-DL.align)/1.6),eye:ease((t-DL.eye)/1.2)*(1-ease((t-DL.crunch+.4)/1.4)),
  board:ease((t-DL.board)/.6)*(1-ease((t-DL.crunch)/1)),freeze:frozen?ease((t-DL.freeze)/.25):0,snap:t<DL.snap?0:Math.exp(-(t-DL.snap)*3),
  crunch:ease((t-DL.crunch)/(DL.core-DL.crunch)),coreDrop:ease((t-DL.core)/(DL.absorbed-DL.core)),dark:ease((t-DL.dark)/.55)*(1-ease((t-DL.impact)/.05)),
  compression:ease((t-DL.absorbed+.15)/.25)*(1-ease((t-DL.impact)/.06)),blast:t<DL.impact?0:clamp((t-DL.impact)/2),bang:t<DL.impact?0:Math.exp(-(t-DL.impact)*1.6),after:ease((t-DL.reveal)/.5),fade:1-ease((t-DL.fade)/1.2)};
}
export function daiLaHits(){return [[DL.drop,1.2],...DL_RIPPLES.map(a=>[a,.8]),...DL_WORLDS.map(a=>[a,.9]),[DL.align+1.4,1.1],[DL.eye+.6,1.4],...DL_RAYS.map(a=>[a,1.1]),...DL_STONES.map(a=>[a,.55]),[DL.freeze,1],[DL.snap,1.5],...DL_CRUNCH.map(a=>[a,1]),[DL.impact,2.4]];}
function hitPower(t){let p=0;for(const [a,f] of daiLaHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
export function prepareDaiLaArt(scene){if(scene.daiLaWorldArt||typeof Image==='undefined')return;const im=new Image();scene.daiLaWorldArt=im;im.onload=()=>{scene.daiLaAssets=null;};im.src='/assets/dai-la-v1/star-heaven.png';}
// Vẽ sẵn 9 tiểu thế giới (128 px) — mỗi cái chi tiết riêng.
function paintWorld(c,w){const r=56;c.translate(64,64);const g=c.createRadialGradient(-18,-18,4,0,0,r);g.addColorStop(0,w.a);g.addColorStop(1,w.b);c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.save();c.beginPath();c.arc(0,0,r,0,TAU);c.clip();
 if(w.id==='fire'){c.fillStyle='#ffe08a';for(let i=0;i<7;i++){c.beginPath();c.ellipse(rnd(i)*80-40,rnd(i+3)*80-40,10,4,i,0,TAU);c.fill();}}
 if(w.id==='ice'){c.strokeStyle='#ffffff';c.lineWidth=3;for(let i=0;i<6;i++){c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(i*TAU/6)*50,Math.sin(i*TAU/6)*50);c.stroke();}}
 if(w.id==='forest'){c.fillStyle='#145a28';for(let i=0;i<9;i++){c.beginPath();c.arc(rnd(i+5)*90-45,rnd(i+7)*90-45,9+rnd(i)*8,0,TAU);c.fill();}}
 if(w.id==='ocean'){c.strokeStyle='#d8f4ff';c.lineWidth=3;for(let j=0;j<4;j++){c.beginPath();for(let x=-60;x<=60;x+=6)c.lineTo(x,-30+j*20+Math.sin(x*.15+j)*5);c.stroke();}}
 if(w.id==='thunder'){c.strokeStyle='#ffffff';c.lineWidth=3;c.beginPath();c.moveTo(-10,-50);c.lineTo(8,-10);c.lineTo(-6,0);c.lineTo(14,48);c.stroke();}
 if(w.id==='moon'){c.fillStyle='#b8b8cc';for(let i=0;i<6;i++){c.beginPath();c.arc(rnd(i+11)*80-40,rnd(i+13)*80-40,4+rnd(i)*8,0,TAU);c.fill();}}
 if(w.id==='void'){c.strokeStyle='#b06cff';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,14+i*14,0,TAU);c.stroke();}}
 c.restore();if(w.id==='ring'){c.strokeStyle='#ffe8c0';c.lineWidth=5;c.beginPath();c.ellipse(0,0,62,14,-.3,0,TAU);c.stroke();}
 const rim=c.createRadialGradient(0,0,r*.7,0,0,r);rim.addColorStop(0,'#ffffff00');rim.addColorStop(1,w.id==='void'?'#b06cffaa':'#ffffff66');c.fillStyle=rim;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();}
function assets(scene,H){
 const cache=scene.daiLaAssets;if(cache?.H===H)return cache;const art=ready(scene.daiLaWorldArt)?scene.daiLaWorldArt:null;
 const world=surface(450,H/2,c=>{c.scale(.5,.5);if(art)c.drawImage(art,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05061a');g.addColorStop(.6,'#1a1440');g.addColorStop(1,'#0a0c1c');c.fillStyle=g;c.fillRect(0,0,900,H);}});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#d8eeffb0');g.addColorStop(.5,'#8fb8ff30');g.addColorStop(1,'#8fb8ff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#02030a00');g.addColorStop(.55,'#02030a00');g.addColorStop(1,'#02030ad0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const orbs=WORLDS.map(w=>surface(128,128,c=>paintWorld(c,w)));
 return scene.daiLaAssets={H,world,glow,vignette,orbs};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,0,0,TAU);c.stroke();c.restore();}
// Vị trí tiểu thế giới i: bắn lên từ biển sao → quỹ đạo nghiêng (mô hình vũ trụ) → xoáy vào lõi.
export function worldPos(s,i){
 const born=DL_WORLDS[i],k=clamp((s.t-born)/.6),tilt=mix(.3+i*.05,0,s.align)*(i%2?1:-1),rx=mix(200+i*22,330,s.align),ry=mix(70+i*8,92,s.align),spd=mix(.5+i*.07,.55,s.align),ang=i*TAU/9+s.clock*spd,
  ox=Math.cos(ang)*rx,oy=Math.sin(ang)*ry,x=s.ox+ox*Math.cos(tilt)-oy*Math.sin(tilt),y=s.oy+ox*Math.sin(tilt)+oy*Math.cos(tilt),z=Math.sin(ang);
 const sx=s.ox+(rnd(i)-.5)*500,sy=s.feet+40;let px=mix(sx,x,back(k)),py=mix(sy,y,back(k))-Math.sin(k*Math.PI)*160,scale=mix(.4,.75+z*.2,k);
 const hit=DL_CRUNCH[i],cr=clamp((s.t-hit+.45)/.45);if(cr>0){px=mix(px,450,ease(cr));py=mix(py,s.H*.25,ease(cr));scale*=1-cr*.5;}
 return {x:px,y:py,z,scale,alive:s.t>=born-.05&&s.t<hit,k};
}
// Thiên Đạo Chi Nhãn: mắt hình hạnh nhân, mí mở theo open.
function eye(c,x,y,w,open,look,a){if(a<=.01||open<=.01)return;const h=w*.42*open;c.save();c.globalAlpha=a;c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x,y-h*2,x+w,y);c.quadraticCurveTo(x,y+h*2,x-w,y);c.closePath();c.save();c.clip();
 const g=c.createRadialGradient(x+look,y,4,x+look,y,w*.55);g.addColorStop(0,'#fff6c8');g.addColorStop(.3,'#ff9a3a');g.addColorStop(.6,'#b01830');g.addColorStop(1,'#1a0410');c.fillStyle=g;c.fillRect(x-w,y-w,w*2,w*2);
 c.fillStyle='#05000a';c.beginPath();c.ellipse(x+look,y,w*.09,w*.32*open,0,0,TAU);c.fill();c.restore();c.globalCompositeOperation='screen';c.strokeStyle='#ffd0a0';c.lineWidth=4;c.stroke();c.restore();}
// Bàn cờ vây phối cảnh trên mặt đài.
function boardPoint(s,gx,gy){const u=gx/8,v=gy/8,yTop=s.feet-140,yBot=s.feet+230,y=mix(yTop,yBot,v*v*.6+v*.4),half=mix(170,430,(y-yTop)/(yBot-yTop));return {x:450+(u-.5)*2*half,y};}
const STONE_GRID=[[2,2],[6,2],[4,1],[1,5],[7,5],[3,4],[5,4],[4,6],[2,7],[6,7],[4,3],[4,8]];
export function daiLaActorImage(scene,p,e){
 if(scene.daiLaActor?.event!==e)scene.daiLaActor={event:e,frames:new Map()};const cache=scene.daiLaActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'dai-la-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}cache.set(p,im);return im;}
const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:11}),to:structuredClone(e.visualTo||{...live,realm:12})};snapshots.set(e,pair);return pair;}
export function drawDaiLaAwakening(scene,c,e,t,H){
 prepareDaiLaArt(scene);const s=daiLaState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,DL.impact/DL.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',dir=v.flip?-1:1,T=s.t;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=daiLaActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 if(a.world)c.drawImage(a.world,0,0,900,H);else{c.fillStyle='#05061a';c.fillRect(0,0,900,H);}
 if(!scene.reduceFlash&&hit>.05&&!s.freeze){c.save();c.globalCompositeOperation='screen';c.globalAlpha=hit*.2;c.fillStyle='#d8eeff';c.fillRect(0,0,900,H);c.restore();}
 // Thiên Đạo Chi Nhãn ở tâm ngân hà
 if(s.eye>0){const open=ease((T-DL.eye)/.6)*(1-ease((T-DL.crunch-.2)/1)),look=Math.sin(s.clock*1.3)*40;halo(c,a.glow,s.eyeX,s.eyeY,700,360,s.eye*.7);eye(c,s.eyeX,s.eyeY,230,open,look,s.eye);
  DL_RAYS.forEach((at,i)=>{const age=T-at;if(age<0||age>.45)return;const w=worldPos(s,(i*2)%9),k=1-age/.45;c.save();c.globalCompositeOperation='screen';c.globalAlpha=k;c.strokeStyle='#ff4a3a';c.lineWidth=18*k+2;c.beginPath();c.moveTo(s.eyeX,s.eyeY);c.lineTo(w.x,w.y);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=4;c.stroke();c.restore();
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=k;c.strokeStyle='#9fdcff';c.lineWidth=4;c.beginPath();for(let j=0;j<=6;j++){const aa=j*TAU/6,px=w.x+Math.cos(aa)*70,py=w.y+Math.sin(aa)*70;j?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();c.restore();halo(c,a.glow,w.x,w.y,260,260,k);});}
 // giọt sáng rơi → gợn sóng → biển sao
 if(T>=DL.drop-.4&&T<DL.drop){const k=(T-DL.drop+.4)/.4,dy=mix(s.feet-700,s.feet+10,k*k);c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,dy-360,0,dy);g.addColorStop(0,'rgba(159,220,255,0)');g.addColorStop(1,'rgba(255,255,255,.95)');c.fillStyle=g;c.fillRect(438,dy-360,24,360);c.restore();halo(c,a.glow,450,dy,180,180,1);halo(c,a.glow,450,dy,60,60,1);}
 {const age=T-DL.drop;if(age>=0&&age<.9){const k=1-age/.9;c.save();c.globalCompositeOperation='screen';c.globalAlpha=k;const g=c.createLinearGradient(0,0,0,s.feet+10);g.addColorStop(0,'rgba(159,220,255,0)');g.addColorStop(1,'rgba(255,255,255,1)');c.fillStyle=g;c.fillRect(450-60*k-10,0,(60*k+10)*2,s.feet+10);c.globalAlpha=k*.55;c.fillStyle='#e8f6ff';c.fillRect(0,0,900,H);c.restore();halo(c,a.glow,450,s.feet+10,520,200,k);}}
 DL_RIPPLES.forEach((at,i)=>{const age=T-at;if(age<0||age>2.2)return;const u=age/2.2;const rr=30+u*620;ring(c,450,s.feet+10,rr,'#ffffff',22*(1-u)+2,(1-u)*.5,rr*.26);ring(c,450,s.feet+10,rr,i%2?'#ffd98a':'#9fdcff',12*(1-u)+2,1-u,rr*.26);ring(c,450,s.feet+10,rr*.82,i%2?'#ffd98a':'#9fdcff',5*(1-u)+1,(1-u)*.7,rr*.82*.26);});
 if(s.sea>0){c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?50:110);i++){const x=rnd(i+300)*900,y=s.feet-60+rnd(i+310)*260,tw=.5+.5*Math.sin(s.clock*3+i);c.globalAlpha=s.sea*tw*.9;c.fillStyle=i%5?'#e8f4ff':'#ffd98a';c.fillRect(x,y,2.5,2.5);}c.restore();}
 // bàn cờ vây + quân cờ
 if(s.board>0){c.save();c.globalCompositeOperation='screen';for(const [lw,col,al] of [[9,'#ffb84a',.35],[3,'#fff1c8',.95]]){c.globalAlpha=s.board*al;c.strokeStyle=col;c.lineWidth=lw;for(let g=0;g<=8;g++){const a1=boardPoint(s,g,0),b1=boardPoint(s,g,8),a2=boardPoint(s,0,g),b2=boardPoint(s,8,g);c.beginPath();c.moveTo(a1.x,a1.y);c.lineTo(b1.x,b1.y);c.moveTo(a2.x,a2.y);c.lineTo(b2.x,b2.y);c.stroke();}}c.restore();
  DL_STONES.forEach((at,i)=>{if(T<at-.25)return;const [gx,gy]=STONE_GRID[i],pt=boardPoint(s,gx,gy),k=clamp((T-at+.25)/.25),y=mix(pt.y-500,pt.y,k*k),r=mix(18,40,(pt.y-(s.feet-140))/370),white=i%2===0;
   c.save();c.globalAlpha=s.board;c.fillStyle=white?'#f6f2e8':'#151520';c.strokeStyle=white?'#ffd98a':'#9fdcff';c.lineWidth=3;c.beginPath();c.ellipse(pt.x,y,r,r*.6,0,0,TAU);c.fill();c.stroke();c.restore();
   const age=T-at;if(age>=0&&age<.4){ring(c,pt.x,pt.y,r+age*260,white?'#ffd98a':'#9fdcff',5*(1-age/.4)+1,1-age/.4,(r+age*260)*.4);halo(c,a.glow,pt.x,pt.y,160,90,1-age/.4);}});}
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false&&!s.freeze?hit*15+s.bang*12:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 // tiểu thế giới: phía sau thân (z<0) và phía trước (z≥0)
 const drawWorlds=front=>{for(let i=0;i<9;i++){const w=worldPos(s,i);if(!w.alive||(w.z>=0)!==front)continue;const sz=128*w.scale;if(a.orbs[i])c.drawImage(a.orbs[i],w.x-sz/2,w.y-sz/2,sz,sz);halo(c,a.glow,w.x,w.y,sz*1.6,sz*1.6,.25);
  const age=T-DL_WORLDS[i];if(age>=0&&age<.5){ring(c,w.x,w.y,40+age*360,WORLDS[i].a,6*(1-age/.5)+1,1-age/.5);halo(c,a.glow,w.x,w.y,300,300,1-age/.5);}}};
 if(s.align>0&&T<DL.crunch){c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.align*.45;c.strokeStyle='#ffd98a';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(s.ox,s.oy,330-i*40,92-i*10,0,0,TAU);c.stroke();}c.restore();}
 if(T>=DL.align+1.4&&T<DL.align+2.2){const k=(T-DL.align-1.4)/.8;ring(c,s.ox,s.oy,330+k*400,'#ffd98a',10*(1-k)+1,1-k,(330+k*400)*.28);}
 drawWorlds(false);
 // lõi vạn giới trên đầu (sau các cú đâm) → rơi vào đan điền
 if(T>=DL_CRUNCH[0]&&T<DL.absorbed+.1){const n=DL_CRUNCH.filter(x=>T>=x).length,y=mix(s.H*.25,s.belly,s.coreDrop),r=20+n*9;halo(c,a.glow,450,y,r*8,r*8,1);c.save();c.globalCompositeOperation='screen';for(let i=0;i<n;i++){c.globalAlpha=.7;c.fillStyle=WORLDS[i].a;c.beginPath();c.arc(450+Math.cos(s.clock*5+i)*r*.4,y+Math.sin(s.clock*5+i)*r*.4,r*.6,0,TAU);c.fill();}c.restore();
  DL_CRUNCH.forEach((at,i)=>{const age=T-at;if(age>=0&&age<.5)ring(c,450,s.H*.25,30+age*700,WORLDS[i].a,8*(1-age/.5)+1,1-age/.5);});}
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 // vụ nổ khai thiên: vòng cầu vồng + tinh vân đủ màu
 if(s.blast>0){const hues=['#ff5a5a','#ffb347','#fff36b','#7fff9a','#6fd8ff','#8a7bff','#ff7ae0'];for(let i=0;i<14;i++){const u=clamp((T-DL.impact-i*.06)/1.6);if(u<=0||u>=1)continue;ring(c,450,s.belly,40+ease(u)*1100,hues[i%7],10*(1-u)+2,(1-u)*.9,(40+ease(u)*1100)*.85);}
  c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?60:140);i++){const ang=rnd(i)*TAU,d=s.blast*(150+rnd(i+1)*900);c.globalAlpha=(1-s.blast)*.9;c.fillStyle=hues[i%7];c.fillRect(450+Math.cos(ang)*d,s.belly+Math.sin(ang)*d*.8,4,4);}c.restore();halo(c,a.glow,450,s.belly,1200,1200,s.bang*.8);}
 // sau hiện thân: 3 tiểu thế giới nhỏ quay sau lưng
 if(s.after>0)for(let i=0;i<3;i++){const aa=i*TAU/3+T*.6*dir,x=450+Math.cos(aa)*190,y=s.feet-470+Math.sin(aa)*60,sz=46,o=a.orbs[[0,3,5][i]];if(o){c.save();c.globalAlpha=s.after*s.fade;c.drawImage(o,x-sz/2,y-sz/2,sz,sz);c.restore();}}
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawWorlds(true);drawQiCompression(c,kq,origin);
 c.restore();
 // thời gian đình chỉ: mất màu + tối nhẹ + mặt đồng hồ, kim nhảy theo tiếng tích tắc
 if(s.freeze>0){c.save();c.globalCompositeOperation='saturation';c.globalAlpha=s.freeze;c.fillStyle='#808080';c.fillRect(0,0,900,H);c.restore();c.save();c.globalAlpha=s.freeze*.35;c.fillStyle='#0a0a14';c.fillRect(0,0,900,H);c.restore();
  const cx=450,cy=s.feet-470;c.save();c.globalAlpha=s.freeze;c.strokeStyle='#e8e8f0';c.lineWidth=3;c.beginPath();c.arc(cx,cy,230,0,TAU);c.stroke();for(let i=0;i<12;i++){const aa=i*TAU/12;c.beginPath();c.moveTo(cx+Math.cos(aa)*205,cy+Math.sin(aa)*205);c.lineTo(cx+Math.cos(aa)*228,cy+Math.sin(aa)*228);c.stroke();}
  const tk=DL_TICKS.filter(x=>T>=x).length,ang=-Math.PI/2+tk*TAU/12;c.lineWidth=6;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(ang)*180,cy+Math.sin(ang)*180);c.stroke();c.restore();}
 if(s.snap>0){drawScreenPulse(c,H,scene.reduceFlash,'#fff',s.snap*.6,'screen');ring(c,450,s.feet-300,40+(1-s.snap)*900,'#ffffff',10*s.snap+1,s.snap);}
 // ánh sáng bị hút sạch trước nổ
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.92;c.fillStyle='#000000';c.fillRect(0,0,900,H);c.restore();halo(c,a.glow,450,s.belly,80,80,s.dark);}
 drawQiMotes(scene,c,kq,H);if(a.vignette)c.drawImage(a.vignette,0,0,900,H);c.restore();
 const phase=s.revealed?'reveal':T<DL.worlds?'drop':T<DL.align?'worlds':T<DL.eye?'orrery':T<DL.board?'eye':T<DL.freeze?'board':T<DL.snap?'time-stop':T<DL.core?'crunch':'void';
 const ui={k:s.k,realm:12,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#d8eeff',title:'Đại La',subtitle:'Nhất Niệm Vạn Giới',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#eaf4ff';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('ĐẠI LA',450,H*.145);}}
 return ui;
}
