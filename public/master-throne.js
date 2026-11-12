// 12/11/2026: NGAI TÔNG CHỦ — ngai vàng ngọc vẽ MỘT lần vào canvas riêng (cache theo kích thước), mỗi khung chỉ drawImage.
// Hiệu ứng theo cấp Tông Chủ (theo tổng quà, không ghi số coin lên màn):
//  • mọi Tông Chủ: ngai rồng vàng + đĩa trăng sau lưng thở nhẹ
//  • Kim Cương (≥1.000): + vòng phù văn vàng xoay chậm
//  • Chí Tôn (≥5.000): + cột sáng trời giáng, 8 đốm kim quang bay quanh, dải lụa danh hiệu đỏ vàng
// Tất cả là ảnh cache xoay/đổi alpha → chi phí mỗi khung rất nhỏ.
const TAU=Math.PI*2,cache=new Map();
export function masterTier(coins){const c=Number(coins)||0;return c>=5000?2:c>=1000?1:0;}
export const MASTER_TITLES=[null,'KIM CƯƠNG','CHÍ TÔN']; // danh hiệu nhỏ trên đỉnh ngai
function surface(w,h){if(typeof OffscreenCanvas==='undefined'&&typeof document==='undefined')return null; /* chạy test ngoài trình duyệt */const s=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});return s;}
function memo(key,w,h,paint){let s=cache.get(key);if(s)return s;s=surface(w,h);if(!s)return null;paint(s.getContext('2d'),w,h);cache.set(key,s);if(cache.size>12)cache.delete(cache.keys().next().value);return s;}

