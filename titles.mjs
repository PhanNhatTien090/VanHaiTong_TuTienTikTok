// 21/11/2026 tối (chủ game): DANH HIỆU = GHẾ HIẾM, người chơi giành nhau. Danh mục chung public/title-data.js.
//  • Nạp: xếp theo tổng quà (từ 300 coin): top1 Thần Tài · top2–3 Đại Gia · top4–10 Nhà Giàu · còn lại Phú Hộ; Tông Chủ = người gần nhất tặng Vương Miện.
//  • Sự kiện: người thắng LƯỢT GẦN NHẤT giữ ghế (lượt sau có người thắng thì chuyển), không hết hạn theo giờ.
//    Không sửa từng sự kiện: syncSeats() đọc dấu vết các sự kiện vốn đã ghi (funTitle/alchemyTitle/warTitle + kết quả trận, arenaTitle, bond.grandRite…)
//    và lưu ghế bền vững ở w.titleSeats[key]={ids,at}.
//  • Tông môn/tình cảm: tính từ dữ liệu sẵn có (tu vi, activeMs, số đạo lữ theo giới tính) + 2 bộ đếm tuần mới: bình luận (Lắm Mồm), lời mời kết duyên (Cao Thủ Tán Gái).
// Mỗi người giữ nhiều danh hiệu; p.titlePick = key đã chọn ('off' = ẩn, không có = tự đeo cái rank nhỏ nhất).
import {TITLE_LIST,TITLE_BY_KEY,TITLE_SPARKLE_COINS,PAID_MIN_COINS} from './public/title-data.js';

const real=p=>p&&!p.resident&&!p.puppet;
const VN=7*3600000,WEEK=7*86400000;
/** Số tuần (giờ VN, tuần bắt đầu thứ Hai). */
export const weekNo=now=>Math.floor((now+VN+3*86400000)/WEEK);
const CHAT_GAP_MS=2000; // bình luận dồn dập trong 2 s chỉ tính 1 (chống spam bơm Lắm Mồm)

/** Gọi mỗi bình luận thật từ LIVE. */
export function noteChat(p,now){if(!real(p))return;const wk=weekNo(now);const c=p.chatWeek?.wk===wk?p.chatWeek:(p.chatWeek={wk,n:0,at:0});if(now-c.at<CHAT_GAP_MS)return;c.at=now;c.n++;}

