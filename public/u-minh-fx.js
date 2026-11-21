// 21/11/2026: U MINH MA ĐẾ — skin NAM ma đạo đen tím, 500 coin (skin + Vạn Hồn Phiên cùng lúc). Chủ game: "skin tu ma, đen tím chủ đạo".
// Ngôn ngữ hình riêng (không khuôn Tinh Hà/Nữ Oa): ánh sáng bị HÚT VÀO thay vì toả ra.
//  1 ma khí đặc sau lưng · 2 MA NHÃN: con mắt lớn trong khói trên đầu, cứ ~10 s MỞ ra liếc rồi khép ·
//  3 hào quang gai (ảnh) xoay ngược rất chậm + viền lửa tím chập chờn · 4 U MINH MÔN dưới chân: hố đen viền tím, hạt sáng bị XOÁY HÚT vào tâm ·
//  5 HẮC VIÊM: lưỡi lửa lõi đen viền tím liếm quanh chân (lửa đen, không phải lửa sáng) · 6 XÍCH U MINH: 2 sợi xích mắt xích thật
//  trồi từ hố xoắn quanh người (che khuất trước/sau) · 7 HỒN PHÁCH: đốm hồn tím có đuôi lượn quanh rồi bị HÚT VÀO cờ (cờ loé) ·
//  8 ma nhãn ngọc ở thắt lưng đập nhịp · 9 tàn tro tím bay lên · 10 VẠN HỒN PHIÊN (pháp bảo, gear → luôn hiện): cắm đất bên phải,
//  vải cờ bay phần phật (cắt dải ngang lệch sóng, cán đứng yên), hồn phách rỉ ra từ mép rách.
// Biến hình 9 s "VẠN HỒN QUY PHIÊN": trời sập tối, U Minh Môn mở → hồn từ khắp màn hình bị hút về → 6 sợi xích trồi lên đan thành
// LỒNG → ma nhãn khổng lồ mở trên trời, đồng tử co lại → lồng xích VỠ (mắt xích văng rơi) + vòng hắc viêm loang → hiện hình,
// Vạn Hồn Phiên TRỒI LÊN từ lòng đất (không rơi từ trời) rồi cắm xuống, sóng chấn.
// Gốc ở chân; đứng cao ~125, ngồi ~91. Texture dựng sẵn, không filter/shadowBlur. light=true: bỏ xích/mắt, ít lửa/hồn/hạt.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
export const UM_RING={x:.5,y:.5};
const HALO_Y=stand=>-64-stand*36;
const CHEST_Y=stand=>-28-stand*36;
const haloWidth=stand=>(58+stand*14)*1.18;
// Vạn Hồn Phiên: cán ở 14% bề ngang ảnh; vải từ 20% ngang, 10% dọc. Cắm đất bên phải.
const POLE_U=.14,CLOTH_U=.2,CLOTH_V=.1;
export const BANNER_POS=stand=>({x:50+(1-stand)*26,h:150-(1-stand)*30});
const art={};
const rng=seed=>{let s=seed%2147483647||7;return ()=>((s=s*16807%2147483647)-1)/2147483646;};

