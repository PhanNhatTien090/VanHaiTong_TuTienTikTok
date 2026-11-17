// 17/11/2026: MÀN CHIẾU RIÊNG (chủ game: "như lúc đột phá — chiếu riêng, không chiếu mọi thứ khác, cho mượt").
// Khi đòn có entry.cut (server đánh dấu + hoãn trận): chém đen vào → màn riêng chỉ có người ra chiêu + đối thủ trên nền tối
// (HÔ CHIÊU → TUNG CHIÊU → TRÚNG) → mở lại sân chính, để lại DƯ ẢNH chiêu ~1,8 s.
// Trong pha toàn màn, scene.drawFrame trả về sớm → KHÔNG vẽ sân/khán giả/HUD → GPU chỉ lo 2 nhân vật + hiệu ứng (bùng hết cỡ được).
import {SIGNATURE_ULTS,PET_ULTS,CUT_AFTERGLOW_MS} from './signature-ults.js';
import {baoItem,baoArt,BAO_LINES,BAO_TIER} from './phap-bao-data.js'; // 18/11: thần khí bản mệnh
import {petV2FramesFor,petArtFrame,drawRareFx} from './spirit-pet-art.js?v=drawn-pets-20261114';
import {drawPremiumPetFx} from './premium-pet-fx.js?v=20261117';
import {petById} from './spirit-pets.js';
import {skinFor} from './cosmetics.js';
const GIFT_IMG=new Map();
export function giftImg(url){if(!url||typeof Image==='undefined')return null;let a=GIFT_IMG.get(url);if(!a){const im=new Image();im.decoding='async';im.referrerPolicy='no-referrer';a={im,ok:false};im.onload=()=>{a.ok=true;};im.src=url;GIFT_IMG.set(url,a);if(GIFT_IMG.size>12)GIFT_IMG.delete(GIFT_IMG.keys().next().value);}return a.ok?a.im:null;}
import {duelSoundPreset} from './duel-cinematic.js';
import {makeSurface} from './performance.js';
import {fxVariant,PALETTES,palOf,fxCamera,punch,smooth,out3,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawBeam,drawSkyLances,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';
const MOTIF_TECH={karma:'soul',thunder:'lightning',fire:'fire','lotus-fire':'fire',moon:'ice',phoenix:'fire',ice:'ice',pearl:'water',stars:'star',blood:'soul'};

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const seg=(k,a,b)=>clamp((k-a)/(b-a));
// Mốc pha theo tỉ lệ thời gian chiếu.
export const CUT_PHASE=Object.freeze({wipeIn:.08,shout:.36,cast:.72,hit:.86,wipeOut:.92});
const ART=new Map();
function art(name){if(!name||typeof Image==='undefined')return null;let a=ART.get(name);if(!a){const im=new Image();im.decoding='async';a={im,ok:false};im.onload=()=>{a.ok=true;};im.src=name.includes('/')?name:'/assets/signature-ults-v1/'+name+'.webp';ART.set(name,a);}return a.ok?a.im:null;}
export function prewarmCutArt(skin){const s=SIGNATURE_ULTS[skin];if(s)art(s.art);}
export function txt(c,s,x,y,size,fill,{stroke='#05060c',width=8,weight='900',align='center',max}={}){c.font=weight+' '+size+'px "Segoe UI",Arial,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';if(width){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=fill;c.fillText(s,x,y,max);}
export function glow(c,x,y,r,col,a){if(a<=.01||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col+'00');c.globalAlpha=Math.min(1,a);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1;}
function bolt(c,x0,y0,x1,y1,seed,col,w){let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<10;i++){const u=i/10;c.lineTo(x0+(x1-x0)*u+r()*60,y0+(y1-y0)*u+r()*60);}c.lineTo(x1,y1);c.strokeStyle=col;c.lineWidth=w;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,w*.35);c.stroke();}
const rnd=i=>{const x=Math.sin(i*127.1)*43758.5453;return x-Math.floor(x);};

/** Đòn đang được chiếu riêng (hoặc đang để dư ảnh) trong trận Lôi Đài. shownAt = giờ server đã trừ độ trễ hiển thị. */
export function findCut(log,shownAt){
 if(!log)return null;
 for(let i=log.length-1;i>=0;i--){const e=log[i];if(!e?.cut)continue;const age=shownAt-e.at,ms=e.cut.ms;if(age>=0&&age<ms+CUT_AFTERGLOW_MS)return {e,age,ms,k:age/ms};}
 return null;}
