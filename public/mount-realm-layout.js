// 16/11/2026: bố cục chung server + overlay cho TỌA KỸ BÍ CẢNH. Toạ độ logic = khung 900×1600 (như Ngũ Đường Giao Lưu).
// Ảnh map 1024×1536 vẽ vừa chiều ngang (900×1350), lùi xuống MAP_Y0.
export const VIEW_W=900,VIEW_H=1600,MAP_IMAGE='/assets/toa-ky-v1/realm-map.webp',MAP_Y0=125,MAP_DRAW_H=1350;
const at=(fx,fy)=>({x:Math.round(fx*VIEW_W),y:Math.round(MAP_Y0+fy*MAP_DRAW_H)});
// Sân đá tròn ở giữa (đo trên ảnh) và 6 cửa hang yêu thú chui ra.
export const ARENA={...at(.5,.41),rx:360,ry:205};
export const PORTALS=[[.5,.17],[.14,.25],[.87,.25],[.11,.62],[.89,.62],[.5,.76]].map(([x,y])=>at(x,y));
export const BOUNDS={x0:60,x1:840,y0:330,y1:1140};
// 3 làn yêu thú (ảnh boss-atlas.png có sẵn: 0 hổ băng, 1 rùa ngọc, 2 phượng lửa) + Thú vương (một tọa kỹ lớn).
export const WAVES=Object.freeze([
 {name:'Băng Hổ',cell:0,hp:60,color:'#9fd8ff'},
 {name:'Ngọc Quy',cell:1,hp:90,color:'#8ff0b0'},
 {name:'Hỏa Phượng',cell:2,hp:75,color:'#ffb070'}]);
// 17/11 (chủ game: "thêm vài map cấu trúc khác nhau, thêm loại quái"): mỗi lượt chọn 1 map (khác lượt trước).
// Mỗi map có sân (elip) + cửa hang + làn quái riêng. Quái: cell = ảnh boss-atlas cũ, art = ảnh mới (Codex vẽ, /assets/toa-ky-v1/<art>.webp).
const lay=(id,name,image,cx,cy,rx,ry,doors,waves,bounds)=>{const arena={...at(cx,cy),rx,ry};return Object.freeze({id,name,image,arena,portals:doors.map(([x,y])=>at(x,y)),
 bounds:bounds||{x0:60,x1:840,y0:Math.max(240,arena.y-ry-140),y1:Math.min(1180,arena.y+ry+260)},waves:Object.freeze(waves)});};
export const REALM_MAPS=Object.freeze([
 lay('linh-son','Linh Sơn Bí Cảnh',MAP_IMAGE,.5,.41,360,205,[[.5,.17],[.14,.25],[.87,.25],[.11,.62],[.89,.62],[.5,.76]],WAVES,BOUNDS),
 lay('hoa-diem','Hỏa Diệm Sơn','/assets/toa-ky-v1/realm-map-volcano.webp',.5,.449,405,118,[[.5,.17],[.13,.29],[.86,.29],[.12,.59],[.88,.59],[.5,.75]],[ // đo trên ảnh: sân elip dẹt viền dung nham
  {name:'Dung Nham Tích Dịch',art:'mob-lava-lizard',hp:70,color:'#ff8a3d'},{name:'Hỏa Phượng',cell:2,hp:75,color:'#ffb070'},{name:'Thạch Ma',art:'mob-stone-golem',hp:110,color:'#7fe0a8'}]),
 lay('bang-phong','Băng Phong Cốc','/assets/toa-ky-v1/realm-map-ice.webp',.49,.385,290,190,[[.5,.145],[.13,.23],[.88,.23],[.14,.58],[.86,.58],[.5,.77]],[ // đo trên ảnh: hồ băng tròn trận pháp
  {name:'Băng Hổ',cell:0,hp:60,color:'#9fd8ff'},{name:'Lôi Ưng',art:'mob-thunder-hawk',hp:65,color:'#c9a8ff'},{name:'Ngọc Quy',cell:1,hp:90,color:'#8ff0b0'}])
]);
export const realmLayout=e=>REALM_MAPS.find(m=>m.id===e?.map)||REALM_MAPS[0];
export const BOSS_POOL=Object.freeze(['cuu-thien-thanh-long','con-bang','huyen-minh-cu-mang','luu-ly-hoa-thuyen','that-thai-tuong-van','hoa-ky-lan','cuu-vi-thien-ho','tuu-tien-ho-lo']); // 16/11: thêm Hỏa Kỳ Lân, Cửu Vĩ Thiên Hồ, Tửu Tiên Hồ Lô
// Quà (tổng coin MỘT lần tặng) → chiêu trong bí cảnh.
export const GIFT_TIERS=Object.freeze([
 {min:300,id:'grand',name:'NGỰ THÚ ĐẠI CHIÊU',spread:12,radius:420,burn:true},
 {min:199,id:'inferno',name:'HỎA THIÊU BÍ CẢNH',spread:4,radius:240,burn:true}, // 17/11 (chủ game): lửa thiêu cả sàn 6 s, đốt mọi yêu thú
 {min:99,id:'ultimate',name:'VẠN THÚ PHỤC',spread:7,radius:300},
 {min:30,id:'spread',name:'LIÊN HOÀN KÍCH',spread:3,radius:200},
 {min:1,id:'boost',name:'CUỒNG HÓA',spread:0,radius:0}]);
export const BURN_MS=6000;
export const giftTier=v=>GIFT_TIERS.find(t=>v>=t.min)||GIFT_TIERS.at(-1);
// Mốc Linh Châu theo TỔNG quà của một người trong một lượt (user chốt 16/11). Lấy mốc cao nhất.
export const ORB_GIFT_STEPS=Object.freeze([{min:1000,divine:1},{min:500,vip:2},{min:300,vip:1}]);
export const orbsForCoins=c=>{const s=ORB_GIFT_STEPS.find(x=>c>=x.min);return {vip:s?.vip||0,divine:s?.divine||0};};
