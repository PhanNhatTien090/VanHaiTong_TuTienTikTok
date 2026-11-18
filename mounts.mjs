// 16/11/2026 (chủ game): TỌA KỸ — Linh Châu, truyền công, sao, chỉ số. Kế hoạch: TOA-KY-PLAN-2026-11-16.md.
// Luật LIVE: KHÔNG nói/ghi "ngẫu nhiên", "tỷ lệ", "%" — chỉ báo nhận châu và tọa kỹ hiện thân.
import {randomInt} from 'node:crypto';
import {MOUNTS,ORBS,MAX_STARS,mountById,orbKind,mountStat} from './public/mounts.js';
export {MOUNTS,ORBS,mountById};

// Bậc ra theo loại châu (chỉ ở server). Châu vàng chắc chắn ra Thần.
export const ODDS=Object.freeze({common:{vip:.10,divine:.0005} /* 18/11 chủ game: châu xanh ra VIP 11% → 10% */,vip:{vip:.88,divine:.12} /* 18/11 chủ game: châu tím (quà 300) CHẮC CHẮN ra VIP trở lên — trước 50% ra thường */,divine:{vip:0,divine:1}});
// Bảo hiểm: 20 châu chưa ra VIP → châu kế ra ít nhất VIP; 200 lượt chưa ra Thần → ra Thần (châu tím tính 3 lượt).
export const PITY=Object.freeze({vip:20,divine:200,vipOrbWeight:3});
export const REVEAL_SCAN_MS=2000,COMMAND_CD=5000;
// 16/11 (chủ game): tặng quà lúc đang truyền công → châu vỡ sớm hơn. Mỗi coin rút 20 giây (châu xanh 30 phút ≈ 90 coin).
export const GIFT_MS_PER_COIN=20000;
const TIER_RANK={common:0,vip:1,divine:2};
const real=p=>p&&!p.resident&&!p.puppet&&p.actorKind!=='npc';
const fail=message=>({ok:false,message});
const cryptoRng=()=>randomInt(0,1_000_000_000)/1_000_000_000;
const minutes=ms=>Math.max(1,Math.ceil(ms/60000));

export function ensureMountState(p){
 p.mounts??={};p.mountOrbs??={common:0,vip:0,divine:0};p.mountPity??={vip:0,divine:0};
 for(const k of Object.keys(ORBS))p.mountOrbs[k]=Math.max(0,Number(p.mountOrbs[k])||0);
 return p;
}

// Chọn bậc rồi chọn đều trong bậc. Trả {tier, id, pity} — không đụng vào người chơi.
export function rollMount(kind,pity={vip:0,divine:0},rng=cryptoRng){
 const odds=ODDS[kind];if(!odds)throw RangeError('Loại châu không hợp lệ: '+kind);
 let tier,next={vip:pity.vip||0,divine:pity.divine||0};
 if(kind==='divine')tier='divine';
 else{
  const divineCount=next.divine+(kind==='vip'?PITY.vipOrbWeight:1);
  const r=rng();
  tier=divineCount>=PITY.divine||r<odds.divine?'divine':r<odds.divine+odds.vip?'vip':'common';
  if(tier==='common'&&next.vip+1>=PITY.vip)tier='vip';
  next=tier==='divine'?{vip:0,divine:0}:tier==='vip'?{vip:0,divine:divineCount}:{vip:next.vip+1,divine:divineCount};
 }
 const pool=MOUNTS.filter(m=>m.tier===tier);
 const pick=pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
 return {tier,id:pick.id,pity:next};
}

// Trao tọa kỹ: mới → sao 1; trùng → lên sao; đủ 5 sao → hoàn một nửa linh thạch của châu.
export function awardMount(p,id,kind,now){
 ensureMountState(p);const owned=p.mounts[id];let result;
 if(!owned){p.mounts[id]={stars:1,at:now};result={id,stars:1,fresh:true};}
 else if(owned.stars<MAX_STARS){owned.stars++;result={id,stars:owned.stars,starUp:true};}
 else{const refund=Math.floor((ORBS[kind]?.cost||0)/2);p.stones+=refund;result={id,stars:MAX_STARS,refund};}
 const cur=mountById(p.mount),got=mountById(id);
 if(!cur||TIER_RANK[got.tier]>TIER_RANK[cur.tier])p.mount=id;
 return result;
}

