import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,adminGift} from '../engine.mjs';
import {presentationPriority,presentationDuration} from '../public/presentation.js';
const N=Date.UTC(2026,10,11,4);
function world(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,ceremony:false,quiz:false,envelope:false});w.nextBossAt=N+1e9;return w;}
test('rèn thành carries a Báo Hỷ payload; luyện đan does not',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);const p=w.players.a;p.stones=99999;p.herbs=9999;p.realm=6;
 action(w,{type:'chat',userId:'a',name:'An',text:'7'},N+20000);
 const e=w.events.findLast(x=>x.user==='a'&&/^Rèn thành/.test(x.text));assert.ok(e,'crafted');assert.equal(e.achieve.kind,'craft');assert.ok(e.achieve.item);
 action(w,{type:'chat',userId:'a',name:'An',text:'4'},N+40000);
 const b=w.events.findLast(x=>x.user==='a'&&/^Luyện thành/.test(x.text));if(b)assert.equal(b.achieve,undefined);
});
test('Tông Chủ ban thưởng carries kind admin with reward parts',()=>{
 const w=world();action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},N);
 assert.equal(adminGift(w,'a','large',N+1000).ok,true);
 const e=w.events.findLast(x=>x.user==='a'&&x.adminGift);assert.equal(e.achieve.kind,'admin');assert.ok(e.achieve.parts.length>0);
});
test('Báo Hỷ outranks small chatter and lasts long enough to read',()=>{
 const e={achieve:{kind:'craft',item:'X'},effect:'lotus'};
 assert.equal(presentationPriority(e),3);assert.equal(presentationDuration(e),4200);
 assert.equal(presentationPriority({effect:'lotus'}),1);
});
