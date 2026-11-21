// 21/11/2026: SONG TIÊN (2 vị/lượt theo cặp, vị skin mới đứng riêng), lượt ĐẶC BIỆT Tần Mục + Xích Vũ (500 nhận cả 2), HẠ GIÁ 20/30%.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,startVisitor,startVisitorSale,pickSongTienRound,visitorRotationWeights,tick} from '../engine.mjs';
import {SONG_TIEN_ROUNDS,RETIRED_VISITORS,VISITOR_GIFT_REWARDS,buildRound,songTienRound,salePrice} from '../public/visitor-rewards.js';
import {giftFor} from '../public/gift-icons.js';
import {VISITORS} from '../public/visitor-event.js';

const N=1_800_000_000_000;
const ART=Object.fromEntries(['Balloon Gift Box|100','Bouquet|100','Mini Star|100','Gem Gun|500','You’re Amazing|500',"Galaxy's Bestest|300"].map(k=>[k,{url:'https://p16.tiktokcdn.com/'+encodeURIComponent(k)+'.png',coins:Number(k.split('|')[1])}]));
const world=()=>{const w=createWorld(N-10000);w.giftArt=structuredClone(ART);for(const id of ['a','b'])action(w,{type:'join',userId:id,name:id.toUpperCase()},N-9000);w.players.b.gender='nu';return w;};
const open=(w,id)=>{const r=songTienRound(id);w.nextVisitorRound=id;assert.ok(startVisitor(w,r.kinds[0],N).ok);assert.equal(w.visitor.round,id);return w.visitor;};
let seq=0;const gift=(w,id,coins,giftName='Rose',at=N+1000)=>action(w,{type:'gift',userId:id,name:id.toUpperCase(),coins,count:1,giftName,eventId:'g'+(++seq)},at);
const has=(w,id,kind)=>!!w.players[id].rewardSkins?.includes(VISITOR_GIFT_REWARDS[kind].skin);

test('danh sách lượt: vị có thật, không còn Vương Lâm/Hàn Lập/Doraemon; Nữ Oa + U Minh đứng riêng; Tần Mục + Xích Vũ là lượt đặc biệt 500',()=>{
 for(const r of SONG_TIEN_ROUNDS){assert.ok(r.kinds.length>=1&&r.kinds.length<=2,r.id);for(const k of r.kinds){assert.ok(VISITOR_GIFT_REWARDS[k]&&VISITORS[k],k);assert.ok(!RETIRED_VISITORS.includes(k),k);}}
 assert.deepEqual(songTienRound('nu-oa').kinds,['nu-oa']);assert.deepEqual(songTienRound('u-minh').kinds,['u-minh']);
 assert.deepEqual(songTienRound('than-de-vuong-lam').kinds,['shende','nhan-qua']);
 assert.equal(songTienRound('hoa-than').bundle,500);assert.deepEqual(songTienRound('hoa-than').kinds,['viemton','xich-vu']);
 const W=Object.fromEntries(visitorRotationWeights());for(const k of RETIRED_VISITORS)assert.equal(W[k],undefined);
});

test('xoay lượt: không lặp lượt vừa rồi, đủ mọi lượt; lượt kế báo trước đúng lượt mở',()=>{
 let last=null;const seen=new Set();for(let i=0;i<800;i++){const r=pickSongTienRound(last,Math.random,ART);assert.notEqual(r.id,last);seen.add(r.id);last=r.id;}
 assert.equal(seen.size,SONG_TIEN_ROUNDS.length);
 const w=world();startVisitor(w,'u-minh',N);const next=w.nextVisitorRound;assert.ok(songTienRound(next));assert.notEqual(next,'u-minh');
 assert.equal(w.visitor.lineup.length,1);
 tick(w,w.visitor.endsAt+10);w.nextVisitorAt=w.visitor.endsAt+20;for(const id of ['a','b'])action(w,{type:'chat',userId:id,name:id,text:'tuvi'},w.visitor.endsAt+15);
 tick(w,w.visitor.endsAt+30);assert.equal(w.visitor.round,next);
});

test('Song Tiên thường: mở bằng cặp, lời mở "SONG TIÊN GIÁNG LÂM", mỗi vị đủ giá là nhận (mua 1 là 1)',()=>{
 const w=world(),e=open(w,'than-de-vuong-lam');
 assert.deepEqual(e.lineup.map(s=>[s.kind,s.price]),[['shende',100],['nhan-qua',500]]);
 assert.match(w.events.find(x=>x.visitorStart).text,/^SONG TIÊN GIÁNG LÂM • Thần Đế · Nhân Quả Vương Lâm/);
 gift(w,'a',100);assert.ok(has(w,'a','shende'));assert.ok(!has(w,'a','nhan-qua'));
 gift(w,'a',500);assert.ok(has(w,'a','nhan-qua'));assert.ok(w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS['nhan-qua'].artifact));
});