// Ngai: lưng cao hình vòm, 2 đầu rồng vàng trên tay vịn, đệm đỏ, bậc ngọc. Toạ độ: gốc ở giữa mặt ghế, đơn vị = scale.
function paintThrone(c,W,H){
 c.translate(W/2,H*.78);const k=W/160;c.scale(k,k);c.lineJoin='round';
 const gold=(y0,y1)=>{const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#fff1b8');g.addColorStop(.35,'#e9c25e');g.addColorStop(.7,'#a8792a');g.addColorStop(1,'#f3d27a');return g;};
 // bậc ngọc
 c.fillStyle='#173f45';c.strokeStyle=gold(18,40);c.lineWidth=2.2;
 for(const [w,y,h] of [[150,22,9],[136,13,9]]){c.beginPath();c.roundRect(-w/2,y,w,h,2);c.fill();c.stroke();}
 // lưng ngai
 const back=c.createLinearGradient(0,-118,0,10);back.addColorStop(0,'#2a6b6b');back.addColorStop(.5,'#123a44');back.addColorStop(1,'#0b2630');
 c.fillStyle=back;c.strokeStyle=gold(-120,10);c.lineWidth=4;
 c.beginPath();c.moveTo(-52,12);c.lineTo(-56,-62);c.bezierCurveTo(-60,-96,-30,-112,0,-122);c.bezierCurveTo(30,-112,60,-96,56,-62);c.lineTo(52,12);c.closePath();c.fill();c.stroke();
 // hoa văn mây vàng trong lưng
 c.strokeStyle='#e9c25e88';c.lineWidth=1.6;
 for(const s of [-1,1]){c.beginPath();c.moveTo(s*40,4);c.lineTo(s*43,-58);c.bezierCurveTo(s*44,-84,s*24,-98,0,-104);c.stroke();
  for(let i=0;i<3;i++){c.beginPath();c.arc(s*26,-30-i*22,7,0,Math.PI*1.4);c.stroke();}}
 // ngọc tâm + vương miện đỉnh
 const jade=c.createRadialGradient(-3,-80,1,0,-78,11);jade.addColorStop(0,'#eafff6');jade.addColorStop(.5,'#5fe0bf');jade.addColorStop(1,'#11685a');
 c.fillStyle=jade;c.strokeStyle=gold(-92,-66);c.lineWidth=2.5;c.beginPath();c.arc(0,-79,10,0,TAU);c.fill();c.stroke();
 c.fillStyle=gold(-142,-118);c.beginPath();c.moveTo(-16,-118);c.lineTo(-11,-134);c.lineTo(-5,-124);c.lineTo(0,-142);c.lineTo(5,-124);c.lineTo(11,-134);c.lineTo(16,-118);c.closePath();c.fill();
 // tay vịn đầu rồng
 for(const s of [-1,1]){
  c.save();c.scale(s,1);
  c.fillStyle=gold(-34,12);c.strokeStyle='#5a3d0f';c.lineWidth=1.4;
  c.beginPath();c.moveTo(48,10);c.lineTo(50,-22);c.bezierCurveTo(56,-36,72,-40,80,-30);c.bezierCurveTo(86,-22,80,-12,72,-14);c.lineTo(66,-16);c.lineTo(64,10);c.closePath();c.fill();c.stroke();
  c.fillStyle='#fff1b8';c.beginPath();c.moveTo(70,-34);c.lineTo(76,-48);c.lineTo(74,-33);c.closePath();c.fill(); // sừng
  c.fillStyle='#c0262b';c.beginPath();c.arc(74,-26,2.6,0,TAU);c.fill(); // mắt
  c.restore();
 }
 // đệm đỏ
 const cushion=c.createLinearGradient(0,-6,0,12);cushion.addColorStop(0,'#d8423a');cushion.addColorStop(1,'#7a1218');
 c.fillStyle=cushion;c.strokeStyle=gold(-6,12);c.lineWidth=2;c.beginPath();c.roundRect(-46,-6,92,16,5);c.fill();c.stroke();
}
// Đĩa trăng sau lưng ngai.
function paintMoon(c,W,H){const r=W/2,g=c.createRadialGradient(r,r,r*.15,r,r,r);g.addColorStop(0,'rgba(255,248,220,.55)');g.addColorStop(.55,'rgba(150,230,210,.22)');g.addColorStop(1,'rgba(150,230,210,0)');c.fillStyle=g;c.fillRect(0,0,W,H);}
// Vòng phù văn vàng (xoay khi vẽ).
function paintRunes(c,W){const r=W/2;c.translate(r,r);c.strokeStyle='rgba(255,215,106,.85)';c.lineWidth=2;
 c.beginPath();c.arc(0,0,r*.92,0,TAU);c.stroke();c.lineWidth=1;c.beginPath();c.arc(0,0,r*.78,0,TAU);c.stroke();
 c.fillStyle='rgba(255,226,150,.9)';for(let i=0;i<24;i++){const a=i*TAU/24;c.save();c.rotate(a);c.translate(0,-r*.85);
  if(i%3===0){c.beginPath();c.moveTo(0,-5);c.lineTo(4,0);c.lineTo(0,5);c.lineTo(-4,0);c.closePath();c.fill();}else c.fillRect(-1,-4,2,8);c.restore();}
 for(let i=0;i<6;i++){c.save();c.rotate(i*TAU/6);c.beginPath();c.moveTo(0,-r*.78);c.lineTo(r*.12,-r*.6);c.lineTo(-r*.12,-r*.6);c.closePath();c.stroke();c.restore();}}
// Cột sáng trời giáng.
function paintPillar(c,W,H){const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'rgba(255,230,160,0)');g.addColorStop(.5,'rgba(255,240,190,.55)');g.addColorStop(1,'rgba(255,230,160,0)');
 c.fillStyle=g;c.fillRect(0,0,W,H);const f=c.createLinearGradient(0,0,0,H);f.addColorStop(0,'rgba(0,0,0,1)');f.addColorStop(.8,'rgba(0,0,0,.9)');f.addColorStop(1,'rgba(0,0,0,0)');
 c.globalCompositeOperation='destination-in';c.fillStyle=f;c.fillRect(0,0,W,H);}
function paintMote(c,W){const r=W/2,g=c.createRadialGradient(r,r,0,r,r,r);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.3,'rgba(255,215,106,.8)');g.addColorStop(1,'rgba(255,215,106,0)');c.fillStyle=g;c.fillRect(0,0,W,W);}

