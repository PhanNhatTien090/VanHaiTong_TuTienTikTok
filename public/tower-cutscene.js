// 18/11/2026 (chủ game: "quà trợ trận 100 bên Tháp yếu, hiệu ứng như shit"): CHIẾU RIÊNG quà ≥100 ở VÂN HẢI THÁP.
// Server (tower.mjs queueCut) xếp lịch + TẠM DỪNG cả tháp trong lúc chiếu. Bỏ sân, chỉ vẽ người leo + thủ vệ → làm mạnh tay.
// • 100 THIÊN HỎA LIỆU NGUYÊN (4,6 s): tụ hỏa → trời mưa hỏa trụ + sóng lửa quét ngang → thủ vệ bốc cháy, mất 85% máu.
// • 500 VẠN KIẾM QUY TÔNG (5,6 s): vạn kiếm hiện quanh người leo → xoáy lên trời → đồng loạt lao xuống + cự kiếm chém dọc → thủ vệ vỡ tan.
// Ghi rõ: người tặng (ảnh quà thật) → người leo, tên chiêu, số máu mất, "PHÁ TẦNG" nếu hạ gục. Biến thể theo mã màn.
import {drawCaster,drawCutInBand,cutVeil,txt,giftImg,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {fxVariant,PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawBeam,drawSkyLances,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';
import {giftFor} from './gift-icons.js';
const TAU=Math.PI*2,ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const fmt=n=>Math.round(Number(n)||0).toLocaleString('vi-VN');
const short=(s,n=22)=>{const a=Array.from(String(s||'').trim());return a.length>n?a.slice(0,n-1).join('')+'…':a.join('');};
const hasDoc=()=>typeof document!=='undefined';
const nowOf=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const FIRE={main:'#ff6a1f',soft:'#ffd7a0',gold:'#ffe28a',deep:'#1a0602'};

export function syncTowerCut(scene,state){scene.towerStatus=state?.tower||null;if(state?.giftArt)scene.towerGiftArt=state.giftArt;}
/** Màn đang chiếu (hoặc null). */
export function findTowerCut(t,now){let best=null;for(const x of t?.cuts||[]){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

const GUARD=new Map();let SHEET=null;
function guardArt(g){
 if(!g||typeof Image==='undefined')return null;
 if(!SHEET){const im=new Image();im.decoding='async';SHEET={im,ok:false};im.onload=()=>SHEET.ok=true;im.src='/assets/events-v1/celestial-bosses-v1.webp';}
 if(!SHEET.ok)return null;const key=g.art+'|'+g.hue;if(GUARD.has(key))return GUARD.get(key);
 let cv=null;if(typeof OffscreenCanvas!=='undefined')cv=new OffscreenCanvas(512,1024);else if(hasDoc()){cv=document.createElement('canvas');cv.width=512;cv.height=1024;}if(!cv)return null;
 const c=cv.getContext('2d');if(g.hue)c.filter=`hue-rotate(${g.hue}deg)`;c.drawImage(SHEET.im,g.art*512,0,512,1024,0,0,512,1024);c.filter='none';GUARD.set(key,cv);return cv; // lọc màu 1 lần, cache
}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn (bỏ sân). */
export function towerCutFrame(scene,c,t,H){
 const tw=scene.towerStatus,cut=tw?findTowerCut(tw,nowOf(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.towerCutOn!==!!cut){scene.towerCutOn=!!cut;if(hasDoc())document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.towerVeilUsed){scene.towerVeilUsed=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 if(scene.canvas)c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 try{drawTowerCut(scene,c,t,H,cut.x,cut.k);}catch(err){console.warn('[tower-cut]',err);return false;}
 const seen=scene.towerCutSeen??=new Set(),cue=(key,k0,fn)=>{const id=cut.x.id+':'+key;if(cut.k>=k0&&!seen.has(id)){seen.add(id);fn();}};
 cue('shout',CUT_PHASE.shout,()=>scene.onFeedbackSound?.('hit',2));cue('hit',CUT_PHASE.cast,()=>{scene.onSpectacleImpact?.();scene.onFeedbackSound?.('hit',3);});
 if(seen.size>60)scene.towerCutSeen=new Set([...seen].slice(-20));
 return true;
}

function drawGuardian(c,g,x,feet,h,a,t,{shake=0,burn=0,shatter=0,flip=true}={}){
 const art=guardArt(g);if(a<=.01)return;const w=h/2,sx=shake?Math.sin(t*.09)*shake:0;
 c.save();c.globalAlpha=a*(1-shatter);c.translate(x+sx,feet);if(flip)c.scale(-1,1);
 if(art)c.drawImage(art,-w/2,-h,w,h);else{c.fillStyle='#2a1030';c.beginPath();c.ellipse(0,-h*.45,w*.35,h*.42,0,0,TAU);c.fill();}
 c.restore();c.globalAlpha=1;
 if(burn>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const u=((t*.0011*(1+rn(i)))+rn(i+3))%1;dot(c,i%3?'#ff6a1f':'#ffd36b',x+(rn(i+5)-.5)*w*.8,feet-u*h*.95,16+rn(i)*22,burn*(1-u)*.9);}c.restore();}
 if(shatter>0){c.save();for(let i=0;i<18;i++){const q=rn(i+11)*TAU,d=out3(shatter)*(160+rn(i)*340),px=x+Math.cos(q)*d,py=feet-h*.5+Math.sin(q)*d*.8+shatter*shatter*200,s=18+rn(i+2)*30;c.globalAlpha=1-shatter;c.save();c.translate(px,py);c.rotate(shatter*6*(i%2?1:-1));c.fillStyle=i%3?'#2a1030':'#ffe28a';c.beginPath();c.moveTo(0,-s);c.lineTo(s*.7,s*.6);c.lineTo(-s*.6,s*.4);c.closePath();c.fill();c.restore();}c.restore();c.globalAlpha=1;}
}
function fireRain(c,gx,gy,u,t,light,seed){if(u<=0)return;const n=light?8:16;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const s0=rn(seed+i)*.55,k=clamp((u-s0)/.35);if(k<=0||k>=1.3)continue;const tx=gx+(rn(seed+i+7)-.5)*420,ty=gy-(rn(seed+i+3))*60,sx=tx-180+rn(seed+i+9)*80,sy=-120,hx=sx+(tx-sx)*Math.min(1,k),hy=sy+(ty-sy)*Math.min(1,k);
  const g=c.createLinearGradient(sx,sy,hx,hy);g.addColorStop(0,'#ff6a1f00');g.addColorStop(.7,'#ff6a1f');g.addColorStop(1,'#fff3c0');c.globalAlpha=k>1?1-(k-1)/.3:1;c.strokeStyle=g;c.lineWidth=22;c.beginPath();c.moveTo(sx,sy);c.lineTo(hx,hy);c.stroke();dot(c,'#ffd36b',hx,hy,40,c.globalAlpha);if(k>=1)dot(c,'#ff6a1f',tx,ty,110*(k-.9)*3,(1.3-k)*1.6);}
 c.restore();c.globalAlpha=1;}
function fireWave(c,x0,x1,y,u,fade,dir){if(u<=0||fade<=.01)return;const x=x0+(x1-x0)*easeIn(u);c.save();c.globalCompositeOperation='lighter';
 for(let j=0;j<5;j++){const R=180+j*40;c.globalAlpha=fade*(.9-j*.15);const g=c.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,j?'#ffb05a':'#ffffff');g.addColorStop(.5,'#ff6a1f');g.addColorStop(1,'#ff6a1f00');c.fillStyle=g;c.beginPath();c.ellipse(x-dir*j*50,y,R*.6,R*1.4,0,0,TAU);c.fill();}c.restore();c.globalAlpha=1;}
function swordRing(c,x,y,n,R,a,t,spin,col){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<n;i++){const q=i/n*TAU+t*.002*spin,px=x+Math.cos(q)*R,py=y+Math.sin(q)*R*.45;c.globalAlpha=a;c.strokeStyle=i%3?col:'#ffffff';c.lineWidth=5;c.beginPath();c.moveTo(px,py-34);c.lineTo(px,py+34);c.stroke();c.lineWidth=10;c.beginPath();c.moveTo(px-12,py+20);c.lineTo(px+12,py+20);c.stroke();}c.restore();c.globalAlpha=1;}
function swordFall(c,gx,gy,u,light,seed,col){if(u<=0)return;const n=light?24:56;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const s0=rn(seed+i)*.5,k=clamp((u-s0)/.3);if(k<=0||k>=1.2)continue;const tx=gx+(rn(seed+i+4)-.5)*460,ty=gy-rn(seed+i+8)*500,ang=(rn(seed+i+2)-.5)*.5,L=1100,sx=tx-Math.sin(ang)*L,sy=ty-Math.cos(ang)*L,hx=sx+(tx-sx)*Math.min(1,k),hy=sy+(ty-sy)*Math.min(1,k);
  c.globalAlpha=k>1?1-(k-1)/.2:.95;c.strokeStyle=i%4?col:'#ffffff';c.lineWidth=4;c.beginPath();c.moveTo(hx-Math.sin(ang)*120,hy-Math.cos(ang)*120);c.lineTo(hx,hy);c.stroke();dot(c,'#ffffff',hx,hy,10,c.globalAlpha);}
 c.restore();c.globalAlpha=1;}
function giantSword(c,x,y0,y1,u,a,col){if(u<=0||a<=.01)return;const y=y0+(y1-y0)*easeIn(u);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=a;
 const g=c.createLinearGradient(x-60,0,x+60,0);g.addColorStop(0,col+'00');g.addColorStop(.5,'#ffffff');g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.moveTo(x,y+40);c.lineTo(x+46,y-120);c.lineTo(x+40,y-900);c.lineTo(x-40,y-900);c.lineTo(x-46,y-120);c.closePath();c.fill();
 c.fillStyle=col;c.fillRect(x-130,y-930,260,30);c.restore();c.globalAlpha=1;}

export function drawTowerCut(scene,c,t,H,x,k){
 const big=x.tier==='g500',h=hash(x.id),V=fxVariant(h),P=big?PALETTES.gold:FIRE,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const ms=x.ms||4600,secOf=k0=>(k-k0)*ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast),HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const A=scene.playerIndex?.get(x.user),dir=V.flip?-1:1,X=v=>dir>0?v:900-v;
 const ax=X(-100+ease(shoutK/.6)*330),ay=H*.8,chestA=ay-330,handX=ax+dir*70,gx=X(650),gy=H*.78,gH=760,chestG=gy-gH*.5;
 const toG=smooth(seg(castK,.4,1)),cx=ax+(gx-ax)*toG,cy=chestA+(chestG-chestA)*toG;
 const zoom=motion?1+.08*smooth(charge)-.06*smooth(castK)+punch(relSec,.05)+punch(hitFx,.12):1;
 const shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.7?(1-hitFx/.7)*(big?24:18):comp*5;
 fxCamera(c,cx,cy,zoom,shake,t);
 const dutch=motion?V.spin*.04*smooth(charge)*(1-smooth(castK)):0;if(dutch){c.translate(cx,cy);c.rotate(dutch);c.translate(-cx,-cy);}
 // nền: đỉnh tháp giữa mây
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep);g.addColorStop(.6,'#040306');g.addColorStop(1,P.deep);c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 dot(c,P.main,450,H*.5,H*.55,.2);
 c.save();c.globalAlpha=.4;c.strokeStyle=P.main;c.lineWidth=2;for(let i=0;i<6;i++){const yy=H*.84+i*i*9;c.beginPath();c.moveTo(-100,yy);c.lineTo(1000,yy);c.stroke();}c.restore();c.globalAlpha=1;
 // TỤ KHÍ
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,ax,ay,chargeA*.9,t,P);
 drawCircle(c,ax,ay-8,280,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,ax,chestA,charge*.7*(1-castK),t,P,light,H);
 drawAura(c,ax,ay,620,290,Math.max(chargeA,.45*(castK>0?1-castK:0)),t,P,light);
 if(big)swordRing(c,ax,chestA-40,light?12:24,200+40*smooth(charge),smooth(charge)*(1-seg(castK,.1,.4)),t,V.spin,P.main);
 // THỦ VỆ
 const ko=!!x.ko,hitOn=hitSec>=0&&!HS.frozen;
 drawGuardian(c,x.guardian,gx,gy,gH,1,t,{shake:hitOn&&hitFx<1?(1-hitFx)*14:0,burn:!big&&hitSec>=0?1-seg(hitFx,1.2,2):0,shatter:ko&&big&&hitSec>=0?seg(hitFx,.15,1.2):0});
 // NGƯỜI LEO
 drawCaster(scene,c,A,ax,ay,5.2,t,dir<0);
 drawInflow(c,handX,chestA,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);
 drawCompress(c,handX,chestA,comp,t,P);
 if(relSec>=0)drawBurst(c,handX,chestA,relSec,P,H,{light,pillar:false,scale:.55,seed:V.style+1,reduceFlash:rf});
 // PHÁT CHIÊU
 const fade=1-seg(k,CUT_PHASE.hit-.04,CUT_PHASE.hit+.04);
 if(castK>0&&k<CUT_PHASE.hit+.05){
  if(big){swordRing(c,ax,chestA-40-castK*900,light?12:24,240,1-seg(castK,0,.35),t,V.spin*3,P.main);swordFall(c,gx,gy,seg(castK,.25,1)+seg(k,CUT_PHASE.cast,CUT_PHASE.hit)*.6,light,h%97,P.main);giantSword(c,gx,-200,chestG+40,seg(castK,.6,1),fade,P.main);}
  else{fireRain(c,gx,gy,seg(castK,.05,1)+seg(k,CUT_PHASE.cast,CUT_PHASE.hit)*.5,t,light,h%89);fireWave(c,handX,gx+dir*60,chestG+80,seg(castK,.35,1),fade,dir);drawBeam(c,handX,chestA,gx,chestG,out3(seg(castK,.5,.9)),fade,t,P,light,140);}}
 // TRÚNG
 if(hitOn){drawBurst(c,gx,chestG,hitFx,P,H,{light,pillar:true,scale:big?1.5:1.25,ground:gy,seed:h%7,reduceFlash:rf});
  if(big)drawSkyLances(c,gx,gy,.6+hitFx*.4,t,P,light,h%61,-200);}
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),cx,cy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,gx,chestG,hitSec/.1,P,h%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),18);
 if(relSec>=0&&relSec<.25&&motion)drawGhostSplit(c,.6*(1-relSec/.25),10);
 drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,dir,t,{label:'TẦNG '+fmt(x.floor)});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 // CHỮ: người tặng (ảnh quà) → trợ trận người leo
 const who=short(x.userName),from=short(x.fromName),self=x.from===x.user,shoutA=1-seg(castK,0,.18);
 if(shoutA>0){c.globalAlpha=shoutA;const gi=giftFor(scene.towerGiftArt,x.value),im=gi.url?giftImg(gi.url):null,line=self?who+' TUNG ĐẠI CHIÊU!':from+' TRỢ TRẬN!';
  const pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.save();c.translate(450,H*.2);c.scale(pop,pop);if(im)c.drawImage(im,-60,-150,120,120);txt(c,line,0,0,56,'#fff6dc',{width:12,max:860});c.restore();
  txt(c,self?'Vân Hải Tháp · tầng '+fmt(x.floor):'cho '+who+' · tầng '+fmt(x.floor),450,H*.2+56,28,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600*dir,tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,big?'#ffd34d':'#ffb05a');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,x.name,450,H*.13,72,tg,{width:14,max:880});c.restore();}
 if(k>=CUT_PHASE.cast){const u=seg(k,CUT_PHASE.cast,CUT_PHASE.wipeOut),pop=1+.6*(1-ease(seg(u,0,.25)));
  c.save();c.translate(450,H*.36);c.scale(pop,pop);txt(c,'-'+fmt(x.dmg)+' máu',0,0,78,'#ffd54a',{width:14,max:860});c.restore();
  txt(c,ko?'THỦ VỆ BẠI TRẬN · PHÁ TẦNG!':big?'VẠN KIẾM XUYÊN THÂN!':'THỦ VỆ CHÁY RỤI GẦN HẾT MÁU!',450,H*.36+72,40,ko?'#ffffff':'#ffd7a0',{width:9,max:860});}
 const o=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
