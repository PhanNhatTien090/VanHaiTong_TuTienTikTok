import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,readyToBreak,requiredQi,requiredStones,snapshot,REALMS} from '../engine.mjs';
import {ASCENSION_PRACTICE_STEPS} from '../public/ascension-pacing.js';
const N=Date.now();
function world(){const w=createWorld('live');w.settings.ascensionShowcase=true;w.settings.goldenHour=true;action(w,{type:'join',userId:'a',name:'An'},N);return w;}
test('real free progression reaches every realm at a bounded, progressively slower cadence',()=>{
 const w=world(),p=w.players.a,milestones=[],breaks=new Set();let now=N;
 for(let r=0;r<REALMS.length-1;r++){
  let count=0;while(!readyToBreak(p)){assert.equal(action(w,{type:'cultivate',userId:p.id},now).ok,true);now+=10000;assert.ok(++count<=ASCENSION_PRACTICE_STEPS[r]);}
  const qi=p.qi,stones=p.stones,needQi=requiredQi(p),needStones=requiredStones(p);
  assert.equal(action(w,{type:'breakthrough',userId:p.id},now-1).ok,true);assert.equal(p.realm,r+1);breaks.add(w.events.findLast(e=>e.effect==='breakthrough').id);
  assert.equal(p.qi,qi-needQi);assert.equal(p.stones,stones-needStones);milestones.push({realm:p.realm,seconds:(now-N)/1000,actions:count});
 }
 assert.equal(p.giftCoins,0);assert.equal(p.realm,18);assert.equal(breaks.size,18);
 assert.ok(milestones[3].seconds<=150);assert.ok(milestones[17].seconds<=40000);assert.ok(milestones[8].actions>=20); // 4/11: từ Chân Tiên chậm ~3 lầnassert.ok(milestones[17].actions>milestones[3].actions);
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
