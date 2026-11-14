// Live duel cinematic direction. All effects are driven by existing match / gift clocks.
// No extra animation loop, no DOM per frame, and no fake damage or HP.
import {duelCastState} from './duel-combat.js';
import {portraitCanvas} from './linh-bai.js';
import {donorPortrait} from './gift-donor.js';
import {drawAura,drawSeal,drawCelestialImpact} from './cinematic-vfx.js';

export const DUEL_RELEASE_AT=.56;
export function duelSoundPreset(tech){
 const id=String(tech?.id||'');
 if(['thunder','celestial','meteor','sevenstars'].includes(id))return 'storm';
 if(['flame','dragon','dora-cannon','soul'].includes(id))return 'flame';
 if(['slash','sword','bamboo','flowersword','stararrow','frost'].includes(id))return 'blade';
 return 'void';
}
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const fadeInOut=(k,a=.14,b=.15)=>Math.min(1,clamp(k/a),clamp((1-k)/b));
const validColor=color=>/^#[0-9a-f]{6}$/i.test(color||'')?color:'#9cecff';

// Pure, bounded planner: combatant, donor and even an unrelated donor can all have
// their own cut-in, but a pressured scene renders only the highest-priority one.
export function duelCutinPlan(match,serverNow,gifts=[],performanceNow=0,light=false){
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

export function duelChargingPose(match,actor,serverNow){
 if(!match||!actor)return null;
 const lead=((Number(match.aura?.[match.a])||0)-(Number(match.aura?.[match.b])||0))/100;
 const cast=duelCastState(Math.max(0,serverNow-match.startedAt),lead);
 if(!cast.ready||cast.k>=DUEL_RELEASE_AT||actor.id!==(cast.side?match.b:match.a))return null;
 const u=clamp(cast.k/DUEL_RELEASE_AT),power=cast.ultimate?1:.75;
 return {mode:'cast',stand:1,left:-power*(.48+.28*u),right:power*(.45+.5*u),
  head:-.045*u,lean:-.055*power,cloth:2.5*u,lift:-4*u,energy:u,phase:u,step:0};
}

export function drawDuelCinematic(scene,c,t,H,serverNow=Date.now()){
 if(scene.cinematicV2===false||scene.socialScene!=='tournament')return 0;
 const match=scene.socialStatus?.tournament?.current;if(!match)return 0;
 const light=!!(scene.budget?.pressured||scene.budget?.level==='light'||(scene.fps>0&&scene.fps<18));
 const gifts=scene.eventGiftQueue?.activeRows||[];
 const cues=duelCutinPlan(match,serverNow,gifts,t,light);
 if(!cues.length)return 0;
 const reducedFlash=!!scene.reduceFlash,reducedMotion=scene.motion===false;
 const height=Math.min(154,Math.max(112,H*.097)),spacing=height+10;
 c.save();c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 const darkness=Math.min(.55,Math.max(...cues.map(e=>(e.ultimate?.46:.30)*fadeInOut(e.progress,.10,.15))));
 c.globalAlpha=darkness;c.fillStyle='#020713';
 c.fillRect(0,H*.19,900,H*.57);
 for(let i=0;i<cues.length;i++){
  const cue=cues[i],u=cue.progress,opacity=fadeInOut(u,.18,.18),y=H*.34+(i-(cues.length-1)/2)*spacing;
  const xShift=reducedMotion?0:(1-clamp(u/.24))**3*(cue.side===1?130:-130);
  const color=cue.color,actor=scene.targets?.find(a=>a.id===cue.user);
  c.save();c.globalAlpha=opacity;c.translate(xShift,0);
  c.beginPath();
  c.moveTo(6,y-height*.35);c.lineTo(900,y-height*.55);
  c.lineTo(900,y+height*.35);c.lineTo(6,y+height*.56);c.closePath();
  c.save();c.clip();
  const bg=c.createLinearGradient(0,y-height/2,900,y+height/2);
  bg.addColorStop(0,'#080e25');bg.addColorStop(.47,color+'b0');bg.addColorStop(1,'#070b1b');
  c.fillStyle=bg;c.fillRect(0,y-height*.65,900,height*1.4);
  // Portrait is cached by the existing character-art system. Real donor portraits
  // are preloaded by the existing gift queue; no network work inside this draw.
  const portrait=actor?.player?portraitCanvas(scene,actor.player):donorPortrait(cue.avatar);
  if(portrait){
   const px=cue.side===1?675:18,w=205,h=height*1.68;
   if(actor?.player)c.drawImage(portrait,px,y-height*.85,w,h);
   else{
    const sz=Math.min(portrait.naturalWidth||w,portrait.naturalHeight||h);
    c.drawImage(portrait,((portrait.naturalWidth||sz)-sz)/2,((portrait.naturalHeight||sz)-sz)/2,sz,sz,px,y-height*.73,h*.93,h*.93);
   }
  }
  c.globalAlpha=.22*opacity;c.strokeStyle='#ffffff';c.lineWidth=3;
  for(let j=0;j<(light?3:7);j++){
   const yy=y-height*.4+j*height/(light?3:7),x=((j*157+(reducedMotion?0:u*310))%850);
   c.beginPath();c.moveTo(x,yy);c.lineTo(x+60,yy-8);c.stroke();
  }
  c.restore();
  c.globalAlpha=opacity;c.strokeStyle=color;c.lineWidth=4;c.beginPath();
  c.moveTo(6,y-height*.35);c.lineTo(900,y-height*.55);c.moveTo(6,y+height*.56);c.lineTo(900,y+height*.35);c.stroke();
  const right=cue.side===1,tx=right?395:500,width=right?455:490;
  c.textAlign='center';c.textBaseline='middle';
  c.font='800 15px "Segoe UI",sans-serif';c.fillStyle='#fff1c3';
  c.fillText(cue.kind==='gift'?'QUÀ TRỢ CHIẾN · '+cue.value.toLocaleString('vi-VN')+' COIN':cue.ultimate?'TUYỆT KỸ ĐỘT PHÁ':'CHIÊU THỨC',tx,y-height*.21,width);
  c.shadowBlur=0;c.font='900 '+(cue.ultimate?34:28)+'px "Segoe UI",sans-serif';
  c.strokeStyle='#080d23';c.lineWidth=5;c.strokeText(cue.title,tx,y+3,width);
  c.fillStyle='#ffffff';c.fillText(cue.title,tx,y+3,width);
  c.font='700 17px "Segoe UI",sans-serif';c.fillStyle='#ffefba';
  c.fillText(actor?.player?.name||cue.name,tx,y+height*.29,width);
  c.restore();
 }
 c.restore();return cues.length;
}
