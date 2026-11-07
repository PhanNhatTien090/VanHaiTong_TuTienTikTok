// Persist unused opportunity credit on the player, not on a five-minute event.
import {dailyAscensionView,recordDailyAscension} from './daily-practice.mjs';
function creditBank(p){
 if(!p.opportunityCredit||!Number.isSafeInteger(p.opportunityCredit.balance)||p.opportunityCredit.balance<0)p.opportunityCredit={balance:0};
 return p.opportunityCredit;
}
export function opportunityProgress(p,event){
 const bank=creditBank(p);event.players??={};
 if(!Object.hasOwn(event.players,p.id))Object.defineProperty(event.players,p.id,{value:{received:0,spent:0,breakthroughs:0},enumerable:true,writable:true,configurable:true});
 const progress=event.players[p.id];
 if(!progress.creditBankV2){
  const legacy=Math.max(0,(Number(progress.received)||0)-(Number(progress.spent)||0));
  if(Number.isSafeInteger(legacy))bank.balance+=legacy;
  progress.creditBankV2=true;progress.carried=bank.balance;
 }
 return {bank,progress};
}
export function preserveOpportunityCredit(w,event){
 if(!event?.players)return;
 for(const id of Object.keys(event.players)){const p=w.players[id];if(p&&!p.resident&&!p.puppet)opportunityProgress(p,event);}
}
export function addOpportunityCredit(p,event,coins){
 const {bank,progress}=opportunityProgress(p,event);bank.balance+=coins;progress.received+=coins;
}
export function spendOpportunityCredit(w,p,event,now,maxRealm,eligible){
 const {bank,progress}=opportunityProgress(p,event),from=p.realm;
 while(p.realm<maxRealm&&eligible(p)&&!dailyAscensionView(w,p,now).exhausted){
  const cost=event.costs[p.realm];if(!Number.isSafeInteger(cost)||cost<1||bank.balance<cost)break;
  recordDailyAscension(w,p,now);bank.balance-=cost;progress.spent+=cost;progress.breakthroughs++;p.realm++;p.readyRealm=null;
 }
 return {from,to:p.realm,tiers:p.realm-from,balance:bank.balance};
}
