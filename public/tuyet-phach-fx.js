// 20/11/2026: TUYẾT PHÁCH TIÊN HẬU (skin NỮ băng tuyết, 500 coin) — chủ game: "làm skin nữ mới" (tự sáng tạo, khác Nguyệt Liên/Xích Vũ/Bích Lân).
// Cơ chế RIÊNG theo VFX-SKIN-CAO-CAP.md (≥8 lớp):
//  1 sương băng chàm cuộn sau lưng · 2 tia lam băng xoay ngược · 3 hào quang tuyết (ảnh) xoay chậm + tinh thể rơi từ vành ·
//  4 vòng phù văn LỤC GIÁC quay ngược · 5 BĂNG TRÌ dưới chân: mặt băng + hào quang nằm ngửa + TINH THỂ BĂNG mọc lên rồi vỡ ·
//  6 tuyết rơi + khí lạnh bốc · 7 băng châu ở ngực đập nhịp · 8 PHƯỢNG BĂNG bay vòng quanh người, ĐẬP CÁNH (cắt ảnh dải dọc,
//  đầu cánh lệch nhiều hơn thân) — PHÁP BẢO/LINH VẬT → vẽ ở lớp GEAR (luôn hiện; bài học Bích Lân) · 9 bông tuyết 6 cánh lấp lánh ·
//  10 Thiên Sương Phiến lơ lửng: ánh lạnh dọc nan quạt + lông vũ băng rơi.
// Gốc ở chân; đứng cao ~125, ngồi ~91. Texture dựng sẵn, không filter/shadowBlur. light=true bỏ tia/vòng/tinh thể, giảm hạt + dải phượng.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
export const TP_RING={x:.5,y:.5};
const HALO_Y=stand=>-64-stand*34; // đo trên ảnh Codex: đầu đứng ~-98, ngồi ~-64
const CHEST_Y=stand=>-26-stand*38; // ngực (ngồi thấp hơn Bích Lân vì ảnh ngồi có tà áo rộng)
const haloWidth=stand=>(58+stand*14)*1.14;
const art={};

function surface(w,h,draw){const canvas=makeSurface(w,h);if(!canvas)return null;draw(canvas.getContext('2d'),w/2,h/2);return canvas;}
function radial(size,stops){return surface(size,size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});}
const mistArt=()=>art.mist??=surface(200,200,(c,r)=>{
 const blob=(x,y,rad,col)=>{const g=c.createRadialGradient(x,y,1,x,y,rad);g.addColorStop(0,col);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,200,200);};
 blob(r,r,r,'#020818a0');blob(r-30,r-18,70,'#0a2a5070');blob(r+34,r+14,62,'#14305a66');blob(r+4,r-44,50,'#2a1a5050');blob(r,r,r*.55,'#03081a80');});
const lightArt=()=>art.light??=radial(128,[[0,'#ffffffff'],[.2,'#f0fbffcc'],[.55,'#a8e4ff50'],[1,'#ffffff00']]);
const iceArt=()=>art.ice??=radial(128,[[0,'#e8f8ffe0'],[.35,'#7fd4ff80'],[.7,'#2a8ad028'],[1,'#0a50a000']]);
const lilacArt=()=>art.lilac??=radial(96,[[0,'#e8dcffb0'],[.4,'#a99bff50'],[1,'#5a4ab000']]);
const smokeArt=()=>art.smoke??=radial(96,[[0,'#04102ac8'],[.45,'#0a204a70'],[1,'#00000000']]);
const raysArt=()=>art.rays??=surface(320,320,(c,r)=>{c.translate(r,r);
 for(let i=0;i<18;i++){const a=i/18*TAU,len=r*(i%2?.66:1),w=i%3?.05:.09,g=c.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);
  g.addColorStop(0,'#f0fbffc8');g.addColorStop(.35,i%2?'#7fd4ff58':'#cfeeff70');g.addColorStop(1,'#2a8ad000');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,len,a-w,a+w);c.closePath();c.fill();}});
// Bông tuyết 6 cánh (vẽ nét mềm có nhánh) + lõi sáng.
const flakeArt=()=>art.flake??=surface(64,64,(c,r)=>{c.translate(r,r);c.lineCap='round';
 for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);const g=c.createLinearGradient(0,0,0,-28);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#a8e4ff00');c.strokeStyle=g;c.lineWidth=2.4;c.beginPath();c.moveTo(0,0);c.lineTo(0,-27);c.stroke();
  c.lineWidth=1.6;for(const y of [-11,-19]){c.beginPath();c.moveTo(0,y);c.lineTo(-6,y-6);c.moveTo(0,y);c.lineTo(6,y-6);c.stroke();}c.restore();}
 const g=c.createRadialGradient(0,0,0,0,0,8);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,8,0,TAU);c.fill();});
