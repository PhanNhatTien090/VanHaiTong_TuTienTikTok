// Chân Tiên v4 — Cửu Kiếp Phi Thăng · Tiên Môn Khai Thiên (07/11/2026). Toạ độ cảnh 900 × H.
// Nhân quả: sét lóe lộ kiếp vân → tụ kiếp → đợt kiếp 1 (3 sét trắng, khiên thân đỡ) → ngũ linh căn bay lên biến hình,
// xếp ngũ giác → đợt kiếp 2 (3 sét tím, ngũ giác hấp thụ) → đợt kiếp 3 (cột sét vàng), ngũ linh căn hợp nhất → lặng →
// kiếp vân tách, Tiên Môn mở, tiếp dẫn quang → phi thăng xuyên mây, qua cổng → thế giới tiên → rồng dâng tiên châu →
// tiên châu nhập đan điền → nổ → đổi skin → tiên quang.
import {makeSurface} from './performance.js';
import {loadSpiritBeasts,drawFlyingDragon} from './gift-spirit-beasts.js';
export const CT_TIMING=Object.freeze({duration:31.6,flash:.05,gather:.4,roots:7,formed:9.2,charge:14,column:15.4,merge:15.4,hush:16.6,gate:17,beam:17.8,ascend:19,through:22,heaven:22.2,dragon:23,pearl:25.2,absorbed:27.1,impact:27.35,reveal:27.6,fade:30.4});
export const CT_WAVE1=Object.freeze([3.6,4.6,5.6]),CT_WAVE2=Object.freeze([10.8,11.8,12.8]);
const T=CT_TIMING,TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export const CT_ROOTS=Object.freeze([{id:'kim',name:'Kim',color:'#ffe08a'},{id:'moc',name:'Mộc',color:'#8cf59a'},{id:'thuy',name:'Thủy',color:'#7fd4ff'},{id:'hoa',name:'Hỏa',color:'#ff8a5c'},{id:'tho',name:'Thổ',color:'#e0b070'}]);
const BOLT={white:['#3f7dff','#9fd2ff','#f4fbff'],violet:['#7a3cff','#c59bff','#fbf2ff'],gold:['#ff9a2a','#ffd36b','#fffbe8']};
export function chanTienFormationState(t,H=1600,motion=true){
 const climb=ease((t-T.ascend)/(T.through-T.ascend)),feet=H*.74-climb*H*.14*(1-ease((t-T.heaven)/.8));
 return {t,H,motion,clock:motion?t:0,feet,belly:feet-145,eyeY:H*.19,
  wake:ease(t/.35),vortex:ease((t-T.gather)/2.5)*(1-ease((t-T.gate)/1.4)),spin:t<T.gate?1+clamp((t-T.gather)/14)*2.2:3.2,
  rootsRise:Array.from({length:5},(_,i)=>ease((t-T.roots-i*.25)/1.1)),morph:ease((t-T.roots-1.4)/.9),
  merge:ease((t-T.merge)/1.2),core:ease((t-T.merge-.6)/.6)*(1-ease((t-T.beam)/.8)),
  charge:ease((t-T.charge)/1.3)*(1-ease((t-T.column-.05)/.1)),
  gate:ease((t-T.gate)/1.4),beam:ease((t-T.beam)/.7)*(1-ease((t-T.through)/.3)),climb,
  through:t<T.through-.15?0:Math.exp(-Math.abs(t-T.through)*7),heaven:ease((t-T.heaven)/.9),
  dragon:ease((t-T.dragon)/1)*(1-ease((t-T.pearl+.6)/1)),pearl:ease((t-T.pearl)/.6)*(1-ease((t-T.absorbed)/.12)),
  pearlTravel:ease((t-T.pearl-1)/(T.absorbed-T.pearl-1)),
  compression:ease((t-T.absorbed+.15)/.25)*(1-ease((t-T.impact)/.06)),blast:t<T.impact?0:clamp((t-T.impact)/1.6),after:ease((t-T.reveal)/.4),fade:1-ease((t-T.fade)/1.2)};
}
// Cường độ sét lóe tại thời điểm t (dùng cho chớp nền, khiên, rung máy).
export function ctBoltAt(t){const hits=[...CT_WAVE1.map(a=>[a,'white',.8]),...CT_WAVE2.map(a=>[a,'violet',1]),[T.column,'gold',1.4]];let best=null;for(const [a,kind,f] of hits){const age=t-a;if(age<0||age>.6)continue;const p=Math.exp(-age*9)*f;if(!best||p>best.p)best={at:a,kind,p,age};}if(t>=0&&t<.6){const p=Math.exp(-(t-T.flash)*8)*(t>=T.flash?1:0);if(!best||p>best.p)best={at:T.flash,kind:'white',p,age:t-T.flash};}return best;}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
export function prepareChanTienArt(scene){
 loadSpiritBeasts(scene);if(typeof Image==='undefined')return;
 for(const [key,src] of [['chanTienPeakArt','/assets/chan-tien-v4/tribulation-peak.png'],['chanTienHeavenArt','/assets/chan-tien-cinema-v2/immortal-world.png']])
  if(!scene[key]){const im=new Image();scene[key]=im;im.onload=()=>{scene.chanTienAssets=null;};im.src=src;}
}
function buildAssets(scene,H){
 const cache=scene.chanTienAssets;if(cache?.H===H)return cache;
 const peakArt=ready(scene.chanTienPeakArt)?scene.chanTienPeakArt:null,heavenArt=ready(scene.chanTienHeavenArt)?scene.chanTienHeavenArt:null;
 const fill=(c,art,top,bottom)=>{c.scale(.5,.5);if(art)c.drawImage(art,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bottom);c.fillStyle=g;c.fillRect(0,0,900,H);}};
 const peak=surface(450,H/2,c=>{fill(c,peakArt,'#0b0f24','#1d2338');if(!peakArt){c.fillStyle='#141828';c.beginPath();c.moveTo(250,H);c.lineTo(390,H*.8);c.lineTo(510,H*.8);c.lineTo(650,H);c.closePath();c.fill();}});
 const heaven=surface(450,H/2,c=>fill(c,heavenArt,'#cfe8ff','#f3fbff'));
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#fff1c8b0');g.addColorStop(.5,'#ffd78a30');g.addColorStop(1,'#ffd78a00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 // tầng mây phi thăng (cuộn xuống khi bay lên)
 const cloud=surface(512,160,c=>{for(let i=0;i<14;i++){const x=rnd(i+3)*512,y=60+rnd(i+9)*60,r=40+rnd(i+11)*60,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#e9f1ffcc');g.addColorStop(1,'#e9f1ff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.5,170,450,H*.5,H*.72);g.addColorStop(0,'#03040c00');g.addColorStop(.55,'#03040c00');g.addColorStop(1,'#03040cd0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 return scene.chanTienAssets={H,peak,heaven,glow,cloud,vignette};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
// Sét phân nhánh: lõi trắng nóng + vỏ màu, nhánh phụ; không dùng sin chạy đều.
export function ctBolt(c,x0,y0,x1,y1,seed,power,kind='white',width=1,light=false){
 if(power<=.005)return;const col=BOLT[kind],dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy),nx=-dy/Math.max(1,len),ny=dx/Math.max(1,len),pts=[];
 for(let i=0;i<=20;i++){const u=i/20,j=(rnd(seed+i*17)-.5)*Math.sin(u*Math.PI)*Math.min(110,len*.18);pts.push([x0+dx*u+nx*j,y0+dy*u+ny*j]);}
 c.save();c.globalCompositeOperation='screen';c.lineJoin='round';c.lineCap='round';
 for(const [w,k,a] of [[18*width,0,.22],[6*width,1,.7],[2*width,2,1]]){if(light&&k===0)continue;c.globalAlpha=power*a;c.lineWidth=w;c.strokeStyle=col[k];c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 c.globalAlpha=power*.6;c.strokeStyle=col[1];c.lineWidth=1.2*width;for(let i=3;i<18;i+=light?5:3){const [x,y]=pts[i],s=i%2?1:-1;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*.05+nx*s*45,y+dy*.05+ny*s*45);c.lineTo(x+dx*.15+nx*s*28,y+dy*.15+ny*s*28);c.stroke();}c.restore();}
// Nền: đỉnh Độ Kiếp (rơi xuống khi phi thăng) → tầng mây → thế giới tiên (bay vào có chiều sâu).
export function drawCtWorld(scene,c,st,v){
 const a=buildAssets(scene,st.H),H=st.H;
 if(st.t<T.through+.1){const off=ease((st.t-T.ascend)/(T.through-T.ascend))*H*.9;c.drawImage(a.peak,0,off,900,H);
  if(off>0){const g=c.createLinearGradient(0,0,0,off+2);g.addColorStop(0,'#eaf3ff');g.addColorStop(1,'#7f8fb8');c.fillStyle=g;c.fillRect(0,0,900,off+2);const f=c.createLinearGradient(0,off-4,0,off+260);f.addColorStop(0,'#7f8fb8');f.addColorStop(1,'#7f8fb800');c.fillStyle=f;c.fillRect(0,off-4,900,264);}
  // lóe sét chiếu sáng cả bầu trời
  const b=ctBoltAt(st.t);if(b){c.save();c.globalCompositeOperation='screen';c.globalAlpha=b.p*.35*(st.motion?1:.3);c.fillStyle=b.kind==='gold'?'#ffd36b':b.kind==='violet'?'#b48cff':'#9fc8ff';c.fillRect(0,0,900,H);c.restore();}
 }
 if(st.climb>0&&st.t<T.heaven+.4){// tầng mây cuộn xuống nhanh khi bay lên
  c.save();for(let i=0;i<(scene.budget?.level==='light'?5:9);i++){const sp=.6+rnd(i)*.8,y=((rnd(i+5)*H+st.climb*H*3.2*sp)%(H+300))-150,x=rnd(i+8)*900-250;c.globalAlpha=st.climb*(1-st.heaven)*.75;c.drawImage(a.cloud,x,y,700,220);}c.restore();}
 if(st.t>=T.through-.15){const z=mix(1.45,1,ease((st.t-T.through)/2.4)),w=900*z,h=H*z;c.save();c.globalAlpha=clamp((st.t-T.through+.15)/.3);c.drawImage(a.heaven,450-w/2,H*.5-h*.5,w,h);c.restore();}
}
// Kiếp vân xoáy: các vòng mây tối quay quanh mắt bão, lõi tím sáng dần.
export function drawCtVortex(scene,c,st,v){
 if(st.vortex<=0&&st.gate<=0)return;const a=buildAssets(scene,st.H),x=450,y=st.eyeY-(st.t>T.ascend?ease((st.t-T.ascend)/2)*st.H*.4:0),dir=v?.flip?-1:1,light=scene.budget?.level==='light';
 if(st.vortex>0){c.save();c.globalAlpha=st.vortex;c.lineCap='round';
 for(let i=0;i<(light?10:18);i++){const r=40+i*26,ang=st.clock*st.spin*.18*dir*(1.4-i*.05)+i*1.3;c.strokeStyle=i%3?'#141a32':'#2a2050';c.globalAlpha=st.vortex*(.55-i*.018);c.lineWidth=10+i*1.2;c.beginPath();c.ellipse(x,y,r*1.6,r*.55,0,ang,ang+2.2+rnd(i)*1.2);c.stroke();}
 c.restore();halo(c,a.glow,x,y,260+st.charge*200,120+st.charge*90,st.vortex*(.25+st.charge*.5));}
 // Tiên Môn mở giữa mắt bão: hai cánh mây tách, cổng ánh sáng
 if(st.gate>0&&st.t<T.through){c.save();c.globalCompositeOperation='screen';const w=mix(20,260,st.gate),h=w*1.25,gy=st.eyeY-(st.t>T.ascend?0:0);
  for(let i=0;i<24;i++){const ang=-Math.PI/2+(i-11.5)*.13+Math.sin(st.clock*.5+i)*.02;c.globalAlpha=st.gate*.18;c.strokeStyle='#ffe6a8';c.lineWidth=14;c.beginPath();c.moveTo(x,gy-h*.4);c.lineTo(x+Math.cos(ang)*900,gy-h*.4+Math.sin(ang)*900);c.stroke();}
  const g=c.createLinearGradient(0,gy-h,0,gy+h*.2);g.addColorStop(0,'#fff6d830');g.addColorStop(1,'#ffd78a00');c.fillStyle=g;c.globalAlpha=st.gate;c.beginPath();c.moveTo(x-w/2,gy+h*.2);c.lineTo(x-w/2,gy-h*.6);c.quadraticCurveTo(x,gy-h*1.05,x+w/2,gy-h*.6);c.lineTo(x+w/2,gy+h*.2);c.closePath();c.fill();
  c.strokeStyle='#ffe6a8';c.lineWidth=4;c.stroke();c.lineWidth=10;c.globalAlpha=st.gate*.3;c.stroke();
  // hai trụ + mái cong của cổng
  c.globalAlpha=st.gate;c.strokeStyle='#fff3cf';c.lineWidth=5;for(const s of [-1,1]){c.beginPath();c.moveTo(x+s*(w/2+16),gy+h*.25);c.lineTo(x+s*(w/2+16),gy-h*.62);c.stroke();}
  for(let tier=0;tier<3;tier++){const ty=gy-h*(.66+tier*.13),tw=w/2+60-tier*22;c.lineWidth=5-tier;c.beginPath();c.moveTo(x-tw,ty);c.quadraticCurveTo(x,ty-h*.12,x+tw,ty);c.stroke();c.beginPath();c.moveTo(x-tw,ty);c.lineTo(x-tw-14,ty-10);c.moveTo(x+tw,ty);c.lineTo(x+tw+14,ty-10);c.stroke();}c.restore();halo(c,a.glow,x,gy-h*.3,w*2.4,h*2,st.gate*.7);}
}
// Ánh tiếp dẫn: cột sáng từ cổng xuống người.
export function drawCtBeam(scene,c,st){if(st.beam<=0)return;const a=buildAssets(scene,st.H),w=mix(30,160,st.beam);c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(450-w,0,450+w,0);g.addColorStop(0,'#ffe6a800');g.addColorStop(.5,'#fff3d0cc');g.addColorStop(1,'#ffe6a800');c.fillStyle=g;c.globalAlpha=st.beam;c.fillRect(450-w,0,w*2,st.feet+30);
 for(let i=0;i<14;i++){const u=(st.clock*.6+i/14)%1,y=mix(st.feet,0,u),x=450+(rnd(i)-.5)*w*1.4;c.globalAlpha=st.beam*Math.sin(u*Math.PI);c.fillStyle='#fffbe8';c.fillRect(x,y,2,8);}c.restore();halo(c,a.glow,450,st.feet,420,120,st.beam*.6);}
// Đợt kiếp: sét đánh vào khiên trên thân (đợt 1), vào ngũ giác (đợt 2), cột sét vàng (đợt 3).
export function rootSlot(i,st){const cx=450,cy=st.feet-760,a=-Math.PI/2+i*TAU/5;return {x:cx+Math.cos(a)*130,y:cy+Math.sin(a)*110};}
export function drawCtTribulation(scene,c,st,v){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',top=st.eyeY,motion=st.motion?1:.3;
 {const age=st.t-T.flash;if(age>=0&&age<.5)ctBolt(c,520,0,380,st.H*.55,7,Math.exp(-age*7)*motion,'white',2.5,light);}
 CT_WAVE1.forEach((at,k)=>{const age=st.t-at;if(age<0||age>.5)return;const p=Math.exp(-age*8)*motion,x0=450+(rnd(k+3)-.5)*240;ctBolt(c,x0,top,450,st.feet-470,40+k*7,p,'white',2.2,light);halo(c,a.glow,450,st.feet-470,320,320,p);
  // khiên thân lóe + đá văng
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=p*.8;c.strokeStyle='#bfe0ff';c.lineWidth=3;c.beginPath();c.ellipse(450,st.feet-300,190,330,0,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();
  for(let i=0;i<(light?6:12);i++){const u=clamp(age/.5),ang=-Math.PI*.15-rnd(i+k*20)*Math.PI*.7,d=u*(120+rnd(i)*200);c.save();c.globalAlpha=(1-u);c.fillStyle='#2a2c38';c.translate(450+Math.cos(ang)*d*(i%2?1:-1),st.feet+Math.sin(ang)*d+u*u*160);c.rotate(i+u*4);c.fillRect(-6,-5,12,10);c.restore();}});
 CT_WAVE2.forEach((at,k)=>{const age=st.t-at;if(age<0||age>.55)return;const p=Math.exp(-age*7)*motion;for(const i of [k,(k+2)%5]){const s=rootSlot(i,st);ctBolt(c,450+(rnd(k+i)-.5)*300,top,s.x,s.y,60+k*9+i,p,'violet',3,light);halo(c,a.glow,s.x,s.y,260,260,p);}});
 const col=st.t-T.column;if(col>=0&&col<1.1){const p=Math.exp(-col*2.6)*motion,cy=st.feet-760,bottom=st.feet-540;c.save();c.globalCompositeOperation='screen';const w=150*p+40,g=c.createLinearGradient(450-w,0,450+w,0);g.addColorStop(0,'#ffd36b00');g.addColorStop(.35,'#ffd36b88');g.addColorStop(.5,'#fffbe8');g.addColorStop(.65,'#ffd36b88');g.addColorStop(1,'#ffd36b00');c.fillStyle=g;c.globalAlpha=p;c.fillRect(450-w,0,w*2,bottom);c.restore();ctBolt(c,450,0,450,bottom,99,p,'gold',4,light);ctBolt(c,450,0,452,bottom,131,p*.7,'gold',2,light);halo(c,a.glow,450,cy,700,700,p);halo(c,a.glow,450,bottom,420,260,p*.8);}
 if(st.charge>0&&st.t<T.column)halo(c,a.glow,450,top,500*st.charge,220*st.charge,st.charge*.6);
}
// Ngũ linh căn: 5 cầu sáng từ đan điền bay lên, biến hình thành biểu tượng hành, xếp ngũ giác; hợp nhất thành lõi.
function rootGlyph(c,id,s,color){c.strokeStyle=color;c.fillStyle=color;c.lineWidth=3;c.lineCap='round';c.lineJoin='round';c.beginPath();
 if(id==='kim'){c.moveTo(0,-26*s);c.lineTo(5*s,12*s);c.lineTo(-5*s,12*s);c.closePath();c.fill();c.fillRect(-12*s,12*s,24*s,4*s);c.fillRect(-2*s,16*s,4*s,12*s);return;}
 if(id==='moc'){c.moveTo(0,26*s);c.lineTo(0,-6*s);c.stroke();c.beginPath();c.ellipse(0,-12*s,14*s,18*s,0,0,TAU);c.fill();return;}
 if(id==='thuy'){for(let r=0;r<3;r++){c.moveTo(-22*s,(r*12-12)*s);for(let i=1;i<=8;i++)c.lineTo((-22+i*5.5)*s,(r*12-12+Math.sin(i*1.6)*5)*s);}c.stroke();return;}
 if(id==='hoa'){c.moveTo(0,-28*s);c.quadraticCurveTo(18*s,0,8*s,20*s);c.quadraticCurveTo(0,26*s,-8*s,20*s);c.quadraticCurveTo(-18*s,0,0,-28*s);c.fill();return;}
 c.moveTo(-24*s,20*s);c.lineTo(-6*s,-16*s);c.lineTo(4*s,0);c.lineTo(12*s,-24*s);c.lineTo(26*s,20*s);c.closePath();c.fill();}
export function drawCtRoots(scene,c,st,v){
 if(st.t<T.roots||st.t>T.beam+.8)return;const a=buildAssets(scene,st.H),cx=450,cy=st.feet-760,merge=st.merge;
 const ring=st.morph*(1-merge);if(ring>0){c.save();c.globalCompositeOperation='screen';c.globalAlpha=ring*.75;c.strokeStyle='#fff1c8';c.lineWidth=2;c.beginPath();for(let i=0;i<=5;i++){const s=rootSlot((i*2)%5,st);i?c.lineTo(s.x,s.y):c.moveTo(s.x,s.y);}c.stroke();c.globalAlpha=ring*.4;c.beginPath();c.ellipse(cx,cy,150,128,st.clock*.3,0,TAU);c.stroke();c.restore();}
 CT_ROOTS.forEach((r,i)=>{const rise=st.rootsRise[i];if(rise<=0)return;const s=rootSlot(i,st),spin=st.clock*.6*(v?.flip?-1:1)*st.morph,ang=-Math.PI/2+i*TAU/5+spin,
   tx=mix(s.x,cx+Math.cos(ang)*130,st.morph),ty=mix(s.y,cy+Math.sin(ang)*110,st.morph),x=mix(mix(450,tx,rise),cx,merge),y=mix(mix(st.belly,ty,rise),cy,merge);
  halo(c,a.glow,x,y,110,110,(1-merge*.6)*.9);if(rise<1&&st.t<T.formed){c.save();c.globalCompositeOperation='screen';c.strokeStyle=r.color;c.globalAlpha=(1-rise)*.6;c.lineWidth=3;c.beginPath();c.moveTo(450,st.belly);c.quadraticCurveTo(450+(x-450)*.2,mix(st.belly,y,.6),x,y);c.stroke();c.restore();}
  c.save();c.translate(x,y);c.globalAlpha=(1-merge);if(st.morph<1){c.globalCompositeOperation='screen';c.fillStyle=r.color;c.beginPath();c.arc(0,0,14*(1-st.morph)+4,0,TAU);c.fill();}
  if(st.morph>0){c.globalAlpha=st.morph*(1-merge);c.globalCompositeOperation='screen';rootGlyph(c,r.id,.9+st.morph*.3,r.color);}c.restore();});
 // lõi ngũ hành hợp nhất
 if(st.core>0){c.save();c.globalCompositeOperation='screen';for(let i=0;i<5;i++){c.globalAlpha=st.core*.7;c.fillStyle=CT_ROOTS[i].color;c.beginPath();const a2=st.clock*2+i*TAU/5;c.ellipse(cx+Math.cos(a2)*8,cy+Math.sin(a2)*8,26,26,0,0,TAU);c.fill();}c.restore();halo(c,a.glow,cx,cy,260,260,st.core);}
}
// Thế giới tiên: rồng (asset gift-beasts) lượn quanh, ngậm tiên châu rồi dâng; châu bay vào đan điền.
export function drawCtHeaven(scene,c,st,v,front){
 if(st.t<T.heaven)return;const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 if(!front){c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?8:16);i++){const ang=-Math.PI/2+(i-7.5)*.11;c.globalAlpha=st.heaven*.12*st.fade;c.strokeStyle='#fff4d0';c.lineWidth=18;c.beginPath();c.moveTo(450,st.H*.08);c.lineTo(450+Math.cos(ang)*1600,st.H*.08+Math.sin(ang+Math.PI)*-1600);c.stroke();}c.restore();}
 if(st.dragon>0){const ph=(st.t-T.dragon)/4.5,r=290*(1-ease((st.t-T.pearl)/1.4)*.45),y=st.belly-150;c.save();if(front){c.beginPath();c.rect(0,y,900,st.H);c.clip();}else{c.beginPath();c.rect(0,0,900,y);c.clip();}
  drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x:450,y,radius:r,phase:st.motion?ph:.35,time:st.motion?st.clock*1000:0,color:1,side:v?.flip?1:-1,scale:1.05,light,alpha:st.dragon*st.fade});c.restore();}
 if(front&&st.pearl>0){const sx=450+(v?.flip?-1:1)*220,sy=st.belly-330,x=mix(sx,450,st.pearlTravel),y=mix(sy,st.belly,st.pearlTravel)-Math.sin(st.pearlTravel*Math.PI)*80;
  halo(c,a.glow,x,y,150,150,st.pearl);c.save();c.globalCompositeOperation='screen';c.globalAlpha=st.pearl;const g=c.createRadialGradient(x-4,y-4,1,x,y,16);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#ffe7a8');g.addColorStop(1,'#ffb84d');c.fillStyle=g;c.beginPath();c.arc(x,y,16,0,TAU);c.fill();c.restore();}
}
export function drawCtBody(scene,c,st){const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',power=(.3+clamp((st.t-T.roots)/10)*.7)*st.fade*(st.t<T.impact?1:.35);
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?6:12);i++){const side=i%2?1:-1,u=(st.clock*.8+i*.173)%1,x=450+side*(42+Math.sin(u*Math.PI)*48),y=st.feet-30-u*280;c.globalAlpha=power*Math.sin(u*Math.PI)*.45;c.strokeStyle=i%3?'#ffe6a8':'#bfe0ff';c.lineWidth=i%4?1.3:2.4;c.beginPath();c.moveTo(x-side*8,y+26);c.quadraticCurveTo(x+side*12,y+6,x,y-16);c.stroke();}c.restore();
 halo(c,a.glow,450,st.belly,110+st.compression*130,110+st.compression*130,power*.14+st.compression*.6);}
