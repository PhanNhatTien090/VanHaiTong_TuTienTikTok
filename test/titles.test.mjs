// 21/11/2026 tối: danh hiệu GHẾ HIẾM (titles.mjs) + lệnh "danh hiệu" / "danh hiệu N".
import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,snapshot,commandWords} from '../engine.mjs';
import {titleHolders,titleView,titleCommand,syncSeats,noteChat,weekNo} from '../titles.mjs';
import {TITLE_LIST} from '../public/title-data.js';
import fs from 'node:fs';
const N=1_800_000_000_000;
function world(n=14){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false});for(let i=0;i<n;i++){const p=ensurePlayer(w,'p'+i,'Người '+i,N);p.gender=i%2?'nu':'nam';}return w;}
const own=(w,id,t=N)=>[...titleHolders(w,t)].filter(([,s])=>s.has(id)).map(([k])=>k);
test('nạp: xếp hạng tổng quà từ 300 coin — Thần Tài / Đại Gia / Nhà Giàu / Phú Hộ; dưới 300 không có',()=>{
 const w=world();w.players.p0.giftCoins=9000;w.players.p1.giftCoins=5000;w.players.p2.giftCoins=4000;for(let i=3;i<11;i++)w.players['p'+i].giftCoins=3000-i*100;w.players.p11.giftCoins=350;w.players.p12.giftCoins=299;
 assert.ok(own(w,'p0').includes('than-tai'));assert.ok(own(w,'p1').includes('dai-gia'));assert.ok(own(w,'p2').includes('dai-gia'));assert.ok(own(w,'p3').includes('nha-giau'));
 assert.ok(own(w,'p10').includes('phu-ho'));assert.ok(own(w,'p11').includes('phu-ho'));assert.deepEqual(own(w,'p12'),[]);
 assert.equal(titleView(w,w.players.p0,N).sparkle,1,'≥3.000 lấp lánh');assert.equal(titleView(w,w.players.p11,N).sparkle,undefined,'dưới 3.000 không lấp lánh');
});
test('sự kiện: người thắng lượt gần nhất giành ghế (lượt sau chuyển người)',()=>{
 const w=world();w.players.p1.funTitle={name:'Mê Cung Chi Chủ',until:N+3600000};assert.ok(own(w,'p1').includes('vua-me-cung'));
 w.players.p2.funTitle={name:'Mê Cung Chi Chủ',until:N+7200000};const h=titleHolders(w,N+10000);assert.deepEqual([...h.get('vua-me-cung')],['p2'],'người thắng sau giành');
 w.players.p2.funTitle=null;assert.deepEqual([...titleHolders(w,N+20000).get('vua-me-cung')],['p2'],'hết funTitle vẫn giữ ghế');
 w.sectWar={finishedAt:N+5000,result:{honor:{top:{ma:[{id:'p3'},{id:'p4'}],chinh:[{id:'p5'}]}}}};const h2=titleHolders(w,N+30000);
 assert.ok(h2.get('ma-dao-vuong').has('p3'));assert.ok(h2.get('doc-vuong').has('p4'));assert.ok(h2.get('chinh-dao-minh-chu').has('p5'));
});
test('tình cảm + tông môn: nữ nhiều đạo lữ nhất = Nữ Khôi; Lắm Mồm theo bình luận tuần (chống spam 2 s)',()=>{
 const w=world();w.players.p1.bondIds=['a','b','c'];w.players.p3.bondIds=['a'];w.players.p2.bondIds=['x','y'];
 const h=titleHolders(w,N);assert.ok(h.get('nu-khoi-tong-mon').has('p1'));assert.ok(h.get('dao-hoa-vuong').has('p2'));
 const p=w.players.p4;for(let i=0;i<30;i++)noteChat(p,N+i*500);assert.equal(p.chatWeek.n,8,'dồn trong 2 s chỉ tính 1');
 for(let i=0;i<30;i++)noteChat(p,N+20000+i*2500);assert.ok(titleHolders(w,N+200000).get('lam-mom').has('p4'));
 assert.equal(weekNo(N+7*86400000),weekNo(N)+1);
});
test('Lắm Mồm chỉ đếm bình luận thường: không lệnh, không lúc câu đố mở, không chỉ số/emoji',()=>{
 const w=world();const n=()=>w.players.p5.chatWeek?.n||0;let t=N+100000;
 const say=text=>{t+=5000;action(w,{type:'chat',userId:'p5',name:'Người 5',text,fromLive:true},t);};
 say('hôm nay trời đẹp quá');assert.equal(n(),1,'trò chuyện thường được tính');
 say('tu luyện');say('1');say('đột phá');say('vào đường 2');say('danh hiệu');assert.equal(n(),1,'lệnh không tính');
 say('😂😂');say('8');assert.equal(n(),1,'chỉ số/emoji không tính');
 w.quiz={q:'?',a:['con mèo'],startedAt:t,endsAt:t+999999,order:[],claimed:{}};say('con chó');say('con gà');assert.equal(n(),1,'đoán câu đố không tính');
 w.quiz=null;say('mai gặp lại nhé');assert.equal(n(),2);
});
test('lệnh danh hiệu: xem có số, mặc theo số, ẩn, tự động; ảnh đủ cho mọi danh hiệu',()=>{
 const w=world();w.players.p0.giftCoins=500;w.players.p0.bondIds=['a','b'];
 assert.deepEqual(commandWords('danh hiệu 2').slice(0,2),['danhhieu','2']);
 const r=action(w,{type:'chat',text:'danh hiệu',userId:'p0'},N);assert.equal(r.ok,true);
 const ev=w.events.at(-1);assert.equal(ev.card.kind,'titles');assert.equal(ev.card.items.length,2);assert.equal(ev.card.items[0].key,'than-tai');
 action(w,{type:'chat',text:'danh hiệu 2',userId:'p0'},N+100);assert.equal(w.players.p0.titlePick,'dao-hoa-vuong');
 assert.equal(titleView(w,w.players.p0,N+200).key,'dao-hoa-vuong');
 assert.equal(titleCommand(w,w.players.p0,'9',N).ok,false);
 action(w,{type:'chat',text:'danh hiệu ẩn',userId:'p0'},N+300);assert.equal(titleView(w,w.players.p0,N+400),null);
 action(w,{type:'chat',text:'danh hiệu tự động',userId:'p0'},N+500);assert.equal(titleView(w,w.players.p0,N+600).key,'than-tai');
 const snap=snapshot(w,N+700);assert.equal(snap.players.find(p=>p.id==='p0').title.key,'than-tai');
 for(const t of TITLE_LIST)assert.ok(fs.existsSync(new URL('../public/assets/title-text/'+t.key+'.webp',import.meta.url)),'thiếu ảnh '+t.key);
});
