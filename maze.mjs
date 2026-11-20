// 10/11/2026 (chủ game): BÍ CẢNH MÊ CUNG — cả sân chung MỘT mê cung, ai cũng xuất phát ở mốc (giữa đáy),
// mỗi người tự đi đường riêng bằng lệnh chat, MỖI TIN 1 BƯỚC: len / xuong / trai / phai (có dấu cũng được; l x t p khi đã vào).
// Mở tay từ tab Sự kiện. Tuyển 40 s (gõ "mecung"; đang chạy gõ mecung hoặc lệnh đi đầy đủ là vào luôn từ mốc).
// 16/11: quà 10/30/99/500 = TỰ ĐI N ô theo đường đúng (chém bay yêu thú trên đường); quà nhỏ (<10) = phá 1 tường; 100 = tốc biến.
// Quà = PHÁ TƯỜNG (10/11, chủ game: "đã dễ rồi còn hướng dẫn" → bỏ soi đường/dịch chuyển): mỗi quà cho N lượt phá,
// đi đâm vào tường thì phá luôn và bước qua (tường mất cho cả sân). Tim không có tác dụng (tránh mồi tương tác).
// Top 1–3 ra cửa nhận thưởng lớn, ai ra cửa cũng có thưởng; ai đi ≥10 bước nhận chút an ủi.
import {stageConflict} from './stage-lock.mjs';

// 10/11 tối (chủ game: "hơi dễ"): 11×15 ô, gần như không có đường vòng (3%), đường ngắn nhất ~85 bước, chạy 5 phút.
export const MAZE=Object.freeze({cols:11,rows:15,registerMs:20000 /* 21/11: cả sân tự vào → không cần chờ gõ mecung 40 s */,runMs:300000,afterTop3Ms:30000,podiumMs:15000,moveGapMs:300,maxRunners:400,
 breaks:[[1,1]],walk:[[500,40],[99,20],[30,9],[10,3]] /* 16/11 (chủ game): 30 coin = 9 ô (trước 6), hạc 99 = 20 ô (trước 12) */,braid:.03,targetDist:85,
 // 16/11 (chủ game: "họ biết chơi hết rồi"): YÊU THÚ chui ra từ hang (ngõ cụt), lang thang; đụng người → đánh văng lùi 1 ô (choáng 1,2 s) rồi tan.
 mob:{dens:4,everyMs:12000,firstMs:8000,lifeMs:45000,stepMs:2000,chase:3,stunMs:1200,base:3,perRunners:15,max:10},
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
// Phá tường giữa (x,y) và ô kế theo hướng dir (không phá viền ngoài). Trả về true nếu đã phá.
export function breakWall(m,x,y,dir){const [dx,dy]=DIRS[dir];const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=m.cols||ny>=m.rows||canMove(m,x,y,dir))return false;
 if(dx===1)m.cells[y*m.cols+x]&=~1;else if(dx===-1)m.cells[ny*m.cols+nx]&=~1;else if(dy===1)m.cells[y*m.cols+x]&=~2;else m.cells[ny*m.cols+nx]&=~2;
 m.dist=distances(m);return true;}
export function canMove(m,x,y,dir){const [dx,dy]=DIRS[dir];const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=m.cols||ny>=m.rows)return false;
 if(dx===1)return !wallE(m,x,y);if(dx===-1)return !wallE(m,nx,ny);if(dy===1)return !wallS(m,x,y);return !wallS(m,nx,ny);}
