// 11/11/2026: LỆNH SỐ — người xem chỉ cần gõ 1…9 thay vì nhớ cú pháp (học từ các phòng tu tiên đông người).
// 1–5, 7–9 cố định; 6 đổi theo sự kiện đang mở (gõ đầu, mê cung, đua kiếm, tỷ thí, cơ duyên, yêu thú), không có sự kiện thì là "gợi ý".
// Khi câu đố mẹo hoặc câu hỏi lò đan đang mở, số là đáp án → lệnh số tự nhường.
import {bonkOpen} from './bonk.mjs';
import {towerOpen} from './tower.mjs';
import {SKY_EVENTS} from './engine.mjs'; // chỉ đọc lúc chạy hàm, vòng import an toàn
// 11/11 (2): chỉ lệnh CƠ BẢN và GÕ LẶP NHIỀU mới có số; lệnh 1 lần/ngày hoặc ít dùng (điểm danh, học, trang bị, gợi ý) giữ chữ.
export const QUICK_BASE=[
 {n:'1',cmd:'tuluyen',say:'tu luyện',text:'vận công'},
 {n:'2',cmd:'hai',say:'hái',text:'hái linh thảo'},
 {n:'3',cmd:'danh',say:'đánh',text:'đánh yêu thú'},
 {n:'4',cmd:'luyendan',say:'luyện đan',text:'luyện đan dược'},
 {n:'5',cmd:'dung',say:'dùng',text:'uống đan'},
 {n:'7',cmd:'ren',say:'rèn',text:'rèn pháp bảo'},
 {n:'8',cmd:'dotpha',say:'đột phá',text:'lên cảnh giới'},
 {n:'9',cmd:'tuvi',say:'tu vi',text:'xem tiến độ'}
];
const FALLBACK={cmd:'goiy',say:'gợi ý',text:'hỏi việc nên làm'};
export function eventQuick(w,now){
 if(towerOpen(w,now))return {cmd:'leothap',say:'leo tháp',name:'VÂN HẢI THÁP',text:'xếp lượt vào tháp',endsAt:w.tower.endsAt};
 if(bonkOpen(w,now))return {cmd:'godau',say:'gõ đầu',name:'HỘI GÕ ĐẦU',text:'gõ đầu người gần nhất',endsAt:w.bonkFest.endsAt};
 const m=w.maze;
 if(m?.phase==='registration'&&now<m.registrationEndsAt)return {cmd:'mecung',say:'mê cung',name:'BÍ CẢNH MÊ CUNG',text:'ghi danh vào mê cung',endsAt:m.registrationEndsAt};
 if(m?.phase==='running')return {cmd:'mecung',say:'mê cung',name:'BÍ CẢNH MÊ CUNG',text:'nhảy vào mê cung',endsAt:m.endsAt};
 const r=w.race;if(r?.phase==='registration')return {cmd:'bay',say:'bay',name:'ĐUA PHI KIẾM',text:'ghi danh đua phi kiếm',endsAt:r.registrationEndsAt};
 const t=w.tournament;if(t?.phase==='registration')return {cmd:'tythi',say:'tỷ thí',name:'LUẬN KIẾM',text:'ghi danh tỷ thí',endsAt:t.registrationEndsAt};
 const v=w.visitor;if(v&&!v.closedAt&&now<v.endsAt)return {cmd:'coduyen',say:'cơ duyên',name:'KHÁCH QUÝ GIÁNG LÂM',text:'nhận quà khách quý',endsAt:v.endsAt};
 const o=w.opportunity;if(o&&now<o.endsAt)return {cmd:'coduyen',say:'cơ duyên',name:'CƠ DUYÊN',text:'xem tiến độ cơ duyên',endsAt:o.endsAt};
 const f=w.flowerEvent;if(f&&!f.closedAt&&now>=(f.startedAt||0)&&now<f.endsAt)return {cmd:'tuluyen',say:'tu luyện',name:String(SKY_EVENTS[f.kind||'flower']?.name||'Mưa hoa').toLocaleUpperCase('vi'),text:'gõ lệnh chơi để ghi điểm',endsAt:f.endsAt};
 const b=w.boss;if(b&&b.hp>0&&now<b.endsAt)return {cmd:'danh',say:'đánh',name:'YÊU THÚ XÂM PHẠM',text:'cùng đánh yêu thú',endsAt:b.endsAt};
 return null;
}
export function digitsClaimed(w,now){
 const q=w.quiz;if(q&&!q.closedAt&&now<q.endsAt)return true;
 const z=w.alchemy?.phase==='brewing'?w.alchemy.quiz:null;return !!(z&&!z.resolved&&now>=z.startsAt&&now<z.endsAt);
}
// Trả về lệnh thật cho tin nhắn chỉ gồm một chữ số 1–9, hoặc null.
export function resolveQuick(w,words,now){
 if(words.length!==1||!/^[1-9]$/.test(words[0])||digitsClaimed(w,now))return null;
 if(words[0]==='6')return (eventQuick(w,now)||FALLBACK).cmd;
 return QUICK_BASE.find(q=>q.n===words[0]).cmd;
}
// Dữ liệu cho bảng "CHƠI NHANH · GÕ SỐ" và dải tin sự kiện trên overlay.
export function quickView(w,now){
 const ev=eventQuick(w,now),six=ev||FALLBACK;
 return {paused:digitsClaimed(w,now),rows:[...QUICK_BASE.slice(0,5),{n:'6',say:six.say,text:six.text,event:!!ev},...QUICK_BASE.slice(5)].map(({n,say,text,event})=>({n,say,text,event:!!event})),
  event:ev?{name:ev.name,say:ev.say,text:ev.text,endsAt:ev.endsAt||null}:null};
}
