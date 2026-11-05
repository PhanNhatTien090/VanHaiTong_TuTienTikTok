import {REBIRTH_UNLOCK_REALM,REALM_NAMES} from './public/progression.js';
export function rebirthCommand(w,p,rest,now){
 if(p.resident||p.puppet||p.realm<REBIRTH_UNLOCK_REALM)return {ok:false,message:'Chuyển sinh mở sau khi đạt '+REALM_NAMES[REBIRTH_UNLOCK_REALM]+'.'};
 if(w.race?.phase==='running'&&w.race.racers?.some(x=>x.id===p.id)||w.tournament?.phase==='running'&&w.tournament.participants?.includes(p.id))return {ok:false,message:'Chờ kết thúc lượt thi đấu để chuyển sinh.'};
 if(rest!=='xac nhan'&&rest!=='xacnhan'){
  p.rebirthConfirmation={realm:p.realm,until:now+30000};
  return {ok:true,pending:true,message:'Chuyển sinh sẽ về Phàm nhân, tu vi hiện tại về 0; giữ tổng tu vi, đồ, skin, VIP và đạo lữ. Gõ chuyển sinh xác nhận trong 30 giây nếu đồng ý.'};
 }
 if(p.rebirthConfirmation?.realm!==p.realm||now>=p.rebirthConfirmation.until)return {ok:false,message:'Gõ chuyển sinh trước để xem và xác nhận lại trong 30 giây.'};
 const visualFrom=structuredClone(p),spent=p.qi;
 p.highestRealm=Math.max(Number(p.highestRealm)||0,p.realm);p.reincarnations=(Number.isSafeInteger(p.reincarnations)&&p.reincarnations>=0?p.reincarnations:0)+1;
 p.rebirthQiSpent=(Number(p.rebirthQiSpent)||0)+spent;p.lastRebirthAt=now;p.realm=0;p.qi=0;p.readyRealm=null;
 delete p.rebirthConfirmation;delete p.novicePractice;
 // Preserve the daily ledger/cooldowns so reconnects or rebirths cannot refill a day's quota.
 return {ok:true,reborn:true,visualFrom,visualTo:structuredClone(p),message:'CHUYỂN SINH LẦN '+p.reincarnations+' • trở về Phàm nhân • hành trình mới bắt đầu'};
}
