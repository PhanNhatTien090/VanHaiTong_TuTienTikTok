import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick,requiredQi,requiredStones,READY_REMIND,STONE_HINT_MS} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';
import {bubbleText} from '../public/motion.js';

function world(n,now){
 const w=createWorld('live');
 for(let i=0;i<n;i++)action(w,{type:'join',userId:'u'+i,name:'Đạo '+i},now);
 for(const p of Object.values(w.players)){p.qi=requiredQi(p)*3;p.stones=requiredStones(p)*3;p.lastActive=now;p.readyHintAt=0;p.joinedAt=now-3600000;}
 w.lastGuideAt=0;w.readyRemindAt=0;return w;
}
test('15/11 nhắc đột phá: gộp tối đa 5 người đang có mặt vào 1 lời nhắc, 2 phút một lần',()=>{
 const now=Date.now(),w=world(7,now);
 tick(w,now+1000);
 let r=w.events.filter(e=>e.readyReminder);
 assert.equal(r.length,1);assert.equal(r[0].ids.length,READY_REMIND.max);assert.match(r[0].text,/gõ 8/);
 tick(w,now+60000);assert.equal(w.events.filter(e=>e.readyReminder).length,1,'chưa đủ 2 phút thì không nhắc lại');
 tick(w,now+1000+READY_REMIND.everyMs+10);r=w.events.filter(e=>e.readyReminder);
 assert.equal(r.length,2);assert.ok(r[1].ids.includes('u5')||r[1].ids.includes('u6'),'lượt sau ưu tiên người chưa được nhắc');
});
test('15/11 nhắc đột phá: bỏ qua người vắng >10 phút và người chưa đủ',()=>{
 const now=Date.now(),w=world(3,now);
 w.players.u0.lastActive=now-READY_REMIND.activeMs-1;w.players.u1.stones=0;
 tick(w,now+1000);tick(w,now+6000);const r=w.events.find(e=>e.readyReminder);
 assert.deepEqual(r.ids,['u2']);
});
test('15/11 nhắc đột phá: 1 câu giọng cho cả nhóm, bong bóng trên đầu; thiếu linh thạch ghi số, nhắc 2 phút',()=>{
 assert.equal(speechPlan({id:'x',effect:'ready',readyReminder:true,count:3,ids:['a','b','c'],text:'Đủ đột phá: A · B · C • gõ dotpha'}).length,1);
 assert.match(bubbleText({user:'a',effect:'ready'}),/dotpha/);
 assert.match(bubbleText({user:'a',effect:'status',missing:'stones',lack:93}),/Thiếu 93 linh thạch/);
 assert.equal(STONE_HINT_MS,120000);
});
