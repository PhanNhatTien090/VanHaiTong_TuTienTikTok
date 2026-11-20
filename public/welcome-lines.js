// 20/11/2026 (chủ game: "giọng chào trễ quá, toàn đợi người ta lướt đi rồi mới chào"):
// câu chào ĐỌC SẴN bằng VieNeu (giọng tông sư) → phát ngay lúc TikTok báo có người vào, không phải chờ tạo giọng.
// Tên người hiện trên lệnh bài; giọng không đọc tên (tên đọc theo từng người mới là thứ làm trễ).
// Câu chỉ nói lệnh gõ trong game, KHÔNG hứa thưởng cho tim/follow/share (luật chống mồi tương tác 09/11).
// Tạo file: node scripts/make-welcome-voice.mjs (trên máy có VieNeu) → public/assets/voice-welcome-v1/*.mp3 + manifest.json.
// Chưa có manifest (chưa tạo file) → mọi thứ chạy như cũ.
export const WELCOME_DIR='/assets/voice-welcome-v1/';
export const WELCOME_MANIFEST=WELCOME_DIR+'manifest.json';
const RAW={
 // Người lần đầu vào LIVE.
 new:[
  'Có đạo hữu mới ghé sơn môn! Gõ một để nhập môn.',
  'Chào mừng đạo hữu đến Vân Hải Tông. Gõ một là bắt đầu tu luyện.',
  'Tân đệ tử đã tới. Chào lão phu một câu là được nhập môn.',
  'Hoan nghênh đạo hữu! Gõ một, cùng đồng môn tu tiên.',
  'Linh khí vừa động, có người mới tới. Gõ một để bước lên con đường tu tiên.',
  'Sơn môn rộng mở đón đạo hữu. Bình luận một câu là nhập môn ngay.',
  'Lão phu thấy có người mới. Đạo hữu gõ một để nhận lệnh bài nhập môn.',
  'Chào đạo hữu mới! Tên đã khắc lên lệnh bài, gõ một để nhập môn.',
 ],
 // Người cũ quay lại: chỉ dùng khi câu chào có tên chưa kịp tạo (trước đây bị bỏ im lặng).
 back:[
  'Đồng môn đã trở lại! Gõ một tu luyện tiếp nào.',
  'Mừng đạo hữu quay về tông môn.',
  'Đạo hữu về rồi! Linh khí vẫn chờ, gõ một tu luyện tiếp.',
 ],
 // Bình luận đầu tiên = nhập môn (lên Luyện Khí, +20 linh thạch, +5 linh thảo).
 nhapmon:[
  'Nhập môn thành công! Chúc mừng đạo hữu bước vào Luyện Khí.',
  'Lệnh bài đã nhận. Từ nay đạo hữu là đệ tử Vân Hải Tông!',
  'Tốt lắm! Đạo hữu đã nhập môn, gõ một để tu luyện tiếp.',
  'Chào mừng đệ tử mới! Lão phu tặng chút linh thạch và linh thảo làm lộ phí.',
  'Nhập môn rồi! Đạo hữu gõ một để tu vi tăng dần.',
 ],
};
export const WELCOME_LINES=Object.freeze(Object.fromEntries(Object.entries(RAW).map(([kind,list])=>[kind,Object.freeze(list.map((text,i)=>Object.freeze({kind,text,file:`${WELCOME_DIR}${kind}-${String(i+1).padStart(2,'0')}.mp3`})))])));
export const allWelcomeLines=()=>Object.values(WELCOME_LINES).flat();

/** Chọn câu đọc sẵn theo loại; chỉ dùng file có trong manifest; không lặp lại 3 câu gần nhất cùng loại. */
export class WelcomeClips{
 constructor({random=Math.random}={}){this.random=random;this.ready=new Set();this.recent=new Map();}
 async load(fetcher=globalThis.fetch){
  try{const r=await fetcher(WELCOME_MANIFEST+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)return false;const m=await r.json();this.use(m?.files||[]);return true;}catch{return false;}
 }
 use(files){const ok=new Set(files);this.ready=new Set(allWelcomeLines().filter(l=>ok.has(l.file)).map(l=>l.file));}
 has(kind){return (WELCOME_LINES[kind]||[]).some(l=>this.ready.has(l.file));}
 pick(kind){
  const pool=(WELCOME_LINES[kind]||[]).filter(l=>this.ready.has(l.file));if(!pool.length)return null;
  const recent=this.recent.get(kind)||[],fresh=pool.filter(l=>!recent.includes(l.file)),from=fresh.length?fresh:pool;
  const line=from[Math.min(from.length-1,Math.floor(this.random()*from.length))];
  this.recent.set(kind,[...recent,line.file].slice(-Math.min(3,pool.length-1)));return line;
 }
}
