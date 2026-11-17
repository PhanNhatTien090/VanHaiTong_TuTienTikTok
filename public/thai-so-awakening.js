// Thái Sơ Giới Chủ v2 — "Vạn Lục Quy Đồ" (15/11/2026). 52 s; nổ 45,0; đổi skin 45,35 (giữ mốc cũ của late-ascension-data).
// Cơ chế riêng (không lặp Diệt Thế/Thiên Ma/Ma Thần: không hố đen, hành tinh, kiếm, khe trời, mắt, trăng):
// 3 cú địa chấn nứt nền đá → 8 địa mạch chạy ra mép màn hình, leo lên trời →
// La bàn Thái Sơ ráp 5 vòng (mỗi vòng một cú) → trục trời bắn lên →
// 4 lục địa nổi trồi khỏi biển mây (mỗi khối một cú, đá rơi) → 5 cú lệch thiên trục: lục địa nghiêng, kim la bàn quay loạn →
// Địa Long đá ngọc trồi khỏi biển mây, gầm, quấn 3 vòng (lượn trước/sau người) →
// 12 kinh mạch từ lục địa đổ về la bàn → Thiên Đồ trải ngang trời, 4 ấn Đông/Tây/Nam/Bắc đóng xuống, nét bản đồ khép vòng →
// Thiên Đồ gấp 3 lần bay vào la bàn → 4 lục địa thu nhỏ nhập đan điền → Địa Long lao vào → tối, 2 nhịp tim →
// NỔ: nền đá vỡ tung, mảnh đá văng, cột sáng ngọc → hiện thân: la bàn sau đầu, 4 tiểu lục địa xoay quanh.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {lateRealmBackdrop} from './late-ascension-art.js';

export const TS=Object.freeze({duration:52,axis:9.0,clouds:10.4,dragon:22.6,channels:26.2,map:33.0,dragonIn:43.7,dark:44.0,impact:45.0,reveal:45.35,fade:50.4});
export const TS_QUAKES=Object.freeze([.2,.9,1.6]);
export const TS_VEINS=Object.freeze(Array.from({length:8},(_,i)=>2.4+i*.4));
export const TS_RINGS=Object.freeze([5.8,6.4,7.0,7.6,8.2]);
export const TS_LANDS=Object.freeze([11.0,12.4,13.8,15.2]);
export const TS_TILTS=Object.freeze([18.0,18.8,19.6,20.4,21.2]);
export const TS_COILS=Object.freeze([23.8,24.8,25.6]);
export const TS_CHANNELS=Object.freeze(Array.from({length:12},(_,i)=>26.2+i*.5));
export const TS_STAMPS=Object.freeze([34.4,35.2,36.0,36.8]);
export const TS_FOLDS=Object.freeze([38.0,38.7,39.4]);
export const TS_ABSORB=Object.freeze([40.2,41.1,42.0,42.9]);
export const TS_BEATS=Object.freeze([44.3,44.65]);
export const THAI_SO_DURATION=52000;
const BEATS=[[0,'Địa mạch thức tỉnh'],[5.8,'La bàn dựng trục trời'],[11,'Lục địa nổi khỏi biển mây'],[18,'Bốn cõi lệch khỏi thiên trục'],[22.6,'Địa Long thức tỉnh'],[26.2,'Vạn mạch quy kinh'],[33,'Khép Thiên Đồ'],[40.2,'Thu bốn cõi vào giới tâm'],[45,'Khai giới'],[45.35,'Giới Chủ hiện thân']];

