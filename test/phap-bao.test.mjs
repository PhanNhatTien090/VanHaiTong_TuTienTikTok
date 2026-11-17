import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startBaoKhoEvent,BIG_EVENTS} from '../engine.mjs';
import {rollBao,BAO_ODDS,baoKhoView} from '../phap-bao.mjs';
import {BAO_PITY4,BAO_PITY5,BAO_EVENT_MS,BAO_FREE_CD} from '../public/phap-bao-data.js';
const N=1800000000000;
const world=()=>{const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e10;return w;};
const miss=()=>.999999; // không bao giờ trúng ngẫu nhiên → chỉ còn bảo hiểm

test('bảo hiểm: 4★ chắc chắn trong mỗi 10 lượt, 5★ trong 80 lượt; trượt không lưu đồ',()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);const got=[];
 for(let i=1;i<=BAO_PITY5;i++)got.push(rollBao(w,p,'free',miss).tier);
 assert.ok(got.slice(0,9).every(t=>t===0),'9 lượt đầu trượt');assert.equal(got[9],4,'lượt 10 chắc 4★');
 for(let i=0;i+10<=got.length;i+=10)assert.ok(got.slice(i,i+10).some(t=>t>=4),'mỗi 10 lượt có ≥4★');
 assert.equal(got[BAO_PITY5-1],5,'lượt 80 chắc 5★');
 assert.equal(Object.keys(p.bao).sort().join(),'items,lim,p4,p5','dữ liệu gọn');
});

test('GIỚI HẠN không bảo hiểm; mỗi người tối đa 1 món/mùa; đúng 12 suất',()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);
 for(let i=0;i<400;i++)assert.notEqual(rollBao(w,p,'g999',miss).tier,6,'không ra GIỚI HẠN nhờ bảo hiểm');
 const lucky=()=>0;
 assert.equal(rollBao(w,p,'g999',lucky).tier,6);assert.notEqual(rollBao(w,p,'g999',lucky).tier,6,'đã có 1 món mùa này');
 for(let i=0;i<20;i++)rollBao(w,ensurePlayer(w,'b'+i,'B'+i,N),'g999',lucky);
 assert.equal(Object.keys(w.baoSeason.owners).length,12);
});

test('sự kiện: "cầu" free hồi 30 s; quà = lượt + tu vi; overlay không lộ số cơ duyên; chưa vào vòng xoay tự động',()=>{
 assert.ok(!BIG_EVENTS.some(([id])=>id==='bao-kho'),'chưa có màn hình overlay → không tự mở');
 const w=world(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:3,totalQi:1e6,lastActive:N});
 assert.equal(startBaoKhoEvent(w,N).ok,true);
 assert.equal(action(w,{type:'chat',text:'cầu',userId:'a'},N+10).ok,true);
 assert.equal(action(w,{type:'chat',text:'cau',userId:'a'},N+20).ok,false,'đang hồi');
 assert.equal(action(w,{type:'chat',text:'cau',userId:'a'},N+10+BAO_FREE_CD).ok,true);
 const qi=p.totalQi;action(w,{type:'gift',userId:'a',coins:10,count:3,giftName:'x'},N+40000);
 assert.equal(w.baoKho.hunters.a.n,5,'2 free + 3 quà');assert.ok(p.totalQi>qi,'quà có tu vi an ủi');
 const v=JSON.stringify(baoKhoView(w,N+41000));for(const k of ['g999','q5','limitedIn5','soft5From'])assert.ok(!v.includes(k),'không lộ '+k);
 assert.ok(snapshot(w,N+41000).baoKho,'có trong snapshot');
 tick(w,N+BAO_EVENT_MS+1000);assert.equal(w.baoKho.phase,'finished');
 assert.notEqual(action(w,{type:'chat',text:'cau',userId:'a'},N+BAO_EVENT_MS+60000)?.ok&&w.baoKho.hunters.a.n>5,true,'hết sự kiện không cầu được');
});
