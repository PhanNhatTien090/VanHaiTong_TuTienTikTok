// v87: Đợt 2 giữ chân người xem — Hồng bao rơi · Câu đố tu tiên · Chuỗi điểm danh + Nhiệm vụ ngày · Tông môn kiến tạo.
// Ngữ cảnh c = {emit, gain, active, requiredQi, giveArtifact, itemName, busy}. Phần thưởng là vật phẩm trong trò chơi.
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const vnDay=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
// 4/11/2026: lì xì/câu đố giờ 1–2 phút một lần → với Chân Tiên trở lên (realm ≥ 8) chỉ thưởng 40% để không thành nguồn lên cấp nhanh.
const pct=(c,p,f)=>Math.max(10,Math.round(c.requiredQi(p)*f*((p.realm||0)>=8?.4:1)));
const buff=(p,m,ms,now)=>{p.buffMult=Math.max(m,p.buffUntil>now?p.buffMult||1:1);p.buffUntil=Math.max(p.buffUntil||0,now+ms);};

// ---------- HỒNG BAO ----------
export const ENVELOPE_MS=20000;
const ENVELOPE_ITEMS=['spirit-vase','jade','visitor-jade-vase','bell','soul-bell'];
function startEnvelope(w,now,c){w.envelope={id:'env-'+now,startedAt:now,endsAt:now+ENVELOPE_MS,claimed:{},lucky:[]};
  c.emit(w,null,'HỒNG BAO RƠI • gõ nhan trong 20 giây','envelope',now,{envelopeStart:true});}
function claimEnvelope(w,p,now,c){const e=w.envelope;if(!e||now>=e.endsAt)return null;if(e.claimed[p.id])return {ok:true,duplicate:true};
  const roll=Math.random();let reward;
  if(roll<.06){const id=rnd(ENVELOPE_ITEMS);const fresh=c.giveArtifact(w,p,id);reward=fresh?{item:c.itemName(id)}:{qi:c.gain(w,p,pct(c,p,.15),40,4)};}
  else if(roll<.35)reward={qi:c.gain(w,p,0,30+Math.floor(Math.random()*90),2),stones:true};
  else reward={qi:c.gain(w,p,pct(c,p,.05+Math.random()*.1),10,1)};
  e.claimed[p.id]=reward;p.interactions++;w.totalInteractions++;
  if(reward.item){e.lucky.push(p.name);c.emit(w,p,'Hồng bao • trúng '+reward.item,'envelope',now,{envelopeLucky:reward.item});}
  return {ok:true,envelope:reward};}
function closeEnvelope(w,now,c){const e=w.envelope;if(!e||e.closedAt||now<e.endsAt)return;e.closedAt=now;const n=Object.keys(e.claimed).length;
  c.emit(w,null,`Hồng bao khép lại • ${n} đạo hữu nhận lộc`,'envelope',now,{envelopeEnd:true,count:n,lucky:e.lucky.slice(0,3)});}

