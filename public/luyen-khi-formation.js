// Luyện Khí v5 (05/11/2026) — "Bát Quái Dẫn Khí · Khí Hải Sơ Khai".
// Kịch bản (k = thời gian hiển thị 0..1, nổ tại QI_IMPACT=.70, tổng 8,8 s):
//  .00–.14 KHAI TRẬN   : trận đồ Bát Quái mực-ngọc trải ra dưới chân theo một vệt quét; tám quẻ sáng lần lượt;
//                        núi mực, biển mây hiện ở nửa trên màn hình (không còn khoảng trống).
//  .10–.62 DẪN KHÍ     : mây trời xoáy thành phễu trên đỉnh đầu; dòng linh khí nét bút lông rót xuống bách hội;
//                        từ tám quẻ khí đất bốc lên rót vào đan điền.
//  .34–.66 KHAI KINH MẠCH: kinh mạch sáng dần trên thân (đốc–nhâm, hai tay, hai chân); một điểm sáng chạy tiểu chu thiên.
//  .60–.70 NGƯNG KHÍ   : phễu mây hạ thấp, trận đồ thu nhỏ quay nhanh, tám quẻ bay lên vây quanh người rồi nén vào đan điền.
//  .70     PHÁ         : sóng mực loang trên mặt trận, tám quẻ văng ra, mây bị thổi dạt thành vành tròn.
//  .70–1   HIỆN THÂN   : pháp luân Bát Quái sau lưng quay chậm, vành mây yên lại.
// Không dùng Math.random: mọi chuyển động tính theo thời gian + chỉ số → render lại/offline giống hệt; biến thể theo qiVariant.
import {makeSurface} from './performance.js';
import {QI_IMPACT} from './qi-impact.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3,inn=x=>clamp(x)**2;
const JADE='#7dffcf',JADE2='#9cf7da',MIST='#cfeff0',GOLD='#ffe2a0',INK='#0b2230';
// Thứ tự Hậu Thiên Bát Quái (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài): 1 = hào dương (liền), 0 = hào âm (đứt), từ dưới lên.
const TRIGRAMS=[[1,1,1],[0,1,0],[0,0,1],[1,0,0],[0,1,1],[1,0,1],[0,0,0],[1,1,0]];
const lightBudget=scene=>scene?.budget?.level==='light';
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};

// Mốc kịch bản để HUD/âm thanh/test dùng chung.
export const LK_BEATS=Object.freeze([
 {at:0,id:'formation',label:'Khai trận Bát Quái'},
 {at:.10,id:'gather',label:'Thiên địa linh khí hội tụ'},
 {at:.34,id:'meridian',label:'Khai thông kinh mạch'},
 {at:.60,id:'condense',label:'Ngưng khí đan điền'},
 {at:QI_IMPACT,id:'break',label:'Khí hải sơ khai'},
 {at:.80,id:'reveal',label:'Luyện Khí thành'}
]);
export function luyenKhiState(k){
 k=clamp(k);const after=k>=QI_IMPACT,ka=after?(k-QI_IMPACT)/(1-QI_IMPACT):0;
 return {
  k,after,ka,
  formation:out(k/.14),                                   // trận đồ trải ra
  sky:ease(k/.12)*(1-ease(ka/.9)*.35),                    // núi mực, biển mây
  vortex:ease((k-.08)/.16)*(1-ease((k-QI_IMPACT)/.06)),   // phễu mây xoáy
  descend:ease((k-.58)/.12),                              // phễu hạ + trận thu
  pour:ease((k-.12)/.14)*(1-ease((k-.66)/.04)),           // dòng khí rót xuống
  rise:ease((k-.18)/.14)*(1-ease((k-.64)/.05)),           // khí đất bốc lên
  meridian:ease((k-.34)/.22)*(1-ease(ka/.25)),          // kinh mạch sáng
  orbit:ease((k-.40)/.08)*(1-ease((k-.68)/.03)),          // tiểu chu thiên
  converge:ease((k-.60)/.09),                             // tám quẻ bay lên vây quanh
  shock:after?out(ka/.55):0,                              // sóng mực
  scatter:after?out(ka/.35):0,                            // quẻ văng ra
  wheel:after?ease((ka-.05)/.3):0                         // pháp luân sau lưng
 };
}

