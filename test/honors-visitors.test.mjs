import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,ingest,snapshot,startVisitor,startOpportunity,tick} from '../engine.mjs';
import {honorRoll,eventAvatar,safeAvatar} from '../public/honors.js';
import {VISITOR_RELICS} from '../public/visitor-event.js';
const now=1800000000000;
test('honor winners exclude corresponding admin edits without deleting players',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}}),a=ensurePlayer(w,'a','A',now),b=ensurePlayer(w,'b','B',now);Object.assign(a,{realm:8,giftCoins:9999999});Object.assign(b,{realm:5,giftCoins:100,bossWins:2});
 w.adminLog=[{id:'a',changes:['coin quà 0 → 9999999','cảnh giới Kim Đan → Chân Tiên']}];
 const roll=honorRoll(w);assert.equal(roll.length,3);assert.ok(roll.every(h=>h.id==='b'));assert.equal(Object.keys(w.players).length,2);
 assert.equal(snapshot(w,now).players.find(p=>p.id==='b').honor.title,'ĐẠI TRƯỞNG LÃO');
});
test('avatar is captured from nested TikFinity user and restricted to HTTPS CDN',()=>{
 const url='https://p16.tiktokcdn.com/avatar/test.webp';assert.equal(eventAvatar({user:{avatarThumb:{urlList:[url]}}}),url);
 for(const bad of ['http://p16.tiktokcdn.com/x','https://tiktokcdn.com.evil.test/a','https://127.0.0.1/x','javascript:alert(1)','https://user:pass@p16.tiktokcdn.com/x'])assert.equal(safeAvatar(bad),null);
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});ingest(w,{event:'chat',data:{user:{userId:'a',nickname:'A',profilePictureUrl:url},comment:'nhapmon'}},now);assert.equal(w.players.a.avatar,url);
});
test('Han Lap grants one persistent free reward per viewer, six different first rewards',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});assert.equal(startVisitor(w,'hanlap',now).ok,true);
 for(let i=0;i<6;i++){const r=action(w,{type:'chat',text:'coduyen',userId:String(i),name:'P'+i},now+100);assert.ok(r.ok);}
 const ids=Object.values(w.players).map(p=>p.artifacts.find(id=>id.startsWith('visitor-')));assert.equal(new Set(ids).size,6);
 const restored=JSON.parse(JSON.stringify(w)),p=restored.players['0'],qi=p.qi;
 assert.equal(action(restored,{type:'chat',text:'coduyen',userId:'0'},now+1000).duplicate,true);assert.equal(p.qi,qi);
 assert.equal(startVisitor(w,'vuonglam',now+2000).ok,false);
 assert.equal(startOpportunity(w,now+2000).ok,false);
 action(w,{type:'chat',text:'coduyen',userId:'late'},now+180000);assert.equal(w.players.late.artifacts.length,0);
});
test('Vuong Lam needs joined players and throttled actions, gives once on completion',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});startVisitor(w,'vuonglam',now);w.visitor.goal=3;
 action(w,{type:'chat',text:'coduyen',userId:'a',name:'A'},now+100);assert.equal(w.players.a.artifacts.length,0);
 const first=w.visitor.points;action(w,{type:'like',count:100,userId:'a'},now+200);assert.equal(w.visitor.points,first);
 action(w,{type:'chat',text:'hi',userId:'not-joined'},now+5000);assert.equal(w.visitor.points,first);
 action(w,{type:'cultivate',userId:'a'},now+6000);action(w,{type:'chat',text:'hi',userId:'a'},now+22000);
 assert.equal(w.visitor.completed,true);assert.equal(w.players.a.artifacts.filter(id=>id.startsWith('visitor-')).length,1);
 const qi=w.players.a.qi;action(w,{type:'chat',text:'coduyen',userId:'a'},now+23000);assert.equal(w.players.a.qi,qi);
 action(w,{type:'chat',text:'coduyen',userId:'late'},now+24000);assert.equal(w.players.late.artifacts.length,1);
});
test('visitor items have equal combined score and expired event closes once',()=>{
 assert.equal(new Set(VISITOR_RELICS.map(a=>a.damage+a.bonus*100)).size,1);
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});startVisitor(w,'hanlap',now);tick(w,now+180001);const ends=w.events.filter(e=>e.visitorEnd).length;tick(w,now+180005);assert.equal(w.events.filter(e=>e.visitorEnd).length,ends);
});
