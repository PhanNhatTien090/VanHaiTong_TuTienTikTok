// 18/11/2026 (chủ game: "6 món 5★ trông giống nhau"): CHIÊU RIÊNG THẦN KHÍ 5★ — mỗi món một cơ chế, 3,6 s (BAO_CUT_MS[5]).
// Nhịp: TRIỆU BẢO 0,2–1,0 s (cận mặt, thần khí bay lên) → CƠ CHẾ RIÊNG 1,0–2,5 s → TRÚNG 2,5 s (đứng hình + khung impact) → chữ.
// Dựng từ ảnh pháp bảo + hiệu ứng vẽ tay; chỉ vẽ 2 người (màn riêng) nên làm mạnh tay. Không shadowBlur/filter mỗi khung.
import {drawCaster,drawCutInBand,txt} from './skill-cutscene.js?v=20261118';
import {fxVariant,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop,drawSkyLances} from './cut-fx.js?v=20261118';
import {baoItem,baoArt,BAO_LINES} from './phap-bao-data.js';

const TAU=Math.PI*2,ease=k=>1-(1-clamp(k))**3,rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export const BAO5_HIT=2.5;
export const BAO5={
 's5-kiem':{move:'Tử Tiêu Cửu Kiếm',main:'#b46bff',soft:'#ecd6ff',deep:'#0d0419'},
 's5-an':{move:'Phiên Thiên Trấn Địa',main:'#ffb347',soft:'#ffe8c2',deep:'#140b02'},
 's5-dinh':{move:'Cửu Long Hộ Đỉnh',main:'#ff6a3d',soft:'#ffd9c7',deep:'#160502'},
 's5-chung':{move:'Đông Hoàng Chấn Hồn',main:'#ffd34d',soft:'#fff3c4',deep:'#141002'},
 's5-phien':{move:'Ba Tiêu Liệt Diễm',main:'#ff4f6d',soft:'#ffd0d8',deep:'#16030a'},
 's5-kinh':{move:'Côn Lôn Phản Chiếu',main:'#7fe3ff',soft:'#dff8ff',deep:'#021018'}};
const IMG=new Map();
function art(id){if(typeof Image==='undefined')return null;let g=IMG.get(id);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=baoArt(id);IMG.set(id,g);}return g.ok?g.im:null;}
function item(c,im,x,y,s,a=1,rot=0){if(!im||a<=.01||s<=1)return;c.save();c.globalAlpha=a;c.translate(x,y);if(rot)c.rotate(rot);c.drawImage(im,-s/2,-s/2,s,s);c.restore();c.globalAlpha=1;}
function ring(c,x,y,R,lw,a,col,flat=1){if(a<=.01||R<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.ellipse(x,y,R,R*flat,0,0,TAU);c.stroke();c.restore();c.globalAlpha=1;}
function slash(c,x0,y0,x1,y1,a,col,w){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let p=0;p<2;p++){c.globalAlpha=a*(p?1:.55);c.strokeStyle=p?'#ffffff':col;c.lineWidth=p?w*.35:w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}c.restore();c.globalAlpha=1;}

