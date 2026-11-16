// 16/11/2026 (chủ game): vẽ TỌA KỸ + LINH CHÂU trên sân, nhiều lớp theo bậc (VFX-SKIN-CAO-CAP.md).
// Thường: 3 lớp (bóng, quầng màu, tọa kỹ nhún) · VIP: 8 lớp (khói mực, pháp trận tím xoay, sương tím, viền sáng,
// lôi tím chớp, hạt bay, sao) · Thần: 11 lớp (+ thần quang sau lưng, vân vĩ kim sắc, cột sáng, lông vũ, chớp sao ở đầu).
// HIỆU NĂNG: mọi texture tải/dựng 1 lần; mỗi khung chỉ drawImage + 'lighter'. Không filter/shadowBlur.
// Hạt tính thẳng từ thời gian (không mảng, không cấp phát). Ngân sách mỗi khung: tối đa FULL_BUDGET con vẽ đủ lớp,
// còn lại tự xuống 'light'. Sân đông: >30 người chỉ Thần còn hiệu ứng nhẹ, >50 người scene bỏ hết.
import {makeSurface} from './performance.js';
import {mountById,mountImage,orbImage,ORBS,MOUNT_TIERS} from './mounts.js';

const TAU=Math.PI*2;
const FX_NAMES=['vip-seal','vip-mist','vip-bolt','div-halo','div-seal','div-trail','div-pillar','div-feathers','div-flare'];
const images=new Map(),art={},silhouettes=new Map();
export const FULL_BUDGET=6;
let frameKey=-1,fullLeft=FULL_BUDGET;

