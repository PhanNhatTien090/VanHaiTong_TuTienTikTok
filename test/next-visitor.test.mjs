import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor,tick,VISITOR_ROTATION_MS} from '../engine.mjs';
import {giftRules,giftRuleHTML} from '../public/gift-rule-card.js';
// 20/11 E: báo trước tiên nhân lượt sau ("Tiên nhân kế ~N phút · Tên") và vòng xoay mở ĐÚNG vị đã báo.
const N=1.8e12;
const world=()=>{const w=createWorld(N-1e5);w.liveSession={active:true,startedAt:N-1e5};w.settings.autoRandom=false; /* chỉ kiểm vòng tiên nhân, không cho mưa hoa… giành sân */for(const id of ['a','b','c'])action(w,{type:'join',userId:id,name:id},N-9e4);return w;};
test('mở lượt → bốc sẵn vị kế (khác vị vừa mở); tới giờ mở đúng vị đã báo',()=>{
 const w=world();assert.equal(startVisitor(w,'hanlap',N).ok,true);const next=w.nextVisitorKind;assert.ok(next);assert.notEqual(next,'hanlap');
 const first=w.visitor.id;tick(w,w.visitor.endsAt+10);
 // chạy thời gian tới khi vòng xoay thật sự mở lượt mới (mưa hoa/sự kiện khác có thể giành sân trước → tiên nhân lùi 30 s)
 for(let t=w.nextVisitorAt+10;t<w.nextVisitorAt+20*60000&&w.visitor.id===first;t+=30000){for(const id of ['a','b','c'])w.players[id].lastActive=t;tick(w,t);}
 assert.notEqual(w.visitor.id,first,'lượt mới đã mở');
 assert.equal(w.visitor.kind,next,'vòng xoay mở đúng vị đã báo trước');assert.ok(w.nextVisitorKind&&w.nextVisitorKind!==next);
});
test('bảng Tặng quà (không sự kiện) có dòng "Tiên nhân kế ~N phút · Tên"',()=>{
 const s={serverNow:N,nextVisitorKind:'tinh-ha',nextVisitorAt:N+8*60000,settings:{}};const r=giftRules(s,N);
 assert.deepEqual(r.next,{name:'Tinh Hà Kiếm Đế',mins:8});assert.match(giftRuleHTML(r,{}),/Tiên nhân kế ~8 phút · Tinh Hà Kiếm Đế/);
 assert.equal(giftRules({...s,settings:{visitorRotation:false}},N).next,null);
});
