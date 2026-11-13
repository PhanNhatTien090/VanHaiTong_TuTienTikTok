import {COURT_VISITORS} from './court-rewards.js';
export const VISITOR_GIFT_REWARDS=Object.freeze({
 hailam:{skin:'sea-dragon-heir',skinName:'Long Duệ Hải Lam',cell:2,skinCoins:100,artifactCoins:300,artifact:'sea-dragon-heart',artifactName:'Hải Lam Long Tâm'},
 doraemon:{skin:'doraemon-avatar',skinName:'Doraemon',cell:3,skinCoins:100,artifactCoins:300,artifact:'dora-anywhere-door',artifactName:'Cánh Cửa Thần Kỳ'},
 shende:{skin:'shende-avatar',skinName:'Thần Đế',cell:2,skinCoins:100,artifactCoins:300,artifact:'shende-dao-seal',artifactName:'Thần Đế Đạo Ấn'},
 hanlap:{skin:'hanlap-avatar',skinName:'Hàn Lập',cell:1,skinCoins:100,artifactCoins:200,artifact:'hanlap-bamboo-swords',artifactName:'Thanh Trúc Phong Vân Kiếm'},
 tudo:{skin:'tudo-ma-ton',skinName:'Tư Đồ Ma Tôn',cell:2,skinCoins:200,artifactCoins:300,artifact:'tudo-huyet-dao',artifactName:'Huyết Sát Ma Đao'},
 khuyniet:{skin:'khuy-niet-loi-ton',skinName:'Khuy Niết Lôi Tôn',cell:0,skinCoins:300,artifactCoins:500,artifact:'khuy-niet-tu-loi-long',artifactName:'Tử Lôi Long'},
 viemton:{skin:'phan-thien-viem-ton',skinName:'Tần Mục Hỏa Thần',cell:0,skinCoins:300,artifactCoins:500,artifact:'phan-thien-song-dao',artifactName:'Song Đao Liệt Diễm',icon:'sword'},
 ...Object.fromEntries(COURT_VISITORS.map(v=>[v.kind,{skin:v.skin,skinName:v.name,skinCoins:300,artifactCoins:500,artifact:v.artifact,artifactName:v.relic,icon:'orb'}])),
 vuonglam:{skin:'vuonglam-avatar',skinName:'Vương Lâm / Lý Mộ Uyển',cell:0,skinCoins:200,artifactCoins:300,artifact:'vuonglam-soul-banner',artifactName:'Hồn Phiên'}
});
export const SIGNATURE_ARTIFACTS=Object.values(VISITOR_GIFT_REWARDS).map(r=>({id:r.artifact,name:r.artifactName,type:'artifact',icon:r.icon||(r.cell===1?'sword':'orb'),tier:0,price:0,herbs:0,damage:80,bonus:.45,exclusive:true,eventReward:r.skinName+' · tích lũy '+(r.artifactCoins||500)+' coin trong lượt xuất hiện',description:'Pháp bảo truyền thừa: +80 công lực, +45% tu vi khi trang bị. Trao cố định ở mốc '+(r.artifactCoins||500)+' coin sự kiện.'}));
export function visitorSkinCell(p){
 const r=Object.values(VISITOR_GIFT_REWARDS).find(r=>r.skin===p.skinChoice&&p.rewardSkins?.includes(r.skin));return r?.cell??null;
}
// Rewards use already-deduplicated gift deltas. Free-event participation is separate.
export function creditVisitorGift(w,p,coins,now){
 const e=w.visitor,r=VISITOR_GIFT_REWARDS[e?.kind],result={items:[],itemNames:[],skinNames:[]};
 if(!e||!r||(p.resident||p.puppet)||e.closedAt||now<e.startedAt||now>=e.endsAt||!Number.isSafeInteger(coins)||coins<1)return result;
 e.giftProgress??={};const progress=e.giftProgress[p.id]??={coins:0,skinAwarded:false,artifactAwarded:false};progress.coins+=coins;
 return grantVisitorProgress(p,e,r,progress,true);
}
export function visitorSkinName(kind,gender){return kind==='vuonglam'?(gender==='nu'?'Lý Mộ Uyển':'Vương Lâm'):VISITOR_GIFT_REWARDS[kind]?.skinName||'Tiên nhân';}
function grantVisitorProgress(p,e,r,progress,equip=false){const result={items:[],itemNames:[],skinNames:[]};
 const court=COURT_VISITORS.some(v=>v.kind===e.kind),skinPrice=court?300:(r.skinCoins||100),artifactPrice=court?500:(r.artifactCoins||500);
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

export function reconcileVisitorPricing(w,now){const e=w.visitor,r=VISITOR_GIFT_REWARDS[e?.kind];if(!e||!r||now<e.startedAt)return [];const awarded=[];for(const [id,progress]of Object.entries(e.giftProgress||{})){const p=w.players[id];if(!p||p.resident||p.puppet||!Number.isSafeInteger(progress.coins)||progress.coins<1)continue;const reward=grantVisitorProgress(p,e,r,progress);if(reward.items.length||reward.skinNames.length)awarded.push({player:p,reward});}return awarded;}
