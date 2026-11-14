// 14/11: Nhân Quả Vương Lâm — hiệu ứng trắng đen (âm dương nhân quả).
// Toạ độ giống black-gold-fx: gốc ở chân nhân vật, đứng cao ~125, ngồi ~91. Mọi texture dựng sẵn 1 lần,
// mỗi khung chỉ drawImage + vài nét cong → rẻ khi sân đông. Không dùng filter/shadowBlur.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const WHITE='#f7f6f2',INK='#060608',SILVER='#c9c9cf';
let mist,light,seal,inkDisc,glyphs;
const HALO_Y=stand=>-50-stand*30; // tâm hào quang ngang đầu (ngồi/đứng)

function radial(size,stops){
 const canvas=makeSurface(size,size);if(!canvas)return null;
 const c=canvas.getContext('2d'),r=size/2,g=c.createRadialGradient(r,r,1,r,r,r);
 for(const [at,color] of stops)g.addColorStop(at,color);
 c.fillStyle=g;c.fillRect(0,0,size,size);return canvas;
}
// Quầng mực đen phía sau người: làm nổi viền áo trắng trên mọi nền map.
const mistArt=()=>mist??=radial(160,[[0,'#000000b8'],[.45,'#05050888'],[.78,'#0a0a0e30'],[1,'#00000000']]);
// Quầng sáng trắng (lõi chớp, hạt sáng).
const lightArt=()=>light??=radial(128,[[0,'#ffffffff'],[.22,'#ffffffc8'],[.55,'#e8e8f055'],[1,'#ffffff00']]);
const inkArt=()=>inkDisc??=radial(128,[[0,'#000000f0'],[.5,'#000000a0'],[1,'#00000000']]);

