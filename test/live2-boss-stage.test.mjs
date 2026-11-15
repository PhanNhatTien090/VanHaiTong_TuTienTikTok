import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawLive2BossStage} from '../public/live2-boss-stage.js';
function mock(){
 let saves=0,restores=0,draws=0;
 const c={save:()=>saves++,restore:()=>restores++,translate:()=>{},rotate:()=>{},beginPath:()=>{},ellipse:()=>draws++,moveTo:()=>{},lineTo:()=>{},stroke:()=>draws++,lineCap:''};
 return {c,stats:()=>({saves,restores,draws})};
}
test('normal Boss and old LIVE do not draw special effects',()=>{
 const {c,stats}=mock();
 assert.equal(drawLive2BossStage(c,{hp:600},450,400,1000),false);
 assert.deepEqual(stats(),{saves:0,restores:0,draws:0});
});
test('3 phase Boss auras are bounded, balanced and work with light or reduced flash',()=>{
 const {c,stats}=mock();
 for(const id of ['gathering','seal','frenzy']){
  for(const light of [false,true]){
   const b={live2Boss:{id,exposed:true}};
   assert.equal(drawLive2BossStage(c,b,450,420,1000,{light,motion:false,reducedFlash:true}),true);
  }
 }
 const s=stats();assert.equal(s.saves,s.restores);assert.ok(s.draws>0);assert.ok(s.draws<130);
});
