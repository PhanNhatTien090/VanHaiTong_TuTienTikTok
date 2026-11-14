import {cameraShakeStrength,drawScreenPulse,feedbackBudget} from './cinematic-feedback.js';
// Chính Ma Đại Chiến — phần hình (07/11/2026). Sân chia đôi theo chiến tuyến 0..100 (100 = Chính Đạo thắng).
// Trái: Chính Đạo (vàng/lam). Phải: Ma Đạo (đỏ/đen). Bức tường năng lượng ở chiến tuyến; mỗi phe 6 nhân vật đầy đủ + binh sĩ mini.
import {drawWarForces,warGiftImpact} from './war-impact.js';
import {drawWarRoad,truongOf,warCamera,screenX,TRUONG_PER_POINT} from './war-road.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const hash=s=>{let h=2166136261;for(const ch of String(s||''))h=Math.imul(h^ch.codePointAt(0),16777619);return h>>>0;};
const COL={chinh:{main:'#ffd36b',soft:'#fff3c8',deep:'#1d3a6b',name:'CHÍNH ĐẠO'},ma:{main:'#ff3b4e',soft:'#ffc2c8',deep:'#3a0710',name:'MA ĐẠO'}};
const OMEN_NAME={'golden-sun':'☀ KIM DƯƠNG','blood-moon':'🌑 HUYẾT NGUYỆT',chaos:'⚡ HỖN CHIẾN',mist:'🌫 SƯƠNG MÙ'};
const serverNow=(scene,t)=>(scene.warServerNow||Date.now())+Math.min(2000,t-(scene.warReceivedAt||t));
export function syncWar(scene,state){if(state.sectWar?.id!==scene.warStatus?.id){scene.warZ=null;scene.warCameraZ=null;scene.warKick=null;}scene.warStatus=state.sectWar||null;scene.warStage=state.warStage||[];scene.warReceivedAt=performance.now();scene.warServerNow=state.serverNow;document.body.classList.toggle('sect-war',!!scene.warStatus?.active);}
export const warActive=scene=>!!scene.warStatus?.active;
// Vị trí chiến tuyến trên màn hình (x), làm mượt.
// 08/11: chiến tuyến chạy bằng LÒ XO + cú hích mỗi lần điểm đổi → đẩy qua đẩy lại giật mạnh, nảy quá đà rồi bật lại (không còn trôi "rí rí").
// 08/11 tối: VẠN LÝ CHIẾN ĐẠO — điểm giao tranh tính bằng TRƯỢNG (lò xo + cú hích), máy quay bám theo; trả về x trên màn hình.
function lineX(scene,t){const e=scene.warStatus,goal=truongOf(e?.line??50);
 if(scene.warZ==null){scene.warZ=goal;scene.warZV=0;scene.warGoalZ=goal;scene.warLineT=t;}
 const dt=Math.min(.05,Math.max(0,(t-(scene.warLineT??t))/1000));scene.warLineT=t;
 if(Math.abs(goal-scene.warGoalZ)>.5){const jump=goal-scene.warGoalZ;scene.warZV+=jump*7;scene.warKick={at:t,dir:Math.sign(jump),size:Math.min(1,Math.abs(jump)/110),truong:Math.round(Math.abs(jump))};}scene.warGoalZ=goal;
 if(dt>0){scene.warZV+=((goal-scene.warZ)*55-scene.warZV*7)*dt;scene.warZ=Math.max(-1000,Math.min(1000,scene.warZ+scene.warZV*dt));}
 scene.warCameraZ??=scene.warZ;scene.warCameraZ+=(scene.warZ-scene.warCameraZ)*(scene.motion===false?1:1-Math.exp(-dt*4.8));
 scene.warCam=warCamera(scene.warCameraZ);scene.warLineX=Math.max(30,Math.min(870,screenX(scene.warZ,scene.warCam)));return scene.warLineX;}