// Mê cung hoàn hảo (đào ngẫu nhiên kiểu backtracker) rồi phá thêm ~3% tường để có ít vòng — lạc vẫn tìm lại được.
export function generateMaze(seed,cols=MAZE.cols,rows=MAZE.rows){
 const r=rng(seed),cells=new Array(cols*rows).fill(3),seen=new Uint8Array(cols*rows),stack=[[Math.floor(cols/2),rows-1]];seen[(rows-1)*cols+Math.floor(cols/2)]=1;
 while(stack.length){const [x,y]=stack[stack.length-1],opts=[];for(const [dx,dy] of Object.values(DIRS)){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<cols&&ny<rows&&!seen[ny*cols+nx])opts.push([nx,ny,dx,dy]);}
  if(!opts.length){stack.pop();continue;}const [nx,ny,dx,dy]=opts[Math.floor(r()*opts.length)];
  if(dx===1)cells[y*cols+x]&=~1;else if(dx===-1)cells[ny*cols+nx]&=~1;else if(dy===1)cells[y*cols+x]&=~2;else cells[ny*cols+nx]&=~2;
  seen[ny*cols+nx]=1;stack.push([nx,ny]);}
 for(let i=0;i<cols*rows;i++){const x=i%cols,y=Math.floor(i/cols);if(x<cols-1&&(cells[i]&1)&&r()<MAZE.braid)cells[i]&=~1;if(y<rows-1&&(cells[i]&2)&&r()<MAZE.braid)cells[i]&=~2;}
 // cửa ra: ô hàng trên cùng XA mốc nhất (mỗi lượt một chỗ, không còn đi thẳng lên giữa)
 const m={cols,rows,cells,start:{x:Math.floor(cols/2),y:rows-1},exit:{x:Math.floor(cols/2),y:rows-1},seed},fromStart=distances(m);let bx=0;for(let x=0;x<cols;x++)if(fromStart[x]>fromStart[bx])bx=x;
 m.exit={x:bx,y:0};m.dist=distances(m);return m;
}
// Khoảng cách (số bước) từ mọi ô tới cửa ra — dùng xếp hạng người chưa ra, soi đường, dịch chuyển.
export function distances(m){const d=new Array(m.cols*m.rows).fill(-1),q=[[m.exit.x,m.exit.y]];d[m.exit.y*m.cols+m.exit.x]=0;
 for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const dir of Object.keys(DIRS))if(canMove(m,x,y,dir)){const [dx,dy]=DIRS[dir],nx=x+dx,ny=y+dy,k=ny*m.cols+nx;if(d[k]<0){d[k]=d[y*m.cols+x]+1;q.push([nx,ny]);}}}
 return d;}
function pickMaze(seed){let best=null;for(let i=0;i<12;i++){const m=generateMaze(seed+i*7919),d=m.dist[m.start.y*m.cols+m.start.x];if(!best||Math.abs(d-MAZE.targetDist)<Math.abs(best.d-MAZE.targetDist))best={m,d};}return best.m;}
// Đường ngắn nhất từ (x,y) đi n bước về phía cửa.
export function pathAhead(m,x,y,n){const out=[];for(let i=0;i<n;i++){const k=m.dist[y*m.cols+x];if(k<=0)break;let next=null;for(const dir of Object.keys(DIRS))if(canMove(m,x,y,dir)){const [dx,dy]=DIRS[dir];if(m.dist[(y+dy)*m.cols+x+dx]===k-1){next=[x+dx,y+dy];break;}}if(!next)break;[x,y]=next;out.push([x,y]);}return out;}
const distOf=(e,r)=>e.maze.dist[r.y*e.maze.cols+r.x];
const tier=(table,coins)=>table.find(([min])=>coins>=min)?.[1]||0;

// Hang yêu thú: ngõ cụt xa mốc xuất phát và không phải cửa ra.
function pickDens(m,seed){const r=rng(seed^0x9e3779b9),fromStart=distances({...m,exit:m.start}),out=[];
 const opens=(x,y)=>Object.keys(DIRS).filter(d=>canMove(m,x,y,d)).length;
 const cand=[];for(let y=0;y<m.rows;y++)for(let x=0;x<m.cols;x++){if(x===m.exit.x&&y===m.exit.y)continue;if(fromStart[y*m.cols+x]<6)continue;if(opens(x,y)===1)cand.push({x,y});}
 while(cand.length&&out.length<MAZE.mob.dens){const i=Math.floor(r()*cand.length),c=cand.splice(i,1)[0];if(out.every(o=>Math.abs(o.x-c.x)+Math.abs(o.y-c.y)>=4))out.push(c);}
 return out;}
const STEP_DIRS=Object.keys(DIRS);
function knockBack(e,r,now){const m=e.maze,k=m.dist[r.y*m.cols+r.x];let best=null;
 for(const dir of STEP_DIRS)if(canMove(m,r.x,r.y,dir)){const [dx,dy]=DIRS[dir],d=m.dist[(r.y+dy)*m.cols+r.x+dx];if(d>k&&(!best||d>best.d))best={x:r.x+dx,y:r.y+dy,d};}
 const from={x:r.x,y:r.y};if(best){r.x=best.x;r.y=best.y;}r.hitAt=now;r.stunUntil=now+MAZE.mob.stunMs;r.moveAt=now;r.hits=(r.hits||0)+1;
 (e.hits??=[]).push({id:r.id,from,to:{x:r.x,y:r.y},at:now});if(e.hits.length>24)e.hits.shift();}