test('lượt ĐẶC BIỆT Tần Mục + Xích Vũ: 500 nhận CẢ 2 skin, không bán lẻ; nữ mặc Xích Vũ, nam mặc Tần Mục',()=>{
 const w=world(),e=open(w,'hoa-than');assert.deepEqual(e.bundle,{base:500,price:500});
 assert.match(w.events.find(x=>x.visitorStart).text,/^SONG TIÊN ĐẶC BIỆT • Tần Mục Hỏa Thần \+ Xích Vũ Nữ Đế/);
 gift(w,'a',300);assert.ok(!has(w,'a','viemton')&&!has(w,'a','xich-vu'),'300 không mua lẻ được');assert.equal(w.players.a.skinWallet.coins,300);
 gift(w,'a',200);assert.ok(has(w,'a','viemton')&&has(w,'a','xich-vu'));assert.equal(w.players.a.skinWallet.coins,0);
 assert.equal(w.players.a.skinChoice,VISITOR_GIFT_REWARDS.viemton.skin);
 assert.ok(!w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS.viemton.artifact),'lượt đặc biệt chỉ 2 skin');
 gift(w,'b',500);assert.ok(has(w,'b','xich-vu')&&has(w,'b','viemton'));assert.equal(w.players.b.skinChoice,VISITOR_GIFT_REWARDS['xich-vu'].skin);
 gift(w,'a',500);assert.equal(w.players.a.skinWallet.coins,500,'đã đủ cả 2 → không trừ ví');
});

test('lượt đặc biệt: ai đã có 1 vị thì vị còn lại tính đúng giá riêng',()=>{
 const w=world();w.players.a.rewardSkins=[VISITOR_GIFT_REWARDS.viemton.skin];open(w,'hoa-than');
 gift(w,'a',300);assert.ok(has(w,'a','xich-vu'));assert.equal(w.players.a.skinWallet.coins,0);
});

test('HẠ GIÁ = ĐÚNG MÓN QUÀ (chủ game: 350 không ai biết tặng gì): 500→400, 300→200, 200→100, 100→99; mỗi giá là 1 món ×n',()=>{
 assert.deepEqual([500,300,200,100].map(p=>salePrice(p)),[400,200,100,99]);
 for(const p of [400,200,100,99]){const g=giftFor({},p);assert.ok(g.url&&g.count<=5,p+' phải ra 1 món ảnh thật ×n');}
 const w=world();assert.equal(startVisitorSale(w,N).ok,false,'chưa có lượt');
 open(w,'than-de-vuong-lam');
 const r=startVisitorSale(w,N+500);assert.ok(r.ok);assert.deepEqual(r.lineup.map(s=>s.price),[99,400]);
 const ev=w.events.find(x=>x.visitorSale);assert.deepEqual(ev.saleLines.map(x=>x.gift),['Paper Crane','4 Balloon Gift Box'],'món kênh đã có ảnh, ×n ≤5');assert.doesNotMatch(ev.text,/coin|tim|follow|\d{3}/i);
 gift(w,'a',400);assert.ok(has(w,'a','nhan-qua'));assert.ok(w.players.a.artifacts.includes(VISITOR_GIFT_REWARDS['nhan-qua'].artifact));assert.equal(w.players.a.skinWallet.coins,0);
 gift(w,'b',99);assert.ok(has(w,'b','shende'));
 gift(w,'b',101);assert.ok(w.players.b.artifacts.includes(VISITOR_GIFT_REWARDS.shende.artifact),'pháp bảo Thần Đế 300→200: phần chênh 101');
 assert.equal(startVisitorSale(w,N+600).ok,false,'đã hạ giá rồi');
});

test('HẠ GIÁ lượt đặc biệt: 500→400 nhận cả 2',()=>{
 const w=world();open(w,'hoa-than');startVisitorSale(w,N+100);assert.equal(w.visitor.bundle.price,400);
 gift(w,'a',400);assert.ok(has(w,'a','viemton')&&has(w,'a','xich-vu'));
});

test('không còn cặp trùng giá (hạ giá theo món sẽ không phân biệt được ai mua ai), trừ lượt đặc biệt',()=>{
 for(const r of SONG_TIEN_ROUNDS.filter(r=>!r.bundle&&r.kinds.length===2)){const [a,b]=r.kinds.map(k=>VISITOR_GIFT_REWARDS[k].skinCoins||(k==='shende'||k==='hailam'?100:300));assert.notEqual(a,b,r.id);}
 const w=world(),e=open(w,'long-loi');assert.deepEqual(e.lineup.map(s=>s.kind),['hailam','khuyniet']);assert.ok(e.lineup.every(s=>!s.giftName));
});

test('buildRound giữ giá gốc để hạ giá tính lại, không đổi bảng giá chung',()=>{
 const b=buildRound(songTienRound('nguyet-tinh'),ART);assert.deepEqual(b.lineup.map(s=>[s.base,s.artBase]),[[300,500],[500,500]]);
 assert.equal(VISITOR_GIFT_REWARDS['tinh-ha'].skinCoins,500);
});
