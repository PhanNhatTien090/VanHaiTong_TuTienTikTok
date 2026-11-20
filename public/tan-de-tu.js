// 19/11/2026 — TÂN ĐỆ TỬ (kế hoạch "Vân Hải Tông Đổi Mới", giai đoạn 2): người mới vào LIVE phải THẤY MÌNH trong vài giây đầu
// và biết bước kế tiếp. Số liệu 7 ngày: 85% người mới kẹt cảnh giới 0, phần lớn chưa từng gõ lệnh.
// - Tối đa 6 người mới nhất (cảnh giới 0–1, vào trong 15 phút) giữ 6 ghế giữa sân; người mới hơn đẩy người cũ ra sân chung.
// - Vòng ngọc mực dưới chân (thở nhẹ) + nhãn giấy dó trên đầu: "Gõ 1 · nhập môn" → "Gõ 1 · tu luyện" → "Đầy · gõ 8 đột phá".
// Nhãn chỉ là lệnh gõ, KHÔNG hứa thưởng cho tim/follow/share (luật chống mồi tương tác 09/11).
// Hiệu năng: vòng + nhãn vẽ sẵn thành bitmap 1 lần (makeSurface), mỗi khung chỉ drawImage; sân rất đông (minimalCrowd) bỏ vòng, giữ nhãn.
import {makeSurface} from './performance.js';
export const TAN_DE_TU_MAX=6,TAN_DE_TU_MS=15*60000;
// 20/11: tổng số nhãn hướng dẫn trên sân (Tân Đệ Tử + đủ đột phá + nhiệm vụ tân thủ) — chủ game: màn hình không được rối.
export const HINT_MAX=4;
export const isTanDeTu=(p,now=Date.now())=>!!p&&!p.resident&&!p.puppet&&!p.webOnly&&(Number(p.realm)||0)<=1&&Number.isFinite(Number(p.joinedAt))&&now-Number(p.joinedAt)<TAN_DE_TU_MS;
// 6 người mới nhất (vào sau cùng đứng đầu) trong danh sách đang lên sân.
export function tanDeTuIds(players,now=Date.now()){
 return players.filter(p=>isTanDeTu(p,now)).sort((a,b)=>Number(b.joinedAt)-Number(a.joinedAt)||String(a.id).localeCompare(String(b.id))).slice(0,TAN_DE_TU_MAX).map(p=>p.id);
}
// Bước kế tiếp hiển thị trên đầu (null = để nhãn "đột phá" vàng có sẵn lo).
export function tanDeTuHint(p){
 if((Number(p.realm)||0)===0&&!(p.qi>0))return 'Gõ 1 · nhập môn';
 const ready=p.progressionReady!==false&&p.neededQi>0&&p.qi>=p.neededQi&&p.stones>=(p.neededStones||0);
 return ready?'Gõ 8 · đột phá':p.golden?'Gõ 1 · tu luyện ×2':'Gõ 1 · tu luyện'; // 20/11: kiểu "Gõ <số> · <việc>"; Giờ Vàng (30 phút đầu, gõ tay ×2) phải THẤY được
}
// 19/11 — NHIỆM VỤ TÂN THỦ 3 NGÀY (kế hoạch GĐ2): điểm danh hôm nay · lên cảnh giới 2 · vào một Đường.
// Hiện dưới tên người vào game trong 3 ngày (sau 15 phút Tân Đệ Tử), tối đa 3 người mới nhất (sân đã đông chữ); xong cả 3 thì thôi.
export const TAN_THU_DAYS=3,TAN_THU_MAX=3;
export const vnDay=(now=Date.now())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function tanThuQuest(p,now=Date.now(),today=vnDay(now)){
 if(!p||p.resident||p.puppet||p.webOnly)return null;const age=now-Number(p.joinedAt);if(!Number.isFinite(age)||age<0||age>=TAN_THU_DAYS*864e5)return null;
 const steps=[[p.day===today,'điểm danh'],[(Number(p.realm)||0)>=2,(Number(p.realm)||0)<1?'gõ 1 tu luyện':'lên cảnh giới 2'],[p.sectHallIndex!=null,'vào đường 1-5']];
 const done=steps.filter(x=>x[0]).length;if(done===steps.length)return null;return {done,total:steps.length,next:steps.find(x=>!x[0])[1],day:Math.floor(age/864e5)+1};
}
export function tanThuIds(players,skip=new Set(),now=Date.now()){const today=vnDay(now);
 return players.filter(p=>!skip.has(p.id)&&tanThuQuest(p,now,today)).sort((a,b)=>Number(b.joinedAt)-Number(a.joinedAt)).slice(0,TAN_THU_MAX).map(p=>p.id);}