// ---------- tài nguyên vẽ sẵn (cache theo scene) ----------
const glowCache=new Map();
function glowSprite(color){if(glowCache.has(color))return glowCache.get(color);const f=makeSurface(64,64);if(!f)return null;const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#ffffff');g.addColorStop(.35,color+'cc');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);glowCache.set(color,f);return f;}
function blit(c,im,x,y,r,a){if(!im||a<=.003)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-r,y-r,r*2,r*2);}
let petalCache=null;
function petalSprite(){if(petalCache)return petalCache;const f=makeSurface(40,60);if(!f)return null;const c=f.getContext('2d'),g=c.createLinearGradient(0,58,0,2);g.addColorStop(0,JADE+'00');g.addColorStop(.6,JADE2+'aa');g.addColorStop(1,'#ffffffcc');c.fillStyle=g;c.beginPath();c.moveTo(20,58);c.quadraticCurveTo(36,32,20,4);c.quadraticCurveTo(4,32,20,58);c.fill();return petalCache=f;}
function trigram(c,bits,w,h,gap){for(let i=0;i<3;i++){const y=(1-i)*(h+gap);if(bits[i])c.fillRect(-w/2,y-h/2,w,h);else{c.fillRect(-w/2,y-h/2,w*.42,h);c.fillRect(w*.08,y-h/2,w*.42,h);}}}
function baguaSurface(scene){
 if(scene.lkBagua)return scene.lkBagua;const S=760,f=makeSurface(S,S);if(!f)return null;const c=f.getContext('2d'),R=S/2;c.translate(R,R);
 const ring=(r,w,col,a=1,dash=null)=>{c.save();c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=w;if(dash)c.setLineDash(dash);c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.restore();};
 const g=c.createRadialGradient(0,0,40,0,0,R);g.addColorStop(0,'#7dffcf22');g.addColorStop(.55,'#0e3a3f30');g.addColorStop(.8,'#7dffcf18');g.addColorStop(1,'#7dffcf00');c.fillStyle=g;c.beginPath();c.arc(0,0,R,0,TAU);c.fill();
 ring(R-8,3,JADE2,.85);ring(R-20,1.2,MIST,.6,[2,9]);ring(R-112,2.2,JADE,.9);ring(R-124,1,GOLD,.55);ring(150,2,JADE2,.8);ring(118,1,MIST,.5,[10,6]);
 // Tám quẻ giữa hai vòng ngoài, vạch phân cung.
 c.fillStyle=MIST;for(let i=0;i<8;i++){const a=i*TAU/8-Math.PI/2;c.save();c.rotate(a+Math.PI/2);c.translate(0,-(R-66));c.globalAlpha=.95;trigram(c,TRIGRAMS[i],64,9,7);c.restore();
  c.save();c.rotate(a+TAU/16);c.strokeStyle=JADE2;c.globalAlpha=.55;c.lineWidth=1.5;c.beginPath();c.moveTo(0,-(R-112));c.lineTo(0,-(R-8));c.stroke();c.restore();}
 // Vân văn: 24 nét móc nhỏ trên vòng giữa.
 c.strokeStyle=GOLD;c.globalAlpha=.55;c.lineWidth=1.6;for(let i=0;i<24;i++){c.save();c.rotate(i*TAU/24);c.beginPath();c.arc(0,-(R-140),9,Math.PI*.15,Math.PI*1.25);c.stroke();c.restore();}
 // Thái cực ở tâm (âm dương ngọc/mực).
 c.globalAlpha=1;c.save();c.fillStyle='#d9fff1';c.beginPath();c.arc(0,0,92,-Math.PI/2,Math.PI/2);c.arc(0,46,46,Math.PI/2,-Math.PI/2,true);c.arc(0,-46,46,Math.PI/2,-Math.PI/2);c.fill();
 c.fillStyle='#123c44';c.beginPath();c.arc(0,0,92,Math.PI/2,-Math.PI/2);c.arc(0,-46,46,-Math.PI/2,Math.PI/2,true);c.arc(0,46,46,-Math.PI/2,Math.PI/2);c.fill();
 c.fillStyle='#123c44';c.beginPath();c.arc(0,-46,13,0,TAU);c.fill();c.fillStyle='#d9fff1';c.beginPath();c.arc(0,46,13,0,TAU);c.fill();c.restore();
 c.globalAlpha=.9;c.strokeStyle=JADE2;c.lineWidth=2;c.beginPath();c.arc(0,0,94,0,TAU);c.stroke();
 return scene.lkBagua=f;
}
function trigramSprite(scene,i){
 scene.lkTri??=[];if(scene.lkTri[i])return scene.lkTri[i];const f=makeSurface(96,96);if(!f)return null;const c=f.getContext('2d');c.translate(48,48);
 const g=c.createRadialGradient(0,0,4,0,0,46);g.addColorStop(0,'#7dffcf55');g.addColorStop(1,'#7dffcf00');c.fillStyle=g;c.fillRect(-48,-48,96,96);
 c.shadowColor=JADE;c.shadowBlur=10;c.fillStyle='#effff8';trigram(c,TRIGRAMS[i],52,8,6);return scene.lkTri[i]=f;
}
function cloudSprite(scene,tone){
 scene.lkCloud??={};if(scene.lkCloud[tone])return scene.lkCloud[tone];const W=300,H=120,f=makeSurface(W,H);if(!f)return null;const c=f.getContext('2d');
 const fill=tone==='gold'?['#fff1cf','#e8c98a']:tone==='dark'?['#5f8f97','#24505a']:['#e9fbf6','#8fc9c4'],line=tone==='gold'?'#ffe2a0':'#bff6ea';
 // Tường vân: chuỗi búi mây trên một đường nền, mặt trên sáng, đáy phẳng; viền nét và móc xoắn hai đầu.
 const puffs=[[70,66,30],[112,52,38],[160,48,42],[206,58,34],[242,70,24]];
 c.save();c.beginPath();for(const [x,y,r] of puffs){c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);}c.rect(48,66,214,26);
 const g=c.createLinearGradient(0,10,0,95);g.addColorStop(0,fill[0]+'d0');g.addColorStop(.7,fill[1]+'70');g.addColorStop(1,fill[1]+'00');c.fillStyle=g;c.fill();c.restore();
 c.strokeStyle=line;c.lineWidth=2.2;c.globalAlpha=.85;c.lineCap='round';
 c.beginPath();c.arc(112,52,38,Math.PI*1.05,Math.PI*1.75);c.stroke();c.beginPath();c.arc(160,48,42,Math.PI*1.15,Math.PI*1.85);c.stroke();c.beginPath();c.arc(206,58,34,Math.PI*1.25,Math.PI*1.95);c.stroke();
 const curl=(x,y,r,dir)=>{c.beginPath();for(let i=0;i<=40;i++){const u=i/40,a=dir*u*TAU*1.15,rr=r*(1-u*.8);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();};
 curl(52,80,16,-1);curl(256,82,14,1);
 c.globalAlpha=.5;c.lineWidth=1.4;c.beginPath();c.moveTo(40,92);c.quadraticCurveTo(150,84,270,94);c.stroke();
 return scene.lkCloud[tone]=f;
}
function mountainSurface(scene){
 if(scene.lkMountains)return scene.lkMountains;const W=900,H=520,f=makeSurface(W,H);if(!f)return null;const c=f.getContext('2d');
 // Ba lớp núi mực: xa nhạt → gần đậm, đỉnh nhọn kiểu thủy mặc, chân chìm trong sương.
 for(const [layer,base,amp,col,a] of [[0,300,170,'#5d8f96',.55],[1,360,150,'#3f727b',.7],[2,420,120,'#2a5660',.85]]){
  c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=6){const u=x/W,y=base-amp*(.55*Math.abs(Math.sin(u*Math.PI*(2.2+layer)+layer*1.7))**1.6+.3*Math.abs(Math.sin(u*Math.PI*(5.3+layer*1.4)+layer))**3+.15*Math.sin(u*41+layer*3));c.lineTo(x,y);}
  c.lineTo(W,H);c.closePath();const g=c.createLinearGradient(0,base-amp,0,H);g.addColorStop(0,col);g.addColorStop(.6,col+'99');g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.fill();
  c.save();c.clip();c.globalAlpha=.35;c.strokeStyle='#bff6ea';c.lineWidth=2;c.stroke();c.restore();
 }
 // Vài lầu gác trên đỉnh xa (bóng mực nhỏ) cho chất tiên môn.
 c.globalAlpha=.7;c.fillStyle='#2e5c66';for(const [x,y,s] of [[180,190,1],[640,215,.8],[760,250,.6]]){c.save();c.translate(x,y);c.scale(s,s);c.fillRect(-10,-26,20,26);c.beginPath();c.moveTo(-26,-26);c.quadraticCurveTo(0,-38,26,-26);c.lineTo(18,-32);c.quadraticCurveTo(0,-44,-18,-32);c.closePath();c.fill();c.fillRect(-6,-46,12,14);c.beginPath();c.moveTo(-18,-46);c.quadraticCurveTo(0,-56,18,-46);c.closePath();c.fill();c.restore();}
 return scene.lkMountains=f;
}
// Dải nét bút lông: dải đa giác thuôn hai đầu theo một đường cong; lõi sáng + viền mờ.
function brushRibbon(c,pts,width,color,alpha,core=true){
 if(pts.length<2||alpha<=.01)return;const n=pts.length,L=[],R=[];
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,u=i/(n-1),w=width*Math.sin(Math.PI*Math.min(1,u*1.15))**.8*(pts[i].w??1);L.push([pts[i].x-dy/l*w,pts[i].y+dx/l*w]);R.push([pts[i].x+dy/l*w,pts[i].y-dx/l*w]);}
 c.save();c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(...L[0]);for(const p of L)c.lineTo(...p);for(let i=n-1;i>=0;i--)c.lineTo(...R[i]);c.closePath();c.fill();
 if(core){c.globalAlpha=alpha*.9;c.strokeStyle='#f2fff9';c.lineWidth=Math.max(1,width*.18);c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const p of pts)c.lineTo(p.x,p.y);c.stroke();}
 c.restore();
}

