// Live duel cinematic direction. All effects are driven by existing match / gift clocks.
// No extra animation loop, no DOM per frame, and no fake damage or HP.
import {duelCastState} from './duel-combat.js';
import {portraitCanvas} from './linh-bai.js';
import {donorPortrait} from './gift-donor.js';
import {drawAura,drawSeal,drawCelestialImpact} from './cinematic-vfx.js';

export const DUEL_RELEASE_AT=.56;
export function duelSoundPreset(tech){
 const id=String(tech?.id||'');
 if(['thunder','meteor','sevenstars'].includes(id))return 'storm';
 if(['flame','dora-cannon'].includes(id))return 'flame';
 if(['dragon','vortex'].includes(id))return 'tide';
 if(id==='frost')return 'crystal';
 if(['celestial','lotus','stars','starmirror','bell'].includes(id))return 'gold';
 if(['slash','sword','bamboo','flowersword','stararrow'].includes(id))return 'blade';
 return 'void';
}
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fadeInOut=(k,a=.14,b=.15)=>Math.min(1,clamp(k/a),clamp((1-k)/b));
const validColor=color=>/^#[0-9a-f]{6}$/i.test(color||'')?color:'#9cecff';

// Pure, bounded planner: combatant, donor and even an unrelated donor can all have
// their own cut-in, but a pressured scene renders only the highest-priority one.
export function duelCutinPlan(match,serverNow,gifts=[],performanceNow=0,light=false,enhanced=false){
 if(!match||!Number.isFinite(serverNow)||!Number.isFinite(match.startedAt))return [];
 const cast=duelCastState(Math.max(0,serverNow-match.startedAt),
  ((Number(match.aura?.[match.a])||0)-(Number(match.aura?.[match.b])||0))/100);
 const result=[];
 if(cast.ready&&cast.k<=DUEL_RELEASE_AT&&(!cast.light||!light)){
  const id=cast.side?match.b:match.a,tech=match.techniques?.[id];
  if(tech)result.push({id:match.id+':cast:'+cast.turn,user:id,name:match.names?.[id]||'Đạo hữu',
   kind:'cast',priority:cast.ultimate?6:cast.guard?3:2,ultimate:!!cast.ultimate,
   progress:clamp(cast.k/DUEL_RELEASE_AT),color:validColor(tech.color),
   title:String(tech.name||'TUYỆT KỸ').slice(0,36),side:cast.side});
 }
 if(enhanced&&cast.ready&&cast.ultimate&&cast.k>=.16&&cast.k<=DUEL_RELEASE_AT){
  const other=cast.side?match.a:match.b,otherTech=match.techniques?.[other];
  if(otherTech)result.push({
   id:match.id+':counter:'+cast.turn,user:other,
   name:match.names?.[other]||'Đạo hữu',kind:'counter',priority:4.5,
   ultimate:true,progress:clamp((cast.k-.16)/(DUEL_RELEASE_AT-.16)),
   color:validColor(otherTech.color),title:String(otherTech.name||'PHẢN CHIÊU').slice(0,36),
   side:1-cast.side
  });
 }
 for(const row of gifts||[]){
  if(!row||row.mode!=='duel'||Number(row.value)<500||!Number.isFinite(row.start))continue;
  const k=(performanceNow-row.start)/(row.profile?.duration||1);
  if(k<0||k>.30)continue;
  result.push({id:'gift:'+row.id,user:row.user,name:String(row.name||'Đạo hữu').slice(0,24),
   kind:'gift',priority:row.value>=2000?5:4,ultimate:row.value>=2000,
   progress:clamp(k/.30),color:validColor(row.profile?.color||'#ffda88'),
   title:String(row.profile?.name||'THẦN BINH TRỢ CHIẾN').slice(0,36),
   avatar:row.avatar,value:Number(row.value),side:match.b===row.user?1:0,
   fighter:!!row.fighter});
 }
 return result.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id)).slice(0,light?1:3);
}