function surface(w,h,draw){const canvas=makeSurface(w,h);if(!canvas)return null;draw(canvas.getContext('2d'),w/2,h/2);return canvas;}
function radial(size,stops){return surface(size,size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});}
// 21/11 (chủ game: "màu đen phải nhiều hơn màu tím"): khói đặc + đen hơn, quầng tím trầm + nhạt hơn; ảnh skin/hào quang/cờ đã hạ tím (bản gốc ở data/backups/u-minh-orig-20261121).
const smokeArt=()=>art.smoke??=radial(128,[[0,'#000000f4'],[.45,'#05000ac0'],[.8,'#02000440'],[1,'#00000000']]);
const violetArt=()=>art.violet??=radial(128,[[0,'#d8b0ffc0'],[.3,'#7a30d070'],[.65,'#3a0a7a28'],[1,'#1a043800']]);
const coreArt=()=>art.core??=radial(64,[[0,'#ffffff'],[.3,'#e0b8ff'],[.7,'#9040ff60'],[1,'#6020c000']]);
const sparkArt=()=>art.spark??=surface(64,64,(c,r)=>{c.translate(r,r);
 for(const [w,h] of [[28,2.2],[2.2,28]]){const g=c.createRadialGradient(0,0,0,0,0,28);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#d8a8ffa0');g.addColorStop(1,'#9040ff00');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();});
// Lưỡi hắc viêm: viền tím sáng, lõi đen (vẽ thường, không cộng sáng → lửa ĐEN).
const flameArt=()=>art.flame??=surface(32,64,(c)=>{const tongue=(s,col)=>{c.beginPath();c.moveTo(16,62);c.bezierCurveTo(16-13*s,52,16-9*s,26,16+2*s,4+ (1-s)*20);c.bezierCurveTo(16+6*s,24,16+13*s,46,16,62);c.closePath();c.fillStyle=col;c.fill();};
 const g=c.createLinearGradient(0,64,0,0);g.addColorStop(0,'#9a50e0c0');g.addColorStop(.6,'#5a1aa090');g.addColorStop(1,'#40108000');tongue(1,g);
 const k=c.createLinearGradient(0,64,0,10);k.addColorStop(0,'#000000fa');k.addColorStop(.7,'#06000ef4');k.addColorStop(1,'#10031c00');tongue(.8,k);});
// Mắt xích (1 mắt dẹt nhìn thẳng): khung kim loại tối + vệt sáng tím.
const linkArt=()=>art.link??=surface(24,14,(c)=>{c.lineWidth=3;c.strokeStyle='#241c30';c.beginPath();c.ellipse(12,7,9.5,4.5,0,0,TAU);c.stroke();c.lineWidth=1;c.strokeStyle='#c8a0ffd0';c.beginPath();c.ellipse(12,6.4,9.5,4.3,0,Math.PI*1.1,Math.PI*1.9);c.stroke();});
const emberArt=()=>art.ember??=radial(16,[[0,'#ffffff'],[.3,'#d090ff'],[1,'#8020ff00']]);

function img(c,im,x,y,w,h,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function glow(c,im,x,y,w,h,alpha){if(!im||alpha<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function spin(c,im,x,y,size,angle,alpha,add=false){if(!im||alpha<=0)return;c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}

function miasma(c,t,cy,alpha,count=5){for(let i=0;i<count;i++){const a=t*.0002*(i%2?1:-1)+i*TAU/count,R=24+8*Math.sin(t*.0006+i),s=100+20*Math.sin(t*.0008+i*2);img(c,smokeArt(),Math.cos(a)*R-s/2,cy+Math.sin(a)*R*.6-s/2,s,s,alpha*.6);}}
// MA NHÃN: mắt hạnh nhân; open∈[0,1] mở mí; slit = độ hẹp đồng tử.
function demonEye(c,x,y,w,open,alpha,slit=1,look=0){if(open<=.02||alpha<=0)return;const h=w*.34*open;
 c.save();c.translate(x,y);c.globalAlpha*=alpha;
 const lid=()=>{c.beginPath();c.moveTo(-w/2,0);c.quadraticCurveTo(0,-h*1.15,w/2,0);c.quadraticCurveTo(0,h*1.15,-w/2,0);c.closePath();};
 glow(c,violetArt(),-w*.75,-w*.4,w*1.5,w*.8,.55);
 lid();c.fillStyle='#0c0016';c.fill();c.save();lid();c.clip();
 const ix=look*w*.14,g=c.createRadialGradient(ix,0,1,ix,0,w*.2);g.addColorStop(0,'#f8e0ff');g.addColorStop(.35,'#b050ff');g.addColorStop(1,'#3a0870');c.fillStyle=g;c.beginPath();c.arc(ix,0,w*.2,0,TAU);c.fill();
 // vân mống mắt + bóng mí trên (đỡ phẳng)
 c.strokeStyle='#e8c8ff70';c.lineWidth=Math.max(.5,w*.006);for(let i=0;i<18;i++){const a=i/18*TAU;c.beginPath();c.moveTo(ix+Math.cos(a)*w*.06,Math.sin(a)*w*.06);c.lineTo(ix+Math.cos(a)*w*.19,Math.sin(a)*w*.19);c.stroke();}
 const sh=c.createLinearGradient(0,-h,0,h*.2);sh.addColorStop(0,'#000000d0');sh.addColorStop(1,'#00000000');c.fillStyle=sh;c.fillRect(-w/2,-h*1.2,w,h*1.4);
 c.fillStyle='#000';c.beginPath();c.ellipse(ix,0,w*.025*slit+.6,w*.17,0,0,TAU);c.fill();c.restore();
 c.globalCompositeOperation='lighter';c.strokeStyle='#c080ff';c.lineWidth=Math.max(.8,w*.012);lid();c.stroke();c.restore();
 // khói che 2 khoé mắt → mắt mọc ra từ ma khí, không như hình dán
 for(const sx of [-1,1])img(c,smokeArt(),x+sx*w*.5-w*.35,y-w*.3,w*.7,w*.6,alpha*.95);}
// Nhịp mắt khi đứng yên: mở 2,6 s mỗi 10 s, liếc trái phải.
function eyeCycle(t){const m=t%10000;if(m<6800||m>9400)return {open:0,look:0};const u=(m-6800)/2600;return {open:Math.min(1,u/.15,(1-u)/.15),look:Math.sin(u*TAU)*.8};}
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;const k=1+pulse+(motion?Math.sin(t*.0019)*.014:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 img(c,smokeArt(),-w*.55,cy-w*.55,w*1.1,w*1.1,.3*alpha);
 c.save();c.translate(0,cy);c.rotate(motion?-t*.00005:0);img(c,a.halo,-w*UM_RING.x,-h*UM_RING.y,w,h,alpha);c.restore();
 glow(c,violetArt(),-w*.42,cy-w*.42,w*.84,w*.84,alpha*(motion?.08+.06*Math.sin(t*.011)*Math.sin(t*.0037):.1));
}
// U MINH MÔN: hố đen + viền tím + hạt sáng xoáy HÚT vào tâm.
function abyssGate(c,t,width,alpha,{motion=true,light=false}={}){
 if(alpha<=0)return;c.save();c.translate(0,22);c.scale(1,.28);
 img(c,smokeArt(),-width*.62,-width*.62,width*1.24,width*1.24,alpha);img(c,smokeArt(),-width*.4,-width*.4,width*.8,width*.8,alpha);
 c.globalCompositeOperation='lighter';c.lineCap='round';
 for(const [r,col,lw,sp] of [[.47,'#9a40ff',3,1],[.4,'#e0c0ff',1.2,-1.6]]){c.save();c.rotate(motion?t*.0004*sp:0);c.globalAlpha=alpha*.85;c.strokeStyle=col;c.lineWidth=lw;c.setLineDash([width*.18,width*.06]);c.beginPath();c.arc(0,0,width*r,0,TAU);c.stroke();c.restore();}
 c.restore();
 if(!motion)return;const n=light?8:18;
 for(let i=0;i<n;i++){const u=((t*.00035)+i/n)%1,ang=i*2.399+u*4.2,R=width*.55*(1-ease(u)),x=Math.cos(ang)*R,y=22+Math.sin(ang)*R*.28;glow(c,emberArt(),x-2,y-2,4,4,alpha*Math.sin(u*Math.PI)*1.2);}
}
// HẮC VIÊM quanh chân: lưỡi lửa đen sống–chết theo nhịp, xen trước/sau thân.
function blackFlames(c,t,layer,alpha,count=10,spread=40,scale=1){
 for(let i=0;i<count;i++){const ang=i/count*TAU+Math.sin(i*1.7)*.3,front=Math.sin(ang)>0;if(front!==(layer==='front'))continue;
  const per=1300+i*170,u=((t+i*397)%per)/per,life=Math.sin(u*Math.PI),x=Math.cos(ang)*spread,y=22+Math.sin(ang)*spread*.26,h=(18+(i%3)*8)*scale*(.5+.7*life),w=h*.5,sk=Math.sin(t*.006+i)*.2;
  glow(c,violetArt(),x-w,y-h*.8,w*2,h,alpha*life*.12);c.save();c.globalAlpha*=alpha*Math.min(1,life*1.6);c.translate(x,y);c.transform(1,0,sk,1,0,0);c.drawImage(flameArt(),-w/2,-h,w,h);c.restore();}
}
// XÍCH U MINH: mắt xích đặt dọc xoắn ốc; mắt chẵn nằm dẹt, mắt lẻ xoay cạnh (co ngang) → giống xích thật.
function chainHelix(c,t,stand,layer,alpha,ph=0,links=46){
 const top=HALO_Y(stand)+8,bot=24,front=layer==='front';
 for(let i=0;i<links;i++){const s=((i/links)+t*.00008)%1,a=s*TAU*2.2+t*.0007+ph,R=30+stand*3-s*4,x=Math.cos(a)*R,y=bot+(top-bot)*s+Math.sin(a)*R*.24,z=Math.sin(a);if((z>0)!==front)continue;
  const dx=-Math.sin(a)*R,dy=(top-bot)/(TAU*2.2)+Math.cos(a)*R*.24,ang=Math.atan2(dy,dx),edge=Math.min(1,s*8,(1-s)*6);
  c.save();c.globalAlpha*=alpha*edge*(front?1:.55);c.translate(x,y);c.rotate(ang);if(i%2)c.scale(1,.35);c.drawImage(linkArt(),-5.5,-3.2,11,6.4);c.restore();
  if(front&&i%7===0)glow(c,emberArt(),x-3,y-3,6,6,alpha*edge*.8);}
}
// HỒN PHÁCH: lượn quanh người (Lissajous) rồi bị hút vào vải cờ; trả về lực hút để cờ loé.
function wispPos(t,i,stand,bx,by){const P=6200+i*700,u=((t+i*1900)%P)/P;
 const wx=Math.sin(t*.0011*(1+i*.13)+i*2.1)*46,wy=CHEST_Y(stand)-10+Math.sin(t*.0017+i*1.3)*34;
 if(u<.72)return {x:wx,y:wy,a:Math.min(1,u*8),u};const k=ease((u-.72)/.28);return {x:wx+(bx-wx)*k,y:wy+(by-wy)*k,a:1-k*k,u};}
function wisps(c,t,stand,alpha,count=4,light=false){
 const B=BANNER_POS(stand),bx=B.x+B.h*.12,by=24-B.h*.6;let pull=0;
 for(let i=0;i<count;i++){for(let j=light?3:7;j>=0;j--){const p=wispPos(t-j*45,i,stand,bx,by),s=j?4.5*(1-j/9):6.5;glow(c,j?violetArt():coreArt(),p.x-s,p.y-s,2*s,2*s,alpha*p.a*(j?.7*(1-j/8):1));}
  const u=wispPos(t,i,stand,bx,by).u;if(u>.92)pull=Math.max(pull,(u-.92)/.08);}
 return pull;}
// 21/11: CỘT MA KHÍ ĐEN — cụm khói đen bốc từ chân lên quá đầu sau lưng (vẽ thường → đen thật, không cộng sáng).
function blackPlume(c,t,stand,alpha,count=9){const top=HALO_Y(stand)-70;
 for(let i=0;i<count;i++){const u=((t*.00018)+i/count)%1,x=Math.sin(i*2.1+u*4+t*.0004)*(22+u*30),y=20+(top-20)*u,s=40+u*70,a=alpha*Math.sin(u*Math.PI)**.7;img(c,smokeArt(),x-s/2,y-s/2,s,s,a*.75);}}
// Sương đen bò sát đất phía trước chân (che mép dưới áo → người như đứng trong ma vụ).
function groundFog(c,t,alpha,count=6){for(let i=0;i<count;i++){const u=((t*.00012)+i/count)%1,x=(u-.5)*150*(i%2?1:-1),s=46+Math.sin(u*Math.PI)*24;
 c.save();c.translate(x,24);c.scale(1,.38);img(c,smokeArt(),-s/2,-s/2,s,s,alpha*Math.sin(u*Math.PI)*.8);c.restore();}}
function embers(c,t,count,width,height,alpha){for(let i=0;i<count;i++){const u=(i*.618+t*.00022)%1,x=Math.sin(i*2.4+u*5)*width*(.5+.5*((i*.37)%1)),y=20-u*height,a=Math.sin(u*Math.PI)*alpha;glow(c,emberArt(),x-1.6,y-1.6,3.2,3.2,a);}}
// VẠN HỒN PHIÊN: cán đứng yên; vải cắt dải ngang, lệch sóng (đuôi bay nhiều hơn phần gần thanh ngang).
function banner(c,a,t,stand,{alpha=1,motion=true,rise=0,light=false,pull=0}={}){
 const im=a?.blade;if(!im||alpha<=0)return;const B=BANNER_POS(stand),iw=im.naturalWidth,ih=im.naturalHeight,h=B.h,w=h*iw/ih,left=B.x-w*POLE_U,top=24-h+rise;
 c.save();c.globalAlpha*=alpha;
 if(rise>0){c.beginPath();c.rect(-400,-600,800,624);c.clip();}
 const cut=iw*CLOTH_U,clothTop=ih*CLOTH_V;
 c.drawImage(im,0,0,cut,ih,left,top,w*CLOTH_U,h); // cán + phần trái
 c.drawImage(im,cut,0,iw-cut,clothTop,left+w*CLOTH_U,top,w*(1-CLOTH_U),h*CLOTH_V); // thanh ngang
 const rows=light?8:22,rh=(ih-clothTop)/rows,dh=h*(1-CLOTH_V)/rows;
 for(let r=0;r<rows;r++){const v=(r+.5)/rows,off=motion?(Math.sin(v*5-t*.004)*4+Math.sin(v*9-t*.007)*1.6)*v:0;
  c.drawImage(im,cut,clothTop+r*rh,iw-cut,rh+1,left+w*CLOTH_U+off,top+h*CLOTH_V+r*dh,w*(1-CLOTH_U),dh+.6);}
 c.restore();
 const cx=left+w*.6,cy=top+h*.45;glow(c,violetArt(),cx-w*.6,cy-h*.3,w*1.2,h*.6,alpha*(.05+.45*pull));
 if(motion&&!rise){const u=(t*.0005)%1;glow(c,violetArt(),cx+Math.sin(u*6)*6-4,top+h*.85-u*h*.5-4,8,8,alpha*Math.sin(u*Math.PI)*.8);}
}

export function drawUMinhAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,hy=HALO_Y(stand);
 if(layer==='back'){
  img(c,smokeArt(),-105,hy-90,210,240,.95);
  if(motion){blackPlume(c,time,stand,1,light?5:9);miasma(c,time,hy+20,light?.6:1,light?3:5);
   if(!light){const e=eyeCycle(time+seed);demonEye(c,0,hy-62,64,e.open,.95,1,e.look);chainHelix(c,time,stand,'back',1,0);chainHelix(c,time,stand,'back',.9,Math.PI);}
   blackFlames(c,time,'back',1,light?6:12,40);}
 }else if(motion){
  groundFog(c,time,1,light?3:6);
  blackFlames(c,time,'front',1,light?6:12,40);
  if(!light){chainHelix(c,time,stand,'front',1,0);chainHelix(c,time,stand,'front',.9,Math.PI);}
  wisps(c,time,stand,1,light?2:4,light);
  const y=CHEST_Y(stand)+6,p=.7+.3*Math.sin(time*.005);glow(c,violetArt(),-9*p,y-7*p,18*p,14*p,.7);glow(c,coreArt(),-2.5,y-2,5,4,.9);
  embers(c,time,light?6:16,46,120+stand*30,1);
 }
}
// Gear (luôn hiện): U Minh Môn · hào quang gai · Vạn Hồn Phiên.
export function drawUMinhGear(c,a,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0;
 if(layer==='back'){abyssGate(c,time,108+stand*8,.9,{motion,light});haloLayer(c,a,time,HALO_Y(stand),haloWidth(stand),{motion,alpha:.95});}
 else{const pull=motion?wispPull(time,stand):0;banner(c,a,time,stand,{motion,light,pull});}
}
const wispPull=(t,stand)=>{let pull=0;for(let i=0;i<4;i++){const P=6200+i*700,u=((t+i*1900)%P)/P;if(u>.92)pull=Math.max(pull,(u-.92)/.08);}return pull;};

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// 6 sợi xích đan LỒNG: từ đất (xi,24) cong ra ngoài rồi chụm lên đỉnh; grow = phần đã trồi.
function cage(c,t,stand,grow,alpha,break_=0,seed=0,light=false){
 const top=HALO_Y(stand)-26,n=light?4:6,links=light?14:22,r=rng(seed+17);
 for(let k=0;k<n;k++){const xi=(k/(n-1)-.5)*96,bulge=xi*.35;
  for(let i=0;i<links;i++){const s=i/links;if(s>grow)break;const x=xi*(1-s)+bulge*Math.sin(s*Math.PI),y=24+(top-24)*s+Math.sin(s*Math.PI)*6,dx=-xi+bulge*Math.PI*Math.cos(s*Math.PI),dy=top-24,ang=Math.atan2(dy,dx);
   let px=x,py=y,rot=ang;if(break_>0){const vx=(x/50+(r()-.5))*120,vy=-60-r()*80,tt=break_*1.4;px=x+vx*tt;py=y+vy*tt+260*tt*tt;rot=ang+(r()-.5)*12*tt;}else{r();r();r();}
   c.save();c.globalAlpha*=alpha*(1-break_);c.translate(px,py);c.rotate(rot);if(i%2)c.scale(1,.35);c.drawImage(linkArt(),-7,-4,14,8);c.restore();}
  if(!break_)glow(c,violetArt(),xi*(1-grow)+bulge*Math.sin(grow*Math.PI)-6,24+(top-24)*grow-6,12,12,alpha);}
}
// Màn biến hình 9 s (reveal ≈ .45) "VẠN HỒN QUY PHIÊN".
export function drawUMinhReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand),cy=CHEST_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.12),outro)*(k<reveal?.82:.82-.4*after);img(c,smokeArt(),-520,-620,1040,960,veil);
  if(k<reveal){
   abyssGate(c,clock*(1+charge*3),30+90*ease(charge/.5),ease(charge/.25),{motion,light});
   // ma nhãn khổng lồ mở trên trời, đồng tử co dần
   const eo=clamp((charge-.5)/.2),es=1-clamp((charge-.82)/.15)*.8;if(eo>0)demonEye(c,0,hy-110,120,ease(eo),.88,es,Math.sin(clock*.002)*.3);
  }else{
   const shut=1-clamp(after/.12);if(shut>0)demonEye(c,0,hy-110,120,shut,.88,.2,0);
   drawUMinhAura(c,clock,stand,'back',{motion,light,seed:s});
   abyssGate(c,clock,108+stand*8,.9,{motion,light});haloLayer(c,a,clock,hy,haloWidth(stand),{motion,alpha:ease(after/.15),pulse:after<.2?.18*(1-after/.2):0});
  }
 }else{
  if(k<reveal){
   // hồn từ khắp màn bị hút về tâm hố
   const n=light?10:28;for(let i=0;i<n;i++){const u=((i/n)+clock*.0004)%1,ang=i*2.399+dir*u*2.5,R=(1-ease(u))*260+6,x=Math.cos(ang)*R,y=cy+Math.sin(ang)*R*.7,a1=Math.min(1,charge*3)*Math.sin(u*Math.PI);
    glow(c,i%3?violetArt():coreArt(),x-5,y-5,10,10,a1);}
   cage(c,clock,stand,ease(clamp((charge-.2)/.45)),1,0,s,light);
   const core=clamp((charge-.7)/.3);glow(c,violetArt(),-40*core,cy-40*core,80*core,80*core,core);glow(c,coreArt(),-10*core,cy-10*core,20*core,20*core,core);
  }else{
   const flash=1-clamp(after/.06);if(flash>0)glow(c,violetArt(),-150,cy-150,300,300,flash*1.2);
   if(after<.5)cage(c,clock,stand,1,1,clamp(after/.5),s,light);
   // vòng hắc viêm loang
   const ring=clamp(after/.35);if(ring<1){const n=light?10:22;for(let i=0;i<n;i++){const ang=i/n*TAU,R=20+ease(ring)*170,x=Math.cos(ang)*R,y=22+Math.sin(ang)*R*.28,h=26*(1-ring)+6,w=h*.5;
     c.save();c.globalAlpha=1-ring;c.translate(x,y);c.drawImage(flameArt(),-w/2,-h,w,h);c.restore();}}
   // Vạn Hồn Phiên TRỒI lên từ lòng đất rồi cắm xuống + sóng chấn
   const up=ease(clamp((after-.12)/.3)),B=BANNER_POS(stand);
   if(up<1)banner(c,a,clock,stand,{motion,light,rise:(1-up)*B.h});
   else{drawUMinhGear(c,a,clock,{stand},'front',{motion,light});const sh=clamp((after-.42)/.25);if(sh<1){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-sh)*.85;c.strokeStyle='#c080ff';c.lineWidth=2*(1-sh)+.4;c.beginPath();c.ellipse(B.x,24,8+sh*80,3+sh*20,0,0,TAU);c.stroke();c.restore();}}
   if(up>0&&up<1)for(let j=0;j<6;j++){const u=((clock*.002)+j/6)%1;img(c,smokeArt(),B.x-14+Math.sin(j*2)*10,24-u*30-14,28,28,(1-u)*.8);}
   drawUMinhAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
