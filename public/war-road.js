// 08/11/2026 tối — VẠN LÝ CHIẾN ĐẠO: bản đồ riêng của Chính Ma Đại Chiến.
// Đường ngang dài 2.000 trượng (trái: sơn môn Chính Đạo · phải: huyết điện Ma Đạo), máy quay bám điểm giao tranh,
// hai luồng khí phóng từ hai đầu đâm nhau thành quả cầu năng lượng; quà làm luồng khí phe đó phình to và đẩy lùi.
// Toàn bộ vẽ bằng canvas (không ảnh) để nhẹ và không lệ thuộc tài sản ngoài.
export const TRUONG_PER_POINT=20,ROAD_HALF=1000,PX_PER_TRUONG=1.6;
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const COL={chinh:{main:'#ffd36b',soft:'#fff3c8',core:'#fffbe8',deep:'#1d3a6b',glow:'#ffcf5a'},ma:{main:'#ff3b4e',soft:'#ffc2c8',core:'#fff0f2',deep:'#3a0710',glow:'#ff2440'}};
function glow(c,x,y,r,col,a){if(a<=0||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+Math.round(255*clamp(a)).toString(16).padStart(2,'0'));g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
// trượng (âm = phía Chính, dương = phía Ma) từ chiến tuyến 0..100 (100 = Chính thắng → điểm giao tranh nằm sát huyết điện Ma).
export const truongOf=line=>{const v=Number(line);return ((Number.isFinite(v)?v:50)-50)*TRUONG_PER_POINT;};
// Camera: giữ điểm giao tranh ở giữa màn, chỉ dừng lại khi tới gần sơn môn hai đầu.
export function warCamera(z){const half=450/PX_PER_TRUONG,lim=ROAD_HALF-half+70;return clamp(z,-lim,lim);}
export const screenX=(wz,cam,par=1)=>450+(wz-cam)*PX_PER_TRUONG*par;

// ---------- nền ----------
function ridge(c,cam,par,H,base,amp,col,seed,step=18){c.beginPath();c.moveTo(0,H);for(let x=0;x<=900+step;x+=step){const w=(x-450)/(PX_PER_TRUONG*par)+cam;const y=base-amp*(.55*Math.sin(w*.004+seed)+.3*Math.sin(w*.011+seed*2)+.15*Math.sin(w*.031+seed*3));c.lineTo(x,y);}c.lineTo(900,H);c.closePath();c.fillStyle=col;c.fill();}
function pagoda(c,x,y,s,side,t){const col=side==='chinh'?'#141a33':'#1d0a10',lamp=side==='chinh'?'#ffd36b':'#ff3b4e';c.fillStyle=col;
 for(let i=0;i<3;i++){const w=(70-i*16)*s,yy=y-i*34*s;c.fillRect(x-w*.35,yy-26*s,w*.7,26*s);c.beginPath();c.moveTo(x-w*.75,yy-24*s);c.quadraticCurveTo(x,yy-44*s,x+w*.75,yy-24*s);c.lineTo(x+w*.55,yy-30*s);c.quadraticCurveTo(x,yy-40*s,x-w*.55,yy-30*s);c.closePath();c.fill();
  c.fillStyle=lamp;c.globalAlpha=.55+.35*Math.sin(t*.003+x);c.fillRect(x-4*s,yy-18*s,8*s,9*s);c.globalAlpha=1;c.fillStyle=col;}
 c.fillRect(x-2*s,y-118*s,4*s,20*s);}
function gate(c,x,roadTop,H,side){const ma=side==='ma',col=COL[side],h=H*.34,w=230;c.save();
 c.fillStyle=ma?'#2a0810':'#13224a';c.fillRect(x-w/2,roadTop-h,26,h+30);c.fillRect(x+w/2-26,roadTop-h,26,h+30);
 c.fillRect(x-w/2-30,roadTop-h-26,w+60,28);c.beginPath();c.moveTo(x-w/2-60,roadTop-h-20);c.quadraticCurveTo(x,roadTop-h-(ma?90:70),x+w/2+60,roadTop-h-20);c.lineTo(x+w/2+40,roadTop-h-34);c.quadraticCurveTo(x,roadTop-h-(ma?70:56),x-w/2-40,roadTop-h-34);c.closePath();c.fill();
 if(ma){for(const d of [-1,1]){c.beginPath();c.moveTo(x+d*(w/2+50),roadTop-h-24);c.quadraticCurveTo(x+d*(w/2+86),roadTop-h-70,x+d*(w/2+70),roadTop-h-104);c.lineTo(x+d*(w/2+58),roadTop-h-40);c.closePath();c.fill();}}
 c.fillStyle=col.deep;c.fillRect(x-80,roadTop-h+6,160,40);c.strokeStyle=col.main;c.lineWidth=3;c.strokeRect(x-80,roadTop-h+6,160,40);
 c.font='900 19px Segoe UI';c.textAlign='center';c.textBaseline='middle';c.fillStyle=col.main;c.fillText(ma?'HUYẾT ĐIỆN':'SƠN MÔN',x,roadTop-h+26);
 glow(c,x,roadTop-h*.45,170,col.glow,.28);c.restore();}
function stele(c,x,roadTop,wz){const n=Math.abs(Math.round(wz));const side=wz<0?'chinh':wz>0?'ma':null;c.save();
 c.fillStyle='#3a3648';c.fillRect(x-11,roadTop-52,22,52);c.fillStyle='#4c4760';c.beginPath();c.moveTo(x-15,roadTop-52);c.lineTo(x,roadTop-64);c.lineTo(x+15,roadTop-52);c.closePath();c.fill();
 c.font='800 13px Segoe UI';c.textAlign='center';c.textBaseline='middle';c.fillStyle=side?COL[side].soft:'#ffffff';c.fillText(side?String(n):'0',x,roadTop-30);
 if(!side){c.font='900 12px Segoe UI';c.fillStyle='#fff3c8';c.fillText('TRUNG TUYẾN',x,roadTop-74);}c.restore();}

// Vẽ toàn bộ nền bản đồ (đè hẳn lên sân thường). light = máy yếu: bớt lớp.
export function drawWarRoad(c,{H,cam,lx,t,light=false,motion=true}){
 const roadTop=H*.56,roadBot=H*.9;
 // trời: nửa trái bình minh vàng lam, nửa phải huyết dạ — ranh giới chạy theo điểm giao tranh
 const sky=c.createLinearGradient(0,0,0,roadTop);sky.addColorStop(0,'#0a0f24');sky.addColorStop(1,'#2a2445');c.fillStyle=sky;c.fillRect(0,0,900,H);
 const tl=c.createLinearGradient(0,0,lx,0);tl.addColorStop(0,'#2b4f9acc');tl.addColorStop(1,'#ffd36b22');c.fillStyle=tl;c.fillRect(0,0,Math.max(0,lx),roadTop);
 const tr=c.createLinearGradient(lx,0,900,0);tr.addColorStop(0,'#ff3b4e22');tr.addColorStop(1,'#5a0714cc');c.fillStyle=tr;c.fillRect(lx,0,Math.max(0,900-lx),roadTop);
 glow(c,150,H*.13,260,'#ffd36b',.5);c.fillStyle='#fff3c8';c.beginPath();c.arc(150,H*.13,38,0,TAU);c.fill();
 glow(c,760,H*.12,240,'#ff2030',.5);c.fillStyle='#ff4a58';c.beginPath();c.arc(760,H*.12,34,0,TAU);c.fill();c.fillStyle='#2a0a14';c.beginPath();c.arc(772,H*.11,30,0,TAU);c.fill();
 // núi xa / núi gần (thị sai)
 ridge(c,cam,.18,H,roadTop-H*.12,H*.1,'#161a36',1.3,24);
 if(!light)ridge(c,cam,.35,H,roadTop-H*.05,H*.08,'#1d1c38',4.1,20);
 // lầu các hai phe, mỗi 260 trượng (thị sai .6)
 for(let k=-5;k<=5;k++){const wz=k*260+130;const x=screenX(wz,cam,.6);if(x<-120||x>1020)continue;pagoda(c,x,roadTop-6,.9+(k%2)*.2,wz<0?'chinh':'ma',t);}
 // sương chân núi
 const mist=c.createLinearGradient(0,roadTop-70,0,roadTop+10);mist.addColorStop(0,'#c8d0ff00');mist.addColorStop(1,'#c8d0ff30');c.fillStyle=mist;c.fillRect(0,roadTop-70,900,80);
 // mặt đường đá lát, chạy theo camera (thị sai 1)
 const road=c.createLinearGradient(0,roadTop,0,roadBot);road.addColorStop(0,'#4a4458');road.addColorStop(.5,'#2e2a3a');road.addColorStop(1,'#1a1824');c.fillStyle=road;c.fillRect(0,roadTop,900,H-roadTop);
 c.fillStyle='#6a6280';c.fillRect(0,roadTop-4,900,6);
 c.strokeStyle='#ffffff12';c.lineWidth=2;const step=40;const first=Math.floor((cam-450/PX_PER_TRUONG)/step)*step;
 for(let wz=first;wz<=cam+450/PX_PER_TRUONG+step;wz+=step){const xb=screenX(wz,cam),xt=450+(xb-450)*.82;c.beginPath();c.moveTo(xt,roadTop);c.lineTo(xb,roadBot);c.stroke();}
 for(const f of [.33,.62])c.fillRect(0,roadTop+(roadBot-roadTop)*f,900,1);
 // vệt sáng giữa đường: phía Chính vàng, phía Ma đỏ
 const mid=roadTop+(roadBot-roadTop)*.47;for(let wz=first;wz<=cam+450/PX_PER_TRUONG+step;wz+=step){const x=screenX(wz,cam);c.fillStyle=wz<0?'#ffd36b55':'#ff3b4e55';c.fillRect(x+6,mid-2,22,4);}
 // vết cháy sau lưng điểm giao tranh (đường đã bị đẩy qua)
 const sc=c.createLinearGradient(lx-140,0,lx+140,0);sc.addColorStop(0,'#00000000');sc.addColorStop(.5,'#ffffff18');sc.addColorStop(1,'#00000000');c.fillStyle=sc;c.fillRect(lx-140,roadTop,280,roadBot-roadTop);
 // cột mốc mỗi 100 trượng + sơn môn hai đầu
 for(let wz=Math.ceil((cam-500)/100)*100;wz<=cam+500;wz+=100){if(Math.abs(wz)>=ROAD_HALF)continue;const x=screenX(wz,cam);if(x>-30&&x<930)stele(c,x,roadTop,wz);}
 for(const [wz,side] of [[-ROAD_HALF,'chinh'],[ROAD_HALF,'ma']]){const x=screenX(wz,cam);if(x>-260&&x<1160)gate(c,x,roadTop,H,side);}
 // tàn lửa bay
 if(motion){c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?14:30);i++){const u=(t*.00008*(1+rnd(i))+rnd(i+7))%1,x=(rnd(i+3)*900+t*.02*(rnd(i)>.5?1:-1))%900,y=roadBot-u*(roadBot-H*.15);c.globalAlpha=Math.sin(u*Math.PI)*.8;c.fillStyle=x<lx?'#ffd98a':'#ff6a75';c.fillRect((x+900)%900,y,3,3);}c.restore();}
 return {roadTop,roadBot};
}

