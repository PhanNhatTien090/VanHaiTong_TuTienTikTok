import test from 'node:test';import assert from 'node:assert/strict';
import {tickBattleSound,scheduleBattleSound,combatVoice} from '../public/battle-audio.js';
import {CultivationAudio} from '../public/audio.js';
class Param{setValueAtTime(v){assert.ok(Number.isFinite(v));}exponentialRampToValueAtTime(v){assert.ok(v>0);}setTargetAtTime(){}cancelScheduledValues(){} }
class Node{constructor(c){this.c=c;this.frequency=new Param();this.gain=new Param();this.Q={value:0};}connect(){}start(){this.c.started++;}stop(){this.c.stopped++;}}
class Context{constructor(){this.currentTime=0;this.sampleRate=8000;this.started=0;this.stopped=0;this.state='running';}createGain(){return new Node(this);}createOscillator(){return new Node(this);}createBiquadFilter(){return new Node(this);}createBufferSource(){return new Node(this);}createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)};}}
test('every battle family schedules bounded finite sounds and stop cancels sources',()=>{
 const c=new Context(),bus={};for(const family of ['blade','thunder','fire','dragon','bell','ice','dark','magic']){const cue=scheduleBattleSound(c,bus,'cast',family);assert.ok(cue.nodes.length>=2&&cue.nodes.length<=3);cue.stop();}
 for(const kind of ['boss-charge','boss-strike','boss-shield','hit']){const cue=scheduleBattleSound(c,bus,kind,'abyss-dragon');assert.ok(cue.nodes.length>=2&&cue.nodes.length<=3);cue.stop();}
 assert.equal(combatVoice('bamboo'),'blade');assert.equal(combatVoice('flame'),'fire');assert.equal(c.stopped,c.started*2);
});
test('Ma Long cues phase changes once, records actual HP hits, and never replays missed attacks',()=>{
 const log=[],scene={onCombatSound:(...v)=>log.push(v)},b={id:'boss',species:'abyss-dragon',startedAt:0,hp:100,maxHp:100};
 tickBattleSound(scene,b,3700);assert.equal(log.length,0,'joining during breath stays silent');
 tickBattleSound(scene,b,3900);tickBattleSound(scene,b,4000);assert.equal(log.length,0);
 tickBattleSound(scene,b,5900);tickBattleSound(scene,b,6100);tickBattleSound(scene,b,7000);tickBattleSound(scene,b,12050);
 assert.equal(log.filter(v=>v[0]==='boss-charge').length,0,'jump across a long suspended gap is silent');
 tickBattleSound(scene,b,13000);tickBattleSound(scene,b,14000);tickBattleSound(scene,b,15000);tickBattleSound(scene,b,15700);tickBattleSound(scene,b,15800);
 assert.equal(log.filter(v=>v[0]==='boss-strike').length,1);
 b.hp=90;tickBattleSound(scene,b,16300);tickBattleSound(scene,b,16400);assert.equal(log.filter(v=>v[0]==='hit').length,1);
 tickBattleSound(scene,null,17000);assert.equal(scene.battleSound,null);
});
test('battle mix requires enabled audio, caps simultaneous cues and honors narration ducking and SFX mute',()=>{
 const a=new CultivationAudio(),ctx=new Context();a.ctx=ctx;a.fxBus={};a.combat('cast','sword');assert.equal(ctx.started,0);
 a.enabled=true;a.sfx=1;for(let i=0;i<30;i++){ctx.currentTime=i*.01;a.combat('cast','sword');}assert.ok(ctx.started<=4,'launch flood is throttled');
 a.sfx=0;const before=ctx.started;ctx.currentTime=3;a.combat('boss-strike','abyss-dragon');assert.equal(ctx.started,before);
 a.sfx=1;a.ducked=true;a.combat('boss-strike','abyss-dragon');assert.ok(ctx.started>before);
});
