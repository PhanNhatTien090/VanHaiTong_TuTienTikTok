import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {drawHoaThanAwakening,hoaThanActorImage,hoaThanPlayers} from '../public/hoa-than-awakening.js';
import {hoaThanFormationState,HT_TIMING as T,HT_STRIKES} from '../public/hoa-than-formation.js';
import {scheduleHoaThanAudio,HOA_THAN_SCORE} from '../public/hoa-than-audio.js';

test('Hoa Than has immediate weather, six ordered charges, full absorption before impact and reveal',()=>{
 const at=t=>hoaThanFormationState(t);
 assert.ok(at(.2).wake>0);assert.ok(at(1).tide>0);assert.equal(at(4).seals.reduce((a,b)=>a+b),0);assert.ok(at(6.6).seals.every(x=>x===1));
 assert.ok(HT_STRIKES.every((t,i)=>i===0||t>HT_STRIKES[i-1]));assert.ok(HT_STRIKES.at(-1)<T.manifest);
 assert.ok(at(12).effigy>.9);assert.equal(at(12.7).recall,0);assert.equal(at(T.absorbed).recall,1);assert.ok(T.absorbed<T.impact&&T.impact<T.reveal);
 assert.equal(at(T.absorbed).seals.reduce((a,b)=>a+b),0);assert.equal(at(17.6).fade,0);assert.deepEqual(at(8),at(8));assert.equal(hoaThanFormationState(8,1600,false).clock,0);
});

test('Hoa Than snapshots retain event skin and actor helper restores all shared render state, even on error',()=>{
 const doc=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
  const p={id:'a',realm:5,skinChoice:'sea-dragon-heir',rewardSkins:['sea-dragon-heir'],gender:'nu'},e={id:'skin',user:'a',visualFrom:{...p,realm:4},visualTo:p};
  const scene={playerIndex:new Map([['a',p]]),targets:['keep'],compact:false,ritualDrawing:false,cinematicPose:{stand:.3},characterFrames:{kept:true},drawPlayer(c,p){assert.equal(this.cinematicPose.stand,1);assert.equal(this.characterFrames,null);assert.equal(p.skinChoice,'sea-dragon-heir');}};
  const saved={targets:scene.targets,compact:scene.compact,ritualDrawing:scene.ritualDrawing,cinematicPose:scene.cinematicPose,characterFrames:scene.characterFrames},snaps=hoaThanPlayers(scene,e);
  p.skinChoice='another';p.rewardSkins.push('later');assert.equal(hoaThanPlayers(scene,e).to.skinChoice,'sea-dragon-heir');assert.deepEqual(snaps.to.rewardSkins,['sea-dragon-heir']);
  const a=hoaThanActorImage(scene,snaps.from,e);assert.equal(hoaThanActorImage(scene,snaps.from,e),a);assert.ok(a.height>=760);for(const [key,value]of Object.entries(saved))assert.equal(scene[key],value);
  scene.drawPlayer=()=>{throw Error('draw failure');};assert.throws(()=>hoaThanActorImage(scene,{...snaps.to},e),/draw failure/);for(const [key,value]of Object.entries(saved))assert.equal(scene[key],value);
 }finally{globalThis.document=doc;}
});

test('Hoa Than rendering preserves event and skin until reveal across heights and reduced motion',()=>{
 const doc=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{for(const H of [1200,1600]){
  const p={id:'a',realm:4,skinChoice:'chosen'},e={id:'render',user:'a',name:'A',start:0,duration:17600,visualFrom:p,visualTo:{...p,realm:5}},seen=[],scene={players:[p],budget:{level:'light'},motion:false,drawPlayer(c,p){seen.push(p.realm);},targets:['original']},c=createCanvas(900,H).getContext('2d'),before=JSON.stringify(e);
  for(const t of [.2,4.2,8,12,14.25,14.5,14.64,14.66,17.3]){const ui=drawHoaThanAwakening(scene,c,e,t*1000,H);assert.equal(ui.revealed,t>=T.reveal);assert.equal(ui.shake,0);assert.equal(c.globalCompositeOperation,'source-over');assert.deepEqual(scene.targets,['original']);}
  assert.deepEqual(seen,[4,5]);assert.equal(scene.hoaThanV2Actor.frames.size,2);assert.equal(JSON.stringify(e),before);
 }}finally{globalThis.document=doc;}
});

class Param{constructor(){this.value=0;}setValueAtTime(v,t){assert.ok(Number.isFinite(v)&&Number.isFinite(t));}linearRampToValueAtTime(v,t){assert.ok(Number.isFinite(v)&&Number.isFinite(t));}exponentialRampToValueAtTime(v,t){assert.ok(v>0&&Number.isFinite(t));}}
class Context{constructor(){this.currentTime=5;this.sampleRate=8000;this.sources=[];this.destination={};}node(){return {gain:new Param(),frequency:new Param(),Q:new Param(),pan:new Param(),delayTime:new Param(),threshold:new Param(),knee:new Param(),ratio:new Param(),attack:new Param(),release:new Param(),connect(){},disconnect(){}};}createGain(){return this.node();}createDynamicsCompressor(){return this.node();}createBiquadFilter(){return this.node();}createStereoPanner(){return this.node();}createDelay(){return this.node();}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}source(noise){const n=this.node();n.noise=noise;n.start=t=>{assert.ok(t>=this.currentTime);n.started=t;};n.stop=t=>{if(t!==undefined)assert.ok(t>=n.started);n.stops=(n.stops||0)+1;};this.sources.push(n);return n;}createOscillator(){return this.source(false);}createBufferSource(){return this.source(true);}}
test('Hoa Than audio schedules with valid timing, drops old impact transients and stops idempotently',()=>{
 assert.ok(HOA_THAN_SCORE.some(x=>x.at===T.opening&&x.tag==='lightning-crack'));assert.equal(HOA_THAN_SCORE.filter(x=>x.tag==='seal-opening').length,6);
 const full=new Context(),a=scheduleHoaThanAudio(full,full.destination,0,17.6);assert.ok(full.sources.length>100);a.stop();a.stop();assert.ok(full.sources.every(s=>s.stops===2));
 const late=new Context(),b=scheduleHoaThanAudio(late,late.destination,16.5,17.6);assert.ok(late.sources.length<20);assert.ok(late.sources.filter(x=>x.noise).length<=1);b.stop();
});