const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const back=x=>{x=clamp(x);const s=1.6;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const pulse=(age,len)=>age>=0&&age<len?Math.exp(-age/len*5):0;
const JADE='#70f6df',JADE2='#2bb8a4',SILVER='#e6f4f2',GOLD='#ffe1a0',DEEP='#062a2c',SEAL='#d9483e';
const PALETTE={main:JADE,main2:JADE2,soft:'#f2fffb',gold:GOLD};
const LAND_HOME=[[205,.25],[700,.215],[165,.50],[740,.475]];

export function thaiSoHits(){return [
 ...TS_QUAKES.map((a,i)=>[a,1.1+i*.25]),...TS_VEINS.map(a=>[a,.45]),...TS_RINGS.map((a,i)=>[a,.9+i*.12]),[TS.axis,1.9],
 ...TS_LANDS.map((a,i)=>[a+.6,1.3+i*.12]),...TS_TILTS.map((a,i)=>[a,1.1+i*.15]),[TS.dragon,2.0],...TS_COILS.map((a,i)=>[a,1.0+i*.2]),
 ...TS_CHANNELS.map(a=>[a+.45,.5]),[TS.map,1.0],...TS_STAMPS.map((a,i)=>[a,1.4+i*.1]),...TS_FOLDS.map((a,i)=>[a,1.0+i*.25]),
 ...TS_ABSORB.map((a,i)=>[a+.55,1.4+i*.2]),[TS.dragonIn+.5,2.0],...TS_BEATS.map(a=>[a,.6]),[TS.impact,2.9]];}
function hitPower(T){let p=0;for(const [a,f] of thaiSoHits()){const age=T-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}

export function thaiSoState(k,H=1600,motion=true){
 const T=clamp(k)*TS.duration,feet=H*.72;
 const quake=TS_QUAKES.reduce((n,a)=>n+ease((T-a)/.35),0)/3;
 return {k:clamp(k),T,H,motion,clock:motion?T:0,feet,belly:feet-145,head:feet-338,cx:450,cy:feet-380,
  quake,dim:1-ease((T-TS.axis)/2.5)*.65,clouds:ease((T-TS.clouds)/1.6),
  compassOut:ease((T-TS_ABSORB[3])/1.0),dark:ease((T-TS.dark)/.4)*(1-ease((T-TS.impact)/.12)),
  bang:pulse(T-TS.impact,1),blast:T>=TS.impact?1-ease((T-TS.impact)/3.4):0,
  revealed:T>=TS.reveal,after:ease((T-TS.reveal)/1.3),fade:1-ease((T-TS.fade)/1.4)};
}

function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
function glowSprite(inner,mid,outer){return surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.22,mid);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,128,128);});}
function island(seed){return surface(320,320,c=>{
 c.translate(160,96);const R=128,pts=[];
 for(let i=0;i<=14;i++){const u=i/14,x=mix(-R,R,u),d=Math.sin(u*Math.PI);pts.push([x+(rnd(seed*31+i)-.5)*18,d*(120+rnd(seed+i*7)*70)+12]);}
 c.beginPath();c.moveTo(-R,0);for(const [x,y] of pts)c.lineTo(x,y);c.lineTo(R,0);c.closePath();
 const body=c.createLinearGradient(0,0,0,210);body.addColorStop(0,'#3b4f52');body.addColorStop(.35,'#1a2628');body.addColorStop(1,'#05090a');c.fillStyle=body;c.fill();
 c.save();c.clip();c.strokeStyle='#5e7a7a';c.globalAlpha=.35;c.lineWidth=1.4;
 for(let i=1;i<6;i++){c.beginPath();c.moveTo(-R,i*26);for(let x=-R;x<=R;x+=16)c.lineTo(x,i*26+Math.sin(x*.05+i+seed)*6);c.stroke();}
 c.globalAlpha=1;c.globalCompositeOperation='lighter';c.strokeStyle=JADE;c.lineWidth=2;c.shadowColor=JADE;
 for(let i=0;i<4;i++){let x=(rnd(seed*13+i)-.5)*R*1.4,y=10;c.globalAlpha=.75;c.beginPath();c.moveTo(x,y);for(let j=0;j<6;j++){x+=(rnd(seed+i*9+j)-.5)*34;y+=18+rnd(i+j+seed)*16;c.lineTo(x,y);}c.stroke();}
 c.restore();
 // mặt trên
 c.beginPath();c.ellipse(0,0,R,26,0,0,TAU);const top=c.createLinearGradient(0,-26,0,26);top.addColorStop(0,'#5fae95');top.addColorStop(1,'#245a4c');c.fillStyle=top;c.fill();c.strokeStyle='#bff7e6';c.globalAlpha=.6;c.lineWidth=1.5;c.stroke();c.globalAlpha=1;
 // núi
 for(let i=0;i<4;i++){const x=(rnd(seed*7+i)-.5)*170,h=50+rnd(seed*3+i)*70,w=30+rnd(i+seed)*26;c.beginPath();c.moveTo(x-w,4);c.lineTo(x-w*.2,-h*.82);c.lineTo(x,-h);c.lineTo(x+w*.3,-h*.7);c.lineTo(x+w,4);c.closePath();
  const g=c.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'#2d4a48');g.addColorStop(.5,'#6d9890');g.addColorStop(1,'#1d3332');c.fillStyle=g;c.fill();c.fillStyle='#e8fff8';c.globalAlpha=.75;c.beginPath();c.moveTo(x-w*.2,-h*.82);c.lineTo(x,-h);c.lineTo(x+w*.3,-h*.7);c.lineTo(x+w*.05,-h*.74);c.closePath();c.fill();c.globalAlpha=1;}
 // lầu nhỏ
 const px=(rnd(seed+40)-.5)*90;c.fillStyle='#16201f';for(let k=0;k<3;k++){const w=28-k*7,y=-8-k*13;c.fillRect(px-w*.5,y,w,9);c.beginPath();c.moveTo(px-w*.8,y);c.lineTo(px,y-7);c.lineTo(px+w*.8,y);c.closePath();c.fill();}
 c.fillStyle=GOLD;c.globalAlpha=.85;c.fillRect(px-2,-15,4,4);c.globalAlpha=1;
 // thác
 const wx=R*(rnd(seed+50)>.5?.62:-.62),wf=c.createLinearGradient(0,4,0,170);wf.addColorStop(0,'#d8fff6d0');wf.addColorStop(1,'#d8fff600');c.fillStyle=wf;c.fillRect(wx-3,4,6,166);c.fillRect(wx+6,6,2,110);
});}
function ringSprite(i){const S=820;return surface(S,S,c=>{
 c.translate(S/2,S/2);const r0=[58,108,162,222,288][i],r1=r0+[34,40,44,48,54][i];
 c.beginPath();c.arc(0,0,r1,0,TAU);c.arc(0,0,r0,0,TAU,true);const g=c.createRadialGradient(0,0,r0,0,0,r1);g.addColorStop(0,'#0b3a3a70');g.addColorStop(.5,'#06201f88');g.addColorStop(1,'#0b3a3a70');c.fillStyle=g;c.fill();
 c.strokeStyle=SILVER;c.lineWidth=2.5;c.beginPath();c.arc(0,0,r1,0,TAU);c.stroke();c.lineWidth=1.5;c.beginPath();c.arc(0,0,r0,0,TAU);c.stroke();
 c.globalCompositeOperation='lighter';c.strokeStyle=JADE;c.globalAlpha=.55;c.lineWidth=1;c.beginPath();c.arc(0,0,(r0+r1)/2,0,TAU);c.stroke();c.globalAlpha=1;
 const n=[8,24,36,64,96][i];
 for(let j=0;j<n;j++){const a=j/n*TAU,cs=Math.cos(a),sn=Math.sin(a),major=j%(n/8)===0;c.strokeStyle=major?GOLD:'#bfeee4';c.lineWidth=major?2.4:1;c.globalAlpha=major?1:.7;
  const a0=major?r0+3:r1-(i>2?12:9);c.beginPath();c.moveTo(cs*a0,sn*a0);c.lineTo(cs*(r1-3),sn*(r1-3));c.stroke();}
 c.globalAlpha=1;
 if(i===1){for(let j=0;j<8;j++){c.save();c.rotate(j/8*TAU);c.translate(0,-(r0+r1)/2);c.strokeStyle=GOLD;c.lineWidth=3;for(let k=0;k<3;k++){const y=(k-1)*7,broken=(j>>k)&1;if(broken){c.beginPath();c.moveTo(-10,y);c.lineTo(-3,y);c.moveTo(3,y);c.lineTo(10,y);c.stroke();}else{c.beginPath();c.moveTo(-10,y);c.lineTo(10,y);c.stroke();}}c.restore();}}
 if(i===3){for(let j=0;j<24;j++){c.save();c.rotate(j/24*TAU+.13);c.translate(0,-(r0+r1)/2);c.fillStyle=j%2?JADE:SILVER;c.globalAlpha=.85;c.beginPath();c.arc(0,0,3.2,0,TAU);c.fill();c.beginPath();c.arc(0,-9,1.8,0,TAU);c.arc(0,9,1.8,0,TAU);c.fill();c.restore();}}
 if(i===4){c.font='600 22px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';const g8='乾兌離震巽坎艮坤';for(let j=0;j<8;j++){c.save();c.rotate(j/8*TAU);c.translate(0,-(r0+r1)/2);c.fillStyle=GOLD;c.fillText(g8[j],0,1);c.restore();}}
});}
function dragonScale(){return surface(80,80,c=>{c.translate(40,40);
 for(const [dy,al] of [[-14,.9],[0,1],[14,.9]]){c.beginPath();c.moveTo(14,dy-12);c.quadraticCurveTo(-6,dy-10,-16,dy);c.quadraticCurveTo(-6,dy+10,14,dy+12);c.quadraticCurveTo(6,dy,14,dy-12);c.closePath();
  const g=c.createLinearGradient(-16,0,14,0);g.addColorStop(0,'#a9e6d6');g.addColorStop(.5,'#3d6b62');g.addColorStop(1,'#14261f');c.globalAlpha=al;c.fillStyle=g;c.fill();c.strokeStyle='#62f0d2';c.lineWidth=1.4;c.stroke();}});}
