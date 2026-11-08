// Chân Tiên v4 — Cửu Kiếp Phi Thăng · Tiên Môn Khai Thiên (07/11/2026). Bản cinematic v3 cũ sao lưu ở data/backups.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {CT_TIMING as T,ctBoltAt,prepareChanTienArt,chanTienFormationState,drawCtWorld,drawCtVortex,drawCtBeam,drawCtTribulation,drawCtRoots,drawCtHeaven,drawCtBody,drawCtBreak,drawCtAfter,drawCtEdges} from './chan-tien-formation.js';
export {prepareChanTienArt};
export const CHAN_TIEN_DURATION=31600,CHAN_TIEN_REVEAL=T.reveal;
const CT_PALETTE={main:'#ffe6a8',main2:'#bfe0ff',soft:'#fffbef',gold:'#ffd36b'};
const clamp=x=>Math.max(0,Math.min(1,x));
export function chanTienState(k,H=1600,motion=true){const seconds=clamp(k)*T.duration,f=chanTienFormationState(seconds,H,motion);return {k:clamp(k),seconds,feet:f.feet,motion,revealed:seconds>=T.reveal,burst:seconds<T.impact?0:Math.exp(-(seconds-T.impact)*2.2),fade:1-clamp((seconds-T.fade)/1.2)};}
export function chanTienActorImage(scene,p,e){
 if(scene.chanTienActor?.event!==e)scene.chanTienActor={event:e,frames:new Map()};
 const cache=scene.chanTienActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'chan-tien-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}
 cache.set(p,im);return im;
}
const snapshots=new WeakMap();
export function chanTienPlayers(scene,e){
 if(snapshots.has(e))return snapshots.get(e);
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};
 const pair={from:structuredClone(e.visualFrom||{...live,realm:7}),to:structuredClone(e.visualTo||{...live,realm:8})};snapshots.set(e,pair);return pair;
}
export function drawChanTienAwakening(scene,c,e,t,H){
 prepareChanTienArt(scene);const s=chanTienState((t-e.start)/e.duration,H,scene.motion!==false),sec=s.seconds,st=chanTienFormationState(sec,H,s.motion);
 const {from,to}=chanTienPlayers(scene,e),p=s.revealed?to:from,v=qiVariant(e),kq=qiRemap(s.k,T.impact/T.duration),origin={x:450,y:st.belly};
 const image=chanTienActorImage(scene,p,e);
 c.save();setFxPalette(CT_PALETTE);drawCtWorld(scene,c,st,v);drawCtVortex(scene,c,st,v);
 pushFxCamera(scene,c,kq,v,st.feet);
 const b=ctBoltAt(sec),shake=s.motion&&scene.cameraEnabled!==false?(b?b.p*(b.kind==='gold'?9:5):0)+st.climb*(1-st.heaven)*3+s.burst*9:0;
 c.translate(Math.sin(sec*83)*shake,Math.cos(sec*71)*shake*.55);
 drawCtBeam(scene,c,st);drawCtHeaven(scene,c,st,v,false);drawCtTribulation(scene,c,st,v);
 drawQiAura(scene,c,kq,origin,st.feet);drawCtAfter(scene,c,st,v);drawQiImpact(scene,c,kq,H,origin,st.feet);drawCtBreak(scene,c,st,v);
 // Nhân vật sau lớp nổ chung để mặt không bị phủ trắng.
 if(image){c.save();c.globalAlpha=clamp(sec/.12);c.drawImage(image,130,st.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,st.feet,0);
 drawCtRoots(scene,c,st,v);drawCtHeaven(scene,c,st,v,true);drawCtBody(scene,c,st);drawQiCompression(c,kq,origin);
 c.restore();drawQiMotes(scene,c,kq,H);drawCtEdges(scene,c,st);c.restore();
 const phase=s.revealed?'reveal':sec<3.6?'gather':sec<T.roots?'wave-1':sec<10.8?'roots':sec<T.charge?'wave-2':sec<T.gate?'wave-3':sec<T.ascend?'gate':sec<T.heaven?'ascend':sec<T.absorbed?'heaven':'compression';
 const ui={k:s.k,realm:8,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#ffe6a8',title:'Chân Tiên',subtitle:'Long Môn Đăng Tiên',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff6e0';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('CHÂN TIÊN',450,H*.145);}}
 return ui;
}
