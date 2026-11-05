import {GIFT_SPECTACLES,giftSpectacleTier} from './gift-spectacle.js';
// v35: hiệu ứng quà cao cấp theo mốc giá trị (coin × số lượng), vẽ CHỒNG lên hiệu ứng quà lớn có sẵn (luxury-fx).
// 199–299 Điệp Vũ Tiên Hoa · 300–499 Linh Điệp Kiếm Liên · 500–999 Xích Phượng Lâm Thế
// 1000–1999 Thương Long Hộ Chủ · 2000+ Long Phượng Trình Tường. Rồng/bướm vẽ bằng code; phượng dùng ảnh yêu thú gốc.
const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v)),ease=k=>1-(1-clamp(k))**3,smooth=k=>{k=clamp(k);return k*k*(3-2*k);};
const hex=a=>Math.round(255*clamp(a)).toString(16).padStart(2,'0');
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const LEGACY_HIGH_GIFT_TIERS=Object.freeze([
  {min:199,name:'Điệp Vũ Tiên Hoa'},{min:300,name:'Linh Điệp Kiếm Liên'},{min:500,name:'Xích Phượng Lâm Thế'},
  {min:1000,name:'Thương Long Hộ Chủ'},{min:2000,name:'Long Phượng Trình Tường'}]);
