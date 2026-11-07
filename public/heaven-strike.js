// 07/11/2026: THIÊN ĐẠO GIÁNG LÔI — hiệu ứng toàn cảnh khi người điều hành đánh sét xuống một người.
// Nhịp: lôi vân tụ (nguyên nhân) → lôi ấn khóa mục tiêu + tia dẫn (chuyển hóa) → 1–3 đạo thiên lôi (cao trào) → dư điện, khói, chữ (hậu chấn).
// Mỗi lần đánh có seed riêng: màu lôi, số đạo sét, hình nhánh, chiều xoáy mây, vị trí mắt bão, tiêu đề, cao độ âm — không lần nào lặp y hệt.
// Vẽ hoàn toàn bằng Canvas 2D (không ảnh ngoài) để chạy được cả trên trình duyệt lẫn @napi-rs/canvas khi xuất ảnh kiểm tra.

export const HEAVEN_STRIKE_MS=7600;
export const STRIKE_AT=2.6; // giây: đạo lôi đầu tiên chạm đất

const PALETTES=[
 {id:'tu-loi',core:'#ffffff',glow:'#d9c2ff',hue:'#8b4dff',deep:'#3b1a8c',sky:'#0b0620',cloud:'#2c2050',rim:'#b58cff'},
 {id:'thanh-loi',core:'#ffffff',glow:'#c4ecff',hue:'#3d8bff',deep:'#123a8a',sky:'#040c1e',cloud:'#1b2f52',rim:'#86d4ff'},
 {id:'xich-kim',core:'#fffbea',glow:'#ffe2a0',hue:'#ff6a2a',deep:'#8a1c0c',sky:'#140504',cloud:'#3c1d18',rim:'#ffbf6e'},
 {id:'bich-loi',core:'#ffffff',glow:'#c8ffe8',hue:'#21d39a',deep:'#0b5a44',sky:'#03120d',cloud:'#143a30',rim:'#86ffd0'}
];
const TITLES=['THIÊN KIẾP GIÁNG LÂM','CỬU THIÊN LÔI PHẠT','THIÊN ĐẠO GIÁNG LÔI','LÔI KIẾP TRẤN ÁP','THIÊN UY GIÁNG THẾ'];

function rng(seed){let a=(Number(seed)>>>0)||0x9e3779b9;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=k=>k<=0?0:k>=1?1:1-Math.pow(1-k,3);
const smooth=(a,b,v)=>{const k=clamp((v-a)/(b-a));return k*k*(3-2*k);};

// Đường sét chuẩn hóa: u (0→1 dọc trục) + off (px vuông góc). Ánh xạ khi vẽ → bám theo mục tiêu dù camera đổi.
function boltPath(r,depth=7,rough=.32){let pts=[{u:0,off:0},{u:1,off:0}];let amp=rough;
 for(let d=0;d<depth;d++){const next=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];next.push({u:(a.u+b.u)/2+(r()-.5)*.02/(d+1),off:(a.off+b.off)/2+(r()-.5)*amp*900*(b.u-a.u)},b);}pts=next;amp*=.62;}
 return pts;}
function branchSet(r,n){const out=[];for(let i=0;i<n;i++){const at=.12+r()*.7,len=.12+r()*.3,dir=(r()<.5?-1:1)*(.35+r()*.9);out.push({at,len,dir,path:boltPath(r,5,.4),w:.35+r()*.35});}return out;}

