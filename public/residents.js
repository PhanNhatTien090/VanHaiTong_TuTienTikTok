import {MAX_REALM} from './progression.js';
// Tu tiên giả thường trú của Vân Hải Tông: luôn ngồi trên quảng trường cho cảnh không trống.
// Chỉ là nhân vật cảnh: không có hồ sơ, không vào Phong Vân Bảng, không tính vào số đạo hữu, không nhận quà.
// coins chỉ để chọn bộ áo (0 Thanh Y · 100 Nguyệt Bạch · 500 Tử Vân · 2000 Kim Long · 10000 Thiên Đế).
export const RESIDENTS=Object.freeze([
  {id:'resident:ty-teo',name:'Tý Tèo',coins:0,equipped:'jade'},
  {id:'resident:nguoi-khong-buon-cuoi',name:'Người Không Buồn Cười',coins:500,equipped:'jade'},
  {id:'resident:hai-thuy',name:'Hai Thùy',coins:100,equipped:null},
]);
// Start a fresh presentation at the early realms, not the wall-clock cycle's high ranks.
const presentedRealms=new Map(RESIDENTS.map((p,i)=>[p.id,i]));
export function setResidentRealm(id,realm){if(RESIDENTS.some(r=>r.id===id)&&Number.isInteger(realm)&&realm>=0&&realm<=MAX_REALM)presentedRealms.set(id,realm);}
// Chu kỳ NPC (tính theo giờ thật nên mọi overlay và mỗi lần tải lại đều khớp nhau):
// đầu chu kỳ: Hai Thùy = Phàm nhân, Tý Tèo = Trúc Cơ, Người Không Buồn Cười = Kim Đan;
// cứ 3 phút một NPC đột phá lên 1 cảnh giới; tới phút 13 đổi tên cả 3 và quay về Phàm nhân / Trúc Cơ / Kim Đan.
// 3/11: đột phá dày hơn — cứ 75 giây một NPC đột phá (lần lượt 3 người), mỗi người đột phá ~3 lần mỗi chu kỳ 13 phút.
export const RESIDENT_STEP_MS=75000,RESIDENT_CYCLE_MS=13*60000;
const SLOT_ORDER=['resident:hai-thuy','resident:ty-teo','resident:nguoi-khong-buon-cuoi'],BASE_REALMS=[0,2,3];
export const NAME_GROUPS=Object.freeze([
  ['Hai Thùy','Tý Tèo','Người Không Buồn Cười'],
  ['Tiểu Bảo','Mộc Lan','Đại Ngưu'],
  ['Bạch Lộ','A Phúc','Lăng Vân'],
  ['Hạ Vy','Tam Đản','Thanh Phong'],
  ['Như Ý','Tiểu Hổ','Vân Khê'],
  ['Lâm Nhi','Minh Khang','Cửu Muội'],
  ['Tú Tú','Bảo Ngọc','Thiết Trụ'],
  ['Ngọc Lan','Tiểu Mãn','Hàn Phong'],
]);
export function residentCycle(now=Date.now()){
  // 3/11: KHÔNG đổi tên nữa (đổi tên trông như người xem mới giả) — luôn dùng tên gốc.
  const k=Math.floor(now/RESIDENT_CYCLE_MS),offset=now-k*RESIDENT_CYCLE_MS,group=0;
  const steps=[];for(let n=1;n*RESIDENT_STEP_MS<RESIDENT_CYCLE_MS-30000;n++)steps.push({n,at:n*RESIDENT_STEP_MS,slot:(n-1)%SLOT_ORDER.length});
  const done=steps.filter(s=>offset>=s.at);
  const slots=SLOT_ORDER.map((id,i)=>{const count=done.filter(s=>s.slot===i).length;return {id,slot:i,name:NAME_GROUPS[group][i],baseRealm:BASE_REALMS[i],realm:BASE_REALMS[i]+count,stepAt:steps.find(s=>s.slot===i)?.at,broke:count>0};});
  // mỗi lượt đột phá đã tới: NPC nào, lên cảnh giới mấy
  const events=done.map(s=>({...s,id:SLOT_ORDER[s.slot],name:NAME_GROUPS[group][s.slot],toRealm:BASE_REALMS[s.slot]+done.filter(d=>d.slot===s.slot&&d.n<=s.n).length}));
  return {cycle:k,offset,group,original:group===0,slots,events};
}
export const residentName=(id,now=Date.now())=>residentCycle(now).slots.find(s=>s.id===id)?.name||RESIDENTS.find(r=>r.id===id)?.name||'Đạo hữu';
export const residentPlayers=(now=Date.now())=>{const c=residentCycle(now);return RESIDENTS.map(r=>{const s=c.slots.find(x=>x.id===r.id);return {id:r.id,name:(s?.name||r.name),giftCoins:0,equipped:r.equipped,realm:presentedRealms.get(r.id)??(s?s.realm:1),joinedAt:0,active:true,resident:true};});};
