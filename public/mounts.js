// 16/11/2026 (chủ game): TỌA KỴ — hệ riêng (không phải phi kiếm / vật cưỡi đua). Ngồi trên tọa kỵ khi tu luyện, lên Lôi Đài.
// Nhận Linh Châu (xanh/tím/vàng) từ Tọa Kỵ Bí Cảnh → gõ "truyencong" trả linh thạch, truyền công đủ giờ thì châu vỡ, tọa kỵ hiện thân.
// Dữ liệu dùng chung server + overlay. Ảnh: /assets/toa-ky-v1/mounts-{a,b,c,d}.png (3 ô/tấm, Codex image_gen 16/11).
// Chỉ số (sao 1, phần trăm): arena = sức mạnh tỷ thí, war = trượng Chính Ma, race = tốc độ đua, stones = linh thạch, qi = tu luyện tay.
// KHÔNG hiện tỉ lệ ra LIVE (user chốt 16/11) — bảng ODDS chỉ nằm trong mounts.mjs phía server.
export const MOUNT_TIERS=Object.freeze({
 common:{name:'Thường',color:'#7fe3ff'},
 vip:{name:'VIP',color:'#c79bff'},
 divine:{name:'Thần',color:'#ffd36b'}});
export const MOUNTS=Object.freeze([
 {id:'can-dau-van',name:'Cân Đẩu Vân',tier:'common',sheet:'a',cell:0,deck:.42,width:210,stats:{race:4}},
 {id:'phieu-diep',name:'Phiêu Diệp',tier:'common',sheet:'a',cell:1,deck:.42,width:200,stats:{stones:8}},
 {id:'moc-lan-chu',name:'Mộc Lan Chu',tier:'common',sheet:'a',cell:2,deck:.45,width:220,stats:{war:4}},
 {id:'thanh-lan-xa',name:'Thanh Lân Xà',tier:'common',sheet:'b',cell:0,deck:.45,width:210,stats:{arena:3}},
 {id:'kim-giap-trung',name:'Kim Giáp Trùng',tier:'common',sheet:'b',cell:1,deck:.38,width:200,stats:{stones:5,arena:2}},
 {id:'that-thai-tuong-van',name:'Thất Thải Tường Vân',tier:'vip',sheet:'b',cell:2,deck:.38,width:230,stats:{race:6,stones:10,qi:2}},
 {id:'luu-ly-hoa-thuyen',name:'Lưu Ly Họa Thuyền',tier:'vip',sheet:'c',cell:0,deck:.5,width:240,stats:{war:7,stones:10,qi:2}},
 {id:'huyen-minh-cu-mang',name:'Huyền Minh Cự Mãng',tier:'vip',sheet:'c',cell:1,deck:.42,width:250,stats:{arena:6,war:5,qi:2}},
 {id:'cuu-thien-thanh-long',name:'Cửu Thiên Thanh Long',tier:'divine',sheet:'c',cell:2,deck:.4,width:260,stats:{arena:8,war:8,race:8,stones:8,qi:4}},
 {id:'con-bang',name:'Côn Bằng',tier:'divine',sheet:'d',cell:0,deck:.45,width:260,stats:{arena:8,war:8,race:8,stones:15,qi:4}}]);
export const MOUNT_SHEETS=Object.freeze({a:'/assets/toa-ky-v1/mounts-a.png',b:'/assets/toa-ky-v1/mounts-b.png',c:'/assets/toa-ky-v1/mounts-c.png',d:'/assets/toa-ky-v1/mounts-d.png'});
// Linh Châu: giá linh thạch và thời gian truyền công (user chốt 16/11: châu càng xịn càng tốn).
export const ORBS=Object.freeze({
 common:{name:'Linh Châu xanh',cost:300,ms:30*60000,color:'#7fe3ff'},
 vip:{name:'Linh Châu tím',cost:800,ms:60*60000,color:'#c79bff'},
 divine:{name:'Linh Châu vàng',cost:2000,ms:120*60000,color:'#ffd36b'}});
export const MAX_STARS=5,STAR_STEP=.2;
// Giới hạn cộng dồn (sao tối đa): tu luyện ≤6%, các mục khác ≤15%.
export const STAT_CAP=Object.freeze({qi:6,arena:15,war:15,race:15,stones:15});
export const mountById=id=>MOUNTS.find(m=>m.id===id)||null;
export const orbKind=s=>({'':'common',thuong:'common',xanh:'common',vip:'vip',tim:'vip',than:'divine',vang:'divine'})[String(s||'').trim()]??null;
// Phần trăm (0–15) của một chỉ số theo tọa kỵ + số sao.
export function mountStat(mountId,stars,key){
 const m=mountById(mountId),base=m?.stats?.[key]||0;if(!base)return 0;
 const s=Math.max(1,Math.min(MAX_STARS,Number(stars)||1));
 return Math.min(STAT_CAP[key]??15,Math.round(base*(1+STAR_STEP*(s-1))*10)/10);
}
