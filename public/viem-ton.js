import {makeSurface} from './performance.js';
import {sliceTudoSkin} from './tudo-ma-ton.js';
// Phần Thiên Viêm Tôn (09/11/2026, BẢN DEMO): skin lửa ngang tầm Khuy Niết. Thiết kế tự sáng tác theo gợi ý của chủ kênh:
// tóc đỏ rực, áo đỏ thẫm viền vàng, cầu lửa trong lòng bàn tay. Hiệu ứng: biển lửa dưới chân, áo choàng lửa sau lưng,
// 2 dải hỏa long quấn thân, trận Liệt Dương xoay dưới đất, tro lửa bay, mỗi ~9 s cột lửa Phần Thiên phun lên trời.
// Pháp bảo (500c): Song Đao Liệt Diễm — 2 đao chặt heo bản to nung đỏ chéo sau lưng, ~7 s vung chém ra 2 bên.
// Ảnh thân hiện là ẢNH TẠM: đổi màu từ Khuy Niết (tóc bạc→đỏ, áo tím→đỏ thẫm). Codex vẽ ảnh thật sau 12/11.
export const VIEM_SKIN='phan-thien-viem-ton',VIEM_BLADES='phan-thien-song-dao';
export const viemWorn=p=>p?.skinChoice===VIEM_SKIN&&p.rewardSkins?.includes(VIEM_SKIN);
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const seedOf=id=>{let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const rnd=(i,s)=>{const x=Math.sin(i*127.1+s*.311)*43758.5453;return x-Math.floor(x);};
const hex=a=>Math.round(clamp(a)*255).toString(16).padStart(2,'0');
// 3 biến thể lửa theo người: đỏ cam / đỏ thắm / cam vàng.
const PALETTES=[{deep:'#3a0603',smoke:'#5a0e06',red:'#e8300c',orange:'#ff7a12',gold:'#ffc23a',hot:'#fff2c0'},{deep:'#34020a',smoke:'#560812',red:'#f0241e',orange:'#ff6a1c',gold:'#ffb43a',hot:'#ffe8c4'},{deep:'#3a0c02',smoke:'#5e1a06',red:'#ff4a10',orange:'#ff8e1a',gold:'#ffd24a',hot:'#fff6d0'}];
// ---- ẢNH TẠM: đổi màu Khuy Niết → tóc đỏ, áo đỏ thẫm (giữ da, vàng) ----
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;if(mx===mn)return [0,0,l];const d=mx-mn,s=l>.5?d/(2-mx-mn):d/(mx+mn);let h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;return [h*60,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;if(!s)return [l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};return [f(h+1/3)*255,f(h)*255,f(h-1/3)*255];}
export function recolorToFire(im,factory=makeSurface){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,f=factory(w,h);if(!f)return im;const q=f.getContext('2d');q.drawImage(im,0,0);const img=q.getImageData(0,0,w,h),d=img.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const [hh,s,l]=rgb2hsl(d[i],d[i+1],d[i+2]);let o=null;
  if(s<.2&&l>.42)o=hsl2rgb(8+(l-.42)*40,.88,.28+(l-.42)*.62);                       // tóc bạc → đỏ lửa (sáng dần sang cam)
  else if(hh>=225&&hh<=320&&s>.12)o=hsl2rgb(352+(hh-270)*.08,Math.min(1,s*1.1+.15),l*.95);  // áo tím → đỏ thẫm
  else if(s<.2&&l<=.42&&l>.1)o=hsl2rgb(355,.35,l*.9);                                // đen/xám áo → đỏ đen
  if(o){d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];}}
 q.putImageData(img,0,0);return f;}
export function loadViemArt(scene){
 if(typeof Image==='undefined'||scene.viemSkinArt||scene.viemSkinLoading)return;scene.viemSkinLoading=true;const im=new Image();
 im.onload=()=>{scene.viemSkinArt=sliceTudoSkin(recolorToFire(im));scene.characterFrames?.clear?.();};im.onerror=()=>scene.viemSkinLoading=false;im.src='/assets/khuy-niet-v1/skin.png';}