// ---------- hai luồng khí + quả cầu va chạm ----------
// surge.{chinh,ma} 0..2: độ phình khi vừa tặng quà / thả tim; push −1..1: hướng đang bị đẩy.
export function drawBeams(c,{H,lx,cam,t,surge,push=0,light=false,motion=true}){
 const y=H*.42,gl=Math.max(0,screenX(-ROAD_HALF,cam)+60),gr=Math.min(900,screenX(ROAD_HALF,cam)-60);
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';
 for(const side of ['chinh','ma']){const col=COL[side],s=surge[side]||0,x0=side==='chinh'?gl:gr,dir=side==='chinh'?1:-1,len=Math.abs(lx-x0);if(len<4)continue;
  const w=30+s*70+(motion?Math.sin(t*.02+(dir>0?0:1.7))*5:0),wob=k=>motion?Math.sin(k*.02-t*.012*dir)*(6+s*10):0;
  // thân luồng khí: 3 lớp (quầng → thân → lõi trắng), mép gợn sóng
  for(const [mul,colr,a] of [[2.6,col.glow,.25],[1.4,col.main,.75],[.45,col.core,.95]]){c.beginPath();const n=24;for(let i=0;i<=n;i++){const x=x0+(lx-x0)*i/n;c.lineTo(x,y-w*mul/2+wob(x));}for(let i=n;i>=0;i--){const x=x0+(lx-x0)*i/n;c.lineTo(x,y+w*mul/2+wob(x+50));}c.closePath();c.globalAlpha=a;c.fillStyle=colr;c.fill();}
  // vệt chảy về phía điểm giao tranh
  if(motion){c.globalAlpha=.8;c.strokeStyle=col.core;for(let i=0;i<(light?5:10);i++){const u=((t*.0016*(1+s*.6))+i/10)%1,x=x0+(lx-x0)*u,yy=y+(rnd(i)-.5)*w*.9;c.lineWidth=2+s*2;c.beginPath();c.moveTo(x,yy);c.lineTo(x-dir*(30+s*40),yy);c.stroke();}}
  glow(c,x0,y,90+s*80,col.glow,.7);}
 // quả cầu va chạm
 const sum=(surge.chinh||0)+(surge.ma||0),R=105+sum*45+(motion?Math.sin(t*.025)*10:0);
 glow(c,lx,y,R*3.4,'#ffffff',.28+sum*.12);
 // quả cầu lửa cuộn: nửa trái vàng, nửa phải đỏ, các khối khí xoáy quanh tâm
 for(let i=0;i<(light?8:16);i++){const a=i/(light?8:16)*TAU+(motion?t*.0016*(i%2?1:-1.3):0),r=R*(.35+.3*rnd(i)),side=Math.cos(a)<0?'chinh':'ma';glow(c,lx+Math.cos(a)*r,y+Math.sin(a)*r*.85,R*(.55+.25*rnd(i+5)),COL[side].main,.65);}
 glow(c,lx-R*.3,y,R*1.25,COL.chinh.glow,.8);glow(c,lx+R*.3,y,R*1.25,COL.ma.glow,.8);glow(c,lx,y,R*.75,'#ffffff',1);
 // vòng xung kích dội ra theo nhịp (nhanh hơn khi đang có quà)
 if(motion)for(let r=0;r<2;r++){const u=((t*(.0011+sum*.0006))+r*.5)%1;c.globalAlpha=(1-u)*.7;c.strokeStyle=r?COL.ma.soft:COL.chinh.soft;c.lineWidth=6*(1-u)+1;c.beginPath();c.ellipse(lx,y,R*(.8+u*2.2),R*(.8+u*2.2)*.7,0,0,TAU);c.stroke();}
 c.globalAlpha=1;
 if(motion){c.globalAlpha=.9;for(let i=0;i<(light?6:12);i++){const a=rnd(i+Math.floor(t/70))*TAU,r1=R*.4,r2=R*(1.3+rnd(i*3)*.9);c.strokeStyle=i%2?COL.chinh.soft:COL.ma.soft;c.lineWidth=2.5;c.beginPath();c.moveTo(lx+Math.cos(a)*r1,y+Math.sin(a)*r1);c.lineTo(lx+Math.cos(a)*(r1+r2)/2+(rnd(i)-.5)*20,y+Math.sin(a)*(r1+r2)/2);c.lineTo(lx+Math.cos(a)*r2,y+Math.sin(a)*r2);c.stroke();}
  // tia tóe lên/xuống, lệch về phía đang bị đẩy
  for(let i=0;i<(light?16:36);i++){const u=(t*.0022+i/36)%1,a=(rnd(i)-.5)*2.4+(i%2?-Math.PI/2:Math.PI/2),sp=R*(.6+u*3);c.globalAlpha=1-u;c.fillStyle=i%3?'#fff3c8':'#ffc2c8';c.fillRect(lx+Math.cos(a)*sp*.5-push*u*120,y+Math.sin(a)*sp,4,4);}}
 c.restore();return {y,R};
}

