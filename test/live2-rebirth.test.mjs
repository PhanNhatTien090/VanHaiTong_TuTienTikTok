import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rebirthCommand} from '../rebirth.mjs';
import {REBIRTH_UNLOCK_REALM} from '../public/progression.js';
const N=1_800_000_000_000;
test('rebirth keeps all LIVE 2.0 Dao insight, refined relics, guild membership, mentor and bonded state',()=>{
 const p={id:'a',name:'Linh Kiếm',realm:REBIRTH_UNLOCK_REALM,qi:1200,totalQi:100000,
  artifacts:['jade'],equipped:'jade',stones:500,herbs:70,
  live2:{v:1,path:'sword',insight:140,daily:{day:'2026-11-15',earned:12},
   refinements:{jade:3},guildId:'MON',masterId:'b',students:['c'],
   elixirs:{guard:2},bondSkillUntil:N+30000,heavenResonanceUntil:N+60000}};
 const w={players:{a:p},live2World:{guilds:{MON:{id:'MON',members:['a']}}}};
 const previous=structuredClone(p.live2),world=structuredClone(w.live2World);
 assert.equal(rebirthCommand(w,p,'',N).pending,true);
 assert.equal(rebirthCommand(w,p,'xac nhan',N+500).reborn,true);
 assert.equal(p.realm,0);assert.equal(p.qi,0);
 assert.deepEqual(p.live2,previous);
 assert.deepEqual(w.live2World,world);
 assert.equal(p.artifacts[0],'jade');
 assert.equal(p.totalQi,100000);
});
test('expired rebirth confirmation cannot alter selected Dao Path or artifacts',()=>{
 const p={id:'a',realm:REBIRTH_UNLOCK_REALM,qi:100,artifacts:['jade'],live2:{path:'beast',insight:40}};
 const w={players:{a:p}};
 rebirthCommand(w,p,'',N);
 assert.equal(rebirthCommand(w,p,'xac nhan',N+30000).ok,false);
 assert.equal(p.realm,REBIRTH_UNLOCK_REALM);
 assert.equal(p.live2.path,'beast');
});
