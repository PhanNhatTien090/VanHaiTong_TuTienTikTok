import {tributeProfile} from './gift-tribute.js';
import {smallGift} from './live-cinema.js';
import {petArrivalProfile} from './pet-arrival-fx.js';
import {luxuryTier} from './luxury-fx.js';
import {breakthroughDuration,breakthroughRealm} from './breakthrough-fx.js';
export const presentationPriority=e=>e.achieve&&!e.gift&&!e.resident?3:e.gift&&!e.resident?(luxuryTier(e)?8.5:8):e.heavenStrike?7:e.ceremony?6:e.autoArrival?2.5:e.petAward?(petArrivalProfile(e)?.vip?3.5:2.5):e.eventGiftFx?3:luxuryTier(e)?5:e.transform?4:e.effect==='breakthrough'?4+breakthroughRealm(e)/100:e.gift||e.loyaltyAward||e.bossChampion?3:['skin','victory','opportunity','blessing','status','hint','ready','title','flower','visitor','tournament','bond','social'].includes(e.effect)?2:1;
export function presentationDuration(e){if(e.card)return 5200; // 11/11: Linh Bài đạo hữu
 if(e.hallCard)return 6500;
 if(e.achieve&&!e.gift)return 4200; // 11/11: Ngọc Giản Báo Hỷ
 if(smallGift(e))return tributeProfile(e)?.duration||2200;if(e.newcomerWelcome)return 3600;if(e.petAward)return petArrivalProfile(e)?.duration||2600;if(e.ceremony)return 12000;if(e.heavenStrike)return 7600;if(e.eventGiftFx&&!e.gift)return 1400;const vip=luxuryTier(e);return vip?.duration||e.technique?.duration||(e.transform?6000:e.flowerRank?7000:e.flowerStart?4000:e.effect==='breakthrough'?breakthroughDuration(e):e.gift?tributeProfile(e)?.duration||4500:presentationPriority(e)>=2?2400:1100);}
// Visual admission only. Server rewards are already committed before events reach this queue.
export class PresentationQueue{
 constructor(limit=12){this.limit=limit;this.items=[];this.coalesced=0;this.startedRituals=new Map();}
 push(event,now=Date.now()){
  this.prune(now);
  if(event.effect==='breakthrough'&&event.id&&this.startedRituals.has(event.id))return false;
  if(this.items.some(e=>e.id===event.id))return false;
  const p=presentationPriority(event),i=this.items.findIndex(e=>e.user===event.user&&e.effect===event.effect&&(p===1&&presentationPriority(e)===1||event.effect==='breakthrough'));
  if(i>=0&&event.effect==='breakthrough'){const old=this.items[i];this.items[i]={...old,...event,fromRealm:old.fromRealm,visualFrom:old.visualFrom,_queuedAt:old._queuedAt};this.coalesced++;return true;}
  const entry={...event,_queuedAt:now};if(i>=0){this.items[i]=entry;this.coalesced++;}else this.items.push(entry);
  this.items.sort((a,b)=>presentationPriority(b)-presentationPriority(a)||a._queuedAt-b._queuedAt);
  if(this.items.length>this.limit){const dropped=this.items.pop();this.coalesced++;return dropped!==entry;}
  return true;
 }
 start(event,now=Date.now()){
  if(event.effect!=='breakthrough'||!event.id)return true;
  if(this.startedRituals.has(event.id))return false;
  this.startedRituals.set(event.id,now);
  while(this.startedRituals.size>256)this.startedRituals.delete(this.startedRituals.keys().next().value);
  return true;
 }
 prune(now){
  for(const [id,at] of this.startedRituals){
   if(now-at<600000)break;
   this.startedRituals.delete(id);
  }
  for(let i=this.items.length-1;i>=0;i--){const e=this.items[i];if(e.skyPresentationUntil&&now+presentationDuration(e)>e.skyPresentationUntil||now-e._queuedAt>(e.effect==='breakthrough'?600000:presentationPriority(e)>=3?180000:20000)){this.items.splice(i,1);this.coalesced++;}}}
 take(now=Date.now(),allowed=()=>true){this.prune(now);const eligible=this.items.map((e,i)=>({e,i})).filter(x=>allowed(x.e));if(!eligible.length)return;const overdue=eligible.filter(x=>now-x.e._queuedAt>=12000).sort((a,b)=>a.e._queuedAt-b.e._queuedAt);return this.items.splice((overdue[0]||eligible[0]).i,1)[0];}
}
