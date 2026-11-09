import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startVisitor,VISITOR_ROTATION_MS,visitorRotationWeights,pickRotationVisitor,DAO_TAM} from '../engine.mjs';
const N=1800000000000,MIN=60000;
const world=()=>{const w=createWorld('live');w.settings.residents=false;w.settings.autoEvents=true;w.settings.autoRandom=true;w.nextBossAt=N+1e12;return w;};
test('khách mời skin: trọng số — skin 300 coin ra ít hơn; không trùng vị vừa rồi',()=>{
 const W=Object.fromEntries(visitorRotationWeights());assert.equal(W.khuyniet,1);assert.equal(W.viemton,1);assert.equal(W.hanlap,2);assert.equal(W.tudo,2);
 const seen={};let last=null;for(let i=0;i<4000;i++){const k=pickRotationVisitor(last,Math.random);assert.notEqual(k,last);seen[k]=(seen[k]||0)+1;last=k;}
 assert.ok(seen.khuyniet<seen.hanlap*.75&&seen.viemton<seen.tudo*.75,JSON.stringify(seen));assert.ok(Object.keys(seen).length>=8);
});
test('khách mời skin luân phiên mỗi 10 phút, vị sau khác vị trước; túi ngẫu nhiên không còn tự mở khách mời',()=>{
 const w=world();for(const id of ['a','b','c'])ensurePlayer(w,id,id,N);
 const kinds=[];let t=N;for(let i=0;i<80*60;i++){t+=1000;for(const p of Object.values(w.players))p.lastActive=t;tick(w,t);if(w.visitor&&w.visitor.startedAt===t)kinds.push([t,w.visitor.kind]);}
 assert.ok(kinds.length>=5,'có khách mời: '+kinds.length);
 for(let i=1;i<kinds.length;i++){assert.notEqual(kinds[i][1],kinds[i-1][1]);assert.ok(kinds[i][0]-kinds[i-1][0]>=VISITOR_ROTATION_MS);}
 assert.ok(!(w.randomBag||[]).some(id=>id.startsWith('visitor-')));
});
test('mở tay một khách mời → lượt tự động kế tiếp chờ đủ 10 phút và không trùng vị đó',()=>{
 const w=world();for(const id of ['a','b'])ensurePlayer(w,id,id,N);assert.equal(startVisitor(w,'khuyniet',N).ok,true);
 assert.equal(w.nextVisitorAt,N+VISITOR_ROTATION_MS);assert.equal(w.lastVisitorKind,'khuyniet');
});
test('Đạo tâm: chỉ thả tim / tuluyen 20 phút → cảnh báo rồi ngừng tu vi; trò chuyện hoặc gõ lệnh sự kiện thì tu tiếp',()=>{
 const w=world();w.settings.autoEvents=false;w.settings.heartPlay=true;const p=ensurePlayer(w,'a','An',N);
 let t=N;const heart=()=>action(w,{type:'like',userId:'a',name:'An',count:10},t);
 heart();assert.equal(p.engagedAt,N);
 t=N+DAO_TAM.warnMs+1000;heart();assert.ok(w.events.some(e=>e.daoTam==='warn'&&e.user==='a'));
 t=N+DAO_TAM.blockMs+1000;const q=p.qi,r=heart();assert.equal(r.daoTam,true);assert.equal(p.qi,q,'không lên tu vi');assert.ok(w.events.some(e=>e.daoTam==='blocked'));
 t+=11000;assert.equal(action(w,{type:'chat',userId:'a',text:'tuluyen'},t).ok,false,'spam lệnh cày cũng không lên');assert.equal(p.qi,q);
 t+=11000;action(w,{type:'chat',userId:'a',text:'hai'},t);assert.equal(p.qi,q);
 t+=1000;action(w,{type:'chat',userId:'a',text:'xem'},t);t+=11000;heart();assert.equal(p.qi,q,'lệnh xem thông tin không tính tham gia');
 t+=1000;action(w,{type:'chat',userId:'a',text:'chào mọi người nha'},t);assert.equal(p.engagedAt,t);
 t+=11000;heart();assert.ok(p.qi>q,'trò chuyện xong tu tiếp');
});
test('Đạo tâm: quà thật làm mới; web và puppet không bị chặn',()=>{
 const w=world();w.settings.autoEvents=false;w.settings.heartPlay=true;const p=ensurePlayer(w,'a','An',N);p.engagedAt=N-DAO_TAM.blockMs-1;
 action(w,{type:'gift',userId:'a',name:'An',gift:'Rose',coins:1,count:1,eventId:'g1'},N);assert.equal(p.engagedAt,N);
 const s=createWorld('live');s.webShadow=true;const q=ensurePlayer(s,'b','B',N);q.engagedAt=N-DAO_TAM.blockMs*3;const before=q.qi;action(s,{type:'cultivate',userId:'b'},N);assert.ok(q.qi>before);
});
