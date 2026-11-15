// Thần Vương v2 — "Sơn Hà Xã Tắc Đồ" (15/11/2026). 40 s; nổ 34,4; đổi skin 34,75. Phong cách thủy mặc (khác mọi cảnh trước).
// Trời hóa giấy dó, 3 giọt mực loang (3 cú) → bút lông vẽ 6 dãy núi + 1 dòng sông (7 cú) → thư pháp 山河社稷 + ấn đỏ + vầng nhật đỏ →
// tranh sống dậy: núi lên màu ngọc, 4 hạc mực bay vọt ra khỏi tranh (4 cú) → bức họa cuộn lại từ hai mép, cuộn trục bay vào người →
// mực xoáy (6 nhịp) → tối → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(17);
export const TV17=Object.freeze({...TM,drops:[.2,.9,1.6],strokes:[3,4.4,5.8,7.2,8.6,10],river:11,chars:[12,12.8,13.6,14.4],seal:15.2,sun:16.2,cranes:[18.5,19.5,20.5,21.5],color:[23,24],roll:25,rollDone:26.4,fly:27.5,ink:[28.2,29,29.8,30.6,31.4,32.2,33]});
const T=TV17,INK='#14110e',PAPER='#efe4cc',JADE='#3aa088',RED='#c8282a';
export const TV17_HITS=Object.freeze([...T.drops.map((a,i)=>[a,1.1+i*.15]),...T.strokes.map((a,i)=>[a+1.1,1+i*.08]),[T.river+1,1.2],...T.chars.map((a,i)=>[a+.6,.8+i*.08]),[T.seal,1.8],[T.sun,1.2],
 ...T.cranes.map((a,i)=>[a,1.3+i*.12]),...T.color.map((a,i)=>[a,1+i*.2]),[T.roll,1.2],[T.rollDone,1.4],[T.fly+.6,1.9],...T.ink.map((a,i)=>[a,.7+i*.05]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,3]]);
const BEATS=[[0,'Mặc nhiễm thanh thiên'],[3,'Bút họa sơn hà'],[12,'Đề tự xã tắc'],[18.5,'Họa trung sinh linh'],[25,'Quyển thu sơn hà'],[28.2,'Mặc khí quy thân'],[T.impact,'Phá họa'],[T.reveal,'Thần Vương hiện thân']];
const MTN=[[.5,.30,'#8a8478',.55],[.5,.36,'#6a645a',.62],[.5,.42,'#4a463e',.7],[.5,.27,'#a09a8c',.45],[.5,.47,'#2a2620',.8],[.5,.52,'#1a1612',.9]];
function paperSprite(H){return surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f4ead4');g.addColorStop(1,'#e2d4b4');c.fillStyle=g;c.fillRect(0,0,900,H);
 c.strokeStyle='#c8b894';c.globalAlpha=.25;for(let i=0;i<260;i++){const x=rnd(i)*900,y=rnd(i+7)*H,l=10+rnd(i+3)*40;c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+l,y+(rnd(i+9)-.5)*6);c.stroke();}
 c.globalAlpha=.12;c.fillStyle='#a08860';for(let i=0;i<60;i++){const x=rnd(i+40)*900,y=rnd(i+80)*H,r=20+rnd(i)*80;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}});}
function mountainSprite(i,colored){const [,yy,col,al]=MTN[i];return surface(1000,420,c=>{const base=320,pts=[];let h=0;for(let x=0;x<=1000;x+=20){h=Math.max(30,Math.min(260,h+(rnd(i*97+x)-.5)*70+(x<500?6:-6)*(i%2?1:-1)));pts.push([x,base-h-(Math.sin(x*.008+i)*40)]);}
 c.beginPath();c.moveTo(0,420);pts.forEach(([x,y])=>c.lineTo(x,y));c.lineTo(1000,420);c.closePath();const g=c.createLinearGradient(0,base-260,0,420);
 if(colored){g.addColorStop(0,['#5ab89a','#3a8a78','#2a6a64','#7ac8b0','#1e5a50','#16443e'][i]);g.addColorStop(.6,'#2a4a46a0');g.addColorStop(1,'#2a4a4600');}else{g.addColorStop(0,col);g.addColorStop(.55,col+'b0');g.addColorStop(1,col+'00');}
 c.fillStyle=g;c.globalAlpha=al;c.fill();c.globalAlpha=Math.min(1,al+.2);c.strokeStyle=colored?'#1e4a42':INK;c.lineWidth=3;c.beginPath();pts.forEach(([x,y],k)=>k?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 c.globalAlpha=.35;c.fillStyle=INK;for(let k=0;k<70;k++){const [x,y]=pts[Math.floor(rnd(k+i*5)*pts.length)];c.fillRect(x+(rnd(k)-.5)*10,y+rnd(k+3)*40,2,6);}});}
function brushSprite(){return surface(60,260,c=>{c.translate(30,0);const g=c.createLinearGradient(-8,0,8,0);g.addColorStop(0,'#5a3a1a');g.addColorStop(.5,'#c89058');g.addColorStop(1,'#5a3a1a');c.fillStyle=g;c.fillRect(-7,0,14,180);c.fillStyle='#e8d8b0';c.fillRect(-9,176,18,10);
 c.fillStyle=INK;c.beginPath();c.moveTo(-10,186);c.quadraticCurveTo(-12,226,0,258);c.quadraticCurveTo(12,226,10,186);c.closePath();c.fill();});}
function craneSprite(){return surface(160,90,c=>{c.translate(80,45);c.fillStyle=INK;c.strokeStyle=INK;c.lineWidth=3;c.beginPath();c.ellipse(0,0,30,9,0,0,TAU);c.fill();c.beginPath();c.moveTo(26,-2);c.quadraticCurveTo(50,-14,62,-6);c.stroke();c.fillStyle=RED;c.beginPath();c.arc(60,-7,4,0,TAU);c.fill();
 c.fillStyle=INK;c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-20,-40,-60,-38);c.quadraticCurveTo(-30,-18,-10,2);c.closePath();c.fill();c.globalAlpha=.6;c.beginPath();c.moveTo(-28,4);c.lineTo(-54,10);c.stroke();});}
