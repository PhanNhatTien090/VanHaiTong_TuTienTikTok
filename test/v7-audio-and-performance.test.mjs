import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {prepareCinematicAudio,CINEMATIC_SOUND,CinematicSfx} from '../public/cinematic-sfx.js';
import {premiumArtKeys} from '../public/v7-premium-art.js';

const M=Math.max;
const peak=b=>b.reduce((max,v)=>M(max,Math.abs(v)),0);
const rms=b=>Math.sqrt(b.reduce((sum,v)=>sum+v*v,0)/Math.max(1,b.length));

test('V7 six cinematic sound signatures are synthesized once into bounded, clean 24k mono samples',()=>{
 let allocations=0,bytes=0;
 const ctx={createBuffer(ch,n,rate){
  assert.equal(ch,1);assert.equal(rate,24000);assert.ok(n>0&&n<48000);
  allocations++;bytes+=n*4;
  const data=new Float32Array(n);return {getChannelData:()=>data};
 }};
 const bank=prepareCinematicAudio(ctx);
 assert.ok(allocations>=50&&allocations<140);
 assert.ok(bytes<15*1024*1024,'prewarmed sample memory must remain bounded');
 const keys=['void-blade','starlight','blossom','holy-bell','meteor','fracture'];
 for(const key of keys){
  const voices=bank.get(key);
  assert.equal(voices.length,5);
  for(const buffer of voices){
   const sample=buffer.getChannelData(0);
   assert.ok(sample.every(Number.isFinite),key+' buffer must be finite');
   assert.ok(peak(sample)<=.781,key+' buffer must not internally clip');
  }
  assert.ok(rms(voices[2].getChannelData(0))>.0002,key+' crack layer must be audible');
 }
 assert.notDeepEqual(
  [...bank.get('fracture')[2].getChannelData(0).subarray(0,50)],
  [...bank.get('gold')[2].getChannelData(0).subarray(0,50)],
  'Fracture must have a distinct sound envelope, not just a renamed cue');
 // Avoid audio work in the render loop. All PREPARED arrays are reused.
 assert.equal(prepareCinematicAudio(ctx),bank);
 assert.equal(allocations,Object.keys(CINEMATIC_SOUND).length*5);
});

test('V7 audio mixer still gates to three concurrent priority voices',()=>{
 let active=0;
 const ctx={currentTime:50,
  createBuffer(ch,len){return {getChannelData:()=>new Float32Array(len)};},
  createGain(){return {gain:{value:0},connect(){},disconnect(){}};},
  createBufferSource(){return {connect(){},disconnect(){},stop(){active--},start(){active++}};}
 };
 const x=new CinematicSfx(ctx,{});
 assert.equal(x.schedule('thunder','storm',.2,{priority:5}),true);
 assert.equal(x.schedule('counter','void-blade',.2,{priority:2,charge:false,gain:.18}),true);
 assert.equal(x.schedule('gift','fracture',0,{priority:4,charge:false,gain:.2}),true);
 assert.equal(x.active.size,3);
 assert.equal(x.schedule('background','blossom',0,{priority:1}),false);
 assert.ok(x.sourceCount<=15);
 x.clear({replay:true});
 assert.equal(x.sourceCount,0);
});

test('preview independently toggles V7 fullscreen spectacle and contains premium decode diagnostics',async()=>{
 const html=await readFile('public/event-vfx-preview.html','utf8');
 const js=await readFile('public/event-vfx-preview.js','utf8');
 assert.match(html,/id="overdrive" checked/);
 assert.match(js,/scene\.v7Overdrive=scene\.cinematicV2&&\$\('overdrive'\)\.checked/);
 assert.match(js,/V7: /);
});

test('premium artwork matches ONLY actual V6 visuals, not V7 variants overridden by magic ID',()=>{
 const m={a:'x',b:'y',techniques:{x:{id:'soul'},y:{id:'sevenstars'}}};
 assert.deepEqual(premiumArtKeys(m),['shatter']);
 assert.deepEqual(premiumArtKeys({...m,techniques:{x:{id:'thunder'},y:{id:'flame'}}}),
  ['thunderDragon','thunderImpact','phoenix','phoenixImpact','shatter']);
});
