// Đại Thừa v2 — Kiếm Trủng Triều Tông · Đại Đạo Kim Kiều (07/11/2026). Toạ độ cảnh 900 × H.
// Nhân quả: thung lũng kiếm trủng rung → vạn kiếm rút khỏi núi → thành sông kiếm ngang trời → quay mũi cúi chào (triều tông)
// → Đại Đạo kim kiều trải tới chân, 9 đạo bia mọc → 3 kiếm ý thử thách, kiếm ý bản thân đỡ → sông kiếm quấn thành tháp xoắn
// → tháp co thành một kiếm quang lao vào đan điền → nổ → đổi skin → vạn kiếm rơi về cắm lại núi, dựng thẳng hành lễ.
import {makeSurface} from './performance.js';
export const DT_TIMING=Object.freeze({duration:22.8,quake:.08,rise:.3,river:3,bow:6,road:9,trial:12,tower:15,contract:17.8,dive:18.35,absorbed:18.85,impact:19,reveal:19.3,fade:21.6});
export const DT_BOWS=Object.freeze([6.3,7.3,8.3]),DT_STRIKES=Object.freeze([12.4,13.4,14.4]);
const T=DT_TIMING,TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const C={gold:'#ffd98a',steel:'#cfe3ff',violet:'#c6b7ff',white:'#fff6e4',deep:'#090b1c'};
export function daiThuaFormationState(t,H=1600,motion=true){
 const feet=H*.78;
 return {t,H,motion,clock:motion?t:0,feet,belly:feet-145,horizon:H*.18,
  quake:t<T.quake?0:Math.exp(-(t-T.quake)*1.6)*(t<3?1:0),wake:ease(t/.4),
  river:ease((t-T.river)/1.6),bow:ease((t-T.bow)/.6)*(1-ease((t-T.road)/.8)),road:ease((t-T.road)/1.6)*(1-ease((t-T.contract)/1)),
  tablets:Array.from({length:9},(_,i)=>ease((t-T.road-.8-i*.18)/.6)*(1-ease((t-T.contract-i*.04)/.6))),
  tower:ease((t-T.tower)/1.3),contract:ease((t-T.contract)/1),dive:ease((t-T.dive)/.5),
  compression:ease((t-T.absorbed+.1)/.2)*(1-ease((t-T.impact)/.06)),blast:t<T.impact?0:clamp((t-T.impact)/1.6),
  fall:ease((t-T.impact-.15)/1.6),salute:ease((t-T.reveal-.3)/1.2),after:ease((t-T.reveal)/.4),fade:1-ease((t-T.fade)/1.2)};
}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
export function prepareDaiThuaWorld(scene){if(scene.daiThuaWorldArt||typeof Image==='undefined')return;const im=new Image();scene.daiThuaWorldArt=im;im.onload=()=>{scene.daiThuaAssets=null;};im.src='/assets/dai-thua-v2/sword-valley.png';}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
// Vạn kiếm: gốc cắm trên 4 tầng núi (xa → gần); số lượng cố định theo mức đồ hoạ.
export function dtSwordCount(light){return light?140:320;}
// Khớp ảnh sword-valley: tầng xa trên các dãy núi, tầng gần chỉ ở hai vách bên (giữa là vực sương trống).
export function dtSwordHome(i,H){const d=i%4,u=rnd(i*3+1),x=d<2?20+u*860:u<.5?10+u*2*240:650+(u-.5)*2*240,base=[.22,.31,.5,.64][d]*H,ridge=Math.sin(u*9+d*2)*[14,22,40,30][d]+(d>=2?Math.abs(x-450)*.12:0),y=base-ridge;return {x,y,d,size:[14,22,36,54][d],cell:i%3};}
function riverPoint(s,st){const x=450+Math.sin(s*TAU*.95+.6)*360,y=st.H*.1+s*st.H*.3+Math.sin(s*TAU*2)*24;const dx=Math.cos(s*TAU*.95+.6)*360*TAU*.95,dy=st.H*.3+Math.cos(s*TAU*2)*24*TAU*2;return {x,y,a:Math.atan2(dy,dx)};}
// Vị trí + hướng mũi kiếm (dir, rad; 0 = mũi chỉ lên) của kiếm i tại thời điểm st.
export function dtSwordPose(i,n,st,v){
 const h=dtSwordHome(i,st.H),r0=rnd(i+7),order=i/n;let x=h.x,y=h.y,dir=Math.PI,alpha=1,size=h.size;
 const quake=st.quake*(st.motion?Math.sin(st.t*70+i)*2:0);x+=quake;
 // rút khỏi núi: xa lên trước, gần lên sau
 const rise=ease((st.t-T.rise-(3-h.d)*.45-r0*.6)/.9);y-=rise*(50+h.d*16+rnd(i+11)*60);dir=mix(Math.PI,(rnd(i+13)-.5)*.7,rise);alpha=rise;size*=1.25;
 // vào sông kiếm, dòng chảy liên tục
 const flow=st.motion?(st.t-T.river)*.045:0,s=(order+Math.max(0,flow))%1,rp=riverPoint(s,st),inR=ease((st.t-T.river-r0*.7)/1.3);
 x=mix(x,rp.x+(rnd(i+3)-.5)*40,inR);y=mix(y,rp.y+(rnd(i+5)-.5)*30,inR);dir=mix(dir,rp.a+Math.PI/2,inR);size=mix(size,38+rnd(i+9)*22,inR);
 // triều tông: mũi quay về phía nhân vật rồi cúi theo từng đợt sóng chạy dọc sông
 if(st.bow>0){const face=Math.atan2(st.belly-y,450-x)+Math.PI/2;let dip=0;for(const b of DT_BOWS){const w=(st.t-b)/.8-s;dip+=Math.max(0,Math.sin(clamp(w*3)*Math.PI));}dir=mix(dir,face+Math.PI*.5*Math.min(1,dip)*.7,st.bow);size*=1+Math.min(1,dip)*.25*st.bow;}
 if(st.road>0)alpha*=1-st.road*.35*(1-st.tower);
 // tháp kiếm xoắn quanh người
 if(st.tower>0){const k=ease((st.t-T.tower-r0*.5)/1.2),hh=order,ang=order*TAU*5.5+(st.motion?st.clock*2.2:0)*(v?.flip?-1:1),R=(150+Math.sin(order*TAU*3)*30)*(1-st.contract),ty=mix(st.feet+20,st.H*.06,hh),cy=mix(ty,st.belly,st.contract);
  x=mix(x,450+Math.cos(ang)*R,k);y=mix(y,cy+Math.sin(ang)*R*.22,k);dir=mix(dir,ang+(v?.flip?-1:1)*Math.PI/2+Math.PI/2,k*(1-st.contract))+st.contract*(Math.atan2(st.belly-y,450-x)+Math.PI/2-dir)*0;size=mix(size,44,k);
  alpha*=1-ease((st.t-T.contract-r0*.4)/.55);}
 // sau nổ: kiếm rơi theo quỹ đạo về cắm lại chỗ cũ
 if(st.t>=T.impact){const f=ease((st.t-T.impact-.1-r0*.4)/.9),ang=i*2.399,bx=450+Math.cos(ang)*(120+r0*380),by=st.belly-200-r0*260;
  x=mix(bx,h.x,f);y=mix(by,h.y,f)-Math.sin(f*Math.PI)*90;dir=mix(Math.atan2(h.y-by,h.x-bx)+Math.PI/2,Math.PI,f*f);size=h.size*1.2;alpha=(i%2?0:1)*ease((st.t-T.impact-.05)/.2)*(1-ease((f-.85)/.15))*st.fade;}
 return {x,y,dir,size,alpha:alpha*st.wake,cell:h.cell,d:h.d,z:st.tower>0&&st.t<T.impact?Math.sin(order*TAU*5.5+(st.motion?st.clock*2.2:0)*(v?.flip?-1:1)):0};
}
function swordSprite(cell,glowc){const c=surface(48,128,q=>{q.translate(24,64);q.shadowColor=glowc;q.shadowBlur=6;const g=q.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#8d92bc');g.addColorStop(.5,'#fdf3e0');g.addColorStop(1,'#859abd');q.fillStyle=g;q.beginPath();q.moveTo(0,-58);q.lineTo(5,-44);q.lineTo(4,30);q.lineTo(-4,30);q.lineTo(-5,-44);q.closePath();q.fill();q.fillStyle=glowc;q.fillRect(-12,28,24,4);q.fillStyle='#5a4630';q.fillRect(-2,32,4,20);q.fillStyle=glowc;q.beginPath();q.arc(0,55,3,0,TAU);q.fill();});return c;}
function buildAssets(scene,H){
 const cache=scene.daiThuaAssets;if(cache?.H===H&&cache.swordsReady===!!scene.ritualSwords)return cache;
 const art=ready(scene.daiThuaWorldArt)?scene.daiThuaWorldArt:null;
 const world=surface(450,H/2,c=>{c.scale(.5,.5);if(art)c.drawImage(art,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c0f2a');g.addColorStop(.38,'#3b3550');g.addColorStop(.41,'#c79a5c');g.addColorStop(.46,'#2b3348');g.addColorStop(1,'#0d1220');c.fillStyle=g;c.fillRect(0,0,900,H);
   for(let layer=0;layer<4;layer++){const y=H*(.38+layer*.075);c.beginPath();c.moveTo(-20,H);for(let i=0;i<=20;i++){const x=i*48-20,top=y-rnd(i+layer*31)*(70+layer*40);c.lineTo(x,top);}c.lineTo(940,H);c.closePath();c.fillStyle=['#2a3048','#222840','#191e33','#111526'][layer];c.fill();}}
  c.fillStyle='#05071430';c.fillRect(0,0,900,H);});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#fffaf0');g.addColorStop(.15,'#ffe2a8b0');g.addColorStop(.5,'#c8a0ff30');g.addColorStop(1,'#c8a0ff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 // kiếm nhỏ: ưu tiên ảnh kiếm thật (prestige) thu nhỏ một lần; thiếu ảnh thì dùng kiếm vẽ tay
 // số đông: kiếm thép trắng chuôi vàng (đọc rõ ở cỡ nhỏ); kiếm lớn (kiếm ý, kiếm quang): ảnh kiếm prestige thật
 const swords=[C.gold,C.steel,C.violet].map((g,cell)=>swordSprite(cell,g)),hero=[0,1,2].map(cell=>{const src=scene.ritualSwords?.[cell];return src?surface(128,256,c=>c.drawImage(src,0,0,128,256)):swordSprite(cell,C.gold);});
 const tablet=surface(90,190,c=>{const g=c.createLinearGradient(0,0,90,0);g.addColorStop(0,'#2a2c38');g.addColorStop(.5,'#4b4c5c');g.addColorStop(1,'#24252f');c.fillStyle=g;c.beginPath();c.moveTo(8,20);c.quadraticCurveTo(45,-4,82,20);c.lineTo(84,186);c.lineTo(6,186);c.closePath();c.fill();c.strokeStyle='#8f8a7a';c.lineWidth=2;c.stroke();
  c.strokeStyle=C.gold;c.lineWidth=3;c.lineCap='round';for(let j=0;j<4;j++){const y=48+j*34;c.beginPath();c.moveTo(30,y);c.lineTo(60,y);c.moveTo(45,y-10);c.lineTo(45,y+12);c.moveTo(33,y+10);c.lineTo(57,y+6);c.stroke();}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.5,170,450,H*.5,H*.72);g.addColorStop(0,'#04050e00');g.addColorStop(.55,'#04050e00');g.addColorStop(1,'#04050ed8');c.fillStyle=g;c.fillRect(0,0,900,H);});
 return scene.daiThuaAssets={H,swordsReady:!!scene.ritualSwords,world,glow,swords,hero,tablet,vignette};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
export function drawDtWorld(scene,c,st){const a=buildAssets(scene,st.H),q=st.quake*(st.motion?1:0);c.drawImage(a.world,Math.sin(st.t*61)*q*6,Math.cos(st.t*53)*q*4,900,st.H);
 // bụi bốc từ chân núi khi rung
 if(st.t>T.rise&&st.t<T.river+1){const n=dtSwordCount(false);for(let i=0;i<n;i+=3){const h=dtSwordHome(i,st.H),at=T.rise+(3-h.d)*.45+rnd(i+7)*.6,age=st.t-at;if(age<0||age>.5)continue;halo(c,a.glow,h.x,h.y,30+h.d*16,30+h.d*16,(1-age/.5)*.9);}}
 // hành lễ: chân trời sáng vàng sau khi hiện thân
 if(st.salute>0)halo(c,a.glow,450,st.horizon,1400,260,st.salute*.4*st.fade);}
// Vẽ toàn bộ kiếm của một lớp chiều sâu (back: z<0 hoặc ngoài tháp; front: z≥0 trong tháp).
export function drawDtSwords(scene,c,st,v,layer){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',n=dtSwordCount(light);
 const m=c.getTransform(),base=c.globalAlpha;
 for(let i=0;i<n;i++){const p=dtSwordPose(i,n,st,v);if(p.alpha<=.01)continue;const front=st.tower>0&&st.t<T.impact&&p.z>=0;if((layer==='front')!==front)continue;
  // lớp trước không che mặt nhân vật
  const face=layer==='front'&&Math.abs(p.x-450)<95&&p.y>st.feet-575&&p.y<st.feet-400?.18:1;
  // ma trận tính tay thay cho save/translate/rotate/restore từng thanh (320 thanh mỗi khung)
  const im=a.swords[p.cell],L=p.size,W=L*.5,cs=Math.cos(p.dir),sn=Math.sin(p.dir);c.globalAlpha=base*p.alpha*face;c.setTransform(m.a*cs+m.c*sn,m.b*cs+m.d*sn,m.c*cs-m.a*sn,m.d*cs-m.b*sn,m.a*p.x+m.c*p.y+m.e,m.b*p.x+m.d*p.y+m.f);c.drawImage(im,-W/2,-L/2,W,L);}
 c.setTransform(m);c.globalAlpha=base;
 if(layer==='back'&&st.tower>0&&st.t<T.absorbed){c.save();c.globalCompositeOperation='screen';c.strokeStyle=C.gold;c.globalAlpha=st.tower*(1-st.contract)*.45;c.lineWidth=3;c.beginPath();for(let k=0;k<=120;k++){const o=k/120,ang=o*TAU*5.5+(st.motion?st.clock*2.2:0)*(v?.flip?-1:1),R=(150+Math.sin(o*TAU*3)*30)*(1-st.contract),y=mix(st.feet+20,st.H*.06,o);const yy=mix(y,st.belly,st.contract)+Math.sin(ang)*R*.22,xx=450+Math.cos(ang)*R;k?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();c.restore();}
 // vệt sáng chạy dọc sông kiếm
 if(layer==='back'&&st.river>0&&st.t<T.tower+.6){c.save();c.globalCompositeOperation='screen';c.strokeStyle=C.gold;c.lineWidth=2;c.globalAlpha=st.river*.25*(1-st.tower);c.beginPath();for(let k=0;k<=60;k++){const p=riverPoint(k/60,st);k?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();
  for(let k=0;k<(light?6:12);k++){const s=((st.clock*.12)+k/12)%1,p=riverPoint(s,st);halo(c,a.glow,p.x,p.y,70,70,st.river*(1-st.tower)*.8);}c.restore();}
}
// Đại Đạo kim kiều: con đường ánh vàng trải từ chân trời tới chân nhân vật; 9 đạo bia hai bên.
export function dtTabletPos(i,st){const depth=1-i/8,side=i%2?1:-1,y=mix(st.horizon+20,st.feet+10,1-depth),x=450+side*mix(60,230,1-depth);return {x,y,s:mix(.35,1.05,1-depth),side};}
export function drawDtRoad(scene,c,st,v){
 if(st.road<=0)return;const a=buildAssets(scene,st.H),p=st.road,top=st.horizon+10,bottom=st.feet+40,yEnd=mix(top,bottom,p);
 c.save();c.globalCompositeOperation='screen';const f=(yEnd-top)/(bottom-top),lx=mix(444,300,f),rx=mix(456,600,f),g=c.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'#ffd98a08');g.addColorStop(1,'#ffcf7a38');c.fillStyle=g;c.beginPath();c.moveTo(444,top);c.lineTo(456,top);c.lineTo(rx,yEnd);c.lineTo(lx,yEnd);c.closePath();c.fill();
 for(const [x0,x1] of [[444,lx],[456,rx]]){c.globalAlpha=p*.95;c.strokeStyle=C.gold;c.lineWidth=3;c.beginPath();c.moveTo(x0,top);c.lineTo(x1,yEnd);c.stroke();c.globalAlpha=p*.4;c.lineWidth=10;c.stroke();}
 // vạch gạch kiếm quang chạy về phía người xem
 for(let k=0;k<16;k++){const u=((k/16)+(st.motion?st.clock*.25:0))%1,yy=mix(top,bottom,u*u);if(yy>yEnd)continue;const w=mix(6,150,u*u);c.globalAlpha=p*.55*(1-u*.3);c.strokeStyle=k%2?C.gold:C.white;c.lineWidth=1+u*2;c.beginPath();c.moveTo(450-w,yy);c.lineTo(450+w,yy);c.stroke();}
 c.restore();halo(c,a.glow,450,top,320,90,p*.6);
 for(let i=8;i>=0;i--){const tp=dtTabletPos(i,st),r=st.tablets[i];if(r<=0)continue;c.save();c.globalAlpha=r;c.translate(tp.x,tp.y);c.scale(tp.s,tp.s);c.beginPath();c.rect(-50,-200,100,200);c.clip();c.drawImage(a.tablet,-45,-190+(1-r)*190,90,190);c.restore();halo(c,a.glow,tp.x,tp.y-95*tp.s,120*tp.s,200*tp.s,r*.25);}
}
// 3 kiếm ý thử thách: bóng kiếm khổng lồ từ đạo bia lao xuống, bị kiếm ý bản thân chặn trên đầu.
export function dtStrike(k,st){const age=st.t-DT_STRIKES[k];return age<-.4||age>1.1?null:{age,fly:ease((age+.4)/.4),hit:age>=0,after:clamp(age/1.1)};}
export function drawDtTrial(scene,c,st,v){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 DT_STRIKES.forEach((_,k)=>{const s=dtStrike(k,st);if(!s)return;const tp=dtTabletPos(8-k*2,st),bx=450,by=st.belly-300,sx=tp.x,sy=tp.y-260*tp.s,x=mix(sx,bx,s.fly),y=mix(sy,by,s.fly),ang=Math.atan2(by-sy,bx-sx)+Math.PI/2,L=mix(300,720,s.fly),fade=s.hit?1-s.after:s.fly;
  if(!s.hit){c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(sx,sy,x,y);g.addColorStop(0,'#ffd98a00');g.addColorStop(1,'#ffd98a88');c.strokeStyle=g;c.lineWidth=26;c.lineCap='round';c.globalAlpha=fade*.6;c.beginPath();c.moveTo(sx,sy);c.lineTo(x,y);c.stroke();c.restore();}
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=fade*.85;c.translate(x,y);c.rotate(ang);const im=a.hero[k%3];c.drawImage(im,-L*.25,-L*.5,L*.5,L);c.restore();
  if(s.hit){const u=s.after;c.save();c.globalCompositeOperation='screen';c.globalAlpha=(1-u)*.85;c.strokeStyle=k%2?C.violet:C.gold;c.lineWidth=5*(1-u)+1;c.beginPath();c.ellipse(bx,by,30+u*320,(30+u*320)*.4,0,0,TAU);c.stroke();
   for(let i=0;i<(light?10:22);i++){const an=i*TAU/22+k,d=u*(80+rnd(i+k*30)*200);c.globalAlpha=(1-u);c.strokeStyle=C.white;c.lineWidth=1.5;c.beginPath();c.moveTo(bx+Math.cos(an)*d,by+Math.sin(an)*d*.6);c.lineTo(bx+Math.cos(an)*(d+24),by+Math.sin(an)*(d+24)*.6);c.stroke();}c.restore();halo(c,a.glow,bx,by,420,260,(1-u)*.8);}});
 // kiếm ý bản thân: vầng sáng mỏng trên đầu, dày dần qua từng nhát
 const guard=ease((st.t-T.trial)/.5)*(1-ease((st.t-T.tower-.2)/.6));if(guard>0){c.save();c.globalCompositeOperation='screen';c.globalAlpha=guard*.55;c.strokeStyle=C.steel;c.lineWidth=2;c.beginPath();c.ellipse(450,st.belly-300,150,40,0,Math.PI,TAU);c.stroke();c.restore();}
}
// Kiếm quang hợp nhất lao vào đan điền.
export function drawDtDive(scene,c,st){
 if(st.t<T.contract+.2||st.t>T.absorbed+.1)return;const a=buildAssets(scene,st.H),form=ease((st.t-T.contract-.2)/.35),y=mix(st.H*.08,st.belly,st.dive),L=mix(420,120,st.dive),al=form*(1-ease((st.t-T.absorbed)/.1));
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=al;c.translate(450,y);c.rotate(Math.PI);c.drawImage(a.hero[1],-L*.25,-L*.5,L*.5,L);c.restore();
 if(st.dive>0){c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,st.H*.05,0,y);g.addColorStop(0,'#ffd98a00');g.addColorStop(1,'#ffd98aaa');c.fillStyle=g;c.globalAlpha=al*st.dive;c.fillRect(444,st.H*.05,12,y-st.H*.05);c.restore();}
 halo(c,a.glow,450,y,180,180,al*.7);
}
export function drawDtBody(scene,c,st){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',charge=clamp((st.t-T.trial)/6),power=(.25+charge*.75)*st.fade*(st.t<T.impact?1:.35);
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?6:12);i++){const side=i%2?1:-1,u=(st.clock*.8+i*.173)%1,x=450+side*(42+Math.sin(u*Math.PI)*48),y=st.feet-30-u*280;c.globalAlpha=power*Math.sin(u*Math.PI)*.45;c.strokeStyle=i%3?C.gold:C.steel;c.lineWidth=i%4?1.3:2.4;c.beginPath();c.moveTo(x-side*8,y+26);c.quadraticCurveTo(x+side*12,y+6,x,y-16);c.stroke();}c.restore();
 halo(c,a.glow,450,st.belly,110+st.compression*130,110+st.compression*130,power*.14+st.compression*.6);
}
export function drawDtBreak(scene,c,st,v){
 if(st.t<T.impact)return;const a=buildAssets(scene,st.H),age=st.t-T.impact;
 for(let i=0;i<8;i++){const u=clamp((age-i*.08)/1.3);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*.75*(st.motion?1:.3);c.strokeStyle=i%2?C.gold:C.steel;c.lineWidth=5*(1-u)+1;c.beginPath();const R=50+ease(u)*880;c.ellipse(450,i%2?st.feet+40:st.belly,R,R*(i%2?.25:.8),0,0,TAU);c.stroke();c.restore();}
 halo(c,a.glow,450,st.belly,760,760,Math.exp(-age*6)*.32);
}
// Hành lễ sau hiện thân: tia sáng dựng thẳng từ các kiếm đã cắm lại.
export function drawDtSalute(scene,c,st,v){
 if(st.salute<=0)return;const light=scene.budget?.level==='light',n=dtSwordCount(light);c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<n;i+=light?2:1){const h=dtSwordHome(i,st.H),tw=st.motion?.6+.4*Math.sin(st.clock*3+i):1;c.globalAlpha=st.salute*st.fade*.35*tw;c.strokeStyle=i%3?C.gold:C.steel;c.lineWidth=1+h.d*.4;c.beginPath();c.moveTo(h.x,h.y-h.size*.4);c.lineTo(h.x,h.y-h.size*.4-30-h.d*14);c.stroke();}
 c.restore();
}
export function drawDtEdges(scene,c,st){const a=buildAssets(scene,st.H);c.drawImage(a.vignette,0,0,900,st.H);
 const p=st.t<T.impact?(.06+st.tower*.12+st.compression*.3):Math.exp(-(st.t-T.impact)*4)*.55;for(const x of [0,900])for(const y of [0,st.H])halo(c,a.glow,x,y,520,760,p*st.fade);}
