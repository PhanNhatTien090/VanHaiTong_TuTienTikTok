import {COURT_VISITORS,courtRelic} from './court-rewards.js';
const images=new Map(), pending=new Map();
function load(file,onReady){
 if(typeof Image==='undefined')return null;
 if(!images.has(file)){const image=new Image();image.decoding='async';image.addEventListener('load',()=>{for(const notify of pending.get(file)||[])notify();pending.delete(file);},{once:true});image.src=file;images.set(file,image);}
 const image=images.get(file);if(image.complete&&image.naturalWidth)return image;
 if(onReady){if(!pending.has(file))pending.set(file,new Set());pending.get(file).add(onReady);}return null;
}
const figure=(spec,pose,onReady)=>load('/assets/thien-khuyet/'+spec.kind+'-'+pose+'.webp',onReady);
export function warmCourtSkin(scene,p){
 const spec=COURT_VISITORS.find(x=>x.skin===p.skinChoice);
 if(spec){const refresh=scene.refreshCourtSkins??=()=>scene.characterFrames?.clear();figure(spec,'seated',refresh);figure(spec,'standing',refresh);}
}
export function drawCourtSkin(c,p,pose,t){
 const spec=COURT_VISITORS.find(x=>x.skin===p.skinChoice&&p.rewardSkins?.includes(x.skin));
 if(!spec)return false;
 const stand=Math.max(0,Math.min(1,pose.stand||0)), seated=figure(spec,'seated'),standing=figure(spec,'standing');
 if((stand<.999&&!seated)||(stand>.001&&!standing))return false;
 c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);
 for(const [img,a,h] of [[seated,1-stand,91],[standing,stand,125]]){
  if(!img||a<=.001)continue;
  const w=h*img.naturalWidth/img.naturalHeight;
  c.save();c.globalAlpha*=a;c.drawImage(img,-w/2,25-h,w,h);c.restore();
 }
 c.restore();return true;
}
export function drawCourtAura(c,skin,t,motion){
 const spec=COURT_VISITORS.find(x=>x.skin===skin.id);if(!spec)return;
 const angle=motion?t*.0015:0, moon=spec.kind==='nguyet-lien';
 c.save();c.globalCompositeOperation='screen';c.strokeStyle=spec.color;c.fillStyle=spec.trim;
 for(let i=0;i<6;i++){
  const a=angle+i*Math.PI/3,x=Math.cos(a)*39,y=-34+Math.sin(a*2)*18;
  c.globalAlpha=.23+.4*(.5+.5*Math.sin(a));
  c.beginPath();c.moveTo(x-2,y);c.quadraticCurveTo(x-4,y-4,x+1,y-8);
  c.quadraticCurveTo(x+4,y-4,x-2,y);if(moon)c.stroke();else c.fill();
 }
 c.restore();
}
export function drawCourtVisitor(c,event,H,t,now=Date.now()){
 const spec=COURT_VISITORS.find(x=>x.kind===event?.kind);
 if(!spec||event.closedAt||now>=event.endsAt)return false;
 const image=figure(spec,'standing');
 if(!image)return true;
 const h=315,w=h*image.naturalWidth/image.naturalHeight,y=H*.38+Math.sin(t*.0015)*5;
 c.save();c.globalAlpha=Math.min(1,(now-event.startedAt)/850,(event.endsAt-now)/650);
 c.strokeStyle=spec.color;c.lineWidth=2;
 for(let i=0;i<3;i++){c.beginPath();c.ellipse(450,y+13,67+i*33,12+i*7,0,0,Math.PI*2);c.stroke();}
 c.drawImage(image,450-w/2,y-h,w,h);
 c.restore();return true;
}
export function drawCourtRelic(c,id,t,motion=true){
 const spec=courtRelic(id);
 if(!spec)return false;
 const image=load(spec.art||'/assets/thien-khuyet/relic-'+id+'.webp');
 if(!image)return false;
 const a=motion?t*.001:0,k=38/Math.max(image.naturalWidth,image.naturalHeight);
 const w=image.naturalWidth*k,h=image.naturalHeight*k,x=Math.cos(a)*32,y=-25+Math.sin(a)*9;
 c.save();c.translate(x,y);c.rotate(-.35+Math.sin(a)*.1);c.drawImage(image,-w/2,-h/2,w,h);c.restore();return true;
}