function dragonHead(){return surface(240,170,c=>{c.translate(80,85);
 c.fillStyle='#1d302d';c.strokeStyle='#5ff0d4';c.lineWidth=2.5;
 for(const s of [-1,1]){c.beginPath();c.moveTo(-10,s*-22);c.quadraticCurveTo(-50,s*-70,-78,s*-60);c.quadraticCurveTo(-46,s*-50,-26,s*-14);c.closePath();c.fillStyle='#b9e8da';c.fill();c.stroke();}
 c.beginPath();c.moveTo(-40,-30);c.lineTo(30,-34);c.lineTo(110,-14);c.lineTo(140,-2);c.lineTo(112,8);c.lineTo(60,10);c.lineTo(118,30);c.lineTo(52,36);c.lineTo(-40,30);c.closePath();
 const g=c.createLinearGradient(-40,-34,0,36);g.addColorStop(0,'#6f9e93');g.addColorStop(.6,'#24403c');g.addColorStop(1,'#0b1514');c.fillStyle=g;c.fill();c.strokeStyle='#5ff0d4';c.stroke();
 c.fillStyle='#e9fff8';for(let i=0;i<5;i++){c.beginPath();c.moveTo(64+i*10,10);c.lineTo(68+i*10,19);c.lineTo(72+i*10,10);c.fill();}
 c.globalCompositeOperation='lighter';const e=c.createRadialGradient(36,-14,0,36,-14,16);e.addColorStop(0,'#ffffff');e.addColorStop(.3,'#ffe6a0');e.addColorStop(1,'#ffe6a000');c.fillStyle=e;c.fillRect(16,-34,40,40);
 c.strokeStyle='#bffcee';c.lineWidth=2;c.beginPath();c.moveTo(130,0);c.bezierCurveTo(160,-10,180,20,210,6);c.moveTo(118,24);c.bezierCurveTo(150,40,170,30,200,48);c.stroke();});}
