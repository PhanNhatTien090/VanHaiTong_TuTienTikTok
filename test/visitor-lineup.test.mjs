import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor,pickVisitorLineup,tick} from '../engine.mjs';
import {creditVisitorGift,assignLineupGifts,lineupFeasible,lineupGiftsAt,visitorPrices,LINEUP_MS,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';

const N=1_800_000_000_000;
// Ảnh quà kênh như LIVE (đủ 4 món 100, 3 món 500).
const ART=Object.fromEntries(['Balloon Gift Box|100','Bouquet|100','Mini Star|100','Gem Gun|500','You’re Amazing|500',"Galaxy's Bestest|300"].map(k=>[k,{url:'https://p16.tiktokcdn.com/'+encodeURIComponent(k)+'.png',coins:Number(k.split('|')[1])}]));
const world=(art=ART)=>{const w=createWorld(N-10000);w.giftArt=structuredClone(art);for(const id of ['a','b'])action(w,{type:'join',userId:id,name:id.toUpperCase()},N-9000);return w;};
// Bày lượt cố định để test không phụ thuộc bốc ngẫu nhiên.
const setLineup=(w,kinds)=>{startVisitor(w,kinds[0],N);w.visitor.lineup=assignLineupGifts(kinds,w.giftArt);return w.visitor;};
const gift=(w,id,coins,giftName,count=1,at=N+1000)=>action(w,{type:'gift',userId:id,name:id.toUpperCase(),coins,count,giftName,eventId:id+giftName+coins+at},at);
const has=(w,id,kind)=>!!w.players[id].rewardSkins?.includes(VISITOR_GIFT_REWARDS[kind].skin);

test('vị giá riêng không gắn món; vị trùng giá gắn món ĐÚNG GIÁ, khác tên',()=>{
 const l=assignLineupGifts(['tinh-ha','bich-lan','hanlap'],ART);
 assert.equal(l[2].giftName,undefined);assert.equal(l[2].price,100);
 assert.equal(l[0].price,500);assert.equal(l[1].price,500);assert.ok(l[0].giftName&&l[1].giftName&&l[0].giftName!==l[1].giftName);
 for(const s of l.slice(0,2))assert.ok(lineupGiftsAt(500,ART).includes(s.giftName));
});

test('không ghép trùng giá khi giá đó không đủ món khác nhau',()=>{
 assert.equal(lineupFeasible(['tudo','vuonglam'],ART),false); // 200 chỉ có 1 món
 assert.equal(lineupFeasible(['khuyniet','viemton'],ART),false); // 300 chỉ có 1 món
 assert.equal(lineupFeasible(['tinh-ha','bich-lan','nhan-qua'],ART),true);
 assert.equal(lineupFeasible(['tinh-ha','bich-lan'],{}),false); // chưa có ảnh Gem Gun/You're Amazing
 const kinds=Object.keys(VISITOR_GIFT_REWARDS).filter(k=>Object.hasOwn(VISITORS,k));
 for(let i=0;i<400;i++){const art=i%2?ART:{},l=pickVisitorLineup(kinds[i%kinds.length],[],Math.random,art);
  assert.equal(l.length,3);assert.equal(new Set(l.map(s=>s.kind)).size,3);assert.ok(lineupFeasible(l.map(s=>s.kind),art));
  const named=l.filter(s=>s.giftName);assert.equal(new Set(named.map(s=>s.giftName)).size,named.length);
  for(const s of l){assert.equal(s.price,visitorPrices(s.kind).skin);if(s.giftName)assert.ok(l.filter(x=>x.price===s.price).length>1);}}
});

test('vị trùng giá: tặng ĐÚNG 1 món là nhận, món khác cùng giá ra vị khác',()=>{
 const w=world(),e=setLineup(w,['tinh-ha','bich-lan','hanlap']),[a,b]=e.lineup;
 gift(w,'a',500,a.giftName);assert.ok(has(w,'a','tinh-ha'));assert.ok(!has(w,'a','bich-lan'));
 assert.ok(w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS['tinh-ha'].artifact));
 gift(w,'b',500,b.giftName);assert.ok(has(w,'b','bich-lan'));assert.ok(!has(w,'b','tinh-ha'));
});

test('vị trùng giá: đủ coin bằng món khác KHÔNG ra skin trùng giá',()=>{
 const w=world(),e=setLineup(w,['tinh-ha','bich-lan','nhan-qua']);
 gift(w,'a',100,'Hand Heart',5);gift(w,'a',1,'Rose',600,N+2000);
 for(const k of ['tinh-ha','bich-lan','nhan-qua'])assert.ok(!has(w,'a',k));
 assert.ok(e.lineup.every(s=>s.giftName));
});

test('vị giá riêng: tặng gì cũng được, cộng dồn đủ coin là nhận',()=>{
 const w=world(),e=setLineup(w,['tinh-ha','bich-lan','khuyniet']);
 gift(w,'a',1,'Rose',150);gift(w,'a',100,'Hand Heart',1,N+2000);assert.ok(!has(w,'a','khuyniet'));
 gift(w,'a',5,'Finger Heart',10,N+3000);assert.ok(has(w,'a','khuyniet'));
 assert.ok(!has(w,'a','tinh-ha')&&!has(w,'a','bich-lan'));
 assert.equal(w.players.a.skinChoice,VISITOR_GIFT_REWARDS.khuyniet.skin);
 assert.ok(w.events.some(x=>x.effect==='transform'&&x.transform==='khuyniet'));
});

