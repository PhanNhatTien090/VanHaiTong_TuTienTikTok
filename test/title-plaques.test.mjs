import test from 'node:test';import assert from 'node:assert/strict';
import {titleOf,titleVisible,eventIcon,layoutTitles} from '../public/title-plaques.js';
const N=1_800_000_000_000;
test('21/11 tối: overlay chỉ vẽ danh hiệu server tính sẵn (p.title); không icon; nạp chỉ lóe khi sparkle',()=>{
 assert.equal(titleOf({giftCoins:99999},N),null,'server cũ / không có ghế → không vẽ');
 const t=titleOf({title:{key:'than-tai',rank:1,group:'paid',sparkle:1}},N);assert.equal(t.text,'THẦN TÀI');assert.equal(t.kind,'paid');assert.equal(t.paid,true);
 assert.equal(titleOf({title:{key:'phu-ho',rank:7,group:'paid'}},N).paid,false,'dưới 3.000 không lóe');
 assert.equal(titleOf({title:{key:'ma-dao-vuong'}},N).kind,'evil');assert.equal(titleOf({title:{key:'nu-khoi-tong-mon'}},N).kind,'love');
 assert.equal(titleOf({title:{key:'khong-co'}},N),null);assert.equal(titleOf({resident:true,title:{key:'than-tai'}},N),null);
 assert.equal(eventIcon('Đầu Sắt'),null);
});
test('sân đông chỉ hiện bậc cao',()=>{
 const ev={rank:8},vip={rank:2},lh={rank:3};assert.ok(titleVisible(ev,30));assert.ok(!titleVisible(ev,31));assert.ok(titleVisible(lh,40));assert.ok(!titleVisible(lh,51));assert.ok(titleVisible(vip,60));
});
test('xếp chỗ: không chồng chữ, bậc cao giữ chỗ sát đầu',()=>{
 const it=(id,rank,x,y)=>({id,rank,x,y,w:100,h:24});
 const out=layoutTitles([it('thap',5,100,200),it('cao',1,130,200),it('xa',5,400,200)]);
 const cao=out.find(o=>o.id==='cao'),thap=out.find(o=>o.id==='thap');
 assert.equal(cao.y,200,'bậc cao ở sát đầu');assert.ok(thap.y<200,'bậc thấp nhích lên');assert.equal(out.find(o=>o.id==='xa').y,200);
 for(const a of out)for(const b of out)if(a!==b)assert.ok(!(a.x0<b.x0+b.w&&a.x0+a.w>b.x0&&a.y0<b.y0+b.h&&a.y0+a.h>b.y0),'không chồng');
 assert.equal(layoutTitles([it('a',1,100,200),it('b',5,100,200),it('c',5,100,200)]).length,2,'hết chỗ thì ẩn');
});
test('21/11: đang mặc danh hiệu khác vẫn có dòng Luân Hồi (p.title.lh) + ghế Tông Chủ',async()=>{
 const {luanHoiExtra}=await import('../public/title-plaques.js');
 const master={title:{key:'tong-chu',rank:0,group:'paid',lh:1},reincarnations:1};
 assert.equal(titleOf(master,N).key,'tong-chu');const lh=luanHoiExtra(master,N);assert.equal(lh.key,'luan-hoi');assert.equal(lh.n,1);
 assert.equal(luanHoiExtra({reincarnations:2},N,true).n,2,'ngồi ghế Tông Chủ vẫn hiện Luân Hồi');
 assert.equal(luanHoiExtra({title:{key:'luan-hoi',n:1},reincarnations:1},N),null,'đang mặc Luân Hồi → không lặp');
 assert.equal(luanHoiExtra({giftCoins:5000},N),null);
});
test('mọi danh hiệu ngắn ≤4 chữ',async()=>{
 const {SHORT}=await import('../public/title-plaques.js');for(const v of Object.values(SHORT))assert.ok(v.split(' ').length<=4,v);
});
