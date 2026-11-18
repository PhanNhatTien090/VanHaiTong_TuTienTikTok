// 18/11/2026 (chủ game: quà ≥99 hiệu ứng yếu → CHIẾU RIÊNG): KHAI LÒ — quà ≥99 → màn riêng người tặng theo pha (server alchemy.mjs alchemyCut, lò tạm dừng):
//  herb   BÁCH THẢO QUY LÔ   — trăm dược liệu phát sáng xoáy bay vào miệng lò, lò rực xanh lục
//  fire   THẦN HỎA LUYỆN ĐAN — người tặng phóng dòng thần hỏa xanh trắng vào đáy lò, lò bùng lửa, đan quang vọt lên trời
//  shield KIM CHUNG HỘ ĐAN   — sấm kiếp giáng xuống, chuông vàng úp trùm lò đỡ sét, sét vỡ tan
import {drawCaster,drawCutInBand,cutVeil,txt,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {fxVariant,PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';

const ROLE={herb:{pal:'jade',label:'BÁCH THẢO QUY LÔ',sub:'trăm dược liệu nhập lò'},fire:{pal:'azure',label:'THẦN HỎA LUYỆN ĐAN',sub:'thần hỏa nhập lò'},shield:{pal:'gold',label:'KIM CHUNG HỘ ĐAN',sub:'hộ lò chống đan kiếp'}};
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
const ease=k=>1-(1-clamp(k))**3,TAU=Math.PI*2;
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const IMG=new Map();
function img(src){if(typeof Image==='undefined')return null;let g=IMG.get(src);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=src;IMG.set(src,g);}return g.ok?g.im:null;}
const HALL='/assets/event-maps-v1/alchemy-hall.webp',POT='/assets/event-maps-v1/alchemy-cauldron.webp',BELL='/assets/phap-bao-v1/s5-chung.webp'; // chuông = ảnh Đông Hoàng Chung có sẵn
const nowOf=(scene,t)=>(scene.alcServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.alcReceivedAt||t)));

