// 17/11 (chủ game): Nguyệt Hạ Tình Lâu — đôi đạo lữ song tu trong lễ Nguyệt Hạ Kết Duyên.
// Kế hoạch: NGUYET-HA-PLAN-2026-11-17.md. Song tu kiểu tu tiên (ngồi đối diện, chạm tay) — KHÔNG cảnh quan hệ (luật TikTok).
// Bậc: gõ "song tu" (cả hai) → Đình Nguyệt · quà 1 coin → Tình Các (cửa sổ Tình Lâu) · ≥30 → Uyên Ương Mật Thất (chiếu riêng)
// · một món ≥100 → Tiên Lữ Đại Điển (chiếu riêng + danh hiệu Thần Tiên Quyến Lữ).
import {activeBonds} from './bond-relations.mjs';
export const LOVE=Object.freeze({
  rooms:2,queueMax:20,roomMs:60000,roomMaxMs:120000 /* 17/11 chủ game: 2 phòng to, còn lại xếp hàng */,
  gardenMs:45000,gardenMax:3,songtuWindowMs:60000,
  secretMin:30,grandMin:100,
  secretMs:9000,grandMs:12000,cutGapMs:3000 /* 18/11 tối: 20 s làm quà chờ quá lâu */,cutQueueMax:2,
  roomPct:.006,roomPctMax:.05,secretPct:.08,secretPctMax:.15,grandPct:.2,grandPctMax:.3,gardenPct:.01,
  buffMult:2,buffMs:10*60000,partnerIdleMs:10*60000,
  title:'Thần Tiên Quyến Lữ'
});
export const LOVE_ROOM_THEMES=Object.freeze(['nến đỏ','trúc lâm nguyệt','băng cung']);
export const LOVE_QI_STYLES=Object.freeze(['âm dương','phượng hoàng','song liên']);
const live=(w,now)=>{const f=w.bondFestival;return f&&!f.closedAt&&now>=f.startedAt&&now<f.endsAt?f:null;};
const real=p=>p&&!p.resident&&!p.puppet&&p.actorKind!=='npc';
function state(f){const L=f.love??={rooms:Array(LOVE.rooms).fill(null),queue:[],gardens:[],gardenDone:{},songtu:{},cuts:[],cutUntil:0,last:{room:-1,qi:-1},pairs:0};
  if(L.rooms.length>LOVE.rooms){const extra=L.rooms.splice(LOVE.rooms).filter(Boolean);for(const r of extra)L.queue.unshift({bondId:r.bondId,a:r.a,b:r.b,aName:r.aName,bName:r.bName,ms:LOVE.roomMs,at:r.since});} // lễ cũ 6 phòng → dồn sang hàng chờ
  return L;}
