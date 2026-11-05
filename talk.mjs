// 4/11/2026: khuyến khích người xem trò chuyện với nhau (không phải spam lệnh).
// Câu trò chuyện thường (không phải lệnh) → bong bóng thoại trên đầu nhân vật ~6 giây (đã lọc link, số điện thoại, từ tục; ≤40 ký tự)
// + trạng thái "Luận Đạo" 5 phút: +20% tu vi khi vận công. Thưởng theo TRẠNG THÁI, không theo số câu,
// và câu lặp lại y hệt không gia hạn → spam chat không được thêm gì.
const TALK_BLOCK=/(đ[iị]t|\bdm+\b|\bđm+\b|\bvcl\b|\bvkl\b|\bclm\b|\bcmm\b|l[ồ]n|c[ặ]c|bu[ồ]i|đ[eé]o|\bđĩ\b|\bdit\b|\bdjt\b)/giu;
const LINK=/https?:\/\/\S+|www\.\S+|\S+\.(com|vn|net|me|io|xyz)\S*/gi;
const PHONE=/\d[\d\s.-]{6,}\d/g;
export const TALK_BUFF_MS=5*60000,TALK_SHOW_MS=6500;
export function safeTalk(t){
 const s=String(t||'').normalize('NFC').replace(LINK,'').replace(PHONE,'***').replace(TALK_BLOCK,'***').replace(/\s+/g,' ').trim(),a=Array.from(s);
 return a.length>40?a.slice(0,38).join('')+'…':s;
}
const plain=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
// Mọi lệnh/biệt danh game đang nhận (engine COMMANDS + lệnh của các module sự kiện) — dạng không dấu, viết liền.
export const COMMAND_WORDS=new Set(['cungtu','giup','bay','baykiem','dua','duakiem','tangtoc','goiy','huongdan','lenh','help','nhapmon','gioitinh','xungho','xunghieu','tuvi','xem','thongtin','tv','check','tuluyen','dotpha','hai','diemdanh','danh','hoc','ren','luyendan','dung','trangbi','skin','coduyen','tythi','ketduyen','dongy','tuchoi','duyen','huyduyen','nhan','hongbao','nhiemvu','thu','linhthu','batthu','huy','lienket','a','b','c','nam','nu','an']);
// Lệnh trùng từ tiếng Việt thường gặp (hai, ăn, năm, xem, đúng, học, bay, thử…) chỉ tính là lệnh khi đứng đầu câu ≤ 2 từ,
// để "hai người ơi", "học bài chưa" vẫn là trò chuyện. Lệnh đặc trưng (tuluyen, dotpha…) chặn ở mọi vị trí trong câu ngắn.
const COMMON=new Set(['hai','an','nam','nu','xem','dung','hoc','ren','bay','thu','huy','danh','nhan','duyen','dua','a','b','c','tv','giup','lenh','tuvi','skin','check','help']);
const DISTINCT=new Set([...COMMAND_WORDS].filter(w=>!COMMON.has(w)));
const CMD_LIST=[...DISTINCT].sort((a,b)=>b.length-a.length);
// 4/11/2026: "câu có dáng lệnh" — kể cả gõ lệch: có dấu (tuluyện), có cách (tu luyen, dot pha), kèm số/ký tự (tuluyen123, dotpha!!!),
// lặp (tuluyen tuluyen), câu ngắn chứa lệnh (tu luyen di), hoặc bắt đầu bằng ! hay /. Những câu này KHÔNG phải trò chuyện.
export function isCommandLike(text){
 const raw=String(text||'').trim();if(/^[!/]/.test(raw))return true;
 const words=plain(raw).split(' ').filter(Boolean);if(!words.length)return true;
 const letters=words.map(w=>w.replace(/[0-9]+/g,'')).filter(Boolean),joined=letters.join('');
 if(!joined)return true; // chỉ số
 if(COMMAND_WORDS.has(joined))return true;
 if(letters.every(w=>DISTINCT.has(w)))return true; // tuluyen tuluyen, dotpha tuluyen
 if(letters.length<=2&&COMMON.has(letters[0]))return true; // "hai", "ren kiem", "xem 2"
 // Lệnh đặc trưng dính rác phía sau (dotphaaa, tuluyenn) hoặc ghép hai âm (tu luyen, dot pha) trong câu ngắn ≤ 3 từ.
 if(words.length<=3)for(const c of CMD_LIST){if(joined.startsWith(c)&&joined.length<=c.length+4)return true;}
 // Câu ≤ 5 từ có chứa lệnh đặc trưng ("anh em ơi tuluyen đi") vẫn là rủ gõ lệnh, không phải luận đạo.
 if(words.length<=5)for(let i=0;i<letters.length;i++){const one=letters[i],two=one+(letters[i+1]||'');if(DISTINCT.has(one)||DISTINCT.has(two))return true;}
 return false;
}
// Trò chuyện thật: không phải lệnh, ≥ 2 từ có chữ, tổng ≥ 6 chữ cái.
export function isRealTalk(text){
 if(isCommandLike(text))return false;
 const words=plain(text).split(' ').filter(w=>/\p{L}/u.test(w));
 return words.length>=2&&words.join('').replace(/[0-9]/g,'').length>=6;
}
export function talk(p,text,now){
 if(!p||p.resident||p.puppet)return false;
 if(isCommandLike(text))return false; // lệnh (kể cả gõ lệch) không hiện bong bóng, không tính Luận Đạo
 const s=safeTalk(text);if(Array.from(s.replace(/[^\p{L}\p{N}]/gu,'')).length<2)return false;
 if(now-(p.talk?.at||0)>=2500)p.talk={text:s,at:now};
 // Chỉ trò chuyện thật mới bật/gia hạn Luận Đạo; câu lặp y hệt câu trước không gia hạn.
 const key=plain(s);if(isRealTalk(text)&&key!==p.lastTalkKey)p.talkUntil=now+TALK_BUFF_MS;p.lastTalkKey=key;
 return true;
}
export const talking=(p,now)=>now!==null&&now!==undefined&&(p.talkUntil||0)>now;