export function findAlchemyCut(e,now){if(!e?.cuts?.length)return null;let best=null;for(const x of e.cuts){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn (bỏ sân). */
export function alchemyCutFrame(scene,c,t,H){
 const e=scene.alcStatus;if(e?.cuts?.length){img(HALL);img(POT);img(BELL);}
 const cut=e?findAlchemyCut(e,nowOf(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.alcCutOn!==!!cut){scene.alcCutOn=!!cut;if(typeof document!=='undefined')document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.alcVeilUsed){scene.alcVeilUsed=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 try{drawAlchemyCut(scene,c,t,H,cut.x,cut.k);}catch(err){console.warn('[alchemy-cut]',err);return false;}
 const seen=scene.alcCutSeen??=new Set(),hitKey=cut.x.id+':hit';if(cut.k>=CUT_PHASE.cast&&!seen.has(hitKey)){seen.add(hitKey);if(seen.size>30)scene.alcCutSeen=new Set([...seen].slice(-10));scene.onFeedbackSound?.('hit',3);scene.onSpectacleImpact?.();}
 return true;
}

export function drawAlchemyCut(scene,c,t,H,x,k){
 const R=ROLE[x.role]||ROLE.fire,h=hash(x.id),V=fxVariant(h),P=PALETTES[R.pal]||PALETTES.gold;
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,dir=V.flip?-1:1,X=v=>dir>0?v:900-v;
 const ms=x.ms||4000,secOf=k0=>(k-k0)*ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast);
 const HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const A=(scene.playerIndex||new Map()).get(x.user);
 const ax=X(-100+ease(shoutK/.6)*320),ay=H*.82,chestA=ay-330,handX=ax+dir*70;
 const px=X(620),pw=600,pot=img(POT),ph=pot?pw*pot.naturalHeight/pot.naturalWidth:380,py=H*.78,mouthY=py-ph*.78,coreY=py-ph*.45; // lò đan
 const zoom=motion?1+.07*smooth(charge)-.05*smooth(castK)+punch(relSec,.05)+punch(hitFx,.1):1,shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.7?(1-hitFx/.7)*18:comp*5;
 fxCamera(c,450,H*.55,zoom,shake,t);
 c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
 const hall=img(HALL);if(hall){const s=Math.max(900/hall.naturalWidth,H/hall.naturalHeight)*1.1;c.globalAlpha=.45;c.drawImage(hall,450-hall.naturalWidth*s/2,H*.5-hall.naturalHeight*s/2,hall.naturalWidth*s,hall.naturalHeight*s);c.globalAlpha=1;}
 {const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep+'cc');g.addColorStop(.55,'#03030699');g.addColorStop(1,P.deep+'ee');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);}
 // TỤ KHÍ quanh người tặng
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,ax,ay,chargeA*.9,t,P);drawCircle(c,ax,ay-8,240,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,ax,chestA,charge*.7*(1-castK),t,P,light,H);drawAura(c,ax,ay,560,260,Math.max(chargeA,.4*(castK>0?1-castK:0)),t,P,light);
 // LÒ ĐAN (sau hiệu ứng nền, trước chiêu)
 const glowPot=Math.max(.15,smooth(castK)*.9+(hitSec>0?Math.exp(-hitFx*1.2):0));
 c.save();c.globalCompositeOperation='lighter';dot(c,x.role==='herb'?'#7dff9a':x.role==='fire'?'#8fd8ff':'#ffd36b',px,coreY,ph*.8,.45*glowPot);c.restore();
 if(pot){const wob=hitSec>0&&hitSec<.6&&motion?Math.sin(t*.09)*6*(1-hitSec/.6):0;c.drawImage(pot,px-pw/2+wob,py-ph,pw,ph);}else{c.fillStyle='#5a3a1a';c.fillRect(px-150,py-280,300,280);}
 drawCaster(scene,c,A,ax,ay,5,t,dir<0);
 drawInflow(c,handX,chestA,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);drawCompress(c,handX,chestA,comp,t,P);
 if(relSec>=0)drawBurst(c,handX,chestA,relSec,P,H,{light,pillar:false,scale:.5,seed:V.style+1,reduceFlash:rf});
 // PHÁT CHIÊU
 if(castK>0&&k<CUT_PHASE.hit+.05){const fade=1-seg(k,CUT_PHASE.hit-.03,CUT_PHASE.hit+.05),u=ease(seg(castK,.05,.95));c.save();c.globalCompositeOperation='lighter';
  if(x.role==='herb'){ // dược liệu xoáy ốc bay vào miệng lò
   const n=light?28:70,uu=seg(k,CUT_PHASE.shout-.06,CUT_PHASE.cast);for(let i=0;i<n;i++){const lag=rn(i)*.7,p=clamp((uu-lag)/.3);if(p<=0||p>=1)continue;const a=rn(i+3)*TAU+p*5,r=(1-p)*(380+rn(i+5)*260),hx=px+Math.cos(a)*r,hy=mouthY-30+Math.sin(a)*r*.45-(1-p)*200;
    const col=['#7dff9a','#ffe08a','#ff9ad0','#9be7ff'][i%4];dot(c,col,hx,hy,46,fade*.5);c.save();c.translate(hx,hy);c.rotate(a+t*.004);c.globalAlpha=fade;c.fillStyle=col;c.beginPath();c.ellipse(0,0,30,11,0,0,TAU);c.fill();c.fillStyle='#ffffff';c.beginPath();c.ellipse(-6,-2,10,3,0,0,TAU);c.fill();c.restore();}
  }else if(x.role==='fire'){ // dòng thần hỏa từ tay vào đáy lò
   const tx=px,ty=py-ph*.18,n=light?14:30;for(let i=0;i<n;i++){const f=i/n;if(f>u)break;const bx=handX+(tx-handX)*f,by=chestA+(ty-chestA)*f+Math.sin(f*12+t*.02)*18;dot(c,f>.85?'#ffffff':i%2?'#8fd8ff':'#c9f0ff',bx,by,38-f*14,fade*.85);}
   if(u>.3){const fl=seg(u,.3,1),n2=light?12:28;for(let i=0;i<n2;i++){const fx0=px+(rn(i)-.5)*pw*.8,hh=(160+rn(i+2)*220)*fl;dot(c,i%3?'#5ab8ff':'#e8f8ff',fx0,py-ph*.12-hh*.5+Math.sin(t*.03+i)*8,hh*.4,fade*.7);}}
  }else{ // sét kiếp + chuông vàng úp xuống
   const drop=ease(seg(castK,.05,.5)),R=ph*.8,by=coreY+R*.15-(1-drop)*560,bell=img(BELL);
   dot(c,'#ffe7a8',px,by-R*.4,R*1.2,.45*fade);for(let j=0;j<3;j++){const rr=R*(.9+j*.25+.08*Math.sin(t*.006+j));c.globalAlpha=fade*(.6-j*.15);c.strokeStyle='#fff3c4';c.lineWidth=5-j;c.beginPath();c.ellipse(px,by,rr,rr*.35,0,0,TAU);c.stroke();}
   if(bell){c.globalCompositeOperation='source-over';c.globalAlpha=fade*.92;const bw=R*1.9,bh=bw*bell.naturalHeight/bell.naturalWidth;c.drawImage(bell,px-bw/2,by-bh*.9,bw,bh);c.globalCompositeOperation='lighter';}
   const f=Math.floor(t/70);for(let j=0;j<4;j++){if(rn(f+j*7)<.35)continue;const sx=px+(rn(f+j)-.5)*R*1.2;c.strokeStyle=j%2?'#c9b8ff':'#ffffff';c.lineWidth=5;c.globalAlpha=fade;c.beginPath();c.moveTo(sx+(rn(f+j+9)-.5)*200,-40);for(let s=1;s<6;s++)c.lineTo(sx+(rn(f+j*3+s)-.5)*90,(by-R*1.3)*s/6);c.stroke();dot(c,'#ffffff',sx,by-R*1.3,70,fade*.85);}
  }
  c.restore();c.globalAlpha=1;}
 // TRÚNG: lò bùng — cột đan quang
 if(hitSec>=0&&!HS.frozen){drawBurst(c,px,coreY,hitFx,P,H,{light,pillar:true,scale:1.2,ground:py,seed:h%7,reduceFlash:rf});
  c.save();c.globalCompositeOperation='lighter';const col=x.role==='herb'?'#9dffb5':x.role==='fire'?'#bfe6ff':'#ffe9a8';for(let i=0;i<12;i++){const y=mouthY-i*70*out3(seg(hitFx,0,.8));dot(c,col,px,y,60-i*3,(1-seg(hitFx,.3,1.4))*.7);}c.restore();}
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),450,H*.55);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,px,coreY,hitSec/.1,P,h%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),14);
 drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,dir,t,{label:'KHAI LÒ LUYỆN ĐAN'});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 const name=Array.from(String(x.name||A?.name||'')).slice(0,14).join(''),shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const chars=Array.from(name+' XUẤT THỦ!'),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,60,'#fff6dc',{width:12,max:860});c.restore();txt(c,R.sub,450,H*.2+56,26,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600*dir,tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,R.label,450,H*.13,68,tg,{width:14,max:880});txt(c,name,450,H*.13+56,26,'#ffffff',{width:5,weight:'800',max:820});c.restore();}
 const o=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
