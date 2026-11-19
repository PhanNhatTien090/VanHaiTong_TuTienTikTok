// 19/11/2026 (chủ game duyệt): 85% người mới chưa từng gõ lệnh → người còn cảnh giới 0 bình luận BẤT KỲ lần đầu = nhập môn (tự lên cảnh giới 1).
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ingest} from '../engine.mjs';

const N=Date.UTC(2026,10,19,7);
const chat=(id,text,i=0)=>({event:'chat',data:{userId:id,nickname:'Tân '+id,uniqueId:'u'+id,comment:text,msgId:'c'+id+i}});
const member=id=>({event:'member',data:{userId:id,nickname:'Tân '+id,uniqueId:'u'+id,actionId:1}});

test('vào phòng thì được chào nhưng chưa cộng gì; bình luận "hi" đầu tiên → nhập môn lên cảnh giới 1 có màn đột phá',()=>{
 const w=createWorld('live');w.liveSession={active:true,startedAt:N-1000};
 const r=ingest(w,member('a'),N);assert.equal(r.autoArrival,true);const p=w.players.a;assert.equal(p.realm,0);
 assert.ok(w.events.some(e=>e.user==='a'&&e.autoArrival&&e.newcomerWelcome),'có lời chào');
 ingest(w,chat('a','hi'),N+3000);
 assert.equal(p.realm,1);assert.ok(p.firstStepAt);
 const e=w.events.find(x=>x.user==='a'&&x.effect==='breakthrough');assert.ok(e?.firstStep);assert.equal(e.toRealm,1);
 assert.ok(p.qi>=0&&p.stones>=0,'không âm tu vi/linh thạch');
});
test('chỉ một lần: bình luận tiếp không tự đột phá nữa; người đã qua cảnh giới 0 không bị ảnh hưởng',()=>{
 const w=createWorld('live');ingest(w,chat('b','xin chào'),N);const p=w.players.b;assert.equal(p.realm,1);
 const n=w.events.filter(e=>e.effect==='breakthrough').length;
 for(let i=1;i<6;i++)ingest(w,chat('b','hay quá',i),N+i*4000);
 assert.equal(p.realm,1);assert.equal(w.events.filter(e=>e.effect==='breakthrough').length,n);
 p.realm=0;ingest(w,chat('b','lại',9),N+60000);assert.equal(p.realm,0,'firstStepAt đã có → không lặp lại kể cả khi bị hạ cảnh giới');
});
test('gõ 8 làm câu đầu tiên: nhập môn một lần, không báo lỗi "chưa đủ đột phá"',()=>{
 const w=createWorld('live');ingest(w,chat('c','8'),N);const p=w.players.c;assert.equal(p.realm,1);
 assert.ok(!w.events.some(e=>e.user==='c'&&/Chưa đủ/.test(e.text||'')));
});
test('gõ lệnh "1" làm câu đầu tiên: vừa nhập môn vừa tu luyện bình thường',()=>{
 const w=createWorld('live');ingest(w,chat('d','1'),N);const p=w.players.d;assert.equal(p.realm,1);assert.ok(p.cooldowns?.cultivate,'lệnh tu luyện vẫn chạy');
});
test('thế giới demo và khi tắt cờ settings.firstStepChat thì KHÔNG tự nhập môn',()=>{
 const d=createWorld('demo');ingest(d,chat('e','hi'),N);assert.equal(d.players.e.realm,0);
 const w=createWorld('live');w.settings.firstStepChat=false;ingest(w,chat('f','hi'),N);assert.equal(w.players.f.realm,0);
});
