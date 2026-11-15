import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {petV2Configure,petV2Command,petV2CommitBossDamage,PET_V2_EVOLVE_SHARDS} from '../pet-v2.mjs';
import {PET_DUEL_WEIGHT} from '../social-events.mjs';

const N=Date.UTC(2026,10,15,9);
function emit(w,p,message,effect,at,props={}){const e={id:'fix:'+w.events.length,user:p?.id??null,message,effect,at,...props};w.events.push(e);return e;}
function make(){
 const w=createWorld('demo');
 Object.assign(w.settings,{residents:false,autoEvents:false,heartPlay:false});
 w.nextBossAt=N+1e9;
 const p=ensurePlayer(w,'owner','A',N);p.spiritPets=['ember-fox'];p.spiritPet='ember-fox';
 assert.equal(petV2Configure(w,{enabled:true,progression:true,combat:true,coveV2:true,expedition:true,synergy:true}).ok,true);
 return {w,p};
}
const cmd=(w,p,word,now=N)=>petV2Command(w,p,'thu',word,now,emit);
const count=(w,f)=>w.events.filter(f).length;

test('thú kỹ chỉ hiện lên LIVE 1 lần mỗi 30 giây',()=>{
 const {w,p}=make();
 for(let i=0;i<10;i++)assert.equal(cmd(w,p,'ky',N+i*1000).ok,true);
 assert.equal(count(w,e=>e.effect==='status'),1);
 cmd(w,p,'ky',N+31000);
 assert.equal(count(w,e=>e.effect==='status'),2);
});

test('tiến hóa giai đoạn 2/3 tốn Linh Ấn, giai đoạn 1 miễn phí',()=>{
 assert.deepEqual([...PET_V2_EVOLVE_SHARDS],[0,0,1,2]);
 const {w,p}=make();cmd(w,p,'ky');
 const o=w.petGrowthV2.players.owner,g=o.pets['ember-fox'];
 Object.assign(g,{level:10,trains:1});
 assert.equal(cmd(w,p,'hoa').ok,true);assert.equal(g.stage,1);
 Object.assign(g,{level:20,trains:2,expeditions:1});o.inventory.evolutionShards=0;
 const r=cmd(w,p,'hoa');assert.equal(r.ok,false);assert.match(r.message,/Linh Ấn/);assert.equal(g.stage,1);
 o.inventory.evolutionShards=1;
 assert.equal(cmd(w,p,'hoa').ok,true);assert.equal(g.stage,2);assert.equal(o.inventory.evolutionShards,0);
});

test('thần thông đã tụ vẫn thi triển khi thú chạm trần sát thương boss',()=>{
 const {w,p}=make();
 w.boss={id:'b',hp:1000,maxHp:1000,endsAt:N+60000,participants:{},damage:{}};
 assert.match(cmd(w,p,'xuat').message,/tụ/);
 petV2CommitBossDamage(w,p,0,N+1000,emit);
 assert.equal(count(w,e=>e.petV2Cast),1);
 assert.equal(w.boss.petV2Damage,undefined);
 assert.match(cmd(w,p,'xuat',N+2000).message,/hồi/);
});

test('điểm thú trong tỷ thí tối đa 2,5 — dưới trợ lực tối đa 6',()=>{
 assert.ok(5*PET_DUEL_WEIGHT<=2.5);
});
