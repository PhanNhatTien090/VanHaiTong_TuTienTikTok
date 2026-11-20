import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startDoKiep,stopDoKiep,giftRoute} from '../engine.mjs';
import {DOKIEP,doKiepView} from '../do-kiep.mjs';
import {stageConflict} from '../stage-lock.mjs';
const N=1_800_000_000_000;
function world(n=20){const w=createWorld('live');w.liveSession={active:true,startedAt:N-3600e3};w.settings={...(w.settings||{}),residents:false};
 for(let i=0;i<n;i++){const p=ensurePlayer(w,'u'+i,'Đạo hữu '+i,N);p.lastActive=N;p.lastRealInteractionAt=N;p.realm=5;}return w;}
function runAll(w,from){let t=from;for(let i=0;i<400&&w.doKiep&&['registration','running'].includes(w.doKiep.phase);i++){t+=500;tick(w,t);}return t;}

test('Độ Kiếp: mở, khóa sân, đủ 9 đạo lôi, có thưởng, không mở chồng', () => {
  const w=world(30);assert.equal(startDoKiep(w,N).ok,true);
  assert.equal(stageConflict(w,N),'Bách Nhân Độ Kiếp');assert.equal(startDoKiep(w,N+1).ok,false);
  assert.equal(giftRoute(w,N).id,'kiep');
  const qi0=Object.fromEntries(Object.values(w.players).map(p=>[p.id,p.totalQi]));
  const end=runAll(w,N);const e=w.doKiep;
  assert.equal(e.phase,'finished');assert.ok(Object.keys(e.people).length>=30,'cả sân tự vào');
  assert.ok(e.wave===DOKIEP.waves||!Object.values(e.people).some(m=>m.hp>0));
  for(const v of e.waves)assert.ok(v.targets.length<=DOKIEP.maxTargets);
  for(const p of Object.values(w.players))if(e.people[p.id])assert.ok(p.totalQi>qi0[p.id],'ai tham gia cũng có thưởng');
  assert.ok(doKiepView(w,end));assert.equal(stopDoKiep(w,end).ok,true);assert.equal(stageConflict(w,end+1),null);
});

test('Độ Kiếp: khiên đỡ đòn, quà hồi sinh, 99 che cả sân, quà 30 ưu tiên che người đang bị nhắm', () => {
  const w=world(12);startDoKiep(w,N);let t=N+DOKIEP.registerMs+10;tick(w,t);t+=DOKIEP.firstMs+10;tick(w,t);
  const e=w.doKiep,v=e.waves.at(-1);assert.equal(v.n,1);const target=v.targets[0];
  const giver=Object.keys(e.people).find(id=>!v.targets.includes(id));
  action(w,{type:'gift',userId:giver,name:'x',coins:30,repeatCount:1,eventId:'g30'},t+100);
  assert.ok(e.people[target].shield>=1,'người đang bị nhắm được che trước');assert.ok(e.guard[giver]>=1);
  t=v.strikeAt+10;tick(w,t);assert.equal(v.res[target],'shield');
  // hóa tro rồi quà 1 xu = hồi sinh
  const m=e.people[giver];m.hp=0;m.shield=0;action(w,{type:'gift',userId:giver,name:'x',coins:1,repeatCount:1,eventId:'g1'},t+50);assert.ok(m.hp>=1&&m.shield>=1);
  action(w,{type:'gift',userId:'u3',name:'x',coins:99,repeatCount:1,eventId:'g99'},t+60);
  for(const [id,o] of Object.entries(e.people))if(o.hp>0)assert.ok(o.shield>=1,id);
  assert.equal(e.reversals.length,1);
});

test('Độ Kiếp: gõ ne khi bị nhắm được ghi nhận; người mới bình luận muộn (sau đạo 4) không vào', () => {
  const w=world(8);startDoKiep(w,N);let t=N+DOKIEP.registerMs+10;tick(w,t);t+=DOKIEP.firstMs+10;tick(w,t);
  const e=w.doKiep,v=e.waves.at(-1),id=v.targets[0];
  const r=action(w,{type:'chat',userId:id,name:'x',text:'ne'},t+100);assert.equal(r.dodge,true);assert.equal(e.people[id].dodge,1);
  e.wave=DOKIEP.lateJoinBefore;const late=ensurePlayer(w,'late','Muộn',t);late.lastActive=t;
  action(w,{type:'chat',userId:'late',name:'Muộn',text:'1'},t+200);assert.equal(e.people.late,undefined);
});
