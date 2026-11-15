// LIVE 2.0 cooperative Heaven Trial: decorates (never gates) the *existing* breakthrough.
// Can be assisted for 90s by real viewers, but never takes over the main event stage.
// No failed-breakthrough outcome, no paid heart threshold, no realm/qi rollback.
import {live2Enabled} from './live2-systems.mjs';
const DAY=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
const day=at=>DAY.format(at);
const ok=(message,other={})=>({ok:true,message,...other});
const fail=message=>({ok:false,message});
const human=p=>!!p&&!p.puppet&&!p.resident&&!p.webOnly;
const normalized=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
export function live2TribulationBegin(w,p,now,emit){
 if(!live2Enabled(w)||!human(p)||!p.live2?.path||p.realm<5)return null;
 const stages=w.live2Tribulations??=[];
 // Bounded even when a very crowded LIVE has many simultaneous breakthroughs.
 w.live2Tribulations=stages.filter(e=>now<e.endsAt+60000).slice(-15);
 if(w.live2Tribulations.some(e=>e.targetId===p.id&&e.endsAt>now))return null;
 const e={id:'heaven-'+now+'-'+p.id,targetId:p.id,name:p.name,realm:p.realm,at:now,endsAt:now+90000,helpers:[],completed:false};
 w.live2Tribulations.push(e);
 emit(w,p,'HỘ KIẾP KHAI MỞ • Ba đạo hữu hợp lực trong 90 giây để khai ấn hộ thân','status',now,
  {live2:true,tribulationOpen:true,tribulationId:e.id});
 return e;
}
export function live2TribulationView(w,now){
 if(!live2Enabled(w))return [];
 const stages=w.live2Tribulations||[],live=[];
 for(let i=stages.length-1;i>=0&&live.length<4;i--){
  const x=stages[i];
  if(x.endsAt>now&&human(w.players[x.targetId]))live.push({id:x.id,targetId:x.targetId,name:x.name,realm:x.realm,endsAt:x.endsAt,helpers:x.helpers.length,completed:x.completed});
 }
 return live;
}
export function live2TribulationCommand(w,p,words,now,emit){
 if(!live2Enabled(w)||!human(p))return null;
 const cmd=words[0],rest=words.slice(1).join(' ');
 if(cmd==='thien'&&rest==='kiep'){
  const list=live2TribulationView(w,now);
  const txt=list.length?'Thiên Kiếp đang mở: '+list.map(x=>x.name+' '+x.helpers+'/3 hộ kiếp').join(' • '):'Chưa có Thiên Kiếp hộ đạo; người chọn Đạo Thống đột phá từ Hóa Thần sẽ mở lượt.';
  emit(w,p,txt,'status',now);return ok(txt);
 }
 if(cmd!=='ho'||!rest.startsWith('kiep '))return null;
 const query=normalized(rest.slice(5));
 if(!query)return fail('Gõ hộ kiếp + tên người vừa đột phá.');
 // Search only bounded active Heaven Trials (≤16), never scan thousands of unrelated viewers.
 let owner=null,stage=null;
 for(let i=(w.live2Tribulations?.length||0)-1;i>=0;i--){
  const trial=w.live2Tribulations[i],candidate=w.players[trial.targetId];
  if(trial.endsAt<=now||!human(candidate))continue;
  if(![candidate.id,candidate.name,candidate.socialCode,candidate.handle].some(v=>normalized(v)===query))continue;
  if(owner&&owner.id!==candidate.id)return fail('Trùng tên đạo hữu hộ kiếp • hãy dùng mã chính xác.');
  if(!owner){owner=candidate;stage=trial;}
 }
 if(!owner)return fail('Không tìm thấy Thiên Kiếp đang mở cho tên hoặc mã này.');
 if(p.id===owner.id)return fail('Không thể tự hộ kiếp cho bản thân.');
 if(!stage||stage.completed)return fail('Thiên Kiếp của đạo hữu này đã kết thúc hoặc viên mãn.');
 if(stage.helpers.includes(p.id))return fail('Bạn đã hộ kiếp lượt này.');
 if((owner.lastActive||0)<now-300000)return fail('Người được hộ kiếp phải đang hoạt động trên LIVE.');
 if(stage.helpers.length>=6)return fail('Pháp trận đã đủ đạo hữu trợ lực.');
 stage.helpers.push(p.id);
 const ledger=p.live2??={v:1},today=day(now);
 if(ledger.tribHelpDay!==today){ledger.tribHelpDay=today;ledger.tribHelpRewards=0;}
 if(ledger.tribHelpRewards<3){ledger.tribHelpRewards++;p.stones=(p.stones||0)+2;}
 if(stage.helpers.length>=3){
  stage.completed=true;stage.completedAt=now;
  const o=owner.live2??={v:1};
  o.heavenResonanceUntil=now+10*60000;
  o.tribulationsCompleted=(o.tribulationsCompleted||0)+1;
  emit(w,owner,'THIÊN NHÂN HỢP NHẤT • '+owner.name+' được đồng môn hộ kiếp!','daoPath',now,
   {live2:true,live2Kind:'tribulation',daoPath:o.path||'body',tribulationComplete:true,tribulationHelpers:stage.helpers.slice(0,3)});
  return ok('Pháp trận đủ 3 người; hộ kiếp viên mãn.',{completed:true});
 }
 return ok('Đã hộ kiếp cho '+owner.name+' ('+stage.helpers.length+'/3).');
}
export function live2TribulationTick(w,now){
 if(!Array.isArray(w.live2Tribulations))return;
 // Constant-size pruning, no paint, no reward or extra event when timers expire.
 if(w.live2Tribulations.length>16||w.live2Tribulations.some(e=>e.endsAt+60000<=now))
  w.live2Tribulations=w.live2Tribulations.filter(e=>e.endsAt+60000>now).slice(-16);
}
export function live2TribulationBonus(p,now){
 return p?.live2?.heavenResonanceUntil>now?1.02:1;
}
