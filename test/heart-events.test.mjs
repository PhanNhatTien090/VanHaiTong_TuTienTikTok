import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,startFlowerEvent,startRace,startBondFestival,openBoss,tick,snapshot} from '../engine.mjs';
import {heartHUD} from '../public/heart-hud.js';
import {announcement} from '../speech.mjs';
const N=1800000000000;
function world(){const w=createWorld('live');Object.assign(w.settings,{engagementRewards:true,residents:false,autoEvents:false,blessingMinutes:0,ceremony:false});w.nextBossAt=N+1e9;w.likeGoal={count:0,target:1e9,level:0};return w;}
const like=(w,id,count,now=N+1000)=>action(w,{type:'like',userId:id,name:id,count},now);

test('DEMO batches count during XP cooldown and toward the legacy daily heart task',()=>{
 const w=world();w.mode='demo';like(w,'a',10);const qi=w.players.a.qi;
 const result=like(w,'a',40,N+1001);assert.equal(result.ok,true);assert.ok(result.xpCooldown>0);
 assert.equal(w.players.a.qi,qi);assert.equal(w.likeGoal.count,50);assert.equal(w.players.a.tasks.like,50);
 const before=JSON.stringify(w);for(const count of [-1,0,NaN,Infinity,1.5])assert.equal(like(w,'bad',count).ok,false);
 assert.equal(JSON.stringify(w),before,'invalid likes have no side effects');
});
test('flower heart milestones accumulate, pay once across save/load, latecomers receive bloom once',()=>{
 let w=world();startFlowerEvent(w,N,2);like(w,'a',49);assert.equal(w.events.filter(e=>e.heartMilestone).length,0);
 like(w,'a',1,N+1001);assert.equal(w.events.findLast(e=>e.heartMilestone).heartMilestone,50);
 w=JSON.parse(JSON.stringify(w));like(w,'a',250,N+1002);
 assert.equal(w.flowerEvent.heartClaims.a,3);assert.equal(w.flowerEvent.heartBloom,true);
 assert.equal(w.events.filter(e=>e.heartMilestone).length,2,'one announcement per batch');
 like(w,'a',10,N+1003);assert.equal(w.events.filter(e=>e.heartMilestone).length,2);
 const late=ensurePlayer(w,'late','Late',N+1100),stones=late.stones;
 like(w,'late',1,N+1100);assert.equal(late.stones,stones+15);
 like(w,'late',1,N+1101);assert.equal(late.stones,stones+15);
 const before=JSON.stringify(w.flowerEvent.heartScores);like(w,'late',10,w.flowerEvent.endsAt);assert.equal(JSON.stringify(w.flowerEvent.heartScores),before);
});
test('pure heart top is independent of gifts and final prizes never replay',()=>{
 let w=world();startFlowerEvent(w,N,2,'meteor');like(w,'a',100);like(w,'b',150);like(w,'c',50);
 action(w,{type:'gift',userId:'gift',coins:100,count:1,eventId:'gift'},N+2000);
 assert.equal(w.flowerEvent.heartScores.gift,undefined);
 tick(w,N+120001);assert.deepEqual(w.flowerEvent.heartResults.map(r=>r.id),['b','a','c']);
 assert.equal(w.events.filter(e=>e.heartRank).length,3);assert.match(announcement(w.events.find(e=>e.heartRank)),/hộ pháp tim/);
 w=JSON.parse(JSON.stringify(w));const before=w.players.b.totalQi;tick(w,N+120002);assert.equal(w.players.b.totalQi,before);
});
test('unusual user IDs cannot pollute heart score or milestone maps',()=>{
 const w=world();startFlowerEvent(w,N,2);like(w,'__proto__',50);
 assert.equal(Object.hasOwn(w.flowerEvent.heartScores,'__proto__'),true);assert.equal(w.flowerEvent.heartScores.__proto__,50);
 assert.equal(w.flowerEvent.heartClaims.__proto__,1);assert.equal({}.qi,undefined);
});
test('boss hearts trigger real bounded shared damage without claiming top damage',()=>{
 let w=world();ensurePlayer(w,'a','A',N);openBoss(w,N);const max=w.boss.maxHp;
 like(w,'a',99);assert.equal(w.boss.hp,max);assert.equal(w.boss.hearts.count,99);
 like(w,'a',1,N+1001);assert.equal(w.boss.hp,max-Math.floor(max*.05));assert.equal(w.boss.hearts.strikes,1);
 w=JSON.parse(JSON.stringify(w));like(w,'a',1000,N+1002);assert.equal(w.boss.hearts.strikes,6);
 assert.equal(w.boss.hp,max-6*Math.floor(max*.05));assert.equal(w.boss.damage.a,undefined);
 assert.equal(w.boss.participants.a,true);const hp=w.boss.hp;like(w,'a',1000,N+1003);assert.equal(w.boss.hp,hp);
 const hud=heartHUD(snapshot(w,N+1003));assert.equal(hud.context,'boss');assert.match(hud.html,/Đủ 6 trận/);
});
test('heart killing blow settles boss and rewards prior heart participants once',()=>{
 const w=world();ensurePlayer(w,'a','A',N);openBoss(w,N);w.boss.hp=1;
 const stones=w.players.a.stones;like(w,'a',100);assert.equal(w.boss,null);assert.equal(w.players.a.stones,stones+25);
 like(w,'a',100,N+1001);assert.equal(w.players.a.stones,stones+25);
});
test('race hearts accumulate 50 per boost with unlimited independent allowance and stop at expiry',()=>{
 let w=world();for(const id of ['a','b'])ensurePlayer(w,id,id,N);startRace(w,N);
 for(const id of ['a','b'])action(w,{type:'chat',userId:id,text:'bay'},N+1);tick(w,N+45000);
 like(w,'a',49,N+45001);assert.equal(w.race.racers[0].bonus,0);
 like(w,'a',1,N+45002);assert.equal(w.race.racers[0].bonus,18);
 w=JSON.parse(JSON.stringify(w));like(w,'a',1000,N+45003);let r=w.race.racers[0];assert.equal(r.heartBoosts,21);assert.equal(r.bonus,378);
 action(w,{type:'chat',userId:'a',text:'danh'},N+45004);assert.equal(r.boosts,1);assert.equal(r.bonus,396);
 action(w,{type:'gift',userId:'a',coins:10,eventId:'race-gift'},N+45005);assert.equal(r.giftDist,300,'10 coin = 300 trượng');assert.equal(r.bonus,696);
 const before=r.bonus;like(w,'a',1000,N+45006);assert.equal(r.bonus,before+360);
 like(w,'b',50,w.race.endsAt);assert.equal(w.race.racers[1].bonus,0);
 assert.equal(heartHUD(snapshot(w,N+45007)).context,'race');
});
test('festival uses number of hearts including cooldown packets, keeps final reward once',()=>{
 let w=world();startBondFestival(w,N);like(w,'a',299);assert.equal(w.bondFestival.blessings,299);
 like(w,'a',1,N+1001);assert.equal(w.bondFestival.blessings,300);assert.equal(w.events.findLast(e=>e.heartLamp).heartLamp,1);
 w=JSON.parse(JSON.stringify(w));like(w,'a',600,N+1002);assert.equal(w.bondFestival.blessings,900);
 assert.equal(w.events.filter(e=>e.heartLamp).length,2);like(w,'a',100,N+1003);assert.equal(w.events.filter(e=>e.heartLamp).length,2);
 assert.equal(heartHUD(snapshot(w,N+1003)).context,'festival');
});
test('multiple global milestones in one batch settle now and retain excess hearts',()=>{
 const w=world();w.likeGoal={count:900,target:1000,level:0};like(w,'a',3000);
 assert.equal(w.likeGoal.level,3);assert.equal(w.likeGoal.target,1700);assert.equal(w.likeGoal.count,300);
 assert.equal(w.events.findLast(e=>e.likeGoal).heartRounds,3);
});
test('heart HUD escapes contributor names and separates total score from pure hearts',()=>{
 const w=world();startFlowerEvent(w,N,2);like(w,'a',50);w.players.a.name='<img src=x>';
 const h=heartHUD(snapshot(w,N+1001));assert.equal(h.context,'flower');assert.match(h.html,/TOP TIM RIÊNG/);
 assert.ok(!h.html.includes('<img'));assert.ok(h.html.includes('&lt;img'));
});
