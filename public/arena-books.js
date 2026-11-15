// Bí pháp chiêu thức Lôi Đài (15/11/2026). Học bằng "học <tên>" (linh thạch + linh thảo; bậc cao cần cảnh giới + đủ huy chương — KHÔNG trừ huy chương).
// Tự xếp 2 bí pháp mạnh nhất vào SK2/SK3; "chiêu đổi <tên>" để chọn tay. power ≤ 1.12 để luật tỉ lệ thắng theo tu vi không lệch.
export const BOOK_TIER_NAME=Object.freeze({1:'Phàm',2:'Linh',3:'Huyền',4:'Địa',5:'Thiên'});
// bannerTier: bậc bảng chiêu (1–4). grade: bậc bí pháp (1 Phàm … 5 Thiên).
export const ARENA_BOOKS=Object.freeze([
 {id:'liet-phong',name:'Liệt Phong Chưởng',grade:1,tech:'stardust',effect:'knock',stones:300,herbs:20,realm:0,medals:0},
 {id:'han-bang',name:'Hàn Băng Chỉ',grade:1,tech:'frost',effect:'weaken',stones:300,herbs:20,realm:0,medals:0},
 {id:'doc-long',name:'Độc Long Vụ',grade:2,tech:'soul',art:'poison',effect:'burn',stones:900,herbs:60,realm:2,medals:0},
 {id:'thanh-moc',name:'Thanh Mộc Triền',grade:2,tech:'petal',effect:'stun',stones:900,herbs:60,realm:2,medals:0},
 {id:'nhu-y',name:'Như Ý Thần Côn',grade:2,tech:'bell',art:'staff',effect:'break',stones:1000,herbs:70,realm:3,medals:0},
 {id:'phong-bao',name:'Cửu Thiên Phong Bạo',grade:3,tech:'vortex',art:'tornado',effect:'knock',stones:2500,herbs:150,realm:5,medals:0},
 {id:'no-dao',name:'Thương Hải Nộ Đào',grade:3,tech:'dragon',art:'wave',effect:'drain',stones:2500,herbs:150,realm:5,medals:0},
 {id:'kim-cuong',name:'Kim Cương Hộ Thể',grade:3,tech:'bell',art:'golden-avatar',effect:'reflect',stones:2500,herbs:150,realm:5,medals:0},
 {id:'van-kiem',name:'Vạn Kiếm Quy Nhất',grade:4,tech:'sword',art:'sword-rain',effect:'break',stones:4500,herbs:250,realm:7,medals:6},
 {id:'hoa-long',name:'Phần Thiên Hỏa Long',grade:4,tech:'flame',art:'fire-dragon',effect:'burn',stones:4500,herbs:250,realm:7,medals:6},
 {id:'khai-thien',name:'Khai Thiên Cự Phủ',grade:5,tech:'thunder',art:'axe',effect:'stun',stones:8000,herbs:400,realm:9,medals:15},
 {id:'tinh-ha',name:'Tinh Hà Đảo Lưu',grade:5,tech:'stars',effect:'drain',stones:8000,herbs:400,realm:9,medals:15}
].map(b=>Object.freeze({...b,power:[1,1,1.03,1.06,1.09,1.12][b.grade],tier:[1,2,2,3,3,4][b.grade]})));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
export const bookById=id=>ARENA_BOOKS.find(b=>b.id===id)||null;
export function findBook(text){const q=norm(text);if(q.length<3)return null;return ARENA_BOOKS.find(b=>norm(b.name)===q)||ARENA_BOOKS.find(b=>norm(b.name).startsWith(q))||ARENA_BOOKS.find(b=>norm(b.name).includes(q))||null;}
/** 2 bí pháp đang xếp ô của người chơi (tay chọn trước, còn lại tự lấy bậc cao nhất). */
export function bookLoadout(p){
 const learned=(p?.arenaBooks||[]).map(bookById).filter(Boolean);
 const picked=(p?.arenaLoadout||[]).map(bookById).filter(b=>b&&learned.includes(b));
 const rest=learned.filter(b=>!picked.includes(b)).sort((a,b)=>b.grade-a.grade||b.stones-a.stones);
 return [...picked,...rest].slice(0,2);
}
