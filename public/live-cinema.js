import {drawKimTienAwakening} from './kim-tien-awakening.js';
import {QUALITY} from './performance.js';
import {beginRitualPalette} from './qi-impact.js';
import {ritualAppearance,ritualAppearanceFrame,drawRitualAppearance} from './ritual-appearance.js';
const FULL_RITUAL_BUDGET=Object.freeze({level:'high',config:QUALITY.high});
export function drawRitual(scene,...args){
 const [c,e,t,H]=args,a=scene.ritualVariantsEnabled===false?null:ritualAppearance(e),restorePalette=beginRitualPalette(a?.palette||null);
 const saved={budget:scene.budget,crowded:scene.crowded,heavyCrowd:scene.heavyCrowd,reducePresence:scene.reducePresence,compact:scene.compact,ritualAppearance:scene.ritualAppearance,onRitualFrame:scene.onRitualFrame};
 Object.assign(scene,{budget:FULL_RITUAL_BUDGET,crowded:false,heavyCrowd:false,reducePresence:false,compact:false,ritualAppearance:a});
 if(a&&typeof saved.onRitualFrame==='function')scene.onRitualFrame=ui=>saved.onRitualFrame.call(scene,ritualAppearanceFrame(ui,a));
 try{const result=drawRitualFull(scene,...args);drawRitualAppearance(scene,c,e,t,H,a);return ritualAppearanceFrame(result,a);}finally{restorePalette();Object.assign(scene,saved);}
}
import {drawHuyenTienAwakening} from './huyen-tien-awakening.js';
import {drawDaiThuaAwakening} from './dai-thua-awakening.js';
import {drawChanTienAwakening} from './chan-tien-awakening.js';
import {drawLuyenHuAwakening} from './luyen-hu-awakening.js';
import {drawHoaThanAwakening} from './hoa-than-awakening.js';
import {drawAscensionStageBackdrop} from './ascension-stage.js';
// Real-time Canvas/DOM presentation only; never changes server rewards or progression.
import {drawQiAwakening} from './qi-awakening.js';
import {drawTrucCoAwakening} from './truc-co-awakening.js';
import {drawKimDanAwakening} from './kim-dan-awakening.js';
import {drawNguyenAnhAwakening} from './nguyen-anh-awakening.js';
import {drawAscensionImpact} from './ascension-impact.js';
import {breakthroughPower,drawBreakthroughSpectacle} from './breakthrough-spectacle.js';
import {ascensionProfile,drawAscension} from './ascension-art.js';
import {breakthroughRealm,REALM_NAMES} from './breakthrough-fx.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export const giftValue=e=>Math.max(0,Number(e?.coins)||0)*Math.max(1,Number(e?.count)||1);
export const smallGift=e=>!!e?.gift&&giftValue(e)<=10;
export function shouldFocusEvent(e){return !!e?.user&&!e.autoArrival&&!e.newcomerWelcome&&(e.effect==='breakthrough'||e.transform||!!e.gift||e.petAward||e.flowerRank);}
export function ritualPhase(k){return k<.12?'arrival':k<.34?'gather':k<.59?'formation':k<.69?'surge':k<.76?'burst':k<.94?'reveal':'return';}
export function ritualState(e,t,motion=true){const k=clamp((t-e.start)/e.duration),realm=breakthroughRealm(e),phase=ritualPhase(k),impact=clamp(1-Math.abs(k-.71)/.035);return {k,realm,phase,revealed:k>=.72,color:ascensionProfile(realm).color,title:REALM_NAMES[realm].normalize('NFC'),name:String(e.name||'Đạo hữu').normalize('NFC'),shake:motion?impact*breakthroughPower(realm).shake:0};}
export function crowdTargets(players,H){const n=players.length,cols=n>40?8:n>24?7:n>12?6:4,rows=Math.ceil(n/cols),top=H*.40,bottom=H*.77,scale=Math.min(1.35,100/120,rows>1?(bottom-top)/(rows-1)/135:1.35);return players.map((player,i)=>{const row=Math.floor(i/cols),len=Math.min(cols,n-row*cols);return {id:player.id,player,x:450+(i%cols-(len-1)/2)*780/cols,y:rows===1?H*.62:top+row*(bottom-top)/(rows-1),scale,lift:0};});}
// Fewer bodies animate on the plaza; ritual gets a single full-detail actor.
// 3/11: cảnh LIVE luôn ở chế độ gọn (bỏ hào quang/vòng sáng thường trực của từng người) cho mượt, kể cả lúc ít người hay đang trình diễn.
// Hiệu ứng hành động (đột phá, quà, chiêu thức…) vẫn chạy bình thường. Đua phi kiếm / tỷ thí / kết duyên giữ nguyên đầy đủ.
export function compactPlaza(scene){return scene.crowdMode!==false&&!scene.raceStatus?.active&&!scene.socialScene&&!scene.socialStage?.length;}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function bamboo(c,x,y,h,alpha,color){c.save();c.globalAlpha*=alpha;c.translate(x,y);const g=c.createLinearGradient(-14,0,14,0);g.addColorStop(0,'#19494b');g.addColorStop(.45,color);g.addColorStop(.55,'#eaffee');g.addColorStop(1,'#247977');c.fillStyle=g;c.beginPath();c.moveTo(0,-h-35);c.lineTo(13,-h+5);c.lineTo(10,-30);c.lineTo(-10,-30);c.lineTo(-13,-h+5);c.closePath();c.fill();line(c,[[0,-h-25],[0,-32]],'#eafff1',2);for(let j=1;j<5;j++){const yy=-30-(h-30)*j/5;line(c,[[-10,yy],[10,yy]],'#80dba5',3);}c.fillStyle='#dcc998';c.fillRect(-25,-31,50,6);c.fillStyle='#35705b';c.fillRect(-5,-25,10,29);c.restore();}
function drawRitualFull(scene,c,e,t,H){if(breakthroughRealm(e)===10)return drawKimTienAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===9)return drawHuyenTienAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===1)return drawQiAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===2)return drawTrucCoAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===3)return drawKimDanAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===4)return drawNguyenAnhAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===5)return drawHoaThanAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===6)return drawLuyenHuAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===7)return drawDaiThuaAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===8)return drawChanTienAwakening(scene,c,e,t,H);const s=ritualState(e,t,scene.motion),{k,realm,phase,revealed,color}=s,x=450,feet=H*.62,center=feet-200,gather=clamp((k-.12)/.22),form=clamp((k-.28)/.28),burst=clamp(1-Math.abs(k-.71)/.055);c.save();
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#02050d');bg.addColorStop(.52,'#101628');bg.addColorStop(1,'#02050c');c.fillStyle=bg;c.fillRect(0,0,900,H);if(scene.showcase)drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:color,feet:feet});
 const halo=c.createRadialGradient(x,center,5,x,center,470);halo.addColorStop(0,color+'30');halo.addColorStop(1,color+'00');c.fillStyle=halo;c.fillRect(0,center-470,900,940);
 c.translate(Math.sin(t*.073)*s.shake,Math.cos(t*.089)*s.shake*.6);
 const clock=scene.motion?t-e.start:0;
 // Keep stars sparse and the silhouette readable on compressed TikTok video.
 for(let i=0;i<22;i++){c.globalAlpha=.15+(.5+.5*Math.sin(clock*.001+i))*.25;c.fillStyle=i%4?color:'#ffffff';c.fillRect((i*173)%880+10,(i*239)%(H*.70)+H*.1,i%7===0?2.5:1.3,2);}c.globalAlpha=1;
 if(gather>0){c.save();c.translate(x,feet+30);c.scale(1,.28);c.rotate(clock*.00016);for(let i=0;i<3;i++){c.strokeStyle=color+(i?'60':'c0');c.lineWidth=i?1:3;c.beginPath();c.arc(0,0,(120+i*64)*(.4+.6*gather),0,TAU);c.stroke();}c.restore();}
 // Realm-specific PNG layer opens only after the initial gathering, never at frame zero.
 if(k>.28){const u=clamp((k-.28)/.72);drawAscension(c,e,clock,u,{x,y:feet},H,realm,{light:scene.budget?.level==='light',art:scene.ascensionArt||{},layer:'back',viewScale:1});}
 if(realm===2&&form>0){for(let i=0;i<8;i++){const a=i*TAU/8+.3,delay=i*.032,rise=clamp((k-.24-delay)/.17),xx=x+Math.cos(a)*210,yy=feet+Math.sin(a)*38;bamboo(c,xx,yy,(240+80*(i%2))*rise,rise*.8,color);}}
 if(gather>0&&k<.73){const n=scene.budget?.level==='light'?14:22;for(let i=0;i<n;i++){const u=(clock*.0004+i/n)%1,a=i*2.399+clock*.0006,rad=(1-u)*(230+50*form),yy=center+(1-u)*120;line(c,[[x+Math.cos(a)*rad,yy+Math.sin(a)*rad*.55],[x+Math.cos(a+.12)*rad*.8,yy-8+Math.sin(a+.12)*rad*.45]],color+(Math.round(Math.sin(u*Math.PI)*180).toString(16).padStart(2,'0')),1.7);}}
 if(form>0&&k<.94){c.save();c.globalAlpha=form*(k<.72?.25+.4*clamp((k-.50)/.22):.28);for(let i=0;i<12;i++){const a=i*TAU/12+clock*.00008,inner=220,outer=250+90*form;line(c,[[x+Math.cos(a)*inner,center+Math.sin(a)*inner],[x+Math.cos(a)*outer,center+Math.sin(a)*outer]],color,i%3?1:3);}c.restore();}
 drawBreakthroughSpectacle(scene,c,s,clock,H,'back');
 drawAscensionImpact(scene,c,s,clock,H,'back');
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user);const to=e.visualTo||live;const from=e.visualFrom||(to?{...to,realm:Number.isInteger(e.fromRealm)?e.fromRealm:Math.max(0,realm-1)}:null);const player=revealed?to:from;
 if(player){const scale=realm>=8?4.6:4.2,target={id:e.user,player,x,y:feet,scale};scene.targets=[target];c.save();const lift=scene.motion?Math.sin(clamp((k-.15)/.6)*Math.PI)*22:0;c.translate(0,-lift);scene.ritualDrawing=true;try{scene.drawPlayer(c,player,x,feet,clock);}finally{scene.ritualDrawing=false;c.restore();}}
 if(burst>0){c.save();c.globalAlpha=burst*(.10+realm*.006);const flash=c.createRadialGradient(x,center,0,x,center,300+realm*10);flash.addColorStop(0,'#fff9df');flash.addColorStop(.28,color);flash.addColorStop(1,color+'00');c.fillStyle=flash;c.fillRect(0,center-500,900,1000);c.restore();}
 if(k>.69&&k<.86){const u=clamp((k-.69)/.17);c.save();c.globalAlpha=1-u;c.strokeStyle=color;c.lineWidth=8*(1-u)+1;c.beginPath();c.ellipse(x,center,60+u*550,60+u*550,0,0,TAU);c.stroke();c.restore();}
 drawBreakthroughSpectacle(scene,c,s,clock,H,'front');
 drawAscensionImpact(scene,c,s,clock,H,'front');
 // DOM type stays sharp independently of Canvas resolution. Offline preview uses Canvas fallback.
 if(scene.onRitualFrame)scene.onRitualFrame(s);else{c.textAlign='center';c.fillStyle='#e9d9b3';c.font='600 26px Segoe UI';c.fillText(s.name,x,H*.20,700);c.font='700 48px Arial';c.fillStyle=color;if(revealed)c.fillText(s.title.toLocaleUpperCase('vi'),x,H*.25,740);}
 c.restore();return s;
}

export function mountRitualHud(shell,scene){
 const hud=document.createElement('aside');hud.className='ritual-hud';hud.hidden=true;hud.innerHTML='<strong class="ritual-name"></strong><h2></h2><p class="ritual-sub" hidden></p>';shell.appendChild(hud);let last='';
 scene.onRitualFrame=s=>{if(!s){hud.hidden=true;last='';return;}const key=s.name+'|'+s.revealed+'|'+s.title+'|'+(s.appearanceKey||'');if(key===last)return;last=key;hud.hidden=false;hud.dataset.phase=s.revealed?'reveal':'gather';hud.style.setProperty('--ritual-color',s.color);hud.style.setProperty('--ritual-accent',s.accent||s.color);if(s.appearanceKey)hud.dataset.appearance=s.appearanceKey;else delete hud.dataset.appearance;hud.querySelector('.ritual-name').textContent=s.name;const title=hud.querySelector('h2');title.textContent=s.revealed?s.title:'';title.hidden=!s.revealed;hud.dataset.realm=s.realm||'';const sub=hud.querySelector('.ritual-sub');if(sub){sub.textContent=s.revealed&&s.subtitle?s.subtitle:'';sub.hidden=!sub.textContent;}};return hud;
}
