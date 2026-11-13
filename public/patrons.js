import {COURT_VISITORS} from './court-rewards.js';
export const PATRON_SKIN={id:'azure-patron',name:'Thương Long Hộ Pháp',level:4,color:'#79e6ff',trim:'#d8f9ff',robe:'#184760',vfx:'Thương long · song kiếm',atlas:0};
export const PATRON_SWORD='patron-sword',PATRON_SEAL='patron-seal';
export function topPatron(players,currentId=null){
  const eligible=players.filter(p=>!p.resident&&p.giftCoins>0);if(!eligible.length)return null;
  return eligible.sort((a,b)=>b.giftCoins-a.giftCoins||(b.id===currentId)-(a.id===currentId)||a.joinedAt-b.joinedAt||String(a.id).localeCompare(String(b.id)))[0];
}
export function hasPatronSet(p){return p?.rewardSkins?.includes(PATRON_SKIN.id)===true;}

export const SPECIAL_SKINS=[PATRON_SKIN,
 ...COURT_VISITORS.map(v=>({id:v.skin,name:v.name,aliases:[v.kind.replace(/-/g,' ')],level:4,color:v.color,trim:v.trim,robe:v.dark,vfx:(v.kind==='nguyet-lien'?'Trăng lưỡi liềm · đài sen ngọc':'Phượng vũ · nhật ấn hỏa diễm')+' · '+v.relic,atlas:0})),
 {id:'sea-dragon-heir',name:'Long Duệ Hải Lam',aliases:['long due hai lam','hailam','hai lam'],level:4,color:'#55cfff',trim:'#d8fcff',robe:'#173d8c',vfx:'Vảy long lân · ngân tuyến · tiểu long bay quanh',atlas:0},
 {id:'tudo-ma-ton',name:'Tư Đồ Ma Tôn',aliases:['tu do ma ton','tudo','tu do','ma ton'],level:4,color:'#ff6a5a',trim:'#ffc2a0',robe:'#2a0b10',vfx:'Huyết Sát Ma Đao · ma diễm · phù văn',atlas:0},
 {id:'phan-thien-viem-ton',name:'Tần Mục Hỏa Thần',aliases:['tan muc hoa than','tan muc','hoa than','tanmuc','hoathan'],level:4,color:'#ff7a2a',trim:'#ffd36a',robe:'#3a0604',vfx:'Biển lửa Phần Thiên · Song Đao Liệt Diễm · luyencong ×1,5',atlas:0},
 {id:'khuy-niet-loi-ton',name:'Khuy Niết Lôi Tôn',aliases:['khuy niet loi ton','khuy niet','loi ton','khuyniet'],level:4,color:'#c69bff',trim:'#ffd36a',robe:'#1c0a33',vfx:'Sét Âm Hư – Dương Thực · Tử Lôi Long · thiên lôi',atlas:0},
 {id:'doraemon-avatar',name:'Doraemon',aliases:['doraemon','doremon','dora'],level:4,color:'#66dbff',trim:'#fff3b4',robe:'#128acc',vfx:'Túi thần kỳ · tinh quang',atlas:0,visitorCell:3},
 {id:'shende-avatar',name:'Thần Đế',level:4,color:'#ffb778',trim:'#ffe7a2',robe:'#34202a',vfx:'Đế khí · kim hỏa',atlas:0,visitorCell:2},
 {id:'hanlap-avatar',name:'Hàn Lập',level:4,color:'#8ff1c5',trim:'#d3ffb2',robe:'#184e43',vfx:'Thanh Trúc kiếm trận',atlas:0,visitorCell:1},
 {id:'vuonglam-avatar',name:'Vương Lâm / Lý Mộ Uyển',aliases:['vuong lam','vuonglam','ly mo uyen','lymouyen'],level:4,color:'#c3a0ff',trim:'#e5d5ff',robe:'#241738',vfx:'Hồn Phiên · tử khí',atlas:0,visitorCell:0},
 {id:'crimson-phoenix',name:'Xích Phượng Chiến Y',level:3,color:'#ff987f',trim:'#ffe0a1',robe:'#671f2b',vfx:'Phượng hỏa · kiếm đỏ',atlas:2},
 {id:'ivory-celestial',name:'Bạch Kim Tiên Đế',level:4,color:'#fff2cb',trim:'#fff7db',robe:'#d8d1b9',vfx:'Bạch kim · tinh kiếm',atlas:4}];
// v33: chỉ mặc skin đặc biệt đang được chọn (skinChoice); sở hữu mà không chọn → mặc áo theo cảnh giới.
export function specialSkinFor(p){const owned=p.rewardSkins||[],s=SPECIAL_SKINS.find(s=>s.id===p.skinChoice&&owned.includes(s.id))||null;return s?.id==='vuonglam-avatar'?{...s,name:p.gender==='nu'?'Lý Mộ Uyển':'Vương Lâm'}:s;}
