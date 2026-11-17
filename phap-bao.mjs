// 17/11/2026 (chủ game): THIÊN CÔNG BẢO KHỐ — sự kiện "cầu" pháp bảo kiểu Genshin. Kế hoạch: PHAP-BAO-PLAN-2026-11-17.md.
// • Gõ "cầu" (cau) miễn phí, hồi 20 s/người; mỗi QUÀ = 1 lượt (≥999 coin: mỗi 999 = 1 lượt). Quà nào cũng +tu vi an ủi.
// • Kết quả: TRƯỢT (không lưu gì) · 4★ · 5★ · GIỚI HẠN. Bảo hiểm: 4★ chắc chắn trong mỗi 10 lượt, 5★ trong 80 lượt (mềm từ 65).
//   GIỚI HẠN KHÔNG bảo hiểm, chỉ ra hiếm khi đã ra 5★; 12 suất/mùa, mỗi người tối đa 1/mùa.
// • Số cơ duyên CHỈ ở server (luật LIVE: không hiện %/tỷ lệ/may rủi). Dữ liệu người chơi gọn: p.bao={p4,p5,items:{id:sao},lim}.
import {randomInt} from 'node:crypto';
import {stageConflict} from './stage-lock.mjs';
import {BAO_ITEMS,BAO_PITY4,BAO_PITY5,BAO_LIMITED_STOCK,BAO_EVENT_MS,BAO_FREE_CD,BAO_MAX_STARS,baoItem,baoBanMenh,BAO_LINES,BAO_TIER,baoKey} from './public/phap-bao-data.js';
// Cơ duyên không-trượt theo nguồn (theo ảnh mẫu chủ game; chỉnh được). q5 = trong lượt trúng, phần ra 5★.
// 18/11 tối (chủ game: "mới 1 sự kiện mà mất 2 hạn chế, vài hôm là hết"): 5★ chủ yếu nhờ bảo hiểm 80 lượt (q5 .06→.015, mềm từ 72),
// GIỚI HẠN trong 5★ .08→.04, và MỖI LƯỢT SỰ KIỆN TỐI ĐA 1 MÓN GIỚI HẠN (BAO_LIMITED_PER_EVENT).
export const BAO_ODDS=Object.freeze({free:.05,g1:.10,g10:.30,g99:.50,g199:.70,g999:.80,q5:.015,soft5From:72,soft5Step:.05,limitedIn5:.02}); // 18/11 khuya: GIỚI HẠN trong 5★ .04→.02 (chủ game: "5★ không thấy mà nổ 2 hạn chế")
// 18/11 khuya (chủ game): quà ≥99 coin KHÔNG BAO GIỜ TRƯỢT — chắc chắn ít nhất 4★.
export const BAO_SURE=new Set(['g99','g199','g999']);
export const BAO_LIMITED_PER_EVENT=1;
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
const fail=message=>({ok:false,message});
const rng=()=>randomInt(0,1_000_000_000)/1_000_000_000;
// 18/11: màn nhận theo kế hoạch mục 10.1 — 5★ 4,5 s, GIỚI HẠN 8 s; cách nhau ≥1,5 s (REVEAL_GAP = khoảng nghỉ giữa 2 màn).
export const REVEAL_MS=Object.freeze({5:4500,6:8000});
const PODIUM_MS=20000,LOG_MAX=20,REVEAL_GAP=1500,REVEAL=REVEAL_MS,REVEAL_QUEUE=3;
export const baoKhoActive=w=>w.baoKho?.phase==='open';
export const baoKhoVisible=(w,now)=>baoKhoActive(w)||w.baoKho?.podiumUntil>now;
export const sourceOf=coins=>!coins?'free':coins>=999?'g999':coins>=199?'g199':coins>=99?'g99':coins>=10?'g10':'g1';
function state(p){const b=p.bao??={p4:0,p5:0,items:{},lim:null};b.items??={};return b;}
function season(w){return w.baoSeason??={n:1,owners:{}};}
const limitedPool=w=>BAO_ITEMS.filter(x=>x.tier===6&&!season(w).owners[x.id]);

