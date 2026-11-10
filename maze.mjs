// 10/11/2026 (chủ game): BÍ CẢNH MÊ CUNG — cả sân chung MỘT mê cung, ai cũng xuất phát ở mốc (giữa đáy),
// mỗi người tự đi đường riêng bằng lệnh chat, MỖI TIN 1 BƯỚC: len / xuong / trai / phai (có dấu cũng được; l x t p khi đã vào).
// Mở tay từ tab Sự kiện. Tuyển 40 s (gõ "mecung"; đang chạy gõ mecung hoặc lệnh đi đầy đủ là vào luôn từ mốc).
// Quà = soi đường (hiện lối đi vài bước) / dịch chuyển tiến N bước theo đường ngắn nhất. Tim không có tác dụng (tránh mồi tương tác).
// Top 1–3 ra cửa nhận thưởng lớn, ai ra cửa cũng có thưởng; ai đi ≥10 bước nhận chút an ủi.
import {stageConflict} from './stage-lock.mjs';

export const MAZE=Object.freeze({cols:9,rows:13,registerMs:40000,runMs:240000,afterTop3Ms:30000,podiumMs:15000,moveGapMs:300,maxRunners:400,
 hint:[[500,16],[99,14],[20,12],[1,8]],jump:[[500,24],[99,10],[20,4]],hintMs:30000,braid:.1,targetDist:46,
 reward:{pct:[.04,.03,.02],finisherPct:.01,triedPct:.003,triedSteps:10,stones:[30,20,15],finisherStones:10,triedStones:3},titleMs:3600000});
const real=p=>p&&!p.resident&&!p.puppet;
export const mazeActive=w=>['queued','registration','running'].includes(w.maze?.phase);
export const mazeVisible=(w,now)=>['registration','running'].includes(w.maze?.phase)||w.maze?.podiumUntil>now;
const announce=(w,p,text,now,c,extra={})=>c.emit(w,p,text,'maze',now,{maze:true,...extra});
// Hướng: [dx,dy]. Lệnh đầy đủ (auto vào mê cung) và lệnh tắt (chỉ khi đã vào).
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
const FULL={len:'up',xuong:'down',trai:'left',phai:'right'},SHORT={l:'up',x:'down',t:'left',p:'right'};
export const MAZE_JOIN=['mecung'];

function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
// Ô (x,y) giữ 2 bit: 1 = tường phía đông, 2 = tường phía nam. Viền ngoài luôn là tường.
export const wallE=(m,x,y)=>x>=m.cols-1||(m.cells[y*m.cols+x]&1)!==0;
export const wallS=(m,x,y)=>y>=m.rows-1||(m.cells[y*m.cols+x]&2)!==0;
export function canMove(m,x,y,dir){const [dx,dy]=DIRS[dir];const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=m.cols||ny>=m.rows)return false;
 if(dx===1)return !wallE(m,x,y);if(dx===-1)return !wallE(m,nx,ny);if(dy===1)return !wallS(m,x,y);return !wallS(m,nx,ny);}
