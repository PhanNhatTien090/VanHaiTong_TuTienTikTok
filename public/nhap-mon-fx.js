// 19/11/2026 (chủ game: "90 s hơi lâu, mục tiêu ~30 người chơi cùng lúc đẹp"): NHẬP MÔN tại chỗ — người mới bình luận lần đầu
// được hiệu ứng NGAY ở ghế của mình, không xếp hàng. Màn toàn cảnh vẫn ≤1/60 s (app.js).
// 20/11 v2 (chủ game: "cải tiến hiệu ứng đột phá, bắt đầu từ Luyện Khí"): đây chính là lúc người thật lên Luyện Khí, nên kể
// bản thu nhỏ của màn Luyện Khí: mực loang dưới chân → cột khí ngọc bốc lên → ba hạt linh khí xoáy vào đan điền →
// thân sáng bừng + vòng sóng → thẻ "NHẬP MÔN" + tên bật lên (thẻ hẹp để sân đông ít đè), tự né thẻ bên cạnh (trước đây đè nhau thành "ẬP MÔN").
// Nhẹ: cột sáng, quầng, hạt đều là bitmap vẽ sẵn (drawImage), không tạo gradient mỗi khung; >50 người chỉ còn vòng + thẻ.
import {makeSurface} from './performance.js';
export const NHAP_MON_MS=3400;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),win=(k,a,b)=>clamp((k-a)/(b-a));
const back=x=>{x=clamp(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
export function addNhapMon(scene,e){(scene.nhapMon??=[]).push({user:e.user,name:String(e.name||'').slice(0,18),start:null,seed:hash(e.user)});if(scene.nhapMon.length>12)scene.nhapMon.shift();}
function hash(s){let h=2166136261;for(const ch of String(s||''))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}

const art=new Map();
function sprite(key,w,h,draw){if(art.has(key))return art.get(key);const s=makeSurface(w,h);if(s)draw(s.getContext('2d'),w,h);art.set(key,s);return s;}
// Cột khí ngọc: lõi trắng ngà, viền ngọc, mờ dần hai đầu.
const pillarArt=()=>sprite('pillar',64,256,(x,w,h)=>{
 const gx=x.createLinearGradient(0,0,w,0);gx.addColorStop(0,'rgba(127,220,198,0)');gx.addColorStop(.3,'rgba(127,220,198,.55)');gx.addColorStop(.5,'rgba(255,250,225,1)');gx.addColorStop(.7,'rgba(127,220,198,.55)');gx.addColorStop(1,'rgba(127,220,198,0)');
 x.fillStyle=gx;x.fillRect(0,0,w,h);x.globalCompositeOperation='destination-in';
 const gy=x.createLinearGradient(0,0,0,h);gy.addColorStop(0,'rgba(0,0,0,0)');gy.addColorStop(.35,'rgba(0,0,0,.75)');gy.addColorStop(.85,'rgba(0,0,0,1)');gy.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gy;x.fillRect(0,0,w,h);});
// Quầng sáng tròn (thân sáng bừng / hạt khí).
const glowArt=(tone)=>sprite('glow:'+tone,128,128,(x,w)=>{const r=w/2,g=x.createRadialGradient(r,r,0,r,r,r);
 if(tone==='gold'){g.addColorStop(0,'rgba(255,248,220,1)');g.addColorStop(.25,'rgba(255,226,150,.85)');g.addColorStop(.6,'rgba(244,201,106,.3)');g.addColorStop(1,'rgba(244,201,106,0)');}
 else{g.addColorStop(0,'rgba(240,255,250,1)');g.addColorStop(.22,'rgba(168,240,214,.95)');g.addColorStop(.55,'rgba(127,220,198,.35)');g.addColorStop(1,'rgba(127,220,198,0)');}
 x.fillStyle=g;x.fillRect(0,0,w,w);});
// Vệt mực loang dưới chân (vẽ sẵn, giãn theo thời gian).
const inkArt=()=>sprite('ink',256,256,(x,w)=>{const r=w/2,g=x.createRadialGradient(r,r,r*.35,r,r,r);g.addColorStop(0,'rgba(27,24,19,0)');g.addColorStop(.55,'rgba(27,24,19,.55)');g.addColorStop(.8,'rgba(27,24,19,.25)');g.addColorStop(1,'rgba(27,24,19,0)');x.fillStyle=g;x.fillRect(0,0,w,w);});

const CARD_T=1.35;
function cardSize(c,e){
 if(e.card)return e.card;const T=CARD_T;c.save();
 c.font='900 '+Math.round(10.5*T)+'px "Noto Serif",Georgia,serif';const w1=c.measureText('NHẬP MÔN').width;
 c.font='900 '+Math.round(13*T)+'px "Noto Serif",Georgia,serif';const w2=c.measureText(e.name||'Đạo hữu').width;c.restore();
 e.card={w:Math.max(w1,w2)+22*T,h:36*T};return e.card;
}
// Thẻ cạnh nhau (ghế sát) xếp tầng so le để không đè chữ.
function layoutCards(items){
 const placed=[];for(const it of [...items].sort((a,b)=>a.x-b.x)){let lv=0;
  while(placed.some(o=>o.lv===lv&&Math.abs(o.x-it.x)<(o.w+it.w)/2+6&&Math.abs(o.y-it.y)<it.h*1.6))lv++;
  it.lv=lv;placed.push(it);}
}
export function drawNhapMon(scene,c,t){
 const list=scene.nhapMon;if(!list?.length)return;
 const lite=(scene.realPlayers?.length||0)>50||scene.motion===false; /* luật 08/11: >50 người bỏ hiệu ứng, chỉ giữ thẻ */
 const live=[];
 for(let i=list.length-1;i>=0;i--){const e=list[i],p=scene.targets?.find(x=>x.id===e.user);e.born??=t;
  if(!p){if(t-e.born>8000)list.splice(i,1);continue;} // chờ nhân vật lên sân (tối đa 8 s)
  e.seed??=hash(e.user);e.start??=t;const k=(t-e.start)/NHAP_MON_MS;if(k>=1){list.splice(i,1);continue;}live.push({e,p,k});}
 if(!live.length)return;
 const pillar=pillarArt(),jade=glowArt('jade'),gold=glowArt('gold'),ink=inkArt();
 for(const {e,p,k} of live){
  const s0=(p.scale||1.4)/1.4,s=Math.max(.68,s0),x=p.x,feet=p.y+16*s0,chest=p.y-42*s0,fade=Math.min(1,k/.06,(1-k)/.16),dir=e.seed&1?1:-1,phase=(e.seed%360)/360*TAU;
  c.save();c.globalAlpha*=fade;
  // 1) Mực loang + vòng vàng + vòng ngọc dưới chân
  const r=ease(k/.45);c.save();c.translate(x,feet);c.scale(1,.32);
  if(ink){const R=(40+120*r)*s;c.globalAlpha*=.9*(1-win(k,.55,1));c.drawImage(ink,-R,-R,R*2,R*2);}
  c.globalAlpha=fade;c.strokeStyle='rgba(244,201,106,'+(.95*(1-r*.55))+')';c.lineWidth=3.2*s;c.beginPath();c.arc(0,0,(22+64*r)*s,0,TAU);c.stroke();
  const r2=ease(win(k,.42,.8));if(r2>0){c.strokeStyle='rgba(168,240,214,'+(.9*(1-r2))+')';c.lineWidth=5*s*(1-r2)+1.5;c.beginPath();c.arc(0,0,(30+110*r2)*s,0,TAU);c.stroke();}
  c.restore();
  c.save();c.globalCompositeOperation='lighter';
  // 2) Cột khí ngọc bốc lên (mạnh nhất lúc khí nhập thể)
  if(pillar&&!lite){const rise=ease(win(k,.04,.3)),inten=Math.min(1,k/.12)*(1-win(k,.62,.95)),h=260*s*rise,w=(26+16*win(k,.4,.55)*(1-win(k,.55,.8)))*s;
   c.globalAlpha=fade*.85*inten;c.drawImage(pillar,x-w/2,feet-h,w,h);}
  // 3) Ba hạt linh khí xoáy vào đan điền (k .06 → .45), kèm đuôi
  if(jade&&!lite){for(let i=0;i<3;i++){for(let tail=3;tail>=0;tail--){const kk=k-tail*.018,u=win(kk,.06,.45);if(u<=0||u>=1)continue;
    const a=phase+i*TAU/3+dir*u*TAU*1.25,R=(78-70*ease(u))*s,ox=x+Math.cos(a)*R,oy=chest-18*s*(1-u)+Math.sin(a)*R*.45,sz=(30-tail*6)*s*(1-.35*u);
    c.globalAlpha=fade*(tail?.35-tail*.08:1);c.drawImage(jade,ox-sz/2,oy-sz/2,sz,sz);}}}
  // 4) Thân sáng bừng khi khí nhập thể + sóng sáng
  const flash=win(k,.43,.5)*(1-win(k,.5,.76));
  if(gold&&flash>0){const R=(52+22*flash)*s;c.globalAlpha=fade*flash*.7;c.drawImage(gold,x-R,chest-R,R*2,R*2);if(jade){const R2=96*s;c.globalAlpha=fade*flash*.32;c.drawImage(jade,x-R2,chest-R2*.9,R2*2,R2*1.8);}} /* sáng vừa đủ, không phủ trắng mặt */
  // 5) Đốm khí bay lên sau khi nhập môn
  if(jade&&!lite&&k>.45){for(let i=0;i<7;i++){const u=win(k,.45+i*.03,.95),hh=(e.seed>>>(i*3))%40;if(u<=0||u>=1)continue;const px=x+((i-3)*13+Math.sin(u*6+i)*6)*s,py=chest+20*s-u*(120+hh)*s,sz=(9+(i%3)*3)*s;c.globalAlpha=fade*(1-u);c.drawImage(jade,px-sz/2,py-sz/2,sz,sz);}}
  c.restore();c.restore();
 }
 // 6) Thẻ NHẬP MÔN — bật lên sau khi khí nhập thể, xếp so le khi ghế sát nhau
 const cards=[];for(const {e,p,k} of live){if(k<.4)continue;const s0=(p.scale||1.4)/1.4,sz=cardSize(c,e);cards.push({e,k,x:p.x,y:p.y-100*s0-14,w:sz.w,h:sz.h});}
 layoutCards(cards);const T=CARD_T;
 for(const it of cards){const {e,k}=it,pop=back(win(k,.4,.56)),fade=Math.min(1,(1-k)/.16),bw=it.w,bh=it.h,ty=it.y-it.lv*(bh+6)-10*ease(win(k,.4,.6));
  c.save();c.globalAlpha*=fade;c.translate(it.x,ty-bh/2);c.scale(pop,pop);
  c.shadowColor='rgba(244,201,106,.85)';c.shadowBlur=14*T*(1-win(k,.55,.9))+4;c.fillStyle='rgba(243,234,216,.97)';c.fillRect(-bw/2,-bh/2,bw,bh);c.shadowBlur=0;
  c.strokeStyle='#b3261e';c.lineWidth=1.6*T;c.strokeRect(-bw/2+2*T,-bh/2+2*T,bw-4*T,bh-4*T);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle='#b3261e';c.font='900 '+Math.round(10.5*T)+'px "Noto Serif",Georgia,serif';c.fillText('NHẬP MÔN',0,-bh/2+11.5*T);
  c.fillStyle='#1b1813';c.font='900 '+Math.round(13*T)+'px "Noto Serif",Georgia,serif';c.fillText(e.name||'Đạo hữu',0,-bh/2+25.5*T);
  c.restore();}
}