const sparkArt=()=>art.spark??=surface(64,64,(c,r)=>{c.translate(r,r);
 for(const [w,h] of [[28,2.2],[2.2,28]]){const g=c.createRadialGradient(0,0,0,0,0,28);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#cfeeffa0');g.addColorStop(1,'#7fd4ff00');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();});
// Vòng phù văn lục giác: 2 lục giác lồng + vạch chia + 6 bông tuyết nhỏ ở đỉnh.
const runeArt=()=>art.rune??=surface(256,256,(c,r)=>{c.translate(r,r);c.lineCap='round';c.lineJoin='round';
 const hex=(rad,color,w,rot=0)=>{c.beginPath();for(let i=0;i<=6;i++){const a=rot+i*TAU/6;c[i?'lineTo':'moveTo'](Math.cos(a)*rad,Math.sin(a)*rad);}c.strokeStyle=color;c.lineWidth=w;c.stroke();};
 c.beginPath();c.arc(0,0,122,0,TAU);c.strokeStyle='#03081a80';c.lineWidth=5;c.stroke();c.beginPath();c.arc(0,0,122,0,TAU);c.strokeStyle='#dff4ff';c.lineWidth=1.4;c.stroke();
 for(let i=0;i<72;i++){const a=i/72*TAU,r1=i%6?117:109;c.beginPath();c.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);c.lineTo(Math.cos(a)*121,Math.sin(a)*121);c.strokeStyle='#cfeeff90';c.lineWidth=i%6?.8:1.6;c.stroke();}
 hex(104,'#7fd4ffb0',1.4);hex(104,'#c8b8ffa0',1,Math.PI/6);hex(84,'#e8f8ff80',1);
 for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);c.translate(0,-104);c.drawImage(flakeArt(),-9,-9,18,18);c.restore();}});
// Tinh thể băng (lăng trụ nhọn, mặt sáng + mặt tối).
const crystalArt=()=>art.crystal??=surface(32,96,(c)=>{const g=c.createLinearGradient(0,0,32,0);g.addColorStop(0,'#bfe9ffd0');g.addColorStop(.5,'#ffffffee');g.addColorStop(.52,'#6fb8e8c0');g.addColorStop(1,'#2a6aa890');c.fillStyle=g;
 c.beginPath();c.moveTo(16,2);c.lineTo(30,26);c.lineTo(26,94);c.lineTo(6,94);c.lineTo(2,26);c.closePath();c.fill();c.strokeStyle='#ffffffb0';c.lineWidth=1;c.stroke();});
// Lông vũ băng (rơi khỏi quạt / phượng).
const featherArt=()=>art.feather??=surface(24,48,(c)=>{const g=c.createLinearGradient(12,0,12,48);g.addColorStop(0,'#ffffffee');g.addColorStop(1,'#7fd4ff40');c.fillStyle=g;
 c.beginPath();c.moveTo(12,2);c.bezierCurveTo(22,14,22,32,12,46);c.bezierCurveTo(2,32,2,14,12,2);c.fill();c.strokeStyle='#ffffffc0';c.lineWidth=.8;c.beginPath();c.moveTo(12,4);c.lineTo(12,44);c.stroke();});
const pillarArt=()=>art.pillar??=(()=>{const canvas=makeSurface(32,256);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,256,0,0);g.addColorStop(0,'#dff4ffd0');g.addColorStop(.4,'#7fd4ff50');g.addColorStop(1,'#ffffff00');
 const h=c.createLinearGradient(0,0,32,0);h.addColorStop(0,'#ffffff00');h.addColorStop(.5,'#ffffffff');h.addColorStop(1,'#ffffff00');
 c.fillStyle=g;c.fillRect(0,0,32,256);c.globalCompositeOperation='destination-in';c.fillStyle=h;c.fillRect(0,0,32,256);return canvas;})();

