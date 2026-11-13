// 10/11/2026: BÍ CẢNH MÊ CUNG — vẽ mê cung chung + chấm sáng mỗi người (server: maze.mjs).
// Tường dựng sẵn vào 1 lớp cache theo mã mê cung (vẽ lại chỉ khi đổi mê cung/cỡ màn) → 300 người vẫn nhẹ.
// Tên: chỉ hiện top dẫn đầu + người vừa đi/vừa tặng quà (≤22 tên) để chữ không chồng nhau.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const serverNow=(scene,t)=>(scene.mazeServerNow||Date.now())+Math.min(2000,t-(scene.mazeReceivedAt||t));
export function syncMaze(scene,state){const e=state.maze||null;if(e?.id!==scene.mazeId){scene.mazeId=e?.id;scene.mazeRunPos=new Map();}scene.mazeStatus=e?.active?e:null;scene.mazeReceivedAt=performance.now();scene.mazeServerNow=state.serverNow;
 if(typeof document!=='undefined')document.body?.classList?.toggle('maze-on',!!scene.mazeStatus);}
export const mazeOn=scene=>!!scene.mazeStatus;
const hue=id=>{let n=0;for(const ch of String(id))n=(Math.imul(n,31)+ch.charCodeAt(0))|0;return Math.abs(n)%360;};
export function mazeLayout(H,cols,rows){const top=H*.155,bottom=H*.845,cell=Math.min(840/cols,(bottom-top)/rows),w=cols*cell,h=rows*cell;return {cell,ox:450-w/2,oy:top+(bottom-top-h)/2,w,h};}
const cellXY=(L,x,y)=>[L.ox+(x+.5)*L.cell,L.oy+(y+.5)*L.cell];
function txt(c,s,x,y,font,fill,stroke=5,align='center'){c.font=font;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=stroke;c.strokeStyle='#04060d';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
function pill(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const wallE=(e,x,y)=>x>=e.cols-1||(Number(e.cells[y*e.cols+x])&1)!==0,wallS=(e,x,y)=>y>=e.rows-1||(Number(e.cells[y*e.cols+x])&2)!==0;
// Lớp tường + nền đá (cache).
function wallLayer(scene,e,H){const key=e.id+':'+Math.round(H)+':'+e.cells;/* tường bị phá → vẽ lại */if(scene.mazeWalls?.key===key)return scene.mazeWalls;
 const L=mazeLayout(H,e.cols,e.rows),pad=24,s=makeSurface(Math.ceil(L.w+pad*2),Math.ceil(L.h+pad*2));if(!s)return null;const c=s.getContext('2d'),o=pad;
 // nền: phiến đá ngọc tối, ô so le sáng/tối nhẹ
 c.fillStyle='#0b1a1f';c.fillRect(o,o,L.w,L.h);
 for(let y=0;y<e.rows;y++)for(let x=0;x<e.cols;x++){c.fillStyle=(x+y)%2?'rgba(60,140,130,.10)':'rgba(30,80,90,.10)';c.fillRect(o+x*L.cell,o+y*L.cell,L.cell,L.cell);}
 const seg=[];const add=(x0,y0,x1,y1)=>seg.push([o+x0*L.cell,o+y0*L.cell,o+x1*L.cell,o+y1*L.cell]);
 for(let x=0;x<e.cols;x++){if(x!==e.exit.x)add(x,0,x+1,0);}add(0,0,0,e.rows);
 for(let y=0;y<e.rows;y++)for(let x=0;x<e.cols;x++){if(wallE(e,x,y))add(x+1,y,x+1,y+1);if(wallS(e,x,y))add(x,y+1,x+1,y+1);}
 const stroke=(w,col)=>{c.lineWidth=w;c.strokeStyle=col;c.lineCap='round';c.beginPath();for(const [a,b,d,f] of seg){c.moveTo(a,b);c.lineTo(d,f);}c.stroke();};
 stroke(L.cell*.30,'rgba(80,220,200,.10)');stroke(L.cell*.17,'#0a0f14');stroke(L.cell*.13,'#3d5a5c');stroke(L.cell*.05,'#8ff0dc');
 scene.mazeWalls={key,surface:s,pad,L};return scene.mazeWalls;}
function glow(c,x,y,r,col,a){if(a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',String(a)));g.addColorStop(1,col.replace('A','0'));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
// Vị trí hiển thị mượt: mỗi lần server đổi ô → trượt 180 ms (dịch chuyển do quà: 650 ms + vệt sáng).
function displayPos(scene,r,L,tt){const st=scene.mazeRunPos??=new Map(),[tx,ty]=cellXY(L,r.x,r.y);let p=st.get(r.id);
 if(!p){p={x:tx,y:ty,fx:tx,fy:ty,tx,ty,t0:tt,dur:1};st.set(r.id,p);}
 if(p.tx!==tx||p.ty!==ty){p.fx=p.x;p.fy=p.y;p.tx=tx;p.ty=ty;p.t0=tt;p.dur=Math.hypot(tx-p.x,ty-p.y)>L.cell*1.5?650:180;}
 const k=clamp((tt-p.t0)/p.dur),ease=1-(1-k)**3;p.x=p.fx+(p.tx-p.fx)*ease;p.y=p.fy+(p.ty-p.fy)*ease;p.moving=k<1;p.seen=tt;return p;}
export function drawMaze(scene,c,t,layer){
 const e=scene.mazeStatus;if(!e?.cells)return;const H=scene.height,now=serverNow(scene,t),L=mazeLayout(H,e.cols,e.rows);
 if(layer==='back'){
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#04101a');bg.addColorStop(.5,'#071c22');bg.addColorStop(1,'#03080d');c.fillStyle=bg;c.fillRect(-20,-20,940,H+40);
  // sương bí cảnh trôi chậm
  if(scene.motion!==false)for(let i=0;i<5;i++){const x=(i*233+t*.012*(i%2?1:-1))%1100-100,y=H*(.2+i*.15);glow(c,x,y,260,'rgba(90,200,190,A)',.07);}
  const wl=wallLayer(scene,e,H);if(wl)c.drawImage(wl.surface,L.ox-wl.pad,L.oy-wl.pad);
  // cửa ra (trên) + mốc xuất phát (dưới)
  const [gx]=cellXY(L,e.exit.x,0),gy=L.oy,pulse=.5+.5*Math.sin(t*.004);
  glow(c,gx,gy,L.cell*1.6,'rgba(255,214,110,A)',.35+.2*pulse);c.fillStyle='#ffd66e';c.fillRect(gx-L.cell*.42,gy-6,L.cell*.84,5);
  txt(c,'⛩ CỬA RA',gx,gy-30,'900 22px Segoe UI','#ffe7a3',6);
  const [sx,sy]=cellXY(L,e.start.x,e.start.y);glow(c,sx,sy,L.cell*.9,'rgba(120,230,255,A)',.35+.15*pulse);
  c.strokeStyle='rgba(150,240,255,.85)';c.lineWidth=3;c.beginPath();c.arc(sx,sy,L.cell*.34,0,TAU);c.stroke();
  txt(c,'MỐC XUẤT PHÁT',sx,L.oy+L.h+24,'900 19px Segoe UI','#bdf3ff',5);
  // 10/11: tường vừa bị phá — chớp sáng + mảnh đá văng (2,5 s)
  for(const b of e.broken||[]){const k=clamp((now-b.at)/2500);if(k>=1)continue;const [px,py]=cellXY(L,b.x,b.y);glow(c,px,py,L.cell*(.6+k*.8),'rgba(255,190,90,A)',.75*(1-k));
   c.fillStyle=`rgba(190,230,220,${(1-k).toFixed(2)})`;for(let i=0;i<7;i++){const a=i*.9+b.at%7,d=L.cell*(.1+k*.55);c.fillRect(px+Math.cos(a)*d-2,py+Math.sin(a)*d-2+k*k*L.cell*.3,4,4);}}
  return;}
 // ---------- front: người chạy + HUD ----------
 const tt=performance.now(),runners=e.runners||[],seen=new Map(),pos=[];
 for(const r of runners){if(r.f)continue;const p=displayPos(scene,r,L,tt),k=r.x+','+r.y,n=seen.get(k)||0;seen.set(k,n+1);
  // nhiều người cùng ô: xếp xoắn ốc nhỏ quanh tâm ô
  const ang=n*2.4,rad=n?Math.min(L.cell*.3,5+Math.sqrt(n)*6):0;let x=p.x+Math.cos(ang)*rad,y=p.y+Math.sin(ang)*rad;
  if(now-r.b<320)x+=Math.sin(tt*.09)*3;pos.push({r,x,y,p});}
 const dot=Math.max(7,L.cell*.12);
 // chỉ skin: bỏ pháp bảo, linh thú, hiệu ứng skin (minimalCrowd tắt VFX khi vẽ thân)
 const bare=pl=>({...pl,equipped:null,equippedExtra:[],relicVariant:null,spiritPet:null,skinGear:[],artifacts:[]});
// 10/11 tối (chủ game): hiện SKIN thật của từng người (ảnh nhân vật cache, thu nhỏ vừa ô); quá 40 người (10/11: hạ từ 80 vì lag) thì người xếp sau là chấm sáng cho nhẹ.
 const sprite=L.cell/72*.4;let sprites=0;pos.sort((a,b)=>a.y-b.y);
 for(const {r,x,y,p} of pos){const h=hue(r.id),fresh=now-(r.g||0)<4000,pl=sprites<40?scene.playerIndex?.get(r.id):null;
  if(p.moving&&p.dur>300){c.strokeStyle=`hsla(${h},95%,75%,.6)`;c.lineWidth=dot;c.lineCap='round';c.beginPath();c.moveTo(p.fx,p.fy);c.lineTo(x,y);c.stroke();}
  if(fresh)glow(c,x,y,dot*4,`hsla(${h},95%,70%,A)`,.6);
  if(pl){sprites++;c.save();c.translate(x,y+L.cell*.2);c.scale(sprite,sprite);/* chống lag: 1 tư thế tĩnh (compact+motion tắt) → mỗi người dựng ảnh 1 lần rồi dùng lại; ảnh cache nhỏ (bareCrowd) */const keep=[scene.minimalCrowd,scene.compact,scene.motion,scene.bareCrowd];scene.minimalCrowd=scene.compact=scene.bareCrowd=true;scene.motion=false;try{scene.drawPlayer(c,bare(pl),0,0,t);}catch{}finally{[scene.minimalCrowd,scene.compact,scene.motion,scene.bareCrowd]=keep;}c.restore();continue;}
  c.fillStyle=`hsl(${h},85%,62%)`;c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,r.r?dot*1.2:dot,0,TAU);c.fill();c.stroke();}
 // tên: top 5 + người vừa đi/tặng quà gần nhất, tối đa 22
 // mỗi ô tối đa 1 tên (+số người cùng ô) để chữ không chồng nhau; ưu tiên top 5 rồi người vừa đi/tặng quà
 const want=[...runners.filter(r=>!r.f).slice(0,5),...[...runners].filter(r=>!r.f&&(now-r.m<2500||now-(r.g||0)<6000)).sort((a,b)=>Math.max(b.m,b.g||0)-Math.max(a.m,a.g||0))],byId=new Map(pos.map(o=>[o.r.id,o])),usedCell=new Set();let shown=0;
 for(const r of want){if(shown>=22)break;const k=r.x+','+r.y;if(usedCell.has(k)||usedCell.has((r.x-1)+','+r.y)||usedCell.has((r.x+1)+','+r.y))continue;const o=byId.get(r.id);if(!o)continue;usedCell.add(k);shown++;const more=(seen.get(k)||1)-1,[cx,cy]=cellXY(L,r.x,r.y);txt(c,String(r.n).slice(0,11)+(more?' +'+more:'')+(r.k?' ⛏'+r.k:''),cx,cy-L.cell*.5+4,'800 14px Segoe UI','#ffffff',4);}
 drawMazePortals(c,e,L,now,H,scene.budget?.level==='light');
 drawHud(scene,c,e,t,H,now,L);
}
function drawMazePortals(c,e,L,now,H,light){
 for(const f of (e.teleports||[]).slice(-3)){
  const age=now-f.at;if(age<0||age>2400)continue;
  const [x,y]=cellXY(L,f.from.x,f.from.y),[X,Y]=cellXY(L,f.to.x,f.to.y),k=age/2400;
  const alpha=Math.min(1,age/80)*(1-k),u=clamp(age/360),dx=X-x,dy=Y-y;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;
  for(const [px,py] of [[x,y],[X,Y]]){
   glow(c,px,py,L.cell*(.9+k),'rgba(128,179,255,A)',.65);
   for(let i=0;i<4;i++){
    const r=L.cell*(.25+k*.8+i*.11);
    c.strokeStyle=i%2?'#bdffff':'#ab8bff';c.lineWidth=5-i;
    c.beginPath();c.ellipse(px,py,r,r*.66,age*.002+i,0,TAU);c.stroke();
   }
  }
  if(u<1){
   c.lineCap='round';
   for(let i=0;i<(light?3:6);i++){
    c.strokeStyle=i%2?'#dffeff':'#83aaff';c.lineWidth=4+i;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+dx*.65+Math.sin(i*3)*105,y+dy*.28,x+dx*u,y+dy*u);c.stroke();
   }
  }
  c.restore();c.save();c.globalAlpha=alpha;
  txt(c,f.name+' · TỐC BIẾN',Math.max(145,Math.min(755,X)),Math.min(H*.8,Y+52),'900 21px Segoe UI','#eaffff',5);c.restore();
 }
}
function fmtTime(ms){const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function drawHud(scene,c,e,t,H,now,L){
 txt(c,'BÍ CẢNH MÊ CUNG',450,H*.065,'900 46px Segoe UI','#bff7ea',9);
 if(e.phase==='registration'){const left=e.registrationEndsAt-now;
  txt(c,'gõ  mecung  để vào • mở cửa sau '+Math.max(0,Math.ceil(left/1000))+' giây',450,H*.108,'800 26px Segoe UI','#ffe7a3',6);
  c.save();c.globalAlpha=.92;pill(c,130,H*.42,640,170,26);c.fillStyle='#061219e6';c.fill();c.strokeStyle='#5fe3c8';c.lineWidth=3;c.stroke();c.restore();
  txt(c,(e.count||0)+' đạo hữu đã vào',450,H*.42+52,'900 40px Segoe UI','#ffffff',7);
  txt(c,'tất cả xuất phát ở mốc • mỗi người tự tìm đường',450,H*.42+100,'700 24px Segoe UI','#bdf3ff',5);
  txt(c,'đi: len · xuong · trai · phai  (mỗi tin 1 bước)',450,H*.42+138,'800 24px Segoe UI','#ffe7a3',5);return;}
 if(e.phase==='running'){
  txt(c,'⏳ '+fmtTime(e.endsAt-now)+'   •   '+(e.finished||0)+'/'+(e.count||0)+' đã thoát',450,H*.108,'800 26px Segoe UI','#ffe7a3',6);
  txt(c,'gõ  len · xuong · trai · phai  — mỗi tin 1 bước • gõ mecung để vào',450,H*.885,'800 23px Segoe UI','#ffffff',5);
  (e.runners||[]).slice(0,3).forEach((r,i)=>txt(c,(r.r?['🥇','🥈','🥉'][r.r-1]||'🏁':'#'+(i+1))+' '+String(r.n).slice(0,14)+(r.r?' • đã thoát':' • còn '+r.d+' bước'),450,H*.918+i*29,'800 22px Segoe UI',r.r?'#ffe066':'#d8fff6',5));}
}
// Bảng kết quả (vẽ trên cùng).
export function drawMazeResult(scene,c,t){
 const e=scene.mazeStatus;if(!e||e.phase!=='finished'||!e.results)return;const H=scene.height,now=serverNow(scene,t),age=now-(e.finishedAt||now),end=(e.podiumUntil||now)-now;
 const a=Math.min(clamp((age-300)/600),clamp(end/700));if(a<=0)return;c.save();c.globalAlpha=a*.86;c.fillStyle='#03080d';c.fillRect(0,0,900,H);c.globalAlpha=a;
 const win=e.results[0]?.rank?e.results[0]:null;txt(c,win?'MÊ CUNG CHI CHỦ':'MÊ CUNG KHÉP LẠI',450,H*.2,'900 66px Segoe UI','#ffe066',10);
 txt(c,win?win.name:'chưa ai tìm ra lối thoát',450,H*.2+70,'900 40px Segoe UI','#ffffff',8);
 txt(c,(e.finished||0)+' / '+(e.count||0)+' đạo hữu thoát ra',450,H*.2+124,'800 26px Segoe UI','#bdf3ff',6);
 e.results.slice(0,5).forEach((r,i)=>{const y=H*.42+i*74;c.globalAlpha=a*.9;pill(c,150,y-30,600,60,18);c.fillStyle=r.rank?'#2a2210':'#0d1d22';c.fill();c.globalAlpha=a;
  txt(c,(r.rank?['🥇','🥈','🥉'][r.rank-1]||'🏁':'#'+(i+1))+'  '+String(r.name).slice(0,16),180,y,'900 28px Segoe UI','#ffffff',6,'left');
  txt(c,(r.rank?r.steps+' bước':'còn '+r.left+' bước')+(r.qi?' • +'+r.qi.toLocaleString('vi-VN')+' tu vi':''),730,y,'800 22px Segoe UI',r.rank?'#ffe066':'#bdf3ff',5,'right');});
 c.restore();
}