// chữ nhảy tưng tưng: nảy theo nhịp + nảy mạnh khi vừa có cú hích
const hop=(scene,t,seed=0,amp=7)=>{const k=scene.warKick&&t-scene.warKick.at<500?(1-(t-scene.warKick.at)/500)*14*(.5+scene.warKick.size):0;return -Math.abs(Math.sin(t*.011+seed))*amp-k*Math.abs(Math.sin((t-(scene.warKick?.at||0))*.03));};
const pop=(age,dur=500)=>age<dur?1+.45*Math.sin(Math.min(1,age/dur)*Math.PI)*(1-age/dur):1;
const sideOf=(e,id)=>e?.roster?.chinh?.some(r=>r.id===id)?'chinh':e?.roster?.ma?.some(r=>r.id===id)?'ma':null;
export function warTargets(scene,players,H,t){
 const e=scene.warStatus,lx=lineX(scene,t),groups={chinh:[],ma:[]};for(const p of players){const s=sideOf(e,p.id);if(s)groups[s].push(p);}
 const out=[];for(const side of ['chinh','ma'])groups[side].slice(0,6).forEach((p,i)=>{const row=i%2,col=Math.floor(i/2),dir=side==='chinh'?-1:1,front=side==='chinh'?lx-90:lx+90;
  const x=Math.max(70,Math.min(830,front+dir*(col*120+row*55))),y=H*(.6+row*.1)+(scene.motion?Math.sin(t*.003+i)*4:0);
  out.push({id:p.id,player:p,x,y,scale:i===0?1.7:1.35,lift:0,side,general:i===0&&e?.top?.[side]?.[0]?.id===p.id});});
 return out;
}
function glow(c,x,y,r,col,a){if(a<=0||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+Math.round(255*clamp(a)).toString(16).padStart(2,'0'));g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function bolt(c,x0,y0,x1,y1,seed,col,w){c.beginPath();for(let i=0;i<=10;i++){const u=i/10,j=(rnd(seed+i)-.5)*40*Math.sin(u*Math.PI);c.lineTo(x0+(x1-x0)*u+j,y0+(y1-y0)*u);}c.strokeStyle=col;c.lineWidth=w;c.stroke();}
// Binh sĩ mini: đốm sáng mang cờ phe, rải trên nửa sân của phe.
function soldiers(scene,c,e,side,lx,H,t){const roster=e.roster?.[side]||[],shown=new Set(scene.targets.map(a=>a.id)),list=roster.filter(r=>!shown.has(r.id)),n=Math.min(list.length,scene.budget?.level==='light'?20:40),col=COL[side];
 c.save();for(let i=0;i<n;i++){const h=hash(list[i].id),dir=side==='chinh'?-1:1,x=Math.max(20,Math.min(880,lx+dir*(60+(h%1000)/1000*360))),y=H*(.52+((h>>10)%1000)/1000*.36)+(scene.motion?Math.sin(t*.004+h)*3:0);
  c.fillStyle=col.deep;c.fillRect(x-1,y-26,2,26);c.fillStyle=col.main;c.beginPath();c.moveTo(x+1,y-26);c.lineTo(x+1+dir*-14,y-21);c.lineTo(x+1,y-16);c.closePath();c.fill();glow(c,x,y-6,14,col.main,.6);
  if(i<12){c.font='700 13px Segoe UI';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#05060c';const nm=Array.from(list[i].name||'').slice(0,8).join('');c.strokeText(nm,x,y+14);c.fillStyle=col.soft;c.fillText(nm,x,y+14);}}
 const hidden=roster.length-shown.size-n;c.restore();return Math.max(0,(e.counts?.[side]||0)-Math.min(roster.length,n+6));}
// Âm thanh: phát một lần cho mỗi biến cố mới + trống trận và tiếng va chạm liên tục khi đang giao chiến.
function warSounds(scene,e,now,t){const play=scene.onWarSound;if(!play)return;const seen=scene.warSeen??=new Set();
 for(const f of e.fx||[]){if(seen.has(f.id))continue;seen.add(f.id);if(now-f.at>3000)continue;if(f.kind==='gift'){play('cast',f.side,.5+powerOf(f)*1.5);play('gift',f.side,.6+Math.log10(1+(f.value||1))/2);}else if(f.kind==='final')play('final',e.lead||'chinh',f.left===10?1.4:1);else play(f.kind,f.side||'chinh',1);}
 // 08/11: tiếng vút mỗi cú đẩy rõ + tích tắc 10 giây cuối (3 giây cuối to hơn)
 const kk=scene.warKick;if(kk&&kk.size>=.1&&scene.warKickHeard!==kk.at&&t-kk.at<200){scene.warKickHeard=kk.at;play('push',kk.dir>0?'chinh':'ma',.6+kk.size);}
 if(e.phase==='running'){const left=(e.endsAt||now)-now,sec=Math.ceil(left/1000);if(left>0&&sec<=10&&scene.warTickSec!==sec){scene.warTickSec=sec;play('tick',e.lead||'chinh',sec<=3?2:1);}}
 if(seen.size>200)scene.warSeen=new Set([...seen].slice(-100));
 const key=e.id+':'+e.phase;if(scene.warPhaseKey!==key){scene.warPhaseKey=key;if(e.phase==='running')play('start','chinh');if(e.phase==='finished'&&e.result)play('win',e.result.winner||'chinh');}
 if(e.phase==='running'){if(t-(scene.warDrumAt||0)>1500){scene.warDrumAt=t;play('drum','chinh');}if(t-(scene.warClashAt||0)>520){scene.warClashAt=t;play('clash','chinh');}}}
// Rung theo biến cố gần nhất (quà mạnh, cứu nguy rất mạnh, chiêu nhẹ).
function warShake(e,now){let a=0;for(const f of e.fx||[]){const age=now-f.at;if(age<0)continue;if(f.kind==='gift'&&age<700)a=Math.max(a,(4+Math.log10(1+(f.value||1))*4)*(1-age/700));if(f.kind==='rescue'&&age<1200)a=Math.max(a,14*(1-age/1200));if(f.kind==='strike'&&age<250)a=Math.max(a,3);if(f.kind==='omen'&&age<500)a=Math.max(a,6*(1-age/500));if(f.kind==='flip'&&age<1000)a=Math.max(a,18*(1-age/1000));if(f.kind==='gift'&&(f.value||0)>=99&&age<1200)a=Math.max(a,16*(1-age/1200));}return a;}
export function drawWar(scene,c,t,layer){
 const e=scene.warStatus;if(!e?.active)return;const H=scene.height,now=serverNow(scene,t),lx=scene.warLineX??lineX(scene,t),motion=scene.motion!==false,fx=e.fx||[];
 if(layer==='back')warSounds(scene,e,now,t);
 c.save();
 const vel=(lx-(scene.warPrevX??lx));if(layer==='back')scene.warPrevX=lx;
 if(layer==='back'){
  // 08/11 tối: bản đồ riêng VẠN LÝ CHIẾN ĐẠO (đè sân thường) + hai luồng khí đâm nhau ở điểm giao tranh
  const light=feedbackBudget(scene),cam=scene.warCam??0;
  if(!scene.warLandscape&&typeof Image!=='undefined'){scene.warLandscape=new Image();scene.warLandscape.src='/assets/thien-khuyet/war.webp';}
  drawWarRoad(c,{H,cam,lx,t,light,motion,landscape:scene.warLandscape});
  const om=e.omen?.kind;if(om==='golden-sun')glow(c,200,H*.12,420,'#ffd36b',.45);if(om==='blood-moon')glow(c,700,H*.12,380,'#ff2030',.5);
  if(motion&&e.phase==='running'){const cyc=t%4200;if(cyc<220){const a=1-cyc/220;c.save();c.globalCompositeOperation='screen';drawScreenPulse(c,H,scene.reduceFlash,Math.floor(t/4200)%2?'#ffe9b0':'#ffb0b8',a*.16,'screen');c.globalAlpha=a;bolt(c,lx+(rnd(Math.floor(t/4200))-.5)*300,0,lx,H*.4,Math.floor(t/4200)*13,'#ffffff',3);c.restore();}}
  const surge=warSurge(scene,e,now,t),push=Math.max(-1,Math.min(1,vel*.2));
  if(e.phase==='running'){
   const sh=Math.min(12,warShake(e,now))*cameraShakeStrength(scene)*(light?.6:1);
   c.save();
   if(sh)c.translate(Math.sin(t*.09)*sh,Math.cos(t*.077)*sh*.6);
   drawWarForces(c,{H,lx,t,surge,push,light,motion});
   c.restore();
  }
  for(const side of ['chinh','ma'])soldiers(scene,c,e,side,lx,H,t);
  if(motion)drawPushWave(scene,c,lx,H,t);
 }else{
  // tên nhân vật + tướng
  for(const a of scene.targets){if(!a.side)continue;const col=COL[a.side];c.font='800 18px Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#05060c';const nm=Array.from(a.player.name||'').slice(0,12).join('');const y=a.y-170*(a.scale/1.5);
   if(a.general){c.fillStyle=col.main;c.font='900 15px Segoe UI';const g=a.side==='chinh'?'👑 MINH CHỦ':'👑 TÔN CHỦ';c.strokeText(g,a.x,y-22);c.fillText(g,a.x,y-22);c.font='800 18px Segoe UI';}
   c.strokeText(nm,a.x,y);c.fillStyle=col.soft;c.fillText(nm,a.x,y);}
  // đại chiêu khi tặng quà (mỗi quà ~2,5 s), cứu nguy, xuất chiêu
  const flipping=fx.some(f=>f.kind==='flip'&&now-f.at>=0&&now-f.at<2800),newestGift=flipping?null:[...fx].reverse().find(f=>f.kind==='gift'&&now-f.at>=0&&now-f.at<giftDur(f));
  const activeGift=new Set(fx.filter(f=>f.kind==='gift'&&now>=f.at&&now-f.at<giftDur(f)).slice(-3));
  for(const f of fx){const age=now-f.at;if(activeGift.has(f))drawGiftFx(scene,c,f,age,lx,H,t,f===newestGift);
   if(f.kind==='flip'&&age>=0&&age<2800)drawFlip(scene,c,f,age,H,t);
   if(f.kind==='turn'&&age>=0&&age<1900)drawTurn(scene,c,f,age,lx,H,t);
   if(f.kind==='final'&&f.left===30&&age>=0&&age<2400)drawFinal30(c,age,H,t);
   if(f.kind==='rescue'&&age>=0&&age<3200){const k=age/3200,a=Math.sin(k*Math.PI),col=COL[f.side];c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;const x=f.side==='chinh'?lx-160:lx+160,g=c.createLinearGradient(x-90,0,x+90,0);g.addColorStop(0,col.main+'00');g.addColorStop(.5,col.soft);g.addColorStop(1,col.main+'00');c.fillStyle=g;c.fillRect(x-90,0,180,H);
    {const rs=pop(age,700);c.translate(450,H*.32+hop(scene,t,2,12));c.scale(rs,rs);c.translate(-450,-H*.32);}c.font='900 40px Segoe UI';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#05060c';const tx=f.side==='chinh'?'HẠO NHIÊN CHÍNH KHÍ':'MA HỒN BẤT DIỆT';c.strokeText(tx,450,H*.32);c.fillStyle=col.main;c.fillText(tx,450,H*.32);c.restore();}
   if(f.kind==='strike'&&age>=0&&age<600){const a=scene.targets.find(x=>x.id===f.user);if(a){const k=age/600;c.save();c.globalCompositeOperation='screen';c.globalAlpha=1-k;c.strokeStyle=COL[f.side].main;c.lineWidth=4;c.beginPath();c.moveTo(a.x,a.y-80);c.lineTo(a.x+(lx-a.x)*k,a.y-80);c.stroke();c.restore();}}}
  const kk=scene.warKick;if(kk&&e.phase==='running'&&kk.size>=.06&&t-kk.at<700){const age=t-kk.at,side=kk.dir>0?'chinh':'ma',col=COL[side],sc=pop(age,700)*(.9+kk.size*.6);c.save();c.globalAlpha=Math.min(1,(700-age)/250);c.translate(lx+kk.dir*(40+age*.12),H*.46+hop(scene,t,5,10));c.scale(sc,sc);c.font='900 44px Segoe UI';c.textAlign='center';c.lineWidth=8;c.strokeStyle='#05060c';const tx=kk.dir>0?'ĐẨY! ▶▶':'◀◀ ĐẨY!';c.strokeText(tx,0,0);c.fillStyle=col.main;c.fillText(tx,0,0);c.restore();}
  drawTruongPopups(scene,c,e,fx,lx,H,now,t);
  drawHud(scene,c,e,H,now);
  drawCountdown(scene,c,e,H,now,t);
 }
 c.restore();
}
// Độ phình luồng khí: quà (theo coin) > cứu nguy > cú hích tim/chiêu.
function warSurge(scene,e,now,t){const out={chinh:0,ma:0};for(const f of e.fx||[]){const age=now-f.at;if(age<0)continue;if(f.kind==='gift'&&age<1600)out[f.side]=Math.max(out[f.side],(.6+powerOf(f)*1.4)*(1-age/1600));if(f.kind==='rescue'&&age<2000)out[f.side]=Math.max(out[f.side],1.5*(1-age/2000));}
 const kk=scene.warKick;if(kk&&t-kk.at<500){const side=kk.dir>0?'chinh':'ma';out[side]=Math.max(out[side],(.25+kk.size*.6)*(1-(t-kk.at)/500));}return out;}
// Chữ lớn "+N trượng" bật lên cạnh quả cầu mỗi lần tặng quà (tối đa 3 cái mới nhất).
function drawTruongPopups(scene,c,e,fx,lx,H,now,t){const list=fx.filter(f=>f.kind==='gift'&&f.truong>0&&now-f.at>=0&&now-f.at<1800).slice(-3);
 list.forEach((f,i)=>{const age=now-f.at,k=age/1800,col=COL[f.side],dir=f.side==='chinh'?1:-1,sc=pop(age,600)*(1+powerOf(f)*.6),y=H*.33-age*.04-i*46;
  c.save();c.globalAlpha=k<.75?1:(1-k)/.25;c.translate(Math.max(110,Math.min(790,lx+dir*90)),y);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';
  strokeText(c,(dir>0?'▶ ':'◀ ')+'+'+fmtN(f.truong)+' trượng',0,0,'900 40px Segoe UI',col.main,9);
  strokeText(c,Array.from(f.name||'').slice(0,12).join(''),0,30,'800 18px Segoe UI','#ffffff',5);c.restore();});
 const kk=scene.warKick;if(kk&&kk.truong>=8&&!list.some(f=>now-f.at<700)&&t-kk.at<900){const age=t-kk.at,side=kk.dir>0?'chinh':'ma';c.save();c.globalAlpha=1-age/900;c.textAlign='center';strokeText(c,(kk.dir>0?'▶ +':'◀ +')+kk.truong+' trượng',Math.max(110,Math.min(790,lx+kk.dir*80)),H*.36-age*.03,'900 26px Segoe UI',COL[side].soft,6);c.restore();}}
const avatarCache=new Map();
function avatarImg(url){if(!url||typeof Image==='undefined')return null;let im=avatarCache.get(url);if(!im){im=new Image();im.referrerPolicy='no-referrer';im.src=url;avatarCache.set(url,im);if(avatarCache.size>60)avatarCache.delete(avatarCache.keys().next().value);}return im.complete&&im.naturalWidth?im:null;}
function drawTop3(scene,c,e,side,y){const col=COL[side],top=(e.top?.[side]||[]).slice(0,3),dir=side==='chinh'?1:-1,x0=side==='chinh'?84:816;
 top.forEach((r,i)=>{const x=x0+dir*i*62,R=i?20:25,p=scene.playerIndex?.get(r.id),im=avatarImg(p?.avatar);c.save();c.beginPath();c.arc(x,y,R,0,TAU);c.fillStyle=col.deep;c.fill();
  if(im){c.save();c.clip();c.drawImage(im,x-R,y-R,R*2,R*2);c.restore();}else{c.fillStyle=col.soft;c.font='900 '+(R)+'px Segoe UI';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(r.name||'?')[0],x,y+1);}
  c.lineWidth=i?2.5:4;c.strokeStyle=col.main;c.stroke();c.textAlign='center';c.textBaseline='alphabetic';strokeText(c,Array.from(r.name||'').slice(0,7).join(''),x,y+R+15,'800 12px Segoe UI','#ffffff',4);if(!i)strokeText(c,'👑',x,y-R-4,'900 16px Segoe UI',col.main,3);c.restore();});}
function drawHud(scene,c,e,H,now){
 const y=H*.06,x0=60,w=780,hidden=e.omen?.kind==='mist'&&e.phase==='running',T=performance.now();c.save();
 c.fillStyle='#05060cd8';c.beginPath();c.roundRect(x0-14,y-36,w+28,H*.115,14);c.fill();
 // thanh quãng đường: sơn môn Chính ⛩ ··· trung tuyến ··· huyết điện Ma
 const k=hidden?.5:(e.line??50)/100,mx=x0+w*k,z=Math.round(scene.warZ??truongOf(e.line));
 c.fillStyle='#241f30';c.beginPath();c.roundRect(x0,y,w,20,10);c.fill();
 if(!hidden){const lead=k>=.5,g=c.createLinearGradient(x0+w/2,0,mx,0);g.addColorStop(0,'#ffffff40');g.addColorStop(1,lead?'#ffd36b':'#ff3b4e');c.fillStyle=g;c.fillRect(Math.min(mx,x0+w/2),y+2,Math.abs(mx-(x0+w/2)),16);}
 for(let i=1;i<20;i++){c.fillStyle=i===10?'#ffffff':'#ffffff30';c.fillRect(x0+w*i/20-1,y+(i===10?-4:4),2,i===10?28:12);}
 c.font='900 22px Segoe UI';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffd36b';c.fillText('⛩',x0-2,y+10);c.fillStyle='#ff3b4e';c.fillText('⛩',x0+w+2,y+10);
 if(!hidden){glow(c,mx,y+10,26,'#ffffff',.8);c.fillStyle='#ffffff';c.beginPath();c.moveTo(mx,y-6);c.lineTo(mx+9,y+10);c.lineTo(mx,y+26);c.lineTo(mx-9,y+10);c.closePath();c.fill();}
 c.textBaseline='alphabetic';c.font='900 18px Segoe UI';c.textAlign='left';c.fillStyle='#ffd36b';c.fillText('⚔ CHÍNH ĐẠO · '+(e.counts?.chinh||0),x0+190,y-12+hop(scene,T,0,4));c.textAlign='right';c.fillStyle='#ff6b78';c.fillText((e.counts?.ma||0)+' · MA ĐẠO ⚔',x0+w-190,y-12+hop(scene,T,1.6,4));
 const left=e.phase==='registration'?Math.ceil(((e.registrationEndsAt||now)-now)/1000):e.phase==='running'?Math.ceil(((e.endsAt||now)-now)/1000):0;c.textAlign='center';
 if(hidden)strokeText(c,'🌫 SƯƠNG MÙ · không thấy chiến tuyến',450,y+46,'900 20px Segoe UI','#c9d0e0',5);
 else if(e.phase==='running')strokeText(c,Math.abs(z)<15?'GIẰNG CO · TRUNG TUYẾN':(z>0?'CHÍNH ĐẠO':'MA ĐẠO')+' ÉP TỚI '+fmtN(Math.abs(z))+' / 1.000 TRƯỢNG',450,y+46,'900 22px Segoe UI',Math.abs(z)<15?'#ffffff':z>0?'#ffd36b':'#ff6b78',6);
 else if(e.phase==='registration')strokeText(c,'TUYỂN QUÂN · gõ chinh hoặc ma · còn '+Math.max(0,left)+'s',450,y+46,'900 20px Segoe UI','#ffffff',5);
 if(e.phase==='running'){const per=Math.round(3*.85*TRUONG_PER_POINT),heart=Math.round(.85*TRUONG_PER_POINT);c.font='800 15px Segoe UI';c.fillStyle='#e9e2ff';c.fillText('❤ 10 tim ≈ '+heart+' trượng  ·  🎁 1 coin ≈ '+per+' trượng  ·  gõ chien  ·  còn '+Math.max(0,left)+'s',450,y+70);}
 drawTop3(scene,c,e,'chinh',y+102);drawTop3(scene,c,e,'ma',y+102);
 if(e.omen)strokeText(c,OMEN_NAME[e.omen.kind]||'',450,y+108+hop(scene,T,4,8),'900 26px Segoe UI','#fff3c8',6);
 c.restore();}
// 07/11/2026: BẢNG VINH DANH CHÍNH MA — vẽ cố định trên màn hình (không theo camera), 20 giây: phe thắng/thua, phần thưởng mỗi phe, top 3 + danh hiệu.
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function txt(c,s,x,y,font,fill,stroke=6){c.font=font;c.lineWidth=stroke;c.strokeStyle='#05060c';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
const nm=s=>Array.from(String(s||'')).slice(0,14).join('');
const fmtN=n=>Math.round(Number(n)||0).toLocaleString('vi-VN');
export function drawWarResult(scene,c,t){
 const e=scene.warStatus;if(!e?.active||e.phase!=='finished'||!e.result||e.result.empty)return;const H=scene.height,now=serverNow(scene,t),start=e.finishedAt||((e.podiumUntil||now)-20000),age=now-start,end=(e.podiumUntil||now)-now;
 const a=Math.min(1,Math.max(0,age/600),Math.max(0,end/700));if(a<=0)return;const win=e.result.winner,honor=e.result.honor||{},pulse=.5+.5*Math.sin(t*.004);
 c.save();c.globalAlpha=a*.82;c.fillStyle='#04050c';c.fillRect(0,0,900,H);c.globalAlpha=a;c.textAlign='center';c.textBaseline='middle';
 const ty=H*.2;if(win){const g=c.createRadialGradient(450,ty,10,450,ty,360);g.addColorStop(0,COL[win].main+'aa');g.addColorStop(1,COL[win].main+'00');c.globalCompositeOperation='screen';c.globalAlpha=a*(.5+.3*pulse);c.fillStyle=g;c.fillRect(0,ty-260,900,520);c.globalCompositeOperation='source-over';c.globalAlpha=a;}
 txt(c,win?COL[win].name+' ĐẠI THẮNG':'BẤT PHÂN THẮNG BẠI',450,ty,'900 60px Segoe UI',win?COL[win].main:'#ffffff',9);
 txt(c,win?(win==='chinh'?'Ma Đạo':'Chính Đạo')+' bại trận · tông môn ghi công các đạo hữu':'Hai phe ngang tài · cùng nhận thưởng',450,ty+52,'800 24px Segoe UI','#fff3c8',6);
 for(const [k,side] of ['chinh','ma'].entries()){
  const x=k?470:40,w=390,y=H*.3,h=416,col=COL[side],won=win===side,lost=win&&!won,rw=honor.side?.[side];
  c.globalAlpha=a*(lost?.82:1);roundRect(c,x,y,w,h,22);const bg=c.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,col.deep+'f0');bg.addColorStop(1,'#05060cf0');c.fillStyle=bg;c.fill();c.lineWidth=won?5:2.5;c.strokeStyle=won?col.main:col.main+'88';c.stroke();
  const cx=x+w/2;txt(c,col.name,cx,y+40,'900 32px Segoe UI',col.main,6);
  const badge=!win?'HÒA':won?'THẮNG':'THUA';c.font='900 22px Segoe UI';const bw=c.measureText(badge).width+34;roundRect(c,cx-bw/2,y+66,bw,36,18);c.fillStyle=won?col.main:!win?'#cfd6e4':'#3a3d48';c.fill();c.fillStyle=won||!win?'#120a04':'#d8dbe4';c.fillText(badge,cx,y+85);
  if(rw)txt(c,'Cả phe: +'+fmtN(rw.qi)+' tu vi · +'+fmtN(rw.stones)+' linh thạch',cx,y+128,'700 19px Segoe UI','#ffffff',5);
  const top=honor.top?.[side]?.length?honor.top[side]:(e.top?.[side]||[]).slice(0,3);
  if(!top.length)txt(c,'(chưa ai lập công)',cx,y+190,'700 20px Segoe UI','#9aa3b5',4);
  top.slice(0,3).forEach((r,j)=>{const ry=j?y+234+(j-1)*64:y+178;
   if(j===0){txt(c,'👑 '+nm(r.name),cx,ry,'900 30px Segoe UI',col.soft,7);txt(c,(r.title||(side==='chinh'?'Chính Đạo Minh Chủ':'Ma Đạo Tôn Chủ'))+' · 24 giờ',cx,ry+36,'800 20px Segoe UI',col.main,5);if(r.qi)txt(c,'+'+fmtN(r.qi)+' tu vi',cx,ry+64,'800 20px Segoe UI','#fff3c8',5);}
   else{txt(c,(j+1)+'. '+nm(r.name),cx,ry+52,'800 24px Segoe UI','#ffffff',6);if(r.qi)txt(c,'+'+fmtN(r.qi)+' tu vi',cx,ry+80,'700 18px Segoe UI','#fff3c8',4);}});
 }
 c.globalAlpha=a;txt(c,'Tướng đứng đầu mỗi phe nhận danh hiệu 24 giờ · top 3 nhận thêm tu vi',450,H*.3+462,'700 20px Segoe UI','#fff3c8',5);
 c.restore();}

// ===== 08/11/2026: nâng cấp hiệu ứng Chính Ma =====
// Quà: 3 cấp theo coin (<10 / 10–98 / ≥99). Chớp màn theo màu phe → sao chổi lao từ mép phe vào chiến tuyến → sóng xung kích + tia lửa.
// Tên đại chiêu đổi theo từng quà (3 kiểu mỗi phe) để không lặp y hệt. Chỉ quà mới nhất có băng rôn tên.
const ULT={chinh:['VẠN KIẾM QUY TÔNG','THIÊN LÔI PHÁ MA','KIM QUANG PHỔ CHIẾU'],ma:['HUYẾT HẢI MA CHƯỞNG','U MINH QUỶ TRẢO','PHỆ HỒN MA DIỄM']};
const tierOf=f=>(f.value||0)>=500?3:(f.value||0)>=99?2:(f.value||0)>=10?1:0;
function giftDur(f){return [2200,2800,3600,4200][tierOf(f)];}
// 08/11 tối: lực chiêu 0..1 theo coin (log, 1 coin ≈ .1, 1000 coin = 1) — hình chiêu, lực đẩy nhìn thấy và âm thanh đều to dần.
const powerOf=f=>clamp(Math.log10(1+(f.value||1))/3);
function strokeText(c,s,x,y,font,fill,lw=7,stroke='#05060c'){c.font=font;c.lineWidth=lw;c.strokeStyle=stroke;c.lineJoin='round';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
function drawGiftFx(scene,c,f,age,lx,H,t,banner){
 const tier=tierOf(f),dur=giftDur(f),k=age/dur,a=Math.sin(Math.min(1,k)*Math.PI),side=f.side,col=COL[side],seed=hash(f.id),light=feedbackBudget(scene);
 c.save();
 warGiftImpact(c,{age,lx,H,side,tier,seed,light,moved:f.truong||0,reducedFlash:scene.reduceFlash});
 c.restore();
 if(!banner)return;
 // băng rôn: tên đại chiêu + người tặng + coin
 const ult=ULT[side][seed%3],sc=pop(age,650)*(1+.04*Math.abs(Math.sin(t*.02))),by=H*.235+hop(scene,t,1,8);
 c.save();c.globalAlpha=Math.min(1,a*1.6);c.translate(450,by);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';
 const w=640,hgt=tier?108:92,bg=c.createLinearGradient(-w/2,0,w/2,0);bg.addColorStop(0,col.deep+'00');bg.addColorStop(.18,col.deep+'e8');bg.addColorStop(.82,col.deep+'e8');bg.addColorStop(1,col.deep+'00');c.fillStyle=bg;c.fillRect(-w/2,-hgt/2,w,hgt);
 c.fillStyle=col.main;c.fillRect(-w*.32,-hgt/2,w*.64,3);c.fillRect(-w*.32,hgt/2-3,w*.64,3);
 strokeText(c,ult,0,-18,'900 '+(34+tier*6)+'px Segoe UI',col.main,8);
 strokeText(c,Array.from(f.name||'Đạo hữu').slice(0,14).join('')+' · '+fmtN(f.value)+' coin'+(f.capped?' · đẩy tối đa':''),0,22+tier*3,'800 '+(22+tier*2)+'px Segoe UI','#ffffff',6);
 c.restore();
}
// LẬT KÈO: chữ khổng lồ nghiêng, tia sáng xoay phía sau, tên người lật kèo.
function drawFlip(scene,c,f,age,H,t){
 const k=age/2800,a=age<200?age/200:k>.8?(1-k)/.2:1,col=COL[f.side],sc=pop(age,700)*(age<180?1.8-.8*(age/180):1),y=H*.36;
 c.save();c.globalAlpha=a;c.translate(450,y);
 c.save();c.globalCompositeOperation='screen';c.rotate(t*.0008);for(let i=0;i<16;i++){c.rotate(TAU/16);c.fillStyle=(i%2?col.main:'#ffffff')+'55';c.beginPath();c.moveTo(0,0);c.lineTo(-40,-520);c.lineTo(40,-520);c.closePath();c.fill();}c.restore();
 c.rotate(-.06);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';
 const g=c.createLinearGradient(0,-70,0,60);g.addColorStop(0,'#ffffff');g.addColorStop(.45,col.main);g.addColorStop(1,f.side==='chinh'?'#c98a1a':'#8a0a18');
 strokeText(c,'LẬT KÈO!',0,0,'900 112px Segoe UI',g,14);
 strokeText(c,Array.from(f.name||'').slice(0,14).join('')+' · '+(f.side==='chinh'?'CHÍNH ĐẠO':'MA ĐẠO')+' VƯỢT LÊN',0,84,'900 30px Segoe UI',col.soft,7);
 c.restore();
}
// PHẢN CÔNG (tim/chiêu đổi chiều): chữ vừa, mũi tên theo hướng đẩy.
function drawTurn(scene,c,f,age,lx,H,t){
 const k=age/1900,a=age<150?age/150:k>.75?(1-k)/.25:1,col=COL[f.side],dir=f.side==='chinh'?1:-1,sc=pop(age,600);
 c.save();c.globalAlpha=a;c.translate(450+dir*k*60,H*.37+hop(scene,t,7,8));c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';
 strokeText(c,(dir>0?'':'◀◀ ')+(f.side==='chinh'?'CHÍNH ĐẠO':'MA ĐẠO')+' PHẢN CÔNG!'+(dir>0?' ▶▶':''),0,0,'900 54px Segoe UI',col.main,10);c.restore();
}
function drawFinal30(c,age,H,t){const k=age/2400,a=age<200?age/200:k>.8?(1-k)/.2:1,sc=pop(age,600);c.save();c.globalAlpha=a*(.75+.25*Math.abs(Math.sin(t*.012)));c.translate(450,H*.2);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';strokeText(c,'⏳ 30 GIÂY CUỐI',0,0,'900 58px Segoe UI','#ff5566',10);c.restore();}
// Đếm ngược 10 giây cuối: số khổng lồ giữa màn, mỗi giây nảy to rồi nhỏ lại; 5 giây cuối viền đỏ nhấp nháy, 3 giây cuối rung.
function drawCountdown(scene,c,e,H,now,t){
 if(e.phase!=='running')return;const left=(e.endsAt||now)-now;if(left<=0||left>10000)return;
 const sec=Math.ceil(left/1000),p=(left%1000)/1000,lead=e.lead||(e.line>=50?'chinh':'ma'),col=COL[lead],sc=1+.55*p*p,y=H*.45;
 c.save();
 if(sec<=5){const v=c.createRadialGradient(450,H*.5,H*.25,450,H*.5,H*.75);v.addColorStop(0,'#ff000000');v.addColorStop(1,'#ff1030'+Math.round(80+100*p).toString(16).padStart(2,'0'));c.fillStyle=v;c.fillRect(0,0,900,H);}
 const sh=sec<=3&&scene.motion!==false?(p*8):0;c.translate(450+Math.sin(t*.09)*sh,y+Math.cos(t*.07)*sh);c.scale(sc,sc);c.textAlign='center';c.textBaseline='middle';
 c.globalAlpha=.5+.5*p;c.globalCompositeOperation='screen';glow(c,0,0,200,sec<=3?'#ff3040':col.main,.7*p);c.globalCompositeOperation='source-over';c.globalAlpha=.62+.38*p;
 strokeText(c,String(sec),0,0,'900 340px Segoe UI',sec<=3?'#ff4a5a':'#ffffff',18,col.deep);
 c.restore();
}
// Cú đẩy: sóng lưỡi liềm lao về phía phe bị đẩy, mảnh vụn văng, nửa sân của phe đang đẩy bừng sáng.
function drawPushWave(scene,c,lx,H,t){
 const kk=scene.warKick;if(!kk||kk.size<.06)return;const age=t-kk.at;if(age<0||age>650)return;const k=age/650,dir=kk.dir,side=dir>0?'chinh':'ma',col=COL[side],s=Math.min(1,.35+kk.size);
 c.save();c.globalCompositeOperation='screen';
 c.globalAlpha=.32*s*(1-k);const g=dir>0?c.createLinearGradient(0,0,lx,0):c.createLinearGradient(900,0,lx,0);g.addColorStop(0,col.main+'00');g.addColorStop(1,col.main);c.fillStyle=g;if(dir>0)c.fillRect(0,0,lx,H);else c.fillRect(lx,0,900-lx,H);
 for(let r=0;r<2;r++){const x=lx+dir*(age*.55-r*40);c.globalAlpha=(1-k)*(r?.5:.9)*s;c.strokeStyle=r?col.soft:col.main;c.lineWidth=(14-r*6)*s;c.beginPath();c.ellipse(x-dir*120,H*.5,140,H*.36,0,dir>0?-Math.PI/2.4:Math.PI-Math.PI/2.4,dir>0?Math.PI/2.4:Math.PI+Math.PI/2.4);c.stroke();}
 const seed=Math.floor(kk.at);for(let i=0;i<(scene.budget?.level==='light'?10:22);i++){const sp=.3+rnd(seed+i)*.6,x=lx+dir*age*sp,y=H*(.2+rnd(seed+i*7)*.65)-age*.08+age*age*.0003;c.globalAlpha=(1-k)*s;c.fillStyle=i%2?col.main:'#ffffff';c.fillRect(x,y,5,3);}
 c.restore();
}
