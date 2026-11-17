// Vĩnh Kiếp Đạo Quân v2 — "Vạn Kiếp Nghịch Lưu" (15/11/2026). 54 s; nổ 47,5; đổi skin 47,85 (giữ mốc late-ascension-data).
// Cơ chế riêng (không lặp Thái Sơ: la bàn/lục địa/rồng; không lặp Đại La v2: màn xám + đồng hồ + búng tay):
// 3 xoáy thời không xé trời (3 cú) → 3 dòng thời hà đổ xuống đập đất (3 cú) → mảnh ký ức trôi theo dòng, va nhau từng cặp (8 cú) →
// kiếp cũ tràn bờ: 3 đợt sóng cát hổ phách dâng sau lưng, 6 bóng tiền kiếp hiện ra (6 cú) →
// Sa Lậu Thiên Kiếp giáng xuống chặn dòng: vạn vật đóng băng, cát treo lơ lửng, màu chuyển chàm lạnh, 4 nhịp gợn băng →
// sa lậu lật ngược: mọi thứ tua lại — dòng chảy ngược lên trời, mảnh ký ức bay về xoáy, bóng tiền kiếp lùi vào thân (6 nhịp tua) →
// bóng quá khứ (hổ phách) và vị lai (tím) hợp vào thân (3 cú), cát sa lậu rót vào đan điền, xoáy khép → tối, 2 nhịp tim →
// NỔ: sa lậu vỡ, mảnh thủy tinh văng, sóng thời gian → hiện thân: tiểu sa lậu sau đầu cát chảy, 3 dải thời hà quấn quanh.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {lateRealmBackdrop} from './late-ascension-art.js';

export const VK=Object.freeze({clashEnd:9,duration:54,flood:19,hourglass:27,freeze:27.25,flip:34,rewindEnd:41.5,merge:42,pour:44,collapse:45.6,dark:46.4,impact:47.5,reveal:47.85,fade:52.4});
export const VK_VORTEX=Object.freeze([.2,.8,1.4]);
export const VK_PULSES=Object.freeze([2.6,3.8]);
export const VK_EMERGE=Object.freeze([8.6,9.8,11.0]);
export const VK_RIVERS=Object.freeze([5.0,6.0,7.0]);
export const VK_CLASH=Object.freeze(Array.from({length:8},(_,i)=>12+i*.8));
export const VK_SURGE=Object.freeze([19,21,23]);
export const VK_GHOSTS=Object.freeze(Array.from({length:6},(_,i)=>24+i*.5));
export const VK_TICKS=Object.freeze([28.4,29.6,30.8,32.0]);
export const VK_REWIND=Object.freeze(Array.from({length:6},(_,i)=>35.2+i*1.0));
export const VK_MERGE=Object.freeze([42,43,44]);
export const VK_BEATS=Object.freeze([46.8,47.15]);
export const VINH_KIEP_DURATION=54000;
const BEATS=[[0,'Nghe tiếng kiếp xưa'],[5,'Ba nhánh thời hà đổ xuống'],[12,'Những năm tháng va vào nhau'],[19,'Kiếp cũ tràn bờ'],[27,'Chặn dòng giữa một nhịp thở'],[34,'Đảo ngược thời hà'],[42,'Hợp quá khứ và vị lai'],[47.5,'Phá kiếp'],[47.85,'Đạo Quân hiện thân']];

const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const back=x=>{x=clamp(x);const s=1.6;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*157.3+91.1)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len)=>age>=0&&age<len?Math.exp(-age/len*5):0;
const EMBER='#ff916a',AMBER='#ffc46a',CRIMSON='#d8344a',VIOLET='#b48cff',ICE='#9fb8ff',SAND='#ffd99a';
const PALETTE={main:EMBER,main2:CRIMSON,soft:'#fff2e6',gold:AMBER};

export function vinhKiepHits(){return [
 ...VK_VORTEX.map((a,i)=>[a,1.2+i*.2]),...VK_PULSES.map((a,i)=>[a,1.1+i*.2]),...VK_RIVERS.map((a,i)=>[a+.55,1.4+i*.15]),...VK_EMERGE.map((a,i)=>[a,1.0+i*.1]),...VK_CLASH.map((a,i)=>[a+.35,1.0+i*.08]),
 ...VK_SURGE.map((a,i)=>[a+.6,1.4+i*.2]),...VK_GHOSTS.map(a=>[a,.8]),[VK.hourglass+.25,2.4],...VK_TICKS.map(a=>[a,.7]),
 [VK.flip,1.8],[VK.flip+.8,1.4],...VK_REWIND.map((a,i)=>[a,.9+i*.08]),...VK_MERGE.map((a,i)=>[a+.7,1.3+i*.25]),
 [VK.pour,1.0],[VK.collapse,1.6],...VK_BEATS.map(a=>[a,.6]),[VK.impact,2.9]];}
