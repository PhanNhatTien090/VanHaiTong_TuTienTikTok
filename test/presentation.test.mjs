import {test} from 'node:test';import assert from 'node:assert/strict';
import {PresentationQueue,presentationDuration} from '../public/presentation.js';
import {Scene} from '../public/scene.js';import {StageDirector} from '../public/stage.js';

test('a breakthrough held during a sword race is retained and plays when the race ends',()=>{
 const q=new PresentationQueue();q.push({id:'break',user:'a',effect:'breakthrough',toRealm:5},1000);
 assert.equal(q.take(2000,e=>e.effect!=='breakthrough'),undefined);assert.equal(q.items.length,1);
 q.push({id:'status',user:'b',effect:'status'},2000);assert.equal(q.take(2001,e=>e.effect!=='breakthrough').id,'status');
 assert.equal(q.take(241000,e=>e.effect!=='breakthrough'),undefined);assert.equal(q.items.length,1);
 assert.equal(q.take(241001).id,'break');assert.equal(q.take(241002),undefined);
});
test('hundreds of viewers cannot create an unbounded visual queue and VIPs take the next slot',()=>{
 const q=new PresentationQueue(12);
 for(let i=0;i<500;i++)q.push({id:'e'+i,user:'p'+i,effect:'qi'},1000+i);
 assert.equal(q.items.length,12);assert.ok(q.coalesced>=488);
 q.push({id:'vip',user:'donor',coins:9999,count:1,effect:'dragon'},1600);
 assert.equal(q.take(1601).id,'vip');assert.equal(presentationDuration({coins:9999}),13000);
});
test('repeated ordinary action is coalesced; queue admission does not mutate reward events',()=>{
 const q=new PresentationQueue(),e={id:'one',user:'a',effect:'qi',reward:{qi:10}},before=JSON.stringify(e);
 q.push(e,1000);q.push({...e,id:'two'},1001);assert.equal(q.items.length,1);assert.equal(q.take(1002).id,'two');assert.equal(JSON.stringify(e),before);
 q.push({id:'expired',user:'a',effect:'qi'},1000);assert.equal(q.take(22000),undefined);
});
test('solo presentation locks the camera to the actor, queues other heavy effects and ends at a fixed time',()=>{
 const s=Object.create(Scene.prototype);Object.assign(s,{effects:[],motion:true,budget:{level:'light',config:{effects:2}}});
 s.addEffect({id:'a',user:'a',effect:'dragon',coins:9999,count:1});
 assert.equal(s.presentation.id,'a');assert.equal(s.effects.length,1);
 s.focus('b',1000);assert.equal(s.focusId,'a');
 s.addEffect({id:'b',user:'b',effect:'breakthrough'});assert.equal(s.effects.length,1);assert.equal(s.luxuryQueue.length,1);
});
test('seat cap can shrink without leaving the old crowd on screen',()=>{
 const d=new StageDirector(24),people=Array.from({length:500},(_,i)=>({id:String(i),realm:0,giftCoins:0}));
 assert.equal(d.update(people,[],0).length,24);d.seats=8;
 assert.equal(d.update(people,[],100,new Set(['499'])).length,8);assert.ok(d.order.includes('499'));
});