function poseFrame(c,im,top,height,clock,alpha){if(!im||alpha<=.001)return;c.save();c.globalAlpha*=alpha;const bands=12;
 for(let i=0;i<bands;i++){const u=i/bands,shift=Math.sin(clock*.0024-u*2.8)*1.8*u*u;c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-57+shift,top+i*height/bands,114,height/bands+.25);}c.restore();}
export function drawViemBody(scene,c,p,pose,t){
 if(!viemWorn(p))return false;loadViemArt(scene);if(!scene.viemSkinArt)return false;
 const gender=p.gender==='nu'?1:0,stand=clamp(pose.stand??1),clock=scene.motion===false?0:t;
 c.save();c.translate(0,pose.lift||0);c.rotate((pose.lean||0)*.5);
 poseFrame(c,scene.viemSkinArt[gender+2],-91,120,clock,1-stand);poseFrame(c,scene.viemSkinArt[gender],-116,144,clock,stand);c.restore();return true;}
// ---- nhịp ----
// Phần Thiên: mỗi 9–11 s cột lửa phun từ đất lên trời (0,6 s dâng, 1,2 s tắt).
export function viemBurst(t,seed=0,motion=true){if(!motion)return {burst:0,flash:0,phase:0};const period=9000+seed%2000,ph=((t+seed*47)%period)/period,k=(ph-.86)/.14;
 return {phase:ph,burst:k>0?Math.sin(Math.min(1,k*2.2)*Math.PI/2)*(1-Math.max(0,(k-.45)/.55)):0,flash:k>0&&k<.25?1-k/.25:0};}
// Song Đao: treo chéo sau lưng, lắc nhẹ; ~7 s vung chém ra 2 bên (không chém qua mặt).
export function viemBladePose(t,seed=0,motion=true,stand=1){const clock=motion?t:0,period=7000+seed%1400,ph=((clock+seed*29)%period)/period,slash=motion&&ph>.84?Math.sin((ph-.84)/.16*Math.PI):0;
 return {x:stand>.5?30:40,y:(stand>.5?-26:-6)+Math.sin(clock*.0017+seed)*2.5,sway:Math.sin(clock*.0013+seed)*.05,slash};}
// ---- sprite dùng chung (vẽ 1 lần) ----
function flameSprite(scene,color,hot){const cache=scene.viemFlames??=new Map(),key=color+(hot?'+':'');if(cache.has(key))return cache.get(key);const f=(scene.surfaceFactory||makeSurface)(72,192);cache.set(key,f||null);if(!f)return null;
 const c=f.getContext('2d');c.globalCompositeOperation=hot?'lighter':'source-over';for(let k=0;k<30;k++){const u=k/29,y=178-u*166,r=(hot?16:25)*Math.pow(1-u,.8)+2,x=36+Math.sin(u*6)*6*u,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+(hot?'b0':'90'));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}return f;}
function dotSprite(scene,color){const cache=scene.viemDots??=new Map();if(cache.has(color))return cache.get(color);const f=(scene.surfaceFactory||makeSurface)(64,64);cache.set(color,f||null);if(!f)return null;
 const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,color+'ff');g.addColorStop(.35,color+'99');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);return f;}
function blob(c,x,y,rx,ry,col,a){if(a<=0)return;c.save();c.translate(x,y);c.scale(rx/100,ry/100);const g=c.createRadialGradient(0,0,0,0,0,100);g.addColorStop(0,col+hex(a));g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(-100,-100,200,200);c.restore();}
function flame(c,im,x,y,w,h,a,rot=0){if(!im||a<=0||h<=0)return;c.globalAlpha=a;if(rot){c.save();c.translate(x,y);c.rotate(rot);c.drawImage(im,-w/2,-h,w,h);c.restore();}else c.drawImage(im,x-w/2,y-h,w,h);}
// Dải hỏa long quấn thân: điểm thứ j trên xoắn ốc, z>0 là phía trước thân.
function ribbonPoint(clock,i,j,seed,stand){const u=j/22,a=clock*.0034*(i?1:-1)+i*Math.PI-u*3.6+seed,top=stand>.5?-128:-96,y=24+(top-24)*((u+clock*.00045+i*.5)%1);return {x:Math.cos(a)*(40+8*Math.sin(u*9+i)),y,z:Math.sin(a),w:1-u};}
function drawRibbons(scene,c,pal,clock,seed,stand,front,light){const core=dotSprite(scene,pal.gold),outer=dotSprite(scene,pal.red),hot=dotSprite(scene,pal.hot);c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<2;i++)for(let j=0;j<(light?14:22);j++){const q=ribbonPoint(clock,i,j*(light?22/14:1),seed,stand);if((q.z>=0)!==front)continue;const r=(6+q.w*10)*(.8+q.z*.2);const fd=Math.hypot(q.x,q.y-(stand>.5?-92:-74)),face=front?clamp((fd-r*1.6-14)/22)*.9+.1:1;
  c.globalAlpha=.55*q.w*face;if(outer)c.drawImage(outer,q.x-r*1.8,q.y-r*1.8,r*3.6,r*3.6);c.globalAlpha=.7*q.w*face;if(core)c.drawImage(core,q.x-r,q.y-r,r*2,r*2);if(j<4&&hot){c.globalAlpha=.8*face;c.drawImage(hot,q.x-r*.7,q.y-r*.7,r*1.4,r*1.4);}}
 c.restore();}