// ---------- CÂU ĐỐ ----------
// 4/11/2026: CÂU ĐỐ MẸO — không hiện đáp án a/b/c; người xem gõ câu trả lời vào chat. Chấm bằng chữ không dấu,
// nhận nhiều cách nói (a: danh sách đáp án chấp nhận), hết giờ mới công bố đáp án (show). Trả lời đúng không hiện bong bóng → không lộ đáp án.
export const QUIZ_MS=45000;
export const QUIZ_BANK=Object.freeze([
 {q:'Cái gì càng cất càng thấy?',show:'Căn nhà',a:['can nha','cai nha','ngoi nha','nha','nha cua']},
 {q:'Con gì càng to càng nhỏ?',show:'Con cua',a:['con cua','cua']},
 {q:'Con gì đập thì sống, không đập thì chết?',show:'Trái tim',a:['trai tim','con tim','tim','qua tim']},
 {q:'Con gì đầu dê mình ốc?',show:'Con dốc',a:['con doc','doc']},
 {q:'Cái gì luôn đi mà không bao giờ đến?',show:'Ngày mai',a:['ngay mai']},
 {q:'Cái gì của bạn nhưng người khác dùng nhiều hơn bạn?',show:'Cái tên',a:['cai ten','ten','ten cua minh','ten minh']},
 {q:'Cái gì có cổ mà không có đầu?',show:'Cái áo (hoặc cái chai)',a:['cai ao','ao','chai','cai chai','ao so mi']},
 {q:'Tháng nào có 28 ngày?',show:'Tháng nào cũng có',a:['tat ca','thang nao cung co','ca 12 thang','12 thang','moi thang','thang nao cung','ca nam']},
 {q:'Cái gì có răng mà không cắn?',show:'Cái lược',a:['cai luoc','luoc','cay luoc']},
 {q:'Cái gì đầy lỗ mà vẫn giữ được nước?',show:'Miếng bọt biển',a:['bot bien','mieng bot bien','cuc bot bien']},
 {q:'Bệnh gì bác sĩ cũng bó tay?',show:'Gãy tay',a:['gay tay','benh gay tay']},
 {q:'Cái gì to bằng cái nhà mà không nặng một gam?',show:'Cái bóng',a:['cai bong','bong','bong nha','bong cai nha']},
 {q:'Cái gì cho người khác rồi mà mình vẫn giữ được?',show:'Lời hứa',a:['loi hua','hua']},
 {q:'Cái gì luôn ở phía trước mà không bao giờ nhìn thấy?',show:'Tương lai',a:['tuong lai']},
 {q:'Cái gì phải đập vỡ ra mới dùng được?',show:'Quả trứng',a:['qua trung','trung','trung ga','cai trung']},
 {q:'Có thành phố mà không có nhà, có sông mà không có cá. Là gì?',show:'Tấm bản đồ',a:['ban do','tam ban do','cai ban do']},
 {q:'Cái gì càng lau càng ướt?',show:'Cái khăn',a:['cai khan','khan','khan lau','khan tam','khan mat']},
 {q:'Cái gì có một mắt mà không nhìn thấy gì?',show:'Cây kim',a:['cay kim','kim','kim khau']},
 {q:'Con gì mang cả cái nhà đi khắp nơi?',show:'Con ốc sên (hoặc con rùa)',a:['con oc','oc','oc sen','con oc sen','con rua','rua']},
 {q:'Một con vịt đi trước hai con, một con đi sau hai con, một con đi giữa. Có mấy con vịt?',show:'Ba con',a:['3','3 con','ba','ba con']},
 {q:'Xã nào đông dân nhất?',show:'Xã hội',a:['xa hoi']},
 {q:'Quần gì rộng nhất?',show:'Quần đảo',a:['quan dao']},
 {q:'Cầu gì không bắc qua sông?',show:'Cầu vồng, cầu thang, cầu lông…',a:['cau vong','cau thang','cau long','cau thu','cau hon','cau nguyen','cau mong']},
 {q:'Đang chạy đua, bạn vượt qua người thứ hai thì bạn đứng thứ mấy?',show:'Thứ hai',a:['thu hai','thu 2','hai','2','dung thu hai']},
 {q:'Cái gì chỉ tăng mà không bao giờ giảm?',show:'Tuổi tác',a:['tuoi','tuoi tac','so tuoi']},
 {q:'Đường gì dài nhất?',show:'Đường đời',a:['duong doi']},
 {q:'Hồ gì không có nước?',show:'Hồ dán (hoặc hồ sơ)',a:['ho dan','ho so']},
 {q:'Cái gì nghe được mà không nhìn thấy, không sờ được?',show:'Âm thanh',a:['am thanh','tieng','tieng noi','giong noi','tieng dong']},
 {q:'Cái gì đi thì nằm, đứng cũng nằm, nằm lại đứng?',show:'Bàn chân',a:['ban chan','chan']},
 {q:'Bỏ ngoài nướng trong, ăn ngoài bỏ trong là gì?',show:'Bắp ngô',a:['bap','ngo','bap ngo','trai bap','cu bap']},
 // Câu có options → hiện a/b/c; gõ a/b/c (chỉ một lần) hoặc gõ thẳng đáp án.
 {q:'Người thực vật đi câu cá gọi là gì?',show:'Rau câu',options:['Rau câu','Cần câu','Cá kho tộ'],answer:0,a:['rau cau']},
 {q:'Người đàn ông cõng người đàn ông thì gọi là gì?',show:'Gậy ông đập lưng ông',options:['Gậy ông đập lưng ông','Ông nói gà bà nói vịt','Ông bà ông vải'],answer:0,a:['gay ong dap lung ong']}
]);
const plainAns=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
// Đúng nếu: câu chat trùng hẳn một đáp án, hoặc chứa trọn cụm đáp án nhiều từ; đáp án một từ chỉ tính khi câu ≤ 3 từ ("là con cua", "con cua nè").
export function quizMatch(text,accepted){
 const msg=plainAns(text);if(!msg)return false;const tokens=msg.split(' ');
 return accepted.some(a=>{const ans=plainAns(a);if(!ans)return false;if(msg===ans)return true;const at=ans.split(' ');
  if(at.length===1)return tokens.length<=3&&tokens.includes(ans);
  return (' '+msg+' ').includes(' '+ans+' ');});
}
function startQuiz(w,now,c){const used=w.quizUsed||[];let pool=QUIZ_BANK.map((_,i)=>i).filter(i=>!used.includes(i));if(!pool.length){pool=QUIZ_BANK.map((_,i)=>i);w.quizUsed=[];}
  const idx=rnd(pool);(w.quizUsed??=[]).push(idx);const {q,show,a,options,answer}=QUIZ_BANK[idx];
  w.quiz={id:'quiz-'+now,q,show,accepted:a,options:options||null,answer:options?answer:null,riddle:true,startedAt:now,endsAt:now+QUIZ_MS,answers:{},order:[],tries:0,locked:{}};
  c.emit(w,null,'CÂU ĐỐ MẸO • '+q+(options?' • a. '+options[0]+' • b. '+options[1]+' • c. '+options[2]:' • gõ đáp án vào khung chat'),'quiz',now,{quizStart:true,q,riddle:true,...(options?{options}:{})});}
