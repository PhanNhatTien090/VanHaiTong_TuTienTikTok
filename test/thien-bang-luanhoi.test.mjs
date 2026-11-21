import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {thienBang,thienBangOrder} from '../ngu-duong.mjs';
import {hallsRankHTML} from '../public/ngu-duong-ui.js';
const N=1_800_000_000_000;
test('21/11: đã chuyển sinh luôn đứng đầu Thiên Bảng, nhiều lần Luân Hồi hơn đứng trên',()=>{
 const w=createWorld('live');
 const mk=(id,totalQi,n=0)=>{const p=ensurePlayer(w,id,id,N);p.totalQi=totalQi;p.reincarnations=n;return p;};
 mk('giau',9e15);mk('giau2',8e15);mk('luanhoi1',1000,1);mk('luanhoi2',10,2);for(let i=0;i<12;i++)mk('x'+i,1e9+i);
 const top=thienBang(w,()=>true,N);
 assert.deepEqual(top.slice(0,4).map(p=>p.id),['luanhoi2','luanhoi1','giau','giau2']);
 assert.equal(top[0].reincarnations,2);assert.equal(top[0].rank,1);assert.equal(top.length,10);
 assert.ok(thienBangOrder({id:'a',totalQi:1,reincarnations:1},{id:'b',totalQi:1e18})<0);
});
test('dòng Luân Hồi có lớp riêng + bánh xe + tên Luân Hồi',()=>{
 const state={halls:{thienBang:[{rank:1,id:'a',name:'A',realm:2,reincarnations:1,active:true},{rank:2,id:'b',name:'B',realm:27}],halls:[]},realms:['Phàm nhân','Luyện Khí','Trúc Cơ'],players:[]};
 const html=hallsRankHTML(state,s=>String(s),5000); // giây 5 của vòng = đang hiện Thiên Bảng
 assert.match(html,/<span class="tb-luanhoi"><i>1<\/i><em><img class="tb-wheel"/);
 assert.match(html,/☸ Nhất Thế Luân Hồi</);
 assert.equal((html.match(/tb-luanhoi/g)||[]).length,1,'chỉ dòng chuyển sinh');
});
