// Luyện Hư v2 — Hư Không Khai Giới · Vạn Kính Quy Nhất (07/11/2026). Toạ độ cảnh 900 × H.
// Nhân quả: thiên đài (sân khấu các cảnh giới dưới) nứt như gương → vỡ lộ hư không → 8 mảnh thành vòng gương →
// bóng phản chiếu bước ra làm phân thân → phân thân đỡ 4 nhát rách hư không và vỡ thành ánh sáng nhập thân →
// hư nhãn hút vạn vật → nghịch chuyển: mảnh vỡ tua ngược về, 8 gương hợp thành Hư Không Kính → nhập đan điền → nổ → đổi skin.
// Đường nứt chính là cạnh của các mảnh vỡ, nên vết nứt dẫn đúng tới chỗ vỡ.
import {makeSurface} from './performance.js';
export const LH_TIMING=Object.freeze({duration:20.8,crack:.12,shatter:2.4,mirrors:4.8,clones:7.6,rifts:10.6,eye:12.8,rewind:14.6,disk:15.0,enter:16.2,absorbed:17.1,impact:17.25,reveal:17.55,fade:19.6});
export const LH_RIFTS=Object.freeze([10.6,11.15,11.7,12.25]);
const T=LH_TIMING,TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
const rnd=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const C={violet:'#b8a6ff',teal:'#9ff3ea',white:'#f1ecff',gold:'#ffe3a8',deep:'#0a0620'};
// 8 mảnh ở vòng giữa trở thành gương (chia đều quanh tâm).
export const LH_MIRROR_CELLS=Object.freeze([0,2,3,5,6,8,9,11]);
export function luyenHuFormationState(t,H=1600,motion=true){
 const feet=H*.67;
 return {t,H,motion,clock:motion?t:0,feet,belly:feet-145,center:{x:450,y:H*.47},
  crack:t<T.crack?0:1-(1-clamp((t-T.crack)/2.1))**2.6,heal:ease((t-T.enter)/.8),cold:ease((t-.3)/1.8)*(1-ease((t-T.impact)/.4)),
  shatter:ease((t-T.shatter)/2),gather:ease((t-T.mirrors)/1.6),reflect:ease((t-T.mirrors-1)/1)*(1-ease((t-T.clones-.4)/2.2)),
  clones:Array.from({length:8},(_,k)=>ease((t-T.clones-k*.26)/.9)),
  eye:ease((t-T.eye)/1)*(1-ease((t-T.rewind)/.9)),pull:ease((t-T.eye)/1.8)*(1-ease((t-T.rewind)/.6)),
  rewind:ease((t-T.rewind)/1.5),disk:ease((t-T.disk)/1.1),enter:ease((t-T.enter)/.9),
  seams:ease((t-T.enter)/.6)*(t<T.impact?1:0),compression:ease((t-T.absorbed+.15)/.3)*(1-ease((t-T.impact)/.06)),
  blast:t<T.impact?0:clamp((t-T.impact)/1.5),restored:ease((t-T.impact)/.45),after:ease((t-T.reveal)/.4),
  fade:1-ease((t-T.fade)/1.2)};
}
function surface(w,h,paint){const im=makeSurface(Math.max(1,Math.ceil(w)),Math.max(1,Math.ceil(h)));if(im)paint(im.getContext('2d'));return im;}
function path(c,pts){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
export function prepareLuyenHuArt(scene){
 if(typeof Image==='undefined')return;
 for(const [key,src] of [['luyenHuWorldArt','/assets/worlds-v2/jade-palace.png'],['luyenHuVoidArt','/assets/worlds-v2/cosmos.png']])
  if(!scene[key]){const im=new Image();scene[key]=im;im.onload=()=>{scene.luyenHuAssets=null;};im.src=src;}
}
const ready=im=>im&&(im.naturalWidth||im.width)>0&&im.complete!==false;
// Lưới mảnh vỡ: 12 tia × 3 vòng + ô tâm. Toạ độ thế giới; điểm có jitter cố định.
export function luyenHuShardGrid(H){
 const cx=450,cy=H*.47,R=[150,380,690,1150],ang=Array.from({length:12},(_,i)=>i*TAU/12+(rnd(i+3)-.5)*.22);
 const P=(i,j)=>{i=(i+12)%12;const a=ang[i]+(rnd(i*7+j*13)-.5)*.1,r=R[j]*(1+(rnd(i*5+j*29)-.5)*.16);return [cx+Math.cos(a)*r*.82,cy+Math.sin(a)*r];};
 // Mỗi cạnh chia 3 đoạn, lệch vuông góc theo khóa cạnh (không phụ thuộc chiều) → hai mảnh kề khớp nhau.
 const side=(a,b)=>{const flip=a[0]>b[0]||a[0]===b[0]&&a[1]>b[1],p=flip?b:a,q=flip?a:b,key=Math.round(p[0]*3+p[1]*7+q[0]*11+q[1]*13),dx=q[0]-p[0],dy=q[1]-p[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,amp=Math.min(38,L*.09);
  const mid=[1,2].map(m=>{const u=m/3+(rnd(key+m*17)-.5)*.12,o=(rnd(key+m*31)-.5)*2*amp;return [p[0]+dx*u+nx*o,p[1]+dy*u+ny*o];});const pts=[p,...mid,q];return flip?pts.reverse():pts;};
 const poly=corners=>corners.flatMap((a,k)=>side(a,corners[(k+1)%corners.length]).slice(0,-1));
 const cells=[{i:-1,ring:-1,pts:poly(Array.from({length:12},(_,i)=>P(i,0)))}];
 for(let j=0;j<3;j++)for(let i=0;i<12;i++)cells.push({i,ring:j,pts:poly([P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)])});
 return {cx,cy,cells,edges:crackEdges(cells,cx,cy)};
}
// Mỗi cạnh nứt kèm khoảng cách tới tâm để vẽ lan dần từ điểm vỡ đầu tiên.
function crackEdges(cells,cx,cy){const seen=new Set(),out=[];
 for(const cell of cells)cell.pts.forEach((a,k)=>{const b=cell.pts[(k+1)%cell.pts.length],key=[a,b].map(p=>p.map(Math.round).join(',')).sort().join('|');if(seen.has(key))return;seen.add(key);
  const da=Math.hypot(a[0]-cx,a[1]-cy),db=Math.hypot(b[0]-cx,b[1]-cy);out.push(da<=db?{a,b,d0:da,d1:db}:{a:b,b:a,d0:db,d1:da});});
 return out;}
function buildAssets(scene,H){
 const cache=scene.luyenHuAssets;if(cache?.H===H)return cache;
 const worldArt=ready(scene.luyenHuWorldArt)?scene.luyenHuWorldArt:null,voidArt=ready(scene.luyenHuVoidArt)?scene.luyenHuVoidArt:null;
 const paintWorld=(c,cold)=>{c.scale(.5,.5);if(worldArt)c.drawImage(worldArt,0,0,900,H);else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3d5d78');g.addColorStop(.55,'#9fc6c8');g.addColorStop(1,'#2c4b4f');c.fillStyle=g;c.fillRect(0,0,900,H);}
  c.fillStyle=cold?'#1a1638a8':'#0a14262e';c.fillRect(0,0,900,H);if(cold){c.globalCompositeOperation='saturation';c.fillStyle='#6a6a6a';c.globalAlpha=.75;c.fillRect(0,0,900,H);c.globalAlpha=1;c.globalCompositeOperation='source-over';}};
 const world=surface(450,H/2,c=>paintWorld(c,false)),cold=surface(450,H/2,c=>paintWorld(c,true));
 const restored=surface(450,H/2,c=>{paintWorld(c,false);c.globalCompositeOperation='screen';const g=c.createRadialGradient(450,H*.42,40,450,H*.42,H*.7);g.addColorStop(0,'#cfc4ff70');g.addColorStop(1,'#cfc4ff00');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const voidSky=surface(450,H/2,c=>{c.scale(.5,.5);c.fillStyle=C.deep;c.fillRect(0,0,900,H);if(voidArt){c.globalAlpha=.85;c.drawImage(voidArt,0,0,900,H);c.globalAlpha=1;}
  c.globalCompositeOperation='multiply';c.fillStyle='#4a36a8';c.fillRect(0,0,900,H);c.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){const x=150+rnd(i+40)*600,y=H*(.12+rnd(i+50)*.6),r=180+rnd(i+60)*220,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'#7b5cff40':'#3fe0d030');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
  for(let i=0;i<160;i++){c.globalAlpha=.25+rnd(i)*.7;c.fillStyle=i%6?'#e9e4ff':C.teal;const s=i%11?1.2:2.4;c.fillRect(rnd(i+200)*900,rnd(i+300)*H,s,s);}c.globalAlpha=1;});
 const glow=surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#d6ccffb0');g.addColorStop(.5,'#8f7bff30');g.addColorStop(1,'#8f7bff00');c.fillStyle=g;c.fillRect(0,0,128,128);});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.47,170,450,H*.47,H*.7);g.addColorStop(0,'#05031200');g.addColorStop(.55,'#05031200');g.addColorStop(1,'#050312d8');c.fillStyle=g;c.fillRect(0,0,900,H);});
 // Cắt từng mảnh một lần (nửa độ phân giải), viền sáng như cạnh kính.
 const grid=luyenHuShardGrid(H),shards=grid.cells.map((cell,n)=>{
  const xs=cell.pts.map(p=>p[0]),ys=cell.pts.map(p=>p[1]),bx=Math.max(0,Math.min(...xs)),by=Math.max(0,Math.min(...ys)),bw=Math.min(900,Math.max(...xs))-bx,bh=Math.min(H,Math.max(...ys))-by;
  const cx=cell.pts.reduce((a,p)=>a+p[0],0)/cell.pts.length,cy=cell.pts.reduce((a,p)=>a+p[1],0)/cell.pts.length;
  const im=bw>2&&bh>2?surface(bw/2,bh/2,c=>{c.scale(.5,.5);c.translate(-bx,-by);path(c,cell.pts);c.save();c.clip();if(world)c.drawImage(world,0,0,900,H);c.restore();c.strokeStyle='#efeaffaa';c.lineWidth=2.5;path(c,cell.pts);c.stroke();}):null;
  const mirror=cell.ring===1&&LH_MIRROR_CELLS.includes(cell.i)?LH_MIRROR_CELLS.indexOf(cell.i):-1;
  return {...cell,n,im,bx,by,bw,bh,cx,cy,mirror,local:cell.pts.map(([x,y])=>[x-cx,y-cy])};}).filter(s=>s.im);
 return scene.luyenHuAssets={H,world,cold,restored,voidSky,glow,vignette,grid,shards};
}
function halo(c,im,x,y,w,h,a){if(!im||a<=0)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='screen';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
// Vị trí gương k: vòm phía TRÊN và hai bên nhân vật (luôn sau thân, không che mặt).
export function lhMirrorSlot(k,st){const th=mix(-170,-10,k/7)*Math.PI/180;return {x:450+Math.cos(th)*370,y:st.belly-40+Math.sin(th)*470,rot:(Math.cos(th))*.18};}
// Vị trí phân thân: hai hàng hai bên.
export function lhClonePos(k,st){const back=k%2===0,side=k<4?-1:1,col=Math.floor((k%4)/2);return {x:450+side*(back?[215,345][col]:[185,350][col]),y:back?st.feet-30:st.feet+70,s:back?.56:.66,back};}
function shardPose(sh,st,v){
 const dirx=sh.cx-st.center.x,diry=sh.cy-st.center.y,len=Math.max(1,Math.hypot(dirx,diry)),ux=sh.ring<0?0:dirx/len,uy=sh.ring<0?-1:diry/len,seed=sh.n*1.7+v.phase*3;
 const e=st.shatter,drift=Math.max(0,st.t-T.shatter)*(5+rnd(seed)*6)*(1-st.rewind);
 const tw=(rnd(seed+8)-.5)*.9,ox=ux*Math.cos(tw)-uy*Math.sin(tw),oy=ux*Math.sin(tw)+uy*Math.cos(tw),go=e*(25+(sh.ring+1)*55+rnd(seed+1)*110)+drift;
 let dx=ox*go,dy=oy*go,rot=e*(rnd(seed+2)-.5)*1.5,scale=1-e*(.06+rnd(seed+3)*.3),alpha=1-e*.25-st.gather*.45*(1-st.rewind);
 if(st.pull>0){const vx=450-(sh.cx+dx),vy=st.H*.2-(sh.cy+dy);dx+=vx*st.pull*.22;dy+=vy*st.pull*.22;rot+=st.pull*(rnd(seed+4)-.5)*1.4;}
 dx*=1-st.rewind;dy*=1-st.rewind;rot*=1-st.rewind;scale=mix(scale,1,st.rewind);alpha=mix(alpha,1,st.rewind);
 if(st.blast>0){const b=ease(st.blast),k=sh.ring<0?.6:1;dx+=ux*b*(380+rnd(seed+5)*420)*k+(rnd(seed+6)-.5)*80*b;dy+=uy*b*(380+rnd(seed+5)*420)*k+b*b*260;rot+=b*(rnd(seed+7)-.5)*4;scale*=1+b*.25;alpha*=1-st.blast;}
 return {x:sh.cx+dx,y:sh.cy+dy,rot,scale,alpha};
}
function mirrorPose(sh,st,v){
 const k=sh.mirror,base=shardPose({...sh,mirror:-1},{...st,rewind:0,blast:0,pull:0},v),slot=lhMirrorSlot(k,st),norm=215/Math.max(sh.bw,sh.bh),g=ease((st.t-T.mirrors-k*.12)/1.4);
 let x=mix(base.x,slot.x,g),y=mix(base.y,slot.y,g)+(st.motion?Math.sin(st.clock*1.3+k)*6*g:0),rot=mix(base.rot,slot.rot,g),scale=mix(base.scale,norm,g);
 // Nghịch chuyển: 8 gương rời vòm, xếp thành Hư Không Kính trước ngực rồi nhập đan điền.
 const d=ease((st.t-T.disk-k*.05)/1);if(d>0){const a=k*TAU/8,r=46*(1-st.enter);x=mix(x,450+Math.cos(a)*r,d);y=mix(y,st.belly-25+Math.sin(a)*r*.9-(1-st.enter)*0,d);rot=mix(rot,a+Math.PI/2,d);scale=mix(scale,norm*.32*(1-st.enter*.85),d);}
 if(st.enter>0)y=mix(y,st.belly+10,st.enter*.6);
 return {x,y,rot,scale,alpha:(1-ease((st.t-T.absorbed)/.15))*(1-st.eye*.5)};
}
function drawShard(c,sh,pose,edge,a){if(pose.alpha<=.01)return;c.save();c.translate(pose.x,pose.y);c.rotate(pose.rot);c.scale(pose.scale,pose.scale);c.globalAlpha*=pose.alpha;
 c.drawImage(sh.im,sh.bx-sh.cx,sh.by-sh.cy,sh.bw,sh.bh);if(edge>0){c.globalCompositeOperation='screen';c.globalAlpha=pose.alpha*edge;c.strokeStyle=C.violet;c.lineWidth=3/Math.max(.3,pose.scale);path(c,sh.local);c.stroke();}c.restore();}
// Nền: thế giới nguyên → nứt/đông cứng → vỡ lộ hư không → tua ngược → nổ lộ thế giới mới.
export function drawLhWorld(scene,c,st,v){
 const a=buildAssets(scene,st.H),H=st.H;
 if(st.t<T.shatter){c.drawImage(a.world,0,0,900,H);if(st.cold>0){c.save();c.globalAlpha=st.cold;c.drawImage(a.cold,0,0,900,H);c.restore();}drawLhCracks(c,a,st);return;}
 c.drawImage(a.voidSky,0,0,900,H);
 if(st.t>=T.impact){c.drawImage(a.world,0,0,900,H);c.save();c.globalAlpha=st.restored;c.drawImage(a.restored,0,0,900,H);c.restore();}
 if(st.heal>0&&st.t<T.impact){c.save();c.globalAlpha=st.heal;c.drawImage(a.world,0,0,900,H);c.restore();}
 const cold=st.cold>.01;for(const sh of a.shards){if(sh.mirror>=0)continue;const pose=shardPose(sh,st,v);drawShard(c,sh,pose,(st.shatter*(1-st.rewind)*.7+st.seams)*(1-st.blast),1);}
 if(cold&&st.t<T.impact){/* lớp lạnh phủ mảnh: dùng cùng hình dạng nên chỉ cần phủ tông tối trên các mảnh */c.save();c.globalCompositeOperation='multiply';c.globalAlpha=st.cold*.35*(1-st.rewind);c.fillStyle='#6c66a8';c.fillRect(0,0,900,H);c.restore();}
}
export function drawLhCracks(c,a,st){
 if(st.crack<=0)return;const maxD=1000,front=st.crack*maxD,{cx,cy}=a.grid;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';
 for(const pass of [[7,'#8f7bff',.22],[2.2,'#f1ecff',.9]]){c.lineWidth=pass[0];c.strokeStyle=pass[1];c.globalAlpha=pass[2];c.beginPath();
  for(const e of a.grid.edges){if(e.d0>front)continue;const u=clamp((front-e.d0)/Math.max(1,e.d1-e.d0));c.moveTo(e.a[0],e.a[1]);c.lineTo(mix(e.a[0],e.b[0],u),mix(e.a[1],e.b[1],u));}c.stroke();}
 // tia sáng chớp tại điểm vỡ đầu tiên
 const flash=Math.exp(-Math.max(0,st.t-T.crack)*5)*(st.t>=T.crack?1:0);halo(c,a.glow,cx,cy,260,260,flash*.9);
 c.restore();
}
// Vòm gương + phản chiếu chính nhân vật (bóng hư ảnh).
export function drawLhMirrors(scene,c,st,v,ghost){
 if(st.t<T.shatter||st.t>=T.absorbed+.2)return;const a=buildAssets(scene,st.H);
 for(const sh of a.shards){if(sh.mirror<0)continue;const pose=mirrorPose(sh,st,v);if(pose.alpha<=.01)continue;
  c.save();c.translate(pose.x,pose.y);c.rotate(pose.rot);c.scale(pose.scale,pose.scale);c.globalAlpha*=pose.alpha;
  path(c,sh.local);c.save();c.clip();c.drawImage(sh.im,sh.bx-sh.cx,sh.by-sh.cy,sh.bw,sh.bh);
  // mặt gương tối dần thành kính hư không; trong gương là bóng phản chiếu nhân vật
  const dark=ease((st.t-T.mirrors-.6)/1.2);c.globalAlpha=pose.alpha*dark*.82;c.fillStyle='#120c34';c.fillRect(-sh.bw,-sh.bh,sh.bw*2,sh.bh*2);
  if(ghost&&st.reflect>0){const s=Math.max(sh.bw,sh.bh)/760*1.3;c.globalAlpha=pose.alpha*st.reflect*.9;c.drawImage(ghost,-320*s,-430*s,640*s,760*s);}
  c.restore();c.globalCompositeOperation='screen';c.globalAlpha=pose.alpha*(.55+.35*Math.sin(st.clock*2+sh.mirror));c.strokeStyle=sh.mirror%2?C.teal:C.violet;c.lineWidth=7/Math.max(.25,pose.scale);path(c,sh.local);c.stroke();c.globalAlpha=pose.alpha*.9;c.strokeStyle=C.white;c.lineWidth=2/Math.max(.25,pose.scale);c.stroke();c.restore();
  halo(c,a.glow,pose.x,pose.y,260*pose.scale*Math.max(sh.bw,sh.bh)/215,260*pose.scale*Math.max(sh.bw,sh.bh)/215,st.gather*(1-st.enter)*.22);
  if(st.disk>0&&st.t<T.absorbed)halo(c,a.glow,pose.x,pose.y,60,60,st.disk*.5);}
 // Hư Không Kính: đĩa hợp nhất trước ngực
 if(st.disk>.3&&st.t<T.absorbed+.1){const r=58*(1-st.enter*.8);c.save();c.globalCompositeOperation='screen';c.globalAlpha=(st.disk-.3)*1.4*(1-ease((st.t-T.absorbed)/.12));c.strokeStyle=C.white;c.lineWidth=2.5;c.beginPath();c.ellipse(450,st.belly-25+st.enter*35,r,r*.92,0,0,TAU);c.stroke();c.strokeStyle=C.gold;c.lineWidth=1.2;c.beginPath();c.ellipse(450,st.belly-25+st.enter*35,r*.72,r*.66,0,0,TAU);c.stroke();c.restore();halo(c,a.glow,450,st.belly-25+st.enter*35,r*3.2,r*3.2,st.disk*.55);}
}
// Phân thân: bóng trong gương bước ra, mỗi cặp đỡ một nhát rách hư không rồi vỡ thành ánh sáng.
export function lhCloneBreak(k,st){const hit=LH_RIFTS[Math.floor(k/2)]+.2;return st.t<hit?0:clamp((st.t-hit)/.7);}
export function drawLhClones(scene,c,st,v,ghost,layer){
 if(!ghost||st.t<T.clones||st.t>T.eye+1.2)return;const a=buildAssets(scene,st.H);
 for(let k=0;k<8;k++){const pos=lhClonePos(k,st);if((layer==='back')!==pos.back)continue;const born=st.clones[k],br=lhCloneBreak(k,st);if(born<=0||br>=1)continue;
  const slot=lhMirrorSlot(k,st),x=mix(slot.x,pos.x,born),y=mix(slot.y+80,pos.y,born),s=mix(.18,pos.s,born)*(1+br*.15);
  halo(c,a.glow,x,y-200*s,300*s,560*s,born*(1-br)*.5);c.save();c.globalAlpha=born*(1-br)*.78*st.fade;c.drawImage(ghost,x-320*s,y-590*s,640*s,760*s);c.globalCompositeOperation='screen';c.globalAlpha=born*(1-br)*.35;c.drawImage(ghost,x-320*s,y-590*s,640*s,760*s);c.restore();
  halo(c,a.glow,x,y-150*s,160*s,320*s,born*(1-br)*.35);
  if(br>0){c.save();c.globalCompositeOperation='screen';for(let i=0;i<14;i++){const ang=i*2.399+k,dist=br*(60+rnd(i+k*20)*120);c.globalAlpha=(1-br)*.9;c.fillStyle=i%2?C.violet:C.teal;c.save();c.translate(x+Math.cos(ang)*dist,y-150*s+Math.sin(ang)*dist);c.rotate(ang+br*4);c.fillRect(-2,-8,4,16);c.restore();}
   // ánh sáng vỡ ra chảy về đan điền của bản thể
   const pts=[];for(let j=0;j<=16;j++){const u=j/16;pts.push([mix(x,450,u),mix(y-150*s,st.belly,u)-Math.sin(u*Math.PI)*90]);}
   c.globalAlpha=(1-br)*.55;c.strokeStyle=C.teal;c.lineWidth=2;c.beginPath();pts.forEach(([px,py],j)=>j?c.lineTo(px,py):c.moveTo(px,py));c.stroke();const q=pts[Math.min(16,Math.floor(br*16))];c.restore();halo(c,a.glow,q[0],q[1],40,40,(1-br));}
 }
}
// 4 vết rách hư không: mở từ mép màn hình, chém tới cặp phân thân thì bị chặn.
export function drawLhRifts(scene,c,st,v){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light';
 LH_RIFTS.forEach((at,p)=>{const age=st.t-at;if(age<-.05||age>.9)return;const open=ease(age/.18)*(1-ease((age-.45)/.4));if(open<=0)return;
  const side=p<2?-1:1,k=p*2,tgt=lhClonePos(k,st),tgt2=lhClonePos(k+1,st),tx=(tgt.x+tgt2.x)/2,ty=(tgt.y+tgt2.y)/2-120,sx=side>0?960:-60,sy=st.H*(.12+p*.09);
  const reach=ease(age/.2),ex=mix(sx,tx,reach),ey=mix(sy,ty,reach),dx=ex-sx,dy=ey-sy,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L,pts=[];
  for(let i=0;i<=14;i++){const u=i/14,j=(rnd(p*31+i)-.5)*40*Math.sin(u*Math.PI);pts.push([sx+dx*u+nx*j,sy+dy*u+ny*j]);}
  const w=open*26;c.save();
  // lõi đen của vết rách + viền sáng
  c.beginPath();pts.forEach(([x,y],i)=>{const ww=w*Math.sin(i/14*Math.PI);i?c.lineTo(x+nx*ww,y+ny*ww):c.moveTo(x+nx*ww,y+ny*ww);});for(let i=14;i>=0;i--){const [x,y]=pts[i],ww=w*Math.sin(i/14*Math.PI);c.lineTo(x-nx*ww,y-ny*ww);}c.closePath();c.fillStyle='#030008';c.globalAlpha=open*.95;c.fill();
  c.globalCompositeOperation='screen';for(const [lw,col,al] of [[light?6:12,C.violet,.35],[2,C.white,.95]]){c.lineWidth=lw;c.strokeStyle=col;c.globalAlpha=open*al;c.stroke();}
  c.restore();if(age>.18&&age<.5)halo(c,a.glow,ex,ey,240,240,(1-(age-.18)/.32)*.8);});
}
// Hư nhãn trên đầu: hố đen + vòng bồi tụ + vành thấu kính; sao và mảnh vụn xoáy vào.
export function drawLhEye(scene,c,st,v){
 if(st.eye<=0)return;const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',x=450,y=st.H*.2,r=90+st.eye*60,dir=v.flip?-1:1;
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<4;i++){c.globalAlpha=st.eye*(.6-i*.1);c.strokeStyle=i%2?C.teal:C.violet;c.lineWidth=3-i*.5;c.beginPath();c.ellipse(x,y,r*(1.6+i*.45),r*(1.6+i*.45)*.42,dir*.12,0,TAU);c.stroke();}
 const n=light?36:80;for(let i=0;i<n;i++){const u=(st.clock*.35+i/n)%1,ang=i*2.399+dir*st.clock*1.6+u*4*dir,rr=(1-u)*(r*5.2)+r*.9;c.globalAlpha=st.eye*Math.sin(u*Math.PI)*.85;c.fillStyle=i%5?'#e9e4ff':C.gold;c.fillRect(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr*.42,1.6+(1-u)*2,1.6);}
 c.restore();
 c.save();c.globalAlpha=st.eye;const g=c.createRadialGradient(x,y,r*.55,x,y,r*1.15);g.addColorStop(0,'#000000');g.addColorStop(.8,'#05020f');g.addColorStop(1,'#05020f00');c.fillStyle=g;c.beginPath();c.arc(x,y,r*1.15,0,TAU);c.fill();c.restore();
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=st.eye*.9;c.strokeStyle=C.white;c.lineWidth=2.5;c.beginPath();c.arc(x,y,r*.62,0,TAU);c.stroke();c.strokeStyle=C.gold;c.lineWidth=1.2;c.setLineDash([10,14]);c.lineDashOffset=-st.clock*60*dir;c.beginPath();c.ellipse(x,y,r*1.2,r*.5,dir*.12,0,TAU);c.stroke();c.setLineDash([]);c.restore();
 // dây lực kéo từ đỉnh đầu nhân vật lên hư nhãn (cảm giác bị hút)
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=st.pull*.5;c.strokeStyle=C.violet;c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(450+i*24,st.feet-420);c.quadraticCurveTo(450+i*40,(st.feet-420+y)/2,x+i*6,y+r);c.stroke();}c.restore();
}
// Khí chạy dọc thân (dừng ở vai, không vẽ qua mặt) và quầng đan điền.
export function drawLhBody(scene,c,st){
 const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',charge=clamp((st.t-T.rifts)/5),power=(.3+charge*.7)*st.fade*(st.t<T.impact?1:.4);
 c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?6:12);i++){const side=i%2?1:-1,u=(st.clock*.8+i*.173)%1,x=450+side*(40+Math.sin(u*Math.PI)*48),y=st.feet-30-u*280;c.globalAlpha=power*Math.sin(u*Math.PI)*.45;c.strokeStyle=i%3?C.violet:C.teal;c.lineWidth=i%4?1.3:2.4;c.beginPath();c.moveTo(x-side*8,y+26);c.quadraticCurveTo(x+side*12,y+6,x,y-16);c.stroke();}c.restore();
 halo(c,a.glow,450,st.belly,110+st.compression*120,110+st.compression*120,power*.14+st.compression*.6);
}
// Nổ: mạng nứt toàn màn lóe sáng một lần, sóng áp lực, mảnh vụn văng theo quỹ đạo rơi.
export function drawLhBreak(scene,c,st,v){
 if(st.t<T.impact)return;const a=buildAssets(scene,st.H),light=scene.budget?.level==='light',age=st.t-T.impact;
 for(let i=0;i<7;i++){const u=clamp((age-i*.085)/1.3);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*.75*(st.motion?1:.3);c.strokeStyle=i%2?C.teal:C.violet;c.lineWidth=5*(1-u)+1;c.beginPath();const R=50+ease(u)*860;c.ellipse(450,i%2?st.feet+50:st.belly,R,R*(i%2?.25:.8),0,0,TAU);c.stroke();c.restore();}
 for(let i=0;i<(light?14:34);i++){const u=clamp(age/1.7),ang=i*2.399+v.phase,dist=u*(300+rnd(i)*460),x=450+Math.cos(ang)*dist,y=st.belly+Math.sin(ang)*dist*.7+u*u*190;c.save();c.globalCompositeOperation='screen';c.globalAlpha=(1-u)*.85;c.translate(x,y);c.rotate(i+u*6);c.fillStyle=i%3?C.violet:C.white;c.beginPath();c.moveTo(0,-14);c.lineTo(6,2);c.lineTo(0,12);c.lineTo(-5,0);c.closePath();c.fill();c.restore();}
 halo(c,a.glow,450,st.belly,760,760,Math.exp(-age*6)*.3);
}
// Dư âm sau khi hiện thân: vòng kính mảnh sau lưng, 3 mảnh nhỏ quay chậm. Không chồng lên mặt.
export function drawLhAfter(scene,c,st,v){
 if(st.after<=0)return;const a=buildAssets(scene,st.H),p=st.after*st.fade;c.save();c.globalCompositeOperation='screen';
 c.globalAlpha=p*.55;c.strokeStyle=C.violet;c.lineWidth=2;c.beginPath();c.ellipse(450,st.feet-330,175,175,0,0,TAU);c.stroke();c.globalAlpha=p*.35;c.strokeStyle=C.teal;c.beginPath();c.ellipse(450,st.feet-330,190,190,0,0,TAU);c.stroke();
 for(let i=0;i<3;i++){const ang=st.clock*.7*(v.flip?-1:1)+i*TAU/3,x=450+Math.cos(ang)*200,y=st.feet-330+Math.sin(ang)*200;c.globalAlpha=p*.85;c.fillStyle=C.white;c.save();c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(0,-10);c.lineTo(5,3);c.lineTo(0,9);c.lineTo(-4,0);c.closePath();c.fill();c.restore();}
 c.restore();halo(c,a.glow,450,st.feet-330,420,420,p*.12);
}
export function drawLhEdges(scene,c,st){const a=buildAssets(scene,st.H);c.drawImage(a.vignette,0,0,900,st.H);
 const p=st.t<T.impact?(.06+st.pull*.14+st.compression*.3):Math.exp(-(st.t-T.impact)*4)*.55;for(const x of [0,900])for(const y of [0,st.H])halo(c,a.glow,x,y,520,760,p*st.fade);}
