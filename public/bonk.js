import {majorEventActive} from './event-donations.js?v=event-donors-20261114';
import {drawGiftDonor} from './gift-donor.js';
// 10/11/2026: HỘI GÕ ĐẦU (server: bonk.mjs) — người gõ đi bộ từ ghế tới cạnh người bị gõ, vung búa gỗ gõ "BỐP",
// sao xoay quanh đầu, vài viên linh thạch bay sang người gõ, rồi đi bộ về ghế. Mỗi cú ~3 s (BONK_ANIM_MS).
// 4 kiểu chữ/màu (h.v) để các cú gõ không giống y hệt nhau. Tối đa MAX_ANIM cú vẽ cùng lúc.
export const BONK_ANIM_MS=3000;
const MAX_ANIM=6,TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=k=>k<.5?2*k*k:1-((-2*k+2)**2)/2;
function drawBonkImpact(c,x,y,age,scale,tier,col,variant){
 if(age<0||age>.85)return;
 const k=age/.85,n=8+tier*4;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';
 for(let i=0;i<3;i++){
  const p=clamp((age-i*.045)/.64);if(p<=0||p>=1)continue;
  const r=(12+p*(48+tier*24))*scale;c.globalAlpha=(1-p)*.72;
  c.strokeStyle=i%2?'#fff0b3':col;c.lineWidth=(4-i)*scale;
  c.beginPath();c.ellipse(x,y,r,r*.49,-.15+i*.14,0,TAU);c.stroke();
 }
 for(let i=0;i<n;i++){
  const a=i*TAU/n+variant*.61,d=(18+k*(43+i%4*14))*scale;
  c.globalAlpha=(1-k)*.86;c.fillStyle=i%3?col:'#fff5be';
  c.save();c.translate(x+Math.cos(a)*d,y+Math.sin(a)*d*.55+k*k*60);c.rotate(a+k);
  c.beginPath();c.moveTo(-3*scale,0);c.lineTo(9*scale,-2*scale);c.lineTo(3*scale,4*scale);c.closePath();c.fill();c.restore();
 }
 c.restore();
}
const WORDS=['BỐP!','CỐC!','PẶC!','BỘP!'],COLORS=['#ffd36b','#ff8a5c','#7ee0ff','#c9a2ff'];
// Mốc thời gian một cú (giây): đi tới → giơ búa → gõ (IMPACT) → đứng nhìn → đi về.
const WALK=1.0,IMPACT=1.25,BACK=1.6,END=BONK_ANIM_MS/1000;

export function syncBonk(scene,state){
 const b=state.bonkFest||null;scene.bonkFest=b;if(!b){scene.bonkHits=[];return;}
 const now=state.serverNow||Date.now();
 // âm mở hội (chỉ khi vừa mở, không phát lại lúc tải trang giữa chừng) / khép hội
 {const snd=scene.bonkSnd??={};if(b.active&&snd.start!==b.id){snd.start=b.id;if(b.endsAt-now>170000)scene.onBonkSound?.('start');}
  if(!b.active&&b.result&&snd.end!==b.id){snd.end=b.id;if(snd.start===b.id)scene.onBonkSound?.('end');}}
 const t=performance.now(),seen=scene.bonkSeen??=new Map();
 for(const h of b.hits||[])if(!seen.has(h.id))seen.set(h.id,t-Math.max(0,Math.min(BONK_ANIM_MS,now-h.at)));
 if(seen.size>80)for(const k of [...seen.keys()].slice(0,seen.size-80))seen.delete(k);
 scene.bonkHits=b.hits||[];
}
export const bonkOn=scene=>!!scene.bonkFest?.active;
function live(scene,t){const seen=scene.bonkSeen;if(!seen)return [];const out=[],busy=new Set();
 for(const h of [...(scene.bonkHits||[])].reverse()){const s=seen.get(h.id);if(s==null)continue;const age=(t-s)/1000;if(age<0||age>END||busy.has(h.a))continue;busy.add(h.a);out.push({h,age});if(out.length>=MAX_ANIM)break;}
 return out;}
