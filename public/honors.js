// Honor is presentation only: no currency, stats or new commands.
export function safeAvatar(value){
 if(typeof value!=='string'||value.length>2048)return null;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&['tiktokcdn.com','tiktokcdn-us.com','tiktokcdn-eu.com','ibytedtos.com','byteoversea.com'].some(d=>u.hostname===d||u.hostname.endsWith('.'+d))?u.href:null;}catch{return null;}
}
export function eventAvatar(data){
 const user=data?.user||{};
 for(const obj of [user,data])for(const k of ['profilePictureUrl','profilePicture','avatarThumb','avatarMedium','avatarLarger']){
  const v=obj?.[k];for(const candidate of [v,v?.url,...(Array.isArray(v?.urlList)?v.urlList:[]),...(Array.isArray(v?.url_list)?v.url_list:[])]){const url=safeAvatar(candidate);if(url)return url;}
 }
 return null;
}
export function honorRoll(world,players=Object.values(world.players||{})){
 const real=players.filter(p=>!p.resident&&!p.puppet),blocked=prefix=>new Set((world.adminLog||[]).filter(r=>r.changes?.some(s=>s.startsWith(prefix))).map(r=>r.id));
 const realmEdits=blocked('cảnh giới '),giftEdits=blocked('coin quà ');
 const elder=real.filter(p=>p.realm>=4&&!realmEdits.has(p.id)).sort((a,b)=>b.realm-a.realm||b.totalQi-a.totalQi||String(a.id).localeCompare(String(b.id)))[0];
 const guardian=real.filter(p=>p.giftCoins>0&&!giftEdits.has(p.id)).sort((a,b)=>b.giftCoins-a.giftCoins||a.joinedAt-b.joinedAt||String(a.id).localeCompare(String(b.id)))[0];
 const champion=real.filter(p=>p.bossWins>0).sort((a,b)=>b.bossWins-a.bossWins||b.contribution-a.contribution||String(a.id).localeCompare(String(b.id)))[0];
 // v56: thêm chức vụ — Nhị/Tam Cung Phụng (quà 2, 3 trong số người đang có mặt), Nguyên Lão (tu luyện lâu nhất, ≥30 phút).
 const taken=new Set([elder,guardian,champion].filter(Boolean).map(p=>p.id));
 const gifters=real.filter(p=>p.active&&p.giftCoins>0&&!giftEdits.has(p.id)&&!taken.has(p.id)).sort((a,b)=>b.giftCoins-a.giftCoins||a.joinedAt-b.joinedAt);
 const second=gifters[0],third=gifters[1];[second,third].forEach(p=>p&&taken.add(p.id));
 const veteran=real.filter(p=>(p.activeMs||0)>=30*60000&&!taken.has(p.id)).sort((a,b)=>(b.activeMs||0)-(a.activeMs||0))[0];
 return [[elder,'elder','ĐẠI TRƯỞNG LÃO',0],[guardian,'guardian','ĐẠI HỘ PHÁP',1],[champion,'champion','CHIẾN THẦN',2],[second,'patron2','NHỊ CUNG PHỤNG',2],[third,'patron3','TAM CUNG PHỤNG',0],[veteran,'veteran','NGUYÊN LÃO TÔNG MÔN',0]].filter(([p])=>p).map(([p,role,title,frame])=>({id:p.id,name:p.name,avatar:safeAvatar(p.avatar),realm:p.realm,realmName:p.realmName,role,title,frame,active:!!p.active,detail:role==='guardian'||role==='patron2'||role==='patron3'?`${p.giftCoins.toLocaleString('vi-VN')} coin tích lũy`:role==='veteran'?`${Math.floor((p.activeMs||0)/60000).toLocaleString('vi-VN')} phút tu luyện cùng tông môn`:role==='champion'?`${p.bossWins} lần đứng đầu boss`:`${p.realmName||'Cảnh giới '+p.realm} · ${p.totalQi.toLocaleString('vi-VN')} tu vi`}));
}
export function honorTitle(p,roll=[]){
 if(p.resident||p.puppet)return null;
 if(p.sectMasterUnlocked&&p.sectMasterGiftAt)return {title:'TÔNG CHỦ',frame:1,rank:30,role:'sect-master'};
 const h=roll.find(h=>h.id===p.id);if(h)return h;
 // v56: danh hiệu đa dạng theo cảnh giới và coin quà tích lũy — lấy cái cao hơn (quà lớn thắng cảnh giới thấp).
 const g=Number(p.giftCoins)||0,r=Number(p.realm)||0;
 const byGift=g>=20000?{title:'THIÊN ĐẠO CUNG PHỤNG',frame:2,rank:9}:g>=10000?{title:'TỔNG HỘ PHÁP',frame:1,rank:8}:g>=5000?{title:'TRẤN SƠN HỘ PHÁP',frame:2,rank:7}:g>=2000?{title:'KIM BÀI HỘ PHÁP',frame:1,rank:6}:g>=1000?{title:'HỘ PHÁP',frame:1,rank:5}:g>=500?{title:'CUNG PHỤNG',frame:1,rank:3}:g>=200?{title:'QUÝ KHÁCH TÔNG MÔN',frame:0,rank:1}:null;
 const byRealm=r>=13?{title:'TIÊN ĐẾ',frame:1,rank:10}:r>=12?{title:'ĐẠI LA TÔN GIẢ',frame:2,rank:9}:r>=11?{title:'THÁI ẤT CHÂN QUÂN',frame:2,rank:8}:r>=10?{title:'KIM TIÊN',frame:1,rank:8}:r>=9?{title:'HUYỀN TIÊN',frame:2,rank:7}:r>=8?{title:'THƯỢNG TIÊN',frame:2,rank:6}:r>=7?{title:'THÁI THƯỢNG TRƯỞNG LÃO',frame:0,rank:5}:r>=6?{title:'TRUYỀN CÔNG TRƯỞNG LÃO',frame:0,rank:4}:r>=5?{title:'TRƯỞNG LÃO',frame:0,rank:3}:r>=4?{title:'CHẤP SỰ',frame:0,rank:1}:null;
 const pick=byGift&&(!byRealm||byGift.rank>=byRealm.rank)?{...byGift,role:'patron'}:byRealm?{...byRealm,role:r>=8?'immortal':'senior'}:null;
 if(!pick)return null;delete pick.rank;return pick;
}
