import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {kimDanState,kimDanStreamPoint} from '../public/kim-dan-awakening.js';
import {drawRitual} from '../public/live-cinema.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {presentationDuration} from '../public/presentation.js';
import {scheduleKimDanAudio,kimDanMusicDuck} from '../public/kim-dan-audio.js';
import {CultivationAudio} from '../public/audio.js';
const at=(t,H=1600,motion=true)=>kimDanState(t/11.8,H,motion);

test('nine gold drops coalesce, three seals close, and the core enters before the solar release',()=>{
 assert.equal(at(3.79).drops.filter(p=>p.u>0).length,0);
 assert.ok(at(4.3).drops.some(p=>p.u>0));assert.ok(at(4.3).drops.some(p=>p.u===0));
 assert.equal(at(6.1).drops.filter(p=>p.u===1).length,9);
 assert.deepEqual(at(6.14).seals,[0,0,0]);assert.deepEqual(at(8.15).seals,[1,1,1]);
 assert.equal(at(8.2).core.y,at(8.2).hover);assert.equal(at(9.05).core.y,at(9.05).belly);
 assert.ok(at(9.3).core.r<at(9.0).core.r);assert.equal(at(9.399).burst,0);
 assert.equal(at(9.549).revealed,false);assert.equal(at(9.55).revealed,true);
 assert.ok(at(9.6).sun>.5);assert.ok(at(10.8).sun>.9);
});
test('core movement remains continuous and every energy river reaches the core chamber',()=>{
 for(const t of [3.8,6.15,8.2,9.05,9.4,9.55]){const a=at(t-1e-6),b=at(t+1e-6);assert.ok(Math.hypot(a.core.x-b.core.x,a.core.y-b.core.y)<.001);assert.ok(Math.abs(a.core.r-b.core.r)<.001);}
 for(const H of [1200,1600,2000])for(const motion of [false,true]){
  const s=at(5.1,H,motion);assert.equal(s.drops.length,9);for(let i=0;i<6;i++){const p=kimDanStreamPoint(s,i,1);assert.equal(p.x,450);assert.equal(p.y,s.hover);}assert.deepEqual(at(5.1,H,motion),s);
 }
 assert.equal(at(9.6,1600,false).clock,0);assert.ok(at(9.6,1600,false).burst<=.3);
});
test('Kim Đan uses its own clothing reveal and only name/realm text without modifying rewards',()=>{
 const c=createCanvas(900,1600).getContext('2d'),texts=[],seen=[];c.fillText=text=>texts.push(text);
 const e={effect:'breakthrough',user:'a',name:'Mộc Miên',start:0,duration:11800,fromRealm:2,toRealm:3,visualFrom:{id:'a',realm:2},visualTo:{id:'a',realm:3},reward:{qi:123}},before=JSON.stringify(e),scene={motion:false,budget:{level:'light'},drawPlayer:(c,p)=>seen.push(p.realm)};
 for(const t of [.1,3.8,6,8.7,9.4,9.549,9.551,11.4])drawRitual(scene,c,e,t*1000,1600);
 assert.deepEqual(seen,[2,2,2,2,2,2,3,3]);assert.deepEqual([...new Set(texts)],['Mộc Miên','KIM ĐAN']);assert.equal(JSON.stringify(e),before);
 assert.equal(scene.compact,undefined);assert.equal(scene.ritualDrawing,undefined);assert.equal(c.globalCompositeOperation,'source-over');
 assert.equal(breakthroughDuration(e),11800);assert.equal(presentationDuration(e),11800);assert.equal(breakthroughDuration({toRealm:1}),8800);assert.equal(breakthroughDuration({toRealm:2}),10800);
 let prev=0;for(let r=1;r<=18;r++){const d=breakthroughDuration({toRealm:r});if(r===9)assert.equal(d,26000);else assert.ok(d>prev);prev=d;}
});
class Param {value=0;setValueAtTime(v){assert.ok(Number.isFinite(v));}linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));}exponentialRampToValueAtTime(v){assert.ok(Number.isFinite(v)&&v>0);}cancelScheduledValues(){}setTargetAtTime(){}}
class Context {
 currentTime=10;sampleRate=8000;state='running';nodes=[];sources=[];
 node(source=false){const n={gain:new Param(),frequency:new Param(),Q:new Param(),pan:new Param(),connect(){},disconnect(){this.disconnected=true;},start(at){this.at=at;},stop(at){this.stopAt=at;}};for(const k of ['threshold','knee','ratio','attack','release'])n[k]=new Param();this.nodes.push(n);if(source)this.sources.push(n);return n;}
 createGain(){return this.node();}createConvolver(){return this.node();}createBiquadFilter(){return this.node();}createStereoPanner(){return this.node();}createDynamicsCompressor(){return this.node();}createOscillator(){return this.node(true);}createBufferSource(){return this.node(true);}
 createBuffer(ch,n){const d=Array.from({length:ch},()=>new Float32Array(n));return {getChannelData:i=>d[i]};}
}
test('liquid arrivals and solar impact have one audio clock; missed transients are not replayed',()=>{
 const c=new Context(),cue=scheduleKimDanAudio(c,{});assert.ok(c.sources.some(s=>Math.abs(s.at-19.4)<1e-6));assert.ok(c.sources.some(s=>Math.abs(s.at-15.05)<1e-6));cue.stop();assert.ok(c.sources.every(s=>s.stopAt<=10.05));
 const late=new Context();scheduleKimDanAudio(late,{},9.8,11.8,1,'burst');assert.equal(late.sources.length,0);
 const stem=new Context();scheduleKimDanAudio(stem,{},0,11.8,1,'liquid');assert.equal(stem.sources.length,27);assert.ok(stem.sources.every(s=>s.at>=15.05&&s.at<15.9));
 assert.equal(kimDanMusicDuck(9400),.14);assert.equal(kimDanMusicDuck(11800),1);
});
test('dedicated Kim Đan audio starts once, ducks smoothly and stops on interruption',async()=>{
 const a=new CultivationAudio();a.enabled=true;a.ctx=new Context();a.master=a.ctx.createGain();a.ambBus=a.ctx.createGain();a.fxBus=a.ctx.createGain();a.music={volume:0};
 const event={toRealm:3,duration:11800};a.ritual(event,0);const count=a.ctx.sources.length;a.ritual(event,9400);assert.equal(a.ctx.sources.length,count);assert.equal(a.qiSession.duck,.14);
 a.duck(true);a.ritual(null);assert.equal(a.music.volume,a.volume*a.ambient*.28);await new Promise(r=>setTimeout(r,100));assert.ok(a.ctx.nodes.some(n=>n.disconnected));
 a.enabled=false;a.ritual(event);assert.equal(a.qiSession,null);
});
