// 11/11/2026: VÂN HẢI THÁP. 16/11 (chủ game): 4 ĐÀI SONG SONG — 4 người leo cùng lúc, không phải đợi lâu; người dưới sân vẫn tu luyện.
// • Gõ 6 / "leo tháp" để vào. Có đài trống thì lên ngay, hết đài thì xếp hàng. Mỗi lượt 30 s đấu thủ vệ tầng kế (tầng cao nhất từng vượt + 1).
// • Thủ vệ có MÁU (số thật, tăng theo tầng) và ĐÁNH TRẢ người leo. Hết máu thủ vệ = vượt tầng; người leo hết máu hoặc hết giờ = dừng (không mất gì).
// • Người leo gõ 3 đánh; người khác gõ 3 = trợ lực (chia đều vào các đài theo người).
// • QUÀ = TRỢ LỰC (mốc 1 · 10 · 30 · 100 · 500): nổ sát thương, hồi máu, cuồng hóa (×sát thương + ra đòn nhanh), cộng giờ.
//   Quà của người đang leo vào đài mình; người ngoài tặng thì vào đài mình hay trợ lực; chưa ai leo thì giữ làm "hộ thể" cho lượt của mình.
// Mọi số tính theo % máu để tầng nào cũng cân: đúng tầm cảnh giới (tầng ≈ 2 × cảnh giới) thì tự đánh + gõ 3 vừa đủ qua; vượt cấp cần quà/trợ lực.
import {stageConflict} from './stage-lock.mjs';
import {combatRealm} from './public/luan-hoi-data.js'; // 18/11: Luân Hồi Ấn
import {baoBanMenh,baoBonus,BAO_TOWER,BAO_LINES,baoStarK,BAO_GUARD,BAO_GUARD_DMG,BAO_HEAL_BANK} from './public/phap-bao-data.js'; // 18/11: thần khí bản mệnh trong Tháp

