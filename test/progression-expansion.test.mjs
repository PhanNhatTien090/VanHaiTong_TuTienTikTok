import {test} from 'node:test';
import assert from 'node:assert/strict';
import {REALMS,createWorld,ensurePlayer,requiredQi,requiredStones,action,blessing,snapshot} from '../engine.mjs';
import {OPPORTUNITY_COSTS} from '../public/opportunity.js';
import {ascensionProfile} from '../public/ascension-art.js';
import {realmDivineLook,divineHaloProfile} from '../public/divine-wardrobe.js';
const NOW=1800000000000;
test('five new realms are reachable after save/reload with matching overlay, wardrobe and event costs',()=>{
 let w=createWorld(),p=ensurePlayer(w,'veteran','Lão tổ',NOW);
 Object.assign(p,{realm:13,giftCoins:100,totalQi:123456,qi:17,stones:19});
 w=JSON.parse(JSON.stringify(w));p=w.players.veteran;
 for(let r=14;r<REALMS.length;r++){
  p.qi=requiredQi(p);p.stones=requiredStones(p);
  assert.equal(action(w,{type:'breakthrough',userId:p.id},NOW+r*60000).ok,true);
  assert.equal(p.realm,r);assert.equal(p.qi,0);assert.equal(p.stones,0);
  assert.equal(snapshot(w,NOW+r*60000).players[0].realmName,REALMS[r]);
  assert.ok(realmDivineLook(p).color);assert.equal(ascensionProfile(r).realm,r);
  assert.ok(divineHaloProfile(r).orbs<=12);
 }
 assert.equal(REALMS.length,25);assert.equal(OPPORTUNITY_COSTS.length,24);
 assert.equal(action(w,{type:'breakthrough',userId:p.id},NOW+2e6).ok,false);
});
test('slower costs preserve onboarding, and blessings cannot recycle stored qi into free levels',()=>{
 assert.equal(requiredQi({realm:0}),150);assert.equal(requiredQi({realm:1}),360);
 for(const [r,mult] of [[2,1.5],[5,2],[8,3],[13,4],[17,4]]){
  const base=r<=8?150*2.4**r:150*2.4**8*1.8**(r-8);
  assert.equal(requiredQi({realm:r}),Math.round(base*mult));
 }
 const w=createWorld(),p=ensurePlayer(w,'a','A',NOW);p.realm=8;p.giftCoins=100;
 p.qi=requiredQi(p);p.stones=requiredStones(p);
 assert.equal(blessing(w,NOW,1).ok,true);assert.equal(p.qi,0);assert.equal(p.stones,0);
 assert.equal(blessing(w,NOW+1,1).ok,false);assert.equal(p.realm,9);
 p.realm=13;p.giftCoins=99;p.qi=requiredQi(p);p.stones=requiredStones(p);
 assert.equal(action(w,{type:'breakthrough',userId:p.id},NOW+2).ok,false);
});
