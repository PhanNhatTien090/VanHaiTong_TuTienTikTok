export const roseDelay=(random=Math.random)=>180000+Math.floor(Math.max(0,Math.min(1,random()))*120000);
export function tickPuppetRoses(w,now,send,random=Math.random){
 if(w.mode==='live')return;
 const due=[];for(const p of Object.values(w.players)){
  if(!p.puppet||p.resident)continue;
  if(p.puppetKeep===false||p.puppetAutoRose===false){p.puppetRoseAt=null;continue;}
  if(!Number.isFinite(p.puppetRoseAt)||p.puppetRoseAt<=0)p.puppetRoseAt=now+roseDelay(random);
  else if(p.puppetRoseAt<=now)due.push(p);
 }
 if(now<(w.nextPuppetRoseAt||0)||!due.length)return;
 due.sort((a,b)=>a.puppetRoseAt-b.puppetRoseAt||a.id.localeCompare(b.id));const p=due[0];
 const seq=(p.puppetRoseSequence||0)+1;p.puppetRoseSequence=seq;p.puppetRoseAt=now+roseDelay(random);w.nextPuppetRoseAt=now+8000;
 send({type:'gift',userId:p.id,name:p.name,giftName:'Rose',coins:1,count:1,eventId:'auto-rose:'+p.id+':'+seq,simulated:true,autoRose:true},now);
}