function img(c,im,x,y,w,h,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function glow(c,im,x,y,w,h,alpha){if(!im||alpha<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function spin(c,im,x,y,size,angle,alpha,add=false){if(!im||alpha<=0)return;c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}

function iceRays(c,t,cy,size,alpha){spin(c,raysArt(),0,cy,size,t*.0001,alpha*.45,true);spin(c,raysArt(),0,cy,size*.78,-t*.00016+.4,alpha*.32,true);}
// Sương băng cuộn: cụm khói tối trôi vòng chậm sau lưng.
function frostMist(c,t,cy,alpha,count=5){for(let i=0;i<count;i++){const a=t*.00025*(i%2?1:-1)+i*TAU/count,R=26+8*Math.sin(t*.0007+i),s=96+18*Math.sin(t*.0009+i*2);img(c,smokeArt(),Math.cos(a)*R-s/2,cy+Math.sin(a)*R*.6-s/2,s,s,alpha*.55);}}
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;const k=1+pulse+(motion?Math.sin(t*.0017)*.015:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 glow(c,iceArt(),-w*.62,cy-w*.62,w*1.24,w*1.24,(.36+(motion?Math.sin(t*.0023)*.08:0))*alpha);
 c.save();c.translate(0,cy);c.rotate(motion?t*.00006:0);img(c,a.halo,-w*TP_RING.x,-h*TP_RING.y,w,h,alpha);c.restore();
 if(motion){for(let i=0;i<3;i++){const u=((t*.0004)+i/3)%1,ang=i*2.1+t*.0003,x=Math.cos(ang)*w*.46,y=cy+Math.sin(ang)*w*.46+u*w*.5;spin(c,flakeArt(),x,y,5+(1-u)*3,u*3,alpha*(1-u)*.85,true);}}
}
function runeRing(c,t,cy,width,alpha){spin(c,runeArt(),0,cy,width*.7,-t*.00028,alpha*.85);}
// BĂNG TRÌ: mặt băng phẳng + hào quang nằm ngửa + tinh thể băng mọc lên rồi vỡ thành mảnh.
function frostPool(c,a,t,width,alpha,motion=true,light=false){
 if(alpha<=0)return;c.save();c.translate(0,22);c.scale(1,.26);
 img(c,mistArt(),-width*.7,-width*.7,width*1.4,width*1.4,alpha*.8);
 glow(c,iceArt(),-width*.7,-width*.7,width*1.4,width*1.4,alpha*.6);
 if(a?.halo){const w=width,h=w*a.halo.naturalHeight/a.halo.naturalWidth;c.save();c.rotate(motion?t*.00016:0);img(c,a.halo,-w*TP_RING.x,-h*TP_RING.y,w,h,alpha*.78);c.restore();}
 if(!light)spin(c,runeArt(),0,0,width*1.18,motion?-t*.00024:0,alpha*.6);
 c.restore();
 if(!motion||light)return;
 for(let i=0;i<6;i++){const per=2300+i*310,u=((t+i*733)%per)/per,bx=Math.sin(i*2.7+.4)*width*.42,by=22+Math.cos(i*1.9)*width*.07,s=.7+(i%3)*.25;
  if(u<.62){const g=ease(u/.25),h=26*s*g,w=8*s;img(c,crystalArt(),bx-w/2,by-h,w,h,alpha*.9);glow(c,iceArt(),bx-8,by-h-6,16,16,alpha*g*.5);}
  else{const k=(u-.62)/.38;for(let j=0;j<4;j++){const ang=j*1.6+i,d=k*14;glow(c,lightArt(),bx+Math.cos(ang)*d-2,by-10-Math.abs(Math.sin(ang))*d-2,4,4,alpha*(1-k)*.9);}
   c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha*(1-k)*.7;c.strokeStyle='#cfeeff';c.lineWidth=1.1;c.beginPath();c.ellipse(bx,by,5+k*12,1.6+k*3.4,0,0,TAU);c.stroke();c.restore();}}
}
// Khí lạnh bốc lên (tối + sáng ghép đôi).
function coldRise(c,t,count,spread,height,alpha){
 for(let i=0;i<count;i++){const u=(i/count+t*.00032)%1,side=((i*7)%count/count-.5)*2,x=side*spread*(1-u*.4)+Math.sin(u*5+i)*6,y=20-u*height,s=10+u*24;img(c,smokeArt(),x-s/2,y-s/2,s,s,alpha*Math.sin(u*Math.PI)*.5);}
 for(let i=0;i<count;i++){const u=(i/count+.5/count+t*.00045)%1,side=((i*5)%count/count-.5)*2,x=side*spread*.8*(1-u*.5)+Math.sin(u*7+i*2)*4,y=20-u*height*.85,s=7+(1-u)*9;glow(c,i%4===3?lilacArt():i%3?iceArt():lightArt(),x-s/2,y-s*.9,s,s*1.8,alpha*Math.sin(u*Math.PI)*.5);}}
function pillars(c,t,count,spread,alpha){for(let i=0;i<count;i++){const ph=(t*.0005+i*.37)%1,x=Math.sin(i*2.1+1)*spread,h=55+35*Math.sin(i*1.7+t*.001),a=Math.sin(ph*Math.PI);glow(c,pillarArt(),x-3,20-h,6,h,alpha*a*.42);}}
function chestCore(c,t,stand,alpha){const y=CHEST_Y(stand),p=.75+.25*Math.sin(t*.0045);glow(c,iceArt(),-20*p,y-20*p,40*p,40*p,alpha*.8);glow(c,lilacArt(),-10*p,y-10*p,20*p,20*p,alpha*.3);spin(c,flakeArt(),0,y,12+8*p,t*.0012,alpha*.7,true);}
// PHƯỢNG BĂNG: cắt ảnh thành dải dọc; dải lệch theo nhịp vỗ, đầu cánh (xa giữa ảnh) lệch nhiều hơn thân → đập cánh thật.
export function frostPhoenix(c,a,t,cx,cy,width,{alpha=1,beat=9,strips=24,flip=1,speed=1,tilt=0}={}){
 const im=a?.phoenix;if(!im||alpha<=0)return;const iw=im.naturalWidth,ih=im.naturalHeight,h=width*ih/iw,sw=iw/strips,dw=width/strips,ph=Math.sin(t*.009*speed);
 c.save();c.translate(cx,cy);c.rotate(tilt);c.scale(flip,1);c.globalAlpha*=alpha;
 for(let i=0;i<strips;i++){const u=(i+.5)/strips,wing=Math.abs(u-.5)*2,off=-ph*beat*wing*wing;c.drawImage(im,i*sw,0,sw+1,ih,-width/2+i*dw,-h/2+off,dw+.7,h);}
 c.restore();
}
// Quỹ đạo phượng bay vòng quanh người (elip nghiêng): sau lưng ở nửa trên, vòng ra trước ở nửa dưới. → {x,y,front,dir}
function phoenixOrbit(t,stand,speed=1){const q=t*.00042*speed,x=Math.cos(q)*62,y=HALO_Y(stand)+28+Math.sin(q)*36/* vòng ra trước thấp ngang eo → không che mặt */,dir=Math.sin(q)>0?-1:1;return {x,y,front:Math.sin(q)>.35,dir,q};}
function phoenixWithTrail(c,a,t,stand,layer,{alpha=1,light=false}={}){
 const o=phoenixOrbit(t,stand);if(o.front!==(layer==='front'))return;
 for(let j=1;j<(light?4:9);j++){const p=phoenixOrbit(t-j*55,stand);glow(c,j%2?iceArt():lightArt(),p.x-6,p.y-6,12,12,alpha*(1-j/9)*.55);if(!light&&j%3===0)spin(c,flakeArt(),p.x,p.y+4,5,j,alpha*(1-j/9)*.7,true);}
 frostPhoenix(c,a,t,o.x,o.y,58+stand*10,{alpha:alpha*.95,beat:light?5:9,strips:light?8:24,flip:o.dir,tilt:Math.cos(o.q)*.12});
}
function snowfall(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const u=(i*.618+(t+seed)*.00012)%1,x=Math.sin(i*2.399+u*3)*width*(.4+.6*((i*.37)%1))+Math.sin(t*.001+i)*6,y=-height+u*(height+20),a=Math.sin(u*Math.PI)*alpha,s=3+(i%3)*1.5;
  if(a<.03)continue;spin(c,flakeArt(),x,y,s,t*.0006+i,a*.9,true);}}
function sparkles(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const cyc=(t*.0005+i*.618+seed)%1,tw=Math.sin(cyc*Math.PI);if(tw<.05)continue;
  const x=Math.sin(i*12.9898+Math.floor(t*.0005+i*.618+seed)*3.1)*width,y=-10-((i*.37+Math.floor(t*.0005+i*.618+seed)*.53)%1)*height,s=4+tw*(i%3?5:9);spin(c,sparkArt(),x,y,s,i,alpha*tw,true);}}

export function drawTuyetPhachAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,breathe=motion?Math.sin((time+seed)*.0021):0,hy=HALO_Y(stand);
 if(layer==='back'){
  img(c,mistArt(),-90,hy-60,180,190,.72+breathe*.05);
  if(motion)frostMist(c,time,hy+20,light?.6:1,light?3:5);
  if(!light)iceRays(c,time,hy,200+stand*30,.8+breathe*.1);
  if(motion){coldRise(c,time,light?5:12,34,88+stand*24,1);if(!light)pillars(c,time,4,40,1);}
 }else if(motion){
  chestCore(c,time,stand,light?.6:1);
  snowfall(c,time,light?6:16,60,130+stand*30,1,seed);
  if(!light)sparkles(c,time,8,48,100+stand*30,1,seed*.001);
 }
}
// Hào quang + phù văn + băng trì + PHƯỢNG BĂNG + Thiên Sương Phiến (đi theo người sở hữu — luôn hiện).
export function drawTuyetPhachGear(c,a,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0,hy=HALO_Y(stand);
 if(layer==='back'){
  frostPool(c,a,time,96+stand*8,.9,motion,light);
  haloLayer(c,a,time,hy,haloWidth(stand),{motion,alpha:.92});
  img(c,smokeArt(),-40,CHEST_Y(stand)-58,80,120,.32);
  if(!light)runeRing(c,time,hy,haloWidth(stand),1);
  if(a?.phoenix)phoenixWithTrail(c,a,time,stand,'back',{light});
 }else{
  if(a?.phoenix)phoenixWithTrail(c,a,time,stand,'front',{light});
  if(a?.blade){const h=64+stand*8,w=h*a.blade.naturalWidth/a.blade.naturalHeight,orbit=motion?Math.sin(time*.00085):0;
   c.save();c.translate(58-stand*2+orbit*4,-46-stand*14+sway*4);c.rotate(.18+sway*.05);
   glow(c,iceArt(),-w*.9,-h*.6,w*1.8,h*1.2,.34);img(c,a.blade,-w/2,-h/2,w,h);
   if(motion){const py=-h*.36,p=.7+.3*Math.sin(time*.005);glow(c,iceArt(),-14*p,py-10*p,28*p,20*p,.8);
    const u=(time*.00055)%1;img(c,featherArt(),-3+Math.sin(u*6)*6,py+h*.5+u*h*.6,6,12,(1-u)*.85);
    const flare=Math.max(0,Math.sin(time*.0021))**8;spin(c,sparkArt(),w*.3,py,10+flare*26,time*.001,flare,true);}
   c.restore();}
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình 9 s: bão tuyết tràn sân, băng trì nở → tuyết xoáy vào ngực, VỎ BĂNG mọc bọc quanh người →
// CHỚP trắng + vỏ băng VỠ TUNG thành mảnh, PHƯỢNG BĂNG phá ra lao thẳng vào màn → tuyết rơi, Thiên Sương Phiến giáng xuống.
export function drawTuyetPhachReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand),cy=CHEST_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.7:.7-.34*after);
  img(c,mistArt(),-460,-500,920,840,veil);
  if(k<reveal){
   if(motion)frostMist(c,clock*(1+charge*2),cy,ease(charge*1.4),light?4:7);
   iceRays(c,clock*(1+charge*4),hy,110+120*ease(charge),ease(charge)*.55);
   frostPool(c,a,clock*(1+charge*3),30+70*ease(charge/.6),ease(charge/.5),motion,light);
   runeRing(c,clock*(1+charge*6),hy,haloWidth(stand)*(1.6-.6*ease(charge)),ease(charge));
   haloLayer(c,a,clock,hy,haloWidth(stand)*(.55+.45*ease(charge)),{alpha:ease(charge)*.5,motion});
  }else{
   const burst=1-clamp(after/.3);
   iceRays(c,clock,hy,230+stand*30+burst*220,.8+burst*.6);
   drawTuyetPhachAura(c,clock,stand,'back',{motion,light,seed:s});
   const pop=after<.1?.6+.55*ease(after/.1):1+.15*(1-ease((after-.1)/.12));
   frostPool(c,a,clock,96+stand*8,.9,motion,light);
   haloLayer(c,a,clock,hy,haloWidth(stand),{pulse:pop-1,motion});
   runeRing(c,clock,hy,haloWidth(stand)*(1+burst*.5),1);
   glow(c,iceArt(),-150,hy-150,300,300,burst*.85);
  }
 }else{
  if(k<reveal){
   const n=light?14:34;
   for(let i=0;i<n;i++){const u=((i/n)+clock*.00045)%1,R=(1-ease(charge*.6+u*.4))*190+12,ang=i*2.399+dir*clock*.0016+u*3,x=Math.cos(ang)*R,y=cy+Math.sin(ang)*R*.62,size=2.2+(i%3)*1.4;
    if(i%4===3)img(c,smokeArt(),x-size*2,y-size*2,size*4,size*4,Math.min(1,charge*2)*.7);else spin(c,flakeArt(),x,y,size*2.4,ang,Math.min(1,charge*2.5)*(.5+.5*u),true);}
   // VỎ BĂNG: tinh thể mọc vòng quanh người, cao dần, khép lại
   const shell=ease(clamp((charge-.35)/.5)),m=light?7:13;
   for(let i=0;i<m;i++){const ang=i/m*TAU+s,rx=Math.cos(ang)*(34-10*shell),front=Math.sin(ang)>0,h=(40+(i%3)*22+stand*30)*shell,w=12+(i%2)*5;
    c.save();c.globalAlpha*=(front?.75:.95)*shell;c.translate(rx,22+Math.sin(ang)*8);c.rotate(-Math.cos(ang)*.18*(1-shell*.6));c.drawImage(crystalArt(),-w/2,-h,w,h);c.restore();}
   const core=clamp((charge-.6)/.4);glow(c,iceArt(),-36*core,cy-36*core,72*core,72*core,core);glow(c,lightArt(),-16*core,cy-16*core,32*core,32*core,core);
  }else{
   const flash=1-clamp(after/.08);
   if(flash>0){glow(c,lightArt(),-190,-250,380,380,flash);glow(c,iceArt(),-140,hy-140,280,280,flash);}
   // vỏ băng vỡ tung thành mảnh văng ra
   const brk=clamp(after/.35);if(brk<1){const m=light?10:24;for(let i=0;i<m;i++){const ang=i/m*TAU+s*.01,r=20+ease(brk)*170,x=Math.cos(ang)*r,y=cy+Math.sin(ang)*r*.7+brk*brk*80,w=6+(i%3)*3,h=w*2.4;
     c.save();c.globalAlpha*=(1-brk);c.translate(x,y);c.rotate(ang+brk*6*(i%2?1:-1));c.drawImage(crystalArt(),-w/2,-h/2,w,h);c.restore();}}
   for(const [delay,color,width] of [[0,'#03081acc',8],[.04,'#f0fbff',2.6],[.1,'#7fd4ff',1.4],[.16,'#c8b8ff',1.2]]){const u=clamp((after-delay)/.34);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.9;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);c.beginPath();c.ellipse(0,22,34+u*200,9+u*46,0,0,TAU);c.stroke();c.restore();}
   // phượng băng phá vỏ lao vào màn (phóng to + mờ dần)
   const dive=clamp(after/.26);if(dive<1&&a?.phoenix){const big=1+ease(dive)*3.4;frostPhoenix(c,a,clock,dir*dive*40,cy-20-dive*40,120*big,{alpha:(1-dive)*.95,beat:14,flip:dir,speed:1.8});}
   const fall=clamp((after-.1)/.5);if(fall>0&&fall<1)snowfall(c,clock,light?10:30,180,260,(1-fall)*1.1,s);
   const land=ease(clamp((after-.12)/.22));
   if(a?.blade){if(land<1){const h=92,w=h*a.blade.naturalWidth/a.blade.naturalHeight,x=52*land-dir*40*(1-land),y=-74-280*(1-land);
     for(let j=1;j<8;j++)glow(c,j%2?lightArt():iceArt(),x-dir*j*6*(1-land)-8,y-j*22*(1-land)-8,16,16,(1-land)*(1-j/8));
     c.save();c.translate(x,y);c.rotate(.18+(1-land)*TAU*dir);glow(c,iceArt(),-w*1.2,-h*.7,w*2.4,h*1.4,.85*(1-land));img(c,a.blade,-w/2,-h/2,w,h);c.restore();}
    else drawTuyetPhachGear(c,a,clock,{stand},'front',{motion,light});}
   drawTuyetPhachAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
