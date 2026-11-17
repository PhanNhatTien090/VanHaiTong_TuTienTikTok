// 18/11/2026 (chủ game): CHÍNH MA ĐẠI CHIẾN — quà ≥30 coin → CHIẾU RIÊNG người tặng tung chiêu ĐẨY LÙI cả phe địch.
// Server xếp lịch + hoãn giờ trận (sect-war.mjs warCut). Ngôn ngữ điện ảnh như Lôi Đài/Đua: letterbox, cut-in cận mặt, tụ khí
// (trận pháp, cột sáng, hạt xoáy, hào quang, nghiêng máy) → nén → phát chiêu (sóng chém ngang / thiên giáng / vòng xung kích)
// → TRÚNG: đứng hình 0,1 s + khung impact đảo màu → phe địch bị hất văng ra mép màn + nổ, nứt đất → "+N trượng".
// Chính Đạo đứng trái, Ma Đạo đứng phải (khớp bản đồ Vạn Lý Chiến Đạo). Biến thể theo mã màn: màu, kiểu chiêu, chiều xoay, tên chiêu.
import {drawCaster,drawCutInBand,cutVeil,txt,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {fxVariant,PALETTES,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawAura,drawCompress,drawBurst,drawBeam,drawSkyLances,drawZoomLines,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop} from './cut-fx.js?v=20261118';

const SIDE={
 chinh:{label:'CHÍNH ĐẠO',enemy:'MA ĐẠO',pals:['gold','azure','jade'],moves:['Thiên Kiếm Trảm Ma','Hạo Nhiên Chính Khí','Vạn Kiếm Quy Tông','Thái Cực Phá Tà']},
 ma:{label:'MA ĐẠO',enemy:'CHÍNH ĐẠO',pals:['crimson','violet','crimson'],moves:['Huyết Hải Phiên Thiên','Vạn Ma Phệ Hồn','Cửu U Ma Diễm','Thiên Ma Giải Thể']},
};
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))|0;return Math.abs(h);};
const ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const nowOf=(scene,t)=>(scene.warServerNow||Date.now())+Math.min(2000,t-(scene.warReceivedAt||t)); // như sect-war.js

