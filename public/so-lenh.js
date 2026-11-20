// 20/11/2026 — SỔ LỆNH (soát hướng dẫn, docs/CAI-TIEN-2026-11-20.md mục 3).
// Hướng dẫn 3 tầng, mọi nơi cùng một kiểu "Gõ <số> · <việc>":
//  Tầng 1 — người mới: 3 lệnh bài 1 · 8 · 6 cố định góc trên phải (thuy-mac-hud.js) + dòng "GÕ SỐ VÀO BÌNH LUẬN".
//  Tầng 2 — từng người: nhãn bước kế trên đầu, tối đa HINT_MAX cả sân (tan-de-tu.js, scene.js).
//  Tầng 3 — người đã quen: SỔ LỆNH xoay trong cuộn Thiên Bảng (vùng trời: không bị bình luận TikTok che, không đè người).
//    Mỗi trang ≤4 dòng, 1 chủ đề. Ai gõ lệnh mà thiếu điều kiện → đúng trang đó hiện ngay 15 s (forceSoLenh).
// Thay bảng thông tin to góc dưới phải cũ (info-spotlight.js — nằm trong vùng bình luận, 10+ trang dày chữ).
// 9 lệnh số lõi: 1 tu luyện · 2 hái · 3 đánh · 4 luyện đan · 5 dùng đan · 6 cơ duyên · 7 rèn · 8 đột phá · 9 xem tu vi.
export const SO_LENH=Object.freeze([
 {id:'tu',title:'SỔ LỆNH · TU LUYỆN',rows:[['1','tu luyện'],['8','đột phá'],['9','xem còn thiếu gì'],['6','nhận cơ duyên']]},
 {id:'dan',title:'SỔ LỆNH · LINH ĐAN',rows:[['2','hái linh thảo'],['4','luyện đan'],['5','uống đan']]},
 {id:'bao',title:'SỔ LỆNH · PHÁP BẢO',rows:[['7','rèn pháp bảo'],['3','pháp bảo tung chiêu'],['trang bị','đeo món mạnh nhất'],['học','học bí pháp']]},
 {id:'me',title:'SỔ LỆNH · CỦA MÌNH',rows:[['điểm danh','quà mỗi ngày'],['túi đồ','đồ đang có'],['skin','tủ skin'],['nhiệm vụ','nhiệm vụ hôm nay']]},
 {id:'duong',title:'SỔ LỆNH · NGŨ ĐƯỜNG',rows:[['đường','xem 5 Đường'],['vào đường 1–5','gia nhập'],['đường chiến','vào trận'],['thách đấu 1–5','tranh ghế Trưởng Lão']]},
 {id:'than',title:'SỔ LỆNH · THẦN KHÍ',rows:[['cầu','cầu thần khí (Bảo Khố)'],['thần khí','xem bộ sưu tập'],['chiêu','xem chiêu Lôi Đài']]},
 // late: chỉ xoay tới khi sân đã có người ở 3 cảnh giới cuối hoặc đã chuyển sinh (lateSoLenh)
 {id:'luan',late:true,title:'SỔ LỆNH · LUÂN HỒI',rows:[['chuyển sinh','khi đầy cảnh giới cuối'],['luân hồi','xem ân điển'],['đạo quả kiếm','hoặc thể / đan / phúc']]}
]);
export const lateSoLenh=state=>!!state?.players?.some(p=>(p.realm||0)>=26||p.reincarnations>0);
// Thiên Bảng 20 s → Sổ lệnh 12 s → Ngũ Đường 8 s (ngu-duong-ui.js hallsRankHTML).
export const BOARD_CYCLE_MS=40000,TOP_MS=20000,SO_LENH_MS=12000,FORCE_MS=15000;
const CMD_PAGE={tuluyen:'tu','1':'tu',dotpha:'tu','8':'tu',tuvi:'tu','9':'tu',coduyen:'tu','6':'tu',
 hai:'dan','2':'dan',luyendan:'dan','4':'dan',dung:'dan','5':'dan',
 ren:'bao','7':'bao',danh:'bao','3':'bao',trangbi:'bao',hoc:'bao',
 diemdanh:'me',tuido:'me',skin:'me',nhiemvu:'me',
 duong:'duong',vao:'duong',roi:'duong',duongchien:'duong',thachdau:'duong',chantruyen:'duong',baisu:'duong',troluc:'duong',
 cau:'than',thankhi:'than',banmenh:'than',chieu:'than'};
const TEXT_PAGE=[[/rèn|pháp bảo|bí pháp|trang bị/i,'bao'],[/đan|linh thảo|hái/i,'dan'],[/Đường|Trưởng Lão|Chân Truyền|bái sư|thách đấu/,'duong'],[/thần khí|Bảo Khố|cầu bảo/i,'than'],[/Chưa đủ đột phá|tu vi.*thiếu|thiếu .*tu vi/i,'tu']];
let forced=null,lastForce=0;
// Sự kiện từ server: người gõ lệnh thất bại/xem trạng thái → bật đúng trang. Trả id trang (hoặc null).
export function forceSoLenh(e,now=Date.now()){
 if(!e||e.gift||!e.user||now-lastForce<8000)return null;
 if(!(e.cmdFail||e.effect==='status'||['craft','learn','equip','brew','use','hall'].includes(e.effect)))return null;
 const id=(e.cmd&&CMD_PAGE[String(e.cmd).replace(/\s+/g,'')])||TEXT_PAGE.find(([re])=>re.test(String(e.text||'')))?.[1];
 if(!id)return null;forced={id,until:now+FORCE_MS};lastForce=now;return id;
}
// Trang sổ lệnh phải hiện lúc này: bị gọi (forceSoLenh) thì trang đó; không thì theo vòng — mỗi chu kỳ 1 trang kế.
export function soLenhPage(now=Date.now(),late=false){
 if(forced&&now<forced.until)return SO_LENH.find(p=>p.id===forced.id)||null;
 const pages=SO_LENH.filter(p=>late||!p.late);return pages[Math.floor(now/BOARD_CYCLE_MS)%pages.length];
}
export const soLenhForced=(now=Date.now())=>!!forced&&now<forced.until;
export function soLenhHTML(p,esc){
 if(!p)return '';
 return `<div class="qi-leaders hall-ranks so-lenh"><b>${esc(p.title)}</b><small>Gõ vào bình luận</small>${p.rows.map(([k,v])=>`<span><i class="sl-key">${esc(k)}</i><em>${esc(v)}</em></span>`).join('')}</div>`;
}
// Dùng trong test.
export const _resetSoLenh=()=>{forced=null;lastForce=0;};
