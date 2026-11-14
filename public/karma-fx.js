// 14/11 v3: Nhân Quả Vương Lâm — hiệu ứng nhiều lớp theo cách làm skin cao cấp (LoL/Godforge):
// nền tối làm nổi sáng · tia thần quang sau lưng · hào quang kim sắc (ảnh user) · luân ấn nhân quả quay ·
// lửa âm dương (khói mực + lửa trắng) bốc từ pháp trận · cột sáng · lõi sáng ở ngực · song châu âm dương
// bay vòng có đuôi (một sáng một tối) · sao lấp lánh · thương có dòng sáng + chớp sao ở mũi.
// Toạ độ: gốc ở chân nhân vật, đứng cao ~125, ngồi ~91. Texture dựng sẵn 1 lần; không filter/shadowBlur.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const WHITE='#f7f6f2',INK='#060608';
// Tâm vòng trong của ảnh hào quang (đo trên halo-gold.webp) — đầu nhân vật nằm giữa lỗ.
const RING_X=.507,RING_Y=.488;
const HALO_Y=stand=>-56-stand*28;
const CHEST_Y=stand=>-36-stand*30;
const haloWidth=stand=>84+stand*16;
const art={};

function surface(size,draw){const canvas=makeSurface(size,size);if(!canvas)return null;draw(canvas.getContext('2d'),size/2);return canvas;}
function radial(size,stops){
 return surface(size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});
}
const mistArt=()=>art.mist??=radial(160,[[0,'#000000b0'],[.5,'#05050878'],[.8,'#0a0a0e2a'],[1,'#00000000']]);
const lightArt=()=>art.light??=radial(128,[[0,'#ffffffff'],[.2,'#ffffffcc'],[.55,'#f0f0ff50'],[1,'#ffffff00']]);
const warmArt=()=>art.warm??=radial(128,[[0,'#fff1c0d8'],[.35,'#ffc96a78'],[.7,'#c47cff24'],[1,'#ffb34000']]);
const smokeArt=()=>art.smoke??=radial(96,[[0,'#000000c8'],[.45,'#00000070'],[1,'#00000000']]);
// Tia thần quang: 18 nan sáng, nan dài nan ngắn, mờ dần ra ngoài.
const raysArt=()=>art.rays??=surface(320,(c,r)=>{
 c.translate(r,r);
 for(let i=0;i<18;i++){
  const a=i/18*TAU,len=r*(i%2?.72:1),w=i%3?.055:.09;
  const g=c.createLinearGradient(0,0,Math.cos(a)*len,Math.sin(a)*len);
  g.addColorStop(0,'#fff8e0d0');g.addColorStop(.35,i%2?'#ffe3a060':'#ffffff80');g.addColorStop(1,'#ffd08000');
  c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,len,a-w,a+w);c.closePath();c.fill();
 }
});
// Sao 4 cánh (lấp lánh)
const starArt=()=>art.star??=surface(64,(c,r)=>{
 c.translate(r,r);
 for(const [w,h] of [[30,2.2],[2.2,30]]){const g=c.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#fff4d0a0');g.addColorStop(1,'#ffe0a000');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();
});
// Luân ấn nhân quả: vòng ngoài vạch chia + 12 ấn hình thoi xen trắng/mực.
const runeArt=()=>art.rune??=surface(256,(c,r)=>{
 c.translate(r,r);c.lineCap='round';
 const ring=(rad,color,w,dash)=>{c.save();c.setLineDash(dash||[]);c.beginPath();c.arc(0,0,rad,0,TAU);c.strokeStyle=color;c.lineWidth=w;c.stroke();c.restore();};
 ring(122,'#00000080',5);ring(122,'#fff6dc',1.6);ring(112,'#ffffffa0',1,[3,7]);ring(100,'#ffe2a080',1);
 for(let i=0;i<12;i++){
  c.save();c.rotate(i*TAU/12);c.translate(0,-117);
  c.beginPath();c.moveTo(0,-7);c.lineTo(4.5,0);c.lineTo(0,7);c.lineTo(-4.5,0);c.closePath();
  c.fillStyle=i%2?INK:WHITE;c.fill();c.strokeStyle=i%2?'#fff6dc':'#000000';c.lineWidth=1.2;c.stroke();c.restore();
 }
});
// Lõi âm dương giữa pháp trận.
const taijiArt=()=>art.taiji??=surface(128,(c,r)=>{
 const R=56;c.translate(r,r);
 c.beginPath();c.arc(0,0,R,-Math.PI/2,Math.PI/2);c.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2);c.closePath();c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,Math.PI/2,-Math.PI/2);c.arc(0,-R/2,R/2,-Math.PI/2,Math.PI/2,true);c.arc(0,R/2,R/2,-Math.PI/2,Math.PI/2);c.closePath();c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,-R/2,R/7,0,TAU);c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,R/2,R/7,0,TAU);c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,0,TAU);c.strokeStyle='#ffe2a0';c.lineWidth=3;c.stroke();
});
// Cột sáng mảnh từ pháp trận
const pillarArt=()=>art.pillar??=(()=>{const canvas=makeSurface(32,256);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,256,0,0);g.addColorStop(0,'#ffffffd0');g.addColorStop(.4,'#fff0c050');g.addColorStop(1,'#ffffff00');
 const h=c.createLinearGradient(0,0,32,0);h.addColorStop(0,'#ffffff00');h.addColorStop(.5,'#ffffffff');h.addColorStop(1,'#ffffff00');
 c.fillStyle=g;c.fillRect(0,0,32,256);c.globalCompositeOperation='destination-in';c.fillStyle=h;c.fillRect(0,0,32,256);return canvas;})();

