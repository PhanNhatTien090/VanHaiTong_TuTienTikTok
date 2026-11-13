export const HALL_WEEK_MS=7*86400000;
export const hallWeekAt=now=>Math.floor((now+7*3600000+3*86400000)/HALL_WEEK_MS);
export const hallWeekStart=week=>week*HALL_WEEK_MS-7*3600000-3*86400000;
export const HALL_WEEK_PRIZES=[{qi:2500,stones:300,herbs:30},{qi:1600,stones:200,herbs:20},{qi:1000,stones:120,herbs:12}];
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
export function settleHallWeek(w,s,now,defs){
 const next=hallWeekAt(now);if(s.week===next)return;
 s.weekHistory??=[];s.weeklyPending??=[];
 if(!s.weekHistory.some(e=>e.week===s.week)){
  const members=Object.entries(s.members).filter(([id,m])=>real(w.players[id])&&m.week===s.week&&(m.weekPoints||0)>0);
  const standings=s.halls.map((h,index)=>({index,name:defs[index].name,color:defs[index].color,points:h.points||0,activity:{...(h.weekActivity||{})},battlePoints:h.battlePoints||0,elder:h.elder,contributors:members.filter(([,m])=>m.index===index).map(([id,m])=>({id,name:w.players[id].name,points:m.weekPoints,activity:{...(m.weekActivity||{})}})).sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id)).slice(0,100)})).sort((a,b)=>b.points-a.points||b.battlePoints-a.battlePoints||a.index-b.index);
  const record={week:s.week,startedAt:hallWeekStart(s.week),endsAt:hallWeekStart(s.week+1),settledAt:now,standings,rewarded:0};
  s.weekHistory.push(record);s.weekHistory=s.weekHistory.slice(-26);
  for(const [rank,hall] of standings.slice(0,3).entries()){
   if(!hall.points)continue;
   for(const [id,m] of members.filter(([,m])=>m.index===hall.index)){
    s.weeklyPending.push({week:s.week,id,index:hall.index,rank:rank+1,...HALL_WEEK_PRIZES[rank],leaderBonus:rank===0&&hall.elder===id?200:0,points:m.weekPoints});
   }
  }
  s.champion=s.week===next-1&&standings[0]?.points>0?standings[0].index:null;
 }
 s.week=next;
 for(const hall of s.halls){hall.points=0;hall.weekActivity={};hall.battlePoints=0;}
}
export function payHallWeeklyRewards(w,s,now,ctx,defs){
 if(!ctx.gain||!s.weeklyPending?.length)return;
 const pending=s.weeklyPending;s.weeklyPending=[];
 for(const row of pending){
  const p=w.players[row.id];if(!real(p))continue;
  if(w.playTransfers?.[p.id]?.phase==='web'){s.weeklyPending.push(row);continue;}
  p.hallWeeklyClaims??=[];const key=row.week+':'+row.index;if(p.hallWeeklyClaims.some(r=>r.key===key))continue;
  const qi=ctx.gain(w,p,row.qi,row.stones+row.leaderBonus,row.herbs,now);
  const claim={...row,key,at:now,qi};p.hallWeeklyClaims.push(claim);p.hallWeeklyClaims=p.hallWeeklyClaims.slice(-26);
  const history=s.weekHistory?.find(e=>e.week===row.week);if(history)history.rewarded++;
  ctx.emit(w,p,'THƯỞNG NGŨ ĐƯỜNG TUẦN • '+defs[row.index].name+' hạng '+row.rank+' • +'+qi+' tu vi, +'+(row.stones+row.leaderBonus)+' linh thạch','title',now,{hallWeeklyAward:true,hallIndex:row.index,hallWeeklyRank:row.rank,reward:{qi,stones:row.stones+row.leaderBonus,herbs:row.herbs}});
 }
}
export function hallWeeklyView(s,now){return {week:s?.week??hallWeekAt(now),startsAt:hallWeekStart(s?.week??hallWeekAt(now)),endsAt:hallWeekStart((s?.week??hallWeekAt(now))+1),timezone:'Asia/Ho_Chi_Minh',history:(s?.weekHistory||[]).slice(-8).reverse(),prizes:HALL_WEEK_PRIZES,minimumContribution:1};}
