import {test} from 'node:test';import assert from 'node:assert/strict';import {roseDelay,tickPuppetRoses} from '../puppet-auto-rose.mjs';import {createWorld,puppetControl,tick} from '../engine.mjs';
test('rose timers schedule three to five minutes per puppet, skip real players, pause absent and disabled actors',()=>{
 assert.equal(roseDelay(()=>0),180000);assert.equal(roseDelay(()=>1),300000);const w={players:{real:{id:'real'},a:{id:'a',puppet:true},b:{id:'b',puppet:true,puppetKeep:false},c:{id:'c',puppet:true,puppetAutoRose:false}}},sent=[];
 tickPuppetRoses(w,1000,e=>sent.push(e),()=>.5);assert.equal(w.players.a.puppetRoseAt,241000);tickPuppetRoses(w,240999,e=>sent.push(e));assert.equal(sent.length,0);tickPuppetRoses(w,241000,e=>sent.push(e),()=>0);assert.equal(sent.length,1);assert.equal(sent[0].coins,1);assert.equal(sent[0].count,1);assert.equal(sent[0].simulated,true);assert.equal(w.players.a.puppetRoseAt,421000);assert.equal(w.players.real.puppetRoseAt,undefined);
});
test('overdue puppets after restart send once, spread bursts eight seconds apart and never catch up missed hours',()=>{
 let w={players:Object.fromEntries(['a','b'].map(id=>[id,{id,puppet:true,puppetRoseAt:1}]))},sent=[];w=JSON.parse(JSON.stringify(w));tickPuppetRoses(w,1e8,e=>sent.push(e),()=>.5);tickPuppetRoses(w,1e8+1,e=>sent.push(e),()=>.5);assert.equal(sent.length,1);tickPuppetRoses(w,1e8+8000,e=>sent.push(e),()=>.5);assert.equal(sent.length,2);assert.notEqual(sent[0].eventId,sent[1].eventId);tickPuppetRoses(w,1e8+16000,e=>sent.push(e));assert.equal(sent.length,2);
});
test('automatic rose uses real game reward path with explicit simulation label and persistent operator toggle',()=>{
 const n=1800000000000,w=createWorld('demo');w.settings.autoEvents=false;w.settings.blessingMinutes=0;w.settings.puppetAutoRose=true;w.nextBossAt=n+1e9;const r=puppetControl(w,{op:'create',name:'Test'},n),p=w.players[r.id];p.puppetRoseAt=n+1;tick(w,n+1);assert.equal(p.giftCoins,1);const e=w.events.find(e=>e.autoRose);assert.ok(e);assert.equal(e.simulated,true);assert.equal(e.gift,'Hoa hồng mô phỏng');assert.equal(e.count,1);assert.ok(p.puppetRoseAt>=n+180001&&p.puppetRoseAt<=n+300001);assert.ok(puppetControl(w,{op:'auto-rose',id:p.id,enabled:false},n+2).ok);tick(w,n+900000);assert.equal(p.giftCoins,1);assert.equal(puppetControl(w,{op:'list'},n+900000).puppets[0].autoRose,false);
});

test('3/11: mặc định KHÔNG tự tặng hoa giả (tránh TikTok coi là tương tác giả)',()=>{
 const n=1800000000000,w=createWorld('demo');w.settings.autoEvents=false;w.settings.blessingMinutes=0;w.nextBossAt=n+1e9;const r=puppetControl(w,{op:'create',name:'Test'},n),p=w.players[r.id];p.puppetRoseAt=n+1;tick(w,n+1);assert.equal(p.giftCoins||0,0);
});