/** Một lượt cầu (thuần, có thể test với rng giả). Trả {tier,id,stars?}. tier 0 = trượt. */
export function rollBao(w,p,source,r=rng){
 const b=state(p),win=BAO_ODDS[source]??BAO_ODDS.free;b.p4++;b.p5++;
 const soft=b.p5>=BAO_ODDS.soft5From?(b.p5-BAO_ODDS.soft5From+1)*BAO_ODDS.soft5Step:0;
 let tier=0;const x=r();
 if(b.p5>=BAO_PITY5||x<win*BAO_ODDS.q5+soft)tier=5;
 else if(b.p4>=BAO_PITY4||x<win||BAO_SURE.has(source))tier=4;
 if(!tier)return {tier:0};
 if(tier===5){b.p5=0;b.p4=0;const s=season(w),pool=limitedPool(w),ev=w.baoKho,capped=ev&&(ev.limitedGiven||0)>=BAO_LIMITED_PER_EVENT;
  if(!capped&&(!b.lim||b.lim.season!==s.n))if(pool.length&&r()<BAO_ODDS.limitedIn5){const it=pool[Math.floor(r()*pool.length)];s.owners[it.id]=p.id;b.lim={season:s.n,id:it.id};if(ev)ev.limitedGiven=(ev.limitedGiven||0)+1;return give(b,it,6);}}
 else b.p4=0;
 const pool=BAO_ITEMS.filter(x=>x.tier===tier),it=pool[Math.floor(r()*pool.length)];return give(b,it,tier);
}
function give(b,it,tier){const cur=b.items[it.id]||0;if(cur>=BAO_MAX_STARS)return {tier,id:it.id,stars:cur,maxed:true};b.items[it.id]=cur+1;return {tier,id:it.id,stars:cur+1,fresh:!cur};}

export function startBaoKho(w,now,ctx){
 if(baoKhoActive(w))return fail('Thiên Công Bảo Khố đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Đang có '+busy+' • chờ kết thúc.');
 w.baoKho={id:'bao-'+now,phase:'open',startedAt:now,endsAt:now+BAO_EVENT_MS,pulls:0,log:[],hunters:{},cd:{},reveals:[],revealUntil:0,seq:0};
 ctx.emit(w,null,'THIÊN CÔNG BẢO KHỐ KHAI MỞ • gõ "cầu" để cầu pháp bảo','bao-kho',now,{baoStart:true});return {ok:true};
}
export function stopBaoKho(w,now,ctx){if(!baoKhoVisible(w,now))return fail('Bảo Khố chưa mở.');w.baoKho.phase='cancelled';w.baoKho.podiumUntil=0;ctx.emit(w,null,'Thiên Công Bảo Khố đã đóng','bao-kho',now,{baoEnd:true});return {ok:true};}
export function tickBaoKho(w,now,ctx){
 const e=w.baoKho;if(!e||e.phase!=='open'||now<e.endsAt)return;
 e.phase='finished';e.podiumUntil=now+PODIUM_MS;e.cd={};
 const top=topHunters(w,3);ctx.emit(w,null,'THIÊN CÔNG BẢO KHỐ KHÉP LẠI • '+e.pulls+' lượt cầu'+(top[0]?' · săn bảo nhiều nhất: '+top[0].name:'')+' • ai đã nhận: gõ thần khí để xem, trang bị + tên để đeo','bao-kho',now,{baoEnd:true});
}
function topHunters(w,n){return Object.entries(w.baoKho?.hunters||{}).map(([id,h])=>({id,name:w.players[id]?.name||'',items:h.i,pulls:h.n})).sort((a,b)=>b.items-a.items||b.pulls-a.pulls).slice(0,n);}
function record(w,p,res,now,ctx,source){
 const e=w.baoKho,h=e.hunters[p.id]??={n:0,i:0};h.n++;e.pulls++;if(res.tier)h.i++;
 const b=state(p),row={k:++e.seq,u:p.id,name:p.name,t:res.tier,id:res.id||null,s:res.stars||0,p4:BAO_PITY4-b.p4,p5:BAO_PITY5-b.p5,at:now};
 e.log.push(row);if(e.log.length>LOG_MAX)e.log.splice(0,e.log.length-LOG_MAX);
 if(res.tier>=5)queueReveal(e,{k:row.k,u:p.id,name:p.name,t:res.tier,id:res.id,s:res.stars},now);
 if(res.tier){const it=baoItem(res.id);ctx.emit(w,p,(res.tier===6?'THẦN KHÍ GIỚI HẠN • ':res.tier===5?'Thần khí cao cấp • ':'Thần khí • ')+p.name+' nhận '+it.name+(res.stars>1?' · lên ★'+res.stars:'')+' • gõ thần khí để xem · trang bị + tên để đeo','bao-kho',now,{baoWin:{tier:res.tier,id:res.id,stars:res.stars,item:it.name,left:res.tier===6?limitedPool(w).length:undefined}});
  if(res.tier===6)ctx.audit?.(w,'bao-limited',now,{user:p.id,name:p.name,id:res.id});}
 return row;
}
/** Xếp màn nhận 5★/GIỚI HẠN. Màn đang chiếu không bị cắt; GIỚI HẠN chen lên trước các màn 5★ chưa chiếu (dời chúng ra sau).
 * Hàng chờ quá REVEAL_QUEUE màn chưa chiếu → 5★ bỏ màn chiếu (vẫn có thẻ băng rôn + log). Thuần — test được. */
