export const COURT_VISITORS=[
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
