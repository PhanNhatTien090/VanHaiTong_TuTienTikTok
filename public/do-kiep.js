// 20/11/2026 — BÁCH NHÂN ĐỘ KIẾP trên sân (server: do-kiep.mjs). Phong cách Thủy Mặc (mực + giấy dó + ấn son) khớp giao diện mới.
//  back : trời sẫm mực + KIẾP VÂN xoáy trên đỉnh (mây mực, chớp tím–vàng trong lòng mây, sáng dần lúc sắp giáng).
//  front: người bị nhắm = vòng son dưới chân + "⚡" trên đầu + đường ngắm từ mây; lúc giáng: tia sét + mực bắn + chữ kết quả;
//         khiên = bong bóng vàng; cháy xém = muội đen + khói; hóa tro = khói đặc + đống tro.
//  hud  : dải giấy trạng thái (đạo lôi n/9 · còn trụ) + màn PHẢN LÔI NGHỊCH THIÊN 1,8 s (quà lớn) vẽ theo tọa độ màn (không theo camera).
// Hiệu năng: tối đa 24 tia/lần, hạt ít, không shadowBlur; >50 người trên sân thì bỏ khói (chỉ giữ dấu hiệu chính).
import {paperBanner,inkSplash,INK,SEAL,PAPER} from './luan-hoi-ink.js?v=20261120b';
const TAU=Math.PI*2;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(k,a,b)=>clamp((k-a)/(b-a));
const nowOf=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const hashId=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
export function syncDoKiep(scene,state){scene.doKiep=state.doKiep||null;}
export const doKiepOn=scene=>!!scene.doKiep;
const CLOUD_Y=.09;
function targetsById(scene){const m=new Map();for(const a of scene.targets||[])m.set(a.id||a.player?.id,a);return m;}

function storm(c,H,t,glow,sec){const cy=H*CLOUD_Y;
 // trời sẫm
 const g=c.createLinearGradient(0,0,0,H*.6);g.addColorStop(0,'rgba(8,8,12,.72)');g.addColorStop(1,'rgba(8,8,12,0)');c.fillStyle=g;c.fillRect(-60,-60,1020,H*.6+60);
 // mây mực: các cụm tròn xám đen viền sáng nhẹ, quay quanh tâm xoáy
 c.save();for(let i=0;i<22;i++){const q=i/22*TAU+sec*.08*(i%2?1:-1),r=60+rnd(i)*360,x=450+Math.cos(q)*r,y=cy+Math.sin(q)*r*.22+rnd(i+5)*20,R=70+rnd(i+9)*90;
  const cg=c.createRadialGradient(x,y-R*.2,R*.1,x,y,R);cg.addColorStop(0,'rgba(70,72,88,.85)');cg.addColorStop(.7,'rgba(30,30,40,.8)');cg.addColorStop(1,'rgba(20,20,28,0)');c.fillStyle=cg;c.beginPath();c.ellipse(x,y,R,R*.55,0,0,TAU);c.fill();}
 // xoáy tâm
 c.lineCap='round';for(let k=0;k<4;k++){c.strokeStyle=`rgba(150,140,200,${.18+glow*.35})`;c.lineWidth=3-k*.5;c.beginPath();for(let i=0;i<=40;i++){const u=i/40,q=sec*1.2+k*1.6+u*7,r=10+u*170;c.lineTo(450+Math.cos(q)*r,cy+Math.sin(q)*r*.25);}c.stroke();}
 // chớp trong lòng mây
 const fl=(Math.sin(sec*7.3)+Math.sin(sec*11.1))>1.3-glow*1.2;if(fl){c.globalCompositeOperation='lighter';const fx=450+(rnd(Math.floor(sec*5))-.5)*600,fg=c.createRadialGradient(fx,cy,0,fx,cy,220);fg.addColorStop(0,`rgba(200,180,255,${.25+glow*.4})`);fg.addColorStop(1,'rgba(200,180,255,0)');c.fillStyle=fg;c.fillRect(fx-220,cy-220,440,440);}
 c.restore();}

