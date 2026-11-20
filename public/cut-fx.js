// 18/11/2026: lớp VFX cho MÀN CHIẾU RIÊNG (Lôi Đài, Đua phi kiếm, Luận Kiếm) — chủ game chê "sơ sài", bảo học màn đột phá.
// Học từ qi-impact.js: TỤ KHÍ (hạt xoáy vào + trận pháp dưới chân + cột sáng trời rọi + hào quang bốc) → NÉN (lõi phình + vệt lóe ngang)
// → NỔ (chớp, cột sáng, tia tỏa, tia lửa có trọng lực, 2 vòng xung kích, vết nứt đất) → DƯ ÂM (bụi sáng).
// Glow = sprite vẽ sẵn + 'lighter' (rẻ GPU); hạt tính theo thời gian + chỉ số (không Math.random); light → giảm nửa số hạt.
import {makeSurface} from './performance.js';
import {drawDebris} from './impact-debris.js?v=20261120';
const TAU=Math.PI*2;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(k,a,b)=>clamp((k-a)/(b-a)),out3=k=>1-(1-clamp(k))**3,smooth=k=>{k=clamp(k);return k*k*(3-2*k);};
const rnd=i=>{const x=Math.sin(i*91.7+17.3)*43758.5453;return x-Math.floor(x);};
const SPR=new Map();
function spr(col){let f=SPR.get(col);if(f!==undefined)return f;f=makeSurface(64,64);if(f){const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.2,col);g.addColorStop(.5,col+'55');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(0,0,64,64);}SPR.set(col,f);return f;}
export function dot(c,col,x,y,r,a){const im=spr(col);if(!im||a<=.004||r<=0)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-r,y-r,r*2,r*2);}

// Bảng màu: main (màu chiêu), soft (sáng), gold (điểm nhấn).
export const PALETTES=Object.freeze({
 gold:{main:'#ffb52e',soft:'#fff1b8',gold:'#ffffff',deep:'#1a0f02'},
 crimson:{main:'#ff4a3d',soft:'#ffc2a8',gold:'#ffd36b',deep:'#1a0406'},
 azure:{main:'#3fb4ff',soft:'#c8f1ff',gold:'#fff3c4',deep:'#03101f'},
 violet:{main:'#b45cff',soft:'#ecd4ff',gold:'#ffe28a',deep:'#0e0420'},
 jade:{main:'#35f0b0',soft:'#c8ffe9',gold:'#fff0a8',deep:'#02140f'},
});
export const palOf=(main,soft,deep)=>({main:main||'#ffb52e',soft:soft||'#fff1b8',gold:'#ffe7a8',deep:deep||'#05060c'});
/** Biến thể mỗi lần chiếu (chống "reproduced content"): lật, hướng xoay, kiểu chiêu. */
export function fxVariant(seed){const h=Math.abs(Math.imul((seed|0)^0x9e3779b1,2654435761))>>>0;return {flip:!!(h&1),spin:h&2?1:-1,style:(h>>>2)%3,pal:['gold','crimson','azure','violet','jade'][(h>>>4)%5],tilt:((h>>>7)%5-2)*.02};}

/** Camera: đẩy chậm vào lúc tụ khí, giật ra ở cú nổ. Gọi c.restore() sau. */
export function fxCamera(c,cx,cy,zoom,shake,t){c.save();if(shake)c.translate(Math.sin(t*.091)*shake,Math.cos(t*.113)*shake*.7);c.translate(cx,cy);c.scale(zoom,zoom);c.translate(-cx,-cy);}
export const punch=(sec,amp=.07)=>sec<0?0:Math.exp(-sec*9)*amp;

