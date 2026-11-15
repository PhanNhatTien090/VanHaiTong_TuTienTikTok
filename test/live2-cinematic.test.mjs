import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawLive2ScreenFx,live2CinematicEligible} from '../public/live2-cinematic.js';
function ctx(){
 const calls={save:0,restore:0,stroke:0,fill:0},c={};
 for(const k of ['save','restore','stroke','fill','fillRect','beginPath','moveTo','lineTo','ellipse','translate','rotate','closePath']){
  c[k]=()=>{if(calls[k]!==undefined)calls[k]++};
 }
 return {c,calls};
}
test('only milestone events receive screen-wide cinematic',()=>{
 assert.equal(live2CinematicEligible({daoSkill:true}),false);
 assert.equal(live2CinematicEligible({daoUltimate:true}),true);
 assert.equal(live2CinematicEligible({bossPhase:'seal-break'}),true);
});
test('high quality and light quality always balance canvas save/restore',()=>{
 const ev={daoUltimate:true,daoPath:'sword'};
 for(const quality of [{light:false,reducedFlash:false,motion:true},{light:true,reducedFlash:true,motion:false}]){
  const {c,calls}=ctx();
  for(let i=0;i<25;i++)drawLive2ScreenFx(c,ev,i/25,900,1600,quality);
  assert.equal(calls.save,calls.restore);
  assert.ok(calls.stroke>0);
 }
});
test('screen FX ignores routine, invalid times and gifts',()=>{
 const {c,calls}=ctx();
 assert.equal(drawLive2ScreenFx(c,{daoSkill:true},.4,0,1600),false);
 assert.equal(drawLive2ScreenFx(c,{daoUltimate:true},Number.NaN,0,1600),false);
 assert.equal(calls.save,0);
});

test('screen-wide cinematics may be suppressed without changing gameplay event flags',()=>{
 const hit={daoUltimate:true,daoPath:'sword',live2CinematicSuppressed:true};
 assert.equal(live2CinematicEligible(hit),false);
 assert.equal(drawLive2ScreenFx({},hit,.5,1000),false);
 assert.equal(hit.daoUltimate,true);
});
