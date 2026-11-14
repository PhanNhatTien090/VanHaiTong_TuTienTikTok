import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,snapshot,controlPetEvent} from '../engine.mjs';
import {
 petV2Configure,petV2Flags,petV2View,petV2Earn,petV2Command,
 petV2DuelPoints,petV2BossDamage,petV2CommitBossDamage,
 petV2Tick,petV2CovePhase,petV2Cards
} from '../pet-v2.mjs';
import {PET_V2_IDS,PET_V2_SKILLS,petXpNext,petStageUnlocked} from '../public/pet-v2-catalog.js';
import {ALL_PETS} from '../public/spirit-pets.js';

const N=Date.UTC(2026,10,15,9);
const notices=[];
function emit(w,p,message,effect,at,props={}) {
 const e={id:'v2-test:'+w.events.length,user:p?.id??null,name:p?.name??'',message,effect,at,...props};
 w.events.push(e);notices.push(e);return e;
}
function make() {
 const w=createWorld('demo');
 Object.assign(w.settings,{residents:false,autoEvents:false,heartPlay:false,engagementRewards:true});
 w.nextBossAt=N+1e9;
 const p=ensurePlayer(w,'owner','A',N);p.spiritPets=['jade-rabbit','ember-fox'];p.spiritPet='jade-rabbit';
 return {w,p};
}
function enable(w) {
 const res=petV2Configure(w,{enabled:true,progression:true,combat:true,coveV2:true,expedition:true,synergy:true});
 assert.equal(res.ok,true);
}
const command=(w,p,word,now=N)=>petV2Command(w,p,'thu',word,now,emit);

