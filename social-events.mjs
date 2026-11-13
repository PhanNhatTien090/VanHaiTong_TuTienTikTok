import {activeBonds,syncBondRefs,bondAllowance,alreadyBonded} from './bond-relations.mjs';
import {stageConflict} from './stage-lock.mjs';
import {FESTIVAL_ITEM,festivalEnroll,tickBondFestival,festivalView} from './bond-festival.mjs';
export const SOCIAL_ITEMS=[FESTIVAL_ITEM,
 {id:'tournament-laurel',type:'artifact',name:'Kiếm Khôi Ngọc Ấn',icon:'orb',tier:0,price:0,herbs:0,damage:0,bonus:0,exclusive:true,eventReward:'Vô địch Luận Kiếm',description:'Kỷ vật vinh danh quán quân; không cộng sức mạnh.'},
 {id:'bond-jade',type:'artifact',name:'Tam Sinh Ngọc Bội',icon:'orb',tier:0,price:0,herbs:0,damage:0,bonus:0,exclusive:true,eventReward:'Hai người đồng ý kết duyên',description:'Kỷ vật đôi, giữ lại sau khi kết thúc quan hệ.'}
];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const ok=()=>({ok:true}),fail=message=>({ok:false,message});
export const tournamentActive=w=>['registration','running'].includes(w.tournament?.phase);
// 05/11/2026: ai ghi danh cũng vào giải. Vòng còn trên 4 người so tài nhanh bằng thẻ avatar (không lên đài);
// chỉ bán kết + chung kết (tối đa 3 ván) mới diễn trên đài. Cách tính thắng thua giữ nguyên.
export const STAGED_MAX=4,QUICK_PAIRS=4,QUICK_REVEAL_MS=2600,QUICK_MS=4200,DUEL_MS=25000;
export function socialState(w){return w.social??={nextCode:1,invites:{},bonds:{},ceremonies:[],activeCeremony:null,history:[]};}
export function socialProfile(w,p){const s=socialState(w);if(!p.socialCode)p.socialCode=(s.nextCode++).toString(36).toUpperCase().padStart(4,'0');return p;}
export function socialBusy(w,now){return ['queued','registration','running'].includes(w.race?.phase)||w.race?.podiumUntil>now||tournamentActive(w)||w.tournament?.podiumUntil>now||socialState(w).activeCeremony?.endsAt>now;}
export function existingEvent(w,now){return stageConflict(w,now,{allowBond:true});}
export function startTournament(w,now,c){
 const busy=stageConflict(w,now);if(busy||socialBusy(w,now))return fail('Đang có '+(busy||'tỷ thí / lễ kết duyên')+'. Dừng hoặc chờ hoạt động đó kết thúc.');
 w.tournament={id:'tournament-'+now,phase:'registration',startedAt:now,registrationEndsAt:now+90000,entries:[...(w.tournament?.waiting||[])].map(e=>({id:e.id,at:now})),waiting:[],round:1,matches:[],matchIndex:0,current:null,results:[],awarded:{}};
 c.emit(w,null,'Phong Vân Luận Kiếm mở tuyển 90 giây • gõ tythi • ai ghi danh cũng được so tài','tournament',now);return ok();
}
export function stopTournament(w,now,c){if(!tournamentActive(w))return fail('Không có tỷ thí đang chạy.');w.tournament.phase='cancelled';w.tournament.current=null;w.tournament.quick=null;w.nextBossAt=now+(w.settings?.bossInterval??240)*1000;c.emit(w,null,'Tỷ thí đã dừng • giữ nguyên tu vi và trang bị','tournament',now);return ok();}
function notify(w,p,text,now,c){c.emit(w,p,text,'social',now);}
function giveItem(p,id){if(!p.artifacts.includes(id))p.artifacts.push(id);}
function reward(w,p,eventId,medals,now,c,quiet=false){const e=w.tournament;if(e.awarded[eventId])return;e.awarded[eventId]=true;p.tournamentMedals=(p.tournamentMedals||0)+medals;if(!quiet)notify(w,p,'Luận Kiếm • +'+medals+' huy chương • tổng '+p.tournamentMedals,now,c);}
// Quy tắc thắng thua (không đổi): tổng tu vi cao hơn từ 3% trở lên thì thắng chắc; sát nhau mới so điểm + trợ lực; hòa điểm ưu tiên đăng ký trước.
function decide(t,a,b,strengths,boosts={}){
 const score=id=>strengths[id]+Math.min(3,boosts[id]||0)*2,qa=t.fighters[a]?.totalQi||0,qb=t.fighters[b]?.totalQi||0,decided=qa>=qb*1.03?a:qb>=qa*1.03?b:null;
 const tie=!decided&&score(a)===score(b),aEarlier=(t.entries.find(e=>e.id===a)?.at||0)<=(t.entries.find(e=>e.id===b)?.at||0),winner=decided||(score(a)>score(b)||tie&&aEarlier?a:b);
 return {winner,loser:winner===a?b:a,scoreA:score(a),scoreB:score(b),tie};
}
function match(w,a,b,now,c){
 const t=w.tournament,pa=w.players[a],pb=w.players[b],sa=t.fighters[a],sb=t.fighters[b];
 return {id:t.id+'-'+t.round+'-'+t.matchIndex,a,b,startedAt:now,endsAt:now+DUEL_MS,boosts:{[a]:0,[b]:0},lastBoost:{},strengths:{[a]:sa.strength,[b]:sb.strength},techniques:{[a]:c.technique(pa),[b]:c.technique(pb)},aura:{[a]:0,[b]:0}};
}
// Re-seed every round by actual cultivation, not equipment power or registration order.
export function tournamentPairs(ids,fighters){
 const ordered=[...ids].sort((a,b)=>(fighters[a]?.realm||0)-(fighters[b]?.realm||0)||(fighters[a]?.totalQi||0)-(fighters[b]?.totalQi||0)||a.localeCompare(b));
 const cost=(a,b)=>Math.abs((fighters[a]?.realm||0)-(fighters[b]?.realm||0))*4+Math.abs(Math.log((Math.max(0,fighters[a]?.totalQi||0)+10)/(Math.max(0,fighters[b]?.totalQi||0)+10)));
 const make=list=>Array.from({length:list.length/2},(_,i)=>[list[i*2],list[i*2+1]]);
 if(ordered.length%2===0)return make(ordered);
 let best=null,bestCost=Infinity;
 // An odd entrant receives a bye where it avoids the largest mismatch.
 for(let i=0;i<ordered.length;i++){
  const pairs=make(ordered.filter((_,j)=>j!==i)),score=pairs.reduce((sum,[a,b])=>sum+cost(a,b),0);
  if(score<bestCost){bestCost=score;best=[...pairs,[ordered[i],null]];}
 }
 return best||[];
}
function pairRound(w,ids,now,c){const t=w.tournament;t.matches=tournamentPairs(ids,t.fighters);t.matchIndex=0;t.nextMatchAt=now+1800;t.current=null;t.quick=null;t.roundSize=ids.length;t.roundStaged=ids.length<=STAGED_MAX;t.roundAnnounced=false;}

