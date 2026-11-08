import {test} from 'node:test';import assert from 'node:assert/strict';import {VoiceQueue,priority} from '../public/voice.js';
const gift=(id='gift')=>({id,user:'123',name:'An',gift:'Hoa hồng',coins:1,effect:'petal',text:'cảm ơn đạo hữu'});
const audio={enabled:true,duck(){}};
test('real gifts outrank breakthroughs and lifecycle; puppet gifts stay below viewers',()=>{
 assert.equal(priority(gift()),6);assert.ok(priority(gift())>priority({effect:'visitor',visitorStart:true}));assert.equal(priority({...gift(),user:'puppet-demo'}),0);assert.equal(priority({...gift(),simulated:true}),0);
});
test('gift voice prepares immediately, reuses clip and never repeats when its visual turn arrives',async()=>{
 const old=globalThis.fetch;let requests=0,played=0;globalThis.fetch=async url=>{if(String(url).startsWith('/api/speech'))requests++;return {ok:true,blob:async()=>new Blob(['clip'])};}; /* 08/11: chỉ đếm câu đầy đủ, không đếm mảnh ghép */
 const q=new VoiceQueue({world:'demo',audio});q.running=true;q.play=async()=>{played++;};
 try{q.add(gift());assert.equal(requests,1,'TTS begins before the visual queue is released');q.add(gift());assert.equal(q.queue.length,1);q.running=false;await q.next();q.add(gift());await new Promise(r=>setImmediate(r));assert.equal(requests,1);assert.equal(played,1);assert.equal(q.queue.length,0);}finally{q.stop();globalThis.fetch=old;}
});
// 07/11/2026: lời cảm ơn trễ quá 30 giây bị bỏ — đọc cảm ơn khi không còn ai tặng trông như quà giả.
test('10-second-old gift thanks still plays; a 35-second-old one is dropped (08/11: hạn 12 s)',async()=>{
 const old=globalThis.fetch;let played=0;globalThis.fetch=async()=>({ok:true,blob:async()=>new Blob(['clip'])});const q=new VoiceQueue({world:'demo',audio});q.play=async()=>{played++;};
 try{q.queue=[{e:gift(),at:Date.now()-10000}];await q.next();assert.equal(played,1);q.queue=[{e:gift('late'),at:Date.now()-35000}];await q.next();assert.equal(played,1);}finally{q.stop();globalThis.fetch=old;}
});
test('gift flood has bounded preparation even when queued clips are evicted',()=>{
 const old=globalThis.fetch;let requests=0;globalThis.fetch=()=>{requests++;return new Promise(()=>{});};const q=new VoiceQueue({world:'demo',audio});q.running=true;
 try{for(let i=0;i<30;i++)q.add(gift('g'+i));assert.equal(requests,2);assert.ok(q.queue.length<=6);assert.ok(q.prepared.size<=2);q.add({...gift('fake'),autoRose:true,user:'puppet-test'});assert.ok(!q.queue.some(x=>x.e.id==='fake'));}finally{q.stop();globalThis.fetch=old;}
});
