// Khai Lò Cửu Chuyển (08/11/2026) — cả tông luyện chung một lò đan.
// Luật lõi: tim là quạt lửa; phải giữ nhiệt trong VÙNG VÀNG (không phải càng nhiều càng tốt). Quá nóng giữ lâu → NỔ LÒ.
// Quà: 1–4 coin = Băng Tâm Thủy (dập lửa, cứu lò) · 5–98 = Linh dược (+phẩm, kéo lửa về vùng vàng) · ≥99 = Tiên Hỏa Hộ Lô (khóa lửa 10 s, +phẩm).
// Chat: lúc chọn dược liệu gõ 1 / 2; chuột tinh trộm dược gõ bat. Giọng đọc chỉ ở mốc lớn — còn lại để hình tự nói.
// Phòng đông: mỗi người góp lửa có trần theo cửa sổ 5 s; lửa mỗi tim chia theo số người đang quạt (mũ 0,85).
// 08/11 (sau LIVE): chống tự thả tim chỉ cho ~2 tim/giây/người vào sự kiện → 2 tim = 1 đơn vị lửa (trước là 10, 6 người tap mãi lửa không lên).
import {stageConflict} from './stage-lock.mjs';
export const ALC=Object.freeze({openMs:12000,roundMs:32000,rounds:3,tribMs:12000,podiumMs:16000,sootMs:60000,
 heartsPerUnit:2,heartCapUnits:5,heartWindowMs:5000,heatPerUnit:6,crowdExp:.85,overHeat:96,heaterWindowMs:15000,
 decay:[2,2.5,3],startHeat:30,dangerHeat:88,explodeHoldMs:2500,
 roseMaxCoins:4,roseCool:12,roseCoolMax:45,herbMaxCoins:98,herbPoints:5,herbRoundCap:20,fireLockMs:10000,firePoints:10,
 quizAt:4000,quizMs:11000,quizRight:8,quizWrong:-4,quizShift:8,incidentAt:17000,incidentMs:9000,
 pointsFor9:90,tribGrade:7,tribStrikeEvery:3000,tribStrike:24,tribStart:60,
 reward:{pct:.008,stones:10,stonesPerGrade:2,top:[.5,.3,.2],consolationStones:8},titleMs:{master:24*3600000,fun:3600000}});
// Mỗi chuyển: tâm vùng vàng, nửa bề rộng, biên độ trôi, chu kỳ trôi (ms).
const ROUND_ZONES=[[{c:50,half:12,amp:0,period:1},{c:55,half:11,amp:8,period:16000},{c:60,half:9,amp:14,period:11000}],
 [{c:45,half:12,amp:6,period:20000},{c:62,half:10,amp:10,period:14000},{c:52,half:8,amp:18,period:9000}],
 [{c:58,half:12,amp:0,period:1},{c:48,half:10,amp:12,period:15000},{c:64,half:8,amp:12,period:10000}]];
export const INCIDENTS=Object.freeze({rage:{name:'ĐAN LINH NỔI GIẬN',hint:'lửa tự bùng',icon:'🔥'},wind:{name:'ÂM PHONG THỔI TỚI',hint:'lửa nguội nhanh',icon:'🌬'},
 rat:{name:'CHUỘT TINH TRỘM DƯỢC',hint:'gõ bat để đuổi',icon:'🐀'},wide:{name:'THIÊN ĐỊA LINH KHÍ',hint:'vùng vàng nới rộng',icon:'✨'},jump:{name:'LÒ RUNG CHUYỂN',hint:'vùng vàng đổi chỗ',icon:'💥'}});
