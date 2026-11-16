// 17/11/2026: MÀN CHIẾU RIÊNG (chủ game: "như lúc đột phá — chiếu riêng, không chiếu mọi thứ khác, cho mượt").
// Khi đòn có entry.cut (server đánh dấu + hoãn trận): chém đen vào → màn riêng chỉ có người ra chiêu + đối thủ trên nền tối
// (HÔ CHIÊU → TUNG CHIÊU → TRÚNG) → mở lại sân chính, để lại DƯ ẢNH chiêu ~1,8 s.
// Trong pha toàn màn, scene.drawFrame trả về sớm → KHÔNG vẽ sân/khán giả/HUD → GPU chỉ lo 2 nhân vật + hiệu ứng (bùng hết cỡ được).
import {SIGNATURE_ULTS,PET_ULTS,CUT_AFTERGLOW_MS} from './signature-ults.js';
import {petV2FramesFor,petArtFrame,drawRareFx} from './spirit-pet-art.js?v=drawn-pets-20261114';
import {drawPremiumPetFx} from './premium-pet-fx.js?v=20261117';
import {petById} from './spirit-pets.js';
import {skinFor} from './cosmetics.js';
import {giftFor} from './gift-icons.js';
const GIFT_IMG=new Map();
function giftImg(url){if(!url||typeof Image==='undefined')return null;let a=GIFT_IMG.get(url);if(!a){const im=new Image();im.decoding='async';im.referrerPolicy='no-referrer';a={im,ok:false};im.onload=()=>{a.ok=true;};im.src=url;GIFT_IMG.set(url,a);if(GIFT_IMG.size>12)GIFT_IMG.delete(GIFT_IMG.keys().next().value);}return a.ok?a.im:null;}
import {duelSoundPreset} from './duel-cinematic.js';
const MOTIF_TECH={karma:'soul',thunder:'lightning',fire:'fire','lotus-fire':'fire',moon:'ice',phoenix:'fire',ice:'ice',pearl:'water',stars:'star',blood:'soul'};

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const seg=(k,a,b)=>clamp((k-a)/(b-a));
// Mốc pha theo tỉ lệ thời gian chiếu.
export const CUT_PHASE=Object.freeze({wipeIn:.08,shout:.36,cast:.72,hit:.86,wipeOut:.92});
const ART=new Map();
function art(name){if(!name||typeof Image==='undefined')return null;let a=ART.get(name);if(!a){const im=new Image();im.decoding='async';a={im,ok:false};im.onload=()=>{a.ok=true;};im.src='/assets/signature-ults-v1/'+name+'.webp';ART.set(name,a);}return a.ok?a.im:null;}
export function prewarmCutArt(skin){const s=SIGNATURE_ULTS[skin];if(s)art(s.art);}
function txt(c,s,x,y,size,fill,{stroke='#05060c',width=8,weight='900',align='center',max}={}){c.font=weight+' '+size+'px "Segoe UI",Arial,sans-serif';c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';if(width){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=fill;c.fillText(s,x,y,max);}
function glow(c,x,y,r,col,a){if(a<=.01||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col+'00');c.globalAlpha=Math.min(1,a);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1;}
function bolt(c,x0,y0,x1,y1,seed,col,w){let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<10;i++){const u=i/10;c.lineTo(x0+(x1-x0)*u+r()*60,y0+(y1-y0)*u+r()*60);}c.lineTo(x1,y1);c.strokeStyle=col;c.lineWidth=w;c.stroke();c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,w*.35);c.stroke();}
const rnd=i=>{const x=Math.sin(i*127.1)*43758.5453;return x-Math.floor(x);};

/** Đòn đang được chiếu riêng (hoặc đang để dư ảnh) trong trận Lôi Đài. shownAt = giờ server đã trừ độ trễ hiển thị. */
export function findCut(log,shownAt){
 if(!log)return null;
 for(let i=log.length-1;i>=0;i--){const e=log[i];if(!e?.cut)continue;const age=shownAt-e.at,ms=e.cut.ms;if(age>=0&&age<ms+CUT_AFTERGLOW_MS)return {e,age,ms,k:age/ms};}
 return null;}
export const cutFull=cut=>!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;

function spec(e,scene){if(e.cut.kind==='skin'){const s=SIGNATURE_ULTS[e.cut.skin];return s&&{...s,kind:'skin'};}
 if(e.cut.kind==='gift'){const g=giftFor(scene?.lastState?.giftArt,e.cut.coins);return {kind:'gift',name:e.skill?.name||'Bạo Phát',shout:e.cut.from?Array.from(String(e.cut.from)).slice(0,14).join('')+' TRỢ CHIÊU!':'BẠO PHÁT!',hero:'Quà trợ chiêu',color:'#ffc44d',glow:'#fff3c4',deep:'#1c1204',motif:'gift',giftUrl:g?.url||null,count:g?.count||1};}
 const p=PET_ULTS[e.cut.pet],pet=petById(e.cut.pet);return p&&{...p,kind:'pet',pet,hero:pet?.name||'Linh thú',shout:(pet?.name||'').toUpperCase()+'!',glow:'#ffffff',deep:'#05070f'};}

