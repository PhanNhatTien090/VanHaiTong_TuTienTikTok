import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,ingest,startVisitor,pickVisitorLineup,tick} from '../engine.mjs';
import {creditVisitorGift,assignLineupGifts,lineupCounts,visitorPrices,LINEUP_MS,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';

const N=1_800_000_000_000;
const world=()=>{const w=createWorld(N-10000);action(w,{type:'join',userId:'a',name:'A'},N-9000);action(w,{type:'join',userId:'b',name:'B'},N-9000);return w;};

test('mỗi lượt 3 vị khác nhau, mỗi vị một loại quà khác nhau chia hết giá skin',()=>{
 const kinds=Object.keys(VISITOR_GIFT_REWARDS).filter(k=>Object.hasOwn(VISITORS,k));
 for(let i=0;i<300;i++){
  const first=kinds[i%kinds.length],lineup=pickVisitorLineup(first,[],Math.random);
  assert.equal(lineup.length,3);assert.equal(lineup[0].kind,first);
  assert.equal(new Set(lineup.map(s=>s.kind)).size,3);
  assert.equal(new Set(lineup.map(s=>s.giftCoins)).size,3);
  for(const s of lineup){assert.ok(s.giftCoins<=visitorPrices(s.kind).skin);assert.equal(visitorPrices(s.kind).skin%s.giftCoins,0);}
 }
});

test('ba skin 500 coin → Money Gun ×1, Hand Heart ×5, Perfume ×25 — không trùng quà',()=>{
 const l=assignLineupGifts(['tinh-ha','bich-lan','nhan-qua']);
 assert.equal(l[0].giftCoins,500);assert.equal(lineupCounts(l[0]).skin,1);
 assert.equal(l[1].giftCoins,100);assert.equal(lineupCounts(l[1]).skin,5);
 assert.equal(l[2].giftCoins,20);assert.equal(lineupCounts(l[2]).skin,25);
});

test('lượt tránh lặp vị của lượt trước khi còn đủ vị',()=>{
 const last=['tinh-ha','bich-lan','nhan-qua'];
 for(let i=0;i<100;i++){const l=pickVisitorLineup('hanlap',last);for(const s of l.slice(1))assert.ok(!last.includes(s.kind));}
});

test('quà đúng loại cộng vào đúng vị; quà khác loại không tính',()=>{
 const w=world();assert.equal(startVisitor(w,'tinh-ha',N).ok,true);
 const e=w.visitor;assert.equal(e.lineup.length,3);assert.equal(e.endsAt-e.startedAt,LINEUP_MS);
 const p=w.players.a,[s0,s1]=e.lineup,r1=VISITOR_GIFT_REWARDS[s1.kind];
 const odd=[500,200,100,30,20,5,1,10,99,199].find(u=>!e.lineup.some(s=>s.giftCoins===u));
 assert.deepEqual(creditVisitorGift(w,p,odd*50,N+1000,null,odd).skinNames,[]);
 assert.equal(Object.keys(e.giftProgress||{}).length,0);
 const n=lineupCounts(s1).skin;
 let got=creditVisitorGift(w,p,s1.giftCoins*(n-1),N+2000,null,s1.giftCoins);if(n>1)assert.deepEqual(got.skinNames,[]);
 got=creditVisitorGift(w,p,s1.giftCoins,N+3000,null,s1.giftCoins);
 assert.equal(got.kind,s1.kind);assert.ok(p.rewardSkins.includes(r1.skin));
 assert.ok(!p.rewardSkins.includes(VISITOR_GIFT_REWARDS[s0.kind].skin));
});

test('quà TikFinity thật đi qua engine: đơn giá quyết định vị',()=>{
 const w=world();startVisitor(w,'tinh-ha',N);const s2=w.visitor.lineup[2],r=VISITOR_GIFT_REWARDS[s2.kind];
 const count=lineupCounts(s2).artifact;
 action(w,{type:'gift',userId:'b',name:'B',coins:s2.giftCoins,count,eventId:'g1'},N+5000);
 assert.ok(w.players.b.rewardSkins?.includes(r.skin));assert.ok(w.players.b.artifacts.includes(r.artifact));
 assert.ok(w.visitor.giftProgress['b|'+s2.kind]);
});

test('lời mở và lời kết của lượt tam tiên',()=>{
 const w=world();startVisitor(w,'tinh-ha',N);
 const start=w.events.find(x=>x.visitorStart);assert.match(start.text,/^TAM TIÊN GIÁNG LÂM/);assert.equal(start.visitorLineup.length,3);
 tick(w,w.visitor.endsAt+10);assert.ok(w.events.some(x=>x.visitorEnd&&/^Tam tiên/.test(x.text)));
});
