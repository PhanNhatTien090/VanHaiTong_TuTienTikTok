import {settleHallWeek,payHallWeeklyRewards,hallWeeklyView} from './hall-weekly.mjs';
export const HALLS = [
  {name:'Truyền Công Đường', key:'truyen cong', mark:'功', color:'#79e9c4', perk:'Vận công +3% tu vi'},
  {name:'Tàng Bảo Đường', key:'tang bao', mark:'寶', color:'#ffc671', perk:'Đánh yêu thú và rèn pháp bảo có thêm tu vi'},
  {name:'Đan Đỉnh Đường', key:'dan dinh', mark:'丹', color:'#d6aaff', perk:'Dùng đan +6% tu vi'},
  {name:'Tuần Sơn Đường', key:'tuan son', mark:'山', color:'#91caff', perk:'Thưởng sự kiện +5% tu vi'},
  {name:'Linh Dược Đường', key:'linh duoc', mark:'藥', color:'#c7ee80', perk:'Hái thêm linh thảo · vận công +2%'}
];
const DAY = 86400000, WEEK = 7*DAY, MATCH_MS = 30000;
const weekAt = now => Math.floor((now + 7*3600000 + 3*DAY)/WEEK);
const real = p => p && !p.resident && !p.puppet && !p.webOnly && p.actorKind !== 'npc';
const score = p => Math.max(0, Number(p?.totalQi)||0);
const membership = (s,id) => Object.hasOwn(s.members,id) ? s.members[id] : null;
const rankOrder = (a,b) => score(b)-score(a) || String(a.id).localeCompare(String(b.id));
const byPoints = (a,b) => b.points-a.points || a.index-b.index;
const nameKey = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();
const success = message => ({ok:true,message});
const failure = message => ({ok:false,message});
const blankHall = () => ({elder:null, since:0, disciples:[], offers:[], points:0});
const MAX_ACTIVE_HALLS=8;
export const hallDefinitions = w => w.hallDefinitions ?? HALLS;
const hallEnabled = h => h && !h.deleted;
export const activeHalls = w => hallDefinitions(w).flatMap((h,index)=>hallEnabled(h)?[{...h,index}]:[]);
const hallEditLocked = w => ['registration','running'].includes(w.hallWar?.phase)||!!w.nguDuong?.match;

function getState(w,now) {
  const defs=hallDefinitions(w);
  const s = w.nguDuong ??= {week:weekAt(now), halls:defs.map(blankHall), members:{}, queue:[], match:null};
  settleHallWeek(w,s,now,defs);
  return s;
}

