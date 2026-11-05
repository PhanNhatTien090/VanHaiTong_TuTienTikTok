import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action} from '../engine.mjs';import {announcement} from '../speech.mjs';import {priority} from '../public/voice.js';
test('newcomers get one cultivation instruction instead of a three-command checklist',()=>{
 const w=createWorld('live');let now=Date.parse('2026-11-01T03:00:00Z');const chat=(t,dt=15000)=>action(w,{type:'chat',userId:'n',name:'Nhi',text:t},now+=dt);
 chat('nhapmon nu',0);const join=w.events.at(-1);assert.match(announcement({...join,gender:'nu'}),/thả tim|tu luyện/i);assert.equal(priority(join),3);
 chat('hello',25000);const g=w.events.filter(e=>e.guide);assert.equal(g.at(-1)?.guide,'cultivate');assert.equal(priority(g.at(-1)),3);
 chat('tuluyen');chat('hello');chat('hello');assert.equal(w.events.filter(e=>e.guide).length,1);
 assert.equal(w.events.filter(e=>e.introSpark).length,1);
});
test('veterans and residents are not guided',()=>{const w=createWorld('live');let now=1e12;action(w,{type:'chat',userId:'v',name:'V',text:'nhapmon'},now);w.players.v.realm=3;
 action(w,{type:'chat',userId:'v',name:'V',text:'hello'},now+30000);assert.equal(w.events.filter(e=>e.guide).length,0);});
