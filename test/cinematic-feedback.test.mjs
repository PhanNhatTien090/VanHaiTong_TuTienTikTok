import test from 'node:test';
import assert from 'node:assert/strict';
import {CultivationAudio,softClipCurve,ascensionImpactRatio} from '../public/audio.js';
import {REALM_NAMES} from '../public/progression.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {boundedCameraJolt,giftCameraImpulse,takeFeedbackCue} from '../public/cinematic-feedback.js';
import {EventGiftQueue,eventGiftTier} from '../public/event-gift-fx.js';

test('impact plays once across visual passes and drops missed impact after resume',()=>{
  const event={};
  assert.equal(takeFeedbackCue(event,'sound',.29,.3,.43),false);
  assert.equal(takeFeedbackCue(event,'sound',.32,.3,.43),true);
  assert.equal(takeFeedbackCue(event,'sound',.34,.3,.43),false);
  assert.equal(takeFeedbackCue({},'sound',.99,.3,.43),false);
  const queue=new EventGiftQueue(),now=Date.now();
  const row={id:'gift-1',mode:'race',at:now,user:'p1',value:5000};
  queue.sync('race:x',[row,row],now);
  assert.equal(queue.pending.length,1);
  assert.equal(queue.sample(10).id,row.id);
  queue.sync('race:x',[row],now+250);
  assert.equal(queue.pending.length,0);
  assert.equal(queue.sample(110).start,10);
});

test('event shake respects crowd, accessibility, camera bounds and recovery',()=>{
  const mode={motion:true,cameraEnabled:true,shakeLevel:'high'};
  const event={value:5000,start:100,profile:eventGiftTier(5000),mode:'duel'};
  const impact=100+event.profile.duration*.31;
  const jolt=giftCameraImpulse(mode,event,impact);
  const lite=giftCameraImpulse({...mode,heavyCrowd:true},event,impact);
  assert.ok(Math.abs(lite.x)<Math.abs(jolt.x));
  for(const disabled of [{motion:false},{cameraEnabled:false},{shakeLevel:'off'}]){
    assert.deepEqual(giftCameraImpulse({...mode,...disabled},event,impact),{x:0,y:0});
  }
  const base={s:1,x:0,y:0},H=1600,cam=boundedCameraJolt(base,jolt,H,true);
  assert.ok(cam.x<=0&&cam.x+900*cam.s>=900);
  assert.ok(cam.y<=0&&cam.y+H*cam.s>=H);
  assert.equal(boundedCameraJolt(base,giftCameraImpulse(mode,event,100+event.profile.duration),H,true),base);
});

class Param{
  value=0;
  check(value,time){assert.ok(Number.isFinite(value)&&Number.isFinite(time));}
  setValueAtTime(...args){this.check(...args);}
  linearRampToValueAtTime(...args){this.check(...args);}
  exponentialRampToValueAtTime(...args){this.check(...args);assert.ok(args[0]>0);}
  setTargetAtTime(...args){this.check(...args);}
  cancelScheduledValues(){}
}
class Node{
  constructor(c,key){
    this.c=c;this.key=key;
    for(const name of ['gain','frequency','Q','pan','delayTime','threshold','ratio','knee','attack','release','playbackRate'])this[name]=new Param();
  }
  connect(destination){assert.ok(destination);}
  disconnect(){}
  setPeriodicWave(){}
  start(time){assert.ok(time===undefined||Number.isFinite(time));this.c.starts++;}
  stop(time){assert.ok(time===undefined||Number.isFinite(time));}
}
class Context{
  currentTime=1;
  sampleRate=8000;
  destination={};
  state='running';
  starts=0;
  createBuffer(channels,length){
    const data=Array.from({length:channels},()=>new Float32Array(length));
    return {getChannelData:i=>data[i]};
  }
  createPeriodicWave(){return {};}
}
for(const kind of ['Gain','Oscillator','BiquadFilter','DynamicsCompressor','WaveShaper','Convolver','BufferSource','StereoPanner','Delay']){
  Context.prototype['create'+kind]=function(){return new Node(this,kind);};
}

test('every realm schedules finite real score events at start and near impact',()=>{
  const audio=new CultivationAudio(),context=new Context();
  audio.init(context);audio.enabled=true;
  for(let realm=1;realm<REALM_NAMES.length;realm++){
    const event={id:'realm-'+realm,user:'fake',toRealm:realm,effect:'breakthrough'};
    event.duration=breakthroughDuration(event);
    for(const at of [0,event.duration*ascensionImpactRatio(realm)-300]){
      const before=context.starts;
      const cue=audio.scheduleRitual(event,realm,at);
      assert.ok(context.starts>before,REALM_NAMES[realm]+' at '+at);
      assert.ok(cue.endAt>context.currentTime);
      cue.stop();cue.stop();
    }
  }
  assert.ok(Math.max(...softClipCurve())<.96);
});

test('background gameplay sound yields to ritual but event gift gets a reserved slot',()=>{
  const context=new Context(),audio=new CultivationAudio();
  audio.init(context);audio.enabled=true;audio.qiSession={audio:{stop(){}}};
  const before=context.starts;
  audio.play('qi');assert.equal(context.starts,before);
  audio.voices=Array(5).fill(context.currentTime+1);
  audio.play('dragon',true);assert.ok(context.starts>before);
  context.state='suspended';
  const after=context.starts;audio.play('impact',true);assert.equal(context.starts,after);
});
