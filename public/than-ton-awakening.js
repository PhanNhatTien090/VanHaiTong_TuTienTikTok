// Thần Tôn v2 — "Bát Môn Kim Tỏa" (15/11/2026). 42,5 s; nổ 36,7; đổi skin 37,05.
// 4 xích vàng phóng từ 4 góc quấn thành lồng, ổ khóa đóng (5 cú) → 8 cửa trận 休生傷杜景死驚開 trồi thành vòng bát giác (8 cú) →
// trận xoay, cầu sáng dò từng cửa tìm Sinh Môn — cửa sai lóe đỏ (9 cú) → phá mở 8 cửa, ánh sáng tràn ra (8 cú) →
// 4 xích vỡ vụn, ổ khóa nổ (5 cú) → 8 luồng sáng từ cửa hội về người, trận bát giác sụp → xoáy vàng → tối → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(19);
export const TT19=Object.freeze({...TM,chains:[.2,.8,1.4,2.0],lock:2.8,gates:Array.from({length:8},(_,i)=>3.6+i*.65),hops:Array.from({length:9},(_,i)=>9.5+i*.75),opens:Array.from({length:8},(_,i)=>16.5+i*.9),breaks:[24,25,26,27],burst:28,beams:Array.from({length:8},(_,i)=>29.5+i*.4),collapse:33.5,vortex:[34.5,35.3]});
const T=TT19,GOLD='#ffd36a',RED='#ff4a4a',WHITE='#fff8e6',GLYPH='休生傷杜景死驚開';
export const TT19_HITS=Object.freeze([...T.chains.map((a,i)=>[a+.4,1+i*.1]),[T.lock,1.5],...T.gates.map((a,i)=>[a+.3,.9+i*.05]),...T.hops.map((a,i)=>[a,.8+i*.05]),...T.opens.map((a,i)=>[a,1.2+i*.06]),
 ...T.breaks.map((a,i)=>[a,1.4+i*.1]),[T.burst,2.2],...T.beams.map((a,i)=>[a,.8+i*.06]),[T.collapse,1.8],...T.vortex.map((a,i)=>[a,1+i*.3]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,3]]);