// Mọi câu chat khi câu đố đang mở đều được thử chấm. Sai → trả null để câu đó tiếp tục là trò chuyện bình thường.
function answerQuiz(w,p,text,now){const z=w.quiz;if(!z||z.closedAt||now>=z.endsAt||!z.riddle)return null;
  if(z.answers[p.id])return null;z.tries=(z.tries||0)+1;
  // Câu có a/b/c: gõ một chữ cái là chốt luôn (chỉ một lần), chọn sai thì không được đoán lại.
  if(z.options){const pick=['a','b','c'].indexOf(String(text).trim().toLowerCase());if(pick>=0){if(z.locked?.[p.id])return {ok:true,quiz:true,duplicate:true};(z.locked??={})[p.id]=true;if(pick!==z.answer)return {ok:true,quiz:true,correct:false};z.answers[p.id]=true;z.order.push(p.id);p.interactions++;w.totalInteractions++;return {ok:true,quiz:true,correct:true};}if(z.locked?.[p.id])return null;}
  if(!quizMatch(text,z.accepted||[]))return null;
  z.answers[p.id]=true;z.order.push(p.id);p.interactions++;w.totalInteractions++;return {ok:true,quiz:true,correct:true};}
function closeQuiz(w,now,c){const z=w.quiz;if(!z||z.closedAt||now<z.endsAt)return;z.closedAt=now;
  const right=z.order.filter(id=>z.answers[id]&&w.players[id]);
  right.forEach((id,i)=>{const p=w.players[id];c.gain(w,p,pct(c,p,i<3?.12:.06),i<3?40:20,i<3?3:1);if(i<3)buff(p,3,10*60000,now);});
  const answer=z.show||(z.options&&z.options[z.answer])||'';
  const letter=z.options?'abc'[z.answer]:undefined;
  c.emit(w,null,`Đáp án: ${letter?letter+'. ':''}${answer} • ${right.length} đạo hữu giải được`,'quiz',now,{quizEnd:true,answer,riddle:true,...(letter?{letter}:{}),count:right.length,top:right.slice(0,3).map(id=>w.players[id].name)});}

