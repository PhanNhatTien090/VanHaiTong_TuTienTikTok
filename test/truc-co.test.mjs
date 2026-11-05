import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {trucCoState,trucCoStreamPoint} from '../public/truc-co-awakening.js';
import {drawRitual} from '../public/live-cinema.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {presentationDuration} from '../public/presentation.js';
import {scheduleTrucCoAudio,trucCoMusicDuck} from '../public/truc-co-audio.js';
import {CultivationAudio} from '../public/audio.js';

const at=(time,H=1600,motion=true)=>trucCoState(time/10.8,H,motion);
test('eight bamboo swords rise in sequence, then three foundation tiers raise the actor',()=>{
 assert.equal(at(1.19).swords.filter(p=>p.rise>0).length,0);
 assert.ok(at(2).swords.filter(p=>p.rise>0).length<8);
 assert.equal(at(3.6).swords.filter(p=>p.rise===1).length,8);
 assert.deepEqual(at(6.29).tiers,[0,0,0]);
 assert.deepEqual(at(6.9).tiers,[1,0,0]);
 assert.deepEqual(at(7.6).tiers,[1,1,0]);
 assert.deepEqual(at(8.3).tiers,[1,1,1]);assert.equal(at(8.3).lift,66);
 assert.equal(at(8.949).revealed,false);assert.equal(at(8.95).revealed,true);assert.equal(at(8.951).revealed,true);
 for(const t of [1.2,3.6,6.3,7,7.7,8.4,8.8,8.95,9.35])assert.ok(Math.abs(at(t-1e-6).lift-at(t+1e-6).lift)<.001);
});
test('all streams end on the foundation, and all quality/motion modes preserve eight swords',()=>{
 for(const H of [1200,1600,2000])for(const motion of [false,true]){
  const s=at(7.8,H,motion);assert.equal(s.swords.length,8);
  for(let i=0;i<8;i++){const end=trucCoStreamPoint(s,i,1);assert.equal(end.x,450);assert.ok(Math.abs(end.y-(s.ground-s.lift))<.0001);}
  assert.deepEqual(at(7.8,H,motion),s);
 }
 assert.ok(Math.abs(at(8.95).clock-8.95)<1e-8);
 assert.equal(at(8.97,1600,false).clock,0);assert.ok(at(8.97,1600,false).burst<.33);
});
test('dedicated Trúc Cơ renders only name/realm, changes clothes at its own peak, and leaves player data intact',()=>{
 const c=createCanvas(900,1600).getContext('2d'),texts=[],seen=[];c.fillText=text=>texts.push(text);
 const e={effect:'breakthrough',user:'a',name:'Mộc Miên',start:0,duration:10800,toRealm:2,fromRealm:1,visualFrom:{id:'a',realm:1},visualTo:{id:'a',realm:2},reward:{qi:42}},before=JSON.stringify(e);
 const scene={motion:false,budget:{level:'light'},drawPlayer:(c,p)=>seen.push(p.realm)};
 for(const t of [.1,3.6,6.9,8.8,8.949,8.951,10.4])drawRitual(scene,c,e,t*1000,1600);
 assert.deepEqual(seen,[1,1,1,1,1,2,2]);assert.deepEqual([...new Set(texts)],['Mộc Miên','TRÚC CƠ']);
 assert.equal(JSON.stringify(e),before);assert.equal(scene.compact,undefined);assert.equal(scene.ritualDrawing,undefined);
 assert.equal(breakthroughDuration(e),10800);assert.equal(presentationDuration(e),10800);
 let previous=0;for(let realm=1;realm<=18;realm++){const d=breakthroughDuration({toRealm:realm});if(realm===9)assert.equal(d,26000);else assert.ok(d>previous);previous=d;}
});
class Param {value=0;setValueAtTime(v){assert.ok(Number.isFinite(v));}linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));}exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));}cancelScheduledValues(){}setTargetAtTime(){}}
class Context {
 currentTime=10;sampleRate=8000;state='running';nodes=[];sources=[];
 node(source=false){const n={gain:new Param(),frequency:new Param(),Q:new Param(),pan:new Param(),connect(){},disconnect(){this.disconnected=true;},start(at){this.at=at;},stop(at){this.stopAt=at;}};for(const p of ['threshold','knee','ratio','attack','release'])n[p]=new Param();this.nodes.push(n);if(source)this.sources.push(n);return n;}
 createGain(){return this.node();}createConvolver(){return this.node();}createBiquadFilter(){return this.node();}createStereoPanner(){return this.node();}createDynamicsCompressor(){return this.node();}createOscillator(){return this.node(true);}createBufferSource(){return this.node(true);}
 createBuffer(ch,n){const d=Array.from({length:ch},()=>new Float32Array(n));return {getChannelData:i=>d[i]};}
}
test('audio shares visual milestones, skips missed impacts and supports stem exports',()=>{
 const c=new Context(),cue=scheduleTrucCoAudio(c,{});assert.ok(c.sources.some(s=>Math.abs(s.at-18.8)<1e-6));
 assert.ok(c.sources.some(s=>Math.abs(s.at-16.75)<1e-6));cue.stop();assert.ok(c.sources.every(s=>s.stopAt<=10.05));
 const late=new Context();scheduleTrucCoAudio(late,{},9.3);assert.ok(late.sources.every(s=>s.at>10));
 const stem=new Context();scheduleTrucCoAudio(stem,{},0,10.8,1,'swords');assert.equal(stem.sources.length,32);assert.ok(stem.sources.every(s=>s.at>=11.2&&s.at<13.3));
 assert.equal(trucCoMusicDuck(8700),.16);assert.equal(trucCoMusicDuck(10800),1);
});
test('a Trúc Cơ soundtrack starts once and restores music without cancelling narration duck',async()=>{
 const a=new CultivationAudio();a.enabled=true;a.ctx=new Context();a.fxBus=a.ctx.createGain();a.ambBus=a.ctx.createGain();a.master=a.ctx.createGain();a.music={volume:0};
 const e={toRealm:2,duration:10800};a.ritual(e,0);const count=a.ctx.sources.length;
 a.ritual(e,8700);assert.equal(a.ctx.sources.length,count);assert.equal(a.qiSession.duck,.16);
 a.duck(true);a.ritual(null);assert.equal(a.music.volume,a.volume*a.ambient*.28);
 await new Promise(r=>setTimeout(r,100));assert.ok(a.ctx.nodes.some(n=>n.disconnected));
 a.enabled=false;a.ritual(e);assert.equal(a.qiSession,null);
});
