import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,adminGift,requiredQi,readyToBreak} from '../engine.mjs';import {announcement} from '../speech.mjs';import {priority} from '../public/voice.js';
test('operator gift combos scale with realm, buff, can make a player ready, and are announced with top priority',()=>{
 const w=createWorld('live');let now=1e12;action(w,{type:'chat',userId:'a',name:'Lâm',text:'nhapmon nam'},now);const p=w.players.a;p.realm=4;
 const need=requiredQi(p),r=adminGift(w,'a','medium',now+=1000);assert.ok(r.ok);assert.equal(r.qi,Math.round(need*.3));assert.equal(p.buffMult,3);
 const e=w.events.findLast(e=>e.adminGift);assert.equal(priority(e),3);assert.match(announcement({...e,gender:'nam'}),/sư huynh Lâm/);
 p.qi=0;assert.ok(adminGift(w,'a','breakthrough',now+=1000).ok);assert.ok(readyToBreak(p));
 assert.ok(adminGift(w,'*','small',now+=1000).ok,'random active player');
 assert.equal(adminGift(w,'ghost','small',now).ok,false);assert.equal(adminGift(w,'a','nope',now).ok,false);
});
