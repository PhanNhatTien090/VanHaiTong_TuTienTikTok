import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,startTournament,startBonk,controlPetEvent,startFlowerEvent,engageNow,snapshot} from '../engine.mjs';
import {startTower} from '../tower.mjs';
import {startMiniEvent,miniCommand,miniView} from '../mini-events.mjs';
import {musicForState,applyMusicCommand} from '../public/music-rotation.js';
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
test('music follows event mood, stays stable through small games and honors a manual choice',()=>{
 const base={serverNow:N,settings:{},environment:{id:'jade-garden'}};
 const duel={...base,socialScene:'tournament',socialStatus:{tournament:{id:'d1',phase:'running'}}};
 const a=musicForState(duel);assert.equal(a.mood,'duel');assert.ok([8,9,10].includes(a.index));assert.deepEqual(musicForState({...duel,serverNow:N+90000,engagement:{mini:{type:'star'}}}),a);
 const bond=musicForState({...base,socialScene:'bond',socialStatus:{ceremony:{id:'b1'}}});assert.equal(bond.mood,'bond');assert.ok([2,6,12].includes(bond.index));
 assert.equal(musicForState({...duel,settings:{music:applyMusicCommand(null,'12',N)}}).index,12);
 assert.equal(musicForState({...duel,settings:{music:applyMusicCommand(null,'auto',N)}}).mood,'duel');
});
