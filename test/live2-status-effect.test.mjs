import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Scene} from '../public/scene.js';
test('read-only LIVE2 status does not wipe currently playing magic or gift frames',()=>{
 const current={id:'uninterrupted',effect:'attack',start:0,duration:2200};
 const mock={effects:[current],presentation:{kind:'gift',until:Number.POSITIVE_INFINITY}};
 assert.equal(Scene.prototype.addEffect.call(mock,{live2:true,effect:'status',daoStatus:true,card:{kind:'dao'}}),undefined);
 assert.equal(mock.effects.length,1);
 assert.equal(mock.effects[0],current);
 assert.equal(mock.presentation.kind,'gift');
});