export const cutFull=cut=>!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;

function spec(e,scene){if(e.cut.kind==='skin'){const s=SIGNATURE_ULTS[e.cut.skin];return s&&{...s,kind:'skin'};}
 // 18/11: thần thông bản mệnh 5★/GIỚI HẠN — dùng khung chiếu của thần kỹ skin, hình chiêu = ảnh pháp bảo.
 if(e.cut.kind==='bao'){const it=baoItem(e.cut.bao),lim=e.cut.tier>=6;return it&&{kind:'skin',name:it.name,shout:(lim?'THẦN KHÍ GIỚI HẠN — ':'THẦN KHÍ — ')+BAO_LINES[it.line].skill.toUpperCase()+'!',hero:lim?'Thần khí giới hạn':'Thần khí cao cấp',color:lim?'#ff5fb8':'#ffb52e',glow:'#ffffff',deep:lim?'#12030c':'#1a0f02',motif:lim?'stars':'ice',art:baoArt(it.id),tag:'THẦN THÔNG'};}
 // 18/11 (chủ game): quà trợ chiêu KHÔNG hiện hình quà — chỉ hiệu ứng chiêu.
 if(e.cut.kind==='gift')return {kind:'gift',name:e.skill?.name||'Bạo Phát',shout:e.cut.from?Array.from(String(e.cut.from)).slice(0,14).join('')+' TRỢ CHIÊU!':'BẠO PHÁT!',hero:'Trợ chiêu',color:'#ffc44d',glow:'#fff3c4',deep:'#1c1204',motif:'gift'};
 const p=PET_ULTS[e.cut.pet],pet=petById(e.cut.pet);return p&&{...p,kind:'pet',pet,hero:pet?.name||'Linh thú',shout:(pet?.name||'').toUpperCase()+'!',glow:'#ffffff',deep:'#05070f'};}

// ---- nền tối theo màu chiêu (18/11: vòng phù văn cũ thay bằng trận pháp + lớp tụ khí ở cut-fx.js) ----
function backdrop(c,H,P,t){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep||'#05060c');g.addColorStop(.55,'#020206');g.addColorStop(1,P.deep||'#05060c');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 glow(c,450,H*.5,H*.6,P.main,.22+.08*Math.sin(t*.004));
}
// ---- hình chiêu theo motif (khi chưa có ảnh, hoặc lớp phụ quanh ảnh) ----
function motifFx(c,S,x,y,size,k,t,seed,light){
 c.save();c.globalCompositeOperation='lighter';const n=light?14:30;
 if(S.motif==='thunder'){for(let i=0;i<(light?3:6);i++){const a=rnd(seed+i)*TAU;bolt(c,x,y,x+Math.cos(a)*size*1.2,y+Math.sin(a)*size*.9,seed*31+i+Math.floor(t/70),i%2?S.color:S.glow,3+3*k);}}
 for(let i=0;i<n;i++){const u=(rnd(i+seed)+t*.0012)%1,a=rnd(i*3+seed)*TAU+t*.002,r=size*(.2+u*.9);c.globalAlpha=(1-u)*.9;c.fillStyle=i%4?S.color:'#ffffff';
  const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.7;
  if(S.motif==='moon'||S.motif==='lotus-fire'){c.save();c.translate(px,py);c.rotate(a*2);c.beginPath();c.ellipse(0,0,4+6*(1-u),12+10*(1-u),0,0,TAU);c.fill();c.restore();}
  else if(S.motif==='ice'||S.motif==='stars'){c.beginPath();c.moveTo(px,py-9);c.quadraticCurveTo(px,py,px+9,py);c.quadraticCurveTo(px,py,px,py+9);c.quadraticCurveTo(px,py,px-9,py);c.quadraticCurveTo(px,py,px,py-9);c.fill();}
  else{c.beginPath();c.arc(px,py,2+5*(1-u),0,TAU);c.fill();}}
 c.restore();
}
// Vẽ THÂN trực tiếp (như chân dung linh-bai) — drawPlayer dùng ô cache nên hiệu ứng skin lớn bị cắt thành khung chữ nhật.
// compact: bỏ vòng khí cảnh giới (phóng ×5 thành vòng xoắn khổng lồ); cinematicPose stand: luôn đứng (không chuyển sang ngồi thiền giữa chiêu).
export function drawCaster(scene,c,player,x,y,scale,t,flip){if(!player)return;const oc=scene.compact,op=scene.cinematicPose;scene.compact=true;scene.cinematicPose={...(op||{}),stand:1};c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(scale,scale);try{scene.drawCharacterBody(c,player,skinFor(player.giftCoins),t);}catch{}finally{c.restore();scene.compact=oc;scene.cinematicPose=op;}}
function drawPetBig(scene,c,player,pet,x,y,size,t,burst,light){
 const frames=petV2FramesFor(scene,player),img=frames&&petArtFrame(frames,t,7,true);
 if(pet.coins===300)drawPremiumPetFx(c,pet,size,t,7,2.2,'back',burst);
 if(img){c.save();c.translate(x,y);c.drawImage(img,-size/2,-size*.65,size,size);c.restore();}
 c.save();c.translate(x,y);if(pet.coins===300)drawPremiumPetFx(c,pet,size,t,7,2.2,'front',burst);else drawRareFx(c,pet,size,t,7,3);c.restore();
}