// Mê cung hoàn hảo (đào ngẫu nhiên kiểu backtracker) rồi phá thêm ~10% tường để có vài vòng — lạc vẫn tìm lại được.
export function generateMaze(seed,cols=MAZE.cols,rows=MAZE.rows){
 const r=rng(seed),cells=new Array(cols*rows).fill(3),seen=new Uint8Array(cols*rows),stack=[[Math.floor(cols/2),rows-1]];seen[(rows-1)*cols+Math.floor(cols/2)]=1;
 while(stack.length){const [x,y]=stack[stack.length-1],opts=[];for(const [dx,dy] of Object.values(DIRS)){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<cols&&ny<rows&&!seen[ny*cols+nx])opts.push([nx,ny,dx,dy]);}
  if(!opts.length){stack.pop();continue;}const [nx,ny,dx,dy]=opts[Math.floor(r()*opts.length)];
  if(dx===1)cells[y*cols+x]&=~1;else if(dx===-1)cells[ny*cols+nx]&=~1;else if(dy===1)cells[y*cols+x]&=~2;else cells[ny*cols+nx]&=~2;
  seen[ny*cols+nx]=1;stack.push([nx,ny]);}
 for(let i=0;i<cols*rows;i++){const x=i%cols,y=Math.floor(i/cols);if(x<cols-1&&(cells[i]&1)&&r()<MAZE.braid)cells[i]&=~1;if(y<rows-1&&(cells[i]&2)&&r()<MAZE.braid)cells[i]&=~2;}
 const m={cols,rows,cells,start:{x:Math.floor(cols/2),y:rows-1},exit:{x:Math.floor(cols/2),y:0},seed};m.dist=distances(m);return m;
}
// Khoảng cách (số bước) từ mọi ô tới cửa ra — dùng xếp hạng người chưa ra, soi đường, dịch chuyển.
export function distances(m){const d=new Array(m.cols*m.rows).fill(-1),q=[[m.exit.x,m.exit.y]];d[m.exit.y*m.cols+m.exit.x]=0;
 for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const dir of Object.keys(DIRS))if(canMove(m,x,y,dir)){const [dx,dy]=DIRS[dir],nx=x+dx,ny=y+dy,k=ny*m.cols+nx;if(d[k]<0){d[k]=d[y*m.cols+x]+1;q.push([nx,ny]);}}}
 return d;}
function pickMaze(seed){let best=null;for(let i=0;i<8;i++){const m=generateMaze(seed+i*7919),d=m.dist[m.start.y*m.cols+m.start.x];if(!best||Math.abs(d-MAZE.targetDist)<Math.abs(best.d-MAZE.targetDist))best={m,d};}return best.m;}
// Đường ngắn nhất từ (x,y) đi n bước về phía cửa.
export function pathAhead(m,x,y,n){const out=[];for(let i=0;i<n;i++){const k=m.dist[y*m.cols+x];if(k<=0)break;let next=null;for(const dir of Object.keys(DIRS))if(canMove(m,x,y,dir)){const [dx,dy]=DIRS[dir];if(m.dist[(y+dy)*m.cols+x+dx]===k-1){next=[x+dx,y+dy];break;}}if(!next)break;[x,y]=next;out.push([x,y]);}return out;}
const distOf=(e,r)=>e.maze.dist[r.y*e.maze.cols+r.x];
const tier=(table,coins)=>table.find(([min])=>coins>=min)?.[1]||0;

function register(w,now,c){
 const seed=(now^Math.floor(Math.random()*2**31))>>>0;
 w.maze={id:'maze-'+now,phase:'registration',seed,maze:pickMaze(seed),registrationEndsAt:now+MAZE.registerMs,runners:[],finished:0};
 announce(w,null,'BÍ CẢNH MÊ CUNG • gõ mecung để vào • tất cả xuất phát ở mốc, mỗi người tự tìm đường ra',now,c,{mazeStart:true});
}
export function startMaze(w,now,c){if(mazeActive(w))return {ok:false,message:'Mê cung đang mở.'};
 if(stageConflict(w,now)){w.maze={id:'maze-q'+now,phase:'queued'};return {ok:true,queued:true};}
 register(w,now,c);return {ok:true};}
export function stopMaze(w,now){const e=w.maze;if(!e||!mazeActive(w))return {ok:false,message:'Không có mê cung đang mở.'};e.phase='cancelled';e.podiumUntil=0;return {ok:true};}
function addRunner(w,e,p,now){if(e.runners.length>=MAZE.maxRunners)return null;let r=e.runners.find(x=>x.id===p.id);if(r)return r;
 r={id:p.id,name:p.name,x:e.maze.start.x,y:e.maze.start.y,steps:0,at:now,lastMoveAt:0,finishAt:0,rank:0};e.runners.push(r);return r;}
