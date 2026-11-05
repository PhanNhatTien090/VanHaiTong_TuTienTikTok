// v37: lớp hình "Thiên Hoa Vũ" — phủ toàn cảnh khi sự kiện đang chạy (không phụ thuộc người chơi).
// Trời ửng hồng-vàng, tia sáng xiên, hoa đào 5 cánh lớn xoay rơi theo nhiều lớp sâu, cánh hoa lật 3D, đốm sáng vàng bay lên.
const TAU=Math.PI*2;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hex=a=>Math.round(255*Math.max(0,Math.min(1,a))).toString(16).padStart(2,'0');
const PINKS=[['#ffd6e6','#ff86b0'],['#fff0f5','#ffb3cf'],['#ffe9c7','#ffb86b'],['#f3e3ff','#c99bff'],['#ffffff','#ffc2d9']];
function glow(c,x,y,r,color,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hex(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function blossom(c,x,y,size,rot,flip,[light,deep]){
  c.save();c.translate(x,y);c.rotate(rot);c.scale(1,.55+.45*Math.abs(flip));
  for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);const g=c.createLinearGradient(0,0,0,-size);g.addColorStop(0,'#ffffff');g.addColorStop(.35,light);g.addColorStop(1,deep);c.fillStyle=g;
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-size*.55,-size*.25,-size*.5,-size*.95,-size*.12,-size);c.lineTo(0,-size*.86);c.lineTo(size*.12,-size);c.bezierCurveTo(size*.5,-size*.95,size*.55,-size*.25,0,0);c.fill();c.restore();}
  c.fillStyle='#ffd86b';for(let i=0;i<6;i++){const a=i*TAU/6;c.beginPath();c.arc(Math.cos(a)*size*.18,Math.sin(a)*size*.18,size*.06,0,TAU);c.fill();}
  c.fillStyle='#fff6d0';c.beginPath();c.arc(0,0,size*.1,0,TAU);c.fill();c.restore();
}
export function drawFlowerRain(c,t,H,intensity=1,light=false){
  if(intensity<=0)return;const many=light?.5:1,W=900;
  c.save();c.globalAlpha=intensity;
  // trời ửng hồng + vàng
  c.save();c.globalCompositeOperation='screen';const sky=c.createLinearGradient(0,0,0,H*.6);sky.addColorStop(0,'#ff8fc0'+hex(.5));sky.addColorStop(.5,'#ffd59a'+hex(.22));sky.addColorStop(1,'#ffd59a00');c.fillStyle=sky;c.fillRect(0,0,W,H*.6);
  // tia sáng xiên
  for(let i=0;i<4;i++){const x0=120+i*230+Math.sin(t*.0003+i)*40,g=c.createLinearGradient(x0,0,x0-180,H*.8);g.addColorStop(0,'#fff3d6'+hex(.22));g.addColorStop(1,'#fff3d600');c.fillStyle=g;c.beginPath();c.moveTo(x0-30,0);c.lineTo(x0+30,0);c.lineTo(x0-140,H*.8);c.lineTo(x0-230,H*.8);c.closePath();c.fill();}
  // viền khung hồng
  const vg=c.createRadialGradient(W/2,H*.5,H*.3,W/2,H*.5,H*.75);vg.addColorStop(0,'#ff86b000');vg.addColorStop(1,'#ff86b0'+hex(.35));c.fillStyle=vg;c.fillRect(0,0,W,H);
  c.restore();
  // dòng gió cuốn cánh hoa (3 dải chéo)
  for(let g=0;g<3;g++){const base=(t*.00008+g/3)%1;for(let i=0;i<Math.round(26*many);i++){const u=(base+i/26)%1,x=-60+u*(W+120),y=H*(.18+g*.22)+Math.sin(u*TAU*1.5+g)*90+Math.sin(t*.002+i)*12,[l,d]=PINKS[(i+g)%PINKS.length];
    c.save();c.translate(x,y);c.rotate(u*12+i);c.scale(Math.cos(t*.005+i),1);c.globalAlpha=intensity*.9*Math.sin(u*Math.PI);c.fillStyle=i%2?d:l;c.beginPath();c.ellipse(0,0,9,4.5,0,0,TAU);c.fill();c.restore();}}
  // cánh hoa nhỏ lật 3D (lớp xa)
  for(let i=0;i<Math.round(220*many);i++){const sp=.03+rnd(i)*.04,y=((t*sp+rnd(i+1)*(H+80))%(H+80))-40,x=(rnd(i+2)*W+Math.sin(t*.001+i)*40+t*.01)%W,flip=Math.cos(t*.004+i);
    const [l,d]=PINKS[i%PINKS.length];c.save();c.translate(x,y);c.rotate(t*.002+i);c.scale(flip,1);c.fillStyle=i%3?d:l;c.globalAlpha=intensity*(.75+.25*rnd(i+3));c.beginPath();c.ellipse(0,0,8+rnd(i+4)*7,4+rnd(i+5)*2,0,0,TAU);c.fill();c.restore();}
  // hoa lớn xoay rơi (lớp gần, to hơn, rơi chậm)
  for(let i=0;i<Math.round(34*many);i++){const sp=.018+rnd(i+20)*.022,size=22+rnd(i+21)*26,y=((t*sp+rnd(i+22)*(H+160))%(H+160))-80,x=(rnd(i+23)*W+Math.sin(t*.0008+i*2)*70)%W;
    c.save();c.globalCompositeOperation='screen';glow(c,x,y,size*2.2,PINKS[i%PINKS.length][1],.4);c.restore();
    blossom(c,x,y,size,t*.0012*(i%2?1:-1)+i,Math.cos(t*.002+i),PINKS[i%PINKS.length]);}
  // đốm sáng vàng bay lên
  c.save();c.globalCompositeOperation='screen';for(let i=0;i<Math.round(40*many);i++){const u=((t*.00012*(1+rnd(i+40))+rnd(i+41))%1),x=rnd(i+42)*W+Math.sin(t*.002+i)*20,y=H*(1-u);glow(c,x,y,4+rnd(i+43)*5,'#ffe7a0',.8*Math.sin(u*Math.PI));}c.restore();
  c.restore();
}

