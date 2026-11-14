import {feedbackBudget,takeFeedbackCue} from './cinematic-feedback.js';
import {drawGiftDonor,donorPortrait} from './gift-donor.js';
import {eventGiftTier} from './event-gift-fx.js?v=event-donors-20261114';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const THEMES={bond:['#ffc4e7','TAM SINH DUYÊN','緣'],honor:['#ffe39b','ĐẠI ĐIỂN VINH DANH','尊'],hallwar:['#bbebff','NGŨ ĐƯỜNG TRANH PHONG','戰'],war:['#ffbc87','CHÍNH MA','⚔'],alchemy:['#ffce76','TIẾP LỬA KHAI LÒ','丹'],maze:['#c7b1ff','BÍ CẢNH MÊ CUNG','陣'],race:['#a7ecff','BỨT TỐC PHI KIẾM','剑'],duel:['#a4ffe0','TRỢ LỰC LUẬN KIẾM','剑'],hall:['#ffe7a0','TRỢ LỰC VÂN ĐÀI','功'],bonk:['#ffe49b','HỘI GÕ ĐẦU','⚒'],pet:['#a6ffd2','LINH THÚ CỐC','靈'],visitor:['#ffcfb4','CƠ DUYÊN KHÁCH QUÝ','緣'],flower:['#ffc4ee','THIÊN HOA VŨ','花'],boss:['#9cdfff','HỢP LỰC TRỪ YÊU','⚔'],opportunity:['#d4c0ff','THIÊN ĐẠO CƠ DUYÊN','道'],tower:['#ffe29c','VÂN HẢI THÁP','塔']};
export function eventDonationContext(scene){
 const s=scene.lastState||{},now=s.serverNow||Date.now();
 const candidates=[['hallwar',scene.hallWarStatus,scene.hallWarStatus?.active],['war',scene.warStatus,scene.warStatus?.active],['alchemy',scene.alcStatus,scene.alcStatus?.active],['maze',scene.mazeStatus,!!scene.mazeStatus],['race',scene.raceStatus,scene.raceStatus?.active],['duel',scene.socialStatus?.tournament,scene.socialScene==='tournament'],['hall',scene.hallMatch,scene.hallMatch?.endsAt>now],['pet',scene.petEvent,scene.petEvent?.active&&scene.petEvent.endsAt>now],['visitor',scene.visitor,scene.visitor&&!scene.visitor.closedAt&&scene.visitor.endsAt>now],['flower',s.flowerEvent,s.flowerEvent&&!s.flowerEvent.closedAt&&s.flowerEvent.endsAt>now],['tower',s.tower,s.tower?.active],['boss',s.boss,s.boss?.hp>0&&s.boss.endsAt>now],['opportunity',s.opportunity,s.opportunity?.endsAt>now],['bond',s.socialStatus?.ceremony||s.socialStatus?.festival||s.lanternFestival,!!s.socialStatus?.ceremony||s.socialStatus?.festival?.active||s.lanternFestival?.active],['honor',s,s.honorStageUntil>now],['bonk',scene.bonkFest,scene.bonkFest?.active]];
 const row=candidates.find(([,e,active])=>e&&active);if(!row)return null;
 return {kind:row[0],key:row[0]+':'+(row[1].id||row[1].startedAt||''),theme:THEMES[row[0]]};
}
export function addEventDonation(scene,e,t=performance.now()){
 const context=eventDonationContext(scene),value=(Number(e.coins)||0)*Math.max(1,Number(e.count)||1);
 if(!context||!e.gift||value<=0)return false;
 if(context.kind==='race'&&scene.raceStatus?.phase==='running'||context.kind==='duel'&&scene.socialStatus?.tournament?.current)return true;
 const queue=scene.eventDonations??={key:context.key,pending:[],active:[],seen:new Set()};
 if(queue.key!==context.key){queue.key=context.key;queue.pending=[];queue.active=[];queue.seen.clear();}
 if(queue.seen.has(e.id))return true;queue.seen.add(e.id);while(queue.seen.size>128)queue.seen.delete(queue.seen.values().next().value);
 const p=scene.playerIndex?.get(e.user)||scene.lastState?.players?.find(p=>p.id===e.user);
 const row={...e,value,avatar:p?.avatar||e.avatar,name:p?.name||e.name,context,profile:eventGiftTier(value),receivedAt:t};
 donorPortrait(row.avatar);
 const same=queue.pending.find(p=>p.user===row.user&&p.gift===row.gift&&t-p.receivedAt<1500);
 if(same){same.value+=row.value;same.count=(same.count||1)+(row.count||1);same.profile=eventGiftTier(same.value);same.receivedAt=t;}
 else queue.pending.push(row);
 queue.pending.sort((a,b)=>b.value-a.value||a.receivedAt-b.receivedAt);queue.pending=queue.pending.slice(0,6);
 return true;
}
function sigil(c,x,y,r,angle,color,glyph){
 c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();
 for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(Math.cos(a)*r*.86,Math.sin(a)*r*.86);c.lineTo(Math.cos(a)*r*1.08,Math.sin(a)*r*1.08);c.stroke();}
 c.rotate(-angle);c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font='bold '+Math.round(r*.85)+'px Georgia';c.fillText(glyph,0,0);c.restore();
}
export function drawEventDonations(scene,c,t,H=scene.height){
 const queue=scene.eventDonations,context=eventDonationContext(scene);if(!queue)return;
 if(!context||queue.key!==context.key){queue.pending=[];queue.active=[];return;}
 const light=feedbackBudget(scene),podium=context.kind==='hallwar'&&scene.hallWarStatus?.phase==='finished';queue.active=queue.active.filter(e=>t-e.start<e.profile.duration);
 queue.pending=queue.pending.filter(e=>t-e.receivedAt<12000);
 while(queue.active.length<(light||['hallwar','pet'].includes(context.kind)?1:2)&&queue.pending.length){const e=queue.pending.shift();e.start=t;queue.active.push(e);scene.onEventGiftSound?.(e.value>=500?'dragon':'sword',context.kind);}
 for(const [slot,e] of queue.active.entries()){
  const q=e.profile,raw=clamp((t-e.start)/q.duration),k=scene.motion===false?.45:raw,fade=clamp(Math.min(raw/.09,(1-raw)/.17));
  if(takeFeedbackCue(e,'impactPlayed',raw,.3,.43)&&e.value>=500)scene.onSpectacleImpact?.();
  const [color,title,glyph]=e.context.theme,x=context.kind==='hallwar'?450:450+(slot?115:-40),y=H*(podium?.22:context.kind==='pet'?.73:context.kind==='hallwar'?.425:slot?.34:.245),impactY=H*(context.kind==='pet'?.86:context.kind==='hallwar'?.53:.49),large=e.value>=100;
  c.save();c.globalAlpha=fade;c.lineCap='round';c.lineJoin='round';
  // Avatar is the casting origin; energy travels into the event, without moving its camera or actors.
  if(scene.motion!==false&&!podium){
   const count=light?5:large?12:7;
   for(let i=0;i<count;i++){
    const u=(k*1.7+i/count)%1,side=i%2?-1:1,spread=(32+i*9)*(large?1.15:.7),xx=x+Math.sin(u*Math.PI)*side*spread,yy=y+35+(impactY-y)*u;
    c.globalAlpha=fade*Math.sin(u*Math.PI)*.75;c.strokeStyle=i%3?color:'#fff5d5';c.lineWidth=i%3?2:3;
    c.beginPath();c.moveTo(xx-side*8,yy-22);c.quadraticCurveTo(xx+side*9,yy-5,xx,yy+9);c.stroke();
   }
  }
  if(k>.22&&!podium){
   const hit=clamp((k-.22)/.7),radius=(large?75:42)+hit*(large?105:50);
   c.globalAlpha=fade*(1-hit)*.65;sigil(c,x,impactY,radius,k*TAU*.35,color,glyph);
   if(large){c.beginPath();c.ellipse(x,impactY,radius*1.35,radius*.38,-.15,0,TAU);c.stroke();}
   // The low-cost petal/flame/star burst is local to the impact, never a full-screen flash.
   const n=light?5:Math.min(12,q.blades+4);c.fillStyle=color;
   for(let i=0;i<n;i++){const a=i*2.399,kick=hit*(80+e.profile.waves*12),px=x+Math.cos(a)*kick,py=impactY+Math.sin(a)*kick*.6;
    c.save();c.translate(px,py);c.rotate(a+k);c.beginPath();
    if(e.context.kind==='alchemy'){c.moveTo(0,10);c.bezierCurveTo(-10,0,5,-5,1,-17);c.bezierCurveTo(14,-4,7,7,0,10);}
    else if(['war','hallwar','race','duel','hall','boss'].includes(e.context.kind)){c.moveTo(0,-19);c.lineTo(4,5);c.lineTo(0,9);c.lineTo(-4,5);c.closePath();}
    else if(e.context.kind==='maze'){c.moveTo(0,-10);c.lineTo(8,0);c.lineTo(0,10);c.lineTo(-8,0);c.closePath();}
    else if(e.context.kind==='pet'){c.ellipse(0,3,6,8,0,0,TAU);c.moveTo(-5,-6);c.arc(-5,-6,3,0,TAU);c.moveTo(4,-8);c.arc(4,-8,3,0,TAU);}
    else{c.moveTo(0,-7);c.quadraticCurveTo(6,0,0,9);c.quadraticCurveTo(-4,0,0,-7);}
    c.fill();c.restore();}
  }
  c.globalAlpha=fade;sigil(c,x,y,45+(scene.motion===false?0:Math.sin(k*TAU*3)*3),-k*TAU*.4,color,'');
  drawGiftDonor(c,e,x,y,{radius:34,color,width:slot?250:290,caption:e.value.toLocaleString('vi-VN')+' coin · '+title});
  c.restore();
 }
}

export function majorEventActive(s){
 const now=s?.serverNow||Date.now(),open=e=>e&&!e.closedAt&&e.endsAt>now;
 return !!(s?.mainStage||s?.hallWar?.active||s?.sectWar?.active||s?.alchemy?.active||s?.maze?.active||s?.raceStatus?.active||s?.socialScene||s?.halls?.match?.endsAt>now||s?.tower?.active||open(s?.petEvent)||open(s?.visitor)||open(s?.flowerEvent)||open(s?.opportunity)||s?.boss?.hp>0&&open(s.boss)||s?.honorStageUntil>now||s?.socialStatus?.festival?.active||s?.lanternFestival?.active);
}
