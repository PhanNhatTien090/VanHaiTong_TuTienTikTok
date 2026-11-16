// 09/11/2026 (chủ game): pháp bảo và linh thú KHÔNG hiện cùng lúc — thay phiên theo giờ thật (mọi máy cùng lượt), cho đỡ lag.
// 15/11/2026 (chủ game): linh thú là chủ chốt → thú hiện gần như suốt; pháp bảo chỉ ló 1 phút trong mỗi 10 phút.
// Pháp bảo đứng yên cạnh vai, chỉ nhích lên xuống nhẹ (bỏ bay vòng vòng).
export const FOLLOWER_TURN_MS=10*60000;
export const RELIC_CAMEO_MS=60000;
export function followerTurn(now=Date.now()){return ((now%FOLLOWER_TURN_MS)+FOLLOWER_TURN_MS)%FOLLOWER_TURN_MS<RELIC_CAMEO_MS?'relic':'pet';}
export const relicTurn=(now=Date.now())=>followerTurn(now)==='relic';
// Linh Thú Cốc đang mở thì linh thú luôn hiện (sự kiện cần thấy thú).
export const petTurn=(now=Date.now(),petCove=false)=>petCove||followerTurn(now)==='pet';
// Nhích lên xuống ~3 px, lệch pha theo người để cả sân không nhún đồng loạt.
export function relicBob(t,id='',motion=true){if(!motion)return 0;let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return Math.sin(t*.0022+(h%628)/100)*3;}
// 16/11/2026 (chủ game, giảm lag): mỗi người một nhịp riêng, lệch giờ nhau → lúc nào cũng chỉ một phần nhỏ sân có thú/pháp bảo.
// Linh thú "ghé thăm": chạy vào 5 s → đi lại quanh chủ → nằm nghỉ → chạy đi 5 s → vắng mặt. Chu kỳ 6 phút, hiện ~100 s.
// Pháp bảo: ló 40 s mỗi 12 phút. Không bao giờ trùng lúc linh thú đang ghé.
const hashId=id=>{let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
export const PET_VISIT_MS=6*60000,PET_ENTER_MS=5000,PET_STAY_MS=90000,PET_REST=[30000,70000];
export const RELIC_VISIT_MS=12*60000,RELIC_SHOW_MS=40000;
const cycleAt=(now,id,period)=>{const u=(now+hashId(id)%period)%period;return u<0?u+period:u;};
export function petVisit(id,now=Date.now()){
 const u=cycleAt(now,id,PET_VISIT_MS),stayEnd=PET_ENTER_MS+PET_STAY_MS,end=stayEnd+PET_ENTER_MS,dir=hashId(id)%2?1:-1;
 if(u>=end)return {on:false};
 if(u<PET_ENTER_MS)return {on:true,phase:'enter',k:u/PET_ENTER_MS,dir};
 if(u>=stayEnd)return {on:true,phase:'leave',k:(u-stayEnd)/PET_ENTER_MS,dir};
 const s=u-PET_ENTER_MS;return {on:true,phase:s>=PET_REST[0]&&s<PET_REST[1]?'rest':'stay',k:1,dir};
}
export function relicVisit(id,now=Date.now()){
 if(petVisit(id,now).on)return false;
 // pháp bảo lệch nửa chu kỳ so với linh thú của cùng người
 return cycleAt(now+RELIC_VISIT_MS/2,id,RELIC_VISIT_MS)<RELIC_SHOW_MS;
}
