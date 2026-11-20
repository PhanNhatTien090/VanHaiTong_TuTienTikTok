// 20/11/2026 — D. BẬC THANG QUÀ TRONG NGÀY (docs/Y-TUONG-2026-11-20.md, chủ game chọn "khoe trong ngày").
// Vì sao: quà nhỏ (hồng) chỉ cho tu vi tạm — không có gì để KHOE; cánh/VIP tính theo tổng coin cả đời nên người mới chưa với tới.
// Cộng dồn QUÀ THẬT trong ngày (giờ VN, không tính tim/follow — luật 09/11) → mốc:
//  1 (≥10 coin): thẻ tên viền VÀNG hôm nay · 2 (≥30): thêm HÀO QUANG nhỏ quanh người · 3 (≥99): "Hộ Pháp Hôm Nay" + 1 lần màn chào riêng.
// Hết ngày thì về 0, mai tặng lại. Không cần ảnh mới.
export const DAY_TIERS=Object.freeze([10,30,99]);
export const DAY_TIER_NAMES=Object.freeze(['','Viền vàng hôm nay','Hào quang hôm nay','Hộ Pháp Hôm Nay']);
export const vnDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export const dayTier=coins=>DAY_TIERS.filter(x=>coins>=x).length;
// Bậc hôm nay của người chơi (overlay đọc p.dayGift từ server).
export const dayTierOf=(p,now=Date.now())=>p?.dayGift?.day===vnDay(now)?dayTier(p.dayGift.coins||0):0;
// Server: cộng quà thật vào ngày; trả bậc MỚI nếu vừa vượt mốc (0 nếu không).
export function creditDayGift(p,coins,now=Date.now(),real=true){
 if(!real||!p||!(coins>0))return 0;const day=vnDay(now);
 if(p.dayGift?.day!==day)p.dayGift={day,coins:0};const before=dayTier(p.dayGift.coins);p.dayGift.coins+=coins;const after=dayTier(p.dayGift.coins);
 return after>before?after:0;
}
// Overlay — lớp SAU người: hào quang vàng nhỏ cho bậc ≥2 (vẽ sẵn 1 lần, mỗi khung chỉ drawImage). Tối đa 20 người/khung.
let glow=null;
function glowArt(){if(glow||typeof document==='undefined')return glow;const c=document.createElement('canvas');c.width=c.height=160;const x=c.getContext('2d'),g=x.createRadialGradient(80,80,6,80,80,78);
 g.addColorStop(0,'rgba(255,236,170,.55)');g.addColorStop(.5,'rgba(255,214,110,.22)');g.addColorStop(1,'rgba(255,214,110,0)');x.fillStyle=g;x.fillRect(0,0,160,160);
 x.strokeStyle='rgba(255,196,40,.95)';x.lineWidth=4;x.beginPath();x.arc(80,80,50,0,Math.PI*2);x.stroke();x.strokeStyle='rgba(255,240,190,.8)';x.lineWidth=1.5;x.beginPath();x.arc(80,80,56,0,Math.PI*2);x.stroke();return glow=c;}
export function drawDayAuras(scene,c,t,now=Date.now()){
 if(scene.raceStatus?.active)return;const im=glowArt();if(!im)return;let n=0;
 for(const a of scene.targets||[]){if(dayTierOf(a.player,now)<2)continue;if(++n>20)break;const s=a.scale||1,sz=120*s*(scene.motion===false?1:.94+.06*Math.sin(t*.003+a.x*.02));
  c.save();c.globalAlpha=.95;c.drawImage(im,a.x-sz/2,a.y-44*s-sz/2,sz,sz);c.restore();}
}
