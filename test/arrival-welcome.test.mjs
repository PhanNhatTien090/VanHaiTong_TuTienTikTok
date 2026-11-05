import test from 'node:test';import assert from 'node:assert/strict';
import {ArrivalWelcomes} from '../public/arrival-welcome.js';import {VoiceQueue,priority} from '../public/voice.js';
const e={id:'entry',user:'new',name:'Đạo hữu mới',effect:'join',autoArrival:true};
test('arrival appears and focuses immediately while speech prepares; voice start never duplicates the entrance',()=>{
 const calls=[],timers=[];const voice={enabled:true,audio:{enabled:true},add:e=>calls.push('voice:'+e.id)};
 const w=new ArrivalWelcomes({voice,show:e=>calls.push('show:'+e.id),schedule:fn=>timers.push(fn)});
 w.add(e);assert.deepEqual(calls,['show:entry','voice:entry']);assert.equal(w.spoken(e,4000),true);assert.deepEqual(calls,['show:entry','voice:entry']);w.add(e);assert.equal(calls.length,2);
});
test('muted or failed speech still welcomes, stale entrances expire and queues stay bounded',()=>{
 let now=0,shown=0;const timers=[],voice={enabled:false,audio:{enabled:false},add(){throw Error('muted')}};
 const w=new ArrivalWelcomes({voice,show:()=>shown++,now:()=>now,schedule:fn=>timers.push(fn)});w.add(e);assert.equal(shown,1);
 voice.enabled=true;voice.audio.enabled=true;voice.add=()=>{};for(let i=0;i<40;i++)w.add({...e,id:'join'+i});assert.ok(w.pending.size<=12);now=16000;for(const fn of timers)fn();assert.equal(shown,41);
});
test('spoken welcomes outrank cultivation, never outrank real gifts, cap at three waiting and deduplicate playback',()=>{
 assert.ok(priority(e)>priority({effect:'qi'}));assert.ok(priority(e)<priority({gift:'Hoa hồng',coins:1}));
 const q=new VoiceQueue({world:'demo',audio:{enabled:true,duck(){}}});q.running=true;q.prepare=()=>Promise.resolve(new Blob());
 for(let i=0;i<20;i++)q.add({...e,id:'arrival'+i,user:'p'+i});assert.equal(q.queue.filter(x=>x.e.autoArrival).length,3);q.add({...e,id:'arrival0',user:'p0'});assert.equal(q.queue.length,3);q.stop();
});
