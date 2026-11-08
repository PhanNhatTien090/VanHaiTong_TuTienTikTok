// Khai Lò Cửu Chuyển — phần hình (08/11/2026). Nguyên tắc: GIỌNG NÓI ÍT, HÌNH NÓI NHIỀU.
// Màn hình luôn trả lời 3 câu: "giờ phải làm gì" (bảng lệnh lớn đổi màu), "lò đang thế nào" (nhiệt kế + vùng vàng), "quà để làm gì" (chú thích quà cố định).
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const hash=s=>{let h=2166136261;for(const ch of String(s||''))h=Math.imul(h^ch.codePointAt(0),16777619);return h>>>0;};
const nm=(s,n=12)=>Array.from(String(s||'')).slice(0,n).join('');
const fmtN=n=>Math.round(Number(n)||0).toLocaleString('vi-VN');
const GRADE=['','NHẤT PHẨM','NHỊ PHẨM','TAM PHẨM','TỨ PHẨM','NGŨ PHẨM','LỤC PHẨM','THẤT PHẨM','BÁT PHẨM','CỬU PHẨM'];
const GRADE_COL=['#9aa3b5','#c9cfd8','#9be38a','#6fe0c8','#6ab8ff','#8f8bff','#c77dff','#ff7ad9','#ffb347','#ffe066'];
// 4 bộ màu lò (mỗi lượt khác nhau — tránh lặp y hệt)
const SKINS=[{body:'#7a4a22',rim:'#c98a3a',rune:'#ffcf6b'},{body:'#3c4a5a',rim:'#8fb2d0',rune:'#9fe8ff'},{body:'#5a2a2a',rim:'#d06a4a',rune:'#ffb08a'},{body:'#2f4a36',rim:'#8fcf8a',rune:'#d4ff9a'}];
const serverNow=(scene,t)=>(scene.alcServerNow||Date.now())+Math.min(2000,t-(scene.alcReceivedAt||t));
export function syncAlchemy(scene,state){const e=state.alchemy||null;scene.alcStatus=e;scene.alcStage=state.alchemyStage||[];scene.alcReceivedAt=performance.now();scene.alcServerNow=state.serverNow;
 if(e?.heat!=null){scene.alcHeatServer=e.heat;scene.alcHeatAt=performance.now();}
 if(e?.sootUntil){scene.alcSoot={until:e.sootUntil,ids:new Set(e.sootIds||scene.alcSoot?.ids||[])};}
 document.body.classList.toggle('alchemy-on',!!e?.active);}
export const alchemyOn=scene=>!!scene.alcStatus?.active;
// Vùng vàng (cùng công thức với server: zoneAt trong alchemy.mjs)
function zoneAt(z,now){if(!z)return {lo:40,hi:60,c:50};let c=z.c+(z.amp?z.amp*Math.sin((now-z.at)/z.period*TAU):0)+(z.shift||0);const half=z.half*(z.wideUntil>now?2:1);c=Math.max(half+4,Math.min(96-half,c));return {lo:c-half,hi:c+half,c};}
// Nhiệt hiển thị: nội suy mượt + tự nguội giữa hai lần server gửi.
function heatNow(scene,t){const e=scene.alcStatus;if(e?.heat==null)return 0;const dt=Math.min(1.2,(t-(scene.alcHeatAt||t))/1000),now=serverNow(scene,t);
 let goal=e.phase==='brewing'&&!(e.lockUntil>now)?Math.max(0,scene.alcHeatServer-(e.decay||3)*dt):scene.alcHeatServer;scene.alcHeat=scene.alcHeat==null?goal:scene.alcHeat+(goal-scene.alcHeat)*.15;return scene.alcHeat;}