// Độ cao mặt (đơn vị drawCaster scale 1, tính từ chân): đo 1 lần/nhân vật+skin bằng cách vẽ thử ra ô nhỏ rồi dò hàng điểm ảnh trên cùng.
// Skin cao (áo choàng, mũ) mặt nằm cao hơn → không đo thì băng cận mặt cắt vào ngực. Chưa nạp ảnh thì dùng 78 và đo lại sau.
const FACE=new Map();
function faceUnits(scene,p,t){const key=(p.id||'')+'|'+(p.skinChoice||'')+'|'+(p.giftCoins||0);const v=FACE.get(key);if(v)return v;
 let out=78;try{const s=3,W=360,Hh=480,cv=makeSurface(W,Hh),x=cv?.getContext('2d',{willReadFrequently:true});if(x){drawCaster(scene,x,p,W/2,Hh-20,s,t,false);const d=x.getImageData(W/2-40,0,80,Hh).data;let top=-1;for(let y=0;y<Hh&&top<0;y++)for(let i=0;i<80;i++)if(d[(y*80+i)*4+3]>60){top=y;break;}
  if(top>=0&&Hh-20-top>40*s){out=Math.max(60,Math.min(140,(Hh-20-top)/s-12));FACE.set(key,out);if(FACE.size>60)FACE.delete(FACE.keys().next().value);}}}catch{}
 return out;}
/** 18/11: CUT-IN cận mặt kiểu gacha — băng chéo trượt ngang màn, trong là mặt người ra chiêu phóng to + vạch tốc độ. u 0..1 trong cửa sổ. */
export function drawCutInBand(scene,c,player,H,u,P,dir,t,{yc=H*.44,bh=300,label=''}={}){
 if(!player||u<=0||u>=1)return;const inK=ease(seg(u,0,.18)),outK=easeIn(seg(u,.82,1)),off=((1-inK)*1000+outK*-1000)*dir,sl=70;
 c.save();c.translate(off,0);
 c.beginPath();c.moveTo(-60,yc-bh/2+sl);c.lineTo(960,yc-bh/2-sl);c.lineTo(960,yc+bh/2-sl);c.lineTo(-60,yc+bh/2+sl);c.closePath();
 c.save();c.clip();
 const g=c.createLinearGradient(0,yc-bh,0,yc+bh);g.addColorStop(0,P.deep||'#05060c');g.addColorStop(.5,P.main+'66');g.addColorStop(1,P.deep||'#05060c');c.fillStyle='#05060c';c.fillRect(-60,yc-bh,1020,bh*2);c.fillStyle=g;c.fillRect(-60,yc-bh,1020,bh*2);
 c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<26;i++){const yy=yc-bh*.7+rnd(i+3)*bh*1.4,sp=(t*.003*(1+rnd(i))+rnd(i+7))%1,x0=dir>0?1000-sp*1300:-100+sp*1300,L=120+rnd(i+1)*300;c.globalAlpha=.35;c.strokeStyle=i%3?'#ffffff':P.main;c.lineWidth=1+rnd(i+2)*3;c.beginPath();c.moveTo(x0,yy);c.lineTo(x0+L*dir,yy);c.stroke();}
 c.globalCompositeOperation='source-over';c.globalAlpha=1;
 const sc=11,drift=(u-.5)*40*dir,face=faceUnits(scene,player,t);drawCaster(scene,c,player,450+drift-dir*60,yc+sc*face,sc,t,dir<0);
 c.restore();
 c.globalCompositeOperation='lighter';c.strokeStyle=P.soft;c.lineWidth=5;c.beginPath();c.moveTo(-60,yc-bh/2+sl);c.lineTo(960,yc-bh/2-sl);c.moveTo(-60,yc+bh/2+sl);c.lineTo(960,yc+bh/2-sl);c.stroke();
 c.globalCompositeOperation='source-over';
 if(label)txt(c,label,dir>0?860:40,yc+bh/2-sl-28,30,'#ffffff',{width:7,align:dir>0?'right':'left',max:600});
 c.restore();c.globalAlpha=1;
}
/** Pha toàn màn (gọi từ scene.drawFrame thay cho cả sân).
 * 18/11 (chủ game chê sơ sài, bảo học màn đột phá): TỤ KHÍ (trận pháp dưới chân, cột sáng trời rọi, hạt xoáy vào, hào quang bốc, vạch tốc độ)
 * → NÉN → PHÁT CHIÊU (nổ nhỏ ở tay + hình chiêu / sóng năng lượng / thiên giáng) → TRÚNG (cột sáng, tia tỏa, tia lửa, vòng xung kích, nứt đất, rung)
 * → bụi sáng. Camera đẩy vào lúc tụ, giật ở 2 cú nổ. Biến thể theo mã đòn: lật bên, chiều xoay, kiểu chiêu quà, màu quà. */
