// v4 (4/11/2026) Luyện Khí: các lớp hình mới quanh màn đột phá.
// Nhịp mới: tích tụ 0–.64, nén khí .64–.70, NỔ tại .70 (6,16 s / 8,8 s), dư âm .70–1 (≈2,6 s).
// Mọi hạt tính theo thời gian + chỉ số (không Math.random) nên tua lại / render offline đều giống nhau.
// Glow dùng sprite vẽ sẵn + 'lighter' (vẽ gradient mỗi khung rất tốn), số hạt giảm khi budget nhẹ.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3;
export const QI_IMPACT=.70;
// Bảng màu hiện hành; mỗi cảnh giới đặt lại trước khi vẽ (setFxPalette), mặc định là ngọc lục Luyện Khí.
export const QI_PALETTE=Object.freeze({main:'#7dffcf',main2:'#9cf7da',soft:'#bff6ff',gold:'#ffe7a8'});
let P=QI_PALETTE,ritualOverride=null;
export function setFxPalette(p){P={...QI_PALETTE,...p,...ritualOverride};}
export function beginRitualPalette(palette){const previous=P,override=ritualOverride;ritualOverride=palette;return ()=>{P=previous;ritualOverride=override;};}
// Thời gian hiển thị (k mới) → thời gian của mạch truyện cũ (cũ nổ ở .88). Dư âm giãn ra 2,5 lần.
export const qiStoryK=k=>k<QI_IMPACT?k*(.88/QI_IMPACT):.88+(k-QI_IMPACT)*(.12/(1-QI_IMPACT));
const glowCache=new Map();
function glow(color){
 if(glowCache.has(color))return glowCache.get(color);
 const f=makeSurface(64,64);if(!f)return null;const c=f.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'#ffffff');g.addColorStop(.18,color);g.addColorStop(.45,color+'55');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);glowCache.set(color,f);return f;
}
function dot(c,im,x,y,r,a){if(!im||a<=.003||r<=0)return;c.globalAlpha=Math.min(1,a);c.drawImage(im,x-r,y-r,r*2,r*2);}
// Camera: đẩy chậm vào trong lúc tích tụ, giật ra ở cú nổ, rồi lắng.
export function qiCamera(k,motion=true){
 if(!motion)return 1;const push=ease(k/.64)*.10,punch=k<QI_IMPACT?0:Math.exp(-(k-QI_IMPACT)*40)*.07;
 return 1+push+punch-ease((k-.74)/.2)*.04;
}
// Nền: dùng chính sân tông môn đang chiếu, phủ màu ngọc tối để hiệu ứng nổi lên (không còn nền phẳng trống).
export function drawQiEnvironment(scene,c,k,H,origin,raysOnly=false){
 if(!raysOnly){const bg=scene.background;
 // Lớp đặc trước: che sân/đám đông vẽ bên dưới trong cùng khung.
 c.fillStyle='#050d16';c.fillRect(0,0,900,H);
 if(bg){c.save();c.globalAlpha=.42;try{c.drawImage(bg,0,0,900,900*bg.height/bg.width);}catch{}c.restore();}
 const dim=.55+ease((k-.55)/.12)*.25-(k>=QI_IMPACT?Math.exp(-(k-QI_IMPACT)*25)*.5:0)-ease((k-.78)/.2)*.15;
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#040b14');g.addColorStop(.5,'#082025');g.addColorStop(1,'#050d16');c.save();c.globalAlpha=clamp(dim);c.fillStyle=g;c.fillRect(0,0,900,H);c.restore();}
 // Tia sáng trời rọi xuống người tu luyện.
 const ray=.10+ease(k/.6)*.10+(k>=QI_IMPACT?Math.exp(-(k-QI_IMPACT)*12)*.35:0);
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const top=origin.x+(i-1)*150+Math.sin(k*3+i)*12,w=70+i%2*50,grad=c.createLinearGradient(0,0,0,origin.y+120);grad.addColorStop(0,(P.main+'00'));grad.addColorStop(.35,(P.main+'22'));grad.addColorStop(1,(P.main+'00'));
  c.globalAlpha=ray*(i===1?1:.6);c.fillStyle=grad;c.beginPath();c.moveTo(top-w*.3,0);c.lineTo(top+w*.3,0);c.lineTo(origin.x+(i-1)*40+w,origin.y+120);c.lineTo(origin.x+(i-1)*40-w,origin.y+120);c.closePath();c.fill();}
 c.restore();
}
// Vignette tối dần khi nén khí, giúp mắt dồn vào đan điền.
export function drawQiVignette(c,k,H){
 const a=.35+ease((k-.6)/.1)*.35-(k>=QI_IMPACT?ease((k-QI_IMPACT)/.06)*.4:0);if(a<=0)return;
 const g=c.createRadialGradient(450,H*.55,H*.18,450,H*.55,H*.75);g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000');c.save();c.globalAlpha=clamp(a);c.fillStyle=g;c.fillRect(0,0,900,H);c.restore();
}
// Hạt linh khí từ bốn phương xoáy vào đan điền (thay cho mấy vệt cong rời rạc).
export function drawQiInflow(scene,c,k,origin,phase=0){
 const level=ease((k-.08)/.12)*(1-ease((k-.66)/.04));if(level<=0)return;
 const light=scene.budget?.level==="light",n=light?28:64,clock=(scene.motion===false?0:k*8.8)+phase*5;
 const im=[glow(P.main),glow(P.soft),glow(P.gold)];
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){
  const speed=.55+(i%5)*.09,u=(clock*speed*.28+i*.618)%1,R=380+(i*37)%160,a=i*2.399+u*2.4;
  const r=R*(1-u)**1.5,x=origin.x+Math.cos(a)*r,y=origin.y-30+Math.sin(a)*r*.62-(1-u)*(i%3)*60;
  const fade=Math.sin(u*Math.PI)*level,size=3+(i%4)*2+u*4;
  // Vệt đuôi ngắn để đọc được hướng bay.
  const pa=a-.14,pr=R*(1-Math.max(0,u-.05))**1.5;c.globalAlpha=fade*.35;c.strokeStyle=i%7===0?P.gold:P.main2;c.lineWidth=1.2;c.beginPath();c.moveTo(origin.x+Math.cos(pa)*pr,origin.y-30+Math.sin(pa)*pr*.62-(1-Math.max(0,u-.05))*(i%3)*60);c.lineTo(x,y);c.stroke();
  dot(c,im[i%7===0?2:i%3===0?1:0],x,y,size,fade*.9);
 }
 c.restore();
}
// Nén khí: điểm sáng ở đan điền phình ra + vệt lóe ngang trước cú nổ.
export function drawQiCompression(c,k,origin){
 const u=ease((k-.62)/.08)*(k<QI_IMPACT+.01?1:0);if(u<=0)return;
 const im=glow(P.soft);c.save();c.globalCompositeOperation='lighter';
 dot(c,im,origin.x,origin.y,22+u*70,.55+u*.4);
 c.globalAlpha=u*.8;const w=40+u*380,g=c.createLinearGradient(origin.x-w,0,origin.x+w,0);g.addColorStop(0,(P.main2+'00'));g.addColorStop(.5,P.soft);g.addColorStop(1,(P.main2+'00'));c.fillStyle=g;c.fillRect(origin.x-w,origin.y-1.5-u*2,w*2,3+u*4);
 c.restore();
}
// Cú nổ: chớp trắng toàn màn, cột sáng phóng lên trời, tia tỏa, tia lửa văng có trọng lực.
export function drawQiImpact(scene,c,k,H,origin,feet,{flash:showFlash=true,pillar:showPillar=true}={}){
 const t=k-QI_IMPACT;if(t<0||t>.3)return;
 const motion=scene.motion!==false,light=scene.budget?.level==='light',sec=t*8.8;
 c.save();c.globalCompositeOperation='lighter';
 // Cột sáng.
 const pillar=Math.exp(-sec*1.6)*ease(sec/.05);if(showPillar&&pillar>.01){const w=(30+90*out(sec/.25))*(.4+.6*pillar),g=c.createLinearGradient(origin.x-w,0,origin.x+w,0);g.addColorStop(0,(P.main+'00'));g.addColorStop(.35,(P.main+'88'));g.addColorStop(.5,'#ffffff');g.addColorStop(.65,(P.main+'88'));g.addColorStop(1,(P.main+'00'));c.fillStyle=g;const base=origin.y-40;c.globalAlpha=pillar*.9;c.fillRect(origin.x-w,0,w*2,base);
  // Đáy cột sáng mờ dần qua 8 lát, không cắt thẳng thành khối vuông.
  for(let j=0;j<8;j++){c.globalAlpha=pillar*.9*(1-(j+1)/9);c.fillRect(origin.x-w,base+j*12,w*2,12);}}
 // Tia tỏa xoay nhẹ.
 const rays=Math.exp(-sec*2.6);if(rays>.02){for(let i=0;i<16;i++){const a=i*TAU/16+(motion?sec*.25:0)+(i%2)*.09,len=(260+(i*53)%220)*(.5+.5*out(sec/.3)),w=i%2?.035:.06;c.globalAlpha=rays*(i%2?.35:.6);const g=c.createLinearGradient(origin.x,origin.y,origin.x+Math.cos(a)*len,origin.y+Math.sin(a)*len);g.addColorStop(0,'#ffffff');g.addColorStop(1,(P.main+'00'));c.fillStyle=g;c.beginPath();c.moveTo(origin.x,origin.y);c.lineTo(origin.x+Math.cos(a-w)*len,origin.y+Math.sin(a-w)*len);c.lineTo(origin.x+Math.cos(a+w)*len,origin.y+Math.sin(a+w)*len);c.closePath();c.fill();}}
 // Tia lửa linh khí văng ra, chậm dần, rơi nhẹ.
 const n=light?34:80,ims=[glow(P.main),glow(P.gold),glow(P.soft)];
 for(let i=0;i<n;i++){const a=i*2.399+(i%3)*.2,v=420+(i*71)%520,drag=(1-Math.exp(-sec*2.2))/2.2,x=origin.x+Math.cos(a)*v*drag,y=origin.y+Math.sin(a)*v*drag*.8+90*sec*sec,life=1-sec/(1.1+(i%5)*.25);if(life<=0)continue;
  const tx=Math.cos(a)*v*Math.exp(-sec*2.2)*.03,ty=Math.sin(a)*v*Math.exp(-sec*2.2)*.024;c.globalAlpha=life*.7;c.strokeStyle=i%4?P.main2:P.gold;c.lineWidth=i%3?1.2:2;c.beginPath();c.moveTo(x-tx,y-ty);c.lineTo(x,y);c.stroke();dot(c,ims[i%3],x,y,3+(i%4),life);}
 // Vòng xung kích sắc nét, hai lớp lệch màu.
 for(let j=0;j<2;j++){const u=out((sec-j*.06)/.7);if(u<=0||u>=1)continue;const r=40+u*620;c.globalAlpha=(1-u)*.8;c.strokeStyle=j?P.gold:P.soft;c.lineWidth=1+5*(1-u);c.beginPath();c.ellipse(origin.x,origin.y,r,r*.62,0,0,TAU);c.stroke();}
 c.restore();
 // Chớp trắng toàn màn (ngắn để không chói trên điện thoại).
 const flash=Math.exp(-sec*9)*ease(sec/.02);if(showFlash&&flash>.01){c.save();c.globalAlpha=flash*(motion?.75:.35);c.fillStyle=P.soft;c.fillRect(0,0,900,H);c.restore();}
}
// Dư âm: hào quang linh khí bốc lên quanh thân (phía sau nhân vật).
export function drawQiAura(scene,c,k,origin,feet){
 const level=ease((k-QI_IMPACT)/.05)*(1-ease((k-.93)/.07));if(level<=0)return;
 const light=scene.budget?.level==='light',n=light?10:22,clock=scene.motion===false?0:k*8.8,im=glow(P.main),im2=glow(P.soft);
 c.save();c.globalCompositeOperation='lighter';
 const halo=c.createRadialGradient(origin.x,feet-170,10,origin.x,feet-170,260);halo.addColorStop(0,(P.main+'40'));halo.addColorStop(1,(P.main+'00'));c.globalAlpha=level;c.fillStyle=halo;c.fillRect(origin.x-260,feet-430,520,520);
 for(let i=0;i<n;i++){const u=(clock*(.35+(i%4)*.06)+i*.37)%1,side=(i%2?1:-1)*(60+(i*29)%70)*(1-u*.5),x=origin.x+side+Math.sin(u*6+i)*10,y=feet-10-u*(300+(i%3)*60);dot(c,i%5?im:im2,x,y,10+(1-u)*14,level*Math.sin(u*Math.PI)*.45);}
 c.restore();
}
// Dư âm: bụi sáng rơi chậm như mưa linh khí.
export function drawQiMotes(scene,c,k,H){
 const level=ease((k-.72)/.05)*(1-ease((k-.95)/.05));if(level<=0)return;
 const light=scene.budget?.level==='light',n=light?18:42,sec=(k-.70)*8.8,im=glow(P.main2),gold=glow(P.gold);
 c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const x=60+(i*197)%780+Math.sin(sec*1.3+i)*14,y=H*.08+((i*131)%(H*.3))+sec*(40+(i%5)*12),tw=.5+.5*Math.sin(sec*6+i*1.7);dot(c,i%6?im:gold,x,y,2.5+(i%3),level*(.35+.5*tw));}
 c.restore();
}
// 4/11/2026: chống "reproduced content" — mỗi lần đột phá một biến thể (lật hướng, góc máy, nhịp hạt, cao độ),
// tính từ mã sự kiện nên ổn định trong một lần chiếu nhưng khác nhau giữa các lần.
export function qiSeed(e){const s=String(e?.id||'')+'|'+String(e?.user||'');let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
export function qiVariant(e){const h=qiSeed(e);return {flip:!!(h&1),zoom:.6+((h>>>1)%5)*.2,dy:((h>>>4)%5-2)*25,phase:((h>>>7)%97)/97,pitch:[1,1.1225,.8909,1.1892,.9439][(h>>>11)%5]};}
// 4/11/2026: tiện ích để ghép lớp chung vào cảnh giới khác.
// qiRemap: thời gian cảnh giới (k) → thời gian lớp chung, sao cho mốc nổ kb của cảnh giới trùng QI_IMPACT.
export const qiRemap=(k,kb)=>k<kb?k*QI_IMPACT/kb:QI_IMPACT+(k-kb)*(1-QI_IMPACT)/(1-kb);
// Camera đẩy vào + lật theo biến thể; nhớ c.restore() sau khi vẽ xong phần trong khung.
export function pushFxCamera(scene,c,kq,v,feet){const zoom=1+(qiCamera(kq,scene.motion!==false&&scene.cameraEnabled!==false)-1)*v.zoom,fy=feet-150+v.dy;c.save();c.translate(450,fy);c.scale(zoom,zoom);c.translate(-450,-fy);if(v.flip){c.translate(900,0);c.scale(-1,1);}}
