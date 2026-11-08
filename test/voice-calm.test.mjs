// 08/11/2026: giảm giọng đọc — quà luôn đọc, câu thường giãn ra, người chơi lâu bớt nhắc, đang đột phá chỉ đọc quà.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {VoiceQueue,voiceDecision,veteranPlayer,VOICE_CALM} from '../public/voice.js';
const gift={id:'g',user:'u1',gift:'Hoa hồng',coins:1,effect:'petal',text:'cảm ơn đạo hữu'};
const qi=(id,user='u1')=>({id,user,effect:'qi',text:'Vận công • +30 tu vi'});
const newbie={id:'u1',realm:1,interactions:20,activeMs:600000,giftCoins:0},vet={id:'u2',realm:12,interactions:5000,activeMs:9e7,giftCoins:0},giver={...vet,giftCoins:36};
test('gifts and heaven strike always play, even during a breakthrough ritual',()=>{
 assert.equal(voiceDecision(gift,{ritualBusy:true}),'play');
 assert.equal(voiceDecision({id:'h',heavenStrike:true,effect:'heaven'},{ritualBusy:true}),'play');
});
test('during a ritual routine lines drop and event announcements wait',()=>{
 assert.equal(voiceDecision(qi('a'),{ritualBusy:true,player:newbie}),'drop');
 assert.equal(voiceDecision({id:'p',petStart:true,effect:'status',text:'LINH THÚ CỐC'},{ritualBusy:true}),'defer');
});
test('routine lines are spaced across the whole stage and per player',()=>{
 const now=1e7;
 assert.equal(voiceDecision(qi('a'),{now,player:newbie}),'play');
 assert.equal(voiceDecision(qi('b','u3'),{now,player:newbie,lastRoutineAt:now-5000}),'drop','another routine line 5 s later is skipped');
 assert.equal(voiceDecision(qi('c'),{now,player:newbie,lastRoutineAt:now-20000,lastUserRoutineAt:now-60000}),'drop','same player within 90 s');
 assert.equal(voiceDecision(qi('d'),{now,player:newbie,lastRoutineAt:now-20000,lastUserRoutineAt:now-VOICE_CALM.userRoutineGapMs}),'play');
});
test('long-time players stop hearing routine cultivation and hint lines',()=>{
 assert.ok(veteranPlayer(vet));assert.ok(!veteranPlayer(newbie));
 assert.equal(voiceDecision(qi('a','u2'),{player:vet}),'drop');
 assert.equal(voiceDecision({id:'h',user:'u2',effect:'hint',text:'gõ tuluyen'},{player:vet}),'drop');
});
test('breakthrough voice: gifters always, newcomers spaced, veterans who never gifted stay quiet',()=>{
 const bt={id:'b',user:'u2',effect:'breakthrough',text:'ĐỘT PHÁ'},now=1e7;
 assert.equal(voiceDecision(bt,{now,player:giver,lastBreakthroughAt:now-1000}),'play');
 assert.equal(voiceDecision(bt,{now,player:vet}),'drop');
 assert.equal(voiceDecision({...bt,user:'u1'},{now,player:newbie}),'play');
 assert.equal(voiceDecision({...bt,user:'u1'},{now,player:newbie,lastBreakthroughAt:now-10000}),'drop');
});
test('queue: a 30-line cultivation flood yields one routine line; the gift still waits first',()=>{
 const audio={enabled:true,duck(){}};const q=new VoiceQueue({world:'demo',audio,player:id=>id==='u2'?vet:newbie});q.running=true;
 q.add(gift);for(let i=0;i<30;i++)q.add(qi('q'+i,'n'+i));
 assert.equal(q.queue.length,2);assert.ok(q.queue.some(x=>x.e.id==='g'));q.stop();
});
test('queue: while a ritual plays only the gift is spoken; a waiting announcement plays afterwards',async()=>{
 const audio={enabled:true,duck(){},qiSession:{event:{id:'ritual'}}};const played=[];const q=new VoiceQueue({world:'demo',audio,player:()=>newbie});
 q.play=async(_u,e)=>{played.push(e.id);};const old=globalThis.fetch;globalThis.fetch=async()=>({ok:true,blob:async()=>new Blob(['x'])});
 try{q.running=true;q.add({id:'ann',effect:'status',petStart:true,text:'LINH THÚ CỐC'});q.add(qi('x'));q.add(gift);q.running=false;await q.next();
  assert.deepEqual(played,['g']);assert.ok(!q.queue.some(x=>x.e.id==='x'));assert.ok(q.queue.some(x=>x.e.id==='ann'),'announcement waits');
  audio.qiSession=null;await q.next();assert.deepEqual(played,['g','ann']);}
 finally{clearTimeout(q.ritualRetry);q.stop();globalThis.fetch=old;}
});
// 08/11: "Chào mừng đạo hữu gia nhập tông môn" bị lặp — bỏ câu dự phòng chung, giãn chào người vào.
import {fastVoiceFile} from '../public/voice.js';
import {ArrivalWelcomes} from '../public/arrival-welcome.js';
test('arrivals never fall back to the generic join clip',()=>{
 assert.equal(fastVoiceFile({id:'a',user:'u',autoArrival:true,effect:'join'}),null);
 assert.equal(fastVoiceFile({id:'a',user:'u',effect:'join'}),null);
});
test('arrival voice: one per 20 s across the stage; returning veterans are not read aloud',()=>{
 const a={id:'a',user:'u1',autoArrival:true,effect:'join',text:'Chào'},now=1e7;
 assert.equal(voiceDecision(a,{now,player:newbie}),'play');
 assert.equal(voiceDecision(a,{now,player:newbie,lastArrivalAt:now-5000}),'drop');
 assert.equal(voiceDecision({...a,returning:true,user:'u2'},{now,player:vet}),'drop');
});
test('the same viewer re-entering is welcomed once per 30 minutes',()=>{
 let t=0,shown=0;const voice={enabled:false,audio:{enabled:false},add(){}};
 const w=new ArrivalWelcomes({voice,show:()=>shown++,now:()=>t});
 w.add({id:'e1',user:'u1',autoArrival:true});t=60000;w.add({id:'e2',user:'u1',autoArrival:true});
 assert.equal(shown,1);t=31*60000;w.add({id:'e3',user:'u1',autoArrival:true});assert.equal(shown,2);
});
