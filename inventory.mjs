// 11/11/2026: TÚI ĐỒ · LINH THÚ · TỦ SKIN — thẻ giữa màn (cùng khuôn Linh Bài) khi người xem gõ
//   "túi đồ" / "túi" / "hành trang"  ·  "thú" (lúc Linh Thú Cốc không mở)  ·  "skin" (không kèm tên).
// Chỉ đọc dữ liệu nhân vật, không đổi gì. Không nhắc giá quà/coin (luật LIVE).
import {petById,ALL_PETS} from './public/spirit-pets.js';
import {SPECIAL_SKINS} from './public/patrons.js';
export const BAG_CMDS=['tuido','tui','hanhtrang','xemtui'];
const PET_CMDS=['thu','linhthu'];
const petOpen=(w,now)=>{const e=w.petEvent;return !!(e&&!e.closedAt&&now>=e.startedAt&&now<e.endsAt);};
const cap=(list,n)=>({items:list.slice(0,n),more:Math.max(0,list.length-n)});

export function bagCard(p,catalog){
 const byId=new Map(catalog.map(item=>[item.id,item]));
 const entry=(id,extra={})=>{
  const item=byId.get(id);
  return {id,name:item?.name||id,icon:item?.icon||'orb',art:item?.art||null,
    damage:Math.max(0,Number(item?.damage)||0),bonus:Math.max(0,Number(item?.bonus)||0),
    description:String(item?.description||'').slice(0,180),...extra};
 };
 const secondary=new Set((p.equippedExtra||[]).filter(id=>id!==p.equipped));
 const arts=[...new Set(p.artifacts||[])].map(id=>entry(id,{on:id===p.equipped,secondary:secondary.has(id)}));
 arts.sort((a,b)=>Number(b.on)-Number(a.on)||Number(b.secondary)-Number(a.secondary));
 const pills=Object.entries(p.pills||{}).filter(([,n])=>n>0).map(([id,n])=>entry(id,{n}));
 const manuals=[...new Set(p.manuals||[])].map(id=>entry(id));
 return {kind:'bag',stones:Math.floor(p.stones||0),herbs:Math.floor(p.herbs||0),
  equipped:arts.find(x=>x.on)||null,secondaryEquipped:arts.filter(x=>x.secondary).length,
  artifacts:cap(arts,12),pills:cap(pills,8),manuals:cap(manuals,8), // 15/11: bảng xem hiện hết món (user)
  tip:arts.length?(pills.length?'Gõ 5 dùng đan · 7 rèn thêm':'Gõ 4 luyện đan · 7 rèn thêm'):'Gõ 7 rèn pháp bảo đầu tiên'};
}
export function petCard(p,growth={}){
 const owned=(p.spiritPets||[]).map(petById).filter(Boolean);
 const cur=p.spiritPet&&petById(p.spiritPet);
 return {kind:'pets',current:cur?.name||null,currentId:cur?.id||null,currentGrowth:cur?growth[cur.id]||null:null,
  owned:cap(owned.map((x,i)=>({id:x.id,name:x.name,no:ALL_PETS.indexOf(x)+1,on:x.id===cur?.id,...(growth[x.id]?{level:growth[x.id].level,stage:growth[x.id].stage,stageName:growth[x.id].stageName,skill:growth[x.id].skill}:{} )})),ALL_PETS.length),
  total:ALL_PETS.length,tip:owned.length?'Gõ thu + số để đổi linh thú đồng hành':'Linh thú có trong sự kiện Linh Thú Cốc'};
}
export function skinCard(p){
 const owned=(p.rewardSkins||[]).map(id=>SPECIAL_SKINS.find(s=>s.id===id)).filter(Boolean);
 const cur=p.skinChoice&&SPECIAL_SKINS.find(s=>s.id===p.skinChoice);
 return {kind:'skins',current:cur?.name||'Áo cảnh giới',
  owned:cap(owned.map(s=>({id:s.id,name:s.name,on:s.id===cur?.id})),24),
  tip:owned.length?'Gõ skin + tên để mặc · skin macdinh để về áo cảnh giới':'Skin mở từ sự kiện, đua kiếm, rèn pháp bảo'};
}
// Trả về {kind, text} nếu là lệnh xem; null nếu không phải.
export function inventoryRequest(w,p,cmd,rest,now){
 if(BAG_CMDS.includes(cmd))return {kind:'bag'};
 if(PET_CMDS.includes(cmd)&&rest==='ky')return {kind:'pets'}; // 15/11: "thú kỹ" mở bảng thú (cấp, XP, thân thiết, tuyệt kỹ) mọi lúc, kể cả khi Cốc đang mở
 if(PET_CMDS.includes(cmd)&&!rest&&!petOpen(w,now)&&!(w.petEvent&&p.petProgress?.eventId===w.petEvent.id))return {kind:'pets'}; // còn tiến độ đợt vừa rồi → để bảng Linh Thú Cốc báo
 if(cmd==='skin'&&!rest)return {kind:'skins'};
 return null;
}
export function inventoryCard(kind,p,catalog,growth=null){return kind==='bag'?bagCard(p,catalog):kind==='pets'?petCard(p,growth||{}):skinCard(p);}
export function inventoryText(c){
 if(c.kind==='bag')return `Túi đồ • ${c.artifacts.items.length+c.artifacts.more} pháp bảo • ${c.pills.items.reduce((s,x)=>s+x.n,0)} viên đan • ${c.stones.toLocaleString('vi-VN')} linh thạch`;
 if(c.kind==='pets')return `Linh thú • ${c.current||'chưa có đồng hành'} • sở hữu ${c.owned.items.length+c.owned.more}/${c.total}`;
 return `Tủ skin • đang mặc ${c.current} • sở hữu ${c.owned.items.length+c.owned.more}`;
}
