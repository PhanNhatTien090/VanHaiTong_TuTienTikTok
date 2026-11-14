import {COURT_VISITORS,courtRelic} from './court-rewards.js';
import {drawCourtAuraLayer} from './court-skin-fx.js';
const skinOf=p=>COURT_VISITORS.find(v=>v.skin===p?.skinChoice&&p.rewardSkins?.includes(v.skin));
export const courtWorn=p=>!!skinOf(p);
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
 const spec=skinOf(p);
 if(!spec)return false;
 const stand=Math.max(0,Math.min(1,pose.stand||0)), seated=figure(spec,'seated'),standing=figure(spec,'standing');
 if((stand<.999&&!seated)||(stand>.001&&!standing))return false;
 c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);
 for(const [img,a,h] of [[seated,1-stand,91],[standing,stand,125]]){
  if(!img||a<=.001)continue;
  // The seated exports include the bottom edge of the standing cell above them.
  const trimTop=img===seated?Math.round(img.naturalHeight*54/618):0;
  const sourceHeight=img.naturalHeight-trimTop,w=h*img.naturalWidth/sourceHeight;
  c.save();c.globalAlpha*=a;c.drawImage(img,0,trimTop,img.naturalWidth,sourceHeight,-w/2,25-h,w,h);c.restore();
 }
 c.restore();return true;
}
export function drawCourtAdornment(scene,c,target,t,layer){
 const p=target.player,spec=skinOf(p);if(!spec)return;
 if(scene.transforming?.id===p.id&&t<scene.transforming.revealAt)return;
 if(scene.effects?.some(e=>e.user===p.id&&e.transform&&t<e.start+e.duration))return;
 const motion=scene.motion!==false,light=scene.crowded||scene.budget?.level==='light';
 const pose=scene.cinematicPose||scene.animator?.pose(p,t,motion&&!scene.compact)||{};
 let seed=0;for(const ch of String(p.id))seed=(seed*31+ch.codePointAt(0))%997;
 c.save();c.translate(target.x,target.y+(pose.lift||0));c.scale(target.scale||1.4,target.scale||1.4);
 drawCourtAuraLayer(c,spec.kind,t,pose.stand||0,layer,{motion,light,seed:seed*37});
 if(layer==='front'&&p.equipped===spec.artifact&&p.signatureArtifactOwned!==false&&!light){
  const image=load('/assets/thien-khuyet/relic-'+spec.artifact+'.webp');
  if(image){
   const x=spec.kind==='nguyet-lien'?-51:51,y=-34-(pose.stand||0)*15+(motion?Math.sin(t*.002)*6:0);
   const h=image.naturalHeight>image.naturalWidth?64:33,w=h*image.naturalWidth/image.naturalHeight;
   c.translate(x,y);c.rotate(spec.kind==='nguyet-lien'?-.12:-.42);c.drawImage(image,-w/2,-h/2,w,h);
  }
 }
 c.restore();
}
export const courtShowsSignature=(scene,p)=>!scene.crowded&&scene.budget?.level!=='light'&&!scene.minimalCrowd&&!scene.ritualDrawing&&!scene.raceStatus?.active&&skinOf(p)?.artifact===p.equipped&&p.signatureArtifactOwned!==false&&!!p.equipped;
export function drawCourtVisitor(c,event,H,t,now=Date.now()){
 const spec=COURT_VISITORS.find(x=>x.kind===event?.kind);
 if(!spec||event.closedAt||now>=event.endsAt)return false;
 const image=figure(spec,'standing');
 if(!image)return true;
 const h=315,w=h*image.naturalWidth/image.naturalHeight,y=H*.38+Math.sin(t*.0015)*5;
 c.save();c.globalAlpha=Math.min(1,(now-event.startedAt)/850,(event.endsAt-now)/650);
 const scale=2.52;
 c.save();c.translate(450,y-52);c.scale(scale,scale);
 drawCourtAuraLayer(c,spec.kind,t,1,'back',{motion:t!==0});c.restore();
 c.drawImage(image,450-w/2,y-h,w,h);
 c.save();c.translate(450,y-52);c.scale(scale,scale);
 drawCourtAuraLayer(c,spec.kind,t,1,'front',{motion:t!==0});c.restore();
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
