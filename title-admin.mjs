// 21/11/2026 tối (chủ game): tab QUẢN LÝ DANH HIỆU trên trang quản lý — xem điều kiện từng danh hiệu (có số thật, chỉ trang quản lý),
// ai đang giữ (tự tính hay gán tay, còn bao lâu) và GÁN cho người bất kỳ có thời hạn. Overlay/người xem không thấy trang này.
// Server: GET/POST /api/title-admin (server.mjs gọi titleAdminRoute). Giao diện: public/admin/title-admin.js.
import {TITLE_LIST,TITLE_BY_KEY,TITLE_SPARKLE_COINS,PAID_MIN_COINS} from './public/title-data.js';
import {titleHolders,activeGrants,grantTitle,revokeTitle} from './titles.mjs';

const C=n=>Number(n).toLocaleString('vi-VN');
// Điều kiện chi tiết cho chủ game (khớp code titles.mjs). keep = danh hiệu tự tính giữ tới khi nào.
export const TITLE_RULES=Object.freeze({
 'tong-chu':{rule:'Người GẦN NHẤT tặng một món ≥2.000 coin (Vương Miện)',keep:'Tới khi người khác tặng Vương Miện'},
 'than-tai':{rule:'Hạng 1 tổng quà (tối thiểu '+C(PAID_MIN_COINS)+' coin). ≥'+C(TITLE_SPARKLE_COINS)+' coin thì chữ lấp lánh',keep:'Tới khi bị vượt tổng quà'},
 'dai-gia':{rule:'Hạng 2–3 tổng quà (tối thiểu '+C(PAID_MIN_COINS)+' coin)',keep:'Tới khi bị vượt tổng quà'},
 'nha-giau':{rule:'Hạng 4–10 tổng quà (tối thiểu '+C(PAID_MIN_COINS)+' coin)',keep:'Tới khi bị vượt tổng quà'},
 'phu-ho':{rule:'Hạng 11 trở đi, tổng quà ≥'+C(PAID_MIN_COINS)+' coin',keep:'Vĩnh viễn (lên hạng thì đổi danh hiệu)'},
 'luan-hoi':{rule:'Đã chuyển sinh ít nhất 1 lần',keep:'Vĩnh viễn'},
 'ma-dao-vuong':{rule:'Hạng 1 phe Ma, trận Chính Ma gần nhất',keep:'Tới trận Chính Ma sau'},
 'doc-vuong':{rule:'Hạng 2 phe Ma, trận Chính Ma gần nhất',keep:'Tới trận Chính Ma sau'},
 'chinh-dao-minh-chu':{rule:'Hạng 1 phe Chính, trận Chính Ma gần nhất',keep:'Tới trận Chính Ma sau'},
 'loi-dai-ba-chu':{rule:'Đài Chủ lúc Lôi Đài khép lại (không tính trận tranh ghế Tông Chủ / thách Trưởng Lão)',keep:'Tới lượt Lôi Đài sau'},
 'than-tien-quyen-lu':{rule:'Cặp làm Đại Điển ở Tình Lâu gần nhất (cả 2 người)',keep:'Tới Đại Điển sau'},
 'nu-khoi-tong-mon':{rule:'Nữ có nhiều đạo lữ nhất (≥1)',keep:'Tới khi có người nhiều hơn'},
 'dao-hoa-vuong':{rule:'Nam có nhiều đạo lữ nhất (≥2)',keep:'Tới khi có người nhiều hơn'},
 'chien-than':{rule:'Thắng boss nhiều lần nhất (tổng)',keep:'Tới khi có người nhiều hơn'},
 'kiem-khoi':{rule:'Vô địch Luận Kiếm gần nhất',keep:'Tới giải Luận Kiếm sau'},
 'than-luyen-dan':{rule:'Top 1 Lò Đan gần nhất',keep:'Tới lượt Lò Đan sau'},
 'ho-dao-vuong':{rule:'Hộ đạo nhiều nhất Độ Kiếp gần nhất',keep:'Tới Độ Kiếp sau'},
 'vua-me-cung':{rule:'Về nhất Mê Cung gần nhất',keep:'Tới lượt Mê Cung sau'},
 'ke-no-lo':{rule:'Người làm nổ Lò Đan gần nhất',keep:'Tới lần nổ lò sau'},
 'vua-go-dau':{rule:'Gõ nhiều nhất Hội Gõ Đầu gần nhất',keep:'Tới Hội Gõ Đầu sau'},
 'dau-sat':{rule:'Bị gõ nhiều nhất Hội Gõ Đầu gần nhất',keep:'Tới Hội Gõ Đầu sau'},
 'chan-truyen':{rule:'Top 3 tu vi tông môn (người chuyển sinh xếp trước)',keep:'Tới khi bị vượt'},
 'cao-thu-tan-gai':{rule:'Mời kết duyên nhiều nhất trong tuần (≥2 lời mời)',keep:'Hết tuần (thứ Hai làm lại)'},
 'lao-lang':{rule:'Thời gian có mặt tu luyện nhiều nhất (≥30 phút)',keep:'Tới khi có người nhiều hơn'},
 'lam-mom':{rule:'Bình luận thường nhiều nhất trong tuần (≥20; không tính lệnh, đoán câu đố, dồn trong 2 s)',keep:'Hết tuần (thứ Hai làm lại)'},
});
const real=p=>p&&!p.resident&&!p.puppet;
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/\s+/g,' ').trim();
const person=(w,id)=>{const p=w.players[id];return {id,name:p?.name||id,code:p?.socialCode||'',realm:p?.realm??0,gift:Number(p?.giftCoins)||0,pick:p?.titlePick||null};};