export const HIGH_GIFT_TIERS=Object.freeze([...LEGACY_HIGH_GIFT_TIERS.slice(0,2),...GIFT_SPECTACLES]);
export function highGiftLevel(e){const v=Math.max(1,Number(e.coins)||1)*Math.max(1,Number(e.count)||1);let lv=0;LEGACY_HIGH_GIFT_TIERS.forEach((t,i)=>{if(v>=t.min)lv=i+1;});return lv;}
export const highGiftName=e=>giftSpectacleTier(e)?.name||LEGACY_HIGH_GIFT_TIERS[highGiftLevel(e)-1]?.name||null;
function glow(c,x,y,r,color,a=1){if(r<=0||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hex(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

// ---------- Bướm phát sáng ----------
function butterfly(c,x,y,size,ang,flap,colA,colB){
  c.save();c.translate(x,y);c.rotate(ang);const f=.25+.75*Math.abs(Math.sin(flap));
  glow(c,0,0,size*2.2,colA,.35);
  for(const side of [-1,1]){c.save();c.scale(side*f,1);
    let g=c.createRadialGradient(size*.5,-size*.4,0,size*.5,-size*.4,size*1.3);g.addColorStop(0,'#ffffff');g.addColorStop(.35,colA);g.addColorStop(1,colB+'40');
    c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(size*.3,-size*1.5,size*1.6,-size*1.3,size*1.2,-size*.1);c.bezierCurveTo(size*1.1,size*.2,size*.4,size*.1,0,0);c.fill();
    g=c.createRadialGradient(size*.4,size*.5,0,size*.4,size*.5,size);g.addColorStop(0,'#ffffff');g.addColorStop(.4,colB);g.addColorStop(1,colA+'30');
    c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(size*.9,size*.1,size*1,size*1,size*.35,size*1.05);c.bezierCurveTo(size*.1,size*.9,0,size*.4,0,0);c.fill();c.restore();}
  c.fillStyle='#fff6e0';c.beginPath();c.ellipse(0,0,size*.09,size*.55,0,0,TAU);c.fill();c.restore();
}
function butterflySwarm(c,x,cy,t,k,H,n,palette,spread=1){
  for(let i=0;i<n;i++){
    const phase=rnd(i)*TAU,speed=.7+rnd(i+3)*.6,lift=smooth((k-.45-rnd(i+7)*.2)/.5);
    const a=phase+t*.0016*speed,R=(110+rnd(i+11)*130)*spread*ease(k/.3);
    const bx=x+Math.cos(a)*R+(rnd(i+5)-.5)*lift*500,by=cy+Math.sin(a)*R*.45-lift*(cy+80)+Math.sin(t*.003+i)*10;
    const [ca,cb]=palette[i%palette.length];c.save();c.globalCompositeOperation='screen';for(let d=1;d<=4;d++){const pa=a-d*.09*speed;glow(c,x+Math.cos(pa)*R+(rnd(i+5)-.5)*lift*500,cy+Math.sin(pa)*R*.45-lift*(cy+80)+d*6,5-d,cb,.5-d*.1);}c.restore();
    butterfly(c,bx,by,14+rnd(i+2)*12,Math.cos(a)*.5-lift*.3,t*.02*speed+i,ca,cb);}
}

// ---------- Mây tường vân (họa tiết mây cuộn cổ điển) ----------
function auspiciousCloud(c,x,y,s,color,alpha){
  c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=alpha;
  const g=c.createLinearGradient(0,-26,0,18);g.addColorStop(0,'#ffffff');g.addColorStop(1,color);c.fillStyle=g;
  c.beginPath();c.arc(-26,4,14,Math.PI*.5,Math.PI*1.5);c.arc(-8,-8,16,Math.PI,0);c.arc(16,-2,13,Math.PI*1.2,Math.PI*.1);c.arc(30,8,9,Math.PI*1.4,Math.PI*.5);c.closePath();c.fill();
  c.strokeStyle=color;c.lineWidth=2.2;c.lineCap='round';
  for(const [cx,cy,r] of [[-8,-6,9],[16,0,7]]){c.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU*1.35,rr=r*(1-i/30);const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  c.restore();
}
function flamingPearl(c,x,y,t,s,color){
  c.save();c.globalCompositeOperation='screen';glow(c,x,y,46*s,color,.7);glow(c,x,y,22*s,'#ffffff',.9);
  for(let i=0;i<5;i++){const a=t*.006+i*TAU/5;c.strokeStyle=color+'c0';c.lineWidth=3*s;c.beginPath();c.arc(x,y,16*s,a,a+1.1);c.stroke();
    c.fillStyle=color;c.beginPath();c.ellipse(x+Math.cos(a+1.1)*20*s,y+Math.sin(a+1.1)*20*s,5*s,2.5*s,a+2.6,0,TAU);c.fill();}
  c.restore();c.fillStyle='#fffbe8';c.beginPath();c.arc(x,y,9*s,0,TAU);c.fill();
}
// v61: rồng vẽ từ ảnh Thương Long (celestial-bosses-v1, ô 0) — đẹp hơn rồng vẽ bằng code. Lượn từ trời xuống,
// dừng sau lưng người được vinh danh, hào quang xoay + mây lành + long châu; cuối hiệu ứng bay vút lên.
function drawDragonArt(c,img,t,k,x,cy,H,{scale=1,gold=false,many=1}={}){
  // ảnh gốc mỗi ô 512×1024 (tỉ lệ 1:2); sprite đã cắt về 320×480 nên vẽ lại theo tỉ lệ gốc
  const h=Math.min(H*.46,700)*scale,w=h*.5;
  const enter=smooth(clamp(k/.28)),leave=smooth(clamp((k-.84)/.16)),dx=Math.max(w*.42,Math.min(900-w*.42,x));
  const restY=Math.max(h*.5+H*.04,cy-h*.32),y=restY+(-h-restY)*(1-enter)+(-h*1.2-restY)*leave+Math.sin(t*.0021)*12;
  const X=dx+(1-enter)*160-leave*60,rot=Math.sin(t*.0015)*.045+(1-enter)*.25,A=clamp(enter*1.4)*(1-leave*.8);
  const aura=gold?'#ffd36b':'#7fe8ff',aura2=gold?'#fff1c0':'#d8fbff';
  c.save();c.globalCompositeOperation='screen';
  // hào quang + tia sáng xoay sau rồng
  glow(c,X,y,h*.75,aura,.45*A);glow(c,X,y-h*.15,h*.35,aura2,.4*A);
  c.translate(X,y-h*.1);c.rotate(t*.00035);const n=many<1?12:20;
  for(let i=0;i<n;i++){const a=i*TAU/n,L=h*(.6+.15*Math.sin(t*.002+i));const g=c.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);g.addColorStop(0,aura+hex(.45*A));g.addColorStop(1,aura+'00');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-.06)*L,Math.sin(a-.06)*L);c.lineTo(Math.cos(a+.06)*L,Math.sin(a+.06)*L);c.closePath();c.fill();}
  c.restore();
  // vệt gió khi lao xuống
  if(enter<1){c.save();c.globalCompositeOperation='screen';for(let i=0;i<10;i++){const tx=X+40+i*16,ty=y-h*.3-i*h*.07;glow(c,tx,ty,(60-i*4)*scale,aura,.35*(1-enter)*(1-i/10));}c.restore();}
  // thân rồng (ảnh gốc, không phủ màu)
  c.save();c.globalAlpha*=A;c.translate(X,y);c.rotate(rot);const br=1+Math.sin(t*.003)*.015;c.scale(br,br);c.drawImage(img,-w/2,-h/2,w,h);c.restore();
  // sóng xung kích lúc rồng đáp
  const land=clamp((k-.26)/.2);if(land>0&&land<1){c.save();c.globalCompositeOperation='screen';c.strokeStyle=aura2+hex((1-land)*.9);c.lineWidth=8*(1-land)+2;c.beginPath();c.ellipse(X,y+h*.3,60+land*420,(60+land*420)*.32,0,0,TAU);c.stroke();c.restore();}
  // mây lành dưới chân rồng
  c.save();c.globalCompositeOperation='screen';glow(c,X,y+h*.42,w*1.1,gold?'#ffe3a0':'#bfefff',.35*A);c.restore();
  for(let i=0;i<4;i++){const side=i%2?1:-1,off=side*(w*.28+i*w*.12)+Math.sin(t*.0008+i)*16,yy=y+h*(.3+i*.05);auspiciousCloud(c,X+off,yy,(.9+rnd(i)*.5)*scale,gold?'#ffe3a0':'#bfefff',.5*A);}
  // long châu xoay trước miệng rồng
  const pa=t*.003;flamingPearl(c,X+Math.cos(pa)*w*.32,y-h*.2+Math.sin(pa)*h*.06,t,1.3*scale,gold?'#ff9a4d':'#fff3a0');
  // tia lấp lánh rơi
  c.save();c.globalCompositeOperation='screen';for(let i=0;i<Math.round(18*many);i++){const u=(t*.0005+rnd(i))%1;glow(c,X+(rnd(i+5)-.5)*w*1.6,y-h*.4+u*h*1.1,6+rnd(i)*6,i%2?aura:aura2,.8*(1-u)*A);}c.restore();
}
// ---------- Rồng vẽ bằng code (dự phòng khi ảnh chưa tải) ----------
function dragonPath(s,x,cy,H,mode){
  // mode 'coil': quấn quanh người tặng rồi vút lên; 'cross': lượn ngang trời.
  if(mode==='cross'){const px=-200+s*1300,py=H*.2+Math.sin(s*TAU*1.4)*70;return [px,py];}
  const a=s*TAU*1.5,rise=smooth((s-.55)/.45),R=260*(1-rise*.45);
  return [x+Math.cos(a)*R,cy+Math.sin(a)*R*.38-s*120-rise*(cy+200)];
}
function drawDragon(c,t,k,x,cy,H,{mode='coil',body='#2fd6a3',belly='#d9ffef',fin='#a7f0ff',dark='#0d6b55',pearl='#fff3a0',scale=1,delay=0,many=1}){
  const head=clamp((k-delay)*1.25)*1.05;if(head<=0)return;
  const N=Math.round(80*many),ds=.0075/many;const pts=[];
  for(let i=0;i<N;i++){const s=head-i*ds;if(s<-.02)break;pts.push(dragonPath(Math.max(0,s),x,cy,H,mode));}
  if(pts.length<3)return;
  // Vệt linh khí + mây tường vân dọc thân.
  c.save();c.globalCompositeOperation='screen';for(let i=0;i<pts.length;i+=3)glow(c,pts[i][0],pts[i][1],46*scale*(1-i/pts.length),fin,.25);c.restore();
  for(let i=8;i<pts.length;i+=Math.round(14/many)){const [px,py]=pts[i];auspiciousCloud(c,px+(rnd(i)-.5)*60,py+28*scale+(rnd(i+1)-.5)*20,(.7+rnd(i+2)*.5)*scale,fin,.85*(1-i/pts.length*.6));}
  // Thân: từ đuôi lên đầu.
  for(let i=pts.length-1;i>=1;i--){const [px,py]=pts[i],[qx,qy]=pts[i-1],ang=Math.atan2(qy-py,qx-px),u=i/pts.length,r=(36-u*26)*scale;
    c.save();c.translate(px,py);c.rotate(ang);
    const g=c.createLinearGradient(0,-r,0,r);g.addColorStop(0,body);g.addColorStop(.55,body);g.addColorStop(.75,belly);g.addColorStop(1,body);
    c.fillStyle=g;c.beginPath();c.ellipse(0,0,r*1.1,r,0,0,TAU);c.fill();
    c.strokeStyle=dark;c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,r*1.1,r,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
    c.fillStyle='#ffffff38';c.beginPath();c.ellipse(0,-r*.45,r*.8,r*.22,0,0,TAU);c.fill();
    if(i%2===0){c.strokeStyle=dark+'90';c.lineWidth=1.2;for(const yy of [-r*.35,r*.1]){c.beginPath();c.arc(-r*.1,yy,r*.38,-1.3,1.3);c.stroke();}}
    if(i%3===0){c.fillStyle=fin;c.beginPath();c.moveTo(-r*.6,-r*.85);c.lineTo(0,-r*1.75);c.lineTo(r*.5,-r*.85);c.closePath();c.fill();}
    if(i===Math.round(pts.length*.25)||i===Math.round(pts.length*.6)){c.strokeStyle=body;c.lineWidth=4*scale;c.beginPath();c.moveTo(0,r*.6);c.lineTo(-r*.6,r*1.8);c.stroke();c.fillStyle=fin;for(let j=-1;j<=1;j++){c.beginPath();c.arc(-r*.6+j*4*scale,r*1.9,2.2*scale,0,TAU);c.fill();}}
    c.restore();}
  // Đầu rồng.
  const [hx,hy]=pts[0],[nx,ny]=pts[1],ha=Math.atan2(hy-ny,hx-nx),s=scale*1.9;
  const [px0,py0]=dragonPath(Math.min(1.08,head+.05),x,cy,H,mode);flamingPearl(c,px0+Math.sin(t*.004)*8,py0+Math.cos(t*.005)*8,t,scale*1.2,pearl);
  c.save();c.translate(hx,hy);c.rotate(ha);
  c.save();c.globalCompositeOperation='screen';glow(c,8*s,0,70*s,fin,.45);c.restore();
  // bờm lửa
  for(let i=0;i<7;i++){const a=Math.PI*.6+i*.16,L=(30+rnd(i)*16)*s;c.fillStyle=i%2?fin:'#ffffff';c.globalAlpha=.85;c.beginPath();c.moveTo(-6*s,0);c.quadraticCurveTo(Math.cos(a)*L*.6-10*s,Math.sin(a)*L*.6-8*s,Math.cos(a)*L-14*s,Math.sin(a)*L+Math.sin(t*.01+i)*4);c.lineTo(-2*s,6*s);c.fill();}
  c.globalAlpha=1;
  let g=c.createLinearGradient(0,-16*s,0,16*s);g.addColorStop(0,body);g.addColorStop(.7,belly);g.addColorStop(1,body);
  c.fillStyle=g;c.beginPath();c.moveTo(-14*s,-14*s);c.quadraticCurveTo(14*s,-20*s,40*s,-8*s);c.lineTo(44*s,-2*s);c.quadraticCurveTo(20*s,2*s,6*s,4*s);c.quadraticCurveTo(-8*s,14*s,-14*s,10*s);c.closePath();c.fill();
  const jaw=Math.abs(Math.sin(t*.006))*6*s;c.beginPath();c.moveTo(0,6*s);c.quadraticCurveTo(22*s,8*s+jaw,38*s,4*s+jaw);c.lineTo(34*s,10*s+jaw);c.quadraticCurveTo(14*s,16*s+jaw,-4*s,12*s);c.closePath();c.fill();
  c.fillStyle='#ffffff';for(let i=0;i<4;i++){c.beginPath();c.moveTo(14*s+i*6*s,4*s);c.lineTo(16*s+i*6*s,8*s);c.lineTo(18*s+i*6*s,4*s);c.fill();}
  // sừng
  c.strokeStyle='#fff3c4';c.lineWidth=3.2*s;c.lineCap='round';for(const off of [0,5]){c.beginPath();c.moveTo(-4*s+off*s,-12*s);c.quadraticCurveTo(-20*s+off*s,-34*s,-38*s+off*s,-30*s);c.stroke();c.beginPath();c.moveTo(-18*s+off*s,-24*s);c.lineTo(-14*s+off*s,-36*s);c.stroke();}
  // mắt
  glow(c,14*s,-9*s,10*s,'#fff7b0',.9);c.fillStyle='#ffef7a';c.beginPath();c.ellipse(14*s,-9*s,4*s,2.6*s,0,0,TAU);c.fill();c.fillStyle='#1a1020';c.beginPath();c.ellipse(15*s,-9*s,1.2*s,2.2*s,0,0,TAU);c.fill();
  // râu dài
  c.strokeStyle=fin;c.lineWidth=2*s;for(const side of [-1,1]){c.beginPath();c.moveTo(36*s,side*2*s);for(let i=1;i<=10;i++){const u=i/10;c.lineTo(36*s-u*90*s,side*(4+u*20)*s+Math.sin(t*.008+u*6+side)*10*s*u);}c.stroke();}
  c.restore();
}

// ---------- Phượng hoàng (ảnh yêu thú gốc) ----------
function drawPhoenix(c,img,t,k,H,{delay=0,scale=1,y0=.22,dir=1}={}){
  const u=clamp((k-delay)/.75);if(u<=0||u>=1||!img)return;
  const x=dir>0?-260+u*1420:1160-u*1420,y=H*y0+Math.sin(u*TAU*1.2)*60,flap=Math.sin(t*.012);
  c.save();c.globalCompositeOperation='screen';
  for(let i=0;i<26;i++){const tx=x-dir*(i*22),ty=y+30+Math.sin(u*TAU*1.2-i*.08)*20;glow(c,tx,ty,(46-i*1.4)*scale,i%3?'#ff8a3d':'#ffd36b',.4*(1-i/26));}
  for(let i=0;i<12;i++){const fu=(u*3+rnd(i))%1,fx=x-dir*(40+rnd(i+4)*220),fy=y+fu*260;c.fillStyle=i%2?'#ffb35a':'#ffe7a8';c.globalAlpha=1-fu;c.beginPath();c.ellipse(fx,fy,3,9,fu*6+i,0,TAU);c.fill();}
  c.restore();
  c.save();c.globalCompositeOperation='screen';glow(c,x-60*dir,y-30,150*scale,'#ff7a2e',.35+.15*flap);glow(c,x+40*dir,y-50,110*scale,'#ffd36b',.3);
  for(let i=0;i<18;i++){const eu=(t*.0012+rnd(i))%1;glow(c,x-dir*(60+eu*240)+(rnd(i+3)-.5)*80,y+40+eu*120,6*(1-eu)+2,i%2?'#ffb35a':'#fff0b0',.9*(1-eu));}c.restore();
  c.save();c.translate(x,y);c.scale(dir*scale*(1+flap*.09),scale*(1-flap*.1));const w=300,h=w*(img.height||img.naturalHeight||300)/(img.width||img.naturalWidth||300);
  c.drawImage(img,-w/2,-h/2,w,h);c.restore();
}

export function drawHighGift(c,e,t,k,p,H,{light=false,phoenix=null,dragon=null}={}){
  const lv=highGiftLevel(e);if(!lv)return;const many=light?.55:1;
  const x=p.x,cy=p.y-60,fade=clamp(Math.min(k/.08,(1-k)/.12));
  c.save();c.globalAlpha=fade;
  // Mở màn quà lớn: chớp sáng toàn màn hình + vòng xung kích lớn.
  if(k<.1){c.save();c.globalCompositeOperation='screen';c.fillStyle='rgba(255,246,220,'+(.35*(1-k/.1)).toFixed(2)+')';c.fillRect(0,0,900,H);c.restore();}
  if(k<.35){const w=k/.35;c.save();c.globalCompositeOperation='screen';c.strokeStyle='#fff3c4'+hex((1-w)*.9);c.lineWidth=10*(1-w)+2;c.beginPath();c.ellipse(x,cy+40,40+w*520,(40+w*520)*.42,0,0,TAU);c.stroke();c.restore();}
  const flowerPal=[['#ff9ec7','#ffd6f0'],['#9fd8ff','#e6f6ff'],['#ffe08a','#fff6d0'],['#c9a6ff','#f1e6ff']];
  const firePal=[['#ff9a4d','#ffe0a0'],['#ffcf5a','#fff3c2'],['#ff6b6b','#ffd0b0']];
  if(lv===1||lv===2){
    // mưa cánh hoa
    for(let i=0;i<Math.round(46*many);i++){const u=(k*1.1+rnd(i))%1,px=rnd(i+9)*900+Math.sin(u*8+i)*30;c.save();c.translate(px,u*H*.9);c.rotate(u*10+i);c.fillStyle=['#ffb3cf','#ffe3ef','#ffd1e3'][i%3];c.globalAlpha=fade*.85;c.beginPath();c.ellipse(0,0,7,3.5,0,0,TAU);c.fill();c.restore();}
    butterflySwarm(c,x,cy,t,k,H,Math.round((lv===1?18:24)*many),flowerPal);
  }
  if(lv===2){
    // 16 phi kiếm xếp đóa sen xoay + sóng sáng
    const open=ease(k/.35);for(let i=0;i<16;i++){const a=i*TAU/16+t*.0009,R=150*open;c.save();c.translate(x+Math.cos(a)*R,cy+40+Math.sin(a)*R*.4);c.rotate(a+Math.PI/2);
      c.save();c.globalCompositeOperation='screen';glow(c,0,0,22,'#9fe7ff',.5);c.restore();c.fillStyle=i%2?'#e8fbff':'#ffe9a8';c.beginPath();c.moveTo(-3,-30);c.lineTo(3,-30);c.lineTo(4,10);c.lineTo(0,22);c.lineTo(-4,10);c.closePath();c.fill();c.fillRect(-10,-20,20,3);c.restore();}
    c.save();c.globalCompositeOperation='screen';for(let i=0;i<3;i++){const w=(k*1.4+i/3)%1;c.strokeStyle='#bfefff'+hex((1-w)*.7);c.lineWidth=3;c.beginPath();c.ellipse(x,cy+80,60+w*320,(60+w*320)*.3,0,0,TAU);c.stroke();}c.restore();
  }
  if(lv===3){
    c.save();c.globalCompositeOperation='screen';glow(c,450,H*.25,420,'#ff7a3d',.18*fade);c.restore();
    drawPhoenix(c,phoenix,t,k,H,{delay:.05,scale:1.25,y0:.24});
    butterflySwarm(c,x,cy,t,k,H,Math.round(14*many),firePal,.9);
  }
  if(lv===4){
    c.save();c.globalCompositeOperation='screen';glow(c,x,cy,360,'#3fe0b0',.16*fade);c.restore();
    if(dragon)drawDragonArt(c,dragon,t,k,x,cy,H,{scale:1,many});else drawDragon(c,t,k,x,cy,H,{mode:'coil',scale:1.15,many});
    for(let i=0;i<Math.round(24*many);i++){const u=(k*1.2+rnd(i))%1;c.save();c.globalCompositeOperation='screen';glow(c,rnd(i+3)*900,u*H*.8,10,'#9ff7e0',.6*(1-u));c.restore();}
  }
  if(lv>=5){
    c.save();c.globalCompositeOperation='screen';glow(c,450,H*.3,520,'#ffd36b',.2*fade);c.restore();
    if(dragon)drawDragonArt(c,dragon,t,k,x,cy,H,{scale:1.1,gold:true,many});else drawDragon(c,t,k,x,cy,H,{mode:'coil',scale:1.25,body:'#e8b23a',belly:'#fff4cf',fin:'#ffe7a0',dark:'#8a5a12',pearl:'#ff8a5a',many});
    drawPhoenix(c,phoenix,t,k,H,{delay:.18,scale:1.1,y0:.16,dir:-1});
    for(let i=0;i<Math.round(60*many);i++){const u=(k*1.3+rnd(i))%1;c.fillStyle=i%3?'#ffe08a':'#ffffff';c.fillRect(rnd(i+11)*900,u*H*.9,2,10);}
    butterflySwarm(c,x,cy,t,k,H,Math.round(12*many),[['#ffe08a','#fff6d0'],['#ffb35a','#ffe7c0']],1.1);
  }
  c.restore();
}
