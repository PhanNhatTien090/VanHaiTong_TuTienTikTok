import {test} from 'node:test';
import assert from 'node:assert/strict';
import {preludeState} from '../public/chan-tien-prelude.js';
import {immortalCamera,projectImmortal} from '../public/cinematic-world.js';
test('five rising lights transform and converge before the gate flight',()=>{
 const a=preludeState(3);assert.equal(a.orbs.length,5);assert.ok(a.orbs.every(o=>o.rise===0));
 const b=preludeState(7.9);assert.ok(b.transform>.99);assert.equal(new Set(b.orbs.map(o=>o.color)).size,5);
 const c=preludeState(9.6);for(const o of c.orbs){assert.ok(Math.abs(o.x-450)<1e-7);assert.ok(Math.abs(o.y-1600*.43)<1e-7);}assert.ok(c.manifest>.9);
});
test('near objects accelerate more than far ones; reduced motion has no zoom or travel',()=>{
 const near0=projectImmortal(5,0,10,0),near1=projectImmortal(5,0,10,1),far0=projectImmortal(5,0,30,0),far1=projectImmortal(5,0,30,1);
 assert.ok(near1.x-near0.x>far1.x-far0.x);assert.ok(immortalCamera(14).speed>0);
 const calm=immortalCamera(14,false);assert.equal(calm.zoom,1);assert.equal(calm.travel,0);assert.equal(calm.bank,0);assert.equal(calm.speed,0);
});
