import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawLive2HeavenStage} from '../public/live2-heaven-stage.js';
function make(){let saved=0,restored=0,draws=0;return {ctx:{save:()=>saved++,restore:()=>restored++,translate:()=>{},beginPath:()=>{},ellipse:()=>draws++,moveTo:()=>{},lineTo:()=>{},closePath:()=>{},stroke:()=>{}},stats:()=>({saved,restored,draws})};}
test('Heaven Trial draws only for active target and balanced canvas state',()=>{
 const m=make();assert.equal(drawLive2HeavenStage(m.ctx,{completed:true,helpers:3},120,320,1000),false);
 assert.equal(drawLive2HeavenStage(m.ctx,{completed:false,helpers:2},120,320,1000,{light:true,motion:false}),true);
 assert.equal(drawLive2HeavenStage(m.ctx,{completed:false,helpers:0},120,320,1000,{light:false,motion:true}),true);
 const a=m.stats();assert.equal(a.saved,a.restored);assert.ok(a.draws<=4);
});