// Hai cầu lửa trong lòng bàn tay (đứng: ngang hông; ngồi: trên đầu gối).
function palmFlames(scene,c,pal,clock,seed,stand,boost){const pts=stand>.5?[[-24,-30],[24,-30]]:[[-30,-8],[30,-8]],dot=dotSprite(scene,pal.orange),hotDot=dotSprite(scene,pal.hot),fl=flameSprite(scene,pal.orange,true),fh=flameSprite(scene,pal.gold,true);
 c.save();c.globalCompositeOperation='lighter';for(const [k,[x,y]] of pts.entries()){const b=.85+Math.sin(clock*.009+k*2+seed)*.15+boost*.4,r=11*b;
  c.globalAlpha=.6;if(dot)c.drawImage(dot,x-r*2.2,y-r*2.2,r*4.4,r*4.4);for(let f=0;f<3;f++){const sw=Math.sin(clock*.012+f*2.1+k)*.25;flame(c,f%2?fh:fl,x+(f-1)*3,y+3,12*b,(26+f*6)*b,.75,sw);}
  c.globalAlpha=.95;if(hotDot)c.drawImage(hotDot,x-r*.8,y-r*.8,r*1.6,r*1.6);}
 c.restore();}
// Một cây dao phay mũi nhọn: chuôi gỗ + khâu vàng; LƯỠI LÀ NGUYÊN KHÍ LỬA (trong suốt, chảy dọc thân, lõi vàng trắng).
const qiBlade=c=>{c.beginPath();c.moveTo(-4,0);c.lineTo(-4,-37);c.quadraticCurveTo(-3.5,-46,2,-54);c.bezierCurveTo(9,-46,20,-30,19,-2);c.closePath();};
function cleaver(scene,c,pal,clock,k,light){
 c.save();c.globalCompositeOperation='source-over';
 // chuôi gỗ + khâu
 const hg=c.createLinearGradient(-4,0,4,0);hg.addColorStop(0,'#5a3a22');hg.addColorStop(.5,'#a07a52');hg.addColorStop(1,'#4a2e1a');c.fillStyle=hg;c.beginPath();c.moveTo(-3.6,2);c.lineTo(3.6,2);c.lineTo(4.4,26);c.quadraticCurveTo(0,30,-4.4,26);c.closePath();c.fill();
 c.fillStyle='#e8c46a';c.fillRect(-5,-1,10,5);c.fillStyle='#fff0b8';c.fillRect(-5,-1,10,1.2);
 // hào quang lửa quanh lưỡi
 c.globalCompositeOperation='lighter';const red=dotSprite(scene,pal.red),gold=dotSprite(scene,pal.gold);for(let i=0;i<(light?3:4);i++){const u=i/((light?3:4)-1),y=-5-u*40,x=8-u*3,r=18-u*6;c.globalAlpha=.22;if(red)c.drawImage(red,x-r,y-r,r*2,r*2);}
 // thân lưỡi: khí lửa bán trong suốt
 const g=c.createLinearGradient(-4,0,22,0);g.addColorStop(0,'#7a0a02e8');g.addColorStop(.35,pal.red+'e0');g.addColorStop(.72,pal.orange+'d8');g.addColorStop(1,pal.gold+'f0');
 c.globalCompositeOperation='source-over';qiBlade(c);c.globalAlpha=.75;c.strokeStyle='#2a0402';c.lineWidth=3;c.stroke();c.globalAlpha=.92;c.fillStyle=g;c.fill();c.globalCompositeOperation='lighter';
 // khí chảy dọc lưỡi (vệt sáng trôi từ chuôi lên mũi) + lõi sáng
 c.save();qiBlade(c);c.clip();const n=light?4:7;for(let i=0;i<n;i++){const u=((clock*.0011+i/n+rnd(i,k)*.1)%1),y=-u*50,x=2+rnd(i+3,k)*12,h=10+rnd(i+5,k)*7;c.globalAlpha=Math.sin(u*Math.PI)*.55;if(gold)c.drawImage(gold,x-5,y-h/2,10,h);}
 c.globalAlpha=.6;c.strokeStyle=pal.gold;c.lineWidth=1.4;c.lineCap='round';c.beginPath();c.moveTo(4,-3);c.quadraticCurveTo(8,-30,3,-47);c.stroke();c.restore();
 // viền lưỡi trắng vàng + sống đỏ
 c.lineCap='round';for(const [w,col,a] of [[3,pal.gold,.5],[1.2,pal.hot,.95]]){c.strokeStyle=col;c.globalAlpha=a;c.lineWidth=w;c.beginPath();c.moveTo(2,-54);c.bezierCurveTo(9,-46,20,-30,19,-2);c.stroke();}
 c.globalCompositeOperation='source-over';c.strokeStyle='#5a0602';c.globalAlpha=.9;c.lineWidth=1.6;c.beginPath();c.moveTo(-4,-2);c.lineTo(-4,-37);c.quadraticCurveTo(-3.5,-46,2,-54);c.stroke();
 // lửa liếm ra từ lưỡi + tia lửa ở mũi
 c.globalCompositeOperation='lighter';const fl=flameSprite(scene,pal.red,true),fh=flameSprite(scene,pal.orange,true),m=light?2:4;for(let i=0;i<m;i++){const u=(i+.5)/m,y=-3-u*40,x=21-u*u*10,sw=Math.sin(clock*.012+i*1.9+k)*.25;flame(c,i%2?fh:fl,x,y,10,16+rnd(i,k)*12+Math.sin(clock*.01+i)*4,.7,Math.PI/2+.4+sw);}
 const hot=dotSprite(scene,pal.hot);c.globalAlpha=.7+Math.sin(clock*.02+k)*.3;if(hot)c.drawImage(hot,-4,-60,12,12);
 c.restore();}
