import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action} from '../engine.mjs';
const N=1800000000000;
test('crafting grants its outfit but retains visitor costumes and explicit default/manual/admin selections',()=>{
 for(const [skin,source]of [['hanlap-avatar',undefined],['vuonglam-avatar','gift'],['shende-avatar','admin'],['azure-patron','manual'],[null,'manual']]){
  const w=createWorld(),p=ensurePlayer(w,'a','A',N);
  Object.assign(p,{realm:8,stones:2000,herbs:100,rewardSkins:skin?[skin]:[],skinChoice:skin,skinChoiceSource:source});
  assert.equal(action(w,{type:'craft',userId:'a',itemId:'celestial-orb'},N+1).ok,true);
  assert.ok(p.artifacts.includes('celestial-orb'));assert.ok(p.rewardSkins.includes('ivory-celestial'));
  assert.equal(p.skinChoice,skin);assert.equal(p.skinChoiceSource,source);
  const restored=JSON.parse(JSON.stringify(w));assert.equal(restored.players.a.skinChoice,skin);
 }
});
test('automatic craft outfit remains available for players who have not chosen a costume',()=>{
 const w=createWorld(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:5,stones:2000,herbs:100});
 assert.equal(action(w,{type:'craft',userId:'a',itemId:'celestial-orb'},N+1).ok,true);
 assert.equal(p.skinChoice,'ivory-celestial');
});
