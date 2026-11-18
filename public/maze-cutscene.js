// 18/11/2026 (chủ game: quà ≥99 → CHIẾU RIÊNG): MÊ CUNG — server maze.mjs mazeCut. Đua về đích nên không dừng người khác (chỉ cộng giờ).
//  walk     TỐC HÀNH PHÁ TRẬN   — người tặng lao vụt dọc hành lang mê cung, tường vỡ tung, yêu thú bị chém bay, "+N Ô"
//  teleport THUẤN DI THẦN THÔNG — tan thành ánh sáng, cổng không gian mở, hiện ra trước CỬA RA
import {drawCaster,drawCutInBand,cutVeil,txt,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {fxVariant,PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';

const KIND={walk:{pal:'jade',label:'TỐC HÀNH PHÁ TRẬN',sub:'xuyên tường phá trận'},teleport:{pal:'violet',label:'THUẤN DI THẦN THÔNG',sub:'tốc biến tới cửa ra'}};
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
const ease=k=>1-(1-clamp(k))**3,TAU=Math.PI*2,rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const IMG=new Map();function img(src){if(typeof Image==='undefined')return null;let g=IMG.get(src);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=src;IMG.set(src,g);}return g.ok?g.im:null;}
const RUINS='/assets/event-maps-v1/maze-ruins.webp';
const nowOf=(scene,t)=>(scene.mazeServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.mazeReceivedAt||t)));
export function findMazeCut(e,now){if(!e?.cuts?.length)return null;let best=null;for(const x of e.cuts){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

export function mazeCutFrame(scene,c,t,H){
 const e=scene.mazeStatus;if(e?.cuts?.length)img(RUINS);
 const cut=e?findMazeCut(e,nowOf(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.mazeCutOn!==!!cut){scene.mazeCutOn=!!cut;if(typeof document!=='undefined')document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.mazeVeilUsed){scene.mazeVeilUsed=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 try{drawMazeCut(scene,c,t,H,cut.x,cut.k);}catch(err){console.warn('[maze-cut]',err);return false;}
 const seen=scene.mazeCutSeen??=new Set(),hitKey=cut.x.id+':hit';if(cut.k>=CUT_PHASE.cast&&!seen.has(hitKey)){seen.add(hitKey);if(seen.size>30)scene.mazeCutSeen=new Set([...seen].slice(-10));scene.onFeedbackSound?.('hit',3);}
 return true;
}
// hành lang mê cung phối cảnh: 2 dãy tường gạch chạy vào điểm tụ, cuộn theo tốc độ
function corridor(c,H,P,scroll,a){
 const vx=450,vy=H*.42;c.save();c.globalAlpha=a;
 for(let i=0;i<14;i++){const z=((i+scroll)%14)/14,d=1-z,s=.08+d*d*1.5,y=vy+H*.5*s,w=450*s;if(s<.09)continue;
  c.fillStyle=i%2?'#3a5a4c':'#2c4a3e';c.fillRect(vx-w-110*s,y-260*s,110*s,260*s);c.fillRect(vx+w,y-260*s,110*s,260*s);
  c.strokeStyle=P.main;c.globalAlpha=a*.85*d;c.lineWidth=2+3*d;c.strokeRect(vx-w-110*s,y-260*s,110*s,260*s);c.strokeRect(vx+w,y-260*s,110*s,260*s);c.globalAlpha=a;}
 c.globalCompositeOperation='lighter';c.globalAlpha=a*.6;for(let i=0;i<8;i++){const z=((i*.13+scroll*.07)%1),y=vy+H*.5*(.08+z*z*1.5);dot(c,P.main,vx,y,40+z*200,.25);}
 c.restore();}
export function drawMazeCut(scene,c,t,H,x,k){
 const K=KIND[x.kind]||KIND.walk,h=hash(x.id),V=fxVariant(h),P=PALETTES[K.pal]||PALETTES.jade;
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const ms=x.ms||3600,secOf=k0=>(k-k0)*ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast);
 const HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const A=(scene.playerIndex||new Map()).get(x.user),ay=H*.84,chest=ay-330;
 const zoom=motion?1+.06*smooth(charge)+punch(relSec,.05)+punch(hitFx,.1):1,shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.6?(1-hitFx/.6)*16:comp*5+(x.kind==='walk'&&castK>0?3:0);
 fxCamera(c,450,H*.55,zoom,shake,t);
 c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
 const ru=img(RUINS);if(ru){const s=Math.max(900/ru.naturalWidth,H/ru.naturalHeight)*1.1;c.globalAlpha=.35;c.drawImage(ru,450-ru.naturalWidth*s/2,H*.5-ru.naturalHeight*s/2,ru.naturalWidth*s,ru.naturalHeight*s);c.globalAlpha=1;}
 const speed=x.kind==='walk'?(.3+6*smooth(castK)*(1-seg(hitFx,0,.8))):.3;corridor(c,H,P,t*.0003*speed+castK*8,.9);
 {const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep+'aa');g.addColorStop(.6,'#03030666');g.addColorStop(1,P.deep+'dd');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);}
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,450,ay,chargeA*.9,t,P);drawCircle(c,450,ay-8,250,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,450,chest,Math.max(charge*.7*(1-castK),x.kind==='walk'?castK*.9:0),t,P,light,H);drawAura(c,450,ay,560,260,Math.max(chargeA,.4*(castK>0?1-castK:0)),t,P,light);
 if(x.kind==='walk'){ // tường vỡ + yêu thú bay ra hai bên trong lúc lao
  c.save();c.globalCompositeOperation='lighter';for(let j=0;j<3;j++){const p=seg(castK,j*.25,j*.25+.3);if(p<=0||p>=1)continue;c.globalAlpha=(1-p);c.strokeStyle=j%2?P.main:'#ffffff';c.lineWidth=22*(1-p)+4;c.beginPath();c.ellipse(450,H*.5,320+p*120,90,(j%2?-.5:.5),Math.PI*.1,Math.PI*.9);c.stroke();}c.globalAlpha=1;
  const n=light?20:50;for(let i=0;i<n;i++){const lag=rn(i)*.8,p=clamp((castK-lag)/.25);if(p<=0||p>=1)continue;const side=i%2?1:-1,sx=450+side*(80+p*480),sy=H*.5+(rn(i+3)-.5)*300-p*120;
   c.globalAlpha=1-p;c.fillStyle=i%3?'#7d8a80':P.main;c.save();c.translate(sx,sy);c.rotate(p*8*side);c.fillRect(-30,-18,60,36);c.restore();dot(c,P.main,sx,sy,24,(1-p)*.5);}c.restore();c.globalAlpha=1;}
 // người tặng: đứng giữa; walk = lướt tới (to dần + nhòe); teleport = tan thành ánh sáng rồi hiện ở cửa ra
 if(x.kind==='teleport'){const vanish=seg(castK,0,.4),appear=seg(hitFx,0,.5);const gateY=H*.5;
  drawCircle(c,450,gateY,300,smooth(seg(castK,.2,.6))*(1-seg(hitFx,.6,1.4)),t,P,-V.spin);dot(c,P.soft,450,gateY,320*smooth(seg(castK,.2,.7)),.85*(1-seg(hitFx,.4,1.2)));drawCircle(c,450,gateY,190,smooth(seg(castK,.3,.7))*(1-seg(hitFx,.6,1.4)),t,P,V.spin);
  if(hitSec<0){if(vanish<.45)drawCaster(scene,c,A,450,ay,5*(1-vanish*.3),t,false); /* drawCaster tự đặt alpha → ẩn hẳn khi đã tan */c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?16:40);i++){const a=rn(i)*TAU,r=(1-seg(castK,.3,1))*(80+rn(i+1)*200),cy=chest+(gateY-chest)*seg(castK,.3,1);dot(c,i%2?P.main:'#ffffff',450+Math.cos(a+castK*4)*r,cy+Math.sin(a+castK*4)*r*.8,12,Math.min(1,vanish*2)*(1-seg(castK,.85,1)));}c.restore();}
  else{c.globalAlpha=appear;drawCaster(scene,c,A,450,ay,5,t,false);c.globalAlpha=1;txt(c,'CỬA RA',450,H*.62,46,'#ffe9a8',{width:9});}
 }else{const lunge=ease(seg(castK,0,.5)),sc=5+lunge*.6;if(lunge>0&&motion){c.save();c.globalAlpha=.35*(1-castK);drawCaster(scene,c,A,450,ay+20,sc-.4,t,false);c.restore();}drawCaster(scene,c,A,450,ay,sc,t,false);}
 drawInflow(c,450,chest,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);drawCompress(c,450,chest,comp,t,P);
 if(relSec>=0)drawBurst(c,450,chest,relSec,P,H,{light,pillar:false,scale:.55,seed:V.style+1,reduceFlash:rf});
 if(hitSec>=0&&!HS.frozen)drawBurst(c,450,H*.5,hitFx,P,H,{light,pillar:true,scale:1.1,ground:ay,seed:h%7,reduceFlash:rf});
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),450,H*.55);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,450,H*.5,hitSec/.1,P,h%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),14);
 drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,1,t,{label:'MÊ CUNG'});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 const name=Array.from(String(x.name||A?.name||'')).slice(0,14).join(''),shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const chars=Array.from(name+' XUẤT CHIÊU!'),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,60,'#fff6dc',{width:12,max:860});c.restore();txt(c,K.sub,450,H*.2+56,26,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600,tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,K.label,450,H*.13,66,tg,{width:14,max:880});txt(c,name,450,H*.13+56,26,'#ffffff',{width:5,weight:'800',max:820});c.restore();}
 if(k>=CUT_PHASE.cast&&x.kind==='walk'&&x.cells){const u=seg(k,CUT_PHASE.cast,CUT_PHASE.wipeOut),pop=1+.5*(1-ease(seg(u,0,.25)));c.save();c.translate(450,H*.36);c.scale(pop,pop);txt(c,'+'+x.cells+' Ô',0,0,84,'#ffd54a',{width:14});c.restore();}
 const o=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
