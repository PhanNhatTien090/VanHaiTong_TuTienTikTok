import {BLACK_GOLD_VISITOR,KARMA_VISITOR,COURT_VISITORS,SIGNATURE_VISITORS,courtRelic} from './court-rewards.js';
import {drawCourtAuraLayer} from './court-skin-fx.js';
import {drawBlackGoldAura,drawBlackGoldGear,drawBlackGoldReveal} from './black-gold-fx.js';
import {drawKarmaAura,drawKarmaGear,drawKarmaReveal} from './karma-fx.js?v=karma-idle-v4';
import {feedbackBudget} from './cinematic-feedback.js';
import {ownsGear} from './skin-gear.js';
const skinOf=p=>COURT_VISITORS.find(v=>v.skin===p?.skinChoice&&p.rewardSkins?.includes(v.skin));
export const courtWorn=p=>!!skinOf(p);
const images=new Map(), pending=new Map();
function load(file,onReady){
 if(typeof Image==='undefined')return null;
 if(!images.has(file)){const image=new Image();image.decoding='async';image.addEventListener('load',()=>{for(const notify of pending.get(file)||[])notify();pending.delete(file);},{once:true});image.src=file;images.set(file,image);}
 const image=images.get(file);if(image.complete&&image.naturalWidth)return image;
 if(onReady){if(!pending.has(file))pending.set(file,new Set());pending.get(file).add(onReady);}return null;
}
const figure=(spec,pose,onReady)=>load(spec.artwork?.[pose]||'/assets/thien-khuyet/'+spec.kind+'-'+pose+'.webp',onReady);
// Skin có bộ hiệu ứng riêng: Hắc Kim (lửa vàng) và Nhân Quả (trắng đen).
const FX={
 [BLACK_GOLD_VISITOR.kind]:{aura:drawBlackGoldAura,gear:drawBlackGoldGear,reveal:drawBlackGoldReveal},
 [KARMA_VISITOR.kind]:{aura:drawKarmaAura,gear:drawKarmaGear,reveal:drawKarmaReveal}
};
const gearArt=new Map();
function signatureArt(spec){
 const art=gearArt.get(spec.kind)||{blade:null,halo:null};gearArt.set(spec.kind,art);
 art.blade??=load(spec.artwork.blade);art.halo??=load(spec.artwork.halo);return art;
}
// Pháp bảo skin đặc biệt người này sở hữu (ưu tiên cái đang trang bị).
export const signatureGearOf=p=>SIGNATURE_VISITORS.find(v=>v.skin===p?.skinChoice&&ownsGear(p,v.artifact))
 ||SIGNATURE_VISITORS.find(v=>p?.equipped===v.artifact&&ownsGear(p,v.artifact))
 ||SIGNATURE_VISITORS.find(v=>ownsGear(p,v.artifact))||null;
