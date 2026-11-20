import {COURT_VISITORS} from './court-rewards.js';
export const VISITOR_GIFT_REWARDS=Object.freeze({
 hailam:{skin:'sea-dragon-heir',skinName:'Long Duệ Hải Lam',cell:2,skinCoins:100,artifactCoins:300,artifact:'sea-dragon-heart',artifactName:'Hải Lam Long Tâm'},
 doraemon:{skin:'doraemon-avatar',skinName:'Doraemon',cell:3,skinCoins:100,artifactCoins:300,artifact:'dora-anywhere-door',artifactName:'Cánh Cửa Thần Kỳ'},
 shende:{skin:'shende-avatar',skinName:'Thần Đế',cell:2,skinCoins:100,artifactCoins:300,artifact:'shende-dao-seal',artifactName:'Thần Đế Đạo Ấn'},
 hanlap:{skin:'hanlap-avatar',skinName:'Hàn Lập',cell:1,skinCoins:100,artifactCoins:200,artifact:'hanlap-bamboo-swords',artifactName:'Thanh Trúc Phong Vân Kiếm'},
 tudo:{skin:'tudo-ma-ton',skinName:'Tư Đồ Ma Tôn',cell:2,skinCoins:200,artifactCoins:300,artifact:'tudo-huyet-dao',artifactName:'Huyết Sát Ma Đao'},
 khuyniet:{skin:'khuy-niet-loi-ton',skinName:'Khuy Niết Lôi Tôn',cell:0,skinCoins:300,artifactCoins:500,artifact:'khuy-niet-tu-loi-long',artifactName:'Tử Lôi Long'},
 viemton:{skin:'phan-thien-viem-ton',skinName:'Tần Mục Hỏa Thần',cell:0,skinCoins:300,artifactCoins:500,artifact:'phan-thien-song-dao',artifactName:'Song Đao Liệt Diễm',icon:'sword'},
 ...Object.fromEntries(COURT_VISITORS.map(v=>[v.kind,{skin:v.skin,skinName:v.name,skinCoins:v.skinCoins||300,artifactCoins:v.artifactCoins||500,artifact:v.artifact,artifactName:v.relic,icon:v.icon||'orb',art:v.artwork?.blade}])),
 vuonglam:{skin:'vuonglam-avatar',skinName:'Vương Lâm / Lý Mộ Uyển',cell:0,skinCoins:200,artifactCoins:300,artifact:'vuonglam-soul-banner',artifactName:'Hồn Phiên'}
});
export const SIGNATURE_ARTIFACTS=Object.values(VISITOR_GIFT_REWARDS).map(r=>({id:r.artifact,name:r.artifactName,type:'artifact',art:r.art,icon:r.icon||(r.cell===1?'sword':'orb'),tier:0,price:0,herbs:0,damage:80,bonus:.45,exclusive:true,eventReward:r.skinName+' · tích lũy '+(r.artifactCoins||500)+' coin trong lượt xuất hiện',description:'Pháp bảo truyền thừa: +80 công lực, +45% tu vi khi trang bị. Trao cố định ở mốc '+(r.artifactCoins||500)+' coin sự kiện.'}));
// 20/11: sự kiện skin TAM TIÊN — mỗi lượt 3 vị. Luật (user chốt):
//  • Vị có GIÁ RIÊNG trong lượt (không trùng giá vị khác): tặng gì cũng được, ĐỦ COIN là nhận (cộng dồn cả lượt).
//  • Vị TRÙNG GIÁ với vị khác: mỗi vị gắn 1 món quà ĐÚNG GIÁ skin, khác tên nhau — tặng đúng 1 món đó là nhận.
//    Quà đã khớp món của vị nào thì chỉ tính cho vị đó (không cộng vào phần "đủ coin").
// Chỉ ghép trùng giá khi có đủ món khác nhau ở giá đó (món kênh đã có ảnh hoặc có ảnh dự phòng).
export const LINEUP_SIZE=3,LINEUP_MS=4*60000;
// Tên đúng như TikFinity gửi (giftName), theo giá. Món có ảnh dự phòng trong assets/gifts: Hand Heart, Baglama, Money Gun.
export const LINEUP_GIFTS=Object.freeze({100:['Hand Heart','Balloon Gift Box','Bouquet','Mini Star'],200:['Baglama'],300:["Galaxy's Bestest"],500:['Money Gun','Gem Gun','You’re Amazing']});
const FALLBACK_ART=new Set(['Hand Heart','Baglama','Money Gun']);
export const giftKey=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const visitorPrices=kind=>{const r=VISITOR_GIFT_REWARDS[kind];if(!r)return null;const court=COURT_VISITORS.some(v=>v.kind===kind);return {skin:r.skinCoins||(court?300:100),artifact:r.artifactCoins||500};};
// Món dùng được ở một giá: có ảnh thật của kênh hoặc ảnh dự phòng.
export const lineupGiftsAt=(price,art=null)=>(LINEUP_GIFTS[price]||[]).filter(n=>FALLBACK_ART.has(n)||!!art?.[n+'|'+price]?.url);
// Gắn món cho các vị trùng giá; vị giá riêng để trống (đủ coin). names(price) trả danh sách món theo thứ tự ưu tiên.
export function assignLineupGifts(kinds,art=null,names=price=>lineupGiftsAt(price,art)){
 const byPrice=new Map();for(const k of kinds){const p=visitorPrices(k).skin;byPrice.set(p,(byPrice.get(p)||0)+1);}
 const used=new Map(),lists=new Map(),listAt=p=>{if(!lists.has(p))lists.set(p,names(p));return lists.get(p);}; // xáo 1 lần/giá → không trùng món
 return kinds.map(kind=>{const price=visitorPrices(kind).skin;if(byPrice.get(price)<2)return {kind,price};
  const i=used.get(price)||0;used.set(price,i+1);const giftName=listAt(price)[i],url=art?.[giftName+'|'+price]?.url;
  return {kind,price,giftName,...(url?{giftUrl:url}:{})};});
}
// Lượt có ghép được không: nhóm trùng giá không vượt số món khác nhau ở giá đó.
export const lineupFeasible=(kinds,art=null)=>{const byPrice=new Map();for(const k of kinds){const p=visitorPrices(k).skin;byPrice.set(p,(byPrice.get(p)||0)+1);}return [...byPrice].every(([p,n])=>n<2||n<=lineupGiftsAt(p,art).length);};
export function visitorSkinCell(p){
 const r=Object.values(VISITOR_GIFT_REWARDS).find(r=>r.skin===p.skinChoice&&p.rewardSkins?.includes(r.skin));return r?.cell??null;
}
// Rewards use already-deduplicated gift deltas. Free-event participation is separate.
// queued (19/11): quà đến lúc nhân vật đang ở bản web (engine giữ lại tới khi trả về) → tính theo LÚC ĐẾN và đúng sự kiện lúc đó,
// kể cả khi sự kiện đã đóng — trước đây trả về muộn là mất tiến độ skin.
// unitCoins/giftName = giá + tên 1 món quà (lượt Tam Tiên dùng để biết quà thuộc vị nào).
export function creditVisitorGift(w,p,coins,now,queued=null,unitCoins,giftName){
 const result={items:[],itemNames:[],skinNames:[]};
 let e;
 if(queued){
  if(!queued.visitorId)return result;
  e=[w.visitor,...(w.visitorArchive||[])].find(x=>x?.id===queued.visitorId);const at=Number(queued.at);
  if(!e||!(at>=e.startedAt&&at<e.endsAt&&(!e.closedAt||at<e.closedAt)))return result;
 }else{e=w.visitor;if(!e||e.closedAt||now<e.startedAt||now>=e.endsAt)return result;}
 if((p.resident||p.puppet)||!Number.isSafeInteger(coins)||coins<1)return result;
 e.giftProgress??={};
 const grant=(kind,key)=>{const r=VISITOR_GIFT_REWARDS[kind];if(!r)return null;const progress=e.giftProgress[key]??={coins:0,skinAwarded:false,artifactAwarded:false};return {r,progress};};
 if(!e.lineup?.length){const g=grant(e.kind,p.id);if(!g)return result;g.progress.coins+=coins;return grantVisitorProgress(p,e,g.r,g.progress,true);}
 // 20/11 (A — chủ game duyệt): VÍ TIÊN DUYÊN giữ MÃI (p.skinWallet). Quà trong lượt Tam Tiên cộng vào ví; mua món nào trừ ĐÚNG giá món đó;
 // hết lượt coin dư KHÔNG mất, lần sau tặng thêm phần thiếu là nhận (trước: 23 lượt người xem tặng ≥30 coin rồi mất trắng).
 // Luật giữ nguyên: MUA 1 LÀ 1; vị TRÙNG GIÁ chỉ mua khi tặng ĐÚNG món riêng của vị đó; vị GIÁ RIÊNG đủ ví là nhận.
 const wallet=p.skinWallet??={coins:0};wallet.coins+=coins;wallet.at=now;
 // Món kế của một vị: chưa có skin → skin (cùng giá pháp bảo thì kèm); có skin rồi → pháp bảo (phần chênh). null = đã đủ cả.
 const next=s=>{const r=VISITOR_GIFT_REWARDS[s.kind],pr=visitorPrices(s.kind);if(!r)return null;const skin=p.rewardSkins?.includes(r.skin),art=p.artifacts?.includes(r.artifact);
  if(!skin)return {s,r,need:pr.skin,coins:pr.skin};if(!art&&pr.artifact>pr.skin)return {s,r,need:pr.artifact-pr.skin,coins:pr.artifact};return null;};
 let kind=null,wear=null;
 const buy=pick=>{wallet.coins-=pick.need;const got=grantVisitorProgress(p,{...e,kind:pick.s.kind},pick.r,{coins:pick.coins},!kind);
  if(!kind&&got.skinNames.length)wear=pick.r.skin;kind??=pick.s.kind;result.items.push(...got.items);result.itemNames.push(...got.itemNames);result.skinNames.push(...got.skinNames);};
 const k=giftKey(giftName),named=k&&e.lineup.find(s=>s.giftName&&giftKey(s.giftName)===k&&(!Number.isSafeInteger(unitCoins)||unitCoins===s.price));
 const open=e.lineup.filter(s=>!s.giftName);
 if(named){const pick=next(named);if(pick&&pick.need<=wallet.coins)buy(pick);} // 1) đúng món riêng → chỉ vị đó
 else for(let guard=0;guard<6;guard++){const pick=open.map(next).filter(x=>x&&x.need<=wallet.coins).sort((a,b)=>b.need-a.need)[0];if(!pick)break;buy(pick);} // 2) đắt nhất vừa đủ trước
 if(wear){p.skinChoice=wear;p.skinChoiceSource='visitor';} // mặc món đắt nhất vừa mua, không để món rẻ trao sau đè
 // Hiển thị: vị gần nhất còn thiếu (đúng món riêng → vị đó; không thì vị giá riêng rẻ nhất chưa đủ).
 const goals=(named?[named]:open).map(next).filter(x=>x&&x.need>wallet.coins).sort((a,b)=>a.need-b.need);
 const toward=goals[0]?{kind:goals[0].s.kind,need:goals[0].need,left:goals[0].need-wallet.coins}:null;
 return {...result,kind:kind||named?.kind||open[0]?.kind||e.kind,coins:wallet.coins,wallet:wallet.coins,toward};
}
export function visitorSkinName(kind,gender){return kind==='vuonglam'?(gender==='nu'?'Lý Mộ Uyển':'Vương Lâm'):VISITOR_GIFT_REWARDS[kind]?.skinName||'Tiên nhân';}
function grantVisitorProgress(p,e,r,progress,equip=false){const result={items:[],itemNames:[],skinNames:[]};
 const court=COURT_VISITORS.some(v=>v.kind===e.kind),skinPrice=court?(r.skinCoins||300):(r.skinCoins||100),artifactPrice=court?(r.artifactCoins||500):(r.artifactCoins||500);
 if(progress.coins>=skinPrice){progress.skinAwarded=true;p.rewardSkins??=[];
  // 07/11: mua skin sự kiện thì mặc ngay, kể cả khi trước đó đã tự chọn skin khác (chủ game yêu cầu).
  // equip=true chỉ khi vừa tặng quà thật; bù thưởng tự động không đè skin đang chọn.
  if(!p.rewardSkins.includes(r.skin)){p.rewardSkins.push(r.skin);if(equip||!['manual','admin'].includes(p.skinChoiceSource)){p.skinChoice=r.skin;p.skinChoiceSource='visitor';}const name=visitorSkinName(e.kind,p.gender);result.skinNames.push('Skin '+name);result.itemNames.push('Skin '+name);}
 }
 if(progress.coins>=artifactPrice){progress.artifactAwarded=true;
  p.visitorArtifactUnlocks??={};p.visitorArtifactUnlocks[r.artifact]={kind:e.kind,eventId:e.id,coins:progress.coins,requiredCoins:artifactPrice};
  if(!p.artifacts.includes(r.artifact)){p.artifacts.push(r.artifact);result.items.push(r.artifact);result.itemNames.push(r.artifactName);}
 }
 return {...result,kind:e.kind,coins:progress.coins};
}

export function reconcileVisitorPricing(w,now){const e=w.visitor;if(!e||now<e.startedAt)return [];const awarded=[];for(const [key,progress]of Object.entries(e.giftProgress||{})){const [id,slotKind]=key.split('|');if(slotKind==='*')continue;const kind=slotKind||e.kind,r=VISITOR_GIFT_REWARDS[kind],p=w.players[id];if(!r||!p||p.resident||p.puppet||!Number.isSafeInteger(progress.coins)||progress.coins<1)continue;const reward=grantVisitorProgress(p,{...e,kind},r,progress);if(reward.items.length||reward.skinNames.length)awarded.push({player:p,reward});}return awarded;}