export const TOWER=Object.freeze({durationMs:300000,turnMs:30000,gapMs:1500,hitCdMs:900,hitCdBoostMs:450,helpCdMs:2000,maxQueue:30,podiumMs:9000,milestone:5,lanes:4});
export const TOWER_JOIN=['leothap','thap','vaothap'];
const HIT=['danh','tancong','chem'];
// Thủ vệ: 3 hình có sẵn (events-v1/celestial-bosses-v1.png) × các "kiếp" màu; tên theo tông.
export const GUARDIANS=Object.freeze([{art:0,name:'Bích Hải Long Thủ'},{art:1,name:'Tinh Hải Côn Vương'},{art:2,name:'Cửu Vĩ Nguyệt Hồ'}]);
const KIEP=Object.freeze([{p:'',hue:0},{p:'Huyết ',hue:140},{p:'U Minh ',hue:230},{p:'Kim Giáp ',hue:-150},{p:'Hỗn Độn ',hue:70}]);
export function guardianOf(floor){const g=GUARDIANS[(floor-1)%3],k=KIEP[Math.min(KIEP.length-1,Math.floor((floor-1)/3))];return {floor,art:g.art,hue:k.hue,name:k.p+g.name,maxHp:guardianHp(floor)};}
const fail=message=>({ok:false,message});
const real=p=>p&&!p.resident&&!p.puppet;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
// Máu thủ vệ (số hiển thị): 1.200 ở tầng 1, +14%/tầng (tầng 10 ≈ 3.900, tầng 20 ≈ 14.400, tầng 30 ≈ 53.000).
export const guardianHp=floor=>Math.round(1200*1.14**(Math.max(1,floor)-1)/10)*10;
// % máu thủ vệ mỗi giây tự đánh: đúng tầm 2%/s (30 s = 60%), mỗi cảnh giới chênh ±0,9%/s.
export const passiveDps=(realm,floor)=>clamp(2+((Number(realm)||0)-floor/2)*0.9,0.5,6);
// % mỗi lần gõ 3 (người leo): 2,6% + 0,3%/cảnh giới − 0,2%/tầng.
export const hitDamage=(realm,floor)=>clamp(2.6+(Number(realm)||0)*0.3-floor*0.2,1,6);
export const HELP_DAMAGE=0.8;
// % máu NGƯỜI LEO mất mỗi giây: đúng tầm 1,4%/s (30 s mất ~42%); vượt cấp 1 cảnh giới +0,55%/s → vượt quá xa sẽ gục trước giờ.
export const guardDps=(realm,floor)=>clamp(1.4+(floor/2-(Number(realm)||0))*0.55,1,6);
// QUÀ TRỢ LỰC theo tổng coin một lần tặng (mốc 1 · 10 · 30 · 100 · 500). burst = % máu thủ vệ, heal = % máu người leo,
// mult = ×sát thương (tự đánh + gõ) trong ms, haste = ra đòn nhanh gấp đôi, time = cộng giờ lượt.
export const TOWER_GIFTS=Object.freeze([
 // 18/11 (chủ game: "quà 100 yếu thế, phải 1 chiêu gần hết máu quái"): 500 = chém bay thủ vệ, 100 = 85% máu; 30/10 nhích lên.
 {min:500,id:'g500',name:'VẠN KIẾM QUY TÔNG',burst:100,heal:100,mult:3,ms:15000,time:15000,shake:22,cut:5600},
 {min:100,id:'g100',name:'THIÊN HỎA LIỆU NGUYÊN',burst:85,heal:60,mult:2.2,ms:12000,time:10000,shake:14,cut:4600},
 {min:30,id:'g30',name:'CỬU THIÊN LÔI PHẠT',burst:30,heal:25,mult:1.7,ms:10000,time:6000,shake:8},
 {min:10,id:'g10',name:'KIẾM VŨ TRỢ TRẬN',burst:12,heal:12,mult:1.4,ms:8000,time:3000,shake:4},
 {min:1,id:'g1',name:'LINH KHÍ HỘ THỂ',burst:3,heal:6,mult:1.2,ms:6000,time:0,shake:0}]);
export const towerGiftTier=v=>TOWER_GIFTS.find(t=>v>=t.min)||null;
const SMALL_BURST_CD=1500; // hoa hồng spam: nổ sát thương tối đa 1 lần / 1,5 s mỗi đài (vẫn hồi máu + giữ cuồng hóa)
export const towerOpen=(w,now)=>!!w.tower&&!w.tower.closedAt&&now<w.tower.endsAt;
const lanesOf=e=>(e.lanes??=Array(TOWER.lanes).fill(null));
const laneOf=(e,id)=>lanesOf(e).findIndex(l=>l?.id===id);

export function startTower(w,now,c){
 if(towerOpen(w,now))return fail('Vân Hải Tháp đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Sân đang có '+busy+', để sau.');
 w.tower={id:'tower-'+now,startedAt:now,endsAt:now+TOWER.durationMs,queue:[],lanes:Array(TOWER.lanes).fill(null),gapUntil:Array(TOWER.lanes).fill(0),best:{},clears:0,results:[],fx:[],pending:{},seq:0};
 c.emit(w,null,'VÂN HẢI THÁP mở 4 đài • gõ 6 hoặc leo tháp để lên đài • gõ 3 để đánh, người khác gõ 3 trợ lực','tower',now,{towerStart:true});
 return {ok:true,endsAt:w.tower.endsAt};
}
export function stopTower(w,now,c){if(!towerOpen(w,now))return fail('Không có Vân Hải Tháp đang mở.');w.tower.endsAt=now;tickTower(w,now,c);return {ok:true};}

