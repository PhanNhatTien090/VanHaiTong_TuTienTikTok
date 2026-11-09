import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,readyToBreak,requiredQi,requiredStones,snapshot,REALMS} from '../engine.mjs';
import {ASCENSION_PRACTICE_STEPS} from '../public/ascension-pacing.js';
const N=Date.now();
function world(){const w=createWorld('live');w.settings.ascensionShowcase=true;w.settings.goldenHour=true;action(w,{type:'join',userId:'a',name:'An'},N);return w;}
test('real free progression reaches every realm at a bounded, progressively slower cadence',()=>{
 const w=world(),p=w.players.a,milestones=[],breaks=new Set();w.settings.dailyPracticeLimit=0;w.settings.dailyRealmLimit=0;let now=N;
 for(let r=0;r<REALMS.length-1;r++){
  let count=0;while(!readyToBreak(p)){p.engagedAt=now; /* 09/11: người chơi thật có trò chuyện → Đạo tâm không chặn */assert.equal(action(w,{type:'cultivate',userId:p.id},now).ok,true);now+=10000;assert.ok(++count<=ASCENSION_PRACTICE_STEPS[r]);}
  const qi=p.qi,stones=p.stones,needQi=requiredQi(p),needStones=requiredStones(p);
  assert.equal(action(w,{type:'breakthrough',userId:p.id},now-1).ok,true);assert.equal(p.realm,r+1);breaks.add(w.events.findLast(e=>e.effect==='breakthrough').id);
  assert.equal(p.qi,qi-needQi);assert.equal(p.stones,stones-needStones);milestones.push({realm:p.realm,seconds:(now-N)/1000,actions:count});
 }
 assert.equal(p.giftCoins,0);assert.equal(p.realm,REALMS.length-1);assert.equal(breaks.size,REALMS.length-1);
 assert.ok(milestones[3].seconds<=150);assert.ok(milestones[17].seconds<=ASCENSION_PRACTICE_STEPS.reduce((n,x)=>n+x,0)*10);assert.ok(milestones[8].actions>=20);assert.ok(milestones[17].actions>milestones[3].actions);
 assert.equal(action(w,{type:'breakthrough',userId:p.id},now).ok,false);
});
test('cooldown, duplicate chat, likes and failed attacks cannot manufacture showcase progress (strict mode heartPlay=false)',()=>{
 const w=world();w.settings.heartPlay=false;const p=w.players.a;action(w,{type:'cultivate',userId:'a'},N);const after=[p.qi,p.stones];
 assert.equal(action(w,{type:'cultivate',userId:'a'},N+1).ok,false);assert.deepEqual([p.qi,p.stones],after);
 action(w,{type:'chat',userId:'a',text:'hello'},N+2);action(w,{type:'like',userId:'a',count:5000},N+3);
 assert.equal(action(w,{type:'attack',userId:'a'},N+4).ok,false);assert.deepEqual([p.qi,p.stones],after);
 assert.equal(action(w,{type:'chat',userId:'a',text:'tuluyen'},N+10000).ok,true);assert.equal(readyToBreak(p),true);
});
test('existing high-realm resources and a chosen outfit survive; gathering remains a free path',()=>{
 const w=world(),p=w.players.a;Object.assign(p,{realm:12,qi:123,totalQi:456,stones:789,skinChoice:'ivory-celestial',skinChoiceSource:'manual'});
 const q=p.qi,s=p.stones;action(w,{type:'gather',userId:'a'},N+1);
 assert.ok(p.qi>q);assert.ok(p.stones>s);assert.equal(p.skinChoice,'ivory-celestial');assert.equal(p.realm,12);assert.equal(snapshot(w,N+2).players[0].finalRealmEligible,true);
 const restored=JSON.parse(JSON.stringify(w));assert.equal(restored.players.a.ascensionAccess,'free');assert.equal(restored.players.a.totalQi,p.totalQi);
});


test('pacing v2 preserves entry to Hoa Than and slows every later practice route without touching saved progress',()=>{
 const old=[2,3,4,5,6,7,8,9,165,190,210,240,270,310,345,390,440,495];
 assert.deepEqual(ASCENSION_PRACTICE_STEPS.slice(0,5),old.slice(0,5));
 for(let r=5;r<18;r++)assert.equal(ASCENSION_PRACTICE_STEPS[r],old[r]*10);
 for(const [kind,wait]of [['cultivate',10000],['like',10000],['gather',30000],['attack',4000]]){
  const w=world(),p=w.players.a;Object.assign(p,{realm:5,qi:123,totalQi:456,stones:789,giftCoins:120,skinChoice:'sea-dragon-heir'});
  if(kind==='attack')w.boss={id:'test',name:'Test',species:'tiger',hp:1e9,maxHp:1e9,endsAt:N+1e9,participants:{},damage:{}};
  const before={qi:p.qi,totalQi:p.totalQi,stones:p.stones},weight={cultivate:1,like:1,gather:1.4,attack:.35}[kind],need=requiredQi(p),previousFloor=Math.ceil(need/old[5]*weight);
  const result=action(w,{type:kind,userId:p.id,...(kind==='like'?{count:1}:{})},N+1);assert.equal(result.ok,true,kind);
  const gained=p.qi-before.qi;assert.ok(gained>0&&gained<=previousFloor*.11,kind+' should be about ten times slower');
  assert.equal(p.totalQi-before.totalQi,gained);assert.ok(p.stones>=before.stones);assert.equal(p.realm,5);assert.equal(p.giftCoins,120);assert.equal(p.skinChoice,'sea-dragon-heir');
  const qi=p.qi;action(w,{type:kind,userId:p.id,...(kind==='like'?{count:1}:{})},N+2);assert.equal(p.qi,qi,'cooldowns remain active');
  assert.equal(snapshot(w,N+wait).progressionPacingVersion,4);
 }
});
