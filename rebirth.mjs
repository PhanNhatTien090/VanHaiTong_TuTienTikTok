import {REBIRTH_UNLOCK_REALM,REALM_NAMES} from './public/progression.js';
import {LUAN_HOI,DAO_QUA,daoQuaDef,daoPoints,daoFree,rebirths,combatRealm,luanHoiTitle} from './public/luan-hoi-data.js';
// 18/11: phải ĐẦY cây tu vi của cảnh giới cuối mới được chuyển sinh (need = requiredQi(p) do engine truyền vào).
// 18/11 tối: LUÂN HỒI — chuyển sinh có thưởng vĩnh viễn (public/luan-hoi-data.js) + màn chiếu riêng (public/luan-hoi-cinema.js).
export const LUAN_HOI_CUT_MS=26000,LUAN_HOI_CUT_LEAD=1500,REBIRTH_CONFIRM_MS=120000;
const vn=n=>Math.floor(Number(n)||0).toLocaleString('vi-VN');
const pct=x=>Math.round(x*100)+'%';
export const rebirthQiFull=(p,need)=>Number(p.qi)>=Number(need);
export function rebirthCommand(w,p,rest,now,need=0){
 if(p.resident||p.puppet||p.realm<REBIRTH_UNLOCK_REALM)return {ok:false,message:'Chuyển sinh mở sau khi đạt '+REALM_NAMES[REBIRTH_UNLOCK_REALM]+'.'};
 if(!rebirthQiFull(p,need))return {ok:false,message:'Chuyển sinh cần đầy tu vi '+REALM_NAMES[REBIRTH_UNLOCK_REALM]+': '+vn(p.qi)+'/'+vn(need)+' ('+Math.floor(Number(p.qi)/need*100)+'%).'};
 if(w.race?.phase==='running'&&w.race.racers?.some(x=>x.id===p.id)||w.tournament?.phase==='running'&&w.tournament.participants?.includes(p.id))return {ok:false,message:'Chờ kết thúc lượt thi đấu để chuyển sinh.'};
 // 21/11: người chơi gõ "chuyển sinh" 3 lần (cách nhau 1–2 phút vì bình luận LIVE trễ) mà không ai gõ đủ "xác nhận" → không chuyển sinh được.
 // Giờ: gõ "chuyển sinh" LẦN NỮA trong 2 phút (cách lần đầu ≥2 s) = xác nhận; "chuyển sinh xác nhận" vẫn dùng được.
 const pend=p.rebirthConfirmation,armed=pend?.realm===p.realm&&now<pend.until;
 const confirm=rest==='xac nhan'||rest==='xacnhan'||(!rest&&armed&&now-(pend.at??pend.until-REBIRTH_CONFIRM_MS)>=2000);
 if(!confirm){
  if(armed)return {ok:true,pending:true,repeat:true,message:'Đang chờ xác nhận Luân Hồi • gõ chuyển sinh lần nữa để bắt đầu.'};
  p.rebirthConfirmation={realm:p.realm,at:now,until:now+REBIRTH_CONFIRM_MS};
  const n=rebirths(p)+1;
  return {ok:true,pending:true,message:'LUÂN HỒI lần '+n+': về Phàm nhân, tu vi hiện tại về 0; giữ tổng tu vi, đồ, skin, VIP, đạo lữ. Nhận vĩnh viễn: tu luyện +'+pct(Math.min(LUAN_HOI.handQiMax,n*LUAN_HOI.handQiPer))+', Luân Hồi Ấn (đánh như '+REALM_NAMES[Math.floor(Math.max(p.realm,p.highestRealm||0)*LUAN_HOI.keepRealm)]+'), cảnh giới cũ chỉ cần '+pct(LUAN_HOI.pastLifeCost)+' tu vi, +1 Đạo Quả. Gõ chuyển sinh LẦN NỮA trong 2 phút để xác nhận.'};
 }
 if(p.rebirthConfirmation?.realm!==p.realm||now>=p.rebirthConfirmation.until)return {ok:false,message:'Gõ chuyển sinh để xem, rồi gõ lần nữa trong 2 phút để xác nhận.'};
 const visualFrom=structuredClone(p),spent=p.qi;
 p.highestRealm=Math.max(Number(p.highestRealm)||0,p.realm);p.reincarnations=(Number.isSafeInteger(p.reincarnations)&&p.reincarnations>=0?p.reincarnations:0)+1;
 p.rebirthQiSpent=(Number(p.rebirthQiSpent)||0)+spent;p.lastRebirthAt=now;p.realm=0;p.qi=0;p.readyRealm=null;
 delete p.rebirthConfirmation;delete p.novicePractice;
 // Preserve the daily ledger/cooldowns so reconnects or rebirths cannot refill a day's quota.
 return {ok:true,reborn:true,visualFrom,visualTo:structuredClone(p),message:luanHoiTitle(p.reincarnations).toUpperCase()+' • Niết Bàn trùng sinh • gõ daoqua để lĩnh ngộ Đạo Quả'};
}
const DAO_ALIAS={kiem:'kiem',kiemdao:'kiem',the:'the',thedao:'the',dan:'dan',dandao:'dan',phuc:'phuc',phucdao:'phuc',1:'kiem',2:'the',3:'dan',4:'phuc'};
export function daoQuaCommand(p,rest){
 if(p.resident||p.puppet)return {ok:false,message:'Đạo Quả chỉ dành cho người đã chuyển sinh.'};
 if(rebirths(p)<=0)return {ok:false,message:'Đạo Quả mở sau lần chuyển sinh đầu tiên.'};
 const key=String(rest||'').replace(/\s+/g,''),id=DAO_ALIAS[key];
 const list=DAO_QUA.map((d,i)=>(i+1)+'.'+d.name+' '+daoPoints(p,d.id)+'/'+LUAN_HOI.daoCap).join(' · ');
 if(!id)return {ok:true,message:'Đạo Quả còn '+daoFree(p)+' điểm • '+list+' • gõ daoqua kiem / the / dan / phuc'};
 const d=daoQuaDef(id);
 if(daoFree(p)<=0)return {ok:false,message:'Chưa có điểm Đạo Quả • chuyển sinh thêm để lĩnh ngộ.'};
 if(daoPoints(p,id)>=LUAN_HOI.daoCap)return {ok:false,message:d.name+' đã viên mãn ('+LUAN_HOI.daoCap+'/'+LUAN_HOI.daoCap+') • chọn Đạo khác.'};
 p.daoQua={...(p.daoQua||{}),[id]:daoPoints(p,id)+1};
 return {ok:true,chosen:id,message:'Lĩnh ngộ '+d.name+' tầng '+p.daoQua[id]+' • '+d.text};
}
export function luanHoiStatus(p){
 const n=rebirths(p);if(!n)return 'Chưa chuyển sinh • đầy tu vi '+REALM_NAMES[REBIRTH_UNLOCK_REALM]+' thì gõ chuyển sinh.';
 return luanHoiTitle(n)+' • tu luyện +'+pct(Math.min(LUAN_HOI.handQiMax,n*LUAN_HOI.handQiPer))+' • Luân Hồi Ấn: '+REALM_NAMES[combatRealm(p)]+' • Lôi Đài hộ thể +'+pct(Math.min(LUAN_HOI.hpMax,n*LUAN_HOI.hpPer))+' • Đạo Quả còn '+daoFree(p)+' điểm';
}
