import {VISITOR_GIFT_REWARDS,reconcileVisitorPricing} from './public/visitor-rewards.js';
export function repairVisitorHistory(w,now,imported=[]){
 for(const row of imported.slice(-100)){
  if(!row?.id||!VISITOR_GIFT_REWARDS[row.kind]||!Number.isFinite(row.startedAt)||!Number.isFinite(row.endsAt))continue;
  const current=[...(w.visitorArchive||[]),w.visitor].find(e=>e?.id===row.id);
  const merged=structuredClone(current||{id:row.id,kind:row.kind,startedAt:row.startedAt,endsAt:row.endsAt,closedAt:row.closedAt,provenance:'backup',sources:row.sources||[]});
  merged.giftProgress??={};merged.observed??={};
  for(const [id,g]of Object.entries(row.giftProgress||{})){
   if(!w.players[id]||!Number.isSafeInteger(g.coins)||g.coins<0)continue;
   if((merged.giftProgress[id]?.coins||0)<g.coins)merged.giftProgress[id]={...g};
  }
  if(w.visitor?.id===merged.id)w.visitor.giftProgress=merged.giftProgress;
  archiveVisitor(w,merged);
 }
 const events=new Map((w.visitorArchive||[]).map(e=>[e.id,e]));if(w.visitor)events.set(w.visitor.id,w.visitor);
 const repairs=[];
 for(const e of events.values())for(const {player:p,reward:r}of reconcileVisitorPricing({...w,visitor:e},now)){
  const row={eventId:e.id,kind:e.kind,user:p.id,name:p.name,coins:r.coins,skinNames:r.skinNames,items:r.items};
  auditRecord(w,'visitor-repair',now,row);repairs.push(row);
 }
 // Old crafting code could replace an already owned visitor outfit. Restore
 // only this known automatic override; never change an explicit user/admin choice.
 for(const p of Object.values(w.players)){
  if(p.resident||p.puppet||p.skinChoiceSource!=='craft')continue;
  const skin=[...(p.rewardSkins||[])].reverse().find(id=>Object.values(VISITOR_GIFT_REWARDS).some(r=>r.skin===id));
  if(!skin||p.skinChoice===skin)continue;
  const old=p.skinChoice;p.skinChoice=skin;p.skinChoiceSource='visitor';
  const row={user:p.id,name:p.name,from:old,skin,reason:'automatic-craft-override'};
  auditRecord(w,'visitor-skin-restored',now,row);repairs.push(row);
 }
 return repairs;
}
export function auditRecord(w,type,at,details={}){
 w.auditSeq=(w.auditSeq||0)+1;
 (w.auditOutbox??=[]).push({seq:w.auditSeq,type,at,...details});
}
export function noteVisitorParticipant(w,p,now){
 const e=w.visitor;if(!e||e.closedAt||now<e.startedAt||now>=e.endsAt||p.resident||p.puppet)return;
 e.observed??={};if(!Object.hasOwn(e.observed,p.id))e.observed[p.id]={name:p.name,firstSeenAt:now};
}
export function archiveVisitor(w,e=w.visitor){
 if(!e?.id)return;
 const row=structuredClone({id:e.id,kind:e.kind,startedAt:e.startedAt,endsAt:e.endsAt,closedAt:e.closedAt,
  observed:e.observed||{},giftProgress:e.giftProgress||{},provenance:e.provenance,sources:e.sources});
 w.visitorArchive??=[];const i=w.visitorArchive.findIndex(x=>x.id===e.id);
 if(i>=0)w.visitorArchive[i]=row;else w.visitorArchive.push(row);
 w.visitorArchive.sort((a,b)=>a.startedAt-b.startedAt);w.visitorArchive=w.visitorArchive.slice(-100);
}
export function visitorAuditView(w,id){
 const events=new Map((w.visitorArchive||[]).map(e=>[e.id,e]));if(w.visitor)events.set(w.visitor.id,w.visitor);
 const list=[...events.values()].sort((a,b)=>b.startedAt-a.startedAt),e=events.get(id)||list[0],r=VISITOR_GIFT_REWARDS[e?.kind];
 return {events:list.map(e=>({id:e.id,kind:e.kind,startedAt:e.startedAt,endsAt:e.endsAt})),event:e&&r?{
  id:e.id,kind:e.kind,startedAt:e.startedAt,endsAt:e.endsAt,closedAt:e.closedAt,skinCoins:r.skinCoins,artifactCoins:r.artifactCoins,
  provenance:e.provenance||'server',rows:[...new Set([...Object.keys(e.observed||{}),...Object.keys(e.giftProgress||{})])].map(id=>{
   const p=w.players[id],g=e.giftProgress?.[id],coins=g?.coins||0;
   return {id,name:p?.name||e.observed?.[id]?.name||id,coins,simulated:!!(p?.resident||p?.puppet),
    skinEarned:coins>=r.skinCoins,artifactEarned:coins>=r.artifactCoins,
    skinOwned:!!p?.rewardSkins?.includes(r.skin),artifactOwned:!!p?.artifacts?.includes(r.artifact),wearing:p?.skinChoice===r.skin};
  }).sort((a,b)=>b.coins-a.coins||a.id.localeCompare(b.id))}:null};
}
