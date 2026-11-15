// Thiên Tôn v2 — "Ngũ Hành Luân Chuyển" (15/11/2026). 37 s; nổ 31,8; đổi skin 32,15.
// 5 sao ngũ hành bừng sáng quanh người (5 cú) → từng hành hiện hình: Mộc dây leo · Hỏa cột lửa · Thổ núi trồi · Kim quạt kiếm · Thủy sóng vòng (5 cú)
// → TƯƠNG SINH: cầu năng lượng chạy vòng Mộc→Hỏa→Thổ→Kim→Thủy→Mộc (6 cú) → TƯƠNG KHẮC: 5 tia ngôi sao đánh chéo (5 cú), sao rực →
// bánh xe ngũ hành quay nhanh, 5 sao thành sao chổi (5 nhịp) → lần lượt nhập đan điền (5 cú) → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(15);
export const TT15=Object.freeze({...TM,light:[.2,.9,1.6,2.3,3.0],manifest:[4.0,5.4,6.8,8.2,9.6],sheng:Array.from({length:6},(_,i)=>11.5+i*.9),ke:[17.5,18.5,19.5,20.5,21.5],blaze:22.5,spin:[24,24.75,25.5,26.25,27],merge:[28.2,28.7,29.2,29.7,30.2]});
const T=TT15,EL=[{n:'Mộc',ch:'木',c:'#7dff8a'},{n:'Hỏa',ch:'火',c:'#ff6a3a'},{n:'Thổ',ch:'土',c:'#ffc85a'},{n:'Kim',ch:'金',c:'#f4f6ff'},{n:'Thủy',ch:'水',c:'#5ab8ff'}];
export const TT15_HITS=Object.freeze([...T.light.map((a,i)=>[a,1+i*.1]),...T.manifest.map((a,i)=>[a,1.3+i*.1]),...T.manifest.map(a=>[a+.7,.7]),...T.sheng.map((a,i)=>[a+.9,.9+i*.08]),
 ...T.ke.map((a,i)=>[a,1.5+i*.12]),[T.blaze,2],...T.spin.map((a,i)=>[a,.8+i*.1]),...T.merge.map((a,i)=>[a+.4,1.2+i*.15]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,2.9]]);
