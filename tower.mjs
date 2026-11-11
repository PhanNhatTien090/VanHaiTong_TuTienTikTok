// 11/11/2026: VÂN HẢI THÁP — sự kiện ~4 phút, mỗi người một lượt leo tháp (học từ phòng mẫu, làm theo chất Vân Hải Tông).
// • Gõ 6 / "leo tháp" để xếp lượt. Tới lượt: 25 s đấu thủ vệ tầng kế tiếp (tầng cao nhất từng vượt + 1, lưu vĩnh viễn).
// • Thủ vệ tự mất máu theo tu vi người leo; người leo gõ 3 (đánh) thêm sát thương; người khác gõ 3 = TRỢ LỰC.
// • Thắng: +tu vi / linh thạch theo cảnh giới; mỗi 5 tầng thưởng ×2 + thẻ Báo Hỷ. Thua: không mất gì, gõ 6 xếp lượt lại.
// • Chỉ dùng lệnh chơi miễn phí — không gắn quà / tim (luật LIVE sau đợt bị hạn chế 03/11).
import {stageConflict} from './stage-lock.mjs';

export const TOWER=Object.freeze({durationMs:240000,turnMs:25000,gapMs:2500,hitCdMs:900,helpCdMs:2000,maxQueue:20,podiumMs:8000,milestone:5});
export const TOWER_JOIN=['leothap','thap','vaothap'];
const HIT=['danh','tancong','chem'];
// Thủ vệ: 3 hình có sẵn (events-v1/celestial-bosses-v1.png) × các "kiếp" màu; tên theo tông.
export const GUARDIANS=Object.freeze([{art:0,name:'Bích Hải Long Thủ'},{art:1,name:'Tinh Hải Côn Vương'},{art:2,name:'Cửu Vĩ Nguyệt Hồ'}]);
const KIEP=Object.freeze([{p:'',hue:0},{p:'Huyết ',hue:140},{p:'U Minh ',hue:230},{p:'Kim Giáp ',hue:-150},{p:'Hỗn Độn ',hue:70}]);
export function guardianOf(floor){const g=GUARDIANS[(floor-1)%3],k=KIEP[Math.min(KIEP.length-1,Math.floor((floor-1)/3))];return {floor,art:g.art,hue:k.hue,name:k.p+g.name};}
const fail=message=>({ok:false,message});
const real=p=>p&&!p.resident&&!p.puppet;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Độ khó: mỗi 2 tầng tương đương 1 cảnh giới. Người đúng tầm thắng nhẹ nhàng; vượt cấp phải gõ đánh và cần trợ lực.
export const passiveDps=(realm,floor)=>clamp(3+((Number(realm)||0)-floor/2)*1.2,0.8,8);
export const hitDamage=(realm,floor)=>clamp(4+(Number(realm)||0)*0.5-floor*0.3,2,10);
export const HELP_DAMAGE=1.5;
export const towerOpen=(w,now)=>!!w.tower&&!w.tower.closedAt&&now<w.tower.endsAt;

export function startTower(w,now,c){
 if(towerOpen(w,now))return fail('Vân Hải Tháp đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Sân đang có '+busy+', để sau.');
 w.tower={id:'tower-'+now,startedAt:now,endsAt:now+TOWER.durationMs,queue:[],cur:null,best:{},clears:0,last:null,seq:0};
 c.emit(w,null,'VÂN HẢI THÁP mở cửa 4 phút • gõ 6 hoặc leo tháp để xếp lượt • gõ 3 để đánh, người khác gõ 3 trợ lực','tower',now,{towerStart:true});
 return {ok:true,endsAt:w.tower.endsAt};
}
export function stopTower(w,now,c){if(!towerOpen(w,now))return fail('Không có Vân Hải Tháp đang mở.');w.tower.endsAt=now;tickTower(w,now,c);return {ok:true};}

