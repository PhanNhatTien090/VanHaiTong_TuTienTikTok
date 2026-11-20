// 21/11/2026: NỮ OA — skin NỮ 500 coin (skin + Bổ Thiên Linh Châu cùng lúc). Ảnh do Codex vẽ theo ảnh mẫu chủ game gửi.
// Chủ game chê bản băng tuyết "hơi giống Tinh Hà" → BỎ khuôn chung (tia xoay, vòng phù văn, pháp trận, cột sáng, "xoáy vào → chớp → bùng").
// Ngôn ngữ hình riêng (theo ảnh mẫu: trăng, vòng nước quanh tay, ngọc trai, hoa trắng, cầu sen, cực quang):
//  1 quầng tối sau lưng (nền nổi sáng) · 2 CỰC QUANG lượn sóng sau lưng · 3 hào quang TRĂNG (ảnh) đứng yên, 1 hạt ngọc sáng chạy quanh vành ·
//  4 MẶT NƯỚC dưới chân: gợn sóng loang + SEN NỞ khép theo nhịp thở · 5 VÒNG NƯỚC trong suốt xoắn từ chân lên ngực, che khuất trước/sau ·
//  6 2 dải lụa xoắn quanh người · 7 NGỌC TRAI bay vòng ngang đầu · 8 HOA TRẮNG nhụy ngọc rơi xoay · 9 sen nhỏ phát sáng ở ngực ·
//  10 Bổ Thiên Linh Châu (pháp bảo, gear → luôn hiện): lơ lửng bên tay phải, quầng tím hồng thở, tia điện nhỏ, dòng nước quấn quanh.
// Biến hình 9 s "VÁ TRỜI": trời tối, 5 VẾT NỨT trời toác ra tím đen → 5 viên NGŨ SẮC THẠCH (đỏ/vàng/lục/lam/trắng) lần lượt bay từ tay
// lên vá từng vết (lóe màu đúng viên) → TRĂNG mọc sau lưng + sóng nước loang + hoa bung → Linh Châu hạ xuống theo dòng nước xoắn.
// Gốc ở chân; đứng cao ~125, ngồi ~91. Texture dựng sẵn, không filter/shadowBlur. light=true: ít vòng/lụa/hạt.
import {makeSurface} from './performance.js';

const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
export const NO_RING={x:.5,y:.5};
const HALO_Y=stand=>-64-stand*34; // đầu đứng ~-98, ngồi ~-64 (đo lại trên ảnh khi có)
const CHEST_Y=stand=>-26-stand*38;
const haloWidth=stand=>(58+stand*14)*1.2;
// đứng: ĐÈ đúng quả cầu vẽ sẵn trên tay (đo ảnh: tâm -23,-82); ngồi: lơ lửng bên phải.
export const ORB_POS=stand=>({x:46-stand*69,y:-40-stand*42,size:.92-.19*stand});
const art={};
const rng=seed=>{let s=seed%2147483647||7;return ()=>((s=s*16807%2147483647)-1)/2147483646;};
const STONES=['#ff6a5a','#ffd36a','#7dffb0','#7fc8ff','#ffffff'];

function surface(w,h,draw){const canvas=makeSurface(w,h);if(!canvas)return null;draw(canvas.getContext('2d'),w/2,h/2);return canvas;}
function radial(size,stops){return surface(size,size,(c,r)=>{const g=c.createRadialGradient(r,r,1,r,r,r);for(const [at,color] of stops)g.addColorStop(at,color);c.fillStyle=g;c.fillRect(0,0,size,size);});}
const darkArt=()=>art.dark??=radial(160,[[0,'#06061cb0'],[.5,'#0c0a3070'],[1,'#00000000']]);
const lightArt=()=>art.light??=radial(128,[[0,'#ffffffff'],[.2,'#fff8f0cc'],[.55,'#d8d0ff50'],[1,'#ffffff00']]);
const aquaArt=()=>art.aqua??=radial(128,[[0,'#e8fbffe0'],[.35,'#7fe0ff80'],[.7,'#3a8ad028'],[1,'#0a50a000']]);
const violetArt=()=>art.violet??=radial(128,[[0,'#ffe8ffe0'],[.3,'#e0a8ff90'],[.65,'#a070ff38'],[1,'#6040c000']]);
const stoneArt=col=>art['st'+col]??=radial(64,[[0,'#ffffff'],[.25,col],[.6,col+'60'],[1,col+'00']]);
const sparkArt=()=>art.spark??=surface(64,64,(c,r)=>{c.translate(r,r);
 for(const [w,h] of [[28,2.2],[2.2,28]]){const g=c.createRadialGradient(0,0,0,0,0,28);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#efe0ffa0');g.addColorStop(1,'#b090ff00');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fill();}
 const g=c.createRadialGradient(0,0,0,0,0,9);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,TAU);c.fill();});