// ---- nền + vệt tốc độ + vòng phù văn (theo màu chiêu) ----
function backdrop(c,H,S,k,t,light){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,S.deep||'#05060c');g.addColorStop(.55,'#020206');g.addColorStop(1,S.deep||'#05060c');c.fillStyle=g;c.fillRect(-60,-60,1020,H+120);
 glow(c,450,H*.5,H*.55,S.color,.28+.12*Math.sin(t*.004));
 c.save();c.globalCompositeOperation='lighter';
 const n=light?18:36;for(let i=0;i<n;i++){const a=rnd(i)*TAU,sp=(t*.0009+rnd(i+9))%1,r0=60+sp*700,r1=r0+40+sp*160;c.globalAlpha=.25*(1-sp);c.strokeStyle=i%3?S.color:'#ffffff';c.lineWidth=1.5+2*(1-sp);c.beginPath();c.moveTo(450+Math.cos(a)*r0,H*.5+Math.sin(a)*r0);c.lineTo(450+Math.cos(a)*r1,H*.5+Math.sin(a)*r1);c.stroke();}
 // vòng phù văn sau lưng người ra chiêu
 c.save();c.translate(270,H*.6);c.scale(1,.42);c.rotate(t*.0012);c.globalAlpha=.55;c.strokeStyle=S.color;c.lineWidth=4;c.beginPath();c.arc(0,0,260,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.arc(0,0,220,0,TAU);c.stroke();
 for(let i=0;i<16;i++){c.save();c.rotate(i*TAU/16);c.fillStyle=i%2?S.color:(S.glow||'#fff');c.fillRect(226,-5,26,10);c.restore();}c.restore();
 c.restore();
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
function drawCaster(scene,c,player,x,y,scale,t,flip){if(!player)return;const oc=scene.compact,op=scene.cinematicPose;scene.compact=true;scene.cinematicPose={...(op||{}),stand:1};c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.scale(scale,scale);try{scene.drawCharacterBody(c,player,skinFor(player.giftCoins),t);}catch{}finally{c.restore();scene.compact=oc;scene.cinematicPose=op;}}
function drawPetBig(scene,c,player,pet,x,y,size,t,burst,light){
 const frames=petV2FramesFor(scene,player),img=frames&&petArtFrame(frames,t,7,true);
 if(pet.coins===300)drawPremiumPetFx(c,pet,size,t,7,2.2,'back',burst);
 if(img){c.save();c.translate(x,y);c.drawImage(img,-size/2,-size*.65,size,size);c.restore();}
 c.save();c.translate(x,y);if(pet.coins===300)drawPremiumPetFx(c,pet,size,t,7,2.2,'front',burst);else drawRareFx(c,pet,size,t,7,3);c.restore();
}

/** Pha toàn màn (gọi từ scene.drawFrame thay cho cả sân). */
export function drawCutFull(scene,c,t,H,cut,players){
 const {e,k}=cut,S=spec(e,scene);if(!S)return false;const light=scene.budget?.level==='light';
 const A=players.get(e.by),B=players.get(e.to);
 // rung màn khi trúng
 const hitK=seg(k,CUT_PHASE.cast,CUT_PHASE.hit),shake=hitK>0&&hitK<.5&&scene.motion!==false?(1-hitK*2)*14:0;
 c.save();if(shake)c.translate(Math.sin(t*.09)*shake,Math.cos(t*.11)*shake*.6);
 backdrop(c,H,S,k,t,light);
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),outK=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);
 // đối thủ bên phải (nhỏ, hơi tối) — lùi lại khi trúng
 const bx=680+hitK*60,by=H*.7;
 if(B){c.save();c.globalAlpha=.92;drawCaster(scene,c,B,bx,by,3.1,t,true);c.restore();}
 // người ra chiêu trượt vào từ trái, to
 const ax=-120+ease(shoutK/.6)*380,ay=H*.8;
 glow(c,ax,ay-260,300,S.color,.32+.15*Math.sin(t*.01));
 if(S.kind==='pet'){const pet=S.pet,lunge=Math.sin(Math.PI*clamp(castK/.75))*(bx-ax-230);if(A&&pet)drawPetBig(scene,c,A,pet,ax+40+lunge,ay-80-Math.sin(Math.PI*clamp(castK/.75))*60,470+40*ease(shoutK),t,castK>0?castK:shoutK*.8,light);}
 else drawCaster(scene,c,A,ax,ay,5.2,t,false);
 // HÔ CHIÊU: chữ hô xuất hiện từng ký tự
 if(S.kind==='gift'&&castK<.2){const gi=giftImg(S.giftUrl),pop=ease(seg(shoutK,.1,.5)),gx=450,gy=H*.42,R=150+120*pop;
  c.save();c.globalCompositeOperation='lighter';c.translate(gx,gy);c.rotate(t*.0015);for(let i=0;i<16;i++){c.rotate(TAU/16);c.globalAlpha=.35*pop*(1-castK*5);c.fillStyle=i%2?S.color:'#ffffff';c.beginPath();c.moveTo(0,0);c.lineTo(R*2.2,-14);c.lineTo(R*2.2,14);c.fill();}c.restore();
  glow(c,gx,gy,R*1.6,S.color,.55*pop);
  if(gi){const sz=R*1.5*(1+.06*Math.sin(t*.01));c.save();c.globalAlpha=pop*(1-castK*5);c.drawImage(gi,gx-sz/2,gy-sz/2,sz,sz);c.restore();}
  if(S.count>1)txt(c,'×'+S.count,gx+R*.8,gy+R*.6,54,'#ffffff',{width:9});}
 const shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const shout=S.shout,chars=Array.from(shout),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,62,'#fff6dc',{width:12,max:860});c.restore();
  txt(c,S.kind==='pet'?'Linh thú của '+(A?.name||''):S.kind==='gift'?'Quà trợ chiêu cho '+(A?.name||''):S.hero+' · '+(A?.name||''),450,H*.2+58,26,S.glow||'#ffe9a8',{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 // TUNG CHIÊU: tên chiêu lớn + hình chiêu bay từ người ra chiêu tới đối thủ
 if(castK>0){
  const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600;
  const tg=c.createLinearGradient(0,H*.12-40,0,H*.12+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,S.color);
  c.save();c.translate(slide,0);txt(c,S.name,450,H*.13,70,tg,{width:14,max:880});txt(c,S.kind==='pet'?'LINH THÚ TUYỆT KỸ':S.kind==='gift'?'QUÀ TRỢ CHIÊU · '+(A?.name||''):'THẦN KỸ · '+S.hero,450,H*.13+56,24,'#ffffff',{width:5,weight:'800'});c.restore();
  const burstK=seg(k,CUT_PHASE.cast,CUT_PHASE.hit),fadeA=1-burstK; // trúng: hình chiêu phình ra rồi tan
  const fly=easeIn(seg(castK,.15,1)),x=ax+60+(bx-ax-60)*fly,y=ay-260+(by-150-(ay-260))*fly,size=(230+260*fly)*(1+burstK*.35);
  const im=S.kind==='skin'?art(S.art):S.kind==='gift'?giftImg(S.giftUrl):null,imW=S.kind==='gift'?1.35:2.1;
  if(S.kind==='skin'){c.save();c.globalCompositeOperation='lighter';glow(c,x,y,size*.8,S.color,.32);c.restore();}
  if(im){const w=size*imW,h=w*im.height/im.width;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35*fadeA;c.drawImage(im,x-w*.55-70*fly,y-h/2,w,h);c.restore();c.save();c.globalAlpha=.97*fadeA;c.drawImage(im,x-w*.55,y-h/2,w,h);c.restore();}
  if(fadeA>.05)motifFx(c,S,x,y,size*.8,fly,t,e.n||1,light);
 }
 // TRÚNG: lóe sáng + sóng + số sát thương
 if(hitK>0){
  if(!scene.reduceFlash){c.save();c.globalAlpha=.45*(1-hitK)**2;c.fillStyle='#ffffff';c.fillRect(-60,-60,1020,H+120);c.restore();}
  c.save();c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const r=60+hitK*(260+i*120);c.globalAlpha=(1-hitK)*(.8-i*.2);c.strokeStyle=i%2?'#ffffff':S.color;c.lineWidth=10-i*2;c.beginPath();c.ellipse(bx,by-150,r,r*.55,0,0,TAU);c.stroke();}c.restore();
  if(!scene.cutSeen?.has('hit:'+e.n)){(scene.cutSeen??=new Set()).add('hit:'+e.n);scene.onFeedbackSound?.('hit',3);}
 }
 if(k>=CUT_PHASE.cast){const u=seg(k,CUT_PHASE.cast,CUT_PHASE.wipeOut),pop=1+.5*(1-ease(seg(u,0,.25)));
  if(e.dmg){c.save();c.translate(bx,by-330-u*30);c.scale(pop,pop);txt(c,'-'+Math.round(e.dmg).toLocaleString('vi-VN'),0,0,84,'#ffd54a',{width:12});c.restore();txt(c,e.ko?'K.O!':S.kind==='pet'?'LINH THÚ':S.kind==='gift'?'BẠO PHÁT':'THẦN KỸ',bx,by-410-u*30,34,e.ko?'#ff5b4a':'#ff9b3d',{width:7});}
  else if(e.heal||e.shield)txt(c,e.heal?'+'+Math.round(e.heal).toLocaleString('vi-VN'):'KHIÊN +'+Math.round(e.shield).toLocaleString('vi-VN'),ax+60,ay-430,60,e.heal?'#7dffa8':'#9be8ff',{width:10});}
 if(outK>0){c.globalAlpha=outK;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
 c.restore();
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
