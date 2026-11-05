// Sự kiện riêng theo từng món quà TikTok. Dùng chung cho máy chủ (engine, giọng đọc) và trang (hiệu ứng).
// Nhận diện theo tên quà TikFinity gửi (thường là tiếng Anh: "Rose", "Corgi"…); quà lạ → hiệu ứng theo mốc coin.
// Thêm quà mới: thêm vào NAMES (tên tiếng Việt cho giọng đọc) và/hoặc thêm từ khóa vào KINDS.

// Tên tiếng Việt cho các quà phổ biến (khóa viết thường).
export const NAMES={
  'rose':'Hoa hồng','tiktok':'TikTok','finger heart':'Tim ngón tay','heart me':'Thương tôi','hand hearts':'Tim bàn tay',
  'perfume':'Nước hoa','doughnut':'Bánh vòng','donut':'Bánh vòng','ice cream cone':'Kem ốc quế','gg':'GG','love you':'Yêu bạn',
  'corgi':'Chó Corgi','lion':'Sư tử','galaxy':'Dải ngân hà','universe':'Vũ trụ','sunglasses':'Kính râm','confetti':'Pháo giấy',
  'rosa':'Hoa hồng','sunflower':'Hoa hướng dương','tulip':'Hoa tulip','bouquet':'Bó hoa','cat':'Mèo','cute cat':'Mèo con',
  'cat paws':'Chân mèo','meow':'Mèo','kitty':'Mèo con','dog':'Cún','puppy':'Cún con','crown':'Vương miện','rocket':'Tên lửa',
  'sports car':'Xe thể thao','private jet':'Phi cơ','yacht':'Du thuyền','whale diving':'Cá voi','jellyfish':'Sứa phát sáng',
  'dragon':'Rồng','unicorn':'Kỳ lân','panda':'Gấu trúc','rabbit':'Thỏ','butterfly':'Bươm bướm','cake':'Bánh kem','coffee':'Cà phê',
  'planet':'Hành tinh','meteor shower':'Mưa sao băng','star':'Ngôi sao','fireworks':'Pháo hoa','mic':'Micro','hat and mustache':'Mũ và ria',
};

// kind: hiệu ứng riêng. label: tên tiếng Việt khi không có trong NAMES. line: câu tông sư nói thêm.
export const KINDS={
  rose:     {re:/\bros(e|es|a)\b|hoa h[oồ]ng/i, label:'Hoa hồng', line:'Hoa hồng nở rộ khắp Vân Hải Tông!'},
  flower:   {re:/flower|bouquet|tulip|sunflower|lily|blossom|\bhoa\b/i, label:'Bó hoa', line:'Trăm hoa đua nở, linh khí ngát hương!'},
  heart:    {re:/heart|love|\btim\b|kiss/i, label:'Trái tim', line:'Tâm ý tương thông, linh khí hội tụ!'},
  cat:      {re:/\bcat|meow|kitty|kitten|m[eè]o|paw/i, label:'Mèo', line:'Linh miêu giáng thế, đến bầu bạn tu luyện!'},
  dog:      {re:/corgi|\bdog|pupp|shiba|husky|c[uú]n/i, label:'Cún', line:'Linh khuyển chạy tới hộ pháp!'},
  food:     {re:/donut|doughnut|ice cream|cake|candy|coffee|tea|pizza|burger|cookie|lollipop|b[aá]nh|kem/i, label:'Linh quả', line:'Món quà kích hoạt ánh sáng và cộng điểm cho nhân vật trong game!'},
  perfume:  {re:/perfume|n[uư]ớc hoa|spray/i, label:'Nước hoa', line:'Hương khí lan tỏa khắp tông môn!'},
  crown:    {re:/crown|king|queen|tiara|v[uư]ơng mi[eệ]n/i, label:'Vương miện', line:'Vương miện giáng xuống, uy chấn tông môn!'},
  lion:     {re:/\blion|s[uư] t[uử]|tiger/i, label:'Sư tử', line:'Sư tử hộ pháp gầm vang, chấn động sơn môn!'},
  cosmos:   {re:/galaxy|universe|planet|star|comet|meteor|moon|ng[aâ]n h[aà]|v[uũ] tr[uụ]/i, label:'Tinh hà', line:'Tinh hà xoay chuyển, thiên tượng hiển hiện!'},
  dragon:   {re:/dragon|r[oồ]ng|phoenix|ph[uư]ợng/i, label:'Rồng', line:'Thần long xuất thế, thiên địa rung chuyển!'},
  vessel:   {re:/rocket|jet|plane|car|yacht|ship|boat|train|t[eê]n l[uử]a|du thuy[eề]n|xe/i, label:'Phi chu', line:'Phi chu xé gió, lướt qua tiên giới!'},
  fish:     {re:/fish|whale|dolphin|jellyfish|shark|c[aá]|s[uứ]a/i, label:'Linh ngư', line:'Linh ngư bơi giữa mây trời!'},
  beast:    {re:/panda|bear|rabbit|bunny|unicorn|fox|deer|g[aấ]u|th[oỏ]|k[yỳ] l[aâ]n/i, label:'Linh thú', line:'Linh thú tìm đến chủ nhân!'},
  firework: {re:/firework|confetti|party|ph[aá]o/i, label:'Pháo hoa', line:'Pháo hoa rực rỡ mừng tông môn!'},
  gg:       {re:/^gg$|thumbs|finger|like|clap|\bok\b/i, label:'GG', line:'Kiếm khí tung hoành, đồng môn tán thưởng!'},
};

export function giftKind(name){const n=String(name||'').trim();if(!n)return null;for(const [k,v]of Object.entries(KINDS))if(v.re.test(n))return k;return null;}
export function giftNameVi(name,kind=giftKind(name)){const n=String(name||'').trim();return NAMES[n.toLowerCase()]||(kind?KINDS[kind].label:(n.slice(0,24)||'quà'));}
