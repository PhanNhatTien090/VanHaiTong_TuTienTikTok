// 18/11/2026 (chủ game, kế hoạch PHAP-BAO-PLAN mục 10.2): CHIÊU THẦN KHÍ GIỚI HẠN — ngang màn đột phá, mỗi món MỘT CƠ CHẾ RIÊNG.
// Nhịp chung 9,5 s: TRIỆU BẢO (người dùng giơ thần khí, cận mặt, tên món) → CƠ CHẾ RIÊNG (2,0–6,5 s) → TRÚNG (đứng hình + đảo màu + nổ)
// → KẾT (số máu, tên chiêu, chủ nhân). Hình = chính ảnh pháp bảo + hiệu ứng vẽ tay (không cần ảnh mới); chỉ vẽ 2 người → làm mạnh tay.
// Biến thể theo mã đòn: lật bên, màu phụ, chiều xoay. Không shadowBlur/filter mỗi khung (riêng blend 'saturation'/'difference' là phép trộn, nhẹ).
import {drawCaster,drawCutInBand,txt} from './skill-cutscene.js?v=20261118';
import {fxVariant,fxCamera,punch,smooth,out3,seg,clamp,dot,drawCircle,drawInflow,drawSkyBeams,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop,drawSkyLances} from './cut-fx.js?v=20261118';
import {baoItem,baoArt,BAO_LINES} from './phap-bao-data.js';