export const showsBlackGoldGear=p=>!!signatureGearOf(p);
export function warmCourtSkin(scene,p){
 const spec=COURT_VISITORS.find(x=>x.skin===p.skinChoice);
 if(spec){const refresh=scene.refreshCourtSkins??=()=>scene.characterFrames?.clear();figure(spec,'seated',refresh);figure(spec,'standing',refresh);}
 const gear=signatureGearOf(p);if(gear)signatureArt(gear);
}
// 14/11: Tiêu Viêm (Hắc Kim) trông nhỏ hơn skin khác → phóng to, giữ chân cố định (y=25).
// Đứng tối đa ×1.12 vì khung cache nhân vật chỉ cao tới y=-115 (performance.js CharacterFrames).
const HAC_KIM_SEATED=1.2,HAC_KIM_STANDING=1.12;
const hacKimSize=stand=>HAC_KIM_SEATED+(HAC_KIM_STANDING-HAC_KIM_SEATED)*Math.max(0,Math.min(1,stand||0));
export function drawCourtSkin(c,p,pose,t){
 const spec=skinOf(p);
 if(!spec)return false;
 const stand=Math.max(0,Math.min(1,pose.stand||0)), seated=figure(spec,'seated'),standing=figure(spec,'standing');
 if((stand<.999&&!seated)||(stand>.001&&!standing))return false;
 const big=spec===BLACK_GOLD_VISITOR;
 c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);
 for(const [img,a,h] of [[seated,1-stand,big?91*HAC_KIM_SEATED:91],[standing,stand,big?125*HAC_KIM_STANDING:125]]){
  if(!img||a<=.001)continue;
  // The seated exports include the bottom edge of the standing cell above them.
  const trimTop=img===seated&&!spec.artwork?Math.round(img.naturalHeight*54/618):0;
  const sourceHeight=img.naturalHeight-trimTop,w=h*img.naturalWidth/sourceHeight;
  c.save();c.globalAlpha*=a;c.drawImage(img,0,trimTop,img.naturalWidth,sourceHeight,-w/2,25-h,w,h);c.restore();
 }
 c.restore();return true;
}
export function drawCourtAdornment(scene,c,target,t,layer){
 const p=target.player,spec=skinOf(p),gear=signatureGearOf(p);
 if(FX[spec?.kind]||gear){
  const motion=scene.motion!==false,light=feedbackBudget(scene);
  const pose=scene.cinematicPose||scene.animator?.pose(p,t,motion&&!scene.compact)||{};
  const scale=target.scale||1.4;
  c.save();c.translate(target.x,target.y+(pose.lift||0));c.scale(scale,scale);
  if(spec===BLACK_GOLD_VISITOR){const k=hacKimSize(pose.stand);c.translate(0,25);c.scale(k,k);c.translate(0,-25);}
  const revealing=scene.transforming?.id===p.id&&t<scene.transforming.revealAt;
  // Màn biến hình Nhân Quả tự vẽ hào quang + thương suốt màn → tránh vẽ chồng.
  const karmaShow=scene.effects?.some(e=>e.user===p.id&&e.transform===KARMA_VISITOR.kind&&t<e.start+e.duration);
  let seed=0;for(const ch of String(p.id))seed=(seed*31+ch.codePointAt(0))%997;
  if(FX[spec?.kind]&&!revealing&&!karmaShow)FX[spec.kind].aura(c,t,pose.stand||0,layer,{motion,light,seed});
  const unlocking=scene.effects?.some(e=>e.user===p.id&&e.hacKimArtifact&&t<e.start+e.duration);
  if(gear&&!unlocking&&!revealing&&!karmaShow)FX[gear.kind].gear(c,signatureArt(gear),t,pose,layer,{motion,light});
  c.restore();return;
 }
 if(!spec)return;
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
export const courtShowsSignature=(scene,p)=>!!signatureGearOf(p)&&p.equipped===signatureGearOf(p).artifact&&!scene.raceStatus?.active&&!scene.ritualDrawing
 ||!scene.crowded&&scene.budget?.level!=='light'&&!scene.minimalCrowd&&!scene.ritualDrawing&&!scene.raceStatus?.active&&skinOf(p)?.artifact===p.equipped&&p.signatureArtifactOwned!==false&&!!p.equipped;
export function drawCourtVisitor(c,event,H,t,now=Date.now()){
 const spec=COURT_VISITORS.find(x=>x.kind===event?.kind);
 if(!spec||event.closedAt||now>=event.endsAt)return false;
 const image=figure(spec,'standing');
 if(!image)return true;
 const h=315,w=h*image.naturalWidth/image.naturalHeight,y=H*.38+Math.sin(t*.0015)*5;
 c.save();c.globalAlpha=Math.min(1,(now-event.startedAt)/850,(event.endsAt-now)/650);
 if(FX[spec.kind]){
  const scale=h/125,fx=FX[spec.kind];
  c.save();c.translate(450,y-25*scale);c.scale(scale,scale);
  fx.aura(c,t,1,'back',{motion:t!==0});
  const art=signatureArt(spec);
  fx.gear(c,art,t,{stand:1},'back',{motion:t!==0});
  c.drawImage(image,-w/(2*scale),-100,w/scale,125);
  fx.gear(c,art,t,{stand:1},'front',{motion:t!==0});
  fx.aura(c,t,1,'front',{motion:t!==0});
  c.restore();c.restore();return true;
 }
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
 const image=load(spec.art||spec.artwork?.blade||'/assets/thien-khuyet/relic-'+id+'.webp');
 if(!image)return false;
 const a=motion?t*.001:0,k=38/Math.max(image.naturalWidth,image.naturalHeight);
 const w=image.naturalWidth*k,h=image.naturalHeight*k,x=Math.cos(a)*32,y=-25+Math.sin(a)*9;
 c.save();c.translate(x,y);c.rotate(-.35+Math.sin(a)*.1);c.drawImage(image,-w/2,-h/2,w,h);c.restore();return true;
}

export function drawBlackGoldAward(scene,c,e,t,k,target,layer,reveal){
 const motion=scene.motion!==false,spec=COURT_VISITORS.find(v=>v.kind===e.transform),fx=FX[spec?.kind];
 if(!fx)return;
 const pose=scene.animator?.pose(target.player||{},t,motion&&!scene.compact)||{};
 // Nhân Quả: một mốc 500 coin nhận cả skin + thương → màn biến hình luôn có thương.
 const art=e.hacKimArtifact||spec===KARMA_VISITOR?signatureArt(spec):null;
 fx.reveal(c,t,k,{...target,y:target.y+(pose.lift||0)},layer,reveal,art,{
  motion,light:feedbackBudget(scene),pose,seed:e.id
 });
}