export function queueReveal(e,r,now){
 const live=e.reveals.filter(x=>x.at<=now&&now<x.at+x.ms),wait=e.reveals.filter(x=>x.at>now);
 if(r.t<6&&wait.length>=REVEAL_QUEUE)return false;
 const order=r.t>=6?[...wait.filter(x=>x.t>=6),r,...wait.filter(x=>x.t<6)]:[...wait,r];
 let at=live.length?Math.max(...live.map(x=>x.at+x.ms))+REVEAL_GAP:now;
 for(const x of order){x.at=at;x.ms=REVEAL[x.t];at+=x.ms+REVEAL_GAP;}
 e.reveals=[...e.reveals.filter(x=>x.at+x.ms<=now&&!order.includes(x)).slice(-2),...live,...order];e.revealUntil=at-REVEAL_GAP;return true;
}
/** Lệnh chat: "cầu" (cau). Trả null nếu không phải lệnh của Bảo Khố. */
export function baoKhoCommand(w,p,cmd,now,ctx){
 if(cmd!=='cau'||!baoKhoActive(w))return null;if(!real(p))return fail('Chỉ đạo hữu thật mới cầu được pháp bảo.');
 const e=w.baoKho,last=e.cd[p.id]||0;if(now-last<BAO_FREE_CD)return fail(p.name+' · '+Math.ceil((BAO_FREE_CD-(now-last))/1000)+' giây nữa cầu tiếp được');
 e.cd[p.id]=now;const res=rollBao(w,p,'free');return {ok:true,...record(w,p,res,now,ctx,'free')};
}
/** Quà trong Bảo Khố: mỗi quà = 1 lượt (≥999: mỗi 999 coin = 1 lượt), tối đa 30 lượt/lần tặng. +tu vi an ủi. */
export function baoKhoGift(w,p,unitCoins,count,now,ctx){
 if(!baoKhoActive(w)||!real(p)||!(unitCoins>0))return null;
 const src=sourceOf(unitCoins),n=Math.min(30,Math.max(1,count||1)*(unitCoins>=999?Math.floor(unitCoins/999):1));
 const rows=[];for(let i=0;i<n;i++)rows.push(record(w,p,rollBao(w,p,src),now,ctx,src));
 const qi=Math.round(unitCoins*Math.max(1,count||1)*100);ctx.gain?.(w,p,qi,0,0,now,false,'sect-event');
 return {pulls:n,wins:rows.filter(r=>r.t).length,qi};
}
export function baoKhoView(w,now){
 const e=w.baoKho;if(!e||!baoKhoVisible(w,now))return null;const s=season(w);
 return {id:e.id,phase:e.phase,startedAt:e.startedAt,endsAt:e.endsAt,podiumUntil:e.podiumUntil,pulls:e.pulls,log:e.log.slice(-8),
  top:topHunters(w,5),reveals:e.reveals.filter(r=>now<r.at+r.ms+1500),
  limited:BAO_ITEMS.filter(x=>x.tier===6).map(x=>({id:x.id,owner:s.owners[x.id]?(w.players[s.owners[x.id]]?.name||'?'):null})),season:s.n};
}
/** Lệnh "thần khí" (thankhi): bộ sưu tập ngắn gọn. */
export function baoCollectionText(p){const b=p.bao;if(!b||!Object.keys(b.items||{}).length)return 'Chưa có thần khí · gõ "cầu" khi Thiên Công Bảo Khố mở';
 const bm=baoBanMenh(p);return (bm?'Bản mệnh '+bm.name+' · ':'')+'Thần khí: '+Object.entries(b.items).map(([id,s])=>(baoItem(id)?.name||id)+' ★'+s).join(' · ')+' · còn '+(BAO_PITY4-b.p4)+' lượt tới 4★, '+(BAO_PITY5-b.p5)+' lượt tới 5★ · đeo: trang bị + tên thần khí';}

