// v33: hiệu ứng đột phá riêng cho từng cảnh giới. Nền chung lấy từ Trúc Cơ (trận pháp xoay, vòng sáng,
// cột ngọc, hạt sáng bay vòng, cột sáng); cảnh giới càng cao càng nhiều tầng + một điểm nhấn riêng.
// Dùng chung cho cảnh (scene.js) và hàng trình diễn (presentation.js). Tọa độ cảnh rộng 900.
import {ascensionProfile,drawAscension} from './ascension-art.js';
const TAU=Math.PI*2;
export {REALM_NAMES} from './progression.js';
import {REALM_NAMES} from './progression.js';
// Cảnh giới vừa đạt: ưu tiên toRealm (cơ duyên), không thì đọc tên cảnh giới cao nhất trong câu sự kiện.
export function breakthroughRealm(e){
  if(Number.isInteger(e?.toRealm))return Math.max(1,Math.min(REALM_NAMES.length-1,e.toRealm));
  const text=String(e?.text||'').normalize('NFC').toLocaleUpperCase('vi');
  for(let i=REALM_NAMES.length-1;i>0;i--)if(text.includes(REALM_NAMES[i].toLocaleUpperCase('vi').normalize('NFC')))return i;
  return 1;
}
export const breakthroughDuration=e=>ascensionProfile(breakthroughRealm(e)).duration;
export function breakthroughTitleLayout(e,k,p,H,viewScale=1,motion=true){
  const realm=breakthroughRealm(e),duration=breakthroughDuration(e),span=Math.min(4200,duration*.48),u=(k*duration-duration*.45)/span;
  if(u<=0||u>=1)return null;
  const enter=Math.min(1,u/.22),v=enter-1,pop=1+2.70158*v*v*v+1.70158*v*v;
  return {text:REALM_NAMES[realm].normalize('NFC').toLocaleUpperCase('vi'),realm,color:ascensionProfile(realm).color,
    x:p.x,y:Math.max(H*.20,Math.min(H*.44,p.y-300))-(motion?u*18:0),fontSize:70+realm*3,
    scale:motion ? .72+.28*pop : 1,alpha:Math.max(0,Math.min(1,u/.10,(1-u)/.24)),maxWidth:Math.min(720,760/Math.max(1,viewScale))};
}
export function drawBreakthroughTitle(c,e,k,p,H,viewScale=1,motion=true){
  const a=breakthroughTitleLayout(e,k,p,H,viewScale,motion);if(!a)return;
  c.save();c.globalAlpha*=a.alpha;c.translate(a.x,a.y);c.scale(a.scale,a.scale);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  c.font='600 18px Segoe UI';c.fillStyle='#e7d7ad';c.strokeStyle='#0b1422';c.lineWidth=2;c.strokeText('ĐỘT PHÁ',0,-a.fontSize*.73);c.fillText('ĐỘT PHÁ',0,-a.fontSize*.73);
  c.font='600 '+a.fontSize+'px Arial';c.strokeStyle='#17202c';c.lineWidth=2.5;c.strokeText(a.text,0,0,a.maxWidth/a.scale);
  const g=c.createLinearGradient(0,-a.fontSize*.5,0,a.fontSize*.5);g.addColorStop(0,'#fff7df');g.addColorStop(.45,'#efdaa0');g.addColorStop(1,'#b89150');c.fillStyle=g;c.fillText(a.text,0,0,a.maxWidth/a.scale);
  c.strokeStyle='#d9bc7f';c.lineWidth=1;const w=Math.min(a.maxWidth*.25,160),yy=a.fontSize*.64;c.beginPath();c.moveTo(-w,yy);c.lineTo(-12,yy);c.moveTo(12,yy);c.lineTo(w,yy);c.stroke();c.fillStyle='#e6cb91';c.beginPath();c.moveTo(0,yy-4);c.lineTo(4,yy);c.lineTo(0,yy+4);c.lineTo(-4,yy);c.closePath();c.fill();c.restore();
}
// a: màu chính · b: màu sáng · c: màu phụ (hạt xen kẽ)
const STYLES=[null,
  {a:'#8fe8c0',b:'#e6fff3',c:'#ffe5a7'},{a:'#7fe3ff',b:'#dff8ff',c:'#a9f3e2'},{a:'#ffcf5c',b:'#fff3c4',c:'#ffe5a7'},
  {a:'#c39bff',b:'#f4eaff',c:'#ffd0f0'},{a:'#9fd8ff',b:'#ffffff',c:'#c8e6ff'},{a:'#8f7dff',b:'#e8e3ff',c:'#7fe3ff'},
  {a:'#ffc66b',b:'#fff6dc',c:'#ffe9a8'},{a:'#ffe08a',b:'#ffffff',c:'#ffb36b'},
  {a:'#7fb4ff',b:'#eef6ff',c:'#c9a6ff'},{a:'#ffd24a',b:'#fff8d8',c:'#ffe9a8'},{a:'#b48cff',b:'#f4ecff',c:'#8fd8ff'},{a:'#ff7a5a',b:'#fff0e0',c:'#ffd24a'},{a:'#fff0b0',b:'#ffffff',c:'#ff9ec7'}];
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hex=a=>Math.round(255*Math.max(0,Math.min(1,a))).toString(16).padStart(2,'0');
function glow(c,x,y,r,color,alpha=1){if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hex(alpha));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function bolt(c,x0,y0,x1,y1,seed,color,width){
  c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);
  const n=8;for(let i=1;i<=n;i++){const u=i/n,j=i===n?0:(rnd(seed*13+i)-.5)*46*(1-u*.5);c.lineTo(x0+(x1-x0)*u+j,y0+(y1-y0)*u);}c.stroke();
}
function petal(c,x,y,len,wid,rot,color){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=color;c.beginPath();c.ellipse(0,-len/2,wid,len/2,0,0,TAU);c.fill();c.restore();}
// Cột linh quang mềm: hai lớp gradient ngang (mờ dần ra mép), đỉnh tan vào không trung, chân phát sáng.
function pillar(c,x,base,h,w,s){
  if(h<=1)return;
  // 3 lớp đồng tâm, rộng → hẹp, mỗi lớp tan dần lên trên: viền ngoài mềm, lõi sáng.
  for(const [ww,col,alpha] of [[w*2.2,s.a,.16],[w*1.2,s.a,.32],[w*.45,s.b,.7]]){
    const v=c.createLinearGradient(0,base-h,0,base);v.addColorStop(0,col+'00');v.addColorStop(.45,col+hex(alpha*.6));v.addColorStop(1,col+hex(alpha));
    c.fillStyle=v;c.fillRect(x-ww/2,base-h,ww,h);}
  glow(c,x,base,w*2.4,s.a,.55);
}
function hueOf(hexColor){const n=parseInt(hexColor.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;if(!d)return 0;
  const h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return (h*60+360)%360;}

export function drawBreakthroughFx(c,e,t,k,p,H,{light=false,formation=null,art={},layer='back',viewScale=1,motion=true,title=true}={}){
  const r=breakthroughRealm(e),s=STYLES[r];
  if(r>=2){drawAscension(c,e,t,k,p,H,r,{light,art,layer,viewScale});if(layer==='front'&&title)drawBreakthroughTitle(c,e,k,p,H,viewScale,motion);return;}
  if(layer==='front'){if(title)drawBreakthroughTitle(c,e,k,p,H,viewScale,motion);return;}
  const fade=Math.max(0,Math.min(1,k/.15,(1-k)/.18)),grow=1-(1-Math.min(1,k/.35))**3,pulse=Math.sin(k*Math.PI);
  const x=p.x,feet=p.y,y=p.y-70,many=light?.5:1,spin=t*.00035;
  c.save();c.globalAlpha=fade;
  // 1. Màn tối (giống Trúc Cơ, đậm dần theo cảnh giới).
  c.fillStyle=`rgba(16,34,54,${(.3+r*.045).toFixed(2)})`;c.fillRect(0,0,900,H);
  // 2. Cột sáng chính.
  const bw=90+r*16,beam=c.createLinearGradient(x-bw,0,x+bw,0);
  beam.addColorStop(0,s.a+'00');beam.addColorStop(.5,s.a+hex(.42+r*.04));beam.addColorStop(1,s.a+'00');c.fillStyle=beam;c.fillRect(x-bw,0,bw*2,feet+50);
  // 3. Hào quang trên trời (từ Hóa Thần).
  if(r>=5){c.save();c.globalCompositeOperation='screen';glow(c,x,H*.1,(160+r*20)*grow,s.a,.45);c.strokeStyle=s.b+'90';c.lineWidth=2;
    for(let i=0;i<r-3;i++){c.beginPath();c.ellipse(x,H*.1,(110+i*34)*grow,(26+i*8)*grow,0,0,TAU);c.stroke();}c.restore();}
  // 4. Trận pháp dưới chân: 1 lớp → 2 lớp (Nguyên Anh) → 3 lớp (Đại Thừa), xoay ngược nhau.
  // Trận pháp đổi màu theo cảnh giới (ảnh gốc xanh ngọc ~170°) — mỗi cảnh giới một sắc riêng.
  if(formation){const layers=r>=7?3:r>=4?2:1,shift=Math.round(hueOf(s.a)-170);
    for(let j=0;j<layers;j++){c.save();c.globalAlpha*=.8-j*.15;c.translate(x,feet+65);c.scale(1,.42);c.rotate(spin*(j%2?-1.4:1)*(1+r*.08));
      if('filter' in c&&r!==2)c.filter=`hue-rotate(${shift}deg) saturate(1.25) brightness(${(1+r*.03).toFixed(2)})`;
      const R=(100+r*22+j*55)*(.6+.4*grow)+pulse*40;c.drawImage(formation,-R,-R,R*2,R*2);c.restore();}}
  c.globalCompositeOperation='screen';
  // 5. Vòng hào quang mềm quanh người (dải sáng mờ + viền sáng mảnh), nhiều vòng hơn theo cảnh giới.
  const R0=(100+pulse*80)*(.75+r*.06),rings=Math.min(5,1+Math.ceil(r/2));
  for(let i=0;i<rings;i++){const rx=(R0+i*26)*grow,ry=rx*.75,a=fade*(1-i*.14);
    c.globalAlpha=a*.22;c.strokeStyle=s.a;c.lineWidth=14;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();
    c.globalAlpha=a*.85;c.strokeStyle=s.c;c.lineWidth=1.5;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.stroke();}
  c.globalAlpha=fade;
  // 6. Cột linh quang mềm vòng quanh (Trúc Cơ: 4 cột) — 2 → 10 cột.
  const pillars=Math.min(10,2+2*Math.floor((r+1)/2));
  for(let i=0;i<pillars;i++){const a=i/pillars*TAU+.4,dx=Math.cos(a)*(120+r*12),depth=Math.sin(a),base=feet+42+depth*22;
    pillar(c,x+dx,base,(140+r*26+Math.abs(dx)*.4)*grow*(.75+.25*depth),16+r,s);}
  // 7. Đốm linh quang bay vòng — thêm quỹ đạo thứ hai từ Nguyên Anh.
  const orbits=r>=4?2:1;for(let o=0;o<orbits;o++){const n=Math.round((14+r*4)*many),rr=R0*(1+o*.45)*grow;
    for(let i=0;i<n;i++){const a=i*TAU/n+t*.0004*(o?-1.3:1);glow(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.75,6+(i%3),i%2?s.b:s.c,.85);}}
  // 8. Vòng linh khí bay lên dọc cột sáng (từ Kim Đan).
  if(r>=3)for(let i=0;i<r-1;i++){const u=(k*1.3+i/(r-1))%1,ry=feet+30-u*(feet+30-H*.08);c.strokeStyle=s.b+hex((1-u)*.8);c.lineWidth=2;c.beginPath();c.ellipse(x,ry,(60+r*6)*(1-u*.4),(14+r)*(1-u*.4),0,0,TAU);c.stroke();}
  // 9. Điểm nhấn riêng từng cảnh giới.
  switch(r){
    case 1:{for(let i=0;i<Math.round(26*many);i++){const u=(k*1.4+i/26)%1,a=u*TAU*2.2+i,rad=14+42*(1-u);glow(c,x+Math.cos(a)*rad,feet+10-u*170,5+3*(1-u),s.a,.7);}break;}
    case 3:{const oy=y-80,R=14+grow*12+Math.sin(t*.008)*2;
      for(let i=0;i<12;i++){const a=i*TAU/12+t*.0006,L=(60+30*pulse)*grow;c.strokeStyle=s.a+'80';c.lineWidth=2;c.beginPath();c.moveTo(x+Math.cos(a)*R*1.4,oy+Math.sin(a)*R*1.4);c.lineTo(x+Math.cos(a)*(R+L),oy+Math.sin(a)*(R+L));c.stroke();}
      glow(c,x,oy,R*3,s.a,.6);c.fillStyle='#fff6c8';c.beginPath();c.arc(x,oy,R,0,TAU);c.fill();break;}
    case 4:{for(let i=0;i<10;i++)petal(c,x,feet+30,62*grow,14,i*TAU/10+t*.0002,s.a+'60');
      const lift=Math.min(1,Math.max(0,(k-.15)/.5)),sy=y-10-lift*120,sc=.6+lift*.7;glow(c,x,sy,60*sc,s.a,.7);
      c.save();c.translate(x,sy);c.scale(sc,sc);c.fillStyle=s.b;c.beginPath();c.arc(0,-16,9,0,TAU);c.fill();c.beginPath();c.moveTo(-11,-6);c.quadraticCurveTo(0,-10,11,-6);c.lineTo(7,18);c.quadraticCurveTo(0,22,-7,18);c.closePath();c.fill();c.restore();break;}
    case 5:{const strike=Math.floor(k*7),ph=(k*7)%1;
      if(k<.8&&ph<.25){c.fillStyle=`rgba(220,235,255,${(.22*(1-ph/.25)).toFixed(2)})`;c.fillRect(0,0,900,H);bolt(c,x+(rnd(strike)-.5)*160,H*.1,x,y-30,strike,'#ffffff',3);bolt(c,x+(rnd(strike+5)-.5)*260,H*.1,x+(rnd(strike+2)-.5)*120,feet,strike+40,s.a,1.6);}break;}
    case 6:{for(let arm=0;arm<3;arm++)for(let i=0;i<Math.round(46*many);i++){const u=i/46,a=u*TAU*1.3+arm*TAU/3-t*.0014,R=(40+u*200)*grow;c.fillStyle=s.b+hex(.85-u*.6);c.beginPath();c.arc(x+Math.cos(a)*R,y-20+Math.sin(a)*R*.5,1+(1-u)*2,0,TAU);c.fill();}break;}
    case 7:{for(let i=0;i<12;i++){const a=i*TAU/12-t*.0012,rr=R0*1.25*grow;c.save();c.translate(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.6);c.rotate(a+Math.PI/2);c.fillStyle=i%2?s.b:s.a;c.beginPath();c.moveTo(-2,-22);c.lineTo(2,-22);c.lineTo(3,7);c.lineTo(0,16);c.lineTo(-3,7);c.closePath();c.fill();c.fillRect(-7,-14,14,2);c.restore();}break;}
    case 8:{const gy=H*.08;c.save();c.translate(x,gy);c.scale(grow*.9,grow*.9);c.strokeStyle=s.a;c.lineWidth=6;
      for(const side of [-1,1]){c.strokeRect(side*150-9,0,18,190);}c.beginPath();c.moveTo(-185,6);c.quadraticCurveTo(0,-80,185,6);c.moveTo(-168,22);c.lineTo(168,22);c.stroke();glow(c,0,100,160,s.b,.45);c.restore();
      const n=Math.round(30*many);for(let i=n;i>=0;i--){const u=i/n,a=u*TAU*2.5-t*.003,hy=feet-u*(feet-gy-40)*grow;c.fillStyle=i===0?'#fff4c8':s.c+hex(.85-u*.3);c.beginPath();c.arc(x+Math.cos(a)*(70+u*20),hy,i===0?14:10*(1-u*.5),0,TAU);c.fill();}break;}
  }
  // v52: cảnh giới sau Chân Tiên — chồng thêm lớp theo cấp.
  if(r>=9){ // Huyền Tiên: âm dương thái cực xoay lớn sau người
    const R=150*grow;c.save();c.translate(x,y-30);c.rotate(t*.0008);c.globalAlpha=fade*.55;
    c.fillStyle=s.b;c.beginPath();c.arc(0,0,R,Math.PI/2,Math.PI*1.5);c.arc(0,-R/2,R/2,Math.PI/2,Math.PI*1.5,true);c.arc(0,R/2,R/2,Math.PI*1.5,Math.PI/2);c.fill();
    c.strokeStyle=s.a;c.lineWidth=3;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();glow(c,0,-R/2,R*.18,s.a,.9);glow(c,0,R/2,R*.18,s.b,.9);c.restore();}
  if(r>=10){ // Kim Tiên: đài sen vàng dưới chân
    for(let ring=0;ring<2;ring++)for(let i=0;i<12;i++){c.save();c.translate(x,feet+30);c.scale(1,.38);c.rotate(i*TAU/12+ring*.26+t*.0002);const L=(70+ring*30)*grow;const g=c.createLinearGradient(0,0,0,-L);g.addColorStop(0,'#fff8d8');g.addColorStop(1,'#ffc24a');c.fillStyle=g;c.globalAlpha=fade*.8;c.beginPath();c.ellipse(0,-L/2,L*.22,L/2,0,0,TAU);c.fill();c.restore();}}
  if(r>=11){ // Thái Ất: cửu nhật vòng quay
    for(let i=0;i<9;i++){const q=i*TAU/9+t*.0009,R=(190+Math.sin(t*.002+i)*12)*grow;glow(c,x+Math.cos(q)*R,y-40+Math.sin(q)*R*.45,22,i%3?s.a:s.c,.9);glow(c,x+Math.cos(q)*R,y-40+Math.sin(q)*R*.45,8,'#ffffff',1);}}
  if(r>=12){ // Đại La: tam trùng pháp luân + kiếm vũ
    for(let j=0;j<3;j++){const R=(120+j*55)*grow;c.save();c.translate(x,y-40);c.rotate(t*.0005*(j%2?-1:1));c.strokeStyle=(j%2?s.c:s.a)+'c0';c.lineWidth=3;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();for(let i=0;i<12;i++){c.save();c.rotate(i*TAU/12);c.beginPath();c.moveTo(R-8,0);c.lineTo(R+8,0);c.stroke();c.restore();}c.restore();}
    for(let i=0;i<Math.round(28*many);i++){const u=(k*1.6+rnd(i+90))%1,xx=rnd(i+91)*900;c.save();c.translate(xx,u*H*.8);c.rotate(.2);c.fillStyle=i%2?s.b:s.a;c.globalAlpha=fade*(1-u*.4);c.fillRect(-1.5,-24,3,30);c.fillRect(-6,-14,12,2);c.restore();}}
  if(r>=13){ // Tiên Đế: thiên quang chín màu phủ màn hình
    for(let i=0;i<9;i++){const q=-Math.PI/2+(i-4)*.2+Math.sin(t*.0006+i)*.03,L=H*1.2;c.save();c.translate(x,y-40);c.rotate(q);const g=c.createLinearGradient(0,0,0,-L);g.addColorStop(0,`hsla(${i*40},95%,75%,.5)`);g.addColorStop(1,`hsla(${i*40},95%,75%,0)`);c.fillStyle=g;c.fillRect(-14,-L,28,L);c.restore();}
    glow(c,x,y-40,320*grow,'#fff6d8',.45);}
  // 10. Mưa sáng (từ Luyện Hư).
  if(r>=6)for(let i=0;i<Math.round((r-5)*22*many);i++){const u=(k*1.3+rnd(i))%1;c.fillStyle=i%3?s.b:s.a;c.fillRect(rnd(i+11)*900,u*H*.85,2,9);}
  glow(c,x,y,(70+r*12)*grow,s.b,.25+r*.03);
  c.restore();
}
