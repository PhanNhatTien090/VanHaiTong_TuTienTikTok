import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,startTower,snapshot} from '../engine.mjs';
import {TOWER,guardianOf,passiveDps,guardDps,hitDamage,guardianHp,TOWER_GIFTS} from '../tower.mjs';
const N=Date.UTC(2026,10,11,6);
function world(){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e12;return w;}
const chat=(w,id,text,at)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},at);
const gift=(w,id,coins,at,n=1)=>action(w,{type:'gift',userId:id,name:id.toUpperCase(),coins,count:n,giftName:'X',eventId:id+coins+at},at);
function setup(ids=['a','b','c','d','e','f']){const w=world();for(const id of ids)chat(w,id,'nhapmon',N);assert.equal(startTower(w,N+10).ok,true);return w;}
const laneOf=(w,id)=>w.tower.lanes.findIndex(l=>l?.id===id);

test('16/11: 4 người lên 4 đài cùng lúc, người thứ 5 xếp hàng; tầng = cao nhất + 1',()=>{
 const w=setup();w.players.a.towerFloor=2;
 for(const id of ['a','b','c','d','e'])chat(w,id,'6',N+100);
 tick(w,N+200);const s=snapshot(w,N+200);
 assert.deepEqual(s.tower.lanes.map(l=>l?.id),['a','b','c','d']);
 assert.equal(s.tower.lanes[0].floor,3);assert.equal(s.tower.lanes[0].guardian.name,guardianOf(3).name);assert.equal(s.tower.lanes[0].maxHp,guardianHp(3));
 assert.deepEqual(s.tower.queue,['E']);assert.equal(s.quick.event.name,'VÂN HẢI THÁP');
});

test('người leo gõ 3, người khác trợ lực; thắng lưu tầng, nhận tu vi + linh thạch',()=>{
 const w=setup();const a=w.players.a;a.realm=4;const qi0=a.totalQi,st0=a.stones;
 chat(w,'a','6',N+100);tick(w,N+200);const L=laneOf(w,'a');
 let t=N+300;const hp0=w.tower.lanes[L].hp;chat(w,'a','3',t);assert.ok(w.tower.lanes[L].hp<hp0,'own hit');
 const hp1=w.tower.lanes[L].hp;chat(w,'b','3',t+10);assert.ok(w.tower.lanes[L].hp<hp1,'help hit');
 for(let i=0;i<60&&w.tower.lanes[L];i++){t+=1000;chat(w,'a','3',t);tick(w,t);}
 assert.equal(a.towerFloor,1);assert.ok(a.totalQi>qi0&&a.stones>st0);assert.equal(w.tower.last.won,true);
});

test('độ khó: đúng tầm phải gõ mới qua, vượt xa cấp thì gục; hết giờ không mất gì',()=>{
 // đúng tầm (tầng = 2×cảnh giới): tự đánh 30 s chỉ ~60% → phải gõ / trợ lực
 assert.ok(passiveDps(6,12)*30<100&&passiveDps(6,12)*30>45);
 assert.ok(passiveDps(6,12)*30+hitDamage(6,12)*15<100,'gõ thưa (2 s/lần) chưa chắc qua');assert.ok(passiveDps(6,12)*30+hitDamage(6,12)*20>=100,'gõ đều tay (1,5 s/lần) thì qua');
 assert.ok(guardDps(6,12)*30<60,'đúng tầm không bị hạ');
 assert.ok(guardDps(2,20)*30>=100,'vượt 8 cảnh giới thì gục trước giờ');
 const w=setup();const a=w.players.a;a.realm=0;a.towerFloor=20;const qi0=a.totalQi;
 chat(w,'a','6',N+100);tick(w,N+200);let t=N+200;for(let i=0;i<40&&w.tower.lanes[0];i++){t+=1000;tick(w,t);}
 assert.equal(w.tower.last.won,false);assert.equal(w.tower.last.why,'down');assert.equal(a.towerFloor,20);assert.equal(a.totalQi,qi0);
});

test('quà trợ lực theo mốc 1·10·30·100·500: quà càng lớn nổ càng mạnh, hồi máu, cuồng hóa, cộng giờ',()=>{
 assert.deepEqual(TOWER_GIFTS.map(g=>g.min),[500,100,30,10,1]);
 for(let i=1;i<TOWER_GIFTS.length;i++)for(const k of ['burst','heal','mult','ms','shake'])assert.ok(TOWER_GIFTS[i-1][k]>=TOWER_GIFTS[i][k],k);
 const w=setup();w.players.a.realm=1;w.players.a.towerFloor=30;chat(w,'a','6',N+100);tick(w,N+200);
 const l=w.tower.lanes[0];l.me=20;const end0=l.endsAt,hp0=l.hp;
 gift(w,'a',100,N+300);assert.match(w.events.findLast(e=>e.towerGift).text,/THIÊN HỎA/);
 assert.ok(l.hp<=hp0-28+.01);assert.equal(l.me,70);assert.equal(l.endsAt,end0+10000);assert.equal(l.buffMult,2.2);
 // người ngoài tặng → trợ lực đài đang có người
 const hp1=l.hp;gift(w,'b',30,N+400);assert.ok(l.hp<hp1-13);
 // hoa hồng spam: nổ tối đa 1 lần / 1,5 s
 const hp2=l.hp;for(let i=0;i<10;i++)gift(w,'c',1,N+500+i*10);assert.ok(hp2-l.hp<=3.01,'spam rose capped');
 assert.ok(snapshot(w,N+600).tower.fx.some(f=>f.tier==='g100'));
 // không áp quà mặc định khi tháp mở
 assert.match(w.events.findLast(e=>e.user==='b'&&e.towerGift)?.text||'',/trợ lực A/);
});

test('chưa ai leo mà tặng quà → vào đài luôn, hộ thể áp ngay khi lên',()=>{
 const w=setup();gift(w,'f',30,N+100);tick(w,N+200);const L=laneOf(w,'f');assert.ok(L>=0);
 assert.ok(w.tower.lanes[L].buffUntil>N+200);
});

test('mốc 5 tầng thưởng ×2 + Báo Hỷ; đóng tháp có bục vinh danh',()=>{
 const w=setup();const a=w.players.a;a.realm=12;a.towerFloor=4;
 chat(w,'a','6',N+100);tick(w,N+200);let t=N+200;for(let i=0;i<40&&w.tower.lanes[0];i++){t+=1000;tick(w,t);}
 assert.equal(a.towerFloor,5);const e=w.events.findLast(x=>x.achieve?.kind==='tower');assert.ok(e);assert.equal(e.achieve.floor,5);
 tick(w,N+10+TOWER.durationMs+1);assert.ok(w.tower.closedAt);assert.equal(w.tower.result.top[0].id,'a');
});

test('đánh is left to other events when nobody is climbing',()=>{
 const w=setup();const r=chat(w,'a','3',N+100);assert.notEqual(r?.tower,true);
});
