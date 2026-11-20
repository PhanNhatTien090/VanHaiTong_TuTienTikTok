// 18/11/2026 (chủ game: quà ≥99 hiệu ứng yếu → CHIẾU RIÊNG): TỌA KỸ BÍ CẢNH — quà ≥99 → màn riêng người tặng ra chiêu.
// Server xếp lịch + hoãn giờ đợt quái (mount-realm.mjs realmCut). 3 kiểu theo mức quà:
//  ultimate (99)  VẠN THÚ PHỤC     — đàn linh thú ánh sáng lao ngang sân húc văng yêu thú
//  inferno  (199) HỎA THIÊU BÍ CẢNH — tường lửa quét sàn, yêu thú bốc cháy (lửa thật trên sân cháy tiếp sau màn)
//  grand    (300) NGỰ THÚ ĐẠI CHIÊU — Thú Vương của Bí Cảnh hiện thân khổng lồ sau lưng người tặng, gầm → giáng đòn
// Ngôn ngữ chung với Chính Ma/Lôi Đài: letterbox, cut-in cận mặt, tụ khí → nén → phát chiêu → TRÚNG (đứng hình + khung impact) → chữ.
import {drawCaster,drawCutInBand,cutVeil,txt,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {fxVariant,PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawSkyLances,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';
import {realmLayout} from './mount-realm-layout.js';
import {mountImage,mountById} from './mounts.js';

const TIER={ultimate:{pal:'jade',label:'VẠN THÚ PHỤC',sub:'đàn linh thú xung trận'},inferno:{pal:'crimson',label:'HỎA THIÊU BÍ CẢNH',sub:'lửa trời thiêu sàn'},grand:{pal:'gold',label:'NGỰ THÚ ĐẠI CHIÊU',sub:'Thú Vương hiện thân'}};
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
const ease=k=>1-(1-clamp(k))**3;
const IMG=new Map();
function img(src){if(!src||typeof Image==='undefined')return null;let g=IMG.get(src);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=src;IMG.set(src,g);}return g.ok?g.im:null;}
const PETS=['astral-dragon','ky-lan','sun-phoenix','frost-tiger','xich-ha-phuong','ember-fox','hac-tinh-ho','ngoc-chau-long','bach-nguyet-ho'];
const petSrc=id=>'/assets/spirit-pets-v1/'+id+'.webp';
// vẽ khung đầu (ô 1/3) của ảnh sheet ngang 3 ô; w = bề ngang hiển thị, đáy ảnh đặt tại (0,0)
function drawCell(c,im,cells,cell,w){const cw=im.naturalWidth/cells,h=w*im.naturalHeight/cw;c.drawImage(im,cell*cw,0,cw,im.naturalHeight,-w/2,-h,w,h);}
function drawMob(c,wave,w){if(wave?.art){const im=img('/assets/toa-ky-v1/'+wave.art+'.webp');if(im){const h=w*im.naturalHeight/im.naturalWidth;c.drawImage(im,-w/2,-h,w,h);return true;}return false;}const at=img('/assets/boss-atlas.webp');if(!at)return false;drawCell(c,at,3,wave?.cell??0,w);return true;}
const nowOf=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));

