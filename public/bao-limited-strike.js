// 20/11/2026 (chủ game: "thêm hiệu ứng cho thần khí GIỚI HẠN lúc đánh tháp, lôi đài, đánh quái… ở đâu cũng dùng được").
// ĐÒN THẦN KHÍ GIỚI HẠN — 1 module dùng chung, mỗi món MỘT cơ chế riêng (~1,4 s), vẽ bằng chính ảnh pháp bảo + nét vẽ tay:
//   drawLimitedStrike(c,id,from,to,k,t,seed,{light})  — canvas bất kỳ (sân, Lôi Đài, Yêu thú, Chính Ma…), k = 0→1.
//   playLimitedStrikeIn(el,id,opts)                   — gắn canvas tạm lên 1 khối HTML (Tháp…) và tự chạy rồi tự gỡ.
// Nhịp: 0–.25 TRIỆU BẢO (thần khí hiện trên đầu người dùng + vòng sáng + tên chiêu) → .25–.7 CƠ CHẾ RIÊNG bay tới mục tiêu
//       → .7–1 TRÚNG (nổ theo món) rồi tan. Màu lấy từ BAO_ULTS (chiêu chiếu riêng) để hai nơi nhất quán.
// Hiệu năng: không shadowBlur/filter; ≤60 hạt; 'light' (máy yếu/sân đông) bớt một nửa.
import {BAO_ULTS} from './bao-ults.js';
import {baoItem,baoArt} from './phap-bao-data.js';
export const LIMITED_STRIKE_MS=1400;
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(k,a,b)=>clamp((k-a)/(b-a)),out3=k=>1-(1-clamp(k))**3,inQ=k=>clamp(k)**2;
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const imgs=new Map();
export function limitedArt(id){if(typeof Image==='undefined')return null;let im=imgs.get(id);if(!im){im=new Image();im.decoding='async';im.src=baoArt(id);imgs.set(id,im);}return im.complete&&im.naturalWidth?im:null;}
export const isLimited=id=>baoItem(id)?.tier===6;
const glow=(c,x,y,r,col,a)=>{if(a<=.01||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=1;};
function art(c,id,x,y,s,a,spin=0){const im=limitedArt(id);if(!im||a<=.01)return;c.save();c.globalAlpha=a;c.translate(x,y);if(spin)c.rotate(spin);c.drawImage(im,-s/2,-s/2,s,s);c.restore();}
function ring(c,x,y,r,col,a,w=3,flat=1){if(a<=.01)return;c.save();c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,r*flat,0,0,TAU);c.stroke();c.restore();}
function label(c,s,x,y,col,a,maxX=900){if(a<=.01)return;c.save();c.globalAlpha=a;c.font='900 18px "Segoe UI",Arial,sans-serif';const hw=c.measureText(s).width/2+10;x=Math.max(hw,Math.min(maxX-hw,x)); /* không tràn mép màn */c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#120a14';c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);c.restore();}
function bolt(c,x0,y0,x1,y1,seed,col,a,w=3){if(a<=.01)return;c.save();c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);for(let i=1;i<8;i++){const u=i/8;c.lineTo(x0+(x1-x0)*u+(rn(seed+i)-.5)*40,y0+(y1-y0)*u);}c.lineTo(x1,y1);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=w*.4;c.stroke();c.restore();}
function sparks(c,x,y,R,u,col,seed,n){if(u<=0||u>=1)return;for(let i=0;i<n;i++){const q=rn(seed+i)*TAU,d=R*(.3+rn(seed+i*3)*.9)*out3(u);glow(c,x+Math.cos(q)*d,y+Math.sin(q)*d*.8,4+rn(i)*5,col,(1-u)*.9);}}

