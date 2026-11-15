import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawDaoNameBadge} from '../public/live2-badges.js';
test('normal players and invalid Dao never cost extra draws',()=>{
 const c={};
 assert.equal(drawDaoNameBadge(c,{id:'a'},100,100),false);
 assert.equal(drawDaoNameBadge(c,{live2Summary:{path:'invalid',level:5}},100,100),false);
});
test('badge safely restores canvas and suppresses larger tier halo in light mode',()=>{
 let s=0,r=0,circles=0;
 const c={save:()=>s++,restore:()=>r++,beginPath:()=>{},arc:()=>circles++,stroke:()=>{},fill:()=>{},fillText:()=>{}};
 assert.equal(drawDaoNameBadge(c,{live2Summary:{path:'sword',level:5}},100,100),true);
 assert.equal(circles,2);
 assert.equal(drawDaoNameBadge(c,{live2Summary:{path:'sword',level:5}},100,100,{light:true}),true);
 assert.equal(circles,3);
 assert.equal(s,r);
});