// v38: "Tinh Hà Lưu Tinh" — trời đêm tím xanh, dải ngân hà, sao lấp lánh, sao băng chéo màn hình,
// thiên thạch lớn rơi xuống quảng trường nổ sáng, chòm sao Bắc Đẩu hiện dần.
export function drawMeteorShower(c,t,H,intensity=1,light=false){
  if(intensity<=0)return;const many=light?.5:1,W=900;
  c.save();c.globalAlpha=intensity;
  // trời đêm
  const sky=c.createLinearGradient(0,0,0,H*.75);sky.addColorStop(0,'#070624'+hex(.82));sky.addColorStop(.55,'#1e1450'+hex(.5));sky.addColorStop(1,'#2a1a5a00');c.fillStyle=sky;c.fillRect(0,0,W,H*.75);
  c.save();c.globalCompositeOperation='screen';
  // dải ngân hà chéo
  c.save();c.translate(W/2,H*.22);c.rotate(-.35);for(let i=0;i<Math.round(160*many);i++){const u=rnd(i)*2-1,v=(rnd(i+1)-.5)*(1-Math.abs(u)*.5);glow(c,u*620,v*90,1.5+rnd(i+2)*2.5,i%4?'#cfd8ff':'#ffd6f0',.55+.4*rnd(i+3));}
  const band=c.createLinearGradient(0,-90,0,90);band.addColorStop(0,'#7f6cff00');band.addColorStop(.5,'#9f8cff'+hex(.42));band.addColorStop(1,'#7f6cff00');c.fillStyle=band;c.fillRect(-640,-90,1280,180);c.restore();
  // sao lấp lánh
  for(let i=0;i<Math.round(90*many);i++){const x=rnd(i+50)*W,y=rnd(i+51)*H*.6,tw=.4+.6*Math.abs(Math.sin(t*.003+i*1.7));glow(c,x,y,2+tw*4,'#ffffff',tw*.9);}
  // chòm Bắc Đẩu hiện dần
  const dip=[[560,120],[610,140],[655,150],[700,170],[715,225],[775,240],[790,190]];c.strokeStyle='#cfe3ff'+hex(.45);c.lineWidth=1.5;c.beginPath();dip.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();for(const [x,y] of dip)glow(c,x,y,9,'#fff7d0',.95);
  // sao băng chéo
  for(let i=0;i<Math.round(26*many);i++){const per=1400+rnd(i+70)*1600,u=((t+rnd(i+71)*per)%per)/per;if(u>.5)continue;const k=u/.5,x0=rnd(i+72)*W*1.2,y0=-40+rnd(i+73)*H*.25,len=180+rnd(i+74)*160,x=x0-k*520,y=y0+k*420;
    const g=c.createLinearGradient(x,y,x+len*.78,y-len*.63);g.addColorStop(0,'#ffffff'+hex(.95*(1-k*.5)));g.addColorStop(1,'#8fb4ff00');c.strokeStyle=g;c.lineWidth=4.5;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x+len*.78,y-len*.63);c.stroke();glow(c,x,y,22,'#e6f0ff',.95*(1-k*.5));}
  // thiên thạch lớn rơi xuống quảng trường mỗi ~4 giây
  const cyc=4200,ph=(t%cyc)/cyc,seed=Math.floor(t/cyc),tx=220+rnd(seed)*460,ty=H*.62;
  if(ph<.45){const k=ph/.45,x=tx+380*(1-k),y=-60+(ty+60)*k;for(let j=0;j<24;j++){const b=j/24;glow(c,x+b*150,y-b*160,(34-j)*1.5,j%3?'#8fb4ff':'#ffe7a0',.55*(1-b));}glow(c,x,y,44,'#ffffff',1);glow(c,x,y,90,'#9fc4ff',.5);}
  else if(ph<.75){const k=(ph-.45)/.3;c.fillStyle='#e6f0ff'+hex(.35*(1-k));c.fillRect(0,0,W,H);for(let r=0;r<3;r++){c.strokeStyle='#cfe3ff'+hex((1-k)*.8);c.lineWidth=5-r;c.beginPath();c.ellipse(tx,ty,30+k*(220+r*60),(30+k*(220+r*60))*.3,0,0,TAU);c.stroke();}
    for(let j=0;j<14;j++){const a=-Math.PI*(j/13),d=k*160;glow(c,tx+Math.cos(a)*d,ty+Math.sin(a)*d*.8,6,'#ffe7a0',.9*(1-k));}}
  c.restore();c.restore();
}
