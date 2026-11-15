import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2TowerAffinity,live2BossAffinity,live2RecipeCost} from '../live2-path-talents.mjs';
const p=(path,insight=40,props={})=>({live2:{path,insight},...props});
test('all Dao Paths have bounded, tier-gated, distinct PvE talents',()=>{
 assert.equal(live2TowerAffinity(p('sword',15),{rule:{id:'sword'}},1000),1);
 assert.equal(live2TowerAffinity(p('sword'),{rule:{id:'sword'}},1000),1.04);
 assert.equal(live2TowerAffinity(p('body'),{rule:{id:'storm'}},1000),1.045);
 assert.equal(live2TowerAffinity(p('beast',40,{spiritPet:'fox'}),{rule:{id:'beast'}},1000),1.045);
 assert.equal(live2TowerAffinity(p('demon'),{rule:{id:'mind'}},1000),1.025);
 assert.equal(live2TowerAffinity({live2:{path:'alchemy',insight:40,elixirActive:{until:2000}}},{rule:{id:'storm'}},1000),1.025);
 assert.equal(live2TowerAffinity(p('beast'),{rule:{id:'beast'}},1000),1);
});
test('Boss talent only triggers during matching live2 boss phase',()=>{
 assert.equal(live2BossAffinity(p('sword'),{hp:250},1000),1);
 assert.equal(live2BossAffinity(p('sword'),{live2Boss:{phase:'seal',exposedUntil:1500}},1000),1.035);
 assert.equal(live2BossAffinity(p('sword'),{live2Boss:{phase:'seal',exposedUntil:500}},1000),1);
 assert.equal(live2BossAffinity(p('demon'),{live2Boss:{phase:'frenzy'}},1000),1.04);
 assert.equal(live2BossAffinity(p('beast',40,{spiritPet:'fox'}),{live2Boss:{phase:'gathering'}},1000),1.03);
});
test('alchemy herb savings do not affect stones or source recipe',()=>{
 const recipe={herbs:4,stones:25};
 assert.deepEqual(live2RecipeCost(p('alchemy',39),recipe),{herbs:4,stones:25,herbsSaved:0});
 assert.deepEqual(live2RecipeCost(p('alchemy'),recipe),{herbs:3,stones:25,herbsSaved:1});
 assert.deepEqual(live2RecipeCost(p('sword',140),recipe),{herbs:4,stones:25,herbsSaved:0});
 assert.deepEqual(live2RecipeCost(p('alchemy'),{herbs:1,stones:3}),{herbs:1,stones:3,herbsSaved:0});
 assert.equal(recipe.herbs,4);
});
