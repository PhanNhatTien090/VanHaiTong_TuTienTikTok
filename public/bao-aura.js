// 18/11/2026 (chủ game: "có 2 người sở hữu pháp bảo hạn chế rồi, làm hiệu ứng cho pháp bảo được nhận"):
// CHỦ NHÂN THẦN KHÍ GIỚI HẠN trên sân — món GIỚI HẠN bay cạnh vai (ảnh gốc, nhích nhẹ, quầng sáng màu món) và
// BÙNG theo nhịp (3,6 s mỗi ~40 s, lệch pha theo người) với hiệu ứng riêng từng món. Luật chống lag: sân đông (heavyCrowd) thì ẩn;
// không shadowBlur/filter; tối đa 12 người có món (12 suất/mùa).
import {baoArt,baoItem,baoBanMenh} from './phap-bao-data.js';
import {rimmed} from './rim-light.js?v=20261119';
import {BAO_ULTS} from './bao-ults.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const IMG=new Map();function art(id){if(typeof Image==='undefined')return null;let g=IMG.get(id);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=baoArt(id);IMG.set(id,g);}return g.ok?g.im:null;}
const GLOW=new Map();function glow(col){let g=GLOW.get(col);if(g)return g;let cv=null;if(typeof OffscreenCanvas!=='undefined')cv=new OffscreenCanvas(128,128);else if(typeof document!=='undefined'){cv=document.createElement('canvas');cv.width=cv.height=128;}if(!cv)return null;const c=cv.getContext('2d'),r=c.createRadialGradient(64,64,1,64,64,64);r.addColorStop(0,'#ffffff');r.addColorStop(.3,col+'cc');r.addColorStop(1,col+'00');c.fillStyle=r;c.fillRect(0,0,128,128);GLOW.set(col,cv);return cv;}
export const AURA_PERIOD=40000,AURA_BURST=3600;
/** Nhịp bùng (0 = nghỉ, 0..1 = đang bùng). Lệch pha theo người để không bùng cùng lúc. */
export function auraPhase(id,now){const k=((now+hash(id)%AURA_PERIOD)%AURA_PERIOD)/AURA_BURST;return k<1?k:0;}
function sprite(c,im,x,y,s,a=1,rot=0){if(!im||a<=.01)return;c.save();c.globalAlpha=a;c.translate(x,y);if(rot)c.rotate(rot);{const rim=rimmed(im,['#ffffff','#ffd98a'],5),k=rim===im?0:s*rim.rimPad/im.naturalWidth;c.drawImage(rim,-s/2-k,-s/2-k,s+2*k,s+2*k);}c.restore();}
function blot(c,col,x,y,r,a){const g=glow(col);if(!g||a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.drawImage(g,x-r,y-r,r*2,r*2);c.restore();}
// Hiệu ứng bùng riêng: theo món (2 món đã có chủ làm kỹ), còn lại theo dòng.
const BURST={
 'L12-huyet-hai-dao'(c,k,x,y,s,col,t,im){ // vệt chém máu xoáy + sóng đỏ lan dưới chân + giọt máu bay
  c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
  for(let i=0;i<3;i++){const u=clamp(k*3-i*.5);if(u<=0||u>=1)continue;const R=60*s+u*90*s,a0=-1.2+i*1.1;c.globalAlpha=(1-u)*.9;c.strokeStyle=i%2?'#ff2a3a':'#ffd0d4';c.lineWidth=(10-u*6)*s;c.beginPath();c.arc(x,y,R,a0,a0+2.2*u+.4);c.stroke();}
  for(let j=0;j<2;j++){const u=clamp(k*1.6-j*.35);if(u>0&&u<1){c.globalAlpha=(1-u)*.8;c.strokeStyle='#ff1f3a';c.lineWidth=4*s;c.beginPath();c.ellipse(x,y+110*s,30*s+u*150*s,(30*s+u*150*s)*.3,0,0,TAU);c.stroke();}}
  for(let i=0;i<10;i++){const u=(k*1.4+i/10)%1;blot(c,'#ff1f3a',x+Math.cos(i*2.3)*u*90*s,y-20*s+u*u*120*s-Math.sin(i*1.7)*40*s,7*s,(1-u)*.9);}
  c.restore();c.globalAlpha=1;sprite(c,im,x,y,62*s*(1+.25*Math.sin(Math.PI*k)),1,Math.sin(k*TAU*2)*.5);},
 'L03-luan-hoi-kinh'(c,k,x,y,s,col,t,im){ // 4 phân ảnh gương xoay quanh người rồi hợp nhất + vòng tím
  const out=Math.sin(Math.PI*k);c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){const q=t*.003+i*TAU/4,r=(40+70*out)*s;sprite(c,im,x-40*s+Math.cos(q)*r,y+20*s+Math.sin(q)*r*.45,46*s,.45*out);}
  c.globalAlpha=.8*out;c.strokeStyle=col;c.lineWidth=3*s;c.beginPath();c.ellipse(x-40*s,y+20*s,(40+70*out)*s,(40+70*out)*s*.45,0,0,TAU);c.stroke();
  c.restore();c.globalAlpha=1;blot(c,'#ffffff',x,y,30*s*out,.8*out);sprite(c,im,x,y,62*s*(1+.2*out),1);},
};
function genericBurst(c,k,x,y,s,col,t,im){const out=Math.sin(Math.PI*k);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.85*out;c.strokeStyle=col;c.lineWidth=4*s;for(let i=0;i<2;i++){const R=(30+i*30+60*k)*s;c.beginPath();c.arc(x,y,R,0,TAU);c.stroke();}for(let i=0;i<8;i++){const q=i/8*TAU+t*.002;blot(c,col,x+Math.cos(q)*(50+40*k)*s,y+Math.sin(q)*(50+40*k)*s,8*s,out);}c.restore();c.globalAlpha=1;sprite(c,im,x,y,62*s*(1+.2*out),1);}

