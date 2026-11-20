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
 for(const a of list){const p=a.player,n=rebirths(p);if(!n||p.resident||p.puppet)continue;if(scene.gearAlpha&&scene.gearAlpha(p.id,t)<.5)continue; /* 19/11: đang biến hình thì ẩn */const tier=luanHoiTier(n);if(!tier)continue;
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
// 20/11: giao diện Thủy Mặc → huy hiệu thành ẤN SON vuông (☸ màu giấy + số lần chuyển sinh), khớp thẻ tên giấy dó.
const tmUI=()=>typeof document!=='undefined'&&!!document.body?.classList?.contains('ui-tm');
export function drawLuanBadge(c,x,y,n,cache){const tier=luanHoiTier(n);if(!tier)return;const r=10.5,label=n>9?'X':String(n);
 if(tmUI()){const S=19,bm=cache.get('lh-seal:'+label,(S+8)*2,(S+8)*2,b=>{b.setTransform(2,0,0,2,0,0);b.translate(S/2+4,S/2+4);b.rotate(-.12);b.fillStyle='#b3261e';b.beginPath();b.roundRect(-S/2,-S/2,S,S,2.5);b.fill();b.strokeStyle='#f3ead8';b.lineWidth=1;b.strokeRect(-S/2+2.5,-S/2+2.5,S-5,S-5);
  b.font='900 11px "Segoe UI",Arial,sans-serif';b.textAlign='center';b.textBaseline='middle';b.fillStyle='#f3ead8';b.fillText('☸',-1.5,-1);b.font='900 8px "Segoe UI",Arial,sans-serif';b.fillText(label,S/2-4.5,S/2-4.5);});
  if(bm)c.drawImage(bm,x-S/2-4,y-S/2-4,bm.width/2,bm.height/2);return;}
 const bm=cache.get('lh-badge:'+n,(r*2+8)*2,(r*2+8)*2,b=>{b.setTransform(2,0,0,2,0,0);const cx=r+4,cy=r+4;b.beginPath();b.arc(cx,cy,r,0,TAU);b.fillStyle=tier.deep+'f0';b.fill();b.lineWidth=1.8;b.strokeStyle=tier.main;b.stroke();
  b.beginPath();b.arc(cx,cy,r-3.2,0,TAU);b.lineWidth=.8;b.strokeStyle=tier.soft+'aa';b.stroke();
  b.font='900 12px "Segoe UI",Arial,sans-serif';b.textAlign='center';b.textBaseline='middle';b.lineWidth=2.4;b.strokeStyle='#000';b.strokeText('☸',cx,cy+.5);b.fillStyle=tier.soft;b.fillText('☸',cx,cy+.5);
  b.font='900 9px "Segoe UI",Arial,sans-serif';b.lineWidth=2.6;b.strokeText(label,cx+r*.72,cy+r*.62);b.fillStyle='#ffffff';b.fillText(label,cx+r*.72,cy+r*.62);});
 if(bm)c.drawImage(bm,x-r-4,y-r-4,bm.width/2,bm.height/2);}
// 18/11 (chủ game): màn ĐỘT PHÁ của người đã chuyển sinh phải khác người thường → khung Luân Hồi vẽ ĐÈ lên màn đột phá có sẵn:
// viền vàng kép + 4 bánh xe ☸ ở góc xoay chậm + vệt sáng chạy quanh viền + băng rôn "☸ NHẤT THẾ LUÂN HỒI ☸" trên cùng,
// dòng phụ "Tiền kiếp · <cảnh giới cao nhất>" hoặc "PHÁ VỠ TIỀN KIẾP" khi vượt kiếp trước. Vào/ra mờ 0,6 s; chỉ vài nét vẽ, không shadowBlur.
import {REALM_NAMES} from './progression.js';
import {luanHoiTitle} from './luan-hoi-data.js';
const SERIF='"Noto Serif","Times New Roman",Georgia,serif';
function gtext(c,s,x,y,size,fill,width=6,spacing=0){c.font='900 '+size+'px '+SERIF;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';if('letterSpacing' in c)c.letterSpacing=spacing+'px';c.lineWidth=width;c.strokeStyle='#120800';c.strokeText(s,x,y,820);c.fillStyle=fill;c.fillText(s,x,y,820);if('letterSpacing' in c)c.letterSpacing='0px';}
export function luanHoiRitualInfo(player){const n=rebirths(player);if(!n||player?.resident||player?.puppet)return null;const hi=Math.floor(Number(player.highestRealm)||0),r=Math.floor(Number(player.realm)||0);return {n,hi,beyond:r>hi,tier:luanHoiTier(n)};}
export function drawLuanHoiRitualFrame(scene,c,ritual,t,H){
 const id=ritual?.user;if(!id)return false;const p=(scene.realPlayers||scene.players||[]).find(q=>q.id===id);const info=luanHoiRitualInfo(p);if(!info)return false;
 const age=(t-ritual.start)/1000,dur=(ritual.duration||10000)/1000,a=Math.min(1,age/.6,(dur-age)/.6);if(a<=0)return false;
 const T=info.tier,gold='#ffd27a',main=info.beyond?'#ffe9a8':T.main,sec=t/1000,m=14,W=900,Hh=H;
 c.save();c.globalAlpha=a;
 // viền tối hai bên để khung nổi
 const vg=c.createLinearGradient(0,0,0,Hh);vg.addColorStop(0,'#000000aa');vg.addColorStop(.12,'#00000000');vg.addColorStop(.88,'#00000000');vg.addColorStop(1,'#00000088');c.fillStyle=vg;c.fillRect(0,0,W,Hh);
 // viền kép
 c.strokeStyle=gold;c.lineWidth=3;c.strokeRect(m,m,W-2*m,Hh-2*m);c.strokeStyle=main;c.lineWidth=1.2;c.strokeRect(m+8,m+8,W-2*m-16,Hh-2*m-16);
 // vệt sáng chạy quanh viền
 const per=2*(W+Hh-4*m),pos=(sec*420)%per;c.globalCompositeOperation='lighter';
 for(let k=0;k<2;k++){let d=(pos+k*per/2)%per;const pt=d<W-2*m?[m+d,m]:d<W-2*m+Hh-2*m?[W-m,m+d-(W-2*m)]:d<2*(W-2*m)+Hh-2*m?[W-m-(d-(W-2*m)-(Hh-2*m)),Hh-m]:[m,Hh-m-(d-2*(W-2*m)-(Hh-2*m))];
  const g=c.createRadialGradient(pt[0],pt[1],0,pt[0],pt[1],70);g.addColorStop(0,'#ffffffcc');g.addColorStop(.3,gold+'88');g.addColorStop(1,gold+'00');c.fillStyle=g;c.fillRect(pt[0]-70,pt[1]-70,140,140);}
 // 4 bánh xe ở góc
 for(const [x,y,s] of [[m+34,m+34,1],[W-m-34,m+34,-1],[m+34,Hh-m-34,-1],[W-m-34,Hh-m-34,1]]){c.globalCompositeOperation='source-over';c.fillStyle='#0a0612e6';c.beginPath();c.arc(x,y,30,0,TAU);c.fill();c.globalCompositeOperation='lighter';wheel(c,x,y,28,sec*.8*s,gold,.95,1,true);}
 c.globalCompositeOperation='source-over';
 // băng rôn trên
 const by=Hh*.128,bw=560,bh=78; /* 20/11: dòng phụ nằm TRONG băng rôn (thẻ tên giấy dó mới nằm ngay dưới, trước đè lên nhau) */ /* dưới dòng tên của màn đột phá */c.fillStyle='#0b0612ee';c.beginPath();c.moveTo(450-bw/2,by-bh/2);c.lineTo(450+bw/2,by-bh/2);c.lineTo(450+bw/2+22,by);c.lineTo(450+bw/2,by+bh/2);c.lineTo(450-bw/2,by+bh/2);c.lineTo(450-bw/2-22,by);c.closePath();c.fill();c.strokeStyle=gold;c.lineWidth=2;c.stroke();
 const gg=c.createLinearGradient(0,by-20,0,by+20);gg.addColorStop(0,'#fffbe8');gg.addColorStop(.5,gold);gg.addColorStop(1,'#fff0c0');
 gtext(c,'☸ '+luanHoiTitle(info.n).toUpperCase()+' ☸',450,by-11,30,gg,6,4);
 gtext(c,info.beyond?'✦ PHÁ VỠ TIỀN KIẾP ✦':'Tiền kiếp · '+(REALM_NAMES[info.hi]||''),450,by+20,19,info.beyond?'#ffe9a8':'#f3e6ff',5,3);
 c.restore();return true;
}