export function editHall(w,input,now=Date.now()) {
  const {action,index}=input??{},defs=hallDefinitions(w),existing=Number.isSafeInteger(index)?defs[index]:null;
  if(!['add','edit','delete'].includes(action))return failure('Thao tác Đường không hợp lệ.');
  if(action!=='add'&&!hallEnabled(existing))return failure('Đường này đã bị xóa hoặc không tồn tại.');
  if(hallEditLocked(w))return failure('Đợi công bố kết quả trận đấu trước khi chỉnh danh sách Đường.');
  if(action==='add'&&activeHalls(w).length>=MAX_ACTIVE_HALLS)return failure('Sân LIVE hỗ trợ tối đa '+MAX_ACTIVE_HALLS+' Đường đang mở.');
  const name=typeof input.name==='string'?input.name.trim().replace(/\s+/g,' '):'';
  const key=nameKey(name).replace(/ duong$/,'');
  const color=input.color??existing?.color??'#95e5d2';
  if(action!=='delete'){
    if(!key||!/[a-z]/.test(key)||name.length>48||/[<>\u0000-\u001f]/.test(name))return failure('Nhập tên Đường từ 1 đến 48 ký tự, có chữ cái.');
    if(defs.some((h,i)=>(action==='add'||i!==index)&&hallEnabled(h)&&(h.key===key||nameKey(h.name)===nameKey(name))))return failure('Tên Đường đã được sử dụng.');
    if(typeof color!=='string'||!/^#[\da-f]{6}$/i.test(color))return failure('Màu Đường không hợp lệ.');
  }
  const s=getState(w,now),next=defs.slice();
  if(action==='delete'){
    next[index]={...existing,deleted:true};
    for(const [id,m] of Object.entries(s.members)){
      if(m.index!==index)continue;
      delete s.members[id];
      if(w.players[id])w.players[id].hallDeparture={index,joinedAt:0};
    }
    s.queue=s.queue.filter(q=>q.index!==index);
    s.halls[index]=blankHall();
    if(s.champion===index)s.champion=null;
  }else if(action==='add'){
    next.push({name,key,color,mark:'◆',perk:''});
    s.halls.push(blankHall());
  }else{
    next[index]={...existing,name,key,color};
  }
  w.hallDefinitions=next;
  return success(action==='delete'?'Đã xóa '+existing.name+'.':'Đã lưu '+name+'.');
}

export function hallRoster(w,index,query='',page=1){
  const def=hallDefinitions(w)[index];
  if(!Number.isSafeInteger(index)||!hallEnabled(def))return failure('Đường không tồn tại.');
  const s=w.nguDuong,h=s?.halls[index],q=nameKey(query);
  const people=q?Object.values(w.players):Object.keys(s?.members||{}).map(id=>w.players[id]);
  const rows=people.filter(p=>real(p)&&(q?[p.name,p.handle,p.socialCode,p.id].some(value=>nameKey(value).includes(q)):membership(s,p.id)?.index===index)).map(p=>{
    const m=s&&membership(s,p.id),seat=s?.halls[m?.index];
    const role=seat?.elder===p.id?'elder':seat?.disciples.includes(p.id)?'disciple':'member';
    return {id:p.id,name:p.name,code:p.socialCode,index:m?.index??null,hallName:hallDefinitions(w)[m?.index]?.name,role,points:m?.week===s?.week?m?.weekPoints||0:0};
  });
  const roles={elder:0,disciple:1,member:2};
  rows.sort((a,b)=>Number(b.index===index)-Number(a.index===index)||roles[a.role]-roles[b.role]||b.points-a.points||a.name.localeCompare(b.name,'vi')||a.id.localeCompare(b.id));
  const pages=Math.max(1,Math.ceil(rows.length/25)),current=Math.max(1,Math.min(pages,Number.isSafeInteger(page)?page:1));
  return {ok:true,hall:{index,name:def.name,elder:h?.elder??null},rows:rows.slice((current-1)*25,current*25),total:rows.length,page:current,pages,locked:hallEditLocked(w)};
}

export function editHallMember(w,input,now=Date.now(),active=()=>true){
  const {index,id,role}=input??{},p=typeof id==='string'&&Object.hasOwn(w.players,id)?w.players[id]:null;
  if(!Number.isSafeInteger(index)||!hallEnabled(hallDefinitions(w)[index]))return failure('Đường không tồn tại.');
  if(!real(p)||!['member','disciple','elder','remove'].includes(role))return failure('Đạo hữu hoặc chức danh không hợp lệ.');
  if(hallEditLocked(w))return failure('Đợi công bố kết quả trận đấu trước khi sửa thành viên.');
  const s=getState(w,now),m=membership(s,id),h=s.halls[index],same=m?.index===index;
  if(role==='remove'){
    if(!same)return failure('Đạo hữu đã rời Đường.');
    leaveHall(s,p,m);
    return success('Đã gỡ '+p.name+' khỏi '+hallDefinitions(w)[index].name+'.');
  }
  if(role==='elder'&&masterId(w,active,now)===id)return failure('Tông Chủ không thể giữ ghế Trưởng Lão.');
  if(role==='disciple'&&!h.disciples.includes(id)&&h.disciples.length>=3)return failure('Đường đã đủ ba suất Chân Truyền.');
  if(role==='elder'){
    if(h.elder&&h.elder!==id&&real(w.players[h.elder]))w.players[h.elder].hallAppointmentOptOut=true;
    seat(w,s,index,p,now,()=>{},null);
    h.guardUntil=now+10*60000;
  }else{
    if(!same)assign(s,p,index,now);
    if(h.elder===id){h.elder=null;h.since=0;h.guardUntil=0;h.offers=[];}
    h.disciples=h.disciples.filter(other=>other!==id);
    h.offers=h.offers.filter(offer=>offer.id!==id);
    if(role==='disciple'){
      h.disciples.push(id);
      h.offers=h.offers.slice(0,3-h.disciples.length);
    }
    p.hallAppointmentOptOut=true;
  }
  s.queue=s.queue.filter(q=>q.id!==id);
  return success('Đã cập nhật chức danh của '+p.name+'.');
}

function masterId(w,active,now) {
  const gift = Object.values(w.players).reduce((best,p)=>real(p)&&p.sectMasterUnlocked&&p.sectMasterGiftAt&&active(w,p,now)
    && (!best || p.sectMasterGiftAt>best.sectMasterGiftAt || p.sectMasterGiftAt===best.sectMasterGiftAt&&String(p.id)<String(best.id)) ? p : best,null);
  if(gift)return gift.id;
  const host = w.settings?.sectMasterUsername;
  return host ? Object.values(w.players).find(p=>real(p)&&String(p.handle||'').toLowerCase()===host)?.id : null;
}

export function thienBang(w,active,now,master=masterId(w,active,now)) {
  const top=[];
  for(const p of Object.values(w.players)){
    if(!real(p) || top.length===10 && rankOrder(p,top[9])>=0)continue;
    let i=top.length;
    while(i>0 && rankOrder(p,top[i-1])<0)i--;
    top.splice(i,0,p);
    if(top.length>10)top.pop();
  }
  return top.map((p,i)=>({rank:i+1,id:p.id,name:p.name,realm:p.realm,totalQi:score(p),active:active(w,p,now),master:p.id===master}));
}

export function hallBenefits(w,p,now,source) {
  if(!w.nguDuong||!real(p)||w.playTransfers?.[p.id]?.phase==='web')return {rate:0,herbs:0};
  const s=getState(w,now), i=membership(s,p.id)?.index;
  if(i==null)return {rate:0,herbs:0};
  const rates=[{cultivate:.03},{attack:.05,craft:.05},{pill:.06},{'sect-event':.05,event:.05},{cultivate:.02}];
  const eligible=['cultivate','gather','attack','craft','pill','sect-event','event','reward','checkin'].includes(source);
  return {rate:(rates[i]?.[source]||0)+(eligible&&s.champion===i?.05:0),herbs:i===4&&source==='gather'?1:0,craft:i===1};
}

export function hallContribution(w,p,now,type) {
  if(!w.nguDuong||!real(p)||w.playTransfers?.[p.id]?.phase==='web')return;
  const s=getState(w,now), m=membership(s,p.id);
  if(!m || !['cultivate','gather','attack','craft','brew','use','learn','checkin','breakthrough','event','gift'].includes(type))return;
  if(m.pointAt!=null && now-m.pointAt<4000)return;
  m.pointAt=now;
  if(m.week!==s.week){m.week=s.week;m.weekPoints=0;m.weekActivity={};}
  m.weekPoints=(m.weekPoints||0)+1;
  m.points=(m.points||0)+1;
  s.halls[m.index].points++;
  m.weekActivity??={};m.weekActivity[type]=(m.weekActivity[type]||0)+1;
  const h=s.halls[m.index];h.weekActivity??={};h.weekActivity[type]=(h.weekActivity[type]||0)+1;
}

export function creditHallBattle(w,index,points,now){
 const s=getState(w,now),h=s.halls[index];if(!hallEnabled(hallDefinitions(w)[index])||!h||!Number.isSafeInteger(points)||points<0)return;
 h.points+=points;h.battlePoints=(h.battlePoints||0)+points;h.weekActivity??={};h.weekActivity.battle=(h.weekActivity.battle||0)+points;
}

function detach(s,id,index) {
  const h=s.halls[index];
  h.disciples=h.disciples.filter(disciple=>disciple!==id);
  h.offers=h.offers.filter(offer=>offer.id!==id);
  if(h.elder===id){
    h.elder=null;
    h.since=0;
    h.guardUntil=0;
    h.offers=[];
  }
}

function assign(s,p,index,now) {
  const old=membership(s,p.id);
  if(old?.index===index)return;
  if(old)detach(s,p.id,old.index);
  delete p.hallDeparture;
  delete p.hallAppointmentOptOut;
  Object.defineProperty(s.members,p.id,{value:{index,joinedAt:now,points:0,week:s.week,weekPoints:0},writable:true,configurable:true,enumerable:true});
}

function leaveHall(s,p,m){
  detach(s,p.id,m.index);
  delete s.members[p.id];
  s.queue=s.queue.filter(q=>q.id!==p.id);
  p.hallDeparture={index:m.index,joinedAt:m.joinedAt};
}

function seat(w,s,index,p,now,emit,reason) {
  const h=s.halls[index];
  assign(s,p,index,now);
  delete p.hallAppointmentOptOut;
  h.elder=p.id;
  h.since=now;
  h.guardUntil=reason==='Thắng thách đấu'?now+10*60000:0;
  h.disciples=h.disciples.filter(id=>id!==p.id);
  h.offers=[];
  const {name}=hallDefinitions(w)[index];
  if(reason)emit(w,p,'Trưởng Lão · '+name,'title',now,{achieve:{kind:'elder',item:name,reason}});
}

const hallIndex = (w,s,arg) => {
  const n=Number(arg);
  const defs=hallDefinitions(w);
  if(Number.isSafeInteger(n)&&n>=1)return hallEnabled(defs[n-1])?n-1:-1;
  return defs.findIndex((hall,i)=>hallEnabled(hall)&&(hall.key===arg || hall.key+' duong'===arg || !!arg&&nameKey(w.players[s.halls[i].elder]?.name)===arg));
};

function eligible(w,s,id,master,ranked) {
  return real(w.players[id]) && id!==master && !s.halls.some(h=>h.elder===id) && ranked.some(p=>p.id===id)
    && w.playTransfers?.[id]?.phase!=='web';
}

export function hallCommand(w,p,words,now,ctx) {
  const text=words.join(' ').replace(/^(vaoduong|roiduong|thachdau|chantruyen|baisu|troluc)(?= |$)/,key=>({vaoduong:'vao duong',roiduong:'roi duong',thachdau:'thach dau',chantruyen:'chan truyen',baisu:'bai su',troluc:'tro luc'})[key]);
  const match=/^(vao duong|roi duong|thach dau|chan truyen|bai su|tro luc|duong)(?: (.*))?$/.exec(text);
  if(!match)return null;
  if(!real(p))return failure('Ngũ Đường dành cho đệ tử của Vân Hải Tông.');
  const [,command,arg='']=match, s=getState(w,now), m=membership(s,p.id);
  const defs=hallDefinitions(w);
  const index=hallIndex(w,s,arg), hall=s.halls[m?.index];
  if(command==='duong'){
    if(p.hallCardAt!=null&&now-p.hallCardAt<10000)return failure('Chờ ít giây để xem lại Ngọc Giản.');
    p.hallCardAt=now;
    const rows=hallView(w,now,ctx.active).halls;
    const selected=rows.find(h=>h.index===(m?.index??index));
    ctx.emit(w,p,selected?[selected.name,selected.perk].filter(Boolean).join(' · '):'Ngũ Đường · gõ vào đường kèm số hoặc tên','status',now,{hallCard:{selected:selected?.index??null,personal:m?.week===s.week?m.weekPoints:0,weekly:hallWeeklyView(s,now),halls:rows}});
    return success('Đã mở Ngọc Giản Ngũ Đường.');
  }
  if(command==='vao duong'){
    if(['registration','running'].includes(w.hallWar?.phase))return failure('Đang Ngũ Đường Tranh Phong • đợi hết trận để đổi Đường.');
    if(index<0)return failure('Gõ vào đường kèm số hoặc tên Đường.');
    if(m?.index===index)return success('Đạo hữu đã ở '+defs[index].name+'.');
    if(hall?.elder===p.id)return failure('Trưởng Lão đang giữ ghế của Đường.');
    const previous=m ?? p.hallDeparture;
    if(previous && previous.index!==index && now-previous.joinedAt<WEEK)return failure('Đổi Đường sau '+Math.ceil((previous.joinedAt+WEEK-now)/3600000)+' giờ.');
    assign(s,p,index,now);
    const message='Gia nhập '+defs[index].name;
    ctx.emit(w,p,message,'status',now);
    return success(message);
  }
  if(command==='roi duong'){
    if(arg)return failure('Gõ rời đường để rời Đường hiện tại.');
    if(!m)return failure('Đạo hữu chưa gia nhập Đường nào.');
    if(['registration','running'].includes(w.hallWar?.phase))return failure('Đang Ngũ Đường Tranh Phong • đợi hết trận để rời Đường.');
    if(s.match && [s.match.a,s.match.b].includes(p.id))return failure('Đợi công bố kết quả Vân Đài để rời Đường.');
    leaveHall(s,p,m);
    const message='Đã rời '+defs[m.index].name+'.';
    ctx.emit(w,p,message,'status',now);
    return success(message);
  }
  if(command==='tro luc'){
    const bout=s.match;
    if(!bout || now>=bout.endsAt)return failure('Vân Đài chưa có trận thách đấu.');
    if([bout.a,bout.b].includes(p.id))return failure('Hai đấu thủ đang giao chiến.');
    if(Object.hasOwn(bout.support,'p:'+p.id)&&now-bout.support['p:'+p.id]<4000)return failure('Hồi trợ lực sau ít giây.');
    const defend=bout.defenderPresent&&m?.index===bout.index;
    const side=defend?'defense':'offense';
    bout.support['p:'+p.id]=now;
    bout[side]=Math.min(20,bout[side]+1);
    return success(defend?'Đã hộ sư.':'Đã trợ lực người thách đấu.');
  }
  if(command==='thach dau'){
    if(!s.halls.some(h=>h.elder))tickHalls(w,now,ctx,true);
    if(index<0 || !s.halls[index].elder)return failure('Chọn ghế Trưởng Lão bằng lệnh thách đấu kèm số hoặc tên Đường.');
    const master=masterId(w,ctx.active,now), ranked=thienBang(w,ctx.active,now,master);
    if(!eligible(w,s,p.id,master,ranked))return failure('Người trong Thiên Bảng đang không giữ chức vị mới có thể thách đấu.');
    if(p.hallDefeatUntil>now)return failure('Chờ '+Math.ceil((p.hallDefeatUntil-now)/60000)+' phút để thách đấu lại.');
    if(s.halls[index].guardUntil>now)return failure('Trưởng Lão đang được miễn chiến.');
    if(s.match?.a===p.id||s.queue.some(q=>q.id===p.id))return failure('Đạo hữu đã có lượt trên Vân Đài.');
    s.queue.push({id:p.id,index,queuedAt:now});
    tickHalls(w,now,ctx,true);
    if(s.match?.a!==p.id)ctx.emit(w,p,'Đã vào hàng chờ thách đấu · '+defs[index].name,'status',now);
    return success(s.match?.a===p.id?'Trận đấu đã bắt đầu.':'Đã xếp hàng Vân Đài.');
  }
  if(command==='chan truyen'){
    if(hall?.elder!==p.id)return failure('Trưởng Lão mới có thể truyền dạy.');
    const found=Object.values(w.players).filter(x=>x.id!==p.id&&membership(s,x.id)?.index===m.index&&(nameKey(x.name)===arg||nameKey(x.handle)===arg||x.id===arg));
    if(found.length!==1)return failure('Gõ chân truyền kèm tên hoặc tên tài khoản của một đệ tử cùng Đường.');
    const target=found[0];
    if(hall.disciples.includes(target.id))return failure('Đệ tử này đã là Chân Truyền.');
    hall.offers=hall.offers.filter(o=>o.until>now&&o.id!==target.id);
    if(hall.disciples.length+hall.offers.length>=3)return failure('Đường đã đủ ba suất Chân Truyền.');
    hall.offers.push({id:target.id,until:now+DAY});
    ctx.emit(w,target,p.name+' mời nhận Chân Truyền · gõ bái sư','status',now);
    return success('Đã gửi lời mời Chân Truyền.');
  }
  if(!hall?.offers.some(o=>o.id===p.id&&o.until>now)||hall.disciples.length>=3)return failure('Đạo hữu chưa có lời mời Chân Truyền còn hiệu lực.');
  promote(w,hall,p,m.index,now,ctx.emit);
  return success('Đã bái sư.');
}

function promote(w,hall,p,index,now,emit){
  hall.offers=hall.offers.filter(o=>o.id!==p.id);
  hall.disciples.push(p.id);
  const {name}=hallDefinitions(w)[index];
  emit(w,p,'Chân Truyền · '+name,'title',now,{achieve:{kind:'disciple',item:name}});
}

export function tickHalls(w,now,ctx,force=false){
  if(w.mode==='web')return;
  const s=getState(w,now);
  const defs=hallDefinitions(w);
  payHallWeeklyRewards(w,s,now,ctx,defs);
  if(['registration','running'].includes(w.hallWar?.phase))return;
  if(!force && !s.match && now-(s.scanAt??-Infinity)<5000)return;
  if(s.match && now<s.match.endsAt)return;
  s.scanAt=now;
  const master=masterId(w,ctx.active,now), ranked=thienBang(w,ctx.active,now,master);
  const bout=s.match;
  if(bout){
    const h=s.halls[bout.index], a=w.players[bout.a], b=w.players[bout.b];
    if(h.elder===bout.b&&real(a)&&a.id!==master&&real(b)&&b.id!==master){
      if(bout.attackQi*(1+bout.offense*.01)>bout.defenseQi*(1+bout.defense*.01)){
        seat(w,s,bout.index,a,now,ctx.emit,'Thắng thách đấu');
      }else{
        a.hallDefeatUntil=now+30*60000;
        h.guardUntil=now+10*60000;
        const {name}=defs[bout.index];
        ctx.emit(w,b,'Giữ ghế Trưởng Lão · '+name,'title',now,{achieve:{kind:'elder',item:name,reason:'Thủ đài thành công'}});
      }
    }
    s.match=null;
    s.nextMatchAt=now+5500;
  }
  for(const [index,h] of s.halls.entries()){
    if(!hallEnabled(defs[index]))continue;
    const elder=w.players[h.elder], absent=elder && now-Math.max(h.since,elder.lastActive||0)>=3*DAY;
    h.disciples=h.disciples.filter(id=>real(w.players[id])&&membership(s,id)?.index===index);
    if(absent && elder.id!==master){
      const candidates=Object.values(w.players).filter(p=>real(p)&&p.id!==elder.id&&p.id!==master&&membership(s,p.id)?.index===index&&!h.disciples.includes(p.id)&&membership(s,p.id).points>0);
      candidates.sort((a,b)=>membership(s,b.id).points-membership(s,a.id).points||rankOrder(a,b));
      for(const p of candidates.slice(0,3-h.disciples.length))promote(w,h,p,index,now,ctx.emit);
    }
    if(!real(elder)||elder.id===master||absent){h.elder=null;h.offers=[];h.guardUntil=0;}
  }
  for(const [index,h] of s.halls.entries()){
    if(h.elder||!hallEnabled(defs[index]))continue;
    const next=ranked.find(p=>autoElder(w,s,p.id,master,ranked)&&(!h.since||now-(w.players[p.id].lastActive||0)<3*DAY));
    if(next)seat(w,s,index,w.players[next.id],now,ctx.emit,h.since?'Thiên Bảng đề cử':null);
  }
  for(const [index,h] of s.halls.entries()){
    const elder=w.players[h.elder];
    if(!elder||h.guardUntil>now)continue;
    const next=ranked.find(p=>p.totalQi>=score(elder)*1.2&&p.totalQi>score(elder)&&now-(w.players[p.id].lastActive||0)<3*DAY&&autoElder(w,s,p.id,master,ranked));
    if(next)seat(w,s,index,w.players[next.id],now,ctx.emit,'Tu vi vượt mốc kế nhiệm');
  }
  if(ctx.busy(w,now)||s.nextMatchAt>now)return;
  while(s.queue.length){
    const q=s.queue.shift(), h=s.halls[q.index], b=w.players[h.elder], a=w.players[q.id];
    if(!b||!ctx.active(w,a,now)&&now-q.queuedAt>10*60000||h.guardUntil>now||!eligible(w,s,q.id,master,ranked)||a.hallDefeatUntil>now)continue;
    s.match={a:a.id,b:b.id,index:q.index,startedAt:now,endsAt:now+MATCH_MS,attackQi:Math.max(1,score(a)),defenseQi:Math.max(1,score(b)),offense:0,defense:0,support:{},defenderPresent:ctx.active(w,b,now)};
    ctx.emit(w,a,'Thách đấu Trưởng Lão '+b.name+' · '+defs[q.index].name,'status',now,{hallChallenge:true});
    break;
  }
}

function autoElder(w,s,id,master,ranked){
  const p=w.players[id];
  return !p.hallDeparture&&!p.hallAppointmentOptOut&&eligible(w,s,id,master,ranked);
}

export function hallView(w,now,active) {
  const s=w.nguDuong, master=masterId(w,active,now);
  const person=id=>{
    const p=w.players[id];
    return real(p)?{id:p.id,name:p.name,realm:p.realm,active:active(w,p,now),avatar:p.avatar}:null;
  };
  const m=s?.match;
  const memberCounts=new Map();
  for(const member of Object.values(s?.members||{}))memberCounts.set(member.index,(memberCounts.get(member.index)||0)+1);
  return {
    weekly:hallWeeklyView(s,now),
    limit:MAX_ACTIVE_HALLS,
    thienBang:thienBang(w,active,now,master),
    halls:activeHalls(w).map(def=>{
      const {index}=def;
      const h=s?.halls[index];
      return {...def,memberCount:memberCounts.get(index)||0,elder:h?.elder===master?null:person(h?.elder),disciples:(h?.disciples||[]).map(person).filter(Boolean),points:s?.week===weekAt(now)?h?.points||0:0,activity:s?.week===weekAt(now)?h?.weekActivity||{}:{},battlePoints:s?.week===weekAt(now)?h?.battlePoints||0:0,champion:s?.week===weekAt(now)&&s.champion===index};
    }),
    match:m&&m.endsAt>now?{...m,support:undefined,a:person(m.a),b:person(m.b)}:null,
    queued:s?.queue.length||0
  };
}
