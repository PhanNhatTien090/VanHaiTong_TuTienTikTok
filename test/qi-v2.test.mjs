import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {qiEnergyState,qiStreamPoint} from '../public/qi-energy.js';
import {drawQiAwakening} from '../public/qi-awakening.js';
import {scheduleQiAudio} from '../public/qi-audio.js';
import {CultivationAudio,MUSIC_GAIN} from '../public/audio.js';

test('energy ends at the dantian, compresses before the burst, and settles in reduced motion',()=>{
 const origin={x:450,y:994};
 for(const k of [.3,.6,.85,.879])for(let i=0;i<4;i++){
  const p=qiStreamPoint(k,i,1,origin);assert.equal(p.x,origin.x);assert.equal(p.y,origin.y);
  assert.deepEqual(qiStreamPoint(k,i,.5,origin),qiStreamPoint(k,i,.5,origin));
 }
 assert.ok(qiEnergyState(.875).compression>.9);assert.equal(qiEnergyState(.879).burst,0);
 assert.ok(qiEnergyState(.885).burst>.9);assert.ok(qiEnergyState(.985).burst<.01);
 assert.ok(qiEnergyState(.885,false).burst<.36);
});

test('Canvas and HUD output only the name and the revealed realm, even without DOM',()=>{
 const canvas=createCanvas(900,1600),c=canvas.getContext('2d'),texts=[];
 c.fillText=text=>texts.push(text);
 const scene={motion:false,drawPlayer(){}},event={user:'a',name:'Mộc Miên',start:0,duration:8800,toRealm:1};
 for(const k of [.14,.43,.66,.69,.705,.985])drawQiAwakening(scene,c,event,k*8800,1600);
 assert.deepEqual([...new Set(texts)],['Mộc Miên','LUYỆN KHÍ']);
 scene.onRitualFrame=s=>{assert.equal(s.label,'');assert.equal(s.detail,'');};
 drawQiAwakening(scene,c,event,4400,1600);
});

class Param {
 setValueAtTime(v){assert.ok(Number.isFinite(v));}
 linearRampToValueAtTime(v){assert.ok(Number.isFinite(v));}
 exponentialRampToValueAtTime(v){assert.ok(v>0&&Number.isFinite(v));}
 cancelScheduledValues(){} setTargetAtTime(){}
}
class Context {
 currentTime=10;sampleRate=8000;state='running';nodes=[];sources=[];
 node(source=false){const n={gain:new Param(),frequency:new Param(),connect(){},disconnect(){this.disconnected=true;},start(at){this.at=at;},stop(at){this.stopAt=at;}};this.nodes.push(n);if(source)this.sources.push(n);return n;}
 createGain(){return this.node();} createConvolver(){return this.node();}
 createBiquadFilter(){return this.node();} createOscillator(){return this.node(true);}
 createBufferSource(){return this.node(true);}
 createBuffer(ch,n){const d=Array.from({length:ch},()=>new Float32Array(n));return {getChannelData:i=>d[i]};}
}

test('one audio timeline per event, mute/interruption cleans up, voice ducking stays in effect',async()=>{
 const a=new CultivationAudio();a.enabled=true;a.ctx=new Context();
 a.master=a.ctx.createGain();a.ambBus=a.ctx.createGain();a.fxBus=a.ctx.createGain();a.music={volume:0};
 const event={duration:8800};a.ritual(event,0);const count=a.ctx.sources.length;
 assert.ok(count>10);a.ritual(event,500);assert.equal(a.ctx.sources.length,count);
 a.duck(true);a.ritual(null);assert.equal(a.music.volume,a.volume*a.ambient*MUSIC_GAIN*.28);
 assert.ok(a.ctx.sources.every(n=>n.stopAt<=a.ctx.currentTime+.05));
 await new Promise(resolve=>setTimeout(resolve,100));
 assert.ok(a.ctx.nodes.filter(n=>n!==a.master&&n!==a.ambBus&&n!==a.fxBus).some(n=>n.disconnected));
 a.duck(false);assert.equal(a.music.volume,a.volume*a.ambient*MUSIC_GAIN);
 a.enabled=false;a.ritual(event);assert.equal(a.qiSession,null);
});

test('returning to a tab after the burst does not replay stale impact or success cues',()=>{
 const c=new Context();scheduleQiAudio(c,{},8.4,8.8);
 assert.equal(c.sources.length,0);assert.ok(c.nodes.every(n=>n.disconnected));
});