// Pháp trận Thái Cực dưới chân: vòng ngoài trắng, vòng mực, 8 quẻ, lõi âm dương.
function sealArt(){
 if(seal)return seal;
 const canvas=makeSurface(320,320);if(!canvas)return null;
 const c=canvas.getContext('2d');c.translate(160,160);c.lineCap='round';
 const ring=(r,color,w,dash)=>{c.save();c.setLineDash(dash||[]);c.beginPath();c.arc(0,0,r,0,TAU);c.strokeStyle=color;c.lineWidth=w;c.stroke();c.restore();};
 ring(152,'#00000099',10);ring(150,WHITE,2.6);ring(141,'#ffffff55',1.2,[2,6]);ring(118,INK,7);ring(118,'#ffffffaa',1.4);ring(92,'#ffffff70',1.1,[10,5,2,5]);
 // Bát quái: mỗi quẻ 3 vạch liền/đứt
 const trigrams=[[1,1,1],[0,0,0],[1,0,0],[0,1,1],[0,1,0],[1,0,1],[0,0,1],[1,1,0]];
 for(let i=0;i<8;i++){
  c.save();c.rotate(i*TAU/8);
  for(let j=0;j<3;j++){
   const y=-136+j*6.5;c.strokeStyle=i%2?WHITE:SILVER;c.lineWidth=3.2;c.beginPath();
   if(trigrams[i][j]){c.moveTo(-15,y);c.lineTo(15,y);}else{c.moveTo(-15,y);c.lineTo(-4,y);c.moveTo(4,y);c.lineTo(15,y);}
   c.stroke();
  }
  c.strokeStyle='#ffffffb0';c.lineWidth=1.3;c.beginPath();c.moveTo(0,-112);c.lineTo(6,-101);c.lineTo(0,-96);c.lineTo(-6,-101);c.closePath();c.stroke();
  c.restore();
 }
 // Lõi âm dương
 const R=58;
 c.beginPath();c.arc(0,0,R+3,0,TAU);c.fillStyle='#000000aa';c.fill();
 c.beginPath();c.arc(0,0,R,-Math.PI/2,Math.PI/2);c.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2);c.closePath();
 c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,Math.PI/2,-Math.PI/2);c.arc(0,-R/2,R/2,-Math.PI/2,Math.PI/2,true);c.arc(0,R/2,R/2,-Math.PI/2,Math.PI/2);c.closePath();
 c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,-R/2,R/7,0,TAU);c.fillStyle=INK;c.fill();
 c.beginPath();c.arc(0,R/2,R/7,0,TAU);c.fillStyle=WHITE;c.fill();
 c.beginPath();c.arc(0,0,R,0,TAU);c.strokeStyle=SILVER;c.lineWidth=2;c.stroke();
 return seal=canvas;
}
// Chữ 因 / 果 (nhân / quả) trắng viền mực — dựng sẵn.
function glyphArt(){
 if(glyphs)return glyphs;
 glyphs=['因','果'].map((ch,i)=>{
  const canvas=makeSurface(64,64);if(!canvas)return null;
  const c=canvas.getContext('2d');c.textAlign='center';c.textBaseline='middle';
  c.font='700 44px "Microsoft YaHei","Noto Serif CJK SC",serif';
  c.lineWidth=6;c.strokeStyle=i?WHITE:INK;c.strokeText(ch,32,34);c.fillStyle=i?INK:WHITE;c.fillText(ch,32,34);
  return canvas;
 });
 return glyphs;
}
function img(c,im,x,y,w,h,alpha=1){
 if(!im||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
function floorSeal(c,t,r,y,alpha=.9,spin=1){
 c.save();c.translate(0,y);c.scale(1,.24);c.rotate(t*.00032*spin);
 img(c,sealArt(),-r,-r,2*r,2*r,alpha);c.restore();
}
// Tơ nhân quả: sợi trắng và sợi mực (viền trắng mảnh để thấy trên nền tối) uốn từ pháp trận lên trời.
function karmaThreads(c,t,count,height,spread,alpha,seed=0){
 if(alpha<=0)return;
 c.save();c.lineCap='round';
 for(let i=0;i<count;i++){
  const side=i%2?1:-1,ph=t*.0011+i*1.7+seed,base=side*(10+(i>>1)*9);
  const x1=base+Math.sin(ph)*spread*.35,x2=side*spread*(.55+.2*Math.sin(ph*.7+i)),top=-height-(i%3)*14;
  const path=()=>{c.beginPath();c.moveTo(base*.6,18);c.bezierCurveTo(x1,-height*.25,x2,-height*.7,side*spread*.32+Math.sin(ph*1.3)*8,top);};
  const a=alpha*(.55+.45*Math.sin(ph*.8+1));
  if(i%2){c.globalAlpha=a*.9;c.strokeStyle='#ffffff66';c.lineWidth=3.2;path();c.stroke();c.globalAlpha=a;c.strokeStyle=INK;c.lineWidth=1.6;path();c.stroke();}
  else{c.globalAlpha=a*.35;c.strokeStyle='#ffffff';c.lineWidth=4;path();c.stroke();c.globalAlpha=a;c.strokeStyle=WHITE;c.lineWidth=1.2;path();c.stroke();}
  // Nút nhân quả trượt dọc sợi
  const u=((t*.00035+i*.37+seed)%1),x=(1-u)**3*base*.6+3*(1-u)**2*u*x1+3*(1-u)*u*u*x2+u**3*(side*spread*.32);
  const y=(1-u)**3*18+3*(1-u)**2*u*(-height*.25)+3*(1-u)*u*u*(-height*.7)+u**3*top;
  c.globalAlpha=a*Math.sin(u*Math.PI);
  c.fillStyle=i%2?INK:WHITE;c.beginPath();c.arc(x,y,2.1,0,TAU);c.fill();
  c.strokeStyle=i%2?WHITE:INK;c.lineWidth=.7;c.stroke();
 }
 c.restore();
}
// Hạt: điểm sáng trắng bay lên, tro mực rơi xuống.
function motes(c,t,count,width,seed=0){
 for(let i=0;i<count;i++){
  const up=i%2===0,u=(i*.618+(t+seed)*(up?.00038:.00027))%1;
  const x=Math.sin(i*2.399+u*1.7)*width*(.35+.65*((i*.37)%1)),y=up?22-u*130:-120+u*140;
  c.save();c.globalAlpha*=Math.sin(u*Math.PI)*.85;c.translate(x,y);
  if(up){img(c,lightArt(),-3.2,-3.2,6.4,6.4,1);c.fillStyle=WHITE;c.fillRect(-.6,-.6,1.2,1.2);}
  else{c.rotate(u*6+i);c.fillStyle=INK;c.fillRect(-1.6,-.6,3.2,1.3);c.fillStyle='#ffffff55';c.fillRect(-1.6,-.6,3.2,.4);}
  c.restore();
 }
}
function floatingGlyphs(c,t,seed){
 const g=glyphArt();if(!g?.[0])return;
 for(let i=0;i<2;i++){
  const cyc=(t*.00016+i*.5+seed*.13)%1,a=Math.sin(cyc*Math.PI)**2;
  const side=i?1:-1;
  img(c,g[i],side*(46+cyc*6)-8,-92-cyc*26,16,16,a*.85);
 }
}

export function drawKarmaAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,head=-55-stand*30,breathe=motion?Math.sin((time+seed)*.0021):0;
 if(layer==='back'){
  img(c,mistArt(),-74,head-40,148,150,.72+breathe*.05);
  floorSeal(c,time+seed,58+2*breathe,22,.92,seed%2?-1:1);
  if(motion)karmaThreads(c,time,light?2:6,96+stand*30,58,.75,seed*.01);
 }else if(motion){
  motes(c,time,light?6:16,60,seed);
  if(!light)floatingGlyphs(c,time,seed);
 }
}

// Pháp bảo theo người: hào quang trắng đen sau đầu + Xích Long Thương lơ lửng có xoắn âm dương.
export function drawKarmaGear(c,art,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0,sway=motion?Math.sin(time*.0019):0;
 if(layer==='back'){
  const cx=0,cy=HALO_Y(stand),r=33+stand*5;
  if(art.halo){
   const w=2*r*1.07,h=w*art.halo.naturalHeight/art.halo.naturalWidth;
   c.save();c.translate(cx,cy);img(c,inkArt(),-r*.9,-r*.9,r*1.8,r*1.8,.55);
   c.rotate(time*.00012);img(c,art.halo,-w/2,-h/2,w,h,.95);c.restore();
  }
  if(motion&&!light){
   // Vòng tơ quay ngược quanh hào quang
   c.save();c.translate(cx,cy);c.rotate(-time*.0005);c.lineWidth=1.1;
   for(let i=0;i<6;i++){c.strokeStyle=i%2?'#ffffffcc':INK;c.beginPath();c.arc(0,0,r*1.16,i*TAU/6,i*TAU/6+.6);c.stroke();}
   c.restore();
  }
 }else if(art.blade){
  const h=96+stand*14,w=h*art.blade.naturalWidth/art.blade.naturalHeight;
  c.save();c.translate(52-stand*4,-50-stand*14+sway*2.4);c.rotate(.16+sway*.03);
  img(c,mistArt(),-w*.8,-h*.52,w*1.6,h*1.04,.35);
  img(c,art.blade,-w/2,-h/2,w,h);
  if(motion&&!light){
   // Xoắn âm dương chạy dọc cán thương
   c.save();c.lineWidth=1.3;
   for(let s=0;s<2;s++){
    c.strokeStyle=s?INK:WHITE;c.globalAlpha=.9;c.beginPath();
    for(let j=0;j<=24;j++){const u=j/24,y=h*.38-u*h*.7,x=Math.sin(u*14+time*.006+s*Math.PI)*3.4;j?c.lineTo(x,y):c.moveTo(x,y);}
    c.stroke();
   }
   const u=(time%1600)/1600;img(c,lightArt(),-7,h*.36-u*h*.75-7,14,14,.9*Math.sin(u*Math.PI));
   c.restore();
  }
  c.restore();
 }
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// Màn biến hình: thiên địa hoá trắng đen → tơ nhân quả hội tụ → đảo màu chớp → sóng mực + sóng sáng → hào quang, thương giáng.
export function drawKarmaReveal(c,t,k,target,layer,reveal,art,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),dir=s%2?-1:1,mirror=(s>>1)%2?-1:1;
 const charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1);
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  // Thiên địa tối dần (vignette mực) — nhả ra ở cuối.
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.62:.62-.3*after);
  img(c,inkArt(),-420,-470,840,780,veil);
  // Pháp trận lớn dần, quay nhanh dần, sau chớp thì ổn định
  const sealR=k<reveal?24+charge*62:86-14*ease(after*3);
  floorSeal(c,clock*(k<reveal?1+charge*5:1),sealR,22,Math.min(1,k/.08),dir);
  if(k<reveal){
   // Tơ hội tụ từ bốn phía vào thân
   const n=light?8:16;c.save();c.lineCap='round';
   for(let i=0;i<n;i++){
    const a=i/n*TAU+dir*clock*.0004+s,R=300*(1-ease(charge))+30,len=60+90*charge;
    const x1=Math.cos(a)*R*mirror,y1=Math.sin(a)*R*.7-50,x2=Math.cos(a)*(R-len)*mirror,y2=Math.sin(a)*(R-len)*.7-50;
    c.globalAlpha=.85*Math.min(1,charge*3);
    c.strokeStyle=i%2?'#ffffff55':'#ffffff';c.lineWidth=i%2?3:1.3;c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo((x1+x2)/2+Math.sin(a*3)*14,(y1+y2)/2,x2,y2);c.stroke();
    if(i%2){c.strokeStyle=INK;c.lineWidth=1.4;c.stroke();}
   }
   c.restore();
   karmaThreads(c,clock,light?3:8,90+charge*60,40+charge*30,charge,s*.01);
  }else{
   drawKarmaAura(c,clock,stand,'back',{motion,light,seed:s});
   // Hào quang bung ra có nảy
   const pop=after<.12?ease(after/.12)*1.18:1+.18*(1-ease((after-.12)/.1));
   c.save();c.translate(0,HALO_Y(stand));c.scale(Math.max(.01,pop),Math.max(.01,pop));c.translate(0,-HALO_Y(stand));
   drawKarmaGear(c,art||{},clock,{stand},'back',{motion,light});c.restore();
  }
 }else{
  if(k<reveal){
   // Vòng chữ nhân quả co lại quanh người
   const g=glyphArt(),n=light?6:10;
   if(g?.[0])for(let i=0;i<n;i++){
    const a=i/n*TAU-dir*clock*.0012,R=90-charge*48;
    img(c,g[i%2],Math.cos(a)*R*mirror-7,-50+Math.sin(a)*R*.42-7,14,14,Math.min(1,charge*2)*.9);
   }
   if(motion)motes(c,clock*(1+charge),light?8:20,70-charge*30,s);
   // Ngưng tụ: một điểm trắng nhỏ trong lõi mực ngay trước chớp
   const core=clamp((charge-.7)/.3);
   img(c,inkArt(),-40*core,-55-40*core,80*core,80*core,core*.9);
   img(c,lightArt(),-9*core,-55-9*core,18*core,18*core,core);
  }else{
   // Chớp đảo âm dương: nửa trắng nửa mực chẻ màn trong chốc lát
   const flash=1-clamp(after/.07);
   if(flash>0){
    // Âm dương đảo: quầng trắng và quầng mực lệch hai bên rồi tan
    img(c,inkArt(),mirror*40-170,-220,340,340,flash*.9);
    img(c,lightArt(),-mirror*40-190,-240,380,380,flash);
    img(c,lightArt(),-60,-110,120,120,flash);
   }
   // Hai sóng: sóng mực rồi sóng sáng
   for(const [delay,color,width] of [[0,INK,9],[.04,WHITE,3],[.09,'#ffffffaa',1.5]]){
    const u=clamp((after-delay)/.32);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha*=(1-u)*.95;c.strokeStyle=color;c.lineWidth=width*(1-u*.5);
    c.beginPath();c.ellipse(0,20,30+u*190,8+u*44,0,0,TAU);c.stroke();c.restore();
   }
   // Tơ bắn ra
   const shoot=clamp(after/.2);
   if(shoot<1){c.save();c.lineCap='round';const n=light?10:22;
    for(let i=0;i<n;i++){const a=i/n*TAU+s,r0=20+shoot*140,r1=r0+40*(1-shoot);
     c.globalAlpha=(1-shoot)*.95;c.strokeStyle=i%2?INK:WHITE;c.lineWidth=i%2?2.2:1.4;
     c.beginPath();c.moveTo(Math.cos(a)*r0,-50+Math.sin(a)*r0*.75);c.lineTo(Math.cos(a)*r1,-50+Math.sin(a)*r1*.75);c.stroke();}
    c.restore();}
   // Xích Long Thương giáng từ trên xuống, xoay một vòng rồi về tay
   const land=ease(clamp((after-.04)/.18));
   if(art?.blade){
    if(land<1){
     const h=110,w=h*art.blade.naturalWidth/art.blade.naturalHeight;
     c.save();c.translate(52*land+mirror*30*(1-land),-64-260*(1-land));c.rotate(.16+(1-land)*TAU*dir);
     img(c,lightArt(),-w,-h*.6,w*2,h*1.2,.8*(1-land));
     img(c,art.blade,-w/2,-h/2,w,h);c.restore();
     // vệt rơi
     c.save();c.globalAlpha*=(1-land)*.8;c.strokeStyle=WHITE;c.lineWidth=2;c.beginPath();c.moveTo(52*land+mirror*30*(1-land),-64-260*(1-land));c.lineTo(52*land+mirror*30*(1-land)+mirror*8,-64-260*(1-land)-90);c.stroke();c.restore();
    }else drawKarmaGear(c,art,clock,{stand},'front',{motion,light});
   }
   drawKarmaAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