function boltPath(x0,y0,x1,y1,seed){const pts=[[x0,y0]],n=14;for(let i=1;i<n;i++){const u=i/n;pts.push([x0+(x1-x0)*u+(rnd(seed+i)-.5)*90*(1-u*.5),y0+(y1-y0)*u+(rnd(seed+i*7)-.5)*14]);}pts.push([x1,y1]);return pts;}
const line=(c,pts)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));};
/** Tia sét mực: viền mực đậm + quầng tím + lõi trắng, có nhánh rẽ. */
function bolt(c,pts,a,w=1,seed=1){if(a<=.01)return;c.save();c.lineJoin='round';c.lineCap='round';
 c.globalAlpha=a*.85;c.strokeStyle=INK;c.lineWidth=16*w;line(c,pts);c.stroke();
 c.globalCompositeOperation='lighter';c.globalAlpha=a*.55;c.strokeStyle='#7f5cff';c.lineWidth=26*w;line(c,pts);c.stroke();
 c.globalAlpha=a;c.strokeStyle='#cbb8ff';c.lineWidth=8*w;line(c,pts);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=3.4*w;line(c,pts);c.stroke();
 for(let k=0;k<3;k++){const i=3+Math.floor(rnd(seed+k*5)*(pts.length-6)),[bx,by]=pts[i],dir=rnd(seed+k)>.5?1:-1,br=[[bx,by]];for(let j=1;j<5;j++)br.push([bx+dir*j*18+(rnd(seed+k*9+j)-.5)*14,by+j*22]);
  c.globalAlpha=a*.7;c.strokeStyle='#cbb8ff';c.lineWidth=4*w;line(c,br);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=1.6*w;line(c,br);c.stroke();}
 c.restore();}
