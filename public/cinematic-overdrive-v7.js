// V7: screen-wide compositing without a second rAF, screen filter or true game pause.
// The illusion of impact-stop is a 90ms static artwork hold while simulation proceeds.
import {duelCastState} from './duel-combat.js';
import {makeSurface} from './performance.js';
const TAU=Math.PI*2;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const easeOut=u=>1-(1-u)**3;
const WINDOW=680;
export const SHATTER_URL='/assets/v7/screen-shatter.svg';
export const V7_SOUND_HIT_AT=.67;
export function overdriveBudget(scene){
 const low=!!(scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light'||(scene.fps>0&&scene.fps<19));
 return {low,cracks:low?7:18,streaks:low?3:10,showArt:!low,shatterOpacity:scene.reduceFlash?.34:low?.42:.77,
  motion:scene.motion!==false};
}
export function prewarmOverdrive(scene){
 if(!scene||scene.v7ShatterLoading||scene.v7ShatterFailed||scene.v7ShatterArt||
  scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light'||typeof Image==='undefined')return;
 scene.v7ShatterLoading=true;
 const img=new Image();
 img.decoding='async';
 img.onload=()=>{
  scene.v7ShatterLoading=false;
  // One-time vector raster before the hero's 19.8s charge avoids first-hit SVG decoding.
  const frame=makeSurface(540,960);
  if(frame)try{
   frame.getContext('2d').drawImage(img,0,0,540,960);
   frame.naturalWidth=540;frame.naturalHeight=960;
   scene.v7ShatterArt=frame;return;
  }catch{}
  scene.v7ShatterArt=img;
 };
 img.onerror=()=>{scene.v7ShatterLoading=false;scene.v7ShatterFailed=true;};
 img.src=SHATTER_URL;
}
export function overdriveMoment(scene,t,wallNow=Date.now()){
 if(scene?.cinematicV2===false||scene?.v7Overdrive===false)return null;
 let best=null;
 const duel=scene.duelImpact;
 if(scene.socialScene==='tournament'&&duel?.ultimate&&Number.isFinite(duel.at)){
  const age=wallNow-duel.at;
  if(age>=0&&age<WINDOW)best={kind:'duel',priority:5,age,x:duel.x??450,y:duel.y??(scene.height||1600)*.60,power:3,color:'#b7a4ff'};
 }
 const rows=scene.eventGiftQueue?.activeRows||[];
 for(const e of rows){
  if(e.mode!=='duel'||!(e.value>=1000)||!(e.profile?.duration>0))continue;
  const age=t-e.start-e.profile.duration*.30;
  if(age<0||age>=WINDOW)continue;
  const priority=e.value>=5000?7:e.value>=2000?6:4;
  if(best&&best.priority>=priority)continue;
  best={kind:'gift',priority,age,x:450,y:(scene.height||1600)*.54,
   power:e.value>=5000?4:3,color:e.wardEffect?.kind==='shield-heal'?'#9bffdb':'#ffe4ac'};
 }
 return best;
}
function fractureLines(c,x,y,span,count,fade,seed,color){
 c.lineCap='butt';
 for(let i=0;i<count;i++){
  const a=i*TAU/count+seed*.39,r=span*(.57+(i%4)*.13),
  mx=x+Math.cos(a+.07*(i%2?1:-1))*r*.46,
  my=y+Math.sin(a+.07*(i%2?1:-1))*r*.46,
  ex=x+Math.cos(a)*r,ey=y+Math.sin(a)*r;
  c.globalAlpha=fade*(i%3===0?.96:.65);
  c.strokeStyle=i%3===0?'#f9fcff':color;
  c.lineWidth=i%3===0?2.6:1.7;c.beginPath();
  c.moveTo(x,y);c.lineTo(mx,my);c.lineTo(ex,ey);c.stroke();
  if(i%2===0){
   const a2=a+(i%4===0?.34:-.27);
   c.beginPath();c.moveTo(mx,my);
   c.lineTo(mx+Math.cos(a2)*r*.38,my+Math.sin(a2)*r*.38);c.stroke();
  }
 }
}
export function drawOverdriveV7(scene,c,t,H,wallNow=Date.now()){
 if(!scene||!c||scene.v7Overdrive===false||scene.cinematicV2===false)return false;
 const budget=overdriveBudget(scene);
 const moment=overdriveMoment(scene,t,wallNow);
 const match=scene.socialScene==='tournament'?scene.socialStatus?.tournament?.current:null;
 let charge=null;
 if(!moment&&match?.startedAt){
  const age=wallNow-match.startedAt;
  if(age>=19800&&age<23300){
   const cast=duelCastState(age,((match.aura?.[match.a]||0)-(match.aura?.[match.b]||0))/100);
   if(cast.ultimate&&cast.ready&&cast.k<.56)charge=cast;
  }
 }
 if(!moment&&!charge)return false;
 c.save();c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 if(charge){
  const u=clamp(charge.k/.56),opacity=(budget.low?.08:.16)*u;
  c.globalAlpha=opacity;c.fillStyle='#020515';c.fillRect(0,H*.21,900,H*.53);
  const count=budget.streaks;
  c.lineCap='round';
  for(let i=0;i<count;i++){
   const left=i%2===0,xx=left?0:900,yy=H*(.29+i*.43/count);
   c.globalAlpha=u*(budget.low?.24:.52);c.strokeStyle=i%3===0?'#f6e8c5':'#b9acff';
   c.lineWidth=i%3===0?3:2;c.beginPath();c.moveTo(xx,yy);
   c.lineTo(xx+(left?1:-1)*(110+u*160),yy+(i%2?18:-17));c.stroke();
  }
  c.restore();return true;
 }
 const u=clamp(moment.age/WINDOW),burst=clamp((moment.age-12)/115),hold=moment.age<110?1:1-clamp((moment.age-110)/(WINDOW-110));
 const strength=(.18+.82*burst)*hold;
 const x=clamp(moment.x,105,795),y=clamp(moment.y,H*.27,H*.74);
 const span=budget.low?300:460;
 // A thin matte stroke improves contrast more than an expensive full-screen bloom.
 c.globalAlpha=.14*strength;c.fillStyle='#030713';c.fillRect(0,H*.20,900,H*.57);
 if(budget.showArt&&scene.reduceFlash!==true){
  const premium=scene.v7PremiumArt?.shatter;
  if(premium?.naturalWidth){
   c.globalAlpha=Math.min(.72,budget.shatterOpacity)*strength;
   const width=Math.min(950,720+moment.power*58),height=width*(premium.naturalHeight/premium.naturalWidth);
   c.drawImage(premium,x-width*.5,y-height*.48,width,height);
  }
  if(scene.v7ShatterArt?.naturalWidth){
   c.globalAlpha=(premium?.naturalWidth?.42:budget.shatterOpacity)*strength;
   const w=900,h=Math.min(H*1.08,1550),yy=y-h*.4;
   c.drawImage(scene.v7ShatterArt,0,yy,w,h);
  }else if(!premium?.naturalWidth)fractureLines(c,x,y,span,budget.cracks,strength,3.1,moment.color);
 }else fractureLines(c,x,y,span,budget.cracks,strength,3.1,moment.color);
 // Three diagonal screen tears sweep past the impact, revealing dark negative
 // space instead of blowing out the game with an expensive white full-screen flash.
 // Reduced motion/flash and crowded modes omit this layer entirely.
 if(!budget.low&&budget.motion&&scene.reduceFlash!==true&&moment.age<310){
  const duration=clamp((310-moment.age)/310),shift=easeOut(clamp(moment.age/140));
  c.globalAlpha=.24*strength*duration;c.fillStyle='#04071a';
  for(let i=0;i<3;i++){
   const off=(i-1)*90+(shift-.5)*75;
   c.beginPath();c.moveTo(-60,y+off-90);c.lineTo(960,y+off-230);
   c.lineTo(960,y+off-213);c.lineTo(-60,y+off-73);c.closePath();c.fill();
   c.globalAlpha=.65*strength*duration;c.lineWidth=i===1?3:1.5;
   c.strokeStyle=i===1?'#fff8e6':moment.color;
   c.beginPath();c.moveTo(-60,y+off-90);c.lineTo(960,y+off-230);c.stroke();
   c.globalAlpha=.24*strength*duration;
  }
 }
 // Static contact core for ~90ms: hit-stop *appearance* without delaying gameplay.
 const radius=(26+315*clamp(u*2))* (budget.low?.83:1);
 c.globalAlpha=strength*.92;c.strokeStyle=moment.color;c.lineWidth=budget.low?4:6;
 c.beginPath();c.ellipse(x,y,radius,radius*.43,0,0,TAU);c.stroke();
 c.globalAlpha=strength*.63;c.strokeStyle='#fff7e2';c.lineWidth=2;
 c.beginPath();c.ellipse(x,y,radius*.75,radius*.27,0,0,TAU);c.stroke();
 if(!budget.low){
  const rays=budget.streaks;
  for(let i=0;i<rays;i++){
   const a=i*TAU/rays+.17,far=radius*1.4;
   c.globalAlpha=strength*(i%2?.42:.73);c.strokeStyle=i%3?'#f4f6ff':moment.color;
   c.lineWidth=i%3===0?6:3;c.beginPath();c.moveTo(x+Math.cos(a)*far*.4,y+Math.sin(a)*far*.45);
   c.lineTo(x+Math.cos(a)*far,y+Math.sin(a)*far*.75);c.stroke();
  }
 }
 c.restore();
 return true;
}
