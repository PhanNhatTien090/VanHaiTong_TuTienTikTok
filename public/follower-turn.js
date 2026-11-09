// 09/11/2026 (chủ game): pháp bảo và linh thú KHÔNG hiện cùng lúc — thay phiên theo giờ thật (mọi máy cùng lượt), cho đỡ lag.
// Pháp bảo đứng yên cạnh vai, chỉ nhích lên xuống nhẹ (bỏ bay vòng vòng).
export const FOLLOWER_TURN_MS=7.5*60000;
export function followerTurn(now=Date.now()){return Math.floor(now/FOLLOWER_TURN_MS)%2===0?'relic':'pet';}
export const relicTurn=(now=Date.now())=>followerTurn(now)==='relic';
// Linh Thú Cốc đang mở thì linh thú luôn hiện (sự kiện cần thấy thú).
export const petTurn=(now=Date.now(),petCove=false)=>petCove||followerTurn(now)==='pet';
// Nhích lên xuống ~3 px, lệch pha theo người để cả sân không nhún đồng loạt.
export function relicBob(t,id='',motion=true){if(!motion)return 0;let h=0;for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))>>>0;return Math.sin(t*.0022+(h%628)/100)*3;}
