// 18/11/2026 — LUÂN HỒI (chuyển sinh có giá trị thật). Dùng chung server + overlay. Kế hoạch: docs/ghi-chu/LUAN-HOI-PLAN-2026-11-18.md
// Luật cân bằng (chủ game 18/11): hệ số tu vi CHỈ nhân khi tự tu luyện (chơi tay); quà/sự kiện = số gốc.
export const LUAN_HOI=Object.freeze({
 keepRealm:.6,      // Luân Hồi Ấn: sức chiến đấu tính theo max(cảnh giới hiện tại, 60% cảnh giới cao nhất từng đạt)
 pastLifeCost:.6,   // Ký ức tiền kiếp: cảnh giới đã từng vượt chỉ cần 60% tu vi + linh thạch
 handQiPer:.15,handQiMax:.75, // Luân Hồi tâm pháp: tu luyện tay +15%/lần, tối đa +75% (5 lần)
 hpPer:.04,hpMax:.2,          // Lôi Đài: hộ thể (chia sát thương nhận) +4%/lần, tối đa +20%
 daoCap:3,                    // mỗi Đạo Quả tối đa 3 điểm
});
// Đạo Quả: mỗi lần chuyển sinh được 1 điểm, gõ "daoqua <tên>" để lĩnh ngộ.
export const DAO_QUA=Object.freeze([
 {id:'kiem',name:'Kiếm Đạo',icon:'⚔',color:'#8fd8ff',per:.04,text:'Lôi Đài: sát thương +4%/điểm'},
 {id:'the',name:'Thể Đạo',icon:'⛰',color:'#ffb46b',per:.05,text:'Lôi Đài: hộ thể +5%/điểm (giảm sát thương nhận)'},
 {id:'dan',name:'Đan Đạo',icon:'☯',color:'#9dff9a',per:.08,text:'Tu luyện tay: tu vi +8%/điểm'},
 {id:'phuc',name:'Phúc Đạo',icon:'✿',color:'#ff9ad8',per:.12,text:'Tu luyện tay: linh thạch +12%/điểm'},
]);
export const daoQuaDef=id=>DAO_QUA.find(d=>d.id===id)||null;
const n0=v=>{const x=Math.floor(Number(v)||0);return x>0?x:0;};
export const rebirths=p=>n0(p?.reincarnations);
export const highestRealmOf=p=>Math.max(n0(p?.highestRealm),n0(p?.realm));
/** Cảnh giới dùng cho sức chiến đấu (Lôi Đài, Tháp, power). */
export const combatRealm=p=>{const r=n0(p?.realm);return rebirths(p)>0?Math.max(r,Math.floor(n0(p.highestRealm)*LUAN_HOI.keepRealm)):r;};
/** Đang đi lại cảnh giới đã từng vượt ở kiếp trước. */
export const pastLifeRealm=p=>rebirths(p)>0&&n0(p?.realm)<n0(p?.highestRealm);
export const pastLifeCost=p=>pastLifeRealm(p)?LUAN_HOI.pastLifeCost:1;
export const daoPoints=(p,id)=>Math.min(LUAN_HOI.daoCap,n0(p?.daoQua?.[id]));
export const daoSpent=p=>DAO_QUA.reduce((s,d)=>s+daoPoints(p,d.id),0);
export const daoFree=p=>Math.max(0,rebirths(p)-daoSpent(p));
/** Hệ số tu luyện tay (chỉ áp khi hand). */
export const luanHoiHandQi=p=>1+Math.min(LUAN_HOI.handQiMax,rebirths(p)*LUAN_HOI.handQiPer)+daoPoints(p,'dan')*daoQuaDef('dan').per;
export const luanHoiHandStones=p=>1+daoPoints(p,'phuc')*daoQuaDef('phuc').per;
export const luanHoiArenaHp=p=>1+Math.min(LUAN_HOI.hpMax,rebirths(p)*LUAN_HOI.hpPer)+daoPoints(p,'the')*daoQuaDef('the').per;
export const luanHoiArenaAtk=p=>1+daoPoints(p,'kiem')*daoQuaDef('kiem').per;
// Bậc hào quang / huy hiệu theo số lần chuyển sinh.
export const LUAN_HOI_TIERS=Object.freeze([
 {min:1,name:'Sơ Luân',main:'#ffcc80',soft:'#fff1d6',deep:'#3a2200'},
 {min:2,name:'Nhị Luân',main:'#7fd6ff',soft:'#d8f4ff',deep:'#0b3550'},
 {min:3,name:'Tam Luân',main:'#5f8bff',soft:'#cdd9ff',deep:'#101c4a'},
 {min:5,name:'Ngũ Luân',main:'#b77bff',soft:'#ead8ff',deep:'#2a0e4a'},
 {min:10,name:'Thập Luân',main:'#ffd36b',soft:'#fff3c4',deep:'#4a3000'},
]);
export const luanHoiTier=n=>{let t=null;for(const x of LUAN_HOI_TIERS)if(n>=x.min)t=x;return t;};
const CN=['','Nhất','Nhị','Tam','Tứ','Ngũ','Lục','Thất','Bát','Cửu','Thập'];
export const luanHoiTitle=n=>n<=0?'':n<=10?CN[n]+' Thế Luân Hồi':n+' Thế Luân Hồi';
