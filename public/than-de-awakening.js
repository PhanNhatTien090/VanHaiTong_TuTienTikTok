// Thần Đế v2 — "Thập Nhật Quy Nhất" (15/11/2026). 41 s; nổ 35,4; đổi skin 35,75.
// 10 mặt trời lần lượt mọc thành vòng cung (10 cú) → trời đất nung đỏ, đất nứt, 3 đợt sóng nhiệt + 2 nhịp tia nắng →
// cung thần ánh vàng hiện trước ngực, 9 mũi tên lần lượt bắn hạ 9 mặt trời, mỗi mặt trời nổ thành Kim Ô lửa rơi (9 cú) →
// mặt trời cuối giáng xuống, khung vương miện mặt trời (god-forms solar-crown) bừng sau lưng (4 nhịp quầng) →
// mặt trời thu nhỏ nhập ngực, 6 vệt lửa mặt trời phun từ thân → tụ quang → tối → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,art,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(18);
export const TD18=Object.freeze({...TM,suns:Array.from({length:10},(_,i)=>.2+i*.5),heat:[5.5,7,8.5],rays:[9.5,10.5],bow:11,arrows:Array.from({length:9},(_,i)=>11.5+i*.95),descend:20.5,corona:[21.5,22.5,23.5,24.5],crown:25,enter:26.5,flares:Array.from({length:6},(_,i)=>27.3+i*.8),gather:[32.3,33.6]});
const T=TD18,SUN='#ffcf5a',FIRE='#ff6a2a',WHITE='#fff8e8';
export const TD18_HITS=Object.freeze([...T.suns.map((a,i)=>[a+.3,.8+i*.04]),...T.heat.map((a,i)=>[a,1.2+i*.15]),...T.rays.map((a,i)=>[a,1+i*.1]),[T.bow,1.3],...T.arrows.map((a,i)=>[a+.35,1.2+i*.05]),
 [T.descend,1.2],...T.corona.map((a,i)=>[a,.9+i*.12]),[T.crown,1.8],[T.enter+.4,2],...T.flares.map((a,i)=>[a,.9+i*.08]),...T.gather.map((a,i)=>[a,1.2+i*.3]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,3]]);
const BEATS=[[0,'Thập nhật đồng thăng'],[5.5,'Thiên địa tiêu viêm'],[11,'Thần cung xạ nhật'],[20.5,'Nhất nhật quy tôn'],[26.5,'Đại nhật nhập thể'],[T.impact,'Phá nhật'],[T.reveal,'Thần Đế hiện thân']];
function sunSprite(){return surface(220,220,c=>{c.translate(110,110);const g=c.createRadialGradient(0,0,0,0,0,110);g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#fff0a0');g.addColorStop(.45,'#ffb03a');g.addColorStop(.7,'#ff6a2a60');g.addColorStop(1,'#ff6a2a00');c.fillStyle=g;c.fillRect(-110,-110,220,220);
 c.globalCompositeOperation='lighter';c.strokeStyle='#fff0b0';c.globalAlpha=.5;c.lineWidth=2;for(let i=0;i<16;i++){const a=i/16*TAU;c.beginPath();c.moveTo(Math.cos(a)*44,Math.sin(a)*44);c.lineTo(Math.cos(a)*(80+(i%2)*24),Math.sin(a)*(80+(i%2)*24));c.stroke();}});}
function crowSprite(){return surface(140,90,c=>{c.translate(70,45);c.fillStyle='#ffb03a';c.strokeStyle='#fff0b0';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,22,10,0,0,TAU);c.fill();c.stroke();
 for(const sd of [-1,1]){c.beginPath();c.moveTo(-4,-4*sd);c.quadraticCurveTo(-26,-40*sd,-62,-30*sd);c.quadraticCurveTo(-30,-14*sd,-8,4*sd);c.closePath();c.fill();c.stroke();}c.beginPath();c.moveTo(20,-2);c.lineTo(34,-6);c.lineTo(22,4);c.fill();
 c.fillStyle='#ff6a2a';for(let k=0;k<3;k++){c.beginPath();c.moveTo(-18,6);c.lineTo(-34-k*6,18+k*6);c.lineTo(-14,10);c.fill();}});}