function beginRound(w,now,c){
 const t=w.tournament,eligible=t.entries.filter(e=>w.players[e.id]&&c.active(w,w.players[e.id],now)).sort((a,b)=>(w.players[a.id].lastTournamentAt||0)-(w.players[b.id].lastTournamentAt||0)||a.at-b.at);
 if(eligible.length<2){t.phase='cancelled';notify(w,null,'Chưa đủ 2 đạo hữu hoạt động • hẹn lượt tỷ thí tiếp theo',now,c);return;}
 const selected=eligible;t.waiting=[];const quietJoin=selected.length>8;t.participants=selected.map(e=>e.id);t.phase='running';t.fighters={};
 // Sức mạnh tỷ thí = sức mạnh chiến đấu + cảnh giới×5; khoảng giãn rộng (70–160) để người mạnh hơn rõ ràng thì thắng.
 // Tỷ thí xét TỔNG TU VI: tu vi cao hơn thì mạnh hơn (thanh máu cũng theo đó). Sức mạnh trang bị chỉ cộng rất nhỏ để phân định khi bằng nhau.
 const duelPower=p=>Math.log10((Number(p.totalQi)||0)+10)*100+c.power(p)*0.05;
 const powers=selected.map(e=>duelPower(w.players[e.id])).sort((a,b)=>a-b),median=powers[Math.floor(powers.length/2)]||1;
 for(const e of selected){const p=w.players[e.id];p.lastTournamentAt=now;const tech=c.technique(p);t.fighters[p.id]={name:p.name,tech:{id:tech.id,name:tech.name,color:tech.color,intensity:tech.intensity},strength:Math.max(70,Math.min(160,100*(duelPower(p)/median)**4)),power:c.power(p),totalQi:Number(p.totalQi)||0,realm:Number(p.realm)||0};reward(w,p,'join:'+p.id,1,now,c,quietJoin);}
 pairRound(w,selected.map(e=>e.id),now,c);
 c.emit(w,null,'Luận Kiếm bắt đầu • '+selected.length+' đấu thủ • '+(selected.length>STAGED_MAX?'vòng loại so tài nhanh, tối đa 3 ván cuối lên đài':'các ván lên đài')+' • ghép cặp gần cảnh giới và tổng tu vi • đấu thủ gõ kiem tiếp linh lực','tournament',now);
}
function finishMatch(w,now,c){
 const t=w.tournament,m=t.current,r=decide(t,m.a,m.b,m.strengths,m.boosts),{winner,loser,tie}=r;
 t.results.push({id:m.id,round:t.round,a:m.a,b:m.b,winner,loser,scoreA:r.scoreA,scoreB:r.scoreB,tieBreak:tie?'Ưu tiên thứ tự đăng ký':null,staged:true});
 t.lastBow={winner,loser,pair:[m.a,m.b],at:now,until:now+3000};
 reward(w,w.players[winner],'win:'+m.id,2,now,c);c.emit(w,w.players[winner],'Thắng ván luận kiếm'+(tie?' • hòa điểm, ưu tiên đăng ký trước':''),'tournament',now,{duelResult:true,pair:[m.a,m.b]});
 t.current=null;t.matchIndex++;t.nextMatchAt=now+3000;
}
// Vòng loại: so tài nhanh từng cụm tối đa QUICK_PAIRS cặp, chỉ hiện thẻ avatar rồi lộ người thắng; không đánh trên đài, không đọc từng ván.
function quickBatch(w,now,c){
 const t=w.tournament,pairs=[];
 while(t.matchIndex<t.matches.length&&pairs.length<QUICK_PAIRS){const [a,b]=t.matches[t.matchIndex];t.matchIndex++;if(!b)continue;
  const id=t.id+'-'+t.round+'-q'+t.matchIndex,r=decide(t,a,b,{[a]:t.fighters[a].strength,[b]:t.fighters[b].strength});
  t.results.push({id,round:t.round,a,b,winner:r.winner,loser:r.loser,scoreA:r.scoreA,scoreB:r.scoreB,tieBreak:r.tie?'Ưu tiên thứ tự đăng ký':null,quick:true});
  reward(w,w.players[r.winner],'win:'+id,2,now,c,true);pairs.push({a,b,winner:r.winner,aName:t.fighters[a].name,bName:t.fighters[b].name,aTech:t.fighters[a].tech,bTech:t.fighters[b].tech});}
 if(!pairs.length){t.nextMatchAt=now;return;}
 if(!t.roundAnnounced){t.roundAnnounced=true;c.emit(w,null,'Luận Kiếm vòng '+t.round+' • '+t.roundSize+' đấu thủ so tài nhanh','tournament',now,{quickRound:true});}
 t.quick={id:t.id+'-'+t.round+'-batch'+t.matchIndex,round:t.round,pairs,startedAt:now,revealAt:now+QUICK_REVEAL_MS,endsAt:now+QUICK_MS};
}
function finishTournament(w,winner,now,c){
 const t=w.tournament;if(t.phase==='finished')return;t.phase='finished';t.winner=winner;t.finishedAt=now;t.current=null;t.quick=null;
 const p=w.players[winner];reward(w,p,'champion:'+t.id,5,now,c);p.tournamentWins=(p.tournamentWins||0)+1;p.tournamentTitle='Kiếm Khôi Tông Môn';giveItem(p,'tournament-laurel');
 t.podiumUntil=now+12000;c.emit(w,p,'KIẾM KHÔI TÔNG MÔN • vô địch Phong Vân Luận Kiếm','tournament',now,{tournamentChampion:true});w.nextBossAt=now+(w.settings?.bossInterval??240)*1000;
}
function tickTournament(w,now,c){
 const t=w.tournament;if(!tournamentActive(w))return;
 if(t.phase==='registration'){if(now>=t.registrationEndsAt)beginRound(w,now,c);return;}
 if(t.current){const m=t.current,progress=Math.max(0,Math.min(1,(now-m.startedAt)/DUEL_MS)),lead=decide(t,m.a,m.b,m.strengths,m.boosts);m.aura??={};
  // Linh áp tăng dần (không có thanh máu): bên đang dẫn lên 100, bên kia dừng thấp hơn theo tỉ lệ điểm.
  for(const id of [m.a,m.b]){const own=id===m.a?lead.scoreA:lead.scoreB,top=Math.max(lead.scoreA,lead.scoreB)||1,cap=id===lead.winner?100:Math.max(60,Math.min(97,Math.round(100*own/top)-(lead.winner===id?0:3)));m.aura[id]=Math.round(progress*cap);}
  if(now>=m.endsAt)finishMatch(w,now,c);return;}
 if(t.quick){if(now<t.quick.endsAt)return;t.quick=null;t.nextMatchAt=now+600;return;}
 if(now<t.nextMatchAt)return;
 if(t.matchIndex>=t.matches.length){const wins=t.matches.map(([a,b])=>b?t.results.findLast(r=>r.round===t.round&&r.a===a&&r.b===b)?.winner:a).filter(Boolean);if(wins.length===1){finishTournament(w,wins[0],now,c);return;}t.round++;pairRound(w,wins,now,c);return;}
 if(!(t.roundStaged??t.matches.length*2<=STAGED_MAX)){quickBatch(w,now,c);return;}
 const [a,b]=t.matches[t.matchIndex];if(!b){t.matchIndex++;return;}t.current=match(w,a,b,now,c);c.emit(w,null,'Luận Kiếm: '+w.players[a].name+' · '+w.players[b].name+' so tài • hai đấu thủ gõ kiem tiếp linh lực','tournament',now,{duelStart:true,pair:[a,b]});
}
function resolveTarget(w,text){const query=norm(text);if(!query)return [];return Object.values(w.players).filter(p=>!p.resident&&(norm(p.name)===query||norm(p.socialCode)===query||p.id===text));}
function markInteraction(w,p){p.interactions++;w.totalInteractions++;}
export function socialCommand(w,p,cmd,rest,now,c){
 const s=socialState(w);socialProfile(w,p);if(p.resident&&['tythi','ketduyen','dongy'].includes(cmd))return fail('NPC không tham gia hoạt động này.');
 if(cmd==='tythi'){
  const t=w.tournament;if(t?.phase!=='registration'||now>=t.registrationEndsAt)return fail('Chưa mở tuyển tỷ thí.');if(t.entries.some(e=>e.id===p.id))return {ok:true,duplicate:true};if(t.entries.length>=128)return fail('Danh sách đã đủ.');
  t.entries.push({id:p.id,at:now});markInteraction(w,p);notify(w,p,'Đã đăng ký tỷ thí • tự vào sân khi đến lượt',now,c);return ok();
 }
 if(cmd==='danh'&&tournamentActive(w)){
  tickTournament(w,now,c);const m=w.tournament.current;if(!m||now>=m.endsAt||![m.a,m.b].includes(p.id))return fail('Chưa đến lượt lên đài của đạo hữu.');
  if((m.boosts[p.id]||0)>=3)return {ok:true,duplicate:true};if(now-(m.lastBoost[p.id]||0)<5000)return fail('Trợ lực hồi sau 5 giây.');
  m.lastBoost[p.id]=now;m.boosts[p.id]=(m.boosts[p.id]||0)+1;markInteraction(w,p);notify(w,p,'Tiếp linh lực '+m.boosts[p.id]+'/3',now,c);return ok();
 }
 if(cmd==='ketduyen'){
  if(w.settings.bondEnabled===false)return fail('Kết duyên đang tạm đóng.');const own=bondAllowance(w,p);if(!own.remaining)return fail(own.name+' đã đủ '+own.limit+' đạo lữ.');const matches=resolveTarget(w,rest);
  if(matches.length!==1)return fail(matches.length?'Trùng tên: '+matches.slice(0,3).map(p=>p.name+' #'+p.socialCode).join(' · ')+'. Gõ ketduyen kèm mã đúng người.':'Gõ ketduyen kèm đúng tên hoặc mã đạo hữu.');const other=matches[0];
  if(other.id===p.id||other.resident)return fail('Chọn một đạo hữu khác.');if(alreadyBonded(w,p.id,other.id))return fail('Hai người đã là đạo lữ.');const target=bondAllowance(w,other);if(!target.remaining)return fail(other.name+' đã đủ '+target.limit+' đạo lữ ('+target.name+').');if(!c.active(w,other,now))return fail('Người nhận cần tương tác lại trước khi mời.');
  if(s.invites[other.id]?.expiresAt>now)return fail('Người nhận đang có lời mời chờ.');if(now-(p.lastBondInvite||0)<60000||now-(s.rejections?.[p.id+':'+other.id]||0)<600000)return fail('Hãy chờ trước khi mời lại.');
  if(Object.values(s.invites).some(i=>i.from===p.id&&i.expiresAt>now))return fail('Đạo hữu đang có một lời mời chờ.');
  p.lastBondInvite=now;s.invites[other.id]={from:p.id,to:other.id,createdAt:now,expiresAt:now+120000};markInteraction(w,p);
  notify(w,other,p.name+' mời '+other.name+' kết duyên • '+other.name+' gõ dongy trong 2 phút; bỏ qua để hết hạn',now,c);return ok();
 }
 if(cmd==='dongy'||cmd==='tuchoi'){
  const invite=s.invites[p.id];if(!invite||now>=invite.expiresAt)return fail('Không có lời mời còn hiệu lực.');const other=w.players[invite.from];
  if(cmd==='tuchoi'){delete s.invites[p.id];s.rejections??={};s.rejections[invite.from+':'+p.id]=now;notify(w,p,'Đã từ chối lời mời kết duyên',now,c);return ok();}
  if(w.settings.bondEnabled===false)return fail('Kết duyên đang tạm đóng.');if(!other)return fail('Không tìm thấy người mời.');if(alreadyBonded(w,p.id,other.id))return fail('Hai người đã là đạo lữ.');if(!bondAllowance(w,p).remaining||!bondAllowance(w,other).remaining)return fail('Một người đã đủ hạn mức đạo lữ.');if(s.ceremonies.length>=20)return fail('Tiên đàn đang đầy. Thử đồng ý lại sau ít giây.');
  const id='bond-'+now+'-'+p.socialCode+'-'+(s.nextBondId=(s.nextBondId||0)+1),bond={id,a:other.id,b:p.id,createdAt:now,days:0,lastDay:null,marks:{},level:0};s.bonds[id]=bond;syncBondRefs(w,p);syncBondRefs(w,other);giveItem(p,'bond-jade');giveItem(other,'bond-jade');
  for(const [key,i]of Object.entries(s.invites)){const from=w.players[i.from],to=w.players[i.to];if(key===p.id||!from||!to||alreadyBonded(w,i.from,i.to)||!bondAllowance(w,from).remaining||!bondAllowance(w,to).remaining)delete s.invites[key];}
  s.ceremonies.push({id,a:other.id,b:p.id});festivalEnroll(w,bond,p.id,now,c,{mutual:true});markInteraction(w,p);c.emit(w,p,'Đã kết duyên cùng '+other.name+' • nhận Tam Sinh Ngọc Bội • lễ sẽ đến lượt trình diễn','bond',now);return ok();
 }
 if(cmd==='duyen'){
  const bonds=activeBonds(w,p.id);let selected=bonds.length===1?bonds[0]:null;
  if(rest){const matches=resolveTarget(w,rest);if(matches.length!==1)return fail('Gõ duyên kèm đúng mã đạo hữu.');selected=bonds.find(b=>(b.a===p.id?b.b:b.a)===matches[0].id);if(!selected)return fail('Người này chưa là đạo lữ của đạo hữu.');}
  if(selected){const festivalResult=festivalEnroll(w,selected,p.id,now,c);if(festivalResult)return festivalResult;}
  if(now-(p.socialStatusAt||0)<15000)return fail('Xem duyên lại sau 15 giây.');p.socialStatusAt=now;const allowance=bondAllowance(w,p),names=(selected?[selected]:bonds).map(b=>{const other=w.players[b.a===p.id?b.b:b.a];return other.name+' #'+other.socialCode+' ('+b.days+' ngày)';});
  notify(w,p,allowance.name+' • Đạo lữ '+allowance.used+'/'+allowance.limit+' • '+(names.length?names.join(' · '):'Chưa có đạo lữ • gõ kết duyên kèm tên người muốn mời')+(bonds.length>1?' • gõ duyên kèm mã để chọn một đôi dự lễ':''),now,c);return ok();
 }
 if(cmd==='huyduyen'){
  const bonds=activeBonds(w,p.id);if(!bonds.length)return fail('Chưa có đạo lữ.');const query=norm(rest).replace(/(?:^| )xac nhan$/,'').trim(),confirmed=/(?:^| )xac nhan$/.test(norm(rest));let b;
  if(confirmed){const request=p.endBondRequest;if(!request||now>=request.until)return fail('Gõ hủy duyên kèm mã đạo lữ trước để xác nhận.');b=bonds.find(x=>x.id===request.id);if(!b)return fail('Quan hệ đã kết thúc.');if(query){const matches=resolveTarget(w,query);if(matches.length!==1||(b.a===p.id?b.b:b.a)!==matches[0].id)return fail('Mã xác nhận không khớp đạo lữ đã chọn.');}}
  else{if(query){const matches=resolveTarget(w,query);if(matches.length!==1)return fail('Gõ hủy duyên kèm đúng mã đạo lữ.');b=bonds.find(x=>(x.a===p.id?x.b:x.a)===matches[0].id);}else if(bonds.length===1)b=bonds[0];if(!b)return fail('Chọn đạo lữ cần hủy: '+bonds.map(x=>{const other=w.players[x.a===p.id?x.b:x.a];return other.name+' #'+other.socialCode;}).join(' · '));p.endBondRequest={id:b.id,until:now+30000};p.endBondUntil=now+30000;const other=w.players[b.a===p.id?b.b:b.a];notify(w,p,'Hủy duyên với '+other.name+' • gõ hủy duyên '+other.socialCode+' xác nhận trong 30 giây',now,c);return ok();}
  b.endedAt=now;for(const id of [b.a,b.b])if(w.players[id])syncBondRefs(w,w.players[id]);delete p.endBondRequest;delete p.endBondUntil;s.ceremonies=s.ceremonies.filter(x=>x.id!==b.id);if(s.activeCeremony?.id===b.id)s.activeCeremony=null;notify(w,p,'Đã kết thúc quan hệ đã chọn • giữ nguyên các đạo lữ khác, kỷ vật và thành tích',now,c);return ok();
 }

}
export function bondActivity(w,p,input,now,c){
 if(!['cultivate','gather','attack','checkin','like'].includes(input.type))return;const bonds=activeBonds(w,p.id);if(!bonds.length)return;
 const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 for(const b of bonds){b.marks??={};b.marks[p.id]=day;if(b.lastDay===day||b.marks[b.a]!==day||b.marks[b.b]!==day)continue;
 b.lastDay=day;b.days++;b.level=[3,7,14,30].filter(d=>b.days>=d).length;for(const id of [b.a,b.b]){const ally=w.players[id];if(ally){ally.bondMilestone=Math.max(ally.bondMilestone||0,b.level);c.gain(w,ally,30,10,1,now);notify(w,ally,'Đồng hành ngày '+b.days+' cùng '+w.players[b.a===id?b.b:b.a]?.name+' • +30 tu vi cơ bản, 10 linh thạch'+(b.level?' • mốc kết duyên '+b.level:''),now,c);}}}
}

