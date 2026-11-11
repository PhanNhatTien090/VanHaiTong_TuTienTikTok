import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot} from '../engine.mjs';
import {StageDirector} from '../public/stage.js';
import {simpleSteps} from '../public/simple-guide.js';
const N=1800000000000;
function world(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e9;return w;}
const chat=(w,id,text,at=N+1)=>action(w,{type:'chat',userId:id,name:id,text},at);
test('one minute introductory cultivation pays the first breakthrough once and tracks real steps without replaying commands',()=>{
 let w=world();chat(w,'a','nhapmon',N);chat(w,'a','tuluyen',N+1);tick(w,N+1);
 for(let i=1;i<=12;i++)tick(w,N+1+i*5000);
 assert.equal(w.players.a.realm,1);assert.equal(w.events.filter(e=>e.starter).length,1);
 assert.equal(w.introMetrics.started,1);assert.equal(w.introMetrics.cultivated,1);assert.equal(w.introMetrics.advanced,1);
 w=JSON.parse(JSON.stringify(w));chat(w,'a','nhapmon',N+70000);chat(w,'a','tuluyen',N+71000);tick(w,N+80000);
 assert.equal(w.introMetrics.advanced,1);assert.equal(w.events.filter(e=>e.introSpark).length,1);
});
test('joining alone cannot farm starter rewards, and veterans keep their progression',()=>{
 const w=world();chat(w,'a','nhapmon',N);for(let i=0;i<50;i++)tick(w,N+i*5000);
 assert.equal(w.players.a.realm,0);assert.equal(w.introMetrics.advanced,0);
 const p=ensurePlayer(w,'old','Old',N);p.realm=13;action(w,{type:'cultivate',userId:'old'},N+260000);
 assert.equal(p.realm,13);assert.equal(p.intro,undefined);
});
test('one-word together matching requires both opt-ins, ignores NPCs and can be cancelled',()=>{
 const w=world();for(const id of ['a','b','npc'])ensurePlayer(w,id,id,N);w.players.npc.puppet=true;
 assert.equal(chat(w,'a','cungtu').waiting,true);assert.equal(w.companions.pairs.length,0);
 assert.equal(chat(w,'npc','cungtu').ok,false);assert.equal(w.companions.pairs.length,0);
 assert.equal(chat(w,'b','cungtu',N+2).matched,true);assert.equal(w.companions.pairs.length,1);assert.equal(w.companions.queue.length,0);
 const p=w.companions.pairs[0];assert.deepEqual(new Set([p.a,p.b]),new Set(['a','b']));
 chat(w,'a','cungtu huy',N+3);assert.equal(w.players.a.companionPoints,undefined);
});
test('waiting participants expire and old invitation can be accepted using one word',()=>{
 const w=world();for(const id of ['a','b'])ensurePlayer(w,id,id,N);
 chat(w,'a','cungtu');tick(w,N+121000);assert.equal(w.companions.queue.length,0);
 chat(w,'a','cungtu b',N+122000);chat(w,'b','cungtu',N+122001);assert.equal(w.companions.pairs.length,1);
});
test('live keeps five stable rows (hearts + chat first), no admission command, with a short event hint',()=>{
 const s={players:[],realms:Array(19),serverNow:N},base=simpleSteps(s);
 assert.deepEqual(base.rows.map(r=>r.cmd),['❤ thả tim · 1','💬 trò chuyện','8 · đột phá','học · 7 rèn','giới tính nam/nữ','trang bị']);
 assert.equal(base.rows.length,6);assert.ok(base.rows.every(r=>!r.cmd.includes('nhapmon')));
 assert.match(simpleSteps({...s,raceStatus:{phase:'registration'}}).hint,/gõ bay/);
 assert.match(simpleSteps({...s,raceStatus:{phase:'running'}}).hint,/phi kiếm/);
 assert.match(simpleSteps({...s,boss:{hp:10,endsAt:N+1000}}).hint,/thả tim/);
 assert.deepEqual(simpleSteps({...s,raceStatus:{phase:'running'}}).rows,base.rows);
 // Xoay vòng: trang chính xen kẽ lệnh hằng ngày / đồng môn / sự kiện; trang nào cũng ≤6 dòng (dải 3 cột × 2 hàng).
 assert.deepEqual([0,1,2,3,4,5,6].map(i=>simpleSteps(s,i).title),['CÁCH CHƠI','LỆNH HẰNG NGÀY','CÁCH CHƠI','ĐỒNG MÔN','CÁCH CHƠI','SỰ KIỆN','CÁCH CHƠI']);
 assert.ok([0,1,3,5].every(i=>simpleSteps(s,i).rows.length<=6));
 assert.ok(simpleSteps(s,1).rows.some(r=>r.cmd==='điểm danh')&&simpleSteps(s,3).rows.some(r=>r.cmd==='kết duyên + tên'));
});

test('a first intentional arrival gets a brief visible seat without displacing a protected presentation',()=>{
 const stage=new StageDirector(1),old={id:'v',realm:13,giftCoins:5000},fresh={id:'n',realm:0,giftCoins:0},t=100000;
 stage.update([old],[],t);stage.note({user:'n',newcomerWelcome:true},t+5000);
 assert.equal(stage.update([old,fresh],[],t+5000)[0].id,'n');
 const protectedStage=new StageDirector(1);protectedStage.update([old],[],t);protectedStage.note({user:'n',newcomerWelcome:true},t+5000);
 assert.equal(protectedStage.update([old,fresh],[],t+5000,new Set(['v']))[0].id,'v');
});
