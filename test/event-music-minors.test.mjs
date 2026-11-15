import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,startTournament,startBonk,controlPetEvent,startFlowerEvent,engageNow,snapshot} from '../engine.mjs';
import {startTower} from '../tower.mjs';
import {startMiniEvent,miniCommand,miniView} from '../mini-events.mjs';
import {musicForState,applyMusicCommand,MOOD_POOLS,EVENT_ROTATE_MS,BGM_LIST} from '../public/music-rotation.js';
import {stageConflict} from '../stage-lock.mjs';
const N=1800000000000;
function setup(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});w.nextBossAt=N+1e9;ensurePlayer(w,'a','An',N);return w;}
test('one major stage, minor games overlay it, and mini rewards cannot be claimed twice after reload',()=>{
 let w=setup();assert.ok(startTournament(w,N).ok);assert.ok(startBonk(w,N+1).ok);
 assert.equal(controlPetEvent(w,'start',N+1).ok,false);assert.equal(startFlowerEvent(w,N+1,1).ok,false);
 assert.ok(engageNow(w,'lucky',N+2).ok);assert.equal(engageNow(w,'quiz',N+3).ok,false);
 assert.equal(stageConflict(w,N+4),'tỷ thí');
 const before=w.players.a.stones;assert.ok(action(w,{type:'chat',userId:'a',text:'lộc 2'},N+5).ok);assert.ok(w.players.a.stones>before);
 const after=w.players.a.stones;w=JSON.parse(JSON.stringify(w));action(w,{type:'chat',userId:'a',text:'lộc 1'},N+6);assert.equal(w.players.a.stones,after);
 const view=snapshot(w,N+6);assert.equal(view.miniEvent,undefined);assert.equal(view.engagement.mini.seed,undefined);assert.equal(view.engagement.mini.count,1);
});
test('pet event, tower, and honor stage reserve the main stage in both directions',()=>{
 for(const kind of ['pet','tower','honor']){const w=setup();if(kind==='pet')assert.ok(controlPetEvent(w,'start',N).ok);if(kind==='tower')assert.ok(startTower(w,N,{emit(){}}).ok);if(kind==='honor')w.honorStageUntil=N+30000;
 assert.ok(stageConflict(w,N+1));assert.equal(startTournament(w,N+1).ok,false);assert.ok(startBonk(w,N+2).ok);assert.ok(engageNow(w,'envelope',N+3).ok);}
});
test('three free minor games validate input, cap stars, hide seed and persist claims',()=>{
 for(const type of ['rps','lucky','star']){const w=setup();const c={emit(){},gain(w,p,q,s,h){p.stones+=s;return q;}};assert.ok(startMiniEvent(w,type,N,c).ok);
 const cmd=type==='rps'?['vui','bua']:type==='lucky'?['loc','3']:['bat','sao'];assert.ok(miniCommand(w,w.players.a,...cmd,N+1,c).ok);
 assert.equal(miniCommand(w,w.players.a,...cmd,N+2,c).duplicate,true);assert.equal(miniView(w,N+3).seed,undefined);
 if(type==='star'){for(let i=0;i<11;i++)assert.ok(miniCommand(w,{id:'p'+i,stones:0},'bat','sao',N+4,c).ok);assert.equal(miniCommand(w,{id:'last',stones:0},'bat','sao',N+5,c).ok,false);}}
});
test('each event plays music of its own mood, rotates every 3 minutes, and overrides a fixed pick',()=>{
 const T0=Math.floor(N/EVENT_ROTATE_MS)*EVENT_ROTATE_MS;
 const base={serverNow:T0+1000,settings:{},environment:{id:'jade-garden'}};
 const duel={...base,socialScene:'tournament',socialStatus:{tournament:{id:'d1',phase:'running'}}};
 const a=musicForState(duel);assert.equal(a.mood,'duel');assert.ok(MOOD_POOLS.duel.includes(a.index));
 assert.deepEqual(musicForState({...duel,serverNow:T0+90000,engagement:{mini:{type:'star'}}}),a,'stable within the 3-minute slot');
 const later=[1,2,3].map(k=>musicForState({...duel,serverNow:T0+1000+k*EVENT_ROTATE_MS}).index);assert.ok(later.some(i=>i!==a.index),'rotates to other songs');
 assert.ok(later.every(i=>MOOD_POOLS.duel.includes(i)));
 const bond=musicForState({...base,socialScene:'bond',socialStatus:{ceremony:{id:'b1'}}});assert.equal(bond.mood,'bond');assert.ok(MOOD_POOLS.bond.includes(bond.index));
 const war=musicForState({...base,sectWar:{active:true,id:'w1'}});assert.equal(war.mood,'war');assert.ok(MOOD_POOLS.war.includes(war.index));
 const boss=musicForState({...base,boss:{id:'b',hp:10}});assert.equal(boss.mood,'battle');assert.ok(MOOD_POOLS.battle.includes(boss.index));
 assert.equal(musicForState({...duel,settings:{music:applyMusicCommand(null,'12',N)}}).mood,'duel','event overrides fixed pick');
 assert.equal(musicForState({...base,settings:{music:applyMusicCommand(null,'12',N)}}).index,12,'fixed pick still holds outside events');
 for(const p of Object.values(MOOD_POOLS))for(const i of p)assert.ok(BGM_LIST[i]);
});