// Đưa cả 2 người lên sân trong lúc diễn cú gõ.
export function bonkIds(scene,t){if(majorEventActive(scene.lastState))return [];const ids=[];for(const {h} of live(scene,t))ids.push(h.a,h.b);return ids;}

const headY=x=>x.y-66*(x.scale||1.4);
// Dời vị trí người gõ theo đường đi (chỉ trong khung hình này; ghế thật giữ nguyên).
export function applyBonkWalk(scene,t){
 if(majorEventActive(scene.lastState))return;
 const rows=live(scene,t);if(!rows.length||!scene.targets?.length)return;
 const byId=new Map(scene.targets.map(x=>[x.id,x]));
 for(const {h,age} of rows){const a=byId.get(h.a),b=byId.get(h.b);if(!a||!b||a===b)continue;
  const s=b.scale||1.4,side=a.x<=b.x?-1:1,gx=b.x+side*44*s,gy=b.y+2;
  let k=age<WALK?ease(age/WALK):age<BACK?1:1-ease(clamp((age-BACK)/(END-BACK-.2)));
  const hit=Math.max(0,1-Math.abs(age-IMPACT-.13)/.23);
  if(hit&&scene.motion!==false){const j=scene.targets.indexOf(b);if(j>=0)scene.targets[j]={...b,x:b.x-side*hit*(9+(h.h||0)*4),y:b.y-Math.sin(hit*Math.PI/2)*12};}
  const walking=age<WALK||age>BACK&&k>0,bob=walking?Math.abs(Math.sin(age*TAU*2.6))*5:0;
  const i=scene.targets.indexOf(a);scene.targets[i]={...a,x:a.x+(gx-a.x)*k,y:a.y+(gy-a.y)*k-bob,bonkFrom:[a.x,a.y]};
 }
 scene.targets.sort((p,q)=>p.y-q.y);
}

function txt(c,s,x,y,font,fill,stroke=5,strokeColor='#1b0d04'){c.font=font;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=stroke;c.strokeStyle=strokeColor;c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
function star(c,x,y,r,fill){c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=fill;c.fill();}
function stone(c,x,y,r){c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.75,y);c.lineTo(x,y+r);c.lineTo(x-r*.75,y);c.closePath();c.fillStyle='#7ff0d8';c.fill();c.strokeStyle='#0c4a44';c.lineWidth=1.2;c.stroke();c.fillStyle='rgba(255,255,255,.75)';c.fillRect(x-r*.2,y-r*.55,r*.3,r*.4);}
// Búa theo bậc (bonk.mjs HAMMERS): 0 Búa Gỗ · 1 Búa Đồng · 2 Ngọc Bích Chùy · 3 Lôi Thần Chùy. Xoay quanh tay (px,py) góc ang.
export const HAMMER_NAMES=['Búa Gỗ','Búa Đồng','Ngọc Bích Chùy','Lôi Thần Chùy'];
const HAMMER_SKIN=[
 {stick:'#a8743c',edge:'#3b2412',head:'#8a5a2b',band:'#e8c27a',shine:'#d9a35c',fx:'#ffd36b',size:1},
 {stick:'#7a3b1c',edge:'#3a1a06',head:'#c8873a',band:'#ffe08a',shine:'#ffd27a',fx:'#ffcc55',size:1.08},
 {stick:'#6b1f22',edge:'#0b3a2a',head:'#2fbf8a',band:'#ffd76a',shine:'#b8ffe0',fx:'#6dffc0',size:1.16},
 {stick:'#2a2350',edge:'#120c2a',head:'#4a3a9a',band:'#8fe3ff',shine:'#d8f4ff',fx:'#8fd8ff',size:1.28}];