const BEATS=[[0,'Ngũ tinh hiện thế'],[4,'Ngũ hành hiện hình'],[11.5,'Ngũ hành tương sinh'],[17.5,'Ngũ hành tương khắc'],[23.5,'Ngũ hành luân chuyển'],[28.2,'Ngũ khí triều nguyên'],[T.impact,'Phá thiên'],[T.reveal,'Thiên Tôn hiện thân']];
function charSprite(e){return surface(140,140,c=>{c.translate(70,70);const g=c.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,'#ffffff');g.addColorStop(.35,e.c+'d0');g.addColorStop(1,e.c+'00');c.fillStyle=g;c.fillRect(-70,-70,140,140);
 c.font='900 58px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='#1a1020';c.strokeText(e.ch,0,3);c.fillStyle='#ffffff';c.fillText(e.ch,0,3);});}
function assets(scene,H){if(scene.thienTonAssets?.H===H)return scene.thienTonAssets;const out={H,chars:EL.map(charSprite)};scene.thienTonAssets=out;return out;}
const C=s=>({x:450,y:s.head+40});
function node(i,s){const c=C(s),spin=ease((s.T-T.spin[0])/1)*(s.T-T.spin[0])*(1.2+ease((s.T-T.spin[0])/3.5)*2.4)*s.dir,R=mix(300,170,ease((s.T-T.spin[0])/3)),a=-Math.PI/2+i*TAU/5+(s.T>=T.spin[0]?spin:0);
 const m=ease((s.T-T.merge[i])/.4);return {x:mix(c.x+Math.cos(a)*R,450,m),y:mix(c.y+Math.sin(a)*R*.9,s.belly,m),m,a};}
function manifest(c,s,i,P){const at=T.manifest[i],age=s.T-at;if(age<0||s.T>=T.sheng[0]+.8)return;const k=ease(age/.5)*(1-ease((s.T-T.sheng[0])/.8)),col=EL[i].c;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k;
 if(i===0){c.strokeStyle=col;c.lineCap='round';for(let j=0;j<7;j++){const ang=j/7*TAU,len=ease(age/1)*(110+rnd(j)*60);c.lineWidth=5-j*.4;c.beginPath();c.moveTo(P.x,P.y);let x=P.x,y=P.y;for(let t=1;t<=10;t++){const u=t/10*len;x=P.x+Math.cos(ang+Math.sin(u*.05+j)*.6)*u;y=P.y+Math.sin(ang+Math.sin(u*.05+j)*.6)*u;c.lineTo(x,y);}c.stroke();c.fillStyle='#c8ffb0';c.beginPath();c.ellipse(x,y,9,5,ang,0,TAU);c.fill();}}
 else if(i===1){const h=ease(age/.4)*420;const g=c.createLinearGradient(0,P.y,0,P.y-h);g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#ffb05a');g.addColorStop(1,'#ff3a1a00');c.fillStyle=g;c.beginPath();c.moveTo(P.x-40,P.y);for(let t=0;t<=10;t++){const u=t/10;c.lineTo(P.x-40*(1-u)+Math.sin(u*9+s.clock*12)*14,P.y-h*u);}for(let t=10;t>=0;t--){const u=t/10;c.lineTo(P.x+40*(1-u)+Math.sin(u*8-s.clock*11)*14,P.y-h*u);}c.closePath();c.fill();}
 else if(i===2){c.globalCompositeOperation='source-over';const rise=back(age/.5);c.fillStyle='#7a5a2a';c.strokeStyle='#ffd88a';c.lineWidth=2;for(let j=0;j<3;j++){const w=60-j*12,h=(90+j*30)*clamp(rise),x=P.x+(j-1)*42;c.beginPath();c.moveTo(x-w,P.y+30);c.lineTo(x-w*.2,P.y+30-h);c.lineTo(x+w*.25,P.y+30-h*.86);c.lineTo(x+w,P.y+30);c.closePath();c.fill();c.stroke();}}
 else if(i===3){for(let j=0;j<9;j++){const ang=-Math.PI/2+(j-4)*.28*ease(age/.4),L=150;c.save();c.translate(P.x,P.y);c.rotate(ang);c.fillStyle='#f4f6ff';c.beginPath();c.moveTo(-4,0);c.lineTo(0,-L);c.lineTo(4,0);c.closePath();c.fill();c.strokeStyle='#ffffff';c.lineWidth=1;c.stroke();c.restore();}}
 else{for(let j=0;j<4;j++){const u=clamp((age-j*.18)/1);if(u<=0||u>=1)continue;ring(c,P.x,P.y,30+u*220,col,8*(1-u)+1,1-u,(30+u*220)*.45);}const g=c.createRadialGradient(P.x,P.y,0,P.x,P.y,120);g.addColorStop(0,'#c8ecffa0');g.addColorStop(1,'#5ab8ff00');c.fillStyle=g;c.fillRect(P.x-120,P.y-120,240,240);}
 c.restore();}
function backLayer(c,s){const T0=s.T,x=s.x,a=s.a,cc=C(s);
 if(s.revealed){const k=s.after*s.fade;c.save();c.translate(450,s.head-40);c.rotate(s.clock*.4);c.globalAlpha=k*.85;c.globalCompositeOperation='lighter';c.lineWidth=2.5;
  for(let i=0;i<5;i++){const a1=-Math.PI/2+i*TAU/5,a2=-Math.PI/2+((i+2)%5)*TAU/5;c.strokeStyle=EL[i].c;c.beginPath();c.moveTo(Math.cos(a1)*90,Math.sin(a1)*90);c.lineTo(Math.cos(a2)*90,Math.sin(a2)*90);c.stroke();}
  c.beginPath();c.arc(0,0,92,0,TAU);c.strokeStyle='#ffffff';c.stroke();for(let i=0;i<5;i++){const a1=-Math.PI/2+i*TAU/5;c.fillStyle=EL[i].c;c.beginPath();c.arc(Math.cos(a1)*92,Math.sin(a1)*92,7,0,TAU);c.fill();}c.restore();halo(c,a.glow,450,s.head-40,260,260,k*.4);return;}
 if(T0<T.light[0])return;const nodes=EL.map((_,i)=>node(i,s));
 // vòng tròn tương sinh + sao tương khắc
 const circ=ease((T0-T.sheng[0])/1)*(1-ease((T0-T.merge[0])/1.5));if(circ>0){c.save();c.globalCompositeOperation='lighter';c.lineWidth=3;c.globalAlpha=circ*.7;c.strokeStyle='#ffffff';c.beginPath();nodes.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke();c.restore();}
 T.sheng.forEach((at,j)=>{const u=clamp((T0-at)/.9),i=j%5,nx=(i+1)%5;if(u<=0||T0>T.merge[0])return;const A=nodes[i],B=nodes[nx];if(u<1){const px=mix(A.x,B.x,ease(u)),py=mix(A.y,B.y,ease(u));halo(c,a.glow,px,py,120,120,1);halo(c,a.glow,px,py,60,60,1);}
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=EL[i].c;c.lineWidth=6;c.globalAlpha=.8*(1-ease((T0-T.ke[0])/2));c.beginPath();c.moveTo(A.x,A.y);c.lineTo(mix(A.x,B.x,ease(u)),mix(A.y,B.y,ease(u)));c.stroke();c.restore();});
 T.ke.forEach((at,j)=>{const u=clamp((T0-at)/.25);if(u<=0||T0>T.merge[0]+.5)return;const A=nodes[j],B=nodes[(j+2)%5],bx=mix(A.x,B.x,u),by=mix(A.y,B.y,u),blaze=pulse(T0-T.blaze,1.2),fresh=pulse(T0-at,.8);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=EL[j].c;c.lineWidth=4+fresh*10+blaze*6;c.globalAlpha=.9;c.beginPath();c.moveTo(A.x,A.y);let px=A.x,py=A.y;for(let t=1;t<=8;t++){const v=t/8*u;const jx=t<8?(rnd(t+j*9+Math.floor(T0*12))-.5)*24*fresh:0;px=mix(A.x,B.x,v)+jx;py=mix(A.y,B.y,v)+jx;c.lineTo(px,py);}c.stroke();c.strokeStyle='#ffffff';c.lineWidth=1.6;c.stroke();c.restore();
  if(fresh>.05)halo(c,a.glow,B.x,B.y,280,280,fresh);});
 if(T0>=T.blaze&&T0<T.blaze+1.4){const u=(T0-T.blaze)/1.4;ring(c,cc.x,cc.y,80+u*600,'#ffffff',10*(1-u),1-u,(80+u*600)*.9);halo(c,a.glow,cc.x,cc.y,900,900,(1-u)*.7);}
 // sao ngũ hành
 nodes.forEach((p,i)=>{const on=ease((T0-T.light[i])/.35);if(on<=0||p.m>=1)return;manifest(c,s,i,p);const sc=(1.15+pulse(T0-T.light[i],.8)*.6)*(1-p.m*.7);
  if(T0>=T.spin[0]){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=EL[i].c;c.lineWidth=10;c.globalAlpha=.5*(1-p.m);c.beginPath();c.arc(cc.x,cc.y,Math.hypot(p.x-cc.x,(p.y-cc.y)/.9),p.a-.6*s.dir,p.a,s.dir<0);c.stroke();c.restore();}
  c.save();c.globalAlpha=on*(1-p.m);c.translate(p.x,p.y);c.scale(sc,sc);c.drawImage(x.chars[i],-70,-70);c.restore();
  const age=T0-T.light[i];if(age<.8)ring(c,p.x,p.y,20+age*240,EL[i].c,7*(1-age/.8),1-age/.8);});}
function front(c,s){const T0=s.T,a=s.a;T.merge.forEach((at,i)=>{const age=T0-at-.4;if(age>=0&&age<.6){ring(c,450,s.belly,18+age*500,EL[i].c,10*(1-age/.6)+1,1-age/.6,(18+age*500)*.6);halo(c,a.glow,450,s.belly,400,400,1-age/.6);}});}
export const TT15_SPEC=Object.freeze({realm:15,...T,title:'Thiên Tôn',subtitle:'Ngũ Hành Luân Chuyển',color:'#ffd27a',accent:'#7dff8a',sky:['#06080e','#14202a','#05060a'],groundTop:'#3a4a4a',bg:'/assets/god-forms-v1/starfield.png',bgAlpha:.5,glowMid:'#fff4d8c0',beats:BEATS,hits:TT15_HITS,palette:{main:'#ffd27a',main2:'#ff9a5a',soft:'#fffaf0',gold:'#ffe1a0'}});
export function drawThienTonAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,TT15_SPEC,{assets,back:backLayer,front});}