// u = 0..1 trong pha cơ chế. S = {A,B,H,P,im,t,light}
const MECH={
 // kiếm tách thành 9 đạo kiếm khí, bay thành quạt rồi chém chéo xuyên đối thủ
 's5-kiem'(c,u,S){const {B,H,P,im,t,light}=S,n=light?5:9,cx=450,cy=H*.36,spread=ease(seg(u,0,.35)),go=seg(u,.4,1);
  for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*.22*spread,R=200*spread,x0=cx+Math.cos(a)*R,y0=cy+Math.sin(a)*R*.7;
   if(go<=0){item(c,im,x0,y0,150,spread,a+Math.PI/2);dot(c,P.main,x0,y0,60,.4*spread);continue;}
   const p=clamp((go-i*.04)/.5),x=x0+(B.x-x0)*ease(p),y=y0+(B.chest-y0)*ease(p);slash(c,x0+(x-x0)*.6,y0+(y-y0)*.6,x+(B.x-x0)*.15,y+(B.chest-y0)*.15,(1-p*.5),P.main,26);item(c,im,x,y,110,1-seg(p,.8,1),Math.atan2(B.chest-y0,B.x-x0)+Math.PI/2);}},
 // ấn khổng lồ từ trời đập xuống đối thủ, đất nứt, bụi tung
 's5-an'(c,u,S){const {B,H,P,im,t}=S,drop=seg(u,.15,.75),y=-260+(B.y-120+260)*drop**2.2,s=520-120*drop;
  dot(c,P.main,B.x,B.y-40,260*drop,.35*drop);ring(c,B.x,B.y,300*drop,6,drop*.8,P.main,.3);
  if(drop>0)for(let i=0;i<4;i++)slash(c,B.x+(i-1.5)*120,-60,B.x+(i-1.5)*60,y,.25*drop,P.soft,8);
  item(c,im,B.x,y,s,1,Math.sin(t*.01)*.03*(1-drop));
  const crack=seg(u,.75,1);if(crack>0){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=P.main;c.lineWidth=6;for(let i=0;i<10;i++){const a=Math.PI+i/9*Math.PI,L=(200+rn(i)*260)*ease(crack);c.globalAlpha=1-crack*.4;c.beginPath();c.moveTo(B.x,B.y);c.lineTo(B.x+Math.cos(a)*L,B.y-Math.sin(a)*L*.3);c.stroke();}c.restore();c.globalAlpha=1;}},
 // 9 rồng lửa (vệt lửa xoắn) lượn quanh đỉnh rồi lao vào đối thủ; hồi quang xanh về chủ nhân
 's5-dinh'(c,u,S){const {A,B,H,P,im,t,light}=S,cx=450,cy=H*.4,show=ease(seg(u,0,.2)),n=light?5:9;item(c,im,cx,cy,300*show,show,0);dot(c,P.main,cx,cy,220*show,.45*show);
  const go=seg(u,.55,1);for(let i=0;i<n;i++){const a=i/n*TAU+u*TAU*1.5,R=230*show*(1-go),x=cx+Math.cos(a)*R+(B.x-cx)*ease(clamp((go-i*.03)/.6)),y=cy+Math.sin(a)*R*.5+(B.chest-cy)*ease(clamp((go-i*.03)/.6));
   for(let j=0;j<6;j++){const b=a-j*.18;dot(c,j?P.main:'#fff2c8',x-Math.cos(b)*j*30*(1-go)-(B.x-cx)*j*.03*go,y-Math.sin(b)*j*16*(1-go),52-j*6,.95-j*.12);}}
  const heal=seg(u,.2,.6)*(1-seg(u,.85,1));if(heal>0&&A){for(let i=0;i<(light?8:18);i++){const p=(rn(i)+u*2)%1;dot(c,'#7dff9a',S.ax+(rn(i+4)-.5)*160,S.ay-p*420,10,heal*(1-p));}txt(c,'HỒI MÁU',S.ax,S.ay-460,34,'#9dffb5',{width:7});}},
 // chuông úp trùm chủ nhân (hộ thể) rồi gõ: 3 vòng sóng âm vàng đẩy văng đối thủ
 's5-chung'(c,u,S){const {B,H,P,im,ax,ay}=S,drop=ease(seg(u,0,.3)),by=ay-260-(1-drop)*500;item(c,im,ax,by,420,.95,0);ring(c,ax,ay-40,190*drop,5,drop*.8,P.main,.35);
  for(let i=0;i<3;i++){const p=seg(u,.4+i*.18,.75+i*.18);if(p<=0||p>=1)continue;ring(c,ax,by,80+p*760,16-i*4,(1-p),i?P.main:'#ffffff',.8);}
  S.foeX=B.x+out3(seg(u,.5,1))*140*S.dir;},
 // quạt một nhát: lốc lửa xoáy quét ngang từ chủ nhân sang đối thủ
 's5-phien'(c,u,S){const {A,B,H,P,im,t,ax,light}=S,swing=ease(seg(u,0,.3));item(c,im,ax+S.dir*90,S.ay-380,300,1,-1.2*S.dir+swing*2.2*S.dir);
  const go=seg(u,.3,1),fx=ax+(B.x+S.dir*80-ax)*ease(go),n=light?14:36;if(go>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const h=i/n,a=t*.02+h*14,r=60+h*220;dot(c,i%3?P.main:'#ffd36b',fx+Math.cos(a)*r*.5,S.ay-40-h*560+Math.sin(a)*16,72-h*24,.95*(1-seg(u,.92,1)));}c.restore();}},
 // gương chiếu: đòn của đối thủ bị hút vào gương rồi bắn ngược thành tia sáng
 's5-kinh'(c,u,S){const {A,B,H,P,im,t,ax}=S,mx=ax+S.dir*120,my=S.ay-360,show=ease(seg(u,0,.25));item(c,im,mx,my,300*show,show,Math.sin(t*.004)*.1);ring(c,mx,my,150*show,5,show*.8,P.main);
  const absorb=seg(u,.2,.5);if(absorb>0&&absorb<1)for(let i=0;i<8;i++){const p=clamp((absorb-i*.04)/.6),x=B.x+(mx-B.x)*p,y=B.chest+(my-B.chest)*p;dot(c,'#ff6a6a',x,y,14,1-p*.5);}
  const shot=seg(u,.55,1);if(shot>0){const reach=ease(Math.min(1,shot*1.8));slash(c,mx,my,mx+(B.x-mx)*reach,my+(B.chest-my)*reach,1-shot*.3,P.main,40);dot(c,P.soft,mx,my,120,.6*(1-shot));}},
};