// Ngọc trai: cầu trắng ngà có đốm phản quang + viền tím nhạt.
const pearlArt=()=>art.pearl??=surface(32,32,(c,r)=>{const g=c.createRadialGradient(r-4,r-4,1,r,r,r-2);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#f4eef8');g.addColorStop(.85,'#c8c0e8');g.addColorStop(1,'#a8a0d000');c.fillStyle=g;c.beginPath();c.arc(r,r,r-1,0,TAU);c.fill();
 const h=c.createRadialGradient(r-5,r-6,0,r-5,r-6,5);h.addColorStop(0,'#ffffffff');h.addColorStop(1,'#ffffff00');c.fillStyle=h;c.fillRect(0,0,32,32);});
// Hoa trắng 5 cánh, nhụy ngọc.
const flowerArt=()=>art.flower??=surface(48,48,(c,r)=>{c.translate(r,r);
 for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);const g=c.createLinearGradient(0,0,0,-21);g.addColorStop(0,'#e8e0ff');g.addColorStop(1,'#ffffff');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-10,-6,-9,-20,0,-21);c.bezierCurveTo(9,-20,10,-6,0,0);c.fill();c.restore();}
 c.drawImage(pearlArt(),-5,-5,10,10);});
// Rèm cực quang (chân ngọc lam → lam → tím → hồng), mép ngang mềm.
const auroraArt=()=>art.aurora??=(()=>{const canvas=makeSurface(48,256);if(!canvas)return null;const c=canvas.getContext('2d');
 const g=c.createLinearGradient(0,256,0,0);g.addColorStop(0,'#7dffd800');g.addColorStop(.14,'#7dffd8b0');g.addColorStop(.35,'#5fd8ff80');g.addColorStop(.6,'#9a8cff50');g.addColorStop(.82,'#ff9ad830');g.addColorStop(1,'#ffffff00'); // chân cũng mờ (v1 chân đặc → thành khối vuông)
 const h=c.createLinearGradient(0,0,48,0);h.addColorStop(0,'#ffffff00');h.addColorStop(.5,'#ffffffff');h.addColorStop(1,'#ffffff00');
 c.fillStyle=g;c.fillRect(0,0,48,256);c.globalCompositeOperation='destination-in';c.fillStyle=h;c.fillRect(0,0,48,256);return canvas;})();
// Sen nở (nhìn ngang): 3 tầng cánh; open∈[0,1] chọn 1 trong 4 ảnh dựng sẵn.
const lotusArt=open=>{const i=Math.max(0,Math.min(3,Math.round(open*3)));return (art.lotus??=[0,1,2,3].map(n=>surface(160,96,(c)=>{const o=.35+n*.22;
 const petal=(ang,len,w,col1,col2)=>{c.save();c.translate(80,84);c.rotate(ang);const g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,col1);g.addColorStop(1,col2);c.fillStyle=g;
  c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-w,-len*.35,-w*.7,-len*.85,0,-len);c.bezierCurveTo(w*.7,-len*.85,w,-len*.35,0,0);c.fill();c.strokeStyle='#ffffff90';c.lineWidth=1;c.stroke();c.restore();};
 for(const a of [-1.25,1.25,-.95,.95])petal(a*o*1.1,46,16,'#b8c8ffd0','#f8f4ffe0');
 for(const a of [-.7,.7,-.35,.35])petal(a*o*1.2,58,15,'#c8d8ffe0','#ffffff');
 petal(0,62,14,'#d8e4ff','#ffffff');
 const g=c.createRadialGradient(80,70,1,80,70,26);g.addColorStop(0,'#fff8e0e0');g.addColorStop(1,'#fff8e000');c.fillStyle=g;c.fillRect(40,40,80,56);})))[i];};

