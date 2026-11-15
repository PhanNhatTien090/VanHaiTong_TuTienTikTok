// Đạo Tổ v2 — "Nhất Khí Hóa Tam Thanh" (15/11/2026). 35,5 s; nổ 30,5; đổi skin 30,85.
// Tử khí đông lai 3 đợt quét trời → 3 tòa sen nở (3 cú) → 3 pháp thân (bóng nhân vật: Thái Thanh trắng · Ngọc Thanh lam · Thượng Thanh vàng)
// hiện trên sen kèm phất trần / như ý / kiếm (3 cú) → Tam Thanh thuyết pháp: phù văn từ 3 pháp thân dệt thành chữ 道 (10 nhịp) →
// sen xoay quanh người, 3 pháp thân lần lượt nhập thể (3 cú), 3 sen hợp thành đại liên dưới chân → chữ 道 giáng xuống → tử khí xoáy → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,ghostOf,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(14);
export const DT14=Object.freeze({...TM,qi:[.2,1.2,2.2],lotus:[3.6,4.8,6.0],avatar:[7.2,8.6,10.0],runes:Array.from({length:10},(_,i)=>12+i*.7),glyph:18.8,orbit:[19.5,20.5,21.3],merge:[22,23,24],fuse:25,bloom:26,descend:27.5,swirl:[28.2,28.9,29.6]});
const T=DT14,PURPLE='#c39bff',GOLD='#ffe1a0',LOTUS=['#ffffff','#9ad0ff','#ffd27a'];
export const DT14_HITS=Object.freeze([...T.qi.map((a,i)=>[a,1.2+i*.2]),...T.lotus.map((a,i)=>[a,1.1+i*.15]),...T.avatar.map((a,i)=>[a,1.3+i*.15]),...T.runes.map((a,i)=>[a,.55+i*.04]),[T.glyph,1.8],
 ...T.orbit.map((a,i)=>[a,.9+i*.1]),...T.merge.map((a,i)=>[a+.5,1.4+i*.2]),[T.fuse,1.6],[T.bloom,1.2],[T.descend+.6,1.8],...T.swirl.map((a,i)=>[a,.8+i*.15]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,2.9]]);
const BEATS=[[0,'Tử khí đông lai'],[3.6,'Tam liên khai hoa'],[7.2,'Nhất khí hóa Tam Thanh'],[12,'Tam Thanh thuyết pháp'],[19.5,'Tam Thanh quy nhất'],[27.5,'Đại Đạo nhập thể'],[T.impact,'Khai đạo'],[T.reveal,'Đạo Tổ hiện thân']];
function lotusSprite(tint){return surface(300,170,c=>{c.translate(150,120);for(let layer=0;layer<3;layer++){const n=8+layer*2,R=130-layer*30;for(let i=0;i<n;i++){const a=Math.PI+(i+.5)/n*Math.PI;c.save();c.rotate(a+Math.PI/2);
 c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-R*.22,-R*.55,0,-R);c.quadraticCurveTo(R*.22,-R*.55,0,0);const g=c.createLinearGradient(0,0,0,-R);g.addColorStop(0,'#ff8ac8');g.addColorStop(.6,'#ffc8e8');g.addColorStop(1,tint);c.fillStyle=g;c.globalAlpha=.92;c.fill();c.strokeStyle='#ffffff';c.globalAlpha=.55;c.lineWidth=1.2;c.stroke();c.restore();}}
 c.globalAlpha=1;c.fillStyle=GOLD;c.beginPath();c.ellipse(0,-8,26,9,0,0,TAU);c.fill();});}
function glyphSprite(){return surface(320,320,c=>{c.translate(160,160);c.font='900 230px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.strokeStyle='#4a2a6a';c.lineWidth=16;c.strokeText('道',0,10);
 const g=c.createLinearGradient(0,-120,0,120);g.addColorStop(0,'#ffffff');g.addColorStop(.5,GOLD);g.addColorStop(1,'#c88ad8');c.fillStyle=g;c.fillText('道',0,10);});}
function assets(scene,H){if(scene.daoToAssets?.H===H)return scene.daoToAssets;const out={H,lotus:LOTUS.map(lotusSprite),big:lotusSprite('#ffe6f4'),glyph:glyphSprite()};scene.daoToAssets=out;return out;}
const SEAT=[[215,.36],[450,.19],[685,.36]];
function seat(i,s){const T0=s.T,[x0,y0]=SEAT[i],orb=ease((T0-T.orbit[0])/1.2),ang=-Math.PI/2+(i-1)*2.1+(T0-T.orbit[0])*1.6*orb*s.dir,ox=450+Math.cos(ang)*300,oy=s.belly-120+Math.sin(ang)*110;
 const fuse=ease((T0-T.fuse+.6)/.8);let x=mix(450+(x0-450)*s.dir,ox,orb),y=mix(s.H*y0,oy,orb);x=mix(x,450,fuse);y=mix(y,s.feet+10,fuse);return {x,y,fuse};}