test('quà đúng món của vị trùng giá không cộng vào phần đủ coin của vị giá riêng',()=>{
 const w=world(),e=setLineup(w,['tinh-ha','bich-lan','khuyniet']);
 gift(w,'a',500,e.lineup[0].giftName);assert.ok(has(w,'a','tinh-ha'));assert.ok(!has(w,'a','khuyniet'));
});

test('MUA 1 LÀ 1: tặng 500 chỉ ra skin 500, không kèm skin rẻ hơn',()=>{
 const w=world(),e=setLineup(w,['tinh-ha','hanlap','tudo']);assert.ok(e.lineup.every(s=>!s.giftName));
 gift(w,'b',500,'Money Gun');assert.ok(has(w,'b','tinh-ha'));assert.ok(!has(w,'b','hanlap'));assert.ok(!has(w,'b','tudo'));
 assert.equal(w.players.b.skinChoice,VISITOR_GIFT_REWARDS['tinh-ha'].skin);
 assert.ok(w.events.some(x=>x.effect==='transform'&&x.transform==='tinh-ha'&&x.user==='b'));
 assert.equal(w.players.b.skinWallet.coins,0);
});

test('đủ coin: trao món đắt nhất vừa đủ, trừ đúng giá, dư mới tính tiếp',()=>{
 const w=world();setLineup(w,['tinh-ha','hanlap','tudo']);
 gift(w,'a',100,'Hand Heart');assert.ok(has(w,'a','hanlap'));assert.equal(w.players.a.skinWallet.coins,0);
 gift(w,'a',200,'Baglama',1,N+2000);assert.ok(has(w,'a','tudo'));assert.ok(!w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS.hanlap.artifact));
 assert.equal(w.players.a.skinChoice,VISITOR_GIFT_REWARDS.tudo.skin);
 gift(w,'a',1,'Rose',99,N+3000);assert.ok(!w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS.hanlap.artifact));
 gift(w,'a',1,'Rose',1,N+4000);assert.ok(w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS.hanlap.artifact)); // pháp bảo Hàn Lập = phần chênh 100
 // 600 coin một lần = skin 500 + skin 100 (trả đủ cả hai)
 gift(w,'b',100,'Hand Heart',6,N+5000);assert.ok(has(w,'b','tinh-ha'));assert.ok(has(w,'b','hanlap'));assert.ok(!has(w,'b','tudo'));
 assert.equal(w.players.b.skinChoice,VISITOR_GIFT_REWARDS['tinh-ha'].skin);
});

test('lượt 4 phút; lời mở và lời kết của lượt tam tiên',()=>{
 const w=world();startVisitor(w,'tinh-ha',N);assert.equal(w.visitor.endsAt-w.visitor.startedAt,LINEUP_MS);
 const start=w.events.find(x=>x.visitorStart);assert.match(start.text,/^TAM TIÊN GIÁNG LÂM/);assert.equal(start.visitorLineup.length,3);
 tick(w,w.visitor.endsAt+10);assert.ok(w.events.some(x=>x.visitorEnd&&/^Tam tiên/.test(x.text)));
});

test('A — VÍ TIÊN DUYÊN: tặng thiếu, hết lượt không mất; lần sau tặng phần còn thiếu là nhận',()=>{
 const w=world(),b=w.players.b,R=VISITOR_GIFT_REWARDS;setLineup(w,['tinh-ha','hanlap','tudo']);
 b.rewardSkins=[R.hanlap.skin,R.tudo.skin];b.artifacts.push(R.hanlap.artifact,R.tudo.artifact); // đã đủ đồ vị rẻ → chỉ còn Tinh Hà 500
 gift(w,'b',100,'Hand Heart',3,N+1000);assert.ok(!has(w,'b','tinh-ha'));assert.equal(b.skinWallet.coins,300);
 const ev=w.events.findLast(e=>e.gift);assert.equal(ev.visitorProgress.toward.kind,'tinh-ha');assert.equal(ev.visitorProgress.toward.left,200);
 tick(w,w.visitor.endsAt+10);assert.equal(b.skinWallet.coins,300,'hết lượt: ví còn nguyên');
 const t2=w.visitor.endsAt+60000;startVisitor(w,'tinh-ha',t2);w.visitor.lineup=assignLineupGifts(['tinh-ha','hanlap','tudo'],w.giftArt);
 gift(w,'b',100,'Hand Heart',2,t2+1000);assert.ok(has(w,'b','tinh-ha'),'lần sau tặng thêm 200 là nhận');assert.equal(b.skinWallet.coins,0);
});
test('A — vị TRÙNG GIÁ vẫn phải đúng món: ví đủ mà tặng món khác thì không mua vị trùng giá',()=>{
 const w=world();setLineup(w,['tinh-ha','bich-lan','hanlap']);
 gift(w,'a',1,'Rose',600,N+1000);assert.ok(has(w,'a','hanlap'));assert.ok(!has(w,'a','tinh-ha')&&!has(w,'a','bich-lan'));
 assert.equal(w.players.a.skinWallet.coins,400,'600 − skin Hàn Lập 100 − pháp bảo Hàn Lập 100');
 gift(w,'a',500,w.visitor.lineup[0].giftName,1,N+2000);assert.ok(has(w,'a','tinh-ha'));assert.equal(w.players.a.skinWallet.coins,400,'mua 1 là 1: trừ đúng 500');
});
