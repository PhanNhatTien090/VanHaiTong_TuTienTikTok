// Thần Quân v2 — "Lôi Cổ Chấn Thiên" (15/11/2026). 38,5 s; nổ 33,1; đổi skin 33,45.
// Mây giông sà xuống (3 cú sấm xa) → 12 lôi cổ rơi xuống xếp vòng quanh người (12 cú) → lần lượt bị nện, mỗi trống phóng sét xuống đất (12 cú) →
// lôi long (ảnh god-forms thunder-dragon) bừng thành khung quanh người, gầm 3 lần → lưới sét nối các trống, 6 đợt bùng →
// VẠN LÔI QUÁN THỂ: 9 tia sét lớn lần lượt giáng vào người → 12 trống thu vào đan điền (2 cú) → tối → nổ.
import {TAU,clamp,ease,mix,back,rnd,pulse,surface,halo,ring,art,drawDivineRitual} from './divine-kit.js';
import {divineTiming} from './divine-timing.js';
const TM=divineTiming(16);
export const TQ16=Object.freeze({...TM,storm:[.2,.9,1.6],drums:Array.from({length:12},(_,i)=>2.6+i*.5),strikes:Array.from({length:12},(_,i)=>9+i*.5),dragon:[15.5,17.0,18.4],grid:Array.from({length:6},(_,i)=>19.5+i),bolts:Array.from({length:9},(_,i)=>25.5+i*.5),collapse:[30.6,31.6]});
const T=TQ16,BLUE='#8ac8ff',WHITE='#f0f6ff',VIOLET='#b08aff';
export const TQ16_HITS=Object.freeze([...T.storm.map((a,i)=>[a,1+i*.2]),...T.drums.map((a,i)=>[a+.35,.7+i*.03]),...T.strikes.map((a,i)=>[a,1.1+i*.04]),...T.dragon.map((a,i)=>[a,1.6+i*.2]),
 ...T.grid.map((a,i)=>[a,1+i*.1]),...T.bolts.map((a,i)=>[a,1.4+i*.06]),...T.collapse.map((a,i)=>[a,1.5+i*.3]),[T.impact-.55,.6],[T.impact-.27,.6],[T.impact,3]]);
const BEATS=[[0,'Lôi vân áp đỉnh'],[2.6,'Thập nhị lôi cổ'],[9,'Lôi cổ chấn thiên'],[15.5,'Lôi long thức tỉnh'],[19.5,'Thiên lôi đại trận'],[25.5,'Vạn lôi quán thể'],[T.impact,'Phá lôi'],[T.reveal,'Thần Quân hiện thân']];
function drumSprite(){return surface(150,130,c=>{c.translate(75,65);const body=c.createLinearGradient(-60,0,60,0);body.addColorStop(0,'#3a1a10');body.addColorStop(.5,'#a0482a');body.addColorStop(1,'#3a1a10');c.fillStyle=body;c.fillRect(-56,-30,112,60);
 c.fillStyle='#e8d8b8';c.beginPath();c.ellipse(0,-30,56,16,0,0,TAU);c.fill();c.strokeStyle='#ffd88a';c.lineWidth=3;c.stroke();c.beginPath();c.ellipse(0,30,56,16,0,0,Math.PI);c.stroke();
 c.fillStyle='#ffd88a';for(let i=0;i<9;i++){const x=-50+i*12.5;c.beginPath();c.arc(x,-22,2.4,0,TAU);c.fill();c.beginPath();c.arc(x,24,2.4,0,TAU);c.fill();}
 c.strokeStyle='#8ac8ff';c.lineWidth=2;c.beginPath();c.moveTo(-12,-34);c.lineTo(4,-28);c.lineTo(-6,-24);c.lineTo(10,-18);c.stroke();});}
