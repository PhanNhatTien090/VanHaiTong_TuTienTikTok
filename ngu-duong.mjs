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
const nameKey = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();
const success = message => ({ok:true,message});
const failure = message => ({ok:false,message});
const blankHall = () => ({elder:null, since:0, disciples:[], offers:[], points:0});

function getState(w,now) {
  const s = w.nguDuong ??= {week:weekAt(now), halls:HALLS.map(blankHall), members:{}, queue:[], match:null};
  settleHallWeek(w,s,now,HALLS);
  return s;
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
  return {rate:(rates[i][source]||0)+(eligible&&s.champion===i?.05:0),herbs:i===4&&source==='gather'?1:0,craft:i===1};
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
 const s=getState(w,now),h=s.halls[index];if(!h||!Number.isSafeInteger(points)||points<0)return;
 h.points+=points;h.battlePoints=(h.battlePoints||0)+points;h.weekActivity??={};h.weekActivity.battle=(h.weekActivity.battle||0)+points;
}

function assign(s,p,index,now) {
  const old=membership(s,p.id);
  if(old?.index===index)return;
  if(old){
    const h=s.halls[old.index];
    h.disciples=h.disciples.filter(id=>id!==p.id);
    h.offers=h.offers.filter(offer=>offer.id!==p.id);
    if(h.elder===p.id){h.elder=null;h.since=0;h.offers=[];}
  }
  Object.defineProperty(s.members,p.id,{value:{index,joinedAt:now,points:0,week:s.week,weekPoints:0},writable:true,configurable:true,enumerable:true});
}

function seat(w,s,index,p,now,emit,reason) {
  const h=s.halls[index];
  assign(s,p,index,now);
  h.elder=p.id;
  h.since=now;
  h.guardUntil=reason==='Thắng thách đấu'?now+10*60000:0;
  h.disciples=h.disciples.filter(id=>id!==p.id);
  h.offers=[];
  if(reason)emit(w,p,'Trưởng Lão · '+HALLS[index].name,'title',now,{achieve:{kind:'elder',item:HALLS[index].name,reason}});
}

const hallIndex = (w,s,arg) => {
  const n=Number(arg);
  if(Number.isInteger(n)&&n>=1&&n<=HALLS.length)return n-1;
  return HALLS.findIndex((hall,i)=>hall.key===arg || hall.key+' duong'===arg || !!arg&&nameKey(w.players[s.halls[i].elder]?.name)===arg);
};

function eligible(w,s,id,master,ranked) {
  return real(w.players[id]) && id!==master && !s.halls.some(h=>h.elder===id) && ranked.some(p=>p.id===id)
    && w.playTransfers?.[id]?.phase!=='web';
}