test('all 13 original animals retain IDs and a distinct role/skill',()=>{
 assert.deepEqual(PET_V2_IDS,ALL_PETS.map(x=>x.id));
 assert.equal(PET_V2_IDS.length,13);
 assert.equal(new Set(Object.values(PET_V2_SKILLS).map(x=>x.name)).size,13);
 for(let level=1;level<40;level++) assert.ok(petXpNext(level)>0);
 assert.equal(petXpNext(40),0);
});
test('disabled by default, forbidden unapproved evolution art and no mutation of ownership',()=>{
 const {w,p}=make(),owned=JSON.stringify(p.spiritPets);
 assert.equal(petV2Flags(w).enabled,false);
 assert.equal(petV2Earn(w,p,'cultivate',N),0);
 assert.equal(w.petGrowthV2,undefined);
 assert.equal(petV2Configure(w,{enabled:'yes'}).ok,false);
 assert.equal(petV2Configure(w,{evolutionArt:true}).ok,false);
 assert.equal(JSON.stringify(p.spiritPets),owned);
 assert.equal(petV2View(w,p),null);
});
test('XP is daily capped, only from permitted free sources, serialized and excluded from snapshot',()=>{
 let {w,p}=make();enable(w);
 for(let i=0;i<40;i++)petV2Earn(w,p,'cultivate',N+i);
 const o=w.petGrowthV2.players.owner;
 assert.equal(o.daily.earnedXp,40);
 assert.equal(o.daily.sourceCounts.cultivate,5);
 assert.equal(petV2Earn(w,p,'gift',N+100),0);
 assert.equal(petV2Earn(w,p,'cultivate',N+100),0);
 const before=petV2View(w,p),persisted=JSON.parse(JSON.stringify(w));
 w=persisted;p=w.players.owner;
 assert.deepEqual(petV2View(w,p),before);
 const view=snapshot(w,N+500,{select:()=>new Set(['owner'])});
 assert.equal(view.petGrowthV2,undefined);
 assert.equal(view.players.find(x=>x.id==='owner').petView.level,before.level);
 assert.equal(petV2Earn(w,p,'cultivate',N+86400000),8);
});
test('feeding, training, evolving and independent per-beast state respect gates',()=>{
 const {w,p}=make();enable(w);
 assert.equal(command(w,p,'nuoi').ok,true);
 assert.equal(command(w,p,'nuoi',N+1000).ok,false);
 assert.equal(command(w,p,'luyen',N+1000).ok,true);
 assert.equal(command(w,p,'luyen',N+2000).ok,false);
 assert.equal(command(w,p,'hoa',N+3000).ok,false);
 const o=w.petGrowthV2.players.owner;
 assert.equal(o.inventory.spiritFood,0);
 assert.equal(o.pets['jade-rabbit'].bond,3);
 assert.equal(petStageUnlocked({level:9,trains:100,expeditions:100},1),false);
 const g=o.pets['jade-rabbit'];g.level=30;g.trains=3;g.expeditions=2;
 for(let stage=1;stage<=3;stage++){
  assert.equal(command(w,p,'hoa',N+4000+stage).ok,true);
  assert.equal(g.stage,stage);
 }
 assert.equal(petV2View(w,p).stageName,'Bản Mệnh');
 p.spiritPet='ember-fox';assert.equal(petV2View(w,p).level,1);
 assert.equal(petV2Cards(w,p)['jade-rabbit'].stage,3);
});
test('expedition resolves exactly once across JSON restart and awards no repeated shards',()=>{
 let {w,p}=make();enable(w);
 assert.equal(command(w,p,'hanh').ok,true);
 assert.equal(command(w,p,'hanh',N+400).ok,true);
 w=JSON.parse(JSON.stringify(w));p=w.players.owner;
 petV2Tick(w,N+601000,emit);
 const o=w.petGrowthV2.players.owner;
 assert.equal(o.expedition.resolvedAt,N+601000);
 assert.equal(o.inventory.evolutionShards,1);
 assert.equal(o.pets['jade-rabbit'].expeditions,1);
 assert.equal(command(w,p,'hanh',N+601001).ok,false);
 petV2Tick(w,N+620000,emit);
 assert.equal(o.inventory.evolutionShards,1);
});
test('combat: rarity never multiplies pet boost, total cultivation floor stays in tournament',()=>{
 const {w,p}=make();enable(w);
 assert.equal(petV2DuelPoints(w,p),1);
 petV2Earn(w,p,'cultivate',N);
 const o=w.petGrowthV2.players.owner;
 o.pets['jade-rabbit']={level:40,bond:100,stage:3};
 assert.equal(petV2DuelPoints(w,p),4);
 p.spiritPet='ember-fox';assert.equal(petV2DuelPoints(w,p),1);
 w.playTransfers={owner:{phase:'web'}};
 assert.equal(petV2DuelPoints(w,p),0);
 assert.equal(petV2Earn(w,p,'cultivate',N),0);
});
test('boss damage capped per hit, player, and whole boss; synergy cosmetic is cooldown-controlled',()=>{
 const {w,p}=make();enable(w);
 p.spiritPet='ember-fox';
 w.boss={id:'boss-test',hp:10000,maxHp:10000,endsAt:N+200000,startedAt:N,participants:{},damage:{}};
 let bonus=petV2BossDamage(w,p,1000,N);assert.ok(bonus>0&&bonus<=100);
 petV2CommitBossDamage(w,p,bonus,N,emit);
 assert.equal(w.boss.petV2Damage.total,bonus);
 for(let i=0;i<20;i++){
  const extra=petV2BossDamage(w,p,1000,N+1000+i);
  if(extra>0)petV2CommitBossDamage(w,p,extra,N+1000+i,emit);
 }
 assert.ok(w.boss.petV2Damage.players.owner<=300);
 const other=ensurePlayer(w,'ally','B',N);
 other.spiritPets=['loi-oa'];other.spiritPet='loi-oa';
 const started=notices.filter(x=>x.petV2Synergy).length;
 petV2CommitBossDamage(w,other,10,N+5000,emit);
 assert.equal(notices.filter(x=>x.petV2Synergy).length,started+1);
 petV2CommitBossDamage(w,p,10,N+5100,emit);
 assert.equal(notices.filter(x=>x.petV2Synergy).length,started+1);
});
test('cove phases are calculated server-side without affecting original unlocks',()=>{
 const {w,p}=make();enable(w);
 assert.equal(petV2CovePhase(w,N),null);
 const started=controlPetEvent(w,'start',N,5);assert.equal(started.ok,true);
 assert.equal(petV2CovePhase(w,N+1000).phase,'opening');
 assert.equal(petV2CovePhase(w,N+120000).phase,'exploration');
 assert.equal(petV2CovePhase(w,N+240000).phase,'community');
 assert.equal(petV2CovePhase(w,N+290000).phase,'settlement');
 assert.equal(command(w,p,'duyen',N+30000).ok,true);
 assert.equal(command(w,p,'duyen',N+31000).ok,true);
 assert.equal(w.petGrowthV2.players.owner.inventory.spiritFood,2);
 assert.equal(petV2CovePhase(w,N+301000),null);
});

test('100-person LIVE payload contains compact pet views, never the persistent evolution ledger',()=>{
 const w=createWorld('demo');w.settings.autoEvents=false;
 const now=N+1000000;
 for(let i=0;i<100;i++){
  const p=ensurePlayer(w,'crowd-'+i,'Đạo hữu '+i,now);
  p.spiritPet='jade-rabbit';p.spiritPets=['jade-rabbit'];
 }
 const select={select:({players})=>new Set(players.map(p=>p.id))};
 const initial=JSON.stringify(snapshot(w,now,select));
 enable(w);
 for(const p of Object.values(w.players))petV2Earn(w,p,'cultivate',now);
 const after=snapshot(w,now,select);
 const encoded=JSON.stringify(after);
 assert.equal(after.petGrowthV2,undefined);
 assert.equal(encoded.includes('"petGrowthV2"'),false);
 assert.equal(after.players.length,100);
 assert.ok(after.players.every(p=>p.petView?.level===1));
 assert.ok(encoded.length-initial.length<100*800,'pet V2 must not ship the full growth ledger every state broadcast');
 assert.equal(Object.keys(w.petGrowthV2.players).length,100);
});
