// Hóa Thần v2 — Thần Niệm Chấn Thiên. Geometry is authored in a 900 × H world.
// Six weather seals feed ONE ascending soul; the soul commands, then returns to the body.
import {makeSurface} from './performance.js';
export const HT_TIMING=Object.freeze({duration:17.6,opening:.16,ascent:2,seals:4.4,strikes:7.6,manifest:10.5,recall:12.8,absorbed:14.25,impact:14.4,reveal:14.65});
export function prepareHoaThanArt(scene){if(scene.hoaThanWorldArt||typeof Image==='undefined')return;const im=new Image();scene.hoaThanWorldArt=im;im.onload=()=>{scene.hoaThanWorld=null;};im.src='/assets/hoa-than-v2/storm-world.png';}
export const HT_STRIKES=Object.freeze(Array.from({length:6},(_,i)=>7.6+i*.44));
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const v=Math.sin(i*127.1+79.7)*43758.5453;return v-Math.floor(v);};
const C={blue:'#8bdcff',white:'#e0f6ff',gold:'#f5d693',dark:'#061326'};
export function hoaThanFormationState(t,H=1600,motion=true){
 const fade=1-ease((t-16.7)/.9),recall=ease((t-12.8)/1.45),soul=ease((t-2)/2.4)*(1-ease((t-14.05)/.2));
 return {t,H,motion,clock:motion?t:0,feet:H*.67,belly:H*.67-145,fade,
  wake:ease(t/.55),tide:ease((t-.3)/1.8),split:ease((t-.16)/1.2)*(1-ease((t-15.4)/1.5)),
  soul,recall,charge:ease((t-7.6)/2.5),effigy:ease((t-10.5)/1.4)*(1-ease((t-13.45)/.65)),
  seals:Array.from({length:6},(_,i)=>ease((t-4.4-i*.32)/.48)*(1-ease((t-12.8-i*.09)/.56))),
  shock:t<14.4?0:clamp((t-14.4)/1.6),after:ease((t-14.65)/.35),
  compression:ease((t-14.05)/.2)*(1-ease((t-14.4)/.06)),
  soulX:450,soulY:mix(H*.67-180-ease((t-2)/2.4)*280,H*.67-145,recall)};
}
function ellipse(c,x,y,rx,ry,color,width=1){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function poly(c,pts,fill,stroke,width=1){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function surface(w,h,paint){const im=makeSurface(w,h);if(im)paint(im.getContext('2d'));return im;}
function buildAssets(scene,H){
 if(scene.hoaThanWorld?.H===H&&scene.hoaThanWorld.art===scene.hoaThanWorldArt)return scene.hoaThanWorld;
 const sky=surface(450,Math.ceil(H/2),c=>{
  c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#030918');g.addColorStop(.34,'#193d61');g.addColorStop(.59,'#4d798a');g.addColorStop(.64,'#122d48');g.addColorStop(1,'#020a18');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let layer=0;layer<3;layer++){const y=H*(.43+layer*.075);c.beginPath();c.moveTo(-20,H*.7);for(let i=0;i<=24;i++){const x=i*42-40,top=y-rnd(i+layer*51)*(90+layer*50);c.lineTo(x,top);c.lineTo(x+15,top+25);}c.lineTo(950,H*.72);c.closePath();c.fillStyle=['#36566b','#23445c','#122e48'][layer];c.fill();c.strokeStyle=['#7fa7b3','#527d94','#3d647d'][layer];c.lineWidth=1.2;c.stroke();}
  const art=scene.hoaThanWorldArt;if(art&&(art.naturalWidth||art.width)){c.drawImage(art,0,0,900,H);c.fillStyle='#06102730';c.fillRect(0,0,900,H);}
  // A field of pinpricks and cloud curls, kept out of the actor's face.
  for(let i=0;i<95;i++){c.globalAlpha=.18+rnd(i)*.5;c.fillStyle=i%5?C.blue:C.gold;c.fillRect(rnd(i+200)*900,rnd(i+300)*H*.44,i%7?1:2,1.6);}c.globalAlpha=1;
 });
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#effaff');g.addColorStop(.12,'#a6e7ffb0');g.addColorStop(.45,'#5eacff28');g.addColorStop(1,'#529aff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const cloud=surface(512,128,c=>{for(let i=0;i<9;i++){const x=i*61-10,y=65+Math.sin(i*1.9)*19;c.beginPath();c.moveTo(x-50,y+15);c.bezierCurveTo(x-20,y-30,x+40,y-30,x+40,y+2);c.bezierCurveTo(x+35,y+20,x+5,y+16,x+9,y+3);c.strokeStyle=i%2?'#c6eaff70':'#83b8d68a';c.lineWidth=1.5;c.stroke();} });
 const seal=surface(132,280,c=>{
  c.translate(66,140);poly(c,[[0,-128],[48,-85],[48,78],[0,128],[-48,78],[-48,-85]],'#0b273cc9','#b1e6ff',2);
  poly(c,[[0,-113],[36,-78],[36,72],[0,110],[-36,72],[-36,-78]],null,'#ddc48c',1);
  for(let j=-1;j<=1;j++){const y=j*53;c.strokeStyle=j?C.blue:C.gold;c.lineWidth=2;c.beginPath();c.moveTo(-21,y-13);c.lineTo(16,y-13);c.moveTo(0,y-24);c.lineTo(0,y+24);c.moveTo(-19,y+12);c.lineTo(20,y+12);c.moveTo(-15,y-2);c.lineTo(15,y+3);c.stroke();poly(c,[[0,y-29],[27,y],[0,y+29],[-27,y]],null,'#81bedd70');}
  for(let j=0;j<5;j++){c.fillStyle=C.gold;c.fillRect(-49,j*25-51,4,9);c.fillRect(45,j*25-51,4,9);}
 });
 const crown=surface(680,680,c=>{c.translate(340,340);for(let i=0;i<36;i++){const a=i*TAU/36;c.save();c.rotate(a);poly(c,[[0,-265],[i%3?5:10,-285],[0,i%3?-302:-325],[-(i%3?5:10),-285]],'#83cfff36',i%3?'#8edaff99':C.gold,1);c.restore();}ellipse(c,0,0,263,263,'#a3dfff70',2);ellipse(c,0,0,252,252,'#ebd298a0',1);});
 const floor=surface(900,350,c=>{
  c.translate(450,130);for(let layer=2;layer>=0;layer--){const rx=260+layer*40,ry=60+layer*13,dy=layer*17;ellipse(c,0,dy+14,rx,ry,'#315979',20);ellipse(c,0,dy,rx,ry,'#87b6c7',2);}
  const jade=c.createLinearGradient(-220,-70,220,80);jade.addColorStop(0,'#48798a');jade.addColorStop(.45,'#16425d');jade.addColorStop(1,'#102c45');
  poly(c,[[-305,0],[-170,-67],[170,-67],[305,0],[170,67],[-170,67]],jade,'#e0d4ad',2);
  for(let i=0;i<30;i++){const ang=i*TAU/30;c.save();c.translate(Math.cos(ang)*287,Math.sin(ang)*75);c.rotate(ang);c.strokeStyle=i%5?'#8bb6c1':'#eed898';c.lineWidth=1;c.beginPath();c.moveTo(-7,0);c.lineTo(0,-3);c.lineTo(7,0);c.stroke();c.restore();}
  ellipse(c,0,0,266,66,'#eed89890',1.5);ellipse(c,0,0,254,62,'#86becc70',1);
  for(let i=0;i<6;i++){const a=i*TAU/6;c.strokeStyle='#a9cfda40';c.beginPath();c.moveTo(Math.cos(a)*160,Math.sin(a)*42);c.lineTo(Math.cos(a)*285,Math.sin(a)*73);c.stroke();}
 });
 const vignette=surface(450,Math.ceil(H/2),c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.48,160,450,H*.48,H*.68);g.addColorStop(0,'#02081600');g.addColorStop(.55,'#02081600');g.addColorStop(1,'#020816ce');c.fillStyle=g;c.fillRect(0,0,900,H);});
 return scene.hoaThanWorld={H,art:scene.hoaThanWorldArt,sky,glow,cloud,seal,crown,floor,vignette};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
// Branched stepped leader, white hot core and blue sheath. No continuously moving sine "lightning".
export function drawHtBolt(c,x0,y0,x1,y1,seed,power=1,light=false){
 if(power<=.005)return;const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy),nx=-dy/Math.max(1,len),ny=dx/Math.max(1,len),points=[];
 for(let i=0;i<=18;i++){const u=i/18,jitter=(rnd(seed+i*17)-.5)*Math.sin(u*Math.PI)*Math.min(100,len*.19);points.push([x0+dx*u+nx*jitter,y0+dy*u+ny*jitter]);}
 c.save();c.globalCompositeOperation='screen';c.lineJoin='round';c.lineCap='round';
 for(const [width,col,alpha]of [[15,'#357eff',.18],[5,'#66caff',.65],[1.7,'#f0fbff',1]]){if(light&&width===15)continue;c.globalAlpha=power*alpha;c.lineWidth=width;c.strokeStyle=col;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 c.globalAlpha=power*.6;c.strokeStyle=C.blue;c.lineWidth=1;
 for(let i=3;i<16;i+=light?5:3){const [x,y]=points[i],side=i%2?1:-1;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx*.04+nx*side*40,y+dy*.04+ny*side*40);c.lineTo(x+dx*.14+nx*side*25,y+dy*.14+ny*side*25);c.stroke();}c.restore();
}
export function drawHtSky(scene,c,st,v){
 const a=buildAssets(scene,st.H),{H,t,clock}=st;c.drawImage(a.sky,0,0,900,H);
 // The sky opens along two bowed seams, pulled apart by the first strike.
 c.save();c.globalAlpha=st.split*.64;c.strokeStyle=C.blue;c.lineWidth=2;
 for(const side of [-1,1]){c.beginPath();c.moveTo(450,H*.08);c.bezierCurveTo(450+side*160*st.split,H*.16,450+side*430*st.split,H*.2,450+side*510,H*.4);c.stroke();}
 c.restore();halo(c,a.glow,450,H*.18,700,300,st.split*.2);
 const strike=Math.exp(-Math.max(0,t-.16)*6)*(t>=.16?1:0);drawHtBolt(c,450+v.phase*100,0,450,st.feet+25,42,strike*(st.motion?1:.28),scene.budget?.level==='light');
 for(let side=-1;side<=1;side+=2)for(let i=0;i<2;i++){const x=450+side*(260+i*130),y=H*(.16+i*.125);c.save();c.globalAlpha=(.06+st.charge*.1)*st.fade;c.drawImage(a.cloud,x-220+Math.sin(clock*.18+i)*10,y-50,440,110);c.restore();}
 // Concentric eclipsed sky aperture; it closes when the soul recalls the seals.
 const aperture=ease((t-.25)/1.3)*(1-st.recall);if(aperture>0){c.save();c.globalAlpha=aperture*.7;c.translate(450,H*.205);c.scale(1,.57);ellipse(c,0,0,220+st.charge*35,220+st.charge*35,'#b9e9ff',2);ellipse(c,0,0,236+st.charge*35,236+st.charge*35,'#e7cb9390',1);for(let i=0;i<12;i++){const ang=i*TAU/12+v.phase;c.beginPath();c.moveTo(Math.cos(ang)*239,Math.sin(ang)*239);c.lineTo(Math.cos(ang)*(250+i%3*9),Math.sin(ang)*(250+i%3*9));c.stroke();}c.restore();}
}
export function drawHtSea(scene,c,st){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 halo(c,a.glow,450,st.feet+80,900,370,.23*st.wake);
 c.save();c.globalCompositeOperation='screen';
 // Waves REVERSE toward the awakened body before the break, then move outward.
 for(let i=0;i<(light?8:15);i++){const u=(i/(light?8:15)+st.clock*.18)%1,r=st.t>=14.4?50+u*800:60+(1-u)*780;c.globalAlpha=st.tide*st.fade*(1-u)*.2;c.beginPath();c.ellipse(450,st.feet+70,r,r*.26,0,0,TAU);c.strokeStyle=i%3?C.blue:C.gold;c.lineWidth=i%4?1:2.5;c.stroke();}
 // Radial runnels bind distant water to the six seals. These are perspective lines, not random beams.
 for(let i=0;i<12;i++){const ang=i*TAU/12;const r=320+st.charge*40;c.globalAlpha=st.tide*.08*st.fade;c.beginPath();c.moveTo(450+Math.cos(ang)*r,st.feet+70+Math.sin(ang)*r*.26);c.lineTo(450+Math.cos(ang)*930,st.feet+70+Math.sin(ang)*930*.26);c.strokeStyle=C.blue;c.stroke();}
 c.restore();if(a.floor){c.save();c.globalAlpha=st.fade;c.drawImage(a.floor,0,st.feet-70,900,350);c.restore();}
 // Chunks of the shore lift as the spirit gains authority over the landscape.
 for(let i=0;i<(light?8:14);i++){const side=i%2?1:-1,x=450+side*(270+rnd(i)*210),lift=st.tide*(30+rnd(i+13)*100)*(1-st.recall),y=st.feet+90+rnd(i+22)*230-lift,w=16+rnd(i+44)*40;c.save();c.globalAlpha=.75*st.fade;c.translate(x,y);c.rotate(side*st.clock*.025);poly(c,[[-w,-9],[0,-22],[w,-5],[w*.6,14],[-w*.7,18]],'#173951','#71b4c9',1);c.restore();}
}
export function htSealPosition(i,st){const side=i%2?1:-1,row=Math.floor(i/2);return {x:450+side*[250,325,295][row],y:st.H*.29+row*st.H*.115};}
export function drawHtSeals(scene,c,st,v){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 for(let i=0;i<6;i++){
  const pos=htSealPosition(i,st),open=st.seals[i];if(open<=0)continue;
  const pull=ease((st.t-12.8-i*.09)/.56),x=mix(pos.x,450,pull),y=mix(pos.y,st.belly,pull),sz=(.45+.5*ease((st.t-4.4-i*.32)/.48))*(1-pull*.85),struck=ease((st.t-HT_STRIKES[i])/.18);
  c.save();c.translate(x,y);c.rotate((i%2?1:-1)*(.06+pull*1.7));c.globalAlpha=open*st.fade;c.drawImage(a.seal,-66*sz,-140*sz,132*sz,280*sz);c.restore();
  halo(c,a.glow,x,y,140*sz,270*sz,open*(.18+struck*.25));
  if(st.t<12.8){c.save();c.globalAlpha=open*.18;c.strokeStyle=C.blue;c.lineWidth=1;c.beginPath();c.moveTo(pos.x,pos.y+75);c.bezierCurveTo(pos.x+(pos.x-450)*.3,st.feet+10,450,st.feet+20,450,st.feet);c.stroke();c.restore();}
  const age=st.t-HT_STRIKES[i],strike=age<0?0:Math.exp(-age*9);if(strike>.005){drawHtBolt(c,pos.x+(i%2?95:-95),0,pos.x,pos.y,100+i,strike*(st.motion?1:.28),light);drawHtBolt(c,pos.x,pos.y,450,st.soulY,200+i,strike*(st.motion?1:.28),light);}
  if(struck&&st.t<12.8){
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=.45*open;ellipse(c,pos.x,pos.y,43,90,C.gold,1.1);
   // Each successful thunder strike starts a directed stream to the SAME god-soul.
   const targetY=st.soulY-25,pts=[];
   for(let j=0;j<=24;j++){const u=j/24;pts.push([mix(pos.x,450,u)+(i%2?1:-1)*Math.sin(u*Math.PI)*36,mix(pos.y,targetY,u)-Math.sin(u*Math.PI)*45]);}
   c.globalAlpha=.2*open;c.strokeStyle=C.blue;c.lineWidth=1.5;c.beginPath();pts.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
   for(let j=0;j<2;j++){const u=(st.clock*2.3+i*.17+j*.5)%1,q=pts[Math.floor(u*24)];halo(c,a.glow,q[0],q[1],22,22,open*Math.sin(u*Math.PI)*.8);}
   c.restore();
  }
  if(pull>0&&pull<1){c.save();c.globalAlpha=open*.7;c.strokeStyle=C.gold;c.lineWidth=2;c.beginPath();c.moveTo(pos.x,pos.y);c.quadraticCurveTo(450,st.belly-140,x,y);c.stroke();c.restore();}
 }
}
export function drawHtAuthority(scene,c,st,im,ghostImage){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 // Not a new model: the actual LIVE skin becomes the god-form, framed by a solar crown.
 if(st.effigy>.002)halo(c,a.crown,450,st.H*.255,650,650,st.effigy*.8);
 // Moving particles follow the soul tether; no arbitrary orbiting confetti.
 const tether=st.soul*(1-st.recall);if(tether>0){c.save();c.globalCompositeOperation='screen';c.strokeStyle=C.blue;c.globalAlpha=tether*.65;c.lineWidth=2;c.beginPath();c.moveTo(450,st.belly);c.bezierCurveTo(410,st.belly-110,490,st.soulY+100,450,st.soulY);c.stroke();for(let i=0;i<(light?9:18);i++){const u=(i/(light?9:18)+st.clock*.9)%1,x=450+Math.sin(u*TAU)*15,y=mix(st.belly,st.soulY,u);halo(c,a.glow,x,y,11,28,tether*Math.sin(u*Math.PI)*.65);}c.restore();}
 if(st.effigy>0){for(let i=0;i<3;i++){const age=st.t-(10.6+i*.39),u=clamp(age/.95);if(age>=0&&u<1){c.save();c.globalAlpha=(1-u)*.65;ellipse(c,450,st.feet+55,50+u*700,(50+u*700)*.26,i%2?C.gold:C.blue,3*(1-u)+1);c.restore();}}}
}
export function drawHtBodyQi(scene,c,st){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',power=(.35+st.charge*.65)*st.wake*st.fade;
 // Streams rise along the robe, stopping at the shoulders. The face stays readable.
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?6:12);i++){
  const side=i%2?1:-1,u=(st.clock*.85+i*.173)%1,x=450+side*(45+Math.sin(u*Math.PI)*50),y=st.feet-30-u*290;
  c.globalAlpha=power*Math.sin(u*Math.PI)*.45;c.strokeStyle=i%3?C.blue:C.gold;c.lineWidth=i%4?1.3:2.6;c.beginPath();c.moveTo(x-side*8,y+28);c.quadraticCurveTo(x+side*12,y+7,x,y-16);c.stroke();
 }
 if(st.charge>0){c.globalAlpha=st.charge*.36*st.fade;c.strokeStyle=C.gold;c.lineWidth=1.5;for(const side of [-1,1]){c.beginPath();c.moveTo(450,st.belly+60);c.bezierCurveTo(450+side*57,st.belly+20,450+side*70,st.belly-60,450+side*29,st.belly-105);c.stroke();}}
 c.restore();halo(c,a.glow,450,st.belly,100+st.compression*100,100+st.compression*100,power*.13+st.compression*.6);
}
export function drawHtBreak(scene,c,st,v){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 if(st.t<14.4)return;const age=st.t-14.4;
 for(let i=0;i<6;i++){const u=clamp((age-i*.095)/1.25);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*.75*(st.motion?1:.3);ellipse(c,450,i%2?st.feet+60:st.belly,50+ease(u)*820,(50+ease(u)*820)*(i%2?.25:.8),i%2?C.gold:C.blue,5*(1-u)+1);c.restore();}
 // Six expelled seal fragments travel away from the origin with a ballistic drop.
 for(let i=0;i<(light?12:30);i++){const u=clamp(age/1.6),ang=i*2.399+v.phase,dist=u*(320+rnd(i)*430),x=450+Math.cos(ang)*dist,y=st.belly+Math.sin(ang)*dist*.65+u*u*170;c.save();c.globalAlpha=(1-u)*.8;c.translate(x,y);c.rotate(i+u*5);poly(c,[[-3,-13],[5,-6],[2,18],[-5,4]],i%3?C.blue:C.gold);c.restore();}
 if(age<.6){const p=Math.exp(-age*8);drawHtBolt(c,30,st.H*.12,450,st.belly,731,p*(st.motion?1:.28),light);drawHtBolt(c,870,st.H*.12,450,st.belly,737,p*(st.motion?1:.28),light);}
 halo(c,a.glow,450,st.belly,700,700,Math.exp(-age*7)*.25);
}
export function drawHtEdges(scene,c,st){
 const a=buildAssets(scene,st.H);c.drawImage(a.vignette,0,0,900,st.H);
 // Corner pressure tracks charge -> recall -> release. It never whites out the face.
 const p=st.t<14.4?(.08+st.charge*.15+st.compression*.3):Math.exp(-(st.t-14.4)*4)*.6;
 for(const x of [0,900])for(const y of [0,st.H])halo(c,a.glow,x,y,520,750,p*st.fade);
 c.save();c.globalAlpha=st.wake*st.fade*.26;c.strokeStyle=C.gold;c.lineWidth=1.2;for(const side of [-1,1]){const x=450+side*426;c.beginPath();c.moveTo(x-side*43,st.H*.08);c.lineTo(x,st.H*.08);c.lineTo(x,st.H*.28);c.moveTo(x,st.H*.76);c.lineTo(x,st.H*.93);c.lineTo(x-side*43,st.H*.93);c.stroke();}c.restore();
}