function drawBlades(scene,c,bp,pal,clock,seed,light){const red=dotSprite(scene,pal.red),gold=dotSprite(scene,pal.gold);
 for(const side of [-1,1]){const base=.28+bp.sway*side,rot=side*(base+bp.slash*1.1);c.save();c.translate(side*bp.x,bp.y);c.scale(.66,.66);
  // vệt lửa cung chém (phía ngoài)
  if(bp.slash>.1){c.save();c.globalCompositeOperation='lighter';const n=light?8:16;for(let i=0;i<n;i++){const u=i/(n-1),a=-Math.PI/2+side*(base+bp.slash*1.1*u),r=40,x=Math.cos(a)*r,y=Math.sin(a)*r,s=(8+u*10)*bp.slash;c.globalAlpha=u*bp.slash*.85;if(red)c.drawImage(red,x-s*1.6,y-s*1.6,s*3.2,s*3.2);if(gold)c.drawImage(gold,x-s*.8,y-s*.8,s*1.6,s*1.6);}c.restore();}
  c.save();c.globalCompositeOperation='lighter';c.rotate(rot);if(red){c.globalAlpha=.45+bp.slash*.4;c.drawImage(red,(side>0?-6:-30),-46,40,48);}c.restore();
  c.rotate(rot);c.translate(0,-12);c.scale(side,1);cleaver(scene,c,pal,clock,side+seed,light);c.restore();}}
