// 20/11/2026 — B. SÀN TRÌNH DIỄN SKIN LÚC ĐÔNG (docs/Y-TUONG-2026-11-20.md, chủ game duyệt).
// Vì sao: sân đông thì luật chống lag tắt/thu hiệu ứng skin — đúng lúc đông người xem nhất, người đã mua skin lại không được khoe.
// Cách làm: khi sân đông (heavyCrowd), cứ SHOWCASE_EVERY ms chọn 1 người đang mặc skin xịn có mặt trên sân (lần lượt, người tặng nhiều trước),
// cho SHOWCASE_MS ms ĐỦ hiệu ứng skin (tạm coi sân không đông chỉ khi vẽ người đó) + cột sáng dưới chân + bảng tên "✦ Tên · Skin".
// Một người một lúc, 4 s / 45 s → chi phí như 1 người mặc skin ở sân vắng (nới luật 08/11 ">50 người bỏ hết hiệu ứng" cho đúng 1 người, chủ game duyệt).
import {VISITOR_GIFT_REWARDS} from './visitor-rewards.js';
import {luanHoiTitle} from './luan-hoi-data.js';
export const SHOWCASE_EVERY=45000,SHOWCASE_MS=4000;
const skinName=p=>Object.values(VISITOR_GIFT_REWARDS).find(r=>r.skin===p?.skinChoice)?.skinName||'';
// Người trình diễn lúc này (target trên sân) hoặc null. premium(p) = đang mặc/sở hữu đồ có hiệu ứng skin.
export function pickSkinShow(scene,premium,now=Date.now()){
 if(!scene.heavyCrowd||scene.raceStatus?.active||scene.ritualDrawing)return null;
 if(now%SHOWCASE_EVERY>=SHOWCASE_MS)return null;
 const owners=(scene.targets||[]).filter(a=>a.player&&!a.player.resident&&!a.player.puppet&&premium(a.player)).sort((a,b)=>(b.player.giftCoins||0)-(a.player.giftCoins||0)||String(a.id).localeCompare(String(b.id)));
 return owners.length?owners[Math.floor(now/SHOWCASE_EVERY)%owners.length]:null;
}
// Vẽ fn với cờ "sân không đông" + hiệu ứng skin luôn bật, rồi trả lại nguyên trạng.
export function withFullFx(scene,fn){
 const keep={crowded:scene.crowded,heavy:scene.heavyCrowd,min:scene.minimalCrowd,always:scene.alwaysSkinFx,level:scene.budget?.level};
 scene.crowded=false;scene.heavyCrowd=false;scene.minimalCrowd=false;scene.alwaysSkinFx=true;if(scene.budget)scene.budget.level='full';
 try{fn();}finally{scene.crowded=keep.crowded;scene.heavyCrowd=keep.heavy;scene.minimalCrowd=keep.min;scene.alwaysSkinFx=keep.always;if(scene.budget)scene.budget.level=keep.level;}
}
const fade=(now=Date.now())=>{const k=(now%SHOWCASE_EVERY)/SHOWCASE_MS;return Math.max(0,Math.min(1,k*5,(1-k)*5));};
// Lớp SAU người: cột sáng vàng–ngọc dưới chân.
export function drawSkinShowBack(c,a,t){
 const s=a.scale||1,al=fade();if(al<=0)return;c.save();c.globalAlpha*=al;c.globalCompositeOperation='lighter';
 const w=70*s,h=260*s,g=c.createLinearGradient(0,a.y-h,0,a.y+10);g.addColorStop(0,'rgba(255,230,160,0)');g.addColorStop(.7,'rgba(255,220,140,.32)');g.addColorStop(1,'rgba(160,255,220,.55)');
 c.fillStyle=g;c.beginPath();c.moveTo(a.x-w*.35,a.y-h);c.lineTo(a.x+w*.35,a.y-h);c.lineTo(a.x+w,a.y+8);c.lineTo(a.x-w,a.y+8);c.closePath();c.fill();
 c.strokeStyle='rgba(255,228,150,.85)';c.lineWidth=2.5;c.beginPath();c.ellipse(a.x,a.y+6,w*1.05,w*.3,0,0,Math.PI*2);c.stroke();c.restore();
}
// Lớp TRƯỚC: bảng tên giấy dó "✦ Tên · Skin" phía trên đầu.
export function drawSkinShowFront(c,a){
 const p=a.player,al=fade();if(al<=0||!p)return;const s=a.scale||1,text=(Number(p.reincarnations)>0&&!skinName(p)?'☸ ':'✦ ')+Array.from(String(p.name||'')).slice(0,16).join('')+(skinName(p)?' · '+skinName(p):Number(p.reincarnations)>0?' · '+luanHoiTitle(Number(p.reincarnations)):''); // 21/11: người chuyển sinh không skin → ghi kiếp Luân Hồi
 c.save();c.globalAlpha*=al;c.font='800 15px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';
 const w=c.measureText(text).width+22,x=Math.max(w/2+4,Math.min(896-w/2,a.x)),y=a.y-150*s;
 c.fillStyle='rgba(243,234,216,.96)';c.strokeStyle='#b3261e';c.lineWidth=2;c.beginPath();c.roundRect(x-w/2,y-13,w,26,5);c.fill();c.stroke();
 c.fillStyle='#1b1813';c.fillText(text,x,y+1);c.restore();
}
