import {makeSurface} from './performance.js';
import {sliceTudoSkin,trimBlade} from './tudo-ma-ton.js';
// Khuy Niết Lôi Tôn (07/11/2026): thiết kế tự sáng tác lấy cảm hứng "Âm Hư – Dương Thực": tóc bạc, vòng trán vàng,
// vân nứt vàng trên da. Hiệu ứng thời gian thực mạnh hơn Tư Đồ: hào quang chia đôi (trái sét vàng Dương Thực, phải sét tím
// Âm Hư), sét chạy quanh thân, mặt đất nứt vàng, thiên lôi giáng định kỳ; pháp bảo Tử Lôi Long cuộn sau vai, gầm phun sét.
export const KHUY_SKIN='khuy-niet-loi-ton',KHUY_DRAGON='khuy-niet-tu-loi-long';
export const khuyWorn=p=>p?.skinChoice===KHUY_SKIN&&p.rewardSkins?.includes(KHUY_SKIN);
const dragonOnly=p=>!khuyWorn(p)&&p?.equipped===KHUY_DRAGON;
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const seedOf=id=>{let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const rnd=(i,s)=>{const x=Math.sin(i*127.1+s*.311)*43758.5453;return x-Math.floor(x);};
// 3 biến thể màu theo người để nhiều Lôi Tôn trên màn không giống hệt nhau.
const PALETTES=[{yang:'#ffc23a',yangHot:'#fff1b0',yin:'#a45bff',yinHot:'#e9d4ff',deep:'#1c0a33',yangDeep:'#a85a06',yinDeep:'#4a168f'},{yang:'#ffab2e',yangHot:'#ffe7a0',yin:'#8f4dff',yinHot:'#dcc8ff',deep:'#160829',yangDeep:'#9a4a04',yinDeep:'#3e1280'},{yang:'#ffd04a',yangHot:'#fff6c8',yin:'#b86bff',yinHot:'#f0dcff',deep:'#22093a',yangDeep:'#b0680a',yinDeep:'#561a9a'}];
export function loadKhuyArt(scene){
 if(typeof Image==='undefined')return;
 if(!scene.khuySkinArt&&!scene.khuySkinLoading){scene.khuySkinLoading=true;const im=new Image();im.onload=()=>{scene.khuySkinArt=sliceTudoSkin(im);scene.characterFrames?.clear?.();};im.onerror=()=>scene.khuySkinLoading=false;im.src='/assets/khuy-niet-v1/skin.png';}
 if(!scene.khuyDragonArt&&!scene.khuyDragonLoading){scene.khuyDragonLoading=true;const im=new Image();im.onload=()=>{scene.khuyDragonArt=trimBlade(im);};im.onerror=()=>scene.khuyDragonLoading=false;im.src='/assets/khuy-niet-v1/dragon.png';}
}
function poseFrame(c,im,top,height,clock,alpha){if(!im||alpha<=.001)return;c.save();c.globalAlpha*=alpha;const bands=12;
 for(let i=0;i<bands;i++){const u=i/bands,shift=Math.sin(clock*.0019-u*2.6)*1.6*u*u;c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-57+shift,top+i*height/bands,114,height/bands+.25);}c.restore();}
export function drawKhuyBody(scene,c,p,pose,t){
 if(!khuyWorn(p))return false;loadKhuyArt(scene);if(!scene.khuySkinArt)return false;
 const gender=p.gender==='nu'?1:0,stand=clamp(pose.stand||0),clock=scene.motion===false?0:t;
 c.save();c.translate(0,pose.lift||0);c.rotate((pose.lean||0)*.5);
 poseFrame(c,scene.khuySkinArt[gender+2],-91,120,clock,1-stand);poseFrame(c,scene.khuySkinArt[gender],-116,144,clock,stand);c.restore();return true;}