export function tickSocial(w,now,c){
 tickBondFestival(w,now,c);
 const s=socialState(w);for(const [key,at]of Object.entries(s.rejections||{}))if(now-at>=600000)delete s.rejections[key];for(const [id,i]of Object.entries(s.invites))if(now>=i.expiresAt){delete s.invites[id];notify(w,w.players[id],'Lời mời kết duyên đã hết hạn',now,c);}
 if(s.activeCeremony&&now>=s.activeCeremony.endsAt){s.history.unshift({...s.activeCeremony});s.history=s.history.slice(0,30);s.activeCeremony=null;c.emit(w,null,'Lễ Tam Sinh hoàn tất','bond',now);}
 tickTournament(w,now,c);
 if(!s.activeCeremony&&s.ceremonies.length&&!socialBusy(w,now)&&!existingEvent(w,now)&&now>=(s.visualBusyUntil||0)){
  const ceremony=s.ceremonies.shift();if(s.bonds[ceremony.id]?.endedAt)return;s.activeCeremony={...ceremony,startedAt:now,endsAt:now+(ceremony.festivalId?20000:10000)};c.emit(w,null,w.players[ceremony.a].name+' cùng '+w.players[ceremony.b].name+' • Tam Sinh Ước đã thành','bond',now,{bondCeremony:true,pair:[ceremony.a,ceremony.b]});
 }
}
export function socialView(w,now){
 const s=socialState(w),t=w.tournament;const invites=Object.values(s.invites).filter(i=>now<i.expiresAt).map(i=>({...i,fromName:w.players[i.from]?.name,toName:w.players[i.to]?.name}));
 return {festival:festivalView(w,now),bondEnabled:w.settings.bondEnabled!==false,invites,bonds:Object.values(s.bonds).filter(b=>!b.endedAt&&b.a!==b.b&&w.players[b.a]&&w.players[b.b]).map(b=>({id:b.id,a:b.a,b:b.b,aName:w.players[b.a]?.name,bName:w.players[b.b]?.name,days:b.days,level:b.level})),queuedCeremonies:s.ceremonies.length,ceremony:s.activeCeremony,tournament:t||null};
}
