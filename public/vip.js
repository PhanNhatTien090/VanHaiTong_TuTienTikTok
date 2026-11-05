// v86: cấp VIP theo coin quà tích lũy (giữ vĩnh viễn) + nhận diện người mới. Dùng chung máy chủ và cảnh.
export const VIP_TIERS=Object.freeze([
  null,
  {name:'Bạc',icon:'◆',color:'#dfe8f2',bonus:.10,min:100,seat:150},
  {name:'Vàng',icon:'★',color:'#ffd76a',bonus:.20,min:1000,seat:400},
  {name:'Kim Cương',icon:'💎',color:'#9fe7ff',bonus:.30,min:10000,seat:800}
]);
export const vipTier=coins=>{const c=Number(coins)||0;return c>=10000?3:c>=1000?2:c>=100?1:0;};
export const NEWBIE_MS=15*60000;
export const isNewbie=(p,now=Date.now())=>!!p&&!p.resident&&(Number(p.realm)||0)<=1&&now-(Number(p.joinedAt)||0)<NEWBIE_MS;
// biểu tượng đứng trước tên trên cảnh
export const nameBadge=(p,now=Date.now())=>{const t=vipTier(p?.giftCoins);return t?VIP_TIERS[t].icon+' ':isNewbie(p,now)?'🌱 ':'';};
