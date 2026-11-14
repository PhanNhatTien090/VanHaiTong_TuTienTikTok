import {drawAura,drawSeal,drawShockwave,drawTrail} from './cinematic-vfx.js';
export const warGiftWindup=tier=>430-tier*42;
export const WAR_REVERSAL_HIT=260;
const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v));
const random=n=>((Math.imul(n+193,1664525)^Math.imul(n+7,1013904223))>>>0)/4294967296;
function path(c,points){
 c.beginPath();for(const [i,[x,y]] of points.entries())i?c.lineTo(x,y):c.moveTo(x,y);
}
function arc(c,x,y,rx,ry,angle,color,width){
 c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
export function warGiftImpact(c,{age,lx,H,side,tier,seed,light,moved,reducedFlash=false}){
 const dir=side==='chinh'?1:-1, hue=dir>0?'#69eadf':'#ff506a', gold=dir>0?'#ffe7a9':'#ffb988';
 const y=H*.48, windup=warGiftWindup(tier), hit=age-windup, origin=dir>0?-95:995;
 const power=Math.min(1,moved/450), scale=.72+tier*.32+power*.4;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';
 if(hit<0){
  const u=clamp(age/windup), head=origin+(lx-origin)*u*u, reach=(120+95*tier)*scale;
  c.globalAlpha=Math.min(1,u*4+.15);
  for(let i=0;i<(light?6:12);i++){
   const curve=(i%2?-1:1)*(12+i*6)*scale, ex=head-dir*reach*(.45+random(seed+i)*.55);
   c.strokeStyle=i%3?hue:gold;c.lineWidth=(i%3?3:6)*scale;c.beginPath();
   c.moveTo(ex,y+curve*1.4);c.bezierCurveTo(head-dir*reach*.52,y+curve,head-dir*reach*.24,y+curve*.22,head,y);c.stroke();
  }
  for(let i=0;i<3+tier;i++)arc(c,head-dir*i*19*scale,y,19*scale,34*scale+i*4,-dir*.26,i%2?gold:hue,3.5);
 }else{
  const k=clamp(hit/(1250+150*tier)), fade=1-k;
  if(hit<380){
   const strike=1-hit/380,r=42+(1-strike)*156;
   c.globalAlpha=strike*(reducedFlash?.35:.8);
   arc(c,lx,y,r,r*.35,-dir*.13,hue,6*strike+2);
   c.globalAlpha*=.7;
   arc(c,lx,y,r*.75,r*.3,dir*.13,gold,2.4);
  }
  if(moved>0){
   const sweep=(80+Math.min(435,moved*.8))*Math.sin(k*Math.PI/2),x=lx+dir*sweep;
   for(let i=0;i<3+tier;i++){
    c.globalAlpha=fade*(.85-i*.095);c.strokeStyle=i%2?hue:gold;c.lineWidth=(10-i)*scale;
    c.beginPath();c.moveTo(x-dir*(60+i*20),y-(96+i*30)*scale);
    c.bezierCurveTo(x+dir*100*scale,y-48*scale,x+dir*100*scale,y+74*scale,x-dir*(35+i*15),y+(102+i*28)*scale);c.stroke();
   }
  }
  for(let i=0;i<(light?10:22)+tier*3;i++){
   const a=(random(seed+i)-.5)*Math.PI*1.5,v=(75+random(seed+i*3+6)*260)*scale,d=k*v;
   const x=lx+dir*Math.cos(a)*d,y2=y+Math.sin(a)*d+(k*k*100);
   c.globalAlpha=fade*(.38+random(i)*.6);c.strokeStyle=i%3?hue:'#fff6dc';c.lineWidth=i%4?2:4;
   c.beginPath();c.moveTo(x-dir*13,y2-7);c.lineTo(x+dir*5,y2);c.lineTo(x-dir*7,y2+5);c.stroke();
  }
  for(let i=0;i<3;i++){
   const u=clamp(k-i*.09);if(!u)continue;
   c.globalAlpha=(1-u)*.55;arc(c,lx,y,(22+u*198)*scale,(35+u*235)*scale,dir*.14,i%2?gold:hue,2+i);
  }
 }
 c.restore();
}

export function drawWarSeal(c,theme,x,y,age,motion,alpha){
 drawSeal(c,theme,x,y,160,motion?age*.0007:0,alpha);
 drawAura(c,theme,x,y-30,92,alpha*.4);
}

export function drawWarReversal(c,{age,lx,H,side,quality,motion,flash,jolt}){
 const theme=side==='chinh'?'dawn':'dusk',y=H*.48;
 const u=clamp(age/WAR_REVERSAL_HIT),hit=age-WAR_REVERSAL_HIT;
 c.save();c.translate(jolt.x,jolt.y);
 if(hit<0){
  const reach=motion?(1-u)*350:110;
  drawTrail(c,'dawn',lx-reach,y-14,0,260,.62);
  drawTrail(c,'dusk',lx+reach,y+14,Math.PI,260,.62);
 }else{
  drawShockwave(c,theme,lx,y,hit,{quality,radius:345,motion,flash,aspect:.19});
  if(hit<390&&motion){
   const sweep=hit*.76;
   drawTrail(c,theme,lx-sweep,y,Math.PI,230,.78*(1-hit/390));
   drawTrail(c,theme,lx+sweep,y,0,230,.78*(1-hit/390));
  }
 }
 c.restore();
}

export function drawWarForces(c,{H,lx,t,surge,push,light,motion}){
 const y=H*.48;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';
 for(const dir of [1,-1]){
  const side=dir>0?'chinh':'ma',a=surge[side]||0,front=lx-dir*13,edge=dir>0?-35:935;
  const color=dir>0?'#71e7de':'#fb5773',hot=dir>0?'#ffefb0':'#ffc6bd';
  for(let i=0;i<(light?5:9);i++){
   const off=(i%2?-1:1)*(12+i*15)*(1+a*.35),wave=motion?Math.sin(t*.004+i)*22:0;
   c.globalAlpha=(i%2?.34:.65)*(1+a*.13);c.lineWidth=(i%2?3:5)+a*1.6;
   c.strokeStyle=i%3?color:hot;c.beginPath();c.moveTo(edge,y+off*1.45);
   c.bezierCurveTo(edge+(front-edge)*.52,y+off+wave,front-dir*135,y+off*.48-wave*.3,front,y+off*.12);c.stroke();
   if(motion&&i%2===0){
    const u=(t*(.00055+a*.0004)+i*.21)%1,x=edge+(front-edge)*u,py=y+off*(1-u)*.92+wave*.35;
    c.strokeStyle=hot;c.globalAlpha=.64;c.lineWidth=1.8;
    path(c,[[x-dir*29,py+10],[x-dir*15,py-3],[x-dir*7,py+5],[x,py]]);c.stroke();
   }
  }
 }
 const r=28+Math.max(surge.chinh||0,surge.ma||0)*21;
 const g=c.createRadialGradient(lx,y,3,lx,y,r*3.5);
 g.addColorStop(0,'#ffffffd9');g.addColorStop(.23,'#ffe1ba5c');g.addColorStop(1,'#ffe1ba00');c.globalAlpha=.9;c.fillStyle=g;
 c.fillRect(lx-r*3.5,y-r*3.5,r*7,r*7);
 for(let i=0;i<8;i++){
  const u=motion?((t*.0014+i*.173)%1):i*.12;
  const side=i%2?1:-1,span=r*(.58+u*2);
  c.globalAlpha=(1-u)*.7;c.strokeStyle=side>0?'#ff7892':'#93ffee';c.lineWidth=2.2;
  path(c,[[lx+push*u*48,y],[lx+side*span*.5,y-span*.6],[lx-side*span*.1,y-span],[lx+side*span*.45,y-span*1.5]]);c.stroke();
 }
 c.restore();
}
