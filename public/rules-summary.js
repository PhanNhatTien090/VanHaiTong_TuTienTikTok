import {bondRuleText} from './bond-policy.js';
import {liveRulesActive} from './live-integrity.js';
export function rulesSummaryHTML(state={}){
 const gameplay=liveRulesActive(state),showcase=state.settings?.ascensionShowcase===true;
 const cards=[
  ['Nhập môn và tu luyện','Gõ <code>nhập môn nam</code> / <code>nhập môn nữ</code> để chọn nhân vật; <code>tu luyện</code> để vận công, <code>hái</code> để hái thảo, <code>điểm danh</code> để điểm danh. Thưởng tu luyện thay đổi theo cảnh giới và Phúc duyên đang có.'],
  ['Nhiệm vụ và sự kiện',gameplay?'Nhiệm vụ ngày: tu luyện 1 lần, hái thảo 1 lần, đánh quái 3 lần. Tim, theo dõi, chia sẻ và bình luận bất kỳ không cộng tài nguyên hoặc điểm nhiệm vụ. Linh Thú Cốc tính lượt tu luyện/hái/đánh khi đang mở; gõ <code>thú</code> xem tiến độ.':'Thế giới này đang dùng luật tương tác cũ: tim và bình luận có thể cộng tiến độ. Dữ liệu DEMO tách biệt LIVE.'],
  ['Học và chế tạo','Gõ <code>học</code>, <code>rèn</code>, <code>luyện đan</code>, <code>dùng</code>, <code>trang bị</code>. Đồ chế tạo dùng tài nguyên game; đồ độc quyền có điều kiện nhận riêng trong danh mục.'],
  ['Đột phá',showcase?'Gõ tu luyện / hái để tăng tu vi và linh thạch theo cảnh giới hiện tại; đủ điều kiện gõ đột phá. Cảnh giới đầu nhanh hơn, càng lên cao càng cần nhiều lượt chơi hơn. Không yêu cầu quà để mở cảnh giới cao.':'Gõ <code>tu vi</code> để xem điều kiện, <code>đột phá</code> khi đủ tu vi và linh thạch. Đột phá không có xác suất thất bại. Mốc Tiên Đế hiện còn yêu cầu tổng quà 100 coin; không phải mọi mốc đều chỉ cần tài nguyên chơi tay.'],
  ['Quà và Phúc duyên','Quà là tự nguyện; phần thưởng chỉ dùng trong game, không quy đổi thành tiền. Phúc duyên thông thường: tổng một lượt dưới 10 coin ×3; 10–99 ×5; 100–999 ×8; từ 1.000 ×12, trong 10 phút. Lượt quà đầu có thưởng riêng và kéo dài 20 phút; xem biên nhận để biết mức thực nhận.'],
  ['Đạo lữ và VIP',bondRuleText()+' Gõ kết duyên kèm mã → người nhận đồng ý. Hủy duyên kèm mã để chọn đúng quan hệ.'],
  ['NPC và mô phỏng','NPC là nhân vật máy, có nhãn riêng và không nằm trong bảng người chơi/quà thật. Công cụ thử nhân vật, tim và quà chỉ dùng ở thế giới DEMO.']
 ];
 return cards.map(([title,text])=>`<div class="guide-card"><h3>${title}</h3><p>${text}</p></div>`).join('');
}
