import {enrollLanternPair,lanternPairReady,awardLantern,LANTERN_PROMPTS} from './lantern-festival.mjs';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
const real=p=>p&&!p.puppet&&!p.resident;
const state=w=>w.companions??={invites:[],pairs:[],guards:[]};
const livePair=(s,id,now)=>s.pairs.find(x=>x.endsAt>now&&!x.finishedAt&&[x.a,x.b].includes(id));
const fail=message=>({ok:false,message});
function target(w,q){const n=norm(q);return Object.values(w.players).filter(p=>real(p)&&(norm(p.name)===n||norm(p.socialCode)===n||p.id===q));}
function reward(p,qi,stones,points){p.qi+=qi;p.totalQi+=qi;p.stones+=stones;p.companionPoints=(p.companionPoints||0)+points;}
export function companionCommand(w,p,cmd,rest,now,c){
 if(!['cungtu','giup'].includes(cmd))return null;if(!real(p))return fail('Hoạt động dành cho người xem thật.');
 const s=state(w);s.queue??=[];tickCompanions(w,now,c);
 if(cmd==='cungtu'&&rest==='huy'){s.queue=s.queue.filter(q=>q.id!==p.id);const pair=livePair(s,p.id,now);if(pair){pair.finishedAt=now;pair.cancelled=true;c.emit(w,p,'Đã kết thúc cùng tu • không nhận thưởng lượt này','social',now);}s.invites=s.invites.filter(i=>i.from!==p.id&&i.to!==p.id);return {ok:true};}
 if(now-(p.companionCommandAt||0)<5000)return fail('Chờ 5 giây trước khi dùng lại.');p.companionCommandAt=now;
 if(!rest&&cmd==='cungtu'&&!livePair(s,p.id,now)){
  const pending=s.invites.find(i=>i.to===p.id&&i.expiresAt>now);
  if(pending)rest=pending.from;
  else{
   if(now-(p.lastTogetherRewardAt||0)<600000)return fail('Đã nhận thưởng cùng tu • thử lại sau khi hồi 10 phút.');
   if(s.pairs.filter(x=>!x.finishedAt&&x.endsAt>now).length>=32)return fail('Các bàn đang đầy, thử lại sau.');
   s.invites=s.invites.filter(i=>i.from!==p.id);
   const choices=s.queue.filter(q=>q.id!==p.id&&real(w.players[q.id])&&c.active(w,w.players[q.id],now)&&!livePair(s,q.id,now)&&now-(w.players[q.id].lastTogetherRewardAt||0)>=600000&&!s.invites.some(i=>i.from===q.id||i.to===q.id));
   choices.sort((a,b)=>Math.abs((w.players[b.id].realm||0)-(p.realm||0))-Math.abs((w.players[a.id].realm||0)-(p.realm||0))||a.at-b.at);
   if(choices.length){const other=w.players[choices[0].id];s.queue=s.queue.filter(q=>![p.id,other.id].includes(q.id));createCompanionPair(w,other,p,now,c);return {ok:true,matched:true};}
   if(!s.queue.some(q=>q.id===p.id)){if(s.queue.length>=64)return fail('Đang nhiều người tìm bạn, thử lại sau.');s.queue.push({id:p.id,at:now,expiresAt:now+120000});}
   c.emit(w,p,'Đang tìm bạn cùng tu • ai muốn ngồi cùng gõ cungtu • cungtu huy để rời','social',now,{togetherWaiting:true});return {ok:true,waiting:true};
  }
 }
 if(!rest){const pair=livePair(s,p.id,now),pending=s.invites.find(i=>i.to===p.id&&i.expiresAt>now);c.emit(w,p,cmd==='giup'?'Gõ giup tên hoặc mã đạo hữu đủ điều kiện đột phá • tối đa 3 hộ pháp':pair?`Đang cùng tu • ${Math.ceil((pair.endsAt-now)/1000)}s • mỗi người gõ tuluyen 3 lần`:pending?`${w.players[pending.from]?.name} mời cùng tu • gõ cungtu ${w.players[pending.from]?.socialCode} để đồng ý`:'Gõ cungtu tên hoặc mã đạo hữu • người kia gõ lại để đồng ý • cungtu huy để dừng','status',now);return {ok:true};}
 const matches=target(w,rest);if(matches.length!==1)return fail(matches.length?'Trùng tên, hãy dùng mã #đạo hữu trên danh sách.':'Không tìm thấy tên / mã đạo hữu.');const other=matches[0];if(other.id===p.id)return fail('Chọn một đồng môn khác.');if(!c.active(w,other,now))return fail('Đồng môn cần bình luận lại để có mặt.');
 if(cmd==='giup'){
  if(!c.ready(other))return fail('Đồng môn chưa đủ điều kiện đột phá.');
  s.guards=s.guards.filter(g=>g.endsAt>now);const own=s.guards.find(g=>g.helper===p.id);if(own)return fail('Đạo hữu đang hộ pháp • chờ lượt này kết thúc.');
  if(s.guards.filter(g=>g.target===other.id&&g.realm===other.realm).length>=3)return fail('Đã đủ 3 hộ pháp.');
  if(now-(p.lastGuardRewardAt||0)<600000)return fail('Thưởng hộ pháp hồi sau 10 phút.');
  if(s.guards.length>=96)return fail('Đang có nhiều hộ pháp, thử lại sau.');
  s.guards.push({helper:p.id,target:other.id,realm:other.realm,startedAt:now,endsAt:now+120000});c.emit(w,p,`${p.name} hộ pháp cho ${other.name} • ${other.name} gõ dotpha trong 2 phút`,'social',now,{guardJoin:true,pair:[p.id,other.id]});return {ok:true};
 }
 if(livePair(s,p.id,now)||livePair(s,other.id,now))return fail('Một người đang cùng tu với đồng môn khác.');
 if(now-(p.lastTogetherRewardAt||0)<600000||now-(other.lastTogetherRewardAt||0)<600000)return fail('Thưởng cùng tu hồi sau 10 phút.');
 const invite=s.invites.find(i=>i.from===other.id&&i.to===p.id&&i.expiresAt>now);
 if(invite){if(s.pairs.filter(x=>!x.finishedAt&&x.endsAt>now).length>=32)return fail('Đã đủ 32 đôi cùng tu.');s.invites=s.invites.filter(i=>![p.id,other.id].includes(i.from)&&![p.id,other.id].includes(i.to));createCompanionPair(w,other,p,now,c);return {ok:true};}
 if(s.invites.some(i=>i.expiresAt>now&&(i.from===p.id||i.to===other.id)))return fail('Đã có lời mời đang chờ • bỏ qua sẽ hết hạn sau 60 giây.');if(s.invites.length>=96)return fail('Có nhiều lời mời, thử lại sau.');
 s.invites.push({from:p.id,to:other.id,expiresAt:now+60000});c.emit(w,other,`${p.name} mời ${other.name} cùng tu • đồng ý: cungtu ${p.socialCode} • bỏ qua để hết hạn`,'social',now,{togetherInvite:true,pair:[p.id,other.id]});return {ok:true};
}
export function createCompanionPair(w,a,b,now,c){const s=state(w),pair={id:'together:'+now+':'+b.id,a:a.id,b:b.id,startedAt:now,endsAt:now+180000,actions:{[a.id]:0,[b.id]:0},hearts:{[a.id]:0,[b.id]:0}};enrollLanternPair(w,pair,now);s.invites=s.invites.filter(i=>![a.id,b.id].includes(i.from)&&![a.id,b.id].includes(i.to));s.queue=(s.queue||[]).filter(q=>![a.id,b.id].includes(q.id));s.pairs.push(pair);const prompt=pair.festivalId?LANTERN_PROMPTS[pair.promptIndex]:null;c.emit(w,b,`${a.name} và ${b.name} bắt đầu cùng tu • mỗi người tuluyen 3 lần trong 3 phút`+(prompt?` • ${prompt.question} • cungtu a: ${prompt.a} / cungtu b: ${prompt.b}`:''),'social',now,{togetherStart:true,pair:[a.id,b.id],lanternPair:!!prompt});return pair;}
export function companionActivity(w,p,input,now,c){const s=w.companions;if(!s||!real(p))return;const pair=livePair(s,p.id,now);if(!pair)return;
 if(input.type==='cultivate')pair.actions[p.id]=Math.min(3,(pair.actions[p.id]||0)+1);
 if(input.type==='like')pair.hearts[p.id]=Math.min(300,(pair.hearts[p.id]||0)+input.count);
 if(pair.actions[pair.a]>=3&&pair.actions[pair.b]>=3&&lanternPairReady(pair)){pair.finishedAt=now;awardLantern(w,pair,now,c);for(const id of [pair.a,pair.b]){const q=w.players[id];reward(q,30,10,1);q.lastTogetherRewardAt=now;w.sectQi+=30;}c.emit(w,p,`${w.players[pair.a].name} và ${w.players[pair.b].name} cùng tu viên mãn • mỗi người +30 tu vi, 10 linh thạch, 1 điểm Đồng môn`,'social',now,{togetherDone:true,pair:[pair.a,pair.b]});}
}
export function finishGuard(w,p,from,now,c){const s=w.companions;if(!s)return [];const helpers=s.guards.filter(g=>g.target===p.id&&g.realm===from&&g.endsAt>now&&real(w.players[g.helper])&&c.active(w,w.players[g.helper],now)).slice(0,3);s.guards=s.guards.filter(g=>g.target!==p.id);if(!helpers.length)return [];
 const names=[];for(const g of helpers){const q=w.players[g.helper];reward(q,20,10,1);q.lastGuardRewardAt=now;w.sectQi+=20;names.push(q.name);}reward(p,30,10,1);w.sectQi+=30;
 c.emit(w,p,`${p.name} đột phá thành công • cảm tạ ${names.join(', ')} hộ pháp • chủ nhân +30 tu vi, hộ pháp +20; mỗi người +10 linh thạch, 1 điểm Đồng môn`,'social',now,{guardSuccess:true,pair:[p.id,...helpers.map(g=>g.helper)]});return helpers.map(g=>g.helper);
}
export function tickCompanions(w,now,c){const s=w.companions;if(!s)return;s.queue=(s.queue||[]).filter(q=>q.expiresAt>now&&real(w.players[q.id])&&c.active(w,w.players[q.id],now)&&!livePair(s,q.id,now));s.invites=s.invites.filter(i=>i.expiresAt>now);s.guards=s.guards.filter(g=>g.endsAt>now&&w.players[g.target]?.realm===g.realm);for(const pair of s.pairs)if(!pair.finishedAt&&now>=pair.endsAt){pair.finishedAt=now;pair.expired=true;c.emit(w,w.players[pair.a],'Cùng tu khép lại • chưa đủ 3 lượt tu luyện mỗi người • hẹn đồng môn lượt sau','social',now,{pair:[pair.a,pair.b]});}s.pairs=s.pairs.filter(x=>!x.finishedAt||now-x.finishedAt<15000);}
export function companionView(w,now){const s=w.companions;return s?{waiting:(s.queue||[]).length,pairs:s.pairs.filter(x=>!x.finishedAt&&x.endsAt>now).map(x=>({...x,aName:w.players[x.a]?.name,bName:w.players[x.b]?.name,prompt:x.festivalId?LANTERN_PROMPTS[x.promptIndex]:null})),guards:s.guards.filter(x=>x.endsAt>now),invites:s.invites.filter(x=>x.expiresAt>now).map(x=>({...x,fromName:w.players[x.from]?.name,toName:w.players[x.to]?.name,fromCode:w.players[x.from]?.socialCode}))}:{pairs:[],guards:[],invites:[]};}