function sealSprite(){return surface(110,110,c=>{c.translate(55,55);c.fillStyle=RED;c.fillRect(-46,-46,92,92);c.fillStyle='#fff2e2';c.font='700 60px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.fillText('王',0,4);c.strokeStyle='#fff2e2';c.lineWidth=3;c.strokeRect(-38,-38,76,76);});}
function assets(scene,H){if(scene.thanVuongAssets?.H===H)return scene.thanVuongAssets;const out={H,paper:paperSprite(H),mtn:MTN.map((_,i)=>mountainSprite(i,false)),mtnC:MTN.map((_,i)=>mountainSprite(i,true)),brush:brushSprite(),crane:craneSprite(),seal:sealSprite()};scene.thanVuongAssets=out;return out;}
const rollClip=s=>{const u=ease((s.T-T.roll)/(T.rollDone-T.roll));return {l:mix(0,450,u),r:mix(900,450,u),u};};
function sky(c,s){const T0=s.T,x=s.x,pk=ease((T0-T.drops[0])/1.4)*(1-ease((T0-T.fly)/.4))*(T0<T.impact?1:0);if(pk<=0)return;const R=rollClip(s);
 c.save();c.beginPath();c.rect(R.l,0,R.r-R.l,s.H);c.clip();c.globalAlpha=pk*.92;c.drawImage(x.paper,0,0,900,s.H);c.globalAlpha=pk;
 // giọt mực loang
 T.drops.forEach((at,i)=>{const age=T0-at;if(age<0)return;const px=[260,640,450][i],py=s.H*[.2,.16,.1][i],r=ease(age/1.2)*(70+i*20);c.fillStyle=INK;c.globalAlpha=pk*.75*(1-ease((T0-T.strokes[0])/4));for(let j=0;j<12;j++){const a=j/12*TAU+i,rr=r*(.6+rnd(j+i*9)*.5);c.beginPath();c.arc(px+Math.cos(a)*rr*.5,py+Math.sin(a)*rr*.5,rr*.45,0,TAU);c.fill();}});
 c.globalAlpha=pk;
 // núi
 T.strokes.forEach((at,i)=>{const u=clamp((T0-at)/1.2);if(u<=0)return;const y=s.H*MTN[i][1]-260,col=ease((T0-T.color[0]-i*.15)/1.6);c.save();c.beginPath();c.rect(0,0,900*u,s.H);c.clip();c.drawImage(x.mtn[i],-50,y,1000,420);if(col>0){c.globalAlpha=pk*col*.85;c.drawImage(x.mtnC[i],-50,y,1000,420);}c.restore();
  if(u<1){c.save();c.translate(900*u,y+200);c.rotate(.5);c.drawImage(x.brush,-30,-250);c.restore();}});
 // sông
 {const u=clamp((T0-T.river)/1);if(u>0){c.save();c.strokeStyle=ease((T0-T.color[1])/1.5)>0?'#7ac8e8':'#5a564e';c.globalAlpha=pk*.6;c.lineWidth=18;c.lineCap='round';c.beginPath();for(let j=0;j<=40*u;j++){const v=j/40,xx=100+v*700,yy=s.H*.5+Math.sin(v*6)*40-v*30;j?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();c.restore();}}
 // thư pháp + ấn + vầng nhật
 c.fillStyle=INK;c.font='700 70px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';T.chars.forEach((at,i)=>{const u=clamp((T0-at)/.6);if(u<=0)return;const cx=800*(s.dir>0?1:0)+(s.dir>0?0:100),cy=s.H*.09+i*80;c.save();c.beginPath();c.rect(cx-45,cy-40,90,80*u);c.clip();c.globalAlpha=pk;c.fillText('山河社稷'[i],cx,cy);c.restore();});
 if(T0>=T.seal){const u=back((T0-T.seal)/.2),cx=s.dir>0?800:100;c.save();c.globalAlpha=pk;c.translate(cx,s.H*.09+4*80+10);c.scale(mix(2,1,clamp(u)),mix(2,1,clamp(u)));c.drawImage(x.seal,-40,-40,80,80);c.restore();}
 if(T0>=T.sun){const u=ease((T0-T.sun)/.8);c.save();c.globalAlpha=pk*u*.85;c.fillStyle=RED;c.beginPath();c.arc(s.dir>0?250:650,s.H*.11,46,0,TAU);c.fill();c.restore();}
 c.restore();
 // trục cuộn hai mép
 if(R.u>0&&R.u<1){for(const xx of [R.l,R.r]){c.save();c.fillStyle='#6a4a24';c.fillRect(xx-10,0,20,s.H*.62);c.fillStyle='#d8b070';c.fillRect(xx-14,-4,28,12);c.fillRect(xx-14,s.H*.62-8,28,12);c.restore();}}}
function backLayer(c,s){const T0=s.T,x=s.x,a=s.a;
 if(s.revealed){const k=s.after*s.fade;c.save();c.globalAlpha=k*.9;c.translate(450,s.head-110);c.drawImage(x.paper,0,0,450,s.H/2,-120,-60,240,120);c.drawImage(x.mtnC[2],-120,-70,240,100);c.drawImage(x.mtnC[4],-120,-50,240,100);c.fillStyle='#6a4a24';c.fillRect(-128,-64,10,128);c.fillRect(118,-64,10,128);c.restore();
  for(let i=0;i<3;i++){const ang=s.clock*.6+i*TAU/3,px=450+Math.cos(ang)*230,py=s.head+40+Math.sin(ang)*60;c.save();c.globalAlpha=k*.85;c.translate(px,py);c.scale(Math.cos(ang)>0?-.45:.45,.45);c.drawImage(x.crane,-80,-45);c.restore();}return;}
 // hạc bay ra khỏi tranh về phía người xem
 T.cranes.forEach((at,i)=>{const age=T0-at;if(age<0||age>4)return;const u=ease(age/4),sx=[200,700,330,580][i],sy=s.H*[.24,.2,.32,.3][i],ex=sx+(sx<450?-260:260),ey=sy-80+u*200,sc=mix(.7,2.6,u),flap=Math.sin(age*9)*.25;
  c.save();c.globalAlpha=1-ease((age-3)/1);c.translate(mix(sx,ex,u),mix(sy,ey,u));c.scale(sx<450?-sc:sc,sc*(1+flap));c.drawImage(x.crane,-80,-45);c.restore();if(age<.6){ring(c,sx,sy,20+age*260,'#ffffff',5*(1-age/.6),(1-age/.6)*.8);}});
 // cuộn trục bay vào người
 if(T0>=T.rollDone&&T0<T.fly+.8){const u=ease((T0-T.fly)/.6);c.save();c.translate(450,mix(s.H*.3,s.belly,u));c.scale(1-u*.85,1-u*.85);c.fillStyle='#6a4a24';c.fillRect(-14,-s.H*.3,28,s.H*.6*(1-u*.5));c.fillStyle='#d8b070';c.fillRect(-20,-s.H*.3-8,40,14);c.restore();halo(c,a.glow,450,mix(s.H*.3,s.belly,u),200,200,.6);}}
function front(c,s){const T0=s.T,a=s.a;if(T0>=T.ink[0]-.4&&T0<T.impact){c.save();for(let i=0;i<36;i++){const u=((rnd(i)+T0*.8)%1),ang=i*2.4+T0*2.6*s.dir,r=(1-u)*400;c.globalAlpha=u*.75;c.fillStyle=i%4?INK:RED;c.beginPath();c.arc(450+Math.cos(ang)*r,s.belly+Math.sin(ang)*r*.5,3+u*4,0,TAU);c.fill();}c.restore();}
 T.ink.forEach((at,i)=>{const age=T0-at;if(age>=0&&age<.5)ring(c,450,s.belly,300*(1-age/.5)+20,i%2?'#3a3a3a':'#ffffff',4,(1-age/.5)*.8,(300*(1-age/.5)+20)*.5);});
 {const age=T0-T.fly-.6;if(age>=0&&age<.7){ring(c,450,s.belly,18+age*520,JADE,10*(1-age/.7)+1,1-age/.7,(18+age*520)*.6);halo(c,a.glow,450,s.belly,420,420,1-age/.7);}}}
export const TV17_SPEC=Object.freeze({realm:17,...T,title:'Thần Vương',subtitle:'Sơn Hà Xã Tắc Đồ',color:JADE,accent:'#ffe1a0',sky:['#0a0c0e','#1a2224','#060708'],groundTop:'#4a4a42',bg:'/assets/worlds-v2/jade-palace.png',bgAlpha:.4,glowMid:'#e8fff4c0',beats:BEATS,hits:TV17_HITS,palette:{main:JADE,main2:'#2a6a64',soft:'#fbfff8',gold:'#ffe1a0'}});
export function drawThanVuongAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,TV17_SPEC,{assets,sky,back:backLayer,front});}