function pushFx(e,f){e.fx.push({id:e.id+':f'+(++e.seq),...f});if(e.fx.length>16)e.fx.splice(0,e.fx.length-16);}
function applyGift(e,lane,tier,now,from,value){
 const l=e.lanes[lane];if(!l)return;
 const small=tier.id==='g1'||tier.id==='g10',burstOk=!small||now-(l.smallBurstAt||0)>=SMALL_BURST_CD;
 if(burstOk){l.hp=Math.max(0,l.hp-tier.burst);if(small)l.smallBurstAt=now;}
 l.me=Math.min(100,l.me+tier.heal);
 const rank=TOWER_GIFTS.length-TOWER_GIFTS.indexOf(tier);
 if(!(l.buffUntil>now)||rank>=(l.buffRank||0)){l.buffMult=tier.mult;l.buffRank=rank;l.buffName=tier.name;l.buffTier=tier.id;}
 l.buffUntil=Math.max(l.buffUntil||0,now+tier.ms);l.endsAt+=tier.time;l.gifts=(l.gifts||0)+1;
 pushFx(e,{kind:'gift',lane,tier:tier.id,name:tier.name,value,from:from.id,fromName:from.name,burst:burstOk?tier.burst:0,heal:tier.heal,time:tier.time,shake:tier.shake,at:now});
 if(tier.cut)queueCut(e,{lane,tier:tier.id,name:tier.name,value,user:l.id,userName:l.name,from:from.id,fromName:from.name,floor:l.floor,dmg:Math.round(tier.burst/100*guardianHp(l.floor)),ko:l.hp<=0,ms:tier.cut},now);
}
// 18/11: CHIẾU RIÊNG quà ≥100 — 1 màn một lúc cho cả tháp, cách nhau ≥0,8 s, tối đa ~2 màn chờ (quá thì chỉ còn hiệu ứng trên thẻ).
// Trong lúc chiếu, cả tháp TẠM DỪNG (giờ lượt, tự đánh, thủ vệ đánh trả) → không ai mất giây vì màn chiếu.
const CUT_GAP=800,CUT_WAIT=9000;
export function queueCut(e,x,now){
 e.cuts??=[];const at=Math.max(now,(e.holdUntil||0)+(e.holdUntil>now?CUT_GAP:0));if(at-now>CUT_WAIT)return false;
 const c={id:e.id+':c'+(++e.seq),...x,at};e.cuts.push(c);if(e.cuts.length>4)e.cuts.splice(0,e.cuts.length-4);
 e.holdFrom??=now;e.holdUntil=at+x.ms;return true;
}
/** Dồn thời gian tạm dừng vào mọi mốc giờ. Trả true nếu vẫn đang dừng. */
function applyHold(e,now){
 if(e.holdFrom==null)return false;const until=Math.min(now,e.holdUntil||0),dt=Math.max(0,until-e.holdFrom);
 if(dt){for(const t of e.lanes){if(!t)continue;t.endsAt+=dt;t.lastAt+=dt;if(t.buffUntil)t.buffUntil+=dt;}e.endsAt+=dt;e.holdFrom=until;}
 if(now<e.holdUntil)return true;e.holdFrom=null;return false;
}
// 18/11 tối: thần khí bản mệnh — ×sát thương theo bậc, và THẦN THÔNG chém % máu thủ vệ theo nhịp (từ giây thứ 3 của lượt).
function baoMult(p){const bm=baoBanMenh(p);return bm?(1+BAO_TOWER[bm.tier].mult*baoStarK(bm.stars)):1;} /* 18/11 tối: KHÔNG cộng chỉ số Công ở Tháp — mô phỏng: Kiếm GIỚI HẠN ★5 leo vô hạn (thần thông chém % máu + sát thương tối thiểu không giảm theo tầng) */
function baoProc(e,lane,t,p,now){const bm=baoBanMenh(p);if(!bm||t.hp<=0||now<(t.baoAt??(t.startedAt+3000)))return;const T=BAO_TOWER[bm.tier];t.baoAt=now+T.cd;const k=baoStarK(bm.stars),guard=bm.line==='dinh'||bm.line==='chung';
 /* 18/11 tối: Đỉnh hồi máu người leo (thừa thì tích lũy ≤30), Chung lên khiên chặn đòn thủ vệ; hồi/khiên một nửa, sát thương kèm 85% (Tháp tính giờ — mô phỏng 18/11) */
 let guardFx=null;if(bm.line==='dinh'){const amt=BAO_GUARD[bm.tier].heal*100*k*.5,h=Math.min(100-t.me,amt);guardFx={heal:Math.round(amt)};t.me+=h;if(amt>h)t.bank=Math.min(BAO_HEAL_BANK*100,(t.bank||0)+amt-h);}
 if(bm.line==='chung'){t.shield=(t.shield||0)+BAO_GUARD[bm.tier].shield*100*k*.5;guardFx={shield:Math.round(BAO_GUARD[bm.tier].shield*100*k*.5)};}
 const pct=T.pct*k*(guard?.85:1); /* Tháp: dòng thủ giữ 85% sát thương */t.hp=Math.max(0,t.hp-pct);
 pushFx(e,{kind:'bao',lane,id:bm.id,tier:bm.tier,name:bm.name,skill:BAO_LINES[bm.line].skill,burst:pct,...(guardFx||{}),from:p.id,fromName:p.name,at:now});}
