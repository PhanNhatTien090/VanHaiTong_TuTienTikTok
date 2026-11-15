// Vân Hải Lôi Đài (15/11/2026) — server quyết toàn bộ: hàng thách đấu, trận đánh 4 chiêu, máu, nộ khí, thưởng.
// Luật thắng (chủ game duyệt "phương án B"): tu vi cao hơn → máu/công cao hơn rõ; chênh ≥30% tổng tu vi thì người mạnh thắng chắc;
// sát nhau thì chiêu, linh thú, nộ khí (cổ vũ có trần) và quà của đấu thủ có thể lật kèo.
import {stageConflict} from './stage-lock.mjs';
import {arenaKit,ARENA_SLOT_RULES} from './public/arena-skills.js';

export const ARENA_MS=8*60000,MATCH_MS=30000,INTRO_MS=2600,BREAK_MS=4500,RESULT_MS=3500,PODIUM_MS=12000;
export const QUEUE_MAX=6,DEFEND_MAX=5,CHALLENGE_LIMIT=3,INVITE_MS=20000,CHEER_MS=5000,CHEER_RAGE=3,CHEER_CAP=30,LOCK_RATIO=1.3;
const STREAK_BONUS=Object.freeze({3:2,5:3,8:5});
const ok=(extra={})=>({ok:true,...extra}),fail=message=>({ok:false,message});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function hash(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
// Số ngẫu nhiên tất định theo trận + lượt → cùng dữ liệu luôn ra cùng trận (dễ test, không phụ thuộc máy).
function rand(m){let x=(hash(m.id)+Math.imul(++m.rngN,0x9e3779b1))>>>0;x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return (x%100000)/100000;}

export const arenaOpen=(w,now=Date.now())=>w.arena?.phase==='open';
export const arenaVisible=(w,now=Date.now())=>arenaOpen(w,now)||w.arena?.podiumUntil>now;

export function startArena(w,now,c,{minutes=ARENA_MS/60000}={}){
 if(arenaOpen(w,now))return fail('Lôi Đài đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Đang có '+busy+'. Chờ hoạt động đó kết thúc.');
 if(['registration','running'].includes(w.race?.phase)||w.social?.activeCeremony?.endsAt>now)return fail('Sân đang bận.');
 w.arena={id:'arena-'+now,phase:'open',startedAt:now,endsAt:now+clamp(Math.round(minutes*60000),60000,30*60000),champion:null,defends:0,streak:0,queue:[],invites:{},current:null,nextAt:now+1500,results:[],counts:{},cheerAt:{},awarded:{},best:null,lastResult:null};
 c.emit(w,null,'VÂN HẢI LÔI ĐÀI KHAI MỞ • gõ lên đài để làm Đài Chủ hoặc thách đấu','tournament',now,{arenaStart:true});
 return ok();
}
export function stopArena(w,now,c){
 if(!arenaOpen(w,now))return fail('Lôi Đài chưa mở.');
 if(w.arena.current)finishMatch(w,now,c,{cancelled:true});
 closeArena(w,now,c);return ok();
}
function closeArena(w,now,c){
 const a=w.arena;a.phase='closed';a.closedAt=now;a.current=null;a.queue=[];a.invites={};a.podiumUntil=now+PODIUM_MS;
 const p=w.players[a.champion];
 if(p){medal(w,p,'final:'+a.id,5,now);p.arenaTitle='Lôi Đài Bá Chủ';p.arenaThrones=(p.arenaThrones||0)+1;
  c.emit(w,p,'LÔI ĐÀI BÁ CHỦ • '+p.name+' trụ đài tới cuối • +5 huy chương','tournament',now,{arenaChampion:true});}
 else c.emit(w,null,'Lôi Đài khép lại','tournament',now,{arenaEnd:true});
 w.nextBossAt=Math.max(w.nextBossAt||0,now+(w.settings?.bossInterval??240)*1000);
}
function medal(w,p,key,n,now){const a=w.arena;if(!p||a.awarded[key])return;a.awarded[key]=true;p.tournamentMedals=(p.tournamentMedals||0)+n;}
const present=(w,id,now,c)=>{const p=w.players[id];return !!p&&!p.resident&&!p.puppet&&w.playTransfers?.[id]?.phase!=='web'&&(!c?.active||c.active(w,p,now));};
const inArena=(a,id)=>a.champion===id||a.current?.a===id||a.current?.b===id||a.queue.some(q=>q.id===id||q.vs===id);
function findPlayer(w,text){
 const q=norm(text).replace(/^@/,'');if(!q)return null;
 const all=Object.values(w.players).filter(p=>!p.resident&&!p.puppet);
 return all.find(p=>norm(p.socialCode)===q)||all.find(p=>norm(p.name)===q)||all.find(p=>norm(p.name).startsWith(q))||null;
}
function enqueue(w,p,now,c,vs=null){
 const a=w.arena;
 if((a.counts[p.id]||0)>=CHALLENGE_LIMIT)return fail('Mỗi người tối đa '+CHALLENGE_LIMIT+' lượt thách đấu mỗi lần Lôi Đài mở.');
 if(a.queue.length>=QUEUE_MAX)return fail('Hàng thách đấu đã đủ '+QUEUE_MAX+' người, chờ lượt sau.');
 a.queue.push({id:p.id,at:now,...(vs?{vs}:{})});
 c.emit(w,p,vs?p.name+' và '+w.players[vs].name+' hẹn đấu trên Lôi Đài':p.name+' xếp hàng thách đấu Đài Chủ • thứ '+a.queue.length,'tournament',now,{arenaQueue:true});
 return ok({queued:a.queue.length});
}

/** Lệnh chat. Trả null nếu không phải lệnh Lôi Đài. */
export function arenaCommand(w,p,cmd,rest,now,c){
 const words=String(rest||'').split(' ').filter(Boolean);
 const chieu=cmd==='chieu'?Number(words[0]):/^c[1-4]$/.test(cmd)?Number(cmd[1]):0;
 const isCmd=['lendai','loidai','xuongdai','thach','thachdau','nhan','cv1','cv2'].includes(cmd)||chieu;
 if(!isCmd)return null;
 if(cmd==='nhan'&&!w.arena?.invites?.[p.id])return null; // "nhận" còn là lệnh nhận hồng bao
 if(!arenaOpen(w,now))return cmd==='nhan'||chieu?null:fail('Lôi Đài chưa mở.');
 const a=w.arena;
 if(p.resident||p.puppet)return fail('NPC không lên Lôi Đài.');
 if(chieu){
  const m=a.current,f=m?.fighters?.[p.id];if(!f||now>=m.endsAt)return fail('Chỉ đấu thủ đang trên đài mới chọn chiêu.');
  if(chieu<1||chieu>4)return fail('Chọn chiêu 1–4.');
  f.pref=chieu;return ok({pref:chieu});
 }
 if(cmd==='cv1'||cmd==='cv2'){
  const m=a.current;if(!m||now>=m.endsAt||m.result)return fail('Chưa có trận để cổ vũ.');
  if(m.fighters[p.id])return fail('Đấu thủ không tự cổ vũ.');
  if(now-(a.cheerAt[p.id]||0)<CHEER_MS)return ok({cooldown:true});
  a.cheerAt[p.id]=now;const side=cmd==='cv1'?m.a:m.b,f=m.fighters[side];
  m.cheers[side]=(m.cheers[side]||0)+1;m.cheerNames.push({id:p.id,name:p.name,side,at:now});if(m.cheerNames.length>8)m.cheerNames.shift();
  const room=Math.max(0,CHEER_CAP-(m.cheerRage[side]||0)),add=Math.min(CHEER_RAGE,room);
  if(add>0){m.cheerRage[side]=(m.cheerRage[side]||0)+add;f.rage=Math.min(100,f.rage+add);}
  return ok({side});
 }
 if(cmd==='xuongdai'){
  if(a.champion!==p.id)return fail('Chỉ Đài Chủ mới xuống đài.');
  if(a.current)return fail('Đang đấu, đánh xong trận này đã.');
  stepDown(w,now,c,'tự xuống đài');return ok();
 }
 if(cmd==='nhan'){
  const inv=a.invites[p.id];if(!inv||now>inv.at+INVITE_MS)return fail('Không có lời thách đấu nào đang chờ.');
  delete a.invites[p.id];const from=w.players[inv.from];
  if(!from||!present(w,from.id,now,c)||inArena(a,from.id)||inArena(a,p.id))return fail('Lời thách đấu không còn hiệu lực.');
  return enqueue(w,from,now,c,p.id);
 }
 if(cmd==='thach'||cmd==='thachdau'){
  if(!words.length)return arenaCommand(w,p,'lendai','',now,c);
  const target=findPlayer(w,words.join(' '));
  if(!target)return fail('Không thấy đạo hữu này.');
  if(target.id===p.id)return fail('Không tự thách mình.');
  if(target.id===a.champion)return arenaCommand(w,p,'lendai','',now,c);
  if(!present(w,target.id,now,c))return fail(target.name+' không có mặt trên LIVE.');
  if(inArena(a,p.id)||inArena(a,target.id))return fail('Một trong hai đã có lượt trên Lôi Đài.');
  a.invites[target.id]={from:p.id,at:now};
  c.emit(w,target,p.name+' thách đấu '+target.name+' • gõ nhận để lên đài','tournament',now,{arenaInvite:true,from:p.id});
  return ok({invited:target.id});
 }
 // lên đài
 if(inArena(a,p.id))return fail(a.champion===p.id?'Đạo hữu đang là Đài Chủ.':'Đạo hữu đã có lượt trên Lôi Đài.');
 if(!present(w,p.id,now,c))return fail('Cần có mặt trên LIVE.');
 if(!a.champion&&!a.current){crown(w,p,now,c,'lên đài');return ok({champion:true});}
 return enqueue(w,p,now,c);
}
function crown(w,p,now,c,how){
 const a=w.arena;a.champion=p.id;a.defends=0;a.streak=0;a.counts[p.id]=(a.counts[p.id]||0)+1;
 c.emit(w,p,p.name+' '+how+' • trở thành Đài Chủ','tournament',now,{arenaCrown:true});
}
function stepDown(w,now,c,why){
 const a=w.arena,old=w.players[a.champion];a.champion=null;a.defends=0;a.streak=0;
 if(old)c.emit(w,old,old.name+' '+why,'tournament',now,{arenaStepDown:true});
 a.nextAt=now+1500;
}

// ---------- trận đánh ----------
function fighter(w,p,adv,c){
 const realm=Math.max(0,Number(p.realm)||0),maxHp=Math.round((60000+realm*9000)*(1+.04*adv));
 return {id:p.id,name:p.name,realm,totalQi:Number(p.totalQi)||0,maxHp,hp:maxHp,rage:0,shield:0,stunUntil:0,cd:{1:0,2:0,3:0,4:0},pref:0,ults:0,
  atk:1+.07*adv,kit:arenaKit(p,c?.technique?(q=>c.technique(q)):undefined)};
}
function beginMatch(w,aId,bId,now,c,kind){
 const a=w.arena,pa=w.players[aId],pb=w.players[bId];
 const qa=Math.max(1,Number(pa.totalQi)||0),qb=Math.max(1,Number(pb.totalQi)||0),r=qa/qb;
 const adv=clamp(Math.log(r)/Math.log(LOCK_RATIO),-1,1),locked=qa>=qb*LOCK_RATIO*(1-1e-9)?aId:qb>=qa*LOCK_RATIO*(1-1e-9)?bId:null;
 const id=a.id+'-m'+(a.results.length+1)+'-'+now;
 const m=a.current={id,kind,a:aId,b:bId,startedAt:now,fightAt:now+INTRO_MS,endsAt:now+INTRO_MS+MATCH_MS,locked,rngN:0,n:0,
  fighters:{[aId]:fighter(w,pa,adv,c),[bId]:fighter(w,pb,-adv,c)},next:{},log:[],cheers:{},cheerRage:{},cheerNames:[],odds:locked?(locked===aId?100:0):Math.round(50+45*adv)};
 m.next[aId]=m.fightAt+Math.round(rand(m)*1200);m.next[bId]=m.fightAt+Math.round(rand(m)*1200);
 for(const id2 of [aId,bId]){const p=w.players[id2];p.arenaFights=(p.arenaFights||0)+1;}
 if(kind==='throne')a.counts[bId]=(a.counts[bId]||0)+1;else{a.counts[aId]=(a.counts[aId]||0)+1;a.counts[bId]=(a.counts[bId]||0)+1;}
 c.emit(w,null,(kind==='throne'?'Lôi Đài: '+pb.name+' thách đấu Đài Chủ '+pa.name:'Lôi Đài: '+pa.name+' đấu '+pb.name)+(locked?' • chênh tu vi lớn':''),'tournament',now,{arenaMatch:true,pair:[aId,bId]});
 return m;
}
function pickSlot(m,f,foe,now){
 const ready=s=>s===4?f.rage>=100&&f.ults<2:now>=f.cd[s];
 if(f.pref&&ready(f.pref)){const s=f.pref;f.pref=0;return s;}
 if(ready(4))return 4;
 const k3=f.kit[2];
 if(ready(3)&&(k3.role==='support'||k3.role==='defense')&&f.hp<f.maxHp*.5)return 3;
 if(ready(3)&&k3.role!=='support'&&k3.role!=='defense'&&rand(m)<.6)return 3;
 if(ready(2)&&rand(m)<.7)return 2;
 if(ready(3)&&rand(m)<.35)return 3;
 return 1;
}
function hit(m,by,to,pct,crit){
 const lv=by.kit[0].lv||1,raw=Math.round(to.maxHp*pct*by.atk*(1+.02*(lv-1))*(crit?1.5:1));
 let dmg=raw;
 // Chênh ≥30% tu vi: người yếu không hạ được người mạnh (giữ ≥10% máu).
 if(m.locked&&m.locked===to.id)dmg=Math.min(dmg,Math.max(0,to.hp+to.shield-Math.ceil(to.maxHp*.1)));
 const absorbed=Math.min(to.shield,dmg);to.shield-=absorbed;to.hp=Math.max(0,to.hp-(dmg-absorbed));
 by.rage=Math.min(100,by.rage+14);to.rage=Math.min(100,to.rage+9);
 return {dmg,absorbed};
}
function act(w,m,id,now){
 const f=m.fighters[id],foeId=id===m.a?m.b:m.a,foe=m.fighters[foeId],at=m.next[id];
 m.next[id]=at+1500+Math.round(rand(m)*600);
 if(f.stunUntil>at){m.log.push({n:++m.n,at,by:id,to:foeId,stunned:true});return;}
 const slot=pickSlot(m,f,foe,at),skill=f.kit[slot-1],rule=ARENA_SLOT_RULES[slot];
 const pct=rule.min+(rule.max-rule.min)*rand(m),crit=slot===4||rand(m)<.16;
 const entry={n:++m.n,at,by:id,to:foeId,slot,skill:{name:skill.name,tech:skill.tech,color:skill.color,role:skill.role,pet:skill.pet||null},crit};
 if(slot===4){f.rage=0;f.ults++;}else if(rule.cd)f.cd[slot]=at+rule.cd;
 const role=slot===3?skill.role:'attack';
 if(role==='support'){const heal=Math.min(f.maxHp-f.hp,Math.round(f.maxHp*.1*(1+.02*(skill.lv-1))));f.hp+=heal;entry.heal=heal;entry.target='self';}
 else if(role==='defense'){const sh=Math.round(f.maxHp*.14);f.shield+=sh;entry.shield=sh;entry.target='self';if(skill.pet){const r=hit(m,f,foe,pct*.5,false);entry.dmg=r.dmg;}}
 else{const r=hit(m,f,foe,role==='control'?pct*.6:role==='drain'?pct*.8:pct,crit);entry.dmg=r.dmg;entry.absorbed=r.absorbed||0;
  if(role==='control'){foe.stunUntil=at+1400;entry.stun=1400;}
  if(role==='drain'){const heal=Math.min(f.maxHp-f.hp,Math.round(r.dmg*.7));f.hp+=heal;entry.heal=heal;}}
 entry.hpBy=f.hp;entry.hpTo=foe.hp;entry.ko=foe.hp<=0;
 m.log.push(entry);if(m.log.length>14)m.log.splice(0,m.log.length-14);
}
/** Quà của đấu thủ đang đánh: tăng nộ khí; từ 99 coin tung thêm "Pháp Bảo Bạo Phát". */
export function arenaGift(w,p,value,now){
 const m=w.arena?.current;if(!arenaOpen(w,now)||!m||m.result||now<m.fightAt||now>=m.endsAt)return null;
 const f=m.fighters[p?.id];if(!f||!(value>0))return null;
 const foeId=p.id===m.a?m.b:m.a,foe=m.fighters[foeId];
 f.rage=Math.min(100,f.rage+Math.round(15+Math.log10(value+1)*20));
 if(value<99)return {rage:f.rage};
 const pct=Math.min(.3,.06+Math.log10(value)*.06),r=hit(m,f,foe,pct,true);
 const entry={n:++m.n,at:now,by:p.id,to:foeId,slot:0,gift:true,skill:{name:'Pháp Bảo Bạo Phát',tech:f.kit[3].tech,color:'#ffd27a',role:'gift'},crit:true,dmg:r.dmg,absorbed:r.absorbed,hpBy:f.hp,hpTo:foe.hp,ko:foe.hp<=0};
 m.log.push(entry);if(m.log.length>14)m.log.splice(0,m.log.length-14);
 return entry;
}
function finishMatch(w,now,c,{cancelled=false}={}){
 const a=w.arena,m=a.current;if(!m)return;
 const fa=m.fighters[m.a],fb=m.fighters[m.b],ra=fa.hp/fa.maxHp,rb=fb.hp/fb.maxHp;
 let winner=m.locked||(fa.hp<=0?m.b:fb.hp<=0?m.a:ra>rb?m.a:rb>ra?m.b:m.a);
 const loser=winner===m.a?m.b:m.a,ko=m.fighters[loser].hp<=0;
 a.current=null;a.nextAt=now+BREAK_MS;
 const result={id:m.id,kind:m.kind,a:m.a,b:m.b,winner,loser,ko,at:now,until:now+RESULT_MS,hp:{[m.a]:ra,[m.b]:rb},cancelled};
 a.lastResult=result;a.results.push({id:m.id,winner,loser,ko,kind:m.kind});if(a.results.length>40)a.results.shift();
 if(cancelled)return;
 const pw=w.players[winner];medal(w,pw,'win:'+m.id,2,now);if(pw)pw.arenaWins=(pw.arenaWins||0)+1;
 if(m.kind==='throne'){
  if(winner===a.champion){a.defends++;a.streak++;}else{a.champion=winner;a.defends=0;a.streak=1;}
  const bonus=STREAK_BONUS[a.streak];if(bonus&&pw)medal(w,pw,'streak:'+a.id+':'+winner+':'+a.streak,bonus,now);
  if(pw&&a.streak>(pw.arenaBestStreak||0))pw.arenaBestStreak=a.streak;
  if(pw&&(!a.best||a.streak>a.best.n))a.best={id:winner,name:pw.name,n:a.streak};
  c.emit(w,pw,(ko?'KO! ':'')+pw.name+(a.streak>1?' giữ đài '+a.streak+' trận':' chiếm Lôi Đài')+(bonus?' • thưởng chuỗi +'+bonus+' huy chương':''),'tournament',now,{arenaResult:true,pair:[m.a,m.b],streak:a.streak,ko});
  if(a.defends>=DEFEND_MAX){a.nextAt=now+RESULT_MS+500;a.stepDownAt=now+RESULT_MS;}
 }else c.emit(w,pw,(ko?'KO! ':'')+pw.name+' thắng trận hẹn đấu','tournament',now,{arenaResult:true,pair:[m.a,m.b],ko});
}
export function tickArena(w,now,c){
 const a=w.arena;if(!a||a.phase!=='open')return;
 for(const [id,inv] of Object.entries(a.invites))if(now>inv.at+INVITE_MS)delete a.invites[id];
 const m=a.current;
 if(m){
  // Đấu thủ rời LIVE giữa trận → người còn lại thắng ngay.
  for(const id of [m.a,m.b])if(!present(w,id,now,c)&&now>=m.fightAt){m.fighters[id].hp=0;finishMatch(w,now,c);return;}
  for(let guard=0;guard<40&&now>=m.fightAt;guard++){
   const id=m.next[m.a]<=m.next[m.b]?m.a:m.b;if(m.next[id]>Math.min(now,m.endsAt))break;
   act(w,m,id,now);if(m.fighters[m.a].hp<=0||m.fighters[m.b].hp<=0)break;
  }
  if(m.fighters[m.a].hp<=0||m.fighters[m.b].hp<=0||now>=m.endsAt)finishMatch(w,now,c);
  return;
 }
 if(a.stepDownAt&&now>=a.stepDownAt){a.stepDownAt=0;const p=w.players[a.champion];if(p){medal(w,p,'guard:'+a.id+':'+p.id+':'+a.results.length,3,now);}stepDown(w,now,c,'giữ đài '+DEFEND_MAX+' trận • xuống nghỉ, nhường lượt (+3 huy chương)');}
 if(now>=a.endsAt){closeArena(w,now,c);return;}
 if(now<a.nextAt)return;
 if(a.champion&&!present(w,a.champion,now,c))stepDown(w,now,c,'rời Lôi Đài');
 a.queue=a.queue.filter(q=>present(w,q.id,now,c)&&(!q.vs||present(w,q.vs,now,c)));
 const next=a.queue[0];
 if(!next)return;
 if(next.vs){a.queue.splice(a.queue.indexOf(next),1);beginMatch(w,next.id,next.vs,now,c,'private');return;}
 if(!a.champion){a.queue.shift();crown(w,w.players[next.id],now,c,'lên đài');a.nextAt=now+2000;return;}
 a.queue.shift();beginMatch(w,a.champion,next.id,now,c,'throne');
}
/** Dữ liệu gửi overlay: gọn, chỉ phần cần vẽ. */
export function arenaView(w,now){
 const a=w.arena;if(!a||!(a.phase==='open'||a.podiumUntil>now))return null;
 const name=id=>w.players[id]?.name||'';
 const m=a.current,fview=f=>({name:f.name,realm:f.realm,hp:f.hp,maxHp:f.maxHp,rage:f.rage,shield:f.shield,stunned:f.stunUntil>now,
  cd:Object.fromEntries([1,2,3].map(s=>[s,Math.max(0,f.cd[s]-now)])),kit:f.kit.map(k=>({slot:k.slot,name:k.name,tech:k.tech,color:k.color,role:k.role,lv:k.lv,pet:k.pet||null}))});
 return {id:a.id,phase:a.phase,endsAt:a.endsAt,podiumUntil:a.podiumUntil||0,champion:a.champion?{id:a.champion,name:name(a.champion)}:null,
  streak:a.streak,defends:a.defends,defendMax:DEFEND_MAX,best:a.best,
  queue:a.queue.map(q=>({id:q.id,name:name(q.id),...(q.vs?{vs:q.vs,vsName:name(q.vs)}:{})})),
  current:m?{id:m.id,kind:m.kind,a:m.a,b:m.b,startedAt:m.startedAt,fightAt:m.fightAt,endsAt:m.endsAt,locked:m.locked,odds:m.odds,
   fighters:{[m.a]:fview(m.fighters[m.a]),[m.b]:fview(m.fighters[m.b])},log:m.log.slice(-10),cheers:m.cheers,cheerNames:m.cheerNames.slice(-5)}:null,
  lastResult:a.lastResult&&a.lastResult.until>now?{...a.lastResult,winnerName:name(a.lastResult.winner),loserName:name(a.lastResult.loser)}:null};
}
/** Ai đứng trên đài (để overlay luôn có dữ liệu 2 đấu thủ). */
export function arenaStageIds(w,now){
 const a=w.arena;if(!a)return [];
 if(a.current)return [a.current.a,a.current.b];
 if(a.lastResult?.until>now)return [a.lastResult.a,a.lastResult.b];
 if(a.phase==='open'&&a.champion)return [a.champion];
 if(a.podiumUntil>now&&a.champion)return [a.champion];
 return [];
}
