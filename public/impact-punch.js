// Readable 420 ms impact punctuation on the actual LIVE event clock.
// Reuses the preloaded V3.5 celestial-impact image; no image requests or loops per hit.
// This layer is visual only: no invented gameplay result, health or reward.
import {drawCelestialImpact} from './cinematic-vfx.js';
import {ascensionImpactRatio} from './audio.js';
import {breakthroughRealm} from './breakthrough-fx.js';
import {impactSeverity} from './skill-impact-v3.js';
import {GIFT_HITS} from './gift-spectacle.js';
import {makeSurface} from './performance.js';
import {cameraShakeStrength} from './cinematic-feedback.js';

const TAU=Math.PI*2,SPAN=420;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const within=(age)=>Number.isFinite(age)&&age>=0&&age<SPAN;

export function impactBeat(scene,t,wallNow=Date.now()){
 if(scene.cinematicV2===false)return null;
 let best=null;
 const offer=(kind,priority,age,x,y,power,color,screen=false)=>{
  if(!within(age))return;
  const cue={kind,priority,age,x,y,power,color,screen};
  if(!best||priority>best.priority||(priority===best.priority&&age<best.age))best=cue;
 };
 for(const e of scene.effects||[]){
  if(!e||!(e.duration>0)||!Number.isFinite(e.start))continue;
  const progress=(t-e.start)/e.duration;
  if(e.effect==='breakthrough'){
   const realm=breakthroughRealm(e);
   offer('breakthrough',6,t-e.start-e.duration*ascensionImpactRatio(realm),
    450,(scene.height||1200)*.43,realm>=7?3:realm>=3?2:1,
    realm>=22?'#e7b4ff':realm===6?'#a5d7ff':'#ffe3a0',true);
   continue;
  }
  if(e.gift&&e.spectacleTier?.min>=500){
   const tier=e.spectacleTier.min,priority=tier>=3000?5:tier>=1500?4:3;
   const power=tier>=3000?3:tier>=1500?2:1;
   const actor=scene.targets?.find(a=>a.id===e.user);
   const x=actor?.x??450,y=(actor?.y??(scene.height||1200)*.62)-170;
   for(const [i,at] of GIFT_HITS.entries()){
    if(i===1&&tier<3000)continue;
    offer('gift',priority-i*.2,(progress-at)*e.duration,x,y,i===1?power-.4:power,'#ffe29a');
   }
   continue;
  }
  if(e.effect==='attack'&&impactSeverity(e)>=2&&!scene.raceStatus?.active){
   const severity=impactSeverity(e);
   offer('skill',2,(progress-.55)*e.duration,
    Number.isFinite(e.target?.x)?e.target.x:450,
    (scene.height||1200)*(Number.isFinite(e.target?.yRatio)?e.target.yRatio:.38),
    severity,severity>=3?'#ffe7a5':'#9beeff');
  }
 }
 const boss=scene.battleSound;
 if(scene.boss&&boss?.impactAt&&scene.arenaActive!==false)
  offer('boss',4.5,wallNow-boss.impactAt,450,(scene.height||1200)*.36,3,'#ffc08a');
 const duel=scene.duelImpact;
 if(scene.socialScene==='tournament'&&duel?.ultimate)
  offer('duel',4,wallNow-duel.at,duel.x??450,duel.y??(scene.height||1200)*.43,3,'#e9d0ff');
 return best;
}

