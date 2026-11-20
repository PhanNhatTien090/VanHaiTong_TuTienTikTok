// 21/11/2026 (chủ game: "ai có danh hiệu gì thì hiện chữ danh hiệu lên đầu, phân loại cho đẹp — VIP hiện đẹp hơn các danh hiệu khác").
// Thay luật 15/11 "danh hiệu chỉ là icon" — vẫn giữ tinh thần KHÔNG CHE NGƯỜI: mỗi người đúng 1 bảng nhỏ trên đầu (loại cao nhất),
// sân >30 người chỉ hiện 3 loại đầu, >50 chỉ Tông Chủ + Kim Cương. Bảng vẽ sẵn vào bitmap 2× (không mờ, không vẽ lại chữ mỗi khung);
// mỗi khung chỉ thêm vệt sáng quét / lấp lánh cho loại cao (rẻ: 1 dải gradient trong vùng cắt).
// Thứ bậc (rank càng nhỏ càng cao):
//  0 master  TÔNG CHỦ — son đỏ viền vàng kép, ♛, vệt sáng
//  1 vip3    VIP KIM CƯƠNG — pha lê xanh trắng, ◆, vệt sáng + sao lấp lánh
//  2 luanhoi LUÂN HỒI (đã chuyển sinh: màu theo bậc) · hoặc "☸ Luân Hồi · x%" cho người ở cảnh giới cuối đang tiến tới chuyển sinh
//  3 vip2    VIP VÀNG — vàng kim, ★, vệt sáng
//  4 vip1    VIP BẠC — bạc, ◆
//  5 feat    CHIẾN CÔNG (danh hiệu sự kiện còn hạn, Kiếm Khôi…) — giấy son đỏ, chữ trắng
//  6 rank    CHỨC VỊ / CẢNH GIỚI (honor) — giấy dó, chữ mực
import {vipTier,VIP_TIERS} from './vip.js';
import {luanHoiTier,luanHoiTitle} from './luan-hoi-data.js';
import {REALM_NAMES} from './progression.js';
const TAU=Math.PI*2,FONT='900 12px "Segoe UI",Arial,sans-serif';
const STYLE=Object.freeze({
 master:{bg:['#7a0f12','#c0262a','#6a0a0c'],edge:'#ffd36b',edge2:'#fff3c4',ink:'#fff4dc',icon:'♛',shine:true,glow:'#ff8a3c'},
 vip3:{bg:['#e9fbff','#8fe3ff','#4fb6e8'],edge:'#ffffff',edge2:'#bff3ff',ink:'#05304a',icon:'◆',shine:true,sparkle:true,glow:'#9fe7ff'},
 vip2:{bg:['#fff2b8','#ffcf4a','#c9871a'],edge:'#fff6d0',edge2:'#8a5a00',ink:'#3a2400',icon:'★',shine:true},
 vip1:{bg:['#ffffff','#d6dee8','#9aa6b4'],edge:'#ffffff',edge2:'#6b7684',ink:'#1e2630',icon:'◆',shine:false},
 feat:{bg:['#c23a2c','#b3261e','#8a1a14'],edge:'#f3ead8',edge2:'#5a0e0a',ink:'#fff4dc',icon:'✦'},
 rank:{bg:['#f7efdf','#f3ead8','#e4d6b8'],edge:'#1b1813',edge2:'#cfc3a6',ink:'#1b1813',icon:''},
});
const LIMIT=Object.freeze({busy:30,crowd:50});
/** Danh hiệu chính của 1 người (hoặc null). now = giờ server. */
export function titleOf(p,now=Date.now()){if(!p||p.resident||p.puppet)return null;
 const h=p.honor,v=vipTier(p.giftCoins),n=Number(p.reincarnations)||0,last=REALM_NAMES.length-1;
 if(h?.role==='sect-master'||h?.title==='TÔNG CHỦ')return {rank:0,kind:'master',text:'TÔNG CHỦ'};
 const patron=h&&['guardian','patron','patron2','patron3'].includes(h.role)?h.title:null;
 if(v===3)return {rank:1,kind:'vip3',text:patron||'VIP KIM CƯƠNG'};
 if(n>0){const tr=luanHoiTier(n);return {rank:2,kind:'luanhoi',text:luanHoiTitle(n).toUpperCase(),tier:tr};}
 if((Number(p.realm)||0)>=last&&Number(p.neededQi)>0){const pct=Math.min(100,Math.floor((Number(p.qi)||0)/Number(p.neededQi)*100));return {rank:2,kind:'luanhoi',text:pct>=100?'☸ SẴN SÀNG LUÂN HỒI':'☸ LUÂN HỒI · '+pct+'%',tier:{main:'#ffcc80',soft:'#fff1d6',deep:'#2a1a08'},pending:true};}
 if(v===2)return {rank:3,kind:'vip2',text:patron||'VIP VÀNG'};
 if(v===1)return {rank:4,kind:'vip1',text:patron||'VIP BẠC'};
 const fun=p.funTitle?.until>now?p.funTitle.name:null;
 if(fun||p.tournamentTitle||h?.role==='champion')return {rank:5,kind:'feat',text:String(fun||p.tournamentTitle||h.title).toUpperCase()};
 if(h?.title)return {rank:6,kind:'rank',text:h.title};
 return null;}
/** Có hiện không, theo độ đông sân. */
// Chức vị theo cảnh giới (rank 6) gần như ai cũng có → chỉ hiện khi sân vắng (≤10), không thì cả sân đầy bảng.
export const titleVisible=(t,count)=>!!t&&(count>LIMIT.crowd?t.rank<=1:count>LIMIT.busy?t.rank<=2:count>10?t.rank<=5:true);

function makeCanvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
const bitmaps=new Map();
function plaque(t){const key=t.kind+'|'+t.text+'|'+(t.tier?.main||'');let b=bitmaps.get(key);if(b)return b;
 const st=t.kind==='luanhoi'?{bg:[t.tier.deep,t.tier.deep,'#05040a'],edge:t.tier.main,edge2:t.tier.soft,ink:t.tier.soft,icon:t.pending?'':'☸'}:STYLE[t.kind];
 const probe=makeCanvas(4,4);if(!probe)return null;const pc=probe.getContext('2d');pc.font=FONT;const label=(st.icon?st.icon+' ':'')+t.text,tw=Math.ceil(pc.measureText(label).width);
 const W=tw+(t.rank<=1?26:18),H=t.rank<=1?20:17,cv=makeCanvas((W+4)*2,(H+4)*2);if(!cv)return null;const c=cv.getContext('2d');c.setTransform(2,0,0,2,4,4);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,st.bg[0]);g.addColorStop(.5,st.bg[1]);g.addColorStop(1,st.bg[2]);
 c.beginPath();if(t.rank<=1){const k=6;c.moveTo(k,0);c.lineTo(W-k,0);c.lineTo(W,H/2);c.lineTo(W-k,H);c.lineTo(k,H);c.lineTo(0,H/2);c.closePath();}else c.roundRect(0,0,W,H,t.kind==='rank'||t.kind==='feat'?2:H/2);
 c.fillStyle=g;c.fill();c.lineWidth=1.4;c.strokeStyle=st.edge;c.stroke();
 if(t.rank<=3&&t.kind!=='luanhoi'){c.save();c.clip();c.strokeStyle=st.edge2;c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.moveTo(4,3);c.lineTo(W-4,3);c.stroke();c.restore();} // vệt bóng mép trên (kim loại)
 c.font=FONT;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 if(t.kind==='master'||t.kind==='feat'||t.kind==='luanhoi'){c.lineWidth=2.6;c.strokeStyle='#00000099';c.strokeText(label,W/2,H/2+.5);}
 c.fillStyle=st.ink;c.fillText(label,W/2,H/2+.5);
 b={cv,w:W+4,h:H+4,st};bitmaps.set(key,b);if(bitmaps.size>220)bitmaps.delete(bitmaps.keys().next().value);return b;}

/** Vẽ bảng danh hiệu, tâm ngang x, đáy bảng ở y. */
export function drawTitlePlaque(c,t,x,y,ms,seed=0,light=false){const b=plaque(t);if(!b)return;const W=b.w,H=b.h,x0=x-W/2,y0=y-H;
 if(b.st.glow&&!light){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y0+H/2,2,x,y0+H/2,W*.6);g.addColorStop(0,b.st.glow+'55');g.addColorStop(1,b.st.glow+'00');c.globalAlpha=.6+.25*Math.sin(ms*.004+seed);c.fillStyle=g;c.fillRect(x-W*.6,y0+H/2-W*.6,W*1.2,W*1.2);c.restore();}
 c.drawImage(b.cv,x0,y0,W,H);
 if(light)return;
 if(b.st.shine){const per=3200,ph=((ms+seed*397)%per)/per;if(ph<.35){const sx=x0-20+(W+40)*(ph/.35);c.save();c.beginPath();c.rect(x0+2,y0+2,W-4,H-4);c.clip();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(sx-14,0,sx+14,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(sx-14,y0,28,H);c.restore();}}
 if(b.st.sparkle){c.save();c.globalCompositeOperation='lighter';c.fillStyle='#ffffff';for(let i=0;i<3;i++){const k=((ms*.0011+i*.37+seed*.13)%1),a=Math.sin(k*Math.PI);if(a<=.05)continue;const px=x0+W*((i*.37+seed*.07)%1),py=y0+(i%2?2:H-3),r=2.6*a;c.globalAlpha=a;c.beginPath();c.moveTo(px,py-r*1.8);c.lineTo(px+r*.5,py);c.lineTo(px,py+r*1.8);c.lineTo(px-r*.5,py);c.closePath();c.fill();c.beginPath();c.moveTo(px-r*1.8,py);c.lineTo(px,py+r*.5);c.lineTo(px+r*1.8,py);c.lineTo(px,py-r*.5);c.closePath();c.fill();}c.restore();}
}

/** Vẽ cho cả sân: gọi sau khi vẽ người + tên. targets: [{id,x,y,scale,player}] (y = chân). */
export function drawTitlePlaques(scene,c,t,nowMs){const list=scene.targets||[];if(!list.length||scene.bareCrowd&&list.length>80)return;
 const count=list.length,light=scene.budget?.level==='light';
 const labels=new Map((scene.labels||[]).map(l=>[l.id,l]));
 const elders=new Set((scene.sectElders||[]).map(e=>e?.id||e?.player?.id||e?.userId).filter(Boolean)),master=scene.sectMaster?.userId; // ghế Trưởng Lão/Tông Chủ đã có bảng chức vụ riêng
 for(const a of list){const p=a.player;if(!p||elders.has(a.id)||a.id===master)continue;const tt=titleOf(p,nowMs);if(!titleVisible(tt,count))continue;
  // 21/11: bảng nằm ngay TRÊN THẺ TÊN của chính người đó (tên đã được xếp không chồng nhau) — đặt trên đỉnh đầu thì lấn hàng ghế phía trên + đè dòng nhắc "Gõ 8"
  const l=labels.get(a.id);if(l&&l.hidden)continue;const bx=l?l.x+l.w/2:a.x,by=l?l.y-1:a.y-(a.scale||1)*66-4;
  drawTitlePlaque(c,tt,bx,by,t,(String(a.id).length*7)%13,light);}
}