function beginTurn(w,e,lane,p,now){
 const floor=(Number(p.towerFloor)||0)+1;
 e.lanes[lane]={id:p.id,name:p.name,floor,hp:100,me:100,startedAt:now,endsAt:now+TOWER.turnMs,lastAt:now,helpers:{},helpHits:0,hits:0,next:{},buffUntil:0,buffMult:1};
 const pend=e.pending[p.id];if(pend){delete e.pending[p.id];applyGift(e,lane,pend.tier,now,p,pend.value);}
}
function finishTurn(w,e,lane,now,c,won,why){
 const t=e.lanes[lane];e.lanes[lane]=null;const p=w.players[t.id];e.seq++;e.gapUntil[lane]=now+TOWER.gapMs;
 let r;
 if(won&&p){
  const prev=Number(p.towerFloor)||0;p.towerFloor=Math.max(prev,t.floor);e.best[p.id]=Math.max(e.best[p.id]||0,t.floor);e.clears++;
  const mile=t.floor%TOWER.milestone===0,mult=mile?2:1;
  const qi=Math.round(c.requiredQi(p)*clamp(0.04+t.floor*0.002,0.04,0.08)*mult),stones=(3+t.floor)*mult;
  c.gain(w,p,qi,stones,now);
  r={seq:e.seq,lane,id:p.id,name:p.name,floor:t.floor,won:true,qi,stones,mile,at:now};
  c.emit(w,p,`Vượt tầng ${t.floor} Vân Hải Tháp • +${qi.toLocaleString('vi-VN')} tu vi • +${stones} linh thạch`,mile?'title':'lotus',now,
   mile?{tower:true,achieve:{kind:'tower',item:'Tầng '+t.floor,floor:t.floor,qi,stones}}:{tower:true});
 }else r={seq:e.seq,lane,id:t.id,name:t.name,floor:t.floor,won:false,why,at:now};
 e.results.push(r);if(e.results.length>8)e.results.shift();e.last=r;
}
export function tickTower(w,now,c){
 const e=w.tower;if(!e||e.closedAt)return;lanesOf(e);e.gapUntil??=Array(TOWER.lanes).fill(0);e.fx??=[];e.results??=[];e.pending??={};
 if(applyHold(e,now))return; // 18/11: đang chiếu riêng quà lớn → cả tháp đứng yên
 e.lanes.forEach((t,lane)=>{
  if(!t)return;const p=w.players[t.id];const dt=Math.max(0,Math.min(5000,now-t.lastAt))/1000;t.lastAt=now;
  const mult=(t.buffUntil>now?t.buffMult||1:1)*baoMult(p);
  t.hp=Math.max(0,t.hp-passiveDps(p?combatRealm(p):0,t.floor)*mult*dt);
  baoProc(e,lane,t,p,now);
  {let hurt=guardDps(p?combatRealm(p):0,t.floor)*dt;if(t.shield>0){const a=Math.min(t.shield,hurt);t.shield-=a;hurt-=a;}t.me=Math.max(0,t.me-hurt);if(t.bank>0&&t.me<100){const r=Math.min(t.bank,100-t.me);t.me+=r;t.bank-=r;}}
  if(t.hp<=0)finishTurn(w,e,lane,now,c,true);
  else if(t.me<=0)finishTurn(w,e,lane,now,c,false,'down');
  else if(now>=t.endsAt||!p)finishTurn(w,e,lane,now,c,false,'time');
 });
 if(now>=e.endsAt){
  e.lanes.forEach((t,lane)=>{if(t)finishTurn(w,e,lane,now,c,t.hp<=0,'time');});
  e.closedAt=now;e.podiumUntil=now+TOWER.podiumMs;
  const top=Object.entries(e.best).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,f])=>({id,name:w.players[id]?.name||'Đạo hữu',floor:f}));
  e.result={top,clears:e.clears};
  c.emit(w,null,'Vân Hải Tháp đóng cửa'+(top.length?' • '+top.map((r,i)=>`${i+1}. ${r.name} tầng ${r.floor}`).join(' • '):' • chưa ai vượt tầng'),'tower',now,{towerEnd:true});
  return;
 }
 e.lanes.forEach((t,lane)=>{
  if(t||e.gapUntil[lane]>now)return;
  while(e.queue.length){const id=e.queue.shift(),p=w.players[id];if(real(p)&&c.active(w,p,now)&&laneOf(e,id)<0){beginTurn(w,e,lane,p,now);break;}}
 });
}
// Đài người ngoài trợ lực: đài mình đang "theo" (lần trợ lực trước), không thì chia theo người cho đều.
function supportLane(e,p){const busy=e.lanes.map((l,i)=>l?i:-1).filter(i=>i>=0);if(!busy.length)return -1;
 const pick=e.follow?.[p.id];if(pick!=null&&e.lanes[pick])return pick;return busy[hash(p.id)%busy.length];}