function seat(w,key,ids,at){if(!ids.length||!at)return;const s=w.titleSeats[key];if(s&&s.at>=at)return;w.titleSeats[key]={ids:[...new Set(ids)],at};}
/** Đọc dấu vết sự kiện → cập nhật ghế. Thuần trên w (test được). */
export function syncSeats(w,now){
 w.titleSeats??={};const S=w.titleSeats;
 const FUN={'Đan Tặc • Kẻ Nổ Lò':['ke-no-lo',3600000],'Hộ Đạo Chân Quân':['ho-dao-vuong',3600000],'Mê Cung Chi Chủ':['vua-me-cung',3600000],'Thiết Thủ Vương':['vua-go-dau',3600000],'Đầu Sắt':['dau-sat',3600000]};
 const best={};const pick=(key,id,at)=>{if(at&&(!best[key]||at>best[key].at))best[key]={id,at};};
 for(const p of Object.values(w.players||{})){if(!real(p))continue;
  const f=p.funTitle,m=f&&FUN[f.name];if(m)pick(m[0],p.id,f.until-m[1]);
  if(p.alchemyTitle?.until)pick('than-luyen-dan',p.id,p.alchemyTitle.until-24*3600000);
  // Cao Thủ Tán Gái: mỗi lời mời kết duyên mới (lastBondInvite đổi) cộng 1 vào bộ đếm tuần
  if(p.lastBondInvite&&p.lastBondInvite>(p.flirtSeen||0)){if(p.flirtSeen!=null){const wk=weekNo(p.lastBondInvite);const c=p.flirtWeek?.wk===wk?p.flirtWeek:(p.flirtWeek={wk,n:0});c.n++;}p.flirtSeen=p.lastBondInvite;}
 }
 for(const [k,v] of Object.entries(best))seat(w,k,[v.id],v.at);
 // Chính Ma: kết quả trận (top từng phe) — hạng 1 Ma = Ma Đạo Vương, hạng 2 Ma = Độc Vương, hạng 1 Chính = Minh Chủ
 const war=w.sectWar,top=war?.result?.honor?.top,at=war?.finishedAt;
 if(top&&at){if(top.ma?.[0])seat(w,'ma-dao-vuong',[top.ma[0].id],at);if(top.ma?.[1])seat(w,'doc-vuong',[top.ma[1].id],at);if(top.chinh?.[0])seat(w,'chinh-dao-minh-chu',[top.chinh[0].id],at);}
 const t=w.tournament;if(t?.winner&&t.finishedAt)seat(w,'kiem-khoi',[t.winner],t.finishedAt);
 // Lôi Đài: Bá Chủ lượt gần nhất (trận tranh ghế master không tính)
 const a=w.arena;if(a?.champion&&a.closedAt&&!a.master&&w.players?.[a.champion]?.arenaTitle)seat(w,'loi-dai-ba-chu',[a.champion],a.closedAt);
 // Thần Tiên Quyến Lữ: cặp làm Đại Điển gần nhất
 let rite=null;for(const b of Object.values(w.social?.bonds||{}))if(b?.grandRite&&(!rite||b.grandRite>rite.grandRite))rite=b;
 if(rite)seat(w,'than-tien-quyen-lu',[rite.a,rite.b].filter(Boolean),rite.grandRite);
 return S;}

const caches=new WeakMap(),TTL=5000;
/** Map key → Set(id) người đang giữ (bộ nhớ đệm 5 s). */
export function titleHolders(w,now=Date.now()){
 const hit=caches.get(w);if(hit&&now-hit.at<TTL&&now>=hit.at)return hit.map;
 syncSeats(w,now);
 const map=new Map(TITLE_LIST.map(t=>[t.key,new Set()])),add=(k,id)=>id&&map.get(k)?.add(id);
 const ps=Object.values(w.players||{}).filter(real),wk=weekNo(now);
 const edited=new Set((w.adminLog||[]).filter(r=>r.changes?.some(s=>String(s).startsWith('coin quà '))).map(r=>r.id));
 // Tông Chủ: người gần nhất tặng Vương Miện
 const master=ps.filter(p=>p.sectMasterUnlocked&&p.sectMasterGiftAt).sort((a,b)=>b.sectMasterGiftAt-a.sectMasterGiftAt)[0];add('tong-chu',master?.id);
 ps.filter(p=>(Number(p.giftCoins)||0)>=PAID_MIN_COINS&&!edited.has(p.id)).sort((a,b)=>b.giftCoins-a.giftCoins||(a.joinedAt||0)-(b.joinedAt||0))
  .forEach((p,i)=>add(i===0?'than-tai':i<3?'dai-gia':i<10?'nha-giau':'phu-ho',p.id));
 for(const p of ps)if(Number(p.reincarnations)>0)add('luan-hoi',p.id);
 for(const [k,s] of Object.entries(w.titleSeats||{}))for(const id of s.ids||[])if(real(w.players[id]))add(k,id);
 const topBy=(list,f,n=1,min=1)=>list.map(p=>[p,f(p)]).filter(([,v])=>v>=min).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([p])=>p.id);
 topBy(ps,p=>Number(p.bossWins)||0).forEach(id=>add('chien-than',id));
 topBy(ps,p=>(Number(p.reincarnations)||0)*1e15+(Number(p.totalQi)||0),3).forEach(id=>add('chan-truyen',id));
 topBy(ps,p=>Number(p.activeMs)||0,1,30*60000).forEach(id=>add('lao-lang',id));
 const bonds=p=>(p.bondIds||[]).length||(p.bondId?1:0);
 topBy(ps.filter(p=>p.gender==='nu'),bonds).forEach(id=>add('nu-khoi-tong-mon',id));
 topBy(ps.filter(p=>p.gender!=='nu'),bonds,1,2).forEach(id=>add('dao-hoa-vuong',id));
 topBy(ps,p=>p.flirtWeek?.wk===wk?p.flirtWeek.n:0,1,2).forEach(id=>add('cao-thu-tan-gai',id));
 topBy(ps,p=>p.chatWeek?.wk===wk?p.chatWeek.n:0,1,20).forEach(id=>add('lam-mom',id));
 caches.set(w,{at:now,map});return map;}