function sky(c,s){const T0=s.T;c.save();c.globalCompositeOperation='lighter';
 T.qi.forEach((at,i)=>{const u=clamp((T0-at)/2.4);if(u<=0)return;const head=mix(1000,-200,ease(u)),y=s.H*(.12+i*.07);for(let j=0;j<16;j++){const x=head+j*60+Math.sin(j+T0)*14,r=70+j*4;if(x>960)continue;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#d8b8ffa0');g.addColorStop(1,'#8a5ad800');c.fillStyle=g;c.globalAlpha=(1-j/16)*.8*(1-ease((T0-T.descend)/2));c.fillRect(x-r,y-r,r*2,r*2);}});
 const cover=ease((T0-T.qi[0])/4)*(1-ease((T0-T.impact)/1));if(cover>0){for(let j=0;j<14;j++){const x=(j*90+T0*12)%1100-100,y=s.H*(.06+(j%3)*.07),r=120;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#b890ff60');g.addColorStop(1,'#6a3ab000');c.fillStyle=g;c.globalAlpha=cover*.7;c.fillRect(x-r,y-r,r*2,r*2);}}
 c.restore();}
function backLayer(c,s){const T0=s.T,x=s.x,a=s.a;if(T0<T.lotus[0]-.2||T0>=T.impact+.1&&!s.revealed)return;
 if(s.revealed){const k=s.after*s.fade;c.save();c.globalAlpha=k*.75;c.translate(450,s.head-40);c.rotate(Math.sin(s.clock*.5)*.05);c.drawImage(x.glyph,-80,-80,160,160);c.restore();halo(c,a.glow,450,s.head-40,260,260,k*.45);return;}
 for(let i=0;i<3;i++){const at=T.lotus[i];if(T0<at)continue;const P=seat(i,s),open=back((T0-at)/.6),sc=mix(.3,1,clamp(open))*(1-P.fuse*.4);if(P.fuse>=1)continue;
  c.save();c.translate(P.x,P.y);c.scale(sc*.75,sc*.75);c.globalAlpha=1-P.fuse;c.drawImage(x.lotus[i],-150,-120);c.restore();halo(c,a.glow,P.x,P.y-20,180,120,.5);
  const age=T0-at;if(age<.7)ring(c,P.x,P.y,20+age*300,LOTUS[i],6*(1-age/.7),1-age/.7,(20+age*300)*.35);
  // pháp thân
  const av=T.avatar[i];if(T0>=av&&s.image){const m=T.merge[i],mu=ease((T0-m)/.5);if(mu<1){const g=ghostOf(s.image,['#f4f4ff','#8ac4ff','#ffd27a'][i],.72);const k=ease((T0-av)/.5)*(1-mu);const gx=mix(P.x,450,mu),gy=mix(P.y-6,s.feet,mu),gs=mix(.42,1,mu);
   c.save();c.globalAlpha=k*.9;c.translate(gx,gy);c.scale(gs,gs);c.drawImage(g,-320,-590);c.restore();halo(c,a.glow,gx,gy-150*gs,220*gs,220*gs,k*.5);
   emblem(c,i,gx+70*gs,gy-260*gs,gs,s.clock,k);
   const aa=T0-av;if(aa<.8){ring(c,gx,gy-150*gs,30+aa*300,LOTUS[i],7*(1-aa/.8),1-aa/.8);halo(c,a.glow,gx,gy-150,320,320,1-aa/.8);}}}}}
function emblem(c,i,x,y,sc,clock,al){c.save();c.translate(x,y);c.scale(sc,sc);c.globalAlpha=al;c.lineCap='round';
 if(i===0){c.strokeStyle='#d8b070';c.lineWidth=5;c.beginPath();c.moveTo(0,0);c.lineTo(0,70);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=1.6;for(let j=0;j<14;j++){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-18+j*2.6+Math.sin(clock*2+j)*6,-40,-30+j*4+Math.sin(clock*2+j)*10,-90);c.stroke();}}
 else if(i===1){c.strokeStyle='#bfe6ff';c.lineWidth=8;c.beginPath();c.moveTo(0,80);c.quadraticCurveTo(14,20,0,-20);c.stroke();c.fillStyle='#9ad0ff';c.beginPath();c.arc(-6,-34,22,0,TAU);c.arc(14,-28,14,0,TAU);c.fill();c.strokeStyle='#ffffff';c.lineWidth=2;c.stroke();}
 else{c.fillStyle='#fff4d0';c.beginPath();c.moveTo(-5,60);c.lineTo(-4,-80);c.lineTo(0,-96);c.lineTo(4,-80);c.lineTo(5,60);c.closePath();c.fill();c.fillStyle=GOLD;c.fillRect(-18,58,36,7);c.fillRect(-3,64,6,26);c.globalCompositeOperation='lighter';c.strokeStyle='#ffe9a0';c.lineWidth=2;c.beginPath();c.moveTo(0,-90);c.lineTo(0,55);c.stroke();}
 c.restore();}
function ground(c,s){const T0=s.T,x=s.x,a=s.a;const show=s.revealed?s.after*s.fade:ease((T0-T.fuse)/.6);if(show<=0)return;const open=s.revealed?1:back((T0-T.bloom)/.8);
 c.save();c.translate(450,s.feet+12);c.scale(1.5*mix(.7,1,clamp(open)),1.1*mix(.7,1,clamp(open)));c.globalAlpha=show;c.drawImage(x.big,-150,-120);c.restore();halo(c,a.glow,450,s.feet,500,160,show*.5);
 const age=T0-T.fuse;if(age>=0&&age<.9)ring(c,450,s.feet+10,40+age*500,PURPLE,8*(1-age/.9),1-age/.9,(40+age*500)*.25);}
function front(c,s){const T0=s.T,x=s.x,a=s.a;
 // phù văn từ 3 pháp thân bay về dệt chữ 道
 if(T0>=T.runes[0]&&T0<T.descend+1){const C={x:450,y:s.H*.15},form=ease((T0-T.runes[0])/(T.glyph-T.runes[0])),fall=ease((T0-T.descend)/.6);
  c.save();c.globalCompositeOperation='lighter';T.runes.forEach((at,j)=>{const u=clamp((T0-at)/.7);if(u<=0||u>=1)return;const src=seat(j%3,s),px=mix(src.x,C.x,ease(u)),py=mix(src.y-160,C.y,ease(u));halo(c,a.glow,px,py,70,70,1);c.fillStyle=LOTUS[j%3];c.font='700 28px "Microsoft YaHei",serif';c.textAlign='center';c.globalAlpha=1-u*.3;c.fillText('☰☱☲☳☴☵☶☷'[j%8],px,py+10);});c.restore();
  if(form>0){const gy=mix(C.y,s.head+10,fall),sc=mix(mix(.25,1,form),.12,fall);c.save();c.globalAlpha=Math.min(1,form*1.3);c.translate(450,gy);c.drawImage(x.glyph,-160*sc,-160*sc,320*sc,320*sc);c.restore();halo(c,a.glow,450,gy,400*sc+60,400*sc+60,.6);}
  const g=T0-T.glyph;if(g>=0&&g<1){ring(c,C.x,C.y,60+g*500,GOLD,9*(1-g),1-g);}}
 // tử khí xoáy vào đan điền
 if(T0>=T.swirl[0]-.4&&T0<T.impact){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const u=((rnd(i)+T0*.9)%1),ang=i*2.4+T0*3*s.dir,r=(1-u)*380;c.globalAlpha=u*.8;c.fillStyle=i%3?PURPLE:GOLD;c.fillRect(450+Math.cos(ang)*r,s.belly+Math.sin(ang)*r*.5,3,3);}c.restore();}
 T.merge.forEach(at=>{const age=T0-at-.5;if(age>=0&&age<.6){ring(c,450,s.belly,18+age*520,PURPLE,10*(1-age/.6)+1,1-age/.6,(18+age*520)*.6);halo(c,a.glow,450,s.belly,420,420,1-age/.6);}});
 if(s.revealed){const k=s.after*s.fade;for(let i=0;i<3;i++){const ang=s.clock*.7+i*TAU/3,z=Math.sin(ang);const px=450+Math.cos(ang)*200,py=s.belly-80+z*40;halo(c,a.glow,px,py,60,60,k);c.save();c.globalAlpha=k;c.fillStyle=LOTUS[i];c.beginPath();c.arc(px,py,7,0,TAU);c.fill();c.restore();}}}
export const DT14_SPEC=Object.freeze({realm:14,...T,title:'Đạo Tổ',subtitle:'Nhất Khí Hóa Tam Thanh',color:PURPLE,accent:GOLD,sky:['#0a0614','#24123a','#06040a'],groundTop:'#4a3a62',bg:'/assets/worlds-v2/cosmos.png',bgAlpha:.45,glowMid:'#ecdcffc0',beats:BEATS,hits:DT14_HITS,palette:{main:PURPLE,main2:'#8a5ad8',soft:'#fbf6ff',gold:GOLD}});
export function drawDaoToAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,DT14_SPEC,{assets,sky,back:backLayer,ground,front});}
