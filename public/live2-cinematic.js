// Screen-space cinematic ribbon for milestone events. Draw AFTER world camera using 900xH logical coordinates.
// High-tier only: Dao Grandmaster, guild-war opening, Boss shield break, completed Heaven Trial.
// No shadowBlur, patterns, canvas allocations, texture uploads, timers, or per-person effects.
const SHARDS=Object.freeze(Array.from({length:14},(_,i)=>{
 const a=(i*2.39996323+.4),dist=.35+(i%5)*.11;
 return Object.freeze({x:Math.cos(a)*dist,y:Math.sin(a)*dist,w:9+i%4*6,h:18+i%3*10,rot:a});
}));
const RAYS=Object.freeze([-.92,-.63,-.37,-.14,.21,.52,.83]);
const color=e=>e?.bossPhase?'#a0e2ff':e?.tribulationComplete?'#c5a9ff':e?.guildWarStart?'#f5cd86':
 ({sword:'#98e9ff',demon:'#d599ff',body:'#ffe8a0',beast:'#8cf0da',alchemy:'#ffbd85'})[e?.daoPath]||'#b8d8ff';
export const live2CinematicEligible=e=>!!e&&!e.live2CinematicSuppressed&&!!(e.daoUltimate||e.guildWarStart||e.bossPhase==='seal-break'||e.tribulationComplete);
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawLive2ScreenFx(c,e,k,t,H=1600,{light=false,reducedFlash=false,motion=true}={}){
 if(!live2CinematicEligible(e)||!c||!Number.isFinite(k)||k<0||k>1)return false;
 const col=color(e),x=450,y=H*.42,fade=clamp(k*8)*clamp((1-k)*7);
 c.save();
 try{
  // Shared gentle darkening never obscures status, names or important gift panels.
  if(!light&&!reducedFlash&&k<.5){
   c.globalAlpha=.18*clamp(k*7)*clamp((.5-k)*5);
   c.fillStyle='#060916';c.fillRect(0,0,900,H);
  }
  if(k>.17&&k<.72){
   const a=clamp((k-.17)*7)*clamp((.72-k)*5)*fade;
   c.lineCap='round';c.globalAlpha=light?a*.37:reducedFlash?a*.42:a*.85;
   c.strokeStyle=col;c.lineWidth=light?3:7;
   c.beginPath();c.moveTo(-80,y+H*.14);c.lineTo(980,y-H*.23);c.stroke();
   if(!light){
    c.lineWidth=2.5;c.globalAlpha*=.7;
    c.beginPath();c.moveTo(-65,y+H*.17);c.lineTo(970,y-H*.20);c.stroke();
    c.lineWidth=4;c.beginPath();c.moveTo(80,y-H*.30);c.lineTo(895,y+H*.20);c.stroke();
   }
  }
  if(!light&&k>.33&&k<.79){
   const a=clamp((k-.33)*8)*clamp((.79-k)*4)*fade;
   c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=a*(reducedFlash?.35:.66);
   // Radiating fractures with fixed geometry. Deliberately not a fullscreen white flash.
   for(let i=0;i<RAYS.length;i++){
    const angle=RAYS[i]+Math.PI/2,extent=205+(i%3)*60;
    const dx=Math.cos(angle),dy=Math.sin(angle);
    c.beginPath();c.moveTo(x,y);
    c.lineTo(x+dx*extent*.46+Math.cos(angle+1.2)*20,y+dy*extent*.46);
    c.lineTo(x+dx*extent,y+dy*extent);c.stroke();
   }
   if(motion){
    c.fillStyle=col;
    for(const sh of SHARDS){
     const scatter=1+Math.max(0,k-.50)*2.2,px=x+sh.x*560*scatter,py=y+sh.y*600*scatter;
     c.save();c.translate(px,py);c.rotate(sh.rot+t*.00018);
     c.globalAlpha=a*.34;c.beginPath();c.moveTo(0,-sh.h);c.lineTo(sh.w,0);c.lineTo(0,sh.h);c.closePath();c.fill();c.restore();
    }
   }
  }
  if(k>.5&&k<.94){
   const a=clamp((k-.5)*5)*clamp((.94-k)*4);
   c.globalAlpha=a*(reducedFlash?.24:.55);c.strokeStyle=col;c.lineWidth=light?2:3;
   c.beginPath();c.ellipse(x,y,58+(k-.5)*(light?300:540),34+(k-.5)*(light?140:280),0,0,Math.PI*2);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
