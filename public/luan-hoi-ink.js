// 20/11/2026 — lớp THỦY MẶC cho màn Niết Bàn Luân Hồi (chủ game: "cải tiến chuyển sinh, ngầu, áp vô giao diện mới").
// Giao diện mới = giấy dó + mực + ấn son (thuy-mac.css: --tm-ink #1b1813, --tm-seal #b3261e, --tm-paper #f3ead8).
// Mọi hàm vẽ thuần trên canvas 900×H, không tải ảnh. Lớp tĩnh (núi) vẽ 1 lần vào surface riêng.
import {makeSurface} from './performance.js';
export const INK='#1b1813',INK_SOFT='#5a4a3a',SEAL='#b3261e',PAPER='#f3ead8',PAPER_DIM='#e4d6b8';
const TAU=Math.PI*2,SERIF='"Noto Serif","Times New Roman",Georgia,serif';
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(k,a,b)=>clamp((k-a)/(b-a)),out3=k=>1-(1-clamp(k))**3;
export const HAN_NUM=['','一','二','三','四','五','六','七','八','九','十'];
const hanNum=n=>n<=10?HAN_NUM[n]:n<20?'十'+HAN_NUM[n-10]:String(n);

/** Mép giấy xé: đường viền lởm chởm có hạt giống cố định. */
function tornRect(c,x,y,w,h,seed,amp=3.2){c.beginPath();const n=Math.max(8,Math.round(w/14)),m=Math.max(3,Math.round(h/14));
 for(let i=0;i<=n;i++)c.lineTo(x+w*i/n,y+(rnd(seed+i)-.5)*amp);
 for(let i=0;i<=m;i++)c.lineTo(x+w+(rnd(seed+50+i)-.5)*amp,y+h*i/m);
 for(let i=n;i>=0;i--)c.lineTo(x+w*i/n,y+h+(rnd(seed+90+i)-.5)*amp);
 for(let i=m;i>=0;i--)c.lineTo(x+(rnd(seed+140+i)-.5)*amp,y+h*i/m);c.closePath();}
