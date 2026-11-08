import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startWar,stopWar,startRace} from '../engine.mjs';
import {WAR,warMultiplier,warCount} from '../sect-war.mjs';
import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
function setup(n=6){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<n;i++)ensurePlayer(w,'p'+i,'Người '+i,N);return w;}
const chat=(w,id,text,t)=>action(w,{type:'chat',text,userId:id},t);
const like=(w,id,count,t)=>action(w,{type:'like',userId:id,count},t);
function battle(w,chinh,ma){assert.ok(startWar(w,N).ok);chinh.forEach((id,i)=>chat(w,id,'chinh',N+10+i));ma.forEach((id,i)=>chat(w,id,'ma',N+100+i));tick(w,N+WAR.registerMs);assert.equal(w.sectWar.phase,'running');return N+WAR.registerMs;}
test('tuyển quân: chọn phe, không đổi phe giữa trận, thiếu người thì không mở trận',()=>{
 const w=setup(3);startWar(w,N);assert.equal(chat(w,'p0','chinh',N+1).ok,true);assert.equal(chat(w,'p0','ma',N+2).ok,false);assert.equal(w.sectWar.members.p0.side,'chinh');
 tick(w,N+WAR.registerMs);assert.equal(w.sectWar.phase,'finished');assert.ok(w.sectWar.result.empty);
});
test('cân bằng: Chính khí ×1,05, phe ít người được bù tối đa ×1,2, người chỉ thả tim tự vào phe ít người',()=>{
 const w=setup(12),t=battle(w,['p0','p1'],['p2','p3','p4','p5','p6','p7']),e=w.sectWar;
 assert.ok(Math.abs(warMultiplier(e,'ma',t)-1)<1e-9);assert.ok(Math.abs(warMultiplier(e,'chinh',t)-1.05*1.2)<1e-9,'2 đấu 6 → ×1,2 bù + ×1,05');
 like(w,'p9',30,t+1);assert.equal(e.members.p9.side,'chinh');assert.equal(warCount(e,'chinh'),3);
});
test('tim đẩy chiến tuyến có giới hạn mỗi người mỗi 5 s; chien hồi 8 s',()=>{
 const w=setup(4),t=battle(w,['p0'],['p1']),e=w.sectWar;like(w,'p1',5000,t+1);const after=e.line;assert.ok(after<50);assert.ok(50-after<=WAR.heartCapUnits*WAR.unit*1.0001,'một người không gánh cả phe');
 assert.equal(chat(w,'p0','chien',t+2).ok,true);assert.equal(chat(w,'p0','chien',t+3).ok,false);assert.equal(chat(w,'p0','chien',t+2+WAR.strikeCooldownMs).ok,true);
});
test('cứu nguy một lần mỗi phe: Chính ở ngưỡng 20, Ma ở ngưỡng 85; sau đó phản kích ×1,6',()=>{
 const w=setup(4),t=battle(w,['p0'],['p1']),e=w.sectWar;e.line=WAR.rescue.chinh+1;like(w,'p1',40,t+1);
 assert.equal(e.rescued.chinh,true);assert.ok(e.line>WAR.rescue.chinh+5,'Hạo Nhiên Chính Khí đẩy lùi');assert.ok(warMultiplier(e,'chinh',t+2)>1.05*1.59*0.9);
 const ev=w.events.find(x=>x.warRescue==='chinh');assert.ok(ev);e.line=WAR.rescue.chinh-1;like(w,'p1',40,t+6000);assert.equal(w.events.filter(x=>x.warRescue==='chinh').length,1,'chỉ một lần');
 e.line=100-WAR.rescue.ma+.5;chat(w,'p0','chien',t+9000);assert.equal(e.rescued.ma,true);assert.ok(e.line<100-WAR.rescue.ma);
});
test('quà: đẩy đủ theo coin (không cần tim), trần 60 đơn vị / phe / 30 s, quà không nhân bù quân số',()=>{
 const w=setup(4),t=battle(w,['p0'],['p1']),e=w.sectWar;const before=e.line;
 action(w,{type:'gift',userId:'p0',coins:1000,count:1,eventId:'g1'},t+1);const moved=e.line-before;
 assert.ok(Math.abs(moved-WAR.giftCapUnits*WAR.unit)<1e-6,'quà 1000 coin chạm trần, không kết thúc trận ngay');assert.ok(e.members.p0.score>=1000*WAR.giftUnitsPerCoin);assert.ok(e.fx.some(x=>x.kind==='gift'&&x.capped));
 action(w,{type:'gift',userId:'p0',coins:1000,count:1,eventId:'g1'},t+2);assert.equal(e.members.p0.giftCoins,1000,'quà trùng ID không tính lại');
});
test('phe đông tặng nhiều bông thắng phe ít người chỉ thả tim (trận 21:24 07/11)',()=>{
 const ch=['p0','p1','p2','p3','p4','p5','p6'],ma=['p7','p8','p9','p10','p11','p12','p13','p14','p15','p16','p17'];
 const w=setup(18),t=battle(w,ch,ma),e=w.sectWar;e.rescued={chinh:true,ma:true};let k=0;
 for(let s=0;s<120;s+=5){const at=t+s*1000+1;ch.slice(0,3).forEach(id=>like(w,id,10,at));ma.slice(0,2).forEach(id=>like(w,id,10,at));if(s%10===0)for(let g=0;g<3&&k<26;g++,k++)action(w,{type:'gift',userId:ma[k%ma.length],coins:1,count:1,eventId:'r'+k},at+g);}
 tick(w,t+WAR.battleMs);assert.equal(e.result.winner,'ma','Ma 11 người: tim ít hơn + 26 bông phải thắng Chính 7 người thả tim nhiều hơn');
});
test('thắng sớm khi chạm 100, trao thưởng một lần, tướng nhận danh hiệu 24 giờ; hết giờ ở giữa thì hòa',()=>{
 const w=setup(4),t=battle(w,['p0','p1'],['p2','p3']),e=w.sectWar;like(w,'p2',20,t+1);e.rescued={chinh:true,ma:true};e.line=99.8;chat(w,'p0','chien',t+2);
 assert.equal(e.phase,'finished');assert.equal(e.result.winner,'chinh');assert.equal(w.players.p0.warTitle.name,'Chính Đạo Minh Chủ');assert.ok(w.players.p0.warTitle.until-(t+2)===WAR.titleMs);
 const qi=w.players.p2.totalQi;tick(w,t+3);tick(w,t+4);assert.equal(w.players.p2.totalQi,qi,'không thưởng hai lần');
 const v=setup(4),t2=battle(v,['p0'],['p1']);like(v,'p0',10,t2+1);like(v,'p1',10,t2+1);v.sectWar.line=50.5;tick(v,t2+WAR.battleMs);assert.equal(v.sectWar.result.winner,null);
});
test('khóa sân khấu, dữ liệu gửi xuống gọn, sân vẽ tối đa 12 người; 300 người không chậm',()=>{
 const w=setup(300),t=battle(w,Array.from({length:120},(_,i)=>'p'+i),Array.from({length:180},(_,i)=>'p'+(120+i)));
 assert.equal(startRace(w,t).queued,true,'sự kiện khác phải xếp hàng');
 const t0=performance.now();for(let i=0;i<300;i++)like(w,'p'+i,15,t+10+i);const ms=performance.now()-t0;assert.ok(ms<500,'300 lượt tim '+ms.toFixed(1)+'ms');
 const s=snapshot(w,t+500);assert.ok(s.sectWar&&!s.sectWar.members&&!s.sectWar.freeLog);assert.ok(s.sectWar.roster.chinh.length<=40&&s.sectWar.roster.ma.length<=40);assert.ok(s.warStage.length<=12);
 assert.equal(s.sectWar.counts.chinh,120);assert.equal(s.sectWar.counts.ma,180);const base={...w.sectWar,boostUntil:{},omen:null};assert.ok(warMultiplier(base,'chinh',t)>warMultiplier(base,'ma',t),'phe ít người vẫn được bù');
 assert.ok(['running','finished'].includes(w.sectWar.phase));
 const v=setup(2),tv=battle(v,['p0'],['p1']);assert.equal(stopWar(v,tv+1).ok,true);assert.equal(v.sectWar.phase,'cancelled');assert.equal(snapshot(v,tv+2).sectWar,null);
});
test('lời đọc: có câu cho mở trận/khai chiến/cứu nguy/kết quả, không đọc số coin, không đọc từng người gia nhập',()=>{
 for(const e of [{effect:'war',warStart:true,text:'x'},{effect:'war',warBattle:true,text:'x'},{effect:'war',warRescue:'chinh',text:'x'},{effect:'war',warEnd:'ma',text:'x'},{effect:'war',warEnd:'draw',text:'x'}]){const line=speechPlan(e).map(x=>x.text).join(' ');assert.ok(line.length>5);assert.doesNotMatch(line,/coin|\d/);}
 assert.deepEqual(speechPlan({effect:'war',warJoin:'chinh',text:'Gia nhập Chính Đạo',user:'a',name:'A'}),[]);
});