/** Tìm người: đúng id / mã kết duyên / tên đầy đủ, rồi tên chứa chuỗi (phải duy nhất). */
export function findTitlePlayer(w,q){
 const raw=String(q||'').trim();if(!raw)return {error:'Nhập tên, mã hoặc id người chơi.'};
 if(w.players[raw]&&real(w.players[raw]))return {player:w.players[raw]};
 const k=norm(raw).replace(/^@/,''),all=Object.values(w.players).filter(real);
 const exact=all.filter(p=>norm(p.socialCode)===k||norm(p.name)===k||norm(p.handle)===k);
 if(exact.length===1)return {player:exact[0]};
 const part=exact.length?exact:all.filter(p=>norm(p.name).includes(k)||norm(p.handle).includes(k));
 if(part.length===1)return {player:part[0]};
 if(!part.length)return {error:'Không thấy người chơi "'+raw.slice(0,30)+'".'};
 return {error:'Có '+part.length+' người khớp — chọn đúng người.',candidates:part.sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,8).map(p=>person(w,p.id))};
}

export function titleAdminView(w,now=Date.now()){
 const h=titleHolders(w,now),grants=activeGrants(w,now);
 return {now,titles:TITLE_LIST.map(t=>{
  const g=grants.filter(x=>x.key===t.key),gIds=new Set(g.map(x=>x.id));
  const holders=[...(h.get(t.key)||[])].map(id=>{const x=g.find(y=>y.id===id);return {...person(w,id),source:x?'grant':'auto',until:x?x.until:null,at:x?.at||null,wearing:w.players[id]?.titlePick===t.key};});
  // người được gán mà cũng tự đạt → vẫn hiện "gán tay" (gỡ gán thì còn ghế tự tính)
  return {key:t.key,name:t.name,group:t.group,rank:t.rank,how:t.how,...(TITLE_RULES[t.key]||{}),holders,granted:g.length,autoHeld:holders.filter(x=>!gIds.has(x.id)).length};
 })};
}

/** POST: {action:'grant',key,who,minutes(0=vĩnh viễn),wear} · {action:'revoke',key,id} · {action:'find',who}. */
export function titleAdminAction(w,b,now=Date.now()){
 const act=b?.action;
 if(act==='find'){const r=findTitlePlayer(w,b.who);return r.player?{ok:true,player:person(w,r.player.id)}:{ok:false,message:r.error,candidates:r.candidates||[]};}
 if(!TITLE_BY_KEY[b?.key])return {ok:false,message:'Danh hiệu không tồn tại.'};
 const t=TITLE_BY_KEY[b.key];
 if(act==='grant'){
  const r=findTitlePlayer(w,b.who);if(!r.player)return {ok:false,message:r.error,candidates:r.candidates||[]};
  const min=Number(b.minutes);if(!Number.isFinite(min)||min<0||min>60*24*3650)return {ok:false,message:'Thời hạn không hợp lệ.'};
  const p=r.player,g=grantTitle(w,t.key,p.id,now,Math.round(min*60000));if(!g)return {ok:false,message:'Không gán được.'};
  if(b.wear!==false)p.titlePick=t.key; // mặc luôn để hiện trên đầu
  w.adminLog??=[];w.adminLog.push({at:now,id:p.id,changes:['danh hiệu '+t.name+(g.until?' tới '+new Date(g.until).toISOString():' vĩnh viễn')]});if(w.adminLog.length>300)w.adminLog.splice(0,w.adminLog.length-300);
  return {ok:true,message:'Đã gán '+t.name+' cho '+p.name+(g.until?' trong '+fmtDur(g.until-now):' vĩnh viễn')+(b.wear!==false?' · đang đeo':''),grant:g};
 }
 if(act==='revoke'){
  const p=w.players[b.id];if(!revokeTitle(w,t.key,b.id))return {ok:false,message:'Người này không có danh hiệu gán tay '+t.name+' (danh hiệu tự tính không gỡ được ở đây).'};
  if(p?.titlePick===t.key)delete p.titlePick;
  return {ok:true,message:'Đã gỡ '+t.name+(p?' khỏi '+p.name:'')};
 }
 return {ok:false,message:'Thao tác không hợp lệ.'};
}
export function fmtDur(ms){const m=Math.round(ms/60000);if(m<60)return m+' phút';const h=Math.round(m/60);if(h<48)return h+' giờ';return Math.round(h/24)+' ngày';}