export function grantOrbs(w,p,kind,count,now,emit,{silent=false}={}){
 if(!real(p)||!ORBS[kind]||!Number.isSafeInteger(count)||count<1)return 0;
 ensureMountState(p);p.mountOrbs[kind]+=count;
 if(!silent)emit(w,p,'Nhận '+(count>1?count+' ':'')+ORBS[kind].name+' · gõ truyencong'+(kind==='common'?'':' '+(kind==='vip'?'vip':'than')),'mount',now,{mountOrb:kind,orbCount:count,...(kind!=='common'?{orbCard:{kind,stage:'got',count}}:{})}); // 18/11: châu tím/vàng có thẻ
 return count;
}

// Phần trăm thưởng của tọa kỹ đang cưỡi (0 nếu không cưỡi). key: arena | war | race | stones | qi.
// 18/11 (chủ game): người đang GIỮ châu tím/vàng chưa truyền công → nhắc bằng thẻ khi họ có mặt (engine gọi, hồi 20 phút/người).
export const ORB_REMIND_MS=20*60000;
export const ORB_REMIND_GAP_MS=60000; // toàn kênh: 1 lời nhắc / phút (đông người không đọc liên tục)
export function orbReminder(p){
 if(!p?.mountOrbs||p.mountChannel)return null;const o=p.mountOrbs,kind=o.divine>0?'divine':o.vip>0?'vip':o.common>0?'common':null;if(!kind)return null;
 const counts={divine:o.divine||0,vip:o.vip||0,common:o.common||0},list=['divine','vip','common'].filter(k=>counts[k]>0).map(k=>counts[k]+' '+ORBS[k].name);
 return {text:p.name+' đang có '+list.join(', ')+' · gõ truyencong'+(kind==='common'?'':' '+(kind==='divine'?'than':'vip'))+' để nở tọa kỹ',card:{kind,stage:'remind',count:counts[kind],counts}};
}
export function mountBonus(p,key){
 const id=p?.mount,own=id&&p.mounts?.[id];if(!own)return 0;
 return mountStat(id,own.stars,key)/100;
}

function startChannel(w,p,kind,now,emit){
 ensureMountState(p);const orb=ORBS[kind];
 if(p.mountChannel){const left=p.mountChannel.endsAt-now;return fail(left>0?ORBS[p.mountChannel.kind].name+' đang truyền công · còn '+minutes(left)+' phút':'Linh Châu đã đủ công lực · đang chờ hiện thân');}
 if(p.mountOrbs[kind]<1)return fail('Chưa có '+orb.name+'.');
 if((p.stones||0)<orb.cost)return fail('Truyền công '+orb.name+' cần '+orb.cost.toLocaleString('vi-VN')+' linh thạch.');
 p.stones-=orb.cost;p.mountOrbs[kind]--;
 p.mountChannel={kind,startedAt:now,endsAt:now+orb.ms};
 (w.mountChannels??=[]).includes(p.id)||w.mountChannels.push(p.id);
 emit(w,p,'Truyền công '+orb.name+' · '+minutes(orb.ms)+' phút','mount',now,{mountChannel:kind,endsAt:p.mountChannel.endsAt});
 return {ok:true,message:'Bắt đầu truyền công.'};
}

// Châu đủ giờ + người đang có mặt → vỡ châu, tọa kỹ hiện thân.
export function revealMount(w,p,now,ctx,rng=cryptoRng){
 const ch=p.mountChannel;if(!ch||now<ch.endsAt)return null;
 ensureMountState(p);
 const roll=rollMount(ch.kind,p.mountPity,rng);p.mountPity=roll.pity;
 const got=awardMount(p,roll.id,ch.kind,now);p.mountChannel=null;
 w.mountChannels=(w.mountChannels||[]).filter(id=>id!==p.id);
 const m=mountById(roll.id);
 const text=got.refund?'Linh Châu vỡ · '+m.name+' đã đủ '+MAX_STARS+' sao · hoàn '+got.refund+' linh thạch'
  :got.starUp?'Linh Châu vỡ · '+m.name+' lên '+got.stars+' sao':'Linh Châu vỡ · '+m.name+' hiện thân';
 const lucky=ch.kind==='common'&&m.tier!=='common'; // 18/11 (chủ game): châu xanh mà nở VIP/Thần → vinh danh "thiên đạo chiếu cố" + giọng
 ctx.emit(w,p,(lucky?'THIÊN ĐẠO CHIẾU CỐ • ':'')+text,'mount',now,{mountReveal:{id:m.id,tier:m.tier,orb:ch.kind,stars:got.stars,fresh:!!got.fresh,...(lucky?{lucky:true}:{})}});
 ctx.audit?.(w,'mount-reveal',now,{user:p.id,name:p.name,orb:ch.kind,mount:m.id,tier:m.tier,stars:got.stars,refund:got.refund||0});
 return got;
}