/** Các danh hiệu 1 người đang giữ, xếp theo rank. */
export function ownedTitles(w,p,now=Date.now()){if(!real(p))return [];const h=titleHolders(w,now);return TITLE_LIST.filter(t=>h.get(t.key)?.has(p.id));}
/** Danh hiệu đang hiện trên đầu (gửi overlay): {key,rank,group,sparkle?,n?} hoặc null. */
export function titleView(w,p,now=Date.now()){const own=ownedTitles(w,p,now);if(!own.length||p.titlePick==='off')return null;
 const t=own.find(x=>x.key===p.titlePick)||own[0];
 const v={key:t.key,rank:t.rank,group:t.group};if(t.group==='paid'&&(Number(p.giftCoins)||0)>=TITLE_SPARKLE_COINS)v.sparkle=1;if(t.key==='luan-hoi')v.n=Number(p.reincarnations)||1;
 // người đã chuyển sinh mà đang đeo danh hiệu khác → overlay vẫn vẽ thêm dòng Luân Hồi (luật 21/11)
 if(t.key!=='luan-hoi'&&own.some(x=>x.key==='luan-hoi'))v.lh=Number(p.reincarnations)||1;
 return v;}
/** Bảng "danh hiệu" (kind titles) cho overlay. */
export function titleCard(w,p,now=Date.now()){const own=ownedTitles(w,p,now),cur=titleView(w,p,now);
 return {kind:'titles',auto:!p.titlePick,off:p.titlePick==='off',current:cur?TITLE_BY_KEY[cur.key].name:null,
  items:own.map((t,i)=>({no:i+1,key:t.key,name:t.name,group:t.group,how:t.how,on:cur?.key===t.key}))};}
/** Lệnh "danh hiệu [số|tự động|ẩn]". Trả {ok,message,card?}. */
export function titleCommand(w,p,rest,now=Date.now()){
 if(!real(p))return {ok:false,message:'Danh hiệu dành cho đạo hữu trên LIVE.'};
 const own=ownedTitles(w,p,now),r=String(rest||'').trim();
 if(!r){const card=titleCard(w,p,now);return {ok:true,show:true,card,message:own.length?'Danh hiệu: '+own.map((t,i)=>(i+1)+'. '+t.name).join(' · ')+' • gõ danh hiệu + số để mặc':'Chưa có danh hiệu • giành ghế ở sự kiện, Thiên Bảng, đạo lữ…'};}
 if(['tu dong','tudong','auto'].includes(r)){delete p.titlePick;return {ok:true,message:'Tự đeo danh hiệu xịn nhất.'};}
 if(['an','tat','0','huy','off'].includes(r)){p.titlePick='off';return {ok:true,message:'Đã ẩn danh hiệu • gõ danh hiệu + số để đeo lại.'};}
 if(!/^[1-9][0-9]*$/.test(r))return {ok:false,message:'Gõ danh hiệu để xem, danh hiệu + số để mặc.'};
 const t=own[Number(r)-1];if(!t)return {ok:false,message:own.length?'Chỉ có '+own.length+' danh hiệu • gõ danh hiệu để xem số.':'Chưa có danh hiệu nào.'};
 p.titlePick=t.key;return {ok:true,message:'Đã mặc danh hiệu '+t.name+'.'};}
