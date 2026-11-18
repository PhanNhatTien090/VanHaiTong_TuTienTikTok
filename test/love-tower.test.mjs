import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,tick,snapshot,startBondFestival,requiredQi} from '../engine.mjs';
import {LOVE,loveGiftRule} from '../love-tower.mjs';
import {speechPlan} from '../speech-lines.mjs';
const N=Date.parse('2026-11-17T13:00:00Z');
function setup(){
  const w=createWorld('live');w.settings.residents=false;
  for(const [id,name] of [['a','An'],['b','Bình'],['c','Cúc'],['d','Dũng'],['x','Xuân']])action(w,{type:'join',userId:id,name},N);
  for(const p of Object.values(w.players)){p.realm=6;p.qi=0;p.engagedAt=N;}
  w.social.bonds['bond-ab']={id:'bond-ab',a:'a',b:'b',createdAt:N,days:1,level:1,marks:{}};
  w.social.bonds['bond-cd']={id:'bond-cd',a:'c',b:'d',createdAt:N,days:1,level:1,marks:{}};
  assert.equal(startBondFestival(w,N).ok,true);
  return w;
}
const gift=(w,id,coins,at,count=1)=>action(w,{type:'gift',userId:id,coins,count,giftName:'Rose',eventId:'g'+id+at+coins},at);
const say=e=>speechPlan(e).map(s=>s.text).join(' ');

test('lễ 8 phút; quà 1 coin của đôi đạo lữ → Tình Các, cả hai được tu vi, không áp quà mặc định', () => {
  const w=setup(),f=w.bondFestival;assert.equal(f.endsAt-f.startedAt,480000);
  const a=w.players.a,b=w.players.b;
  gift(w,'a',1,N+1000);
  const room=f.love.rooms.find(Boolean);assert.ok(room);assert.equal(room.bondId,'bond-ab');
  assert.ok(a.qi>0&&b.qi>0,'cả hai cùng tăng');
  const ev=w.events.findLast(e=>e.gift);assert.equal(ev.eventRule,'nguyệt hạ tình lâu • song tu');assert.equal(ev.loveGift.tier,'room');assert.equal(ev.buff,null);
  const line=say(ev);assert.match(line,/Tình Các|song tu/);assert.doesNotMatch(line,/cảm ơn|đa tạ|tặng quà/i);
});

test('người chưa có đạo lữ tặng quà trong lễ → quà mặc định như cũ', () => {
  const w=setup();assert.equal(loveGiftRule(w,w.players.x,N+1000),null);
  gift(w,'x',1,N+1000);const ev=w.events.findLast(e=>e.gift);assert.equal(ev.loveGift,undefined);assert.equal(ev.eventRule,null);
  // nhắc cách vào Tình Lâu, không lặp trong 2 phút
  assert.match(w.events.findLast(e=>e.loveHint).text,/Cần đạo lữ/);
  gift(w,'x',1,N+5000);assert.equal(w.events.filter(e=>e.loveHint).length,1);
  // có đạo lữ nhưng đạo lữ vắng LIVE → nhắc khác
  w.players.b.lastActive=N-20*60000;gift(w,'a',1,N+6000);assert.match(w.events.findLast(e=>e.loveHint).text,/chưa ở LIVE/);
});

test('≥30 coin → Mật Thất chiếu riêng + phúc duyên ×2; một món ≥100 → Đại Điển + danh hiệu', () => {
  const w=setup(),f=w.bondFestival,a=w.players.a,b=w.players.b,c=w.players.c;
  gift(w,'a',30,N+1000);
  assert.equal(f.love.cuts.length,1);const cut=f.love.cuts[0];assert.equal(cut.tier,'secret');assert.equal(cut.ms,LOVE.secretMs);
  assert.ok(a.buffMult>=2&&b.buffUntil>N+1000);
  assert.ok(a.qi>=Math.round(requiredQi(a)*LOVE.secretPct*.9));
  gift(w,'c',100,N+2000);
  const grand=f.love.cuts[1];assert.equal(grand.tier,'grand');assert.equal(grand.at,cut.at+cut.ms,'Đại Điển chỉ chờ màn đang chiếu xong (không nghỉ)');
  assert.equal(c.loveTitle,LOVE.title);assert.equal(w.players.d.loveTitle,LOVE.title);
  assert.notDeepEqual([grand.room,grand.qi],[cut.room,cut.qi],'không lặp y hệt biến thể vừa dùng');
  assert.ok(f.endsAt>=grand.at+grand.ms,'lễ hoãn đóng tới khi chiếu xong');
  // 10 coin (2×5) không phải một món ≥30 nhưng tổng ≥30 → Mật Thất; tổng theo count.
  const say1=say(w.events.findLast(e=>e.loveGift?.tier==='grand'));assert.match(say1,/Thần Tiên Quyến Lữ/);
});