/** Trận pháp dưới chân: 3 vòng xoay ngược nhau, phù văn, lục mang tinh. */
export function drawCircle(c,x,y,R,a,t,P,spin=1){if(a<=.01)return;
 c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.scale(1,.36);
 const g=c.createRadialGradient(0,0,0,0,0,R*1.05);g.addColorStop(0,P.main+'55');g.addColorStop(.7,P.main+'18');g.addColorStop(1,P.main+'00');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(0,0,R*1.05,0,TAU);c.fill();
 c.rotate(t*.0009*spin);c.strokeStyle=P.main;c.lineWidth=5;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle=P.soft;c.beginPath();c.arc(0,0,R*.9,0,TAU);c.stroke();
 for(let i=0;i<24;i++){c.save();c.rotate(i*TAU/24);c.fillStyle=i%3?P.main:P.soft;c.fillRect(R*.91,-3,R*.08,6);if(i%2===0){c.beginPath();c.arc(R*.955,0,4,0,TAU);c.fill();}c.restore();}
 c.rotate(-t*.0021*spin);c.strokeStyle=P.soft;c.lineWidth=3;for(let j=0;j<2;j++){c.beginPath();for(let i=0;i<=3;i++){const an=j*Math.PI/3+i*TAU/3;i?c.lineTo(Math.cos(an)*R*.72,Math.sin(an)*R*.72):c.moveTo(Math.cos(an)*R*.72,Math.sin(an)*R*.72);}c.stroke();}
 c.lineWidth=3;c.strokeStyle=P.main;c.beginPath();c.arc(0,0,R*.42,0,TAU);c.stroke();
 c.rotate(t*.003*spin);for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.fillStyle=P.gold;c.beginPath();c.moveTo(R*.44,0);c.lineTo(R*.6,-9);c.lineTo(R*.6,9);c.fill();c.restore();}
 c.restore();c.globalAlpha=1;}

/** Hạt linh khí xoáy vào (x,y) có đuôi. level 0..1. */
export function drawInflow(c,x,y,level,t,P,light,R=440){if(level<=.01)return;
 const n=light?30:72,clock=t*.001;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const sp=.5+(i%5)*.12,u=(clock*sp*.55+i*.618)%1,Rr=R*(.75+rnd(i)*.5),an=i*2.399+u*2.6;
  const r=Rr*(1-u)**1.4,px=x+Math.cos(an)*r,py=y+Math.sin(an)*r*.66,fade=Math.sin(u*Math.PI)*level,col=i%7===0?P.gold:i%3?P.main:P.soft;
  const u2=Math.max(0,u-.06),r2=Rr*(1-u2)**1.4,an2=i*2.399+u2*2.6;c.globalAlpha=fade*.5;c.strokeStyle=col;c.lineWidth=1.5+(i%3);c.beginPath();c.moveTo(x+Math.cos(an2)*r2,y+Math.sin(an2)*r2*.66);c.lineTo(px,py);c.stroke();
  dot(c,col,px,py,4+(i%4)*2+u*5,fade);}
 c.restore();c.globalAlpha=1;}

/** Cột sáng trời rọi xuống (x,feet). */
export function drawSkyBeams(c,x,feet,a,t,P){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const top=x+(i-1)*170+Math.sin(t*.0012+i)*20,w=60+(i%2)*60,g=c.createLinearGradient(0,0,0,feet);g.addColorStop(0,P.main+'00');g.addColorStop(.4,P.main+'40');g.addColorStop(.9,P.soft+'55');g.addColorStop(1,P.main+'00');
  c.globalAlpha=a*(i===1?1:.55);c.fillStyle=g;c.beginPath();c.moveTo(top-w*.3,0);c.lineTo(top+w*.3,0);c.lineTo(x+(i-1)*50+w,feet);c.lineTo(x+(i-1)*50-w,feet);c.closePath();c.fill();}
 c.restore();c.globalAlpha=1;}

/** Hào quang lửa khí bốc quanh thân (vẽ SAU lưng nhân vật). */
export function drawAura(c,x,feet,h,w,a,t,P,light){if(a<=.01)return;const n=light?14:30,clock=t*.001;c.save();c.globalCompositeOperation='lighter';
 dot(c,P.main,x,feet-h*.5,h*.62,a*.45);
 for(let i=0;i<n;i++){const u=(clock*(.55+(i%4)*.1)+i*.37)%1,side=(i%2?1:-1)*(w*.25+rnd(i)*w*.55)*(1-u*.55),px=x+side+Math.sin(u*7+i)*12,py=feet-u*h*(1+(i%3)*.12);
  dot(c,i%5?P.main:P.soft,px,py,(14+(1-u)*22)*(1+(i%3)*.2),a*Math.sin(u*Math.PI)*.6);}
 c.restore();c.globalAlpha=1;}