const BEATS=[[0,'Kim tỏa phong thiên'],[3.6,'Bát môn hiện thế'],[9.5,'Tầm sinh môn'],[16.5,'Bát môn tề khai'],[24,'Kim tỏa đoạn liệt'],[29.5,'Bát môn quy nhất'],[T.impact,'Phá tỏa'],[T.reveal,'Thần Tôn hiện thân']];
function gateSprite(ch){return surface(170,210,c=>{c.translate(85,200);const wood=c.createLinearGradient(-80,0,80,0);wood.addColorStop(0,'#5a1a10');wood.addColorStop(.5,'#b0362a');wood.addColorStop(1,'#5a1a10');
 c.fillStyle=wood;c.fillRect(-70,-170,16,170);c.fillRect(54,-170,16,170);c.fillRect(-80,-176,160,14);c.fillStyle='#2a1a10';c.beginPath();c.moveTo(-92,-176);c.lineTo(92,-176);c.lineTo(80,-196);c.lineTo(-80,-196);c.closePath();c.fill();c.strokeStyle=GOLD;c.lineWidth=2;c.stroke();
 c.fillStyle='#1a1008';c.fillRect(-28,-160,56,40);c.strokeStyle=GOLD;c.strokeRect(-28,-160,56,40);c.fillStyle=GOLD;c.font='700 30px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.fillText(ch,0,-139);});}
function linkSprite(){return surface(40,24,c=>{c.strokeStyle='#5a3a10';c.lineWidth=8;c.beginPath();c.ellipse(20,12,14,7,0,0,TAU);c.stroke();c.strokeStyle=GOLD;c.lineWidth=4;c.stroke();c.strokeStyle='#fff4c8';c.lineWidth=1.2;c.beginPath();c.ellipse(20,10,12,5,0,Math.PI,TAU);c.stroke();});}
function lockSprite(){return surface(120,140,c=>{c.translate(60,80);c.strokeStyle=GOLD;c.lineWidth=10;c.beginPath();c.arc(0,-26,26,Math.PI,TAU);c.stroke();const g=c.createLinearGradient(-44,0,44,0);g.addColorStop(0,'#8a5a10');g.addColorStop(.5,'#ffe08a');g.addColorStop(1,'#8a5a10');c.fillStyle=g;c.fillRect(-44,-26,88,70);c.strokeStyle='#5a3a10';c.lineWidth=3;c.strokeRect(-44,-26,88,70);
 c.fillStyle='#3a2410';c.beginPath();c.arc(0,4,9,0,TAU);c.fill();c.fillRect(-3,4,6,20);});}
function assets(scene,H){if(scene.thanTonAssets?.H===H)return scene.thanTonAssets;const out={H,gates:[...GLYPH].map(gateSprite),link:linkSprite(),lock:lockSprite()};scene.thanTonAssets=out;return out;}
const gatePos=(i,s)=>{const spin=s.T>=T.hops[0]?(s.T-T.hops[0])*.25*s.dir*(1-ease((s.T-T.opens[0])/1)):0,base=ease((s.T-T.opens[0])/1)*(T.opens[0]-T.hops[0])*.25*s.dir;const a=Math.PI/2+i*TAU/8+spin+(s.T>=T.opens[0]?base:0),col=ease((s.T-T.collapse)/1);const R=mix(390,40,col);return {x:450+Math.cos(a)*R,y:s.feet+30+Math.sin(a)*R*.28,z:Math.sin(a),sc:(.7+.3*(Math.sin(a)+1)/2)*(1-col*.8),col};};
const CORNERS=[[-40,-40],[940,-40],[-40,1],[940,1]];
function chainPts(k,s){const [cx,cy]=CORNERS[k],sx=cx,sy=cy<0?cy:s.H+40,ex=450+(k%2?1:-1)*36,ey=s.head-140+(k<2?-20:30);return {sx,sy,ex,ey};}
function drawChains(c,s){const T0=s.T,x=s.x,a=s.a;T.chains.forEach((at,k)=>{const u=ease((T0-at)/.45);if(u<=0)return;const br=T.breaks[k],bAge=T0-br;if(bAge>1.4)return;const P=chainPts(k,s),n=22;
 for(let j=0;j<n;j++){const v=j/n;if(v>u)break;let px=mix(P.sx,P.ex,v),py=mix(P.sy,P.ey,v)+Math.sin(v*Math.PI)*30;if(bAge>=0){const ang=rnd(j+k*30)*TAU;px+=Math.cos(ang)*bAge*260;py+=Math.sin(ang)*bAge*260+bAge*bAge*300;}
  const ang=Math.atan2(P.ey-P.sy,P.ex-P.sx)+(j%2?Math.PI/2:0)*.0;c.save();c.globalAlpha=bAge>=0?clamp(1-bAge/1.4):1;c.translate(px,py);c.rotate(ang+(j%2?0:.0)+(bAge>0?bAge*4*rnd(j):0));c.scale(1,j%2?.6:1);c.drawImage(x.link,-20,-12);c.restore();}
 if(bAge>=0&&bAge<.6){halo(c,a.glow,P.ex,P.ey,300,300,1-bAge/.6);ring(c,P.ex,P.ey,20+bAge*300,GOLD,7*(1-bAge/.6),1-bAge/.6);}});
 if(T0>=T.lock&&T0<T.burst+1.2){const u=back((T0-T.lock)/.35),bAge=T0-T.burst;c.save();c.translate(450,s.head-140);const sc=mix(2,1,clamp(u))*(bAge>0?1+bAge*.6:1);c.scale(sc,sc);c.globalAlpha=bAge>0?clamp(1-bAge/.8):1;c.drawImage(x.lock,-60,-80);c.restore();
  if(bAge>=0&&bAge<1.2){halo(c,a.glow,450,s.head-140,900,900,1-bAge/1.2);for(let i=0;i<6;i++)ring(c,450,s.head-140,30+bAge*500+i*20,i%2?WHITE:GOLD,6*(1-bAge/1.2),1-bAge/1.2);}}}
function drawGates(c,s,front){const T0=s.T,x=s.x,a=s.a;for(let i=0;i<8;i++){const at=T.gates[i];if(T0<at)continue;const G=gatePos(i,s);if((G.z>=0)!==front||G.col>=1)continue;const rise=back((T0-at)/.5),y=mix(s.feet+200,G.y,clamp(rise));
  const open=ease((T0-T.opens[i])/.5),sc=G.sc*1.05;c.save();c.translate(G.x,y);c.scale(sc,sc);if(front)c.globalAlpha=mix(.45,1,clamp((Math.abs(G.x-450)-90)/80));c.drawImage(x.gates[i],-85,-200);
  if(open>0){c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,-160,0,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffd36a40');c.fillStyle=g;c.globalAlpha=open*(.75+Math.sin(s.clock*5+i)*.15);c.fillRect(-54,-162,108*open,162);}
  else{c.fillStyle='#1a0e08';c.globalAlpha=.85;c.fillRect(-54,-162,108,162);c.strokeStyle=GOLD;c.globalAlpha=.6;c.lineWidth=2;c.beginPath();c.moveTo(0,-162);c.lineTo(0,0);c.stroke();}
  c.restore();
  const ra=T0-at-.3;if(ra>=0&&ra<.6)ring(c,G.x,G.y,20+ra*200,GOLD,5*(1-ra/.6),1-ra/.6,(20+ra*200)*.4);
  const oa=T0-T.opens[i];if(oa>=0&&oa<.8){halo(c,a.glow,G.x,G.y-80*sc,360,360,1-oa/.8);}}}
function backLayer(c,s){const T0=s.T,x=s.x,a=s.a;
 if(s.revealed){const k=s.after*s.fade;c.save();c.translate(450,s.head-60);c.rotate(s.clock*.35);c.globalAlpha=k*.9;c.fillStyle=GOLD;c.font='700 26px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.strokeStyle=GOLD;c.lineWidth=2;
  c.beginPath();for(let i=0;i<=8;i++){const ang=i/8*TAU;c.lineTo(Math.cos(ang)*120,Math.sin(ang)*120);}c.stroke();for(let i=0;i<8;i++){const ang=i/8*TAU+TAU/16;c.save();c.translate(Math.cos(ang)*100,Math.sin(ang)*100);c.rotate(ang+Math.PI/2);c.fillText(GLYPH[i],0,0);c.restore();}c.restore();halo(c,a.glow,450,s.head-60,300,300,k*.4);return;}
 drawGates(c,s,false);
 // dò sinh môn
 T.hops.forEach((at,j)=>{const age=T0-at;if(age<0||age>.75)return;const gi=(j*3)%8,G=gatePos(gi,s),ok=j===8;halo(c,a.glow,G.x,G.y-90,200,200,1-age/.75);ring(c,G.x,G.y-90,30+age*160,ok?GOLD:RED,6*(1-age/.75),1-age/.75);
  if(!ok){c.save();c.globalCompositeOperation='lighter';c.fillStyle=RED;c.globalAlpha=(1-age/.75)*.35;c.fillRect(G.x-60,G.y-180,120,170);c.restore();}});
 // 8 luồng sáng hội tụ
 T.beams.forEach((at,i)=>{const age=T0-at;if(age<0||T0>T.collapse+.6)return;const G=gatePos(i,s),u=ease(age/.35);c.save();c.globalCompositeOperation='lighter';c.strokeStyle=GOLD;c.lineWidth=6+pulse(age,.5)*10;c.globalAlpha=.85;c.beginPath();c.moveTo(G.x,G.y-80);c.lineTo(mix(G.x,450,u),mix(G.y-80,s.belly,u));c.stroke();c.strokeStyle=WHITE;c.lineWidth=2;c.stroke();c.restore();});}
function front(c,s){const T0=s.T,a=s.a;if(!s.revealed){drawGates(c,s,true);drawChains(c,s);}
 {const age=T0-T.collapse;if(age>=0&&age<.8){ring(c,450,s.belly,18+age*560,GOLD,12*(1-age/.8)+1,1-age/.8,(18+age*560)*.6);halo(c,a.glow,450,s.belly,480,480,1-age/.8);}}
 if(T0>=T.vortex[0]-.4&&T0<T.impact){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const u=((rnd(i)+T0*.9)%1),ang=i*2.4+T0*3*s.dir,r=(1-u)*380;c.globalAlpha=u*.8;c.fillStyle=i%3?GOLD:WHITE;c.fillRect(450+Math.cos(ang)*r,s.belly+Math.sin(ang)*r*.5,3,3);}c.restore();}}
export const TT19_SPEC=Object.freeze({realm:19,...T,title:'Thần Tôn',subtitle:'Bát Môn Kim Tỏa',color:GOLD,accent:RED,sky:['#0a0806','#2a1a10','#060404'],groundTop:'#5a4a30',bg:'/assets/god-forms-v1/starfield.png',bgAlpha:.45,glowMid:'#fff0c8c0',beats:BEATS,hits:TT19_HITS,palette:{main:GOLD,main2:'#c88a30',soft:'#fffaf0',gold:'#ffe1a0'}});
export function drawThanTonAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,TT19_SPEC,{assets,back:backLayer,front});}