const art=new Map();
function surface(key,w,h,draw){if(art.has(key))return art.get(key);const s=makeSurface(w,h);if(s)draw(s.getContext('2d'),w,h);art.set(key,s);return s;}
// Vòng dưới chân: vệt mực loang + viền ngọc mảnh + 4 chấm son (bitmap 2×).
function ringArt(){return surface('ring',240,84,(x,w,h)=>{x.scale(2,2);const cx=60,cy=21;
 const g=x.createRadialGradient(cx,cy,4,cx,cy,58);g.addColorStop(0,'rgba(127,220,198,.0)');g.addColorStop(.62,'rgba(127,220,198,.22)');g.addColorStop(.8,'rgba(27,24,19,.28)');g.addColorStop(1,'rgba(27,24,19,0)');
 x.save();x.translate(cx,cy);x.scale(1,.34);x.fillStyle=g;x.beginPath();x.arc(0,0,58,0,Math.PI*2);x.fill();
 x.strokeStyle='rgba(168,240,214,.9)';x.lineWidth=2.2;x.beginPath();x.arc(0,0,44,0,Math.PI*2);x.stroke();
 x.strokeStyle='rgba(244,201,106,.75)';x.lineWidth=1.2;x.beginPath();x.arc(0,0,50,0,Math.PI*2);x.stroke();
 x.fillStyle='#b3261e';for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;x.beginPath();x.arc(Math.cos(a)*50,Math.sin(a)*50,3.2,0,Math.PI*2);x.fill();}x.restore();});}
// Nhãn giấy dó viền son, chữ mực; nhãn "đột phá" nền son chữ vàng cho nổi.
function hintArt(text,quest=false){const key='hint:'+quest+':'+text;if(art.has(key))return art.get(key);const hot=!quest&&text.startsWith('Gõ 8');
 const probe=makeSurface(4,4)?.getContext('2d');if(!probe)return null;const font='800 13px "Segoe UI",Arial,sans-serif';probe.font=font;const w=Math.ceil(probe.measureText(text).width)+22,h=22;
 return surface(key,(w+4)*2,(h+4)*2,x=>{x.scale(2,2);x.translate(2,2);
  x.fillStyle=hot?'#9e2219':quest?'rgba(226,240,232,.97)':'rgba(243,234,216,.97)';x.beginPath();x.roundRect(0,0,w,h,4);x.fill();
  x.strokeStyle=hot?'#f4c96a':quest?'#2f7d6b':'#b3261e';x.lineWidth=1.4;x.beginPath();x.roundRect(1.5,1.5,w-3,h-3,3);x.stroke();
  x.font=font;x.textAlign='center';x.textBaseline='middle';x.lineWidth=3;x.strokeStyle=hot?'#3a0d08':'rgba(243,234,216,1)';x.strokeText(text,w/2,h/2+.5);x.fillStyle=hot?'#ffe7a3':'#1b1813';x.fillText(text,w/2,h/2+.5);});}
// Quầng ngọc sau thân (vẽ sẵn): lõi sáng ngọc nhạt + viền mực mỏng, thấy rõ cả khi bảng tên che chân.
function haloArt(){return surface('halo',200,200,(x,w)=>{const r=w/2,g=x.createRadialGradient(r,r,4,r,r,r);g.addColorStop(0,'rgba(190,255,232,.55)');g.addColorStop(.45,'rgba(127,220,198,.32)');g.addColorStop(.78,'rgba(127,220,198,.10)');g.addColorStop(1,'rgba(127,220,198,0)');x.fillStyle=g;x.fillRect(0,0,w,w);
 x.strokeStyle='rgba(244,201,106,.55)';x.lineWidth=2;x.beginPath();x.arc(r,r,r*.62,0,Math.PI*2);x.stroke();});}
// Lớp SAU người: quầng ngọc sau thân + vòng elip rộng ở chân (rộng hơn bảng tên để lộ hai bên).
export function drawTanDeTuBack(scene,c,t){
 const ids=scene.tanDeTu;if(!ids?.size||(scene.realPlayers?.length||0)>50||scene.raceStatus?.active)return;/* luật 08/11: >50 người mới bỏ hiệu ứng */
 const ring=ringArt(),halo=haloArt();if(!ring||!halo)return;
 for(const a of scene.targets||[]){if(!ids.has(a.id))continue;const s=a.scale||1,pulse=scene.motion===false?1:.8+.2*Math.sin(t*.003+a.x*.01);
  const hs=118*s*(.95+.08*pulse);c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=pulse;c.drawImage(halo,a.x-hs/2,a.y-40*s-hs/2,hs,hs);c.restore();
  const w=150*s,h=w*ring.height/ring.width;c.save();c.globalAlpha*=.75+.25*pulse;c.drawImage(ring,a.x-w/2,a.y+6*s-h/2,w,h);c.restore();}
}
// Nhãn bước kế: vẽ NGAY DƯỚI bảng tên, cùng lượt vẽ tên (gọi từ drawQiBar) → không bị bảng tên hàng khác đè.
export function drawTanDeTuHint(scene,c,l,t){
 const p=l.player;if(scene.raceStatus?.active||scene.warStatus?.active)return;if(scene.hintIds&&!scene.hintIds.has(p?.id))return;let im=null;
 if(scene.tanDeTu?.has(p?.id))im=hintArt(tanDeTuHint(p));
 else if(scene.tanThu?.has(p?.id)){const q=tanThuQuest(p);if(q)im=hintArt(`${q.done}/${q.total} · ${q.next}`,true);}
 if(!im)return;
 const w=im.width/2,h=im.height/2,bob=scene.motion===false?0:Math.sin(t*.004+l.x*.02)*1.5;
 c.drawImage(im,Math.max(4,Math.min(896-w,l.x+l.w/2-w/2)),l.y+l.h+2+bob,w,h);
}
