import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,snapshot} from '../engine.mjs';

const NOW=1800000000000;
test('large-room optimized LIVE snapshot includes only active guild-war actors for original sprite drawing',()=>{
 const world=createWorld('live');
 Object.assign(world.settings,{live2Enabled:true,live2GuildWarEnabled:true,
  live2BossTrialsEnabled:false,autoEvents:false,residents:false,bossInterval:999999});
 world.nextBossAt=NOW+99999999;
 const users=[
  {id:'a',name:'Leader A'},{id:'a2',name:'Member A'},
  {id:'b',name:'Leader B'},{id:'b2',name:'Member B'}];
 for(const u of users){const p=ensurePlayer(world,u.id,u.name,NOW);p.realm=5;p.lastActive=NOW;}
 const cmd=(u,text)=>action(world,{type:'chat',userId:u.id,name:u.name,text},NOW);
 assert.equal(cmd(users[0],'lập hội Alpha').ok,true);
 assert.equal(cmd(users[2],'lập hội Beta').ok,true);
 assert.equal(cmd(users[1],'vào hội '+world.players.a.live2.guildId).ok,true);
 assert.equal(cmd(users[3],'vào hội '+world.players.b.live2.guildId).ok,true);
 assert.equal(cmd(users[0],'hội chiến').ok,true);
 const snap=snapshot(world,NOW,{select:()=>new Set()});
 assert.equal(snap.live2GuildWar.active,true);
 assert.equal(snap.live2GuildWar.groups.length,2);
 assert.ok(snap.live2GuildWar.groups.every(g=>g.roster.length===2));
 assert.deepEqual(snap.players.map(p=>p.id).sort(),['a','a2','b','b2']);
 assert.equal(snap.live2World,undefined);
 assert.equal(snap.players[0].live2,undefined); // No private inventories/secrets in SSE.
});
test('missing guild-war opt-in yields no extra forced LIVE actors',()=>{
 const world=createWorld('live');world.settings.live2Enabled=false;
 const p=ensurePlayer(world,'a','A',NOW);p.realm=3;
 const snap=snapshot(world,NOW,{select:()=>new Set()});
 assert.deepEqual(snap.players,[]);
 assert.ok(!snap.live2GuildWar);
});
