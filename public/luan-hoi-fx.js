// 18/11/2026 — LUÂN HỒI trên sân: huy hiệu ☸ cạnh tên + hào quang "Lục Đạo Luân Hồi Bàn" dưới chân người đã chuyển sinh.
// Luật chủ game: hiệu ứng không chạy liên tục (nền rất mờ, BÙNG 3,6 s mỗi ~45 s, lệch pha theo người), sân đông (>30) bỏ hào quang,
// >50 (bareCrowd) bỏ hết; không shadowBlur mỗi khung. Màu theo bậc LUAN_HOI_TIERS (1 trắng · 2 lam nhạt · 3 lam · 5 tím · 10 vàng).
import {luanHoiTier,rebirths} from './luan-hoi-data.js';
const TAU=Math.PI*2;
export const LH_BURST=Object.freeze({every:45000,len:3600});
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
/** 0..1 cường độ bùng hiện tại (0 = đang nghỉ). */
export function luanBurst(id,nowMs){const ph=(nowMs+hash(id)%LH_BURST.every)%LH_BURST.every;if(ph>LH_BURST.len)return 0;const k=ph/LH_BURST.len;return k<.15?k/.15:k>.7?(1-k)/.3:1;}
const GLYPH=['天','人','修','畜','鬼','獄'];
function wheel(c,x,y,R,rot,col,a,flat=.32,spokes=true){
 c.save();c.translate(x,y);c.scale(1,flat);c.globalAlpha=a;c.strokeStyle=col;
 c.lineWidth=2.2;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
 c.lineWidth=1.2;c.beginPath();c.arc(0,0,R*.72,0,TAU);c.stroke();c.beginPath();c.arc(0,0,R*.2,0,TAU);c.stroke();
 if(spokes){c.beginPath();for(let i=0;i<6;i++){const q=rot+i*TAU/6;c.moveTo(Math.cos(q)*R*.2,Math.sin(q)*R*.2);c.lineTo(Math.cos(q)*R*.72,Math.sin(q)*R*.72);}c.stroke();
  c.lineWidth=1;for(let i=0;i<24;i++){const q=rot*-.6+i*TAU/24,r1=R*.86,r2=R*(i%2?.93:.97);c.beginPath();c.moveTo(Math.cos(q)*r1,Math.sin(q)*r1);c.lineTo(Math.cos(q)*r2,Math.sin(q)*r2);c.stroke();}}
 c.restore();
}
/** Lớp sau lưng (vẽ trước thân người). */
export function drawLuanHoiAuras(scene,c,t){
 if(scene.bareCrowd||scene.raceStatus?.active||scene.warStatus?.active)return;
 const list=scene.targets||[];if(list.length>30)return;
 const now=Date.now(),light=scene.budget?.level==='light';
 for(const a of list){const p=a.player,n=rebirths(p);if(!n||p.resident||p.puppet)continue;const tier=luanHoiTier(n);if(!tier)continue;
  const s=a.scale||1,R=s*30,fy=a.y+s*3,b=luanBurst(p.id,now),rot=t*.00035*(n%2?1:-1);
  c.save();c.globalCompositeOperation='lighter';
  wheel(c,a.x,fy,R,rot,tier.main,.22+.5*b);
  if(b>0){
   // bánh xe dựng đứng sau lưng + 6 chữ Lục Đạo bay vòng
   const hy=a.y-s*34;wheel(c,a.x,hy,R*1.15*(.85+.15*b),-rot*2,tier.soft,.35*b,1,true);
   c.font='700 '+Math.round(Math.max(9,s*10))+'px "Noto Serif","Times New Roman",serif';c.textAlign='center';c.textBaseline='middle';
   for(let i=0;i<6;i++){const q=rot*3+i*TAU/6,x=a.x+Math.cos(q)*R*1.25,y=hy+Math.sin(q)*R*1.25;c.globalAlpha=.75*b;c.fillStyle=tier.main;c.fillText(GLYPH[i],x,y);}
   if(!light){for(let i=0;i<10;i++){const u=((now*.0004+i/10+hash(p.id+i)%97/97)%1),x=a.x+Math.sin(i*2.3+now*.002)*R*.7,y=fy-u*s*70;c.globalAlpha=b*(1-u)*.8;c.fillStyle=i%3?tier.main:'#ffffff';c.beginPath();c.arc(x,y,1.6+(i%3),0,TAU);c.fill();}}
  }
  c.restore();}
}
/** Huy hiệu ☸ + số lần (cạnh khung tên, bên phải). */
export function drawLuanBadge(c,x,y,n,cache){const tier=luanHoiTier(n);if(!tier)return;const r=10.5,label=n>9?'X':String(n);
 const bm=cache.get('lh-badge:'+n,(r*2+8)*2,(r*2+8)*2,b=>{b.setTransform(2,0,0,2,0,0);const cx=r+4,cy=r+4;b.beginPath();b.arc(cx,cy,r,0,TAU);b.fillStyle=tier.deep+'f0';b.fill();b.lineWidth=1.8;b.strokeStyle=tier.main;b.stroke();
  b.beginPath();b.arc(cx,cy,r-3.2,0,TAU);b.lineWidth=.8;b.strokeStyle=tier.soft+'aa';b.stroke();
  b.font='900 12px "Segoe UI",Arial,sans-serif';b.textAlign='center';b.textBaseline='middle';b.lineWidth=2.4;b.strokeStyle='#000';b.strokeText('☸',cx,cy+.5);b.fillStyle=tier.soft;b.fillText('☸',cx,cy+.5);
  b.font='900 9px "Segoe UI",Arial,sans-serif';b.lineWidth=2.6;b.strokeText(label,cx+r*.72,cy+r*.62);b.fillStyle='#ffffff';b.fillText(label,cx+r*.72,cy+r*.62);});
 if(bm)c.drawImage(bm,x-r-4,y-r-4,bm.width/2,bm.height/2);}