/** 18/11: lệnh "bản mệnh" — xem pháp bảo bản mệnh + danh sách đánh số; "bản mệnh N" đổi (hồi 10 phút). Bản mệnh phát thần thông trong Lôi Đài. */
export const BAN_MENH_CD=10*60000;
export function baoBanMenhCommand(p,rest,now){
 const items=p.bao?.items||{},list=Object.keys(items).filter(id=>baoItem(id)).sort((x,y)=>baoItem(y).tier-baoItem(x).tier||items[y]-items[x]);
 if(!list.length)return fail('Chưa có thần khí · gõ "cầu" khi Thiên Công Bảo Khố mở');
 const cur=baoBanMenh(p),label=id=>{const it=baoItem(id);return BAO_TIER[it.tier].name+' '+it.name+' ★'+items[id]+' ('+BAO_LINES[it.line].skill+')';};
 const n=parseInt(String(rest||'').trim(),10);
 if(!n)return {ok:true,message:'Bản mệnh: '+label(cur.id)+' · đổi: gõ trang bị + tên, hoặc bản mệnh + số · '+list.slice(0,6).map((id,i)=>(i+1)+'. '+baoItem(id).name).join(' · ')};
 const id=list[n-1];if(!id)return fail('Không có thần khí số '+n);
 if(id===cur.id)return {ok:true,message:'Bản mệnh đã là '+label(id)};
 const wait=(p.bao.banAt||0)+BAN_MENH_CD-now;if(wait>0)return fail('Đổi bản mệnh sau '+Math.ceil(wait/60000)+' phút nữa');
 p.bao.ban=id;p.bao.banAt=now;return {ok:true,message:p.name+' · bản mệnh: '+label(id)};
}

/** 18/11 tối: "trang bị <tên thần khí>" — đeo thần khí làm bản mệnh như pháp bảo thường (không hồi chờ). Trả null nếu tên không phải thần khí của người này. */
export function baoEquipByName(p,rest){
 const k=baoKey(rest);if(!k||k.length<3)return null;const items=p.bao?.items||{};
 const id=Object.keys(items).find(id=>{const it=baoItem(id);if(!it)return false;const n=baoKey(it.name);return n===k||n.includes(k)||k.includes(n);});if(!id)return null;
 p.bao.ban=id;const it=baoItem(id);return {ok:true,message:p.name+' · trang bị thần khí '+it.name+' ★'+items[id]+' làm bản mệnh ('+BAO_LINES[it.line].skill+')'};
}

/** 18/11 khuya: chủ nhân thần khí VÀO SÂN (vắng ≥30 phút rồi tương tác lại) → nhắc 1 câu cách xem/đeo/dùng. Trả null nếu không có thần khí. */
export const BAO_RETURN_AWAY=30*60000;
export function baoReturnHint(p){
 const bm=baoBanMenh(p);if(!bm)return null;
 return 'Chủ nhân thần khí trở lại • bản mệnh '+BAO_TIER[bm.tier].name+' '+bm.name+' ★'+bm.stars+' tự tung '+BAO_LINES[bm.line].skill+' ở Lôi Đài · Tháp · tỷ thí • gõ thần khí để xem · trang bị + tên để đổi';
}