/** Nén khí: lõi phình + vệt lóe ngang + sao 4 cánh. u 0..1. */
export function drawCompress(c,x,y,u,t,P){if(u<=.01)return;c.save();c.globalCompositeOperation='lighter';
 dot(c,P.soft,x,y,30+u*110,.6+u*.4);dot(c,'#ffffff',x,y,12+u*40,u);
 const w=60+u*520,g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,P.main+'00');g.addColorStop(.5,'#ffffff');g.addColorStop(1,P.main+'00');c.globalAlpha=u*.9;c.fillStyle=g;c.fillRect(x-w,y-2-u*3,w*2,4+u*6);
 c.translate(x,y);c.rotate(t*.002);c.fillStyle='#ffffff';for(let i=0;i<4;i++){c.rotate(TAU/4);c.globalAlpha=u*.8;c.beginPath();c.moveTo(0,-7);c.lineTo(70+u*90,0);c.lineTo(0,7);c.fill();}
 c.restore();c.globalAlpha=1;}

/** CÚ NỔ (sec = giây từ lúc nổ): chớp, cột sáng, tia tỏa, tia lửa rơi, 2 vòng xung kích, vết nứt đất. */
export function drawBurst(c,x,y,sec,P,H,{light=false,pillar=true,flash=true,scale=1,ground=null,seed=1,reduceFlash=false}={}){
 if(sec<0||sec>1.6)return;c.save();c.globalCompositeOperation='lighter';
 if(pillar){const pl=Math.exp(-sec*2)*smooth(sec/.05);if(pl>.01){const w=(40+120*out3(sec/.25))*scale*(.4+.6*pl),g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,P.main+'00');g.addColorStop(.32,P.main+'99');g.addColorStop(.5,'#ffffff');g.addColorStop(.68,P.main+'99');g.addColorStop(1,P.main+'00');c.fillStyle=g;c.globalAlpha=pl;c.fillRect(x-w,-60,w*2,y+60);for(let j=0;j<8;j++){c.globalAlpha=pl*(1-(j+1)/9);c.fillRect(x-w,y+j*14,w*2,14);}}}
 const rays=Math.exp(-sec*2.4);if(rays>.02){for(let i=0;i<18;i++){const an=i*TAU/18+sec*.3+(i%2)*.08+seed,len=(320+(i*53)%260)*scale*(.45+.55*out3(sec/.3)),w=i%2?.03:.055,g=c.createLinearGradient(x,y,x+Math.cos(an)*len,y+Math.sin(an)*len);g.addColorStop(0,'#ffffff');g.addColorStop(.3,P.soft);g.addColorStop(1,P.main+'00');c.globalAlpha=rays*(i%2?.4:.7);c.fillStyle=g;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(an-w)*len,y+Math.sin(an-w)*len);c.lineTo(x+Math.cos(an+w)*len,y+Math.sin(an+w)*len);c.closePath();c.fill();}}
 dot(c,'#ffffff',x,y,(60+200*out3(sec/.2))*scale,Math.exp(-sec*4));dot(c,P.main,x,y,(140+300*out3(sec/.3))*scale,Math.exp(-sec*2.2)*.8);
 const n=light?40:96;c.lineCap='round';for(let i=0;i<n;i++){const an=i*2.399+seed,v=(460+(i*71)%620)*scale,drag=(1-Math.exp(-sec*2.4))/2.4,px=x+Math.cos(an)*v*drag,py=y+Math.sin(an)*v*drag*.8+140*sec*sec,life=1-sec/(1+(i%5)*.12);if(life<=0)continue;
  const tl=Math.exp(-sec*2.4)*.04;c.globalAlpha=life*.8;c.strokeStyle=i%4?P.main:P.gold;c.lineWidth=i%3?1.5:2.5;c.beginPath();c.moveTo(px-Math.cos(an)*v*tl,py-Math.sin(an)*v*tl*.8);c.lineTo(px,py);c.stroke();dot(c,i%3?P.soft:P.gold,px,py,3+(i%4)*1.5,life);}
 for(let j=0;j<3;j++){const u=out3((sec-j*.07)/.75);if(u<=0||u>=1)continue;const r=(50+u*680)*scale;c.globalAlpha=(1-u)*.85;c.strokeStyle=j===1?P.gold:j?P.main:'#ffffff';c.lineWidth=(2+7*(1-u))*scale;c.beginPath();c.ellipse(x,ground??y,r,r*(ground!=null?.3:.62),0,0,TAU);c.stroke();}
 if(ground!=null){const cr=Math.exp(-sec*1.2)*smooth(sec/.06);if(cr>.02){c.strokeStyle=P.soft;c.lineWidth=3;c.globalAlpha=cr;for(let i=0;i<9;i++){let an=i*TAU/9+rnd(seed+i)*.4,px=x,py=ground;c.beginPath();c.moveTo(px,py);const L=(140+rnd(i+seed*3)*200)*scale*out3(sec/.12);for(let s=1;s<=5;s++){const d=L*s/5,jt=(rnd(i*7+s+seed)-.5)*.6;px=x+Math.cos(an+jt)*d;py=ground+Math.sin(an+jt)*d*.3;c.lineTo(px,py);}c.stroke();}}}
 c.restore();c.globalAlpha=1;
 drawDebris(c,x,y,sec,{floor:ground??y+210*scale,seed:seed*3.7+1,power:light?1.4:2.4,color:P.main,hot:P.gold||'#ffffff',scale:scale*1.5,light,flash:false}); // 20/11: mảnh vỡ văng + nảy quanh chỗ nổ
 const fl=Math.exp(-sec*10)*smooth(sec/.02);if(flash&&!reduceFlash&&fl>.01){c.save();c.globalAlpha=fl*.5;c.fillStyle=P.soft;c.fillRect(-100,-100,1100,H+200);c.restore();}}