// Cơ chế riêng từng món: (c,P,A,B,u,k,t,seed,L) — u = tiến độ pha cơ chế (0→1), k = toàn đòn; A người dùng, B mục tiêu.
const MECH={
 'L01-tru-tien'(c,P,A,B,u,k,t,s,L){ // 4 thần kiếm xếp tứ phương quanh mục tiêu rồi cùng đâm xuống
  for(let i=0;i<4;i++){const q=i*TAU/4+Math.PI/4,r=110*(1-inQ(seg(u,.55,1))),x=B.x+Math.cos(q)*r,y=B.y-60+Math.sin(q)*r*.5-120*(1-out3(seg(u,0,.4)));
   c.save();c.translate(x,y);c.rotate(Math.atan2(B.y-60-y,B.x-x)+Math.PI/2);c.globalCompositeOperation='lighter';c.fillStyle=P.main;c.globalAlpha=.9;c.beginPath();c.moveTo(0,-70);c.lineTo(10,16);c.lineTo(0,30);c.lineTo(-10,16);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-2.5,-58,5,62);c.restore();}
  ring(c,B.x,B.y,90*(1-u*.4),P.main,.6*u,2.5,.32);},
 'L02-hon-don-chung'(c,P,A,B,u){const y=B.y-260+200*inQ(u),s=120;art(c,'L02-hon-don-chung',B.x,y-40,s,1);for(let i=0;i<3;i++)ring(c,B.x,B.y-30,40+((u*3+i/3)%1)*120,P.main,.5*(1-((u*3+i/3)%1)),3,.45);},
 'L03-luan-hoi-kinh'(c,P,A,B,u,k,t,s){for(let i=0;i<5;i++){const q=i*TAU/5+t*.002,r=140*(1-out3(u)),x=B.x+Math.cos(q)*r,y=B.y-70+Math.sin(q)*r*.6;c.save();c.globalCompositeOperation='lighter';art(c,'L03-luan-hoi-kinh',x,y,74,.7);c.restore();}glow(c,B.x,B.y-70,60*u,P.soft,.6*u);},
 'L04-thai-cuc-do'(c,P,A,B,u,k,t){c.save();c.translate(B.x,B.y);c.scale(1,.38);c.rotate(t*.006);const R=120*out3(seg(u,0,.5));c.globalAlpha=.8;c.fillStyle='#fafafa';c.beginPath();c.arc(0,0,R,-Math.PI/2,Math.PI/2);c.fill();c.fillStyle='#0b0b0b';c.beginPath();c.arc(0,0,R,Math.PI/2,Math.PI*1.5);c.fill();
  c.fillStyle='#fafafa';c.beginPath();c.arc(0,R/2,R/2,0,TAU);c.fill();c.fillStyle='#0b0b0b';c.beginPath();c.arc(0,-R/2,R/2,0,TAU);c.fill();c.restore();},
 'L05-huyen-hoa-dinh'(c,P,A,B,u,k,t,s,L){art(c,'L05-huyen-hoa-dinh',B.x,B.y-230,90,out3(seg(u,0,.3)));c.save();c.globalCompositeOperation='lighter';const n=L?14:28;for(let i=0;i<n;i++){const v=(u*1.6+i/n)%1;glow(c,B.x+(rn(s+i)-.5)*60*v,B.y-200+190*v,10+14*v,P.main,(1-v)*.8*seg(u,.2,.4));}c.restore();},
 'L06-can-khon-dai'(c,P,A,B,u,k,t,s,L){art(c,'L06-can-khon-dai',B.x,B.y-150,120,1,Math.sin(t*.01)*.2);c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(L?16:32);i++){const q=rn(s+i)*TAU+t*.004,r=170*(1-((u*1.4+rn(i))%1));glow(c,B.x+Math.cos(q)*r,B.y-150+Math.sin(q)*r*.6,12,P.main,.85);}c.restore();},
 'L07-phong-than-bang'(c,P,A,B,u,k,t,s){const w=220*out3(seg(u,0,.4));c.save();c.globalAlpha=.92;c.fillStyle='#f6e7b8';c.fillRect(B.x-w/2,B.y-260,w,46);c.strokeStyle=P.main;c.lineWidth=3;c.strokeRect(B.x-w/2,B.y-260,w,46);c.restore();
  if(w>150)label(c,'封神',B.x,B.y-237,'#b3261e',1);if(u>.5)for(let i=0;i<3;i++)bolt(c,B.x+(i-1)*60,B.y-214,B.x+(i-1)*14,B.y-40,s+i*7+Math.floor(t/60),P.main,1-seg(u,.5,1)*.5,4);},
 'L08-dinh-hai-cham'(c,P,A,B,u){const drop=inQ(seg(u,.2,.75)),y=B.y-360+300*drop;c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(B.x-14,0,B.x+14,0);g.addColorStop(0,P.main+'00');g.addColorStop(.5,P.soft);g.addColorStop(1,P.main+'00');c.fillStyle=g;c.fillRect(B.x-14,y-240,28,240);c.restore();
  if(u>.75){const v=seg(u,.75,1);for(let i=0;i<3;i++)ring(c,B.x,B.y,40+v*150+i*24,P.main,(1-v)*.8,4,.3);}},
 'L09-that-bao-thu'(c,P,A,B,u){const cols=['#ff4d4d','#ff9a3d','#ffe14d','#5dff7a','#4dc3ff','#6b6bff','#c46bff'];c.save();c.lineCap='round';for(let i=0;i<7;i++){c.globalAlpha=.85;c.strokeStyle=cols[i];c.lineWidth=7;const a0=-2.6+i*.12,sweep=2.2*out3(u);c.beginPath();c.arc(B.x,B.y-60,110+i*9,a0,a0+sweep);c.stroke();}c.restore();},
 'L10-hong-mong-binh'(c,P,A,B,u,k,t,s,L){art(c,'L10-hong-mong-binh',A.x+50,A.y-170,70,1-seg(u,.8,1));c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(L?18:36);i++){const v=(u*1.3+i/(L?18:36))%1,x=A.x+50+(B.x-A.x-50)*v+Math.sin(v*12+i)*30,y=A.y-170+(B.y-70-(A.y-170))*v+Math.cos(v*9+i)*20;glow(c,x,y,9,P.main,.7*(1-v*.3));}c.restore();},
 'L11-loi-than-chuy'(c,P,A,B,u,k,t,s){const sw=out3(seg(u,.3,.75)),ang=-1.9+2.3*sw;c.save();c.translate(B.x-80,B.y-200);c.rotate(ang);art(c,'L11-loi-than-chuy',0,-70,100,1);c.restore();if(u>.7)for(let i=0;i<4;i++)bolt(c,B.x,B.y-250,B.x+(rn(s+i)-.5)*160,B.y-10,s+i*11+Math.floor(t/50),P.soft,1-seg(u,.7,1)*.6,3);},
 'L12-huyet-hai-dao'(c,P,A,B,u){c.save();c.globalCompositeOperation='lighter';const a=out3(seg(u,.2,.7));c.strokeStyle=P.main;c.lineCap='round';for(let i=0;i<3;i++){c.globalAlpha=.9-i*.25;c.lineWidth=16-i*4;c.beginPath();c.arc(B.x,B.y-80,140+i*14,-2.4,-2.4+2.6*a);c.stroke();}c.restore();
  if(u>.6){c.save();c.fillStyle='#8a0014';c.globalAlpha=.5*(1-seg(u,.6,1));c.beginPath();c.ellipse(B.x,B.y,200*seg(u,.6,1),40*seg(u,.6,1),0,0,TAU);c.fill();c.restore();}},
};
/** Vẽ 1 đòn tại tiến độ k (0→1). from/to: {x,y} (y = chân). */
export function drawLimitedStrike(c,id,from,to,k,t,seed=1,{light=false,scale=1}={}){if(!isLimited(id)||k<=0||k>=1)return;
 // scale: cỡ nhân vật nơi vẽ (Lôi Đài ~2, sân ~1–1,5) — vẽ trong hệ đã chia tỷ lệ để khoảng cách “trên đầu” khớp người
 const S=Math.max(.5,scale||1),U=BAO_ULTS[id]||{main:'#ff8fd0',soft:'#ffe0f2'},P={main:U.main,soft:U.soft},A={x:from.x/S,y:from.y/S},B={x:to.x/S,y:to.y/S},fade=1-seg(k,.85,1),name=(U.move||baoItem(id)?.name||'').split(' · ')[0];
 c.save();c.scale(S,S);
 // TRIỆU BẢO: thần khí trên đầu người dùng, vòng ấn, tên chiêu
 const sum=out3(seg(k,0,.22))*(1-seg(k,.3,.45));if(sum>0){c.save();c.globalCompositeOperation='lighter';glow(c,A.x,A.y-160,120,P.main,.6*sum);c.restore();ring(c,A.x,A.y-160,70+24*sum,P.soft,.85*sum,3,1);art(c,id,A.x,A.y-160-14*sum,112*(.6+.4*sum),sum);label(c,'GIỚI HẠN · '+name,A.x,A.y-240,P.soft,sum,900/S);}
 // CƠ CHẾ RIÊNG
 const u=seg(k,.25,.85);if(u>0&&MECH[id]){c.globalAlpha=fade;MECH[id](c,P,A,B,u,k,t,seed,light);c.globalAlpha=1;}
 // TRÚNG
 const hit=seg(k,.7,1);if(hit>0&&hit<1){c.save();c.globalCompositeOperation='lighter';glow(c,B.x,B.y-60,170*out3(hit),P.main,.75*(1-hit));glow(c,B.x,B.y-60,70,'#ffffff',.6*(1-hit)*(hit<.3?1:0));sparks(c,B.x,B.y-60,190,hit,P.soft,seed,light?14:28);c.restore();ring(c,B.x,B.y,60+170*out3(hit),P.main,.7*(1-hit),4,.32);}
 c.restore();}

/** HTML: chạy 1 đòn trên khối `el` (canvas tạm phủ lên, tự gỡ). from/to theo tỷ lệ khối (0..1). */
export function playLimitedStrikeIn(el,id,{from={x:.5,y:.95},to={x:.5,y:.55},seed=1,light=false,size=2}={}){if(!el||!isLimited(id)||typeof document==='undefined')return;
 const box=el.getBoundingClientRect?.();if(!box||!box.width)return;const W=380,H=Math.max(240,Math.round(W*box.height/box.width));
 const cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;cv.className='bao-lim-strike';Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'5'});
 if(getComputedStyle(el).position==='static')el.style.position='relative';el.appendChild(cv);const c=cv.getContext('2d'),t0=performance.now();limitedArt(id);
 const scale=W/900,A={x:from.x*900,y:from.y*H/scale},B={x:to.x*900,y:to.y*H/scale};
 const step=now=>{const k=(now-t0)/LIMITED_STRIKE_MS;c.setTransform(2*scale,0,0,2*scale,0,0);c.clearRect(0,0,900,H/scale);if(k>=1){cv.remove();return;}drawLimitedStrike(c,id,A,B,k,now,seed,{light,scale:size});requestAnimationFrame(step);};
 requestAnimationFrame(step);}
