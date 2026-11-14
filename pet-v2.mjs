// Vân Hải Tông · Pet V2, server-authoritative gameplay for LIVE/demo only.
// No web gameplay, no payment-to-XP, and no mutation of legacy pet ownership.
import {petById} from './public/spirit-pets.js';
import {petV2Skill,petStageName,petXpNext,petBasePoints,petStageUnlocked} from './public/pet-v2-catalog.js';
import {stageConflict} from './stage-lock.mjs';
import {petV2GearResonance,petV2Route,petV2ExpeditionAffinity,petV2Combination} from './pet-v2-systems.mjs';
const V2_DEFAULTS=Object.freeze({enabled:false,progression:false,combat:false,evolutionArt:false,coveV2:false,expedition:false,synergy:false,quality:'auto'});
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const dayOf=t=>new Date(t+7*3600000).toISOString().slice(0,10);
const valid=p=>!!p&&!p.puppet&&!p.resident&&!p.webOnly&&p.actorKind!=='npc';
export const petV2Flags=w=>({...V2_DEFAULTS,...(w.settings?.petV2||{})});
export const petV2On=(w,part='progression')=>['live','demo'].includes(w.mode)&&petV2Flags(w).enabled&&petV2Flags(w)[part]===true;
export function petV2Configure(w,settings={}){
 const allowed=['enabled','progression','combat','evolutionArt','coveV2','expedition','synergy'];
 if(!settings||typeof settings!=='object'||Object.keys(settings).some(k=>!allowed.includes(k)||typeof settings[k]!=='boolean'))return {ok:false,message:'Cấu hình Linh Thú V2 không hợp lệ.'};
 // Animation gate: do not activate evolved artwork before 39 fully verified new atlases exist.
 if(settings.evolutionArt===true)return {ok:false,message:'Chưa có đủ 39 atlas tiến hóa đã kiểm thử; tiếp tục dùng đủ animation gốc.'};
 w.settings??={};w.settings.petV2={...petV2Flags(w),...settings};return {ok:true,petV2:w.settings.petV2};
}
function allowedPlayer(w,p,id=p?.spiritPet){
 return valid(p)&&!(w.playTransfers?.[p.id]?.phase==='web')&&!!id&&p.spiritPets?.includes(id)&&!!petById(id);
}
function storage(w,create=false){
 if(!create)return w.petGrowthV2?.schema===2?w.petGrowthV2:null;
 if(!w.petGrowthV2||w.petGrowthV2.schema!==2)w.petGrowthV2={schema:2,players:{},activeExpeditions:{},cinematics:[],coveSessions:{}};
 const s=w.petGrowthV2;
 s.players??={};s.activeExpeditions??={};s.cinematics??=[];s.coveSessions??={};
 return s;
}
function freshPet(){return {level:1,xp:0,bond:0,stage:0,trains:0,expeditions:0,lastFedAt:0,lastTrainedAt:0,nextSkillAt:0,armedUntil:0};}
function freshPlayer(){return {inventory:{spiritFood:1,evolutionShards:0},pets:{},daily:{day:'',earnedXp:0,sourceCounts:{},feed:0,train:0,expeditionClaims:0},expedition:null,options:{autoSkill:true,reducedPetFx:false}};}
function owner(w,p,create=false){
 if(!valid(p))return null;
 const s=storage(w,create);if(!s)return null;
 if(create){s.players[p.id]??=freshPlayer();return s.players[p.id];}
 return Object.hasOwn(s.players,p.id)?s.players[p.id]:null;
}
function growth(w,p,id=p?.spiritPet,create=false){
 if(!allowedPlayer(w,p,id))return null;
 const o=owner(w,p,create);if(!o)return create?null:freshPet();
 if(create)o.pets[id]??=freshPet();
 return o.pets[id]||freshPet();
}
function daily(o,t){
 const day=dayOf(t);if(o.daily?.day!==day)o.daily={day,earnedXp:0,sourceCounts:{},feed:0,train:0,expeditionClaims:0};
 return o.daily;
}
export function petV2View(w,p,id=p?.spiritPet){
 if(!petV2Flags(w).enabled||!allowedPlayer(w,p,id))return null;
 const g=growth(w,p,id),s=petV2Skill(id);
 if(!s||!g)return null;
 return {id,level:g.level,stage:g.stage,stageName:petStageName(g.stage),xp:g.xp,xpNext:petXpNext(g.level),bond:g.bond,skill:s.name,skillId:s.id,role:s.role,element:s.element,resonance:petV2GearResonance(p,id),onExpedition:!!owner(w,p)?.expedition?.endsAt&&!owner(w,p)?.expedition?.resolvedAt&&owner(w,p).expedition.petId===id};
}
export function petV2Cards(w,p){
 if(!petV2Flags(w).enabled||!valid(p))return {};
 const o=owner(w,p);
 return Object.fromEntries((p.spiritPets||[]).filter(id=>petById(id)).map(id=>[id,petV2View(w,p,id)]).filter(([,v])=>v));
}
function gainXp(w,p,source,amount,now,id=p?.spiritPet){
 if(!petV2On(w)||!allowedPlayer(w,p,id))return 0;
 const o=owner(w,p,true),d=daily(o,now),g=growth(w,p,id,true);
 const count=d.sourceCounts[source]||0;
 const limit=source==='train'||source==='feed'||source==='expedition'||source==='checkin'?1:5;
 if(count>=limit||d.earnedXp>=180)return 0;
 const earned=Math.min(Math.max(0,Math.floor(amount)),180-d.earnedXp);if(earned<1)return 0;
 d.sourceCounts[source]=count+1;d.earnedXp+=earned;g.xp+=earned;
 while(g.level<40&&g.xp>=petXpNext(g.level)){g.xp-=petXpNext(g.level);g.level++;}
 if(g.level>=40)g.xp=0;
 if(source==='gather')o.inventory.spiritFood=Math.min(99,o.inventory.spiritFood+1);
 return earned;
}
export function petV2Earn(w,p,type,now,emit){
 if(!petV2On(w)||!allowedPlayer(w,p))return 0;
 const source={cultivate:'cultivate',gather:'gather',attack:'attack',checkin:'checkin'}[type];
 if(!source)return 0;
 const gained=gainXp(w,p,source,source==='checkin'?10:8,now);
 if(gained&&type==='attack'&&emit&&growth(w,p,p.spiritPet)?.armedUntil>now){
  const g=growth(w,p,p.spiritPet,true);g.armedUntil=0;g.nextSkillAt=now+20000;
  const skill=petV2Skill(p.spiritPet);
  emit(w,p,skill.name,'pet',now,{petV2Cast:true,petId:p.spiritPet,skillId:skill.id,petSkill:skill.name,petFx:skill.fx});
 }
 return gained;
}
const result=(message,extra={})=>({ok:true,message,...extra});
export function petV2Command(w,p,cmd,rest,now,emit){
 if(!['thu','linhthu','batthu'].includes(cmd))return null;
 const op=String(rest||'').split(' ')[0];
 if(!['nuoi','luyen','ky','xuat','hanh','hoa','duyen'].includes(op))return null;
 if(!petV2Flags(w).enabled)return {ok:false,message:'Linh Thú 2.0 chưa được quản lý bật.'};
 if(!allowedPlayer(w,p)&&op!=='duyen')return {ok:false,message:'Cần triệu hồi một linh thú đã sở hữu trước.'};
 if(op==='duyen'){
  if(!petV2On(w,'coveV2')||!w.petEvent||w.petEvent.closedAt||now>w.petEvent.endsAt)return {ok:false,message:'Linh Thú Cốc chưa mở.'};
  const o=owner(w,p,true);if(!o)return {ok:false,message:'Cần là người chơi thật trên LIVE.'};
  const k='cove:'+w.petEvent.id;
  if(o.lastCoveReward===k)return result('Đã nhận linh duyên lượt này.');
  o.lastCoveReward=k;o.inventory.spiritFood=Math.min(99,o.inventory.spiritFood+1);
  // A free, once-per-event co-op goal, independent of gifts/rarity and capped at 8 participants.
  const state=storage(w,true),eid=w.petEvent.id;
  const active=Object.values(w.players).filter(q=>valid(q)&&now-(q.lastActive||0)<300000).length;
  const session=state.coveSessions[eid]??={participants:{},goal:clamp(Math.ceil(active/4),1,8),rewarded:false,startedAt:now};
  if(!session.rewarded)session.participants[p.id]=now;
  const coveIds=Object.keys(state.coveSessions);if(coveIds.length>12)for(const old of coveIds.slice(0,coveIds.length-12))delete state.coveSessions[old];
  emit(w,p,'Tìm thấy linh duyên • +1 Linh Lương','pet',now,{petV2Reward:true});
  return result('Nhận 1 Linh Lương miễn phí.');
 }
 const o=owner(w,p,true),g=growth(w,p,p.spiritPet,true),id=p.spiritPet;
 const skill=petV2Skill(id),d=daily(o,now);
 if(op==='ky'){
  emit(w,p,skill.name+' • '+petStageName(g.stage)+' Lv'+g.level+' • thân thiết '+g.bond+'/100','status',now);
  return result(skill.name);
 }
 if(op==='nuoi'){
  if(!petV2On(w))return {ok:false,message:'Chưa bật nuôi dưỡng.'};
  if(d.feed)return {ok:false,message:'Đã cho thú ăn hôm nay.'};
  if(o.inventory.spiritFood<1)return {ok:false,message:'Chưa đủ Linh Lương • hái linh thảo để nhận.'};
  d.feed=1;o.inventory.spiritFood--;g.bond=clamp(g.bond+2,0,100);
  const xp=gainXp(w,p,'feed',25,now,id);
  emit(w,p,'Cho '+petById(id).name+' ăn • +'+xp+' XP · thân thiết '+g.bond,'pet',now,{petV2Feed:true,petId:id});
  return result('Linh thú đã ăn.',{xp});
 }
 if(op==='luyen'){
  if(!petV2On(w))return {ok:false,message:'Chưa bật huấn luyện.'};
  if(d.train)return {ok:false,message:'Đã luyện linh thú hôm nay.'};
  d.train=1;g.trains++;g.bond=clamp(g.bond+1,0,100);
  const xp=gainXp(w,p,'train',25,now,id);
  emit(w,p,petById(id).name+' luyện tập • +'+xp+' XP','pet',now,{petV2Train:true,petId:id});
  return result('Luyện thú thành công.',{xp});
 }
 if(op==='hoa'){
  const next=g.stage+1;
  if(next>=4)return result('Linh thú đã đạt Bản Mệnh.');
  if(!petStageUnlocked(g,next))return {ok:false,message:'Cần Lv'+[1,10,20,30][next]+' và hoàn thành luyện thú/viễn chinh để tiến hóa.'};
  g.stage=next;
  const event={playerId:p.id,id,stage:next,at:now};
  const busy=stageConflict(w,now);
  if(busy){const s=storage(w,true);if(s.cinematics.length<32)s.cinematics.push(event);}
  else emit(w,p,petById(id).name+' tiến hóa: '+petStageName(next),'pet',now,{petV2Evolve:true,petId:id,petStage:next});
  return result('Tiến hóa thành '+petStageName(next));
 }
 if(op==='hanh'){
  const routeId=String(rest||'').split(' ')[1]||'nguyet',route=petV2Route(routeId);
  if(!route)return {ok:false,message:'Chọn viễn chinh: thú hành nguyet / hoa / tinh.'};
  if(!petV2On(w,'expedition'))return {ok:false,message:'Viễn chinh chưa bật.'};
  if(o.expedition&&!o.expedition.resolvedAt){
   const remaining=Math.max(0,Math.ceil((o.expedition.endsAt-now)/60000));
   return result('Viễn chinh còn khoảng '+remaining+' phút.');
  }
  if(d.expeditionClaims)return {ok:false,message:'Đã nhận thưởng viễn chinh hôm nay.'};
  const duration=[600000,900000,1200000][Math.min(2,g.stage)];
  o.expedition={id:'pet-exp:'+p.id+':'+now,petId:id,routeId,startedAt:now,endsAt:now+duration,resolvedAt:0};
  storage(w,true).activeExpeditions[p.id]=o.expedition.endsAt;
  emit(w,p,petById(id).name+' khởi hành '+route.name,'pet',now,{petV2Expedition:true,petId:id,routeId});
  return result('Viễn chinh bắt đầu, hoàn thành sau '+Math.round(duration/60000)+' phút.');
 }
 if(op==='xuat'){
  if(!petV2On(w,'combat'))return {ok:false,message:'Trợ chiến chưa bật.'};
  if(o.expedition&&!o.expedition.resolvedAt&&o.expedition.petId===id)return {ok:false,message:'Linh thú đang viễn chinh.'};
  if(g.nextSkillAt>now)return {ok:false,message:'Thần thông đang hồi.'};
  const duel=w.tournament?.current;
  if(duel&&duel.endsAt>now&&[duel.a,duel.b].includes(p.id)){
   duel.petCasts??={};
   if(duel.petCasts[p.id])return {ok:false,message:'Đã dùng thần thông trong hiệp.'};
   duel.petCasts[p.id]=true;g.nextSkillAt=now+20000;
   emit(w,p,skill.name,'pet',now,{petV2Cast:true,petId:id,petSkill:skill.name,petFx:skill.fx});
   return result('Đã thi triển '+skill.name);
  }
  if(w.boss?.hp>0&&w.boss.endsAt>now){
   g.armedUntil=now+15000;
   return result('Thần thông đã tụ, gõ đánh trong 15 giây để thi triển.');
  }
  return {ok:false,message:'Chỉ xuất chiêu khi đang đánh boss hoặc đến lượt tỷ thí.'};
 }
 return null;
}
export function petV2DuelPoints(w,p){
 if(!petV2On(w,'combat')||!allowedPlayer(w,p))return 0;
 const o=owner(w,p);
 if(o?.expedition&&!o.expedition.resolvedAt&&o.expedition.petId===p.spiritPet)return 0;
 return Math.min(4,petBasePoints(growth(w,p))+(petV2GearResonance(p)?1:0));
}
export function petV2BossDamage(w,p,base,now){
 if(!petV2On(w,'combat')||!allowedPlayer(w,p)||!w.boss?.hp||base<=0)return 0;
 const o=owner(w,p);
 if(o?.expedition&&!o.expedition.resolvedAt&&o.expedition.petId===p.spiritPet)return 0;
 const boss=w.boss,prior=boss.petV2Damage||{},global=prior.total||0,per=prior.players?.[p.id]||0;
 const maxHp=Number(boss.maxHp);if(!Number.isFinite(maxHp)||maxHp<=0)return 0;
 const g=growth(w,p),rate=.06+.03*((g.level-1)/39)+(petV2GearResonance(p)? .01:0);
 const hit=Math.max(1,Math.round(base*rate));
 return Math.max(0,Math.floor(Math.min(hit,maxHp*.01,maxHp*.03-per,maxHp*.15-global,boss.hp-Math.min(boss.hp,base))));
}
export function petV2CommitBossDamage(w,p,damage,now,emit){
 if(damage<=0||!w.boss)return null;
 const b=w.boss,s=b.petV2Damage??={total:0,players:{},recent:[],lastSynergyAt:0};
 s.total+=damage;s.players[p.id]=(s.players[p.id]||0)+damage;
 const id=p.spiritPet,skill=petV2Skill(id);
 if(!skill)return null;
 const g=growth(w,p,id,true);
 if(g.armedUntil>now){g.armedUntil=0;g.nextSkillAt=now+20000;emit(w,p,skill.name,'pet',now,{petV2Cast:true,petId:id,petSkill:skill.name,petFx:skill.fx,damage});}
 if(!petV2On(w,'synergy'))return null;
 s.recent=s.recent.filter(x=>now-x.at<=8000&&x.id!==p.id).slice(-8);
 const other=s.recent.find(x=>petV2Combination(x.element,skill.element));
 s.recent.push({id:p.id,element:skill.element,at:now});
 if(!other||now-s.lastSynergyAt<40000)return null;
 s.lastSynergyAt=now;
 const combo=petV2Combination(other.element,skill.element);
 emit(w,p,'HỢP KÍCH • '+combo,'pet',now,{petV2Synergy:true,petId:id,petSkill:combo,petFx:skill.fx,partnerId:other.id});
 return combo;
}
export function petV2Tick(w,now,emit){
 const s=storage(w);if(!petV2Flags(w).enabled||!s||now-(s.lastTickAt||0)<5000)return;
 s.lastTickAt=now;
 for(const id of Object.keys(s.activeExpeditions).slice(0,64)){
  if(s.activeExpeditions[id]>now)continue;
  const p=w.players[id],o=s.players[id],e=o?.expedition;
  if(!p||!o||!e||e.resolvedAt){delete s.activeExpeditions[id];continue;}
  if(!allowedPlayer(w,p,e.petId))continue;
  e.resolvedAt=now;delete s.activeExpeditions[id];
  const g=growth(w,p,e.petId,true),d=daily(o,now);g.expeditions++;d.expeditionClaims++;
  const xp=gainXp(w,p,'expedition',30+(petV2ExpeditionAffinity(e.petId,e.routeId)?10:0),now,e.petId);
  o.inventory.evolutionShards=Math.min(999,(o.inventory.evolutionShards||0)+1);
  emit(w,p,petById(e.petId).name+' trở về • +'+xp+' XP · +1 Linh Ấn','pet',now,{petV2ExpeditionDone:true,petId:e.petId,xp});
 }
 const cove=petV2CovePhase(w,now),session=cove&&s.coveSessions?.[w.petEvent?.id];
 if(session&&!session.rewarded&&['community','settlement'].includes(cove.phase)&&
    Object.keys(session.participants||{}).length>=session.goal){
   session.rewarded=true;
   const participants=Object.keys(session.participants).filter(id=>valid(w.players[id])&&w.playTransfers?.[id]?.phase!=='web');
   for(const id of participants){const p=w.players[id],o=owner(w,p,true);if(!o)continue;
    o.inventory.evolutionShards=Math.min(999,(o.inventory.evolutionShards||0)+1);
    gainXp(w,p,'cove',10,now);
   }
   emit(w,null,'LINH THÚ CỐC • '+participants.length+' đạo hữu hợp lực nhận Linh Ấn','pet',now,{petV2CoveCompleted:true,count:participants.length,goal:session.goal});
 }
 if(s.cinematics?.length&&!stageConflict(w,now)&&now-(s.lastCinematicAt||0)>=6000){
  const e=s.cinematics.shift(),p=w.players[e.playerId];s.lastCinematicAt=now;
  if(allowedPlayer(w,p,e.id))emit(w,p,petById(e.id).name+' tiến hóa: '+petStageName(e.stage),'pet',now,{petV2Evolve:true,petId:e.id,petStage:e.stage});
 }
}
export function petV2CovePhase(w,now){
 if(!petV2On(w,'coveV2'))return null;
 const e=w.petEvent;if(!e||e.closedAt||now<e.startedAt||now>=e.endsAt)return null;
 const length=e.endsAt-e.startedAt,progress=clamp((now-e.startedAt)/Math.max(1,length),0,1);
 const phase=progress<Math.min(.05,15000/length)?'opening':progress<.77?'exploration':progress<.92?'community':'settlement';
 return {phase,progress,secondsLeft:Math.max(0,Math.ceil((e.endsAt-now)/1000))};
}