// LỚP SAU: trăng, cột sáng, phù văn, ngai. Gọi trước khi vẽ nhân vật.
export function drawThroneBack(c,x,y,height,tier,t,motion=true){
 const s=Math.max(.5,height/120),pulse=motion?.5+.5*Math.sin(t*.0016):.6;
 if(tier>=2){const pw=110*s,ph=y+20;const pillar=memo('pillar',96,480,paintPillar);c.save();c.globalCompositeOperation='screen';c.globalAlpha=.55+.25*pulse;if(pillar)c.drawImage(pillar,x-pw/2,0,pw,ph);c.restore();}
 const mr=Math.round(96*s),moon=memo('moon',256,256,paintMoon);c.save();c.globalCompositeOperation='screen';c.globalAlpha=.75+.25*pulse;if(moon)c.drawImage(moon,x-mr,y-height*.95-mr*.55,mr*2,mr*2);c.restore();
 if(tier>=1){const rr=Math.round(70*s),runes=memo('runes',256,256,(cx,W)=>paintRunes(cx,W));c.save();c.translate(x,y-height*.62);c.rotate(motion?t*.00025:0);c.globalAlpha=.8;c.globalCompositeOperation='screen';if(runes)c.drawImage(runes,-rr,-rr,rr*2,rr*2);c.restore();}
 const tw=Math.round(124*s),th=Math.round(tw*1.15),throne=memo('throne:'+tw,tw,th,paintThrone);
 if(throne)c.drawImage(throne,x-tw/2,y-th*.78+12);
}
// LỚP TRƯỚC: đốm kim quang (Chí Tôn). Gọi sau khi vẽ nhân vật.
export function drawThroneFront(c,x,y,height,tier,t,motion=true,name=""){
 {const s=Math.max(.5,height/120),ny=y-height*1.02-(tier>=1?24*s:0);if(name){c.save();c.textAlign="center";c.textBaseline="middle";c.font="800 "+Math.round(17*s)+"px Georgia";c.lineWidth=4;c.strokeStyle="#081820";c.strokeText(name,x,ny,300);c.fillStyle=tier>=2?"#ffe08a":"#fff1c4";c.fillText(name,x,ny,300);c.restore();}}
 if(tier>=1){const s=Math.max(.5,height/120),ty=y-height*1.02;c.save();c.textAlign='center';c.textBaseline='middle';c.font='800 '+Math.round(13*s)+'px Georgia';const label='✦ '+MASTER_TITLES[tier]+' ✦',w=c.measureText(label).width+20*s,h=20*s;
  const g=c.createLinearGradient(0,ty-h/2,0,ty+h/2);g.addColorStop(0,tier>=2?'#c0262b':'#1f5f95');g.addColorStop(1,tier>=2?'#6e0f15':'#123a63');c.fillStyle=g;c.strokeStyle='#e9c46a';c.lineWidth=1.6;c.beginPath();c.moveTo(x-w/2,ty-h/2);c.lineTo(x+w/2,ty-h/2);c.lineTo(x+w/2-6*s,ty);c.lineTo(x+w/2,ty+h/2);c.lineTo(x-w/2,ty+h/2);c.lineTo(x-w/2+6*s,ty);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ffe7a3';c.fillText(label,x,ty+1);c.restore();}
 if(tier<2)return;const s=Math.max(.5,height/120),mote=memo('mote',32,32,(cx,W)=>paintMote(cx,W));
 if(!mote)return;c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<8;i++){const a=(motion?t*.0006:0)+i*TAU/8,rx=62*s,ry=22*s,px=x+Math.cos(a)*rx,py=y-height*.45+Math.sin(a)*ry-(motion?Math.sin(t*.002+i)*8*s:0),sz=(7+3*Math.sin(i*1.7))*s*(Math.sin(a)>0?1.15:.75);
  c.globalAlpha=Math.sin(a)>0?.95:.45;c.drawImage(mote,px-sz,py-sz,sz*2,sz*2);}
 c.restore();
}
// Bảng tên vàng + danh hiệu theo cấp (thay ô chữ phẳng cũ).
export function drawMasterPlate(c,x,top,name,tier){
 c.save();c.textAlign='center';c.textBaseline='middle';
 const title='TÔNG CHỦ';c.font='800 19px Georgia';const w=c.measureText(title).width+40,h=30;
 const g=c.createLinearGradient(0,top,0,top+h);g.addColorStop(0,tier>=2?'#b3262b':'#123a44');g.addColorStop(1,tier>=2?'#6e0f15':'#0b2630');
 c.fillStyle=g;c.strokeStyle='#e9c46a';c.lineWidth=2.5;c.beginPath();c.moveTo(x-w/2,top);c.lineTo(x+w/2,top);c.lineTo(x+w/2-10,top+h/2);c.lineTo(x+w/2,top+h);c.lineTo(x-w/2,top+h);c.lineTo(x-w/2+10,top+h/2);c.closePath();c.fill();c.stroke();
 c.fillStyle='#ffe7a3';c.shadowColor='#000';c.shadowBlur=3;c.fillText(title,x,top+h/2+1);
 if(name){c.font='800 21px Georgia';c.lineWidth=4;c.strokeStyle='#081820';c.strokeText(name,x,top+h+20,320);c.fillStyle=tier>=2?'#ffe08a':'#fff1c4';c.fillText(name,x,top+h+20,320);}
 c.restore();
}