test('08/11 tối: Vạn Lý Chiến Đạo — mỗi quà ghi số trượng đẩy được, giọng đọc nói trượng, bản đồ quy đổi đúng', async () => {
  const E = await import('../engine.mjs'); const { speechPlan } = await import('../speech-lines.mjs');
  const { truongOf, warCamera, screenX, TRUONG_PER_POINT } = await import('../public/war-road.js');
  const N = 1800000000000; let k = 0;
  const say = (w, id, c, t) => E.ingest(w, { event: 'chat', data: { userId: id, uniqueId: id, nickname: 'P' + id, comment: c, msgId: 'm' + (k++) } }, t);
  const w = E.createWorld('live'); for (const id of ['a', 'b', 'c', 'd']) say(w, id, 'nhap mon nam', N);
  E.startWar(w, N + 10); ['a', 'b'].forEach(id => say(w, id, 'chinh', N + 20)); ['c', 'd'].forEach(id => say(w, id, 'ma', N + 20));
  for (let t = N; t <= N + 35000; t += 500) E.tick(w, t);
  assert.equal(w.sectWar.phase, 'running');
  E.ingest(w, { event: 'gift', data: { userId: 'a', uniqueId: 'a', nickname: 'Pa', giftName: 'Rose', diamondCount: 1, repeatCount: 1, giftType: 1, repeatEnd: true, msgId: 'g1' } }, N + 35500);
  const ev = w.events.findLast(e => e.gift), f = w.sectWar.fx.findLast(x => x.kind === 'gift');
  assert.ok(ev.warTruong > 0 && f.truong === ev.warTruong); assert.match(ev.text, /trượng/);
  assert.match(speechPlan(ev).map(x => x.text).join(' '), /trượng/);
  assert.equal(TRUONG_PER_POINT, 20); assert.equal(truongOf(100), 1000); assert.equal(truongOf(0), -1000);
  assert.equal(screenX(0, warCamera(0)), 450); assert.ok(screenX(1000, warCamera(1000)) < 900, 'sơn môn cuối đường vẫn trong màn hình');
});