// Đạo lữ đang có mặt ở LIVE (hoạt động trong 10 phút), ưu tiên người hoạt động gần nhất.
export function lovePartner(w,p,now){
  if(!real(p))return null;
  let best=null;
  for(const b of activeBonds(w,p.id)){const id=b.a===p.id?b.b:b.a,o=w.players[id];if(!real(o)||now-(o.lastActive||0)>LOVE.partnerIdleMs)continue;if(!best||(o.lastActive||0)>(best.partner.lastActive||0))best={bond:b,partner:o};}
  return best;
}
export function loveGiftRule(w,p,now){return live(w,now)&&lovePartner(w,p,now)?'nguyệt hạ tình lâu • song tu':null;}
const pick=(n,avoid,rand)=>{let v=Math.floor(rand()*n);if(v===avoid)v=(v+1+Math.floor(rand()*(n-1)))%n;return v;};
// 18/11 tối (chủ game: "song tu quà 30/100 lên tu vi quá nhanh — 3 cảnh giới cuối hạn chế lại, dưới giữ nguyên").
export const LOVE_LATE_MULT=Object.freeze({26:.35,27:.3,28:.25});
export const loveLateMult=p=>LOVE_LATE_MULT[Math.min(28,Math.floor(Number(p?.realm)||0))]??1;
function award(w,p,pct,now,c,source='gift'){const need=c.requiredQi?.(p)||0;pct*=loveLateMult(p);const qi=Math.max(1,Math.round(need*pct));return c.gain(w,p,qi,Math.round(10+pct*400),0,now,false,source);}
function pairOf(b,a,o){return {bondId:b.id,a:a.id,b:o.id,aName:a.name,bName:o.name};}
function placeRoom(L,pair,now,ms){
  const i=L.rooms.findIndex(r=>r&&r.bondId===pair.bondId);
  if(i>=0){const r=L.rooms[i];r.until=Math.min(now+LOVE.roomMaxMs,Math.max(r.until,now)+ms);r.gifts++;return {room:i,extended:true};}
  const free=L.rooms.findIndex(r=>!r||r.until<=now);
  if(free>=0){L.rooms[free]={...pair,since:now,until:now+ms,gifts:1};L.pairs++;return {room:free};}
  const q=L.queue.find(x=>x.bondId===pair.bondId);if(q){q.ms=Math.min(LOVE.roomMaxMs,q.ms+ms);return {queued:L.queue.indexOf(q)+1};}
  if(L.queue.length>=LOVE.queueMax)return {full:true};
  L.queue.push({...pair,ms,at:now});return {queued:L.queue.length};
}
function scheduleCut(w,f,L,pair,tier,now,rand){
  const grand=tier==='grand',pending=L.cuts.filter(x=>x.at>now);if(!grand&&pending.length>=LOVE.cutQueueMax)return null;
  const ms=grand?LOVE.grandMs:LOVE.secretMs;let at;
  // 18/11 tối (chủ game: "tặng 100 coin delay rất lâu" — đo LIVE chờ 43 s): Đại Điển CHEN ĐẦU — chỉ chờ màn đang chiếu dở xong, các màn đang chờ lùi ra sau.
  if(grand){const playing=L.cuts.find(x=>x.at<=now&&x.at+x.ms>now);at=playing?playing.at+playing.ms:now;
    let next=at+ms+LOVE.cutGapMs;for(const x of pending.sort((p,q)=>p.at-q.at)){x.at=Math.max(x.at,next);next=x.at+x.ms+LOVE.cutGapMs;}}
  else at=Math.max(now,L.cutUntil?L.cutUntil+LOVE.cutGapMs:now);
  const room=pick(LOVE_ROOM_THEMES.length,L.last.room,rand),qi=pick(LOVE_QI_STYLES.length,L.last.qi,rand);L.last={room,qi};
  const cut={id:'love-cut-'+now+'-'+pair.bondId,tier,at,ms,room,qi,...pair,hue:Math.floor(rand()*360)};
  L.cuts.push(cut);L.cuts=L.cuts.filter(x=>x.at+x.ms>now-30000).slice(-6);L.cutUntil=Math.max(...L.cuts.map(x=>x.at+x.ms));
  if(L.cutUntil+3000>f.endsAt)f.endsAt=L.cutUntil+3000; // lễ hoãn đóng tới khi chiếu xong
  return cut;
}
// Quà trong lễ của 1 trong 2 người đôi đạo lữ. Trả null nếu không áp (để quà mặc định chạy).
export function loveTowerGift(w,p,coins,unitCoins,now,c,rand=Math.random){
  const f=live(w,now);if(!f||!(coins>0))return null;const found=lovePartner(w,p,now);
  if(!found){ // 17/11: người xem không biết phải có đạo lữ → nhắc (≤1 lần/2 phút/người), quà vẫn theo luật thường
    if(real(p)&&now-(p.loveHintAt||0)>=120000){p.loveHintAt=now;const has=activeBonds(w,p.id).length>0;c.emit(w,p,has?'Đạo lữ chưa ở LIVE • cả hai cùng có mặt mới vào Tình Lâu':'Cần đạo lữ đang ở LIVE mới vào Tình Lâu • ketduyen tên → người kia gõ dongy','status',now,{loveHint:true});}
    return null;}
  const L=state(f),pair=pairOf(found.bond,p,found.partner),tier=unitCoins>=LOVE.grandMin?'grand':coins>=LOVE.secretMin?'secret':'room';
  const pct=tier==='grand'?Math.min(LOVE.grandPctMax,LOVE.grandPct+(unitCoins-LOVE.grandMin)*.00025):tier==='secret'?Math.min(LOVE.secretPctMax,LOVE.secretPct+(coins-LOVE.secretMin)*.001):Math.min(LOVE.roomPctMax,LOVE.roomPct*coins);
  const gains={};for(const x of [p,found.partner])gains[x.id]=award(w,x,pct,now,c);
  const slot=placeRoom(L,pair,now,tier==='room'?LOVE.roomMs:LOVE.roomMaxMs);
  let cut=null;
  if(tier!=='room'){
    for(const x of [p,found.partner]){x.buffMult=Math.max(LOVE.buffMult,x.buffUntil>now?x.buffMult||1:1);x.buffUntil=Math.max(x.buffUntil||0,now+LOVE.buffMs);}
    cut=scheduleCut(w,f,L,pair,tier,now,rand);
  }
  if(tier==='grand'){const b=w.social?.bonds?.[found.bond.id]||found.bond;b.grandRite=now;for(const x of [p,found.partner]){x.loveTitle=LOVE.title;x.loveTitleWith=x.id===p.id?found.partner.name:p.name;}}
  const label=tier==='grand'?'Tiên Lữ Đại Điển':tier==='secret'?'Uyên Ương Mật Thất':'Tình Các';
  const where=slot.full?'Tình Lâu đã kín':slot.queued?'chờ phòng thứ '+slot.queued:slot.extended?'thêm giờ song tu':'vào '+label;
  c.emit(w,p,`${p.name} ♥ ${found.partner.name} • ${where} • song tu +${gains[p.id]} / +${gains[found.partner.id]} tu vi`,'bond',now,{loveRoom:{tier,label,room:slot.room??null,queued:slot.queued||0,cut:cut?.id||null,a:p.id,b:found.partner.id,aName:p.name,bName:found.partner.name,partnerQi:gains[found.partner.id]}});
  return {tier,label,partner:found.partner.name,partnerId:found.partner.id,text:label+' cùng '+found.partner.name,cut:cut?.id||null,gains};
}
// Lệnh "song tu": cả hai gõ trong 60 s → Đình Nguyệt (miễn phí, 1 lần/đôi/lễ).
export function loveCommand(w,p,cmd,now,c){
  if(cmd!=='songtu')return null;const f=live(w,now);if(!f)return {ok:false,message:'Song tu mở trong lễ Nguyệt Hạ Kết Duyên.'};
  const found=lovePartner(w,p,now);if(!found)return {ok:false,message:'Cần đạo lữ đang ở LIVE • ketduyen tên để kết duyên.'};
  const L=state(f),b=found.bond;if(L.gardenDone[b.id])return {ok:false,message:'Đôi đã song tu ở Đình Nguyệt trong lễ này.'};
  const marks=L.songtu[b.id]??={};marks[p.id]=now;
  if(now-(marks[found.partner.id]||-Infinity)>LOVE.songtuWindowMs){c.emit(w,p,`${p.name} mời ${found.partner.name} song tu • đạo lữ gõ song tu`,'bond',now,{loveInvite:true});return {ok:true,pending:true};}
  L.gardens=L.gardens.filter(g=>g.until>now);if(L.gardens.length>=LOVE.gardenMax)return {ok:false,message:'Đình Nguyệt đang kín • thử lại sau ít giây.'};
  delete L.songtu[b.id];L.gardenDone[b.id]=now;const pair=pairOf(b,p,found.partner);L.gardens.push({...pair,since:now,until:now+LOVE.gardenMs});
  const ga=award(w,p,LOVE.gardenPct,now,c,'reward'),gb=award(w,found.partner,LOVE.gardenPct,now,c,'reward');
  c.emit(w,p,`${p.name} ♥ ${found.partner.name} • song tu dưới Nguyệt Lão • +${ga} / +${gb} tu vi`,'bond',now,{loveGarden:{a:p.id,b:found.partner.id,aName:p.name,bName:found.partner.name}});
  return {ok:true};
}
export function tickLoveTower(w,now,c){
  const f=w.bondFestival,L=f?.love;if(!L)return;
  for(let i=0;i<L.rooms.length;i++){const r=L.rooms[i];if(r&&r.until<=now){L.rooms[i]=null;const q=L.queue.shift();if(q&&!f.closedAt){L.rooms[i]={...q,since:now,until:now+q.ms,gifts:1};L.pairs++;delete L.rooms[i].ms;delete L.rooms[i].at;c.emit(w,w.players[q.a]||null,`${q.aName} ♥ ${q.bName} • vào Tình Các song tu`,'bond',now,{loveRoom:{tier:'room',label:'Tình Các',room:i,a:q.a,b:q.b,aName:q.aName,bName:q.bName,fromQueue:true}});}}}
  L.gardens=L.gardens.filter(g=>g.until>now);
  if(f.closedAt){L.queue=[];L.songtu={};}
}
// Gửi xuống overlay (nhỏ gọn).
export function loveView(w,now){
  const f=w.bondFestival;if(!f||f.closedAt&&now-f.closedAt>20000)return null;const L=state(f);
  return {active:!f.closedAt&&now>=f.startedAt&&now<f.endsAt,endsAt:f.endsAt,rooms:L.rooms.map(r=>r&&r.until>now?{a:r.a,b:r.b,aName:r.aName,bName:r.bName,until:r.until}:null),queue:L.queue.slice(0,6).map(q=>({a:q.a,b:q.b,aName:q.aName,bName:q.bName})),queueCount:L.queue.length,
    gardens:L.gardens.filter(g=>g.until>now).map(g=>({a:g.a,b:g.b,aName:g.aName,bName:g.bName,until:g.until})),cuts:L.cuts.filter(x=>x.at+x.ms>now-2000),pairs:L.pairs};
}