function img(c,im,x,y,w,h,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function glow(c,im,x,y,w,h,alpha){if(!im||alpha<=0)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.drawImage(im,x,y,w,h);c.restore();}
function spin(c,im,x,y,size,angle,alpha,add=false){if(!im||alpha<=0)return;c.save();if(add)c.globalCompositeOperation='lighter';c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}

function aurora(c,t,base,width,height,alpha,strips=16){const im=auroraArt();if(!im||alpha<=0)return;const dw=width/strips;
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<strips;i++){const u=strips>1?i/(strips-1):.5,wave=Math.sin(t*.0011+i*.38)+Math.sin(t*.0017-i*.21)*.6,h=height*(.72+.16*wave),x=-width/2+i*dw+Math.sin(t*.0007+i*.45)*5,y=base-h+wave*7;
  c.globalAlpha=alpha*Math.sin(u*Math.PI)*(.3+.22*Math.sin(t*.0013+i*.7));c.drawImage(im,x-dw*.5,y,dw*1.7,h);}
 c.restore();}
// Hào quang trăng: đứng yên, thở nhẹ; 1 hạt ngọc sáng chạy quanh vành.
function haloLayer(c,a,t,cy,width,{alpha=1,pulse=0,motion=true}={}){
 if(!a?.halo)return;const k=1+pulse+(motion?Math.sin(t*.0015)*.012:0),w=width*k,h=w*a.halo.naturalHeight/a.halo.naturalWidth;
 glow(c,lightArt(),-w*.55,cy-w*.55,w*1.1,w*1.1,.22*alpha);img(c,a.halo,-w*NO_RING.x,cy-h*NO_RING.y,w,h,alpha);
 if(motion){const g=t*.0009,R=w*.41;img(c,pearlArt(),Math.cos(g)*R-3,cy+Math.sin(g)*R-3,6,6,alpha);spin(c,sparkArt(),Math.cos(g)*R,cy+Math.sin(g)*R,12,g,alpha*.8,true);}
}
// Mặt nước + sen: gợn sóng loang ra, sen khép/nở theo nhịp thở (5 s).
function lotusPool(c,t,width,alpha,{motion=true,open=null,light=false}={}){
 if(alpha<=0)return;c.save();c.translate(0,22);c.scale(1,.28);glow(c,aquaArt(),-width*.6,-width*.6,width*1.2,width*1.2,alpha*.45);c.restore();
 if(motion){const n=light?2:3;for(let i=0;i<n;i++){const u=((t*.00032)+i/n)%1;c.save();c.globalAlpha*=alpha*(1-u)*.8;c.strokeStyle=i%2?'#bfe9ff':'#e8e0ff';c.lineWidth=1.3*(1-u)+.3;
  c.beginPath();c.ellipse(0,22,10+u*width*.55,3+u*width*.15,0,0,TAU);c.stroke();c.restore();}}
 const o=open??(motion?.5+.5*Math.sin(t*.00125):.8),lw=width*.62,lh=lw*.6;img(c,lotusArt(o),-lw/2,24-lh,lw,lh,alpha*.95);
}
// VÒNG NƯỚC: elip trong suốt quanh trục người, trôi từ chân lên ngực rồi tan; nửa trên (sau lưng) vẽ ở lớp back, nửa dưới ở front.
function waterRings(c,t,stand,layer,alpha,count=3){
 const front=layer==='front',top=CHEST_Y(stand)-6;
 for(let i=0;i<count;i++){const u=((t*.00016)+i/count)%1,y=20+(top-20)*u,R=(30+stand*2)*(1-u*.25)+Math.sin(t*.002+i)*2,ry=R*.24,a=alpha*Math.sin(u*Math.PI),tilt=Math.sin(t*.0009+i*2)*.12;
  if(a<.03)continue;const s=front?0:Math.PI,e=front?Math.PI:TAU;
  c.save();c.translate(0,y);c.rotate(tilt);c.lineCap='round';
  c.globalAlpha*=a*(front?.8:.45);c.strokeStyle='#7fd8ff38';c.lineWidth=3.2;c.beginPath();c.ellipse(0,0,R,ry,0,s,e);c.stroke();
  c.strokeStyle='#e8fbff90';c.lineWidth=.9;c.beginPath();c.ellipse(0,-1,R,ry,0,s+.2,e-.2);c.stroke();
  c.globalCompositeOperation='lighter';c.strokeStyle='#b8a0ff60';c.lineWidth=2;c.beginPath();c.ellipse(0,1.5,R*.98,ry,0,s,e);c.stroke();
  if(front){const g=t*.003+i*2,px=Math.cos(g)*R,py=Math.sin(Math.abs(g%TAU)<Math.PI?g:-g)*ry;spin(c,sparkArt(),px,Math.abs(py),8,g,1,true);}
  c.restore();}
}
// Dải lụa xoắn quanh người (cùng cách Tuyết Phách v2, màu lụa trắng-tím).
function ribbonPts(t,stand,ph,n){const pts=[],top=HALO_Y(stand)-6,bot=16,R0=27+stand*3;
 for(let i=0;i<=n;i++){const s=i/n,a=s*TAU*1.05+t*.001+ph,R=R0+Math.sin(s*7+t*.002+ph)*5+(1-s)*8,y=bot+(top-bot)*s+Math.sin(s*9-t*.003+ph)*4;
  pts.push({x:Math.cos(a)*R,y:y+Math.sin(a)*R*.22,z:Math.sin(a),s,R});}return pts;}