function hitPower(T){let p=0;for(const [a,f] of vinhKiepHits()){const age=T-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}

// Đồng hồ hành động: chạy xuôi → đứng yên khi sa lậu chặn → chạy ngược khi lật → xuôi lại.
export function flowClock(T){
 if(T<VK.freeze)return T;
 if(T<VK.flip)return VK.freeze+(1-Math.exp(-(T-VK.freeze)*6))*.08;
 const base=VK.freeze+.08;
 if(T<VK.rewindEnd)return base-ease((T-VK.flip-.4)/(VK.rewindEnd-VK.flip-.4))*(VK.freeze-VK.clashEnd);
 return base-(VK.freeze-VK.clashEnd)+(T-VK.rewindEnd);
}

export function vinhKiepState(k,H=1600,motion=true){
 const T=clamp(k)*VK.duration,feet=H*.73;
 return {k:clamp(k),T,H,motion,clock:motion?T:0,flow:motion?flowClock(T):0,feet,belly:feet-145,head:feet-338,
  frozen:ease((T-VK.freeze)/.35)*(1-ease((T-VK.flip)/.5)),rewind:T>=VK.flip&&T<VK.rewindEnd+.5?ease((T-VK.flip-.4)/.5)*(1-ease((T-VK.rewindEnd)/.5)):0,
  vortex:VK_VORTEX.reduce((n,a)=>n+ease((T-a)/.45),0)/3*(1-ease((T-VK.collapse)/.7)),
  rivers:VK_RIVERS.map(a=>ease((T-a)/.55)*(1-ease((T-VK.merge)/1.6))),
  flood:VK_SURGE.reduce((n,a)=>n+ease((T-a)/1.0),0)/3*(1-ease((T-VK.flip-.6)/3)),
  glass:ease((T-VK.hourglass)/.25)*(1-ease((T-VK.impact)/.05)),
  dark:ease((T-VK.dark)/.4)*(1-ease((T-VK.impact)/.12)),bang:pulse(T-VK.impact,1),
  revealed:T>=VK.reveal,after:ease((T-VK.reveal)/1.3),fade:1-ease((T-VK.fade)/1.4)};
}

function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function glowSprite(inner,mid,outer){return surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.22,mid);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,128,128);});}
function vortexSprite(){return surface(320,320,c=>{c.translate(160,160);c.globalCompositeOperation='lighter';
 for(let arm=0;arm<5;arm++){c.beginPath();for(let j=0;j<=60;j++){const u=j/60,a=arm/5*TAU+u*5.2,r=8+u*150;const x=Math.cos(a)*r,y=Math.sin(a)*r*.42;j?c.lineTo(x,y):c.moveTo(x,y);}
  c.strokeStyle=arm%2?'#ffb08acc':'#d86a9acc';c.lineWidth=5;c.globalAlpha=.7;c.stroke();c.strokeStyle='#fff0e0';c.lineWidth=1.4;c.globalAlpha=.8;c.stroke();}
 const g=c.createRadialGradient(0,0,0,0,0,60);g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#ffd0a8d0');g.addColorStop(1,'#ff916a00');c.globalAlpha=1;c.fillStyle=g;c.fillRect(-60,-60,120,120);});}
function shardSprite(i){return surface(110,76,c=>{c.translate(55,38);
 c.beginPath();c.moveTo(-48,-30);c.lineTo(44,-34);c.lineTo(50,28);c.lineTo(-44,32);c.closePath();
 const g=c.createLinearGradient(-48,-34,50,32);g.addColorStop(0,i%2?'#3a1830e0':'#2a1a3ae0');g.addColorStop(1,i%2?'#7a3a3ae0':'#4a2f6ae0');c.fillStyle=g;c.fill();
 c.save();c.clip();c.fillStyle='#ffd9b0';c.globalAlpha=.85;
 const k=i%6;
 if(k===0){c.beginPath();c.moveTo(-40,24);c.lineTo(-10,-14);c.lineTo(10,8);c.lineTo(26,-6);c.lineTo(46,24);c.closePath();c.fill();}
 else if(k===1){c.fillRect(-4,-20,8,30);c.beginPath();c.arc(0,-24,6,0,TAU);c.fill();c.fillRect(-16,-6,32,4);}
 else if(k===2){c.beginPath();c.moveTo(-30,20);c.lineTo(30,-22);c.lineTo(34,-18);c.lineTo(-26,24);c.closePath();c.fill();c.fillRect(-34,16,10,10);}
 else if(k===3){for(let j=0;j<3;j++){const w=30-j*8;c.fillRect(-w/2,14-j*12,w,8);}}
 else if(k===4){c.beginPath();c.arc(0,0,16,0,TAU);c.fill();c.fillStyle='#2a1a3a';c.beginPath();c.arc(6,-4,14,0,TAU);c.fill();}
 else{c.beginPath();c.arc(-10,-2,8,0,TAU);c.arc(12,-2,8,0,TAU);c.fill();c.fillRect(-16,6,10,18);c.fillRect(6,6,10,18);}
 c.restore();c.strokeStyle=i%2?AMBER:'#e4c4ff';c.lineWidth=2.2;c.beginPath();c.moveTo(-48,-30);c.lineTo(44,-34);c.lineTo(50,28);c.lineTo(-44,32);c.closePath();c.stroke();});}
function hourglassFrame(){return surface(380,600,c=>{c.translate(190,300);
 const gold=c.createLinearGradient(-190,0,190,0);gold.addColorStop(0,'#6a4a1a');gold.addColorStop(.5,'#ffe2a0');gold.addColorStop(1,'#6a4a1a');
 for(const y of [-280,262]){c.fillStyle=gold;c.fillRect(-170,y,340,18);c.fillStyle='#3a2410';c.fillRect(-150,y+(y<0?18:-8),300,8);}
 for(const x of [-150,150]){c.fillStyle=gold;c.fillRect(x-7,-262,14,524);for(let j=0;j<6;j++){c.beginPath();c.arc(x,-200+j*80,10,0,TAU);c.fill();}}
 const bulb=s=>{c.beginPath();c.moveTo(-120,s*-262);c.bezierCurveTo(-130,s*-120,-20,s*-40,-10,0);c.lineTo(10,0);c.bezierCurveTo(20,s*-40,130,s*-120,120,s*-262);c.closePath();};
 for(const s of [1,-1]){bulb(s);const g=c.createLinearGradient(-120,0,120,0);g.addColorStop(0,'#ffffff30');g.addColorStop(.3,'#ffffff08');g.addColorStop(.8,'#ffffff18');g.addColorStop(1,'#ffffff38');c.fillStyle=g;c.fill();c.strokeStyle='#ffe8c8';c.lineWidth=2.5;c.stroke();}
 c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.globalAlpha=.5;c.lineWidth=5;c.beginPath();c.moveTo(-96,-240);c.bezierCurveTo(-104,-150,-60,-90,-30,-50);c.stroke();c.beginPath();c.moveTo(-96,240);c.bezierCurveTo(-104,150,-60,90,-30,50);c.stroke();});}
function ghostOf(scene,im,color){if(!im)return null;const key=color;im._ghosts??=new Map();if(im._ghosts.has(key))return im._ghosts.get(key);
 const g=surface(im.width,im.height,c=>{c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(c.canvas,0,0);c.drawImage(c.canvas,0,0);c.globalCompositeOperation='source-atop';c.fillStyle=color;c.globalAlpha=.78;c.fillRect(0,0,im.width,im.height);
  c.globalCompositeOperation='destination-in';c.globalAlpha=1;const f=c.createLinearGradient(0,im.height*.55,0,im.height);f.addColorStop(0,'#000');f.addColorStop(1,'#0000');c.fillStyle=f;c.fillRect(0,0,im.width,im.height);});
 im._ghosts.set(key,g);return g;}

function assets(scene,H){
 const cache=scene.vinhKiepAssets;if(cache?.H===H)return cache;
 const deep=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0412');g.addColorStop(.45,'#2a0e22');g.addColorStop(1,'#070308');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<240;i++){c.globalAlpha=.25+rnd(i+40)*.6;c.fillStyle=i%5?'#ffe8dc':AMBER;const r=rnd(i+90)*1.7+.4;c.fillRect(rnd(i)*900,rnd(i+400)*H*.6,r,r);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.52,180,450,H*.52,H*.74);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000000');g.addColorStop(1,'#000000e0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const ground=surface(900,320,c=>{c.translate(450,70);c.beginPath();c.moveTo(-300,0);c.bezierCurveTo(-230,-30,230,-30,300,0);
  const under=[[260,34],[210,70],[150,96],[90,150],[30,190],[-30,160],[-90,130],[-160,92],[-230,56],[-280,24]];for(const [x,y] of under)c.lineTo(x,y+(rnd(x)-.5)*12);c.closePath();
  const g=c.createLinearGradient(0,-30,0,190);g.addColorStop(0,'#4a2a2e');g.addColorStop(.25,'#1c0e12');g.addColorStop(1,'#060204');c.fillStyle=g;c.fill();c.strokeStyle='#ffb08a';c.globalAlpha=.7;c.lineWidth=2;c.stroke();
  c.save();c.scale(1,.24);c.globalAlpha=.55;c.strokeStyle=AMBER;c.lineWidth=3;for(let j=0;j<12;j++){const a=j/12*TAU;c.beginPath();c.moveTo(Math.cos(a)*140,-40+Math.sin(a)*140);c.lineTo(Math.cos(a)*240,-40+Math.sin(a)*240);c.stroke();}
  c.beginPath();c.arc(0,-40,240,0,TAU);c.stroke();c.beginPath();c.arc(0,-40,140,0,TAU);c.stroke();c.restore();});
 const out={H,deep,vignette,ground,vortex:vortexSprite(),shards:Array.from({length:6},(_,i)=>shardSprite(i)),hourglass:hourglassFrame(),
  glow:glowSprite('#ffffff','#ffd8c0c0','#ff916a00'),cold:glowSprite('#ffffff','#c8d4ffc0','#9fb8ff00')};
 scene.vinhKiepAssets=out;return out;
}
function halo(c,im,x,y,w,h,a){if(!im||a<=.01)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r,rot=0){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,rot,0,TAU);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:25}),to:structuredClone(e.visualTo||{...live,realm:26})};snapshots.set(e,pair);return pair;}

