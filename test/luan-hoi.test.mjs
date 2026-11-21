// 18/11/2026: Luân Hồi — thưởng vĩnh viễn sau chuyển sinh + màn chiếu riêng.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,requiredQi,requiredStones,power} from '../engine.mjs';
import {REBIRTH_UNLOCK_REALM} from '../public/progression.js';
import {LUAN_HOI,combatRealm,pastLifeCost,luanHoiHandQi,luanHoiArenaHp,luanHoiArenaAtk,daoFree,luanHoiTier,luanHoiTitle} from '../public/luan-hoi-data.js';
import {soLenhPage,lateSoLenh,SO_LENH,BOARD_CYCLE_MS} from '../public/so-lenh.js';
import {LUAN_HOI_SCORE} from '../public/luan-hoi-audio.js';
import {LH,LUAN_HOI_MS,findLuanHoi} from '../public/luan-hoi-cinema.js';
const N=Date.parse('2026-11-18T20:00:00+07:00');
function setup(){const w=createWorld('live');const p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:REBIRTH_UNLOCK_REALM,stones:500,giftCoins:300});p.qi=requiredQi(p);return {w,p};}
const chat=(w,text,at=N)=>action(w,{type:'chat',userId:'a',text},at);
const reborn=(w,p,at=N)=>{p.qi=requiredQi(p);chat(w,'chuyển sinh',at);return chat(w,'chuyển sinh xác nhận',at+1);};

test('chuyển sinh mở màn chiếu Luân Hồi (server hẹn giờ) thay cho màn đổi skin chung',()=>{
 const {w,p}=setup();assert.equal(reborn(w,p).reborn,true);
 const cut=w.luanHoiCut;assert.ok(cut);assert.equal(cut.pid,'a');assert.equal(cut.n,1);assert.equal(cut.fromRealm,REBIRTH_UNLOCK_REALM);assert.equal(cut.ms,LUAN_HOI_MS);assert.ok(cut.at>N);
 const e=w.events.find(x=>x.rebirth);assert.equal(e.effect,'rebirth');assert.equal(e.transform,undefined);assert.equal(e.count,1);
 assert.equal(findLuanHoi(cut,cut.at-1),null);assert.ok(findLuanHoi(cut,cut.at+1000));assert.equal(findLuanHoi(cut,cut.at+LUAN_HOI_MS),null);
});

test('Ký ức tiền kiếp: cảnh giới đã vượt chỉ cần 60% tu vi + linh thạch; cảnh giới mới vẫn đủ giá',()=>{
 const {w,p}=setup();const full={...p,realm:20,reincarnations:0};const needFull=requiredQi(full),stFull=requiredStones(full);
 reborn(w,p);p.realm=20;assert.equal(requiredQi(p),Math.round(needFull*LUAN_HOI.pastLifeCost));assert.equal(requiredStones(p),Math.round(stFull*LUAN_HOI.pastLifeCost));
 p.realm=REBIRTH_UNLOCK_REALM;assert.equal(pastLifeCost(p),1);
});

test('Luân Hồi tâm pháp chỉ nhân khi chơi tay (quà/sự kiện giữ số gốc), có trần',()=>{
 assert.equal(luanHoiHandQi({reincarnations:1}),1.15);assert.equal(luanHoiHandQi({reincarnations:9}),1+LUAN_HOI.handQiMax);
 assert.equal(luanHoiHandQi({reincarnations:2,daoQua:{dan:3}}),1+.3+.24);
 const gift=reincarn=>{const w=createWorld('live');const p=ensurePlayer(w,'g','G',N);Object.assign(p,{realm:10,highestRealm:28,reincarnations:reincarn,qi:0});const before=p.qi;action(w,{type:'gift',userId:'g',coins:1,count:1,giftName:'Rose',eventId:'x'+reincarn},N);return p.qi-before;};
 // quà không nhân tâm pháp (cùng cảnh giới, cùng tiền kiếp)
 assert.ok(gift(1)>0);assert.equal(gift(1),gift(5));
});

test('Luân Hồi Ấn + Đạo Quả: sức chiến đấu không tụt về Phàm nhân',()=>{
 const p={realm:0,highestRealm:28,reincarnations:1,manuals:[],artifacts:[]};assert.equal(combatRealm(p),Math.floor(28*LUAN_HOI.keepRealm));
 assert.equal(combatRealm({realm:20,highestRealm:28,reincarnations:1}),20);assert.equal(combatRealm({realm:5}),5);
 assert.ok(power(p)>power({...p,reincarnations:0}));
 assert.equal(luanHoiArenaHp({reincarnations:1}),1.04);assert.ok(Math.abs(luanHoiArenaHp({reincarnations:9,daoQua:{the:3}})-(1+LUAN_HOI.hpMax+.15))<1e-9);
 assert.equal(luanHoiArenaAtk({daoQua:{kiem:2}}),1.08);
});