const TAU=Math.PI*2,ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const rn=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export const BAO_ULT_MS=9500,ULT_HIT=6.5;
// Tên chiêu + màu chủ đạo từng món (màu phụ thêm theo biến thể).
export const BAO_ULTS=Object.freeze({
 'L01-tru-tien':{move:'Tru Tiên Vạn Kiếm Trận',main:'#ff3048',soft:'#ffc2c8',deep:'#140208'},
 'L02-hon-don-chung':{move:'Hỗn Độn Chung · Thời Gian Ngưng Kết',main:'#9b6bff',soft:'#e2d4ff',deep:'#0a0418'},
 'L03-luan-hoi-kinh':{move:'Luân Hồi Kính · Ngũ Ảnh Quy Nhất',main:'#c48cff',soft:'#f2e4ff',deep:'#0c0418'},
 'L04-thai-cuc-do':{move:'Thái Cực Đồ · Âm Dương Đảo Chuyển',main:'#f2f2f2',soft:'#ffffff',deep:'#050505'},
 'L05-huyen-hoa-dinh':{move:'Cửu Thiên Huyền Hỏa Luyện',main:'#3fc8ff',soft:'#d6f6ff',deep:'#020c16'},
 'L06-can-khon-dai':{move:'Càn Khôn Đại · Nuốt Trời Nhả Hà',main:'#7a8cff',soft:'#dfe4ff',deep:'#04061a'},
 'L07-phong-than-bang':{move:'Phong Thần Bảng · Lôi Ấn Phong Thần',main:'#ffd34d',soft:'#fff3c4',deep:'#140e02'},
 'L08-dinh-hai-cham':{move:'Định Hải Thần Châm · Hải Khiếu',main:'#2fd8ff',soft:'#d0f8ff',deep:'#011018'},
 'L09-that-bao-thu':{move:'Thất Bảo Diệu Thụ · Thất Sắc Xoát',main:'#7dff9a',soft:'#eaffef',deep:'#031208'},
 'L10-hong-mong-binh':{move:'Hồng Mông Tử Khí · Tử Long Triền',main:'#b45cff',soft:'#ecd4ff',deep:'#0e0420'},
 'L11-loi-than-chuy':{move:'Lôi Thần Chùy · Cửu Lôi Oanh Đỉnh',main:'#5fb8ff',soft:'#e0f2ff',deep:'#020814'},
 'L12-huyet-hai-dao':{move:'Huyết Hải Ma Đao · Đoạn Hải',main:'#ff1f3a',soft:'#ffb0b8',deep:'#160206'},
});
const IMG=new Map();
export function ultImg(id){if(typeof Image==='undefined')return null;let g=IMG.get(id);if(!g){const im=new Image();im.decoding='async';g={im,ok:false};im.onload=()=>g.ok=true;im.src=baoArt(id);IMG.set(id,g);}return g.ok?g.im:null;}
function item(c,im,x,y,s,a=1,rot=0,spin=0){if(a<=.01||s<=1)return;c.save();c.globalAlpha=a;c.translate(x,y);if(rot)c.rotate(rot);if(spin)c.scale(Math.cos(spin)||.01,1);if(im)c.drawImage(im,-s/2,-s/2,s,s);else{c.fillStyle='#ffffff';c.beginPath();c.arc(0,0,s*.3,0,TAU);c.fill();}c.restore();c.globalAlpha=1;}
function ring(c,x,y,R,lw,a,col,flat=1){if(a<=.01||R<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.ellipse(x,y,R,R*flat,0,0,TAU);c.stroke();c.restore();c.globalAlpha=1;}
function bolt(c,x0,y0,x1,y1,a,col,seed,w=12){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';for(let p=0;p<2;p++){c.globalAlpha=a*(p?1:.55);c.strokeStyle=p?'#ffffff':col;c.lineWidth=p?w*.3:w;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<=10;i++){const k=i/10;c.lineTo(x0+(x1-x0)*k+(i<10?(rn(seed+i)-.5)*80:0),y0+(y1-y0)*k+(i<10?(rn(seed+i+30)-.5)*30:0));}c.stroke();}c.restore();c.globalAlpha=1;}
function rays(c,x,y,n,len,a,rot,col,w=16){if(a<=.01||len<=0)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(rot);for(let i=0;i<n;i++){c.rotate(TAU/n);const L=len*(.6+.4*rn(i));const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#ffffff');g.addColorStop(.3,col);g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.moveTo(0,-w/2);c.lineTo(L,0);c.lineTo(0,w/2);c.fill();}c.restore();c.globalAlpha=1;}
function wash(c,H,col,a,mode='source-over'){if(a<=.01)return;c.save();c.globalCompositeOperation=mode;c.globalAlpha=Math.min(1,a);c.fillStyle=col;c.fillRect(-200,-200,1300,H+400);c.restore();c.globalAlpha=1;}

// ───── 12 CƠ CHẾ RIÊNG. u = 0..1 trong pha 2,0–6,5 s. S = {A,B (vị trí), H, P, im, t, light, dir, seed, scene, players, e} ─────
const MECH={
 // 4 kiếm cắm 4 góc → trận đồ đỏ đen trải kín màn → vạn kiếm rơi xoắn ốc → chém thành chữ TRU
 'L01-tru-tien'(c,u,S){const {B,H,P,im,t,light}=S,cs=[[110,H*.22],[790,H*.22],[110,H*.86],[790,H*.86]];
  cs.forEach(([x,y],i)=>{const k=ease(seg(u,i*.05,.18+i*.05));item(c,im,x,y-(1-k)*400,150,k,i*Math.PI/2);bolt(c,x,y,B.x,B.chest,k*(1-seg(u,.3,.4))*.5,P.main,i*11,6);});
  const arr=smooth(seg(u,.2,.4));if(arr>0){wash(c,H,'#1a0004',arr*.55);drawCircle(c,450,H*.55,430,arr,t,P,1);drawCircle(c,450,H*.55,300,arr,t,P,-1);ring(c,450,H*.55,400,4,arr*.8,P.main,.36);}
  const rain=seg(u,.38,.85);if(rain>0){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';const n=light?80:220;for(let i=0;i<n;i++){const s0=rn(i)*.6,k=clamp((rain-s0)/.35);if(k<=0||k>=1.2)continue;const q=rn(i+5)*TAU+k*3,R=(1-k)*560+30,x=B.x+Math.cos(q)*R,y=B.chest+Math.sin(q)*R*.6-(1-k)*520,dx=Math.cos(q+1.6)*120,dy=90;c.globalAlpha=k>1?1-(k-1)/.2:.95;c.strokeStyle=i%4?P.main:'#ffffff';c.lineWidth=6;c.beginPath();c.moveTo(x-dx,y-dy);c.lineTo(x,y);c.stroke();c.lineWidth=14;c.beginPath();c.moveTo(x-dx*.8-dy*.12,y-dy*.8+dx*.12);c.lineTo(x-dx*.8+dy*.12,y-dy*.8-dx*.12);c.stroke();dot(c,'#ffffff',x,y,12,c.globalAlpha);}c.restore();c.globalAlpha=1;}
  const tru=seg(u,.82,1);if(tru>0){const pop=1+.6*(1-ease(seg(tru,0,.4)));c.save();c.translate(B.x,B.chest-60);c.scale(pop,pop);txt(c,'TRU',0,0,220,'#ff3048',{width:18});c.restore();c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.lineWidth=10*(1-tru);c.globalAlpha=1-tru*.5;c.beginPath();c.moveTo(B.x-260,B.chest-260);c.lineTo(B.x+260,B.chest+200);c.stroke();c.restore();c.globalAlpha=1;}},
 // chuông úp trùm đối thủ → THỜI GIAN NGƯNG (màn xám, hạt đứng yên) → gõ 3 tiếng, mỗi tiếng sóng âm vỡ màn
 'L02-hon-don-chung'(c,u,S){const {B,H,P,im,light}=S,drop=ease(seg(u,0,.18)),y=B.chest-80-(1-drop)*700;
  const freeze=smooth(seg(u,.18,.28))*(1-seg(u,.92,1));if(freeze>0){wash(c,H,'#808080',freeze,'saturation');for(let i=0;i<(light?40:110);i++)dot(c,'#cfd6ff',rn(i)*900,rn(i+3)*H,3+rn(i+7)*5,freeze*.9);txt(c,'THỜI GIAN NGƯNG KẾT',450,H*.84,40,'#e2d4ff',{width:9});}
  item(c,im,B.x,y,420,1);ring(c,B.x,y+150,200,6,drop*.8,P.main,.3);
  [.4,.58,.76].forEach((s0,i)=>{const k=seg(u,s0,s0+.2);if(k<=0||k>=1)return;for(let j=0;j<3;j++)ring(c,B.x,y,out3(seg(k,j*.12,1))*(600+i*200),14-j*4,(1-k)*.9,j?P.main:'#ffffff');
   c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.lineWidth=3;c.globalAlpha=(1-k);for(let n=0;n<8;n++){const q=rn(i*9+n)*TAU,L=200+rn(n)*500;c.beginPath();c.moveTo(B.x,y);c.lineTo(B.x+Math.cos(q)*L*.5+(rn(n+3)-.5)*60,y+Math.sin(q)*L*.5);c.lineTo(B.x+Math.cos(q)*L,y+Math.sin(q)*L);c.stroke();}c.restore();c.globalAlpha=1;});},
 // 18/11 v2: gương soi giữa trời (mặt gương xoáy, 8 mảnh gương bay quanh, sét tím viền) → 5 PHÂN THÂN bước ra theo 5 vệt sáng
 // → NGŨ TINH TRẬN nối 5 bóng → lần lượt 5 tia bắn vào đối thủ (mỗi tia một chùm tia lửa) → 5 bóng thu về đối thủ, gương VỠ thành mảnh.
 'L03-luan-hoi-kinh'(c,u,S){const {B,H,P,im,t,scene,caster,light}=S,mx=450,my=H*.36,show=ease(seg(u,0,.14)),brk=seg(u,.84,1);
  wash(c,H,'#12041f',smooth(seg(u,0,.2))*.5);
  for(let i=0;i<8;i++){const q=i/8*TAU+t*.0012*(i%2?1:-1)+u*3,R=(250+40*Math.sin(t*.002+i))*show*(1+brk*2.4),x=mx+Math.cos(q)*R,y=my+Math.sin(q)*R*.55;c.save();c.globalAlpha=show*(1-brk);c.translate(x,y);c.rotate(q+t*.003);c.globalCompositeOperation='lighter';const g=c.createLinearGradient(-26,-40,26,40);g.addColorStop(0,'#ffffff');g.addColorStop(.5,P.main);g.addColorStop(1,'#3a1060');c.fillStyle=g;c.beginPath();c.moveTo(0,-44);c.lineTo(24,6);c.lineTo(-6,40);c.lineTo(-22,-4);c.closePath();c.fill();c.restore();}
  if(show>0&&brk<1){c.save();c.globalCompositeOperation='lighter';c.translate(mx,my);for(let k=0;k<7;k++){c.rotate(t*.002+k);c.strokeStyle=k%2?P.main:'#ffffff';c.globalAlpha=show*.5*(1-brk);c.lineWidth=4;c.beginPath();c.arc(0,0,40+k*22,0,TAU*.7);c.stroke();}c.restore();c.globalAlpha=1;
   item(c,im,mx,my,380*show,show*(1-brk),0,Math.sin(t*.002)*.25);ring(c,mx,my,200*show,6,show*.8*(1-brk),P.main);
   for(let i=0;i<4;i++){const f=Math.floor(t/90);bolt(c,mx+Math.cos(i*1.6+t*.004)*190,my+Math.sin(i*1.6+t*.004)*110,mx+Math.cos(i*1.6+1+t*.004)*230,my+Math.sin(i*1.6+1)*130,show*.7*(1-brk)*(rn(i+f)>.4?1:0),P.main,i*7+f,5);}}
  const pts=[[150,H*.52],[290,H*.27],[610,H*.27],[750,H*.52],[450,H*.68]],mrg=ease(seg(u,.82,.95)),P2=[];
  pts.forEach(([x,y],i)=>{const out=ease(seg(u,.12+i*.04,.3+i*.04)),px=x+(B.x-x)*mrg,py=y+(B.chest-y)*mrg;P2.push([px,py,out]);
   if(out>0&&out<1){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=P.soft;c.lineWidth=10*(1-out)+2;c.globalAlpha=1-out;c.beginPath();c.moveTo(mx,my);c.lineTo(mx+(x-mx)*out,my+(y-my)*out);c.stroke();c.restore();}
   if(out>0){dot(c,P.main,px,py+60,150*out,.35*out*(1-mrg));ring(c,px,py+150,90*out,4,out*.8*(1-mrg),P.main,.3);
    if(caster){c.save();c.globalAlpha=.7*out*(1-mrg);c.globalCompositeOperation='lighter';drawCaster(scene,c,caster,px,py+150,2,t,px>B.x);c.restore();c.globalAlpha=1;}
    else item(c,im,px,py,120*out,out*(1-mrg));}});
  const star=smooth(seg(u,.3,.42))*(1-mrg);if(star>0){c.save();c.globalCompositeOperation='lighter';c.lineWidth=6;c.strokeStyle=P.main;c.globalAlpha=star*.9;c.beginPath();[0,2,4,1,3,0].forEach((j,k)=>{const [x,y]=P2[j];if(k)c.lineTo(x,y+60);else c.moveTo(x,y+60);});c.stroke();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();c.restore();c.globalAlpha=1;drawCircle(c,450,H*.47,330,star,t,P,1);}
  P2.forEach(([px,py],i)=>{const fire=seg(u,.45+i*.06,.62+i*.06);if(fire<=0||fire>=1)return;const reach=ease(Math.min(1,fire*1.6));
   c.save();c.globalCompositeOperation='lighter';for(let w=0;w<2;w++){c.strokeStyle=w?'#ffffff':(i%2?P.main:'#ff9cf0');c.lineWidth=(w?8:26)*(1-fire)+3;c.globalAlpha=1-fire*.4;c.beginPath();c.moveTo(px,py);c.lineTo(px+(B.x-px)*reach,py+(B.chest-py)*reach);c.stroke();}c.restore();c.globalAlpha=1;
   if(reach>=1){rays(c,B.x,B.chest,10,260*(1-fire),1-fire,i,P.main,10);for(let j=0;j<(light?8:22);j++){const q=rn(i*31+j)*TAU,d=out3(fire)*(120+rn(j)*200);dot(c,j%2?P.soft:'#ffffff',B.x+Math.cos(q)*d,B.chest+Math.sin(q)*d,4,(1-fire));}}});
  if(brk>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?14:36);i++){const q=rn(i)*TAU,d=out3(brk)*(200+rn(i+1)*600),x=mx+Math.cos(q)*d,y=my+Math.sin(q)*d+brk*brk*300;c.save();c.translate(x,y);c.rotate(q+brk*8);c.globalAlpha=1-brk;c.fillStyle=i%3?P.main:'#ffffff';c.beginPath();c.moveTo(0,-18);c.lineTo(12,4);c.lineTo(-8,14);c.closePath();c.fill();c.restore();}c.restore();c.globalAlpha=1;
   const pop=1+.15*(1-ease(seg(brk,0,.3)));c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,'NGŨ ẢNH QUY NHẤT',0,0,62,P.soft,{width:12,max:740});c.restore();}},
 // cuộn tranh trải thành cầu âm dương khổng lồ → đối thủ bị hút vào xoáy → lật ngược đen trắng
 'L04-thai-cuc-do'(c,u,S){const {B,H,im,t}=S,R=330*ease(seg(u,.1,.3)),rot=t*.002+u*8,cx=450,cy=H*.45;
  item(c,im,cx,cy,380,1-seg(u,.1,.22));
  if(R>2){c.save();c.translate(cx,cy);c.rotate(rot);c.globalAlpha=.92;c.fillStyle='#f4f4f4';c.beginPath();c.arc(0,0,R,-Math.PI/2,Math.PI/2);c.arc(0,R/2,R/2,Math.PI/2,-Math.PI/2,true);c.arc(0,-R/2,R/2,Math.PI/2,-Math.PI/2);c.fill();
   c.fillStyle='#0a0a0a';c.beginPath();c.arc(0,0,R,Math.PI/2,-Math.PI/2);c.arc(0,-R/2,R/2,-Math.PI/2,Math.PI/2,true);c.arc(0,R/2,R/2,-Math.PI/2,Math.PI/2);c.fill();
   c.fillStyle='#0a0a0a';c.beginPath();c.arc(0,-R/2,R*.12,0,TAU);c.fill();c.fillStyle='#f4f4f4';c.beginPath();c.arc(0,R/2,R*.12,0,TAU);c.fill();c.restore();c.globalAlpha=1;
   ring(c,cx,cy,R+12,6,.8,'#ffd36b');for(let i=0;i<8;i++){const q=rot*.5+i*TAU/8;txt(c,'☰☱☲☳☴☵☶☷'[i],cx+Math.cos(q)*(R+50),cy+Math.sin(q)*(R+50),34,'#ffd36b',{width:4});}}
  const suck=seg(u,.4,.75);if(suck>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<60;i++){const k=(rn(i)+suck*2)%1,q=rn(i+4)*TAU+k*6,r=(1-k)*500;dot(c,i%2?'#ffffff':'#ffd36b',cx+Math.cos(q)*r,cy+Math.sin(q)*r*.8,6,k);}c.restore();}
  S.foeScale=1-.7*ease(suck);S.foeRot=suck*8;S.foeX=B.x+(cx-B.x)*ease(suck);S.foeY=B.y+(cy+150-B.y)*ease(suck);
  const inv=seg(u,.78,.82)>0&&u<.95;if(inv)wash(c,H,'#ffffff',1,'difference');},
 // đỉnh rơi từ trời úp xuống → lửa xanh huyền luyện → nắp bật, đan quang bắn lên trời
 'L05-huyen-hoa-dinh'(c,u,S){const {B,H,P,im,t,light}=S,drop=easeIn(seg(u,0,.2)),y=-300+(B.y-150+300)*drop,s=480;
  if(u>.2&&u<.24)wash(c,H,'#ffffff',(1-seg(u,.2,.24))*.6,'lighter');
  item(c,im,B.x,y,s,1);S.hideFoe=u>.2&&u<.88;
  const fire=seg(u,.22,.8);if(fire>0){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?40:110);i++){const v=((t*.0009*(1+rn(i)))+rn(i+1))%1;dot(c,i%3?P.main:'#ffffff',B.x+(rn(i+2)-.5)*(s*.9),B.y-60-v*500,10+rn(i)*16,fire*(1-v));}c.restore();txt(c,'HUYỀN HỎA LUYỆN',B.x,B.y+60,34,'#d6f6ff',{width:8});}
  const lid=seg(u,.8,1);if(lid>0){c.save();c.globalCompositeOperation='lighter';const w=60+120*(1-lid*.5),g=c.createLinearGradient(B.x-w,0,B.x+w,0);g.addColorStop(0,P.main+'00');g.addColorStop(.5,'#ffffff');g.addColorStop(1,P.main+'00');c.fillStyle=g;c.globalAlpha=1;c.fillRect(B.x-w,-100,w*2,y+100);c.restore();rays(c,B.x,y-120,14,520*lid,1-lid*.6,lid*2,P.main);}},
 // túi mở → cả bầu trời bị hút vào túi → nhả ra một dải ngân hà đập xuống
 'L06-can-khon-dai'(c,u,S){const {A,B,H,P,im,t,light}=S,bx=450,by=H*.26;
  const sky=1-seg(u,.15,.55);for(let i=0;i<(light?60:160);i++){const k=seg(u,.15+rn(i)*.2,.55),x0=rn(i)*900,y0=rn(i+2)*H*.7,x=x0+(bx-x0)*easeIn(k),y=y0+(by-y0)*easeIn(k);dot(c,i%4?'#dfe4ff':'#ffffff',x,y,3+rn(i+5)*4,.9*(1-k*.6));}
  void sky;item(c,im,bx,by,300+40*Math.sin(t*.01),1,Math.sin(t*.004)*.1);
  const spit=seg(u,.6,.95);if(spit>0){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let j=0;j<5;j++){const g=c.createLinearGradient(bx,by,B.x,B.chest);g.addColorStop(0,'#ffffff');g.addColorStop(.5,j%2?P.main:'#ff8fd0');g.addColorStop(1,'#ffffff');c.strokeStyle=g;c.lineWidth=(70-j*12);c.globalAlpha=.5-j*.06;c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(B.x+200,by-100,bx+(B.x-bx)*ease(spit),by+(B.chest-by)*ease(spit));c.stroke();}c.restore();c.globalAlpha=1;
   for(let i=0;i<40;i++)dot(c,'#ffffff',bx+(B.x-bx)*ease(spit)*rn(i)+(rn(i+3)-.5)*80,by+(B.chest-by)*ease(spit)*rn(i)+(rn(i+4)-.5)*80,4,spit);}},
 // bảng vàng mở → tên đối thủ hiện lên bảng → sấm phong ấn đóng dấu
 'L07-phong-than-bang'(c,u,S){const {B,H,P,im,foeName}=S,open=ease(seg(u,0,.25)),cx=450,cy=H*.4;
  c.save();c.translate(cx,cy);c.scale(open,1);item(c,im,0,0,560,1);c.restore();
  const n=Array.from(String(foeName||'Đối thủ')),show=Math.ceil(n.length*seg(u,.3,.6));if(show>0){txt(c,n.slice(0,show).join(''),cx,cy,54,'#ff2a2a',{width:8,max:360});}
  const seal=seg(u,.72,.82);if(seal>0){const s=1+2*(1-ease(seal));c.save();c.translate(cx+120,cy+130);c.scale(s,s);c.rotate(-.15);c.globalAlpha=Math.min(1,seal*2);c.strokeStyle='#ff2a2a';c.lineWidth=10;c.strokeRect(-80,-80,160,160);txt(c,'PHONG',0,0,48,'#ff2a2a',{width:4});c.restore();c.globalAlpha=1;}
  [.66,.7,.74].forEach((s0,i)=>{const a=u>=s0&&u<s0+.06?1-(u-s0)/.06:0;bolt(c,cx+(i-1)*250,-50,cx+120,cy+130,a,P.main,i*13,16);});},
 // trụ cắm xuống → biển dâng sóng thần cuốn ngang màn → trụ phóng to chống trời
 'L08-dinh-hai-cham'(c,u,S){const {B,H,P,im,dir}=S,drop=easeIn(seg(u,0,.15)),px=450,py=-400+(H*.62+400)*drop;
  item(c,im,px,py-220,560*(1+1.2*ease(seg(u,.8,1))),1,0);
  const sea=smooth(seg(u,.15,.35)),lvl=H*(1-.32*sea);if(sea>0){const g=c.createLinearGradient(0,lvl-60,0,H);g.addColorStop(0,'#bff6ff');g.addColorStop(.2,P.main);g.addColorStop(1,'#012a3a');c.fillStyle=g;c.beginPath();c.moveTo(-100,H+100);for(let x=-100;x<=1000;x+=30)c.lineTo(x,lvl+Math.sin(x*.02+S.t*.006)*16);c.lineTo(1000,H+100);c.fill();}
  const wave=seg(u,.38,.78);if(wave>0){const sx=dir>0?1:-1,wx=sx>0?-500+wave*1900:1400-wave*1900;c.save();c.translate(wx,0);c.scale(sx,1);const g=c.createLinearGradient(-700,0,120,0);g.addColorStop(0,'#013a4e');g.addColorStop(.7,P.main);g.addColorStop(1,'#ffffff');c.fillStyle=g;c.globalAlpha=.95;c.beginPath();c.moveTo(-900,H+50);c.lineTo(-900,H*.35);c.quadraticCurveTo(-300,H*.02,40,H*.14);c.quadraticCurveTo(160,H*.22,60,H*.36);c.quadraticCurveTo(-40,H*.3,20,H*.5);c.quadraticCurveTo(120,H*.8,160,H+50);c.fill();c.globalCompositeOperation='lighter';for(let i=0;i<40;i++)dot(c,'#ffffff',20-rn(i)*260,H*(.1+rn(i+3)*.4),10+rn(i+6)*20,.7);c.restore();c.globalAlpha=1;txt(c,'HẢI KHIẾU',450,H*.18,64,'#d0f8ff',{width:12});}},
 // cây mọc lên → 7 đóa bảo quang nở 7 màu → quét một nhát cầu vồng
 'L09-that-bao-thu'(c,u,S){const {B,H,P,im,t}=S,grow=ease(seg(u,0,.3)),cx=450,base=H*.8,COL=['#ff4a4a','#ff9a3a','#ffe14a','#5aff7a','#4ad8ff','#5a6bff','#c45aff'];
  c.save();c.translate(cx,base);c.scale(grow,grow);item(c,im,0,-300,620,1);c.restore();
  COL.forEach((col,i)=>{const k=ease(seg(u,.3+i*.05,.42+i*.05));if(k<=0)return;const q=-Math.PI*.9+i*Math.PI*.8/6,x=cx+Math.cos(q)*300,y=base-300+Math.sin(q)*300;dot(c,col,x,y,90*k,.9);dot(c,'#ffffff',x,y,30*k,.9);rays(c,x,y,8,90*k,.6*k,t*.002+i,col,8);});
  const sw=seg(u,.75,.95);if(sw>0){c.save();c.globalCompositeOperation='lighter';COL.forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=22;c.globalAlpha=(1-sw*.6);c.beginPath();c.arc(cx,base,520-i*24,Math.PI,Math.PI+Math.PI*ease(sw));c.stroke();});c.restore();c.globalAlpha=1;}},
 // bình nghiêng → tử khí tràn kín màn → ngưng tụ thành rồng tím quấn đối thủ
 'L10-hong-mong-binh'(c,u,S){const {B,H,P,im,t,light}=S,tilt=ease(seg(u,0,.15))*-.9,bx=280,by=H*.3;
  item(c,im,bx,by,360,1,tilt);
  const mist=seg(u,.12,.5);if(mist>0)for(let i=0;i<(light?30:70);i++){const k=clamp(mist*1.4-rn(i)*.4),x=bx+80+(rn(i+1)*900-bx)*k,y=by+(rn(i+2)*H-by)*k;dot(c,i%3?'#7a2aff':'#c48cff',x,y,80+rn(i)*90,.35*k*(1-seg(u,.55,.75)));}
  const drg=seg(u,.55,1);if(drg>0){c.save();c.globalCompositeOperation='lighter';const N=90;for(let i=0;i<N;i++){const s=i/N,head=ease(drg),k=head-s*.6;if(k<0)continue;const q=k*TAU*2.2+t*.003,r=230+90*Math.sin(s*9),x=B.x+Math.cos(q)*r,y=B.chest-300+k*420+Math.sin(q)*r*.35,z=(i===0?90:60)*(1-s*.65);dot(c,P.main,x,y,z,.9);dot(c,i===0?'#ffffff':'#ecd4ff',x,y,z*.4,.9);if(i===0){dot(c,'#ffffff',x+20,y-10,14,1);dot(c,'#ffffff',x-20,y-10,14,1);}}c.restore();txt(c,'TỬ LONG TRIỀN',B.x,B.chest-330,40,'#ecd4ff',{width:9});}},
 // chùy giơ lên trời → mây sét tụ → 9 tia sét đánh theo nhịp trống
 'L11-loi-than-chuy'(c,u,S){const {A,B,H,P,im,t,light}=S,up=ease(seg(u,0,.15));
  item(c,im,A.x,A.y-420-up*120,320,1,-.3+up*.3);bolt(c,A.x,A.y-560,A.x,-50,up*(1-seg(u,.18,.25)),P.main,3,14);
  const cl=smooth(seg(u,.1,.3));if(cl>0)for(let i=0;i<(light?10:22);i++)dot(c,i%3?'#1a2a4a':'#3a5a8a',rn(i)*900,H*(.05+rn(i+2)*.12),160+rn(i)*120,.7*cl);
  for(let i=0;i<9;i++){const s0=.32+i*.065,a=u>=s0&&u<s0+.05?1-(u-s0)/.05:0;if(a<=0)continue;const x=B.x+(rn(i)-.5)*260;bolt(c,x,H*.1,B.x+(rn(i+9)-.5)*60,B.chest,a,P.main,i*17,i===8?26:14);if(a>.7)wash(c,H,'#bfe0ff',.25*a,'lighter');}
  const cnt=Math.min(9,Math.max(0,Math.floor((u-.32)/.065)+1));if(cnt>0&&u<.95)txt(c,cnt+' / 9 LÔI',B.x,B.chest-300,48,'#e0f2ff',{width:10});},
 // đao cắm đất → biển máu dâng → đao chém đôi biển máu, sóng đỏ dội lại
 // 18/11 v2 (chủ game: "làm dày"): đao từ trời cắm đất → đất nứt đỏ → BIỂN MÁU dâng dưới TRĂNG MÁU (bọt máu, 3 lớp sóng)
 // → đao rút lên HÚT MÁU xoắn quanh lưỡi → CHÉM DỌC tách đôi biển (vách máu + bụi máu) → 2 bức SÓNG ĐỎ dội lại đập vào đối thủ.
 'L12-huyet-hai-dao'(c,u,S){const {B,H,P,im,t,light}=S,gx=450,gy=H*.72,stab=easeIn(seg(u,0,.12)),rise=ease(seg(u,.42,.55)),bx=gx,by=-320+(gy-190+320)*stab-rise*260;
  const sky=smooth(seg(u,.1,.35));if(sky>0){wash(c,H,'#3a0006',sky*.55);const mo=ease(seg(u,.12,.4));dot(c,'#ff2a3c',720,H*.17,260*mo,.35*mo);c.save();c.globalAlpha=mo;c.fillStyle='#ff3b4c';c.beginPath();c.arc(720,H*.17,92*mo,0,TAU);c.fill();c.globalAlpha=mo*.55;c.fillStyle='#7a0010';c.beginPath();c.arc(745,H*.165,80*mo,0,TAU);c.fill();c.restore();c.globalAlpha=1;}
  const crack=seg(u,.1,.3);if(crack>0&&u<.62){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<9;i++){const q=Math.PI+(i/8)*Math.PI,L=(160+rn(i)*320)*ease(crack);c.strokeStyle=i%2?'#ff1f3a':'#ffb0b8';c.lineWidth=7-i%3*2;c.globalAlpha=.9*(1-seg(u,.4,.62));c.beginPath();c.moveTo(gx,gy);for(let s=1;s<=5;s++){const x=gx+Math.cos(q)*L*s/5+(rn(i*7+s)-.5)*40,y=gy-Math.sin(q)*L*s/5*.35+(rn(i*5+s)-.5)*16;c.lineTo(x,y);}c.stroke();}c.restore();}
  const sea=smooth(seg(u,.2,.48)),split=ease(seg(u,.62,.78)),lvl=H*(1-.44*sea),gap=split*240;
  if(sea>0){for(let L2=0;L2<3;L2++){c.save();const off=L2*40,g=c.createLinearGradient(0,lvl+off,0,H);g.addColorStop(0,L2?'#d0102a':'#ff6a78');g.addColorStop(.15,'#ff1f3a');g.addColorStop(.6,'#8a0016');g.addColorStop(1,'#300006');c.fillStyle=g;c.globalAlpha=L2?.75:1;
    for(const side of [-1,1]){c.beginPath();const x0=side<0?-120:450+gap,x1=side<0?450-gap:1020;c.moveTo(x0,H+120);for(let xx=x0;xx<=x1;xx+=24){const wall=split>0?Math.max(0,1-Math.abs(xx-(450+side*gap))/140)*split*260:0;c.lineTo(xx,lvl+off+Math.sin(xx*(.02+L2*.008)+t*(.006+L2*.003)+L2)*(18+L2*8)-wall);}c.lineTo(x1,H+120);c.fill();}c.restore();}
   c.save();c.globalCompositeOperation='lighter';const n=light?60:170;for(let i=0;i<n;i++){const k=(rn(i)+t*.0004*(1+rn(i+9)))%1,x=rn(i+3)*900,y=lvl+40-k*H*.5;dot(c,i%3?'#ff3048':'#ffd0d4',x,y,3+rn(i+5)*6,sea*(1-k)*.8);}c.restore();}
  const suck=seg(u,.4,.62);if(suck>0&&suck<1){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?24:70);i++){const ph=(rn(i)+suck*1.6)%1,R=(1-ph)*420,q=rn(i+2)*TAU+ph*7;dot(c,i%2?'#ff1f3a':'#ff8a96',bx+Math.cos(q)*R,by+Math.sin(q)*R*.6,6+8*ph,(1-ph)*.9);}c.restore();dot(c,'#ff2a3c',bx,by,260*suck,.5*suck);}
  item(c,im,bx,by,540+80*rise,1,stab<1?0:Math.sin(t*.012)*.03*(1-split));
  if(split>0&&split<1){c.save();c.globalCompositeOperation='lighter';for(let w=0;w<3;w++){c.strokeStyle=w?'#ff1f3a':'#ffffff';c.lineWidth=(30-w*8)*(1-split)+2;c.globalAlpha=1-split*.6;c.beginPath();c.moveTo(450+w*6,-60);c.lineTo(450-w*6,H+60);c.stroke();}
   for(let i=0;i<(light?40:120);i++){const side=i%2?1:-1,k=out3(split),x=450+side*(gap+rn(i)*60),y=lvl-k*(80+rn(i+1)*420)+rn(i+4)*80;dot(c,'#ff3048',x+side*k*rn(i+6)*160,y,4+rn(i+2)*7,(1-split)*.9);}c.restore();}
  const back=seg(u,.78,1);if(back>0){const k=ease(back);for(const side of [-1,1]){const x=side<0?-100+(B.x-80+100)*k:1000-(1000-B.x-80)*k;c.save();const g=c.createLinearGradient(x-side*220,0,x,0);g.addColorStop(0,'#ff1f3a00');g.addColorStop(.7,'#ff1f3acc');g.addColorStop(1,'#ffd0d4');c.fillStyle=g;c.globalAlpha=1-seg(back,.85,1);c.beginPath();c.moveTo(x-side*260,H*.95);c.quadraticCurveTo(x-side*40,B.y-520,x+side*20,B.y-420);c.lineTo(x,H*.95);c.fill();c.restore();}
   c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++)ring(c,B.x,B.y,out3(seg(back,.3+i*.08,1))*700,18-i*3,(1-back),'#ff1f3a',.4);c.restore();
   const pop=1+.5*(1-ease(seg(back,0,.25)));c.save();c.translate(450,H*.2);c.scale(pop,pop);txt(c,'ĐOẠN HẢI',0,0,96,'#ffb0b8',{width:15});c.restore();}},
};

