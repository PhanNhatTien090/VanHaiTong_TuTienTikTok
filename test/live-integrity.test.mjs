import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,puppetControl,tick,openBoss,controlPetEvent,startFlowerEvent,startBondFestival,snapshot} from '../engine.mjs';
import {streamState,participantCounts,eventAllowedOnLive,liveRulesActive} from '../public/live-integrity.js';
import {heartHUD} from '../public/heart-hud.js';
import {honorRoll} from '../public/honors.js';
const now=Date.now();
test('LIVE rejects simulations before identity creation or reward side effects',()=>{
 const w=createWorld('live'),before=JSON.stringify(w);
 for(const type of ['gift','like','follow','share','chat']){
  assert.equal(action(w,{type,userId:'test',name:'Demo',coins:1,count:1,text:'tuluyen',simulated:true},now).ok,false);
  assert.equal(JSON.stringify(w),before);
 }
 assert.equal(puppetControl(w,{op:'create',name:'Test'},now).ok,false);
 assert.equal(Object.keys(w.players).length,0);
});
test('legacy LIVE settings cannot enable NPC gifts; DEMO simulation is preserved',()=>{
 const w=createWorld('demo'),r=puppetControl(w,{op:'create',name:'NPC'},now),p=w.players[r.id];
 assert.equal(puppetControl(w,{op:'act',id:p.id,type:'gift',coins:1,count:1},now+1).ok,true);
 w.mode='live';w.settings.puppetAutoRose=true;w.settings.autoEvents=false;w.settings.blessingMinutes=0;w.nextBossAt=now+1e9;p.puppetRoseAt=now+2;
 const gifts=w.totalGifts,coins=p.giftCoins;
 for(const type of ['gift','gift ','like','follow','share'])assert.equal(action(w,{type,userId:p.id,coins:1,count:1},now+3).ok,false);
 assert.equal(puppetControl(w,{op:'auto-rose',id:p.id,enabled:true},now+3).ok,false);
 tick(w,now+4);assert.equal(w.totalGifts,gifts);assert.equal(p.giftCoins,coins);
 assert.equal(puppetControl(w,{op:'keep',id:p.id,keep:false},now+5).ok,true);
});
test('LIVE removes historical simulated gifts from presentation without deleting history',()=>{
 const players=[{id:'npc',name:'Linh',puppet:true,active:true},{id:'real',name:'An',active:true}];
 const state={mode:'live',players,events:[{id:'a',user:'real',gift:'Rose'},{id:'b',user:'npc',gift:'Rose'},{id:'c',user:'real',simulated:true},{id:'d',user:'npc',effect:'qi',name:'Linh'}],feed:[]};
 const clean=streamState(state);
 assert.deepEqual(clean.events.map(e=>e.id),['a','d']);assert.equal(clean.events[1].name,'Linh');
 assert.equal(state.events.length,4);assert.equal(state.events[3].name,'Linh');
 assert.equal(streamState(state,'demo'),state);
 assert.deepEqual(participantCounts(players),{players:1,npcs:1});
 assert.equal(eventAllowedOnLive({gift:'Rose',actorKind:'npc'}),false);
});
test('honors never promote a simulated donor over a real player',()=>{
 const real={id:'real',name:'An',realm:4,giftCoins:1,totalQi:100,joinedAt:1};
 const npc={...real,id:'npc',name:'NPC',puppet:true,giftCoins:1e6,realm:15};
 assert.ok(honorRoll({players:{real,npc}},[real,npc]).every(h=>h.id==='real'));
});
test('LIVE metrics and arbitrary chat do not award progress; gameplay quests finish once (strict mode heartPlay=false)',()=>{
 const w=createWorld('live');w.settings.residents=false;w.settings.heartPlay=false;
 action(w,{type:'join',userId:'a',name:'An'},now);const p=w.players.a,before=[p.qi,p.stones,p.herbs];
 for(const type of ['like','follow','share','chat'])action(w,{type,userId:'a',name:'An',count:5000,text:'hello'},now+1);
 assert.deepEqual([p.qi,p.stones,p.herbs],before);assert.equal(w.likeGoal,undefined);
 assert.equal(action(w,{type:'chat',userId:'a',text:'tuluyen'},now+1000).ok,true);
 assert.equal(p.tasks.cultivate,1,'outer chat must not double-count the command');
 assert.equal(action(w,{type:'chat',userId:'a',text:'hai'},now+2000).ok,true);
 openBoss(w,now+3000);for(let i=0;i<3;i++)assert.equal(action(w,{type:'attack',userId:'a'},now+4000+i*10000).ok,true);
 assert.equal(p.tasks.done,true);assert.equal(w.events.filter(e=>e.tasksDone).length,1);
 action(w,{type:'cultivate',userId:'a'},now+50000);assert.equal(w.events.filter(e=>e.tasksDone).length,1);
});
test('free event routes use successful gameplay and never require a simulated like',()=>{
 const worlds=[createWorld('live'),createWorld('live'),createWorld('live')];for(const x of worlds)x.settings.heartPlay=false; // chế độ nghiêm
 const [pet,flower,festival]=worlds;
 controlPetEvent(pet,'start',now);startFlowerEvent(flower,now,2);startBondFestival(festival,now);
 for(const w of worlds){
  action(w,{type:'join',userId:'a',name:'An'},now+1);
  action(w,{type:'like',userId:'a',count:5000},now+2);
 }
 assert.equal(pet.players.a.petProgress.hearts,5000);assert.equal(pet.players.a.spiritPet,'sun-phoenix');assert.equal(flower.flowerEvent.scores.a,undefined);assert.equal(festival.bondFestival.blessings,0);
 for(const w of worlds){
  assert.equal(action(w,{type:'cultivate',userId:'a'},now+1000).ok,true);
  assert.equal(action(w,{type:'cultivate',userId:'a'},now+1001).ok,false);
 }
 assert.equal(pet.players.a.spiritPet,'sun-phoenix');assert.equal(pet.players.a.petProgress.practice,undefined);
 assert.equal(snapshot(pet,now+2000).petEvent.practice,false);
 assert.equal(flower.flowerEvent.scores.a,5);assert.equal(festival.bondFestival.blessings,30);
 assert.equal(worlds.every(w=>!w.likeGoal),true);
});
test('a new frontend must not describe an old running backend as already using new rules',()=>{
 const old={mode:'live',settings:{},players:[],serverNow:now};
 assert.equal(liveRulesActive(old),false);assert.equal(heartHUD(old).context,'global');
 const updated={...old,liveIntegrityVersion:1};assert.equal(liveRulesActive(updated),true);assert.equal(heartHUD(updated).context,'voluntary');
 assert.equal(liveRulesActive({...updated,settings:{engagementRewards:true}}),false);
});
