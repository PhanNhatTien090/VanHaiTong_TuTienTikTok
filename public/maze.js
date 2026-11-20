import {drawAura,drawSeal,drawTrail} from './cinematic-vfx.js';
import {MAZE_SPRITE_CAP} from './crowd-policy.js';
import {feedbackBudget} from './cinematic-feedback.js';
// 10/11/2026: BÍ CẢNH MÊ CUNG — vẽ mê cung chung + chấm sáng mỗi người (server: maze.mjs).
// Tường dựng sẵn vào 1 lớp cache theo mã mê cung (vẽ lại chỉ khi đổi mê cung/cỡ màn) → 300 người vẫn nhẹ.
// Tên: chỉ hiện top dẫn đầu + người vừa đi/vừa tặng quà (≤22 tên) để chữ không chồng nhau.
import {makeSurface} from './performance.js';
const mistColor='rgba(90,200,190,A)';
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const serverNow=(scene,t)=>(scene.mazeServerNow||Date.now())+Math.min(2000,t-(scene.mazeReceivedAt||t));
export function syncMaze(scene,state){const e=state.maze||null;if(e?.id!==scene.mazeId){scene.mazeId=e?.id;scene.mazeRunPos=new Map();scene.mazeHeard=new Set();}scene.mazeStatus=e?.active?e:null;scene.mazeReceivedAt=performance.now();scene.mazeServerNow=state.serverNow;
 if(typeof document!=='undefined')document.body?.classList?.toggle('maze-on',!!scene.mazeStatus);}
export const mazeOn=scene=>!!scene.mazeStatus;
const hue=id=>{let n=0;for(const ch of String(id))n=(Math.imul(n,31)+ch.charCodeAt(0))|0;return Math.abs(n)%360;};
export function mazeLayout(H,cols,rows){const top=H*.155,bottom=H*.8,/* 17/11: chừa đáy cho chữ, cách đáy ≥11% */cell=Math.min(840/cols,(bottom-top)/rows),w=cols*cell,h=rows*cell;return {cell,ox:450-w/2,oy:top+(bottom-top-h)/2,w,h};}
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
function displayPos(scene,r,L,tt,walk){const st=scene.mazeRunPos??=new Map(),[tx,ty]=cellXY(L,r.x,r.y);let p=st.get(r.id);
 if(!p){p={x:tx,y:ty,fx:tx,fy:ty,tx,ty,t0:tt,dur:1};st.set(r.id,p);}
 // 16/11: quà tự đi → lướt theo từng ô của đường (110 ms/ô), không xuyên tường
 if(walk&&p.walkId!==walk.id){p.walkId=walk.id;p.path=[[p.x,p.y],...walk.path.map(([x,y])=>cellXY(L,x,y))];p.t0=tt;p.dur=Math.max(300,walk.path.length*110);p.tx=tx;p.ty=ty;}
 else if(p.tx!==tx||p.ty!==ty){p.path=null;p.fx=p.x;p.fy=p.y;p.tx=tx;p.ty=ty;p.t0=tt;p.dur=Math.hypot(tx-p.x,ty-p.y)>L.cell*1.5?650:160;}
 const k=clamp((tt-p.t0)/p.dur);
 if(p.path){const n=p.path.length-1,u=k*n,i=Math.min(n-1,Math.floor(u)),f=u-i,[ax,ay]=p.path[i],[bx,by]=p.path[i+1];p.x=ax+(bx-ax)*f;p.y=ay+(by-ay)*f;if(k>=1){p.x=tx;p.y=ty;p.path=null;}}
 else{const ease=1-(1-k)**3;p.x=p.fx+(p.tx-p.fx)*ease;p.y=p.fy+(p.ty-p.fy)*ease;}
 p.moving=k<1;p.seen=tt;return p;}