/** Màn thần thông 5★ riêng từng món. Trả false nếu món không có cơ chế riêng (dùng khung chung). */
export function drawBao5(scene,c,t,H,cut,players){
 const {e}=cut,id=e.cut.bao,U=BAO5[id],mech=MECH[id],it=baoItem(id);if(!U||!mech||!it)return false;
 const sec=cut.age/1000,V=fxVariant(e.n||1),dir=V.flip?-1:1,X=x=>dir>0?x:900-x,P={main:U.main,soft:U.soft,gold:'#ffe7a8',deep:U.deep};
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,im=art(id);
 const caster=players.get(e.by),foe=players.get(e.to),A={x:X(220),y:H*.8},B={x:X(660),y:H*.8};A.chest=A.y-330;B.chest=B.y-300;
 const hitSec=sec-BAO5_HIT,HS=hitStop(hitSec,t,.1),hitFx=HS.sec;t=HS.t;
 const call=seg(sec,.2,1),mechK=seg(sec,1,BAO5_HIT),cx=450,cy=H*.5;
 const zoom=motion?1+.05*smooth(call)-.03*smooth(mechK)+punch(hitSec,.12):1,shake=!motion||HS.frozen?0:hitSec>0&&hitSec<.6?(1-hitSec/.6)*18:0;
 fxCamera(c,cx,cy,zoom,shake,t);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep);g.addColorStop(.55,'#020104');g.addColorStop(1,P.deep);c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);dot(c,P.main,cx,H*.45,H*.5,.2);
 drawSkyBeams(c,A.x,A.y,smooth(call)*(1-seg(sec,1.2,1.6))*.9,t,P);drawCircle(c,A.x,A.y,260,smooth(seg(sec,.2,.6))*(1-seg(sec,1.4,1.8)),t,P,V.spin);drawInflow(c,A.x,A.chest-140,call*(sec<1?1:0),t,P,light,380);
 const S={A,B,H,P,im,t,light,dir,ax:A.x,ay:A.y,scene,caster};
 if(mechK>0&&sec<BAO5_HIT+.25)try{mech(c,mechK,S);}catch(err){console.warn('[bao5]',id,err);}
 if(foe){c.save();const fx=S.foeX??B.x;drawCaster(scene,c,foe,fx,B.y,4.2,t,dir>0);c.restore();}
 drawCaster(scene,c,caster,A.x,A.y,4.6,t,dir<0);
 if(sec<1.2)item(c,im,A.x,A.chest-200-40*ease(call),240*(.4+.6*ease(call)),ease(call),Math.sin(t*.003)*.4);
 if(hitSec>=0&&!HS.frozen){drawBurst(c,B.x,B.chest,hitFx,P,H,{light,pillar:true,scale:1.25,ground:B.y,seed:(e.n||1)%7,reduceFlash:rf});drawSkyLances(c,B.x,B.y,.4+hitFx*.4,t,P,light,(e.n||1)%61,-200);}
 drawEmbers(c,H,seg(sec,BAO5_HIT,BAO5_HIT+.4)*(1-seg(sec,3.2,3.6)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.35+.2*smooth(call)*(hitSec<0?1:0),cx,cy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,B.x,B.chest,hitSec/.1,P,(e.n||1)%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.35),16);
 drawCutInBand(scene,c,caster,H,seg(sec,.3,1),P,dir,t,{label:'THẦN KHÍ CAO CẤP'});
 drawLetterbox(c,H,seg(sec,.05,.35)*(1-seg(sec,3.1,3.5)));
 if(sec>=.4&&sec<1.2){c.globalAlpha=seg(sec,.4,.6)*(1-seg(sec,1,1.2));txt(c,'✦ '+it.name.toUpperCase()+' ✦',450,H*.16,52,P.soft,{width:12,max:860});txt(c,(caster?.name||'')+' · thần thông '+BAO_LINES[it.line].skill,450,H*.16+54,24,'#ffffff',{width:6,max:840,weight:'800'});c.globalAlpha=1;}
 if(sec>=1){const k=seg(sec,1,1.25),slide=(1-ease(k))*-600*dir,tg=c.createLinearGradient(0,H*.08-40,0,H*.08+40);tg.addColorStop(0,'#ffffff');tg.addColorStop(.5,P.soft);tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);txt(c,U.move,450,H*.08,60,tg,{width:13,max:880});c.restore();}
 if(sec>=BAO5_HIT){const u=seg(sec,BAO5_HIT,3.3),pop=1+.5*(1-ease(seg(u,0,.25)));c.save();c.translate(450,H*.34);c.scale(pop,pop);txt(c,e.dmg?'-'+Math.round(e.dmg).toLocaleString('vi-VN'):'',0,0,90,'#ffd54a',{width:14});c.restore();
  txt(c,e.ko?'K.O!':'THẦN THÔNG · '+BAO_LINES[it.line].skill.toUpperCase(),450,H*.34+76,40,e.ko?'#ffffff':P.soft,{width:9,max:860});}
 const o=seg(sec,3.35,3.6);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
 const seen=scene.cutSeen??=new Set(),cue=(key,at,fn)=>{const kk='b5:'+e.n+':'+key;if(sec>=at&&sec<at+.4&&!seen.has(kk)){seen.add(kk);fn();}};
 cue('call',.5,()=>scene.onFeedbackSound?.('hit',2));cue('mech',1.2,()=>scene.onFeedbackSound?.('hit',2));cue('hit',BAO5_HIT,()=>{scene.onSpectacleImpact?.();scene.onFeedbackSound?.('hit',3);});
 return true;
}
