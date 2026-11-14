// Authoritative evolution atlas contract. All new artwork must retain the
// species' existing 3 or 8 genuinely different poses and their motion periods.
import {ALL_PETS} from './spirit-pets.js';
import {PREMIUM_PET_PERIODS} from './premium-pet-motion.js';
export const PET_V2_ART_VERSION='drawn-v1';
export const PET_V2_ART_APPROVED=true; // 39 atlases, 192 frames verified by GitHub generation+QA.
const all=ALL_PETS.map(p=>{
 const premium=Object.hasOwn(PREMIUM_PET_PERIODS,p.id);
 const frames=premium?8:3,size=premium?192:160;
 const stageAssets=[1,2,3].map(stage=>Object.freeze({
  id:p.id,stage,frames,size,cols:premium?4:3,rows:premium?2:1,
  path:'/assets/spirit-pets-v2/evolutions/'+p.id+'/stage-'+stage+'-'+PET_V2_ART_VERSION+(premium?'.webp':'.png')
 }));
 return Object.freeze({id:p.id,frames,size,premium,stageAssets:Object.freeze(stageAssets)});
});
export const PET_V2_ANIMATED_ART=Object.freeze(Object.fromEntries(all.map(x=>[x.id,x])));
export const PET_V2_ASSET_MANIFEST=Object.freeze(all.flatMap(p=>p.stageAssets));
export const PET_V2_TOTAL_NEW_POSES=PET_V2_ASSET_MANIFEST.reduce((n,p)=>n+p.frames,0);
export const petV2AssetSpec=(id,stage)=>PET_V2_ANIMATED_ART[id]?.stageAssets?.find(x=>x.stage===stage)||null;
