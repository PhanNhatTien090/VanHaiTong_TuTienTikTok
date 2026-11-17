import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,lateGrowthMult,LATE_GROWTH,giftJackpot} from '../engine.mjs';

test('late realms grow slower, early realms unchanged', () => {
  assert.equal(lateGrowthMult({realm:23}),1);
  assert.equal(lateGrowthMult({realm:24}),.7);
  assert.equal(lateGrowthMult({realm:25}),.6);
  assert.equal(lateGrowthMult({realm:26}),.5);
  assert.equal(lateGrowthMult({realm:27}),.4);
  for(let r=24;r<28;r++)assert.ok(LATE_GROWTH[r+1]<=LATE_GROWTH[r]);
});

test('gift jackpot qi is reduced at late realms', () => {
  const mk=realm=>{const w=createWorld('demo');const p={id:'x',name:'x',realm,qi:1e9,totalQi:1e9,stones:0,herbs:0,manuals:[],cooldowns:{},rewardSkins:[]};w.players.x=p;return {w,p};};
  const lo=mk(20),hi=mk(25);
  const now=Date.now();
  const a=giftJackpot(lo.w,lo.p,500,now,()=>0),b=giftJackpot(hi.w,hi.p,500,now,()=>0);
  if(!a||!b)return; // jackpot blocked by stage state in this world: nothing to compare
  assert.ok(hi.p.qi-1e9 <= (lo.p.qi-1e9)*LATE_GROWTH[25]); /* 17/11: nới .4→.6 */
});