function assets(scene,H){if(scene.thanDeAssets?.H===H)return scene.thanDeAssets;const out={H,sun:sunSprite(),crow:crowSprite()};scene.thanDeAssets=out;return out;}
const sunPos=(i,s)=>{const a=Math.PI*(1.12+i/9*.76),x=450+Math.cos(a)*400*s.dir,y=s.H*.42+Math.sin(a)*s.H*.3;return {x,y};};
function sky(c,s){const T0=s.T,x=s.x,a=s.a,heat=ease((T0-T.heat[0])/2)*(1-ease((T0-T.descend)/3));
 // trời đỏ cháy
 const red=ease((T0-T.suns[0])/5)*(1-ease((T0-T.impact)/1.5));if(red>0){c.save();const g=c.createLinearGradient(0,0,0,s.H);g.addColorStop(0,'#ff6a2a00');g.addColorStop(.45,'#ff7a3a60');g.addColorStop(1,'#a01e0a50');c.globalAlpha=red*(.6+heat*.4);c.fillStyle=g;c.fillRect(0,0,900,s.H);c.restore();}
 // 10 mặt trời
 for(let i=0;i<10;i++){const at=T.suns[i];if(T0<at)continue;const last=i===4;let P=sunPos(i,s),sc=.55+(last?.25:0);const rise=back((T0-at)/.6);P={x:P.x,y:mix(s.H*.62,P.y,clamp(rise))};
  const shotIdx=i<4?i:i-1,shot=last?null:T.arrows[shotIdx];
  if(shot!==null&&T0>=shot+.35){const age=T0-shot-.35;if(age<1.6){halo(c,a.glow,P.x,P.y,500*(1-age/1.6)+100,500*(1-age/1.6)+100,1-age/1.6);ring(c,P.x,P.y,30+age*260,FIRE,8*(1-age/1.6),1-age/1.6);
     c.save();c.globalAlpha=1-ease((age-1)/.6);c.translate(P.x+(rnd(i)-.5)*80*age,P.y+age*age*220);c.rotate(Math.sin(age*6)*.3);c.scale(.9,.9);c.drawImage(x.crow,-70,-45);c.restore();}continue;}
  if(last&&T0>=T.descend){const u=ease((T0-T.descend)/4.5),en=ease((T0-T.enter)/.4);P={x:mix(P.x,450,u),y:mix(mix(P.y,s.head-150,u),s.belly,en)};sc=mix(.8,1.6,u)*(1-en*.92);if(en>=1)continue;
   const cor=Math.max(...T.corona.map(t=>pulse(T0-t,.8)));halo(c,a.glow,P.x,P.y,700*sc+cor*400,700*sc+cor*400,.7);T.corona.forEach(t=>{const g=T0-t;if(g>=0&&g<.8)ring(c,P.x,P.y,110*sc+g*360,SUN,8*(1-g/.8),1-g/.8);});}
  const flick=1+Math.sin(s.clock*6+i)*.04;c.save();c.globalCompositeOperation='lighter';c.translate(P.x,P.y);c.scale(sc*flick,sc*flick);c.drawImage(x.sun,-110,-110);c.restore();
  const age=T0-at-.3;if(age>=0&&age<.6)ring(c,P.x,P.y,40+age*200,SUN,5*(1-age/.6),1-age/.6);}
 // sóng nhiệt + tia nắng
 T.heat.forEach((at,i)=>{const age=T0-at;if(age>=0&&age<1.2)ring(c,450,s.feet,80+age*700,FIRE,10*(1-age/1.2),(1-age/1.2)*.8,(80+age*700)*.22);});
 T.rays.forEach(at=>{const age=T0-at;if(age<0||age>.8)return;c.save();c.globalCompositeOperation='lighter';for(let i=0;i<10;i++){if(T0>=T.arrows[Math.min(8,i<4?i:i-1)]+.35&&i!==4)continue;const P=sunPos(i,s);const g=c.createLinearGradient(P.x,P.y,450,s.feet);g.addColorStop(0,'#fff0b0c0');g.addColorStop(1,'#ff6a2a00');c.strokeStyle=g;c.globalAlpha=1-age/.8;c.lineWidth=14;c.beginPath();c.moveTo(P.x,P.y);c.lineTo(450+(P.x-450)*.2,s.feet);c.stroke();}c.restore();});}
function ground(c,s){const T0=s.T,heat=ease((T0-T.heat[0])/2)*(1-ease((T0-T.descend)/3));if(heat<=0)return;c.save();c.globalCompositeOperation='lighter';c.strokeStyle=FIRE;c.globalAlpha=heat*.85;c.lineWidth=2.5;
 for(let i=0;i<12;i++){const a=i/12*TAU;let x=450+Math.cos(a)*60,y=s.feet+20+Math.sin(a)*14;c.beginPath();c.moveTo(x,y);for(let j=0;j<6;j++){x+=Math.cos(a+(rnd(i*9+j)-.5))*36;y+=Math.sin(a+(rnd(i*5+j)-.5))*9;c.lineTo(x,y);}c.stroke();}c.restore();}
