import {test} from 'node:test';import assert from 'node:assert/strict';
import {SCENES} from '../public/world-rotation.js';
import {artworkCrop,projectedGround,courtyardTargets,constrainGroundTargets} from '../public/courtyard-layout.js';
import {Mover} from '../public/motion.js';
test('all circular courtyard maps keep feet on the projected platform for different crowds and aspect ratios',()=>{
 for(const env of SCENES.filter(e=>e.ground))for(const H of [850,1200,1600,1950])for(const n of [1,4,8,16,32]){
  const art={width:1024,height:1792},g=projectedGround(env,H,art),players=Array.from({length:n},(_,i)=>({id:'p'+i}));
  const targets=courtyardTargets(players,H,H*.66,env,art);
  for(const a of targets){const footY=a.y+40*a.scale,ellipse=((a.x-g.cx)/g.rx)**2+((footY-g.cy)/g.ry)**2;assert.ok(ellipse<=1.001,env.id+' '+H+' '+n);}
 }
});
test('ground follows the same cover crop as artwork and unrelated floating worlds retain their layout',()=>{
 const env=SCENES.find(e=>e.id==='autumn-peak'),H=850,art={width:1024,height:1792},crop=artworkCrop(1024,1792,H),g=projectedGround(env,H,art);
 assert.equal(g.cy,(env.ground.cy*1792-crop.sy)/crop.sh*H);
 assert.equal(projectedGround(SCENES.find(e=>e.id==='cosmos'),1600,art),null);
});
test('companion shifts are fitted back to the ground and old mover positions cannot sink below its edge',()=>{
 const env=SCENES.find(e=>e.id==='autumn-peak'),g=projectedGround(env,1600,{width:900,height:1600});
 const a={id:'a',x:40,y:1400,scale:1.8,player:{realm:0}};
 constrainGroundTargets([a],g);assert.ok(a.y<1000);
 const m=new Mover();m.pos.set('a',{x:a.x,y:1400});m.last=1000;m.place([a],1016,1600,g.cy,true);
 assert.ok(a.y<=a.groundMaxY);
});
