import {test} from 'node:test';
import assert from 'node:assert/strict';
import {towerRule,towerRuleAction,towerRuleMultiplier} from '../tower-rules.mjs';
test('five distinct mechanics repeat without changing floor numbering',()=>{
 assert.equal(towerRule(1).id,'sword');
 assert.equal(towerRule(5).id,'storm');
 assert.equal(towerRule(6).id,'sword');
});
test('shield needs relevant command and provides a temporary break window',()=>{
 const t={rule:towerRule(2)};
 assert.equal(towerRuleMultiplier(t,null,1000),.85);
 assert.equal(towerRuleAction(t,{},'phatran',1000).ok,false);
 assert.equal(towerRuleAction(t,{},'hoiphap',1000).ok,true);
 assert.equal(towerRuleMultiplier(t,null,1001),1.1);
 assert.equal(towerRuleAction(t,{},'hoiphap',1002).ok,false);
});
test('beast trial respects ownership; base attack stays available to all',()=>{
 const t={rule:towerRule(3)};
 assert.equal(towerRuleAction(t,{spiritPet:null},'tamlinh',1000).ok,false);
 assert.equal(towerRuleAction(t,{spiritPet:'fox'},'tamlinh',1000).ok,true);
 assert.equal(towerRuleMultiplier(t,{spiritPet:null},1000),.96);
});
