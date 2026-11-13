// v51: hiệu ứng BIẾN HÌNH khi người chơi nhận skin khách mời (Vương Lâm / Hàn Lập).
// Lớp sau: trận phù văn dưới chân + cột sáng + hồn lửa / phi kiếm xoay. Lớp trước: kén sương cuộn kín người (che lúc đổi hình),
// chớp sáng + sóng xung kích ở k≈0,45, rồi sương tan ra để lộ hình mới. REVEAL_AT dùng chung với scene để đổi hình đúng lúc chớp.
import {drawCourtTransformation,isCourtTransform} from './court-skin-fx.js';
export const TRANSFORM_MS=6000,REVEAL_AT=.45;
const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v)),ease=k=>1-(1-clamp(k))**3;
const hex=a=>Math.round(255*clamp(a)).toString(16).padStart(2,'0');
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const STYLE={viemton:{a:'#ff5a14',b:'#ffe2a0',dark:'#1a0402',mist:'#5c1206'},khuyniet:{a:'#a45bff',b:'#ffe7a0',dark:'#0e0418',mist:'#2c1050'},tudo:{a:'#ff3b2f',b:'#ffd0a8',dark:'#1a0306',mist:'#5c0a14'},hailam:{a:'#4fcaff',b:'#e1fbff',dark:'#07142f',mist:'#184b79'},doraemon:{a:'#61dbff',b:'#fff6bb',dark:'#061a31',mist:'#164a6d'},shende:{a:'#ffb15d',b:'#fff2c6',dark:'#260b13',mist:'#633123'},vuonglam:{a:'#a46bff',b:'#efe2ff',dark:'#1a0b2e',mist:'#3a1d63'},hanlap:{a:'#4fe0a0',b:'#eafff4',dark:'#06281c',mist:'#164a37'}};
function glow(c,x,y,r,color,a){if(r<=0||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hex(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function leaf(c,len,w,color){c.fillStyle=color;c.beginPath();c.moveTo(0,-len/2);c.quadraticCurveTo(w,0,0,len/2);c.quadraticCurveTo(-w,0,0,-len/2);c.fill();}
function sword(c,len,color){c.fillStyle=color;c.beginPath();c.moveTo(-1.6,-len*.55);c.lineTo(1.6,-len*.55);c.lineTo(2.2,len*.3);c.lineTo(0,len*.45);c.lineTo(-2.2,len*.3);c.closePath();c.fill();c.fillRect(-5,-len*.38,10,1.8);}
function ghostFlame(c,x,y,s,color,t,i){c.save();c.translate(x,y);c.scale(s,s);const g=c.createLinearGradient(0,-26,0,10);g.addColorStop(0,color+'00');g.addColorStop(.5,color+'c0');g.addColorStop(1,'#ffffffd0');c.fillStyle=g;
  const w=Math.sin(t*.01+i)*3;c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-9,4,-6+w,-12,0+w,-26);c.bezierCurveTo(6+w,-12,9,4,0,10);c.fill();c.restore();}
export function drawTransform(c,e,t,k,p,H,layer='front'){
  if(isCourtTransform(e.transform)){drawCourtTransformation(c,e.transform,t,k,p,H,layer,REVEAL_AT);return;}
  const kind=STYLE[e.transform]?e.transform:'vuonglam',s=STYLE[kind],sc=(p.scale||1.6)/1.6,x=p.x,feet=p.y+18*sc,cy=p.y-40*sc;
  const fade=clamp(Math.min(k/.06,(1-k)/.12));c.save();c.globalAlpha=fade;
  if(layer==='back'){
    // màn tối nhẹ + cột sáng
    c.fillStyle=s.dark+hex(.45);c.fillRect(0,0,900,H);
    c.globalCompositeOperation='screen';
    const bw=120*sc,beam=c.createLinearGradient(x-bw,0,x+bw,0);beam.addColorStop(0,s.a+'00');beam.addColorStop(.5,s.a+hex(.55));beam.addColorStop(1,s.a+'00');c.fillStyle=beam;c.fillRect(x-bw,0,bw*2,feet);
    // trận phù văn dưới chân (2 vòng xoay ngược)
    for(let j=0;j<2;j++){const R=(110+j*50)*sc*ease(k/.25);c.save();c.translate(x,feet);c.scale(1,.32);c.rotate(t*.0012*(j?-1:1));
      c.strokeStyle=s.b+hex(.85-j*.25);c.lineWidth=3-j;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.beginPath();c.arc(0,0,R*.82,0,TAU);c.stroke();
      for(let i=0;i<16;i++){c.save();c.rotate(i*TAU/16);c.fillStyle=s.a;c.fillRect(R*.84,-3,R*.14,6);c.restore();}c.restore();}
    glow(c,x,feet,180*sc,s.a,.45);
    // hồn lửa (Vương Lâm) / phi kiếm trúc (Hàn Lập) xoay sau lưng
    const n=kind==='vuonglam'||kind==='viemton'?10:14;for(let i=0;i<n;i++){const a=i*TAU/n+t*.0016,R=95*sc*ease(k/.3),px=x+Math.cos(a)*R,py=cy+Math.sin(a)*R*.42;
      if(kind==='vuonglam'||kind==='viemton')ghostFlame(c,px,py,sc*1.1,s.a,t,i);else{c.save();c.translate(px,py);c.rotate(a+Math.PI/2);sword(c,40*sc,i%2?s.b:s.a);c.restore();}}
    c.restore();return;
  }
  // ---- lớp trước ----
  const cover=k<REVEAL_AT?ease(k/REVEAL_AT):1-ease((k-REVEAL_AT)/.4);
  // kén sương / lá trúc cuộn kín người
  c.globalCompositeOperation='source-over';
  const blobs=26;for(let i=0;i<blobs;i++){const u=i/blobs,a=u*TAU*2+t*.004*(i%2?1:-1),out=k>REVEAL_AT?ease((k-REVEAL_AT)/.45)*120*sc:0,R=(24+rnd(i)*34)*sc*(1.4-cover*.6)+out,px=x+Math.cos(a)*R*.7,py=cy+Math.sin(a)*R*1.05+(u-.5)*60*sc;
    const r=(26+rnd(i+3)*20)*sc;const g=c.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,s.mist+hex(.9*cover));g.addColorStop(1,s.mist+'00');c.fillStyle=g;c.fillRect(px-r,py-r,r*2,r*2);}
  c.globalCompositeOperation='screen';
  if(kind==='hanlap'){for(let i=0;i<30;i++){const a=i*.7+t*.006,R=(30+(i%6)*10)*sc*(1.3-cover*.5)+(k>REVEAL_AT?ease((k-REVEAL_AT)/.4)*200*sc:0);c.save();c.translate(x+Math.cos(a)*R,cy+Math.sin(a)*R*.9);c.rotate(a);c.globalAlpha=fade*Math.max(.25,cover);leaf(c,16*sc,5*sc,i%3?s.a:s.b);c.restore();}}
  else{for(let i=0;i<22;i++){const a=i*.9+t*.005,R=(28+(i%5)*12)*sc*(1.3-cover*.5)+(k>REVEAL_AT?ease((k-REVEAL_AT)/.4)*180*sc:0);ghostFlame(c,x+Math.cos(a)*R,cy+Math.sin(a)*R,sc*.8,s.a,t,i);}}
  glow(c,x,cy,90*sc*(.6+cover),s.a,.5*cover);
  // chớp sáng + sóng xung kích lúc biến hình
  const fk=(k-REVEAL_AT)/.12;if(fk>-0.3&&fk<1){const f=1-Math.abs(fk);c.fillStyle='#ffffff'+hex(.75*clamp(f));c.fillRect(0,0,900,H);glow(c,x,cy,260*sc,s.b,clamp(f));}
  if(k>REVEAL_AT&&k<REVEAL_AT+.35){const w=(k-REVEAL_AT)/.35;for(let r=0;r<3;r++){c.strokeStyle=s.b+hex((1-w)*.9);c.lineWidth=(6-r*1.5)*sc;c.beginPath();c.ellipse(x,cy,(40+w*(320+r*60))*sc,(40+w*(320+r*60))*.55*sc,0,0,TAU);c.stroke();}}
  // vệt kiếm / hồn phiên bắn tỏa sau khi lộ hình
  if(k>REVEAL_AT){const w=ease((k-REVEAL_AT)/.35);for(let i=0;i<12;i++){const a=i*TAU/12,R=(60+w*220)*sc;c.save();c.translate(x+Math.cos(a)*R,cy+Math.sin(a)*R*.7);c.rotate(a+Math.PI/2);c.globalAlpha=fade*(1-w)*.9;
    if(kind==='hanlap')sword(c,46*sc,s.b);else{c.fillStyle=s.a;c.fillRect(-3*sc,-24*sc,6*sc,48*sc);c.fillStyle=s.b;c.fillRect(-1*sc,-24*sc,2*sc,48*sc);}c.restore();}}
  if(kind==='khuyniet')drawKhuyDescent(c,t,k,x,cy,feet,sc,H,fade);
  if(kind==='viemton')drawViemDescent(c,t,k,x,cy,feet,sc,H,fade);
  c.restore();
}
// Khuy Niết Lôi Tôn giáng thế: màn chia đôi vàng (Dương Thực) / tím (Âm Hư), thiên lôi dồn xuống người, chữ lớn hai nhịp.
function drawKhuyDescent(c,t,k,x,cy,feet,sc,H,fade){
  c.save();c.globalCompositeOperation='screen';const split=k<REVEAL_AT?ease(k/.15):1-ease((k-REVEAL_AT)/.4);
  c.fillStyle='#ffb53a'+hex(.22*split);c.fillRect(0,0,450,H);c.fillStyle='#9a4dff'+hex(.26*split);c.fillRect(450,0,450,H);
  // thiên lôi: mỗi 0,06 k một tia, trái vàng phải tím; dày đặc nhất ngay trước lúc lộ hình
  if(k<REVEAL_AT+.1){const key=Math.floor(k*50);c.lineCap='round';for(let j=0;j<3;j++){const seed=key*3+j,left=seed%2===0,sx=x+(rnd(seed)-.5)*500,col=left?'#ffc23a':'#b06bff';let px=sx,py=0;c.strokeStyle=col+hex(.9*fade);c.lineWidth=(5+rnd(seed+1)*4)*sc*.6;c.beginPath();c.moveTo(px,py);
    for(let i=1;i<=10;i++){px=sx+(x-sx)*i/10+(rnd(seed*11+i)-.5)*70;py=(cy-30*sc)*i/10;c.lineTo(px,py);}c.stroke();c.strokeStyle='#ffffff'+hex(.9*fade);c.lineWidth=2*sc*.6;c.stroke();}}
  c.restore();
  const word=(txt,a,b,y,size,col)=>{if(k<a||k>b)return;const u=clamp((k-a)/.05),f=1-clamp((k-b+.06)/.06);c.save();c.globalAlpha=fade*f;c.textAlign='center';c.textBaseline='middle';c.translate(450,y);c.scale(1.6-.6*u,1.6-.6*u);c.font='900 '+size+'px "Times New Roman", serif';c.lineWidth=9;c.strokeStyle='#14051f';c.strokeText(txt,0,0);c.fillStyle=col;c.fillText(txt,0,0);c.restore();};
  word('ÂM HƯ – DƯƠNG THỰC',.06,REVEAL_AT,H*.2,58,'#ffd36a');word('KHUY NIẾT',REVEAL_AT,.92,H*.17,104,'#d9b8ff');word('LÔI TÔN GIÁNG THẾ',REVEAL_AT+.04,.92,H*.17+92,50,'#ffe7a0');
}

// Tần Mục Hỏa Thần giáng thế: màn ửng cam đỏ, lửa trào từ đáy lên + 2 cột lửa ôm người dồn vào, chữ lớn hai nhịp.
function drawViemDescent(c,t,k,x,cy,feet,sc,H,fade){
  c.save();c.globalCompositeOperation='screen';const heat=k<REVEAL_AT?ease(k/.15):1-ease((k-REVEAL_AT)/.4);
  const g=c.createLinearGradient(0,H,0,0);g.addColorStop(0,'#ff4a10'+hex(.42*heat));g.addColorStop(.6,'#ff8a1a'+hex(.16*heat));g.addColorStop(1,'#ff8a1a00');c.fillStyle=g;c.fillRect(0,0,900,H);
  // lưỡi lửa trào từ đáy màn
  const n=18,rise=k<REVEAL_AT?ease(k/REVEAL_AT):1-ease((k-REVEAL_AT)/.45);for(let i=0;i<n;i++){const u=i/(n-1),fx=u*900,h=(220+rnd(i+3)*260)*rise*(1+.25*Math.sin(t*.01+i)),w=70+rnd(i)*50;
    const lg=c.createLinearGradient(0,H,0,H-h);lg.addColorStop(0,'#ffd27a'+hex(.85*fade));lg.addColorStop(.35,'#ff6a1c'+hex(.7*fade));lg.addColorStop(1,'#ff2a0a00');c.fillStyle=lg;
    c.beginPath();c.moveTo(fx-w/2,H);c.quadraticCurveTo(fx-w*.3+Math.sin(t*.008+i)*12,H-h*.55,fx+Math.sin(t*.006+i)*18,H-h);c.quadraticCurveTo(fx+w*.3,H-h*.5,fx+w/2,H);c.fill();}
  // 2 cột lửa xoắn dồn vào người trước lúc lộ hình
  if(k<REVEAL_AT+.08){const pull=ease(k/REVEAL_AT);for(const side of [-1,1]){const px=x+side*(260-pull*230)*sc*.6;const cg=c.createLinearGradient(px-40*sc,0,px+40*sc,0);cg.addColorStop(0,'#ff3a0a00');cg.addColorStop(.5,'#ffb04a'+hex(.75*fade));cg.addColorStop(1,'#ff3a0a00');c.fillStyle=cg;c.fillRect(px-40*sc,0,80*sc,feet);}}
  c.restore();
  const word=(txt,a,b,y,size,col)=>{if(k<a||k>b)return;const u=clamp((k-a)/.05),f=1-clamp((k-b+.06)/.06);c.save();c.globalAlpha=fade*f;c.textAlign='center';c.textBaseline='middle';c.translate(450,y);c.scale(1.6-.6*u,1.6-.6*u);c.font='900 '+size+'px "Times New Roman", serif';c.lineWidth=9;c.strokeStyle='#2a0602';c.strokeText(txt,0,0);c.fillStyle=col;c.fillText(txt,0,0);c.restore();};
  word('PHẦN THIÊN LIỆT DIỄM',.06,REVEAL_AT,H*.2,58,'#ffd36a');word('TẦN MỤC',REVEAL_AT,.92,H*.17,104,'#ffb070');word('HỎA THẦN GIÁNG THẾ',REVEAL_AT+.04,.92,H*.17+92,50,'#ffe7a0');
}