function beginTurn(w,e,p,now){
 const floor=(Number(p.towerFloor)||0)+1;
 e.cur={id:p.id,name:p.name,floor,hp:100,startedAt:now,endsAt:now+TOWER.turnMs,lastAt:now,helpers:{},helpHits:0,hits:0,next:{}};
}
function finishTurn(w,e,now,c,won){
 const t=e.cur;e.cur=null;const p=w.players[t.id];e.seq++;
 if(won&&p){
  const prev=Number(p.towerFloor)||0;p.towerFloor=Math.max(prev,t.floor);e.best[p.id]=Math.max(e.best[p.id]||0,t.floor);e.clears++;
  const mile=t.floor%TOWER.milestone===0,mult=mile?2:1;
  const qi=Math.round(c.requiredQi(p)*clamp(0.04+t.floor*0.002,0.04,0.08)*mult),stones=(3+t.floor)*mult;
  c.gain(w,p,qi,stones,now);
  e.last={seq:e.seq,id:p.id,name:p.name,floor:t.floor,won:true,qi,stones,mile,at:now};
  c.emit(w,p,`Vượt tầng ${t.floor} Vân Hải Tháp • +${qi.toLocaleString('vi-VN')} tu vi • +${stones} linh thạch`,mile?'title':'lotus',now,
   mile?{tower:true,achieve:{kind:'tower',item:'Tầng '+t.floor,floor:t.floor,qi,stones}}:{tower:true});
 }else{
  e.last={seq:e.seq,id:t.id,name:t.name,floor:t.floor,won:false,at:now};
 }
 e.gapUntil=now+TOWER.gapMs;
}
export function tickTower(w,now,c){
 const e=w.tower;if(!e||e.closedAt)return;
 const t=e.cur;
 if(t){
  const p=w.players[t.id];const dt=Math.max(0,Math.min(5000,now-t.lastAt))/1000;t.lastAt=now;
  t.hp=Math.max(0,t.hp-passiveDps(p?.realm,t.floor)*dt);
  if(t.hp<=0)finishTurn(w,e,now,c,true);
  else if(now>=t.endsAt||!p)finishTurn(w,e,now,c,false);
 }
 if(now>=e.endsAt){
  if(e.cur)finishTurn(w,e,now,c,e.cur.hp<=0);
  e.closedAt=now;e.podiumUntil=now+TOWER.podiumMs;
  const top=Object.entries(e.best).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,f])=>({id,name:w.players[id]?.name||'Đạo hữu',floor:f}));
  e.result={top,clears:e.clears};
  c.emit(w,null,'Vân Hải Tháp đóng cửa'+(top.length?' • '+top.map((r,i)=>`${i+1}. ${r.name} tầng ${r.floor}`).join(' • '):' • chưa ai vượt tầng'),'tower',now,{towerEnd:true});
  return;
 }
 if(!e.cur&&!(e.gapUntil>now)){
  while(e.queue.length){const id=e.queue.shift(),p=w.players[id];if(real(p)&&c.active(w,p,now)){beginTurn(w,e,p,now);break;}}
 }
}

export function towerCommand(w,p,cmd,now,c){
 if(!towerOpen(w,now))return null;
 const join=TOWER_JOIN.includes(cmd),hit=HIT.includes(cmd);if(!join&&!hit)return null;
 if(!real(p))return fail('Vân Hải Tháp dành cho người xem thật.');
 const e=w.tower,t=e.cur;
 if(join){
  if(t?.id===p.id)return {ok:true,duplicate:true};
  if(e.queue.includes(p.id))return {ok:true,duplicate:true,position:e.queue.indexOf(p.id)+1};
  if(e.queue.length>=TOWER.maxQueue)return fail('Hàng chờ tháp đã đầy • chờ lượt sau');
  e.queue.push(p.id);p.interactions++;
  return {ok:true,tower:true,position:e.queue.length};
 }
 // gõ 3 / đánh
 if(!t)return null; // chưa ai leo → để lệnh đánh cho sự kiện khác
 if(t.id===p.id){
  if(t.next[p.id]>now)return {ok:true,cooldown:true};
  t.next[p.id]=now+TOWER.hitCdMs;t.hits++;t.hp=Math.max(0,t.hp-hitDamage(p.realm,t.floor));
 }else{
  if(t.next[p.id]>now)return {ok:true,cooldown:true};
  t.next[p.id]=now+TOWER.helpCdMs;t.helpers[p.id]=(t.helpers[p.id]||0)+1;t.helpHits++;t.hp=Math.max(0,t.hp-HELP_DAMAGE);
 }
 if(t.hp<=0)finishTurn(w,e,now,c,true);
 return {ok:true,tower:true};
}

export function towerView(w,now){
 const e=w.tower;if(!e)return null;
 const open=towerOpen(w,now);if(!open&&!(e.podiumUntil>now))return null;
 const t=e.cur,p=t&&w.players[t.id];
 return {id:e.id,active:open,endsAt:e.endsAt,clears:e.clears,
  cur:t?{id:t.id,name:t.name,floor:t.floor,hp:Math.round(t.hp*10)/10,endsAt:t.endsAt,startedAt:t.startedAt,helpers:Object.keys(t.helpers).length,helpHits:t.helpHits,hits:t.hits,realm:p?.realm??0,guardian:guardianOf(t.floor),next:Math.ceil(t.floor/TOWER.milestone)*TOWER.milestone}:null,
  queue:e.queue.slice(0,5).map(id=>w.players[id]?.name||'Đạo hữu'),queued:e.queue.length,
  last:e.last&&now-e.last.at<4000?e.last:null,result:open?null:e.result||null};
}
