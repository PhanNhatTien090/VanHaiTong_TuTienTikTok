import {makeSurface} from './performance.js';
import {actorImage} from './hoa-than-awakening.js';
import {TAU,clamp,ease,glow,ring,backdrop} from './ascension-primitives.js';
import {smokeTexture,smoke,stormClouds,filament,filmFinish} from './cinema-atmosphere.js';
const COLORS=['#a3ffcf','#ffab6c','#e4c18c','#fff3bc','#8ddcff'];
export function preludeState(seconds,H=1600,motion=true){
 const split=ease((seconds-1.7)/1),transform=ease((seconds-5.8)/2.2),join=ease((seconds-8)/1.6),manifest=ease((seconds-8.5)/1.2)*(1-ease((seconds-10.1)/.9)),clock=motion?seconds:0;
 return {split,transform,join,manifest,orbs:COLORS.map((color,i)=>{const rise=ease((seconds-3.2-i*.23)/1.4),a=i*TAU/5-Math.PI/2+clock*.24,r=(220+transform*50)*(1-join);return {color,rise,x:450+Math.cos(a)*r,y:(H*.92*(1-rise)+(H*.40+Math.sin(a)*170)*rise)*(1-join)+(H*.43)*join};})};
}
function rootLight(scene,c,orb,s,clock,i){
 if(!orb.rise)return;const im=smokeTexture(scene),power=orb.rise*(1-s.join*.7),radius=20+s.transform*10;
 c.save();c.globalCompositeOperation='screen';
 for(let j=0;j<5;j++){const a=j*2.399+clock*.4+i,r=14+s.transform*28,x=orb.x+Math.cos(a)*r,y=orb.y+Math.sin(a)*r*.7;smoke(c,im,x,y,75+j*9,a+clock*.12,power*.48,.9);}
 glow(c,orb.x,orb.y,radius*2.8,orb.color,power*.45);glow(c,orb.x-3,orb.y-4,radius*.7,'#fff1dc',power*.85);
 // Only a small central core is solid; the changing silhouette is carried by vapour and filaments.
 for(let j=0;j<3;j++){const points=[];for(let q=0;q<=20;q++){const u=q/20,a=u*TAU*1.4+clock*(.65+j*.1)+j*2.1,r=radius*(.3+u)*s.transform;points.push({x:orb.x+Math.cos(a)*r,y:orb.y+Math.sin(a)*r*.75});}filament(c,points,orb.color,power*s.transform*.65,.8);}
 c.restore();
}
export function drawChanTienPrelude(scene,c,e,seconds,H){
 const s=preludeState(seconds,H,scene.motion!==false),clock=scene.motion===false?0:seconds,light=scene.budget?.level==='light',im=smokeTexture(scene);backdrop(c,H,['#020812','#111c2d','#122333']);
 stormClouds(scene,c,H,clock,ease(seconds/1.8)*(1-s.join*.7));
 const slashFade=ease((seconds-1.7)/.18)*(1-ease((seconds-5.5)/2));
 if(s.split>0){const points=[];for(let i=0;i<=45;i++){const u=i/45,x=80+740*s.split*u,y=H*.36-90*u+Math.sin(u*6+clock*.3)*8;points.push({x,y});}
  filament(c,points,'#d1e6e0',slashFade,2.2);for(let i=0;i<(light?10:20);i++){const u=i/20,x=80+740*u,y=H*.36-90*u;smoke(c,im,x,y,130,clock*.08+i,slashFade*.36,.65);}
 }
 s.orbs.forEach((orb,i)=>{
  const points=[];for(let j=8;j>=0;j--){const prev=preludeState(Math.max(0,seconds-j*.06),H,scene.motion!==false).orbs[i];points.push({x:prev.x,y:prev.y});}
  filament(c,points,orb.color,orb.rise*(1-s.join)*.45,1.3);rootLight(scene,c,orb,s,clock,i);
 });
 if(s.transform>0&&!s.join){for(let i=0;i<5;i++){const a=s.orbs[i],points=[];for(let j=0;j<=24;j++){const u=j/24;points.push({x:a.x*(1-u)+450*u+Math.sin(u*Math.PI)*Math.sin(i*2.4+clock*.3)*30,y:a.y*(1-u)+H*.43*u-Math.sin(u*Math.PI)*80});}filament(c,points,a.color,s.transform*.25,1);}}
 if(s.manifest>0){const p=e.visualFrom||scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user);if(p){const image=actorImage(scene,p,e);if(image){
   const scale=1.43+s.manifest*.12,x=450-320*scale,y=H*.43-340*scale,bands=light?10:18;c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.manifest*.52;
   for(let i=0;i<bands;i++){const sy=i*720/bands,shift=scene.motion===false?0:Math.sin(clock*1.1-i*.32)*3.5*(i/bands);c.drawImage(image,0,sy,640,720/bands,x+shift,y+sy*scale,640*scale,(720/bands+.5)*scale);}c.restore();
   glow(c,450,H*.43,300,'#b6e6d2',s.manifest*.18);
  }}
  for(let i=0;i<(light?10:18);i++){const a=i*2.399,r=130+i%4*50;smoke(c,im,450+Math.cos(a)*r,H*.43+Math.sin(a)*r*.7,180+i%3*50,a+clock*.1,s.manifest*.55,.8);}
 }
 filmFinish(c,H,.8);scene.targets=[];return s;
}