function mapSprite(){return surface(820,300,c=>{
 const g=c.createLinearGradient(0,0,0,300);g.addColorStop(0,'#0d3b37e8');g.addColorStop(.5,'#0a2a28f0');g.addColorStop(1,'#0d3b37e8');c.fillStyle=g;c.fillRect(0,0,820,300);
 c.strokeStyle=GOLD;c.lineWidth=3;c.strokeRect(8,8,804,284);c.lineWidth=1;c.strokeRect(16,16,788,268);
 c.strokeStyle='#7fe9d4';c.globalAlpha=.25;for(let x=40;x<820;x+=40){c.beginPath();c.moveTo(x,16);c.lineTo(x,284);c.stroke();}for(let y=40;y<300;y+=40){c.beginPath();c.moveTo(16,y);c.lineTo(804,y);c.stroke();}c.globalAlpha=1;
 c.strokeStyle='#bff7ea';c.lineWidth=2;c.globalAlpha=.7;
 for(const [i,[mx,my]] of MAP_PTS.entries()){c.beginPath();for(let j=0;j<=18;j++){const a=j/18*TAU,r=46+rnd(i*20+j)*22;const x=mx+Math.cos(a)*r*1.3,y=my+Math.sin(a)*r*.7;j?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle='#2f6f62';c.globalAlpha=.5;c.fill();c.globalAlpha=.8;c.stroke();}
 c.globalAlpha=.45;c.strokeStyle='#7fe9d4';for(let i=0;i<30;i++){const x=40+rnd(i+300)*740,y=30+rnd(i+330)*240;c.beginPath();c.moveTo(x-6,y+4);c.lineTo(x,y-5);c.lineTo(x+6,y+4);c.stroke();}
 c.globalAlpha=1;
});}
const MAP_PTS=[[150,90],[640,80],[200,215],[660,210]];
function sealSprite(ch){return surface(110,110,c=>{c.translate(55,55);c.fillStyle=SEAL;c.globalAlpha=.92;c.fillRect(-44,-44,88,88);c.globalAlpha=1;c.strokeStyle='#ffd9c8';c.lineWidth=4;c.strokeRect(-38,-38,76,76);
 c.fillStyle='#fff1e6';c.font='700 52px "Microsoft YaHei","SimSun",serif';c.textAlign='center';c.textBaseline='middle';c.fillText(ch,0,3);});}
function cloudSea(H){return surface(1100,520,c=>{
 for(let i=0;i<60;i++){const x=130+rnd(i+700)*840,y=120+rnd(i+760)*360,r=70+rnd(i+820)*110;const g=c.createRadialGradient(x,y-r*.2,0,x,y,r);
  g.addColorStop(0,i%4?'#c8dcdcb0':'#e6f5f2c0');g.addColorStop(.55,'#7f9fa470');g.addColorStop(1,'#33505400');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 const fade=c.createLinearGradient(0,0,0,200);fade.addColorStop(0,'#000000ff');fade.addColorStop(1,'#00000000');c.globalCompositeOperation='destination-out';c.fillStyle=fade;c.fillRect(0,0,1100,200);
 for(const side of [0,1]){const e=c.createLinearGradient(side?1100:0,0,side?960:140,0);e.addColorStop(0,'#000000ff');e.addColorStop(1,'#00000000');c.fillStyle=e;c.fillRect(side?960:0,0,140,520);}
});}
function plateau(){return surface(900,300,c=>{c.translate(450,60);
 c.beginPath();c.moveTo(-270,0);c.bezierCurveTo(-210,-30,210,-30,270,0);const under=[[230,30],[200,64],[150,82],[120,120],[70,132],[30,176],[-10,150],[-60,128],[-110,108],[-160,74],[-215,52],[-250,24]];for(const [x,y] of under)c.lineTo(x+(rnd(x)-.5)*10,y);c.closePath();
 const g=c.createLinearGradient(0,-34,0,240);g.addColorStop(0,'#3e5856');g.addColorStop(.22,'#162321');g.addColorStop(1,'#040808');c.fillStyle=g;c.fill();c.strokeStyle='#8fd9c8';c.lineWidth=2;c.stroke();
 c.save();c.scale(1,.24);c.strokeStyle=JADE;c.globalAlpha=.55;c.lineWidth=3;for(const r of [110,170,230]){c.beginPath();c.arc(0,-40,r,0,TAU);c.stroke();}
 c.globalAlpha=.35;c.lineWidth=2;for(let j=0;j<16;j++){const a=j/16*TAU;c.beginPath();c.moveTo(Math.cos(a)*110,-40+Math.sin(a)*110);c.lineTo(Math.cos(a)*230,-40+Math.sin(a)*230);c.stroke();}c.restore();});}

function assets(scene,H){
 const cache=scene.thaiSoAssets;if(cache?.H===H)return cache;
 const deep=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#02090d');g.addColorStop(.5,'#06201f');g.addColorStop(1,'#020607');c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<260;i++){c.globalAlpha=.25+rnd(i+40)*.6;c.fillStyle=i%6?'#dff7f2':GOLD;const r=rnd(i+90)*1.7+.4;c.fillRect(rnd(i)*900,rnd(i+400)*H*.6,r,r);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.52,180,450,H*.52,H*.74);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000000');g.addColorStop(1,'#000000e0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const out={H,deep,vignette,lands:[0,1,2,3].map(i=>island(i+3)),rings:[0,1,2,3,4].map(ringSprite),scale:dragonScale(),head:dragonHead(),map:mapSprite(),
  seals:['東','西','南','北'].map(sealSprite),clouds:cloudSea(H),plateau:plateau(),glow:glowSprite('#ffffff','#b8fff0c0','#70f6df00'),warm:glowSprite('#ffffff','#ffe9b8c0','#ffc46a00'),
  cracks:Array.from({length:14},(_,i)=>{const a=(i/14)*TAU+rnd(i)*.3;let x=Math.cos(a)*80,y=Math.sin(a)*80*.32;const pts=[[x,y]];for(let j=0;j<9;j++){x+=Math.cos(a+(rnd(i*9+j)-.5)*.8)*(34+rnd(i+j)*28);y+=Math.sin(a+(rnd(i*5+j)-.5)*.8)*(34+rnd(i+j*3)*28)*.32;pts.push([x,y]);}return pts;})};
 scene.thaiSoAssets=out;return out;
}
function halo(c,im,x,y,w,h,a){if(!im||a<=.01)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
function ring(c,x,y,r,col,w,a,ry=r,rot=0){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,rot,0,TAU);c.stroke();c.restore();}
function poly(c,pts,stroke,w,a,frac=1){if(a<=.01)return;const n=Math.max(2,Math.ceil(pts.length*frac));c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=stroke;c.lineWidth=w;c.lineJoin='round';c.beginPath();for(let i=0;i<n&&i<pts.length;i++)i?c.lineTo(...pts[i]):c.moveTo(...pts[i]);c.stroke();c.restore();}

const snapshots=new WeakMap();
function players(scene,e){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:24}),to:structuredClone(e.visualTo||{...live,realm:25})};snapshots.set(e,pair);return pair;}

// 1. Nứt nền + địa mạch
function drawCracks(c,a,s,T){if(T<TS_QUAKES[0])return;const fx=450,fy=s.feet+8,fade=s.revealed?.5*s.fade:1;
 a.cracks.forEach((pts,i)=>{const q=TS_QUAKES[i%3],grow=ease((T-q)/.3),glow=.45+pulse(T-q,.6)*.8+hitPower(T)*.15;if(grow<=0)return;
  const abs=pts.map(([x,y])=>[fx+x,fy+y]);poly(c,abs,'#0a1312',7,.9*fade,grow);poly(c,abs,JADE2,9,glow*.35*fade,grow);poly(c,abs,JADE,2.8,glow*fade,grow);});}
function drawQuakeFx(c,a,s,T){const fx=450,fy=s.feet+8;
 TS_QUAKES.forEach((q,i)=>{const age=T-q;if(age<0||age>1.6)return;
  for(let j=0;j<14;j++){const ang=-Math.PI*(.12+rnd(j+i*40)*.76),sp=220+rnd(j*3+i)*380,x=fx+Math.cos(ang)*sp*age,y=fy+Math.sin(ang)*sp*age+age*age*700,r=4+rnd(j+i*7)*9;if(y>fy+40)continue;c.save();c.globalAlpha=clamp(1-age/1.6);c.fillStyle=j%3?'#2b3b39':'#7fd9c4';c.translate(x,y);c.rotate(age*6+j);c.fillRect(-r/2,-r/2,r,r*.8);c.restore();}
  a.cracks.forEach((pts,j)=>{if(j%3!==i)return;const [tx,ty]=pts[pts.length-1],h=pulse(age,1.2)*(360+rnd(j)*260);if(h<4)return;c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,fy+ty,0,fy+ty-h);g.addColorStop(0,'#bffff0d0');g.addColorStop(1,'#70f6df00');c.fillStyle=g;c.fillRect(fx+tx-7,fy+ty-h,14,h);c.restore();});
  halo(c,a.glow,fx,fy,500,180,pulse(age,.7)*.9);
  if(age>1.2)return;const u=age/1.2;ring(c,fx,fy,40+ease(u)*(420+i*120),i?JADE:SILVER,10*(1-u)+1,(1-u)*.85,(40+ease(u)*(420+i*120))*.22);});}
