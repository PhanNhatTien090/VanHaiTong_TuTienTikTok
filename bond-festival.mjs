import {stageConflict} from './stage-lock.mjs';
export const FESTIVAL_ITEM={id:'festival-lotus-jade',type:'artifact',name:'Liên Tâm Song Ngọc',icon:'orb',tier:0,price:0,herbs:0,damage:0,bonus:0,exclusive:true,eventReward:'Lễ hội kết duyên · hai người đồng ý',description:'Kỷ vật lễ hội và hào quang đôi; không cộng sát thương.'};
export const festivalActive=(w,now)=>w.bondFestival&&!w.bondFestival.closedAt&&now>=w.bondFestival.startedAt&&now<w.bondFestival.endsAt;
export function startBondFestival(w,now,c){const conflict=stageConflict(w,now);if(conflict)return {ok:false,message:'Đang có '+conflict+' • chờ kết thúc và trao thưởng.'};if(festivalActive(w,now))return {ok:false,message:'Lễ hội kết duyên đang mở.'};if(w.settings.bondEnabled===false)return {ok:false,message:'Bật kết duyên trước khi mở lễ hội.'};w.bondFestival={id:'bond-festival-'+now,startedAt:now,endsAt:now+300000,pairs:{},claimedPlayers:{},marks:{},blessings:0,blessingAt:{},goal:900,heartVersion:1};c.emit(w,null,'NGUYỆT HẠ KẾT DUYÊN • 5 phút • ketduyen tên → người nhận gõ dongy • đã có đôi: cả hai gõ duyen • thả tim chúc phúc','bond',now);return {ok:true};}
function blessPair(w,f,entry,now,c){if(entry.bonus||f.blessings<f.goal)return;entry.bonus=true;for(const id of [entry.a,entry.b]){const p=w.players[id];if(p)c.gain(w,p,100,50,0);}c.emit(w,null,entry.aName+' và '+entry.bName+' nhận phúc chung • +100 tu vi cơ bản, 50 linh thạch mỗi người','bond',now);}
export function festivalEnroll(w,b,who,now,c,{mutual=false}={}){if(!festivalActive(w,now)||!b||b.endedAt)return null;const f=w.bondFestival;if(f.pairs[b.id])return {ok:true,duplicate:true};if(Object.keys(f.pairs).length>=200)return {ok:false,message:'Lễ hội đã đủ 200 cặp.'};if([b.a,b.b].some(id=>f.claimedPlayers[id]))return {ok:false,message:'Mỗi người nhận quà một lần trong lễ hội.'};if(!w.players[b.a]||!w.players[b.b])return {ok:false,message:'Không tìm thấy đôi đạo hữu.'};
 const marks=f.marks[b.id]??={};marks[who]=now;if(mutual){marks[b.a]=now;marks[b.b]=now;}if(!marks[b.a]||!marks[b.b]){c.emit(w,w.players[who],'Đã đăng ký lễ hội • chờ đạo lữ cũng gõ duyen','social',now);return {ok:true,pending:true};}
 const entry={a:b.a,b:b.b,aName:w.players[b.a].name,bName:w.players[b.b].name,at:now,bonus:false};f.pairs[b.id]=entry;for(const id of [b.a,b.b]){const p=w.players[id];f.claimedPlayers[id]=true;p.artifacts??=[];if(!p.artifacts.includes(FESTIVAL_ITEM.id))p.artifacts.push(FESTIVAL_ITEM.id);p.bondFestivalWins=(p.bondFestivalWins||0)+1;c.gain(w,p,80,30,0);}
 const s=w.social,queued=s.ceremonies.find(x=>x.id===b.id);if(queued)queued.festivalId=f.id;else if(s.activeCeremony?.id!==b.id&&s.ceremonies.length<20)s.ceremonies.push({id:b.id,a:b.a,b:b.b,festivalId:f.id});
 c.emit(w,null,entry.aName+' ♥ '+entry.bName+' • nhận Liên Tâm Song Ngọc, 80 tu vi cơ bản và 30 linh thạch mỗi người','bond',now);blessPair(w,f,entry,now,c);return {ok:true};}
export function festivalActivity(w,p,input,now,c){
 const practice=w.mode==='live'&&w.settings?.engagementRewards!==true&&w.settings?.heartPlay===false; // 4/11: heartPlay → tim chấm điểm
 if(!festivalActive(w,now)||p.resident||p.puppet||!(practice?['cultivate','gather','attack'].includes(input.type):input.type==='like'))return;
 const f=w.bondFestival;
 if(!f.heartVersion){f.blessings=Math.floor(Math.min(1,(f.blessings||0)/(f.goal||30))*900);f.goal=900;f.heartVersion=1;}
 const before=f.blessings;if(before>=f.goal)return;
 f.blessings=Math.min(f.goal,before+(practice?30:input.count));
 const lamps=Math.floor(f.blessings/300),previous=Math.floor(before/300);
 if(lamps>previous)c.emit(w,null,`CHÚC PHÚC ${lamps}/3 ĐÈN • ${f.blessings}/${f.goal} ${practice?'điểm tu luyện':'tim'}`,'bond',now,{heartLamp:lamps});
 if(f.blessings>=f.goal){c.emit(w,null,`Đủ ${f.goal} ${practice?'điểm tu luyện':'tim'} chúc phúc • mở quà chung cho các cặp lễ hội`,'bond',now);for(const entry of Object.values(f.pairs))blessPair(w,f,entry,now,c);}
}
export function tickBondFestival(w,now,c){const f=w.bondFestival;if(f&&!f.closedAt&&now>=f.endsAt){f.closedAt=now;f.marks={};f.blessingAt={};c.emit(w,null,'Nguyệt Hạ Kết Duyên khép lại • '+Object.keys(f.pairs).length+' cặp nhận kỷ vật • quan hệ và quà đã nhận được giữ lại','bond',now);}}
export function stopBondFestival(w,now,c){if(!festivalActive(w,now))return {ok:false,message:'Chưa có lễ hội đang mở.'};w.bondFestival.endsAt=now;tickBondFestival(w,now,c);return {ok:true};}
export function festivalView(w,now){const f=w.bondFestival;if(!f)return null;return {id:f.id,active:!!festivalActive(w,now),endsAt:f.endsAt,blessings:f.blessings,goal:f.goal,pairs:Object.values(f.pairs).map(p=>({a:p.a,b:p.b,aName:p.aName,bName:p.bName,bonus:p.bonus}))};}