// Nhịp thiên lôi: mỗi 8–10 s (lệch theo người) một tia sét giáng xuống đầu.
export function khuyStrike(t,seed=0,motion=true){if(!motion)return {flash:0,bolt:0};const period=8000+seed%2000,ph=((t+seed*53)%period)/period;return {bolt:ph>.9&&ph<.93?1:0,flash:ph>.9?Math.max(0,1-(ph-.9)/.1):0,phase:ph};}
// Rồng: lắc lư, thở; mỗi ~7 s gầm (phồng lên + phun sét).
export function khuyDragonPose(t,seed=0,motion=true){const clock=motion?t:0,period=7000+seed%1500,ph=((clock+seed*31)%period)/period,roar=motion&&ph>.8?Math.sin((ph-.8)/.2*Math.PI):0;
 return {x:Math.sin(clock*.0011+seed)*4,y:-84+Math.sin(clock*.0016+seed)*5,angle:Math.sin(clock*.0009+seed)*.05,scale:1+Math.sin(clock*.0021)*.02+roar*.08,roar};}
// Tia sét gấp khúc giữa 2 điểm; đổi hình mỗi 90 ms.
function bolt(c,x0,y0,x1,y1,seg,jit,key,s){c.beginPath();c.moveTo(x0,y0);for(let k=1;k<seg;k++){const u=k/seg;c.lineTo(x0+(x1-x0)*u+(rnd(k+key*7,s)-.5)*jit,y0+(y1-y0)*u+(rnd(k+key*13+3,s)-.5)*jit*.5);}c.lineTo(x1,y1);c.stroke();}
function boltPair(c,x0,y0,x1,y1,seg,jit,key,s,col,hot,w){c.strokeStyle=col;c.lineWidth=w*2.4;c.globalAlpha*=.45;bolt(c,x0,y0,x1,y1,seg,jit,key,s);c.globalAlpha/=.45;c.strokeStyle=hot;c.lineWidth=w;bolt(c,x0,y0,x1,y1,seg,jit,key,s);}
function glowBlob(c,x,y,rx,ry,col,a){if(a<=0)return;c.save();c.translate(x,y);c.scale(rx/100,ry/100);const g=c.createRadialGradient(0,0,0,0,0,100);g.addColorStop(0,col+Math.round(clamp(a)*255).toString(16).padStart(2,'0'));g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(-100,-100,200,200);c.restore();}
function drawDragon(scene,c,dp,pal,size,clock,seed,light){const im=scene.khuyDragonArt;c.save();c.translate(dp.x,dp.y);c.rotate(dp.angle);c.scale(dp.scale*size*.6,dp.scale*size*.6);
 const W=200,Hh=im?W*im.height/im.width:200;glowBlob(c,0,0,130,110,pal.yin,.35+dp.roar*.4);
 if(im)c.drawImage(im,-W/2,-Hh/2,W,Hh);else{c.strokeStyle=pal.yin;c.lineWidth=14;c.beginPath();c.arc(0,0,70,-.3,Math.PI*1.3);c.stroke();}
 // điện chạy dọc thân rồng
 c.globalCompositeOperation='lighter';c.lineCap='round';const key=Math.floor(clock/90);const n=light?2:4;
 for(let i=0;i<n;i++){const a0=-.4+i*.9+rnd(i+key,seed)*.4,a1=a0+.7;c.globalAlpha=.5+rnd(i+key+5,seed)*.5;boltPair(c,Math.cos(a0)*72,Math.sin(a0)*62,Math.cos(a1)*72,Math.sin(a1)*62,5,16,key+i,seed,pal.yin,pal.yinHot,1.4);}
 // gầm: phun tia sét từ đầu (góc trên phải) ra phía trước
 if(dp.roar>.25){c.globalAlpha=dp.roar;boltPair(c,6,-50,-70-dp.roar*50,-95-dp.roar*30,6,22,key+40,seed,pal.yin,'#ffffff',2.2);glowBlob(c,6,-50,40,40,pal.yinHot,dp.roar*.8);}
 c.restore();}
