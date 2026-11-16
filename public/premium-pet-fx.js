// 17/11: VFX nhiều lớp cho 5 Thiên linh thú 300 coin (Cửu Vĩ, Thiên Long, Thiên Phượng, Ngọc Lân, Linh Hổ).
// Hai lớp: 'back' (sau lưng thú) và 'front'. Nền nhẹ luôn có; BÙNG 2,6 s mỗi 11 s, lệch nhịp theo người chơi
// (luật chống lag: không chạy dày liên tục). Không shadowBlur; mỗi khung tối đa vài gradient.
const TAU=Math.PI*2;
export const PREMIUM_FX_CYCLE=11000,PREMIUM_FX_BURST=2600;
/** Tiến độ bùng 0..1, hoặc -1 khi đang nghỉ. */
export function premiumBurst(t,seed=0){if(typeof globalThis.__premiumBurstPreview==='number')return globalThis.__premiumBurstPreview; // chỉ dùng cho ảnh xem thử
 const u=(((t+seed*37)%PREMIUM_FX_CYCLE)+PREMIUM_FX_CYCLE)%PREMIUM_FX_CYCLE;return u<PREMIUM_FX_BURST?u/PREMIUM_FX_BURST:-1;}
const env=k=>k<0?0:Math.max(0,Math.min(1,k*6,(1-k)*3.2));
const rnd=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
// Điểm cuối gradient = CÙNG màu với alpha 0 (về đen trong suốt sẽ thành vệt xám bẩn trên nền sáng).
const CLEAR=new Map();function clearOf(color){let v=CLEAR.get(color);if(v)return v;const m=/^#([0-9a-f]{6})$/i.exec(color);v=m?'rgba('+parseInt(m[1].slice(0,2),16)+','+parseInt(m[1].slice(2,4),16)+','+parseInt(m[1].slice(4),16)+',0)':color.replace(/,\s*[\d.]+\)$/,',0)');CLEAR.set(color,v);return v;}
function glow(c,x,y,r,color,a){if(a<=.01||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,clearOf(color));c.globalAlpha=Math.min(1,a);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function star4(c,x,y,s){c.beginPath();c.moveTo(x,y-s);c.quadraticCurveTo(x,y,x+s,y);c.quadraticCurveTo(x,y,x,y+s);c.quadraticCurveTo(x,y,x-s,y);c.quadraticCurveTo(x,y,x,y-s);c.fill();}
function flake(c,x,y,s,rot){c.save();c.translate(x,y);c.rotate(rot);c.beginPath();for(let i=0;i<3;i++){const a=i*Math.PI/3;c.moveTo(Math.cos(a)*s,Math.sin(a)*s);c.lineTo(-Math.cos(a)*s,-Math.sin(a)*s);}c.stroke();c.restore();}
function flame(c,x,y,w,h,lean=0){c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x-w*.9,y-h*.55,x+lean,y-h);c.quadraticCurveTo(x+w*.9,y-h*.5,x+w,y);c.quadraticCurveTo(x,y+w*.8,x-w,y);c.fill();}
// Hai nét chồng: nét rộng màu mờ + lõi trắng mảnh → có cảm giác phát sáng mà không cần shadowBlur.
function ribbon(c,pts,color,w,a){c.globalAlpha=a*.45;c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(pts[0],pts[1]);c.bezierCurveTo(pts[2],pts[3],pts[4],pts[5],pts[6],pts[7]);c.stroke();c.globalAlpha=a;c.strokeStyle='#ffffff';c.lineWidth=Math.max(1,w*.28);c.stroke();}

const FX={
 // Bạch Nguyệt Cửu Vĩ — băng: sương giá dưới chân; bùng: 9 đuôi sáng xòe + gai băng mọc vòng quanh + bông tuyết nổ.
 ice(c,s,t,seed,b,p,layer){const cx=s*.12,cy=-s*.12;
  if(layer==='back'){
   c.globalAlpha=.55;c.strokeStyle='#d8f6ff';c.lineWidth=1.4;c.beginPath();c.ellipse(0,s*.28,s*.46,s*.11,0,0,TAU);c.stroke();
   c.globalAlpha=.3;c.strokeStyle='#9ce9ff';c.lineWidth=4;c.beginPath();c.ellipse(0,s*.28,s*.38,s*.085,0,0,TAU);c.stroke();
   const e=env(b);if(e>0){glow(c,cx,cy,s*.75*e,'#bff3ff',.55*e);
    for(let i=0;i<9;i++){const a=-Math.PI*.95+i*Math.PI*.11+Math.sin(t*.004+i)*.06,L=s*(.55+.25*rnd(i,1))*(.4+.6*e);
     ribbon(c,[cx,cy,cx+Math.cos(a-.35)*L*.45,cy+Math.sin(a-.35)*L*.45,cx+Math.cos(a+.2)*L*.8,cy+Math.sin(a+.2)*L*.8,cx+Math.cos(a)*L,cy+Math.sin(a)*L],i%2?'#9ce9ff':'#e6fbff',5*p,.8*e);}}
   return;}
  c.strokeStyle='#ffffff';c.lineWidth=1.1;
  for(let i=0;i<6;i++){const u=(t*.00025+i/6+rnd(i,seed))%1,x=(rnd(i,3)-.5)*s*.9,y=s*.25-u*s*.8;c.globalAlpha=Math.sin(u*Math.PI)*.8;flake(c,x,y,2.2+2*p*(1-u),t*.001+i);}
  const e=env(b);if(e<=0)return;
  for(let i=0;i<9;i++){const a=i/9*TAU+.3,gx=Math.cos(a)*s*.44,gy=s*.28+Math.sin(a)*s*.1,h=s*(.16+.12*rnd(i,5))*Math.sin(Math.min(1,b*2.2)*Math.PI*.5)*e,w=s*.035;
   if(Math.sin(a)<-.2)continue; // gai phía sau bị thú che, bỏ cho nhẹ
   c.globalAlpha=.85*e;c.fillStyle='#bdf1ff';c.beginPath();c.moveTo(gx-w,gy);c.lineTo(gx+w*.3,gy-h);c.lineTo(gx+w,gy);c.closePath();c.fill();
   c.globalAlpha=e;c.strokeStyle='#ffffff';c.lineWidth=1;c.beginPath();c.moveTo(gx+w*.3,gy-h);c.lineTo(gx,gy);c.stroke();}
  c.strokeStyle='#e8fbff';c.lineWidth=1.3;
  for(let i=0;i<10;i++){const a=i/10*TAU+seed,r=s*(.2+b*.75);c.globalAlpha=(1-b)*.9;flake(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,3+2*p,a+t*.003);}
 },
 // Ngọc Châu Thiên Long — ngọc châu bay quanh; bùng: châu bừng sáng, 3 dải nước xoáy, sóng gợn, vảy ngọc lấp lánh.
 pearl(c,s,t,seed,b,p,layer){const e=env(b),a0=t*.0018+seed,px=Math.cos(a0)*s*.5,py=-s*.2+Math.sin(a0*1.3)*s*.18,front=Math.sin(a0)>0;
  const drawPearl=()=>{const r=s*(.07+.05*e);glow(c,px,py,r*(3.2+3*e),'#8effc3',.55+.35*e);c.globalAlpha=1;c.fillStyle='#e8fff4';c.beginPath();c.arc(px,py,r,0,TAU);c.fill();c.strokeStyle='#3fd99a';c.lineWidth=1.4;c.stroke();c.fillStyle='#ffffff';c.beginPath();c.arc(px-r*.35,py-r*.35,r*.3,0,TAU);c.fill();};
  if(layer==='back'){
   for(let j=0;j<2;j++){const w=t*.002+j*2.1;ribbon(c,[-s*.55,s*(.05+j*.1),-s*.2,s*(-.15+Math.sin(w)*.08),s*.2,s*(.2-Math.sin(w)*.08),s*.55,s*.02+j*s*.08],'#8effc3',4*p,.35);}
   if(e>0){glow(c,0,-s*.12,s*.85*e,'#a8ffd6',.45*e);
    for(let k=0;k<3;k++){const r=s*(.25+(b+k/3)%1*.6);c.globalAlpha=(1-(b+k/3)%1)*.7*e;c.strokeStyle='#c9ffe6';c.lineWidth=2;c.beginPath();c.ellipse(0,s*.1,r,r*.32,0,0,TAU);c.stroke();}}
   if(!front)drawPearl();return;}
  if(front)drawPearl();
  if(e<=0)return;
  for(let k=0;k<3;k++){const rot=t*.004+k*TAU/3,r=s*(.42+.06*k);c.globalAlpha=.75*e;c.strokeStyle=k%2?'#ffffff':'#6ff0b0';c.lineWidth=(k%2?1.5:3)*p;c.beginPath();c.ellipse(0,-s*.12,r,r*.45,-.25,rot,rot+Math.PI*.9*e);c.stroke();}
  c.fillStyle='#eafff5';for(let i=0;i<12;i++){const a=rnd(i,seed)*TAU,r=s*(.2+.5*rnd(i,9))*(.6+.4*b);c.globalAlpha=e*(.5+.5*Math.sin(t*.02+i));star4(c,Math.cos(a)*r,-s*.12+Math.sin(a)*r*.7,2+2.5*p*rnd(i,4));}
 },
 // Xích Hà Thiên Phượng — tàn lửa bay; bùng: đôi cánh lửa xòe lớn, vòng lửa, lông vũ lửa bay lên.
 flame(c,s,t,seed,b,p,layer){const e=env(b);
  if(layer==='back'){
   c.fillStyle='#ffb36b';for(let i=0;i<7;i++){const u=(t*.0006+i/7+rnd(i,seed))%1,x=(rnd(i,2)-.5)*s*.7+Math.sin(u*6+i)*s*.05,y=s*.15-u*s*.85;c.globalAlpha=(1-u)*.85;c.beginPath();c.arc(x,y,(1.5+2*p)*(1-u*.6),0,TAU);c.fill();}
   if(e>0){glow(c,0,-s*.15,s*.95*e,'#ff8a3d',.5*e);
    for(const side of [-1,1])for(let i=0;i<6;i++){const a=-Math.PI/2+side*(.35+i*.2)*(.3+.7*e),L=s*(.45+.09*(5-i))*(.35+.65*e),ox=side*s*.06,oy=-s*.15;
     c.save();c.translate(ox,oy);c.rotate(a+Math.PI/2);c.globalAlpha=.75*e;c.fillStyle=i%2?'#ff6a2a':'#ffb347';flame(c,0,0,s*.06,L,side*s*.05*Math.sin(t*.01+i));c.globalAlpha=.9*e;c.fillStyle='#fff1b8';flame(c,0,0,s*.022,L*.7,0);c.restore();}}
   return;}
  if(e<=0){for(let i=0;i<3;i++){const u=(t*.0009+i/3)%1;c.globalAlpha=(1-u)*.7;c.fillStyle=i%2?'#ff7a3a':'#ffd27a';flame(c,(rnd(i,seed)-.5)*s*.4,s*.2-u*s*.3,s*.03,s*.12*(1-u));}return;}
  c.globalAlpha=.8*e;c.strokeStyle='#ffcf6b';c.lineWidth=2.5*p;c.beginPath();c.ellipse(0,s*.27,s*(.3+b*.35),s*(.07+b*.08),0,0,TAU);c.stroke();
  for(let i=0;i<10;i++){const a=i/10*TAU,r=s*(.3+b*.35),x=Math.cos(a)*r,y=s*.27+Math.sin(a)*r*.25;if(Math.sin(a)<0)continue;c.globalAlpha=.85*e;c.fillStyle=i%2?'#ff5a1f':'#ffb347';flame(c,x,y,s*.04,s*(.12+.1*rnd(i,seed))*e,Math.sin(t*.012+i)*s*.03);}
  for(let i=0;i<5;i++){const u=(b*1.6+i/5)%1,x=(rnd(i,7)-.5)*s*.9,y=-s*.1-u*s*.7;c.save();c.translate(x,y);c.rotate((rnd(i,8)-.5)*.8);c.globalAlpha=(1-u)*e;c.fillStyle='#ff8a3d';c.beginPath();c.ellipse(0,0,s*.025,s*.08,0,0,TAU);c.fill();c.fillStyle='#fff1b8';c.fillRect(-.6,-s*.07,1.2,s*.14);c.restore();}
 },
 // Tử Nguyệt Ngọc Lân — trăng khuyết sau đầu; bùng: trăng tròn tỏa sáng, vòng phù văn xoay, cánh hoa tím xoáy.
 moon(c,s,t,seed,b,p,layer){const e=env(b),mx=s*.05,my=-s*.42;
  if(layer==='back'){
   if(e>0){glow(c,mx,my,s*(.5+.35*e),'#f4e1ff',.7*e);c.globalAlpha=.85*e;c.fillStyle='#fbf3ff';c.beginPath();c.arc(mx,my,s*.26*e,0,TAU);c.fill();c.globalAlpha=.9*e;c.strokeStyle='#c98cff';c.lineWidth=2;c.stroke();
    c.save();c.translate(0,s*.24);c.scale(1,.3);c.rotate(t*.0012);c.globalAlpha=.9*e;c.strokeStyle='#b77bff';c.lineWidth=3.6;c.beginPath();c.arc(0,0,s*.55,0,TAU);c.stroke();c.lineWidth=1.2;c.beginPath();c.arc(0,0,s*.47,0,TAU);c.stroke();
     c.fillStyle='#9a5cff';for(let i=0;i<12;i++){const a=i/12*TAU;c.save();c.rotate(a);c.fillRect(s*.49,-3,s*.05,6);c.restore();}c.restore();}
   const r=s*.2,ph=.55+.1*Math.sin(t*.002);c.globalAlpha=.75;c.fillStyle='#f3dcff';c.beginPath();c.arc(mx,my,r,0,TAU);c.arc(mx+r*ph,my-r*.25,r*.92,0,TAU,true);c.fill('evenodd');
   glow(c,mx,my,r*2.4,'#e2b1ff',.35);return;}
  c.fillStyle='#ecc8ff';for(let i=0;i<5;i++){const u=(t*.0004+i/5+rnd(i,seed))%1,a=i*1.3+u*3,x=Math.cos(a)*s*.4,y=s*.2-u*s*.6;c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=Math.sin(u*Math.PI)*.75;c.beginPath();c.ellipse(0,0,2+1.5*p,4.5+2*p,0,0,TAU);c.fill();c.restore();}
  if(e<=0)return;
  for(let i=0;i<14;i++){const u=(b+i/14)%1,a=i*.9+b*5,r=s*(.15+u*.6);c.save();c.translate(Math.cos(a)*r,-s*.1+Math.sin(a)*r*.6);c.rotate(a*2);c.globalAlpha=(1-u)*e;c.fillStyle=i%3?'#d39bff':'#ffffff';c.beginPath();c.ellipse(0,0,2.5+1.5*p,6+2*p,0,0,TAU);c.fill();c.restore();}
 },
 // Hắc Tinh Linh Hổ — tinh vân tối + sao nháy; bùng: chòm sao nối dần, sóng tinh quang, sao băng.
 stars(c,s,t,seed,b,p,layer){const e=env(b);
  const pts=[[-.45,-.35],[-.22,-.62],[.08,-.5],[.3,-.7],[.5,-.38],[.32,-.12],[-.05,-.2]];
  if(layer==='back'){
   glow(c,0,-s*.15,s*.75,'rgba(28,24,72,.9)',.38+.25*e);glow(c,s*.1,-s*.3,s*.45,'rgba(86,70,170,.9)',.25+.3*e);
   c.fillStyle='#e6efff';for(let i=0;i<6;i++){const tw=Math.sin(t*.004+i*1.9+seed)*.5+.5;c.globalAlpha=.35+.6*tw;star4(c,(rnd(i,seed)-.5)*s*1.1,-s*.1-rnd(i,6)*s*.55,(1.5+2.2*tw)*p);}
   if(e>0){const n=Math.min(pts.length,Math.ceil(b*2.4*pts.length));c.globalAlpha=.95*e;c.strokeStyle='#4a5cff';c.lineWidth=4;c.beginPath();for(let i=0;i<Math.min(pts.length,Math.ceil(b*2.4*pts.length));i++){const [x,y]=pts[i];i?c.lineTo(x*s,y*s):c.moveTo(x*s,y*s);}c.stroke();c.strokeStyle='#ffffff';c.lineWidth=1.6;c.beginPath();for(let i=0;i<n;i++){const [x,y]=pts[i];i?c.lineTo(x*s,y*s):c.moveTo(x*s,y*s);}c.stroke();
    c.fillStyle='#ffffff';for(let i=0;i<n;i++){const [x,y]=pts[i];glow(c,x*s,y*s,s*.13,'#7f9bff',.9*e);c.globalAlpha=e;c.fillStyle='#ffffff';star4(c,x*s,y*s,(4.5+2.5*p));}}
   return;}
  if(e<=0)return;
  const r=s*(.2+b*.8);c.globalAlpha=(1-b)*.85;c.strokeStyle='#d6e4ff';c.lineWidth=2*p;c.beginPath();c.ellipse(0,s*.05,r,r*.4,0,0,TAU);c.stroke();
  for(let i=0;i<3;i++){const u=(b*1.4+i*.33)%1,x0=s*(.7-rnd(i,seed)*.4),y0=-s*(.9-i*.12),x=x0-u*s*.9,y=y0+u*s*.55;c.globalAlpha=Math.sin(u*Math.PI)*e;c.strokeStyle='#e6efff';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+s*.22,y-s*.13);c.stroke();c.fillStyle='#ffffff';star4(c,x,y,3+p);}
 }
};
/** Vẽ một lớp hiệu ứng thú 300 coin. Gốc tọa độ = chỗ đứng thú (như drawPet). */
export function drawPremiumPetFx(c,pet,size,t,seed=0,power=1,layer='front',burst=null){ // burst: ép tiến độ bùng 0..1 (màn chiếu riêng)
 const fn=FX[pet?.fx];if(!fn)return;c.save();fn(c,size,t,seed,burst??premiumBurst(t,seed),power,layer);c.restore();
}
