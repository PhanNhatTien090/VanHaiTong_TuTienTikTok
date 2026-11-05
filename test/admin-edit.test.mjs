import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,adminEditPlayer} from '../engine.mjs';
test('operator can edit one player with validated fields and an audit log',()=>{
  const w=createWorld('live'),p=ensurePlayer(w,'a','Lan',1000);
  const r=adminEditPlayer(w,'a',{name:'Lan Anh',gender:'nu',realm:4,qi:500,stones:99,herbs:7,giftCoins:600,addItems:['jade','breath']},2000,{announce:true});
  assert.equal(r.ok,true);assert.equal(p.name,'Lan Anh');assert.equal(p.gender,'nu');assert.equal(p.realm,4);
  assert.equal(p.qi,500);assert.equal(p.totalQi,500);assert.equal(p.stones,99);assert.equal(p.giftCoins,600);
  assert.ok(p.artifacts.includes('jade'));assert.ok(p.manuals.includes('breath'));
  assert.equal(w.events.at(-1).effect,'breakthrough');assert.match(w.events.at(-1).text,/NGUYÊN ANH/);
  assert.equal(w.adminLog.length,1);
  assert.equal(adminEditPlayer(w,'a',{equipped:'jade'}).ok,true);assert.equal(p.equipped,'jade');
  assert.equal(adminEditPlayer(w,'a',{equipped:'orb'}).ok,false,'cannot equip unowned');
  assert.equal(adminEditPlayer(w,'a',{removeItems:['jade']}).ok,true);assert.equal(p.equipped,null);
  assert.equal(adminEditPlayer(w,'a',{realm:99}).ok,false);assert.equal(adminEditPlayer(w,'a',{stones:-1}).ok,false);
  assert.equal(adminEditPlayer(w,'nobody',{qi:1}).ok,false);
  const n=w.events.length;adminEditPlayer(w,'a',{realm:5});assert.equal(w.events.length,n,'no announce unless asked');
});
test('operator can set, grant and remove a player skin',async()=>{
  const {createWorld,ensurePlayer,adminEditPlayer}=await import('../engine.mjs');
  const w=createWorld('live'),p=ensurePlayer(w,'s','S',1000);
  assert.equal(adminEditPlayer(w,'s',{skinChoice:'crimson-phoenix'}).ok,true);assert.equal(p.skinChoice,'crimson-phoenix');assert.ok(p.rewardSkins.includes('crimson-phoenix'),'granted when missing');
  assert.equal(adminEditPlayer(w,'s',{skinChoice:null}).ok,true);assert.equal(p.skinChoice,null);assert.ok(p.rewardSkins.includes('crimson-phoenix'),'still owned');
  assert.equal(adminEditPlayer(w,'s',{skinChoice:'nope'}).ok,false);
  adminEditPlayer(w,'s',{skinChoice:'vuonglam-avatar'});assert.equal(adminEditPlayer(w,'s',{removeSkins:['vuonglam-avatar']}).ok,true);
  assert.equal(p.skinChoice,null);assert.ok(!p.rewardSkins.includes('vuonglam-avatar'));
});
