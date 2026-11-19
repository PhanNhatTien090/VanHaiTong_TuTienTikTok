// 19/11/2026 — Thủy Mặc cho các bảng vẽ trên CANVAS (Lôi Đài, Ngũ Đường chiến, Bí Cảnh, Bảo Khố, Linh Thú Cốc…).
// Chữ trong các bảng này sáng màu → dùng "BẢNG MỰC": nền mực nâu đen, viền vàng kem kép, chấm son góc. Chỉ khi body.ui-tm.
export const tmOn=()=>typeof document!=='undefined'&&!!document.body?.classList.contains('ui-tm');
export const INK_FILL='rgba(22,17,12,.9)',INK_EDGE='rgba(222,196,140,.9)';
export function inkPanel(c,x,y,w,h,r=8,edge=INK_EDGE){
 c.save();c.fillStyle=INK_FILL;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();
 c.strokeStyle=edge;c.lineWidth=1.6;c.beginPath();c.roundRect(x+.8,y+.8,w-1.6,h-1.6,r);c.stroke();
 c.globalAlpha*=.45;c.lineWidth=1;c.beginPath();c.roundRect(x+4.5,y+4.5,w-9,h-9,Math.max(2,r-3));c.stroke();c.globalAlpha/=.45;
 if(w>60&&h>30){c.fillStyle='#b3261e';c.fillRect(x+w-11,y+h-11,6,6);}
 c.restore();
}
