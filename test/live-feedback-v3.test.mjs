import test from 'node:test';
import assert from 'node:assert/strict';
import {LiveFeedbackDirector,feedbackPlan,feedbackParticles} from '../public/live-feedback-fx.js';
import {combatImpactClock,impactSeverity} from '../public/skill-impact-v3.js';
import {prepareFeedbackAudio,playFeedbackAudio} from '../public/feedback-audio.js';

test('resource, like-goal, disciple and minor realm feedback use server event semantics',()=>{
  assert.deepEqual(feedbackPlan({id:'stage',stageUp:2,name:'A'}),{kind:'stage',priority:4,level:2,name:'A',title:'HẬU KỲ'});
  assert.equal(feedbackPlan({id:'stone',reward:{stones:450},name:'B'}).kind,'stones');
  assert.equal(feedbackPlan({id:'like',heartRounds:2,likeGoal:1100}).kind,'hearts');
  assert.equal(feedbackPlan({id:'disciple',achieve:{kind:'disciple'},name:'C'}).kind,'stage');
  assert.equal(feedbackPlan({id:'gift',gift:'Rose',reward:{stones:100}}),null);
  assert.equal(feedbackPlan({id:'npc',stageUp:1,resident:true}),null);
});
test('heart milestones, stone rain and impact respect Light particle caps',()=>{
  assert.ok(feedbackParticles('stones',true,3)<feedbackParticles('stones',false,3));
  assert.ok(feedbackParticles('hearts',true,2)<feedbackParticles('hearts',false,2));
  assert.equal(impactSeverity({technique:{intensity:3},damage:0}),0);
  assert.equal(impactSeverity({technique:{intensity:3},damage:90}),3);
  assert.equal(combatImpactClock({technique:{duration:2400}}),1320);
});
test('event queues reject duplicate IDs, debounce by user, cap active rows and never change state',()=>{
  const fx=new LiveFeedbackDirector(),calls=[];
  const scene={onFeedbackSound:(kind)=>calls.push(kind),budget:{pressured:false}};
  const base={kind:'stones',priority:1,level:1,name:'B',amount:20,user:'u'};
  assert.equal(fx.push({...base,id:'a'},1000,scene),true);
  assert.equal(fx.push({...base,id:'a'},1500,scene),false);
  assert.equal(fx.push({...base,id:'b'},1700,scene),false);
  assert.equal(fx.push({...base,id:'c'},1900,scene),true);
  for(let i=0;i<20;i++)fx.push({...base,user:'user'+i,id:'new'+i},2300+i,scene);
  assert.ok(fx.rows.length<=6);
  assert.ok(fx.seen.size<=200);
  assert.ok(calls.length<=23);
});
test('snapshot receipts only use new state deltas; throttle to two people per update',()=>{
  const fx=new LiveFeedbackDirector(),sound=[];
  const scene={onFeedbackSound:(kind)=>sound.push(kind)};
  const old=new Map([
    ['a',{id:'a',stones:20,likeReceipt:{total:99}}],
    ['b',{id:'b',stones:5,likeReceipt:{total:40}}],
    ['c',{id:'c',stones:2,likeReceipt:{total:0}}]
  ]);
  const next=[
    {id:'a',active:true,stones:20,likeReceipt:{total:106}},
    {id:'b',active:true,stones:105,likeReceipt:{total:40}},
    {id:'c',active:true,stones:802,likeReceipt:{total:0}}
  ];
  fx.snapshot(old,next,1000,scene);
  assert.equal(fx.rows.length,2);
  assert.ok(fx.rows.some(x=>x.kind==='hearts'));
  assert.ok(fx.rows.some(x=>x.kind==='stones'&&x.user==='b'));
  assert.equal(old.get('b').stones,5);
  fx.snapshot(new Map(next.map(p=>[p.id,p])),next,2000,scene);
  assert.equal(fx.rows.length,2);
});
test('pre-rendered sound buffers are reused; duplicate time window is suppressed',()=>{
 let created=0,started=0;
 const c={sampleRate:48000,currentTime:3,state:'running',
  createBuffer(ch,length,rate){created++;assert.equal(ch,1);assert.equal(rate,24000);return {getChannelData:()=>new Float32Array(length)};},
  createGain(){return {gain:{value:0},connect(){},disconnect(){}};},
  createBufferSource(){return {connect(){},disconnect(){},start(at){assert.ok(at>=3);started++;}};}
 };
 const sounds=prepareFeedbackAudio(c);
 assert.equal(sounds.size,5);assert.equal(prepareFeedbackAudio(c),sounds);
 const audio={enabled:true,ctx:c,sfx:.8,fxBus:{},ducked:false};
 assert.equal(playFeedbackAudio(audio,'crystal',1),true);
 assert.equal(playFeedbackAudio(audio,'crystal',1),false);
 assert.equal(created,5);
 c.currentTime=3.45;
 assert.equal(playFeedbackAudio(audio,'crystal',1),true);
 assert.equal(started,2);
});
