import {giftReward} from './gift-rewards.js';
import {HIGH_GIFT_TIERS} from './high-gift-fx.js';
import {SPECIAL_SKINS} from './patrons.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('vi-VN');
const EXAMPLES=[
 {coins:1,label:'Hoa hồng',image:'/assets/gift-rose.webp'},{coins:30,label:'Bánh vòng',image:'/assets/gift-doughnut.webp'},
 {coins:349,label:'Chopin trong mưa',image:'/assets/gift-chopin-in-the-rain.webp'},{coins:799,label:'Huynh đệ nào?',image:'/assets/gift-which-bro.webp'},
 {coins:1000,label:'Huy hiệu LIVE Pro',image:'/assets/gift-live-pro-badge.webp'},{coins:2199,label:'Vùng đất trái tim',image:'/assets/gift-jollies-heartland.webp'},
 {coins:2999,label:'Tín đồ thi đấu',image:'/assets/gift-match-maniac.webp'},{coins:25999,label:'Phoenix',image:'/assets/gift-phoenix.webp'}
];
// v66: mỗi món quà hiện ĐỦ phần thưởng — tài nguyên, pháp bảo, skin, phúc duyên, hiệu ứng, vinh danh (khớp engine.giftBuff + honor-ui).
const buffOf=c=>c>=1000?12:c>=100?8:c>=10?5:3;
function effectName(c){let hi=null;for(const t of HIGH_GIFT_TIERS)if(c>=t.min)hi=t.name;return hi||(c>=99?'Hào quang vinh danh':c>=30?'Liên hoa ngọc nở':c>=5?'Phi kiếm xoay quanh':'Hoa nở quanh người');}
export function giftBoardRows(state){
 return EXAMPLES.map(example=>{const r=giftReward(example.coins,state.gifts),item=state.catalog?.find(i=>i.id===r.tier.artifact),skin=r.tier.skin?SPECIAL_SKINS.find(s=>s.id===r.tier.skin):null;
  return {...example,qi:r.qi,stones:r.stones,herbs:r.herbs,artifact:item?.name||null,skin:skin?.name||null,buff:buffOf(example.coins),effect:effectName(example.coins),honor:example.coins>=1000?'Khung tím':example.coins>=99?'Khung vàng':null};});
}
function mainReward(r){
 const special=r.artifact||r.skin;
 return `<strong class="gb-main-qi">+${fmt(r.qi)} tu vi</strong>${special?`<small class="gb-main-item">${esc(special)}</small>`:''}`;
}
export function giftBoardHTML(state,now=Date.now()){
 if(!state.gifts?.length)return '';
 const rows=giftBoardRows(state),pages=Math.ceil(rows.length/2),page=Math.floor(now/8000)%pages;
 return `<h3>QUÀ → THƯỞNG <em>${page+1}/${pages}</em></h3>${rows.slice(page*2,page*2+2).map(r=>`<div class="gift-board-row"><img class="gift-photo gift-original" src="${esc(r.image)}" alt="${esc(r.label)}" width="42" height="42" decoding="async"><span class="gb-body"><b class="gb-price">${fmt(r.coins)} <em>coin</em></b>${mainReward(r)}</span></div>`).join('')}<footer class="gb-disclosure">Qu\u00e0 t\u1ef1 nguy\u1ec7n \u00b7 v\u1eadt ph\u1ea9m ch\u1ec9 d\u00f9ng trong game</footer>`;
}
