import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startMaze,stopMaze,giftEventRule} from '../engine.mjs';
import {MAZE,generateMaze,canMove,pathAhead} from '../maze.mjs';
import {stageConflict} from '../stage-lock.mjs';
const N=1800000000000;
function setup(n=4){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<n;i++)ensurePlayer(w,'p'+i,'Người '+i,N);return w;}
const chat=(w,id,text,t)=>action(w,{type:'chat',text,userId:id},t);
const gift=(w,id,coins,t)=>action(w,{type:'gift',userId:id,coins,count:1,eventId:'g'+t+id},t);
const DIRW={up:'len',down:'xuong',left:'trai',right:'phai'};
function dirTo(a,b){return b[0]>a[0]?'right':b[0]<a[0]?'left':b[1]>a[1]?'down':'up';}
function running(w){assert.ok(startMaze(w,N).ok);chat(w,'p0','mê cung',N+10);chat(w,'p1','mecung',N+20);tick(w,N+MAZE.registerMs);assert.equal(w.maze.phase,'running');return N+MAZE.registerMs;}

test('mê cung sinh ra đi được: mọi ô tới được cửa, đường từ mốc đủ dài',()=>{
 for(const seed of [1,42,99999,123456789]){const m=generateMaze(seed);assert.ok(m.dist.every(d=>d>=0),'có ô bị cô lập');const d=m.dist[m.start.y*m.cols+m.start.x];assert.ok(d>=m.rows-1,'đường ngắn nhất '+d);
  const path=pathAhead(m,m.start.x,m.start.y,999);assert.equal(path.length,d);assert.deepEqual(path.at(-1),[m.exit.x,m.exit.y]);}
});
test('tuyển → chạy; mỗi tin 1 bước, đụng tường đứng yên, lệnh có dấu cũng nhận',()=>{
 const w=setup(),t=running(w),e=w.maze,m=e.maze,r=e.runners.find(x=>x.id==='p0');assert.deepEqual([r.x,r.y],[m.start.x,m.start.y]);
 assert.ok(!canMove(m,m.start.x,m.start.y,'down'));chat(w,'p0','xuống',t+100);assert.deepEqual([r.x,r.y],[m.start.x,m.start.y],'đáy là tường');
 const next=pathAhead(m,r.x,r.y,1)[0],dir=dirTo([r.x,r.y],next);chat(w,'p0',{up:'lên',down:'xuống',left:'trái',right:'phải'}[dir],t+600);assert.deepEqual([r.x,r.y],next);assert.equal(r.steps,1);
 chat(w,'p0',DIRW[dir],t+650);assert.equal(r.steps,1,'gõ dồn <300ms không tính');
});
test('đi đúng đường ra cửa: hạng 1, kết thúc nhận thưởng + danh hiệu; người gõ lệnh lúc đang chạy tự vào từ mốc',()=>{
 const w=setup(),t=running(w),e=w.maze,m=e.maze,r=e.runners.find(x=>x.id==='p0');let now=t;
 chat(w,'p2','phai',now+5);assert.ok(e.runners.some(x=>x.id==='p2'),'p2 tự vào');
 for(const cell of pathAhead(m,r.x,r.y,999)){now+=400;chat(w,'p0',DIRW[dirTo([r.x,r.y],cell)],now);}
 assert.equal(r.rank,1);assert.ok(r.finishAt);const qi0=w.players.p0.totalQi;
 tick(w,t+MAZE.runMs+1);assert.equal(e.phase,'finished');assert.ok(w.players.p0.totalQi>qi0,'có thưởng');assert.equal(w.players.p0.funTitle.name,'Mê Cung Chi Chủ');
 assert.equal(e.results[0].id,'p0');assert.ok(stageConflict(w,t+MAZE.runMs+2),'đang trao thưởng vẫn giữ sân');
});
test('quà: phá tường (đâm tường là phá và bước qua), không soi đường, không cộng quà mặc định',()=>{
 const w=setup(),t=running(w),e=w.maze,r=e.runners.find(x=>x.id==='p1');
 assert.equal(giftEventRule(w,t),'bí cảnh mê cung');const qi0=w.players.p1.totalQi;
 gift(w,'p1',1,t+100);assert.equal(r.steps,0);assert.equal(r.breaks,1);assert.equal(r.hint,undefined);assert.equal(w.players.p1.totalQi,qi0,'quà không cộng tu vi mặc định');
 const dir=['up','left','right'].find(d=>!canMove(e.maze,r.x,r.y,d)&&!(d==='left'&&r.x===0)&&!(d==='right'&&r.x===e.maze.cols-1));assert.ok(dir,'mốc có tường cạnh');
 const x0=r.x,y0=r.y;chat(w,'p1',{up:'len',left:'trai',right:'phai'}[dir],t+1000);assert.notDeepEqual([r.x,r.y],[x0,y0],'phá tường đi qua');assert.equal(r.breaks,0);assert.equal(e.broken.length,1);
 assert.ok(canMove(e.maze,x0,y0,dir),'tường mất cho cả sân');
 // 16/11: quà 10/30/99 = tự đi theo đường đúng (không còn phá tường)
 const d0=e.maze.dist[r.y*e.maze.cols+r.x];gift(w,'p1',20,t+2000);assert.equal(r.breaks,0);assert.equal(e.maze.dist[r.y*e.maze.cols+r.x],d0-3,'tự đi 3 ô về phía cửa');
 gift(w,'p3',99,t+3000);const r3=e.runners.find(x=>x.id==='p3');assert.ok(r3&&r3.steps===20,'người chưa vào tặng quà là vào luôn + tự đi 20 ô');
});
test('không ai vào thì khép lại; dừng tay được; snapshot gửi mê cung gọn',()=>{
 const w=setup();assert.ok(startMaze(w,N).ok);tick(w,N+MAZE.registerMs);assert.equal(w.maze.phase,'finished');
 const w2=setup(),t=running(w2);const v=snapshot(w2,t+10).maze;assert.equal(v.cells.length,MAZE.cols*MAZE.rows);assert.equal(v.runners.length,2);assert.ok(stopMaze(w2,t+20).ok);assert.equal(snapshot(w2,t+30).maze,null);
});
test('300 người cùng đi không lỗi, mỗi người một vị trí riêng',()=>{
 const w=setup(300);assert.ok(startMaze(w,N).ok);for(let i=0;i<300;i++)chat(w,'p'+i,'mecung',N+i);tick(w,N+MAZE.registerMs);const t=N+MAZE.registerMs,e=w.maze;
 for(let s=0;s<20;s++)for(let i=0;i<300;i++)chat(w,'p'+i,['len','trai','phai','xuong'][(i+s)%4],t+s*1000+i);
 assert.equal(e.runners.length,300);assert.ok(e.runners.filter(r=>r.steps>0).length>150,'nhiều người đã đi được');const v=snapshot(w,t+30000).maze;assert.ok(JSON.stringify(v).length<40000,'gói '+JSON.stringify(v).length);
});