function image(src){
 let im=images.get(src);
 if(!im&&typeof Image!=='undefined'){im=new Image();im.decoding='async';im.src=src;images.set(src,im);}
 return im&&im.complete&&im.naturalWidth?im:null;
}
const fx=name=>image('/assets/toa-ky-v1/fx-'+name+'.webp');
export function preloadMountArt(){for(const n of FX_NAMES)fx(n);}
const hash=(s,i=0)=>{let h=2166136261^i;for(let k=0;k<s.length;k++)h=Math.imul(h^s.charCodeAt(k),16777619);return (h>>>0)/4294967296;};
function surface(w,h,draw){const c=makeSurface(w,h);if(!c)return null;draw(c.getContext('2d'));return c;}
const radial=(key,stops)=>art[key]??=surface(128,128,c=>{const g=c.createRadialGradient(64,64,1,64,64,64);for(const [a,col] of stops)g.addColorStop(a,col);c.fillStyle=g;c.fillRect(0,0,128,128);});
const shadowArt=()=>radial('shadow',[[0,'#000000a0'],[.6,'#00000040'],[1,'#00000000']]);
const inkArt=()=>radial('ink',[[0,'#05030cb8'],[.55,'#0a061460'],[1,'#00000000']]);
const glowArt=tier=>radial('glow-'+tier,{common:[[0,'#9feaffa0'],[.5,'#5fd0ff30'],[1,'#00000000']],vip:[[0,'#e2c4ffc8'],[.45,'#a46bff58'],[1,'#00000000']],divine:[[0,'#fff3c8e0'],[.4,'#ffc85a70'],[1,'#00000000']]}[tier]);
const moteArt=tier=>radial('mote-'+tier,{common:[[0,'#ffffff'],[.3,'#b8f2ffa0'],[1,'#00000000']],vip:[[0,'#ffffff'],[.3,'#d6b0ffc0'],[1,'#00000000']],divine:[[0,'#ffffff'],[.3,'#ffe08ad0'],[1,'#00000000']]}[tier]);
const starArt=()=>art.star??=surface(64,64,c=>{c.translate(32,32);for(const [w,h] of [[30,2.2],[2.2,30]]){const g=c.createRadialGradient(0,0,0,0,0,30);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#fff4d0a0');g.addColorStop(1,'#ffe0a000');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}});
// Viền sáng: bóng trắng-màu của chính tọa kỹ, dựng 1 lần/tọa kỹ, cộng sáng nhịp thở.
function silhouette(id,im,color){
 const key=id+color;let s=silhouettes.get(key);if(s!==undefined)return s;
 s=surface(im.naturalWidth,im.naturalHeight,c=>{c.drawImage(im,0,0);c.globalCompositeOperation='source-in';c.fillStyle=color;c.fillRect(0,0,im.naturalWidth,im.naturalHeight);});
 silhouettes.set(key,s);return s;
}
function blit(c,im,x,y,w,h,alpha,add){if(!im||alpha<=.01)return;c.globalAlpha=alpha;c.globalCompositeOperation=add?'lighter':'source-over';c.drawImage(im,x-w/2,y-h/2,w,h);}
function ellipseSprite(c,im,x,y,w,squash,rot,alpha){
 if(!im||alpha<=.01)return;c.save();c.translate(x,y);c.scale(1,squash);c.rotate(rot);c.globalAlpha=alpha;c.globalCompositeOperation='lighter';
 const h=w*im.naturalHeight/im.naturalWidth;c.drawImage(im,-w/2,-h/2,w,h);c.restore();
}
// Hạt bay lên: vị trí tính từ thời gian, không lưu trạng thái.
function motes(c,tier,seed,x,y,w,h,n,t,size){
 const im=moteArt(tier);if(!im)return;c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){
  const r=hash(seed,i),life=2600+r*1800,p=((t+r*life*7)%life)/life;
  const px=x+(hash(seed,i+50)-.5)*w+Math.sin(t*.002+i)*5,py=y-p*h;
  c.globalAlpha=Math.sin(p*Math.PI)*.85;const s=size*(.6+r*.7);c.drawImage(im,px-s/2,py-s/2,s,s);
 }
}
function stars(c,seed,x,y,w,h,n,t,size){
 const im=starArt();if(!im)return;c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){
  const r=hash(seed,i+100),period=1700+r*1500,p=((t+r*period*3)%period)/period;if(p>.45)continue;
  const tw=Math.sin(p/.45*Math.PI),s=size*(.5+r*.6)*tw;c.globalAlpha=tw;
  c.drawImage(im,x+(hash(seed,i+130)-.5)*w-s/2,y-hash(seed,i+160)*h-s/2,s,s);
 }
}

// Báo đầu khung để chia ngân sách đủ lớp. crowd = số người trên sân.
export function beginMountFrame(now,crowd=0){frameKey=now;fullLeft=crowd>30?0:FULL_BUDGET;}
export function mountLod(tier,crowd=0){
 if(crowd>50)return 'off';
 if(tier==='common')return crowd>30?'off':'light';
 if(crowd>30)return tier==='divine'?'light':'off';
 if(fullLeft>0){fullLeft--;return 'full';}
 return 'light';
}
// Chỗ ngồi: khoảng cách từ mặt đất tới mặt ngồi (px) với tỉ lệ scale.
export function mountSeat(id,scale=1){
 const m=mountById(id),im=m&&image(mountImage(id));if(!m)return 0;
 const w=m.width*scale,h=im?w*im.naturalHeight/im.naturalWidth:w*.5;
 return HOVER*scale+h*(1-m.deck);
}
const HOVER=14;

// Vẽ tọa kỹ. (x,y) = điểm mặt đất dưới tâm tọa kỹ. layer: 'back' (sau nhân vật) | 'front' (hạt, sao phía trước).
export function drawMount(c,id,x,y,{scale=1,t=performance.now(),flip=false,lod='full',layer='back',seed=''}={}){
 const m=mountById(id);if(!m||lod==='off'&&layer==='front')return false;
 const im=image(mountImage(id));if(!im)return false;
 const tier=m.tier,w=m.width*scale,h=w*im.naturalHeight/im.naturalWidth,key=seed||id;
 const bob=Math.sin(t*.0021+hash(key)*TAU)*3*scale,cy=y-HOVER*scale-h/2+bob,full=lod==='full';
 c.save();
 if(layer==='front'){
  if(tier!=='common'){motes(c,tier,key,x,y-HOVER*scale,w*.9,h*1.6,full?(tier==='divine'?12:8):3,t,9*scale);if(full)stars(c,key,x,cy+h*.2,w,h*1.3,tier==='divine'?5:3,t,22*scale);}
  if(tier==='divine'&&full){const fl=fx('div-flare'),p=((t+hash(key,9)*5000)%5000)/5000;if(p<.12){const a=Math.sin(p/.12*Math.PI);blit(c,fl,x+(flip?-1:1)*w*.42,cy-h*.18,46*scale*(.6+a*.6),46*scale*(.6+a*.6),a*.9,true);}}
  c.restore();return true;
 }
 // 1. bóng đất
 blit(c,shadowArt(),x,y-2*scale,w*.85,16*scale,.9,false);
 if(lod!=='off'&&tier!=='common'){
  // 2. khói mực làm nền tối cho sáng nổi
  if(full)blit(c,inkArt(),x,cy+h*.1,w*1.25,h*1.3,.75,false);
  // 3. pháp trận dưới chân (ellipse, xoay chậm)
  ellipseSprite(c,fx(tier==='divine'?'div-seal':'vip-seal'),x,y-3*scale,w*(tier==='divine'?1.05:.95),.3,(full?t*.00025:0)*(flip?-1:1),full?.85:.55);
 }
 if(lod!=='off'&&tier==='divine'&&full){
  // 4. thần quang sau lưng, xoay rất chậm + thở
  const br=1+Math.sin(t*.0017)*.04;c.save();c.translate(x,cy-h*.05);c.rotate(t*.00012);blit(c,fx('div-halo'),0,0,w*.95*br,w*.95*br*1.22,.55,true);c.restore();
  // 5. vân vĩ kim sắc phía đuôi
  const tr=fx('div-trail');if(tr){c.save();c.translate(x+(flip?1:-1)*w*.42,cy+h*.15);if(flip)c.scale(-1,1);const sx=1+Math.sin(t*.003)*.06;blit(c,tr,0,0,w*.8*sx,w*.8*.83,.7,true);c.restore();}
 }
 if(lod!=='off'&&tier==='vip'&&full){
  // 4'. sương tím trôi sau lưng
  const dx=Math.sin(t*.0009)*8*scale;blit(c,fx('vip-mist'),x+dx,cy+h*.12,w*1.15,w*1.15*.84,.55+Math.sin(t*.0013)*.12,true);
 }
 // quầng màu bậc (rẻ, mọi bậc)
 if(lod!=='off')blit(c,glowArt(tier),x,cy+h*.15,w*1.05,h*1.1,tier==='common'?.35:tier==='vip'?.55:.32,true);
 // 6. tọa kỹ
 c.globalAlpha=1;c.globalCompositeOperation='source-over';
 if(flip){c.save();c.translate(x,0);c.scale(-1,1);c.drawImage(im,-w/2,cy-h/2,w,h);c.restore();}else c.drawImage(im,x-w/2,cy-h/2,w,h);
 if(lod!=='off'&&tier!=='common'){
  // 7. viền sáng nhịp thở
  const sil=silhouette(id,im,tier==='divine'?'#ffe7a0':'#d9b8ff'),a=(tier==='divine'?.08:.14)+Math.max(0,Math.sin(t*.0026))*(full?.16:.08);
  if(sil){c.globalAlpha=a;c.globalCompositeOperation='lighter';if(flip){c.save();c.translate(x,0);c.scale(-1,1);c.drawImage(sil,-w/2,cy-h/2,w,h);c.restore();}else c.drawImage(sil,x-w/2,cy-h/2,w,h);}
 }
 if(full&&tier==='vip'){
  // 8. lôi tím chớp theo nhịp bậc thang (không ngẫu nhiên mỗi khung)
  const step=Math.floor(t/140),on=hash(key,step)>.55;if(on)blit(c,fx('vip-bolt'),x,cy+h*.05,w*1.1,w*1.1*.65,.5+hash(key,step+1)*.4,true);
 }
 if(full&&tier==='divine'){
  // 8. cột sáng bùng mỗi ~9 s, 1,2 s
  const p=((t+hash(key,3)*9000)%9000)/1200;if(p<1){const a=Math.sin(p*Math.PI);blit(c,fx('div-pillar'),x,y-HOVER*scale-w*.45,w*.55,w*.9,a*.75,true);}
  // 9. lông vũ kim quang rơi chậm
  const fe=fx('div-feathers');if(fe){for(let i=0;i<2;i++){const p2=((t*.00008+i*.5+hash(key,i+20))%1);blit(c,fe,x+(i?.28:-.3)*w+Math.sin(t*.001+i)*10,cy-h*.6+p2*h*1.1,w*.42,w*.42*.93,Math.sin(p2*Math.PI)*.6,true);}}
 }
 c.restore();return true;
}

// Linh Châu đang truyền công: châu + quầng sáng theo tiến độ + vòng tiến độ mảnh dưới chân + hạt hút vào.
export function drawOrb(c,kind,x,y,{scale=1,t=performance.now(),progress=0,lod='full',seed=''}={}){
 const o=ORBS[kind];if(!o)return false;
 const stage=progress>=.7?1:0,im=image(orbImage(kind,stage));if(!im)return false;
 const size=44*scale,bob=Math.sin(t*.0024+hash(seed)*TAU)*2*scale,cy=y-size*.62+bob,tier=kind==='common'?'common':kind;
 c.save();
 const pulse=.5+.5*Math.sin(t*(.003+progress*.006));
 if(lod!=='off')blit(c,glowArt(tier),x,cy-size*.12,size*(1.7+progress*.8),size*(1.7+progress*.8),.35+pulse*.35*(.5+progress),true);
 c.globalAlpha=1;c.globalCompositeOperation='source-over';c.drawImage(im,x-size/2,cy-size/2,size,size*im.naturalHeight/im.naturalWidth);
 if(lod==='full'){
  // hạt hút vào lõi
  const mi=moteArt(tier);c.globalCompositeOperation='lighter';
  for(let i=0;i<6;i++){const r=hash(seed+kind,i),p=((t*.0006+r)%1),a=r*TAU+t*.0008,d=(1-p)*size*.95;c.globalAlpha=Math.sin(p*Math.PI)*.8;const s=6*scale;c.drawImage(mi,x+Math.cos(a)*d-s/2,cy-size*.15+Math.sin(a)*d*.6-s/2,s,s);}
 }
 // vòng tiến độ
 c.globalAlpha=.9;c.globalCompositeOperation='source-over';c.lineWidth=2.4*scale;c.lineCap='round';
 c.strokeStyle='#00000080';c.beginPath();c.ellipse(x,y-1,size*.55,size*.16,0,0,TAU);c.stroke();
 c.strokeStyle=o.color;c.beginPath();c.ellipse(x,y-1,size*.55,size*.16,0,-Math.PI/2,-Math.PI/2+TAU*Math.max(.02,Math.min(1,progress)));c.stroke();
 c.restore();return true;
}
export const MOUNT_TIER_COLOR=tier=>MOUNT_TIERS[tier]?.color||'#fff';