// ---------- CHUỖI ĐIỂM DANH ----------
export function checkinStreak(w,p,day,now,c){const y=vnDay(now-86400000);p.checkinStreak=p.lastCheckinDay===y?(p.checkinStreak||0)+1:1;p.lastCheckinDay=day;const s=p.checkinStreak;
  if(s<2)return;let txt;
  if(s%7===0){const fresh=c.giveArtifact(w,p,'nine-heaven-seal');const qi=c.gain(w,p,pct(c,p,.4),200,20);txt=fresh?'Cửu Tiêu Lôi Ấn':qi+' tu vi';}
  else if(s%5===0){buff(p,3,30*60000,now);c.gain(w,p,pct(c,p,.15),120,10);txt='phúc duyên ×3 ba mươi phút';}
  else if(s>=3){c.gain(w,p,pct(c,p,.1),100,10);txt='100 linh thạch';}
  else{c.gain(w,p,pct(c,p,.05),50,5);txt='50 linh thạch';}
  c.emit(w,p,`Chuỗi điểm danh ${s} ngày • ${txt}`,'petal',now,{streak:s,streakReward:txt});}

// ---------- NHIỆM VỤ NGÀY ----------
export const TASKS=Object.freeze([['chat','Bình luận',5],['like','Thả tim',50],['attack','Đánh quái',3]]);
export const LIVE_TASKS=Object.freeze([['cultivate','Tu luyện',1],['gather','Hái thảo',1],['attack','Đánh quái',3]]);
const tasksFor=w=>w?.mode==='live'?LIVE_TASKS:TASKS;
export function trackTasks(w,p,input,result,now,c){if(p.resident||p.puppet||!result?.ok||result.duplicate)return;const day=vnDay(now);if(p.tasks?.day!==day)p.tasks={day,chat:0,like:0,attack:0,done:false};const t=p.tasks;if(t.done)return;
  if(w.mode==='live'){
    if(['cultivate','gather','attack'].includes(input.type))t[input.type]=(t[input.type]||0)+1;
  }else if(input.type==='chat'){t.chat++;if(/^\s*danh\b/i.test(input.text||''))t.attack++;}else if(input.type==='like')t.like+=Math.max(0,Math.trunc(Number(input.count)||0));else if(input.type==='attack')t.attack++;
  if(tasksFor(w).every(([k,,n])=>(t[k]||0)>=n)){t.done=true;c.gain(w,p,pct(c,p,.2),80,10);buff(p,3,10*60000,now);c.emit(w,p,'Hoàn thành nhiệm vụ ngày • rương thưởng','lotus',now,{tasksDone:true});}}
export function taskText(p,now,w){const day=vnDay(now),t=p.tasks?.day===day?p.tasks:{done:false};
  return t.done?'Nhiệm vụ ngày đã xong • mai quay lại nhé':'Nhiệm vụ ngày • '+tasksFor(w).map(([k,l,n])=>`${l} ${Math.min(t[k]||0,n)}/${n}`).join(' • ');}