export function drawCtBreak(scene,c,st,v){if(st.t<T.impact)return;const a=buildAssets(scene,st.H),age=st.t-T.impact;
 for(let i=0;i<8;i++){const u=clamp((age-i*.08)/1.3);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*.75*(st.motion?1:.3);c.strokeStyle=i%2?'#ffe6a8':'#ffffff';c.lineWidth=5*(1-u)+1;c.beginPath();const R=50+ease(u)*900;c.ellipse(450,i%2?st.feet+40:st.belly,R,R*(i%2?.25:.8),0,0,TAU);c.stroke();c.restore();}
 for(let i=0;i<5;i++){const u=clamp(age/1.4),ang=-Math.PI/2+i*TAU/5+v.phase,d=u*520;c.save();c.globalCompositeOperation='screen';c.globalAlpha=(1-u);c.translate(450+Math.cos(ang)*d,st.belly+Math.sin(ang)*d*.7);rootGlyph(c,CT_ROOTS[i].id,1.2,CT_ROOTS[i].color);c.restore();}
 halo(c,a.glow,450,st.belly,780,780,Math.exp(-age*6)*.32);}
// Tiên quang sau hiện thân: đĩa sáng sau đầu + cánh hoa rơi.
export function drawCtAfter(scene,c,st,v){if(st.after<=0)return;const a=buildAssets(scene,st.H),p=st.after*st.fade,light=scene.budget?.level==='light';
 halo(c,a.glow,450,st.feet-470,520,520,p*.35);c.save();c.globalCompositeOperation='screen';c.globalAlpha=p*.5;c.strokeStyle='#ffe6a8';c.lineWidth=2;c.beginPath();c.arc(450,st.feet-470,150,0,TAU);c.stroke();
 for(let i=0;i<24;i++){const ang=i*TAU/24+st.clock*.15;c.globalAlpha=p*.35;c.beginPath();c.moveTo(450+Math.cos(ang)*160,st.feet-470+Math.sin(ang)*160);c.lineTo(450+Math.cos(ang)*(190+(i%3)*14),st.feet-470+Math.sin(ang)*(190+(i%3)*14));c.stroke();}
 for(let i=0;i<(light?14:30);i++){const u=((st.clock*.12)+rnd(i))%1,x=rnd(i+40)*900+Math.sin(u*6+i)*30,y=u*st.H;c.globalAlpha=p*.8;c.fillStyle=i%3?'#ffd6e4':'#fff3cf';c.save();c.translate(x,y);c.rotate(u*6+i);c.beginPath();c.ellipse(0,0,5,2.5,0,0,TAU);c.fill();c.restore();}c.restore();}
export function drawCtEdges(scene,c,st){const a=buildAssets(scene,st.H);c.drawImage(a.vignette,0,0,900,st.H);
 if(st.through>0){c.save();c.globalAlpha=st.through*(st.motion?1:.4);c.fillStyle='#fffbef';c.fillRect(0,0,900,st.H);c.restore();}
 const p=st.t<T.impact?(.06+st.charge*.15+st.compression*.3):Math.exp(-(st.t-T.impact)*4)*.55;for(const x of [0,900])for(const y of [0,st.H])halo(c,a.glow,x,y,520,760,p*st.fade);}