// A charge is drawn underneath the actual portrait, in world coordinates.
// It is a separate visual animation, not a repeated attack or gameplay mutation.
export function drawDuelCharge(scene,c,actor,tech,k,t,{ultimate=false,light=false}={}){
 if(!actor||k>=DUEL_RELEASE_AT||k<0)return;
 const u=clamp(k/DUEL_RELEASE_AT),x=actor.x,y=actor.y-100,color=validColor(tech?.color);
 const r=(40+u*(ultimate?135:85))*(light?.82:1);
 c.save();c.globalAlpha=.32+.40*u;c.strokeStyle=color;c.lineWidth=ultimate?4:2.8;
 c.beginPath();c.ellipse(x,y,r,r*.33,0,0,TAU);c.stroke();
 c.beginPath();c.ellipse(x,actor.y+16,r*.82,r*.23,0,0,TAU);c.stroke();
 if(!light){
  drawSeal(c,ultimate?'gold':'jade',x,actor.y+11,Math.min(130,r),scene.motion?t*.0007:0,.25+.33*u);
  drawAura(c,ultimate?'gold':'void',x,y-30,r*1.15,.17+.26*u);
 }
 const count=light?5:ultimate?14:9;
 c.lineCap='round';
 for(let i=0;i<count;i++){
  const a=i*TAU/count+(scene.motion?t*.0012:0),rr=r*(.6+.2*Math.sin(i*13.1)),px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.7;
  c.strokeStyle=i%3?'#fff2d4':color;c.lineWidth=i%3?2:3;c.globalAlpha=(.32+.55*u)*(1-i/count*.25);
  c.beginPath();c.moveTo(px,py+16+24*(1-u));c.lineTo(px+Math.sin(a)*7,py-13-18*u);c.stroke();
 }
 c.restore();
}

// One authored release: sharp beam / sword strokes and a localized magical impact.
// No full-screen white flash and no new image decoding or filter at the hit frame.
export function drawDuelRelease(scene,c,actor,target,tech,k,{ultimate=false,light=false}={}){
 if(!actor||!target||k<DUEL_RELEASE_AT||k>.95)return;
 const u=clamp((k-DUEL_RELEASE_AT)/(.95-DUEL_RELEASE_AT)),color=validColor(tech?.color);
 const x0=actor.x,y0=actor.y-130,x1=target.x,y1=target.y;
 const grow=clamp(u/.36),fade=clamp((1-u)/.35),swing=1-(1-grow)**3;
 const tx=x0+(x1-x0)*swing,ty=y0+(y1-y0)*swing-Math.sin(swing*Math.PI)*(ultimate?85:40);
 c.save();c.lineCap='round';c.lineJoin='round';c.globalAlpha=fade;
 const n=light?2:ultimate?6:4;
 for(let i=n-1;i>=0;i--){
  const offset=(i-(n-1)/2)*(ultimate?15:9),startX=x0+offset*.4,startY=y0+offset;
  c.strokeStyle=i%3===0?'#ffffff':color;c.lineWidth=(ultimate?14:9)*(1-i/n*.75);
  c.globalAlpha=fade*(i%3===0?.86:.4);
  c.beginPath();c.moveTo(startX,startY);
  c.quadraticCurveTo((x0+tx)/2,Math.min(y0,ty)-65-i*5,tx,ty+offset*.3);c.stroke();
 }
 const hit=clamp((u-.31)/.28);
 if(hit>0){
  c.globalAlpha=(1-hit)*(light?.70:1);c.strokeStyle=color;c.lineWidth=ultimate?8:5;
  c.beginPath();c.ellipse(x1,y1,20+hit*(ultimate?270:145),12+hit*(ultimate?125:65),0,0,TAU);c.stroke();
  c.strokeStyle='#fff9da';c.lineWidth=2;c.beginPath();
  c.ellipse(x1,y1,22+hit*(ultimate?220:115),10+hit*(ultimate?88:47),0,0,TAU);c.stroke();
  if(!scene.reduceFlash&&!light)drawCelestialImpact(c,x1,y1,hit*400,ultimate?230:140,.55*(1-hit));
 }
 c.restore();
}

