import {drawDuelGiftStrike,drawDuelCutIn} from './duel-combat.js';
import {drawGiftDonor,donorPortrait} from './gift-donor.js';
import {drawSpiritGift,loadSpiritBeasts} from './gift-spirit-beasts.js';
import {giftCameraImpulse,boundedCameraJolt,feedbackBudget,takeFeedbackCue} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
export const EVENT_GIFT_TIERS=Object.freeze([
 {min:1,cell:0,color:'#9deaff',name:'Linh Phong',duration:1500,waves:1,blades:2,size:110},
 {min:30,cell:1,color:'#91ffc9',name:'Thanh Trúc',duration:1900,waves:1,blades:4,size:135},
 {min:100,cell:2,color:'#ffda88',name:'Phượng Dực',duration:2400,waves:2,blades:6,size:160},
 {min:500,cell:3,color:'#ff6178',name:'Xích Phượng',duration:2900,waves:2,blades:8,size:190},
 {min:700,cell:4,color:'#bd91ff',name:'Tử Long',duration:3300,waves:3,blades:10,size:210},
 {min:1000,cell:4,color:'#dcc2ff',name:'Long Phượng',duration:3700,waves:4,blades:12,size:230},
 {min:1500,cell:5,color:'#ffc27a',name:'Song Long',duration:4100,waves:5,blades:14,size:250},
 {min:2000,cell:5,color:'#fff0b1',name:'Long Phượng Đế Uy',duration:4500,waves:6,blades:16,size:280}
]);
export function eventGiftTier(value){value=Number(value);if(!Number.isFinite(value)||value<=0)return null;let q=EVENT_GIFT_TIERS[0];for(const x of EVENT_GIFT_TIERS)if(value>=x.min)q=x;const extra=value>=10000?2:value>=5000?1:0;return {...q,duration:q.duration+extra*350,blades:q.blades+extra*2,waves:q.waves+extra};}
export function sliceEventGiftAtlas(im,factory=makeSurface,size=256){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;return Array.from({length:6},(_,i)=>{const f=factory(size,size);f?.getContext('2d').drawImage(im,i%3*w/3,Math.floor(i/3)*h/2,w/3,h/2,2,2,size-4,size-4);return f;});}
export function loadEventGiftArt(scene){if(scene.eventGiftArt||scene.eventGiftLoading||scene.eventGiftRetry>Date.now()||typeof Image==='undefined')return;scene.eventGiftLoading=true;Promise.all(['race','duel'].map(kind=>new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{const frames=sliceEventGiftAtlas(im);im=null;resolve(frames);};im.onerror=reject;im.src='/assets/event-gift-v1/'+kind+'.png';}))).then(([race,duel])=>{scene.eventGiftArt={race,duel};scene.eventGiftLoading=false;}).catch(()=>{scene.eventGiftLoading=false;scene.eventGiftRetry=Date.now()+15000;});}
export class EventGiftQueue{
 constructor(){this.seen=new Set();this.pending=[];this.active=null;this.context=null;}
 sync(context,rows,serverNow){if(context!==this.context){this.context=context;this.pending=[];this.active=null;}if(!context)return;for(const row of rows||[]){if(this.seen.has(row.id))continue;this.seen.add(row.id);if(serverNow-row.at>15000||row.at>serverNow+2000||!eventGiftTier(row.value))continue;
  const same=this.pending.find(e=>e.user===row.user&&(row.comboKey?e.comboKey===row.comboKey&&e.gift===row.gift:e.value<100&&row.value<100&&Math.abs(e.at-row.at)<1200));if(same){same.value+=row.value;same.count=(same.count||1)+(row.count||1);same.at=row.at;same.comboFinal=row.comboFinal;if(row.comboKey)same.readyAt=Math.min(same.firstAt+20000,performance.now()+1500);}else this.pending.push({...row,firstAt:performance.now(),readyAt:row.comboKey?performance.now()+1500:0});}
  while(this.seen.size>256)this.seen.delete(this.seen.values().next().value);this.pending=this.pending.filter(e=>serverNow-e.at<15000).sort((a,b)=>b.value-a.value||a.at-b.at).slice(0,8);
 }
 sample(t){if(this.active&&t-this.active.start>=this.active.profile.duration)this.active=null;if(!this.active&&this.pending.length){const index=this.pending.findIndex(e=>!e.readyAt||e.comboFinal||performance.now()>=e.readyAt);if(index<0)return null;const [row]=this.pending.splice(index,1);this.active={...row,start:t,profile:eventGiftTier(row.value)};}return this.active;}
}
export function syncEventGiftFx(scene,state){const race=state.raceStatus,match=state.socialStatus?.tournament?.current,context=race?.active&&race.phase==='running'?'race:'+race.id:state.socialScene==='tournament'&&match?'duel:'+match.id:null;
 const rows=(context?.startsWith('race:')?race.giftFx:match?.giftFx)||[],players=new Map(state.players.map(p=>[p.id,p]));
 (scene.eventGiftQueue??=new EventGiftQueue()).sync(context,rows.map(e=>{const p=players.get(e.user);const row={...e,avatar:p?.avatar||e.avatar,name:p?.name||e.name};donorPortrait(row.avatar);return row;}),state.serverNow||Date.now());if(scene.eventGiftQueue.pending.length){loadEventGiftArt(scene);if(scene.eventGiftQueue.pending.some(e=>e.value>=500))loadSpiritBeasts(scene);}
}
function img(c,im,x,y,w,h,rot=0,alpha=1,flip=false){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(rot);if(flip)c.scale(-1,1);c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
function flowingSprite(c,im,x,y,w,h,time,alpha){if(!im)return;c.save();c.globalAlpha*=alpha;for(let i=0;i<6;i++){const u=i/6,shift=Math.sin(time*.011-u*8)*w*.035*u;c.drawImage(im,0,i*im.height/6,im.width,im.height/6,x-w/2+shift,y-h/2+i*h/6,w,h/6+1);}c.restore();}
export function eventGiftImpulse(scene,t){return giftCameraImpulse(scene,scene.eventGiftQueue?.active,t);}
export function drawEventGiftFx(scene,c,t,layer,mode){const e=scene.eventGiftQueue?.sample(t);if(!e||e.mode!==mode)return false;const q=e.profile,raw=clamp((t-e.start)/q.duration),k=scene.motion?raw:.45,time=scene.motion?t-e.start:0,fade=clamp(Math.min(k/.1,(1-k)/.18)),open=ease(k/.22),targets=scene.targets||[],caster=targets.find(a=>a.id===e.user),H=scene.height,light=feedbackBudget(scene),art=scene.eventGiftArt?.[mode];
 if(!fade)return true;const a=caster||{x:450,y:H*.32,scale:1.5},x=a.x,y=a.y,s=a.scale/1.5,im=art?.[q.cell];
 if(layer==='back'&&takeFeedbackCue(e,'castStarted',raw,0,.22)){if(caster){scene.animator?.trigger({id:'event-gift:'+e.id,user:e.user,effect:mode==='race'?'dragon':'attack',gift:'quà'},t);const action=scene.animator?.actions.get(e.user);if(action)action.duration=q.duration;}scene.onEventGiftSound?.(e.value>=500?'dragon':'sword',mode);}
 if(layer==='front'&&takeFeedbackCue(e,'impactSound',raw,.3,.43)&&e.value>=500)scene.onSpectacleImpact?.();
 c.save();c.globalAlpha=fade;
 if(layer==='back')drawSpiritGift(c,e.value,k,a,H,{art:scene.spiritBeasts,time,light,motion:scene.motion,mode});
 if(mode==='race'){
  const lane=900/Math.max(2,targets.length),w=Math.min(q.size*s,lane*(e.value>=500?2:1.35)),h=(220+q.blades*9)*s;
  if(layer==='back'){
   // Nitro art tracks the moving racer; pulsing width and oscillating segments make a flowing exhaust.
   flowingSprite(c,im,x+Math.sin(time*.005)*4,y+65*s,w*open*(1+Math.sin(time*.009)*.045),h*(.75+.25*open),time,.94);
   if(e.value>=500)for(const side of [-1,1])img(c,im,x+side*w*.38,y+80*s+Math.sin(time*.006+side)*15,w*.55,h*.78,side*.22,.32);
   const n=Math.min(light?10:18,q.blades);c.strokeStyle=q.color;c.lineWidth=1.4;for(let i=0;i<n;i++){const u=(k*3+i/n)%1,xx=x+Math.sin(i*2.399)*w*.55,yy=y-160*s+u*h*1.5;c.globalAlpha=fade*(1-u)*.75;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy+35+q.blades*3);c.stroke();}
   if(!im){c.strokeStyle=q.color;c.lineWidth=8;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h*open);c.stroke();}
  }else{
   c.strokeStyle=q.color;for(let i=0;i<Math.min(q.waves,light?5:8);i++){const u=(k*2-i*.13);if(u<=0||u>=1)continue;c.globalAlpha=fade*(1-u);c.lineWidth=3;c.beginPath();c.ellipse(x,y-90*s-u*100,25+u*w*.65,10+u*36,0,Math.PI,TAU);c.stroke();}
   const n=Math.min(light?8:12,q.blades);for(let i=0;i<n;i++){const u=(k*2.4+i/n)%1,side=i%2?1:-1;img(c,im,x+side*w*(.34+(i%3)*.09),y+u*h-70*s,22+q.blades,70+q.blades*3,side*.1,fade*Math.sin(u*Math.PI)*.75);}
  }
 }else{
  const enemy=caster&&targets.find(p=>p.id!==a.id),to=enemy||{x:450,y:y-100},side=to.x>=x?1:-1;
  if(layer==='back'){
   if(im)img(c,im,x-side*40,y-65,q.size*open,q.size*.7,-side*.25,.44);
   else {c.strokeStyle=q.color;c.lineWidth=3;c.beginPath();c.ellipse(x,y+25,80*open,20*open,0,0,TAU);c.stroke();}
  }else{
   drawDuelGiftStrike(c,{x,y:y-90,toX:to.x,toY:to.y-90,k,color:q.color,power:Math.min(2,.7+q.blades/10),light});
   if(e.value>=500&&caster?.player)drawDuelCutIn(scene,c,caster,{name:q.name+' · GIÁNG THẾ',color:q.color},k,H,{gift:true});
   for(let wave=0;wave<Math.min(light?6:8,q.waves);wave++){
    const u=clamp((k-.10-wave*.085)/.30);if(u<=0||u>=1)continue;const travel=ease(u),xx=x+(to.x-x)*travel,yy=y-90+(to.y-y)*travel-Math.sin(u*Math.PI)*(35+wave*14),w=q.size*(.55+Math.sin(u*Math.PI)*.4);
    img(c,im,xx,yy,w,w*.74,Math.sin(u*Math.PI)*side*.14,Math.sin(u*Math.PI)*.90,side<0);
    if(!im){c.strokeStyle=q.color;c.lineWidth=6;c.beginPath();c.moveTo(xx-side*65,yy);c.lineTo(xx,yy);c.stroke();}
    // The contact wave expands from the opponent, without changing authoritative HP or scores.
    if(u>.55){const hit=(u-.55)/.45;c.strokeStyle=q.color;c.globalAlpha=fade*(1-hit);c.lineWidth=4;c.beginPath();c.ellipse(to.x,to.y-65,20+hit*q.size*.5,35+hit*q.size*.45,0,0,TAU);c.stroke();c.globalAlpha=fade;}
   }
  }
 }
 if(layer==='front'){
  const n=Math.min(light?12:20,q.blades);c.fillStyle=q.color;for(let i=0;i<n;i++){const u=(k*1.7+i/n)%1,xx=x+Math.cos(i*2.399)*(25+u*q.size*.55),yy=y+20+u*u*170;c.globalAlpha=fade*(1-u)*.65;c.fillRect(xx,yy,2,5);}
  c.globalAlpha=fade;drawGiftDonor(c,e,x,Math.max(H*.19,y-(mode==='race'?155*s:205)),{color:q.color,radius:mode==='race'?25:34,width:mode==='race'?200:290,caption:e.value.toLocaleString('vi-VN')+' coin · '+q.name});
  c.globalAlpha=fade;c.font='bold '+(mode==='race'?15:18)+'px Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#101422';c.fillStyle=q.color;const label=(mode==='duel'&&!e.fighter?e.name+' · ':'')+q.name+(mode==='race'?(e.boost?' · BỨT TỐC':' · VINH DANH'):' · CỔ VŨ');const yy=mode==='race'?y+70*s:y+90;c.strokeText(label,x,yy,mode==='race'?170:370);c.fillText(label,x,yy,mode==='race'?170:370);
 }
 c.restore();return true;
}

export const eventGiftCamera=(base,jolt,H)=>boundedCameraJolt(base,jolt,H,true);
