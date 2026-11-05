// Rewards use received likeCount increments, independently of the XP cooldown.
export const HEART_STEPS=Object.freeze([50,150,300]);
const own=(map,id)=>Object.hasOwn(map,id)?map[id]:0;
function put(map,id,value){Object.defineProperty(map,id,{value,enumerable:true,writable:true,configurable:true});}
export function heartTarget(w,now,perPlayer=30,min=100,max=1000){
  const active=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&now-p.lastActive<300000).length;
  return Math.min(max,Math.max(min,Math.ceil(active*perPlayer/50)*50));
}
export function flowerHearts(w,p,count,now,c){
  const e=w.flowerEvent;if(!e||e.closedAt||now<e.startedAt||now>=e.endsAt||p.resident||p.puppet)return;
  const scores=e.heartScores??={},claims=e.heartClaims??={};
  const score=own(scores,p.id)+count;put(scores,p.id,score);
  e.heartTotal=(e.heartTotal||0)+count;
  e.heartTarget??=heartTarget(w,now,100,300,3000);
  let level=own(claims,p.id),qi=0,stones=0;
  while(level<HEART_STEPS.length&&score>=HEART_STEPS[level]){qi+=[20,40,80][level];stones+=[5,10,20][level];level++;}
  if(qi){put(claims,p.id,level);const got=c.gain(w,p,qi,stones,0);
    c.emit(w,p,`MỐC TIM ${HEART_STEPS[level-1]} • +${got} tu vi, ${stones} linh thạch`,'petal',now,{heartMilestone:HEART_STEPS[level-1],reward:{qi:got,stones}});}
  if(!e.heartBloom&&e.heartTotal>=e.heartTarget){
    e.heartBloom=true;
    for(const id of Object.keys(scores)){const q=w.players[id];if(q)c.gain(w,q,60,15,2);}
    c.emit(w,null,`HOA TÂM KHAI NỞ • ${e.heartTarget} tim • mọi người đã góp tim nhận 60 tu vi, 15 linh thạch, 2 linh thảo`,'flower',now,{heartBloom:true,eventKind:e.kind});
  }else if(e.heartBloom&&own(scores,p.id)===count)c.gain(w,p,60,15,2);
}
export function finishFlowerHearts(w,e,now,c){
  if(e.heartAwarded)return;e.heartAwarded=true;
  e.heartResults=Object.entries(e.heartScores||{}).filter(([id,n])=>w.players[id]&&!w.players[id].resident&&!w.players[id].puppet&&n>=50)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,3).map(([id,count],i)=>{
      const p=w.players[id],qi=c.gain(w,p,[300,180,100][i],[60,40,25][i],3);
      c.emit(w,p,`HỘ PHÁP TIM hạng ${i+1} • ${count} tim • +${qi} tu vi`,'flower',now,{heartRank:i+1,heartCount:count,reward:{qi},eventKind:e.kind});
      return {id,name:p.name,count,qi};
    });
}
export function bossHearts(w,p,count,now,c){
  const b=w.boss;if(!b||b.hp<=0||now>=b.endsAt||p.resident||p.puppet)return;
  const h=b.hearts??={count:0,target:heartTarget(w,now,20,100,500),strikes:0,limit:6};
  if(h.strikes>=h.limit)return;
  b.participants[p.id]=true;h.count+=count;
  let damage=0,charges=0;
  while(h.count>=h.target&&h.strikes<h.limit&&b.hp>0){
    h.count-=h.target;h.strikes++;charges++;
    const d=Math.min(b.hp,Math.max(1,Math.floor(b.maxHp*.05)));b.hp-=d;damage+=d;
  }
  if(charges){c.emit(w,null,`KIẾM TRẬN TIM • ${charges} đòn • ${damage} sát thương • ${h.strikes}/${h.limit} trận`,'attack',now,{heartStrike:true,damage});if(!b.hp)c.win(w,now);}
}
