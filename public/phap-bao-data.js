// 17/11/2026 (chủ game): PHÁP BẢO — dữ liệu dùng chung server (phap-bao.mjs) + overlay (bao-kho.js).
// Kế hoạch: PHAP-BAO-PLAN-2026-11-17.md. KHÔNG có số cơ duyên ở đây (chỉ server) — overlay chỉ biết ngọn lửa.
// Ảnh: /assets/phap-bao-v1/<art>.webp (Codex image_gen 17/11, nền trong suốt).
export const BAO_LINES=Object.freeze({
 kiem:{name:'Kiếm',skill:'Bạo kích'},an:{name:'Ấn',skill:'Choáng'},dinh:{name:'Đỉnh',skill:'Hồi máu'},
 chung:{name:'Chung',skill:'Khiên'},phien:{name:'Phiến',skill:'Đẩy lùi'},kinh:{name:'Kính',skill:'Phản đòn'}});
// Chỉ số (sao 1, %): atk = Công, crit = Bạo kích, critDmg = ST bạo kích, res = Kháng bạo, qi = Tu vi.
export const BAO_ITEMS=Object.freeze([
 {id:'s4-kiem',tier:4,line:'kiem',name:'Thanh Phong Kiếm',stats:{atk:4,crit:3}},
 {id:'s4-an',tier:4,line:'an',name:'Huyền Thiết Ấn',stats:{atk:3,res:4}},
 {id:'s4-dinh',tier:4,line:'dinh',name:'Thanh Đồng Đỉnh',stats:{qi:2,res:3}},
 {id:'s4-chung',tier:4,line:'chung',name:'Linh Âm Chung',stats:{res:5,atk:2}},
 {id:'s4-phien',tier:4,line:'phien',name:'Bích Vân Phiến',stats:{atk:3,critDmg:6}},
 {id:'s4-kinh',tier:4,line:'kinh',name:'Thủy Nguyệt Kính',stats:{res:4,crit:2}},
 {id:'s5-kiem',tier:5,line:'kiem',name:'Tử Tiêu Thần Kiếm',stats:{atk:10,crit:8,critDmg:20}},
 {id:'s5-an',tier:5,line:'an',name:'Phiên Thiên Ấn',stats:{atk:9,res:8}},
 {id:'s5-dinh',tier:5,line:'dinh',name:'Cửu Long Thần Đỉnh',stats:{qi:5,res:8,atk:5}},
 {id:'s5-chung',tier:5,line:'chung',name:'Đông Hoàng Chung',stats:{res:12,atk:6}},
 {id:'s5-phien',tier:5,line:'phien',name:'Ba Tiêu Phiến',stats:{atk:8,critDmg:24}},
 {id:'s5-kinh',tier:5,line:'kinh',name:'Côn Lôn Kính',stats:{res:9,crit:6,qi:3}},
 {id:'L01-tru-tien',tier:6,line:'kiem',name:'Tru Tiên Kiếm Trận',stats:{atk:16,crit:12,critDmg:30}},
 {id:'L02-hon-don-chung',tier:6,line:'chung',name:'Hỗn Độn Chung',stats:{res:18,atk:10}},
 {id:'L03-luan-hoi-kinh',tier:6,line:'kinh',name:'Luân Hồi Kính',stats:{res:12,crit:10,qi:4}},
 {id:'L04-thai-cuc-do',tier:6,line:'an',name:'Thái Cực Đồ',stats:{atk:12,res:12,qi:4}},
 {id:'L05-huyen-hoa-dinh',tier:6,line:'dinh',name:'Cửu Thiên Huyền Hỏa Đỉnh',stats:{qi:6,atk:10,res:10}},
 {id:'L06-can-khon-dai',tier:6,line:'an',name:'Càn Khôn Đại',stats:{res:14,qi:5}},
 {id:'L07-phong-than-bang',tier:6,line:'an',name:'Phong Thần Bảng',stats:{atk:14,crit:8}},
 {id:'L08-dinh-hai-cham',tier:6,line:'phien',name:'Định Hải Thần Châm',stats:{atk:15,critDmg:28}},
 {id:'L09-that-bao-thu',tier:6,line:'phien',name:'Thất Bảo Diệu Thụ',stats:{atk:12,critDmg:22,qi:4}},
 {id:'L10-hong-mong-binh',tier:6,line:'dinh',name:'Hồng Mông Tử Khí Bình',stats:{qi:6,res:14}},
 {id:'L11-loi-than-chuy',tier:6,line:'kiem',name:'Lôi Thần Chùy',stats:{atk:16,crit:14}},
 {id:'L12-huyet-hai-dao',tier:6,line:'kiem',name:'Huyết Hải Ma Đao',stats:{atk:18,critDmg:26}},
]);
export const BAO_TIER=Object.freeze({4:{name:'4★',label:'THẦN KHÍ TRUNG CẤP',color:'#c79bff'},5:{name:'5★',label:'THẦN KHÍ CAO CẤP',color:'#ffd36b'},6:{name:'GIỚI HẠN',label:'THẦN KHÍ GIỚI HẠN',color:'#ff8fd0'}});
export const BAO_STAT_NAME=Object.freeze({atk:'Công',crit:'Bạo kích',critDmg:'ST bạo kích',res:'Kháng bạo',qi:'Tu vi'});
export const BAO_MAX_STARS=5,BAO_STAR_STEP=.2;
export const baoItem=id=>BAO_ITEMS.find(x=>x.id===id)||null;
export const baoArt=id=>'/assets/phap-bao-v1/'+id+'.webp';
export const baoStat=(id,stars,key)=>{const it=baoItem(id),b=it?.stats?.[key]||0;return b?Math.round(b*(1+BAO_STAR_STEP*(Math.max(1,Math.min(BAO_MAX_STARS,stars||1))-1))*10)/10:0;};
// Bảng CƠ DUYÊN trên LIVE: mốc quà → số ngọn lửa (KHÔNG hiện %). Mốc theo ảnh mẫu chủ game gửi 17/11.
export const BAO_FLAMES=Object.freeze([{min:0,flames:1,free:true},{min:1,flames:2},{min:10,flames:3},{min:99,flames:4},{min:199,flames:5},{min:999,flames:5,each:true}]);
export const BAO_PITY4=10,BAO_PITY5=80,BAO_LIMITED_STOCK=12,BAO_EVENT_MS=5*60000,BAO_FREE_CD=20000; // 17/11 chủ game: 20 s → 5 phút tối đa 15 lượt free, gõ đều chắc ≥10
// 18/11: THẦN THÔNG BẢN MỆNH trong trận (Lôi Đài). Bản mệnh = món ghim (p.bao.ban) hoặc món mạnh nhất (bậc rồi sao).
// Mỗi dòng một thần thông; nhịp hồi theo bậc; sát thương % máu đối thủ × (1 + 10%/sao). 5★/GIỚI HẠN: lần phát đầu mỗi trận chiếu riêng.
export const BAO_LINE_FX=Object.freeze({kiem:{effect:'crit',tech:'sword'},an:{effect:'stun',tech:'thunder'},dinh:{effect:'heal',tech:'lotus'},chung:{effect:'shield',tech:'bell'},phien:{effect:'knock',tech:'peachfan'},kinh:{effect:'reflect',tech:'starmirror'}});
export const BAO_PROC=Object.freeze({4:{cd:12000,pct:.09},5:{cd:9000,pct:.13},6:{cd:7000,pct:.17}});
export const BAO_CUT_MS=Object.freeze({5:3600,6:9500}); // GIỚI HẠN: chiêu riêng từng món (public/bao-ults.js)
export function baoBanMenh(p){
 const items=p?.bao?.items||{},ids=Object.keys(items).filter(id=>baoItem(id)&&items[id]>0);if(!ids.length)return null;
 const pin=p.bao.ban&&ids.includes(p.bao.ban)?p.bao.ban:null,id=pin||ids.sort((x,y)=>baoItem(y).tier-baoItem(x).tier||items[y]-items[x])[0],it=baoItem(id);
 return {id,tier:it.tier,line:it.line,stars:items[id],name:it.name};
}
