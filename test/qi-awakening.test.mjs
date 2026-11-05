import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {qiAwakeningState,drawQiAwakening,QI_BEATS} from '../public/qi-awakening.js';

test('one pearl emerges, divides into three, orbits, recombines and enters the original dantian',()=>{
 const first=qiAwakeningState(.1),hover=qiAwakeningState(.36),split=qiAwakeningState(.47),end=qiAwakeningState(.879);
 assert.equal(first.parts.length,0);assert.equal(first.core.y,first.origin.y);assert.equal(hover.parts.length,3);assert.equal(hover.core.y,hover.hover.y);
 assert.ok(split.parts.some(p=>p.z<0)&&split.parts.some(p=>p.z>=0));assert.ok(split.parts.every(p=>Math.hypot(p.x-split.center.x,p.y-split.center.y)>100));
 assert.ok(end.parts.every(p=>Math.abs(p.x-end.origin.x)<.1&&Math.abs(p.y-end.origin.y)<.1));assert.equal(qiAwakeningState(.879).revealed,false);assert.equal(qiAwakeningState(.88).revealed,true);
 assert.deepEqual(QI_BEATS.map(b=>b.id),['condense','emerge','divide','orbit','reunite','complete']);
});
test('phase boundaries keep pearl paths continuous and deterministic, with no position jumps',()=>{
 for(const k of [.22,.36,.47,.72,.825,.88]){const a=qiAwakeningState(k-1e-6),b=qiAwakeningState(k+1e-6);assert.ok(Math.hypot(a.core.x-b.core.x,a.core.y-b.core.y)<.05,'core '+k);if(a.parts.length&&b.parts.length)for(let i=0;i<3;i++)assert.ok(Math.hypot(a.parts[i].x-b.parts[i].x,a.parts[i].y-b.parts[i].y)<.05,'part '+i+' at '+k);}
 assert.deepEqual(qiAwakeningState(.6),qiAwakeningState(.6));assert.equal(qiAwakeningState(.5,1600,false).lift,0);
});
test('new skin appears only after qi reenters; rendering does not call high-realm art or mutate rewards',()=>{
 const seen=[],canvas=createCanvas(900,1600),c=canvas.getContext('2d'),scene={motion:true,players:[],drawPlayer:(ctx,p)=>seen.push(p.realm)};
 const e={user:'a',name:'Luyện Khí',start:0,duration:8800,fromRealm:0,toRealm:1,visualFrom:{id:'a',realm:0},visualTo:{id:'a',realm:1},reward:{qi:10}},before=JSON.stringify(e);
 for(const k of [0,.15,.29,.4,.55,.6,.66,.699,.71,.99])drawQiAwakening(scene,c,e,k*8800,1600);
 assert.deepEqual(seen,[0,0,0,0,0,0,0,0,1,1]);assert.equal(JSON.stringify(e),before);assert.equal(scene.ritualDrawing,undefined);assert.equal(scene.compact,undefined);assert.equal(scene.targets.length,1);
});