// 16/11: yêu thú mê cung — cắt từ boss-atlas.png có sẵn (3 ô: hổ băng, rùa ngọc, phượng lửa)
function mobArt(scene){if(scene.mazeMobArt!==undefined||typeof Image==='undefined')return scene.mazeMobArt||null;scene.mazeMobArt=null;const im=new Image();im.decoding='async';im.onload=()=>{scene.mazeMobArt=im;};im.src='/assets/boss-atlas.webp';return null;}
function mobPos(scene,id,x,y,tt){const st=scene.mazeMobPos??=new Map();let p=st.get(id);if(!p){p={x,y,fx:x,fy:y,tx:x,ty:y,t0:tt};st.set(id,p);}
 if(p.tx!==x||p.ty!==y){p.fx=p.x;p.fy=p.y;p.tx=x;p.ty=y;p.t0=tt;}const k=clamp((tt-p.t0)/600),e=k<.5?2*k*k:1-(-2*k+2)**2/2;p.x=p.fx+(p.tx-p.fx)*e;p.y=p.fy+(p.ty-p.fy)*e;p.seen=tt;return p;}
function drawMobs(scene,c,e,L,t,now){
 const im=mobArt(scene),motion=scene.motion!==false,S=L.cell*.72;
 for(const d of e.dens||[]){const [x,y]=cellXY(L,d.x,d.y);glow(c,x,y,L.cell*.75,'rgba(150,70,255,A)',.35+.12*Math.sin(t*.003+d.x));
  c.save();c.translate(x,y);if(motion)c.rotate(t*.0015);c.strokeStyle='rgba(200,150,255,.75)';c.lineWidth=2.5;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,L.cell*(.14+i*.09),i*2.1,i*2.1+3.6);c.stroke();}c.restore();}
 for(const [mx,my,id] of e.mobs||[]){const [cx,cy]=cellXY(L,mx,my),p=motion?mobPos(scene,id,cx,cy,t):{x:cx,y:cy},bob=motion?Math.sin(t*.008+mx*3)*2.5:0,cell=(Number(String(id).slice(1))||0)%3;
  glow(c,p.x,p.y+S*.2,S*.7,'rgba(255,60,60,A)',.32);
  if(im?.naturalWidth){const cw=im.naturalWidth/3,h=S*im.naturalHeight/cw*.62,w=S*.62*1.0;c.drawImage(im,cell*cw,0,cw,im.naturalHeight,p.x-w,p.y-h*1.25+bob,w*2,h*2);}
  else{c.fillStyle='#ff5a5a';c.beginPath();c.arc(p.x,p.y,L.cell*.25,0,TAU);c.fill();}
  txt(c,'yêu',p.x,p.y+L.cell*.42,'900 11px Segoe UI','#ffb3b3',3);}
 // khói tan (yêu thú hết giờ / đánh xong / bị chém)
 for(const o of e.poofs||[]){const k=clamp((now-o.at)/1200);if(k>=1)continue;const [x,y]=cellXY(L,o.x,o.y);glow(c,x,y,L.cell*(.5+k),o.why==='slash'?'rgba(255,220,120,A)':'rgba(190,160,255,A)',.7*(1-k));
  if(o.why==='slash'){c.save();c.globalAlpha=1-k;c.strokeStyle='#fff6c8';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(x-L.cell*.5,y+L.cell*.4);c.lineTo(x+L.cell*.5,y-L.cell*.4);c.stroke();c.restore();}}
 // bị đánh văng: chớp đỏ + chữ VĂNG + vệt lùi
 for(const h of e.hits||[]){const k=clamp((now-h.at)/1600);if(k>=1)continue;const [ax,ay]=cellXY(L,h.from.x,h.from.y),[bx,by]=cellXY(L,h.to.x,h.to.y);
  glow(c,ax,ay,L.cell*(.6+k*.7),'rgba(255,70,60,A)',.8*(1-k));c.save();c.globalAlpha=1-k;c.strokeStyle='#ff8a7a';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();c.restore();
  c.save();c.globalAlpha=k<.15?k/.15:1-k;txt(c,'VĂNG!',bx,by-L.cell*.55-k*18,'900 20px Segoe UI','#ff7a6a',5);c.restore();}
 // quà tự đi: vệt vàng dọc đường
 for(const f of e.walks||[]){const k=clamp((now-f.at)/3500);if(k>=1)continue;const pts=[f.from,...f.path.map(([x,y])=>({x,y}))].map(q=>cellXY(L,q.x,q.y)),reach=Math.min(pts.length,1+Math.floor(clamp((now-f.at)/Math.max(300,f.path.length*110))*(pts.length-1)));
  c.save();c.globalAlpha=(1-k)*.9;c.strokeStyle='#ffe58a';c.lineWidth=L.cell*.16;c.lineCap='round';c.lineJoin='round';c.shadowColor='#ffd36b';c.shadowBlur=14;c.beginPath();pts.slice(0,reach).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();c.restore();
  if(k<.6){const [x,y]=pts[reach-1];c.save();c.globalAlpha=1-k/.6;txt(c,String(f.name).slice(0,11)+' · TỰ ĐI '+f.path.length+' Ô',Math.max(150,Math.min(750,x)),y-L.cell*.8,'900 18px Segoe UI','#ffe7a3',5);c.restore();}}
}
export function drawMaze(scene,c,t,layer){
 const e=scene.mazeStatus;if(!e?.cells)return;const H=scene.height,now=serverNow(scene,t),L=mazeLayout(H,e.cols,e.rows);
 if(layer==='back'){
  if(scene.mazeBackground?.context!==c||scene.mazeBackground.height!==H||scene.mazeBackground.width!==c.canvas.width){
   const gradient=c.createLinearGradient(0,0,0,H);
   gradient.addColorStop(0,'#04101a');gradient.addColorStop(.5,'#071c22');gradient.addColorStop(1,'#03080d');
   scene.mazeBackground={context:c,height:H,width:c.canvas.width,gradient};
  }
  c.fillStyle=scene.mazeBackground.gradient;c.fillRect(-20,-20,940,H+40);
  // 16/11: nền tàn tích (Codex vẽ, giữa gần như trơn để lưới mê cung dễ đọc)
  if(typeof Image!=='undefined'&&!scene.mazeArt){const im=new Image();im.decoding='async';im.src='/assets/event-maps-v1/maze-ruins.webp';scene.mazeArt=im;}
  const art=scene.mazeArt;if(art?.complete&&art.naturalWidth){const k=Math.max(900/art.naturalWidth,H/art.naturalHeight),w=art.naturalWidth*k,h=art.naturalHeight*k;c.drawImage(art,(900-w)/2,(H-h)/2,w,h);}
  // sương bí cảnh trôi chậm
  if(scene.motion!==false&&!feedbackBudget(scene))for(let i=0;i<5;i++){const x=(i*233+t*.012*(i%2?1:-1))%1100-100,y=H*(.2+i*.15);glow(c,x,y,260,mistColor,.07);}
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
 const tt=t,runners=e.runners||[],seen=new Map(),pos=[];
 const walks=new Map();for(const f of e.walks||[])if(now-f.at<Math.max(300,f.path.length*110)+200)walks.set(f.rid,f);
 for(const r of runners){if(r.f)continue;const p=displayPos(scene,r,L,tt,walks.get(r.id)),k=r.x+','+r.y,n=seen.get(k)||0;seen.set(k,n+1);
  // nhiều người cùng ô: xếp xoắn ốc nhỏ quanh tâm ô
  const ang=n*2.4,rad=n?Math.min(L.cell*.3,5+Math.sqrt(n)*6):0;let x=(scene.motion===false?p.tx:p.x)+Math.cos(ang)*rad,y=(scene.motion===false?p.ty:p.y)+Math.sin(ang)*rad;
  if(scene.motion!==false&&now-r.b<320)x+=Math.sin(tt*.09)*3;if(scene.motion!==false&&now-(r.h||0)<500)x+=Math.sin(tt*.12)*5;pos.push({r,x,y,p});}
 drawMobs(scene,c,e,L,t,now);
 const dot=Math.max(7,L.cell*.12);
 // chỉ skin: bỏ pháp bảo, linh thú, hiệu ứng skin (minimalCrowd tắt VFX khi vẽ thân)
 const projections=scene.mazeActorProjections??=new WeakMap();
 const bare=pl=>{
  if(!projections.has(pl))projections.set(pl,{...pl,equipped:null,equippedExtra:[],relicVariant:null,spiritPet:null,skinGear:[],artifacts:[]});
  return projections.get(pl);
 };
// 10/11 tối (chủ game): hiện SKIN thật của từng người (ảnh nhân vật cache, thu nhỏ vừa ô); quá 40 người (10/11: hạ từ 80 vì lag) thì người xếp sau là chấm sáng cho nhẹ.
 const sprite=L.cell/72*.4;let sprites=0;pos.sort((a,b)=>a.y-b.y);
 for(const {r,x,y,p} of pos){const h=hue(r.id),fresh=now-(r.g||0)<4000,pl=sprites<MAZE_SPRITE_CAP?scene.playerIndex?.get(r.id):null;
  if(scene.motion!==false&&p.moving&&p.dur>300){c.strokeStyle=`hsla(${h},95%,75%,.6)`;c.lineWidth=dot;c.lineCap='round';c.beginPath();c.moveTo(p.fx,p.fy);c.lineTo(x,y);c.stroke();}
  if(fresh)glow(c,x,y,dot*4,`hsla(${h},95%,70%,A)`,.6);
  if(pl){sprites++;c.save();c.translate(x,y+L.cell*.2);c.scale(sprite,sprite);/* chống lag: 1 tư thế tĩnh (compact+motion tắt) → mỗi người dựng ảnh 1 lần rồi dùng lại; giữ raster theo budget chung */const keep=[scene.minimalCrowd,scene.compact,scene.motion,scene.bareCrowd];scene.minimalCrowd=scene.compact=scene.bareCrowd=true;scene.motion=false;try{scene.drawPlayer(c,bare(pl),0,0,t,1.42);}catch{}finally{[scene.minimalCrowd,scene.compact,scene.motion,scene.bareCrowd]=keep;}c.restore();continue;}
  c.fillStyle=`hsl(${h},85%,62%)`;c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(x,y,r.r?dot*1.2:dot,0,TAU);c.fill();c.stroke();}
 // tên: top 5 + người vừa đi/tặng quà gần nhất, tối đa 22
 // mỗi ô tối đa 1 tên (+số người cùng ô) để chữ không chồng nhau; ưu tiên top 5 rồi người vừa đi/tặng quà
 const want=[...runners.filter(r=>!r.f).slice(0,5),...[...runners].filter(r=>!r.f&&(now-r.m<2500||now-(r.g||0)<6000)).sort((a,b)=>Math.max(b.m,b.g||0)-Math.max(a.m,a.g||0))],byId=new Map(pos.map(o=>[o.r.id,o])),usedCell=new Set();let shown=0;
 for(const r of want){if(shown>=22)break;const k=r.x+','+r.y;if(usedCell.has(k)||usedCell.has((r.x-1)+','+r.y)||usedCell.has((r.x+1)+','+r.y))continue;const o=byId.get(r.id);if(!o)continue;usedCell.add(k);shown++;const more=(seen.get(k)||1)-1,[cx,cy]=cellXY(L,r.x,r.y);txt(c,String(r.n).slice(0,11)+(more?' +'+more:'')+(r.k?' ⛏'+r.k:''),cx,cy-L.cell*.5+4,'800 14px Segoe UI','#ffffff',4);}
 scene.onStageActors=sprites;scene.visibleActors=sprites;
 drawMazePortals(scene,c,e,L,now,H);
 drawHud(scene,c,e,t,H,now,L);
}
function drawMazePortals(scene,c,e,L,now,H){
 const light=feedbackBudget(scene),motion=scene.motion!==false;
 for(const f of (e.teleports||[]).slice(-3)){
  const age=now-f.at;if(age<0||age>2400)continue;
  const heard=scene.mazeHeard??=new Set(),key=f.id??f.at+':'+f.name;
  if(!heard.has(key)){
   heard.add(key);
   if(heard.size>32)heard.delete(heard.values().next().value);
   if(age<550){
    if(scene.cinematicV2!==false&&scene.onCinematicSound)scene.onCinematicSound('maze:'+key,'jade',0,{priority:1,gain:.48});
    else scene.onMazePortalSound?.();
   }
  }
  const [x,y]=cellXY(L,f.from.x,f.from.y),[X,Y]=cellXY(L,f.to.x,f.to.y),k=age/2400;
  const alpha=Math.min(1,age/80)*(1-k),u=motion?clamp(age/340):1,dx=X-x,dy=Y-y;
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=alpha;
  if(scene.cinematicV2!==false){
   drawSeal(c,'jade',x,y,L.cell*.84,motion?age*.001:0,.88);
   drawSeal(c,'void',X,Y,L.cell*.84,motion?-age*.001:0,.88);
   drawAura(c,'void',X,Y,L.cell*.72,.44);
   if(u<1)drawTrail(c,'jade',x+dx*u,y+dy*u,Math.atan2(dy,dx),Math.min(L.cell*2,Math.hypot(dx,dy)),.88);
  }else{
  for(const [px,py] of [[x,y],[X,Y]]){
   glow(c,px,py,L.cell*(.9+k),'rgba(128,179,255,A)',.65);
   for(let i=0;i<(light?2:3);i++){
    const r=L.cell*(.25+k*.8+i*.11);
    c.strokeStyle=i%2?'#bdffff':'#ab8bff';c.lineWidth=5-i;
    c.beginPath();c.ellipse(px,py,r,r*.66,(motion?age*.002:0)+i,0,TAU);c.stroke();
   }
  }
  if(u<1){
   c.lineCap='round';
   for(let i=0;i<(light?2:4);i++){
    c.strokeStyle=i%2?'#dffeff':'#83aaff';c.lineWidth=4+i;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+dx*.65+Math.sin(i*3)*105,y+dy*.28,x+dx*u,y+dy*u);c.stroke();
   }
  }
  if(age>=250){
   const settle=clamp((age-250)/800);
   c.globalAlpha=alpha*(1-settle)*.9;
   c.strokeStyle='#ccf7ff';c.lineWidth=3;
   c.beginPath();c.ellipse(X,Y,L.cell*(.35+settle),L.cell*(.18+settle*.42),0,0,TAU);c.stroke();
  }
  }
  c.restore();c.save();c.globalAlpha=alpha;
  txt(c,f.name+' · TỐC BIẾN',Math.max(145,Math.min(755,X)),Math.min(H*.8,Y+52),'900 21px Segoe UI','#eaffff',5);c.restore();
 }
}
function fmtTime(ms){const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function drawHud(scene,c,e,t,H,now,L){
 txt(c,'BÍ CẢNH MÊ CUNG',400,H*.065,'900 38px Segoe UI','#bff7ea',8);
 if(e.phase==='registration'){const left=e.registrationEndsAt-now;
  txt(c,'cả sân tự vào • mở cửa sau '+Math.max(0,Math.ceil(left/1000))+' giây',450,H*.108,'800 26px Segoe UI','#ffe7a3',6);
  c.save();c.globalAlpha=.92;pill(c,130,H*.42,640,170,26);c.fillStyle='#061219e6';c.fill();c.strokeStyle='#5fe3c8';c.lineWidth=3;c.stroke();c.restore();
  txt(c,(e.count||0)+' đạo hữu đã vào',450,H*.42+52,'900 40px Segoe UI','#ffffff',7);
  txt(c,'tất cả xuất phát ở mốc • mỗi người tự tìm đường',450,H*.42+100,'700 24px Segoe UI','#bdf3ff',5);
  txt(c,'đi: len · xuong · trai · phai  (mỗi tin 1 bước)',450,H*.42+138,'800 24px Segoe UI','#ffe7a3',5);
  txt(c,'⚠ yêu thú chui ra từ hang tím • đụng là văng lùi 1 ô',450,H*.42+200,'800 22px Segoe UI','#ffb3b3',5);return;}
 if(e.phase==='running'){
  txt(c,'⏳ '+fmtTime(e.endsAt-now)+'   •   '+(e.finished||0)+'/'+(e.count||0)+' đã thoát',450,H*.108,'800 26px Segoe UI','#ffe7a3',6);
  txt(c,'gõ  len · xuong · trai · phai  (1 tin 1 bước) • ⚠ né yêu thú',450,H*.836,'800 23px Segoe UI','#ffffff',5);
  {const top3=(e.runners||[]).slice(0,3).map((r,i)=>(r.r?['🥇','🥈','🥉'][r.r-1]||'🏁':'#'+(i+1))+' '+String(r.n).slice(0,10)+' '+(r.r?'✔':r.d));if(top3.length)txt(c,top3.join('   '),450,H*.866,'800 21px Segoe UI','#ffe7a3',5);}}
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
