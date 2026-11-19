// 19/11/2026: giọng rõ hơn nhạc (nhạc lùi sâu khi đọc, giọng phát nguyên bản), đột phá ưu tiên.
import test from 'node:test';
import assert from 'node:assert/strict';
import {VOICE_MUSIC_DUCK} from '../public/audio.js';
test('nhạc lùi sâu khi giọng đọc',()=>{assert.ok(VOICE_MUSIC_DUCK<=.15);});
test('đột phá người thật: hình lấy trước mọi khung chờ lâu, giọng trên quà',async()=>{
 const {PresentationQueue,urgentBreakthrough}=await import('../public/presentation.js');const {priority}=await import('../public/voice.js');
 const q=new PresentationQueue(12),t=1e6;
 for(let i=0;i<8;i++)q.push({id:'s'+i,user:'u'+i,effect:'status',text:'Tu luyện'},t+i*100);
 q.push({id:'bt',user:'x',effect:'breakthrough',realm:3,name:'X'},t+15000);
 assert.equal(q.take(t+15050).id,'bt','đột phá không bị khung vặt quá hạn 12 s chen trước');
 assert.equal(urgentBreakthrough({effect:'breakthrough',resident:true}),false);
 assert.ok(priority({effect:'breakthrough',user:'x'})>priority({gift:true,coins:5,user:'y'}));
});