export function drawCutFull(scene,c,t,H,cut,players){
 const {e,k}=cut,S=spec(e,scene);if(!S)return false;const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const A=players.get(e.by),B=players.get(e.to),V=fxVariant(e.n||1),fl=V.flip,dir=fl?-1:1,X=x=>fl?900-x:x;
 const P=S.kind==='gift'?PALETTES[e.trick==='summon'?'crimson':V.pal]:palOf(S.color,S.glow,S.deep); /* 18/11: Hỏa Long luôn tông lửa */
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),hitK=seg(k,CUT_PHASE.cast,CUT_PHASE.hit),outK=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);
 const secOf=k0=>(k-k0)*cut.ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast);
 // 18/11 HIT-STOP: đứng hình 0,1 s lúc trúng (mọi chuyển động dùng t đã đóng băng)
 const HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const ax=X(-120+ease(shoutK/.6)*380),ay=H*.8,chestA=ay-330,handX=ax+dir*70;
 const bx=X(680+hitK*60),by=H*.7,chestB=by-170;
 // camera: đẩy vào người ra chiêu lúc tụ khí, sang đối thủ lúc trúng
 const toB=smooth(seg(castK,.55,1)),cx=ax+(bx-ax)*toB,cy=chestA+(chestB-chestA)*toB;
 const zoom=motion?1+.08*smooth(charge)-.06*smooth(castK)+punch(relSec,.05)+punch(hitFx,.09):1;
 const shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.5?(1-hitFx*2)*16:comp*5;
 fxCamera(c,cx,cy,zoom,shake,t);
 // nghiêng máy (dutch angle) lúc tụ khí
 const dutch=motion?V.spin*.04*smooth(charge)*(1-smooth(castK)):0;if(dutch){c.translate(cx,cy);c.rotate(dutch);c.translate(-cx,-cy);}
 backdrop(c,H,P,t);
 // TỤ KHÍ — lớp sau lưng
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,ax,ay,chargeA*.9,t,P);
 drawCircle(c,ax,ay-8,260,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,ax,chestA,charge*.7*(1-castK),t,P,light,H);
 drawAura(c,ax,ay,600,280,Math.max(chargeA,.45*(castK>0?1-castK:0)),t,P,light);
 // đối thủ (nhỏ, lùi khi trúng) — vòng trận nhỏ dưới chân lúc trúng
 if(B){c.save();c.globalAlpha=.92;drawCaster(scene,c,B,bx,by,3.1,t,!fl);c.restore();}
 // người ra chiêu
 if(S.kind==='pet'){const pet=S.pet,ls=Math.sin(Math.PI*clamp(castK/.75)),lunge=ls*(bx-ax-dir*230);if(A&&pet){const px=ax+dir*40+lunge;c.save();if(fl){c.translate(px*2,0);c.scale(-1,1);}drawPetBig(scene,c,A,pet,px,ay-80-ls*60,470+40*ease(shoutK),t,castK>0?castK:shoutK*.8,light);c.restore();}}
 else drawCaster(scene,c,A,ax,ay,5.2,t,fl);
 drawInflow(c,handX,chestA,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);
 drawCompress(c,handX,chestA,comp,t,P);
 if(relSec>=0)drawBurst(c,handX,chestA,relSec,P,H,{light,pillar:false,scale:.55,seed:V.style+1,reduceFlash:rf});
 // PHÁT CHIÊU
 if(castK>0&&k<CUT_PHASE.hit+.03){
  const burstK=hitK,fadeA=1-burstK;
  if(S.kind==='skin'){
   const fly=easeIn(seg(castK,.15,1)),x=ax+dir*60+(bx-ax-dir*60)*fly,y=ay-260+(chestB-(ay-260))*fly,size=(230+260*fly)*(1+burstK*.35);
   drawBeam(c,handX,chestA,x,y,1,fadeA*.7*seg(castK,.1,.3),t,P,light,34);
   const im=art(S.art);c.save();c.globalCompositeOperation='lighter';glow(c,x,y,size*.9,S.color,.4*fadeA);c.restore();
   if(im){const w=size*2.1,h=w*im.height/im.width;c.save();if(fl){c.translate(x*2,0);c.scale(-1,1);}c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35*fadeA;c.drawImage(im,x-w*.55-70*fly,y-h/2,w,h);c.restore();c.globalAlpha=.97*fadeA;c.drawImage(im,x-w*.55,y-h/2,w,h);c.restore();}
   if(fadeA>.05)motifFx(c,S,x,y,size*.8,fly,t,e.n||1,light);
  }else if(S.kind==='gift'&&e.skill?.art&&art('/assets/skills-v1/'+e.skill.art+'.webp')){
   // 18/11: quà trợ chiêu có ảnh chiêu — 99 Hỏa Long bay từ người ra chiêu lao vào đối thủ; 2.000 Thiên Giáng rơi từ trời.
   const im=art('/assets/skills-v1/'+e.skill.art+'.webp'),sky=e.trick==='heaven',fly=easeIn(seg(castK,.1,1));
   const x=sky?bx:ax+dir*60+(bx-ax-dir*60)*fly,y=sky?-320+(chestB+320)*fly:ay-300+(chestB-(ay-300))*fly,size=(sky?380:260)+(sky?160:320)*fly;
   if(!sky)drawBeam(c,handX,chestA,x,y,1,fadeA*.6*seg(castK,.1,.3),t,P,light,60);else drawSkyLances(c,bx,by,seg(castK,.3,1)+burstK*.3,t,P,light,e.n||1,-200);
   c.save();c.globalCompositeOperation='lighter';glow(c,x,y,size*.9,P.main,.5*fadeA);c.restore();
   const w=size*2,h=w*im.height/im.width;c.save();if(!sky&&dir<0){c.translate(x*2,0);c.scale(-1,1);}c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35*fadeA;c.drawImage(im,x-w*.5-(sky?0:80*fly),y-h/2-(sky?60:0),w,h);c.restore();c.globalAlpha=.97*fadeA;c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();c.globalAlpha=1;
   if(fadeA>.05)motifFx(c,{...S,motif:sky?'stars':'lotus-fire',color:P.main,glow:P.soft},x,y,size*.8,fly,t,e.n||1,light);
  }else if(S.kind==='gift'){
   if(V.style%2===0){drawBeam(c,handX,chestA,bx,chestB,out3(seg(castK,.05,.6)),1-seg(k,CUT_PHASE.hit-.05,CUT_PHASE.hit+.03),t,P,light,100);}
   else{const sealY=H*.3;drawCircle(c,bx,sealY,340,smooth(seg(castK,0,.25))*fadeA,t,P,-V.spin);dot(c,P.soft,bx,sealY,120+60*Math.sin(t*.01),.5*smooth(seg(castK,0,.25))*fadeA);drawSkyLances(c,bx,by,seg(castK,.12,1)+burstK*.3,t,P,light,e.n||1,sealY);}
  }else if(S.kind==='pet'&&fadeA>.05){const fly=clamp(castK/.75);motifFx(c,S,ax+(bx-ax)*fly,chestA+(chestB-chestA)*fly,260,fly,t,e.n||1,light);}
 }
 // TRÚNG
 if(hitSec>=0&&!HS.frozen)drawBurst(c,bx,chestB,hitFx,P,H,{light,pillar:true,scale:1,ground:by,seed:(e.n||1)%7,reduceFlash:rf});
 if(hitK>0&&!scene.cutSeen?.has('hit:'+e.n)){(scene.cutSeen??=new Set()).add('hit:'+e.n);scene.onFeedbackSound?.('hit',3);}
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),cx,cy);
 // 18/11 ngôn ngữ điện ảnh: khung IMPACT đảo màu lúc đứng hình, nhòe tách hình sau nổ, cut-in cận mặt lúc hô chiêu, thanh đen trên/dưới
 if(HS.frozen&&!rf)drawImpactFrame(c,H,bx,chestB,hitSec/.1,P,e.n||1);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),16);
 if(relSec>=0&&relSec<.25&&motion)drawGhostSplit(c,.6*(1-relSec/.25),10);
 if(S.kind!=='pet'||A)drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,dir,t,{label:S.kind==='skin'?S.hero:''});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 // CHỮ (không lật, không rung)
 const shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const chars=Array.from(S.shout),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,62,'#fff6dc',{width:12,max:860});c.restore();
  txt(c,S.kind==='pet'?'Linh thú của '+(A?.name||''):S.kind==='gift'?'Trợ lực cho '+(A?.name||''):S.hero+' · '+(A?.name||''),450,H*.2+58,26,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600*dir;
  const tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,S.name,450,H*.13,70,tg,{width:14,max:880});txt(c,S.kind==='pet'?'LINH THÚ TUYỆT KỸ':S.kind==='gift'?'TRỢ CHIÊU · '+(A?.name||''):(S.tag||'THẦN KỸ')+' · '+S.hero,450,H*.13+56,24,'#ffffff',{width:5,weight:'800'});c.restore();}
 if(k>=CUT_PHASE.cast){const u=seg(k,CUT_PHASE.cast,CUT_PHASE.wipeOut),pop=1+.5*(1-ease(seg(u,0,.25)));
  if(e.dmg){c.save();c.translate(bx,by-330-u*30);c.scale(pop,pop);txt(c,'-'+Math.round(e.dmg).toLocaleString('vi-VN'),0,0,84,'#ffd54a',{width:12});c.restore();txt(c,e.ko?'K.O!':S.kind==='pet'?'LINH THÚ':S.kind==='gift'?'BẠO PHÁT':S.tag||'THẦN KỸ',bx,by-410-u*30,34,e.ko?'#ff5b4a':'#ff9b3d',{width:7});}
  else if(e.heal||e.shield)txt(c,e.heal?'+'+Math.round(e.heal).toLocaleString('vi-VN'):'KHIÊN +'+Math.round(e.shield).toLocaleString('vi-VN'),ax+dir*60,ay-430,60,e.heal?'#7dffa8':'#9be8ff',{width:10});}
 if(outK>0){c.globalAlpha=outK;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
 // âm thanh tụ lực một lần lúc bắt đầu
 if(!scene.cutSeen?.has('cast:'+e.n)){(scene.cutSeen??=new Set()).add('cast:'+e.n);try{scene.onCinematicSound?.('cut:'+e.n,duelSoundPreset({id:MOTIF_TECH[S.motif]||'fire'}),(e.cut.ms*(CUT_PHASE.cast-.02)-cut.age)/1000,{priority:6,charge:true,gain:.6});}catch{}}
 if(scene.cutSeen.size>60)scene.cutSeen=new Set([...scene.cutSeen].slice(-20));
 return true;
}
/** Vào/ra màn riêng + dư ảnh — vẽ ĐÈ lên sân chính (lớp trước của Lôi Đài). targets = vị trí đấu thủ trên sân. */
export function drawCutEdges(scene,c,t,H,cut,targets){
 const {e,k,age,ms}=cut,S=spec(e,scene);if(!S)return;
 // chém vào / mở lại: tấm che HTML #cutVeil (arena-stage.js) — phủ cả nhãn tên + bảng vẽ sau lớp này.
 if(age<ms)return;
 // DƯ ẢNH: vệt chém màu chiêu + bóng hình chiêu mờ dần trên đối thủ
 const after=age>=ms?clamp((age-ms)/CUT_AFTERGLOW_MS):0,fade=age<ms?1:1-after;if(fade<=0)return;
 const B=targets?.get(e.to),x=B?.x??450,y=(B?.y??H*.35)-130;
 c.save();c.globalCompositeOperation='lighter';
 glow(c,x,y,190,S.color,.5*fade);
 for(let i=0;i<4;i++){const a=-.6+i*.4+rnd(e.n+i)*.2,L=170+60*i;c.globalAlpha=.75*fade;c.strokeStyle=i%2?'#ffffff':S.color;c.lineWidth=(6-i)*fade+1;c.beginPath();c.moveTo(x-Math.cos(a)*L,y-Math.sin(a)*L);c.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);c.stroke();}
 const im=S.kind==='skin'?art(S.art):null;if(im){const w=300,h=w*im.height/im.width;c.globalAlpha=.35*fade;c.drawImage(im,x-w/2,y-h/2,w,h);}
 c.restore();
 if(after<.6)txt(c,S.name,x,y-170,26,S.glow||'#ffe9a8',{width:5,max:420});
}

