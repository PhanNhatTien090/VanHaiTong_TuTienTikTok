import {drawKimTienAwakening} from './kim-tien-awakening.js';
import {QUALITY} from './performance.js';
import {beginRitualPalette} from './qi-impact.js';
import {ritualAppearance,ritualAppearanceFrame,drawRitualAppearance,drawRitualWeather,drawRitualGrade} from './ritual-appearance.js';
const FULL_RITUAL_BUDGET=Object.freeze({level:'high',config:QUALITY.high});
export function drawRitual(scene,...args){
 const [c,e,t,H]=args,a=scene.ritualVariantsEnabled===false?null:ritualAppearance(e),restorePalette=beginRitualPalette(a?.palette||null);
 const saved={budget:scene.budget,crowded:scene.crowded,heavyCrowd:scene.heavyCrowd,minimalCrowd:scene.minimalCrowd,reducePresence:scene.reducePresence,compact:scene.compact,ritualAppearance:scene.ritualAppearance,onRitualFrame:scene.onRitualFrame};
 Object.assign(scene,{budget:FULL_RITUAL_BUDGET,crowded:false,heavyCrowd:false,minimalCrowd:false,reducePresence:false,compact:false,ritualAppearance:a});
 if(a&&typeof saved.onRitualFrame==='function')scene.onRitualFrame=ui=>saved.onRitualFrame.call(scene,ritualAppearanceFrame(ui,a));
 // 07/11: lật trái/phải + khung zoom khác nhau cho mỗi lần (chỉ cảnh giới đầu). Chữ HUD là DOM nên không bị lật.
 const framed=!!(a?.zoom&&(a.mirror||a.zoom!==1||a.dy));
 try{if(framed){c.save();const cy=H*.62;c.translate(450,cy);c.scale(a.mirror?-a.zoom:a.zoom,a.zoom);c.translate(-450,-cy+a.dy/a.zoom);}
  let result;try{result=drawRitualFull(scene,...args);}finally{if(framed)c.restore();}
  drawRitualGrade(scene,c,e,t,H,a);drawRitualWeather(scene,c,e,t,H,a);drawRitualAppearance(scene,c,e,t,H,a);return ritualAppearanceFrame(result,a);}finally{restorePalette();Object.assign(scene,saved);}
}
import {drawHuyenTienAwakening} from './huyen-tien-awakening.js';
import {drawDaiThuaAwakening} from './dai-thua-awakening.js';
import {drawChanTienAwakening} from './chan-tien-awakening.js';
import {drawThaiAtAwakening} from './thai-at-awakening.js';
import {drawDaiLaAwakening} from './dai-la-awakening.js';
import {drawTienDeAwakening} from './tien-de-awakening.js';
import {drawMaThanAwakening} from './ma-than-awakening.js';
import {drawThienMaAwakening} from './thien-ma-awakening.js';
import {drawDietTheAwakening} from './diet-the-awakening.js';
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
// 09/11: lưới đều như sân Nguyệt Cung cho mọi map — chia đều người giữa các hàng (13 → 5/4/4, không còn 1 người lẻ hàng cuối),
// cột cách đều, nhân vật to theo số người; cả khối căn giữa quanh centerY (nền của map).
export function crowdTargets(players,H,centerY=H*.62){const n=players.length;if(!n)return [];
 const cols=n<=4?n:n<=12?4:n<=24?6:n<=40?8:10,rows=Math.ceil(n/cols),base=Math.floor(n/rows),extra=n%rows;
 const scale=n<=3?2.6:n<=4?2.4:n<=8?2.1:n<=12?1.9:n<=24?1.45:n<=40?1.05:.85,pitch=n<=4?190:n<=12?190:n<=24?135:n<=40?102:84;
 const gap=rows<=1?0:Math.min(rows<=3?205:175,H*.42/(rows-1)),top=Math.max(H*.30,Math.min(H*.80-(rows-1)*gap,centerY-(rows-1)*gap/2));
 const out=[];let i=0;for(let r=0;r<rows;r++){const len=base+(r<extra?1:0);for(let k=0;k<len;k++,i++)out.push({id:players[i].id,player:players[i],x:450+(k-(len-1)/2)*pitch,y:top+r*gap,scale,lift:0});}
 return out;}
// 09/11: GHẾ CỐ ĐỊNH — sân có sẵn PLAZA_CAPACITY ghế so le (hàng 7 xen hàng 6, 52 ghế, dùng tối đa 50 — giữ luật >30 người 50 ghế), nhân vật nhỏ, rải đều sân.
// Ai đã ngồi thì giữ nguyên ghế (không xếp lại cả sân khi có người vào/ra, đổi map cũng giữ). Người mới lấy ghế trống
// gần giữa sân nhất; NPC/tu sĩ giả lấy ghế rìa nhưng vẫn trong vùng sân (rank ≤ 1). seats: Map id → số ghế, sống cùng Scene.
export const PLAZA_ROWS=8,PLAZA_SCALE=.82,PLAZA_CAPACITY=50;
export function plazaSlots(H,centerY){const top=H*.43,bottom=H*.85,pitch=(bottom-top)/(PLAZA_ROWS-1),step=112,cy=Math.max(top+pitch,Math.min(bottom-pitch,centerY??(top+bottom)/2)),out=[];
 for(let r=0;r<PLAZA_ROWS;r++){const len=r%2?6:7;for(let k=0;k<len;k++){const x=450+(k-(len-1)/2)*step,y=top+r*pitch;out.push({i:out.length,x,y,rank:Math.hypot((x-450)/390,(y-cy)/((bottom-top)/2))});}}
 return out;}