export function towerCommand(w,p,cmd,now,c){
 if(!towerOpen(w,now))return null;
 const join=TOWER_JOIN.includes(cmd),hit=HIT.includes(cmd);if(!join&&!hit)return null;
 if(!real(p))return fail('Vân Hải Tháp dành cho người xem thật.');
 const e=w.tower;lanesOf(e);
 if(join){
  const mine=laneOf(e,p.id);if(mine>=0)return {ok:true,duplicate:true,lane:mine};
  if(e.queue.includes(p.id))return {ok:true,duplicate:true,position:e.queue.indexOf(p.id)+1};
  if(e.queue.length>=TOWER.maxQueue)return fail('Hàng chờ tháp đã đầy • chờ lượt sau');
  e.queue.push(p.id);p.interactions++;tickTower(w,now,c);
  const lane=laneOf(e,p.id);return lane>=0?{ok:true,tower:true,lane}:{ok:true,tower:true,position:e.queue.indexOf(p.id)+1};
 }
 // gõ 3 / đánh
 const mine=laneOf(e,p.id);
 if(mine>=0){const t=e.lanes[mine];if(t.next[p.id]>now)return {ok:true,cooldown:true};
  const fast=t.buffUntil>now;t.next[p.id]=now+(fast?TOWER.hitCdBoostMs:TOWER.hitCdMs);t.hits++;
  t.hp=Math.max(0,t.hp-hitDamage(combatRealm(p),t.floor)*(fast?t.buffMult||1:1)*baoMult(p));
  if(t.hp<=0&&!(e.holdUntil>now))finishTurn(w,e,mine,now,c,true);return {ok:true,tower:true,lane:mine};} /* đang chiếu riêng: phá tầng sau màn (tickTower) */
 const lane=supportLane(e,p);if(lane<0)return null; // chưa ai leo → để lệnh đánh cho sự kiện khác
 const t=e.lanes[lane];if(t.next[p.id]>now)return {ok:true,cooldown:true};
 t.next[p.id]=now+TOWER.helpCdMs;t.helpers[p.id]=(t.helpers[p.id]||0)+1;t.helpHits++;t.hp=Math.max(0,t.hp-HELP_DAMAGE);(e.follow??={})[p.id]=lane;
 if(t.hp<=0&&!(e.holdUntil>now))finishTurn(w,e,lane,now,c,true);
 return {ok:true,tower:true,lane,help:true};
}
// Quà trong lúc tháp mở → trợ lực. Trả {lane,tier,name} hoặc {pending} khi chưa ai leo (giữ làm hộ thể cho lượt của chính người tặng).
export function towerGift(w,p,value,now,c){
 if(!towerOpen(w,now)||!real(p)||!(value>=1))return null;
 const e=w.tower;lanesOf(e);e.fx??=[];e.pending??={};const tier=towerGiftTier(value);if(!tier)return null;
 let lane=laneOf(e,p.id);if(lane<0)lane=supportLane(e,p);
 if(lane<0){const cur=e.pending[p.id];if(!cur||cur.tier.min<=tier.min)e.pending[p.id]={tier,value};if(!e.queue.includes(p.id)&&e.queue.length<TOWER.maxQueue){e.queue.push(p.id);tickTower(w,now,c);}
  lane=laneOf(e,p.id);if(lane<0)return {pending:true,tier:tier.id,name:tier.name};}
 applyGift(e,lane,tier,now,p,value);(e.follow??={})[p.id]=lane;
 const t=e.lanes[lane];if(t&&t.hp<=0&&!(e.holdUntil>now))finishTurn(w,e,lane,now,c,true);
 return {lane,tier:tier.id,name:tier.name,to:t?.name};
}