export function tickMounts(w,now,ctx){
 if(!w.mountChannels?.length||now-(w.mountScanAt||0)<REVEAL_SCAN_MS)return;w.mountScanAt=now;
 for(const id of [...w.mountChannels]){
  const p=w.players[id];
  if(!p?.mountChannel){w.mountChannels=w.mountChannels.filter(x=>x!==id);continue;}
  if(now<p.mountChannel.endsAt||w.playTransfers?.[id]?.phase==='web'||!ctx.active(w,p,now))continue;
  revealMount(w,p,now,ctx);
 }
}

// Quà khi đang truyền công: rút ngắn thời gian còn lại. Trả số ms đã rút (0 nếu không truyền công).
export function mountGiftBoost(w,p,coins,now,emit){
 const ch=p?.mountChannel,c=Math.max(0,Math.trunc(Number(coins)||0));if(!ch||!c||now>=ch.endsAt)return 0;
 const cut=Math.min(ch.endsAt-now,c*GIFT_MS_PER_COIN);ch.endsAt-=cut;ch.boostedMs=(ch.boostedMs||0)+cut;
 const left=ch.endsAt-now;
 emit(w,p,left>0?'Truyền công gia tốc · '+ORBS[ch.kind].name+' còn '+minutes(left)+' phút':'Truyền công viên mãn · '+ORBS[ch.kind].name+' sắp vỡ','mount',now,{mountChannel:ch.kind,endsAt:ch.endsAt,mountBoost:cut});
 return cut;
}

function statusLine(p,now){
 ensureMountState(p);const o=p.mountOrbs;
 const orbs=[o.common&&o.common+' xanh',o.vip&&o.vip+' tím',o.divine&&o.divine+' vàng'].filter(Boolean).join(' · ')||'chưa có';
 const ch=p.mountChannel?' · đang truyền công '+ORBS[p.mountChannel.kind].name+(p.mountChannel.endsAt>now?' còn '+minutes(p.mountChannel.endsAt-now)+' phút':' (đủ công lực)'):'';
 const ride=mountById(p.mount);
 return 'Linh Châu: '+orbs+ch+(ride?' · đang cưỡi '+ride.name+' '+p.mounts[ride.id].stars+'★':'');
}

export function mountCommand(w,p,cmd,rest,now,ctx){
 const words=String(rest||'').trim();
 let kindArg=null;
 if(cmd==='truyencong')kindArg=words;
 else if(cmd==='truyen'&&/^cong(\s|$)/.test(words))kindArg=words.replace(/^cong\s*/,'');
 const isChannel=kindArg!=null,isStatus=cmd==='linhchau',isRide=cmd==='toaky';
 if(!isChannel&&!isStatus&&!isRide)return null;
 if(!real(p))return fail('Tọa kỹ dành cho đệ tử Vân Hải Tông.');
 if(now-(p.mountCmdAt||0)<COMMAND_CD)return fail('Đợi vài giây.');
 p.mountCmdAt=now;ensureMountState(p);
 if(isChannel){const kind=orbKind(kindArg);if(!kind)return fail('Gõ truyencong, truyencong vip hoặc truyencong than.');return startChannel(w,p,kind,now,ctx.emit);}
 if(isStatus){ctx.emit(w,p,statusLine(p,now),'status',now,{mountStatus:true});return {ok:true};}
 const owned=MOUNTS.filter(m=>p.mounts[m.id]);
 if(words==='tat'||words==='xuong'){p.mount=null;ctx.emit(w,p,'Xuống tọa kỹ','status',now);return {ok:true};}
 if(words){
  const n=Number(words),m=Number.isInteger(n)?MOUNTS[n-1]:MOUNTS.find(x=>x.id===words);
  if(!m||!p.mounts[m.id])return fail('Chưa sở hữu tọa kỹ này.');
  p.mount=m.id;ctx.emit(w,p,'Cưỡi '+m.name+' '+p.mounts[m.id].stars+'★','mount',now,{mountRide:m.id});return {ok:true};
 }
 ctx.emit(w,p,owned.length?'Tọa kỹ: '+owned.map(m=>(MOUNTS.indexOf(m)+1)+'.'+m.name+' '+p.mounts[m.id].stars+'★').join(' · ')+' · gõ toaky số để cưỡi':'Chưa có tọa kỹ · Linh Châu có ở Tọa Kỹ Bí Cảnh','status',now,{mountStatus:true});
 return {ok:true};
}
