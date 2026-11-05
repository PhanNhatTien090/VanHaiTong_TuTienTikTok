import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,openBoss,action,tick,residentStrike} from '../engine.mjs';
const now=1000000;
test('boss tracks actual damage, champion is not the last hitter, loot survives save without duplicates',()=>{
 const w=createWorld();w.settings.residents=false;
 const a=ensurePlayer(w,'a','A',now),b=ensurePlayer(w,'b','B',now);a.realm=8;
 openBoss(w,now);w.boss.hp=70;
 action(w,{type:'attack',userId:'a'},now);action(w,{type:'attack',userId:'b'},now); // 64 + 6
 assert.equal(w.boss,null);assert.equal(w.lastBossResult.winnerId,'a');assert.equal(w.lastBossResult.damage,64);
 assert.ok(a.artifacts.includes('tiger-bell'));assert.ok(!b.artifacts.includes('tiger-bell'));
 const stones=a.stones;assert.equal(action(w,{type:'attack',userId:'a'},now+4000).ok,false);assert.equal(a.stones,stones);
 const restored=JSON.parse(JSON.stringify(w));assert.equal(restored.lastBossResult.winnerId,'a');
});
test('NPC finishing hit preserves human champion; timeout grants no championship',()=>{
 const w=createWorld(),p=ensurePlayer(w,'a','A',now);openBoss(w,now);
 action(w,{type:'attack',userId:'a'},now);w.boss.hp=1;residentStrike(w,now+5000,()=>0);
 assert.equal(w.lastBossResult.winnerId,'a');assert.equal(p.artifacts.filter(x=>x==='tiger-bell').length,1);
 openBoss(w,now+10000);w.settings.residents=false;const wins=p.bossWins;
 tick(w,now+131000);assert.equal(w.boss,null);assert.equal(p.bossWins,wins);
});
