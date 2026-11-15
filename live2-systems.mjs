// LIVE 2.0: additive, server-authoritative cultivation paths, guilds, mentorship and relic refinement.
import {relicCombatBonus} from './live2-relics.mjs';
import {live2AllowRead} from './live2-read-gate.mjs';
import {activeBonds} from './bond-relations.mjs';
// The historical fields (realm, qi, equipment, bonds, towerFloor) are never migrated or reset.
export const LIVE2_PATHS=Object.freeze({
 sword:{name:'Kiếm Đạo',color:'#8ce8ff',mark:'⚔',skill:'Vạn Kiếm Khai Thiên',talent:'Phá trận'},
 demon:{name:'Ma Đạo',color:'#cd95ff',mark:'✦',skill:'U Minh Phệ Thiên',talent:'Phệ khí'},
 body:{name:'Thể Đạo',color:'#ffd88a',mark:'◆',skill:'Bất Diệt Kim Thân',talent:'Phá giáp'},
 beast:{name:'Ngự Thú Đạo',color:'#7af2dc',mark:'◇',skill:'Vạn Linh Triều Tông',talent:'Linh thú cộng hưởng'},
 alchemy:{name:'Đan Đạo',color:'#ffb77a',mark:'✺',skill:'Cửu Chuyển Tạo Hóa',talent:'Đan tâm'}
});
export const LIVE2_LEVELS=[0,15,40,80,140];
export const LIVE2_DAILY_INSIGHT=12;
// Count real chat gameplay actions for persistence and activity reporting,
// without treating read-only status commands as farmable progression actions.
export function live2RecordAction(w,p,words,result){
 if(!result?.ok||result.duplicate||result.cooldown)return false;
 const msg=(words||[]).join(' '), mutates=/^(?:chon dao |doi dao |dao ky$|tinh luyen|lap hoi |vao hoi |roi hoi$|hoi (?:pho |truong lao |nhuong |giang |xay$|chien)|xin su |nhan do$|truyen dao$|xuat su$|dong tam$|ho kiep |che dan |dan dung |phap an$|chien hoi$)/.test(msg);
 if(!mutates)return false;
 p.interactions=(p.interactions||0)+1;w.totalInteractions=(w.totalInteractions||0)+1;
 return true;
}