function veinPath(i,s,dir){const side=(i%2?1:-1)*dir,k=Math.floor(i/2),H=s.H,y0=s.feet+10;
 const pts=[[450,y0]];const ex=side>0?905:-5,ey=y0+30+k*55;for(let j=1;j<=6;j++){const u=j/6;pts.push([mix(450,ex,u),mix(y0,ey,u)+Math.sin(u*9+i)*14]);}
 for(let j=1;j<=7;j++){const u=j/7;pts.push([ex-side*(Math.sin(u*7+i)*16+8),mix(ey,H*(.08+k*.07),u)]);}return pts;}
function drawVeins(c,a,s,T,dir){TS_VEINS.forEach((at,i)=>{const age=T-at;if(age<0)return;const pts=veinPath(i,s,dir),run=clamp(age/.9),fade=s.revealed?.35*s.fade:mix(1,.55,ease((T-TS.clouds)/3));
 poly(c,pts,JADE2,10,.28*fade,run);poly(c,pts,JADE,3,.95*fade,run);poly(c,pts,'#ffffff',1,.7*fade,run);
 if(run<1){const [x,y]=pts[Math.min(pts.length-1,Math.floor(run*(pts.length-1)))];halo(c,a.glow,x,y,90,90,1);}});}

// 2. La bàn
function compassPos(s){const out=s.compassOut;return {x:450,y:mix(s.cy,s.belly,out*out),scale:mix(1,.05,out)};}
function needleAngle(s,T){if(T<TS_RINGS[4])return -1.2;if(T<TS.axis)return mix(-1.2,0,back((T-TS_RINGS[4])/.8));
 if(T>=TS_TILTS[0]&&T<TS.dragon){const wild=ease((T-TS_TILTS[0])/.4)*(1-ease((T-TS.dragon+.6)/.6));return Math.sin(T*9)*2.4*wild+T*6*wild;}return Math.sin(T*1.3)*.04;}
function drawCompass(c,a,s,T,dir,light){if(T<TS_RINGS[0]-.2||(s.compassOut>=1&&!s.revealed))return;const P=compassPos(s);
 if(s.revealed){const k=s.after*s.fade;c.save();c.translate(450,s.head-30);c.globalAlpha=k*.85;for(let i=0;i<3;i++){const im=a.rings[i+1],sc=.5;c.save();c.rotate((i%2?-1:1)*s.clock*(.12+i*.05));c.drawImage(im,-410*sc,-410*sc,820*sc,820*sc);c.restore();}c.restore();halo(c,a.glow,450,s.head-30,260,260,k*.5);return;}
 c.save();c.translate(P.x,P.y);c.scale(P.scale,P.scale);
 const tiltRoll=T>=TS_TILTS[0]&&T<TS.dragon?Math.sin(T*2.2)*.12*ease((T-TS_TILTS[0])/.4):0;c.rotate(tiltRoll);
 halo(c,a.glow,0,0,900,900,.18+pulse(T-TS.axis,1)*.6+(T>=TS.channels&&T<TS.map?.15:0));
 TS_RINGS.forEach((at,i)=>{const u=back((T-at)/.32);if(u<=0)return;const sc=mix(1.8,1,clamp(u))*(u>1?1:1),al=clamp((T-at)/.18);
  c.save();c.globalAlpha=al*(light&&i===4?.8:1);c.rotate((i%2?-1:1)*dir*(s.clock*(.05+i*.025))+(1-clamp(u))*1.2);c.scale(sc,sc);c.drawImage(a.rings[i],-410,-410);c.restore();
  const age=T-at;if(age>=0&&age<.6)ring(c,0,0,[75,128,184,246,315][i]*(1+age),i%2?GOLD:JADE,6*(1-age/.6),1-age/.6);});
 if(T>=TS_RINGS[4]){const ang=needleAngle(s,T);c.save();c.rotate(ang);c.globalCompositeOperation='lighter';c.fillStyle=GOLD;c.beginPath();c.moveTo(0,-300);c.lineTo(12,0);c.lineTo(0,40);c.lineTo(-12,0);c.closePath();c.globalAlpha=.9;c.fill();c.fillStyle='#ff8a6a';c.beginPath();c.moveTo(0,300);c.lineTo(9,0);c.lineTo(-9,0);c.closePath();c.globalAlpha=.6;c.fill();c.restore();
  halo(c,a.warm,0,0,80,80,.9);}
 c.restore();}
function drawAxis(c,a,s,T){if(T<TS.axis||T>=TS_ABSORB[3]+.6)return;const P=compassPos(s),age=T-TS.axis,shoot=ease(age/.25),w=6+pulse(age,1.2)*40+Math.sin(s.clock*7)*1.5;
 c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(0,0,0,s.H);g.addColorStop(0,'#70f6df00');g.addColorStop(.2,'#70f6dfa0');g.addColorStop(.6,'#e8fffaa0');g.addColorStop(1,'#70f6df00');
 c.fillStyle=g;c.globalAlpha=.75*(1-s.compassOut);const top=mix(P.y,-20,shoot);c.fillRect(450-w/2,top,w,s.H-top);c.globalAlpha=.9*(1-s.compassOut);c.fillStyle='#ffffff';c.fillRect(450-1.5,top,3,s.H-top);c.restore();
 if(age<1)halo(c,a.glow,450,P.y,700*(1+age),700*(1+age),1-age);}

// 3. Lục địa
function landPos(i,s,T,dir){const [hx,hy]=LAND_HOME[i],x0=450+(hx-450)*dir,y0=s.H*hy,at=TS_LANDS[i],rise=back((T-at)/.9);
 let x=x0,y=mix(s.H+260,y0,clamp(rise))+(rise>1?0:0)+Math.sin(s.clock*.8+i*1.7)*8,rot=0,sc=1;
 const tilt=TS_TILTS.reduce((n,a,j)=>n+ease((T-a)/.3)*(j%2?-1:1),0)*(i%2?-1:1);const tiltK=1-ease((T-TS.dragon)/1.2);rot+=tilt*.09*tiltK;x+=tilt*18*tiltK*(x0<450?-1:1);
 const ab=TS_ABSORB[i],u=ease((T-ab)/.6);if(u>0){x=mix(x,450,u);y=mix(y,s.belly,u*u);sc=mix(1,.05,u);rot+=u*3*dir;}
 return {x,y,rot,sc,shown:T>=at&&u<1,u};}
