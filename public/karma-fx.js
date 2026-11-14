// 14/11 v2: Nhân Quả Vương Lâm — hào quang kim sắc (ảnh user) là tâm điểm; trắng đen chỉ làm nền
// (khói mực sau lưng, hạt sáng trắng, lõi âm dương nhỏ giữa pháp trận). Bỏ dây/chữ bay của v1 (user chê rối).
// Toạ độ giống black-gold-fx: gốc ở chân nhân vật, đứng cao ~125, ngồi ~91. Texture dựng sẵn 1 lần, không filter/shadowBlur.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const WHITE='#f7f6f2',INK='#060608';
// Tâm vòng trong của ảnh hào quang (đo trên halo-gold.webp) — đầu nhân vật nằm đúng giữa lỗ.
const RING_X=.507,RING_Y=.488;
const HALO_Y=stand=>-56-stand*28;
const haloWidth=stand=>84+stand*16;
let mist,light,warm,taiji;

function radial(size,stops){
 const canvas=makeSurface(size,size);if(!canvas)return null;
 const c=canvas.getContext('2d'),r=size/2,g=c.createRadialGradient(r,r,1,r,r,r);
 for(const [at,color] of stops)g.addColorStop(at,color);
 c.fillStyle=g;c.fillRect(0,0,size,size);return canvas;
}
const mistArt=()=>mist??=radial(160,[[0,'#000000a8'],[.5,'#05050870'],[.8,'#0a0a0e26'],[1,'#00000000']]);
const lightArt=()=>light??=radial(128,[[0,'#ffffffff'],[.2,'#ffffffcc'],[.55,'#f0f0ff50'],[1,'#ffffff00']]);
const warmArt=()=>warm??=radial(128,[[0,'#fff1c0d0'],[.35,'#ffc96a70'],[.7,'#c47cff22'],[1,'#ffb34000']]);
// Lõi âm dương nhỏ giữa pháp trận dưới chân.
function taijiArt(){
 if(taiji)return taiji;
 const canvas=makeSurface(128,128);if(!canvas)return null;
 const c=canvas.getContext('2d'),R=56;c.translate(64,64);
 c.beginPath();c.arc(0,0,R,-Math.PI/2,Math.PI/2);c.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2);c.closePath();c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,Math.PI/2,-Math.PI/2);c.arc(0,-R/2,R/2,-Math.PI/2,Math.PI/2,true);c.arc(0,R/2,R/2,-Math.PI/2,Math.PI/2);c.closePath();c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,-R/2,R/7,0,TAU);c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,R/2,R/7,0,TAU);c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,0,TAU);c.strokeStyle='#ffe2a0';c.lineWidth=3;c.stroke();
 return taiji=canvas;
}
function img(c,im,x,y,w,h,alpha=1){
 if(!im||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
function glow(c,im,x,y,w,h,alpha){
 if(!im||alpha<=0)return;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
// Hào quang: ảnh tĩnh (hoa văn có chiều trên/dưới nên không xoay), "thở" nhẹ + quầng sáng lấp lánh.
function halo(c,art,t,cx,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!art?.halo)return;
 const k=1+pulse+(motion?Math.sin(t*.0017)*.015:0),w=width*k,h=w*art.halo.naturalHeight/art.halo.naturalWidth;
 glow(c,warmArt(),cx-w*.62,cy-w*.62,w*1.24,w*1.24,(.34+(motion?Math.sin(t*.0023)*.08:0))*alpha);
 img(c,art.halo,cx-w*RING_X,cy-h*RING_Y,w,h,alpha);
 // Vệt sáng quét vòng quanh vành (cho cảm giác đang vận chuyển, ảnh vẫn đứng yên)
 if(motion){const a=t*.0011,r=w*.33;glow(c,lightArt(),cx+Math.cos(a)*r-w*.07,cy+Math.sin(a)*r-w*.07,w*.14,w*.14,.75*alpha);}
}
// Pháp trận dưới chân = chính hào quang nằm ngửa + lõi âm dương.
function floorRing(c,art,t,width,alpha,motion=true){
 if(alpha<=0)return;
 c.save();c.translate(0,22);c.scale(1,.26);
 if(art?.halo){const w=width,h=w*art.halo.naturalHeight/art.halo.naturalWidth;img(c,art.halo,-w*RING_X,-h*RING_Y,w,h,alpha*.8);}
 c.rotate(motion?t*.0006:0);const r=width*.2;img(c,taijiArt(),-r,-r,2*r,2*r,alpha*.95);
 c.restore();
}
// Hạt: điểm sáng trắng bay lên, vài mảnh tro mực rơi.
function motes(c,t,count,width,seed=0,height=130){
 for(let i=0;i<count;i++){
  const up=i%3!==2,u=(i*.618+(t+seed)*(up?.00034:.00024))%1;
  const x=Math.sin(i*2.399+u*1.7)*width*(.35+.65*((i*.37)%1)),y=up?20-u*height:-height+u*(height+16);
  const a=Math.sin(u*Math.PI)*.9;
  if(up){const s=2.6+(i%4);glow(c,lightArt(),x-s,y-s,2*s,2*s,a);}
  else{c.save();c.globalAlpha*=a*.8;c.translate(x,y);c.rotate(u*6+i);c.fillStyle=INK;c.fillRect(-1.5,-.6,3,1.2);c.restore();}
 }
}

export function drawKarmaAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,breathe=motion?Math.sin((time+seed)*.0021):0;
 if(layer==='back'){
  img(c,mistArt(),-70,HALO_Y(stand)-48,140,150,.62+breathe*.05);
 }else if(motion){
  motes(c,time,light?5:12,56,seed);
 }
}

// Hào quang sau đầu + Xích Long Thương lơ lửng (đi theo người sở hữu).
export function drawKarmaGear(c,art,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0;
 if(layer==='back'){
  floorRing(c,art,time,92+stand*8,.85,motion);
  halo(c,art,time,0,HALO_Y(stand),haloWidth(stand),{motion:motion&&!light});
 }else if(art.blade){
  const h=96+stand*14,w=h*art.blade.naturalWidth/art.blade.naturalHeight;
  c.save();c.translate(50-stand*3,-48-stand*14+sway*2.4);c.rotate(.16+sway*.03);
  glow(c,warmArt(),-w*.9,-h*.42,w*1.8,h*.84,.28);
  img(c,art.blade,-w/2,-h/2,w,h);
  if(motion&&!light){const u=(time%1800)/1800;glow(c,lightArt(),-8,h*.36-u*h*.78-8,16,16,.9*Math.sin(u*Math.PI));}
  c.restore();
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình 8 s: trời tối, hạt sáng xoáy vào → hào quang hiện dần sau lưng → chớp trắng + sóng mực
// → hào quang bung, thương giáng xuống tay. Biến thể theo id sự kiện (chiều xoáy, hướng thương rơi).
export function drawKarmaReveal(c,t,k,target,layer,reveal,art,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,mirror=(s>>1)%2?-1:1;
 const charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.58:.58-.3*after);
  img(c,mistArt(),-430,-480,860,800,veil);
  if(k<reveal){
   // Hào quang hiện dần, mờ như sương, chưa có pháp trận
   halo(c,art,clock,0,hy,haloWidth(stand)*(.55+.45*ease(charge)),{alpha:ease(charge)*.55,motion});
   floorRing(c,art,clock*(1+charge*3),(40+60*ease(charge)),ease(charge)*.7,motion);
  }else{
   drawKarmaAura(c,clock,stand,'back',{motion,light,seed:s});
   const pop=after<.1?.6+.55*ease(after/.1):1+.15*(1-ease((after-.1)/.12));
   floorRing(c,art,clock,92+stand*8,.85,motion);
   halo(c,art,clock,0,hy,haloWidth(stand),{pulse:pop-1,motion});
   const burst=1-clamp(after/.25);glow(c,warmArt(),-130,hy-130,260,260,burst*.9);
  }
 }else{
  if(k<reveal){
   // Hạt sáng xoáy vào thân (không dùng dây)
   const n=light?14:30;
   for(let i=0;i<n;i++){
    const u=((i/n)+clock*.00045)%1,R=(1-ease(charge*.6+u*.4))*170+14,a=i*2.399+dir*clock*.0016+u*3;
    const x=Math.cos(a)*R*mirror,y=-52+Math.sin(a)*R*.62,size=2.2+(i%3)*1.4;
    glow(c,lightArt(),x-size,y-size,2*size,2*size,Math.min(1,charge*2.5)*(.5+.5*u));
   }
   const core=clamp((charge-.65)/.35);
   glow(c,lightArt(),-26*core,-52-26*core,52*core,52*core,core);
  }else{
   const flash=1-clamp(after/.08);
   if(flash>0){glow(c,lightArt(),-170,-230,340,340,flash);glow(c,warmArt(),-120,hy-120,240,240,flash);}
   // Sóng mực + sóng sáng sát mặt đất
   for(const [delay,color,width] of [[0,'#000000cc',7],[.05,'#fff6dd',2.4]]){
    const u=clamp((after-delay)/.3);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.9;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);
    c.beginPath();c.ellipse(0,22,34+u*170,9+u*40,0,0,TAU);c.stroke();c.restore();
   }
   // Xích Long Thương giáng xuống tay
   const land=ease(clamp((after-.04)/.18));
   if(art?.blade){
    if(land<1){
     const h=110,w=h*art.blade.naturalWidth/art.blade.naturalHeight,x=52*land+mirror*30*(1-land),y=-64-260*(1-land);
     c.save();c.translate(x,y);c.rotate(.16+(1-land)*TAU*dir);
     glow(c,warmArt(),-w*1.2,-h*.6,w*2.4,h*1.2,.8*(1-land));
     img(c,art.blade,-w/2,-h/2,w,h);c.restore();
    }else drawKarmaGear(c,art,clock,{stand},'front',{motion,light});
   }
   drawKarmaAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
