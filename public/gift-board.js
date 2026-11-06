const ROWS=Object.freeze([
 {label:'Hoa hồng',reward:'Tăng mạnh tu vi',image:'/assets/gift-rose.webp'},
 {label:'Bánh vòng',reward:'Cơ duyên lớn',image:'/assets/gift-doughnut.webp'},
 {label:'Quà lớn hơn',reward:'Thiên mệnh',image:'/assets/gift-live-pro-badge.webp'},
 {label:'Phượng Hoàng',reward:'Tông chủ',image:'/assets/gift-phoenix.webp'}
]);
export const giftBoardRows=()=>ROWS.map(r=>({...r}));
export function giftBoardHTML(state){
 if(!state.gifts?.length)return '';
 return `<h3>QUÀ · CƠ DUYÊN</h3>${ROWS.map(r=>`<div class="gift-board-row"><img class="gift-photo gift-original" src="${r.image}" alt="${r.label}" width="42" height="42" decoding="async"><span class="gb-body"><strong class="gb-main-qi">${r.reward}</strong></span></div>`).join('')}<footer class="gb-disclosure">Vật phẩm chỉ dùng trong game</footer>`;
}
