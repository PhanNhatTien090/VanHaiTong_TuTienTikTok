// 20/11/2026 — C. QUÀ CÓ HÌNH ĐÁP LẠI RÕ (docs/Y-TUONG-2026-11-20.md, chủ game duyệt).
// Vì sao: tặng hồng chỉ hiện thẻ nhỏ + con số; phúc duyên 10 phút (tu luyện tay ×3/×5/×8/×12) là con số ẩn → người tặng
// KHÔNG THẤY mình mạnh lên, tặng ~6 bông rồi thôi. Nay: người đang có phúc duyên có VÒNG SÁNG dưới chân, vòng NGẮN DẦN theo
// thời gian còn lại + ấn "×N" ở đầu vòng. Màu theo bậc: ×3 ngọc · ×5 vàng · ×8 son · ×12 tím.
// Hiệu năng: chỉ người có phúc duyên, tối đa RING_MAX vòng/khung, nét đơn (không gradient/blur). Không hứa thưởng cho tim (chỉ QUÀ có phúc duyên).
export const RING_MAX=20,BUFF_MS=10*60000;
const COLOR=m=>m>=12?'#c79bff':m>=8?'#ff6b5a':m>=5?'#ffd76a':'#7fe0c4';
export function buffLeft(p,now=Date.now()){return p&&p.buffUntil>now&&(p.buffMult||1)>1?Math.min(1,(p.buffUntil-now)/BUFF_MS):0;}
// Lớp SAU người (dưới chân). now có thể là giờ server (state.serverNow + trôi) để khớp đếm ngược.
export function drawBuffRings(scene,c,t,now=Date.now()){
 if(scene.raceStatus?.active)return;let n=0;
 for(const a of scene.targets||[]){const p=a.player,k=buffLeft(p,now);if(!k)continue;if(++n>RING_MAX)break;
  const s=a.scale||1,rx=46*s,ry=13*s,y=a.y+6*s,col=COLOR(p.buffMult||1),pulse=scene.motion===false?1:.75+.25*Math.sin(t*.005+a.x*.01);
  c.save();c.lineCap='round';
  c.globalAlpha=.28;c.strokeStyle='#1b1813';c.lineWidth=4*s;c.beginPath();c.ellipse(a.x,y,rx,ry,0,0,Math.PI*2);c.stroke(); // rãnh mờ = 10 phút
  c.globalAlpha=.9*pulse;c.strokeStyle=col;c.lineWidth=3.2*s;const a0=-Math.PI/2,a1=a0+Math.PI*2*k;c.beginPath();c.ellipse(a.x,y,rx,ry,0,a0,a1);c.stroke(); // phần còn lại
  const ex=a.x+Math.cos(a1)*rx,ey=y+Math.sin(a1)*ry;c.globalAlpha=1;c.fillStyle=col;c.beginPath();c.arc(ex,ey,7.5*s,0,Math.PI*2);c.fill();
  c.fillStyle='#1b1813';c.font=`900 ${Math.round(9*s)}px "Segoe UI",Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('×'+(p.buffMult||1),ex,ey+.5);
  c.restore();}
}
