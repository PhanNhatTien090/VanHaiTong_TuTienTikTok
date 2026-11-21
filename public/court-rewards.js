export const BLACK_GOLD_VISITOR=Object.freeze({
 kind:'hac-kim',aliases:['tieu viem'],skin:'hac-kim-chien-y',name:'Đấu Đế Tiêu Viêm',
 artifact:'hac-kim-hoa-dao',relic:'Hắc Kim Hỏa Đao & Hỏa Luân',
 color:'#ff953f',trim:'#ffe6a3',dark:'#280e0a',technique:'flame',icon:'sword',skinCoins:400,artifactCoins:400,skinOnlyCoins:300, // 21/11 tối: bán cả bộ 400 (như Khuy Niết)
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
// 19/11: Bích Lân Độc Hậu — skin NỮ độc tu 500 coin (skin + Vạn Cổ Xà Trượng cùng lúc), có mãng xà linh hồn trườn sau lưng.
export const BICH_LAN_VISITOR=Object.freeze({
 kind:'bich-lan',aliases:['bich lan doc hau','bich lan','bichlan','doc hau'],skin:'bich-lan-doc-hau',name:'Bích Lân Độc Hậu',
 artifact:'van-co-xa-truong',relic:'Vạn Cổ Xà Trượng',
 color:'#5cff8a',trim:'#eaffd8',dark:'#03140a',technique:'vortex',icon:'orb',skinCoins:500,artifactCoins:500,
 aura:'Xà Hoàn · mãng xà linh hồn · độc trì · độc điệp',
 artwork:{blade:'/assets/bich-lan/blade.webp',halo:'/assets/bich-lan/halo.webp',seated:'/assets/bich-lan/seated.webp',standing:'/assets/bich-lan/standing.webp',serpent:'/assets/bich-lan/serpent.webp'}
});
// 21/11: Nữ Oa — skin NỮ 500 coin (skin + Bổ Thiên Linh Châu cùng lúc). Ảnh theo ảnh mẫu chủ game; trăng, vòng nước, ngọc trai, hoa trắng.
export const NU_OA_VISITOR=Object.freeze({
 kind:'nu-oa',aliases:['nu oa','nuoa','nu-oa','nữ oa'],skin:'nu-oa',name:'Nữ Oa',
 artifact:'bo-thien-linh-chau',relic:'Bổ Thiên Linh Châu',
 color:'#c8c4ff',trim:'#fffaf0',dark:'#0c0a2a',technique:'lotus',icon:'orb',skinCoins:500,artifactCoins:500,
 aura:'Trăng · vòng nước · ngọc trai · sen nở · hoa trắng',
 artwork:{blade:'/assets/nu-oa/orb.webp',halo:'/assets/nu-oa/halo.webp',seated:'/assets/nu-oa/seated.webp',standing:'/assets/nu-oa/standing.webp'}
});
// 21/11: U Minh Ma Đế — skin NAM ma đạo đen tím 500 coin (skin + Vạn Hồn Phiên cùng lúc). Ma nhãn, hắc viêm, xích U Minh, hồn bị hút vào cờ.
export const U_MINH_VISITOR=Object.freeze({
 kind:'u-minh',aliases:['u minh ma de','u minh','uminh','ma de','ma đế'],skin:'u-minh-ma-de',name:'U Minh Ma Đế',
 artifact:'van-hon-phien',relic:'Vạn Hồn Phiên',
 color:'#b070ff',trim:'#f0d8ff',dark:'#0a0014',technique:'vortex',icon:'orb',skinCoins:500,artifactCoins:500,
 aura:'Ma nhãn · U Minh Môn · hắc viêm · xích U Minh · hồn phách',
 artwork:{blade:'/assets/u-minh/banner.webp',halo:'/assets/u-minh/halo.webp',seated:'/assets/u-minh/seated.webp',standing:'/assets/u-minh/standing.webp'}
});
// Skin có bộ hiệu ứng riêng (màn biến hình ưu tiên cao, pháp bảo theo người).
export const SIGNATURE_VISITORS=[BLACK_GOLD_VISITOR,KARMA_VISITOR,TINH_HA_VISITOR,BICH_LAN_VISITOR,NU_OA_VISITOR,U_MINH_VISITOR];
export const signatureVisitor=kind=>SIGNATURE_VISITORS.find(v=>v.kind===kind)||null;
export const COURT_VISITORS=[
 TINH_HA_VISITOR,
 BICH_LAN_VISITOR,
 NU_OA_VISITOR,
 U_MINH_VISITOR,
 KARMA_VISITOR,
 BLACK_GOLD_VISITOR,
 {kind:'nguyet-lien',skin:'nguyet-lien-tien-co',name:'Nguyệt Liên Tiên Cơ',artifact:'nguyet-lien-ngoc-truong',relic:'Nguyệt Liên Ngọc Trượng',color:'#97f9f0',trim:'#f9ffff',dark:'#123854',technique:'lotus',skinCoins:400,artifactCoins:400,skinOnlyCoins:300},
 {kind:'xich-vu',skin:'xich-vu-nu-de',name:'Xích Vũ Nữ Đế',artifact:'xich-vu-thien-kich',relic:'Xích Vũ Thiên Kích',color:'#ff925e',trim:'#ffe8a6',dark:'#511020',technique:'flame',skinCoins:400,artifactCoins:400,skinOnlyCoins:300}
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
