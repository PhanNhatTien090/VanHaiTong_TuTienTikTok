// 10/11/2026 (chủ game): TẶNG HỘ — người xem gõ "tang <tên | mã | @id>" rồi tặng quà.
// Trong lúc sự kiện skin (tiên nhân truyền đạo) hoặc Linh Thú Cốc đang mở, TIẾN ĐỘ COIN của sự kiện
// tính cho người nhận. Người nhận phải đang có mặt trên LIVE. Tim không chuyển được.
// Tổng coin, VIP, top quà, Tông chủ, đua kiếm, Chính–Ma, lò đan… vẫn tính cho người tặng (người bỏ tiền).
import {VISITOR_GIFT_REWARDS} from './public/visitor-rewards.js';

export const GIFT_FOR_MS=10*60000;
export const GIFT_FOR_COMMANDS=['tang','tangho'];
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fail=message=>({ok:false,message});
const open=(e,now)=>e&&!e.closedAt&&now>=(e.startedAt||0)&&now<e.endsAt;

// Sự kiện nhận tặng hộ đang mở → thời điểm kết thúc muộn nhất (null nếu không có).
export function giftForEventEnd(w,now){
 const ends=[];
 if(open(w.visitor,now)&&VISITOR_GIFT_REWARDS[w.visitor.kind])ends.push(w.visitor.endsAt);
 if(open(w.petEvent,now))ends.push(w.petEvent.endsAt);
 return ends.length?Math.max(...ends):null;
}

// Phần tên sau lệnh, giữ nguyên chữ gốc (dấu, ký tự đặc biệt) để so với tên hiển thị.
function targetText(text,cmd){
 const tokens=String(text||'').trim().split(/\s+/);let joined='';
 while(tokens.length&&joined.length<cmd.length)joined+=norm(tokens.shift()).replace(/ /g,'');
 return tokens.join(' ').trim();
}

function findExact(w,query,now,active){
 const q=norm(query);if(!q)return [];
 return Object.values(w.players).filter(x=>!x.resident&&!x.puppet&&(norm(x.name)===q||norm(x.socialCode)===q||norm(x.handle)===q||x.id===query.trim())&&active(w,x,now));
}
// "tang hộ Nam" → thử nguyên "hộ Nam" trước (họ Hồ), không thấy mới bỏ chữ "hộ".
function findPresent(w,query,now,active){
 const found=findExact(w,query,now,active);if(found.length)return found;
 const parts=query.trim().split(/\s+/);
 return parts.length>1&&norm(parts[0])==='ho'?findExact(w,parts.slice(1).join(' '),now,active):[];
}

export function giftForCommand(w,p,cmd,text,now,c){
 if(!GIFT_FOR_COMMANDS.includes(cmd))return null;
 if(p.resident||p.puppet)return fail('Tặng hộ dành cho người xem thật.');
 if(w.settings?.giftForOthers===false)return fail('Tặng hộ đang tạm đóng.');
 const query=targetText(text,cmd),q=norm(query);
 if(q==='thoi'||q==='huy bo'){const had=!!p.giftFor;p.giftFor=null;c.emit(w,p,had?'Thôi tặng hộ • quà từ giờ tính cho chính mình':'Chưa chọn người để tặng hộ','status',now);return {ok:true,cleared:had};}
 const end=giftForEventEnd(w,now);
 if(!q){
  const g=p.giftFor,t=g&&now<g.until&&end?w.players[g.to]:null;
  c.emit(w,p,t?`Đang tặng hộ ${t.name} #${t.socialCode||''} • gõ tang thoi để thôi`:'Gõ tang kèm tên hoặc mã người đang ở LIVE • quà sự kiện skin, linh thú sẽ về người đó','status',now);
  return {ok:true};
 }
 if(!end)return fail('Tặng hộ chỉ dùng khi sự kiện skin hoặc Linh Thú Cốc đang mở.');
 const matches=findPresent(w,query,now,c.active);
 if(matches.some(x=>x.id===p.id)&&matches.length===1)return fail('Không thể tự tặng hộ chính mình.');
 const others=matches.filter(x=>x.id!==p.id);
 if(!others.length)return fail(`Không thấy ${query.slice(0,24)} đang ở LIVE • gõ tang kèm đúng tên hoặc mã`);
 if(others.length>1)return fail('Trùng tên: '+others.slice(0,3).map(x=>x.name+' #'+x.socialCode).join(' · ')+' • gõ tang kèm mã');
 const t=others[0];
 p.giftFor={to:t.id,toName:t.name,at:now,until:Math.min(end,now+GIFT_FOR_MS)};
 c.emit(w,p,`Tặng hộ ${t.name} • quà sự kiện skin, linh thú về ${t.name} • tang thoi để thôi`,'status',now,{giftFor:{to:t.id,toName:t.name}});
 return {ok:true,giftFor:t.id};
}

// Người nhận cho món quà này: {target} nếu hợp lệ, {missing,name} nếu người nhận đã rời LIVE, null nếu không tặng hộ.
export function giftForTarget(w,p,now,active){
 const g=p.giftFor;if(!g)return null;
 if(now>=g.until||!giftForEventEnd(w,now)){p.giftFor=null;return null;}
 if(w.settings?.giftForOthers===false)return null;
 const t=w.players[g.to];
 if(!t||t.id===p.id||t.resident||t.puppet||!active(w,t,now))return {missing:true,name:g.toName};
 return {target:t};
}