function mallet(c,px,py,ang,s,tier=0,t=0){const K=HAMMER_SKIN[tier]||HAMMER_SKIN[0];s*=K.size;c.save();c.translate(px,py);c.rotate(ang);c.lineCap='round';
 c.strokeStyle=K.edge;c.lineWidth=6*s;c.beginPath();c.moveTo(0,0);c.lineTo(0,-30*s);c.stroke();c.strokeStyle=K.stick;c.lineWidth=3.6*s;c.beginPath();c.moveTo(0,0);c.lineTo(0,-30*s);c.stroke();
 if(tier>=2){c.fillStyle=K.band;c.fillRect(-2.4*s,-8*s,4.8*s,2.6*s);c.fillRect(-2.4*s,-18*s,4.8*s,2.6*s);}
 if(tier>=2){c.globalAlpha=.35+.15*Math.sin(t*.012);c.fillStyle=K.fx;c.beginPath();c.ellipse(0,-34.5*s,20*s,12*s,0,0,TAU);c.fill();c.globalAlpha=1;} /* hào quang đầu búa (không dùng shadowBlur cho đỡ lag) */
 c.fillStyle=K.head;c.strokeStyle=K.edge;c.lineWidth=2;c.beginPath();c.roundRect?.(-14*s,-42*s,28*s,15*s,5*s);c.fill();c.stroke();
 c.fillStyle=K.shine;c.fillRect(-12*s,-40*s,24*s,3.5*s);c.fillStyle=K.band;c.fillRect(-15*s,-41*s,3*s,13*s);c.fillRect(12*s,-41*s,3*s,13*s);
 if(tier===2){c.strokeStyle='#eafff4';c.lineWidth=1.2;c.beginPath();c.moveTo(-7*s,-34*s);c.lineTo(-3*s,-31*s);c.lineTo(1*s,-35*s);c.lineTo(5*s,-31*s);c.stroke();}
 if(tier===3){c.strokeStyle=K.fx;c.lineWidth=1.6;for(let i=0;i<3;i++){const a=(t*.02+i*2.1)%TAU,x0=Math.cos(a)*16*s,y0=-34.5*s+Math.sin(a)*9*s;c.beginPath();c.moveTo(x0,y0);c.lineTo(x0*1.25+(i-1)*3,y0-5*s);c.lineTo(x0*1.5,y0+2*s);c.stroke();}
  c.fillStyle='#ffffff';c.beginPath();c.moveTo(-3*s,-41*s);c.lineTo(2*s,-36*s);c.lineTo(-1*s,-35*s);c.lineTo(3*s,-29*s);c.lineTo(-3*s,-35*s);c.lineTo(0,-36*s);c.closePath();c.fill();}
 c.restore();}
function bolt(c,x0,y0,x1,y1,seed,col,w){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);const n=7;for(let i=1;i<n;i++){const u=i/n,j=(Math.sin(seed*13.7+i*5.1)*.5)*28;c.lineTo(x0+(x1-x0)*u+j,y0+(y1-y0)*u);}c.lineTo(x1,y1);c.stroke();}

