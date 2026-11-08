// 08/11/2026: GHÉP GIỌNG LÀM SẴN cho lời cảm ơn quà — không phải chờ VieNeu (5–14 s khi máy đang LIVE).
// Lúc máy tạo giọng rảnh, đọc trước "Sư huynh <tên>" của người đang có mặt + "tặng <quà>! Tu vi tăng mạnh!" của các quà hay gặp (08/11 tối: bỏ 'Đa tạ tâm ý').
// Có quà: trang ghép 2 mảnh và phát ngay. Giọng vẫn là VieNeu (tông sư).
import {sayName} from './speech-lines.mjs';
export const COMMON_GIFTS=Object.freeze(['Hoa hồng','TikTok','Tim','Kem ốc quế','Bánh rán','GG','Mũ phép thuật','Nhẫn kim cương','Hoa tulip','Ngón tay cái','Kẹo bông']);
const clean=s=>String(s||'').normalize('NFC').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\d+/g,' ').replace(/\s+/g,' ').trim().slice(0,30);
export function namePlan(p){const raw=sayName(p?.name);if(!raw)return null;const t=p.gender==='nam'?'Sư huynh':p.gender==='nu'?'Sư tỷ':'Đạo hữu';return [{voice:'tongsu',text:`${t} ${raw}`}];}
export function giftPlan(gift){const g=clean(gift);return g?[{voice:'tongsu',text:`tặng ${g}! Tu vi tăng mạnh!`}]:null;}
// 08/11 tối: mảnh ghép hô chiến cho quà trong Chính Ma Đại Chiến (thay 'Đa tạ tâm ý').
export const WAR_PUSH_PLANS=Object.freeze({chinh:Object.freeze([{voice:'tongsu',text:'phản công! Chính Đạo đẩy mạnh!'}]),ma:Object.freeze([{voice:'tongsu',text:'phản công! Ma Đạo đẩy mạnh!'}])});
// 08/11 tối: tông chủ ban lễ — "<tên>" + "được Tông chủ ban <gói>!" làm sẵn để đọc ngay (câu đầy đủ mất ~10 s, trước đây bị bỏ).
export const ADMIN_PLANS=Object.freeze(Object.fromEntries([['small','Tiểu Lễ'],['medium','Trung Lễ'],['large','Đại Lễ'],['buff','Phúc Duyên'],['breakthrough','Đột Phá Đan']].map(([k,n])=>[k,Object.freeze([{voice:'tongsu',text:`được Tông chủ ban ${n}!`}])])));
export const THANKS_PLAN=Object.freeze([{voice:'tongsu',text:'tặng quà! Tu vi tăng mạnh!'}]);
const ACTIVE_MS=20*60000;
/** Mảnh còn thiếu cần làm tiếp (ưu tiên: câu cảm ơn chung → người vừa tương tác → quà vừa có → quà phổ biến). */
export function nextMissingPart(w,cached,now=Date.now()){
  if(!cached(THANKS_PLAN))return THANKS_PLAN;
  for(const plan of [...Object.values(WAR_PUSH_PLANS),...Object.values(ADMIN_PLANS)])if(!cached(plan))return plan;
  const people=Object.values(w.players||{}).filter(p=>!p.resident&&!p.puppet&&now-(p.lastRealInteractionAt||p.lastActive||0)<ACTIVE_MS).sort((a,b)=>(b.giftCoins>0)-(a.giftCoins>0)||(b.lastRealInteractionAt||0)-(a.lastRealInteractionAt||0));
  for(const p of people.slice(0,200)){const plan=namePlan(p);if(plan&&!cached(plan))return plan;}
  const gifts=new Set([...(w.events||[]).filter(e=>e.gift&&Number(e.coins)>0).slice(-60).map(e=>e.gift),...COMMON_GIFTS]);
  for(const g of gifts){const plan=giftPlan(g);if(plan&&!cached(plan))return plan;}
  return null;
}
