import test from 'node:test';import assert from 'node:assert/strict';
import {titleOf,titleVisible,eventIcon,layoutTitles} from '../public/title-plaques.js';
const N=1_800_000_000_000;
test('tự đeo danh hiệu xịn nhất: Tông Chủ > VIP > sự kiện > chức vị',()=>{
 const fun={name:'Thiết Thủ Vương',until:N+1000};
 assert.equal(titleOf({honor:{role:'sect-master'},giftCoins:50000,funTitle:fun},N).kind,'master');
 const vip=titleOf({giftCoins:100000,funTitle:fun,honor:{title:'THƯỢNG TIÊN'}},N);assert.equal(vip.kind,'vip3');assert.equal(vip.paid,true);
 const ev=titleOf({giftCoins:0,funTitle:fun,honor:{title:'THƯỢNG TIÊN'}},N);assert.equal(ev.kind,'feat');assert.equal(ev.icon,'hammer');assert.ok(!ev.paid);
 assert.equal(titleOf({giftCoins:0,funTitle:{name:'X',until:N-1},honor:{title:'THƯỢNG TIÊN'}},N).kind,'rank','hết hạn → về chức vị');
 assert.equal(titleOf({resident:true,giftCoins:99999},N),null);
});
test('icon theo sự kiện',()=>{
 assert.equal(eventIcon('Đầu Sắt'),'hammer');assert.equal(eventIcon('Đan Tặc • Kẻ Nổ Lò'),'cauldron');assert.equal(eventIcon('Băng Tâm Cứu Lô'),'cauldron');
 assert.equal(eventIcon('Hộ Đạo Chân Quân'),'lightning');assert.equal(eventIcon('Độ Kiếp Tán Tiên'),'lightning');assert.equal(eventIcon('Mê Cung Chi Chủ'),'compass');
 assert.equal(eventIcon('Kiếm Khôi Tỷ Thí'),'sword');
});
test('sân đông chỉ hiện bậc cao',()=>{
 const feat={rank:5},vip3={rank:1};assert.ok(titleVisible(feat,20));assert.ok(!titleVisible(feat,31));assert.ok(titleVisible(vip3,60));
});
test('xếp chỗ: không chồng chữ, bậc cao giữ chỗ sát đầu',()=>{
 const it=(id,rank,x,y)=>({id,rank,x,y,w:100,h:24});
 const out=layoutTitles([it('thap',5,100,200),it('cao',1,130,200),it('xa',5,400,200)]);
 const cao=out.find(o=>o.id==='cao'),thap=out.find(o=>o.id==='thap');
 assert.equal(cao.y,200,'bậc cao ở sát đầu');assert.ok(thap.y<200,'bậc thấp nhích lên');assert.equal(out.find(o=>o.id==='xa').y,200);
 for(const a of out)for(const b of out)if(a!==b)assert.ok(!(a.x0<b.x0+b.w&&a.x0+a.w>b.x0&&a.y0<b.y0+b.h&&a.y0+a.h>b.y0),'không chồng');
 assert.equal(layoutTitles([it('a',1,100,200),it('b',5,100,200),it('c',5,100,200)]).length,2,'hết chỗ thì ẩn');
});
