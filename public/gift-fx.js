import {comboIntensity} from './gift-combos.js';
// Hoạt cảnh riêng cho từng loại quà (xem gift-kinds.js). Vẽ bằng Canvas trong tọa độ cảnh (rộng 900).
// k: tiến độ 0→1 trong ~5,5 giây; p: nhân vật người tặng {x,y,scale}; H: chiều cao cảnh.
const TAU=Math.PI*2;
const fade=k=>k<.1?k/.1:k>.85?(1-k)/.15:1;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const ease=k=>1-(1-k)**3;

function heart(c,x,y,s,color){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=color;c.beginPath();c.moveTo(0,4);c.bezierCurveTo(-10,-4,-6,-13,0,-7);c.bezierCurveTo(6,-13,10,-4,0,4);c.fill();c.restore();}
function glow(c,x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function petalRain(c,H,k,colors,n=36){for(let i=0;i<n;i++){const x=rnd(i)*940-20+Math.sin(k*6+i)*25,y=-30+((rnd(i+50)*.6+k*1.4)%1.4)*H*.75,a=k*8+i;c.save();c.translate(x,y);c.rotate(a);c.fillStyle=colors[i%colors.length];c.beginPath();c.ellipse(0,0,7,3.5,0,0,TAU);c.fill();c.restore();}}
function rose(c,x,y,s,color,dark){c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='#3f8a4f';for(const d of [-1,1]){c.beginPath();c.ellipse(d*16,10,14,6,d*.5,0,TAU);c.fill();}
  for(let r=5;r>=1;r--){const n=r+3;for(let i=0;i<n;i++){const a=i/n*TAU+r*.7;c.fillStyle=r%2?color:dark;c.beginPath();c.ellipse(Math.cos(a)*r*2.6,Math.sin(a)*r*2.2,r*3.2,r*2.4,a,0,TAU);c.fill();}}
  c.restore();}
function quadruped(c,x,y,s,t,{body,ear,face,tail,floppy}){c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,18,26,5,0,0,TAU);c.fill();
  const sway=Math.sin(t*.008)*.5;c.strokeStyle=tail;c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(18,4);c.quadraticCurveTo(34,-6+sway*10,30,-22+sway*8);c.stroke();
  c.fillStyle=body;c.beginPath();c.ellipse(4,4,22,14,0,0,TAU);c.fill();
  c.beginPath();c.ellipse(-18,-10,13,12,0,0,TAU);c.fill();
  c.fillStyle=ear;if(floppy){c.beginPath();c.ellipse(-27,-12,5,9,.4,0,TAU);c.ellipse(-9,-12,5,9,-.4,0,TAU);c.fill();}
  else{c.beginPath();c.moveTo(-28,-14);c.lineTo(-26,-28);c.lineTo(-19,-19);c.closePath();c.moveTo(-15,-20);c.lineTo(-9,-28);c.lineTo(-8,-14);c.closePath();c.fill();}
  c.fillStyle=face;c.beginPath();c.arc(-22,-11,2,0,TAU);c.arc(-14,-11,2,0,TAU);c.fill();c.beginPath();c.arc(-18,-6,1.6,0,TAU);c.fill();
  c.fillStyle=body;for(const lx of [-10,-2,10,18]){c.fillRect(lx-3,12,6,8);}
  c.restore();}

