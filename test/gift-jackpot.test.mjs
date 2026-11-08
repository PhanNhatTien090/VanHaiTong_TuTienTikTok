import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,GIFT_JACKPOT,startWar} from '../engine.mjs';
import {VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
const cheap=Object.values(VISITOR_GIFT_REWARDS).filter(r=>r.skinCoins<=200).map(r=>r.skin);
function setup(){const w=createWorld('live');action(w,{type:'join',userId:'a',name:'An'},N);const p=w.players.a;p.qi=10000;return {w,p};}
test('quà 500 lúc không sự kiện: +50% tu vi hiện tại, 1 skin ≤200 chưa có, thêm linh thạch/linh thảo',()=>{
 const {w,p}=setup();p.rewardSkins=[cheap[0]];const stones=p.stones,herbs=p.herbs;
 assert.equal(action(w,{type:'gift',userId:'a',name:'An',coins:500,count:1,giftName:'Money Gun',eventId:'g1'},N+1000).ok,true);
 const ev=w.events.findLast(e=>e.jackpot);assert.ok(ev,'có sự kiện đại lễ');assert.equal(ev.jackpot.qi,5000);
 const got=p.rewardSkins.filter(s=>cheap.includes(s)&&s!==cheap[0]);assert.equal(got.length,1);assert.equal(p.skinChoice,got[0]);assert.equal(ev.jackpot.skinName.length>0,true);
 assert.ok(p.stones-stones>=GIFT_JACKPOT.stones&&p.herbs-herbs>=GIFT_JACKPOT.herbs);
 assert.ok(w.events.some(e=>e.effect==='transform'&&e.jackpotSkin));
 assert.match(speechPlan(ev).map(x=>x.text).join(' '),/Đại lễ|đại lễ/);
});
test('dưới 500, quà mô phỏng, hoặc đang có sự kiện thì không có đại lễ; hết skin thì vẫn được tu vi',()=>{
 let {w,p}=setup();action(w,{type:'gift',userId:'a',name:'An',coins:499,count:1,eventId:'g2'},N+1000);assert.ok(!w.events.some(e=>e.jackpot));
 action(w,{type:'gift',userId:'a',name:'An',coins:500,count:1,simulated:true,eventId:'g3'},N+2000);assert.ok(!w.events.some(e=>e.jackpot));
 ({w,p}=setup());startWar(w,N);action(w,{type:'gift',userId:'a',name:'An',coins:500,count:1,eventId:'g4'},N+1000);assert.ok(!w.events.some(e=>e.jackpot));
 ({w,p}=setup());p.rewardSkins=[...cheap];action(w,{type:'gift',userId:'a',name:'An',coins:100,count:5,eventId:'g5'},N+1000);const ev=w.events.findLast(e=>e.jackpot);assert.ok(ev&&ev.jackpot.qi>0&&!ev.jackpot.skinName);
});
