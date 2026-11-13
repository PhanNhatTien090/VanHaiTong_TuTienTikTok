export const MINI_TYPES=['rps','lucky','star'];
const NAMES={rps:'OẲN TÙ TÌ TIÊN GIỚI',lucky:'BA TÚI LINH LỘC',star:'BẮT SAO MAY MẮN'};
const HOW={rps:'Gõ vui búa / vui kéo / vui bao',lucky:'Gõ lộc 1 / lộc 2 / lộc 3',star:'Gõ bắt sao · 12 người nhanh nhất nhận quà'};
const active=(e,now)=>e&&!e.closedAt&&now<e.endsAt;
export const MINI_FINALE_MS=8000;
const presenting=(e,now)=>active(e,now)||e?.resultUntil>now;
export function smallEventConflict(w,now){return active(w.envelope,now)?'hồng bao':active(w.quiz,now)?'câu đố':presenting(w.miniEvent,now)?'trò vui':null;}
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
export function startMiniEvent(w,type,now,c){
 if(!MINI_TYPES.includes(type))return {ok:false,message:'Trò vui không hợp lệ.'};
 const busy=smallEventConflict(w,now);if(busy)return {ok:false,message:'Đang có '+busy+' • đợi trò nhỏ này kết thúc.'};
 w.miniEvent={id:'mini-'+type+'-'+now,type,startedAt:now,endsAt:now+45000,seed:Math.floor(Math.random()*0x7fffffff),claimed:{}};
 c.emit(w,null,NAMES[type]+' • '+HOW[type]+' • miễn phí, không cần tặng quà','mini',now,{miniStart:true,miniType:type});return {ok:true};
}
export function tickMiniEvent(w,now,c){const e=w.miniEvent;if(e&&!e.closedAt&&now>=e.endsAt){e.closedAt=now;e.resultUntil=now+MINI_FINALE_MS;c.emit(w,null,NAMES[e.type]+' đã khép • '+Object.keys(e.claimed).length+' đạo hữu nhận quà','mini',now,{miniEnd:true});}}
export function stopMiniEvent(w,now,c){if(!active(w.miniEvent,now))return {ok:false,message:'Không có trò nhỏ đang mở.'};w.miniEvent.endsAt=now;tickMiniEvent(w,now,c);return {ok:true};}
export function miniCommand(w,p,cmd,rest,now,c){
 const text=[cmd,rest].filter(Boolean).join(' '),matches=/^(vui|loc|bat sao|batsao)(?: |$)/.test(text);
 if(!matches)return null;
 const e=w.miniEvent;if(!active(e,now))return {ok:false,message:'Chưa có trò vui đang mở.'};
 if(p.resident||p.puppet||p.webOnly)return {ok:false,message:'Trò vui dành cho đạo hữu thật.'};
 if(Object.hasOwn(e.claimed,p.id))return {ok:true,duplicate:true};
 const key=hash(e.seed+':'+p.id);let qi=0,stones=0,result='',outcome='',choice='',opponentMove='';
 if(e.type==='rps'){
  if(cmd!=='vui')return null;
  const moves=['bua','keo','bao'],chosen=moves.indexOf(rest);if(chosen<0)return {ok:false,message:HOW.rps};
  const opponent=key%3,win=(chosen+1)%3===opponent,tie=chosen===opponent;qi=win?100:tie?50:25;stones=win?15:tie?8:4;
  outcome=win?'win':tie?'draw':'consolation';choice=moves[chosen];opponentMove=moves[opponent];
  result=['Búa','Kéo','Bao'][opponent]+' • '+(win?'Đạo hữu thắng!':tie?'Hòa vui vẻ!':'Tông sư thắng • vẫn có lộc');
 }else if(e.type==='lucky'){
  if(cmd!=='loc')return null;
  const n=Number(rest);if(!Number.isInteger(n)||n<1||n>3)return {ok:false,message:HOW.lucky};
  const tier=(key+n)%3;choice=String(n);outcome=['small','lucky','grand'][tier];qi=[40,70,120][tier];stones=[8,12,18][tier];result='Túi '+n+' • '+['Lộc Nhỏ','Cát Tường','Đại Cát'][tier];
 }else{
  if(!['bat sao','batsao'].includes(text))return null;
  const rank=Object.keys(e.claimed).length+1;if(rank>12)return {ok:false,message:'12 ngôi sao đã có chủ • đợi lượt sau.'};
  outcome='star';choice=String(rank);qi=Math.max(30,150-rank*10);stones=Math.max(5,22-rank);result='Bắt được sao hạng '+rank;
 }
 const reward=c.gain(w,p,qi,stones,1,now);Object.defineProperty(e.claimed,p.id,{value:{id:p.id,name:p.name||'Đạo hữu',at:now,qi:reward,stones,result,outcome,choice,opponent:opponentMove},enumerable:true,writable:true,configurable:true});
 if(e.type==='star'&&Object.keys(e.claimed).length===12)e.endsAt=Math.min(e.endsAt,now+1800);
 c.emit(w,p,result+' • +'+reward+' tu vi, +'+stones+' linh thạch','mini',now,{miniReward:true,miniType:e.type,reward:{qi:reward,stones,herbs:1}});return {ok:true,result};
}
export function miniView(w,now){
 const e=w.miniEvent;if(!presenting(e,now))return null;
 const rows=Object.entries(e.claimed).map(([id,r])=>({id,name:r.name||w.players?.[id]?.name||'Đạo hữu',at:r.at,qi:r.qi,stones:r.stones,result:r.result,outcome:r.outcome,choice:r.choice,opponent:r.opponent}));
 const priority={win:3,grand:3,draw:2,lucky:2,consolation:1,small:1,star:1};
 const winners=[...rows].sort((a,b)=>e.type==='star'?a.at-b.at:(priority[b.outcome]||0)-(priority[a.outcome]||0)||a.at-b.at).slice(0,3);
 return {id:e.id,type:e.type,name:NAMES[e.type],how:HOW[e.type],startedAt:e.startedAt,endsAt:e.endsAt,resultUntil:e.resultUntil,phase:e.closedAt?'finished':'playing',count:rows.length,remaining:e.type==='star'?Math.max(0,12-rows.length):null,latest:rows.sort((a,b)=>b.at-a.at||a.id.localeCompare(b.id)).slice(0,3),winners};
}
