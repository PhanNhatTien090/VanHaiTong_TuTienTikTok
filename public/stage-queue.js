// 11/11/2026: VÂN ĐÀI · CHỜ LƯỢT — cho người xem thấy mình đang xếp hàng lên giữa màn hình.
// Hàng chờ trình chiếu (presentation.js) vốn đã chỉ chiếu 1 màn mỗi lúc; bảng này chỉ ĐỌC hàng chờ đó và
// in tối đa 3 lượt kế tiếp kèm lý do + thời gian chờ ước tính. Chỉ là chữ HTML → gần như không tốn máy.
import {presentationPriority,presentationDuration} from './presentation.js';
import {breakthroughRealm,REALM_NAMES} from './breakthrough-fx.js';
const MAX_ROWS=3;
export function stageReason(e){
 if(e.heavenStrike)return 'Thiên Đạo giáng lôi';
 if(e.ceremony)return 'đại điển vinh danh';
 if(e.gift&&!e.resident)return 'dâng lễ vật';
 if(e.adminGift)return 'lễ Tông Chủ ban';
 if(e.achieve)return {craft:'rèn thành pháp bảo',learn:'lĩnh ngộ bí pháp',vip:'thăng hộ pháp',genius:'thiên tài xuất thế'}[e.achieve.kind]||'báo hỷ';
 if(e.effect==='breakthrough'){const r=breakthroughRealm(e);return 'đột phá'+(REALM_NAMES[r]?' '+REALM_NAMES[r]:'');}
 if(e.transform)return 'hóa hình';
 if(e.petAward)return 'linh thú đồng hành';
 if(e.loyaltyAward||e.visitorAward)return 'nhận tri ân';
 return {skin:'khoác trang phục mới',victory:'thắng bí cảnh',opportunity:'nhận cơ duyên',blessing:'được ban phúc',status:'xem tu vi',ready:'đủ đột phá',title:'nhận danh hiệu',flower:'nhận thưởng mưa hoa',visitor:'gặp khách quý',tournament:'luận kiếm',bond:'kết duyên',social:'đồng môn'}[e.effect]||null;
}
// Lượt đáng hiện: có tên người thật, có lý do, ưu tiên ≥2 (bỏ việc vặt như tu luyện/nhập môn thường).
export function waitingRows(items,now,current=null){
 let wait=current?Math.max(0,current.at+presentationDuration(current.e)-now):0;const rows=[];
 for(const e of items){
  const reason=stageReason(e),show=reason&&e.name&&!e.resident&&!e.puppet&&(presentationPriority(e)>=2||!!e.adminGift);
  if(show&&rows.length<MAX_ROWS)rows.push({name:Array.from(String(e.name)).slice(0,14).join(''),reason,waitSec:Math.max(1,Math.round(wait/1000))});
  wait+=presentationDuration(e)+200;if(rows.length>=MAX_ROWS)break;
 }
 return rows;
}
export function stageQueueHTML(rows,esc){
 if(!rows.length)return '';
 return '<b>☁ VÂN ĐÀI · CHỜ LƯỢT</b><ol>'+rows.map((r,i)=>`<li><i>${i+1}</i><strong>${esc(r.name)}</strong><span>${esc(r.reason)}</span><em>~${r.waitSec}s</em></li>`).join('')+'</ol>';
}
export function renderStageQueue(el,items,now,current,esc){
 if(!el)return;const html=stageQueueHTML(waitingRows(items,now,current),esc);
 if(el._html!==html){el.innerHTML=html;el._html=html;}el.hidden=!html;
}