/** Sóng năng lượng từ (x0,y0) tới (x1,y1); u = đầu sóng đã đi (0..1), fade = tắt dần. */
export function drawBeam(c,x0,y0,x1,y1,u,fade,t,P,light,W=90){if(u<=0||fade<=.01)return;
 const hx=x0+(x1-x0)*u,hy=y0+(y1-y0)*u,dx=hx-x0,dy=hy-y0,L=Math.hypot(dx,dy)||1,an=Math.atan2(dy,dx),pul=1+.08*Math.sin(t*.03);
 c.save();c.globalCompositeOperation='lighter';c.translate(x0,y0);c.rotate(an);c.lineCap='round';
 // thân sóng thuôn (hẹp ở tay, phình ở đầu sóng), viền gợn theo thời gian — không còn là thanh trắng phẳng
 const body=(w,col,a)=>{c.globalAlpha=a*fade;c.fillStyle=col;c.beginPath();c.moveTo(0,-w*.12);for(let i=1;i<=24;i++){const u2=i/24,px=L*u2;c.lineTo(px,-w*(.12+.88*u2**.7)*(1+.12*Math.sin(px*.05-t*.03)));}for(let i=24;i>=1;i--){const u2=i/24,px=L*u2;c.lineTo(px,w*(.12+.88*u2**.7)*(1+.12*Math.sin(px*.047-t*.034+1.7)));}c.lineTo(0,w*.12);c.closePath();c.fill();};
 body(W*1.1*pul,P.main,.22);body(W*.72*pul,P.main,.38);body(W*.42,P.soft,.55);body(W*.16,'#ffffff',.85);
 for(let s=0;s<2;s++){c.globalAlpha=.75*fade;c.strokeStyle=s?P.gold:P.soft;c.lineWidth=3;c.beginPath();for(let i=0;i<=40;i++){const px=L*i/40,py=Math.sin(px*.03-t*.025+s*Math.PI)*W*.75*(.25+.75*i/40);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
 // vòng năng lượng chạy dọc thân sóng
 c.lineWidth=3;for(let i=0;i<5;i++){const v=((t*.0018+i/5)%1),px=L*v,r=W*(.2+.8*v**.7);c.globalAlpha=fade*.7*Math.sin(v*Math.PI);c.strokeStyle=i%2?P.soft:P.main;c.beginPath();c.ellipse(px,0,r*.22,r,0,0,TAU);c.stroke();}
 // tia sét quấn quanh
 c.lineWidth=2.5;c.strokeStyle='#ffffff';for(let b=0;b<(light?1:3);b++){let s=(Math.floor(t/60)*31+b*97)>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5;c.globalAlpha=fade*.8;c.beginPath();c.moveTo(0,0);for(let i=1;i<=12;i++){const px=L*i/12;c.lineTo(px,r()*W*1.4*(i/12));}c.stroke();}
 const n=light?14:32;for(let i=0;i<n;i++){const v=((t*.0012+rnd(i))%1),px=L*(1-v),py=(rnd(i+3)-.5)*W*1.6*(1+v);dot(c,i%3?P.main:P.soft,px,py,5+rnd(i+5)*8,fade*(1-v)*.9);}
 c.restore();
 c.save();c.globalCompositeOperation='lighter';dot(c,P.main,hx,hy,W*2.6*pul,fade*.75);dot(c,'#ffffff',hx,hy,W*1.1*pul,fade);
 c.translate(hx,hy);c.rotate(t*.004);c.fillStyle=P.soft;for(let i=0;i<6;i++){c.rotate(TAU/6);c.globalAlpha=fade*.7;c.beginPath();c.moveTo(0,-8);c.lineTo(W*1.8,0);c.lineTo(0,8);c.fill();}
 c.restore();c.globalAlpha=1;}

/** Thiên giáng: kiếm/thương sáng rơi từ trời cắm xuống quanh (x,ground). u 0..1 tiến độ. */
export function drawSkyLances(c,x,ground,u,t,P,light,seed=1,from=-200){if(u<=0)return;const n=light?8:14;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const st=i/n*.7,k=seg(u,st,st+.2);if(k<=0)continue;const px=x+(rnd(seed+i)-.5)*460,land=ground+(rnd(seed+i*3)-.5)*60,tilt=(rnd(i+seed*2)-.5)*.25;
  const fall=out3(k),py=from+(land-from)*fall,len=320+rnd(i)*160,tx=px-Math.sin(tilt)*len,ty=py-Math.cos(tilt)*len,al=1-seg(u,st+.45,st+.7);
  dot(c,P.main,px,py,46,al*.8);
  const g=c.createLinearGradient(tx,ty,px,py);g.addColorStop(0,P.main+'00');g.addColorStop(.6,P.main+'cc');g.addColorStop(1,'#ffffff');c.globalAlpha=al;c.strokeStyle=g;c.lineWidth=26;c.beginPath();c.moveTo(tx,ty);c.lineTo(px,py);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=7;c.stroke();
  if(fall>=1){const s=(u-st-.22)*4;dot(c,P.soft,px,land,40+s*80,Math.max(0,.9-s));c.globalAlpha=Math.max(0,.8-s);c.strokeStyle=P.main;c.lineWidth=3;c.beginPath();c.ellipse(px,land,30+s*140,(30+s*140)*.3,0,0,TAU);c.stroke();}}
 c.restore();c.globalAlpha=1;}

/** Vạch tốc độ tỏa từ tâm (kiểu anime). */
export function drawZoomLines(c,cx,cy,a,t,P,light,H){if(a<=.01)return;const n=light?30:64;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<n;i++){const an=rnd(i)*TAU,sp=(t*.0022*(1+rnd(i+4))+rnd(i+9))%1,r0=220+sp*900,r1=r0+120+rnd(i+2)*380;c.globalAlpha=a*.55*Math.sin(sp*Math.PI);c.strokeStyle=i%4?'#ffffff':P.main;c.lineWidth=1.5+rnd(i+6)*3.5;c.beginPath();c.moveTo(cx+Math.cos(an)*r0,cy+Math.sin(an)*r0);c.lineTo(cx+Math.cos(an)*r1,cy+Math.sin(an)*r1);c.stroke();}
 c.restore();c.globalAlpha=1;}