function drawLands(c,a,s,T,dir,light,back){for(let i=0;i<4;i++){const L=landPos(i,s,T,dir);if(!L.shown)continue;const isBack=i<2;if(isBack!==back)continue;
 const fade=T>=TS_STAMPS[i]&&T<TS_ABSORB[i]?.78:1;c.save();c.translate(L.x,L.y);c.rotate(L.rot);c.scale(L.sc*(i<2?.95:1.05),L.sc*(i<2?.95:1.05));c.globalAlpha=fade;c.drawImage(a.lands[i],-160,-96);c.restore();
 const age=T-TS_LANDS[i];if(age>=.7&&age<1.6){const u=(age-.7)/.9;ring(c,L.x,L.y+8,60+u*260,JADE,6*(1-u),1-u,(60+u*260)*.22);}
 if(!light&&age>0&&age<3.5){for(let j=0;j<10;j++){const t=age-j*.18;if(t<0)continue;const fx=L.x+(rnd(i*30+j)-.5)*200,fy=L.y+60+t*t*240;if(fy>s.H)continue;c.save();c.globalAlpha=clamp(1-t/2.5);c.fillStyle='#2a3a39';c.fillRect(fx,fy,4+rnd(j)*6,4+rnd(j+4)*6);c.restore();}}
 if(L.u>0)halo(c,a.glow,L.x,L.y,200*(1-L.u)+40,200*(1-L.u)+40,.8);}}
// rơi đá khi lệch trục
function drawTiltDebris(c,s,T,light){if(T<TS_TILTS[0]||T>TS.dragon+2)return;const n=light?16:40;c.save();for(let i=0;i<n;i++){const at=TS_TILTS[i%5]+rnd(i)*.4,t=T-at;if(t<0||t>2.6)continue;const x=rnd(i+500)*900,y=-20+t*t*420+rnd(i+77)*200;c.globalAlpha=clamp(1-t/2.6)*.9;c.fillStyle=i%4?'#2c3d3b':'#5f8b84';const r=5+rnd(i+9)*9;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r,y);c.lineTo(x,y+r*.8);c.lineTo(x-r*.8,y);c.fill();}c.restore();}

// 4. Địa Long
function dragonPoint(s,T,u,dir){const age=T-TS.dragon,coil=TS_COILS.reduce((n,a)=>n+ease((T-a)/.5),0);const R=mix(420,250,coil/3),speed=1.15+coil*.18+(T>=TS.channels?.35:0);
 const a=-Math.PI/2+age*speed*dir-u*4.6*dir,cx=450,cy=s.cy+40;let x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R*.42+Math.sin(a*2.2+u*3)*34,z=Math.sin(a),sc=.62+.28*(z+1)/2;
 const emerge=ease((age-u*1.4)/.9);y+=(1-emerge)*(s.H*.55);x+=(1-emerge)*(dir*220);
 const dive=ease((T-TS.dragonIn-u*.55)/.45);if(dive>0){x=mix(x,450,dive);y=mix(y,s.belly,dive);sc*=mix(1,.08,dive);}
 return {x,y,z,sc,gone:dive>=1};}
function drawDragon(c,a,s,T,dir,front,light){if(T<TS.dragon||T>TS.dragonIn+1.2)return;const N=light?36:64;const pts=[];for(let i=0;i<=N;i++)pts.push(dragonPoint(s,T,i/N,dir));
 const wid=i=>(78*(1-i/N*.8))*pts[i].sc,on=i=>!pts[i].gone&&!pts[i+1].gone&&((pts[i].z+pts[i+1].z>0)===front);
 c.save();c.lineCap='round';c.lineJoin='round';
 for(const [col,k,dy,al] of [['#0a1514',1.12,0,1],['#28443f',1,0,1],['#5fbfaa',.42,-.26,.75],['#cfffee',.12,-.36,.6],['#0d1f1d',.3,.3,.5]]){
  c.strokeStyle=col;c.globalAlpha=al;for(let i=N-1;i>=0;i--){if(!on(i))continue;const w=wid(i);c.lineWidth=w*k;c.beginPath();c.moveTo(pts[i+1].x,pts[i+1].y+w*dy);c.lineTo(pts[i].x,pts[i].y+w*dy);c.stroke();}}
 c.globalAlpha=1;for(let i=N-1;i>=1;i--){if(!on(i))continue;const p=pts[i],q=pts[i-1],ang=Math.atan2(p.y-q.y,p.x-q.x),w=wid(i);
  if(i%2===0){c.save();c.translate(p.x,p.y);c.rotate(ang+Math.PI);c.globalAlpha=.85;c.drawImage(a.scale,-w*.38,-w*.38,w*.76,w*.76);c.restore();}
  if(i%2===1&&i<N-3){c.save();c.translate(p.x,p.y);c.rotate(ang);const fl=w*(.55+.25*Math.sin(s.clock*8+i)),sway=Math.sin(s.clock*6+i*.7)*w*.25;c.globalCompositeOperation='lighter';
   const g=c.createLinearGradient(0,-w*.4,0,-w*.4-fl);g.addColorStop(0,'#70f6dfd0');g.addColorStop(1,'#70f6df00');c.fillStyle=g;c.beginPath();c.moveTo(-w*.3,-w*.38);c.quadraticCurveTo(-w*.1+sway,-w*.4-fl*.6,w*.2+sway,-w*.4-fl);c.quadraticCurveTo(w*.05,-w*.5-fl*.3,w*.3,-w*.38);c.closePath();c.fill();c.restore();}}
 c.restore();
 const h=pts[0],h2=pts[2];if(!h.gone&&((h.z>0)===front)){const ang=Math.atan2(h.y-h2.y,h.x-h2.x),sc=h.sc*1.55;c.save();c.translate(h.x,h.y);c.rotate(ang);if(Math.cos(ang)<0)c.scale(1,-1);c.drawImage(a.head,-80*sc,-85*sc,240*sc,170*sc);c.restore();
  const roar=pulse(T-TS.dragon-.9,1.2);if(roar>0){for(let k=0;k<3;k++)ring(c,h.x,h.y,40+(1-roar)*400+k*50,k%2?GOLD:JADE,5*roar,roar*.9);}
  halo(c,a.glow,h.x,h.y,160*sc,160*sc,.5);}}

