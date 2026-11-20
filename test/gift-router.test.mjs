import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor,startBaoKhoEvent,startFlowerEvent,GIFT_ROUTES,giftRoute,giftEventRule} from '../engine.mjs';

// 20/11 BỘ ĐIỀU PHỐI QUÀ: 1 món quà = sổ sách (luôn) + phần thưởng ĐÚNG MỘT nơi (tuyến đầu tiên đang mở, không có → quà mặc định).
const N=1.8e12;
const world=()=>{const w=createWorld(N-1e5);w.liveSession={active:true,startedAt:N-1e5};for(let i=0;i<8;i++)action(w,{type:'join',userId:'u'+i,name:'U'+i},N-9e4);w.players.u0.realm=6;w.players.u0.qi=1e6;return w;};
const give=(w,coins=500,at=N+2000)=>{const n=w.events.length;action(w,{type:'gift',userId:'u0',name:'U0',coins,count:1,giftName:'Money Gun',eventId:'g'+at},at);return w.events.slice(n).find(e=>e.gift);};

test('bảng tuyến: thứ tự ưu tiên cố định, id duy nhất, giftEventRule đọc từ bảng',()=>{
 assert.deepEqual(GIFT_ROUTES.map(r=>r.id),['hall','realm','bao','race','war','alchemy','kiep','maze','tower','visitor','opportunity','flower','bonk','love']);
 const w=world();assert.equal(giftRoute(w,N),null);assert.equal(giftEventRule(w,N),null);
 startVisitor(w,'hanlap',N);assert.equal(giftRoute(w,N+1).id,'visitor');assert.equal(giftEventRule(w,N+1),'tiên nhân truyền đạo');
});

test('không sự kiện: quà mặc định + Đại lễ (≥500); có sự kiện có luật: chỉ luật đó, không mặc định, không Đại lễ',()=>{
 let w=world(),g=give(w);assert.ok(g.reward.qi>0);assert.ok(g.jackpot);assert.equal(g.eventRule,null);
 w=world();startVisitor(w,'hanlap',N);g=give(w);assert.ok(g.visitorProgress);assert.equal(g.jackpot,undefined);assert.equal(g.buff,null);assert.equal(g.eventRule,'tiên nhân truyền đạo');
 w=world();assert.equal(startBaoKhoEvent(w,N).ok,true);g=give(w);assert.ok(g.baoGift);assert.equal(g.visitorProgress,undefined);assert.equal(g.jackpot,undefined);
});

test('HAI sự kiện lỡ chồng nhau (ép trạng thái): quà chỉ vào tuyến ưu tiên cao hơn, tuyến kia không nhận',()=>{
 const w=world();startVisitor(w,'hanlap',N);
 w.flowerEvent={kind:'flower',startedAt:N,endsAt:N+120000,scores:{}}; // ép mưa hoa chạy song song (bình thường bị chặn khi mở)
 const before=JSON.stringify(w.flowerEvent.scores||{});
 const g=give(w);assert.ok(g.visitorProgress,'tiên nhân (ưu tiên cao hơn) nhận');assert.equal(JSON.stringify(w.flowerEvent.scores||{}),before,'mưa hoa không nhận');
});