const VORTEX_POS=[[230,.13],[450,.07],[670,.13]];
function vortexAt(i,s,dir){const [x,y]=VORTEX_POS[i];return {x:450+(x-450)*dir,y:s.H*y};}
function drawVortices(c,a,s,T,dir){if(s.vortex<=0)return;for(let i=0;i<3;i++){const open=ease((T-VK_VORTEX[i])/.45)*(1-ease((T-VK.collapse-i*.12)/.6));if(open<=0)continue;const v=vortexAt(i,s,dir),sc=(i===1?1.35:1)*open,spin=s.flow*(.9+i*.2)*(i%2?-1:1);
 c.save();c.translate(v.x,v.y);c.rotate(spin);c.scale(sc,sc);c.globalCompositeOperation='lighter';c.globalAlpha=.9;c.drawImage(a.vortex,-160,-160);c.restore();
 const age=T-VK_VORTEX[i];if(age>=0&&age<1.2)ring(c,v.x,v.y,30+age*420,i%2?AMBER:EMBER,8*(1-age/1.2),1-age/1.2,(30+age*420)*.42);
 halo(c,a.glow,v.x,v.y,260*sc,160*sc,.5);
 for(const at of VK_PULSES){const pa=T-at;if(pa>=0&&pa<1){ring(c,v.x,v.y,60+pa*300,i%2?'#ffffff':AMBER,9*(1-pa),(1-pa)*.9,(60+pa*300)*.42);halo(c,a.glow,v.x,v.y,420,300,(1-pa)*.9);
  c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#fff0e0';c.lineWidth=3;c.globalAlpha=(1-pa)*.9;c.beginPath();let x=v.x,y=v.y;c.moveTo(x,y);for(let j=0;j<7;j++){x+=(rnd(j+i*11+at*3)-.5)*70;y+=40+rnd(j+i)*30;c.lineTo(x,y);}c.stroke();c.restore();}}}}
// thời hà: thác sáng từ xoáy xuống đất rồi chảy về chân
function riverPath(i,s,dir){const v=vortexAt(i,s,dir),land={x:450+[-260,0,260][i]*dir,y:s.feet+40+[20,70,20][i]};const cx=mix(v.x,land.x,.5)+[-30,40,30][i]*dir;
 return {v,land,cx,cy:mix(v.y,land.y,.55),feet:s.feet};}
function riverPoint(P,u){if(u<.72){const k=u/.72;return [(1-k)**2*P.v.x+2*(1-k)*k*P.cx+k*k*P.land.x,(1-k)**2*P.v.y+2*(1-k)*k*P.cy+k*k*P.land.y];}const k=(u-.72)/.28;return [mix(P.land.x,450,k*.75),mix(P.land.y,P.feet+30,k)];}
function drawRivers(c,a,s,T,dir,light){for(let i=0;i<3;i++){const on=s.rivers[i];if(on<=0)continue;const P=riverPath(i,s,dir),grow=ease((T-VK_RIVERS[i])/.55),N=40;
 const cold=s.frozen,col=cold>.5?ICE:i===1?AMBER:EMBER;
 c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(const [w,al,colr] of [[90,.12,col],[48,.2,col],[22,.4,col],[7,.8,'#fff4e6']]){c.lineWidth=w*(i===1?1.2:1)*mix(.5,1,grow);c.strokeStyle=colr;c.globalAlpha=al*on;c.beginPath();for(let j=0;j<=N*grow;j++){const [x,y]=riverPoint(P,j/N);j?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 // dải chảy: nét đứt trôi theo đồng hồ hành động (đứng khi đóng băng, ngược khi tua)
 for(const [off,dash,w] of [[-14,[26,40],3],[0,[14,22],4],[15,[34,30],2.5]]){c.setLineDash(dash);c.lineDashOffset=-s.flow*(240+off*4);c.lineWidth=w;c.strokeStyle=off?SAND:'#ffffff';c.globalAlpha=.75*on;c.beginPath();for(let j=0;j<=N*grow;j++){const [x,y]=riverPoint(P,j/N);j?c.lineTo(x+off,y):c.moveTo(x+off,y);}c.stroke();}c.setLineDash([]);
 // hạt năm tháng
 const n=light?10:24;for(let j=0;j<n;j++){const u=((j/n+s.flow*.12+i*.3)%1+1)%1;if(u>grow)continue;const [x,y]=riverPoint(P,u),r=2+rnd(j+i*50)*3;c.globalAlpha=on*.9;c.fillStyle=j%3?SAND:'#ffffff';c.fillRect(x-r/2+(rnd(j)-.5)*20,y-r/2,r,r);}
 c.restore();
 const age=T-VK_RIVERS[i]-.55;if(age>=0&&age<1.3){ring(c,P.land.x,P.land.y,20+age*360,col,10*(1-age/1.3),1-age/1.3,(20+age*360)*.24);for(let j=0;j<12;j++){const ang=-Math.PI*(.1+rnd(j+i*20)*.8),sp=200+rnd(j)*300;c.save();c.globalAlpha=1-age/1.3;c.fillStyle=SAND;c.fillRect(P.land.x+Math.cos(ang)*sp*age,P.land.y+Math.sin(ang)*sp*age+age*age*500,4,4);c.restore();}}}}
// mảnh ký ức
function shardPos(j,s,T,dir){const P=riverPath(j%3,s,dir),birth=7.6+j*.22,f=s.flow;if(f<birth)return null;
 const travel=clamp((f-birth)/2.2);let [x,y]=riverPoint(P,travel*.7);
 const orbit=clamp((f-birth-2.2)/1.2),ang=j*2.4+f*.6*(j%2?1:-1),ox=450+Math.cos(ang)*(250+(j%4)*40),oy=s.head+80+Math.sin(ang)*120+(j%3-1)*60;
 x=mix(x,ox,ease(orbit));y=mix(y,oy,ease(orbit));
 const k=Math.floor(j/2);if(k<8){const at=VK_CLASH[k],u=clamp((f-at)/.35);if(u>0){const mx=450+(k%2?1:-1)*(120+k*14)*dir,my=s.head+20+(k%3)*70;x=mix(x,mx+(j%2?-14:14),ease(u));y=mix(y,my,ease(u));if(f>=at+.35)return null;}}
 const rew=s.rewind>0&&T>VK.flip?ease((T-VK.flip-.4-(j%8)*.25)/1.6):0;if(rew>0){const v=vortexAt(j%3,s,dir);x=mix(x,v.x,rew);y=mix(y,v.y,rew);}
 return {x,y,rot:Math.sin(f*1.3+j)*.4,sc:rew>0?1-rew*.7:1};}
function drawEmerge(c,a,s,T,dir){VK_EMERGE.forEach((at,k)=>{const age=T-at;if(age<0||age>1)return;const P=riverPath(k,s,dir);ring(c,P.land.x,P.land.y-40,20+age*320,k%2?VIOLET:AMBER,8*(1-age),1-age,(20+age*320)*.5);halo(c,a.glow,P.land.x,P.land.y-60,360,360,(1-age)*.9);
 c.save();c.globalCompositeOperation='lighter';for(let j=0;j<10;j++){const ang=-Math.PI*(.15+j/10*.7),d=age*(200+rnd(j+k*7)*180);c.globalAlpha=1-age;c.strokeStyle=j%2?'#ffffff':SAND;c.lineWidth=2.5;c.beginPath();c.moveTo(P.land.x+Math.cos(ang)*d*.5,P.land.y-40+Math.sin(ang)*d*.5);c.lineTo(P.land.x+Math.cos(ang)*d,P.land.y-40+Math.sin(ang)*d);c.stroke();}c.restore();});}
function drawShards(c,a,s,T,dir,front=true){if(T<7.6||T>VK.rewindEnd+1)return;for(let j=0;j<24;j++){const p=shardPos(j,s,T,dir);if(!p)continue;if((Math.abs(p.x-450)>=150)!==front)continue;c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(p.sc*.95,p.sc*.95);c.globalAlpha=.92;c.drawImage(a.shards[j%6],-55,-38);
 if(s.frozen>0){c.globalCompositeOperation='lighter';c.globalAlpha=s.frozen*.35;c.drawImage(a.cold,-60,-45,120,90);}c.restore();}
 if(!front)return;VK_CLASH.forEach((at,k)=>{const age=s.flow-at-.35;if(age<0||age>.9||T>=VK.flip)return;const mx=450+(k%2?1:-1)*(120+k*14)*dir,my=s.head+20+(k%3)*70;halo(c,a.glow,mx,my,260,260,1-age/.9);ring(c,mx,my,10+age*300,k%2?AMBER:VIOLET,7*(1-age/.9),1-age/.9);
  c.save();c.globalCompositeOperation='lighter';for(let j=0;j<14;j++){const ang=j/14*TAU+k,d=age*(260+rnd(j+k*9)*200);c.globalAlpha=1-age/.9;c.strokeStyle=j%2?'#ffffff':AMBER;c.lineWidth=2;c.beginPath();c.moveTo(mx+Math.cos(ang)*d*.6,my+Math.sin(ang)*d*.6);c.lineTo(mx+Math.cos(ang)*d,my+Math.sin(ang)*d);c.stroke();}c.restore();});}
// sóng cát hổ phách tràn bờ
function drawFlood(c,s,T,light){if(s.flood<=0)return;const H=s.H,top=mix(s.feet,H*.18,s.flood*.9),f=s.flow;c.save();c.globalCompositeOperation='lighter';
 for(let layer=0;layer<(light?2:3);layer++){c.beginPath();c.moveTo(0,H);for(let x=0;x<=900;x+=30){const y=top+layer*60+Math.sin(x*.012+f*(1.4+layer*.3)+layer)*30+Math.sin(x*.031-f*2)*12;c.lineTo(x,y);}c.lineTo(900,H);c.closePath();
  const g=c.createLinearGradient(0,top+layer*60-30,0,s.feet);g.addColorStop(0,['#ffc46a90','#ff916a70','#d8344a60'][layer]);g.addColorStop(1,'#00000000');c.fillStyle=g;c.globalAlpha=(s.frozen>.5?.45:.8)*Math.min(1,s.flood*1.4);c.fill();}
 c.restore();VK_SURGE.forEach((at,i)=>{const age=T-at-.6;if(age>=0&&age<1)ring(c,450,top+20,80+age*700,AMBER,8*(1-age),1-age,(80+age*700)*.18);});}
// bóng tiền kiếp
function ghostPlacement(i,s,dir){const side=i%2?1:-1,k=Math.floor(i/2);return {x:450+side*(150+k*95)*dir,y:s.feet-8-k*24,sc:.86-k*.08};}
function drawGhosts(c,a,s,T,image,dir){if(T<VK_GHOSTS[0]||!image)return;const amber=ghostOf(null,image,'#ffb070'),vio=ghostOf(null,image,'#b48cff');
 for(let i=5;i>=0;i--){const at=VK_GHOSTS[i],show=ease((T-at)/.3),G=ghostPlacement(i,s,dir);let x=G.x,y=G.y,al=show*.82;
  const back=T>VK.flip?ease((T-VK.flip-1-i*.45)/1.1):0;if(back>0){x=mix(x,450,back);al*=1-back;}if(al<=.01)continue;
  const im=i%2?vio:amber;if(!im)continue;c.save();c.globalAlpha=al;c.translate(x,y);c.scale(G.sc,G.sc);c.drawImage(im,-320,-590);c.restore();
  const age=T-at;if(age>=0&&age<.6)ring(c,x,y-160,20+age*260,i%2?VIOLET:AMBER,6*(1-age/.6),1-age/.6);}
 // hợp quá khứ + vị lai
 VK_MERGE.forEach((at,k)=>{const u=ease((T-at)/.7);if(u<=0||u>=1)return;const side=k%2?1:-1;const x=mix(450+side*360*dir,450,u),im=k%2?vio:amber;if(!im)return;c.save();c.globalAlpha=.75*(1-u*.6);c.translate(x,s.feet);c.scale(1.05,1.05);c.drawImage(im,-320,-590);c.restore();});}
// sa lậu
function drawHourglass(c,a,s,T,front){if(s.glass<=0&&!s.revealed)return;
 if(s.revealed){if(front)return;const k=s.after*s.fade;c.save();c.translate(450,s.head-150);c.scale(.26,.26);c.globalAlpha=k*.85;c.drawImage(a.hourglass,-190,-300);const lv=(s.clock*.08)%1;sandFill(c,1-lv,lv,k,true);c.restore();halo(c,a.glow,450,s.head-150,200,200,k*.45);return;}
 if(front)return;const drop=back((T-VK.hourglass)/.3),y=mix(-500,s.head+10,clamp(drop)),flip=ease((T-VK.flip)/.8),rot=flip*Math.PI;
 const shrink=ease((T-VK.collapse)/1.0);c.save();c.translate(450,y);c.rotate(rot);c.scale(1.05*(1-shrink*.85),1.05*(1-shrink*.85));c.globalAlpha=s.glass;c.drawImage(a.hourglass,-190,-300);
 const run=ease((T-VK.hourglass)/6),pour=ease((T-VK.pour)/2.2),top=T<VK.flip?.8-run*.6:0,bottom=T<VK.flip?.2+run*.6:(.8)*(1-pour);
 sandFill(c,top,bottom,s.glass,T<VK.flip?T>=VK.hourglass+.3:T>=VK.pour&&pour<1);c.restore();
 const age=T-VK.hourglass-.25;if(age>=0&&age<1.4){ring(c,450,s.head+10,40+age*900,ICE,14*(1-age/1.4),1-age/1.4,(40+age*900)*.5);halo(c,a.cold,450,s.head+10,900,900,(1-age/1.4)*.8);}}
function bulbPath(c,s){c.moveTo(-120,s*-262);c.bezierCurveTo(-130,s*-120,-20,s*-40,-10,0);c.lineTo(10,0);c.bezierCurveTo(20,s*-40,130,s*-120,120,s*-262);c.closePath();}
function sandFill(c,top,bottom,al,pouring){c.save();c.globalAlpha*=al;c.beginPath();bulbPath(c,1);bulbPath(c,-1);c.clip();
 const g=c.createLinearGradient(0,-260,0,260);g.addColorStop(0,'#ffe6b0');g.addColorStop(.5,'#f0a85a');g.addColorStop(1,'#c8742a');c.fillStyle=g;c.globalAlpha*=.82;
 if(top>.01){const y=-8-250*top;c.beginPath();c.moveTo(-140,y);c.quadraticCurveTo(0,y+26,140,y);c.lineTo(140,0);c.lineTo(-140,0);c.closePath();c.fill();}
 if(bottom>.01){const h=250*bottom;c.beginPath();c.moveTo(-140,262);c.lineTo(-140,262-h*.55);c.quadraticCurveTo(0,262-h*1.25,140,262-h*.55);c.lineTo(140,262);c.closePath();c.fill();}
 if(pouring){c.fillRect(-2.5,-4,5,262);}
 c.globalCompositeOperation='lighter';c.fillStyle='#fff6dc';for(let i=0;i<40;i++){const y=(rnd(i)*2-1)*250;if(y<0?-y>250*top+8:y<262-250*bottom*1.1)continue;c.globalAlpha=.5;c.fillRect((rnd(i+40)-.5)*200,y,2.4,2.4);}c.restore();}
function drawPour(c,a,s,T){if(T<VK.pour||T>=VK.impact)return;const k=ease((T-VK.pour)/.4)*(1-ease((T-VK.collapse-.6)/.5));if(k<=0)return;c.save();c.globalCompositeOperation='lighter';
 const g=c.createLinearGradient(0,s.head+10,0,s.belly);g.addColorStop(0,'#ffe0a0');g.addColorStop(1,'#ffffff');c.fillStyle=g;c.globalAlpha=k*.85;const w=6+Math.sin(s.clock*20)*1.5;c.fillRect(450-w/2,s.head+10,w,s.belly-s.head-10);c.restore();
 halo(c,a.glow,450,s.belly,180,180,k*.8);}
function drawGlassBurst(c,a,s,T,light){const age=T-VK.impact;if(age<0||age>3.2)return;const n=light?16:36;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const ang=rnd(i+3)*TAU,sp=360+rnd(i)*700,d=sp*age,x=450+Math.cos(ang)*d,y=s.head+Math.sin(ang)*d+age*age*200,r=8+rnd(i+7)*16;c.save();c.translate(x,y);c.rotate(age*(4+rnd(i)*8));c.globalAlpha=clamp(1-age/3.2);
  c.strokeStyle='#fff4e6';c.fillStyle='#ffd8c040';c.lineWidth=1.6;c.beginPath();c.moveTo(-r,-r*.3);c.lineTo(r*.3,-r);c.lineTo(r,r*.5);c.closePath();c.fill();c.stroke();c.restore();}c.restore();
 for(let i=0;i<10;i++){const u=clamp((age-i*.07)/1.8);if(u<=0||u>=1)continue;const r=60+ease(u)*1250;ring(c,450,s.belly,r,i%3===0?AMBER:i%2?VIOLET:EMBER,16*(1-u)+2,(1-u)*.9,r*.5);}
 halo(c,a.glow,450,s.belly,1500,1500,s.bang*.85);}
function drawTimeRibbons(c,s,front){if(!s.revealed)return;const k=s.after*s.fade;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 for(let i=0;i<3;i++){const col=[EMBER,AMBER,VIOLET][i];c.strokeStyle=col;c.lineWidth=3;c.beginPath();let started=false;
  for(let j=0;j<=60;j++){const u=j/60,ang=u*TAU*1.2+s.clock*(.6+i*.15)+i*2.1,z=Math.sin(ang);if((z>0)!==front){started=false;continue;}const x=450+Math.cos(ang)*(190+i*30),y=s.belly-60-i*70+z*40+u*0;
   c.globalAlpha=k*.75;if(!started){c.moveTo(x,y);started=true;}else c.lineTo(x,y);}c.stroke();}c.restore();}

export function drawVinhKiepAwakening(scene,c,e,t,H){
 const s=vinhKiepState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),T=s.T,dir=v.flip?-1:1,light=scene.budget?.level==='light';
 const kq=qiRemap(s.k,VK.impact/VK.duration),origin={x:450,y:s.belly};
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 c.fillStyle='#07030a';c.fillRect(0,0,900,H);if(a.deep)c.drawImage(a.deep,0,0,900,H);
 const painted=lateRealmBackdrop(26);
 if(painted){c.save();const slide=s.motion?Math.sin(s.clock*.1)*14:0;c.globalAlpha=mix(.5,.95,ease((T-VK_RIVERS[0])/4));c.drawImage(painted,-30+slide,-30,960,H+60);c.restore();}
 drawScreenPulse(c,H,scene.reduceFlash,EMBER,hit*.06);
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false?(hit*15+s.bang*18)*(1-s.frozen*.85):0;c.translate(Math.sin(T*79)*shake,Math.cos(T*67)*shake*.6);
 drawVortices(c,a,s,T,dir);
 drawFlood(c,s,T,light);
 drawRivers(c,a,s,T,dir,light);
 drawHourglass(c,a,s,T,false);
 if(a.ground&&!(T>=VK.impact&&T<VK.reveal+1)){c.save();c.globalAlpha=T>=VK.impact?ease((T-VK.reveal-.2)/1):1;c.drawImage(a.ground,0,s.feet-70,900,320);c.restore();}
 drawGhosts(c,a,s,T,image,dir);
 drawTimeRibbons(c,s,false);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 drawGlassBurst(c,a,s,T,light);
 drawShards(c,a,s,T,dir,false);
 if(image){c.save();c.globalAlpha=clamp(T/.15);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawTimeRibbons(c,s,true);
 drawEmerge(c,a,s,T,dir);
 drawShards(c,a,s,T,dir);
 drawPour(c,a,s,T);
 VK_MERGE.forEach(at=>{const age=T-at-.7;if(age>=0&&age<.6){ring(c,450,s.belly,18+age*520,AMBER,10*(1-age/.6)+1,1-age/.6,(18+age*520)*.6);halo(c,a.glow,450,s.belly,420,420,1-age/.6);}});
 if(s.revealed){const k=s.after*s.fade;ring(c,450,s.belly,16,AMBER,2,k*.9,6);}
 drawQiCompression(c,kq,origin);
 c.restore();
 // đóng băng: phủ chàm lạnh + gợn băng
 if(s.frozen>0){c.save();c.globalCompositeOperation=light?'source-over':'color';c.globalAlpha=s.frozen*(light?.25:.62);c.fillStyle='#3a4a8a';c.fillRect(0,0,900,H);c.restore();
  VK_TICKS.forEach(at=>{const age=T-at;if(age>=0&&age<1)ring(c,450,s.head,30+age*700,ICE,6*(1-age),s.frozen*(1-age),(30+age*700)*.55);});}
 if(s.rewind>0&&!light){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const y=((i*137+s.clock*-900)%H+H)%H;c.globalAlpha=s.rewind*.22;c.fillStyle=i%2?AMBER:VIOLET;c.fillRect(0,y,900,2);}c.restore();
  VK_REWIND.forEach(at=>{const age=T-at;if(age>=0&&age<.7)ring(c,450,s.belly,600*(1-age/.7)+20,AMBER,5,(1-age/.7)*.8,(600*(1-age/.7)+20)*.5);});}
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.88;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...VK_BEATS.map(at=>pulse(T-at,.3)));ring(c,450,s.belly,14+beat*34,AMBER,2+beat*3,s.dark*(.5+beat*.5));halo(c,a.glow,450,s.belly,60,60,s.dark);}
 drawScreenPulse(c,H,scene.reduceFlash,'#fff4ec',s.bang*.34);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const b=Math.max(0,BEATS.findLastIndex(([at])=>at<=T));
 const ui={k:s.k,realm:26,phase:s.revealed?'reveal':'gather',revealed:s.revealed,color:EMBER,title:'Vĩnh Kiếp Đạo Quân',subtitle:'PHI THĂNG · Cõi Thái Hư Thiên Ngoại' /* 17/11 chủ game: 4 cảnh giới cuối hiện chữ PHI THĂNG */,name:String(e.name||'Đạo hữu').normalize('NFC'),label:BEATS[b][1],detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.save();c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fff0e6';c.fillText(ui.name,450,H*.05);c.font='700 34px Arial';c.fillText(s.revealed?'VĨNH KIẾP ĐẠO QUÂN':ui.label,450,H*.09);c.restore();}
 return ui;
}
