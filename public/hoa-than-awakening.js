import {makeSurface} from './performance.js';
import {drawRitualTint} from './ritual-appearance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {prepareHoaThanArt,hoaThanFormationState,drawHtSky,drawHtSea,drawHtSeals,drawHtAuthority,drawHtBodyQi,drawHtBreak,drawHtEdges} from './hoa-than-formation.js';
const HT_PALETTE={main:'#8bdcff',main2:'#bfe8ff',soft:'#eefaff',gold:'#f5d693'};
export const HOA_THAN_DURATION=17600,HOA_THAN_REVEAL=14.65;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export function hoaThanState(k,H=1600,motion=true){
 const seconds=clamp(k)*17.6,up=ease((seconds-2)/2.4),merge=ease((seconds-12.8)/1.6),burst=ease((seconds-14.4)/.20)*(1-ease((seconds-14.8)/1.5));
 return {k:clamp(k),seconds,feet:H*.67,up,merge,spiritY:H*.67-180-up*280*(1-merge),gates:Array.from({length:6},(_,i)=>ease((seconds-4.4-i*.42)/.65)),avatar:ease((seconds-10.5)/1.8)*(1-ease((seconds-15.5)/2.1)),burst,revealed:seconds>=HOA_THAN_REVEAL,fade:1-ease((seconds-16.5)/1.1),motion};
}
export function actorImage(scene,p,e){
 const key=p.realm;
 if(scene.hoaThanActor?.event!==e.id)scene.hoaThanActor={event:e.id,frames:new Map()};
 const cache=scene.hoaThanActor.frames;
 if(cache.has(key))return cache.get(key);
 const im=makeSurface(640,720);if(!im)return null;const c=im.getContext('2d'),targets=scene.targets,compact=scene.compact,ritual=scene.ritualDrawing;
 scene.targets=[{id:p.id,player:p,x:320,y:590,scale:4.2}];scene.compact=true;scene.ritualDrawing=true;
 try{scene.drawPlayer(c,p,320,590,0);}finally{scene.targets=targets;scene.compact=compact;scene.ritualDrawing=ritual;}
 cache.set(key,im);while(cache.size>2)cache.delete(cache.keys().next().value);return im;
}

// Isolated standing actor cache: do not change the shared helper consumed by realms 6 and 8.
export function hoaThanActorImage(scene,p,e){
 if(scene.hoaThanV2Actor?.event!==e)scene.hoaThanV2Actor={event:e,frames:new Map()};
 const cache=scene.hoaThanV2Actor.frames;if(cache.has(p))return cache.get(p);
 const im=makeSurface(640,760);if(!im)return null;const c=im.getContext('2d'),saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames};
 Object.assign(scene,{targets:[{id:p.id,player:p,x:320,y:590,scale:4.2}],compact:true,ritualDrawing:true,characterFrames:null,cinematicPose:{stand:1,mode:'hoa-than-ritual',energy:0,left:0,right:0,lift:0,cloth:0,lean:0,head:0}});
 try{scene.drawPlayer(c,p,320,590,0);}finally{Object.assign(scene,saved);}
 cache.set(p,im);return im;
}
const ghosts=new WeakMap();
function ghost(im){
 if(ghosts.has(im))return ghosts.get(im);const g=makeSurface(640,760);if(!g)return im;const c=g.getContext('2d');c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(im,0,0);c.drawImage(im,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='#a9dcff';c.globalAlpha=.48;c.fillRect(0,0,640,760);c.globalAlpha=1;c.globalCompositeOperation='destination-in';const mask=c.createRadialGradient(320,350,60,320,350,350);mask.addColorStop(0,'#fff');mask.addColorStop(.65,'#fff');mask.addColorStop(1,'#fff0');c.fillStyle=mask;c.fillRect(0,0,640,760);ghosts.set(im,g);return g;
}
const snapshots=new WeakMap();
export function hoaThanPlayers(scene,e){
 if(snapshots.has(e))return snapshots.get(e);
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};
 const pair={from:structuredClone(e.visualFrom||{...live,realm:4}),to:structuredClone(e.visualTo||{...live,realm:5})};snapshots.set(e,pair);return pair;
}
export function drawHoaThanAwakening(scene,c,e,t,H){
 prepareHoaThanArt(scene);const s=hoaThanState((t-e.start)/e.duration,H,scene.motion!==false),st=hoaThanFormationState(s.seconds,H,s.motion),sec=s.seconds;
 const {from,to}=hoaThanPlayers(scene,e),p=s.revealed?to:from,v=qiVariant(e),kq=qiRemap(s.k,14.4/17.6),origin={x:450,y:st.belly};
 const im=hoaThanActorImage(scene,from,e),image=hoaThanActorImage(scene,p,e);
 c.save();setFxPalette(HT_PALETTE);drawHtSky(scene,c,st,v);drawRitualTint(scene,c,H);pushFxCamera(scene,c,kq,v,s.feet);
 const opener=sec>=.16?Math.exp(-(sec-.16)*8)*3:0,shake=s.motion&&scene.cameraEnabled!==false?opener+s.burst*7:0;c.translate(Math.sin(sec*81)*shake,Math.cos(sec*67)*shake*.5);
 drawHtSea(scene,c,st);drawHtSeals(scene,c,st,v);drawHtAuthority(scene,c,st,im,ghost);
 // One projected soul gains authority over the storm; it is not a second permanent character.
 if(im&&st.soul>0){const size=(.42+.16*s.up+st.effigy*1.28)*(1-st.recall*.72),g=ghost(im);c.save();c.globalCompositeOperation='screen';c.globalAlpha=st.soul*.78;c.drawImage(g,st.soulX-320*size,st.soulY-(420+st.effigy*80)*size,640*size,760*size);c.restore();}
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);drawHtBreak(scene,c,st,v);
 if(image){c.save();c.globalAlpha=ease(sec/.12);c.drawImage(image,130,s.feet-590);c.restore();}
 drawHtBodyQi(scene,c,st);drawQiCompression(c,kq,origin);
 c.restore();drawQiMotes(scene,c,kq,H);drawHtEdges(scene,c,st);c.restore();
 const phase=s.revealed?'reveal':sec<2?'sky-break':sec<4.4?'spirit':sec<7.6?'seals':sec<10.5?'thunder':sec<12.8?'authority':sec<14.25?'recall':'compression';
 const ui={k:s.k,realm:5,phase,revealed:s.revealed,color:scene.ritualAppearance?.title||'#bfe8ff',title:'Hóa Thần',subtitle:'Thần Niệm Chấn Thiên',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#e1ecff';c.fillText(ui.name,450,H*.1);if(s.revealed){c.font='700 44px Arial';c.fillText('HÓA THẦN',450,H*.145);}}
 return ui;
}