const CX=450,cy=H=>H*.47;
export function alchemyTargets(scene,players,H,t){
 const out=[];players.slice(0,12).forEach((p,i)=>{const row=i<6?0:1,col=row?i-6:i,x=row?162+col*115:90+col*144,y=H*(row?.84:.72)+(scene.motion?Math.sin(t*.003+i)*3:0);
  out.push({id:p.id,player:p,x,y,scale:row?1.32:1.12,lift:0,alchemy:true});});
 return out;
}
function glow(c,x,y,r,col,a){if(a<=0||r<=1)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+Math.round(255*clamp(a)).toString(16).padStart(2,'0'));g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function txt(c,s,x,y,font,fill,stroke=6,align='center'){c.font=font;c.textAlign=align;c.textBaseline='middle';c.lineWidth=stroke;c.strokeStyle='#05060c';c.lineJoin='round';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
function pill(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function bolt(c,x0,y0,x1,y1,seed,col,w){c.beginPath();for(let i=0;i<=12;i++){const u=i/12,j=(rnd(seed+i)-.5)*60*Math.sin(u*Math.PI);c.lineTo(x0+(x1-x0)*u+j,y0+(y1-y0)*u);}c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function heatColor(h,zone){if(h<zone.lo)return '#5fb8ff';if(h<=zone.hi)return '#ffd36b';if(h<88)return '#ff8a3d';return '#ff3b3b';}
// ---------- âm thanh: phát một lần mỗi biến cố + sôi lục bục + còi khi sắp nổ ----------
function sounds(scene,e,now,t,heat,zone){const play=scene.onAlchemySound;if(!play)return;const seen=scene.alcSeen??=new Set();
 for(const f of e.fx||[]){if(seen.has(f.id))continue;seen.add(f.id);if(now-f.at>3000)continue;
  const k={rose:'rose',herb:'herb',fire:'fire',explode:'explode',strike:'strike',shield:'shield',round:'round',done:'done',trib:'strike',incident:f.incident==='rat'?'rat':'round',quiz:f.right?'herb':'crack','rat-end':f.ok?'herb':'crack'}[f.kind];if(k)play(k,1+Math.log10(1+(f.value||1))/2);}
 if(seen.size>200)scene.alcSeen=new Set([...seen].slice(-100));
 const key=e.id+':'+e.phase;if(scene.alcPhaseKey!==key){scene.alcPhaseKey=key;if(e.phase==='opening')play('start');}
 if(e.phase==='brewing'){const gap=heat>zone.hi?260:heat>=zone.lo?520:900;if(t-(scene.alcBubbleAt||0)>gap){scene.alcBubbleAt=t;play('bubble',.6+heat/100);}
  if(heat>=(e.danger||88)&&t-(scene.alcAlarmAt||0)>700){scene.alcAlarmAt=t;play('alarm');}}
 const q=e.quiz;if(q&&now>=q.startsAt&&scene.alcQuizKey!==q.startsAt){scene.alcQuizKey=q.startsAt;play('quiz');}}
// ---------- lò đan (vẽ bằng code, 4 bộ màu) ----------
function drawCauldron(scene,c,e,t,H,heat,zone,now){
 const y=cy(H),S=SKINS[(e.variant||0)%SKINS.length],motion=scene.motion!==false,danger=heat>=(e.danger||88)&&e.phase==='brewing',exploded=e.result?.exploded;
 const shake=motion?(danger?(heat-85)*.5:heat>zone.hi?1.5:0):0;const sx=Math.sin(t*.07)*shake,sy=Math.cos(t*.09)*shake*.6;
 c.save();c.translate(CX+sx,y+sy);if(exploded)c.rotate(-.12);
 // lửa dưới lò: cao theo nhiệt, màu theo vùng
 const fire=e.phase==='finished'?0:clamp(heat/100),fc=heatColor(heat,zone),locked=e.lockUntil>now;
 if(fire>0){c.save();c.globalCompositeOperation='screen';glow(c,0,150,170+fire*120,locked?'#ffe9a0':fc,.55+fire*.3);
  const n=scene.budget?.level==='light'?12:22;for(let i=0;i<n;i++){const u=(t*.0016*(1+fire)+i/n)%1,x=(rnd(i)-.5)*220*(1-u*.5),h=(40+fire*190)*(1-u);c.globalAlpha=(1-u)*.9;c.fillStyle=i%3?fc:'#ffffff';c.beginPath();c.ellipse(x,170-u*(60+fire*170),9*(1-u)+4,h*.18+6,0,0,TAU);c.fill();}
  c.restore();}
 // chân + thân + vành + quai
 c.fillStyle=S.body;[-1,0,1].forEach(k=>{c.beginPath();c.moveTo(k*110-14,90);c.lineTo(k*120-20,175);c.lineTo(k*120+8,175);c.lineTo(k*110+14,90);c.closePath();c.fill();});
 const g=c.createRadialGradient(-50,-10,20,0,30,190);g.addColorStop(0,S.rim);g.addColorStop(.55,S.body);g.addColorStop(1,'#140a05');c.fillStyle=g;c.beginPath();c.ellipse(0,40,170,118,0,0,TAU);c.fill();
 c.lineWidth=5;c.strokeStyle=S.rim;c.beginPath();c.ellipse(0,40,170,118,0,0,TAU);c.stroke();
 c.fillStyle=S.rim;c.beginPath();c.ellipse(0,-62,150,30,0,0,TAU);c.fill();c.fillStyle='#120804';c.beginPath();c.ellipse(0,-62,124,20,0,0,TAU);c.fill();
 for(const k of [-1,1]){c.lineWidth=14;c.strokeStyle=S.rim;c.beginPath();c.arc(k*178,-30,34,k<0?Math.PI*.5:-Math.PI*.5,k<0?Math.PI*1.5:Math.PI*.5,k>0);c.stroke();}
 // phù văn sáng theo nhiệt
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=.35+fire*.6;c.strokeStyle=locked?'#fff3b0':S.rune;c.lineWidth=3;c.beginPath();c.ellipse(0,44,140,30,0,0,Math.PI);c.stroke();
 for(let i=0;i<7;i++){const a=Math.PI*(.15+i*.1),x=Math.cos(a)*140,yy=44+Math.sin(a)*30;c.beginPath();c.arc(x,yy,7,0,TAU);c.stroke();}
 glow(c,0,-62,140,GRADE_COL[e.grade||1],.25+fire*.35);c.restore();
 if(exploded){c.strokeStyle='#05060c';c.lineWidth=5;c.beginPath();c.moveTo(-30,-40);c.lineTo(-5,10);c.lineTo(-40,60);c.lineTo(-10,110);c.stroke();}
 c.restore();
 // khói từ miệng lò — màu theo phẩm hiện tại
 if(e.phase!=='finished'||!exploded){c.save();const col=GRADE_COL[e.grade||1],n=scene.budget?.level==='light'?6:12;for(let i=0;i<n;i++){const u=(t*.00035+i/n)%1,x=CX+sx+(rnd(i+3)-.5)*120+Math.sin(u*5+i)*30*u,yy=y-70-u*H*.18;c.globalAlpha=(1-u)*.38;c.fillStyle=col;c.beginPath();c.arc(x,yy,20+u*50,0,TAU);c.fill();}c.restore();}
 // Tiên Hỏa Hộ Lô: rồng lửa quấn lò
 if(locked&&motion){c.save();c.globalCompositeOperation='screen';for(let i=0;i<40;i++){const a=t*.004+i*.16,r=200+Math.sin(i*.4)*14;c.globalAlpha=1-i/40;c.fillStyle=i<3?'#ffffff':'#ffc34a';c.beginPath();c.arc(CX+Math.cos(a)*r,y+30+Math.sin(a)*r*.45,12-i*.25,0,TAU);c.fill();}c.restore();}
}
// ---------- hiệu ứng quà / biến cố ----------
function drawFx(scene,c,e,t,H,now){
 const y=cy(H);for(const f of e.fx||[]){const age=now-f.at;if(age<0)continue;
  if(f.kind==='rose'&&age<2600){const k=age/2600,a=Math.sin(Math.min(1,k*1.4)*Math.PI);c.save();c.globalCompositeOperation='screen';
   for(let i=0;i<34;i++){const u=(k*1.8+rnd(i+hash(f.id)))%1;c.globalAlpha=a*(1-u*.4);c.fillStyle=i%4?'#7fd4ff':'#ffffff';c.beginPath();c.ellipse(CX+(rnd(i)-.5)*180,-40+u*(y-20),4,12,0,0,TAU);c.fill();}
   for(let i=0;i<10;i++){const r=40+k*170+i*8;c.globalAlpha=a*.25;c.fillStyle='#e8f6ff';c.beginPath();c.arc(CX+(rnd(i+9)-.5)*260,y-80-k*120-rnd(i)*60,r*.4,0,TAU);c.fill();}
   c.globalAlpha=a;txt(c,(f.saved?'🌹 CỨU LÒ! · ':'🌹 BĂNG TÂM THỦY · ')+nm(f.name),CX,H*.36,'900 30px Segoe UI',f.saved?'#9fe8ff':'#d6f3ff',7);c.restore();}
  if(f.kind==='herb'&&age<2400){const k=age/2400,a=Math.sin(Math.min(1,k*1.3)*Math.PI),src=scene.targets?.find(x=>x.id===f.user),x0=src?.x??(hash(f.id)%2?80:820),y0=src?(src.y-120):H*.75,u=clamp(k*1.6),x=x0+(CX-x0)*u,yy=y0+(y-90-y0)*u-Math.sin(u*Math.PI)*160;
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;if(u<1){glow(c,x,yy,60,'#9bff8a',.9);c.fillStyle='#d4ffb0';c.beginPath();c.ellipse(x,yy,10,22,u*6,0,TAU);c.fill();}else{glow(c,CX,y-70,220,'#9bff8a',.7*a);}
   txt(c,'🌿 LINH DƯỢC +PHẨM · '+nm(f.name),CX,H*.36,'900 28px Segoe UI','#c8ffb0',7);c.restore();}
  if(f.kind==='fire'&&age<3200){const k=age/3200,a=Math.sin(Math.min(1,k*1.2)*Math.PI);c.save();c.globalCompositeOperation='screen';c.globalAlpha=a*.5;c.fillStyle='#ffb347';c.fillRect(0,0,900,H);c.globalAlpha=a;glow(c,CX,y,420,'#ffe9a0',.8);
   txt(c,'🐉 TIÊN HỎA HỘ LÔ · '+nm(f.name),CX,H*.36,'900 34px Segoe UI','#ffe066',8);txt(c,'khóa lửa 10 giây · +phẩm',CX,H*.36+40,'800 22px Segoe UI','#fff3c8',5);c.restore();}
  if(f.kind==='shield'&&age<1600){const a=1-age/1600;c.save();c.globalCompositeOperation='screen';c.globalAlpha=a;txt(c,'🛡 '+nm(f.name)+' gia cố kết giới',CX,H*.36,'900 26px Segoe UI','#bfe6ff',6);c.restore();}
  if(f.kind==='round'&&age<2200){const a=Math.sin(clamp(age/2200)*Math.PI);c.save();c.globalAlpha=a;txt(c,'CHUYỂN '+f.round+' / 3',CX,H*.33,'900 64px Segoe UI','#ffe9b0',10);c.restore();}
  if(f.kind==='quiz'&&age<2500){const a=Math.sin(clamp(age/2500)*Math.PI);c.save();c.globalAlpha=a;txt(c,f.right?'✔ CHỌN ĐÚNG · +PHẨM':'✘ CHỌN SAI · −PHẨM',CX,H*.33,'900 44px Segoe UI',f.right?'#9bff8a':'#ff7a7a',9);c.restore();}
  if(f.kind==='rat-end'&&age<2500){const a=Math.sin(clamp(age/2500)*Math.PI);c.save();c.globalAlpha=a;txt(c,f.ok?'🐀 ĐUỔI ĐƯỢC CHUỘT TINH!':'🐀 CHUỘT TRỘM MẤT DƯỢC LIỆU',CX,H*.33,'900 40px Segoe UI',f.ok?'#9bff8a':'#ff9a7a',9);c.restore();}
  if(f.kind==='strike'&&age<700){const a=1-age/700;c.save();c.globalCompositeOperation='screen';c.globalAlpha=a*.5;c.fillStyle='#d8e4ff';c.fillRect(0,0,900,H);c.globalAlpha=a;for(let i=0;i<3;i++)bolt(c,CX+(rnd(hash(f.id)+i)-.5)*500,0,CX+(rnd(i)-.5)*60,y-60,hash(f.id)+i*17,i?'#bcd0ff':'#ffffff',i?3:6);c.restore();}
  if(f.kind==='explode'&&age<5000){const k=age/5000;c.save();if(age<350){c.globalAlpha=1-age/350;c.fillStyle='#ffffff';c.fillRect(0,0,900,H);}
   c.globalAlpha=1;for(let i=0;i<3;i++){const R=(k*1.6+i*.12)*900;c.globalAlpha=clamp(1-R/900)*.8;c.lineWidth=14-i*4;c.strokeStyle=i?'#ff8a3d':'#ffe9a0';c.beginPath();c.ellipse(CX,y,R,R*.55,0,0,TAU);c.stroke();}
   for(let i=0;i<26;i++){const a=rnd(i)*TAU,d=k*(300+rnd(i+5)*500);c.globalAlpha=clamp(1-k*1.2);c.fillStyle=i%2?'#3a2a1a':'#ff8a3d';c.fillRect(CX+Math.cos(a)*d,y+Math.sin(a)*d*.7-k*k*-200,10,10);}
   for(let i=0;i<16;i++){const a=rnd(i+40)*TAU,d=60+k*380*rnd(i+2);c.globalAlpha=clamp(.85-k*.6);c.fillStyle='#14100e';c.beginPath();c.arc(CX+Math.cos(a)*d,y-40+Math.sin(a)*d*.6-k*160,70+k*120,0,TAU);c.fill();}
   c.globalAlpha=clamp(Math.min(age/200,(5000-age)/600));txt(c,'💥 NỔ LÒ!',CX,H*.3,'900 96px Segoe UI','#ffb347',12);c.restore();}
 }}
// ---------- HUD: luôn nói "làm gì ngay bây giờ" ----------
function drawHud(scene,c,e,t,H,heat,zone,now){
 const x0=70,w=760,by=H*.105,bh=36,motion=scene.motion!==false;c.save();
 c.fillStyle='#05060cd8';pill(c,x0-24,H*.022,w+48,H*.215,18);c.fill();
 const left=e.phase==='opening'?(e.openEndsAt-now):e.phase==='brewing'?(e.roundEndsAt-now):e.phase==='tribulation'?(e.tribEndsAt-now):0,sec=Math.max(0,Math.ceil(left/1000));
 txt(c,'🔥 KHAI LÒ CỬU CHUYỂN',x0,H*.05,'900 30px Segoe UI','#ffd36b',6,'left');
 txt(c,e.phase==='opening'?'chuẩn bị · '+sec+'s':e.phase==='tribulation'?'ĐAN KIẾP · '+sec+'s':'chuyển '+(e.round||1)+'/3 · '+sec+'s',x0+w,H*.05,'800 24px Segoe UI','#ffffff',5,'right');
 // nhiệt kế: xanh (nguội) → vàng → đỏ (nổ); dải vàng = vùng cần giữ
 const grd=c.createLinearGradient(x0,0,x0+w,0);grd.addColorStop(0,'#2a6bd6');grd.addColorStop(.45,'#ffb347');grd.addColorStop(.85,'#ff5a2a');grd.addColorStop(1,'#ff1a1a');c.fillStyle='#120c08';pill(c,x0,by,w,bh,bh/2);c.fill();c.globalAlpha=.55;c.fillStyle=grd;pill(c,x0,by,w,bh,bh/2);c.fill();c.globalAlpha=1;
 if(e.phase!=='tribulation'){const zl=x0+w*zone.lo/100,zw=w*(zone.hi-zone.lo)/100,pulse=motion?.75+.25*Math.sin(t*.008):1;c.fillStyle='#ffe066';c.globalAlpha=.85*pulse;c.fillRect(zl,by-6,zw,bh+12);c.globalAlpha=1;c.lineWidth=3;c.strokeStyle='#fff8d0';c.strokeRect(zl,by-6,zw,bh+12);txt(c,'VÙNG VÀNG',zl+zw/2,by+bh/2,'900 16px Segoe UI','#4a2a00',0);}
 const hx=x0+w*clamp(heat/100),hc=heatColor(heat,zone);c.fillStyle=hc;c.beginPath();c.moveTo(hx,by-14);c.lineTo(hx-14,by-34);c.lineTo(hx+14,by-34);c.closePath();c.fill();c.fillStyle='#ffffff';c.fillRect(hx-3,by-10,6,bh+20);
 if(e.lockUntil>now)txt(c,'🔒',hx,by-50,'900 22px Segoe UI','#ffe066',4);
 txt(c,'❄ NGUỘI',x0+8,by+bh+22,'800 17px Segoe UI','#8fc8ff',4,'left');txt(c,'NỔ 💥',x0+w-8,by+bh+22,'800 17px Segoe UI','#ff8a8a',4,'right');
 // BẢNG LỆNH LỚN — đổi theo tình hình (đây là thứ thay cho giọng nói)
 let msg,col,bg;
 if(e.phase==='opening'){msg='❤ THẢ TIM ĐỂ NHÓM LỬA';col='#120a04';bg='#ffd36b';}
 else if(e.phase==='tribulation'){msg='⚡ THẢ TIM GIỮ KẾT GIỚI · 🌹 GIA CỐ';col='#ffffff';bg='#3b5bd6';}
 else if(e.lockUntil>now){msg='🔒 TIÊN HỎA ĐANG GIỮ LỬA';col='#120a04';bg='#ffe066';}
 else if(heat>=(e.danger||88)){msg='🌹 SẮP NỔ! TẶNG HOA HỒNG DẬP LỬA';col='#ffffff';bg=Math.floor(t/250)%2?'#d61a1a':'#7a0a0a';}
 else if(heat>zone.hi){msg='✋ DỪNG TIM! LỬA QUÁ TO';col='#ffffff';bg='#e0532a';}
 else if(heat>=zone.lo){msg='✔ GIỮ NHỊP · thả tim nhẹ tay';col='#0c2a10';bg='#9bff8a';}
 else{msg='❤ THẢ TIM! LỬA SẮP TẮT';col='#120a04';bg='#ffb347';}
 const my=H*.172,mh=50;c.font='900 30px Segoe UI';const mw=Math.min(w,c.measureText(msg).width+60);const sc=motion&&heat>=(e.danger||88)?1+.04*Math.sin(t*.03):1;c.save();c.translate(CX,my+mh/2);c.scale(sc,sc);c.fillStyle=bg;pill(c,-mw/2,-mh/2,mw,mh,mh/2);c.fill();c.fillStyle=col;c.textAlign='center';c.textBaseline='middle';c.fillText(msg,0,2);c.restore();
 // phẩm đan hiện tại: 9 viên đan sáng dần
 const gy=H*.222,g=e.grade||1;txt(c,'PHẨM',x0+10,gy,'900 20px Segoe UI','#ffe9b0',4,'left');for(let i=0;i<9;i++){const x=x0+90+i*44,on=i<g;c.fillStyle=on?GRADE_COL[i+1]:'#2a2a33';c.beginPath();c.arc(x,gy,13,0,TAU);c.fill();if(on){c.save();c.globalCompositeOperation='screen';glow(c,x,gy,26,GRADE_COL[i+1],.5);c.restore();}}
 txt(c,GRADE[g]||'',x0+w,gy,'900 22px Segoe UI',GRADE_COL[g],5,'right');
 c.restore();
 // câu chọn dược liệu
 const q=e.quiz;if(q&&e.phase==='brewing'&&now>=q.startsAt-1500){const a=clamp((now-q.startsAt+1500)/500),qy=H*.27,bw=340,bh2=74,open=now<q.endsAt,qs=Math.max(0,Math.ceil((q.endsAt-now)/1000));c.save();c.globalAlpha=a;
  txt(c,'🌿 '+q.q+(open?' · gõ 1 hoặc 2 · '+qs+'s':''),CX,qy,'900 24px Segoe UI','#ffffff',6);
  const tot=Math.max(1,(q.tally?.[0]||0)+(q.tally?.[1]||0));[0,1].forEach(i=>{const x=i?CX+12:CX-12-bw,yy=qy+20,picked=q.chosen===i,share=(q.tally?.[i]||0)/tot;c.fillStyle=picked?(q.result==='right'?'#2f7a2a':'#7a2a2a'):'#141420e8';pill(c,x,yy,bw,bh2,16);c.fill();c.fillStyle=i?'#7fd4ff55':'#ffb34755';pill(c,x,yy,bw*share,bh2,16);c.fill();c.lineWidth=3;c.strokeStyle=i?'#7fd4ff':'#ffb347';pill(c,x,yy,bw,bh2,16);c.stroke();
   txt(c,(i+1)+'',x+34,yy+bh2/2,'900 40px Segoe UI',i?'#7fd4ff':'#ffb347',6);txt(c,nm(q.options[i],18),x+62,yy+bh2/2-8,'900 24px Segoe UI','#ffffff',5,'left');txt(c,(q.tally?.[i]||0)+' người',x+62,yy+bh2/2+20,'700 17px Segoe UI','#cfd6e4',4,'left');});c.restore();}
 // biến cố
 const inc=e.incident;if(inc&&e.phase==='brewing'&&now<inc.endsAt+2000){const iy=H*.405,s=Math.max(0,Math.ceil((inc.endsAt-now)/1000));c.save();c.fillStyle='#200a0ad8';pill(c,CX-300,iy-30,600,60,30);c.fill();
  txt(c,inc.icon+' '+inc.name+' · '+(inc.kind==='rat'?'gõ bat: '+inc.have+'/'+inc.need:inc.hint)+' · '+s+'s',CX,iy,'900 24px Segoe UI','#ffd0b0',5);c.restore();
  if(inc.kind==='rat'&&!inc.result){const k=(now%4000)/4000,x=120+k*660,yy=H*.6+Math.sin(k*40)*6;c.save();c.fillStyle='#6a5a5a';c.beginPath();c.ellipse(x,yy,30,16,0,0,TAU);c.fill();c.beginPath();c.arc(x+28,yy-8,12,0,TAU);c.fill();c.strokeStyle='#6a5a5a';c.lineWidth=4;c.beginPath();c.moveTo(x-28,yy);c.quadraticCurveTo(x-60,yy-20,x-70,yy+6);c.stroke();c.fillStyle='#ff4040';c.beginPath();c.arc(x+33,yy-11,3,0,TAU);c.fill();txt(c,'🌿',x-6,yy-26,'24px Segoe UI','#fff',0);c.restore();}}
 // chú thích quà — cố định cuối màn hình
 if(e.phase!=='finished'){const ly=H*.955,items=e.phase==='tribulation'?[['🌹','Hoa hồng','gia cố kết giới','#7fd4ff']]:[['🌹','Hoa hồng','dập lửa cứu lò','#7fd4ff'],['🌿','Quà 5 xu+','linh dược +phẩm','#9bff8a'],['🐉','Quà 99 xu+','khóa lửa 10s','#ffe066']];
  const cw=items.length===1?380:272;items.forEach(([ic,a,b,col],i)=>{const x=CX-(items.length*cw+(items.length-1)*10)/2+i*(cw+10);c.fillStyle='#05060cd8';pill(c,x,ly-34,cw,68,16);c.fill();c.lineWidth=2;c.strokeStyle=col;pill(c,x,ly-34,cw,68,16);c.stroke();txt(c,ic,x+34,ly,'30px Segoe UI','#fff',0);txt(c,a,x+64,ly-13,'900 20px Segoe UI',col,4,'left');txt(c,b,x+64,ly+14,'700 18px Segoe UI','#ffffff',4,'left');});}
 // đan kiếp: thanh kết giới
 if(e.phase==='tribulation'){const s=clamp((e.shield||0)/100),sy=H*.3;c.save();c.fillStyle='#05060cd8';pill(c,x0,sy-22,w,44,22);c.fill();c.fillStyle=s<.3?'#ff5a5a':'#7fb8ff';pill(c,x0+4,sy-18,(w-8)*s,36,18);c.fill();txt(c,'🛡 KẾT GIỚI '+Math.round(s*100)+'%',CX,sy,'900 22px Segoe UI','#ffffff',5);c.restore();
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=.25+.35*s;c.strokeStyle='#a8c8ff';c.lineWidth=6;c.beginPath();c.ellipse(CX,cy(H)+20,260,220,0,Math.PI,TAU);c.stroke();c.restore();}
 // khai lò: 3 bước hướng dẫn bằng hình
 if(e.phase==='opening'){const oy=H*.3;[['❤','thả tim = quạt lửa'],['🟨','giữ kim trong vùng vàng'],['💥','quá nóng là NỔ LÒ']].forEach(([ic,s],i)=>{const x=CX-290+i*290;c.fillStyle='#05060cc8';pill(c,x-130,oy-40,260,80,18);c.fill();txt(c,ic,x,oy-12,'34px Segoe UI','#fff',0);txt(c,s,x,oy+24,'800 19px Segoe UI','#ffe9b0',4);});}
}
// Mặt đen sau nổ lò (60 s): chỉ vẽ đè lớp mờ lên mặt, không đụng model.
export function drawAlchemySoot(scene,c,t){const s=scene.alcSoot;if(!s||Date.now()>s.until||!scene.targets)return;const left=(s.until-Date.now())/1000,a=clamp(left/8)*.85;c.save();
 for(const p of scene.targets){if(!s.ids.has(p.id))continue;const k=p.scale||1,x=p.x,y=p.y-98*k;c.globalAlpha=a;const g=c.createRadialGradient(x,y,2,x,y,30*k);g.addColorStop(0,'#0a0807ee');g.addColorStop(.7,'#14100ccc');g.addColorStop(1,'#14100c00');c.fillStyle=g;c.beginPath();c.ellipse(x,y,30*k,26*k,0,0,TAU);c.fill();
  c.fillStyle='#ffffff';c.globalAlpha=a*.9;c.beginPath();c.arc(x-9*k,y-3*k,3.2*k,0,TAU);c.arc(x+9*k,y-3*k,3.2*k,0,TAU);c.fill();
  if(scene.motion!==false){c.fillStyle='#2a2522';for(let i=0;i<3;i++){const u=((t*.0007)+i/3+(hash(p.id)%100)/100)%1;c.globalAlpha=a*(1-u)*.6;c.beginPath();c.arc(x+Math.sin(u*6+i)*10*k,y-30*k-u*60*k,(6+u*12)*k,0,TAU);c.fill();}}}
 c.restore();}
export function drawAlchemy(scene,c,t,layer){
 const e=scene.alcStatus;if(!e?.active)return;const H=scene.height,now=serverNow(scene,t),zone=zoneAt(e.zone,now),heat=heatNow(scene,t);
 if(layer==='back'){sounds(scene,e,now,t,heat,zone);
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#1a0a04c0');bg.addColorStop(.6,'#2a1206a0');bg.addColorStop(1,'#0a0503d0');c.fillStyle=bg;c.fillRect(0,0,900,H);
  if(e.phase==='tribulation'){c.fillStyle='#0a1030a0';c.fillRect(0,0,900,H);}
  glow(c,CX,cy(H)+60,520,heatColor(heat,zone),.18+clamp(heat/100)*.2);
  drawCauldron(scene,c,e,t,H,heat,zone,now);return;}
 // front: tên người quanh lò, HUD, hiệu ứng
 for(const a of scene.targets||[]){if(!a.alchemy)continue;const top=e.top?.[0]?.id===a.id;if(top)txt(c,'⚗ ĐAN SƯ',a.x,a.y-150*a.scale-6,'900 15px Segoe UI','#ffe066',4);}
 if(e.phase!=='finished')drawHud(scene,c,e,t,H,heat,zone,now);
 drawFx(scene,c,e,t,H,now);
}
// ---------- bảng kết quả (16 s) ----------
export function drawAlchemyResult(scene,c,t){
 const e=scene.alcStatus;if(!e?.active||e.phase!=='finished'||!e.result)return;const H=scene.height,now=serverNow(scene,t),age=now-(e.finishedAt||now),end=(e.podiumUntil||now)-now,r=e.result,boom=r.exploded;
 const a=Math.min(clamp((age-(boom?2600:400))/600),clamp(end/700));if(a<=0)return;c.save();c.globalAlpha=a*.84;c.fillStyle='#04050c';c.fillRect(0,0,900,H);c.globalAlpha=a;const pulse=.5+.5*Math.sin(t*.004);
 if(boom){txt(c,'💥 NỔ LÒ!',CX,H*.2,'900 84px Segoe UI','#ffb347',11);txt(c,'khói đen phủ tông môn · lần sau nhẹ tay nhé',CX,H*.2+62,'800 24px Segoe UI','#ffe9b0',6);
  let y=H*.36;if(r.culprit){txt(c,'😵 KẺ NỔ LÒ',CX,y,'900 28px Segoe UI','#ff8a8a',6);txt(c,nm(r.culprit.name,16),CX,y+44,'900 40px Segoe UI','#ffffff',8);txt(c,'danh hiệu "Đan Tặc" · 1 giờ',CX,y+84,'700 20px Segoe UI','#ffc0c0',5);y+=150;}
  if(r.savior){txt(c,'🌹 NGƯỜI DỘI NƯỚC NHIỀU NHẤT',CX,y,'900 26px Segoe UI','#9fe8ff',6);txt(c,nm(r.savior.name,16),CX,y+42,'900 34px Segoe UI','#ffffff',7);y+=110;}
  txt(c,'Ai góp sức: +1 Tụ Khí Đan (bã đan) · linh thạch',CX,y+20,'800 22px Segoe UI','#fff3c8',5);c.restore();return;}
 const g=r.grade||1,col=GRADE_COL[g],py=H*.24;c.save();c.globalCompositeOperation='screen';glow(c,CX,py,300,col,.5+.3*pulse);for(let i=0;i<12;i++){const ang=i/12*TAU+t*.0006;c.globalAlpha=a*.35;c.strokeStyle=col;c.lineWidth=6;c.beginPath();c.moveTo(CX+Math.cos(ang)*70,py+Math.sin(ang)*70);c.lineTo(CX+Math.cos(ang)*(190+pulse*30),py+Math.sin(ang)*(190+pulse*30));c.stroke();}c.restore();c.globalAlpha=a;
 const pg=c.createRadialGradient(CX-18,py-18,6,CX,py,62);pg.addColorStop(0,'#ffffff');pg.addColorStop(.35,col);pg.addColorStop(1,'#2a1a08');c.fillStyle=pg;c.beginPath();c.arc(CX,py,58,0,TAU);c.fill();
 txt(c,'ĐAN THÀNH · '+GRADE[g],CX,py+110,'900 56px Segoe UI',col,10);
 if(r.trib)txt(c,r.trib==='held'?'⚡ vượt đan kiếp · đan viên mãn':'⚡ đan kiếp làm nứt đan · tụt 2 phẩm',CX,py+160,'800 24px Segoe UI',r.trib==='held'?'#bfe6ff':'#ffb0b0',6);
 const pp=r.perPerson;if(pp)txt(c,'Cả tông: +'+String(pp.pct).replace('.',',')+'% tu vi cần · '+pp.count+' '+pp.pill,CX,py+200,'800 24px Segoe UI','#ffffff',6);
 const top=r.top||[];let y=H*.5;top.slice(0,3).forEach((s,i)=>{if(i===0){txt(c,'⚗ ĐAN SƯ TÔNG MÔN · 24 giờ',CX,y,'900 24px Segoe UI','#ffe066',6);txt(c,nm(s.name,16),CX,y+44,'900 42px Segoe UI','#ffffff',8);if(s.qi)txt(c,'+'+fmtN(s.qi)+' tu vi',CX,y+86,'800 22px Segoe UI','#fff3c8',5);y+=140;}else{txt(c,(i+1)+'. '+nm(s.name,16)+(s.qi?' · +'+fmtN(s.qi)+' tu vi':''),CX,y,'800 26px Segoe UI','#ffffff',6);y+=46;}});
 if(r.savior)txt(c,'🌹 Băng Tâm Cứu Lô: '+nm(r.savior.name,16),CX,y+20,'800 24px Segoe UI','#9fe8ff',6);
 c.restore();}
