import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,puppetControl,currentParticipant,tick} from '../engine.mjs';
test('operator puppets: create with realm, act through the real pipeline, stay present, never touch real viewers',()=>{
 const w=createWorld('demo');const now=1e7;const c=puppetControl(w,{op:'create',name:'Lâm Phong',gender:'nu',realm:4},now);assert.ok(c.ok);
 const p=w.players[c.id];assert.equal(p.puppet,true);assert.equal(p.realm,4);assert.equal(p.gender,'nu');
 assert.ok(puppetControl(w,{op:'act',id:c.id,type:'gift',coins:199,count:2,giftName:'Rose'},now+1000).ok);assert.equal(p.giftCoins,398);assert.ok(w.events.some(e=>e.user===c.id&&e.gift));
 assert.ok(puppetControl(w,{op:'act',id:c.id,type:'chat',text:'tuluyen'},now+2000).ok);
 assert.ok(puppetControl(w,{op:'act',id:c.id,type:'like',count:50},now+3000).ok);
 tick(w,now+3600000);assert.equal(currentParticipant(w,p,now+3600000),true,'kept on stage');
 puppetControl(w,{op:'keep',id:c.id,keep:false},now+3600001);assert.equal(currentParticipant(w,p,now+3600002),false);
 assert.equal(puppetControl(w,{op:'act',id:'someone-real',type:'gift',coins:1},now).ok,false);
 assert.equal(puppetControl(w,{op:'act',id:c.id,type:'admin'},now).ok,false);
 assert.equal(puppetControl(w,{op:'list'},now).puppets.length,1);
});