// Lưỡi lửa mềm vẽ sẵn 1 lần cho mỗi màu (như Tư Đồ) — dùng cho Lôi Diễm dưới chân.
function flameSprite(scene,color,hot){const cache=scene.khuyFlames??=new Map(),key=color+(hot?'+':'');if(cache.has(key))return cache.get(key);const f=(scene.surfaceFactory||makeSurface)(72,192);cache.set(key,f||null);if(!f)return null;
 const c=f.getContext('2d');c.globalCompositeOperation=hot?'lighter':'source-over';for(let k=0;k<28;k++){const u=k/27,y=176-u*160,r=(hot?17:26)*Math.pow(1-u,.85)+2,x=36+Math.sin(u*5.5)*5*u,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+(hot?'aa':'88'));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}return f;}
// Hai quả cầu Âm Dương bay quanh eo: vàng (Dương) và tím (Âm), luôn đối xứng.
export function khuyOrbs(t,seed=0,motion=true,stand=1){const clock=motion?t:0,a=clock*.0021*(seed%2?1:-1)+seed;return [0,1].map(i=>{const ang=a+i*Math.PI;return {x:Math.cos(ang)*58,y:(stand>.5?-62:-30)+Math.sin(ang*2)*6+Math.sin(ang)*14,z:Math.sin(ang),yang:i===0};});}
function drawOrb(c,o,pal,clock,i){const col=o.yang?pal.yang:pal.yin,deep=o.yang?pal.yangDeep:pal.yinDeep,r=5.5+o.z*1.2;c.save();c.globalCompositeOperation='screen';glowBlob(c,o.x,o.y,r*3,r*3,col,.45);c.globalCompositeOperation='source-over';const g=c.createRadialGradient(o.x-r*.35,o.y-r*.35,0,o.x,o.y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.35,col);g.addColorStop(1,deep);c.fillStyle=g;c.beginPath();c.arc(o.x,o.y,r,0,TAU);c.fill();c.restore();}
export function drawKhuyAdornment(scene,c,target,t,layer='front'){
 const p=target.player,worn=khuyWorn(p),dragon=p?.equipped===KHUY_DRAGON||(worn&&p.artifacts?.includes?.(KHUY_DRAGON))||!!target.showDragon;
 if(!worn&&!dragon)return;loadKhuyArt(scene);
 const sc=target.scale||1.4,motion=scene.motion!==false,clock=motion?t:0,seed=seedOf(p.id),pal=PALETTES[seed%PALETTES.length],light=scene.budget?.level==='light'||scene.crowded,
  pose=target.pose||scene.animator?.pose?.(p,clock,motion)||{},stand=pose.stand??1,up=-stand*13,strike=khuyStrike(clock,seed,motion),key=Math.floor(clock/90);
 c.save();c.translate(target.x,target.y);c.scale(sc,sc);c.translate(0,(pose.lift||0)+up);
 if(layer==='back'){
  if(worn){
   // 1) Nền tối tím dưới chân để nổi trên cả nền sáng
   glowBlob(c,0,22,80,24,pal.deep,.85);
   // 1b) Lôi Diễm: lửa sét 4 lớp (khói tím → tím/vàng → lõi nóng), nửa trái vàng, nửa phải tím; rộng hơn thân
   c.save();const nf=light?7:13;
   for(const [layerIx,hot,alpha,sh,sw] of [[0,false,.65,1.05,1.5],[1,false,.8,.95,1.25],[2,true,.5,.82,1],[3,true,.32,.5,.7]]){
    for(let i=0;i<nf;i++){const u=i/(nf-1)-.5,left=u<0,col=layerIx===0?pal.deep:layerIx===1?(left?pal.yangDeep:pal.yinDeep):layerIx===3?(left?pal.yangHot:pal.yinHot):(left?pal.yang:pal.yin),im=flameSprite(scene,col,hot);c.globalCompositeOperation=hot?'screen':'source-over';
     const fl=motion?Math.sin(clock*.008+i*1.7+seed+sh)*.5+.5:.6,h=(60+rnd(i,seed)*56)*(.75+fl*.35)*(1-Math.abs(u)*.45)*sh*(1+strike.flash*.35),w=(44+rnd(i+3,seed)*20)*sw,x=u*108+Math.sin(clock*.0026+i)*6;
     c.globalAlpha=alpha*(.75+fl*.25);if(im)c.drawImage(im,x-w/2,30-h,w,h);}}
   // sét bò trên ngọn lửa
   c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<(light?2:4);i++){const side=i%2?1:-1,x0=side*(20+rnd(i+key*3,seed)*40);c.globalAlpha=.7;boltPair(c,x0,26,x0+side*rnd(i+key,seed)*14,-30-rnd(i+key+1,seed)*40,4,12,key+i*5+50,seed,side<0?pal.yang:pal.yin,side<0?pal.yangHot:pal.yinHot,1.3);}
   c.restore();
   // 1c) Quả cầu Âm Dương phía sau thân
   {const os=khuyOrbs(t,seed,motion,stand);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.globalAlpha=.55;boltPair(c,os[0].x,os[0].y,os[1].x,os[1].y,7,16,key+90,seed,pal.yin,'#ffffff',1);c.restore();for(const [i,o] of os.entries())if(o.z<0)drawOrb(c,o,pal,clock,i);}
   // 2) Hào quang chia đôi: trái vàng (Dương Thực), phải tím (Âm Hư)
   const breath=motion?.85+Math.sin(clock*.003+seed)*.15:.9;c.save();c.globalCompositeOperation='lighter';
   glowBlob(c,-30,-58,62,100,pal.yang,.24*breath+strike.flash*.25);glowBlob(c,30,-58,62,100,pal.yin,.34*breath+strike.flash*.25);
   // 3) Sét chạy quanh thân: trái vàng, phải tím, đổi hình mỗi 90 ms
   c.lineCap='round';const n=light?3:6;
   for(let i=0;i<n;i++){const side=i%2?1:-1,y0=-120+rnd(i+key,seed)*70,y1=y0+40+rnd(i+key+2,seed)*60,x0=side*(36+rnd(i+key+4,seed)*18),x1=side*(30+rnd(i+key+6,seed)*26);c.globalAlpha=.55+rnd(i+key+8,seed)*.45;
    boltPair(c,x0,y0,x1,y1,5,14,key+i*3,seed,side<0?pal.yang:pal.yin,side<0?pal.yangHot:pal.yinHot,1.7);}
   // tia lửa điện bay lên
   const m=light?8:18;for(let i=0;i<m;i++){const life=motion?((clock*.0005+rnd(i,seed))%1):rnd(i,seed),side=i%2?1:-1,x=side*(10+rnd(i+9,seed)*55),y=20-life*160,a=Math.sin(life*Math.PI);c.globalAlpha=a*.9;c.fillStyle=side<0?pal.yangHot:pal.yinHot;c.fillRect(x-1,y-1,2.2,2.2);}
   c.restore();
   // 4) Mặt đất nứt vàng + vòng tím
   c.save();c.translate(0,22);c.scale(1,.3);c.globalCompositeOperation='lighter';c.lineCap='round';const pulse=motion?.6+Math.sin(clock*.004+seed)*.4:.8;
   c.strokeStyle=pal.yin;c.globalAlpha=.75;c.lineWidth=2.4;c.beginPath();c.arc(0,0,56,0,TAU);c.stroke();
   for(let i=0;i<9;i++){const a=i*TAU/9+rnd(i,seed)*.3;c.strokeStyle=pal.yang;c.globalAlpha=pulse*(.6+strike.flash*.4);c.lineWidth=2.2;c.beginPath();let r=12,x=Math.cos(a)*r,y=Math.sin(a)*r;c.moveTo(x,y);for(let k=1;k<=4;k++){r+=14+rnd(i*5+k,seed)*8;const aa=a+(rnd(i*7+k,seed)-.5)*.5;x=Math.cos(aa)*r;y=Math.sin(aa)*r;c.lineTo(x,y);}c.stroke();}
   // trận phù văn lôi: 2 vòng xoay ngược, 12 ký hiệu tia sét
   {const spin=motion?clock*.0008:0,dir=seed%2?1:-1;c.globalAlpha=.85;c.strokeStyle=pal.yang;c.lineWidth=1.6;c.beginPath();c.arc(0,0,66,0,TAU);c.stroke();c.save();c.rotate(spin*dir);for(let i=0;i<12;i++){c.rotate(TAU/12);c.strokeStyle=i%2?pal.yinHot:pal.yangHot;c.lineWidth=2;c.beginPath();c.moveTo(60,-4);c.lineTo(64,0);c.lineTo(61,1);c.lineTo(66,5);c.stroke();}c.restore();
    c.save();c.rotate(-spin*dir*1.5);c.strokeStyle=pal.yin;c.lineWidth=1.4;c.globalAlpha=.7;c.beginPath();for(let i=0;i<=6;i++){const aa=i*TAU/6*2;c.lineTo(Math.cos(aa)*40,Math.sin(aa)*40);}c.stroke();c.restore();}
   c.restore();
  }
  // 5) Tử Lôi Long cuộn sau vai (cả khi chỉ trang bị pháp bảo)
  if(dragon)drawDragon(scene,c,khuyDragonPose(t,seed,motion),pal,worn?1:.8,clock,seed,light);
 }else if(worn){
  // quả cầu Âm Dương phía trước thân
  for(const [i,o] of khuyOrbs(t,seed,motion,stand).entries())if(o.z>=0)drawOrb(c,o,pal,clock,i);
  // 6) Thiên lôi giáng xuống đầu + chớp
  if(strike.flash>0){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.globalAlpha=strike.flash;
   boltPair(c,(rnd(key,seed)-.5)*40,-520,0,-118,9,36,key,seed,rnd(seed,1)>.5?pal.yin:pal.yang,'#ffffff',2.6*strike.flash+.6);
   glowBlob(c,0,-118,60,60,'#ffffff',strike.flash*.8);glowBlob(c,0,20,110,34,pal.yang,strike.flash*.7);c.restore();}
  // vân nứt vàng thoáng sáng trên ngực theo nhịp thở
  if(!light&&motion){const a=.25+Math.sin(clock*.003+seed)*.2+strike.flash*.5;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=pal.yangHot;c.lineWidth=.8;c.beginPath();c.moveTo(-6,-92);c.lineTo(-2,-84);c.lineTo(-7,-76);c.moveTo(5,-90);c.lineTo(2,-82);c.lineTo(7,-74);c.stroke();c.restore();}
 }
 c.restore();}
// NPC khi sự kiện mở: Lôi Tôn lớn giữa sân, có rồng, sét giáng xuống lúc xuất hiện.
export function drawKhuyVisitor(scene,c,e,t,H){
 if(e?.kind!=='khuyniet'||Date.now()>=e.endsAt)return false;loadKhuyArt(scene);const im=scene.khuySkinArt?.[0];if(!im)return true;
 const p={id:'khuy-visitor',gender:'nam',realm:1,skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:KHUY_DRAGON},age=Date.now()-e.startedAt,rise=clamp(age/1500),target={id:p.id,player:p,x:450,y:H*.46+(1-rise)*-60,scale:2.1,pose:{stand:1}};
 c.save();if(age<1600){const k=1-age/1600;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*.5;c.fillStyle='#b98aff';c.fillRect(0,0,900,H);c.restore();}
 c.globalAlpha*=rise;drawKhuyAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);poseFrame(c,im,-116,144,scene.motion?t:0,1);c.restore();drawKhuyAdornment(scene,c,target,t,'front');c.restore();return true;}