function backLayer(c,s){const T0=s.T,a=s.a,cr=art('/assets/god-forms-v1/solar-crown.png');
 const ck=s.revealed?s.after*s.fade:ease((T0-T.crown)/.7)*(1-ease((T0-T.gather[1])/1));if(cr&&ck>0){const p=s.revealed?0:pulse(T0-T.crown,1);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=ck*(.85+p*.15);c.translate(450,s.feet-320);c.scale(1+p*.08,1+p*.08);c.drawImage(cr,-320,-640,640,1280);c.restore();}
 if(T0>=T.crown&&T0<T.crown+1){const g=T0-T.crown;ring(c,450,s.head-100,60+g*700,SUN,10*(1-g),1-g,(60+g*700)*.9);}}
function front(c,s){const T0=s.T,a=s.a;
 // cung thần + tên
 const bk=ease((T0-T.bow)/.5)*(1-ease((T0-T.arrows[8]-.8)/.6));if(bk>0){const bx=450,by=s.head+70,draw=T.arrows.reduce((m,at)=>{const u=(T0-at+.6)/.6;return u>0&&u<1?Math.max(m,u):m;},0);
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=bk;c.strokeStyle=SUN;c.lineWidth=6;c.beginPath();c.moveTo(bx-170,by-60);c.quadraticCurveTo(bx,by-170,bx+170,by-60);c.stroke();c.strokeStyle=WHITE;c.lineWidth=1.6;c.beginPath();c.moveTo(bx-170,by-60);c.lineTo(bx,by-60+draw*50);c.lineTo(bx+170,by-60);c.stroke();c.restore();halo(c,a.glow,bx,by-100,400,200,bk*.4);}
 T.arrows.forEach((at,k)=>{const u=clamp((T0-at)/.35);if(u<=0||u>=1)return;const i=k<4?k:k+1,P=sunPos(i,s),sx=450,sy=s.head+20,px=mix(sx,P.x,ease(u)),py=mix(sy,P.y,ease(u)),ang=Math.atan2(P.y-sy,P.x-sx);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle=WHITE;c.lineWidth=4;c.beginPath();c.moveTo(px,py);c.lineTo(px-Math.cos(ang)*160,py-Math.sin(ang)*160);c.stroke();c.strokeStyle=SUN;c.lineWidth=10;c.globalAlpha=.4;c.stroke();c.restore();halo(c,a.glow,px,py,90,90,1);});
 // mặt trời nhập thể + lửa phun
 {const age=T0-T.enter-.4;if(age>=0&&age<.8){ring(c,450,s.belly,18+age*560,SUN,12*(1-age/.8)+1,1-age/.8,(18+age*560)*.6);halo(c,a.glow,450,s.belly,500,500,1-age/.8);}}
 if(T0>=T.enter+.4&&T0<T.impact)halo(c,a.glow,450,s.belly-40,260,360,.5+Math.sin(s.clock*8)*.1);
 T.flares.forEach((at,i)=>{const age=T0-at;if(age<0||age>.9)return;const ang=-Math.PI/2+(i-2.5)*.5,L=ease(age/.3)*260,k=1-age/.9;c.save();c.globalCompositeOperation='lighter';const x1=450+Math.cos(ang)*L,y1=s.belly-40+Math.sin(ang)*L;const g=c.createLinearGradient(450,s.belly-40,x1,y1);g.addColorStop(0,'#ffffff');g.addColorStop(.5,SUN);g.addColorStop(1,'#ff6a2a00');c.strokeStyle=g;c.lineWidth=22*k;c.lineCap='round';c.globalAlpha=k;c.beginPath();c.moveTo(450,s.belly-40);c.quadraticCurveTo(450+Math.cos(ang+.4)*L*.5,s.belly-40+Math.sin(ang+.4)*L*.5,x1,y1);c.stroke();c.restore();});
 T.gather.forEach((at,i)=>{const age=T0-at;if(age>=0&&age<.6)ring(c,450,s.belly,400*(1-age/.6)+20,i?WHITE:SUN,6,(1-age/.6)*.9,(400*(1-age/.6)+20)*.5);});}
export const TD18_SPEC=Object.freeze({realm:18,...T,title:'Thần Đế',subtitle:'Thập Nhật Quy Nhất',color:SUN,accent:FIRE,sky:['#120604','#3a140a','#0a0402'],groundTop:'#5a3a24',bg:'/assets/worlds-v2/cosmos.png',bgAlpha:.3,glowMid:'#fff0c8c0',beats:BEATS,hits:TD18_HITS,palette:{main:SUN,main2:FIRE,soft:'#fffaf0',gold:'#ffe1a0'}});
export function drawThanDeAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,TD18_SPEC,{assets,sky,back:backLayer,ground,front});}
