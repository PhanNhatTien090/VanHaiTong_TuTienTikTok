import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const GOLD='#ffe6a5',AMBER='#ff9c39',EMBER='#ff4e26';
let glow,seal;

function glowArt(){
 if(glow)return glow;
 const canvas=makeSurface(128,128);if(!canvas)return null;
 const c=canvas.getContext('2d'),g=c.createRadialGradient(64,64,4,64,64,64);
 g.addColorStop(0,'#ffcf598f');g.addColorStop(.35,'#ff692955');g.addColorStop(1,'#ff351400');
 c.fillStyle=g;c.fillRect(0,0,128,128);return glow=canvas;
}
function sealArt(){
 if(seal)return seal;
 const canvas=makeSurface(288,288);if(!canvas)return null;
 const c=canvas.getContext('2d');c.translate(144,144);
 for(const [radius,color,width] of [[132,'#a53b28',8],[125,AMBER,2.5],[101,GOLD,2],[80,'#fa7c44',1.5]]){
  c.beginPath();c.arc(0,0,radius,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();
 }
 for(let i=0;i<12;i++){
  c.save();c.rotate(i*TAU/12);c.strokeStyle=i%2?AMBER:GOLD;c.lineWidth=2;
  c.beginPath();c.moveTo(0,-122);c.lineTo(8,-113);c.lineTo(0,-104);c.lineTo(-8,-113);c.closePath();c.stroke();
  c.beginPath();c.moveTo(-13,-91);c.quadraticCurveTo(0,-79,13,-91);c.stroke();c.restore();
 }
 return seal=canvas;
}
function image(c,im,x,y,w,h,alpha=1){
 if(!im||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();
}
function floorSeal(c,t,r,y){
 c.save();c.translate(0,y);c.scale(1,.23);c.rotate(t*.00047);
 image(c,sealArt(),-r,-r,2*r,2*r,.85);c.restore();
}
function sparks(c,t,seed,count,width){
 for(let i=0;i<count;i++){
  const u=(i*.618+(t+seed)*.00043)%1,x=Math.sin(i*2.399+u*2)*width*(.43+u*.57);
  const y=24-u*(108+(i%5)*13);
  c.save();c.globalAlpha*=Math.sin(u*Math.PI)*.74;c.translate(x,y);c.rotate(Math.sin(i)*.6);
  c.fillStyle=i%3===0?GOLD:AMBER;c.fillRect(-.9,0,i%4===0?2:1.2,3+(i%5));c.restore();
 }
}
function flameArc(c,t,r,y,alpha){
 if(alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.translate(0,y);c.scale(1,.66);
 c.rotate(t*.00048);
 for(const [color,w] of [[EMBER,8],[AMBER,3.2],[GOLD,1]]){
  c.strokeStyle=color;c.lineWidth=w;c.beginPath();
  c.arc(0,0,r,-.58,1.46);c.moveTo(-r,0);c.arc(0,0,r,Math.PI,Math.PI+1.55);c.stroke();
 }
 c.restore();
}
export function drawBlackGoldAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,head=-51-stand*22;
 const breathe=motion?Math.sin((time+seed)*.0023):0;
 if(layer==='back'){
  image(c,glowArt(),-59,head-40,118,125,.68);
  floorSeal(c,time+seed,52+2*breathe,22);
 }else if(motion){
  sparks(c,time,seed,light?5:13,55);
 }
}

export function drawBlackGoldGear(c,art,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0;
 const sway=motion?Math.sin(time*.0021):0;
 if(layer==='back'){
  const y=-107-stand*17;
  image(c,glowArt(),-94,y-16,188,150,.58+sway*.10);
  image(c,art.halo,-68,y,136,171,1);
  if(motion&&!light)flameArc(c,time,59,y+48,.23+sway*.08);
 }else if(art.blade){
  c.save();c.translate(-48+stand*16,-40-stand*2+sway*1.8);
  c.rotate(.58+stand*.24+sway*.035);
  image(c,glowArt(),-18,1,36,73,.44+sway*.12);
  // Sprite's blade center is offset left of its ribbon.
  image(c,art.blade,-15,-17,47,103);
  if(motion&&!light){
   const travel=(time%1350)/1350;
   image(c,glowArt(),-9,12+travel*62,16,15,.75*Math.sin(travel*Math.PI));
  }
  c.restore();
 }
}

export function drawBlackGoldReveal(c,t,k,target,layer,reveal,art,{motion=true,light=false,pose={}}={}){
 const opacity=clamp(Math.min(k/.1,(1-k)/.23));
 if(opacity<=0)return;
 const charge=clamp(k/reveal),burst=clamp((k-reveal)/.38);
 const pulse=k>=reveal?Math.sin(Math.PI*clamp((k-reveal)/.46)):0;
 const clock=motion?t:0;
 c.save();c.globalAlpha*=opacity;c.translate(target.x,target.y);
 c.scale(target.scale||1.5,target.scale||1.5);
 if(layer==='back'){
  const radius=49+charge*27+burst*21;
  image(c,glowArt(),-radius,-145,radius*2,172,.55+charge*.21);
  floorSeal(c,clock,43+charge*27,23);
  flameArc(c,clock,40+charge*19,-43,.38+charge*.38);
  if(art&&k>=reveal)drawBlackGoldGear(c,art,clock,pose,'back',{motion,light});
 }else{
  if(pulse>0){
   c.save();c.globalAlpha*=pulse;
   c.strokeStyle=GOLD;c.lineWidth=2.5;
   c.beginPath();c.ellipse(0,20,35+burst*84,9+burst*18,0,0,TAU);c.stroke();c.restore();
  }
  if(art&&k>=reveal){
   if(motion&&pulse>0){
    c.save();c.translate(0,-38);c.rotate(-.52+burst*.72);c.scale(1,.44);
    const reach=42+burst*54,alpha=c.globalAlpha;
    for(const [color,width,opacity] of [[EMBER,11,.58],[AMBER,4,.9],[GOLD,1.25,1]]){
     c.globalAlpha=alpha*opacity*pulse;c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';
     c.beginPath();c.arc(0,0,reach,-2.55,-.3);c.stroke();
    }
    c.restore();
   }
   drawBlackGoldGear(c,art,clock,pose,'front',{motion,light});
  }
  if(motion)sparks(c,clock,0,light?10:20,77+burst*15);
 }
 c.restore();
}
