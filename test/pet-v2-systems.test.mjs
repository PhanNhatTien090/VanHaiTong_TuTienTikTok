import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,controlPetEvent} from '../engine.mjs';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PET_V2_ROUTES,PET_V2_COMBOS,petV2GearResonance,petV2Route,petV2ExpeditionAffinity,petV2Combination} from '../pet-v2-systems.mjs';
import {petV2Configure,petV2DuelPoints,petV2BossDamage,petV2Command,petV2Tick} from '../pet-v2.mjs';
const N=Date.UTC(2026,10,15,9);
const notices=[];
const emit=(w,p,message,effect,at,meta)=>{notices.push({user:p?.id,message,effect,at,...meta});};
function make(){
 const w=createWorld('demo');
 Object.assign(w.settings,{residents:false,autoEvents:false});
 w.nextBossAt=N+99999999;
 const p=ensurePlayer(w,'a','A',N);p.spiritPets=['jade-rabbit','ember-fox'];p.spiritPet='ember-fox';
 const cfg={enabled:true,progression:true,combat:true,synergy:true,expedition:true,coveV2:true};
 assert.equal(petV2Configure(w,cfg).ok,true);
 return {w,p};
}
test('each species has a free expedition route, and combinations cover all elemental families',()=>{
 assert.equal(Object.keys(PET_V2_ROUTES).length,3);
 for(const p of ALL_PETS)assert.ok(Object.keys(PET_V2_ROUTES).some(id=>petV2ExpeditionAffinity(p.id,id)),p.id);
 assert.equal(petV2Route('unknown'),null);
 assert.equal(petV2Combination('fire','lightning'),'Lôi Hỏa Thiên Kiếp');
 assert.equal(petV2Combination('lightning','fire'),'Lôi Hỏa Thiên Kiếp');
 assert.equal(petV2Combination('fire','fire'),null);
 assert.equal(PET_V2_COMBOS.length,9);
});
test('resonance requires equipment actually owned, never rarity or arbitrary realm-only powers',()=>{
 const {w,p}=make();
 p.equipped='phoenix-blade';assert.equal(petV2GearResonance(p),false);
 p.artifacts.push('phoenix-blade');assert.equal(petV2GearResonance(p),true);
 assert.equal(petV2DuelPoints(w,p),2);
 w.boss={id:'boss',hp:10000,maxHp:10000,endsAt:N+100000};
 const bonus=petV2BossDamage(w,p,1000,N);
 p.artifacts=[];assert.equal(petV2GearResonance(p),false);
 assert.ok(petV2BossDamage(w,p,1000,N)<bonus);
 p.spiritPet='jade-rabbit';assert.equal(petV2GearResonance(p),false);
});
test('route affinity rewards are deterministic, exactly-once and independent of gifts',()=>{
 let {w,p}=make();
 assert.equal(petV2Command(w,p,'thu','hanh hoa',N,emit).ok,true);
 assert.equal(w.petGrowthV2.players.a.expedition.routeId,'hoa');
 w=JSON.parse(JSON.stringify(w));p=w.players.a;
 petV2Tick(w,N+601000,emit);
 const o=w.petGrowthV2.players.a;
 assert.equal(o.inventory.evolutionShards,1);
 assert.equal(o.daily.sourceCounts.expedition,1);
 assert.equal(o.daily.earnedXp,40);
 petV2Tick(w,N+602000,emit);assert.equal(o.inventory.evolutionShards,1);
});
test('community milestone awards once to real LIVE players and does not change old acquisition',()=>{
 const {w,p}=make();
 assert.equal(controlPetEvent(w,'start',N,5).ok,true);
 assert.equal(petV2Command(w,p,'thu','duyen',N+1000,emit).ok,true);
 assert.equal(w.petGrowthV2.players.a.inventory.spiritFood,2);
 const session=w.petGrowthV2.coveSessions[w.petEvent.id];
 assert.deepEqual(Object.keys(session.participants),['a']);
 assert.equal(session.goal,1);
 petV2Tick(w,N+240000,emit);
 assert.equal(w.petGrowthV2.players.a.inventory.evolutionShards,1);
 assert.equal(w.petGrowthV2.coveSessions[w.petEvent.id].rewarded,true);
 assert.equal(notices.filter(e=>e.petV2CoveCompleted).length>=1,true);
 petV2Tick(w,N+245000,emit);
 assert.equal(w.petGrowthV2.players.a.inventory.evolutionShards,1);
 assert.deepEqual(p.spiritPets,['jade-rabbit','ember-fox']);
});
