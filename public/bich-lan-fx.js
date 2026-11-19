// 19/11/2026: BÍCH LÂN ĐỘC HẬU (skin nữ độc tu, 500 coin) — chủ game: "content khác, sáng tạo đặc biệt, xanh lá, có con rắn, độc tu".
// Cơ chế RIÊNG (không phải Tinh Hà đổi màu) — theo công thức VFX-SKIN-CAO-CAP.md:
//  1 độc vụ mực lục cuộn sau lưng · 2 lục quang xoay ngược · 3 Xà Hoàn (ảnh rắn ngậm đuôi) xoay chậm + giọt độc nhỏ từ vành ·
//  4 vòng phù văn độc quay ngược · 5 ĐỘC TRÌ dưới chân: hồ độc + Xà Hoàn nằm ngửa + BONG BÓNG nổi lên rồi vỡ thành vòng ·
//  6 MÃNG XÀ LINH HỒN: ảnh rắn cắt dải dọc, mỗi dải lệch theo sóng → thân rắn TRƯỜN thật sau lưng, đầu nhô qua vai ·
//  7 độc châu ở ngực đập nhịp · 8 3 XÀ KHÍ (chuỗi khí sáng có đầu) bò vòng quanh chân, trước/sau thân ·
//  9 ĐỘC ĐIỆP (bướm lục vỗ cánh) bay lên + lục tinh lấp lánh · 10 Vạn Cổ Xà Trượng: độc châu sáng + giọt độc nhỏ xuống.
// Gốc ở chân; đứng cao ~125, ngồi ~91. Texture dựng sẵn, không filter/shadowBlur. light=true bỏ tia/vòng/xà khí, giảm hạt + dải rắn.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
export const BL_RING={x:.5,y:.509};
const HALO_Y=stand=>-62-stand*46; // tâm Xà Hoàn ngang đầu (đứng ~-108, ngồi ~-62 vì ảnh ngồi được thu vừa khung)
const CHEST_Y=stand=>-36-stand*30;
const haloWidth=stand=>(58+stand*14)*1.08; // vòng rắn dày → nhỏ hơn Tinh Đồ
const art={};

function surface(w,h,draw){const canvas=makeSurface(w,h);if(!canvas)return null;draw(canvas.getContext('2d'),w/2,h/2);return canvas;}
function radial(size,stops){return surface(size,size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});}
const mistArt=()=>art.mist??=surface(200,200,(c,r)=>{
 const blob=(x,y,rad,col)=>{const g=c.createRadialGradient(x,y,1,x,y,rad);g.addColorStop(0,col);g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,200,200);};
 blob(r,r,r,'#020a0699');blob(r-30,r-18,70,'#0a3a1e70');blob(r+34,r+14,62,'#14301066');blob(r+4,r-44,50,'#2a0f3a50');blob(r,r,r*.55,'#03100880');});
const lightArt=()=>art.light??=radial(128,[[0,'#ffffffff'],[.2,'#eaffd8cc'],[.55,'#a8ff9c50'],[1,'#ffffff00']]);
const greenArt=()=>art.green??=radial(128,[[0,'#d8ffc8e0'],[.35,'#4dff7a80'],[.7,'#10b04a28'],[1,'#0a802e00']]);
const violetArt=()=>art.violet??=radial(96,[[0,'#e4b8ffb0'],[.4,'#9b4dff50'],[1,'#5a1a9a00']]);
const smokeArt=()=>art.smoke??=radial(96,[[0,'#04140ac8'],[.45,'#0a2a1470'],[1,'#00000000']]);
const raysArt=()=>art.rays??=surface(320,320,(c,r)=>{c.translate(r,r);
 for(let i=0;i<16;i++){const a=i/16*TAU,len=r*(i%2?.66:1),w=i%3?.05:.09,g=c.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);
  g.addColorStop(0,'#eaffd8c8');g.addColorStop(.35,i%2?'#5cff8a58':'#c8ff9a70');g.addColorStop(1,'#2aff6a00');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,len,a-w,a+w);c.closePath();c.fill();}});