// Sóng thần năng lượng khi quà lớn: tràn nửa màn hình từ phía phe tặng về điểm giao tranh (giống ảnh tham khảo: lửa/nước tràn).
export function drawTide(c,{H,lx,side,k,power,t,light=false}){
 const col=COL[side],dir=side==='chinh'?1:-1,x0=side==='chinh'?0:900,front=x0+(lx-x0)*Math.min(1,k*2.2),a=Math.sin(Math.min(1,k)*Math.PI)*(.55+power*.4);
 if(a<=0)return;c.save();c.globalCompositeOperation='screen';
 const g=c.createLinearGradient(x0,0,front,0);g.addColorStop(0,col.deep+'00');g.addColorStop(.6,col.main+'99');g.addColorStop(1,col.core+'ee');c.globalAlpha=a;c.fillStyle=g;
 const top=H*(.18-power*.06),bot=H*(.78+power*.06);c.beginPath();c.moveTo(x0,top);
 for(let i=0;i<=16;i++){const u=i/16,x=x0+(front-x0)*u;c.lineTo(x,top+Math.sin(u*9+t*.01)*18*(1-u)+(1-Math.sin(u*Math.PI))*20);}
 c.lineTo(front+dir*40,H*.42);for(let i=16;i>=0;i--){const u=i/16,x=x0+(front-x0)*u;c.lineTo(x,bot+Math.sin(u*7-t*.012)*22*(1-u));}c.closePath();c.fill();
 for(let i=0;i<(light?10:24);i++){const u=rnd(i+3),x=x0+(front-x0)*u,yy=H*(.22+rnd(i)*.5);glow(c,x,yy,(40+power*60)*(.4+u),col.main,.5*a);}
 glow(c,front,H*.42,180+power*160,col.core,.8*a);c.restore();}
