import test from 'node:test';
import assert from 'node:assert/strict';
import {impactBeat} from '../public/impact-punch.js';
import {ascensionImpactRatio} from '../public/audio.js';

const base=()=>({effects:[],height:1600,budget:{level:'balanced'}});
test('major ritual punctuation follows the audio impact ratio, not a guessed time',()=>{
 const e={id:'ritual-7',effect:'breakthrough',toRealm:7,start:1000,duration:20000};
 const scene={...base(),effects:[e]},hit=1000+20000*ascensionImpactRatio(7);
 assert.equal(impactBeat(scene,hit-1),null);
 assert.equal(impactBeat(scene,hit)?.kind,'breakthrough');
 assert.equal(impactBeat(scene,hit+421),null);
});
test('high-tier gifts have two punches; small gifts have none',()=>{
 const scene={...base(),effects:[{gift:'Rose',start:1000,duration:10000,spectacleTier:{min:3000}}]};
 assert.equal(impactBeat(scene,4200)?.kind,'gift');
 assert.equal(impactBeat(scene,7600)?.kind,'gift');
 assert.equal(impactBeat(scene,5000),null);
 scene.effects[0].spectacleTier={min:100};
 assert.equal(impactBeat(scene,4200),null);
});
test('heavy skill triggers at its hit frame; no-damage skill does not',()=>{
 const event={effect:'attack',damage:90,technique:{intensity:3},duration:2000,start:1000};
 const scene={...base(),effects:[event]};
 assert.equal(impactBeat(scene,2100)?.kind,'skill');
 scene.effects[0].damage=0;
 assert.equal(impactBeat(scene,2100),null);
});
test('duel ultimate uses the actual duel impact clock and coordinates',()=>{
 const scene={...base(),socialScene:'tournament',duelImpact:{at:10000,x:220,y:400,ultimate:true}};
 assert.deepEqual([impactBeat(scene,250,10100)?.kind,impactBeat(scene,250,10100)?.x],['duel',220]);
 scene.duelImpact.ultimate=false;
 assert.equal(impactBeat(scene,250,10100),null);
});
test('V2 disabled means no new visual, and old boss impacts are ignored',()=>{
 const scene={...base(),boss:{id:1},battleSound:{impactAt:1000}};
 assert.equal(impactBeat(scene,3000,2000),null);
 assert.equal(impactBeat(scene,3000,1100)?.kind,'boss');
 scene.cinematicV2=false;
 assert.equal(impactBeat(scene,3000,1100),null);
});