export function hallCommand(w,p,words,now,ctx) {
  const text=words.join(' ').replace(/^(vaoduong|thachdau|chantruyen|baisu|troluc)(?= |$)/,key=>({vaoduong:'vao duong',thachdau:'thach dau',chantruyen:'chan truyen',baisu:'bai su',troluc:'tro luc'})[key]);
  const match=/^(vao duong|thach dau|chan truyen|bai su|tro luc|duong)(?: (.*))?$/.exec(text);
  if(!match)return null;
  if(!real(p))return failure('Ngũ Đường dành cho đệ tử của Vân Hải Tông.');
  const [,command,arg='']=match, s=getState(w,now), m=membership(s,p.id);
  const index=hallIndex(w,s,arg), hall=s.halls[m?.index];
  if(command==='duong'){
    if(p.hallCardAt!=null&&now-p.hallCardAt<10000)return failure('Chờ ít giây để xem lại Ngọc Giản.');
    p.hallCardAt=now;
    const rows=hallView(w,now,ctx.active).halls;
    const selected=rows[m?.index??index];
    ctx.emit(w,p,selected?selected.name+' · '+selected.perk:'Ngũ Đường · gõ vào đường 1–5','status',now,{hallCard:{selected:selected?.index??null,personal:m?.week===s.week?m.weekPoints:0,weekly:hallWeeklyView(s,now),halls:rows}});
    return success('Đã mở Ngọc Giản Ngũ Đường.');
  }
  if(command==='vao duong'){
    if(['registration','running'].includes(w.hallWar?.phase))return failure('Đang Ngũ Đường Tranh Phong • đợi hết trận để đổi Đường.');
    if(index<0)return failure('Gõ vào đường 1–5 hoặc tên Đường.');
    if(m?.index===index)return success('Đạo hữu đã ở '+HALLS[index].name+'.');
    if(hall?.elder===p.id)return failure('Trưởng Lão đang giữ ghế của Đường.');
    if(m && now-m.joinedAt<WEEK)return failure('Đổi Đường sau '+Math.ceil((m.joinedAt+WEEK-now)/3600000)+' giờ.');
    assign(s,p,index,now);
    const message='Gia nhập '+HALLS[index].name;
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
    if(index<0 || !s.halls[index].elder)return failure('Chọn ghế Trưởng Lão bằng lệnh thách đấu 1–5.');
    const master=masterId(w,ctx.active,now), ranked=thienBang(w,ctx.active,now,master);
    if(!eligible(w,s,p.id,master,ranked))return failure('Người trong Thiên Bảng đang không giữ chức vị mới có thể thách đấu.');
    if(p.hallDefeatUntil>now)return failure('Chờ '+Math.ceil((p.hallDefeatUntil-now)/60000)+' phút để thách đấu lại.');
    if(s.halls[index].guardUntil>now)return failure('Trưởng Lão đang được miễn chiến.');
    if(s.match?.a===p.id||s.queue.some(q=>q.id===p.id))return failure('Đạo hữu đã có lượt trên Vân Đài.');
    s.queue.push({id:p.id,index,queuedAt:now});
    tickHalls(w,now,ctx,true);
    if(s.match?.a!==p.id)ctx.emit(w,p,'Đã vào hàng chờ thách đấu · '+HALLS[index].name,'status',now);
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
  emit(w,p,'Chân Truyền · '+HALLS[index].name,'title',now,{achieve:{kind:'disciple',item:HALLS[index].name}});
}

export function tickHalls(w,now,ctx,force=false){
  if(w.mode==='web')return;
  const s=getState(w,now);
  payHallWeeklyRewards(w,s,now,ctx,HALLS);
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
        ctx.emit(w,b,'Giữ ghế Trưởng Lão · '+HALLS[bout.index].name,'title',now,{achieve:{kind:'elder',item:HALLS[bout.index].name,reason:'Thủ đài thành công'}});
      }
    }
    s.match=null;
    s.nextMatchAt=now+5500;
  }
  for(const [index,h] of s.halls.entries()){
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
    if(h.elder)continue;
    const next=ranked.find(p=>(!h.since||now-(w.players[p.id].lastActive||0)<3*DAY)&&eligible(w,s,p.id,master,ranked));
    if(next)seat(w,s,index,w.players[next.id],now,ctx.emit,h.since?'Thiên Bảng đề cử':null);
  }
  for(const [index,h] of s.halls.entries()){
    const elder=w.players[h.elder];
    if(!elder||h.guardUntil>now)continue;
    const next=ranked.find(p=>p.totalQi>score(elder)&&now-(w.players[p.id].lastActive||0)<3*DAY&&p.totalQi>=score(elder)*1.2&&eligible(w,s,p.id,master,ranked));
    if(next)seat(w,s,index,w.players[next.id],now,ctx.emit,'Tu vi vượt mốc kế nhiệm');
  }
  if(ctx.busy(w,now)||s.nextMatchAt>now)return;
  while(s.queue.length){
    const q=s.queue.shift(), h=s.halls[q.index], b=w.players[h.elder], a=w.players[q.id];
    if(!b||!ctx.active(w,a,now)&&now-q.queuedAt>10*60000||h.guardUntil>now||!eligible(w,s,q.id,master,ranked)||a.hallDefeatUntil>now)continue;
    s.match={a:a.id,b:b.id,index:q.index,startedAt:now,endsAt:now+MATCH_MS,attackQi:Math.max(1,score(a)),defenseQi:Math.max(1,score(b)),offense:0,defense:0,support:{},defenderPresent:ctx.active(w,b,now)};
    ctx.emit(w,a,'Thách đấu Trưởng Lão '+b.name+' · '+HALLS[q.index].name,'status',now,{hallChallenge:true});
    break;
  }
}

export function hallView(w,now,active) {
  const s=w.nguDuong, master=masterId(w,active,now);
  const person=id=>{
    const p=w.players[id];
    return real(p)?{id:p.id,name:p.name,realm:p.realm,active:active(w,p,now),avatar:p.avatar}:null;
  };
  const m=s?.match;
  return {
    weekly:hallWeeklyView(s,now),
    thienBang:thienBang(w,active,now,master),
    halls:HALLS.map((def,index)=>{
      const h=s?.halls[index];
      return {...def,index,elder:h?.elder===master?null:person(h?.elder),disciples:(h?.disciples||[]).map(person).filter(Boolean),points:s?.week===weekAt(now)?h?.points||0:0,activity:s?.week===weekAt(now)?h?.weekActivity||{}:{},battlePoints:s?.week===weekAt(now)?h?.battlePoints||0:0,champion:s?.week===weekAt(now)&&s.champion===index};
    }),
    match:m&&m.endsAt>now?{...m,support:undefined,a:person(m.a),b:person(m.b)}:null,
    queued:s?.queue.length||0
  };
}