export function drawGiftFx(c,e,t,k,p,H){
  const a=fade(k);if(a<=0)return;c.save();c.globalAlpha=a;
  const hx=p.x,hy=p.y-(p.scale||1.4)*40,topY=p.y-(p.scale||1.4)*100-34; // v56: topY = trên đỉnh đầu, hoa không che mặt
  switch(e.kind){
    case 'rose':{petalRain(c,H,k,['#e8354d','#ff6b81','#c41e3a']);const s=ease(Math.min(1,k*2.5))*1.6*comboIntensity(e);c.save();c.globalCompositeOperation='screen';glow(c,hx,topY,70,'255,90,120',.35);c.restore();rose(c,hx,topY-Math.sin(t*.003)*4,s,'#e8354d','#a3122b');break;}
    case 'flower':{petalRain(c,H,k,['#ffb3c7','#ffe27a','#ffffff','#c6a8ff']);for(let i=0;i<5;i++){const ang=i/5*TAU+t*.001,r=55*ease(Math.min(1,k*2));rose(c,hx+Math.cos(ang)*r*1.3,topY+6+Math.sin(ang)*r*.35,1.1,['#ffb3c7','#ffe27a','#fff','#c6a8ff','#ff8fb1'][i],'#d0607e');}break;}
    case 'heart':{c.globalCompositeOperation='screen';for(let i=0;i<22;i++){const kk=(k*1.3+rnd(i)*.5)%1,x=hx+(rnd(i+9)-.5)*140+Math.sin(kk*8+i)*14,y=hy+20-kk*H*.42;heart(c,x,y,1.4+rnd(i+3)*1.6,i%2?'#ff5c8a':'#ff9ec0');}glow(c,hx,hy,110,'255,110,160',.3);break;}
    case 'cat':case 'beast':case 'dog':{
      const dog=e.kind==='dog',beast=e.kind==='beast',from=hx>450?980:-80,tx=hx+(hx>450?95:-95),walk=ease(Math.min(1,k/.45)),x=from+(tx-from)*walk,bob=walk<1?Math.abs(Math.sin(t*.02))*6:0;
      for(let i=0;i<8;i++){const pk=i/8;if(pk>walk)break;c.fillStyle='rgba(255,240,200,.35)';c.beginPath();c.arc(from+(tx-from)*pk,p.y+16+(i%2)*6,3.5,0,TAU);c.fill();}
      c.save();c.globalCompositeOperation='screen';glow(c,x,p.y,70,dog?'255,200,120':beast?'180,255,200':'210,190,255',.4);c.restore();
      c.save();if(from>tx){c.translate(x,0);c.scale(-1,1);c.translate(-x,0);}
      quadruped(c,x,p.y-bob,dog?2.3:beast?2.6:2.2,t,dog?{body:'#f0a64a',ear:'#e08a2c',face:'#3a2410',tail:'#f6d2a0',floppy:false}:beast?{body:'#f4f4f0',ear:'#2b2b2b',face:'#111',tail:'#2b2b2b',floppy:true}:{body:'#f3eefc',ear:'#c9b6f2',face:'#5a3f8f',tail:'#d9c8ff',floppy:false});c.restore();
      if(walk>=1){for(let i=0;i<10;i++){const ang=t*.003+i/10*TAU;c.fillStyle='#fff6c8';c.beginPath();c.arc(x+Math.cos(ang)*40,p.y-20+Math.sin(ang)*14,1.8,0,TAU);c.fill();}}
      break;}
    case 'food':{const sp=k<.6?0:ease((k-.6)/.4),x=hx,y=hy-90+sp*70,r=38*(1-sp*.7);c.save();c.globalCompositeOperation='screen';glow(c,x,y,80,'255,210,150',.45);c.restore();
      c.save();c.translate(x,y);c.rotate(t*.002);c.lineWidth=r*.55;c.strokeStyle='#e9b26a';c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.lineWidth=r*.42;c.strokeStyle='#ff8fb8';c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();
      for(let i=0;i<10;i++){const ang=i/10*TAU;c.fillStyle=['#fff','#7fe3ff','#ffe27a'][i%3];c.fillRect(Math.cos(ang)*r-2,Math.sin(ang)*r-1,4,2);}c.restore();
      for(let i=0;i<14;i++){const ang=i/14*TAU+t*.004,rr=50*(1-sp);c.fillStyle='#ffe9a8';c.beginPath();c.arc(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr*.6,2,0,TAU);c.fill();}break;}
    case 'perfume':{c.globalCompositeOperation='screen';for(let j=0;j<3;j++){c.strokeStyle=['rgba(214,160,255,.55)','rgba(255,170,220,.5)','rgba(170,220,255,.45)'][j];c.lineWidth=10-j*2;c.beginPath();for(let i=0;i<=60;i++){const u=i/60,ang=u*TAU*2+t*.003+j*2,r=30+u*90*ease(k*1.5>1?1:k*1.5);const x=hx+Math.cos(ang)*r,y=hy-u*120+Math.sin(ang)*r*.35;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}glow(c,hx,hy-40,130,'220,170,255',.3);break;}
    case 'crown':{const d=ease(Math.min(1,k/.5)),y=-60+(hy-62+60)*d,x=hx;c.save();c.globalCompositeOperation='screen';glow(c,x,y,70,'255,215,110',.55);c.restore();
      c.save();c.translate(x,y);c.scale(2.4,2.4);c.fillStyle='#f5c542';c.strokeStyle='#fff1b0';c.lineWidth=1.2;c.beginPath();c.moveTo(-22,8);c.lineTo(-24,-10);c.lineTo(-12,0);c.lineTo(0,-16);c.lineTo(12,0);c.lineTo(24,-10);c.lineTo(22,8);c.closePath();c.fill();c.stroke();
      for(const [gx,col] of [[-12,'#e8354d'],[0,'#4fc3f7'],[12,'#7ee08a']]){c.fillStyle=col;c.beginPath();c.arc(gx,3,2.8,0,TAU);c.fill();}c.restore();
      if(d>=1){for(let i=0;i<3;i++){c.strokeStyle=`rgba(255,220,120,${.5-i*.15})`;c.lineWidth=2;c.beginPath();c.arc(x,y+30,40+i*18+Math.sin(t*.004)*4,Math.PI*1.1,Math.PI*1.9);c.stroke();}}break;}
    case 'lion':{const s=ease(Math.min(1,k*2));c.save();c.translate(hx,hy-60);c.scale(s*2.2,s*2.2);
      for(let i=0;i<18;i++){const ang=i/18*TAU;c.fillStyle=i%2?'#d9822b':'#b8601a';c.beginPath();c.ellipse(Math.cos(ang)*26,Math.sin(ang)*26,13,8,ang,0,TAU);c.fill();}
      c.fillStyle='#f2b866';c.beginPath();c.arc(0,0,22,0,TAU);c.fill();c.fillStyle='#3a2410';c.beginPath();c.arc(-8,-5,2.6,0,TAU);c.arc(8,-5,2.6,0,TAU);c.fill();
      c.fillStyle='#7a3b12';c.beginPath();c.moveTo(-5,4);c.lineTo(5,4);c.lineTo(0,9);c.closePath();c.fill();c.strokeStyle='#3a2410';c.lineWidth=2;c.beginPath();c.arc(0,12,6,0,Math.PI);c.stroke();c.restore();
      for(let i=0;i<3;i++){const rk=(k*2+i/3)%1;c.strokeStyle=`rgba(255,200,120,${(1-rk)*.6})`;c.lineWidth=4;c.beginPath();c.arc(hx,hy-60,40+rk*220,0,TAU);c.stroke();}break;}
    case 'cosmos':{c.globalCompositeOperation='screen';const cx=450,cy=H*.2;glow(c,cx,cy,260,'120,140,255',.35*a);
      for(let arm=0;arm<3;arm++)for(let i=0;i<70;i++){const u=i/70,ang=u*TAU*1.6+arm*TAU/3+t*.0012,r=u*240*ease(Math.min(1,k*1.6));c.fillStyle=`rgba(${200+u*55|0},${200+u*30|0},255,${.9-u*.6})`;c.beginPath();c.arc(cx+Math.cos(ang)*r,cy+Math.sin(ang)*r*.45,1.2+(1-u)*2.2,0,TAU);c.fill();}
      c.strokeStyle='rgba(200,210,255,.6)';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy);c.lineTo(hx,hy);c.stroke();glow(c,hx,hy,60,'180,200,255',.45);break;}
    case 'dragon':{c.globalCompositeOperation='screen';const n=26;for(let i=n;i>=0;i--){const u=i/n,x=-120+(k*1.5-u*.35)*1100,y=H*.22+Math.sin(x*.012+t*.002)*60;c.fillStyle=i===0?'#ffe7a3':`rgba(255,${190-u*80|0},${70+u*40|0},.9)`;c.beginPath();c.arc(x,y,(i===0?18:14*(1-u*.6)),0,TAU);c.fill();}glow(c,hx,hy,90,'255,200,90',.4);break;}
    case 'vessel':{const x=-160+k*1220,y=H*.17+Math.sin(t*.002)*10;c.save();c.translate(x,y);c.scale(1.5,1.5);c.fillStyle='#8b5a2b';c.beginPath();c.moveTo(-50,0);c.quadraticCurveTo(0,26,50,0);c.lineTo(40,-6);c.lineTo(-40,-6);c.closePath();c.fill();
      c.strokeStyle='#5a3a1a';c.lineWidth=3;c.beginPath();c.moveTo(0,-6);c.lineTo(0,-56);c.stroke();c.fillStyle='#f3ead2';c.beginPath();c.moveTo(2,-54);c.quadraticCurveTo(34,-34,2,-10);c.closePath();c.fill();c.fillStyle='#d94b4b';c.fillRect(-2,-62,14,7);c.restore();
      c.globalCompositeOperation='screen';for(let i=0;i<20;i++){glow(c,x-60-i*14,y+6+Math.sin(i+t*.01)*4,10,'200,230,255',.3*(1-i/20));}break;}
    case 'fish':{c.globalCompositeOperation='screen';for(let i=0;i<6;i++){const u=(k*1.2+i/6)%1,x=hx-160+u*320,y=hy-60+Math.sin(u*TAU*1.5+i)*40-i*10;glow(c,x,y,22,i%2?'120,220,255':'255,170,220',.6);
      c.save();c.translate(x,y);c.fillStyle=i%2?'#9fe7ff':'#ffc2e2';c.beginPath();c.ellipse(0,0,12,6,0,0,TAU);c.fill();c.beginPath();c.moveTo(-10,0);c.lineTo(-20,-7);c.lineTo(-20,7);c.closePath();c.fill();c.restore();}break;}
    case 'firework':{c.globalCompositeOperation='screen';for(let b=0;b<4;b++){const bk=(k*1.4-b*.18);if(bk<0||bk>1)continue;const bx=150+b*200,by=H*(.12+(b%2)*.08);for(let i=0;i<24;i++){const ang=i/24*TAU,r=ease(bk)*90;c.fillStyle=`hsla(${b*80+i*4},100%,70%,${1-bk})`;c.beginPath();c.arc(bx+Math.cos(ang)*r,by+Math.sin(ang)*r,2.6,0,TAU);c.fill();}}break;}
    case 'blessing':{c.globalCompositeOperation='screen';for(let i=0;i<5;i++){const x=120+i*165+Math.sin(t*.001+i)*20,w=40+Math.sin(t*.003+i)*10,g=c.createLinearGradient(x,0,x,H*.75);g.addColorStop(0,`rgba(255,226,140,${.55*a})`);g.addColorStop(1,'rgba(255,226,140,0)');c.fillStyle=g;c.fillRect(x-w/2,0,w,H*.75);}
      for(let i=0;i<60;i++){const x=rnd(i)*900,y=((rnd(i+7)+k*1.2)%1)*H*.8;c.fillStyle='#ffe9a8';c.beginPath();c.arc(x,y,1.5+rnd(i+3)*2.5,0,TAU);c.fill();}
      c.globalCompositeOperation='source-over';const s=ease(Math.min(1,k*3));c.save();c.translate(450,H*.12);c.scale(s,s);c.font='900 54px Georgia';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#4a3206';c.strokeText('天道賜福',0,0);c.fillStyle='#ffe08a';c.fillText('天道賜福',0,0);c.restore();break;}
    case 'gg':{const s=ease(Math.min(1,k*3));c.save();c.translate(hx,hy-80);c.scale(s,s);c.font='900 64px Georgia';c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='#5a3a08';c.strokeText('GG',0,0);c.fillStyle='#ffd76a';c.fillText('GG',0,0);c.restore();
      c.globalCompositeOperation='screen';for(let i=0;i<5;i++){const ang=-.6+i*.3,len=140*s;c.strokeStyle='rgba(190,235,255,.7)';c.lineWidth=2;c.beginPath();c.moveTo(hx,hy-80);c.lineTo(hx+Math.cos(ang)*len,hy-80+Math.sin(ang)*len*.4-60);c.stroke();}break;}
  }
  c.restore();
}