const sparkArt=()=>art.spark??=surface(64,64,(c,r)=>{c.translate(r,r);
 for(const [w,h] of [[28,2.2],[2.2,28]]){const g=c.createRadialGradient(0,0,0,0,0,28);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#c8ffb0a0');g.addColorStop(1,'#5cff7a00');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();});
// Vòng phù văn độc: vạch chia + 12 ấn thoi + 6 nanh rắn.
const runeArt=()=>art.rune??=surface(256,256,(c,r)=>{c.translate(r,r);c.lineCap='round';
 const ring=(rad,color,w,dash)=>{c.save();c.setLineDash(dash||[]);c.beginPath();c.arc(0,0,rad,0,TAU);c.strokeStyle=color;c.lineWidth=w;c.stroke();c.restore();};
 ring(122,'#03140a80',5);ring(122,'#b8ffb0',1.4);ring(112,'#5cff8aa0',1,[3,7]);ring(100,'#b06bff80',1);
 for(let i=0;i<60;i++){const a=i/60*TAU,r1=i%5?117:110;c.beginPath();c.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);c.lineTo(Math.cos(a)*121,Math.sin(a)*121);c.strokeStyle='#c8ffb090';c.lineWidth=i%5?.8:1.6;c.stroke();}
 for(let i=0;i<12;i++){c.save();c.rotate(i*TAU/12);c.translate(0,-106);c.beginPath();c.moveTo(0,-6);c.lineTo(3,0);c.lineTo(0,6);c.lineTo(-3,0);c.closePath();c.fillStyle=i%2?'#7dff9a':'#d8a8ff';c.fill();c.restore();}
 for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6+.26);c.translate(0,-92);c.beginPath();c.moveTo(-4,-6);c.quadraticCurveTo(0,8,4,-6);c.strokeStyle='#eaffd8c0';c.lineWidth=1.4;c.stroke();c.restore();}});
// Bong bóng độc (vành sáng + chấm phản quang).
const bubbleArt=()=>art.bubble??=surface(64,64,(c,r)=>{const g=c.createRadialGradient(r,r,r*.55,r,r,r);g.addColorStop(0,'#2aff6a10');g.addColorStop(.8,'#8dff9a90');g.addColorStop(1,'#8dff9a00');c.fillStyle=g;c.beginPath();c.arc(r,r,r,0,TAU);c.fill();
 const h=c.createRadialGradient(r-9,r-9,0,r-9,r-9,7);h.addColorStop(0,'#ffffffe0');h.addColorStop(1,'#ffffff00');c.fillStyle=h;c.fillRect(0,0,64,64);});
// Độc điệp: bướm lục 2 cánh (vẽ 1 nửa, lật để vỗ cánh).
const wingArt=()=>art.wing??=surface(64,64,(c,r)=>{c.translate(r,r);
 const g=c.createRadialGradient(10,-6,1,10,-6,26);g.addColorStop(0,'#eaffd8');g.addColorStop(.45,'#4dff7acc');g.addColorStop(1,'#0a802e00');c.fillStyle=g;
 c.beginPath();c.moveTo(0,0);c.bezierCurveTo(8,-26,30,-24,26,-6);c.bezierCurveTo(24,4,10,4,0,0);c.fill();
 c.beginPath();c.moveTo(0,1);c.bezierCurveTo(10,6,20,18,10,22);c.bezierCurveTo(4,22,1,12,0,1);c.fill();});