/** Gọi trong lớp vẽ sau lưng nhân vật (cùng chỗ cánh). target = {player,x,y,scale}. */
export function drawBaoAura(scene,c,target,t,layer='back'){
 if(!!scene.compact!==(layer==='front'))return; /* 18/11 tối: sân gọn vẽ ở lớp TRƯỚC ngay sau người (lớp sau lưng bị hàng trên đè), sân thường vẽ sau lưng như cũ */
 // 18/11 tối (chủ game: "thần khí không trang bị được vào người à"): món BẢN MỆNH mọi bậc hiện cạnh vai (baoBan từ server);
 // 4★ nhỏ, quầng tím, không bùng · 5★ quầng vàng, bùng theo nhịp · GIỚI HẠN như cũ. Thiếu baoBan (server cũ) thì dùng baoLim.
 const p=target.player,id=p?.baoBan||(p?.bao?baoBanMenh(p)?.id:null)||p?.baoLim; /* gói đầy đủ (trang quản lý) có p.bao → tự tính */if(!id||scene.heavyCrowd||scene.raceStatus?.active)return;
 const it=baoItem(id);if(!it)return;const im=art(id);if(!im)return;
 // 18/11 tối: sân thường LIVE luôn ở chế độ gọn (compact) — trước đây bị tắt hẳn nên thần khí không bao giờ hiện; nay vẽ nhỏ cạnh vai.
 const cp=!!scene.compact,base=(target.scale||1)*(cp?.9:1),s=base*(cp?.55:1),side=hash(p.id)%2?1:-1,bob=scene.motion!==false?Math.sin(t*.0022+hash(p.id))*3*base:0,x=target.x+side*(cp?34:52)*base,y=target.y-(cp?40:118)*base+bob; /* gọn: theo khung cánh (tâm lưng y-46·s), cạnh vai */
 const col=it.tier===6?BAO_ULTS[id]?.main||'#ff8fd0':it.tier===5?'#ffd36b':'#c79bff',size=it.tier===6?54:it.tier===5?50:44;
 const k=it.tier===4?0:scene.auraK??(scene.motion===false?0:auraPhase(p.id,Date.now())); /* auraK: trang xem chiêu ép pha */
 if(k>0){(it.tier===6&&BURST[id]||genericBurst)(c,k,x,y,s*(it.tier===5?.85:1),col,t,im);return;}
 blot(c,col,x,y,(it.tier===4?30:38)*s,(it.tier===4?.28:.35)+.1*Math.sin(t*.003));sprite(c,im,x,y,size*s,1);
}
