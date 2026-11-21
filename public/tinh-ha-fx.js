// 19/11/2026: TINH HÀ KIẾM ĐẾ (skin 500 coin) — chủ game: "đẹp hơn tất cả skin hiện có, tự sáng tạo".
// Theo công thức docs/ghi-chu/VFX-SKIN-CAO-CAP.md (mẫu karma-fx.js) nhưng nhiều lớp hơn + lớp đặc trưng CỬU TINH KIẾM TRẬN:
//  1 tinh vân mực tím sau lưng · 2 thần quang lam bạc xoay ngược · 3 Tinh Đồ (ảnh hào quang) + quầng lam + 2 sao quét vành ·
//  4 vòng tinh tú (vạch chia + 8 sao) quay · 5 tinh trận dưới chân (Tinh Đồ nằm ngửa + sao 8 cánh) · 6 tinh khí bốc + cột sáng ·
//  7 lõi sao ở ngực đập nhịp · 8 CỬU TINH KIẾM TRẬN: 9 tinh kiếm bay vòng elip có đuôi (sáng cộng + tối phủ), trước/sau thân thật ·
//  9 sao 4 cánh + bụi sao rơi + SAO BĂNG lướt qua mỗi ~6 s · 10 Tinh Hà Kiếm bản mệnh: dải ngân hà chảy dọc lưỡi + chớp sao mũi kiếm.
// Gốc ở chân; đứng cao ~125, ngồi ~91. Texture dựng sẵn; không filter/shadowBlur. light=true bỏ tia/vòng/cột/sao băng, giảm hạt.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const SILVER='#eef4ff',SAPPHIRE='#4f8bff',VIOLET='#9b6bff',TEAL='#5fe3ff';
// Tâm vòng trong của ảnh Tinh Đồ (đo lại sau khi có ảnh — đặt ở tinh-ha-data).
export const TH_RING={x:.497,y:.499};
const HALO_Y=stand=>-56-stand*28;
const CHEST_Y=stand=>-36-stand*30;
const haloWidth=stand=>(84+stand*16)*1.08;
const art={};

function surface(size,draw){const canvas=makeSurface(size,size);if(!canvas)return null;draw(canvas.getContext('2d'),size/2);return canvas;}
function radial(size,stops){return surface(size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});}
const nebulaArt=()=>art.nebula??=surface(200,(c,r)=>{
 const blob=(x,y,rad,col)=>{const g=c.createRadialGradient(x,y,1,x,y,rad);g.addColorStop(0,col);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,200,200);};
 blob(r,r,r,'#05031099');blob(r-30,r-20,70,'#2a145a70');blob(r+34,r+12,64,'#0d2a6a66');blob(r+6,r-46,50,'#4a1f8a55');blob(r,r,r*.55,'#07051480');
});
const lightArt=()=>art.light??=radial(128,[[0,'#ffffffff'],[.2,'#f2f8ffcc'],[.55,'#bcd6ff50'],[1,'#ffffff00']]);
const blueArt=()=>art.blue??=radial(128,[[0,'#e8f2ffd8'],[.35,'#6fa4ff78'],[.7,'#8a5cff26'],[1,'#4f8bff00']]);
const smokeArt=()=>art.smoke??=radial(96,[[0,'#0a0620c8'],[.45,'#120a3070'],[1,'#00000000']]);
const raysArt=()=>art.rays??=surface(320,(c,r)=>{c.translate(r,r);
 for(let i=0;i<20;i++){const a=i/20*TAU,len=r*(i%2?.7:1),w=i%3?.05:.085,g=c.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);
  g.addColorStop(0,'#f4f8ffd0');g.addColorStop(.35,i%2?'#9cc0ff60':'#ffffff80');g.addColorStop(1,'#7f9cff00');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,len,a-w,a+w);c.closePath();c.fill();}});