function arrive(w,e,r,now,c){if(r.finishAt||distOf(e,r)!==0)return;r.finishAt=now;r.rank=++e.finished;
 if(r.rank===3)e.endsAt=Math.min(e.endsAt,now+MAZE.afterTop3Ms);
 const p=w.players[r.id];if(r.rank<=3)announce(w,p,`THOÁT MÊ CUNG HẠNG ${r.rank} • ${r.steps} bước`,now,c,{mazeFinishRank:r.rank});}
// Lệnh chat. undefined = không phải lệnh mê cung.
export function mazeCommand(w,p,cmd,now,c){
 const e=w.maze;if(!e||!['registration','running'].includes(e.phase)||!cmd)return;
 if(MAZE_JOIN.includes(cmd)){if(!real(p))return {ok:false,message:'NPC không vào mê cung.'};
  if(e.phase==='registration'){if(now>=e.registrationEndsAt)return;if(e.runners.some(r=>r.id===p.id))return {ok:true,duplicate:true};const r=addRunner(w,e,p,now);if(!r)return {ok:false,message:'Mê cung đã đủ người.'};p.interactions++;return {ok:true,maze:true};}
  const had=e.runners.some(r=>r.id===p.id),r=addRunner(w,e,p,now);if(!r)return {ok:false,message:'Mê cung đã đủ người.'};return {ok:true,maze:true,duplicate:had};}
 if(e.phase!=='running')return;
 let r=e.runners.find(x=>x.id===p.id);const dir=FULL[cmd]||(r?SHORT[cmd]:null);if(!dir)return;
 if(!r){if(!real(p))return;r=addRunner(w,e,p,now);if(!r)return {ok:false,message:'Mê cung đã đủ người.'};}
 if(r.finishAt)return {ok:true,duplicate:true};
 if(now-r.lastMoveAt<MAZE.moveGapMs)return {ok:true,duplicate:true};
 r.lastMoveAt=now;r.dir=dir;
 if(!canMove(e.maze,r.x,r.y,dir)){r.bumpAt=now;return {ok:true,blocked:true};}
 const [dx,dy]=DIRS[dir];r.x+=dx;r.y+=dy;r.steps++;r.moveAt=now;arrive(w,e,r,now,c);return {ok:true,maze:true};
}
// Quà lúc tuyển: vào mê cung. Lúc đang chạy: soi đường + (≥20 coin) dịch chuyển tiến theo đường ngắn nhất. Người chưa vào thì tặng quà là vào luôn.
export function mazeGift(w,p,coins,now,c){
 const e=w.maze;if(!real(p)||!(coins>0))return null;
 if(e?.phase==='registration'){const had=e.runners.some(r=>r.id===p.id);return addRunner(w,e,p,now)?{moved:0,hint:0,text:had?'đã ở trong mê cung':'vào mê cung'}:null;}
 if(e?.phase!=='running')return null;
 const r=addRunner(w,e,p,now);if(!r||r.finishAt)return null;
 const jump=tier(MAZE.jump,coins),hint=tier(MAZE.hint,coins);let moved=0;
 if(jump){const path=pathAhead(e.maze,r.x,r.y,jump);if(path.length){r.jumpFrom=[r.x,r.y];[r.x,r.y]=path[path.length-1];r.steps+=path.length;moved=path.length;r.moveAt=now;r.jumpAt=now;}}
 r.giftAt=now;r.giftCoins=coins;
 if(distOf(e,r)===0)arrive(w,e,r,now,c);
 else r.hint={cells:pathAhead(e.maze,r.x,r.y,hint),until:now+MAZE.hintMs};
 return {moved,hint:r.finishAt?0:hint,text:moved?`dịch chuyển ${moved} bước`+(r.finishAt?' • ra cửa':' • soi đường'):'soi đường '+hint+' bước'};
}
function award(w,e,now,c){if(e.awarded)return;e.awarded=true;const R=MAZE.reward;
 for(const r of e.runners){const p=w.players[r.id];if(!real(p))continue;const i=r.rank-1,fin=r.finishAt>0;
  if(!fin&&r.steps<R.triedSteps)continue;
  const pct=fin?(R.pct[i]??R.finisherPct):R.triedPct,stones=fin?(R.stones[i]??R.finisherStones):R.triedStones;
  r.qi=c.gain(w,p,Math.max(10,Math.round((c.requiredQi?.(p)||300)*pct)),stones,0,now);
  if(r.rank===1)p.funTitle={name:'Mê Cung Chi Chủ',until:now+MAZE.titleMs};}
}
export function mazeRanking(e){return [...(e?.runners||[])].sort((a,b)=>(a.finishAt?0:1)-(b.finishAt?0:1)||(a.rank||0)-(b.rank||0)||distOf(e,a)-distOf(e,b)||a.at-b.at);}
export function tickMaze(w,now,c){
 const e=w.maze;if(!e)return;
 if(e.phase==='queued'){if(!stageConflict(w,now))register(w,now,c);return;}
 if(e.phase==='registration'&&now>=e.registrationEndsAt){
  e.runners=e.runners.filter(r=>w.players[r.id]);
  if(!e.runners.length){e.phase='finished';e.podiumUntil=now+4000;e.results=[];announce(w,null,'Bí cảnh mê cung khép lại • chưa có đạo hữu nào vào',now,c,{mazeEmpty:true});return;}
  e.phase='running';e.startedAt=now;e.endsAt=now+MAZE.runMs;for(const r of e.runners)r.at=now;
  announce(w,null,'MÊ CUNG MỞ CỬA • gõ len / xuong / trai / phai • mỗi tin 1 bước',now,c,{mazeRun:true});return;}
 if(e.phase==='running'&&(now>=e.endsAt||e.runners.length&&e.runners.every(r=>r.finishAt))){
  e.phase='finished';e.finishedAt=now;e.podiumUntil=now+MAZE.podiumMs;award(w,e,now,c);
  e.results=mazeRanking(e).slice(0,5).map(r=>({id:r.id,name:r.name,rank:r.rank,steps:r.steps,left:distOf(e,r),qi:r.qi||0}));
  const top=e.results[0];announce(w,top?.rank?w.players[top.id]:null,top?.rank?`MÊ CUNG CHI CHỦ • ${top.name} • ${e.finished} người thoát`:'Mê cung khép lại • chưa ai tìm ra lối thoát',now,c,{mazeEnd:true,mazeWinner:top?.rank?top.name:null,mazeFinished:e.finished});
  w.nextBossAt=Math.max(w.nextBossAt||0,now+(w.settings?.bossInterval??240)*1000);}
}
// Gửi xuống cảnh: mê cung (chuỗi số mỗi ô), người chạy rút gọn (tối đa 300, ưu tiên gần cửa).
export function mazeView(w,now){
 const e=w.maze;if(!e||e.phase==='cancelled'||e.phase==='queued')return e?.phase==='queued'?{id:e.id,phase:'queued',active:false}:null;
 if(!mazeVisible(w,now))return null;const m=e.maze;
 const runners=mazeRanking(e).slice(0,300).map(r=>({id:r.id,n:r.name,x:r.x,y:r.y,s:r.steps,d:distOf(e,r),f:r.finishAt||0,r:r.rank||0,m:r.moveAt||0,b:r.bumpAt||0,g:r.giftAt||0,j:r.jumpAt||0,h:r.hint?.until>now?r.hint.cells:undefined}));
 return {id:e.id,phase:e.phase,active:true,cols:m.cols,rows:m.rows,cells:m.cells.join(''),start:m.start,exit:m.exit,startDist:m.dist[m.start.y*m.cols+m.start.x],
  registrationEndsAt:e.registrationEndsAt,startedAt:e.startedAt,endsAt:e.endsAt,count:e.runners.length,finished:e.finished,runners,results:e.results||null,finishedAt:e.finishedAt,podiumUntil:e.podiumUntil};
}
