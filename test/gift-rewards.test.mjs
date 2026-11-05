import {test} from 'node:test';import assert from 'node:assert/strict';
import {giftReward} from '../public/gift-rewards.js';import {createWorld,action} from '../engine.mjs';
test('prices above 30 scale resources and high gifts unlock progressively stronger gear',()=>{
 assert.ok(giftReward(99).qi>giftReward(30).qi);assert.ok(giftReward(100).qi>giftReward(99).qi);
 assert.ok(giftReward(25999).qi>giftReward(9999).qi);assert.equal(giftReward(999).tier.artifact,'vip-storm-sword');
 for(const [coins,id]of [[30,'jade'],[99,'spirit-vase'],[199,'soul-bell'],[499,'cosmic-cauldron'],[999,'vip-storm-sword'],[2999,'vip-dragon-orb'],[9999,'vip-heaven-seal']]){
  const w=createWorld();action(w,{type:'gift',userId:'a',coins,eventId:'g'},1000000);const p=w.players.a;
  assert.ok(p.artifacts.includes(id));if(coins>=999)assert.equal(p.equipped,id,'patron award must not replace stronger VIP gear');
  assert.equal(p.giftHistory[0].reward.qi,giftReward(coins).qi);
  const before=p.qi;action(w,{type:'gift',userId:'a',coins,eventId:'g'},1000001);assert.equal(p.qi,before);
 }
});
test('large gifts repeat currency, not permanent equipment; small combo cannot claim a high per-item artifact',()=>{
 const w=createWorld();action(w,{type:'gift',userId:'a',coins:999,count:3,eventId:'one'},1000000);
 assert.equal(w.players.a.artifacts.filter(id=>id==='vip-storm-sword').length,1);
 assert.equal(w.players.a.giftHistory[0].reward.qi,30000);
 action(w,{type:'gift',userId:'b',coins:1,count:999,eventId:'two'},1000001);
 assert.ok(!w.players.b.artifacts.includes('vip-storm-sword'));
});