/** Bụi sáng trôi lên (dư âm). */
export function drawEmbers(c,H,a,t,P,light){if(a<=.01)return;const n=light?20:46;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const u=(t*.00018*(1+rnd(i)*.8)+rnd(i+1))%1,px=rnd(i+2)*900+Math.sin(t*.0013+i)*18,py=H*(1.05-u*1.1),tw=.5+.5*Math.sin(t*.006+i*1.7);dot(c,i%5?P.main:P.gold,px,py,2.5+(i%3)*1.5,a*(.3+.6*tw)*Math.sin(u*Math.PI));}
 c.restore();c.globalAlpha=1;}

/** Viền tối dồn mắt vào tâm. */
export function drawVignette(c,H,a,cx=450,cy){if(a<=.01)return;const g=c.createRadialGradient(cx,cy??H*.55,H*.18,cx,cy??H*.55,H*.78);g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000');c.save();c.globalAlpha=clamp(a);c.fillStyle=g;c.fillRect(-100,-100,1100,H+200);c.restore();}

// ---- 18/11 (chủ game: "nghiên cứu cho cinematic xíu") — ngôn ngữ điện ảnh / anime ----
// Thanh đen điện ảnh trên/dưới (a 0..1).
export function drawLetterbox(c,H,a,h=.085){if(a<=.001)return;const b=H*h*smooth(a);c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(-100,-100,1100,100+b);c.fillRect(-100,H-b,1100,b+100);c.restore();}
// Khung IMPACT kiểu anime (1–3 khung khi trúng): đảo màu cả màn (difference) + vạch tỏa đen/màu chiêu. u 0..1 trong khung.
export function drawImpactFrame(c,H,x,y,u,P,seed=1){if(u<=0||u>=1)return;c.save();c.globalAlpha=1;
 c.globalCompositeOperation='difference';c.fillStyle='#ffffff';c.fillRect(-100,-100,1100,H+200);
 c.globalCompositeOperation='source-over';c.fillStyle=u<.5?'#000000':P.main;
 for(let i=0;i<40;i++){const an=rnd(seed*13+i)*TAU,w=.012+rnd(i+seed)*.03,r0=90+rnd(i*5+seed)*120;c.globalAlpha=.85;c.beginPath();c.moveTo(x+Math.cos(an)*r0,y+Math.sin(an)*r0);c.lineTo(x+Math.cos(an-w)*1600,y+Math.sin(an-w)*1600);c.lineTo(x+Math.cos(an+w)*1600,y+Math.sin(an+w)*1600);c.closePath();c.fill();}
 c.restore();c.globalAlpha=1;}
// Nhòe tách hình (giả quang sai): chép lại chính khung hình lệch ngang, cộng sáng. a 0..1.
export function drawGhostSplit(c,a,dx=14){if(a<=.02||!c.canvas)return;const cv=c.canvas;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='lighter';c.globalAlpha=.16*a;try{c.drawImage(cv,dx*a,0);c.drawImage(cv,-dx*a,0);}catch{}c.restore();}
// Hit-stop: đóng băng thời gian ngay sau cú trúng. Trả về {sec,t} đã trừ khoảng đứng hình.
export function hitStop(sec,t,stop=.1){if(sec<0)return {sec,t,frozen:false};if(sec<stop)return {sec:.001,t:t-sec*1000,frozen:true};return {sec:sec-stop+.001,t:t-stop*1000,frozen:false};}
