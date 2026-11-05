import test from 'node:test';
import assert from 'node:assert/strict';
import {VoiceQueue,VOICE_RATE} from '../public/voice.js';
const audio={enabled:true,duck(){}};
const turn=()=>new Promise(r=>setImmediate(r));

test('queued cultivation is fetched before its speaking turn, and reused',async()=>{
 const original=globalThis.fetch,requests=[];
 globalThis.fetch=async url=>{requests.push(url);return {ok:true,blob:async()=>new Blob(['clip'])};};
 const q=new VoiceQueue({world:'demo',audio});q.running=true;let played=0;q.play=async()=>played++;
 try{
  q.add({id:'cultivate',user:'p',effect:'qi'});
  assert.equal(requests.length,1);assert.equal(played,0);
  await turn();q.running=false;await q.next();
  assert.equal(requests.length,1);assert.equal(played,1);
 }finally{q.stop();globalThis.fetch=original;}
});

test('real action interrupts an idle sentence; only one clip speaks at a time',async()=>{
 const OriginalAudio=globalThis.Audio,originalFetch=globalThis.fetch,clips=[];
 globalThis.Audio=class{
  constructor(url){this.url=url;this.duration=8;clips.push(this);}
  async play(){this.played=true;}
  pause(){this.paused=true;}
 };
 globalThis.fetch=async()=>({ok:true,blob:async()=>new Blob(['clip'])});
 const starts=[],q=new VoiceQueue({world:'demo',audio,onStart:(e,ms)=>starts.push({id:e.id,ms})});
 try{
  const idle=q.idle({file:'/idle.mp3',text:'Lời nền'});await turn();
  assert.equal(clips[0].playbackRate,VOICE_RATE);assert.equal(clips[0].preservesPitch,true);
  q.add({id:'action',user:'viewer',effect:'qi'});
  await idle;await turn();
  assert.equal(clips[0].paused,true);assert.equal(clips.length,2);
  assert.equal(clips[1].playbackRate,VOICE_RATE);assert.equal(starts.at(-1).id,'action');
  assert.equal(starts.at(-1).ms,8000/VOICE_RATE);
  clips[1].onended();await turn();assert.equal(q.running,false);
 }finally{q.stop();globalThis.Audio=OriginalAudio;globalThis.fetch=originalFetch;}
});
