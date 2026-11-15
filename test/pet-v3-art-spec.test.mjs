import test from 'node:test';
import assert from 'node:assert/strict';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
import {PET_V3_ART_APPROVED,PET_V3_SPECIES,PET_V3_ASSETS,PET_V3_TOTAL_POSES,petV3Asset,petV3CanDisplay} from '../public/pet-v3-art-spec.js';

test('new body art spec covers exactly 13 original species x 3 real evolved stages',()=>{
 assert.equal(ALL_PETS.length,13);
 assert.equal(PET_V3_ASSETS.length,39);
 assert.equal(PET_V3_TOTAL_POSES,192);
 assert.equal(new Set(PET_V3_ASSETS.map(x=>x.path)).size,39);
 assert.equal(Object.keys(PET_V3_SPECIES).length,13);
 for(const p of ALL_PETS){
   const s=PET_V3_SPECIES[p.id];
   assert.ok(s.identity&&s.stages.length===3&&s.prohibit.length>0,p.id);
   for(const stage of [1,2,3]){
      const a=petV3Asset(p.id,stage);
      const frames=Object.hasOwn(PREMIUM_PET_PERIODS,p.id)?8:3;
      assert.equal(a.type,'true-body-redraw');
      assert.equal(a.frames,frames);
      assert.equal(a.poseIds.length,frames);
      assert.equal(a.cellSize,256);
      assert.ok(a.path.startsWith('/assets/spirit-pets-v3/true-forms/'+p.id+'/'));
      assert.ok(a.bodyBrief.length>50);
      assert.ok(!/spirit-pets-v1|spirit-pets-v2/.test(a.path));
   }
 }
});
test('unapproved V3 never replaces original animation or data automatically',()=>{
 assert.equal(PET_V3_ART_APPROVED,false);
 assert.equal(petV3CanDisplay(),false);
 assert.equal(petV3Asset('nonexistent',1),null);
 assert.equal(petV3Asset('jade-rabbit',0),null);
});
test('three canonical identity traps guard rabbit, toad and nine-tailed fox',()=>{
 assert.match(PET_V3_SPECIES['jade-rabbit'].identity,/đuôi bông ngắn/i);
 assert.match(PET_V3_SPECIES['loi-oa'].identity,/CÓC SÉT/i);
 assert.match(PET_V3_SPECIES['bach-nguyet-ho'].identity,/chín đuôi/i);
});
