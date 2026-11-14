// LIVE 2.0 optional gameplay extensions.
// Existing guild/hall/bond/tower/currency schemas remain authoritative; this module never replaces them.
import {stageConflict} from './stage-lock.mjs';
import {live2Level,live2Path,LIVE2_DAILY_INSIGHT,live2Enabled} from './live2-systems.mjs';

const fail=message=>({ok:false,message}),ok=(message,more={})=>({ok:true,message,...more});
const dFmt=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
const day=t=>dFmt.format(t);
const eligible=p=>!!p&&!p.resident&&!p.puppet&&!p.webOnly;
const guildWorld=w=>(w.live2World??={v:1,nextGuildId:1,guilds:{}});
const announce=(w,p,msg,now,ctx,data={})=>ctx.emit(w,p,msg,'daoPath',now,{live2:true,daoPath:p?.live2?.path||'body',...data});
const active=(p,now)=>eligible(p)&&p.lastActive>=now-300000;
const WORDS=Object.freeze({
  'ho mach':{id:'guard',name:'Hộ Mạch Đan',herbs:4,stones:25,level:1,duration:120000},
  'chien y':{id:'fury',name:'Chiến Ý Đan',herbs:7,stones:50,level:2,duration:120000},
  'thanh tam':{id:'clarity',name:'Thanh Tâm Đan',herbs:3,stones:18,level:1,duration:0}
});
export const LIVE2_RECIPES=WORDS;
const getRecipe=k=>WORDS[k]||null;
const canFight=(w,p,now)=>w.boss?.hp>0&&w.boss.endsAt>now||w.tower?.cur?.id===p.id&&w.tower.endsAt>now;
export function live2ExtraBonus(p,now,kind='boss'){
 const a=p?.live2?.elixirActive;
 if(!a||a.until<=now)return 1;
 if(a.id==='guard'&&kind==='tower')return 1.035;
 if(a.id==='fury'&&kind==='boss')return 1.05;
 return 1;
}
export function live2MentorActivity(w,p,input,result,now,ctx){
 if(!live2Enabled(w)||!eligible(p)||!p.live2?.masterId||!result?.ok||result.duplicate||result.pending||result.cooldown)return 0;
 const type=result.heartCultivated?'cultivate':input.type;
 if(!['cultivate','gather','attack','checkin','breakthrough'].includes(type))return 0;
 const s=p.live2,today=day(now);
 const q=s.mentorQuest??={day:today,count:0,done:false,lastAt:0};
 if(q.day!==today)Object.assign(q,{day:today,count:0,done:false,lastAt:0});
 if(q.done||now-q.lastAt<30000)return 0;
 q.count=Math.min(3,q.count+1);q.lastAt=now;
 if(q.count===3){
  q.done=true;p.stones=(p.stones||0)+4;announce(w,p,'SƯ MÔN HOÀN THÀNH • +4 linh thạch',now,ctx,{mentorQuestDone:true});
 }
 return 1;
}
function startGuildWar(w,p,now,ctx,wanted){
 const world=guildWorld(w),g=world.guilds[p.live2?.guildId];
 if(!g||g.leader!==p.id&&g.deputy!==p.id)return fail('Hội Chủ hoặc Phó Hội mới được phát động Hội Chiến.');
 if(world.guildWar?.endsAt>now)return fail('Hội Chiến đang diễn ra.');
 if(world.guildWar?.finishedAt&&now-world.guildWar.finishedAt<10*60000)return fail('Hội Chiến nghỉ 10 phút trước trận tiếp theo.');
 const conflict=stageConflict(w,now);
 if(conflict)return fail('Đang có '+conflict+' • Hội Chiến đợi sân trống.');
 const opponents=Object.values(world.guilds).filter(x=>x.id!==g.id&&x.members.some(id=>active(w.players[id],now)));
 const other=wanted?opponents.find(x=>x.id===wanted.toUpperCase()):opponents.sort((a,b)=>b.points-a.points)[0];
 if(!other)return fail('Chưa có bang đối thủ có thành viên đang hoạt động.');
 if(!g.members.some(id=>active(w.players[id],now)))return fail('Bang cần có thành viên hoạt động.');
 const roster=ids=>ids.filter(id=>active(w.players[id],now));
 const ga=roster(g.members),gb=roster(other.members);
 world.guildWar={id:'gwar-'+now,startedAt:now,endsAt:now+90000,groups:[{id:g.id,name:g.name,score:0,byUser:{}},{id:other.id,name:other.name,score:0,byUser:{}}],eligible:[...ga,...gb],lastHitAt:{},event:'HỘI CHIẾN'};
 announce(w,p,'HỘI CHIẾN • '+g.name+' VS '+other.name+' • gõ chiến hội để công kích',now,ctx,{guildWarStart:true,live2Kind:'guild'});
 return ok('Hội Chiến bắt đầu 90 giây.',{warId:world.guildWar.id});
}
export function live2GuildWarView(w,now){
 if(!live2Enabled(w))return null;
 const e=w.live2World?.guildWar;
 if(!e||!(e.endsAt>now||e.finishedAt&&now-e.finishedAt<10000))return null;
 return {id:e.id,active:e.endsAt>now,endsAt:e.endsAt,groups:e.groups.map(g=>({id:g.id,name:g.name,score:g.score})),result:e.result||null};
}
export function live2Tick(w,now,ctx){
 const e=w.live2World?.guildWar;
 if(e&&!live2Enabled(w)){e.finishedAt??=now;e.cancelled=true;return;}
 if(!e||e.finishedAt||now<e.endsAt)return;
 e.finishedAt=now;
 const a=e.groups[0],b=e.groups[1],winner=a.score===b.score?null:a.score>b.score?a.id:b.id;
 e.result={winner,scores:e.groups.map(g=>({id:g.id,score:g.score}))};
 // Reward actual active participants once, with a modest, fixed free-play amount.
 for(const team of e.groups){
  for(const id of Object.keys(team.byUser)){
   const p=w.players[id];
   if(!eligible(p))continue;
   p.stones=(p.stones||0)+(winner===team.id?8:4);
  }
 }
 ctx.emit(w,null,(winner?'HỘI CHIẾN KẾT THÚC • '+e.groups.find(x=>x.id===winner).name+' chiến thắng':'HỘI CHIẾN KẾT THÚC • hai bang hòa nhau'),'daoPath',now,{live2:true,daoPath:'body',guildWarEnd:true,live2Kind:'guild',guildWarResult:e.result});
}
export function live2ExtraCommand(w,p,words,now,ctx){
 const cmd=words[0],rest=words.slice(1).join(' '),s=p?.live2;
 if(!live2Enabled(w)||!eligible(p))return null;
 if(cmd==='dan'&&rest==='phuong'){
  const names=Object.entries(WORDS).filter(([,v])=>(p.realm||0)>=v.level).map(([key,v])=>key+' ('+v.herbs+' thảo, '+v.stones+' đá)');
  const msg='Đan phương: '+names.join(' • ')+' • gõ chế đan + tên';
  announce(w,p,msg,now,ctx,{live2Kind:'alchemyFx'});return ok(msg);
 }
 if(cmd==='che'&&rest.startsWith('dan ')){
  if(!s?.path)return fail('Cần chọn Đạo Thống trước khi chế đan.');
  const recipe=getRecipe(rest.slice(4));
  if(!recipe)return fail('Đan phương: hộ mạch, chiến ý, thanh tâm.');
  if(p.realm<recipe.level)return fail('Cần đạt cảnh giới phù hợp để luyện '+recipe.name+'.');
  if(p.stones<recipe.stones||p.herbs<recipe.herbs)return fail('Cần '+recipe.stones+' linh thạch và '+recipe.herbs+' linh thảo.');
  s.elixirs??={};if((s.elixirs[recipe.id]||0)>=30)return fail('Đã có 30 viên, sử dụng bớt trước khi chế thêm.');
  p.stones-=recipe.stones;p.herbs-=recipe.herbs;
  s.elixirs[recipe.id]=(s.elixirs[recipe.id]||0)+1;
  announce(w,p,'LUYỆN ĐAN THÀNH CÔNG • '+recipe.name,now,ctx,{live2Kind:'alchemyFx',daoBrew:true});
  return ok('Nhận '+recipe.name+' (tổng '+s.elixirs[recipe.id]+').');
 }
 if(cmd==='dan'&&rest.startsWith('dung ')){
  const recipe=getRecipe(rest.slice(5));
  if(!recipe||!s?.elixirs?.[recipe.id])return fail('Chưa có loại đan này.');
  if(recipe.id!=='clarity'&&!canFight(w,p,now))return fail('Đan này chỉ được sử dụng trong Boss hoặc lượt vượt Tháp.');
  if(recipe.id==='guard'&&w.tower?.cur?.id!==p.id)return fail('Hộ Mạch Đan dành cho lượt vượt Tháp.');
  if(recipe.id==='fury'&&!(w.boss?.hp>0&&w.boss.endsAt>now))return fail('Chiến Ý Đan dùng khi đánh Boss.');
  if(now-(s.lastElixirAt||-Infinity)<20000)return fail('Hấp thu đan dược cần 20 giây.');
  if(recipe.id==='clarity'){
   const d=day(now);s.daily=s.daily?.day===d?s.daily:{day:d,earned:0};
   if(!s.path||s.daily.earned>=LIVE2_DAILY_INSIGHT)return fail('Đạo Ngộ đã đầy hoặc chưa chọn Đạo Thống.');
   s.insight++;s.daily.earned++;
  }else s.elixirActive={id:recipe.id,until:now+recipe.duration};
  s.elixirs[recipe.id]--;s.lastElixirAt=now;
  announce(w,p,'PHỤC ĐAN • '+recipe.name,now,ctx,{live2Kind:'alchemyFx',daoPill:true});
  return ok('Đã dùng '+recipe.name);
 }
 if(cmd==='phap'&&rest==='an'){
  if(!p.equipped||!p.artifacts?.includes(p.equipped))return fail('Cần có pháp bảo đang trang bị.');
  if(!canFight(w,p,now))return fail('Pháp Ấn chỉ dùng khi đánh Boss hoặc vượt Tháp.');
  s??(p.live2={v:1,path:null,insight:0,daily:{day:'',earned:0}});
  if(now-(p.live2.lastRelicAt||-Infinity)<90000)return fail('Pháp Ấn hồi chiêu 90 giây.');
  p.live2.lastRelicAt=now;p.live2.relicActive={id:p.equipped,until:now+15000};
  announce(w,p,'PHÁP BẢO HIỂN UY • '+p.equipped,now,ctx,{live2Kind:'relic',daoRelic:true});
  return ok('Đã kích hoạt Pháp Ấn.');
 }
 if(cmd==='hoi'&&rest==='chien')return startGuildWar(w,p,now,ctx,'');
 if(cmd==='hoi'&&rest.startsWith('chien '))return startGuildWar(w,p,now,ctx,rest.slice(6));
 if(cmd==='hoi'&&rest==='top'){
  const ranks=Object.values(w.live2World?.guilds||{}).sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id)).slice(0,5);
  const msg='Thiên Bảng Bang Hội: '+ranks.map((g,i)=>(i+1)+'. '+g.name+' '+g.points).join(' • ');
  announce(w,p,msg,now,ctx,{guildRank:true,live2Kind:'guild'});return ok(msg);
 }
 if(cmd==='chien'&&rest==='hoi'){
  const e=w.live2World?.guildWar;if(!e||e.finishedAt||now>=e.endsAt)return fail('Chưa có Hội Chiến đang diễn ra.');
  if(!e.eligible.includes(p.id))return fail('Chỉ thành viên có mặt lúc Hội Chiến mở mới tham gia trận này.');
  const team=e.groups.find(g=>g.id===s?.guildId);
  if(!team)return fail('Bạn không thuộc hai bang đang giao chiến.');
  if(now-(e.lastHitAt[p.id]||-Infinity)<6000)return fail('Chiến khí đang tụ, chờ 6 giây.');
  e.lastHitAt[p.id]=now;const points=2+Math.min(3,live2Level(p));
  team.score+=points;team.byUser[p.id]=(team.byUser[p.id]||0)+points;
  if(team.score%35<points)announce(w,p,team.name+' • CHIẾN KHÍ +'+team.score,now,ctx,{guildWarHit:true,live2Kind:'guild'});
  return ok('Đã góp '+points+' chiến khí.',{points});
 }
 if(cmd==='su'&&rest==='mon'){
  const q=s?.mentorQuest;const count=q?.day===day(now)?q.count:0,finished=q?.day===day(now)&&q.done;
  const m=w.players[s?.masterId],students=(s?.students||[]).map(id=>w.players[id]?.name).filter(Boolean);
  const msg=(m?'Sư phụ: '+m.name:'Chưa có sư phụ')+(students.length?' • Đệ tử: '+students.join(', '):'')+' • Nhiệm vụ ngày: '+(finished?'hoàn tất':count+'/3 hành động');
  announce(w,p,msg,now,ctx,{live2Kind:'mentor'});return ok(msg);
 }
 return null;
}
