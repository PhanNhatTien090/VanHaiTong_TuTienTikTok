import {actorImage} from './hoa-than-awakening.js';
import {loadSpiritBeasts,drawFlyingDragon} from './gift-spirit-beasts.js';
export const LUYEN_HU_DURATION=20800,LUYEN_HU_REVEAL=17.55;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export function luyenHuState(k,H=1600,motion=true){
 const seconds=clamp(k)*20.8,portal=ease((seconds-2.2)/2.8),bind=ease((seconds-12.6)/3.1),burst=ease((seconds-17.2)/.18)*(1-ease((seconds-17.6)/1.4));
 return {k:clamp(k),seconds,feet:H*.68,center:H*.46,portal,bind,burst,serpent:ease((seconds-5.2)/1.1)*(1-ease((seconds-15.1)/1.1)),ward:ease((seconds-9.2)/1.2)*(1-ease((seconds-16)/1.2)),shards:Array.from({length:8},(_,i)=>ease((seconds-2.4-i*.28)/.6)),revealed:seconds>=LUYEN_HU_REVEAL,fade:1-ease((seconds-19.5)/1.3),motion};
}
export function prepareLuyenHuArt(scene){
 loadSpiritBeasts(scene);
}
// Shared anchors keep the gate shards, floor seals and absorption streams connected.
export function voidSealPoint(s,i,clock=0){
 const a=i*TAU/8+clock*.035,arrive=s.shards[i],lock=ease((s.seconds-9.2)/2.1),r=1-s.bind*.94;
 const gx=450+Math.cos(a)*(270+80*(1-arrive)),gy=s.center+Math.sin(a)*(375+80*(1-arrive));
 const fx=450+Math.cos(i*TAU/8)*310,fy=s.feet+30+Math.sin(i*TAU/8)*90;
 return {x:450+((gx*(1-lock)+fx*lock)-450)*r,y:(gy*(1-lock)+fy*lock)*(1-s.bind)+(s.feet-150)*s.bind,a:a*(1-lock)+i*TAU/8*lock};
}
function ellipse(c,x,y,rx,ry,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.stroke();}
function glow(c,x,y,r,color,a){if(a<=0)return;c.save();c.globalAlpha*=a;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#6f62b900');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function gateway(c,s,clock,light){
 const open=s.portal*(1-s.bind*.87),rx=220*open,ry=330*open;c.save();
 glow(c,450,s.center,480,'#686bd760',s.portal*.8*s.fade);
 c.fillStyle='#020516';c.beginPath();c.ellipse(450,s.center,Math.max(1,rx),Math.max(1,ry),0,0,TAU);c.fill();
 // Visible depth inside the opening, clipped to the portal instead of full-screen noise.
 c.save();c.clip();const n=light?36:84;for(let i=0;i<n;i++){const u=(i*.618+clock*.045)%1,a=i*2.399,r=u*250;c.globalAlpha=Math.sin(u*Math.PI)*s.portal*.8;c.fillStyle=i%4?'#bdb5ff':'#a5eff3';c.fillRect(450+Math.cos(a)*r,s.center+Math.sin(a)*r*1.4,1+u*3,1+u*3);}
 const tunnel=ease((s.seconds-4.6)/1.4)*(1-ease((s.seconds-11.3)/2));
 for(let i=0;i<(light?4:8);i++){c.beginPath();for(let j=0;j<=42;j++){const u=j/42,a=i*TAU/8+u*TAU*1.1-clock*.65,r=18+u*235,x=450+Math.cos(a)*r,y=s.center+Math.sin(a)*r*1.4;j?c.lineTo(x,y):c.moveTo(x,y);}c.globalAlpha=tunnel*.28;c.strokeStyle=i%2?'#bfa2ff':'#8bffe4';c.lineWidth=light?4:7;c.stroke();c.globalAlpha=tunnel*.6;c.lineWidth=1.4;c.stroke();}
 c.restore();
 for(let j=0;j<4;j++){c.globalAlpha=s.portal*s.fade*(.8-j*.12);ellipse(c,450,s.center,rx+j*9,ry+j*12,j%2?'#91e9dd':'#a9a0ff',j===0?5:1.5);}
 // Eight obelisks arrive in sequence, lock in place, then are drawn into the core.
 for(let i=0;i<8;i++){const g=s.shards[i],{x,y,a}=voidSealPoint(s,i,clock);
 c.save();c.globalAlpha=g*s.fade;c.translate(x,y);c.rotate(a+Math.PI/2);c.scale(.75+s.portal*.25,.75+s.portal*.25);const fill=c.createLinearGradient(-22,0,22,0);fill.addColorStop(0,'#123044');fill.addColorStop(.5,'#65b8c8');fill.addColorStop(1,'#182842');c.fillStyle=fill;c.strokeStyle='#cfb9ff';c.lineWidth=2;c.beginPath();c.moveTo(0,-65);c.lineTo(23,-30);c.lineTo(17,49);c.lineTo(0,68);c.lineTo(-17,49);c.lineTo(-23,-30);c.closePath();c.fill();c.stroke();c.strokeStyle='#bfffea';c.beginPath();c.moveTo(0,-38);c.lineTo(-10,-10);c.lineTo(9,15);c.lineTo(0,40);c.stroke();c.restore();
 }
 c.restore();
}
function serpent(scene,c,s,clock,front){
 if(!s.serpent)return;const light=scene.budget?.level==='light',r=(290*(1-s.bind)+25),phase=(s.seconds-5.2)/7,entry=1-ease((s.seconds-5.2)/1.3),x=450-entry*650,y=(s.center+40)*(1-s.bind)+(s.feet-150)*s.bind;
 c.save();c.beginPath();c.rect(0,front?y:0,900,front?1600:y);c.clip();
 drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x,y,radius:r,phase:s.motion?phase:.4,time:s.motion?clock*1000:0,color:2,side:-1,scale:.95*(1-s.bind*.65),light,alpha:s.serpent*.95});c.restore();
}
function voidWard(c,s,clock,light,front=false){
 if(!s.ward)return;const lock=ease((s.seconds-9.2)/2.1),power=s.ward*s.fade,base=s.feet+30;
 c.save();c.globalCompositeOperation='screen';
 if(!front){
  // Three concentric planes lock in sequence; the octagonal circuit is drawn edge by edge.
  for(let plane=0;plane<3;plane++){const u=ease((s.seconds-9.2-plane*.6)/1.1),radius=(310-plane*48)*(1-s.bind*.7),y=base-plane*64*u; c.globalAlpha=power*u*.65;ellipse(c,450,y,radius,radius*.29,plane%2?'#e7c1ff':'#9ff7e1',2.5);}
  glow(c,450,base-50,310,'#3ecca466',power*.6);
  for(let i=0;i<8;i++){const a=i*TAU/8,b=(i+3)*TAU/8,u=ease((s.seconds-10.2-i*.12)/.8);c.globalAlpha=power*u*.4;c.strokeStyle=i%2?'#c1aaff':'#9bffe5';c.lineWidth=1.5;c.beginPath();c.moveTo(450+Math.cos(a)*260,base+Math.sin(a)*75);c.lineTo(450+Math.cos(b)*260,base+Math.sin(b)*75);c.stroke();}
  const traced=clamp((s.seconds-9.7)/2.4)*8;c.globalAlpha=power*.8;c.strokeStyle='#b9ffea';c.lineWidth=2;
  for(let i=0;i<8;i++){const u=clamp(traced-i),a=i*TAU/8,b=(i+1)*TAU/8;if(!u)continue;c.beginPath();c.moveTo(450+Math.cos(a)*310,base+Math.sin(a)*90);c.lineTo(450+(Math.cos(a)+(Math.cos(b)-Math.cos(a))*u)*310,base+(Math.sin(a)+(Math.sin(b)-Math.sin(a))*u)*90);c.stroke();}
 }
 for(let i=0;i<8;i++){
  if((i<4)!==front)continue;const point=voidSealPoint(s,i,clock),rise=ease((s.seconds-9.6-i*.18)/1.0),h=rise*290*(1-s.bind*.9),x=point.x,y=point.y;
  c.globalAlpha=power*.7;const beam=c.createLinearGradient(x,y-h,x,y);beam.addColorStop(0,'#c2b4ff00');beam.addColorStop(.5,'#c2b4ff33');beam.addColorStop(1,'#a8ffddaa');c.fillStyle=beam;c.fillRect(x-10,y-h,20,h);
  ellipse(c,x,y-h,16,6,i%2?'#e6b9ff':'#abffdf',1.5);
  // The travelling bead is on the very same curve that will lead into the body.
  if(s.seconds>12.6){const u=clamp((s.seconds-12.6-i*.17)/1.65),tx=450,ty=s.feet-150,cy=y-230*(1-s.bind),px=(1-u)*(1-u)*x+2*(1-u)*u*450+u*u*tx,py=(1-u)*(1-u)*y+2*(1-u)*u*cy+u*u*ty;
   c.globalAlpha=power*(1-u)*.8;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(450,cy,tx,ty);c.strokeStyle=i%2?'#e0bfff':'#a9ffde';c.lineWidth=light?2:4;c.stroke();glow(c,px,py,22,'#e4fff5',power*(1-u));}
 }
 if(!front&&lock>0){const n=light?16:40;c.globalAlpha=power*.7;c.fillStyle='#b4e8ef';for(let i=0;i<n;i++){const u=(clock*.4+i/n)%1,a=i*2.399,r=170+Math.sin(a)*100;c.fillRect(450+Math.cos(a)*r,base-u*460,1.5,5);}}
 c.restore();
}
function convergence(c,s,clock,light){
 if(s.bind<=0)return;const n=light?16:40,x=450,y=s.feet-150;
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<n;i++){const u=(clock*.9+i/n)%1,a=i*2.399+clock*.35,r=(1-u)*290*(1-s.bind*.7);c.globalAlpha=Math.sin(u*Math.PI)*s.bind*s.fade;c.strokeStyle=i%2?'#d4beff':'#a8ffdd';c.lineWidth=2;c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a+.08)*r*.8,y+Math.sin(a+.08)*r*.8);c.stroke();}c.restore();
 glow(c,x,y,80+s.bind*95,'#c1e7ff',s.bind*(1-s.burst)*.6*s.fade);
}
export function drawLuyenHuAwakening(scene,c,e,t,H){
 prepareLuyenHuArt(scene);const s=luyenHuState((t-e.start)/e.duration,H,scene.motion!==false),clock=s.motion?s.seconds:0,light=scene.budget?.level==='light',live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||e.visualFrom,from=e.visualFrom||{...live,realm:5},to=e.visualTo||{...live,realm:6},p=s.revealed?to:from;
 c.save();const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#030813');bg.addColorStop(.5,'#11122d');bg.addColorStop(1,'#071c23');c.fillStyle=bg;c.fillRect(0,0,900,H);
 const shake=s.motion&&scene.cameraEnabled!==false?s.burst*12:0;c.translate(Math.sin(clock*83)*shake,Math.cos(clock*71)*shake*.55);
 // The first cracks become the gate itself: no unrelated opening flash.
 if(s.seconds<3.8){c.save();c.globalAlpha=ease(s.seconds/1.8)*(1-ease((s.seconds-2.2)/1.6));for(let i=0;i<5;i++){const y=s.center+(i-2)*43;c.strokeStyle=i%2?'#bdc8ff':'#9effdc';c.lineWidth=2;c.beginPath();c.moveTo(450-i*9,y-105);c.lineTo(435+i*5,y-35);c.lineTo(465-i*4,y+25);c.lineTo(450+i*6,y+100);c.stroke();}c.restore();}
 gateway(c,s,clock,light);voidWard(c,s,clock,light,false);serpent(scene,c,s,clock,false);
 // Keep the real outfit unchanged until the fusion has completed.
 if(live){const im=actorImage(scene,p,e);scene.targets=[{id:p.id,player:p,x:450,y:s.feet,scale:4.2}];if(im)c.drawImage(im,130,s.feet-590);else scene.drawPlayer(c,p,450,s.feet,0);}
 serpent(scene,c,s,clock,true);voidWard(c,s,clock,light,true);convergence(c,s,clock,light);
 if(s.seconds>=17.2){const reduced=s.motion?1:.25;glow(c,450,s.feet-170,200+s.burst*380,'#e0e8ff',s.burst*.9*reduced);for(let i=0;i<8;i++){const u=clamp((s.seconds-17.2-i*.10)/1.9);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*(.85-i*.065)*reduced;ellipse(c,450,i%2?s.feet+35:s.feet-170,45+ease(u)*680,(45+ease(u)*680)*(i%2?.27:.85),i%2?'#9dffe3':'#cbbaff',6*(1-u)+1);c.restore();}}
 c.restore();const ui={k:s.k,realm:6,phase:s.revealed?'reveal':s.seconds<2.2?'fracture':s.seconds<5.2?'gate':s.seconds<9.2?'serpent':s.seconds<12.6?'seals':s.seconds<16?'fusion':'compress',revealed:s.revealed,color:'#b7f5df',title:'Luyện Hư',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#e7e4ff';c.fillText(ui.name,450,H*.17);if(s.revealed){c.font='700 44px Arial';c.fillText('LUYỆN HƯ',450,H*.22);}}return ui;
}
