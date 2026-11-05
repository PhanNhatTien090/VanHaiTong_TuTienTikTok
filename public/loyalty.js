// Tenure since first joining, NOT a claim of measured TikTok watch time.
export const LOYALTY_ARTIFACTS=Object.freeze([
 {id:'spirit-vase',type:'artifact',name:'Tụ Linh Bình',icon:'vase',tier:0,price:0,herbs:0,damage:20,bonus:.20,exclusive:true,loyaltyMinutes:30,description:'Bình ngọc hút linh khí: +20 sát thương, +20% tu vi khi trang bị.'},
 {id:'soul-bell',type:'artifact',name:'Trấn Hồn Chung',icon:'bell',tier:0,price:0,herbs:0,damage:32,bonus:.25,exclusive:true,loyaltyMinutes:60,description:'Chuông đồng tỏa sóng trấn hồn: +32 sát thương, +25% tu vi khi trang bị.'},
 {id:'cosmic-cauldron',type:'artifact',name:'Càn Khôn Đỉnh',icon:'cauldron',tier:0,price:0,herbs:0,damage:42,bonus:.30,exclusive:true,loyaltyMinutes:90,description:'Đỉnh huyền kim tỏa linh hỏa: +42 sát thương, +30% tu vi khi trang bị.'}
]);
export const LOYALTY_TIERS=Object.freeze([
 // v33: thưởng nhỏ, không linh thạch, không tặng skin cao cấp; mỗi lần chỉ trao một mốc (engine.mjs).
 {minutes:30,item:'spirit-vase',qi:60,stones:0,herbs:3},
 {minutes:60,item:'soul-bell',qi:120,stones:0,herbs:5},
 {minutes:90,item:'cosmic-cauldron',qi:200,stones:0,herbs:8}
]);