const dropArt=()=>art.drop??=surface(32,48,(c)=>{const g=c.createRadialGradient(16,32,1,16,30,14);g.addColorStop(0,'#eaffd8');g.addColorStop(.5,'#3dff6acc');g.addColorStop(1,'#0a802e00');c.fillStyle=g;c.beginPath();c.moveTo(16,4);c.bezierCurveTo(26,22,28,30,16,42);c.bezierCurveTo(4,30,6,22,16,4);c.fill();});
const pillarArt=()=>art.pillar??=(()=>{const canvas=makeSurface(32,256);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,256,0,0);g.addColorStop(0,'#c8ffb0d0');g.addColorStop(.4,'#4dff7a50');g.addColorStop(1,'#ffffff00');
 const h=c.createLinearGradient(0,0,32,0);h.addColorStop(0,'#ffffff00');h.addColorStop(.5,'#ffffffff');h.addColorStop(1,'#ffffff00');
 c.fillStyle=g;c.fillRect(0,0,32,256);c.globalCompositeOperation='destination-in';c.fillStyle=h;c.fillRect(0,0,32,256);return canvas;})();

function img(c,im,x,y,w,h,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function glow(c,im,x,y,w,h,alpha){if(!im||alpha<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function spin(c,im,x,y,size,angle,alpha,add=false){if(!im||alpha<=0)return;c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}

function greenRays(c,t,cy,size,alpha){spin(c,raysArt(),0,cy,size,t*.0001,alpha*.45,true);spin(c,raysArt(),0,cy,size*.78,-t*.00016+.4,alpha*.32,true);}
// Độc vụ cuộn: 5 cụm khói trôi vòng chậm sau lưng (tối) — nền cho người nổi lên.
function venomMist(c,t,cy,alpha,count=5){for(let i=0;i<count;i++){const a=t*.00025*(i%2?1:-1)+i*TAU/count,R=26+8*Math.sin(t*.0007+i),s=96+18*Math.sin(t*.0009+i*2);img(c,smokeArt(),Math.cos(a)*R-s/2,cy+Math.sin(a)*R*.6-s/2,s,s,alpha*.55);}}
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;const k=1+pulse+(motion?Math.sin(t*.0017)*.015:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 glow(c,greenArt(),-w*.62,cy-w*.62,w*1.24,w*1.24,(.38+(motion?Math.sin(t*.0023)*.08:0))*alpha);
 c.save();c.translate(0,cy);c.rotate(motion?-t*.00007:0);img(c,a.halo,-w*BL_RING.x,-h*BL_RING.y,w,h,alpha);c.restore();
 // giọt độc nhỏ từ đáy vành
 if(motion){for(let i=0;i<2;i++){const u=((t*.00045)+i*.5)%1,x=(i?.16:-.2)*w,y=cy+w*.42+u*w*.55;img(c,dropArt(),x-3,y-5,6,9,alpha*(1-u)*.9);glow(c,greenArt(),x-5,y-5,10,10,alpha*(1-u)*.5);}}
}
function runeRing(c,t,cy,width,alpha){spin(c,runeArt(),0,cy,width*.7,-t*.0003,alpha*.85);}
// ĐỘC TRÌ: hồ độc phẳng + Xà Hoàn nằm ngửa + bong bóng nổi/vỡ thành vòng.
function poisonPool(c,a,t,width,alpha,motion=true,light=false){
 if(alpha<=0)return;c.save();c.translate(0,22);c.scale(1,.26);
 img(c,mistArt(),-width*.7,-width*.7,width*1.4,width*1.4,alpha*.85);
 glow(c,greenArt(),-width*.7,-width*.7,width*1.4,width*1.4,alpha*.55);
 if(a?.halo){const w=width,h=w*a.halo.naturalHeight/a.halo.naturalWidth;c.save();c.rotate(motion?t*.00018:0);img(c,a.halo,-w*BL_RING.x,-h*BL_RING.y,w,h,alpha*.8);c.restore();}
 if(!light)spin(c,runeArt(),0,0,width*1.18,motion?-t*.00026:0,alpha*.6);
 c.restore();
 if(!motion)return;
 const n=light?3:7;for(let i=0;i<n;i++){const per=1700+i*230,u=((t+i*611)%per)/per,bx=Math.sin(i*2.7)*width*.36,by=22+Math.cos(i*1.9)*width*.06;
  if(u<.72){const k=u/.72,s=3+k*6;img(c,bubbleArt(),bx-s,by-k*10-s,2*s,2*s,alpha*Math.min(1,k*4)*.95);}
  else{const k=(u-.72)/.28;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha*(1-k)*.8;c.strokeStyle='#9dffa8';c.lineWidth=1.2;c.beginPath();c.ellipse(bx,by-10,6+k*12,2+k*3.5,0,0,TAU);c.stroke();c.restore();
   for(let j=0;j<3;j++)glow(c,greenArt(),bx+(j-1)*6*k-2,by-10-k*10-Math.abs(j-1)*4-2,4,4,alpha*(1-k));}}
}
function venomFlames(c,t,count,spread,height,alpha){
 for(let i=0;i<count;i++){const u=(i/count+t*.00036)%1,side=((i*7)%count/count-.5)*2,x=side*spread*(1-u*.4)+Math.sin(u*5+i)*6,y=20-u*height,s=10+u*24;img(c,smokeArt(),x-s/2,y-s/2,s,s,alpha*Math.sin(u*Math.PI)*.55);}
 for(let i=0;i<count;i++){const u=(i/count+.5/count+t*.0005)%1,side=((i*5)%count/count-.5)*2,x=side*spread*.8*(1-u*.5)+Math.sin(u*7+i*2)*4,y=20-u*height*.85,s=7+(1-u)*9;glow(c,i%4===3?violetArt():i%3?greenArt():lightArt(),x-s/2,y-s*.9,s,s*1.8,alpha*Math.sin(u*Math.PI)*.55);}}
function pillars(c,t,count,spread,alpha){for(let i=0;i<count;i++){const ph=(t*.0005+i*.37)%1,x=Math.sin(i*2.1+1)*spread,h=55+35*Math.sin(i*1.7+t*.001),a=Math.sin(ph*Math.PI);glow(c,pillarArt(),x-3,20-h,6,h,alpha*a*.45);}}
function chestCore(c,t,stand,alpha){const y=CHEST_Y(stand),p=.75+.25*Math.sin(t*.0045);glow(c,greenArt(),-20*p,y-20*p,40*p,40*p,alpha*.8);glow(c,violetArt(),-10*p,y-10*p,20*p,20*p,alpha*.35);spin(c,sparkArt(),0,y,14+8*p,t*.001,alpha*.65,true);}
// MÃNG XÀ LINH HỒN: cắt ảnh thành dải dọc, lệch dải theo sóng truyền từ đuôi (trái) tới đầu (phải) → thân trườn.
export function spiritSerpent(c,a,t,cx,cy,width,{alpha=1,amp=7,strips=26,flip=1,speed=1}={}){
 const im=a?.serpent;if(!im||alpha<=0)return;const iw=im.naturalWidth,ih=im.naturalHeight,h=width*ih/iw,sw=iw/strips,dw=width/strips;
 c.save();c.translate(cx,cy);c.scale(flip,1);c.globalAlpha*=alpha;
 for(let i=0;i<strips;i++){const u=i/strips,off=Math.sin(u*TAU*1.25-t*.0032*speed)*amp*(1-u*.55);c.drawImage(im,i*sw,0,sw+1,ih,-width/2+i*dw,-h/2+off,dw+.7,h);}
 c.restore();
}
// XÀ KHÍ: rắn nhỏ bằng chuỗi khí sáng bò vòng elip quanh chân (đầu sáng + 2 mắt), trước/sau thân.
function snakeTrails(c,t,layer,{alpha=1,count=3,rx=46,ry=11}={}){
 for(let i=0;i<count;i++){const dir=i%2?-1:1;for(let j=10;j>=0;j--){const q=(t*.0011+i*TAU/count)*dir-j*.12*dir,x=Math.cos(q)*rx,y=20+Math.sin(q)*ry+Math.sin(q*6+i)*1.6,front=Math.sin(q)>0;if(front!==(layer==='front'))continue;
  const s=j?3.4*(1-j/12)+1:4.6;if(j%2)img(c,smokeArt(),x-s*1.4,y-s*1.4,s*2.8,s*2.8,alpha*.35);glow(c,j?greenArt():lightArt(),x-s,y-s,2*s,2*s,alpha*(j?.75*(1-j/11):1));
  if(!j){c.save();c.fillStyle='#f6ffd8';c.globalAlpha*=alpha;c.fillRect(x-1.6,y-.8,.9,.9);c.fillRect(x+.8,y-.8,.9,.9);c.restore();}}}
}
// ĐỘC ĐIỆP: bướm lục vỗ cánh bay lên lượn.
function moths(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const u=(i*.618+(t+seed)*.00018)%1,x=Math.sin(i*2.399+u*4)*width*(.4+.6*((i*.37)%1)),y=10-u*height,a=Math.sin(u*Math.PI)*alpha,flap=.35+.65*Math.abs(Math.sin(t*.018+i*1.7)),s=4+(i%3)*1.6;
  if(a<.03)continue;c.save();c.translate(x,y);c.rotate(Math.sin(t*.002+i)*.4);c.globalCompositeOperation='lighter';c.globalAlpha*=a;
  c.save();c.scale(flap,1);c.drawImage(wingArt(),0,-s,s*2,s*2);c.restore();c.save();c.scale(-flap,1);c.drawImage(wingArt(),0,-s,s*2,s*2);c.restore();c.restore();}}
function sparkles(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const cyc=(t*.0005+i*.618+seed)%1,tw=Math.sin(cyc*Math.PI);if(tw<.05)continue;
  const x=Math.sin(i*12.9898+Math.floor(t*.0005+i*.618+seed)*3.1)*width,y=-10-((i*.37+Math.floor(t*.0005+i*.618+seed)*.53)%1)*height,s=4+tw*(i%3?5:9);spin(c,sparkArt(),x,y,s,i,alpha*tw,true);}}
function drips(c,t,count,width,height,alpha){for(let i=0;i<count;i++){const u=(i*.37+t*.00042)%1,x=Math.sin(i*3.3)*width,y=-height+u*(height+18);img(c,dropArt(),x-2,y-3,4,6,alpha*Math.sin(u*Math.PI)*.8);}}

export function drawBichLanAura(c,t,stand,layer,{motion=true,light=false,seed=0,art:a=null}={}){
 const time=motion?t:0,breathe=motion?Math.sin((time+seed)*.0021):0,hy=HALO_Y(stand);
 if(layer==='back'){
  img(c,mistArt(),-90,hy-60,180,190,.75+breathe*.05);
  if(motion)venomMist(c,time,hy+20,light?.6:1,light?3:5);
  if(!light)greenRays(c,time,hy,200+stand*30,.8+breathe*.1);
  // mãng xà trườn sau lưng, đầu nhô qua vai phải
  if(a?.serpent)spiritSerpent(c,a,time,-6,hy+40,130+stand*34,{alpha:.78,amp:light?5:7,strips:light?10:26,flip:-1}); // đầu rắn bên trái, Xà Trượng bên phải
  if(motion){venomFlames(c,time,light?5:12,34,88+stand*24,1);if(!light)pillars(c,time,4,40,1);}
  if(motion&&!light)snakeTrails(c,time,'back');
 }else if(motion){
  chestCore(c,time,stand,light?.6:1);
  if(!light)snakeTrails(c,time,'front');
  moths(c,time,light?3:8,56,110+stand*30,1,seed);
  if(!light){sparkles(c,time,8,48,100+stand*30,1,seed*.001);drips(c,time,6,40,90+stand*30,1);}
 }
}
// Xà Hoàn + phù văn + độc trì + Vạn Cổ Xà Trượng (đi theo người sở hữu).
export function drawBichLanGear(c,a,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0,hy=HALO_Y(stand);
 if(layer==='back'){
  poisonPool(c,a,time,96+stand*8,.9,motion,light);
  haloLayer(c,a,time,hy,haloWidth(stand),{motion,alpha:.92});
  img(c,smokeArt(),-40,CHEST_Y(stand)-58,80,120,.34);
  if(!light)runeRing(c,time,hy,haloWidth(stand),1);
 }else if(a?.blade){
  const h=104+stand*14,w=h*a.blade.naturalWidth/a.blade.naturalHeight,orbit=motion?Math.sin(time*.00085):0;
  c.save();c.translate(54-stand*3+orbit*4,-52-stand*14+sway*4);c.rotate(.12+sway*.05);
  glow(c,greenArt(),-w*1.4,-h*.45,w*2.8,h*.9,.32);
  img(c,a.blade,-w/2,-h/2,w,h);
  if(motion){const py=-h*.43,p=.7+.3*Math.sin(time*.005);glow(c,greenArt(),-11*p,py-11*p,22*p,22*p,.95);glow(c,lightArt(),-4,py-4,8,8,.8);
   const u=(time*.0006)%1;img(c,dropArt(),-2,py+6+u*h*.5,4,6,(1-u)*.9);
   const flare=Math.max(0,Math.sin(time*.0021))**8;spin(c,sparkArt(),0,py,10+flare*26,time*.001,flare,true);}
  c.restore();
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình 9 s: độc vụ tràn sân, đất nứt thành ĐỘC TRÌ → mãng xà trồi lên quấn vòng quanh người, độc khí xoáy vào ngực →
// CHỚP lục + mãng xà HÁ MIỆNG lao thẳng vào màn hình → vỡ thành bầy độc điệp + mưa giọt độc → hiện hình, Xà Trượng giáng xuống.
export function drawBichLanReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand),cy=CHEST_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.7:.7-.34*after);
  img(c,mistArt(),-460,-500,920,840,veil);
  if(k<reveal){
   if(motion)venomMist(c,clock*(1+charge*2),cy,ease(charge*1.4),light?4:7);
   greenRays(c,clock*(1+charge*4),hy,110+120*ease(charge),ease(charge)*.55);
   poisonPool(c,a,clock*(1+charge*3),30+70*ease(charge/.6),ease(charge/.5),motion,light);
   // mãng xà trồi khỏi độc trì, quấn vòng quanh người (xoay quanh trục dọc), lớn dần
   const rise=ease(clamp((charge-.15)/.55)),ang=clock*.0018*dir;
   if(rise>0)spiritSerpent(c,a,clock,Math.cos(ang)*40*rise,20-rise*(90+stand*20),110+120*rise,{alpha:rise*.85,amp:9,flip:Math.sin(ang)>0?1:-1,speed:1.6});
   runeRing(c,clock*(1+charge*6),hy,haloWidth(stand)*(1.6-.6*ease(charge)),ease(charge));
   haloLayer(c,a,clock,hy,haloWidth(stand)*(.55+.45*ease(charge)),{alpha:ease(charge)*.5,motion});
  }else{
   const burst=1-clamp(after/.3);
   greenRays(c,clock,hy,230+stand*30+burst*220,.8+burst*.6);
   drawBichLanAura(c,clock,stand,'back',{motion,light,seed:s,art:a});
   const pop=after<.1?.6+.55*ease(after/.1):1+.15*(1-ease((after-.1)/.12));
   poisonPool(c,a,clock,96+stand*8,.9,motion,light);
   haloLayer(c,a,clock,hy,haloWidth(stand),{pulse:pop-1,motion});
   runeRing(c,clock,hy,haloWidth(stand)*(1+burst*.5),1);
   glow(c,greenArt(),-150,hy-150,300,300,burst*.85);
  }
 }else{
  if(k<reveal){
   const n=light?14:34;
   for(let i=0;i<n;i++){const u=((i/n)+clock*.00045)%1,R=(1-ease(charge*.6+u*.4))*190+12,ang=i*2.399+dir*clock*.0016+u*3,x=Math.cos(ang)*R,y=cy+Math.sin(ang)*R*.62,size=2.2+(i%3)*1.4;
    if(i%4===3)img(c,smokeArt(),x-size*2,y-size*2,size*4,size*4,Math.min(1,charge*2)*.7);else glow(c,i%5?greenArt():violetArt(),x-size*1.6,y-size*1.6,size*3.2,size*3.2,Math.min(1,charge*2.5)*(.5+.5*u));}
   const core=clamp((charge-.6)/.4);glow(c,greenArt(),-36*core,cy-36*core,72*core,72*core,core);glow(c,lightArt(),-16*core,cy-16*core,32*core,32*core,core);
   if(!light)snakeTrails(c,clock*(1+charge*2),'front',{alpha:ease(charge),count:3,rx:30+30*ease(charge)});
  }else{
   const flash=1-clamp(after/.08);
   if(flash>0){glow(c,lightArt(),-190,-250,380,380,flash);glow(c,greenArt(),-140,hy-140,280,280,flash);}
   // mãng xà há miệng lao thẳng vào màn hình (phóng to + mờ dần)
   const strike=clamp(after/.22);if(strike<1&&a?.serpent){const big=1+ease(strike)*3.2;spiritSerpent(c,a,clock,0,cy-10-strike*30,200*big,{alpha:(1-strike)*.9,amp:12,flip:dir,speed:2.4});}
   for(const [delay,color,width] of [[0,'#03140acc',8],[.04,'#eaffd8',2.6],[.1,'#5cff8a',1.4],[.16,'#b06bff',1.2]]){const u=clamp((after-delay)/.34);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.9;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);c.beginPath();c.ellipse(0,22,34+u*200,9+u*46,0,0,TAU);c.stroke();c.restore();}
   // vỡ thành bầy độc điệp + mưa giọt độc
   const pop=clamp((after-.12)/.4);if(pop>0&&pop<1){const n=light?8:22;for(let i=0;i<n;i++){const ang=i/n*TAU+s,r=20+ease(pop)*150,x=Math.cos(ang)*r,y=cy-20+Math.sin(ang)*r*.75-pop*30,flap=.35+.65*Math.abs(Math.sin(clock*.02+i)),sz=6+(i%3)*2;
     c.save();c.translate(x,y);c.rotate(ang+Math.PI/2);c.globalCompositeOperation='lighter';c.globalAlpha*=(1-pop);c.save();c.scale(flap,1);c.drawImage(wingArt(),0,-sz,sz*2,sz*2);c.restore();c.save();c.scale(-flap,1);c.drawImage(wingArt(),0,-sz,sz*2,sz*2);c.restore();c.restore();
     if(i%2)img(c,dropArt(),x*.7-2,y+pop*60-3,4,6,(1-pop)*.9);}}
   // Vạn Cổ Xà Trượng giáng xuống, kéo vệt độc
   const land=ease(clamp((after-.1)/.22));
   if(a?.blade){if(land<1){const h=118,w=h*a.blade.naturalWidth/a.blade.naturalHeight,x=54*land-dir*40*(1-land),y=-66-280*(1-land);
     for(let j=1;j<8;j++)glow(c,j%2?lightArt():greenArt(),x-dir*j*6*(1-land)-8,y-j*22*(1-land)-8,16,16,(1-land)*(1-j/8));
     c.save();c.translate(x,y);c.rotate(.12+(1-land)*TAU*dir);glow(c,greenArt(),-w*1.6,-h*.6,w*3.2,h*1.2,.85*(1-land));img(c,a.blade,-w/2,-h/2,w,h);c.restore();}
    else drawBichLanGear(c,a,clock,{stand},'front',{motion,light});}
   drawBichLanAura(c,clock,stand,'front',{motion,light,seed:s,art:a});
  }
 }
 c.restore();
}