export function drawImpactPunctuation(scene,c,t,H,wallNow=Date.now()){
 const cue=impactBeat(scene,t,wallNow);
 if(!cue||!c)return false;
 const light=!!(scene.budget?.pressured||scene.budget?.level==='light'||(scene.fps>0&&scene.fps<18));
 const reduced=scene.reduceFlash===true,still=scene.motion===false;
 const u=still?.27:cue.age/SPAN,fade=(1-cue.age/SPAN)**1.5;
 const cam=cue.screen?{s:1,x:0,y:0}:scene.lastCam||{s:1,x:0,y:0};
 const x=clamp(cue.x*cam.s+cam.x,72,828),y=clamp(cue.y*cam.s+cam.y,H*.20,H*.76);
 const size=(100+cue.power*37)*(light?.82:1),radius=size*(.43+u*1.04);
 c.save();
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 c.globalAlpha=1;
 // A thin dark backing makes the hit visible against even the brightest realms.
 c.fillStyle='rgba(5,9,24,.22)';
 c.beginPath();c.ellipse(x,y,Math.max(12,30*(1-u)),Math.max(9,20*(1-u)),0,0,TAU);c.fill();
 if(!reduced){
  const glow=c.createRadialGradient(x,y,0,x,y,size*.86);
  glow.addColorStop(0,'rgba(255,250,224,.78)');
  glow.addColorStop(.19,cue.color);
  glow.addColorStop(1,'rgba(8,13,28,0)');
  c.globalAlpha=fade*(light?.23:.37);
  c.globalCompositeOperation='lighter';
  c.fillStyle=glow;c.fillRect(x-size,y-size,size*2,size*2);
  c.globalAlpha=1;
  // The existing generated transparent illustration now appears at every real major impact.
  drawCelestialImpact(c,x,y,cue.age,size*.85,(light?.50:.78)*fade);
 }
 c.globalCompositeOperation='source-over';
 c.globalAlpha=fade;
 c.lineCap='round';
 c.strokeStyle=cue.color;c.lineWidth=light?5:7;
 c.beginPath();c.ellipse(x,y,radius,radius*.54,-.18,0,TAU);c.stroke();
 c.strokeStyle='#fff9dc';c.lineWidth=light?1.6:2.3;
 c.beginPath();c.ellipse(x,y,radius*.94,radius*.49,-.18,0,TAU);c.stroke();
 const rays=light?6:cue.power>=3?14:10,seed=cue.kind.length*.61;
 c.lineWidth=light?2.5:3.5;c.strokeStyle=cue.color;c.beginPath();
 for(let i=0;i<rays;i++){
  const a=TAU*i/rays+seed,dist=size*(.3+u*.47),extra=size*(.10+(i%3)*.06)*(1-u*.45);
  const cs=Math.cos(a),sn=Math.sin(a);
  c.moveTo(x+cs*dist,y+sn*dist*.68);
  c.lineTo(x+cs*(dist+extra),y+sn*(dist+extra)*.68);
 }
 c.stroke();
 if(!reduced){
  c.globalAlpha=fade*(light?.42:.70);
  c.strokeStyle='#fffdf1';c.lineWidth=1.25;c.beginPath();
  c.moveTo(x-size*.23,y-size*.06);c.lineTo(x+size*.23,y+size*.06);
  c.moveTo(x-size*.06,y+size*.21);c.lineTo(x+size*.06,y-size*.21);c.stroke();
 }
 c.restore();
 return true;
}

export function drawImpactCamera(scene,c,t,H,wallNow=Date.now()){
 const strength=cameraShakeStrength(scene),cue=strength&&impactBeat(scene,t,wallNow);
 scene.screenShake={active:false,x:0,y:0};
 if(!cue)return false;
 const envelope=(1-cue.age/SPAN)**2,amount=(cue.power>=3?16:cue.power>=2?11:7)*strength*envelope;
 if(amount<.15)return false;
 const dx=Math.sin(cue.age*.052+.9)*amount,dy=Math.cos(cue.age*.069+.4)*amount*.65;
 const canvas=scene.canvas,w=canvas.width,h=canvas.height;
 if(!(w>0&&h>0&&H>0))return false;
 let buffer=scene.impactCameraBuffer;
 if(!buffer||buffer.width!==w||buffer.height!==h)buffer=scene.impactCameraBuffer=makeSurface(w,h);
 const copy=buffer?.getContext('2d');
 if(!copy)return false;
 copy.setTransform(1,0,0,1,0,0);copy.clearRect(0,0,w,h);copy.drawImage(canvas,0,0);
 const scale=1+2*Math.max(Math.abs(dx)/900,Math.abs(dy)/H)+.003;
 c.save();
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 c.clearRect(0,0,w,h);
 c.drawImage(buffer,w*(1-scale)/2+dx*w/900,h*(1-scale)/2+dy*h/H,w*scale,h*scale);
 c.restore();
 scene.screenShake={active:true,x:dx,y:dy,kind:cue.kind};
 return true;
}