function paperFill(c,x,y,w,h){const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#f7efdf');g.addColorStop(.55,PAPER);g.addColorStop(1,PAPER_DIM);return g;}
/** Thớ giấy: vài vệt sợi mảnh (rẻ, không cần ảnh). */
function fibers(c,x,y,w,h,seed){c.save();c.strokeStyle='rgba(120,96,60,.13)';c.lineWidth=1;for(let i=0;i<Math.min(26,w/18);i++){const fx=x+rnd(seed+i*3)*w,fy=y+rnd(seed+i*5)*h,l=8+rnd(i+seed)*26;c.beginPath();c.moveTo(fx,fy);c.quadraticCurveTo(fx+l*.5,fy+(rnd(i)-.5)*4,fx+l,fy+(rnd(i+7)-.5)*5);c.stroke();}c.restore();}
function inkText(c,s,x,y,size,{fill=INK,align='center',max,weight='900',font=SERIF,spacing=0}={}){c.font=weight+' '+size+'px '+font;c.textAlign=align;c.textBaseline='middle';if('letterSpacing' in c)c.letterSpacing=spacing+'px';c.fillStyle=fill;c.fillText(s,x,y,max);if('letterSpacing' in c)c.letterSpacing='0px';}
const fit=(c,s,size,max,weight='900',spacing=0)=>{c.font=weight+' '+size+'px '+SERIF;const w=c.measureText(s).width+spacing*s.length;return w>max?Math.max(14,size*max/w):size;};

/** Dải giấy dó có chữ mực + chấm son: thay chữ vàng phát sáng ở mỗi hồi. reveal 0→1 = nét bút quét từ trái sang. */
export function paperBanner(c,text,sub,x,y,size,a,reveal=1,seed=7){if(a<=.01)return;
 const t=String(text||''),s=sub?String(sub):'';c.save();c.globalAlpha=a;
 const fs=fit(c,t,size,760,'900',size*.12);c.font='900 '+fs+'px '+SERIF;const tw=Math.min(780,c.measureText(t).width+fs*.12*t.length);
 const w=Math.min(840,tw+fs*2.2),h=fs*1.55+(s?fs*.78:0),x0=x-w/2,y0=y-h/2;
 c.save();tornRect(c,x0,y0,w*clamp(reveal),h,seed);c.clip();
 c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=18;c.shadowOffsetY=6;tornRect(c,x0,y0,w,h,seed);c.fillStyle=paperFill(c,x0,y0,w,h);c.fill();c.shadowColor='transparent';
 fibers(c,x0,y0,w,h,seed);
 c.strokeStyle='rgba(27,24,19,.55)';c.lineWidth=1.4;c.strokeRect(x0+7,y0+6,w-14,h-12);
 inkText(c,t,x,y0+fs*.82,fs,{spacing:fs*.12,max:tw});
 if(s)inkText(c,s,x,y0+fs*1.62,fs*.5,{fill:SEAL,weight:'800',spacing:fs*.08,max:w-40});
 seal(c,x0+w-fs*.55,y0+h-fs*.5,fs*.42,['印'],1,-.12);
 c.restore();
 // đầu bút đang quét
 if(reveal<1){const bx=x0+w*clamp(reveal);c.fillStyle=INK;c.globalAlpha=a*.8;c.beginPath();c.ellipse(bx,y,6,h*.55,0,0,TAU);c.fill();}
 c.restore();}

/** Ấn triện son vuông: 1/2/4 chữ (ô 2×2), viền kép, mép mòn. */
export function seal(c,x,y,S,chars,a=1,rot=-.14){if(a<=.01)return;c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(rot);
 c.fillStyle=SEAL;c.beginPath();tornRect(c,-S/2,-S/2,S,S,31,S*.03);c.fill();
 c.strokeStyle=PAPER;c.lineWidth=Math.max(1,S*.035);c.strokeRect(-S*.4,-S*.4,S*.8,S*.8);
 c.fillStyle=PAPER;const n=chars.length;
 if(n===1)inkText(c,chars[0],0,S*.02,S*.62,{fill:PAPER});
 else if(n===2){inkText(c,chars[0],0,-S*.18,S*.34,{fill:PAPER});inkText(c,chars[1],0,S*.2,S*.34,{fill:PAPER});}
 else{const q=S*.19;[[1,-1],[1,1],[-1,-1],[-1,1]].forEach(([sx,sy],i)=>inkText(c,chars[i]||'',sx*q,sy*q+S*.01,S*.34,{fill:PAPER}));} // đọc phải→trái, trên→dưới như ấn cổ
 // vết mòn: chấm giấy lộ ra
 c.fillStyle='#e9dcc0';for(let i=0;i<14;i++){c.globalAlpha=(.25+rnd(i)*.35)*a;c.beginPath();c.arc((rnd(i+3)-.5)*S*.92,(rnd(i+9)-.5)*S*.92,S*(.008+rnd(i+5)*.018),0,TAU);c.fill();}
 c.restore();}

/** Mực bắn: giọt + vệt quanh điểm (x,y), u 0→1. */
export function inkSplash(c,x,y,R,u,seed,a=1,col=INK){if(u<=0||u>=1||a<=.01)return;c.save();c.fillStyle=col;const k=out3(u),fade=(1-u)**.6*a;
 for(let i=0;i<34;i++){const q=rnd(seed+i)*TAU,d=R*(.35+rnd(seed+i*2)*.9)*k,r=R*(.02+rnd(seed+i*3)*.06)*(1-u*.5);c.globalAlpha=fade*(.55+rnd(i)*.45);c.beginPath();c.arc(x+Math.cos(q)*d,y+Math.sin(q)*d*.8,r,0,TAU);c.fill();
  if(i%3===0){c.globalAlpha=fade*.5;c.lineWidth=r*.9;c.strokeStyle=col;c.lineCap='round';c.beginPath();c.moveTo(x+Math.cos(q)*d*.55,y+Math.sin(q)*d*.44);c.lineTo(x+Math.cos(q)*d,y+Math.sin(q)*d*.8);c.stroke();}}
 c.restore();}

/** Nền đêm thủy mặc: trời mực, trăng giấy dó, mây mực loang trôi, 3 lớp núi + sương (núi vẽ sẵn 1 lần). */
export function inkNight(c,H,sec,P,h,light){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07090d');g.addColorStop(.5,'#10161c');g.addColorStop(.8,'#0b0e12');g.addColorStop(1,'#040507');c.fillStyle=g;c.fillRect(-60,-60,1020,H+120);
 // trăng giấy + quầng
 const mx=640,my=H*.17;c.save();const mg=c.createRadialGradient(mx,my,0,mx,my,260);mg.addColorStop(0,'rgba(243,234,216,.22)');mg.addColorStop(1,'rgba(243,234,216,0)');c.fillStyle=mg;c.fillRect(mx-260,my-260,520,520);
 c.globalAlpha=.85;c.fillStyle=PAPER;c.beginPath();c.arc(mx,my,62,0,TAU);c.fill();c.globalAlpha=.16;c.fillStyle=INK_SOFT;for(let i=0;i<5;i++){c.beginPath();c.arc(mx-30+rnd(i)*50,my-25+rnd(i+4)*50,6+rnd(i+8)*12,0,TAU);c.fill();}c.restore();
 // mây mực loang (sáng mép) trôi ngang
 c.save();for(let i=0;i<(light?4:7);i++){const x=((rnd(i)*1200+sec*(8+i*3))%1300)-200,y=H*(.08+.07*i),w=260+rnd(i+2)*240,cg=c.createRadialGradient(x,y,w*.1,x,y,w*.6);cg.addColorStop(0,'rgba(60,70,78,.35)');cg.addColorStop(.75,'rgba(40,48,56,.18)');cg.addColorStop(1,'rgba(40,48,56,0)');c.fillStyle=cg;c.save();c.translate(x,y);c.scale(1,.32);c.translate(-x,-y);c.fillRect(x-w,y-w,w*2,w*2);c.restore();}c.restore();
 // núi sơn thủy (vẽ 1 lần)
 const key=String(H);if(!h.mount||h.mountKey!==key){h.mountKey=key;h.mount=makeSurface(900,Math.ceil(H));const m=h.mount?.getContext?.('2d');
  if(m){const layers=[[.56,'rgba(52,62,70,.55)',140,3],[.66,'rgba(30,37,43,.78)',190,7],[.78,'rgba(12,15,18,.95)',240,13]];
   for(const [base,col,amp,sd] of layers){m.fillStyle=col;m.beginPath();m.moveTo(-10,H);for(let x=-10;x<=910;x+=10){const u=x/900,y=H*base-amp*(Math.max(0,Math.sin(u*Math.PI*2.1+sd))**1.6*.8+.25*Math.sin(u*17+sd)*Math.sin(u*5+sd*2)+.12*rnd(Math.floor(x/10)+sd));m.lineTo(x,y);}m.lineTo(910,H);m.closePath();m.fill();
    const mist=m.createLinearGradient(0,H*base-amp*.2,0,H*base+60);mist.addColorStop(0,'rgba(200,205,205,0)');mist.addColorStop(.6,'rgba(200,205,205,.10)');mist.addColorStop(1,'rgba(200,205,205,0)');m.fillStyle=mist;m.fillRect(0,H*base-amp*.2,900,amp*.2+60);}
   // vài cây tùng mực trên sườn gần
   m.strokeStyle='rgba(8,10,12,.95)';m.fillStyle='rgba(8,10,12,.95)';for(const [tx,ty,ts] of [[90,H*.74,1],[790,H*.72,1.2],[700,H*.76,.8]]){m.lineWidth=5*ts;m.beginPath();m.moveTo(tx,ty+40*ts);m.quadraticCurveTo(tx+10*ts,ty,tx-6*ts,ty-50*ts);m.stroke();for(let k=0;k<4;k++){m.beginPath();m.ellipse(tx-6*ts+(k%2?22:-22)*ts,ty-50*ts+k*16*ts,28*ts,7*ts,(k%2?-.2:.2),0,TAU);m.fill();}}}}
 if(h.mount)c.drawImage(h.mount,0,0,900,H);
 // sương trôi trước núi
 c.save();for(let i=0;i<(light?2:4);i++){const y=H*(.6+.06*i),x=((sec*(14+i*6)+i*300)%1400)-250,mg2=c.createRadialGradient(x,y,0,x,y,320);mg2.addColorStop(0,'rgba(210,214,212,.08)');mg2.addColorStop(1,'rgba(210,214,212,0)');c.fillStyle=mg2;c.save();c.translate(x,y);c.scale(1,.25);c.translate(-x,-y);c.fillRect(x-320,y-320,640,640);c.restore();}c.restore();
 // tro giấy lơ lửng (thay sao)
 for(let i=0;i<(light?20:45);i++){const u=(sec*.03+rnd(i))%1,x=(rnd(i+11)*960+Math.sin(sec*.4+i)*30)%960-30,y=H*(1-u);c.globalAlpha=.25+.35*Math.sin(u*Math.PI);c.fillStyle=i%4?'#c9bfa8':P.main;c.fillRect(x,y,2+rnd(i)*2,2+rnd(i+3)*2);}c.globalAlpha=1;
}

/** Mở màn: giấy dó trắng bị mực loang ăn dần thành đêm (0→1). */
export function inkOpen(c,H,u,seed,h){if(u>=1)return;
 // vẽ giấy lên lớp riêng rồi khoét vết mực loang (destination-out CHỈ trên lớp riêng) → dán đè lên cảnh đêm
 if(!h.paper||h.paperKey!==H){h.paper=makeSurface(900,Math.ceil(H));h.paperKey=H;}const pc=h.paper?.getContext?.('2d');if(!pc)return;
 pc.setTransform(1,0,0,1,0,0);pc.globalCompositeOperation='source-over';pc.globalAlpha=1;pc.clearRect(0,0,900,H);pc.fillStyle=paperFill(pc,0,0,900,H);pc.fillRect(0,0,900,H);fibers(pc,0,0,900,H,3);
 pc.globalCompositeOperation='destination-out';const k=out3(seg(u,0,.9));
 // vết mực loang mềm: lõi đặc + mép thấm (gradient) + tua nhỏ quanh mép
 for(let i=0;i<10;i++){const x=450+(rnd(seed+i)-.5)*720,y=H*(.15+rnd(seed+i*2)*.7),R=(150+rnd(i+4)*300)*k*(.7+.3*seg(u,i*.05,i*.05+.5));if(R<=2)continue;
  const g=pc.createRadialGradient(x,y,R*.55,x,y,R*1.15);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.6,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');pc.fillStyle=g;pc.beginPath();pc.arc(x,y,R*1.15,0,TAU);pc.fill();
  for(let j=0;j<7;j++){const q=rnd(i*9+j)*TAU,d=R*(.95+rnd(j+i)*.25),rr=R*(.08+rnd(i+j*3)*.12);pc.beginPath();pc.arc(x+Math.cos(q)*d,y+Math.sin(q)*d,rr,0,TAU);pc.fillStyle='rgba(0,0,0,.9)';pc.fill();}}
 c.save();c.globalAlpha=1-seg(u,.75,1);c.drawImage(h.paper,0,0,900,H);c.restore();
}

/** Khung impact mực: giấy trắng + gai mực đen tỏa từ điểm giáng + vòng son. u 0→1 trong ~0,32 s. */
export function inkImpact(c,H,x,y,u,seed){if(u<=0||u>=1)return;c.save();c.globalAlpha=1;
 c.fillStyle=PAPER;c.fillRect(-60,-60,1020,H+120);
 c.fillStyle=INK;for(let i=0;i<46;i++){const q=rnd(seed+i)*TAU,w=.012+rnd(i+seed*2)*.05,L=H*(.5+rnd(i+3)*.9);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(q-w)*L,y+Math.sin(q-w)*L);c.lineTo(x+Math.cos(q+w)*L,y+Math.sin(q+w)*L);c.closePath();c.fill();}
 c.beginPath();c.arc(x,y,90+u*160,0,TAU);c.fill();
 c.strokeStyle=SEAL;c.lineWidth=14*(1-u)+3;c.beginPath();c.arc(x,y,140+u*420,0,TAU);c.stroke();
 c.restore();}