/** Màn chiêu GIỚI HẠN toàn màn (gọi từ drawCutFull khi cut.kind==='bao' và bậc GIỚI HẠN). */
export function drawBaoUlt(scene,c,t,H,cut,players){
 const {e}=cut,id=e.cut.bao,U=BAO_ULTS[id],it=baoItem(id);if(!U||!it)return false;
 const sec=cut.age/1000,V=fxVariant(e.n||1),dir=V.flip?-1:1,X=x=>dir>0?x:900-x,P={main:U.main,soft:U.soft,gold:'#ffe7a8',deep:U.deep};
 const light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,im=ultImg(id);
 const caster=players.get(e.by),foe=players.get(e.to);
 const A={x:X(220),y:H*.8},B={x:X(660),y:H*.8};A.chest=A.y-330;B.chest=B.y-300;
 const hitSec=sec-ULT_HIT,HS=hitStop(hitSec,t,.12),hitFx=HS.sec;t=HS.t;
 const call=seg(sec,.4,2),mech=seg(sec,2,ULT_HIT),cx=450,cy=H*.48;
 const zoom=motion?1+.06*smooth(call)-.04*smooth(mech)+punch(hitSec,.14):1,shake=!motion||HS.frozen?0:hitSec>0&&hitSec<.8?(1-hitSec/.8)*22:mech>0&&mech<1?2:0;
 fxCamera(c,cx,cy,zoom,shake,t);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep);g.addColorStop(.55,'#020104');g.addColorStop(1,P.deep);c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 dot(c,P.main,cx,H*.45,H*.55,.2);
 // TRIỆU BẢO: trận pháp + cột sáng dưới chân, thần khí bay lên trên đầu
 drawSkyBeams(c,A.x,A.y,smooth(call)*(1-seg(sec,2.4,3))*.9,t,P);drawCircle(c,A.x,A.y,300,smooth(seg(sec,.4,.9))*(1-seg(sec,2.2,2.8)),t,P,V.spin);
 drawInflow(c,A.x,A.chest-140,call*(sec<2?1:0),t,P,light,460);
 const S={A,B,H,P,im,t,light,dir,scene,caster,foeName:foe?.name||'',e};
 // CƠ CHẾ RIÊNG (vẽ trước người để hình chiêu lớn nằm sau/trước tùy món)
 if(mech>0&&sec<ULT_HIT+.3)try{MECH[id](c,mech,S);}catch(err){console.warn('[bao-ult]',id,err);}
 // hai người
 if(foe&&!S.hideFoe){c.save();const fx=S.foeX??B.x,fy=S.foeY??B.y,sc=S.foeScale??1;c.translate(fx,fy);if(S.foeRot)c.rotate(S.foeRot);c.scale(sc,sc);c.translate(-fx,-fy);drawCaster(scene,c,foe,fx,fy,4.2,t,dir>0);c.restore();}
 drawCaster(scene,c,caster,A.x,A.y,4.6,t,dir<0);
 if(sec<2.2)item(c,im,A.x,A.chest-200-40*ease(call),260*(.4+.6*ease(call)),ease(call),0,Math.sin(t*.003)*.6);
 // TRÚNG
 if(hitSec>=0&&!HS.frozen){drawBurst(c,B.x,B.chest,hitFx,P,H,{light,pillar:true,scale:1.5,ground:B.y,seed:(e.n||1)%7,reduceFlash:rf});rays(c,B.x,B.chest,20,700*out3(hitFx/.5),Math.exp(-hitFx*1.2),hitFx*.4,P.main,18);
  ring(c,B.x,B.y,out3(hitFx/.6)*620,12,1-seg(hitFx,0,.6),'#ffffff',.42);drawSkyLances(c,B.x,B.y,.5+hitFx*.4,t,P,light,(e.n||1)%61,-200);}
 drawEmbers(c,H,seg(sec,ULT_HIT,ULT_HIT+.5)*(1-seg(sec,8.4,9)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.35+.25*smooth(call)*(hitSec<0?1:0),cx,cy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,B.x,B.chest,hitSec/.12,P,(e.n||1)%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(hitFx/.4),20);
 drawCutInBand(scene,c,caster,H,seg(sec,.6,1.7),P,dir,t,{label:'THẦN KHÍ GIỚI HẠN'});
 drawLetterbox(c,H,seg(sec,.1,.6)*(1-seg(sec,8.2,8.8)));
 // CHỮ
 if(sec>=.7&&sec<2.3){c.globalAlpha=seg(sec,.7,1)*(1-seg(sec,2,2.3));const pop=1+.3*(1-ease(seg(sec,.7,1)));c.save();c.translate(450,H*.16);c.scale(pop,pop);txt(c,'✦ '+it.name.toUpperCase()+' ✦',0,0,54,P.soft,{width:12,max:870});c.restore();
  txt(c,(caster?.name||'')+' · thần khí giới hạn · '+BAO_LINES[it.line].skill,450,H*.16+56,24,'#ffffff',{width:6,max:840,weight:'800'});c.globalAlpha=1;}
 if(sec>=2&&sec<ULT_HIT+2){const k=seg(sec,2,2.3),slide=(1-ease(k))*-600*dir,tg=c.createLinearGradient(0,H*.08-40,0,H*.08+40);tg.addColorStop(0,'#ffffff');tg.addColorStop(.5,P.soft);tg.addColorStop(1,P.main);
  c.save();c.translate(slide,0);c.globalAlpha=1-seg(sec,ULT_HIT+1.6,ULT_HIT+2);txt(c,U.move,450,H*.08,58,tg,{width:13,max:880});c.restore();c.globalAlpha=1;}
 if(sec>=ULT_HIT){const u=seg(sec,ULT_HIT,9),pop=1+.6*(1-ease(seg(u,0,.2)));
  c.save();c.translate(450,H*.34);c.scale(pop,pop);txt(c,e.dmg?'-'+Math.round(e.dmg).toLocaleString('vi-VN'):'',0,0,96,'#ffd54a',{width:15});c.restore();
  txt(c,e.ko?'K.O!':'THẦN THÔNG GIỚI HẠN',450,H*.34+80,44,e.ko?'#ffffff':P.soft,{width:10,max:860});
  if(caster)txt(c,caster.name+' — chủ nhân '+it.name,450,H*.34+130,26,'#ffffff',{width:6,weight:'800',max:860});}
 const o=seg(sec,8.8,9.5);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
 // âm thanh theo nhịp (mỗi đòn 1 lần)
 const seen=scene.cutSeen??=new Set(),cue=(key,at,fn)=>{const k='bu:'+e.n+':'+key;if(sec>=at&&sec<at+.5&&!seen.has(k)){seen.add(k);fn();}};
 cue('call',.8,()=>scene.onFeedbackSound?.('hit',2));cue('mech',2.1,()=>scene.onFeedbackSound?.('hit',2));cue('mid',4.2,()=>scene.onFeedbackSound?.('hit',2));cue('hit',ULT_HIT,()=>{scene.onSpectacleImpact?.();scene.onFeedbackSound?.('hit',3);});
 return true;
}
