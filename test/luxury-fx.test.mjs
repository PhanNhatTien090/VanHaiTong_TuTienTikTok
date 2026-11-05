import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas} from '@napi-rs/canvas';
import {luxuryTier,queueLuxury,drawLuxuryFx} from '../public/luxury-fx.js';
test('VIP presentation levels use real credited coin value; queue is bounded and prioritises larger gifts',()=>{
 assert.equal(luxuryTier({coins:198}),null);assert.equal(luxuryTier({coins:999}).level,2);
 assert.equal(luxuryTier({coins:1,count:199}).level,1);
 const q=[];for(let i=0;i<12;i++)queueLuxury(q,{id:String(i),luxury:{value:i*100}});
 assert.equal(q.length,4);assert.equal(q[0].luxury.value,1100);queueLuxury(q,q[0]);assert.equal(q.length,4);
});
test('all spectacle tiers render in light mode with a fixed small draw-call budget',()=>{
 const c=createCanvas(540,960).getContext('2d');let calls=0;const begin=c.beginPath.bind(c);c.beginPath=()=>{calls++;begin();};
 for(const coins of [199,999,2999,9999])for(const k of [.01,.3,.6,.99]){calls=0;drawLuxuryFx(c,{luxury:luxuryTier({coins})},2000,k,{x:450,y:1000,scale:1.6},1600,'light');assert.ok(calls<50);}
});