// 5. Kinh mạch về la bàn
function drawChannels(c,a,s,T,dir){if(T<TS.channels||T>TS.map+1.5)return;const P=compassPos(s),fade=1-ease((T-TS.map)/1.2);
 TS_CHANNELS.forEach((at,i)=>{const age=T-at;if(age<0)return;const L=landPos(i%4,s,T,dir),sx=L.x+(rnd(i)-.5)*120,sy=L.y+20,run=ease(age/.45);
  const cx1=mix(sx,P.x,.3)+(i%2?60:-60),cy1=mix(sy,P.y,.2)-120;c.save();c.globalCompositeOperation='lighter';c.strokeStyle=JADE;c.lineWidth=2.4;c.globalAlpha=.7*fade;c.beginPath();c.moveTo(sx,sy);
  const steps=18;for(let j=1;j<=steps*run;j++){const u=j/steps,x=(1-u)**2*sx+2*(1-u)*u*cx1+u*u*P.x,y=(1-u)**2*sy+2*(1-u)*u*cy1+u*u*P.y;c.lineTo(x,y);}c.stroke();c.restore();
  if(run<1){const u=run,x=(1-u)**2*sx+2*(1-u)*u*cx1+u*u*P.x,y=(1-u)**2*sy+2*(1-u)*u*cy1+u*u*P.y;halo(c,a.glow,x,y,70,70,1);}else if(age<.9)halo(c,a.glow,P.x,P.y,260,260,(.9-age)*1.2);});}

// 6. Thiên Đồ
function drawMap(c,a,s,T,dir){if(T<TS.map||T>TS_FOLDS[2]+.6)return;const W=820,Hm=300,x0=40,y0=s.H*.07,unroll=ease((T-TS.map)/1.1);
 const folds=TS_FOLDS.reduce((n,f)=>n+ease((T-f)/.3),0),fx=[1,.62,.34,.08][Math.floor(folds)]*(1-(folds%1))+[1,.62,.34,.08][Math.min(3,Math.floor(folds)+1)]*(folds%1);
 const fly=ease((T-TS_FOLDS[2]-.1)/.45),P=compassPos(s);const mx=mix(450,P.x,fly),my=mix(y0+Hm/2,P.y,fly),sc=mix(1,.1,fly);
 c.save();c.translate(mx,my);c.scale(fx*sc,sc);const half=W/2*unroll;c.beginPath();c.rect(-half,-Hm/2,half*2,Hm);c.clip();c.drawImage(a.map,-W/2,-Hm/2);
 // nét bản đồ khép vòng giữa các ấn
 const pts=MAP_PTS.map(([x,y])=>[x-W/2,y-Hm/2]),order=[0,1,3,2,0];c.globalCompositeOperation='lighter';c.strokeStyle=GOLD;c.lineWidth=3;c.setLineDash([12,8]);
 for(let k=0;k<4;k++){const g=ease((T-TS_STAMPS[k]-.15)/.6);if(g<=0)continue;const [ax,ay]=pts[order[k]],[bx,by]=pts[order[k+1]];c.globalAlpha=.9;c.beginPath();c.moveTo(ax,ay);c.lineTo(mix(ax,bx,g),mix(ay,by,g));c.stroke();}
 c.setLineDash([]);c.globalCompositeOperation='source-over';
 TS_STAMPS.forEach((at,k)=>{const age=T-at;if(age<0)return;const [px,py]=pts[k],u=clamp(age/.12),ss=mix(2.4,1,u);c.save();c.globalAlpha=clamp(age/.06);c.translate(px,py);c.rotate((k%2?.08:-.08));c.scale(ss,ss);c.drawImage(a.seals[k],-38,-38,76,76);c.restore();
  if(age<.7){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=SEAL;c.globalAlpha=1-age/.7;c.lineWidth=6;c.strokeRect(px-40-age*160,py-40-age*160,80+age*320,80+age*320);c.restore();}});
 c.restore();
 if(unroll<1&&unroll>0){for(const sx of [-1,1]){const rx=mx+sx*W/2*unroll*fx*sc;c.save();c.fillStyle='#4a3a24';c.fillRect(rx-9,my-Hm/2*sc-14,18,Hm*sc+28);c.fillStyle=GOLD;c.fillRect(rx-12,my-Hm/2*sc-20,24,8);c.fillRect(rx-12,my+Hm/2*sc+12,24,8);c.restore();}}}

// 7. Nổ + hiện thân
function drawShatter(c,a,s,T,light){const age=T-TS.impact;if(age<0||age>3.4)return;const n=light?14:30;c.save();
 for(let i=0;i<n;i++){const ang=-Math.PI*(.05+rnd(i+11)*.9),sp=380+rnd(i)*620,x=450+Math.cos(ang)*sp*age*(i%2?1:-1)*.9,y=s.feet+Math.sin(ang)*sp*age+age*age*520,r=10+rnd(i+5)*22;
  c.save();c.translate(x,y);c.rotate(age*(3+rnd(i)*6));c.globalAlpha=clamp(1-age/3.4);c.fillStyle='#22302f';c.strokeStyle=JADE;c.lineWidth=2;c.beginPath();c.moveTo(-r,-r*.4);c.lineTo(r*.2,-r);c.lineTo(r,r*.3);c.lineTo(-r*.3,r*.8);c.closePath();c.fill();c.stroke();c.restore();}
 c.restore();for(let i=0;i<10;i++){const u=clamp((age-i*.07)/1.8);if(u<=0||u>=1)continue;const r=60+ease(u)*1250;ring(c,450,s.belly,r,i%3===0?GOLD:i%2?SILVER:JADE,16*(1-u)+2,(1-u)*.9,r*.5);}
 halo(c,a.glow,450,s.belly,1500,1500,s.bang*.85);
 if(age<1.6){c.save();c.globalCompositeOperation='lighter';const w=60+age*160;const g=c.createLinearGradient(450-w,0,450+w,0);g.addColorStop(0,'#70f6df00');g.addColorStop(.5,'#e8fffa');g.addColorStop(1,'#70f6df00');c.fillStyle=g;c.globalAlpha=(1-age/1.6)*.8;c.fillRect(450-w,0,w*2,s.feet);c.restore();}}