const starArt=()=>art.star??=surface(64,(c,r)=>{c.translate(r,r);
 for(const [w,h] of [[30,2.2],[2.2,30]]){const g=c.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#d8e6ffa0');g.addColorStop(1,'#9cbcff00');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();});
// Vòng tinh tú: vạch chia độ + 8 sao 4 cánh + chòm sao nối nét trong vòng.
const ringArt=()=>art.ring??=surface(256,(c,r)=>{c.translate(r,r);c.lineCap='round';
 const ring=(rad,color,w,dash)=>{c.save();c.setLineDash(dash||[]);c.beginPath();c.arc(0,0,rad,0,TAU);c.strokeStyle=color;c.lineWidth=w;c.stroke();c.restore();};
 ring(122,'#0a062080',5);ring(122,SILVER,1.6);ring(113,'#b8d0ffa0',1,[2,6]);ring(101,'#9b6bff90',1);
 for(let i=0;i<72;i++){const a=i/72*TAU,r1=i%9?116:110;c.beginPath();c.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);c.lineTo(Math.cos(a)*121,Math.sin(a)*121);c.strokeStyle='#dce8ff90';c.lineWidth=i%9?.8:1.6;c.stroke();}
 for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.translate(0,-117);for(const [w,h] of [[7,1.4],[1.4,7]]){c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fillStyle='#ffffff';c.fill();}c.restore();}
 const pts=[[-60,-30],[-34,-52],[-6,-40],[22,-58],[50,-30],[36,6],[60,40],[16,52],[-22,36],[-52,18]];c.strokeStyle='#cfe0ff70';c.lineWidth=1;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 for(const [x,y] of pts){const g=c.createRadialGradient(x,y,0,x,y,5);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-5,y-5,10,10);}});
// Sao 8 cánh lõi tinh trận.
const starCoreArt=()=>art.core??=surface(128,(c,r)=>{c.translate(r,r);
 for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);const L=i%2?36:58,g=c.createLinearGradient(0,0,0,-L);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#8fb4ff00');c.fillStyle=g;c.beginPath();c.moveTo(-6,0);c.lineTo(0,-L);c.lineTo(6,0);c.closePath();c.fill();c.restore();}
 const g=c.createRadialGradient(0,0,0,0,0,18);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#9cc0ff00');c.fillStyle=g;c.beginPath();c.arc(0,0,18,0,TAU);c.fill();});
const pillarArt=()=>art.pillar??=(()=>{const canvas=makeSurface(32,256);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,256,0,0);g.addColorStop(0,'#e8f0ffd0');g.addColorStop(.4,'#a8c4ff50');g.addColorStop(1,'#ffffff00');
 const h=c.createLinearGradient(0,0,32,0);h.addColorStop(0,'#ffffff00');h.addColorStop(.5,'#ffffffff');h.addColorStop(1,'#ffffff00');
 c.fillStyle=g;c.fillRect(0,0,32,256);c.globalCompositeOperation='destination-in';c.fillStyle=h;c.fillRect(0,0,32,256);return canvas;})();
// Vệt sao băng (dựng sẵn).
const streakArt=()=>art.streak??=(()=>{const canvas=makeSurface(256,16);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,0,256,0);g.addColorStop(0,'#9cbcff00');g.addColorStop(.8,'#cfe0ffaa');g.addColorStop(1,'#ffffff');c.fillStyle=g;c.beginPath();c.moveTo(0,8);c.lineTo(250,4);c.lineTo(256,8);c.lineTo(250,12);c.closePath();c.fill();return canvas;})();

