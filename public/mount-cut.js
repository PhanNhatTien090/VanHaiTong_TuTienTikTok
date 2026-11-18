// 18/11/2026 (chủ game: "nở tọa kỹ chiếu như đột phá, VIP hoặc Thần làm hiệu ứng riêng"): CHIẾU RIÊNG NỞ TỌA KỸ.
// VIP "Tử Lôi Phá Châu" (5,6 s): châu tím lơ lửng trên trận pháp → sét tím đánh 3 phía, châu nứt dần (3 tiếng nứt) → VỠ (đứng hình + đảo màu)
//   → mảnh châu bắn tung, tọa kỹ trồi lên từ trận pháp trong cột sáng tím → bảng tên (ai nở · tọa kỹ · bậc/sao · nở từ châu nào).
// THẦN "Thiên Môn Giáng Thú" (7,6 s): châu vàng bay lên → bầu trời NỨT thành Thiên Môn (khe sáng dọc mở ra) → BÓNG tọa kỹ hiện trong cửa trời
//   → BÙNG–BÙNG–BÙNG (3 sấm vàng) → tọa kỹ giáng xuống trong cột sáng, cánh tia 16 vệt, 2 sóng xung kích, mưa kim quang → bảng tên.
// Thường: vẫn là thẻ trên sân (mount-reveal-fx.js). Biến thể theo mã: chiều xoay, nghiêng máy, thứ tự sét, vị trí cửa trời.
// Chỉ vẽ 1 người + tọa kỹ (bỏ sân) → làm mạnh tay; không shadowBlur/filter mỗi khung.
import {drawMount} from './mount-fx.js';
import {ORBS} from './mounts.js';
import {REVEAL_MS,revealLines,glow,orbArt,shortName,text} from './mount-reveal-fx.js';
import {txt as ctxt,drawCutInBand,cutVeil,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {seg,out3,smooth,dot,fxCamera,punch,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop,drawSkyBeams,drawCircle,drawZoomLines,drawInflow} from './cut-fx.js?v=20261118';
const TAU=Math.PI*2,ease=k=>1-(1-Math.max(0,Math.min(1,k)))**3;
const PAL={vip:{main:'#b45cff',soft:'#ecd4ff',gold:'#ffe28a',deep:'#0e0420'},divine:{main:'#ffb52e',soft:'#fff1b8',gold:'#ffffff',deep:'#1a0f02'}};
export const DIVINE_BOOMS=Object.freeze([3.4,3.75,4.1]);
export const VIP_BREAK=2.4;
const hsh=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hasDoc=()=>typeof document!=='undefined';
function bolt(c,x0,y0,x1,y1,a,col,seed,w=10){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';for(let p=0;p<2;p++){c.globalAlpha=a*(p?1:.5);c.strokeStyle=p?'#ffffff':col;c.lineWidth=p?w*.3:w;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<=9;i++){const k=i/9;c.lineTo(x0+(x1-x0)*k+(i<9?(rn(seed+i)-.5)*70:0),y0+(y1-y0)*k+(i<9?(rn(seed+i+30)-.5)*50:0));}c.stroke();}c.restore();c.globalAlpha=1;}
function spokes(c,x,y,n,len,a,rot,col,w=14){if(a<=.01||len<=0)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(rot);for(let i=0;i<n;i++){c.rotate(TAU/n);const L=len*(.65+.35*rn(i));const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#ffffff');g.addColorStop(.3,col);g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.moveTo(0,-w/2);c.lineTo(L,0);c.lineTo(0,w/2);c.fill();}c.restore();c.globalAlpha=1;}
function shock(c,x,y,R,lw,a,col,flat=.45){if(a<=.01||R<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.ellipse(x,y,R,R*flat,0,0,TAU);c.stroke();c.restore();c.globalAlpha=1;}
function orbBig(c,kind,x,y,size,a,col){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';glow(c,x,y,size*1.2,col,a*.7);c.restore();c.globalAlpha=1;const im=orbArt(kind);c.save();c.globalAlpha=a;if(im)c.drawImage(im,x-size/2,y-size/2,size,size);else{c.fillStyle=col;c.beginPath();c.arc(x,y,size*.4,0,TAU);c.fill();}c.restore();c.globalAlpha=1;}
function cracks(c,x,y,R,n,u,seed){if(u<=0)return;c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.lineWidth=3;c.lineCap='round';for(let i=0;i<n;i++){const q=rn(seed+i)*TAU,L=R*Math.min(1,u*1.4)*(.6+.4*rn(seed+i+5));c.globalAlpha=.95;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(q)*L*.5+(rn(seed+i+9)-.5)*14,y+Math.sin(q)*L*.5);c.lineTo(x+Math.cos(q+.2)*L,y+Math.sin(q+.2)*L);c.stroke();}c.restore();c.globalAlpha=1;}
function pieces(c,x,y,u,col,seed,n=16){if(u<=0||u>=1)return;for(let i=0;i<n;i++){const q=rn(seed+i)*TAU,d=out3(u)*(240+rn(seed+i+40)*420),px=x+Math.cos(q)*d,py=y+Math.sin(q)*d+u*u*160,s=12+rn(seed+i+9)*20;c.save();c.globalAlpha=1-u;c.translate(px,py);c.rotate(u*7*(i%2?1:-1));c.fillStyle=i%3?col:'#ffffff';c.beginPath();c.moveTo(0,-s);c.lineTo(s*.7,s*.6);c.lineTo(-s*.6,s*.4);c.closePath();c.fill();c.restore();}c.globalAlpha=1;}
function mountBoth(c,id,x,y,s,t,seed,light,a=1){c.save();c.globalAlpha=a;try{drawMount(c,id,x,y,{scale:s,t,lod:light?'light':'full',seed});drawMount(c,id,x,y,{scale:s,t,lod:light?'light':'full',layer:'front',seed});}catch{}c.restore();c.globalAlpha=1;}
let SIL=null;
// Bóng đen: dựng 1 lần/màn (ngưỡng alpha bỏ quầng sáng mờ quanh tọa kỹ → không còn khung chữ nhật đen), sau đó chỉ dán ảnh.
function shadowOf(r,id,s,t,seed){
 if(r.silCv)return r.silCv;const now=globalThis.performance?.now?.()??Date.now();if(now<(r.silRetry||0))return null;r.silRetry=now+150; /* ảnh tọa kỹ chưa nạp → thử lại sau 150 ms */const W=900,Hh=900;
 if(!SIL){if(typeof OffscreenCanvas!=='undefined')SIL=new OffscreenCanvas(W,Hh);else if(hasDoc()){SIL=document.createElement('canvas');SIL.width=W;SIL.height=Hh;}}if(!SIL)return null;
 const o=SIL.getContext('2d',{willReadFrequently:true});o.setTransform(1,0,0,1,0,0);o.globalAlpha=1;o.globalCompositeOperation='source-over';o.clearRect(0,0,W,Hh);mountBoth(o,id,W/2,Hh*.8,s,t,seed,true);
 let d;try{d=o.getImageData(0,0,W,Hh);}catch{return null;}const px=d.data;let any=0;for(let i=0;i<px.length;i+=4){const on=px[i+3]>150;px[i]=3;px[i+1]=0;px[i+2]=6;px[i+3]=on?255:0;any|=on;}if(!any)return null;r.silRetry=Infinity;
 let cv=null;if(typeof OffscreenCanvas!=='undefined')cv=new OffscreenCanvas(W,Hh);else{cv=document.createElement('canvas');cv.width=W;cv.height=Hh;}cv.getContext('2d').putImageData(d,0,0);r.silCv=cv;return cv;
}
function mountShadow(c,r,x,y,s,t,col,a){
 if(a<=.01)return;const W=900,Hh=900,cv=shadowOf(r,r.id,2.4,t,r.seed);c.save();c.globalCompositeOperation='lighter';glow(c,x,y-Hh*.3*s/2.4,440,col,a*.5);c.restore();c.globalAlpha=1;
 if(!cv){dot(c,'#000000',x,y-200,220,a);return;}const k=s/2.4;c.globalAlpha=a;c.drawImage(cv,x-W/2*k,y-Hh*.8*k,W*k,Hh*k);c.globalAlpha=1;
}
function namePlate(c,r,H,a,col){
 if(a<=.01)return;const L=revealLines(r),py=H*.66,ph=250;
 c.save();c.globalAlpha=a*.8;c.fillStyle='#06040e';c.fillRect(50,py,800,ph);c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=4;c.strokeRect(50,py,800,ph);c.restore();c.globalAlpha=a;
 text(c,L.who,450,py+48,54,'#ffffff',10,760);text(c,L.mount,450,py+114,50,col,10,760);text(c,L.tier,450,py+164,30,'#ffe9a8',7,760);
 const oi=orbArt(r.orb);if(oi)c.drawImage(oi,250,py+186,44,44);text(c,L.orb,470,py+208,28,ORBS[r.orb]?.color||col,6,520);c.globalAlpha=1;
}

// 18/11 (chủ game): châu XANH mà nở VIP/Thần → băng vinh danh "THIÊN ĐẠO CHIẾU CỐ" (hiện từ lúc châu vỡ tới hết màn).
export function luckyBanner(c,H,sec,t,tier){
 const at=tier==='divine'?2.4:VIP_BREAK,u=sec-at;if(u<0)return;const a=Math.min(1,u/.35),pop=1+.5*Math.max(0,1-u/.4),y=H*.215; /* ngay dưới tiêu đề TỌA KỸ VIP (không đè), cách xa đáy (quà TikTok che) */
 c.save();c.globalCompositeOperation='source-over';if('filter' in c)c.filter='none';c.globalAlpha=a*.92;c.fillStyle='#120a02';c.fillRect(30,y-62,840,130);c.globalAlpha=a;c.strokeStyle='#ffd36b';c.lineWidth=4;c.strokeRect(30,y-62,840,130);
 c.globalCompositeOperation='lighter';glow(c,450,y,260,'#ffcf5a',.35*a*(.75+.25*Math.sin(t*.008)));c.globalCompositeOperation='source-over';c.globalAlpha=a; /* glow() để lại alpha thấp */
 c.translate(450,y-14);c.scale(pop,pop);text(c,'✦ THIÊN ĐẠO CHIẾU CỐ ✦',0,0,58,'#ffe08a',11,800);c.restore();c.globalAlpha=a;
 text(c,'Linh Châu xanh hóa tọa kỹ '+(tier==='divine'?'Thần':'VIP')+' · cơ duyên ngàn năm hiếm có',450,y+42,26,'#fff3cf',6,800);c.globalAlpha=1;
}
/** Hook đầu scene.drawFrame: true = đang chiếu riêng nở tọa kỹ VIP/Thần (bỏ sân). */
export function mountCutFrame(scene,c,t,H){
 const list=scene.mountReveals,r=list?.[0];
 if(r&&r.tier!=='common'&&r.start==null&&scene.mainStage)r.card=true; // đang có sự kiện lớn: không che trận, chỉ hiện thẻ
 if(!r||r.tier==='common'||r.card){if(scene.mountVeilUsed){scene.mountVeilUsed=false;cutVeil(null,false);}if(scene.mountCutOn){scene.mountCutOn=false;if(hasDoc())document.body?.classList?.toggle('cutscene-on',false);}return false;}
 if(r.start==null){r.start=t;try{const o=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(8,8).getContext('2d'):null;if(o)mountBoth(o,r.id,4,8,.01,t,r.seed,true);}catch{}} /* chạm vẽ 1 lần để nạp ảnh tọa kỹ trước pha bóng đen */
 const ms=REVEAL_MS[r.tier],age=t-r.start;if(age>=ms){list.shift();return mountCutFrame(scene,c,t,H);}
 const cut={k:age/ms,age,ms},full=cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!scene.mountCutOn){scene.mountCutOn=true;if(hasDoc())document.body?.classList?.toggle('cutscene-on',true);}
 scene.mountVeilUsed=true;cutVeil(cut,full);
 if(!full)return false;
 if(scene.canvas)c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 const sec=age/1000;
 try{if(r.tier==='divine')drawDivineCut(scene,c,t,H,r,sec);else drawVipCut(scene,c,t,H,r,sec);if(r.lucky)luckyBanner(c,H,sec,t,r.tier);}catch(err){console.warn('[mount-cut]',err);return false;}
 const cues=r.cues??=new Set(),cue=(key,at)=>{if(sec>=at&&sec<at+.6&&!cues.has(key)){cues.add(key);if(key[0]==='b')scene.onSpectacleImpact?.();else scene.onFeedbackSound?.('hit',key[0]==='c'?1:3);}};
 if(r.tier==='divine'){cue('g',1.2);DIVINE_BOOMS.forEach((b,i)=>cue('b'+i,b));cue('l',4.9);}else{cue('c1',1.7);cue('c2',1.95);cue('c3',2.2);cue('b0',VIP_BREAK);}
 return true;
}

export function drawVipCut(scene,c,t,H,r,sec){
 const P=PAL.vip,V=hsh(r.seed),dir=V&1?1:-1,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const ox=450,oy=H*.42,gy=H*.6,hitSec=sec-VIP_BREAK,HS=hitStop(hitSec,t,.1);t=HS.t;const bs=HS.sec;
 const charge=seg(sec,.45,VIP_BREAK),zoom=motion?1+.12*smooth(charge)+punch(hitSec,.14)-.06*smooth(seg(sec,2.6,4)):1;
 const shake=!motion||HS.frozen?0:hitSec>0&&hitSec<.7?(1-hitSec/.7)*20:seg(sec,1.6,VIP_BREAK)*8;
 fxCamera(c,ox,oy,zoom,shake,t);const tilt=motion?dir*.035*smooth(charge)*(1-seg(sec,2.4,3)):0;if(tilt){c.translate(ox,oy);c.rotate(tilt);c.translate(-ox,-oy);}
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#05010c');g.addColorStop(.55,P.deep);g.addColorStop(1,'#020005');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 dot(c,P.main,ox,oy,H*.5,.18+.2*charge);
 // trận pháp tím + tụ khí
 drawCircle(c,ox,gy,330,smooth(seg(sec,.45,.9)),t,P,dir);drawCircle(c,ox,gy,210,smooth(seg(sec,.7,1.1)),t,P,-dir);
 drawSkyBeams(c,ox,gy,smooth(charge)*(1-seg(sec,3,4))*.8,t,P);
 drawInflow(c,ox,oy,charge*(sec<VIP_BREAK?1:0),t,P,light,520);drawZoomLines(c,ox,oy,charge*.6*(sec<VIP_BREAK?1:0),t,P,light,H);
 // sét tím đánh vào châu từ 3 phía
 if(sec>1.1&&sec<VIP_BREAK)for(let i=0;i<3;i++){const s0=1.2+((i+V)%3)*.3,a=sec-s0>=0&&sec-s0<.22?1-(sec-s0)/.22:0;bolt(c,[60,840,450][i],[H*.12,H*.16,-40][i],ox,oy,a,P.main,V+i*17,12);}
 // châu + nứt
 if(sec<VIP_BREAK+.05){const s=230+30*smooth(charge)+Math.sin(t*.02)*6*seg(sec,1.6,VIP_BREAK);orbBig(c,r.orb,ox,oy+Math.sin(t*.003)*8,s,1,P.main);cracks(c,ox,oy,s*.45,9,seg(sec,1.7,VIP_BREAK),V%97);}
 // VỠ
 if(hitSec>=0&&!HS.frozen){drawBurst(c,ox,oy,bs,P,H,{light,pillar:true,scale:1.3,ground:gy,seed:V%7,reduceFlash:rf});pieces(c,ox,oy,seg(bs,0,1.2),P.main,V%50,light?10:18);
  spokes(c,ox,oy,10,560*out3(bs/.5),Math.exp(-bs*1.3),bs*.5*dir,P.main);shock(c,ox,gy,out3(bs/.6)*520,10,1-seg(bs,0,.6),P.soft);shock(c,ox,gy,out3(seg(bs,.12,.8))*700,6,1-seg(bs,.12,.8),P.main);}
 // tọa kỹ trồi lên trong cột sáng tím
 const up=ease(seg(sec,VIP_BREAK+.1,VIP_BREAK+1.1));
 if(up>0){const feet=gy+120-40*up;c.save();c.globalCompositeOperation='lighter';glow(c,ox,feet-200,360,P.main,.5*up);
  const w=170*(1-seg(sec,3.6,4.6)*.6),pg=c.createLinearGradient(ox-w,0,ox+w,0);pg.addColorStop(0,P.main+'00');pg.addColorStop(.5,'#ffffffaa');pg.addColorStop(1,P.main+'00');c.globalAlpha=.6*up*(1-seg(sec,4,5));c.fillStyle=pg;c.fillRect(ox-w,-100,w*2,feet+100);c.restore();c.globalAlpha=1;
  spokes(c,ox,feet-180,8,420,.25*up,t*.0004*dir,P.soft,10);
  mountBoth(c,r.id,ox,feet,2.6+.4*up,t,r.seed,light,up);}
 drawEmbers(c,H,seg(sec,2.5,3)*(1-seg(sec,4.8,5.4)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.4+.3*charge*(hitSec<0?1:0),ox,oy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,ox,oy,hitSec/.1,P,V%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-Math.min(1,bs/.35),16);
 drawCutInBand(scene,c,scene.playerIndex?.get(r.uid),H,seg(sec,.6,1.5),P,dir,t,{label:shortName(r.who)});
 drawLetterbox(c,H,seg(sec,.4,.8)*(1-seg(sec,4.6,5.2)));
 if(sec>=.8&&sec<VIP_BREAK){c.globalAlpha=seg(sec,.8,1.1);ctxt(c,shortName(r.who)+' mở '+(ORBS[r.orb]?.name||'Linh Châu'),450,H*.14,36,'#ecd4ff',{width:8,max:860});c.globalAlpha=1;}
 if(sec>=VIP_BREAK+.3){const u=sec-VIP_BREAK-.3,pop=1+.5*(1-ease(seg(u,0,.25)));c.save();c.translate(450,H*.13);c.scale(pop,pop);ctxt(c,'✦ TỌA KỸ VIP ✦',0,0,60,'#e6c8ff',{width:12,max:860});c.restore();
  namePlate(c,r,H,seg(u,.15,.45)*(1-seg(sec,5.1,5.5)),'#d9b0ff');}
 const o=seg(sec,5.25,5.6);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}

export function drawDivineCut(scene,c,t,H,r,sec){
 const P=PAL.divine,V=hsh(r.seed),dir=V&1?1:-1,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const gx=450+((V>>>3)%3-1)*40,gateY=H*.3,gy=H*.64; // cửa trời giữa khung trên (không cắt mép)
 let bi=-1;for(let i=0;i<DIVINE_BOOMS.length;i++)if(sec>=DIVINE_BOOMS[i])bi=i;const bSec=bi>=0?sec-DIVINE_BOOMS[bi]:-1,HS=hitStop(bSec,t,.08);t=HS.t;const bs=HS.sec;
 const rise=ease(seg(sec,.5,1.6)),orbY=H*.55-(H*.55-gateY-40)*ease(seg(sec,1.4,2.4));
 const zoom=motion?1+.06*smooth(seg(sec,.5,2.2))+.06*smooth(seg(sec,2.4,3.4))+(bi>=0?punch(bSec,.06+bi*.04):0)-.08*smooth(seg(sec,4.2,5.5)):1;
 const shake=!motion||HS.frozen?0:bi>=0&&bSec<.33?(1-bSec/.33)*(14+bi*9):sec>1.1&&sec<1.5?8:sec>2.4&&sec<3.4?3:0;
 const fy=sec<4.1?gateY+120:gy-200;fxCamera(c,gx,fy,zoom,shake,t);
 const tilt=motion?dir*.03*smooth(seg(sec,1.2,3.4))*(1-seg(sec,4.1,4.8)):0;if(tilt){c.translate(gx,fy);c.rotate(tilt);c.translate(-gx,-fy);}
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#060300');g.addColorStop(.5,sec<4.1?'#0d0703':P.deep);g.addColorStop(1,'#030200');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 // mây tầng
 for(let i=0;i<(light?8:16);i++){const x=((rn(i)*1100+t*.01*(i%2?1:-1))%1100+1100)%1100-100,y=H*(.06+rn(i+3)*.28);dot(c,i%3?'#3a2a14':'#5a4220',x,y,140+rn(i+7)*120,.45);}
 // châu vàng bay lên
 if(sec<3.2){orbBig(c,r.orb,gx,orbY+Math.sin(t*.003)*6,200*(1-.5*seg(sec,1.6,2.4)),rise*(1-seg(sec,2.6,3.2)),P.main);drawInflow(c,gx,orbY,seg(sec,.5,1.4)*(sec<2.4?1:0),t,P,light,420);}
 // THIÊN MÔN: khe sáng dọc mở ra + vết nứt trời
 const open=smooth(seg(sec,1.1,2.4))*(1-seg(sec,5.6,6.6)*.7),gw=10+open*230,gh=H*.46;
 if(open>0){c.save();c.globalCompositeOperation='lighter';const lg=c.createLinearGradient(gx-gw,0,gx+gw,0);lg.addColorStop(0,P.main+'00');lg.addColorStop(.3,P.main+'aa');lg.addColorStop(.5,'#ffffff');lg.addColorStop(.7,P.main+'aa');lg.addColorStop(1,P.main+'00');c.globalAlpha=open;c.fillStyle=lg;c.beginPath();c.moveTo(gx,gateY-gh/2);c.quadraticCurveTo(gx+gw,gateY,gx,gateY+gh/2);c.quadraticCurveTo(gx-gw,gateY,gx,gateY-gh/2);c.fill();
  c.strokeStyle='#fff1b8';c.lineWidth=3;for(let i=0;i<8;i++){const sd=V+i*13,side=i%2?1:-1,L=(120+rn(sd)*220)*open;c.globalAlpha=open*.8;c.beginPath();c.moveTo(gx,gateY+(rn(sd+1)-.5)*gh*.8);c.lineTo(gx+side*L*.5,gateY+(rn(sd+2)-.5)*gh);c.lineTo(gx+side*L,gateY+(rn(sd+3)-.5)*gh*1.1);c.stroke();}
  c.restore();c.globalAlpha=1;drawSkyBeams(c,gx,gy,open*.7*(1-seg(sec,6,7)),t,P);}
 drawCircle(c,gx,gy,360,smooth(seg(sec,.4,.9))*(1-seg(sec,6.4,7.2)),t,P,dir);drawCircle(c,gx,gy,240,smooth(seg(sec,.6,1.1)),t,P,-dir);
 // BÓNG tọa kỹ trong cửa trời
 const shA=smooth(seg(sec,2.4,2.9))*(sec<4.1?1:0);
 if(shA>0)mountShadow(c,r,gx,gateY+250,2.1+.5*smooth(seg(sec,2.4,4.1)),t,P.main,shA);
 // sấm vàng: mỗi cú bùng 1 tia từ trời
 for(let i=0;i<3;i++){const s0=DIVINE_BOOMS[(i+V)%3]-.04,a=sec>=s0&&sec<s0+.2?1-(sec-s0)/.2:0;bolt(c,gx+(i-1)*260,-40,gx+(i-1)*40,gateY+120,a,P.main,V+i*29,14);}
 if(bi>=0&&!HS.frozen){drawBurst(c,gx,gateY+150,bs,P,H,{light,pillar:bi===2,scale:.8+bi*.35,ground:gy,seed:V%7+bi,reduceFlash:rf});shock(c,gx,gateY+150,out3(bs/.5)*(360+bi*200),12,1-seg(bs,0,.5),bi===2?'#ffffff':P.main,.8);
  if(bi===2)pieces(c,gx,gateY+150,seg(bs,0,1.1),'#2a1a06',V%40,light?10:18);}
 // GIÁNG THẾ
 const down=ease(seg(sec,4.1,4.9));
 if(sec>=4.1){const feet=gateY+300+(gy+120-gateY-300)*down;
  c.save();c.globalCompositeOperation='lighter';const w=200*(1-seg(sec,5.6,6.8)*.6),pg=c.createLinearGradient(gx-w,0,gx+w,0);pg.addColorStop(0,P.main+'00');pg.addColorStop(.5,'#ffffffcc');pg.addColorStop(1,P.main+'00');c.globalAlpha=.7*(1-seg(sec,6,7));c.fillStyle=pg;c.fillRect(gx-w,-100,w*2,feet+100);
  glow(c,gx,feet-220,460,P.main,.55);c.restore();c.globalAlpha=1;
  spokes(c,gx,feet-220,16,600*ease(seg(sec,4.6,5.2)),.35,t*.0003*dir,P.soft,12);
  mountBoth(c,r.id,gx,feet,2.9,t,r.seed,light,1);
  const land=sec-4.9;if(land>=0){shock(c,gx,gy+110,out3(land/.6)*560,10,1-seg(land,0,.6),'#ffffff');shock(c,gx,gy+110,out3(seg(land,.12,.9))*780,6,1-seg(land,.12,.9),P.main);drawBurst(c,gx,gy+60,land,P,H,{light,pillar:false,scale:.9,ground:gy+110,seed:V%5,reduceFlash:rf});}}
 drawEmbers(c,H,seg(sec,4.6,5.1)*(1-seg(sec,6.8,7.4)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,sec<4.1?.5:.3,gx,fy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,gx,gateY+150,bSec/.08,P,(V+bi)%13);
 if(!HS.frozen&&bi>=0&&bSec<.3&&motion)drawGhostSplit(c,1-Math.min(1,bSec/.3),12+bi*6);
 drawCutInBand(scene,c,scene.playerIndex?.get(r.uid),H,seg(sec,2.5,3.35),P,dir,t,{label:shortName(r.who)});
 drawLetterbox(c,H,seg(sec,.4,.8)*(1-seg(sec,6.6,7.2)));
 if(sec>=.8&&sec<4.1){c.globalAlpha=seg(sec,.8,1.1)*(1-seg(sec,3.8,4.1));ctxt(c,sec<2.4?shortName(r.who)+' mở '+(ORBS[r.orb]?.name||'Linh Châu'):'THIÊN MÔN KHAI MỞ',450,H*.8,38,'#fff1b8',{width:8,max:860});c.globalAlpha=1;}
 if(sec>=4.6){const u=sec-4.6,pop=1+.55*(1-ease(seg(u,0,.25)));c.save();c.translate(450,H*.1);c.scale(pop,pop);const tg=c.createLinearGradient(0,-40,0,40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,'#ff9b2e');ctxt(c,'✦ THẦN TỌA KỸ ✦',0,0,66,tg,{width:13,max:860});c.restore();
  namePlate(c,r,H,seg(u,.2,.5)*(1-seg(sec,7,7.4)),'#ffd36b');}
 const o=seg(sec,7.25,7.6);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