test('đạo quả: 1 điểm mỗi lần chuyển sinh, tối đa 3 tầng mỗi Đạo, gõ có dấu cách vẫn nhận',()=>{
 const {w,p}=setup();assert.equal(chat(w,'đạo quả kiếm').ok,false);
 reborn(w,p);assert.equal(daoFree(p),1);
 const r=chat(w,'đạo quả kiếm',N+10);assert.equal(r.ok,true);assert.deepEqual(p.daoQua,{kiem:1});assert.equal(daoFree(p),0);
 assert.equal(chat(w,'daoqua the',N+20).ok,false);
 p.reincarnations=5;for(let i=0;i<2;i++)assert.equal(chat(w,'daoqua kiem',N+30+i).ok,true);assert.equal(chat(w,'daoqua kiem',N+40).ok,false);
 assert.equal(chat(w,'daoqua 2',N+50).ok,true);assert.equal(p.daoQua.the,1);
 assert.match(chat(w,'luân hồi',N+60).message,/Ngũ Thế Luân Hồi/);
});

test('hướng dẫn + bậc + nhạc khớp mốc',()=>{
 // 20/11: trang Luân Hồi chuyển sang Sổ lệnh (so-lenh.js) — chỉ xoay tới khi đã có người cảnh giới 26+ hoặc đã chuyển sinh
 assert.ok(lateSoLenh({players:[{name:'X',realm:3,reincarnations:2}]}));assert.ok(lateSoLenh({players:[{name:'Y',realm:27}]}));assert.equal(lateSoLenh({players:[{name:'Z',realm:10}]}),false);
 const ids=late=>new Set(Array.from({length:SO_LENH.length*2},(_,i)=>soLenhPage(i*BOARD_CYCLE_MS,late).id));assert.ok(ids(true).has('luan'));assert.ok(!ids(false).has('luan'));
 assert.equal(luanHoiTier(0),null);assert.equal(luanHoiTier(4).name,'Tam Luân');assert.equal(luanHoiTitle(1),'Nhất Thế Luân Hồi');
 assert.ok(LUAN_HOI_SCORE.some(c=>Math.abs(c.at-LH.impact)<.01));assert.ok(LUAN_HOI_SCORE.every(c=>c.at>=0&&c.at<LH.duration));
});

test('màn đột phá của người đã chuyển sinh có khung Luân Hồi; người thường thì không',async()=>{
 const {luanHoiRitualInfo}=await import('../public/luan-hoi-fx.js');
 assert.equal(luanHoiRitualInfo({realm:10}),null);assert.equal(luanHoiRitualInfo({realm:10,reincarnations:2,resident:true}),null);
 const a=luanHoiRitualInfo({realm:10,highestRealm:27,reincarnations:2});assert.equal(a.n,2);assert.equal(a.hi,27);assert.equal(a.beyond,false);
 assert.equal(luanHoiRitualInfo({realm:28,highestRealm:27,reincarnations:2}).beyond,true);
});
test('21/11: người đã chuyển sinh đột phá → thông báo + giọng Luân Hồi; khung tra được cả Tông Chủ đang ngồi ghế',async()=>{
 const {speechPlan}=await import('../speech-lines.mjs');
 const plan=speechPlan({effect:'breakthrough',name:'Đế giang',text:'ĐỘT PHÁ LUYỆN HƯ • NHẤT THẾ LUÂN HỒI',rebirths:1,user:'a',id:'z1'});
 assert.match(plan[0].text,/Nhất Thế Luân Hồi/);assert.match(plan[0].text,/Luyện Hư/);
 const beyond=speechPlan({effect:'breakthrough',name:'Đế giang',text:'ĐỘT PHÁ LUYỆN HƯ • PHÁ VỠ TIỀN KIẾP · NHỊ THẾ LUÂN HỒI',rebirths:2,beyondPast:true,user:'a',id:'z2'});
 assert.match(beyond[0].text,/tiền kiếp/i);
 const {luanHoiRitualInfo}=await import('../public/luan-hoi-fx.js');assert.ok(luanHoiRitualInfo({reincarnations:1,realm:3,highestRealm:28}));
});