// 09/11: người mặc skin lớn (lửa/rồng/đao bay — isBig) giữ trống 2 ghế bên cạnh + 2 ghế ngay phía sau (bị che);
// ai đang ngồi trong vùng đó được dời sang ghế trống khác — trường hợp duy nhất có người bị đổi chỗ.
export function stableTargets(seats,players,H,isFake=()=>false,centerY,isBig=()=>false){const slots=plazaSlots(H,centerY),best=[...slots].sort((a,b)=>a.rank-b.rank||a.i-b.i).map(s=>s.i),edge=[...slots.filter(s=>s.rank<=1).sort((a,b)=>b.rank-a.rank),...slots.filter(s=>s.rank>1).sort((a,b)=>a.rank-b.rank)].map(s=>s.i);
 const pitch=slots.length>7?slots[7].y-slots[0].y:1,zone=i=>slots.filter(o=>o.i!==i&&((Math.abs(o.y-slots[i].y)<1&&Math.abs(o.x-slots[i].x)<=120)||(Math.abs(o.y-(slots[i].y-pitch))<1&&Math.abs(o.x-slots[i].x)<=60))).map(o=>o.i);
 const ids=new Set(players.map(p=>p.id));for(const id of [...seats.keys()])if(!ids.has(id))seats.delete(id);
 const byId=new Map(players.map(p=>[p.id,p])),blocked=new Set(),owner=new Map([...seats].map(([id,i])=>[i,id]));
 const block=i=>{for(const j of zone(i)){blocked.add(j);const who=owner.get(j);if(who!=null&&!isBig(byId.get(who))){seats.delete(who);owner.delete(j);}}};
 for(const [id,i] of [...seats])if(isBig(byId.get(id)))block(i);
 const free=i=>!owner.has(i)&&!blocked.has(i),take=(p,i)=>{seats.set(p.id,i);owner.set(i,p.id);};
 const queue=[...players.filter(p=>isBig(p)),...players.filter(p=>!isBig(p))];
 for(const p of queue){if(seats.has(p.id))continue;if(seats.size>=PLAZA_CAPACITY)break;const order=isFake(p)?edge:best;
  if(isBig(p)){const pick=order.find(i=>free(i)&&zone(i).every(j=>!owner.has(j)))??order.find(free);if(pick==null)continue;take(p,pick);block(pick);continue;}
  const pick=order.find(free);if(pick==null)continue;take(p,pick);}
 // người bị dời khỏi vùng skin lớn ở trên được xếp lại ở vòng này (queue đã chạy qua họ sau khi block)
 for(const p of players){if(seats.has(p.id)||seats.size>=PLAZA_CAPACITY)continue;const pick=(isFake(p)?edge:best).find(free);if(pick!=null)take(p,pick);}
 return players.filter(p=>seats.has(p.id)).map(p=>{const s=slots[seats.get(p.id)];return {id:p.id,player:p,x:s.x,y:s.y,scale:PLAZA_SCALE,lift:0};}).sort((a,b)=>a.y-b.y||a.x-b.x);}
// Fewer bodies animate on the plaza; ritual gets a single full-detail actor.
// 3/11: cảnh LIVE luôn ở chế độ gọn (bỏ hào quang/vòng sáng thường trực của từng người) cho mượt, kể cả lúc ít người hay đang trình diễn.
// Hiệu ứng hành động (đột phá, quà, chiêu thức…) vẫn chạy bình thường. Đua phi kiếm / tỷ thí / kết duyên giữ nguyên đầy đủ.
export function compactPlaza(scene){return scene.crowdMode!==false&&!scene.raceStatus?.active&&!scene.socialScene&&!scene.socialStage?.length;}
function line(c,points,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function bamboo(c,x,y,h,alpha,color){c.save();c.globalAlpha*=alpha;c.translate(x,y);const g=c.createLinearGradient(-14,0,14,0);g.addColorStop(0,'#19494b');g.addColorStop(.45,color);g.addColorStop(.55,'#eaffee');g.addColorStop(1,'#247977');c.fillStyle=g;c.beginPath();c.moveTo(0,-h-35);c.lineTo(13,-h+5);c.lineTo(10,-30);c.lineTo(-10,-30);c.lineTo(-13,-h+5);c.closePath();c.fill();line(c,[[0,-h-25],[0,-32]],'#eafff1',2);for(let j=1;j<5;j++){const yy=-30-(h-30)*j/5;line(c,[[-10,yy],[10,yy]],'#80dba5',3);}c.fillStyle='#dcc998';c.fillRect(-25,-31,50,6);c.fillStyle='#35705b';c.fillRect(-5,-25,10,29);c.restore();}
function drawRitualFull(scene,c,e,t,H){if(breakthroughRealm(e)===24)return drawDietTheAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===23)return drawThienMaAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===22)return drawMaThanAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===13)return drawTienDeAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===12)return drawDaiLaAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===11)return drawThaiAtAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===10)return drawKimTienAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===9)return drawHuyenTienAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===1)return drawQiAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===2)return drawTrucCoAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===3)return drawKimDanAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===4)return drawNguyenAnhAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===5)return drawHoaThanAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===6)return drawLuyenHuAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===7)return drawDaiThuaAwakening(scene,c,e,t,H);if(breakthroughRealm(e)===8)return drawChanTienAwakening(scene,c,e,t,H);const s=ritualState(e,t,scene.motion),{k,realm,phase,revealed,color}=s,x=450,feet=H*.62,center=feet-200,gather=clamp((k-.12)/.22),form=clamp((k-.28)/.28),burst=clamp(1-Math.abs(k-.71)/.055);c.save();
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
