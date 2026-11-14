
import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraImpulse,boundedCameraJolt,mixCameraImpulses} from '../public/cinematic-feedback.js';
import {cinematicQuality,cinematicSeed,drawShockwave,VFX_LIMITS} from '../public/cinematic-vfx.js';
import {CinematicSfx} from '../public/cinematic-sfx.js';
import {GIFT_HITS,giftSpectacleTier} from '../public/gift-spectacle.js';
import {LH_TIMING,luyenHuFormationState} from '../public/luyen-hu-formation.js';
import {sourceVisualPreferences} from '../public/visual-preferences.js';

test('hero scenes follow existing impact and reveal clocks',()=>{
  assert.equal(LH_TIMING.impact,17.25);
  assert.equal(LH_TIMING.reveal,17.55);
  assert.equal(luyenHuFormationState(LH_TIMING.impact-.001).blast,0);
  assert.ok(luyenHuFormationState(LH_TIMING.impact+.2).blast>0);
  const tier=giftSpectacleTier({coins:5000,count:1});
  assert.equal(tier.min,3000);
  assert.deepEqual(GIFT_HITS.map(at=>tier.duration*at),[4160,8580]);
});

test('shake decays, prioritizes the main cue and preserves camera coverage',()=>{
  const scene={cameraEnabled:true,motion:true,shakeLevel:'high'};
  const peak=cameraImpulse(scene,'legendary',32,.4);
  assert.ok(Math.abs(peak.x)>0);
  assert.deepEqual(cameraImpulse(scene,'legendary',285,.4),{x:0,y:0});
  assert.deepEqual(cameraImpulse({...scene,motion:false},'legendary',32,.4),{x:0,y:0});
  assert.deepEqual(cameraImpulse({...scene,shakeLevel:'off'},'legendary',32,.4),{x:0,y:0});
  const jolt=mixCameraImpulses({x:9,y:-9},{x:30,y:-30});
  assert.deepEqual(jolt,{x:10,y:-10});
  const base={s:1,x:0,y:0},cam=boundedCameraJolt(base,jolt,1600,true);
  assert.ok(cam.x<=0&&cam.x+900*cam.s>=900&&cam.y<=0&&cam.y+1600*cam.s>=1600);
});

test('VFX caps use crowd and pressure, and Reduced Motion/Flash draw only the core ring',()=>{
  assert.equal(cinematicQuality({actorLoad:{activePlayers:20}}),'light');
  assert.equal(cinematicQuality({budget:{level:'high',pressured:true}}),'light');
  assert.equal(cinematicQuality({budget:{level:'high'}}),'high');
  assert.ok(VFX_LIMITS.light.particles<VFX_LIMITS.balanced.particles);
  assert.equal(cinematicSeed('replay'),cinematicSeed('replay'));
  let rings=0;
  const c={save(){},restore(){},beginPath(){},ellipse(){rings++;},stroke(){},drawImage(){assert.fail('flash');},fillRect(){assert.fail('particles');}};
  drawShockwave(c,'void',450,900,200,{motion:false,flash:false,quality:'high'});
  assert.equal(rings,1);
});

test('auto URLs inherit shared settings and explicit URL overrides remain available',()=>{
  const shared={quality:'high',shake:'medium',motion:true,flash:true};
  assert.deepEqual(sourceVisualPreferences(new URLSearchParams('quality=auto'),{quality:'light'},shared),shared);
  assert.deepEqual(sourceVisualPreferences(new URLSearchParams('quality=light&shake=off'),{},shared),{...shared,quality:'light',shake:'off'});
});

test('prewarmed SFX buffers, cue deduplication, priority and cleanup',()=>{
  let buffers=0;
  const c={currentTime:3,
    createBuffer(ch,length){buffers++;return {length,getChannelData:()=>new Float32Array(length)};},
    createGain(){return {gain:{},connect(){},disconnect(){}};},
    createBufferSource(){return {connect(){},disconnect(){},stop(){},start(at){assert.ok(at>=3);}};}
  };
  const mixer=new CinematicSfx(c,{});
  const prewarmed=buffers;
  assert.equal(mixer.schedule('first','gold',.3),true);
  assert.equal(mixer.schedule('first','gold',.3),false);
  assert.equal(mixer.schedule('late','gold',-.2),false);
  mixer.schedule('second','jade',0);
  mixer.schedule('third','jade',0);
  assert.equal(mixer.schedule('over','void',0),false);
  assert.equal(mixer.schedule('major','void',0,{priority:4}),true);
  assert.equal(mixer.active.has('first'),false);
  assert.equal(buffers,prewarmed);
  const voices=[...mixer.active.get('major').sources];
  voices.forEach(source=>source.onended());
  assert.equal(mixer.active.has('major'),false);
  mixer.clear({replay:true});
  assert.equal(mixer.sourceCount,0);
  assert.equal(mixer.schedule('first','gold',.3),true);
  mixer.clear();
});
