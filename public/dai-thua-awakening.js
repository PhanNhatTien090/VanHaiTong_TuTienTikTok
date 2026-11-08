// Đại Thừa v2 — Kiếm Trủng Triều Tông · Đại Đạo Kim Kiều (07/11/2026). Bản cũ sao lưu ở data/backups.
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {DT_TIMING as T,DT_STRIKES,prepareDaiThuaWorld,daiThuaFormationState,drawDtWorld,drawDtSwords,drawDtRoad,drawDtTrial,drawDtDive,drawDtBody,drawDtBreak,drawDtSalute,drawDtEdges} from './dai-thua-formation.js';
export const DAI_THUA_DURATION=22800,DAI_THUA_REVEAL=T.reveal;
const DT_PALETTE={main:'#ffd98a',main2:'#cfe3ff',soft:'#fff6e4',gold:'#ffe7b0'};
const clamp=x=>Math.max(0,Math.min(1,x));
export function daiThuaState(k,H=1600,motion=true){const seconds=clamp(k)*T.duration;return {k:clamp(k),seconds,feet:H*.78,motion,revealed:seconds>=T.reveal,burst:seconds<T.impact?0:Math.exp(-(seconds-T.impact)*2.2),fade:1-clamp((seconds-T.fade)/1.2)};}
// Bộ kiếm prestige dùng chung với Huyền Tiên — giữ nguyên API.
export function sliceRitualSwords(im,factory=makeSurface){const w=(im.naturalWidth||im.width)/3,h=im.naturalHeight||im.height;return Array.from({length:3},(_,i)=>{const f=factory(512,1024);f?.getContext('2d').drawImage(im,i*w,0,w,h,0,0,512,1024);return f;});}
export function prepareDaiThuaArt(scene){if(scene.ritualSwords||scene.ritualSwordsLoading||scene.ritualSwordsRetry>Date.now()||typeof Image==='undefined')return;scene.ritualSwordsLoading=true;const im=new Image();im.onload=()=>{scene.ritualSwords=sliceRitualSwords(im);scene.ritualSwordsLoading=false;scene.daiThuaAssets=null;};im.onerror=()=>{scene.ritualSwordsLoading=false;scene.ritualSwordsRetry=Date.now()+15000;};im.src='/assets/events-v1/prestige-swords-v1.png';}
export function daiThuaActorImage(scene,p,e){
 if(scene.daiThuaActor?.event!==e)scene.daiThuaActor={event:e,frames:new Map()};
 const cache=scene.daiThuaActor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'dai-thua-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}
 cache.set(p,im);return im;
}
const snapshots=new WeakMap();
export function daiThuaPlayers(scene,e){
 if(snapshots.has(e))return snapshots.get(e);
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};
 const pair={from:structuredClone(e.visualFrom||{...live,realm:6}),to:structuredClone(e.visualTo||{...live,realm:7})};snapshots.set(e,pair);return pair;
}
export function drawDaiThuaAwakening(scene,c,e,t,H){
 prepareDaiThuaArt(scene);prepareDaiThuaWorld(scene);const s=daiThuaState((t-e.start)/e.duration,H,scene.motion!==false),sec=s.seconds,st=daiThuaFormationState(sec,H,s.motion);
 const {from,to}=daiThuaPlayers(scene,e),p=s.revealed?to:from,v=qiVariant(e),kq=qiRemap(s.k,T.impact/T.duration),origin={x:450,y:st.belly};
 const image=daiThuaActorImage(scene,p,e);
 c.save();setFxPalette(DT_PALETTE);drawDtWorld(scene,c,st);
 pushFxCamera(scene,c,kq,v,s.feet);
 const strike=DT_STRIKES.reduce((m,a)=>Math.max(m,sec>=a?Math.exp(-(sec-a)*10)*3.5:0),0),shake=s.motion&&scene.cameraEnabled!==false?st.quake*5+strike+s.burst*9:0;
 c.translate(Math.sin(sec*83)*shake,Math.cos(sec*71)*shake*.55);
 drawDtRoad(scene,c,st,v);drawDtSalute(scene,c,st,v);drawDtSwords(scene,c,st,v,'back');
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);drawDtBreak(scene,c,st,v);
 // Nhân vật sau lớp nổ chung để mặt không bị phủ trắng.
 if(image){c.save();c.globalAlpha=clamp(sec/.12);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawDtSwords(scene,c,st,v,'front');drawDtTrial(scene,c,st,v);drawDtDive(scene,c,st);drawDtBody(scene,c,st);drawQiCompression(c,kq,origin);
 c.restore();drawQiMotes(scene,c,kq,H);drawDtEdges(scene,c,st);c.restore();
 const phase=s.revealed?'reveal':sec<T.river?'awaken':sec<T.bow?'river':sec<T.road?'homage':sec<T.trial?'road':sec<T.tower?'trial':sec<T.contract?'tower':'compression';
 const ui={k:s.k,realm:7,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#ffe2a8',title:'Đại Thừa',subtitle:'Vạn Kiếm Triều Tông',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff1d6';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('ĐẠI THỪA',450,H*.145);}}
 return ui;
}
