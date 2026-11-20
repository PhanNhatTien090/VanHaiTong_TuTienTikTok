// 20/11/2026 (chủ game: "nổ thì phải có các hạt bắn tung tóe ra mới đã — vừa rung giật vừa chói lói, sau đó bắn tung tóe
// rồi nảy xung quanh"). Lớp MẢNH VỠ dùng chung cho mọi cú nổ/đòn đánh:
//  1) chớp lõi trắng nóng + vòng chói (0–.15 s)
//  2) tia lửa nhanh xé ra rồi tắt (0–.5 s)
//  3) mảnh vỡ văng lên, rơi theo trọng lực, NẢY 2–3 lần trên mặt đất, trượt rồi tắt (tới ~1,5 s); bóng đổ khi gần đất
//  4) tàn lửa bay lên chậm
// Thuần hàm của thời gian (sec) + seed → tua/chụp được, không Math.random, nhiều cú nổ cùng lúc không tốn bộ nhớ.
const TAU=Math.PI*2,G=1700,clamp=v=>Math.max(0,Math.min(1,v));
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export const DEBRIS_LIFE=1.55;
const cache=new Map();
function particles(seed,n){
 const key=seed+':'+n;let list=cache.get(key);if(list)return list;list=[];
 for(let i=0;i<n;i++){const r=j=>rnd(seed*13.7+i*7.31+j*1.913);
  const kind=i%7===6?'ember':i%3===1?'spark':'shard'; // ~55% mảnh vỡ, ~30% tia lửa, ~15% tàn lửa
  // quạt văng chủ yếu lên trên, có cả sang ngang để rơi xuống nảy quanh
  const a=-Math.PI*(.06+.88*r(1))+(r(9)-.5)*.35,sp=kind==='spark'?620+640*r(2):kind==='ember'?90+120*r(2):300+520*r(2);
  list.push({kind,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(kind==='shard'?120*r(3):0),size:kind==='shard'?7+10*r(4):kind==='spark'?2.5+2.5*r(4):3+4*r(4),spin:(r(5)-.5)*22,rot:r(6)*TAU,life:kind==='spark'?.32+.25*r(7):kind==='ember'?.9+.6*r(7):1.05+.45*r(7),e:.38+.16*r(8),hot:r(10)<.4});
 }
 cache.set(key,list);if(cache.size>64)cache.delete(cache.keys().next().value);return list;
}
// Vị trí sau t giây, có nảy trên mặt đất (y=floor). Trả {x,y,vy,rest}.
function at(p,x0,y0,floor,t,scale){
 let x=x0,y=y0,vx=p.vx*scale,vy=p.vy*scale,rem=t,g=G*scale;
 for(let b=0;b<4;b++){
  const dy=y-floor,disc=vy*vy-2*g*dy,th=disc>=0?(-vy+Math.sqrt(disc))/g:Infinity;
  if(!(th>0)||th>=rem){return {x:x+vx*rem,y:Math.min(floor,y+vy*rem+.5*g*rem*rem),vy:vy+g*rem,rest:false};}
  x+=vx*th;y=floor;const vImp=vy+g*th;rem-=th;vy=-vImp*p.e;vx*=.62;
  if(Math.abs(vy)<70*scale){const slide=(1-Math.exp(-rem*5))/5;return {x:x+vx*slide,y:floor,vy:0,rest:true};}
 }
 return {x,y:floor,vy:0,rest:true};
}
/**
 * Vẽ lớp mảnh vỡ tại (x,y); floor = cao độ mặt đất để nảy (mặc định y+120·scale).
 * opts: seed, power (1 thường · 2 mạnh · 3 tuyệt kỹ), color, hot, scale, light (ít hạt), flash (chớp lõi), shadow
 */
