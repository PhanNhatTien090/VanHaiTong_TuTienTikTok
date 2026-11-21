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
test('21/11: Tông Chủ / Kim Cương đã chuyển sinh vẫn có dòng Luân Hồi',async()=>{
 const {luanHoiExtra}=await import('../public/title-plaques.js');
 const master={honor:{role:'sect-master'},giftCoins:15493,reincarnations:1};
 assert.equal(titleOf(master,N).kind,'master');const lh=luanHoiExtra(master,N);assert.equal(lh.kind,'luanhoi');assert.equal(lh.text,'LUÂN HỒI');assert.equal(lh.n,1);
 assert.equal(luanHoiExtra(master,N,true).kind,'luanhoi','ngồi ghế Tông Chủ vẫn hiện Luân Hồi');
 assert.equal(luanHoiExtra({giftCoins:5000,reincarnations:2},N).n,2);
 assert.equal(luanHoiExtra({giftCoins:0,reincarnations:1},N),null,'danh hiệu chính đã là Luân Hồi → không lặp');
 assert.equal(luanHoiExtra({giftCoins:5000},N),null);
});
test('21/11 tối: tên NGẮN 2–3 chữ, mỗi danh hiệu có ảnh chữ',async()=>{
 const {SHORT,eventKey,rankKey}=await import('../public/title-plaques.js');
 const fs=await import('node:fs');
 for(const [k,v] of Object.entries(SHORT)){assert.ok(v.split(' ').length<=3,v+' quá dài');assert.ok(fs.existsSync(new URL('../public/assets/title-text/'+k+'.webp',import.meta.url)),'thiếu ảnh '+k);}
 const ev=n=>titleOf({giftCoins:0,funTitle:{name:n,until:N+1}},N).text;
 assert.equal(ev('Đan Tặc • Kẻ Nổ Lò'),'KẺ NỔ LÒ');assert.equal(ev('Đầu Sắt'),'ĐẦU SẮT');assert.equal(ev('Thiết Thủ Vương'),'VUA GÕ ĐẦU');
 assert.equal(ev('Băng Tâm Cứu Lô'),'THẦN CỨU LÒ');assert.equal(ev('Mê Cung Chi Chủ'),'VUA MÊ CUNG');assert.equal(ev('Độ Kiếp Tán Tiên'),'VƯỢT KIẾP');assert.equal(ev('Hộ Đạo Chân Quân'),'HỘ ĐẠO VƯƠNG');
 assert.equal(titleOf({giftCoins:0,alchemyTitle:{name:'Đan Sư Tông Môn',until:N+1}},N).text,'THẦN LUYỆN ĐAN');
 assert.equal(titleOf({giftCoins:0,tournamentTitle:'Kiếm Khôi Tông Môn'},N).text,'KIẾM KHÔI');
 assert.equal(titleOf({giftCoins:1500},N).text,'ĐẠI GIA');assert.equal(titleOf({giftCoins:500},N).text,'NHÀ GIÀU');assert.equal(titleOf({giftCoins:150},N).text,'PHÚ HỘ');
 assert.equal(titleOf({giftCoins:500,honor:{role:'guardian',title:'ĐẠI HỘ PHÁP'}},N).text,'THẦN TÀI');
 assert.equal(titleOf({giftCoins:500,honor:{role:'patron',title:'THIÊN ĐẠO CUNG PHỤNG'}},N).text,'NHÀ GIÀU','bỏ chữ cung phụng dài');
 for(const [t,k] of [['ĐẠI TRƯỞNG LÃO','lao-to'],['NGUYÊN LÃO TÔNG MÔN','lao-lang'],['TIÊN ĐẾ','tien-de'],['ĐẠI LA TÔN GIẢ','ton-gia'],['THÁI ẤT CHÂN QUÂN','ton-gia'],['KIM TIÊN','tien-nhan'],['THƯỢNG TIÊN','tien-nhan'],['TRUYỀN CÔNG TRƯỞNG LÃO','truong-lao'],['CHẤP SỰ','chap-su'],['QUÝ KHÁCH TÔNG MÔN','quy-khach']])assert.equal(rankKey(t),k,t);
 assert.equal(eventKey('xyz'),null);
});
