// Luyện Hư v2 — Hư Không Khai Giới · Vạn Kính Quy Nhất (07/11/2026). Bản cũ "Bát Ấn Khai Hư" sao lưu ở data/backups.
import {cameraImpulse} from './cinematic-feedback.js';
import {cinematicQuality,drawAura,drawDissolve,drawEnergyOrb,drawSeal,drawShockwave,drawVoidGate} from './cinematic-vfx.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {LH_TIMING as T,LH_RIFTS,prepareLuyenHuArt,luyenHuFormationState,drawLhWorld,drawLhMirrors,drawLhClones,drawLhRifts,drawLhEye,drawLhBody,drawLhBreak,drawLhAfter,drawLhEdges} from './luyen-hu-formation.js';
export {prepareLuyenHuArt};
export const LUYEN_HU_DURATION=20800,LUYEN_HU_REVEAL=T.reveal;
const LH_PALETTE={main:'#b8a6ff',main2:'#9ff3ea',soft:'#f1ecff',gold:'#ffe3a8'};
const clamp=x=>Math.max(0,Math.min(1,x));
export function luyenHuState(k,H=1600,motion=true){
 const seconds=clamp(k)*T.duration;
 return {k:clamp(k),seconds,feet:H*.67,motion,revealed:seconds>=T.reveal,burst:seconds<T.impact?0:Math.exp(-(seconds-T.impact)*2.2),fade:1-clamp((seconds-T.fade)/1.2)};
}
// Ảnh nhân vật LIVE gốc (đứng) cache riêng cho realm 6; không đụng helper của realm 5/8.
export function luyenHuActorImage(scene,p,e){
 if(scene.luyenHuActor?.event!==e)scene.luyenHuActor={event:e,frames:new Map()};
 const cache=scene.luyenHuActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'luyen-hu-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}
 cache.set(p,im);return im;
}
// Bóng hư ảnh: lọc alpha³ (tránh khối chữ nhật), phủ tím, mờ dần ở đáy.
const ghosts=new WeakMap();
function ghost(im){
 if(!im)return null;if(ghosts.has(im))return ghosts.get(im);const g=makeSurface(640,760);if(!g)return im;const c=g.getContext('2d');
 c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(im,0,0);c.drawImage(im,0,0);
 c.globalCompositeOperation='source-atop';c.fillStyle='#b8a6ff';c.globalAlpha=.55;c.fillRect(0,0,640,760);c.globalAlpha=1;
 c.globalCompositeOperation='destination-in';const mask=c.createLinearGradient(0,0,0,760);mask.addColorStop(0,'#fff');mask.addColorStop(.72,'#fff');mask.addColorStop(1,'#fff0');c.fillStyle=mask;c.fillRect(0,0,640,760);
 ghosts.set(im,g);return g;
}
// Giữ ngoại hình đầu/cuối theo chính sự kiện, không đọc skin mới giữa chừng.
const snapshots=new WeakMap();
export function luyenHuPlayers(scene,e){
 if(snapshots.has(e))return snapshots.get(e);
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};
 const pair={from:structuredClone(e.visualFrom||{...live,realm:5}),to:structuredClone(e.visualTo||{...live,realm:6})};snapshots.set(e,pair);return pair;
}
function legacyShake(sec,burst){
 const hit=sec>=T.crack?Math.exp(-(sec-T.crack)*9)*4:0;
 let rift=0;
 for(const at of LH_RIFTS)if(sec>=at+.18)rift=Math.max(rift,Math.exp(-(sec-at-.18)*10)*3);
 return hit+rift+burst*8;
}
export function drawLuyenHuAwakening(scene,c,e,t,H){
 prepareLuyenHuArt(scene);const s=luyenHuState((t-e.start)/e.duration,H,scene.motion!==false),sec=s.seconds,st=luyenHuFormationState(sec,H,s.motion);
 const legacy=scene.cinematicV2===false;
 const {from,to}=luyenHuPlayers(scene,e),p=s.revealed?to:from,v=qiVariant(e),kq=qiRemap(s.k,T.impact/T.duration),origin={x:450,y:st.belly};
 const image=luyenHuActorImage(scene,p,e),g=ghost(luyenHuActorImage(scene,from,e));
 if(!legacy&&sec<T.enter)luyenHuActorImage(scene,to,e);
 c.save();setFxPalette(LH_PALETTE);
 // Nền thế giới (ngoài camera): nứt → vỡ → hư không → tua ngược → nổ lộ thế giới mới.
 drawLhWorld(scene,c,st,v);
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=legacy&&s.motion&&scene.cameraEnabled!==false?legacyShake(sec,s.burst):0;
 const age=(sec-T.impact)*1000,quality=e.cinematicQuality??cinematicQuality(scene,{focused:true});
 const jolt=cameraImpulse(scene,'legendary',age,v.phase,quality==='light');
 const gather=clamp((sec-T.rewind)/(T.impact-T.rewind));
 c.translate(legacy?Math.sin(sec*83)*shake:jolt.x,legacy?Math.cos(sec*71)*shake*.55:jolt.y);
 drawLhMirrors(scene,c,st,v,g);drawLhEye(scene,c,st,v);drawLhClones(scene,c,st,v,g,'back');
 if(legacy){
  drawQiAura(scene,c,kq,origin,s.feet);drawLhAfter(scene,c,st,v);
  drawQiImpact(scene,c,kq,H,origin,s.feet);drawLhBreak(scene,c,st,v);
 }else{
  const settled=clamp(age/330)*s.fade;
  const spin=s.motion?sec*.68:0;
  if(scene.cinematicLayers?.energy!==false){
   drawSeal(c,'void',450,s.feet+20,235,spin,(age<0?gather:settled)*.86);
   if(age<0)drawSeal(c,'void',450,st.belly-125,155,-spin*.55,gather*.44);
  }
  // Keep the void gate behind the actor, timed to existing rewind/impact.
  // It uses one cached 384px original texture and two drawImage calls per frame.
  if(scene.cinematicLayers?.energy!==false&&gather>0)drawVoidGate(c,450,st.belly-55,gather,age,{motion:s.motion,quality});
  if(scene.cinematicLayers?.tail!==false)drawAura(c,'void',450,s.feet-265,180,(age<0?gather*.16:settled*.55));

  if(scene.cinematicLayers?.impact!==false)drawShockwave(c,'void',450,st.belly,age,{quality,radius:385,seed:v.phase,motion:s.motion,flash:!scene.reduceFlash});
  if(s.motion&&scene.cinematicLayers?.tail!==false)drawDissolve(c,'void',450,s.feet-210,age-340,v.phase,quality);
 }
 // Sóng ở sau nhân vật. Lõi tụ ở trước thân, tại đan điền.
 if(image){c.save();c.globalAlpha=clamp(sec/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 if(!legacy&&age<0&&scene.cinematicLayers?.energy!==false){
  drawEnergyOrb(c,'void',450,s.feet-84,gather,age,v.phase,quality,s.motion);
 }
 drawLhClones(scene,c,st,v,g,'front');drawLhRifts(scene,c,st,v);if(legacy){drawLhBody(scene,c,st);drawQiCompression(c,kq,origin);}
 c.restore();drawQiMotes(scene,c,kq,H);drawLhEdges(scene,c,st);c.restore();
 const phase=s.revealed?'reveal':sec<T.shatter?'fracture':sec<T.mirrors?'shatter':sec<T.clones?'mirrors':sec<T.rifts?'clones':sec<T.eye?'rifts':sec<T.rewind?'void-eye':sec<T.enter?'rewind':'compression';
 const ui={k:s.k,realm:6,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#d9ccff',title:'Luyện Hư',subtitle:'Hư Không Khai Giới',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake:legacy?shake:Math.hypot(jolt.x,jolt.y)};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#ece6ff';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('LUYỆN HƯ',450,H*.145);}}
 return ui;
}
