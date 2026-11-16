// 17/11/2026: CHIÊU RIÊNG cho skin đặc biệt ≥300 coin + linh thú ≥200 coin — dùng chung server (arena.mjs) và client (skill-cutscene.js).
// Server đánh dấu đòn bằng entry.cut và HOÃN mọi đòn kế tiếp trong lúc chiếu → màn chiếu riêng không làm mất đòn nào.
export const SKIN_CUT_MS=5200,PET_CUT_MS=3600,GIFT_CUT_MS=4400,GIFT_CUT_MIN=499,RACE_CUT_MS=3800,RACE_CUT_MIN=99,CUT_AFTERGLOW_MS=1800; // quà trợ chiêu ≥499 coin (Bạo Phát, Thiên Giáng) cũng chiếu riêng
export const SIGNATURE_ULTS=Object.freeze({
 'nhan-qua-vuong-lam':{name:'Nhân Quả Luân Hồi Trảm',shout:'NHÂN QUẢ — LUÂN HỒI!',hero:'Nhân Quả Vương Lâm',color:'#ff4a3a',glow:'#ffd27a',deep:'#2a0306',motif:'karma',art:'ult-nhan-qua'},
 'khuy-niet-loi-ton':{name:'Âm Dương Tử Lôi Kiếp',shout:'THIÊN LÔI — DIỆT THẾ!',hero:'Khuy Niết Lôi Tôn',color:'#b06bff',glow:'#ffe27a',deep:'#12052a',motif:'thunder',art:'ult-khuy-niet'},
 'phan-thien-viem-ton':{name:'Phần Thiên Liệt Diễm Trảm',shout:'PHẦN THIÊN — HỎA THẦN GIÁNG!',hero:'Tần Mục Hỏa Thần',color:'#ff7a2a',glow:'#ffe08a',deep:'#2a0a02',motif:'fire',art:'ult-viem-ton'},
 'hac-kim-chien-y':{name:'Phật Nộ Hỏa Liên',shout:'PHẬT NỘ — HỎA LIÊN!',hero:'Đấu Đế Tiêu Viêm',color:'#ff953f',glow:'#b8f0ff',deep:'#1e0a04',motif:'lotus-fire',art:'ult-tieu-viem'},
 'nguyet-lien-tien-co':{name:'Nguyệt Hoa Liên Ảnh',shout:'NGUYỆT LIÊN — CHIẾU THẾ!',hero:'Nguyệt Liên Tiên Cơ',color:'#97f9f0',glow:'#ffffff',deep:'#06202e',motif:'moon',art:'ult-nguyet-lien'},
 'xich-vu-nu-de':{name:'Xích Vũ Phá Thiên Kích',shout:'XÍCH VŨ — PHÁ THIÊN!',hero:'Xích Vũ Nữ Đế',color:'#ff4d6d',glow:'#ffd27a',deep:'#2a0410',motif:'phoenix',art:'ult-xich-vu'}
});
// Linh thú 200/300 coin: tên chiêu riêng + màu (hình = chính ảnh động của con thú + VFX nhiều lớp).
export const PET_ULTS=Object.freeze({
 'loi-oa':{name:'Lôi Oa Chấn Thiên Hống',color:'#b9a8ff',motif:'thunder'},
 'van-thu':{name:'Huyết Văn Phệ Hồn',color:'#ff4d6d',motif:'blood'},
 'ky-lan':{name:'Kỳ Lân Liệt Hỏa Đạp',color:'#ffb347',motif:'fire'},
 'astral-dragon':{name:'Tinh Hà Long Ngâm',color:'#d9a0ff',motif:'stars'},
 'bach-nguyet-ho':{name:'Cửu Vĩ Băng Nguyệt Trận',color:'#9ce9ff',motif:'ice'},
 'ngoc-chau-long':{name:'Thiên Long Thổ Châu',color:'#8effc3',motif:'pearl'},
 'xich-ha-phuong':{name:'Thiên Phượng Niết Bàn',color:'#ff9a70',motif:'fire'},
 'tu-nguyet-lan':{name:'Tử Nguyệt Lân Quang',color:'#e2b1ff',motif:'moon'},
 'hac-tinh-ho':{name:'Hắc Tinh Hổ Khiếu',color:'#b8d3ff',motif:'stars'}
});
/** Skin đặc biệt người chơi ĐANG mặc (phải sở hữu) có chiêu riêng không. */
export function signatureSkinOf(p){const id=p?.skinChoice;return id&&SIGNATURE_ULTS[id]&&(p.rewardSkins||[]).includes(id)?id:null;}
export function petUltOf(p){const id=p?.spiritPet;return id&&PET_ULTS[id]&&(p.spiritPets||[]).includes(id)?id:null;}