const HOT=['Hỏa Linh Chi','Xích Viêm Thảo','Liệt Dương Hoa','Long Huyết Đằng','Kim Ô Quả'],COLD=['Băng Tâm Liên','Hàn Ngọc Thảo','Tuyết Liên Hoa','Nguyệt Lộ Thảo','Huyền Băng Quả'];
const LORE=[['Đan lô cần lửa thế nào?','Giữ vừa phải','Càng to càng tốt',0],['Luyện đan sợ nhất điều gì?','Nổ lò','Đan thơm quá',0],['Cửu Chuyển Kim Đan luyện mấy chuyển?','Chín chuyển','Một chuyển',0],
 ['Lửa luyện đan quý nhất?','Tiên hỏa','Lửa bếp',0],['Đan dược phẩm cao nhất?','Cửu phẩm','Nhất phẩm',0],['Đan thành thì trời giáng gì?','Đan kiếp','Mưa đá',0],['Thêm dược liệu lúc nào?','Lửa ổn định','Lúc nổ lò',0]];
export const GRADE_NAMES=['','NHẤT PHẨM','NHỊ PHẨM','TAM PHẨM','TỨ PHẨM','NGŨ PHẨM','LỤC PHẨM','THẤT PHẨM','BÁT PHẨM','CỬU PHẨM'];
const real=p=>p&&!p.resident&&!p.puppet;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const pick=(list,r=Math.random())=>list[Math.floor(r*list.length)%list.length];
export const alchemyActive=w=>['queued','opening','brewing','tribulation'].includes(w.alchemy?.phase);
export const alchemyVisible=(w,now)=>['opening','brewing','tribulation'].includes(w.alchemy?.phase)||w.alchemy?.podiumUntil>now;
const announce=(w,p,text,now,c,extra={})=>c.emit(w,p,text,'alchemy',now,{alchemy:true,...extra});
function fx(e,now,row){e.fx??=[];e.fx.push({id:e.id+':'+(e.fxSeq=(e.fxSeq||0)+1),at:now,...row});if(e.fx.length>20)e.fx.splice(0,e.fx.length-20);}
// Vùng vàng tại thời điểm now (frontend dùng cùng công thức từ e.zone).
export function zoneAt(e,now){const z=e.zone;if(!z)return {lo:40,hi:60,c:50};let c=z.c+(z.amp?z.amp*Math.sin((now-z.at)/z.period*Math.PI*2):0)+(z.shift||0);let half=z.half*(z.wideUntil>now?2:1);c=clamp(c,half+4,96-half);return {lo:c-half,hi:c+half,c};}
export function gradeOf(points){return clamp(Math.ceil(Math.max(0,points)/ALC.pointsFor9*9),1,9);}
function open(w,now,c){
 const order=['rage','wind','rat','wide','jump'].sort(()=>Math.random()-.5),zoneSet=pick(ROUND_ZONES);
 w.alchemy={id:'alc-'+now,phase:'opening',startedAt:now,openEndsAt:now+ALC.openMs,heat:ALC.startHeat,points:0,round:0,members:{},heaters:{},fx:[],zoneSet,
  incidents:[Math.random()<.5?'wide':null,order[0]==='wide'?order[1]:order[0],order[2]==='wide'?order[3]:order[2]],simAt:now,overSince:0,lockUntil:0,herbRound:0,variant:Math.floor(Math.random()*4)};
 announce(w,null,'KHAI LÒ CỬU CHUYỂN • thả tim giữ lửa trong vùng vàng • hoa hồng dập lửa cứu lò',now,c,{alchemyStart:true});
}
export function startAlchemy(w,now,c){if(alchemyActive(w))return {ok:false,message:'Lò đan đang mở.'};
 if(stageConflict(w,now)){w.alchemy={id:'alc-q'+now,phase:'queued'};return {ok:true,queued:true};}
 open(w,now,c);return {ok:true};}