function img(c,im,x,y,w,h,alpha=1){
 if(!im||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
function glow(c,im,x,y,w,h,alpha){
 if(!im||alpha<=0)return;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
function spin(c,im,x,y,size,angle,alpha,add=false){
 if(!im||alpha<=0)return;
 c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();
}

// ---- Các lớp ----
function godRays(c,t,cy,size,alpha){
 spin(c,raysArt(),0,cy,size,t*.00012,alpha*.55,true);
 spin(c,raysArt(),0,cy,size*.78,-t*.00019+.4,alpha*.4,true);
}
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;
 const k=1+pulse+(motion?Math.sin(t*.0017)*.015:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 glow(c,warmArt(),-w*.62,cy-w*.62,w*1.24,w*1.24,(.36+(motion?Math.sin(t*.0023)*.08:0))*alpha);
 img(c,a.halo,-w*RING_X,cy-h*RING_Y,w,h,alpha);
 if(motion){for(let i=0;i<2;i++){const ang=t*.0011+i*Math.PI,r=w*.335;glow(c,lightArt(),Math.cos(ang)*r-w*.07,cy+Math.sin(ang)*r-w*.07,w*.14,w*.14,.8*alpha);}}
}
function runeRing(c,t,cy,width,alpha){spin(c,runeArt(),0,cy,width*.62,-t*.00035,alpha*.9);}
function floorRing(c,a,t,width,alpha,motion=true){
 if(alpha<=0)return;
 c.save();c.translate(0,22);c.scale(1,.26);
 glow(c,warmArt(),-width*.7,-width*.7,width*1.4,width*1.4,alpha*.5);
 if(a?.halo){const w=width,h=w*a.halo.naturalHeight/a.halo.naturalWidth;img(c,a.halo,-w*RING_X,-h*RING_Y,w,h,alpha*.85);}
 spin(c,runeArt(),0,0,width*1.18,motion?-t*.0003:0,alpha*.7);
 spin(c,taijiArt(),0,0,width*.4,motion?t*.0007:0,alpha*.95);
 c.restore();
}
// Lửa âm dương: khói mực bốc lên phía sau (tối, tăng chiều sâu) + lưỡi lửa trắng cộng sáng.
function yinYangFlame(c,t,count,spread,height,alpha){
 for(let i=0;i<count;i++){
  const u=(i/count+t*.00042)%1,side=((i*7)%count/count-.5)*2,x=side*spread*(1-u*.4)+Math.sin(u*5+i)*6,y=20-u*height;
  const s=10+u*22;
  img(c,smokeArt(),x-s/2,y-s/2,s,s,alpha*Math.sin(u*Math.PI)*.55);
 }
 for(let i=0;i<count;i++){
  const u=(i/count+.5/count+t*.0006)%1,side=((i*5)%count/count-.5)*2,x=side*spread*.8*(1-u*.5)+Math.sin(u*7+i*2)*4,y=20-u*height*.85;
  const s=7+(1-u)*9;
  glow(c,lightArt(),x-s/2,y-s*.9,s,s*1.8,alpha*Math.sin(u*Math.PI)*.55);
 }
}
function pillars(c,t,count,spread,alpha){
 for(let i=0;i<count;i++){
  const ph=(t*.0005+i*.37)%1,x=Math.sin(i*2.1+1)*spread,h=60+40*Math.sin(i*1.7+t*.001),a=Math.sin(ph*Math.PI);
  glow(c,pillarArt(),x-3,20-h,6,h,alpha*a*.5);
 }
}
function chestCore(c,t,stand,alpha){
 const y=CHEST_Y(stand),p=.75+.25*Math.sin(t*.004);
 glow(c,warmArt(),-18*p,y-18*p,36*p,36*p,alpha*.7);
 glow(c,lightArt(),-6,y-6,12,12,alpha*.55*p);
}
// Song châu âm dương bay vòng elip quanh người, một trắng một mực, có đuôi (đuôi sáng cộng / đuôi tối phủ).
function twinOrbs(c,t,stand,alpha,segments){
 const cy=-46-stand*24,rx=40,ry=12+stand*4;
 for(const [phase,white] of [[0,true],[Math.PI,false]]){
  for(let j=segments;j>=0;j--){
   const a=t*.0016+phase-j*.07,x=Math.cos(a)*rx,y=cy+Math.sin(a)*ry+Math.sin(a*2)*10,front=Math.sin(a)>0;
   const s=(j?5.5*(1-j/segments):8),fade=alpha*(j?.6*(1-j/segments):1);
   if(white)glow(c,lightArt(),x-s,y-s,2*s,2*s,fade*(front?1:.6));
   else{img(c,smokeArt(),x-s*1.2,y-s*1.2,2.4*s,2.4*s,fade*(front?1:.6));if(!j){glow(c,warmArt(),x-7,y-7,14,14,alpha*.8);c.save();c.globalAlpha*=alpha*(front?1:.7);const g=c.createRadialGradient(x-1,y-1,.3,x,y,3.2);g.addColorStop(0,'#5a5a66');g.addColorStop(.6,'#0b0b10');g.addColorStop(1,'#000');c.beginPath();c.arc(x,y,3.2,0,TAU);c.fillStyle=g;c.fill();c.restore();}}
  }
 }
}
function sparkles(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){
  const cyc=(t*.00055+i*.618+seed)%1,tw=Math.sin(cyc*Math.PI);if(tw<.05)continue;
  const x=Math.sin(i*12.9898+Math.floor(t*.00055+i*.618+seed)*3.1)*width,y=-10-((i*.37+Math.floor(t*.00055+i*.618+seed)*.53)%1)*height;
  const s=4+tw*(i%3?6:11);spin(c,starArt(),x,y,s,i,alpha*tw,true);
 }
}
function motes(c,t,count,width,seed=0,height=130){
 for(let i=0;i<count;i++){
  const up=i%3!==2,u=(i*.618+(t+seed)*(up?.00034:.00024))%1;
  const x=Math.sin(i*2.399+u*1.7)*width*(.35+.65*((i*.37)%1)),y=up?20-u*height:-height+u*(height+16);
  const a=Math.sin(u*Math.PI)*.9;
  if(up){const s=2.2+(i%4);glow(c,lightArt(),x-s,y-s,2*s,2*s,a);}
  else{c.save();c.globalAlpha*=a*.8;c.translate(x,y);c.rotate(u*6+i);c.fillStyle=INK;c.fillRect(-1.5,-.6,3,1.2);c.restore();}
 }
}

function karmaThreads(c,t,stand,layer,light){
 const count=light?2:4,cy=CHEST_Y(stand)+8;
 c.save();c.lineCap='round';
 for(let i=0;i<count;i++){
  const phase=t*.0008+i*TAU/count,front=Math.sin(phase)>0;
  if(front!==(layer==='front'))continue;
  c.beginPath();
  for(let j=0;j<=20;j++){
   const a=phase-j*.055,x=Math.cos(a)*(42+stand*6),y=cy+Math.sin(a)*14+Math.sin(a*2)*8;
   if(j===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.strokeStyle=i%2?'#101018c9':'#f8f5e9bb';c.lineWidth=i%2?2.5:1.2;c.stroke();
  const x=Math.cos(phase)*(42+stand*6),y=cy+Math.sin(phase)*14+Math.sin(phase*2)*8;
  glow(c,i%2?warmArt():lightArt(),x-5,y-5,10,10,.75);
 }
 c.restore();
}

export function drawKarmaAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,breathe=motion?Math.sin((time+seed)*.0021):0,hy=HALO_Y(stand);
 if(motion)karmaThreads(c,time+seed,stand,layer,light);
 if(layer==='back'){
  img(c,mistArt(),-78,hy-56,156,170,.66+breathe*.05);
  if(!light)godRays(c,time,hy,200+stand*30,.85+breathe*.1);
  if(motion){yinYangFlame(c,time,light?5:11,34,90+stand*24,1);if(!light)pillars(c,time,5,40,1);}
 }else if(motion){
  chestCore(c,time,stand,light?.6:1);
  twinOrbs(c,time,stand,1,light?3:8);
  if(!light)sparkles(c,time,9,48,100+stand*30,1,seed*.001);
  motes(c,time,light?4:10,56,seed);
 }
}

// Hào quang + luân ấn + pháp trận + Xích Long Thương (đi theo người sở hữu).
export function drawKarmaGear(c,a,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0,hy=HALO_Y(stand);
 if(layer==='back'){
  floorRing(c,a,time,96+stand*8,.9,motion);
  haloLayer(c,a,time,hy,haloWidth(stand),{motion});
  runeRing(c,time,hy,haloWidth(stand),light?.6:1);
 }else if(a.blade){
  const h=96+stand*14,w=h*a.blade.naturalWidth/a.blade.naturalHeight;
  const orbit=motion?Math.sin(time*.00085):0;
  c.save();c.translate(50-stand*3+orbit*4,-48-stand*14+sway*4);c.rotate(.16+sway*.065);
  glow(c,warmArt(),-w*.9,-h*.42,w*1.8,h*.84,.32);
  img(c,a.blade,-w/2,-h/2,w,h);
  if(motion){
   const streams=light?2:3;
   for(let i=0;i<streams;i++){const u=((time/1800)+i/streams)%1;glow(c,lightArt(),-6,h*.36-u*h*.78-6,12,12,.85*Math.sin(u*Math.PI));}
   c.save();c.translate(0,-h*.43);
   for(let i=0;i<(light?2:4);i++){
    const u=(time*.00055+i*.25)%1,angle=time*.0014+i*Math.PI/2,r=5+u*14;
    c.beginPath();c.ellipse(0,0,r,r*.45,angle,0,TAU);
    c.strokeStyle=i%2?'#14141dcc':'#fff3c8';c.lineWidth=i%2?2:1;c.globalAlpha=1-u;c.stroke();
   }
   c.restore();
   const flare=Math.max(0,Math.sin(time*.0021))**8;spin(c,starArt(),0,-h*.47,10+flare*26,time*.001,flare,true);
  }
  c.restore();
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình 8 s: trời tối, lửa âm dương bốc, hạt sáng xoáy vào ngực → luân ấn + hào quang hiện dần
// → chớp sáng + thần quang bùng + sóng mực/sóng sáng → hào quang bung, thương giáng, sao nổ.
export function drawKarmaReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,mirror=(s>>1)%2?-1:1;
 const charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.6:.6-.3*after);
  img(c,mistArt(),-430,-480,860,800,veil);
  if(k<reveal){
   godRays(c,clock*(1+charge*4),hy,(120+120*ease(charge)),ease(charge)*.6);
   if(motion)yinYangFlame(c,clock*(1+charge),light?6:14,30+charge*20,70+charge*70,ease(charge*1.5));
   runeRing(c,clock*(1+charge*6),hy,haloWidth(stand)*(1.6-.6*ease(charge)),ease(charge));
   haloLayer(c,a,clock,hy,haloWidth(stand)*(.55+.45*ease(charge)),{alpha:ease(charge)*.5,motion});
   floorRing(c,a,clock*(1+charge*3),(40+64*ease(charge)),ease(charge)*.8,motion);
  }else{
   const burst=1-clamp(after/.3);
   godRays(c,clock,hy,230+stand*30+burst*200,.85+burst*.6);
   drawKarmaAura(c,clock,stand,'back',{motion,light,seed:s});
   const pop=after<.1?.6+.55*ease(after/.1):1+.15*(1-ease((after-.1)/.12));
   floorRing(c,a,clock,96+stand*8,.9,motion);
   haloLayer(c,a,clock,hy,haloWidth(stand),{pulse:pop-1,motion});
   runeRing(c,clock,hy,haloWidth(stand)*(1+burst*.5),1);
   glow(c,warmArt(),-140,hy-140,280,280,burst*.9);
  }
 }else{
  if(k<reveal){
   const n=light?14:34,cy=CHEST_Y(stand);
   for(let i=0;i<n;i++){
    const u=((i/n)+clock*.00045)%1,R=(1-ease(charge*.6+u*.4))*180+12,ang=i*2.399+dir*clock*.0016+u*3;
    const x=Math.cos(ang)*R*mirror,y=cy+Math.sin(ang)*R*.62,size=2.2+(i%3)*1.4;
    if(i%4===3)img(c,smokeArt(),x-size*2,y-size*2,size*4,size*4,Math.min(1,charge*2)*.7);
    else glow(c,lightArt(),x-size,y-size,2*size,2*size,Math.min(1,charge*2.5)*(.5+.5*u));
   }
   const core=clamp((charge-.6)/.4);
   glow(c,warmArt(),-34*core,cy-34*core,68*core,68*core,core);
   glow(c,lightArt(),-16*core,cy-16*core,32*core,32*core,core);
   if(!light)sparkles(c,clock,8,60,140,charge,s*.01);
  }else{
   const flash=1-clamp(after/.08);
   if(flash>0){glow(c,lightArt(),-180,-240,360,360,flash);glow(c,warmArt(),-130,hy-130,260,260,flash);}
   for(const [delay,color,width] of [[0,'#000000cc',8],[.04,'#fff6dd',2.6],[.1,'#ffd890',1.4]]){
    const u=clamp((after-delay)/.32);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.9;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);
    c.beginPath();c.ellipse(0,22,34+u*190,9+u*44,0,0,TAU);c.stroke();c.restore();
   }
   // Sao nổ toả ra sau chớp
   const pop=clamp(after/.25);
   if(pop<1){const n=light?6:14;for(let i=0;i<n;i++){const ang=i/n*TAU+s,r=20+ease(pop)*120;spin(c,starArt(),Math.cos(ang)*r,CHEST_Y(stand)+Math.sin(ang)*r*.7,8+12*(1-pop),ang,1-pop,true);}}
   const land=ease(clamp((after-.04)/.18));
   if(a?.blade){
    if(land<1){
     const h=110,w=h*a.blade.naturalWidth/a.blade.naturalHeight,x=52*land+mirror*30*(1-land),y=-64-260*(1-land);
     c.save();c.translate(x,y);c.rotate(.16+(1-land)*TAU*dir);
     glow(c,warmArt(),-w*1.2,-h*.6,w*2.4,h*1.2,.8*(1-land));
     img(c,a.blade,-w/2,-h/2,w,h);c.restore();
    }else drawKarmaGear(c,a,clock,{stand},'front',{motion,light});
   }
   drawKarmaAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
