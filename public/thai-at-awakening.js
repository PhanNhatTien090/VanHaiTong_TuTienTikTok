// Thái Ất v2 — Lưỡng Nghi Định Thiên (07/11/2026, làm lại theo phản hồi: dày đặc, nhanh, mạnh, cấu trúc rõ).
// 30 s; nổ 26,0; đổi skin 26,3. Bản v1 sao lưu ở data/backups/thai-at-awakening.js.v1-20261107.
// Trình tự: lưỡi vàng xẻ trời đất → 8 mảnh Bát Quái đập vào vòng (8 cú) → cá âm/dương va nhau thành thái cực → rồng vàng giáng,
// phượng hoàng vút lên, lượn ngược chiều → 12 sét âm dương dồn dập → sóng vàng/sóng tím va ở chân trời → rồng phượng lao vào thái cực,
// bùng cháy → 8 cột sáng → 8 mảnh bay vào người → hai nửa thái cực xuyên tâm → nổ → đổi skin.
import {makeSurface} from './performance.js';
import {loadSpiritBeasts,drawFlyingDragon,drawFlyingPhoenix} from './gift-spirit-beasts.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
export const TA=Object.freeze({duration:30,split:.15,ring:5,fishIn:5.2,taiji:6.4,dragon:7.4,phoenix:9,storm:11.5,waves:14.8,crash:16,dive:18,ignite:19,pillars:19.2,absorb:21.5,halves:24.6,absorbed:25.85,impact:26,reveal:26.3,fade:28.8});
export const TA_SLAMS=Object.freeze(Array.from({length:8},(_,i)=>.7+i*.55));
export const TA_STRIKES=Object.freeze(Array.from({length:12},(_,i)=>11.5+i*.25));
export const TA_PILLARS=Object.freeze(Array.from({length:8},(_,i)=>19.2+i*.18));
export const TA_ABSORB=Object.freeze(Array.from({length:8},(_,i)=>21.5+i*(.48-i*.025)));
export const THAI_AT_DURATION=30000,THAI_AT_REVEAL=TA.reveal;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u,back=x=>{x=clamp(x);const s=1.7;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const C={light:'#ffe9a8',lightSoft:'#fff8e0',gold:'#ffc84a',dark:'#2a1f5c',darkSoft:'#a08cff',violet:'#b48cff'};
const PALETTE={main:'#ffe9a8',main2:'#a08cff',soft:'#fff8e0',gold:'#ffd36b'};
// Bát Quái: 3 hào (1 = liền, 0 = đứt), theo thứ tự Tiên Thiên quanh vòng.
const TRIGRAMS=[[1,1,1],[0,1,1],[1,0,1],[0,0,1],[1,1,0],[0,1,0],[1,0,0],[0,0,0]];
export function thaiAtState(k,H=1600,motion=true){
 const t=clamp(k)*TA.duration,feet=H*.755;
 return {k:clamp(k),seconds:t,t,H,motion,clock:motion?t:0,feet,belly:feet-145,horizon:H*.742,cx:450,cy:feet-300,R:285,revealed:t>=TA.reveal,
  split:t<TA.split?0:1-Math.exp(-(t-TA.split)*6),fish:ease((t-TA.fishIn)/(TA.taiji-TA.fishIn)),taiji:ease((t-TA.taiji)/.25)*(1-ease((t-TA.halves)/.3)),
  dragon:ease((t-TA.dragon)/.8)*(1-ease((t-TA.dive)/1)),phoenix:ease((t-TA.phoenix)/.8)*(1-ease((t-TA.dive)/1)),dive:ease((t-TA.dive)/1),
  wave:ease((t-TA.waves)/(TA.crash-TA.waves)),spray:t<TA.crash?0:Math.exp(-(t-TA.crash)*1.6),ignite:t<TA.ignite?0:Math.exp(-(t-TA.ignite)*1.2),
  halves:ease((t-TA.halves)/(TA.absorbed-TA.halves)),compression:ease((t-TA.absorbed+.15)/.25)*(1-ease((t-TA.impact)/.06)),
  blast:t<TA.impact?0:clamp((t-TA.impact)/1.6),tear:t<TA.impact?0:Math.exp(-(t-TA.impact)*2.4),after:ease((t-TA.reveal)/.5),fade:1-ease((t-TA.fade)/1.2)};
}
// Cú "bùm": mọi mốc va chạm, dùng chung cho rung máy và chớp.
export function thaiAtHits(){return [[TA.split,1.2],...TA_SLAMS.map(a=>[a,.9]),[TA.ring,1.3],[TA.taiji,1.5],[TA.dragon,1],[TA.phoenix,1],...TA_STRIKES.map(a=>[a,.55]),[TA.crash,1.6],[TA.ignite,1.4],...TA_PILLARS.map(a=>[a,.5]),...TA_ABSORB.map(a=>[a,.7]),[TA.impact,2]];}
function hitPower(t){let p=0;for(const [a,f] of thaiAtHits()){const age=t-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
export function prepareThaiAtArt(scene){loadSpiritBeasts(scene);if(scene.thaiAtWorldArt||typeof Image==='undefined')return;const im=new Image();scene.thaiAtWorldArt=im;im.onload=()=>{scene.thaiAtAssets=null;};im.src='/assets/thai-at-v1/two-realms.png';}
function assets(scene,H){
 const cache=scene.thaiAtAssets;if(cache?.H===H)return cache;const art=ready(scene.thaiAtWorldArt)?scene.thaiAtWorldArt:null;
 const world=surface(450,H/2,c=>{c.scale(.5,.5);if(art)c.drawImage(art,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#cfd8ff');g.addColorStop(.74,'#fff3d0');g.addColorStop(.745,'#140f2e');g.addColorStop(1,'#05040e');c.fillStyle=g;c.fillRect(0,0,900,H);}});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#fff1c8b0');g.addColorStop(.5,'#c8b8ff30');g.addColorStop(1,'#c8b8ff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.55,170,450,H*.55,H*.72);g.addColorStop(0,'#03040c00');g.addColorStop(.55,'#03040c00');g.addColorStop(1,'#03040cc8');c.fillStyle=g;c.fillRect(0,0,900,H);});
 return scene.thaiAtAssets={H,world,glow,vignette};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function bolt(c,x0,y0,x1,y1,seed,col,w,a){if(a<=.01)return;const pts=[];for(let i=0;i<=14;i++){const u=i/14,j=(rnd(seed+i*7)-.5)*70*Math.sin(u*Math.PI);pts.push([x0+(x1-x0)*u+j,y0+(y1-y0)*u]);}c.save();c.globalCompositeOperation='screen';c.lineJoin='round';for(const [lw,cc,al] of [[w*5,col,.25],[w*1.6,col,.8],[w*.6,'#ffffff',1]]){c.globalAlpha=a*al;c.strokeStyle=cc;c.lineWidth=lw;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}c.restore();}
function ring(c,x,y,r,col,w,a){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.restore();}
// Một mảnh Bát Quái: tấm hình thang có 3 hào.
function trigramPlate(c,i,x,y,rot,scale,a,glowA){if(a<=.01)return;const upper=i<4,col=upper?C.gold:C.violet;c.save();c.translate(x,y);c.rotate(rot);c.scale(scale,scale);c.globalAlpha*=a;
 c.fillStyle=upper?'#3a2a08e0':'#160f36e0';c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(-58,-26);c.lineTo(58,-26);c.lineTo(46,30);c.lineTo(-46,30);c.closePath();c.fill();c.stroke();
 c.fillStyle=upper?'#fff1c0':'#e6dcff';TRIGRAMS[i].forEach((solid,j)=>{const yy=-14+j*14;if(solid)c.fillRect(-32,yy-4,64,8);else{c.fillRect(-32,yy-4,26,8);c.fillRect(6,yy-4,26,8);}});
 if(glowA>0){c.globalCompositeOperation='screen';c.globalAlpha=a*Math.min(1,glowA);c.lineWidth=10;c.stroke();}c.restore();}
function plateHome(s,i,spin){const a=-Math.PI/2+i*TAU/8+spin;return {x:s.cx+Math.cos(a)*s.R,y:s.cy+Math.sin(a)*s.R,rot:a+Math.PI/2};}
// Thái cực (trong suốt, viền/đường S phát sáng).
function taiji(c,x,y,r,rot,a){if(a<=.01||r<1)return;c.save();c.translate(x,y);c.rotate(rot);
 c.globalAlpha=a*.22;c.fillStyle=C.dark;c.beginPath();c.arc(0,0,r,0,TAU);c.fill();c.globalAlpha=a*.3;c.fillStyle=C.light;c.beginPath();c.arc(0,0,r,-Math.PI/2,Math.PI/2,true);c.arc(0,r/2,r/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-r/2,r/2,Math.PI/2,-Math.PI/2,false);c.closePath();c.fill();
 c.globalAlpha=a*.9;c.fillStyle=C.dark;c.beginPath();c.arc(0,-r/2,r*.12,0,TAU);c.fill();c.fillStyle=C.lightSoft;c.beginPath();c.arc(0,r/2,r*.12,0,TAU);c.fill();
 c.globalCompositeOperation='screen';for(const [w,col,al] of [[Math.max(5,r*.07),'#ffe9a8',.4],[Math.max(2,r*.016),'#ffffff',1]]){c.globalAlpha=a*al;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.beginPath();c.arc(0,-r/2,r/2,Math.PI/2,-Math.PI/2,false);c.arc(0,r/2,r/2,-Math.PI/2,Math.PI/2,true);c.stroke();}c.restore();}
// Cá âm/dương: nửa thái cực đang bay vào.
function fish(c,x,y,r,rot,light,a){if(a<=.01)return;c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=a;c.fillStyle=light?C.light:C.violet;c.beginPath();
 if(light){c.arc(0,0,r,-Math.PI/2,Math.PI/2,true);c.arc(0,r/2,r/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-r/2,r/2,Math.PI/2,-Math.PI/2,false);}else{c.arc(0,0,r,-Math.PI/2,Math.PI/2,false);c.arc(0,r/2,r/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-r/2,r/2,Math.PI/2,-Math.PI/2,false);}
 c.closePath();c.fill();c.globalCompositeOperation='screen';c.strokeStyle='#ffffff';c.lineWidth=3;c.stroke();c.restore();}
const shadows=new WeakMap();
export function thaiAtActorImage(scene,p,e){
 if(scene.thaiAtActor?.event!==e)scene.thaiAtActor={event:e,frames:new Map()};const cache=scene.thaiAtActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'thai-at-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}cache.set(p,im);return im;}
function reflectionOf(im){if(!im)return null;if(shadows.has(im))return shadows.get(im);const g=makeSurface(640,760);if(!g)return null;const c=g.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(im,0,0);c.drawImage(im,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='#9a88ff';c.globalAlpha=.55;c.fillRect(0,0,640,760);shadows.set(im,g);return g;}
const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:10}),to:structuredClone(e.visualTo||{...live,realm:11})};snapshots.set(e,pair);return pair;}
export function drawThaiAtAwakening(scene,c,e,t,H){
 prepareThaiAtArt(scene);const s=thaiAtState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),kq=qiRemap(s.k,TA.impact/TA.duration),origin={x:450,y:s.belly},light=scene.budget?.level==='light',dir=v.flip?-1:1,T=s.t;
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=thaiAtActorImage(scene,p,e),reflect=reflectionOf(thaiAtActorImage(scene,from,e)),hit=hitPower(T)*(s.motion?1:.3),beasts=scene.spiritBeasts||{};
 c.save();setFxPalette(PALETTE);
 // nền + rách ranh giới lúc nổ
 const jolt=s.tear*46*(s.motion?1:.3);if(a.world){c.save();c.beginPath();c.rect(0,0,900,s.horizon);c.clip();c.drawImage(a.world,0,-jolt,900,H);c.restore();c.save();c.beginPath();c.rect(0,s.horizon,900,H-s.horizon);c.clip();c.drawImage(a.world,0,jolt,900,H);c.restore();}else{c.fillStyle='#fff3d0';c.fillRect(0,0,900,s.horizon);c.fillStyle='#0b0820';c.fillRect(0,s.horizon,900,H-s.horizon);}
 // trời tối dần để hiệu ứng sáng nổi (ảnh nền vẫn đọc được)
 c.save();c.globalAlpha=.3*clamp(T/1.2)*(1-s.after*.7);c.fillStyle='#1a1430';c.fillRect(0,0,900,H);c.restore();
 if(hit>.05){c.save();c.globalCompositeOperation='screen';c.globalAlpha=hit*.22;c.fillStyle='#fff3d0';c.fillRect(0,0,900,H);c.restore();}
 // lưỡi vàng xẻ trời đất
 if(T<TA.ring+1&&s.split>0){const w=900*s.split;c.save();c.globalAlpha=1-s.split*.5;c.fillStyle='#ffcf5a';c.fillRect(450-w/2,s.horizon-6,w,12);c.fillStyle='#ffffff';c.fillRect(450-w/2,s.horizon-2,w,4);c.restore();halo(c,a.glow,450,s.horizon,w*1.3,160,(1-s.split)*.9);}
 // sóng vàng đổ xuống / sóng tím dâng lên → va ở chân trời
 if(s.wave>0&&T<TA.crash+1.6){const top=mix(-250,s.horizon-30,s.wave),bot=mix(H+250,s.horizon+30,s.wave),fadeW=1-ease((T-TA.crash)/1.2);
  c.save();c.globalAlpha=fadeW*.85;const g=c.createLinearGradient(0,top-260,0,top);g.addColorStop(0,'#ffc84a00');g.addColorStop(1,'#ffe39acc');c.fillStyle=g;c.beginPath();c.moveTo(0,top-260);for(let x=0;x<=900;x+=30)c.lineTo(x,top+Math.sin(x*.02+T*6)*22);c.lineTo(900,top-260);c.closePath();c.fill();
  const g2=c.createLinearGradient(0,bot,0,bot+260);g2.addColorStop(0,'#b48cffcc');g2.addColorStop(1,'#2a1f5c00');c.fillStyle=g2;c.beginPath();c.moveTo(0,bot+260);for(let x=0;x<=900;x+=30)c.lineTo(x,bot+Math.sin(x*.02-T*6)*22);c.lineTo(900,bot+260);c.closePath();c.fill();c.restore();}
 if(s.spray>.02){c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?30:70);i++){const u=1-s.spray,ang=-Math.PI*rnd(i+3),d=u*(200+rnd(i)*500),x=rnd(i+7)*900,y=s.horizon+Math.sin(ang)*d*(i%2?1:-.6)+u*u*120;c.globalAlpha=s.spray;c.fillStyle=i%2?C.gold:C.violet;c.fillRect(x+Math.cos(ang)*d*.3,y,4,4);}c.restore();halo(c,a.glow,450,s.horizon,1400,220,s.spray);}
 pushFxCamera(scene,c,kq,v,s.feet);const shake=s.motion&&scene.cameraEnabled!==false?hit*14+s.tear*10:0;c.translate(Math.sin(T*83)*shake,Math.cos(T*71)*shake*.6);
 if(reflect&&T<TA.impact){c.save();c.globalAlpha=.55*clamp(T/1.5);c.translate(450,s.feet);c.scale(1,-.92);c.drawImage(reflect,-320,-590);c.restore();}
 // rồng & phượng phía sau thân
 const spin=(T<TA.ring?0:(T-TA.ring)*.25+Math.max(0,T-TA.storm)*.35)*dir,beastR=320*(1-s.dive*.95),beastY=s.cy;
 if(s.dragon>0)drawFlyingDragon(c,beasts.dragon,{x:450,y:beastY,radius:beastR,phase:s.motion?(T-TA.dragon)/2.6:.3,time:s.motion?T*1000:0,color:2,side:dir,scale:1.25*(1-s.dive*.6),light,alpha:s.dragon});
 if(s.phoenix>0)drawFlyingPhoenix(c,beasts.phoenix,{x:450,y:beastY+40,radius:beastR*.9,phase:s.motion?(T-TA.phoenix)/2.4+.5:.8,time:s.motion?T*1000:0,color:0,side:-dir,scale:1.15*(1-s.dive*.6),alpha:s.phoenix});
 if(T>=TA.dragon&&T<TA.dragon+.6)bolt(c,450-dir*380,-40,450,s.cy-200,77,C.gold,4,1-(T-TA.dragon)/.6);
 if(T>=TA.phoenix&&T<TA.phoenix+.6)bolt(c,450+dir*380,H+40,450,s.cy+120,91,C.violet,4,1-(T-TA.phoenix)/.6);
 // thái cực + vòng
 const tr=mix(220,60,s.halves);taiji(c,s.cx,s.cy,tr*(1+s.ignite*.25),T*(1.2+Math.max(0,T-TA.storm)*.4)*dir,s.taiji*(1-s.halves*.3));
 halo(c,a.glow,s.cx,s.cy,500*s.ignite+60,500*s.ignite+60,s.ignite);
 if(T>=TA.fishIn&&s.fish<1){fish(c,s.cx-dir*mix(420,0,s.fish),mix(-200,s.cy,s.fish),220,T*4,true,1);fish(c,s.cx+dir*mix(420,0,s.fish),mix(H+200,s.cy,s.fish),220,-T*4,false,1);}
 if(T>=TA.taiji&&T<TA.taiji+.7){const k=(T-TA.taiji)/.7;ring(c,s.cx,s.cy,220+k*500,'#ffffff',8*(1-k)+1,1-k);}
 if(T>=TA.ring&&T<TA.ring+.8){const k=(T-TA.ring)/.8;ring(c,s.cx,s.cy,s.R+k*300,C.gold,10*(1-k)+1,1-k);}
 // 8 mảnh: bay vào đập → giữ vòng → bắn cột sáng → bay vào người
 for(let i=0;i<8;i++){const arrive=TA_SLAMS[i],home=plateHome(s,i,spin),ang=-Math.PI/2+i*TAU/8,fly=clamp((T-arrive+.35)/.35);if(T<arrive-.35)continue;
  const absorbAt=TA_ABSORB[i],gone=clamp((T-absorbAt+.3)/.3);if(gone>=1)continue;
  let x=home.x,y=home.y,sc=1,rot=home.rot;if(fly<1){const far=900*(1-back(fly));x=home.x+Math.cos(ang)*far;y=home.y+Math.sin(ang)*far;sc=mix(1.8,1,fly);rot+=(1-fly)*4*dir;}
  if(gone>0){x=mix(home.x,450,ease(gone));y=mix(home.y,s.belly,ease(gone));sc=mix(1,.3,gone);}
  const flash=T>=arrive&&T<arrive+.35?1-(T-arrive)/.35:0,pil=TA_PILLARS[i],pillar=T>=pil&&T<pil+.9?1-(T-pil)/.9:0;
  if(pillar>0){c.save();c.globalCompositeOperation='screen';const w=26*pillar+6,g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'#ffffff00');g.addColorStop(.5,i<4?'#fff1c8':'#e0d4ff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.globalAlpha=pillar;if(i<4)c.fillRect(x-w,0,w*2,y);else c.fillRect(x-w,y,w*2,H-y);c.restore();}
  trigramPlate(c,i,x,y,rot,sc,1,flash+pillar*.6+s.ignite*.5);
  if(flash>0){ring(c,x,y,30+(1-flash)*160,i<4?C.gold:C.violet,6*flash+1,flash);halo(c,a.glow,x,y,220,220,flash);c.save();c.globalCompositeOperation='screen';c.globalAlpha=flash;c.fillStyle='#ffffff';for(let j=0;j<(light?6:12);j++){const aa=j*TAU/12,d=(1-flash)*140;c.fillRect(x+Math.cos(aa)*d,y+Math.sin(aa)*d,4,4);}c.restore();}
  if(gone>0&&gone<1)halo(c,a.glow,x,y,120,120,1-gone);}
 // 12 sét âm dương đánh vào các mảnh
 TA_STRIKES.forEach((at,i)=>{const age=T-at;if(age<0||age>.35)return;const h=plateHome(s,(i*3)%8,spin),gold=i%2===0;bolt(c,h.x+(rnd(i)-.5)*300,gold?-40:H+40,h.x,h.y,200+i*11,gold?C.gold:C.violet,3,Math.exp(-age*8));halo(c,a.glow,h.x,h.y,240,240,Math.exp(-age*8));});
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 if(s.halves>0&&T<TA.absorbed+.1){const u=s.halves;fish(c,450-dir*mix(260,0,u),s.belly-mix(120,0,u),mix(130,40,u),T*3,false,1-ease((T-TA.absorbed)/.1));}
 // nổ: rách ranh giới + sóng + rồng phượng bung ra
 if(s.blast>0){c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.tear;c.strokeStyle='#ffffff';c.lineWidth=6;c.beginPath();for(let i=0;i<=30;i++){const x=i*30,y=s.horizon+(rnd(i+Math.floor(T*10))-.5)*70*s.tear;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();
  for(let i=0;i<9;i++){const u=clamp((T-TA.impact-i*.07)/1.3);if(u<=0||u>=1)continue;ring(c,450,i%2?s.horizon:s.belly,50+ease(u)*950,i%2?C.light:C.darkSoft,6*(1-u)+1,(1-u)*.8);}
  const burst=clamp((T-TA.impact)/1.6);if(burst<1){drawFlyingDragon(c,beasts.dragon,{x:450,y:s.belly,radius:100+burst*700,phase:.2,time:T*1000,color:2,side:dir,scale:1.4,light,alpha:(1-burst)*.8});drawFlyingPhoenix(c,beasts.phoenix,{x:450,y:s.belly,radius:100+burst*650,phase:.7,time:T*1000,color:0,side:-dir,scale:1.3,alpha:(1-burst)*.8});}}
 // sau hiện thân: thái cực + vòng Bát Quái nhỏ sau đầu
 if(s.after>0){const hx=450,hy=s.feet-470;taiji(c,hx,hy,90,T*.5*dir,s.after*s.fade*.6);for(let i=0;i<8;i++){const aa=-Math.PI/2+i*TAU/8+T*.3*dir;trigramPlate(c,i,hx+Math.cos(aa)*150,hy+Math.sin(aa)*150,aa+Math.PI/2,.45,s.after*s.fade*.8,.3);}}
 if(image){c.save();c.globalAlpha=clamp(T/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 if(s.halves>0&&T<TA.absorbed+.1){const u=s.halves;fish(c,450+dir*mix(220,0,u),s.belly+mix(200,0,u),mix(300,40,u),-T*3,true,(1-ease((T-TA.absorbed)/.1))*.9);}
 drawQiCompression(c,kq,origin);
 c.restore();drawQiMotes(scene,c,kq,H);if(a.vignette)c.drawImage(a.vignette,0,0,900,H);c.restore();
 const phase=s.revealed?'reveal':T<TA.ring?'bagua':T<TA.dragon?'taiji':T<TA.storm?'dragon-phoenix':T<TA.waves?'storm':T<TA.dive?'waves':T<TA.absorb?'ignite':'absorb';
 const ui={k:s.k,realm:11,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#fff1c8',title:'Thái Ất',subtitle:'Lưỡng Nghi Định Thiên',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff6e0';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('THÁI ẤT',450,H*.145);}}
 return ui;
}
