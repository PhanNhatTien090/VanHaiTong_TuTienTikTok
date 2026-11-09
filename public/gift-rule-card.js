// 08/11/2026 tối: THẺ LUẬT QUÀ luôn hiện ở góc sân — người xem nhìn là biết tặng quà gì thì được gì, theo đúng sự kiện đang mở.
// Chỉ nói việc quà làm trong game (không "nạp", không số coin): ảnh quà thật × số lượng → kết quả.
// Số liệu khớp server: đua 30 trượng/coin (sword-race.mjs), Chính Ma 3 đơn vị × 0,85 × 20 trượng/coin (sect-war.mjs),
// luyện đan ≤4 coin hạ nhiệt · 5–98 thêm linh dược · ≥99 đại hỏa (alchemy.mjs), mưa hoa 100 điểm/coin, quà ≥500 lúc không sự kiện = đại lễ.
import {giftTokenHTML} from './gift-icons.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Math.round(Number(n)||0).toLocaleString('vi-VN');
const live=(e,now)=>e&&!e.closedAt&&now>=(e.startedAt||0)&&now<e.endsAt;
export const RACE_TRUONG_PER_COIN=30,WAR_TRUONG_PER_COIN=Math.round(3*.85*20);

// → {kind,title,tone,rows:[[coins,text]],note} hoặc null (không hiện khi sự kiện đã có bảng quà riêng, vd. tiên nhân truyền đạo).
export function giftRules(s,now=s?.serverNow||Date.now()){
 if(!s)return null;
 const race=s.raceStatus,war=s.sectWar,alc=s.alchemy;
 if(race&&['registration','running'].includes(race.phase))return race.phase==='running'
  ?{kind:'race',title:'ĐUA PHI KIẾM',tone:'sky',rows:[[1,`+${RACE_TRUONG_PER_COIN} trượng bứt tốc`],[30,`+${fmt(30*RACE_TRUONG_PER_COIN)} trượng`],[100,`+${fmt(100*RACE_TRUONG_PER_COIN)} trượng`]],note:'quà của người đang bay · top quà nhận vật cưỡi'}
  :{kind:'race',title:'ĐUA PHI KIẾM · TUYỂN',tone:'sky',rows:[[1,'cộng điểm quà đua'],[100,'top 3 quà nhận vật cưỡi']],note:'gõ bay để vào đường đua'};
 if(war?.active&&war.phase==='running')return {kind:'war',title:'CHÍNH MA ĐẠI CHIẾN',tone:'war',rows:[[1,`đẩy ~${WAR_TRUONG_PER_COIN} trượng`],[5,`đẩy ~${fmt(5*WAR_TRUONG_PER_COIN)} trượng`],[99,'sóng thần năng lượng']],note:'mỗi phe tối đa ~612 trượng quà / 30 giây'};
 if(war?.active&&war.phase==='registration')return null;
 if(alc?.active&&alc.phase==='opening')return {kind:'alchemy',title:'LÒ LUYỆN ĐAN · MỞ LÒ',tone:'fire',rows:[[1,'góp dược liệu vào lò']],note:'quà góp càng nhiều, đan càng tốt'};
 if(alc?.active&&alc.phase==='brewing')return {kind:'alchemy',title:'LÒ LUYỆN ĐAN',tone:'fire',rows:[[1,'hạ nhiệt lò'],[20,'thêm linh dược'],[99,'đại hỏa 10 giây']],note:'giữ lửa trong vùng xanh'};
 if(alc?.active&&alc.phase==='tribulation')return {kind:'alchemy',title:'ĐAN KIẾP',tone:'fire',rows:[[1,'dựng khiên chắn kiếp'],[20,'khiên dày hơn']],note:'giữ khiên tới khi kiếp tan'};
 if(live(s.flowerEvent,now)){const meteor=s.flowerEvent.kind==='meteor';return {kind:'flower',title:meteor?'SAO BĂNG':'MƯA HOA',tone:meteor?'sky':'pink',rows:[[1,'+100 điểm'],[30,'+3.000 điểm']],note:'top 3 nhận pháp bảo'};}
 if(live(s.opportunity,now)){const cost=s.opportunity.costs?.[0]||10;return {kind:'opportunity',title:'CƠ DUYÊN',tone:'gold',rows:[[1,'+1 điểm cơ duyên'],[cost,'đủ điểm tự đột phá']],note:'điểm dư được giữ qua ngày'};}
 const pe=s.petEvent;if(pe?.active){const paid=(pe.rules||[]).filter(r=>r.coins>0).slice(-2);return {kind:'pets',title:'LINH THÚ CỐC',tone:'jade',rows:paid.map(r=>[r.coins,'kết bạn '+r.name]),note:'thả tim cũng mở linh thú thường'};}
 if(live(s.visitor,now))return null; // bảng tiên nhân đã có ảnh quà → skin riêng
 // không sự kiện: quà mặc định
 // 2000 = 1 món Vương miện 2000 coin: Tông chủ cần MỘT món ≥2000 (master-rewards.mjs), không cộng dồn. Ảnh thật tự thay khi kênh nhận quà này (giftArt theo tên+giá).
 return {kind:'default',title:'TẶNG QUÀ',tone:'gold',rows:[[1,'+tu vi · phúc duyên'],[99,'+pháp bảo Tụ Linh'],[500,'ĐẠI LỄ'],[2000,'TÔNG CHỦ · mở hết đồ']],note:'Đại lễ: +50% tu vi + skin · Tông chủ: 1 món, không cộng dồn'};
}
export function giftRuleHTML(r,art){
 if(!r||!r.rows.length)return ''; // 08/11 tối: thẻ chỉ ảnh quà → kết quả, không ghi chú (chủ game: đơn giản, ai hỏi thì trả lời)
 return `<b class="grc-title">${esc(r.title)}</b>${r.rows.map(([coins,text])=>`<span class="grc-row"><span class="grc-gift">${giftTokenHTML(art,coins)}</span><i>→</i><em>${esc(text)}</em></span>`).join('')}`;
}