function img(c,im,x,y,w,h,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function glow(c,im,x,y,w,h,alpha){if(!im||alpha<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function spin(c,im,x,y,size,angle,alpha,add=false){if(!im||alpha<=0)return;c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}

function godRays(c,t,cy,size,alpha){spin(c,raysArt(),0,cy,size,t*.00011,alpha*.5,true);spin(c,raysArt(),0,cy,size*.8,-t*.00018+.5,alpha*.38,true);}
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;const k=1+pulse+(motion?Math.sin(t*.0017)*.015:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 glow(c,blueArt(),-w*.62,cy-w*.62,w*1.24,w*1.24,(.4+(motion?Math.sin(t*.0023)*.08:0))*alpha);
 // Tinh Đồ là vòng tròn đều → xoay rất chậm
 c.save();c.translate(0,cy);c.rotate(motion?t*.00005:0);img(c,a.halo,-w*TH_RING.x,-h*TH_RING.y,w,h,alpha);c.restore();
 if(motion){for(let i=0;i<2;i++){const ang=t*.0012+i*Math.PI,r=w*.4;spin(c,starArt(),Math.cos(ang)*r,cy+Math.sin(ang)*r,w*.16,ang,.9*alpha,true);}}
}
function starRing(c,t,cy,width,alpha){spin(c,ringArt(),0,cy,width*.66,-t*.00032,alpha*.9);}
function floorArray(c,a,t,width,alpha,motion=true){
 if(alpha<=0)return;c.save();c.translate(0,22);c.scale(1,.26);
 glow(c,blueArt(),-width*.72,-width*.72,width*1.44,width*1.44,alpha*.55);
 if(a?.halo){const w=width,h=w*a.halo.naturalHeight/a.halo.naturalWidth;c.save();c.rotate(motion?t*.0002:0);img(c,a.halo,-w*TH_RING.x,-h*TH_RING.y,w,h,alpha*.85);c.restore();}
 spin(c,ringArt(),0,0,width*1.2,motion?-t*.00028:0,alpha*.7);
 spin(c,starCoreArt(),0,0,width*.42,motion?t*.0006:0,alpha*.95,true);
 c.restore();}
// Tinh khí: sương tinh vân bốc (tối) + lưỡi sáng lam bạc (cộng).
function starFlame(c,t,count,spread,height,alpha){
 for(let i=0;i<count;i++){const u=(i/count+t*.0004)%1,side=((i*7)%count/count-.5)*2,x=side*spread*(1-u*.4)+Math.sin(u*5+i)*6,y=20-u*height,s=10+u*24;img(c,smokeArt(),x-s/2,y-s/2,s,s,alpha*Math.sin(u*Math.PI)*.55);}
 for(let i=0;i<count;i++){const u=(i/count+.5/count+t*.00058)%1,side=((i*5)%count/count-.5)*2,x=side*spread*.8*(1-u*.5)+Math.sin(u*7+i*2)*4,y=20-u*height*.85,s=7+(1-u)*9;glow(c,i%3?lightArt():blueArt(),x-s/2,y-s*.9,s,s*1.8,alpha*Math.sin(u*Math.PI)*.55);}}
function pillars(c,t,count,spread,alpha){for(let i=0;i<count;i++){const ph=(t*.0005+i*.37)%1,x=Math.sin(i*2.1+1)*spread,h=60+40*Math.sin(i*1.7+t*.001),a=Math.sin(ph*Math.PI);glow(c,pillarArt(),x-3,20-h,6,h,alpha*a*.5);}}
function chestCore(c,t,stand,alpha){const y=CHEST_Y(stand),p=.75+.25*Math.sin(t*.004);glow(c,blueArt(),-20*p,y-20*p,40*p,40*p,alpha*.75);spin(c,starArt(),0,y,16+8*p,t*.001,alpha*.7,true);}
// CỬU TINH KIẾM TRẬN: 9 tinh kiếm (ảnh kiếm thu nhỏ) bay vòng elip, mũi theo hướng bay, đuôi sáng + đuôi tối.
// layer back = các thanh ở nửa sau (y nhỏ), front = nửa trước. spread>1 = bung ra (màn biến hình).
export function swordArray(c,a,t,stand,layer,{alpha=1,light=false,spread=1,count=9}={}){
 if(!a?.blade||alpha<=0)return;const cy=-34-stand*18,rx=54*spread,ry=17*spread+stand*3,n=light?Math.min(5,count):count,trail=light?3:7;
 const h=36,w=h*a.blade.naturalWidth/a.blade.naturalHeight;
 for(let i=0;i<n;i++){const base=t*.0011+i*TAU/n,front=Math.sin(base)>0;if(front!==(layer==='front'))continue;
  for(let j=trail;j>=1;j--){const q=base-j*.08,x=Math.cos(q)*rx,y=cy+Math.sin(q)*ry+Math.sin(q*3+i)*4,s=5*(1-j/trail)+1.5;
   if(j%2)img(c,smokeArt(),x-s*1.3,y-s*1.3,s*2.6,s*2.6,alpha*.35*(1-j/trail));glow(c,j%3?lightArt():blueArt(),x-s,y-s,2*s,2*s,alpha*.55*(1-j/trail));}
  const x=Math.cos(base)*rx,y=cy+Math.sin(base)*ry+Math.sin(base*3+i)*4,dir=Math.atan2(Math.cos(base)*ry,-Math.sin(base)*rx);
  c.save();c.translate(x,y);c.rotate(Math.cos(base)*.22+Math.sin(t*.002+i)*.05);c.globalAlpha*=alpha*(front?1:.7); /* dựng đứng mũi lên — hàng rào kiếm xoay */
  glow(c,blueArt(),-w*2.2,-h*.75,w*4.4,h*1.5,.7);c.drawImage(a.blade,-w/2,-h/2,w,h);spin(c,starArt(),0,-h*.48,9+5*Math.sin(t*.004+i),i,.9,true);c.restore();}
}
function sparkles(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const cyc=(t*.00055+i*.618+seed)%1,tw=Math.sin(cyc*Math.PI);if(tw<.05)continue;
  const x=Math.sin(i*12.9898+Math.floor(t*.00055+i*.618+seed)*3.1)*width,y=-10-((i*.37+Math.floor(t*.00055+i*.618+seed)*.53)%1)*height,s=4+tw*(i%3?6:11);spin(c,starArt(),x,y,s,i,alpha*tw,true);}}
function stardust(c,t,count,width,seed=0,height=130){
 for(let i=0;i<count;i++){const up=i%3!==2,u=(i*.618+(t+seed)*(up?.00034:.00022))%1,x=Math.sin(i*2.399+u*1.7)*width*(.35+.65*((i*.37)%1)),y=up?20-u*height:-height+u*(height+16),a=Math.sin(u*Math.PI)*.9,s=up?2+(i%4):1.6;
  glow(c,i%4?lightArt():blueArt(),x-s,y-s,2*s,2*s,a);}}
// Sao băng: mỗi ~6 s một vệt chéo lướt qua đầu (lệch giờ theo seed).
function shootingStar(c,t,seed,stand){const per=6200,u=((t+seed*97)%per)/per;if(u>.16)return;const k=u/.16,dir=(Math.floor((t+seed*97)/per)%2)?1:-1;
 const x0=-110*dir,y0=-150-stand*20,x=x0+dir*220*k,y=y0+70*k;c.save();c.translate(x,y);c.rotate(Math.atan2(70,dir*220));c.globalCompositeOperation='lighter';c.globalAlpha*=Math.sin(k*Math.PI);c.drawImage(streakArt(),-128*dir*0-128,-6,128,12);c.restore();spin(c,starArt(),x,y,16,0,Math.sin(k*Math.PI),true);}

export function drawTinhHaAura(c,t,stand,layer,{motion=true,light=false,seed=0,art:a=null}={}){
 const time=motion?t:0,breathe=motion?Math.sin((time+seed)*.0021):0,hy=HALO_Y(stand);
 if(layer==='back'){
  img(c,nebulaArt(),-86,hy-62,172,186,.72+breathe*.05);
  if(!light)godRays(c,time,hy,210+stand*30,.85+breathe*.1);
  if(motion){starFlame(c,time,light?5:12,34,92+stand*24,1);if(!light)pillars(c,time,5,42,1);}
 }else if(motion){
  chestCore(c,time,stand,light?.6:1);
  if(!light){sparkles(c,time,10,50,104+stand*30,1,seed*.001);shootingStar(c,time,seed,stand);}
  stardust(c,time,light?4:12,58,seed);
 }
}
// Tinh Đồ + vòng tinh tú + tinh trận + Cửu Tinh Kiếm Trận + Tinh Hà Kiếm (đi theo người sở hữu).
export function drawTinhHaGear(c,a,t,pose,layer,{motion=true,light=false,noSwords=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0,hy=HALO_Y(stand);
 if(layer==='back'){
  floorArray(c,a,time,100+stand*8,.9,motion);
  haloLayer(c,a,time,hy,haloWidth(stand),{motion,alpha:.92});
  img(c,smokeArt(),-40,CHEST_Y(stand)-58,80,120,.38); // nền tối sau thân → bạch y nổi
  if(!light)starRing(c,time,hy,haloWidth(stand),1);
  if(motion)swordArray(c,a,time,stand,'back',{light});
 }else if(a?.blade){
  if(motion&&!noSwords)swordArray(c,a,time,stand,'front',{light});
  const h=100+stand*14,w=h*a.blade.naturalWidth/a.blade.naturalHeight,orbit=motion?Math.sin(time*.00085):0;
  c.save();c.translate(-52+stand*3-orbit*4,-50-stand*14+sway*4);c.rotate(-.14-sway*.06);
  glow(c,blueArt(),-w*.9,-h*.42,w*1.8,h*.84,.36);
  img(c,a.blade,-w/2,-h/2,w,h);
  if(motion){const streams=light?2:4;for(let i=0;i<streams;i++){const u=((time/1600)+i/streams)%1;glow(c,i%2?blueArt():lightArt(),-6,h*.38-u*h*.8-6,12,12,.9*Math.sin(u*Math.PI));}
   const flare=Math.max(0,Math.sin(time*.0021))**8;spin(c,starArt(),0,-h*.47,10+flare*28,time*.001,flare,true);}
  c.restore();
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình 9 s: trời tối, tinh vân cuộn → sao từ bốn phía xoáy vào ngực, vòng tinh tú thu nhỏ, chòm sao vẽ nét →
// CHỚP + thần quang bùng + sóng tinh vân/sóng sáng sát đất → 9 tinh kiếm NỔ BUNG ra rồi thu về quỹ đạo, Tinh Hà Kiếm như sao chổi giáng xuống.
export function drawTinhHaReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,mirror=(s>>1)%2?-1:1,charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.68:.68-.32*after);
  img(c,nebulaArt(),-460,-500,920,840,veil);
  if(k<reveal){
   godRays(c,clock*(1+charge*4),hy,120+120*ease(charge),ease(charge)*.6);
   if(motion)starFlame(c,clock*(1+charge),light?6:14,30+charge*20,70+charge*70,ease(charge*1.5));
   starRing(c,clock*(1+charge*6),hy,haloWidth(stand)*(1.7-.7*ease(charge)),ease(charge));
   haloLayer(c,a,clock,hy,haloWidth(stand)*(.55+.45*ease(charge)),{alpha:ease(charge)*.5,motion});
   floorArray(c,a,clock*(1+charge*3),40+66*ease(charge),ease(charge)*.8,motion);
  }else{
   const burst=1-clamp(after/.3),spread=1+2.6*(1-ease(clamp((after-.08)/.45)));
   godRays(c,clock,hy,240+stand*30+burst*220,.85+burst*.6);
   drawTinhHaAura(c,clock,stand,'back',{motion,light,seed:s});
   const pop=after<.1?.6+.55*ease(after/.1):1+.15*(1-ease((after-.1)/.12));
   floorArray(c,a,clock,100+stand*8,.9,motion);
   haloLayer(c,a,clock,hy,haloWidth(stand),{pulse:pop-1,motion});
   starRing(c,clock,hy,haloWidth(stand)*(1+burst*.5),1);
   swordArray(c,a,clock*(1+burst*3),stand,'back',{spread,light});
   glow(c,blueArt(),-150,hy-150,300,300,burst*.9);
  }
 }else{
  if(k<reveal){
   const n=light?14:36,cy=CHEST_Y(stand);
   for(let i=0;i<n;i++){const u=((i/n)+clock*.00045)%1,R=(1-ease(charge*.6+u*.4))*190+12,ang=i*2.399+dir*clock*.0016+u*3,x=Math.cos(ang)*R*mirror,y=cy+Math.sin(ang)*R*.62,size=2.2+(i%3)*1.4;
    if(i%4===3)img(c,smokeArt(),x-size*2,y-size*2,size*4,size*4,Math.min(1,charge*2)*.7);else spin(c,starArt(),x,y,size*3.2,ang,Math.min(1,charge*2.5)*(.5+.5*u),true);}
   const core=clamp((charge-.6)/.4);glow(c,blueArt(),-36*core,cy-36*core,72*core,72*core,core);glow(c,lightArt(),-16*core,cy-16*core,32*core,32*core,core);
   if(!light)sparkles(c,clock,9,64,150,charge,s*.01);
  }else{
   const flash=1-clamp(after/.08);
   if(flash>0){glow(c,lightArt(),-190,-250,380,380,flash);glow(c,blueArt(),-140,hy-140,280,280,flash);}
   for(const [delay,color,width] of [[0,'#0a0620cc',8],[.04,'#eef4ff',2.6],[.1,'#9cc0ff',1.4],[.16,'#b48cff',1.2]]){const u=clamp((after-delay)/.34);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.9;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);c.beginPath();c.ellipse(0,22,34+u*200,9+u*46,0,0,TAU);c.stroke();c.restore();}
   const pop=clamp(after/.25);if(pop<1){const n=light?6:16;for(let i=0;i<n;i++){const ang=i/n*TAU+s,r=20+ease(pop)*130;spin(c,starArt(),Math.cos(ang)*r,CHEST_Y(stand)+Math.sin(ang)*r*.7,8+12*(1-pop),ang,1-pop,true);}}
   const spread=1+2.6*(1-ease(clamp((after-.08)/.45)));swordArray(c,a,clock*(1+(1-clamp(after/.3))*3),stand,'front',{spread,light});
   // Tinh Hà Kiếm như sao chổi giáng xuống
   const land=ease(clamp((after-.06)/.2));
   if(a?.blade){if(land<1){const h=114,w=h*a.blade.naturalWidth/a.blade.naturalHeight,x=-52*land+mirror*40*(1-land),y=-64-280*(1-land);
     for(let j=1;j<8;j++)glow(c,j%2?lightArt():blueArt(),x+mirror*j*6*(1-land)-8,y-j*22*(1-land)-8,16,16,(1-land)*(1-j/8));
     c.save();c.translate(x,y);c.rotate(-.14+(1-land)*TAU*dir);glow(c,blueArt(),-w*1.2,-h*.6,w*2.4,h*1.2,.85*(1-land));img(c,a.blade,-w/2,-h/2,w,h);c.restore();}
    else drawTinhHaGear(c,a,clock,{stand},'front',{motion,light,noSwords:true});}
   drawTinhHaAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
