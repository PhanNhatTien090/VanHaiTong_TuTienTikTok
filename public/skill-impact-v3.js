// V3.5 combat punctuation: skill ribbon and short localized hit response.
// Actual hit time follows the existing three-phase combat animation (~55%).
import {drawAura,drawShockwave,drawTrail} from './cinematic-vfx.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=v=>1-(1-clamp(v))**3;
const bannerSizes=new Map();
export function combatImpactClock(event){return (Number(event?.technique?.duration)||Number(event?.duration)||2000)*.55;}
export function impactSeverity(event){
 if(!(Number(event?.damage)>0))return 0;
 return Math.max(1,Math.min(3,Number(event?.technique?.intensity)||1));
}
export function drawSkillImpact(scene,c,e,age,k,H){
 const tr=e.technique;if(!tr)return;
 const color=tr.color||'#bdefff',severity=impactSeverity(e),light=scene.budget?.pressured||scene.budget?.level==='light'||scene.visibleActors>25;
 // One short, readable skill identity strip; do not obscure the stage UI.
 if(tr.ultimate||severity>=2){
  const appear=clamp((k-.055)/.10),hide=clamp((.50-k)/.12),alpha=appear*hide;
  if(alpha>.01){
   const name=String(tr.name||'TUYỆT KỸ').slice(0,32);
   const key=name+':'+(light?'light':'full');
   c.save();c.globalAlpha*=alpha*.87;c.font='700 21px Georgia';
   let width=bannerSizes.get(key);if(width===undefined){width=Math.min(480,Math.max(230,c.measureText(name).width+85));bannerSizes.set(key,width);if(bannerSizes.size>64)bannerSizes.delete(bannerSizes.keys().next().value);}
   const x=450,y=H*.31+Math.sin(Math.PI*clamp(k/.5))*-12,half=width/2;
   c.fillStyle='#0a1135dd';c.beginPath();c.moveTo(x-half+12,y);c.lineTo(x+half,y);c.lineTo(x+half-13,y+47);c.lineTo(x-half,y+47);c.closePath();c.fill();
   c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(x-half+14,y+3);c.lineTo(x+half-6,y+3);c.moveTo(x-half+6,y+44);c.lineTo(x+half-19,y+44);c.stroke();
   c.fillStyle='#fffaf0';c.textAlign='center';c.fillText(name,x,y+31);c.restore();
  }
 }
 if(!severity||k<.55||k>.80)return;
 const impactAge=age-combatImpactClock(e),x=e.target?.x??450,y=H*(e.target?.yRatio??.37);
 if(impactAge<0||impactAge>=500)return;
 const q=light?'light':'balanced',radius=(90+severity*26)*(light?.85:1);
 const seed=Number(e.cinematicSeed)||.34;
 drawShockwave(c,severity>=3?'gold':'jade',x,y,impactAge,{quality:q,radius,seed,flash:false,motion:scene.motion!==false,aspect:.62});
 if(!scene.reduceFlash&&impactAge<160)drawAura(c,severity>=3?'gold':'jade',x,y,60+severity*24,(1-impactAge/160)*.16);
 if(!light&&severity>=3&&scene.motion!==false){
  const f=1-smooth(impactAge/300);
  drawTrail(c,'gold',x-35*f,y,Math.PI,80*f,f*.32);
  drawTrail(c,'gold',x+35*f,y,0,80*f,f*.32);
 }
}
