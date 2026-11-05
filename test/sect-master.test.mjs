import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createCanvas} from '@napi-rs/canvas';
import {createSectMaster,normalizeHost} from '../sect-master.mjs';
import {sectHallTargets,drawSectMaster,sectElders,seatSectElders} from '../public/sect-hall.js';

test('two highest active real viewers sit beside the host, tie by total cultivation, without duplicates',()=>{
 const players=[{id:'off',realm:18,totalQi:999,active:false},{id:'npc',realm:18,active:true,resident:true},{id:'fake',realm:18,active:true,puppet:true},{id:'host',realm:18,active:true},{id:'a',realm:5,totalQi:100,active:true},{id:'b',realm:5,totalQi:200,active:true},{id:'c',realm:4,totalQi:10000,active:true}];
 const before=JSON.stringify(players),elders=sectElders(players,'host');assert.deepEqual(elders.map(p=>p.id),['b','a']);
 const targets=seatSectElders(sectHallTargets(players.filter(p=>p.active),1600),elders,1600);assert.equal(targets.filter(p=>p.id==='a').length,1);assert.equal(targets.filter(p=>p.id==='b').length,1);assert.deepEqual(targets.filter(p=>p.sectElder).map(p=>p.x),[260,640]);assert.ok(targets.filter(p=>p.sectElder).every(p=>p.y<1600*.45));
 players.find(p=>p.id==='b').active=false;assert.deepEqual(sectElders(players,'host').map(p=>p.id),['a','c']);players.find(p=>p.id==='b').active=true;assert.equal(JSON.stringify(players),before);
 assert.equal(sectElders([]).length,0);assert.equal(sectElders([{id:'one',active:true}]).length,1);
});

test('sect master only follows the configured handle; never display-name lookalikes or other events',()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'vh-master-'));try{
  const m=createSectMaster(dir);assert.equal(m.observe({event:'chat',data:{uniqueId:'host',comment:'a'}},1000),false);
  m.configure({username:'https://www.tiktok.com/@Host',enabled:true});assert.equal(normalizeHost('@HOST'),'host');
  const impostor={event:'chat',data:{userId:'bad',uniqueId:'other',nickname:'Host',comment:'Mạo danh'}};assert.equal(m.observe(impostor,1000),false);
  const gift={event:'gift',data:{uniqueId:'host',comment:'a'}};assert.equal(m.observe(gift,1000),false);
  const event={event:'chat',data:{user:{userId:'good',uniqueId:'HOST',nickname:'Tông chủ'},comment:'Chào đồng môn'}},before=JSON.stringify(event);
  assert.equal(m.observe(event,1000),true);assert.equal(m.view(1001).active,true);assert.equal(m.view(1001).userId,'good');assert.equal(m.view(23001).active,false);assert.equal(JSON.stringify(event),before);
  assert.equal(createSectMaster(dir).view().username,'host');m.configure({username:'host',enabled:false});assert.equal(m.observe(event,1000),false);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('rectangular hall seats fit 1–60 characters below the empty throne and do not modify profiles',()=>{
 for(const n of [1,4,12,24,32,48,60]){const p=Array.from({length:n},(_,i)=>({id:String(i)})),before=JSON.stringify(p),t=sectHallTargets(p,1600);assert.equal(t.length,n);for(const a of t){assert.ok(a.y-a.scale*95>1600*.38);assert.ok(a.y+40*a.scale<1600*.85);assert.ok(a.x-a.scale*60>0&&a.x+a.scale*60<900);}assert.equal(JSON.stringify(p),before);}
});
test('throne stays occupied at idle; owner speech expires without removing the master',()=>{
 const c=createCanvas(900,1600).getContext('2d'),scene={height:1600,environment:{layout:'sect'},stateServerNow:1000,stateReceivedAt:0,sectMaster:{active:true,text:'Chào các đạo hữu',at:1000,until:23000},motion:true,drawCharacterBody(){this.draws=(this.draws||0)+1;}};
 assert.equal(drawSectMaster(scene,c,100),true);assert.equal(scene.draws,1);assert.equal(scene.compact,undefined);
 scene.presentation={until:2000};assert.equal(drawSectMaster(scene,c,100),false);scene.presentation=null;
 assert.equal(drawSectMaster(scene,c,24000),true);scene.sectMaster.active=false;assert.equal(drawSectMaster(scene,c,25000),true);scene.sectMaster.enabled=false;assert.equal(drawSectMaster(scene,c,25000),false);scene.environment={layout:'float'};assert.equal(drawSectMaster(scene,c,100),false);
});