function mobAt(e,x,y){return (e.mobs||[]).findIndex(o=>o.x===x&&o.y===y);}
function killMob(e,i,now,why){const o=e.mobs[i];if(!o)return;e.mobs.splice(i,1);(e.poofs??=[]).push({x:o.x,y:o.y,at:now,why});if(e.poofs.length>24)e.poofs.shift();}
function tickMobs(e,now){
 const M=MAZE.mob,m=e.maze;e.mobs??=[];if(!e.dens?.length)return;
 e.mobs=e.mobs.filter(o=>{if(now-o.born<M.lifeMs)return true;(e.poofs??=[]).push({x:o.x,y:o.y,at:now,why:'fade'});return false;});
 e.nextMobAt??=(e.startedAt||now)+M.firstMs;
 const alive=e.runners.filter(r=>!r.finishAt).length,cap=Math.min(M.max,M.base+Math.floor(alive/M.perRunners));
 if(now>=e.nextMobAt){e.nextMobAt=now+M.everyMs;const r=rng((e.seed^now)>>>0);for(let n=0;n<2&&e.mobs.length<cap;n++){const d=e.dens[Math.floor(r()*e.dens.length)];if(mobAt(e,d.x,d.y)>=0)continue;e.mobs.push({id:'m'+(e.mobSeq=(e.mobSeq||0)+1),x:d.x,y:d.y,born:now,nextAt:now+M.stepMs,px:d.x,py:d.y});}}
 if(!e.mobs.length)return;
 const byCell=new Map();for(const r of e.runners){if(r.finishAt)continue;const k=r.y*m.cols+r.x;if(!byCell.has(k))byCell.set(k,[]);byCell.get(k).push(r);}
 const rr=rng((e.seed+now)>>>0);
 for(let i=e.mobs.length-1;i>=0;i--){const o=e.mobs[i];if(now<o.nextAt)continue;o.nextAt=now+M.stepMs;
  const opts=STEP_DIRS.filter(d=>canMove(m,o.x,o.y,d)).map(d=>({x:o.x+DIRS[d][0],y:o.y+DIRS[d][1]})).filter(c=>!(c.x===m.start.x&&c.y===m.start.y)&&!(c.x===m.exit.x&&c.y===m.exit.y));
  if(!opts.length)continue;
  // đuổi người gần (≤ chase ô), không thì lang thang, tránh quay đầu
  let pick=opts.find(c=>byCell.has(c.y*m.cols+c.x));
  if(!pick){const near=e.runners.find(r=>!r.finishAt&&Math.abs(r.x-o.x)+Math.abs(r.y-o.y)<=M.chase);if(near)pick=[...opts].sort((a,b)=>Math.abs(a.x-near.x)+Math.abs(a.y-near.y)-Math.abs(b.x-near.x)-Math.abs(b.y-near.y))[0];}
  if(!pick){const fwd=opts.filter(c=>!(c.x===o.px&&c.y===o.py));const pool=fwd.length?fwd:opts;pick=pool[Math.floor(rr()*pool.length)];}
  o.px=o.x;o.py=o.y;o.x=pick.x;o.y=pick.y;
  const victims=byCell.get(o.y*m.cols+o.x);if(victims?.length){for(const r of victims.slice(0,30))knockBack(e,r,now);killMob(e,i,now,'hit');}}
}
function register(w,now,c){
 const seed=(now^Math.floor(Math.random()*2**31))>>>0;
 const maze=pickMaze(seed);w.maze={id:'maze-'+now,phase:'registration',seed,maze,dens:pickDens(maze,seed),mobs:[],registrationEndsAt:now+MAZE.registerMs,runners:[],finished:0};
 announce(w,null,'BÍ CẢNH MÊ CUNG • cả sân tự vào • khai cửa thì gõ lên, xuống, trái, phải để đi • ai ra cửa trước thắng',now,c,{mazeStart:true});
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
 if(r.stunUntil>now)return {ok:true,stunned:true};
 r.lastMoveAt=now;r.dir=dir;
 if(!canMove(e.maze,r.x,r.y,dir)){
  if(!(r.breaks>0)||!breakWall(e.maze,r.x,r.y,dir)){r.bumpAt=now;return {ok:true,blocked:true};}
  r.breaks--;const [bx,by]=DIRS[dir];(e.broken??=[]).push({x:r.x+bx/2,y:r.y+by/2,at:now});if(e.broken.length>24)e.broken.shift();r.breakAt=now;}
 const [dx,dy]=DIRS[dir];r.x+=dx;r.y+=dy;r.steps++;r.moveAt=now;
 const mi=mobAt(e,r.x,r.y);if(mi>=0){killMob(e,mi,now,'hit');knockBack(e,r,now);return {ok:true,maze:true,knocked:true};}
 arrive(w,e,r,now,c);return {ok:true,maze:true};
}
// Quà lúc tuyển: vào mê cung (+ lượt phá tường dùng khi chạy). Lúc đang chạy: thêm lượt phá tường. Người chưa vào thì tặng quà là vào luôn.
// 18/11 (chủ game: quà ≥99 → CHIẾU RIÊNG): Mê Cung — quà ≥99 tự đi = TỐC HÀNH PHÁ TRẬN, đúng 100 = THUẤN DI THẦN THÔNG (tốc biến).
// Đua về đích nên KHÔNG dừng người khác; giờ mê cung cộng thêm đúng thời gian chiếu. Cách ≥6 s, chờ ≤10 s.
export const MAZE_CUT=Object.freeze({min:99,ms:{walk:3600,teleport:3800},gap:6000,maxWait:10000});
export function mazeCut(e,p,kind,extra,now){
 const ms=MAZE_CUT.ms[kind];if(!ms)return null;const start=Math.max(now,e.cutUntil?e.cutUntil+MAZE_CUT.gap:now);if(start-now>MAZE_CUT.maxWait)return null;
 const cut={id:e.id+':cut:'+(e.cutSeq=(e.cutSeq||0)+1),at:start,ms,kind,user:p.id,name:p.name,...extra};e.cutUntil=start+ms;
 const hold=e.cutUntil-Math.max(start,e.heldUntil||0);if(hold>0){if(e.endsAt)e.endsAt+=hold;e.heldUntil=e.cutUntil;}
 (e.cuts??=[]).push(cut);if(e.cuts.length>4)e.cuts.splice(0,e.cuts.length-4);return cut;
}
export function mazeGift(w,p,coins,now,c,{unitCoins=coins}={}){
 const e=w.maze;if(!real(p)||!(coins>0))return null;
 const teleport=unitCoins===100,steps=teleport?0:tier(MAZE.walk,coins),add=teleport||steps?0:tier(MAZE.breaks,coins);
 const walk=r=>{const path=pathAhead(e.maze,r.x,r.y,steps);if(!path.length)return {walk:0,text:'đã sát cửa ra'};
  for(const [x,y] of path){const mi=mobAt(e,x,y);if(mi>=0)killMob(e,mi,now,'slash');}
  const from={x:r.x,y:r.y};[r.x,r.y]=path.at(-1);r.steps+=path.length;r.moveAt=now;r.giftAt=now;r.stunUntil=0;
  (e.walks??=[]).push({id:r.id+':'+now,rid:r.id,name:p.name,from,path,at:now});if(e.walks.length>12)e.walks.shift();
  arrive(w,e,r,now,c);return {walk:path.length,text:`tự đi ${path.length} ô • chém bay yêu thú`};};
 const send=r=>{
  const from={x:r.x,y:r.y},to={...e.maze.exit};
  r.x=to.x;r.y=to.y;r.moveAt=now;r.giftAt=now;
  const fx={id:p.id,name:p.name,from,to,at:now};
  (e.teleports??=[]).push(fx);e.teleports=e.teleports.slice(-12);
  arrive(w,e,r,now,c);return {teleport:true,text:'Tốc biến thẳng tới cửa ra'};
 };
 if(e?.phase==='registration'){const had=e.runners.some(r=>r.id===p.id),r=addRunner(w,e,p,now);if(!r)return null;if(teleport){r.pendingTeleport=true;return {teleport:true,text:'Tốc biến tới cửa ra khi khai trận'};}if(steps){r.pendingWalk=(r.pendingWalk||0)+steps;r.giftAt=now;return {walk:steps,text:(had?'':'vào mê cung • ')+`tự đi ${steps} ô khi khai trận`};}r.breaks=(r.breaks||0)+add;r.giftAt=now;return {breaks:add,text:(had?'':'vào mê cung • ')+`phá ${add} tường`};}
 if(e?.phase!=='running'||now>=e.endsAt)return null;
 const r=addRunner(w,e,p,now);if(!r||r.finishAt)return null;
 if(teleport){const out=send(r);if(coins>=MAZE_CUT.min)mazeCut(e,p,'teleport',{},now);return out;}
 if(steps){const out=walk(r);if(coins>=MAZE_CUT.min&&out.walk)mazeCut(e,p,'walk',{cells:out.walk},now);return out;}
 r.breaks=(r.breaks||0)+add;r.giftAt=now;r.giftCoins=coins;
 return {breaks:add,text:`phá ${add} tường • đâm tường là phá`};
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
  // 21/11 (chủ game: tự vào chơi luôn, không cần gõ): ai đang có mặt ở LIVE tự vào mê cung lúc khai cửa
  for(const p of Object.values(w.players))if(real(p)&&c.active?.(w,p,now)&&!e.runners.some(x=>x.id===p.id))addRunner(w,e,p,now);
  e.runners=e.runners.filter(r=>w.players[r.id]);
  if(!e.runners.length){e.phase='finished';e.podiumUntil=now+4000;e.results=[];announce(w,null,'Bí cảnh mê cung khép lại • chưa có đạo hữu nào vào',now,c,{mazeEmpty:true});return;}
  e.phase='running';e.startedAt=now;e.endsAt=now+MAZE.runMs;for(const r of e.runners)r.at=now;
  for(const r of e.runners){if(!r.pendingTeleport)continue;delete r.pendingTeleport;mazeGift(w,w.players[r.id],100,now,c);}
  for(const r of e.runners){if(!r.pendingWalk)continue;const n=r.pendingWalk;delete r.pendingWalk;const path=pathAhead(e.maze,r.x,r.y,n);if(!path.length)continue;const from={x:r.x,y:r.y};[r.x,r.y]=path.at(-1);r.steps+=path.length;r.moveAt=now;(e.walks??=[]).push({id:r.id+':'+now,rid:r.id,name:r.name,from,path,at:now});}
  announce(w,null,'MÊ CUNG MỞ CỬA • gõ len / xuong / trai / phai • mỗi tin 1 bước',now,c,{mazeRun:true});return;}
 if(e.phase==='running'&&now<e.endsAt)tickMobs(e,now);
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
 const runners=mazeRanking(e).slice(0,300).map(r=>({id:r.id,n:r.name,x:r.x,y:r.y,s:r.steps,d:distOf(e,r),f:r.finishAt||0,r:r.rank||0,m:r.moveAt||0,b:r.bumpAt||0,g:r.giftAt||0,k:r.breaks||0,bk:r.breakAt||0,h:r.hitAt||0}));
 return {id:e.id,phase:e.phase,active:true,cols:m.cols,rows:m.rows,cells:m.cells.join(''),start:m.start,exit:m.exit,startDist:m.dist[m.start.y*m.cols+m.start.x],
  registrationEndsAt:e.registrationEndsAt,startedAt:e.startedAt,endsAt:e.endsAt,count:e.runners.length,finished:e.finished,runners,teleports:(e.teleports||[]).filter(f=>now-f.at<2600),cuts:(e.cuts||[]).filter(x=>now<x.at+x.ms+1500),mobs:(e.mobs||[]).map(o=>[o.x,o.y,o.id]),dens:e.dens||[],hits:(e.hits||[]).filter(h=>now-h.at<1600),poofs:(e.poofs||[]).filter(h=>now-h.at<1200),walks:(e.walks||[]).filter(f=>now-f.at<3500),broken:(e.broken||[]).filter(b=>now-b.at<2500),results:e.results||null,finishedAt:e.finishedAt,podiumUntil:e.podiumUntil};
}