function ribbon(c,t,stand,layer,ph,alpha,n=36){if(alpha<=0)return;const pts=ribbonPts(t,stand,ph,n),front=layer==='front';
 c.save();
 for(let i=0;i<n;i++){const p=pts[i],q=pts[i+1];if(((p.z+q.z)/2>0)!==front)continue;
  const w0=1+5.5*Math.pow(Math.sin(p.s*Math.PI),.6),w1=1+5.5*Math.pow(Math.sin(q.s*Math.PI),.6),shade=1-Math.min(1,Math.abs(p.x)/p.R),edge=Math.min(1,p.s*6,(1-p.s)*4);
  c.globalAlpha=alpha*edge*(front?.9:.5);c.fillStyle=`rgba(${215+40*shade|0},${215+35*shade|0},255,${.28+.42*shade})`;
  c.beginPath();c.moveTo(p.x,p.y-w0/2);c.lineTo(q.x,q.y-w1/2);c.lineTo(q.x,q.y+w1/2);c.lineTo(p.x,p.y+w0/2);c.closePath();c.fill();}
 c.restore();
}
function pearls(c,t,stand,layer,alpha,count=6){for(let i=0;i<count;i++){const a=t*.0005+i*TAU/count,z=Math.sin(a);if((z>0)!==(layer==='front'))continue;
 const x=Math.cos(a)*(40+stand*4),y=HALO_Y(stand)+6+z*7+Math.sin(t*.0012+i*1.3)*4,s=(3.6+(i%2))*(.8+.2*z);img(c,pearlArt(),x-s/2,y-s/2,s,s,alpha*(.7+.3*z));
 if(layer==='front'&&(i+Math.floor(t/1400))%count===0)spin(c,sparkArt(),x,y,10,t*.002,alpha*.7,true);}}
function flowers(c,t,count,width,height,alpha,seed=0){
 for(let i=0;i<count;i++){const u=(i*.618+(t+seed)*.0001)%1,x=Math.sin(i*2.399+u*3)*width*(.4+.6*((i*.37)%1))+Math.sin(t*.0012+i)*8,y=-height+u*(height+22),a=Math.sin(u*Math.PI)*alpha,s=4+(i%3)*1.6;
  if(a<.04)continue;c.save();c.globalAlpha*=a*.9;c.translate(x,y);c.rotate(t*.0008+i);c.scale(1,.55+.45*Math.abs(Math.sin(t*.0015+i)));c.drawImage(flowerArt(),-s,-s,2*s,2*s);c.restore();}}