export function strikeProfile(seed=1){const r=rng(seed);
 const palette=PALETTES[Math.floor(r()*PALETTES.length)],count=1+Math.floor(r()*3),title=TITLES[Math.floor(r()*TITLES.length)];
 const bolts=[];let at=0;for(let i=0;i<count;i++){bolts.push({at:STRIKE_AT+at,path:boltPath(r),branches:branchSet(r,4+Math.floor(r()*4)),startDx:(r()-.5)*240,life:.42+r()*.16,main:i===0});at+=.16+r()*.22;}
 const leaders=[0,1,2].map(()=>({path:boltPath(r,6,.36),dx:(r()-.5)*320,at:1.85+r()*.45}));
 const sparks=Array.from({length:90},()=>({a:-Math.PI*(.05+r()*.9),v:180+r()*520,s:1+r()*2.6,life:.5+r()*1.1,warm:r()<.35}));
 const clouds=Array.from({length:34},(_,i)=>({r:30+Math.pow(r(),.7)*430,a:r()*Math.PI*2,size:55+r()*120,shade:r(),wob:r()*6.28}));
 return {seed,palette,title,bolts,leaders,sparks,clouds,spin:r()<.5?1:-1,eyeDx:(r()-.5)*120,pitch:.88+r()*.24,runeTurns:r()<.5?1:-1,ringRunes:6+Math.floor(r()*5)};}

function pathPoints(path,x0,y0,x1,y1){const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,s=len/900;return path.map(p=>[x0+dx*p.u+nx*p.off*s,y0+dy*p.u+ny*p.off*s]);}
function stroke(c,pts,upto=1){const n=Math.max(2,Math.ceil(pts.length*upto));c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<n;i++)c.lineTo(pts[i][0],pts[i][1]);c.stroke();}
function glowStroke(c,pts,pal,w,alpha,upto=1){
 c.globalAlpha=alpha*.22;c.strokeStyle=pal.hue;c.lineWidth=w*7;stroke(c,pts,upto);
 c.globalAlpha=alpha*.5;c.strokeStyle=pal.glow;c.lineWidth=w*2.8;stroke(c,pts,upto);
 c.globalAlpha=alpha;c.strokeStyle=pal.core;c.lineWidth=w;stroke(c,pts,upto);}
function drawBolt(c,b,pal,x0,y0,x1,y1,alpha,w){const pts=pathPoints(b.path,x0,y0,x1,y1);glowStroke(c,pts,pal,w,alpha);
 for(const br of b.branches){const i=Math.floor(br.at*(pts.length-1)),[bx,by]=pts[i],len=Math.hypot(x1-x0,y1-y0)*br.len,ang=Math.atan2(y1-y0,x1-x0)+br.dir*.6;glowStroke(c,pathPoints(br.path,bx,by,bx+Math.cos(ang)*len,by+Math.sin(ang)*len),pal,w*br.w,alpha*.8);}}