// ---------- TÔNG MÔN KIẾN TẠO ----------
export const SECT_LEVELS=Object.freeze([500,1500,3000,6000,10000,16000,25000,40000,60000,100000]);
export function sectBuild(w,p,coins,now,c){if(p.puppet||p.resident||coins<=0)return;const b=w.sectBuild??={level:0,coins:0,contrib:{}};b.coins+=coins;b.contrib[p.id]=(b.contrib[p.id]||0)+coins;
  while(b.level<SECT_LEVELS.length&&b.coins>=SECT_LEVELS[b.level]){b.level++;const team=Object.values(w.players).filter(q=>!q.resident&&c.active(w,q,now));
    for(const q of team){c.gain(w,q,pct(c,q,.03*b.level),20*b.level,b.level);buff(q,2,5*60000,now);}
    const [topId]=Object.entries(b.contrib).sort((x,y)=>y[1]-x[1])[0]||[];const top=w.players[topId];if(top)top.sectFounder=true;
    c.emit(w,null,`TÔNG MÔN LÊN CẤP ${b.level} • ban phúc ${team.length} đồng môn`,'blessing',now,{sectLevel:b.level,count:team.length,founder:top?.name||null});}}

// ---------- LỆNH + NHỊP ----------
export function engagementCommand(w,p,cmd,rest,now,c){
  if((cmd==='nhan'||cmd==='hongbao')&&!rest)return claimEnvelope(w,p,now,c);
  {const r=answerQuiz(w,p,[cmd,rest].filter(Boolean).join(' '),now);if(r)return r;} // 4/11: câu đố mẹo — mọi câu chat đều được thử chấm
  if(cmd==='nhiemvu'){c.emit(w,p,taskText(p,now,w),'status',now,{tasks:true});return {ok:true};}
  return null;}
export function tickEngagement(w,now,c){
  closeEnvelope(w,now,c);closeQuiz(w,now,c);
  const live=Object.values(w.players).filter(p=>!p.resident&&c.active(w,p,now)).length;
  const calm=!c.busy(w,now)&&!(w.envelope&&!w.envelope.closedAt)&&!(w.quiz&&!w.quiz.closedAt);
  // 4/11/2026: sự kiện nhỏ (lì xì / câu đố) rải dày — một nhịp chung ngẫu nhiên 1–2 phút, bốc ngẫu nhiên loại (không lặp liền một loại).
  // Đang có sự kiện lớn hoặc chưa đủ 2 người hoạt động thì thử lại sau 20 giây. (envelopeMinutes/quizMinutes cũ không còn dùng.)
  {const kinds=[w.settings?.envelope!==false&&'envelope',w.settings?.quiz!==false&&'quiz'].filter(Boolean);if(kinds.length){w.nextSmallAt??=now+60000;if(now>=w.nextSmallAt){if(calm&&live>=2){const pool=kinds.length>1?kinds.filter(k=>k!==w.lastSmallKind):kinds,kind=pool[Math.floor(Math.random()*pool.length)];if(kind==='envelope')startEnvelope(w,now,c);else startQuiz(w,now,c);w.lastSmallKind=kind;w.nextSmallAt=now+Math.round((60+Math.random()*60)*1000);}else w.nextSmallAt=now+20000;}}}
}
// lộ ra cho cảnh: không lộ đáp án / danh sách nhận
export function engagementView(w,now){const e=w.envelope,z=w.quiz;return {
  envelope:e&&!e.closedAt&&now<e.endsAt?{endsAt:e.endsAt,count:Object.keys(e.claimed).length}:null,
  quiz:z&&!z.closedAt&&now<z.endsAt?{q:z.q,riddle:!!z.riddle,...(z.options?{options:z.options}:{}),endsAt:z.endsAt,count:z.order.length}:null,
  sectBuild:w.sectBuild?{level:w.sectBuild.level,coins:w.sectBuild.coins,next:SECT_LEVELS[w.sectBuild.level]||null}:{level:0,coins:0,next:SECT_LEVELS[0]}};}
export function startEnvelopeNow(w,now,c){if(w.envelope&&!w.envelope.closedAt&&now<w.envelope.endsAt)return {ok:false,message:'Hồng bao đang rơi.'};startEnvelope(w,now,c);return {ok:true};}
export function startQuizNow(w,now,c){if(w.quiz&&!w.quiz.closedAt&&now<w.quiz.endsAt)return {ok:false,message:'Câu đố đang chạy.'};startQuiz(w,now,c);return {ok:true};}
