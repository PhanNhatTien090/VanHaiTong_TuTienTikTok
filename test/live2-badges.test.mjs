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

test('cached Dao badges draw a texture each frame but rasterize text only once',()=>{
 let drawn=0,painted=0,requested=0,cacheItem=null;
 const c={drawImage:()=>drawn++};
 const cache={get:(key,width,height,paint)=>{
   requested++;if(!cacheItem){
     const off={setTransform:()=>{},save:()=>{},restore:()=>{},beginPath:()=>{},arc:()=>{},fill:()=>{},stroke:()=>{},fillText:()=>painted++};
     paint(off);cacheItem={width,height};
   }
   return cacheItem;
 }};
 for(let frame=0;frame<60;frame++)assert.equal(drawDaoNameBadge(c,{live2Summary:{path:'sword',level:5}},100,100,{cache}),true);
 assert.equal(requested,60);
 assert.equal(painted,1);
 assert.equal(drawn,60);
});