export function duelChargingPose(match,actor,serverNow,enhanced=false){
 if(!match||!actor)return null;
 const lead=((Number(match.aura?.[match.a])||0)-(Number(match.aura?.[match.b])||0))/100;
 const cast=duelCastState(Math.max(0,serverNow-match.startedAt),lead);
 if(!cast.ready||cast.k>=DUEL_RELEASE_AT)return null;
 const primary=cast.side?match.b:match.a,secondary=cast.side?match.a:match.b;
 if(actor.id!==primary&&!(enhanced&&cast.ultimate&&cast.k>=.16&&actor.id===secondary))return null;
 const u=clamp(cast.k/DUEL_RELEASE_AT),power=cast.ultimate?1:.75;
 return {mode:'cast',stand:1,left:-power*(.48+.28*u),right:power*(.45+.5*u),
  head:-.045*u,lean:-.055*power,cloth:2.5*u,lift:-4*u,energy:u,phase:u,step:0};
}

// Oversized angled panel, readable at mobile livestream size. Use one portrait
// canvas that was already rasterized when fighters joined, never a CSS filter.
export function drawDuelCinematic(scene,c,t,H,serverNow=Date.now()){
 if(scene.cinematicV2===false||scene.socialScene!=='tournament')return 0;
 const match=scene.socialStatus?.tournament?.current;if(!match)return 0;
 const light=!!(scene.budget?.pressured||scene.budget?.level==='light'||scene.heavyCrowd||(scene.fps>0&&scene.fps<18));
 const gifts=scene.eventGiftQueue?.activeRows||[];
 const enhanced=scene.v6Showcase!==false;
 const cues=duelCutinPlan(match,serverNow,gifts,t,light,enhanced);
 if(!cues.length)return 0;
 const reducedMotion=scene.motion===false;
 const reducedFlash=scene.reduceFlash===true;
 const count=cues.length,large=count===1,baseY=H*.375;
 const gap=count===3?155:190,height=large?Math.min(244,H*.18):count===2?Math.min(176,H*.13):Math.min(136,H*.11);
 const maxFade=Math.max(...cues.map(e=>fadeInOut(e.progress,.10,.14)));
 const darkness=Math.min(.62,(large?.48:.39)*maxFade);
 c.save();
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 c.fillStyle='#040918';c.globalAlpha=darkness;
 c.fillRect(0,H*.185,900,H*.56);
 for(let i=0;i<count;i++){
  const cue=cues[i],u=cue.progress,alpha=fadeInOut(u,.17,.16);
  if(alpha<=0)continue;
  const y=baseY+(i-(count-1)*.5)*gap;
  const side=cue.side===1?-1:1,from=reducedMotion?0:side*(1-clamp(u/.21))**3*315;
  const h=height*(cue.kind==='cast'?1.05:cue.kind==='counter'?.94:1);
  const color=cue.color,actor=scene.targets?.find(a=>a.id===cue.user);
  const px=cue.side===1?645:44;
  const portrait=actor?.player?portraitCanvas(scene,actor.player):donorPortrait(cue.avatar);
  const titleX=cue.side===1?370:540;
  c.save();c.globalAlpha=alpha;c.translate(from,0);
  // Thick sharp silhouette with a 12-degree diagonal top and bottom.
  c.beginPath();c.moveTo(0,y-h*.32);c.lineTo(900,y-h*.58);
  c.lineTo(900,y+h*.32);c.lineTo(0,y+h*.58);c.closePath();
  c.save();c.clip();
  const fill=c.createLinearGradient(0,y,900,y);
  fill.addColorStop(0,'#070c21');fill.addColorStop(.31,color+'80');
  fill.addColorStop(.68,'#11172b');fill.addColorStop(1,'#070c21');
  c.globalAlpha=1;c.fillStyle=fill;c.fillRect(0,y-h*.9,900,h*1.8);
  const position=cue.side===1?744:145;
  c.fillStyle=color;c.globalAlpha=reducedFlash?.10:.18;c.beginPath();c.ellipse(position,y,205,h*.85,0,0,Math.PI*2);c.fill();
  // Bounded speed lines, no blur or shadows.
  c.lineWidth=2;c.strokeStyle='#fff9e5';c.globalAlpha=.20;
  for(let j=0;j<(light?4:9);j++){
   const yy=y-h*.47+j*h/(light?4:9),xx=(j*127+(reducedMotion?0:u*420))%850;
   c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+73,yy-19);c.stroke();
  }
  c.globalAlpha=1;
  if(portrait){
   if(actor?.player)c.drawImage(portrait,px,y-h*.80,h*1.36,h*1.62);
   else{
    const w=portrait.naturalWidth||h,hp=portrait.naturalHeight||h,sz=Math.min(w,hp);
    c.drawImage(portrait,(w-sz)*.5,(hp-sz)*.5,sz,sz,
     px+14,y-h*.48,h*.90,h*.90);
   }
  }else{
   // Portrait still loading: a prominent element seal keeps the panel legible.
   c.lineWidth=6;c.strokeStyle=color;c.beginPath();
   c.arc(position,y,h*.27,0,Math.PI*2);c.stroke();
  }
  c.restore();
  // High-contrast asymmetric rails and angular ends.
  c.globalAlpha=alpha;c.strokeStyle='#090e24';c.lineWidth=12;
  c.beginPath();c.moveTo(0,y-h*.32);c.lineTo(900,y-h*.58);c.lineTo(900,y+h*.32);c.lineTo(0,y+h*.58);c.closePath();c.stroke();
  c.strokeStyle=color;c.lineWidth=5;c.beginPath();
  c.moveTo(0,y-h*.32);c.lineTo(900,y-h*.58);
  c.moveTo(0,y+h*.58);c.lineTo(900,y+h*.32);c.stroke();
  c.lineWidth=2;c.strokeStyle='#fff7d9';c.globalAlpha=alpha*.78;
  c.beginPath();c.moveTo(0,y-h*.28);c.lineTo(900,y-h*.54);c.stroke();
  c.globalAlpha=alpha;
  const label=cue.kind==='gift'?'THẦN BINH TRỢ CHIẾN · '+cue.value.toLocaleString('vi-VN')+' COIN':
   cue.kind==='counter'?'HỘ PHÁP · PHẢN CHIÊU':cue.ultimate?'TUYỆT KỸ · THIÊN ĐỊA BIẾN SẮC':'CHIÊU THỨC';
  const w=large?510:450;
  c.textAlign='center';c.textBaseline='middle';
  c.fillStyle='#fef0c0';c.font='800 '+(large?18:15)+'px "Segoe UI",Arial,sans-serif';
  c.fillText(label,titleX,y-h*.27,w);
  c.font='900 '+(large?43:count===2?32:27)+'px "Segoe UI",Arial,sans-serif';
  c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#080d23';
  c.strokeText(cue.title,titleX,y-2,w);
  c.fillStyle='#ffffff';c.fillText(cue.title,titleX,y-2,w);
  c.font='700 '+(large?20:16)+'px "Segoe UI",Arial,sans-serif';c.fillStyle='#e7f0ff';
  c.fillText(actor?.player?.name||cue.name,titleX,y+h*.27,w);
  // Charging meter communicates the actual anticipation beat.
  c.globalAlpha=.60*alpha;c.fillStyle='#060a17';c.fillRect(titleX-w*.43,y+h*.37,w*.86,5);
  c.globalAlpha=alpha;c.fillStyle=color;c.fillRect(titleX-w*.43,y+h*.37,w*.86*clamp(u),5);
  c.restore();
 }
 c.restore();
 return count;
}