// ---------- các lớp ----------
// Nửa trên màn hình: núi mực + biển mây (ngoài camera, phía sau mọi thứ).
export function drawLkSky(scene,c,st,H,v){
 const a=st.sky;if(a<=.01)return;const sky=skySurface(scene,H);if(!sky)return;
 // Một lần vẽ/khung: tấm trời vẽ sẵn (nửa độ phân giải) trượt ngang chậm cho mây trôi.
 const drift=Math.sin(st.k*1.3+(v?.phase||0)*TAU)*22*(v?.flip?-1:1);
 c.save();c.globalAlpha=a;c.drawImage(sky,-40+drift,H*.08+(1-a)*40,980,H*.46);c.restore();
}
function skySurface(scene,H){
 if(scene.lkSky)return scene.lkSky;const W=490,HH=Math.round(H*.23),f=makeSurface(W,HH);if(!f)return null;const c=f.getContext('2d'),m=mountainSurface(scene);
 c.save();c.scale(W/980,HH/(H*.46));
 if(m){c.globalAlpha=.9;c.drawImage(m,40,H*.02,900,520);}
 const band=c.createLinearGradient(0,H*.22,0,H*.42);band.addColorStop(0,'#cfeff000');band.addColorStop(.5,'#cfeff026');band.addColorStop(1,'#cfeff000');c.globalAlpha=1;c.fillStyle=band;c.fillRect(0,H*.22,980,H*.2);
 const cl=cloudSprite(scene,'mist');for(let i=0;i<7;i++){const x=40+rnd(i+40)*900,y=H*(.12+rnd(i+9)*.24),sc=.8+rnd(i+2)*1.1;c.globalAlpha=.22+rnd(i+5)*.22;cl&&c.drawImage(cl,x-150*sc,y-60*sc,300*sc,120*sc);}
 c.restore();return scene.lkSky=f;
}
// Trận đồ Bát Quái dưới chân (phối cảnh), quét mở → quay → thu nhỏ khi ngưng khí → sóng mực khi phá.
export function drawLkFormation(scene,c,st,s,v){
 const im=baguaSurface(scene);if(!im||st.formation<=.01)return;const x=450,y=s.feet+28,dir=v?.flip?-1:1;
 const R=360*(1-st.descend*.35)*(1+st.shock*.18),rot=dir*(st.k*1.6+st.descend*st.descend*2.4+(v?.phase||0)*TAU),flat=.30;
 c.save();c.translate(x,y);c.scale(1,flat);c.rotate(rot);
 if(st.formation<1){c.beginPath();c.moveTo(0,0);c.arc(0,0,R+4,-Math.PI/2,-Math.PI/2+TAU*st.formation);c.closePath();c.clip();}
 c.globalAlpha=.92*(1-st.ka*.5);c.drawImage(im,-R,-R,R*2,R*2);
 // Vệt quét sáng ở mép đang mở.
 if(st.formation<1){const a=-Math.PI/2+TAU*st.formation;c.globalCompositeOperation='lighter';c.strokeStyle=GOLD;c.lineWidth=10;c.globalAlpha=.6;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*R,Math.sin(a)*R);c.stroke();}
 c.restore();
 // Tám quẻ sáng lần lượt khi trận mở; trước nổ nâng lên vây quanh người.
 if(st.converge<.99||!st.after){for(let i=0;i<8;i++){const lit=ease((st.k-.03-i*.012)/.03);if(lit<=0)continue;const sp=trigramSprite(scene,i),a0=i*TAU/8-Math.PI/2+rot;
  const rr=(R-66*R/380)*(1-st.converge*.55),lift=st.converge*(170+40*Math.sin(i*1.3)),px=x+Math.cos(a0)*rr,py=y+Math.sin(a0)*rr*flat-lift,sz=40+st.converge*22;
  c.save();c.globalCompositeOperation='lighter';c.globalAlpha=lit*(.55+.45*st.converge)*(1-(st.after?1:0));sp&&c.drawImage(sp,px-sz/2,py-sz/2,sz,sz);c.restore();}}
 // Sóng mực loang: hai vòng nét bút đứt quãng lan ra.
 if(st.shock>0&&st.shock<1){for(let j=0;j<2;j++){const u=clamp(st.shock*1.15-j*.18);if(u<=0)continue;const r=120+u*560,a=(1-u)*.85;
  c.save();c.translate(x,y);c.scale(1,flat);c.globalCompositeOperation='lighter';c.strokeStyle=j?GOLD:JADE;c.globalAlpha=a;
  for(let q=0;q<14;q++){const s0=q*TAU/14+j*.2+rot*.3,len=TAU/14*(.55+.3*rnd(q+j*7));c.lineWidth=(16+10*rnd(q))*(1-u*.6);c.beginPath();c.arc(0,0,r*(1+.04*Math.sin(q*2.1)),s0,s0+len);c.stroke();}c.restore();}}
}
// Phễu mây xoáy trên đỉnh đầu + dòng khí rót xuống bách hội.
export function drawLkVortex(scene,c,st,s,H,v){
 const a=st.vortex;if(a<=.01&&st.shock<=0)return;const cx=450,top=s.feet-560+st.descend*150,dir=v?.flip?-1:1,spin=dir*(st.k*7+st.descend*st.descend*5);
 const cl=cloudSprite(scene,'mist'),cd=cloudSprite(scene,'dark'),n=lightBudget(scene)?8:14;
 c.save();
 if(a>.01){
  // Lõi phễu: quầng sáng ngọc trên đỉnh.
  const g=c.createRadialGradient(cx,top,4,cx,top,170);g.addColorStop(0,'#eafff7cc');g.addColorStop(.35,'#7dffcf55');g.addColorStop(1,'#7dffcf00');c.globalAlpha=a*(.6+.4*st.descend);c.fillStyle=g;c.fillRect(cx-170,top-170,340,340);
  // Ba tay xoắn nét bút lông (đọc rõ là xoáy), tường vân thưa bám theo tay.
  c.globalCompositeOperation='lighter';for(let arm=0;arm<3;arm++){const pts=[];for(let q=0;q<=26;q++){const u=q/26,r=40+u*300*(1-st.descend*.3),ang=spin+arm*TAU/3+u*3.4;pts.push({x:cx+Math.cos(ang)*r,y:top+Math.sin(ang)*r*.3,w:1-u*.6});}brushRibbon(c,pts,14,arm===1?GOLD+'88':JADE+'88',a*.55,true);}
  c.globalCompositeOperation='source-over';
  for(let i=0;i<n;i++){const arm=i%3,u=(i/n+st.k*.5)%1,r=60+u*290*(1-st.descend*.3),ang=spin+arm*TAU/3+u*3.4,px=cx+Math.cos(ang)*r,py=top+Math.sin(ang)*r*.3,sz=.45+u*.55;
   c.globalAlpha=a*(.25+.5*u)*Math.sin(Math.PI*Math.min(1,u*1.1));const im=i%5===0?cd:cl;im&&c.drawImage(im,px-150*sz,py-60*sz,300*sz,120*sz);}
 }
 // Khí rót: phễu nhiều sợi mảnh xoắn từ tâm xoáy xuống bách hội, đoạn sáng chạy xuống.
 if(st.pour>.01){const crown={x:450,y:s.feet-225},m=lightBudget(scene)?6:9;c.globalCompositeOperation='lighter';c.lineCap='round';
  for(let j=0;j<m;j++){const ph=j*TAU/m+spin*.6,pts=[];for(let i=0;i<=22;i++){const u=i/22,tw=(1-u)**1.4*120+6,ang=ph+u*3.2;pts.push({x:cx+Math.cos(ang)*tw,y:mix(top+10,crown.y,u)+Math.sin(ang)*tw*.25});}
   c.strokeStyle=j%4===0?GOLD:JADE2;c.globalAlpha=st.pour*.22;c.lineWidth=2;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
   const head=((st.k*2.2+j*.37)%1)*22|0;c.globalAlpha=st.pour*.9;c.strokeStyle='#effff9';c.lineWidth=3;c.beginPath();for(let i=Math.max(0,head-5);i<=head;i++){const p=pts[i];i===Math.max(0,head-5)?c.moveTo(p.x,p.y):c.lineTo(p.x,p.y);}c.stroke();}
  blit(c,glowSprite(JADE),crown.x,crown.y,26,st.pour*(.35+.15*Math.sin(st.k*60)));}
 // Sau nổ: mây bị thổi thành vành tròn yên dần.
 if(st.after){const u=st.shock,R=230+u*260,cnt=lightBudget(scene)?10:18,cg=cloudSprite(scene,'gold');c.globalCompositeOperation='source-over';
  for(let i=0;i<cnt;i++){const ang=i*TAU/cnt+st.ka*.6*dir,px=cx+Math.cos(ang)*R,py=s.feet-470+Math.sin(ang)*R*.22;c.globalAlpha=(1-st.ka*.55)*.5;const im=i%3?cl:cg;im&&c.drawImage(im,px-100,py-40,200,80);}}
 c.restore();
}
const mix=(a,b,u)=>a+(b-a)*u;
// Khí đất: từ tám quẻ bốc lên, cong vào đan điền.
export function drawLkGroundQi(scene,c,st,s,v){
 if(st.rise<=.01)return;const x=450,y=s.feet+28,o={x:450,y:s.feet-25},R=330*(1-st.descend*.35),rot=(v?.flip?-1:1)*(st.k*1.6+(v?.phase||0)*TAU),cnt=lightBudget(scene)?4:8;
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<cnt;i++){const idx=lightBudget(scene)?i*2:i,a0=idx*TAU/8-Math.PI/2+rot,sx=x+Math.cos(a0)*R*.86,sy=y+Math.sin(a0)*R*.86*.3,pts=[];
  for(let q=0;q<=14;q++){const u=q/14,bend=Math.sin(u*Math.PI)*(70+30*Math.sin(i));pts.push({x:mix(sx,o.x,u)+Math.cos(a0+Math.PI/2)*bend*.4,y:mix(sy,o.y,inn(u))-Math.sin(u*Math.PI)*bend});}
  const flow=(st.k*2.4+i*.13)%1,start=Math.floor(flow*5);brushRibbon(c,pts.slice(start,start+10),6,i%2?JADE2+'99':JADE+'99',st.rise*.7,false);}
 c.restore();
}
// Kinh mạch: đốc–nhâm, hai tay, hai chân; sáng dần theo thứ tự; điểm sáng chạy tiểu chu thiên.
const MERIDIANS=[
 [[0,-25],[0,-65],[0,-100],[0,-118]],                                 // nhâm mạch: đan điền → cổ (không vẽ qua mặt)
 [[0,-70],[-30,-88],[-52,-95],[-80,-62],[-100,-30],[-118,0],[-130,10]], // tay trái
 [[0,-70],[30,-88],[52,-95],[80,-62],[100,-30],[118,0],[130,10]],       // tay phải
 [[0,-25],[-45,10],[-100,40],[-150,58]],                              // chân trái
 [[0,-25],[45,10],[100,40],[150,58]]                                  // chân phải
];
const ORBIT=[[0,-25],[-16,-70],[-14,-112],[0,-122],[14,-112],[16,-70],[0,-25]];
function along(path,u,F){const seg=(path.length-1)*clamp(u),i=Math.min(path.length-2,Math.floor(seg)),f=seg-i,a=path[i],b=path[i+1];return {x:450+mix(a[0],b[0],f),y:F+mix(a[1],b[1],f)};}
export function drawLkMeridians(scene,c,st,s,lift=0){
 const m=st.meridian;if(m<=.01)return;const F=s.feet-lift;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';c.lineJoin='round';
 MERIDIANS.forEach((path,pi)=>{const u=clamp(m*1.35-pi*.08);if(u<=0)return;const steps=24,pts=[];for(let q=0;q<=steps*u;q++)pts.push(along(path,q/steps,F));if(pts.length<2)return;
  for(const [w,col,a] of (lightBudget(scene)?[[3.2,JADE2,.8]]:[[9,JADE,.18],[3.2,JADE2,.75],[1.2,'#ffffff',.9]])){c.globalAlpha=a*Math.min(1,m*1.4);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const p of pts)c.lineTo(p.x,p.y);c.stroke();}
  // Huyệt đạo: điểm sáng ở các nút đã thông.
  const gs=glowSprite(GOLD);for(let n=0;n<path.length;n++){if(n/(path.length-1)>u)break;const r=4+2*Math.sin(st.k*40+n+pi);blit(c,gs,450+path[n][0],F+path[n][1],r*3,Math.min(1,m*1.4));}
 });
 // Tiểu chu thiên: điểm sáng vàng chạy vòng đốc–nhâm, kéo đuôi.
 if(st.orbit>.01){const sp=(st.k-.40)*9,gs=glowSprite(GOLD);for(let j=0;j<10;j++){const p=along(ORBIT,((sp-j*.018)%1+1)%1,F);blit(c,gs,p.x,p.y,(7-j*.5)*2.8,st.orbit*(1-j/10));}}
 c.restore();
}
// Ngưng khí: tám quẻ (đang vây quanh người) nén vào đan điền ngay trước nổ — vẽ các vệt hút.
export function drawLkConverge(scene,c,st,s){
 if(st.converge<=.05||st.after)return;const o={x:450,y:s.feet-25},pull=ease((st.k-.665)/.035);if(pull<=0)return;
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const a=i*TAU/8,r=200*(1-pull),px=o.x+Math.cos(a)*r,py=o.y-120*(1-pull)+Math.sin(a)*r*.35;c.strokeStyle=i%2?GOLD:JADE;c.globalAlpha=.7*(1-pull*.5);c.lineWidth=3;c.beginPath();c.moveTo(px,py);c.lineTo(mix(px,o.x,.6),mix(py,o.y,.6));c.stroke();}c.restore();
}
// Tám quẻ văng ra khi phá.
export function drawLkScatter(scene,c,st,s){
 if(!st.after||st.scatter>=1)return;const o={x:450,y:s.feet-25};c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const a=i*TAU/8-Math.PI/2+.2,u=st.scatter,r=40+u*(420+60*rnd(i)),px=o.x+Math.cos(a)*r,py=o.y+Math.sin(a)*r*.55-u*80,sp=trigramSprite(scene,i),sz=58*(1-u*.4);c.globalAlpha=(1-u)*.95;
  c.save();c.translate(px,py);c.rotate(u*(i%2?2:-2));sp&&c.drawImage(sp,-sz/2,-sz/2,sz,sz);c.restore();}
 c.restore();
}
// Pháp luân Bát Quái sau lưng sau khi phá cảnh (phẳng đứng, quay chậm, viền sen).
export function drawLkWheel(scene,c,st,s,v){
 if(st.wheel<=.01)return;const im=baguaSurface(scene);if(!im)return;const cx=450,cy=s.feet-150,R=230*(.85+.15*out(st.wheel)),rot=(v?.flip?-1:1)*st.ka*1.2;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=st.wheel*(1-ease((st.ka-.7)/.3)*.45)*.55;c.translate(cx,cy);c.rotate(rot);c.drawImage(im,-R,-R,R*2,R*2);c.restore();
 // Viền cánh sen quanh pháp luân.
 c.save();c.translate(cx,cy);c.globalCompositeOperation='lighter';const n=lightBudget(scene)?12:18;const pe=petalSprite();for(let i=0;i<n;i++){const a=i*TAU/n-rot*.5,pr=R+14;c.save();c.rotate(a);c.translate(0,-pr);c.globalAlpha=st.wheel*.45;pe&&c.drawImage(pe,-20,-50,40,60);c.restore();}c.restore();
}
// Mặt nước dưới trận: sương thấp + gợn sóng lan từ trận đồ, phản chiếu ánh ngọc (lấp nửa dưới màn hình).
export function drawLkFloor(scene,c,st,s,H){
 const a=st.formation;if(a<=.01)return;const x=450,y=s.feet+28,light=lightBudget(scene),mist=floorSurface(scene);
 c.save();if(mist&&!light){c.globalAlpha=a;c.drawImage(mist,0,y+40,900,360);}
 // Phản chiếu hào quang dưới trận: một sprite sáng kéo dọc.
 const glow=Math.min(1,.25+.5*st.descend*(1-st.ka)+(st.after?.6*(1-st.ka):0)),gs=glowSprite(JADE);c.globalCompositeOperation='lighter';
 if(gs){c.globalAlpha=glow*.55;c.drawImage(gs,x-70,y+20,140,360);}
 // Gợn sóng lan từ trận đồ, nhanh hơn khi ngưng khí và sau nổ.
 const n=light?3:5,speed=.9+st.descend*1.6+(st.after?1.5:0);c.lineWidth=1.6;
 for(let i=0;i<n;i++){const u=((st.k*speed*4+i/n)%1),r=330+u*380;c.strokeStyle=i%2?GOLD:JADE2;c.globalAlpha=(1-u)*a*.5;c.beginPath();c.ellipse(x,y+40+u*90,r,r*.16,0,0,TAU);c.stroke();}
 c.restore();
}
function floorSurface(scene){
 if(scene.lkFloor)return scene.lkFloor;const f=makeSurface(225,90);if(!f)return null;const c=f.getContext('2d'),g=c.createLinearGradient(0,0,0,90);
 g.addColorStop(0,'#7dffcf00');g.addColorStop(.25,'#5fd3b330');g.addColorStop(.6,'#2a6d741a');g.addColorStop(1,'#0b223000');c.fillStyle=g;c.fillRect(0,0,225,90);return scene.lkFloor=f;
}