export function drawBonk(scene,c,t){
 const b=scene.bonkFest;if(!b)return;const H=scene.height,nowMs=Date.now();
 if(majorEventActive(scene.lastState)){
  const rows=live(scene,t).slice(0,2);c.save();
  if(b.active)txt(c,'🔨 GÕ ĐẦU · go tên',450,H*.79,'700 17px Segoe UI','#ffe4a3',4);
  rows.forEach(({h,age},i)=>{const p=scene.playerIndex?.get(h.a),v=scene.playerIndex?.get(h.b),x=390+i*120,y=H*.84;
   drawGiftDonor(c,{name:p?.name,avatar:p?.avatar},x,y,{radius:22,color:'#ffdc88',width:112,caption:'gõ '+String(v?.name||'đạo hữu').slice(0,12)});
   mallet(c,x+32,y+5,Math.sin(age*7)*.8,1.1,h.h||0,t);drawBonkImpact(c,x,y,age-IMPACT,1,h.h||0,'#ffdc88',h.v||0);
  });c.restore();return;
 }
 c.save();
 // băng rôn trên cùng: tên sự kiện + đồng hồ / kết quả
 {const y=H*.165;if(b.active){const left=Math.max(0,Math.ceil((b.endsAt-nowMs)/1000));c.fillStyle='rgba(40,18,6,.78)';c.beginPath();c.roundRect?.(250,y-30,400,60,18);c.fill();c.strokeStyle='#ffcf6b';c.lineWidth=2.5;c.stroke();
   txt(c,'🔨 HỘI GÕ ĐẦU · '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0'),450,y-6,'900 26px Segoe UI','#ffe2a0',6);txt(c,'chat  go tên  → đi gõ đầu • bị gõ rơi vài linh thạch',450,y+19,'700 15px Segoe UI','#fff',4);}
  else if(b.result){const r=b.result;c.fillStyle='rgba(40,18,6,.85)';c.beginPath();c.roundRect?.(220,y-34,460,92,20);c.fill();c.strokeStyle='#ffcf6b';c.lineWidth=2.5;c.stroke();
   txt(c,'HỘI GÕ ĐẦU KHÉP LẠI',450,y-12,'900 24px Segoe UI','#ffe2a0',6);
   txt(c,r.hitter?'🔨 Thiết Thủ Vương: '+String(r.hitter.name).slice(0,16)+' ('+r.hitter.n+')':'Chưa ai gõ ai',450,y+16,'800 18px Segoe UI','#fff',4);
   if(r.victim)txt(c,'🤕 Đầu Sắt: '+String(r.victim.name).slice(0,16)+' ('+r.victim.n+')',450,y+40,'800 18px Segoe UI','#ffd0c0',4);}}
 const byId=new Map((scene.targets||[]).map(x=>[x.id,x]));
 const heard=scene.bonkHeard??=new Set();
 for(const {h,age} of live(scene,t)){const a=byId.get(h.a),v=byId.get(h.b);if(!v)continue;
  if(!heard.has(h.id)){heard.add(h.id);if(heard.size>80)heard.delete(heard.values().next().value);if(age<IMPACT-.1)scene.onBonkSound?.('hit',{variant:h.v,stones:h.s,delay:IMPACT-age,walk:!!a,hammer:h.h||0});}
  const s=v.scale||1.4,F=Math.max(1.5,s*1.9),hy=headY(v),col=COLORS[h.v%COLORS.length],side=a?(a.bonkFrom?.[0]??a.x)<=v.x?-1:1:-1;
  // búa: có người gõ trên sân thì cầm ở tay, không thì búa từ trời rơi xuống
  if(age>WALK-.15&&age<BACK){const k=clamp((age-(WALK-.15))/(IMPACT-(WALK-.15)));
   const L=40*F*.9,HIT=.78;
   if(a){const dir=-side,sw=age>=IMPACT?HIT:k<.6?-.7*(k/.6):-.7+(HIT+.7)*((k-.6)/.4);mallet(c,v.x-dir*Math.sin(HIT)*L,hy-2+Math.cos(HIT)*L,dir*sw,F*.9,h.h||0,t);} /* trục búa đặt sao cho lúc bổ xuống đầu búa đúng đỉnh đầu */
   else{const y0=hy-2+L-150+(age<IMPACT?k*k*150:150);mallet(c,v.x,y0,0,F*.9,h.h||0,t);}
   if((h.h||0)>0&&age<IMPACT)txt(c,(h.h===3?'⚡ ':h.h===2?'✦ ':'')+HAMMER_NAMES[h.h],(a?a.x:v.x),(a?headY(a):hy)-40*F,'900 17px Segoe UI',HAMMER_SKIN[h.h].fx,5);}
  if(age>=IMPACT){drawBonkImpact(c,v.x,hy,age-IMPACT,F*.55,h.h||0,col,h.v);const k=clamp((age-IMPACT)/(END-IMPACT)),fade=1-clamp((age-(END-.4))/.4);
   c.save();c.globalAlpha=fade;
   // chớp va chạm
   if(age<IMPACT+.25){const q=(age-IMPACT)/.25;c.strokeStyle=col;c.lineWidth=3;for(let i=0;i<8;i++){const ang=i*TAU/8+.2,r0=10*s+q*14*s,r1=r0+10*s;c.beginPath();c.moveTo(v.x+Math.cos(ang)*r0,hy-4*s+Math.sin(ang)*r0*.7);c.lineTo(v.x+Math.cos(ang)*r1,hy-4*s+Math.sin(ang)*r1*.7);c.stroke();}}
   // búa xịn: 1 vòng tia vàng · 2 sóng ngọc lan ra · 3 sét đánh từ trời xuống + chớp trắng
   {const tier=h.h||0,K=HAMMER_SKIN[tier];if(tier>=1&&age<IMPACT+.5){const q=(age-IMPACT)/.5;c.strokeStyle=K.fx;c.lineWidth=(4-q*3)*(tier>=2?1.4:1);c.beginPath();c.ellipse(v.x,hy,(12+q*40)*F*.5*(tier>=2?1.6:1),(5+q*16)*F*.5*(tier>=2?1.6:1),0,0,TAU);c.stroke();}
    if(tier===2&&age<IMPACT+.8){for(let i=0;i<8;i++){const a2=i*TAU/8+h.v,d=(age-IMPACT)*90*F*.5;c.fillStyle=i%2?'#b8ffe0':'#2fbf8a';c.beginPath();c.ellipse(v.x+Math.cos(a2)*d,hy+Math.sin(a2)*d*.45-(age-IMPACT)*20,4*F*.5,2*F*.5,a2,0,TAU);c.fill();}}
    if(tier===3&&age<IMPACT+.35){const q=(age-IMPACT)/.35;c.globalAlpha=fade*(1-q);bolt(c,v.x+20,0,v.x,hy-4,h.v+Math.floor(t/60),'#ffffff',4);bolt(c,v.x+20,0,v.x,hy-4,h.v+3+Math.floor(t/60),K.fx,2);c.fillStyle='rgba(220,240,255,.55)';c.beginPath();c.arc(v.x,hy,30*F*(.6+q),0,TAU);c.fill();c.globalAlpha=fade;}}
   // cục u + sao xoay quanh đầu
   c.fillStyle='#ffb3a0';c.beginPath();c.ellipse(v.x+2*F,hy-5*F-Math.min(1,k*6)*3*F,4*F*Math.min(1,k*6),3.2*F*Math.min(1,k*6),0,0,TAU);c.fill();
   for(let i=0;i<3;i++){const ang=age*5.5+i*TAU/3;star(c,v.x+Math.cos(ang)*13*F,hy-8*F+Math.sin(ang)*4*F,4.6*F,i%2?'#fff3b0':col);}
   // chữ BỐP + tên người gõ
   const pop=age<IMPACT+.15?.6+(age-IMPACT)/.15*.6:1.2-Math.min(.2,(age-IMPACT-.15)*.5);txt(c,WORDS[h.v%WORDS.length],v.x-side*24*F,hy-14*F-k*10,`900 ${Math.round(36*pop*(1+(h.h||0)*.12))}px Segoe UI`,(h.h||0)>0?HAMMER_SKIN[h.h].fx:col,7);
   if(!a)txt(c,String(h.an).slice(0,12)+' gõ',v.x,hy-60*F,'800 14px Segoe UI','#fff',4);
   // linh thạch bay từ đầu người bị gõ sang người gõ (hoặc tỏa ra nếu người gõ không trên sân)
   if(h.s>0){for(let i=0;i<h.s;i++){const d=clamp((age-IMPACT-.08*i)/1.1);if(d<=0||d>=1)continue;const tx=a?a.x:v.x+(i-1)*30,ty=a?headY(a)+10*s:hy+40*s;const x=v.x+(tx-v.x)*d,y=hy+(ty-hy)*d-Math.sin(d*Math.PI)*36*F;stone(c,x,y,5*F);}
    txt(c,'-'+h.s+' linh thạch',v.x+side*30*F,hy-6*F-k*16,`900 ${19+(h.h||0)*3}px Segoe UI`,'#9ff5e2',5,'#04231f');}
   c.restore();}
 }
 c.restore();
}
