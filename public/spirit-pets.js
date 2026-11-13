// Shared deterministic unlock rules. Likes and coins are alternative routes, not a lottery.
export const SPIRIT_PETS=Object.freeze([
 {id:'jade-rabbit',name:'Ngọc Thố',rank:'Thường',hearts:100,coins:0,color:'#a4efd6',size:35},
 {id:'ember-fox',name:'Xích Diễm Hồ',rank:'Hiếm',hearts:400,coins:0,color:'#ffac69',size:39},
 {id:'frost-tiger',name:'Băng Phách Hổ',rank:'Sử thi',hearts:1000,coins:0,color:'#80dcff',size:43},
 {id:'sun-phoenix',name:'Kim Vũ Phượng',rank:'VIP',hearts:3000,coins:100,color:'#ffd46d',size:46},
 {id:'astral-dragon',name:'Tinh Hà Thần Long',rank:'Siêu VIP',hearts:null,coins:200,color:'#d9a0ff',size:50}
]);
// 07/11: Thần thú hiếm — mỗi lượt Linh Thú Cốc ngẫu nhiên xuất hiện 1 con (chỉ con đã có ảnh). Giá bằng con cao nhất.
export const RARE_PETS=Object.freeze([
 {id:'loi-oa',name:'Lôi Oa',rank:'Thần thú',hearts:null,coins:200,color:'#a58bff',size:52,rare:true,fx:'lightning',flavor:'Cóc sét thượng cổ'},
 {id:'van-thu',name:'Văn Thú',rank:'Thần thú',hearts:null,coins:200,color:'#ff4d6d',size:50,rare:true,fx:'blood',flying:true,flavor:'Muỗi thú hút huyết khí'},
 {id:'ky-lan',name:'Kỳ Lân',rank:'Thần thú',hearts:null,coins:200,color:'#ffb347',size:54,rare:true,fx:'flame',flavor:'Kỳ Lân lửa điềm lành'}
]);
export const PREMIUM_PETS=Object.freeze([
 {id:'bach-nguyet-ho',name:'Bạch Nguyệt Cửu Vĩ',color:'#9ce9ff',fx:'ice',size:62},
 {id:'ngoc-chau-long',name:'Ngọc Châu Thiên Long',color:'#8effc3',fx:'pearl',size:64,flying:true},
 {id:'xich-ha-phuong',name:'Xích Hà Thiên Phượng',color:'#ff9a70',fx:'flame',size:64,flying:true},
 {id:'tu-nguyet-lan',name:'Tử Nguyệt Ngọc Lân',color:'#e2b1ff',fx:'moon',size:62},
 {id:'hac-tinh-ho',name:'Hắc Tinh Linh Hổ',color:'#b8d3ff',fx:'stars',size:64}
].map(p=>({...p,rank:'Thiên linh thú',rare:true,hearts:null,coins:300})));
export const ALL_PETS=Object.freeze([...SPIRIT_PETS,...RARE_PETS,...PREMIUM_PETS]);
export const petById=id=>ALL_PETS.find(p=>p.id===id);
export const eventPets=(featured,premium=null)=>{
 const core=SPIRIT_PETS.filter(p=>p.coins<200), rare=petById(featured), high=petById(premium);
 return [...core,...(rare?.coins===200?[rare]:[]),...(high?.coins===300?[high]:[])];
};
export function unlockedPets(hearts,coins,featured=null,premium=null){return eventPets(featured,premium).filter(p=>p.hearts>0&&hearts>=p.hearts||p.coins>0&&coins>=p.coins);}
export function petPose(t,seed=0,motion=true){if(!motion)return {frame:0,bob:0,sway:0,tilt:0};const k=t+seed*97;return {frame:[0,1,0,2][Math.floor(k/230)%4],bob:Math.sin(k*.004)*3,sway:Math.sin(k*.0017)*5,tilt:Math.sin(k*.003)*.045};}

export const petRequirement=p=>p.hearts>0?(Number(p.hearts).toLocaleString('vi-VN')+' tim'+(p.coins>0?' hoặc '+p.coins+' coin':'')):(p.coins+' coin · chỉ quà');
