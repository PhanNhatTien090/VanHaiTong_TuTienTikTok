import test from 'node:test';
import assert from 'node:assert/strict';
import {liveAudienceCount,plannedActorCount,keepCrowdFlag} from '../public/crowd-policy.js';
import {CharacterFrames,FrameClock,RenderBudget,renderDimensions} from '../public/performance.js';
import {RenderMetrics} from '../public/live-diag.js';

test('actor workload follows render candidates when viewers and players disagree',()=>{
  const now=10000;
  for(const [viewers,actors,planned] of [[5,80,50],[80,10,10]]){
    const state={connection:{viewerCount:viewers,viewerCountAt:now}};
    assert.equal(liveAudienceCount(state,now),viewers);
    assert.equal(plannedActorCount(state,actors),planned);
    const budget=new RenderBudget();
    budget.setAudience(planned);
    assert.equal(budget.audienceTier,actors===80?21:10);
  }
  assert.equal(plannedActorCount({hallWar:{active:true,members:new Array(80)}},80),15);
  assert.equal(plannedActorCount({maze:{active:true}},80),0);
  assert.equal(plannedActorCount({raceStatus:{active:true,racers:new Array(100)},raceStage:new Array(30)},80),12);
  assert.equal(plannedActorCount({socialStage:['a','b']},80),2);
});

test('actor quality and its effect flags are stable around crowd thresholds',()=>{
  for(const threshold of [10,20,21,31,51]){
    assert.equal(keepCrowdFlag(threshold-1,false,threshold),false);
    assert.equal(keepCrowdFlag(threshold,false,threshold),true);
    assert.equal(keepCrowdFlag(threshold-1,true,threshold),true);
    assert.equal(keepCrowdFlag(threshold-4,true,threshold),false);
  }
  const budget=new RenderBudget();
  for(const group of [[10,9,10],[20,19,20],[21,19,20,21],[30,29,31],[50,49,51]]){
    budget.setAudience(group[0]);
    const config=budget.config;
    for(const count of group.slice(1)){
      budget.setAudience(count);
      assert.equal(budget.config,config);
    }
  }
});

test('low rendered FPS slows secondary animation and recovers with full-HD backing',()=>{
  const budget=new RenderBudget();
  budget.setAudience(50);
  const original=budget.config;
  const sample=(start,fps)=>{for(let i=0;i<50;i++)budget.sample(9,start+i*42,fps);};
  sample(12000,15);
  assert.equal(budget.pressured,true);
  assert.ok(budget.config.poseFps<original.poseFps);
  assert.equal(budget.config.spriteScale,original.spriteScale);
  assert.equal(budget.config.fps,original.fps);
  assert.equal(budget.config.effects,original.effects);
  for(const width of [1080,720,540]){
    const rect={width,height:width*16/9};
    assert.deepEqual(renderDimensions(rect,budget.config,false,1080,1),rect);
  }
  sample(24000,24);
  assert.equal(budget.pressured,true);
  sample(44000,24);
  assert.equal(budget.pressured,false);
  assert.equal(budget.config,original);
});

test('frame scheduler resumes from a pause without an extra catch-up frame',()=>{
  const clock=new FrameClock();
  assert.equal(clock.ready(10,24),true);
  assert.equal(clock.ready(1000,24),true);
  assert.equal(clock.ready(1016,24),false);
  assert.equal(clock.ready(1042,24),true);
});

test('repainting with a new state reuses the existing zoomed raster and reports cache cost',()=>{
  const ctx={setTransform(){},clearRect(){},drawImage(){}};
  const cache=new CharacterFrames((width,height)=>({width,height,getContext:()=>ctx}));
  const paint=()=>{};
  cache.draw(ctx,'a','skin:A',paint,4);
  cache.draw(ctx,'a','skin:A',paint,2.5);
  cache.draw(ctx,'a','skin:B',paint,2.5);
  const metrics=new RenderMetrics();
  for(const gap of [31,32,33,62])metrics.add('frameInterval',gap);
  const data=metrics.snapshot({characterFrames:cache,visibleActors:1});
  assert.deepEqual(data.timings.frameInterval,{samples:4,p50:32,p95:62,p99:62});
  assert.equal(data.cache.allocations,1);
  assert.equal(data.cache.hits,1);
  assert.equal(data.cache.repaints,2);
  assert.equal(data.actors.visibleActors,1);
  assert.equal(metrics.snapshot({characterFrames:cache}).cache.repaints,0);
});