function cloudBank(H){return surface(900,420,c=>{for(let i=0;i<40;i++){const x=rnd(i+300)*1000-50,y=60+rnd(i+330)*260,r=90+rnd(i+360)*120;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%3?'#4a5478e8':'#6a76a0e8');g.addColorStop(1,'#10142000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}});}
function assets(scene,H){if(scene.thanQuanAssets?.H===H)return scene.thanQuanAssets;const out={H,drum:drumSprite(),clouds:cloudBank(H)};scene.thanQuanAssets=out;return out;}
const drumPos=(i,s)=>{const a=-Math.PI/2+i*TAU/12+s.clock*.08*s.dir*ease((s.T-T.grid[0])/2),col=ease((s.T-T.collapse[0])/1.6);const R=mix(330,0,col),x=450+Math.cos(a)*R,y=s.head+20+Math.sin(a)*R*.62;return {x,y:mix(y,s.belly,col),sc:(.62+.38*(Math.sin(a)+1)/2)*(1-col*.8),z:Math.sin(a),col};};
function bolt(c,x0,y0,x1,y1,seed,w,col,al){c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';const pts=[[x0,y0]];const n=9;for(let i=1;i<n;i++){const u=i/n;pts.push([mix(x0,x1,u)+(rnd(seed*13+i)-.5)*70*(1-Math.abs(u-.5)),mix(y0,y1,u)+(rnd(seed*7+i)-.5)*20]);}pts.push([x1,y1]);
 for(const [lw,cl,a2] of [[w*4,col,.25],[w*1.8,col,.6],[w*.7,'#ffffff',1]]){c.globalAlpha=al*a2;c.strokeStyle=cl;c.lineWidth=lw;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 if(seed%2){const k=4+Math.floor(rnd(seed)*3),[bx,by]=pts[k];c.globalAlpha=al*.6;c.strokeStyle=col;c.lineWidth=w*.8;c.beginPath();c.moveTo(bx,by);c.lineTo(bx+(rnd(seed+2)-.5)*120,by+40+rnd(seed+3)*60);c.stroke();}c.restore();}
function sky(c,s){const T0=s.T,x=s.x;const dn=ease((T0-T.storm[0])/2.4)*(1-ease((T0-T.impact)/1.2));if(dn<=0)return;c.save();c.globalAlpha=dn;c.drawImage(x.clouds,0,mix(-420,-60,dn),900,420);c.drawImage(x.clouds,900,mix(-380,-20,dn),-900,420);c.restore();
 T.storm.forEach((at,i)=>{const age=T0-at;if(age>=0&&age<.5){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(1-age/.5)*.4;const fg=c.createLinearGradient(0,0,0,s.H*.5);fg.addColorStop(0,'#c8dcff');fg.addColorStop(1,'#c8dcff00');c.fillStyle=fg;c.fillRect(0,0,900,s.H*.5);c.restore();bolt(c,[200,640,420][i],-10,[260,600,470][i],s.H*.22,i+40,BLUE,1.4,1-age/.5);}});}
function backLayer(c,s){const T0=s.T,x=s.x,a=s.a;
 if(s.revealed){const k=s.after*s.fade;for(let i=0;i<12;i++){const ang=-Math.PI/2+i*TAU/12+s.clock*.3,px=450+Math.cos(ang)*190,py=s.head-60+Math.sin(ang)*80;c.save();c.globalAlpha=k*.85;c.translate(px,py);c.scale(.32,.32);c.drawImage(x.drum,-75,-65);c.restore();}
  if(Math.floor(s.clock*3)%2===0)bolt(c,450-120,s.head-40,450+120,s.head-40,Math.floor(s.clock*6),BLUE,1,k*.6);halo(c,a.glow,450,s.head-40,320,200,k*.35);return;}
 // lôi long thành khung
 const dImg=art('/assets/god-forms-v1/thunder-dragon.png'),dk=ease((T0-T.dragon[0])/.6)*(1-ease((T0-T.collapse[0])/1.2));
 if(dImg&&dk>0){const roar=Math.max(...T.dragon.map(at=>pulse(T0-at,.8))),sc=1+roar*.06;c.save();c.globalAlpha=dk*(.75+roar*.25);c.globalCompositeOperation='lighter';c.translate(450,s.feet-330);c.scale(sc,sc);c.drawImage(dImg,-330,-640,660,1280);c.restore();}
 T.dragon.forEach(at=>{const age=T0-at;if(age>=0&&age<1)ring(c,450,s.head-80,60+age*600,BLUE,10*(1-age),1-age,(60+age*600)*.8);});
 if(T0<T.drums[0])return;const P=Array.from({length:12},(_,i)=>drumPos(i,s));
 // lưới sét
 const gk=ease((T0-T.grid[0])/.6)*(1-ease((T0-T.collapse[0])/.8));if(gk>0){const seed=Math.floor(s.clock*14);for(let i=0;i<12;i++){if(rnd(seed+i)<.45)bolt(c,P[i].x,P[i].y,P[(i+1)%12].x,P[(i+1)%12].y,seed+i,VIOLET,2.4,gk*.9);if(rnd(seed+i+50)<.18)bolt(c,P[i].x,P[i].y,450,s.head-60,seed+i+9,BLUE,2.6,gk);}
  T.grid.forEach(at=>{const age=T0-at;if(age>=0&&age<.5){for(let i=0;i<12;i++)bolt(c,P[i].x,P[i].y,P[(i+5)%12].x,P[(i+5)%12].y,i+Math.floor(at*10),WHITE,3,1-age/.5);halo(c,a.glow,450,s.head,900,700,(1-age/.5)*.5);}});}
 // trống (sau lưng nếu z<0)
 for(let i=0;i<12;i++)if(P[i].z<0)drawDrum(c,s,i,P[i]);}
function drawDrum(c,s,i,p){const T0=s.T,x=s.x,a=s.a,at=T.drums[i];if(T0<at||p.col>=1)return;const fall=back((T0-at)/.4),y=mix(-120,p.y,clamp(fall)),hit=pulse(T0-T.strikes[i],.8),beat=T0>=T.bolts[0]?pulse((T0*4+i*.3)%1,.25):0,sc=p.sc*(1+hit*.18+beat*.08);
 c.save();c.translate(p.x,y);c.scale(sc,sc);c.drawImage(x.drum,-75,-65);c.restore();
 const land=T0-at-.35;if(land>=0&&land<.5)ring(c,p.x,p.y,10+land*160,BLUE,5*(1-land/.5),1-land/.5,(10+land*160)*.4);
 if(hit>.05){halo(c,a.glow,p.x,p.y-20*p.sc,260*p.sc,260*p.sc,hit);bolt(c,p.x,p.y,p.x+(rnd(i)-.5)*60,s.feet+20,i+7,BLUE,3.2,Math.min(1,hit*1.6));ring(c,p.x,p.y-20,20+(1-hit)*200,WHITE,6*hit,hit);}}
function front(c,s){const T0=s.T,a=s.a;if(T0>=T.drums[0]&&!s.revealed){const P=Array.from({length:12},(_,i)=>drumPos(i,s));for(let i=0;i<12;i++)if(P[i].z>=0)drawDrum(c,s,i,P[i]);}
 T.bolts.forEach((at,i)=>{const age=T0-at;if(age<0||age>.75)return;const k=1-age/.75;bolt(c,450+(rnd(i)-.5)*300,-20,450,s.head+40,i+90,i%2?VIOLET:BLUE,6,k);bolt(c,450+(rnd(i+5)-.5)*500,-20,450,s.head+60,i+120,WHITE,3,k*.8);halo(c,a.glow,450,s.head+30,500,500,k);if(!s.reduceFlash){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=k*.18;c.fillStyle='#c8dcff';c.fillRect(0,0,900,s.H);c.restore();}});
 if(T0>=T.bolts[0]&&T0<T.collapse[0]+.4){const seed=Math.floor(s.clock*16);for(let j=0;j<3;j++){const ang=rnd(seed+j)*TAU;bolt(c,450+Math.cos(ang)*120,s.belly-100+Math.sin(ang)*160,450,s.belly-60,seed+j,BLUE,1,.8);}}
 T.collapse.forEach((at,i)=>{const age=T0-at;if(age>=0&&age<.7){ring(c,450,s.belly,18+age*600,i?WHITE:BLUE,10*(1-age/.7)+1,1-age/.7,(18+age*600)*.6);halo(c,a.glow,450,s.belly,440,440,1-age/.7);}});}
export const TQ16_SPEC=Object.freeze({realm:16,...T,title:'Thần Quân',subtitle:'Lôi Cổ Chấn Thiên',color:BLUE,accent:'#ffd88a',sky:['#04060c','#101830','#04050a'],groundTop:'#3a4258',bg:'/assets/worlds-v2/cosmos.png',bgAlpha:.35,glowMid:'#d8e8ffc0',beats:BEATS,hits:TQ16_HITS,palette:{main:BLUE,main2:VIOLET,soft:'#f4f8ff',gold:'#ffd88a'}});
export function drawThanQuanAwakening(scene,c,e,t,H){return drawDivineRitual(scene,c,e,t,H,TQ16_SPEC,{assets,sky,back:backLayer,front});}
