import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PET_V2_ASSET_MANIFEST,PET_V2_TOTAL_NEW_POSES,PET_V2_ANIMATED_ART,PET_V2_ART_APPROVED,petV2AssetSpec} from '../public/pet-v2-art-manifest.js';
test('no original pet animation is replaced by missing evolution art',()=>{
 assert.equal(PET_V2_ART_APPROVED,true);
 assert.equal(ALL_PETS.length,13);
 assert.equal(PET_V2_ASSET_MANIFEST.length,39);
 assert.equal(PET_V2_TOTAL_NEW_POSES,192);
 for(const p of ALL_PETS){
  assert.equal(PET_V2_ANIMATED_ART[p.id].stageAssets.length,3);
  for(let stage=1;stage<=3;stage++){
   const x=petV2AssetSpec(p.id,stage);
   assert.equal(x.frames,PET_V2_ANIMATED_ART[p.id].frames);
   assert.ok(x.path.endsWith(x.frames===8?'.webp':'.png'));
  }
 }
});
