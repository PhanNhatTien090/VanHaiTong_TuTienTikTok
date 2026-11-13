import {HALLS} from './ngu-duong.mjs';
import {stageConflict} from './stage-lock.mjs';
const REGISTER_MS=30000,BATTLE_MS=120000,PODIUM_MS=14000;
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
const fail=message=>({ok:false,message});
export const hallWarVisible=(w,now)=>['registration','running'].includes(w.hallWar?.phase)||w.hallWar?.podiumUntil>now;
const hallOf=(w,id)=>Object.hasOwn(w.nguDuong?.members||{},id)?w.nguDuong.members[id].index:null;
function enroll(w,p,now){
 const e=w.hallWar,index=hallOf(w,p.id);
 if(!real(p)||w.playTransfers?.[p.id]?.phase==='web'||index==null)return false;
 if(!Object.hasOwn(e.members,p.id))Object.defineProperty(e.members,p.id,{value:{id:p.id,index,joinedAt:now,hp:100,score:0,kills:0,boostUntil:0,lastManual:0},enumerable:true,writable:true,configurable:true});
 return true;
}
export function startHallWar(w,now,ctx){
 const busy=stageConflict(w,now);if(busy)return fail('Đang có '+busy+' • chờ kết thúc trước khi mở Ngũ Đường Tranh Phong.');
 const active=Object.values(w.players).filter(p=>real(p)&&ctx.active(w,p,now)&&hallOf(w,p.id)!=null);
 if(new Set(active.map(p=>hallOf(w,p.id))).size<2)return fail('Cần ít nhất 2 Đường có người đang hoạt động.');
 w.hallWar={id:'hall-war-'+now,phase:'registration',startedAt:now,registrationEndsAt:now+REGISTER_MS,members:{},teams:HALLS.map((h,index)=>({index,name:h.name,color:h.color,score:0,kills:0})),fx:[],seq:0};
 for(const p of active)enroll(w,p,now);
 ctx.emit(w,null,'NGŨ ĐƯỜNG TRANH PHONG • 30 giây tập hợp • gõ đường chiến hoặc 6 để vào trận theo Đường đã gia nhập','hall-war',now,{hallWarStart:true});
 return {ok:true};
}
export function stopHallWar(w,now,ctx){
 if(!hallWarVisible(w,now))return fail('Chưa có Ngũ Đường Tranh Phong.');
 w.hallWar.phase='cancelled';w.hallWar.podiumUntil=0;ctx.emit(w,null,'Ngũ Đường Tranh Phong đã dừng • giữ điểm hoạt động đã ghi nhận','hall-war',now,{hallWarEnd:true,cancelled:true});return {ok:true};
}
const power=p=>Math.max(7,Math.min(20,Math.log10(Math.max(0,p.totalQi||0)+10)*2));
function strike(w,member,now,ctx,{value=0,manual=false}={}){
 const e=w.hallWar,p=w.players[member.id];if(!real(p)||w.playTransfers?.[p.id]?.phase==='web'||member.hp<=0)return false;
 const enemies=Object.values(e.members).filter(m=>m.index!==member.index&&m.hp>0&&(m.shieldUntil||0)<=now&&real(w.players[m.id])&&w.playTransfers?.[m.id]?.phase!=='web'&&ctx.active(w,w.players[m.id],now));
 if(!enemies.length)return false;
 enemies.sort((a,b)=>Math.abs((w.players[a.id].realm||0)-(p.realm||0))-Math.abs((w.players[b.id].realm||0)-(p.realm||0))||Math.abs(Math.log((w.players[a.id].totalQi+10)/(p.totalQi+10)))-Math.abs(Math.log((w.players[b.id].totalQi+10)/(p.totalQi+10)))||a.id.localeCompare(b.id));
 const candidates=value>=300?enemies.slice(0,3):[enemies[(e.seq++)%Math.min(3,enemies.length)]];
 for(const target of candidates){
  const damage=Math.round(Math.min(90,power(p)*(manual?1.5:1)*(member.boostUntil>now?1.5:1)*(value?1+Math.log10(value+1):1)));
  const actual=Math.min(target.hp,damage);target.hp-=actual;member.score+=actual;e.teams[member.index].score+=actual;
  if(target.hp<=0){target.respawnAt=now+5000;member.kills++;e.teams[member.index].kills++;e.teams[member.index].score+=25;}
  e.fx.push({id:e.id+':'+(e.seq++),from:member.id,to:target.id,index:member.index,at:now,damage:actual,value,knockout:target.hp<=0,ultimate:value>=100||member.kills>0&&e.seq%7===0});
 }
 e.fx=e.fx.slice(-36);ctx.contribute(w,p,now,'event');return true;
}
export function hallWarCommand(w,p,words,now,ctx){
 const text=words.join(' '),join=['duong chien','duongchien','tranh phong','tranhphong'].includes(text),attack=words.length===1&&['danh','kiem'].includes(words[0]);
 if(!join&&!(attack&&w.hallWar?.phase==='running'))return null;
 const e=w.hallWar;if(!e||!['registration','running'].includes(e.phase))return fail('Ngũ Đường Tranh Phong chưa mở.');
 if(!enroll(w,p,now))return fail('Gõ vào đường 1–5 trước khi tham gia Đường chiến.');
 const member=e.members[p.id];
 if(e.phase==='running'){
  if(now-member.lastManual<3500)return fail('Chiêu đang hồi • chờ '+Math.ceil((3500-now+member.lastManual)/1000)+' giây.');
  if(member.hp<=0)return fail('Đang hồi trận • chờ vài giây.');
  member.lastManual=now;strike(w,member,now,ctx,{manual:true});
 }
 ctx.emit(w,p,e.phase==='registration'?'Đã tập hợp cùng '+HALLS[member.index].name:'Xuất chiêu vì '+HALLS[member.index].name,'hall-war',now,{hallWarAction:true});return {ok:true};
}
export function hallWarGift(w,p,value,now,ctx){
 const e=w.hallWar;if(!['registration','running'].includes(e?.phase)||!enroll(w,p,now)||value<1)return null;
 const member=e.members[p.id];member.boostUntil=Math.max(member.boostUntil||0,now+Math.min(16000,4000+Math.sqrt(value)*500));
 if(e.phase==='running')strike(w,member,now,ctx,{value});
 return {index:member.index,boostUntil:member.boostUntil};
}
function finish(w,now,ctx){
 const e=w.hallWar;e.phase='finished';e.podiumUntil=now+PODIUM_MS;e.endsAt=now;
 if(e.awarded)return;e.awarded=true;
 const present=new Set(Object.values(e.members).map(m=>m.index));
 e.results=e.teams.filter(t=>present.has(t.index)&&t.score>0).sort((a,b)=>b.score-a.score||b.kills-a.kills||a.index-b.index);
 for(const [rank,team] of e.results.entries()){
  if(team.score<=0)continue;
  ctx.hallPoints(w,team.index,[80,50,30,15,10][rank],now);
  for(const m of Object.values(e.members).filter(m=>m.index===team.index&&m.score>0)){
   const p=w.players[m.id];if(!real(p)||w.playTransfers?.[p.id]?.phase==='web')continue;
   p.hallWarMedals=(p.hallWarMedals||0)+Math.max(1,5-rank);
   const stones=Math.max(10,60-rank*10),qi=ctx.gain(w,p,[600,400,250,150,100][rank],stones,5,now,false,'event');
   (e.rewards??=[]).push({id:p.id,name:p.name,index:team.index,rank:rank+1,qi,stones,herbs:5});
   ctx.emit(w,p,team.name+' hạng '+(rank+1)+' • +'+qi+' tu vi • điểm chiến đấu đã cộng vào bảng tuần','hall-war',now,{hallWarReward:true,hallIndex:team.index,rank:rank+1,reward:{qi,stones,herbs:5}});
  }
 }
 const summary={id:e.id,at:now,results:e.results.map(t=>({...t})),rewardCount:(e.rewards||[]).length,mvp:Object.values(e.members).sort((a,b)=>b.score-a.score).slice(0,10).map(m=>({id:m.id,name:w.players[m.id]?.name,index:m.index,score:m.score,kills:m.kills}))};
 (w.hallWarHistory??=[]).push(summary);w.hallWarHistory=w.hallWarHistory.slice(-24);
 ctx.emit(w,null,'NGŨ ĐƯỜNG TRANH PHONG • '+(e.results.length?e.results[0].name+' giành ngôi đầu':'chưa có chiến công, chưa xếp hạng')+' • kết quả đã lưu vào lịch sử tuần','hall-war',now,{hallWarEnd:true});
}
export function tickHallWar(w,now,ctx){
 const e=w.hallWar;if(!e)return;
 if(e.phase==='registration'&&now>=e.registrationEndsAt){
  for(const m of Object.values(e.members))if(!ctx.active(w,w.players[m.id],now))delete e.members[m.id];
  if(new Set(Object.values(e.members).map(m=>m.index)).size<2){e.phase='cancelled';ctx.emit(w,null,'Chưa đủ hai Đường tập hợp • chưa trao thưởng','hall-war',now,{hallWarEnd:true});return;}
  e.phase='running';e.battleStartedAt=now;e.endsAt=now+BATTLE_MS;e.nextCastAt=now;
  ctx.emit(w,null,'NGŨ ĐƯỜNG KHAI CHIẾN • tự giao chiến • gõ 6 hoặc đánh để tung liên chiêu • quà trợ lực đúng Đường của người tặng','hall-war',now,{hallWarBattle:true});
 }
 if(e.phase!=='running')return;if(now>=e.endsAt){finish(w,now,ctx);return;}
 if(now<(e.nextCastAt||0))return;e.nextCastAt=now+1800;
 const roster=Object.values(e.members).sort((a,b)=>a.id.localeCompare(b.id));
 for(const m of roster){
  if(m.hp<=0&&now>=m.respawnAt){m.hp=100;m.shieldUntil=now+1200;}
 }
 // Rotate initiative every beat; the first registered hall never keeps first strike.
 const cursor=(e.castCursor||0)%Math.max(1,roster.length);e.castCursor=cursor+1;
 for(let i=0;i<roster.length;i++){const m=roster[(cursor+i)%roster.length];if(m.hp>0&&ctx.active(w,w.players[m.id],now))strike(w,m,now,ctx);}
}
export function hallWarView(w,now){
 const e=w.hallWar;if(!e)return null;
 return {id:e.id,phase:e.phase,active:hallWarVisible(w,now),startedAt:e.startedAt,registrationEndsAt:e.registrationEndsAt,battleStartedAt:e.battleStartedAt,endsAt:e.endsAt,podiumUntil:e.podiumUntil,teams:e.teams,results:e.results,rewardCount:(e.rewards||[]).length,mvp:(w.hallWarHistory||[]).find(h=>h.id===e.id)?.mvp?.slice(0,3)||[],members:Object.values(e.members).map(m=>({...m,name:w.players[m.id]?.name||'Đạo hữu',avatar:w.players[m.id]?.avatar,realm:w.players[m.id]?.realm})),fx:e.fx.filter(f=>now-f.at<3500),history:(w.hallWarHistory||[]).slice(-4).reverse()};
}