function drawOrbitLands(c,a,s,T,front){if(!s.revealed)return;const k=s.after*s.fade;for(let i=0;i<4;i++){const ang=s.clock*.55+i*TAU/4,z=Math.sin(ang);if((z>0)!==front)continue;const x=450+Math.cos(ang)*250,y=s.belly-40+z*62,sc=.26+.08*(z+1)/2;
 c.save();c.globalAlpha=k*(.65+.35*(z+1)/2);c.translate(x,y);c.scale(sc,sc);c.drawImage(a.lands[i],-160,-96);c.restore();halo(c,a.glow,x,y+10,90,90,k*.35);}}

export function drawThaiSoAwakening(scene,c,e,t,H){
 const s=thaiSoState((t-e.start)/e.duration,H,scene.motion!==false),a=assets(scene,H),v=qiVariant(e),T=s.T,dir=v.flip?-1:1,light=scene.budget?.level==='light';
 const kq=qiRemap(s.k,TS.impact/TS.duration),origin={x:450,y:s.belly};
 const {from,to}=players(scene,e),p=s.revealed?to:from,image=maThanActorImage(scene,p,e),hit=hitPower(T)*(s.motion?1:.3);
 c.save();setFxPalette(PALETTE);
 c.fillStyle='#02080a';c.fillRect(0,0,900,H);if(a.deep)c.drawImage(a.deep,0,0,900,H);
 const painted=lateRealmBackdrop(25);
 if(painted){c.save();const slide=s.motion?Math.sin(s.clock*.12)*14:0;c.globalAlpha=mix(.42,.95,1-s.dim)*(s.revealed?1:1);c.drawImage(painted,-30+slide,-30,960,H+60);c.restore();}
 c.save();c.globalAlpha=s.dim*.42;c.fillStyle='#010506';c.fillRect(0,0,900,H);c.restore();
 drawScreenPulse(c,H,scene.reduceFlash,JADE,hit*.06);
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false?hit*15+s.bang*18:0;c.translate(Math.sin(T*79)*shake,Math.cos(T*67)*shake*.6);
 const roll=T>=TS_TILTS[0]&&T<TS.dragon?Math.sin((T-TS_TILTS[0])*2.6)*.035*(1-ease((T-TS.dragon+.8)/.8)):0;if(roll){c.translate(450,s.feet);c.rotate(roll);c.translate(-450,-s.feet);}
 drawVeins(c,a,s,T,dir);
 drawAxis(c,a,s,T);
 drawCompass(c,a,s,T,dir,light);
 drawLands(c,a,s,T,dir,light,true);
 drawChannels(c,a,s,T,dir);
 drawDragon(c,a,s,T,dir,false,light);
 // biển mây + nền đá
 const cloudX=s.motion?Math.sin(s.clock*.18)*40:0,drawClouds=(y,al)=>{if(a.clouds&&s.clouds>0){c.save();c.globalAlpha=s.clouds*al;c.drawImage(a.clouds,-100+cloudX,y,1100,520);c.restore();}};
 drawClouds(s.feet-150,.75);
 if(a.plateau&&!(T>=TS.impact&&T<TS.reveal+1.2)){c.save();c.globalAlpha=T>=TS.impact?ease((T-TS.reveal-.2)/1):1;c.drawImage(a.plateau,0,s.feet-60,900,300);c.restore();}
 drawClouds(s.feet+40,.85);
 drawCracks(c,a,s,T);
 drawLands(c,a,s,T,dir,light,false);
 drawOrbitLands(c,a,s,T,false);
 drawQiAura(scene,c,kq,origin,s.feet);drawQiImpact(scene,c,kq,H,origin,s.feet);
 drawShatter(c,a,s,T,light);
 if(image){c.save();c.globalAlpha=clamp(T/.15);c.drawImage(image,130,s.feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,s.feet,0);
 drawQuakeFx(c,a,s,T);
 drawDragon(c,a,s,T,dir,true,light);
 drawOrbitLands(c,a,s,T,true);
 // lõi giới tâm ở đan điền
 TS_ABSORB.forEach(at=>{const age=T-at-.55;if(age>=0&&age<.6){ring(c,450,s.belly,18+age*520,JADE,10*(1-age/.6)+1,1-age/.6,(18+age*520)*.6);halo(c,a.glow,450,s.belly,400,400,1-age/.6);}});
 if(T>=TS_ABSORB[0]+.55&&T<TS.impact){const n=TS_ABSORB.filter(at=>T>=at+.55).length;ring(c,450,s.belly,10+n*3,GOLD,2+n*.6,.9);halo(c,a.warm,450,s.belly,50+n*16,50+n*16,.8);}
 if(s.revealed){const k=s.after*s.fade;ring(c,450,s.belly,16,GOLD,2,k*.9,6);ring(c,450,s.feet+6,180+Math.sin(s.clock)*6,JADE,2,k*.6,40);}
 drawQiCompression(c,kq,origin);
 c.restore();
 drawTiltDebris(c,s,T,light);
 drawMap(c,a,s,T,dir);
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.88;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(0,...TS_BEATS.map(at=>pulse(T-at,.3)));ring(c,450,s.belly,14+beat*34,JADE,2+beat*3,s.dark*(.5+beat*.5));halo(c,a.warm,450,s.belly,60,60,s.dark);}
 drawScreenPulse(c,H,scene.reduceFlash,'#effffb',s.bang*.34);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const b=Math.max(0,BEATS.findLastIndex(([at])=>at<=T));
 const ui={k:s.k,realm:25,phase:s.revealed?'reveal':'gather',revealed:s.revealed,color:JADE,title:'Thái Sơ Giới Chủ',subtitle:'PHI THĂNG · Cõi Cửu Thiên Thượng Giới' /* 17/11 chủ game: 4 cảnh giới cuối hiện chữ PHI THĂNG */,name:String(e.name||'Đạo hữu').normalize('NFC'),label:BEATS[b][1],detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.save();c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#eafffb';c.fillText(ui.name,450,H*.05);c.font='700 34px Arial';c.fillText(s.revealed?'THÁI SƠ GIỚI CHỦ':ui.label,450,H*.09);c.restore();}
 return ui;
}
