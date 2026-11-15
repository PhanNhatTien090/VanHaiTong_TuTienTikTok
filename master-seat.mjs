// TRANH GHẾ TÔNG CHỦ (15/11/2026, chủ game):
// - Ai tặng MỘT món ≥2.000 coin có danh hiệu Tông chủ (luật cũ, master-rewards.mjs).
// - GHẾ Tông chủ thuộc một người (w.masterSeat). Hai người có danh hiệu cùng có mặt trên LIVE → lập tức đấu Lôi Đài; ai thắng ngồi ghế.
// - Tặng MỘT món ≥5.000 coin → lên ghế ngay, không cần đấu (đang đấu thì thắng luôn).
// - Ghế vắng chủ (chủ ghế không có mặt) → người có danh hiệu đang có mặt ngồi tạm; chủ ghế quay lại thì hai người đấu.
// - Cùng một cặp đã đấu thì 3 giờ sau mới đấu lại (tránh đấu liên tục khi cả hai ngồi LIVE lâu).
import {stageConflict} from './stage-lock.mjs';
import {startArena,arenaOpen} from './arena.mjs';
export const SEAT_BUYOUT_COINS=5000,SEAT_REMATCH_MS=3*3600000,SEAT_DUEL_MINUTES=3;
const real=p=>p&&!p.puppet&&!p.resident&&!p.webOnly;
const holder=p=>real(p)&&p.sectMasterUnlocked&&p.sectMasterGiftAt;
const pairKey=(a,b)=>[a,b].sort().join('|');
export function seatState(w){return w.masterSeat??={userId:null,since:0,how:null,pairs:{},pending:null};}
/** Chủ ghế ban đầu = người tặng ≥2.000 gần nhất (giống luật cũ) để chuyển đổi êm. */
export function ensureSeatOwner(w,now=Date.now()){
 const s=seatState(w);if(s.userId&&w.players[s.userId])return s.userId;
 const p=Object.values(w.players).filter(holder).sort((a,b)=>(b.sectMasterGiftAt||0)-(a.sectMasterGiftAt||0))[0];
 if(p){s.userId=p.id;s.since=now;s.how='gift';}return s.userId;
}
function setOwner(w,p,now,how,c,text){
 const s=seatState(w);if(!p)return;const was=s.userId;s.userId=p.id;s.since=now;s.how=how;s.pending=null;
 if(was!==p.id&&c?.emit)c.emit(w,p,text||('TÔNG CHỦ • '+p.name+' ngồi ghế Tông chủ'),'title',now,{masterSeat:true,how});
}
/** Gọi khi ai đó tặng một món (coins = giá 1 món). */
export function seatGift(w,p,coins,now,c){
 if(!holder(p))return null;const s=seatState(w);ensureSeatOwner(w,now);
 if(coins>=SEAT_BUYOUT_COINS){
  // Đang đấu tranh ghế mà người này là đấu thủ → thắng ngay.
  const m=w.arena?.master&&w.arena.current;
  if(m&&[m.a,m.b].includes(p.id)){const foe=p.id===m.a?m.b:m.a;m.fighters[foe].hp=0;m.forcedBy=p.id;}
  setOwner(w,p,now,'buyout',c,'TÔNG CHỦ • '+p.name+' dâng đại lễ, lên ghế Tông chủ không cần tranh đấu');
  return 'buyout';
 }
 if(!s.userId||s.userId===p.id){setOwner(w,p,now,'gift',c);return 'seat';}
 const owner=w.players[s.userId];
 if(!owner||!c?.active?.(w,owner,now)){setOwner(w,p,now,'gift',c);return 'seat';}
 s.pending={a:owner.id,b:p.id,at:now};return 'duel';
}
/** Mỗi tick: có 2 người mang danh hiệu cùng có mặt → xếp trận; sân rảnh thì mở trận tranh ghế. */
export function tickSeat(w,now,c){
 if(w.mode!=='live'&&!w.settings?.masterSeatDemo)return;
 const s=seatState(w);const ownerId=ensureSeatOwner(w,now);if(!ownerId)return;
 const owner=w.players[ownerId],here=p=>c?.active?.(w,p,now);
 if(!s.pending&&owner&&here(owner)){
  const rival=Object.values(w.players).filter(p=>holder(p)&&p.id!==ownerId&&here(p)&&now-(s.pairs[pairKey(ownerId,p.id)]||0)>=SEAT_REMATCH_MS)
   .sort((a,b)=>(b.sectMasterGiftAt||0)-(a.sectMasterGiftAt||0))[0];
  if(rival)s.pending={a:ownerId,b:rival.id,at:now};
 }
 const pd=s.pending;if(!pd)return;
 const a=w.players[pd.a],b=w.players[pd.b];
 if(!a||!b||!here(a)||!here(b)||pd.a!==s.userId){s.pending=null;return;}
 if(arenaOpen(w,now)||stageConflict(w,now))return; // chờ sân trống rồi đấu ngay
 const r=startArena(w,now,c,{minutes:SEAT_DUEL_MINUTES,master:true,champion:a.id,challenger:b.id});
 if(r.ok){s.pending=null;s.pairs[pairKey(a.id,b.id)]=now;
  c.emit(w,b,'TRANH GHẾ TÔNG CHỦ • '+b.name+' khiêu chiến Tông chủ '+a.name+' • ai thắng ngồi ghế','title',now,{masterDuel:true,pair:[a.id,b.id]});}
}
/** Kết quả trận tranh ghế (arena.mjs gọi). */
export function seatDuelResult(w,winnerId,loserId,now,c){
 const s=seatState(w),p=w.players[winnerId];if(!p)return;
 s.pairs[pairKey(winnerId,loserId)]=now;
 if(s.userId===winnerId){c?.emit?.(w,p,'TÔNG CHỦ • '+p.name+' giữ vững ghế Tông chủ','title',now,{masterSeat:true,how:'defend'});s.since=s.since||now;return;}
 setOwner(w,p,now,'duel',c,'TÔNG CHỦ • '+p.name+' thắng tranh ghế, lên ngôi Tông chủ');
}
export const seatOwnerId=w=>w.masterSeat?.userId||null;
