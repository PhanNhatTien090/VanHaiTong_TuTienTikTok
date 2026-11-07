import {vipTier,VIP_TIERS} from './vip.js';
export function bondVipInfo(p){const level=p&&!p.resident&&!p.puppet?vipTier(p.giftCoins):0;return {level,name:level?'VIP '+level+' · '+VIP_TIERS[level].name:'Thường',limit:1+level,extra:level};}
export const bondCapacity=p=>bondVipInfo(p).limit;
export function bondRuleText(){return 'Thường: 1 đạo lữ; '+VIP_TIERS.slice(1).map((t,i)=>'VIP '+(i+1)+' từ '+t.min.toLocaleString('vi-VN')+' coin quà tích lũy: '+(i+2)+' đạo lữ').join('; ')+'. Cả hai phải còn chỗ và người nhận phải đồng ý.';}
