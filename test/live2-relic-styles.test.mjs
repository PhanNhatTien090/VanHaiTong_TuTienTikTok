import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../engine.mjs';
import {relicDefinition,relicCombatBonus} from '../live2-relics.mjs';
import {live2ExtraCommand} from '../live2-extensions.mjs';
const N=1800000000000;
test('relic styles derive from existing catalogue without changing stats or items',()=>{
 for(const [id,expected] of [['jade','blade'],['bell','bell'],['orb','orb']]){
  const p={equipped:id,artifacts:[id]};
  assert.equal(relicDefinition(p,CATALOG).family,expected);
 }
 const jade=CATALOG.find(x=>x.id==='jade');
 assert.equal(jade.damage,8);
 assert.equal(jade.price,60);
});
test('a free Sword relic has a distinct PvE active and no stacking after switching equipment',()=>{
 const p={id:'a',name:'A',realm:4,stones:500,herbs:50,equipped:'jade',artifacts:['jade','orb']};
 const w={mode:'live',players:{a:p},settings:{live2Enabled:true},boss:{hp:100,endsAt:N+100000}};
 const e=[],ctx={emit:(_w,_p,msg,effect,at,extra)=>e.push({msg,effect,extra}),catalog:CATALOG};
 assert.equal(live2ExtraCommand(w,p,['phap','an'],N,ctx).ok,true);
 assert.equal(p.live2.relicActive.family,'blade');
 assert.ok(relicCombatBonus(p,N,'boss')>relicCombatBonus(p,N,'tower'));
 assert.equal(e[0].extra.relicSkill,'Thiên Kiếm Phá Quân');
 p.equipped='orb';
 assert.equal(relicCombatBonus(p,N,'boss'),0);
 assert.equal(relicCombatBonus(p,N+20000,'boss'),0);
});