// Tấm che HTML trên cùng cho lúc chém vào / mở lại (canvas vẽ nhãn tên + bảng SAU lớp Lôi Đài nên lớp đen trên canvas bị đè).
export function cutVeil(cut,full){
 if(typeof document?.getElementById!=='function')return;let v=document.getElementById('cutVeil');
 if(!v){if(!cut)return;const shell=document.querySelector('.scene-shell');if(!shell)return;v=document.createElement('div');v.id='cutVeil';v.className='cut-veil';shell.appendChild(v);}
 if(!cut||full||cut.age>=cut.ms){if(v.style.opacity!=='0'){v.style.opacity='0';v.style.clipPath='none';}return;}
 if(cut.k<CUT_PHASE.wipeIn){const u=cut.k/CUT_PHASE.wipeIn,x=Math.round(u*u*(3-2*u)*150);v.style.clipPath=`polygon(0 0,${x}% 0,${x-45}% 100%,0 100%)`;v.style.opacity='1';}
 else{const u=(cut.k-CUT_PHASE.wipeOut)/(1-CUT_PHASE.wipeOut);v.style.clipPath='none';v.style.opacity=String(Math.max(0,1-u*u*(3-2*u)));}
}
// 17/11: Phong Vân Luận Kiếm — pha TUYỆT KỸ (dàn cảnh 3,5 s, bên dẫn linh áp ra chiêu): bên đó mặc skin ≥300 coin → chiếu riêng thần kỹ.
// Chỉ phía overlay (trận luận kiếm là dàn cảnh theo đồng hồ, thắng thua server quyết riêng) → không cần hoãn trận.
import {DUEL_PHASES} from './duel-combat.js';
import {signatureSkinOf} from './signature-ults.js';
const ULT_PHASE=DUEL_PHASES.find(p=>p.id==='ultimate');
const strHash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
export function tournamentCut(scene,now=Date.now()){
 const m=scene.socialScene==='tournament'?scene.socialStatus?.tournament?.current:null;if(!m||!Number.isFinite(m.startedAt)||!ULT_PHASE)return null;
 const age=now-m.startedAt;if(age<ULT_PHASE.from||age>=ULT_PHASE.to)return null;
 const lead=(Number(m.aura?.[m.a])||0)-(Number(m.aura?.[m.b])||0),by=lead>=0?m.a:m.b,to=by===m.a?m.b:m.a,skin=signatureSkinOf(scene.playerIndex?.get(by));if(!skin)return null;
 const ms=ULT_PHASE.to-ULT_PHASE.from,a=age-ULT_PHASE.from;
 return {e:{n:strHash((m.id||'')+':'+m.startedAt),by,to,cut:{kind:'skin',skin,ms}},age:a,ms,k:a/ms};
}
export function tournamentCutFrame(scene,c,t,H){
 const cut=tournamentCut(scene),full=cutFull(cut),on=!!cut;
 if(!!scene.duelCutOn!==on){scene.duelCutOn=on;document.body?.classList?.toggle('cutscene-on',on);}
 if(cut||scene.duelVeilUsed){scene.duelVeilUsed=on;cutVeil(cut,full);}
 if(!full)return false;
 try{return drawCutFull(scene,c,t,H,cut,scene.playerIndex||new Map());}catch(err){console.warn('[cut]',err);return false;}
}
