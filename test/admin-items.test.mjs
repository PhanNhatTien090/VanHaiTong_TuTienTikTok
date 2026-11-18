import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,adminEditPlayer} from '../engine.mjs';
const N=Date.parse('2026-11-18T14:00:00+07:00');
function world(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});w.nextBossAt=N+864e5;w.nextSmallAt=N+864e5;for(const id of ['a','b'])action(w,{type:'chat',userId:id,name:id.toUpperCase(),text:'chao'},N);return w;}
const fx=(w,key)=>w.events.filter(e=>e[key]);

test('18/11 trang quản lý: trao/đổi sao/gỡ thần khí, bản mệnh; tích hiệu ứng thì có thẻ + giọng, bỏ tích thì lặng lẽ',()=>{
 const w=world();
 let r=adminEditPlayer(w,'a',{addBao:[{id:'s5-kiem',stars:2}]},N+1,{announce:true});assert.equal(r.ok,true,r.message);
 assert.equal(w.players.a.bao.items['s5-kiem'],2);const card=fx(w,'orbCard').at(-1);assert.equal(card.orbCard.kind,'bao');assert.equal(card.orbCard.tier,5);assert.ok(card.baoWin);
 const n=w.events.length;adminEditPlayer(w,'a',{addBao:[{id:'s4-an',stars:1}]},N+2,{announce:false});assert.equal(w.players.a.bao.items['s4-an'],1);assert.equal(w.events.length,n,'bỏ tích: không phát sự kiện');
 assert.equal(adminEditPlayer(w,'a',{baoStars:{'s4-an':4}},N+3).ok,true);assert.equal(w.players.a.bao.items['s4-an'],4);
 assert.equal(adminEditPlayer(w,'a',{baoBan:'s4-an'},N+4).ok,true);assert.equal(w.players.a.bao.ban,'s4-an');
 assert.equal(adminEditPlayer(w,'a',{baoBan:'L01-tru-tien'},N+5).ok,false,'không đặt bản mệnh món chưa có');
 assert.equal(adminEditPlayer(w,'a',{removeBao:['s4-an']},N+6).ok,true);assert.equal(w.players.a.bao.items['s4-an'],undefined);assert.equal(w.players.a.bao.ban,undefined);
 assert.equal(adminEditPlayer(w,'a',{baoStars:{'s5-kiem':9}},N+7).ok,false,'sao 1–5');
 // GIỚI HẠN: 1 chủ / món, 1 món / người
 assert.equal(adminEditPlayer(w,'a',{addBao:[{id:'L01-tru-tien'}]},N+8).ok,true);assert.equal(w.baoSeason.owners['L01-tru-tien'],'a');
 assert.equal(adminEditPlayer(w,'b',{addBao:[{id:'L01-tru-tien'}]},N+9).ok,false,'đã có chủ');
 assert.equal(adminEditPlayer(w,'a',{addBao:[{id:'L02-hon-don-chung'}]},N+10).ok,false,'mỗi người 1 món GIỚI HẠN');
 adminEditPlayer(w,'a',{removeBao:['L01-tru-tien']},N+11);assert.equal(w.baoSeason.owners['L01-tru-tien'],undefined,'gỡ thì trả suất');
 assert.equal(adminEditPlayer(w,'b',{addBao:[{id:'L01-tru-tien'}]},N+12).ok,true);
});

test('18/11 trang quản lý: Linh Châu + tọa kỹ (trao, sao, cưỡi, gỡ), hiệu ứng theo tích',()=>{
 const w=world();
 assert.equal(adminEditPlayer(w,'a',{mountOrbs:{common:3,vip:1,divine:0}},N+1,{announce:true}).ok,true);
 assert.deepEqual({...w.players.a.mountOrbs},{common:3,vip:1,divine:0});assert.ok(fx(w,'orbCard').some(e=>e.orbCard.kind==='vip'&&e.orbCard.stage==='got'));
 assert.equal(adminEditPlayer(w,'a',{mountOrbs:{vip:-1}},N+2).ok,false);
 assert.equal(adminEditPlayer(w,'a',{addMount:[{id:'con-bang',stars:3}]},N+3,{announce:true}).ok,true);
 assert.equal(w.players.a.mounts['con-bang'].stars,3);assert.ok(fx(w,'mountReveal').some(e=>e.mountReveal.id==='con-bang'));
 assert.equal(adminEditPlayer(w,'a',{mount:'con-bang'},N+4).ok,true);assert.equal(w.players.a.mount,'con-bang');
 assert.equal(adminEditPlayer(w,'a',{mountStars:{'con-bang':5}},N+5).ok,true);assert.equal(w.players.a.mounts['con-bang'].stars,5);
 assert.equal(adminEditPlayer(w,'a',{mount:'kim-tru'},N+6).ok,false,'chưa có thì không cưỡi');
 const n=w.events.length;adminEditPlayer(w,'a',{addMount:[{id:'kim-tru'}]},N+7,{announce:false});assert.equal(w.events.length,n);
 assert.equal(adminEditPlayer(w,'a',{removeMounts:['con-bang']},N+8).ok,true);assert.equal(w.players.a.mount,null);assert.equal(w.players.a.mounts['con-bang'],undefined);
});
