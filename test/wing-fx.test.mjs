import {test} from 'node:test';import assert from 'node:assert/strict';
import {_burstOf,WING_BURST_MS,WING_BURST_GAP} from '../public/wing-fx.js';
import {WING_TIERS,wingTier} from '../public/boss-arena.js';
test('mốc cánh mới 8.000 / 9.000 / 10.000 / 12.000 (18/11), có hiệu ứng biến hình',()=>{
 assert.deepEqual(WING_TIERS.filter(w=>w.fx).map(w=>[w.min,w.fx]),[[8000,'swords'],[9000,'demon'],[10000,'lotus'],[12000,'heaven'],[14000,'ice'],[16000,'thunder'],[18000,'chaos'],[20000,'emperor']]);
 assert.equal(wingTier(10676).fx,'lotus');assert.equal(wingTier(9000).fx,'demon');assert.equal(wingTier(27420).fx,'emperor');assert.equal(wingTier(15000).fx,'ice');assert.equal(wingTier(7999).min,7000);
 assert.ok(WING_TIERS.filter(w=>w.fx).every(w=>w.width<=1.19),'không rộng hơn cánh 7.000');
});
test('chống lag: tối đa 2 người biến hình cùng lúc (sân ≥10 người: 1), mỗi người ≥45 s, sân đông/đồ họa nhẹ thì không',()=>{
 const T=1e6,ids=['a','b','c','d'],seed=sc=>{for(const id of [...ids,'x'])_burstOf(sc,id,T);return sc;};const sc=seed({motion:true});
 const got=ids.map(id=>_burstOf(sc,id,T+100000)).filter(Boolean);assert.equal(got.length,2);
 const crowded=seed({motion:true,crowded:true});assert.equal(ids.map(id=>_burstOf(crowded,id,T+100000)).filter(Boolean).length,1);
 for(const flag of [{heavyCrowd:true},{minimalCrowd:true},{budget:{level:'light'}},{motion:false},{cutFullActive:true}])assert.equal(_burstOf({motion:true,...flag},'a',T+100000),null,JSON.stringify(flag));
 const one=seed({motion:true}),b=_burstOf(one,'x',T+100000);assert.ok(b);
 assert.equal(_burstOf(one,'x',T+100000+WING_BURST_MS+10),null,'chưa đủ 45 s');
 assert.equal(_burstOf(seed({motion:true}),'a',T+10),null,'mới vào sân chưa bùng ngay (lệch nhịp)');
 assert.ok(_burstOf(one,'x',T+100000+WING_BURST_GAP+9000),'sau 45 s+ được bùng lại');
});

test('18/11: vừa đủ mốc cánh mới thì tự mặc cánh mới nhất (bỏ lựa chọn cũ), đổi lại vẫn được, ẩn cánh giữ nguyên',async()=>{
 const {createWorld,action}=await import('../engine.mjs');const {playerWing}=await import('../public/boss-arena.js');
 const N=Date.parse('2026-11-18T12:00:00+07:00'),w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});w.nextBossAt=N+864e5;w.nextSmallAt=N+864e5;
 const say=(id,text,t)=>action(w,{type:'chat',userId:id,name:id,text},t),gift=(id,coins,t)=>action(w,{type:'gift',userId:id,name:id,coins,count:1,giftName:'X',eventId:id+t},t);
 say('a','chao',N);gift('a',8200,N+1);assert.equal(playerWing(w.players.a).name,'Vạn Kiếm Dực');
 say('a','canh 4',N+2);assert.equal(playerWing(w.players.a).name,'Phượng Hoàng Vàng','tự chọn cánh thấp hơn');
 gift('a',100,N+3);assert.equal(playerWing(w.players.a).name,'Phượng Hoàng Vàng','chưa qua mốc mới → giữ lựa chọn');
 gift('a',900,N+4);assert.equal(playerWing(w.players.a).name,'U Minh Quỷ Dực','đủ 9.000 → tự mặc cánh mới');
 say('a','canh 10',N+5);assert.equal(playerWing(w.players.a).name,'Vạn Kiếm Dực','đổi lại được');
 say('a','huy canh',N+6);gift('a',1000,N+7);assert.equal(playerWing(w.players.a),undefined,'đã ẩn cánh thì giữ ẩn');
 // người chọn cánh trước khi hạ mốc (10.372 coin, ghim số 10) → lên Thanh Liên Dực khi tương tác
 say('b','chao',N);Object.assign(w.players.b,{giftCoins:10372,wingChoice:10});delete w.players.b.wingSeen;say('b','chao',N+10);
 assert.equal(playerWing(w.players.b).name,'Thanh Liên Dực');
 say('c','chao',N);Object.assign(w.players.c,{giftCoins:4737,wingChoice:4});delete w.players.c.wingSeen;say('c','chao',N+10);
 assert.equal(playerWing(w.players.c).name,'Phượng Hoàng Vàng','không qua mốc mới thì giữ lựa chọn cũ');
});