// t: giây kể từ lúc bắt đầu. view: {W,H,x,y,scale} — x,y là chân nhân vật trong toạ độ màn hình (900 × H).
export function drawHeavenStrike(c,profile,t,view,{light=false,name='',loss=0}={}){
 const {W=900,H,x,y}=view,S=view.scale||1.4,scale=Math.min(S,2.1),pal=profile.palette,end=HEAVEN_STRIKE_MS/1000;if(t<0||t>end)return;
 const head=y-Math.min(64*S,H*.3),body=y-Math.min(34*S,H*.16),eyeX=clamp(x+profile.eyeDx,140,W-140),eyeY=H*.055,hitTimes=profile.bolts.map(b=>b.at);
 const sinceHit=Math.min(...hitTimes.map(h=>t>=h?t-h:99)),fade=1-smooth(end-1.1,end,t);
 c.save();
 // 1) Trời tối sầm — nền lạnh, sáng dần ở mắt bão.
 const dark=(smooth(0,1.3,t)*.8-smooth(STRIKE_AT+2.4,end,t)*.5)*fade;
 if(dark>0){c.globalAlpha=dark;const g=c.createRadialGradient(eyeX,eyeY,20,eyeX,H*.4,H*1.05);g.addColorStop(0,pal.deep);g.addColorStop(.35,pal.sky);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(0,0,W,H);}
 // 2) Lôi vân xoáy.
 const cloudIn=smooth(0,1.2,t)*fade,charge=smooth(1.4,STRIKE_AT,t)*(1-smooth(STRIKE_AT+.3,STRIKE_AT+2.5,t)*.6);
 if(cloudIn>0){c.globalCompositeOperation='source-over';
  // dải mây giông phủ 1/3 trên màn hình
  const bank=c.createLinearGradient(0,0,0,H*.42);bank.addColorStop(0,'#05040a');bank.addColorStop(.55,pal.cloud);bank.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=cloudIn*.92;c.fillStyle=bank;c.fillRect(0,-40*(1-cloudIn),W,H*.42);
  const lit=Math.max(charge*.5,rng(profile.seed*13+Math.floor(t*11))()<.2+charge*.4?.7:0);
  for(const cl of profile.clouds){if(light&&cl.shade>.6)continue;const ang=cl.a+profile.spin*t*(.5-cl.r/1500),rr=cl.r*(.75+.25*cloudIn)*1.35,cx=eyeX+Math.cos(ang)*rr,cy=eyeY+40+Math.sin(ang)*rr*.3-60*(1-cloudIn)+Math.sin(t*1.3+cl.wob)*4,sz=cl.size*1.35;
   const g=c.createRadialGradient(cx,cy-sz*.2,0,cx,cy,sz);g.addColorStop(0,'#0b0a12');g.addColorStop(.6,pal.cloud);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=cloudIn*(.38+cl.shade*.3);c.fillStyle=g;c.beginPath();c.ellipse(cx,cy,sz*1.5,sz*.42,0,0,Math.PI*2);c.fill();
   if(lit>0&&cl.shade>.35){c.globalCompositeOperation='lighter';c.globalAlpha=cloudIn*lit*.16*(1-cl.r/600);c.fillStyle=pal.rim;c.beginPath();c.ellipse(cx,cy+sz*.22,sz*.8,sz*.2,0,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';}}
  // mắt bão phát sáng theo nhịp tụ lực
  c.globalCompositeOperation='lighter';const pulse=.5+.5*Math.sin(t*(6+charge*14));const eg=c.createRadialGradient(eyeX,eyeY,0,eyeX,eyeY,120+charge*90);eg.addColorStop(0,pal.glow);eg.addColorStop(.4,pal.hue);eg.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=cloudIn*(.18+charge*.5*pulse);c.fillStyle=eg;c.beginPath();c.ellipse(eyeX,eyeY,220+charge*90,90+charge*40,0,0,Math.PI*2);c.fill();
  // chớp trong mây (đổi mỗi 90 ms)
  const bucket=Math.floor(t*11),fr=rng(profile.seed*31+bucket);if(fr()<.25+charge*.6){c.lineCap='round';const a=fr()*6.28,rr=60+fr()*300,sx=eyeX+Math.cos(a)*rr,sy=eyeY+Math.sin(a)*rr*.3,ex=sx+(fr()-.5)*260,ey=sy+fr()*60;glowStroke(c,pathPoints(boltPath(fr,5,.4),sx,sy,ex,ey),pal,1.2,cloudIn*.8);}}
 c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';
 // 2b) Mưa giông xiên.
 const rain=smooth(.6,1.8,t)*fade*(light?.5:1);if(rain>0){c.globalCompositeOperation='source-over';c.strokeStyle=pal.glow;c.lineWidth=1.1;const rr=rng(profile.seed+5);c.beginPath();for(let i=0;i<(light?60:130);i++){const px=(rr()*W*1.3+t*-260*profile.spin)%(W*1.3),py=(rr()*H+t*(900+rr()*500))%H,sx=((px%(W*1.3))+W*1.3)%(W*1.3)-W*.15;c.moveTo(sx,py);c.lineTo(sx-8*profile.spin,py+26);}c.globalAlpha=rain*.22;c.stroke();c.globalCompositeOperation='lighter';}
 // 3) Lôi ấn khóa mục tiêu dưới chân.
 const rune=smooth(1.1,1.9,t)*(1-smooth(STRIKE_AT+.25,STRIKE_AT+1.2,t));
 if(rune>0){const R=(34+56*ease(smooth(1.1,2.3,t)))*scale,spin=profile.runeTurns*t*1.6;c.save();c.translate(x,y);c.scale(1,.34);c.strokeStyle=pal.rim;c.globalAlpha=rune*.9;c.lineWidth=3;c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.stroke();c.globalAlpha=rune*.55;c.lineWidth=1.6;c.beginPath();c.arc(0,0,R*.78,0,Math.PI*2);c.stroke();
  c.rotate(spin);const n=profile.ringRunes;c.lineWidth=2.2;c.globalAlpha=rune;c.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2*2;const px=Math.cos(a)*R*.78,py=Math.sin(a)*R*.78;i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2;c.save();c.rotate(a);c.fillStyle=pal.glow;c.globalAlpha=rune*.9;c.fillRect(R*.86,-3,R*.1,6);c.restore();}c.restore();
  // cột sáng mảnh nối mắt bão → mục tiêu (khóa mục tiêu)
  const beam=smooth(1.6,STRIKE_AT-.1,t)*(1-smooth(STRIKE_AT-.05,STRIKE_AT+.1,t));if(beam>0){const bg=c.createLinearGradient(0,eyeY,0,y);bg.addColorStop(0,pal.glow);bg.addColorStop(1,pal.hue);c.fillStyle=bg;c.globalAlpha=beam*(.12+.12*Math.sin(t*47));const bw=(9-6*beam)*scale*.5;c.beginPath();c.moveTo(eyeX-bw*2,eyeY);c.lineTo(eyeX+bw*2,eyeY);c.lineTo(x+bw,head);c.lineTo(x-bw,head);c.closePath();c.fill();}}
 // 4) Tia dẫn bò xuống từ mây.
 for(const ld of profile.leaders){const k=smooth(ld.at,STRIKE_AT,t);if(k<=0||t>STRIKE_AT)continue;glowStroke(c,pathPoints(ld.path,eyeX+ld.dx*.3,eyeY+10,x+ld.dx*.25,head),pal,1.4,.7*(.6+.4*Math.sin(t*60+ld.dx)),k*.85);}
 // 5) Thiên lôi.
 for(const b of profile.bolts){const age=t-b.at;if(age<0||age>b.life)continue;const flick=(.65+.35*rng(profile.seed+Math.floor(t*28))())*Math.pow(1-age/b.life,1.3);drawBolt(c,b,pal,eyeX+b.startDx,eyeY-30,x,head,flick,(b.main?9:6)*(light?.8:1));
  // dòng điện quấn quanh thân khi lôi đang chạm
  const ir=rng(profile.seed+7+Math.floor(t*30));for(let i=0;i<4;i++){const a=ir()*6.28,len=(30+ir()*40)*scale*.6;glowStroke(c,pathPoints(boltPath(ir,4,.5),x,body,x+Math.cos(a)*len,body+Math.sin(a)*len*.8),pal,1.6,flick*.9);}}
 // 6) Bùng sáng tại điểm chạm + sóng xung kích + tia lửa.
 if(sinceHit<3.5){const k=sinceHit;
  const burst=Math.pow(clamp(1-k/.7),2.4);if(burst>0){const R=(180+200*(1-burst))*(scale/1.4);const g=c.createRadialGradient(x,body,0,x,body,R);g.addColorStop(0,pal.core);g.addColorStop(.18,pal.glow);g.addColorStop(.5,pal.hue);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=burst*.95;c.fillStyle=g;c.beginPath();c.arc(x,body,R,0,Math.PI*2);c.fill();}
  for(let i=0;i<2;i++){const kk=k-i*.14;if(kk<0||kk>1.4)continue;const e=ease(kk/1.4),R=(40+420*e)*(scale/1.4);c.save();c.translate(x,y);c.scale(1,.3);c.globalAlpha=(1-e)*.85;c.strokeStyle=i?pal.glow:pal.core;c.lineWidth=(10-6*e)*(i?.6:1);c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.stroke();c.restore();}
  // vết cháy trên nền
  const scorch=clamp(1-k/3.5);const sg=c.createRadialGradient(x,y,0,x,y,90*scale*.8);sg.addColorStop(0,pal.glow);sg.addColorStop(.5,pal.hue);sg.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=scorch*.5;c.fillStyle=sg;c.beginPath();c.ellipse(x,y,95*scale*.8,26*scale*.8,0,0,Math.PI*2);c.fill();
  if(!light||k<1.2){const g=600;for(const s of profile.sparks){if(k>s.life)continue;const px=x+Math.cos(s.a)*s.v*k,py=body+Math.sin(s.a)*s.v*k*.75+.5*g*k*k;c.globalAlpha=(1-k/s.life);c.fillStyle=s.warm?'#fff1c2':pal.glow;c.beginPath();c.arc(px,py,s.s*(1-k/s.life*.5),0,Math.PI*2);c.fill();}}}
 // 7) Chớp trắng toàn màn hình mỗi lần lôi chạm.
 let flash=0;for(const b of profile.bolts){const age=t-b.at;if(age>=0&&age<.42)flash=Math.max(flash,(b.main?1:.62)*Math.pow(1-age/.42,2));}
 const pre=t<STRIKE_AT&&t>1.4?(rng(profile.seed+Math.floor(t*9))()<.18?.18:0):0;flash=Math.max(flash,pre);
 if(flash>0){c.globalCompositeOperation='source-over';c.globalAlpha=flash*.78;c.fillStyle=pal.core;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';c.globalAlpha=flash*.45;c.fillStyle=pal.glow;c.fillRect(0,0,W,H);}
 // 8) Dư điện quấn người, khói bốc.
 const after=smooth(STRIKE_AT+.2,STRIKE_AT+.6,t)*fade;if(after>0){c.globalCompositeOperation='lighter';const ar=rng(profile.seed+99+Math.floor(t*14));const n=light?2:4;for(let i=0;i<n;i++){if(ar()<.35)continue;const a=ar()*6.28,len=(22+ar()*36)*scale*.7,sx=x+(ar()-.5)*30*scale*.6,sy=body+(ar()-.5)*50*scale*.6;glowStroke(c,pathPoints(boltPath(ar,4,.55),sx,sy,sx+Math.cos(a)*len,sy+Math.sin(a)*len),pal,1.3,after*.85);}
  c.globalCompositeOperation='source-over';for(let i=0;i<(light?4:8);i++){const k=((t-STRIKE_AT)*.35+i/8)%1,sx=x+Math.sin(i*2.3+t*.7)*24*scale*.6,sy=y-10-k*150*scale*.6;const sr=(14+k*36)*scale*.5,sg2=c.createRadialGradient(sx,sy,0,sx,sy,sr);sg2.addColorStop(0,'rgba(40,40,52,.9)');sg2.addColorStop(1,'rgba(40,40,52,0)');c.globalAlpha=after*(1-k)*.22;c.fillStyle=sg2;c.beginPath();c.arc(sx,sy,sr,0,Math.PI*2);c.fill();}}
 // 9) Chữ: tiêu đề trên cao, dòng kết quả dưới.
 c.globalCompositeOperation='source-over';c.textAlign='center';c.textBaseline='middle';
 const ta=smooth(.25,.9,t)*fade;if(ta>0){const sh=t>=STRIKE_AT&&t<STRIKE_AT+.35?(Math.random()-.5)*8:0;c.font='800 54px Georgia, "Times New Roman", serif';c.lineWidth=9;c.strokeStyle='rgba(0,0,0,.75)';c.globalAlpha=ta;const TY=H>1100?H*.25:H*.17;c.strokeText(profile.title,W/2+sh,TY);const tg=c.createLinearGradient(0,TY-28,0,TY+28);tg.addColorStop(0,pal.core);tg.addColorStop(.55,pal.glow);tg.addColorStop(1,pal.rim);c.fillStyle=tg;c.fillText(profile.title,W/2+sh,TY);
  c.globalCompositeOperation='lighter';c.globalAlpha=ta*.35*(.7+.3*Math.sin(t*9));c.fillStyle=pal.hue;c.fillText(profile.title,W/2+sh,TY);c.globalCompositeOperation='source-over';}
 const ra=smooth(STRIKE_AT+.5,STRIKE_AT+1.1,t)*fade;if(ra>0&&name){const yy=H>1100?H*.33:H*.29,rise=(1-ease(smooth(STRIKE_AT+.5,STRIKE_AT+1.2,t)))*24;c.globalAlpha=ra*.72;const bw=Math.min(W-60,640);const bg=c.createLinearGradient(W/2-bw/2,0,W/2+bw/2,0);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(.2,'rgba(8,4,20,.92)');bg.addColorStop(.8,'rgba(8,4,20,.92)');bg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=bg;c.fillRect(W/2-bw/2,yy-46+rise,bw,96);
  c.globalAlpha=ra;c.fillStyle=pal.rim;c.fillRect(W/2-bw*.34,yy-44+rise,bw*.68,2);c.fillRect(W/2-bw*.34,yy+46+rise,bw*.68,2);
  c.font='800 34px Georgia, "Times New Roman", serif';c.lineWidth=6;c.strokeStyle='rgba(0,0,0,.8)';c.strokeText(name,W/2,yy-14+rise);c.fillStyle='#fff';c.fillText(name,W/2,yy-14+rise);
  c.font='700 24px Georgia, "Times New Roman", serif';const line=`-${Number(loss||0).toLocaleString('vi-VN')} tu vi (20%) · choáng 5 phút`;c.lineWidth=5;c.strokeText(line,W/2,yy+24+rise);c.fillStyle=pal.glow;c.fillText(line,W/2,yy+24+rise);}
 c.restore();}

// Rung camera: rền nhẹ khi tụ lôi, giật mạnh ở mỗi đạo lôi.
export function heavenStrikeShake(profile,t){if(!profile||t<0||t>HEAVEN_STRIKE_MS/1000)return {x:0,y:0};let a=t<STRIKE_AT?smooth(1,STRIKE_AT,t)*2.2:0;
 for(const b of profile.bolts){const age=t-b.at;if(age>=0&&age<.8)a=Math.max(a,(b.main?18:11)*Math.pow(1-age/.8,2));}
 return {x:Math.sin(t*93.1+profile.seed)*a,y:Math.cos(t*71.7+profile.seed*.3)*a*.8};}

// Dấu choáng 5 phút: tia điện nhỏ quanh thân + vòng lôi trên đầu + đồng hồ đếm ngược. Toạ độ thế giới (trước khi đổi sang màn hình).
export function drawStunMark(c,target,t,nowMs,pal=PALETTES[0]){const p=target.player;if(!(p?.stunUntil>nowMs))return;const s=target.scale||1.4,x=target.x,y=target.y,head=y-66*s,left=Math.ceil((p.stunUntil-nowMs)/1000);
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 const r=rng((p.id?.length||3)*977+Math.floor(t/110));for(let i=0;i<2;i++){if(r()<.45)continue;const a=r()*6.28,sx=x+(r()-.5)*24*s,sy=y-(14+r()*44)*s;glowStroke(c,pathPoints(boltPath(r,3,.6),sx,sy,sx+Math.cos(a)*16*s,sy+Math.sin(a)*16*s),pal,.9,.75);}
 c.globalAlpha=.85;c.strokeStyle=pal.rim;c.lineWidth=1.8;c.beginPath();c.ellipse(x,head-6*s,15*s,4.5*s,0,0,Math.PI*2);c.stroke();
 for(let i=0;i<3;i++){const a=t*.004+i*2.094;c.fillStyle=pal.glow;c.globalAlpha=.9;c.beginPath();c.arc(x+Math.cos(a)*15*s,head-6*s+Math.sin(a)*4.5*s,2.2,0,Math.PI*2);c.fill();}
 c.globalCompositeOperation='source-over';c.globalAlpha=1;c.font='700 13px Georgia';c.textAlign='center';c.textBaseline='middle';c.lineWidth=3.5;c.strokeStyle='rgba(0,0,0,.8)';const txt='choáng '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');c.strokeText(txt,x,head-19*s);c.fillStyle='#e6d6ff';c.fillText(txt,x,head-19*s);
 c.restore();}
