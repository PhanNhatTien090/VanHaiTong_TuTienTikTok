import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startAlchemy,stopAlchemy,startRace} from '../engine.mjs';
import {ALC,zoneAt,gradeOf} from '../alchemy.mjs';
import {speechPlan} from '../speech-lines.mjs';
import {isEventAnnouncement} from '../public/event-announcements.js';
const N=1800000000000;
function setup(n=6){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<n;i++)ensurePlayer(w,'p'+i,'Người '+i,N);return w;}
const chat=(w,id,text,t)=>action(w,{type:'chat',text,userId:id},t);
const like=(w,id,count,t)=>action(w,{type:'like',userId:id,count},t);
const gift=(w,id,coins,t,eid)=>action(w,{type:'gift',userId:id,coins,count:1,eventId:eid||'g'+t+id},t);
function brewing(w){assert.ok(startAlchemy(w,N).ok);like(w,'p0',10,N+100);tick(w,N+ALC.openMs);assert.equal(w.alchemy.phase,'brewing');return N+ALC.openMs;}
test('mở lò: 3 chuyển, vùng vàng trôi trong 0..100, lò luôn chạy kể cả ít người',()=>{
 const w=setup(2),t=brewing(w),e=w.alchemy;assert.equal(e.round,1);
 for(let k=0;k<40000;k+=1000){const z=zoneAt(e,t+k);assert.ok(z.lo>=0&&z.hi<=100&&z.hi>z.lo);}
});
test('lửa tự nguội; tim đẩy lửa lên; giữ trong vùng vàng thì phẩm tăng, nguội thì không',()=>{
 const w=setup(2),t=brewing(w),e=w.alchemy;const h0=e.heat;tick(w,t+1000);tick(w,t+2000);assert.ok(e.heat<h0,'tự nguội');
 const before=e.heat;like(w,'p0',40,t+2100);assert.ok(e.heat>before,'tim quạt lửa');
 const w2=setup(2),t2=brewing(w2),e2=w2.alchemy;for(let s=0;s<30;s++){e2.heat=zoneAt(e2,t2+s*1000).c;tick(w2,t2+s*1000+1000);}assert.ok(e2.points>20,'giữ vùng vàng ~30s → điểm '+e2.points);
});
test('một người không gánh/không phá được ngay: trần 4 đơn vị / 5 s; đông người mỗi tim yếu đi',()=>{
 const w=setup(2),t=brewing(w),e=w.alchemy;e.heat=20;like(w,'p0',5000,t+10);assert.ok(e.heat<=20+ALC.heartCapUnits*ALC.heatPerUnit+1e-6);
 const big=setup(60);assert.ok(startAlchemy(big,N).ok);for(let i=0;i<60;i++)like(big,'p'+i,10,N+200+i);tick(big,N+ALC.openMs);const tb=N+ALC.openMs,eb=big.alchemy;eb.heat=10;for(let i=0;i<60;i++)like(big,'p'+i,40,tb+10+i);assert.ok(eb.heat<100,'60 người cùng quạt một lần chưa nổ ngay: '+eb.heat.toFixed(1));
});
test('phòng 100 người có mặt mà chỉ 6 người thả tim vẫn giữ được lửa (không quá khó)',()=>{
 const w=setup(100),t=brewing(w),e=w.alchemy;tick(w,t+100);e.heat=40;for(let s=0;s<10;s+=5){for(let i=1;i<=6;i++)like(w,'p'+i,40,t+200+s*1000+i);tick(w,t+(s+5)*1000);}assert.ok(e.heat>25,'6 người quạt 10 s, lửa còn '+e.heat.toFixed(1));
});
test('LIVE có chống tự thả tim (~2 tim/s/người): 2 người thả đều vẫn làm lửa lên',()=>{
 const w=setup(9),t=brewing(w),e=w.alchemy;w.settings.heartGate=true;e.heat=30;const h0=e.heat;
 for(let s=0;s<10;s++){for(const id of ['p1','p2'])like(w,id,30,t+s*1000+(id==='p1'?1:2));tick(w,t+s*1000+500);}assert.ok(e.heat>h0+5,'lửa phải lên: '+h0+' → '+e.heat.toFixed(1));
});
test('quá nóng giữ ≥2,5 s → NỔ LÒ: khói đen, Kẻ Nổ Lò, ai góp vẫn nhận bã đan; hoa hồng cứu lò kịp',()=>{
 const w=setup(3),t=brewing(w),e=w.alchemy;e.heat=99;like(w,'p1',40,t+10);assert.ok(e.heat>=ALC.overHeat);
 const w2=setup(3),t2=brewing(w2),e2=w2.alchemy;e2.heat=99;like(w2,'p1',40,t2+10);gift(w2,'p2',1,t2+900);assert.ok(e2.heat<90,'hoa hồng dập lửa');tick(w2,t2+3000);assert.equal(e2.phase,'brewing','không nổ');
 assert.ok(e2.fx.some(f=>f.kind==='rose'&&f.saved));
 for(const k of [1000,2000,3200]){e.heat=100;tick(w,t+k);}assert.equal(e.phase,'finished');assert.equal(e.result.exploded,true);assert.equal(e.result.culprit.id,'p1');
 assert.equal(w.players.p1.funTitle.name,'Đan Tặc • Kẻ Nổ Lò');assert.ok(w.players.p1.pills['qi-pill']>=1);
 const s=snapshot(w,t+20000);assert.ok(s.alchemy.sootUntil>t+20000&&s.alchemy.sootIds.includes('p1'),'mặt đen còn sau bảng kết quả');
 const ev=w.events.find(x=>x.alchemyExplode);assert.ok(ev&&isEventAnnouncement(ev));
});
test('quà: Linh dược +phẩm có trần mỗi chuyển; Tiên Hỏa ≥99 khóa lửa 10 s; quà trùng ID không tính lại',()=>{
 const w=setup(3),t=brewing(w),e=w.alchemy;const p0=e.points;gift(w,'p1',10,t+10,'h1');assert.ok(e.points>p0);for(let i=0;i<10;i++)gift(w,'p1',10,t+20+i,'h'+(i+2));assert.ok(e.points-p0<=ALC.herbRoundCap+.5);
 gift(w,'p2',199,t+100,'f1');assert.ok(e.lockUntil>=t+100+ALC.fireLockMs);like(w,'p0',40,t+200);const z=zoneAt(e,t+200);assert.ok(Math.abs(e.heat-z.c)<1,'khóa lửa: tim không làm lệch');
 gift(w,'p2',199,t+300,'f1');assert.equal(e.members.p2.gift,199);
});
test('chọn dược liệu: gõ 1/2 trong lúc hỏi, đa số đúng thì +điểm; ngoài lúc hỏi thì không bắt lệnh',()=>{
 const w=setup(5),t=brewing(w),e=w.alchemy;assert.equal(chat(w,'p1','1',t+100)?.alchemy,undefined,'chưa tới lúc hỏi');
 const q=e.quiz;q.type='lore';q.answer=1;const at=q.startsAt+100;['p1','p2','p3'].forEach((id,i)=>chat(w,id,'2',at+i));chat(w,'p4','1',at+5);
 const p0=e.points;tick(w,q.endsAt+10);assert.equal(q.result,'right');assert.ok(e.points>=p0+ALC.quizRight-1);
});
test('chuột tinh: đủ người gõ bat thì đuổi được, không thì mất điểm',()=>{
 const w=setup(6),t=brewing(w),e=w.alchemy;e.incident={kind:'rat',startsAt:t+10,endsAt:t+9000,started:false,chasers:{}};tick(w,t+1000);assert.ok(e.incident.started);
 for(let i=0;i<e.incident.need;i++)chat(w,'p'+i,'bat',t+1100+i);assert.equal(e.incident.result,'chased');
});
test('đủ 3 chuyển: phẩm ≥7 thì đan kiếp; giữ kết giới thì đan thành, thưởng % tu vi cần, Đan Sư 24 giờ, không thưởng hai lần',()=>{
 const w=setup(4),t=brewing(w),e=w.alchemy;['p1','p2','p3'].forEach((id,i)=>like(w,id,10,t+10+i));e.points=ALC.pointsFor9;e.round=3;e.roundEndsAt=t+50;tick(w,t+100);
 assert.equal(e.phase,'tribulation');for(let s=0;s<ALC.tribMs;s+=1000){['p0','p1','p2','p3'].forEach((id,i)=>like(w,id,40,t+100+s+i*10));gift(w,'p1',1,t+150+s,'s'+s);tick(w,t+200+s);}
 tick(w,t+200+ALC.tribMs);assert.equal(e.phase,'finished');assert.equal(e.result.trib,'held');assert.equal(e.result.grade,9);
 const top=e.result.top[0];assert.equal(w.players[top.id].alchemyTitle.name,'Đan Sư Tông Môn');const qi=w.players.p2.totalQi;tick(w,t+30000);assert.equal(w.players.p2.totalQi,qi,'không thưởng hai lần');
 assert.ok(w.events.some(x=>x.alchemyEnd===9&&isEventAnnouncement(x)));
});
test('đan kiếp không giữ được → đan nứt, tụt 2 phẩm; phẩm thấp thì không có đan kiếp',()=>{
 const w=setup(2),t=brewing(w),e=w.alchemy;e.points=ALC.pointsFor9;e.round=3;e.roundEndsAt=t+50;tick(w,t+100);for(let s=1;s<=ALC.tribMs/1000+1;s++)tick(w,t+100+s*1000);
 assert.equal(e.result.trib,'cracked');assert.equal(e.result.grade,7);
 const v=setup(2),t2=brewing(v);v.alchemy.points=10;v.alchemy.round=3;v.alchemy.roundEndsAt=t2+50;tick(v,t2+100);assert.equal(v.alchemy.phase,'finished');assert.equal(v.alchemy.result.grade,gradeOf(10));
});
test('chặn chồng sự kiện + snapshot gọn khi 300 người',()=>{
 const w=setup(300),t=brewing(w);assert.equal(startRace(w,t).queued,true,'đua kiếm xếp hàng');
 const t0=performance.now();for(let i=0;i<300;i++)like(w,'p'+i,15,t+10+i);assert.ok(performance.now()-t0<500);
 const s=snapshot(w,t+500);assert.ok(s.alchemy&&!s.alchemy.members&&!s.alchemy.heaters);assert.ok(s.alchemyStage.length<=12);assert.ok(JSON.stringify(s.alchemy).length<8000);
 assert.equal(stopAlchemy(w,t+600).ok,true);assert.equal(snapshot(w,t+700).alchemy,null);
});
test('giọng đọc ít: chỉ mở lò, đan kiếp, nổ lò, đan thành; không đọc từng tim/quà vai trò',()=>{
 const lines=e=>speechPlan({id:'x',effect:'alchemy',text:'x',...e});
 assert.ok(lines({alchemyStart:true}).length>=1);assert.ok(lines({alchemyExplode:true,alchemyCulprit:'An'}).length>=1);assert.ok(lines({alchemyEnd:5,alchemyMaster:'An'}).length>=1);assert.ok(lines({alchemyTribStart:true}).length===1);
 assert.equal(lines({}).length,0,'sự kiện lò khác không đọc');const words=lines({alchemyStart:true}).map(s=>s.text).join(' ').split(/\s+/).length;assert.ok(words<=26,'câu mở lò ngắn: '+words+' từ');
});