test('hàng chờ màn chiếu tối đa 2; Tình Lâu 2 phòng, đầy thì xếp hàng rồi vào khi phòng trống', () => {
  const w=setup(),f=w.bondFestival;
  for(let i=0;i<4;i++)gift(w,'a',30,N+1000+i);
  assert.ok(f.love.cuts.filter(x=>x.at>N+1000).length<=LOVE.cutQueueMax);
  assert.equal(f.love.rooms.length,2);
  // giả 2 phòng đầy
  f.love.rooms=f.love.rooms.map((r,i)=>({bondId:'z'+i,a:'z',b:'y',aName:'Z',bName:'Y',since:N,until:N+5000,gifts:1}));
  gift(w,'c',1,N+2000);assert.equal(f.love.queue.length,1);
  tick(w,N+6000);
  assert.equal(f.love.queue.length,0);assert.ok(f.love.rooms.some(r=>r?.bondId==='bond-cd'));
  assert.ok(w.events.some(e=>e.loveRoom?.fromQueue));
});

test('song tu miễn phí: cả hai gõ trong 60 s → Đình Nguyệt, 1 lần/đôi/lễ', () => {
  const w=setup(),a=w.players.a;
  assert.equal(action(w,{type:'chat',userId:'a',text:'song tu'},N+1000).pending,true);
  assert.equal(action(w,{type:'chat',userId:'b',text:'song tu'},N+5000).ok,true);
  assert.equal(w.bondFestival.love.gardens.length,1);assert.ok(a.qi>0);
  assert.match(say(w.events.findLast(e=>e.loveGarden)),/Nguyệt Lão/);
  assert.equal(action(w,{type:'chat',userId:'a',text:'song tu'},N+9000).ok,false);
  assert.equal(action(w,{type:'chat',userId:'x',text:'song tu'},N+9000).ok,false,'không có đạo lữ');
});

test('ngoài lễ: không song tu, quà như cũ; overlay có loveTower', () => {
  const w=setup();action(w,{type:'chat',userId:'a',text:'song tu'},N+1000);
  assert.ok(snapshot(w,N+1000).loveTower);
  const late=N+500000;tick(w,late);
  assert.equal(action(w,{type:'chat',userId:'a',text:'song tu'},late+10).ok,false);
  gift(w,'a',1,late+20);assert.equal(w.events.findLast(e=>e.gift).loveGift,undefined);
});

// 18/11 tối (chủ game: "tặng 100 coin delay rất lâu" — LIVE chờ 43 s): Đại Điển chen lên trước các màn Mật Thất đang chờ.
test('quà 100 chen đầu hàng chiếu: chỉ chờ màn đang chiếu, màn chờ lùi ra sau', () => {
  const w=setup(),f=w.bondFestival;
  gift(w,'a',30,N+1000);gift(w,'a',30,N+1500); // 1 màn đang chiếu + 1 màn chờ
  const [playing,waiting]=f.love.cuts;assert.ok(waiting.at>N+1500);
  gift(w,'c',100,N+2000);
  const grand=f.love.cuts.find(x=>x.tier==='grand');
  assert.equal(grand.at,playing.at+playing.ms,'ngay sau màn đang chiếu');
  assert.ok(waiting.at>=grand.at+grand.ms,'màn chờ lùi sau Đại Điển');
  assert.ok(grand.at-(N+2000)<=LOVE.secretMs,'chờ không quá 1 màn');
  // hàng chờ đầy vẫn có Đại Điển
  gift(w,'a',30,N+2500);gift(w,'a',30,N+2600);gift(w,'c',100,N+3000);
  assert.equal(f.love.cuts.filter(x=>x.tier==='grand').length,2);
});

// 18/11 tối (chủ game: "3 cảnh giới cuối hạn chế lại, dưới giữ nguyên").
test('song tu: 3 cảnh giới cuối nhận ít hơn, cảnh giới dưới giữ nguyên', () => {
  const run=realm=>{const w=setup();for(const p of Object.values(w.players))p.realm=realm;const a=w.players.a;const before=a.totalQi;gift(w,'a',100,N+1000);return (a.totalQi-before)/requiredQi(a);};
  const low=run(20),r26=run(26),r28=run(28);
  assert.ok(low>=LOVE.grandPct*.95,'cảnh giới 20 vẫn ~20%: '+low);
  assert.ok(r26<low*.4,'cảnh giới 26 giảm mạnh: '+r26);assert.ok(r28<r26,'28 ít hơn 26');
});
