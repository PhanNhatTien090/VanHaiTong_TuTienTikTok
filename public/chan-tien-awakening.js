import {makeSurface} from './performance.js';
import {drawChanTienPrelude} from './chan-tien-prelude.js';
import {immortalCamera,drawImmortalWorld,prepareImmortalWorld} from './cinematic-world.js';
import {loadSpiritBeasts,drawFlyingDragon} from './gift-spirit-beasts.js';
import {actorImage} from './hoa-than-awakening.js';
import {TAU,clamp,ease,glow,backdrop,ritualHUD} from './ascension-primitives.js';
import {organicPortalPath,portalRim,smokeTexture,smoke,driftingMists,stormClouds,filament,filmFinish,softRelease} from './cinema-atmosphere.js';
export const CHAN_TIEN_DURATION=31600,CHAN_TIEN_REVEAL=27.6;
export function chanTienState(k,H=1600,motion=true){const realSeconds=clamp(k)*31.6,seconds=realSeconds-Math.min(6,Math.max(0,realSeconds-11)),lift=ease((seconds-11)/4.2)*125,entry=ease((seconds-18.2)/3);return {k:clamp(k),seconds,realSeconds,flight:realSeconds>=11&&realSeconds<17,camera:immortalCamera(realSeconds,motion),feet:H*.69-lift,ground:H*.69+40,gateY:H*.40,open:ease((seconds-3)/3.5),dragon:ease((seconds-7)/1.3)*(1-ease((seconds-17.1)/1.1)),steps:Array.from({length:9},(_,i)=>ease((seconds-11-i*.42)/.65)),entry,lift,pearlY:(H*.40+20)*(1-entry)+(H*.69-lift-145)*entry,burst:ease((seconds-21.3)/.18)*(1-ease((seconds-21.8)/1.6)),revealed:realSeconds>=CHAN_TIEN_REVEAL,fade:1-ease((seconds-24)/1.6),phase:seconds<3?'clouds':seconds<7?'gate':seconds<11?'dragon':seconds<15.2?'ascend':seconds<18.2?'pearl':seconds<21.3?'entry':seconds<21.6?'burst':'reveal',motion};}
function floatingBody(scene,c,e,s){
 const live=e.visualFrom||scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user);if(!live)return;
 const p=s.revealed?(e.visualTo||{...live,realm:8}):live,im=actorImage(scene,p,e),clock=s.motion?s.realSeconds:0,arrive=ease((s.realSeconds-17)/1.3);
 scene.targets=[{id:p.id,player:p,x:450,y:s.feet,scale:4.2}];c.save();c.globalAlpha=arrive;
 const dissolve=ease((s.realSeconds-CHAN_TIEN_REVEAL)/.42),old=s.revealed&&dissolve<1?actorImage(scene,live,e):null;
 if(im){const bands=scene.budget?.level==='light'?10:18;for(let i=0;i<bands;i++){const u=i/bands,offset=s.motion?Math.sin(clock*1.25-u*1.7)*2*u*u:0;const args=[0,i*720/bands,640,720/bands,130+offset,s.feet-590+i*720/bands,640,720/bands+.6];if(old){c.globalAlpha=arrive*(1-dissolve);c.drawImage(old,...args);}c.globalAlpha=arrive*(s.revealed?dissolve:1);c.drawImage(im,...args);}}
 else scene.drawPlayer(c,p,450,s.feet,clock);c.restore();
}
function incomingQi(scene,c,s){
 const sec=s.realSeconds,active=ease((sec-18)/2)*(1-ease((sec-27.3)/.6)),clock=s.motion?sec:0,n=scene.budget?.level==='light'?12:24;
 for(let i=0;i<n;i++){const u=(clock*.24+i/n)%1,a=i*2.399,start={x:450+Math.cos(a)*330,y:s.feet-180+Math.sin(a)*240},end={x:450,y:s.feet-150},points=[];
  for(let j=0;j<=6;j++){const v=Math.max(0,u-j*.018),r=1-v,x=end.x+(start.x-end.x)*r,y=end.y+(start.y-end.y)*r-Math.sin(v*Math.PI)*80;points.push({x,y});}
  filament(c,points,i%4?'#c3ded5':'#e8d8ad',active*Math.sin(u*Math.PI)*.5,.8);
 }
}
function pearl(c,s){const visible=ease((s.realSeconds-22.2)/1.5)*(1-ease((s.realSeconds-27.3)/.35));if(!visible)return;
 const r=18*(1-s.entry*.55),x=450,y=s.pearlY;glow(c,x,y,80,'#e2e6c5',visible*.45);glow(c,x-2,y-2,r,'#fff4de',visible*.9);
 if(s.entry>0){const points=[];for(let i=0;i<12;i++){const u=clamp(s.entry-i*.012);points.push({x:450+Math.sin(u*Math.PI)*12,y:(s.gateY+20)*(1-u)+(s.feet-145)*u});}filament(c,points,'#f3e8c9',visible*.5,1.2);}
}
export function drawChanTienAwakening(scene,c,e,t,H){
 loadSpiritBeasts(scene);prepareImmortalWorld(scene);const s=chanTienState((t-e.start)/e.duration,H,scene.motion!==false),clock=s.motion?s.realSeconds:0,light=scene.budget?.level==='light';
 c.save();
 if(s.realSeconds<10.1){drawChanTienPrelude(scene,c,e,s.realSeconds,H);c.restore();return ritualHUD(scene,c,e,{...s,phase:s.realSeconds<3.2?'sky-split':s.realSeconds<8?'five-roots':'immortal-form'},H,8,'Chân Tiên','#e4d5ad',0);}
 if(s.realSeconds<17){
  drawChanTienPrelude(scene,c,e,s.realSeconds,H);
  const open=ease((s.realSeconds-10.1)/1.8),rx=(130+s.camera.enter*740)*open,ry=(260+s.camera.enter*1100)*open;
  // Feather the aperture on a reusable reduced-resolution surface. The world
  // stays opaque inside; only the boundary blends with the departing sky.
  const ratio=.6,w=540,h=Math.round(H*ratio);
  if(!scene.chanTienPortal||scene.chanTienPortal.height!==h)scene.chanTienPortal=makeSurface(w,h);
  if(!scene.chanTienPortalMask||scene.chanTienPortalMask.height!==h)scene.chanTienPortalMask=makeSurface(w,h);
  const portal=scene.chanTienPortal,mask=scene.chanTienPortalMask;
  if(portal&&mask){
   const q=portal.getContext('2d'),m=mask.getContext('2d');
   q.setTransform(ratio,0,0,ratio,0,0);q.clearRect(0,0,900,H);drawImmortalWorld(scene,q,H,s.camera,{clock:s.realSeconds,light});
   m.setTransform(ratio,0,0,ratio,0,0);m.clearRect(0,0,900,H);m.fillStyle='#fff';m.globalAlpha=.3;
   for(let i=0;i<18;i++){const inset=i*2.4;organicPortalPath(m,450,H*.43,Math.max(.1,rx-inset),Math.max(.1,ry-inset),clock);m.fill();}
   m.globalAlpha=1;q.globalCompositeOperation='destination-in';q.drawImage(mask,0,0,900,H);q.globalCompositeOperation='source-over';
   c.drawImage(portal,0,0,900,H);
  }
  portalRim(scene,c,H,s.camera,s.realSeconds);filmFinish(c,H,.8);scene.targets=[];c.restore();return ritualHUD(scene,c,e,{...s,phase:'crossing'},H,8,'Chân Tiên','#e4d5ad',0);
 }
 drawImmortalWorld(scene,c,H,{...s.camera,speed:0},{clock:s.realSeconds,light});
 // Dragon stays behind and above the player's face; the spirit is revealed through cloud, not a clipped front half.
 const long=ease((s.realSeconds-18.4)/1)*(1-ease((s.realSeconds-22.8)/1));
 if(long>0){c.save();c.globalAlpha=long*.65;drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x:535,y:H*.31,radius:145*(1-s.entry*.5),phase:s.motion?(s.realSeconds-18.4)/10:.4,time:clock*1000,color:2,side:1,scale:.8,light,alpha:1});c.restore();}
 const shake=s.motion&&scene.cameraEnabled!==false?s.burst*8:0;c.translate(Math.sin(clock*83)*shake,Math.cos(clock*71)*shake*.45);
 if(s.realSeconds<25.7)pearl(c,s);floatingBody(scene,c,e,s);if(s.realSeconds>=25.7)pearl(c,s);incomingQi(scene,c,s);
 if(s.realSeconds>=27.3)softRelease(scene,c,H,s.realSeconds-27.3,s.feet,s.motion);
 driftingMists(scene,c,H,clock,.19);filmFinish(c,H,.7);
 c.restore();return ritualHUD(scene,c,e,s,H,8,'Chân Tiên','#ead9ae',shake);
}
