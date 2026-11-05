import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,readyToBreak} from '../engine.mjs';
test('100 attributed hearts and two successful cultivations unlock Luyen Khi without automatic promotion',()=>{
 const w=createWorld('live'),n=Date.now();action(w,{type:'join',userId:'a',name:'A'},n);
 const p=w.players.a;
 action(w,{type:'like',userId:'a',count:100},n+1);
 action(w,{type:'cultivate',userId:'a'},n+2);
 assert.equal(action(w,{type:'cultivate',userId:'a'},n+3).ok,false);
 assert.equal(p.novicePractice.cultivations,1);
 action(w,{type:'cultivate',userId:'a'},n+10003);
 assert.equal(readyToBreak(p),true);assert.equal(p.realm,0);
 action(w,{type:'breakthrough',userId:'a'},n+10004);
 action(w,{type:'like',userId:'a',count:1},n+10005);
 assert.deepEqual(p.novicePractice,{realm:1,likes:1,cultivations:0});
});
