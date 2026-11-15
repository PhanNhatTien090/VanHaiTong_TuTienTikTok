import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ALL_PETS} from '../public/spirit-pets.js';
import {petV2Traits,petV2TacticalScore,petV2TraitDescriptions} from '../pet-v2-combat.mjs';
import {petV2Configure,petV2DuelTraits} from '../pet-v2.mjs';
import {createWorld,ensurePlayer} from '../engine.mjs';

test('all 13 pets have deterministic bounded talents with no coin or rarity multiplier',()=>{
 assert.equal(ALL_PETS.length,13);
 const techniques=new Set();
 for(const p of ALL_PETS){
  const v=petV2Traits(p.id,40,3,100,4);
  assert.ok(v&&v.talent>=0&&v.talent<1);
  techniques.add(v.id);
  assert.ok(petV2TraitDescriptions[v.role]);
  assert.ok(petV2TacticalScore(v,null,{cast:true})<=5);
  assert.ok(petV2TacticalScore(v,null,{cast:true})>=0);
  const a=petV2TacticalScore(v,null,{cast:true});
  const b=petV2TacticalScore(v,null,{cast:true});
  assert.equal(a,b);
 }
 assert.equal(techniques.size,13);
 assert.equal(petV2Traits('unknown'),null);
});
test('defense and control reduce hostile casting; elemental affinity changes close fights only',()=>{
 const a=petV2Traits('ember-fox',20,2,50,2);
 const d=petV2Traits('ky-lan',20,2,50,2);
 const c=petV2Traits('frost-tiger',20,2,50,2);
 assert.ok(petV2TacticalScore(a,d,{cast:true,enemyCast:true})<petV2TacticalScore(a,null,{cast:true}));
 assert.ok(petV2TacticalScore(a,c,{cast:true,enemyCast:true})<petV2TacticalScore(a,null,{cast:true}));
 assert.ok(petV2TacticalScore(a,c,{cast:false})>petV2TacticalScore(a,petV2Traits('jade-rabbit'),{cast:false}));
 for(const role of [a,d,c]){
  for(const opponent of [a,d,c]){
   for(const cast of [false,true])for(const enemyCast of [false,true]){
    const score=petV2TacticalScore(role,opponent,{cast,enemyCast});
    assert.ok(score>=0&&score<=5);
   }
  }
 }
});
test('a pet on expedition contributes no duel bonuses; when feature OFF, legacy contest unchanged',()=>{
 const now=Date.UTC(2026,10,15,9),w=createWorld('demo');
 const p=ensurePlayer(w,'p','Tester',now);p.spiritPets=['ember-fox'];p.spiritPet='ember-fox';
 assert.equal(petV2DuelTraits(w,p),null);
 assert.equal(petV2Configure(w,{enabled:true,progression:true,combat:true,expedition:true}).ok,true);
 assert.equal(petV2DuelTraits(w,p).role,'attack');
 w.petGrowthV2={schema:2,players:{p:{pets:{'ember-fox':{level:10,xp:0,bond:0,stage:1,trains:1,expeditions:0}},expedition:{id:'e',petId:'ember-fox',endsAt:now+1000,resolvedAt:0},inventory:{spiritFood:1,evolutionShards:0}}},activeExpeditions:{},cinematics:[]};
 assert.equal(petV2DuelTraits(w,p),null);
});