/** Màn đang chiếu (hoặc null). */
export function findWarCut(e,now){if(!e?.cuts?.length)return null;let best=null;for(const x of e.cuts){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn (bỏ sân). */
export function warCutFrame(scene,c,t,H){
 const e=scene.warStatus,cut=e?.active?findWarCut(e,nowOf(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.warCutOn!==!!cut){scene.warCutOn=!!cut;document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.warVeilUsed){scene.warVeilUsed=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 try{drawWarCutFull(scene,c,t,H,cut.x,cut.k,e);}catch(err){console.warn('[war-cut]',err);return false;}
 if(!scene.warCutSeen?.has(cut.x.id)){(scene.warCutSeen??=new Set()).add(cut.x.id);if(scene.warCutSeen.size>30)scene.warCutSeen=new Set([...scene.warCutSeen].slice(-10));}
 const hitKey=cut.x.id+':hit';if(cut.k>=CUT_PHASE.cast&&!scene.warCutSeen.has(hitKey)){scene.warCutSeen.add(hitKey);scene.onFeedbackSound?.('hit',3);}
 return true;
}

export function drawWarCutFull(scene,c,t,H,x,k,e){
 const side=x.side==='ma'?'ma':'chinh',foe=side==='chinh'?'ma':'chinh',D=SIDE[side],h=hash(x.id),V=fxVariant(h),P=PALETTES[D.pals[h%D.pals.length]];
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,dir=side==='chinh'?1:-1,X=v=>dir>0?v:900-v;
 const ms=x.ms||3600,secOf=k0=>(k-k0)*ms/1000,relSec=secOf(CUT_PHASE.shout),hitSec=secOf(CUT_PHASE.cast);
 const HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const shoutK=seg(k,CUT_PHASE.wipeIn,CUT_PHASE.shout),castK=seg(k,CUT_PHASE.shout,CUT_PHASE.cast),hitK=seg(k,CUT_PHASE.cast,CUT_PHASE.hit);
 const charge=seg(k,.1,CUT_PHASE.shout),comp=k<CUT_PHASE.shout?seg(k,CUT_PHASE.shout-.08,CUT_PHASE.shout):0;
 const idx=scene.playerIndex||new Map(),A=idx.get(x.user);
 const foes=(e?.roster?.[foe]||[]).map(r=>idx.get(r.id)).filter(Boolean).slice(0,5);
 const ax=X(-120+ease(shoutK/.6)*360),ay=H*.8,chestA=ay-330,handX=ax+dir*70;
 const gx=X(690),gy=H*.72,chestG=gy-150; // tâm phe địch
 const toG=smooth(seg(castK,.5,1)),cx=ax+(gx-ax)*toG,cy=chestA+(chestG-chestA)*toG;
 const zoom=motion?1+.08*smooth(charge)-.07*smooth(castK)+punch(relSec,.05)+punch(hitFx,.1):1;
 const shake=!motion||HS.frozen?0:hitFx>0&&hitFx<.6?(1-hitFx/.6)*18:comp*5;
 fxCamera(c,cx,cy,zoom,shake,t);
 const dutch=motion?V.spin*.04*smooth(charge)*(1-smooth(castK)):0;if(dutch){c.translate(cx,cy);c.rotate(dutch);c.translate(-cx,-cy);}
 // nền tối theo phe + chiến địa mờ
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep);g.addColorStop(.6,'#030306');g.addColorStop(1,P.deep);c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 dot(c,P.main,450,H*.55,H*.55,.22);
 c.save();c.globalAlpha=.35;c.strokeStyle=P.main;c.lineWidth=2;for(let i=0;i<6;i++){const yy=H*.83+i*i*9;c.beginPath();c.moveTo(-100,yy);c.lineTo(1000,yy);c.stroke();}c.restore();
 // TỤ KHÍ
 const chargeA=smooth(charge)*(1-seg(castK,.15,.6));
 drawSkyBeams(c,ax,ay,chargeA*.9,t,P);
 drawCircle(c,ax,ay-8,260,smooth(seg(k,.09,.2))*(1-.7*seg(castK,.4,1)),t,P,V.spin);
 drawZoomLines(c,ax,chestA,charge*.7*(1-castK),t,P,light,H);
 drawAura(c,ax,ay,600,280,Math.max(chargeA,.45*(castK>0?1-castK:0)),t,P,light);
 // PHE ĐỊCH: hàng 2–5 người, hơi tối; trúng → hất văng ra mép, xoay, mờ dần
 const fly=out3(seg(hitFx,0,.9));
 foes.forEach((p,i)=>{const n=foes.length,row=i%2,fx0=gx+dir*(i-(n-1)/2)*95*(row?1:.9)+dir*row*40,fy=gy+row*30-(i%3)*12;
  const kx=fx0+dir*fly*(260+i*70),ky=fy-Math.sin(fly*Math.PI)*(80+i*25),rot=dir*fly*(.35+i*.08);
  c.save();c.globalAlpha=(.88-row*.12)*(1-seg(hitFx,.6,1.2)*.7);c.translate(kx,ky);c.rotate(rot);c.translate(-kx,-ky);drawCaster(scene,c,p,kx,ky,2.5,t,dir>0);c.restore();});
 if(!foes.length){dot(c,'#ff3b3b',gx,chestG,140,.25);}
 // người tặng
 drawCaster(scene,c,A,ax,ay,5.2,t,dir<0);
 drawInflow(c,handX,chestA,charge*(k<CUT_PHASE.shout+.01?1:0),t,P,light);
 drawCompress(c,handX,chestA,comp,t,P);
 if(relSec>=0)drawBurst(c,handX,chestA,relSec,P,H,{light,pillar:false,scale:.55,seed:V.style+1,reduceFlash:rf});
 // PHÁT CHIÊU — 3 kiểu theo biến thể
 if(castK>0&&k<CUT_PHASE.hit+.03){const fade=1-seg(k,CUT_PHASE.hit-.05,CUT_PHASE.hit+.03);
  if(V.style===0)drawBeam(c,handX,chestA,gx+dir*80,chestG,out3(seg(castK,.05,.6)),fade,t,P,light,120);
  else if(V.style===1){drawCircle(c,gx,H*.3,360,smooth(seg(castK,0,.25))*fade,t,P,-V.spin);dot(c,P.soft,gx,H*.3,130,.5*smooth(seg(castK,0,.25))*fade);drawSkyLances(c,gx,gy,seg(castK,.12,1)+hitK*.3,t,P,light,h%97,H*.3);}
  else{ // sóng chém ngang khổng lồ (lưỡi liềm) quét qua sân
   const u=easeIn(seg(castK,.1,1)),sx=handX+(gx+dir*60-handX)*u,R=220+u*120;c.save();c.globalCompositeOperation='lighter';
   for(let j=0;j<4;j++){c.globalAlpha=fade*(.9-j*.2);c.strokeStyle=j?P.main:'#ffffff';c.lineWidth=(30-j*6)*(1-j*.1);c.beginPath();c.ellipse(sx-dir*j*40,chestG-40,R*.45,R,0,dir>0?-1.25:Math.PI-1.25,dir>0?1.25:Math.PI+1.25,false);c.stroke();}
   dot(c,P.soft,sx,chestG-40,R*.9,fade*.6);c.restore();c.globalAlpha=1;}}
 // TRÚNG phe địch
 if(hitSec>=0&&!HS.frozen){drawBurst(c,gx,chestG,hitFx,P,H,{light,pillar:true,scale:1.15,ground:gy,seed:h%7,reduceFlash:rf});
  // bụi cuộn theo hướng hất
  c.save();c.globalCompositeOperation='lighter';const n=light?14:30;for(let i=0;i<n;i++){const u=seg(hitFx,0,1.2),px=gx+dir*(40+i*14)*out3(u)+(i%5-2)*20,py=gy-(i%4)*25-out3(u)*40*(i%3);dot(c,i%3?P.main:'#ffffff',px,py,18+(i%4)*10,(1-u)*.5);}c.restore();}
 drawEmbers(c,H,seg(k,CUT_PHASE.cast,CUT_PHASE.cast+.06),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.3+.35*comp+.25*smooth(charge)*(1-castK),cx,cy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,gx,chestG,hitSec/.1,P,h%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),16);
 if(relSec>=0&&relSec<.25&&motion)drawGhostSplit(c,.6*(1-relSec/.25),10);
 drawCutInBand(scene,c,A,H,seg(k,.13,.33),P,dir,t,{label:D.label});
 drawLetterbox(c,H,seg(k,.02,.12)*(1-seg(k,CUT_PHASE.hit+.01,CUT_PHASE.wipeOut)));
 // CHỮ
 const name=Array.from(String(x.name||A?.name||'')).slice(0,14).join(''),move=D.moves[(h>>>3)%D.moves.length];
 const shoutA=1-seg(castK,0,.18);
 if(shoutA>0){const chars=Array.from(name+' XUẤT CHIÊU!'),nShow=Math.ceil(chars.length*clamp(shoutK/.55)),pop=1+.25*(1-ease(seg(shoutK,0,.2)));c.globalAlpha=shoutA;
  c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,chars.slice(0,nShow).join(''),0,0,60,'#fff6dc',{width:12,max:860});c.restore();
  txt(c,D.label+' · đẩy lùi '+D.enemy,450,H*.2+56,26,P.soft,{width:6,max:820,weight:'800'});c.globalAlpha=1;}
 if(castK>0){const nk=ease(seg(castK,0,.25)),slide=(1-nk)*-600*dir;const tg=c.createLinearGradient(0,H*.13-40,0,H*.13+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,move,450,H*.13,70,tg,{width:14,max:880});txt(c,D.label+' · '+name,450,H*.13+56,24,'#ffffff',{width:5,weight:'800',max:820});c.restore();}
 if(k>=CUT_PHASE.cast){const u=seg(k,CUT_PHASE.cast,CUT_PHASE.wipeOut),pop=1+.5*(1-ease(seg(u,0,.25)));
  c.save();c.translate(450,H*.36);c.scale(pop,pop);txt(c,'ĐẨY LÙI '+D.enemy+'!',0,0,58,side==='chinh'?'#ffe9a8':'#ff9b8a',{width:11,max:860});c.restore();
  if(x.truong>0)txt(c,'+'+Number(x.truong).toLocaleString('vi-VN')+' trượng',450,H*.36+66,64,'#ffd54a',{width:12});}
 const o=seg(k,CUT_PHASE.hit,CUT_PHASE.wipeOut);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
