import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action} from '../engine.mjs';
import {dayTier,dayTierOf,creditDayGift,DAY_TIERS} from '../public/day-tier.js';
// 20/11 D: cộng dồn QUÀ THẬT trong ngày → 10 viền vàng · 30 hào quang · 99 Hộ Pháp Hôm Nay (màn chào 1 lần). Qua ngày về 0.
const N=Date.parse('2026-11-20T05:00:00Z');
test('mốc 10 · 30 · 99; báo bậc MỚI đúng lúc vượt mốc; qua ngày về 0',()=>{
 assert.deepEqual(DAY_TIERS,[10,30,99]);assert.equal(dayTier(9),0);assert.equal(dayTier(10),1);assert.equal(dayTier(98),2);assert.equal(dayTier(99),3);
 const p={};assert.equal(creditDayGift(p,5,N),0);assert.equal(creditDayGift(p,5,N),1);assert.equal(creditDayGift(p,25,N),2);assert.equal(creditDayGift(p,64,N),3);assert.equal(creditDayGift(p,500,N),0);
 assert.equal(dayTierOf(p,N),3);assert.equal(dayTierOf(p,N+864e5),0);assert.equal(creditDayGift(p,10,N+864e5),1);
 assert.equal(creditDayGift(p,500,N,false),0,'quà mô phỏng/không thật không tính');
});
test('qua engine: tặng 99 → p.dayGift bậc 3 + màn chào "HỘ PHÁP HÔM NAY" đúng 1 lần',()=>{
 const w=createWorld(N-1e5);w.liveSession={active:true,startedAt:N-1e5};action(w,{type:'join',userId:'a',name:'An'},N-9e4);
 action(w,{type:'gift',userId:'a',name:'An',coins:1,count:99,giftName:'Rose',eventId:'g1'},N);
 assert.equal(dayTierOf(w.players.a,N),3);assert.equal(w.events.filter(e=>e.dayTier===3&&e.effect==='title').length,1);
 action(w,{type:'gift',userId:'a',name:'An',coins:1,count:5,giftName:'Rose',eventId:'g2'},N+5000);
 assert.equal(w.events.filter(e=>e.dayTier===3&&e.effect==='title').length,1,'không chào lại trong ngày');
});