test('an exact 100-coin gift teleports to the exit once, including queued gifts',()=>{
 const w=setup(3);
 startMaze(w,N);
 gift(w,'p0',100,N+100);
 assert.equal(w.maze.runners[0].pendingTeleport,true);
 const at=w.maze.registrationEndsAt;
 tick(w,at);
 assert.equal(w.maze.runners[0].rank,1);
 const r=action(w,{type:'gift',userId:'p1',coins:50,count:2,eventId:'not-teleport'},at+100);
 assert.equal(r.ok,true);
 assert.equal(w.maze.finished,1);
 const event={type:'gift',userId:'p1',coins:100,count:1,eventId:'teleport'};
 assert.equal(action(w,event,at+200).ok,true);
 assert.equal(action(w,event,at+201).duplicate,true);
 assert.equal(w.maze.finished,2);
 assert.equal(snapshot(w,at+300).maze.teleports.length,2);
});

test('16/11: yêu thú chui ra từ hang, đụng người thì đánh văng lùi 1 ô + choáng; quà tự đi chém bay yêu thú trên đường',()=>{
 const w=setup(),t=running(w),e=w.maze,r=e.runners.find(x=>x.id==='p1');
 assert.ok(e.dens.length>=2,'có hang');
 tick(w,t+MAZE.mob.firstMs+10);assert.ok(e.mobs.length>=1,'yêu thú đã chui ra');
 // đặt yêu thú ngay ô kế người chạy theo đường về cửa → bước vào là bị văng
 const next=pathAhead(e.maze,r.x,r.y,1)[0],d0=e.maze.dist[r.y*e.maze.cols+r.x];e.mobs=[{id:'m99',x:next[0],y:next[1],born:t+MAZE.mob.firstMs,nextAt:t+1e9,px:next[0],py:next[1]}];
 const dir=['up','down','left','right'].find(d=>{const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];return r.x+v[0]===next[0]&&r.y+v[1]===next[1];});
 const res=chat(w,'p1',{up:'len',down:'xuong',left:'trai',right:'phai'}[dir],t+MAZE.mob.firstMs+500);
 assert.equal(res.knocked,true);assert.ok(e.maze.dist[r.y*e.maze.cols+r.x]>=d0,'văng lùi, không tiến');assert.equal(e.mobs.length,0,'yêu thú tan sau khi đánh');
 assert.equal(chat(w,'p1','len',t+MAZE.mob.firstMs+900).stunned,true,'đang choáng');
 const v=snapshot(w,t+MAZE.mob.firstMs+1000).maze;assert.equal(v.hits.length,1);
 // quà 30: tự đi 9 ô (16/11), chém yêu thú nằm trên đường
 const path=pathAhead(e.maze,r.x,r.y,9);e.mobs=[{id:'m100',x:path[2][0],y:path[2][1],born:t,nextAt:t+1e9,px:0,py:0}];
 gift(w,'p1',30,t+MAZE.mob.firstMs+3000);assert.equal(e.mobs.length,0);assert.deepEqual([r.x,r.y],path.at(-1));
});
