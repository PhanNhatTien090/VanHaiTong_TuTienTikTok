export const BLACK_GOLD_VISITOR=Object.freeze({
 kind:'hac-kim',aliases:['tieu viem'],skin:'hac-kim-chien-y',name:'Đấu Đế Tiêu Viêm',
 artifact:'hac-kim-hoa-dao',relic:'Hắc Kim Hỏa Đao & Hỏa Luân',
 color:'#ff953f',trim:'#ffe6a3',dark:'#280e0a',technique:'flame',icon:'sword',
 aura:'Hỏa ấn · tàn lửa · đao và hỏa luân đồng bộ',
 artwork:{blade:'/assets/thien-khuyet/relic-hac-kim-hoa-dao.webp',halo:'/assets/thien-khuyet/hac-kim-halo.webp'}
});
// 14/11: Nhân Quả Vương Lâm — một mốc duy nhất 500 coin: skin + Nhân Quả Xích Long Thương cùng lúc.
export const KARMA_VISITOR=Object.freeze({
 kind:'nhan-qua',aliases:['nhan qua vuong lam','nhan qua','nhanqua'],skin:'nhan-qua-vuong-lam',name:'Nhân Quả Vương Lâm',
 artifact:'nhan-qua-xich-long-thuong',relic:'Nhân Quả Xích Long Thương',
 color:'#f4f2ee',trim:'#ffffff',dark:'#0b0b0e',technique:'dragon',icon:'sword',skinCoins:500,artifactCoins:500,
 aura:'Âm dương nhân quả · tơ trắng đen · Xích Long Thương',
 artwork:{blade:'/assets/nhan-qua/spear.webp',halo:'/assets/nhan-qua/halo-gold.webp',seated:'/assets/nhan-qua/seated.webp',standing:'/assets/nhan-qua/standing.webp'}
});
// 19/11: Tinh Hà Kiếm Đế — một mốc 500 coin: skin + Tinh Hà Kiếm cùng lúc (Cửu Tinh Kiếm Trận, Tinh Đồ). Hình do Codex vẽ theo đề bài.
export const TINH_HA_VISITOR=Object.freeze({
 kind:'tinh-ha',aliases:['tinh ha kiem de','tinh ha','tinhha','kiem de'],skin:'tinh-ha-kiem-de',name:'Tinh Hà Kiếm Đế',
 artifact:'tinh-ha-kiem',relic:'Tinh Hà Kiếm',
 color:'#9cc0ff',trim:'#eef4ff',dark:'#0a0620',technique:'stararrow',icon:'sword',skinCoins:500,artifactCoins:500,
 aura:'Tinh Đồ · Cửu Tinh Kiếm Trận · tinh vân · sao băng',
 artwork:{blade:'/assets/tinh-ha/blade.webp',halo:'/assets/tinh-ha/halo.webp',seated:'/assets/tinh-ha/seated.webp',standing:'/assets/tinh-ha/standing.webp'}
});
// Skin có bộ hiệu ứng riêng (màn biến hình ưu tiên cao, pháp bảo theo người).
export const SIGNATURE_VISITORS=[BLACK_GOLD_VISITOR,KARMA_VISITOR,TINH_HA_VISITOR];
export const signatureVisitor=kind=>SIGNATURE_VISITORS.find(v=>v.kind===kind)||null;
export const COURT_VISITORS=[
 TINH_HA_VISITOR,
 KARMA_VISITOR,
 BLACK_GOLD_VISITOR,
 {kind:'nguyet-lien',skin:'nguyet-lien-tien-co',name:'Nguyệt Liên Tiên Cơ',artifact:'nguyet-lien-ngoc-truong',relic:'Nguyệt Liên Ngọc Trượng',color:'#97f9f0',trim:'#f9ffff',dark:'#123854',technique:'lotus'},
 {kind:'xich-vu',skin:'xich-vu-nu-de',name:'Xích Vũ Nữ Đế',artifact:'xich-vu-thien-kich',relic:'Xích Vũ Thiên Kích',color:'#ff925e',trim:'#ffe8a6',dark:'#511020',technique:'flame'}
];
const tiers=[
 ['thanh-long-thuong','Thanh Long Thương',4,950,18,57,.28,'dragon','sword'],
 ['huyet-nguyet-dao','Huyết Nguyệt Đao',4,1000,20,60,.26,'flame','sword'],
 ['kim-phuong-cung','Kim Phượng Thần Cung',5,1350,23,64,.35,'stararrow','sword'],
 ['tu-loi-luan','Tử Lôi Pháp Luân',5,1550,26,67,.37,'thunder','orb'],
 ['nguyet-bach-phien','Nguyệt Bạch Tiên Phiến',5,1400,28,60,.41,'peachfan','orb'],
 ['ngoc-tieu-an','Ngọc Tiêu Thiên Ấn',6,1850,34,73,.42,'celestial','orb'],
 ['van-van-lo','Vân Văn Ngọc Hồ',6,1950,38,70,.46,'vortex','vase'],
 ['xich-ha-thap','Xích Hà Phục Ma Tháp',7,2300,42,80,.46,'flowercage','orb'],
 ['kim-cuong-chung','Kim Cương Hộ Pháp Chung',7,2450,43,85,.45,'bell','bell'],
 ['thien-kinh','Thiên Kính Tinh Hải',8,3000,55,91,.51,'starmirror','orb']
];
export const COURT_RELICS=tiers.map(([id,name,tier,price,herbs,damage,bonus,technique,icon])=>({
 id,name,tier,price,herbs,damage,bonus,technique,icon,type:'artifact',
 art:'/assets/thien-khuyet/relic-'+id+'.webp',
 description:'+'+damage+' công lực · +'+Math.round(bonus*100)+'% tu vi khi trang bị.'
}));
export function courtRelic(id){
 return COURT_RELICS.find(x=>x.id===id)||COURT_VISITORS.find(x=>x.artifact===id);
}
