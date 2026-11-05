import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hoaThanState,HOA_THAN_DURATION} from '../public/hoa-than-awakening.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {residentPlayers,setResidentRealm} from '../public/residents.js';
import {appearanceFor} from '../public/realm-outfits.js';
test('Hoa Than opens six gates after spirit ascent, merges before revealing, and stays longer than Nguyen Anh',()=>{
 const at=t=>hoaThanState(t/17.6);
 assert.equal(HOA_THAN_DURATION,17600);assert.equal(breakthroughDuration({toRealm:5}),17600);
 assert.ok(breakthroughDuration({toRealm:4})<17600);assert.ok(breakthroughDuration({toRealm:6})>17600);
 assert.equal(at(2).up,0);assert.equal(at(4.4).up,1);assert.equal(at(4).gates.reduce((a,b)=>a+b),0);
 assert.deepEqual(at(7.5).gates,[1,1,1,1,1,1]);assert.equal(at(12.8).merge,0);assert.ok(Math.abs(at(14.4).merge-1)<1e-10);
 assert.equal(at(14.64).revealed,false);assert.equal(at(14.66).revealed,true);
 assert.deepEqual(at(10),at(10));assert.equal(hoaThanState(.6,1600,false).motion,false);
});
test('NPC keeps Hoa Than outfit through later snapshots and cycle boundaries without changing real users',()=>{
 const id='resident:ty-teo';setResidentRealm(id,5);
 const a=residentPlayers(1).find(p=>p.id===id),b=residentPlayers(999999999).find(p=>p.id===id);
 assert.equal(a.realm,5);assert.equal(b.realm,5);assert.equal(a.resident,true);assert.equal(a.giftCoins,0);
 assert.notEqual(appearanceFor(a).level,appearanceFor({...a,realm:4}).level);
 setResidentRealm(id,-1);assert.equal(residentPlayers(1).find(p=>p.id===id).realm,5);
});
