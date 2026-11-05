// v38: pháp bảo sự kiện (chỉ trao khi sự kiện kết thúc, không rèn được) + hình vẽ khi trang bị.
export const EVENT_ARTIFACTS=Object.freeze([
  {id:'hoa-tien-kiem',type:'artifact',name:'Bách Hoa Tiên Kiếm',icon:'sword',tier:0,price:0,herbs:0,damage:45,bonus:.30,exclusive:true,eventReward:'Thiên Hoa Vũ · Top 1',description:'Kiếm ngọc hồng kết từ trăm hoa: +45 sát thương, +30% tu vi khi trang bị.'},
  {id:'dao-hoa-phien',type:'artifact',name:'Đào Hoa Linh Phiến',icon:'orb',tier:0,price:0,herbs:0,damage:34,bonus:.22,exclusive:true,eventReward:'Thiên Hoa Vũ · Top 2',description:'Quạt lụa đào hoa, phẩy ra cánh hoa sắc như kiếm: +34 sát thương, +22% tu vi.'},
  {id:'hoa-linh-lung',type:'artifact',name:'Hoa Vũ Linh Lung',icon:'orb',tier:0,price:0,herbs:0,damage:24,bonus:.16,exclusive:true,eventReward:'Thiên Hoa Vũ · Top 3',description:'Linh lung tháp nhỏ chứa mưa hoa: +24 sát thương, +16% tu vi.'},
  {id:'tinh-ha-kinh',type:'artifact',name:'Tinh Hà Bảo Kính',icon:'orb',tier:0,price:0,herbs:0,damage:42,bonus:.32,exclusive:true,eventReward:'Tinh Hà Lưu Tinh · Top 1',description:'Gương soi cả dải ngân hà: +42 sát thương, +32% tu vi khi trang bị.'},
  {id:'luu-tinh-cung',type:'artifact',name:'Lưu Tinh Thần Cung',icon:'sword',tier:0,price:0,herbs:0,damage:36,bonus:.20,exclusive:true,eventReward:'Tinh Hà Lưu Tinh · Top 2',description:'Cung bắn sao băng: +36 sát thương, +20% tu vi.'},
  {id:'that-tinh-phu',type:'artifact',name:'Thất Tinh Linh Phù',icon:'scroll',tier:0,price:0,herbs:0,damage:22,bonus:.18,exclusive:true,eventReward:'Tinh Hà Lưu Tinh · Top 3',description:'Linh phù khắc Bắc Đẩu thất tinh: +22 sát thương, +18% tu vi.'},
  {id:'tinh-sa-dai',type:'artifact',name:'Tinh Sa Linh Đại',icon:'vase',tier:0,price:0,herbs:0,damage:12,bonus:.10,exclusive:true,eventReward:'Tinh Hà Lưu Tinh · tham gia',description:'Túi gấm đựng bụi sao: +12 sát thương, +10% tu vi.'}
]);
const TAU=Math.PI*2;
// Vẽ pháp bảo bay quanh nhân vật (toạ độ nhân vật, giống artifact-visuals.js).
export function drawEventRelic(c,id,t,motion=true){
  if(!EVENT_ARTIFACTS.some(a=>a.id===id))return false;
  const a=motion?t*.001:0,x=Math.cos(a)*32,y=-18+Math.sin(a)*9;
  c.save();c.translate(x,y);c.rotate(Math.sin(a*1.4)*.12);c.lineWidth=1.2;c.shadowBlur=6;
  if(id==='hoa-tien-kiem'){c.shadowColor='#ff8fb8';c.rotate(.5);const g=c.createLinearGradient(0,-22,0,10);g.addColorStop(0,'#fff0f6');g.addColorStop(1,'#ff86b0');c.fillStyle=g;
    c.beginPath();c.moveTo(-2,-22);c.lineTo(2,-22);c.lineTo(3,6);c.lineTo(0,12);c.lineTo(-3,6);c.closePath();c.fill();c.fillStyle='#ffd86b';c.fillRect(-7,-14,14,2.5);
    for(let i=0;i<4;i++){const q=a*2+i*TAU/4;c.fillStyle='#ffb3cf';c.beginPath();c.ellipse(Math.cos(q)*11,-6+Math.sin(q)*5,3,1.6,q,0,TAU);c.fill();}}
  else if(id==='dao-hoa-phien'){c.shadowColor='#ffb3cf';for(let i=0;i<7;i++){const q=-1.1+i*.37;c.fillStyle=i%2?'#ffd6e6':'#ff9ec7';c.beginPath();c.moveTo(0,8);c.arc(0,8,18,q-Math.PI/2,q-Math.PI/2+.37);c.closePath();c.fill();}
    c.strokeStyle='#8a4a2a';c.beginPath();c.moveTo(0,8);c.lineTo(0,14);c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(-5,-2,1.6,0,TAU);c.arc(5,-4,1.4,0,TAU);c.fill();}
  else if(id==='hoa-linh-lung'){c.shadowColor='#ffd6e6';c.strokeStyle='#f3ce78';c.fillStyle='#5a2a44';for(let i=0;i<3;i++){const w=12-i*3,yy=6-i*7;c.fillRect(-w,yy,w*2,5);c.strokeRect(-w,yy,w*2,5);}
    c.beginPath();c.moveTo(-4,-15);c.lineTo(0,-22);c.lineTo(4,-15);c.closePath();c.fillStyle='#f3ce78';c.fill();const f=(a*.6)%1;c.fillStyle='#ffb3cf';c.globalAlpha=1-f;c.beginPath();c.ellipse(Math.sin(a)*6,14+f*10,2.4,1.3,a,0,TAU);c.fill();}
  else if(id==='tinh-ha-kinh'){c.shadowColor='#9fc4ff';const g=c.createRadialGradient(-3,-3,1,0,0,13);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#7f9cff');g.addColorStop(1,'#2a2a6a');c.fillStyle=g;c.beginPath();c.arc(0,0,12,0,TAU);c.fill();
    c.strokeStyle='#f3ce78';c.lineWidth=2;c.stroke();for(let i=0;i<8;i++){const q=i*TAU/8+a;c.fillStyle='#f3ce78';c.beginPath();c.moveTo(Math.cos(q)*13,Math.sin(q)*13);c.lineTo(Math.cos(q+.12)*17,Math.sin(q+.12)*17);c.lineTo(Math.cos(q-.12)*17,Math.sin(q-.12)*17);c.fill();}
    for(let i=0;i<5;i++){c.fillStyle='#fff';c.fillRect(Math.cos(a*3+i)*7,Math.sin(a*2+i*2)*6,1.5,1.5);}}
  else if(id==='luu-tinh-cung'){c.shadowColor='#bfe0ff';c.strokeStyle='#cfe3ff';c.lineWidth=2.4;c.beginPath();c.arc(-6,0,16,-1.2,1.2);c.stroke();c.lineWidth=.8;c.strokeStyle='#ffffff';c.beginPath();c.moveTo(-6+Math.cos(-1.2)*16,Math.sin(-1.2)*16);c.lineTo(-6+Math.cos(1.2)*16,Math.sin(1.2)*16);c.stroke();
    c.strokeStyle='#ffe7a0';c.lineWidth=1.5;c.beginPath();c.moveTo(-2,0);c.lineTo(16,0);c.stroke();c.fillStyle='#fff3c4';c.beginPath();c.moveTo(16,-3);c.lineTo(22,0);c.lineTo(16,3);c.fill();}
  else if(id==='that-tinh-phu'){c.shadowColor='#ffe7a0';c.fillStyle='#e8d29a';c.fillRect(-8,-14,16,26);c.strokeStyle='#a33';c.strokeRect(-6,-12,12,22);
    const pts=[[-4,-8],[-1,-6],[2,-7],[4,-3],[2,1],[-1,4],[1,8]];c.strokeStyle='#7a2a2a';c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();c.fillStyle='#ffd86b';for(const [px,py] of pts){c.beginPath();c.arc(px,py,1.3,0,TAU);c.fill();}}
  else if(id==='tinh-sa-dai'){c.shadowColor='#9fc4ff';c.fillStyle='#3a3a8a';c.beginPath();c.moveTo(-8,-6);c.quadraticCurveTo(-12,10,0,12);c.quadraticCurveTo(12,10,8,-6);c.closePath();c.fill();c.strokeStyle='#f3ce78';c.stroke();
    c.fillStyle='#f3ce78';c.fillRect(-7,-9,14,3);for(let i=0;i<3;i++){const f=(a*.5+i/3)%1;c.globalAlpha=1-f;c.fillStyle='#cfe3ff';c.fillRect(Math.sin(a+i)*5,-12-f*12,1.6,1.6);}}
  c.restore();return true;
}