export function findRealmCut(e,now){if(!e?.cuts?.length)return null;let best=null;for(const x of e.cuts){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn (bỏ sân). */
export function realmCutFrame(scene,c,t,H){
 const e=scene.mountRealmStatus;if(e){for(const x of e.cuts||[]){img(realmLayout(e).image);if(x.boss)img(mountImage(x.boss));}for(const w of realmLayout(e).waves)if(w.art)img('/assets/toa-ky-v1/'+w.art+'.webp');img('/assets/boss-atlas.webp');if(e.cuts?.some(x=>x.tier==='ultimate'))for(const id of PETS)img(petSrc(id));} // tải sẵn
 const cut=e?findRealmCut(e,nowOf(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.realmCutOn!==!!cut){scene.realmCutOn=!!cut;if(typeof document!=='undefined')document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.realmVeilUsed){scene.realmVeilUsed=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 try{drawRealmCut(scene,c,t,H,cut.x,cut.k,e);}catch(err){console.warn('[realm-cut]',err);return false;}
 const seen=scene.realmCutSeen??=new Set(),hitKey=cut.x.id+':hit';if(cut.k>=CUT_PHASE.cast&&!seen.has(hitKey)){seen.add(hitKey);if(seen.size>30)scene.realmCutSeen=new Set([...seen].slice(-10));scene.onFeedbackSound?.('hit',3);scene.onSpectacleImpact?.();}
 return true;
}

export function drawRealmCut(scene,c,t,H,x,k,e){
 const T=TIER[x.tier]||TIER.ultimate,h=hash(x.id),V=fxVariant(h),P=PALETTES[T.pal]||PALETTES.gold;
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,dir=V.flip?-1:1,X=v=>dir>0?v:900-v;
 const ms=x.ms||4000,secOf=k0=>(k-k0)*ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast);
 const HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const A=(scene.playerIndex||new Map()).get(x.user);
 const ax=X(-100+ease(shoutK/.6)*330),ay=H*.8,chestA=ay-330,handX=ax+dir*70,gx=X(680),gy=H*.74,chestG=gy-120;
 const zoom=motion?1+.08*smooth(charge)-.06*smooth(castK)+punch(relSec,.05)+punch(hitFx,.1):1,shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.7?(1-hitFx/.7)*20:comp*5;
 fxCamera(c,450,H*.55,zoom,shake,t);
 // nền: map Bí Cảnh tối lại theo màu chiêu
 c.fillStyle=P.deep;c.fillRect(-200,-200,1300,H+400);
 const map=img(realmLayout(e).image);if(map){const s=Math.max(900/map.naturalWidth,H/map.naturalHeight)*1.15;c.globalAlpha=.5;c.drawImage(map,450-map.naturalWidth*s/2,H*.5-map.naturalHeight*s/2,map.naturalWidth*s,map.naturalHeight*s);c.globalAlpha=1;}
 {const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep+'cc');g.addColorStop(.55,'#03030699');g.addColorStop(1,P.deep+'ee');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);}
 dot(c,P.main,450,H*.55,H*.5,.2);
 // TỤ KHÍ
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,ax,ay,chargeA*.9,t,P);drawCircle(c,ax,ay-8,260,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,ax,chestA,charge*.7*(1-castK),t,P,light,H);drawAura(c,ax,ay,600,280,Math.max(chargeA,.45*(castK>0?1-castK:0)),t,P,light);
 // GRAND: Thú Vương hiện thân sau lưng người tặng (to dần, gầm lúc nén)
 if(x.tier==='grand'){const bi=img(mountImage(x.boss)),rise=smooth(seg(k,.08,CUT_PHASE.shout)),roar=comp+Math.max(0,1-castK*2)*(castK>0?.6:0);
  if(bi&&rise>0){const w0=760*(.55+.45*rise)*(1+.04*roar*Math.sin(t*.06)),hh=w0*bi.naturalHeight/bi.naturalWidth,bx=450,by=ay-300-60*rise;
   c.save();c.globalCompositeOperation='lighter';dot(c,P.main,bx,by-hh*.45,w0*.75,.45*rise);c.restore();
   c.save();c.globalAlpha=rise*(1-seg(hitFx,.6,1.4)*.6);c.translate(bx,by);if(dir<0)c.scale(-1,1);c.drawImage(bi,-w0/2,-hh,w0,hh);c.restore();c.globalAlpha=1;}}
 // YÊU THÚ phía đối diện (ảnh quái của map, hoặc bóng đỏ)
 const waves=realmLayout(e).waves,fly=out3(seg(hitFx,0,.9));
 for(let i=0;i<5;i++){const row=i%2,fx0=gx+dir*(i-2)*90+dir*row*30,fy=gy+row*36-(i%3)*14,kx=fx0+dir*fly*(240+i*60),ky=fy-Math.sin(fly*Math.PI)*(70+i*22),rot=dir*fly*(.4+i*.08),a=(.9-row*.15)*(1-seg(hitFx,.6,1.2)*.8);
  c.save();c.globalAlpha=a;c.translate(kx,ky);c.rotate(rot);if(dir>0)c.scale(-1,1);
  if(!drawMob(c,waves[(i+h)%waves.length],170)){c.globalCompositeOperation='lighter';dot(c,'#ff4040',0,-60,70,.6);}
  if(x.tier==='inferno'&&hitFx>0){c.globalCompositeOperation='lighter';dot(c,'#ff7a1a',0,-50,90,.7*(1-seg(hitFx,.5,1.4)));}c.restore();}
 // người tặng
 drawCaster(scene,c,A,ax,ay,5.2,t,dir<0);
 drawInflow(c,handX,chestA,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);drawCompress(c,handX,chestA,comp,t,P);
 if(relSec>=0)drawBurst(c,handX,chestA,relSec,P,H,{light,pillar:false,scale:.55,seed:V.style+1,reduceFlash:rf});
 // PHÁT CHIÊU
 if(castK>0&&k<CUT_PHASE.hit+.03){const fade=1-seg(k,CUT_PHASE.hit-.05,CUT_PHASE.hit+.03),u=ease(seg(castK,.05,.9));c.save();c.globalCompositeOperation='lighter';
  if(x.tier==='ultimate'){ // ĐÀN LINH THÚ: ảnh linh thú thật lao ngang, vệt sáng phía sau, xếp 2 tầng
   const n=light?4:7;for(let i=0;i<n;i++){const lane=chestG+40-(i%3)*120+(i>>1)*14,lag=i*.06,p=clamp((u-lag)/(1-lag)),sx=handX-dir*60+(gx+dir*200-handX+dir*60)*p;if(p<=0)continue;
    for(let j=1;j<6;j++)dot(c,P.main,sx-dir*j*55,lane-60,70-j*9,fade*(.7-j*.1));
    const im=img(petSrc(PETS[(i+h)%PETS.length]));c.globalCompositeOperation='source-over';if(im){c.save();c.globalAlpha=fade;c.translate(sx,lane);if(dir<0)c.scale(-1,1);drawCell(c,im,3,0,210-(i%3)*25);c.restore();}c.globalCompositeOperation='lighter';}
  }else if(x.tier==='inferno'){ // tường lửa quét sàn từ người tặng sang yêu thú
   const front=handX+(gx+dir*220-handX)*u,from=Math.min(handX,front),to=Math.max(handX,front),n=light?18:40;
   for(let i=0;i<n;i++){const fx=from+(to-from)*(i/n),hgt=120+80*Math.sin(t*.02+i*1.7)+60*(i%3);dot(c,i%3?'#ff5a1a':'#ffd060',fx,gy-hgt*.4,hgt*.55,fade*.75);}
   dot(c,'#ffd060',front,gy-90,150,fade*.9);
  }else{ // grand: Thú Vương lao + mưa thương ánh sáng
   drawSkyLances(c,gx,gy,seg(castK,.1,1),t,P,light,h%97,H*.3);dot(c,P.soft,gx,chestG,220*u,.5*fade);}
  c.restore();c.globalAlpha=1;}
 // TRÚNG
 if(hitSec>=0&&!HS.frozen){drawBurst(c,gx,chestG,hitFx,P,H,{light,pillar:true,scale:x.tier==='grand'?1.4:1.15,ground:gy,seed:h%7,reduceFlash:rf});
  if(x.tier==='inferno'){c.save();c.globalCompositeOperation='lighter';const n=light?16:36;for(let i=0;i<n;i++){const u=seg(hitFx,0,1.4),px=(i/n)*1000-50,py=gy+20-out3(u)*(80+(i%5)*40);dot(c,i%2?'#ff5a1a':'#ffb030',px,py,40+(i%4)*14,(1-u)*.7);}c.restore();}}
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),450,H*.55);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,gx,chestG,hitSec/.1,P,h%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),16);
 drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,dir,t,{label:'TỌA KỸ BÍ CẢNH'});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 // CHỮ
 const name=Array.from(String(x.name||A?.name||'')).slice(0,14).join('');
 const shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const chars=Array.from(name+' XUẤT CHIÊU!'),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,60,'#fff6dc',{width:12,max:860});c.restore();
  txt(c,x.tier==='grand'&&x.boss?(mountById(x.boss)?.name||'Thú Vương')+' hiện thân':T.sub,450,H*.2+56,26,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600*dir,tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,T.label,450,H*.13,70,tg,{width:14,max:880});txt(c,name,450,H*.13+56,26,'#ffffff',{width:5,weight:'800',max:820});c.restore();}
 const o=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
