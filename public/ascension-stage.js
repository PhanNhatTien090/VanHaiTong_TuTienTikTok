import {MAX_REALM} from './progression.js';
import {makeSurface} from './performance.js';
import {REALM_NAMES} from './progression.js';
import {isNPC} from './live-integrity.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
export const ASCENSION_STAGE_ART='/assets/worlds-v2/jade-palace.png';
export function isAscensionEvent(scene,e){
 const p=scene.playerIndex?.get(e?.user)||scene.players?.find(p=>p.id===e?.user);
 return !!e?.user&&e.effect==='breakthrough'&&!e.resident&&!e.simulated&&e.actorKind!=='npc'&&!String(e.user).startsWith('puppet-')&&!isNPC(p);
}
export function prepareAscensionStage(scene){
 if(scene.ascensionStageArt||typeof Image==='undefined')return;
 const im=new Image();scene.ascensionStageArt=im;im.onload=()=>{scene.ascensionStageBackground=null;};im.src=ASCENSION_STAGE_ART;
}
function cover(c,im,W,H){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,s=Math.max(W/iw,H/ih);c.drawImage(im,(W-iw*s)/2,(H-ih*s)/2,iw*s,ih*s);}
function background(scene,H){
 const W=scene.canvas?.width||900,PH=scene.canvas?.height||Math.round(H),key=W+':'+PH;
 if(scene.ascensionStageBackground?.key===key)return scene.ascensionStageBackground.surface;
 const surface=makeSurface(W,PH);if(!surface)return null;const c=surface.getContext('2d');c.scale(W/900,PH/H);
 c.fillStyle='#0d203d';c.fillRect(0,0,900,H);
 const im=scene.ascensionStageArt;if(im?.complete&&im.naturalWidth){c.save();c.globalAlpha=.76;cover(c,im,900,H);c.restore();}
 const tint=c.createLinearGradient(0,0,0,H);tint.addColorStop(0,'#1827539c');tint.addColorStop(.35,'#24497865');tint.addColorStop(.7,'#102a4ba3');tint.addColorStop(1,'#06152bea');c.fillStyle=tint;c.fillRect(0,0,900,H);
 const mist=c.createRadialGradient(450,H*.45,10,450,H*.45,520);mist.addColorStop(0,'#c3e8ff36');mist.addColorStop(1,'#c3e8ff00');c.fillStyle=mist;c.fillRect(0,H*.12,900,H*.75);
 scene.ascensionStageBackground={key,surface};return surface;
}
function ellipse(c,x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
export function drawAscensionStageBackdrop(scene,c,H,{clock=0,ritual=false,color='#9ee9ec',feet=H*.66}={}){
 prepareAscensionStage(scene);const base=background(scene,H);c.save();
 if(base)c.drawImage(base,0,0,900,H);else{c.fillStyle='#102440';c.fillRect(0,0,900,H);}
 if(ritual){const veil=c.createLinearGradient(0,0,0,H);veil.addColorStop(0,'#020617c9');veil.addColorStop(.45,'#071025b8');veil.addColorStop(1,'#030b1be5');c.fillStyle=veil;c.fillRect(0,0,900,H);}
 const t=scene.motion===false?0:clock,ground=feet+42;
 const shine=c.createRadialGradient(450,ground,10,450,ground,380);shine.addColorStop(0,color+'30');shine.addColorStop(1,color+'00');c.fillStyle=shine;c.fillRect(60,ground-380,780,760);
 // Jade tiers have real side faces, perspective and a restrained reflection.
 ellipse(c,450,ground+45,308,88,'#030c2070');
 for(const [rx,ry,dy]of [[280,79,30],[260,71,16],[239,64,0]]){
  const side=c.createLinearGradient(0,ground+dy,0,ground+dy+22);side.addColorStop(0,'#73abbe');side.addColorStop(.45,'#31546b');side.addColorStop(1,'#0b233f');
  ellipse(c,450,ground+dy+16,rx,ry,side,'#b6ded95e',1.5);
  const top=c.createLinearGradient(220,ground-60,650,ground+70);top.addColorStop(0,'#739cae');top.addColorStop(.5,'#bed9d1');top.addColorStop(1,'#3e6c84');ellipse(c,450,ground+dy,rx,ry,top,'#d6ede4a8',1.5);
 }
 ellipse(c,450,ground,214,55,'#1539548c',color+'c0',1.5);ellipse(c,450,ground,194,49,null,'#d7edf078',1);
 c.save();c.translate(450,ground);c.scale(1,.255);c.rotate(t*.00004);c.strokeStyle=color+'a0';c.lineWidth=2;
 for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(Math.cos(a)*170,Math.sin(a)*170);c.lineTo(Math.cos(a)*188,Math.sin(a)*188);c.stroke();}c.restore();
 const motes=scene.budget?.level==='light'?12:24;
 for(let i=0;i<motes;i++){const a=i*2.399,phase=(i*.137+t*.000055)%1,x=450+Math.sin(a+phase*.35)*(130+phase*230),y=ground-phase*H*.47;c.globalAlpha=Math.sin(phase*Math.PI)*.55;c.fillStyle=i%3?color:'#fff0ce';ellipse(c,x,y,i%4?1.4:2.4,i%4?2.7:1.5,c.fillStyle);}
 c.restore();
}
export function stagePlayer(scene,t){
 const players=(scene.realPlayers||scene.players||[]).filter(p=>p.active&&!isNPC(p));if(!players.length)return null;
 const ready=players.filter(p=>p.finalRealmEligible!==false&&p.realm<MAX_REALM&&p.qi>=p.neededQi&&p.stones>=p.neededStones);
 const pool=ready.length?ready:players;return pool[Math.floor(t/9000)%pool.length];
}
export function drawAscensionStageIdle(scene,c,t,H){
 const p=stagePlayer(scene,t),feet=H*.65;
 drawAscensionStageBackdrop(scene,c,H,{clock:t,feet});
 scene.targets=[];scene.labels=[];scene.camera={s:1,x:0,y:0};scene.compact=true;
 if(p){const target={id:p.id,player:p,x:450,y:feet,scale:4.3};scene.targets=[target];scene.ritualDrawing=true;c.save();
  try{c.translate(0,scene.motion===false?0:Math.sin(t*.0011)*5);scene.drawPlayer(c,p,450,feet,scene.motion===false?0:t);}finally{scene.ritualDrawing=false;c.restore();}
 }
 const ready=!!p&&p.finalRealmEligible!==false&&p.realm<MAX_REALM&&p.qi>=p.neededQi&&p.stones>=p.neededStones;
 const progress=p?clamp(Math.min(p.qi/Math.max(1,p.neededQi||1),p.stones/Math.max(1,p.neededStones||1))):0;
 scene.onAscensionIdle?.({player:p,name:p?.name||'',realm:p?.realmName||REALM_NAMES[p?.realm||0],ready,progress});
}
export function mountAscensionStage(shell,scene){
 prepareAscensionStage(scene);const hud=document.createElement('section');hud.className='ascension-lobby';
 hud.innerHTML='<header class="ascension-masthead"><span>VÂN HẢI TÔNG</span><h1>THIÊN ĐÀI</h1><p>Tu luyện · Đột phá · Khai mở cảnh giới</p></header><div class="ascension-person"><strong></strong><span></span><div class="ascension-progress"><i></i></div></div><aside class="ascension-waiting" hidden></aside><footer class="ascension-command-dock"><p class="ascension-next">Gõ nhapmon để lên thiên đài</p><div><span><code>tuluyen</code>Vận công</span><span><code>hai</code>Hái linh thảo</span><span><code>dotpha</code>Lên cảnh giới</span></div><small class="ascension-access"></small></footer>';
 shell.appendChild(hud);let signature='';
 scene.onAscensionIdle=s=>{const key=[s.player?.id,s.name,s.realm,s.ready,Math.floor(s.progress*100)].join('|');if(key===signature)return;signature=key;
  hud.querySelector('.ascension-person strong').textContent=s.name||'Chờ đạo hữu';hud.querySelector('.ascension-person>span').textContent=s.name?s.realm:'Thiên đài đã mở';
  hud.querySelector('.ascension-person').classList.toggle('is-ready',s.ready);hud.querySelector('.ascension-progress i').style.transform=`scaleX(${s.progress})`;
  hud.querySelector('.ascension-next').textContent=s.ready?'Đủ điều kiện · gõ dotpha':s.player?'Gõ tuluyen hoặc hai để tiến đến đột phá':'Gõ nhapmon để lên thiên đài';
 };
 return {update(state,queue=[]){
  hud.querySelector('.ascension-access').textContent=state.settings?.ascensionShowcase===true?'Tu luyện nhanh · không cần quà để đột phá':'';
  const waiting=queue.filter(e=>e.effect==='breakthrough').slice(0,3),box=hud.querySelector('.ascension-waiting');box.hidden=!waiting.length;
  box.replaceChildren();for(const e of waiting){const row=document.createElement('span');row.textContent=e.name+' · '+REALM_NAMES[e.toRealm||1];box.appendChild(row);}
 }};
}
