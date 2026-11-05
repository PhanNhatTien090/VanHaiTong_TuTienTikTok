// Shared deterministic unlock rules. Likes and coins are alternative routes, not a lottery.
export const SPIRIT_PETS=Object.freeze([
 {id:'jade-rabbit',name:'Ngọc Thố',rank:'Thường',hearts:100,coins:0,color:'#a4efd6',size:35},
 {id:'ember-fox',name:'Xích Diễm Hồ',rank:'Hiếm',hearts:400,coins:0,color:'#ffac69',size:39},
 {id:'frost-tiger',name:'Băng Phách Hổ',rank:'Sử thi',hearts:1000,coins:0,color:'#80dcff',size:43},
 {id:'sun-phoenix',name:'Kim Vũ Phượng',rank:'VIP',hearts:3000,coins:100,color:'#ffd46d',size:46},
 {id:'astral-dragon',name:'Tinh Hà Thần Long',rank:'Siêu VIP',hearts:null,coins:200,color:'#d9a0ff',size:50}
]);
export const petById=id=>SPIRIT_PETS.find(p=>p.id===id);
export function unlockedPets(hearts,coins){return SPIRIT_PETS.filter(p=>p.hearts>0&&hearts>=p.hearts||p.coins>0&&coins>=p.coins);}
export function petPose(t,seed=0,motion=true){if(!motion)return {frame:0,bob:0,sway:0,tilt:0};const k=t+seed*97;return {frame:[0,1,0,2][Math.floor(k/230)%4],bob:Math.sin(k*.004)*3,sway:Math.sin(k*.0017)*5,tilt:Math.sin(k*.003)*.045};}

export const petRequirement=p=>p.hearts>0?(Number(p.hearts).toLocaleString('vi-VN')+' tim'+(p.coins>0?' hoặc '+p.coins+' coin':'')):(p.coins+' coin · chỉ quà');
