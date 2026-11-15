// Vân Hải Lôi Đài (15/11/2026) — server quyết toàn bộ: hàng thách đấu, trận đánh 4 chiêu, máu, nộ khí, thưởng.
// Luật thắng (chủ game duyệt "phương án B"): tu vi cao hơn → máu/công cao hơn rõ; chênh ≥30% tổng tu vi thì người mạnh thắng chắc;
// sát nhau thì chiêu, linh thú, nộ khí (cổ vũ có trần) và quà của đấu thủ có thể lật kèo.
import {stageConflict} from './stage-lock.mjs';
import {arenaKit,ARENA_SLOT_RULES,ARENA_ULT_SLOT,ARENA_PET_SLOT,hanhBeats} from './public/arena-skills.js';
// Bí pháp chiêu thức đã xếp ô (danh mục cài ở bước D; mặc định rỗng → dùng chiêu hệ).
import {ARENA_BOOKS,BOOK_TIER_NAME,findBook,bookLoadout} from './public/arena-books.js';
export let arenaBooksOf=p=>bookLoadout(p);
let manualNames=[];export function setArenaManualNames(list){manualNames=(list||[]).map(norm);}
export function setArenaBooksResolver(fn){arenaBooksOf=fn;}

export const ARENA_MS=8*60000,MATCH_MS=30000,INTRO_MS=2600,BREAK_MS=4500,RESULT_MS=3500,PODIUM_MS=12000;
export const QUEUE_MAX=6,DEFEND_MAX=5,CHALLENGE_LIMIT=3,INVITE_MS=20000,CHEER_MS=5000,CHEER_RAGE=3,CHEER_CAP=30,LOCK_RATIO=1.3;
const STREAK_BONUS=Object.freeze({3:2,5:3,8:5});
const ok=(extra={})=>({ok:true,...extra}),fail=message=>({ok:false,message});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
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
 const chieu=cmd==='chieu'?Number(words[0]):/^c[1-5]$/.test(cmd)?Number(cmd[1]):0;
 // ---- bí pháp chiêu thức ----
 if(cmd==='biphap'&&!words.length){
  if(now-(p.arenaBookListAt||0)<15000)return ok({cooldown:true});p.arenaBookListAt=now;
  const learned=new Set(p.arenaBooks||[]),groups=[1,2,3,4,5].map(g=>BOOK_TIER_NAME[g]+': '+ARENA_BOOKS.filter(b=>b.grade===g).map(b=>(learned.has(b.id)?'✓':'')+b.name).join(', '));
  c.emit(w,p,'Bí pháp chiêu thức • '+groups.join(' • ')+' • gõ học + tên','status',now,{arenaBooks:true});return ok({count:ARENA_BOOKS.length});
 }
 if(cmd==='hoc'&&words.length){
  const q=norm(words.join(' '));
  // Trùng tên bí pháp tu luyện cũ (CATALOG) → để lệnh học cũ xử lý.
  if(manualNames.some(n=>n===q||n.startsWith(q)))return null;
  const b=findBook(q);if(!b)return null;
  p.arenaBooks??=[];if(p.arenaBooks.includes(b.id))return fail('Đã lĩnh ngộ '+b.name+'.');
  if((Number(p.realm)||0)<b.realm)return fail(b.name+' cần cảnh giới cao hơn.');
  if((p.tournamentMedals||0)<b.medals)return fail(b.name+' cần '+b.medals+' huy chương Lôi Đài (không bị trừ).');
  if((p.stones||0)<b.stones||(p.herbs||0)<b.herbs)return fail(b.name+' cần '+b.stones.toLocaleString('vi-VN')+' linh thạch · '+b.herbs+' linh thảo.');
  p.stones-=b.stones;p.herbs-=b.herbs;p.arenaBooks.push(b.id);
  const slot=bookLoadout(p).findIndex(x=>x.id===b.id);
  c.emit(w,p,'Lĩnh ngộ bí pháp '+BOOK_TIER_NAME[b.grade]+' cấp • '+b.name+(slot>=0?' • xếp vào SK'+(slot+2):''),'status',now,{arenaBookLearn:b.id});
  return ok({learned:b.id});
 }
 if(cmd==='chieu'&&words[0]==='doi'){
  const b=findBook(words.slice(1).join(' '));if(!b||!(p.arenaBooks||[]).includes(b.id))return fail('Chưa lĩnh ngộ bí pháp này.');
  p.arenaLoadout=[b.id,...(p.arenaLoadout||[]).filter(id=>id!==b.id)].slice(0,2);
  c.emit(w,p,'Xếp '+b.name+' vào SK2','status',now);return ok({loadout:p.arenaLoadout});
 }
 if(cmd==='chieu'&&!words.length){
  if(now-(p.arenaKitAt||0)<15000)return ok({cooldown:true});p.arenaKitAt=now;
  const kit=arenaKit(p,c?.technique?(q=>c.technique(q)):undefined,arenaBooksOf(p));
  c.emit(w,p,'Chiêu Lôi Đài (Lv'+kit[0].lv+') • '+kit.map(k=>'SK'+k.slot+' '+k.name).join(' · '),'status',now,{arenaKit:true});
  return ok({kit:kit.map(k=>k.name)});
 }
 const isCmd=['lendai','loidai','xuongdai','thach','thachdau','nhan','cv1','cv2'].includes(cmd)||chieu;
 if(!isCmd)return null;
 if(cmd==='nhan'&&!w.arena?.invites?.[p.id])return null; // "nhận" còn là lệnh nhận hồng bao
 if(!arenaOpen(w,now))return cmd==='nhan'||chieu?null:fail('Lôi Đài chưa mở.');
 const a=w.arena;
 if(p.resident||p.puppet)return fail('NPC không lên Lôi Đài.');
 if(chieu){
  const m=a.current,f=m?.fighters?.[p.id];if(!f||now>=m.endsAt)return fail('Chỉ đấu thủ đang trên đài mới chọn chiêu.');
  if(chieu<1||chieu>5)return fail('Chọn chiêu 1–5.');
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
function fighter(w,p,adv,c){
 const realm=Math.max(0,Number(p.realm)||0),maxHp=Math.round((60000+realm*9000)*(1+.04*adv));
 const kit=arenaKit(p,c?.technique?(q=>c.technique(q)):undefined,arenaBooksOf(p));
 return {id:p.id,name:p.name,realm,totalQi:Number(p.totalQi)||0,maxHp,hp:maxHp,rage:0,shield:0,stunUntil:0,weakUntil:0,reflectUntil:0,dot:null,lastEl:null,
  cd:{1:0,2:0,3:0,4:0,5:0},pref:0,ults:0,atk:1+.07*adv,hanh:kit[0].hanh,kit};
}
function pickSlot(m,f,foe,now){
 const U=ARENA_ULT_SLOT,P=ARENA_PET_SLOT,ready=s=>s===U?f.rage>=100&&f.ults<2:now>=f.cd[s];
 if(f.pref&&ready(f.pref)){const s=f.pref;f.pref=0;return s;}
 if(ready(U))return U;
 const pet=f.kit[P-1],guard=pet.role==='support'||pet.role==='defense';
 if(ready(P)&&guard&&f.hp<f.maxHp*.5)return P;
 if(ready(P)&&!guard&&rand(m)<.5)return P;
 if(ready(3)&&rand(m)<.6)return 3;
 if(ready(2)&&rand(m)<.7)return 2;
 if(ready(P)&&rand(m)<.3)return P;
 return 1;
}
// Chênh ≥30% tu vi: người yếu không hạ được người mạnh (giữ ≥10% máu) — áp cho mọi nguồn sát thương.
const capLocked=(m,to,dmg)=>m.locked&&m.locked===to.id?Math.min(dmg,Math.max(0,to.hp+to.shield-Math.ceil(to.maxHp*.1))):dmg;
function hit(m,by,to,pct,crit,at=0,mult=1){
 const lv=by.kit[0].lv||1,weak=by.weakUntil>at?.8:1;
 const dmg=capLocked(m,to,Math.round(to.maxHp*pct*by.atk*weak*mult*(1+.02*(lv-1))*(crit?1.5:1)));
 const absorbed=Math.min(to.shield,dmg);to.shield-=absorbed;to.hp=Math.max(0,to.hp-(dmg-absorbed));
 by.rage=Math.min(100,by.rage+14);to.rage=Math.min(100,to.rage+9);
 let reflect=0;
 if(to.reflectUntil>at&&dmg>0){reflect=capLocked(m,by,Math.round(dmg*.25));by.hp=Math.max(0,by.hp-reflect);}
 return {dmg,absorbed,reflect};
}
function applyEffect(m,f,foe,effect,at,entry,dmg){
 if(effect==='burn'){foe.dot={by:f.id,next:at+900,until:at+3700,per:Math.round(foe.maxHp*.018)};entry.burn=true;}
 else if(effect==='weaken'){foe.weakUntil=at+3000;entry.weaken=true;}
 else if(effect==='knock'){m.next[foe.id]+=900;entry.knock=true;}
 else if(effect==='break'){if(foe.shield>0){entry.broke=foe.shield;foe.shield=0;}}
 else if(effect==='drain'){const heal=Math.min(f.maxHp-f.hp,Math.round((dmg||0)*.5));if(heal>0){f.hp+=heal;entry.heal=heal;}}
 else if(effect==='reflect'){f.reflectUntil=at+3000;entry.reflectOn=true;}
 else if(effect==='stun'){foe.stunUntil=at+1400;entry.stun=1400;}
}
const pushLog=(m,entry)=>{m.log.push(entry);if(m.log.length>16)m.log.splice(0,m.log.length-16);};
function act(w,m,id,now){
 const f=m.fighters[id],foeId=id===m.a?m.b:m.a,foe=m.fighters[foeId],at=m.next[id];
 m.next[id]=at+1500+Math.round(rand(m)*600);
 if(f.stunUntil>at){pushLog(m,{n:++m.n,at,by:id,to:foeId,stunned:true});return;}
 const slot=pickSlot(m,f,foe,at),skill=f.kit[slot-1],rule=ARENA_SLOT_RULES[slot];
 const pct=(rule.min+(rule.max-rule.min)*rand(m))*(skill.power||1),crit=slot===ARENA_ULT_SLOT||rand(m)<.16;
 const entry={n:++m.n,at,by:id,to:foeId,slot,tier:skill.tier||1,skill:{name:skill.name,tech:skill.tech,color:skill.color,role:skill.role,pet:skill.pet||null,hanh:skill.hanh,effect:skill.effect,art:skill.art||null},crit};
 if(slot===ARENA_ULT_SLOT){f.rage=0;f.ults++;}else if(rule.cd)f.cd[slot]=at+rule.cd;
 // Ngũ hành khắc chế ±5% + liên chiêu (2 đòn cùng hành liền nhau, không tính chiêu thường, +10%).
 let mult=1;
 if(hanhBeats(skill.hanh,foe.hanh)){mult*=1.05;entry.counter=true;}else if(hanhBeats(foe.hanh,skill.hanh)){mult*=.95;entry.resisted=true;}
 if(f.lastEl&&f.lastEl===skill.hanh&&slot!==1){mult*=1.1;entry.combo=true;}
 f.lastEl=skill.hanh;
 const role=slot===ARENA_PET_SLOT?skill.role:'attack';
 if(role==='support'){const heal=Math.min(f.maxHp-f.hp,Math.round(f.maxHp*.1*(1+.02*(skill.lv-1))));f.hp+=heal;entry.heal=heal;entry.target='self';}
 else if(role==='defense'){const sh=Math.round(f.maxHp*.14);f.shield+=sh;entry.shield=sh;entry.target='self';if(skill.pet){const r=hit(m,f,foe,pct*.5,false,at,mult);entry.dmg=r.dmg;entry.reflect=r.reflect||0;}}
 else{const r=hit(m,f,foe,role==='control'?pct*.6:role==='drain'?pct*.8:pct,crit,at,mult);entry.dmg=r.dmg;entry.absorbed=r.absorbed||0;entry.reflect=r.reflect||0;
  if(role==='control')applyEffect(m,f,foe,'stun',at,entry,r.dmg);
  if(role==='drain'){const heal=Math.min(f.maxHp-f.hp,Math.round(r.dmg*.7));f.hp+=heal;entry.heal=heal;}
  if(skill.effect&&skill.effect!=='none')applyEffect(m,f,foe,skill.effect,at,entry,r.dmg);}
 entry.hpBy=f.hp;entry.hpTo=foe.hp;entry.ko=foe.hp<=0||f.hp<=0;
 pushLog(m,entry);
}
// Độc/bỏng: trừ máu theo nhịp, là một mốc trong dòng thời gian như một đòn.
function dotTick(m,id){
 const f=m.fighters[id],d=f.dot,at=d.next;d.next+=900;if(d.next>d.until)f.dot=null;
 const dmg=capLocked(m,f,d.per);f.hp=Math.max(0,f.hp-dmg);
 pushLog(m,{n:++m.n,at,by:d.by,to:id,dot:true,dmg,hpTo:f.hp,hpBy:m.fighters[d.by].hp,ko:f.hp<=0,skill:{name:'Độc khí',tech:'soul',color:'#9dff7a'}});
}
function nextEvent(m){
 let best=null;
 for(const id of [m.a,m.b]){if(best==null||m.next[id]<best.at)best={at:m.next[id],id,kind:'act'};
  const d=m.fighters[id].dot;if(d&&d.next<=d.until&&d.next<best.at)best={at:d.next,id,kind:'dot'};}
 return best;
}
/** Quà trợ chiêu (15/11): quà của đấu thủ hoặc người xem tặng hộ đấu thủ. Bậc theo giá 1 món:
 * 1–9 linh khí (+nộ) · 10–98 hồi máu · 99–498 triệu hồi thần thú · 499–1.999 pháp bảo bạo phát + khiên · ≥2.000 Thiên Giáng. */
export const ARENA_GIFT_TIERS=Object.freeze([
 {min:2000,trick:'heaven',label:'Thiên Giáng',tier:4},
 {min:499,trick:'burst',label:'Pháp Bảo Bạo Phát',tier:3},
 {min:99,trick:'summon',label:'Triệu Hồi Thần Thú',tier:3},
 {min:10,trick:'heal',label:'Hồi Xuân Thuật',tier:2},
 {min:1,trick:'qi',label:'Linh Khí Quán Đỉnh',tier:1}
]);
const HEAVEN=Object.freeze([{id:'axe',name:'Thiên Giáng · Khai Thiên Cự Phủ',tech:'thunder',art:'axe'},{id:'swords',name:'Thiên Giáng · Vạn Kiếm Quy Nhất',tech:'sword',art:'sword-rain'}]);
export function arenaGift(w,p,coins,now,{from=null,count=1}={}){
 const m=w.arena?.current;if(!arenaOpen(w,now)||!m||now<m.fightAt||now>=m.endsAt)return null;
 const f=m.fighters[p?.id];const unit=Number(coins)||0;if(!f||!(unit>0))return null;
 const foeId=p.id===m.a?m.b:m.a,foe=m.fighters[foeId],t=ARENA_GIFT_TIERS.find(x=>unit>=x.min),n=Math.max(1,Math.min(99,Number(count)||1));
 const entry={n:++m.n,at:now,by:p.id,to:foeId,slot:0,gift:true,trick:t.trick,tier:t.tier,from:from&&from.id!==p.id?from.name:null,skill:{name:t.label,tech:f.kit[ARENA_ULT_SLOT-1].tech,color:'#ffd27a',role:'gift'}};
 f.rage=Math.min(100,f.rage+Math.min(60,Math.round(10+Math.log10(unit*n+1)*15)));
 if(t.trick==='qi'){entry.rage=f.rage;entry.target='self';}
 else if(t.trick==='heal'){const heal=Math.min(f.maxHp-f.hp,Math.round(f.maxHp*Math.min(.12,.06+Math.log10(unit)*.03)));f.hp+=heal;entry.heal=heal;entry.target='self';}
 else{
  let pct=.12,crit=true;
  if(t.trick==='summon'){pct=.10+Math.min(.04,Math.log10(unit/99+1)*.04);entry.skill.tech='flame';entry.skill.name='Triệu Hồi Hỏa Long';entry.skill.art='fire-dragon';}
  if(t.trick==='burst'){pct=.17;const sh=Math.round(f.maxHp*.12);f.shield+=sh;entry.shield=sh;}
  if(t.trick==='heaven'){pct=.28;const a=w.arena,pick=HEAVEN.find(h=>h.id!==a.lastHeaven)||HEAVEN[0];a.lastHeaven=pick.id;entry.heaven=pick.id;entry.skill.name=pick.name;entry.skill.tech=pick.tech;entry.skill.art=pick.art;}
  const r=hit(m,f,foe,pct,crit,now);entry.dmg=r.dmg;entry.absorbed=r.absorbed;entry.reflect=r.reflect||0;entry.crit=true;
 }
 entry.hpBy=f.hp;entry.hpTo=foe.hp;entry.ko=foe.hp<=0;
 pushLog(m,entry);
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
  for(let guard=0;guard<60&&now>=m.fightAt;guard++){
   const ev=nextEvent(m);if(!ev||ev.at>Math.min(now,m.endsAt))break;
   if(ev.kind==='dot')dotTick(m,ev.id);else act(w,m,ev.id,now);
   if(m.fighters[m.a].hp<=0||m.fighters[m.b].hp<=0)break;
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
 const m=a.current,fview=f=>({name:f.name,realm:f.realm,hp:f.hp,maxHp:f.maxHp,rage:f.rage,shield:f.shield,stunned:f.stunUntil>now,weak:f.weakUntil>now,reflect:f.reflectUntil>now,poison:!!f.dot,hanh:f.hanh,
  cd:Object.fromEntries([1,2,3,4].map(s=>[s,Math.max(0,f.cd[s]-now)])),kit:f.kit.map(k=>({slot:k.slot,name:k.name,tech:k.tech,color:k.color,role:k.role,lv:k.lv,pet:k.pet||null,tier:k.tier,effect:k.effect,hanh:k.hanh,art:k.art||null}))});
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