/** Thẻ giấy nhỏ (cảnh giới bay ngược ở hồi Hồi tưởng). */
export function paperTag(c,s,x,y,size,a,hl=false,seed=1){if(a<=.01)return;c.save();c.globalAlpha=a;c.font='800 '+size+'px '+SERIF;const w=c.measureText(s).width+size*1.2,h=size*1.55;
 tornRect(c,x-w/2,y-h/2,w,h,seed,size*.12);c.fillStyle=hl?'#fff4dc':paperFill(c,x-w/2,y-h/2,w,h);c.fill();
 c.lineWidth=Math.max(1,size*.05);c.strokeStyle=hl?SEAL:'rgba(27,24,19,.5)';c.stroke();
 inkText(c,s,x,y+size*.04,size,{fill:hl?SEAL:INK,weight:'800'});c.restore();}

/** Khói mực: thân tan thành vệt mực bay lên (vẽ source-over, tối). */
export function inkSmoke(c,cx,feet,scale,u,seed,light,toY){if(u<=0||u>=1)return;c.save();const N=light?40:90;
 for(let i=0;i<N;i++){const born=rnd(seed+i)*.7,k=seg(u,born,born+.5);if(k<=0||k>=1)continue;const sx=cx+(rnd(i*3)-.5)*170,sy=feet-rnd(i*5)*scale*130,ty=toY??sy-300,x=sx+Math.sin(k*5+i)*40*k,y=sy+(ty-sy)*out3(k),r=(10+rnd(i+2)*26)*(.4+k*1.4);
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(14,12,10,.55)');g.addColorStop(1,'rgba(14,12,10,0)');c.globalAlpha=(1-k)*.9;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 c.restore();}

/** Ân điển = thẻ giấy dó 2 cột, mỗi thẻ: tiêu đề mực + giá trị son + ấn nhỏ. Hiện lần lượt (nét bút quét). */
export function giftCards(c,H,rows,sec,start,end,step=.45){const W=410,Hc=86,gap=14,x0=450-W-gap/2,y0=H*.735;
 rows.forEach(([title,val,glyph],i)=>{const u=seg(sec,start+i*step,start+i*step+.42),al=out3(u)*(1-seg(sec,end-.8,end-.2));if(al<=0)return;
  const col=i%2,row=Math.floor(i/2),x=x0+col*(W+gap),y=y0+row*(Hc+gap)+(1-out3(u))*24;c.save();c.globalAlpha=al;
  c.save();tornRect(c,x,y,W*clamp(u*1.2),Hc,60+i*13);c.clip();c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=14;c.shadowOffsetY=5;tornRect(c,x,y,W,Hc,60+i*13);c.fillStyle=paperFill(c,x,y,W,Hc);c.fill();c.shadowColor='transparent';fibers(c,x,y,W,Hc,i*7);
   c.strokeStyle='rgba(27,24,19,.45)';c.lineWidth=1.2;c.strokeRect(x+6,y+6,W-12,Hc-12);
   seal(c,x+46,y+Hc/2,52,[glyph],1,-.1);
   const tsz=fit(c,title,27,W-110,'900');inkText(c,title,x+86,y+30,tsz,{align:'left',max:W-110});
   inkText(c,val,x+86,y+62,21,{align:'left',fill:SEAL,weight:'800',font:'"Segoe UI",Arial,sans-serif',max:W-110});c.restore();
  c.restore();});}

/** Đóng ấn kết: ấn son lớn "N世 輪迴" đập xuống + mực bắn, rồi danh hiệu + tên trên dải giấy. */
export function finalStamp(c,H,n,title,name,sec,at,end,seed){const u=seg(sec,at,at+.3),a=Math.min(1,u*3)*(1-seg(sec,end-.8,end-.2));if(a<=0)return;
 const S=230*(1+1.6*(1-out3(u))),sx=165,sy=H*.33;
 inkSplash(c,sx,sy,220,seg(sec,at+.22,at+1.1),seed,a*.9);inkSplash(c,sx,sy,150,seg(sec,at+.25,at+.9),seed+3,a*.7,SEAL);
 seal(c,sx,sy,S,[hanNum(n),'世','輪','迴'],a*(u<.3?.85:1),-.16);
 paperBanner(c,String(title).toUpperCase(),String(name||''),450,H*.165,48,a,seg(sec,at+.35,at+.85),seed+9);}
