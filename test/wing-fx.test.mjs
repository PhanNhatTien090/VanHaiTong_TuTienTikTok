import {test} from 'node:test';import assert from 'node:assert/strict';
import {_burstOf,WING_BURST_MS,WING_BURST_GAP} from '../public/wing-fx.js';
import {WING_TIERS,wingTier} from '../public/boss-arena.js';
test('mốc cánh mới giãn dần 8.500 / 10.000 / 12.000 / 15.000, có hiệu ứng biến hình',()=>{
 assert.deepEqual(WING_TIERS.filter(w=>w.fx).map(w=>[w.min,w.fx]),[[8500,'swords'],[10000,'demon'],[12000,'lotus'],[15000,'heaven']]);
 assert.equal(wingTier(10676).fx,'demon');assert.equal(wingTier(27420).fx,'heaven');assert.equal(wingTier(7999).min,7000);
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