// LIVE is opt-in only; DEMO is safe to explore and never uses a real TikTok stream.
export const live2Enabled=w=>w?.mode==='demo'||w?.settings?.live2Enabled===true;
const DAY=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
const day=now=>DAY.format(now);
const real=p=>!!p&&!p.resident&&!p.puppet&&!p.webOnly;
const fail=message=>({ok:false,message});
const ok=(message,extra={})=>({ok:true,message,...extra});
const text=s=>String(s||'').trim().slice(0,40);
const cleanName=s=>text(s).replace(/[^a-zA-Z0-9À-ỹ \-]/gu,'').replace(/\s+/g,' ').trim().slice(0,24);
export const live2Level=p=>LIVE2_LEVELS.reduce((n,c)=>Number(p?.live2?.insight||0)>=c?n+1:n,0);
export const live2Path=p=>LIVE2_PATHS[p?.live2?.path]||null;
// Tolerate old/partial optional save objects: never reset their earned fields.
function ensure(p){
 const s=p.live2??={v:1};
 s.path??=null;s.insight??=0;s.selectedAt??=0;s.lastChangeAt??=0;
 s.daily??={day:'',earned:0};s.cooldowns??={};s.refinements??={};
 s.guildId??=null;s.masterId??=null;s.students??=[];s.lessonDay??='';s.bondSkillUntil??=0;
 return s;
}
function guilds(w){const x=w.live2World??={v:1,nextGuildId:1,guilds:{}};x.guilds??={};if(!Number.isInteger(x.nextGuildId)||x.nextGuildId<1)x.nextGuildId=1;return x.guilds;}
export function live2GuildCard(w,g){
 if(!g)return {kind:'guild',name:'Chưa gia nhập',id:null,members:0,capacity:24,points:0,spentPoints:0,hallLevel:0,leader:'Chưa có'};
 return {kind:'guild',name:g.name,id:g.id,leader:w.players[g.leader]?.name||'Không rõ',
  deputy:w.players[g.deputy]?.name||null,elders:(g.elders||[]).map(id=>w.players[id]?.name).filter(Boolean).slice(0,2),
  members:g.members?.length||0,capacity:24+(g.buildings?.hall||0)*2,
  points:g.points||0,spentPoints:g.spentPoints||0,hallLevel:g.buildings?.hall||0,
  wars:g.wars||0,wins:g.wins||0,warPoints:g.warPoints||0,
  roster:(g.members||[]).slice(0,6).map(id=>w.players[id]?.name||'Đạo hữu')};
}
// Read-only panels never produce a cinematic or replace active attack/gift visuals.
function announce(w,p,message,now,emit,extra={}){
 const info=!!(extra.daoStatus||extra.guildInfo||extra.guildCard||extra.guildPromotion===false);
 emit(w,p,message,info?'status':'daoPath',now,{live2:true,...extra});
}
const alias={kiem:'sword',ma:'demon',the:'body',thu:'beast',dan:'alchemy'};
const personKey=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
function findPlayer(w,query){
 const raw=String(query||'').trim(),q=personKey(raw).replace(/^#/,'');
 if(!q)return null;
 if(Object.hasOwn(w.players,raw))return w.players[raw]; // exact ID avoids costly full-room search
 let matched=null;
 for(const id in w.players){
  if(!Object.hasOwn(w.players,id))continue;
  const p=w.players[id];
  if(!p)continue;
  if(personKey(p.socialCode)===q||personKey(p.name)===q||personKey(p.handle)===q){
   if(matched&&matched.id!==p.id)return null; // duplicate names never select wrong person
   matched=p;
  }
 }
 return matched;
}
export function live2CombatBonus(p,now=Date.now(),kind='boss'){
 const s=p?.live2;if(!s)return 1;
 const lvl=live2Path(p)?live2Level(p):0;
 let rate=0;
 if(lvl&&((kind==='boss'&&['sword','demon','beast'].includes(s.path))||(kind==='tower'&&['sword','body','beast'].includes(s.path))))rate+=.02+lvl*.006;
 if(s.path==='beast'&&p.spiritPet)rate+=.01;
 if(s.skillUntil>now){
  const f={sword:0.065,demon:kind==='boss'?0.075:0.035,body:kind==='tower'?0.075:0.03,beast:p.spiritPet?0.075:0.04,alchemy:s.elixirActive?.until>now?0.075:0.045};
  rate+=f[s.path]||0;
 }
 rate+=relicCombatBonus(p,now,kind);
 const refine=Number(s.refinements?.[p.equipped]||0);rate+=Math.min(3,Math.max(0,refine))*.008;
 if(s.bondSkillUntil>now)rate+=.015;
 return 1+Math.min(.12,rate);
}
export function live2PlayerView(p){const s=p.live2;if(!s?.path)return null;return {path:s.path,pathName:live2Path(p)?.name,level:live2Level(p),insight:s.insight,bondResonanceUntil:s.bondSkillUntil||0,guildId:s.guildId||null,masterId:s.masterId||null};}
export function live2Insight(w,p,input,result,now,emit){
 if(!live2Enabled(w)||!real(p)||!p.live2?.path||!result?.ok||result.duplicate||result.pending||result.cooldown||result.xpCooldown)return 0;
 const type=result.heartCultivated?'cultivate':input.type;
 const weights={cultivate:1,gather:2,attack:2,checkin:2,craft:2,brew:2,breakthrough:3};
 if(!weights[type])return 0;
 const s=ensure(p),today=day(now);
 if(s.daily.day!==today)s.daily={day:today,earned:0};
 const period={cultivate:60000,gather:60000,attack:120000,checkin:86400000,craft:60000,brew:60000,breakthrough:10000}[type];
 if(now-(s.cooldowns['insight:'+type]??-Infinity)<period)return 0;
 const add=Math.max(0,Math.min(weights[type],LIVE2_DAILY_INSIGHT-s.daily.earned));
 if(!add)return 0;
 s.cooldowns['insight:'+type]=now;s.daily.earned+=add;s.insight+=add;
 const g=guilds(w)[s.guildId];if(g&&g.members?.includes(p.id)){g.contributions??={};g.points=(g.points||0)+add;g.contributions[p.id]=(g.contributions[p.id]||0)+add;}
 const prevLevel=LIVE2_LEVELS.reduce((v,n)=>s.insight-add>=n?v+1:v,0);
 if(live2Level(p)>prevLevel)announce(w,p,'ĐẠO NGỘ THĂNG CẤP • '+live2Path(p).name+' '+live2Level(p),now,emit,{daoPath:s.path,daoLevelUp:true});
 return add;
}
export function live2Command(w,p,words,now,ctx){
 if(!live2Enabled(w)||!real(p))return null;
 const cmd=words[0],rest=words.slice(1).join(' '),s=ensure(p),emit=ctx.emit;
 if(cmd==='dao'&&['tu','ngo',''].includes(rest)){
  const desc=s.path?live2Path(p).name+' cấp '+live2Level(p)+' • Đạo Ngộ '+s.insight+' • hôm nay '+(s.daily.day===day(now)?s.daily.earned:0)+'/'+LIVE2_DAILY_INSIGHT:'Trúc Cơ mở chọn đạo: chọn đạo kiếm/ma/thể/thú/đan';
  if(!live2AllowRead(p,'dao-status',now))return ok(desc,{cooldown:true});
  announce(w,p,desc,now,emit,{daoStatus:true,daoPath:s.path,card:{kind:'dao',path:s.path||null,pathName:live2Path(p)?.name||'Chưa chọn Đạo Thống',level:s.path?live2Level(p):0,talent:live2Path(p)?.talent||null,insight:s.insight||0,progress:s.daily?.day===day(now)?s.daily.earned:0,maxDaily:LIVE2_DAILY_INSIGHT,paths:Object.entries(LIVE2_PATHS).map(([id,v])=>({id,name:v.name}))}});return ok(desc);
 }
 if(cmd==='dao'&&rest==='lu'){
  const partners=activeBonds(w,p.id).slice(0,6).map(b=>{
   const o=w.players[b.a===p.id?b.b:b.a];
   return {name:o?.name||'Đạo hữu',level:b.level||0,code:o?.socialCode||null};
  });
  const message=partners.length?'Đạo lữ: '+partners.map(x=>x.name).join(' · '):'Chưa có đạo lữ • gõ kết duyên + tên.';
  if(!live2AllowRead(p,'dao-companions',now))return ok(message,{cooldown:true});
  announce(w,p,message,now,emit,{daoStatus:true,card:{kind:'bond',partners}});
  return ok(message);
 }
 if(cmd==='chon'&&rest.startsWith('dao ')){
  if(p.realm<2)return fail('Cần Trúc Cơ để chọn con đường tu luyện.');
  const id=alias[rest.slice(4)];if(!id)return fail('Chọn đạo kiếm / ma / thể / thú / đan.');
  if(s.path)return fail('Đã nhập '+live2Path(p).name+' • đổi đạo để chuyển đường tu.');
  s.path=id;s.insight=0;s.selectedAt=now;s.lastChangeAt=now;
  announce(w,p,'KHAI ĐẠO • '+LIVE2_PATHS[id].name,now,emit,{daoPath:id,daoChoose:true,daoLevelUp:true});
  return ok('Đã chọn '+LIVE2_PATHS[id].name);
 }
 if(cmd==='doi'&&rest.startsWith('dao')){
  if(!s.path)return fail('Chưa chọn đường tu.');
  const wanted=alias[rest.replace(/^dao\s*/,'').replace(/\s+xac nhan$/,'')];
  if(!wanted||wanted===s.path)return fail('Gõ đổi đạo kiếm/ma/thể/thú/đan (khác đạo hiện tại).');
  if(now-s.lastChangeAt<7*86400000)return fail('Đổi đường tu sau '+Math.ceil((7*86400000-(now-s.lastChangeAt))/86400000)+' ngày.');
  if(!/xac nhan$/.test(rest)){s.changeRequest={id:wanted,until:now+30000};return ok('Gõ đổi đạo '+rest+' xác nhận trong 30 giây. Giữ nguyên Đạo Ngộ và vật phẩm.');}
  if(s.changeRequest?.id!==wanted||s.changeRequest.until<=now)return fail('Yêu cầu đổi đạo hết hạn, gõ lại.');
  s.path=wanted;s.lastChangeAt=now;delete s.changeRequest;
  announce(w,p,'CHUYỂN ĐẠO • '+LIVE2_PATHS[wanted].name,now,emit,{daoPath:wanted,daoChoose:true});
  return ok('Chuyển thành '+LIVE2_PATHS[wanted].name);
 }
 if(cmd==='dao'&&rest==='ky'){
  if(!s.path)return fail('Chưa chọn đường tu.');
  if(live2Level(p)<2)return fail('Cần Đạo Ngộ cấp II (15 điểm) để sử dụng Đạo Kỹ.');
  if(now-(s.cooldowns.skill??-Infinity)<30000)return fail('Đạo kỹ hồi chiêu 30 giây.');
  if(!((w.boss?.hp>0&&w.boss.endsAt>now)||(w.tower?.cur&&w.tower.endsAt>now&&w.tower.cur.id===p.id)))return fail('Đạo kỹ dùng khi đánh Boss hoặc đến lượt vượt Tháp.');
  s.cooldowns.skill=now;s.skillUntil=now+9000;
  announce(w,p,LIVE2_PATHS[s.path].skill,now,emit,{daoPath:s.path,daoSkill:true,daoUltimate:live2Level(p)===5,daoLevel:live2Level(p)});
  return ok('Đã vận '+LIVE2_PATHS[s.path].skill);
 }
 if(cmd==='tinh'&&rest.startsWith('luyen')){
  const id=p.equipped;
  if(!id||!p.artifacts?.includes(id))return fail('Cần trang bị pháp bảo đang sở hữu.');
  const lvl=s.refinements[id]||0;if(lvl>=3)return fail('Pháp bảo đã tinh luyện tối đa +3.');
  const stones=80*(lvl+1),herbs=4*(lvl+1);
  if(p.stones<stones||p.herbs<herbs)return fail('Cần '+stones+' linh thạch và '+herbs+' linh thảo.');
  p.stones-=stones;p.herbs-=herbs;s.refinements[id]=lvl+1;
  announce(w,p,'TINH LUYỆN PHÁP BẢO +'+(lvl+1),now,emit,{daoForge:true,live2Kind:'relic',daoPath:s.path});
  return ok('Tinh luyện thành công +'+(lvl+1));
 }
 if(cmd==='hoi'&&rest==='quan'){
  const g=guilds(w)[s.guildId];if(!g)return fail('Bạn chưa ở trong bang.');
  const master=w.players[g.leader]?.name||'Không xác định',deputy=w.players[g.deputy]?.name||'Chưa bổ nhiệm',elders=(g.elders||[]).map(id=>w.players[id]?.name).filter(Boolean);
  const msg=g.name+' • Hội Chủ '+master+' • Phó Hội '+deputy+' • Trưởng Lão '+(elders.join(', ')||'Chưa có')+' • Đại Điện cấp '+(g.buildings?.hall||0);
  if(!live2AllowRead(p,'guild-management',now))return ok(msg,{cooldown:true});
  announce(w,p,msg,now,emit,{live2Kind:'guild',guildInfo:true,card:live2GuildCard(w,g)});return ok(msg);
 }
 if(cmd==='hoi'&&rest.startsWith('pho ')){
  const g=guilds(w)[s.guildId];if(!g||g.leader!==p.id)return fail('Chỉ Hội Chủ mới bổ nhiệm Phó Hội.');
  const target=findPlayer(w,rest.slice(4));
  if(!target||!g.members.includes(target.id)||target.id===p.id)return fail('Chọn thành viên khác trong bang.');
  g.deputy=target.id;announce(w,target,'PHÓ HỘI CHỦ • '+g.name,now,emit,{live2Kind:'guild',guildPromotion:true});
  return ok('Đã bổ nhiệm '+target.name+' làm Phó Hội.');
 }
 if(cmd==='hoi'&&rest.startsWith('truong lao ')){
  const g=guilds(w)[s.guildId];if(!g||g.leader!==p.id)return fail('Chỉ Hội Chủ mới bổ nhiệm Trưởng Lão.');
  const target=findPlayer(w,rest.slice(11));
  if(!target||!g.members.includes(target.id)||target.id===p.id)return fail('Chọn một thành viên trong bang.');
  g.elders??=[];if(g.elders.includes(target.id))return fail('Đã là Trưởng Lão.');
  if(g.elders.length>=2)return fail('Bang có tối đa hai Trưởng Lão.');
  g.elders.push(target.id);announce(w,target,'TRƯỞNG LÃO BANG • '+g.name,now,emit,{live2Kind:'guild',guildPromotion:true});
  return ok('Đã bổ nhiệm Trưởng Lão.');
 }
 if(cmd==='hoi'&&rest.startsWith('nhuong ')){
  const g=guilds(w)[s.guildId];if(!g||g.leader!==p.id)return fail('Chỉ Hội Chủ được truyền quyền.');
  if(w.live2World?.guildWar?.endsAt>now&&!w.live2World.guildWar.finishedAt)return fail('Đợi Hội Chiến kết thúc mới được truyền quyền.');
  const target=findPlayer(w,rest.slice(7));
  if(!target||target.id===p.id||!g.members.includes(target.id))return fail('Chọn một thành viên khác trong bang.');
  g.leader=target.id;if(g.deputy===target.id)g.deputy=null;
  g.elders=(g.elders||[]).filter(id=>id!==target.id);
  announce(w,target,'TRUYỀN NGÔI HỘI CHỦ • '+g.name,now,emit,{guildPromotion:true,live2Kind:'guild'});
  return ok('Đã truyền quyền Hội Chủ cho '+target.name+'.');
 }
 if(cmd==='hoi'&&rest.startsWith('giang ')){
  const g=guilds(w)[s.guildId];if(!g||g.leader!==p.id)return fail('Chỉ Hội Chủ được điều chỉnh chức vụ.');
  if(w.live2World?.guildWar?.endsAt>now&&!w.live2World.guildWar.finishedAt)return fail('Đợi Hội Chiến kết thúc.');
  const target=findPlayer(w,rest.slice(6));
  if(!target||!g.members.includes(target.id)||target.id===p.id)return fail('Chọn một thành viên đang có chức vụ.');
  if(g.deputy===target.id)g.deputy=null;
  else if((g.elders||[]).includes(target.id))g.elders=g.elders.filter(id=>id!==target.id);
  else return fail('Thành viên này không có chức vụ để thu hồi.');
  announce(w,target,'THOÁI VỊ • '+g.name,now,emit,{guildPromotion:true,live2Kind:'guild'});
  return ok('Đã thu hồi chức vụ của '+target.name+'.');
 }
 if(cmd==='hoi'&&rest==='xay'){
  const g=guilds(w)[s.guildId];if(!g||g.leader!==p.id)return fail('Hội Chủ mới được xây Đại Điện.');
  g.buildings??={hall:0};const lv=g.buildings.hall;
  if(lv>=3)return fail('Đại Điện đã đạt cấp tối đa.');
  const cost=20+20*lv,available=(g.points||0)-(g.spentPoints||0);
  if(available<cost)return fail('Cần '+cost+' cống hiến chưa sử dụng; hiện '+available+'.');
  g.spentPoints=(g.spentPoints||0)+cost;g.buildings.hall++;
  announce(w,p,'KIẾN THIẾT BANG HỘI • Đại Điện cấp '+g.buildings.hall,now,emit,{live2Kind:'guild',guildBuild:true});
  return ok('Đại Điện lên cấp '+g.buildings.hall+' • tăng thêm 2 vị trí thành viên.');
 }
 if(cmd==='hoi'&&rest===''){
  const g=guilds(w)[s.guildId];const msg=g?'Bang '+g.name+' #'+g.id+' • '+g.members.length+'/'+(24+(g.buildings?.hall||0)*2)+' thành viên • '+(g.points||0)+' cống hiến':'Chưa gia nhập bang • lập hội + tên hoặc vào hội + mã';
  if(!live2AllowRead(p,'guild-status',now))return ok(msg,{cooldown:true});
  announce(w,p,msg,now,emit,{guildInfo:true,card:live2GuildCard(w,g)});return ok(msg);
 }
 if(cmd==='lap'&&rest.startsWith('hoi ')){
  if(p.realm<2||s.guildId)return fail('Cần Trúc Cơ và chưa ở trong bang khác.');
  const name=cleanName(rest.slice(4));if(name.length<3)return fail('Tên bang cần ít nhất 3 ký tự.');
  if(now-(s.lastGuildLeaveAt||-Infinity)<600000)return fail('Lập bang mới sau 10 phút kể từ lúc rời bang.');
  const all=guilds(w);if(Object.keys(all).length>=200)return fail('Bang hội đã đạt giới hạn hiện tại; đợi Hội Chủ giải tán bang cũ.');
  if(Object.values(all).some(g=>g.name.toLowerCase()===name.toLowerCase()))return fail('Tên bang đã có người sử dụng.');
  // Restore partially-upgraded world safely: never overwrite a guild if the counter lags saved IDs.
  let n=w.live2World.nextGuildId,id='';
  do{id=n.toString(36).toUpperCase().padStart(3,'0');n++;}while(Object.hasOwn(all,id)&&n<w.live2World.nextGuildId+210);
  if(Object.hasOwn(all,id))return fail('Không tạo được mã bang không trùng; cần kiểm tra dữ liệu lưu.');
  w.live2World.nextGuildId=n;
  all[id]={id,name,leader:p.id,deputy:null,elders:[],buildings:{hall:0},spentPoints:0,members:[p.id],points:0,contributions:{[p.id]:0},createdAt:now};
  s.guildId=id;announce(w,p,'KHAI TÔNG LẬP HỘI • '+name,now,emit,{guildFounded:true,live2Kind:'guild',guildId:id});return ok('Đã lập hội '+name+' #'+id);
 }
 if(cmd==='vao'&&rest.startsWith('hoi ')){
  if(s.guildId)return fail('Cần rời bang hiện tại trước.');
  if(now-(s.lastGuildLeaveAt||-Infinity)<600000)return fail('Chuyển bang sau 10 phút kể từ lúc rời bang.');
  if(w.live2World?.guildWar?.endsAt>now&&!w.live2World.guildWar.finishedAt)return fail('Hội Chiến đang diễn ra, chưa thể đổi bang.');
  const id=rest.slice(4).trim().toUpperCase(),g=guilds(w)[id];
  if(!g)return fail('Không tìm thấy mã bang.');
  if(g.members.length>=24+(g.buildings?.hall||0)*2)return fail('Bang đã đủ thành viên.');
  g.members.push(p.id);s.guildId=id;
  announce(w,p,'GIA NHẬP BANG • '+g.name,now,emit,{guildJoined:true,live2Kind:'guild',guildId:id});
  return ok('Đã vào '+g.name);
 }
 if(cmd==='roi'&&rest==='hoi'){
  const all=guilds(w),g=all[s.guildId];if(!g)return fail('Chưa gia nhập bang.');
  if(w.live2World?.guildWar?.endsAt>now&&!w.live2World.guildWar.finishedAt)return fail('Hội Chiến đang diễn ra, chưa thể rời bang.');
  if(g.leader===p.id&&g.members.length>1)return fail('Hội chủ cần chuyển quyền hoặc bang chỉ còn một người mới có thể rời.');
  g.members=g.members.filter(id=>id!==p.id);delete g.contributions[p.id];if(g.deputy===p.id)g.deputy=null;g.elders=(g.elders||[]).filter(id=>id!==p.id);if(!g.members.length)delete all[g.id];s.guildId=null;s.lastGuildLeaveAt=now;
  announce(w,p,'RỜI BANG HỘI • '+g.name,now,emit,{guildLeft:true,live2Kind:'guild'});return ok('Đã rời bang.');
 }
 if(cmd==='xin'&&rest.startsWith('su ')){
  if(s.masterId)return fail('Đã có sư phụ cá nhân.');
  const master=findPlayer(w,rest.slice(3)),m=master&&ensure(master);
  if(!master||!real(master)||master.id===p.id||master.realm<p.realm+2||master.realm<4)return fail('Không tìm thấy sư phụ phù hợp (ít nhất Nguyên Anh, cao hơn đệ tử 2 cảnh giới).');
  if((m.students||[]).length>=2)return fail('Sư phụ đã nhận đủ 2 đệ tử.');
  if(master.lastActive<now-5*60000)return fail('Sư phụ cần đang hoạt động trên LIVE.');
  if(now-(s.cooldowns.mentorRequest??-Infinity)<30000)return fail('Xin bái sư lại sau 30 giây.');
  const waiting=(m.mentorInvites||[]).filter(inv=>inv.until>now&&real(w.players[inv.from])&&!w.players[inv.from].live2?.masterId);
  if(waiting.some(inv=>inv.from===p.id))return fail('Lời xin bái sư đang chờ duyệt.');
  if(waiting.length>=4)return fail('Sư phụ đang có 4 lời xin sư. Đợi duyệt bớt.');
  const invite={from:p.id,until:now+120000};
  m.mentorInvites=[...waiting,invite];m.mentorInvite=invite; // preserve old saved-invite compatibility
  s.cooldowns.mentorRequest=now;
  announce(w,master,p.name+' xin bái sư • gõ nhận đồ '+p.name+' để đồng ý',now,emit,{mentorInvite:true,live2Kind:'mentor'});
  return ok('Đã gửi lời xin bái sư ('+m.mentorInvites.length+'/4 đang chờ).');
 }
 if(cmd==='nhan'&&(rest==='do'||rest.startsWith('do '))){
  const request=rest.slice(2).trim();
  if(s.students.length>=2)return fail('Sư phụ đã nhận đủ hai đệ tử.');
  const pending=(s.mentorInvites?.length?s.mentorInvites:s.mentorInvite?[s.mentorInvite]:[])
   .filter(inv=>inv.until>now&&real(w.players[inv.from])&&!w.players[inv.from].live2?.masterId);
  s.mentorInvites=pending;
  if(!pending.length){delete s.mentorInvite;return fail('Không có lời xin bái sư hợp lệ.');}
  const target=request?findPlayer(w,request):null;
  if(request&&!target)return fail('Không tìm thấy duy nhất học trò đã xin bái sư. Hãy ghi đúng tên hoặc mã.');
  const invite=request?pending.find(inv=>inv.from===target.id):pending[0];
  const student=invite&&w.players[invite.from];
  if(!student||student.id===p.id||p.realm<student.realm+2||p.realm<4||student.lastActive<now-5*60000)
   return fail('Học trò hoặc sư phụ không còn đủ điều kiện bái sư.');
  const ss=ensure(student);
  ss.masterId=p.id;s.students.push(student.id);
  s.mentorInvites=pending.filter(inv=>inv.from!==student.id);
  s.mentorInvite=s.mentorInvites.at(-1)||null;
  announce(w,student,'BÁI SƯ THÀNH CÔNG • '+p.name,now,emit,{mentorJoined:true,live2Kind:'mentor',mentorId:p.id});
  return ok('Đã nhận '+student.name+' làm đệ tử. Còn '+s.mentorInvites.length+' lời xin.');
 }
 if(cmd==='truyen'&&rest==='dao'){
  const master=w.players[s.masterId],m=master&&ensure(master);
  if(!master||!real(master)||master.lastActive<now-5*60000)return fail('Sư phụ cần đang có mặt.');
  const d=day(now);if(s.lessonDay===d)return fail('Hôm nay đã nhận truyền đạo.');
  s.lessonDay=d; // One meaningful mentor lesson per day; avoid free qi inflation.
  if(s.path){s.daily=s.daily?.day===d?s.daily:{day:d,earned:0};const lesson=Math.max(0,Math.min(2,LIVE2_DAILY_INSIGHT-s.daily.earned));s.insight+=lesson;s.daily.earned+=lesson;}
  announce(w,p,'SƯ PHỤ TRUYỀN ĐẠO • '+master.name,now,emit,{mentorLesson:true,live2Kind:'mentor',daoPath:s.path});
  return ok('Truyền đạo viên mãn.');
 }
 if(cmd==='xuat'&&rest==='su'){
  if(!s.masterId)return fail('Chưa có sư phụ.');
  const master=w.players[s.masterId];if(master?.live2)master.live2.students=(master.live2.students||[]).filter(id=>id!==p.id);
  s.masterId=null;announce(w,p,'XUẤT SƯ • Độc lập tu hành',now,emit,{mentorGraduated:true,live2Kind:'mentor'});return ok('Đã xuất sư.');
 }
 if(cmd==='dong'&&(rest==='tam'||rest.startsWith('tam '))){
  const bonds=activeBonds(w,p.id);
  const eligible=bonds.map(b=>w.players[b.a===p.id?b.b:b.a]).filter(o=>real(o)&&o.lastActive>=now-5*60000);
  const query=rest.slice(3).trim();
  const other=query?eligible.find(o=>personKey(o.name)===personKey(query)||personKey(o.socialCode)===personKey(query)):eligible.length===1?eligible[0]:null;
  if(!other)return fail(eligible.length>1?'Có nhiều đạo lữ đang ở LIVE • gõ đồng tâm + tên chính xác':'Đạo lữ cần đang hoạt động trên LIVE.');
  if(!((w.boss?.hp>0&&w.boss.endsAt>now)||[p.id,other.id].includes(w.tower?.cur?.id)))return fail('Đồng Tâm chỉ kích hoạt trong Boss hoặc lượt vượt Tháp.');
  const otherS=ensure(other),cooldownAt=Math.max(s.cooldowns.bond??-Infinity,otherS.cooldowns.bond??-Infinity);
  if(now-cooldownAt<15*60000)return fail('Đồng Tâm của đôi bạn hồi sau 15 phút.');
  s.cooldowns.bond=otherS.cooldowns.bond=now;
  s.bondSkillUntil=otherS.bondSkillUntil=now+120000;
  announce(w,p,'SONG TINH ĐỒNG TÂM • '+other.name,now,emit,{bondSkill:true,live2Kind:'bond',bondPartnerId:other.id,daoPath:s.path});
  return ok('Đồng tâm hỗ trợ Boss/Tháp trong 2 phút.');
 }
 return null;
}
