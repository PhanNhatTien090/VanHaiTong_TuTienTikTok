import test from 'node:test';import assert from 'node:assert/strict';
import {unlockedPets,SPIRIT_PETS,petRequirement} from '../public/spirit-pets.js';
import {createWorld,action,controlPetEvent,snapshot} from '../engine.mjs';
import {petCoveOn,petCoveTargets,petCoveSpots} from '../public/pet-cove.js';
const N=1800000000000;
test('only hearts unlock first three; phoenix 3000 hearts OR 100 coins; selected rare pet strictly 200 coins',()=>{
 const ids=(h,c,featured)=>unlockedPets(h,c,featured).map(p=>p.id);
 assert.deepEqual(ids(0,99),[]);assert.deepEqual(ids(0,100),['sun-phoenix']);assert.deepEqual(ids(0,199),['sun-phoenix']);assert.deepEqual(ids(0,200),['sun-phoenix']);
 assert.deepEqual(ids(0,200,'astral-dragon'),['sun-phoenix','astral-dragon']);
 assert.deepEqual(ids(0,200,'ky-lan'),['sun-phoenix','ky-lan']);
 assert.deepEqual(ids(99,0),[]);assert.deepEqual(ids(100,0),['jade-rabbit']);assert.deepEqual(ids(400,0),['jade-rabbit','ember-fox']);assert.equal(ids(1000,0).length,3);assert.equal(ids(2999,0).length,3);assert.equal(ids(3000,0).length,4);assert.ok(!ids(1e9,0,'astral-dragon').includes('astral-dragon'));
 assert.equal(petRequirement(SPIRIT_PETS[4]),'200 coin · chỉ quà');
});
test('exact event rules apply during cultivation cooldown, and returning to normal map preserves owned pets',()=>{
 const w=createWorld('live');w.settings.autoEvents=false;w.settings.residents=false;controlPetEvent(w,'start',N,5);
 action(w,{type:'like',userId:'a',name:'A',count:100},N+1);action(w,{type:'like',userId:'a',name:'A',count:300},N+2);assert.ok(w.players.a.spiritPets.includes('ember-fox'));
 action(w,{type:'like',userId:'a',name:'A',count:100000},N+3);assert.ok(!w.players.a.spiritPets.includes('astral-dragon'));
 const during=snapshot(w,N+4);assert.equal(during.environment.id,'pet-cove');assert.equal(during.petEvent.practice,false);
 controlPetEvent(w,'stop',N+5);assert.notEqual(snapshot(w,N+6).environment.id,'pet-cove');assert.ok(w.players.a.spiritPets.includes('ember-fox'));
});
test('cove puts all cultivators below pets, and boss/competition retains its dedicated stage',()=>{
 const scene={petEvent:{active:true,endsAt:N+1000}};assert.equal(petCoveOn(scene,N),true);assert.equal(petCoveOn({...scene,boss:{}},N),false);assert.equal(petCoveOn(scene,N+1000),false);
 for(const count of [1,12,48,80]){const a=Array.from({length:count},(_,i)=>({id:String(i)}));const targets=petCoveTargets(a,1600);assert.equal(targets.length,count);for(const t of targets){assert.ok(t.x>0&&t.x<900);assert.ok(t.y>=1600*.67-1e-8&&t.y<=1600*.87+1e-8);}}
 for(const spot of petCoveSpots(1600))assert.ok(spot.y<1600*.6);
});
