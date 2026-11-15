// 15/11 v2: NGŨ ĐƯỜNG GIAO LƯU — bản đồ 5 doanh trại + Trung Ương Chiến Đài (ảnh ngu-duong-chien-truong/map.webp).
// Server giữ vị trí thật (toạ độ khung 900×1600, xem public/hall-war-layout.js). Mỗi nhịp 1 s mọi tu sĩ tự đi về kẻ địch
// GẦN NHẤT, vào tầm thì tung chiêu của Đường mình lên đúng người đó. Bị hạ → về trại hồi sinh 5 s. Đứng trong Chiến Đài
// đông hơn thì Đường đó được cộng điểm giữ đài. Gõ 6/đánh: lao lên + chiêu mạnh; "đánh @tên": khóa mục tiêu 10 s.
// Quà (tổng coin một lần): 1–29 cuồng hóa, 30+ tuyệt chiêu lan 3, 99+ lan 6, 300+ đại tuyệt chiêu lan 10.
// Vài trăm người: tìm mục tiêu bằng lưới ô 160 px (không O(n²)), fx giữ tối đa 96 mục.
import {activeHalls} from './ngu-duong.mjs';
import {stageConflict} from './stage-lock.mjs';
import {campSpots,inAltar,skillOf,specialOf,giftTier,ALTAR,BOUNDS,SPECIAL_EVERY,AURA_MS,GIFT_TIERS} from './public/hall-war-layout.js';
export {campSpots,skillOf};
export const REGISTER_MS=30000,BATTLE_MS=180000,PODIUM_MS=14000;
export const RESPAWN_MS=5000,LOCK_MS=10000,MANUAL_CD=3500,CRIT_RATE=15,CRIT_MULT=1.8,COMBO_MS=1500,COMBO_MULT=1.25;
const SPEED=78,GRID=160,MAX_FX=96,MAX_FEED=8,DAMAGE_SCALE=1.25,AGGRO=215,SPACING=30,ALTAR_POINTS=10;
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
const fail=message=>({ok:false,message});
export const hallWarVisible=(w,now)=>['registration','running'].includes(w.hallWar?.phase)||w.hallWar?.podiumUntil>now;
const hallOf=(w,id)=>Object.hasOwn(w.nguDuong?.members||{},id)?w.nguDuong.members[id].index:null;
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const plain=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
const clampX=x=>Math.max(BOUNDS.x0,Math.min(BOUNDS.x1,x)),clampY=y=>Math.max(BOUNDS.y0,Math.min(BOUNDS.y1,y));
const campOf=(e,index)=>{const slot=e.teams.findIndex(t=>t.index===index);return e.camps[Math.max(0,slot)];};
function spawnAt(e,m,now){
 const camp=campOf(e,m.index),h=hash(m.id+':'+(m.deaths||0)),a=(h%360)*Math.PI/180,r=14+(h>>9)%60;
 m.x=Math.round(clampX(camp.x+Math.cos(a)*r));m.y=Math.round(clampY(camp.y+Math.sin(a)*r*.6));m.hp=100;m.target=null;m.streak=0;
 m.nextCastAt=now+600+(h%900);
}
function enroll(w,p,now){
 const e=w.hallWar,index=hallOf(w,p.id);
 if(!real(p)||w.playTransfers?.[p.id]?.phase==='web'||index==null||!e.teams.some(t=>t.index===index))return false;
 if(!Object.hasOwn(e.members,p.id)){
  const m={id:p.id,index,joinedAt:now,hp:100,score:0,kills:0,deaths:0,streak:0,boostUntil:0,lastManual:0};
  Object.defineProperty(e.members,p.id,{value:m,enumerable:true,writable:true,configurable:true});spawnAt(e,m,now);
 }
 return true;
}
export function startHallWar(w,now,ctx){
 const busy=stageConflict(w,now);if(busy)return fail('Đang có '+busy+' • chờ kết thúc trước khi mở Ngũ Đường Giao Lưu.');
 const active=Object.values(w.players).filter(p=>real(p)&&ctx.active(w,p,now)&&hallOf(w,p.id)!=null);
 if(new Set(active.map(p=>hallOf(w,p.id))).size<2)return fail('Cần ít nhất 2 Đường có người đang hoạt động.');
 const teams=activeHalls(w).map(({index,name,color,mark})=>({index,name,color,mark,score:0,kills:0,altar:0}));
 w.hallWar={id:'hall-war-'+now,version:2,phase:'registration',startedAt:now,registrationEndsAt:now+REGISTER_MS,members:{},teams,camps:campSpots(teams.length),fx:[],feed:[],seq:0,altar:null};
 for(const p of active)enroll(w,p,now);
 ctx.emit(w,null,'NGŨ ĐƯỜNG GIAO LƯU • 30 giây tập hợp • gõ đường chiến hoặc 6 để vào trận theo Đường đã gia nhập','hall-war',now,{hallWarStart:true});
 return {ok:true};
}
export function stopHallWar(w,now,ctx){
 if(!hallWarVisible(w,now))return fail('Chưa có Ngũ Đường Giao Lưu.');
 w.hallWar.phase='cancelled';w.hallWar.podiumUntil=0;ctx.emit(w,null,'Ngũ Đường Giao Lưu đã dừng • giữ điểm hoạt động đã ghi nhận','hall-war',now,{hallWarEnd:true,cancelled:true});return {ok:true};
}
const power=p=>Math.max(7,Math.min(20,Math.log10(Math.max(0,p.totalQi||0)+10)*2));
const fighting=(w,m,now,ctx)=>m.hp>0&&real(w.players[m.id])&&w.playTransfers?.[m.id]?.phase!=='web'&&ctx.active(w,w.players[m.id],now);
const open=(o,now)=>o.hp>0&&(o.shieldUntil||0)<=now;
export function grid(list){const g=new Map();for(const m of list){const k=Math.floor(m.x/GRID)+':'+Math.floor(m.y/GRID);let cell=g.get(k);if(!cell)g.set(k,cell=[]);cell.push(m);}return g;}
// Kẻ địch gần nhất: quét các ô lân cận theo vòng mở rộng, dừng khi đã chắc chắn gần nhất.
export function nearest(g,m,maxRing=12,filter=()=>true){
 const cx=Math.floor(m.x/GRID),cy=Math.floor(m.y/GRID);let best=null,bd=Infinity;
 for(let r=0;r<=maxRing;r++){
  for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;
   for(const o of g.get((cx+dx)+':'+(cy+dy))||[]){if(o.index===m.index||!filter(o))continue;const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<bd||d===bd&&o.id<best.id){bd=d;best=o;}}
  }
  if(best&&bd<=r*GRID)break;
 }
 return best?{target:best,dist:bd}:null;
}
function around(g,x,y,radius,skipIndex){
 const out=[],r=Math.ceil(radius/GRID),cx=Math.floor(x/GRID),cy=Math.floor(y/GRID);
 for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++)for(const o of g.get((cx+dx)+':'+(cy+dy))||[])if(o.index!==skipIndex&&Math.hypot(o.x-x,o.y-y)<=radius)out.push(o);
 return out;
}
function pushFx(e,fx){e.fx.push(fx);if(e.fx.length>MAX_FX)e.fx.splice(0,e.fx.length-MAX_FX);}
function streakSay(w,e,member,now,ctx){
 const s=member.streak;if(!(s===3||s===5||s>5&&s%5===0)||now-(e.lastStreakSay||0)<8000)return;
 e.lastStreakSay=now;const p=w.players[member.id];
 ctx.emit(w,p,'liên tiếp phá trận '+s+' đối thủ • '+(e.teams.find(t=>t.index===member.index)?.name||''),'hall-war',now,{hallWarStreak:s,hallIndex:member.index});
}
function hit(w,e,member,target,damage,now,ctx){
 const team=e.teams.find(t=>t.index===member.index);
 const actual=Math.min(target.hp,Math.max(1,Math.round(damage)));target.hp-=actual;member.score+=actual;if(team)team.score+=actual;
 if(target.hp<=0){
  target.respawnAt=now+RESPAWN_MS;target.deaths=(target.deaths||0)+1;target.streak=0;target.lockId=null;
  member.kills++;member.streak=(member.streak||0)+1;if(team){team.kills++;team.score+=25;}
  e.feed.push({at:now,from:member.id,to:target.id,index:member.index,toIndex:target.index});if(e.feed.length>MAX_FEED)e.feed.splice(0,e.feed.length-MAX_FEED);
  streakSay(w,e,member,now,ctx);
 }
 return actual;
}
// Một đòn: chiêu theo Đường, đúng mục tiêu. value>0 = quà → tuyệt chiêu đánh lan theo mốc.
function cast(w,e,g,member,target,now,ctx,{manual=false,value=0}={}){
 const p=w.players[member.id],skill=skillOf(member.index),tier=value>0?giftTier(value):null,seq=e.seq++;
 const crit=hash(e.id+':crit:'+seq)%100<CRIT_RATE;
 // Hợp kích: đồng môn khác vừa đánh cùng mục tiêu trong 1,5 s.
 const combo=target.lastHitIndex===member.index&&target.lastHitBy!==member.id&&now-(target.lastHitAt||0)<=COMBO_MS;
 target.lastHitIndex=member.index;target.lastHitBy=member.id;target.lastHitAt=now;
 if(combo&&(e.combo?.index!==member.index||now-e.combo.at>3000))e.combo={index:member.index,at:now};else if(combo)e.combo.at=now;
 const base=power(p)*DAMAGE_SCALE*skill.mult*(manual?1.5:1)*(member.boostUntil>now?1.5:1)*(crit?CRIT_MULT:1)*(combo?COMBO_MULT:1);
 const spread=tier?.spread||0,ultimate=spread>0||tier?.id==='swords';
 const victims=spread?[target,...around(g,target.x,target.y,tier.radius,member.index).filter(o=>o!==target&&open(o,now)).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y)).slice(0,spread)]:[target];
 const hits=[];
 for(const v of victims){
  const dmg=Math.min(95,base*(ultimate?1+Math.log10(value+1)*.6:1)*(v===target?1:.7));
  const actual=hit(w,e,member,v,dmg,now,ctx);hits.push({id:v.id,damage:actual,knockout:v.hp<=0});
 }
 if(skill.heal){const allies=around(g,member.x,member.y,180,-1).filter(o=>o.index===member.index&&o.hp>0).sort((a,b)=>a.hp-b.hp);const ally=allies[0]||member;ally.hp=Math.min(100,ally.hp+skill.heal);}
 pushFx(e,{id:e.id+':'+seq,from:member.id,to:target.id,index:member.index,skill:skill.id,at:now,x1:member.x,y1:member.y,x2:target.x,y2:target.y,
  damage:hits[0].damage,total:hits.reduce((n,h)=>n+h.damage,0),knockout:hits[0].knockout,crit:crit||undefined,combo:combo||undefined,ultimate:tier?.id==='ultimate'||tier?.id==='grand'||undefined,grand:tier?.grand||undefined,assist:tier?.id,value:value||undefined,manual:manual||undefined,
  hits:hits.length>1?hits.slice(1):undefined});
 member.nextCastAt=now+skill.cd*(member.boostUntil>now?.7:1);
 ctx.contribute(w,p,now,'event');
 return true;
}
// Chiêu đặc biệt của Đường (mỗi lượt ra chiêu thứ 4): đánh lan / khiên / hồi máu đồng môn.
function castSpecial(w,e,g,member,target,now,ctx){
 const p=w.players[member.id],sp=specialOf(member.index),seq=e.seq++;
 const base=power(p)*DAMAGE_SCALE*sp.mult*(member.boostUntil>now?1.5:1);
 const cx=sp.around==='self'?member.x:target.x,cy=sp.around==='self'?member.y:target.y;
 const pool=sp.radius?around(g,cx,cy,sp.radius,member.index).filter(o=>open(o,now)).sort((a,b)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(b.x-cx,b.y-cy)||(a.id<b.id?-1:1)):[];
 const victims=sp.around==='self'?pool.slice(0,sp.max):[target,...pool.filter(o=>o!==target)].slice(0,sp.max);
 if(!victims.length)return false;
 const hits=victims.map(v=>{const actual=hit(w,e,member,v,Math.min(95,base*(v===target?1:.85)),now,ctx);return {id:v.id,damage:actual,knockout:v.hp<=0};});
 if(sp.shield)member.shieldUntil=Math.max(member.shieldUntil||0,now+sp.shield);
 let healed;
 if(sp.healAllies){healed=around(g,member.x,member.y,180,-1).filter(o=>o.index===member.index&&o.hp>0).slice(0,4);for(const a of healed)a.hp=Math.min(100,a.hp+sp.healAllies);healed=healed.map(a=>a.id);}
 pushFx(e,{id:e.id+':'+seq,from:member.id,to:victims[0].id,index:member.index,skill:skillOf(member.index).id,special:sp.id,at:now,x1:member.x,y1:member.y,x2:victims[0].x,y2:victims[0].y,
  damage:hits[0].damage,total:hits.reduce((n,h)=>n+h.damage,0),knockout:hits[0].knockout,hits:hits.length>1?hits.slice(1):undefined,healed});
 member.nextCastAt=now+skillOf(member.index).cd*(member.boostUntil>now?.7:1);ctx.contribute(w,p,now,'event');return true;
}
function step(m,tx,ty,dist,stopAt,speed=SPEED){
 if(dist<=stopAt)return;const move=Math.min(speed,dist-stopAt);m.x=Math.round(clampX(m.x+(tx-m.x)/dist*move));m.y=Math.round(clampY(m.y+(ty-m.y)/dist*move));
}
// Đứng quanh mục tiêu theo góc riêng của mỗi người → cả nhóm vây quanh chứ không chồng lên một điểm.
function approach(m,target,dist,range,speed){
 const a=(hash(m.id)%360)*Math.PI/180,stand=range*.75;
 const tx=target.x+Math.cos(a)*stand*.35,ty=target.y+Math.sin(a)*stand*.25;
 step(m,tx,ty,Math.hypot(tx-m.x,ty-m.y),stand*.65,speed);
}
const lockedTarget=(e,m,now)=>{if(!m.lockId||now>(m.lockUntil||0))return null;const t=e.members[m.lockId];return t&&t.hp>0?t:null;};
function findTarget(e,g,m,now,maxRing){
 const locked=lockedTarget(e,m,now);
 if(locked&&open(locked,now))return {target:locked,dist:Math.hypot(locked.x-m.x,locked.y-m.y),locked:true};
 return nearest(g,m,maxRing,o=>open(o,now));
}
const aliveGrid=(w,e,now,ctx)=>grid(Object.values(e.members).filter(m=>fighting(w,m,now,ctx)));
export function hallWarCommand(w,p,words,now,ctx){
 const text=words.join(' '),join=['duong chien','duongchien','tranh phong','tranhphong'].includes(text);
 const attack=words.length===1&&['danh','kiem'].includes(words[0]),named=words.length>1&&words[0]==='danh'&&w.hallWar?.phase==='running';
 if(!join&&!named&&!(attack&&w.hallWar?.phase==='running'))return null;
 const e=w.hallWar;if(!e||!['registration','running'].includes(e.phase))return fail('Ngũ Đường Giao Lưu chưa mở.');
 if(!enroll(w,p,now))return fail('Gõ vào đường 1–5 trước khi tham gia Đường chiến.');
 const member=e.members[p.id],teamName=e.teams.find(t=>t.index===member.index).name;
 if(named){
  const want=plain(words.slice(1).join('')),enemies=Object.values(e.members).filter(m=>m.index!==member.index);
  const nameOf=m=>plain(w.players[m.id]?.name||''),pick=enemies.find(m=>nameOf(m)===want)||enemies.find(m=>want.length>=2&&nameOf(m).startsWith(want))||enemies.find(m=>want.length>=3&&nameOf(m).includes(want));
  if(!pick)return fail('Không thấy đối thủ tên đó ở Đường khác trong trận.');
  member.lockId=pick.id;member.lockUntil=now+LOCK_MS;member.target=pick.id;
  ctx.emit(w,p,'khóa mục tiêu '+(w.players[pick.id]?.name||'đối thủ')+' • 10 giây','hall-war',now,{hallWarAction:true,hallWarLock:true});return {ok:true};
 }
 if(e.phase==='running'){
  if(now-member.lastManual<MANUAL_CD)return fail('Chiêu đang hồi • chờ '+Math.ceil((MANUAL_CD-now+member.lastManual)/1000)+' giây.');
  if(member.hp<=0)return fail('Đang hồi trận • chờ vài giây.');
  member.lastManual=now;
  const g=aliveGrid(w,e,now,ctx),found=findTarget(e,g,member,now,40);
  if(found){
   const skill=skillOf(member.index);
   // Lao lên: rút ngắn khoảng cách tới đúng tầm chiêu rồi đánh ngay.
   if(found.dist>skill.range){step(member,found.target.x,found.target.y,found.dist,skill.range*.8,Math.max(SPEED*3,found.dist-skill.range*.8));member.dashAt=now;}
   member.target=found.target.id;cast(w,e,g,member,found.target,now,ctx,{manual:true});
  }
 }
 ctx.emit(w,p,(e.phase==='registration'?'Đã tập hợp cùng ':'Xuất chiêu vì ')+teamName,'hall-war',now,{hallWarAction:true});return {ok:true};
}
// Quà = trợ chiêu (xem GIFT_TIERS): cuồng hóa / hồi xuân / phi kiếm / lôi kích / tuyệt chiêu / đại tuyệt chiêu.
export function hallWarGift(w,p,value,now,ctx){
 const e=w.hallWar;if(!['registration','running'].includes(e?.phase)||!enroll(w,p,now)||value<1)return null;
 const member=e.members[p.id],tier=giftTier(value);member.boostUntil=Math.max(member.boostUntil||0,now+Math.min(16000,4000+Math.sqrt(value)*500));
 // Hào quang: giữ mốc cao nhất còn hiệu lực (tặng nhỏ không làm tụt cánh vàng của quà lớn).
 const rank=id=>GIFT_TIERS.length-GIFT_TIERS.findIndex(x=>x.id===id),cur=member.aura&&member.aura.until>now?member.aura:null;
 if(!cur||rank(tier.id)>=rank(cur.tier))member.aura={tier:tier.id,since:cur?.tier===tier.id?cur.since:now,until:now+AURA_MS[tier.id]};else cur.until=Math.max(cur.until,now+AURA_MS[tier.id]);
 let struck=false;
 if(e.phase==='running'){
  if(tier.heal){
   if(member.hp<=0){spawnAt(e,member,now);member.respawnAt=0;}
   member.hp=100;member.shieldUntil=now+3000;struck=true;
   pushFx(e,{id:e.id+':'+(e.seq++),kind:'assist',assist:'heal',from:member.id,to:member.id,index:member.index,at:now,x1:member.x,y1:member.y,x2:member.x,y2:member.y});
  }else if(member.hp>0&&tier.swords){
   const g=aliveGrid(w,e,now,ctx);
   const targets=around(g,member.x,member.y,900,member.index).filter(o=>open(o,now)).sort((a,b)=>Math.hypot(a.x-member.x,a.y-member.y)-Math.hypot(b.x-member.x,b.y-member.y)||(a.id<b.id?-1:1)).slice(0,tier.swords);
   for(const target of targets)struck=cast(w,e,g,member,target,now,ctx,{value})||struck;
   if(targets[0])member.target=targets[0].id;
  }else if(member.hp>0&&tier.spread>0){
   const g=aliveGrid(w,e,now,ctx),found=findTarget(e,g,member,now,40);
   // Tuyệt chiêu từ quà bay thẳng tới mục tiêu, không phải chạy lại gần.
   if(found){member.target=found.target.id;struck=cast(w,e,g,member,found.target,now,ctx,{value});}
  }
 }
 if(e.phase==='running'&&!struck&&member.hp>0)pushFx(e,{id:e.id+':'+(e.seq++),kind:'assist',assist:'boost',from:member.id,to:member.id,index:member.index,at:now,x1:member.x,y1:member.y,x2:member.x,y2:member.y});
 return {index:member.index,boostUntil:member.boostUntil,tier:tier.label,assist:tier.id,name:tier.name,struck};
}
function finish(w,now,ctx){
 const e=w.hallWar;e.phase='finished';e.podiumUntil=now+PODIUM_MS;e.endsAt=now;
 if(e.awarded)return;e.awarded=true;
 const present=new Set(Object.values(e.members).map(m=>m.index));
 e.results=e.teams.filter(t=>present.has(t.index)&&t.score>0).sort((a,b)=>b.score-a.score||b.kills-a.kills||a.index-b.index);
 for(const [rank,team] of e.results.entries()){
  if(team.score<=0)continue;
  ctx.hallPoints(w,team.index,[80,50,30,15][rank]??10,now);
  for(const m of Object.values(e.members).filter(m=>m.index===team.index&&m.score>0)){
   const p=w.players[m.id];if(!real(p)||w.playTransfers?.[p.id]?.phase==='web')continue;
   p.hallWarMedals=(p.hallWarMedals||0)+Math.max(1,5-rank);
   const stones=Math.max(10,60-rank*10),qi=ctx.gain(w,p,[600,400,250,150][rank]??100,stones,5,now,false,'event');
   (e.rewards??=[]).push({id:p.id,name:p.name,index:team.index,rank:rank+1,qi,stones,herbs:5});
   ctx.emit(w,p,team.name+' hạng '+(rank+1)+' • +'+qi+' tu vi • điểm so tài đã cộng vào bảng tuần','hall-war',now,{hallWarReward:true,hallIndex:team.index,rank:rank+1,reward:{qi,stones,herbs:5}});
  }
 }
 const summary={id:e.id,at:now,results:e.results.map(t=>({...t})),rewardCount:(e.rewards||[]).length,mvp:Object.values(e.members).sort((a,b)=>b.score-a.score).slice(0,10).map(m=>({id:m.id,name:w.players[m.id]?.name,index:m.index,score:m.score,kills:m.kills}))};
 (w.hallWarHistory??=[]).push(summary);w.hallWarHistory=w.hallWarHistory.slice(-24);
 ctx.emit(w,null,'NGŨ ĐƯỜNG GIAO LƯU • '+(e.results.length?e.results[0].name+' giành ngôi đầu':'chưa có điểm so tài, chưa xếp hạng')+' • kết quả đã lưu vào lịch sử tuần','hall-war',now,{hallWarEnd:true});
}
// Một nhịp chiến trường (server tick 1 s).
export function battleTick(w,e,now,ctx){
 const roster=Object.values(e.members).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 for(const m of roster)if(m.hp<=0&&now>=(m.respawnAt||0)){spawnAt(e,m,now);m.shieldUntil=now+1500;}
 const alive=roster.filter(m=>fighting(w,m,now,ctx)),g=grid(alive);
 // Luân phiên thứ tự hành động để Đường đăng ký trước không luôn ra tay trước.
 const cursor=(e.castCursor||0)%Math.max(1,alive.length);e.castCursor=(e.castCursor||0)+1;
 for(let i=0;i<alive.length;i++){
  const m=alive[(cursor+i)%alive.length];if(m.hp<=0)continue;
  const skill=skillOf(m.index),speed=SPEED*(m.boostUntil>now?1.4:1),seen=findTarget(e,g,m,now,2),found=seen&&(seen.locked||seen.dist<=AGGRO)?seen:null;
  if(!found){ // không còn địch trong tầm quét → tiến về Chiến Đài
   const a=(hash(m.id)%360)*Math.PI/180,ax=ALTAR.x+Math.cos(a)*ALTAR.rx*.5,ay=ALTAR.y+Math.sin(a)*ALTAR.ry*.5;step(m,ax,ay,Math.hypot(ax-m.x,ay-m.y),20,speed);m.target=null;continue;
  }
  m.target=found.target.id;
  if(found.dist<=skill.range){if(now>=(m.nextCastAt||0)){m.castCount=(m.castCount||0)+1;if(m.castCount%SPECIAL_EVERY===0)castSpecial(w,e,g,m,found.target,now,ctx);else cast(w,e,g,m,found.target,now,ctx);}}
  else approach(m,found.target,found.dist,skill.range,speed);
 }
 // Giãn cách: đẩy nhẹ những người đứng chồng lên nhau (chỉ xét trong ô lưới + ô kề) → đám đông thành vòng vây dễ nhìn.
 const spread=grid(alive.filter(m=>m.hp>0));
 for(const [key,cell] of spread){const [cx,cy]=key.split(':').map(Number);
  for(const m of cell)for(let dx=0;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(dx===0&&dy<0)continue;for(const o of spread.get((cx+dx)+':'+(cy+dy))||[]){
   if(o===m||(dx===0&&dy===0&&o.id<=m.id))continue;const d=Math.hypot(o.x-m.x,o.y-m.y);if(d>=SPACING)continue;
   const push=(SPACING-d)/2,ang=d>0.5?Math.atan2(o.y-m.y,o.x-m.x):(hash(m.id+o.id)%360)*Math.PI/180;
   m.x=Math.round(clampX(m.x-Math.cos(ang)*push));m.y=Math.round(clampY(m.y-Math.sin(ang)*push));o.x=Math.round(clampX(o.x+Math.cos(ang)*push));o.y=Math.round(clampY(o.y+Math.sin(ang)*push));}}}
 // Giữ Chiến Đài: Đường đông nhất trong đài (hơn hẳn Đường thứ hai) được +10 điểm mỗi nhịp.
 const counts=new Map();for(const m of alive)if(m.hp>0&&inAltar(m))counts.set(m.index,(counts.get(m.index)||0)+1);
 const ranked=[...counts].sort((a,b)=>b[1]-a[1]);
 const holder=ranked[0]&&(!ranked[1]||ranked[0][1]>ranked[1][1])?ranked[0][0]:null;
 if(holder!=null){const team=e.teams.find(t=>t.index===holder);team.score+=ALTAR_POINTS;team.altar=(team.altar||0)+1;
  if(e.altar?.index!==holder){e.altar={index:holder,since:now};pushFx(e,{id:e.id+':'+(e.seq++),kind:'altar',index:holder,at:now});}}
 else if(e.altar&&!counts.size)e.altar=null;
}
export function tickHallWar(w,now,ctx){
 const e=w.hallWar;if(!e)return;
 // Trận cũ (v1, đang chạy lúc nâng cấp) chưa có vị trí → bổ sung.
 e.camps??=campSpots(e.teams.length);e.feed??=[];
 for(const m of Object.values(e.members))if(m.x==null)spawnAt(e,m,now);
 if(e.phase==='registration'&&now>=e.registrationEndsAt){
  for(const m of Object.values(e.members))if(!ctx.active(w,w.players[m.id],now))delete e.members[m.id];
  if(new Set(Object.values(e.members).map(m=>m.index)).size<2){e.phase='cancelled';ctx.emit(w,null,'Chưa đủ hai Đường tập hợp • chưa trao thưởng','hall-war',now,{hallWarEnd:true});return;}
  e.phase='running';e.battleStartedAt=now;e.endsAt=now+BATTLE_MS;
  for(const m of Object.values(e.members))m.nextCastAt=now+1200+hash(m.id)%1200;
  ctx.emit(w,null,'NGŨ ĐƯỜNG KHAI HỘI • tu sĩ kéo về Chiến Đài, gặp đối thủ gần nhất là ra chiêu • giữ Chiến Đài để cộng điểm • gõ 6 để lao lên • đánh @tên để khóa mục tiêu','hall-war',now,{hallWarBattle:true});
 }
 if(e.phase!=='running')return;if(now>=e.endsAt){finish(w,now,ctx);return;}
 battleTick(w,e,now,ctx);
}
// Gửi xuống overlay: gọn (vài trăm người × ~12 trường), fx 4 s gần nhất.
export function hallWarView(w,now){
 const e=w.hallWar;if(!e)return null;
 return {id:e.id,version:2,phase:e.phase,active:hallWarVisible(w,now),startedAt:e.startedAt,registrationEndsAt:e.registrationEndsAt,battleStartedAt:e.battleStartedAt,endsAt:e.endsAt,podiumUntil:e.podiumUntil,
  teams:e.teams,camps:e.camps||campSpots(e.teams.length),altar:e.altar,combo:e.combo&&now-e.combo.at<3000?e.combo:null,results:e.results,rewardCount:(e.rewards||[]).length,
  mvp:(w.hallWarHistory||[]).find(h=>h.id===e.id)?.mvp?.slice(0,3)||[],
  feed:(e.feed||[]).filter(f=>now-f.at<10000).slice(-4).map(f=>({...f,fromName:w.players[f.from]?.name||'Đạo hữu',toName:w.players[f.to]?.name||'Đạo hữu'})),
  members:Object.values(e.members).map(m=>({id:m.id,index:m.index,x:m.x,y:m.y,hp:m.hp,score:m.score,kills:m.kills,streak:m.streak||undefined,joinedAt:m.joinedAt,respawnAt:m.hp<=0?m.respawnAt:undefined,shieldUntil:m.shieldUntil>now?m.shieldUntil:undefined,boostUntil:m.boostUntil>now?m.boostUntil:undefined,target:m.target||undefined,locked:m.lockId&&now<=(m.lockUntil||0)?m.lockId:undefined,dashAt:m.dashAt>now-1500?m.dashAt:undefined,aura:m.aura&&m.aura.until>now?m.aura:undefined,name:w.players[m.id]?.name||'Đạo hữu',avatar:w.players[m.id]?.avatar,realm:w.players[m.id]?.realm})),
  fx:e.fx.filter(f=>now-f.at<4000),history:(w.hallWarHistory||[]).slice(-4).reverse()};
}