function chestLotus(c,t,stand,alpha){const y=CHEST_Y(stand),p=.8+.2*Math.sin(t*.003);glow(c,violetArt(),-12*p,y-12*p,24*p,24*p,alpha*.5);glow(c,lightArt(),-5,y-5,10,10,alpha*.6);}
// BỔ THIÊN LINH CHÂU: quầng tím hồng thở, tia điện nhỏ, dòng nước quấn quanh (sau/trước cầu).
function orb(c,a,t,x,y,{alpha=1,motion=true,size=1,light=false}={}){
 if(!a?.blade)return;const d=26*size,p=motion?.85+.15*Math.sin(t*.004):1;
 glow(c,violetArt(),x-d*1.1*p,y-d*1.1*p,d*2.2*p,d*2.2*p,alpha*.7);
 const ring=(back)=>{if(!motion)return;c.save();c.translate(x,y);c.rotate(-.35);c.globalAlpha*=alpha*(back?.45:.9);c.strokeStyle='#9fe8ff';c.lineWidth=1.6;c.lineCap='round';
  const g=t*.002;c.beginPath();c.ellipse(0,0,d*.78,d*.24,0,back?Math.PI+g%1*.0:0,back?TAU:Math.PI);c.stroke();c.restore();
  if(!back){const ang=t*.0025,px=x+Math.cos(ang)*d*.78*Math.cos(-.35),py=y+Math.sin(ang)*d*.24+Math.cos(ang)*d*.78*Math.sin(-.35);if(Math.sin(ang)>0)spin(c,sparkArt(),px,py,9,ang,alpha,true);}};
 ring(true);img(c,a.blade,x-d/2,y-d/2,d,d,alpha);ring(false);
 if(motion&&!light){const fl=Math.max(0,Math.sin(t*.0031))**10;if(fl>.05){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=alpha*fl;c.strokeStyle='#f0d8ff';c.lineWidth=1;c.beginPath();
  let ang=(Math.floor(t/600)*2.4)%TAU,px=x+Math.cos(ang)*d*.36,py=y+Math.sin(ang)*d*.36;c.moveTo(px,py);for(let j=0;j<4;j++){ang+=.5;const r=d*(.42+j*.06);px=x+Math.cos(ang)*r+(j%2?2:-2);py=y+Math.sin(ang)*r;c.lineTo(px,py);}c.stroke();c.restore();}}
}

export function drawNuOaAura(c,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const time=motion?t:0,hy=HALO_Y(stand);
 if(layer==='back'){
  img(c,darkArt(),-85,hy-70,170,200,.68);
  aurora(c,time,hy+30,200,140+stand*20,motion?.9:.6,light?8:16);
  if(motion){ribbon(c,time,stand,'back',0,1,light?16:36);if(!light)ribbon(c,time,stand,'back',Math.PI,.8,36);waterRings(c,time,stand,'back',1,light?2:3);pearls(c,time,stand,'back',1,light?4:6);}
 }else if(motion){
  waterRings(c,time,stand,'front',1,light?2:3);
  ribbon(c,time,stand,'front',0,1,light?16:36);if(!light)ribbon(c,time,stand,'front',Math.PI,.8,36);
  pearls(c,time,stand,'front',1,light?4:6);chestLotus(c,time,stand,light?.6:1);
  flowers(c,time,light?5:14,64,130+stand*30,1,seed);
 }
}
// Gear (luôn hiện với người sở hữu): mặt nước + sen · hào quang trăng · Bổ Thiên Linh Châu.
export function drawNuOaGear(c,a,t,pose,layer,{motion=true,light=false}={}){
 const stand=clamp(pose.stand||0),time=motion?t:0;
 if(layer==='back'){lotusPool(c,time,104+stand*8,.9,{motion,light});haloLayer(c,a,time,HALO_Y(stand),haloWidth(stand),{motion,alpha:.95});}
 else{const o=ORB_POS(stand),bob=stand>.5?.4:1;orb(c,a,time,o.x+(motion?Math.sin(time*.0009)*2*bob:0),o.y+(motion?Math.sin(time*.0016)*3*bob:0),{motion,light,size:o.size});}
}

