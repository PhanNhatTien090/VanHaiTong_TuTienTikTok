import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,tick,startMountRealmEvent,snapshot} from '../engine.mjs';
import {REGISTER_MS,WAVE_MS,BOSS_MS} from '../mount-realm.mjs';
import {orbsForCoins} from '../public/mount-realm-layout.js';

const NOW=Date.parse('2026-11-16T21:00:00+07:00');
function world(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});w.nextBossAt=NOW+864e5;w.nextSmallAt=NOW+864e5;return w;}
const chat=(w,id,text,at)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},at);
function runToEnd(w,from,keep){let t=from;const end=from+REGISTER_MS+3*WAVE_MS+BOSS_MS+5000;for(;t<end&&!['finished','cancelled'].includes(w.mountRealm.phase);t+=1000){if(t%20000<1000)for(const id of keep)chat(w,id,'tu luyen',t);tick(w,t);}return t;}

test('mốc châu theo tổng quà: 300 → 1 tím, 500 → 2 tím, 1.000 → 1 vàng',()=>{
 assert.deepEqual(orbsForCoins(299),{vip:0,divine:0});
 assert.deepEqual(orbsForCoins(300),{vip:1,divine:0});
 assert.deepEqual(orbsForCoins(500),{vip:2,divine:0});
 assert.deepEqual(orbsForCoins(1000),{vip:0,divine:1});
});

test('trọn một lượt: vào bằng bicanh, đánh yêu thú, Thú vương; ai góp sức nhận 1 châu xanh, quà ≥500 nhận 2 châu tím',()=>{
 const w=world();
 for(const id of ['a','b','c','d'])chat(w,id,'chao',NOW);
 assert.equal(startMountRealmEvent(w,NOW).ok,true);
 for(const id of ['a','b','c','d'])chat(w,id,'bicanh',NOW+1000);
 assert.equal(Object.keys(w.mountRealm.members).length,4);
 tick(w,NOW+REGISTER_MS+10);assert.equal(w.mountRealm.phase,'running');
 action(w,{type:'gift',userId:'a',name:'A',coins:250,count:2,giftName:'X',eventId:'g1'},NOW+REGISTER_MS+2000);
 assert.equal(w.mountRealm.members.a.coins,500);
 runToEnd(w,NOW+REGISTER_MS+3000,['a','b','c','d']);
 assert.equal(w.mountRealm.phase,'finished');
 for(const id of ['b','c','d'])assert.ok(w.players[id].mountOrbs.common>=1,id+' có châu xanh');
 assert.equal(w.players.a.mountOrbs.vip,2);
 const texts=w.feed.map(e=>e.text).join(' | ');
 assert.doesNotMatch(texts,/ngẫu nhiên|tỷ lệ|tỉ lệ|thả tim/i);
});

test('đang có Bí Cảnh: quà không áp quà mặc định và không rút ngắn truyền công; đè sự kiện khác bị chặn',()=>{
 const w=world();chat(w,'a','chao',NOW);startMountRealmEvent(w,NOW);
 assert.equal(startMountRealmEvent(w,NOW+10).ok,false);
 const qi=w.players.a.totalQi;
 action(w,{type:'gift',userId:'a',name:'A',coins:10,count:1,giftName:'X',eventId:'g2'},NOW+2000);
 assert.equal(w.players.a.totalQi,qi,'không cộng tu vi quà mặc định');
 const view=snapshot(w,NOW+3000).mountRealm;assert.ok(view&&view.active);assert.equal(view.members[0].coins,undefined);
});

test('300 người: một nhịp xử lý dưới 25 ms',()=>{
 const w=world();
 for(let i=0;i<300;i++)chat(w,'p'+i,'chao',NOW);
 startMountRealmEvent(w,NOW);for(let i=0;i<300;i++)chat(w,'p'+i,'bicanh',NOW+500);
 tick(w,NOW+REGISTER_MS+10);let worst=0;
 for(let t=NOW+REGISTER_MS+1000;t<NOW+REGISTER_MS+30000;t+=1000){const t0=performance.now();tick(w,t);worst=Math.max(worst,performance.now()-t0);}
 assert.ok(worst<25,'tick '+worst.toFixed(1)+' ms');
});