export function drawViemAdornment(scene,c,target,t,layer='front'){
 const p=target.player,worn=viemWorn(p),orb=p?.equipped===VIEM_BLADES||(worn&&p.artifacts?.includes?.(VIEM_BLADES))||!!target.showBlades;
 if(!worn&&!orb)return;if(worn)loadViemArt(scene);
 const sc=target.scale||1.4,motion=scene.motion!==false,clock=motion?t:0,seed=seedOf(p.id),pal=PALETTES[seed%PALETTES.length],light=scene.budget?.level==='light'||scene.crowded,
  pose=target.pose||scene.animator?.pose?.(p,clock,motion)||{},stand=pose.stand??1,up=-stand*13,b=viemBurst(clock,seed,motion),bp=viemBladePose(t,seed,motion,stand);
 c.save();c.translate(target.x,target.y);c.scale(sc,sc);c.translate(0,(pose.lift||0)+up);
 if(layer==='back'){
  if(worn){
   // 0) Cột lửa Phần Thiên (sau cùng, cao tới trời)
   if(b.burst>0){c.save();c.globalCompositeOperation='lighter';const big=flameSprite(scene,pal.red,false),core=flameSprite(scene,pal.gold,true),hot=flameSprite(scene,pal.hot,true);
    for(let i=0;i<(light?3:5);i++){const u=i/((light?3:5)-1)-.5,sw=Math.sin(clock*.006+i)*.04;flame(c,big,u*70,30,120,560*b.burst*(1-Math.abs(u)*.5),.8*b.burst,sw);}
    flame(c,core,0,30,80,520*b.burst,.85*b.burst);flame(c,hot,0,30,36,460*b.burst,.9*b.burst);blob(c,0,-160,120,320,pal.orange,.35*b.burst);c.restore();}
   // 1) Bóng đỏ đen dưới chân + mặt đất nung đỏ
   blob(c,0,24,92,26,pal.deep,.9);blob(c,0,24,70,18,pal.red,.45+b.burst*.4);
   // 2) Trận Liệt Dương: 2 vòng xoay ngược, 12 tia mặt trời, vết nứt dung nham
   c.save();c.translate(0,24);c.scale(1,.3);c.globalCompositeOperation='lighter';c.lineCap='round';const spin=clock*.0007,dir=seed%2?1:-1,pulse=motion?.65+Math.sin(clock*.004+seed)*.35:.8;
   c.strokeStyle=pal.orange;c.globalAlpha=.8;c.lineWidth=2.4;c.beginPath();c.arc(0,0,70,0,TAU);c.stroke();c.strokeStyle=pal.gold;c.lineWidth=1.4;c.beginPath();c.arc(0,0,62,0,TAU);c.stroke();
   c.save();c.rotate(spin*dir);for(let i=0;i<12;i++){c.rotate(TAU/12);c.fillStyle=i%2?pal.gold:pal.red;c.beginPath();c.moveTo(64,-3.5);c.quadraticCurveTo(74,0,82+(i%2)*6,0);c.quadraticCurveTo(74,2,64,3.5);c.fill();}c.restore();
   c.save();c.rotate(-spin*dir*1.6);c.strokeStyle=pal.red;c.lineWidth=1.6;c.globalAlpha=.75;c.beginPath();for(let i=0;i<=8;i++){const aa=i*TAU/8*3;c.lineTo(Math.cos(aa)*44,Math.sin(aa)*44);}c.stroke();c.restore();
   for(let i=0;i<10;i++){const a=i*TAU/10+rnd(i,seed)*.3;c.strokeStyle=i%2?pal.orange:pal.gold;c.globalAlpha=pulse*(.55+b.burst*.45);c.lineWidth=2;c.beginPath();let r=14,x=Math.cos(a)*r,y=Math.sin(a)*r;c.moveTo(x,y);for(let k=1;k<=4;k++){r+=12+rnd(i*5+k,seed)*8;const aa=a+(rnd(i*7+k,seed)-.5)*.5;x=Math.cos(aa)*r;y=Math.sin(aa)*r;c.lineTo(x,y);}c.stroke();}
   c.restore();
   // 3) Áo choàng lửa sau lưng: hàng lửa cao như đôi cánh lửa, cao nhất 2 bên vai
   {c.save();const nf=light?7:11;for(const [li,col,hotL,alpha,sh] of [[0,pal.smoke,false,.5,1.1],[1,pal.red,false,.5,1],[2,pal.orange,true,.38,.85],[3,pal.gold,true,.28,.6]]){const im=flameSprite(scene,col,hotL);c.globalCompositeOperation=hotL?'lighter':'source-over';
     for(let i=0;i<nf;i++){const u=i/(nf-1)-.5,fl=motion?Math.sin(clock*.007+i*1.9+seed+li)*.5+.5:.6,wing=.55+Math.abs(u)*.9-Math.abs(u)**2*.9,h=(stand>.5?112:80)*wing*sh*(.82+fl*.3)*(1+b.burst*.25),w=(40+rnd(i+li,seed)*18)*(li?1:1.25),x=u*(stand>.5?84:80);
      flame(c,im,x,stand>.5?-30:0,w,h,alpha*(.75+fl*.25),u*.5);}}c.restore();}
   // 4) Biển lửa dưới chân: 4 lớp từ khói đỏ tới lõi trắng vàng, rộng hơn thân
   {c.save();const nf=light?7:13;for(const [li,col,hotL,alpha,sh,sw] of [[0,pal.smoke,false,.55,1.05,1.3],[1,pal.red,false,.6,.95,1.1],[2,pal.orange,true,.42,.8,.9],[3,pal.hot,true,.3,.5,.6]]){const im=flameSprite(scene,col,hotL);c.globalCompositeOperation=hotL?'lighter':'source-over';
     for(let i=0;i<nf;i++){const u=i/(nf-1)-.5,fl=motion?Math.sin(clock*.009+i*1.7+seed+sh)*.5+.5:.6,h=(40+rnd(i,seed)*34)*(.75+fl*.35)*(1-Math.abs(u)*.45)*sh*(1+b.burst*.5),w=(44+rnd(i+3,seed)*20)*sw,x=u*100+Math.sin(clock*.0028+i)*6;flame(c,im,x,30,w,h,alpha*(.75+fl*.25));}}c.restore();}
   // 5) Hào quang + dải hỏa long phía sau thân
   c.save();c.globalCompositeOperation='lighter';const breath=motion?.85+Math.sin(clock*.003+seed)*.15:.9;blob(c,0,-58,72,110,pal.orange,.26*breath+b.flash*.3);blob(c,0,-70,40,70,pal.gold,.14*breath);c.restore();
   drawRibbons(scene,c,pal,clock,seed,stand,false,light);
   // 6) Tro lửa bay lên (xoáy nhẹ)
   {c.save();c.globalCompositeOperation='lighter';const m=light?10:24,ember=dotSprite(scene,pal.gold),ember2=dotSprite(scene,pal.orange);for(let i=0;i<m;i++){const life=motion?((clock*.00045+rnd(i,seed))%1):rnd(i,seed),x=(rnd(i+9,seed)-.5)*130+Math.sin(life*7+i)*10,y=24-life*(200+rnd(i+4,seed)*80),a=Math.sin(life*Math.PI),r=1.6+rnd(i+2,seed)*2.4;c.globalAlpha=a;const im=i%3?ember:ember2;if(im)c.drawImage(im,x-r*2,y-r*2,r*4,r*4);}c.restore();}
  }
 }else{
  // 7) Song Đao Liệt Diễm cầm 2 tay (cả khi chỉ trang bị pháp bảo)
  if(orb)drawBlades(scene,c,bp,pal,clock,seed,light);
  if(worn){
  drawRibbons(scene,c,pal,clock,seed,stand,true,light);
  palmFlames(scene,c,pal,clock,seed,stand,b.burst);
  // lửa liếm quanh gấu áo phía trước (che chân một chút)
  {c.save();c.globalCompositeOperation='lighter';const im=flameSprite(scene,pal.orange,true),n=light?4:7;for(let i=0;i<n;i++){const u=i/(n-1)-.5,fl=motion?Math.sin(clock*.011+i*2.3+seed)*.5+.5:.6;flame(c,im,u*70,30,22,(22+fl*22)*(1+b.burst*.6),.45);}c.restore();}
  // chớp sáng lúc Phần Thiên phun
  if(b.flash>0){c.save();c.globalCompositeOperation='lighter';blob(c,0,-60,110,150,pal.hot,b.flash*.45);c.restore();}
  }
 }
 c.restore();}