function word(c,s,x,y,size,fill,a){if(a<=.01)return;c.save();c.globalAlpha=a;c.font='900 '+size+'px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=size*.22;c.strokeStyle=INK;c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);c.restore();}

export function drawDoKiep(scene,c,t,H,layer){const k=scene.doKiep;if(!k)return;const now=nowOf(scene,t),sec=(now-k.startedAt)/1000;
 const v=(k.wv||[]).at(-1),warn=v&&!v.done&&now>=v.warnAt&&now<v.strikeAt,glow=warn?seg(now,v.warnAt,v.strikeAt):0;
 if(layer==='back'){if(k.phase!=='cancelled')storm(c,H,t,glow,sec);return;}
 const byId=targetsById(scene),crowd=(scene.targets||[]).length>50,cy=H*CLOUD_Y;
 // trạng thái từng người trên sân
 for(const [id,a] of byId){const st=k.ppl?.[id];if(!st)continue;const [hp,sh]=st,s=a.scale||1,x=a.x,feet=a.y,head=feet-s*62;
  if(hp<=0){c.save();c.globalCompositeOperation='multiply';const ag=c.createRadialGradient(x,feet-s*30,s*6,x,feet-s*30,s*34);ag.addColorStop(0,'rgba(60,52,46,.6)');ag.addColorStop(1,'rgba(60,52,46,0)');c.fillStyle=ag;c.fillRect(x-s*34,feet-s*64,s*68,s*68);c.restore();
   c.fillStyle='rgba(70,64,58,.9)';c.beginPath();c.ellipse(x,feet+s*2,s*16,s*4,0,0,TAU);c.fill();
   if(!crowd)for(let i=0;i<5;i++){const u=((t*.0006+i/5+hashId(id)%7/7)%1),r=s*(5+u*10);const sg=c.createRadialGradient(x,feet-s*40-u*s*50,0,x,feet-s*40-u*s*50,r);sg.addColorStop(0,'rgba(30,28,26,.55)');sg.addColorStop(1,'rgba(30,28,26,0)');c.globalAlpha=1-u;c.fillStyle=sg;c.fillRect(x-r,feet-s*40-u*s*50-r,r*2,r*2);}c.globalAlpha=1;
   word(c,'☠',x,head-s*14,Math.round(s*17),'#e8e1d6',.95);continue;}
  if(hp===1){word(c,'♥',x,head-s*14,Math.round(s*15),'#ff5a5a',.95);c.save();c.globalCompositeOperation='multiply';const bg2=c.createRadialGradient(x,feet-s*32,s*4,x,feet-s*32,s*30);bg2.addColorStop(0,'rgba(110,96,86,.45)');bg2.addColorStop(1,'rgba(110,96,86,0)');c.fillStyle=bg2;c.fillRect(x-s*30,feet-s*62,s*60,s*60);c.restore();
   if(!crowd)for(let i=0;i<3;i++){const u=((t*.0007+i/3+hashId(id)%5/5)%1),r=s*(3+u*7),yy=head-u*s*30;const sg=c.createRadialGradient(x,yy,0,x,yy,r);sg.addColorStop(0,'rgba(60,58,56,.5)');sg.addColorStop(1,'rgba(60,58,56,0)');c.globalAlpha=1-u;c.fillStyle=sg;c.fillRect(x-r,yy-r,r*2,r*2);}c.globalAlpha=1;}
  if(sh>0){c.save();c.globalCompositeOperation='lighter';const R=s*30,bg=c.createRadialGradient(x,feet-s*30,R*.5,x,feet-s*30,R*1.1);bg.addColorStop(0,'rgba(255,214,120,0)');bg.addColorStop(.8,'rgba(255,214,120,.12)');bg.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=bg;c.beginPath();c.ellipse(x,feet-s*30,R,R*1.25,0,0,TAU);c.fill();
   c.strokeStyle='rgba(255,224,150,.75)';c.lineWidth=1.6;c.setLineDash([s*6,s*4]);c.lineDashOffset=-t*.02;c.beginPath();c.ellipse(x,feet-s*30,R,R*1.25,0,0,TAU);c.stroke();c.setLineDash([]);
   if(sh>1){c.beginPath();c.ellipse(x,feet-s*30,R*1.12,R*1.38,0,0,TAU);c.stroke();}c.restore();}}
 // đạo lôi đang nhắm: vòng son + ⚡ + đường ngắm
 if(warn){for(const id of v.targets){const a=byId.get(id);if(!a)continue;const s=a.scale||1,x=a.x,feet=a.y,head=feet-s*66,pul=.6+.4*Math.sin(t*.02);
   c.save();c.translate(x,feet+s*2);c.scale(1,.32);c.strokeStyle=SEAL;c.globalAlpha=.9;c.lineWidth=s*2.6;c.beginPath();c.arc(0,0,s*24*(1.15-glow*.25),0,TAU);c.stroke();c.restore();
   c.save();c.globalAlpha=.25+glow*.5;c.strokeStyle='#d8c8ff';c.lineWidth=1.4;c.setLineDash([8,10]);c.beginPath();c.moveTo(x+(hashId(id)%60-30),cy+20);c.lineTo(x,head);c.stroke();c.restore();
   c.save();c.globalCompositeOperation='lighter';const pg=c.createLinearGradient(x-s*14,0,x+s*14,0);pg.addColorStop(0,'rgba(255,60,40,0)');pg.addColorStop(.5,`rgba(255,80,60,${.12+glow*.3})`);pg.addColorStop(1,'rgba(255,60,40,0)');c.fillStyle=pg;c.fillRect(x-s*14,cy,s*28,feet-cy);c.restore();
   word(c,'⚡',x,head-s*22,Math.round(s*26*(1+.12*pul)),'#ffe27a',1);}}
 // âm: sấm mỗi lần giáng, nổ lớn khi Phản Lôi (mỗi sự kiện đúng 1 lần — nhớ theo khóa)
 {const snd=scene.kiepSnd??=new Set();for(const w of k.wv||[])if(w.done&&now-w.strikeAt<1500&&!snd.has(k.id+':'+w.n)){snd.add(k.id+':'+w.n);scene.onKiepSound?.('strike');}
  for(const r of k.reversals||[])if(now-r.at<1500&&!snd.has(k.id+':r'+r.at)){snd.add(k.id+':r'+r.at);scene.onKiepSound?.('reverse');}if(snd.size>60)snd.clear();}
 // giáng: tia sét + kết quả (0,9 s)
 // tính tuổi tia sét từ lúc OVERLAY thấy kết quả (gói tin tới trễ ~0,5 s — tính theo giờ server thì tia gần như không kịp hiện)
 const seen=scene.kiepSeenAt??=new Map();
 for(const w of k.wv||[]){if(!w.done)continue;const key=k.id+':'+w.n;if(!seen.has(key)){seen.set(key,now-Math.max(0,Math.min(250,now-w.strikeAt)));if(seen.size>40)seen.delete(seen.keys().next().value);}
  const age=(now-seen.get(key))/1000;if(age<0||age>1.6)continue;let drawn=0;
  for(const id of w.targets){const a=byId.get(id);if(!a)continue;const s=a.scale||1,x=a.x,feet=a.y,res=w.res?.[id]||'burn',seed=hashId(id)+w.n*97;
   if(age<.62&&drawn<30){drawn++;bolt(c,boltPath(x+(seed%80-40),cy+10,x,res==='shield'?feet-s*60:feet-s*20,seed),age<.12?1:1-(age-.12)/.5,res==='ash'?1.3:1,seed);}
   if(res==='shield'){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=`rgba(255,226,150,${1-age/1.3})`;c.lineWidth=3;c.beginPath();c.ellipse(x,feet-s*30,s*30*(1+age),s*38*(1+age),0,0,TAU);c.stroke();c.restore();word(c,'ĐỠ!',x,feet-s*84-age*24,Math.round(s*20),'#ffe08a',1-age/1.3);}
   else if(res==='dodge')word(c,'NÉ!',x+age*30,feet-s*84-age*24,Math.round(s*20),'#bff3ff',1-age/1.3);
   else if(res==='burn'||res==='ash'){inkSplash(c,x,feet-s*20,s*(res==='ash'?60:40),Math.min(.99,age*1.5),seed,1);word(c,res==='ash'?'HÓA TRO ☠':'−1 MẠNG',x,feet-s*88-age*20,Math.round(s*18),res==='ash'?'#e8e1d6':'#ff6a5a',1-age/1.3);}}
  if(age<.18&&drawn){c.save();c.fillStyle='rgba(235,228,255,.28)';c.fillRect(-60,-60,1020,H+120);c.restore();}}
}

/** Lớp HUD (tọa độ màn). Gọi sau mọi thứ. */
export function drawDoKiepHud(scene,c,t,H){const k=scene.doKiep;if(!k)return;const now=nowOf(scene,t);c.save();if(scene.screenT)c.setTransform(scene.screenT);
 try{
  const a=Math.min(1,(now-k.startedAt)/600);let title='BÁCH NHÂN ĐỘ KIẾP',sub='';
  if(k.phase==='registration')sub='Kiếp vân đang tụ · '+Math.max(0,Math.ceil((k.regEndsAt-now)/1000))+' giây nữa sét giáng';
  else if(k.phase==='running')sub='Đạo lôi '+Math.max(1,k.wave)+'/'+k.waves+' · còn trụ '+k.alive+'/'+k.total+' đạo hữu';
  else if(k.result){title=k.result.survivors?'ĐỘ KIẾP THÀNH CÔNG':'ĐỘ KIẾP THẤT BẠI';sub=k.result.survivors+'/'+k.result.total+' trụ qua thiên lôi · nhận danh hiệu Độ Kiếp Tán Tiên'+(k.result.mvp?' · Hộ Đạo: '+k.result.mvp.name:'');}
  if(k.phase!=='cancelled')paperBanner(c,title,sub,450,H*.2,36,a,Math.min(1,(now-k.startedAt)/700),11);
  // LUẬT (lúc ghi danh): thẻ giấy giữa màn — người xem hiểu ngay bị sét đánh thì sao
  if(k.phase==='registration'){const u=Math.min(1,(now-k.startedAt)/900);guide(c,H,u,[['⚡','Lão phu GỌI TÊN ai → người đó gõ ne để NÉ (50%)'],['♥','Mỗi người 3 mạng · trúng sét mất 1 mạng'],['☠','Mất cả 3 mạng → HÓA TRO, không nhận thưởng'],['✦','Trụ đến cuối → tu vi + danh hiệu Độ Kiếp Tán Tiên'],['🛡','Tặng quà → khiên che mình và đồng môn']]);}
  // ĐANG NHẮM: cuộn đỏ gọi tên + đếm ngược
  const v=(k.wv||[]).at(-1);if(k.phase==='running'&&v&&!v.done&&now>=v.warnAt){const left=Math.max(0,Math.ceil((v.strikeAt-now)/1000)),names=(v.names||[]).filter(Boolean),more=v.targets.length-names.length,final=v.n>=k.waves;
   callout(c,H,final?'⚡ TỬ TIÊU THẦN LÔI · CẢ SÂN BỊ NHẮM':'⚡ SÉT NHẮM: '+names.map(n=>String(n).slice(0,14)).join(' · ')+(more>0?' +'+more:''),'GÕ  ne  ĐỂ NÉ · '+left+' giây',Math.min(1,(now-v.warnAt)/300));}
  // KẾT QUẢ đạo vừa giáng (3,5 s)
  const L=k.last;if(L&&now-L.at<3500&&k.phase!=='cancelled'){const parts=[];const nm=a=>a.slice(0,2).map(n=>String(n).slice(0,12)).join(', ')+(a.length>2?' +'+(a.length-2):'');
   if(L.dodge.length)parts.push('NÉ ĐƯỢC: '+nm(L.dodge));if(L.shield.length)parts.push('KHIÊN ĐỠ: '+nm(L.shield));if(L.burn.length)parts.push('−1 MẠNG: '+nm(L.burn));if(L.ash.length)parts.push('HÓA TRO: '+nm(L.ash));
   if(parts.length)resultStrip(c,H,parts,Math.min(1,(now-L.at)/250)*Math.min(1,(3500-(now-L.at))/400));}
  // PHẢN LÔI NGHỊCH THIÊN: 1,8 s — giấy lóe + tia sét đánh NGƯỢC lên mây + ấn son tên người
  const rv=(k.reversals||[]).filter(r=>now>=r.at&&now<r.at+1800).at(-1);
  if(rv){const u=(now-rv.at)/1800,fade=u<.8?1:1-(u-.8)/.2;
   if(u<.12){c.fillStyle=PAPER;c.globalAlpha=.85*(1-u/.12);c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
   const seed=hashId(rv.id);for(let i=0;i<3;i++){const x0=450+(i-1)*170,y0=H*.72;bolt(c,boltPath(x0,y0,450+(rnd(seed+i)-.5)*120,H*CLOUD_Y+20,seed+i*13),fade*(u<.6?1:.55),1.5,seed+i);}
   inkSplash(c,450,H*CLOUD_Y+30,300,Math.min(.99,u*1.4),seed,fade*.8);
   paperBanner(c,'PHẢN LÔI NGHỊCH THIÊN',String(rv.name||'').slice(0,22)+' · che chở cả tông',450,H*.42,44,fade,Math.min(1,u*3),seed%50);}
 }finally{c.restore();}}

function guide(c,H,a,rows){const W=640,rh=46,h=rows.length*rh+70,x=450-W/2,y=H*.3;c.save();c.globalAlpha=a;c.fillStyle='rgba(243,234,216,.96)';c.fillRect(x,y,W,h);c.strokeStyle='#1b1813';c.lineWidth=2;c.strokeRect(x+6,y+6,W-12,h-12);
 c.font='900 30px "Noto Serif","Times New Roman",serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#b3261e';c.fillText('LUẬT ĐỘ KIẾP',450,y+36);
 rows.forEach(([ic,t],i)=>{const yy=y+78+i*rh;c.font='900 26px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.fillStyle='#b3261e';c.fillText(ic,x+40,yy);c.textAlign='left';c.fillStyle='#1b1813';c.font='800 22px "Segoe UI",Arial,sans-serif';c.fillText(t,x+70,yy,W-90);});c.restore();}
function callout(c,H,line1,line2,a){const W=760,h=104,x=450-W/2,y=H*.27;c.save();c.globalAlpha=a;c.fillStyle='rgba(140,18,14,.93)';c.fillRect(x,y,W,h);c.strokeStyle='#ffe1a8';c.lineWidth=2;c.strokeRect(x+5,y+5,W-10,h-10);
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff4dc';c.font='900 28px "Segoe UI",Arial,sans-serif';c.fillText(line1,450,y+36,W-30);c.fillStyle='#ffe27a';c.font='900 30px "Segoe UI",Arial,sans-serif';c.fillText(line2,450,y+76,W-30);c.restore();}
function resultStrip(c,H,parts,a){const W=760,h=parts.length*34+20,x=450-W/2,y=H*.4;c.save();c.globalAlpha=a;c.fillStyle='rgba(20,17,14,.82)';c.fillRect(x,y,W,h);c.textAlign='center';c.textBaseline='middle';c.font='900 23px "Segoe UI",Arial,sans-serif';
 parts.forEach((p,i)=>{c.fillStyle=p.startsWith('NÉ')?'#bff3ff':p.startsWith('KHIÊN')?'#ffe08a':p.startsWith('HÓA')?'#e8e1d6':'#ff8a7a';c.fillText(p,450,y+27+i*34,W-30);});c.restore();}