export function towerView(w,now){
 const e=w.tower;if(!e)return null;
 const open=towerOpen(w,now);if(!open&&!(e.podiumUntil>now))return null;
 const lanes=lanesOf(e).map((t,i)=>{if(!t)return null;const p=w.players[t.id],g=guardianOf(t.floor);
  return {lane:i,id:t.id,name:t.name,floor:t.floor,hp:Math.round(t.hp*10)/10,me:Math.round(t.me*10)/10,maxHp:g.maxHp,endsAt:t.endsAt,startedAt:t.startedAt,
   helpers:Object.keys(t.helpers).length,helpHits:t.helpHits,hits:t.hits,realm:p?.realm??0,guardian:g,next:Math.ceil(t.floor/TOWER.milestone)*TOWER.milestone,
   buff:t.buffUntil>now?{name:t.buffName,tier:t.buffTier,mult:t.buffMult,until:t.buffUntil}:null};});
 return {id:e.id,active:open,endsAt:e.endsAt,clears:e.clears,lanes,cuts:(e.cuts||[]).filter(x=>now<x.at+x.ms+1000).map(x=>({...x,guardian:guardianOf(x.floor)})),holdUntil:e.holdUntil||0,
  queue:e.queue.slice(0,5).map(id=>w.players[id]?.name||'Đạo hữu'),queued:e.queue.length,queueAvatars:e.queue.slice(0,10).map(id=>({id,avatar:w.players[id]?.avatar||null})), // 16/11: bảng chờ chỉ avatar
  fx:(e.fx||[]).filter(f=>now-f.at<6000),
  results:(e.results||[]).filter(r=>now-r.at<4500),
  last:e.last&&now-e.last.at<4000?e.last:null,result:open?null:e.result||null};
}