export function stopAlchemy(w,now){const e=w.alchemy;if(!e||!alchemyActive(w))return {ok:false,message:'Không có lò đan đang mở.'};e.phase='cancelled';e.podiumUntil=0;return {ok:true};}
function member(e,p,now){return e.members[p.id]??={name:p.name,at:now,score:0,hearts:0,heartWindow:0,heartUnits:0,cool:0,gift:0};}
// Số người quạt: max(người vừa thả tim 15 s — tính cả lúc khai lò, 15% số người đang có mặt) → phòng đông mỗi tim nhẹ đi, nhưng vài người vẫn giữ được lửa.
const heaterCount=(e,now)=>{let n=0;for(const at of Object.values(e.heaters))if(now-at<ALC.heaterWindowMs)n++;return Math.max(1,n,Math.round((e.crowd||0)*.15));};
function countCrowd(w,e,now,c){if(now-(e.crowdAt||0)<5000&&e.crowd!=null)return;e.crowdAt=now;let n=0;for(const p of Object.values(w.players))if(real(p)&&(c.active?c.active(w,p,now):now-(p.lastActive||0)<120000))n++;e.crowd=n;}
function startRound(e,now){
 e.round++;e.phase='brewing';e.roundStartedAt=now;e.roundEndsAt=now+ALC.roundMs;e.herbRound=0;
 const z=e.zoneSet[e.round-1];e.zone={...z,at:now,shift:0,wideUntil:0};
 e.quiz={startsAt:now+ALC.quizAt,endsAt:now+ALC.quizAt+ALC.quizMs,votes:{},resolved:false,...makeQuiz(e)};
 const kind=e.incidents[e.round-1];e.incident=kind?{kind,startsAt:now+ALC.incidentAt,endsAt:now+ALC.incidentAt+ALC.incidentMs,started:false,chasers:{}}:null;
 fx(e,now,{kind:'round',round:e.round});
}
// Câu chọn dược liệu: một nửa là câu "đọc lửa" (đúng tùy nhiệt hiện tại) → dạy luật bằng chơi.
function makeQuiz(e){
 if(Math.random()<.55){const hot=pick(HOT),cold=pick(COLD),swap=Math.random()<.5;return {type:'heat',q:'Lửa đang thế nào? Chọn dược liệu hợp',options:swap?[cold,hot]:[hot,cold],hotIndex:swap?1:0};}
 const [q,a,b]=pick(LORE),swap=Math.random()<.5;return {type:'lore',q,options:swap?[b,a]:[a,b],answer:swap?1:0};
}
function resolveQuiz(e,now){
 const z=e.quiz;if(!z||z.resolved||now<z.endsAt)return;z.resolved=true;const tally=[0,0];for(const v of Object.values(z.votes))tally[v]++;z.tally=tally;
 if(!tally[0]&&!tally[1]){z.result='none';return;}if(tally[0]===tally[1]){z.result='tie';return;}
 const chosen=tally[0]>tally[1]?0:1,zone=zoneAt(e,now);let right;
 if(z.type==='heat'){const wantHot=e.heat<zone.c;right=(chosen===z.hotIndex)===wantHot;e.heat=clamp(e.heat+(chosen===z.hotIndex?ALC.quizShift:-ALC.quizShift),0,100);}else right=chosen===z.answer;
 z.result=right?'right':'wrong';z.chosen=chosen;e.points=Math.max(0,e.points+(right?ALC.quizRight:ALC.quizWrong));
 for(const [id,v] of Object.entries(z.votes))if(v===chosen&&right&&e.members[id])e.members[id].score+=2;
 fx(e,now,{kind:'quiz',right,option:z.options[chosen]});
}
function tickIncident(e,now){
 const i=e.incident;if(!i)return;
 if(!i.started&&now>=i.startsAt){i.started=true;fx(e,now,{kind:'incident',incident:i.kind});
  if(i.kind==='wide')e.zone.wideUntil=i.endsAt;if(i.kind==='jump'){const z=zoneAt(e,now);e.zone.shift+=(z.c>50?-1:1)*(18+Math.random()*10);}
  if(i.kind==='rat')i.need=clamp(Math.ceil(heaterCount(e,now)/5),2,6);}
 if(i.started&&!i.done&&now>=i.endsAt){i.done=true;if(i.kind==='rat'){const ok=Object.keys(i.chasers).length>=i.need;i.result=ok?'chased':'stolen';e.points=Math.max(0,e.points+(ok?4:-8));fx(e,now,{kind:'rat-end',ok});}}
}
function simulate(e,now){
 const dt=Math.min(2000,Math.max(0,now-(e.simAt||now)))/1000;e.simAt=now;if(e.phase!=='brewing'||!dt)return;
 const zone=zoneAt(e,now),i=e.incident,live=i?.started&&!i.done;
 if(e.lockUntil>now){e.heat+=(zone.c-e.heat)*Math.min(1,dt*2);}
 else{let d=ALC.decay[e.round-1]||3;if(live&&i.kind==='wind')d+=3;e.heat-=d*dt;if(live&&i.kind==='rage')e.heat+=5.5*dt;}
 e.heat=clamp(e.heat,0,100);
 if(e.heat>=zone.lo&&e.heat<=zone.hi)e.points+=dt;else if(Math.abs(e.heat-zone.c)>zone.hi-zone.c+15)e.points=Math.max(0,e.points-dt*.25);
 if(e.heat>=ALC.overHeat){if(!e.overSince)e.overSince=now;}else e.overSince=0;
}
function explode(w,e,now,c){
 e.phase='finished';e.finishedAt=now;e.podiumUntil=now+ALC.podiumMs;e.sootUntil=now+ALC.sootMs;e.sootIds=Object.keys(e.members).slice(0,400);
 const culprit=e.lastOverId&&w.players[e.lastOverId]?e.lastOverId:null,savior=topBy(e,'cool');
 e.result={exploded:true,grade:0,culprit:culprit?{id:culprit,name:w.players[culprit].name}:null,savior:savior?{id:savior.id,name:savior.name}:null};
 fx(e,now,{kind:'explode'});
 for(const [id,m] of Object.entries(e.members)){const p=w.players[id];if(!real(p)||m.score<=0)continue;p.stones=(p.stones||0)+ALC.reward.consolationStones;p.pills??={};p.pills['qi-pill']=(p.pills['qi-pill']||0)+1;}
 if(culprit)w.players[culprit].funTitle={name:'Đan Tặc • Kẻ Nổ Lò',until:now+ALC.titleMs.fun};
 if(savior&&w.players[savior.id])w.players[savior.id].funTitle={name:'Băng Tâm Cứu Lô',until:now+ALC.titleMs.fun};
 announce(w,null,'NỔ LÒ • khói đen phủ tông môn • ai góp sức vẫn nhận bã đan',now,c,{alchemyExplode:true,alchemyCulprit:e.result.culprit?.name||null});
 w.nextBossAt=Math.max(w.nextBossAt||0,now+(w.settings?.bossInterval??240)*1000);
}
function topBy(e,key){let best=null;for(const [id,m] of Object.entries(e.members))if((m[key]||0)>0&&(!best||m[key]>best[key]))best={id,name:m.name,[key]:m[key]};return best;}
export function alchemyTop(e,n=5){return Object.entries(e?.members||{}).filter(([,m])=>m.score>0).sort((a,b)=>b[1].score-a[1].score||a[1].at-b[1].at).slice(0,n).map(([id,m])=>({id,name:m.name,score:Math.round(m.score)}));}
function finish(w,e,now,c){
 const grade=e.tribResult==='cracked'?Math.max(1,e.grade-2):e.grade;e.phase='finished';e.finishedAt=now;e.podiumUntil=now+ALC.podiumMs;
 e.result={exploded:false,grade,trib:e.tribResult||null,rewards:[]};award(w,e,grade,now,c);fx(e,now,{kind:'done',grade});
 const top=e.result.top?.[0];announce(w,null,'ĐAN THÀNH • '+GRADE_NAMES[grade]+' • cả tông nhận đan dược',now,c,{alchemyEnd:grade,alchemyMaster:top?.name||null,alchemyTrib:e.tribResult||null});
 w.nextBossAt=Math.max(w.nextBossAt||0,now+(w.settings?.bossInterval??240)*1000);
}
function award(w,e,grade,now,c){
 if(e.awarded)return;e.awarded=true;const R=ALC.reward,got={};
 for(const [id,m] of Object.entries(e.members)){const p=w.players[id];if(!real(p)||m.score<=0)continue;
  const base=Math.max(10,Math.round((c.requiredQi?.(p)||300)*R.pct*grade));const qi=c.gain(w,p,base,R.stones+R.stonesPerGrade*grade,0,now);got[id]={qi,base};
  p.pills??={};const pill=grade>=4?'spirit-pill':'qi-pill';p.pills[pill]=(p.pills[pill]||0)+(grade>=7?2:1);}
 e.result.perPerson={pct:Math.round(R.pct*grade*1000)/10,pill:grade>=4?'Ngưng Thần Đan':'Tụ Khí Đan',count:grade>=7?2:1};
 e.result.top=alchemyTop(e,3).map((t,i)=>{const p=w.players[t.id];let extra=0;if(real(p)&&got[t.id])extra=c.gain(w,p,Math.round(got[t.id].base*R.top[i]),0,0,now);if(i===0&&real(p))p.alchemyTitle={name:'Đan Sư Tông Môn',until:now+ALC.titleMs.master};return {...t,qi:(got[t.id]?.qi||0)+(extra||0),title:i===0?'Đan Sư Tông Môn':null};});
 const savior=topBy(e,'cool');if(savior&&savior.cool>=ALC.roseCool&&w.players[savior.id]){w.players[savior.id].funTitle={name:'Băng Tâm Cứu Lô',until:now+ALC.titleMs.fun};e.result.savior={id:savior.id,name:savior.name};}
}
function startTrib(e,now){e.phase='tribulation';e.tribStartedAt=now;e.tribEndsAt=now+ALC.tribMs;e.shield=ALC.tribStart;e.nextStrikeAt=now+1500;fx(e,now,{kind:'trib'});}
export function tickAlchemy(w,now,c){
 const e=w.alchemy;if(!e)return;
 if(e.phase==='queued'){if(!stageConflict(w,now))open(w,now,c);return;}
 if(['opening','brewing','tribulation'].includes(e.phase))countCrowd(w,e,now,c);
 if(e.phase==='opening'){if(now>=e.openEndsAt){startRound(e,now);e.simAt=now;}return;}
 if(e.phase==='brewing'){
  simulate(e,now);resolveQuiz(e,now);tickIncident(e,now);
  if(e.overSince&&now-e.overSince>=ALC.explodeHoldMs){explode(w,e,now,c);return;}
  if(now>=e.roundEndsAt){resolveQuiz(e,e.quiz?.endsAt||now);if(e.round>=ALC.rounds){e.grade=gradeOf(e.points);if(e.grade>=ALC.tribGrade){startTrib(e,now);announce(w,null,'ĐAN KIẾP GIÁNG • thả tim giữ đan',now,c,{alchemyTribStart:true});}else finish(w,e,now,c);}else startRound(e,now);}
  return;}
 if(e.phase==='tribulation'){
  e.shield=Math.max(0,e.shield-dtSince(e,now)*2);
  if(now>=e.nextStrikeAt){e.nextStrikeAt=now+ALC.tribStrikeEvery;e.shield=Math.max(0,e.shield-ALC.tribStrike);fx(e,now,{kind:'strike'});}
  if(e.shield<=0){e.tribResult='cracked';finish(w,e,now,c);return;}
  if(now>=e.tribEndsAt){e.tribResult='held';finish(w,e,now,c);}
 }
}
function dtSince(e,now){const dt=Math.min(2000,Math.max(0,now-(e.simAt||now)))/1000;e.simAt=now;return dt;}
// Tim: góp lửa (lúc luyện) hoặc góp kết giới (lúc đan kiếp). Điểm cá nhân chỉ tính khi tim thật sự giúp lò.
export function alchemyHearts(w,p,count,now,c){
 const e=w.alchemy;if(!e||!['opening','brewing','tribulation'].includes(e.phase)||!real(p)||count<=0)return 0;
 const m=member(e,p,now);if(now-m.heartWindow>=ALC.heartWindowMs){m.heartWindow=now;m.heartUnits=0;}
 m.hearts+=count;const units=Math.min(ALC.heartCapUnits-m.heartUnits,Math.floor(m.hearts/ALC.heartsPerUnit));if(units<=0)return 0;
 m.hearts-=units*ALC.heartsPerUnit;m.heartUnits+=units;m.lastActAt=now;e.heaters[p.id]=now;
 if(e.phase==='opening'){m.score+=units*.5;return 0;}
 const n=heaterCount(e,now),per=ALC.heatPerUnit/n**ALC.crowdExp;
 if(e.phase==='tribulation'){e.shield=Math.min(100,e.shield+units*per*1.2);m.score+=units;return units;}
 simulate(e,now);const zone=zoneAt(e,now),before=e.heat;
 if(e.lockUntil>now){m.score+=units*.5;return 0;}
 e.heat=clamp(e.heat+units*per,0,100);
 m.score+=before<zone.hi?units:units*.15;
 if(e.heat>=ALC.overHeat){e.lastOverId=p.id;if(!e.overSince)e.overSince=now;}
 return e.heat-before;
}
// Quà: Băng Tâm Thủy / Linh dược / Tiên Hỏa theo giá trị một lượt tặng.
export function alchemyGift(w,p,coins,now,c){
 const e=w.alchemy;if(!e||!['opening','brewing','tribulation'].includes(e.phase)||!real(p)||!(coins>0))return null;
 const m=member(e,p,now);m.gift+=coins;m.score+=coins*3;m.lastActAt=now;m.lastGiftAt=now;
 if(e.phase==='opening'){fx(e,now,{kind:'herb',user:p.id,name:p.name,value:coins});return {role:'herb'};}
 if(e.phase==='tribulation'){e.shield=Math.min(100,e.shield+Math.min(60,15*coins**.5));fx(e,now,{kind:'shield',user:p.id,name:p.name,value:coins});return {role:'shield'};}
 simulate(e,now);const zone=zoneAt(e,now);
 if(coins<=ALC.roseMaxCoins){const cool=Math.min(ALC.roseCoolMax,ALC.roseCool*coins**.6),before=e.heat;e.heat=clamp(e.heat-cool,0,100);m.cool+=before-e.heat;if(e.heat<ALC.overHeat)e.overSince=0;
  fx(e,now,{kind:'rose',user:p.id,name:p.name,value:coins,saved:before>=ALC.dangerHeat});return {role:'rose',cooled:before-e.heat};}
 if(coins<=ALC.herbMaxCoins){const add=Math.min(Math.max(0,ALC.herbRoundCap-e.herbRound),ALC.herbPoints+Math.floor(coins/20)*2);e.herbRound+=add;e.points+=add;e.heat+=(zone.c-e.heat)*.5;e.overSince=0;
  fx(e,now,{kind:'herb',user:p.id,name:p.name,value:coins,points:add});return {role:'herb',points:add};}
 e.lockUntil=Math.max(e.lockUntil,now)+ALC.fireLockMs;e.heat=zone.c;e.overSince=0;e.points+=ALC.firePoints;
 fx(e,now,{kind:'fire',user:p.id,name:p.name,value:coins});return {role:'fire'};
}
// Lệnh chat trong lúc luyện: 1 / 2 (chọn dược liệu), bat (đuổi chuột tinh). Trả undefined nếu không phải lệnh của lò.
export function alchemyCommand(w,p,cmd,now){
 const e=w.alchemy;if(!e||e.phase!=='brewing'||!real(p))return;
 const z=e.quiz;if((cmd==='1'||cmd==='2')&&z&&!z.resolved&&now>=z.startsAt&&now<z.endsAt){if(z.votes[p.id]!=null)return {ok:true,duplicate:true};z.votes[p.id]=cmd==='1'?0:1;member(e,p,now).score+=1;e.heaters[p.id]??=0;return {ok:true,alchemy:true};}
 const i=e.incident;if(cmd==='bat'&&i?.kind==='rat'&&i.started&&!i.done){if(!i.chasers[p.id]){i.chasers[p.id]=now;member(e,p,now).score+=2;}if(Object.keys(i.chasers).length>=i.need&&!i.result){i.done=true;i.result='chased';e.points+=4;fx(e,now,{kind:'rat-end',ok:true});}return {ok:true,alchemy:true};}
}
// Ai đứng quanh lò: tối đa 12 (top góp, người vừa tặng quà, luân phiên).
export function alchemyStageIds(w,now){
 const e=w.alchemy;if(!e||!alchemyVisible(w,now))return [];const out=[],add=id=>{if(id&&!out.includes(id)&&w.players[id]&&out.length<12)out.push(id);};
 const rows=Object.entries(e.members);alchemyTop(e,2).forEach(t=>add(t.id));rows.filter(([,m])=>now-(m.lastGiftAt||0)<8000).forEach(([id])=>add(id));alchemyTop(e,6).forEach(t=>add(t.id));
 const recent=rows.filter(([,m])=>now-(m.lastActAt||0)<20000);const start=recent.length?Math.floor(now/5000)*4%recent.length:0;for(let i=0;i<recent.length&&out.length<12;i++)add(recent[(start+i)%recent.length][0]);
 return out;
}
export function alchemyView(w,now){
 const e=w.alchemy;if(e?.phase==='queued')return {id:e.id,phase:'queued',active:false};
 if(!e||e.phase==='cancelled'){const s=e?.sootUntil>now?{sootUntil:e.sootUntil,sootIds:e.sootIds}:null;return s?{active:false,...s}:null;}
 const z=e.quiz,i=e.incident,zone=e.zone?{...e.zone,...zoneAt(e,now)}:null;
 return {id:e.id,phase:e.phase,active:alchemyVisible(w,now),variant:e.variant,heat:Math.round(e.heat*10)/10,points:Math.round(e.points*10)/10,grade:e.phase==='finished'?e.result?.grade:gradeOf(e.points),round:e.round,rounds:ALC.rounds,
  openEndsAt:e.openEndsAt,roundStartedAt:e.roundStartedAt,roundEndsAt:e.roundEndsAt,zone,lockUntil:e.lockUntil,overSince:e.overSince,decay:ALC.decay[(e.round||1)-1],danger:ALC.dangerHeat,
  quiz:z&&now>=z.startsAt-1500&&now<z.endsAt+4000?{q:z.q,options:z.options,startsAt:z.startsAt,endsAt:z.endsAt,tally:z.tally||(()=>{const t=[0,0];for(const v of Object.values(z.votes))t[v]++;return t;})(),result:z.result||null,chosen:z.chosen??null}:null,
  incident:i&&i.started&&now<i.endsAt+3000?{kind:i.kind,...INCIDENTS[i.kind],endsAt:i.endsAt,need:i.need||0,have:Object.keys(i.chasers||{}).length,result:i.result||null}:null,
  shield:e.phase==='tribulation'?Math.round(e.shield):null,tribEndsAt:e.tribEndsAt,count:Object.keys(e.members).length,top:alchemyTop(e,5),
  fx:(e.fx||[]).filter(x=>now-x.at<8000),result:e.result||null,finishedAt:e.finishedAt,podiumUntil:e.podiumUntil,sootUntil:e.sootUntil||0,sootIds:e.sootUntil>now?e.sootIds:undefined};
}
