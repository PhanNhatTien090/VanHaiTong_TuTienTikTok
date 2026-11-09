import {makeSurface} from './performance.js';
import {ownsGear} from './skin-gear.js';
// Tư Đồ Ma Tôn (07/11/2026): thiết kế tự sáng tác — ma tu áo đỏ-đen, đại đao Huyết Sát lơ lửng sau vai.
// Thân nhân vật là ảnh tĩnh (4 ô như Hải Lam); mọi hiệu ứng là lớp vẽ thời gian thực, có biến thể theo từng người.
export const TUDO_SKIN='tudo-ma-ton',TUDO_BLADE='tudo-huyet-dao';
export const tudoWorn=p=>p?.skinChoice===TUDO_SKIN&&p.rewardSkins?.includes(TUDO_SKIN);
const bladeOnly=p=>!tudoWorn(p)&&ownsGear(p,TUDO_BLADE);
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const seedOf=id=>{let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const rnd=(i,s)=>{const x=Math.sin(i*127.1+s*.311)*43758.5453;return x-Math.floor(x);};
// Bảng màu: 3 biến thể nhẹ theo người (đỏ máu / đỏ son / đỏ tía) để màn có nhiều Ma Tôn không giống hệt nhau.
const PALETTES=[{core:'#ff3b2f',hot:'#ffb36b',deep:'#6a0710',rune:'#ff5a4a'},{core:'#ff2a2a',hot:'#ff9a5a',deep:'#560612',rune:'#ff5a3a'},{core:'#e8302a',hot:'#ffd27a',deep:'#3d0612',rune:'#ff7a3a'}];
export function loadTudoArt(scene){
 if(typeof Image==='undefined')return;
 if(!scene.tudoSkinArt&&!scene.tudoSkinLoading){scene.tudoSkinLoading=true;const im=new Image();im.onload=()=>{scene.tudoSkinArt=sliceTudoSkin(im);scene.characterFrames?.clear?.();};im.onerror=()=>scene.tudoSkinLoading=false;im.src='/assets/tudo-ma-ton-v1/skin.png';}
 if(!scene.tudoBladeArt&&!scene.tudoBladeLoading){scene.tudoBladeLoading=true;const im=new Image();im.onload=()=>{scene.tudoBladeArt=trimBlade(im);};im.onerror=()=>scene.tudoBladeLoading=false;im.src='/assets/tudo-ma-ton-v1/sabre.png';}
}
// 2×2 ô (nam/nữ đứng trên, nam/nữ ngồi dưới); tự dò khe trống giữa 2 hàng thay vì cố định 54/46 như Hải Lam.
export function sliceTudoSkin(im,factory=makeSurface){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,full=factory(w,h);if(!full)return [null,null,null,null];const q=full.getContext('2d');q.drawImage(im,0,0);const d=q.getImageData(0,0,w,h).data;
 let split=Math.round(h*.6),best=Infinity;for(let y=Math.round(h*.5);y<Math.round(h*.7);y++){let n=0;for(let x=0;x<w;x+=4)if(d[(y*w+x)*4+3]>35)n++;if(n<best){best=n;split=y;}}
 return Array.from({length:4},(_,i)=>{const top=i<2?0:split,sh=i<2?split:h-split,x=i%2*w/2;let x0=w,y0=h,x1=0,y1=0;for(let y=top;y<top+sh;y++)for(let xx=x;xx<x+w/2;xx++)if(d[(y*w+xx)*4+3]>35){x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const f=factory(384,512);if(!f||x1<=x0)return null;const cw=x1-x0+5,ch=y1-y0+5,k=Math.min(370/cw,498/ch);f.getContext('2d').drawImage(full,x0-2,y0-2,cw,ch,(384-cw*k)/2,506-ch*k,cw*k,ch*k);return f;});}
// Cắt sát viền alpha để đao xoay quanh đúng tâm chuôi.
export function trimBlade(im,factory=makeSurface){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,raw=factory(w,h);if(!raw)return null;const q=raw.getContext('2d');q.drawImage(im,0,0);
 const d=q.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(d[(y*w+x)*4+3]>30){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(x1<=x0)return null;const cw=x1-x0+4,ch=y1-y0+4,k=Math.min(1,520/ch),f=factory(Math.ceil(cw*k),Math.ceil(ch*k));f.getContext('2d').drawImage(raw,x0-2,y0-2,cw,ch,0,0,f.width,f.height);return f;}
function poseFrame(c,im,top,height,clock,alpha){if(!im||alpha<=.001)return;c.save();c.globalAlpha*=alpha;const bands=12;
 for(let i=0;i<bands;i++){const u=i/bands,shift=Math.sin(clock*.0016-u*2.4)*1.3*u*u;c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-57+shift,top+i*height/bands,114,height/bands+.25);}c.restore();}
export function drawTudoBody(scene,c,p,pose,t){
 if(!tudoWorn(p))return false;loadTudoArt(scene);if(!scene.tudoSkinArt)return false;
 const gender=p.gender==='nu'?1:0,stand=clamp(pose.stand||0),clock=scene.motion===false?0:t;
 c.save();c.translate(0,pose.lift||0);c.rotate((pose.lean||0)*.5);
 poseFrame(c,scene.tudoSkinArt[gender+2],-91,120,clock,1-stand);poseFrame(c,scene.tudoSkinArt[gender],-116,144,clock,stand);c.restore();return true;}
// Vị trí đao: lơ lửng chéo sau vai phải, lắc nhẹ; mỗi ~6–8 s (lệch theo người) xoay vung một nhịp "đao quang".
export function tudoBladePose(t,seed=0,motion=true){
 const clock=motion?t:0,period=6000+seed%2000,phase=((clock+seed*37)%period)/period,swing=motion&&phase>.82?Math.sin((phase-.82)/.18*Math.PI):0;
 return {x:30-swing*14,y:-62+Math.sin(clock*.0012+seed)*4,angle:.42+Math.sin(clock*.0009+seed)*.05-swing*.55,swing,flash:motion&&phase>.84&&phase<.97?Math.sin((phase-.84)/.13*Math.PI):0};}
// Lưỡi lửa mềm: chồng nhiều đốm nhòe từ đáy lên đỉnh, vẽ sẵn 1 lần cho mỗi màu.
function flameSprite(scene,color,hot){const cache=scene.tudoFlames??=new Map(),key=color+(hot?'+':'');if(cache.has(key))return cache.get(key);const f=(scene.surfaceFactory||makeSurface)(72,192);cache.set(key,f||null);if(!f)return null;
 const c=f.getContext('2d');c.globalCompositeOperation=hot?'lighter':'source-over';for(let k=0;k<28;k++){const u=k/27,y=176-u*160,r=(hot?17:26)*Math.pow(1-u,.85)+2,x=36+Math.sin(u*5.5)*5*u,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+(hot?'aa':'88'));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}return f;}
function flameTongue(c,x,base,h,w,lean,color,alpha){c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(x-w,base);c.bezierCurveTo(x-w*1.1,base-h*.45,x+lean-w*.4,base-h*.7,x+lean,base-h);c.bezierCurveTo(x+lean+w*.5,base-h*.62,x+w*1.15,base-h*.4,x+w,base);c.closePath();c.fill();}
function drawBlade(scene,c,pose,pal,size=1){const im=scene.tudoBladeArt;c.save();c.translate(pose.x,pose.y);c.rotate(pose.angle);
 const L=128*size,W=im?L*im.width/im.height:L*.2;
 // quầng đỏ sau lưỡi đao
 const g=c.createRadialGradient(0,-L*.15,2,0,-L*.15,L*.55);g.addColorStop(0,pal.core+'66');g.addColorStop(1,pal.core+'00');c.fillStyle=g;c.fillRect(-L*.6,-L*.75,L*1.2,L*1.2);
 if(im)c.drawImage(im,-W/2,-L*.62,W,L);else{c.fillStyle='#2b2d33';c.beginPath();c.moveTo(-6,L*.3);c.lineTo(-9,-L*.45);c.quadraticCurveTo(0,-L*.62,9,-L*.5);c.lineTo(6,L*.3);c.closePath();c.fill();c.fillStyle=pal.core;c.fillRect(-12,L*.28,24,4);}
 // đao quang: vệt sáng chạy dọc lưỡi khi vung
 if(pose.flash>0){c.globalCompositeOperation='screen';const y=-L*.55+(1-pose.flash)*L*.6,s=c.createLinearGradient(0,y-20,0,y+20);s.addColorStop(0,'#ffffff00');s.addColorStop(.5,pal.hot+'ee');s.addColorStop(1,'#ffffff00');c.fillStyle=s;c.fillRect(-W*.45,y-20,W*.9,40);}
 c.restore();}
export function drawTudoAdornment(scene,c,target,t,layer='front'){
 const p=target.player,worn=tudoWorn(p);if(!worn&&!bladeOnly(p))return;loadTudoArt(scene);
 const sc=target.scale||1.4,motion=scene.motion!==false,clock=motion?t:0,seed=seedOf(p.id),pal=PALETTES[seed%PALETTES.length],light=scene.budget?.level==='light'||scene.crowded,
  pose=target.pose||scene.animator?.pose?.(p,clock,motion)||{},stand=pose.stand??1,up=-stand*13,blade=tudoBladePose(t,seed,motion);
 c.save();c.translate(target.x,target.y);c.scale(sc,sc);c.translate(0,(pose.lift||0)+up);
 if(layer==='back'){
  if(worn){
   // 1) Huyết vụ: quầng khói đỏ sẫm dưới chân, giúp nhân vật nổi trên cả nền sáng.
   c.save();c.translate(0,20);c.scale(1,.32);const mg=c.createRadialGradient(0,0,4,0,0,70);mg.addColorStop(0,pal.deep+'cc');mg.addColorStop(.6,pal.deep+'55');mg.addColorStop(1,pal.deep+'00');c.fillStyle=mg;c.fillRect(-70,-70,140,140);c.restore();
   // 2) Ma diễm 3 lớp (khói đen → đỏ máu → lõi nóng), rộng hơn thân để lửa lộ ra hai bên; vẽ trước thân nên không che mặt.
   c.save();const n=light?7:13;
   for(const [color,hot,alpha,sh,sw] of [['#1a0306',false,.6,1.05,1.5],[pal.deep,false,.75,.95,1.25],[pal.core,true,.75,.8,1],[pal.hot,true,.55,.5,.7]]){const im=flameSprite(scene,color,hot);c.globalCompositeOperation=hot?'lighter':'source-over';
    for(let i=0;i<n;i++){const u=i/(n-1)-.5,fl=motion?Math.sin(clock*.007+i*1.7+seed+sh)*.5+.5:.6,h=(58+rnd(i,seed)*52)*(.75+fl*.35)*(1-Math.abs(u)*.45)*sh,w=(44+rnd(i+3,seed)*20)*sw,x=u*104+Math.sin(clock*.0024+i)*6;
     c.globalAlpha=alpha*(.75+fl*.25);if(im)c.drawImage(im,x-w/2,30-h,w,h);else flameTongue(c,x,24,h,w/3,0,color,c.globalAlpha);}}
   c.restore();
   // tàn lửa bay lên — sau thân nên không che mặt
   c.save();c.globalCompositeOperation='lighter';const m=light?8:18;
   for(let i=0;i<m;i++){const life=motion?((clock*.00032+rnd(i,seed))%1):rnd(i,seed),x=(rnd(i+9,seed)-.5)*120+Math.sin(life*6+i)*8,y=24-life*150,a=Math.sin(life*Math.PI),r=1+rnd(i+4,seed)*1.2;c.globalAlpha=a*.3;c.fillStyle=pal.core;c.beginPath();c.arc(x,y,r*2,0,TAU);c.fill();c.globalAlpha=a;c.fillStyle=i%3?pal.hot:'#fff2d0';c.beginPath();c.arc(x,y,r*.6,0,TAU);c.fill();}
   c.restore();
   // 3) Phù văn dưới chân: 2 vòng xoay ngược chiều, ký hiệu sáng
   c.save();c.translate(0,22);c.scale(1,.3);c.globalCompositeOperation='lighter';const spin=motion?clock*.0007:0,dir=seed%2?1:-1;
   c.strokeStyle=pal.rune;c.lineWidth=2.4;c.globalAlpha=.85;c.beginPath();c.arc(0,0,52,0,TAU);c.stroke();c.lineWidth=1.2;c.globalAlpha=.6;c.beginPath();c.arc(0,0,44,0,TAU);c.stroke();
   c.save();c.rotate(spin*dir);c.fillStyle=pal.hot;c.globalAlpha=.9;for(let i=0;i<10;i++){c.rotate(TAU/10);c.fillRect(45,-2.5,6,5);}c.restore();
   c.save();c.rotate(-spin*dir*1.6);c.strokeStyle=pal.core;c.globalAlpha=.7;c.lineWidth=1.4;c.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/6*2;c.lineTo(Math.cos(a)*32,Math.sin(a)*32);}c.stroke();c.restore();
   c.restore();
  }
  // 4) Huyết Sát Ma Đao (cả khi chỉ trang bị pháp bảo)
  drawBlade(scene,c,blade,pal,worn?1:.8);
 }else if(worn){
  // 6) Huyết lôi: tia sét nhỏ lóe quanh đao lúc vung
  if(blade.flash>.3&&!light){c.save();c.globalCompositeOperation='screen';c.strokeStyle=pal.hot;c.lineWidth=1.2;c.globalAlpha=blade.flash;c.beginPath();let x=blade.x+10,y=blade.y-40;c.moveTo(x,y);for(let k=0;k<5;k++){x+=(rnd(k+Math.floor(clock/80),seed)-.5)*16;y+=10;c.lineTo(x,y);}c.stroke();c.restore();}
 }
 c.restore();}
// NPC khi sự kiện mở: Ma Tôn lớn giữa sân, đầy đủ hiệu ứng.
export function drawTudoVisitor(scene,c,e,t,H){
 if(e?.kind!=='tudo'||Date.now()>=e.endsAt)return false;loadTudoArt(scene);const im=scene.tudoSkinArt?.[0];if(!im)return true;
 const p={id:'tudo-visitor',gender:'nam',realm:1,skinChoice:TUDO_SKIN,rewardSkins:[TUDO_SKIN]},rise=clamp((Date.now()-e.startedAt)/1500),target={id:p.id,player:p,x:450,y:H*.46+(1-rise)*-60,scale:2.1,pose:{stand:1}};
 c.save();c.globalAlpha*=rise;drawTudoAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);poseFrame(c,im,-116,144,scene.motion?t:0,1);c.restore();drawTudoAdornment(scene,c,target,t,'front');c.restore();return true;}