export function drawDebris(c,x,y,sec,{floor=null,seed=1,power=1,color='#9fe6ff',hot='#ffffff',scale=1,light=false,flash=true,shadow=true}={}){
 if(sec<0||sec>DEBRIS_LIFE)return;const P=Math.max(.6,Math.min(3,power)),fy=floor??y+120*scale;
 const n=Math.round((light?16:30)*(.7+.3*P)),list=particles(Math.floor(seed*1000)%100000,n),sc=scale*(.85+.15*P);
 c.save();
 // 1) chớp lõi trắng nóng + vòng chói
 if(flash&&sec<.2){const u=sec/.2,r=(22+90*(1-Math.pow(1-u,3)))*Math.sqrt(sc);c.globalCompositeOperation='lighter';
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,'+(1-u)+')');g.addColorStop(.35,hot);g.addColorStop(.6,color);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=(1-u)*.9;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  c.globalAlpha=(1-u)*.8;c.strokeStyle=hot;c.lineWidth=(6*(1-u)+1)*Math.sqrt(sc);c.beginPath();c.ellipse(x,y,r*1.5,r*1.0,0,0,TAU);c.stroke();}
 // bóng đổ trên đất (vẽ trước để nằm dưới mảnh)
 if(shadow){c.globalCompositeOperation='source-over';c.fillStyle='#000';for(const p of list){if(p.kind!=='shard'||sec>p.life)continue;const q=at(p,x,y,fy,sec,sc),h=fy-q.y;if(h>90*sc)continue;c.globalAlpha=.28*(1-h/(90*sc))*(1-clamp((sec-p.life*.7)/(p.life*.3)));c.beginPath();c.ellipse(q.x,fy+2,p.size*sc*1.1,p.size*sc*.35,0,0,TAU);c.fill();}}
 // 2) tia lửa + 4) tàn lửa (cộng sáng)
 c.globalCompositeOperation='lighter';c.lineCap='round';
 for(const p of list){if(p.kind==='shard'||sec>p.life)continue;const life=1-sec/p.life;
  if(p.kind==='spark'){const q=at(p,x,y,fy+400,sec,sc),q0=at(p,x,y,fy+400,Math.max(0,sec-.035),sc);c.globalAlpha=life;c.strokeStyle=p.hot?hot:color;c.lineWidth=p.size*sc*(.6+.4*life);c.beginPath();c.moveTo(q0.x,q0.y);c.lineTo(q.x,q.y);c.stroke();}
  else{const ex=x+p.vx*sc*sec*.6,ey=y+p.vy*sc*sec*.35-60*sc*sec,s=p.size*sc*(.6+.4*life);c.globalAlpha=life*.85;c.fillStyle=p.hot?hot:color;c.beginPath();c.arc(ex+Math.sin(sec*6+p.rot)*8*sc,ey,s,0,TAU);c.fill();}}
 // 3) mảnh vỡ nảy: thân màu + mép nóng, vệt sáng khi bay nhanh
 for(const p of list){if(p.kind!=='shard'||sec>p.life)continue;const q=at(p,x,y,fy,sec,sc),fade=1-clamp((sec-p.life*.7)/(p.life*.3)),s=p.size*sc,heat=clamp(1-sec/.45);
  if(!q.rest&&Math.abs(q.vy)>220*sc){const q0=at(p,x,y,fy,Math.max(0,sec-.03),sc);c.globalCompositeOperation='lighter';c.globalAlpha=.55*fade;c.strokeStyle=color;c.lineWidth=s*.9;c.beginPath();c.moveTo(q0.x,q0.y);c.lineTo(q.x,q.y);c.stroke();}
  const rot=p.rot+p.spin*Math.min(sec,q.rest?sec*.4:sec);c.save();c.translate(q.x,q.y-(q.rest?s*.3:0));c.rotate(rot);
  c.globalCompositeOperation='source-over';c.globalAlpha=fade;c.beginPath();c.moveTo(-s,0);c.lineTo(-s*.1,-s*.6);c.lineTo(s*.95,-s*.05);c.lineTo(s*.15,s*.5);c.closePath();c.fillStyle=color;c.fill();c.lineWidth=Math.max(1,s*.16);c.strokeStyle='rgba(10,8,6,.55)';c.stroke();
  c.fillStyle=hot;c.globalAlpha=fade*(.55+.45*heat);c.beginPath();c.moveTo(-s*.7,-s*.05);c.lineTo(-s*.1,-s*.45);c.lineTo(s*.55,-s*.08);c.closePath();c.fill();
  if(heat>0){c.globalCompositeOperation='lighter';c.globalAlpha=fade*heat*.45;c.fillStyle=hot;c.beginPath();c.arc(0,0,s*.75,0,TAU);c.fill();}c.restore();}
 c.restore();
}
/** Chớp sáng toàn màn rất ngắn (chỉ cho cú nổ lớn). Nhẹ: 1 lần fillRect. */
export function drawScreenFlash(c,W,H,sec,{color='#ffffff',strength=.22}={}){if(sec<0||sec>.12)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=strength*(1-sec/.12);c.fillStyle=color;c.fillRect(-100,-100,W+200,H+200);c.restore();}
// Hồ mảnh vỡ của cảnh: nổ ở đâu thì thả vào, cảnh tự vẽ tới khi hết (sống lâu hơn hiệu ứng đã sinh ra nó).
export function spawnDebris(scene,o){(scene.debris??=[]).push({...o,start:o.start??performance.now()});if(scene.debris.length>14)scene.debris.shift();}
export function drawDebrisPool(scene,c,t,W=900,H=1600){
 const list=scene.debris;if(!list?.length)return;const light=scene.budget?.level==='light'||scene.budget?.pressured||(scene.realPlayers?.length||0)>30;
 for(let i=list.length-1;i>=0;i--){const d=list[i],sec=(t-d.start)/1000;if(sec>DEBRIS_LIFE){list.splice(i,1);continue;}
  if(scene.motion===false){continue;}
  drawDebris(c,d.x,d.y,sec,{...d,light:light||d.light});if(d.screenFlash)drawScreenFlash(c,W,H,sec,{color:d.hot||'#ffffff'});}
}
