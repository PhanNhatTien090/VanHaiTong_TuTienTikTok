// Bố cục chung server + overlay cho Ngũ Đường Giao Lưu v2 (15/11/2026).
// Toạ độ logic = toạ độ khung 900×1600 của overlay. Ảnh map 1024×1536 vẽ vừa chiều ngang (900×1350), lùi xuống MAP_Y0.
export const VIEW_W=900,VIEW_H=1600,MAP_IMAGE='/assets/ngu-duong-chien-truong/map.webp';
export const MAP_Y0=125,MAP_DRAW_H=1350;
const at=(fx,fy)=>({x:Math.round(fx*VIEW_W),y:Math.round(MAP_Y0+fy*MAP_DRAW_H)});
// Tâm 5 trại (đo trên ảnh) theo thứ tự ngũ giác: trên, trái, phải, dưới trái, dưới phải.
export const CAMP_FRACTIONS=[[.50,.262],[.152,.408],[.85,.408],[.21,.752],[.79,.752]];
export const CAMPS=CAMP_FRACTIONS.map(([x,y])=>at(x,y));
// Trung Ương Chiến Đài (elip phối cảnh).
export const ALTAR={...at(.50,.508),rx:180,ry:135};
export const BOUNDS={x0:40,x1:860,y0:300,y1:1470};
export function campSpots(count){
 if(count<=5)return CAMPS.slice(0,Math.max(1,count)).map(c=>({...c}));
 return Array.from({length:count},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/count;return {x:Math.round(ALTAR.x+Math.cos(a)*330),y:Math.round(ALTAR.y+Math.sin(a)*430)};});
}
export const inAltar=m=>((m.x-ALTAR.x)/ALTAR.rx)**2+((m.y-ALTAR.y)/ALTAR.ry)**2<=1;
// Bộ chiêu mỗi Đường (theo thứ tự Đường 1–5): tầm (px), hồi chiêu (ms), hệ số sát thương.
export const HALL_SKILLS=[
 {id:'sword',name:'THIÊN CÔNG KIẾM TRẬN',range:200,cd:2000,mult:1},
 {id:'treasure',name:'VẠN BẢO TỀ XUẤT',range:210,cd:2200,mult:1.08},
 {id:'flame',name:'TỬ LIÊN ĐAN HỎA',range:200,cd:2100,mult:1.05},
 {id:'mountain',name:'THIÊN SƠN TRẤN ẤN',range:195,cd:2400,mult:1.35},
 {id:'vine',name:'THẦN MỘC LINH TRIỀU',range:205,cd:2000,mult:.9,heal:5}
];
export const skillOf=index=>HALL_SKILLS[((index%5)+5)%5];
// Trợ chiêu theo quà (tổng coin một lần tặng): mỗi mốc một chiêu riêng. Mọi mốc đều kèm cuồng hóa.
export const GIFT_TIERS=[
 {min:300,id:'grand',name:'ĐẠI TUYỆT CHIÊU',spread:10,radius:260,grand:true,label:'đại tuyệt chiêu toàn cảnh, lan 10 người'},
 {min:99,id:'ultimate',name:'TUYỆT CHIÊU ĐƯỜNG',spread:6,radius:200,label:'tuyệt chiêu của Đường, lan 6 người'},
 {min:30,id:'thunder',name:'LÔI KÍCH CỬU THIÊN',spread:3,radius:170,label:'sét giáng trúng 3 người quanh mục tiêu'},
 {min:10,id:'swords',name:'PHI KIẾM TRUY HỒN',swords:3,label:'3 phi kiếm đánh 3 đối thủ gần nhất'},
 {min:5,id:'heal',name:'HỒI XUÂN ĐAN',heal:true,label:'hồi đầy máu + khiên 3 giây, đang nghỉ thì hồi sinh ngay'},
 {min:1,id:'boost',name:'CUỒNG HÓA',label:'đánh mạnh, chạy nhanh hơn'}
];
// Chữ ngắn cho bảng quà trên sân.
export const GIFT_SHORT={grand:['Đại Tuyệt Chiêu','toàn cảnh · lan 10 người'],ultimate:['Tuyệt Chiêu Đường','chiêu Đường · lan 6 người'],thunder:['Lôi Kích Cửu Thiên','sét giáng · lan 3 người'],swords:['Phi Kiếm Truy Hồn','3 kiếm đánh 3 người'],heal:['Hồi Xuân Đan','hồi đầy máu + khiên'],boost:['Cuồng Hóa','đánh mạnh, chạy nhanh']};
export const giftTier=value=>GIFT_TIERS.find(t=>value>=t.min)||null;
