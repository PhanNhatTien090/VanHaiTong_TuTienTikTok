import {SPECIAL_SKINS} from './public/patrons.js';
import {ALL_PETS} from './public/spirit-pets.js';
import {RACE_SWORD_SKINS} from './public/race-sword-skins.js';
export const MASTER_COINS=2000;
// 08/11/2026 (chủ game): skin mua trong sự kiện chỉ nhận qua sự kiện — Tông chủ không được cấp kèm.
export const MASTER_EXCLUDED_SKINS=new Set(['tudo-ma-ton','doraemon-avatar','sea-dragon-heir','khuy-niet-loi-ton','phan-thien-viem-ton']);
const real=p=>p&&!p.puppet&&!p.resident&&!p.webOnly&&!String(p.id).startsWith('puppet-');
export function masterGiftTotal(w,p){
 if(!real(p))return 0;if(Number.isFinite(p.masterGiftTotal))return p.masterGiftTotal;
 const edited=(w.adminLog||[]).some(r=>r.id===p.id&&r.changes?.some(s=>s.startsWith('coin quà ')));
 return edited?0:Math.max(0,Number(p.giftCoins)||0);
}
export function creditMasterGift(w,p,value){if(!real(p))return;p.masterGiftTotal=masterGiftTotal(w,p)+Math.max(0,Number(value)||0);}
// 07/11/2026 (chủ game): lên TÔNG CHỦ phải tặng MỘT món quà trị giá ≥2000 coin. Không tính tổng cộng dồn, không tính lịch sử.
export function unlockMasterLoadout(w,p,catalog,now=Date.now(),itemCoins=0){
 if(!real(p)||!(Number(itemCoins)>=MASTER_COINS))return false;
 const add=(key,ids)=>p[key]=[...new Set([...(p[key]||[]),...ids])];
 add('artifacts',catalog.filter(i=>i.type==='artifact').map(i=>i.id));add('manuals',catalog.filter(i=>i.type==='manual').map(i=>i.id));
 add('rewardSkins',SPECIAL_SKINS.filter(s=>!MASTER_EXCLUDED_SKINS.has(s.id)).map(s=>s.id));add('spiritPets',ALL_PETS.map(s=>s.id));add('raceSwordSkins',RACE_SWORD_SKINS.map(s=>s.id));
 p.sectMasterUnlocked=true;p.sectMasterUnlockedAt??=now;p.sectMasterGiftAt=now;p.sectMasterGiftCoins=Math.max(Number(p.sectMasterGiftCoins)||0,Number(itemCoins));
 return true;
}
// Gỡ danh hiệu Tông chủ đã mở theo luật cũ (tổng cộng dồn / lịch sử). Giữ nguyên đồ đã nhận. Chạy 1 lần.
export function resetHistoricMasters(w){if((w.masterRuleVersion||0)>=2)return 0;let n=0;for(const p of Object.values(w.players||{}))if(p.sectMasterUnlocked&&!p.sectMasterGiftAt){delete p.sectMasterUnlocked;delete p.sectMasterUnlockedAt;n++;}w.masterRuleVersion=2;return n;}
export function giftMasterView(players,host={},seatId=null){
 // 15/11: chủ GHẾ (thắng tranh ghế / đại lễ) ngồi khi có mặt; vắng thì người có danh hiệu tặng gần nhất ngồi tạm.
 const here=players.filter(p=>real(p)&&p.active&&p.sectMasterUnlocked&&p.sectMasterGiftAt);
 const p=here.find(x=>x.id===seatId)||here.sort((a,b)=>(b.sectMasterGiftAt||0)-(a.sectMasterGiftAt||0)||String(a.id).localeCompare(String(b.id)))[0];
 if(p)return {enabled:true,source:'gift',userId:p.id,name:p.name,player:p,active:false};
 /* 10/11: ghế Tông chủ của chủ kênh vẽ đúng nhân vật + tên của tài khoản đã đặt, không dùng ảnh Tông chủ chung */
 const own=host?.userId&&players.find(x=>x.id===host.userId);return own?{...host,name:own.name,player:own}:host;
}
