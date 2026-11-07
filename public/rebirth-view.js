// 07/11/2026: phần thưởng hiển thị của Chuyển Sinh (chỉ hình ảnh, không cộng sức mạnh).
// - Danh hiệu: Nhất Chuyển … Thập Chuyển, từ 11 trở đi "Chuyển Sinh N".
// - Dấu trên tên: "✦N" đặt trước tên.
// - Sao chuyển sinh xoay quanh đầu nhân vật: mỗi lần một sao (tối đa 9 sao), màu đổi theo bậc.
const NUM=['','Nhất','Nhị','Tam','Tứ','Ngũ','Lục','Thất','Bát','Cửu','Thập'];
const COLORS=['#ffe9a8','#9fe6ff','#c9a0ff','#ff9ec7','#7dffcf'];
export const rebirthCount=p=>Number.isSafeInteger(p?.reincarnations)&&p.reincarnations>0?p.reincarnations:0;
export function rebirthTitle(n){n=Number(n)||0;return n<=0?'':n<=10?NUM[n]+' Chuyển':'Chuyển Sinh '+n;}
export const rebirthColor=n=>COLORS[Math.min(COLORS.length-1,Math.floor(Math.max(0,n-1)/2))];
export const rebirthMark=p=>{const n=rebirthCount(p);return n?'✦'+n+' ':'';};
// Vẽ trong toạ độ cục bộ của nhân vật (đã translate tới chân + scale). headY: độ cao đỉnh đầu (âm).
export function drawRebirthStars(c,p,t,motion=true,headY=-74){
 const n=rebirthCount(p);if(!n)return;const k=Math.min(9,n),color=rebirthColor(n),spin=motion?t*.0012:0;
 c.save();c.globalCompositeOperation='lighter';
 c.globalAlpha=.45;c.strokeStyle=color;c.lineWidth=1.2;c.beginPath();c.ellipse(0,headY,26,7,0,0,Math.PI*2);c.stroke();
 for(let i=0;i<k;i++){const a=spin+i*Math.PI*2/k,x=Math.cos(a)*26,y=headY+Math.sin(a)*7,front=Math.sin(a)>0,r=front?4.6:3.4;
  const g=c.createRadialGradient(x,y,0,x,y,r*3.2);g.addColorStop(0,'#ffffff');g.addColorStop(.35,color+'dd');g.addColorStop(1,color+'00');c.globalAlpha=front?1:.6;c.fillStyle=g;c.fillRect(x-r*3.2,y-r*3.2,r*6.4,r*6.4);
  c.fillStyle='#ffffff';c.beginPath();for(let q=0;q<4;q++){const b=q*Math.PI/2;c.lineTo(x+Math.cos(b)*r*1.6,y+Math.sin(b)*r*1.6);c.lineTo(x+Math.cos(b+Math.PI/4)*r*.5,y+Math.sin(b+Math.PI/4)*r*.5);}c.fill();}
 c.restore();
}
// Bảng chuyển sinh (top theo số lần, rồi cảnh giới cao nhất, rồi tổng tu vi).
export function rebirthLeaders(players,limit=3){
 return players.filter(p=>!p.resident&&!p.puppet&&rebirthCount(p)>0).sort((a,b)=>rebirthCount(b)-rebirthCount(a)||(b.highestRealm||0)-(a.highestRealm||0)||(b.totalQi||0)-(a.totalQi||0)).slice(0,limit)
  .map(p=>({id:p.id,name:p.name,reincarnations:rebirthCount(p),title:rebirthTitle(rebirthCount(p))}));
}
