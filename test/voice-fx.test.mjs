// 19/11/2026: giọng đọc to + trong hơn, nhạc lùi sâu hơn khi đọc.
import test from 'node:test';
import assert from 'node:assert/strict';
import {routeVoice,VOICE_FX} from '../public/voice-fx.js';
import {VOICE_MUSIC_DUCK} from '../public/audio.js';
const node=()=>({connected:[],disconnected:false,connect(n){this.connected.push(n);},disconnect(){this.disconnected=true;},frequency:{value:0},Q:{value:0},gain:{value:0},threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0}});
const ctx=state=>({state,destination:{},createMediaElementSource:()=>node(),createBiquadFilter:node,createDynamicsCompressor:node,createGain:node});
test('giọng qua chuỗi lọc → khuếch đại → chặn trần → loa; dọn sạch khi xong',()=>{
 const c=ctx('running'),off=routeVoice(c,{});assert.equal(typeof off,'function');
 assert.ok(VOICE_FX.makeup>=1.3&&VOICE_FX.ceiling<0&&VOICE_FX.presenceDb>0);off();
});
test('AudioContext chưa chạy → không định tuyến (giọng phát thẳng, không bị câm)',()=>{
 assert.equal(routeVoice(ctx('suspended'),{}),null);assert.equal(routeVoice(null,{}),null);
});
test('nhạc lùi sâu khi giọng đọc',()=>{assert.ok(VOICE_MUSIC_DUCK<=.3);});
test('đột phá người thật: hình lấy trước mọi khung chờ lâu, giọng trên quà',async()=>{
 const {PresentationQueue,urgentBreakthrough}=await import('../public/presentation.js');const {priority}=await import('../public/voice.js');
 const q=new PresentationQueue(12),t=1e6;
 for(let i=0;i<8;i++)q.push({id:'s'+i,user:'u'+i,effect:'status',text:'Tu luyện'},t+i*100);
 q.push({id:'bt',user:'x',effect:'breakthrough',realm:3,name:'X'},t+15000);
 assert.equal(q.take(t+15050).id,'bt','đột phá không bị khung vặt quá hạn 12 s chen trước');
 assert.equal(urgentBreakthrough({effect:'breakthrough',resident:true}),false);
 assert.ok(priority({effect:'breakthrough',user:'x'})>priority({gift:true,coins:5,user:'y'}));
});
