import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor,controlPetEvent} from '../engine.mjs';
import {VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {announcement} from '../speech-lines.mjs';

const N=Date.parse('2026-11-10T13:00:00Z');
function setup(){
 const w=createWorld('live');
 action(w,{type:'join',userId:'a',name:'An'},N);
 action(w,{type:'join',userId:'b',name:'Nguyễn Văn Bình'},N+1);
 return w;
}
const chat=(w,id,text,t)=>action(w,{type:'chat',userId:id,text},t);
const gift=(w,id,coins,eventId,t)=>action(w,{type:'gift',userId:id,coins,count:1,eventId},t);

test('tặng hộ trong sự kiện skin: skin về người nhận, coin/VIP vẫn của người tặng',()=>{
 const w=setup();assert.equal(startVisitor(w,'tudo',N+10).ok,true);
 const r=VISITOR_GIFT_REWARDS.tudo;
 assert.equal(chat(w,'a','tặng Nguyễn Văn Bình',N+20).ok,true);
 assert.equal(w.players.a.giftFor.to,'b');
 gift(w,'a',r.skinCoins,'g1',N+30);
 assert.ok(w.players.b.rewardSkins?.includes(r.skin));
 assert.ok(!w.players.a.rewardSkins?.includes(r.skin));
 assert.equal(w.players.a.giftCoins,r.skinCoins);
 assert.equal(w.players.b.giftCoins||0,0);
 assert.equal(w.visitor.giftProgress.b.coins,r.skinCoins);
 assert.equal(w.visitor.giftProgress.a,undefined);
 const tf=w.events.findLast(e=>e.transform);
 assert.equal(tf.user,'b');assert.equal(tf.giftFrom,'An');
 const g=w.events.findLast(e=>e.effect&&e.gift!==undefined&&e.user==='a');
 assert.equal(g.giftFor.to,'b');assert.match(g.text,/tặng hộ Nguyễn Văn Bình/);
 // Đủ mốc pháp bảo cũng về người nhận
 gift(w,'a',r.artifactCoins-r.skinCoins,'g2',N+40);
 assert.ok(w.players.b.artifacts.includes(r.artifact));
 assert.ok(!w.players.a.artifacts.includes(r.artifact));
});

test('tặng hộ trong Linh Thú Cốc: coin về người nhận, tim không chuyển',()=>{
 const w=setup();controlPetEvent(w,'start',N+10);
 assert.equal(chat(w,'a','tang ho Nguyen Van Binh',N+20).ok,true);
 gift(w,'a',30,'p1',N+30);
 assert.equal(w.players.b.petProgress.coins,30);
 assert.equal(w.players.a.petProgress?.coins||0,0);
 action(w,{type:'like',userId:'a',count:150},N+40);
 assert.equal(w.players.a.petProgress.hearts,150);
 assert.equal(w.players.b.petProgress.hearts||0,0);
});

test('chặn: ngoài sự kiện, tự tặng mình, người không ở LIVE, trùng tên',()=>{
 const w=setup();
 assert.equal(chat(w,'a','tang Nguyễn Văn Bình',N+20).ok,false);
 controlPetEvent(w,'start',N+30);
 assert.equal(chat(w,'a','tang An',N+40).ok,false);
 assert.equal(chat(w,'a','tang Người Lạ',N+50).ok,false);
 action(w,{type:'join',userId:'c',name:'Nguyễn Văn Bình'},N+60);
 const dup=chat(w,'a','tang Nguyễn Văn Bình',N+70);
 assert.equal(dup.ok,false);assert.match(dup.message,/Trùng tên/);
 assert.equal(chat(w,'a','tang '+w.players.c.socialCode,N+80).ok,true);
 assert.equal(w.players.a.giftFor.to,'c');
});

test('người nhận rời LIVE thì quà tính cho người tặng; tang thoi để thôi',()=>{
 const w=setup();controlPetEvent(w,'start',N+10);
 chat(w,'a','tang Nguyễn Văn Bình',N+20);
 w.players.b.leftLiveAt=N+25;
 gift(w,'a',10,'x1',N+30);
 assert.equal(w.players.a.petProgress.coins,10);
 assert.equal(w.players.b.petProgress?.coins||0,0);
 assert.match(w.events.findLast(e=>e.user==='a'&&e.gift!==undefined).text,/đã rời LIVE/);
 assert.equal(chat(w,'a','tang thoi',N+40).ok,true);
 assert.equal(w.players.a.giftFor,null);
});

test('lời chỉ định hết hạn sau 10 phút',()=>{
 const w=setup();controlPetEvent(w,'start',N+10,60);
 chat(w,'a','tang Nguyễn Văn Bình',N+20);
 action(w,{type:'chat',userId:'b',text:'hi'},N+11*60000-5); // giữ B có mặt
 gift(w,'a',10,'late',N+11*60000);
 assert.equal(w.players.b.petProgress?.coins||0,0);
 assert.equal(w.players.a.giftFor,null);
});

test('giọng đọc nêu người tặng hộ',()=>{
 const parts=announcement({transform:'tudo',skinName:'Tư Đồ Ma Tôn',name:'Bình',giftFrom:'An',effect:'transform',text:'Biến hình'});
 assert.match(JSON.stringify(parts),/do An tặng/);
});
