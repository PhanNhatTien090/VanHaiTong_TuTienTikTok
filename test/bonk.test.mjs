// 10/11/2026: Hội Gõ Đầu (bonk.mjs) — chỉ chạy khi sự kiện mở, người bị gõ rơi ít linh thạch sang người gõ.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startBonk,stopBonk,RANDOM_EVENTS,commandWords} from '../engine.mjs';
import {BONK} from '../bonk.mjs';
import {stageConflict} from '../stage-lock.mjs';
const N=1800000000000;
function setup(n=4){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<n;i++){const p=ensurePlayer(w,'p'+i,'Người '+i,N);p.stones=100;p.socialCode='M'+i;}ensurePlayer(w,'lam','Lam Ba Roiss☺️😇',N).stones=100;return w;}
const chat=(w,id,text,t)=>action(w,{type:'chat',text,userId:id},t);

test('ngoài sự kiện: lệnh go không làm gì, không mất linh thạch',()=>{
 const w=setup();const r=chat(w,'p0','go Người 1',N+100);assert.notEqual(r.bonk,'p1');assert.equal(w.players.p1.stones,100);
});
test('mở sự kiện: gõ theo tên/mã/tên có emoji, người bị gõ rơi 1–3 viên sang người gõ',()=>{
 const w=setup();assert.ok(startBonk(w,N).ok);assert.equal(stageConflict(w,N+1),'hội gõ đầu');
 let r=chat(w,'p0','go Người 1',N+100);assert.equal(r.ok,true);assert.equal(r.bonk,'p1');
 const d=r.stones;assert.ok(d>=BONK.minDrop&&d<=BONK.maxDrop);assert.equal(w.players.p1.stones,100-d);assert.equal(w.players.p0.stones,100+d);
 r=chat(w,'p2','gõ đầu lam ba',N+200);assert.equal(r.bonk,'lam','gõ đầu + tiền tố tên không dấu');
 r=chat(w,'p3','godau M0',N+300);assert.equal(r.bonk,'p0','theo mã');
 const view=snapshot(w,N+400).bonkFest;assert.equal(view.active,true);assert.equal(view.hits.length,3);assert.equal(view.hits[0].a,'p0');
});
test('chống spam: người gõ chờ, người vừa bị gõ được miễn, không tự gõ mình, tối đa mất maxLoss viên',()=>{
 const w=setup();startBonk(w,N);
 chat(w,'p0','go Người 1',N+100);let r=chat(w,'p0','go Người 2',N+2000);assert.equal(r.ok,false);assert.match(r.message,/Tay còn mỏi/);
 r=chat(w,'p2','go Người 1',N+2000);assert.equal(r.ok,false);assert.match(r.message,/đầu còn u/);
 r=chat(w,'p2','go Người 2',N+2100);assert.equal(r.ok,false);
 let t=N+10000;const before=w.players.p1.stones;for(let i=0;i<9;i++){t+=BONK.cooldownMs+10;chat(w,'p'+[0,2,3][i%3],'go Người 1',t);}
 assert.ok(100-w.players.p1.stones<=BONK.maxLoss,'mất tối đa '+BONK.maxLoss);assert.ok(before>=w.players.p1.stones);
 const poor=w.players.p3;poor.stones=0;r=chat(w,'p0','go Người 3',t+BONK.cooldownMs+50);assert.equal(r.ok,true);assert.equal(r.stones,0);assert.equal(poor.stones,0,'không âm');
});
test('go không tên = gõ người ngẫu nhiên khác mình; kết thúc có Thiết Thủ Vương',()=>{
 const w=setup();startBonk(w,N);const r=chat(w,'p0','go',N+100);assert.equal(r.ok,true);assert.notEqual(r.bonk,'p0');
 chat(w,'p1','go Người 2',N+200);chat(w,'p0','go Người 3',N+BONK.cooldownMs+300);
 tick(w,N+BONK.durationMs+1);const e=w.bonkFest;assert.ok(e.closedAt);assert.equal(e.result.hitter.id,'p0');assert.equal(e.result.hitter.n,2);
 assert.equal(stageConflict(w,N+BONK.durationMs+2),null,'khép là trả sân');
 const r2=chat(w,'p2','go Người 0',N+BONK.durationMs+100);assert.notEqual(r2.bonk,'p0');
 assert.equal(snapshot(w,N+BONK.durationMs+100).bonkFest.result.hitter.id,'p0');assert.equal(snapshot(w,N+BONK.durationMs+BONK.podiumMs+10).bonkFest,null);
});
test('dừng tay + có trong túi sự kiện ngẫu nhiên; "gõ đầu" gộp thành 1 lệnh',()=>{
 const w=setup();startBonk(w,N);assert.ok(stopBonk(w,N+500).ok);assert.ok(w.bonkFest.closedAt);
 assert.ok(RANDOM_EVENTS.some(([id])=>id==='bonk'));assert.equal(commandWords('gõ đầu Lam')[0],'godau');
});
test('quà trong hội = búa xịn giữ vĩnh viễn, gõ rơi nhiều hơn; không cộng quà mặc định',async()=>{
 const {HAMMERS}=await import('../bonk.mjs');const {giftEventRule}=await import('../engine.mjs');
 const w=setup();startBonk(w,N);assert.equal(giftEventRule(w,N+1),'hội gõ đầu');
 const gift=(id,coins,t)=>action(w,{type:'gift',userId:id,coins,count:1,eventId:'g'+t+id},t);
 const qi0=w.players.p0.totalQi;gift('p0',1,N+100);assert.equal(w.players.p0.bonkHammer,1);assert.equal(w.players.p0.totalQi,qi0,'không quà mặc định');
 gift('p0',19,N+200);assert.equal(w.players.p0.bonkHammer,2,'cộng dồn 20 coin');gift('p0',99,N+300);assert.equal(w.players.p0.bonkHammer,3);
 const r=chat(w,'p0','go Người 1',N+400);assert.equal(r.hammer,3);assert.ok(r.stones>=HAMMERS[3].drop[0]&&r.stones<=HAMMERS[3].drop[1]);
 assert.equal(snapshot(w,N+500).bonkFest.hits.at(-1).h,3);
 let t=N+500;for(let i=0;i<12;i++){t+=HAMMERS[3].cd+10;chat(w,'p0','go Người 1',t);}assert.ok(100-w.players.p1.stones<=BONK.maxLossPremium);
 tick(w,N+BONK.durationMs+1);gift('p2',500,N+BONK.durationMs+100);assert.equal(w.players.p2.bonkHammer,undefined,'ngoài hội tặng không ra búa');
 startBonk(w,N+BONK.durationMs+60000);assert.equal(w.players.p0.bonkHammer,3,'lượt sau vẫn giữ búa');
});