const hash=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.codePointAt(0))%9973;return h;};
// 5 vết nứt trời: vị trí + đường gấp khúc (theo seed).
function rifts(seed,stand){const key='rf'+seed%5+'-'+(stand>.5?1:0);if(art[key])return art[key];const r=rng(seed+5),hy=HALO_Y(stand),L=[];
 for(let i=0;i<5;i++){const cx=(i-2)*38+(r()-.5)*10,cy=hy-78-Math.abs(i-2)*-10-(i%2)*18+(r()-.5)*8,pts=[];let x=cx-20,y=cy+(r()-.5)*6;
  for(let j=0;j<7;j++){pts.push([x,y]);x+=40/6;y+=(r()-.5)*12;}L.push({cx,cy,pts});}
 return art[key]=L;}
function drawRift(c,R,open,heal,col){if(open<=0||heal>=1)return;const P=R.pts,n=P.length,a=1-heal,mid=(n-1)/2;
 // khe toác: mép trên/dưới lệch theo bề dày (giữa dày, hai đầu nhọn) × độ mở
 const w=j=>(1-Math.abs(j-mid)/mid)**.8*6*open*(j%2?.7:1),up=P.map(([x,y],j)=>[x,y-w(j)]),dn=P.map(([x,y],j)=>[x,y+w(j)*.8]).reverse(),poly=[...up,...dn];
 const path=()=>{c.beginPath();poly.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x,y));c.closePath();};
 glow(c,violetArt(),R.cx-34,R.cy-18,68,36,a*.7*open);
 c.save();c.globalAlpha=a;path();c.fillStyle='#05010f';c.fill();
 c.globalCompositeOperation='lighter';c.lineJoin='round';c.strokeStyle='#a060ff';c.lineWidth=2.4;c.globalAlpha=a*.75;path();c.stroke();c.strokeStyle='#f4e8ff';c.lineWidth=.8;c.globalAlpha=a;path();c.stroke();
 // nhánh nứt nhỏ từ mép
 c.strokeStyle='#c090ff';c.lineWidth=.8;c.globalAlpha=a*.8*open;for(let j=1;j<n-1;j+=2){const [x,y]=P[j],d=j%4===1?-1:1;c.beginPath();c.moveTo(x,y+d*w(j)*.8);c.lineTo(x+4,y+d*(w(j)+5));c.lineTo(x+2,y+d*(w(j)+9));c.stroke();}
 c.restore();
 if(heal>0)glow(c,stoneArt(col),R.cx-40*(1-heal*.4),R.cy-40*(1-heal*.4),80*(1-heal*.4),80*(1-heal*.4),Math.sin(heal*Math.PI)*1.2);
}
// Màn biến hình 9 s (reveal ≈ .45) "VÁ TRỜI".
export function drawNuOaReveal(c,t,k,target,layer,reveal,a,{motion=true,light=false,pose={},seed=''}={}){
 const s=hash(seed),charge=clamp(k/reveal),after=clamp((k-reveal)/(1-reveal)),outro=clamp((1-k)/.12);
 const clock=motion?t:0,stand=clamp(pose.stand??1),hy=HALO_Y(stand),cy=CHEST_Y(stand),R=rifts(s,stand);
 // nhịp từng viên đá: bay [.3+i*.1, +.16], vá xong +.12
 const fly=i=>clamp((charge-(.28+i*.1))/.16),heal=i=>k<reveal?clamp((charge-(.44+i*.1))/.12):1;
 c.save();c.translate(target.x,target.y);const sc=target.scale||1.5;c.scale(sc,sc);
 if(layer==='back'){
  const veil=Math.min(ease(k/.14),outro)*(k<reveal?.66:.66-.32*after);img(c,darkArt(),-470,-560,940,880,veil);
  if(k<reveal){
   R.forEach((r,i)=>drawRift(c,r,ease(clamp((charge-i*.04)/.25)),heal(i),STONES[i]));
   lotusPool(c,clock,30+70*ease(charge),ease(charge/.4),{motion,open:charge*.6,light});
  }else{
   // trăng mọc: hào quang phóng từ nhỏ + quầng sáng lớn
   const moon=ease(after/.2);glow(c,lightArt(),-140*moon,hy-140*moon,280*moon,280*moon,(1-ease(after/.6))*.9);
   aurora(c,clock,cy+40,190+260*(1-ease(after/.5)),150+stand*30+120*(1-ease(after/.5)),Math.min(1,outro*1.5),light?10:22);
   drawNuOaAura(c,clock,stand,'back',{motion,light,seed:s});
   lotusPool(c,clock,104+stand*8,.9,{motion,open:Math.min(1,.6+after*2),light});
   haloLayer(c,a,clock,hy,haloWidth(stand)*(.4+.6*moon),{motion,alpha:moon,pulse:after<.25?.12*(1-after/.25):0});
  }
 }else{
  if(k<reveal){
   // sáng dần ở tay, rồi 5 viên đá lần lượt bay lên vá trời (đuôi sáng màu)
   glow(c,lightArt(),-14,cy-14,28,28,ease(charge/.3)*.8);
   R.forEach((r,i)=>{const f=fly(i);if(f<=0||f>=1)return;const e=ease(f),x=r.cx*e+Math.sin(f*Math.PI)*(i-2)*10,y=cy+(r.cy-cy)*e;
    for(let j=1;j<(light?4:8);j++){const fe=ease(Math.max(0,f-j*.03)),tx=r.cx*fe+Math.sin(Math.max(0,f-j*.03)*Math.PI)*(i-2)*10,ty=cy+(r.cy-cy)*fe;glow(c,stoneArt(STONES[i]),tx-5,ty-5,10,10,(1-j/8)*.8);}
    glow(c,stoneArt(STONES[i]),x-11,y-11,22,22,1);glow(c,lightArt(),x-4,y-4,8,8,1);});
  }else{
   const flash=1-clamp(after/.06);if(flash>0)glow(c,lightArt(),-130,cy-130,260,260,flash*.9);
   // sóng nước loang + hoa bung
   for(const [delay,col,w] of [[0,'#e8fbff',2.4],[.05,'#7fd8ff',1.6],[.1,'#c8a8ff',1.2]]){const u=clamp((after-delay)/.35);if(u<=0||u>=1)continue;
    c.save();c.globalAlpha=(1-u)*.85;c.strokeStyle=col;c.lineWidth=w*(1-u*.5);c.beginPath();c.ellipse(0,22,30+u*190,8+u*48,0,0,TAU);c.stroke();c.restore();}
   const pop=clamp(after/.45);if(pop<1){const n=light?10:26;for(let i=0;i<n;i++){const ang=i/n*TAU+s,r=16+ease(pop)*150,x=Math.cos(ang)*r,y=cy+Math.sin(ang)*r*.75+pop*pop*60,sz=5+(i%3)*2;
    c.save();c.globalAlpha=1-pop;c.translate(x,y);c.rotate(ang+pop*4);c.drawImage(flowerArt(),-sz,-sz,2*sz,2*sz);c.restore();}}
   // Linh Châu hạ xuống theo dòng nước xoắn
   const o=ORB_POS(stand),u=ease(clamp((after-.1)/.35));
   if(u<1){const ang=(1-u)*TAU*1.5,rad=50*(1-u),x=o.x+Math.cos(ang)*rad,y=o.y-200*(1-u)+Math.sin(ang)*rad*.3;
    for(let j=1;j<8;j++){const uj=Math.max(0,u-j*.03),aj=(1-uj)*TAU*1.5,rj=50*(1-uj);glow(c,j%2?aquaArt():violetArt(),o.x+Math.cos(aj)*rj-6,o.y-200*(1-uj)+Math.sin(aj)*rj*.3-6,12,12,(1-j/8)*(1-u));}
    orb(c,a,clock,x,y,{motion,light,size:o.size*(1+.6*(1-u))});}
   else drawNuOaGear(c,a,clock,{stand},'front',{motion,light});
   drawNuOaAura(c,clock,stand,'front',{motion,light,seed:s});
  }
 }
 c.restore();
}
